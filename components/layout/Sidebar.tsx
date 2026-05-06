"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, ArrowLeftRight, TrendingUp, Target,
  Bell, User, ChevronLeft, ChevronRight, LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp, unreadAlertCount } from "@/context/AppContext";

const navItems = [
  { href: "/dashboard",     label: "Dashboard",     icon: LayoutDashboard },
  { href: "/transacoes",    label: "Transações",    icon: ArrowLeftRight  },
  { href: "/investimentos", label: "Investimentos", icon: TrendingUp      },
  { href: "/orcamento",     label: "Orçamento",     icon: Target          },
  { href: "/alertas",       label: "Alertas",       icon: Bell            },
  { href: "/perfil",        label: "Perfil",        icon: User            },
];

function RadarLogo() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="13" stroke="white" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.4"/>
      <circle cx="16" cy="16" r="8.5" stroke="white" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.6"/>
      <circle cx="16" cy="16" r="3.5" fill="white" opacity="0.95"/>
      <line x1="16" y1="16" x2="27" y2="5" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="27" cy="5" r="2.2" fill="white"/>
    </svg>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar, alerts, user } = useApp();
  const unread = unreadAlertCount(alerts);

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col bg-[#0F6E56] text-white h-screen sticky top-0 shrink-0",
        "transition-[width] duration-200 overflow-hidden",
        sidebarCollapsed ? "w-[72px]" : "w-[240px]"
      )}
    >
      {/* Logo */}
      <div className={cn("flex items-center gap-3 px-4 py-5", sidebarCollapsed && "justify-center px-0")}>
        <RadarLogo />
        {!sidebarCollapsed && (
          <span className="font-bold text-base tracking-tight whitespace-nowrap">Radar Financeiro</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 space-y-1 mt-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 relative",
                active
                  ? "bg-white/20 text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white",
                sidebarCollapsed && "justify-center px-0"
              )}
              title={sidebarCollapsed ? label : undefined}
            >
              <Icon size={18} className="shrink-0" />
              {!sidebarCollapsed && <span>{label}</span>}
              {href === "/alertas" && unread > 0 && (
                <span className={cn(
                  "absolute top-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center",
                  sidebarCollapsed ? "right-2 w-4 h-4" : "right-3 w-4 h-4"
                )}>
                  {unread}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User + collapse */}
      <div className="border-t border-white/10 p-3 space-y-2">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2.5 px-1 py-1">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold shrink-0">
              {user.avatarInitials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate">{user.name}</p>
              <p className="text-[11px] text-white/50 truncate">{user.email}</p>
            </div>
          </div>
        )}
        <div className="flex items-center gap-1">
          <Link
            href="/auth/login"
            className={cn(
              "flex items-center gap-2 rounded-lg px-2 py-1.5 text-white/60 hover:text-white hover:bg-white/10 transition-all text-xs",
              sidebarCollapsed && "justify-center w-full"
            )}
            title="Sair"
          >
            <LogOut size={15} />
            {!sidebarCollapsed && "Sair"}
          </Link>
          {!sidebarCollapsed && <div className="flex-1" />}
          <button
            onClick={toggleSidebar}
            className="ml-auto rounded-lg p-1.5 text-white/60 hover:text-white hover:bg-white/10 transition-all"
            title={sidebarCollapsed ? "Expandir" : "Recolher"}
          >
            {sidebarCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>
        </div>
      </div>
    </aside>
  );
}
