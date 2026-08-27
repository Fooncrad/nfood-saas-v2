import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const page = readFileSync(new URL("../pages/AccountProfileSettings.tsx", import.meta.url), "utf8");
const app = readFileSync(new URL("../App.tsx", import.meta.url), "utf8");
const home = readFileSync(new URL("../pages/Home.tsx", import.meta.url), "utf8");

describe("account profile image flow", () => {
  it("exposes a protected account profile route and links it from the profile menu", () => {
    expect(app).toContain('path="/account-profile"');
    expect(home).toContain('window.location.assign("/account-profile")');
  });

  it("uses a visible skeleton while the root session is loading", () => {
    expect(app).toContain("if (loading) return <PageLoading />");
    expect(app).toContain("animate-pulse");
  });

  it("uploads account images through storage and persists avatarUrl", () => {
    expect(page).toContain("trpc.media.upload.useMutation");
    expect(page).toContain('scope: "user"');
    expect(page).toContain("trpc.auth.updateAvatar.useMutation");
    expect(page).toContain("avatarUrl: result.url");
    expect(page).toContain("updateAvatar.mutate({ avatarUrl: null })");
  });
});
