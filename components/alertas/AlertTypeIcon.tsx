import { AlertTriangle, Target, Calendar, FileText, LucideIcon } from "lucide-react";
import { AlertType } from "@/lib/mock-data";

const config: Record<AlertType, { icon: LucideIcon, bg: string, color: string }> = {
  saldo_baixo:            { icon: AlertTriangle, bg: "bg-amber-100",  color: "text-amber-600"  },
  meta_orcamento:         { icon: Target,        bg: "bg-brand-100",  color: "text-brand"      },
  vencimento_investimento:{ icon: Calendar,      bg: "bg-blue-100",   color: "text-blue-600"   },
  relatorio_mensal:       { icon: FileText,      bg: "bg-violet-100", color: "text-violet-600" },
};

export default function AlertTypeIcon({ type }: { type: AlertType }) {
  const { icon: Icon, bg, color } = config[type];
  return (
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
      <Icon size={18} className={color} />
    </div>
  );
}
