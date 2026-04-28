-- Migration 013: Post-Show Memories
-- Fans who attended a show can submit a photo + memory text after the show date passes

create table if not exists public.show_memories (
  id uuid primary key default gen_random_uuid(),
  show_id text not null,           -- Sanity show _id
  user_id uuid references auth.users(id) on delete cascade,
  display_name text,
  photo_url text,
  memory_text text check (char_length(memory_text) <= 280),
  approved boolean default true,   -- admin can hide if needed
  created_at timestamptz default now()
);

alter table public.show_memories enable row level security;

-- Anyone can read approved memories (fan photo wall)
create policy "public_read_approved" on public.show_memories
  for select using (approved = true);

-- Authenticated fans can insert their own
create policy "auth_insert_own" on public.show_memories
  for insert with check (auth.uid() = user_id);

-- Users can update/delete their own
create policy "auth_update_own" on public.show_memories
  for update using (auth.uid() = user_id);

create policy "auth_delete_own" on public.show_memories
  for delete using (auth.uid() = user_id);

-- Service role (admin) full access
create policy "service_role_all" on public.show_memories
  for all using (true) with check (true);
