"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { authenticationErrorMessage } from "@/lib/authentication/authentication.service";
import { passwordValidationMessage } from "@/lib/authentication/authentication.validation";
import { useResetPassword } from "@/lib/authentication/useAuthentication";
import { PasswordInput } from "./password-input";

export function ResetPasswordClient({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [complete, setComplete] = useState(false);
  const passwordReset = useResetPassword();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      toast.error("This password-reset link is incomplete.");
      return;
    }
    const validationMessage = passwordValidationMessage(password);
    if (validationMessage) {
      toast.error(validationMessage);
      return;
    }
    if (password !== confirmation) {
      toast.error("The passwords do not match.");
      return;
    }

    passwordReset.mutate(
      { token, password },
      {
        onSuccess: () => setComplete(true),
        onError: (requestError) => toast.error(authenticationErrorMessage(requestError)),
      },
    );
  }

  if (complete) {
    return (
      <div className="space-y-6" aria-live="polite">
        <h1 className="font-[family-name:var(--font-bricolage-grotesque)] text-4xl font-bold tracking-[-0.035em] text-[#071018]">
          Password updated
        </h1>
        <p className="text-sm leading-6 text-[#697780]">Sign in with your new password.</p>
        <Button className="w-full" asChild>
          <Link href="/sign-in">Sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <header className="mb-8 space-y-3">
        <h1 className="font-[family-name:var(--font-bricolage-grotesque)] text-4xl font-bold tracking-[-0.035em] text-[#071018]">
          Choose a new password
        </h1>
        <p className="text-sm leading-6 text-[#697780]">
          Updating your password signs out your other sessions.
        </p>
      </header>
      <form className="space-y-5" noValidate onSubmit={submit}>
        <div className="space-y-2">
          <Label htmlFor="new-password">New password</Label>
          <PasswordInput
            id="new-password"
            autoComplete="new-password"
            minLength={12}
            maxLength={128}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm password</Label>
          <PasswordInput
            id="confirm-password"
            autoComplete="new-password"
            required
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
          />
        </div>
        <Button className="w-full" type="submit" disabled={passwordReset.isPending}>
          {passwordReset.isPending ? "Updating password…" : "Update password"}
        </Button>
      </form>
    </>
  );
}
