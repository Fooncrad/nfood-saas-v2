import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const localeDir = path.join(root, "client", "src", "locales");
const args = Object.fromEntries(process.argv.slice(2).reduce((pairs, value, index, values) => {
  if (!value.startsWith("--")) return pairs;
  pairs.push([value.slice(2), values[index + 1] ?? ""]);
  return pairs;
}, []));
const key = String(args.key ?? "").trim();
if (!key || !args.ar || !args.en || !args.fr) {
  console.error("Usage: pnpm i18n:add -- --key menu.newLabel --ar \"...\" --en \"...\" --fr \"...\"");
  process.exit(1);
}
const parts = key.split(".").filter(Boolean);
if (!parts.length || parts.some((part) => !/^[A-Za-z][A-Za-z0-9_-]*$/.test(part))) {
  console.error("Invalid translation key. Use dot notation such as menu.newLabel.");
  process.exit(1);
}
for (const locale of ["ar", "en", "fr"]) {
  const file = path.join(localeDir, `${locale}.json`);
  const catalog = JSON.parse(await readFile(file, "utf8"));
  let cursor = catalog;
  for (const part of parts.slice(0, -1)) cursor = cursor[part] ??= {};
  const leaf = parts.at(-1);
  if (typeof cursor[leaf] === "string") {
    console.error(`${locale}: ${key} already exists`);
    process.exit(1);
  }
  cursor[leaf] = String(args[locale]);
  await writeFile(file, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");
}
console.log(`Added ${key} to ar.json, en.json, and fr.json. Run pnpm i18n:check.`);
