"use client";

import { ArrowRightIcon, PulseIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";
import {
  UsageOperationDialog,
  UsageOutcomeBadge,
} from "@/components/events/usage-operation-details";
import { useProjectWorkspace } from "@/components/projects/project-workspace-client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { EventsFilter, UsageOperation } from "@/lib/events/events.types";
import { useEventStream } from "@/lib/events/useEventStream";
import { useEvents } from "@/lib/events/useEvents";

const recentActivityFilter: EventsFilter = { status: "", period: "7d" };
const recentActivityPageSize = 6;

export function ProjectRecentActivity() {
  const { project, environment } = useProjectWorkspace();
  const [selected, setSelected] = useState<UsageOperation | null>(null);
  const context = { projectId: project.id, environment: environment.name };
  const events = useEvents(context, recentActivityFilter, true, recentActivityPageSize);
  useEventStream(context, recentActivityFilter, true, recentActivityPageSize);
  const operations = events.data?.pages[0]?.operations ?? [];

  return (
    <section className="mt-7 overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
        <div>
          <h2 className="text-sm font-semibold">Recent activity</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Latest allowed and blocked usage requests from the last 7 days.
          </p>
        </div>
        <Button asChild size="compact" variant="quiet" className="shrink-0">
          <Link href={`/dashboard/${project.slug}/events`}>
            View all
            <ArrowRightIcon />
          </Link>
        </Button>
      </div>

      {events.isPending ? (
        <ActivitySkeleton />
      ) : events.isError ? (
        <div className="px-5 py-9 text-center sm:px-6">
          <p className="text-sm font-medium">Recent activity could not be loaded</p>
          <Button
            className="mt-4"
            size="compact"
            variant="secondary"
            onClick={() => events.refetch()}
          >
            Try again
          </Button>
        </div>
      ) : operations.length === 0 ? (
        <div className="px-5 py-12 text-center sm:px-6">
          <span className="mx-auto grid size-10 place-items-center rounded-lg bg-secondary text-muted-foreground">
            <PulseIcon className="size-5" />
          </span>
          <p className="mt-3 text-sm font-medium">No recent activity</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Usage requests will appear here after they are allowed or blocked.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {operations.map((operation) => (
            <li key={operation.id}>
              <button
                type="button"
                className="w-full px-5 py-4 text-left transition-colors hover:bg-secondary/45 focus-visible:bg-secondary/45 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring sm:px-6"
                onClick={() => setSelected(operation)}
                aria-label={`Inspect usage operation ${operation.id}`}
              >
                <div className="flex items-center justify-between gap-4">
                  <UsageOutcomeBadge status={operation.status} />
                  <time
                    className="text-xs text-muted-foreground"
                    dateTime={operation.createdAt}
                  >
                    {formatDateTime(operation.createdAt)}
                  </time>
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-x-5 gap-y-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                  <ActivityValue label="Customer ID" value={operation.customerId} mono />
                  <ActivityValue label="Meter key" value={operation.meterKey} mono />
                  <ActivityValue label="Quantity" value={formatQuantity(operation.quantity)} />
                </dl>
              </button>
            </li>
          ))}
        </ul>
      )}

      {selected ? (
        <UsageOperationDialog operation={selected} onClose={() => setSelected(null)} />
      ) : null}
    </section>
  );
}

function ActivityValue({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] text-muted-foreground">{label}</dt>
      <dd className={`mt-1 truncate text-sm ${mono ? "font-mono text-xs" : "tabular-nums"}`}>
        {value}
      </dd>
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <div className="divide-y divide-border">
      {[0, 1, 2].map((row) => (
        <div key={row} className="space-y-3 px-5 py-4 sm:px-6">
          <div className="flex justify-between gap-4">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-4 w-28" />
          </div>
          <div className="grid grid-cols-3 gap-5">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

function formatQuantity(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
