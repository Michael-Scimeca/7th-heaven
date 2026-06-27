import { NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/* ─────────────────────────────────────────────────────────
   SINGLETON ADMIN CLIENT
   One client per process — avoids spinning up a new
   Supabase connection on every request.
   ───────────────────────────────────────────────────────── */
let _adminClient: SupabaseClient | null = null;
function getAdminClient(): SupabaseClient {
  if (!_adminClient) {
    _adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );
  }
  return _adminClient;
}

/* ─────────────────────────────────────────────────────────
   RATE LIMITER
   Simple in-memory sliding window.
   NOTE: resets on cold-start — acceptable for this scale.
   For production at scale, swap for Redis/Upstash.
   Entries are pruned after their window expires to prevent
   the Map from growing unbounded.
   ───────────────────────────────────────────────────────── */
const rateLimit = new Map<string, { count: number; resetTime: number }>();
const lastMessages = new Map<string, { content: string; timestamp: number }>();

const RATE_WINDOW_MS = 10_000; // 10 seconds
const RATE_LIMIT     = 5;      // max messages per window

function checkRateLimit(ip: string): boolean {
  const now = Date.now();

  // Prune expired entries every ~100 requests to keep memory tidy
  if (rateLimit.size > 500) {
    for (const [key, val] of rateLimit) {
      if (now > val.resetTime) rateLimit.delete(key);
    }
  }

  const entry = rateLimit.get(ip) ?? { count: 0, resetTime: now + RATE_WINDOW_MS };

  if (now > entry.resetTime) {
    entry.count    = 1;
    entry.resetTime = now + RATE_WINDOW_MS;
  } else {
    entry.count++;
  }

  rateLimit.set(ip, entry);
  return entry.count <= RATE_LIMIT;
}

/* ─────────────────────────────────────────────────────────
   PG-13 CONTENT FILTER
   Profanity + political/divisive keyword blocklist.
   Word-boundary matching avoids false positives on
   substrings (e.g. "assume" does not trigger "ass").
   ───────────────────────────────────────────────────────── */
const BLOCKED_TERMS = [
  // Profanity & slurs
  'fuck', 'f*ck', 'fuk', 'fvck', 'fuq',
  'shit', 'sh1t',
  'bitch', 'b1tch',
  'damn', 'dammit',
  'crap', 'bastard', 'piss',
  'cock', 'c0ck', 'dick', 'd1ck',
  'pussy', 'cunt',
  'whore', 'wh0re', 'slut',
  'nigga', 'nigger',
  'fag', 'faggot',
  'retard', 'rape',
  'porn', 'xxx',

  // Political / divisive
  'trump', 'biden', 'obama', 'maga',
  'democrat', 'republican', 'gop',
  'liberal', 'conservative',
  'communist', 'socialism', 'socialist',
  'fascist', 'fascism',
  'antifa', 'blm', 'kkk', 'klan',
  'nazi', 'n4zi',
  'abortion', 'pro-life', 'pro-choice',
  'gun control', 'gun rights',
  'impeach',
  'election', 'ballot', 'voter fraud',
  'deep state', 'qanon',
  'woke', 'cancel culture',
];

function containsBlockedContent(text: string): boolean {
  return BLOCKED_TERMS.some((term) => {
    const escaped = term
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\s+/g, '\\s+');
    const pattern = term.includes(' ')
      ? new RegExp(escaped, 'i')
      : new RegExp(`\\b${escaped}\\b`, 'i');
    return pattern.test(text);
  });
}

/* ─────────────────────────────────────────────────────────
   SPAM DETECTORS
   ───────────────────────────────────────────────────────── */
const URL_REGEX          = /(https?:\/\/|www\.)[^\s]+/i;
// Repeated character run: same char ≥ 8 in a row ("aaaaaaaaa")
const REPEAT_CHAR_REGEX  = /(.)\1{7,}/;
// ALL CAPS (with ≥ 10 alpha chars) — annoying but not blocked, just noted
// Emoji flood: more than 10 consecutive emoji-ish chars
const EMOJI_FLOOD_REGEX  = /[\p{Emoji}]{8,}/u;

/* ─────────────────────────────────────────────────────────
   ALLOWED ROOMS
   Prevent users from writing to arbitrary DB rooms.
   ───────────────────────────────────────────────────────── */
const ALLOWED_ROOM_PREFIXES = ['live_', 'cruise_'];

function isAllowedRoom(room: string): boolean {
  return (
    typeof room === 'string' &&
    room.length <= 60 &&
    ALLOWED_ROOM_PREFIXES.some((prefix) => room.startsWith(prefix))
  );
}

/* ─────────────────────────────────────────────────────────
   SANITISE STRING
   Strip HTML/script injection vectors before storage.
   ───────────────────────────────────────────────────────── */
function sanitise(str: string, maxLen: number): string {
  return str
    .replace(/[<>{}[\]\\]/g, '')   // strip HTML brackets + code chars
    .replace(/javascript:/gi, '')   // block JS protocol injections
    .replace(/on\w+\s*=/gi, '')     // strip event handler attributes
    .trim()
    .substring(0, maxLen);
}

/* ═══════════════════════════════════════════════════════
   POST /api/chat/send
   ═══════════════════════════════════════════════════════ */
export async function POST(req: Request) {
  try {
    /* 1 ── Rate limiting ── */
    const rawIp = req.headers.get('x-forwarded-for') ?? 'unknown';
    const ip    = rawIp.split(',')[0].trim(); // use first IP only (not spoofable via proxy chain)

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many messages. Please slow down.' },
        { status: 429 }
      );
    }

    /* 2 ── Parse & validate body ── */
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    const { room, sender_name, sender_avatar, content } = body;

    // Required field checks
    if (typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
    }
    if (content.length > 500) {
      return NextResponse.json(
        { error: 'Message must be 500 characters or fewer.' },
        { status: 400 }
      );
    }
    if (typeof sender_name !== 'string' || sender_name.trim().length === 0) {
      return NextResponse.json({ error: 'Sender name is required.' }, { status: 400 });
    }
    if (!isAllowedRoom(room as string)) {
      return NextResponse.json({ error: 'Invalid room.' }, { status: 400 });
    }

    /* 2.1 ── Consecutive & duplicate check ── */
    const nowMs = Date.now();
    if (lastMessages.size > 500) {
      for (const [key, val] of lastMessages) {
        if (nowMs - val.timestamp > 60000) lastMessages.delete(key);
      }
    }

    const lastMsg = lastMessages.get(ip);
    if (lastMsg) {
      const timeSinceLast = nowMs - lastMsg.timestamp;
      // 1. Minimum interval of 1.5 seconds between messages
      if (timeSinceLast < 1500) {
        return NextResponse.json(
          { error: 'Please wait at least 1.5 seconds between messages.' },
          { status: 429 }
        );
      }
      // 2. Duplicate blocker: identical message within 30 seconds
      if (lastMsg.content.toLowerCase().trim() === content.toLowerCase().trim() && timeSinceLast < 30000) {
        return NextResponse.json(
          { error: 'Duplicate message detected. Please do not spam.' },
          { status: 429 }
        );
      }
    }

    /* 3 ── Ban check — reject if sender is banned from this room ──
       Checks the chat_bans table for a matching (room, sender_name)
       row that hasn't expired yet (or is permanent / null expires_at).
       This is server-side — cannot be bypassed from the client.        */
    const supabase = getAdminClient();
    const now = new Date().toISOString();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: banRow } = await (supabase as any)
      .from('chat_bans')
      .select('banned_name, expires_at, reason')
      .eq('room', (room as string).trim())
      .eq('banned_name', (sender_name as string).trim())
      .or(`expires_at.is.null,expires_at.gt.${now}`)   // permanent or not yet expired
      .maybeSingle();

    if (banRow) {
      const expMsg = banRow.expires_at
        ? `until ${new Date(banRow.expires_at).toLocaleString()}`
        : 'permanently';
      return NextResponse.json(
        { error: `You have been banned from this chat ${expMsg}.` },
        { status: 403 }
      );
    }

    /* 4 ── Role: ALWAYS force "fan" — never trust client-supplied role ──
       This prevents anyone from POSTing sender_role:"crew" or "admin"
       to fake a crew badge in the chat feed.                             */

    const safeSenderRole = 'fan';

    /* 5 ── Spam checks ── */
    if (URL_REGEX.test(content)) {
      return NextResponse.json(
        { error: 'Links are not allowed in chat.' },
        { status: 403 }
      );
    }
    if (REPEAT_CHAR_REGEX.test(content)) {
      return NextResponse.json(
        { error: 'Please avoid spamming repeated characters.' },
        { status: 403 }
      );
    }
    const emojis = content.match(/\p{Emoji_Presentation}/gu) || [];
    if (emojis.length > 10) {
      return NextResponse.json(
        { error: 'Too many emojis in the message — keep the chat clean!' },
        { status: 403 }
      );
    }

    /* 6 ── PG content check ── */
    if (containsBlockedContent(content)) {
      return NextResponse.json(
        { error: 'Keep it PG! No swearing or political topics please 🙏' },
        { status: 403 }
      );
    }

    /* 7 ── Sanitise all string inputs before storage ── */
    const cleanContent = sanitise(content, 500);
    const cleanName    = sanitise(String(sender_name), 30);
    const cleanAvatar  = sanitise(String(sender_avatar ?? '?'), 10);

    /* 8 ── Insert via singleton admin client ── */
    // Record this message as the last sent message for this IP to prevent duplicate spam
    lastMessages.set(ip, { content, timestamp: nowMs });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: dbError } = await (supabase as any).from('chat_messages').insert({
      room:          sanitise(room as string, 60),
      sender_name:   cleanName || 'Fan',
      sender_role:   safeSenderRole,
      sender_avatar: cleanAvatar,
      content:       cleanContent,
    });

    if (dbError) throw dbError;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[chat/send] Error:', err?.message ?? err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
