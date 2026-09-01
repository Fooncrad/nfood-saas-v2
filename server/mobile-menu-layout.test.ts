import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("mobile menu order preferences and notes", () => {
  const page = () => readFileSync(resolve(process.cwd(), "client/src/pages/RestaurantPublic.tsx"), "utf8");
  const css = () => readFileSync(resolve(process.cwd(), "client/src/index.css"), "utf8");

  it("persists the preferred order type independently per branch", () => {
    const source = page();
    expect(source).toContain("nfood-order-type-${slug}-branch-${selectedBranchId}");
    expect(source).toContain("localStorage.setItem(orderTypePreferenceKey, orderType)");
    expect(source).toContain("setOrderTypePreferenceReady(true)");
  });

  it("provides remaining-character feedback and quick note templates", () => {
    const source = page();
    expect(source).toContain('id="order-notes"');
    expect(source).toContain("1000 - orderNotes.length");
    expect(source).toContain("noteTemplates.map");
    expect(source).toContain("saveNoteTemplate");
    expect(source).toContain("nfood-note-templates-${slug}");
    expect(source).toContain("notes: orderNotes.trim() || undefined");
  });

  it("includes hotel service and requires sign-in before checkout", () => {
    const source = page();
    expect(source).toContain('setOrderType("hotel")');
    expect(source).toContain('hotelName.trim()');
    expect(source).toContain('if (!user)');
    expect(source).toContain('startLogin()');
  });

  it("supports event reservations with a pre-order", () => {
    const source = page();
    expect(source).toContain("reservationEventTypes");
    expect(source).toContain("reservationEventType: orderType === \"reservation\"");
    expect(source).toContain("partySize: orderType === \"dineIn\" || orderType === \"reservation\"");
    expect(source).toContain("نوع المناسبة مطلوب");
  });

  it("removes the public previous-order tracking card", () => {
    const source = page();
    expect(source).not.toContain("copy.trackPrevious");
    expect(source).not.toContain("trackGuestOrder");
    expect(source).not.toContain("lookupOrderId");
    expect(source).not.toContain("trackingQuery");
  });

  it("keeps the mobile cart compact without horizontal distortion", () => {
    const source = page();
    expect(source).toContain("w-screen flex-col items-center");
    expect(source).toContain("overflow-x-hidden");
    expect(source).toContain("w-[calc(100%-1rem)] min-w-0 max-w-[440px]");
    expect(source).toContain("bg-transparent");
    expect(source).toContain("max-h-[68dvh]");
  });

  it("keeps category motion accessible", () => {
    const source = page();
    expect(source).toContain("category-results");
    expect(css()).toContain("nfood-category-enter");
    expect(css()).toContain("prefers-reduced-motion: reduce");
  });

  it("keeps tracking out while making an occupied cart noticeable", () => {
    const source = page();
    expect(source).not.toContain("trackGuestOrder");
    expect(source).not.toContain("تتبّع طلب");
    expect(source).toContain("nfood-cart-pulse");
    expect(source).toContain("itemCount > 0");
  });

  it("passes referral links through authenticated checkout", () => {
    const source = page();
    const router = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");
    expect(source).toContain("new URLSearchParams(window.location.search).get(\"ref\")");
    expect(source).toContain("referralCode,");
    expect(router).toContain("createMyReferralLink");
    expect(router).toContain("referredCustomerId: customerId");
  });

  it("exposes the waiting game only as an optional post-order experience", () => {
    const source = page();
    expect(source).toContain("افتح لعبة الانتظار");
    expect(source).toContain("gameStatus.data?.status === \"ready\"");
    expect(source).toContain("الطلب جاهز. شكرًا على استمتاعك باللعبة");
  });
});
