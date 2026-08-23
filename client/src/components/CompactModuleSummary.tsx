import type { LucideIcon } from "lucide-react";
import { ArrowUpLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export type CompactMetric = {
  label: string;
  value: string | number;
  hint: string;
  icon: LucideIcon;
  tone?: "orange" | "blue" | "emerald" | "violet" | "slate";
};

type CompactModuleSummaryProps = {
  metrics: CompactMetric[];
  className?: string;
};

const toneClasses: Record<NonNullable<CompactMetric["tone"]>, string> = {
  orange: "bg-orange-50 text-orange-600",
  blue: "bg-blue-50 text-blue-600",
  emerald: "bg-emerald-50 text-emerald-600",
  violet: "bg-violet-50 text-violet-600",
  slate: "bg-slate-100 text-slate-600",
};

export function CompactModuleSummary({ metrics, className = "" }: CompactModuleSummaryProps) {
  return (
    <div className={`grid grid-cols-2 gap-3 xl:grid-cols-4 ${className}`}>
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.label} className="rounded-2xl border-slate-200/80 bg-white shadow-sm">
            <CardContent className="p-3.5 md:p-4">
              <div className="flex items-start justify-between gap-2">
                <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${toneClasses[metric.tone ?? "slate"]}`}><Icon className="h-4 w-4" /></span>
                <ArrowUpLeft className="h-3.5 w-3.5 text-slate-300" />
              </div>
              <p className="mt-3 truncate text-[11px] font-medium text-slate-500">{metric.label}</p>
              <p className="mt-0.5 truncate text-xl font-black tracking-tight text-[#111c2e]">{metric.value}</p>
              <p className="mt-1 truncate text-[10px] font-semibold text-slate-400">{metric.hint}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
