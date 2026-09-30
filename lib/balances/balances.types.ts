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

export type AddBalanceInput = {
  customerId: string;
  meterKey: string;
  quantity: number;
  expiresAt?: string;
};

export type SetBalanceInput = {
  quantity: number;
};
