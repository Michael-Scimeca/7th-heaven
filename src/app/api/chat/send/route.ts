import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Simple in-memory rate limiter (in production, use Redis/Upstash)
const rateLimit = new Map<string, { count: number, resetTime: number }>();

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    
    // 1. Rate Limiting (Max 5 messages per 10 seconds per IP)
    const now = Date.now();
    const windowMs = 10 * 1000;
    const limit = 5;
    
    const userLimit = rateLimit.get(ip) || { count: 0, resetTime: now + windowMs };
    if (now > userLimit.resetTime) {
      userLimit.count = 1;
      userLimit.resetTime = now + windowMs;
    } else {
      userLimit.count++;
    }
    
    rateLimit.set(ip, userLimit);
    
    if (userLimit.count > limit) {
      return NextResponse.json({ error: 'Too many messages. Please slow down.' }, { status: 429 });
    }

    const body = await req.json();
    const { room, sender_name, sender_role, sender_avatar, content } = body;

    // 2. Content Validation & Spam Filtering
    if (!content || content.length > 500) {
      return NextResponse.json({ error: 'Message must be between 1 and 500 characters.' }, { status: 400 });
    }
    
    // Basic spam rules (prevent URLs, repeated chars, etc.)
    const spamRegex = /(http|www\.|:\/\/[^\s]+)/i;
    if (spamRegex.test(content)) {
      return NextResponse.json({ error: 'Links are not permitted in chat for security reasons.' }, { status: 403 });
    }
    
    // Clean input
    const cleanContent = content.replace(/[<>{}]/g, '').trim();

    // 3. Insert into Database securely via Admin Client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

    const { error } = await supabaseAdmin.from('chat_messages').insert({
      room,
      sender_name: sender_name.substring(0, 30),
      sender_role: sender_role || 'fan',
      sender_avatar: sender_avatar || '?',
      content: cleanContent
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Chat Insert Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
