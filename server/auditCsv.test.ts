import { describe, expect, it } from "vitest";
import { auditLogsToCsv, getReceiptAuditActions } from "./auditCsv";

describe("audit CSV export", () => {
  it("selects only financial pricing events when requested", () => {
    expect(getReceiptAuditActions({ financialOnly: true })).toEqual(["restaurant.pricing.updated"]);
    expect(getReceiptAuditActions({ action: "receipt.delivery.failed" })).toEqual(["receipt.delivery.failed"]);
    expect(getReceiptAuditActions({})).toContain("receipt.template.updated");
  });
  it("creates UTF-8 CSV with escaped cells and removes sensitive metadata", () => {
    const csv = auditLogsToCsv([{ id: 7, action: "receipt.delivery.failed", entityType: "receipt_delivery", entityId: "42", outcome: "failure", actorRole: "cashier", requestId: "req-7", createdAt: new Date("2026-08-23T12:00:00.000Z"), metadata: JSON.stringify({ channel: "email", retryRecipient: "customer@example.com", authToken: "never-export", note: "a,b" }) }]);
    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toContain('"receipt.delivery.failed"');
    expect(csv).toContain('"{""channel"":""email"",""note"":""a,b""}"');
    expect(csv).not.toContain("customer@example.com");
    expect(csv).not.toContain("never-export");
  });
});
