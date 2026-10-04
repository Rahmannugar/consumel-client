"use client";

import { useState } from "react";
import { UsageAnalyticsPanel } from "@/components/analytics/usage-analytics-panel";
import { UsageHistory } from "@/components/events/usage-history";
import type { EventsFilter } from "@/lib/events/events.types";

type UsageScope =
  | { customerId: string; meterKey?: never }
  | { customerId?: never; meterKey: string };

export function UsageActivity(scope: UsageScope) {
  const [filter, setFilter] = useState<EventsFilter>({
    status: "",
    period: "30d",
    ...scope,
  });
  return (
    <>
      <UsageAnalyticsPanel
        title="Usage"
        description={`Processed and blocked quantity for this ${scope.customerId ? "customer" : "meter"}.`}
        filter={filter}
        onFilterChange={setFilter}
        scope={scope}
      />

      <UsageHistory scope={scope} filter={filter} onFilterChange={setFilter} />
    </>
  );
}
