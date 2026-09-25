import type * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-lg border border-[#cbd5dc] bg-white px-3 text-sm text-[#13202a] shadow-xs outline-none transition-[border-color,box-shadow] placeholder:text-[#84919a] hover:border-[#aebdc7] focus-visible:border-[#087cec] focus-visible:ring-3 focus-visible:ring-[#087cec]/15 disabled:cursor-not-allowed disabled:opacity-55 aria-invalid:border-red-500 aria-invalid:ring-3 aria-invalid:ring-red-500/15",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
