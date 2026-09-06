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
        <h2 id="providers-title">Payment provider integrations</h2>
      </div>
      <LogoLoop items={providerItems} speed={32} gap={72} />
    </section>
  );
}
