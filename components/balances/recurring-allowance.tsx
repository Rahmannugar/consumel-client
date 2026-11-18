"use client";

import { useState } from "react";
import { useProjectWorkspace } from "@/components/projects/project-workspace-client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { allowanceIntervalLabel, allowanceUTCDateTime } from "@/lib/balances/allowances.format";
import { useAllowance } from "@/lib/balances/useAllowance";
import { AllowanceFormDialog } from "./allowance-form-dialog";
import { AllowancePeriodHistory } from "./allowance-period-history";

export function RecurringAllowanceSection({
  customerId,
  meterKey,
}: {
  customerId: string;
  meterKey: string;
}) {
  const { project, environment } = useProjectWorkspace();
  const query = useAllowance(
    { projectId: project.id, environment: environment.name },
    customerId,
    meterKey,
  );
  const [editing, setEditing] = useState(false);
  const policy = query.data;
  return (
    <section className="mt-7 rounded-xl border border-border bg-card px-5 py-5 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">Recurring allowance</h2>
        {query.isSuccess ? (
          <Button size="compact" variant="secondary" onClick={() => setEditing(true)}>
            {policy ? "Edit allowance" : "Set up allowance"}
          </Button>
        ) : null}
      </div>
      {query.isPending ? (
        <Skeleton className="mt-4 h-16 w-full" />
      ) : query.isError ? (
        <div className="mt-4">
          <p className="text-sm" role="alert">
            The allowance could not be loaded.
          </p>
          <Button
            className="mt-3"
            size="compact"
            variant="secondary"
            onClick={() => query.refetch()}
          >
            Try again
          </Button>
        </div>
      ) : policy ? (
        <div className="mt-4 space-y-3 text-sm">
          {policy.current ? (
            <p>
              {policy.current.enabled
                ? `${policy.current.quantity.toLocaleString()} units every ${allowanceIntervalLabel(policy.current)}`
                : "Recurring grants are stopped"}
              {policy.current.enabled
                ? ` · ${policy.current.rolloverCap === 0 ? "Unused allowance resets" : `Carry up to ${policy.current.rolloverCap.toLocaleString()} unused units`}`
                : ""}
            </p>
          ) : (
            <p>Scheduled to start {allowanceUTCDateTime(policy.startsAt)}.</p>
          )}
          <p className="text-xs text-muted-foreground">
            Next renewal: {allowanceUTCDateTime(policy.nextPeriodAt)}.
          </p>
          {policy.pending ? (
            <div className="rounded-lg bg-muted p-3 text-xs leading-5">
              <p className="font-medium">
                Change scheduled for {allowanceUTCDateTime(policy.pending.effectiveAt)}
              </p>
              <p>
                {policy.pending.enabled
                  ? `${policy.pending.quantity.toLocaleString()} units every ${allowanceIntervalLabel(policy.pending)}, with ${policy.pending.rolloverCap === 0 ? "no rollover" : `up to ${policy.pending.rolloverCap.toLocaleString()} units carried over`}.`
                  : "Recurring grants will stop. Manual grants remain unchanged."}
              </p>
            </div>
          ) : null}
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">
          No recurring allowance is configured. Set one up to grant units on a monthly schedule.
        </p>
      )}
      {query.isSuccess && policy ? (
        <AllowancePeriodHistory customerId={customerId} meterKey={meterKey} />
      ) : null}
      {editing ? (
        <AllowanceFormDialog
          customerId={customerId}
          meterKey={meterKey}
          onClose={() => setEditing(false)}
        />
      ) : null}
    </section>
  );
}
