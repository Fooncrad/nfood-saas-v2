export type PosPaymentMethod = "cash" | "card" | "bank_transfer" | "online" | "other";

export type PosPaymentSplit = {
  method: PosPaymentMethod;
  amountCents: number;
};

export function normalizePaymentSplits(
  splits: Array<{ method: PosPaymentMethod; amount: string | number }>
): PosPaymentSplit[] {
  return splits
    .map(split => ({
      method: split.method,
      amountCents: Math.round(Number(split.amount) * 100),
    }))
    .filter(split => Number.isFinite(split.amountCents) && split.amountCents > 0);
}

export function getPaymentSplitTotalCents(splits: PosPaymentSplit[]) {
  return splits.reduce((sum, split) => sum + split.amountCents, 0);
}

export function getPaymentSplitRemainingCents(
  totalCents: number,
  splits: PosPaymentSplit[]
) {
  return Math.max(0, Math.round(totalCents) - getPaymentSplitTotalCents(splits));
}

export function hasExactPaymentSplit(
  totalCents: number,
  splits: PosPaymentSplit[]
) {
  return splits.length > 0 && getPaymentSplitTotalCents(splits) === Math.round(totalCents);
}

export function formatPaymentCents(cents: number) {
  return (Math.max(0, Math.round(cents)) / 100).toFixed(2);
}
