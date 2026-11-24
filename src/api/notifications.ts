import { supabase } from '../lib/supabase';
import { NotificationItem } from './types';

function relativeTime(value: string): string {
  const created = new Date(value).getTime();
  if (Number.isNaN(created)) return '';
  const minutes = Math.floor((Date.now() - created) / 60000);
  if (minutes < 1) return 'Baru saja';
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} hari lalu`;
  return new Date(value).toLocaleDateString('id-ID');
}

export async function fetchNotifications(userId?: string): Promise<NotificationItem[]> {
  try {
    let query = supabase.from('notifications').select('*').order('created_at', { ascending: false });
    if (userId) {
      query = query.eq('user_id', userId);
    }
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    if (!data) return [];
    return data.map((n: any) => ({
      id: n.id,
      title: n.title,
      body: n.body,
      time: relativeTime(n.created_at),
      tone: n.type === 'success' ? 'success' : n.type === 'warning' ? 'warning' : 'info',
      read: !!n.read_at,
      linkType: n.link_type === 'chat' || n.link_type === 'order' ? n.link_type : null,
      linkId: n.link_id ?? null,
      category: n.category === 'chat' || n.category === 'promo' ? n.category : 'order',
    }));
  } catch (error) {
    throw error instanceof Error ? error : new Error('Gagal memuat notifikasi');
  }
}

export function subscribeToNotifications(userId: string, onUpdate: () => void) {
  const channelId = `notif_${userId}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const channel = supabase
    .channel(channelId)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      () => {
        onUpdate();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export async function markNotificationRead(id: string) {
  const { error } = await supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function markAllNotificationsRead(userId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', userId)
    .is('read_at', null);
  if (error) throw new Error(error.message);
}

export async function markLinkRead(linkType: 'chat' | 'order', linkId: string) {
  const { error } = await supabase.rpc('mark_link_read', {
    p_link_type: linkType,
    p_link_id: linkId,
  });
  if (error) throw new Error(error.message);
}
