import { DateTime, Duration } from "luxon";

export function formatCountdown(targetIso: string, now: DateTime) {
  const target = DateTime.fromISO(targetIso);
  const diff = target.diff(now, ["days", "hours", "minutes", "seconds"]).shiftTo("days", "hours", "minutes", "seconds");

  if (diff.toMillis() <= 0) {
    return "now";
  }

  const duration = Duration.fromObject({
    days: Math.floor(diff.days),
    hours: Math.floor(diff.hours),
    minutes: Math.floor(diff.minutes),
    seconds: Math.floor(diff.seconds)
  });

  const parts = duration.toObject();
  if ((parts.days ?? 0) >= 1) {
    return `${parts.days}d ${parts.hours}h`;
  }
  if ((parts.hours ?? 0) >= 1) {
    return `${parts.hours}h ${parts.minutes}m`;
  }
  if ((parts.minutes ?? 0) >= 1) {
    return `${parts.minutes}m ${parts.seconds}s`;
  }
  return `${parts.seconds ?? 0}s`;
}

export function titleCase(value: string) {
  return value
    .split(/[\s-]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function flagEmoji(countryCode: string) {
  return countryCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}
