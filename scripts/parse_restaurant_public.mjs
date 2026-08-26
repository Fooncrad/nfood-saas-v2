import fs from "node:fs";
import { parse } from "@babel/parser";
const source = fs.readFileSync("client/src/pages/RestaurantPublic.tsx", "utf8");
try {
  parse(source, { sourceType: "module", plugins: ["typescript", "jsx"] });
  console.log("TSX parse OK");
} catch (error) {
  console.error(error.message);
  console.error(`line=${error.loc?.line} column=${error.loc?.column}`);
  const line = source.split("\\n")[Math.max(0, (error.loc?.line ?? 1) - 1)] ?? "";
  console.error(line.slice(Math.max(0, (error.loc?.column ?? 0) - 220), (error.loc?.column ?? 0) + 360));
  process.exitCode = 1;
}
