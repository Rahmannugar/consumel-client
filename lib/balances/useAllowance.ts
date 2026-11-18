"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { APIError } from "@/lib/api/api-client";
import { loadAllowance, loadAllowancePeriods, saveAllowance } from "./allowances.service";
import type { AllowanceInput } from "./allowances.types";
import type { BalanceContext } from "./balances.types";

export function useAllowance(
  context: BalanceContext,
  customerId: string,
  meterKey: string,
  enabled = true,
) {
  return useQuery({
    queryKey: ["allowance", context.projectId, context.environment, customerId, meterKey],
    queryFn: () => loadAllowance(context, customerId, meterKey),
    enabled: enabled && meterKey.length > 0,
  });
}
export function useSaveAllowance(
  context: BalanceContext,
  customerId: string,
  meterKey: string,
) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: AllowanceInput) => saveAllowance(context, customerId, meterKey, input),
    onError: async (error) => {
      if (error instanceof APIError && error.code === "allowance_version_conflict") {
        await client.invalidateQueries({
          queryKey: ["allowance", context.projectId, context.environment, customerId, meterKey],
        });
      }
    },
    onSuccess: async () => {
      await Promise.all(
        [
          "allowance-periods",
          "allowance",
          "balances",
          "balance",
          "balance-grants",
          "balance-activity",
        ].map((key) =>
          client.invalidateQueries({
            queryKey: [key, context.projectId, context.environment, customerId],
          }),
        ),
      );
    },
  });
}

export function useAllowancePeriods(
  context: BalanceContext,
  customerId: string,
  meterKey: string,
  enabled = true,
) {
  return useInfiniteQuery({
    queryKey: [
      "allowance-periods",
      context.projectId,
      context.environment,
      customerId,
      meterKey,
    ],
    queryFn: ({ pageParam }) => loadAllowancePeriods(context, customerId, meterKey, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
    enabled,
  });
}
