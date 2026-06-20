import { DateTime } from "luxon";
import type { Exchange, MarketOptions } from "@/types/market";
import { getExchangeStatus } from "@/lib/marketStatus";
import { formatDateTime } from "@/lib/timezone";

type SummaryStripProps = {
  exchanges: Exchange[];
  now: DateTime;
  displayTimezone: string;
  options: MarketOptions;
};

export function SummaryStrip({ exchanges, now, displayTimezone, options }: SummaryStripProps) {
  const statuses = exchanges.map((exchange) => ({ exchange, status: getExchangeStatus(exchange, now, options) }));
  const openCount = statuses.filter(({ status }) => status.kind === "open").length;
  const closedCount = statuses.filter(({ status }) => status.kind === "closed").length;
  const nextOpen = statuses
    .filter(({ status }) => status.nextChange?.label === "Opens")
    .sort((a, b) => DateTime.fromISO(a.status.nextChange?.at ?? "").toMillis() - DateTime.fromISO(b.status.nextChange?.at ?? "").toMillis())[0];
  const nextClose = statuses
    .filter(({ status }) => status.nextChange?.label === "Closes")
    .sort((a, b) => DateTime.fromISO(a.status.nextChange?.at ?? "").toMillis() - DateTime.fromISO(b.status.nextChange?.at ?? "").toMillis())[0];

  const items = [
    ["Current time", formatDateTime(now, displayTimezone)],
    ["Open", String(openCount)],
    ["Closed", String(closedCount)],
    ["Next open", nextOpen ? `${nextOpen.exchange.acronym} ${DateTime.fromISO(nextOpen.status.nextChange?.at ?? "").setZone(displayTimezone).toFormat("HH:mm")}` : "None today"],
    ["Next close", nextClose ? `${nextClose.exchange.acronym} ${DateTime.fromISO(nextClose.status.nextChange?.at ?? "").setZone(displayTimezone).toFormat("HH:mm")}` : "None active"],
    ["Timezone", displayTimezone]
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6" aria-label="Market summary">
      {items.map(([label, value]) => (
        <div key={label} className="rounded-2xl border border-white/[0.06] bg-white/[0.045] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          <p className="text-xs uppercase text-muted">{label}</p>
          <p className="mt-2 truncate text-sm font-semibold text-foreground">{value}</p>
        </div>
      ))}
    </section>
  );
}
