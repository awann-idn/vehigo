import { supabase } from '../lib/supabase';
import { DocStatus, DocType } from '../lib/database.types';

export type MyDocument = {
  kind: DocType;
  status: DocStatus;
};

export async function fetchMyDocuments(userId: string): Promise<MyDocument[]> {
  const { data, error } = await supabase
    .from('documents')
    .select('kind, status, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);

  const latest = new Map<DocType, DocStatus>();
  (data ?? []).forEach((row) => {
    if (!latest.has(row.kind)) latest.set(row.kind, row.status);
  });
  return Array.from(latest.entries()).map(([kind, status]) => ({ kind, status }));
}
