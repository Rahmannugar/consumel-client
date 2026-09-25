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
} from "@/lib/authentication/authentication.service";
import { useAuthenticationStore } from "@/lib/authentication/authentication.store";
import {
  forgotPasswordSchema,
  validationMessage,
  verificationSchema,
} from "@/lib/authentication/authentication.validation";
import { useResendVerification, useVerifyEmail } from "@/lib/authentication/useAuthentication";

export function VerifyEmailClient({ email }: { email: string }) {
  const router = useRouter();
  const rememberSignInMethod = useAuthenticationStore((state) => state.rememberSignInMethod);
  const [code, setCode] = useState("");
  const [resendIn, setResendIn] = useState(30);
  const verification = useVerifyEmail();
  const resendVerification = useResendVerification();
  const pending = verification.isPending
    ? "verify"
    : resendVerification.isPending
      ? "resend"
      : null;

  useEffect(() => {
    if (resendIn === 0) return;
    const timer = window.setInterval(() => {
      setResendIn((current) => Math.max(0, current - 1));
    }, 1_000);
    return () => window.clearInterval(timer);
  }, [resendIn]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = verificationSchema.safeParse({ email, code });
    if (!result.success) {
      toast.error(validationMessage(result));
      return;
    }
    verification.mutate(result.data, {
      onSuccess: (account) => {
        rememberSignInMethod("password");
        router.replace(authenticatedDestination(account));
      },
      onError: (requestError) => toast.error(authenticationErrorMessage(requestError)),
    });
  }

  function resend() {
    const result = forgotPasswordSchema.safeParse({ email });
    if (!result.success) {
      toast.error(validationMessage(result));
      return;
    }
    resendVerification.mutate(result.data.email, {
      onSuccess: () => {
        setResendIn(60);
        toast.success("A new verification code was sent.");
      },
      onError: (requestError) => toast.error(authenticationErrorMessage(requestError)),
    });
  }

  if (!email) {
    return (
      <div className="space-y-6">
        <h1 className="font-[family-name:var(--font-bricolage-grotesque)] text-4xl font-bold tracking-[-0.035em] text-[#071018]">
          Email address missing
        </h1>
        <p className="text-sm leading-6 text-[#697780]">Return to sign up and try again.</p>
        <Button className="w-full" asChild>
          <Link href="/sign-up">Return to sign up</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <header className="mb-8 space-y-4">
        <Link className="text-sm font-semibold text-[#0767c4] hover:underline" href="/sign-up">
          Back to sign up
        </Link>
        <h1 className="font-[family-name:var(--font-bricolage-grotesque)] text-4xl font-bold tracking-[-0.035em] text-[#071018]">
          Verify your email
        </h1>
        <p className="text-sm leading-6 text-[#697780]">
          Enter the six-digit code sent to <strong>{email}</strong>.
        </p>
      </header>
      <form className="space-y-5" noValidate onSubmit={submit}>
        <div className="space-y-2">
          <Label htmlFor="verification-code">Verification code</Label>
          <Input
            className="text-center font-mono text-lg tracking-[0.45em]"
            id="verification-code"
            autoComplete="one-time-code"
            inputMode="numeric"
            maxLength={6}
            autoFocus
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
          />
        </div>
        <Button className="w-full" type="submit" disabled={pending !== null}>
          {pending === "verify" ? "Verifying…" : "Verify and continue"}
        </Button>
        <Button
          className="w-full"
          type="button"
          variant="quiet"
          disabled={pending !== null || resendIn > 0}
          onClick={resend}
        >
          {pending === "resend"
            ? "Sending code…"
            : resendIn > 0
              ? `Resend code in ${resendIn}s`
              : "Resend code"}
        </Button>
      </form>
    </>
  );
}
