import { DEFAULT_MARKET_IDS, DEFAULT_TIMEZONE, DISPLAY_TIMEZONES } from "@/data/timezones";
import type { Preferences } from "@/types/market";
import { isValidTimezone } from "@/lib/timezone";

export const STORAGE_KEY = "market-clock-preferences";

export const defaultPreferences: Preferences = {
  selectedMarketIds: DEFAULT_MARKET_IDS,
  favoriteMarketIds: DEFAULT_MARKET_IDS,
  displayTimezone: DEFAULT_TIMEZONE,
  addedTimezones: [],
  includeExtendedHours: true,
  regularOnly: false,
  compactMode: false,
  sessionOverrides: {}
};

function stringArray(value: unknown, fallback: string[]) {
  return Array.isArray(value) && value.every((entry) => typeof entry === "string") ? value : fallback;
}

function booleanValue(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

export function parsePreferences(raw: string | null): Preferences {
  if (!raw) {
    return defaultPreferences;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<Preferences>;
    const displayTimezone =
      typeof parsed.displayTimezone === "string" && isValidTimezone(parsed.displayTimezone)
        ? parsed.displayTimezone
        : defaultPreferences.displayTimezone;
    const addedTimezones = stringArray(parsed.addedTimezones, []).filter(
      (timezone) => isValidTimezone(timezone) && !DISPLAY_TIMEZONES.includes(timezone as never)
    );

    return {
      selectedMarketIds: stringArray(parsed.selectedMarketIds, defaultPreferences.selectedMarketIds),
      favoriteMarketIds: stringArray(parsed.favoriteMarketIds, defaultPreferences.favoriteMarketIds),
      displayTimezone,
      addedTimezones,
      includeExtendedHours: booleanValue(parsed.includeExtendedHours, defaultPreferences.includeExtendedHours),
      regularOnly: booleanValue(parsed.regularOnly, defaultPreferences.regularOnly),
      compactMode: booleanValue(parsed.compactMode, defaultPreferences.compactMode),
      sessionOverrides:
        parsed.sessionOverrides && typeof parsed.sessionOverrides === "object" && !Array.isArray(parsed.sessionOverrides)
          ? parsed.sessionOverrides
          : {}
    };
  } catch {
    return defaultPreferences;
  }
}

export function readPreferences() {
  if (typeof window === "undefined") {
    return defaultPreferences;
  }
  return parsePreferences(window.localStorage.getItem(STORAGE_KEY));
}

export function savePreferences(preferences: Preferences) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
}
