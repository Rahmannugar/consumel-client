"use client";

import { CodeIcon, CopyIcon, PlayIcon } from "@phosphor-icons/react";
import Image from "next/image";
import { useReducer, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  type BillingModel,
  createInitialState,
  createUuidV7,
  formatUnits,
  type Language,
  playgroundReducer,
  requestCode,
} from "@/lib/playground/playground";
import styles from "./usage-playground.module.css";

const models: BillingModel[] = ["prepaid", "postpaid", "hybrid"];
const languages: { name: Language; asset?: string }[] = [
  { name: "HTTP" },
  { name: "Node.js", asset: "/assets/sdk/nodejs.svg" },
  { name: "Go", asset: "/assets/sdk/go.svg" },
  { name: "Python", asset: "/assets/sdk/python.svg" },
];
const meters = [
  { key: "api_calls", name: "API calls" },
  { key: "ai_tokens", name: "AI tokens" },
  { key: "storage_gb", name: "Storage" },
];

function Code({ value }: { value: string }) {
  const parts = value.split(
    /("(?:[^"\\]|\\.)*"|\b(?:const|await|result|err|POST|Bearer)\b|\b\d+(?:\.\d+)?\b)/g,
  );
  let offset = 0;

  return parts.map((part) => {
    const key = `${offset}:${part}`;
    offset += part.length;

    return (
      <span
        key={key}
        className={
          part.startsWith('"')
            ? styles.string
            : /^\d+(?:\.\d+)?$/.test(part)
              ? styles.number
              : /^(const|await|POST|Bearer)$/.test(part)
                ? styles.keyword
                : undefined
        }
      >
        {part}
      </span>
    );
  });
}

export function UsagePlayground() {
  const [state, dispatch] = useReducer(playgroundReducer, undefined, createInitialState);
  const [quantityInput, setQuantityInput] = useState(String(state.quantity));
  const [balanceInput, setBalanceInput] = useState("3000");
  const [copyStatus, setCopyStatus] = useState("");

  const value =
    state.model === "prepaid"
      ? state.balance
      : state.model === "postpaid"
        ? state.periodUsage
        : state.includedRemaining;
  const label =
    state.model === "prepaid"
      ? "Available balance"
      : state.model === "postpaid"
        ? "Usage this period"
        : "Included allowance left";
  const quantity = Number(quantityInput);
  const balanceAmount = Number(balanceInput);
  const validQuantity = quantityInput !== "" && Number.isFinite(quantity) && quantity > 0;
  const validBalance =
    balanceInput !== "" && Number.isFinite(balanceAmount) && balanceAmount > 0;
  const code = requestCode(state);

  function consume() {
    if (!validQuantity) return;
    dispatch({ type: "quantityChanged", value: quantity });
    dispatch({ type: "newIdempotencyKey", value: createUuidV7() });
    dispatch({ type: "consume" });
  }

  function addBalance() {
    if (!validBalance) return;
    dispatch({ type: "grant", value: balanceAmount });
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopyStatus("Copied");
    } catch {
      setCopyStatus("Copy unavailable");
    }
  }

  return (
    <section className={styles.section} id="playground" aria-labelledby="playground-title">
      <div className="page-shell">
        <header className={styles.heading}>
          <h2 id="playground-title">Try a consume operation.</h2>
          <p>
            Choose a billing model, enter a quantity, and see the balance, period usage, or
            overage update.
          </p>
        </header>

        <div className={styles.demo}>
          <div className={styles.toolbar}>
            <div className={styles.toolbarControls}>
              <ToggleGroup
                type="single"
                value={state.model}
                className={styles.models}
                aria-label="Billing model"
                onValueChange={(value) => {
                  if (models.includes(value as BillingModel)) {
                    dispatch({ type: "modelChanged", value: value as BillingModel });
                    setBalanceInput(value === "postpaid" ? "0" : "3000");
                  }
                }}
              >
                {models.map((model) => (
                  <ToggleGroupItem key={model} value={model}>
                    {model}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>

              <div className={styles.customerContext}>
                <Label htmlFor="demo-customer">Customer</Label>
                <Input
                  id="demo-customer"
                  value={state.customerId}
                  spellCheck={false}
                  aria-label="Customer ID"
                  onChange={(event) =>
                    dispatch({ type: "customerChanged", value: event.target.value })
                  }
                />
              </div>

              <div className={styles.meterSelect}>
                <Label htmlFor="demo-meter">Meter</Label>
                <Select
                  value={state.meterKey}
                  onValueChange={(value) => dispatch({ type: "meterChanged", value })}
                >
                  <SelectTrigger id="demo-meter" aria-label="Meter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {meters.map((meter) => (
                      <SelectItem key={meter.key} value={meter.key}>
                        {meter.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              variant="quiet"
              size="compact"
              onClick={() => {
                dispatch({ type: "reset" });
                setQuantityInput("500");
                setBalanceInput("3000");
                setCopyStatus("");
              }}
            >
              Reset
            </Button>
          </div>

          <div className={styles.workspace}>
            <div className={styles.editor}>
              <Tabs
                value={state.language}
                onValueChange={(value) => {
                  dispatch({ type: "languageChanged", value: value as Language });
                  setCopyStatus("");
                }}
              >
                <div className={styles.codeToolbar}>
                  <TabsList className={styles.languages} aria-label="Code language">
                    {languages.map((language) => (
                      <TabsTrigger key={language.name} value={language.name}>
                        {language.asset ? (
                          <Image src={language.asset} alt="" width={20} height={20} />
                        ) : (
                          <CodeIcon aria-hidden="true" />
                        )}
                        <span>{language.name}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  <div className={styles.copyArea}>
                    <span role="status">{copyStatus}</span>
                    <Button
                      variant="quiet"
                      size="compact"
                      className={styles.copy}
                      aria-label="Copy code"
                      onClick={copyCode}
                    >
                      <CopyIcon aria-hidden="true" />
                    </Button>
                  </div>
                </div>
                {languages.map((language) => (
                  <TabsContent
                    key={language.name}
                    value={language.name}
                    className={styles.codeContent}
                  >
                    <pre>
                      <code>
                        <Code value={requestCode({ ...state, language: language.name })} />
                      </code>
                    </pre>
                  </TabsContent>
                ))}
              </Tabs>
            </div>

            <div className={styles.result}>
              <div className={styles.resultTop}>
                <span>{label}</span>
                <span>{meters.find((meter) => meter.key === state.meterKey)?.name}</span>
              </div>
              <strong className={styles.balance}>{formatUnits(value)}</strong>
              {state.model === "hybrid" && (
                <div className={styles.hybridMetrics}>
                  <div>
                    <span>Overage units</span>
                    <strong>{formatUnits(state.overage)}</strong>
                  </div>
                </div>
              )}
              <div className={styles.progress} aria-hidden="true">
                <i
                  style={{
                    width: `${state.model === "postpaid" ? 100 : Math.min(100, (value / 3000) * 100)}%`,
                  }}
                />
              </div>
              <div className={styles.feedback} role="status">
                {state.result.status === "idle" ? "" : state.result.message}
              </div>

              <div className={styles.actions}>
                <div className={styles.quantity}>
                  <Label htmlFor="demo-quantity">Quantity</Label>
                  <Input
                    id="demo-quantity"
                    type="number"
                    min={0}
                    step="any"
                    value={quantityInput}
                    aria-invalid={quantityInput !== "" && !validQuantity}
                    onChange={(event) => {
                      const nextValue = event.target.value;
                      setQuantityInput(nextValue);
                      const nextQuantity = Number(nextValue);
                      if (
                        nextValue !== "" &&
                        Number.isFinite(nextQuantity) &&
                        nextQuantity > 0
                      ) {
                        dispatch({ type: "quantityChanged", value: nextQuantity });
                      }
                    }}
                  />
                </div>
                <Button className={styles.consume} disabled={!validQuantity} onClick={consume}>
                  <PlayIcon weight="fill" aria-hidden="true" />
                  Consume
                </Button>
              </div>

              {state.model !== "postpaid" && (
                <div className={styles.grant}>
                  <Label htmlFor="demo-balance">
                    {state.model === "hybrid" ? "Add allowance" : "Add balance"}
                  </Label>
                  <div className={styles.balanceActions}>
                    <Input
                      id="demo-balance"
                      type="number"
                      min={0}
                      step="any"
                      value={balanceInput}
                      aria-invalid={balanceInput !== "" && !validBalance}
                      onChange={(event) => setBalanceInput(event.target.value)}
                    />
                    <Button variant="secondary" disabled={!validBalance} onClick={addBalance}>
                      Add
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
