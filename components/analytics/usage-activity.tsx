"use client";

import { ChartLineUpIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { EventDateRangePicker } from "@/components/events/event-date-range-picker";
import { UsageHistory } from "@/components/events/usage-history";
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

type UsageScope =
  | { customerId: string; meterKey?: never }
  | { customerId?: never; meterKey: string };

const chartConfig = {
  acceptedQuantity: { label: "Processed", color: "#087cec" },
  deniedQuantity: { label: "Blocked", color: "#ef4444" },
} satisfies ChartConfig;

export function UsageActivity(scope: UsageScope) {
  const { project, environment } = useProjectWorkspace();
  const [filter, setFilter] = useState<EventsFilter>({
    status: "",
    period: "30d",
    ...scope,
  });
  const analytics = useUsageAnalytics(
    { projectId: project.id, environment: environment.name },
    filter,
    environment.activatedAt !== null,
  );
  const hasUsage =
    analytics.data !== undefined &&
    analytics.data.summary.acceptedOperations + analytics.data.summary.deniedOperations > 0;

  return (
    <>
      <section className="mt-7 overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex flex-col gap-4 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-sm font-semibold">Usage</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Processed and blocked quantity for this {scope.customerId ? "customer" : "meter"}.
            </p>
          </div>
          <EventDateRangePicker filter={filter} onChange={setFilter} />
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
              <Metric
                label="Processed quantity"
                value={analytics.data.summary.acceptedQuantity}
              />
              <Metric
                label="Processed requests"
                value={analytics.data.summary.acceptedOperations}
              />
              <Metric
                label="Blocked requests"
                value={analytics.data.summary.deniedOperations}
              />
            </dl>
            {hasUsage ? (
              <div className="px-2 pt-6 pb-4 sm:px-5">
                <ChartContainer
                  config={chartConfig}
                  className="h-64"
                  aria-label="Usage volume over time"
                >
                  <AreaChart
                    data={analytics.data.buckets}
                    margin={{ left: 0, right: 12, top: 8 }}
                    accessibilityLayer
                  >
                    <defs>
                      <linearGradient id="accepted-usage-fill" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="var(--color-acceptedQuantity)"
                          stopOpacity={0.35}
                        />
                        <stop
                          offset="95%"
                          stopColor="var(--color-acceptedQuantity)"
                          stopOpacity={0.03}
                        />
                      </linearGradient>
                      <linearGradient id="denied-usage-fill" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="var(--color-deniedQuantity)"
                          stopOpacity={0.25}
                        />
                        <stop
                          offset="95%"
                          stopColor="var(--color-deniedQuantity)"
                          stopOpacity={0.02}
                        />
                      </linearGradient>
                    </defs>
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
                    <Area
                      type="monotone"
                      dataKey="acceptedQuantity"
                      stroke="var(--color-acceptedQuantity)"
                      fill="url(#accepted-usage-fill)"
                      strokeWidth={2}
                      isAnimationActive={false}
                    />
                    <Area
                      type="monotone"
                      dataKey="deniedQuantity"
                      stroke="var(--color-deniedQuantity)"
                      fill="url(#denied-usage-fill)"
                      strokeWidth={2}
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ChartContainer>
              </div>
            ) : (
              <div className="px-5 py-12 text-center sm:px-6">
                <span className="mx-auto grid size-10 place-items-center rounded-lg bg-secondary text-muted-foreground">
                  <ChartLineUpIcon className="size-5" />
                </span>
                <p className="mt-3 text-sm font-medium">No usage in this range</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Usage will appear here after a request is processed or blocked.
                </p>
              </div>
            )}
          </>
        ) : null}
      </section>

      <UsageHistory scope={scope} filter={filter} onFilterChange={setFilter} />
    </>
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
