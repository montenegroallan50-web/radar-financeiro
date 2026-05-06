"use client";

import { Search } from "lucide-react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { ALL_CATEGORIES } from "@/lib/mock-data";

export interface Filters {
  dateFrom: string;
  dateTo: string;
  category: string;
  type: string;
  search: string;
}

interface Props {
  filters: Filters;
  onChange: (f: Filters) => void;
}

const categoryOptions = [
  { value: "", label: "Todas as categorias" },
  ...ALL_CATEGORIES.map((c) => ({ value: c, label: c })),
];

const typeOptions = [
  { value: "",       label: "Todos os tipos" },
  { value: "entrada", label: "Entrada"       },
  { value: "saída",   label: "Saída"         },
];

export default function FilterBar({ filters, onChange }: Props) {
  const set = (key: keyof Filters, value: string) => onChange({ ...filters, [key]: value });

  return (
    <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <Input
          type="date"
          label="De"
          value={filters.dateFrom}
          onChange={(e) => set("dateFrom", e.target.value)}
        />
        <Input
          type="date"
          label="Até"
          value={filters.dateTo}
          onChange={(e) => set("dateTo", e.target.value)}
        />
        <Select
          label="Categoria"
          options={categoryOptions}
          value={filters.category}
          onChange={(e) => set("category", e.target.value)}
        />
        <Select
          label="Tipo"
          options={typeOptions}
          value={filters.type}
          onChange={(e) => set("type", e.target.value)}
        />
        <Input
          label="Buscar"
          placeholder="Descrição..."
          value={filters.search}
          onChange={(e) => set("search", e.target.value)}
          suffix={<Search size={15} className="text-gray-400" />}
        />
      </div>
    </div>
  );
}
