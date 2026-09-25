import type { Metadata } from "next";
import { AuthShell } from "@/components/authentication/auth-shell";
import { SignInClient } from "@/components/authentication/sign-in-client";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Consumel account.",
  robots: { index: false, follow: false },
};

export default function SignInPage() {
  return (
    <AuthShell>
      <SignInClient />
    </AuthShell>
  );
}
