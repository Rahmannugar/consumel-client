"use client";

import { useCallback, useEffect, useState } from "react";

export type ProjectEnvironmentName = "sandbox" | "live";

export function useProjectEnvironment(projectID: string) {
  const [environment, setEnvironment] = useState<ProjectEnvironmentName>("sandbox");

  useEffect(() => {
    const saved = sessionStorage.getItem(storageKey(projectID));
    setEnvironment(saved === "live" ? "live" : "sandbox");
  }, [projectID]);

  const selectEnvironment = useCallback(
    (nextEnvironment: ProjectEnvironmentName) => {
      sessionStorage.setItem(storageKey(projectID), nextEnvironment);
      setEnvironment(nextEnvironment);
    },
    [projectID],
  );

  return { environment, selectEnvironment };
}

function storageKey(projectID: string) {
  return `consumel.project.${projectID}.environment`;
}
