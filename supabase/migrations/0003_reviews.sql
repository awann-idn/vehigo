-- Vehigo: ulasan kendaraan & mitra per pesanan (0003)
-- Jalankan setelah 0002_rls.sql.

alter table public.reviews drop constraint if exists reviews_order_id_key;
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.reviews'::regclass
      and conname = 'reviews_order_target_key'
  ) then
    alter table public.reviews
      add constraint reviews_order_target_key unique (order_id, target_type);
  end if;
end $$;
