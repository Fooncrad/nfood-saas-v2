import fs from "node:fs";

const dbPath = "server/db.ts";
let db = fs.readFileSync(dbPath, "utf8");
const dbReplacements = [
  [
    'export async function createContentPurchaseOrder(input: { restaurantId: number; customerUserId?: number | null; itemsJson: string; total: string; currencyCode: string; customerName?: string | null; customerPhone?: string | null; note?: string | null; receiptMediaFileId?: number | null; status?: "unpaid" | "verifying" | "approved" | "rejected"; paymentMethod?: "manual" | "bank_transfer" | "card" | "online" | "wallet" | "other"; paymentStatus?: "unpaid" | "pending" | "paid" | "failed" | "partially_refunded" | "refunded" | "cancelled" }) { const db = await getDb(); if (!db) throw new Error("Database is not available"); const status = input.status ?? "unpaid"; const paymentStatus = input.paymentStatus ?? (status === "approved" ? "paid" : status === "rejected" ? "failed" : status === "verifying" ? "pending" : "unpaid"); const result = await db.insert(contentPurchaseOrders).values({ restaurantId: input.restaurantId, customerUserId: input.customerUserId ?? null, itemsJson: input.itemsJson, total: input.total, currencyCode: input.currencyCode, customerName: input.customerName ?? null, customerPhone: input.customerPhone ?? null, note: input.note ?? null, receiptMediaFileId: input.receiptMediaFileId ?? null, status, paymentMethod: input.paymentMethod ?? "manual", paymentStatus, paidAt: paymentStatus === "paid" ? new Date() : null }); return Number(result[0].insertId); }',
    'export async function createContentPurchaseOrder(input: { restaurantId: number; customerUserId?: number | null; buyerUserId?: number | null; buyerType?: "customer" | "merchant"; itemsJson: string; total: string; currencyCode: string; customerName?: string | null; customerPhone?: string | null; note?: string | null; receiptMediaFileId?: number | null; status?: "unpaid" | "verifying" | "approved" | "rejected"; paymentMethod?: "manual" | "bank_transfer" | "card" | "online" | "wallet" | "other"; paymentStatus?: "unpaid" | "pending" | "paid" | "failed" | "partially_refunded" | "refunded" | "cancelled" }) { const db = await getDb(); if (!db) throw new Error("Database is not available"); const status = input.status ?? "unpaid"; const paymentMethod = input.paymentMethod ?? "manual"; const paymentStatus = input.paymentStatus ?? (status === "approved" ? "paid" : status === "rejected" ? "failed" : status === "verifying" ? "pending" : "unpaid"); const result = await db.insert(contentPurchaseOrders).values({ restaurantId: input.restaurantId, customerUserId: input.customerUserId ?? null, buyerUserId: input.buyerUserId ?? input.customerUserId ?? null, buyerType: input.buyerType ?? "customer", paymentSource: paymentMethod === "wallet" ? "wallet" : "manual", paymentMethod, itemsJson: input.itemsJson, total: input.total, currencyCode: input.currencyCode, customerName: input.customerName ?? null, customerPhone: input.customerPhone ?? null, note: input.note ?? null, receiptMediaFileId: input.receiptMediaFileId ?? null, status, paymentStatus, paidAt: paymentStatus === "paid" ? new Date() : null }); return Number(result[0].insertId); }'
  ],
  [
    '.where(eq(contentPurchaseOrders.customerUserId, customerUserId)).orderBy(desc(contentPurchaseOrders.createdAt)); }',
    '.where(or(eq(contentPurchaseOrders.customerUserId, customerUserId), eq(contentPurchaseOrders.buyerUserId, customerUserId))).orderBy(desc(contentPurchaseOrders.createdAt)); }'
  ]
];
for (const [from, to] of dbReplacements) {
  if (!db.includes(from)) throw new Error(`Missing db replacement: ${from.slice(0, 80)}`);
  db = db.replace(from, to);
}
fs.writeFileSync(dbPath, db);

const routerPath = "server/routers.ts";
let routers = fs.readFileSync(routerPath, "utf8");
const routerReplacements = [
  [
    'function assertRestaurantAccess(ctx: { user: { role?: string; testRole?: string; restaurantId?: number } | null }, restaurantId: number) {\n  if (isAdminContext(ctx)) return;',
    'function isMerchantContext(ctx: { user: { role?: string; testRole?: string; restaurantId?: number } | null }, restaurantId: number) {\n  if (isAdminContext(ctx)) return true;\n  if (!ctx.user || ["customer", "driver", "waiter", "kitchen", "cashier"].includes(ctx.user.testRole ?? "")) return false;\n  return ctx.user.testRole === "restaurant_admin" || ctx.user.restaurantId === restaurantId;\n}\nfunction assertRestaurantAccess(ctx: { user: { role?: string; testRole?: string; restaurantId?: number } | null }, restaurantId: number) {\n  if (isAdminContext(ctx)) return;'
  ],
  [
    'createContentPurchaseOrder: protectedProcedure.input(z.object({ restaurantId: z.number().int().positive(), listingIds: z.array(z.number().int().positive()).min(1).max(50), customerName: z.string().trim().max(160).optional(), customerPhone: z.string().trim().max(40).optional(), note: z.string().trim().max(500).optional() })).mutation(async ({ ctx, input }) => { throw new TRPCError({ code: "FORBIDDEN", message: "المطاعم لا تشتري المحتوى؛ الشراء حصري للعملاء" }); const db = (await getDb())!;',
    'createContentPurchaseOrder: protectedProcedure.input(z.object({ restaurantId: z.number().int().positive(), listingIds: z.array(z.number().int().positive()).min(1).max(50), customerName: z.string().trim().max(160).optional(), customerPhone: z.string().trim().max(40).optional(), note: z.string().trim().max(500).optional() })).mutation(async ({ ctx, input }) => { if (!isMerchantContext(ctx, input.restaurantId)) throw new TRPCError({ code: "FORBIDDEN", message: "شراء المحتوى متاح للحسابات التجارية والمطاعم فقط" }); assertRestaurantAccess(ctx, input.restaurantId); const db = (await getDb())!;'
  ],
  [
    'where(and(eq(contentListings.restaurantId, input.restaurantId), eq(contentListings.status, "published"), inArray(contentListings.id, ids)))',
    'where(and(eq(contentListings.status, "published"), inArray(contentListings.id, ids)))'
  ],
  [
    'customerUserId: ctx.user.id, itemsJson:',
    'buyerUserId: ctx.user.id, buyerType: "merchant", customerUserId: null, paymentMethod: "manual", itemsJson:'
  ],
  [
    'status: input.status, rejectionReason: input.status === "rejected" ? input.rejectionReason ?? null : null });',
    'status: input.status, paymentStatus: input.status === "approved" ? "paid" : input.status === "rejected" ? "failed" : input.status === "verifying" ? "pending" : "unpaid", paidAt: input.status === "approved" ? new Date() : null, rejectionReason: input.status === "rejected" ? input.rejectionReason ?? null : null });'
  ],
  [
    'where(and(eq(contentListings.id, item.listingId), eq(contentListings.restaurantId, input.restaurantId)))',
    'where(eq(contentListings.id, item.listingId))'
  ]
];
for (const [from, to] of routerReplacements) {
  if (!routers.includes(from)) throw new Error(`Missing router replacement: ${from.slice(0, 100)}`);
  routers = routers.replace(from, to);
}
const anchor = '  myContentPurchaseOrders: protectedProcedure.query(({ ctx }) => listCustomerContentPurchaseOrders(ctx.user.id)),';
if (!routers.includes(anchor)) throw new Error("Missing content router anchor");
const printProcedure = `${anchor}\n  markContentPurchaseInvoicePrinted: protectedProcedure.input(z.object({ orderId: z.number().int().positive() })).mutation(async ({ ctx, input }) => { const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database is not available" }); const order = (await db.select({ id: contentPurchaseOrders.id, restaurantId: contentPurchaseOrders.restaurantId, buyerUserId: contentPurchaseOrders.buyerUserId, customerUserId: contentPurchaseOrders.customerUserId }).from(contentPurchaseOrders).where(eq(contentPurchaseOrders.id, input.orderId)).limit(1))[0]; if (!order) throw new TRPCError({ code: "NOT_FOUND", message: "فاتورة المحتوى غير موجودة" }); const allowed = isAdminContext(ctx) || order.buyerUserId === ctx.user.id || order.customerUserId === ctx.user.id || (order.restaurantId ? isMerchantContext(ctx, order.restaurantId) : false); if (!allowed) throw new TRPCError({ code: "FORBIDDEN", message: "لا تملك صلاحية طباعة هذه الفاتورة" }); await updateContentPurchaseOrder({ id: order.id, restaurantId: order.restaurantId ?? 0, invoicePrintStatus: "printed", invoicePrintedAt: new Date(), invoicePrintError: null }); await insertAuditLog({ actorUserId: ctx.user.id, action: "content.purchase.invoice_printed", entityType: "content_purchase_order", entityId: String(order.id), restaurantId: order.restaurantId ?? null, outcome: "success", requestId: nanoid(12), metadata: JSON.stringify({ mode: "manual" }) }); return { success: true, orderId: order.id, invoicePrintStatus: "printed" as const }; }),`;
routers = routers.replace(anchor, printProcedure);
fs.writeFileSync(routerPath, routers);
