"use client";

import Image from "next/image";
import { LogoLoop, type LogoLoopItem } from "@/components/react-bits/logo-loop";

function ProviderMark({
  src,
  name,
  width,
  light = false,
}: {
  src: string;
  name: string;
  width: number;
  light?: boolean;
}) {
  return (
    <div className={`provider-mark${light ? " provider-mark--dark" : ""}`}>
      <Image src={src} alt={`${name} logo`} width={width} height={34} unoptimized />
      {width <= 48 && <strong className="provider-mark__name">{name}</strong>}
    </div>
  );
}

const providerItems: LogoLoopItem[] = [
  {
    label: "Stripe",
    node: <ProviderMark src="/assets/providers/stripe.svg" name="Stripe" width={32} />,
  },
  {
    label: "Paystack",
    node: <ProviderMark src="/assets/providers/paystack.svg" name="Paystack" width={124} />,
  },
  {
    label: "Flutterwave",
    node: (
      <ProviderMark src="/assets/providers/flutterwave.svg" name="Flutterwave" width={138} />
    ),
  },
  {
    label: "Dodo Payments",
    node: (
      <ProviderMark
        src="/assets/providers/dodo-payments.svg"
        name="Dodo Payments"
        width={142}
        light
      />
    ),
  },
  {
    label: "Lemon Squeezy",
    node: (
      <ProviderMark src="/assets/providers/lemon-squeezy.svg" name="Lemon Squeezy" width={34} />
    ),
  },
  {
    label: "Polar",
    node: <ProviderMark src="/assets/providers/polar.png" name="Polar" width={34} />,
  },
  {
    label: "Bachs",
    node: <ProviderMark src="/assets/providers/bachs.png" name="Bachs" width={34} />,
  },
];

export function ProviderShowcase() {
  return (
    <section className="provider-showcase" id="providers" aria-labelledby="providers-title">
      <div className="page-shell provider-showcase__heading">
        <h2 id="providers-title">Bring your payment provider.</h2>
        <p>
          Consumel verifies payment webhooks, matches each event to the right customer, and
          keeps balances and entitlements in sync.
        </p>
      </div>
      <LogoLoop items={providerItems} speed={32} gap={72} />
      <ol className="page-shell provider-showcase__flow" aria-label="Payment update flow">
        <li className="provider-showcase__event-card">
          <div>
            <span className="provider-showcase__flow-number">01</span>
          </div>
          <strong className="provider-showcase__flow-label">Payment confirmed</strong>
          <code className="provider-showcase__flow-value">payment.succeeded</code>
        </li>
        <li className="provider-showcase__mapping-card">
          <div>
            <span className="provider-showcase__flow-number">02</span>
          </div>
          <strong className="provider-showcase__flow-label">Customer resolved</strong>
          <div className="provider-showcase__mapping">
            <span className="provider-showcase__mapping-value">
              <small className="provider-showcase__mapping-label">Provider ref</small>
              <code className="provider-showcase__mapping-code">cus_P4Z8</code>
            </span>
            <i className="provider-showcase__mapping-connector" aria-hidden="true" />
            <span className="provider-showcase__mapping-value">
              <small className="provider-showcase__mapping-label">Consumel</small>
              <code className="provider-showcase__mapping-code">customer_1842</code>
            </span>
          </div>
        </li>
        <li className="provider-showcase__balance-card">
          <div>
            <span className="provider-showcase__flow-number">03</span>
          </div>
          <strong className="provider-showcase__flow-label">Balance updated</strong>
          <div className="provider-showcase__balance-value">
            <strong className="provider-showcase__balance-amount">+5,000</strong>
            <span className="provider-showcase__balance-unit">units</span>
          </div>
        </li>
      </ol>
    </section>
  );
}
