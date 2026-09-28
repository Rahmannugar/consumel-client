"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProject } from "./projects.service";
import type { ProjectsResponse } from "./projects.types";

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["projects", "create"],
    mutationFn: createProject,
    onSuccess: (project) => {
      queryClient.setQueryData<ProjectsResponse>(["projects"], (current) => ({
        projects: [...(current?.projects ?? []), project],
      }));
    },
  });
}
