import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';
import { fetchProfileNames } from './directory';

type AccountStatus = Database['public']['Tables']['profiles']['Row']['status'];

export type AdminMitra = {
  userId: string;
  businessName: string;
  ownerName: string;
  address: string;
  verification: 'pending' | 'verified' | 'rejected';
};

export type AdminOrder = {
  id: string;
  code: string;
  status: string;
  total: number;
  renter: string;
  mitra: string;
};

export type AdminUser = {
  id: string;
  fullName: string;
  role: string;
  status: AccountStatus;
};

export type AdminOverview = {
  counts: { users: number; mitras: number; vehicles: number; orders: number };
  pendingMitras: AdminMitra[];
  recentOrders: AdminOrder[];
  users: AdminUser[];
};

export async function fetchAdminOverview(): Promise<AdminOverview> {
  const [usersCount, mitrasCount, vehiclesCount, ordersCount, pending, recentOrders, users] =
    await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('mitra_profiles').select('id', { count: 'exact', head: true }),
      supabase.from('vehicles').select('id', { count: 'exact', head: true }),
      supabase.from('orders').select('id', { count: 'exact', head: true }),
      supabase
        .from('mitra_profiles')
        .select('user_id, business_name, address, verification')
        .eq('verification', 'pending')
        .order('created_at', { ascending: true }),
      supabase
        .from('orders')
        .select('id, code, status, total, renter_id, mitra_id')
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from('profiles')
        .select('id, full_name, role, status')
        .order('created_at', { ascending: false })
        .limit(20),
    ]);

  const firstError =
    usersCount.error ??
    mitrasCount.error ??
    vehiclesCount.error ??
    ordersCount.error ??
    pending.error ??
    recentOrders.error ??
    users.error;
  if (firstError) throw new Error(firstError.message);

  const pendingRows = pending.data ?? [];
  const orderRows = recentOrders.data ?? [];
  const peopleIds = Array.from(
    new Set([
      ...pendingRows.map((row) => row.user_id),
      ...orderRows.flatMap((row) => [row.renter_id, row.mitra_id]),
    ])
  );

  const [peopleMap, mitraNames] = await Promise.all([
    fetchProfileNames(peopleIds),
    orderRows.length
      ? supabase
          .from('mitra_profiles')
          .select('user_id, business_name')
          .in('user_id', Array.from(new Set(orderRows.map((row) => row.mitra_id))))
      : Promise.resolve({ data: [], error: null }),
  ]);
  if (mitraNames.error) throw new Error(mitraNames.error.message);
  const mitraMap = new Map<string, string>(
    (mitraNames.data ?? []).map(
      (row: any) => [String(row.user_id), String(row.business_name ?? '')] as [string, string]
    )
  );

  return {
    counts: {
      users: usersCount.count ?? 0,
      mitras: mitrasCount.count ?? 0,
      vehicles: vehiclesCount.count ?? 0,
      orders: ordersCount.count ?? 0,
    },
    pendingMitras: pendingRows.map((row) => ({
      userId: row.user_id,
      businessName: row.business_name,
      ownerName: peopleMap.get(row.user_id) ?? '',
      address: row.address ?? '',
      verification: row.verification,
    })),
    recentOrders: orderRows.map((row) => ({
      id: row.id,
      code: row.code,
      status: row.status,
      total: Number(row.total),
      renter: peopleMap.get(row.renter_id) ?? '',
      mitra: mitraMap.get(row.mitra_id) ?? '',
    })),
    users: (users.data ?? []).map((row) => ({
      id: row.id,
      fullName: row.full_name ?? '',
      role: row.role,
      status: row.status,
    })),
  };
}

export async function verifyMitra(userId: string, verification: 'verified' | 'rejected') {
  const { error } = await supabase
    .from('mitra_profiles')
    .update({ verification })
    .eq('user_id', userId);
  if (error) throw new Error(error.message);
}

export async function setUserStatus(userId: string, status: AccountStatus) {
  const { error } = await supabase.from('profiles').update({ status }).eq('id', userId);
  if (error) throw new Error(error.message);
}
