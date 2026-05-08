"use client";

import { useState, useEffect } from "react";
import { investmentTotals } from "@/context/AppContext";
import { Investment, InvestmentType } from "@/lib/mock-data";
import { INVESTMENT_TYPE_LABELS } from "@/lib/chart-colors";
import { cn } from "@/lib/utils";
import InvestSummaryBar from "@/components/investimentos/InvestSummaryBar";
import InvestTab from "@/components/investimentos/InvestTab";
import AllocationChart from "@/components/investimentos/AllocationChart";

const TABS: InvestmentType[] = ["tesouro", "cdb_lci", "acoes_fiis", "fundos"];

export default function InvestimentosPage() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [patrimonioTotal, setPatrimonioTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<InvestmentType>("tesouro");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/investments')
        const data = await res.json()
        if (!data.error) {
          setInvestments(data.investments ?? [])
          setPatrimonioTotal(data.patrimonioTotal ?? 0)
        }
      } catch (e) {
        console.error('Erro ao carregar investimentos:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const { totalInvested, totalCurrent, returnPercent } = investmentTotals(investments);
  const filtered = investments.filter((i) => i.type === activeTab);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-brand border-t-transparent animate-spin" />
          <p className="text-sm text-gray-400 font-medium">Carregando investimentos…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <InvestSummaryBar
        totalInvested={totalInvested}
        totalCurrent={totalCurrent}
        returnPercent={returnPercent}
        patrimonioTotal={patrimonioTotal}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
        <div className="space-y-4">
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
