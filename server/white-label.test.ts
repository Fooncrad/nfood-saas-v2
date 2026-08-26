import fs from "node:fs";
import { describe, expect, it } from "vitest";

const schema = fs.readFileSync("drizzle/schema.ts", "utf8");
const migration = fs.readFileSync("drizzle/0154_nifty_phantom_reporter.sql", "utf8");
const db = fs.readFileSync("server/db.ts", "utf8");
const routers = fs.readFileSync("server/routers.ts", "utf8");
const panel = fs.readFileSync("client/src/components/WhiteLabelWorkspacePanel.tsx", "utf8");
const overview = fs.readFileSync("client/src/components/PlatformOverview.tsx", "utf8");

describe("White Label enterprise foundation", () => {
  it("stores tenant identity and module configuration independently", () => {
    expect(schema).toContain('export const whiteLabelWorkspaces = mysqlTable("whiteLabelWorkspaces"');
    expect(schema).toContain("customDomain: varchar(\"customDomain\"");
    expect(schema).toContain("enabledModulesJson: text(\"enabledModulesJson\").notNull()");
    expect(migration).toContain("CREATE TABLE `whiteLabelWorkspaces`");
    expect(migration).not.toContain("DEFAULT ('[]')");
  });

  it("provides audited admin-only create and update procedures", () => {
    expect(db).toContain("createWhiteLabelWorkspace");
    expect(db).toContain("updateWhiteLabelWorkspace");
    expect(routers).toContain("whiteLabelWorkspaces: adminProcedure");
    expect(routers).toContain("createWhiteLabelWorkspace: adminProcedure");
    expect(routers).toContain("updateWhiteLabelWorkspace: adminProcedure");
    expect(routers).toContain("white_label.workspace.created");
    expect(routers).toContain("white_label.workspace.updated");
  });

  it("is visible from the consolidated platform overview", () => {
    expect(overview).toContain("<WhiteLabelWorkspacePanel />");
    expect(panel).toContain("النطاق المخصص");
    expect(panel).toContain("الوحدات المفعلة");
    expect(panel).toContain("حفظ التعديلات");
  });
});
