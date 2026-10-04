"use client";

import { ArrowLeftIcon, PencilSimpleIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";
import { UsageActivity } from "@/components/analytics/usage-activity";
import { MeterFormDialog } from "@/components/meters/meter-form-dialog";
import { useProjectWorkspace } from "@/components/projects/project-workspace-client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMeter } from "@/lib/meters/useMeter";

export function MeterDetailClient({ meterKey }: { meterKey: string }) {
  const [editing, setEditing] = useState(false);
  const { project, environment } = useProjectWorkspace();
  const inactive = environment.activatedAt === null;
  const meter = useMeter(
    { projectId: project.id, environment: environment.name },
    meterKey,
    !inactive,
  );
  const listHref = `/dashboard/${project.slug}/meters`;

  if (inactive)
    return (
      <DetailMessage
        title="Live is not active"
        href={`/dashboard/${project.slug}/project-settings`}
        action="Open project settings"
      />
    );
  if (meter.isPending) return <DetailSkeleton />;
  if (meter.isError)
    return (
      <DetailMessage
        title="Meter could not be loaded"
        href={listHref}
        action="Back to meters"
      />
    );

  return (
    <div className="mx-auto max-w-[1040px] px-5 py-8 sm:px-8 sm:py-11">
      <Button asChild variant="quiet" size="compact" className="-ml-2 mb-6">
        <Link href={listHref}>
          <ArrowLeftIcon />
          Meters
        </Link>
      </Button>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-bricolage-grotesque)] text-[28px] font-semibold tracking-[-0.04em]">
            {meter.data.name}
          </h1>
          <code className="mt-1 block font-mono text-xs text-muted-foreground">
            {meter.data.meterKey}
          </code>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-fit rounded-full bg-secondary px-3 py-1.5 text-xs font-medium capitalize">
            {meter.data.type}
          </span>
          <Button variant="secondary" size="compact" onClick={() => setEditing(true)}>
            <PencilSimpleIcon />
            Edit meter
          </Button>
        </div>
      </div>
      <section className="mt-7 rounded-xl border border-border bg-card">
        <dl className="divide-y divide-border">
          <Detail label="Description" value={meter.data.description ?? "—"} />
          <Detail label="Meter ID" value={meter.data.id} code />
          <Detail label="Created" value={formatDateTime(meter.data.createdAt)} />
          <Detail label="Updated" value={formatDateTime(meter.data.updatedAt)} />
        </dl>
      </section>
      <UsageActivity meterKey={meter.data.meterKey} />
      {editing ? (
        <MeterFormDialog
          meter={meter.data}
          onClose={() => setEditing(false)}
          onSaved={() => setEditing(false)}
        />
      ) : null}
    </div>
  );
}

function Detail({
  label,
  value,
  code = false,
}: {
  label: string;
  value: string;
  code?: boolean;
}) {
  return (
    <div className="grid gap-1 px-5 py-4 sm:grid-cols-[160px_1fr] sm:gap-6">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className={code ? "break-all font-mono text-xs" : "text-sm"}>{value}</dd>
    </div>
  );
}

function DetailMessage({
  title,
  href,
  action,
}: {
  title: string;
  href: string;
  action: string;
}) {
  return (
    <div className="mx-auto max-w-[900px] px-5 py-11 sm:px-8">
      <section className="rounded-xl border border-border bg-card px-5 py-8 text-center">
        <h1 className="text-lg font-semibold">{title}</h1>
        <Button asChild className="mt-5" size="compact">
          <Link href={href}>{action}</Link>
        </Button>
      </section>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-[900px] space-y-5 px-5 py-11 sm:px-8">
      <Skeleton className="h-8 w-52" />
      <Skeleton className="h-52 w-full rounded-xl" />
    </div>
  );
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(value),
  );
}
