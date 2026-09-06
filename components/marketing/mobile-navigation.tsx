"use client";

import { LinkedinLogoIcon, ListIcon, XIcon, XLogoIcon } from "@phosphor-icons/react";
import { Dialog } from "radix-ui";

type NavigationItem = {
  label: string;
  href: string;
};

type MobileNavigationProps = {
  items: NavigationItem[];
};

export function MobileNavigation({ items }: MobileNavigationProps) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="mobile-nav__trigger" type="button" aria-label="Open navigation">
          <ListIcon weight="bold" aria-hidden="true" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="mobile-nav__overlay" />
        <Dialog.Content className="mobile-nav__panel" aria-describedby={undefined}>
          <div className="mobile-nav__top">
            <Dialog.Title className="sr-only">Navigation</Dialog.Title>
            <Dialog.Close asChild>
              <button className="mobile-nav__close" type="button" aria-label="Close navigation">
                <XIcon weight="bold" aria-hidden="true" />
              </button>
            </Dialog.Close>
          </div>

          <nav aria-label="Mobile navigation" className="mobile-nav__links">
            {items.map((item) => (
              <Dialog.Close asChild key={item.href}>
                <a href={item.href}>{item.label}</a>
              </Dialog.Close>
            ))}
          </nav>

          <Dialog.Close asChild>
            <a className="mobile-nav__waitlist" href="#waitlist">
              Join the waitlist
            </a>
          </Dialog.Close>

          <nav className="mobile-nav__socials" aria-label="Consumel on social media">
            <a
              href="https://www.linkedin.com/company/consumel/"
              target="_blank"
              rel="noreferrer"
              aria-label="Consumel on LinkedIn"
            >
              <LinkedinLogoIcon weight="fill" aria-hidden="true" />
            </a>
            <a
              href="https://x.com/consumelcom"
              target="_blank"
              rel="noreferrer"
              aria-label="Consumel on X"
            >
              <XLogoIcon weight="bold" aria-hidden="true" />
            </a>
          </nav>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
