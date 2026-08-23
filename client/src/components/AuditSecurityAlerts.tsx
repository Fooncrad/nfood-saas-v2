import { useEffect, useRef, useState } from "react";
import { AlertTriangle, ShieldAlert, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const SENSITIVE_ACTIONS = new Set(["order.status.updated", "team.account.updated", "team.account.created", "role.permissions.updated", "restaurant.pricing.updated"]);

export function AuditSecurityAlerts({ restaurantId }: { restaurantId?: number }) {
  const [dismissed, setDismissed] = useState<number | null>(null);
  const seen = useRef<number | null>(null);
  const query = trpc.platform.activityAuditLogs.useQuery({ restaurantId: restaurantId ?? 0, limit: 25 }, { enabled: Boolean(restaurantId), refetchInterval: 5000, retry: false });
  const event = query.data?.find((item) => SENSITIVE_ACTIONS.has(item.action) && (item.action !== "order.status.updated" || item.metadata?.includes('"toStatus":"cancelled"')));
  useEffect(() => { if (!event?.id || seen.current === event.id) return; seen.current = event.id; setDismissed(null); const isCancellation = event.action === "order.status.updated"; const title = isCancellation ? "تم إلغاء طلب" : "إجراء إداري حساس"; const description = `${event.action} · ${event.actorName ?? event.actorRole ?? "غير معروف"}`; if (event.severity === "critical") toast.error(title, { description, duration: 7000 }); else if (event.severity === "warning") toast.warning(title, { description, duration: 6000 }); else toast.info(title, { description, duration: 5000 }); }, [event?.action, event?.actorName, event?.actorRole, event?.id, event?.severity]);
  if (!event || dismissed === event.id) return null;
  const isCancellation = event.action === "order.status.updated";
  return <div role="status" className={`mx-4 mt-3 flex items-start gap-3 rounded-2xl border p-3 shadow-sm ${isCancellation ? "border-red-200 bg-red-50 text-red-900" : "border-amber-200 bg-amber-50 text-amber-900"}`}><div className="rounded-xl bg-white/70 p-2">{isCancellation ? <AlertTriangle className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}</div><div className="min-w-0 flex-1"><p className="text-sm font-black">{isCancellation ? "تم إلغاء طلب" : "تغيير حساس في حسابات المطعم"}</p><p className="mt-1 text-xs opacity-80">الإجراء: {event.action} · المستخدم: {event.actorName ?? event.actorRole ?? "غير معروف"} · {new Date(event.createdAt).toLocaleString("ar-SA")}</p></div><Button variant="ghost" size="icon" onClick={() => setDismissed(event.id)} aria-label="إخفاء التنبيه" className="shrink-0"><X className="h-4 w-4" /></Button></div>;
}
