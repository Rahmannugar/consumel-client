import type { ProjectEnvironment } from "@/lib/projects/projects.types";

export type BalanceContext = {
  projectId: string;
  environment: ProjectEnvironment["name"];
};

export type Balance = {
  id: string;
  customerId: string;
  meterKey: string;
  quantity: number;
  nextExpiresAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BalancesResponse = {
  balances: Balance[];
};

export type EntitlementGrant = {
  id: string;
  grantedQuantity: number;
  remainingQuantity: number;
  status: "active" | "exhausted" | "expired";
  expiresAt: string | null;
  createdAt: string;
};

export type EntitlementGrantsResponse = {
  grants: EntitlementGrant[];
  nextCursor: string | null;
};

export type BalanceActivity = {
  id: string;
  kind: "add" | "set" | "usage" | "expiration";
  quantityChange: number;
  resultingQuantity: number | null;
  expiresAt: string | null;
  sourceType: string;
  occurredAt: string;
};

export type BalanceActivityResponse = {
  activity: BalanceActivity[];
  nextCursor: string | null;
};

export type AddBalanceInput = {
  customerId: string;
  meterKey: string;
  quantity: number;
  expiresAt?: string;
};

export type SetBalanceInput = {
  quantity: number;
};
