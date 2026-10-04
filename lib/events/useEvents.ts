"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { loadOperations } from "./events.service";
import type { EventsContext, EventsFilter } from "./events.types";

export function eventsQueryKey(context: EventsContext, filter: EventsFilter, pageSize = 50) {
  return ["events", context.projectId, context.environment, filter, pageSize] as const;
}

export function useEvents(
  context: EventsContext,
  filter: EventsFilter,
  enabled = true,
  pageSize = 50,
) {
  return useInfiniteQuery({
    queryKey: eventsQueryKey(context, filter, pageSize),
    queryFn: ({ pageParam }) => loadOperations(context, pageParam, filter, pageSize),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled,
  });
}
