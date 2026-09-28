import { APIError, apiRequest } from "@/lib/api/api-client";
import type {
  CreateMeterInput,
  Meter,
  MeterContext,
  MetersResponse,
  MeterType,
} from "./meters.types";

export async function loadMeters(
  context: MeterContext,
  cursor: string | null,
): Promise<MetersResponse> {
  const query = new URLSearchParams({ limit: "25" });
  if (cursor) query.set("cursor", cursor);
  const response = await apiRequest(`${metersPath(context)}?${query.toString()}`);
  if (!isMetersResponse(response)) throw invalidMeterResponse();
  return response;
}

export async function loadMeter(context: MeterContext, meterKey: string): Promise<Meter> {
  const response = await apiRequest(`${metersPath(context)}/${encodeURIComponent(meterKey)}`);
  if (!isMeter(response)) throw invalidMeterResponse();
  return response;
}

export async function createMeter(
  context: MeterContext,
  input: CreateMeterInput,
): Promise<Meter> {
  const response = await apiRequest(metersPath(context), {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!isMeter(response)) throw invalidMeterResponse();
  return response;
}

export function meterErrorMessage(error: unknown) {
  if (error instanceof APIError) return error.message;
  return "Consumel could not complete the meter request. Try again.";
}

function metersPath(context: MeterContext) {
  return `/v1/projects/${encodeURIComponent(context.projectId)}/environments/${context.environment}/meters`;
}

function invalidMeterResponse() {
  return new APIError(502, "invalid_response", "Consumel returned an invalid meter response.");
}

function isMetersResponse(value: unknown): value is MetersResponse {
  return (
    isRecord(value) &&
    Array.isArray(value.meters) &&
    value.meters.every(isMeter) &&
    (value.nextCursor === null || typeof value.nextCursor === "string")
  );
}

function isMeter(value: unknown): value is Meter {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.meterKey === "string" &&
    typeof value.name === "string" &&
    (value.description === null || typeof value.description === "string") &&
    isMeterType(value.type) &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string"
  );
}

function isMeterType(value: unknown): value is MeterType {
  return value === "prepaid" || value === "postpaid" || value === "hybrid";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
