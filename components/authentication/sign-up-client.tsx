"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authenticationErrorMessage } from "@/lib/authentication/authentication.service";
import { signUpSchema } from "@/lib/authentication/authentication.validation";
import { useGoogleSignIn, useSignUp } from "@/lib/authentication/useAuthentication";
import { GoogleIcon } from "./google-icon";
import { PasswordInput } from "./password-input";

export function SignUpClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<SignUpField, string[]>>>({});
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmationRef = useRef<HTMLInputElement>(null);
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
    const result = signUpSchema.safeParse({ email, password, confirmation });
    if (!result.success) {
      const errors: Partial<Record<SignUpField, string[]>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (isSignUpField(field)) {
          errors[field] = [...(errors[field] ?? []), issue.message];
        }
      }
      setFieldErrors(errors);
      const firstInvalidField = result.error.issues
        .map((issue) => issue.path[0])
        .find(isSignUpField);
      if (firstInvalidField === "email") emailRef.current?.focus();
      if (firstInvalidField === "password") passwordRef.current?.focus();
      if (firstInvalidField === "confirmation") confirmationRef.current?.focus();
      return;
    }

    setFieldErrors({});
    signUpMutation.mutate(
      { email: result.data.email, password: result.data.password },
      {
        onSuccess: () =>
          router.push(`/verify-email?email=${encodeURIComponent(result.data.email)}`),
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

  function clearFieldError(field: SignUpField) {
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
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
            ref={emailRef}
            id="sign-up-email"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? "sign-up-email-errors" : undefined}
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              clearFieldError("email");
            }}
          />
          <FieldErrors id="sign-up-email-errors" messages={fieldErrors.email} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sign-up-password">Password</Label>
          <PasswordInput
            ref={passwordRef}
            id="sign-up-password"
            autoComplete="new-password"
            minLength={8}
            maxLength={128}
            required
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={fieldErrors.password ? "sign-up-password-errors" : undefined}
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              clearFieldError("password");
            }}
          />
          <FieldErrors id="sign-up-password-errors" messages={fieldErrors.password} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sign-up-confirmation">Confirm password</Label>
          <PasswordInput
            ref={confirmationRef}
            id="sign-up-confirmation"
            autoComplete="new-password"
            minLength={8}
            maxLength={128}
            required
            aria-invalid={Boolean(fieldErrors.confirmation)}
            aria-describedby={
              fieldErrors.confirmation ? "sign-up-confirmation-errors" : undefined
            }
            value={confirmation}
            onChange={(event) => {
              setConfirmation(event.target.value);
              clearFieldError("confirmation");
            }}
          />
          <FieldErrors id="sign-up-confirmation-errors" messages={fieldErrors.confirmation} />
        </div>
        <Button className="w-full" type="submit" disabled={pending !== null}>
          {pending === "password" ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-xs leading-5 text-[#697780]">
        By creating an account, you agree to Consumel&apos;s{" "}
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

type SignUpField = "email" | "password" | "confirmation";

function isSignUpField(field: PropertyKey | undefined): field is SignUpField {
  return field === "email" || field === "password" || field === "confirmation";
}

function FieldErrors({ id, messages }: { id: string; messages?: string[] }) {
  if (!messages?.length) return null;
  return (
    <ul
      id={id}
      className="space-y-1 text-xs font-medium text-red-600 dark:text-red-400"
      aria-live="polite"
    >
      {messages.map((message) => (
        <li key={message}>{message}</li>
      ))}
    </ul>
  );
}
