"use client";

import { ArrowLeft } from "lucide-react";
import { DateTime } from "luxon";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CountdownTimer } from "@/components/CountdownTimer";
import { SessionEditor } from "@/components/SessionEditor";
import { Spotlight } from "@/components/Spotlight";
import { StatusBadge } from "@/components/StatusBadge";
import { exchanges } from "@/data/exchanges";
import { getExchangeStatus, getNextSessionChange } from "@/lib/marketStatus";
import { readPreferences, savePreferences } from "@/lib/storage";
import { buildTodayTimeline } from "@/lib/timeline";
import { formatDateTime, formatTime } from "@/lib/timezone";
import type { Preferences } from "@/types/market";

export function MarketDetail({ marketId }: { marketId: string }) {
  const [now, setNow] = useState(() => DateTime.now());
  const [preferences, setPreferences] = useState<Preferences>(() => readPreferences());
  const exchange = exchanges.find((candidate) => candidate.id === marketId);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(DateTime.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    savePreferences(preferences);
  }, [preferences]);

  const options = useMemo(
    () => ({
      includeExtendedHours: preferences.includeExtendedHours,
      regularOnly: preferences.regularOnly,
      sessionOverrides: preferences.sessionOverrides
    }),
    [preferences]
  );

  if (!exchange) {
    return (
      <main className="mx-auto min-h-screen max-w-4xl px-4 py-10 text-foreground">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Link>
        <h1 className="mt-8 text-3xl font-semibold">Market not found</h1>
      </main>
    );
  }

  const status = getExchangeStatus(exchange, now, options);
  const tomorrowNext = getNextSessionChange(exchange, now.plus({ days: 1 }).startOf("day"), options);
  const sessions = buildTodayTimeline(exchange, now, preferences.displayTimezone, options);

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted transition hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Link>

        <Spotlight className="p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-muted">{exchange.country} - {exchange.city}</p>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight text-foreground">{exchange.name}</h1>
              <p className="mt-3 text-muted">{exchange.acronym} / {exchange.timezone}</p>
            </div>
            <StatusBadge kind={status.kind} label={status.label} />
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase text-muted">Local time</p>
              <p className="mt-2 font-mono text-xl text-foreground">{formatTime(now, exchange.timezone)}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase text-muted">Display time</p>
              <p className="mt-2 font-mono text-xl text-foreground">{formatTime(now, preferences.displayTimezone)}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase text-muted">Next change</p>
              <p className="mt-2 text-sm text-foreground">
                <CountdownTimer targetIso={status.nextChange?.at} now={now} label={status.nextChange?.label} />
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase text-muted">Tomorrow</p>
              <p className="mt-2 text-sm text-foreground">
                {tomorrowNext?.at ? formatDateTime(tomorrowNext.at, preferences.displayTimezone) : "No session"}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-white/10 bg-white/[0.035] p-4 text-sm text-muted">
            {status.reason}. {exchange.notes}
          </div>
        </Spotlight>

        <Spotlight className="p-6">
          <h2 className="text-xl font-semibold text-foreground">Today sessions</h2>
          <div className="mt-4 space-y-3">
            {sessions.length ? (
              sessions.map((session) => (
                <div key={`${session.sessionId}-${session.startIso}`} className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-white/[0.04] p-3 text-sm">
                  <span className="font-medium text-foreground">{session.sessionName}</span>
                  <span className="font-mono text-muted">
                    {DateTime.fromISO(session.startIso).setZone(preferences.displayTimezone).toFormat("HH:mm")} - {DateTime.fromISO(session.endIso).setZone(preferences.displayTimezone).toFormat("HH:mm")}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-muted">Closed today</p>
            )}
          </div>
        </Spotlight>

        <Spotlight className="p-6">
          <SessionEditor
            selectedMarketIds={[exchange.id]}
            overrides={preferences.sessionOverrides}
            onChange={(sessionOverrides) => setPreferences({ ...preferences, sessionOverrides })}
          />
        </Spotlight>
      </div>
    </main>
  );
}
