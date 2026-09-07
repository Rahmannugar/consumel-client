"use client";

import { LinkedinLogoIcon, XLogoIcon } from "@phosphor-icons/react";

export function FooterSocialLinks() {
  return (
    <div className="mt-4 flex gap-2.5">
      <a
        className="grid size-10 place-items-center rounded-lg border border-white/15 text-[#b8c8d2] transition-colors hover:border-white/30 hover:text-white"
        href="https://www.linkedin.com/company/consumel/"
        target="_blank"
        rel="noreferrer"
        aria-label="Consumel on LinkedIn"
      >
        <LinkedinLogoIcon className="size-5" weight="fill" aria-hidden="true" />
      </a>
      <a
        className="grid size-10 place-items-center rounded-lg border border-white/15 text-[#b8c8d2] transition-colors hover:border-white/30 hover:text-white"
        href="https://x.com/consumelcom"
        target="_blank"
        rel="noreferrer"
        aria-label="Consumel on X"
      >
        <XLogoIcon className="size-5" weight="bold" aria-hidden="true" />
      </a>
    </div>
  );
}
