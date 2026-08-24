import { useMemo, useState } from "react";
import { ExternalLink, KeyRound, LockKeyhole, Save } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function IntegrationsSettings() {
  const catalog = trpc.platform.integrationCatalog.useQuery();
  const settings = trpc.platform.integrationSettings.useQuery(
    { scope: "platform" },
    { retry: false }
  );
  const save = trpc.platform.upsertIntegrationSetting.useMutation({
    onSuccess: () => {
      void settings.refetch();
      toast.success("تم حفظ إعداد التكامل بأمان");
    },
    onError: error => toast.error(error.message),
  });
  const existing = useMemo(
    () => new Map((settings.data ?? []).map(item => [item.providerKey, item])),
    [settings.data]
  );
  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#f7f8fb] p-5 text-slate-900 sm:p-8"
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-[#e76f3c]">
              الإعدادات والتكاملات
            </p>
            <h1 className="mt-1 text-2xl font-black">مركز تكاملات المنصة</h1>
            <p className="mt-2 text-sm text-slate-500">
              تُدار التكاملات المشتركة من مركز المنصة، وتظهر للمطاعم المؤهلة حسب
              باقتها دون إنشاء إعدادات منفصلة لكل مطعم.
            </p>
          </div>
          <Link href="/">
            <Button variant="outline" className="rounded-xl">
              العودة للوحة
            </Button>
          </Link>
        </div>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-cyan-100 bg-cyan-50/70 p-4">
          <div>
            <p className="font-black text-cyan-900">تكاملات مركزية مشتركة</p>
            <p className="mt-1 text-xs leading-5 text-cyan-800">
              Google متاح لتسجيل الدخول العام. أما SMS والبريد وبقية التكاملات
              المدفوعة فتُدار مركزيًا وتُفعّل للمطاعم حسب أهلية الباقة.
            </p>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-[11px] font-black text-cyan-800">
            نطاق المنصة فقط
          </span>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {(catalog.data ?? []).map(provider => {
            const setting = existing.get(provider.providerKey);
            return (
              <IntegrationCard
                key={provider.providerKey}
                provider={provider}
                setting={setting}
                onSave={payload => save.mutate(payload)}
                pending={save.isPending}
              />
            );
          })}
        </div>
      </div>
    </main>
  );
}

function IntegrationCard({
  provider,
  setting,
  onSave,
  pending,
}: {
  provider: {
    providerKey: string;
    category: string;
    label: string;
    setupUrl: string;
    scopes: string;
  };
  setting?: {
    status: "not_configured" | "configured" | "disabled";
    keyReference: string | null;
  };
  onSave: (input: {
    scope: "platform";
    providerKey: string;
    category: string;
    status: "not_configured" | "configured" | "disabled";
    keyReference?: string;
    secret?: string;
  }) => void;
  pending: boolean;
}) {
  const [secret, setSecret] = useState("");
  const [keyReference, setKeyReference] = useState(setting?.keyReference ?? "");
  const [status, setStatus] = useState<
    "not_configured" | "configured" | "disabled"
  >(setting?.status ?? "not_configured");
  const isPublicLogin =
    provider.providerKey === "google_oauth" ||
    provider.providerKey === "google" ||
    provider.providerKey === "oauth_google";
  return (
    <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-start justify-between gap-3 text-base">
          <span className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-[#e76f3c]" />
            {provider.label}
            {!isPublicLogin && (
              <span
                title="يتطلب ترقية الباقة"
                className="rounded-full bg-violet-50 p-1 text-violet-700"
              >
                <LockKeyhole className="h-3.5 w-3.5" />
              </span>
            )}
          </span>
          <span
            className={`rounded-full px-2 py-1 text-[10px] ${status === "configured" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
          >
            {status === "configured" ? "مفعّل" : "غير مفعّل"}
          </span>
        </CardTitle>
        <p className="text-xs text-slate-500">{provider.scopes}</p>
        {isPublicLogin && (
          <p className="mt-2 rounded-lg bg-emerald-50 px-3 py-2 text-[11px] leading-5 text-emerald-800">
            تسجيل الدخول عبر Google تكامل عام متاح للمطاعم والمستخدمين، ولا
            يرتبط بباقة مدفوعة.
          </p>
        )}
        {provider.providerKey === "otp_sms" && (
          <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-[11px] leading-5 text-amber-800">
            لإرسال SMS: احفظ السر بصيغة JSON مثل{" "}
            {`{"accountSid":"AC...","authToken":"...","from":"+966..."}`}، ولا
            تعرضه أو تضعه في الواجهة.
          </p>
        )}
        {provider.providerKey === "smtp" && (
          <p className="mt-2 rounded-lg bg-blue-50 px-3 py-2 text-[11px] leading-5 text-blue-800">
            إرسال البريد يعتمد على إعدادات SMTP_HOST وSMTP_USER وSMTP_PASSWORD
            وSMTP_FROM_EMAIL في الخادم، ويمكن اختبارها من بيئة الاستضافة دون
            إضافة إعدادات مطعم منفصلة.
          </p>
        )}
        {!isPublicLogin && (
          <p className="mt-2 rounded-lg bg-violet-50 px-3 py-2 text-[11px] leading-5 text-violet-800">
            هذا التكامل مركزي ومدفوع؛ إتاحته للمطاعم تعتمد على الباقة والميزة
            المفعلة للحساب.
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <Input
          value={keyReference}
          onChange={event => setKeyReference(event.target.value)}
          placeholder="اسم المفتاح أو Client ID (اختياري)"
          className="rounded-xl"
          dir="ltr"
        />
        <Input
          value={secret}
          onChange={event => setSecret(event.target.value)}
          placeholder={
            setting?.status === "configured"
              ? "اتركه فارغًا للإبقاء على السر المحفوظ"
              : "ألصق المفتاح لاحقًا"
          }
          type="password"
          className="rounded-xl"
          dir="ltr"
        />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <select
            value={status}
            onChange={event => setStatus(event.target.value as typeof status)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs"
          >
            <option value="not_configured">غير مفعّل</option>
            <option value="configured">مفعّل</option>
            <option value="disabled">معطّل</option>
          </select>
          <div className="flex gap-2">
            <a
              href={provider.setupUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center gap-1 rounded-xl border border-slate-200 px-3 text-xs font-bold text-[#e76f3c]"
            >
              <ExternalLink className="h-4 w-4" />
              إنشاء المفتاح
            </a>
            <Button
              disabled={pending}
              onClick={() =>
                onSave({
                  scope: "platform",
                  providerKey: provider.providerKey,
                  category: provider.category,
                  status,
                  keyReference: keyReference || undefined,
                  secret: secret || undefined,
                })
              }
              className="rounded-xl bg-[#e76f3c]"
            >
              <Save className="ml-1 h-4 w-4" />
              حفظ
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
