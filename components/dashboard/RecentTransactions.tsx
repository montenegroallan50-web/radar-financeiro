import { ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Transaction } from "@/lib/mock-data";
import { CATEGORY_COLORS } from "@/lib/chart-colors";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

interface Props {
  transactions: Transaction[];
}

export default function RecentTransactions({ transactions }: Props) {
  const recent = [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  return (
    <div className="bg-white rounded-2xl shadow-card border border-gray-100 flex flex-col">
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <h2 className="font-bold text-gray-900">Últimas Transações</h2>
        <Link href="/transacoes" className="text-xs text-brand hover:underline font-medium">
          Ver todas →
        </Link>
      </div>
      <div className="divide-y divide-gray-50">
        {recent.map((t) => (
          <div key={t.id} className="flex items-center gap-3 px-5 py-3">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: CATEGORY_COLORS[t.category] + "20" }}
            >
              {t.type === "entrada"
                ? <ArrowUpRight size={15} style={{ color: CATEGORY_COLORS[t.category] }} />
                : <ArrowDownLeft size={15} style={{ color: CATEGORY_COLORS[t.category] }} />
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{t.description}</p>
              <p className="text-xs text-gray-400">{t.category} · {t.bank}</p>
            </div>
            <p className={`text-sm font-semibold tabular-nums ${t.type === "entrada" ? "text-emerald-600" : "text-gray-800"}`}>
              {t.type === "entrada" ? "+" : "-"}{formatCurrency(t.amount)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
