"use client";

import { MagnifyingGlassIcon, XIcon } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";

export function ListSearch({
  value,
  onChange,
  label,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder: string;
}) {
  return (
    <div className="relative mt-6 w-full">
      <label htmlFor={`${label.toLowerCase().replaceAll(" ", "-")}-search`} className="sr-only">
        {label}
      </label>
      <MagnifyingGlassIcon
        className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        id={`${label.toLowerCase().replaceAll(" ", "-")}-search`}
        type="text"
        role="searchbox"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className="h-10 pr-10 pl-10"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute top-1/2 right-2.5 grid size-7 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          aria-label={`Clear ${label.toLowerCase()}`}
        >
          <XIcon className="size-3.5" />
        </button>
      ) : null}
    </div>
  );
}
