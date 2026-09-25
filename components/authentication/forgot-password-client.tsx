"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authenticationErrorMessage } from "@/lib/authentication/authentication.service";
import { useRequestPasswordReset } from "@/lib/authentication/useAuthentication";

export function ForgotPasswordClient() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const passwordResetRequest = useRequestPasswordReset();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    passwordResetRequest.mutate(email.trim().toLowerCase(), {
      onSuccess: () => setSent(true),
      onError: (requestError) => toast.error(authenticationErrorMessage(requestError)),
    });
  }

  if (sent) {
    return (
      <div className="space-y-6" aria-live="polite">
        <h1 className="font-[family-name:var(--font-bricolage-grotesque)] text-4xl font-bold tracking-[-0.035em] text-[#071018]">
          Check your email
        </h1>
        <p className="text-sm leading-6 text-[#697780]">
          If an account exists for that address, a reset link has been sent.
        </p>
        <Button className="w-full" asChild>
          <Link href="/sign-in">Return to sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <header className="mb-8 space-y-4">
        <Link className="text-sm font-semibold text-[#0767c4] hover:underline" href="/sign-in">
          Back to sign in
        </Link>
        <h1 className="font-[family-name:var(--font-bricolage-grotesque)] text-4xl font-bold tracking-[-0.035em] text-[#071018]">
          Reset your password
        </h1>
        <p className="text-sm leading-6 text-[#697780]">Enter your account email.</p>
      </header>
      <form className="space-y-5" noValidate onSubmit={submit}>
        <div className="space-y-2">
          <Label htmlFor="recovery-email">Email</Label>
          <Input
            id="recovery-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <Button className="w-full" type="submit" disabled={passwordResetRequest.isPending}>
          {passwordResetRequest.isPending ? "Sending link…" : "Send reset link"}
        </Button>
      </form>
    </>
  );
}
