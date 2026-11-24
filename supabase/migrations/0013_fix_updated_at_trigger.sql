-- Vehigo: perbaiki trigger updated_at yang dipasang ke tabel tanpa kolom updated_at (0013)
-- Jalankan SEBELUM 0011/0012. Error 42703 berasal dari trigger ini.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  if to_jsonb(new) ? 'updated_at' then
    new.updated_at = now();
  end if;
  return new;
end;
$$;

-- Hanya tabel yang benar-benar memiliki updated_at yang boleh memakai trigger ini.
drop trigger if exists set_updated_at on public.vehicle_availability;
drop trigger if exists set_updated_at on public.payments;
drop trigger if exists set_updated_at on public.inspections;
drop trigger if exists set_updated_at on public.reviews;
drop trigger if exists set_updated_at on public.chats;
drop trigger if exists set_updated_at on public.messages;
drop trigger if exists set_updated_at on public.notifications;
drop trigger if exists set_updated_at on public.documents;
drop trigger if exists set_updated_at on public.payouts;

notify pgrst, 'reload schema';
