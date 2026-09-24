/* eslint-disable react-doctor/no-high-complexity-react-function */
/* eslint-disable react-doctor/nextjs-no-client-fetch-for-server-data */
"use client";
import { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import Link from "next/link";
import { CalendarPicker, BookingSlot } from "@/components/CalendarPicker";
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
  Calendar as CalendarIcon,
  Plus,
  X,
  ChevronDown,
  ChevronRight,
  Megaphone,
  MapPin,
  Navigation,
  Clock,
  Compass,
  FileText,
  Bookmark,
  Save,
  CheckCircle2,
  Trash2,
  Building2,
} from "lucide-react";
import GooeyMessagesDropdown from "@/components/GooeyMessagesDropdown";
import Dropdown from "@/components/Dropdown";
import SquishyToggle from "@/components/SquishyToggle";
import SeventhButton from "@/components/SeventhButton";
import { SectionBadge } from "@/components/SectionBadge";
import InputField from "@/components/InputField";
import dynamic from "next/dynamic";

const PlannerDashboard = dynamic(() => import("@/components/PlannerDashboard"));

const eventTypes = [
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

interface SavedAddress {
  id: string;
  label: string;
  venueName: string;
  parkingAddress: string;
  venueCity: string;
  venueState: string;
  parkingNotes?: string;
}

const DEFAULT_SAVED_ADDRESSES: SavedAddress[] = [
  {
    id: "preset-1",
    label: "Bridges Scoreboard - Bartlett",
    venueName: "Bridges Scoreboard",
    parkingAddress: "980 S Bartlett Rd",
    venueCity: "Bartlett",
    venueState: "IL",
    parkingNotes:
      "Band bus park in West Lot behind stage. Enter through Gate 4 off Bartlett Rd.",
  },
  {
    id: "preset-2",
    label: "The Arcada Theatre - St. Charles",
    venueName: "The Arcada Theatre",
    parkingAddress: "105 E Main St",
    venueCity: "St. Charles",
    venueState: "IL",
    parkingNotes: "Loading dock located in alley behind venue on 1st St.",
  },
  {
    id: "preset-3",
    label: "House of Blues - Chicago",
    venueName: "House of Blues",
    parkingAddress: "329 N Dearborn St",
    venueCity: "Chicago",
    venueState: "IL",
    parkingNotes: "Stage door load-in via Marina City garage lower level.",
  },
];

import { MiniDatePicker } from "./components/MiniDatePicker";
import {
  TextAreaField,
  SelectField,
  RadioPillField,
} from "./components/BookFormFields";

export default function BookClient({ sanityContent }: { sanityContent?: any }) {
  return <BookPageContent sanityContent={sanityContent} />;
}

function BookPageContent({ sanityContent }: { sanityContent?: any }) {
  const { member, isLoggedIn, openModal, signup, login } = useMember();
  const [urlParams] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return {
        from: params.get("from"),
        tab: params.get("tab"),
      };
    }
    return { from: null, tab: null };
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

  const [selectedType, setSelectedType] = useState<string | null>(null);

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
      } catch {}
    }

    return {
      name: initialName,
      email: initialEmail,
      phone: initialPhone,
      organization: "",
      eventDate: "",
      eventStartTime: "",
      eventEndTime: "",
      startTime: "",
      endTime: "",
      customEventType: "",
      venueName: "",
      venueCity: "",
      venueState: "",
      indoorOutdoor: "",
      expectedAttendance: "",
      budget: "",
      setLength: "Full Show (3-4 hours)",
      soundSystem: "",
      stageAvailable: "",
      backlineProvided: "",
      ageRestriction: "",
      loadInTime: "",
      parkingAddress: "",
      parkingNotes: "",
      details: "",
      hearAbout: "",
      website: "", // Honeypot
    };
  });
  const [hasParkingNotes, setHasParkingNotes] = useState(false);
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
  const [blockedDates, setBlockedDates] = useState<string[]>([]);

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

  const pickerLabels = useMemo(() => {
    if (!sanityContent?.sections) return undefined;
    const formatSection = sanityContent.sections.find(
      (s: any) => s.sectionId === "formats",
    );
    const windowSection = sanityContent.sections.find(
      (s: any) => s.sectionId === "window",
    );
    const scheduleSection = sanityContent.sections.find(
      (s: any) => s.sectionId === "schedule",
    );
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
    } catch {}

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
    }));

    if (item.parkingNotes) {
      setHasParkingNotes(true);
    }

    setAddressNotification(`Loaded "${item.label}" into venue form!`);
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
    } catch {}

    if (selectedSavedAddressId === id) {
      setSelectedSavedAddressId("");
    }
  };

  // Synchronize first booking slot date to formData.eventDate for legacy/display compatibility
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      eventDate: bookingSlots[0]?.date || "",
    }));
  }, [bookingSlots]);

  const loadAvailability = useCallback(async () => {
    try {
      const r = await fetch("/api/booking/availability");
      if (r.ok) {
        const d = await r.json();
        setBlockedDates(d.blockedDates || []);
      }
    } catch {}
  }, []);

  // Fetch blocked dates on mount
  useEffect(() => {
    loadAvailability();

    try {
      const saved =
        localStorage.getItem("7h_planner_last_form_v1") ||
        localStorage.getItem("7h_planner_last_form");
      if (saved) {
        setHasSavedForm(true);
      }
    } catch {}
  }, [loadAvailability]);

  // Auto-fill from planner dashboard or rebook — pull saved form data from localStorage first
  useEffect(() => {
    if (isFromPlanner) {
      // Try to restore full form data from last booking
      try {
        const savedForm =
          localStorage.getItem("7h_planner_last_form_v1") ||
          localStorage.getItem("7h_planner_last_form");
        if (savedForm) {
          const parsed = JSON.parse(savedForm);
          setFormData((prev) => ({
            ...prev,
            ...parsed,
            // Clear date/time so user picks new ones
            eventDate: "",
            startTime: "",
            endTime: "",
            eventStartTime: "",
            eventEndTime: "",
          }));
          if (parsed.eventType) setSelectedType(parsed.eventType);

          if (fromParam === "rebook") {
            setBookingSlots([]);
            setAltDate1("");
            setAltDate2("");
          } else if (parsed.bookingSlots) {
            setBookingSlots(parsed.bookingSlots);
          } else if (parsed.eventDates) {
            setBookingSlots(
              parsed.eventDates.map((d: string) => ({
                id: Math.random().toString(36).substring(2, 9),
                date: d,
                startTime: parsed.startTime || "7:00 PM",
                endTime: parsed.endTime || "10:00 PM",
                eventType: parsed.eventType || "full_band",
              })),
            );
          } else if (parsed.eventDate) {
            setBookingSlots([
              {
                id: Math.random().toString(36).substring(2, 9),
                date: parsed.eventDate,
                startTime: parsed.startTime || "7:00 PM",
                endTime: parsed.endTime || "10:00 PM",
                eventType: parsed.eventType || "full_band",
              },
            ]);
          }
        }
      } catch {}

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
        setFormData((prev) => {
          const updated = { ...prev };
          allFields.forEach((f) => {
            const val = searchParams.get(f);
            if (val) (updated as any)[f] = val;
          });
          if (isFromPlanner) {
            if (!updated.venueName)
              updated.venueName =
                searchParams.get("venueName") || "Bridges Scoreboard";
            if (!updated.venueCity)
              updated.venueCity = searchParams.get("venueCity") || "Chicago";
            if (!updated.venueState)
              updated.venueState = searchParams.get("venueState") || "IL";
            if (!updated.organization)
              updated.organization =
                searchParams.get("organization") || "Scoreboard Entertainment";
          }
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

        if (fromParam === "rebook") {
          setBookingSlots([]);
          setAltDate1("");
          setAltDate2("");
        } else {
          const dateParam = searchParams.get("eventDate");
          const datesParam = searchParams.get("eventDates");
          if (datesParam) {
            setBookingSlots(
              datesParam.split(",").map((d: string) => ({
                id: Math.random().toString(36).substring(2, 9),
                date: d,
                startTime: searchParams.get("startTime") || "7:00 PM",
                endTime: searchParams.get("endTime") || "10:00 PM",
                eventType: searchParams.get("eventType") || "full_band",
              })),
            );
          } else if (dateParam) {
            setBookingSlots([
              {
                id: Math.random().toString(36).substring(2, 9),
                date: dateParam,
                startTime: searchParams.get("startTime") || "7:00 PM",
                endTime: searchParams.get("endTime") || "10:00 PM",
                eventType: searchParams.get("eventType") || "full_band",
              },
            ]);
          }
        }
      }
    }
  }, [isFromPlanner, fromParam]);

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
    } catch {}
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
    } catch {}

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Run validation
    const errors = validateBooking();
    if (errors.length > 0) {
      setValidationErrors(errors);
      // Scroll to top of form to show errors
      document
        .getElementById("book-event")
        ?.scrollIntoView({ behavior: "smooth" });
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
          } catch {}

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
            } catch {}
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
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
        {/* Background Glows */}
        <div className="pointer-events-none absolute top-1/2 left-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-[var(--color-accent)] opacity-[0.05] blur-3xl" />

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
              className="inline-flex w-full items-center justify-center bg-[var(--color-accent)] px-8 py-4 text-base shadow-[0_0_20px_rgba(255,10,61,0.3)] hover:bg-[var(--color-accent)]/80 hover:shadow-[0_0_30px_rgba(255,10,61,0.5)]"
            >
              Book Another Show
            </Link>
            {!isLoggedIn &&
              (creatingAccount ? (
                <div className="border border-white/10 bg-white/[0.03] p-5 text-left">
                  <div className="mb-6">
                    <span className="mb-1.5 block text-white/30">
                      Account Email
                    </span>
                    {editingEmail ? (
                      <div className="flex gap-2">
                        <input
                          type="email"
                          value={accountEmail}
                          onChange={(e) => setAccountEmail(e.target.value)}
                          autoFocus
                          disabled={pinSent || pinLoading}
                          className="focus-ring flex-1 rounded-lg border border-white/10 px-4 py-2.5 outline-none disabled:opacity-50"
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
                        <input
                          type="password"
                          placeholder="Set a password (6+ chars)"
                          value={accountPassword}
                          onChange={(e) => setAccountPassword(e.target.value)}
                          disabled={pinLoading}
                          className="placeholder: focus-ring flex-1 border border-white/10 px-4 py-3 text-white/20 outline-none disabled:opacity-50"
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
                          className="flex min-w-[70px] shrink-0 cursor-pointer items-center justify-center bg-[var(--color-accent)] px-5 py-3 hover:bg-[var(--color-accent)]/80 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {pinLoading ? (
                            <span className="h-4 w-4 animate-spin rounded-lg border-2 border-white/10 border-t-white" />
                          ) : (
                            "Go →"
                          )}
                        </button>
                      </div>
                      <p className="mt-2">
                        We will send a 6-digit verification code to your email.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="mb-2 flex gap-2">
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="Enter 6-digit code"
                          value={pinCode}
                          onChange={(e) =>
                            setPinCode(e.target.value.replace(/\D/g, ""))
                          }
                          disabled={pinLoading}
                          className="placeholder: focus-ring flex-1 border border-white/10 px-4 py-3 text-center text-white/20 outline-none disabled:opacity-50"
                        />
                        <button
                          type="button"
                          disabled={pinCode.length !== 6 || pinLoading}
                          onClick={handleVerifyPin}
                          className="flex min-w-[140px] shrink-0 cursor-pointer items-center justify-center bg-purple-600 px-5 py-3 hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {pinLoading ? (
                            <span className="h-4 w-4 animate-spin rounded-lg border-2 border-white/10 border-t-white" />
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
                          className="text-[var(--color-accent)] hover:text-white disabled:opacity-40"
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
                    <div className="mt-3 animate-[fade-in-up_0.15s_ease-out_both] border border-rose-500/20 bg-rose-500/10 p-3 text-left text-rose-300">
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
                    className="mt-4 block w-full cursor-pointer text-center text-white/30 text-white/50 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div>
                  <div className="mb-1.5 flex items-center justify-center gap-2">
                    <span className="text-white/40">{formData.email}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCreatingAccount(true);
                      setAccountEmail(accountEmail || formData.email);
                    }}
                    className="inline-flex w-full cursor-pointer items-center justify-center border border-white/10 bg-white/[0.05] px-8 py-4 text-base hover:border-[var(--color-accent)]/60 hover:bg-white/[0.1]"
                  >
                    Create Account
                  </button>
                </div>
              ))}
            <Link
              href="/"
              className="inline-flex w-full items-center justify-center border border-white/5 bg-white/[0.03] px-8 py-4 text-base hover:bg-white/[0.08]"
            >
              Return to Homepage
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <main id="book-page" className="page-container relative min-h-screen">
      <form
        id="book-event"
        className="site-container relative z-10"
        onSubmit={handleSubmit}
      >
        {isFromPlanner && (
          <div className="flex items-center gap-4 rounded-lg border border-purple-500/30 bg-purple-950/40 px-6 py-4">
            <div className="bg- purple-white/20 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#c084fc"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div>
              <p>
                {fromParam === "rebook"
                  ? "Rebooking previous event"
                  : "Profile details pre-loaded"}
              </p>
              <p>
                {fromParam === "rebook"
                  ? "All your previous event details have been copied over. Just pick a new date and tweak anything you need."
                  : "Your contact & venue info has been filled in. Just pick your date and event type."}
              </p>
            </div>
          </div>
        )}

        {hasSavedForm && !isFromPlanner && (
          <div className="relative z-10 flex animate-[fade-in-up_0.2s_ease-out_both] flex-col items-start justify-between gap-4 rounded-lg border border-purple-500/30 bg-purple-950/40 p-5 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <ClipboardList className="h-6 w-6 shrink-0" />
              <div>
                <p>Re-fill with details from your last booking?</p>
                <p className="mt-0.5">
                  We found a booking request you recently filled out. You can
                  automatically fill in your contact and venue details.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLoadLastForm}
              className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-purple-600 px-5 py-2.5 hover:bg-purple-500"
            >
              <Zap className="h-3.5 w-3.5" /> Populate
            </button>
          </div>
        )}

        {/* Step 1: Event Schedule & Format */}
        <section
          aria-label="Event Schedule and Format"
          className="relative border-0 p-0"
        >
          <header className="mb-6">
            <h1 className="mb-6">Event Schedule & Format</h1>
            <p className="mt-3 max-w-2xl">
              Select dates on the calendar to reserve 7th Heaven. You can select{" "}
              <strong>multiple dates</strong> for multi-day runs, and configure
              unique times, formats, and venue details for each date below.
            </p>
          </header>
          <div className="mb-6">
            <CalendarPicker
              label="Primary Event Schedule"
              required
              slots={bookingSlots}
              onChangeSlots={setBookingSlots}
              startTime={formData.startTime}
              onStartTimeChange={(t) =>
                setFormData((p) => ({ ...p, startTime: t }))
              }
              endTime={formData.endTime}
              onEndTimeChange={(t) =>
                setFormData((p) => ({ ...p, endTime: t }))
              }
              selectedType={selectedType || undefined}
              onSelectType={(t) => setSelectedType(t)}
              customDetails={formData.customEventType}
              onCustomDetailsChange={(d) =>
                setFormData((p) => ({ ...p, customEventType: d }))
              }
              blockedDates={blockedDates}
              labels={pickerLabels}
            />

            {/* Alternate Dates */}
            <div className="mt-6 border-0 p-0">
              <div className="mb-6 flex items-center gap-3">
                <CalendarIcon className="h-5 w-5 shrink-0 text-[#c27aff]" />
                <div>
                  <h4>Flexible? Add Backup Dates</h4>
                  <p>
                    Increase your chances — we&apos;ll try your preferred date
                    first
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <MiniDatePicker
                  label={
                    sanityContent?.sections?.find(
                      (s: any) => s.sectionId === "backup_2nd",
                    )?.title || "2nd Choice"
                  }
                  value={altDate1}
                  onChange={setAltDate1}
                />
                <MiniDatePicker
                  label={
                    sanityContent?.sections?.find(
                      (s: any) => s.sectionId === "backup_3rd",
                    )?.title || "3rd Choice"
                  }
                  value={altDate2}
                  onChange={setAltDate2}
                />
              </div>
              {(altDate1 || altDate2) && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="text-white/50">Priority:</span>
                  <span className="rounded-lg bg-white/10 px-2.5 py-0.5">
                    1st:{" "}
                    {bookingSlots.length > 0
                      ? bookingSlots
                          .map((s) =>
                            new Date(s.date + "T12:00:00").toLocaleDateString(
                              undefined,
                              { month: "short", day: "numeric" },
                            ),
                          )
                          .join(", ")
                      : "—"}
                  </span>
                  {altDate1 && (
                    <span className="rounded-lg bg-white/10 px-2.5 py-0.5">
                      2nd:{" "}
                      {new Date(altDate1 + "T12:00:00").toLocaleDateString(
                        undefined,
                        { month: "short", day: "numeric" },
                      )}
                    </span>
                  )}
                  {altDate2 && (
                    <span className="rounded-lg bg-white/10 px-2.5 py-0.5">
                      3rd:{" "}
                      {new Date(altDate2 + "T12:00:00").toLocaleDateString(
                        undefined,
                        { month: "short", day: "numeric" },
                      )}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          {/* Pricing hint per type */}
          {selectedType && (
            <div className="15 mb-6 rounded-lg border border-purple-500/30 px-5 py-3 text-base">
              <span>Pricing Guide:</span>{" "}
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
        </section>

        {/* Your Scheduled Shows (Full Width Grid) */}
        <section
          aria-label="Your Scheduled Shows"
          className="relative bg-[var(--color-section-bg)]"
        >
          {bookingSlots.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-white/10 bg-white/[0.02] p-6 text-center">
              <span className="mb-6 block text-4xl">📅</span>
              <h4 className="mb-2">
                {sanityContent?.sections?.find(
                  (s: any) => s.sectionId === "no_dates",
                )?.title || "No Dates Selected Yet"}
              </h4>
              <p className="mx-auto max-w-md">
                {sanityContent?.sections?.find(
                  (s: any) => s.sectionId === "no_dates",
                )?.subtitle ||
                  "Click one or more dates on the calendar picker in Step 1 to select dates for your tour date booking request. You can schedule multiple dates at once."}
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h4>Your Scheduled Shows</h4>
                  <p>
                    Configure individual times and formats for each show below
                  </p>
                </div>
                <span className="rounded-lg border border-purple-400/30 bg-cyan-500/20 px-3 py-1">
                  {bookingSlots.length} Show{bookingSlots.length > 1 ? "s" : ""}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {bookingSlots.map((slot, index) => {
                  const formattedDate = new Date(
                    slot.date + "T12:00:00Z",
                  ).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    timeZone: "UTC",
                  });
                  return (
                    <div
                      key={slot.id}
                      className="group relative rounded-lg border border-white/10 bg-[#00000029] p-6 hover:border-purple-400/40"
                    >
                      {/* Duplicate and Remove buttons */}
                      <div className="absolute top-4 right-4 flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            const newSlot = {
                              ...slot,
                              id: Math.random().toString(36).substring(2, 9),
                            };
                            setBookingSlots([...bookingSlots, newSlot]);
                          }}
                          className="flex cursor-pointer items-center gap-1 rounded-lg border border-white/10 bg-white/10 px-2.5 py-1 hover:border-purple-400/30 hover:bg-cyan-500/20"
                          title="Add another show on this date"
                        >
                          <Plus className="h-3 w-3" /> Add Another
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setBookingSlots(
                              bookingSlots.filter((s) => s.id !== slot.id),
                            )
                          }
                          className="flex cursor-pointer items-center gap-1 rounded-lg border border-white/10 bg-white/10 px-2.5 py-1 hover:border-rose-500/30 hover:bg-rose-500/20 hover:text-rose-400"
                          title="Remove this show"
                        >
                          <X className="h-3 w-3" /> Remove
                        </button>
                      </div>

                      <div className="mb-6">
                        <span className="mb-1 block">Show #{index + 1}</span>
                        <h5>{formattedDate}</h5>
                      </div>

                      <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
                        {/* Format */}
                        <div>
                          <label
                            htmlFor={`slot-format-${slot.id}`}
                            className="mb-1.5 block text-white/50"
                          >
                            Show Format
                          </label>
                          <Dropdown
                            id={`slot-format-${slot.id}`}
                            fullWidth={true}
                            selected={slot.eventType}
                            options={[
                              { label: "Full Band", value: "full_band" },
                              { label: "Unplugged", value: "unplugged" },
                              { label: "Private Event", value: "private" },
                              { label: "Custom Booking", value: "custom" },
                            ]}
                            onChange={(val) => {
                              const updated = bookingSlots.map((s) =>
                                s.id === slot.id ? { ...s, eventType: val } : s,
                              );
                              setBookingSlots(updated);
                            }}
                            className="w-full"
                          />
                          {slot.eventType === "custom" && (
                            <input
                              type="text"
                              placeholder="Describe show type (e.g. Street Fest)..."
                              value={slot.customEventType || ""}
                              onChange={(e) => {
                                const updated = bookingSlots.map((s) =>
                                  s.id === slot.id
                                    ? { ...s, customEventType: e.target.value }
                                    : s,
                                );
                                setBookingSlots(updated);
                              }}
                              className=".5 placeholder: focus-ring w-full rounded-lg border border-purple-400/40 bg-[#00000029] px-3 py-2 text-white/30 shadow-inner backdrop-blur-2xl outline-none"
                            />
                          )}
                        </div>

                        {/* Times */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label
                              htmlFor={`slot-start-${slot.id}`}
                              className="mb-1.5 block text-white/50"
                            >
                              Start Time
                            </label>
                            <Dropdown
                              id={`slot-start-${slot.id}`}
                              fullWidth={true}
                              selected={slot.startTime}
                              options={[
                                "12:00 PM",
                                "1:00 PM",
                                "2:00 PM",
                                "3:00 PM",
                                "4:00 PM",
                                "5:00 PM",
                                "6:00 PM",
                                "7:00 PM",
                                "8:00 PM",
                                "9:00 PM",
                                "10:00 PM",
                                "11:00 PM",
                                "12:00 AM",
                              ]}
                              onChange={(val) => {
                                const updated = bookingSlots.map((s) =>
                                  s.id === slot.id
                                    ? { ...s, startTime: val }
                                    : s,
                                );
                                setBookingSlots(updated);
                              }}
                              className="w-full"
                            />
                          </div>
                          <div>
                            <label
                              htmlFor={`slot-end-${slot.id}`}
                              className="mb-1.5 block text-white/50"
                            >
                              End Time
                            </label>
                            <Dropdown
                              id={`slot-end-${slot.id}`}
                              fullWidth={true}
                              selected={slot.endTime}
                              options={[
                                "12:00 PM",
                                "1:00 PM",
                                "2:00 PM",
                                "3:00 PM",
                                "4:00 PM",
                                "5:00 PM",
                                "6:00 PM",
                                "7:00 PM",
                                "8:00 PM",
                                "9:00 PM",
                                "10:00 PM",
                                "11:00 PM",
                                "12:00 AM",
                                "1:00 AM",
                                "2:00 AM",
                              ]}
                              onChange={(val) => {
                                const updated = bookingSlots.map((s) =>
                                  s.id === slot.id ? { ...s, endTime: val } : s,
                                );
                                setBookingSlots(updated);
                              }}
                              className="w-full"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Separate Contact/Venue details toggle buttons & form fields */}
                      <div className="mt-4 border-t border-white/10 pt-4">
                        <div className="mb-3">
                          <span className="mb-2 block text-white/50">
                            Contact & Venue Details
                          </span>
                          <div className="grid grid-cols-2 gap-1.5 rounded-lg border border-white/10 bg-black/50 p-1">
                            <button
                              type="button"
                              onClick={() => {
                                const updated = bookingSlots.map((s) =>
                                  s.id === slot.id
                                    ? {
                                        ...s,
                                        useSeparateInfo: false,
                                        contactName: "",
                                        contactEmail: "",
                                        contactPhone: "",
                                        venueName: "",
                                        venueCity: "",
                                        venueState: "",
                                      }
                                    : s,
                                );
                                setBookingSlots(updated);
                              }}
                              className={`cursor-pointer rounded-lg py-2 text-center ${!slot.useSeparateInfo ? "bg-cyan-600" : " "}`}
                            >
                              Share Main Info
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = bookingSlots.map((s) =>
                                  s.id === slot.id
                                    ? {
                                        ...s,
                                        useSeparateInfo: true,
                                        contactName:
                                          s.contactName || formData.name || "",
                                        contactEmail:
                                          s.contactEmail ||
                                          formData.email ||
                                          "",
                                        contactPhone:
                                          s.contactPhone ||
                                          formData.phone ||
                                          "",
                                        venueName:
                                          s.venueName ||
                                          formData.venueName ||
                                          "",
                                        venueCity:
                                          s.venueCity ||
                                          formData.venueCity ||
                                          "",
                                        venueState:
                                          s.venueState ||
                                          formData.venueState ||
                                          "",
                                      }
                                    : s,
                                );
                                setBookingSlots(updated);
                              }}
                              className={`cursor-pointer rounded-lg py-2 text-center ${slot.useSeparateInfo ? "bg-cyan-600" : " "}`}
                            >
                              Use Separate Info
                            </button>
                          </div>
                        </div>

                        {!slot.useSeparateInfo ? (
                          <div className="mt-2 animate-[fade-in-up_0.1s_ease-out_both] space-y-1.5 rounded-lg border border-white/10 bg-white/[0.03] p-3.5 text-white/50">
                            <div className="flex items-start justify-between gap-2">
                              <span className="mt-0.5 text-white/40">
                                Contact:
                              </span>
                              <span className="text-right break-all">
                                {formData.name || (
                                  <span className="text-white/20">(empty)</span>
                                )}
                                {formData.email && (
                                  <span className="mt-0.5 block text-white/40">
                                    {formData.email}
                                  </span>
                                )}
                              </span>
                            </div>
                            <div className="flex items-start justify-between gap-2">
                              <span className="mt-0.5 text-white/40">
                                Venue:
                              </span>
                              <span className="text-right break-all">
                                {formData.venueName || (
                                  <span className="text-white/20">(empty)</span>
                                )}
                                {(formData.venueCity ||
                                  formData.venueState) && (
                                  <span className="mt-0.5 block text-white/40">
                                    {formData.venueCity || "—"},{" "}
                                    {formData.venueState || "—"}
                                  </span>
                                )}
                              </span>
                            </div>
                            <p className="mt-2 flex items-center justify-end gap-1 border-t border-white/10 pt-1.5 text-right">
                              <span>
                                🔗 Link Active: Shares contact & venue data
                              </span>
                            </p>
                          </div>
                        ) : (
                          <div className="mt-3 animate-[fade-in-up_0.15s_ease-out_both] space-y-3 rounded-xl border border-white/10 bg-white/[0.03] p-3.5">
                            <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                              <span className="text-white/40">
                                Separate Show Info
                              </span>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = bookingSlots.map((s) =>
                                      s.id === slot.id
                                        ? {
                                            ...s,
                                            contactName: formData.name,
                                            contactEmail: formData.email,
                                            contactPhone: formData.phone,
                                            venueName: formData.venueName,
                                            venueCity: formData.venueCity,
                                            venueState: formData.venueState,
                                          }
                                        : s,
                                    );
                                    setBookingSlots(updated);
                                  }}
                                  className="cursor-pointer hover:text-white"
                                >
                                  ⚡ Copy Main
                                </button>
                                {hasSavedForm && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      try {
                                        const saved =
                                          localStorage.getItem(
                                            "7h_planner_last_form_v1",
                                          ) ||
                                          localStorage.getItem(
                                            "7h_planner_last_form",
                                          );
                                        if (saved) {
                                          const parsed = JSON.parse(saved);
                                          const updated = bookingSlots.map(
                                            (s) =>
                                              s.id === slot.id
                                                ? {
                                                    ...s,
                                                    contactName:
                                                      parsed.name ||
                                                      s.contactName,
                                                    contactEmail:
                                                      parsed.email ||
                                                      s.contactEmail,
                                                    contactPhone:
                                                      parsed.phone ||
                                                      s.contactPhone,
                                                    venueName:
                                                      parsed.venueName ||
                                                      s.venueName,
                                                    venueCity:
                                                      parsed.venueCity ||
                                                      s.venueCity,
                                                    venueState:
                                                      parsed.venueState ||
                                                      s.venueState,
                                                  }
                                                : s,
                                          );
                                          setBookingSlots(updated);
                                        }
                                      } catch {}
                                    }}
                                    className="cursor-pointer text-purple-400 hover:text-white"
                                  >
                                    ⚡ Load Last
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label
                                  htmlFor={`slot-contact-name-${slot.id}`}
                                  className="mb-1 block text-white/50"
                                >
                                  Contact Name
                                </label>
                                <input
                                  id={`slot-contact-name-${slot.id}`}
                                  type="text"
                                  placeholder="e.g. Jane Doe"
                                  value={slot.contactName || ""}
                                  onChange={(e) => {
                                    const updated = bookingSlots.map((s) =>
                                      s.id === slot.id
                                        ? { ...s, contactName: e.target.value }
                                        : s,
                                    );
                                    setBookingSlots(updated);
                                  }}
                                  className="placeholder: focus-ring w-full rounded-lg border border-white/10 bg-[#00000029] px-2.5 py-1.5 text-white/30 shadow-inner backdrop-blur-2xl outline-none"
                                />
                              </div>
                              <div>
                                <label
                                  htmlFor={`slot-contact-email-${slot.id}`}
                                  className="mb-1 block text-white/50"
                                >
                                  Contact Email
                                </label>
                                <input
                                  id={`slot-contact-email-${slot.id}`}
                                  type="email"
                                  placeholder="e.g. jane@email.com"
                                  value={slot.contactEmail || ""}
                                  onChange={(e) => {
                                    const updated = bookingSlots.map((s) =>
                                      s.id === slot.id
                                        ? { ...s, contactEmail: e.target.value }
                                        : s,
                                    );
                                    setBookingSlots(updated);
                                  }}
                                  className="placeholder: focus-ring w-full rounded-lg border border-white/10 bg-[#00000029] px-2.5 py-1.5 text-white/30 shadow-inner backdrop-blur-2xl outline-none"
                                />
                              </div>
                            </div>

                            <div>
                              <label
                                htmlFor={`slot-venue-name-${slot.id}`}
                                className="mb-1 block text-white/50"
                              >
                                Venue Name
                              </label>
                              <input
                                id={`slot-venue-name-${slot.id}`}
                                type="text"
                                placeholder="e.g. House of Blues"
                                value={slot.venueName || ""}
                                onChange={(e) => {
                                  const updated = bookingSlots.map((s) =>
                                    s.id === slot.id
                                      ? { ...s, venueName: e.target.value }
                                      : s,
                                  );
                                  setBookingSlots(updated);
                                }}
                                className="placeholder: focus-ring w-full rounded-lg border border-white/10 bg-[#00000029] px-2.5 py-1.5 text-white/30 shadow-inner backdrop-blur-2xl outline-none"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label
                                  htmlFor={`slot-venue-city-${slot.id}`}
                                  className="mb-1 block text-white/50"
                                >
                                  City
                                </label>
                                <input
                                  id={`slot-venue-city-${slot.id}`}
                                  type="text"
                                  placeholder="Chicago"
                                  value={slot.venueCity || ""}
                                  onChange={(e) => {
                                    const updated = bookingSlots.map((s) =>
                                      s.id === slot.id
                                        ? { ...s, venueCity: e.target.value }
                                        : s,
                                    );
                                    setBookingSlots(updated);
                                  }}
                                  className="placeholder: focus-ring w-full rounded-lg border border-white/10 bg-[#00000029] px-2.5 py-1.5 text-white/30 shadow-inner backdrop-blur-2xl outline-none"
                                />
                              </div>
                              <div>
                                <label
                                  htmlFor={`slot-venue-state-${slot.id}`}
                                  className="mb-1 block text-white/50"
                                >
                                  State
                                </label>
                                <input
                                  id={`slot-venue-state-${slot.id}`}
                                  type="text"
                                  placeholder="IL"
                                  value={slot.venueState || ""}
                                  onChange={(e) => {
                                    const updated = bookingSlots.map((s) =>
                                      s.id === slot.id
                                        ? { ...s, venueState: e.target.value }
                                        : s,
                                    );
                                    setBookingSlots(updated);
                                  }}
                                  className="placeholder: focus-ring w-full rounded-lg border border-white/10 bg-[#00000029] px-2.5 py-1.5 text-white/30 shadow-inner backdrop-blur-2xl outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 border-t border-white/10 pt-4">
                        <button
                          type="button"
                          aria-label="Toggle tour page details"
                          onClick={() =>
                            setExpandedMetadata((prev) => ({
                              ...prev,
                              [slot.id]: !prev[slot.id],
                            }))
                          }
                          className="flex w-full items-center justify-between text-left hover:text-purple-400"
                        >
                          <span className="flex items-center gap-1.5">
                            <Megaphone className="h-3.5 w-3.5" /> Tour Page
                            Details{" "}
                            {expandedMetadata[slot.id] ? (
                              <ChevronDown className="inline h-3.5 w-3.5" />
                            ) : (
                              <ChevronRight className="inline h-3.5 w-3.5" />
                            )}
                          </span>
                          <span className="font-normal text-white/40 lowercase">
                            (optional: age limit, tickets, notes)
                          </span>
                        </button>

                        {expandedMetadata[slot.id] && (
                          <BookingSlotMetadataSection
                            slot={slot}
                            bookingSlots={bookingSlots}
                            setBookingSlots={setBookingSlots}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>

        {/* Step 2: Contact Information */}
        <section
          aria-label="Contact Information"
          className="relative animate-[fade-in-up_0.15s_ease-out_both] border-0"
        >
          <h2 className="flex items-center gap-3 pb-3">
            {sanityContent?.sections?.find(
              (s: any) => s.sectionId === "contact",
            )?.title || "Contact Information"}
          </h2>
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
        </section>

        {/* Step 3: Venue Details & Event Schedule */}
        <section
          aria-label="Venue and Event Logistics"
          className="relative animate-[fade-in-up_0.15s_ease-out_both] space-y-6 border-0 p-0"
        >
          {/* Show Event Start & End Times + Band Schedule */}
          <div className="space-y-4">
            <div className="border-b border-white/10">
              <h2 className="flex items-center gap-3 pb-3">
                <MapPin className="h-5 w-5 text-[#c27aff]" /> Venue & Event
                Logistics
              </h2>
            </div>

            {/* Row 1: Overall Event Start & End */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <InputField
                label="Event Start Time"
                name="eventStartTime"
                value={formData.eventStartTime}
                onChange={handleChange}
                placeholder="e.g. 5:00 PM (Doors / Event Starts)"
              />
              <InputField
                label="Event End Time"
                name="eventEndTime"
                value={formData.eventEndTime}
                onChange={handleChange}
                placeholder="e.g. 11:30 PM (Event Ends)"
              />
            </div>

            {/* Row 2: Band Load-In & Band Performance Start / End */}
            <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-3">
              <InputField
                label="Band Start Time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                required
                placeholder="e.g. 7:00 PM (Band Plays)"
              />
              <InputField
                label="Band End Time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                required
                placeholder="e.g. 10:30 PM (Band Finish)"
              />

              <div>
                <InputField
                  label="Load-in / Setup Time"
                  name="loadInTime"
                  value={
                    isLoadInUnsure
                      ? "Unsure — Band admin will confirm & email setup time"
                      : formData.loadInTime
                  }
                  onChange={handleChange}
                  disabled={isLoadInUnsure}
                  placeholder="e.g. 5:00 PM (2 hrs before)"
                  labelRight={
                    <div className="flex items-center gap-1.5">
                      <SquishyToggle
                        id="toggle-loadin-unsure"
                        checked={isLoadInUnsure}
                        onChange={(next) => {
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
                        label="Unsure?"
                      />
                      <span className="text-[#c27aff]">Unsure?</span>
                    </div>
                  }
                />
                <p className="mt-1.5">
                  Band load-in is usually ~2 hours before band start time.
                </p>
              </div>
            </div>

            {isLoadInUnsure && (
              <div className="flex animate-[fade-in-up_0.15s_ease-out_both] items-start gap-3 rounded-lg border border-purple-500/40 bg-purple-950/40 p-3.5 text-purple-200">
                <div className="space-y-1">
                  <span className="block">
                    Unsure of exact load-in time? No problem!
                  </span>
                  <span className="block">
                    Our 7th Heaven band booking admin will coordinate your event
                    schedule, update the load-in setup time, and send a
                    confirmation email directly to the planner.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Venue Address & Location Picker */}
          <div className="space-y-5">
            <div className="border-b border-white/10 pb-3">
              <h2 className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#c27aff]" /> Venue Address &
                Location Setup
              </h2>
            </div>

            {addressNotification && (
              <div className="flex animate-[fade-in_0.15s_ease-out] items-center gap-2.5 rounded-lg border border-purple-400/40 bg-cyan-950/70 p-3">
                <CheckCircle2 className="text-purple-400shrink-0 h-4 w-4" />
                <span>{addressNotification}</span>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <InputField
                label="Venue Name"
                name="venueName"
                value={formData.venueName}
                onChange={handleChange}
                required
                placeholder="Venue name (e.g. Bridges Scoreboard)"
              />
              <InputField
                label="City"
                name="venueCity"
                value={formData.venueCity}
                onChange={handleChange}
                required
                placeholder="Chicago"
              />

              <InputField
                label="State"
                name="venueState"
                value={formData.venueState}
                onChange={handleChange}
                required
                placeholder="IL"
              />

              {/* Row 2 Right: SquishyToggle for custom parking directions */}
              <div className="flex flex-wrap items-end gap-2.5 pb-0.5 md:flex-nowrap">
                <div className="flex items-center gap-3 rounded-lg px-3.5 py-2 text-[#c27aff] shadow-inner select-none">
                  <SquishyToggle
                    id="toggle-parking-notes"
                    checked={hasParkingNotes}
                    onChange={(next) => {
                      setHasParkingNotes(next);
                      if (!next) {
                        setFormData((prev) => ({ ...prev, parkingNotes: "" }));
                      }
                    }}
                    label="Add custom parking directions"
                  />
                  <span>Add custom parking directions</span>
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
                      `Updated parking address to: ${savedAddr}`,
                    );
                    setTimeout(() => setAddressNotification(null), 3000);
                  }
                }}
              />

              {/* Row 4: Parking location link & directions expands when checkbox is checked */}
              {hasParkingNotes && (
                <div className="animate-[fade-in-up_0.15s_ease-out_both] space-y-4 rounded-xl border border-purple-500/30 bg-purple-950/20 p-4 md:col-span-2">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label htmlFor="parkingAddress" className="block">
                        Google Maps Parking Location or Link
                      </label>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowMapPicker(true)}
                          className="hover: flex cursor-pointer items-center gap-1 text-[#c27aff] hover:text-white"
                        >
                          <MapPin className="h-3.5 w-3.5" /> Pick on Map
                        </button>
                        <span className="text-white/20">•</span>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            [
                              formData.parkingAddress || formData.venueName,
                              formData.venueCity,
                              formData.venueState,
                              "parking",
                            ]
                              .filter(Boolean)
                              .join(" ") || "Chicago IL parking",
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 hover:text-purple-200 hover:underline"
                        >
                          <Compass className="h-3.5 w-3.5" /> Search Google Maps
                          ↗
                        </a>
                        <span className="text-white/20">•</span>
                        <button
                          type="button"
                          onClick={() => handleSaveCurrentAddress()}
                          className="flex cursor-pointer items-center gap-1 text-emerald-400 hover:text-emerald-300 hover:text-white"
                        >
                          <Bookmark className="h-3.5 w-3.5" /> Save Link
                        </button>
                      </div>
                    </div>
                    <div className="input-glow-border rounded-lg">
                      <input
                        aria-label="Google Maps Parking Location Link"
                        id="parkingAddress"
                        name="parkingAddress"
                        type="text"
                        value={formData.parkingAddress}
                        onChange={handleChange}
                        placeholder="Paste Google Maps URL or parking lot address (e.g. https://maps.google.com/?q=... or Gate B West Lot)"
                        className="placeholder: focus-ring w-full rounded-lg border-0 bg-[#00000029] px-4 py-3 text-white/30"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="parkingNotes" className="block">
                      Directions for Parking
                    </label>
                    <div className="input-glow-border rounded-lg">
                      <textarea
                        id="parkingNotes"
                        name="parkingNotes"
                        value={formData.parkingNotes}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Write directions or parking instructions here (e.g. Band bus park in West Lot behind stage. Enter through Gate 4 off Bartlett Rd. Parking passes provided by staff at gate.)"
                        className="placeholder: focus-ring min-h-[90px] w-full resize-y rounded-lg border-0 bg-[#00000029] px-4 py-3 text-white/30"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Steps 4-6 and Sidebar 2-Column Grid */}
        <section className="py-section-fluid grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_360px]">
          <div className="flex flex-col gap-6">
            {/* Step 4: Technical & Logistics */}
            <section
              aria-label="Technical and Logistics"
              className="relative border-0 pt-10"
            >
              <h2 className="flex items-center gap-3 pb-3">
                {sanityContent?.sections?.find(
                  (s: any) => s.sectionId === "logistics",
                )?.title || "Technical & Logistics"}
              </h2>
              <div className="flex flex-col gap-6">
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
              </div>
            </section>

            {/* Step 5: Additional Options */}
            <section
              aria-label="Production Extras and Add-Ons"
              className="relative border-0 p-0"
            >
              <h2 className="mb-2 flex items-center gap-3">
                {sanityContent?.sections?.find(
                  (s: any) => s.sectionId === "extras",
                )?.title || "Production & Extras"}
              </h2>
              <p>
                {sanityContent?.sections?.find(
                  (s: any) => s.sectionId === "extras",
                )?.subtitle ||
                  "Select any features you'd like the band to bring to your event. Pricing discussed with your band manager."}
              </p>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {(() => {
                  const addOnsSet = new Set(addOns);
                  return (
                    [] as {
                      id: string;
                      icon: string;
                      label: string;
                      desc: string;
                    }[]
                  ).map((option) => {
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
                        className={`group flex w-full cursor-pointer items-start gap-3 rounded-lg border p-4 text-left ${isActive ? "border-purple-400 bg-cyan-500/20" : "border-white/10 bg-[#00000029] hover:bg-white/10"}`}
                      >
                        <span className="mt-0.5 text-xl">{option.icon}</span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`block text-base ${isActive ? " " : " "}`}
                            >
                              {option.label}
                            </span>
                            {isActive && (
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#38bdf8"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </div>
                          <span className="block">{option.desc}</span>
                        </div>
                      </button>
                    );
                  });
                })()}
              </div>
              {addOns.length > 0 && (
                <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-white/10 pt-4">
                  <span className="text-white/50">Selected:</span>
                  {addOns.map((id) => (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-purple-400/30 bg-cyan-500/20 px-3 py-1 text-base"
                    >
                      {id
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (c) => c.toUpperCase())}
                      <button
                        type="button"
                        aria-label={`Remove ${id.replace(/_/g, " ")} option`}
                        onClick={() =>
                          setAddOns((prev) => prev.filter((a) => a !== id))
                        }
                        className="ml-0.5 cursor-pointer text-white/50"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </section>

            {/* Step 6: Notes & Questions */}
            <section
              aria-label="Notes and Questions"
              className="relative border-0 p-0"
            >
              <h2 className="mb-2 flex items-center gap-3">
                {sanityContent?.sections?.find(
                  (s: any) => s.sectionId === "notes",
                )?.title || "Notes & Questions"}
              </h2>
              <p className="mb-6">
                {sanityContent?.sections?.find(
                  (s: any) => s.sectionId === "notes",
                )?.subtitle ||
                  "Anything else you'd like to mention? Special requests, questions, or details for our band manager."}
              </p>
              <div className="input-glow-border rounded-lg">
                <label htmlFor="details" className="sr-only text-white/90">
                  Notes and Questions for Band Manager
                </label>
                <textarea
                  id="details"
                  name="details"
                  value={formData.details}
                  onChange={handleChange}
                  rows={5}
                  placeholder={
                    sanityContent?.sections?.find(
                      (s: any) => s.sectionId === "notes",
                    )?.body ||
                    "e.g. We need a specific song for the first dance, the venue has a noise curfew at 10pm, or any questions about pricing, gear, or logistics…"
                  }
                  className="placeholder: focus-ring w-full resize-none rounded-lg border-0 bg-[#00000029] px-4 py-3 text-base text-white/40"
                />
              </div>
              {formData.details && (
                <div className="mt-3 flex items-center gap-2 text-base text-emerald-400">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Note attached to your booking</span>
                </div>
              )}
            </section>

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
          </div>

          {/* Right Column: Sticky Summary Sidebar */}
          <aside aria-label="Booking Summary" className="sticky top-32">
            <div className="border-0 p-0">
              <h3 className="mb-6 border-b border-white/10 pb-4">
                Booking Summary
              </h3>

              <div className="mb-8 flex flex-col">
                <div className="flex items-start justify-between">
                  <span className="text-white/50">Date</span>
                  <span className="text-right">
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
                <div className="flex items-start justify-between">
                  <span className="text-white/50">Time</span>
                  <span className="text-right">
                    {bookingSlots.length === 1 ? (
                      `${bookingSlots[0].startTime} – ${bookingSlots[0].endTime}`
                    ) : bookingSlots.length > 1 ? (
                      "Varies by show"
                    ) : (
                      <span className="text-white/30">—</span>
                    )}
                  </span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-white/50">Format</span>
                  <span className="text-right">
                    {selectedType ? (
                      eventTypes.find((t) => t.id === selectedType)?.label
                    ) : (
                      <span className="/30">—</span>
                    )}
                  </span>
                </div>
                <div className="flex items-start justify-between border-t border-white/10 pt-4">
                  <span className="text-white/50">Venue</span>
                  <span className="max-w-[150px] text-right break-words">
                    {formData.venueName ? (
                      formData.venueName
                    ) : (
                      <span className="text-white/30">—</span>
                    )}
                    {formData.venueCity && (
                      <span className="block text-base font-normal text-white/50">
                        {formData.venueCity}, {formData.venueState}
                      </span>
                    )}
                  </span>
                </div>
                {addOns.length > 0 && (
                  <div className="flex items-start justify-between border-t border-white/10 pt-4">
                    <span className="text-white/50">Add-Ons</span>
                    <div className="text-right">
                      <span>{addOns.length} selected</span>
                      <div className="flex max-w-[160px] flex-wrap justify-end gap-1">
                        {addOns.slice(0, 3).map((id) => (
                          <span
                            key={id}
                            className="rounded bg-cyan-500/20 px-1.5 py-0.5"
                          >
                            {id
                              .replace(/_/g, " ")
                              .replace(/\b\w/g, (c) => c.toUpperCase())}
                          </span>
                        ))}
                        {addOns.length > 3 && (
                          <span className="text-white/40">
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
                <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-rose-400">⚠</span>
                    <span className="text-rose-300">
                      Please fix the following
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {validationErrors.map((err, i) => (
                      <li
                        key={`err-${i}-${err}`}
                        className="relative pl-5 text-base text-rose-300 before:absolute before:left-1.5 before:text-rose-400 before:content-['•']"
                      >
                        {err}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <SeventhButton
                type="submit"
                icon={false}
                disabled={
                  submitting ||
                  !selectedType ||
                  bookingSlots.length === 0 ||
                  !formData.startTime ||
                  !formData.endTime ||
                  !formData.email
                }
                className="w-full rounded-lg py-4 text-base disabled:cursor-not-allowed disabled:opacity-40"
              >
                {submitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-lg border-2 border-white/10 border-t-white" />
                    Submitting...
                  </>
                ) : (
                  "Submit Booking Request"
                )}
              </SeventhButton>
              <p className="mt-4 text-center">
                By submitting, you confirm you are 18 years of age or older and
                agree to our{" "}
                <Link href="/privacy" className="hover:text-white">
                  Privacy Policy
                </Link>{" "}
                and{" "}
                <Link href="/terms" className="hover:text-white">
                  Terms
                </Link>
                .
              </p>
            </div>
          </aside>
        </section>
      </form>
    </main>
  );
}

function BookingSlotMetadataSection({
  slot,
  bookingSlots,
  setBookingSlots,
}: {
  slot: any;
  bookingSlots: any[];
  setBookingSlots: (s: any[]) => void;
}) {
  return (
    <div className="mt-4 animate-[fade-in-up_0.15s_ease-out_both] space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label
            htmlFor={`slot-age-limit-${slot.id}`}
            className="mb-1 block text-white/50"
          >
            Age Limit
          </label>
          <Dropdown
            id={`slot-age-limit-${slot.id}`}
            fullWidth={true}
            selected={slot.ageRestriction || "all_ages"}
            options={[
              { label: "All Ages", value: "all_ages" },
              { label: "21 & Over", value: "21_plus" },
              { label: "18 & Over", value: "18_plus" },
            ]}
            onChange={(val) => {
              const updated = bookingSlots.map((s) =>
                s.id === slot.id ? { ...s, ageRestriction: val } : s,
              );
              setBookingSlots(updated);
            }}
            className="w-full"
          />
        </div>
        <div>
          <label
            htmlFor={`slot-doors-time-${slot.id}`}
            className="mb-1 block text-white/50"
          >
            Doors Time
          </label>
          <Dropdown
            id={`slot-doors-time-${slot.id}`}
            fullWidth={true}
            placeholder="Same as Start"
            selected={slot.doorsTime || ""}
            options={[
              "Same as Start",
              "12:00 PM",
              "1:00 PM",
              "2:00 PM",
              "3:00 PM",
              "4:00 PM",
              "5:00 PM",
              "6:00 PM",
              "7:00 PM",
              "8:00 PM",
              "9:00 PM",
              "10:00 PM",
              "11:00 PM",
              "12:00 AM",
            ]}
            onChange={(val) => {
              const updated = bookingSlots.map((s) =>
                s.id === slot.id ? { ...s, doorsTime: val } : s,
              );
              setBookingSlots(updated);
            }}
            className="w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label
            htmlFor={`slot-cover-${slot.id}`}
            className="mb-1 block text-white/50"
          >
            Cover / Price
          </label>
          <input
            id={`slot-cover-${slot.id}`}
            type="text"
            placeholder="e.g. Free, $15..."
            value={slot.cover || ""}
            onChange={(e) => {
              const updated = bookingSlots.map((s) =>
                s.id === slot.id ? { ...s, cover: e.target.value } : s,
              );
              setBookingSlots(updated);
            }}
            className="placeholder: focus-ring w-full rounded-lg border border-white/10 bg-[#00000029] px-3 py-2 text-white/30 shadow-inner backdrop-blur-2xl outline-none"
          />
        </div>
        <div>
          <label
            htmlFor={`slot-ticket-link-${slot.id}`}
            className="mb-1 block text-white/50"
          >
            Ticket Link
          </label>
          <input
            id={`slot-ticket-link-${slot.id}`}
            type="text"
            placeholder="https://..."
            value={slot.ticketLink || ""}
            onChange={(e) => {
              const updated = bookingSlots.map((s) =>
                s.id === slot.id ? { ...s, ticketLink: e.target.value } : s,
              );
              setBookingSlots(updated);
            }}
            className="placeholder: focus-ring w-full rounded-lg border border-white/10 bg-[#00000029] px-3 py-2 text-white/30 shadow-inner backdrop-blur-2xl outline-none"
          />
        </div>
      </div>
    </div>
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
      <div className="relative z-10 max-h-[90vh] w-full max-w-2xl space-y-5 overflow-hidden overflow-y-auto rounded-lg border border-purple-500/40 bg-[#0f0921] p-6">
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
            className="cursor-pointer p-1 text-white/50 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Saved Addresses & Quick Presets List */}
        {savedAddresses.length > 0 && (
          <div className="space-y-2.5">
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
                  className="group flex w-full cursor-pointer items-start justify-between gap-2 rounded-lg border border-white/10 bg-[#00000029] p-3 text-left hover:border-purple-400/50 hover:bg-white/10"
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
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 shrink-0 text-[#c27aff]" />
                      <span>{item.label}</span>
                    </div>
                    <div>
                      {item.parkingAddress}{" "}
                      {item.venueCity ? `, ${item.venueCity}` : ""}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1 opacity-80 group-hover:opacity-100">
                    <span className="r rounded border border-purple-400/40 bg-purple-600/40 px-2 py-1 text-[10px] hover:bg-purple-600/70">
                      Use
                    </span>
                    {!item.id.startsWith("preset-") && onDeleteSavedAddress && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSavedAddress(item.id);
                        }}
                        className="p-1 text-white/40 hover:text-red-400"
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

        <div className="space-y-2 border-t border-white/10 pt-4">
          <label
            htmlFor="search-location-input"
            className="block text-purple-400"
          >
            Search Location or Paste Google Maps Address
          </label>
          <div className="flex gap-2">
            <input
              id="search-location-input"
              type="text"
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              placeholder="e.g. 980 S Bartlett Rd, Gate B or paste Google Maps URL"
              className="focus-ring flex-1 rounded-lg border border-white/10 bg-[#00000029] px-4 py-2.5"
            />
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressInput || "Chicago, IL")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-purple-400/40 bg-purple-600/40 px-3.5 py-2.5 hover:bg-purple-600/60"
            >
              <Navigation className="h-3.5 w-3.5" /> Open Map
            </a>
          </div>
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
              className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-[var(--color-accent)] px-3.5 py-2"
            >
              <Bookmark className="h-3.5 w-3.5" /> Save to Favorites
            </button>
          )}
          <div className="ml-auto flex items-center gap-3">
            <button
              type="button"
              aria-label="Cancel location picker"
              onClick={onClose}
              className="rounded-lg bg-[#00000029] px-4 py-2.5 hover:bg-white/10 hover:text-white"
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
              className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 px-5 py-2.5 hover:from-purple-500 hover:to-cyan-400"
            >
              <Check className="h-4 w-4" /> Save Location to Form
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}
