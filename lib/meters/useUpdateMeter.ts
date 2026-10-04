"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateMeter } from "./meters.service";
import type { MeterContext, UpdateMeterInput } from "./meters.types";

export function useUpdateMeter(context: MeterContext, meterKey: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateMeterInput) => updateMeter(context, meterKey, input),
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
