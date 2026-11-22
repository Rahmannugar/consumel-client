"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { APIError } from "@/lib/api/api-client";
import type { BalanceContext } from "@/lib/balances/balances.types";
import {
  archiveAllowancePlan,
  createAllowancePlan,
  loadAllowancePlan,
  loadAllowancePlans,
  saveAllowanceSource,
  updateAllowancePlan,
} from "./allowance-plans.service";
import type {
  AllowancePlan,
  AllowanceSourceInput,
  CreateAllowancePlanInput,
  UpdateAllowancePlanInput,
} from "./allowance-plans.types";

export function useAllowancePlans(context: BalanceContext, meterKey = "", enabled = true) {
  return useInfiniteQuery({
    queryKey: ["allowance-plans", context.projectId, context.environment, meterKey],
    queryFn: ({ pageParam }) => loadAllowancePlans(context, pageParam, meterKey),
    initialPageParam: null as string | null,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
    enabled,
  });
}
export function useAllowancePlan(context: BalanceContext, key: string, enabled = true) {
  return useQuery({
    queryKey: ["allowance-plan", context.projectId, context.environment, key],
    queryFn: () => loadAllowancePlan(context, key),
    enabled,
  });
}
export function useAllowancePlanMutations(context: BalanceContext) {
  const client = useQueryClient();
  async function refresh() {
    await Promise.all(
      ["allowance-plans", "allowance-plan", "allowance"].map((key) =>
        client.invalidateQueries({ queryKey: [key, context.projectId, context.environment] }),
      ),
    );
  }
  async function onError(error: unknown) {
    if (error instanceof APIError && error.code === "allowance_plan_version_conflict")
      await refresh();
  }
  return {
    create: useMutation({
      mutationFn: (input: CreateAllowancePlanInput) => createAllowancePlan(context, input),
      onSuccess: refresh,
      onError,
    }),
    update: useMutation({
      mutationFn: ({ key, input }: { key: string; input: UpdateAllowancePlanInput }) =>
        updateAllowancePlan(context, key, input),
      onSuccess: refresh,
      onError,
    }),
    archive: useMutation({
      mutationFn: (plan: AllowancePlan) => archiveAllowancePlan(context, plan),
      onSuccess: refresh,
      onError,
    }),
  };
}
export function useSaveAllowanceSource(
  context: BalanceContext,
  customerId: string,
  meterKey: string,
) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: AllowanceSourceInput) =>
      saveAllowanceSource(context, customerId, meterKey, input),
    onSuccess: async () => {
      await Promise.all(
        [
          "allowance",
          "allowance-periods",
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
    onError: async (error) => {
      if (error instanceof APIError && error.code === "allowance_version_conflict")
        await client.invalidateQueries({
          queryKey: ["allowance", context.projectId, context.environment, customerId, meterKey],
        });
    },
  });
}
