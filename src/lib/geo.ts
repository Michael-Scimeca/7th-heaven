/**
 * Zip Code → Lat/Lng geocoding for proximity SMS alerts.
 *
 * Uses the free Zippopotam.us API (no key required).
 * Falls back to a static Chicagoland lookup for common zips.
 */

// Static fallback for common Chicagoland zips (covers ~90% of subscribers)
const CHICAGOLAND_ZIPS: Record<string, [number, number]> = {
  "60007": [42.0111, -87.8446], // Elk Grove Village
  "60008": [42.0753, -88.0312], // Rolling Meadows
  "60016": [42.049, -87.8845], // Des Plaines
  "60025": [42.07, -87.787], // Glenview
  "60056": [42.064, -87.937], // Mt. Prospect
  "60067": [42.115, -88.034], // Palatine
  "60074": [42.12, -88.02], // Palatine
  "60090": [42.1292, -87.9301], // Wheeling
  "60101": [41.8994, -87.9403], // Addison
  "60103": [41.977, -88.1856], // Bartlett
  "60118": [42.099, -88.27], // East Dundee/W. Dundee
  "60123": [42.0354, -88.2826], // Elgin
  "60126": [41.8994, -87.9403], // Elmhurst
  "60148": [41.8542, -88.0012], // Lombard
  "60169": [42.0744, -88.1912], // Hoffman Estates
  "60173": [42.0334, -88.0834], // Schaumburg
  "60192": [42.0744, -88.1912], // Hoffman Estates
  "60194": [42.0334, -88.0834], // Schaumburg
  "60060": [42.2766, -88.0418], // Mundelein
  "60010": [42.16, -88.137], // Barrington
  "60084": [42.189, -88.031], // Wauconda
  "60099": [42.3607, -87.8445], // Zion
  "60014": [42.2416, -88.324], // Crystal Lake
  "60050": [42.3048, -88.319], // McHenry
  "60134": [41.8834, -88.3054], // Geneva
  "60137": [41.8541, -88.0767], // Glen Ellyn
  "60440": [41.6956, -88.0689], // Bolingbrook
  "60448": [41.5267, -87.8823], // Mokena
  "60490": [41.6986, -88.0684], // Bolingbrook
  "60435": [41.525, -88.0817], // Joliet
  "60601": [41.8862, -87.6186], // Chicago Loop
  "60611": [41.8934, -87.6238], // Near North
  "60614": [41.9217, -87.6499], // Lincoln Park
  "60618": [41.9469, -87.7091], // North Center
  "60640": [41.9716, -87.6601], // Uptown
  "60657": [41.94, -87.653], // Lakeview
  "46406": [41.5921, -87.3445], // Gary, IN
  "61108": [42.2666, -89.0469], // Rockford
  "60091": [42.072, -87.728], // Wilmette
  "60042": [42.277, -88.193], // Island Lake
  "60404": [41.52, -88.202], // Shorewood
  "60081": [42.16, -88.081], // Deer Park area
};

/**
 * Geocode a US zip code to [latitude, longitude].
 * First checks the static lookup, then falls back to Zippopotam.us API.
 */
export async function geocodeZip(
  zip: string,
): Promise<{ lat: number; lng: number } | null> {
  const cleanZip = zip.replace(/\D/g, "").slice(0, 5);
  if (cleanZip.length !== 5) return null;

  // 1. Check static lookup first (no network call)
  const cached = CHICAGOLAND_ZIPS[cleanZip];
  if (cached) {
    return { lat: cached[0], lng: cached[1] };
  }

  // 2. Fall back to free API
  try {
    const res = await fetch(`https://api.zippopotam.us/us/${cleanZip}`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.places?.[0]) {
      return {
        lat: parseFloat(data.places[0].latitude),
        lng: parseFloat(data.places[0].longitude),
      };
    }
  } catch {
    // API timeout or error — not critical, subscriber still saved without geo
  }

  return null;
}

/**
 * Haversine distance between two points in miles.
 */
export function distanceMiles(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 3959; // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
