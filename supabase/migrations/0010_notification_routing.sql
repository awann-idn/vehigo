-- Vehigo: notification routing and read flows (0010)
-- Jalankan setelah 0009.

alter table public.notifications
  add column if not exists link_type text check (link_type in ('chat', 'order')),
  add column if not exists link_id uuid,
  add column if not exists category text not null default 'order'
    check (category in ('order', 'chat', 'promo'));

create index if not exists notifications_link_idx
  on public.notifications (user_id, link_type, link_id);

-- Notifikasi pesanan membawa tujuan pesanan.
create or replace function public.notify_order_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.notifications (user_id, title, body, type, link_type, link_id, category)
    values (new.mitra_id, 'Pesanan baru', 'Pesanan ' || new.code || ' menunggu konfirmasi Anda.', 'info', 'order', new.id, 'order');
    return new;
  end if;

  if tg_op = 'UPDATE' and new.status is distinct from old.status then
    insert into public.notifications (user_id, title, body, type, link_type, link_id, category)
    values (
      new.renter_id,
      'Status pesanan diperbarui',
      'Pesanan ' || new.code || ' sekarang berstatus ' || new.status || '.',
      case when new.status = 'selesai' then 'success' when new.status = 'dibatalkan' then 'warning' else 'info' end,
      'order',
      new.id,
      'order'
    );
    insert into public.notifications (user_id, title, body, type, link_type, link_id, category)
    values (
      new.mitra_id,
      'Status pesanan diperbarui',
      'Pesanan ' || new.code || ' sekarang berstatus ' || new.status || '.',
      case when new.status = 'selesai' then 'success' when new.status = 'dibatalkan' then 'warning' else 'info' end,
      'order',
      new.id,
      'order'
    );
  end if;

  return new;
end;
$$;

-- Notifikasi chat membawa tujuan percakapan.
create or replace function public.notify_chat_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_chat public.chats;
  v_recipient uuid;
begin
  select * into v_chat from public.chats where id = new.chat_id;
  if v_chat.id is null then
    return new;
  end if;

  if new.sender_id = v_chat.renter_id then
    v_recipient := v_chat.mitra_id;
  elsif new.sender_id = v_chat.mitra_id then
    v_recipient := v_chat.renter_id;
  else
    return new;
  end if;

  insert into public.notifications (user_id, title, body, type, link_type, link_id, category)
  values (v_recipient, 'Pesan baru', left(new.body, 120), 'info', 'chat', new.chat_id, 'chat');
  return new;
end;
$$;

create or replace function public.notify_inspection_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders;
begin
  select * into v_order from public.orders where id = new.order_id;
  if v_order.id is null then
    return new;
  end if;
  insert into public.notifications (user_id, title, body, type, link_type, link_id, category)
  values (v_order.mitra_id, 'Pengecekan kendaraan', 'Penyewa mengirim hasil pengecekan untuk pesanan ' || v_order.code || '.', 'info', 'order', v_order.id, 'order');
  return new;
end;
$$;

-- Membaca chat sekaligus menandai notifikasi chat tersebut terbaca.
create or replace function public.mark_chat_read(p_chat_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_chat public.chats;
begin
  select * into v_chat from public.chats where id = p_chat_id;
  if v_chat.id is null then raise exception 'CHAT_NOT_FOUND'; end if;
  if auth.uid() is null or (auth.uid() <> v_chat.renter_id and auth.uid() <> v_chat.mitra_id) then
    raise exception 'CHAT_FORBIDDEN';
  end if;

  update public.messages
  set read_at = now()
  where chat_id = p_chat_id and sender_id <> auth.uid() and read_at is null;

  update public.notifications
  set read_at = now()
  where user_id = auth.uid()
    and link_type = 'chat'
    and link_id = p_chat_id
    and read_at is null;
end;
$$;

revoke all on function public.mark_chat_read(uuid) from public;
revoke all on function public.mark_chat_read(uuid) from anon;
grant execute on function public.mark_chat_read(uuid) to authenticated;

-- Menandai notifikasi yang menunjuk ke sebuah pesanan sebagai terbaca.
create or replace function public.mark_link_read(p_link_type text, p_link_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
  update public.notifications
  set read_at = now()
  where user_id = auth.uid()
    and link_type = p_link_type
    and link_id = p_link_id
    and read_at is null;
end;
$$;

revoke all on function public.mark_link_read(text, uuid) from public;
revoke all on function public.mark_link_read(text, uuid) from anon;
grant execute on function public.mark_link_read(text, uuid) to authenticated;

notify pgrst, 'reload schema';
