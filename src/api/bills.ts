import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { requireUserId, toNumber } from './client';
import type { Bill } from '@/data/types';

export const billsKey = ['bills'] as const;

interface BillRow {
  id: string;
  name: string;
  category: string;
  icon: string;
  amount: number | string;
  due_date: string;
  paid_at: string | null;
  recurring: boolean;
  color: string;
}

/**
 * Status is not stored — deriving it keeps 'overdue' correct as time passes
 * without needing any mark-as-paid UI.
 */
function deriveStatus(dueDate: string, paidAt: string | null): Bill['status'] {
  if (paidAt) return 'paid';
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  return new Date(dueDate) < startOfToday ? 'overdue' : 'upcoming';
}

function mapBill(row: BillRow): Bill {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    icon: row.icon,
    amount: toNumber(row.amount),
    dueDate: row.due_date,
    status: deriveStatus(row.due_date, row.paid_at),
    recurring: row.recurring,
    color: row.color,
  };
}

export function useBills() {
  return useQuery({
    queryKey: billsKey,
    queryFn: async (): Promise<Bill[]> => {
      const { data, error } = await supabase
        .from('bills')
        .select('id, name, category, icon, amount, due_date, paid_at, recurring, color')
        .order('due_date', { ascending: true });
      if (error) throw error;
      return (data as BillRow[]).map(mapBill);
    },
  });
}

export interface NewBill {
  name: string;
  category: string;
  icon: string;
  amount: number;
  dueDate: string;
  recurring: boolean;
  color: string;
}

export function useCreateBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: NewBill) => {
      const userId = await requireUserId();
      const { error } = await supabase.from('bills').insert({
        user_id: userId,
        name: input.name,
        category: input.category,
        icon: input.icon,
        amount: input.amount,
        due_date: input.dueDate,
        recurring: input.recurring,
        color: input.color,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: billsKey }),
  });
}
