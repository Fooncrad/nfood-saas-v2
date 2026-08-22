import fs from "node:fs";

const path = "client/src/pages/RestaurantPublic.tsx";
const source = fs.readFileSync(path, "utf8");
const heroPattern = /\n\s*(<section id="home"[\s\S]*?<\/section>)\n\s*\n\s*<main/;
const match = source.match(heroPattern);
if (!match) throw new Error("Public menu hero section not found");
const withoutHero = source.replace(heroPattern, "\n\n    <main");
if (withoutHero === source) throw new Error("Public menu was not changed");
const footerMarker = "\n\n    <footer";
const hero = `\n\n    ${match[1]}`;
const reordered = withoutHero.replace(footerMarker, `${hero}${footerMarker}`);
if (reordered === withoutHero) throw new Error("Public menu footer marker not found");
fs.writeFileSync(path, reordered);
