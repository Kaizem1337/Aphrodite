import { DateTime } from "luxon";
import { formatCountdown } from "@/lib/formatting";

export function CountdownTimer({ targetIso, now, label }: { targetIso?: string; now: DateTime; label?: string }) {
  if (!targetIso) {
    return <span className="text-muted">No upcoming session</span>;
  }

  return (
    <span>
      {label ? `${label} in ` : ""}
      <span className="font-mono text-foreground">{formatCountdown(targetIso, now)}</span>
    </span>
  );
}
