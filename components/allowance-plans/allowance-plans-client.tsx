"use client";

import { ArrowLeftIcon, PlusIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useProjectWorkspace } from "@/components/projects/project-workspace-client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAllowancePlans } from "@/lib/allowance-plans/useAllowancePlans";
import { allowanceIntervalLabel } from "@/lib/balances/allowances.format";
import { AllowancePlanFormDialog } from "./allowance-plan-form-dialog";

export function AllowancePlansClient() {
  const { project, environment } = useProjectWorkspace();
  const inactive = environment.activatedAt === null;
  const query = useAllowancePlans(
    { projectId: project.id, environment: environment.name },
    "",
    !inactive,
  );
  const [creating, setCreating] = useState(false);
  const router = useRouter();
  const rows = query.data?.pages.flatMap((page) => page.plans) ?? [];
  const baseHref = `/dashboard/${project.slug}/allowance-plans`;
  return (
    <div className="mx-auto max-w-[1160px] px-5 py-8 sm:px-8 sm:py-11">
      <Button asChild variant="quiet" size="compact" className="-ml-2 mb-6">
        <Link href={`/dashboard/${project.slug}/meters`}>
          <ArrowLeftIcon />
          Meters
        </Link>
      </Button>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-[family-name:var(--font-bricolage-grotesque)] text-[28px] font-semibold tracking-[-0.04em]">
          Allowance plans
        </h1>
        {!inactive ? (
          <Button size="compact" onClick={() => setCreating(true)}>
            <PlusIcon />
            Create plan
          </Button>
        ) : null}
      </div>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Reusable recurring allowances for your customers. Each plan grants units for one meter;
        assigning a plan does not charge a customer.
      </p>
      {inactive ? (
        <section className="mt-7 rounded-xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold">Live is not active</h2>
          <Button asChild className="mt-4" size="compact">
            <Link href={`/dashboard/${project.slug}/project-settings`}>
              Open project settings
            </Link>
          </Button>
        </section>
      ) : query.isPending ? (
        <Skeleton className="mt-7 h-56 w-full rounded-xl" />
      ) : query.isError ? (
        <section className="mt-7 rounded-xl border border-border bg-card p-8 text-center">
          <p role="alert" className="text-sm">
            Allowance plans could not be loaded.
          </p>
          <Button
            variant="secondary"
            size="compact"
            className="mt-4"
            onClick={() => query.refetch()}
          >
            Try again
          </Button>
        </section>
      ) : rows.length === 0 ? (
        <section className="mt-7 rounded-xl border border-dashed border-border bg-card px-5 py-12 text-center">
          <h2 className="text-sm font-semibold">No allowance plans yet</h2>
          <p className="mt-2 text-xs text-muted-foreground">
            Create a plan, then assign it from a customer’s balance.
          </p>
          <Button size="compact" className="mt-5" onClick={() => setCreating(true)}>
            Create plan
          </Button>
        </section>
      ) : (
        <section className="mt-7 overflow-hidden rounded-xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="border-b border-border bg-secondary/60 text-xs text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Plan</th>
                  <th className="px-5 py-3 font-medium">Meter</th>
                  <th className="px-5 py-3 font-medium">Units per renewal</th>
                  <th className="px-5 py-3 font-medium">Renewal interval</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((plan) => (
                  <tr
                    key={plan.id}
                    className="relative hover:bg-secondary/45 focus-within:ring-2 focus-within:ring-ring focus-within:ring-inset"
                  >
                    <td className="px-5 py-4">
                      <Link
                        className="font-medium after:absolute after:inset-0 focus-visible:outline-none"
                        href={`${baseHref}/${encodeURIComponent(plan.key)}`}
                      >
                        {plan.name}
                      </Link>
                      <code className="mt-1 block text-xs text-muted-foreground">
                        {plan.key}
                      </code>
                    </td>
                    <td className="px-5 py-4">
                      <code className="text-xs">{plan.meterKey}</code>
                    </td>
                    <td className="px-5 py-4 tabular-nums">{plan.quantity.toLocaleString()}</td>
                    <td className="px-5 py-4">Every {allowanceIntervalLabel(plan)}</td>
                    <td className="px-5 py-4 text-xs">
                      {plan.enabled ? "Issuing grants" : "Grants stopped"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {query.hasNextPage ? (
            <div className="border-t border-border p-4 text-center">
              <Button
                size="compact"
                variant="secondary"
                disabled={query.isFetchingNextPage}
                onClick={() => query.fetchNextPage()}
              >
                {query.isFetchingNextPage ? "Loading plans…" : "Load more plans"}
              </Button>
            </div>
          ) : null}
        </section>
      )}
      {creating ? (
        <AllowancePlanFormDialog
          key={`${project.id}:${environment.name}`}
          onClose={() => setCreating(false)}
          onSaved={(plan) => {
            setCreating(false);
            router.push(`${baseHref}/${encodeURIComponent(plan.key)}`);
          }}
        />
      ) : null}
    </div>
  );
}
