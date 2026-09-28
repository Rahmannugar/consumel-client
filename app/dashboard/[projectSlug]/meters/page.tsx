import type { Metadata } from "next";
import { MetersClient } from "@/components/meters/meters-client";

export const metadata: Metadata = {
  title: "Meters",
  robots: { index: false, follow: false },
};

export default function MetersPage() {
  return <MetersClient />;
}
