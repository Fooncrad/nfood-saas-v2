import { describe, expect, it } from "vitest";
import { recordUiError } from "./ErrorBoundary";

describe("ui error reporting", () => {
  it("is safe when browser storage is unavailable", () => {
    expect(() => recordUiError(new Error("sample failure"), "ui-test-123")).not.toThrow();
  });
});
