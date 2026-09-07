import { Button } from "@/components/ui/button";
import { CalBookingButton } from "./cal-booking-button";
import { waitlistPopupAttributes, waitlistPopupHref } from "./waitlist-popup";

export function ClosingCta() {
  return (
    <section className="bg-[#087cec] py-20 text-white max-[620px]:py-16">
      <div className="page-shell grid grid-cols-[minmax(0,1fr)_auto] items-center gap-12 max-[760px]:grid-cols-1 max-[760px]:items-start max-[760px]:gap-8">
        <div>
          <h2 className="m-0 max-w-[800px] [font-family:var(--font-bricolage-grotesque)] text-[clamp(38px,4.4vw,58px)] leading-[0.96] font-bold tracking-[-0.05em]">
            Build your usage-based billing with Consumel.
          </h2>
          <p className="mt-6 mb-0 max-w-[620px] text-base leading-7 text-white/80">
            Join the waitlist or book a 30-minute call about your product&apos;s billing model.
          </p>
        </div>

        <div className="flex gap-2.5 max-[980px]:min-w-[190px] max-[980px]:flex-col max-[760px]:w-full sm:[&>*]:min-w-[168px]">
          <CalBookingButton
            className="w-full !border-white/35 !bg-white/10 !text-white hover:!bg-white/20"
            variant="quiet"
          >
            Contact sales
          </CalBookingButton>
          <Button
            asChild
            className="w-full !border-white !bg-white !text-[#071018] hover:!bg-[#edf6ff]"
            variant="secondary"
          >
            <a href={waitlistPopupHref} {...waitlistPopupAttributes}>
              Join the waitlist
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
