create table if not exists public.todos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  details text default '',
  importance int not null default 50 check (importance between 0 and 100),
  urgency int not null default 50 check (urgency between 0 and 100),
  done boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.todos enable row level security;

drop policy if exists "Allow public todo access" on public.todos;

create policy "Allow public todo access"
on public.todos
for all
to anon, authenticated
using (true)
with check (true);

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.todos to anon, authenticated;
