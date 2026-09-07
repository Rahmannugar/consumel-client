"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const questions = [
  {
    question: "What is Consumel?",
    answer:
      "Consumel meters product usage, manages customer balances and entitlements, applies billing rules, and connects the result to the payment provider your business uses.",
  },
  {
    question: "What counts as a billable operation?",
    answer:
      "One successful consume request is one billable operation. Denied requests, idempotent retries, balance changes, provider webhooks, reconciliation, and Sandbox usage do not count toward Live usage.",
  },
  {
    question: "Can I use different billing models in one project?",
    answer:
      "Yes. A project can define different meters for prepaid balances, postpaid usage, and hybrid allowances with overage. Each meter describes what your product measures and how that usage is handled.",
  },
  {
    question: "What is the difference between Sandbox and Live?",
    answer:
      "Every project has isolated Sandbox and Live environments with separate API keys, customers, meters, balances, usage, billing configuration, webhooks, and provider configuration. The API key determines the environment.",
  },
  {
    question: "How does Consumel prevent duplicate usage?",
    answer:
      "Idempotency protects the logical operation. Retrying the same request with the same key returns its original result without consuming twice. Reusing that key for a different request returns a conflict.",
  },
  {
    question: "How can I integrate Consumel?",
    answer:
      "V1 includes first-class SDKs for Go, Node.js, and Python. The HTTP API remains the authoritative interface and can be used directly without an SDK.",
  },
  {
    question: "How do payment provider connections work?",
    answer:
      "You connect your own provider account. Consumel uses a provider-specific adapter to verify payment events, resolve the correct customer, and update the corresponding balance or entitlement without placing provider calls in the synchronous consume path.",
  },
  {
    question: "Does Consumel process or hold payments?",
    answer:
      "No. Your payment provider remains responsible for collecting and holding payments. Consumel manages the usage, entitlement, and billing state around that payment flow.",
  },
] as const;

export function FaqSection() {
  return (
    <section
      className="scroll-mt-24 border-t border-[#d8e2e9] bg-white py-24 text-[#07121c] max-[620px]:scroll-mt-[88px] max-[620px]:py-[72px]"
      id="faq"
      aria-labelledby="faq-title"
    >
      <div className="page-shell grid grid-cols-[minmax(240px,0.65fr)_minmax(0,1.35fr)] gap-[clamp(48px,8vw,112px)] max-[820px]:grid-cols-1 max-[820px]:gap-10">
        <header>
          <h2
            className="m-0 max-w-[430px] [font-family:var(--font-bricolage-grotesque)] text-[clamp(40px,4.2vw,56px)] leading-[0.98] font-bold tracking-[-0.045em]"
            id="faq-title"
          >
            Frequently asked questions.
          </h2>
        </header>

        <Accordion className="border-t border-[#cbd7df]" type="single" collapsible>
          {questions.map((item, index) => (
            <AccordionItem
              className="border-b border-[#dce5eb]"
              key={item.question}
              value={`question-${index + 1}`}
            >
              <AccordionTrigger className="min-h-[72px] cursor-pointer rounded-none py-5 text-[17px] leading-6 font-semibold text-[#142631] hover:text-[#075aaf] focus-visible:border-transparent focus-visible:ring-[#087cec]/35 [&_[data-slot=accordion-trigger-icon]]:mt-1 [&_[data-slot=accordion-trigger-icon]]:size-5 [&_[data-slot=accordion-trigger-icon]]:text-[#087cec]">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="max-w-[680px] pr-12 pb-6 text-[15px] leading-7 text-[#5d6872] max-[620px]:pr-6">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
