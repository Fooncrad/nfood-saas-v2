export type AuditCsvRow = {
  id: number;
  action: string;
  entityType: string | null;
  entityId: string | null;
  outcome: string | null;
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
  const header = ["id", "action", "entity_type", "entity_id", "outcome", "actor_role", "request_id", "created_at", "metadata"].map(csvCell).join(",");
  const body = rows.map((row) => [row.id, row.action, row.entityType, row.entityId, row.outcome, row.actorRole, row.requestId, row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt, safeMetadata(row.metadata)].map(csvCell).join(","));
  return `\uFEFF${[header, ...body].join("\r\n")}\r\n`;
}
