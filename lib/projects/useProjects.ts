"use client";

import { useQuery } from "@tanstack/react-query";
import { loadProjects } from "./projects.service";

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: loadProjects,
  });
}
