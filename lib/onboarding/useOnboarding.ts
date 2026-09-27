"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFirstProject } from "./onboarding.service";

export function useCreateFirstProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["onboarding", "create-first-project"],
    mutationFn: createFirstProject,
    onSuccess: (setup) => {
      queryClient.setQueryData(["projects"], { projects: [setup.project] });
      void queryClient.invalidateQueries({ queryKey: ["authentication", "account"] });
    },
  });
}
