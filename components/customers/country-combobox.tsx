"use client";

import { CaretDownIcon, CheckIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";
import { Popover as PopoverPrimitive } from "radix-ui";
import { useMemo, useState } from "react";
import { Input, inputClassName } from "@/components/ui/input";
import { countries } from "@/lib/customers/countries";
import { cn } from "@/lib/utils";

type CountryComboboxProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  invalid: boolean;
  describedBy?: string;
};

export function CountryCombobox({
  id,
  value,
  onChange,
  disabled,
  invalid,
  describedBy,
}: CountryComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selected = countries.find((country) => country.code === value);
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filteredCountries = useMemo(
    () =>
      normalizedQuery
        ? countries.filter(
            (country) =>
              country.name.toLocaleLowerCase().includes(normalizedQuery) ||
              country.code.toLocaleLowerCase().includes(normalizedQuery),
          )
        : countries,
    [normalizedQuery],
  );

  function changeOpen(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) setQuery("");
  }

  function selectCountry(code: string) {
    onChange(code);
    changeOpen(false);
  }

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={changeOpen}>
      <PopoverPrimitive.Trigger asChild>
        <button
          id={id}
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
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
          <span className="truncate">{selected?.name ?? "Select country"}</span>
          <CaretDownIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="center"
          sideOffset={6}
          collisionPadding={16}
          className="z-50 w-[min(20rem,calc(100vw-2rem))] rounded-lg border border-[#cbd5dc] bg-popover p-1.5 text-popover-foreground shadow-md"
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
              placeholder="Search countries…"
              aria-label="Search countries"
              className="h-9 pl-9"
            />
          </div>
          <div id={`${id}-options`} role="listbox" className="mt-1 max-h-64 overflow-y-auto">
            {!normalizedQuery ? (
              <CountryOption
                name="Not set"
                selected={!value}
                onSelect={() => selectCountry("")}
              />
            ) : null}
            {filteredCountries.map((country) => (
              <CountryOption
                key={country.code}
                name={country.name}
                code={country.code}
                selected={value === country.code}
                onSelect={() => selectCountry(country.code)}
              />
            ))}
            {filteredCountries.length === 0 ? (
              <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                No country found.
              </p>
            ) : null}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

function CountryOption({
  name,
  code,
  selected,
  onSelect,
}: {
  name: string;
  code?: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      onClick={onSelect}
      className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm outline-none hover:bg-accent focus-visible:bg-accent"
    >
      <CheckIcon
        className={cn("size-4 shrink-0", selected ? "opacity-100" : "opacity-0")}
        aria-hidden="true"
      />
      <span className="min-w-0 flex-1 truncate">{name}</span>
      {code ? <span className="text-xs text-muted-foreground">{code}</span> : null}
    </button>
  );
}
