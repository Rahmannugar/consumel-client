"use client";

import { ArrowLeftIcon, SlidersHorizontalIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";
import { BalanceFormDialog } from "@/components/balances/balance-form-dialog";
import { useProjectWorkspace } from "@/components/projects/project-workspace-client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { BalanceActivity, EntitlementGrant } from "@/lib/balances/balances.types";
import {
  useBalanceActivity,
  useBalanceDetail,
  useEntitlementGrants,
} from "@/lib/balances/useBalanceDetail";

export function BalanceDetailClient({
  customerId,
  meterKey,
}: {
  customerId: string;
  meterKey: string;
}) {
  const { project, environment } = useProjectWorkspace();
  const context = { projectId: project.id, environment: environment.name } as const;
  const enabled = environment.activatedAt !== null;
  const balance = useBalanceDetail(context, customerId, meterKey, enabled);
  const grants = useEntitlementGrants(context, customerId, meterKey, enabled);
  const history = useBalanceActivity(context, customerId, meterKey, enabled);
  const [adjusting, setAdjusting] = useState(false);
  const customerHref = `/dashboard/${project.slug}/customers/${encodeURIComponent(customerId)}`;

  if (!enabled)
    return <Message title="Activate Live to view production balances." href={customerHref} />;
  if (balance.isPending) return <DetailSkeleton />;
  if (balance.isError)
    return (
      <Message
        title="Balance details could not be loaded."
        href={customerHref}
        onRetry={() => balance.refetch()}
      />
    );

  return (
    <div className="mx-auto max-w-[1040px] px-5 py-8 sm:px-8 sm:py-11">
      <Button asChild variant="quiet" size="compact" className="-ml-2">
        <Link href={customerHref}>
          <ArrowLeftIcon />
          Customer
        </Link>
      </Button>
      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-bricolage-grotesque)] text-[28px] font-semibold tracking-[-0.04em]">
            Balance details
          </h1>
          <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <code className="font-mono">{customerId}</code>
            <code className="font-mono">{meterKey}</code>
          </div>
        </div>
        <Button size="compact" onClick={() => setAdjusting(true)}>
          <SlidersHorizontalIcon />
          Adjust balance
        </Button>
      </div>

      <section className="mt-7 rounded-xl border border-border bg-card px-5 py-5 sm:px-6">
        <p className="text-xs text-muted-foreground">Available quantity</p>
        <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">
          {formatQuantity(balance.data.quantity)}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Total currently available across active grant lots.
        </p>
      </section>

      <BalanceActivitySection history={history} />
      <BalanceCompositionSection grants={grants} />

      {adjusting ? (
        <BalanceFormDialog
          customerId={customerId}
          meterKey={meterKey}
          quantity={balance.data.quantity}
          onClose={() => setAdjusting(false)}
        />
      ) : null}
    </div>
  );
}

function BalanceActivitySection({
  history,
}: {
  history: ReturnType<typeof useBalanceActivity>;
}) {
  const activity = history.data?.pages.flatMap((page) => page.activity) ?? [];
  return (
    <section className="mt-7 overflow-hidden rounded-xl border border-border bg-card">
      <div className="border-b border-border px-5 py-4 sm:px-6">
        <h2 className="text-sm font-semibold">Balance activity</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Adjustments, usage debits, and expirations in newest-first order.
        </p>
      </div>
      {history.isPending ? (
        <SectionSkeleton />
      ) : history.isError ? (
        <SectionLoadError label="Balance activity" onRetry={() => history.refetch()} />
      ) : activity.length === 0 ? (
        <p className="px-5 py-9 text-center text-sm text-muted-foreground sm:px-6">
          No balance activity yet.
        </p>
      ) : (
        <div className="divide-y divide-border">
          {activity.map((item) => (
            <ActivityRow key={`${item.kind}-${item.id}`} item={item} />
          ))}
        </div>
      )}
      {history.hasNextPage ? (
        <LoadMore pending={history.isFetchingNextPage} onLoad={() => history.fetchNextPage()} />
      ) : null}
    </section>
  );
}

function BalanceCompositionSection({
  grants,
}: {
  grants: ReturnType<typeof useEntitlementGrants>;
}) {
  const lots = grants.data?.pages.flatMap((page) => page.grants) ?? [];
  return (
    <section className="mt-7 overflow-hidden rounded-xl border border-border bg-card">
      <div className="border-b border-border px-5 py-4 sm:px-6">
        <h2 className="text-sm font-semibold">Balance composition</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Individual quantities, remaining units, and expiration dates.
        </p>
      </div>
      {grants.isPending ? (
        <SectionSkeleton />
      ) : grants.isError ? (
        <SectionLoadError label="Balance composition" onRetry={() => grants.refetch()} />
      ) : lots.length === 0 ? (
        <p className="px-5 py-9 text-center text-sm text-muted-foreground sm:px-6">
          No grant records are available.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-muted/45 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              <tr>
                <th className="px-5 py-3 sm:px-6">Added</th>
                <th className="px-5 py-3">Original quantity</th>
                <th className="px-5 py-3">Remaining</th>
                <th className="px-5 py-3">Expiration</th>
                <th className="px-5 py-3 sm:px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {lots.map((grant) => (
                <GrantRow key={grant.id} grant={grant} />
              ))}
            </tbody>
          </table>
        </div>
      )}
      {grants.hasNextPage ? (
        <LoadMore pending={grants.isFetchingNextPage} onLoad={() => grants.fetchNextPage()} />
      ) : null}
    </section>
  );
}

function LoadMore({ pending, onLoad }: { pending: boolean; onLoad: () => void }) {
  return (
    <div className="border-t border-border px-5 py-4 text-center">
      <Button size="compact" variant="secondary" disabled={pending} onClick={onLoad}>
        {pending ? "Loading…" : "Load more"}
      </Button>
    </div>
  );
}

function SectionLoadError({ label, onRetry }: { label: string; onRetry: () => void }) {
  return (
    <div className="px-5 py-9 text-center sm:px-6">
      <p className="text-sm font-medium">{label} could not be loaded</p>
      <Button size="compact" variant="secondary" className="mt-4" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}

function SectionSkeleton() {
  return (
    <div className="space-y-px bg-border">
      {[0, 1, 2].map((row) => (
        <div key={row} className="grid grid-cols-4 gap-4 bg-card px-5 py-4 sm:px-6">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-20" />
        </div>
      ))}
    </div>
  );
}

function ActivityRow({ item }: { item: BalanceActivity }) {
  const labels = {
    add: "Quantity added",
    set: "Balance adjusted",
    usage: "Usage processed",
    expiration: "Quantity expired",
  } as const;
  const sourceLabel = activitySourceLabel(item.sourceType);
  return (
    <div className="grid gap-2 px-5 py-4 sm:grid-cols-[1fr_auto] sm:items-center sm:px-6">
      <div>
        <p className="text-sm font-medium">{labels[item.kind]}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {formatDateTime(item.occurredAt)}
          {sourceLabel ? ` · ${sourceLabel}` : null}
        </p>
      </div>
      <div className="sm:text-right">
        <p
          className={
            item.quantityChange >= 0
              ? "font-medium tabular-nums text-emerald-700 dark:text-emerald-400"
              : "font-medium tabular-nums"
          }
        >
          {item.quantityChange >= 0 ? "+" : ""}
          {formatQuantity(item.quantityChange)}
        </p>
        {item.resultingQuantity !== null ? (
          <p className="mt-1 text-xs text-muted-foreground">
            Balance {formatQuantity(item.resultingQuantity)}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function activitySourceLabel(sourceType: string) {
  switch (sourceType) {
    case "dashboard_user":
      return "Dashboard user";
    case "api_key":
      return "API key";
    case "system":
      return "System";
    default:
      return null;
  }
}

function GrantRow({ grant }: { grant: EntitlementGrant }) {
  return (
    <tr>
      <td className="px-5 py-4 text-xs text-muted-foreground sm:px-6">
        {formatDateTime(grant.createdAt)}
      </td>
      <td className="px-5 py-4 tabular-nums">{formatQuantity(grant.grantedQuantity)}</td>
      <td className="px-5 py-4 font-medium tabular-nums">
        {formatQuantity(grant.remainingQuantity)}
      </td>
      <td className="px-5 py-4 text-xs text-muted-foreground">
        {grant.expiresAt ? formatDateTime(grant.expiresAt) : "Does not expire"}
      </td>
      <td className="px-5 py-4 sm:px-6">
        <GrantStatus status={grant.status} />
      </td>
    </tr>
  );
}

function GrantStatus({ status }: { status: EntitlementGrant["status"] }) {
  const label = status === "active" ? "Available" : status === "exhausted" ? "Used" : "Expired";
  return (
    <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium">{label}</span>
  );
}

function Message({
  title,
  href,
  onRetry,
}: {
  title: string;
  href: string;
  onRetry?: () => void;
}) {
  return (
    <div className="mx-auto max-w-[1040px] px-5 py-11 text-center sm:px-8">
      <h1 className="text-lg font-semibold">{title}</h1>
      <div className="mt-5 flex justify-center gap-2">
        {onRetry ? (
          <Button size="compact" variant="secondary" onClick={onRetry}>
            Try again
          </Button>
        ) : null}
        <Button asChild size="compact" variant="quiet">
          <Link href={href}>Back to customer</Link>
        </Button>
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-[1040px] space-y-5 px-5 py-11 sm:px-8">
      <Skeleton className="h-9 w-56" />
      <Skeleton className="h-36 w-full rounded-xl" />
      <Skeleton className="h-72 w-full rounded-xl" />
    </div>
  );
}

function formatQuantity(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(value),
  );
}
