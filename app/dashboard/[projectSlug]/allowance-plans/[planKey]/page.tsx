import type { Metadata } from "next";
import { AllowancePlanDetailClient } from "@/components/allowance-plans/allowance-plan-detail-client";

export const metadata: Metadata = {
  title: "Allowance plan details",
  robots: { index: false, follow: false },
};
export default async function AllowancePlanPage({
  params,
}: {
  params: Promise<{ planKey: string }>;
}) {
  const { planKey } = await params;
  return <AllowancePlanDetailClient planKey={planKey} />;
}
