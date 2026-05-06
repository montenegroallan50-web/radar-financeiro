"use client";

import { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { TransactionCategory } from "@/lib/mock-data";
import FilterBar, { Filters } from "@/components/transacoes/FilterBar";
import TransactionTable from "@/components/transacoes/TransactionTable";
import Pagination from "@/components/transacoes/Pagination";
import Badge from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";

const PAGE_SIZE = 10;

const defaultFilters: Filters = { dateFrom: "", dateTo: "", category: "", type: "", search: "" };

export default function TransacoesPage() {
  const { transactions, updateTransactionCategory } = useApp();
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return transactions
      .filter((t) => {
        if (filters.dateFrom && t.date < filters.dateFrom) return false;
        if (filters.dateTo   && t.date > filters.dateTo)   return false;
        if (filters.category && t.category !== filters.category) return false;
        if (filters.type     && t.type !== filters.type)   return false;
        if (filters.search   && !t.description.toLowerCase().includes(filters.search.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalEntrada = filtered.filter((t) => t.type === "entrada").reduce((s, t) => s + t.amount, 0);
  const totalSaida   = filtered.filter((t) => t.type === "saída").reduce((s, t) => s + t.amount, 0);

  function handleFiltersChange(f: Filters) {
    setFilters(f);
    setPage(1);
  }

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      {/* Summary */}
      <div className="flex flex-wrap gap-3 items-center">
        <Badge variant="neutral">{filtered.length} transações</Badge>
        <Badge variant="success">Entradas: {formatCurrency(totalEntrada)}</Badge>
        <Badge variant="danger">Saídas: {formatCurrency(totalSaida)}</Badge>
      </div>

      <FilterBar filters={filters} onChange={handleFiltersChange} />
      <TransactionTable
        transactions={paged}
        onCategoryChange={(id, category) => updateTransactionCategory(id, category as TransactionCategory)}
      />
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
