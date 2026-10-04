import { APIError, apiRequest } from "@/lib/api/api-client";
import type {
  EventsContext,
  EventsFilter,
  OperationsResponse,
  UsageOperation,
} from "./events.types";

export async function loadOperations(
  context: EventsContext,
  cursor: string | null,
  filter: EventsFilter,
  limit = 50,
): Promise<OperationsResponse> {
  const range = eventRange(filter);
  const query = new URLSearchParams({
    limit: limit.toString(),
    from: range.from,
    to: range.to,
  });
  if (cursor) query.set("cursor", cursor);
  if (filter.status) query.set("status", filter.status);
  if (filter.customerId) query.set("customerId", filter.customerId);
  if (filter.meterKey) query.set("meterKey", filter.meterKey);
  const response = await apiRequest(
    `/v1/projects/${encodeURIComponent(context.projectId)}/environments/${context.environment}/events?${query.toString()}`,
  );
  if (!isOperationsResponse(response)) {
    throw new APIError(502, "invalid_response", "Consumel returned an invalid event response.");
  }
  return response;
}

const periodDays: Record<Exclude<EventsFilter["period"], "custom">, number> = {
  "7d": 7,
  "30d": 30,
  "60d": 60,
  "90d": 90,
  "1y": 365,
};

export function eventRange(filter: EventsFilter) {
  if (filter.period === "custom") {
    if (filter.from && filter.to) return { from: filter.from, to: filter.to };
    const to = new Date();
    return {
      from: new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      to: to.toISOString(),
    };
  }
  const to = new Date();
  const from = new Date(to.getTime() - periodDays[filter.period] * 24 * 60 * 60 * 1000);
  return { from: from.toISOString(), to: to.toISOString() };
}

function isOperationsResponse(value: unknown): value is OperationsResponse {
  return (
    isRecord(value) &&
    Array.isArray(value.operations) &&
    value.operations.every(isUsageOperation) &&
    (value.nextCursor === null || typeof value.nextCursor === "string")
  );
}

export function isUsageOperation(value: unknown): value is UsageOperation {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.customerId === "string" &&
    typeof value.meterKey === "string" &&
    typeof value.quantity === "number" &&
    ["prepaid", "postpaid", "hybrid"].includes(String(value.meterType)) &&
    ["accepted", "denied"].includes(String(value.status)) &&
    (value.denialReason === null || typeof value.denialReason === "string") &&
    typeof value.balanceDebited === "number" &&
    (value.remainingBalance === null || typeof value.remainingBalance === "number") &&
    typeof value.billable === "boolean" &&
    typeof value.replayCount === "number" &&
    (value.lastReplayedAt === null || typeof value.lastReplayedAt === "string") &&
    typeof value.createdAt === "string"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
