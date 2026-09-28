import type { Metadata } from "next";
import { CustomerDetailClient } from "@/components/customers/customer-detail-client";

export const metadata: Metadata = {
  title: "Customer details",
  robots: { index: false, follow: false },
};

export default async function CustomerPage({
  params,
}: {
  params: Promise<{ customerId: string }>;
}) {
  const { customerId } = await params;
  return <CustomerDetailClient customerId={customerId} />;
}
