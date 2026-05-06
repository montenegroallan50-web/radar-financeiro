import { BudgetCategory } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Props {
  budgetCategories: BudgetCategory[];
}

export default function BudgetSummary({ budgetCategories }: Props) {
  const totalTarget = budgetCategories.reduce((s, b) => s + b.budgetTarget, 0);
  const totalSpent  = budgetCategories.reduce((s, b) => s + b.spent, 0);
  const diff = totalTarget - totalSpent;
  const positive = diff >= 0;

  return (
    <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-5">
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalTarget)}</p>
          <p className="text-xs text-gray-500 mt-1">Total orçado</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalSpent)}</p>
          <p className="text-xs text-gray-500 mt-1">Total gasto</p>
        </div>
        <div>
          <p className={cn("text-2xl font-bold", positive ? "text-emerald-600" : "text-red-500")}>
            {positive ? "+" : ""}{formatCurrency(diff)}
          </p>
          <p className="text-xs text-gray-500 mt-1">{positive ? "Sobra" : "Deficit"}</p>
        </div>
      </div>
    </div>
  );
}
