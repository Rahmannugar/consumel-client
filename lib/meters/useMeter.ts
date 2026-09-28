"use client";

import { useQuery } from "@tanstack/react-query";
import { loadMeter } from "./meters.service";
import type { MeterContext } from "./meters.types";

export function useMeter(context: MeterContext, meterKey: string, enabled = true) {
  return useQuery({
    queryKey: ["meter", context.projectId, context.environment, meterKey],
    queryFn: () => loadMeter(context, meterKey),
    enabled,
  });
}
