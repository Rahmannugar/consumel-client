import { APIError, apiRequest } from "@/lib/api/api-client";
import type { OnboardingInput, OnboardingSetup } from "./onboarding.types";

export async function createFirstProject(input: OnboardingInput): Promise<OnboardingSetup> {
  const response = await apiRequest("/onboarding", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!isSetup(response)) {
    throw new APIError(
      502,
      "invalid_response",
      "Consumel returned an invalid project response.",
    );
  }
  return response;
}

export function onboardingErrorMessage(error: unknown) {
  if (error instanceof APIError) return error.message;
  return "Consumel could not create your project. Try again.";
}

function isSetup(value: unknown): value is OnboardingSetup {
  if (!isRecord(value) || !isRecord(value.organization) || !isRecord(value.project)) {
    return false;
  }
  return (
    typeof value.organization.id === "string" &&
    typeof value.organization.name === "string" &&
    typeof value.project.id === "string" &&
    typeof value.project.organizationId === "string" &&
    typeof value.project.organizationName === "string" &&
    typeof value.project.name === "string" &&
    typeof value.project.slug === "string" &&
    value.project.slug.length > 0 &&
    typeof value.project.createdAt === "string" &&
    Array.isArray(value.project.environments) &&
    value.project.environments.every(
      (environment) =>
        isRecord(environment) &&
        typeof environment.id === "string" &&
        (environment.name === "sandbox" || environment.name === "live") &&
        (environment.activatedAt === null || typeof environment.activatedAt === "string"),
    )
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
