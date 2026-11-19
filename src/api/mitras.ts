import { supabase } from '../lib/supabase';

export type MitraSummary = {
  id: string;
  name: string;
  distance: string;
  rating: number;
  reviews: number;
  units: number;
  orders: number;
  years: number;
};

export type MyMitraProfile = {
  userId: string;
  businessName: string;
  address: string;
  verification: 'pending' | 'verified' | 'rejected';
};

export async function updateMyProfile(payload: {
  userId: string;
  fullName: string;
  phone: string;
}): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: payload.fullName.trim(),
      phone: payload.phone.trim() || null,
    })
    .eq('id', payload.userId);
  if (error) throw new Error(error.message);
}

export async function fetchMyMitraProfile(userId: string): Promise<MyMitraProfile | null> {
  const { data, error } = await supabase
    .from('mitra_profiles')
    .select('user_id, business_name, address, verification')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return {
    userId: data.user_id,
    businessName: data.business_name,
    address: data.address ?? '',
    verification: data.verification,
  };
}

export type MyPayoutAccount = {
  method: 'bank' | 'ewallet';
  accountNumber: string;
  accountHolder: string;
};

export async function fetchMyPayoutAccount(userId: string): Promise<MyPayoutAccount | null> {
  const client = supabase as any;
  const { data, error } = await client
    .from('mitra_payout_accounts')
    .select('method, account_number, account_holder')
    .eq('mitra_id', userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return {
    method: data.method === 'ewallet' ? 'ewallet' : 'bank',
    accountNumber: data.account_number ?? '',
    accountHolder: data.account_holder ?? '',
  };
}

export interface SaveMitraRegistrationPayload {
  userId: string;
  ownerName: string;
  businessName: string;
  address: string;
  phone: string;
  payoutMethod: 'bank' | 'ewallet';
  accountNumber: string;
  accountHolder: string;
}

export async function saveMitraRegistration(payload: SaveMitraRegistrationPayload): Promise<void> {
  if (!payload.businessName.trim()) {
    throw new Error('Nama usaha wajib diisi.');
  }

  const profileUpdate = await supabase
    .from('profiles')
    .update({
      full_name: payload.ownerName.trim(),
      phone: payload.phone.trim() || null,
      role: 'mitra',
    })
    .eq('id', payload.userId);
  if (profileUpdate.error) throw new Error(profileUpdate.error.message);

  const mitraUpsert = await supabase.from('mitra_profiles').upsert(
    {
      user_id: payload.userId,
      business_name: payload.businessName.trim(),
      address: payload.address.trim() || null,
    },
    { onConflict: 'user_id' }
  );
  if (mitraUpsert.error) throw new Error(mitraUpsert.error.message);

  if (payload.accountNumber.trim()) {
    const client = supabase as any;
    const removed = await client.from('mitra_payout_accounts').delete().eq('mitra_id', payload.userId);
    if (removed.error) throw new Error(removed.error.message);
    const inserted = await client.from('mitra_payout_accounts').insert({
      mitra_id: payload.userId,
      method: payload.payoutMethod,
      account_number: payload.accountNumber.trim(),
      account_holder: payload.accountHolder.trim() || payload.ownerName.trim(),
    });
    if (inserted.error) throw new Error(inserted.error.message);
  }
}

export async function fetchMitraRating(userId: string): Promise<{ average: number; count: number }> {
  const { data, error } = await supabase
    .from('reviews')
    .select('rating')
    .eq('target_type', 'mitra')
    .eq('target_id', userId);
  if (error) throw new Error(error.message);
  const rows = data ?? [];
  const average = rows.length ? rows.reduce((sum, row) => sum + row.rating, 0) / rows.length : 0;
  return { average, count: rows.length };
}

export async function fetchMitras(): Promise<MitraSummary[]> {
  const { data, error } = await supabase
    .from('mitra_profiles')
    .select('user_id, business_name, address, created_at')
    .eq('verification', 'verified')
    .order('business_name');

  if (error) throw new Error(error.message);
  const ids = (data ?? []).map((row) => row.user_id);
  if (ids.length === 0) return [];

  const [vehiclesResult, ordersResult, reviewsResult] = await Promise.all([
    supabase.from('vehicles').select('mitra_id').in('mitra_id', ids),
    supabase.from('orders').select('mitra_id').in('mitra_id', ids),
    supabase.from('reviews').select('target_id, rating').eq('target_type', 'mitra').in('target_id', ids),
  ]);
  const countError = vehiclesResult.error ?? ordersResult.error ?? reviewsResult.error;
  if (countError) throw new Error(countError.message);

  return (data ?? []).map((row) => {
    const ratings = (reviewsResult.data ?? []).filter((review) => review.target_id === row.user_id);
    return {
      id: row.user_id,
      name: row.business_name,
      distance: row.address ?? '',
      rating: ratings.length ? ratings.reduce((sum, item) => sum + item.rating, 0) / ratings.length : 0,
      reviews: ratings.length,
      units: (vehiclesResult.data ?? []).filter((vehicle) => vehicle.mitra_id === row.user_id).length,
      orders: (ordersResult.data ?? []).filter((order) => order.mitra_id === row.user_id).length,
      years: Math.max(0, new Date().getFullYear() - new Date(row.created_at).getFullYear()),
    };
  });
}
