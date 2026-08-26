import fs from "node:fs";
const file = fs.readFileSync("client/src/pages/RestaurantPublic.tsx", "utf8");
for (const needle of ["<img", "object-cover", "object-contain", "QRCodeSVG", "nfood-menu-header", "restaurantName", "pwaInstalled", "menuQrOpen"]) {
  let from = 0;
  let count = 0;
  console.log(`\\n--- ${needle} ---`);
  while (count < 8) {
    const index = file.indexOf(needle, from);
    if (index < 0) break;
    console.log(file.slice(Math.max(0, index - 260), Math.min(file.length, index + 520)).replace(/\\n/g, " "));
    from = index + needle.length;
    count += 1;
  }
}
