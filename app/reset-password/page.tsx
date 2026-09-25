import type { Metadata } from "next";
import { AuthShell } from "@/components/authentication/auth-shell";
import { ResetPasswordClient } from "@/components/authentication/reset-password-client";

export const metadata: Metadata = {
  title: "Choose a new password",
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token = "" } = await searchParams;
  return (
    <AuthShell>
      <ResetPasswordClient token={token} />
    </AuthShell>
  );
}
