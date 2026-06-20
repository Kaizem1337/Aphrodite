"use client";

import { Plus, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { exchanges } from "@/data/exchanges";
import { MarketSearch } from "@/components/MarketSearch";

type MarketSelectorProps = {
  selectedIds: string[];
  favoriteIds: string[];
  onAdd: (id: string) => void;
  onToggleFavorite: (id: string) => void;
};

export function MarketSelector({ selectedIds, favoriteIds, onAdd, onToggleFavorite }: MarketSelectorProps) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const text = query.toLowerCase();
    return exchanges.filter((exchange) =>
      [exchange.name, exchange.acronym, exchange.country, exchange.city, exchange.region].some((value) =>
        value.toLowerCase().includes(text)
      )
    );
  }, [query]);

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase text-muted">Market list</p>
      <MarketSearch value={query} onChange={setQuery} />
      <div className="max-h-72 space-y-2 overflow-auto pr-1 scrollbar-thin">
        {filtered.map((exchange) => {
          const selected = selectedIds.includes(exchange.id);
          return (
            <div key={exchange.id} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{exchange.acronym} - {exchange.name}</p>
                <p className="truncate text-xs text-muted">{exchange.region} - {exchange.city}</p>
              </div>
              <button
                type="button"
                title="Favourite"
                onClick={() => onToggleFavorite(exchange.id)}
                className={`rounded-md p-2 hover:bg-white/10 ${favoriteIds.includes(exchange.id) ? "text-amber-200" : "text-muted hover:text-foreground"}`}
              >
                <Star className="h-4 w-4" />
              </button>
              <button
                type="button"
                title={selected ? "Selected" : "Add market"}
                disabled={selected}
                onClick={() => onAdd(exchange.id)}
                className="rounded-md bg-white/[0.05] p-2 text-muted transition hover:bg-white/10 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-35"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
