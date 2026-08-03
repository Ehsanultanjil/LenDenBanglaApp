import { supabase } from '@/lib/supabase';

/**
 * Every table is RLS-scoped to auth.uid(), and inserts must carry a matching
 * user_id or the WITH CHECK policy rejects them.
 */
export async function requireUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  const userId = data.session?.user.id;
  if (!userId) throw new Error('Not signed in');
  return userId;
}

/** Postgres `numeric` comes back as a string over the wire. */
export function toNumber(value: number | string | null): number {
  if (value === null) return 0;
  return typeof value === 'string' ? parseFloat(value) : value;
}
