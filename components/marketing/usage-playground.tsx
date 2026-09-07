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
            ? "text-[#9ddcbb]"
            : /^\d+(?:\.\d+)?$/.test(part)
              ? "text-[#ffcf91]"
              : /^(const|await|POST|Bearer)$/.test(part)
                ? "text-[#82c6ff]"
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
    <section
      className="scroll-mt-24 border-t border-[#dce5eb] bg-[#f4f7f9] pt-[88px] pb-[104px] max-[680px]:scroll-mt-[88px] max-[680px]:pt-[60px] max-[680px]:pb-[68px] [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-offset-2 [&_button:focus-visible]:outline-[#075aaf] [&_input:focus-visible]:outline-2 [&_input:focus-visible]:outline-offset-2 [&_input:focus-visible]:outline-[#075aaf]"
      id="playground"
      aria-labelledby="playground-title"
    >
      <div className="page-shell">
        <header className="mb-9 grid grid-cols-[minmax(0,1fr)_minmax(300px,430px)] items-end gap-16 max-[900px]:grid-cols-2 max-[900px]:gap-9 max-[680px]:mb-7 max-[680px]:grid-cols-1 max-[680px]:gap-[18px]">
          <h2
            className="m-0 [font-family:var(--font-bricolage-grotesque)] text-[clamp(40px,4.2vw,56px)] leading-[0.98] font-bold tracking-[-0.045em]"
            id="playground-title"
          >
            Try a consume operation.
          </h2>
          <p className="mb-1 text-[17px] leading-[1.65] text-[#5d6872] max-[680px]:text-base">
            Choose a billing model, enter a quantity, and see the balance, period usage, or
            overage update.
          </p>
        </header>

        <div className="overflow-hidden rounded-2xl border border-[#cbd7df] bg-white shadow-[0_22px_58px_rgb(18_48_68/8%)]">
          <div className="flex min-h-[66px] items-center justify-between gap-6 border-b border-[#dce5eb] px-[22px] max-[680px]:min-h-[58px] max-[680px]:items-start max-[680px]:px-[10px] max-[680px]:py-[10px]">
            <div className="flex min-w-0 items-center gap-[22px] max-[900px]:gap-3 max-[680px]:flex-wrap max-[680px]:items-start">
              <ToggleGroup
                type="single"
                value={state.model}
                className="gap-[3px] rounded-[9px] bg-[#edf2f5] p-1"
                aria-label="Billing model"
                onValueChange={(value) => {
                  if (models.includes(value as BillingModel)) {
                    dispatch({ type: "modelChanged", value: value as BillingModel });
                    setBalanceInput(value === "postpaid" ? "0" : "3000");
                  }
                }}
              >
                {models.map((model) => (
                  <ToggleGroupItem
                    className="min-h-9 rounded-md border border-transparent bg-transparent px-[18px] text-[13px] text-[#5b6b77] capitalize data-[state=on]:border-[#cfdae2] data-[state=on]:bg-white data-[state=on]:text-[#075aaf] data-[state=on]:shadow-[0_1px_3px_rgb(16_43_64/7%)] max-[680px]:min-h-[38px] max-[680px]:px-[11px] max-[680px]:text-xs"
                    key={model}
                    value={model}
                  >
                    {model}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>

              <div className="flex items-center gap-2 max-[680px]:min-h-[38px]">
                <Label
                  className="flex-none text-xs font-[650] text-[#62727e]"
                  htmlFor="demo-customer"
                >
                  Customer
                </Label>
                <Input
                  className="h-[38px] w-[158px] border-[#cbd7df] bg-white font-mono text-xs text-[#183040] max-[680px]:w-[142px]"
                  id="demo-customer"
                  value={state.customerId}
                  spellCheck={false}
                  aria-label="Customer ID"
                  onChange={(event) =>
                    dispatch({ type: "customerChanged", value: event.target.value })
                  }
                />
              </div>

              <div className="flex items-center gap-2">
                <Label
                  className="flex-none text-xs font-[650] text-[#62727e] max-[900px]:hidden"
                  htmlFor="demo-meter"
                >
                  Meter
                </Label>
                <Select
                  value={state.meterKey}
                  onValueChange={(value) => dispatch({ type: "meterChanged", value })}
                >
                  <SelectTrigger
                    className="h-[38px] w-[138px] max-[680px]:w-[124px]"
                    id="demo-meter"
                    aria-label="Meter"
                  >
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

          <div className="grid grid-cols-[minmax(0,1.18fr)_minmax(350px,0.82fr)] max-[900px]:grid-cols-[minmax(0,1fr)_minmax(300px,0.8fr)] max-[680px]:flex max-[680px]:flex-col">
            <div className="min-w-0 bg-[#071827] text-[#d7e9f7] [&_button:focus-visible]:outline-white">
              <Tabs
                value={state.language}
                onValueChange={(value) => {
                  dispatch({ type: "languageChanged", value: value as Language });
                  setCopyStatus("");
                }}
              >
                <div className="flex min-h-[58px] items-center justify-between gap-3 border-b border-[#253a4b] px-[18px] max-[680px]:px-[10px]">
                  <TabsList className="gap-1.5 max-[900px]:gap-0" aria-label="Code language">
                    {languages.map((language) => (
                      <TabsTrigger
                        className="min-h-[58px] gap-2 rounded-none border-0 border-b-2 border-transparent bg-transparent px-[10px] text-[13px] text-[#a8bac8] data-[state=active]:border-b-[#55b9ff] data-[state=active]:bg-transparent data-[state=active]:text-white max-[900px]:px-[7px] max-[900px]:text-xs max-[680px]:gap-[5px] max-[680px]:px-1.5 [&_img]:size-5 [&_img]:object-contain max-[900px]:[&_img]:size-[18px] [&_svg]:size-5 max-[900px]:[&_svg]:size-[18px] max-[680px]:[&_span]:hidden max-[680px]:data-[state=active]:[&_span]:inline"
                        key={language.name}
                        value={language.name}
                      >
                        {language.asset ? (
                          <Image src={language.asset} alt="" width={20} height={20} />
                        ) : (
                          <CodeIcon aria-hidden="true" />
                        )}
                        <span>{language.name}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  <div className="flex items-center gap-1 text-[11px] text-[#9eb2c1]">
                    <span role="status">{copyStatus}</span>
                    <Button
                      variant="quiet"
                      size="compact"
                      className="min-w-10 !bg-transparent p-0 text-[#b8cddd] [&_svg]:size-[18px]"
                      aria-label="Copy code"
                      onClick={copyCode}
                    >
                      <CopyIcon aria-hidden="true" />
                    </Button>
                  </div>
                </div>
                {languages.map((language) => (
                  <TabsContent key={language.name} value={language.name} className="m-0">
                    <pre className="m-0 min-h-[250px] overflow-auto p-[26px_28px] font-mono text-[13px] leading-[1.85] [tab-size:2] max-[900px]:px-[22px] max-[900px]:text-xs max-[680px]:min-h-[220px] max-[680px]:p-[22px]">
                      <code>
                        <Code value={requestCode({ ...state, language: language.name })} />
                      </code>
                    </pre>
                  </TabsContent>
                ))}
              </Tabs>
            </div>

            <div className="min-w-0 bg-[#087cec] px-[26px] pt-[22px] pb-5 text-white max-[900px]:px-[22px] max-[680px]:order-first max-[680px]:p-6 [&_button:focus-visible]:outline-white [&_input:focus-visible]:outline-white">
              <div className="flex justify-between gap-4 text-[13px]">
                <span>{label}</span>
                <span>{meters.find((meter) => meter.key === state.meterKey)?.name}</span>
              </div>
              <strong className="mt-3 mb-[14px] block [overflow-wrap:anywhere] [font-family:var(--font-bricolage-grotesque)] text-[clamp(46px,4vw,62px)] leading-none font-bold tracking-[-0.05em] tabular-nums max-[680px]:text-[52px]">
                {formatUnits(value)}
              </strong>
              {state.model === "hybrid" && (
                <div className="mt-[-2px] mb-[14px] flex">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[11px] text-white/[0.72]">Overage units</span>
                    <strong className="text-lg tabular-nums">
                      {formatUnits(state.overage)}
                    </strong>
                  </div>
                </div>
              )}
              <div className="h-1 overflow-hidden rounded bg-white/25">
                <i
                  className="block h-full bg-white transition-[width] duration-200 motion-reduce:transition-none"
                  style={{
                    width: `${state.model === "postpaid" ? 100 : Math.min(100, (value / 3000) * 100)}%`,
                  }}
                />
              </div>
              <div className="min-h-[42px] pt-[10px] text-[13px] leading-normal" role="status">
                {state.result.status === "idle" ? "" : state.result.message}
              </div>

              <div className="flex items-end gap-3">
                <div className="grid w-[140px] gap-2">
                  <Label className="text-xs text-white/[0.84]" htmlFor="demo-quantity">
                    Quantity
                  </Label>
                  <Input
                    className="h-11 border-white/50 bg-white/10 [font-family:var(--font-onest)] text-sm text-white shadow-none"
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
                <Button
                  className="min-h-11 flex-1 gap-2 !border-white !bg-white !text-[#075aaf] hover:!border-[#edf6ff] hover:!bg-[#edf6ff] hover:!text-[#064b91] [&_svg]:size-4"
                  disabled={!validQuantity}
                  onClick={consume}
                >
                  <PlayIcon weight="fill" aria-hidden="true" />
                  Consume
                </Button>
              </div>

              {state.model !== "postpaid" && (
                <div className="mt-3 grid gap-2 border-t border-white/25 pt-3">
                  <Label className="text-xs text-white/[0.84]" htmlFor="demo-balance">
                    {state.model === "hybrid" ? "Add allowance" : "Add balance"}
                  </Label>
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                    <Input
                      className="h-11 border-white/50 bg-white/10 [font-family:var(--font-onest)] text-sm text-white shadow-none"
                      id="demo-balance"
                      type="number"
                      min={0}
                      step="any"
                      value={balanceInput}
                      aria-invalid={balanceInput !== "" && !validBalance}
                      onChange={(event) => setBalanceInput(event.target.value)}
                    />
                    <Button
                      className="min-h-11 border-white/60 bg-transparent text-white hover:border-white hover:bg-white/15 hover:text-white"
                      variant="secondary"
                      disabled={!validBalance}
                      onClick={addBalance}
                    >
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
