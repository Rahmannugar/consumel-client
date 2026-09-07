"use client";

import { getCalApi } from "@calcom/embed-react";
import { type ComponentProps, useEffect } from "react";
import { Button } from "@/components/ui/button";

type CalBookingButtonProps = ComponentProps<typeof Button>;

export function CalBookingButton({ children, ...props }: CalBookingButtonProps) {
  useEffect(() => {
    void (async () => {
      const cal = await getCalApi({ namespace: "30min" });
      cal("ui", {
        cssVarsPerTheme: {
          light: { "cal-brand": "#087CEC" },
          dark: { "cal-brand": "#087CEC" },
        },
        hideEventTypeDetails: false,
        layout: "month_view",
      });
    })();
  }, []);

  return (
    <Button
      type="button"
      data-cal-namespace="30min"
      data-cal-link="rahmannugar/30min"
      data-cal-config='{"layout":"month_view","useSlotsViewOnSmallScreen":"true","theme":"auto"}'
      {...props}
    >
      {children}
    </Button>
  );
}
