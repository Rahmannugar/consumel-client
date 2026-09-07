import { Button } from "@/components/ui/button";
import { Brand } from "./brand";
import { CalBookingButton } from "./cal-booking-button";
import { MobileNavigation } from "./mobile-navigation";
import { waitlistPopupAttributes, waitlistPopupHref } from "./waitlist-popup";

const navigation = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Playground", href: "#playground" },
  { label: "Providers", href: "#providers" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

type SiteHeaderProps = {
  sectionHrefPrefix?: "" | "/";
};

export function SiteHeader({ sectionHrefPrefix = "" }: SiteHeaderProps) {
  const navigationItems = navigation.map((item) => ({
    ...item,
    href: `${sectionHrefPrefix}${item.href}`,
  }));

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6">
      <div className="pointer-events-auto mx-auto flex h-16 w-full max-w-[1280px] items-center justify-between gap-6 rounded-full border border-white/25 bg-[#087cec]/85 px-4 shadow-[0_14px_40px_rgb(0_50_105/22%)] backdrop-blur-xl sm:px-5">
        <Brand inverse />
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Main navigation">
          {navigationItems.map((item) => (
            <a
              className="rounded-full px-1 py-3 text-[13px] font-semibold text-white no-underline transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          <CalBookingButton
            className="!min-h-10 !rounded-full !border-white/30 !bg-white/10 !px-4 !text-white hover:!border-white/45 hover:!bg-white/20"
            size="compact"
            variant="quiet"
          >
            Contact sales
          </CalBookingButton>
          <Button
            asChild
            className="!min-h-10 !rounded-full !border-white !bg-white !px-4 !text-[#071018] hover:!bg-[#edf6ff]"
            size="compact"
            variant="secondary"
          >
            <a href={waitlistPopupHref} {...waitlistPopupAttributes}>
              Join the waitlist
            </a>
          </Button>
        </div>
        <MobileNavigation items={navigationItems} />
      </div>
    </header>
  );
}
