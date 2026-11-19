-- Read only unavailable dates, including orders hidden from renters by RLS.
create or replace function public.get_vehicle_unavailable_dates(
  p_vehicle_id uuid, p_from date, p_to date
)
returns table (date date)
language sql stable security definer
set search_path = ''
as $$
  select va.date
  from public.vehicle_availability va
  where va.vehicle_id = p_vehicle_id and va.date between p_from and p_to and va.is_blocked
  union
  select d::date
  from public.orders o
  cross join lateral generate_series(
    greatest(o.start_date, p_from)::timestamp,
    least(o.end_date, p_to)::timestamp,
    interval '1 day'
  ) as d
  where o.vehicle_id = p_vehicle_id
    and o.status <> 'dibatalkan'
    and o.start_date <= p_to and o.end_date >= p_from;
$$;

revoke all on function public.get_vehicle_unavailable_dates(uuid, date, date) from public;
revoke all on function public.get_vehicle_unavailable_dates(uuid, date, date) from anon;
grant execute on function public.get_vehicle_unavailable_dates(uuid, date, date) to authenticated;
