"use client";

import { Transaction, TransactionCategory } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { CATEGORY_BG } from "@/lib/chart-colors";
import CategoryChip from "./CategoryChip";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { SearchX } from "lucide-react";

interface Props {
  transactions: Transaction[];
  onCategoryChange: (id: string, category: TransactionCategory) => void;
}

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export default function TransactionTable({ transactions, onCategoryChange }: Props) {
  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-card border border-gray-100">
        <EmptyState
          icon={SearchX}
          title="Nenhuma transação encontrada"
          description="Tente ajustar os filtros para ver resultados."
        />
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden sm:block bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {["Data", "Descrição", "Categoria", "Banco", "Tipo", "Valor"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {transactions.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(t.date)}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{t.description}</td>
                <td className="px-4 py-3">
                  <CategoryChip category={t.category} onChange={(c) => onCategoryChange(t.id, c)} />
                </td>
                <td className="px-4 py-3 text-gray-500">{t.bank}</td>
                <td className="px-4 py-3">
                  <Badge variant={t.type === "entrada" ? "success" : "neutral"}>
                    {t.type === "entrada" ? "Entrada" : "Saída"}
                  </Badge>
                </td>
                <td className={`px-4 py-3 font-semibold tabular-nums ${t.type === "entrada" ? "text-emerald-600" : "text-gray-800"}`}>
                  {t.type === "entrada" ? "+" : "-"}{formatCurrency(t.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {transactions.map((t) => (
          <div key={t.id} className="bg-white rounded-2xl shadow-card border border-gray-100 p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <p className="font-medium text-gray-900 text-sm">{t.description}</p>
                <p className="text-xs text-gray-400 mt-0.5">{t.bank} · {formatDate(t.date)}</p>
              </div>
              <p className={`font-bold tabular-nums text-sm shrink-0 ${t.type === "entrada" ? "text-emerald-600" : "text-gray-800"}`}>
                {t.type === "entrada" ? "+" : "-"}{formatCurrency(t.amount)}
              </p>
            </div>
            <CategoryChip category={t.category} onChange={(c) => onCategoryChange(t.id, c)} />
          </div>
        ))}
      </div>
    </>
  );
}
