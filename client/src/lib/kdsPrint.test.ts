import { describe, expect, it } from "vitest";
import { buildKdsPrintMarkup } from "./kdsPrint";
import type { Order } from "@/components/homeNavigation";

const order = {
  id: "#K-2401",
  status: "preparing",
  table: "Table 4",
  time: "10:30 AM",
  ageMinutes: 8,
  items: "2 × Latte",
  guestName: "Guest",
  customerNote: "No <sugar>",
  cashierNotes: "Paid",
  deliveryNote: null,
  kitchenSectionId: null,
} as Order;

describe("KDS print markup", () => {
  it("includes operational fields and escapes order text", () => {
    const markup = buildKdsPrintMarkup(order, "Bar");
    expect(markup).toContain("Bar");
    expect(markup).toContain("#K-2401");
    expect(markup).toContain("No &lt;sugar&gt;");
    expect(markup).toContain("window.print");
  });
});
