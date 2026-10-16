/* eslint-disable react-doctor/no-high-complexity-react-function */
/* eslint-disable react-doctor/nextjs-no-client-fetch-for-server-data */
"use client";
import { useState, useEffect, useCallback, useMemo, Suspense, useSyncExternalStore, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  CalendarPicker,
  EventFormatPicker,
  BookingSlot,
} from "@/components/CalendarPicker";
import type { TourDateDetailItem } from "@/lib/booking-availability";
import { useMember } from "@/context/MemberContext";
import { formatPhoneDisplay } from "@/lib/validation";
import {
  Guitar,
  Mic,
  PartyPopper,
  Sparkles,
  Check,
  AlertTriangle,
  Star,
  Shield,
  ClipboardList,
  Zap,
  Lightbulb,
  Plus,
  X,
  Megaphone,
  MapPin,
  Navigation,
  Compass,
  FileText,
  Bookmark,
  Save,
  CheckCircle2,
  Trash2,
  Building2,
  Sliders,
  User,
  MessageSquare,
  Bus,
  Truck,
  Warehouse,
  ExternalLink,
  RotateCcw,
  LogIn,
} from "lucide-react";
import GooeyMessagesDropdown from "@/components/GooeyMessagesDropdown";
import Dropdown from "@/components/Dropdown";
import { DotChevronDown, DotChevronRight } from "@/components/ui/DotArrow";
import { Toggle } from "@/components/Toggle";
import Button from "@/components/Button";
import GlowInput, { GlowTextarea } from "@/components/GlowInput";
import { SectionBadge } from "@/components/SectionBadge";
import InputField from "@/components/InputField";
import { SectionHeader } from "@/components/SectionHeader";
import PageSection from "@/components/PageSection";
import Stack from "@/components/Stack";
import dynamic from "next/dynamic";
import { ScheduledShowsSection } from "./ScheduledShowsSection";
import BookingProgressTracker from "@/components/BookingProgressTracker";
import {
  getStoredPlannerProfile,
  saveStoredPlannerProfile,
  resetPlannerProfile,
  DEFAULT_PLANNER_PROFILE,
  PLANNER_SYNC_EVENT,
  type PlannerProfile,
} from "@/lib/planner-storage";

const PlannerDashboard = dynamic(() => import("@/components/PlannerDashboard"));

export const eventTypes = [
  {
    id: "full_band",
    label: "Full Band",
    icon: Guitar,
    desc: "High energy, full 5-piece concert setup",
  },
  {
    id: "unplugged",
    label: "Unplugged",
    icon: Mic,
    desc: "Acoustic, intimate stripped-down set",
  },
  {
    id: "private",
    label: "Private Event",
    icon: PartyPopper,
    desc: "Birthdays, corporate events, weddings",
  },
  {
    id: "custom",
    label: "Custom Booking",
    icon: Sparkles,
    desc: "Special requests, festivals, hybrid shows",
  },
];

const budgetRanges = [
  "Under $2,000",
  "$2,000 – $5,000",
  "$5,000 – $10,000",
  "$10,000 – $20,000",
  "$20,000+",
  "Prefer not to say",
];

export interface SavedAddress {
  id: string;
  label: string;
  venueName: string;
  parkingAddress: string;
  venueCity: string;
  venueState: string;
  parkingNotes?: string;
  parkingType?: string;
}

export const PARKING_OPTIONS = [
  {
    id: "bus-trailer",
    label: "Band Bus & Trailer Lot",
    short: "Bus & Trailer",
    icon: Bus,
    description: "Dedicated outdoor lot, rear stage bus parking (e.g. West Lot Gate 4)",
    defaultNote: "Band bus & crew truck park in West Lot behind stage. Enter through Gate 4 off Bartlett Rd.",
  },
  {
    id: "dock-bay",
    label: "Loading Dock & Freight Bay",
    short: "Loading Dock",
    icon: Truck,
    description: "Dedicated loading dock, roll-up bay doors, freight elevator (e.g. Bays 3-4)",
    defaultNote: "Load-in Gate: West Lot 4. Loading dock bays 3-4 at service concourse.",
  },
  {
    id: "garage",
    label: "Venue Parking Garage",
    short: "Garage / Ramp",
    icon: Warehouse,
    description: "Covered or underground multi-level parking ramp (e.g. Marina City garage lower level)",
    defaultNote: "Stage door load-in via venue parking garage lower level.",
  },
  {
    id: "street",
    label: "Street / Alley Load-in Zone",
    short: "Street / Alley",
    icon: Navigation,
    description: "Curb-side street staging or alley access behind venue",
    defaultNote: "Curb-side staging on street or alley behind venue. Ramp to stage floor.",
  },
  {
    id: "custom",
    label: "Custom Instructions",
    short: "Custom Notes",
    icon: Sliders,
    description: "Custom gate passes, security checkpoints, or staff coordination",
    defaultNote: "",
  },
];

const DEFAULT_SAVED_ADDRESSES: SavedAddress[] = [
  {
    id: "preset-1",
    label: "Bridges Scoreboard - Bartlett",
    venueName: "Bridges Scoreboard",
    parkingAddress: "980 S Bartlett Rd, Lot B",
    venueCity: "Bartlett",
    venueState: "IL",
    parkingType: "bus-trailer",
    parkingNotes:
      "Band bus & crew truck park in West Lot behind stage. Enter through Gate 4 off Bartlett Rd.",
  },
  {
    id: "preset-2",
    label: "Navy Pier Grand Ballroom - Chicago",
    venueName: "Navy Pier Grand Ballroom",
    parkingAddress: "600 E Grand Ave",
    venueCity: "Chicago",
    venueState: "IL",
    parkingType: "dock-bay",
    parkingNotes:
      "Load-in Gate: West Lot 4. Loading dock bays 3-4 at service concourse.",
  },
  {
    id: "preset-3",
    label: "The Arcada Theatre - St. Charles",
    venueName: "The Arcada Theatre",
    parkingAddress: "105 E Main St",
    venueCity: "St. Charles",
    venueState: "IL",
    parkingType: "dock-bay",
    parkingNotes: "Loading dock located in alley behind venue on 1st St.",
  },
  {
    id: "preset-4",
    label: "House of Blues - Chicago",
    venueName: "House of Blues",
    parkingAddress: "329 N Dearborn St",
    venueCity: "Chicago",
    venueState: "IL",
    parkingType: "garage",
    parkingNotes: "Stage door load-in via Marina City garage lower level.",
  },
];


import HelperText from "@/components/ui/HelperText";
import {
  TextAreaField,
  SelectField,
  RadioPillField,
} from "./components/BookFormFields";

const BOOKING_SERVICE_LD = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "7th Heaven Live Band Booking",
  serviceType: "Musical Performance / Live Entertainment",
  provider: {
    "@type": "MusicGroup",
    name: "7th Heaven",
    url: "https://7thheavenband.com",
  },
  areaServed: {
    "@type": "Country",
    name: "United States",
  },
  description:
    "Hire 7th Heaven for festivals, concert venues, corporate celebrations, private events, and weddings.",
  url: "https://7thheavenband.com/book",
};

export default function BookClient({
  sanityContent,
  initialBlockedDates,
  initialDateDetails,
}: {
  sanityContent?: any;
  initialBlockedDates?: string[];
  initialDateDetails?: Record<string, TourDateDetailItem[]>;
}) {
  return (
    <BookPageContent
      sanityContent={sanityContent}
      initialBlockedDates={initialBlockedDates}
      initialDateDetails={initialDateDetails}
    />
  );
}

const emptySubscribe = () => () => {};

function BookPageContent({
  sanityContent,
  initialBlockedDates = [],
  initialDateDetails = {},
}: {
  sanityContent?: any;
  initialBlockedDates?: string[];
  initialDateDetails?: Record<string, TourDateDetailItem[]>;
}) {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const { member, isLoggedIn, openModal, signup, login } = useMember();
  const [urlParams] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return {
        from: params.get("from"),
        tab: params.get("tab"),
        step: params.get("step"),
      };
    }
    return { from: null, tab: null, step: null };
  });

  const fromParam = urlParams.from;
  const isFromPlanner = fromParam === "planner" || fromParam === "rebook";
  const [activeTab, setActiveTab] = useState<"book" | "planner">(
    urlParams.tab === "planner" ||
      urlParams.tab === "dashboard" ||
      isFromPlanner
      ? "planner"
      : "book",
  );

  const [selectedType, setSelectedType] = useState<string | null>("full_band");

  const [formData, setFormData] = useState(() => {
    let initialName = member?.name || "";
    let initialEmail = member?.email || "";
    let initialPhone = member?.phone || "";

    if (typeof window !== "undefined") {
      try {
        const localMember =
          localStorage.getItem("7h_member_session") ||
          localStorage.getItem("7th_heaven_user");
        if (localMember) {
          const parsed = JSON.parse(localMember);
          if (!initialName && parsed.name) initialName = parsed.name;
          if (!initialEmail && parsed.email) initialEmail = parsed.email;
          if (!initialPhone && parsed.phone) initialPhone = parsed.phone;
        }
      } catch { }
    }

    const p = DEFAULT_PLANNER_PROFILE;

    return {
      name: initialName || p.name,
      email: initialEmail || p.email,
      phone: initialPhone || p.phone,
      organization: member?.organization || p.organization,
      eventDate: "",
      eventStartTime: "",
      eventEndTime: "",
      startTime: "",
      endTime: "",
      customEventType: "",
      venueName: "",
      venueCity: "",
      venueState: "",
      indoorOutdoor: p.indoorOutdoor,
      expectedAttendance: p.expectedAttendance,
      budget: p.budget,
      setLength: p.setLength,
      soundSystem: p.soundSystem,
      stageAvailable: p.stageAvailable,
      backlineProvided: p.backlineProvided,
      ageRestriction: p.ageRestriction,
      loadInTime: p.loadInTime,
      parkingAddress: "",
      parkingType: p.parkingType || "bus-trailer",
      parkingNotes: "",
      details: p.details,
      hearAbout: "",
      website: "", // Honeypot
    };
  });
  const [hasParkingNotes, setHasParkingNotes] = useState(false);
  const [bookMapMode, setBookMapMode] = useState<"map" | "satellite" | "radar">("map");
  const [isLoadInUnsure, setIsLoadInUnsure] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [accountPassword, setAccountPassword] = useState("");
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [accountEmail, setAccountEmail] = useState("");
  const [editingEmail, setEditingEmail] = useState(false);
  const [pinCode, setPinCode] = useState("");
  const [pinSent, setPinSent] = useState(false);
  const [pinError, setPinError] = useState("");
  const [pinLoading, setPinLoading] = useState(false);
  const [addOns, setAddOns] = useState<string[]>([]);

  // Blocked dates from confirmed bookings
  const [blockedDates, setBlockedDates] = useState<string[]>(initialBlockedDates);
  const [dateDetails, setDateDetails] = useState<
    Record<string, TourDateDetailItem[]>
  >(initialDateDetails);

  // Selected slots for booking (multiple date/time slot support)
  const [bookingSlots, setBookingSlots] = useState<BookingSlot[]>([]);
  const [expandedMetadata, setExpandedMetadata] = useState<
    Record<string, boolean>
  >({});
  const [hasSavedForm, setHasSavedForm] = useState(false);

  // Alternate dates (multi-date hold)
  const [altDate1, setAltDate1] = useState("");
  const [altDate2, setAltDate2] = useState("");

  // Saved addresses state & management
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>(
    DEFAULT_SAVED_ADDRESSES,
  );
  const [addressNotification, setAddressNotification] = useState<string | null>(
    null,
  );
  const [selectedSavedAddressId, setSelectedSavedAddressId] =
    useState<string>("");

  const currentVenueAddress = [
    formData.parkingAddress,
    formData.venueCity,
    formData.venueState,
  ]
    .filter(Boolean)
    .join(", ");

  const bookSearchQuery = formData.venueName
    ? currentVenueAddress
      ? `${formData.venueName}, ${currentVenueAddress}`
      : `${formData.venueName}, Chicago, IL`
    : currentVenueAddress || "Chicago, IL";

  const encodedBookQuery = encodeURIComponent(bookSearchQuery);
  const bookEmbedUrl = `https://maps.google.com/maps?q=${encodedBookQuery}&t=${bookMapMode === "satellite" ? "k" : ""}&z=15&ie=UTF8&iwloc=&output=embed`;
  const bookGoogleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedBookQuery}`;

  const pickerLabels = useMemo(() => {
    const formatSection = sanityContent?.sections?.find(
      (s: any) => s.sectionId === "formats",
    );
    const windowSection = sanityContent?.sections?.find(
      (s: any) => s.sectionId === "window",
    );
    const scheduleSection = sanityContent?.sections?.find(
      (s: any) => s.sectionId === "schedule",
    );
    if (!formatSection && !windowSection && !scheduleSection) return undefined;
    return {
      bookingWindowHeading: windowSection?.title,
      showStartLabel:
        windowSection?.showStartLabel ||
        windowSection?.fields?.find((f: any) => f.fieldKey === "showStartLabel")
          ?.value,
      showFinishLabel:
        windowSection?.showFinishLabel ||
        windowSection?.fields?.find(
          (f: any) => f.fieldKey === "showFinishLabel",
        )?.value,
      bandStartLabel:
        windowSection?.bandStartLabel ||
        windowSection?.fields?.find((f: any) => f.fieldKey === "bandStartLabel")
          ?.value,
      bandFinishLabel:
        windowSection?.bandFinishLabel ||
        windowSection?.fields?.find(
          (f: any) => f.fieldKey === "bandFinishLabel",
        )?.value,
      eventFormatHeading: formatSection?.title,
      calendarSubtitle: scheduleSection?.subtitle,
    };
  }, [sanityContent]);

  useEffect(() => {
    try {
      const localSaved = localStorage.getItem("7th_heaven_saved_addresses");
      if (localSaved) {
        const parsed = JSON.parse(localSaved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSavedAddresses(parsed);
        }
      }
    } catch {
      // Ignore errors
    }
  }, []);

  const handleSaveCurrentAddress = (customLabel?: string) => {
    if (!formData.parkingAddress && !formData.venueName) {
      setAddressNotification("Please enter a venue name or address first.");
      setTimeout(() => setAddressNotification(null), 3000);
      return;
    }

    const label =
      customLabel ||
      formData.venueName ||
      formData.parkingAddress ||
      "Saved Address";
    const newAddr: SavedAddress = {
      id: `saved-${Date.now()}`,
      label,
      venueName: formData.venueName || "",
      parkingAddress: formData.parkingAddress || "",
      venueCity: formData.venueCity || "",
      venueState: formData.venueState || "IL",
      parkingNotes: formData.parkingNotes || "",
    };

    const filtered = savedAddresses.filter(
      (a) =>
        a.id !== newAddr.id && a.label.toLowerCase() !== label.toLowerCase(),
    );
    const updated = [newAddr, ...filtered];
    setSavedAddresses(updated);
    try {
      localStorage.setItem(
        "7th_heaven_saved_addresses_v1",
        JSON.stringify(updated),
      );
    } catch { }

    setSelectedSavedAddressId(newAddr.id);
    setAddressNotification(`Saved "${label}" to your saved locations!`);
    setTimeout(() => setAddressNotification(null), 3500);
  };

  const handleSelectSavedAddress = (item: SavedAddress) => {
    setSelectedSavedAddressId(item.id);
    setFormData((prev) => ({
      ...prev,
      venueName: item.venueName || prev.venueName,
      parkingAddress: item.parkingAddress || prev.parkingAddress,
      venueCity: item.venueCity || prev.venueCity,
      venueState: item.venueState || prev.venueState,
      parkingNotes: item.parkingNotes || prev.parkingNotes || "",
      parkingType: item.parkingType || prev.parkingType || "bus-trailer",
    }));

    if (item.parkingNotes) {
      setHasParkingNotes(true);
    }

    setAddressNotification(`Loaded "${item.label}" into venue & parking details!`);
    setTimeout(() => setAddressNotification(null), 3000);
  };

  const handleDeleteSavedAddress = (id: string) => {
    const updated = savedAddresses.filter((a) => a.id !== id);
    setSavedAddresses(updated);
    try {
      localStorage.setItem(
        "7th_heaven_saved_addresses_v1",
        JSON.stringify(updated),
      );
    } catch { }

    if (selectedSavedAddressId === id) {
      setSelectedSavedAddressId("");
    }
  };


  const loadAvailability = useCallback(async () => {
    try {
      const r = await fetch("/api/booking/availability");
      if (r.ok) {
        const d = await r.json();
        setBlockedDates(d.blockedDates || []);
        setDateDetails(d.dateDetails || {});
      }
    } catch { }
  }, []);

  // Fetch blocked dates on mount if not already provided by server
  useEffect(() => {
    if (initialBlockedDates.length === 0) {
      loadAvailability();
    }

    try {
      const saved =
        localStorage.getItem("7h_planner_last_form_v1") ||
        localStorage.getItem("7h_planner_last_form");
      if (saved) {
        setHasSavedForm(true);
      }
    } catch { }
  }, [loadAvailability, initialBlockedDates.length]);

  // Auto-fill planner details on /book so planners don't have to refill them
  useEffect(() => {
    try {
      const profile = getStoredPlannerProfile();
      setFormData((prev) => ({
        ...prev,
        name: member?.name || profile.name || prev.name,
        email: member?.email || profile.email || prev.email,
        phone: member?.phone || profile.phone || prev.phone,
        organization: member?.organization || profile.organization || prev.organization,
        // Venue location & parking should NOT be auto-filled - user specifies for each booking
        venueName: prev.venueName || "",
        venueCity: prev.venueCity || "",
        venueState: prev.venueState || "",
        parkingAddress: prev.parkingAddress || "",
        parkingType: prev.parkingType || profile.parkingType || "bus-trailer",
        parkingNotes: prev.parkingNotes || "",
        soundSystem: profile.soundSystem || prev.soundSystem,
        stageAvailable: profile.stageAvailable || prev.stageAvailable,
        backlineProvided: profile.backlineProvided || prev.backlineProvided,
        loadInTime: profile.loadInTime || prev.loadInTime,
        expectedAttendance: profile.expectedAttendance || prev.expectedAttendance,
        budget: profile.budget || prev.budget,
        setLength: profile.setLength || prev.setLength,
        indoorOutdoor: profile.indoorOutdoor || prev.indoorOutdoor,
        details: profile.details || prev.details,
      }));
      if (profile.eventType) {
        setSelectedType(profile.eventType);
      }

      // If user came via rebooking or is a logged-in planner making a new booking,
      // start with fresh slots/dates so the planner can select their new date & time
      if (
        fromParam === "rebook" ||
        (isLoggedIn &&
          (member?.role === "event_planner" || member?.role === "admin"))
      ) {
        setBookingSlots([]);
        setAltDate1("");
        setAltDate2("");
      } else {
        const savedForm =
          localStorage.getItem("7h_planner_last_form_v1") ||
          localStorage.getItem("7h_planner_last_form");
        if (savedForm) {
          const parsed = JSON.parse(savedForm);
          if (parsed.bookingSlots && Array.isArray(parsed.bookingSlots) && parsed.bookingSlots.length > 0) {
            setBookingSlots(parsed.bookingSlots);
          }
        }
      }
    } catch { }

    // URL params override localStorage (for specific field overrides)
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const allFields = [
        "name",
        "email",
        "phone",
        "organization",
        "venueName",
        "venueCity",
        "venueState",
        "parkingAddress",
        "parkingNotes",
        "parkingType",
        "indoorOutdoor",
        "expectedAttendance",
        "budget",
        "soundSystem",
        "stageAvailable",
        "backlineProvided",
        "ageRestriction",
        "loadInTime",
        "details",
      ] as const;
      if (
        searchParams.get("parkingAddress") ||
        searchParams.get("parkingNotes") ||
        searchParams.get("parkingType")
      ) {
        setHasParkingNotes(true);
      }
      setFormData((prev) => {
        const updated = { ...prev };
        allFields.forEach((f) => {
          const val = searchParams.get(f);
          if (val) (updated as any)[f] = val;
        });
        if (fromParam === "rebook") {
          updated.eventDate = "";
          updated.startTime = "";
          updated.endTime = "";
          updated.eventStartTime = "";
          updated.eventEndTime = "";
        }
        return updated;
      });
      const eventType = searchParams.get("eventType");
      if (eventType) setSelectedType(eventType);
    }
  }, [fromParam, isLoggedIn, member]);

  // Live debounced auto-sync of planner fields to localStorage and Planner Dashboard
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const timer = setTimeout(() => {
      saveStoredPlannerProfile({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        organization: formData.organization,
        venueName: formData.venueName,
        venueCity: formData.venueCity,
        venueState: formData.venueState,
        parkingAddress: formData.parkingAddress,
        parkingType: formData.parkingType,
        parkingNotes: formData.parkingNotes,
        soundSystem: formData.soundSystem,
        stageAvailable: formData.stageAvailable,
        backlineProvided: formData.backlineProvided,
        loadInTime: formData.loadInTime,
        expectedAttendance: formData.expectedAttendance,
        budget: formData.budget,
        setLength: formData.setLength,
        indoorOutdoor: formData.indoorOutdoor,
        ageRestriction: formData.ageRestriction,
        details: formData.details,
        eventType: selectedType || "unplugged",
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [formData, selectedType]);

  // Listen for sync events from dashboard or another window
  useEffect(() => {
    const handlePlannerSync = (e?: Event) => {
      const customEvt = e as CustomEvent<PlannerProfile> | undefined;
      const profile = customEvt?.detail || getStoredPlannerProfile();
      setFormData((prev) => ({
        ...prev,
        name: profile.name || prev.name,
        email: profile.email || prev.email,
        phone: profile.phone || prev.phone,
        organization: profile.organization || prev.organization,
        // Preserve current venue/parking without auto-filling
        venueName: prev.venueName || "",
        venueCity: prev.venueCity || "",
        venueState: prev.venueState || "",
        parkingAddress: prev.parkingAddress || "",
        parkingType: prev.parkingType || profile.parkingType || "bus-trailer",
        parkingNotes: prev.parkingNotes || "",
        soundSystem: profile.soundSystem || prev.soundSystem,
        stageAvailable: profile.stageAvailable || prev.stageAvailable,
        backlineProvided: profile.backlineProvided || prev.backlineProvided,
        loadInTime: profile.loadInTime || prev.loadInTime,
        expectedAttendance: profile.expectedAttendance || prev.expectedAttendance,
        budget: profile.budget || prev.budget,
        setLength: profile.setLength || prev.setLength,
        indoorOutdoor: profile.indoorOutdoor || prev.indoorOutdoor,
        ageRestriction: profile.ageRestriction || prev.ageRestriction,
      }));
      if (profile.eventType) {
        setSelectedType(profile.eventType);
      }
    };

    window.addEventListener(PLANNER_SYNC_EVENT, handlePlannerSync);
    return () => window.removeEventListener(PLANNER_SYNC_EVENT, handlePlannerSync);
  }, []);

  const handleResetPlannerDefaults = () => {
    const p = resetPlannerProfile();
    setFormData((prev) => ({
      ...prev,
      name: p.name,
      email: p.email,
      phone: p.phone,
      organization: p.organization,
      venueName: p.venueName,
      venueCity: p.venueCity,
      venueState: p.venueState,
      parkingAddress: p.parkingAddress,
      parkingType: p.parkingType,
      parkingNotes: p.parkingNotes,
      soundSystem: p.soundSystem,
      stageAvailable: p.stageAvailable,
      backlineProvided: p.backlineProvided,
      loadInTime: p.loadInTime,
      expectedAttendance: p.expectedAttendance,
      budget: p.budget,
      setLength: p.setLength,
      indoorOutdoor: p.indoorOutdoor,
      ageRestriction: p.ageRestriction,
      details: p.details,
      eventDate: "",
      startTime: "",
      endTime: "",
      eventStartTime: "",
      eventEndTime: "",
    }));
    setBookingSlots([]);
    setSelectedType(p.eventType);
  };

  // Auto-fill details if user is already logged in
  useEffect(() => {
    if (member) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || member.name || "",
        email: prev.email || member.email || "",
        phone: prev.phone || member.phone || "",
      }));
    }
  }, [member]);

  const handleLoadLastForm = () => {
    try {
      const saved =
        localStorage.getItem("7h_planner_last_form_v1") ||
        localStorage.getItem("7h_planner_last_form");
      if (saved) {
        const parsed = JSON.parse(saved);
        setFormData((prev) => ({
          ...prev,
          name: parsed.name || prev.name,
          email: parsed.email || prev.email,
          phone: parsed.phone || prev.phone,
          organization: parsed.organization || prev.organization,
          venueName: parsed.venueName || prev.venueName,
          venueCity: parsed.venueCity || prev.venueCity,
          venueState: parsed.venueState || prev.venueState,
          indoorOutdoor: parsed.indoorOutdoor || prev.indoorOutdoor,
          soundSystem: parsed.soundSystem || prev.soundSystem,
          stageAvailable: parsed.stageAvailable || prev.stageAvailable,
          backlineProvided: parsed.backlineProvided || prev.backlineProvided,
          expectedAttendance:
            parsed.expectedAttendance || prev.expectedAttendance,
          details: parsed.details || prev.details,
        }));
        if (parsed.eventType) {
          setSelectedType(parsed.eventType);
        }
        if (parsed.addOns) {
          setAddOns(parsed.addOns);
        }
      }
    } catch { }
  };

  const handleSendPin = async () => {
    if (!accountEmail) {
      setPinError("Email address is required.");
      return;
    }
    setPinLoading(true);
    setPinError("");
    try {
      const res = await fetch("/api/auth/send-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: accountEmail }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.error) {
          setPinError(data.error);
        } else {
          setPinSent(true);
        }
      } else {
        const data = await res.json().catch(() => ({}));
        setPinError(data.error || "Failed to send verification code.");
      }
    } catch (err) {
      setPinError("Failed to send verification code. Please try again.");
    } finally {
      setPinLoading(false);
    }
  };

  const handleVerifyPin = async () => {
    if (!pinCode || pinCode.length !== 6) {
      setPinError("Please enter a 6-digit verification code.");
      return;
    }
    setPinLoading(true);
    setPinError("");
    try {
      const res = await fetch("/api/auth/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: accountEmail,
          pin: pinCode,
          name: formData.name,
          password: accountPassword,
          phone: formData.phone,
          wantNotifications: true,
          wantNewsletter: true,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.error) {
          setPinError(data.error);
        } else {
          const loginOk = await login(accountEmail, accountPassword);
          if (loginOk) {
            window.location.href = "/planner";
          } else {
            setPinError(
              "Account created, but auto-login failed. Please sign in manually.",
            );
          }
        }
      } else {
        const data = await res.json().catch(() => ({}));
        setPinError(data.error || "Verification failed.");
      }
    } catch (err) {
      setPinError("Failed to verify code. Please try again.");
    } finally {
      setPinLoading(false);
    }
  };

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const value =
      e.target.type === "tel"
        ? formatPhoneDisplay(e.target.value)
        : e.target.value;
    setFormData((prev) => ({ ...prev, [e.target.name]: value }));
    if (e.target.name === "startTime") {
      setBookingSlots((prev) =>
        prev.map((s) => ({ ...s, startTime: value })),
      );
    } else if (e.target.name === "endTime") {
      setBookingSlots((prev) =>
        prev.map((s) => ({ ...s, endTime: value })),
      );
    } else if (e.target.name === "eventStartTime") {
      setBookingSlots((prev) =>
        prev.map((s) => ({ ...s, doorsTime: value })),
      );
    }
    // Clear validation errors when user edits
    if (validationErrors.length > 0) setValidationErrors([]);
  };

  const validateBooking = (): string[] => {
    const errors: string[] = [];

    // Required fields
    if (!selectedType) errors.push("Please select an event type.");
    if (!formData.name.trim()) errors.push("Full name is required.");
    if (!formData.email.trim()) errors.push("Email is required.");
    if (!formData.phone.trim()) errors.push("Phone number is required.");
    if (bookingSlots.length === 0)
      errors.push("Please select at least one show date on the calendar.");
    if (!formData.startTime) errors.push("Start time is required.");
    if (!formData.endTime) errors.push("End time is required.");
    if (!formData.venueName.trim()) errors.push("Venue name is required.");
    if (!formData.venueCity.trim()) errors.push("Venue city is required.");

    // Email format
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push("Please enter a valid email address.");
    }

    // Phone format
    if (!formData.phone || formData.phone.replace(/\D/g, "").length < 10) {
      errors.push("Phone number must be at least 10 digits.");
    }

    // Date & Time validation for each slot
    bookingSlots.forEach((slot, idx) => {
      const eventDate = new Date(slot.date + "T12:00:00");
      const now = new Date();
      const daysOut = Math.ceil(
        (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysOut < 0) {
        errors.push(
          `Show #${idx + 1} (${slot.date}): Cannot book a date in the past.`,
        );
      } else if (daysOut > 365) {
        errors.push(
          `Show #${idx + 1} (${slot.date}): Bookings cannot be made more than 1 year in advance.`,
        );
      }

      if (slot.startTime && slot.endTime) {
        const parseTime = (t: string) => {
          const match = t.match(/(\d+):(\d+)\s*(AM|PM)/i);
          if (!match) return 0;
          let h = parseInt(match[1]);
          const m = parseInt(match[2]);
          if (match[3].toUpperCase() === "PM" && h !== 12) h += 12;
          if (match[3].toUpperCase() === "AM" && h === 12) h = 0;
          return h * 60 + m;
        };
        if (parseTime(slot.endTime) <= parseTime(slot.startTime)) {
          errors.push(
            `Show #${idx + 1} (${slot.date}): End time must be after start time.`,
          );
        }
      }
    });

    // Rate limiting — max 3 submissions per hour
    try {
      const timestamps: number[] = JSON.parse(
        localStorage.getItem("7h_booking_timestamps_v1") ||
        localStorage.getItem("7h_booking_timestamps") ||
        "[]",
      );
      const oneHourAgo = Date.now() - 60 * 60 * 1000;
      const recent = timestamps.filter((t) => t > oneHourAgo);
      if (recent.length >= 3) {
        errors.push(
          "Too many booking requests. Please wait before submitting another.",
        );
      }
    } catch { }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Run validation across all form fields
    const errors = validateBooking();
    if (errors.length > 0) {
      setValidationErrors(errors);
      if (
        !selectedType ||
        bookingSlots.length === 0 ||
        !formData.startTime ||
        !formData.endTime
      ) {
        document
          .getElementById("step-1")
          ?.scrollIntoView({ behavior: "smooth" });
      } else if (!formData.venueName.trim() || !formData.venueCity.trim()) {
        document
          .getElementById("venue-logistics")
          ?.scrollIntoView({ behavior: "smooth" });
      } else {
        document
          .getElementById("contact-info")
          ?.scrollIntoView({ behavior: "smooth" });
      }
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          bookingSlots,
          eventDates: bookingSlots.map((s) => s.date),
          eventDate: bookingSlots[0]?.date || "",
          eventType: selectedType,
          altDate1,
          altDate2,
          addOns,
          website: formData.website,
        }),
      });
      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          // Save full form data for rebook auto-fill
          localStorage.setItem(
            "7h_planner_last_form_v1",
            JSON.stringify({
              ...formData,
              eventType: selectedType,
              bookingSlots,
              eventDates: bookingSlots.map((s) => s.date),
              eventDate: bookingSlots[0]?.date || "",
            }),
          );

          // Track submission timestamp for rate limiting
          try {
            const timestamps: number[] = JSON.parse(
              localStorage.getItem("7h_booking_timestamps_v1") ||
              localStorage.getItem("7h_booking_timestamps") ||
              "[]",
            );
            timestamps.push(Date.now());
            const oneHourAgo = Date.now() - 60 * 60 * 1000;
            localStorage.setItem(
              "7h_booking_timestamps_v1",
              JSON.stringify(timestamps.filter((t) => t > oneHourAgo)),
            );
          } catch { }

          // Persist phone number to user account if logged in
          if (isLoggedIn && member && formData.phone) {
            try {
              const accounts = JSON.parse(
                localStorage.getItem("7h_accounts_v1") ||
                localStorage.getItem("7h_accounts") ||
                "{}",
              );
              if (accounts[member.email]) {
                accounts[member.email].phone = formData.phone;
                localStorage.setItem(
                  "7h_accounts_v1",
                  JSON.stringify(accounts),
                );
              }
            } catch { }
          }

          // Stripe mode: redirect to Stripe Checkout
          if (result.mode === "stripe" && result.url) {
            window.location.href = result.url;
            return;
          }

          // Free mode (no Stripe configured): redirect to success page
          if (result.redirectUrl) {
            window.location.href = result.redirectUrl;
            return;
          }

          setSubmitted(true);
        } else {
          setValidationErrors([
            result.error || "Something went wrong. Please try again.",
          ]);
        }
      } else {
        const result = await res.json().catch(() => ({}));
        setValidationErrors([result.error || `HTTP error ${res.status}`]);
      }
    } catch (err) {
      console.error("Booking error:", err);
      setValidationErrors(["Network error. Please try again."]);
    } finally {
      setSubmitting(false);
    }
  };

  const [setlistSongs, setSetlistSongs] = useState<string[]>(["", "", ""]);
  const [setlistNotes, setSetlistNotes] = useState("");
  const [setlistSubmitted, setSetlistSubmitted] = useState(false);
  const [setlistSubmitting, setSetlistSubmitting] = useState(false);

  if (submitted) {
    return (
      <section
        id="book-success"
        aria-labelledby="book-success-heading"
        className="section relative"
      >
        <div className="flex min-h-screen items-center justify-center overflow-hidden px-6">
          <SectionHeader
            as="h2"
            id="book-success-heading"
            title={
              sanityContent?.sections?.find(
                (s: any) => s.sectionId === "success" || s.sectionId === "book-success",
              )?.title || "Request Received"
            }
            srOnly
          />
          <Stack gap="lg" className="items-center w-full">
            {/* Background Glows */}
            <div className="pointer-events-none absolute top-1/2 left-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 bg-[var(--color-accent)] opacity-[0.05] blur-3xl" />

            <div className="relative z-10 w-full max-w-lg animate-[fade-in-up_0.6s_ease-out_both] rounded-[2rem] border border-white/10 bg-[var(--color-bg-surface)]/80 p-10 text-center backdrop-blur-xl">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center border border-[var(--color-accent)] bg-[var(--color-accent)]/20">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--color-accent)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 className="mb-3">Request Received</h2>
              <p className="mb-8">
                Thank you for your interest in booking 7th Heaven! We&apos;ve sent a
                confirmation email to <strong>{formData.email}</strong>. Please
                check your inbox to verify your request.
                <br />
                <span className="mt-2 inline-block text-[var(--color-accent)]/70">
                  ✓ Notification sent to band management
                </span>
              </p>

              <div className="flex w-full flex-col gap-3">
                <Link
                  href="/book"
                  className="transition-[background-color,color,border-color,box-shadow] inline-flex w-full items-center justify-center bg-[var(--color-accent)] px-8 py-4 shadow-[0_0_20px_rgba(255,10,61,0.3)] hover:bg-[var(--color-accent)]/80 hover:shadow-[0_0_30px_rgba(255,10,61,0.5)]"
                >
                  Book Another Show
                </Link>
                {!isLoggedIn &&
                  (creatingAccount ? (
                    <div className="border border-white/10 bg-white/[0.03] p-5 text-left">
                      <div className="mb-6">
                        <span className="block text-white/30">
                          Account Email
                        </span>
                        {editingEmail ? (
                          <div className="flex gap-2">
                            <GlowInput
                              type="email"
                              value={accountEmail}
                              onChange={(e) => setAccountEmail(e.target.value)}
                              autoFocus
                              disabled={pinSent || pinLoading}
                              wrapperClassName="flex-1"
                            />
                            <button
                              type="button"
                              onClick={() => setEditingEmail(false)}
                              className="cursor-pointer px-3"
                            >
                              Done
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span>{accountEmail}</span>
                            {!pinSent && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingEmail(true);
                                  setPinError("");
                                }}
                                className="cursor-pointer text-white/30"
                              >
                                Edit
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {!pinSent ? (
                        <div>
                          <div className="flex gap-2">
                            <GlowInput
                              type="password"
                              placeholder="Set a password (6+ chars)"
                              value={accountPassword}
                              onChange={(e) => setAccountPassword(e.target.value)}
                              disabled={pinLoading}
                              wrapperClassName="flex-1"
                            />
                            <button
                              type="button"
                              disabled={
                                !accountPassword ||
                                accountPassword.length < 6 ||
                                !accountEmail ||
                                pinLoading
                              }
                              onClick={handleSendPin}
                              className="transition-colors flex min-w-[70px] shrink-0 cursor-pointer items-center justify-center bg-[var(--color-accent)] px-5 py-3 hover:bg-[var(--color-accent)]/80 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              {pinLoading ? (
                                <span className="h-4 w-4 animate-spin border-2 border-white/10 border-t-white" />
                              ) : (
                                "Go →"
                              )}
                            </button>
                          </div>
                          <HelperText>
                            We will send a 6-digit verification code to your email.
                          </HelperText>
                        </div>
                      ) : (
                        <div>
                          <div className="mb-2 flex gap-2">
                            <GlowInput
                              type="text"
                              maxLength={6}
                              placeholder="Enter 6-digit code"
                              value={pinCode}
                              onChange={(e) =>
                                setPinCode(e.target.value.replace(/\D/g, ""))
                              }
                              disabled={pinLoading}
                              wrapperClassName="flex-1"
                              className="text-center"
                            />
                            <button
                              type="button"
                              disabled={pinCode.length !== 6 || pinLoading}
                              onClick={handleVerifyPin}
                              className="transition-colors flex min-w-[140px] shrink-0 cursor-pointer items-center justify-center bg-purple-600 px-5 py-3 hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              {pinLoading ? (
                                <span className="h-4 w-4 animate-spin border-2 border-white/10 border-t-white" />
                              ) : (
                                "Verify & Create"
                              )}
                            </button>
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <button
                              type="button"
                              onClick={handleSendPin}
                              disabled={pinLoading}
                              className="transition-colors text-[var(--color-accent)] hover:text-white disabled:opacity-40"
                            >
                              Resend Code
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setPinSent(false);
                                setPinCode("");
                                setPinError("");
                              }}
                              disabled={pinLoading}
                              className="text-white/30 hover:underline"
                            >
                              Back to Password
                            </button>
                          </div>
                        </div>
                      )}

                      {pinError && (
                        <div className="mt-3 animate-[fade-in-up_0.15s_ease-out_both] rounded-[var(--radius-box)] border border-rose-500/20 bg-rose-500/10 p-3 text-left text-rose-300">
                          ⚠️ {pinError}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setCreatingAccount(false);
                          setEditingEmail(false);
                          setPinSent(false);
                          setPinError("");
                          setPinCode("");
                        }}
                        className="transition-colors mt-4 block w-full cursor-pointer text-center text-white/30 text-white/50 hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-white/40">{formData.email}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setCreatingAccount(true);
                          setAccountEmail(accountEmail || formData.email);
                        }}
                        className="transition-colors inline-flex w-full cursor-pointer items-center justify-center border border-white/10 bg-white/[0.05] px-8 py-4 hover:border-[var(--color-accent)]/60 hover:bg-white/[0.1]"
                      >
                        Create Account
                      </button>
                    </div>
                  ))}
                <Link
                  href="/"
                  className="transition-colors inline-flex w-full items-center justify-center border border-white/10 bg-white/[0.03] px-8 py-4 hover:bg-white/[0.08]"
                >
                  Return to Homepage
                </Link>
              </div>
            </div>
          </Stack>
        </div>
      </section>
    );
  }

  return (
    <main id="book-page" className="page-container relative min-h-screen pb-12">
      <script
        id="booking-service-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(BOOKING_SERVICE_LD)
            .replace(/</g, "\\u003c")
            .replace(/>/g, "\\u003e")
            .replace(/&/g, "\\u0026"),
        }}
      />
      <header className="sr-only">
        <h1 id="book-page-title">
          {sanityContent?.heroHeading || sanityContent?.title || "Book 7th Heaven"}
        </h1>
      </header>

      <form
        id="book-event"
        className="relative z-10 mx-auto w-full grid grid-cols-1 items-start lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_460px] 2xl:grid-cols-[1fr_500px] lg:gap-6 xl:gap-8 pb-16 sm:pb-20"
        onSubmit={handleSubmit}
      >
        <div className="steps flex flex-col page-stack">
          {fromParam === "rebook" ? (
            <div className="mx-[var(--spacing-gutter)] flex items-center gap-4 rounded-[var(--radius-box)] border border-purple-500/30 bg-purple-950/40 px-6 py-4">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center">
                <Check className="h-4 w-4 text-purple-300" />
              </div>
              <div>
                <p className="font-semibold text-sm text-white">Rebooking previous event</p>
                <p className="mt-0.5 text-xs text-muted">
                  All your previous event details have been copied over. Just pick a new date and tweak anything you need.
                </p>
              </div>
            </div>
          ) : null}

          {/* Contact Information (FIRST SECTION) */}
          <PageSection
            id="contact-info"
            aria-labelledby="contact-info-heading"
            size="sm"
            containerClassName="animate-[fade-in-up_0.15s_ease-out_both]"
          >
            <SectionHeader
              as="h2"
              id="contact-info-heading"
              title={
                <div className="flex items-center gap-3 flex-wrap">
                  <span>
                    {sanityContent?.sections?.find(
                      (s: any) => s.sectionId === "contact",
                    )?.title || "Contact Information"}
                  </span>
                  <span className="text-xs font-normal text-purple-300 bg-purple-500/10 border border-purple-500/20 rounded-full px-2.5 py-0.5">
                    {isLoggedIn && (member?.role === "event_planner" || member?.role === "admin")
                      ? "Auto-filled • Fully Editable"
                      : "Auto-filled • Fully Editable"}
                  </span>
                </div>
              }
              subtitle={
                sanityContent?.sections?.find(
                  (s: any) => s.sectionId === "contact",
                )?.subtitle ||
                "Enter your contact details so our band manager can coordinate your booking and send confirmation details."
              }
              icon={User}
            />
            <Stack gap="lg">
              {/* Planner Status / Sign In Callout */}
              {isLoggedIn && (member?.role === "event_planner" || member?.role === "admin") ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-[var(--radius-box)] border border-emerald-500/30 bg-emerald-950/20 p-4 sm:p-5 shadow-[0_4px_20px_rgba(16,185,129,0.08)]">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-box)] border border-emerald-400/30 bg-emerald-500/10 text-emerald-300">
                      <Check className="h-4 w-4 text-emerald-300" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm text-white">
                          Planner Details Pre-Filled
                        </p>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Live Dashboard Sync
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted">
                        Signed in as {member.name || member.username || "Planner"}. Your contact &amp; venue specs are pre-filled and sync live with your Planner Dashboard.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <Link
                      href={member.username ? `/book/${member.username}` : "/book/demo"}
                      className="transition-colors inline-flex cursor-pointer items-center gap-1.5 rounded-[var(--radius-box)] border border-emerald-400/30 bg-emerald-600/20 px-3.5 py-2 text-xs font-medium text-emerald-200 hover:bg-emerald-600/30 hover:text-white"
                    >
                      <span>Planner Dashboard</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                    <button
                      type="button"
                      onClick={handleResetPlannerDefaults}
                      className="transition-colors inline-flex cursor-pointer items-center gap-1 rounded-[var(--radius-box)] border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/70 hover:bg-white/10 hover:text-white"
                      title="Reset fields to standard planner defaults"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>Reset</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-[var(--radius-box)] border border-purple-500/30 bg-gradient-to-r from-purple-950/50 via-purple-900/30 to-purple-950/50 p-4 sm:p-5 shadow-[0_4px_24px_rgba(168,85,247,0.12)]">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-box)] border border-purple-400/30 bg-purple-500/20 text-purple-300">
                      <Sparkles className="h-5 w-5 text-purple-300" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-white">
                        Are you signed up as a planner?
                      </p>
                      <p className="mt-0.5 text-xs text-purple-200/80">
                        Sign in for easier booking — your contact info, organization, and venue logistics will automatically pre-fill!
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => openModal("login", "planner")}
                      className="transition-all inline-flex cursor-pointer items-center gap-1.5 rounded-[var(--radius-box)] border border-purple-400/40 bg-purple-600 hover:bg-purple-500 text-white font-medium px-4 py-2 text-xs shadow-[0_0_15px_rgba(168,85,247,0.35)] hover:shadow-[0_0_20px_rgba(168,85,247,0.5)]"
                    >
                      <LogIn className="h-3.5 w-3.5" />
                      <span>Sign in as Planner</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <InputField
                  label={
                    sanityContent?.sections?.find(
                      (s: any) => s.sectionId === "contact_name",
                    )?.title || "Full Name"
                  }
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="John Smith"
                />
                <InputField
                  label={
                    sanityContent?.sections?.find(
                      (s: any) => s.sectionId === "contact_org",
                    )?.title || "Organization"
                  }
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  placeholder="Venue or company name"
                />
                <InputField
                  label={
                    sanityContent?.sections?.find(
                      (s: any) => s.sectionId === "contact_email",
                    )?.title || "Email"
                  }
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="you@email.com"
                />
                <InputField
                  label={
                    sanityContent?.sections?.find(
                      (s: any) => s.sectionId === "contact_phone",
                    )?.title || "Phone"
                  }
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="(555) 123-4567"
                />
              </div>
            </Stack>
          </PageSection>

          {/* Primary Event Schedule */}
          <PageSection
            id="step-1"
                aria-labelledby="step-1-heading"
                size="sm"
              >
                <SectionHeader
                  as="h2"
                  id="step-1-heading"
                  title={
                    <>
                      {sanityContent?.sections?.find(
                        (s: any) =>
                          s.sectionId === "schedule" ||
                          s.sectionId === "step-1",
                      )?.title || "Primary Event Schedule"}{" "}
                      <span className="text-[#c27aff]">*</span>
                    </>
                  }
                  subtitle={
                    sanityContent?.sections?.find(
                      (s: any) =>
                        s.sectionId === "schedule" ||
                        s.sectionId === "step-1",
                    )?.subtitle ||
                    "Select one or more dates on the calendar to reserve 7th Heaven."
                  }
                />
                <Stack gap="lg">
                  <CalendarPicker
                    hideHeader
                    hideFormat
                    slots={bookingSlots}
                    onChangeSlots={setBookingSlots}
                    eventStartTime={formData.eventStartTime || "6:00 PM"}
                    onEventStartTimeChange={(t) =>
                      setFormData((p) => ({ ...p, eventStartTime: t }))
                    }
                    startTime={formData.startTime}
                    onStartTimeChange={(t) => {
                      setFormData((p) => ({ ...p, startTime: t }));
                      setBookingSlots((prev) =>
                        prev.map((s) => ({ ...s, startTime: t })),
                      );
                    }}
                    endTime={formData.endTime}
                    onEndTimeChange={(t) => {
                      setFormData((p) => ({ ...p, endTime: t }));
                      setBookingSlots((prev) =>
                        prev.map((s) => ({ ...s, endTime: t })),
                      );
                    }}
                    eventEndTime={formData.eventEndTime || "11:00 PM"}
                    onEventEndTimeChange={(t) =>
                      setFormData((p) => ({ ...p, eventEndTime: t }))
                    }
                    loadInTime={formData.loadInTime}
                    onLoadInTimeChange={(t) =>
                      setFormData((p) => ({ ...p, loadInTime: t }))
                    }
                    isLoadInUnsure={isLoadInUnsure}
                    onLoadInUnsureChange={(next) => {
                      setIsLoadInUnsure(next);
                      if (next) {
                        setFormData((prev) => ({
                          ...prev,
                          loadInTime:
                            "Unsure — Band admin will confirm & email setup time",
                        }));
                      } else {
                        setFormData((prev) => ({
                          ...prev,
                          loadInTime: "",
                        }));
                      }
                    }}
                    blockedDates={blockedDates}
                    dateDetails={dateDetails}
                    labels={pickerLabels}
                    defaultVenueName={formData.venueName || ""}
                    defaultVenueCity={formData.venueCity || ""}
                    defaultVenueState={formData.venueState || ""}
                    defaultParkingAddress={formData.parkingAddress || ""}
                    defaultParkingType={formData.parkingType || "bus-trailer"}
                    defaultParkingNotes={formData.parkingNotes || ""}
                    selectedType={selectedType || "full_band"}
                    customDetails={formData.customEventType || ""}
                  />
                </Stack>
              </PageSection>

              {/* Event Format */}
              <PageSection
                id="event-format"
                aria-labelledby="event-format-heading"
                size="sm"
              >
                <SectionHeader
                  as="h2"
                  id="event-format-heading"
                  title={
                    sanityContent?.sections?.find(
                      (s: any) =>
                        s.sectionId === "formats" ||
                        s.sectionId === "format",
                    )?.title ||
                    pickerLabels?.eventFormatHeading ||
                    "Event Format"
                  }
                  subtitle={
                    sanityContent?.sections?.find(
                      (s: any) =>
                        s.sectionId === "formats" ||
                        s.sectionId === "format",
                    )?.subtitle ||
                    "Choose the performance style for your date"
                  }
                />
                <Stack gap="lg">
                  <EventFormatPicker
                    hideHeader
                    selectedType={selectedType || undefined}
                    onSelectType={(t) => {
                      setSelectedType(t);
                      setBookingSlots((prev) =>
                        prev.map((s) => ({ ...s, eventType: t || s.eventType })),
                      );
                    }}
                    customDetails={formData.customEventType}
                    onCustomDetailsChange={(d) => {
                      setFormData((p) => ({ ...p, customEventType: d }));
                      setBookingSlots((prev) =>
                        prev.map((s) => ({ ...s, customEventType: d })),
                      );
                    }}
                    labels={pickerLabels}
                  />

                  {/* Pricing hint per type */}
                  {selectedType && (
                    <div className="rounded-[var(--radius-box)] border border-purple-500/25 bg-purple-950/20 px-4 py-2.5 text-xs leading-relaxed text-white/70">
                      <span className="font-semibold text-purple-300">Pricing Guide:</span>{" "}
                      {selectedType === "full_band" &&
                        "Full band performances typically start at $3,000 depending on stage scale and production requirements."}
                      {selectedType === "unplugged" &&
                        "Unplugged acoustic sets start at $1,500. Perfect for smaller rooms or cocktail setups."}
                      {selectedType === "private" &&
                        "Private events start at $4,000. Includes custom setlist and dedicated coordination."}
                      {selectedType === "custom" &&
                        "Custom package pricing depends entirely on requirements. We'll be in touch to quote you directly."}
                    </div>
                  )}
                </Stack>
              </PageSection>

          {/* Venue Location & Parking Logistics */}
          <PageSection
            id="venue-logistics"
            aria-labelledby="venue-info-heading"
            size="sm"
          >
            <SectionHeader
              as="h2"
              id="venue-info-heading"
              title={
                sanityContent?.sections?.find(
                  (s: any) => s.sectionId === "venue",
                )?.title || "Venue Location & Parking Logistics"
              }
              subtitle={
                sanityContent?.sections?.find(
                  (s: any) =>
                    s.sectionId === "venue_address" ||
                    s.sectionId === "address",
                )?.subtitle ||
                "Provide the physical street address, city, state, and select parking / load-in access for the band bus and crew."
              }
              icon={MapPin}
            />
            <Stack gap="lg">
              {addressNotification && (
                <div className="flex animate-[fade-in_0.15s_ease-out] items-center gap-2.5 border border-purple-400/40 bg-cyan-950/70 p-3 rounded-[var(--radius-box)]">
                  <CheckCircle2 className="text-purple-400 shrink-0 h-4 w-4" />
                  <span>{addressNotification}</span>
                </div>
              )}
              {/* 2-Column Grid: Left inputs (7 cols) + Right Live Google Map (5 cols) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                {/* Left Column: Location & Parking Inputs */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                  {/* Location Inputs Block */}
                  <div className="flex flex-col gap-4 rounded-[var(--radius-box)] border border-white/10 bg-white/[0.02] p-5">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-purple-400" />
                        <h3 className="text-sm text-white">1. Physical Venue Location</h3>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4">
                      <InputField
                        label="Venue Name"
                        name="venueName"
                        value={formData.venueName}
                        onChange={handleChange}
                        required
                        placeholder="e.g. Navy Pier Grand Ballroom or Bridges Scoreboard"
                      />

                      <InputField
                        label="Street Address"
                        name="parkingAddress"
                        value={formData.parkingAddress}
                        onChange={handleChange}
                        required
                        placeholder="e.g. 600 E Grand Ave or 980 S Bartlett Rd, Lot B"
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InputField
                          label="City"
                          name="venueCity"
                          value={formData.venueCity}
                          onChange={handleChange}
                          required
                          placeholder="e.g. Chicago"
                        />
                        <InputField
                          label="State"
                          name="venueState"
                          value={formData.venueState}
                          onChange={handleChange}
                          required
                          placeholder="e.g. IL"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Parking Options Block */}
                  <div className="flex flex-col gap-4 rounded-[var(--radius-box)] border border-white/10 bg-white/[0.02] p-5">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2">
                        <Bus className="h-4 w-4 text-cyan-400" />
                        <h3 className="text-sm  text-white">2. Parking &amp; Load-In Access Options</h3>
                      </div>
                      <span className="text-[11px] text-cyan-300 font-medium">Select primary option</span>
                    </div>

                    {/* Parking Option Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {PARKING_OPTIONS.map((opt) => {
                        const Icon = opt.icon;
                        const isSelected = (formData.parkingType || "bus-trailer") === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                parkingType: opt.id,
                              }));
                            }}
                            className={`flex items-start gap-3 p-3 rounded-[var(--radius-box)] border text-left transition-all cursor-pointer ${isSelected
                              ? "border-cyan-400 bg-cyan-950/40 text-white shadow-lg shadow-cyan-950/50"
                              : "border-white/10 bg-white/[0.03] text-white/70 hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                              }`}
                          >
                            <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${isSelected ? "bg-cyan-500/20 text-cyan-300" : "bg-white/5 text-white/50"}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-xs text-white leading-tight">{opt.label}</p>
                              <p className="text-[11px] text-white/50 leading-snug mt-0.5 line-clamp-2">{opt.description}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Detailed Gate & Parking Directions Textarea */}
                    <div className="flex flex-col gap-2 pt-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <label htmlFor="parkingNotes" className="text-xs font-semibold uppercase tracking-wider text-white/60">
                          Specific Gate / Dock &amp; Load-in Instructions
                        </label>
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <button
                            type="button"
                            onClick={() => setShowMapPicker(true)}
                            className="transition-colors flex cursor-pointer items-center gap-1 text-[#c27aff] hover:text-white"
                          >
                            <MapPin className="h-3.5 w-3.5" /> Pick on Map
                          </button>
                          <span className="text-white/20">•</span>
                          <a
                            href={bookGoogleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="transition-colors flex items-center gap-1 text-cyan-300 hover:text-white hover:underline"
                          >
                            <Compass className="h-3.5 w-3.5" /> Search Google Maps ↗
                          </a>
                          <span className="text-white/20">•</span>
                          <button
                            type="button"
                            onClick={() => handleSaveCurrentAddress()}
                            className="transition-colors flex cursor-pointer items-center gap-1 text-emerald-400 hover:text-emerald-300 hover:text-white"
                          >
                            <Bookmark className="h-3.5 w-3.5" /> Save Favorite
                          </button>
                        </div>
                      </div>
                      <GlowTextarea
                        id="parkingNotes"
                        name="parkingNotes"
                        value={formData.parkingNotes}
                        onChange={handleChange}
                        rows={3}
                        placeholder="e.g. Band bus & crew truck park in West Lot behind stage. Enter through Gate 4 off Bartlett Rd. Parking passes provided by staff at gate."
                        className="focus-ring min-h-[90px] w-full resize-y border-0 bg-[#00000029] px-4 py-3 text-white text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column: Live Google Map Preview & Venue Telemetry */}
                <div className="lg:col-span-5 flex flex-col justify-between relative overflow-hidden min-h-[460px] sticky top-28 rounded-[var(--radius-box)] border border-white/10 bg-white/[0.02] p-5">
                  {/* Top Header: Title, City & View Mode Switcher */}
                  <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-rose-300 uppercase tracking-wider">
                        <MapPin className="h-4 w-4 text-rose-400" />
                        LIVE GOOGLE MAP
                      </span>
                      <span className="text-xs text-white/50">{formData.venueCity || "Chicago"}, {formData.venueState || "IL"}</span>
                    </div>

                    {/* Map View Switcher Pills */}
                    <div className="flex items-center rounded-full bg-white/[0.06] p-0.5 border border-white/10 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setBookMapMode("map")}
                        className={`px-2.5 py-0.5 rounded-full font-medium transition-all cursor-pointer ${bookMapMode === "map"
                          ? "bg-rose-500/80 text-white shadow-sm"
                          : "text-white/60 hover:text-white"
                          }`}
                      >
                        Map
                      </button>
                      <button
                        type="button"
                        onClick={() => setBookMapMode("satellite")}
                        className={`px-2.5 py-0.5 rounded-full font-medium transition-all cursor-pointer ${bookMapMode === "satellite"
                          ? "bg-rose-500/80 text-white shadow-sm"
                          : "text-white/60 hover:text-white"
                          }`}
                      >
                        Satellite
                      </button>
                      <button
                        type="button"
                        onClick={() => setBookMapMode("radar")}
                        className={`px-2.5 py-0.5 rounded-full font-medium transition-all cursor-pointer ${bookMapMode === "radar"
                          ? "bg-purple-600/80 text-white shadow-sm"
                          : "text-white/60 hover:text-white"
                          }`}
                      >
                        Radar
                      </button>
                    </div>
                  </div>

                  {/* Center Content: Interactive Google Map iframe OR Radar Telemetry */}
                  <div className="relative z-10 my-3 flex-1 min-h-[280px] rounded-[var(--radius-box)] overflow-hidden border border-white/10 bg-black/60">
                    {bookMapMode === "radar" ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                        <div className="pointer-events-none absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
                        <div className="relative flex items-center justify-center">
                          <span className="absolute h-16 w-16 rounded-full bg-rose-500/20 animate-ping" />
                          <span className="absolute h-10 w-10 rounded-full bg-rose-500/40" />
                          <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-rose-600 text-white shadow-lg shadow-rose-600/50">
                            <MapPin className="h-4 w-4" />
                          </div>
                        </div>
                        <p className="mt-3 text-sm font-bold text-white text-center">{formData.venueName || "Venue Location"}</p>
                        <p className="text-xs text-white/60 text-center">
                          {formData.parkingAddress || (formData.venueCity ? `${formData.venueCity}, ${formData.venueState || ""}` : "Address not entered yet")}
                        </p>
                      </div>
                    ) : (
                      <iframe
                        src={bookEmbedUrl}
                        title={`Google Map - ${formData.venueName || "Venue Location"}`}
                        className="absolute inset-0 h-full w-full border-0 block"
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
                      />
                    )}
                  </div>

                  {/* Bottom Venue Footer & Open in Google Maps Link */}
                  <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3 text-xs">
                    <div className="min-w-0 max-w-[65%]">
                      <p className="text-white font-semibold truncate">{formData.venueName || "Venue Not Specified Yet"}</p>
                      <p className="text-white/50 text-[11px] truncate">
                        Access: <strong className="text-cyan-300 font-medium">{PARKING_OPTIONS.find((p) => p.id === (formData.parkingType || "bus-trailer"))?.short || "Bus & Trailer"}</strong>
                      </p>
                    </div>
                    <a
                      href={bookGoogleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 text-cyan-300 hover:text-white transition-all font-medium text-xs shrink-0 cursor-pointer"
                    >
                      <span>Open in Google Maps</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Interactive Map Picker Modal */}
              <MapPickerModal
                isOpen={showMapPicker}
                onClose={() => setShowMapPicker(false)}
                initialAddress={
                  formData.parkingAddress ||
                  `${formData.venueName} ${formData.venueCity} ${formData.venueState}`.trim()
                }
                savedAddresses={savedAddresses}
                onSelectSaved={handleSelectSavedAddress}
                onSaveNewAddress={handleSaveCurrentAddress}
                onDeleteSavedAddress={handleDeleteSavedAddress}
                onSave={(savedAddr, fullData) => {
                  if (fullData && (fullData.venueName || fullData.venueCity)) {
                    handleSelectSavedAddress(fullData as SavedAddress);
                  } else {
                    setFormData((prev) => ({
                      ...prev,
                      parkingAddress: savedAddr,
                    }));
                    setAddressNotification(
                      `Updated venue address to: ${savedAddr}`,
                    );
                    setTimeout(() => setAddressNotification(null), 3000);
                  }
                }}
              />
            </Stack>
          </PageSection>

          {/* Technical & Logistics */}
          <PageSection
            id="tech-specs"
            aria-labelledby="tech-info-heading"
            size="sm"
          >
            <SectionHeader
              as="h2"
              id="tech-info-heading"
              title={
                sanityContent?.sections?.find(
                  (s: any) => s.sectionId === "logistics",
                )?.title || "Technical & Logistics"
              }
              subtitle={
                sanityContent?.sections?.find(
                  (s: any) => s.sectionId === "logistics",
                )?.subtitle ||
                "Detail venue stage setup, indoor/outdoor preferences, and sound system requirements."
              }
              icon={Sliders}
            />
            <Stack gap="4">
              <RadioPillField
                label={
                  sanityContent?.sections?.find(
                    (s: any) => s.sectionId === "logistics_indoor",
                  )?.title || "Indoor / Outdoor"
                }
                name="indoorOutdoor"
                value={formData.indoorOutdoor}
                onChange={handleChange}
                options={["Indoor", "Outdoor", "Both / Hybrid", "TBD"]}
              />
              <RadioPillField
                label={
                  sanityContent?.sections?.find(
                    (s: any) => s.sectionId === "logistics_sound",
                  )?.title || "Sound System Available?"
                }
                name="soundSystem"
                value={formData.soundSystem}
                onChange={handleChange}
                options={[
                  "Yes — full PA system",
                  "Partial — need supplemental",
                  "No — band needs to provide",
                  "Not sure",
                ]}
              />
              <RadioPillField
                label={
                  sanityContent?.sections?.find(
                    (s: any) => s.sectionId === "logistics_stage",
                  )?.title || "Stage Available?"
                }
                name="stageAvailable"
                value={formData.stageAvailable}
                onChange={handleChange}
                options={[
                  "Yes",
                  "No — performing at floor level",
                  "Portable / riser can be arranged",
                  "Not sure",
                ]}
              />
              <RadioPillField
                label={
                  sanityContent?.sections?.find(
                    (s: any) => s.sectionId === "logistics_backline",
                  )?.title || "Backline Provided?"
                }
                name="backlineProvided"
                value={formData.backlineProvided}
                onChange={handleChange}
                options={[
                  "Yes — amps, drums, etc.",
                  "Partial",
                  "No — band brings everything",
                  "Not sure",
                ]}
              />

              <div className="grid grid-cols-1 gap-8 border-t border-white/10 pt-8 md:grid-cols-2">
                <div>
                  <InputField
                    label={
                      sanityContent?.sections?.find(
                        (s: any) => s.sectionId === "attendance",
                      )?.title || "Expected Attendance"
                    }
                    name="expectedAttendance"
                    value={formData.expectedAttendance}
                    onChange={handleChange}
                    placeholder={
                      sanityContent?.sections?.find(
                        (s: any) => s.sectionId === "attendance",
                      )?.subtitle || "~200 people"
                    }
                  />
                </div>
              </div>
            </Stack>
          </PageSection>

          {/* Step 5: Additional Options (Hidden if no options defined) */}
          {(() => {
            const options = [] as {
              id: string;
              icon: string;
              label: string;
              desc: string;
            }[];
            if (options.length === 0) return null;
            return (
              <PageSection
                id="budget-extras"
                aria-labelledby="budget-info-heading"
                size="sm"
              >
                <SectionHeader
                  as="h2"
                  id="budget-info-heading"
                  title={
                    sanityContent?.sections?.find(
                      (s: any) => s.sectionId === "extras",
                    )?.title || "Production & Extras"
                  }
                  subtitle={
                    sanityContent?.sections?.find(
                      (s: any) => s.sectionId === "extras",
                    )?.subtitle ||
                    "Select any features you'd like the band to bring to your event. Pricing discussed with your band manager."
                  }
                  icon={Sparkles}
                />
                <Stack gap="lg">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {options.map((option) => {
                      const addOnsSet = new Set(addOns);
                      const isActive = addOnsSet.has(option.id);
                      return (
                        <button
                          key={option.id}
                          type="button"
                          aria-label={`Toggle ${option.label} option`}
                          onClick={() =>
                            setAddOns((prev) =>
                              isActive
                                ? prev.filter((a) => a !== option.id)
                                : [...prev, option.id],
                            )
                          }
                          className={`group flex w-full cursor-pointer items-start gap-3 border p-4 text-left ${isActive ? "border-purple-400 bg-cyan-500/20" : "border-white/10 bg-[#00000029] hover:bg-white/10"}`}
                        >
                          <span className="mt-0.5 text-xl">{option.icon}</span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="block">{option.label}</span>
                            </div>
                            <span className="block">{option.desc}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </Stack>
              </PageSection>
            );
          })()}

          {/* Notes & Questions */}
          <PageSection
            id="notes-section"
            aria-labelledby="hold-confirm-heading"
            size="sm"
          >
            <SectionHeader
              as="h2"
              id="hold-confirm-heading"
              title={
                sanityContent?.sections?.find(
                  (s: any) =>
                    s.sectionId === "notes" ||
                    s.sectionId === "notes-section" ||
                    s.sectionId === "hold-confirm",
                )?.title || "Notes & Questions"
              }
              subtitle={
                sanityContent?.sections?.find(
                  (s: any) =>
                    s.sectionId === "notes" ||
                    s.sectionId === "notes-section" ||
                    s.sectionId === "hold-confirm",
                )?.subtitle ||
                "Anything else you'd like to mention? Special requests, questions, or details for our band manager."
              }
              icon={MessageSquare}
            />
            <Stack gap="md">
              <label htmlFor="details" className="sr-only text-white/90">
                {sanityContent?.sections?.find(
                  (s: any) =>
                    s.sectionId === "notes" ||
                    s.sectionId === "notes-section" ||
                    s.sectionId === "hold-confirm",
                )?.ctaText || "Notes and Questions for Band Manager"}
              </label>
              <GlowTextarea
                id="details"
                name="details"
                aria-label={
                  sanityContent?.sections?.find(
                    (s: any) =>
                      s.sectionId === "notes" ||
                      s.sectionId === "notes-section" ||
                      s.sectionId === "hold-confirm",
                  )?.ctaText || "Notes and Questions for Band Manager"
                }
                value={formData.details}
                onChange={handleChange}
                rows={5}
                placeholder={
                  sanityContent?.sections?.find(
                    (s: any) =>
                      s.sectionId === "notes" ||
                      s.sectionId === "notes-section" ||
                      s.sectionId === "hold-confirm",
                  )?.body ||
                  "e.g. We need a specific song for the first dance, the venue has a noise curfew at 10pm, or any questions about pricing, gear, or logistics…"
                }
                className="focus-ring w-full resize-none"
                aria-describedby={formData.details ? "details-helper" : undefined}
              />
              {formData.details && (
                <HelperText id="details-helper" tone="success">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span>Note attached to your booking</span>
                </HelperText>
              )}
            </Stack>
          </PageSection>

          {/* Scheduled Shows (Multi-show configuration) - Placed as the last section */}
          <ScheduledShowsSection
            sanityContent={sanityContent}
            bookingSlots={bookingSlots}
            setBookingSlots={setBookingSlots}
            dateDetails={dateDetails}
            expandedMetadata={expandedMetadata}
            setExpandedMetadata={setExpandedMetadata}
            formData={formData}
            hasSavedForm={hasSavedForm}
            selectedType={selectedType}
          />

          {/* Honeypot */}
          <div className="hidden" aria-hidden="true">
            <input
              type="text"
              name="website"
              value={formData.website}
              onChange={(e) =>
                setFormData({ ...formData, website: e.target.value })
              }
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          {/* Form Submit Action */}
          <div className="mx-[var(--spacing-gutter)] flex items-center justify-end border-t border-white/10 pt-6">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="h-4 w-4 animate-spin border-2 border-black border-t-transparent" />
                  Submitting Request...
                </>
              ) : (
                "Submit Booking Request"
              )}
            </Button>
          </div>
        </div>

        {/* Right Column: Sticky Summary Sidebar */}
        <aside
          aria-label="Booking Summary"
          className="sticky top-25 md:mt-6 lg:mt-0 mt-6 pr-[var(--spacing-gutter)] max-lg:px-[var(--spacing-gutter)]"
        >
          {/* Vertical Timeline Progress Rail */}
          <BookingProgressTracker
            bookingSlotsCount={bookingSlots.length}
            firstSlotDate={bookingSlots[0]?.date}
            startTime={formData.startTime}
            endTime={formData.endTime}
            selectedType={selectedType}
            selectedTypeLabel={eventTypes.find((t) => t.id === selectedType)?.label}
            venueName={formData.venueName}
            venueCity={formData.venueCity}
            contactName={formData.name}
            contactEmail={formData.email}
            contactPhone={formData.phone}
          />

          <div className="rounded-[var(--radius-box)] border border-white/10 bg-purple-950/40 p-6 sm:p-7 lg:p-8 shadow-2xl backdrop-blur-md">
            <SectionHeader
              as="h3"
              title={
                sanityContent?.sections?.find(
                  (s: any) =>
                    s.sectionId === "summary" ||
                    s.sectionId === "booking-summary",
                )?.title || "Booking Summary"
              }
              subtitle={
                sanityContent?.sections?.find(
                  (s: any) =>
                    s.sectionId === "summary" ||
                    s.sectionId === "booking-summary",
                )?.subtitle ||
                "Review your selected dates, times, and venue details before submitting."
              }
              subtitleClassName="text-xs"
              icon={ClipboardList}
              action={
                <span className="rounded-full border border-purple-400/30 bg-purple-500/20 px-2.5 py-0.5 text-xs font-semibold text-purple-300">
                  Live Review
                </span>
              }
            />

            <Stack gap="md">
              <div className="flex flex-col divide-y divide-white/10 text-sm">
                <div className="flex items-start justify-between pb-3">
                  <span className="text-white/50">Date</span>
                  <span className="text-right font-medium text-white">
                    {bookingSlots.length === 1 ? (
                      new Date(
                        bookingSlots[0].date + "T12:00:00Z",
                      ).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                        timeZone: "UTC",
                      })
                    ) : bookingSlots.length > 1 ? (
                      `${bookingSlots.length} Shows Scheduled`
                    ) : (
                      <span className="text-white/30">—</span>
                    )}
                  </span>
                </div>
                <div className="flex items-start justify-between py-3">
                  <span className="text-white/50">Time</span>
                  <span className="text-right font-medium text-white">
                    {bookingSlots.length === 1 ? (
                      `${bookingSlots[0].startTime} – ${bookingSlots[0].endTime}`
                    ) : bookingSlots.length > 1 ? (
                      "Varies by show"
                    ) : (
                      <span className="text-white/30">—</span>
                    )}
                  </span>
                </div>
                <div className="flex items-start justify-between py-3">
                  <span className="text-white/50">Format</span>
                  <span className="text-right font-medium text-white">
                    {selectedType ? (
                      eventTypes.find((t) => t.id === selectedType)?.label
                    ) : (
                      <span className="text-white/30">—</span>
                    )}
                  </span>
                </div>
                <div className="flex items-start justify-between py-3">
                  <span className="text-white/50">Venue</span>
                  <span className="max-w-[240px] sm:max-w-[280px] text-right break-words font-medium text-white">
                    {formData.venueName ? (
                      formData.venueName
                    ) : (
                      <span className="text-white/30">—</span>
                    )}
                    {formData.parkingAddress && (
                      <span className="block font-normal text-white/60 text-xs mt-0.5">
                        {formData.parkingAddress}
                      </span>
                    )}
                    {formData.venueCity && (
                      <span className="block font-normal text-white/50 text-xs">
                        {formData.venueCity}, {formData.venueState}
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex items-start justify-between py-3">
                  <span className="text-white/50">Parking</span>
                  <span className="max-w-[240px] sm:max-w-[280px] text-right break-words font-medium text-white text-xs">
                    <span className="text-cyan-300">
                      {PARKING_OPTIONS.find((p) => p.id === (formData.parkingType || "bus-trailer"))?.short || "Bus & Trailer"}
                    </span>
                    {formData.parkingNotes && (
                      <span className="block font-normal text-white/50 text-[11px] mt-0.5 line-clamp-2">
                        {formData.parkingNotes}
                      </span>
                    )}
                  </span>
                </div>
                {addOns.length > 0 && (
                  <div className="flex items-start justify-between pt-3">
                    <span className="text-white/50">Add-Ons</span>
                    <div className="text-right">
                      <span className="font-medium text-white">{addOns.length} selected</span>
                      <div className="flex max-w-[240px] sm:max-w-[280px] flex-wrap justify-end gap-1.5 mt-1.5">
                        {addOns.slice(0, 3).map((id) => (
                          <span
                            key={id}
                            className="rounded bg-cyan-500/20 px-2 py-0.5 text-xs text-cyan-200"
                          >
                            {id
                              .replace(/_/g, " ")
                              .replace(/\b\w/g, (c) => c.toUpperCase())}
                          </span>
                        ))}
                        {addOns.length > 3 && (
                          <span className="text-white/40 text-xs">
                            +{addOns.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <div className="rounded-[var(--radius-box)] border border-rose-500/30 bg-rose-500/10 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-rose-400">⚠</span>
                    <span className="text-rose-300">
                      Please fix the following
                    </span>
                  </div>
                  <ul className="flex flex-col gap-1">
                    {validationErrors.map((err, i) => (
                      <li
                        key={`err-${i}-${err}`}
                        className="relative pl-5 text-rose-300 before:absolute before:left-1.5 before:text-rose-400 before:content-['•']"
                      >
                        {err}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  type="submit"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin border-2 border-black border-t-transparent" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Booking Request"
                  )}
                </Button>
                <p className="mt-4 text-center text-xs text-muted">
                  By submitting, you confirm you are 18 years of age or older and
                  agree to our{" "}
                  <Link href="/privacy" className="transition-colors hover:text-white">
                    Privacy Policy
                  </Link>{" "}
                  and{" "}
                  <Link href="/terms" className="transition-colors hover:text-white">
                    Terms
                  </Link>
                  .
                </p>
              </div>
            </Stack>
          </div>
        </aside>

      </form>
    </main>
  );
}

function MapPickerModal({
  isOpen,
  onClose,
  initialAddress,
  savedAddresses = [],
  onSelectSaved,
  onSaveNewAddress,
  onDeleteSavedAddress,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  initialAddress: string;
  savedAddresses?: SavedAddress[];
  onSelectSaved?: (item: SavedAddress) => void;
  onSaveNewAddress?: (customLabel?: string) => void;
  onDeleteSavedAddress?: (id: string) => void;
  onSave: (address: string, fullData?: Partial<SavedAddress>) => void;
}) {
  const [prevInitialAddress, setPrevInitialAddress] = useState(initialAddress);
  const [addressInput, setAddressInput] = useState(initialAddress || "");

  if (initialAddress !== prevInitialAddress) {
    setPrevInitialAddress(initialAddress);
    setAddressInput(initialAddress || "");
  }

  if (!isOpen) return null;

  return (
    <dialog
      open
      aria-labelledby="map-picker-heading"
      className="fixed inset-0 z-[999999] flex h-full max-h-none w-full max-w-none items-center justify-center border-0 bg-transparent p-4"
    >
      <button
        type="button"
        aria-label="Close location picker backdrop"
        onClick={onClose}
        className="fixed inset-0 h-full w-full cursor-default border-0 bg-black/80 backdrop-blur-2xl"
      />
      <div
        data-lenis-prevent
        className="custom-scrollbar relative z-10 max-h-[90vh] w-full max-w-2xl flex flex-col gap-6 overflow-hidden overflow-y-auto border border-purple-500/40 bg-[#0f0921] p-6"
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-[#c27aff]" />
            <h3 id="map-picker-heading">
              Google Maps Location & Address Picker
            </h3>
          </div>
          <button
            aria-label="Close modal"
            type="button"
            onClick={onClose}
            className="transition-colors cursor-pointer p-1 text-white/50 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Saved Addresses & Quick Presets List */}
        {savedAddresses.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="search-location-input"
                className="block text-purple-400"
              >
                Saved Locations & Venue Presets
              </label>
              <span className="text-[10px] font-normal text-white/50">
                Click to auto-fill form
              </span>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {savedAddresses.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className="transition-colors group flex w-full cursor-pointer items-start justify-between gap-2 border border-white/10 bg-[#00000029] p-3 text-left hover:border-purple-400/50 hover:bg-white/10"
                  onClick={() => {
                    if (onSelectSaved) {
                      onSelectSaved(item);
                      onClose();
                    } else {
                      onSave(item.parkingAddress, item);
                      onClose();
                    }
                  }}
                >
                  <div className="min-w-0 flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 shrink-0 text-[#c27aff]" />
                      <span>{item.label}</span>
                    </div>
                    <div>
                      {item.parkingAddress}{" "}
                      {item.venueCity ? `, ${item.venueCity}` : ""}
                    </div>
                  </div>
                  <div className="transition-opacity flex shrink-0 items-center gap-1 opacity-80 group-hover:opacity-100">
                    <span className="transition-colors rounded border border-purple-400/40 bg-purple-600/40 px-2 py-1 text-[10px] hover:bg-purple-600/70">
                      Use
                    </span>
                    {!item.id.startsWith("preset-") && onDeleteSavedAddress && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSavedAddress(item.id);
                        }}
                        className="transition-colors p-1 text-white/40 hover:text-red-400"
                        title="Delete saved address"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2 border-t border-white/10 pt-4">
          <label
            htmlFor="search-location-input"
            className="block text-purple-400"
          >
            Search Location or Paste Google Maps Address
          </label>
          <div className="flex gap-2">
            <GlowInput
              id="search-location-input"
              type="text"
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              placeholder="e.g. 980 S Bartlett Rd, Gate B or paste Google Maps URL"
              wrapperClassName="flex-1"
            />
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressInput || "Chicago, IL")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors inline-flex shrink-0 items-center gap-1.5 border border-purple-400/40 bg-purple-600/40 px-3.5 py-2.5 hover:bg-purple-600/60"
            >
              <Navigation className="h-3.5 w-3.5" /> Open Map
            </a>
          </div>
        </div>

        {/* Live Interactive Map Preview in Modal */}
        <div className="relative z-10 h-64 w-full rounded-lg overflow-hidden border border-white/10 bg-black/60">
          <iframe
            src={`https://maps.google.com/maps?q=${encodeURIComponent(addressInput || "Chicago, IL")}&z=15&ie=UTF8&iwloc=&output=embed`}
            title="Map Location Preview"
            className="w-full h-full border-0"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
          {onSaveNewAddress && (
            <button
              type="button"
              onClick={() => {
                if (addressInput.trim()) {
                  onSaveNewAddress(addressInput.trim());
                }
              }}
              className="flex cursor-pointer items-center gap-1.5 bg-[var(--color-accent)] px-3.5 py-2"
            >
              <Bookmark className="h-3.5 w-3.5" /> Save to Favorites
            </button>
          )}
          <div className="ml-auto flex items-center gap-3">
            <button
              type="button"
              aria-label="Cancel location picker"
              onClick={onClose}
              className="transition-colors rounded-lg bg-[#00000029] px-4 py-2.5 hover:bg-white/10 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              aria-label="Save location to form"
              onClick={() => {
                onSave(addressInput);
                onClose();
              }}
              className="transition-colors flex cursor-pointer items-center gap-1.5 bg-gradient-to-r from-purple-600 to-cyan-500 px-5 py-2.5 hover:from-purple-500 hover:to-cyan-400"
            >
              <Check className="h-4 w-4" /> Save Location to Form
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}
