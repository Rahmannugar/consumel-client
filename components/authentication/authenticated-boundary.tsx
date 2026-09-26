"use client";

import { RailBoundary } from "authrail";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { APIError } from "@/lib/api/api-client";
import { authenticatedRail } from "@/lib/authentication/authentication.rail";
import type { AuthenticatedAccount } from "@/lib/authentication/authentication.types";
import { useAccount } from "@/lib/authentication/useAuthentication";

type AuthenticatedBoundaryProps = {
  children: (account: AuthenticatedAccount) => ReactNode;
};

export function AuthenticatedBoundary({ children }: AuthenticatedBoundaryProps) {
  const router = useRouter();
  const account = useAccount();
  const redirect = useCallback(
    (destination: string) => {
      router.replace(destination);
    },
    [router],
  );

  if (account.isPending) return <AccountLoading />;

  if (account.isError && !(account.error instanceof APIError && account.error.status === 401)) {
    return (
      <div className="space-y-5 text-center">
        <h1 className="font-[family-name:var(--font-bricolage-grotesque)] text-3xl font-bold tracking-[-0.03em] text-[#071018]">
          Sign-in could not be completed
        </h1>
        <Button className="w-full" type="button" onClick={() => account.refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  const authenticatedAccount = account.data ?? null;

  return (
    <RailBoundary
      rail={authenticatedRail}
      context={{ user: authenticatedAccount?.user ?? null }}
      fallback={<AccountLoading />}
      onRedirect={redirect}
    >
      {authenticatedAccount ? children(authenticatedAccount) : null}
    </RailBoundary>
  );
}

function AccountLoading() {
  return (
    <div className="space-y-7" aria-busy="true" aria-live="polite">
      <p className="sr-only">Finishing sign-in…</p>
      <div className="space-y-3" aria-hidden="true">
        <Skeleton className="h-9 w-52" />
        <Skeleton className="h-4 w-full max-w-80" />
      </div>
      <div
        className="space-y-4 rounded-xl border border-[#dce3e8] bg-[#f8fafb] p-5"
        aria-hidden="true"
      >
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-48 max-w-full" />
          </div>
        </div>
        <Skeleton className="h-px w-full rounded-none" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
        </div>
      </div>
      <Skeleton className="h-11 w-full rounded-lg" aria-hidden="true" />
    </div>
  );
}
