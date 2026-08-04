export const formatBDT = (amount: number, compact = false) => {
  if (compact && Math.abs(amount) >= 100000) {
    return `৳${(amount / 100000).toFixed(1)}L`;
  }
  if (compact && Math.abs(amount) >= 1000) {
    return `৳${(amount / 1000).toFixed(1)}k`;
  }
  return `৳${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
};

interface DateLabels {
  today: string;
  yesterday: string;
  daysAgo: (n: number) => string;
  locale: string;
}

const DEFAULT_LABELS: DateLabels = {
  today: 'Today',
  yesterday: 'Yesterday',
  daysAgo: (n) => `${n} days ago`,
  locale: 'en-US',
};

/**
 * Relative labels are injected rather than hardcoded so Bangla users don't get
 * English dates. `today` is computed per call — capturing it at module load
 * makes "Today" go stale in a long-running session.
 */
export const formatDate = (iso: string, labels: DateLabels = DEFAULT_LABELS) => {
  const d = new Date(iso);
  const diff = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (diff === 0) return labels.today;
  if (diff === 1) return labels.yesterday;
  if (diff < 7) return labels.daysAgo(diff);
  return d.toLocaleDateString(labels.locale, { month: 'short', day: 'numeric' });
};
