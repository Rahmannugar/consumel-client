"use client";

import { CalendarBlankIcon, CaretDownIcon, CheckIcon } from "@phosphor-icons/react";
import { ByteDatePicker } from "byte-datepicker";
import { useState } from "react";
import { useApplicationTheme } from "@/components/application/application-theme";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { EventsFilter } from "@/lib/events/events.types";

const dayMilliseconds = 24 * 60 * 60 * 1000;
const maximumRangeDays = 366;

const periodOptions: Array<{ value: EventsFilter["period"]; label: string }> = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "60d", label: "Last 60 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "1y", label: "Last year" },
  { value: "custom", label: "Custom range" },
];

function localDate(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function dateFromISO(value: string | undefined) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : localDate(date);
}

function addLocalDays(date: Date, days: number) {
  const result = localDate(date);
  result.setDate(result.getDate() + days);
  return result;
}

function latestEndDate(start: Date, today: Date) {
  const rangeEnd = addLocalDays(start, maximumRangeDays - 1);
  return rangeEnd < today ? rangeEnd : today;
}

export function EventDateRangePicker({
  filter,
  onChange,
}: {
  filter: EventsFilter;
  onChange: (filter: EventsFilter) => void;
}) {
  const { resolvedTheme } = useApplicationTheme();
  const today = localDate(new Date());
  const defaultEnd = today;
  const defaultStart = addLocalDays(today, -6);
  const [open, setOpen] = useState(false);
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(
    dateFromISO(filter.from) ?? defaultStart,
  );
  const [endDate, setEndDate] = useState<Date | null>(dateFromISO(filter.to) ?? defaultEnd);
  const label = periodOptions.find((option) => option.value === filter.period)?.label;
  const rangeIsComplete = startDate !== null && endDate !== null;
  const rangeIsOrdered = rangeIsComplete && endDate >= startDate;
  const rangeIsWithinLimit =
    rangeIsOrdered &&
    endDate.getTime() - startDate.getTime() < maximumRangeDays * dayMilliseconds;
  const rangeIsValid = rangeIsComplete && rangeIsOrdered && rangeIsWithinLimit;

  function close() {
    setOpen(false);
    setShowCustomRange(false);
  }

  function openCustomRange() {
    setStartDate(dateFromISO(filter.from) ?? defaultStart);
    setEndDate(dateFromISO(filter.to) ?? defaultEnd);
    setShowCustomRange(true);
  }

  function apply() {
    if (!startDate || !endDate || !rangeIsValid) return;
    const exclusiveEnd =
      endDate.getTime() === today.getTime() ? new Date() : addLocalDays(endDate, 1);
    onChange({
      ...filter,
      period: "custom",
      from: localDate(startDate).toISOString(),
      to: exclusiveEnd.toISOString(),
    });
    close();
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setShowCustomRange(false);
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="secondary"
          className="h-11 w-full justify-between px-3 text-sm font-normal sm:w-44"
          aria-label="Event time range"
        >
          {label}
          <CaretDownIcon aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        {showCustomRange ? (
          <div>
            <h2 className="text-sm font-semibold">Custom date range</h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Choose a start date and an inclusive end date, up to one year apart.
            </p>
            <div className="mt-4 grid gap-4">
              <div className="grid gap-2 text-sm font-medium">
                <span>Start date</span>
                <ByteDatePicker
                  value={startDate}
                  onChange={(date) => {
                    setStartDate(date);
                    if (date && endDate && endDate < date) setEndDate(null);
                  }}
                  includeDays
                  maxDate={endDate ?? today}
                  formatString="dd mmm yyyy"
                  hideInput
                  theme={resolvedTheme}
                >
                  {({ open: openPicker, isOpen, formattedValue }) => (
                    <button
                      type="button"
                      className="flex h-11 w-full items-center justify-between rounded-lg border border-[#c8d2d9] bg-background px-3 text-left text-sm shadow-xs outline-none hover:border-[#9eb3c1] focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20 dark:border-border"
                      onClick={openPicker}
                      aria-label="Start date"
                      aria-haspopup="dialog"
                      aria-expanded={isOpen}
                    >
                      <span
                        className={formattedValue ? "text-foreground" : "text-muted-foreground"}
                      >
                        {formattedValue || "Select start date"}
                      </span>
                      <CalendarBlankIcon className="text-muted-foreground" aria-hidden="true" />
                    </button>
                  )}
                </ByteDatePicker>
              </div>
              <div className="grid gap-2 text-sm font-medium">
                <span>End date</span>
                <ByteDatePicker
                  value={endDate}
                  onChange={setEndDate}
                  includeDays
                  minDate={startDate ?? undefined}
                  maxDate={startDate ? latestEndDate(startDate, today) : today}
                  formatString="dd mmm yyyy"
                  hideInput
                  theme={resolvedTheme}
                >
                  {({ open: openPicker, isOpen, formattedValue }) => (
                    <button
                      type="button"
                      className="flex h-11 w-full items-center justify-between rounded-lg border border-[#c8d2d9] bg-background px-3 text-left text-sm shadow-xs outline-none hover:border-[#9eb3c1] focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20 dark:border-border disabled:cursor-not-allowed disabled:opacity-55"
                      onClick={openPicker}
                      aria-label="End date"
                      aria-haspopup="dialog"
                      aria-expanded={isOpen}
                      disabled={!startDate}
                    >
                      <span
                        className={formattedValue ? "text-foreground" : "text-muted-foreground"}
                      >
                        {formattedValue || "Select end date"}
                      </span>
                      <CalendarBlankIcon className="text-muted-foreground" aria-hidden="true" />
                    </button>
                  )}
                </ByteDatePicker>
              </div>
            </div>
            {!rangeIsValid ? (
              <p className="mt-3 text-xs text-destructive">
                Choose an end date on or after the start date, no more than one year later.
              </p>
            ) : null}
            <div className="mt-4 flex justify-end gap-2">
              <Button
                type="button"
                variant="quiet"
                size="compact"
                onClick={() => setShowCustomRange(false)}
              >
                Back
              </Button>
              <Button type="button" size="compact" onClick={apply} disabled={!rangeIsValid}>
                Apply range
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-1">
            {periodOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className="flex min-h-10 w-full items-center justify-between rounded-lg px-3 text-left text-sm hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                onClick={() => {
                  if (option.value === "custom") {
                    openCustomRange();
                    return;
                  }
                  onChange({ ...filter, period: option.value, from: undefined, to: undefined });
                  close();
                }}
              >
                {option.label}
                {filter.period === option.value ? <CheckIcon aria-hidden="true" /> : null}
              </button>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
