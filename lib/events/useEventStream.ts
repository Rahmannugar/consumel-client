"use client";

import { type InfiniteData, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { apiURL } from "@/lib/api/api-client";
import { eventRange, isUsageOperation } from "./events.service";
import type {
  EventsContext,
  EventsFilter,
  OperationsResponse,
  UsageOperation,
} from "./events.types";
import { eventsQueryKey } from "./useEvents";

export function useEventStream(
  context: EventsContext,
  filter: EventsFilter,
  enabled = true,
  pageSize = 50,
) {
  const queryClient = useQueryClient();
  const { projectId, environment } = context;

  useEffect(() => {
    if (!enabled) return;
    const key = eventsQueryKey({ projectId, environment }, filter, pageSize);
    const path = `/v1/projects/${encodeURIComponent(projectId)}/environments/${environment}/events/stream`;
    const source = new EventSource(apiURL(path), { withCredentials: true });

    source.onopen = () => {
      void queryClient.invalidateQueries({ queryKey: key, exact: true });
    };
    const receive = (message: MessageEvent<string>) => {
      let operation: unknown;
      try {
        operation = JSON.parse(message.data);
      } catch {
        return;
      }
      if (!isUsageOperation(operation) || !matchesFilter(operation, filter)) return;
      queryClient.setQueryData<InfiniteData<OperationsResponse>>(key, (current) =>
        prependOperation(current, operation, pageSize),
      );
      void queryClient.invalidateQueries({
        queryKey: ["analytics", projectId, environment],
      });
    };
    source.addEventListener("usage.operation", receive as EventListener);
    return () => source.close();
  }, [enabled, environment, filter, pageSize, projectId, queryClient]);
}

function matchesFilter(operation: UsageOperation, filter: EventsFilter) {
  if (filter.status && operation.status !== filter.status) return false;
  if (filter.customerId && operation.customerId !== filter.customerId) return false;
  if (filter.meterKey && operation.meterKey !== filter.meterKey) return false;
  const range = eventRange(filter);
  const createdAt = new Date(operation.createdAt).getTime();
  return (
    createdAt >= new Date(range.from).getTime() && createdAt < new Date(range.to).getTime()
  );
}

function prependOperation(
  current: InfiniteData<OperationsResponse> | undefined,
  operation: UsageOperation,
  pageSize: number,
) {
  if (
    !current ||
    current.pages.some((page) => page.operations.some((row) => row.id === operation.id))
  ) {
    return current;
  }
  const [first, ...rest] = current.pages;
  if (!first) return current;
  return {
    ...current,
    pages: [
      { ...first, operations: [operation, ...first.operations].slice(0, pageSize) },
      ...rest,
    ],
  };
}
