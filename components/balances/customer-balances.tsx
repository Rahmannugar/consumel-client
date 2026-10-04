"use client";

import { ArrowRightIcon, SlidersHorizontalIcon, WalletIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";
import { BalanceFormDialog } from "@/components/balances/balance-form-dialog";
import { useProjectWorkspace } from "@/components/projects/project-workspace-client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Balance } from "@/lib/balances/balances.types";
import { useBalances } from "@/lib/balances/useBalances";

type DialogState =
  | { meterKey?: undefined; quantity?: undefined }
  | { meterKey: string; quantity: number };

export function CustomerBalances({ customerId }: { customerId: string }) {
  const { project, environment } = useProjectWorkspace();
  const balances = useBalances(
    { projectId: project.id, environment: environment.name },
    customerId,
  );
  const [dialog, setDialog] = useState<DialogState | null>(null);

  return (
    <section className="mt-7 overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <h2 className="text-sm font-semibold">Balances</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Available quantities for this customer’s active meters.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="compact" onClick={() => setDialog({})}>
            <SlidersHorizontalIcon />
            Adjust balance
          </Button>
        </div>
      </div>

      {balances.isPending ? <BalancesSkeleton /> : null}
      {balances.isError ? (
        <div className="px-5 py-10 text-center sm:px-6">
          <p className="text-sm font-medium">Balances could not be loaded</p>
          <p className="mt-1 text-xs text-muted-foreground">
            The customer details are still available. Try loading the balances again.
          </p>
          <Button
            size="compact"
            variant="secondary"
            className="mt-4"
            onClick={() => balances.refetch()}
          >
            Try again
          </Button>
        </div>
      ) : null}
      {balances.isSuccess && balances.data.balances.length === 0 ? (
        <div className="px-5 py-10 text-center sm:px-6">
          <span className="mx-auto flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <WalletIcon className="size-5" />
          </span>
          <p className="mt-3 text-sm font-medium">No balances yet</p>
          <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-muted-foreground">
            Adjust a balance to add units after a payment or grant, or establish an exact total
            for an active meter.
          </p>
        </div>
      ) : null}
      {balances.isSuccess && balances.data.balances.length > 0 ? (
        <BalanceTable
          balances={balances.data.balances}
          projectSlug={project.slug}
          customerId={customerId}
          onSet={(balance) =>
            setDialog({
              meterKey: balance.meterKey,
              quantity: balance.quantity,
            })
          }
        />
      ) : null}

      {dialog ? (
        <BalanceFormDialog
          customerId={customerId}
          meterKey={dialog.meterKey}
          quantity={dialog.quantity}
          onClose={() => setDialog(null)}
        />
      ) : null}
    </section>
  );
}

function BalanceTable({
  balances,
  projectSlug,
  customerId,
  onSet,
}: {
  balances: Balance[];
  projectSlug: string;
  customerId: string;
  onSet: (balance: Balance) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[620px] text-left">
        <thead className="bg-muted/45 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          <tr>
            <th className="px-5 py-3 sm:px-6">Meter</th>
            <th className="px-5 py-3">Available quantity</th>
            <th className="px-5 py-3">Updated</th>
            <th className="px-5 py-3 text-right sm:px-6">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {balances.map((balance) => (
            <tr
              key={balance.id}
              className="relative transition-colors hover:bg-secondary/45 focus-within:bg-secondary/45 focus-within:ring-2 focus-within:ring-ring focus-within:ring-inset"
            >
              <td className="px-5 py-4 sm:px-6">
                <Link
                  href={`/dashboard/${projectSlug}/customers/${encodeURIComponent(customerId)}/balances/${encodeURIComponent(balance.meterKey)}`}
                  aria-label={`View ${balance.meterKey} balance details`}
                  className="after:absolute after:inset-0 focus-visible:outline-none"
                >
                  <code className="font-mono text-xs">{balance.meterKey}</code>
                </Link>
              </td>
              <td className="px-5 py-4 text-sm font-semibold tabular-nums">
                {formatQuantity(balance.quantity)}
              </td>
              <td className="px-5 py-4 text-xs text-muted-foreground">
                {formatDateTime(balance.updatedAt)}
              </td>
              <td className="relative z-10 px-5 py-4 text-right sm:px-6">
                <div className="flex items-center justify-end gap-1">
                  <Button asChild size="compact" variant="quiet">
                    <Link
                      href={`/dashboard/${projectSlug}/customers/${encodeURIComponent(customerId)}/balances/${encodeURIComponent(balance.meterKey)}`}
                    >
                      View details
                      <ArrowRightIcon />
                    </Link>
                  </Button>
                  <Button size="compact" variant="quiet" onClick={() => onSet(balance)}>
                    Adjust
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BalancesSkeleton() {
  return (
    <div className="space-y-px bg-border">
      {[0, 1].map((item) => (
        <div key={item} className="grid grid-cols-3 gap-4 bg-card px-5 py-4 sm:px-6">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-32" />
        </div>
      ))}
    </div>
  );
}

function formatQuantity(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
