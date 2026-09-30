"use client";

import { CalendarBlankIcon } from "@phosphor-icons/react";
import { ByteDatePicker } from "byte-datepicker";
import type { FormEvent, ReactNode } from "react";
import { useState } from "react";
import { toast } from "sonner";
import { useApplicationTheme } from "@/components/application/application-theme";
import { MeterCombobox } from "@/components/balances/meter-combobox";
import { useProjectWorkspace } from "@/components/projects/project-workspace-client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addBalanceSchema, setBalanceSchema } from "@/lib/balances/balance.validation";
import { balanceErrorMessage } from "@/lib/balances/balances.service";
import { useAddBalance, useSetBalance } from "@/lib/balances/useBalanceMutations";
import { createUUIDv7 } from "@/lib/idempotency/uuid-v7";
import { useMeters } from "@/lib/meters/useMeters";

export function BalanceFormDialog({
  customerId,
  meterKey: initialMeterKey = "",
  quantity: initialQuantity,
  onClose,
}: {
  customerId: string;
  meterKey?: string;
  quantity?: number;
  onClose: () => void;
}) {
  const { project, environment } = useProjectWorkspace();
  const { resolvedTheme } = useApplicationTheme();
  const context = { projectId: project.id, environment: environment.name };
  const meters = useMeters(context, !initialMeterKey);
  const [mode, setMode] = useState<"add" | "set">("add");
  const [values, setValues] = useState({
    meterKey: initialMeterKey,
    quantity: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [expirationDate, setExpirationDate] = useState<Date | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState(createUUIDv7);
  const add = useAddBalance(context);
  const set = useSetBalance(context, customerId, values.meterKey);
  const pending = add.isPending || set.isPending;
  const metersLoading = !initialMeterKey && meters.isPending;
  const metersFailed = !initialMeterKey && meters.isError;
  const loadedMeters = meters.data?.pages.flatMap((page) => page.meters) ?? [];

  function update(field: "meterKey" | "quantity", value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: "" }));
    if (mode === "add") setIdempotencyKey(createUUIDv7());
  }

  function changeMode(nextMode: "add" | "set") {
    setMode(nextMode);
    setValues((current) => ({
      ...current,
      quantity:
        nextMode === "set" && initialQuantity !== undefined ? String(initialQuantity) : "",
    }));
    setFieldErrors((current) => ({ ...current, quantity: "" }));
    setIdempotencyKey(createUUIDv7());
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = (mode === "add" ? addBalanceSchema : setBalanceSchema).safeParse({
      ...values,
      expiresAt: mode === "add" ? expirationInstant(expirationDate) : undefined,
    });
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const field = String(issue.path[0] ?? "form");
        if (!errors[field]) errors[field] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    try {
      if (mode === "add") {
        const expiresAt =
          "expiresAt" in parsed.data && typeof parsed.data.expiresAt === "string"
            ? parsed.data.expiresAt
            : undefined;
        await add.mutateAsync({
          input: {
            customerId,
            meterKey: parsed.data.meterKey,
            quantity: parsed.data.quantity,
            expiresAt,
          },
          idempotencyKey,
        });
        toast.success("Units added");
      } else {
        await set.mutateAsync({ quantity: parsed.data.quantity });
        toast.success("Balance updated");
      }
      onClose();
    } catch (error) {
      toast.error(balanceErrorMessage(error));
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && !pending && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogTitle>Adjust balance</DialogTitle>
        <DialogDescription>
          Choose whether to increase the balance or replace it with a new total.
        </DialogDescription>
        <form className="mt-5 space-y-5" onSubmit={submit} noValidate>
          {initialMeterKey ? (
            <div>
              <p className="text-sm font-medium">Meter</p>
              <code className="mt-2 block rounded-lg border border-border bg-muted/40 px-3 py-3 font-mono text-xs">
                {initialMeterKey}
              </code>
            </div>
          ) : (
            <div>
              <RequiredLabel htmlFor="balance-meter">Meter</RequiredLabel>
              <MeterCombobox
                id="balance-meter"
                meters={loadedMeters}
                value={values.meterKey}
                onChange={(value) => update("meterKey", value)}
                disabled={pending || metersLoading || metersFailed}
                invalid={Boolean(fieldErrors.meterKey)}
                describedBy={fieldErrors.meterKey ? "balance-meter-error" : undefined}
                hasMore={Boolean(meters.hasNextPage)}
                loadingMore={meters.isFetchingNextPage}
                onLoadMore={() => void meters.fetchNextPage()}
              />
              {metersLoading ? (
                <p className="mt-1.5 text-xs text-muted-foreground">Loading meters…</p>
              ) : null}
              {metersFailed ? (
                <div className="mt-1.5 flex items-center gap-2 text-xs text-destructive">
                  <span>Meters could not be loaded.</span>
                  <button type="button" className="underline" onClick={() => meters.refetch()}>
                    Try again
                  </button>
                </div>
              ) : null}
              {fieldErrors.meterKey ? (
                <FieldError id="balance-meter-error" message={fieldErrors.meterKey} />
              ) : null}
            </div>
          )}
          <fieldset>
            <legend className="text-sm font-medium">
              Adjustment
              <span className="ml-0.5 text-destructive" aria-hidden="true">
                *
              </span>
            </legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <AdjustmentOption
                value="add"
                checked={mode === "add"}
                title="Add units"
                description="Increase the current balance."
                disabled={pending}
                onChange={() => changeMode("add")}
              />
              <AdjustmentOption
                value="set"
                checked={mode === "set"}
                title="Set total"
                description="Replace the current balance."
                disabled={pending}
                onChange={() => changeMode("set")}
              />
            </div>
          </fieldset>
          <div>
            <RequiredLabel htmlFor="balance-quantity">
              {mode === "add" ? "Units to add" : "New total"}
            </RequiredLabel>
            <Input
              id="balance-quantity"
              className="mt-2"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={values.quantity}
              onChange={(event) => update("quantity", event.target.value)}
              disabled={pending}
              required
              placeholder={mode === "add" ? "10000" : "25000"}
              aria-invalid={Boolean(fieldErrors.quantity)}
              aria-describedby={fieldErrors.quantity ? "balance-quantity-error" : undefined}
            />
            {fieldErrors.quantity ? (
              <FieldError id="balance-quantity-error" message={fieldErrors.quantity} />
            ) : null}
          </div>
          {mode === "add" ? (
            <div>
              <Label>Expiration</Label>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Optional. Expiring units are used before units that expire later or never.
              </p>
              <div className="mt-2 flex items-center gap-2">
                <div className="min-w-0 flex-1">
                  <ByteDatePicker
                    className="w-full"
                    value={expirationDate}
                    onChange={(date) => {
                      setExpirationDate(date);
                      setIdempotencyKey(createUUIDv7());
                    }}
                    includeDays
                    minDate={new Date()}
                    formatString="dd mmm yyyy"
                    hideInput
                    theme={resolvedTheme}
                  >
                    {({ open: openPicker, isOpen, formattedValue }) => (
                      <button
                        type="button"
                        className="flex h-11 w-full items-center justify-between rounded-lg border border-[#c8d2d9] bg-background px-3 text-left text-sm shadow-xs outline-none hover:border-[#9eb3c1] focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20 dark:border-border disabled:cursor-not-allowed disabled:opacity-55"
                        onClick={openPicker}
                        aria-label="Entitlement expiration date"
                        aria-haspopup="dialog"
                        aria-expanded={isOpen}
                        disabled={pending}
                      >
                        <span
                          className={
                            formattedValue ? "text-foreground" : "text-muted-foreground"
                          }
                        >
                          {formattedValue || "Never expires"}
                        </span>
                        <CalendarBlankIcon
                          className="text-muted-foreground"
                          aria-hidden="true"
                        />
                      </button>
                    )}
                  </ByteDatePicker>
                </div>
                {expirationDate ? (
                  <Button
                    type="button"
                    size="compact"
                    variant="quiet"
                    onClick={() => {
                      setExpirationDate(null);
                      setIdempotencyKey(createUUIDv7());
                    }}
                    disabled={pending}
                  >
                    Clear
                  </Button>
                ) : null}
              </div>
              {expirationDate ? (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Units remain available through the selected date.
                </p>
              ) : null}
            </div>
          ) : null}
          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="quiet"
              size="compact"
              onClick={onClose}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" size="compact" disabled={pending || metersLoading}>
              {pending
                ? mode === "add"
                  ? "Adding…"
                  : "Updating…"
                : mode === "add"
                  ? "Add units"
                  : "Update balance"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function expirationInstant(value: Date | null) {
  if (!value) return undefined;
  const result = new Date(value.getFullYear(), value.getMonth(), value.getDate() + 1);
  return result.toISOString();
}

function AdjustmentOption({
  value,
  checked,
  title,
  description,
  disabled,
  onChange,
}: {
  value: "add" | "set";
  checked: boolean;
  title: string;
  description: string;
  disabled: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className={`cursor-pointer rounded-lg border px-3 py-3 transition-[border-color,box-shadow] ${
        checked
          ? "border-[#087cec] ring-3 ring-[#087cec]/15"
          : "border-[#cbd5dc] hover:border-[#aebdc7]"
      } ${disabled ? "cursor-not-allowed opacity-55" : ""}`}
    >
      <span className="flex items-start gap-2.5">
        <input
          type="radio"
          name="balance-adjustment"
          value={value}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          required
          className="mt-0.5 size-4 accent-[#087cec]"
        />
        <span>
          <span className="block text-sm font-medium">{title}</span>
          <span className="mt-0.5 block text-xs text-muted-foreground">{description}</span>
        </span>
      </span>
    </label>
  );
}

function RequiredLabel({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return (
    <Label htmlFor={htmlFor} className="gap-0.5">
      {children}
      <span className="text-destructive" aria-hidden="true">
        *
      </span>
    </Label>
  );
}

function FieldError({ id, message }: { id: string; message: string }) {
  return (
    <p id={id} className="mt-1.5 text-xs text-destructive">
      {message}
    </p>
  );
}
