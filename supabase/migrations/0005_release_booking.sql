-- Vehigo release booking/availability contract.
-- Run after 0001-0004. All client booking writes should use create_order_atomic.

create index if not exists orders_vehicle_dates_idx
  on public.orders (vehicle_id, start_date, end_date)
  where status not in ('dibatalkan');

create index if not exists vehicle_availability_date_idx
  on public.vehicle_availability (vehicle_id, date, is_blocked);

create or replace function public.get_vehicle_unavailable_dates(
  p_vehicle_id uuid,
  p_from date,
  p_to date
)
returns table (date date)
language sql
stable
security invoker
as $$
  select va.date
  from public.vehicle_availability va
  where va.vehicle_id = p_vehicle_id
    and va.date between p_from and p_to
    and va.is_blocked
  union
  select day::date
  from public.orders o
  cross join lateral generate_series(
    greatest(o.start_date, p_from)::timestamp,
    least(o.end_date, p_to)::timestamp,
    interval '1 day'
  ) day
  where o.vehicle_id = p_vehicle_id
    and o.status not in ('dibatalkan')
    and o.start_date <= p_to
    and o.end_date >= p_from;
$$;

create or replace function public.create_order_atomic(
  p_vehicle_id uuid,
  p_start_date date,
  p_end_date date,
  p_payment_method text default null,
  p_notes text default null
)
returns public.orders
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_vehicle public.vehicles;
  v_days integer;
  v_order public.orders;
  v_renter uuid := auth.uid();
begin
  if v_renter is null then
    raise exception 'AUTH_REQUIRED';
  end if;
  if p_end_date < p_start_date then
    raise exception 'INVALID_DATE_RANGE';
  end if;

  select * into v_vehicle
  from public.vehicles
  where id = p_vehicle_id
  for update;
  if not found then raise exception 'VEHICLE_NOT_FOUND'; end if;
  if v_vehicle.status <> 'tersedia' then raise exception 'VEHICLE_NOT_AVAILABLE'; end if;

  if exists (
    select 1 from public.vehicle_availability va
    where va.vehicle_id = p_vehicle_id
      and va.date between p_start_date and p_end_date
      and va.is_blocked
  ) or exists (
    select 1 from public.orders o
    where o.vehicle_id = p_vehicle_id
      and o.status not in ('dibatalkan')
      and o.start_date <= p_end_date
      and o.end_date >= p_start_date
  ) then
    raise exception 'VEHICLE_DATE_CONFLICT';
  end if;

  v_days := greatest(1, (p_end_date - p_start_date));
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

grant execute on function public.get_vehicle_unavailable_dates(uuid, date, date) to authenticated;
grant execute on function public.create_order_atomic(uuid, date, date, text, text) to authenticated;
