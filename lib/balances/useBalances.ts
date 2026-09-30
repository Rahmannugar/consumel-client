"use client";

import { useQuery } from "@tanstack/react-query";
import { loadBalances } from "./balances.service";
import type { BalanceContext } from "./balances.types";

export function useBalances(context: BalanceContext, customerId: string, enabled = true) {
  return useQuery({
    queryKey: ["balances", context.projectId, context.environment, customerId],
    queryFn: () => loadBalances(context, customerId),
    enabled,
  });
}
