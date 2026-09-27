import { APIError, apiRequest } from "@/lib/api/api-client";
import type { Project, ProjectsResponse } from "./projects.types";

export async function loadProjects(): Promise<ProjectsResponse> {
  const response = await apiRequest("/v1/projects");
  if (!isProjectsResponse(response)) {
    throw new APIError(
      502,
      "invalid_response",
      "Consumel returned an invalid project response.",
    );
  }
  return response;
}

export function projectErrorMessage(error: unknown) {
  if (error instanceof APIError) return error.message;
  return "Consumel could not load your projects. Try again.";
}

function isProjectsResponse(value: unknown): value is ProjectsResponse {
  return isRecord(value) && Array.isArray(value.projects) && value.projects.every(isProject);
}

function isProject(value: unknown): value is Project {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.organizationId !== "string" ||
    typeof value.organizationName !== "string" ||
    typeof value.name !== "string" ||
    typeof value.slug !== "string" ||
    value.slug.length === 0 ||
    typeof value.createdAt !== "string" ||
    !Array.isArray(value.environments) ||
    !value.environments.every(isProjectEnvironment)
  ) {
    return false;
  }

  return (
    value.environments.length === 2 &&
    value.environments.some((environment) => environment.name === "sandbox") &&
    value.environments.some((environment) => environment.name === "live")
  );
}

function isProjectEnvironment(value: unknown) {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    (value.name === "sandbox" || value.name === "live") &&
    (value.activatedAt === null || typeof value.activatedAt === "string")
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
