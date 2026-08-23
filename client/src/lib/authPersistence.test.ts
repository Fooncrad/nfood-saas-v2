import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("login session persistence contract", () => {
  it("refreshes auth.me after test login without forcing a reload", () => {
    const homeSource = readFileSync(
      resolve(process.cwd(), "client/src/pages/Home.tsx"),
      "utf8"
    );
    const loginBlock = homeSource.match(
      /const testLogin = trpc\.auth\.testLogin\.useMutation\(\{([\s\S]*?)\n  const adminReturn/
    )?.[1];

    expect(loginBlock).toBeTruthy();
    expect(loginBlock).toContain("trpcUtils.auth.me.invalidate()");
    expect(loginBlock).not.toContain("window.location.reload()");
  });
});

// This is an intentional source-level contract test: the login mutation is
// defined inside a page component, so the persistence invariant belongs next
// to the code path that can regress it.
