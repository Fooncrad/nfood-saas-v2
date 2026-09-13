import { URL } from "node:url";

export type ImportedMenuItem = {
  category: string;
  name: string;
  description?: string;
  price: string;
  imageUrl?: string;
};

export type ImportedMenuPreview = {
  sourceUrl: string;
  title?: string;
  categories: string[];
  items: ImportedMenuItem[];
  warnings: string[];
};

function isPrivateHost(hostname: string) {
  const host = hostname.toLowerCase();
  return host === "localhost" || host === "127.0.0.1" || host === "::1" || host.endsWith(".local") || /^10\./.test(host) || /^192\.168\./.test(host) || /^172\.(1[6-9]|2\d|3[0-1])\./.test(host);
}

function cleanText(value: unknown) {
  return String(value ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function absoluteUrl(value: unknown, base: string) {
  if (!value) return undefined;
  try {
    const url = new URL(String(value), base);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : undefined;
  } catch { return undefined; }
}

function parsePriceText(value: unknown): string | undefined {
  const matches = cleanText(value).match(/\d+(?:[.,]\d{1,2})?/g) ?? [];
  const parsed = matches.map(entry => Number(entry.replace(",", "."))).filter(entry => Number.isFinite(entry) && entry >= 0);
  return parsed.length ? parsed[0].toFixed(2) : undefined;
}

function parseHtmlMenu(html: string, base: string, output: ImportedMenuItem[], categories: Set<string>) {
  const sectionPattern = /<div[^>]*class=["'][^"']*singleCategoryHeader[^"']*["'][^>]*>[\s\S]*?<h4[^>]*>([\s\S]*?)<\/h4>[\s\S]*?<\/div>/gi;
  const sectionHeaders: Array<{ index: number; name: string }> = [];
  for (const match of Array.from(html.matchAll(sectionPattern))) {
    const name = cleanText(match[1]);
    if (name) sectionHeaders.push({ index: match.index ?? 0, name });
  }
  const cardStarts = Array.from(html.matchAll(/<div[^>]*class=["'][^"']*modern_item_card[^"']*["'][^>]*>/gi));
  for (let cardIndex = 0; cardIndex < cardStarts.length; cardIndex += 1) {
    const start = cardStarts[cardIndex].index ?? 0;
    const end = cardStarts[cardIndex + 1]?.index ?? html.length;
    const block = html.slice(start, end);
    const index = start;
    const category = [...sectionHeaders].reverse().find(section => section.index < index)?.name || "عام";
    const name = cleanText(block.match(/<h[1-6][^>]*class=["'][^"']*item_title[^"']*["'][^>]*>([\s\S]*?)<\/h[1-6]>/i)?.[1]);
    const description = cleanText(block.match(/<div[^>]*class=["'][^"']*item_desc[^"']*["'][^>]*>([\s\S]*?)<\/div>/i)?.[1]);
    const price = parsePriceText(block.match(/<div[^>]*class=["'][^"']*priceGroup[^"']*["'][^>]*>([\s\S]*?)<\/div>/i)?.[1]);
    const image = block.match(/(?:data-src|data-original|src)=["']([^"']+)["']/i)?.[1];
    if (name && price) { categories.add(category); output.push({ category, name, description: description || undefined, price, imageUrl: absoluteUrl(image, base) }); }
  }
}

function parseMenuCardLayout(html: string, base: string, output: ImportedMenuItem[], categories: Set<string>) {
  const sectionPattern = /<div[^>]*class=["'][^"']*singleCategoryHeader[^"']*["'][^>]*>[\s\S]*?<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>[\s\S]*?<\/div>/gi;
  const sectionHeaders: Array<{ index: number; name: string }> = [];
  for (const match of Array.from(html.matchAll(sectionPattern))) {
    const name = cleanText(match[1]);
    if (name) sectionHeaders.push({ index: match.index ?? 0, name });
  }
  const cardStarts = Array.from(html.matchAll(/<div[^>]*class=["'][^"']*menu-card(?![\w-])[^"']*["'][^>]*>/gi));
  for (let cardIndex = 0; cardIndex < cardStarts.length; cardIndex += 1) {
    const start = cardStarts[cardIndex].index ?? 0;
    const end = cardStarts[cardIndex + 1]?.index ?? html.length;
    const block = html.slice(start, end);
    const index = start;
    const category = [...sectionHeaders].reverse().find(section => section.index < index)?.name || "عام";
    const name = cleanText(block.match(/<h[1-6][^>]*class=["'][^"']*menu-card-title[^"']*["'][^>]*>([\s\S]*?)<\/h[1-6]>/i)?.[1]);
    const description = cleanText(block.match(/<div[^>]*class=["'][^"']*menu-card-sub[^"']*["'][^>]*>([\s\S]*?)<\/div>/i)?.[1]);
    const price = parsePriceText(block.match(/<[^>]*class=["'][^"']*menu-card-price[^"']*["'][^>]*>([\s\S]*?)<\/[a-z0-9]+>/i)?.[1]);
    const image = block.match(/(?:data-src|data-original|src)=["']([^"']+)["']/i)?.[1];
    if (name && price) { categories.add(category); output.push({ category, name, description: description || undefined, price, imageUrl: absoluteUrl(image, base) }); }
  }
}

function priceFromOffer(offer: any): string | undefined {
  const raw = offer?.price ?? offer?.lowPrice ?? offer?.highPrice;
  const value = Number(String(raw ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(value) && value >= 0 ? value.toFixed(2) : undefined;
}

function walkJsonLd(value: any, base: string, output: ImportedMenuItem[], categories: Set<string>) {
  if (!value) return;
  if (Array.isArray(value)) { value.forEach(item => walkJsonLd(item, base, output, categories)); return; }
  if (typeof value !== "object") return;
  const type = String(value["@type"] ?? "").toLowerCase();
  if (type.includes("menu") && Array.isArray(value.hasMenuSection)) value.hasMenuSection.forEach((section: any) => walkJsonLd(section, base, output, categories));
  if (type.includes("menusection")) {
    const category = cleanText(value.name) || "عام";
    categories.add(category);
    const entries = Array.isArray(value.hasMenuItem) ? value.hasMenuItem : [];
    entries.forEach((item: any) => walkJsonLd({ ...item, __category: category }, base, output, categories));
  }
  if (type.includes("menuitem") || value.offers) {
    const name = cleanText(value.name);
    const price = priceFromOffer(Array.isArray(value.offers) ? value.offers[0] : value.offers);
    if (name && price) {
      const category = cleanText(value.__category) || "عام";
      categories.add(category);
      output.push({ category, name, description: cleanText(value.description) || undefined, price, imageUrl: absoluteUrl(value.image, base) });
    }
  }
  if (value.itemListElement) walkJsonLd(value.itemListElement, base, output, categories);
  if (value.mainEntity) walkJsonLd(value.mainEntity, base, output, categories);
}

export async function previewMenuFromUrl(sourceUrl: string): Promise<ImportedMenuPreview> {
  const parsed = new URL(sourceUrl);
  if (!["http:", "https:"].includes(parsed.protocol) || isPrivateHost(parsed.hostname)) throw new Error("رابط المصدر يجب أن يكون موقعًا عامًا صالحًا");
  const response = await fetch(parsed.toString(), { headers: { accept: "text/html,application/xhtml+xml" }, redirect: "follow", signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`تعذر قراءة الموقع المصدر (${response.status})`);
  const html = (await response.text()).slice(0, 4_000_000);
  const items: ImportedMenuItem[] = [];
  const categories = new Set<string>();
  const warnings: string[] = [];
  const jsonLdMatches = html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  Array.from(jsonLdMatches).forEach(match => {
    try { walkJsonLd(JSON.parse(match[1]), parsed.toString(), items, categories); } catch { warnings.push("تعذر قراءة جزء JSON-LD من المصدر"); }
  });
  if (!items.length) {
    parseHtmlMenu(html, parsed.toString(), items, categories);
    parseMenuCardLayout(html, parsed.toString(), items, categories);
  }
  const unique = new Map<string, ImportedMenuItem>();
  for (const item of items) unique.set(`${item.category.toLowerCase()}::${item.name.toLowerCase()}::${item.price}`, item);
  if (!unique.size) warnings.push("لم يُعثر على عناصر قابلة للاستيراد؛ قد يحتاج الموقع إلى مراجعة يدوية");
  const title = cleanText(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]);
  return { sourceUrl: parsed.toString(), title: title || undefined, categories: Array.from(categories).slice(0, 200), items: Array.from(unique.values()).slice(0, 1000), warnings: Array.from(new Set(warnings)) };
}
