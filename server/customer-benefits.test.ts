import fs from "node:fs";
import { describe, expect, it } from "vitest";

const schema = fs.readFileSync("drizzle/schema.ts", "utf8");
const db = fs.readFileSync("server/db.ts", "utf8");
const routers = fs.readFileSync("server/routers.ts", "utf8");
const page = fs.readFileSync("client/src/pages/CustomerBenefits.tsx", "utf8");

describe("persistent customer benefits", () => {
  it("declares durable customer plans, subscriptions, and requests", () => {
    expect(schema).toContain('export const customerBenefitFeatures = mysqlTable("customerBenefitFeatures"');
    expect(schema).toContain('export const customerBenefitPlans = mysqlTable("customerBenefitPlans"');
    expect(schema).toContain('export const customerBenefitSubscriptions = mysqlTable("customerBenefitSubscriptions"');
    expect(schema).toContain('export const customerBenefitRequests = mysqlTable("customerBenefitRequests"');
    expect(schema).toContain('name: "cbpf_plan_fk"');
    expect(schema).toContain('name: "cbr_reviewer_fk"');
  });

  it("seeds the catalog idempotently and prevents duplicate pending requests", () => {
    expect(db).toContain("ensureCustomerBenefitCatalog");
    expect(db).toContain("onDuplicateKeyUpdate");
    expect(db).toContain('eq(customerBenefitRequests.status, "pending")');
    expect(db).toContain("duplicate: true");
    expect(db).toContain("setCustomerBenefitPlan");
  });

  it("exposes protected customer procedures and platform review", () => {
    expect(routers).toContain("customerBenefits: protectedProcedure");
    expect(routers).toContain("setCustomerBenefitPlan: protectedProcedure");
    expect(routers).toContain("requestCustomerBenefit: protectedProcedure");
    expect(routers).toContain("reviewCustomerBenefitRequest: platformAdminProcedure");
  });

  it("keeps CustomerBenefits server-backed instead of browser-only storage", () => {
    expect(page).toContain("trpc.platform.customerBenefits.useQuery");
    expect(page).toContain("trpc.platform.requestCustomerBenefit.useMutation");
    expect(page).toContain("trpc.platform.setCustomerBenefitPlan.useMutation");
    expect(page).not.toContain("localStorage");
  });
});
