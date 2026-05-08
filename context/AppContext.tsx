"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { createClient } from "@/lib/supabase";
import {
  Transaction,
  Investment,
  BudgetCategory,
  Alert,
  UserProfile,
  TransactionCategory,
  SPENDING_CATEGORIES,
  mockTransactions,
  mockInvestments,
  mockBudgetCategories,
  mockAlerts,
  mockUser,
} from "@/lib/mock-data";

// ─── Computed selectors (pure functions) ────────────────────────────────────

export function unreadAlertCount(alerts: Alert[]): number {
  return alerts.filter((a) => !a.read).length;
}

export function currentMonthStats(transactions: Transaction[]) {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  const current = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === month && d.getFullYear() === year;
  });
  const receita = current.filter((t) => t.type === "entrada").reduce((s, t) => s + t.amount, 0);
  const despesas = current.filter((t) => t.type === "saída").reduce((s, t) => s + t.amount, 0);
  return { receita, despesas };
}

export function investmentTotals(investments: Investment[]) {
  const totalInvested = investments.reduce((s, i) => s + i.investedAmount, 0);
  const totalCurrent = investments.reduce((s, i) => s + i.currentAmount, 0);
  const returnPercent = totalInvested > 0 ? ((totalCurrent - totalInvested) / totalInvested) * 100 : 0;
  return { totalInvested, totalCurrent, returnPercent };
}

export function expenseByCategory(transactions: Transaction[]) {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  const map: Partial<Record<TransactionCategory, number>> = {};
  transactions.forEach((t) => {
    const d = new Date(t.date);
    if (t.type !== "saída" || d.getMonth() !== month || d.getFullYear() !== year) return;
    if (t.category === "Investimento") return;
    map[t.category] = (map[t.category] ?? 0) + t.amount;
  });
  return Object.entries(map).map(([category, value]) => ({
    category: category as TransactionCategory,
    value: value as number,
  }));
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface AppState {
  transactions: Transaction[];
  investments: Investment[];
  budgetCategories: BudgetCategory[];
  alerts: Alert[];
  user: UserProfile;
  sidebarCollapsed: boolean;
}

interface AppContextValue extends AppState {
  updateTransactionCategory: (id: string, category: TransactionCategory) => void;
  updateBudgetTarget: (category: string, amount: number) => void;
  addBudgetCategory: (category: TransactionCategory) => void;
  markAlertRead: (id: string) => void;
  markAllAlertsRead: () => void;
  toggleSidebar: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [investments] = useState<Investment[]>(mockInvestments);
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>(mockBudgetCategories);
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [user, setUser] = useState<UserProfile>(mockUser);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user: authUser } }) => {
      if (!authUser) return;
      setUser({
        id: authUser.id,
        name: authUser.user_metadata?.full_name
          || authUser.email?.split('@')[0]
          || 'Usuário',
        email: authUser.email || '',
        phone: authUser.user_metadata?.phone || '',
        avatarInitials: (authUser.user_metadata?.full_name || authUser.email || 'U')
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .slice(0, 2)
          .toUpperCase(),
      });
    });
  }, []);

  // Carrega metas do Supabase
  useEffect(() => {
    async function loadBudgetGoals() {
      try {
        const res = await fetch("/api/budget-goals");
        const data = await res.json();
        if (data.goals?.length > 0) {
          setBudgetCategories(prev => prev.map(b => {
            const goal = data.goals.find((g: any) => g.category === b.category);
            return goal ? { ...b, budgetTarget: goal.target } : b;
          }));
        }
      } catch (e) {
        console.error("Erro ao carregar metas:", e);
      }
    }
    loadBudgetGoals();
  }, [user.id]);

  const updateTransactionCategory = useCallback((id: string, category: TransactionCategory) => {
    setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, category } : t)));
  }, []);

  const updateBudgetTarget = useCallback(async (category: string, amount: number) => {
    setBudgetCategories((prev) => prev.map((b) =>
      b.category === category ? { ...b, budgetTarget: amount } : b
    ));
    await fetch("/api/budget-goals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, target: amount }),
    });
  }, []);

  const addBudgetCategory = useCallback((category: TransactionCategory) => {
    const newId = `b${Date.now()}`;
    setBudgetCategories((prev) => [
      ...prev,
      { id: newId, category, budgetTarget: 300, spent: 0 },
    ]);
  }, []);

  const markAlertRead = useCallback((id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)));
  }, []);

  const markAllAlertsRead = useCallback(() => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((v) => !v);
  }, []);

  return (
    <AppContext.Provider
      value={{
        transactions,
        investments,
        budgetCategories,
        alerts,
        user,
        sidebarCollapsed,
        updateTransactionCategory,
        updateBudgetTarget,
        addBudgetCategory,
        markAlertRead,
        markAllAlertsRead,
        toggleSidebar,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}

export { SPENDING_CATEGORIES };
