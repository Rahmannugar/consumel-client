import Link from "next/link";
import { Brand } from "./brand";
import { FooterSocialLinks } from "./footer-social-links";

const linkGroups = [
  {
    label: "Product",
    links: [
      { label: "How it works", href: "#how-it-works" },
      { label: "Providers", href: "#providers" },
      { label: "Pricing", href: "#pricing" },
    ],
  },
  {
    label: "Resources",
    links: [
      { label: "Playground", href: "#playground" },
      { label: "FAQ", href: "#faq" },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="bg-[#06131f] py-12 text-white max-[620px]:py-10">
      <div className="page-shell">
        <div className="grid grid-cols-[minmax(240px,1.1fr)_minmax(340px,0.9fr)_auto] gap-12 max-[820px]:grid-cols-[1fr_auto] max-[820px]:gap-10 max-[480px]:gap-x-7">
          <div className="max-[820px]:col-span-2">
            <Brand inverse />
            <p className="mt-3 mb-0 max-w-[330px] text-sm leading-6 text-[#9fb1bf]">
              Infrastructure for usage-based billing.
            </p>
          </div>

          <nav aria-label="Explore Consumel">
            <h2 className="m-0 text-xs font-bold tracking-[0.08em] text-[#7f95a5] uppercase">
              Explore
            </h2>
            <div className="mt-4 grid grid-cols-[max-content_max-content] gap-x-10 max-[480px]:gap-x-7">
              {linkGroups.map((group) => (
                <div key={group.label}>
                  <h3 className="m-0 text-[10px] font-bold tracking-[0.08em] text-[#6f8595] uppercase">
                    {group.label}
                  </h3>
                  <ul className="mt-3 grid list-none gap-y-3 p-0">
                    {group.links.map((item) => (
                      <li key={item.href}>
                        <a
                          className="whitespace-nowrap text-sm text-[#c5d1d9] no-underline hover:text-white"
                          href={item.href}
                        >
                          {item.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </nav>

          <nav aria-label="Consumel on social media">
            <h2 className="m-0 text-xs font-bold tracking-[0.08em] text-[#7f95a5] uppercase">
              Socials
            </h2>
            <FooterSocialLinks />
          </nav>
        </div>

        <div className="mt-10 flex items-center justify-between gap-6 border-t border-white/12 pt-5 text-xs text-[#7f95a5] max-[560px]:items-start max-[560px]:flex-col-reverse">
          <p className="m-0">© 2026 Consumel.</p>
          <div className="flex gap-5">
            <Link className="text-[#aebdc7] no-underline hover:text-white" href="/privacy">
              Privacy Policy
            </Link>
            <Link className="text-[#aebdc7] no-underline hover:text-white" href="/terms">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
