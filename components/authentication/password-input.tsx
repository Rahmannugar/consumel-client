"use client";

import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";
import { type ComponentProps, forwardRef, useState } from "react";
import { Input } from "@/components/ui/input";

export const PasswordInput = forwardRef<HTMLInputElement, ComponentProps<"input">>(
  function PasswordInput(props, ref) {
    const [visible, setVisible] = useState(false);

    return (
      <div className="relative">
        <Input {...props} className="pr-11" ref={ref} type={visible ? "text" : "password"} />
        <button
          type="button"
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-[#687780] transition-colors hover:text-[#087cec] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#087cec]/20"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? (
            <EyeSlashIcon className="size-5" aria-hidden="true" />
          ) : (
            <EyeIcon className="size-5" aria-hidden="true" />
          )}
        </button>
      </div>
    );
  },
);
