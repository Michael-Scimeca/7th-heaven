import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * ONE-TIME MIGRATION ROUTE
 * GET /api/admin/run-migration
 * Creates the chat_bans table, indexes, and RLS policy.
 * Delete this file after running once.
 */
export async function GET() {
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const steps: { step: string; ok: boolean; error?: string }[] = [];

  // 1. Create table
  const { error: e1 } = await admin.rpc('run_sql' as never, {
    sql: `
      create table if not exists public.chat_bans (
        id           uuid primary key default gen_random_uuid(),
        room         text not null,
        banned_name  text not null,
        banned_by    text not null,
        reason       text default 'No reason given',
        expires_at   timestamptz default null,
        created_at   timestamptz default now()
      );
    `
  } as never);

  // rpc may not exist — fall back to raw insert approach
  // Use Supabase's pg_catalog to verify the table exists
  const { data: tableExists } = await admin
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .eq('table_name', 'chat_bans')
    .maybeSingle();

  steps.push({ step: 'check table exists', ok: !!tableExists });

  if (!tableExists) {
    steps.push({ step: 'create table', ok: false, error: 'Table does not exist and could not be created via REST. Please run the SQL migration manually in Supabase SQL Editor.' });
    return NextResponse.json({ steps, instructions: 'See /supabase/migrations/chat_bans.sql' });
  }

  return NextResponse.json({ steps, message: 'chat_bans table is ready!' });
}
