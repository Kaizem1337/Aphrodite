"use client";

import { Search } from "lucide-react";

export function MarketSearch({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <label className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#0F0F12] px-3 py-2">
      <Search className="h-4 w-4 text-muted" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search markets"
        className="w-full bg-transparent text-sm text-foreground placeholder:text-muted"
      />
    </label>
  );
}
