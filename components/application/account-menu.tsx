"use client";

import { GearIcon, SignOutIcon } from "@phosphor-icons/react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSignOut } from "@/lib/authentication/useAuthentication";

export function AccountMenu({ email }: { email: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const signOut = useSignOut();
  const initial = email.slice(0, 1).toUpperCase();

  function endSession() {
    signOut.mutate(undefined, {
      onSuccess: () => {
        queryClient.clear();
        router.replace("/sign-in");
      },
      onError: () => toast.error("Consumel could not sign you out. Try again."),
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="grid size-9 shrink-0 place-items-center rounded-full border border-primary/70 bg-primary text-xs font-semibold text-primary-foreground shadow-[0_2px_8px_rgb(8_124_236/0.2)] outline-none ring-offset-background transition-[box-shadow,transform] hover:-translate-y-px hover:shadow-[0_4px_12px_rgb(8_124_236/0.25)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Open account menu"
        >
          {initial}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-64">
        <DropdownMenuLabel className="px-2.5 py-2">
          <span className="block truncate text-[13px] font-medium text-foreground">
            {email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled className="min-h-9 px-2.5">
          <GearIcon />
          Account settings
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          className="min-h-9 px-2.5"
          disabled={signOut.isPending}
          onSelect={endSession}
        >
          <SignOutIcon />
          {signOut.isPending ? "Signing out…" : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
