import { useMemo, useState } from "react";
import { Link } from "wouter";
import { Download, FileCheck2, FileText, RefreshCw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";

function downloadFile(name: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function SubscriptionReceiptsAdminPage() {
  const { language } = useLanguage();
  const [status, setStatus] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const input = useMemo(() => ({ status: status === "all" ? undefined : status, from: from ? new Date(`${from}T00:00:00`) : undefined, to: to ? new Date(`${to}T23:59:59`) : undefined }), [status, from, to]);
  const query = trpc.admin.subscriptionTransferReceipts.useQuery(undefined, { retry: false });
  const csv = trpc.admin.exportSubscriptionTransferReceiptsCsv.useQuery(input, { enabled: false, retry: false });
  const excel = trpc.admin.exportSubscriptionTransferReceiptsExcel.useQuery(input, { enabled: false, retry: false });
  const rows = (query.data ?? []).filter((row) => !input.status || row.status === input.status).filter((row) => !input.from || new Date(row.createdAt) >= input.from).filter((row) => !input.to || new Date(row.createdAt) <= input.to);
  const text = language === "ar" ? { title: "إيصالات التحويل البنكي", subtitle: "صفحة مستقلة للمراجعة المالية والتصدير", all: "الكل", pending: "قيد المراجعة", approved: "معتمد", rejected: "مرفوض", from: "من تاريخ", to: "إلى تاريخ", refresh: "تحديث", csv: "تصدير CSV", excel: "تصدير Excel", empty: "لا توجد إيصالات مطابقة", open: "فتح الإيصال", approve: "اعتماد", reject: "رفض", back: "العودة إلى لوحة الإدارة" } : language === "fr" ? { title: "Reçus de virement", subtitle: "Révision financière et export", all: "Tous", pending: "En vérification", approved: "Approuvés", rejected: "Refusés", from: "Du", to: "Au", refresh: "Actualiser", csv: "Exporter CSV", excel: "Exporter Excel", empty: "Aucun reçu correspondant", open: "Ouvrir", approve: "Approuver", reject: "Refuser", back: "Retour au tableau de bord" } : { title: "Bank transfer receipts", subtitle: "Financial review and export", all: "All", pending: "Pending", approved: "Approved", rejected: "Rejected", from: "From date", to: "To date", refresh: "Refresh", csv: "Export CSV", excel: "Export Excel", empty: "No matching receipts", open: "Open receipt", approve: "Approve", reject: "Reject", back: "Back to dashboard" };
  const review = trpc.admin.reviewSubscriptionTransferReceipt.useMutation({ onSuccess: () => void query.refetch() });
  const statusLabel = (value: string) => value === "approved" ? text.approved : value === "rejected" ? text.rejected : text.pending;
  return <main dir={language === "ar" ? "rtl" : "ltr"} className="min-h-screen bg-[#f7f8fb] p-5 text-[#172235] sm:p-8"><div className="mx-auto max-w-7xl"><div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><Link href="/dashboard" className="text-xs font-bold text-[#e76f3c]">{text.back}</Link><h1 className="mt-2 text-3xl font-black">{text.title}</h1><p className="mt-1 text-sm text-slate-500">{text.subtitle}</p></div><div className="flex flex-wrap gap-2"><Button type="button" variant="outline" onClick={() => void query.refetch()} className="rounded-xl"><RefreshCw className="me-2 h-4 w-4" />{text.refresh}</Button><Button type="button" disabled={csv.isFetching} onClick={async () => { const result = await csv.refetch(); if (result.data) downloadFile(result.data.fileName, result.data.csv, "text/csv;charset=utf-8"); }} className="rounded-xl bg-[#172235]"><Download className="me-2 h-4 w-4" />{text.csv}</Button><Button type="button" disabled={excel.isFetching} onClick={async () => { const result = await excel.refetch(); if (result.data) downloadFile(result.data.fileName, result.data.excel, "application/vnd.ms-excel;charset=utf-8"); }} className="rounded-xl bg-[#e76f3c]"><FileText className="me-2 h-4 w-4" />{text.excel}</Button></div></div><Card className="rounded-2xl border-slate-200 bg-white"><CardHeader><CardTitle className="flex items-center gap-2 text-base"><ShieldCheck className="h-5 w-5 text-[#e76f3c]" />{rows.length} {language === "ar" ? "إيصال" : "receipts"}</CardTitle></CardHeader><CardContent><div className="mb-5 grid gap-3 sm:grid-cols-3"><select value={status} onChange={(event) => setStatus(event.target.value as typeof status)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"><option value="all">{text.all}</option><option value="pending">{text.pending}</option><option value="approved">{text.approved}</option><option value="rejected">{text.rejected}</option></select><label className="text-xs font-bold text-slate-500">{text.from}<Input type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="mt-1 rounded-xl" /></label><label className="text-xs font-bold text-slate-500">{text.to}<Input type="date" value={to} onChange={(event) => setTo(event.target.value)} className="mt-1 rounded-xl" /></label></div>{query.isLoading ? <div className="h-32 animate-pulse rounded-xl bg-slate-100" /> : rows.length === 0 ? <p className="rounded-xl bg-slate-50 p-8 text-center text-sm text-slate-500">{text.empty}</p> : <div className="space-y-3">{rows.map((row) => <div key={row.id} className="grid gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 lg:grid-cols-[1fr_auto] lg:items-center"><div><div className="flex flex-wrap items-center gap-2"><p className="font-black">{row.plan} · {row.amount} SAR</p><Badge className={row.status === "approved" ? "bg-emerald-100 text-emerald-700" : row.status === "rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}>{statusLabel(row.status)}</Badge></div><p className="mt-1 text-sm text-slate-500" dir="ltr">{row.email}</p><p className="mt-1 text-xs text-slate-400">{new Date(row.createdAt).toLocaleString("ar-SA-u-ca-gregory-nu-latn")}</p>{row.reviewNote && <p className="mt-2 rounded-xl bg-red-50 p-2 text-xs text-red-700">{row.reviewNote}</p>}</div><div className="flex flex-wrap gap-2"><a href={row.fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold"><FileCheck2 className="me-1 h-4 w-4" />{text.open}</a>{row.status === "pending" && <><Button type="button" disabled={review.isPending} onClick={() => review.mutate({ id: row.id, status: "approved" })} className="rounded-xl bg-emerald-600 text-xs">{text.approve}</Button><Button type="button" disabled={review.isPending} onClick={() => review.mutate({ id: row.id, status: "rejected", reviewNote: "يرجى مراجعة بيانات التحويل وإعادة رفع الإيصال." })} className="rounded-xl bg-red-600 text-xs">{text.reject}</Button></>}</div></div>)}</div>}</CardContent></Card></div></main>;
}

export { downloadFile };
