"use client";

import { useQuery } from "@tanstack/react-query";
import { loadUsageAnalytics } from "./analytics.service";
import type { AnalyticsContext, AnalyticsFilter } from "./analytics.types";

export function analyticsQueryKey(context: AnalyticsContext, filter: AnalyticsFilter) {
  return ["analytics", context.projectId, context.environment, filter] as const;
}

export function useUsageAnalytics(
  context: AnalyticsContext,
  filter: AnalyticsFilter,
  enabled = true,
) {
  return useQuery({
    queryKey: analyticsQueryKey(context, filter),
    queryFn: () => loadUsageAnalytics(context, filter),
    enabled,
    staleTime: 30_000,
  });
}
