import { z } from "zod";
import { allowanceFormSchema } from "@/lib/balances/allowance.validation";

export const allowancePlanFormSchema = z
  .object({
    quantity: allowanceFormSchema.shape.quantity,
    rolloverCap: allowanceFormSchema.shape.rolloverCap,
    intervalUnit: allowanceFormSchema.shape.intervalUnit,
    intervalCount: allowanceFormSchema.shape.intervalCount,
    enabled: allowanceFormSchema.shape.enabled,
    key: z
      .string()
      .trim()
      .regex(
        /^[a-z][a-z0-9_-]{0,63}$/,
        "Use a lowercase letter followed by up to 63 lowercase letters, numbers, underscores, or hyphens.",
      ),
    name: z.string().trim().min(1, "Enter a name.").max(100, "Use 100 characters or fewer."),
    meterKey: z.string().min(1, "Select a meter."),
  })
  .refine((value) => Number.isSafeInteger(value.quantity + value.rolloverCap), {
    message: "The allowance plus rollover cap is too large to manage in the dashboard.",
    path: ["rolloverCap"],
  });
