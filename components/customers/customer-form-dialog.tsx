"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { toast } from "sonner";
import { CountryCombobox } from "@/components/customers/country-combobox";
import { useProjectWorkspace } from "@/components/projects/project-workspace-client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type CustomerFormValues,
  createCustomerSchema,
  customerFieldsSchema,
} from "@/lib/customers/customer.validation";
import { customerErrorMessage } from "@/lib/customers/customers.service";
import type {
  CreateCustomerInput,
  Customer,
  CustomerFields,
} from "@/lib/customers/customers.types";
import { useCreateCustomer, useUpdateCustomer } from "@/lib/customers/useCustomerMutations";

type CustomerFormDialogProps = {
  customer?: Customer;
  onClose: () => void;
  onSaved: (customer: Customer) => void;
};

export function CustomerFormDialog({ customer, onClose, onSaved }: CustomerFormDialogProps) {
  const { project, environment } = useProjectWorkspace();
  const context = { projectId: project.id, environment: environment.name };
  const create = useCreateCustomer(context);
  const update = useUpdateCustomer(context, customer?.customerId ?? "");
  const mutation = customer ? update : create;
  const [values, setValues] = useState<CustomerFormValues>(() => formValues(customer));
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = (customer ? customerFieldsSchema : createCustomerSchema).safeParse(values);
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
    const fields = customerFields(parsed.data);
    try {
      const saved = customer
        ? await update.mutateAsync(fields)
        : await create.mutateAsync({
            ...fields,
            customerId: (parsed.data as { customerId: string }).customerId,
          } satisfies CreateCustomerInput);
      toast.success(customer ? "Customer updated" : "Customer created");
      onSaved(saved);
    } catch (error) {
      toast.error(customerErrorMessage(error));
    }
  }

  function updateField(field: keyof CustomerFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: "" }));
  }

  return (
    <Dialog open onOpenChange={(open) => !open && !mutation.isPending && onClose()}>
      <DialogContent className="max-h-[calc(100svh-2rem)] overflow-y-auto sm:max-w-xl">
        <DialogTitle>{customer ? "Edit customer" : "Create customer"}</DialogTitle>
        <DialogDescription>
          {customer
            ? "Update the customer details stored in this environment."
            : "Use the stable ID from your application. Sandbox and Live customers stay separate."}
        </DialogDescription>
        <form className="mt-5 space-y-5" onSubmit={submit} noValidate>
          <Field
            id="customer-id"
            label="Customer ID"
            value={values.customerId ?? customer?.customerId ?? ""}
            onChange={(value) => updateField("customerId", value)}
            error={fieldErrors.customerId}
            disabled={Boolean(customer) || mutation.isPending}
            required={!customer}
            placeholder="user_123"
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              id="customer-name"
              label="Name"
              value={values.name ?? ""}
              onChange={(value) => updateField("name", value)}
              error={fieldErrors.name}
              disabled={mutation.isPending}
              placeholder="Jordan Lee"
            />
            <Field
              id="customer-email"
              label="Email"
              type="email"
              value={values.email ?? ""}
              onChange={(value) => updateField("email", value)}
              error={fieldErrors.email}
              disabled={mutation.isPending}
              placeholder="jordan@example.com"
            />
          </div>
          <div>
            <p className="text-sm font-medium">Metadata</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Consumel supports plan, country, and location metadata.
            </p>
            <div className="mt-3 grid gap-4 sm:grid-cols-3">
              <Field
                id="customer-plan"
                label="Plan"
                value={values.plan ?? ""}
                onChange={(value) => updateField("plan", value)}
                error={fieldErrors.plan}
                disabled={mutation.isPending}
                placeholder="growth"
              />
              <CountryField
                id="customer-country"
                label="Country"
                value={values.country ?? ""}
                onChange={(value) => updateField("country", value)}
                error={fieldErrors.country}
                disabled={mutation.isPending}
              />
              <Field
                id="customer-location"
                label="Location"
                value={values.location ?? ""}
                onChange={(value) => updateField("location", value)}
                error={fieldErrors.location}
                disabled={mutation.isPending}
                placeholder="New York, NY"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="quiet"
              size="compact"
              onClick={onClose}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" size="compact" disabled={mutation.isPending}>
              {mutation.isPending
                ? customer
                  ? "Saving…"
                  : "Creating…"
                : customer
                  ? "Save changes"
                  : "Create customer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CountryField({
  id,
  label,
  value,
  onChange,
  error,
  disabled,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled: boolean;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <CountryCombobox
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        invalid={Boolean(error)}
        describedBy={error ? `${id}-error` : undefined}
      />
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
  disabled,
  required,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: "text" | "email";
  disabled: boolean;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <Label htmlFor={id} className="gap-0.5">
        {label}
        {required ? (
          <span className="text-destructive" aria-hidden="true">
            *
          </span>
        ) : null}
      </Label>
      <Input
        id={id}
        className="mt-2"
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        required={required}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function formValues(customer?: Customer): CustomerFormValues {
  return {
    customerId: customer?.customerId ?? "",
    name: customer?.name ?? "",
    email: customer?.email ?? "",
    plan: customer?.metadata.plan ?? "",
    country: customer?.metadata.country ?? "",
    location: customer?.metadata.location ?? "",
  };
}

function customerFields(values: Omit<CustomerFormValues, "customerId">): CustomerFields {
  const metadata = {
    ...(values.plan ? { plan: values.plan } : {}),
    ...(values.country ? { country: values.country } : {}),
    ...(values.location ? { location: values.location } : {}),
  };
  return {
    ...(values.name ? { name: values.name } : {}),
    ...(values.email ? { email: values.email } : {}),
    metadata,
  };
}
