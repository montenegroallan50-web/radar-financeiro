import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  showLabel?: boolean;
  className?: string;
}

function colorClass(value: number) {
  if (value > 100) return "bg-red-500";
  if (value >= 75) return "bg-amber-400";
  return "bg-brand";
}

export default function ProgressBar({ value, showLabel, className }: ProgressBarProps) {
  const clamped = Math.min(value, 100);
  return (
    <div className={cn("space-y-1", className)}>
      {showLabel && (
        <div className="flex justify-between text-xs text-gray-500">
          <span>{Math.round(value)}%</span>
          {value > 100 && <span className="text-red-500 font-medium">Estourou</span>}
        </div>
      )}
      <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", colorClass(value))}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
