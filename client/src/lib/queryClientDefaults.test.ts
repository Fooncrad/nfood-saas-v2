import { describe, expect, it } from "vitest";
import { queryClientDefaults } from "./queryClientDefaults";

describe("query client defaults", () => {
  it("keeps navigation data warm without refetching on focus", () => {
    expect(queryClientDefaults.queries.staleTime).toBe(30_000);
    expect(queryClientDefaults.queries.gcTime).toBe(600_000);
    expect(queryClientDefaults.queries.refetchOnWindowFocus).toBe(false);
    expect(queryClientDefaults.queries.refetchOnReconnect).toBe(true);
    expect(queryClientDefaults.mutations.retry).toBe(0);
  });
});
