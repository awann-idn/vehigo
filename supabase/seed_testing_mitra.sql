-- Vehigo testing seed: satu mitra rental lengkap dengan tujuh kendaraan.
--
-- Cara pakai:
-- 1. Buat satu user melalui Supabase Authentication > Users > Add user.
-- 2. Pastikan trigger profile membuat row public.profiles, lalu ubah
--    testing_mitra di bawah dengan UUID user tersebut.
-- 3. Jalankan migration 0001-0005 terlebih dahulu.
-- 4. Jalankan file ini di Supabase SQL Editor.
--
-- File ini idempotent: aman dijalankan ulang. Tidak menyimpan password atau
-- service-role key di repository.

do $$
declare
  -- UUID wajib berupa string SQL dengan tanda petik tunggal.
  testing_mitra uuid := 'e4ebc520-bc03-42aa-97e9-522187b44120';
begin
  if not exists (
    select 1
    from public.profiles
    where id = testing_mitra
      and role = 'mitra'
  ) then
    raise exception
      'Buat Auth user mitra terlebih dahulu, lalu ganti testing_mitra dengan UUID user tersebut';
  end if;

  update public.profiles
  set full_name = 'Andi Wijaya',
      phone = '081234567890',
      status = 'active',
      updated_at = now()
  where id = testing_mitra;

  insert into public.mitra_profiles (
    user_id,
    business_name,
    address,
    latitude,
    longitude,
    verification
  ) values (
    testing_mitra,
    'Sriwijaya Premium Mobility',
    'Jl. Jenderal Sudirman No. 88, Ilir Timur I, Palembang, Sumatera Selatan',
    -2.976073,
    104.775430,
    'verified'
  )
  on conflict (user_id) do update set
    business_name = excluded.business_name,
    address = excluded.address,
    latitude = excluded.latitude,
    longitude = excluded.longitude,
    verification = excluded.verification,
    updated_at = now();

  insert into public.mitra_payout_accounts (
    mitra_id,
    method,
    bank_name,
    account_number,
    account_holder
  )
  select testing_mitra, 'bank', 'BCA', '1234567890', 'Andi Wijaya'
  where not exists (
    select 1
    from public.mitra_payout_accounts
    where mitra_id = testing_mitra
      and method = 'bank'
      and account_number = '1234567890'
  );

  insert into public.vehicles (
    mitra_id,
    name,
    brand,
    year,
    plate,
    transmission,
    seats,
    price_per_day,
    status,
    location,
    description
  ) values
    (
      testing_mitra,
      'Toyota Avanza Veloz 2023',
      'Toyota',
      2023,
      'BG 7010 SM',
      'Matic',
      7,
      350000,
      'tersedia',
      'Palembang',
      'MPV keluarga dengan kabin lega, AC dingin, kamera parkir, dan cocok untuk perjalanan dalam kota maupun luar kota.'
    ),
    (
      testing_mitra,
      'Honda Brio Satya 2023',
      'Honda',
      2023,
      'BG 7011 SM',
      'Manual',
      5,
      275000,
      'tersedia',
      'Palembang',
      'City car irit dan lincah untuk kebutuhan harian, perjalanan bisnis, dan mobilitas dalam kota.'
    ),
    (
      testing_mitra,
      'Mitsubishi Xpander Ultimate 2022',
      'Mitsubishi',
      2022,
      'BG 7012 SM',
      'Matic',
      7,
      425000,
      'tersedia',
      'Palembang',
      'MPV nyaman tujuh penumpang dengan ground clearance tinggi dan ruang bagasi luas.'
    ),
    (
      testing_mitra,
      'Toyota Innova Reborn 2021',
      'Toyota',
      2021,
      'BG 7013 SM',
      'Matic',
      7,
      550000,
      'tersedia',
      'Palembang',
      'Kabin premium untuk keluarga dan perjalanan antarkota dengan captain seat dan bagasi lega.'
    ),
    (
      testing_mitra,
      'Toyota Fortuner VRZ 2020',
      'Toyota',
      2020,
      'BG 7014 SM',
      'Matic',
      7,
      850000,
      'tersedia',
      'Palembang',
      'SUV premium dengan kabin luas, performa kuat, dan cocok untuk perjalanan keluarga.'
    ),
    (
      testing_mitra,
      'Honda CR-V Turbo 2022',
      'Honda',
      2022,
      'BG 7015 SM',
      'Matic',
      5,
      800000,
      'tersedia',
      'Palembang',
      'SUV nyaman dengan mesin turbo, fitur keselamatan lengkap, dan interior modern.'
    ),
    (
      testing_mitra,
      'BMW 320i Sport 2021',
      'BMW',
      2021,
      'BG 7016 SM',
      'Matic',
      5,
      1250000,
      'tersedia',
      'Palembang',
      'Sedan premium untuk kebutuhan bisnis dan perjalanan khusus dengan pengalaman berkendara dinamis.'
    )
  on conflict (plate) do update set
    mitra_id = excluded.mitra_id,
    name = excluded.name,
    brand = excluded.brand,
    year = excluded.year,
    transmission = excluded.transmission,
    seats = excluded.seats,
    price_per_day = excluded.price_per_day,
    status = excluded.status,
    location = excluded.location,
    description = excluded.description,
    updated_at = now();

  -- Satu tanggal blokir untuk menguji kalender realtime tanpa mengganggu
  -- sebagian besar tanggal booking kendaraan.
  insert into public.vehicle_availability (vehicle_id, date, is_blocked)
  select v.id, current_date + 7, true
  from public.vehicles v
  where v.mitra_id = testing_mitra
  on conflict (vehicle_id, date) do update set is_blocked = excluded.is_blocked;
end $$;

select
  mp.business_name,
  p.full_name as mitra_name,
  count(v.id) as vehicle_count
from public.mitra_profiles mp
join public.profiles p on p.id = mp.user_id
left join public.vehicles v on v.mitra_id = mp.user_id
where mp.business_name = 'Sriwijaya Premium Mobility'
group by mp.business_name, p.full_name;
