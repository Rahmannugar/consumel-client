import type { Metadata } from "next";
import { AuthShell } from "@/components/authentication/auth-shell";
import { ForgotPasswordClient } from "@/components/authentication/forgot-password-client";

export const metadata: Metadata = {
  title: "Reset password",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell>
      <ForgotPasswordClient />
    </AuthShell>
  );
}
