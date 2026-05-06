import { cn } from "@/lib/utils";
import { ReactNode } from "react";

type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral" | "brand";

const styles: Record<BadgeVariant, string> = {
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  danger:  "bg-red-100 text-red-600",
  info:    "bg-blue-100 text-blue-700",
  neutral: "bg-gray-100 text-gray-600",
  brand:   "bg-brand-100 text-brand",
};

interface BadgeProps {
  variant?: BadgeVariant;
  size?: "sm" | "md";
  className?: string;
  children: ReactNode;
}

export default function Badge({ variant = "neutral", size = "sm", className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        styles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
