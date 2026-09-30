import { describe, expect, it } from "vitest";
import { classifyPosOfflineError, shouldRetryPosOffline } from "./posOfflineStore";

describe("POS offline error classification", () => {
  it("treats an idempotency conflict as already synchronized", () => {
    const error = { data: { code: "CONFLICT", httpStatus: 409 } };
    expect(classifyPosOfflineError(error)).toBe("duplicate");
    expect(shouldRetryPosOffline(error)).toBe(false);
  });

  it("never retries validation and permission errors, including wrapped tRPC errors", () => {
    expect(classifyPosOfflineError({ data: { code: "BAD_REQUEST" } })).toBe("terminal");
    expect(classifyPosOfflineError({ shape: { data: { code: "FORBIDDEN" } } })).toBe("terminal");
    expect(classifyPosOfflineError({ cause: { data: { code: "UNAUTHORIZED" } } })).toBe("terminal");
    expect(classifyPosOfflineError({ response: { status: 422 } })).toBe("terminal");
  });

  it("keeps network, server, timeout, and rate-limit failures retryable", () => {
    expect(classifyPosOfflineError(new TypeError("Failed to fetch"))).toBe("retry");
    expect(classifyPosOfflineError({ data: { code: "INTERNAL_SERVER_ERROR", httpStatus: 500 } })).toBe("retry");
    expect(classifyPosOfflineError({ response: { status: 408 } })).toBe("retry");
    expect(classifyPosOfflineError({ response: { status: 429 } })).toBe("retry");
  });

  it("handles cyclic error causes safely", () => {
    const error: { cause?: unknown } = {};
    error.cause = error;
    expect(classifyPosOfflineError(error)).toBe("retry");
  });
});
