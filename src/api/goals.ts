import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { requireUserId, toNumber } from './client';
import type { Goal } from '@/data/types';

export const goalsKey = ['goals'] as const;

interface GoalRow {
  id: string;
  name: string;
  target: number | string;
  saved: number | string;
  deadline: string;
  icon: string;
  color: string;
  monthly_contribution: number | string | null;
}

function mapGoal(row: GoalRow): Goal {
  return {
    id: row.id,
    name: row.name,
    target: toNumber(row.target),
    saved: toNumber(row.saved),
    deadline: row.deadline,
    icon: row.icon,
    color: row.color,
    monthlyContribution:
      row.monthly_contribution === null ? undefined : toNumber(row.monthly_contribution),
  };
}

export function useGoals() {
  return useQuery({
    queryKey: goalsKey,
    queryFn: async (): Promise<Goal[]> => {
      const { data, error } = await supabase
        .from('goals')
        .select('id, name, target, saved, deadline, icon, color, monthly_contribution')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as GoalRow[]).map(mapGoal);
    },
  });
}

export interface NewGoal {
  name: string;
  target: number;
  deadline: string;
  icon: string;
  color: string;
  monthlyContribution?: number;
}

export function useCreateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: NewGoal) => {
      const userId = await requireUserId();
      const { error } = await supabase.from('goals').insert({
        user_id: userId,
        name: input.name,
        target: input.target,
        deadline: input.deadline,
        icon: input.icon,
        color: input.color,
        monthly_contribution: input.monthlyContribution ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: goalsKey }),
  });
}

export function useAddToGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    // Uses an RPC so the increment is atomic — a read-modify-write here would
    // silently drop concurrent deposits.
    mutationFn: async ({ goalId, amount }: { goalId: string; amount: number }) => {
      const { error } = await supabase.rpc('add_to_goal', {
        goal_id: goalId,
        deposit: amount,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: goalsKey }),
  });
}
