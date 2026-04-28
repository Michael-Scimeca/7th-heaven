-- Migration 012: Invite Challenge per Show
-- Allows admin to configure a merch reward for fans who invite N+ people to a show

create table if not exists public.show_invite_challenges (
  id uuid primary key default gen_random_uuid(),
  show_id text not null,  -- references the Sanity show _id
  enabled boolean default false,
  threshold int default 20,
  reward_name text not null default 'Free Merch Item',
  reward_description text default 'Claim at the merch table, night of show',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS
alter table public.show_invite_challenges enable row level security;

-- Admins (service role) can do everything
create policy "service_role_all" on public.show_invite_challenges
  for all using (true) with check (true);

-- Public read (show page fetches the active challenge)
create policy "public_read" on public.show_invite_challenges
  for select using (enabled = true);

-- Track who has invited whom for a show
create table if not exists public.show_invite_referrals (
  id uuid primary key default gen_random_uuid(),
  show_id text not null,
  inviter_id uuid references auth.users(id) on delete cascade,
  invitee_email text,
  invitee_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  unique(show_id, invitee_email)
);

alter table public.show_invite_referrals enable row level security;

create policy "users_read_own" on public.show_invite_referrals
  for select using (auth.uid() = inviter_id);

create policy "service_role_all_referrals" on public.show_invite_referrals
  for all using (true) with check (true);
