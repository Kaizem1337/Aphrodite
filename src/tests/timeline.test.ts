import { DateTime } from "luxon";
import { describe, expect, it } from "vitest";
import { exchangeById } from "@/data/exchanges";
import { buildTodayTimeline, convertSessionToDisplayTimezone } from "@/lib/timeline";
import type { MarketOptions } from "@/types/market";

const options: MarketOptions = {
  includeExtendedHours: true,
  regularOnly: false,
  sessionOverrides: {}
};

describe("timeline", () => {
  it("converts NYSE regular session to London summer time", () => {
    const nyse = exchangeById.get("nyse")!;
    const converted = convertSessionToDisplayTimezone(
      nyse.sessions.find((session) => session.id === "regular")!,
      nyse.timezone,
      "Europe/London",
      DateTime.fromISO("2026-06-04T00:00:00", { zone: "Europe/London" })
    );
    expect(converted.start.toFormat("HH:mm")).toBe("14:30");
    expect(converted.end.toFormat("HH:mm")).toBe("21:00");
  });

  it("generates HKEX lunch and regular timeline blocks", () => {
    const blocks = buildTodayTimeline(
      exchangeById.get("hkex")!,
      DateTime.fromISO("2026-06-04T10:00:00", { zone: "Europe/London" }),
      "Europe/London",
      options
    );
    expect(blocks.map((block) => block.type)).toContain("lunch");
    expect(blocks.filter((block) => block.type === "regular")).toHaveLength(2);
  });

  it("clips after-hours sessions that pass local display midnight", () => {
    const blocks = buildTodayTimeline(
      exchangeById.get("nyse")!,
      DateTime.fromISO("2026-06-04T10:00:00", { zone: "Europe/London" }),
      "Europe/London",
      options
    );
    const afterHours = blocks.find((block) => block.type === "post" && block.startPercent > 80);
    expect(afterHours?.startPercent).toBeGreaterThan(80);
    expect(afterHours?.widthPercent).toBeGreaterThan(0);
  });
});
