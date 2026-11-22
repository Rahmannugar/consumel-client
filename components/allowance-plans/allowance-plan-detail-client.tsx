"use client";

import { ArrowLeftIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode, useRef, useState } from "react";
import { toast } from "sonner";
import { useProjectWorkspace } from "@/components/projects/project-workspace-client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { allowancePlanErrorMessage } from "@/lib/allowance-plans/allowance-plans.service";
import type { AllowancePlan } from "@/lib/allowance-plans/allowance-plans.types";
import {
  useAllowancePlan,
  useAllowancePlanMutations,
} from "@/lib/allowance-plans/useAllowancePlans";
import { APIError } from "@/lib/api/api-client";
import { allowanceIntervalLabel, allowanceUTCDateTime } from "@/lib/balances/allowances.format";
import { AllowancePlanFormDialog } from "./allowance-plan-form-dialog";

export function AllowancePlanDetailClient({ planKey }: { planKey: string }) {
  const { project, environment } = useProjectWorkspace();
  const context = { projectId: project.id, environment: environment.name };
  const query = useAllowancePlan(context, planKey, environment.activatedAt !== null);
  const [editing, setEditing] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const baseHref = `/dashboard/${project.slug}/allowance-plans`;
  const plan = query.data;
  return (
    <div className="mx-auto max-w-[1040px] px-5 py-8 sm:px-8 sm:py-11">
      <Button asChild variant="quiet" size="compact" className="-ml-2 mb-6">
        <Link href={baseHref}>
          <ArrowLeftIcon />
          Allowance plans
        </Link>
      </Button>
      {environment.activatedAt === null ? (
        <p className="text-sm">Activate Live to view production allowance plans.</p>
      ) : query.isPending ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : query.isError ? (
        <section className="rounded-xl border border-border bg-card p-8 text-center">
          <h1 className="text-lg font-semibold">
            {query.error instanceof APIError && query.error.status === 404
              ? "This allowance plan is unavailable"
              : "Allowance plan could not be loaded"}
          </h1>
          <Button
            size="compact"
            variant="secondary"
            className="mt-4"
            onClick={() => query.refetch()}
          >
            Try again
          </Button>
        </section>
      ) : plan ? (
        <>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="break-words font-[family-name:var(--font-bricolage-grotesque)] text-[28px] font-semibold tracking-[-0.04em]">
                {plan.name}
              </h1>
              <code className="mt-1 block break-all text-xs text-muted-foreground">
                {plan.key}
              </code>
            </div>
            <div className="flex gap-2">
              <Button size="compact" variant="quiet" onClick={() => setArchiving(true)}>
                Archive plan
              </Button>
              <Button size="compact" variant="secondary" onClick={() => setEditing(true)}>
                Edit plan
              </Button>
            </div>
          </div>
          <section className="mt-7 rounded-xl border border-border bg-card">
            <dl className="divide-y divide-border">
              <Detail label="Meter">
                <Link
                  className="font-mono text-xs text-primary underline underline-offset-4"
                  href={`/dashboard/${project.slug}/meters/${encodeURIComponent(plan.meterKey)}`}
                >
                  {plan.meterKey}
                </Link>
              </Detail>
              <Detail label="Units per renewal">{plan.quantity.toLocaleString()}</Detail>
              <Detail label="Renewal interval">
                Every {allowanceIntervalLabel(plan)} · UTC
              </Detail>
              <Detail label="Unused units">
                {plan.rolloverCap === 0
                  ? "Reset at renewal"
                  : `Carry up to ${plan.rolloverCap.toLocaleString()} units`}
              </Detail>
              <Detail label="Status">
                {plan.enabled ? "Issuing recurring grants" : "Recurring grants stopped"}
              </Detail>
              <Detail label="Updated">
                {allowanceUTCDateTime(plan.updatedAt)} · Version {plan.version}
              </Detail>
            </dl>
          </section>
          <p className="mt-4 max-w-2xl text-xs leading-5 text-muted-foreground">
            Assign this plan from a customer’s balance. Plan edits apply at each customer’s next
            renewal. Customer-specific overrides and manual grants remain independent.
          </p>
          {editing ? (
            <AllowancePlanFormDialog
              key={`${project.id}:${environment.name}:${plan.id}`}
              plan={plan}
              onClose={() => setEditing(false)}
              onSaved={() => setEditing(false)}
            />
          ) : null}
          {archiving ? (
            <ArchivePlanDialog
              key={`${project.id}:${environment.name}:${plan.id}`}
              plan={plan}
              onClose={() => setArchiving(false)}
            />
          ) : null}
        </>
      ) : null}
    </div>
  );
}
function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 px-5 py-4 sm:grid-cols-[170px_1fr] sm:gap-6">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="break-words text-sm">{children}</dd>
    </div>
  );
}
function ArchivePlanDialog({ plan, onClose }: { plan: AllowancePlan; onClose: () => void }) {
  const [snapshot] = useState(plan);
  const { project, environment } = useProjectWorkspace();
  const mutation = useAllowancePlanMutations({
    projectId: project.id,
    environment: environment.name,
  }).archive;
  const router = useRouter();
  const submitting = useRef(false);
  const [error, setError] = useState("");
  const [conflict, setConflict] = useState(false);
  async function archive() {
    if (submitting.current || conflict) return;
    submitting.current = true;
    setError("");
    try {
      await mutation.mutateAsync(snapshot);
      toast.success("Allowance plan archived");
      onClose();
      router.push(`/dashboard/${project.slug}/allowance-plans`);
    } catch (error) {
      setError(allowancePlanErrorMessage(error));
      if (error instanceof APIError && error.code === "allowance_plan_version_conflict")
        setConflict(true);
    } finally {
      submitting.current = false;
    }
  }
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !mutation.isPending) onClose();
      }}
    >
      <DialogContent>
        <DialogTitle>Archive {snapshot.name}?</DialogTitle>
        <DialogDescription>
          Only unused plans can be archived. Remove customer assignments and allow pending
          changes to take effect first. Existing renewal history is retained, and the plan key
          cannot be reused.
        </DialogDescription>
        {error ? (
          <p role="alert" className="mt-4 text-sm text-destructive">
            {error}
            {conflict ? " Close this dialog and reopen it to load the latest version." : ""}
          </p>
        ) : null}
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="quiet" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button onClick={archive} disabled={mutation.isPending || conflict}>
            {mutation.isPending ? "Archiving plan…" : "Archive plan"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
