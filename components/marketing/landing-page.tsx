import { SoftAurora } from "@/components/react-bits/soft-aurora";
import { HeroParallax } from "./hero-parallax";
import { SiteHeader } from "./site-header";

export function LandingPage() {
  return (
    <div className="marketing-site">
      <div className="blue-field" id="product">
        <SiteHeader />
        <div className="hero-aurora" aria-hidden="true">
          <SoftAurora
            speed={0.24}
            scale={1.15}
            brightness={1.05}
            color1="#a4e1ff"
            color2="#1267c4"
            noiseFrequency={1.6}
            noiseAmplitude={0.65}
            bandHeight={0.48}
            bandSpread={1.05}
            octaveDecay={0.18}
            layerOffset={0.8}
            colorSpeed={0.25}
            mouseInfluence={0.06}
          />
        </div>
        <main>
          <section className="hero">
            <div className="page-shell hero__layout">
              <div className="hero__copy">
                <h1>Usage-based billing, built into your product.</h1>
                <p className="hero__summary">
                  Send one consume request. Consumel records the usage, updates the customer’s
                  balance or allowance, and connects it to your billing provider.
                </p>
                <div className="hero__actions">
                  <a className="hero-action hero-action--primary" href="#waitlist">
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
    </div>
  );
}
