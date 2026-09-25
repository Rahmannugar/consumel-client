"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      position="top-right"
      toastOptions={{
        classNames: {
          toast: "!rounded-lg !border-[#dce3e8] !bg-white !text-[#071018] !shadow-lg",
          description: "!text-[#63707a]",
          actionButton: "!bg-[#087cec] !text-white",
        },
      }}
    />
  );
}
