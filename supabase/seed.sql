-- Vehigo release seed.
-- Business records are deterministic, but ownership still requires an Auth profile.
-- Set the UUIDs below to existing profiles with role=mitra before running this file.

do $$
declare
  sriwijaya uuid := '00000000-0000-0000-0000-000000000001';
  bms uuid := '00000000-0000-0000-0000-000000000002';
  premium uuid := '00000000-0000-0000-0000-000000000003';
  rentgo uuid := '00000000-0000-0000-0000-000000000004';
begin
  if not exists (select 1 from public.profiles where id in (sriwijaya, bms, premium, rentgo) and role = 'mitra') then
    raise exception 'Buat empat profile Auth role mitra dan ganti UUID seed terlebih dahulu';
  end if;

  insert into public.mitra_profiles(user_id, business_name, address, verification) values
    (sriwijaya, 'Sriwijaya Rent Car', 'Palembang', 'verified'),
    (bms, 'BMS Rent Car', 'Palembang', 'verified'),
    (premium, 'Palembang Premium Car', 'Palembang', 'verified'),
    (rentgo, 'Vehicle Rent Go', 'Palembang', 'verified')
  on conflict (user_id) do update set business_name = excluded.business_name, address = excluded.address, verification = excluded.verification, updated_at = now();

  insert into public.vehicles(mitra_id, name, brand, year, plate, transmission, seats, price_per_day, status, location, description) values
    (sriwijaya, 'Toyota Avanza 2023', 'Toyota', 2023, 'BG 1234 AVZ', 'Matic', 7, 350000, 'tersedia', 'Palembang', 'Toyota Avanza 2023 dari Sriwijaya Rent Car.'),
    (sriwijaya, 'Mitsubishi Xpander', 'Mitsubishi', 2022, 'BG 8821 XP', 'Matic', 7, 400000, 'tersedia', 'Palembang', 'Mitsubishi Xpander dari Sriwijaya Rent Car.'),
    (sriwijaya, 'BMW 5 Series G30', 'BMW', 2021, 'BG 1234 AER', 'Matic', 5, 1250000, 'tersedia', 'Palembang', 'BMW 5 Series G30 dari Sriwijaya Rent Car.'),
    (sriwijaya, 'Fortuner 2019', 'Toyota', 2019, 'BG 1234 FR', 'Matic', 7, 750000, 'maintenance', 'Palembang', 'Toyota Fortuner dari Sriwijaya Rent Car.'),
    (bms, 'Honda Brio 2023', 'Honda', 2023, 'BG 5566 BR', 'Manual', 5, 275000, 'tersedia', 'Palembang', 'Honda Brio 2023 dari BMS Rent Car.')
  on conflict (plate) do update set
    mitra_id = excluded.mitra_id, name = excluded.name, price_per_day = excluded.price_per_day,
    status = excluded.status, updated_at = now();
end $$;
