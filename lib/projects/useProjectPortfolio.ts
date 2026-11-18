"use client";

import { useQuery } from "@tanstack/react-query";
import type { EventsFilter } from "@/lib/events/events.types";
import { loadProjectPortfolio } from "./projects.service";
import type { ProjectEnvironment } from "./projects.types";

export function useProjectPortfolio(
  environment: ProjectEnvironment["name"],
  filter: Pick<EventsFilter, "period" | "from" | "to">,
) {
  return useQuery({
    queryKey: ["project-portfolio", environment, filter],
    queryFn: () => loadProjectPortfolio(environment, filter),
    staleTime: 30_000,
  });
}
