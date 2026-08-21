import { describe, expect, it } from "vitest";
import { getTableName } from "drizzle-orm";
import { apiWebhooks, supportAgents, supportTickets } from "../drizzle/schema";
import { readFileSync } from "node:fs";

describe("support and webhook schema", () => {
  it("defines isolated support resources", () => {
    expect(getTableName(supportAgents)).toBe("supportAgents");
    expect(getTableName(supportTickets)).toBe("supportTickets");
    expect(getTableName(apiWebhooks)).toBe("apiWebhooks");
  });

  it("does not expose webhook secret in the public list projection", () => {
    const dbSource = readFileSync(new URL("./db.ts", import.meta.url), "utf8");
    const listFunction = dbSource.slice(dbSource.indexOf("export async function listApiWebhooks"), dbSource.indexOf("export async function upsertApiWebhook"));
    expect(listFunction).not.toContain("secretHash: apiWebhooks.secretHash");
  });
});
