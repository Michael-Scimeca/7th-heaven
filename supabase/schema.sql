-- ============================================
-- 7th Heaven — Supabase Database Schema
-- Run this in the Supabase SQL Editor
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── PROFILES ──
-- Auto-created when a user signs up via trigger
create table public.profiles (
 id uuid references auth.users on delete cascade primary key,
 email text not null,
 full_name text not null default '',
 avatar_url text,
 role text not null default 'fan' check (role in ('fan', 'crew', 'admin', 'merch', 'event_planner')),
 can_stream boolean not null default false,
 date_of_birth date,
 phone text,
 zip text,
 notification_radius integer not null default 50,
 notifications_enabled boolean not null default false,
 shows_attended integer not null default 0,
 points integer not null default 0,
 tier text not null default 'Bronze' check (tier in ('Bronze', 'Silver', 'Gold', 'Platinum')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

-- ── SHOWS ──
create table public.shows (
 id uuid primary key default uuid_generate_v4(),
 venue_name text not null,
 venue_address text not null default '',
 city text not null,
 state text not null default 'IL',
 date date not null,
 time text not null default '',
 status text not null default 'upcoming' check (status in ('upcoming', 'live', 'ended')),
 latitude double precision,
 longitude double precision,
 attendance_count integer not null default 0,
 created_at timestamptz not null default now()
);

-- ── SHOW MESSAGES ──
create table public.show_messages (
 id uuid primary key default uuid_generate_v4(),
 show_id uuid not null references public.shows on delete cascade,
 user_id uuid references public.profiles on delete cascade,
 guest_name text,
 message text not null check (char_length(message) <= 500),
 created_at timestamptz not null default now()
);

-- ── SHOW ATTENDANCE ──
create table public.show_attendance (
 id uuid primary key default uuid_generate_v4(),
 show_id uuid not null references public.shows on delete cascade,
 user_id uuid references public.profiles on delete cascade,
 guest_name text,
 status text not null default 'going' check (status in ('going', 'there')),
 checked_in_at timestamptz,
 created_at timestamptz not null default now(),
 unique(show_id, user_id)
);

-- ── INDEXES ──
create index idx_show_messages_show on public.show_messages(show_id);
create index idx_show_messages_user on public.show_messages(user_id);
create index idx_show_attendance_show on public.show_attendance(show_id);
create index idx_show_attendance_user on public.show_attendance(user_id);
create index idx_profiles_role on public.profiles(role);
create index idx_shows_date on public.shows(date);
create index idx_shows_status on public.shows(status);

-- ── AUTO-CREATE PROFILE ON SIGNUP ──
create or replace function public.handle_new_user()
returns trigger as $$
begin
 insert into public.profiles (id, email, full_name, role, date_of_birth, phone, zip)
 values (
  new.id,
  new.email,
  coalesce(new.raw_user_meta_data->>'full_name', ''),
  coalesce(new.raw_user_meta_data->>'role', 'fan'),
  (new.raw_user_meta_data->>'date_of_birth')::date,
  new.raw_user_meta_data->>'phone',
  new.raw_user_meta_data->>'zip'
 )
 on conflict (id) do nothing;
 return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
 after insert on auth.users
 for each row execute procedure public.handle_new_user();

-- ── AUTO-UPDATE updated_at ──
create or replace function public.update_updated_at()
returns trigger as $$
begin
 new.updated_at = now();
 return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
 before update on public.profiles
 for each row execute procedure public.update_updated_at();

-- ══════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ══════════════════════════════════════

alter table public.profiles enable row level security;
alter table public.shows enable row level security;
alter table public.show_messages enable row level security;
alter table public.show_attendance enable row level security;

-- PROFILES: Everyone can read, users can update their own
create policy "Profiles are viewable by everyone"
 on public.profiles for select using (true);

create policy "Users can update own profile"
 on public.profiles for update using (auth.uid() = id);

-- Crew/Admin can update any profile (for granting streaming, etc.)
create policy "Crew and admin can update any profile"
 on public.profiles for update
 using (
  exists (
   select 1 from public.profiles
   where id = auth.uid() and role in ('crew', 'admin')
  )
 );

-- SHOWS: Everyone can read
create policy "Shows are viewable by everyone"
 on public.shows for select using (true);

-- Only admin can create/update/delete shows
create policy "Admin can manage shows"
 on public.shows for all
 using (
  exists (
   select 1 from public.profiles
   where id = auth.uid() and role = 'admin'
  )
 );

-- SHOW MESSAGES: Everyone can read, authenticated users can post
create policy "Messages are viewable by everyone"
 on public.show_messages for select using (true);

create policy "Authenticated users can post messages"
 on public.show_messages for insert
 with check (auth.uid() = user_id);

-- Crew/Admin can delete any message (moderation)
create policy "Crew and admin can delete messages"
 on public.show_messages for delete
 using (
  auth.uid() = user_id
  or exists (
   select 1 from public.profiles
   where id = auth.uid() and role in ('crew', 'admin')
  )
 );

-- SHOW ATTENDANCE: Everyone can read, authenticated users can manage own
create policy "Attendance is viewable by everyone"
 on public.show_attendance for select using (true);

create policy "Users can manage own attendance"
 on public.show_attendance for insert
 with check (auth.uid() = user_id);

create policy "Users can update own attendance"
 on public.show_attendance for update
 using (auth.uid() = user_id);

-- ── ENABLE REALTIME ──
alter publication supabase_realtime add table public.show_messages;
alter publication supabase_realtime add table public.show_attendance;

-- ══════════════════════════════════════
-- LIVE FEED (Crew + Approved Fans)
-- ══════════════════════════════════════

-- ── LIVE FEED POSTS ──
create table public.live_feed (
 id uuid primary key default uuid_generate_v4(),
 room_id text not null default '7h-live-show',
 user_id uuid references public.profiles on delete cascade,
 guest_name text,
 show_id uuid references public.shows on delete set null,
 post_type text not null default 'update' check (post_type in ('update', 'setlist', 'photo', 'video', 'fan_moment', 'announcement')),
 content text not null check (char_length(content) <= 1000),
 media_url text,
 media_type text check (media_type in ('image', 'video', null)),
 is_pinned boolean not null default false,
 likes_count integer not null default 0,
 created_at timestamptz not null default now()
);

-- ── FEED REACTIONS ──
create table public.feed_reactions (
 id uuid primary key default uuid_generate_v4(),
 post_id uuid not null references public.live_feed on delete cascade,
 user_id uuid references public.profiles on delete cascade,
 guest_name text,
 reaction text not null default '🔥' check (reaction in ('🔥', '🎸', '❤️', '🤘', '👏')),
 created_at timestamptz not null default now(),
 unique(post_id, user_id)
);

-- ── LIVE STREAMS ──
create table public.live_streams (
 id uuid primary key default uuid_generate_v4(),
 user_id uuid references public.profiles on delete cascade,
 guest_name text,
 show_id uuid references public.shows on delete set null,
 title text not null default '',
 stream_url text,
 thumbnail_url text,
 status text not null default 'pending' check (status in ('pending', 'live', 'ended')),
 viewer_count integer not null default 0,
 started_at timestamptz,
 ended_at timestamptz,
 created_at timestamptz not null default now()
);

-- ── INDEXES ──
create index idx_live_feed_show on public.live_feed(show_id);
create index idx_live_feed_user on public.live_feed(user_id);
create index idx_live_feed_created on public.live_feed(created_at desc);
create index idx_feed_reactions_post on public.feed_reactions(post_id);
create index idx_live_streams_status on public.live_streams(status);
create index idx_live_streams_show on public.live_streams(show_id);

-- ── RLS ──
alter table public.live_feed enable row level security;
alter table public.feed_reactions enable row level security;
alter table public.live_streams enable row level security;

-- LIVE FEED: Everyone can read
create policy "Live feed is viewable by everyone"
 on public.live_feed for select using (true);

-- Crew and admin can always post
create policy "Crew and admin can post to feed"
 on public.live_feed for insert
 with check (
  exists (
   select 1 from public.profiles
   where id = auth.uid() and role in ('crew', 'admin')
  )
 );

-- Fans with can_stream can post (approved fans)
create policy "Approved fans can post to feed"
 on public.live_feed for insert
 with check (
  exists (
   select 1 from public.profiles
   where id = auth.uid() and role = 'fan' and can_stream = true
  )
 );

-- Users can delete own posts, crew/admin can delete any
create policy "Users can delete own feed posts"
 on public.live_feed for delete
 using (
  auth.uid() = user_id
  or exists (
   select 1 from public.profiles
   where id = auth.uid() and role in ('crew', 'admin')
  )
 );

-- Admin can pin/update any post
create policy "Admin can update feed posts"
 on public.live_feed for update
 using (
  exists (
   select 1 from public.profiles
   where id = auth.uid() and role = 'admin'
  )
 );

-- REACTIONS: Everyone can read, authenticated can react
create policy "Reactions are viewable by everyone"
 on public.feed_reactions for select using (true);

create policy "Authenticated users can react"
 on public.feed_reactions for insert
 with check (auth.uid() = user_id);

create policy "Users can remove own reactions"
 on public.feed_reactions for delete
 using (auth.uid() = user_id);

-- LIVE STREAMS: Everyone can read
create policy "Streams are viewable by everyone"
 on public.live_streams for select using (true);

-- Crew/admin can always stream
create policy "Crew and admin can stream"
 on public.live_streams for insert
 with check (
  exists (
   select 1 from public.profiles
   where id = auth.uid() and role in ('crew', 'admin')
  )
 );

-- Approved fans can stream
create policy "Approved fans can stream"
 on public.live_streams for insert
 with check (
  exists (
   select 1 from public.profiles
   where id = auth.uid() and can_stream = true
  )
 );

-- Streamer can update own stream (start/stop)
create policy "Streamers can update own stream"
 on public.live_streams for update
 using (auth.uid() = user_id);

-- Admin can manage all streams
create policy "Admin can manage all streams"
 on public.live_streams for all
 using (
  exists (
   select 1 from public.profiles
   where id = auth.uid() and role = 'admin'
  )
 );

-- ── ENABLE REALTIME FOR LIVE FEATURES ──
alter publication supabase_realtime add table public.live_feed;
alter publication supabase_realtime add table public.live_streams;
alter publication supabase_realtime add table public.feed_reactions;

-- Unauthenticated users (Guests) can post to feed
create policy "Guests can post to feed" on public.live_feed for insert with check (auth.uid() is null);
