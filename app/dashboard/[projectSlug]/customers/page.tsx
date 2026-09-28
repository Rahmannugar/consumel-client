import type { Metadata } from "next";
import { CustomersClient } from "@/components/customers/customers-client";

export const metadata: Metadata = {
  title: "Customers",
  robots: { index: false, follow: false },
};

export default function CustomersPage() {
  return <CustomersClient />;
}
