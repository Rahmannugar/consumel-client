"use client";

import { ArrowLeftIcon, CheckCircleIcon, CircleIcon, KeyIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ApplicationThemeProvider } from "@/components/application/application-theme";
import { ProjectShell } from "@/components/application/project-shell";
import { AuthenticatedBoundary } from "@/components/authentication/authenticated-boundary";
import { ProjectRouteSkeleton } from "@/components/projects/project-route-skeleton";
import { Button } from "@/components/ui/button";
import type { AuthenticatedAccount } from "@/lib/authentication/authentication.types";
import type { Project, ProjectEnvironment } from "@/lib/projects/projects.types";
import { useProjectEnvironment } from "@/lib/projects/useProjectEnvironment";
import { useProjects } from "@/lib/projects/useProjects";

export function ProjectOverviewClient({ projectSlug }: { projectSlug: string }) {
  return (
    <ApplicationThemeProvider>
      <AuthenticatedBoundary loading={<ProjectRouteSkeleton />}>
        {(account) => <ProjectOverview account={account} projectSlug={projectSlug} />}
      </AuthenticatedBoundary>
    </ApplicationThemeProvider>
  );
}

function ProjectOverview({
  account,
  projectSlug,
}: {
  account: AuthenticatedAccount;
  projectSlug: string;
}) {
  const router = useRouter();
  const projects = useProjects();

  if (projects.isPending) return <ProjectRouteSkeleton />;
  if (projects.isError) return <ProjectLoadError onRetry={() => projects.refetch()} />;

  const project = projects.data.projects.find((candidate) => candidate.slug === projectSlug);
  if (!project) return <ProjectUnavailable />;

  return (
    <ResolvedProjectOverview
      account={account}
      project={project}
      projects={projects.data.projects}
      onProjectChange={(slug) => router.push(`/dashboard/${slug}`)}
    />
  );
}

function ResolvedProjectOverview({
  account,
  project,
  projects,
  onProjectChange,
}: {
  account: AuthenticatedAccount;
  project: Project;
  projects: Project[];
  onProjectChange: (slug: string) => void;
}) {
  const { environment: environmentName, selectEnvironment } = useProjectEnvironment(project.id);

  const environment = project.environments.find(
    (candidate) => candidate.name === environmentName,
  );
  if (!environment) return <ProjectRouteSkeleton />;

  return (
    <ProjectShell
      account={account}
      project={project}
      projects={projects}
      onProjectChange={onProjectChange}
      environment={environmentName}
      onEnvironmentChange={selectEnvironment}
    >
      <div className="mx-auto max-w-[1160px] px-5 py-8 sm:px-8 sm:py-11">
        <header>
          <p className="text-[11px] font-semibold tracking-[0.12em] text-primary uppercase">
            {environment.name}
          </p>
          <h1 className="mt-1 font-[family-name:var(--font-bricolage-grotesque)] text-[28px] font-semibold tracking-[-0.04em]">
            Overview
          </h1>
        </header>

        <section className="mt-7 overflow-hidden rounded-[10px] border border-border bg-card">
          <div className="flex items-center gap-3 border-b border-border px-5 py-4">
            <span className="h-4 w-1 rounded-full bg-primary" aria-hidden="true" />
            <h2 className="text-sm font-semibold capitalize">{environment.name}</h2>
          </div>
          <dl className="divide-y divide-border">
            <EnvironmentDetail environment={environment} />
            <div className="flex items-center gap-4 px-5 py-4">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-secondary text-muted-foreground">
                <KeyIcon className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <dt className="text-sm font-medium">API access</dt>
                <dd className="mt-0.5 text-xs text-muted-foreground">
                  Create a key when you are ready to connect this environment.
                </dd>
              </div>
              <span className="shrink-0 text-xs font-medium text-muted-foreground">
                Not configured
              </span>
            </div>
          </dl>
        </section>

        <section className="mt-5 overflow-hidden rounded-[10px] border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold">Recent activity</h2>
          </div>
          <div className="grid min-h-44 place-items-center px-5 py-10 text-center">
            <div>
              <p className="text-sm font-medium">No activity yet</p>
              <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                Activity from this environment will appear here.
              </p>
            </div>
          </div>
        </section>
      </div>
    </ProjectShell>
  );
}

function EnvironmentDetail({ environment }: { environment: ProjectEnvironment }) {
  const active = environment.activatedAt !== null;

  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <span
        className={`grid size-8 shrink-0 place-items-center rounded-lg ${
          active
            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/45 dark:text-emerald-300"
            : "bg-secondary text-muted-foreground"
        }`}
      >
        {active ? (
          <CheckCircleIcon className="size-4" weight="fill" />
        ) : (
          <CircleIcon className="size-4" weight="fill" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <dt className="text-sm font-medium">Environment status</dt>
        <dd className="mt-0.5 text-xs text-muted-foreground">
          {active
            ? environment.name === "sandbox"
              ? "Test configuration and usage stay separate from Live."
              : "Production configuration and usage stay separate from Sandbox."
            : "Live has not been activated."}
        </dd>
      </div>
      <span className="shrink-0 text-xs font-medium text-muted-foreground">
        {active ? "Available" : "Not activated"}
      </span>
    </div>
  );
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
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#087cec]">
          Project unavailable
        </p>
        <h1 className="mt-3 text-2xl font-semibold">You don’t have access to this project.</h1>
        <Button asChild className="mt-6">
          <Link href="/dashboard">
            <ArrowLeftIcon />
            View my projects
          </Link>
        </Button>
      </div>
    </main>
  );
}
