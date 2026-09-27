import type * as React from "react";
import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-[#e8eef2] dark:bg-[#26333d]", className)}
      {...props}
    />
  );
}

export { Skeleton };
