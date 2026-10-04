"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { toast } from "sonner";
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
import { createMeterSchema, updateMeterSchema } from "@/lib/meters/meter.validation";
import { meterErrorMessage } from "@/lib/meters/meters.service";
import type { Meter, MeterType } from "@/lib/meters/meters.types";
import { useCreateMeter } from "@/lib/meters/useCreateMeter";
import { useUpdateMeter } from "@/lib/meters/useUpdateMeter";

export function MeterFormDialog({
  meter,
  onClose,
  onSaved,
}: {
  meter?: Meter;
  onClose: () => void;
  onSaved: (meter: Meter) => void;
}) {
  const { project, environment } = useProjectWorkspace();
  const context = { projectId: project.id, environment: environment.name } as const;
  const create = useCreateMeter(context);
  const update = useUpdateMeter(context, meter?.meterKey ?? "");
  const isEditing = meter !== undefined;
  const isPending = create.isPending || update.isPending;
  const [values, setValues] = useState({
    meterKey: meter?.meterKey ?? "",
    name: meter?.name ?? "",
    description: meter?.description ?? "",
    type: meter?.type ?? ("" as MeterType | ""),
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = isEditing
      ? updateMeterSchema.safeParse(values)
      : createMeterSchema.safeParse(values);
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
      const savedMeter = isEditing
        ? await update.mutateAsync(parsed.data)
        : await create.mutateAsync(createMeterSchema.parse(values));
      toast.success(isEditing ? "Meter updated" : "Meter created");
      onSaved(savedMeter);
    } catch (error) {
      toast.error(meterErrorMessage(error));
    }
  }

  function updateField(field: "meterKey" | "name" | "description", value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: "" }));
  }

  return (
    <Dialog open onOpenChange={(open) => !open && !isPending && onClose()}>
      <DialogContent className="max-h-[calc(100svh-2rem)] overflow-y-auto sm:max-w-xl">
        <DialogTitle>{isEditing ? "Edit meter" : "Create meter"}</DialogTitle>
        <DialogDescription>
          {isEditing
            ? "Update the name and description shared by Sandbox and Live. The meter key and billing type cannot be changed."
            : "The meter key is the stable identifier used by your application and cannot be changed."}
        </DialogDescription>
        <form className="mt-5 space-y-5" onSubmit={submit} noValidate>
          {isEditing ? (
            <div className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-muted/30 p-4">
              <ReadOnlyDefinition label="Meter key" value={meter.meterKey} code />
              <ReadOnlyDefinition label="Type" value={meter.type} capitalize />
            </div>
          ) : (
            <RequiredField
              id="meter-key"
              label="Meter key"
              value={values.meterKey}
              onChange={(value) => updateField("meterKey", value)}
              error={fieldErrors.meterKey}
              disabled={isPending}
              placeholder="api_calls"
            />
          )}
          <RequiredField
            id="meter-name"
            label="Name"
            value={values.name}
            onChange={(value) => updateField("name", value)}
            error={fieldErrors.name}
            disabled={isPending}
            placeholder="API calls"
          />
          <div>
            <Label htmlFor="meter-description">Description</Label>
            <Input
              id="meter-description"
              className="mt-2"
              value={values.description}
              onChange={(event) => updateField("description", event.target.value)}
              disabled={isPending}
              placeholder="Requests processed by your API."
              aria-invalid={Boolean(fieldErrors.description)}
              aria-describedby={fieldErrors.description ? "meter-description-error" : undefined}
            />
            {fieldErrors.description ? (
              <FieldError id="meter-description-error" message={fieldErrors.description} />
            ) : null}
          </div>
          {!isEditing ? (
            <div>
              <Label htmlFor="meter-type" className="gap-0.5">
                Type
                <span className="text-destructive" aria-hidden="true">
                  *
                </span>
              </Label>
              <Select
                value={values.type || undefined}
                onValueChange={(value) => {
                  setValues((current) => ({ ...current, type: value as MeterType }));
                  setFieldErrors((current) => ({ ...current, type: "" }));
                }}
                disabled={isPending}
                required
              >
                <SelectTrigger
                  id="meter-type"
                  className="mt-2 w-full"
                  aria-required="true"
                  aria-invalid={Boolean(fieldErrors.type)}
                  aria-describedby={fieldErrors.type ? "meter-type-error" : "meter-type-help"}
                >
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prepaid">Prepaid</SelectItem>
                  <SelectItem value="postpaid">Postpaid</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
              <p id="meter-type-help" className="mt-1.5 text-xs text-muted-foreground">
                Choose how usage is billed.
              </p>
              {fieldErrors.type ? (
                <FieldError id="meter-type-error" message={fieldErrors.type} />
              ) : null}
            </div>
          ) : null}
          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="quiet"
              size="compact"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" size="compact" disabled={isPending}>
              {isPending
                ? isEditing
                  ? "Saving…"
                  : "Creating…"
                : isEditing
                  ? "Save changes"
                  : "Create meter"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ReadOnlyDefinition({
  label,
  value,
  code = false,
  capitalize = false,
}: {
  label: string;
  value: string;
  code?: boolean;
  capitalize?: boolean;
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p
        className={`mt-1 truncate text-sm ${code ? "font-mono" : ""} ${capitalize ? "capitalize" : ""}`}
        title={value}
      >
        {value}
      </p>
    </div>
  );
}

function RequiredField({
  id,
  label,
  value,
  onChange,
  error,
  disabled,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled: boolean;
  placeholder: string;
}) {
  return (
    <div>
      <Label htmlFor={id} className="gap-0.5">
        {label}
        <span className="text-destructive" aria-hidden="true">
          *
        </span>
      </Label>
      <Input
        id={id}
        className="mt-2"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        required
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error ? <FieldError id={`${id}-error`} message={error} /> : null}
    </div>
  );
}

function FieldError({ id, message }: { id: string; message: string }) {
  return (
    <p id={id} className="mt-1.5 text-xs text-destructive">
      {message}
    </p>
  );
}
