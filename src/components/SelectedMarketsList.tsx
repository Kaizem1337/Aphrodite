"use client";

import { ArrowDown, ArrowUp, Star, Trash2 } from "lucide-react";
import type { Exchange } from "@/types/market";

type SelectedMarketsListProps = {
  exchanges: Exchange[];
  favoriteIds: string[];
  onRemove: (id: string) => void;
  onMove: (id: string, direction: "up" | "down") => void;
  onToggleFavorite: (id: string) => void;
};

export function SelectedMarketsList({ exchanges, favoriteIds, onRemove, onMove, onToggleFavorite }: SelectedMarketsListProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase text-muted">Selected markets</p>
      {exchanges.map((exchange) => (
        <div key={exchange.id} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2">
          <span className="min-w-0 flex-1 truncate text-sm text-foreground">{exchange.acronym}</span>
          <button type="button" title="Move up" onClick={() => onMove(exchange.id, "up")} className="rounded-md p-2 text-muted hover:bg-white/10 hover:text-foreground">
            <ArrowUp className="h-4 w-4" />
          </button>
          <button type="button" title="Move down" onClick={() => onMove(exchange.id, "down")} className="rounded-md p-2 text-muted hover:bg-white/10 hover:text-foreground">
            <ArrowDown className="h-4 w-4" />
          </button>
          <button type="button" title="Favourite" onClick={() => onToggleFavorite(exchange.id)} className={`rounded-md p-2 hover:bg-white/10 ${favoriteIds.includes(exchange.id) ? "text-amber-200" : "text-muted hover:text-foreground"}`}>
            <Star className="h-4 w-4" />
          </button>
          <button type="button" title="Remove" onClick={() => onRemove(exchange.id)} className="rounded-md p-2 text-muted hover:bg-rose-500/10 hover:text-rose-200">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
