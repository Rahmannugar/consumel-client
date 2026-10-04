import { z } from "zod";

export const createMeterSchema = z.object({
  meterKey: z
    .string()
    .trim()
    .min(1, "Meter key is required.")
    .max(120, "Meter key must be 120 characters or fewer.")
    .regex(/^[a-z][a-z0-9_-]*$/, "Use lowercase letters, numbers, underscores, or hyphens."),
  name: z
    .string()
    .trim()
    .min(1, "Name is required.")
    .max(120, "Name must be 120 characters or fewer."),
  description: z
    .string()
    .trim()
    .max(500, "Description must be 500 characters or fewer.")
    .transform((value) => value || undefined),
  type: z.enum(["prepaid", "postpaid", "hybrid"], { error: "Type is required." }),
});

export const updateMeterSchema = createMeterSchema.pick({
  name: true,
  description: true,
});

export type MeterFormValues = z.input<typeof createMeterSchema>;
