export interface DebtPayment {
  date: string;
  amount: number;
}

export interface Debt {
  id: string;
  direction: 'owe' | 'owed';
  name: string;
  phone?: string;
  amount: number;
  remaining: number;
  /** Derived from the most recent debt_payments row, never stored. */
  lastPayment?: string;
  lastPaymentDate?: string;
  history: DebtPayment[];
}

export interface Bill {
  id: string;
  name: string;
  category: string;
  icon: string;
  amount: number;
  dueDate: string;
  /** Derived from paid_at + due_date, never stored. */
  status: 'upcoming' | 'paid' | 'overdue';
  recurring: boolean;
  color: string;
}

export interface Goal {
  id: string;
  name: string;
  target: number;
  saved: number;
  deadline: string;
  icon: string;
  color: string;
  monthlyContribution?: number;
}
