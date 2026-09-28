import type { ReactNode } from "react";
import { ProjectWorkspaceClient } from "@/components/projects/project-workspace-client";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ projectSlug: string }>;
}) {
  const { projectSlug } = await params;
  return <ProjectWorkspaceClient projectSlug={projectSlug}>{children}</ProjectWorkspaceClient>;
}
