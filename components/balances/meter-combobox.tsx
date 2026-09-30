"use client";

import { CaretDownIcon, CheckIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";
import { Popover as PopoverPrimitive } from "radix-ui";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, inputClassName } from "@/components/ui/input";
import type { Meter } from "@/lib/meters/meters.types";
import { cn } from "@/lib/utils";

export function MeterCombobox({
  id,
  meters,
  value,
  onChange,
  disabled,
  invalid,
  describedBy,
  hasMore,
  loadingMore,
  onLoadMore,
}: {
  id: string;
  meters: Meter[];
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  invalid: boolean;
  describedBy?: string;
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selected = meters.find((meter) => meter.meterKey === value);
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filtered = useMemo(
    () =>
      normalizedQuery
        ? meters.filter(
            (meter) =>
              meter.name.toLocaleLowerCase().includes(normalizedQuery) ||
              meter.meterKey.toLocaleLowerCase().includes(normalizedQuery),
          )
        : meters,
    [meters, normalizedQuery],
  );

  function changeOpen(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) setQuery("");
  }

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={changeOpen}>
      <PopoverPrimitive.Trigger asChild>
        <button
          id={id}
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-controls={`${id}-options`}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          disabled={disabled}
          className={cn(
            inputClassName,
            "mt-2 flex items-center justify-between gap-2 text-left",
            !selected && "text-[#84919a]",
          )}
        >
          <span className="min-w-0 truncate">
            {selected ? `${selected.name} · ${selected.meterKey}` : "Select a meter"}
          </span>
          <CaretDownIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={6}
          collisionPadding={16}
          className="z-50 w-[var(--radix-popover-trigger-width)] min-w-72 rounded-lg border border-[#cbd5dc] bg-popover p-1.5 text-popover-foreground shadow-md"
        >
          <div className="relative">
            <MagnifyingGlassIcon
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search meters…"
              aria-label="Search meters"
              className="h-10 pl-9"
            />
          </div>
          <div id={`${id}-options`} role="listbox" className="mt-1 max-h-64 overflow-y-auto">
            {filtered.map((meter) => (
              <button
                key={meter.id}
                type="button"
                role="option"
                aria-selected={meter.meterKey === value}
                onClick={() => {
                  onChange(meter.meterKey);
                  changeOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left outline-none hover:bg-accent focus-visible:bg-accent"
              >
                <CheckIcon
                  className={cn(
                    "size-4 shrink-0",
                    meter.meterKey === value ? "opacity-100" : "opacity-0",
                  )}
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm">{meter.name}</span>
                  <span className="block truncate font-mono text-[11px] text-muted-foreground">
                    {meter.meterKey}
                  </span>
                </span>
              </button>
            ))}
            {filtered.length === 0 ? (
              <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                No loaded meter matches this search.
              </p>
            ) : null}
          </div>
          {hasMore ? (
            <div className="border-t border-border px-1 pt-1.5">
              <Button
                type="button"
                size="compact"
                variant="quiet"
                className="w-full"
                onClick={onLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? "Loading…" : "Load more meters"}
              </Button>
            </div>
          ) : null}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
