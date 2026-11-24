import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';
import { Order, OrderStatus } from './types';
import { fetchProfileNames } from './directory';

type DbOrder = Database['public']['Tables']['orders']['Row'];

const statusMap: Record<string, OrderStatus> = {
  belum_bayar: 'Belum Bayar',
  menunggu_konfirmasi: 'Menunggu Konfirmasi',
  berlangsung: 'Berlangsung',
  selesai: 'Selesai',
  denda: 'Denda',
  dibatalkan: 'Dibatalkan',
  draft_whatsapp: 'Draft WhatsApp',
};

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function mapDbToOrder(o: DbOrder & { profiles?: { full_name: string; phone: string | null } | null; vehicles?: { name: string; plate: string } | null; mitra_profiles?: { business_name: string } | null }): Order {
  return {
    id: o.id,
    code: o.code,
    renter: o.profiles?.full_name || '',
    vehicle: o.vehicles?.name || '',
    plate: o.vehicles?.plate || '',
    start: formatDate(o.start_date),
    end: formatDate(o.end_date),
    days: o.days,
    total: Number(o.total),
    status: statusMap[o.status] || 'Belum Bayar',
    payment: o.payment_method || 'Belum dipilih',
    phone: o.profiles?.phone || '',
    renterId: o.renter_id,
    vehicleId: o.vehicle_id,
    mitraId: o.mitra_id,
    mitraName: o.mitra_profiles?.business_name || '',
  };
}

export async function fetchOrders(role?: 'renter' | 'mitra', userId?: string): Promise<Order[]> {
  try {
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false });

    if (userId) {
      if (role === 'renter') {
        query = query.eq('renter_id', userId);
      } else if (role === 'mitra') {
        query = query.eq('mitra_id', userId);
      }
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    if (!data) return [];

    const orders = (data as DbOrder[]).map(mapDbToOrder);
    const vehicleIds = orders.map((order) => order.vehicleId).filter(Boolean) as string[];
    const mitraIds = orders.map((order) => order.mitraId).filter(Boolean) as string[];
    const renterIds = orders.map((order) => order.renterId).filter(Boolean) as string[];
    if (vehicleIds.length === 0 && mitraIds.length === 0 && renterIds.length === 0) return orders;
    const [vehicles, mitras, renterMap] = await Promise.all([
      vehicleIds.length ? supabase.from('vehicles').select('id, name, plate').in('id', vehicleIds) : Promise.resolve({ data: [], error: null }),
      mitraIds.length ? supabase.from('mitra_profiles').select('user_id, business_name').in('user_id', mitraIds) : Promise.resolve({ data: [], error: null }),
      fetchProfileNames(renterIds),
    ]);
    if (vehicles.error) throw new Error(vehicles.error.message);
    if (mitras.error) throw new Error(mitras.error.message);
    const vehicleMap = new Map<string, any>(
      (vehicles.data ?? []).map((vehicle: any) => [String(vehicle.id), vehicle] as [string, any])
    );
    const mitraMap = new Map<string, string>(
      (mitras.data ?? []).map(
        (mitra: any) => [String(mitra.user_id), String(mitra.business_name ?? '')] as [string, string]
      )
    );
    return orders.map((order) => ({
      ...order,
      renter: renterMap.get(order.renterId ?? '') ?? order.renter,
      vehicle: vehicleMap.get(order.vehicleId ?? '')?.name ?? order.vehicle,
      plate: vehicleMap.get(order.vehicleId ?? '')?.plate ?? order.plate,
      mitraName: mitraMap.get(order.mitraId ?? '') ?? order.mitraName,
    }));
  } catch (error) {
    throw error instanceof Error ? error : new Error('Gagal memuat pesanan');
  }
}

export async function fetchOrderById(id: string): Promise<Order | null> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return null;

    const order = mapDbToOrder(data as DbOrder);
    const [vehicleResult, mitraResult, renterNames] = await Promise.all([
      supabase.from('vehicles').select('name, plate').eq('id', order.vehicleId ?? '').maybeSingle(),
      supabase.from('mitra_profiles').select('business_name').eq('user_id', order.mitraId ?? '').maybeSingle(),
      fetchProfileNames(order.renterId ? [order.renterId] : []),
    ]);
    if (vehicleResult.error) throw new Error(vehicleResult.error.message);
    if (mitraResult.error) throw new Error(mitraResult.error.message);

    return {
      ...order,
      renter: renterNames.get(order.renterId ?? '') || order.renter,
      vehicle: vehicleResult.data?.name || order.vehicle,
      plate: vehicleResult.data?.plate || order.plate,
      mitraName: mitraResult.data?.business_name || order.mitraName,
    };
  } catch (error) {
    throw error instanceof Error ? error : new Error('Gagal memuat pesanan');
  }
}

export async function createOrder(payload: {
  renter_id: string;
  mitra_id?: string;
  vehicle_id: string;
  start_date: string;
  end_date: string;
  days: number;
  daily_price: number;
  subtotal: number;
  deposit?: number;
  total: number;
  payment_method?: string;
  notes?: string;
}): Promise<Order> {
  try {
    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .select('id')
      .eq('id', payload.vehicle_id)
      .maybeSingle();
    if (vehicleError) throw new Error(`Kendaraan tidak dapat diverifikasi: ${vehicleError.message}`);
    if (!vehicle) throw new Error(`Kendaraan tidak ditemukan di project Supabase aktif (ID: ${payload.vehicle_id})`);

    const { data, error } = await supabase.rpc('create_order_atomic', {
      p_vehicle_id: payload.vehicle_id,
      p_start_date: payload.start_date,
      p_end_date: payload.end_date,
      p_payment_method: payload.payment_method ?? null,
      p_notes: payload.notes ?? null,
    });

    if (error) {
      const code = error.message.match(/VEHICLE_[A-Z_]+|AUTH_REQUIRED|INVALID_DATE_RANGE/)?.[0];
      throw new Error(code ? `Booking ditolak: ${code}` : error.message);
    }
    if (!data) throw new Error('Pesanan tidak berhasil dibuat');

    return mapDbToOrder(data as DbOrder);
  } catch (error) {
    throw error instanceof Error ? error : new Error('Gagal membuat pesanan');
  }
}

export async function updateOrderStatus(id: string, status: Database['public']['Tables']['orders']['Row']['status']) {
  const { data, error } = await (supabase.rpc as any)('transition_order_status', {
    p_order_id: id,
    p_status: status,
  });

  if (!error && data) {
    return data;
  }

  // Fallback ke pembaruan tabel langsung jika RPC dibatasi atau belum dideploy
  const { data: updateData, error: updateError } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .maybeSingle();

  if (updateError) {
    throw new Error(updateError.message);
  }
  return updateData;
}

export function subscribeToOrders(userId: string, onUpdate: () => void) {
  const channelId = `orders_${userId}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const channel = supabase
    .channel(channelId)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'orders', filter: `renter_id=eq.${userId}` },
      () => onUpdate()
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'orders', filter: `mitra_id=eq.${userId}` },
      () => onUpdate()
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}
