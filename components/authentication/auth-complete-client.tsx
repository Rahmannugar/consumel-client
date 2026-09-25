"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { authenticatedDestination } from "@/lib/authentication/authentication.service";
import { useAuthenticationStore } from "@/lib/authentication/authentication.store";
import type { AuthenticatedAccount } from "@/lib/authentication/authentication.types";
import { AuthenticatedBoundary } from "./authenticated-boundary";

export function AuthCompleteClient() {
  return (
    <AuthenticatedBoundary>
      {(account) => <CompleteGoogleSignIn account={account} />}
    </AuthenticatedBoundary>
  );
}

function CompleteGoogleSignIn({ account }: { account: AuthenticatedAccount }) {
  const router = useRouter();
  const rememberSignInMethod = useAuthenticationStore((state) => state.rememberSignInMethod);

  useEffect(() => {
    rememberSignInMethod("google");
    router.replace(authenticatedDestination(account));
  }, [account, rememberSignInMethod, router]);

  return (
    <p className="text-center text-sm font-medium text-[#697780]" aria-live="polite">
      Opening your account…
    </p>
  );
}
