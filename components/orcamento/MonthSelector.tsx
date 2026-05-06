"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "@/components/ui/Button";

interface Props {
  date: Date;
  onChange: (d: Date) => void;
}

const MONTHS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

export default function MonthSelector({ date, onChange }: Props) {
  const now = new Date();
  const isCurrentMonth = date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();

  function prev() {
    const d = new Date(date);
    d.setMonth(d.getMonth() - 1);
    onChange(d);
  }
  function next() {
    if (isCurrentMonth) return;
    const d = new Date(date);
    d.setMonth(d.getMonth() + 1);
    onChange(d);
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" onClick={prev}><ChevronLeft size={16} /></Button>
      <span className="text-sm font-semibold text-gray-900 min-w-[120px] text-center">
        {MONTHS[date.getMonth()]} {date.getFullYear()}
      </span>
      <Button variant="ghost" size="sm" onClick={next} disabled={isCurrentMonth}>
        <ChevronRight size={16} />
      </Button>
    </div>
  );
}
