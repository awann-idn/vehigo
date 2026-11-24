-- Vehigo: backfill notifikasi lama agar punya tujuan klik (0012)
-- Jalankan setelah 0010.

alter table public.notifications
  add column if not exists link_type text,
  add column if not exists link_id uuid,
  add column if not exists category text not null default 'order';

update public.notifications n
set link_type = 'order', link_id = o.id, category = 'order'
from public.orders o
where n.link_id is null
  and (
    n.body like '%' || o.code || '%'
  )
  and (n.user_id = o.renter_id or n.user_id = o.mitra_id);

update public.notifications n
set link_type = 'chat', link_id = c.id, category = 'chat'
from public.chats c
where n.link_id is null
  and n.title = 'Pesan baru'
  and (n.user_id = c.renter_id or n.user_id = c.mitra_id);

notify pgrst, 'reload schema';
