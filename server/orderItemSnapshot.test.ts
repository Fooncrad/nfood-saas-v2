import { describe, expect, it } from "vitest";
import { resolveOrderItemName } from "./orderItemSnapshot";

describe("order item name snapshots", () => {
  it("keeps the historical name when the menu item changes", () => {
    expect(resolveOrderItemName("قهوة اليوم", "قهوة جديدة", "صنف منيو")).toBe("قهوة اليوم");
  });

  it("supports orders created before snapshot columns were populated", () => {
    expect(resolveOrderItemName(null, "برجر لحم", "صنف منيو")).toBe("برجر لحم");
  });

  it("uses a safe label only when both names are missing", () => {
    expect(resolveOrderItemName("   ", null, "صنف منيو")).toBe("صنف منيو");
  });
});
