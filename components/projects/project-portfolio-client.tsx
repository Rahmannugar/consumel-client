"use client";

import { PlusIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ApplicationThemeProvider } from "@/components/application/application-theme";
import { CreateProjectDialog } from "@/components/application/project-shell";
import { AuthenticatedBoundary } from "@/components/authentication/authenticated-boundary";
import { EventDateRangePicker } from "@/components/events/event-date-range-picker";
import { ProjectPortfolioChart } from "@/components/projects/project-portfolio-chart";
import { ProjectRouteSkeleton } from "@/components/projects/project-route-skeleton";
import { ProjectsPortfolioShell } from "@/components/projects/projects-portfolio-shell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { AuthenticatedAccount } from "@/lib/authentication/authentication.types";
import type { EventsFilter } from "@/lib/events/events.types";
import {
  type ProjectEnvironmentName,
  saveProjectEnvironment,
} from "@/lib/projects/useProjectEnvironment";
import { useProjectPortfolio } from "@/lib/projects/useProjectPortfolio";
import { useProjects } from "@/lib/projects/useProjects";

export function ProjectPortfolioClient() {
  return (
    <ApplicationThemeProvider>
      <AuthenticatedBoundary loading={<ProjectRouteSkeleton />}>
        {(account) => <ResolvedPortfolio account={account} />}
      </AuthenticatedBoundary>
    </ApplicationThemeProvider>
  );
}

function ResolvedPortfolio({ account }: { account: AuthenticatedAccount }) {
  const router = useRouter();
  const projects = useProjects();

  useEffect(() => {
    if (projects.data?.projects.length === 0) router.replace("/onboarding");
  }, [projects.data, router]);

  if (projects.isPending) return <ProjectRouteSkeleton />;
  if (projects.isError) {
    return (
      <main className="grid min-h-svh place-items-center bg-background px-5 text-foreground">
        <div className="text-center">
          <h1 className="text-xl font-semibold">Projects could not be loaded</h1>
          <Button className="mt-5" onClick={() => projects.refetch()}>
            Try again
          </Button>
        </div>
      </main>
    );
  }
  if (projects.data.projects.length === 0) return <ProjectRouteSkeleton />;

  return (
    <ProjectsPortfolioShell account={account}>
      <PortfolioContent />
    </ProjectsPortfolioShell>
  );
}

function PortfolioContent() {
  const router = useRouter();
  const [environment, setEnvironment] = useState<ProjectEnvironmentName>("sandbox");
  const [filter, setFilter] = useState<EventsFilter>({ status: "", period: "30d" });
  const [createOpen, setCreateOpen] = useState(false);
  const portfolio = useProjectPortfolio(environment, filter);

  return (
    <main className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-bricolage-grotesque)] text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
            Projects
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Compare request outcomes across your projects without mixing Sandbox and Live.
          </p>
        </div>
        <Button className="w-full sm:w-auto" onClick={() => setCreateOpen(true)}>
          <PlusIcon />
          Create project
        </Button>
      </div>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <EnvironmentControl value={environment} onChange={setEnvironment} />
        <div className="w-full sm:w-auto">
          <EventDateRangePicker filter={filter} onChange={setFilter} />
        </div>
      </div>

      <div className="mt-5">
        {portfolio.isPending ? (
          <PortfolioSkeleton />
        ) : portfolio.isError ? (
          <section className="rounded-xl border border-border bg-card px-5 py-12 text-center sm:px-6">
            <h2 className="text-sm font-semibold">Project activity could not be loaded</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Your project list is safe. Try loading its activity again.
            </p>
            <Button
              size="compact"
              variant="secondary"
              className="mt-4"
              onClick={() => portfolio.refetch()}
            >
              Try again
            </Button>
          </section>
        ) : portfolio.data ? (
          <div className="space-y-7">
            <ProjectPortfolioChart portfolio={portfolio.data} />
            <section className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="border-b border-border px-5 py-4 sm:px-6">
                <h2 className="text-sm font-semibold">Project comparison</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Open a project to inspect its environment-specific activity and resources.
                </p>
              </div>
              <div className="hidden grid-cols-[minmax(12rem,1.5fr)_repeat(3,minmax(7rem,0.75fr))_minmax(9rem,1fr)] gap-4 border-b border-border bg-secondary/45 px-6 py-3 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase md:grid">
                <span>Project</span>
                <span>Allowed</span>
                <span>Blocked</span>
                <span>Block rate</span>
                <span>Last activity</span>
              </div>
              <div className="divide-y divide-border">
                {portfolio.data.projects.map((project) => {
                  const active = project.activatedAt !== null;
                  const total = project.allowedOperations + project.blockedOperations;
                  return (
                    <Link
                      key={project.id}
                      href={`/dashboard/${project.slug}`}
                      onClick={() => saveProjectEnvironment(project.id, environment)}
                      className="grid cursor-pointer gap-4 px-5 py-4 transition-colors hover:bg-secondary/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:px-6 md:grid-cols-[minmax(12rem,1.5fr)_repeat(3,minmax(7rem,0.75fr))_minmax(9rem,1fr)] md:items-center"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{project.name}</p>
                        <p className="mt-1 text-xs capitalize text-muted-foreground">
                          {environment}
                          {!active ? " · Not active" : ""}
                        </p>
                      </div>
                      {active ? (
                        <>
                          <ProjectMetric label="Allowed" value={project.allowedOperations} />
                          <ProjectMetric label="Blocked" value={project.blockedOperations} />
                          <ProjectMetric
                            label="Block rate"
                            value={formatBlockRate(project.blockedOperations, total)}
                          />
                          <ProjectMetric
                            label="Last activity"
                            value={formatActivityTime(project.lastActivityAt)}
                          />
                        </>
                      ) : (
                        <p className="text-xs text-muted-foreground md:col-span-4">
                          Open this project to activate Live when you are ready.
                        </p>
                      )}
                    </Link>
                  );
                })}
              </div>
            </section>
          </div>
        ) : null}
      </div>

      <CreateProjectDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(slug) => router.push(`/dashboard/${slug}`)}
      />
    </main>
  );
}

function EnvironmentControl({
  value,
  onChange,
}: {
  value: ProjectEnvironmentName;
  onChange: (environment: ProjectEnvironmentName) => void;
}) {
  return (
    <fieldset className="grid h-11 w-full grid-cols-2 rounded-lg border border-border bg-secondary/55 p-1 sm:w-64">
      <legend className="sr-only">Portfolio environment</legend>
      {(["sandbox", "live"] as const).map((environment) => (
        <button
          key={environment}
          type="button"
          className="cursor-pointer rounded-md px-4 text-sm font-medium capitalize outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-[selected=true]:bg-card data-[selected=true]:text-foreground data-[selected=true]:shadow-xs"
          data-selected={value === environment}
          aria-pressed={value === environment}
          onClick={() => onChange(environment)}
        >
          {environment}
        </button>
      ))}
    </fieldset>
  );
}

function ProjectMetric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 md:block">
      <span className="text-xs text-muted-foreground md:hidden">{label}</span>
      <span className="text-sm font-medium tabular-nums">
        {typeof value === "number" ? value.toLocaleString() : value}
      </span>
    </div>
  );
}

function PortfolioSkeleton() {
  return (
    <div className="space-y-7" aria-busy="true">
      <div className="space-y-5 rounded-xl border border-border bg-card p-5 sm:p-6">
        <Skeleton className="h-5 w-44" />
        <div className="grid gap-3 sm:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <Skeleton key={item} className="h-16 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-lg" />
      </div>
      <Skeleton className="h-56 rounded-xl" />
    </div>
  );
}

function formatBlockRate(blocked: number, total: number) {
  if (total === 0) return "0%";
  return new Intl.NumberFormat(undefined, {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(blocked / total);
}

function formatActivityTime(value: string | null) {
  if (!value) return "No activity";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
