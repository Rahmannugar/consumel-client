"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { loadCustomers } from "./customers.service";
import type { CustomerContext } from "./customers.types";

export function useCustomers(context: CustomerContext, enabled = true, search = "") {
  return useInfiniteQuery({
    queryKey: ["customers", context.projectId, context.environment, search],
    queryFn: ({ pageParam }) => loadCustomers(context, pageParam, search),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled,
  });
}
