// ─── Types ─────────────────────────────────────────────────────────────────

export type TransactionCategory =
  | "Alimentação"
  | "Transporte"
  | "Moradia"
  | "Saúde"
  | "Lazer"
  | "Educação"
  | "Investimento"
  | "Salário"
  | "Outros";

export type TransactionType = "entrada" | "saída";

export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: TransactionCategory;
  type: TransactionType;
  amount: number;
  bank: string;
}

export type InvestmentType = "tesouro" | "cdb_lci" | "acoes_fiis" | "fundos";

export interface Investment {
  id: string;
  name: string;
  type: InvestmentType;
  investedAmount: number;
  currentAmount: number;
  returnPercent: number;
  maturityDate: string | null;
  indexer: string;
}

export interface BudgetCategory {
  id: string;
  category: TransactionCategory;
  budgetTarget: number;
  spent: number;
}

export type AlertType =
  | "saldo_baixo"
  | "meta_orcamento"
  | "vencimento_investimento"
  | "relatorio_mensal";

export interface Alert {
  id: string;
  type: AlertType;
  title: string;
  description: string;
  date: string;
  read: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarInitials: string;
}

export const ALL_CATEGORIES: TransactionCategory[] = [
  "Alimentação",
  "Transporte",
  "Moradia",
  "Saúde",
  "Lazer",
  "Educação",
  "Investimento",
  "Salário",
  "Outros",
];

export const SPENDING_CATEGORIES: TransactionCategory[] = [
  "Alimentação",
  "Transporte",
  "Moradia",
  "Saúde",
  "Lazer",
  "Educação",
  "Outros",
];

// ─── Mock Data ──────────────────────────────────────────────────────────────

export const mockUser: UserProfile = {
  id: "608c76f0-aa5b-41e4-90fd-cf537693de24",
  name: "Allan Montenegro",
  email: "montenegroallan50@gmail.com",
  phone: "(11) 98765-4321",
  avatarInitials: "AM",
};

export const mockTransactions: Transaction[] = [
  { id: "t1",  date: "2026-05-04", description: "Supermercado Extra",        category: "Alimentação",  type: "saída",   amount: 347.80, bank: "Nubank"  },
  { id: "t2",  date: "2026-05-04", description: "Uber",                       category: "Transporte",   type: "saída",   amount: 24.50,  bank: "Nubank"  },
  { id: "t3",  date: "2026-05-03", description: "Salário",                    category: "Salário",      type: "entrada", amount: 8500.00, bank: "Itaú"   },
  { id: "t4",  date: "2026-05-03", description: "Aluguel",                    category: "Moradia",      type: "saída",   amount: 1800.00, bank: "Itaú"   },
  { id: "t5",  date: "2026-05-02", description: "Farmácia Pague Menos",       category: "Saúde",        type: "saída",   amount: 89.90,  bank: "Nubank"  },
  { id: "t6",  date: "2026-05-02", description: "Netflix",                    category: "Lazer",        type: "saída",   amount: 45.90,  bank: "Nubank"  },
  { id: "t7",  date: "2026-05-01", description: "Aporte Tesouro Direto",      category: "Investimento", type: "saída",   amount: 500.00, bank: "XP"      },
  { id: "t8",  date: "2026-05-01", description: "Restaurante Outback",        category: "Alimentação",  type: "saída",   amount: 156.00, bank: "Nubank"  },
  { id: "t9",  date: "2026-04-30", description: "Conta de Luz",               category: "Moradia",      type: "saída",   amount: 198.40, bank: "Itaú"    },
  { id: "t10", date: "2026-04-30", description: "Posto de Gasolina",          category: "Transporte",   type: "saída",   amount: 210.00, bank: "Nubank"  },
  { id: "t11", date: "2026-04-29", description: "Curso Udemy",                category: "Educação",     type: "saída",   amount: 59.90,  bank: "Nubank"  },
  { id: "t12", date: "2026-04-28", description: "Mercado Livre",              category: "Outros",       type: "saída",   amount: 134.90, bank: "Nubank"  },
  { id: "t13", date: "2026-04-27", description: "Freelance Design",           category: "Salário",      type: "entrada", amount: 1200.00, bank: "Itaú"   },
  { id: "t14", date: "2026-04-26", description: "Academia",                   category: "Saúde",        type: "saída",   amount: 99.90,  bank: "Nubank"  },
  { id: "t15", date: "2026-04-25", description: "iFood",                      category: "Alimentação",  type: "saída",   amount: 67.80,  bank: "Nubank"  },
  { id: "t16", date: "2026-04-24", description: "Aporte CDB XP",              category: "Investimento", type: "saída",   amount: 1000.00, bank: "XP"     },
  { id: "t17", date: "2026-04-23", description: "Cinema",                     category: "Lazer",        type: "saída",   amount: 52.00,  bank: "Nubank"  },
  { id: "t18", date: "2026-04-22", description: "Livros Amazon",              category: "Educação",     type: "saída",   amount: 87.40,  bank: "Nubank"  },
  { id: "t19", date: "2026-04-22", description: "Uber Eats",                  category: "Alimentação",  type: "saída",   amount: 45.30,  bank: "Nubank"  },
  { id: "t20", date: "2026-04-21", description: "Plano de Saúde",             category: "Saúde",        type: "saída",   amount: 320.00, bank: "Itaú"    },
  { id: "t21", date: "2026-04-20", description: "Spotify",                    category: "Lazer",        type: "saída",   amount: 21.90,  bank: "Nubank"  },
  { id: "t22", date: "2026-04-19", description: "Condomínio",                 category: "Moradia",      type: "saída",   amount: 450.00, bank: "Itaú"    },
  { id: "t23", date: "2026-04-18", description: "Transferência recebida",     category: "Outros",       type: "entrada", amount: 300.00, bank: "Nubank"  },
  { id: "t24", date: "2026-04-17", description: "Padaria São João",           category: "Alimentação",  type: "saída",   amount: 38.50,  bank: "Nubank"  },
  { id: "t25", date: "2026-04-16", description: "Metro SP",                   category: "Transporte",   type: "saída",   amount: 60.00,  bank: "Nubank"  },
  { id: "t26", date: "2026-04-15", description: "Salário",                    category: "Salário",      type: "entrada", amount: 8500.00, bank: "Itaú"   },
  { id: "t27", date: "2026-04-14", description: "Dentista",                   category: "Saúde",        type: "saída",   amount: 280.00, bank: "Itaú"    },
  { id: "t28", date: "2026-04-13", description: "Bar do Zé",                  category: "Lazer",        type: "saída",   amount: 85.00,  bank: "Nubank"  },
  { id: "t29", date: "2026-04-12", description: "Internet Vivo Fibra",        category: "Moradia",      type: "saída",   amount: 109.90, bank: "Itaú"    },
  { id: "t30", date: "2026-04-11", description: "Compra PETR4",               category: "Investimento", type: "saída",   amount: 2000.00, bank: "XP"     },
  { id: "t31", date: "2026-04-10", description: "Manutenção carro",           category: "Transporte",   type: "saída",   amount: 430.00, bank: "Itaú"    },
  { id: "t32", date: "2026-04-09", description: "Cursos Alura",               category: "Educação",     type: "saída",   amount: 89.90,  bank: "Nubank"  },
];

export const mockInvestments: Investment[] = [
  { id: "i1",  name: "Tesouro IPCA+ 2029",      type: "tesouro",    investedAmount: 5000,  currentAmount: 5630,  returnPercent: 12.60, maturityDate: "2029-05-15", indexer: "IPCA + 6.2%" },
  { id: "i2",  name: "Tesouro Selic 2027",       type: "tesouro",    investedAmount: 3000,  currentAmount: 3312,  returnPercent: 10.40, maturityDate: "2027-03-01", indexer: "Selic"       },
  { id: "i3",  name: "Tesouro Prefixado 2028",   type: "tesouro",    investedAmount: 2000,  currentAmount: 2260,  returnPercent: 13.00, maturityDate: "2028-01-01", indexer: "12.50% a.a." },
  { id: "i4",  name: "CDB XP 120% CDI",          type: "cdb_lci",    investedAmount: 4000,  currentAmount: 4488,  returnPercent: 12.20, maturityDate: "2027-06-30", indexer: "CDI 120%"    },
  { id: "i5",  name: "LCI Itaú 95% CDI",         type: "cdb_lci",    investedAmount: 2500,  currentAmount: 2742,  returnPercent: 9.68,  maturityDate: "2026-12-01", indexer: "CDI 95%"     },
  { id: "i6",  name: "CDB Nubank 113% CDI",      type: "cdb_lci",    investedAmount: 1500,  currentAmount: 1641,  returnPercent: 9.40,  maturityDate: "2027-01-15", indexer: "CDI 113%"    },
  { id: "i7",  name: "PETR4",                    type: "acoes_fiis", investedAmount: 3200,  currentAmount: 3840,  returnPercent: 20.00, maturityDate: null,         indexer: "IBOV"        },
  { id: "i8",  name: "MXRF11",                   type: "acoes_fiis", investedAmount: 2000,  currentAmount: 2180,  returnPercent: 9.00,  maturityDate: null,         indexer: "IFIX"        },
  { id: "i9",  name: "HGLG11",                   type: "acoes_fiis", investedAmount: 1800,  currentAmount: 1908,  returnPercent: 6.00,  maturityDate: null,         indexer: "IFIX"        },
  { id: "i10", name: "Verde Asset AM",            type: "fundos",     investedAmount: 3000,  currentAmount: 3360,  returnPercent: 12.00, maturityDate: null,         indexer: "CDI + 4%"    },
  { id: "i11", name: "Ibiúna Long Short",         type: "fundos",     investedAmount: 2000,  currentAmount: 2180,  returnPercent: 9.00,  maturityDate: null,         indexer: "CDI + 3%"    },
  { id: "i12", name: "SPX Raptor",                type: "fundos",     investedAmount: 1500,  currentAmount: 1620,  returnPercent: 8.00,  maturityDate: null,         indexer: "CDI + 2%"    },
];

export const mockBudgetCategories: BudgetCategory[] = [
  { id: "b1", category: "Alimentação", budgetTarget: 700,  spent: 655.40 },
  { id: "b2", category: "Transporte",  budgetTarget: 400,  spent: 724.50 },
  { id: "b3", category: "Moradia",     budgetTarget: 2800, spent: 2558.30 },
  { id: "b4", category: "Saúde",       budgetTarget: 500,  spent: 789.80 },
  { id: "b5", category: "Lazer",       budgetTarget: 300,  spent: 204.80 },
  { id: "b6", category: "Educação",    budgetTarget: 250,  spent: 237.20 },
  { id: "b7", category: "Outros",      budgetTarget: 300,  spent: 434.90 },
];

export const mockAlerts: Alert[] = [
  { id: "a1", type: "saldo_baixo",            title: "Saldo baixo na conta",           description: "Sua conta Nubank está com saldo abaixo de R$ 500,00.",                   date: "2026-05-04T10:30:00Z", read: false },
  { id: "a2", type: "meta_orcamento",         title: "Meta de Transporte ultrapassada",description: "Você gastou R$ 724,50 em Transporte, ultrapassando a meta de R$ 400,00.", date: "2026-05-03T15:00:00Z", read: false },
  { id: "a3", type: "meta_orcamento",         title: "Meta de Saúde ultrapassada",     description: "Você gastou R$ 789,80 em Saúde, ultrapassando a meta de R$ 500,00.",      date: "2026-05-02T09:00:00Z", read: false },
  { id: "a4", type: "vencimento_investimento",title: "LCI Itaú vence em 30 dias",     description: "Seu LCI Itaú 95% CDI vencerá em 01/12/2026. Considere renovar.",          date: "2026-05-01T08:00:00Z", read: false },
  { id: "a5", type: "relatorio_mensal",       title: "Relatório de Abril disponível", description: "Seu relatório financeiro de Abril/2026 está pronto para visualização.",     date: "2026-04-30T20:00:00Z", read: true  },
  { id: "a6", type: "meta_orcamento",         title: "75% do orçamento de Alimentação",description: "Você já utilizou 93% do orçamento de Alimentação este mês.",             date: "2026-04-28T11:00:00Z", read: true  },
  { id: "a7", type: "vencimento_investimento",title: "Tesouro Selic vence em 1 ano",  description: "Seu Tesouro Selic 2027 vencerá em março de 2027. Planeje o reinvestimento.", date: "2026-04-15T08:00:00Z", read: true  },
  { id: "a8", type: "relatorio_mensal",       title: "Relatório de Março disponível", description: "Seu relatório financeiro de Março/2026 está pronto para visualização.",     date: "2026-03-31T20:00:00Z", read: true  },
];
