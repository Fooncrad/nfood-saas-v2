export function publicMenuUrl(origin: string, slug: string): string {
  return `${origin.replace(/\/+$/, "")}/restaurant/${encodeURIComponent(slug)}`;
}
