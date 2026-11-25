-- Vehigo: chat attachment metadata via messages.body JSON payload
alter table public.messages drop constraint if exists messages_kind_check;
alter table public.messages add constraint messages_kind_check check (kind in ('text','emergency','image','order'));
notify pgrst, 'reload schema';
