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
      {status === "accepted" ? "Allowed" : "Blocked"}
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
        <DialogDescription>Details for this usage request.</DialogDescription>
        <dl className="mt-3 grid gap-px overflow-hidden rounded-lg border border-border bg-border text-sm sm:grid-cols-2">
          <OperationDetail
            label="Outcome"
            value={operation.status === "accepted" ? "Allowed" : "Blocked"}
          />
          <OperationDetail label="Quantity" value={formatQuantity(operation.quantity)} />
          <OperationDetail label="Customer ID" value={operation.customerId} mono />
          <OperationDetail label="Meter key" value={operation.meterKey} mono />
          <OperationDetail label="Meter type" value={formatMeterType(operation.meterType)} />
          <OperationDetail label="Occurred" value={formatDateTime(operation.createdAt)} />
          {operation.status === "denied" ? (
            <OperationDetail
              label="Reason blocked"
              value={formatDenialReason(operation.denialReason)}
              className="sm:col-span-2"
            />
          ) : null}
        </dl>
        <details className="mt-4 rounded-lg border border-border bg-card text-sm">
          <summary className="cursor-pointer px-4 py-3 font-medium select-none">
            Request details
          </summary>
          <dl className="grid gap-px border-t border-border bg-border sm:grid-cols-2">
            <OperationDetail
              label="Operation ID"
              value={operation.id}
              mono
              className="sm:col-span-2"
            />
            <OperationDetail
              label="Duplicate retries"
              value={operation.replayCount.toString()}
            />
            <OperationDetail
              label="Last retry received"
              value={
                operation.lastReplayedAt ? formatDateTime(operation.lastReplayedAt) : "Never"
              }
            />
          </dl>
        </details>
      </DialogContent>
    </Dialog>
  );
}

function OperationDetail({
  label,
  value,
  mono = false,
  className = "",
}: {
  label: string;
  value: string;
  mono?: boolean;
  className?: string;
}) {
  return (
    <div className={`min-w-0 bg-card px-4 py-3 ${className}`}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={`mt-1 break-words ${mono ? "font-mono text-xs" : ""}`}>{value}</dd>
    </div>
  );
}

function formatQuantity(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

function formatMeterType(value: UsageOperation["meterType"]) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatDenialReason(value: string | null) {
  if (value === null) return "Reason unavailable";
  if (value === "insufficient_balance") return "Insufficient balance";
  return value.replaceAll("_", " ");
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
