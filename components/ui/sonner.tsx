"use client";

import { CheckCircle, Warning, XCircle } from "@phosphor-icons/react";
import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      position="top-right"
      icons={{
        success: <CheckCircle className="size-4 text-[#58a9f8]" weight="fill" />,
        warning: <Warning className="size-4 text-amber-400" weight="fill" />,
        error: <XCircle className="size-4 text-red-400" weight="fill" />,
      }}
      toastOptions={{
        classNames: {
          toast: "!rounded-lg !border-white/15 !bg-[#071018] !text-white !shadow-lg",
          success: "!border-[#58a9f8]/50",
          warning: "!border-amber-400/50",
          error: "!border-red-400/50",
          description: "!text-[#aab4bc]",
          actionButton: "!bg-[#087cec] !text-white",
        },
      }}
    />
  );
}
