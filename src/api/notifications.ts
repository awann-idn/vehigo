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
    }));
  } catch (error) {
    throw error instanceof Error ? error : new Error('Gagal memuat notifikasi');
  }
}

export async function markNotificationRead(id: string) {
  const { error } = await supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('id', id);
  if (error) throw new Error(error.message);
}
