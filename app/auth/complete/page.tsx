import type { Metadata } from "next";
import { AuthCompleteClient } from "@/components/authentication/auth-complete-client";
import { AuthShell } from "@/components/authentication/auth-shell";

export const metadata: Metadata = {
  title: "Completing sign-in",
  robots: { index: false, follow: false },
};

export default function AuthCompletePage() {
  return (
    <AuthShell>
      <AuthCompleteClient />
    </AuthShell>
  );
}
