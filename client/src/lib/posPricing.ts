export function parsePriceToCents(value: number | string) {
  const normalized = typeof value === "string" ? value.trim().replace(",", ".") : value;
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.round(parsed * 100);
}

export function formatCents(cents: number) {
  return (Math.max(0, Math.round(cents)) / 100).toFixed(2);
}

export function calculateCartCents(items: Array<{ price: number | string; quantity: number }>) {
  return items.reduce((total, item) => total + parsePriceToCents(item.price) * Math.max(0, Math.trunc(item.quantity)), 0);
}
