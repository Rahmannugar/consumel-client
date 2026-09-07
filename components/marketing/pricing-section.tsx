"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CalBookingButton } from "./cal-booking-button";
import styles from "./pricing-section.module.css";
import { waitlistPopupAttributes, waitlistPopupHref } from "./waitlist-popup";

type BillingCycle = "monthly" | "yearly";

type Plan = {
  id: string;
  name: string;
  monthlyPrice: string;
  yearlyPrice: string;
  operations: string;
  features: string[];
  recommended?: boolean;
  enterprise?: boolean;
};

const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
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
    <article className={`${styles.card}${plan.recommended ? ` ${styles.recommended}` : ""}`}>
      {plan.recommended && <span className={styles.recommendedLabel}>Recommended</span>}
      <div className={styles.cardHeader}>
        <h3>{plan.name}</h3>
        <div className={styles.price}>
          <strong>{price}</strong>
          {cadence && <span className={styles.cadence}>{cadence}</span>}
        </div>
        <p>{plan.operations}</p>
      </div>

      <ul className={styles.features}>
        {plan.features.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>

      {plan.enterprise ? (
        <CalBookingButton className={styles.cta} variant="secondary">
          Talk to the team
        </CalBookingButton>
      ) : (
        <Button
          asChild
          className={styles.cta}
          variant={plan.recommended ? "primary" : "secondary"}
        >
          <a href={waitlistPopupHref} {...waitlistPopupAttributes}>
            Join the waitlist
          </a>
        </Button>
      )}
    </article>
  );
}

export function PricingSection() {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");

  return (
    <section className={styles.section} id="pricing" aria-labelledby="pricing-title">
      <div className="page-shell">
        <header className={styles.heading}>
          <div>
            <h2 id="pricing-title">Plans built around billable operations.</h2>
            <p>Choose the plan that fits your product&apos;s usage.</p>
          </div>
          <ToggleGroup
            type="single"
            value={cycle}
            className={styles.cycle}
            aria-label="Billing cycle"
            onValueChange={(value) => {
              if (value === "monthly" || value === "yearly") setCycle(value);
            }}
          >
            <ToggleGroupItem value="monthly">Monthly</ToggleGroupItem>
            <ToggleGroupItem value="yearly">
              Yearly <span className={styles.cycleSaving}>2 months free</span>
            </ToggleGroupItem>
          </ToggleGroup>
        </header>

        <div className={styles.grid}>
          {plans.map((plan) => (
            <PricingCard key={plan.id} plan={plan} cycle={cycle} />
          ))}
        </div>

        <div className={styles.billingRule}>
          <p>
            <strong>Only successful consume operations are billable.</strong> Denied operations,
            idempotent retries, balance changes, provider webhooks, reconciliation, and Sandbox
            usage do not count toward Live usage.
          </p>
          <div>
            <strong>$1</strong>
            <span>per additional 1,000 Live billable operations</span>
          </div>
        </div>
      </div>
    </section>
  );
}
