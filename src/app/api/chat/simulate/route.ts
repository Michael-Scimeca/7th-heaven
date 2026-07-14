import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

let _admin: ReturnType<typeof createClient> | null = null;
function getAdmin() {
  if (!_admin) {
    _admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );
  }
  return _admin;
}

const FAKE_CHANNELS = ['live_michael', 'live_sammy', 'live_ryan', 'live_tony', 'cruise_dashboard'];

const FAKE_FANS = [
  { name: 'superfan99', avatar: 'S9' },
  { name: 'drummer_kid', avatar: 'DK' },
  { name: 'StaceyB', avatar: 'SB' },
  { name: 'ashley_xo', avatar: 'AX' },
  { name: 'Jake7H', avatar: 'J7' },
  { name: 'MidwestMama', avatar: 'MW' },
  { name: 'nate_bass', avatar: 'NB' },
  { name: 'LaurenLive', avatar: 'LL' },
  { name: 'TommyGuitar', avatar: 'TG' },
  { name: 'rockerdan', avatar: 'RD' },
  { name: 'concert_fanatic', avatar: 'CF' },
  { name: 'melody_finder', avatar: 'MF' },
];

const FAN_MESSAGES = [
  'omg this is insane 🔥🔥', 'LETS GOOOO 7TH HEAVEN', 'best show of the year no cap',
  '🤘🤘🤘 sending love from the back row', 'the drums tonight tho!! WOW',
  'been waiting 3 years for this moment ❤️', 'streaming this to my whole family rn lmao',
  'those guitar riffs hit different live', 'THIS IS MY FAVORITE SONG', 'chills. actual chills.',
  'who else is crying rn 😭', 'TURN IT UP 🔊🔊🔊', 'the energy in here is UNREAL',
  'they never disappoint 🙌', 'Chicago represent!! 🏙️', 'first time seeing them live… speechless',
  'MOM LOOK IM ON THE LIVE STREAM', 'this band is everything', 'PLAY SING NEXT PLEASE 🎵',
  'i cant stop screaming', 'watching from my car in the parking lot lol 😂',
  '7th heaven forever ❤️‍🔥', 'that bass line tho 🎸', 'bruh this setlist is FIRE',
  'i drove 6 hours for this', 'whos got the setlist??', 'PIT IS INSANE RN',
  'they sound even better live wtf', 'ENCORE ENCORE ENCORE', 'losing my voice already',
  'this is what live music is about', 'my 15th 7H show and they keep getting better',
  'the light show tonight 😍', 'GET YOUR PHONES UP 📱', 'im literally floating rn',
  'WAIT IS THAT A NEW SONG??', 'someone catch me im gonna faint', 'LEGEND STATUS 🏆',
  'making memories for life', 'the whole crowd is jumping 🦘', 'VIBE CHECK: 100/100',
  'goosebumps on goosebumps', 'they really are the best band in the midwest',
  'holy harmonies batman', 'whoever is streaming THANK YOU 🙏',
  'FRONT ROW BABY', 'they LITERALLY just winked at me', 'im never washing this hand 😂',
  'this night is everything I needed 🫶', 'THE CROWD IS GOING INSANE',
  'my ears are still ringing but it was SO worth it'
];

// Declare global variable for hot-reload persistence
const g = globalThis as any;

export async function GET() {
  const active = !!g.chatSimulatorInterval;
  return NextResponse.json({ active });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, room = 'cruise_dashboard' } = body;

    if (action === 'start') {
      if (g.chatSimulatorInterval) {
        clearInterval(g.chatSimulatorInterval);
      }

      console.log(`[chat-simulator] Starting simulator for room: ${room}`);

      g.chatSimulatorInterval = setInterval(async () => {
        try {
          const admin = getAdmin();
          
          // 1. Pick a random fan
          const fan = FAKE_FANS[Math.floor(Math.random() * FAKE_FANS.length)];
          const content = FAN_MESSAGES[Math.floor(Math.random() * FAN_MESSAGES.length)];

                  // 2. Check if this fan is banned in chat_bans
          const now = new Date().toISOString();
          const { data: banRow } = await (admin as any)
            .from('chat_bans')
            .select('id')
            .eq('room', room)
            .eq('banned_name', fan.name)
            .or(`expires_at.is.null,expires_at.gt.${now}`)
            .maybeSingle();

          if (banRow) {
            console.log(`[chat-simulator] Blocked message from banned fan: ${fan.name}`);
            return;
          }

          // 3. Check if this fan profile is banned globally
          const { data: profile } = await (admin as any)
            .from('profiles')
            .select('is_banned')
            .eq('username', fan.name)
            .maybeSingle();

          if (profile && (profile as any).is_banned) {
            console.log(`[chat-simulator] Blocked message from globally banned profile: ${fan.name}`);
            return;
          }

          // 4. Insert message
          const { error } = await (admin as any).from('chat_messages').insert({
            room,
            sender_name: fan.name,
            sender_avatar: fan.avatar,
            sender_role: 'fan',
            content,
          });

          if (error) {
            console.error('[chat-simulator] Insert error:', error.message);
          }
        } catch (err: any) {
          console.error('[chat-simulator] Tick error:', err?.message ?? err);
        }
      }, 4000); // Send every 4 seconds

      return NextResponse.json({ active: true });
    }

    if (action === 'stop') {
      if (g.chatSimulatorInterval) {
        console.log('[chat-simulator] Stopping simulator');
        clearInterval(g.chatSimulatorInterval);
        g.chatSimulatorInterval = null;
      }
      return NextResponse.json({ active: false });
    }

    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
  } catch (err: any) {
    console.error('[chat-simulator] POST error:', err?.message ?? err);
    return NextResponse.json({ error: 'Internal Server Error.' }, { status: 500 });
  }
}
