import { supabase } from '../lib/supabase';
import { fetchProfileNames } from './directory';
import { ChatMessage, ChatThread } from './types';

function formatTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export async function fetchChatThreads(userId?: string): Promise<ChatThread[]> {
  try {
    let query = supabase.from('chats').select('*').order('created_at', { ascending: false });
    if (userId) {
      query = query.or(`renter_id.eq.${userId},mitra_id.eq.${userId}`);
    }
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) return [];

    const chatIds = data.map((row: any) => row.id);
    const counterpartIds = Array.from(
      new Set(data.map((row: any) => (row.renter_id === userId ? row.mitra_id : row.renter_id)))
    );

    const [nameMap, messagesResult] = await Promise.all([
      fetchProfileNames(counterpartIds),
      supabase
        .from('messages')
        .select('id, chat_id, sender_id, body, read_at, created_at')
        .in('chat_id', chatIds)
        .order('created_at', { ascending: false }),
    ]);
    if (messagesResult.error) throw new Error(messagesResult.error.message);
    const messages = (messagesResult.data ?? []) as any[];

    return data.map((row: any) => {
      const counterpartId = row.renter_id === userId ? row.mitra_id : row.renter_id;
      const threadMessages = messages.filter((message) => message.chat_id === row.id);
      const last = threadMessages[0];
      const unread = threadMessages.filter(
        (message) => message.sender_id !== userId && !message.read_at
      ).length;
      return {
        id: row.id,
        name:
          nameMap.get(counterpartId) ||
          (row.renter_id === userId ? 'Mitra rental' : 'Penyewa rental'),
        lastMessage: last?.body ?? 'Buka percakapan',
        time: formatTime(last?.created_at ?? row.created_at),
        unread,
        online: false,
      };
    });
  } catch (error) {
    throw error instanceof Error ? error : new Error('Gagal memuat percakapan');
  }
}

export async function fetchChatMessages(
  chatId: string,
  userId?: string
): Promise<ChatMessage[]> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);
    if (!data) return [];

    return (data as any[]).map((m) => ({
      id: m.id,
      fromMe: !!userId && m.sender_id === userId,
      text: m.body,
      time: formatTime(m.created_at),
      read: !!m.read_at,
      kind: m.kind,
    }));
  } catch (error) {
    throw error instanceof Error ? error : new Error('Gagal memuat pesan');
  }
}

export async function fetchChatThread(chatId: string, userId?: string): Promise<ChatThread | null> {
  const { data, error } = await supabase.from('chats').select('*').eq('id', chatId).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;

  const counterpartId = data.renter_id === userId ? data.mitra_id : data.renter_id;
  const [nameMap, counterpartProfile, messagesResult] = await Promise.all([
    fetchProfileNames([counterpartId]),
    (supabase as any)
      .from('profile_directory')
      .select('full_name, phone')
      .eq('id', counterpartId)
      .maybeSingle(),
    supabase
      .from('messages')
      .select('id, sender_id, body, read_at, created_at')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: false }),
  ]);
  if (messagesResult.error) throw new Error(messagesResult.error.message);

  const messages = (messagesResult.data ?? []) as any[];
  const last = messages[0];
  return {
    id: data.id,
    name:
      nameMap.get(counterpartId)?.trim() ||
      counterpartProfile.data?.full_name?.trim() ||
      (data.renter_id === userId ? 'Mitra rental' : 'Penyewa rental'),
    lastMessage: last?.body ?? 'Buka percakapan',
    time: formatTime(last?.created_at ?? data.created_at),
    unread: messages.filter((message) => message.sender_id !== userId && !message.read_at).length,
    online: false,
    phone: counterpartProfile.data?.phone ?? undefined,
    counterpartId,
    orderId: data.order_id,
  };
}

export async function markChatRead(chatId: string): Promise<void> {
  const { error } = await supabase.rpc('mark_chat_read', { p_chat_id: chatId });
  if (error) throw new Error(error.message);
}

export async function sendChatMessage(chatId: string, senderId: string, body: string, kind: 'text' | 'emergency' | 'image' | 'order' = 'text') {
  const { data, error } = await supabase
    .from('messages')
    .insert([
      {
        chat_id: chatId,
        sender_id: senderId,
        body,
        kind,
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export async function getOrCreateChat(orderId: string, renterId: string, mitraId: string) {
  const existing = await supabase.from('chats').select('*').eq('order_id', orderId).maybeSingle();
  if (existing.error) throw new Error(existing.error.message);
  if (existing.data) return existing.data;

  const created = await supabase
    .from('chats')
    .insert({ order_id: orderId, renter_id: renterId, mitra_id: mitraId })
    .select()
    .single();

  if (created.error) {
    // Bisa terjadi jika percakapan sudah dibuat oleh pihak lain (unique order_id).
    const retry = await supabase.from('chats').select('*').eq('order_id', orderId).maybeSingle();
    if (retry.data) return retry.data;
    throw new Error(created.error.message);
  }
  if (!created.data) throw new Error('Percakapan tidak berhasil dibuat');
  return created.data;
}

export function subscribeToChatMessages(
  chatId: string,
  onNewMessage: (msg: any) => void
) {
  const channelId = `chat_${chatId}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const channel = supabase
    .channel(channelId)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${chatId}`,
      },
      (payload) => {
        onNewMessage(payload.new);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export { formatTime };
