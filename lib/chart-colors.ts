import type { TransactionCategory, InvestmentType } from "./mock-data";

export const CATEGORY_COLORS: Record<TransactionCategory, string> = {
  Alimentação: "#f97316",
  Transporte: "#3b82f6",
  Moradia: "#8b5cf6",
  Saúde: "#f43f5e",
  Lazer: "#ec4899",
  Educação: "#6366f1",
  Investimento: "#0F6E56",
  Salário: "#10b981",
  Outros: "#9ca3af",
};

export const CATEGORY_BG: Record<TransactionCategory, string> = {
  Alimentação: "bg-orange-100 text-orange-700",
  Transporte: "bg-blue-100 text-blue-700",
  Moradia: "bg-violet-100 text-violet-700",
  Saúde: "bg-rose-100 text-rose-700",
  Lazer: "bg-pink-100 text-pink-700",
  Educação: "bg-indigo-100 text-indigo-700",
  Investimento: "bg-brand-100 text-brand",
  Salário: "bg-emerald-100 text-emerald-700",
  Outros: "bg-gray-100 text-gray-600",
};

export const INVESTMENT_TYPE_COLORS: Record<InvestmentType, string> = {
  tesouro: "#0F6E56",
  cdb_lci: "#1a8a6b",
  acoes_fiis: "#0ea5e9",
  fundos: "#8b5cf6",
};

export const INVESTMENT_TYPE_LABELS: Record<InvestmentType, string> = {
  tesouro: "Tesouro Direto",
  cdb_lci: "CDB / LCI",
  acoes_fiis: "Ações / FIIs",
  fundos: "Fundos",
};
