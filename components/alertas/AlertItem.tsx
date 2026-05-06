"use client";

import { Alert } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import AlertTypeIcon from "./AlertTypeIcon";

function relativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `há ${mins} minuto${mins !== 1 ? "s" : ""}`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `há ${hrs} hora${hrs !== 1 ? "s" : ""}`;
  const days = Math.floor(hrs / 24);
  return `há ${days} dia${days !== 1 ? "s" : ""}`;
}

interface Props {
  alert: Alert;
  onMarkRead: (id: string) => void;
}

export default function AlertItem({ alert, onMarkRead }: Props) {
  return (
    <div className={cn(
      "flex items-start gap-3 p-4 rounded-2xl border transition-all",
      alert.read
        ? "bg-white border-gray-100"
        : "bg-brand-50 border-brand/20 border-l-4 border-l-brand"
    )}>
      <AlertTypeIcon type={alert.type} />
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm", alert.read ? "text-gray-700" : "font-semibold text-gray-900")}>
          {alert.title}
        </p>
        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{alert.description}</p>
        <p className="text-xs text-gray-400 mt-1">{relativeDate(alert.date)}</p>
      </div>
      {!alert.read && (
        <button
          onClick={() => onMarkRead(alert.id)}
          className="text-xs text-brand hover:underline font-medium shrink-0 mt-0.5"
        >
          Marcar como lida
        </button>
      )}
    </div>
  );
}
