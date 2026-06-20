import { DateTime } from "luxon";
import type { Exchange, MarketOptions, MarketSession, TimelineBlock } from "@/types/market";
import { applySessionOverrides, getSessionIntervalsForLocalDate, isMarketHoliday, isWeekend } from "@/lib/marketStatus";

function blockLabel(session: MarketSession) {
  if (session.type === "pre") {
    return "Pre";
  }
  if (session.type === "post") {
    return "After";
  }
  if (session.type === "lunch") {
    return "Lunch";
  }
  return session.name;
}

export function convertSessionToDisplayTimezone(
  session: MarketSession,
  exchangeTimezone: string,
  displayTimezone: string,
  date: DateTime
) {
  const localDate = date.setZone(exchangeTimezone).startOf("day");
  const [openHour, openMinute] = session.open.split(":").map(Number);
  const [closeHour, closeMinute] = session.close.split(":").map(Number);
  const start = localDate.set({ hour: openHour, minute: openMinute, second: 0, millisecond: 0 });
  let end = localDate.set({ hour: closeHour, minute: closeMinute, second: 0, millisecond: 0 });
  if (end <= start) {
    end = end.plus({ days: 1 });
  }
  return {
    start: start.setZone(displayTimezone),
    end: end.setZone(displayTimezone)
  };
}

export function buildTodayTimeline(
  exchange: Exchange,
  date: DateTime,
  displayTimezone: string,
  options: MarketOptions
): TimelineBlock[] {
  const appliedExchange = applySessionOverrides(exchange, options.sessionOverrides);
  const dayStart = date.setZone(displayTimezone).startOf("day");
  const dayEnd = dayStart.plus({ days: 1 });
  const exchangeSeed = dayStart.setZone(appliedExchange.timezone);

  return [-1, 0, 1]
    .flatMap((offset) => {
      const localDate = exchangeSeed.plus({ days: offset }).startOf("day");
      if (isWeekend(appliedExchange, localDate) || isMarketHoliday(appliedExchange, localDate)) {
        return [];
      }
      return getSessionIntervalsForLocalDate(appliedExchange, localDate, options);
    })
    .map(({ session, start, end }) => {
      const displayStart = start.setZone(displayTimezone);
      const displayEnd = end.setZone(displayTimezone);
      const clippedStart = DateTime.max(displayStart, dayStart);
      const clippedEnd = DateTime.min(displayEnd, dayEnd);
      if (clippedEnd <= clippedStart) {
        return undefined;
      }

      const startPercent = (clippedStart.diff(dayStart, "minutes").minutes / 1440) * 100;
      const widthPercent = (clippedEnd.diff(clippedStart, "minutes").minutes / 1440) * 100;
      return {
        exchangeId: appliedExchange.id,
        sessionId: session.id,
        sessionName: session.name,
        type: session.type,
        countsAsOpen: session.countsAsOpen,
        startIso: displayStart.toISO() ?? displayStart.toString(),
        endIso: displayEnd.toISO() ?? displayEnd.toString(),
        startPercent,
        widthPercent,
        label: blockLabel(session)
      };
    })
    .filter((block): block is TimelineBlock => Boolean(block))
    .sort((a, b) => a.startPercent - b.startPercent);
}

export function buildScheduleText(exchanges: Exchange[], date: DateTime, displayTimezone: string, options: MarketOptions) {
  const lines = [`Market Clock - Today's schedule in ${displayTimezone}`, ""];
  for (const exchange of exchanges) {
    const blocks = buildTodayTimeline(exchange, date, displayTimezone, options);
    const summary = blocks
      .filter((block) => block.type !== "lunch")
      .map((block) => {
        const start = DateTime.fromISO(block.startIso).setZone(displayTimezone).toFormat("HH:mm");
        const end = DateTime.fromISO(block.endIso).setZone(displayTimezone).toFormat("HH:mm");
        return `${start}-${end} ${block.sessionName.toLowerCase()}`;
      })
      .join(", ");
    lines.push(`${exchange.acronym}: ${summary || "Closed"}`);
  }
  return lines.join("\n");
}
