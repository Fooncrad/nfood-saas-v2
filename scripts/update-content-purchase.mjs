import { readFileSync, writeFileSync } from "node:fs";

const path = "server/db.ts";
let source = readFileSync(path, "utf8");
source = source.replace(
  "contentListings, contentPurchaseOrders, contentModerationReviews,",
  "contentListings, contentPurchaseOrders, contentPurchaseEntitlements, contentModerationReviews,",
);
const marker = "export async function purchaseContentWithWallet";
const start = source.indexOf(marker);
const end = source.indexOf("export async function listRestaurantContentListings", start);
if (start < 0 || end < 0) throw new Error("purchase helper markers not found");
const replacement = `export async function getMerchantRestaurantId(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select({ restaurantId: restaurantMembers.restaurantId, roleName: roles.name }).from(restaurantMembers).leftJoin(roles, eq(restaurantMembers.roleId, roles.id)).where(eq(restaurantMembers.userId, userId));
  const merchant = rows.find((row) => /admin|manager|owner|merchant|تاجر|مدير|مالك|مشرف/i.test(row.roleName ?? ""));
  return merchant?.restaurantId ?? null;
}

export async function listContentLibraryForBuyer(buyerUserId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({ entitlement: contentPurchaseEntitlements, listing: contentListings, media: mediaFiles, order: contentPurchaseOrders }).from(contentPurchaseEntitlements).innerJoin(contentListings, eq(contentPurchaseEntitlements.listingId, contentListings.id)).innerJoin(mediaFiles, eq(contentPurchaseEntitlements.sourceMediaFileId, mediaFiles.id)).innerJoin(contentPurchaseOrders, eq(contentPurchaseEntitlements.purchaseOrderId, contentPurchaseOrders.id)).where(and(eq(contentPurchaseEntitlements.buyerUserId, buyerUserId), eq(contentPurchaseOrders.status, "approved"), eq(mediaFiles.isDeleted, false))).orderBy(desc(contentPurchaseEntitlements.deliveredAt));
}

export async function purchaseContentWithWallet(input: { listingId: number; buyerUserId: number; buyerType: "customer" | "merchant"; restaurantId?: number | null }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return db.transaction(async (tx) => {
    const row = (await tx.select({ listing: contentListings }).from(contentListings).where(and(eq(contentListings.id, input.listingId), eq(contentListings.status, "published"))).limit(1))[0];
    if (!row) throw new Error("المحتوى غير متاح للشراء");
    if (row.listing.ownerUserId === input.buyerUserId) throw new Error("لا يمكن شراء المحتوى من صاحبه");
    const prior = (await tx.select({ id: contentPurchaseOrders.id }).from(contentPurchaseOrders).where(and(eq(contentPurchaseOrders.buyerUserId, input.buyerUserId), eq(contentPurchaseOrders.status, "approved"), sql\`JSON_CONTAINS(\${contentPurchaseOrders.itemsJson}, JSON_OBJECT('listingId', \${input.listingId}))\`)).limit(1))[0];
    if (prior) throw new Error("تم شراء هذا المحتوى مسبقًا");
    const amount = Number(row.listing.price);
    if (!Number.isFinite(amount) || amount <= 0) throw new Error("سعر المحتوى غير صالح");
    const buyer = (await tx.select().from(walletAccounts).where(eq(walletAccounts.customerId, input.buyerUserId)).limit(1))[0];
    if (!buyer || Number(buyer.balance) < amount) throw new Error("رصيد محفظتك لا يكفي لإتمام الشراء");
    const now = new Date();
    const orderResult = await tx.insert(contentPurchaseOrders).values({ restaurantId: input.restaurantId ?? null, buyerUserId: input.buyerUserId, buyerType: input.buyerType, paymentSource: "wallet", customerUserId: input.buyerType === "customer" ? input.buyerUserId : null, itemsJson: JSON.stringify([{ listingId: row.listing.id, title: row.listing.title, price: String(row.listing.price), currencyCode: row.listing.currencyCode }]), total: amount.toFixed(2), currencyCode: row.listing.currencyCode, status: "approved", customerName: null, note: "شراء رقمي من محفظة المحتوى" });
    const orderId = Number(orderResult[0].insertId);
    const buyerNext = Number(buyer.balance) - amount;
    const debitUpdate = await tx.update(walletAccounts).set({ balance: buyerNext.toFixed(2), updatedAt: now }).where(and(eq(walletAccounts.id, buyer.id), gte(walletAccounts.balance, amount.toFixed(2))));
    if (Number(debitUpdate[0].affectedRows ?? 0) !== 1) throw new Error("تعذر تثبيت خصم المحفظة؛ لم يتم إتمام الشراء");
    const owner = (await tx.select().from(walletAccounts).where(eq(walletAccounts.customerId, row.listing.ownerUserId)).limit(1))[0];
    if (!owner) throw new Error("محفظة صانع المحتوى غير متاحة");
    const reward = Number((amount * 0.8).toFixed(2));
    const ownerNext = Number(owner.balance) + reward;
    await tx.update(walletAccounts).set({ balance: ownerNext.toFixed(2), updatedAt: now }).where(eq(walletAccounts.id, owner.id));
    await tx.insert(walletTransactions).values([{ walletAccountId: buyer.id, customerId: input.buyerUserId, type: "debit", amount: amount.toFixed(2), balanceAfter: buyerNext.toFixed(2), referenceType: "content_purchase", referenceId: orderId, note: "شراء محتوى رقمي من المحفظة", createdAt: now }, { walletAccountId: owner.id, customerId: row.listing.ownerUserId, type: "credit", amount: reward.toFixed(2), balanceAfter: ownerNext.toFixed(2), referenceType: "content_reward", referenceId: orderId, note: "مكافأة بيع محتوى Studio بنسبة 80%", createdAt: now }]);
    await tx.insert(contentPurchaseEntitlements).values({ purchaseOrderId: orderId, listingId: row.listing.id, sourceMediaFileId: row.listing.mediaFileId, buyerUserId: input.buyerUserId, deliveredAt: now, createdAt: now });
    return { orderId, amount: amount.toFixed(2), reward: reward.toFixed(2), buyerBalance: buyerNext.toFixed(2), ownerBalance: ownerNext.toFixed(2), deliveredToLibrary: true };
  });
}

`;
source = source.slice(0, start) + replacement + source.slice(end);
writeFileSync(path, source);
