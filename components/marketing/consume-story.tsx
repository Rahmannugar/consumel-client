"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useRef } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const decisions = [
  {
    label: "Scope",
    title: "The API key selects the project and environment.",
    detail: "Sandbox and Live stay isolated without project IDs in the request.",
  },
  {
    label: "Retry",
    title: "The idempotency key identifies one logical operation.",
    detail: "A retry can return the original result instead of consuming twice.",
  },
  {
    label: "Decide",
    title: "Balance and usage change in one transaction.",
    detail: "Concurrent requests cannot spend the same available units.",
  },
  {
    label: "Respond",
    title: "Your product gets the decision immediately.",
    detail: "Provider calls, analytics, and webhook delivery continue outside this path.",
  },
];

export function ConsumeStory() {
  const storyRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference) and (min-width: 900px)", () => {
        gsap.set("[data-story-step]", { opacity: 0.28 });
        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: "[data-story-copy]",
            start: "top 58%",
            end: "bottom 58%",
            scrub: 0.6,
          },
        });

        decisions.forEach((_, index) => {
          timeline
            .to(
              "[data-story-progress]",
              { scaleY: (index + 1) / decisions.length, duration: 1 },
              index,
            )
            .to(`[data-story-step="${index}"]`, { opacity: 1, duration: 0.22 }, index)
            .to(
              `[data-story-node="${index}"]`,
              { backgroundColor: "#0096ff", scale: 1.18, duration: 0.22 },
              index,
            );
          if (index > 0) {
            timeline.to(
              `[data-story-step="${index - 1}"]`,
              { opacity: 0.28, duration: 0.22 },
              index,
            );
          }
        });
      });
      return () => media.revert();
    },
    { scope: storyRef },
  );

  return (
    <section className="consume-story" id="how-it-works" ref={storyRef}>
      <div className="page-shell consume-story__layout">
        <div className="consume-story__visual" aria-hidden="true">
          <div className="story-request">
            <span>POST</span>
            <code>/v1/consume</code>
          </div>
          <div className="story-machine">
            <div className="story-machine__brand">
              <Image src="/assets/logo.png" alt="" width={90} height={90} />
              <span>consumel</span>
            </div>
            <div className="story-rail">
              <i data-story-progress />
              {decisions.map((decision, index) => (
                <span data-story-node={index} key={decision.label}>
                  {index + 1}
                </span>
              ))}
            </div>
            <div className="story-machine__footer">
              <code>cm_test_••••</code>
              <span>PostgreSQL transaction</span>
            </div>
          </div>
          <div className="story-response">
            <span>200</span>
            <code>
              allowed: true
              <br />
              remaining: 2,180
            </code>
          </div>
        </div>
        <div className="consume-story__copy" data-story-copy>
          <header>
            <p className="section-label">Inside consume</p>
            <h2>One request. One durable decision.</h2>
            <p>
              The synchronous path does only the work required to tell your product whether
              usage may continue.
            </p>
          </header>
          {decisions.map((decision, index) => (
            <article data-story-step={index} key={decision.label}>
              <span>{decision.label}</span>
              <h3>{decision.title}</h3>
              <p>{decision.detail}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
