import type { EventsContext, EventsFilter } from "@/lib/events/events.types";

export type AnalyticsContext = EventsContext;
export type AnalyticsFilter = Pick<
  EventsFilter,
  "period" | "customerId" | "meterKey" | "from" | "to"
>;

export type AnalyticsInterval = "hour" | "day";

export type UsageAnalyticsBucket = {
  start: string;
  acceptedOperations: number;
  deniedOperations: number;
  acceptedQuantity: number;
  deniedQuantity: number;
  billableOperations: number;
};

export type UsageAnalytics = {
  from: string;
  to: string;
  interval: AnalyticsInterval;
  summary: Omit<UsageAnalyticsBucket, "start">;
  buckets: UsageAnalyticsBucket[];
};
