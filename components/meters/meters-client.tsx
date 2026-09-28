"use client";

import { ArrowRightIcon, GaugeIcon, PlusIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MeterFormDialog } from "@/components/meters/meter-form-dialog";
import { useProjectWorkspace } from "@/components/projects/project-workspace-client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Meter } from "@/lib/meters/meters.types";
import { useMeters } from "@/lib/meters/useMeters";

export function MetersClient() {
  const router = useRouter();
  const { project, environment } = useProjectWorkspace();
  const inactive = environment.activatedAt === null;
  const meters = useMeters({ projectId: project.id, environment: environment.name }, !inactive);
  const [creating, setCreating] = useState(false);
  const rows = meters.data?.pages.flatMap((page) => page.meters) ?? [];
  const meterHref = (meterKey: string) =>
    `/dashboard/${project.slug}/meters/${encodeURIComponent(meterKey)}`;

  return (
    <div className="mx-auto max-w-[1160px] px-5 py-8 sm:px-8 sm:py-11">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-[family-name:var(--font-bricolage-grotesque)] text-[28px] font-semibold tracking-[-0.04em]">
          Meters
        </h1>
        {!inactive ? (
          <Button size="compact" onClick={() => setCreating(true)}>
            <PlusIcon />
            Create meter
          </Button>
        ) : null}
      </div>
      {inactive ? (
        <InactiveEnvironment projectSlug={project.slug} />
      ) : meters.isPending ? (
        <MeterListSkeleton />
      ) : meters.isError ? (
        <LoadError onRetry={() => meters.refetch()} />
      ) : rows.length === 0 ? (
        <EmptyMeters onCreate={() => setCreating(true)} />
      ) : (
        <section className="mt-7 overflow-hidden rounded-xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead className="border-b border-border bg-secondary/60 text-xs text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Meter</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium">Created</th>
                  <th className="w-12 px-4 py-3" aria-label="Open meter" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((meter) => (
                  <MeterRow key={meter.id} meter={meter} href={meterHref(meter.meterKey)} />
                ))}
              </tbody>
            </table>
          </div>
          {meters.hasNextPage ? (
            <div className="border-t border-border px-5 py-4 text-center">
              <Button
                variant="secondary"
                size="compact"
                onClick={() => meters.fetchNextPage()}
                disabled={meters.isFetchingNextPage}
              >
                {meters.isFetchingNextPage ? "Loading…" : "Load more"}
              </Button>
            </div>
          ) : null}
        </section>
      )}
      {creating ? (
        <MeterFormDialog
          onClose={() => setCreating(false)}
          onSaved={(meter) => {
            setCreating(false);
            router.push(meterHref(meter.meterKey));
          }}
        />
      ) : null}
    </div>
  );
}

function MeterRow({ meter, href }: { meter: Meter; href: string }) {
  return (
    <tr className="transition-colors hover:bg-secondary/45">
      <td className="px-5 py-4">
        <Link href={href} className="block font-medium text-foreground hover:text-primary">
          {meter.name}
        </Link>
        <code className="mt-1 block font-mono text-xs text-muted-foreground">
          {meter.meterKey}
        </code>
      </td>
      <td className="px-5 py-4">
        <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium capitalize">
          {meter.type}
        </span>
      </td>
      <td className="px-5 py-4 text-muted-foreground">{formatDate(meter.createdAt)}</td>
      <td className="px-4 py-4">
        <Button asChild variant="quiet" size="compact" className="size-8 p-0">
          <Link href={href} aria-label={`Open ${meter.name}`}>
            <ArrowRightIcon />
          </Link>
        </Button>
      </td>
    </tr>
  );
}

function EmptyMeters({ onCreate }: { onCreate: () => void }) {
  return (
    <section className="mt-7 grid min-h-72 place-items-center rounded-xl border border-dashed border-border bg-card px-5 py-10 text-center">
      <div className="max-w-md">
        <span className="mx-auto grid size-10 place-items-center rounded-lg bg-secondary text-muted-foreground">
          <GaugeIcon className="size-5" />
        </span>
        <h2 className="mt-4 text-sm font-semibold">No meters yet</h2>
        <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
          Create a meter to define what your application measures.
        </p>
        <Button className="mt-5" size="compact" onClick={onCreate}>
          <PlusIcon />
          Create meter
        </Button>
      </div>
    </section>
  );
}

function InactiveEnvironment({ projectSlug }: { projectSlug: string }) {
  return (
    <section className="mt-7 rounded-xl border border-border bg-card px-5 py-7 sm:px-6">
      <h2 className="text-sm font-semibold">Live is not active</h2>
      <p className="mt-1.5 max-w-xl text-xs leading-5 text-muted-foreground">
        Activate Live before creating or viewing production meters. Sandbox data remains
        separate.
      </p>
      <Button asChild className="mt-5" size="compact">
        <Link href={`/dashboard/${projectSlug}/project-settings`}>Open project settings</Link>
      </Button>
    </section>
  );
}

function LoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <section className="mt-7 rounded-xl border border-border bg-card px-5 py-8 text-center">
      <h2 className="text-sm font-semibold">Meters could not be loaded</h2>
      <Button className="mt-4" variant="secondary" size="compact" onClick={onRetry}>
        Try again
      </Button>
    </section>
  );
}

function MeterListSkeleton() {
  return (
    <section className="mt-7 space-y-px overflow-hidden rounded-xl border border-border bg-border">
      {["first", "second", "third", "fourth"].map((row) => (
        <div key={row} className="grid grid-cols-3 gap-5 bg-card px-5 py-5">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
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
