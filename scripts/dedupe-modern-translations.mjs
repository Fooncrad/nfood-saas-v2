import fs from "node:fs";

const path = "client/src/contexts/LanguageContext.tsx";
const source = fs.readFileSync(path, "utf8");
const start = source.indexOf("const modernUiTranslations");
const end = source.indexOf("function applyLegacyUiTranslations", start);
if (start < 0 || end < 0) throw new Error("modern translation block not found");
const block = source.slice(start, end);
const cleaned = block.replace(/(\s+)("[^"]+"):\s*("(?:[^"\\]|\\.)*")(?=,)/g, (full, whitespace, key, value, offset, whole) => {
  const before = whole.slice(0, offset);
  return before.includes(`${key}:`) ? "" : full;
});
if (cleaned === block) throw new Error("no duplicate translation keys removed");
fs.writeFileSync(path, source.slice(0, start) + cleaned + source.slice(end));
