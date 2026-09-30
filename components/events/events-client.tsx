"use client";

import { PulseIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { EventDateRangePicker } from "@/components/events/event-date-range-picker";
import { useProjectWorkspace } from "@/components/projects/project-workspace-client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
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

export function EventsClient() {
  const { project, environment } = useProjectWorkspace();
  const inactive = environment.activatedAt === null;
  const [filter, setFilter] = useState<EventsFilter>({ status: "", period: "7d" });
  const [selected, setSelected] = useState<UsageOperation | null>(null);
  const events = useEvents(
    { projectId: project.id, environment: environment.name },
    filter,
    !inactive,
  );
  const rows = events.data?.pages.flatMap((page) => page.operations) ?? [];
  useEventStream(
    { projectId: project.id, environment: environment.name },
    filter,
    !inactive && filter.period !== "custom",
  );

  return (
    <div className="mx-auto max-w-[1160px] px-5 py-8 sm:px-8 sm:py-11">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-bricolage-grotesque)] text-[28px] font-semibold tracking-[-0.04em]">
            Events
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Processed and blocked usage operations in this environment.
          </p>
        </div>
        {!inactive ? <EventFilters filter={filter} onChange={setFilter} /> : null}
      </div>

      {inactive ? (
        <section className="mt-7 rounded-xl border border-border bg-card px-5 py-7">
          <h2 className="text-sm font-semibold">Live is not active</h2>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Activate Live before inspecting production events.
          </p>
        </section>
      ) : events.isPending ? (
        <EventListSkeleton />
      ) : events.isError ? (
        <LoadError onRetry={() => events.refetch()} />
      ) : rows.length === 0 ? (
        <EmptyEvents filtered={Boolean(filter.status) || filter.period !== "7d"} />
      ) : (
        <section className="mt-7 overflow-hidden rounded-xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] border-collapse text-left text-sm">
              <thead className="border-b border-border bg-secondary/60 text-xs text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Customer ID</th>
                  <th className="px-5 py-3 font-medium">Meter key</th>
                  <th className="px-5 py-3 font-medium">Quantity</th>
                  <th className="px-5 py-3 font-medium">Replays</th>
                  <th className="px-5 py-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((operation) => (
                  <OperationRow
                    key={operation.id}
                    operation={operation}
                    onOpen={() => setSelected(operation)}
                  />
                ))}
              </tbody>
            </table>
          </div>
          {events.hasNextPage ? (
            <div className="border-t border-border px-5 py-4 text-center">
              <Button
                variant="secondary"
                size="compact"
                onClick={() => events.fetchNextPage()}
                disabled={events.isFetchingNextPage}
              >
                {events.isFetchingNextPage ? "Loading…" : "Load more"}
              </Button>
            </div>
          ) : null}
        </section>
      )}

      {selected ? (
        <OperationDialog operation={selected} onClose={() => setSelected(null)} />
      ) : null}
    </div>
  );
}

function EventFilters({
  filter,
  onChange,
}: {
  filter: EventsFilter;
  onChange: (filter: EventsFilter) => void;
}) {
  return (
    <div className="grid w-full grid-cols-1 gap-3 min-[480px]:grid-cols-2 sm:w-auto">
      <Select
        value={filter.status || "all"}
        onValueChange={(value) =>
          onChange({
            ...filter,
            status: value === "all" ? "" : (value as EventsFilter["status"]),
          })
        }
      >
        <SelectTrigger className="h-11 w-full sm:w-44" aria-label="Event status">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All outcomes</SelectItem>
          <SelectItem value="accepted">Processed</SelectItem>
          <SelectItem value="denied">Blocked</SelectItem>
        </SelectContent>
      </Select>
      <EventDateRangePicker filter={filter} onChange={onChange} />
    </div>
  );
}

function OperationRow({
  operation,
  onOpen,
}: {
  operation: UsageOperation;
  onOpen: () => void;
}) {
  return (
    <tr className="relative transition-colors hover:bg-secondary/45 focus-within:bg-secondary/45 focus-within:ring-2 focus-within:ring-ring focus-within:ring-inset">
      <td className="px-5 py-4">
        <button
          type="button"
          onClick={onOpen}
          aria-label={`Inspect ${operation.status} usage operation ${operation.id}`}
          className="after:absolute after:inset-0 focus-visible:outline-none"
        >
          <StatusBadge status={operation.status} />
        </button>
      </td>
      <td className="px-5 py-4 font-mono text-xs">{operation.customerId}</td>
      <td className="px-5 py-4 font-mono text-xs">{operation.meterKey}</td>
      <td className="px-5 py-4 tabular-nums">{operation.quantity.toLocaleString()}</td>
      <td className="px-5 py-4 tabular-nums text-muted-foreground">{operation.replayCount}</td>
      <td className="px-5 py-4 text-muted-foreground">{formatDateTime(operation.createdAt)}</td>
    </tr>
  );
}

function StatusBadge({ status }: { status: UsageOperation["status"] }) {
  return (
    <span
      className={
        status === "accepted"
          ? "rounded-full bg-emerald-500/12 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400"
          : "rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive"
      }
    >
      {status === "accepted" ? "Processed" : "Blocked"}
    </span>
  );
}

function OperationDialog({
  operation,
  onClose,
}: {
  operation: UsageOperation;
  onClose: () => void;
}) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogTitle>Usage operation</DialogTitle>
        <DialogDescription>
          Inspect the persisted decision and balance effect for this request.
        </DialogDescription>
        <dl className="mt-3 grid gap-px overflow-hidden rounded-lg border border-border bg-border text-sm sm:grid-cols-2">
          <Detail
            label="Outcome"
            value={operation.status === "accepted" ? "Processed" : "Blocked"}
          />
          <Detail label="Operation ID" value={operation.id} mono />
          <Detail label="Customer ID" value={operation.customerId} mono />
          <Detail label="Meter key" value={operation.meterKey} mono />
          <Detail label="Meter type" value={operation.meterType} />
          <Detail label="Quantity" value={operation.quantity.toLocaleString()} />
          <Detail label="Balance debited" value={operation.balanceDebited.toLocaleString()} />
          <Detail
            label="Remaining balance"
            value={operation.remainingBalance?.toLocaleString() ?? "Not applicable"}
          />
          <Detail label="Denial reason" value={operation.denialReason ?? "Not applicable"} />
          <Detail label="Billable" value={operation.billable ? "Yes" : "No"} />
          <Detail label="Idempotent replays" value={operation.replayCount.toString()} />
          <Detail
            label="Last replayed"
            value={
              operation.lastReplayedAt ? formatDateTime(operation.lastReplayedAt) : "Never"
            }
          />
          <Detail label="Created" value={formatDateTime(operation.createdAt)} />
        </dl>
      </DialogContent>
    </Dialog>
  );
}

function Detail({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="min-w-0 bg-card px-4 py-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd
        className={`mt-1 break-words capitalize ${mono ? "font-mono text-xs normal-case" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}

function EmptyEvents({ filtered }: { filtered: boolean }) {
  return (
    <section className="mt-7 grid min-h-72 place-items-center rounded-xl border border-dashed border-border bg-card px-5 py-10 text-center">
      <div className="max-w-md">
        <span className="mx-auto grid size-10 place-items-center rounded-lg bg-secondary text-muted-foreground">
          <PulseIcon className="size-5" />
        </span>
        <h2 className="mt-4 text-sm font-semibold">
          {filtered ? "No matching events" : "No events yet"}
        </h2>
        <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
          {filtered
            ? "Choose another outcome or time range."
            : "Processed and blocked usage operations will appear here."}
        </p>
      </div>
    </section>
  );
}

function LoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <section className="mt-7 rounded-xl border border-border bg-card px-5 py-8 text-center">
      <h2 className="text-sm font-semibold">Events could not be loaded</h2>
      <Button className="mt-4" variant="secondary" size="compact" onClick={onRetry}>
        Try again
      </Button>
    </section>
  );
}

function EventListSkeleton() {
  return (
    <section className="mt-7 space-y-px overflow-hidden rounded-xl border border-border bg-border">
      {["first", "second", "third", "fourth", "fifth"].map((row) => (
        <div key={row} className="grid grid-cols-6 gap-5 bg-card px-5 py-5">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-4 w-32" />
        </div>
      ))}
    </section>
  );
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
