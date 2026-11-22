import { z } from "zod";
import { APIError, apiRequest } from "@/lib/api/api-client";
import { parseAllowance } from "@/lib/balances/allowances.service";
import type { RecurringAllowance } from "@/lib/balances/allowances.types";
import type { BalanceContext } from "@/lib/balances/balances.types";
import type {
  AllowancePlan,
  AllowancePlansResponse,
  AllowanceSourceInput,
  CreateAllowancePlanInput,
  UpdateAllowancePlanInput,
} from "./allowance-plans.types";

const integer = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
const planSchema = z.object({
  id: z.string().uuid(),
  key: z.string().min(1),
  name: z.string().min(1),
  meterKey: z.string().min(1),
  intervalUnit: z.enum(["minute", "hour", "day", "week", "month", "year"]),
  intervalCount: integer.min(1).max(1000000),
  quantity: integer.min(1),
  rolloverCap: integer,
  enabled: z.boolean(),
  version: integer.min(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export function allowancePlansPath(context: BalanceContext) {
  return `/v1/projects/${encodeURIComponent(context.projectId)}/environments/${context.environment}/allowance-plans`;
}
function parsePlan(value: unknown): AllowancePlan {
  const result = planSchema.safeParse(value);
  if (!result.success)
    throw new APIError(502, "invalid_response", "Consumel returned an invalid allowance plan.");
  return result.data;
}
export async function loadAllowancePlans(
  context: BalanceContext,
  cursor: string | null,
  meterKey = "",
): Promise<AllowancePlansResponse> {
  const params = new URLSearchParams({ limit: "25" });
  if (cursor) params.set("cursor", cursor);
  if (meterKey) params.set("meterKey", meterKey);
  const response = await apiRequest(`${allowancePlansPath(context)}?${params}`);
  const result = z
    .object({ plans: z.array(planSchema), nextCursor: z.string().nullable() })
    .safeParse(response);
  if (!result.success)
    throw new APIError(
      502,
      "invalid_response",
      "Consumel returned an invalid allowance plan list.",
    );
  return result.data;
}
export async function loadAllowancePlan(context: BalanceContext, key: string) {
  return parsePlan(
    await apiRequest(`${allowancePlansPath(context)}/${encodeURIComponent(key)}`),
  );
}
export async function createAllowancePlan(
  context: BalanceContext,
  input: CreateAllowancePlanInput,
) {
  return parsePlan(
    await apiRequest(allowancePlansPath(context), {
      method: "POST",
      body: JSON.stringify(input),
    }),
  );
}
export async function updateAllowancePlan(
  context: BalanceContext,
  key: string,
  input: UpdateAllowancePlanInput,
) {
  return parsePlan(
    await apiRequest(`${allowancePlansPath(context)}/${encodeURIComponent(key)}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),
  );
}
export async function archiveAllowancePlan(context: BalanceContext, plan: AllowancePlan) {
  await apiRequest(
    `${allowancePlansPath(context)}/${encodeURIComponent(plan.key)}?version=${plan.version}`,
    { method: "DELETE" },
  );
}
export async function saveAllowanceSource(
  context: BalanceContext,
  customerId: string,
  meterKey: string,
  input: AllowanceSourceInput,
): Promise<RecurringAllowance> {
  return parseAllowance(
    await apiRequest(
      `/v1/projects/${encodeURIComponent(context.projectId)}/environments/${context.environment}/customers/${encodeURIComponent(customerId)}/balances/${encodeURIComponent(meterKey)}/allowance/source`,
      { method: "PUT", body: JSON.stringify(input) },
    ),
  );
}
export function allowancePlanErrorMessage(error: unknown) {
  return error instanceof APIError
    ? error.message
    : "Consumel could not complete the allowance plan request. Try again.";
}
