export const allowanceIntervalUnits = [
  "minute",
  "hour",
  "day",
  "week",
  "month",
  "year",
] as const;
export type AllowanceIntervalUnit = (typeof allowanceIntervalUnits)[number];
export type AllowanceRevision = {
  sourceKind: "direct" | "plan" | "override";
  planKey: string | null;
  planName: string | null;
  planVersion: number | null;
  intervalUnit: AllowanceIntervalUnit;
  intervalCount: number;
  scheduleAnchorAt: string;
  version: number;
  effectiveAt: string;
  quantity: number;
  rolloverCap: number;
  enabled: boolean;
};
export type RecurringAllowance = {
  id: string;
  startsAt: string;
  nextPeriodAt: string;
  version: number;
  assignedPlan: { key: string; name: string } | null;
  current: AllowanceRevision | null;
  pending: AllowanceRevision | null;
};
export type AllowanceInput = {
  intervalUnit: AllowanceIntervalUnit;
  intervalCount: number;
  startsAt: string;
  quantity: number;
  rolloverCap: number;
  enabled: boolean;
  version: number;
};

export type AllowancePeriod = {
  sourceKind: "direct" | "plan" | "override";
  planKey: string | null;
  planName: string | null;
  planVersion: number | null;
  periodStart: string;
  periodEnd: string;
  revision: number;
  quantity: number;
  carriedQuantity: number;
  skippedPeriods: number;
  sourceType: "dashboard_user" | "api_key";
  sourceId: string;
};
export type AllowancePeriodsResponse = {
  periods: AllowancePeriod[];
  nextCursor: string | null;
};
