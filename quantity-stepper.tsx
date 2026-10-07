import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  className?: string;
  size?: "sm" | "md";
};

export function QuantityStepper({
  value,
  onChange,
  min = 0,
  max = 99,
  className,
  size = "md",
}: Props) {
  const compact = size === "sm";
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border border-border bg-surface",
        compact ? "h-9" : "h-11",
        className,
      )}
    >
      <button
        type="button"
        aria-label="Punguza idadi"
        className={cn(
          "inline-flex items-center justify-center text-fg hover:bg-surface-2 disabled:opacity-40",
          compact ? "size-9" : "size-11",
        )}
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        <Minus className="size-4" />
      </button>
      <span className="min-w-7 text-center text-sm font-medium tabular-nums">{value}</span>
      <button
        type="button"
        aria-label="Ongeza idadi"
        className={cn(
          "inline-flex items-center justify-center text-fg hover:bg-surface-2 disabled:opacity-40",
          compact ? "size-9" : "size-11",
        )}
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}
