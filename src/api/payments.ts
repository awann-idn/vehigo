import { supabase } from '../lib/supabase';

export async function createPendingPayment(orderId: string, amount: number, method?: string) {
  const { data, error } = await supabase
    .from('payments')
    .insert({
      order_id: orderId,
      amount,
      method: method ?? null,
      provider: 'manual_pending',
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  if (!data) throw new Error('Pembayaran belum berhasil dicatat');
  return data;
}
