-- Vehigo production hardening (0008)
-- Jalankan setelah 0001-0007.

-- Directory publik terbatas: hanya nama tampilan dan avatar.
-- Nomor telepon tetap privat dan hanya dibaca dari profil sendiri.
create or replace view public.profile_directory as
select id, full_name, avatar_url
from public.profiles;

revoke all on public.profile_directory from public;
revoke all on public.profile_directory from anon;
grant select on public.profile_directory to authenticated;

-- Notifikasi otomatis untuk peristiwa pesanan dan chat.
create or replace function public.notify_order_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.notifications (user_id, title, body, type)
    values (
      new.mitra_id,
      'Pesanan baru',
      'Pesanan ' || new.code || ' menunggu konfirmasi Anda.',
      'info'
    );
    return new;
  end if;

  if tg_op = 'UPDATE' and new.status is distinct from old.status then
    insert into public.notifications (user_id, title, body, type)
    values (
      new.renter_id,
      'Status pesanan diperbarui',
      'Pesanan ' || new.code || ' sekarang berstatus ' || new.status || '.',
      case when new.status = 'selesai' then 'success'
           when new.status = 'dibatalkan' then 'warning'
           else 'info' end
    );
    insert into public.notifications (user_id, title, body, type)
    values (
      new.mitra_id,
      'Status pesanan diperbarui',
      'Pesanan ' || new.code || ' sekarang berstatus ' || new.status || '.',
      case when new.status = 'selesai' then 'success'
           when new.status = 'dibatalkan' then 'warning'
           else 'info' end
    );
  end if;

  return new;
end;
$$;

drop trigger if exists orders_notify_insert on public.orders;
create trigger orders_notify_insert
after insert on public.orders
for each row execute function public.notify_order_event();

drop trigger if exists orders_notify_update on public.orders;
create trigger orders_notify_update
after update on public.orders
for each row execute function public.notify_order_event();

create or replace function public.notify_chat_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_chat public.chats;
  v_recipient uuid;
begin
  select * into v_chat from public.chats where id = new.chat_id;
  if v_chat.id is null then
    return new;
  end if;

  if new.sender_id = v_chat.renter_id then
    v_recipient := v_chat.mitra_id;
  elsif new.sender_id = v_chat.mitra_id then
    v_recipient := v_chat.renter_id;
  else
    return new;
  end if;

  insert into public.notifications (user_id, title, body, type)
  values (v_recipient, 'Pesan baru', left(new.body, 120), 'info');
  return new;
end;
$$;

drop trigger if exists messages_notify_insert on public.messages;
create trigger messages_notify_insert
after insert on public.messages
for each row execute function public.notify_chat_message();

-- Profil mitra harus selalu punya nama usaha yang bermakna.
alter table public.mitra_profiles
  alter column business_name set default 'Mitra Vehigo';

-- Penanda pesan sudah dibaca; RLS pesan hanya mengizinkan update pesan sendiri,
-- sehingga penandaan dilakukan lewat fungsi yang memvalidasi keanggotaan chat.
create or replace function public.mark_chat_read(p_chat_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_chat public.chats;
begin
  select * into v_chat from public.chats where id = p_chat_id;
  if v_chat.id is null then
    raise exception 'CHAT_NOT_FOUND';
  end if;
  if auth.uid() is null or (auth.uid() <> v_chat.renter_id and auth.uid() <> v_chat.mitra_id) then
    raise exception 'CHAT_FORBIDDEN';
  end if;

  update public.messages
  set read_at = now()
  where chat_id = p_chat_id
    and sender_id <> auth.uid()
    and read_at is null;
end;
$$;

revoke all on function public.mark_chat_read(uuid) from public;
revoke all on function public.mark_chat_read(uuid) from anon;
grant execute on function public.mark_chat_read(uuid) to authenticated;

notify pgrst, 'reload schema';

-- Transisi status pesanan perlu menulis riwayat, sedangkan tabel riwayat
-- tidak memiliki policy insert untuk klien. Jalankan sebagai server function
-- dengan validasi peran di dalam fungsi.
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
    allowed := (current_order.status = 'belum_bayar' and p_status = 'dibatalkan');
  elsif current_order.mitra_id = auth.uid() then
    allowed :=
      (current_order.status = 'belum_bayar' and p_status = 'berlangsung') or
      (current_order.status = 'berlangsung' and p_status in ('selesai', 'denda')) or
      (current_order.status = 'denda' and p_status = 'selesai') or
      (p_status = 'dibatalkan' and current_order.status in ('belum_bayar', 'berlangsung'));
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

create or replace function public.notify_inspection_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders;
begin
  select * into v_order from public.orders where id = new.order_id;
  if v_order.id is null then
    return new;
  end if;
  insert into public.notifications (user_id, title, body, type)
  values (
    v_order.mitra_id,
    'Pengecekan kendaraan',
    'Penyewa telah mengirim hasil pengecekan untuk pesanan ' || v_order.code || '.',
    'info'
  );
  return new;
end;
$$;

drop trigger if exists inspections_notify_insert on public.inspections;
create trigger inspections_notify_insert
after insert on public.inspections
for each row execute function public.notify_inspection_created();

-- Cegah pemesanan tanggal lampau dan rentang tidak masuk akal.
create or replace function public.create_order_atomic(
  p_vehicle_id uuid,
  p_start_date date,
  p_end_date date,
  p_payment_method text default null,
  p_notes text default null
)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_vehicle public.vehicles;
  v_days integer;
  v_order public.orders;
  v_renter uuid := auth.uid();
begin
  if v_renter is null then raise exception 'AUTH_REQUIRED'; end if;
  if p_vehicle_id is null then raise exception 'VEHICLE_ID_REQUIRED'; end if;
  if p_start_date is null or p_end_date is null then raise exception 'INVALID_DATE_RANGE'; end if;
  if p_start_date < current_date then raise exception 'INVALID_DATE_RANGE'; end if;
  if p_end_date < p_start_date then raise exception 'INVALID_DATE_RANGE'; end if;

  select * into v_vehicle
  from public.vehicles
  where id = p_vehicle_id
  for update;
  if not found then raise exception 'VEHICLE_NOT_FOUND'; end if;
  if v_vehicle.status <> 'tersedia' then raise exception 'VEHICLE_NOT_AVAILABLE'; end if;

  if exists (
    select 1 from public.vehicle_availability va
    where va.vehicle_id = p_vehicle_id and va.is_blocked
      and va.date between p_start_date and p_end_date
  ) or exists (
    select 1 from public.orders o
    where o.vehicle_id = p_vehicle_id
      and o.status <> 'dibatalkan'
      and o.start_date <= p_end_date and o.end_date >= p_start_date
  ) then raise exception 'VEHICLE_DATE_CONFLICT'; end if;

  v_days := greatest(1, p_end_date - p_start_date);
  insert into public.orders (
    renter_id, mitra_id, vehicle_id, start_date, end_date, days,
    daily_price, subtotal, deposit, total, payment_method, notes, status
  ) values (
    v_renter, v_vehicle.mitra_id, v_vehicle.id, p_start_date, p_end_date, v_days,
    v_vehicle.price_per_day, v_vehicle.price_per_day * v_days, 0,
    v_vehicle.price_per_day * v_days, p_payment_method, p_notes, 'belum_bayar'
  ) returning * into v_order;

  insert into public.order_status_history(order_id, status, actor_id)
  values (v_order.id, v_order.status, v_renter);
  return v_order;
end;
$$;

revoke all on function public.create_order_atomic(uuid, date, date, text, text) from public;
revoke all on function public.create_order_atomic(uuid, date, date, text, text) from anon;
grant execute on function public.create_order_atomic(uuid, date, date, text, text) to authenticated;

notify pgrst, 'reload schema';
