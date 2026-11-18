"use client";

import { ChartLineUpIcon } from "@phosphor-icons/react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ProjectPortfolio, ProjectPortfolioBucket } from "@/lib/projects/projects.types";

type DisplayInterval = "hour" | "day" | "month";

const chartConfig = {
  allowedOperations: { label: "Allowed requests", color: "#087cec" },
  blockedOperations: { label: "Blocked requests", color: "#ef4444" },
} satisfies ChartConfig;

export function ProjectPortfolioChart({ portfolio }: { portfolio: ProjectPortfolio }) {
  const totalRequests =
    portfolio.summary.allowedOperations + portfolio.summary.blockedOperations;
  const usesMonthlyBuckets = shouldAggregateMonthly(portfolio.from, portfolio.to);
  const buckets = usesMonthlyBuckets
    ? aggregateMonthlyBuckets(portfolio.buckets)
    : portfolio.buckets;
  const displayInterval: DisplayInterval = usesMonthlyBuckets ? "month" : portfolio.interval;

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="border-b border-border px-5 py-4 sm:px-6">
        <h2 className="text-sm font-semibold">Request outcomes</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Allowed and blocked requests across the selected environment.
        </p>
      </div>
      <dl className="grid gap-px border-b border-border bg-border sm:grid-cols-3">
        <Metric label="Allowed requests" value={portfolio.summary.allowedOperations} />
        <Metric label="Blocked requests" value={portfolio.summary.blockedOperations} />
        <Metric
          label="Block rate"
          value={formatBlockRate(portfolio.summary.blockedOperations, totalRequests)}
        />
      </dl>
      {totalRequests > 0 ? (
        <div className="px-2 pt-6 pb-4 sm:px-5">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-3 pb-3 text-xs text-muted-foreground">
            <ChartSeriesLabel
              color={chartConfig.allowedOperations.color}
              label="Allowed requests"
            />
            <ChartSeriesLabel
              color={chartConfig.blockedOperations.color}
              label="Blocked requests"
            />
          </div>
          <ChartContainer
            config={chartConfig}
            className="h-64"
            aria-label="Request outcomes across projects over time"
          >
            <BarChart data={buckets} margin={{ left: 0, right: 12, top: 8 }} accessibilityLayer>
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
                dataKey="allowedOperations"
                stackId="requests"
                fill="var(--color-allowedOperations)"
                radius={[4, 4, 0, 0]}
                isAnimationActive={false}
              />
              <Bar
                dataKey="blockedOperations"
                stackId="requests"
                fill="var(--color-blockedOperations)"
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
          <p className="mt-3 text-sm font-medium">No requests in this range</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Allowed and blocked requests will appear here.
          </p>
        </div>
      )}
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
  return new Date(to).getTime() - new Date(from).getTime() > 90 * 24 * 60 * 60 * 1000;
}

function aggregateMonthlyBuckets(buckets: ProjectPortfolioBucket[]) {
  const months = new Map<string, ProjectPortfolioBucket>();
  for (const bucket of buckets) {
    const date = new Date(bucket.start);
    const start = new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1),
    ).toISOString();
    const current = months.get(start);
    if (current) {
      current.allowedOperations += bucket.allowedOperations;
      current.blockedOperations += bucket.blockedOperations;
    } else {
      months.set(start, { ...bucket, start });
    }
  }
  return [...months.values()];
}
