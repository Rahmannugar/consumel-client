import { HeroParallax } from "./hero-parallax";
import { ProductFlow } from "./product-flow";
import { SiteHeader } from "./site-header";
import { waitlistPopupAttributes, waitlistPopupHref } from "./waitlist-popup";

export function LandingPage() {
  return (
    <div className="marketing-site">
      <SiteHeader />
      <div className="blue-field" id="product">
        <section className="hero">
          <div className="page-shell hero__layout">
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
      </main>
    </div>
  );
}
