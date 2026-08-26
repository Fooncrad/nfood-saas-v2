import { readFileSync, writeFileSync } from "node:fs";

const path = "server/routers.ts";
let source = readFileSync(path, "utf8");
source = source.replace(
  "listCustomerContentPurchaseOrders, listRestaurantManagerUserIds,",
  "listCustomerContentPurchaseOrders, listRestaurantManagerUserIds, getMerchantRestaurantId, listContentLibraryForBuyer,",
);
const marker = "    purchaseContentWithWallet:";
const start = source.indexOf(marker);
const end = source.indexOf("    myContentReviewStatus:", start);
if (start < 0 || end < 0) throw new Error("content purchase route markers not found");
const replacement = `    contentPurchaseEligibility: protectedProcedure.query(async ({ ctx }) => { const testRole = String(ctx.user.testRole ?? ""); const restaurantRoles = ["restaurant_admin", "waiter", "cashier", "kitchen", "bar", "merchant"]; const restaurantId = ctx.user.restaurantId ?? await getMerchantRestaurantId(ctx.user.id); const canBuy = restaurantRoles.includes(testRole) || Boolean(restaurantId && testRole !== "customer" && testRole !== "driver"); return { canBuy, buyerType: canBuy ? "merchant" as const : "customer" as const, restaurantId: canBuy ? restaurantId : null, message: canBuy ? "الشراء متاح لهذا الحساب التجاري" : "التصفح متاح، والشراء مخصص للحسابات التجارية والمطاعم" }; }),
    purchaseContentWithWallet: protectedProcedure.input(z.object({ listingId: z.number().int().positive() })).mutation(async ({ ctx, input }) => { const testRole = String(ctx.user.testRole ?? ""); const merchantRoles = ["restaurant_admin", "waiter", "cashier", "kitchen", "bar", "merchant"]; const restaurantId = ctx.user.restaurantId ?? await getMerchantRestaurantId(ctx.user.id); if (!merchantRoles.includes(testRole) && !(restaurantId && testRole !== "customer" && testRole !== "driver")) throw new TRPCError({ code: "FORBIDDEN", message: "التصفح متاح للعميل، أما شراء المحتوى فمتاح للمطاعم والحسابات التجارية فقط" }); if (!restaurantId) throw new TRPCError({ code: "FORBIDDEN", message: "اربط الحساب التجاري بمطعم قبل شراء المحتوى" }); const result = await purchaseContentWithWallet({ listingId: input.listingId, buyerUserId: ctx.user.id, buyerType: "merchant", restaurantId }); await insertAuditLog({ actorUserId: ctx.user.id, restaurantId, action: "content.wallet.purchase", entityType: "content_purchase", entityId: String(result.orderId), outcome: "success", requestId: nanoid(12), metadata: JSON.stringify({ listingId: input.listingId, buyerType: "merchant", amount: result.amount, reward: result.reward, deliveredToLibrary: result.deliveredToLibrary }) }); return { success: true, ...result }; }),
    myContentLibrary: protectedProcedure.query(({ ctx }) => listContentLibraryForBuyer(ctx.user.id)),
`;
source = source.slice(0, start) + replacement + source.slice(end);
writeFileSync(path, source);
