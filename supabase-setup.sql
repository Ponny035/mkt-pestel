-- Run this once in your Supabase project's SQL editor (Database > SQL Editor).

create table if not exists public.pestel_notes (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('P','EC','S','T','EN','L')),
  text text not null default '',
  impact smallint not null default 0 check (impact between -5 and 5),
  link text not null default '',
  order_index integer not null default 0,
  author_name text not null default 'Someone',
  author_color text not null default '#888888',
  updated_at timestamptz not null default now()
);

-- This board has no login step, so anyone with the link can read and write it,
-- the same way a public FigJam link works. Row Level Security is on, but the
-- policies below intentionally allow anyone using the public anon key to
-- read/write/delete every row. Don't put sensitive data in this table.
alter table public.pestel_notes enable row level security;

drop policy if exists "public read" on public.pestel_notes;
create policy "public read" on public.pestel_notes
  for select using (true);

drop policy if exists "public insert" on public.pestel_notes;
create policy "public insert" on public.pestel_notes
  for insert with check (true);

drop policy if exists "public update" on public.pestel_notes;
create policy "public update" on public.pestel_notes
  for update using (true);

drop policy if exists "public delete" on public.pestel_notes;
create policy "public delete" on public.pestel_notes
  for delete using (true);

-- Turn on realtime change streaming for this table.
alter publication supabase_realtime add table public.pestel_notes;
