import type { Metadata } from "next";
import { ProjectSettingsClient } from "@/components/projects/project-settings-client";

export const metadata: Metadata = {
  title: "Project settings",
  robots: { index: false, follow: false },
};

export default function ProjectSettingsPage() {
  return <ProjectSettingsClient />;
}
