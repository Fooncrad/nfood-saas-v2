import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const appSource = readFileSync("client/src/App.tsx", "utf8");
const superAdminSource = readFileSync("client/src/pages/SuperAdminApp.tsx", "utf8");

describe("Super Admin account deep link", () => {
  it("keeps the dedicated account URL routed through the Super Admin shell", () => {
    expect(appSource).toContain('<Route path="/admin/account" component={SuperAdminRoute} />');
  });

  it("opens /admin/account directly on the platform Account Center", () => {
    expect(superAdminSource).toContain('window.location.pathname === "/admin/account" ? "accounts" : "overview"');
    expect(superAdminSource).toContain('case "accounts": return <AccountManagementPanel />;');
  });
});
