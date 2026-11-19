-- Vehigo: controlled order status transitions for the trial environment (0004)
-- Run after 0003_reviews.sql.

create or replace function public.transition_order_status(
  p_order_id uuid,
  p_status public.order_status
)
returns public.orders
language plpgsql
security invoker
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
grant execute on function public.transition_order_status(uuid, public.order_status) to authenticated;
