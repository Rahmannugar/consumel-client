"use client";

import { ArrowLeftIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, type ReactNode, useContext } from "react";
import { ApplicationThemeProvider } from "@/components/application/application-theme";
import { ProjectShell } from "@/components/application/project-shell";
import { AuthenticatedBoundary } from "@/components/authentication/authenticated-boundary";
import { ProjectRouteSkeleton } from "@/components/projects/project-route-skeleton";
import { Button } from "@/components/ui/button";
import type { AuthenticatedAccount } from "@/lib/authentication/authentication.types";
import type { Project, ProjectEnvironment } from "@/lib/projects/projects.types";
import { useProjectEnvironment } from "@/lib/projects/useProjectEnvironment";
import { useProjects } from "@/lib/projects/useProjects";

type ProjectWorkspace = {
  account: AuthenticatedAccount;
  project: Project;
  environment: ProjectEnvironment;
};

const ProjectWorkspaceContext = createContext<ProjectWorkspace | null>(null);

export function ProjectWorkspaceClient({
  projectSlug,
  children,
}: {
  projectSlug: string;
  children: ReactNode;
}) {
  return (
    <ApplicationThemeProvider>
      <AuthenticatedBoundary loading={<ProjectRouteSkeleton />}>
        {(account) => (
          <ResolvedProjectWorkspace account={account} projectSlug={projectSlug}>
            {children}
          </ResolvedProjectWorkspace>
        )}
      </AuthenticatedBoundary>
    </ApplicationThemeProvider>
  );
}

function ResolvedProjectWorkspace({
  account,
  projectSlug,
  children,
}: {
  account: AuthenticatedAccount;
  projectSlug: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const projects = useProjects();

  if (projects.isPending) return <ProjectRouteSkeleton />;
  if (projects.isError) return <ProjectLoadError onRetry={() => projects.refetch()} />;

  const project = projects.data.projects.find((candidate) => candidate.slug === projectSlug);
  if (!project) return <ProjectUnavailable />;

  return (
    <WorkspaceShell
      account={account}
      project={project}
      projects={projects.data.projects}
      pathname={pathname}
      onProjectChange={(slug, section) =>
        router.push(
          `/dashboard/${slug}${
            section === "overview"
              ? ""
              : section === "customers"
                ? "/customers"
                : "/project-settings"
          }`,
        )
      }
    >
      {children}
    </WorkspaceShell>
  );
}

function WorkspaceShell({
  account,
  project,
  projects,
  pathname,
  onProjectChange,
  children,
}: {
  account: AuthenticatedAccount;
  project: Project;
  projects: Project[];
  pathname: string;
  onProjectChange: (
    slug: string,
    section: "overview" | "customers" | "project-settings",
  ) => void;
  children: ReactNode;
}) {
  const { environment: environmentName, selectEnvironment } = useProjectEnvironment(project.id);
  const environment = project.environments.find(
    (candidate) => candidate.name === environmentName,
  );
  if (!environment) return <ProjectRouteSkeleton />;

  const activeSection = pathname.includes("/customers")
    ? "customers"
    : pathname.endsWith("/project-settings")
      ? "project-settings"
      : "overview";

  return (
    <ProjectWorkspaceContext.Provider value={{ account, project, environment }}>
      <ProjectShell
        account={account}
        project={project}
        projects={projects}
        onProjectChange={(slug) => onProjectChange(slug, activeSection)}
        onProjectCreated={(slug) => onProjectChange(slug, "overview")}
        environment={environmentName}
        onEnvironmentChange={selectEnvironment}
        activeSection={activeSection}
      >
        {children}
      </ProjectShell>
    </ProjectWorkspaceContext.Provider>
  );
}

export function useProjectWorkspace() {
  const workspace = useContext(ProjectWorkspaceContext);
  if (!workspace) {
    throw new Error("useProjectWorkspace must be used inside ProjectWorkspaceClient");
  }
  return workspace;
}

function ProjectLoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <main className="grid min-h-svh place-items-center bg-background px-5 text-foreground">
      <div className="text-center">
        <h1 className="text-xl font-semibold">Project could not be loaded</h1>
        <Button className="mt-5" onClick={onRetry}>
          Try again
        </Button>
      </div>
    </main>
  );
}

function ProjectUnavailable() {
  return (
    <main className="grid min-h-svh place-items-center bg-background px-5 text-foreground">
      <div className="text-center">
        <h1 className="text-xl font-semibold">This project is unavailable.</h1>
        <Button asChild className="mt-5">
          <Link href="/dashboard">
            <ArrowLeftIcon />
            View my projects
          </Link>
        </Button>
      </div>
    </main>
  );
}
