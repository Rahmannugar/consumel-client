import { z } from "zod";

const name = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .max(120, `${label} must be 120 characters or fewer.`);

export const onboardingSchema = z.object({
  organizationName: name("Organization name"),
  projectName: name("Project name"),
});

export type OnboardingField = keyof z.infer<typeof onboardingSchema>;
