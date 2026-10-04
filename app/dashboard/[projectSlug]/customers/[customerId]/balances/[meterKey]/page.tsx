import type { Metadata } from "next";
import { BalanceDetailClient } from "@/components/balances/balance-detail-client";

export const metadata: Metadata = {
  title: "Balance details",
  robots: { index: false, follow: false },
};

export default async function BalancePage({
  params,
}: {
  params: Promise<{ customerId: string; meterKey: string }>;
}) {
  const { customerId, meterKey } = await params;
  return <BalanceDetailClient customerId={customerId} meterKey={meterKey} />;
}
