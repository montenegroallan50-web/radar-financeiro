"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { TransactionCategory, ALL_CATEGORIES } from "@/lib/mock-data";
import { CATEGORY_BG } from "@/lib/chart-colors";
import { cn } from "@/lib/utils";

interface Props {
  category: TransactionCategory;
  onChange: (c: TransactionCategory) => void;
}

export default function CategoryChip({ category, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all hover:opacity-80",
          CATEGORY_BG[category]
        )}
      >
        {category}
        <ChevronDown size={11} className={cn("transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-white rounded-xl shadow-card-hover border border-gray-100 py-1 min-w-[160px]">
          {ALL_CATEGORIES.filter((c) => c !== "Salário").map((c) => (
            <button
              key={c}
              onClick={() => { onChange(c); setOpen(false); }}
              className={cn(
                "w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors flex items-center gap-2",
                c === category && "font-semibold"
              )}
            >
              <span className={cn("w-2 h-2 rounded-full", CATEGORY_BG[c].split(" ")[0].replace("bg-", "bg-"))} />
              {c}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
