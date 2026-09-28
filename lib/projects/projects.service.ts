import { APIError, apiRequest } from "@/lib/api/api-client";
import type {
  CreatedProjectAPIKey,
  CreateProjectInput,
  Project,
  ProjectAPIKey,
  ProjectAPIKeyStatus,
  ProjectEnvironment,
  ProjectsResponse,
} from "./projects.types";

export async function createProject(input: CreateProjectInput): Promise<Project> {
  const response = await apiRequest("/v1/projects", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!isProject(response)) {
    throw new APIError(
      502,
      "invalid_response",
      "Consumel returned an invalid project response.",
    );
  }
  return response;
}

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

export function projectCreationErrorMessage(error: unknown) {
  if (error instanceof APIError) return error.message;
  return "Consumel could not create the project. Try again.";
}

export async function loadProjectAPIKey(
  projectID: string,
  environment: ProjectEnvironment["name"],
): Promise<ProjectAPIKeyStatus> {
  const response = await apiRequest(apiKeyPath(projectID, environment));
  if (!isProjectAPIKeyStatus(response)) {
    throw new APIError(
      502,
      "invalid_response",
      "Consumel returned an invalid API key response.",
    );
  }
  return response;
}

export async function createProjectAPIKey(
  projectID: string,
  environment: ProjectEnvironment["name"],
): Promise<CreatedProjectAPIKey> {
  return projectAPIKeyWrite(projectID, environment, "");
}

export async function replaceProjectAPIKey(
  projectID: string,
  environment: ProjectEnvironment["name"],
): Promise<CreatedProjectAPIKey> {
  return projectAPIKeyWrite(projectID, environment, "/replace");
}

export async function revokeProjectAPIKey(
  projectID: string,
  environment: ProjectEnvironment["name"],
): Promise<void> {
  await apiRequest(apiKeyPath(projectID, environment), { method: "DELETE" });
}

export async function activateProjectEnvironment(
  projectID: string,
  environment: ProjectEnvironment["name"],
): Promise<ProjectEnvironment> {
  const response = await apiRequest(
    `/v1/projects/${encodeURIComponent(projectID)}/environments/${environment}/activate`,
    { method: "POST" },
  );
  if (!isProjectEnvironment(response)) {
    throw new APIError(
      502,
      "invalid_response",
      "Consumel returned an invalid environment response.",
    );
  }
  return response;
}

export function apiKeyErrorMessage(error: unknown) {
  if (error instanceof APIError) return error.message;
  return "Consumel could not complete the API key action. Try again.";
}

async function projectAPIKeyWrite(
  projectID: string,
  environment: ProjectEnvironment["name"],
  suffix: "" | "/replace",
): Promise<CreatedProjectAPIKey> {
  const response = await apiRequest(`${apiKeyPath(projectID, environment)}${suffix}`, {
    method: "POST",
  });
  if (!isCreatedProjectAPIKey(response)) {
    throw new APIError(
      502,
      "invalid_response",
      "Consumel returned an invalid API key response.",
    );
  }
  return response;
}

function apiKeyPath(projectID: string, environment: ProjectEnvironment["name"]) {
  return `/v1/projects/${encodeURIComponent(projectID)}/environments/${environment}/api-key`;
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

function isProjectEnvironment(value: unknown): value is ProjectEnvironment {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    (value.name === "sandbox" || value.name === "live") &&
    (value.activatedAt === null || typeof value.activatedAt === "string")
  );
}

function isProjectAPIKeyStatus(value: unknown): value is ProjectAPIKeyStatus {
  return isRecord(value) && (value.apiKey === null || isProjectAPIKey(value.apiKey));
}

function isCreatedProjectAPIKey(value: unknown): value is CreatedProjectAPIKey {
  return isRecord(value) && isProjectAPIKey(value.apiKey) && typeof value.secret === "string";
}

function isProjectAPIKey(value: unknown): value is ProjectAPIKey {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    (value.environment === "sandbox" || value.environment === "live") &&
    (value.prefix === "cm_test_" || value.prefix === "cm_live_") &&
    typeof value.lastFour === "string" &&
    value.lastFour.length === 4 &&
    typeof value.createdAt === "string" &&
    (value.lastUsedAt === null || typeof value.lastUsedAt === "string")
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
