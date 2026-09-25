"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
  loadAccount,
  requestPasswordReset,
  resendVerification,
  resetPassword,
  signIn,
  signUp,
  startGoogleSignIn,
  verifyEmail,
} from "./authentication.service";

export function useAccount() {
  return useQuery({
    queryKey: ["authentication", "account"],
    queryFn: loadAccount,
    retry: false,
  });
}

export function usePasswordSignIn() {
  return useMutation({
    mutationKey: ["authentication", "sign-in", "password"],
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      await signIn(email, password);
      return loadAccount();
    },
  });
}

export function useGoogleSignIn() {
  return useMutation({
    mutationKey: ["authentication", "sign-in", "google"],
    mutationFn: startGoogleSignIn,
  });
}

export function useSignUp() {
  return useMutation({
    mutationKey: ["authentication", "sign-up"],
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      signUp(email, password),
  });
}

export function useVerifyEmail() {
  return useMutation({
    mutationKey: ["authentication", "verify-email"],
    mutationFn: async ({ email, code }: { email: string; code: string }) => {
      await verifyEmail(email, code);
      return loadAccount();
    },
  });
}

export function useResendVerification() {
  return useMutation({
    mutationKey: ["authentication", "resend-verification"],
    mutationFn: resendVerification,
  });
}

export function useRequestPasswordReset() {
  return useMutation({
    mutationKey: ["authentication", "request-password-reset"],
    mutationFn: requestPasswordReset,
  });
}

export function useResetPassword() {
  return useMutation({
    mutationKey: ["authentication", "reset-password"],
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      resetPassword(token, password),
  });
}
