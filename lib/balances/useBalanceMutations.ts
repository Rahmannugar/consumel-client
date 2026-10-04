"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addBalance, setBalance } from "./balances.service";
import type { AddBalanceInput, BalanceContext, SetBalanceInput } from "./balances.types";

export function useAddBalance(context: BalanceContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      input,
      idempotencyKey,
    }: {
      input: AddBalanceInput;
      idempotencyKey: string;
    }) => addBalance(context, input, idempotencyKey),
    onSuccess: async (balance) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["balances", context.projectId, context.environment, balance.customerId],
        }),
        queryClient.invalidateQueries({
          queryKey: [
            "balance-activity",
            context.projectId,
            context.environment,
            balance.customerId,
            balance.meterKey,
          ],
        }),
        queryClient.invalidateQueries({
          queryKey: [
            "balance",
            context.projectId,
            context.environment,
            balance.customerId,
            balance.meterKey,
          ],
        }),
        queryClient.invalidateQueries({
          queryKey: [
            "balance-grants",
            context.projectId,
            context.environment,
            balance.customerId,
            balance.meterKey,
          ],
        }),
      ]);
    },
  });
}

export function useSetBalance(context: BalanceContext, customerId: string, meterKey: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SetBalanceInput) => setBalance(context, customerId, meterKey, input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["balances", context.projectId, context.environment, customerId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["balance", context.projectId, context.environment, customerId, meterKey],
        }),
        queryClient.invalidateQueries({
          queryKey: [
            "balance-grants",
            context.projectId,
            context.environment,
            customerId,
            meterKey,
          ],
        }),
        queryClient.invalidateQueries({
          queryKey: [
            "balance-activity",
            context.projectId,
            context.environment,
            customerId,
            meterKey,
          ],
        }),
      ]);
    },
  });
}
