"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ArrowLeftRight, TrendingUp, Target, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp, unreadAlertCount } from "@/context/AppContext";

const navItems = [
  { href: "/dashboard",     label: "Dashboard",    icon: LayoutDashboard },
  { href: "/transacoes",    label: "Transações",   icon: ArrowLeftRight  },
  { href: "/investimentos", label: "Invest.",      icon: TrendingUp      },
  { href: "/orcamento",     label: "Orçamento",    icon: Target          },
  { href: "/alertas",       label: "Alertas",      icon: Bell            },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { alerts } = useApp();
  const unread = unreadAlertCount(alerts);

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-gray-200 flex safe-area-pb">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors relative",
              active ? "text-brand" : "text-gray-400 hover:text-gray-600"
            )}
          >
            <Icon size={20} />
            {label}
            {href === "/alertas" && unread > 0 && (
              <span className="absolute top-1.5 right-1/2 translate-x-3 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unread}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
