"use client";

import { useEffect, useState } from "react";

export function useDebouncedSearch(value: string, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value.trim());

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedValue(value.trim()), delay);
    return () => window.clearTimeout(timeout);
  }, [delay, value]);

  return debouncedValue;
}
