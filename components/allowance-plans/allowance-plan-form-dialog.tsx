"use client";

import { type FormEvent, useRef, useState } from "react";
import { toast } from "sonner";
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
import { allowancePlanFormSchema } from "@/lib/allowance-plans/allowance-plan.validation";
import { allowancePlanErrorMessage } from "@/lib/allowance-plans/allowance-plans.service";
import type { AllowancePlan } from "@/lib/allowance-plans/allowance-plans.types";
import { useAllowancePlanMutations } from "@/lib/allowance-plans/useAllowancePlans";
import { APIError } from "@/lib/api/api-client";
import { allowanceIntervalLabel } from "@/lib/balances/allowances.format";
import {
  type AllowanceIntervalUnit,
  allowanceIntervalUnits,
} from "@/lib/balances/allowances.types";
import { useMeters } from "@/lib/meters/useMeters";

export function AllowancePlanFormDialog({
  plan,
  onClose,
  onSaved,
}: {
  plan?: AllowancePlan;
  onClose: () => void;
  onSaved: (plan: AllowancePlan) => void;
}) {
  // Capture the edited version so a background refetch cannot overwrite an unsaved form.
  const [initial] = useState(plan);
  const { project, environment } = useProjectWorkspace();
  const context = { projectId: project.id, environment: environment.name };
  const mutations = useAllowancePlanMutations(context);
  const meters = useMeters(context, !initial);
  const [values, setValues] = useState({
    key: initial?.key ?? "",
    name: initial?.name ?? "",
    meterKey: initial?.meterKey ?? "",
    quantity: String(initial?.quantity ?? ""),
    rolloverCap: String(initial?.rolloverCap ?? 0),
    intervalCount: String(initial?.intervalCount ?? 1),
    intervalUnit: initial?.intervalUnit ?? ("month" as AllowanceIntervalUnit),
    enabled: initial?.enabled ?? true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [conflict, setConflict] = useState(false);
  const submitting = useRef(false);
  const pending = mutations.create.isPending || mutations.update.isPending;
  const rows = meters.data?.pages.flatMap((page) => page.meters) ?? [];
  function setField(
    field: "key" | "name" | "meterKey" | "quantity" | "rolloverCap" | "intervalCount",
    value: string,
  ) {
    setValues((old) => ({ ...old, [field]: value }));
    setErrors((old) => ({ ...old, [field]: "" }));
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current || conflict) return;
    const parsed = allowancePlanFormSchema.safeParse(values);
    if (!parsed.success) {
      const fields: Record<string, string> = {};
      for (const issue of parsed.error.issues) fields[String(issue.path[0])] = issue.message;
      setErrors(fields);
      return;
    }
    submitting.current = true;
    setErrors({});
    try {
      const saved = initial
        ? await mutations.update.mutateAsync({
            key: initial.key,
            input: {
              name: parsed.data.name,
              quantity: parsed.data.quantity,
              rolloverCap: parsed.data.rolloverCap,
              enabled: parsed.data.enabled,
              version: initial.version,
            },
          })
        : await mutations.create.mutateAsync(parsed.data);
      toast.success(initial ? "Allowance plan updated" : "Allowance plan created");
      onSaved(saved);
    } catch (error) {
      if (error instanceof APIError && error.code === "allowance_plan_version_conflict")
        setConflict(true);
      setErrors({ form: allowancePlanErrorMessage(error) });
    } finally {
      submitting.current = false;
    }
  }
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
        <DialogTitle>{initial ? "Edit allowance plan" : "Create allowance plan"}</DialogTitle>
        <DialogDescription>
          {initial
            ? "Changes apply to customers following this plan at their next renewal. Customer overrides stay in place."
            : "Define recurring units for one meter, then assign this plan to customers. An allowance plan does not charge customers."}
        </DialogDescription>
        <form className="mt-5 space-y-5" onSubmit={submit} noValidate aria-busy={pending}>
          <PlanField
            id="plan-name"
            label="Name"
            value={values.name}
            onChange={(value) => setField("name", value)}
            disabled={pending}
            error={errors.name}
            placeholder="Basic API allowance"
          />
          {initial ? (
            <div className="rounded-lg bg-muted p-3 text-xs leading-6">
              <p>
                Plan key: <code>{initial.key}</code>
              </p>
              <p>
                Meter: <code>{initial.meterKey}</code>
              </p>
              <p>Renews every {allowanceIntervalLabel(initial)} (UTC).</p>
              <p className="mt-1 text-muted-foreground">
                Create another plan to use a different meter or renewal interval.
              </p>
            </div>
          ) : (
            <>
              <PlanField
                id="plan-key"
                label="Plan key"
                value={values.key}
                onChange={(value) => setField("key", value)}
                disabled={pending}
                error={errors.key}
                placeholder="basic_api"
              />
              <p className="-mt-3 text-xs text-muted-foreground">
                The key and renewal interval cannot change after creation.
              </p>
              <div>
                <Label htmlFor="plan-meter">
                  Meter{" "}
                  <span aria-hidden="true" className="text-destructive">
                    *
                  </span>
                </Label>
                {meters.isPending ? (
                  <p className="mt-2 text-xs" role="status">
                    Loading meters…
                  </p>
                ) : meters.isError ? (
                  <div className="mt-2">
                    <p className="text-xs" role="alert">
                      Meters could not be loaded.
                    </p>
                    <Button
                      type="button"
                      size="compact"
                      variant="quiet"
                      onClick={() => meters.refetch()}
                    >
                      Try again
                    </Button>
                  </div>
                ) : (
                  <MeterCombobox
                    id="plan-meter"
                    value={values.meterKey}
                    onChange={(value) => setField("meterKey", value)}
                    meters={rows}
                    required
                    disabled={pending}
                    hasMore={meters.hasNextPage}
                    loadingMore={meters.isFetchingNextPage}
                    onLoadMore={() => meters.fetchNextPage()}
                    invalid={Boolean(errors.meterKey)}
                  />
                )}
                {errors.meterKey ? (
                  <p className="mt-1 text-xs text-destructive" role="alert">
                    {errors.meterKey}
                  </p>
                ) : null}
              </div>
              <fieldset>
                <legend className="mb-2 text-sm font-medium">
                  Renew every{" "}
                  <span aria-hidden="true" className="text-destructive">
                    *
                  </span>
                </legend>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    aria-label="Renewal interval count"
                    inputMode="numeric"
                    value={values.intervalCount}
                    required
                    disabled={pending}
                    aria-invalid={Boolean(errors.intervalCount)}
                    onChange={(event) => setField("intervalCount", event.target.value)}
                  />
                  <Select
                    required
                    disabled={pending}
                    value={values.intervalUnit}
                    onValueChange={(value) => {
                      const unit = allowanceIntervalUnits.find(
                        (candidate) => candidate === value,
                      );
                      if (unit) setValues((old) => ({ ...old, intervalUnit: unit }));
                    }}
                  >
                    <SelectTrigger aria-label="Renewal interval unit" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {allowanceIntervalUnits.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit.charAt(0).toUpperCase() + unit.slice(1)}
                          {values.intervalCount === "1" ? "" : "s"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {errors.intervalCount ? (
                  <p role="alert" className="mt-1 text-xs text-destructive">
                    {errors.intervalCount}
                  </p>
                ) : null}
              </fieldset>
            </>
          )}
          <PlanField
            id="plan-quantity"
            label="Units per renewal"
            value={values.quantity}
            onChange={(value) => setField("quantity", value)}
            disabled={pending}
            error={errors.quantity}
            numeric
          />
          <PlanField
            id="plan-rollover"
            label="Maximum units to carry over"
            value={values.rolloverCap}
            onChange={(value) => setField("rolloverCap", value)}
            disabled={pending}
            error={errors.rolloverCap}
            numeric
          />
          <p className="-mt-3 text-xs text-muted-foreground">
            Use 0 to reset unused allowance. Manual grants keep their own expiration rules.
          </p>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={values.enabled}
              disabled={pending}
              onChange={(event) =>
                setValues((old) => ({ ...old, enabled: event.target.checked }))
              }
            />
            Issue recurring grants
          </label>
          {errors.form ? (
            <div role="alert" className="text-sm text-destructive">
              <p>{errors.form}</p>
              {conflict ? (
                <p className="mt-2 text-xs">
                  Close this form and reopen it to load the latest settings before editing
                  again.
                </p>
              ) : null}
            </div>
          ) : null}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="quiet" onClick={onClose} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending || conflict}>
              {pending ? "Saving plan…" : initial ? "Save changes" : "Create plan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PlanField({
  id,
  label,
  value,
  onChange,
  disabled,
  error,
  placeholder,
  numeric = false,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  error?: string;
  placeholder?: string;
  numeric?: boolean;
}) {
  return (
    <div>
      <Label htmlFor={id}>
        {label}{" "}
        <span aria-hidden="true" className="text-destructive">
          *
        </span>
      </Label>
      <Input
        id={id}
        className="mt-2"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required
        disabled={disabled}
        inputMode={numeric ? "numeric" : undefined}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1 text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
