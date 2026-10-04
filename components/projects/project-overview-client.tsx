"use client";

import { ArrowRightIcon, KeyIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";
import { UsageAnalyticsPanel } from "@/components/analytics/usage-analytics-panel";
import { ProjectRecentActivity } from "@/components/projects/project-recent-activity";
import { useProjectWorkspace } from "@/components/projects/project-workspace-client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { EventsFilter } from "@/lib/events/events.types";
import { useProjectAPIKey } from "@/lib/projects/useProjectAPIKey";

export function ProjectOverviewClient() {
  const { project, environment } = useProjectWorkspace();
  const keyStatus = useProjectAPIKey(project.id, environment.name);
  const inactive = environment.activatedAt === null;
  const hasKey = keyStatus.data?.apiKey !== null && keyStatus.data?.apiKey !== undefined;
  const activeKey = keyStatus.data?.apiKey ?? null;
  const setupComplete = !inactive && activeKey !== null;
  const totalSteps = environment.name === "live" ? 3 : 2;
  const completedSteps =
    environment.name === "live"
      ? 1 + (inactive ? 0 : 1) + (hasKey ? 1 : 0)
      : 1 + (hasKey ? 1 : 0);
  const progress = `${(completedSteps / totalSteps) * 100}%`;
  const settingsHref = `/dashboard/${project.slug}/project-settings`;
  const [analyticsFilter, setAnalyticsFilter] = useState<EventsFilter>({
    status: "",
    period: "30d",
  });

  return (
    <div className="mx-auto max-w-[1160px] px-5 py-8 sm:px-8 sm:py-11">
      <h1 className="font-[family-name:var(--font-bricolage-grotesque)] text-[28px] font-semibold tracking-[-0.04em]">
        Overview
      </h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Usage and operational activity for this environment.
      </p>

      {keyStatus.isPending && !inactive ? (
        <SetupPanelSkeleton />
      ) : keyStatus.isError && !inactive ? (
        <APIAccessError onRetry={() => keyStatus.refetch()} />
      ) : setupComplete ? (
        <APIAccessSummary apiKey={activeKey} settingsHref={settingsHref} />
      ) : (
        <section className="mt-7 overflow-hidden rounded-xl border border-border bg-card">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="px-5 py-6 sm:px-7 sm:py-7">
              <p className="text-sm font-semibold">Finish project setup</p>
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                {inactive
                  ? "Activate Live and create its API key before sending production usage."
                  : `Create an API key before sending ${environment.name === "sandbox" ? "test" : "production"} usage.`}
              </p>
              <div className="mt-6 flex items-end justify-between gap-4">
                <span className="text-xs font-medium text-foreground">Setup progress</span>
                <span className="text-xs text-muted-foreground">
                  {completedSteps} of {totalSteps} required steps complete
                </span>
              </div>
              <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary transition-[width]"
                  style={{ width: progress }}
                />
              </div>
            </div>

            <div className="border-t border-border px-5 py-6 sm:px-7 lg:border-t-0 lg:border-l">
              <p className="text-xs font-medium text-muted-foreground">Up next</p>
              <p className="mt-2 text-sm font-semibold">
                {inactive
                  ? "Activate Live"
                  : `Create a ${environment.name === "sandbox" ? "Sandbox" : "Live"} API key`}
              </p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {inactive
                  ? "Live stays isolated until you activate it."
                  : `Generate a key for authenticated ${environment.name === "sandbox" ? "Sandbox" : "Live"} requests.`}
              </p>
              <Button asChild className="mt-5" size="compact" variant="primary">
                <Link href={settingsHref}>
                  Continue setup
                  <ArrowRightIcon />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {!inactive ? (
        <>
          <UsageAnalyticsPanel
            title="Usage"
            description="Processed and blocked quantity across this environment."
            filter={analyticsFilter}
            onFilterChange={setAnalyticsFilter}
            showBillable={environment.name === "live"}
          />
          <ProjectRecentActivity />
        </>
      ) : null}
    </div>
  );
}

function APIAccessError({ onRetry }: { onRetry: () => void }) {
  return (
    <section className="mt-7 rounded-xl border border-border bg-card px-5 py-7 text-center sm:px-6">
      <h2 className="text-sm font-semibold">API access could not be loaded</h2>
      <p className="mt-1.5 text-xs text-muted-foreground">
        Consumel could not confirm this environment&apos;s API key status.
      </p>
      <Button className="mt-4" size="compact" variant="secondary" onClick={onRetry}>
        Try again
      </Button>
    </section>
  );
}

function APIAccessSummary({
  apiKey,
  settingsHref,
}: {
  apiKey: NonNullable<ReturnType<typeof useProjectAPIKey>["data"]>["apiKey"];
  settingsHref: string;
}) {
  if (!apiKey) return null;

  return (
    <section className="mt-7 rounded-xl border border-border bg-card px-5 py-5 sm:px-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-3.5">
          <KeyIcon className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-sm font-semibold">API access</h2>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                <span className="size-1.5 rounded-full bg-current" />
                Active
              </span>
            </div>
            <code className="mt-2 block truncate font-mono text-xs text-muted-foreground">
              {apiKey.prefix}••••{apiKey.lastFour}
            </code>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
          <dl className="grid grid-cols-2 gap-x-8 text-xs">
            <div>
              <dt className="text-muted-foreground">Created</dt>
              <dd className="mt-1 font-medium">{formatDate(apiKey.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Last used</dt>
              <dd className="mt-1 font-medium">
                {apiKey.lastUsedAt ? formatDate(apiKey.lastUsedAt) : "Never"}
              </dd>
            </div>
          </dl>
          <Button asChild size="compact" variant="secondary">
            <Link href={settingsHref}>
              Manage API key
              <ArrowRightIcon />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function SetupPanelSkeleton() {
  return (
    <section className="mt-7 grid overflow-hidden rounded-xl border border-border bg-card lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-4 px-5 py-7 sm:px-7">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-full max-w-lg" />
        <Skeleton className="h-1.5 w-full" />
      </div>
      <div className="space-y-3 border-t border-border px-5 py-7 sm:px-7 lg:border-t-0 lg:border-l">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-5 w-44" />
        <Skeleton className="h-9 w-32" />
      </div>
    </section>
  );
}
