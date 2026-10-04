"use client";

import type * as React from "react";
import { ResponsiveContainer, Tooltip } from "recharts";
import { cn } from "@/lib/utils";

export type ChartConfig = Record<string, { label: string; color: string }>;

function ChartContainer({
  config,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig;
  children: React.ReactElement;
}) {
  const style = {
    ...props.style,
    ...Object.fromEntries(
      Object.entries(config).map(([key, value]) => [`--color-${key}`, value.color]),
    ),
  } as React.CSSProperties;
  return (
    <div
      data-slot="chart"
      className={cn("aspect-auto h-64 w-full text-xs", className)}
      {...props}
      style={style}
    >
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}

const ChartTooltip = Tooltip;

function ChartTooltipContent({
  active,
  payload,
  label,
  labelFormatter,
  config,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{
    dataKey?: string | number;
    value?: number | string;
    color?: string;
  }>;
  label?: string | number;
  labelFormatter?: (value: string | number) => React.ReactNode;
  config: ChartConfig;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="min-w-40 rounded-lg border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-lg">
      <p className="mb-2 font-medium">
        {labelFormatter && label !== undefined ? labelFormatter(label) : label}
      </p>
      <div className="grid gap-1.5">
        {payload.map((item) => {
          const key = String(item.dataKey ?? "");
          return (
            <div key={key} className="flex items-center justify-between gap-5">
              <span className="flex items-center gap-2 text-muted-foreground">
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: item.color ?? config[key]?.color }}
                />
                {config[key]?.label ?? key}
              </span>
              <span className="font-mono font-medium tabular-nums">
                {Number(item.value ?? 0).toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { ChartContainer, ChartTooltip, ChartTooltipContent };
