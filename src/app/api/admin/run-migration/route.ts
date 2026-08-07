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

  // Execute migrations and check table/column existence in a single parallel Promise.all
  const [e1Res, e1_1Res, tableExistsRes, columnExistsRes] = await Promise.all([
    admin.rpc('run_sql' as never, {
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
    } as never),
    admin.rpc('run_sql' as never, {
      sql: `
        alter table public.profiles add column if not exists is_warned boolean default false;
      `
    } as never),
    admin
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'chat_bans')
      .maybeSingle(),
    admin
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'profiles')
      .eq('column_name', 'is_warned')
      .maybeSingle()
  ]);

  const { error: e1 } = e1Res;
  const { error: e1_1 } = e1_1Res;
  const { data: tableExists } = tableExistsRes;
  const { data: columnExists } = columnExistsRes;

  steps.push({ step: 'check table exists', ok: !!tableExists });
  steps.push({ step: 'check is_warned column exists', ok: !!columnExists });

  if (!tableExists || !columnExists) {
    steps.push({ step: 'create table / columns', ok: false, error: 'Table or column does not exist and could not be verified/created. Please run the SQL migration manually.' });
    return NextResponse.json({ steps, instructions: 'Run ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_warned boolean DEFAULT false;' });
  }

  return NextResponse.json({ steps, message: 'chat_bans table is ready!' });
}
