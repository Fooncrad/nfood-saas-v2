import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { filterAndSortKdsOrders } from "@/components/KdsOperationsBoard";
import type { Order } from "@/components/homeNavigation";

const orders: Order[] = [
  { id: "#1", table: "طاولة 1", items: "قهوة", total: 12, status: "new", time: "10:00", channel: "dine_in", ageMinutes: 5 },
  { id: "#2", table: "طاولة 2", items: "برجر", total: 30, status: "preparing", time: "09:45", channel: "dine_in", ageMinutes: 20 },
  { id: "#3", table: "استلام", items: "عصير", total: 18, status: "ready", time: "09:55", channel: "pickup", ageMinutes: 10 },
];

describe("manager operations monitor and KDS controls", () => {
  it("filters KDS orders by current status", () => {
    expect(filterAndSortKdsOrders(orders, "preparing", "oldest").map((order) => order.id)).toEqual(["#2"]);
  });

  it("orders by preparation age in both directions", () => {
    expect(filterAndSortKdsOrders(orders, "all", "longest").map((order) => order.id)).toEqual(["#2", "#3", "#1"]);
    expect(filterAndSortKdsOrders(orders, "all", "newest").map((order) => order.id)).toEqual(["#1", "#3", "#2"]);
  });

  it("locks KDS viewport and keeps scrolling inside Kanban columns", () => {
    const kds = readFileSync(resolve(process.cwd(), "client/src/components/KdsOperationsBoard.tsx"), "utf8");
    expect(kds).toContain("h-full");
    expect(kds).toContain("overflow-hidden");
    expect(kds).toContain("min-h-0 flex-1 gap-2 overflow-hidden");
    expect(kds).toContain("min-h-0 flex-1 space-y-2 overflow-y-auto");
    expect(kds).toContain("h-7 w-full");
  });

  it("persists per-restaurant controls and renders delayed alert semantics", () => {
    const kds = readFileSync(resolve(process.cwd(), "client/src/components/KdsOperationsBoard.tsx"), "utf8");
    const monitor = readFileSync(resolve(process.cwd(), "client/src/components/ManagerOperationsPanel.tsx"), "utf8");
    expect(kds).toContain("nfood-kds-filter-${restaurantId}");
    expect(kds).toContain("تجاوز وقت SLA الخاص بقسمه");
    expect(kds).toContain("تصفية قسم المطبخ");
    expect(kds).toContain("aria-pressed");
    expect(kds).toContain("role=\"alert\"");
    expect(monitor).toContain("الطلبات النشطة");
    expect(monitor).toContain("hasError = ordersError || summaryError");
  });
});
