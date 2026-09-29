import { describe, expect, it } from "vitest";
import { shouldRetryPosOffline } from "./posOfflineStore";

describe("POS offline retry classification", () => {
  it.each(["BAD_REQUEST", "FORBIDDEN", "UNAUTHORIZED", "NOT_FOUND", "PRECONDITION_FAILED", "UNPROCESSABLE_CONTENT", "CONFLICT"])(
    "does not turn terminal %s errors into pending sync retries",
    (code) => {
      expect(shouldRetryPosOffline({ data: { code } })).toBe(false);
    },
  );

  it("reads terminal codes from nested TRPC error shapes", () => {
    expect(shouldRetryPosOffline({ shape: { data: { code: "FORBIDDEN" } } })).toBe(false);
  });

  it("retries network and temporary server failures", () => {
    expect(shouldRetryPosOffline(new Error("network unavailable"))).toBe(true);
    expect(shouldRetryPosOffline({ data: { code: "INTERNAL_SERVER_ERROR" } })).toBe(true);
    expect(shouldRetryPosOffline({ data: { code: "TIMEOUT" } })).toBe(true);
  });
});
