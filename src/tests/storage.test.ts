import { describe, expect, it } from "vitest";
import { DEFAULT_MARKET_IDS } from "@/data/timezones";
import { defaultPreferences, parsePreferences } from "@/lib/storage";

describe("preference parsing", () => {
  it("falls back when storage is corrupted", () => {
    expect(parsePreferences("{bad json")).toEqual(defaultPreferences);
  });

  it("parses valid stored preferences", () => {
    const parsed = parsePreferences(
      JSON.stringify({
        selectedMarketIds: ["nyse"],
        favoriteMarketIds: ["lse"],
        displayTimezone: "America/New_York",
        addedTimezones: ["Asia/Tokyo"],
        includeExtendedHours: false,
        regularOnly: true,
        compactMode: true,
        sessionOverrides: {}
      })
    );
    expect(parsed.selectedMarketIds).toEqual(["nyse"]);
    expect(parsed.displayTimezone).toBe("America/New_York");
    expect(parsed.includeExtendedHours).toBe(false);
  });

  it("keeps defaults for invalid shapes", () => {
    const parsed = parsePreferences(JSON.stringify({ selectedMarketIds: "nyse", displayTimezone: "Nope/Zone" }));
    expect(parsed.selectedMarketIds).toEqual(DEFAULT_MARKET_IDS);
    expect(parsed.displayTimezone).toBe("Europe/London");
  });
});
