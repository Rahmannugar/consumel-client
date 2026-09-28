import { z } from "zod";

const optionalText = (maximum: number) =>
  z
    .string()
    .trim()
    .max(maximum)
    .transform((value) => value || undefined)
    .optional();

export const customerFieldsSchema = z.object({
  name: optionalText(200),
  email: z
    .union([z.literal(""), z.email("Enter a valid email address.").max(320)])
    .transform((value) => value || undefined)
    .optional(),
  plan: optionalText(120),
  country: z
    .union([z.literal(""), z.string().regex(/^[A-Z]{2}$/, "Choose a country.")])
    .transform((value) => value || undefined)
    .optional(),
  location: optionalText(120),
});

export const createCustomerSchema = customerFieldsSchema.extend({
  customerId: z
    .string()
    .trim()
    .min(1, "Customer ID is required.")
    .max(255, "Customer ID must be 255 characters or fewer."),
});

export type CustomerFormValues = z.input<typeof createCustomerSchema>;
