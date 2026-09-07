import { ClosingCta } from "./closing-cta";
import { FaqSection } from "./faq-section";
import { HeroParallax } from "./hero-parallax";
import { PricingSection } from "./pricing-section";
import { ProductFlow } from "./product-flow";
import { ProviderShowcase } from "./provider-showcase";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { UsagePlayground } from "./usage-playground";
import { waitlistPopupAttributes, waitlistPopupHref } from "./waitlist-popup";

export function LandingPage() {
  return (
    <div className="marketing-site">
      <SiteHeader />
      <div className="blue-field !min-h-svh" id="product">
        <section className="hero !min-h-svh">
          <div className="page-shell hero__layout !min-h-svh max-[680px]:!pt-28">
            <div className="hero__copy">
              <h1>Usage-based billing, built for your product.</h1>
              <p className="hero__summary">
                Meter usage, manage customer balances and entitlements, and run prepaid,
                postpaid, or hybrid billing through the provider you already use.
              </p>
              <div className="hero__actions">
                <a
                  className="hero-action hero-action--primary"
                  href={waitlistPopupHref}
                  {...waitlistPopupAttributes}
                >
                  Join the waitlist
                </a>
                <a className="hero-action hero-action--secondary" href="#how-it-works">
                  See how it works
                </a>
              </div>
            </div>
            <HeroParallax />
          </div>
        </section>
      </div>
      <main>
        <ProductFlow />
        <UsagePlayground />
        <ProviderShowcase />
        <PricingSection />
        <FaqSection />
        <ClosingCta />
      </main>
      <SiteFooter />
    </div>
  );
}
