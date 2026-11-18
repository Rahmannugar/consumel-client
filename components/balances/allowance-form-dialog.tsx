"use client";

import { CalendarBlankIcon } from "@phosphor-icons/react";
import { ByteDatePicker } from "byte-datepicker";
import { type FormEvent, useRef, useState } from "react";
import { toast } from "sonner";
import { useApplicationTheme } from "@/components/application/application-theme";
import { useProjectWorkspace } from "@/components/projects/project-workspace-client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APIError } from "@/lib/api/api-client";
import { allowanceFormSchema } from "@/lib/balances/allowance.validation";
import type { RecurringAllowance } from "@/lib/balances/allowances.types";
import { balanceErrorMessage } from "@/lib/balances/balances.service";
import { useAllowance, useSaveAllowance } from "@/lib/balances/useAllowance";
import { useMeters } from "@/lib/meters/useMeters";
import { MeterCombobox } from "./meter-combobox";

export function AllowanceFormDialog({
  customerId,
  meterKey: initialMeterKey = "",
  onClose,
}: {
  customerId: string;
  meterKey?: string;
  onClose: () => void;
}) {
  const { project, environment } = useProjectWorkspace();
  const context = { projectId: project.id, environment: environment.name };
  const [meterKey, setMeterKey] = useState(initialMeterKey);
  const [pending, setPending] = useState(false);
  const [formVersion, setFormVersion] = useState(0);
  const meters = useMeters(context, !meterKey);
  const policy = useAllowance(context, customerId, meterKey);
  const rows = meters.data?.pages.flatMap((page) => page.meters) ?? [];
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !pending) onClose();
      }}
    >
      <DialogContent
        className="max-h-[90dvh] overflow-y-auto"
        onEscapeKeyDown={(event) => {
          if (pending) event.preventDefault();
        }}
        onPointerDownOutside={(event) => {
          if (pending) event.preventDefault();
        }}
      >
        <DialogTitle>Recurring allowance</DialogTitle>
        <DialogDescription className="mt-2">
          Grant units each month in UTC. Renewal affects this allowance’s units; manual grants
          keep their own expiration.
        </DialogDescription>
        {!meterKey ? (
          <div className="mt-5">
            <Label htmlFor="allowance-meter">
              Meter{" "}
              <span aria-hidden="true" className="text-destructive">
                *
              </span>
            </Label>
            {meters.isError ? (
              <p role="alert" className="mt-3 text-sm">
                Meters could not be loaded.{" "}
                <button type="button" className="underline" onClick={() => meters.refetch()}>
                  Try again
                </button>
              </p>
            ) : (
              <MeterCombobox
                id="allowance-meter"
                meters={rows}
                value=""
                onChange={setMeterKey}
                disabled={meters.isPending}
                invalid={false}
                required
                hasMore={meters.hasNextPage}
                loadingMore={meters.isFetchingNextPage}
                onLoadMore={() => meters.fetchNextPage()}
              />
            )}
            <Button variant="quiet" className="mt-5" onClick={onClose}>
              Cancel
            </Button>
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
            <Button className="mt-3" variant="secondary" onClick={() => policy.refetch()}>
              Try again
            </Button>
            <Button variant="quiet" onClick={onClose}>
              Cancel
            </Button>
          </div>
        ) : (
          <AllowanceForm
            key={`${meterKey}:${formVersion}`}
            customerId={customerId}
            meterKey={meterKey}
            policy={policy.data}
            onClose={onClose}
            onPending={setPending}
            onReload={async () => {
              await policy.refetch();
              setFormVersion((value) => value + 1);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
function AllowanceForm({
  customerId,
  meterKey,
  policy: loadedPolicy,
  onClose,
  onPending,
  onReload,
}: {
  customerId: string;
  meterKey: string;
  policy: RecurringAllowance | null;
  onClose: () => void;
  onPending: (value: boolean) => void;
  onReload: () => Promise<void>;
}) {
  // Keep the edit's version stable until the user explicitly reloads. A
  // background refetch must not replace unsaved inputs or re-enable a pending form.
  const [policy] = useState(loadedPolicy);
  const [conflict, setConflict] = useState(false);
  const { project, environment } = useProjectWorkspace();
  const { resolvedTheme } = useApplicationTheme();
  const revision = policy?.pending ?? policy?.current;
  const [quantity, setQuantity] = useState(String(revision?.quantity ?? ""));
  const [rollover, setRollover] = useState(String(revision?.rolloverCap ?? 0));
  const [enabled, setEnabled] = useState(revision?.enabled ?? true);
  const [start, setStart] = useState(() =>
    policy ? dateFromUTC(policy.startsAt) : new Date(),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const submitting = useRef(false);
  const save = useSaveAllowance(
    { projectId: project.id, environment: environment.name },
    customerId,
    meterKey,
  );
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    const startsAt = new Date(
      Date.UTC(start.getFullYear(), start.getMonth(), start.getDate()),
    ).toISOString();
    const parsed = allowanceFormSchema.safeParse({
      quantity,
      rolloverCap: rollover,
      startsAt,
      enabled,
    });
    if (!parsed.success) {
      const fields: Record<string, string> = {};
      for (const issue of parsed.error.issues) fields[String(issue.path[0])] = issue.message;
      setErrors(fields);
      return;
    }
    submitting.current = true;
    onPending(true);
    setErrors({});
    try {
      await save.mutateAsync({ ...parsed.data, version: policy?.version ?? 0 });
      toast.success(policy ? "Allowance change scheduled" : "Recurring allowance created");
      onClose();
    } catch (error) {
      if (error instanceof APIError && error.code === "allowance_version_conflict") {
        setConflict(true);
      }
      setErrors({ form: balanceErrorMessage(error) });
    } finally {
      submitting.current = false;
      onPending(false);
    }
  }
  const pending = save.isPending;
  return (
    <form className="mt-5 space-y-5" onSubmit={submit} noValidate aria-busy={pending}>
      <p className="text-sm">
        Meter <code className="ml-2 text-xs">{meterKey}</code>
      </p>
      <div>
        <Label htmlFor="allowance-quantity">
          Units per month{" "}
          <span aria-hidden="true" className="text-destructive">
            *
          </span>
        </Label>
        <Input
          id="allowance-quantity"
          className="mt-2"
          inputMode="numeric"
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
          required
          disabled={pending}
          aria-invalid={Boolean(errors.quantity)}
          aria-describedby={errors.quantity ? "allowance-quantity-error" : undefined}
        />
        {errors.quantity ? (
          <p
            id="allowance-quantity-error"
            role="alert"
            className="mt-1 text-xs text-destructive"
          >
            {errors.quantity}
          </p>
        ) : null}
      </div>
      <div>
        <Label htmlFor="allowance-rollover">
          Maximum units to carry over{" "}
          <span aria-hidden="true" className="text-destructive">
            *
          </span>
        </Label>
        <Input
          id="allowance-rollover"
          className="mt-2"
          inputMode="numeric"
          value={rollover}
          onChange={(event) => setRollover(event.target.value)}
          required
          disabled={pending}
          aria-invalid={Boolean(errors.rolloverCap)}
          aria-describedby="allowance-rollover-help"
        />
        <p id="allowance-rollover-help" className="mt-2 text-xs text-muted-foreground">
          Use 0 to reset. A positive cap carries unused allowance units in addition to the new
          monthly grant.
        </p>
        {errors.rolloverCap ? (
          <p role="alert" className="mt-1 text-xs text-destructive">
            {errors.rolloverCap}
          </p>
        ) : null}
      </div>
      <div>
        <Label htmlFor={policy ? undefined : "allowance-start"}>
          Renewal start date{" "}
          {!policy ? (
            <span aria-hidden="true" className="text-destructive">
              *
            </span>
          ) : null}
        </Label>
        {policy ? (
          <p className="mt-2 text-sm">{policy.startsAt.slice(0, 10)} · midnight UTC</p>
        ) : (
          <ByteDatePicker
            className="mt-2 w-full"
            value={start}
            onChange={(date) => {
              if (date) setStart(date);
            }}
            includeDays
            formatString="dd mmm yyyy"
            hideInput
            name="allowance-start"
            required
            disabled={pending}
            theme={resolvedTheme}
          >
            {({ open, isOpen, formattedValue }) => (
              <button
                id="allowance-start"
                type="button"
                className="mt-2 flex h-11 w-full items-center justify-between rounded-lg border border-border bg-background px-3 text-sm focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50"
                onClick={open}
                disabled={pending}
                aria-label="Renewal start date (required)"
                aria-haspopup="dialog"
                aria-expanded={isOpen}
              >
                <span>{formattedValue}</span>
                <CalendarBlankIcon aria-hidden="true" />
              </button>
            )}
          </ByteDatePicker>
        )}
        <p className="mt-2 text-xs text-muted-foreground">
          The day repeats monthly. Shorter months use their last day. A start date in the past
          grants the full current period, without earlier credits or proration.
        </p>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(event) => setEnabled(event.target.checked)}
          disabled={pending}
        />{" "}
        Issue monthly grants
      </label>
      {policy ? (
        <p className="rounded-lg bg-muted p-3 text-xs leading-5">
          Changes, including stopping grants, take effect on{" "}
          {new Date(policy.nextPeriodAt).toLocaleDateString(undefined, {
            timeZone: "UTC",
            dateStyle: "medium",
          })}{" "}
          at midnight UTC. The current period is preserved.
        </p>
      ) : null}
      {errors.form ? (
        <div role="alert" className="space-y-2">
          <p className="text-sm text-destructive">{errors.form}</p>
          {conflict ? (
            <Button
              type="button"
              variant="secondary"
              size="compact"
              disabled={pending}
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
        <Button type="button" variant="quiet" onClick={onClose} disabled={pending}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending || conflict}>
          {pending ? "Saving allowance…" : policy ? "Schedule change" : "Create allowance"}
        </Button>
      </div>
    </form>
  );
}
function dateFromUTC(value: string) {
  const date = new Date(value);
  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}
