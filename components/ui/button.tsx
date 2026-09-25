import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import type * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-4 text-[13px] font-bold whitespace-nowrap transition-[color,background-color,border-color,box-shadow,transform] outline-none hover:-translate-y-px focus-visible:border-[#087cec] focus-visible:ring-3 focus-visible:ring-[#087cec]/20 disabled:pointer-events-none disabled:opacity-55 disabled:hover:translate-y-0 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "border-[#087cec] bg-[#087cec] text-white hover:border-[#076fd2] hover:bg-[#076fd2]",
        secondary:
          "border-[#c8d2d9] bg-white text-[#17232d] shadow-xs hover:border-[#9eb3c1] hover:bg-[#f5f9fc] hover:text-[#075aaf]",
        quiet:
          "border-transparent bg-transparent text-[#53616b] hover:border-[#edf2f5] hover:bg-[#edf2f5] hover:text-[#071018]",
      },
      size: {
        default: "min-h-11 px-4",
        compact: "min-h-9 px-3",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "primary",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
