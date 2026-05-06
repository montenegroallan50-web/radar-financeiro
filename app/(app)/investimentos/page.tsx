"use client";

import { useState } from "react";
import { useApp, investmentTotals } from "@/context/AppContext";
import { InvestmentType } from "@/lib/mock-data";
import { INVESTMENT_TYPE_LABELS } from "@/lib/chart-colors";
import { cn } from "@/lib/utils";
import InvestSummaryBar from "@/components/investimentos/InvestSummaryBar";
import InvestTab from "@/components/investimentos/InvestTab";
import AllocationChart from "@/components/investimentos/AllocationChart";

const TABS: InvestmentType[] = ["tesouro", "cdb_lci", "acoes_fiis", "fundos"];
const PATRIMONIO_TOTAL = 65000;

export default function InvestimentosPage() {
  const { investments } = useApp();
  const [activeTab, setActiveTab] = useState<InvestmentType>("tesouro");
  const { totalInvested, totalCurrent, returnPercent } = investmentTotals(investments);
  const filtered = investments.filter((i) => i.type === activeTab);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <InvestSummaryBar
        totalInvested={totalInvested}
        totalCurrent={totalCurrent}
        returnPercent={returnPercent}
        patrimonioTotal={PATRIMONIO_TOTAL}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
        <div className="space-y-4">
          {/* Sub-tabs */}
          <div className="flex bg-white rounded-xl p-1 shadow-card border border-gray-100 w-full overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "flex-1 whitespace-nowrap py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 min-w-0",
                  activeTab === tab
                    ? "bg-brand text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                {INVESTMENT_TYPE_LABELS[tab]}
              </button>
            ))}
          </div>
          <InvestTab investments={filtered} />
        </div>
        <AllocationChart investments={investments} />
      </div>
    </div>
  );
}
