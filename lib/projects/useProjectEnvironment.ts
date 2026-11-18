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
      saveProjectEnvironment(projectID, nextEnvironment);
      setEnvironment(nextEnvironment);
    },
    [projectID],
  );

  return { environment, selectEnvironment };
}

export function saveProjectEnvironment(projectID: string, environment: ProjectEnvironmentName) {
  sessionStorage.setItem(storageKey(projectID), environment);
}

function storageKey(projectID: string) {
  return `consumel.project.${projectID}.environment`;
}
