export const RECEIPT_AUDIT_ACTIONS = ["restaurant.pricing.updated", "receipt.template.updated", "receipt.logo.updated", "receipt.delivery.sent", "receipt.delivery.failed"] as const;
export type ReceiptAuditAction = typeof RECEIPT_AUDIT_ACTIONS[number];
export function getReceiptAuditActions(input: { action?: ReceiptAuditAction; financialOnly?: boolean }): ReceiptAuditAction[] { return input.financialOnly ? ["restaurant.pricing.updated"] : input.action ? [input.action] : [...RECEIPT_AUDIT_ACTIONS]; }

export type AuditCsvRow = {
  id: number;
  action: string;
  entityType: string | null;
  entityId: string | null;
  outcome: string | null;
  severity?: "critical" | "warning" | "info";
  actorRole: string | null;
  requestId: string | null;
  createdAt: Date | string;
  metadata: string | null;
};

function csvCell(value: string | number | null | undefined) {
  const text = value == null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function safeMetadata(raw: string | null) {
  if (!raw) return "";
  try {
    const value = JSON.parse(raw) as Record<string, unknown>;
    delete value.retryRecipient;
    delete value.authToken;
    delete value.password;
    delete value.secret;
    return JSON.stringify(value);
  } catch {
    return "";
  }
}

export function auditLogsToCsv(rows: AuditCsvRow[]) {
  const header = ["id", "action", "entity_type", "entity_id", "outcome", "severity", "actor_role", "request_id", "created_at", "metadata"].map(csvCell).join(",");
  const body = rows.map((row) => [row.id, row.action, row.entityType, row.entityId, row.outcome, row.severity ?? "info", row.actorRole, row.requestId, row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt, safeMetadata(row.metadata)].map(csvCell).join(","));
  return `\uFEFF${[header, ...body].join("\r\n")}\r\n`;
}
