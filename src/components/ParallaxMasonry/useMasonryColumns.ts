"use client";

import { useState, useEffect, useMemo, useSyncExternalStore } from "react";

export interface MasonryItem {
  id?: string | number;
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
  href?: string;
  category?: string;
}

export interface ColumnItem<T extends MasonryItem = MasonryItem> {
  item: T;
  originalIndex: number;
  columnIndex: number;
  itemIndexInColumn: number;
}

/**
 * Returns the column count for a given viewport width according to the design specification:
 * - 1 column below 640px
 * - 2 columns from 640px (sm)
 * - 3 columns from 1024px (lg)
 * - 4 columns from 1440px (2xl)
 */
export function getTargetColumnCount(width: number): number {
  if (width >= 1440) return 4;
  if (width >= 1024) return 3;
  if (width >= 640) return 2;
  return 1;
}

const emptySubscribe = () => () => {};

/**
 * Hook to distribute items into columns using a greedy shortest-column algorithm
 * based on item aspect ratios (height / width).
 * Avoids CSS columns to preserve left-to-right distribution and enable independent column parallax.
 */
export function useMasonryColumns<T extends MasonryItem>(
  items: T[],
  debounceMs: number = 150
) {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const [columnCount, setColumnCount] = useState<number>(() => {
    if (typeof window !== "undefined") {
      return getTargetColumnCount(window.innerWidth);
    }
    return 4;
  });

  useEffect(() => {
    if (!isClient) return;

    // Synchronize column count immediately on client mount
    const initialCount = getTargetColumnCount(window.innerWidth);
    setColumnCount((prev) => (prev !== initialCount ? initialCount : prev));

    let timer: ReturnType<typeof setTimeout> | null = null;

    const handleResize = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        const nextCount = getTargetColumnCount(window.innerWidth);
        setColumnCount((prev) => (prev !== nextCount ? nextCount : prev));
      }, debounceMs);
    };

    window.addEventListener("resize", handleResize, { passive: true });
    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
    };
  }, [isClient, debounceMs]);

  // Greedily distribute items into the shortest column based on cumulative aspect ratios
  const columns = useMemo(() => {
    const cols: ColumnItem<T>[][] = Array.from(
      { length: columnCount },
      () => []
    );
    const colHeights = new Array(columnCount).fill(0);

    items.forEach((item, originalIndex) => {
      let shortestColIndex = 0;
      for (let i = 1; i < columnCount; i++) {
        if (colHeights[i] < colHeights[shortestColIndex]) {
          shortestColIndex = i;
        }
      }

      cols[shortestColIndex].push({
        item,
        originalIndex,
        columnIndex: shortestColIndex,
        itemIndexInColumn: cols[shortestColIndex].length,
      });

      // Relative height contribution based on known aspect ratio (height / width)
      const ratio =
        item.width > 0 && item.height > 0 ? item.height / item.width : 1;
      colHeights[shortestColIndex] += ratio;
    });

    return cols;
  }, [items, columnCount]);

  return {
    columns,
    columnCount,
    isSingleColumn: columnCount === 1,
  };
}
