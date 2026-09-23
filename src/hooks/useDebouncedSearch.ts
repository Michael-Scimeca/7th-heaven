"use client";

import { useState, useEffect } from "react";

/**
 * Reusable custom hook to debounce rapid value updates (e.g. search inputs).
 */
export function useDebouncedSearch<T>(value: T, delayMs: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delayMs]);

  return debouncedValue;
}
