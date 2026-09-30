export function resolveOrderItemName(snapshot: string | null | undefined, currentName: string | null | undefined, fallback: string) {
  const historical = snapshot?.trim();
  if (historical) return historical;
  const current = currentName?.trim();
  return current || fallback;
}
