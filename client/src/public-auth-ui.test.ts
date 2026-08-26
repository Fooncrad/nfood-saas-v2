import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

describe("public authentication and social UI contracts", () => {
  it("routes the public header login action to the real login screen", () => {
    const source = read("./pages/PublicInfoPages.tsx");
    expect(source).toContain('<Link href="/login"');
    expect(source).not.toContain('<Link href="/" className="rounded-xl px-3 py-2 text-sm font-bold text-slate-600">{c.login}</Link>');
  });

  it("keeps the login button interactive until a request is pending", () => {
    const source = read("./components/TestLoginScreen.tsx");
    expect(source).toContain('disabled={pending}');
    expect(source).toContain("Enter your email and password first.");
    expect(source).toContain("text-slate-900 dark:text-white");
    expect(source).toContain("LoaderCircle");
    expect(source).toContain("role=\"alert\"");
    expect(source).toContain("backdrop-blur-2xl");
    expect(source).toContain("nfood-auth-slide-in");
    expect(source).toContain("showPassword");
    expect(source).toContain("EyeOff");
    expect(source).toContain('role="status"');
  });

  it("exposes a visible registration back action and left social rail", () => {
    const register = read("./components/RegisterScreen.tsx");
    const social = read("./components/FloatingSupportActions.tsx");
    expect(register).toContain('onClick={onBack}');
    expect(social).toContain("fixed left-4 top-1/2");
    expect(social).toContain("nfood-social-float");
  });

  it("allows customers to create and use a password from the public menu account dialog", () => {
    const menu = read("./pages/RestaurantPublic.tsx");
    const router = read("../../server/routers.ts");
    expect(menu).toContain("accountPassword");
    expect(menu).toContain("accountPasswordConfirm");
    expect(menu).toContain("registerCustomer.mutate({ name: accountName.trim(), email: accountEmail.trim(), password: accountPassword, restaurantId })");
    expect(menu).toContain("getDeviceFingerprint().then((deviceFingerprintHash) => loginCustomer.mutate({ email: accountEmail.trim(), password: accountPassword, restaurantId, deviceFingerprintHash, deviceLabel: getDeviceLabel() }))");
    expect(menu).toContain("showAccountPassword");
    expect(router).toContain("registerCustomer: publicProcedure.input(z.object({ name: z.string().trim().min(2).max(160), email: z.string().trim().email().max(320), password: z.string().min(8).max(128), restaurantId: z.number().int().positive().optional() }))");
    expect(router).toContain("loginCustomer: publicProcedure.input");
    expect(router).toContain("linkCustomerRestaurant: protectedProcedure");
    expect(router).toContain("scryptSync(input.password");
    expect(router).not.toContain("return { success: true, name: user.name, password");
  });
});
