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

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        totals.balance = 2500;
        totals.usage = 500;
        renderTotals();
        gsap.set("[data-usage-row]", { opacity: 1, y: 0 });
        gsap.set("[data-balance-fill]", { scaleX: 5 / 6 });
        return;
      }

      const timeline = gsap.timeline({ repeat: -1, repeatDelay: 1.7 });
      timeline
        .call(() => {
          totals.balance = 3000;
          totals.usage = 0;
          renderTotals();
        })
        .set("[data-usage-row]", { opacity: 0, y: 12 })
        .set("[data-balance-fill]", { scaleX: 1 });

      usageEvents.forEach((event, index) => {
        const usage = usageEvents
          .slice(0, index + 1)
          .reduce((total, item) => total + item.amount, 0);

        timeline
          .to(`[data-usage-row='${index}']`, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "power2.out",
          })
          .to(
            totals,
            {
              balance: event.balance,
              usage,
              duration: 0.72,
              snap: { balance: 1, usage: 1 },
              ease: "power2.inOut",
              onUpdate: renderTotals,
            },
            "<0.12",
          )
          .to(
            "[data-balance-fill]",
            {
              scaleX: event.balance / 3000,
              duration: 0.72,
              ease: "power2.inOut",
            },
            "<",
          )
          .to({}, { duration: 0.72 });
      });

      timeline.to("[data-usage-row]", {
        opacity: 0.18,
        duration: 0.42,
        stagger: 0.06,
      });
    },
    { scope: sceneRef },
  );

  return (
    <div className="hero-scene" ref={sceneRef}>
      <div
        className="customer-meter"
        role="img"
        aria-label="A customer meter showing three accepted AI token usage events. The available balance decreases from 3,000 to 2,500 units while usage this period increases to 500 units."
      >
        <header className="customer-meter__header">
          <span>
            <small>Customer</small>
            <strong>Customer #1842</strong>
          </span>
          <span>
            <small>Meter</small>
            <strong>AI tokens</strong>
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
            <span>Usage this period</span>
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
                  <small>AI tokens</small>
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
