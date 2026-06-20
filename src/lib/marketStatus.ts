import { DateTime } from "luxon";
import type { Exchange, MarketOptions, MarketSession, MarketStatus, SessionOverride } from "@/types/market";
import { toDateTime } from "@/lib/timezone";

type SessionInterval = {
  session: MarketSession;
  start: DateTime;
  end: DateTime;
};

const defaultOptions: MarketOptions = {
  includeExtendedHours: true,
  regularOnly: false,
  sessionOverrides: {}
};

function parseSessionTime(localDate: DateTime, time: string) {
  const [hour, minute] = time.split(":").map(Number);
  return localDate.set({ hour, minute, second: 0, millisecond: 0 });
}

function shouldIncludeSession(session: MarketSession, options: MarketOptions) {
  if (options.regularOnly && session.type !== "regular" && session.type !== "lunch") {
    return false;
  }

  if (!options.includeExtendedHours && (session.type === "pre" || session.type === "post")) {
    return false;
  }

  return true;
}

export function applySessionOverrides(exchange: Exchange, overrides: Record<string, SessionOverride[]> = {}) {
  const exchangeOverrides = overrides[exchange.id] ?? [];
  if (!exchangeOverrides.length) {
    return exchange;
  }

  const sessionsById = new Map(exchange.sessions.map((session) => [session.id, session]));
  for (const override of exchangeOverrides) {
    if (override.deleted) {
      sessionsById.delete(override.id);
      continue;
    }

    const existing = sessionsById.get(override.id);
    sessionsById.set(override.id, {
      id: override.id,
      name: override.name ?? existing?.name ?? "Custom session",
      open: override.open ?? existing?.open ?? "09:00",
      close: override.close ?? existing?.close ?? "17:00",
      type: override.type ?? existing?.type ?? "custom",
      countsAsOpen: override.countsAsOpen ?? existing?.countsAsOpen ?? true
    });
  }

  return {
    ...exchange,
    sessions: Array.from(sessionsById.values())
  };
}

export function isMarketHoliday(exchange: Exchange, date: DateTime | string) {
  const localDate = typeof date === "string" ? DateTime.fromISO(date, { zone: exchange.timezone }) : date.setZone(exchange.timezone);
  return exchange.holidays.includes(localDate.toISODate() ?? "");
}

export function isWeekend(exchange: Exchange, date: DateTime | string) {
  const localDate = typeof date === "string" ? DateTime.fromISO(date, { zone: exchange.timezone }) : date.setZone(exchange.timezone);
  return exchange.weekendDays.includes(localDate.weekday);
}

export function getSessionIntervalsForLocalDate(exchange: Exchange, localDate: DateTime, options: MarketOptions = defaultOptions) {
  return exchange.sessions
    .filter((session) => shouldIncludeSession(session, options))
    .map((session) => {
      const start = parseSessionTime(localDate, session.open);
      let end = parseSessionTime(localDate, session.close);
      if (end <= start) {
        end = end.plus({ days: 1 });
      }
      return { session, start, end };
    })
    .sort((a, b) => a.start.toMillis() - b.start.toMillis());
}

function getNearbySessionIntervals(exchange: Exchange, now: DateTime, options: MarketOptions): SessionInterval[] {
  const localNow = now.setZone(exchange.timezone);
  return [-1, 0, 1, 2]
    .flatMap((offset) => {
      const localDate = localNow.plus({ days: offset }).startOf("day");
      if (isWeekend(exchange, localDate) || isMarketHoliday(exchange, localDate)) {
        return [];
      }
      return getSessionIntervalsForLocalDate(exchange, localDate, options);
    })
    .sort((a, b) => a.start.toMillis() - b.start.toMillis());
}

export function getCurrentSession(exchange: Exchange, nowValue: DateTime | Date | string, optionsValue: Partial<MarketOptions> = {}) {
  const options = { ...defaultOptions, ...optionsValue };
  const appliedExchange = applySessionOverrides(exchange, options.sessionOverrides);
  const now = toDateTime(nowValue).setZone(appliedExchange.timezone);

  if (isWeekend(appliedExchange, now) || isMarketHoliday(appliedExchange, now)) {
    return undefined;
  }

  return getSessionIntervalsForLocalDate(appliedExchange, now.startOf("day"), options).find(
    ({ start, end }) => now >= start && now < end
  )?.session;
}

function getNextSessionChange(exchange: Exchange, nowValue: DateTime | Date | string, optionsValue: Partial<MarketOptions> = {}) {
  const options = { ...defaultOptions, ...optionsValue };
  const appliedExchange = applySessionOverrides(exchange, options.sessionOverrides);
  const now = toDateTime(nowValue);
  const current = getNearbySessionIntervals(appliedExchange, now, options).find(({ start, end }) => now >= start && now < end);

  if (current) {
    const label =
      current.session.type === "lunch"
        ? "Lunch ends"
        : current.session.type === "pre"
          ? "Pre-market ends"
          : current.session.type === "post"
            ? "After-hours ends"
            : "Closes";
    return { at: current.end.toISO() ?? current.end.toString(), label, session: current.session };
  }

  const next = getNearbySessionIntervals(appliedExchange, now, options).find(({ start }) => start > now);
  if (!next) {
    return undefined;
  }
  return { at: next.start.toISO() ?? next.start.toString(), label: next.session.type === "lunch" ? "Lunch starts" : "Opens", session: next.session };
}

export { getNextSessionChange };

export function getExchangeStatus(exchange: Exchange, nowValue: DateTime | Date | string, optionsValue: Partial<MarketOptions> = {}): MarketStatus {
  const options = { ...defaultOptions, ...optionsValue };
  const appliedExchange = applySessionOverrides(exchange, options.sessionOverrides);
  const now = toDateTime(nowValue).setZone(appliedExchange.timezone);
  const nextChange = getNextSessionChange(appliedExchange, now, options);

  if (isMarketHoliday(appliedExchange, now)) {
    return { kind: "closed", label: "Closed", reason: "Market holiday", nextChange };
  }

  if (isWeekend(appliedExchange, now)) {
    return { kind: "closed", label: "Closed", reason: "Weekend", nextChange };
  }

  const currentSession = getCurrentSession(appliedExchange, now, options);
  if (!currentSession) {
    return { kind: "closed", label: "Closed", reason: "Outside trading hours", nextChange };
  }

  if (currentSession.type === "lunch") {
    return { kind: "lunch", label: "Lunch break", reason: "Trading paused for lunch", session: currentSession, nextChange };
  }

  if (currentSession.type === "pre") {
    return { kind: "pre", label: "Pre-market", reason: "Extended-hours session", session: currentSession, nextChange };
  }

  if (currentSession.type === "post") {
    return { kind: "post", label: "After-hours", reason: "Extended-hours session", session: currentSession, nextChange };
  }

  return { kind: "open", label: "Open", reason: `${currentSession.name} session`, session: currentSession, nextChange };
}
