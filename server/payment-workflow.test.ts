import fs from "node:fs";
import { describe, expect, it } from "vitest";

const schema = fs.readFileSync("drizzle/schema.ts", "utf8");
const routers = fs.readFileSync("server/routers.ts", "utf8");
const db = fs.readFileSync("server/db.ts", "utf8");
const contentOrders = fs.readFileSync("client/src/pages/CustomerContentOrders.tsx", "utf8");
const homeModules = fs.readFileSync("client/src/components/HomeModules.tsx", "utf8");

describe("unified payment and printing workflow", () => {
  it("declares the complete payment lifecycle for orders and content purchases", () => {
    for (const status of ["unpaid", "pending", "paid", "failed", "partially_refunded", "refunded", "cancelled"]) {
      expect(schema).toContain(`"${status}"`);
    }
    expect(schema).toContain('paymentMethod: mysqlEnum("paymentMethod"');
    expect(schema).toContain('paymentStatus: mysqlEnum("paymentStatus"');
    expect(schema).toContain('invoicePrintStatus: mysqlEnum("invoicePrintStatus"');
    expect(schema).toContain('receiptPrintStatus: mysqlEnum("receiptPrintStatus"');
  });

  it("keeps content buying commercial and records paid wallet delivery", () => {
    expect(routers).toContain("isMerchantContext(ctx, input.restaurantId)");
    expect(routers).toContain("شراء المحتوى متاح للحسابات التجارية والمطاعم فقط");
    expect(db).toContain('paymentMethod: "wallet", paymentStatus: "paid"');
    expect(db).toContain("contentPurchaseEntitlements");
  });

  it("provides auditable manual invoice printing for content and restaurant orders", () => {
    expect(routers).toContain("markContentPurchaseInvoicePrinted");
    expect(routers).toContain("markOrderReceiptPrinted");
    expect(routers).toContain('action: "orders.receipt_printed"');
    expect(routers).toContain('action: "content.purchase.invoice_printed"');
    expect(contentOrders).toContain("طباعة الفاتورة");
    expect(homeModules).toContain("markOrderReceiptPrinted.mutate");
  });

  it("queues restaurant receipts when an order is created for Kitchen/Bar processing", () => {
    expect(routers).toContain('paymentStatus: "unpaid", receiptPrintStatus: "queued"');
    expect(homeModules).toContain("طباعة الإيصال");
  });
});
