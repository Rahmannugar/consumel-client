import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import type * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva("ui-button", {
  variants: {
    variant: {
      primary: "ui-button--primary",
      secondary: "ui-button--secondary",
      quiet: "ui-button--quiet",
    },
    size: {
      default: "ui-button--default",
      compact: "ui-button--compact",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "default",
  },
});

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
