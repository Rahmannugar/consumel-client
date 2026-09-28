"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { loadCustomers } from "./customers.service";
import type { CustomerContext } from "./customers.types";

export function useCustomers(context: CustomerContext, enabled = true) {
  return useInfiniteQuery({
    queryKey: ["customers", context.projectId, context.environment],
    queryFn: ({ pageParam }) => loadCustomers(context, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled,
  });
}
