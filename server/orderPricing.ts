export type OrderPricing = {
  subtotalCents: number;
  discountPercent: number;
  discountCents: number;
  taxPercent: number;
  taxCents: number;
  totalCents: number;
};

const clampPercent = (value: number) => Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0));

export function getAppliedDiscountPercent(defaultDiscountPercent: number | string = 0, promotionDiscountPercent: number | string = 0) { return Math.max(clampPercent(Number(defaultDiscountPercent)), clampPercent(Number(promotionDiscountPercent))); }

export function calculateOrderPricing(items: Array<{ unitPrice: number | string; quantity: number }>, discountPercent: number | string = 0, taxPercent: number | string = 0): OrderPricing {
  const subtotalCents = items.reduce((sum, item) => sum + Math.max(0, Math.round(Number(item.unitPrice) * 100)) * Math.max(0, Math.trunc(item.quantity)), 0);
  const safeDiscountPercent = clampPercent(Number(discountPercent));
  const safeTaxPercent = clampPercent(Number(taxPercent));
  const discountCents = Math.round(subtotalCents * safeDiscountPercent / 100);
  const taxableCents = Math.max(0, subtotalCents - discountCents);
  const taxCents = Math.round(taxableCents * safeTaxPercent / 100);
  return { subtotalCents, discountPercent: safeDiscountPercent, discountCents, taxPercent: safeTaxPercent, taxCents, totalCents: taxableCents + taxCents };
}

export const centsToMoney = (cents: number) => (Math.max(0, Math.round(cents)) / 100).toFixed(2);
