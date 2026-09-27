import type { Metadata } from "next";
import { ProjectsIndexClient } from "@/components/projects/projects-index-client";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  return <ProjectsIndexClient />;
}
