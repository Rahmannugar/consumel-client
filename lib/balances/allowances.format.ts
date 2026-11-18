import type { AllowanceRevision } from "./allowances.types";

export function allowanceIntervalLabel(
  schedule: Pick<AllowanceRevision, "intervalUnit" | "intervalCount">,
) {
  return `${schedule.intervalCount.toLocaleString()} ${schedule.intervalUnit}${schedule.intervalCount === 1 ? "" : "s"}`;
}
export function allowanceUTCDateTime(value: string) {
  return `${new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" })} UTC`;
}
