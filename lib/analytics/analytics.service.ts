import { APIError, apiRequest } from "@/lib/api/api-client";
import { eventRange } from "@/lib/events/events.service";
import type {
  AnalyticsContext,
  AnalyticsFilter,
  AnalyticsInterval,
  UsageAnalytics,
  UsageAnalyticsBucket,
} from "./analytics.types";

export async function loadUsageAnalytics(
  context: AnalyticsContext,
  filter: AnalyticsFilter,
): Promise<UsageAnalytics> {
  const range = eventRange({ status: "", ...filter });
  const interval = analyticsInterval(range.from, range.to);
  const query = new URLSearchParams({ ...range, interval });
  if (filter.customerId) query.set("customerId", filter.customerId);
  if (filter.meterKey) query.set("meterKey", filter.meterKey);
  const response = await apiRequest(
    `/v1/projects/${encodeURIComponent(context.projectId)}/environments/${context.environment}/analytics?${query.toString()}`,
  );
  if (!isUsageAnalytics(response)) {
    throw new APIError(
      502,
      "invalid_response",
      "Consumel returned an invalid analytics response.",
    );
  }
  return response;
}

function analyticsInterval(from: string, to: string): AnalyticsInterval {
  const range = new Date(to).getTime() - new Date(from).getTime();
  return range <= 48 * 60 * 60 * 1000 ? "hour" : "day";
}

function isUsageAnalytics(value: unknown): value is UsageAnalytics {
  return (
    isRecord(value) &&
    typeof value.from === "string" &&
    typeof value.to === "string" &&
    ["hour", "day"].includes(String(value.interval)) &&
    isAnalyticsValues(value.summary) &&
    Array.isArray(value.buckets) &&
    value.buckets.every(
      (bucket) =>
        isRecord(bucket) && typeof bucket.start === "string" && isAnalyticsValues(bucket),
    )
  );
}

function isAnalyticsValues(value: unknown): value is Omit<UsageAnalyticsBucket, "start"> {
  return (
    isRecord(value) &&
    typeof value.acceptedOperations === "number" &&
    typeof value.deniedOperations === "number" &&
    typeof value.acceptedQuantity === "number" &&
    typeof value.deniedQuantity === "number" &&
    typeof value.billableOperations === "number"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
