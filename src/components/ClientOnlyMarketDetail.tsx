"use client";

import dynamic from "next/dynamic";

const MarketDetail = dynamic(() => import("@/components/MarketDetail").then((module) => module.MarketDetail), {
  ssr: false,
  loading: () => (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-4 py-10 text-center text-foreground">
      <p className="text-muted">Loading live market status</p>
    </main>
  )
});

export function ClientOnlyMarketDetail({ marketId }: { marketId: string }) {
  return <MarketDetail marketId={marketId} />;
}
