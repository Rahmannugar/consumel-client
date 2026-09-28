"use client";

import { useQuery } from "@tanstack/react-query";
import { loadCustomer } from "./customers.service";
import type { CustomerContext } from "./customers.types";

export function useCustomer(context: CustomerContext, customerId: string, enabled = true) {
  return useQuery({
    queryKey: ["customer", context.projectId, context.environment, customerId],
    queryFn: () => loadCustomer(context, customerId),
    enabled,
  });
}
