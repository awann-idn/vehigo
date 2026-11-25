-- Vehigo: persist additional Mitra registration fields (0014)
alter table public.mitra_profiles
  add column if not exists owner_identity_number text,
  add column if not exists business_description text;
notify pgrst, 'reload schema';
