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
  keySequence: number;
};

export type PlaygroundAction =
  | { type: "customerChanged"; value: string }
  | { type: "modelChanged"; value: BillingModel }
  | { type: "meterChanged"; value: string }
  | { type: "quantityChanged"; value: number }
  | { type: "idempotencyChanged"; value: string }
  | { type: "newIdempotencyKey"; value: string }
  | { type: "languageChanged"; value: Language }
  | { type: "consume" }
  | { type: "grant"; value: number }
  | { type: "reset" };

const idleResult: Result = { status: "idle", message: "Run consume to see the result." };
const unitFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 8 });

export function formatUnits(value: number) {
  return unitFormatter.format(value);
}

function customerContext(model: BillingModel) {
  return {
    balance: model === "prepaid" ? 3000 : 0,
    periodUsage: 0,
    includedRemaining: model === "hybrid" ? 3000 : 0,
    overage: 0,
    billableOperations: 0,
    result: idleResult,
    ledger: [] as LedgerEntry[],
    processed: {} as Record<string, ProcessedRequest>,
    sequence: 0,
    idempotencyKey: "01990f7c-32d0-7d5a-9a51-3b1eec975da2",
    keySequence: 1,
  };
}

export function createInitialState(): PlaygroundState {
  return {
    model: "prepaid",
    customerId: "customer_1842",
    meterKey: "ai_tokens",
    quantity: 500,
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
  if (action.type === "meterChanged") {
    return { ...state, meterKey: action.value, ...customerContext(state.model) };
  }
  if (action.type === "quantityChanged") {
    return Number.isFinite(action.value) && action.value > 0
      ? { ...state, quantity: action.value }
      : state;
  }
  if (action.type === "idempotencyChanged") return { ...state, idempotencyKey: action.value };
  if (action.type === "newIdempotencyKey") {
    return {
      ...state,
      idempotencyKey: action.value,
      keySequence: state.keySequence + 1,
    };
  }
  if (action.type === "languageChanged") return { ...state, language: action.value };
  if (action.type === "reset") return createInitialState();
  if (action.type === "grant") {
    if (!Number.isFinite(action.value) || action.value <= 0) return state;
    const amount = action.value;
    const next =
      state.model === "prepaid"
        ? { balance: state.balance + amount }
        : { includedRemaining: state.includedRemaining + amount };
    return {
      ...state,
      ...next,
      result: idleResult,
      sequence: state.sequence + 1,
      ledger: addEntry(state, {
        label: `${formatUnits(amount)} units granted`,
        amount,
        tone: "positive",
      }),
    };
  }
  const quantity = state.quantity;
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
  const includedUsed = Math.min(state.includedRemaining, quantity);
  const overageAdded = quantity - includedUsed;
  const result: Result = denied
    ? {
        status: "denied",
        message: "This request exceeds the available balance.",
        remaining: state.balance,
      }
    : {
        status: "allowed",
        message:
          state.model === "postpaid"
            ? `${formatUnits(quantity)} units added to this period.`
            : state.model === "hybrid"
              ? hybridResultMessage(includedUsed, overageAdded)
              : `${formatUnits(quantity)} units consumed.`,
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

function hybridResultMessage(includedUsed: number, overageAdded: number) {
  if (overageAdded === 0) return `${formatUnits(includedUsed)} included units consumed.`;
  if (includedUsed === 0) return `${formatUnits(overageAdded)} overage units recorded.`;
  return `${formatUnits(includedUsed)} included units and ${formatUnits(overageAdded)} overage units recorded.`;
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
    return `result, err := client.Consume(ctx, consumel.ConsumeParams{\n  CustomerID: "${values.customerId}",\n  MeterKey: "${values.meterKey}",\n  Quantity: ${values.quantity},\n})`;
  }
  if (state.language === "Python") {
    return `result = consumel.consume(\n    customer_id="${values.customerId}",\n    meter_key="${values.meterKey}",\n    quantity=${values.quantity},\n)`;
  }
  return `const result = await consumel.consume({\n  customerId: "${values.customerId}",\n  meterKey: "${values.meterKey}",\n  quantity: ${values.quantity}\n});`;
}

export function createUuidV7() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  let timestamp = Date.now();

  for (let index = 5; index >= 0; index -= 1) {
    bytes[index] = timestamp % 256;
    timestamp = Math.floor(timestamp / 256);
  }

  bytes[6] = (bytes[6] & 0x0f) | 0x70;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"));
  return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex
    .slice(6, 8)
    .join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10).join("")}`;
}
