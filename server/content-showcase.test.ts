import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("menu AI import, translation, and content showcase", () => {
  it("keeps AI menu extraction as a reviewable PDF/image draft", () => {
    const source = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");
    expect(source).toContain("importMenuDraft");
    expect(source).toContain("application/pdf");
    expect(source).toContain("needsReview");
    expect(source).toContain("menu_import_draft");
    expect(source).toContain("applyMenuImportDraft");
    expect(readFileSync(resolve(process.cwd(), "client/src/components/MenuImportReviewPanel.tsx"), "utf8")).toContain("اعتماد ونشر المنيو");
  });

  it("keeps one bulk translation action for categories and items", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/components/HomeModules.tsx"), "utf8");
    expect(source).toContain("ترجمة القائمة كاملة");
    expect(source).toContain("getMissingTranslationTasks(remoteCategories.data ?? [], remoteMenu.data ?? [])");
    expect(source).toContain("translateMenuEntity.mutateAsync");
  });

  it("publishes only approved restaurant video listings and labels payment as unconfigured", () => {
    const db = readFileSync(resolve(process.cwd(), "server/db.ts"), "utf8");
    const router = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");
    const publicPage = readFileSync(resolve(process.cwd(), "client/src/pages/RestaurantPublic.tsx"), "utf8");
    const panel = readFileSync(resolve(process.cwd(), "client/src/components/MediaLibraryPanel.tsx"), "utf8");
    expect(db).toContain('eq(contentListings.status, "published")');
    expect(db).toContain("mediaShowcaseEnabled");
    expect(router).toContain("createContentListing");
    expect(router).toContain('paymentStatus: "not_configured"');
    expect(panel).toContain("تسعير وبيع المحتوى");
    expect(panel).toContain("contentCategory");
    expect(panel).toContain("watermarkEnabled");
    expect(publicPage).toContain("contentCategoryFilter");
    expect(publicPage).toContain("NFOOD · PREVIEW");
    expect(publicPage).toContain("paymentMethod");
    expect(publicPage).toContain("media-showcase");
    expect(publicPage).toContain("إضافة إلى سلة المحتوى");
    expect(publicPage).toContain("سلة المحتوى المرئي");
    expect(publicPage).toContain("manualPaymentInstructions");
  });

  it("supports transfer receipt upload and restaurant content order history", () => {
    const schema = readFileSync(resolve(process.cwd(), "drizzle/schema.ts"), "utf8");
    const db = readFileSync(resolve(process.cwd(), "server/db.ts"), "utf8");
    const router = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");
    const publicPage = readFileSync(resolve(process.cwd(), "client/src/pages/RestaurantPublic.tsx"), "utf8");
    const panel = readFileSync(resolve(process.cwd(), "client/src/components/ContentOrdersPanel.tsx"), "utf8");
    expect(schema).toContain("contentPurchaseOrders");
    expect(schema).toContain('status: mysqlEnum("status", ["unpaid", "verifying", "approved", "rejected"])');
    expect(db).toContain("createContentPurchaseOrder");
    expect(db).toContain("listContentPurchaseOrders");
    expect(router).toContain("uploadContentReceipt");
    expect(router).toContain('status: "verifying" as const');
    expect(publicPage).toContain('accept="image/png,image/jpeg,image/webp"');
    expect(publicPage).toContain("إرسال الطلب مع الإيصال");
    expect(panel).toContain("سجل طلبات المحتوى المرئي");
    expect(panel).toContain("updateContentPurchaseOrderStatus");
    expect(panel).toContain("معاينة الإيصال");
    expect(panel).toContain("قراءة المبلغ والتاريخ");
  });

  it("supports customer history, receipt alerts, and searchable restaurant filters", () => {
    const db = readFileSync(resolve(process.cwd(), "server/db.ts"), "utf8");
    const router = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");
    const customerPage = readFileSync(resolve(process.cwd(), "client/src/pages/CustomerContentOrders.tsx"), "utf8");
    const portal = readFileSync(resolve(process.cwd(), "client/src/pages/CustomerPortal.tsx"), "utf8");
    const panel = readFileSync(resolve(process.cwd(), "client/src/components/ContentOrdersPanel.tsx"), "utf8");
    expect(db).toContain("listCustomerContentPurchaseOrders");
    expect(db).toContain("listRestaurantManagerUserIds");
    expect(router).toContain("myContentPurchaseOrders");
    expect(router).toContain("إيصال تحويل محتوى جديد");
    expect(router).toContain("sendPushToUser(managerId");
    expect(customerPage).toContain("طلباتي السابقة");
    expect(customerPage).toContain("myContentPurchaseOrders");
    expect(portal).toContain("/customer-content-orders");
    expect(panel).toContain("statusFilter");
    expect(panel).toContain("fromDate");
    expect(panel).toContain("toDate");
    expect(panel).toContain('value=\"newest\"');
    expect(readFileSync(resolve(process.cwd(), "client/src/App.tsx"), "utf8")).toContain("/customer-content-orders");
    expect(readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8")).toContain("refetchInterval: 5000");
  });

  it("supports receipt preview, customer pagination, and reviewable AI extraction", () => {
    const router = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");
    const schema = readFileSync(resolve(process.cwd(), "drizzle/schema.ts"), "utf8");
    const customerPage = readFileSync(resolve(process.cwd(), "client/src/pages/CustomerContentOrders.tsx"), "utf8");
    const panel = readFileSync(resolve(process.cwd(), "client/src/components/ContentOrdersPanel.tsx"), "utf8");
    expect(schema).toContain("receiptExtractedAmount");
    expect(schema).toContain("receiptExtractedDate");
    expect(router).toContain("analyzeContentReceipt");
    expect(router).toContain("gemini-3-flash-preview");
    expect(router).toContain("ai_suggestion");
    expect(router).toContain("parseReceiptExtractionPayload");
    expect(customerPage).toContain("pageSize = 6");
    expect(customerPage).toContain("صفحة {currentPage} من {pageCount}");
    expect(panel).toContain("<Dialog open={Boolean(receiptPreview)}");
    expect(panel).toContain("المعاينة للرجوع والمطابقة فقط");
    expect(panel).toContain("اقتراح التحليل الذكي");
  });
});
