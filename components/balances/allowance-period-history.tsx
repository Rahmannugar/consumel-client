"use client";

import { useProjectWorkspace } from "@/components/projects/project-workspace-client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { allowanceUTCDateTime } from "@/lib/balances/allowances.format";
import { useAllowancePeriods } from "@/lib/balances/useAllowance";

export function AllowancePeriodHistory({
  customerId,
  meterKey,
}: {
  customerId: string;
  meterKey: string;
}) {
  const { project, environment } = useProjectWorkspace();
  const query = useAllowancePeriods(
    { projectId: project.id, environment: environment.name },
    customerId,
    meterKey,
  );
  const periods = query.data?.pages.flatMap((page) => page.periods) ?? [];
  return (
    <div className="mt-5 border-t border-border pt-4">
      <h3 className="text-xs font-medium">Renewal history</h3>
      {query.isPending ? (
        <Skeleton className="mt-3 h-14 w-full" />
      ) : query.isError ? (
        <div className="mt-3">
          <p className="text-xs" role="alert">
            Renewal history could not be loaded.
          </p>
          <Button
            className="mt-2"
            variant="quiet"
            size="compact"
            onClick={() => query.refetch()}
          >
            Try again
          </Button>
        </div>
      ) : periods.length === 0 ? (
        <p className="mt-3 text-xs text-muted-foreground">The first period has not started.</p>
      ) : (
        <div className="mt-3 divide-y divide-border">
          {periods.map((period) => (
            <div
              key={period.periodStart}
              className="flex flex-col justify-between gap-1 py-3 text-xs sm:flex-row sm:gap-4"
            >
              <div>
                <p>
                  {allowanceUTCDateTime(period.periodStart)} –{" "}
                  {allowanceUTCDateTime(period.periodEnd)}
                </p>
                <p className="mt-1 text-muted-foreground">
                  Policy version {period.revision} ·{" "}
                  {period.sourceType === "api_key" ? "API key" : "Dashboard user"}
                </p>
                {period.skippedPeriods > 0 ? (
                  <p className="mt-1 max-w-lg leading-5 text-muted-foreground">
                    {period.skippedPeriods} earlier{" "}
                    {period.skippedPeriods === 1 ? "period was" : "periods were"} not issued.
                    Only eligible carry is included in this period.
                  </p>
                ) : null}
              </div>
              <p className="shrink-0 tabular-nums sm:text-right">
                {period.quantity === 0
                  ? "Recurring grants stopped"
                  : `${period.quantity.toLocaleString()} units issued`}
                <br />
                <span className="mt-1 inline-block text-muted-foreground">
                  {period.carriedQuantity.toLocaleString()} carried over
                </span>
              </p>
            </div>
          ))}
        </div>
      )}
      {query.hasNextPage ? (
        <Button
          className="mt-3"
          variant="quiet"
          size="compact"
          disabled={query.isFetchingNextPage}
          onClick={() => query.fetchNextPage()}
        >
          {query.isFetchingNextPage ? "Loading renewals…" : "Load more renewals"}
        </Button>
      ) : null}
    </div>
  );
}
