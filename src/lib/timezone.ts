import { DateTime } from "luxon";

export function getBrowserTimezone(fallback = "Europe/London") {
  if (typeof Intl === "undefined") {
    return fallback;
  }

  return Intl.DateTimeFormat().resolvedOptions().timeZone || fallback;
}

export function isValidTimezone(timezone: string) {
  return DateTime.now().setZone(timezone).isValid;
}

export function toDateTime(value: DateTime | Date | string, zone?: string) {
  if (DateTime.isDateTime(value)) {
    return zone ? value.setZone(zone) : value;
  }

  if (value instanceof Date) {
    return DateTime.fromJSDate(value, { zone });
  }

  return DateTime.fromISO(value, { zone });
}

export function formatTime(value: DateTime | string, timezone: string) {
  const date = typeof value === "string" ? DateTime.fromISO(value) : value;
  return date.setZone(timezone).toFormat("HH:mm");
}

export function formatDateTime(value: DateTime | string, timezone: string) {
  const date = typeof value === "string" ? DateTime.fromISO(value) : value;
  return date.setZone(timezone).toFormat("ccc dd LLL, HH:mm");
}

export function formatZoneLabel(timezone: string) {
  return timezone.replace("_", " ");
}
