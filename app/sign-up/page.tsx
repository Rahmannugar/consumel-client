import type { Metadata } from "next";
import { AuthShell } from "@/components/authentication/auth-shell";
import { SignUpClient } from "@/components/authentication/sign-up-client";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create your Consumel account.",
  robots: { index: false, follow: false },
};

export default function SignUpPage() {
  return (
    <AuthShell>
      <SignUpClient />
    </AuthShell>
  );
}
