import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { requireUserId, toNumber } from './client';
import type { Debt } from '@/data/types';

export const debtsKey = ['debts'] as const;

interface DebtRow {
  id: string;
  direction: 'owe' | 'owed';
  name: string;
  phone: string | null;
  amount: number | string;
  remaining: number | string;
  debt_payments: { amount: number | string; paid_at: string }[] | null;
}

function mapDebt(row: DebtRow): Debt {
  const history = (row.debt_payments ?? [])
    .map((p) => ({ date: p.paid_at, amount: toNumber(p.amount) }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const latest = history[0];

  return {
    id: row.id,
    direction: row.direction,
    name: row.name,
    phone: row.phone ?? undefined,
    amount: toNumber(row.amount),
    remaining: toNumber(row.remaining),
    // Derived from the ledger rather than stored on the debt row.
    lastPayment: latest ? String(latest.amount) : undefined,
    lastPaymentDate: latest?.date,
    history,
  };
}

export function useDebts() {
  return useQuery({
    queryKey: debtsKey,
    queryFn: async (): Promise<Debt[]> => {
      const { data, error } = await supabase
        .from('debts')
        .select('id, direction, name, phone, amount, remaining, debt_payments(amount, paid_at)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as DebtRow[]).map(mapDebt);
    },
  });
}

export interface NewDebt {
  direction: 'owe' | 'owed';
  name: string;
  phone?: string;
  amount: number;
}

export function useCreateDebt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: NewDebt) => {
      const userId = await requireUserId();
      const { error } = await supabase.from('debts').insert({
        user_id: userId,
        direction: input.direction,
        name: input.name,
        phone: input.phone ?? null,
        amount: input.amount,
        remaining: input.amount,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: debtsKey }),
  });
}
