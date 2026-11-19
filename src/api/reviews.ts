import { supabase } from '../lib/supabase';
import { fetchProfileNames } from './directory';

export type Review = {
  id: string;
  author: string;
  rating: number;
  body: string;
  date: string;
};

export async function fetchReviews(targetType?: 'vehicle' | 'mitra', targetId?: string): Promise<Review[]> {
  let query = supabase
    .from('reviews')
    .select('id, author_id, rating, body, created_at')
    .order('created_at', { ascending: false });

  if (targetType && targetId) {
    query = query.eq('target_type', targetType).eq('target_id', targetId);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const authorMap = await fetchProfileNames((data ?? []).map((row) => row.author_id));

  return (data ?? []).map((row) => ({
    id: row.id,
    author: authorMap.get(row.author_id)?.trim() || 'Pengguna Vehigo',
    rating: row.rating,
    body: row.body ?? '',
    date: new Date(row.created_at).toLocaleDateString('id-ID'),
  }));
}

export interface CreateReviewPayload {
  orderId: string;
  authorId: string;
  targetType: 'vehicle' | 'mitra';
  targetId: string;
  rating: number;
  body?: string;
}

export async function createReview(payload: CreateReviewPayload): Promise<boolean> {
  const { error } = await supabase.from('reviews').insert([
      {
        order_id: payload.orderId,
        author_id: payload.authorId,
        target_type: payload.targetType,
        target_id: payload.targetId,
        rating: payload.rating,
        body: payload.body ?? null,
      },
  ]);
  if (error) throw new Error(error.message);
  return true;
}
