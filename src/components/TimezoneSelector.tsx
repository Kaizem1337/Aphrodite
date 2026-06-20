"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { DISPLAY_TIMEZONES } from "@/data/timezones";
import { getBrowserTimezone } from "@/lib/timezone";

type TimezoneSelectorProps = {
  value: string;
  addedTimezones: string[];
  onChange: (timezone: string) => void;
  onAddTimezone: (timezone: string) => void;
};

export function TimezoneSelector({ value, addedTimezones, onChange, onAddTimezone }: TimezoneSelectorProps) {
  const [query, setQuery] = useState("");
  const [browserTimezone] = useState(() => getBrowserTimezone());
  const allTimezones = useMemo(
    () => Array.from(new Set([...DISPLAY_TIMEZONES, browserTimezone, ...addedTimezones])),
    [addedTimezones, browserTimezone]
  );
  const filtered = allTimezones.filter((timezone) => timezone.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="space-y-3">
      <label className="text-xs font-semibold uppercase text-muted">Display timezone</label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-white/10 bg-[#0F0F12] px-3 py-3 text-sm text-foreground"
      >
        {allTimezones.map((timezone) => (
          <option key={timezone} value={timezone}>
            {timezone}
          </option>
        ))}
      </select>
      <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#0F0F12] px-3 py-2">
        <Search className="h-4 w-4 text-muted" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search timezones"
          className="w-full bg-transparent text-sm text-foreground placeholder:text-muted"
        />
      </div>
      {query ? (
        <div className="max-h-36 space-y-1 overflow-auto pr-1 scrollbar-thin">
          {filtered.map((timezone) => (
            <button
              key={timezone}
              type="button"
              onClick={() => {
                onAddTimezone(timezone);
                onChange(timezone);
                setQuery("");
              }}
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-muted transition hover:bg-white/[0.06] hover:text-foreground"
            >
              {timezone}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
