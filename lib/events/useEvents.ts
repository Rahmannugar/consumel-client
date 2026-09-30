"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { loadOperations } from "./events.service";
import type { EventsContext, EventsFilter } from "./events.types";

export function eventsQueryKey(context: EventsContext, filter: EventsFilter) {
  return ["events", context.projectId, context.environment, filter] as const;
}

export function useEvents(context: EventsContext, filter: EventsFilter, enabled = true) {
  return useInfiniteQuery({
    queryKey: eventsQueryKey(context, filter),
    queryFn: ({ pageParam }) => loadOperations(context, pageParam, filter),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled,
  });
}
