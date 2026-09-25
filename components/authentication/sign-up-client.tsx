"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authenticationErrorMessage } from "@/lib/authentication/authentication.service";
import { passwordValidationMessage } from "@/lib/authentication/authentication.validation";
import { useGoogleSignIn, useSignUp } from "@/lib/authentication/useAuthentication";
import { GoogleIcon } from "./google-icon";
import { PasswordInput } from "./password-input";

export function SignUpClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const signUpMutation = useSignUp();
  const googleSignIn = useGoogleSignIn();
  const pending = signUpMutation.isPending
    ? "password"
    : googleSignIn.isPending
      ? "google"
      : null;

  useEffect(() => {
    // Reset a stale OAuth state when the user cancels Google and returns here.
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

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationMessage = passwordValidationMessage(password);
    if (validationMessage) {
      toast.error(validationMessage);
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    signUpMutation.mutate(
      { email: normalizedEmail, password },
      {
        onSuccess: () =>
          router.push(`/verify-email?email=${encodeURIComponent(normalizedEmail)}`),
        onError: (requestError) => toast.error(authenticationErrorMessage(requestError)),
      },
    );
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
          Create your account
        </h1>
      </header>

      <Button
        className="w-full text-xs"
        type="button"
        variant="secondary"
        disabled={pending !== null}
        onClick={continueWithGoogle}
      >
        <GoogleIcon />
        {pending === "google" ? "Opening Google…" : "Continue with Google"}
      </Button>

      <div className="my-7 flex items-center gap-3 text-xs font-semibold text-[#73808a]">
        <span className="h-px flex-1 bg-[#dce3e8]" />
        <span>Email and password</span>
        <span className="h-px flex-1 bg-[#dce3e8]" />
      </div>

      <form className="space-y-5" noValidate onSubmit={submit}>
        <div className="space-y-2">
          <Label htmlFor="sign-up-email">Email</Label>
          <Input
            id="sign-up-email"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sign-up-password">Password</Label>
          <PasswordInput
            id="sign-up-password"
            autoComplete="new-password"
            minLength={12}
            maxLength={128}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        <Button className="w-full" type="submit" disabled={pending !== null}>
          {pending === "password" ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-xs leading-5 text-[#697780]">
        By creating an account, you agree to the{" "}
        <Link className="font-semibold text-[#0767c4] hover:underline" href="/terms-of-service">
          Terms
        </Link>{" "}
        and{" "}
        <Link className="font-semibold text-[#0767c4] hover:underline" href="/privacy-policy">
          Privacy Policy
        </Link>
        .
      </p>
      <p className="mt-6 text-center text-sm text-[#697780]">
        Already have an account?{" "}
        <Link className="font-semibold text-[#0767c4] hover:underline" href="/sign-in">
          Sign in
        </Link>
      </p>
    </>
  );
}
