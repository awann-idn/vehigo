import { supabase } from '../lib/supabase';

// Nama pengguna dibaca dari view terbatas `profile_directory` (0008).
// Jika view belum tersedia, aplikasi tetap berjalan tanpa nama tampilan.
export async function fetchProfileNames(ids: string[]): Promise<Map<string, string>> {
  const unique = Array.from(new Set(ids.filter(Boolean)));
  if (unique.length === 0) return new Map();

  const { data, error } = await (supabase as any)
    .from('profile_directory')
    .select('id, full_name')
    .in('id', unique);

  if (error || !data) return new Map();

  return new Map<string, string>(
    data.map((row: any) => [String(row.id), String(row.full_name ?? '')] as [string, string])
  );
}
