import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string;
  trend?: number;
  trendLabel?: string;
  icon: LucideIcon;
  iconBg?: string;
}

export default function KpiCard({ label, value, trend, trendLabel, icon: Icon, iconBg = "bg-brand-pale" }: KpiCardProps) {
  const positive = trend !== undefined && trend >= 0;
  return (
    <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500 font-medium">{label}</span>
        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", iconBg)}>
          <Icon size={18} className="text-brand" />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
        {trend !== undefined && (
          <div className={cn("flex items-center gap-1 mt-1 text-xs font-medium", positive ? "text-emerald-600" : "text-red-500")}>
            {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>{positive ? "+" : ""}{trend.toFixed(1)}%</span>
            {trendLabel && <span className="text-gray-400 font-normal">{trendLabel}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
