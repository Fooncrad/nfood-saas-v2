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

function excelCell(value: string | number | null | undefined, tag = "td") {
  const text = value == null ? "" : String(value);
  const safe = text.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[char] ?? char);
  return `<${tag}>${safe}</${tag}>`;
}

export function auditLogsToExcel(rows: AuditCsvRow[]) {
  const header = ["id", "action", "entity_type", "entity_id", "outcome", "severity", "actor_role", "request_id", "created_at", "metadata"];
  const body = rows.map((row) => `<tr>${[row.id, row.action, row.entityType, row.entityId, row.outcome, row.severity ?? "info", row.actorRole, row.requestId, row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt, safeMetadata(row.metadata)].map((value) => excelCell(value)).join("")}</tr>`).join("");
  const headerCells = header.map((value) => excelCell(value, "th")).join("");
  return `\uFEFF<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:Tahoma,Arial,sans-serif;direction:rtl}table{border-collapse:collapse}th,td{border:1px solid #d8d0ca;padding:7px;text-align:right;mso-number-format:"\\@"}th{background:#f7ede5;font-weight:700}</style></head><body><table><thead><tr>${headerCells}</tr></thead><tbody>${body}</tbody></table></body></html>`;
}
