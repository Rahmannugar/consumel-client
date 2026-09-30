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
      await queryClient.invalidateQueries({
        queryKey: ["balances", context.projectId, context.environment, balance.customerId],
      });
    },
  });
}

export function useSetBalance(context: BalanceContext, customerId: string, meterKey: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SetBalanceInput) => setBalance(context, customerId, meterKey, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["balances", context.projectId, context.environment, customerId],
      });
    },
  });
}
