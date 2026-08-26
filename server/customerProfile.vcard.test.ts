import { describe, expect, it } from "vitest";
import { and, eq } from "drizzle-orm";
import { getDb, getPublicCustomerProfile } from "./db";
import { customerProfiles, testAccounts, users, vcardCardBindings, vcardCardCodes } from "../drizzle/schema";

describe("customer profile product and NFC seed", () => {
  it("exposes seeded products and payment methods and binds an active NFC code", async () => {
    const db = await getDb();
    if (!db) return;
    const account = (await db.select({ email: testAccounts.email }).from(testAccounts).where(and(eq(testAccounts.role, "customer"), eq(testAccounts.isActive, true))).limit(1))[0];
    if (!account) return;
    const user = (await db.select({ id: users.id }).from(users).where(eq(users.email, account.email)).limit(1))[0];
    if (!user) return;
    const profile = (await db.select({ id: customerProfiles.id, slug: customerProfiles.slug }).from(customerProfiles).where(eq(customerProfiles.userId, user.id)).limit(1))[0];
    if (!profile) return;
    const publicProfile = await getPublicCustomerProfile(profile.slug);
    expect(publicProfile?.products.length).toBe(3);
    expect(publicProfile?.paymentMethods.length).toBe(3);
    const binding = (await db.select({ codeId: vcardCardBindings.codeId, profileId: vcardCardBindings.customerProfileId, status: vcardCardCodes.status }).from(vcardCardBindings).innerJoin(vcardCardCodes, eq(vcardCardCodes.id, vcardCardBindings.codeId)).where(and(eq(vcardCardBindings.userId, user.id), eq(vcardCardBindings.customerProfileId, profile.id))).limit(1))[0];
    expect(binding).toEqual(expect.objectContaining({ profileId: profile.id, status: "bound" }));
  });
});
