"use client";

import { Button } from "@/components/ui/button";
import { getCalApi } from "@calcom/embed-react";
import { type ComponentProps, useEffect, useRef, useState } from "react";

type CalBookingButtonProps = ComponentProps<typeof Button>;

const calLink = "rahmannugar/30min";
const calFallbackUrl = `https://cal.com/${calLink}`;
const calConfig = {
  layout: "month_view",
  useSlotsViewOnSmallScreen: "true",
  theme: "auto",
} as const;

export function CalBookingButton({ children, onClick, ...props }: CalBookingButtonProps) {
  const [isOpening, setIsOpening] = useState(false);
  const isMounted = useRef(true);
  const calApi = useRef<Awaited<ReturnType<typeof getCalApi>> | null>(null);
  const isReady = useRef(false);
  const hasFailed = useRef(false);
  const isOpeningRef = useRef(false);
  const fallbackTimer = useRef<number | null>(null);

  useEffect(() => {
    isMounted.current = true;
    const stopOpening = () => {
      if (fallbackTimer.current) window.clearTimeout(fallbackTimer.current);
      fallbackTimer.current = null;
      isOpeningRef.current = false;
      if (isMounted.current) setIsOpening(false);
    };
    const handleLinkReady = () => {
      isReady.current = true;
      hasFailed.current = false;
      stopOpening();
    };
    const handleLinkFailed = () => {
      hasFailed.current = true;
      if (isOpeningRef.current) window.location.assign(calFallbackUrl);
    };

    void (async () => {
      try {
        const cal = await getCalApi({ namespace: "30min" });
        if (!isMounted.current) return;

        calApi.current = cal;
        cal("on", { action: "linkReady", callback: handleLinkReady });
        cal("on", { action: "linkFailed", callback: handleLinkFailed });
        cal("ui", {
          cssVarsPerTheme: {
            light: { "cal-brand": "#087CEC" },
            dark: { "cal-brand": "#087CEC" },
          },
          hideEventTypeDetails: false,
          layout: "month_view",
        });
        cal("preload", { calLink, type: "modal" });
      } catch {
        // The hosted booking page remains available through the click fallback.
      }
    })();

    return () => {
      isMounted.current = false;
      if (fallbackTimer.current) window.clearTimeout(fallbackTimer.current);
      const cal = calApi.current;
      if (cal) {
        cal("off", { action: "linkReady", callback: handleLinkReady });
        cal("off", { action: "linkFailed", callback: handleLinkFailed });
      }
    };
  }, []);

  return (
    <Button
      type="button"
      aria-busy={isOpening}
      onClick={async (event) => {
        onClick?.(event);
        if (event.defaultPrevented || props.disabled) return;

        setIsOpening(true);
        isOpeningRef.current = true;

        try {
          const cal = calApi.current ?? (await getCalApi({ namespace: "30min" }));
          if (hasFailed.current) {
            window.location.assign(calFallbackUrl);
            return;
          }

          cal("modal", { calLink, config: calConfig });
          if (isReady.current) {
            isOpeningRef.current = false;
            setIsOpening(false);
            return;
          }

          fallbackTimer.current = window.setTimeout(() => {
            if (isOpeningRef.current) window.location.assign(calFallbackUrl);
          }, 8_000);
        } catch {
          window.location.assign(calFallbackUrl);
        }
      }}
      {...props}
    >
      <span aria-live="polite">{isOpening ? "Opening calendar…" : children}</span>
    </Button>
  );
}
