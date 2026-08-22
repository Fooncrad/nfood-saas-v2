import { readFileSync, writeFileSync } from "node:fs";
const path = "client/src/pages/RestaurantPublic.tsx";
const source = readFileSync(path, "utf8");
const start = source.indexOf('<section id="home"');
const end = source.indexOf("    <footer", start);
if (start < 0 || end < 0) throw new Error("public hero/footer boundary not found");
const replacement = '<div id="home" className="h-1" aria-hidden="true" />\n';
writeFileSync(path, source.slice(0, start) + replacement + source.slice(end));
