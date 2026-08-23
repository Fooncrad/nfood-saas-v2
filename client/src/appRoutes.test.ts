import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("application route aliases", () => {
  it("keeps direct dashboard entry paths mapped to the authenticated root route", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/App.tsx"), "utf8");
    for (const path of ["/admin", "/admin/account", "/dashboard", "/restaurant/dashboard", "/restaurant/account"]) {
      expect(source).toContain(`<Route path=\"${path}\" component={RootRoute} />`);
    }
  });

  it("keeps public menu routes separate from dashboard aliases", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/App.tsx"), "utf8");
    expect(source).toContain('<Route path="/restaurant/:slug" component={RestaurantPublic} />');
    expect(source).toContain('<Route path="/menu/:slug" component={RestaurantPublic} />');
  });
});
