"use client";

import { RotateCcw, X } from "lucide-react";
import type { ExchangeOverrides, Preferences } from "@/types/market";
import { exchanges } from "@/data/exchanges";
import { DEFAULT_MARKET_IDS } from "@/data/timezones";
import { MarketSelector } from "@/components/MarketSelector";
import { SelectedMarketsList } from "@/components/SelectedMarketsList";
import { SessionEditor } from "@/components/SessionEditor";
import { TimezoneSelector } from "@/components/TimezoneSelector";
import { ToggleGroup } from "@/components/ToggleGroup";

type SettingsDrawerProps = {
  open: boolean;
  preferences: Preferences;
  onClose: () => void;
  onUpdate: (preferences: Preferences) => void;
};

export function SettingsDrawer({ open, preferences, onClose, onUpdate }: SettingsDrawerProps) {
  const selectedExchanges = preferences.selectedMarketIds
    .map((id) => exchanges.find((exchange) => exchange.id === id))
    .filter((exchange): exchange is (typeof exchanges)[number] => Boolean(exchange));

  function patch(partial: Partial<Preferences>) {
    onUpdate({ ...preferences, ...partial });
  }

  function addMarket(id: string) {
    if (!preferences.selectedMarketIds.includes(id)) {
      patch({ selectedMarketIds: [...preferences.selectedMarketIds, id] });
    }
  }

  function removeMarket(id: string) {
    patch({ selectedMarketIds: preferences.selectedMarketIds.filter((marketId) => marketId !== id) });
  }

  function moveMarket(id: string, direction: "up" | "down") {
    const ids = [...preferences.selectedMarketIds];
    const index = ids.indexOf(id);
    const target = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || target < 0 || target >= ids.length) {
      return;
    }
    [ids[index], ids[target]] = [ids[target], ids[index]];
    patch({ selectedMarketIds: ids });
  }

  function toggleFavorite(id: string) {
    const favoriteMarketIds = preferences.favoriteMarketIds.includes(id)
      ? preferences.favoriteMarketIds.filter((marketId) => marketId !== id)
      : [...preferences.favoriteMarketIds, id];
    patch({ favoriteMarketIds });
  }

  function reset() {
    patch({ selectedMarketIds: DEFAULT_MARKET_IDS, favoriteMarketIds: DEFAULT_MARKET_IDS, sessionOverrides: {} });
  }

  function addTimezone(timezone: string) {
    if (!preferences.addedTimezones.includes(timezone)) {
      patch({ addedTimezones: [...preferences.addedTimezones, timezone] });
    }
  }

  function updateOverrides(sessionOverrides: ExchangeOverrides) {
    patch({ sessionOverrides });
  }

  return (
    <div className={`fixed inset-0 z-50 ${open ? "pointer-events-auto" : "pointer-events-none"}`} aria-hidden={!open}>
      <div className={`absolute inset-0 bg-black/55 backdrop-blur-sm transition-opacity ${open ? "opacity-100" : "opacity-0"}`} onClick={onClose} />
      <aside className={`absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto border-l border-white/10 bg-[#050506]/95 p-5 shadow-2xl transition-transform duration-300 sm:p-6 ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase text-muted">Settings</p>
            <h2 className="mt-1 text-2xl font-semibold text-foreground">Market Clock</h2>
          </div>
          <button type="button" onClick={onClose} title="Close settings" className="rounded-lg p-2 text-muted transition hover:bg-white/10 hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 space-y-6">
          <TimezoneSelector
            value={preferences.displayTimezone}
            addedTimezones={preferences.addedTimezones}
            onChange={(displayTimezone) => patch({ displayTimezone })}
            onAddTimezone={addTimezone}
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <ToggleGroup label="Extended hours" checked={preferences.includeExtendedHours} onChange={(includeExtendedHours) => patch({ includeExtendedHours })} />
            <ToggleGroup label="Regular only" checked={preferences.regularOnly} onChange={(regularOnly) => patch({ regularOnly })} />
            <ToggleGroup label="Compact cards" checked={preferences.compactMode} onChange={(compactMode) => patch({ compactMode })} />
          </div>

          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-white/[0.08] active:scale-[0.98]"
          >
            <RotateCcw className="h-4 w-4" />
            Reset defaults
          </button>

          <SelectedMarketsList
            exchanges={selectedExchanges}
            favoriteIds={preferences.favoriteMarketIds}
            onRemove={removeMarket}
            onMove={moveMarket}
            onToggleFavorite={toggleFavorite}
          />

          <MarketSelector
            selectedIds={preferences.selectedMarketIds}
            favoriteIds={preferences.favoriteMarketIds}
            onAdd={addMarket}
            onToggleFavorite={toggleFavorite}
          />

          <SessionEditor
            selectedMarketIds={preferences.selectedMarketIds}
            overrides={preferences.sessionOverrides}
            onChange={updateOverrides}
          />
        </div>
      </aside>
    </div>
  );
}
