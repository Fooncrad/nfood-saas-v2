import fs from "node:fs";
const line = fs.readFileSync("server/routers.ts", "utf8").split("\n")[100];
let stack = [];
let quote = null;
let escaped = false;
for (let i = 0; i < line.length; i += 1) {
  const c = line[i];
  if (quote) {
    if (escaped) escaped = false;
    else if (c === "\\") escaped = true;
    else if (c === quote) quote = null;
    continue;
  }
  if (c === "\"" || c === "'" || c === "`") { quote = c; continue; }
  if ("({[".includes(c)) stack.push({ c, i });
  if (")}\]".includes(c)) {
    const expected = c === ")" ? "(" : c === "}" ? "{" : "[";
    const last = stack.pop();
    if (!last || last.c !== expected) console.log("mismatch", c, i, last);
  }
}
console.log({ length: line.length, remaining: stack, quote });
console.log(line.slice(Math.max(0, 3600), Math.min(line.length, 4200)));
