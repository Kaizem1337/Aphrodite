import { DateTime } from "luxon";
import { describe, expect, it } from "vitest";
import { exchangeById } from "@/data/exchanges";
import { getCurrentSession, getExchangeStatus, isMarketHoliday, isWeekend } from "@/lib/marketStatus";
import type { MarketOptions } from "@/types/market";

const options: MarketOptions = {
  includeExtendedHours: true,
  regularOnly: false,
  sessionOverrides: {}
};

function dt(iso: string) {
  return DateTime.fromISO(iso);
}

describe("market status", () => {
  it("detects NYSE regular open", () => {
    const status = getExchangeStatus(exchangeById.get("nyse")!, dt("2026-06-04T15:00:00Z"), options);
    expect(status.kind).toBe("open");
    expect(status.session?.id).toBe("regular");
  });

  it("detects NYSE pre-market", () => {
    const status = getExchangeStatus(exchangeById.get("nyse")!, dt("2026-06-04T12:00:00Z"), options);
    expect(status.kind).toBe("pre");
  });

  it("detects NYSE after-hours", () => {
    const status = getExchangeStatus(exchangeById.get("nyse")!, dt("2026-06-04T21:00:00Z"), options);
    expect(status.kind).toBe("post");
  });

  it("detects LSE open during UK summer time", () => {
    const status = getExchangeStatus(exchangeById.get("lse")!, dt("2026-07-01T10:00:00Z"), options);
    expect(status.kind).toBe("open");
  });

  it("detects Frankfurt open during European summer time", () => {
    const status = getExchangeStatus(exchangeById.get("xetra")!, dt("2026-07-01T08:00:00Z"), options);
    expect(status.kind).toBe("open");
  });

  it("handles NYSE/LSE DST mismatch week", () => {
    const lse = getExchangeStatus(exchangeById.get("lse")!, dt("2026-03-20T08:30:00Z"), options);
    const nysePre = getExchangeStatus(exchangeById.get("nyse")!, dt("2026-03-20T12:45:00Z"), options);
    const nyseRegular = getExchangeStatus(exchangeById.get("nyse")!, dt("2026-03-20T14:00:00Z"), options);
    expect(lse.kind).toBe("open");
    expect(nysePre.kind).toBe("pre");
    expect(nyseRegular.kind).toBe("open");
  });

  it("detects HKEX lunch break", () => {
    const status = getExchangeStatus(exchangeById.get("hkex")!, dt("2026-06-04T04:30:00Z"), options);
    expect(status.kind).toBe("lunch");
  });

  it("detects KRX regular session", () => {
    const status = getExchangeStatus(exchangeById.get("krx")!, dt("2026-06-04T03:00:00Z"), options);
    expect(status.kind).toBe("open");
  });

  it("detects TWSE regular session", () => {
    const status = getExchangeStatus(exchangeById.get("twse")!, dt("2026-06-04T03:00:00Z"), options);
    expect(status.kind).toBe("open");
  });

  it("closes markets on weekends", () => {
    const exchange = exchangeById.get("nyse")!;
    const date = dt("2026-06-06T15:00:00Z");
    expect(isWeekend(exchange, date)).toBe(true);
    expect(getExchangeStatus(exchange, date, options).reason).toBe("Weekend");
  });

  it("closes markets on holidays", () => {
    const exchange = exchangeById.get("nyse")!;
    const date = dt("2026-12-25T15:00:00Z");
    expect(isMarketHoliday(exchange, date)).toBe(true);
    expect(getExchangeStatus(exchange, date, options).reason).toBe("Market holiday");
  });

  it("applies user-customised session override", () => {
    const exchange = exchangeById.get("lse")!;
    const status = getExchangeStatus(exchange, dt("2026-06-04T17:30:00Z"), {
      ...options,
      sessionOverrides: {
        lse: [{ id: "regular", open: "08:00", close: "19:00" }]
      }
    });
    expect(getCurrentSession(exchange, dt("2026-06-04T17:30:00Z"), {
      ...options,
      sessionOverrides: {
        lse: [{ id: "regular", open: "08:00", close: "19:00" }]
      }
    })?.id).toBe("regular");
    expect(status.kind).toBe("open");
  });
});
