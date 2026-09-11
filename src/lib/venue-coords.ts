/**
 * Geocoded venue coordinates for all 7th Heaven venues
 * Keyed by "venue|city" for deduplication
 *
 * Shared between TourMap (client) and SMS API routes (server)
 */
export const VENUE_COORDS: Record<string, [number, number]> = {
  "Station 34|Mt. Prospect": [42.0640, -87.9370],
  "Old Republic|Elgin": [42.0354, -88.2826],
  "Rookies|Hoffman Est.": [42.0744, -88.1912],
  "Rookie's Rockhouse|Hoffman Est.": [42.0744, -88.1912],
  "Sundance Saloon|Mundelein": [42.2766, -88.0418],
  "Durty Nellies|Palatine": [42.1150, -88.0340],
  "Stage 119|Elmhurst": [41.8994, -87.9403],
  "Jamos Live|Mokena": [41.5267, -87.8823],
  "Evenflow|Geneva": [41.8834, -88.3054],
  "Bannerman's|Bartlett": [41.9770, -88.1856],
  "Broken Oar|P. Barrington": [42.1600, -88.1370],
  "Tailgaters|Bolingbrook": [41.6956, -88.0689],
  "Midway Sports|Bartlett": [41.9830, -88.1880],
  "Joe's Live|Rosemont": [41.9947, -87.8643],
  "Rochaus|West Dundee": [42.0987, -88.2780],
  "Des Plaines Theater|Des Plaines": [42.0418, -87.8872],
  "Hard Rock Casino|Gary": [41.5921, -87.3445],
  "Hard Rock Casino|Rockford": [42.2666, -89.0469],
  "Corrigan's Pub|Shorewood": [41.5200, -88.2020],
  "Sideouts|Island Lake": [42.2770, -88.1930],
  "Bandito Barney's|East Dundee": [42.0990, -88.2700],
  "Deer Park Fest|Deer Park": [42.1600, -88.0810],
  "Chicago Auto Show First Look|Chicago": [41.8513, -87.6154],
  "WGN TV News Segment|Chicago": [41.8916, -87.6360],
  "Home Show|Chicago": [41.8513, -87.6154],
  "Youth Services Fundraiser|Wilmette": [42.0720, -87.7280],
  "Barb's Rescue Gala|Schaumburg": [42.0334, -88.0834],
  "Will County Beer & Bourbon Fest|Joliet": [41.5250, -88.0817],
  "Chicago Music Cruise|Miami": [25.7617, -80.1918],
};

export const CITY_COORDS: Record<string, [number, number]> = {
  "mt. prospect": [42.0640, -87.9370],
  "mount prospect": [42.0640, -87.9370],
  "elgin": [42.0354, -88.2826],
  "hoffman est.": [42.0744, -88.1912],
  "hoffman estates": [42.0744, -88.1912],
  "mundelein": [42.2766, -88.0418],
  "palatine": [42.1150, -88.0340],
  "elmhurst": [41.8994, -87.9403],
  "mokena": [41.5267, -87.8823],
  "geneva": [41.8834, -88.3054],
  "bartlett": [41.9770, -88.1856],
  "p. barrington": [42.1600, -88.1370],
  "port barrington": [42.1600, -88.1370],
  "barrington": [42.1539, -88.1362],
  "bolingbrook": [41.6956, -88.0689],
  "rosemont": [41.9947, -87.8643],
  "west dundee": [42.0987, -88.2780],
  "east dundee": [42.0990, -88.2700],
  "dundee": [42.0987, -88.2780],
  "des plaines": [42.0418, -87.8872],
  "gary": [41.5921, -87.3445],
  "rockford": [42.2666, -89.0469],
  "shorewood": [41.5200, -88.2020],
  "island lake": [42.2770, -88.1930],
  "deer park": [42.1600, -88.0810],
  "chicago": [41.8781, -87.6298],
  "wilmette": [42.0720, -87.7280],
  "schaumburg": [42.0334, -88.0834],
  "joliet": [41.5250, -88.0817],
  "miami": [25.7617, -80.1918],
  "arlington hts": [42.0884, -87.9806],
  "arlington heights": [42.0884, -87.9806],
};

export function getVenueCoords(venue: string, city: string, lat?: number, lng?: number): [number, number] | null {
  if (typeof lat === "number" && typeof lng === "number" && !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
    return [lat, lng];
  }
  const key = `${venue}|${city}`;
  if (VENUE_COORDS[key]) return VENUE_COORDS[key];

  const normVenue = venue.toLowerCase().replace(/['’`\\]/g, '').trim();
  const normCity = city.toLowerCase().replace(/['’`\\]/g, '').trim();

  for (const [vk, coords] of Object.entries(VENUE_COORDS)) {
    const [vPart, cPart] = vk.split('|');
    const nv = vPart.toLowerCase().replace(/['’`\\]/g, '').trim();
    const nc = cPart.toLowerCase().replace(/['’`\\]/g, '').trim();
    if ((normVenue.includes(nv) || nv.includes(normVenue)) && (normCity.includes(nc) || nc.includes(normCity))) {
      return coords;
    }
  }

  for (const [ck, coords] of Object.entries(CITY_COORDS)) {
    if (normCity.includes(ck) || ck.includes(normCity)) {
      return coords;
    }
  }

  return null;
}

