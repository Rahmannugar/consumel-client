import type { ProjectEnvironment } from "@/lib/projects/projects.types";

export type OperationStatus = "accepted" | "denied";

export type UsageOperation = {
  id: string;
  customerId: string;
  meterKey: string;
  quantity: number;
  meterType: "prepaid" | "postpaid" | "hybrid";
  status: OperationStatus;
  denialReason: string | null;
  balanceDebited: number;
  remainingBalance: number | null;
  billable: boolean;
  replayCount: number;
  lastReplayedAt: string | null;
  createdAt: string;
};

export type OperationsResponse = {
  operations: UsageOperation[];
  nextCursor: string | null;
};

export type EventsContext = {
  projectId: string;
  environment: ProjectEnvironment["name"];
};

export type EventsFilter = {
  status: OperationStatus | "";
  period: "7d" | "30d" | "60d" | "90d" | "1y" | "custom";
  from?: string;
  to?: string;
};
