import type { Metadata } from "next";
import { MeterDetailClient } from "@/components/meters/meter-detail-client";

export const metadata: Metadata = {
  title: "Meter details",
  robots: { index: false, follow: false },
};

export default async function MeterPage({ params }: { params: Promise<{ meterKey: string }> }) {
  const { meterKey } = await params;
  return <MeterDetailClient meterKey={meterKey} />;
}
