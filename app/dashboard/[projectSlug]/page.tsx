import type { Metadata } from "next";
import { ProjectOverviewClient } from "@/components/projects/project-overview-client";

export const metadata: Metadata = {
  title: "Project overview",
  robots: { index: false, follow: false },
};

export default function ProjectOverviewPage() {
  return <ProjectOverviewClient />;
}
