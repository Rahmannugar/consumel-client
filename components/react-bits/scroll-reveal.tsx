"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useMemo, useRef } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type ScrollRevealProps = {
  children: string;
  className?: string;
};

export function ScrollReveal({ children, className = "" }: ScrollRevealProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const words = useMemo(() => children.split(/(\s+)/), [children]);

  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const elements = headingRef.current?.querySelectorAll("[data-reveal-word]");
        if (!elements) return;

        gsap.fromTo(
          elements,
          { opacity: 0.16, filter: "blur(5px)" },
          {
            opacity: 1,
            filter: "blur(0px)",
            stagger: 0.035,
            ease: "none",
            scrollTrigger: {
              trigger: headingRef.current,
              start: "top 82%",
              end: "bottom 48%",
              scrub: true,
            },
          },
        );
      });
      return () => media.revert();
    },
    { scope: headingRef },
  );

  return (
    <h2 className={`scroll-reveal ${className}`} ref={headingRef}>
      {words.map((word, index) =>
        /^\s+$/.test(word) ? (
          word
        ) : (
          // biome-ignore lint/suspicious/noArrayIndexKey: repeated words need position-based identity
          <span data-reveal-word key={`${word}-${index}`}>
            {word}
          </span>
        ),
      )}
    </h2>
  );
}
