"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

gsap.registerPlugin(useGSAP);

const usageEvents = [
  { amount: 120, balance: 2880 },
  { amount: 240, balance: 2640 },
  { amount: 140, balance: 2500 },
] as const;

export function HeroParallax() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const meterRef = useRef<HTMLDivElement>(null);
  const balanceRef = useRef<HTMLElement>(null);
  const periodUsageRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const totals = { balance: 3000, usage: 0 };
      const renderTotals = () => {
        if (balanceRef.current)
          balanceRef.current.textContent = totals.balance.toLocaleString();
        if (periodUsageRef.current)
          periodUsageRef.current.textContent = totals.usage.toLocaleString();
      };

      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (reducedMotion) {
        totals.balance = 2500;
        totals.usage = 500;
        renderTotals();
        gsap.set("[data-usage-row]", { opacity: 1, x: 0 });
        gsap.set("[data-balance-fill]", { scaleX: 5 / 6 });
        return;
      }

      const meter = meterRef.current;
      const scene = sceneRef.current;

      if (!meter || !scene) return;

      const usageTimeline = gsap.timeline({ paused: true, repeat: -1 });
      usageTimeline
        .call(() => {
          totals.balance = 3000;
          totals.usage = 0;
          renderTotals();
        })
        .set("[data-usage-row]", {
          autoAlpha: 0.52,
          backgroundColor: "transparent",
          x: 0,
        })
        .set("[data-balance-fill]", { scaleX: 1 })
        .to({}, { duration: 1.1 });

      usageEvents.forEach((event, index) => {
        const usage = usageEvents
          .slice(0, index + 1)
          .reduce((total, item) => total + item.amount, 0);

        usageTimeline
          .to(`[data-usage-row='${index}']`, {
            autoAlpha: 1,
            backgroundColor: "rgba(85, 185, 255, 0.09)",
            duration: 0.42,
            ease: "power3.out",
          })
          .to(
            totals,
            {
              balance: event.balance,
              usage,
              duration: 0.86,
              snap: { balance: 1, usage: 1 },
              ease: "power3.inOut",
              onUpdate: renderTotals,
            },
            "<0.08",
          )
          .to(
            "[data-balance-fill]",
            {
              scaleX: event.balance / 3000,
              duration: 0.86,
              ease: "power3.inOut",
            },
            "<",
          )
          .to(
            `[data-usage-row='${index}']`,
            { autoAlpha: 0.52, backgroundColor: "transparent", duration: 0.6 },
            ">-0.18",
          )
          .to({}, { duration: 0.72 });
      });

      usageTimeline.to({}, { duration: 1.6 });

      const introTimeline = gsap.timeline({ onComplete: () => usageTimeline.play(0) });
      introTimeline.fromTo(
        meter,
        { autoAlpha: 0, scale: 0.975, y: 30 },
        {
          autoAlpha: 1,
          scale: 1,
          y: 0,
          duration: 1.15,
          ease: "power3.out",
        },
      );

      const supportsPointer = window.matchMedia("(pointer: fine)").matches;
      if (!supportsPointer) return;

      const handlePointerMove = (event: PointerEvent) => {
        const bounds = scene.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;

        gsap.to(meter, {
          x: x * 4,
          y: y * 3,
          duration: 0.65,
          ease: "power3.out",
          overwrite: "auto",
        });
      };

      const resetParallax = () => {
        gsap.to(meter, {
          x: 0,
          y: 0,
          duration: 0.65,
          ease: "power3.out",
          overwrite: "auto",
        });
      };

      scene.addEventListener("pointermove", handlePointerMove);
      scene.addEventListener("pointerleave", resetParallax);

      return () => {
        scene.removeEventListener("pointermove", handlePointerMove);
        scene.removeEventListener("pointerleave", resetParallax);
        introTimeline.kill();
        usageTimeline.kill();
      };
    },
    { scope: sceneRef },
  );

  return (
    <div className="hero-scene" ref={sceneRef}>
      <div
        className="customer-meter"
        ref={meterRef}
        role="img"
        aria-label="An API call meter for Customer 1842. Three usage events reduce the available balance from 3,000 to 2,500 calls while consumed usage increases to 500 calls."
      >
        <header className="customer-meter__header">
          <strong>Customer #1842</strong>
          <span>
            <small>Meter</small>
            <strong>API calls</strong>
          </span>
        </header>

        <div className="customer-meter__totals">
          <section className="meter-total meter-total--balance">
            <span>Available balance</span>
            <div>
              <strong ref={balanceRef}>3,000</strong>
              <small>units</small>
            </div>
            <div className="meter-total__track" aria-hidden="true">
              <i data-balance-fill />
            </div>
          </section>

          <section className="meter-total meter-total--usage">
            <span>Consumed this period</span>
            <div>
              <strong ref={periodUsageRef}>0</strong>
              <small>units</small>
            </div>
          </section>
        </div>

        <section className="usage-ledger">
          <div className="usage-ledger__heading">
            <span>Recent usage</span>
            <span>Balance after</span>
          </div>
          <div className="usage-ledger__rows">
            {usageEvents.map((event, index) => (
              <div className="usage-ledger__row" data-usage-row={index} key={event.balance}>
                <span>
                  <strong>{event.amount}</strong>
                  <small>API calls</small>
                </span>
                <b>{event.balance.toLocaleString()}</b>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
