import type { MarketStatusKind } from "@/types/market";

const styles: Record<MarketStatusKind, string> = {
  open: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  closed: "border-rose-400/30 bg-rose-400/10 text-rose-200",
  lunch: "border-amber-300/30 bg-amber-300/10 text-amber-100",
  pre: "border-amber-300/30 bg-amber-300/10 text-amber-100",
  post: "border-amber-300/30 bg-amber-300/10 text-amber-100"
};

export function StatusBadge({ kind, label }: { kind: MarketStatusKind; label: string }) {
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${styles[kind]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}
