import type { Metadata } from "next";
import { AllowancePlansClient } from "@/components/allowance-plans/allowance-plans-client";

export const metadata: Metadata = {
  title: "Allowance plans",
  robots: { index: false, follow: false },
};
export default function AllowancePlansPage() {
  return <AllowancePlansClient />;
}
