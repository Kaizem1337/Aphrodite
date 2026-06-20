"use client";

import { Check, ClipboardCopy } from "lucide-react";
import { DateTime } from "luxon";
import { useState } from "react";
import { buildScheduleText } from "@/lib/timeline";
import type { Exchange, MarketOptions } from "@/types/market";

export function CopyScheduleButton({
  exchanges,
  now,
  displayTimezone,
  options
}: {
  exchanges: Exchange[];
  now: DateTime;
  displayTimezone: string;
  options: MarketOptions;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const text = buildScheduleText(exchanges, now, displayTimezone, options);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-white/[0.08] active:scale-[0.98]"
    >
      {copied ? <Check className="h-4 w-4 text-emerald-200" /> : <ClipboardCopy className="h-4 w-4" />}
      {copied ? "Copied" : "Copy schedule"}
    </button>
  );
}
