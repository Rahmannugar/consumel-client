"use client";

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
    </section>
  );
}
