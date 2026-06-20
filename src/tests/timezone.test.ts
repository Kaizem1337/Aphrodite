import { DateTime } from "luxon";
import { describe, expect, it } from "vitest";
import { formatCountdown } from "@/lib/formatting";
import { isValidTimezone } from "@/lib/timezone";

describe("timezone utilities", () => {
  it("validates IANA timezone names", () => {
    expect(isValidTimezone("Europe/London")).toBe(true);
    expect(isValidTimezone("GMT+1")).toBe(false);
  });

  it("formats countdowns", () => {
    const now = DateTime.fromISO("2026-06-04T10:00:00Z");
    expect(formatCountdown("2026-06-04T11:15:20Z", now)).toBe("1h 15m");
    expect(formatCountdown("2026-06-04T10:00:20Z", now)).toBe("20s");
  });
});
