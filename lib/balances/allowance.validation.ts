import { z } from "zod";

const quantity = (minimum: number) =>
  z
    .string()
    .trim()
    .regex(/^\d+$/, "Enter a whole number.")
    .refine(
      (value) =>
        /^\d+$/.test(value) &&
        BigInt(value) >= BigInt(minimum) &&
        BigInt(value) <= BigInt(Number.MAX_SAFE_INTEGER),
      "Enter a quantity within the supported range.",
    )
    .transform(Number);
export const allowanceFormSchema = z
  .object({
    quantity: quantity(1),
    intervalUnit: z.enum(["minute", "hour", "day", "week", "month", "year"]),
    intervalCount: quantity(1).refine(
      (value) => value <= 1000000,
      "Use an interval from 1 to 1,000,000.",
    ),
    rolloverCap: quantity(0),
    startsAt: z
      .string()
      .datetime()
      .refine((value) => {
        const date = new Date(value);
        return (
          date.getUTCFullYear() >= 2000 &&
          date.getUTCFullYear() <= 9998 &&
          date.getUTCSeconds() === 0 &&
          date.getUTCMilliseconds() === 0
        );
      }, "Choose a valid UTC start date and time."),
    enabled: z.boolean(),
  })
  .refine((value) => Number.isSafeInteger(value.quantity + value.rolloverCap), {
    message: "The allowance plus rollover cap is too large to manage in the dashboard.",
    path: ["rolloverCap"],
  });
