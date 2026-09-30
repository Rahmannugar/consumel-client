import { APIError, apiRequest } from "@/lib/api/api-client";
import type {
  AddBalanceInput,
  Balance,
  BalanceContext,
  BalancesResponse,
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
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
