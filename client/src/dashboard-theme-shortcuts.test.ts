import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (relativePath: string) => readFileSync(resolve(process.cwd(), "client/src", relativePath), "utf8");

describe("dashboard theme, notifications, and shortcuts", () => {
  it("exposes a persistent dark-mode control in the header", () => {
    const home = read("pages/Home.tsx");
    expect(home).toContain("useTheme");
    expect(home).toContain("toggleTheme");
    expect(home).toContain("dark:border-slate-700");
    expect(home).toContain("Sun");
    expect(home).toContain("Moon");
  });

  it("supports safe keyboard navigation and interactive notifications", () => {
    const home = read("pages/Home.tsx");
    expect(home).toContain("event.altKey");
    expect(home).toContain("visibleNavItems[Number(event.key) - 1]");
    expect(home).toContain('aria-expanded={notificationOpen}');
    expect(home).toContain("markNotificationRead.mutate");
    expect(home).toContain("deleteAllNotifications");
    expect(home).toContain("notificationPreferencesJson");
    expect(home).toContain("soundEnabled");
    expect(home).toContain("vibrationEnabled");
    expect(home).toContain("إعدادات الإشعارات");
    expect(home).toContain("حذف الكل");
    expect(home).toContain('aria-label={t("globalSearch")}');
    expect(home).toContain('notificationFilter === "unread"');
    expect(home).toContain('notificationFilter === "all"');
    expect(home).toContain('title="الإشعارات · Ctrl+Shift+N"');
    const css = read("index.css");
    expect(css).toContain("nfood-notification-popover");
    expect(css).toContain("nfood-notification-pulse");
    expect(css).toContain("prefers-reduced-motion: reduce");
  });

  it("keeps platform KPIs data-backed and readable in both themes", () => {
    const overview = read("components/PlatformOverview.tsx");
    const css = read("index.css");
    expect(overview).toContain("monthlyRecurringRevenue");
    expect(overview).toContain("تفاصيل التقرير");
    expect(overview).toContain("dark:bg-slate-900/90");
    expect(overview).toContain("hover:-translate-y-0.5");
    expect(css).toContain(".dark .nfood-dashboard-shell");
    expect(css).toContain("background-color: #111c2f");
    expect(css).toContain("color: #f8fafc");
  });
});
