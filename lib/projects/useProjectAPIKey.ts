"use client";

import { useQuery } from "@tanstack/react-query";
import { loadProjectAPIKey } from "./projects.service";
import type { ProjectEnvironment } from "./projects.types";

export function projectAPIKeyQueryKey(
  projectID: string,
  environment: ProjectEnvironment["name"],
) {
  return ["projects", projectID, environment, "api-key"] as const;
}

export function useProjectAPIKey(projectID: string, environment: ProjectEnvironment["name"]) {
  return useQuery({
    queryKey: projectAPIKeyQueryKey(projectID, environment),
    queryFn: () => loadProjectAPIKey(projectID, environment),
  });
}
