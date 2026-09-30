"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { loadMeters } from "./meters.service";
import type { MeterContext } from "./meters.types";

export function useMeters(context: MeterContext, enabled = true, search = "") {
  return useInfiniteQuery({
    queryKey: ["meters", context.projectId, context.environment, search],
    queryFn: ({ pageParam }) => loadMeters(context, pageParam, search),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled,
  });
}
