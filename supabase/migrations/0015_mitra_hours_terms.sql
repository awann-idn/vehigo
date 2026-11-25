-- Vehigo: Mitra operational hours and rental terms (0015)
create table if not exists public.mitra_operating_hours (
  id uuid primary key default gen_random_uuid(),
  mitra_id uuid not null references public.profiles(id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  is_open boolean not null default true,
  open_time time not null default '09:00',
  close_time time not null default '21:00',
  unique (mitra_id, day_of_week)
);

create table if not exists public.mitra_terms (
  mitra_id uuid primary key references public.profiles(id) on delete cascade,
  terms jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.mitra_operating_hours enable row level security;
alter table public.mitra_terms enable row level security;

drop policy if exists mitra_hours_select on public.mitra_operating_hours;
create policy mitra_hours_select on public.mitra_operating_hours for select to authenticated using (true);
drop policy if exists mitra_hours_write on public.mitra_operating_hours;
create policy mitra_hours_write on public.mitra_operating_hours for all to authenticated using (mitra_id = auth.uid() or public.is_admin()) with check (mitra_id = auth.uid() or public.is_admin());

drop policy if exists mitra_terms_select on public.mitra_terms;
create policy mitra_terms_select on public.mitra_terms for select to authenticated using (true);
drop policy if exists mitra_terms_write on public.mitra_terms;
create policy mitra_terms_write on public.mitra_terms for all to authenticated using (mitra_id = auth.uid() or public.is_admin()) with check (mitra_id = auth.uid() or public.is_admin());

notify pgrst, 'reload schema';
