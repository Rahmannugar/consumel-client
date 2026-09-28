"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { loadMeters } from "./meters.service";
import type { MeterContext } from "./meters.types";

export function useMeters(context: MeterContext, enabled = true) {
  return useInfiniteQuery({
    queryKey: ["meters", context.projectId, context.environment],
    queryFn: ({ pageParam }) => loadMeters(context, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled,
  });
}
