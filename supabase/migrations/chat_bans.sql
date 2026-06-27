-- ─────────────────────────────────────────────────────────
-- chat_bans table
-- Run once in Supabase SQL Editor or via migrations.
-- ─────────────────────────────────────────────────────────

create table if not exists public.chat_bans (
  id           uuid primary key default gen_random_uuid(),
  room         text not null,               -- e.g. 'live_michael'
  banned_name  text not null,               -- matches sender_name in chat_messages
  banned_by    text not null,               -- crew member's username
  reason       text default 'No reason given',
  expires_at   timestamptz default null,    -- null = permanent ban
  created_at   timestamptz default now()
);

-- Unique constraint: one ban record per (room, banned_name)
-- Upsert in the API updates in place rather than duplicating.
create unique index if not exists chat_bans_room_name_idx
  on public.chat_bans (room, banned_name);

-- Index for fast ban lookups during chat send
create index if not exists chat_bans_room_idx
  on public.chat_bans (room);

-- Row-Level Security: anyone can read (ban list is not PII)
-- Only service_role (server-side API) can insert/update/delete
alter table public.chat_bans enable row level security;

create policy "public read" on public.chat_bans
  for select using (true);

-- No RLS insert/update/delete policies — only service_role key
-- used by /api/chat/ban and /api/chat/unban can write.
