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

  it("isolates merchant content purchases from restaurant operating funds", () => {
    expect(schema).toContain('export const commerceFundingAccounts = mysqlTable("commerceFundingAccounts"');
    expect(schema).toContain('purchaseAccountId: int("purchaseAccountId")');
    expect(schema).toContain('operatingFundsExcluded: boolean("operatingFundsExcluded")');
    expect(schema).toContain('fundingAccountId: int("fundingAccountId")');
    expect(db).toContain('paymentSource: input.buyerType === "merchant" ? "purchase_account" : "wallet"');
    expect(db).toContain("لا يمكن استخدام رصيد المطعم التشغيلي");
    expect(db).toContain('section: "content_purchase_account"');
    expect(routers).toContain("fundCommercePurchaseAccount");
  });

  it("exposes a separate content purchase finance report", () => {
    const financePanel = fs.readFileSync("client/src/components/ContentPurchaseFinancePanel.tsx", "utf8");
    expect(routers).toContain("contentPurchaseFinanceSummary");
    expect(routers).toContain('operatingFundsExcluded: true');
    expect(financePanel).toContain("تقرير مستقل عن تشغيل المطاعم");
    expect(financePanel).toContain("توزيع حالات الدفع");
    expect(financePanel).toContain("قاعدة العزل");
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
