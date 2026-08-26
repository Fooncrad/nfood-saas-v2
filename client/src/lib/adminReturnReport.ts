export type AdminReturnReport = { durationMinutes?: number | null; actions?: string[]; result?: string };

export const ADMIN_RETURN_REPORT_KEY = "nfood-admin-return-report";

export function saveAdminReturnReport(report: unknown) {
  if (typeof window !== "undefined") window.sessionStorage.setItem(ADMIN_RETURN_REPORT_KEY, JSON.stringify(report));
}

export function consumeAdminReturnReport(): AdminReturnReport | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(ADMIN_RETURN_REPORT_KEY);
  if (!raw) return null;
  window.sessionStorage.removeItem(ADMIN_RETURN_REPORT_KEY);
  try { return JSON.parse(raw) as AdminReturnReport; } catch { return {}; }
}

export function formatAdminReturnReport(report: AdminReturnReport) {
  const duration = report.durationMinutes === null || report.durationMinutes === undefined ? "" : ` — المدة ${report.durationMinutes} دقيقة`;
  return `تم إنهاء جلسة العميل وتسجيل التقرير${duration}`;
}
