import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .min(1, "Enter your email address.")
  .email("Enter a valid email address.")
  .transform((email) => email.toLowerCase());

const passwordSchema = z
  .string()
  .min(8, "Use a password between 8 and 128 characters.")
  .max(128, "Use a password between 8 and 128 characters.")
  .regex(/[A-Z]/, "Add at least one uppercase letter.")
  .regex(/[0-9]/, "Add at least one number.")
  .regex(/[^\p{L}\p{N}\s]/u, "Add at least one special character.");

const passwordConfirmationSchema = z.string().min(1, "Confirm your password.");

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password."),
});

export const signUpSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmation: passwordConfirmationSchema,
  })
  .refine(({ password, confirmation }) => password === confirmation, {
    message: "The passwords do not match.",
    path: ["confirmation"],
  });

export const forgotPasswordSchema = z.object({ email: emailSchema });

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "This password-reset link is incomplete."),
    password: passwordSchema,
    confirmation: passwordConfirmationSchema,
  })
  .refine(({ password, confirmation }) => password === confirmation, {
    message: "The passwords do not match.",
    path: ["confirmation"],
  });

export const verificationSchema = z.object({
  email: emailSchema,
  code: z.string().regex(/^\d{6}$/, "Enter the six-digit verification code."),
});

export function validationMessage(result: { error: z.ZodError }): string {
  const messages = [...new Set(result.error.issues.map((issue) => issue.message))];
  if (messages.length === 0) return "Review the information and try again.";
  if (messages.length === 1) return messages[0];
  return messages.map((message) => `• ${message}`).join("\n");
}
