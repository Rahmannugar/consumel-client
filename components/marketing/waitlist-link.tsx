"use client";

import { type ComponentProps, forwardRef, useState } from "react";

const waitlistFormId = "0Q9eL6";
const waitlistFallbackUrl = `https://tally.so/r/${waitlistFormId}`;

type TallyPopupOptions = {
  layout: "modal";
  width: number;
  onOpen: () => void;
  onClose: () => void;
};

type TallyApi = {
  openPopup: (formId: string, options: TallyPopupOptions) => void;
};

declare global {
  interface Window {
    Tally?: TallyApi;
  }
}

type WaitlistLinkProps = ComponentProps<"a">;

export const WaitlistLink = forwardRef<HTMLAnchorElement, WaitlistLinkProps>(
  function WaitlistLink({ children, onClick, ...props }, ref) {
    const [isOpening, setIsOpening] = useState(false);

    return (
      <a
        href={waitlistFallbackUrl}
        ref={ref}
        aria-busy={isOpening}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented) return;

          const tally = window.Tally;
          if (!tally) return;

          event.preventDefault();
          setIsOpening(true);

          try {
            tally.openPopup(waitlistFormId, {
              layout: "modal",
              width: 645,
              onOpen: () => setIsOpening(false),
              onClose: () => setIsOpening(false),
            });
          } catch {
            window.location.assign(waitlistFallbackUrl);
          }
        }}
        {...props}
      >
        <span aria-live="polite">{isOpening ? "Opening form…" : children}</span>
      </a>
    );
  },
);
