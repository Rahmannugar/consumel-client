"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Children, type ReactElement, type ReactNode, useRef } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type ScrollStackProps = {
  children: ReactNode;
  className?: string;
  itemDistance?: number;
  itemScale?: number;
  itemStackDistance?: number;
  triggerSelector: string;
};

type ScrollStackItemProps = {
  children: ReactNode;
  className?: string;
};

export function ScrollStack({
  children,
  className = "",
  itemDistance = 250,
  itemScale = 0.018,
  itemStackDistance = 16,
  triggerSelector,
}: ScrollStackProps) {
  const stackRef = useRef<HTMLDivElement>(null);
  const items = Children.toArray(children) as ReactElement[];

  useGSAP(
    () => {
      const stack = stackRef.current;
      const scope = stack?.closest<HTMLElement>("[data-scroll-stack-scope]");

      if (!stack || !scope) return;

      const cards = Array.from(stack.querySelectorAll<HTMLElement>("[data-stack-card]"));
      const triggers = Array.from(scope.querySelectorAll<HTMLElement>(triggerSelector));

      if (cards.length !== triggers.length) return;

      cards.forEach((card, index) => {
        gsap.set(card, { zIndex: index + 1 });

        if (index > 0) {
          gsap.set(card, { visibility: "hidden", y: itemDistance });
        }
      });

      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (reducedMotion) {
        const showCard = (activeIndex: number) => {
          cards.forEach((card, index) => {
            const depth = Math.max(activeIndex - index, 0);
            gsap.set(card, {
              scale: Math.max(1 - depth * itemScale, 0.94),
              visibility: index <= activeIndex ? "visible" : "hidden",
              y: depth * -itemStackDistance,
            });
          });
        };

        showCard(0);
        const reducedMotionTriggers = triggers.map((trigger, index) =>
          ScrollTrigger.create({
            trigger,
            start: "top 58%",
            onEnter: () => showCard(index),
            onEnterBack: () => showCard(index),
          }),
        );

        return () => {
          reducedMotionTriggers.forEach((trigger) => {
            trigger.kill();
          });
        };
      }

      const timelines = cards.slice(1).map((card, cardIndex) => {
        const index = cardIndex + 1;
        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: triggers[index],
            start: "top 82%",
            end: "top 52%",
            scrub: 0.35,
          },
        });

        timeline.set(card, { visibility: "visible" }, 0).to(
          card,
          {
            duration: 1,
            ease: "none",
            y: 0,
          },
          0,
        );

        cards.slice(0, index).forEach((previousCard, previousIndex) => {
          const depth = index - previousIndex;

          timeline.to(
            previousCard,
            {
              duration: 1,
              ease: "none",
              scale: Math.max(1 - depth * itemScale, 0.94),
              y: depth * -itemStackDistance,
            },
            0,
          );
        });

        return timeline;
      });

      return () => {
        timelines.forEach((timeline) => {
          timeline.scrollTrigger?.kill();
          timeline.kill();
        });
      };
    },
    { dependencies: [itemDistance, itemScale, itemStackDistance, triggerSelector] },
  );

  return (
    <div className={`scroll-stack ${className}`.trim()} ref={stackRef}>
      {items.map((item) => (
        <div className="scroll-stack__position" data-stack-card key={item.key}>
          {item}
        </div>
      ))}
    </div>
  );
}

export function ScrollStackItem({ children, className = "" }: ScrollStackItemProps) {
  return <div className={`scroll-stack__item ${className}`.trim()}>{children}</div>;
}
