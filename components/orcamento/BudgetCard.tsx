"use client";

import { useState, useRef, useEffect } from "react";
import { ShoppingCart, Car, Home, Heart, Smile, BookOpen, HelpCircle, Pencil, Check, X, LucideIcon } from "lucide-react";
import { BudgetCategory, TransactionCategory } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import ProgressBar from "@/components/ui/ProgressBar";
import Badge from "@/components/ui/Badge";

const CATEGORY_ICONS: Record<TransactionCategory, LucideIcon> = {
  Alimentação: ShoppingCart,
  Transporte:  Car,
  Moradia:     Home,
  Saúde:       Heart,
  Lazer:       Smile,
  Educação:    BookOpen,
  Outros:      HelpCircle,
  Investimento: HelpCircle,
  Salário:     HelpCircle,
};

interface Props {
  budget: BudgetCategory;
  onUpdate: (id: string, amount: number) => void;
}

export default function BudgetCard({ budget, onUpdate }: Props) {
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState(String(budget.budgetTarget));
  const inputRef = useRef<HTMLInputElement>(null);
  const pct = budget.budgetTarget > 0 ? (budget.spent / budget.budgetTarget) * 100 : 0;
  const Icon = CATEGORY_ICONS[budget.category] ?? HelpCircle;

  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  function save() {
    const v = parseFloat(inputVal);
    if (!isNaN(v) && v > 0) onUpdate(budget.id, v);
    else setInputVal(String(budget.budgetTarget));
    setEditing(false);
  }

  function cancel() {
    setInputVal(String(budget.budgetTarget));
    setEditing(false);
  }

  return (
    <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-5 space-y-3">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-brand-pale flex items-center justify-center shrink-0">
          <Icon size={16} className="text-brand" />
        </div>
        <h3 className="font-semibold text-gray-900 flex-1">{budget.category}</h3>
        {pct > 100 && <Badge variant="danger">Estourou</Badge>}
        {pct >= 75 && pct <= 100 && <Badge variant="warning">Atenção</Badge>}
      </div>

      <ProgressBar value={pct} />

      <div className="flex items-center justify-between text-sm">
        <div>
          <span className="text-gray-500">Gasto: </span>
          <span className="font-bold text-gray-900">{formatCurrency(budget.spent)}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-gray-500">Meta: </span>
          {editing ? (
            <div className="flex items-center gap-1">
              <span className="text-gray-500 text-xs">R$</span>
              <input
                ref={inputRef}
                type="number"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") cancel(); }}
                className="w-20 border border-brand rounded-lg px-2 py-0.5 text-sm text-right focus:outline-none focus:ring-1 focus:ring-brand"
              />
              <button onClick={save}   className="text-brand hover:text-brand-dark"><Check size={14} /></button>
              <button onClick={cancel} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-1 font-bold text-brand hover:text-brand-dark group"
            >
              {formatCurrency(budget.budgetTarget)}
              <Pencil size={11} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
