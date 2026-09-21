import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const dashboardSource = readFileSync(
  new URL('./CentralAdminDashboard.tsx', import.meta.url),
  'utf8',
);

describe('Super Admin production guardrails', () => {
  it('never reintroduces the deprecated testAccounts model', () => {
    expect(dashboardSource).not.toContain('testAccounts');
  });

  it('does not expose a standalone global orders/reservations navigation item', () => {
    expect(dashboardSource).not.toContain("setCurrentSection('orders')");
    expect(dashboardSource).not.toContain("setCurrentSection('reservations')");
  });

  it('keeps the public site and marketplace entry points available', () => {
    expect(dashboardSource).toContain('href="/"');
    expect(dashboardSource).toContain('href="/marketplace"');
  });

  it('keeps the approved five-card KPI layout', () => {
    expect(dashboardSource).toContain('xl:grid-cols-5');
  });

  it('does not present unprobed services as healthy', () => {
    expect(dashboardSource).toContain("'غير مفحوص'");
    expect(dashboardSource).toContain("'Not checked'");
    expect(dashboardSource).not.toContain("'All systems operational'");
  });

  it('does not restore the old hard-coded demo activity chart', () => {
    expect(dashboardSource).not.toContain('[38,52,45,66,58,73,62,84,70,91,76,88]');
    expect(dashboardSource).toContain('no demo figures are shown');
  });
});
