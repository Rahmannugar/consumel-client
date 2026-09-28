import { APIError, apiRequest } from "@/lib/api/api-client";
import type {
  CreateCustomerInput,
  Customer,
  CustomerContext,
  CustomerFields,
  CustomerMetadata,
  CustomersResponse,
} from "./customers.types";

export async function loadCustomers(
  context: CustomerContext,
  cursor: string | null,
): Promise<CustomersResponse> {
  const query = new URLSearchParams({ limit: "25" });
  if (cursor) query.set("cursor", cursor);
  const response = await apiRequest(`${customersPath(context)}?${query.toString()}`);
  if (!isCustomersResponse(response)) {
    throw invalidCustomerResponse();
  }
  return response;
}

export async function loadCustomer(
  context: CustomerContext,
  customerId: string,
): Promise<Customer> {
  const response = await apiRequest(customerPath(context, customerId));
  if (!isCustomer(response)) {
    throw invalidCustomerResponse();
  }
  return response;
}

export async function createCustomer(
  context: CustomerContext,
  input: CreateCustomerInput,
): Promise<Customer> {
  const response = await apiRequest(customersPath(context), {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!isCustomer(response)) {
    throw invalidCustomerResponse();
  }
  return response;
}

export async function updateCustomer(
  context: CustomerContext,
  customerId: string,
  input: CustomerFields,
): Promise<Customer> {
  const response = await apiRequest(customerPath(context, customerId), {
    method: "PUT",
    body: JSON.stringify(input),
  });
  if (!isCustomer(response)) {
    throw invalidCustomerResponse();
  }
  return response;
}

export function customerErrorMessage(error: unknown) {
  if (error instanceof APIError) return error.message;
  return "Consumel could not complete the customer request. Try again.";
}

function customersPath(context: CustomerContext) {
  return `/v1/projects/${encodeURIComponent(context.projectId)}/environments/${context.environment}/customers`;
}

function customerPath(context: CustomerContext, customerId: string) {
  return `${customersPath(context)}/${encodeURIComponent(customerId)}`;
}

function invalidCustomerResponse() {
  return new APIError(
    502,
    "invalid_response",
    "Consumel returned an invalid customer response.",
  );
}

function isCustomersResponse(value: unknown): value is CustomersResponse {
  return (
    isRecord(value) &&
    Array.isArray(value.customers) &&
    value.customers.every(isCustomer) &&
    (value.nextCursor === null || typeof value.nextCursor === "string")
  );
}

function isCustomer(value: unknown): value is Customer {
  return (
    isRecord(value) &&
    typeof value.customerId === "string" &&
    (value.name === null || typeof value.name === "string") &&
    (value.email === null || typeof value.email === "string") &&
    isCustomerMetadata(value.metadata) &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string"
  );
}

function isCustomerMetadata(value: unknown): value is CustomerMetadata {
  return (
    isRecord(value) &&
    optionalString(value.plan) &&
    optionalString(value.country) &&
    optionalString(value.location)
  );
}

function optionalString(value: unknown) {
  return value === undefined || typeof value === "string";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
