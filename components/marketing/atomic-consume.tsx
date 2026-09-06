import {
  ArrowRightIcon,
  CheckCircleIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react/dist/ssr";

export function AtomicConsume() {
  return (
    <section className="atomic-section" id="atomic-consume" aria-labelledby="atomic-title">
      <div className="page-shell">
        <div className="atomic-section__heading">
          <p className="section-kicker">ONE PERMANENT OPERATION</p>
          <h2 id="atomic-title">Access and usage should not disagree.</h2>
          <p>
            A separate check and track leave a gap between permission and the usage record.
            Consumel makes the decision, records usage, and changes the customer balance
            together.
          </p>
        </div>
        <div className="atomic-compare">
          <article className="integration integration--split">
            <header>
              <WarningCircleIcon weight="fill" aria-hidden="true" />
              <span>Two calls, a gap</span>
            </header>
            <pre>
              <code>{`const { allowed } = await check({\n  featureId: "ai_tokens"\n});\n\nif (allowed) {\n  await track({\n    featureId: "ai_tokens",\n    value: 1024\n  });\n}`}</code>
            </pre>
            <div className="integration__gap">
              <span>work can happen here</span>
            </div>
            <p>The decision and usage record can become two different facts.</p>
          </article>
          <div className="atomic-arrow" aria-hidden="true">
            <ArrowRightIcon weight="bold" />
          </div>
          <article className="integration integration--one">
            <header>
              <CheckCircleIcon weight="fill" aria-hidden="true" />
              <span>One atomic consume</span>
            </header>
            <pre>
              <code>{`const result = await consumel.consume({\n  customerId: "cus_ada",\n  meterKey: "ai_tokens",\n  quantity: 1024,\n  idempotencyKey: "req_001"\n});`}</code>
            </pre>
            <div className="integration__result">
              <span>allowed</span>
              <strong>true</strong>
              <i />
              <span>remaining</span>
              <strong>1,976</strong>
            </div>
            <p>
              The response represents usage and balance state committed by the same operation.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
