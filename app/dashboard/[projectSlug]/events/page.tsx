import type { Metadata } from "next";
import { EventsClient } from "@/components/events/events-client";

export const metadata: Metadata = {
  title: "Events",
  robots: { index: false, follow: false },
};

export default function EventsPage() {
  return <EventsClient />;
}
