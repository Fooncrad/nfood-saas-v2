import { describe, expect, it } from "vitest";
import { canReleaseCustomerContent } from "../shared/customerContent";

describe("customer content release policy", () => {
  it("keeps the original locked until owner approval and purchase approval", () => {
    expect(canReleaseCustomerContent({ ownerApproved: false, purchaseApproved: true, listingActive: true })).toBe(false);
    expect(canReleaseCustomerContent({ ownerApproved: true, purchaseApproved: false, listingActive: true })).toBe(false);
  });

  it("releases only an active listing after both approvals", () => {
    expect(canReleaseCustomerContent({ ownerApproved: true, purchaseApproved: true, listingActive: true })).toBe(true);
    expect(canReleaseCustomerContent({ ownerApproved: true, purchaseApproved: true, listingActive: false })).toBe(false);
  });
});
