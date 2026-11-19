import { supabase } from '../lib/supabase';

export async function fetchUnavailableDates(vehicleId: string, from: string, to: string): Promise<string[]> {
  const { data, error } = await supabase.rpc('get_vehicle_unavailable_dates', {
    p_vehicle_id: vehicleId,
    p_from: from,
    p_to: to,
  });
  if (error) throw new Error(error.message);
  return (data ?? []).map((item: { date: string }) => item.date);
}

export async function fetchVehicleBlocks(
  vehicleId: string,
  from: string,
  to: string
): Promise<string[]> {
  const { data, error } = await supabase
    .from('vehicle_availability')
    .select('date, is_blocked')
    .eq('vehicle_id', vehicleId)
    .gte('date', from)
    .lte('date', to);
  if (error) throw new Error(error.message);
  return (data ?? []).filter((row) => row.is_blocked).map((row) => row.date);
}

export async function setVehicleDateBlocked(
  vehicleId: string,
  date: string,
  blocked: boolean
): Promise<void> {
  if (blocked) {
    const { error } = await supabase
      .from('vehicle_availability')
      .upsert({ vehicle_id: vehicleId, date, is_blocked: true }, { onConflict: 'vehicle_id,date' });
    if (error) throw new Error(error.message);
    return;
  }
  const { error } = await supabase
    .from('vehicle_availability')
    .delete()
    .eq('vehicle_id', vehicleId)
    .eq('date', date);
  if (error) throw new Error(error.message);
}
