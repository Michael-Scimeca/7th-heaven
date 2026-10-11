export interface CabinSpecItem {
  label: string;
  value: string;
}

export interface CabinDetails {
  id: string;
  code: string;
  name: string;
  categoryTitle: string;
  image: string;
  badge?: string;
  deckRange: string;
  roomSizeSqFt: number;
  balconySizeSqFt: number;
  totalSizeSqFt: number;
  occupancy: string;
  bedding: string;
  viewType: string;
  locationDetails: string;
  summary: string;
  highlights: string[];
  amenities: string[];
  inclusions: string[];
  specs: CabinSpecItem[];
}

export const CRUISE_CABIN_CATALOG: CabinDetails[] = [
  {
    id: "group_d4",
    code: "D4 / D2",
    name: "Ocean View Balcony",
    categoryTitle: "Category D4 / D2 · Ocean View Balcony",
    image: "/images/cruise/d1-ocean-view-balcony.jpg",
    badge: "Most Popular",
    deckRange: "Decks 7, 8, 9, 10, 11 & 12",
    roomSizeSqFt: 182,
    balconySizeSqFt: 50,
    totalSizeSqFt: 232,
    occupancy: "Up to 4 Guests (Double sofa bed + King conversion)",
    bedding: "Two twin beds converting to Royal King (72.5\" x 82\") + Convertible Sofa Bed",
    viewType: "Unobstructed Panoramic Oceanfront",
    locationDetails: "Midship & Aft · Convenient to Central Park & Main Theater Elevators",
    summary:
      "Floor-to-ceiling glass sliding doors open to your private ocean veranda. Experience refreshing sea breezes, stunning Caribbean sunrises, and prime midship positioning close to all 7th Heaven concert stages.",
    highlights: [
      "Private glass-railing ocean veranda furnished with 2 cushioned deck chairs & cocktail table",
      "Spacious living area featuring a comfortable convertible double sofa bed and writing desk",
      "Floor-to-ceiling glass sliding doors with blackout privacy drapery",
      "Private en-suite bathroom with glass-door shower, marble vanity & premium bath products",
      "Prime midship deck placement for gentle motion and immediate elevator access",
    ],
    amenities: [
      "43\" Interactive HDTV with band daily schedules, theater broadcasts & port guides",
      "In-room mini-fridge & cold beverage chiller",
      "Digital keypad electronic valuables safe",
      "Bedside USB-A / USB-C fast-charging ports & dual 110V/220V outlets",
      "Twice-daily stateroom attendant service with evening turndown & daily Cruise Compass",
      "Custom individual climate control thermostat",
      "Vanity dressing desk with lighted makeup mirror and hair dryer",
      "Starlink High-Speed VOOM Wi-Fi ready",
    ],
    inclusions: [
      "Guaranteed admission to all 7th Heaven Private Theater & Poolside Concerts",
      "All-Inclusive Classic Beverage Package (Beers, Wines, Cocktails, Coffees & Sodas)",
      "Complimentary 3-Course Dining in Main Dining Room, Windjammer & Casual Bistros",
      "Exclusive 7th Heaven Band VIP Meet & Greet, Photo Op & Commemorative Lanyard",
      "All Port Taxes, Government Fees & Shipboard Gratuities 100% Prepaid",
    ],
    specs: [
      { label: "Stateroom Size", value: "182 sq. ft. (17 m²)" },
      { label: "Private Balcony", value: "50 sq. ft. (4.6 m²)" },
      { label: "Total Living Space", value: "232 sq. ft. (21.6 m²)" },
      { label: "Sleeps", value: "Up to 4 Guests" },
      { label: "Bed Setup", value: "Royal King (or 2 Twins) + Sofa Bed" },
      { label: "Ship Decks", value: "Decks 7–12 (Midship & Aft)" },
      { label: "Veranda Type", value: "Private Glass Railing Balcony" },
      { label: "Bath Type", value: "Private Bath with Walk-in Glass Shower" },
    ],
  },
  {
    id: "group_i1",
    code: "I1",
    name: "Infinite Ocean View Balcony",
    categoryTitle: "Category I1 · Infinite Ocean View Balcony",
    image: "/images/cruise/i1-infinite-ocean-view-balcony.jpg",
    badge: "Next-Gen Tech",
    deckRange: "Decks 8, 9, 10 & 11",
    roomSizeSqFt: 200,
    balconySizeSqFt: 0,
    totalSizeSqFt: 200,
    occupancy: "Up to 4 Guests",
    bedding: "Two twin beds converting to Royal King + Double sofa bed",
    viewType: "Infinite Ocean Panoramic Window",
    locationDetails: "Midship & Forward",
    summary:
      "Revolutionary motorized push-button glass veranda that lowers into an open-air balcony at the push of a button, expanding your interior air-conditioned floor space by 25% while offering edge-to-edge ocean panoramas.",
    highlights: [
      "Motorized panoramic glass wall that rolls down into an open-air glass balcony at a button press",
      "25% more interior living space than conventional cruise balcony cabins",
      "Seamless indoor-to-outdoor sunroom lounge area with oceanfront seating",
      "Automated smart room controls for lighting scenes, shades, and temperature",
    ],
    amenities: [
      "Touch-panel stateroom automation for window, lighting, and climate",
      "43\" Interactive HDTV with on-demand streaming and band events",
      "In-room mini-fridge & electronic safe",
      "Bedside USB charging ports & vanity desk",
      "Private bathroom with full glass shower & deluxe amenities",
      "Twice-daily attendant service",
    ],
    inclusions: [
      "All 7th Heaven Private Theater & Poolside Concert Passes",
      "All-Inclusive Beverage Package Included",
      "Full Dining Room, Windjammer Buffet & Casual Venues",
      "VIP Band Meet & Greet Access & Photo Session",
      "Prepaid Port Fees, Taxes & Shipboard Gratuities",
    ],
    specs: [
      { label: "Stateroom Size", value: "200 sq. ft. (18.6 m²)" },
      { label: "Veranda Style", value: "Push-Button Motorized Open-Air Balcony" },
      { label: "Total Living Space", value: "200 sq. ft. (18.6 m²)" },
      { label: "Sleeps", value: "Up to 4 Guests" },
      { label: "Bed Setup", value: "Royal King (or 2 Twins) + Sofa Bed" },
      { label: "Ship Decks", value: "Decks 8–11 (Midship & Forward)" },
      { label: "Control", value: "One-Touch Digital Automation" },
      { label: "Bath Type", value: "Private Bath with Glass Shower" },
    ],
  },
  {
    id: "group_if",
    code: "IF",
    name: "Infinite Central Park Balcony",
    categoryTitle: "Category IF · Infinite Central Park Balcony",
    image: "/images/cruise/if.jpg",
    badge: "Neighborhood View",
    deckRange: "Decks 9, 10, 11 & 14",
    roomSizeSqFt: 200,
    balconySizeSqFt: 0,
    totalSizeSqFt: 200,
    occupancy: "Up to 4 Guests",
    bedding: "Two twin beds converting to Royal King + Double sofa bed",
    viewType: "Open-Air Central Park Living Neighborhood",
    locationDetails: "Central Park Neighborhood Overlook",
    summary:
      "Directly overlooks the iconic open-air Central Park with over 20,000 living tropical trees and plants. Enjoy live ambient acoustic guitar from the park pathways below and open sky above.",
    highlights: [
      "Overlooks lush open-air Central Park with living gardens and open sky canopy",
      "Push-button motorized lowerable panoramic window",
      "Steps away from specialty dining, wine bars, and quiet park strolling paths",
      "Unique neighborhood ambience with evening live acoustic music drifting up",
    ],
    amenities: [
      "Motorized lowerable panoramic picture window",
      "43\" Smart interactive TV with band schedules",
      "Mini-fridge & digital keypad safe",
      "Bedside USB charging ports",
      "Twice-daily stateroom attendant",
      "Full private bathroom with glass shower",
    ],
    inclusions: [
      "Full 7th Heaven Rock Concert Passes Included",
      "All-Inclusive Drinks & Cocktails Included",
      "Complimentary Main Dining & Buffets",
      "VIP Band Pass & Meet and Greet Included",
      "All Gratuities & Port Fees Prepaid",
    ],
    specs: [
      { label: "Stateroom Size", value: "200 sq. ft. (18.6 m²)" },
      { label: "View Atmosphere", value: "Open-Air Central Park Gardens" },
      { label: "Total Living Space", value: "200 sq. ft. (18.6 m²)" },
      { label: "Sleeps", value: "Up to 4 Guests" },
      { label: "Bed Setup", value: "Royal King (or 2 Twins) + Sofa Bed" },
      { label: "Ship Decks", value: "Decks 9, 10, 11 & 14" },
      { label: "Veranda Type", value: "Infinite Motorized Lowerable Window" },
      { label: "Bath Type", value: "Private Bath with Glass Shower" },
    ],
  },
  {
    id: "group_n5",
    code: "N5",
    name: "Ocean View Stateroom",
    categoryTitle: "Category N5 · Ocean View Stateroom",
    image: "/images/cruise/n5.jpg",
    badge: "Great Value",
    deckRange: "Decks 3, 4, 7, 8, 9 & 11",
    roomSizeSqFt: 179,
    balconySizeSqFt: 0,
    totalSizeSqFt: 179,
    occupancy: "Up to 4 Guests",
    bedding: "Two twin beds converting to Royal King + pull-out sofa bed",
    viewType: "Oversized Ocean Picture Window",
    locationDetails: "Forward & Midship",
    summary:
      "Enjoy sweeping, natural sea views through an oversized ocean-facing picture window. Comfortable layout with plush seating, luxury bedding, and smart storage for all your cruise gear.",
    highlights: [
      "Oversized framed picture window with direct natural daylight and ocean horizons",
      "Comfortable sitting lounge area with convertible sofa bed",
      "Generous wardrobe closets and under-bed luggage storage",
      "Private en-suite bathroom with glass shower",
    ],
    amenities: [
      "Interactive 43\" HDTV",
      "Mini-fridge & electronic safe",
      "Bedside USB charging ports & vanity desk",
      "Twice-daily stateroom service",
      "Individual climate control thermostat",
    ],
    inclusions: [
      "Full 7th Heaven Concert Passes Included",
      "All-Inclusive Beverage Package Included",
      "Complimentary Main Dining & Buffets",
      "VIP Band Meet & Greet Access",
      "Port Fees & Gratuities 100% Included",
    ],
    specs: [
      { label: "Stateroom Size", value: "179 sq. ft. (16.6 m²)" },
      { label: "Window Type", value: "Large Framed Ocean Picture Window" },
      { label: "Total Living Space", value: "179 sq. ft. (16.6 m²)" },
      { label: "Sleeps", value: "Up to 4 Guests" },
      { label: "Bed Setup", value: "Royal King (or 2 Twins) + Sofa Bed" },
      { label: "Ship Decks", value: "Decks 3, 4, 7, 8, 9 & 11" },
      { label: "Balcony", value: "None (Picture Window)" },
      { label: "Bath Type", value: "Private Bath with Glass Shower" },
    ],
  },
  {
    id: "group_q2",
    code: "Q2",
    name: "Interior Plus Stateroom",
    categoryTitle: "Category Q2 · Interior Plus Stateroom",
    image: "/images/cruise/q2-interior-plus.jpg",
    badge: "Budget Friendly",
    deckRange: "Decks 4, 7, 8, 9, 10, 11 & 12",
    roomSizeSqFt: 157,
    balconySizeSqFt: 0,
    totalSizeSqFt: 157,
    occupancy: "Up to 2 Guests",
    bedding: "Two twin beds converting to Royal King (72.5\" x 82\")",
    viewType: "Interior with LED Ambient Lighting",
    locationDetails: "Ultra-Quiet Deck Corridors",
    summary:
      "The perfect sanctuary to recharge between poolside rock sets, island excursions, and late-night karaoke. Features smart space design and customizable ambient LED mood lighting.",
    highlights: [
      "Ultra-quiet interior location optimal for sleeping in after late-night rock concerts",
      "Smart LED ambient mood lighting with custom color scenes",
      "Space-saving contemporary layout with custom wardrobe storage",
      "Private en-suite bathroom with glass shower",
    ],
    amenities: [
      "Interactive 43\" HDTV",
      "In-room mini-fridge & valuables safe",
      "Vanity desk with mirror & USB charging",
      "Twice-daily attendant service",
    ],
    inclusions: [
      "All 7th Heaven Private Concerts & Events Included",
      "All-Inclusive Beverage Package Included",
      "All Main Dining & Buffet Meals",
      "VIP Band Meet & Greet Pass",
      "Gratuities, Taxes & Port Fees Prepaid",
    ],
    specs: [
      { label: "Stateroom Size", value: "157 sq. ft. (14.6 m²)" },
      { label: "View Type", value: "Interior / Ambient LED Mood Scenes" },
      { label: "Total Living Space", value: "157 sq. ft. (14.6 m²)" },
      { label: "Sleeps", value: "Up to 2 Guests" },
      { label: "Bed Setup", value: "Royal King (or 2 Twin Beds)" },
      { label: "Ship Decks", value: "Decks 4, 7–12" },
      { label: "Noise Level", value: "Ultra Quiet (Shielded Corridors)" },
      { label: "Bath Type", value: "Private Bath with Glass Shower" },
    ],
  },
  {
    id: "group_jy",
    code: "JY",
    name: "Junior Suite with Balcony",
    categoryTitle: "Category JY · Sky Class Junior Suite",
    image: "/images/cruise/jy.png",
    badge: "Suite Luxury",
    deckRange: "Decks 9, 10 & 11",
    roomSizeSqFt: 322,
    balconySizeSqFt: 80,
    totalSizeSqFt: 402,
    occupancy: "Up to 4 Guests",
    bedding: "Royal King bed + luxury pull-out double sofa bed",
    viewType: "Sweeping High-Deck Oceanfront Veranda",
    locationDetails: "Upper Decks Midship",
    summary:
      "Expansive suite luxury featuring an extra-large private teak balcony, bathroom with full bathtub and marble vanity, walk-in dressing closet, and Sky Class suite benefits.",
    highlights: [
      "Oversized 80 sq. ft. private teak veranda with padded chaise lounges & dining table",
      "Luxurious bathroom with full bathtub, marble counters, and plush terry bathrobes",
      "Dedicated walk-in closet and expansive master living parlor",
      "Priority embarkation, private suite sun deck access, and reserved theater seating",
    ],
    amenities: [
      "Espresso specialty coffee machine in-room",
      "Plush luxury bathrobes & slippers",
      "Large 55\" Smart Interactive HDTV",
      "Twice-daily attendant with evening pillow chocolates",
      "Priority stateroom service & luggage delivery",
    ],
    inclusions: [
      "VIP Front-Row Band Concert Seating Passes",
      "All-Inclusive Beverage Package Included",
      "Exclusive Coastal Kitchen Suite Dining Access",
      "Private VIP Band Reception & Meet & Greet",
      "All Gratuities, Port Taxes & Fees Prepaid",
    ],
    specs: [
      { label: "Stateroom Size", value: "322 sq. ft. (30 m²)" },
      { label: "Private Balcony", value: "80 sq. ft. (7.4 m²)" },
      { label: "Total Living Space", value: "402 sq. ft. (37.4 m²)" },
      { label: "Sleeps", value: "Up to 4 Guests" },
      { label: "Bed Setup", value: "Royal King + Double Sleeper Sofa" },
      { label: "Ship Decks", value: "Decks 9–11 (Midship)" },
      { label: "Suite Perks", value: "Priority Boarding & Coastal Kitchen" },
      { label: "Bath Type", value: "Full Bathtub & Marble Vanity" },
    ],
  },
];

/**
 * Resolves the matching cabin category from user booking preference string or notes
 */
export function resolveCabinDetails(
  cabinPreference?: string,
  notes?: string,
): CabinDetails {
  const query = `${cabinPreference || ""} ${notes || ""}`.toLowerCase();

  if (
    query.includes("infinite ocean") ||
    query.includes("group_i1") ||
    query.includes("infinite ocean view") ||
    query.includes("category i1")
  ) {
    return CRUISE_CABIN_CATALOG.find((c) => c.id === "group_i1")!;
  }

  if (
    query.includes("central park") ||
    query.includes("group_if") ||
    query.includes("infinite central") ||
    query.includes("category if")
  ) {
    return CRUISE_CABIN_CATALOG.find((c) => c.id === "group_if")!;
  }

  if (
    query.includes("suite") ||
    query.includes("group_jy") ||
    query.includes("junior suite") ||
    query.includes("grand suite")
  ) {
    return CRUISE_CABIN_CATALOG.find((c) => c.id === "group_jy")!;
  }

  if (
    query.includes("ocean view") &&
    !query.includes("balcony")
  ) {
    return CRUISE_CABIN_CATALOG.find((c) => c.id === "group_n5")!;
  }

  if (
    query.includes("interior") ||
    query.includes("group_q2") ||
    query.includes("inside")
  ) {
    return CRUISE_CABIN_CATALOG.find((c) => c.id === "group_q2")!;
  }

  // Default to Ocean View Balcony (Group D4/D2) which matches demo & typical bookings
  return CRUISE_CABIN_CATALOG[0];
}

/**
 * Parses cabin number from strings like "Ocean View Balcony (Cabin 9122)"
 */
export function extractCabinNumber(cabinPreference?: string): string {
  if (!cabinPreference) return "Cabin 9122";
  const match =
    cabinPreference.match(/Cabin\s*#?([A-Za-z0-9-]+)/i) ||
    cabinPreference.match(/#([0-9]{4,5})/i);
  if (match && match[1]) {
    return `Cabin ${match[1].replace(/[^0-9A-Za-z]/g, "")}`;
  }
  return "Cabin 9122";
}
