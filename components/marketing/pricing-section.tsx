"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CalBookingButton } from "./cal-booking-button";
import { WaitlistLink } from "./waitlist-link";

type BillingCycle = "monthly" | "yearly";

type Plan = {
  id: string;
  name: string;
  description: string;
  monthlyPrice: string;
  yearlyPrice: string;
  operations: string;
  features: string[];
  recommended?: boolean;
  enterprise?: boolean;
};

const plans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    description: "For getting started with usage-based billing.",
    monthlyPrice: "$0",
    yearlyPrice: "$0",
    operations: "1,000 Live billable operations / month",
    features: [
      "100 Sandbox operations",
      "1 active member",
      "Basic analytics",
      "Community support",
      "Payment providers included",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    description: "For growing products with higher usage needs.",
    monthlyPrice: "$20",
    yearlyPrice: "$200",
    operations: "10,000 Live billable operations / month",
    recommended: true,
    features: [
      "1,000 Sandbox operations",
      "3 active members",
      "Full analytics",
      "Standard support",
      "Payment providers included",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    description: "For products with higher usage volumes and more advanced billing needs.",
    monthlyPrice: "$50",
    yearlyPrice: "$500",
    operations: "30,000 Live billable operations / month",
    features: [
      "3,000 Sandbox operations",
      "10 active members",
      "Advanced analytics",
      "Priority support",
      "Payment providers included",
      "SSO included",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description:
      "Custom usage-based billing infrastructure for larger or more complex products.",
    monthlyPrice: "Custom",
    yearlyPrice: "Custom",
    operations: "Flexible operation allowances",
    enterprise: true,
    features: [
      "Configurable Sandbox",
      "Custom member limit",
      "Advanced analytics",
      "Dedicated support",
      "Payment providers included",
      "Custom identity requirements",
    ],
  },
];

function PricingCard({ plan, cycle }: { plan: Plan; cycle: BillingCycle }) {
  const price = cycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
  const cadence = plan.enterprise ? "" : cycle === "monthly" ? "/ month" : "/ year";

  return (
    <article
      className={`relative flex min-h-[520px] min-w-0 flex-col rounded-[14px] border bg-white px-6 pt-7 pb-6 shadow-[0_14px_34px_rgb(18_48_68/5%)] ${
        plan.recommended
          ? "border-2 border-[#087cec] shadow-[0_18px_42px_rgb(8_124_236/12%)]"
          : "border-[#cbd7df]"
      } max-[620px]:min-h-0`}
    >
      {plan.recommended && (
        <span className="absolute top-0 right-[22px] rounded-b-[7px] bg-[#087cec] px-2.5 py-[7px] text-[9px] font-bold tracking-[0.07em] text-white uppercase">
          Recommended
        </span>
      )}
      <div className="min-h-[188px] border-b border-[#dce5eb] pb-6 max-[620px]:min-h-0">
        <h3 className="m-0 text-[15px] font-bold">{plan.name}</h3>
        <p className="mt-3 mb-0 min-h-[34px] text-[11px] leading-[1.5] text-[#536774] max-[620px]:min-h-0">
          {plan.description}
        </p>
        <div className="mt-5 flex items-baseline gap-[7px]">
          <strong className="[font-family:var(--font-bricolage-grotesque)] text-[clamp(34px,3vw,46px)] leading-none font-bold tracking-[-0.05em] break-words tabular-nums">
            {price}
          </strong>
          {cadence && <span className="text-[10px] text-[#73818a]">{cadence}</span>}
        </div>
        <p className="mt-4 mb-0 text-xs leading-[1.45] text-[#536774]">{plan.operations}</p>
      </div>

      <ul className="mt-2 mb-[26px] grid list-none gap-0 p-0">
        {plan.features.map((feature) => (
          <li
            className="relative border-b border-[#edf1f4] py-2.5 pr-0 pl-4 text-[11px] leading-[1.35] text-[#3f525f] before:absolute before:top-[15px] before:left-0 before:size-[5px] before:rounded-full before:bg-[#087cec]"
            key={feature}
          >
            {feature}
          </li>
        ))}
      </ul>

      {plan.enterprise ? (
        <CalBookingButton className="mt-auto w-full" variant="secondary">
          Contact sales
        </CalBookingButton>
      ) : (
        <Button
          asChild
          className="mt-auto w-full"
          variant={plan.recommended ? "primary" : "secondary"}
        >
          <WaitlistLink>Join the waitlist</WaitlistLink>
        </Button>
      )}
    </article>
  );
}

export function PricingSection() {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");

  return (
    <section
      className="scroll-mt-24 border-t border-[#d8e2e9] bg-[#f4f7f9] py-[88px] text-[#07121c] max-[620px]:scroll-mt-[88px] max-[620px]:py-[68px]"
      id="pricing"
      aria-labelledby="pricing-title"
    >
      <div className="page-shell">
        <header className="mb-[42px] flex items-end justify-between gap-12 max-[620px]:mb-[30px] max-[620px]:items-start max-[620px]:flex-col max-[620px]:gap-[22px]">
          <div>
            <h2
              className="m-0 max-w-[720px] [font-family:var(--font-bricolage-grotesque)] text-[clamp(40px,4.2vw,56px)] leading-[0.98] font-bold tracking-[-0.045em]"
              id="pricing-title"
            >
              Plans built around billable operations.
            </h2>
            <p className="mt-4 mb-0 text-base text-[#5d6872]">
              Choose the plan that fits your product&apos;s usage.
            </p>
          </div>
          <ToggleGroup
            type="single"
            value={cycle}
            className="shrink-0 gap-[3px] rounded-[9px] bg-[#e6edf2] p-1 max-[620px]:w-full"
            aria-label="Billing cycle"
            onValueChange={(value) => {
              if (value === "monthly" || value === "yearly") setCycle(value);
            }}
          >
            <ToggleGroupItem
              className="min-h-10 gap-[7px] rounded-md border border-transparent bg-transparent px-[15px] text-xs text-[#586a76] data-[state=on]:border-[#cad7df] data-[state=on]:bg-white data-[state=on]:text-[#075aaf] data-[state=on]:shadow-[0_1px_3px_rgb(16_43_64/7%)] max-[620px]:flex-1 max-[620px]:px-2.5"
              value="monthly"
            >
              Monthly
            </ToggleGroupItem>
            <ToggleGroupItem
              className="min-h-10 gap-[7px] rounded-md border border-transparent bg-transparent px-[15px] text-xs text-[#586a76] data-[state=on]:border-[#cad7df] data-[state=on]:bg-white data-[state=on]:text-[#075aaf] data-[state=on]:shadow-[0_1px_3px_rgb(16_43_64/7%)] max-[620px]:flex-1 max-[620px]:px-2.5"
              value="yearly"
            >
              Yearly <span className="text-[9px] font-bold text-[#087d52]">2 months free</span>
            </ToggleGroupItem>
          </ToggleGroup>
        </header>

        <div className="grid grid-cols-4 items-stretch gap-3.5 max-[980px]:grid-cols-2 max-[620px]:grid-cols-1">
          {plans.map((plan) => (
            <PricingCard key={plan.id} plan={plan} cycle={cycle} />
          ))}
        </div>

        <div className="mt-[18px] grid grid-cols-[minmax(0,1fr)_minmax(220px,0.32fr)] items-center gap-[34px] rounded-xl bg-[#071827] px-[26px] py-[22px] text-[#a9bdcb] max-[620px]:grid-cols-1 max-[620px]:gap-[18px] max-[620px]:p-6">
          <p className="m-0 text-[11px] leading-[1.65]">
            <strong className="text-white">
              Only successful consume operations are billable.
            </strong>{" "}
            Denied operations, idempotent retries, balance changes, provider webhooks,
            reconciliation, and Sandbox usage do not count toward Live usage.
          </p>
          <div className="flex items-center gap-2.5 border-l border-[#2a4254] pl-6 max-[620px]:border-t max-[620px]:border-l-0 max-[620px]:pt-[18px] max-[620px]:pl-0">
            <strong className="[font-family:var(--font-bricolage-grotesque)] text-[30px] tracking-[-0.04em] text-[#70c2ff]">
              $1
            </strong>
            <span className="text-[10px] leading-[1.4] text-[#91a8b8]">
              per additional 1,000 Live billable operations
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
