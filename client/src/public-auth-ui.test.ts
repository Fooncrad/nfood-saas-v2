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
  });

  it("exposes a visible registration back action and left social rail", () => {
    const register = read("./components/RegisterScreen.tsx");
    const social = read("./components/FloatingSupportActions.tsx");
    expect(register).toContain('onClick={onBack}');
    expect(social).toContain("fixed left-4 top-1/2");
    expect(social).toContain("nfood-social-float");
  });
});
