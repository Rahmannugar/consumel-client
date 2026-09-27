import type { Metadata } from "next";
import { OnboardingClient } from "@/components/onboarding/onboarding-client";

export const metadata: Metadata = {
  title: "Create your first project",
  robots: { index: false, follow: false },
};

export default function OnboardingPage() {
  return <OnboardingClient />;
}
