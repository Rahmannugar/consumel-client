"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createMeter } from "./meters.service";
import type { CreateMeterInput, MeterContext } from "./meters.types";

export function useCreateMeter(context: MeterContext) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateMeterInput) => createMeter(context, input),
    onSuccess: async (meter) => {
      queryClient.setQueryData(
        ["meter", context.projectId, context.environment, meter.meterKey],
        meter,
      );
      await queryClient.invalidateQueries({
        queryKey: ["meters", context.projectId, context.environment],
      });
    },
  });
}
