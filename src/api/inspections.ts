import { supabase } from '../lib/supabase';

export async function saveInspection(payload: {
  orderId: string;
  photos: string[];
  findings: { label: string; value: string; ok: boolean }[];
  damageFee: number;
  approved: boolean;
}) {
  const { data, error } = await supabase
    .from('inspections')
    .upsert({
      order_id: payload.orderId,
      photos: payload.photos,
      findings: payload.findings,
      damage_fee: payload.damageFee,
      approved: payload.approved,
    }, { onConflict: 'order_id' })
    .select()
    .single();

  if (error) throw new Error(error.message);
  if (!data) throw new Error('Hasil inspeksi tidak berhasil disimpan');
  return data;
}
