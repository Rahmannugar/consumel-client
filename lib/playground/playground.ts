export type BillingModel = "prepaid" | "postpaid" | "hybrid";
export type Language = "HTTP" | "Node.js" | "Go" | "Python";
export type ResultStatus = "idle" | "allowed" | "denied" | "replayed" | "conflict";

export type Result = { status: ResultStatus; message: string; remaining?: number };
export type LedgerEntry = {
  id: number;
  label: string;
  amount: number;
  tone: "positive" | "negative" | "neutral";
};
type ProcessedRequest = { signature: string; result: Result };

export type PlaygroundState = {
  model: BillingModel;
  customerId: string;
  meterKey: string;
  quantity: number;
  idempotencyKey: string;
  language: Language;
  balance: number;
  periodUsage: number;
  includedRemaining: number;
  overage: number;
  billableOperations: number;
  result: Result;
  ledger: LedgerEntry[];
  processed: Record<string, ProcessedRequest>;
  sequence: number;
};

export type PlaygroundAction =
  | { type: "customerChanged"; value: string }
  | { type: "modelChanged"; value: BillingModel }
  | { type: "meterChanged"; value: string }
  | { type: "quantityChanged"; value: number }
  | { type: "idempotencyChanged"; value: string }
  | { type: "languageChanged"; value: Language }
  | { type: "consume" }
  | { type: "grant" }
  | { type: "reset" };

const idleResult: Result = { status: "idle", message: "Ready for a consume request" };

function customerContext(model: BillingModel) {
  return {
    balance: model === "prepaid" ? 3000 : 0,
    periodUsage: model === "postpaid" ? 1820 : 0,
    includedRemaining: model === "hybrid" ? 3000 : 0,
    overage: 0,
    billableOperations: 0,
    result: idleResult,
    ledger: [] as LedgerEntry[],
    processed: {} as Record<string, ProcessedRequest>,
    sequence: 0,
  };
}

export function createInitialState(): PlaygroundState {
  return {
    model: "prepaid",
    customerId: "cus_ada",
    meterKey: "ai_tokens",
    quantity: 500,
    idempotencyKey: "req_001",
    language: "Node.js",
    ...customerContext("prepaid"),
  };
}

function addEntry(state: PlaygroundState, entry: Omit<LedgerEntry, "id">) {
  return [{ id: state.sequence + 1, ...entry }, ...state.ledger].slice(0, 4);
}

export function playgroundReducer(
  state: PlaygroundState,
  action: PlaygroundAction,
): PlaygroundState {
  if (action.type === "customerChanged") {
    return { ...state, customerId: action.value, ...customerContext(state.model) };
  }
  if (action.type === "modelChanged") {
    return { ...state, model: action.value, ...customerContext(action.value) };
  }
  if (action.type === "meterChanged") return { ...state, meterKey: action.value };
  if (action.type === "quantityChanged") return { ...state, quantity: action.value };
  if (action.type === "idempotencyChanged") return { ...state, idempotencyKey: action.value };
  if (action.type === "languageChanged") return { ...state, language: action.value };
  if (action.type === "reset") return createInitialState();
  if (action.type === "grant") {
    const next =
      state.model === "prepaid"
        ? { balance: state.balance + 1000 }
        : { includedRemaining: state.includedRemaining + 1000 };
    return {
      ...state,
      ...next,
      result: idleResult,
      sequence: state.sequence + 1,
      ledger: addEntry(state, { label: "1,000 units granted", amount: 1000, tone: "positive" }),
    };
  }

  const quantity = Math.max(1, Math.min(5000, Math.round(state.quantity || 1)));
  const signature = `${state.customerId}|${state.meterKey}|${quantity}|${state.model}`;
  const prior = state.processed[state.idempotencyKey];
  if (prior?.signature === signature) {
    return {
      ...state,
      quantity,
      result: { ...prior.result, status: "replayed", message: "Original result returned" },
    };
  }
  if (prior) {
    return {
      ...state,
      quantity,
      result: { status: "conflict", message: "This key belongs to a different request" },
    };
  }

  const denied = state.model === "prepaid" && quantity > state.balance;
  const result: Result = denied
    ? { status: "denied", message: "Insufficient balance", remaining: state.balance }
    : {
        status: "allowed",
        message: "Usage accepted and state updated",
        remaining:
          state.model === "prepaid"
            ? state.balance - quantity
            : state.model === "hybrid"
              ? Math.max(0, state.includedRemaining - quantity)
              : undefined,
      };
  const processed = { ...state.processed, [state.idempotencyKey]: { signature, result } };

  if (denied) {
    return {
      ...state,
      quantity,
      result,
      processed,
      sequence: state.sequence + 1,
      ledger: addEntry(state, { label: "Consume denied", amount: 0, tone: "negative" }),
    };
  }

  const includedUsed = Math.min(state.includedRemaining, quantity);
  return {
    ...state,
    quantity,
    result,
    processed,
    balance: state.model === "prepaid" ? state.balance - quantity : state.balance,
    periodUsage: state.model === "postpaid" ? state.periodUsage + quantity : state.periodUsage,
    includedRemaining:
      state.model === "hybrid"
        ? state.includedRemaining - includedUsed
        : state.includedRemaining,
    overage: state.model === "hybrid" ? state.overage + quantity - includedUsed : state.overage,
    billableOperations: state.billableOperations + 1,
    sequence: state.sequence + 1,
    ledger: addEntry(state, {
      label: `${state.meterKey} consumed`,
      amount: -quantity,
      tone: "neutral",
    }),
  };
}

export function requestCode(state: PlaygroundState) {
  const values = {
    customerId: state.customerId,
    meterKey: state.meterKey,
    quantity: state.quantity,
    key: state.idempotencyKey,
  };
  if (state.language === "HTTP") {
    return `POST /v1/consume\nAuthorization: Bearer cm_test_••••\nIdempotency-Key: ${values.key}\n\n{\n  "customer_id": "${values.customerId}",\n  "meter_key": "${values.meterKey}",\n  "quantity": ${values.quantity}\n}`;
  }
  if (state.language === "Go") {
    return `result, err := client.Consume(ctx, consumel.ConsumeParams{\n  CustomerID: "${values.customerId}",\n  MeterKey: "${values.meterKey}",\n  Quantity: ${values.quantity},\n  IdempotencyKey: "${values.key}",\n})`;
  }
  if (state.language === "Python") {
    return `result = consumel.consume(\n    customer_id="${values.customerId}",\n    meter_key="${values.meterKey}",\n    quantity=${values.quantity},\n    idempotency_key="${values.key}",\n)`;
  }
  return `const result = await consumel.consume({\n  customerId: "${values.customerId}",\n  meterKey: "${values.meterKey}",\n  quantity: ${values.quantity},\n  idempotencyKey: "${values.key}"\n});`;
}
