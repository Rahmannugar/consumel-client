"use client";

import Link from "next/link";
import { useState } from "react";
import { AllowanceSourceDialog } from "@/components/allowance-plans/allowance-source-dialog";
import { useProjectWorkspace } from "@/components/projects/project-workspace-client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { allowanceIntervalLabel, allowanceUTCDateTime } from "@/lib/balances/allowances.format";
import type { AllowanceRevision } from "@/lib/balances/allowances.types";
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
  const [sourceAction, setSourceAction] = useState<"choose" | "detach" | null>(null);
  const policy = query.data;
  return (
    <section className="mt-7 rounded-xl border border-border bg-card px-5 py-5 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">Recurring allowance</h2>
        {query.isSuccess ? (
          <div className="flex flex-wrap gap-2">
            <Button
              size="compact"
              variant="secondary"
              onClick={() => setSourceAction("choose")}
            >
              Use allowance plan
            </Button>
            <Button size="compact" variant="quiet" onClick={() => setEditing(true)}>
              {policy ? "Customize allowance" : "Set up custom allowance"}
            </Button>
          </div>
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
            <p className="text-xs text-muted-foreground">
              Current source:{" "}
              <AllowanceSourceLabel revision={policy.current} projectSlug={project.slug} />
            </p>
          ) : null}
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
              <p className="mb-1 text-muted-foreground">
                Next source:{" "}
                <AllowanceSourceLabel revision={policy.pending} projectSlug={project.slug} />
              </p>
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
          {policy.assignedPlan ? (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <p>
                Assigned plan:{" "}
                <Link
                  className="text-primary underline underline-offset-4"
                  href={`/dashboard/${project.slug}/allowance-plans/${encodeURIComponent(policy.assignedPlan.key)}`}
                >
                  {policy.assignedPlan.name}
                </Link>
                . Customer overrides take precedence.
              </p>
              <Button variant="quiet" size="compact" onClick={() => setSourceAction("detach")}>
                Stop following plan
              </Button>
            </div>
          ) : null}
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">
          No recurring allowance is configured. Use a plan or set up a customer-specific
          schedule.
        </p>
      )}
      {query.isSuccess && policy ? (
        <AllowancePeriodHistory customerId={customerId} meterKey={meterKey} />
      ) : null}
      {sourceAction ? (
        <AllowanceSourceDialog
          key={`${project.id}:${environment.name}:${customerId}:${meterKey}:${sourceAction}`}
          customerId={customerId}
          meterKey={meterKey}
          detach={sourceAction === "detach"}
          onClose={() => setSourceAction(null)}
        />
      ) : null}
      {editing ? (
        <AllowanceFormDialog
          key={`${project.id}:${environment.name}:${customerId}:${meterKey}`}
          customerId={customerId}
          meterKey={meterKey}
          onClose={() => setEditing(false)}
        />
      ) : null}
    </section>
  );
}

function AllowanceSourceLabel({
  revision,
  projectSlug,
}: {
  revision: AllowanceRevision;
  projectSlug: string;
}) {
  if (revision.sourceKind === "direct") return <>Customer-specific allowance</>;
  return (
    <>
      {revision.sourceKind === "override" ? "Customer override" : "Allowance plan"}
      {revision.planKey ? (
        <>
          {" "}
          ·{" "}
          <Link
            className="text-primary underline underline-offset-4"
            href={`/dashboard/${projectSlug}/allowance-plans/${encodeURIComponent(revision.planKey)}`}
          >
            {revision.planName ?? revision.planKey}
          </Link>
          {revision.planVersion ? ` (version ${revision.planVersion})` : ""}
        </>
      ) : null}
    </>
  );
}
