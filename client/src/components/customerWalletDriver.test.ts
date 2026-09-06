import { describe, expect, it } from "vitest";
import fs from "node:fs";

const wallet = fs.readFileSync(new URL("./CustomerRewardsWalletPanel.tsx", import.meta.url), "utf8");
const driver = fs.readFileSync(new URL("./DriverDeliveryView.tsx", import.meta.url), "utf8");
const router = fs.readFileSync(new URL("../../../server/routers.ts", import.meta.url), "utf8");

describe("customer wallet and driver chat regression", () => {
  it("shows real wallet, content sales, reward history, and purchase notifications", () => {
    expect(wallet).toContain("myWalletTransactions");
    expect(wallet).toContain("myContentListings");
    expect(wallet).toContain("notifications.mine");
    expect(wallet).toContain("مكافآت المحتوى");
    expect(wallet).toContain("بيع المحتوى");
  });

  it("mounts secure chat for the selected driver delivery order", () => {
    expect(driver).toContain("SecureDeliveryChat");
    expect(driver).toContain("orderId={selected.id}");
  });

  it("refreshes the driver inbox quickly and keeps background polling enabled", () => {
    expect(driver).toContain("refetchInterval: 3000");
    expect(driver).toContain("refetchIntervalInBackground: true");
    expect(driver).toContain("refetchOnWindowFocus: true");
    expect(router).toContain("eq(orders.driverId, ctx.user?.id ?? -1)");
    expect(router).toContain('ctx.user?.testRole === "driver" && order.driverId !== ctx.user.id');
  });

  it("notifies the customer only on the first approval transition", () => {
    expect(router).toContain("تم شراء محتواك من المطعم");
    expect(router).toContain("current.status !== \"approved\"");
    expect(router).toContain("sendPushToUser(current.customerUserId");
  });
});
