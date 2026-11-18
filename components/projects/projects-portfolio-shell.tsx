"use client";

import {
  BellIcon,
  BookOpenTextIcon,
  BuildingsIcon,
  DotsThreeVerticalIcon,
} from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { AccountMenu } from "@/components/application/account-menu";
import { ThemeToggle } from "@/components/application/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { AuthenticatedAccount } from "@/lib/authentication/authentication.types";

export function ProjectsPortfolioShell({
  account,
  children,
}: {
  account: AuthenticatedAccount;
  children: ReactNode;
}) {
  const organizationName = account.organizations[0]?.name ?? "Organization";

  return (
    <TooltipProvider>
      <div className="min-h-svh bg-background text-foreground">
        <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur-xl">
          <div className="mx-auto flex h-14 w-full max-w-[1440px] items-center gap-3 px-4 sm:px-6 lg:px-8">
            <Link
              href="/dashboard"
              className="flex min-w-0 items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Image src="/assets/logo.png" alt="Consumel" width={29} height={29} priority />
              <DotsThreeVerticalIcon
                className="-ml-1 size-4 text-muted-foreground"
                weight="bold"
              />
            </Link>
            <div className="hidden h-5 w-px bg-border sm:block" />
            <div className="hidden min-w-0 items-center gap-2 sm:flex">
              <BuildingsIcon className="size-4 shrink-0 text-muted-foreground" />
              <span className="truncate text-sm font-medium">{organizationName}</span>
            </div>
            <div className="flex-1" />
            <UnavailableUtility label="Documentation">
              <BookOpenTextIcon className="size-[17px]" />
              <span className="hidden text-xs font-medium sm:inline">Docs</span>
            </UnavailableUtility>
            <UnavailableUtility label="Notifications">
              <BellIcon className="size-[18px]" />
            </UnavailableUtility>
            <ThemeToggle />
            <AccountMenu email={account.user.email} />
          </div>
        </header>
        {children}
      </div>
    </TooltipProvider>
  );
}

function UnavailableUtility({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span>
          <Button
            type="button"
            variant="quiet"
            size="compact"
            className="size-9 min-h-9 border-border bg-card px-0 text-muted-foreground hover:border-border hover:bg-secondary hover:text-foreground disabled:opacity-100 sm:w-auto sm:px-2.5"
            disabled
            aria-label={`${label} is not available yet`}
          >
            {children}
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent>{label} is not available yet</TooltipContent>
    </Tooltip>
  );
}
