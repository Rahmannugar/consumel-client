import { APIError, apiRequest } from "@/lib/api/api-client";
import type {
  AddBalanceInput,
  Balance,
  BalanceActivityResponse,
  BalanceContext,
  BalancesResponse,
  EntitlementGrantsResponse,
  SetBalanceInput,
} from "./balances.types";

export async function loadBalances(
  context: BalanceContext,
  customerId: string,
): Promise<BalancesResponse> {
  const response = await apiRequest(`${customerPath(context, customerId)}/balances`);
  if (!isBalancesResponse(response)) throw invalidBalanceResponse();
  return response;
}

export async function loadBalance(
  context: BalanceContext,
  customerId: string,
  meterKey: string,
): Promise<Balance> {
  const response = await apiRequest(balancePath(context, customerId, meterKey));
  if (!isBalance(response)) throw invalidBalanceResponse();
  return response;
}

export async function loadEntitlementGrants(
  context: BalanceContext,
  customerId: string,
  meterKey: string,
  cursor: string | null,
): Promise<EntitlementGrantsResponse> {
  const query = new URLSearchParams({ limit: "25" });
  if (cursor) query.set("cursor", cursor);
  const response = await apiRequest(
    `${balancePath(context, customerId, meterKey)}/grants?${query}`,
  );
  if (!isEntitlementGrantsResponse(response)) throw invalidBalanceResponse();
  return response;
}

export async function loadBalanceActivity(
  context: BalanceContext,
  customerId: string,
  meterKey: string,
  cursor: string | null,
): Promise<BalanceActivityResponse> {
  const query = new URLSearchParams({ limit: "25" });
  if (cursor) query.set("cursor", cursor);
  const response = await apiRequest(
    `${balancePath(context, customerId, meterKey)}/history?${query}`,
  );
  if (!isBalanceActivityResponse(response)) throw invalidBalanceResponse();
  return response;
}

export async function addBalance(
  context: BalanceContext,
  input: AddBalanceInput,
  idempotencyKey: string,
): Promise<Balance> {
  const response = await apiRequest(balancesPath(context), {
    method: "POST",
    headers: { "Idempotency-Key": idempotencyKey },
    body: JSON.stringify(input),
  });
  if (!isBalance(response)) throw invalidBalanceResponse();
  return response;
}

export async function setBalance(
  context: BalanceContext,
  customerId: string,
  meterKey: string,
  input: SetBalanceInput,
): Promise<Balance> {
  const response = await apiRequest(
    `${balancesPath(context)}/${encodeURIComponent(customerId)}/${encodeURIComponent(meterKey)}`,
    { method: "PUT", body: JSON.stringify(input) },
  );
  if (!isBalance(response)) throw invalidBalanceResponse();
  return response;
}

export function balanceErrorMessage(error: unknown) {
  if (error instanceof APIError) return error.message;
  return "Consumel could not complete the balance request. Try again.";
}

function balancesPath(context: BalanceContext) {
  return `/v1/projects/${encodeURIComponent(context.projectId)}/environments/${context.environment}/balances`;
}

function customerPath(context: BalanceContext, customerId: string) {
  return `/v1/projects/${encodeURIComponent(context.projectId)}/environments/${context.environment}/customers/${encodeURIComponent(customerId)}`;
}

function balancePath(context: BalanceContext, customerId: string, meterKey: string) {
  return `${customerPath(context, customerId)}/balances/${encodeURIComponent(meterKey)}`;
}

function invalidBalanceResponse() {
  return new APIError(
    502,
    "invalid_response",
    "Consumel returned an invalid balance response.",
  );
}

function isBalancesResponse(value: unknown): value is BalancesResponse {
  return isRecord(value) && Array.isArray(value.balances) && value.balances.every(isBalance);
}

function isBalance(value: unknown): value is Balance {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.customerId === "string" &&
    typeof value.meterKey === "string" &&
    typeof value.quantity === "number" &&
    Number.isSafeInteger(value.quantity) &&
    value.quantity >= 0 &&
    (value.nextExpiresAt === null || typeof value.nextExpiresAt === "string") &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string"
  );
}

function isEntitlementGrantsResponse(value: unknown): value is EntitlementGrantsResponse {
  return (
    isRecord(value) &&
    Array.isArray(value.grants) &&
    value.grants.every(
      (grant) =>
        isRecord(grant) &&
        typeof grant.id === "string" &&
        typeof grant.grantedQuantity === "number" &&
        Number.isSafeInteger(grant.grantedQuantity) &&
        grant.grantedQuantity > 0 &&
        typeof grant.remainingQuantity === "number" &&
        Number.isSafeInteger(grant.remainingQuantity) &&
        grant.remainingQuantity >= 0 &&
        (grant.status === "active" ||
          grant.status === "exhausted" ||
          grant.status === "expired") &&
        (grant.expiresAt === null || typeof grant.expiresAt === "string") &&
        typeof grant.createdAt === "string",
    ) &&
    (value.nextCursor === null || typeof value.nextCursor === "string")
  );
}

function isBalanceActivityResponse(value: unknown): value is BalanceActivityResponse {
  return (
    isRecord(value) &&
    Array.isArray(value.activity) &&
    value.activity.every(
      (item) =>
        isRecord(item) &&
        typeof item.id === "string" &&
        (item.kind === "add" ||
          item.kind === "set" ||
          item.kind === "usage" ||
          item.kind === "expiration") &&
        typeof item.quantityChange === "number" &&
        Number.isSafeInteger(item.quantityChange) &&
        (item.resultingQuantity === null ||
          (typeof item.resultingQuantity === "number" &&
            Number.isSafeInteger(item.resultingQuantity))) &&
        (item.expiresAt === null || typeof item.expiresAt === "string") &&
        typeof item.sourceType === "string" &&
        typeof item.occurredAt === "string",
    ) &&
    (value.nextCursor === null || typeof value.nextCursor === "string")
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
