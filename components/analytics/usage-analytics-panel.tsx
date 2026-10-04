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
import type { UsageAnalyticsBucket } from "@/lib/analytics/analytics.types";
import { useUsageAnalytics } from "@/lib/analytics/useUsageAnalytics";
import type { EventsFilter } from "@/lib/events/events.types";

type AnalyticsScope = {
  customerId?: string;
  meterKey?: string;
};

type DisplayInterval = "hour" | "day" | "month";

const quantityChartConfig = {
  acceptedQuantity: { label: "Allowed quantity", color: "#087cec" },
} satisfies ChartConfig;

const requestChartConfig = {
  acceptedOperations: { label: "Allowed requests", color: "#087cec" },
  deniedOperations: { label: "Blocked requests", color: "#ef4444" },
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
  const showsQuantity = scope.meterKey !== undefined;
  const chartConfig = showsQuantity ? quantityChartConfig : requestChartConfig;
  const totalRequests = analytics.data
    ? analytics.data.summary.acceptedOperations + analytics.data.summary.deniedOperations
    : 0;
  const hasChartData = analytics.data
    ? showsQuantity
      ? analytics.data.summary.acceptedQuantity > 0
      : totalRequests > 0
    : false;
  const usesMonthlyBuckets =
    analytics.data !== undefined &&
    shouldAggregateMonthly(analytics.data.from, analytics.data.to);
  const chartBuckets = analytics.data
    ? usesMonthlyBuckets
      ? aggregateMonthlyBuckets(analytics.data.buckets)
      : analytics.data.buckets
    : [];
  const displayInterval: DisplayInterval = usesMonthlyBuckets
    ? "month"
    : (analytics.data?.interval ?? "day");

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
            {showsQuantity ? (
              <Metric label="Usage volume" value={analytics.data.summary.acceptedQuantity} />
            ) : (
              <Metric
                label="Allowed requests"
                value={analytics.data.summary.acceptedOperations}
              />
            )}
            {showsQuantity ? (
              <Metric
                label="Allowed requests"
                value={analytics.data.summary.acceptedOperations}
              />
            ) : (
              <Metric
                label="Blocked requests"
                value={analytics.data.summary.deniedOperations}
              />
            )}
            {showsQuantity ? (
              <Metric
                label="Blocked requests"
                value={analytics.data.summary.deniedOperations}
              />
            ) : (
              <Metric
                label="Block rate"
                value={formatBlockRate(analytics.data.summary.deniedOperations, totalRequests)}
              />
            )}
          </dl>
          {hasChartData ? (
            <div className="px-2 pt-6 pb-4 sm:px-5">
              {!showsQuantity ? (
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-3 pb-3 text-xs text-muted-foreground">
                  <ChartSeriesLabel
                    color={requestChartConfig.acceptedOperations.color}
                    label="Allowed requests"
                  />
                  <ChartSeriesLabel
                    color={requestChartConfig.deniedOperations.color}
                    label="Blocked requests"
                  />
                </div>
              ) : null}
              <ChartContainer
                config={chartConfig}
                className="h-64"
                aria-label={
                  showsQuantity
                    ? "Allowed usage volume over time"
                    : "Request outcomes over time"
                }
              >
                <BarChart
                  data={chartBuckets}
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
                    tickFormatter={(value: string) => formatBucketLabel(value, displayInterval)}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                    width={44}
                    tickFormatter={compactNumber}
                  />
                  <ChartTooltip
                    cursor={{ stroke: "var(--app-border)" }}
                    content={
                      <ChartTooltipContent
                        config={chartConfig}
                        labelFormatter={(value) =>
                          formatBucketTooltip(String(value), displayInterval)
                        }
                      />
                    }
                  />
                  <Bar
                    dataKey={showsQuantity ? "acceptedQuantity" : "acceptedOperations"}
                    stackId={showsQuantity ? undefined : "requests"}
                    fill={
                      showsQuantity
                        ? "var(--color-acceptedQuantity)"
                        : "var(--color-acceptedOperations)"
                    }
                    radius={[4, 4, 0, 0]}
                    isAnimationActive={false}
                  />
                  {!showsQuantity ? (
                    <Bar
                      dataKey="deniedOperations"
                      stackId="requests"
                      fill="var(--color-deniedOperations)"
                      radius={[4, 4, 0, 0]}
                      isAnimationActive={false}
                    />
                  ) : null}
                </BarChart>
              </ChartContainer>
            </div>
          ) : (
            <div className="px-5 py-12 text-center sm:px-6">
              <span className="mx-auto grid size-10 place-items-center rounded-lg bg-secondary text-muted-foreground">
                <ChartLineUpIcon className="size-5" />
              </span>
              <p className="mt-3 text-sm font-medium">
                {showsQuantity ? "No allowed usage in this range" : "No requests in this range"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {showsQuantity
                  ? "Blocked requests do not contribute to usage volume."
                  : "Allowed and blocked requests will appear here."}
              </p>
            </div>
          )}
        </>
      ) : null}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-card px-5 py-4 sm:px-6">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-xl font-semibold tracking-tight tabular-nums">
        {typeof value === "number" ? value.toLocaleString() : value}
      </dd>
    </div>
  );
}

function ChartSeriesLabel({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="size-2 rounded-sm" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

function formatBlockRate(blockedRequests: number, totalRequests: number) {
  if (totalRequests === 0) return "0%";
  return new Intl.NumberFormat(undefined, {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(blockedRequests / totalRequests);
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

function formatBucketLabel(value: string, interval: DisplayInterval) {
  return new Intl.DateTimeFormat(
    undefined,
    interval === "hour"
      ? { month: "short", day: "numeric", hour: "numeric", timeZone: "UTC" }
      : interval === "month"
        ? { month: "short", year: "2-digit", timeZone: "UTC" }
        : { month: "short", day: "numeric", timeZone: "UTC" },
  ).format(new Date(value));
}

function formatBucketTooltip(value: string, interval: DisplayInterval) {
  return new Intl.DateTimeFormat(
    undefined,
    interval === "hour"
      ? { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }
      : interval === "month"
        ? { month: "long", year: "numeric", timeZone: "UTC" }
        : { dateStyle: "medium", timeZone: "UTC" },
  ).format(new Date(value));
}

function shouldAggregateMonthly(from: string, to: string) {
  const rangeMilliseconds = new Date(to).getTime() - new Date(from).getTime();
  return rangeMilliseconds > 90 * 24 * 60 * 60 * 1000;
}

function aggregateMonthlyBuckets(buckets: UsageAnalyticsBucket[]) {
  const months = new Map<string, UsageAnalyticsBucket>();

  for (const bucket of buckets) {
    const date = new Date(bucket.start);
    const start = new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1),
    ).toISOString();
    const current = months.get(start);
    if (current) {
      current.acceptedOperations += bucket.acceptedOperations;
      current.deniedOperations += bucket.deniedOperations;
      current.acceptedQuantity += bucket.acceptedQuantity;
      current.deniedQuantity += bucket.deniedQuantity;
      current.billableOperations += bucket.billableOperations;
      continue;
    }

    months.set(start, { ...bucket, start });
  }

  return [...months.values()];
}
