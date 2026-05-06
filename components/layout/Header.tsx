"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Bell, ChevronDown, User, LogOut, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp, unreadAlertCount } from "@/context/AppContext";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard":     "Dashboard",
  "/transacoes":    "Transações",
  "/investimentos": "Investimentos",
  "/orcamento":     "Orçamento",
  "/alertas":       "Alertas",
  "/perfil":        "Perfil",
};

export default function Header() {
  const pathname = usePathname();
  const { alerts, user, toggleSidebar } = useApp();
  const unread = unreadAlertCount(alerts);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const title = PAGE_TITLES[pathname] ?? "Radar Financeiro";

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="sticky top-0 z-40 h-16 bg-white border-b border-gray-100 shadow-sm flex items-center px-4 gap-3">
      {/* Mobile hamburger */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
      >
        <Menu size={20} />
      </button>

      <h1 className="text-lg font-bold text-gray-900 flex-1">{title}</h1>

      {/* Bell */}
      <Link
        href="/alertas"
        className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
      >
        <Bell size={20} />
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </Link>

      {/* Avatar dropdown */}
      <div className="relative" ref={dropRef}>
        <button
          onClick={() => setDropdownOpen((v) => !v)}
          className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-gray-100 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-white text-xs font-bold">
            {user.avatarInitials}
          </div>
          <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
            {user.name.split(" ")[0]}
          </span>
          <ChevronDown size={14} className={cn("text-gray-400 transition-transform", dropdownOpen && "rotate-180")} />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-card-hover border border-gray-100 py-1 z-50">
            <div className="px-3 py-2 border-b border-gray-100 mb-1">
              <p className="text-xs font-semibold text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
            <Link
              href="/perfil"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <User size={15} /> Meu Perfil
            </Link>
            <Link
              href="/auth/login"
              className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut size={15} /> Sair
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
