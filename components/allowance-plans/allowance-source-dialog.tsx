"use client";

import { CalendarBlankIcon } from "@phosphor-icons/react";
import { ByteDatePicker } from "byte-datepicker";
import { type FormEvent, useRef, useState } from "react";
import { toast } from "sonner";
import { useApplicationTheme } from "@/components/application/application-theme";
import { MeterCombobox } from "@/components/balances/meter-combobox";
import { useProjectWorkspace } from "@/components/projects/project-workspace-client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { allowancePlanErrorMessage } from "@/lib/allowance-plans/allowance-plans.service";
import {
  useAllowancePlans,
  useSaveAllowanceSource,
} from "@/lib/allowance-plans/useAllowancePlans";
import { APIError } from "@/lib/api/api-client";
import { allowanceIntervalLabel, allowanceUTCDateTime } from "@/lib/balances/allowances.format";
import type { RecurringAllowance } from "@/lib/balances/allowances.types";
import { useAllowance } from "@/lib/balances/useAllowance";
import { useMeters } from "@/lib/meters/useMeters";

export function AllowanceSourceDialog({
  customerId,
  meterKey: initialMeterKey = "",
  detach = false,
  onClose,
}: {
  customerId: string;
  meterKey?: string;
  detach?: boolean;
  onClose: () => void;
}) {
  const { project, environment } = useProjectWorkspace();
  const context = { projectId: project.id, environment: environment.name };
  const [meterKey, setMeterKey] = useState(initialMeterKey);
  const [pending, setPending] = useState(false);
  const [reload, setReload] = useState(0);
  const meters = useMeters(context, meterKey === "");
  const policy = useAllowance(context, customerId, meterKey);
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !pending) onClose();
      }}
    >
      <DialogContent
        className="max-h-[calc(100svh-2rem)] overflow-y-auto"
        onEscapeKeyDown={(event) => {
          if (pending) event.preventDefault();
        }}
        onPointerDownOutside={(event) => {
          if (pending) event.preventDefault();
        }}
      >
        <DialogTitle>
          {detach ? "Stop following allowance plan" : "Use allowance plan"}
        </DialogTitle>
        <DialogDescription>
          {detach
            ? "Keep customer-specific allowance settings. Future edits to the former plan will no longer apply."
            : "Choose a reusable allowance for this customer and meter. Customer profile plan labels do not assign allowances automatically. Following the plan replaces customer-specific settings at renewal."}
        </DialogDescription>
        {!meterKey ? (
          <div className="mt-5">
            <Label htmlFor="source-meter">
              Meter{" "}
              <span aria-hidden="true" className="text-destructive">
                *
              </span>
            </Label>
            {meters.isPending ? (
              <p className="mt-3 text-sm" role="status">
                Loading meters…
              </p>
            ) : meters.isError ? (
              <div>
                <p className="mt-3 text-sm" role="alert">
                  Meters could not be loaded.
                </p>
                <Button variant="quiet" size="compact" onClick={() => meters.refetch()}>
                  Try again
                </Button>
              </div>
            ) : (
              <MeterCombobox
                id="source-meter"
                value={meterKey}
                onChange={setMeterKey}
                meters={meters.data.pages.flatMap((page) => page.meters)}
                required
                disabled={pending}
                invalid={false}
                hasMore={meters.hasNextPage}
                loadingMore={meters.isFetchingNextPage}
                onLoadMore={() => meters.fetchNextPage()}
              />
            )}
          </div>
        ) : policy.isPending ? (
          <p className="mt-5 text-sm" role="status">
            Loading allowance…
          </p>
        ) : policy.isError ? (
          <div className="mt-5">
            <p role="alert" className="text-sm">
              The allowance could not be loaded.
            </p>
            <Button
              variant="secondary"
              size="compact"
              className="mt-3"
              onClick={() => policy.refetch()}
            >
              Try again
            </Button>
          </div>
        ) : (
          <SourceForm
            key={`${meterKey}:${reload}`}
            customerId={customerId}
            meterKey={meterKey}
            policy={policy.data}
            detach={detach}
            onClose={onClose}
            onPending={setPending}
            onReload={async () => {
              const result = await policy.refetch();
              if (result.isSuccess) setReload((old) => old + 1);
            }}
          />
        )}
        {!meterKey || policy.isPending || policy.isError ? (
          <div className="mt-5 flex justify-end">
            <Button variant="quiet" onClick={onClose} disabled={pending}>
              Cancel
            </Button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
function SourceForm({
  customerId,
  meterKey,
  policy: loadedPolicy,
  detach,
  onClose,
  onPending,
  onReload,
}: {
  customerId: string;
  meterKey: string;
  policy: RecurringAllowance | null;
  detach: boolean;
  onClose: () => void;
  onPending: (pending: boolean) => void;
  onReload: () => Promise<void>;
}) {
  const [policy] = useState(loadedPolicy);
  const { project, environment } = useProjectWorkspace();
  const context = { projectId: project.id, environment: environment.name };
  const plans = useAllowancePlans(context, meterKey, !detach);
  const save = useSaveAllowanceSource(context, customerId, meterKey);
  const [planKey, setPlanKey] = useState(policy?.assignedPlan?.key ?? "");
  const [start, setStart] = useState(() => {
    const date = new Date();
    return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  });
  const [startTime, setStartTime] = useState(() => new Date().toISOString().slice(11, 16));
  const [error, setError] = useState("");
  const [conflict, setConflict] = useState(false);
  const submitting = useRef(false);
  const { resolvedTheme } = useApplicationTheme();
  const rows = plans.data?.pages.flatMap((page) => page.plans) ?? [];
  const selected = rows.find((plan) => plan.key === planKey);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current || conflict) return;
    if (!detach && !selected) {
      setError("Choose an available allowance plan.");
      return;
    }
    if (
      !policy &&
      (!/^\d{2}:\d{2}$/.test(startTime) ||
        Number(startTime.slice(0, 2)) > 23 ||
        Number(startTime.slice(3, 5)) > 59 ||
        start.getFullYear() < 2000 ||
        start.getFullYear() > 9998)
    ) {
      setError("Choose a valid UTC start date and time.");
      return;
    }
    const startsAt =
      policy?.startsAt ??
      new Date(
        Date.UTC(
          start.getFullYear(),
          start.getMonth(),
          start.getDate(),
          Number(startTime.slice(0, 2)),
          Number(startTime.slice(3, 5)),
        ),
      ).toISOString();
    submitting.current = true;
    onPending(true);
    setError("");
    try {
      await save.mutateAsync({
        planKey: detach ? null : planKey,
        startsAt,
        version: policy?.version ?? 0,
      });
      toast.success(policy ? "Allowance change scheduled" : "Allowance plan assigned");
      onClose();
    } catch (error) {
      setError(allowancePlanErrorMessage(error));
      if (error instanceof APIError && error.code === "allowance_version_conflict")
        setConflict(true);
    } finally {
      submitting.current = false;
      onPending(false);
    }
  }
  return (
    <form className="mt-5 space-y-5" onSubmit={submit} noValidate aria-busy={save.isPending}>
      <p className="text-sm">
        Meter <code className="ml-2 text-xs">{meterKey}</code>
      </p>
      {!detach ? (
        <div>
          <Label htmlFor="source-plan">
            Allowance plan{" "}
            <span aria-hidden="true" className="text-destructive">
              *
            </span>
          </Label>
          {plans.isPending ? (
            <p className="mt-3 text-sm" role="status">
              Loading plans…
            </p>
          ) : plans.isError ? (
            <div className="mt-3">
              <p role="alert" className="text-sm">
                Allowance plans could not be loaded.
              </p>
              <Button
                type="button"
                variant="quiet"
                size="compact"
                onClick={() => plans.refetch()}
              >
                Try again
              </Button>
            </div>
          ) : rows.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              No allowance plans exist for this meter. Create a plan under Meters → Allowance
              plans first.
            </p>
          ) : (
            <>
              <Select
                required
                value={selected ? planKey : undefined}
                disabled={save.isPending}
                onValueChange={setPlanKey}
              >
                <SelectTrigger id="source-plan" className="mt-2 w-full" aria-required="true">
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
                  {rows.map((plan) => (
                    <SelectItem key={plan.id} value={plan.key}>
                      {plan.name} ({plan.key})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {plans.hasNextPage ? (
                <Button
                  type="button"
                  variant="quiet"
                  size="compact"
                  className="mt-2"
                  disabled={save.isPending || plans.isFetchingNextPage}
                  onClick={() => plans.fetchNextPage()}
                >
                  {plans.isFetchingNextPage ? "Loading plans…" : "Load more plans"}
                </Button>
              ) : null}
              {selected ? (
                <p className="mt-3 rounded-lg bg-muted p-3 text-xs leading-5">
                  {selected.enabled
                    ? `${selected.quantity.toLocaleString()} units every ${allowanceIntervalLabel(selected)} · ${selected.rolloverCap === 0 ? "Unused allowance resets" : `Carry up to ${selected.rolloverCap.toLocaleString()} unused units`}.`
                    : "This plan has stopped recurring grants."}
                </p>
              ) : null}
            </>
          )}
        </div>
      ) : null}
      {!policy ? (
        <div>
          <Label htmlFor="source-start">
            Renewal start date (UTC){" "}
            <span aria-hidden="true" className="text-destructive">
              *
            </span>
          </Label>
          <ByteDatePicker
            value={start}
            onChange={(date) => {
              if (date) setStart(date);
            }}
            includeDays
            formatString="dd mmm yyyy"
            hideInput
            required
            disabled={save.isPending}
            theme={resolvedTheme}
          >
            {({ open, isOpen, formattedValue }) => (
              <button
                id="source-start"
                type="button"
                className="mt-2 flex h-11 w-full items-center justify-between rounded-lg border border-border bg-background px-3 text-sm focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50"
                onClick={open}
                disabled={save.isPending}
                aria-label="Renewal start date (UTC, required)"
                aria-haspopup="dialog"
                aria-expanded={isOpen}
              >
                <span>{formattedValue}</span>
                <CalendarBlankIcon aria-hidden="true" />
              </button>
            )}
          </ByteDatePicker>
          <Label className="mt-3" htmlFor="source-time">
            Start time (UTC){" "}
            <span aria-hidden="true" className="text-destructive">
              *
            </span>
          </Label>
          <Input
            id="source-time"
            type="time"
            step={60}
            className="mt-2"
            value={startTime}
            onChange={(event) => setStartTime(event.target.value)}
            required
            disabled={save.isPending}
          />
          <p className="mt-2 text-xs text-muted-foreground">
            A past start grants the full current period without earlier credits or proration.
          </p>
        </div>
      ) : (
        <p className="rounded-lg bg-muted p-3 text-xs leading-5">
          The current period is preserved.{" "}
          {detach ? "Customer-specific settings" : "The selected plan’s settings"} take effect
          at renewal on {allowanceUTCDateTime(policy.nextPeriodAt)}.
        </p>
      )}
      {error ? (
        <div role="alert">
          <p className="text-sm text-destructive">{error}</p>
          {conflict ? (
            <Button
              type="button"
              size="compact"
              variant="secondary"
              className="mt-3"
              disabled={save.isPending}
              onClick={() => {
                void onReload();
              }}
            >
              Reload latest settings
            </Button>
          ) : null}
        </div>
      ) : null}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="quiet" disabled={save.isPending} onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={save.isPending || conflict || (!detach && (!selected || plans.isError))}
        >
          {save.isPending ? "Saving allowance…" : detach ? "Stop following plan" : "Use plan"}
        </Button>
      </div>
    </form>
  );
}
