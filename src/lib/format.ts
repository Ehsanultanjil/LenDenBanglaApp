export const formatBDT = (amount: number, compact = false) => {
  if (compact && Math.abs(amount) >= 100000) {
    return `৳${(amount / 100000).toFixed(1)}L`;
  }
  if (compact && Math.abs(amount) >= 1000) {
    return `৳${(amount / 1000).toFixed(1)}k`;
  }
  return `৳${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
};

export const formatDate = (iso: string) => {
  const d = new Date(iso);
  const diff = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return `${diff} days ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};
