-- FIREBITE minimum Supabase schema
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  phone text,
  items jsonb not null default '[]'::jsonb,
  total numeric(10,2) not null default 0,
  status text not null default 'pending' check (status in ('pending','confirmed','preparing','ready','completed','cancelled')),
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;

create policy "users can create own orders"
on public.orders for insert
with check (auth.uid() = user_id);

create policy "users can view own orders"
on public.orders for select
using (auth.uid() = user_id);
