"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { loadBalance, loadBalanceActivity, loadEntitlementGrants } from "./balances.service";
import type { BalanceContext } from "./balances.types";

export function useBalanceDetail(
  context: BalanceContext,
  customerId: string,
  meterKey: string,
  enabled = true,
) {
  return useQuery({
    queryKey: ["balance", context.projectId, context.environment, customerId, meterKey],
    queryFn: () => loadBalance(context, customerId, meterKey),
    enabled,
  });
}

export function useBalanceActivity(
  context: BalanceContext,
  customerId: string,
  meterKey: string,
  enabled = true,
) {
  return useInfiniteQuery({
    queryKey: [
      "balance-activity",
      context.projectId,
      context.environment,
      customerId,
      meterKey,
    ],
    queryFn: ({ pageParam }) => loadBalanceActivity(context, customerId, meterKey, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
    enabled,
  });
}

export function useEntitlementGrants(
  context: BalanceContext,
  customerId: string,
  meterKey: string,
  enabled = true,
) {
  return useInfiniteQuery({
    queryKey: ["balance-grants", context.projectId, context.environment, customerId, meterKey],
    queryFn: ({ pageParam }) => loadEntitlementGrants(context, customerId, meterKey, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
    enabled,
  });
}
