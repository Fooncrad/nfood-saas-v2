import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const homeSource = readFileSync(new URL("../pages/Home.tsx", import.meta.url), "utf8");
const homeModulesSource = readFileSync(new URL("../components/HomeModules.tsx", import.meta.url), "utf8");
const dashboardSource = `${homeSource}\n${homeModulesSource}`;
const reservationsSource = readFileSync(new URL("../pages/ReservationsView.tsx", import.meta.url), "utf8");

describe("operational data source audit", () => {
  it("uses remote queries for the primary Home resources", () => {
    for (const query of [
      "trpc.platform.ordersByRestaurant.useQuery",
      "trpc.platform.menuItems.useQuery",
      "trpc.platform.inventory.useQuery",
      "trpc.platform.purchases.useQuery",
      "trpc.platform.employees.useQuery",
      "trpc.platform.campaigns.useQuery",
      "trpc.platform.coupons.useQuery",
    ]) expect(dashboardSource).toContain(query);
    expect(homeSource).not.toContain("const menuProducts");
    expect(homeSource).not.toContain("const [orders, setOrders]");
  });

  it("uses a remote reservation query and keeps local state out of the collection", () => {
    expect(reservationsSource).toContain("trpc.platform.reservations.useQuery");
    expect(reservationsSource).not.toContain("const [reservations, setReservations]");
  });
});
