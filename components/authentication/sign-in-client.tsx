"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  authenticatedDestination,
  authenticationErrorMessage,
  requiresEmailVerification,
} from "@/lib/authentication/authentication.service";
import { useAuthenticationStore } from "@/lib/authentication/authentication.store";
import {
  signInSchema,
  validationMessage,
} from "@/lib/authentication/authentication.validation";
import { useGoogleSignIn, usePasswordSignIn } from "@/lib/authentication/useAuthentication";
import { LastUsedBadge } from "./auth-feedback";
import { GoogleIcon } from "./google-icon";
import { PasswordInput } from "./password-input";

export function SignInClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const passwordSignIn = usePasswordSignIn();
  const googleSignIn = useGoogleSignIn();
  const pendingMethod = passwordSignIn.isPending
    ? "password"
    : googleSignIn.isPending
      ? "google"
      : null;
  const lastMethod = useAuthenticationStore((state) => state.lastSignInMethod);
  const rememberSignInMethod = useAuthenticationStore((state) => state.rememberSignInMethod);

  useEffect(() => {
    // A cancelled OAuth navigation may restore this page from the back-forward cache.
    const restoreActions = () => {
      if (document.visibilityState === "visible") googleSignIn.reset();
    };
    window.addEventListener("pageshow", restoreActions);
    document.addEventListener("visibilitychange", restoreActions);
    return () => {
      window.removeEventListener("pageshow", restoreActions);
      document.removeEventListener("visibilitychange", restoreActions);
    };
  }, [googleSignIn.reset]);

  function submitPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = signInSchema.safeParse({ email, password });
    if (!result.success) {
      toast.error(validationMessage(result));
      return;
    }
    passwordSignIn.mutate(result.data, {
      onSuccess: (account) => {
        rememberSignInMethod("password");
        router.replace(authenticatedDestination(account));
      },
      onError: (requestError) => {
        if (requiresEmailVerification(requestError)) {
          router.push(`/verify-email?email=${encodeURIComponent(result.data.email)}`);
          return;
        }
        toast.error(authenticationErrorMessage(requestError));
      },
    });
  }

  function continueWithGoogle() {
    googleSignIn.mutate(undefined, {
      onSuccess: (url) => window.location.assign(url),
      onError: (requestError) => toast.error(authenticationErrorMessage(requestError)),
    });
  }

  return (
    <>
      <header className="mb-8">
        <h1 className="font-[family-name:var(--font-bricolage-grotesque)] text-3xl leading-tight font-bold tracking-[-0.035em] text-[#071018] sm:text-[34px]">
          Sign in to Consumel
        </h1>
      </header>

      <Button
        className="relative w-full text-xs"
        type="button"
        variant="secondary"
        disabled={pendingMethod !== null}
        onClick={continueWithGoogle}
      >
        <GoogleIcon />
        <span>{pendingMethod === "google" ? "Opening Google…" : "Continue with Google"}</span>
        {lastMethod === "google" ? <LastUsedBadge /> : null}
      </Button>

      <div className="my-7 flex items-center gap-3 text-xs font-semibold text-[#73808a]">
        <span className="h-px flex-1 bg-[#dce3e8]" />
        <span className="flex items-center gap-2">
          Email and password
          {lastMethod === "password" ? <LastUsedBadge /> : null}
        </span>
        <span className="h-px flex-1 bg-[#dce3e8]" />
      </div>

      <form className="space-y-5" noValidate onSubmit={submitPassword}>
        <div className="space-y-2">
          <Label htmlFor="sign-in-email">Email</Label>
          <Input
            id="sign-in-email"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="sign-in-password">Password</Label>
            <Link
              className="text-sm font-semibold text-[#0767c4] hover:underline"
              href="/forgot-password"
            >
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            id="sign-in-password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        <Button className="w-full" type="submit" disabled={pendingMethod !== null}>
          {pendingMethod === "password" ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="mt-7 text-center text-sm text-[#697780]">
        New to Consumel?{" "}
        <Link className="font-semibold text-[#0767c4] hover:underline" href="/sign-up">
          Create an account
        </Link>
      </p>
    </>
  );
}
