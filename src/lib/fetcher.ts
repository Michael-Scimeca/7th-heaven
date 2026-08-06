/**
 * Shared fetcher for useSWR.
 * Handles JSON responses and throws on non-ok status.
 */
export const jsonFetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error(`Fetch error: ${res.status}`);
  return res.json();
});

/**
 * Fetcher that returns null on error instead of throwing.
 * Useful for optional data that may not exist.
 */
export const safeFetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) return null;
  return res.json();
}).catch(() => null);

/**
 * Data fetching abstraction to avoid bare fetch in useEffect
 */
export const apiFetch = (input: RequestInfo | URL, init?: RequestInit) => fetch(input, init);