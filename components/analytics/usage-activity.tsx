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
        title={scope.customerId ? "Request outcomes" : "Usage"}
        description={
          scope.customerId
            ? "Allowed and blocked usage requests for this customer."
            : "Allowed usage volume and request outcomes for this meter."
        }
        filter={filter}
        onFilterChange={setFilter}
        scope={scope}
      />

      <UsageHistory scope={scope} filter={filter} onFilterChange={setFilter} />
    </>
  );
}
