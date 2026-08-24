import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");

function source(relativePath: string) {
  return readFileSync(resolve(projectRoot, relativePath), "utf8");
}

describe("deferred order operational visibility", () => {
  it("projects reservation and split-bill fields in restaurant order queries", () => {
    const db = source("server/db.ts");
    expect(db).toContain("reservationDate: orders.reservationDate");
    expect(db).toContain("reservationEventType: orders.reservationEventType");
    expect(db).toContain("partySize: orders.partySize");
    expect(db).toContain("childrenCount: orders.childrenCount");
    expect(db).toContain("splitBillMode: orders.splitBillMode");
  });

  it("renders deferred reservation context in orders and kitchen printing", () => {
    const ordersBoard = source("client/src/components/CompactOrdersBoard.tsx");
    const kitchenBoard = source("client/src/components/KitchenTicketBoard.tsx");
    expect(ordersBoard).toContain("مؤجل");
    expect(ordersBoard).toContain("reservationSummary");
    expect(kitchenBoard).toContain("طلب مؤجل");
    expect(kitchenBoard).toContain("window.print()");
  });
});
