import { Investment } from "@/lib/mock-data";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { cn } from "@/lib/utils";
import EmptyState from "@/components/ui/EmptyState";
import { TrendingUp } from "lucide-react";

interface Props {
  investments: Investment[];
}

export default function InvestTab({ investments }: Props) {
  if (investments.length === 0) {
    return <EmptyState icon={TrendingUp} title="Sem investimentos nesta categoria" />;
  }

  return (
    <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {["Nome", "Indexador", "Investido", "Atual", "Rentab.", "Vencimento"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {investments.map((inv) => (
              <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">{inv.name}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{inv.indexer}</td>
                <td className="px-4 py-3 tabular-nums text-gray-700">{formatCurrency(inv.investedAmount)}</td>
                <td className="px-4 py-3 tabular-nums font-semibold text-gray-900">{formatCurrency(inv.currentAmount)}</td>
                <td className={cn("px-4 py-3 tabular-nums font-semibold", inv.returnPercent >= 0 ? "text-emerald-600" : "text-red-500")}>
                  {formatPercent(inv.returnPercent)}
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {inv.maturityDate
                    ? new Date(inv.maturityDate + "T00:00:00").toLocaleDateString("pt-BR")
                    : "—"
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="sm:hidden divide-y divide-gray-50">
        {investments.map((inv) => (
          <div key={inv.id} className="p-4 space-y-1">
            <div className="flex justify-between">
              <p className="font-semibold text-gray-900 text-sm">{inv.name}</p>
              <p className={cn("text-sm font-bold tabular-nums", inv.returnPercent >= 0 ? "text-emerald-600" : "text-red-500")}>
                {formatPercent(inv.returnPercent)}
              </p>
            </div>
            <p className="text-xs text-gray-400">{inv.indexer}</p>
            <div className="flex justify-between text-xs text-gray-600 pt-1">
              <span>Investido: {formatCurrency(inv.investedAmount)}</span>
              <span>Atual: <strong>{formatCurrency(inv.currentAmount)}</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
