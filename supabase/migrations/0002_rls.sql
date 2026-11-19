-- Vehigo RLS policies + storage (0002)
-- Jalankan setelah 0001_init.sql.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

alter table public.profiles enable row level security;
alter table public.mitra_profiles enable row level security;
alter table public.mitra_payout_accounts enable row level security;
alter table public.vehicles enable row level security;
alter table public.vehicle_availability enable row level security;
alter table public.orders enable row level security;
alter table public.order_status_history enable row level security;
alter table public.payments enable row level security;
alter table public.inspections enable row level security;
alter table public.reviews enable row level security;
alter table public.chats enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.documents enable row level security;
alter table public.payouts enable row level security;

-- profiles
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- mitra_profiles (data publik untuk browsing)
drop policy if exists mitra_profiles_select on public.mitra_profiles;
create policy mitra_profiles_select on public.mitra_profiles
  for select to authenticated using (true);

drop policy if exists mitra_profiles_insert on public.mitra_profiles;
create policy mitra_profiles_insert on public.mitra_profiles
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists mitra_profiles_update on public.mitra_profiles;
create policy mitra_profiles_update on public.mitra_profiles
  for update to authenticated
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

-- mitra payout accounts (privat)
drop policy if exists payout_accounts_select on public.mitra_payout_accounts;
create policy payout_accounts_select on public.mitra_payout_accounts
  for select to authenticated
  using (mitra_id = auth.uid() or public.is_admin());

drop policy if exists payout_accounts_write on public.mitra_payout_accounts;
create policy payout_accounts_write on public.mitra_payout_accounts
  for all to authenticated
  using (mitra_id = auth.uid() or public.is_admin())
  with check (mitra_id = auth.uid() or public.is_admin());

-- vehicles
drop policy if exists vehicles_select on public.vehicles;
create policy vehicles_select on public.vehicles
  for select to authenticated using (true);

drop policy if exists vehicles_insert on public.vehicles;
create policy vehicles_insert on public.vehicles
  for insert to authenticated with check (mitra_id = auth.uid());

drop policy if exists vehicles_update on public.vehicles;
create policy vehicles_update on public.vehicles
  for update to authenticated
  using (mitra_id = auth.uid() or public.is_admin())
  with check (mitra_id = auth.uid() or public.is_admin());

drop policy if exists vehicles_delete on public.vehicles;
create policy vehicles_delete on public.vehicles
  for delete to authenticated
  using (mitra_id = auth.uid() or public.is_admin());

-- vehicle_availability
drop policy if exists availability_select on public.vehicle_availability;
create policy availability_select on public.vehicle_availability
  for select to authenticated using (true);

drop policy if exists availability_write on public.vehicle_availability;
create policy availability_write on public.vehicle_availability
  for all to authenticated
  using (exists (
    select 1 from public.vehicles v
    where v.id = vehicle_id and (v.mitra_id = auth.uid() or public.is_admin())
  ))
  with check (exists (
    select 1 from public.vehicles v
    where v.id = vehicle_id and (v.mitra_id = auth.uid() or public.is_admin())
  ));

-- orders
drop policy if exists orders_select on public.orders;
create policy orders_select on public.orders
  for select to authenticated
  using (renter_id = auth.uid() or mitra_id = auth.uid() or public.is_admin());

drop policy if exists orders_insert on public.orders;
create policy orders_insert on public.orders
  for insert to authenticated
  with check (renter_id = auth.uid());

drop policy if exists orders_update on public.orders;
create policy orders_update on public.orders
  for update to authenticated
  using (renter_id = auth.uid() or mitra_id = auth.uid() or public.is_admin())
  with check (renter_id = auth.uid() or mitra_id = auth.uid() or public.is_admin());

drop policy if exists order_history_select on public.order_status_history;
create policy order_history_select on public.order_status_history
  for select to authenticated
  using (exists (
    select 1 from public.orders o
    where o.id = order_id
      and (o.renter_id = auth.uid() or o.mitra_id = auth.uid() or public.is_admin())
  ));

-- payments (tulis hanya via server / service role)
drop policy if exists payments_select on public.payments;
create policy payments_select on public.payments
  for select to authenticated
  using (exists (
    select 1 from public.orders o
    where o.id = order_id
      and (o.renter_id = auth.uid() or o.mitra_id = auth.uid() or public.is_admin())
  ));

-- inspections
drop policy if exists inspections_select on public.inspections;
create policy inspections_select on public.inspections
  for select to authenticated
  using (exists (
    select 1 from public.orders o
    where o.id = order_id
      and (o.renter_id = auth.uid() or o.mitra_id = auth.uid() or public.is_admin())
  ));

drop policy if exists inspections_write on public.inspections;
create policy inspections_write on public.inspections
  for all to authenticated
  using (exists (
    select 1 from public.orders o
    where o.id = order_id
      and (o.renter_id = auth.uid() or o.mitra_id = auth.uid() or public.is_admin())
  ))
  with check (exists (
    select 1 from public.orders o
    where o.id = order_id
      and (o.renter_id = auth.uid() or o.mitra_id = auth.uid() or public.is_admin())
  ));

-- reviews
drop policy if exists reviews_select on public.reviews;
create policy reviews_select on public.reviews
  for select to authenticated using (true);

drop policy if exists reviews_insert on public.reviews;
create policy reviews_insert on public.reviews
  for insert to authenticated
  with check (
    author_id = auth.uid()
    and exists (
      select 1 from public.orders o
      where o.id = order_id and o.renter_id = auth.uid()
    )
  );

-- chats
drop policy if exists chats_select on public.chats;
create policy chats_select on public.chats
  for select to authenticated
  using (renter_id = auth.uid() or mitra_id = auth.uid() or public.is_admin());

drop policy if exists chats_insert on public.chats;
create policy chats_insert on public.chats
  for insert to authenticated
  with check (renter_id = auth.uid() or mitra_id = auth.uid());

-- messages
drop policy if exists messages_select on public.messages;
create policy messages_select on public.messages
  for select to authenticated
  using (exists (
    select 1 from public.chats c
    where c.id = chat_id
      and (c.renter_id = auth.uid() or c.mitra_id = auth.uid() or public.is_admin())
  ));

drop policy if exists messages_insert on public.messages;
create policy messages_insert on public.messages
  for insert to authenticated
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.chats c
      where c.id = chat_id and (c.renter_id = auth.uid() or c.mitra_id = auth.uid())
    )
  );

drop policy if exists messages_update on public.messages;
create policy messages_update on public.messages
  for update to authenticated
  using (exists (
    select 1 from public.chats c
    where c.id = chat_id and (c.renter_id = auth.uid() or c.mitra_id = auth.uid())
  ))
  with check (exists (
    select 1 from public.chats c
    where c.id = chat_id and (c.renter_id = auth.uid() or c.mitra_id = auth.uid())
  ) and sender_id = auth.uid());

-- notifications
drop policy if exists notifications_select on public.notifications;
create policy notifications_select on public.notifications
  for select to authenticated using (user_id = auth.uid() or public.is_admin());

drop policy if exists notifications_update on public.notifications;
create policy notifications_update on public.notifications
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- documents
drop policy if exists documents_select on public.documents;
create policy documents_select on public.documents
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists documents_insert on public.documents;
create policy documents_insert on public.documents
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists documents_update on public.documents;
create policy documents_update on public.documents
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- payouts
drop policy if exists payouts_select on public.payouts;
create policy payouts_select on public.payouts
  for select to authenticated using (mitra_id = auth.uid() or public.is_admin());

-- Storage buckets (privat)
insert into storage.buckets (id, name, public)
values
  ('ktp', 'ktp', false),
  ('sim', 'sim', false),
  ('vehicle-photos', 'vehicle-photos', false),
  ('payment-proofs', 'payment-proofs', false)
on conflict (id) do nothing;

drop policy if exists storage_owner_read on storage.objects;
create policy storage_owner_read on storage.objects
  for select to authenticated
  using (
    bucket_id in ('ktp', 'sim', 'vehicle-photos', 'payment-proofs')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists storage_owner_write on storage.objects;
create policy storage_owner_write on storage.objects
  for insert to authenticated
  with check (
    bucket_id in ('ktp', 'sim', 'vehicle-photos', 'payment-proofs')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists storage_owner_delete on storage.objects;
create policy storage_owner_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id in ('ktp', 'sim', 'vehicle-photos', 'payment-proofs')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists storage_vehicle_photos_read on storage.objects;
create policy storage_vehicle_photos_read on storage.objects
  for select to authenticated
  using (bucket_id = 'vehicle-photos');
