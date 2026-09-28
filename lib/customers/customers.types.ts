import type { ProjectEnvironment } from "@/lib/projects/projects.types";

export type CustomerMetadata = {
  plan?: string;
  country?: string;
  location?: string;
};

export type Customer = {
  customerId: string;
  name: string | null;
  email: string | null;
  metadata: CustomerMetadata;
  createdAt: string;
  updatedAt: string;
};

export type CustomersResponse = {
  customers: Customer[];
  nextCursor: string | null;
};

export type CustomerFields = {
  name?: string;
  email?: string;
  metadata: CustomerMetadata;
};

export type CreateCustomerInput = CustomerFields & {
  customerId: string;
};

export type CustomerContext = {
  projectId: string;
  environment: ProjectEnvironment["name"];
};
