"use client";

import { useEffect, useState } from "react";

// Shared client-side cache for GET /api/settings, deduplicated across
// components. Before this, Footer.tsx and HomeDataLoader.tsx each ran
// their own independent `fetch("/api/settings")` in their own effects --
// same endpoint, same response, two real network round-trips on every
// single Home page load (confirmed live via Resource Timing: 4 calls per
// load, i.e. 2 real call sites x React StrictMode's dev-only double
// mount). This hook makes every consumer share one in-flight request and
// one cached result instead, so cross-component duplication is gone in
// both dev and production -- StrictMode's own double-invoke in dev is
// separate, harmless, and not something app code should try to work
// around (it doesn't happen in production builds).
//
// Deliberately NOT a general-purpose fetch cache or a SWR/React Query
// replacement -- just enough to fix this one proven duplication without
// pulling in a dependency or touching Next's rendering model. See the
// `cacheComponents` conversation this came out of: that's a bigger,
// app-wide migration, this is the scoped fix for the one specific bug
// that was actually measured.
export type SiteSettings = Record<string, unknown> | null;

let cachedPromise: Promise<SiteSettings> | null = null;
let cachedData: SiteSettings = null;
let hasFetched = false;

function fetchSettingsOnce(): Promise<SiteSettings> {
  if (hasFetched) return Promise.resolve(cachedData);
  if (!cachedPromise) {
    cachedPromise = fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        cachedData = data ?? null;
        hasFetched = true;
        return cachedData;
      })
      .catch(() => {
        // Deliberately not caching a failure as "fetched" -- a transient
        // error shouldn't permanently stick every consumer with null for
        // the rest of the page's lifetime. Next mount tries again.
        return null;
      })
      .finally(() => {
        cachedPromise = null;
      });
  }
  return cachedPromise;
}

export function useSettings(): { settings: SiteSettings; loaded: boolean } {
  const [settings, setSettings] = useState<SiteSettings>(cachedData);
  const [loaded, setLoaded] = useState(hasFetched);

  useEffect(() => {
    if (hasFetched) {
      setSettings(cachedData);
      setLoaded(true);
      return;
    }
    let cancelled = false;
    fetchSettingsOnce().then((data) => {
      if (cancelled) return;
      setSettings(data);
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { settings, loaded };
}
