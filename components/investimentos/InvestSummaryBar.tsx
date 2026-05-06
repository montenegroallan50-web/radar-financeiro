import { formatCurrency, formatPercent } from "@/lib/utils";
import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  totalInvested: number;
  totalCurrent: number;
  returnPercent: number;
  patrimonioTotal: number;
}

export default function InvestSummaryBar({ totalInvested, totalCurrent, returnPercent, patrimonioTotal }: Props) {
  const pctPatrimonio = patrimonioTotal > 0 ? (totalCurrent / patrimonioTotal) * 100 : 0;
  const positive = returnPercent >= 0;

  const stats = [
    { label: "Total Investido",  value: formatCurrency(totalInvested), sub: null },
    { label: "Valor Atual",      value: formatCurrency(totalCurrent),  sub: null },
    { label: "Rentabilidade",    value: formatPercent(returnPercent),  sub: "desde o aporte", positive },
    { label: "% do Patrimônio",  value: `${pctPatrimonio.toFixed(1)}%`, sub: "do total" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div key={s.label} className="bg-white rounded-2xl shadow-card border border-gray-100 p-4">
          <p className="text-xs text-gray-500 font-medium mb-1">{s.label}</p>
          <p className={cn("text-xl font-bold", s.positive !== undefined && (s.positive ? "text-emerald-600" : "text-red-500"))}>
            {s.value}
          </p>
          {s.sub && <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>}
        </div>
      ))}
    </div>
  );
}
