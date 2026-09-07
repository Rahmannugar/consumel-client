import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="not-found-page flex min-h-svh flex-col bg-[#087cec]">
      <SiteHeader sectionHrefPrefix="/" />
      <main className="flex min-h-[760px] flex-1 items-center overflow-hidden pt-28 pb-20 text-white max-[620px]:min-h-[650px] max-[620px]:pt-24">
        <section className="page-shell relative py-20">
          <p
            className="pointer-events-none absolute -top-28 -right-8 m-0 select-none [font-family:var(--font-bricolage-grotesque)] text-[clamp(190px,32vw,470px)] leading-none font-bold tracking-[-0.08em] text-white/[0.07]"
            aria-hidden="true"
          >
            404
          </p>
          <div className="relative z-10 max-w-[690px]">
            <h1 className="m-0 [font-family:var(--font-bricolage-grotesque)] text-[clamp(52px,8vw,96px)] leading-[0.94] font-bold tracking-[-0.055em] text-balance">
              That page isn&apos;t here.
            </h1>
            <p className="mt-7 mb-0 max-w-[570px] text-[17px] leading-7 text-white/82">
              The address may be incorrect or the page may have moved. Return to the Consumel
              homepage to continue.
            </p>
            <Link
              className="mt-9 inline-flex min-h-12 items-center justify-center rounded-[9px] border border-white bg-white px-5 text-sm font-bold text-[#071018] no-underline transition-transform hover:-translate-y-0.5 hover:bg-[#edf6ff]"
              href="/"
            >
              Return home
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter sectionHrefPrefix="/" />
    </div>
  );
}
