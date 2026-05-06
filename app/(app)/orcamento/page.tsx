"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { SPENDING_CATEGORIES, TransactionCategory } from "@/lib/mock-data";
import MonthSelector from "@/components/orcamento/MonthSelector";
import BudgetCard from "@/components/orcamento/BudgetCard";
import BudgetSummary from "@/components/orcamento/BudgetSummary";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";

export default function OrcamentoPage() {
  const { budgetCategories, updateBudgetTarget, addBudgetCategory } = useApp();
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [showAdd, setShowAdd] = useState(false);
  const [newCat, setNewCat] = useState<TransactionCategory>("Outros");

  const existingCats = budgetCategories.map((b) => b.category);
  const availableCats = SPENDING_CATEGORIES.filter((c) => !existingCats.includes(c));

  function handleAdd() {
    if (availableCats.length === 0) return;
    addBudgetCategory(newCat as TransactionCategory);
    setShowAdd(false);
    setNewCat(availableCats[0] ?? "Outros");
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <MonthSelector date={selectedMonth} onChange={setSelectedMonth} />
        {availableCats.length > 0 && (
          <Button variant="outline" size="sm" onClick={() => setShowAdd((v) => !v)}>
            <Plus size={15} /> Nova categoria
          </Button>
        )}
      </div>

      {/* Add new category inline */}
      {showAdd && availableCats.length > 0 && (
        <div className="bg-white rounded-2xl shadow-card border border-brand/30 p-4 flex flex-wrap items-end gap-3">
          <Select
            label="Categoria"
            options={availableCats.map((c) => ({ value: c, label: c }))}
            value={newCat}
            onChange={(e) => setNewCat(e.target.value as TransactionCategory)}
            className="w-48"
          />
          <Button size="sm" onClick={handleAdd}>Adicionar</Button>
          <Button variant="ghost" size="sm" onClick={() => setShowAdd(false)}>Cancelar</Button>
        </div>
      )}

      {/* Budget cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {budgetCategories.map((b) => (
          <BudgetCard key={b.id} budget={b} onUpdate={updateBudgetTarget} />
        ))}
      </div>

      {/* Summary */}
      <BudgetSummary budgetCategories={budgetCategories} />
    </div>
  );
}
