import { APIError, apiRequest } from "@/lib/api/api-client";
import type { AuthenticatedAccount } from "./authentication.types";

export async function signUp(email: string, password: string) {
  await apiRequest("/auth/sign-up", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function signIn(email: string, password: string) {
  await apiRequest("/auth/sign-in", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function verifyEmail(email: string, code: string) {
  await apiRequest("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ email, code }),
  });
}

export async function resendVerification(email: string) {
  await apiRequest("/auth/resend-verification", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function requestPasswordReset(email: string) {
  await apiRequest("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(token: string, newPassword: string) {
  await apiRequest("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, newPassword }),
  });
}

export async function startGoogleSignIn() {
  const response = await apiRequest("/auth/google", { method: "POST" });
  if (!isRecord(response) || typeof response.url !== "string") {
    throw new APIError(502, "invalid_response", "Google sign-in could not be started.");
  }
  return response.url;
}

export async function loadAccount(): Promise<AuthenticatedAccount> {
  const response = await apiRequest("/account");
  if (!isAccount(response)) {
    throw new APIError(
      502,
      "invalid_response",
      "Consumel returned an invalid account response.",
    );
  }
  return response;
}

export function authenticatedDestination(account: AuthenticatedAccount) {
  return account.organizations.length === 0 ? "/onboarding" : "/dashboard";
}

export async function signOut() {
  await apiRequest("/auth/sign-out", { method: "POST" });
}

export function authenticationErrorMessage(error: unknown) {
  if (!(error instanceof APIError)) {
    return "Consumel could not complete the request. Try again.";
  }

  switch (error.code) {
    case "invalid_credentials":
      return "The email or password is incorrect.";
    case "registration_unavailable":
      return "An account cannot be created with that email.";
    case "email_not_verified":
      return "Verify your email before signing in.";
    case "invalid_token":
      return "This code or link is invalid or has expired.";
    case "invalid_password":
    case "invalid_request":
      return "Review the information and try again.";
    case "too_many_attempts":
      return "Too many attempts. Wait a moment and try again.";
    case "origin_not_allowed":
      return "This application is not allowed to make authentication requests.";
    default:
      return error.message;
  }
}

export function requiresEmailVerification(error: unknown) {
  return error instanceof APIError && error.code === "email_not_verified";
}

function isAccount(value: unknown): value is AuthenticatedAccount {
  if (!isRecord(value) || !isRecord(value.session) || !isRecord(value.user)) return false;
  if (!Array.isArray(value.organizations)) return false;
  if (
    typeof value.session.id !== "string" ||
    typeof value.session.createdAt !== "string" ||
    typeof value.session.expiresAt !== "string" ||
    typeof value.user.id !== "string" ||
    typeof value.user.email !== "string"
  ) {
    return false;
  }
  return value.organizations.every(
    (organization) =>
      isRecord(organization) &&
      typeof organization.id === "string" &&
      typeof organization.name === "string" &&
      typeof organization.owner === "boolean" &&
      typeof organization.roleId === "string" &&
      typeof organization.roleName === "string" &&
      (organization.roleSystemKey === null || typeof organization.roleSystemKey === "string"),
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
