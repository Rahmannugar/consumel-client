"use client";

import { RailBoundary } from "authrail";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
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
    <div className="space-y-4 text-center" aria-live="polite">
      <span
        className="mx-auto block size-8 animate-spin rounded-full border-3 border-[#dce3e8] border-t-[#087cec]"
        aria-hidden="true"
      />
      <p className="text-sm font-medium text-[#697780]">Finishing sign-in…</p>
    </div>
  );
}
