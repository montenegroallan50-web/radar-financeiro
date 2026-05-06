"use client";

import { useState } from "react";
import Toggle from "@/components/ui/Toggle";

const PREFS = [
  { id: "saldo",     label: "Alertas de saldo baixo",     description: "Notifica quando a conta fica abaixo de R$ 500" },
  { id: "orcamento", label: "Metas de orçamento",          description: "Avisa quando você ultrapassa 75% ou 100% de uma meta" },
  { id: "vencimento",label: "Vencimentos de investimento", description: "Lembrete 30 dias antes de um vencimento" },
  { id: "relatorio", label: "Relatório mensal",            description: "E-mail com resumo no último dia útil do mês" },
];

export default function NotifPreferences() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    saldo: true, orcamento: true, vencimento: true, relatorio: true,
  });

  return (
    <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 space-y-4">
      <h2 className="font-bold text-gray-900">Notificações</h2>
      <div className="space-y-4">
        {PREFS.map((p) => (
          <Toggle
            key={p.id}
            checked={prefs[p.id]}
            onChange={(v) => setPrefs((prev) => ({ ...prev, [p.id]: v }))}
            label={p.label}
            description={p.description}
          />
        ))}
      </div>
    </div>
  );
}
