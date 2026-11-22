import type { AllowanceIntervalUnit } from "@/lib/balances/allowances.types";

export type AllowancePlan = {
  id: string;
  key: string;
  name: string;
  meterKey: string;
  intervalUnit: AllowanceIntervalUnit;
  intervalCount: number;
  quantity: number;
  rolloverCap: number;
  enabled: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
};
export type AllowancePlansResponse = {
  plans: AllowancePlan[];
  nextCursor: string | null;
};
export type CreateAllowancePlanInput = Pick<
  AllowancePlan,
  | "key"
  | "name"
  | "meterKey"
  | "intervalUnit"
  | "intervalCount"
  | "quantity"
  | "rolloverCap"
  | "enabled"
>;
export type UpdateAllowancePlanInput = Pick<
  AllowancePlan,
  "name" | "quantity" | "rolloverCap" | "enabled" | "version"
>;
export type AllowanceSourceInput = {
  planKey: string | null;
  startsAt: string;
  version: number;
};
