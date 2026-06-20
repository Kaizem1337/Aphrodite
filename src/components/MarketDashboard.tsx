"use client";

import { Settings } from "lucide-react";
import { DateTime } from "luxon";
import { useEffect, useMemo, useState } from "react";
import { CopyScheduleButton } from "@/components/CopyScheduleButton";
import { MarketCard } from "@/components/MarketCard";
import { MarketTimeline } from "@/components/MarketTimeline";
import { SettingsDrawer } from "@/components/SettingsDrawer";
import { SummaryStrip } from "@/components/SummaryStrip";
import { exchanges } from "@/data/exchanges";
import { readPreferences, savePreferences } from "@/lib/storage";
import { formatDateTime } from "@/lib/timezone";
import type { Preferences } from "@/types/market";

export function MarketDashboard() {
  const [now, setNow] = useState(() => DateTime.now());
  const [preferences, setPreferences] = useState<Preferences>(() => readPreferences());
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(DateTime.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    savePreferences(preferences);
  }, [preferences]);

  const selectedExchanges = useMemo(
    () =>
      preferences.selectedMarketIds
        .map((id) => exchanges.find((exchange) => exchange.id === id))
        .filter((exchange): exchange is (typeof exchanges)[number] => Boolean(exchange)),
    [preferences.selectedMarketIds]
  );

  const options = {
    includeExtendedHours: preferences.includeExtendedHours,
    regularOnly: preferences.regularOnly,
    sessionOverrides: preferences.sessionOverrides
  };

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col items-center gap-5 py-10 text-center sm:py-14">
          <div className="rounded-full border border-[#5E6AD2]/30 bg-[#5E6AD2]/10 px-4 py-2 text-xs font-semibold uppercase text-[#C9CEFF] shadow-[0_0_36px_rgba(94,106,210,0.18)]">
            Market Clock
          </div>
          <div className="max-w-4xl">
            <h1 className="bg-gradient-to-b from-white via-white/95 to-white/65 bg-clip-text text-4xl font-semibold tracking-tight text-transparent sm:text-6xl lg:text-7xl">
              Is the stock market open?
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
              Live status for your selected markets - automatically adjusted to your timezone
            </p>
          </div>
          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <div className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 font-mono text-sm text-foreground">
              {formatDateTime(now, preferences.displayTimezone)}
            </div>
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#5E6AD2] px-4 py-3 text-sm font-semibold text-white shadow-[0_0_0_1px_rgba(94,106,210,0.5),0_4px_12px_rgba(94,106,210,0.3),inset_0_1px_0_rgba(255,255,255,0.2)] transition hover:bg-[#6872D9] active:scale-[0.98]"
            >
              <Settings className="h-4 w-4" />
              Settings
            </button>
          </div>
        </header>

        <div className="space-y-6">
          <SummaryStrip exchanges={selectedExchanges} now={now} displayTimezone={preferences.displayTimezone} options={options} />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-semibold text-foreground">Selected markets</h2>
            <CopyScheduleButton exchanges={selectedExchanges} now={now} displayTimezone={preferences.displayTimezone} options={options} />
          </div>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label="Selected market status cards">
            {selectedExchanges.map((exchange) => (
              <MarketCard
                key={exchange.id}
                exchange={exchange}
                now={now}
                displayTimezone={preferences.displayTimezone}
                options={options}
                compact={preferences.compactMode}
              />
            ))}
          </section>

          <MarketTimeline exchanges={selectedExchanges} now={now} displayTimezone={preferences.displayTimezone} options={options} />
        </div>
      </div>

      <SettingsDrawer open={settingsOpen} preferences={preferences} onClose={() => setSettingsOpen(false)} onUpdate={setPreferences} />
    </main>
  );
}
