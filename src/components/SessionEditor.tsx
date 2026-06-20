"use client";

import { Plus, Save } from "lucide-react";
import { useMemo, useState } from "react";
import { exchanges } from "@/data/exchanges";
import type { ExchangeOverrides, MarketSession, SessionOverride, SessionType } from "@/types/market";
import { applySessionOverrides } from "@/lib/marketStatus";

type SessionEditorProps = {
  selectedMarketIds: string[];
  overrides: ExchangeOverrides;
  onChange: (overrides: ExchangeOverrides) => void;
};

const sessionTypes: SessionType[] = ["regular", "pre", "post", "lunch", "auction", "custom"];

export function SessionEditor({ selectedMarketIds, overrides, onChange }: SessionEditorProps) {
  const firstMarket = selectedMarketIds[0] ?? "nyse";
  const [exchangeId, setExchangeId] = useState(firstMarket);
  const exchange = exchanges.find((candidate) => candidate.id === exchangeId) ?? exchanges[0];
  const appliedExchange = useMemo(() => applySessionOverrides(exchange, overrides), [exchange, overrides]);

  function updateSession(session: MarketSession) {
    const existing = overrides[exchange.id] ?? [];
    const nextOverride: SessionOverride = { ...session };
    onChange({
      ...overrides,
      [exchange.id]: [...existing.filter((item) => item.id !== session.id), nextOverride]
    });
  }

  function addSession() {
    const id = `custom-${Date.now()}`;
    updateSession({ id, name: "Custom", open: "09:00", close: "10:00", type: "custom", countsAsOpen: true });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase text-muted">Session editor</p>
        <button type="button" onClick={addSession} className="inline-flex items-center gap-2 rounded-lg bg-[#5E6AD2] px-3 py-2 text-xs font-semibold text-white shadow-[0_0_0_1px_rgba(94,106,210,0.5),0_4px_12px_rgba(94,106,210,0.25)] transition hover:bg-[#6872D9] active:scale-[0.98]">
          <Plus className="h-3.5 w-3.5" />
          Add
        </button>
      </div>
      <select
        value={exchange.id}
        onChange={(event) => setExchangeId(event.target.value)}
        className="w-full rounded-lg border border-white/10 bg-[#0F0F12] px-3 py-3 text-sm text-foreground"
      >
        {exchanges
          .filter((candidate) => selectedMarketIds.includes(candidate.id))
          .map((candidate) => (
            <option key={candidate.id} value={candidate.id}>
              {candidate.acronym} - {candidate.name}
            </option>
          ))}
      </select>
      <div className="space-y-2">
        {appliedExchange.sessions.map((session) => (
          <div key={session.id} className="grid grid-cols-2 gap-2 rounded-lg border border-white/10 bg-white/[0.04] p-3 sm:grid-cols-[1fr_96px_96px_110px_auto]">
            <label className="sr-only" htmlFor={`${session.id}-name`}>Session name</label>
            <input
              id={`${session.id}-name`}
              value={session.name}
              onChange={(event) => updateSession({ ...session, name: event.target.value })}
              className="rounded-lg border border-white/10 bg-[#0F0F12] px-3 py-2 text-sm text-foreground"
            />
            <input
              aria-label={`${session.name} open`}
              type="time"
              value={session.open}
              onChange={(event) => updateSession({ ...session, open: event.target.value })}
              className="rounded-lg border border-white/10 bg-[#0F0F12] px-3 py-2 text-sm text-foreground"
            />
            <input
              aria-label={`${session.name} close`}
              type="time"
              value={session.close}
              onChange={(event) => updateSession({ ...session, close: event.target.value })}
              className="rounded-lg border border-white/10 bg-[#0F0F12] px-3 py-2 text-sm text-foreground"
            />
            <select
              aria-label={`${session.name} type`}
              value={session.type}
              onChange={(event) => updateSession({ ...session, type: event.target.value as SessionType })}
              className="rounded-lg border border-white/10 bg-[#0F0F12] px-3 py-2 text-sm text-foreground"
            >
              {sessionTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <button type="button" title="Save session" onClick={() => updateSession(session)} className="rounded-lg bg-white/[0.05] p-2 text-muted transition hover:bg-white/10 hover:text-foreground">
              <Save className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
