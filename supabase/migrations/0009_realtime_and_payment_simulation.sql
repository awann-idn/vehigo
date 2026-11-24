-- Vehigo: realtime, payment simulation, and chat reliability (0009)
-- Jalankan setelah 0008.

-- Status simulasi pembayaran sebelum mitra mengonfirmasi.
alter type public.order_status add value if not exists 'menunggu_konfirmasi';

-- Nomor telepon dibutuhkan lawan chat untuk panggilan darurat.
create or replace view public.profile_directory as
select id, full_name, avatar_url, phone
from public.profiles;

revoke all on public.profile_directory from public;
revoke all on public.profile_directory from anon;
grant select on public.profile_directory to authenticated;

-- Client boleh mencatat pembayaran untuk pesanannya sendiri (simulasi).
drop policy if exists payments_insert on public.payments;
create policy payments_insert on public.payments
  for insert to authenticated
  with check (exists (
    select 1 from public.orders o
    where o.id = order_id and o.renter_id = auth.uid()
  ));

drop policy if exists payments_update on public.payments;
create policy payments_update on public.payments
  for update to authenticated
  using (exists (
    select 1 from public.orders o
    where o.id = order_id and (o.renter_id = auth.uid() or o.mitra_id = auth.uid())
  ))
  with check (exists (
    select 1 from public.orders o
    where o.id = order_id and (o.renter_id = auth.uid() or o.mitra_id = auth.uid())
  ));

-- Aturan transisi: penyewa menandai sudah bayar, mitra mengonfirmasi.
create or replace function public.transition_order_status(
  p_order_id uuid,
  p_status public.order_status
)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  current_order public.orders;
  allowed boolean := false;
begin
  select * into current_order
  from public.orders
  where id = p_order_id
  for update;

  if current_order.id is null then
    raise exception 'Order tidak ditemukan';
  end if;

  if public.is_admin() then
    allowed := true;
  elsif current_order.renter_id = auth.uid() then
    allowed := current_order.status = 'belum_bayar'
      and p_status in ('menunggu_konfirmasi', 'dibatalkan');
  elsif current_order.mitra_id = auth.uid() then
    allowed :=
      (current_order.status in ('belum_bayar', 'menunggu_konfirmasi') and p_status = 'berlangsung') or
      (current_order.status = 'berlangsung' and p_status in ('selesai', 'denda')) or
      (current_order.status = 'denda' and p_status = 'selesai') or
      (p_status = 'dibatalkan' and current_order.status in ('belum_bayar', 'menunggu_konfirmasi', 'berlangsung'));
  end if;

  if not allowed then
    raise exception 'Transisi status order tidak diizinkan';
  end if;

  update public.orders
  set status = p_status, updated_at = now()
  where id = p_order_id
  returning * into current_order;

  insert into public.order_status_history (order_id, status, actor_id)
  values (p_order_id, p_status, auth.uid());

  return current_order;
end;
$$;

revoke all on function public.transition_order_status(uuid, public.order_status) from public;
revoke all on function public.transition_order_status(uuid, public.order_status) from anon;
grant execute on function public.transition_order_status(uuid, public.order_status) to authenticated;

-- Realtime butuh replica identity penuh agar filter kolom non-PK bekerja.
alter table public.messages replica identity full;
alter table public.notifications replica identity full;
alter table public.vehicles replica identity full;
alter table public.orders replica identity full;

do $$
declare
  t text;
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    foreach t in array array['messages', 'notifications', 'vehicles', 'orders']
    loop
      if not exists (
        select 1 from pg_publication_tables
        where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
      ) then
        execute format('alter publication supabase_realtime add table public.%I', t);
      end if;
    end loop;
  end if;
end $$;

notify pgrst, 'reload schema';

-- Status armada mengikuti siklus pesanan agar katalog renter akurat.
create or replace function public.sync_vehicle_order_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status is not distinct from old.status then
    return new;
  end if;

  if new.status = 'berlangsung' then
    update public.vehicles set status = 'disewa' where id = new.vehicle_id;
  elsif new.status in ('selesai', 'dibatalkan', 'denda') then
    update public.vehicles
    set status = 'tersedia'
    where id = new.vehicle_id and status = 'disewa';
  end if;

  return new;
end;
$$;

drop trigger if exists orders_sync_vehicle_status on public.orders;
create trigger orders_sync_vehicle_status
after update on public.orders
for each row execute function public.sync_vehicle_order_status();
