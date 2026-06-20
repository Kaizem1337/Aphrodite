import { ClientOnlyMarketDetail } from "@/components/ClientOnlyMarketDetail";

export default async function MarketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ClientOnlyMarketDetail marketId={id} />;
}
