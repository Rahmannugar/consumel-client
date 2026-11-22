import { z } from "zod";
import { APIError, apiRequest } from "@/lib/api/api-client";
import type {
  AllowanceInput,
  AllowancePeriodsResponse,
  RecurringAllowance,
} from "./allowances.types";
import type { BalanceContext } from "./balances.types";

const revision = z.object({
  intervalUnit: z.enum(["minute", "hour", "day", "week", "month", "year"]),
  intervalCount: z.number().int().min(1).max(1000000),
  scheduleAnchorAt: z.string().datetime(),
  version: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
  effectiveAt: z.string().datetime(),
  quantity: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
  rolloverCap: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  enabled: z.boolean(),
  sourceKind: z.enum(["direct", "plan", "override"]),
  planKey: z.string().nullable(),
  planName: z.string().nullable(),
  planVersion: z.number().int().positive().max(Number.MAX_SAFE_INTEGER).nullable(),
});
const allowance = z.object({
  id: z.string().uuid(),
  startsAt: z.string().datetime(),
  nextPeriodAt: z.string().datetime(),
  version: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
  current: revision.nullable(),
  pending: revision.nullable(),
  assignedPlan: z.object({ key: z.string(), name: z.string() }).nullable(),
});
function path(context: BalanceContext, customerId: string, meterKey: string) {
  return `/v1/projects/${encodeURIComponent(context.projectId)}/environments/${context.environment}/customers/${encodeURIComponent(customerId)}/balances/${encodeURIComponent(meterKey)}/allowance`;
}
export function parseAllowance(value: unknown): RecurringAllowance {
  const parsed = allowance.safeParse(value);
  if (!parsed.success)
    throw new APIError(
      502,
      "invalid_response",
      "Consumel returned an invalid allowance response.",
    );
  return parsed.data;
}
export async function loadAllowance(
  context: BalanceContext,
  customerId: string,
  meterKey: string,
): Promise<RecurringAllowance | null> {
  try {
    return parseAllowance(await apiRequest(path(context, customerId, meterKey)));
  } catch (error) {
    if (
      error instanceof APIError &&
      error.status === 404 &&
      error.code === "allowance_not_found"
    )
      return null;
    throw error;
  }
}
export async function saveAllowance(
  context: BalanceContext,
  customerId: string,
  meterKey: string,
  input: AllowanceInput,
): Promise<RecurringAllowance> {
  return parseAllowance(
    await apiRequest(path(context, customerId, meterKey), {
      method: "PUT",
      body: JSON.stringify(input),
    }),
  );
}

const period = z.object({
  sourceKind: z.enum(["direct", "plan", "override"]),
  planKey: z.string().nullable(),
  planName: z.string().nullable(),
  planVersion: z.number().int().positive().max(Number.MAX_SAFE_INTEGER).nullable(),
  periodStart: z.string().datetime(),
  periodEnd: z.string().datetime(),
  revision: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
  quantity: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  carriedQuantity: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  skippedPeriods: z.number().int().nonnegative(),
  sourceType: z.enum(["dashboard_user", "api_key"]),
  sourceId: z.string().uuid(),
});
export async function loadAllowancePeriods(
  context: BalanceContext,
  customerId: string,
  meterKey: string,
  cursor: string | null,
): Promise<AllowancePeriodsResponse> {
  const query = new URLSearchParams({ limit: "25" });
  if (cursor) query.set("cursor", cursor);
  const response = await apiRequest(`${path(context, customerId, meterKey)}/periods?${query}`);
  const parsed = z
    .object({ periods: z.array(period), nextCursor: z.string().nullable() })
    .safeParse(response);
  if (!parsed.success)
    throw new APIError(502, "invalid_response", "Consumel returned invalid allowance history.");
  return parsed.data;
}
