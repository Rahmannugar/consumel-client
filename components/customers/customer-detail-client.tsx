"use client";

import { ArrowLeftIcon, PencilSimpleIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";
import { CustomerFormDialog } from "@/components/customers/customer-form-dialog";
import { useProjectWorkspace } from "@/components/projects/project-workspace-client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCustomer } from "@/lib/customers/useCustomer";

export function CustomerDetailClient({ customerId }: { customerId: string }) {
  const { project, environment } = useProjectWorkspace();
  const inactive = environment.activatedAt === null;
  const customer = useCustomer(
    { projectId: project.id, environment: environment.name },
    customerId,
    !inactive,
  );
  const [editing, setEditing] = useState(false);
  const listHref = `/dashboard/${project.slug}/customers`;

  if (inactive) {
    return (
      <div className="mx-auto max-w-[1040px] px-5 py-8 sm:px-8 sm:py-11">
        <Button asChild variant="quiet" size="compact">
          <Link href={listHref}>
            <ArrowLeftIcon />
            Customers
          </Link>
        </Button>
        <p className="mt-8 text-sm font-medium">Activate Live to view production customers.</p>
      </div>
    );
  }
  if (customer.isPending) return <CustomerDetailSkeleton />;
  if (customer.isError) {
    return (
      <div className="mx-auto max-w-[1040px] px-5 py-8 text-center sm:px-8 sm:py-11">
        <h1 className="text-lg font-semibold">Customer could not be loaded</h1>
        <div className="mt-5 flex justify-center gap-2">
          <Button variant="secondary" size="compact" onClick={() => customer.refetch()}>
            Try again
          </Button>
          <Button asChild variant="quiet" size="compact">
            <Link href={listHref}>Back to customers</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1040px] px-5 py-8 sm:px-8 sm:py-11">
      <Button asChild variant="quiet" size="compact" className="-ml-2">
        <Link href={listHref}>
          <ArrowLeftIcon />
          Customers
        </Link>
      </Button>
      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate font-[family-name:var(--font-bricolage-grotesque)] text-[28px] font-semibold tracking-[-0.04em]">
            {customer.data.name ?? customer.data.customerId}
          </h1>
          <code className="mt-1.5 block break-all font-mono text-xs text-muted-foreground">
            {customer.data.customerId}
          </code>
        </div>
        <Button size="compact" variant="secondary" onClick={() => setEditing(true)}>
          <PencilSimpleIcon />
          Edit customer
        </Button>
      </div>

      <section className="mt-7 overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border px-5 py-4 sm:px-6">
          <h2 className="text-sm font-semibold">Customer details</h2>
        </div>
        <dl className="grid gap-px bg-border sm:grid-cols-2">
          <Detail label="Name" value={customer.data.name ?? "Not provided"} />
          <Detail label="Email" value={customer.data.email ?? "Not provided"} />
          <Detail label="Plan" value={customer.data.metadata.plan ?? "Not provided"} />
          <Detail label="Country" value={customer.data.metadata.country ?? "Not provided"} />
          <Detail label="Location" value={customer.data.metadata.location ?? "Not provided"} />
          <Detail label="Created" value={formatDateTime(customer.data.createdAt)} />
        </dl>
      </section>

      {editing ? (
        <CustomerFormDialog
          customer={customer.data}
          onClose={() => setEditing(false)}
          onSaved={() => setEditing(false)}
        />
      ) : null}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card px-5 py-5 sm:px-6">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1.5 break-words text-sm font-medium">{value}</dd>
    </div>
  );
}

function CustomerDetailSkeleton() {
  return (
    <div className="mx-auto max-w-[1040px] space-y-6 px-5 py-8 sm:px-8 sm:py-11">
      <Skeleton className="h-8 w-28" />
      <Skeleton className="h-10 w-72" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
