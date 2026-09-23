"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Reusable custom hook for reading/writing values to localStorage with SSR safety.
 */
export function useLocalStorageState<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const isMountedRef = useRef(false);

  // Sync to localStorage whenever storedValue changes (after initial mount)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Storage listener for cross-tab updates
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (err) {
          console.warn(`Error parsing updated storage key "${key}":`, err);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [key]);

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue(value);
  }, []);

  return [storedValue, setValue];
}
