import { ExternalLink } from "lucide-react";
import { DateTime } from "luxon";
import Link from "next/link";
import { CountdownTimer } from "@/components/CountdownTimer";
import { Spotlight } from "@/components/Spotlight";
import { StatusBadge } from "@/components/StatusBadge";
import { flagEmoji } from "@/lib/formatting";
import { getExchangeStatus } from "@/lib/marketStatus";
import { formatTime } from "@/lib/timezone";
import type { Exchange, MarketOptions } from "@/types/market";

export function MarketCard({
  exchange,
  now,
  displayTimezone,
  options,
  compact
}: {
  exchange: Exchange;
  now: DateTime;
  displayTimezone: string;
  options: MarketOptions;
  compact: boolean;
}) {
  const status = getExchangeStatus(exchange, now, options);
  const localNow = now.setZone(exchange.timezone);
  const nextAt = status.nextChange?.at;
  const nextTime = nextAt ? DateTime.fromISO(nextAt).setZone(displayTimezone).toFormat("HH:mm") : "No event";

  return (
    <Spotlight className={`p-5 transition duration-300 hover:-translate-y-1 hover:shadow-glassHover ${compact ? "min-h-0" : "min-h-72"}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <span className="text-2xl" aria-hidden="true">{flagEmoji(exchange.flag)}</span>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold text-foreground">{exchange.acronym}</h2>
              <p className="truncate text-sm text-muted">{exchange.name}</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted">{exchange.country} - {exchange.city}</p>
        </div>
        <StatusBadge kind={status.kind} label={status.label} />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-white/10 bg-black/20 p-3">
          <p className="text-xs uppercase text-muted">Local</p>
          <p className="mt-1 font-mono text-lg text-foreground">{localNow.toFormat("HH:mm:ss")}</p>
          <p className="text-xs text-muted">{exchange.timezone}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-black/20 p-3">
          <p className="text-xs uppercase text-muted">Display</p>
          <p className="mt-1 font-mono text-lg text-foreground">{formatTime(now, displayTimezone)}</p>
          <p className="text-xs text-muted">{displayTimezone}</p>
        </div>
      </div>

      <div className="mt-5 space-y-3 text-sm">
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted">Session</span>
          <span className="text-right font-medium text-foreground">{status.session?.name ?? status.reason}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted">Countdown</span>
          <span className="text-right">
            <CountdownTimer targetIso={nextAt} now={now} label={status.nextChange?.label} />
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted">Next event</span>
          <span className="font-mono text-foreground">{nextTime}</span>
        </div>
        {!compact ? (
          <>
            <p className="rounded-lg border border-white/10 bg-white/[0.035] p-3 text-muted">{status.reason}</p>
            {exchange.notes ? <p className="text-xs leading-relaxed text-muted">{exchange.notes}</p> : null}
          </>
        ) : null}
      </div>

      <Link href={`/markets/${exchange.id}`} className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[#AEB5FF] transition hover:text-white">
        Details
        <ExternalLink className="h-3.5 w-3.5" />
      </Link>
    </Spotlight>
  );
}
