import Script from "next/script";
import { HeroParallax } from "./hero-parallax";
import { SiteHeader } from "./site-header";
import { waitlistPopupAttributes, waitlistPopupHref } from "./waitlist-popup";

export function LandingPage() {
  return (
    <div className="marketing-site">
      <div className="blue-field" id="product">
        <SiteHeader />
        <main>
          <section className="hero">
            <div className="page-shell hero__layout">
              <div className="hero__copy">
                <h1>Usage-based billing, built for your product.</h1>
                <p className="hero__summary">
                  Each time a customer uses your product, Consumel records the usage, updates
                  their balance or allowance, and connects usage to your billing provider.
                </p>
                <div className="hero__actions">
                  <a
                    className="hero-action hero-action--primary"
                    href={waitlistPopupHref}
                    {...waitlistPopupAttributes}
                  >
                    Join the waitlist
                  </a>
                  <a className="hero-action hero-action--secondary" href="#playground">
                    Try the playground
                  </a>
                </div>
              </div>
              <HeroParallax />
            </div>
          </section>
        </main>
      </div>
      <Script src="https://tally.so/widgets/embed.js" strategy="lazyOnload" />
    </div>
  );
}
