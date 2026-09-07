"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollStack, ScrollStackItem } from "../react-bits/scroll-stack";

const flowSteps = [
  {
    number: "01",
    title: "Define what you measure",
    body: "Create meters for calls, credits, tokens, storage, time, or any unit your product sells.",
  },
  {
    number: "02",
    title: "Choose how usage is billed",
    body: "Use prepaid balances, postpaid usage, or included allowances with overage.",
  },
  {
    number: "03",
    title: "Keep billing connected",
    body: "Consumel calculates each billing period and coordinates the result with your payment provider.",
  },
] as const;

const flowCardKeys = ["meter", "usage", "billing"] as const;

const billingCapabilities = [
  {
    id: "prepaid",
    title: "Prepaid credits",
    body: "Add a balance, deduct usage, and reject consumption when the balance is exhausted.",
    metric: "2,500",
    metricLabel: "Available balance",
    stages: [
      { label: "Balance funded", value: "+3,000 units" },
      { label: "Usage requested", value: "500 units" },
      { label: "Balance deducted", value: "2,500 remaining" },
    ],
  },
  {
    id: "recurring",
    title: "Recurring allowances",
    body: "Grant usage that resets on the schedule your product defines.",
    metric: "2,500",
    metricLabel: "Allowance remaining",
    stages: [
      { label: "Period started", value: "Monthly" },
      { label: "Allowance reset", value: "+3,000 units" },
      { label: "Usage deducted", value: "2,500 remaining" },
    ],
  },
  {
    id: "postpaid",
    title: "Postpaid usage",
    body: "Record consumption during the billing period and calculate the amount owed afterward.",
    metric: "14,500",
    metricLabel: "Usage this period",
    stages: [
      { label: "Usage recorded", value: "+500 units" },
      { label: "Period total updated", value: "14,500 units" },
      { label: "Amount calculated", value: "At period end" },
    ],
  },
  {
    id: "hybrid",
    title: "Included usage + overage",
    body: "Consume the included allowance first, then track excess usage for billing.",
    metric: "500",
    metricLabel: "Overage units",
    stages: [
      { label: "Allowance checked", value: "3,000 available" },
      { label: "Usage deducted", value: "3,500 units" },
      { label: "Overage recorded", value: "500 units" },
    ],
  },
] as const;

function FlowCard({ index }: { index: number }) {
  if (index === 0) {
    return (
      <ScrollStackItem className="flow-stack flow-stack--meter">
        <div className="flow-stack__copy">
          <span>Meter</span>
          <strong>API calls</strong>
        </div>
        <div className="flow-stack__meta">
          <span>Model</span>
          <strong>Hybrid</strong>
        </div>
      </ScrollStackItem>
    );
  }

  if (index === 1) {
    return (
      <ScrollStackItem className="flow-stack flow-stack--usage">
        <div className="flow-stack__copy flow-stack__copy--balance">
          <span>Customer #1842</span>
          <strong>2,880 calls left</strong>
        </div>
        <div className="flow-stack__usage">
          <span>Used this period</span>
          <strong>120 calls</strong>
        </div>
        <div className="flow-stack__progress" aria-hidden="true">
          <i />
        </div>
      </ScrollStackItem>
    );
  }

  return (
    <ScrollStackItem className="flow-stack flow-stack--billing">
      <div className="flow-stack__copy">
        <span>Billing status</span>
        <strong>Within allowance</strong>
      </div>
      <div className="flow-stack__meta">
        <span>Payment provider</span>
        <strong>Connected</strong>
      </div>
    </ScrollStackItem>
  );
}

function StepCopy({ index }: { index: number }) {
  const step = flowSteps[index];

  return (
    <>
      <span className="product-flow__number">{step.number}</span>
      <h3>{step.title}</h3>
      <p>{step.body}</p>
    </>
  );
}

export function ProductFlow() {
  const [activeCapabilityId, setActiveCapabilityId] = useState<string>(
    billingCapabilities[0].id,
  );
  const activeCapability =
    billingCapabilities.find((capability) => capability.id === activeCapabilityId) ??
    billingCapabilities[0];

  return (
    <section className="product-flow" data-scroll-stack-scope id="how-it-works">
      <div className="page-shell product-flow__intro">
        <h2>How Consumel works.</h2>
        <p>
          Define what you measure, choose how usage is billed, and record consumption as
          customers use your product.
        </p>
      </div>

      <div className="page-shell product-flow__story product-flow__story--desktop">
        <div className="product-flow__steps">
          {flowSteps.map((step, index) => (
            <article className="product-flow__step" data-flow-copy-step key={step.number}>
              <StepCopy index={index} />
            </article>
          ))}
        </div>

        <div className="product-flow__visual">
          <ScrollStack
            className="product-flow__stack"
            itemDistance={460}
            itemScale={0.018}
            itemStackDistance={16}
            triggerSelector="[data-flow-copy-step]"
          >
            {flowCardKeys.map((key, index) => (
              <FlowCard index={index} key={key} />
            ))}
          </ScrollStack>
        </div>
      </div>

      <div className="page-shell product-flow__story--mobile">
        {flowSteps.map((step, index) => (
          <article className="product-flow__mobile-step" key={step.number}>
            <div className="product-flow__mobile-copy">
              <StepCopy index={index} />
            </div>
            <div className="product-flow__mobile-card">
              <FlowCard index={index} />
            </div>
          </article>
        ))}
      </div>

      <div className="page-shell mt-20 border-t border-[#cbd7df] pt-16 max-[820px]:mt-14 max-[820px]:border-t-0 max-[820px]:pt-12">
        <header className="grid grid-cols-[minmax(0,1fr)_minmax(280px,0.72fr)] items-end gap-12 max-[760px]:grid-cols-1 max-[760px]:gap-5">
          <h3 className="m-0 max-w-[660px] [font-family:var(--font-bricolage-grotesque)] text-[clamp(34px,3.7vw,48px)] leading-none font-bold tracking-[-0.04em]">
            Choose how usage is billed.
          </h3>
          <p className="m-0 max-w-[470px] text-base leading-7 text-[#5d6872]">
            Run prepaid, recurring, postpaid, and hybrid billing through the same consumption
            API.
          </p>
        </header>

        <div className="mt-10 overflow-hidden rounded-2xl border border-[#cbd7df] bg-white shadow-[0_16px_40px_rgb(14_38_57/5%)]">
          <div className="flex min-h-[68px] items-center justify-between gap-6 border-b border-[#d7e1e7] px-5 max-[760px]:p-3.5">
            <p className="m-0 text-xs font-semibold text-[#748996] max-[760px]:hidden">
              Billing model
            </p>

            <div className="flex gap-1 rounded-lg bg-[#edf2f5] p-1 max-[760px]:hidden">
              {billingCapabilities.map((capability) => {
                const active = capability.id === activeCapability.id;

                return (
                  <Button
                    className={`!min-h-10 !rounded-md !border-transparent !px-4 !text-[12px] focus-visible:!outline-2 focus-visible:!outline-offset-[-2px] focus-visible:!outline-[#087cec] ${
                      active
                        ? "!bg-[#087cec] !text-white shadow-[0_3px_10px_rgb(8_124_236/20%)]"
                        : "!bg-transparent !text-[#536774] shadow-none hover:!bg-white hover:!text-[#172f3e]"
                    }`}
                    key={capability.id}
                    onClick={() => setActiveCapabilityId(capability.id)}
                    type="button"
                    variant="quiet"
                    aria-pressed={active}
                  >
                    {capability.title}
                  </Button>
                );
              })}
            </div>

            <div className="hidden w-full max-[760px]:block">
              <Select value={activeCapability.id} onValueChange={setActiveCapabilityId}>
                <SelectTrigger className="h-12 w-full" aria-label="Billing model">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {billingCapabilities.map((capability) => (
                    <SelectItem key={capability.id} value={capability.id}>
                      {capability.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              className="grid bg-[#087cec] text-white lg:grid-cols-[0.78fr_1.22fr]"
              key={activeCapability.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              <div className="flex min-h-[300px] flex-col justify-between p-[clamp(26px,3vw,40px)] max-[760px]:min-h-0">
                <div>
                  <p className="m-0 text-xs font-semibold text-white/70">
                    {activeCapability.title}
                  </p>
                  <p className="mt-3 mb-0 max-w-[490px] text-[16px] leading-7 text-white/[0.85]">
                    {activeCapability.body}
                  </p>
                </div>
                <div className="mt-10">
                  <strong className="block [font-family:var(--font-bricolage-grotesque)] text-[clamp(52px,6vw,76px)] leading-[0.88] font-bold tracking-[-0.06em] tabular-nums">
                    {activeCapability.metric}
                  </strong>
                  <span className="mt-3 block text-[13px] text-white/70">
                    {activeCapability.metricLabel}
                  </span>
                </div>
              </div>

              <div className="border-l border-white/20 p-[clamp(22px,2.7vw,36px)] max-lg:border-t max-lg:border-l-0">
                <p className="m-0 text-xs font-semibold text-white/70">Activity</p>
                <ol className="mt-4 list-none border-y border-white/20 p-0">
                  {activeCapability.stages.map((stage, index) => (
                    <li
                      className="grid min-h-[67px] grid-cols-[32px_minmax(0,1fr)_auto] items-center gap-3 border-b border-white/20 py-3 last:border-b-0 max-[480px]:grid-cols-[28px_minmax(0,1fr)]"
                      key={stage.label}
                    >
                      <span className="font-mono text-[10px] font-bold text-white/55">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="text-[13px] font-semibold text-white">
                        {stage.label}
                      </span>
                      <code className="text-right text-[11px] text-white/70 max-[480px]:col-start-2 max-[480px]:text-left">
                        {stage.value}
                      </code>
                    </li>
                  ))}
                </ol>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
