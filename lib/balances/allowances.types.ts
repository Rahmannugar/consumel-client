export type AllowanceRevision = {
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
  current: AllowanceRevision | null;
  pending: AllowanceRevision | null;
};
export type AllowanceInput = {
  startsAt: string;
  quantity: number;
  rolloverCap: number;
  enabled: boolean;
  version: number;
};

export type AllowancePeriod = {
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
