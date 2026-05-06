"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { CATEGORY_COLORS } from "@/lib/chart-colors";
import { TransactionCategory } from "@/lib/mock-data";

interface ChartData {
  category: TransactionCategory;
  value: number;
}

interface Props {
  data: ChartData[];
}

export default function ExpenseChart({ data }: Props) {
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-5 flex flex-col">
      <h2 className="font-bold text-gray-900 mb-4">Gastos por Categoria</h2>
      {data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm py-8">
          Sem dados este mês
        </div>
      ) : (
        <>
          <div className="relative">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={2}
                >
                  {data.map((entry) => (
                    <Cell key={entry.category} fill={CATEGORY_COLORS[entry.category]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [formatCurrency(Number(value)), "Gasto"]}
                  contentStyle={{ borderRadius: "12px", border: "1px solid #f0f0f0", boxShadow: "0 2px 16px rgba(0,0,0,0.08)" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-xs text-gray-400">Total</p>
              <p className="text-base font-bold text-gray-900">{formatCurrency(total)}</p>
            </div>
          </div>
          <div className="mt-3 space-y-1.5">
            {data.sort((a, b) => b.value - a.value).map((d) => (
              <div key={d.category} className="flex items-center gap-2 text-sm">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CATEGORY_COLORS[d.category] }} />
                <span className="flex-1 text-gray-600 truncate">{d.category}</span>
                <span className="font-medium text-gray-800 tabular-nums">{formatCurrency(d.value)}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
