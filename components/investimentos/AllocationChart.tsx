"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Investment, InvestmentType } from "@/lib/mock-data";
import { INVESTMENT_TYPE_COLORS, INVESTMENT_TYPE_LABELS } from "@/lib/chart-colors";
import { formatCurrency } from "@/lib/utils";

interface Props {
  investments: Investment[];
}

export default function AllocationChart({ investments }: Props) {
  const totals: Partial<Record<InvestmentType, number>> = {};
  investments.forEach((inv) => {
    totals[inv.type] = (totals[inv.type] ?? 0) + inv.currentAmount;
  });

  const data = Object.entries(totals).map(([type, value]) => ({
    type: type as InvestmentType,
    label: INVESTMENT_TYPE_LABELS[type as InvestmentType],
    value: value as number,
  }));

  return (
    <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-5">
      <h3 className="font-bold text-gray-900 mb-4">Alocação</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={80} paddingAngle={2}>
            {data.map((d) => (
              <Cell key={d.type} fill={INVESTMENT_TYPE_COLORS[d.type]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [formatCurrency(Number(value)), "Valor"]}
            contentStyle={{ borderRadius: "12px", border: "1px solid #f0f0f0" }}
          />
          <Legend
            formatter={(value) => <span className="text-xs text-gray-600">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
