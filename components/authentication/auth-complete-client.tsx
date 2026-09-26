"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
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
    <div className="space-y-3" aria-busy="true" aria-live="polite">
      <p className="sr-only">Opening your account…</p>
      <Skeleton className="h-9 w-52" aria-hidden="true" />
      <Skeleton className="h-4 w-72 max-w-full" aria-hidden="true" />
      <Skeleton className="mt-7 h-11 w-full rounded-lg" aria-hidden="true" />
    </div>
  );
}
