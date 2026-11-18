import type { Metadata } from "next";
import { ProjectPortfolioClient } from "@/components/projects/project-portfolio-client";

export const metadata: Metadata = {
  title: "Projects",
  robots: { index: false, follow: false },
};

export default function ProjectsPage() {
  return <ProjectPortfolioClient />;
}
