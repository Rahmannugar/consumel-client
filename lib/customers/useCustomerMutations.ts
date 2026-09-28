"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCustomer, updateCustomer } from "./customers.service";
import type { CreateCustomerInput, CustomerContext, CustomerFields } from "./customers.types";

export function useCreateCustomer(context: CustomerContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCustomerInput) => createCustomer(context, input),
    onSuccess: async (customer) => {
      queryClient.setQueryData(
        ["customer", context.projectId, context.environment, customer.customerId],
        customer,
      );
      await queryClient.invalidateQueries({
        queryKey: ["customers", context.projectId, context.environment],
      });
    },
  });
}

export function useUpdateCustomer(context: CustomerContext, customerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CustomerFields) => updateCustomer(context, customerId, input),
    onSuccess: async (customer) => {
      queryClient.setQueryData(
        ["customer", context.projectId, context.environment, customerId],
        customer,
      );
      await queryClient.invalidateQueries({
        queryKey: ["customers", context.projectId, context.environment],
      });
    },
  });
}
