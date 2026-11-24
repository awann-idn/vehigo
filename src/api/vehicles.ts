import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';
import { Vehicle, VehicleStatus } from './types';

type DbVehicle = Database['public']['Tables']['vehicles']['Row'];

function mapDbToVehicle(v: DbVehicle, mitraName = ''): Vehicle {
  const statusMap: Record<string, VehicleStatus> = {
    tersedia: 'Tersedia',
    disewa: 'Disewa',
    maintenance: 'Maintenance',
  };

  return {
    id: v.id,
    name: v.name,
    brand: v.brand || 'Umum',
    year: v.year || 2023,
    plate: v.plate,
    pricePerDay: Number(v.price_per_day),
    status: statusMap[v.status] || 'Tersedia',
    transmission: (v.transmission as 'Manual' | 'Matic') || 'Matic',
    seats: v.seats,
    rating: 0,
    mitra: mitraName,
    location: v.location || '',
    tint: '#DFE7F5',
    mitraId: v.mitra_id,
  };
}

export async function fetchVehicles(mitraId?: string): Promise<Vehicle[]> {
  try {
    let query = supabase
      .from('vehicles')
      .select('*')
      .order('created_at', { ascending: false });

    if (mitraId) {
      query = query.eq('mitra_id', mitraId);
    } else {
      // Catalog renter hanya menampilkan unit yang benar-benar bisa dipesan.
      query = query.eq('status', 'tersedia');
    }

    const { data, error } = await query;

    if (error) throw new Error(error.message);
    if (!data) return [];

    const vehicles = data as DbVehicle[];
    const mitraIds = [...new Set(vehicles.map((vehicle) => vehicle.mitra_id))];
    const { data: mitras, error: mitraError } = mitraIds.length
      ? await supabase
          .from('mitra_profiles')
          .select('user_id, business_name')
          .in('user_id', mitraIds)
      : { data: [], error: null };

    if (mitraError) throw new Error(mitraError.message);
    const mitraNames = new Map(
      (mitras ?? []).map((mitra) => [mitra.user_id, mitra.business_name])
    );

    const vehicleIds = vehicles.map((vehicle) => vehicle.id);
    const { data: reviews, error: reviewError } = vehicleIds.length
      ? await supabase
          .from('reviews')
          .select('target_id, rating')
          .eq('target_type', 'vehicle')
          .in('target_id', vehicleIds)
      : { data: [], error: null };
    if (reviewError) throw new Error(reviewError.message);

    const ratings = new Map<string, { total: number; count: number }>();
    (reviews ?? []).forEach((review) => {
      const current = ratings.get(review.target_id) ?? { total: 0, count: 0 };
      ratings.set(review.target_id, { total: current.total + review.rating, count: current.count + 1 });
    });

    return vehicles.map((vehicle) => {
      const mapped = mapDbToVehicle(vehicle, mitraNames.get(vehicle.mitra_id) ?? '');
      const aggregate = ratings.get(vehicle.id);
      return {
        ...mapped,
        rating: aggregate ? aggregate.total / aggregate.count : 0,
      };
    });
  } catch (error) {
    throw error instanceof Error ? error : new Error('Gagal memuat kendaraan');
  }
}

export async function fetchVehicleById(id: string): Promise<Vehicle | null> {
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return null;

    const [mitraResult, reviewsResult] = await Promise.all([
      supabase
        .from('mitra_profiles')
        .select('business_name')
        .eq('user_id', data.mitra_id)
        .maybeSingle(),
      supabase
        .from('reviews')
        .select('rating')
        .eq('target_type', 'vehicle')
        .eq('target_id', data.id),
    ]);
    if (mitraResult.error) throw new Error(mitraResult.error.message);
    if (reviewsResult.error) throw new Error(reviewsResult.error.message);

    const vehicle = mapDbToVehicle(data as DbVehicle, mitraResult.data?.business_name ?? '');
    const reviewRows = reviewsResult.data ?? [];
    return {
      ...vehicle,
      rating: reviewRows.length
        ? reviewRows.reduce((sum, review) => sum + review.rating, 0) / reviewRows.length
        : 0,
    };
  } catch (error) {
    throw error instanceof Error ? error : new Error('Gagal memuat kendaraan');
  }
}

export async function createVehicle(payload: {
  mitra_id: string;
  name: string;
  brand?: string;
  year?: number;
  plate: string;
  transmission: string;
  seats?: number;
  price_per_day: number;
  location?: string;
  description?: string;
}) {
  const { data, error } = await supabase
    .from('vehicles')
    .insert([
      {
        ...payload,
        status: 'tersedia',
        seats: payload.seats || 5,
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export async function updateVehicle(
  id: string,
  payload: {
    name: string;
    plate: string;
    year?: number;
    price_per_day: number;
    transmission: string;
    seats?: number;
    location?: string;
    description?: string;
  }
) {
  const { data, error } = await supabase
    .from('vehicles')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateVehicleStatus(id: string, status: 'tersedia' | 'disewa' | 'maintenance') {
  const { data, error } = await supabase
    .from('vehicles')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export function subscribeToVehicles(onUpdate: () => void) {
  const channelId = `vehicles_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const channel = supabase
    .channel(channelId)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'vehicles' },
      () => onUpdate()
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}
