export function buildStableQrMenuUrl(origin: string, stableIdentifier: string, token: string) {
  const normalizedOrigin = origin.replace(/\/+$/, "");
  return `${normalizedOrigin}/menu/${encodeURIComponent(stableIdentifier)}?qr=${encodeURIComponent(token)}`;
}
