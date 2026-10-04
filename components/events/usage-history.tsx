"use client";

import { PulseIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";
import {
  UsageOperationDialog,
  UsageOutcomeBadge,
} from "@/components/events/usage-operation-details";
import { useProjectWorkspace } from "@/components/projects/project-workspace-client";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { EventsFilter, UsageOperation } from "@/lib/events/events.types";
import { useEventStream } from "@/lib/events/useEventStream";
import { useEvents } from "@/lib/events/useEvents";

type UsageHistoryScope =
  | { customerId: string; meterKey?: never }
  | { customerId?: never; meterKey: string };

export function UsageHistory({
  scope,
  filter,
  onFilterChange,
}: {
  scope: UsageHistoryScope;
  filter: EventsFilter;
  onFilterChange: (filter: EventsFilter) => void;
}) {
  const { project, environment } = useProjectWorkspace();
  const [selected, setSelected] = useState<UsageOperation | null>(null);
  const operations = useEvents(
    { projectId: project.id, environment: environment.name },
    filter,
    environment.activatedAt !== null,
  );
  useEventStream(
    { projectId: project.id, environment: environment.name },
    filter,
    environment.activatedAt !== null && filter.period !== "custom",
  );
  const rows = operations.data?.pages.flatMap((page) => page.operations) ?? [];
  const secondaryLabel = scope.customerId ? "Meter" : "Customer";

  return (
    <section className="mt-7 overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex flex-col gap-4 border-b border-border px-5 py-4 sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div>
          <h2 className="text-sm font-semibold">Usage history</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Processed and blocked consumption requests for this{" "}
            {scope.customerId ? "customer" : "meter"}.
          </p>
        </div>
        <div className="w-full sm:w-44">
          <Select
            value={filter.status || "all"}
            onValueChange={(value) =>
              onFilterChange({
                ...filter,
                status: value === "all" ? "" : (value as EventsFilter["status"]),
              })
            }
          >
            <SelectTrigger className="h-11 w-full sm:w-44" aria-label="Usage outcome">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All outcomes</SelectItem>
              <SelectItem value="accepted">Processed</SelectItem>
              <SelectItem value="denied">Blocked</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {operations.isPending ? (
        <HistorySkeleton />
      ) : operations.isError ? (
        <div className="px-5 py-9 text-center sm:px-6">
          <p className="text-sm font-medium">Usage history could not be loaded</p>
          <Button
            size="compact"
            variant="secondary"
            className="mt-4"
            onClick={() => operations.refetch()}
          >
            Try again
          </Button>
        </div>
      ) : rows.length === 0 ? (
        <div className="px-5 py-10 text-center sm:px-6">
          <span className="mx-auto grid size-10 place-items-center rounded-lg bg-secondary text-muted-foreground">
            <PulseIcon className="size-5" />
          </span>
          <p className="mt-3 text-sm font-medium">No usage in this range</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Usage requests will appear here after they are processed or blocked.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-muted/45 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                <tr>
                  <th className="px-5 py-3 sm:px-6">Outcome</th>
                  <th className="px-5 py-3">{secondaryLabel}</th>
                  <th className="px-5 py-3">Quantity</th>
                  <th className="px-5 py-3">Balance effect</th>
                  <th className="px-5 py-3 sm:px-6">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((operation) => (
                  <tr
                    key={operation.id}
                    className="relative cursor-pointer transition-colors hover:bg-secondary/45 focus-within:bg-secondary/45 focus-within:ring-2 focus-within:ring-ring focus-within:ring-inset"
                  >
                    <td className="px-5 py-4 sm:px-6">
                      <button
                        type="button"
                        className="after:absolute after:inset-0 focus-visible:outline-none"
                        aria-label={`Inspect usage operation ${operation.id}`}
                        onClick={() => setSelected(operation)}
                      >
                        <UsageOutcomeBadge status={operation.status} />
                      </button>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs">
                      {scope.customerId ? operation.meterKey : operation.customerId}
                    </td>
                    <td className="px-5 py-4 tabular-nums">
                      {formatQuantity(operation.quantity)}
                    </td>
                    <td className="px-5 py-4 text-xs text-muted-foreground">
                      {operation.balanceDebited > 0
                        ? `−${formatQuantity(operation.balanceDebited)}`
                        : "No debit"}
                    </td>
                    <td className="px-5 py-4 text-xs text-muted-foreground sm:px-6">
                      {formatDateTime(operation.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-4 sm:px-6">
            <Button asChild size="compact" variant="quiet">
              <Link href={`/dashboard/${project.slug}/events`}>View all events</Link>
            </Button>
            {operations.hasNextPage ? (
              <Button
                size="compact"
                variant="secondary"
                disabled={operations.isFetchingNextPage}
                onClick={() => operations.fetchNextPage()}
              >
                {operations.isFetchingNextPage ? "Loading…" : "Load more"}
              </Button>
            ) : null}
          </div>
        </>
      )}

      {selected ? (
        <UsageOperationDialog operation={selected} onClose={() => setSelected(null)} />
      ) : null}
    </section>
  );
}

function HistorySkeleton() {
  return (
    <div className="space-y-px bg-border">
      {[0, 1, 2].map((row) => (
        <div key={row} className="grid grid-cols-4 gap-4 bg-card px-5 py-4 sm:px-6">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-32" />
        </div>
      ))}
    </div>
  );
}

function formatQuantity(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(value),
  );
}
