"use client";

import { PlusIcon, UsersIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ListSearch } from "@/components/application/list-search";
import { CustomerFormDialog } from "@/components/customers/customer-form-dialog";
import { useProjectWorkspace } from "@/components/projects/project-workspace-client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Customer } from "@/lib/customers/customers.types";
import { useCustomers } from "@/lib/customers/useCustomers";
import { useDebouncedSearch } from "@/lib/search/use-debounced-search";

export function CustomersClient() {
  const router = useRouter();
  const { project, environment } = useProjectWorkspace();
  const inactive = environment.activatedAt === null;
  const context = { projectId: project.id, environment: environment.name };
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedSearch(search);
  const customers = useCustomers(context, !inactive, debouncedSearch);
  const [creating, setCreating] = useState(false);
  const rows = customers.data?.pages.flatMap((page) => page.customers) ?? [];

  function customerHref(customerId: string) {
    return `/dashboard/${project.slug}/customers/${encodeURIComponent(customerId)}`;
  }

  return (
    <div className="mx-auto max-w-[1160px] px-5 py-8 sm:px-8 sm:py-11">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-bricolage-grotesque)] text-[28px] font-semibold tracking-[-0.04em]">
            Customers
          </h1>
        </div>
        {!inactive ? (
          <Button size="compact" onClick={() => setCreating(true)}>
            <PlusIcon />
            Create customer
          </Button>
        ) : null}
      </div>

      {!inactive ? (
        <ListSearch
          value={search}
          onChange={setSearch}
          label="Search customers"
          placeholder="Search by ID, name, or email"
        />
      ) : null}

      {inactive ? (
        <InactiveEnvironment projectSlug={project.slug} />
      ) : customers.isPending ? (
        <CustomerListSkeleton />
      ) : customers.isError ? (
        <LoadError onRetry={() => customers.refetch()} />
      ) : rows.length === 0 ? (
        debouncedSearch ? (
          <NoCustomerResults />
        ) : (
          <EmptyCustomers onCreate={() => setCreating(true)} />
        )
      ) : (
        <section className="mt-7 overflow-hidden rounded-xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead className="border-b border-border bg-secondary/60 text-xs text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Customer ID</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Plan</th>
                  <th className="px-5 py-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((customer) => (
                  <CustomerRow
                    key={customer.customerId}
                    customer={customer}
                    href={customerHref(customer.customerId)}
                  />
                ))}
              </tbody>
            </table>
          </div>
          {customers.hasNextPage ? (
            <div className="border-t border-border px-5 py-4 text-center">
              <Button
                variant="secondary"
                size="compact"
                onClick={() => customers.fetchNextPage()}
                disabled={customers.isFetchingNextPage}
              >
                {customers.isFetchingNextPage ? "Loading…" : "Load more"}
              </Button>
            </div>
          ) : null}
        </section>
      )}

      {creating ? (
        <CustomerFormDialog
          onClose={() => setCreating(false)}
          onSaved={(customer) => {
            setCreating(false);
            router.push(customerHref(customer.customerId));
          }}
        />
      ) : null}
    </div>
  );
}

function NoCustomerResults() {
  return (
    <section className="mt-7 rounded-xl border border-border bg-card px-5 py-10 text-center">
      <h2 className="text-sm font-semibold">No customers found</h2>
      <p className="mt-1.5 text-xs text-muted-foreground">
        Try a different customer ID, name, or email.
      </p>
    </section>
  );
}

function CustomerRow({ customer, href }: { customer: Customer; href: string }) {
  return (
    <tr className="relative transition-colors hover:bg-secondary/45 focus-within:bg-secondary/45 focus-within:ring-2 focus-within:ring-ring focus-within:ring-inset">
      <td className="px-5 py-4 font-medium text-foreground">
        <Link
          href={href}
          aria-label={`Open customer ${customer.name ?? customer.customerId}`}
          className="after:absolute after:inset-0 focus-visible:outline-none"
        >
          {customer.name ?? "—"}
        </Link>
      </td>
      <td className="px-5 py-4">
        <code className="font-mono text-xs text-muted-foreground">{customer.customerId}</code>
      </td>
      <td className="px-5 py-4 text-muted-foreground">{customer.email ?? "—"}</td>
      <td className="px-5 py-4">
        {customer.metadata.plan ? (
          <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium">
            {customer.metadata.plan}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </td>
      <td className="px-5 py-4 text-muted-foreground">{formatDate(customer.createdAt)}</td>
    </tr>
  );
}

function EmptyCustomers({ onCreate }: { onCreate: () => void }) {
  return (
    <section className="mt-7 grid min-h-72 place-items-center rounded-xl border border-dashed border-border bg-card px-5 py-10 text-center">
      <div className="max-w-md">
        <span className="mx-auto grid size-10 place-items-center rounded-lg bg-secondary text-muted-foreground">
          <UsersIcon className="size-5" />
        </span>
        <h2 className="mt-4 text-sm font-semibold">No customers yet</h2>
        <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
          Create a customer here or send one through the API using this environment’s key.
        </p>
        <Button className="mt-5" size="compact" onClick={onCreate}>
          <PlusIcon />
          Create customer
        </Button>
      </div>
    </section>
  );
}

function InactiveEnvironment({ projectSlug }: { projectSlug: string }) {
  return (
    <section className="mt-7 rounded-xl border border-border bg-card px-5 py-7 sm:px-6">
      <h2 className="text-sm font-semibold">Live is not active</h2>
      <p className="mt-1.5 max-w-xl text-xs leading-5 text-muted-foreground">
        Activate Live before creating or viewing production customers. Sandbox data remains
        separate.
      </p>
      <Button asChild className="mt-5" size="compact">
        <Link href={`/dashboard/${projectSlug}/project-settings`}>Open project settings</Link>
      </Button>
    </section>
  );
}

function LoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <section className="mt-7 rounded-xl border border-border bg-card px-5 py-8 text-center">
      <h2 className="text-sm font-semibold">Customers could not be loaded</h2>
      <Button className="mt-4" variant="secondary" size="compact" onClick={onRetry}>
        Try again
      </Button>
    </section>
  );
}

function CustomerListSkeleton() {
  const rows = ["first", "second", "third", "fourth", "fifth"];
  return (
    <section className="mt-7 space-y-px overflow-hidden rounded-xl border border-border bg-border">
      {rows.map((row) => (
        <div key={row} className="grid grid-cols-5 gap-5 bg-card px-5 py-5">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-44" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </section>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
