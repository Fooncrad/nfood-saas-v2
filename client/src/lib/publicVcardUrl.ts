export function publicVcardUrl(origin: string, slug: string): string {
  return `${origin.replace(/\/+$/, "")}/vcard/${encodeURIComponent(slug)}`;
}

export function legacyCustomerUrl(origin: string, slug: string): string {
  return `${origin.replace(/\/+$/, "")}/customer/${encodeURIComponent(slug)}`;
}

