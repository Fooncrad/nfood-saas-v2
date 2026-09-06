import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const localeDir = path.join(root, "client", "src", "locales");
const locales = ["ar", "en", "fr"];

function flatten(value, prefix = "", output = {}) {
  for (const [key, item] of Object.entries(value)) {
    const next = prefix ? `${prefix}.${key}` : key;
    if (typeof item === "string") output[next] = item;
    else if (item && typeof item === "object" && !Array.isArray(item)) flatten(item, next, output);
  }
  return output;
}

const catalogs = Object.fromEntries(
  await Promise.all(locales.map(async (locale) => [locale, JSON.parse(await readFile(path.join(localeDir, `${locale}.json`), "utf8"))]))
);
const flat = Object.fromEntries(locales.map((locale) => [locale, flatten(catalogs[locale])]));
const baseKeys = new Set(Object.keys(flat.ar));
const errors = [];
for (const locale of locales) {
  const keys = new Set(Object.keys(flat[locale]));
  for (const key of baseKeys) if (!keys.has(key)) errors.push(`${locale}: missing ${key}`);
  for (const key of keys) if (!baseKeys.has(key)) errors.push(`ar: missing ${key} required by ${locale}`);
  for (const [key, value] of Object.entries(flat[locale])) if (!String(value).trim()) errors.push(`${locale}: empty ${key}`);
}
if (errors.length) {
  console.error(`i18n catalog check failed (${errors.length})`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`i18n catalogs are aligned: ${locales.join(", ")} · ${baseKeys.size} keys`);
