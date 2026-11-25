-- Vehigo: vehicle gallery metadata (0016)
create table if not exists public.vehicle_photos (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  angle text not null,
  storage_path text not null,
  created_at timestamptz not null default now(),
  unique (vehicle_id, angle)
);

alter table public.vehicle_photos enable row level security;
drop policy if exists vehicle_photos_select on public.vehicle_photos;
create policy vehicle_photos_select on public.vehicle_photos for select to authenticated using (true);
drop policy if exists vehicle_photos_write on public.vehicle_photos;
create policy vehicle_photos_write on public.vehicle_photos for all to authenticated using (owner_id = auth.uid() or public.is_admin()) with check (owner_id = auth.uid() or public.is_admin());
notify pgrst, 'reload schema';
