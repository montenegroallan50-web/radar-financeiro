import Link from "next/link";
import { ArrowLeftRight, TrendingUp, Target, Bell } from "lucide-react";

const actions = [
  { href: "/transacoes",    label: "Transações",    icon: ArrowLeftRight, bg: "bg-blue-50",   color: "text-blue-600"   },
  { href: "/investimentos", label: "Investimentos", icon: TrendingUp,     bg: "bg-brand-pale", color: "text-brand"      },
  { href: "/orcamento",     label: "Orçamento",     icon: Target,         bg: "bg-violet-50", color: "text-violet-600" },
  { href: "/alertas",       label: "Alertas",       icon: Bell,           bg: "bg-amber-50",  color: "text-amber-600"  },
];

export default function QuickActions() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {actions.map(({ href, label, icon: Icon, bg, color }) => (
        <Link
          key={href}
          href={href}
          className="bg-white rounded-2xl p-4 shadow-card border border-gray-100 flex flex-col items-center gap-2.5 hover:shadow-card-hover transition-all active:scale-[0.98]"
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
            <Icon size={20} className={color} />
          </div>
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </Link>
      ))}
    </div>
  );
}
