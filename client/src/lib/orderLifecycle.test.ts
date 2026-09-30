import { describe, expect, it } from "vitest";
import { nextOrderStatus } from "./orderLifecycle";

describe("nextOrderStatus", () => {
  it("advances active orders through the operational lifecycle", () => {
    expect(nextOrderStatus("new")).toBe("preparing");
    expect(nextOrderStatus("preparing")).toBe("ready");
    expect(nextOrderStatus("ready")).toBe("completed");
  });

  it("keeps completed and cancelled orders terminal", () => {
    expect(nextOrderStatus("completed")).toBeNull();
    expect(nextOrderStatus("cancelled")).toBeNull();
  });
});
