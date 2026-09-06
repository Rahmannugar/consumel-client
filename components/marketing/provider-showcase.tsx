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
      {width <= 48 && <strong>{name}</strong>}
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
    <section className="provider-showcase" id="providers">
      <div className="page-shell provider-showcase__heading">
        <div>
          <p className="section-label">Provider adapters</p>
          <h2>Keep the provider. Move usage logic out of your product.</h2>
        </div>
        <p>
          Consumel maps your <code>customer_id</code> to the provider relationship, verifies
          provider events, and keeps entitlements aligned without putting a provider call inside
          consume.
        </p>
      </div>
      <LogoLoop items={providerItems} speed={42} gap={18} />
      <div className="page-shell provider-boundary">
        <div>
          <span>Payment provider</span>
          <strong>Collects and settles money</strong>
        </div>
        <i aria-hidden="true" />
        <div className="provider-boundary__core">
          <span>Consumel</span>
          <strong>Owns usage truth</strong>
        </div>
        <i aria-hidden="true" />
        <div>
          <span>Your product</span>
          <strong>Acts on the decision</strong>
        </div>
      </div>
    </section>
  );
}
