"use client";

import { ChartLineUpIcon } from "@phosphor-icons/react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { EventDateRangePicker } from "@/components/events/event-date-range-picker";
import { useProjectWorkspace } from "@/components/projects/project-workspace-client";
import { Button } from "@/components/ui/button";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { useUsageAnalytics } from "@/lib/analytics/useUsageAnalytics";
import type { EventsFilter } from "@/lib/events/events.types";

type AnalyticsScope = {
  customerId?: string;
  meterKey?: string;
};

const chartConfig = {
  acceptedQuantity: { label: "Usage volume", color: "#087cec" },
} satisfies ChartConfig;

export function UsageAnalyticsPanel({
  title,
  description,
  filter,
  onFilterChange,
  scope = {},
}: {
  title: string;
  description: string;
  filter: EventsFilter;
  onFilterChange: (filter: EventsFilter) => void;
  scope?: AnalyticsScope;
}) {
  const { project, environment } = useProjectWorkspace();
  const analytics = useUsageAnalytics(
    { projectId: project.id, environment: environment.name },
    { ...filter, ...scope },
    environment.activatedAt !== null,
  );
  const hasAllowedUsage =
    analytics.data !== undefined && analytics.data.summary.acceptedQuantity > 0;

  return (
    <section className="mt-7 overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex flex-col gap-4 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <h2 className="text-sm font-semibold">{title}</h2>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </div>
        <EventDateRangePicker filter={filter} onChange={onFilterChange} />
      </div>

      {analytics.isPending ? (
        <AnalyticsSkeleton />
      ) : analytics.isError ? (
        <div className="px-5 py-10 text-center sm:px-6">
          <p className="text-sm font-medium">Usage analytics could not be loaded</p>
          <Button
            size="compact"
            variant="secondary"
            className="mt-4"
            onClick={() => analytics.refetch()}
          >
            Try again
          </Button>
        </div>
      ) : analytics.data ? (
        <>
          <dl className="grid gap-px border-b border-border bg-border sm:grid-cols-3">
            <Metric label="Usage volume" value={analytics.data.summary.acceptedQuantity} />
            <Metric
              label="Allowed requests"
              value={analytics.data.summary.acceptedOperations}
            />
            <Metric label="Blocked requests" value={analytics.data.summary.deniedOperations} />
          </dl>
          {hasAllowedUsage ? (
            <div className="px-2 pt-6 pb-4 sm:px-5">
              <ChartContainer
                config={chartConfig}
                className="h-64"
                aria-label="Usage volume over time"
              >
                <BarChart
                  data={analytics.data.buckets}
                  margin={{ left: 0, right: 12, top: 8 }}
                  accessibilityLayer
                >
                  <CartesianGrid
                    vertical={false}
                    stroke="var(--app-border)"
                    strokeDasharray="3 3"
                  />
                  <XAxis
                    dataKey="start"
                    axisLine={false}
                    tickLine={false}
                    minTickGap={32}
                    tickFormatter={(value: string) =>
                      formatBucketLabel(value, analytics.data.interval)
                    }
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    width={44}
                    tickFormatter={compactNumber}
                  />
                  <ChartTooltip
                    cursor={{ stroke: "var(--app-border)" }}
                    content={
                      <ChartTooltipContent
                        config={chartConfig}
                        labelFormatter={(value) =>
                          formatBucketTooltip(String(value), analytics.data.interval)
                        }
                      />
                    }
                  />
                  <Bar
                    dataKey="acceptedQuantity"
                    fill="var(--color-acceptedQuantity)"
                    radius={[4, 4, 0, 0]}
                    isAnimationActive={false}
                  />
                </BarChart>
              </ChartContainer>
            </div>
          ) : (
            <div className="px-5 py-12 text-center sm:px-6">
              <span className="mx-auto grid size-10 place-items-center rounded-lg bg-secondary text-muted-foreground">
                <ChartLineUpIcon className="size-5" />
              </span>
              <p className="mt-3 text-sm font-medium">No allowed usage in this range</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Blocked requests do not contribute to usage volume.
              </p>
            </div>
          )}
        </>
      ) : null}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-card px-5 py-4 sm:px-6">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-xl font-semibold tracking-tight tabular-nums">
        {value.toLocaleString()}
      </dd>
    </div>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-5 px-5 py-5 sm:px-6">
      <div className="grid gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <Skeleton key={item} className="h-16 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-lg" />
    </div>
  );
}

function compactNumber(value: number) {
  return new Intl.NumberFormat(undefined, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatBucketLabel(value: string, interval: "hour" | "day") {
  return new Intl.DateTimeFormat(
    undefined,
    interval === "hour" ? { hour: "numeric" } : { month: "short", day: "numeric" },
  ).format(new Date(value));
}

function formatBucketTooltip(value: string, interval: "hour" | "day") {
  return new Intl.DateTimeFormat(
    undefined,
    interval === "hour" ? { dateStyle: "medium", timeStyle: "short" } : { dateStyle: "medium" },
  ).format(new Date(value));
}
