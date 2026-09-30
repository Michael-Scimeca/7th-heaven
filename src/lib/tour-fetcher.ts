let cachedTourPromise: Promise<any[]> | null = null;
let cachedTourData: any[] | null = null;
let cacheTimestamp = 0;
const CLIENT_CACHE_TTL = 30_000; // 30 seconds client-side cache

/**
 * Shared, deduplicated client-side tour dates fetcher.
 * Merges concurrent requests on page load so /api/tour is only fetched once.
 */
export async function fetchTourDatesCached(): Promise<any[]> {
  const now = Date.now();
  if (cachedTourData && now - cacheTimestamp < CLIENT_CACHE_TTL) {
    return cachedTourData;
  }
  if (cachedTourPromise) {
    return cachedTourPromise;
  }

  cachedTourPromise = fetch("/api/tour")
    .then(async (res) => {
      if (!res.ok) return [];
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      cachedTourData = list;
      cacheTimestamp = Date.now();
      cachedTourPromise = null;
      return list;
    })
    .catch(() => {
      cachedTourPromise = null;
      return [];
    });

  return cachedTourPromise;
}
