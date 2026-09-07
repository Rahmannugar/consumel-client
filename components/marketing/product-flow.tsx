"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
    stages: ["Payment received", "Balance added", "Usage consumed"],
  },
  {
    id: "recurring",
    title: "Recurring allowances",
    body: "Grant usage that resets on the schedule your product defines.",
    stages: ["Schedule reached", "Allowance granted", "Balance resets"],
  },
  {
    id: "postpaid",
    title: "Postpaid usage",
    body: "Record consumption during the billing period and calculate the amount owed afterward.",
    stages: ["Usage consumed", "Period usage tracked", "Amount calculated"],
  },
  {
    id: "hybrid",
    title: "Included usage + overage",
    body: "Consume the included allowance first, then track excess usage for billing.",
    stages: ["Allowance included", "Usage consumed", "Overage tracked"],
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

        <div className="mt-10 grid overflow-hidden rounded-2xl border border-[#cbd7df] bg-[#edf3f6] shadow-[0_16px_40px_rgb(14_38_57/5%)] lg:grid-cols-[0.58fr_1.42fr]">
          <div className="grid content-center gap-1 border-b border-[#d4e0e7] p-3 sm:grid-cols-2 lg:grid-cols-1 lg:border-r lg:border-b-0 lg:p-4">
            {billingCapabilities.map((capability) => {
              const active = capability.id === activeCapability.id;

              return (
                <Button
                  className={`!min-h-12 !justify-start !rounded-md !border-transparent !px-3.5 !text-left !text-[13px] ${
                    active
                      ? "!bg-[#dceefe] !text-[#075aaf] shadow-none before:mr-1 before:h-4 before:w-0.5 before:rounded-full before:bg-[#087cec]"
                      : "!bg-transparent !text-[#536774] hover:!bg-white/55 hover:!text-[#172f3e]"
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

          <div className="flex min-h-[280px] flex-col justify-between bg-[#071827] p-[clamp(24px,3.5vw,42px)] text-white">
            <div>
              <p className="m-0 font-mono text-[11px] font-bold tracking-[0.08em] text-[#70c2ff] uppercase">
                {activeCapability.title}
              </p>
              <p className="mt-4 mb-0 max-w-[590px] text-[17px] leading-7 text-[#bed0dc]">
                {activeCapability.body}
              </p>
            </div>

            <div className="mt-9 grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-3 max-[620px]:grid-cols-1 max-[620px]:gap-2">
              {activeCapability.stages.map((stage, index) => (
                <div className="contents" key={stage}>
                  <div className="flex min-h-14 items-center rounded-md border border-white/12 bg-white/[0.045] px-3.5 text-[13px] font-semibold">
                    {stage}
                  </div>
                  {index < activeCapability.stages.length - 1 && (
                    <span
                      className="h-px w-5 bg-[#55b9ff] max-[620px]:h-4 max-[620px]:w-px max-[620px]:justify-self-center"
                      aria-hidden="true"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
