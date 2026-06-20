import { DateTime } from "luxon";
import { buildTodayTimeline } from "@/lib/timeline";
import { formatTime } from "@/lib/timezone";
import type { Exchange, MarketOptions, SessionType } from "@/types/market";

const blockStyles: Record<SessionType, string> = {
  regular: "bg-emerald-400/75 border-emerald-200/30 text-emerald-950",
  pre: "bg-amber-300/45 border-amber-100/25 text-amber-950",
  post: "bg-amber-300/45 border-amber-100/25 text-amber-950",
  lunch: "bg-amber-500/30 border-amber-100/20 text-amber-100",
  auction: "bg-sky-300/45 border-sky-100/25 text-sky-950",
  custom: "bg-[#5E6AD2]/60 border-indigo-100/25 text-white"
};

const hours = Array.from({ length: 25 }, (_, index) => index);

export function MarketTimeline({
  exchanges,
  now,
  displayTimezone,
  options
}: {
  exchanges: Exchange[];
  now: DateTime;
  displayTimezone: string;
  options: MarketOptions;
}) {
  const dayStart = now.setZone(displayTimezone).startOf("day");
  const nowPercent = (now.setZone(displayTimezone).diff(dayStart, "minutes").minutes / 1440) * 100;

  return (
    <section className="glass-panel rounded-2xl p-4 sm:p-6" aria-label="24 hour market timeline">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase text-muted">24-hour overlap timeline</p>
          <h2 className="mt-2 text-2xl font-semibold text-foreground">Trading sessions in {displayTimezone}</h2>
        </div>
        <p className="font-mono text-sm text-muted">Now {formatTime(now, displayTimezone)}</p>
      </div>

      <div className="mt-6 overflow-x-auto pb-2 scrollbar-thin">
        <div className="min-w-[980px]">
          <div className="grid grid-cols-[150px_1fr] gap-4">
            <div />
            <div className="relative h-8">
              {hours.map((hour) => (
                <span
                  key={hour}
                  className="absolute top-0 -translate-x-1/2 font-mono text-xs text-muted"
                  style={{ left: `${(hour / 24) * 100}%` }}
                >
                  {hour === 24 ? "24" : hour.toString().padStart(2, "0")}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {exchanges.map((exchange) => {
              const blocks = buildTodayTimeline(exchange, now, displayTimezone, options);
              return (
                <div key={exchange.id} className="grid grid-cols-[150px_1fr] items-center gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{exchange.acronym}</p>
                    <p className="truncate text-xs text-muted">{exchange.city}</p>
                  </div>
                  <div className="relative h-12 rounded-lg border border-white/10 bg-black/25">
                    <div
                      className="absolute inset-y-0 w-px bg-[#5E6AD2]/60"
                      style={{ left: `${Math.max(0, Math.min(100, nowPercent))}%` }}
                    >
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 rounded-full border border-[#5E6AD2]/40 bg-[#101225] px-2 py-0.5 text-[10px] font-semibold text-[#C9CEFF]">
                        Now
                      </span>
                    </div>
                    {blocks.map((block) => (
                      <div
                        key={`${block.sessionId}-${block.startIso}`}
                        title={`${exchange.acronym} ${block.sessionName}: ${DateTime.fromISO(block.startIso).setZone(displayTimezone).toFormat("HH:mm")} - ${DateTime.fromISO(block.endIso).setZone(displayTimezone).toFormat("HH:mm")}`}
                        className={`absolute top-1/2 flex h-7 -translate-y-1/2 items-center overflow-hidden rounded-md border px-2 text-[11px] font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] ${blockStyles[block.type]}`}
                        style={{ left: `${block.startPercent}%`, width: `${Math.max(block.widthPercent, 0.4)}%` }}
                      >
                        <span className="truncate">{block.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
