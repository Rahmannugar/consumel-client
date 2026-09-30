import { z } from "zod";

const maximumSafeQuantity = BigInt(Number.MAX_SAFE_INTEGER);

function quantitySchema(minimum: bigint, requiredMessage: string) {
  return z
    .string()
    .trim()
    .min(1, requiredMessage)
    .regex(/^\d+$/, "Enter a whole number.")
    .refine((value) => /^\d+$/.test(value) && BigInt(value) >= minimum, {
      message:
        minimum === BigInt(0) ? "Quantity cannot be negative." : "Quantity must be at least 1.",
    })
    .refine((value) => /^\d+$/.test(value) && BigInt(value) <= maximumSafeQuantity, {
      message: "Quantity is too large to manage safely in the dashboard.",
    })
    .transform(Number);
}

export const addBalanceSchema = z.object({
  meterKey: z.string().min(1, "Meter is required."),
  quantity: quantitySchema(BigInt(1), "Quantity is required."),
});

export const setBalanceSchema = z.object({
  meterKey: z.string().min(1, "Meter is required."),
  quantity: quantitySchema(BigInt(0), "Quantity is required."),
});
