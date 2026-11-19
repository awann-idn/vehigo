-- Booking must resolve the vehicle under a controlled server function.
-- This avoids RLS visibility differences between catalog reads and booking writes.
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
