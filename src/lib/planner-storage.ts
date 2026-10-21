/**
 * Shared storage & synchronization for Event Planner profile and booking details.
 * Keeps http://localhost:3000/book and the Planner Dashboard in bidirectional sync.
 */

export interface PlannerProfile {
  name: string;
  email: string;
  phone: string;
  organization: string;
  venueName: string;
  venueCity: string;
  venueState: string;
  parkingAddress: string;
  parkingType: string;
  parkingNotes: string;
  soundSystem: string;
  stageAvailable: string;
  backlineProvided: string;
  loadInTime: string;
  expectedAttendance: string;
  budget: string;
  setLength: string;
  indoorOutdoor: string;
  ageRestriction: string;
  details: string;
  eventType: string;
  updatedAt?: string;
}

export const PLANNER_PROFILE_KEY = "7h_planner_profile_v1";
export const PLANNER_LAST_FORM_KEY = "7h_planner_last_form_v1";
export const PLANNER_SYNC_EVENT = "7h_planner_profile_updated";

export const DEFAULT_PLANNER_PROFILE: PlannerProfile = {
  name: "Event Planner",
  email: "planner@7thheavenband.com",
  phone: "(847) 555-0199",
  organization: "Scoreboard Entertainment",
  venueName: "",
  venueCity: "",
  venueState: "",
  parkingAddress: "",
  parkingType: "bus-trailer",
  parkingNotes: "",
  soundSystem: "Yes — full PA system",
  stageAvailable: "Yes",
  backlineProvided: "Yes — amps, drum kit & monitors",
  loadInTime: "3:00 PM",
  expectedAttendance: "250",
  budget: "$6,500 Guarantee",
  setLength: "Full Show (3-4 hours)",
  indoorOutdoor: "Indoor",
  ageRestriction: "All Ages",
  details:
    "VIP sponsor tables reserved near soundboard. Hospitality rider and green room access confirmed with venue management. Loading dock access available starting at 2:00 PM.",
  eventType: "full_band",
};

/**
 * Clean up legacy dummy values for venue and parking so they are never auto-filled.
 */
function sanitizeProfile(profile: Partial<PlannerProfile>): Partial<PlannerProfile> {
  const sanitized = { ...profile };
  if (sanitized.venueName === "Navy Pier Grand Ballroom") {
    sanitized.venueName = "";
  }
  if (sanitized.parkingAddress === "600 E Grand Ave") {
    sanitized.parkingAddress = "";
  }
  if (sanitized.venueCity === "Chicago" && !sanitized.venueName) {
    sanitized.venueCity = "";
  }
  if (sanitized.venueState === "IL" && !sanitized.venueName) {
    sanitized.venueState = "";
  }
  if (
    sanitized.parkingNotes &&
    sanitized.parkingNotes.includes("Gate 4 off Bartlett Rd")
  ) {
    sanitized.parkingNotes = "";
  }
  return sanitized;
}

/**
 * Retrieve saved planner profile from localStorage, falling back to last form or default profile.
 */
export function getStoredPlannerProfile(): PlannerProfile {
  if (typeof window === "undefined") {
    return { ...DEFAULT_PLANNER_PROFILE };
  }

  try {
    const rawProfile = localStorage.getItem(PLANNER_PROFILE_KEY);
    if (rawProfile) {
      const parsed = sanitizeProfile(JSON.parse(rawProfile));
      return {
        ...DEFAULT_PLANNER_PROFILE,
        ...parsed,
        details: parsed.details || DEFAULT_PLANNER_PROFILE.details,
      };
    }

    const rawLastForm =
      localStorage.getItem(PLANNER_LAST_FORM_KEY) ||
      localStorage.getItem("7h_planner_last_form");
    if (rawLastForm) {
      const parsed = sanitizeProfile(JSON.parse(rawLastForm));
      return {
        ...DEFAULT_PLANNER_PROFILE,
        name: parsed.name || DEFAULT_PLANNER_PROFILE.name,
        email: parsed.email || DEFAULT_PLANNER_PROFILE.email,
        phone: parsed.phone || DEFAULT_PLANNER_PROFILE.phone,
        organization: parsed.organization || DEFAULT_PLANNER_PROFILE.organization,
        venueName: parsed.venueName || DEFAULT_PLANNER_PROFILE.venueName,
        venueCity: parsed.venueCity || DEFAULT_PLANNER_PROFILE.venueCity,
        venueState: parsed.venueState || DEFAULT_PLANNER_PROFILE.venueState,
        parkingAddress: parsed.parkingAddress || DEFAULT_PLANNER_PROFILE.parkingAddress,
        parkingType: parsed.parkingType || DEFAULT_PLANNER_PROFILE.parkingType,
        parkingNotes: parsed.parkingNotes || DEFAULT_PLANNER_PROFILE.parkingNotes,
        soundSystem: parsed.soundSystem || DEFAULT_PLANNER_PROFILE.soundSystem,
        stageAvailable: parsed.stageAvailable || DEFAULT_PLANNER_PROFILE.stageAvailable,
        backlineProvided: parsed.backlineProvided || DEFAULT_PLANNER_PROFILE.backlineProvided,
        loadInTime: parsed.loadInTime || DEFAULT_PLANNER_PROFILE.loadInTime,
        expectedAttendance: parsed.expectedAttendance || DEFAULT_PLANNER_PROFILE.expectedAttendance,
        budget: parsed.budget || DEFAULT_PLANNER_PROFILE.budget,
        setLength: parsed.setLength || DEFAULT_PLANNER_PROFILE.setLength,
        indoorOutdoor: parsed.indoorOutdoor || DEFAULT_PLANNER_PROFILE.indoorOutdoor,
        ageRestriction: parsed.ageRestriction || DEFAULT_PLANNER_PROFILE.ageRestriction,
        details: parsed.details || DEFAULT_PLANNER_PROFILE.details,
        eventType: parsed.eventType || DEFAULT_PLANNER_PROFILE.eventType,
      };
    }
  } catch (e) {
    console.error("Failed to read planner profile from localStorage:", e);
  }

  return { ...DEFAULT_PLANNER_PROFILE };
}

/**
 * Save planner profile and dispatch sync event to update any active dashboards live.
 */
export function saveStoredPlannerProfile(
  updates: Partial<PlannerProfile>,
): PlannerProfile {
  if (typeof window === "undefined") {
    return { ...DEFAULT_PLANNER_PROFILE, ...updates };
  }

  try {
    const current = getStoredPlannerProfile();
    const updated: PlannerProfile = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(PLANNER_PROFILE_KEY, JSON.stringify(updated));

    // Also keep 7h_planner_last_form_v1 updated
    const existingLastForm = localStorage.getItem(PLANNER_LAST_FORM_KEY);
    const parsedLastForm = existingLastForm ? JSON.parse(existingLastForm) : {};
    localStorage.setItem(
      PLANNER_LAST_FORM_KEY,
      JSON.stringify({
        ...parsedLastForm,
        ...updated,
      }),
    );

    // Dispatch custom event for same-window updates
    window.dispatchEvent(
      new CustomEvent(PLANNER_SYNC_EVENT, { detail: updated }),
    );

    return updated;
  } catch (e) {
    console.error("Failed to save planner profile to localStorage:", e);
    return { ...DEFAULT_PLANNER_PROFILE, ...updates };
  }
}

/**
 * Reset planner profile to factory defaults.
 */
export function resetPlannerProfile(): PlannerProfile {
  return saveStoredPlannerProfile(DEFAULT_PLANNER_PROFILE);
}
