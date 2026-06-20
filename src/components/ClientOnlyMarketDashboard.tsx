"use client";

import dynamic from "next/dynamic";

const MarketDashboard = dynamic(() => import("@/components/MarketDashboard").then((module) => module.MarketDashboard), {
  ssr: false,
  loading: () => (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[70vh] max-w-7xl flex-col items-center justify-center text-center">
        <div className="rounded-full border border-[#5E6AD2]/30 bg-[#5E6AD2]/10 px-4 py-2 text-xs font-semibold uppercase text-[#C9CEFF] shadow-[0_0_36px_rgba(94,106,210,0.18)]">
          Market Clock
        </div>
        <h1 className="mt-6 bg-gradient-to-b from-white via-white/95 to-white/65 bg-clip-text text-4xl font-semibold tracking-tight text-transparent sm:text-6xl">
          Is the stock market open?
        </h1>
        <p className="mt-5 text-muted">Loading live market status</p>
      </div>
    </main>
  )
});

export function ClientOnlyMarketDashboard() {
  return <MarketDashboard />;
}
