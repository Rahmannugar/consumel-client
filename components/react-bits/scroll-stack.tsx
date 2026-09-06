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
            onLeaveBack: () => showCard(Math.max(index - 1, 0)),
          }),
        );

        return () => {
          reducedMotionTriggers.forEach((trigger) => {
            trigger.kill();
          });
        };
      }

      const transitions = cards.map((_, index) => ({ progress: index === 0 ? 1 : 0 }));

      // Derive every card's pose together so separate scroll tweens cannot
      // capture and later restore another transition's transform or visibility.
      const renderCards = () => {
        cards.forEach((card, index) => {
          const progress = transitions[index].progress;
          const depth = transitions
            .slice(index + 1)
            .reduce((total, transition) => total + transition.progress, 0);

          gsap.set(card, {
            visibility: progress > 0 ? "visible" : "hidden",
            y: (1 - progress) * itemDistance - depth * itemStackDistance,
            scale: Math.max(1 - depth * itemScale, 0.94),
          });
        });
      };

      renderCards();

      const tweens = cards.slice(1).map((_, cardIndex) => {
        const index = cardIndex + 1;
        return gsap.to(transitions[index], {
          progress: 1,
          ease: "none",
          onUpdate: renderCards,
          scrollTrigger: {
            trigger: triggers[index],
            start: "top 82%",
            end: "top 52%",
            scrub: 0.35,
          },
        });
      });

      return () => {
        tweens.forEach((tween) => {
          tween.scrollTrigger?.kill();
          tween.kill();
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
