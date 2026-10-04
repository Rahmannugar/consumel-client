"use client";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { UsageOperation } from "@/lib/events/events.types";

export function UsageOutcomeBadge({ status }: { status: UsageOperation["status"] }) {
  return (
    <span
      className={
        status === "accepted"
          ? "rounded-full bg-emerald-500/12 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400"
          : "rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive"
      }
    >
      {status === "accepted" ? "Processed" : "Blocked"}
    </span>
  );
}

export function UsageOperationDialog({
  operation,
  onClose,
}: {
  operation: UsageOperation;
  onClose: () => void;
}) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogTitle>Usage operation</DialogTitle>
        <DialogDescription>
          Inspect the persisted decision and balance effect for this request.
        </DialogDescription>
        <dl className="mt-3 grid gap-px overflow-hidden rounded-lg border border-border bg-border text-sm sm:grid-cols-2">
          <OperationDetail
            label="Outcome"
            value={operation.status === "accepted" ? "Processed" : "Blocked"}
          />
          <OperationDetail label="Operation ID" value={operation.id} mono />
          <OperationDetail label="Customer ID" value={operation.customerId} mono />
          <OperationDetail label="Meter key" value={operation.meterKey} mono />
          <OperationDetail label="Meter type" value={operation.meterType} />
          <OperationDetail label="Quantity" value={formatQuantity(operation.quantity)} />
          <OperationDetail
            label="Balance debited"
            value={formatQuantity(operation.balanceDebited)}
          />
          <OperationDetail
            label="Remaining balance"
            value={
              operation.remainingBalance === null
                ? "Not applicable"
                : formatQuantity(operation.remainingBalance)
            }
          />
          <OperationDetail
            label="Reason blocked"
            value={operation.denialReason ?? "Not applicable"}
          />
          <OperationDetail label="Billable" value={operation.billable ? "Yes" : "No"} />
          <OperationDetail
            label="Idempotent replays"
            value={operation.replayCount.toString()}
          />
          <OperationDetail
            label="Last replayed"
            value={
              operation.lastReplayedAt ? formatDateTime(operation.lastReplayedAt) : "Never"
            }
          />
          <OperationDetail label="Created" value={formatDateTime(operation.createdAt)} />
        </dl>
      </DialogContent>
    </Dialog>
  );
}

function OperationDetail({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="min-w-0 bg-card px-4 py-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={`mt-1 break-words ${mono ? "font-mono text-xs" : ""}`}>{value}</dd>
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
