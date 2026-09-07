"use client";

import { LinkedinLogoIcon, ListIcon, XIcon, XLogoIcon } from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Dialog } from "radix-ui";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Brand } from "./brand";
import { CalBookingButton } from "./cal-booking-button";
import { WaitlistLink } from "./waitlist-link";

type NavigationItem = {
  label: string;
  href: string;
};

type MobileNavigationProps = {
  items: NavigationItem[];
};

export function MobileNavigation({ items }: MobileNavigationProps) {
  const [open, setOpen] = useState(false);
  const reducedMotion = useReducedMotion();
  const sheetTransition = reducedMotion
    ? { duration: 0 }
    : { duration: 0.36, ease: [0.4, 0, 0.2, 1] as const };
  const contentTransition = reducedMotion
    ? { duration: 0 }
    : { duration: 0.18, delay: 0.08, ease: "easeOut" as const };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button
          className="!grid !size-10 !min-h-10 place-items-center !rounded-full !border-white/20 !bg-white/10 !p-0 !text-white hover:!bg-white/20 lg:!hidden"
          type="button"
          variant="quiet"
          size="compact"
          aria-label="Open navigation"
        >
          <ListIcon weight="bold" aria-hidden="true" />
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal forceMount>
        <AnimatePresence initial={false}>
          {open && (
            <Dialog.Content
              asChild
              forceMount
              aria-describedby={undefined}
              key="mobile-navigation-sheet"
            >
              <motion.div
                className="fixed inset-0 z-[61] overflow-hidden text-white"
                initial={{ opacity: reducedMotion ? 0 : 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: reducedMotion ? 0 : 1 }}
                transition={sheetTransition}
              >
                <motion.div
                  aria-hidden="true"
                  className="pointer-events-none fixed top-11 left-[calc(100%_-_40px)] size-[240vmax] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#087cec] will-change-transform"
                  initial={{ scale: reducedMotion ? 1 : 0.022 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: reducedMotion ? 1 : 0.022 }}
                  transition={sheetTransition}
                />

                <motion.div
                  className="relative z-10 flex h-full flex-col overflow-y-auto px-[22px] py-5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={contentTransition}
                >
                  <div className="flex items-center justify-between">
                    <Dialog.Title className="sr-only">Navigation</Dialog.Title>
                    <Brand inverse />
                    <Dialog.Close asChild>
                      <Button
                        className="!grid !size-10 !min-h-10 place-items-center !rounded-full !border-white/20 !bg-white/10 !p-0 !text-white hover:!bg-white/20"
                        type="button"
                        variant="quiet"
                        size="compact"
                        aria-label="Close navigation"
                      >
                        <XIcon weight="bold" aria-hidden="true" />
                      </Button>
                    </Dialog.Close>
                  </div>

                  <nav aria-label="Mobile navigation" className="mt-12 grid">
                    {items.map((item) => (
                      <Dialog.Close asChild key={item.href}>
                        <a
                          className="border-b border-white/20 py-[15px] [font-family:var(--font-bricolage-grotesque)] text-[clamp(28px,9vw,42px)] leading-none font-semibold tracking-[-0.035em] text-white no-underline"
                          href={item.href}
                        >
                          {item.label}
                        </a>
                      </Dialog.Close>
                    ))}
                  </nav>

                  <div className="mt-[30px] grid gap-2.5">
                    <CalBookingButton
                      className="w-full !rounded-[9px] !border-white/35 !bg-white/10 !text-white hover:!bg-white/20"
                      onClick={() => setOpen(false)}
                      variant="quiet"
                    >
                      Contact sales
                    </CalBookingButton>
                    <Dialog.Close asChild>
                      <Button
                        asChild
                        className="w-full !rounded-[9px] !border-white !bg-white !text-[#071018] hover:!bg-[#edf6ff]"
                        variant="secondary"
                      >
                        <WaitlistLink>Join the waitlist</WaitlistLink>
                      </Button>
                    </Dialog.Close>
                  </div>

                  <nav
                    className="mt-auto flex gap-2.5 pt-8"
                    aria-label="Consumel on social media"
                  >
                    <a
                      className="grid size-11 place-items-center rounded-[9px] border border-white/25 text-white"
                      href="https://www.linkedin.com/company/consumel/"
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Consumel on LinkedIn"
                    >
                      <LinkedinLogoIcon className="size-5" weight="fill" aria-hidden="true" />
                    </a>
                    <a
                      className="grid size-11 place-items-center rounded-[9px] border border-white/25 text-white"
                      href="https://x.com/consumelcom"
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Consumel on X"
                    >
                      <XLogoIcon className="size-5" weight="bold" aria-hidden="true" />
                    </a>
                  </nav>
                </motion.div>
              </motion.div>
            </Dialog.Content>
          )}
        </AnimatePresence>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
