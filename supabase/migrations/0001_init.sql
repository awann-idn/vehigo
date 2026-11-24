-- Vehigo initial schema (0001)
-- Run in Supabase SQL Editor (DDL tidak bisa lewat PostgREST key).

create extension if not exists pgcrypto;

do $$ begin
  create type public.user_role as enum ('penyewa', 'mitra', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.account_status as enum ('active', 'pending', 'suspended');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.vehicle_status as enum ('tersedia', 'disewa', 'maintenance');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.order_status as enum (
    'belum_bayar', 'berlangsung', 'selesai', 'denda', 'dibatalkan', 'draft_whatsapp'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_status as enum ('pending', 'paid', 'failed', 'refunded');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.doc_status as enum ('pending', 'verified', 'rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.doc_type as enum ('ktp', 'sim', 'nib', 'npwp');
exception when duplicate_object then null; end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  phone text,
  avatar_url text,
  role public.user_role not null default 'penyewa',
  status public.account_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.mitra_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  business_name text not null,
  address text,
  latitude double precision,
  longitude double precision,
  verification public.doc_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.mitra_payout_accounts (
  id uuid primary key default gen_random_uuid(),
  mitra_id uuid not null references public.profiles (id) on delete cascade,
  method text not null check (method in ('bank', 'ewallet')),
  bank_name text,
  account_number text,
  account_holder text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  mitra_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  brand text,
  year integer,
  plate text not null unique,
  transmission text not null default 'Matic',
  seats integer not null default 5,
  price_per_day numeric(12, 2) not null check (price_per_day > 0),
  status public.vehicle_status not null default 'tersedia',
  location text,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vehicle_availability (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles (id) on delete cascade,
  date date not null,
  is_blocked boolean not null default true,
  unique (vehicle_id, date)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  code text not null unique default ('PKP-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 10)),
  renter_id uuid not null references public.profiles (id),
  mitra_id uuid not null references public.profiles (id),
  vehicle_id uuid not null references public.vehicles (id),
  start_date date not null,
  end_date date not null,
  days integer not null check (days > 0),
  daily_price numeric(12, 2) not null,
  subtotal numeric(12, 2) not null,
  deposit numeric(12, 2) not null default 0,
  total numeric(12, 2) not null,
  status public.order_status not null default 'belum_bayar',
  payment_method text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date >= start_date)
);

create table if not exists public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  status public.order_status not null,
  actor_id uuid references public.profiles (id),
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  provider text not null default 'midtrans',
  method text,
  amount numeric(12, 2) not null,
  status public.payment_status not null default 'pending',
  external_id text unique,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.inspections (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  photos jsonb not null default '[]'::jsonb,
  findings jsonb not null default '[]'::jsonb,
  damage_fee numeric(12, 2) not null default 0,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders (id) on delete cascade,
  author_id uuid not null references public.profiles (id),
  target_type text not null check (target_type in ('vehicle', 'mitra')),
  target_id uuid not null,
  rating integer not null check (rating between 1 and 5),
  body text,
  created_at timestamptz not null default now()
);

create table if not exists public.chats (
  id uuid primary key default gen_random_uuid(),
  order_id uuid unique references public.orders (id) on delete set null,
  renter_id uuid not null references public.profiles (id),
  mitra_id uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chats (id) on delete cascade,
  sender_id uuid not null references public.profiles (id),
  body text not null,
  kind text not null default 'text' check (kind in ('text', 'emergency')),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  body text not null,
  type text not null default 'info',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind public.doc_type not null,
  storage_path text not null,
  status public.doc_status not null default 'pending',
  reviewed_by uuid references public.profiles (id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.payouts (
  id uuid primary key default gen_random_uuid(),
  mitra_id uuid not null references public.profiles (id) on delete cascade,
  order_id uuid references public.orders (id) on delete set null,
  amount numeric(12, 2) not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create index if not exists vehicles_mitra_idx on public.vehicles (mitra_id);
create index if not exists vehicles_status_idx on public.vehicles (status);
create index if not exists orders_renter_idx on public.orders (renter_id);
create index if not exists orders_mitra_idx on public.orders (mitra_id);
create index if not exists orders_status_idx on public.orders (status);
create index if not exists messages_chat_idx on public.messages (chat_id, created_at);
create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);
create index if not exists documents_user_idx on public.documents (user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles', 'mitra_profiles', 'mitra_payout_accounts', 'vehicles', 'orders'
  ] loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format(
      'create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()',
      t
    );
  end loop;
end $$;
