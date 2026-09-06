"use client";

import {
  ArrowClockwiseIcon,
  ArrowRightIcon,
  BracketsCurlyIcon,
  CheckCircleIcon,
  CopyIcon,
  LightningIcon,
  PlusIcon,
  WarningCircleIcon,
  XCircleIcon,
} from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useMemo, useReducer, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  type BillingModel,
  createInitialState,
  type Language,
  playgroundReducer,
  requestCode,
} from "@/lib/playground/playground";

const models: { id: BillingModel; label: string; note: string }[] = [
  { id: "prepaid", label: "Prepaid", note: "Deduct credits" },
  { id: "postpaid", label: "Postpaid", note: "Accrue usage" },
  { id: "hybrid", label: "Hybrid", note: "Allowance + overage" },
];
const meters = [
  { id: "ai_tokens", label: "AI tokens" },
  { id: "api_calls", label: "API calls" },
  { id: "storage_gb", label: "Storage" },
];
const languages: { id: Language; label: string; asset?: string }[] = [
  { id: "HTTP", label: "HTTP" },
  { id: "Node.js", label: "Node.js", asset: "/assets/sdk/nodejs.svg" },
  { id: "Go", label: "Go", asset: "/assets/sdk/go.svg" },
  { id: "Python", label: "Python", asset: "/assets/sdk/python.svg" },
];

export function UsagePlayground() {
  const [state, dispatch] = useReducer(playgroundReducer, undefined, createInitialState);
  const [copied, setCopied] = useState(false);
  const reduceMotion = useReducedMotion();
  const code = useMemo(() => requestCode(state), [state]);
  const stateValue =
    state.model === "prepaid"
      ? state.balance
      : state.model === "postpaid"
        ? state.periodUsage
        : state.includedRemaining;
  const stateLabel =
    state.model === "prepaid"
      ? "Available balance"
      : state.model === "postpaid"
        ? "Usage this period"
        : "Included units left";
  const hasAllowance = state.model !== "postpaid";

  async function copyCode() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <section className="playground" id="playground" aria-labelledby="playground-title">
      <header className="playground__heading">
        <div>
          <p className="section-kicker">USAGE PLAYGROUND</p>
          <h2 id="playground-title">
            Change the request. Watch the customer state change with it.
          </h2>
        </div>
        <p>
          This runs locally in your browser. Try the same idempotency key twice, spend past a
          prepaid balance, or switch customers to start with a clean account.
        </p>
      </header>

      <div className="playground__frame">
        <div className="playground__bar">
          <div>
            <i />
            <strong>Sandbox</strong>
            <span>cm_test_••••92d</span>
          </div>
          <Button variant="quiet" size="compact" onClick={() => dispatch({ type: "reset" })}>
            <ArrowClockwiseIcon weight="bold" aria-hidden="true" /> Reset playground
          </Button>
        </div>

        <div className="model-switch" role="group" aria-label="Billing model">
          {models.map((model) => (
            <button
              type="button"
              className={state.model === model.id ? "is-active" : undefined}
              aria-pressed={state.model === model.id}
              onClick={() => dispatch({ type: "modelChanged", value: model.id })}
              key={model.id}
            >
              <strong>{model.label}</strong>
              <span>{model.note}</span>
            </button>
          ))}
        </div>

        <div className="playground__workbench">
          <div className="request-panel">
            <div className="panel-title">
              <span>01</span>
              <div>
                <strong>Build the consume request</strong>
                <small>Sent by your product</small>
              </div>
            </div>
            <div className="field-grid">
              <label className="field field--wide" htmlFor="playground-customer-id">
                <span>
                  Customer ID <em>changing this resets customer state</em>
                </span>
                <Input
                  id="playground-customer-id"
                  value={state.customerId}
                  onChange={(event) =>
                    dispatch({ type: "customerChanged", value: event.target.value })
                  }
                  spellCheck={false}
                />
              </label>
              <fieldset className="field field--wide meter-picker">
                <legend>Meter</legend>
                <div>
                  {meters.map((meter) => (
                    <button
                      type="button"
                      className={state.meterKey === meter.id ? "is-active" : undefined}
                      aria-pressed={state.meterKey === meter.id}
                      onClick={() => dispatch({ type: "meterChanged", value: meter.id })}
                      key={meter.id}
                    >
                      {meter.label}
                    </button>
                  ))}
                </div>
              </fieldset>
              <label className="field" htmlFor="playground-quantity">
                <span>Quantity</span>
                <Input
                  id="playground-quantity"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={5000}
                  value={state.quantity}
                  onChange={(event) =>
                    dispatch({ type: "quantityChanged", value: Number(event.target.value) })
                  }
                />
              </label>
              <label className="field" htmlFor="playground-idempotency-key">
                <span>Idempotency key</span>
                <Input
                  id="playground-idempotency-key"
                  value={state.idempotencyKey}
                  onChange={(event) =>
                    dispatch({ type: "idempotencyChanged", value: event.target.value })
                  }
                  spellCheck={false}
                />
              </label>
            </div>
            <div className="request-panel__actions">
              <Button onClick={() => dispatch({ type: "consume" })}>
                <LightningIcon weight="fill" aria-hidden="true" /> Run consume{" "}
                <ArrowRightIcon weight="bold" aria-hidden="true" />
              </Button>
              {hasAllowance && (
                <Button variant="secondary" onClick={() => dispatch({ type: "grant" })}>
                  <PlusIcon weight="bold" aria-hidden="true" /> Grant 1,000 units
                </Button>
              )}
            </div>
          </div>

          <div className="state-panel">
            <div className="panel-title">
              <span>02</span>
              <div>
                <strong>Customer state</strong>
                <small>{state.customerId || "No customer ID"}</small>
              </div>
            </div>
            <div className="state-panel__metric">
              <span>{stateLabel}</span>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.strong
                  key={`${state.model}-${stateValue}`}
                  initial={reduceMotion ? false : { y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={reduceMotion ? undefined : { y: 10, opacity: 0 }}
                >
                  {stateValue.toLocaleString()}
                </motion.strong>
              </AnimatePresence>
              <code>{state.meterKey}</code>
            </div>
            {state.model === "hybrid" && (
              <div className="state-panel__overage">
                <span>Overage</span>
                <strong>{state.overage.toLocaleString()}</strong>
              </div>
            )}
            <div
              className={`consume-result consume-result--${state.result.status}`}
              aria-live="polite"
            >
              <ResultIcon status={state.result.status} />
              <div>
                <strong>{resultTitle(state.result.status)}</strong>
                <span>{state.result.message}</span>
              </div>
              {state.result.remaining !== undefined && (
                <code>{state.result.remaining.toLocaleString()} left</code>
              )}
            </div>
            <div className="state-panel__counts">
              <div>
                <span>Successful consumes</span>
                <strong>{state.billableOperations}</strong>
              </div>
              <div>
                <span>Overage units</span>
                <strong>{state.overage.toLocaleString()}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="playground__code-row">
          <div className="sdk-code">
            <div className="sdk-code__top">
              <Tabs
                value={state.language}
                onValueChange={(value) =>
                  dispatch({ type: "languageChanged", value: value as Language })
                }
              >
                <TabsList aria-label="Integration language">
                  {languages.map((language) => (
                    <TabsTrigger value={language.id} key={language.id}>
                      {language.asset ? (
                        <Image src={language.asset} alt="" width={19} height={19} />
                      ) : (
                        <BracketsCurlyIcon weight="bold" aria-hidden="true" />
                      )}
                      {language.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              <button type="button" className="copy-button" onClick={copyCode}>
                <CopyIcon weight="bold" aria-hidden="true" /> {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <pre>
              <code>{code}</code>
            </pre>
          </div>
          <div className="activity-panel">
            <header>
              <strong>Customer activity</strong>
              <span>{state.ledger.length} events</span>
            </header>
            {state.ledger.length === 0 ? (
              <div className="activity-empty">
                <LightningIcon aria-hidden="true" />
                <p>Run consume or grant units to create activity for this customer.</p>
              </div>
            ) : (
              <ol>
                {state.ledger.map((entry) => (
                  <motion.li
                    layout
                    key={entry.id}
                    initial={reduceMotion ? false : { opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <i className={`tone-${entry.tone}`} />
                    <span>
                      <strong>{entry.label}</strong>
                      <small>event_{String(entry.id).padStart(3, "0")}</small>
                    </span>
                    <code>
                      {entry.amount > 0 ? "+" : ""}
                      {entry.amount.toLocaleString()}
                    </code>
                  </motion.li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function ResultIcon({
  status,
}: {
  status: ReturnType<typeof createInitialState>["result"]["status"];
}) {
  if (status === "allowed" || status === "replayed")
    return <CheckCircleIcon weight="fill" aria-hidden="true" />;
  if (status === "denied" || status === "conflict")
    return <XCircleIcon weight="fill" aria-hidden="true" />;
  return <WarningCircleIcon weight="fill" aria-hidden="true" />;
}

function resultTitle(status: ReturnType<typeof createInitialState>["result"]["status"]) {
  if (status === "allowed") return "Allowed";
  if (status === "denied") return "Denied";
  if (status === "replayed") return "Idempotent replay";
  if (status === "conflict") return "Key conflict";
  return "Waiting for request";
}
