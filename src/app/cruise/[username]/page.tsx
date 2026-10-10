/* eslint-disable react-doctor/no-giant-component */
/* eslint-disable react-doctor/no-high-complexity-react-function */
"use client";
/* oxlint-disable react-doctor/nextjs-no-client-side-redirect */
/* eslint-disable react-doctor/nextjs-no-client-side-redirect */

import { useMember } from "@/context/MemberContext";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useCallback, useRef } from "react";
import DOMPurify from "dompurify";
import CruiseChat from "@/components/CruiseChat";
import {
  EmbarkationCountdown,
  ImportantLinksWidget,
  BookingManager,
} from "@/components/CruiseWidgets";
import { createClient } from "@/lib/supabase/client";
import { formatPhoneDisplay } from "@/lib/validation";
import dynamic from "next/dynamic";
import PushAlertsCard from "@/components/PushAlertsCard";
import SegmentedTabs from "@/components/SegmentedTabs";
import MemberHeaderBadge from "@/components/MemberHeaderBadge";
import GlowInput from "@/components/GlowInput";
import { SectionHeader } from "@/components/SectionHeader";

const CruiseSnakeItinerary = dynamic(
  () => import("@/components/CruiseSnakeItinerary"),
  { ssr: false },
);
import {
  ITINERARY_2027,
  ITINERARY_2028,
  mapToSnakeItinerary,
} from "@/app/cruise/cruiseData";
import { cleanWysiwygHtml } from "@/lib/wysiwyg-cleaner";
import { sanitizeHtml } from "@/lib/sanitize-html";

const ITIN_YEAR_TABS: { id: 2027 | 2028; label: string }[] = [
  { id: 2027, label: "2027 Star of the Seas (7-Night)" },
  { id: 2028, label: "2028 Legend of the Seas (8-Night)" },
];
const ReactQuill = dynamic(
  async () => {
    if (typeof window !== "undefined") {
      const id = "quill-snow-css";
      if (!document.getElementById(id)) {
        const link = document.createElement("link");
        link.id = id;
        link.rel = "stylesheet";
        link.href =
          "https://cdn.jsdelivr.net/npm/react-quill-new@2.0.0/dist/quill.snow.css";
        document.head.appendChild(link);
      }
    }
    return import("react-quill-new");
  },
  { ssr: false },
);

type ItineraryEvent = {
  id: string;
  time: string;
  title: string;
  subtitle: string;
};
type ItineraryDay = {
  id: string;
  dayLabel: string;
  location: string;
  theme: string;
  events: ItineraryEvent[];
  colorTheme: string;
};

const DEFAULT_CARIBBEAN_ITINERARY: ItineraryDay[] = [
  {
    id: "day1",
    dayLabel: "Day 1 · Sun Jan 10",
    location: "Port Canaveral, Florida (Orlando)",
    theme: "Welcome Aboard & Sail Away",
    colorTheme: "#06b6d4",
    events: [
      {
        id: "e1-1",
        time: "12:00 PM",
        title: "VIP Boarding & Check-In",
        subtitle: "Port Canaveral Terminal (Orlando)",
      },
      {
        id: "e1-2",
        time: "4:30 PM",
        title: "Ship Depart & Lido Deck Sail Away",
        subtitle: "Set sail with 7th Heaven live acoustic kick-off",
      },
      {
        id: "e1-3",
        time: "9:00 PM",
        title: "7th Heaven: The Classics Live",
        subtitle: "Main Theater — First full rock set!",
      },
    ],
  },
  {
    id: "day2",
    dayLabel: "Day 2 · Mon Jan 11",
    location: "Day At Sea",
    theme: "Rock the Ocean",
    colorTheme: "#3b82f6",
    events: [
      {
        id: "e2-1",
        time: "11:00 AM",
        title: "Q&A Session with 7th Heaven",
        subtitle: "Main Theater — Ask the band anything!",
      },
      {
        id: "e2-2",
        time: "3:00 PM",
        title: "Acoustic Poolside Jam",
        subtitle: "Lido Deck Pool — Sunshine & acoustic vibes",
      },
      {
        id: "e2-3",
        time: "10:00 PM",
        title: "Late Night Rock Karaoke",
        subtitle: "Star Lounge — Sing with band members",
      },
    ],
  },
  {
    id: "day3",
    dayLabel: "Day 3 · Tue Jan 12",
    location: "Celebrity Reflection / CocoCay",
    theme: "Island Party",
    colorTheme: "#10b981",
    events: [
      {
        id: "e3-1",
        time: "9:00 AM",
        title: "Disembark at Private Island",
        subtitle: "Beach day, watersports & tropical drinks",
      },
      {
        id: "e3-2",
        time: "1:00 PM",
        title: "Beachside Concert",
        subtitle: "Private Island Stage — Barefoot rock show!",
      },
      {
        id: "e3-3",
        time: "5:00 PM",
        title: "All Aboard — Sail for St. Thomas",
        subtitle: "Lido Deck sunset party",
      },
    ],
  },
  {
    id: "day4",
    dayLabel: "Day 4 · Wed Jan 13",
    location: "Charlotte Amalie, St. Thomas",
    theme: "Tropical Excursions",
    colorTheme: "#f59e0b",
    events: [
      {
        id: "e4-1",
        time: "8:00 AM",
        title: "Dock at St. Thomas",
        subtitle: "Explore Magens Bay, shopping & catamaran tours",
      },
      {
        id: "e4-2",
        time: "4:30 PM",
        title: "All Aboard St. Thomas",
        subtitle: "Prep for 80s Rock Theme Night",
      },
      {
        id: "e4-3",
        time: "9:00 PM",
        title: "80s Rock Costume Party & Show",
        subtitle: "Main Theater — Dress in your best 80s gear!",
      },
    ],
  },
  {
    id: "day5",
    dayLabel: "Day 5 · Thu Jan 14",
    location: "Philipsburg, St. Maarten",
    theme: "Island Vibes & Acoustic Sunset",
    colorTheme: "#9333ea",
    events: [
      {
        id: "e5-1",
        time: "8:00 AM",
        title: "Dock at Philipsburg, St. Maarten",
        subtitle: "Maho Beach plane watching & shopping",
      },
      {
        id: "e5-2",
        time: "5:00 PM",
        title: "Ship Departs St. Maarten",
        subtitle: "Set sail for evening theater show",
      },
      {
        id: "e5-3",
        time: "9:00 PM",
        title: "7th Heaven Unplugged: Deep Cuts",
        subtitle: "Intimate acoustic theater performance",
      },
    ],
  },
  {
    id: "day6",
    dayLabel: "Day 6 · Fri Jan 15",
    location: "Day At Sea",
    theme: "Caribbean Cruising",
    colorTheme: "#ec4899",
    events: [
      {
        id: "e6-1",
        time: "1:00 PM",
        title: "Fan Rock Trivia & Prize Raffle",
        subtitle: "Win autographed merchandise & VIP passes",
      },
      {
        id: "e6-2",
        time: "4:00 PM",
        title: "Deck Party & Cocktail Hour",
        subtitle: "Poolside grooves with 7th Heaven",
      },
      {
        id: "e6-3",
        time: "9:30 PM",
        title: "Rock the Ocean Showcase",
        subtitle: "Main Deck Concert",
      },
    ],
  },
  {
    id: "day7",
    dayLabel: "Day 7 · Sat Jan 16",
    location: "Day At Sea",
    theme: "Grand Finale Celebration",
    colorTheme: "#8b5cf6",
    events: [
      {
        id: "e7-1",
        time: "2:00 PM",
        title: "Farewell Fan Photo & Autographs",
        subtitle: "Deck 5 Atrium",
      },
      {
        id: "e7-2",
        time: "9:00 PM",
        title: "7th Heaven Farewell Concert",
        subtitle: "Grand Theater — All the mega hits!",
      },
      {
        id: "e7-3",
        time: "11:30 PM",
        title: "After-Party Jam Session",
        subtitle: "Lounge 360",
      },
    ],
  },
  {
    id: "day8",
    dayLabel: "Day 8 · Sun Jan 17",
    location: "Port Canaveral, Florida (Orlando)",
    theme: "Disembarkation & Farewell",
    colorTheme: "#64748b",
    events: [
      {
        id: "e8-1",
        time: "6:00 AM",
        title: "Ship Arrives Port Canaveral",
        subtitle: "Docking at Orlando Cruise Terminal",
      },
      {
        id: "e8-2",
        time: "8:00 AM",
        title: "Farewell Breakfast & Disembarkation",
        subtitle: "Safe travels home — see you next voyage!",
      },
    ],
  },
];

const DEFAULT_PASSENGERS = [
  { id: "p-1", name: "John", extra: 0, initial: "J" },
  { id: "p-2", name: "Jake", extra: 0, initial: "J" },
  { id: "p-3", name: "Jake", extra: 0, initial: "J" },
  { id: "p-4", name: "John", extra: 3, initial: "J" },
  { id: "p-5", name: "Anonymous", extra: 0, initial: "?" },
  { id: "p-6", name: "Test", extra: 0, initial: "T" },
  { id: "p-7", name: "Cruise", extra: 21, initial: "C" },
  { id: "p-8", name: "Tester", extra: 1, initial: "T" },
  { id: "p-9", name: "Super", extra: 1, initial: "S" },
  { id: "p-10", name: "Michael", extra: 1, initial: "M" },
  { id: "p-11", name: "Tester", extra: 1, initial: "T" },
  { id: "p-12", name: "Anonymous", extra: 0, initial: "?" },
  { id: "p-13", name: "Alice", extra: 0, initial: "A" },
  { id: "p-14", name: "Cruise", extra: 0, initial: "C" },
  { id: "p-15", name: "Michael", extra: 0, initial: "M" },
  { id: "p-16", name: "E2E", extra: 0, initial: "E" },
  { id: "p-17", name: "Michael", extra: 0, initial: "M" },
  { id: "p-18", name: "d", extra: 1, initial: "D" },
  { id: "p-19", name: "Test", extra: 2, initial: "T" },
  { id: "p-20", name: "Test", extra: 1, initial: "T" },
];

function PassengersWidget() {
  const passengers = DEFAULT_PASSENGERS;
  const totalCount = 412;

  const topAvatars = passengers.slice(0, 12);
  const extraAvatarsCount = Math.max(0, totalCount - topAvatars.length);

  return (
    <div className="group relative overflow-hidden">
      <SectionHeader
        id="community-heading"
        title="Community"
        subtitle={
          <span className="flex items-center gap-2">
            <span className="text-xl font-bold text-white">{totalCount}</span>
            <span className="text-xs text-purple-300 font-medium">
              Cruise Members Onboard
            </span>
          </span>
        }
        divider={false}
      />

      {/* Avatar Circle Row */}
      <div className="relative z-10 mb-4 flex flex-wrap items-center -space-x-2">
        {topAvatars.map((p) => (
          <div
            key={`avatar-${p.id}`}
            title={`${p.name}${p.extra > 0 ? ` +${p.extra}` : ""}`}
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-purple-400/40 bg-gradient-to-br from-purple-800/60 via-indigo-900/80 to-purple-950/90 text-xs font-semibold text-purple-200 shadow-md backdrop-blur-sm transition-transform hover:z-20 hover:scale-110"
          >
            {p.initial}
          </div>
        ))}
        {extraAvatarsCount > 0 && (
          <div
            title={`${extraAvatarsCount} more cruisers onboard`}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-purple-400/40 bg-purple-950/90 font-bold text-purple-200 shadow-md backdrop-blur-sm z-10 ${extraAvatarsCount > 99 ? "text-[8px] tracking-tighter" : "text-[10px]"
              }`}
          >
            +{extraAvatarsCount}
          </div>
        )}
      </div>

      {/* Member Names Dot-Separated List */}
      <div className="relative z-10 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11px] sm:text-xs text-white/60">
        {passengers.map((p, idx) => (
          <div key={`passenger-${p.id}`} className="inline-flex items-center">
            <span>
              {p.name}
              {p.extra > 0 && <span className="ml-0.5 text-purple-300 font-medium">+{p.extra}</span>}
            </span>
            {idx < passengers.length - 1 && (
              <span className="mr-0.5 ml-1.5 text-white/20">·</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const loadCruiseItineraryData = async (): Promise<any[]> => {
  try {
    const res = await fetch(`/api/cruise/itinerary?t=${Date.now()}`, {
      cache: "no-store",
    });
    const data = res.ok ? await res.json() : null;
    if (!data) return mapToSnakeItinerary(ITINERARY_2027);
    let actualData = data;
    let attempts = 0;
    while (typeof actualData === "string" && attempts < 3) {
      try {
        actualData = JSON.parse(actualData);
      } catch {
        break;
      }
      attempts++;
    }
    if (Array.isArray(actualData) && actualData.length > 0) {
      return actualData;
    }
    return mapToSnakeItinerary(ITINERARY_2027);
  } catch {
    return mapToSnakeItinerary(ITINERARY_2027);
  }
};

const loadCruiseAnnouncementData = async (): Promise<{
  message: string;
  title: string;
} | null> => {
  try {
    const res = await fetch(`/api/cruise/announcement?t=${Date.now()}`, {
      cache: "no-store",
    });
    const data = res.ok ? await res.json() : null;
    let actualData = data;
    let attempts = 0;
    while (typeof actualData === "string" && attempts < 3) {
      try {
        actualData = JSON.parse(actualData);
      } catch {
        break;
      }
      attempts++;
    }
    if (actualData?.message) {
      const subj = actualData?.subject || actualData?.title || "";
      return { message: actualData.message, title: subj };
    }
    return null;
  } catch {
    return null;
  }
};

const loadCruiseGuidelinesData = async (): Promise<{
  title: string;
  subtitle: string;
  content: string;
} | null> => {
  try {
    const res = await fetch(`/api/cruise/guidelines?t=${Date.now()}`, {
      cache: "no-store",
    });
    const data = res.ok ? await res.json() : null;
    if (data?.title) {
      return {
        title: data.title || "Cruise Information & Guidelines",
        subtitle: data.subtitle || "Cruiser Welcome Pack",
        content: data.content || "",
      };
    }
    return null;
  } catch {
    return null;
  }
};

export default function CruiseDashboard() {
  const { isLoggedIn, member, login, signup } = useMember();
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();

  const urlUsername =
    typeof params?.username === "string" ? params.username : "";
  const isDemoMode = urlUsername === "demo";

  useEffect(() => {
    if (
      !isDemoMode &&
      isLoggedIn &&
      member?.role === "cruise" &&
      member?.username &&
      member.username !== urlUsername
    ) {
      router.replace(`/cruise/${member.username}`);
    }
  }, [isDemoMode, isLoggedIn, member, urlUsername, router]);

  const [announcement, setAnnouncement] = useState<string | null>(null);
  const [announcementTitle, setAnnouncementTitle] = useState<string>("");
  const [announcementTitleInput, setAnnouncementTitleInput] =
    useState<string>("");
  const [isEditingAnnouncement, setIsEditingAnnouncement] = useState(false);
  const [announcementInput, setAnnouncementInput] = useState("");

  const [itinerary, setItinerary] = useState<ItineraryDay[]>(
    DEFAULT_CARIBBEAN_ITINERARY,
  );

  // Auth panel states
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [authError, setAuthError] = useState("");
  const [regSuccess, setRegSuccess] = useState(false);
  const [verifyingPin, setVerifyingPin] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [activeItinYear, setActiveItinYear] = useState<2027 | 2028>(2027);

  const rawUsername = params?.username
    ? String(params.username)
    : "cruise_guest";
  const derivedName =
    member?.name ||
    rawUsername.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const showAuth = false; // Always grant access on /cruise/[username]
  const effectiveMember = isDemoMode
    ? ({
      id: "demo-cruise-001",
      name: "Demo Cruiser",
      email: "demo@7thheavenband.com",
      role: "cruise",
      signup_source: "cruise_member_signup",
      username: "demo",
      avatar: "DC",
    } as any)
    : member && member.role === "cruise"
      ? {
        ...member,
        avatar:
          member.avatar ||
          (rawUsername.toLowerCase().includes("michael")
            ? "/images/crew/michaelscimeca.png"
            : undefined),
      }
      : ({
        id: `cruise-${rawUsername}`,
        name:
          rawUsername.toLowerCase().includes("michael") ||
            member?.email?.toLowerCase().includes("michael")
            ? "Michael Scimeca"
            : member?.name || derivedName || "Cruise Guest",
        email:
          member?.email ||
          (rawUsername.toLowerCase().includes("michael")
            ? "michael@7thheaven.com"
            : `${rawUsername.toLowerCase()}@7thheaven.com`),
        role: "cruise",
        signup_source: "cruise_member_signup",
        username: rawUsername,
        avatar:
          rawUsername.toLowerCase().includes("michael") ||
            member?.email?.toLowerCase().includes("michael")
            ? "/images/crew/michaelscimeca.png"
            : member?.avatar ||
            (member?.name || derivedName || "CG")
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2),
      } as any);
  const isAdmin =
    effectiveMember?.role === "admin" ||
    effectiveMember?.role === "crew" ||
    member?.role === "admin";

  const refreshCruiseData = useCallback(() => {
    let isMounted = true;

    Promise.all([
      loadCruiseItineraryData(),
      loadCruiseAnnouncementData(),
      loadCruiseGuidelinesData(),
    ]).then(([itinData, annData, guideData]) => {
      if (!isMounted) return;
      setItinerary(itinData);

      if (annData) {
        setAnnouncement(annData.message);
        setAnnouncementInput(annData.message);
        setAnnouncementTitle(annData.title);
        setAnnouncementTitleInput(annData.title);
      } else {
        setAnnouncement(null);
        setAnnouncementInput("");
        setAnnouncementTitle("");
        setAnnouncementTitleInput("");
      }

      if (guideData) {
        setGuidelines(guideData);
        setGuidelinesTitleInput(guideData.title);
        setGuidelinesSubtitleInput(guideData.subtitle);
        setGuidelinesContentInput(guideData.content);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (showAuth) return;
    return refreshCruiseData();
  }, [showAuth, refreshCruiseData]);

  const [guidelines, setGuidelines] = useState<{
    title: string;
    subtitle: string;
    content: string;
  }>({
    title: "Cruise Information & Guidelines",
    subtitle: "Cruiser Welcome Pack",
    content: `<p>Welcome to the official 7th Heaven Cruise Passenger Portal! We are absolutely thrilled to have you join us for this one-of-a-kind rock-and-roll voyage. This portal is your exclusive gateway to everything happening during our journey, designed to keep you connected with the band, the crew, and your fellow passengers from the moment you book until we return to port.</p><p>As we prepare to embark, make sure you review the official <a href="/cruise">travel check-list</a> and itinerary details. From shipboard safety drills to themed concert nights, staying informed ensures you won't miss a single beat of the action. Keep an eye on the Captain's Log and priority updates above for any real-time adjustments or exciting announcements from the band.</p><p>Onboard entertainment is the heart of the 7th Heaven cruise experience. We have a stellar lineup of main stage concert performances, intimate acoustic lounge sets, Q&A sessions, and exclusive deck parties scheduled throughout the trip. Be sure to check the <a href="#itinerary">official itinerary schedule</a> below to plan your days and nights around these highlight events.</p><p>Beyond the music, this cruise offers incredible opportunities to explore beautiful tropical destinations, coordinate group excursions, and participate in fun community activities. Whether you are relaxing by the pool, dining with friends, or exploring local ports of call, there is always something exciting to do with the 7th Heaven community.</p><p>Lastly, don't forget to use the Passenger Lounge Chat on the right to introduce yourself, coordinate plans, and share your excitement! Connecting with other fans before and during the cruise is a huge part of what makes this trip so special. We can't wait to see you onboard and rock the high seas together!</p>`,
  });
  const [isEditingGuidelines, setIsEditingGuidelines] = useState(false);
  const [guidelinesTitleInput, setGuidelinesTitleInput] = useState("");
  const [guidelinesSubtitleInput, setGuidelinesSubtitleInput] = useState("");
  const [guidelinesContentInput, setGuidelinesContentInput] = useState("");
  const [sanitizedGuidelinesContent, setSanitizedGuidelinesContent] =
    useState("");

  useEffect(() => {
    if (guidelines.content && typeof window !== "undefined") {
      const clean = cleanWysiwygHtml(guidelines.content);
      setSanitizedGuidelinesContent(DOMPurify.sanitize(clean));
    }
  }, [guidelines.content]);

  const isSavingGuidelinesRef = useRef(false);
  const handleSaveGuidelines = async () => {
    if (isSavingGuidelinesRef.current) return;
    isSavingGuidelinesRef.current = true;
    try {
      const cleanContent = cleanWysiwygHtml(guidelinesContentInput);
      const res = await fetch("/api/cruise/guidelines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: guidelinesTitleInput,
          subtitle: guidelinesSubtitleInput,
          content: cleanContent,
        }),
      });
      if (res.ok) {
        setGuidelines({
          title: guidelinesTitleInput,
          subtitle: guidelinesSubtitleInput,
          content: cleanContent,
        });
        setIsEditingGuidelines(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      isSavingGuidelinesRef.current = false;
    }
  };

  const [sanitizedAnnouncement, setSanitizedAnnouncement] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (announcement && typeof window !== "undefined") {
      const clean = cleanWysiwygHtml(announcement);
      setSanitizedAnnouncement(DOMPurify.sanitize(clean));
    } else {
      setSanitizedAnnouncement(null);
    }
  }, [announcement]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setAuthError("Email and Password are required.");
      return;
    }
    setSubmitting(true);
    setAuthError("");
    try {
      const success = await login(email, password);
      if (!success) {
        setAuthError("Invalid email or password.");
      }
    } catch (err: any) {
      setAuthError(err.message || "An error occurred during log in.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !phone) {
      setAuthError("All fields are required.");
      return;
    }
    if (password.length < 6) {
      setAuthError("Password must be at least 6 characters.");
      return;
    }
    setSubmitting(true);
    setAuthError("");
    try {
      const res = await fetch("/api/cruise/register-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "request",
          name,
          email,
          phone,
          password,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setVerifyingPin(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setAuthError(data.error || "Failed to submit registration request.");
      }
    } catch (err: any) {
      setAuthError(err.message || "An error occurred during registration.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyPinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput) {
      setAuthError("PIN code is required.");
      return;
    }
    setSubmitting(true);
    setAuthError("");
    try {
      const res = await fetch("/api/cruise/register-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "confirm",
          email,
          pin: pinInput,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const success = await login(email, password);
        if (success) {
          setVerifyingPin(false);
          setPinInput("");
        } else {
          setAuthError(
            "Verification successful, but automatic log in failed. Please sign in via the Log In tab.",
          );
          setVerifyingPin(false);
          setAuthTab("login");
        }
      } else {
        const data = await res.json().catch(() => ({}));
        setAuthError(data.error || "Verification failed.");
      }
    } catch (err: any) {
      setAuthError(err.message || "An error occurred during verification.");
    } finally {
      setSubmitting(false);
    }
  };

  const isSavingAnnouncementRef = useRef(false);
  const handleSaveAnnouncement = async () => {
    if (isSavingAnnouncementRef.current) return;
    isSavingAnnouncementRef.current = true;
    try {
      const res = await fetch("/api/cruise/announcement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: announcementInput,
          subject: announcementTitleInput,
        }),
      });
      if (res.ok) {
        setAnnouncement(announcementInput || null);
        setAnnouncementTitle(announcementTitleInput || "");
        setIsEditingAnnouncement(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      isSavingAnnouncementRef.current = false;
    }
  };

  if (isLoggedIn === undefined)
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );

  if (showAuth) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-32 pb-20">
        {/* Subtle background elements */}
        <div className="pointer-events-none absolute top-1/4 left-1/4 h-[400px] w-[400px] bg-[var(--color-accent)]/5 blur-3xl" />
        <div className="pointer-events-none absolute right-1/4 bottom-1/4 h-[400px] w-[400px] bg-cyan-500/5 blur-3xl" />

        <div className="relative z-10 w-full max-w-md animate-[fadeIn_0.3s_ease-out]">
          <div className="title-group title-group--page items-center text-center mb-8">
            <h1>Cruise Hub</h1>
            <p>Exclusive Passenger Community</p>
          </div>

          <div className="overflow-hidden border border-black/10 bg-white">
            {verifyingPin ? (
              <div className="animate-[fadeIn_0.3s_ease-out] p-8">
                <div className="mb-6 text-center">
                  <span className="mb-3 block animate-[pulse_1.5s_infinite] text-4xl">
                    🔑
                  </span>
                  <div className="title-group title-group--sub items-center text-center">
                    <h3>Verify Your Email</h3>
                    <p className="text-black/60">
                      We've sent a 6-digit verification PIN to{" "}
                      <strong>{email}</strong>. Enter it below to activate your
                      account.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleVerifyPinSubmit} className="flex flex-col gap-4">
                  <div>
                    <GlowInput
                      id="cruise-user-pin-input"
                      label="6-Digit Verification PIN"
                      type="text"
                      required
                      placeholder="123456"
                      maxLength={6}
                      value={pinInput}
                      onChange={(e) =>
                        setPinInput(e.target.value.replace(/\D/g, ""))
                      }
                      wrapperClassName="w-full"
                      className="text-center"
                    />
                  </div>

                  {authError && (
                    <p className="mt-2 text-center text-rose-500">
                      {authError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="transition-colors mt-4 flex w-full cursor-pointer items-center justify-center gap-2 bg-purple-600 py-3 shadow-purple-600/30 hover:bg-purple-500 disabled:opacity-50"
                  >
                    {submitting ? (
                      <span className="h-4 w-4 animate-spin border-2 border-white/10 border-t-white" />
                    ) : (
                      "Verify PIN & Access Hub →"
                    )}
                  </button>

                  <div className="mt-4 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setVerifyingPin(false);
                        setAuthError("");
                      }}
                      className="cursor-pointer text-[var(--font-size-2xs)] text-black/40"
                    >
                      ← Cancel and Back
                    </button>
                  </div>
                </form>
              </div>
            ) : regSuccess ? (
              <div className="animate-[fadeIn_0.3s_ease-out] p-8 text-center">
                <span className="mb-6 block text-4xl">📧</span>
                <div className="title-group title-group--sub items-center text-center mb-6">
                  <h3>Check Your Email</h3>
                  <p className="text-black/60">
                    We've sent a verification link to{" "}
                    <strong className="text-black">{email}</strong>. Please check
                    your inbox and click the link to activate your Cruise Hub
                    account.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setRegSuccess(false);
                    setAuthTab("login");
                  }}
                  className="transition-colors w-full cursor-pointer border border-black/10 bg-gray-50 py-2.5 text-black/80 hover:bg-gray-100"
                >
                  Go to Log In
                </button>
              </div>
            ) : (
              <>
                {/* Tabs */}
                <div className="flex border-b border-black/10">
                  <button
                    onClick={() => {
                      setAuthTab("login");
                      setAuthError("");
                    }}
                    className={`flex-1 cursor-pointer py-4 ${authTab === "login" ? "border-b-2 border-purple-500 bg-gray-50" : "text-black/40 hover:text-black/70"}`}
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => {
                      setAuthTab("register");
                      setAuthError("");
                    }}
                    className={`flex-1 cursor-pointer py-4 ${authTab === "register" ? "border-b-2 border-purple-500 bg-gray-50" : "text-black/40 hover:text-black/70"}`}
                  >
                    Register
                  </button>
                </div>

                <div className="p-6 md:p-8">
                  {authTab === "login" ? (
                    <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
                      <p className="mb-6 text-black/50">
                        Sign in using your Cruise Hub credentials to access your
                        booking, lounge chat, and itinerary.
                      </p>
                      <div>
                        <GlowInput
                          id="cruise-hub-login-email"
                          label="Email Address"
                          type="email"
                          required
                          placeholder="name@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          wrapperClassName="w-full"
                        />
                      </div>
                      <div>
                        <GlowInput
                          id="cruise-hub-login-password"
                          label="Password"
                          type="password"
                          required
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          wrapperClassName="w-full"
                        />
                      </div>

                      {authError && (
                        <p className="mt-2 text-rose-500">{authError}</p>
                      )}

                      <button
                        type="submit"
                        disabled={submitting}
                        className="transition-colors mt-4 flex w-full cursor-pointer items-center justify-center gap-2 bg-purple-600 py-3 shadow-purple-600/30 hover:bg-purple-500 disabled:opacity-50"
                      >
                        {submitting ? (
                          <span className="h-4 w-4 animate-spin border-2 border-white/10 border-t-white" />
                        ) : (
                          "Access Cruise Hub →"
                        )}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4">
                      <p className="mb-6 text-black/50">
                        Sign up as a Cruise Member to register for the priority
                        booking list and unlock access to the hub.
                      </p>
                      <div>
                        <GlowInput
                          id="cruise-hub-reg-name"
                          label="Full Legal Name *"
                          type="text"
                          required
                          placeholder="John Doe"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          wrapperClassName="w-full"
                        />
                      </div>
                      <div>
                        <GlowInput
                          id="cruise-hub-reg-email"
                          label="Email Address *"
                          type="email"
                          required
                          placeholder="name@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          wrapperClassName="w-full"
                        />
                      </div>
                      <div>
                        <GlowInput
                          id="cruise-hub-reg-phone"
                          label="Phone Number *"
                          type="tel"
                          required
                          placeholder="(555) 123-4567"
                          value={phone}
                          onChange={(e) =>
                            setPhone(formatPhoneDisplay(e.target.value))
                          }
                          wrapperClassName="w-full"
                        />
                      </div>
                      <div>
                        <GlowInput
                          id="cruise-hub-reg-password"
                          label="Choose Password *"
                          type="password"
                          required
                          placeholder="Min 6 characters"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          wrapperClassName="w-full"
                        />
                      </div>

                      {authError && (
                        <p className="mt-2 text-rose-500">{authError}</p>
                      )}

                      <button
                        type="submit"
                        disabled={submitting}
                        className="transition-[filter] mt-4 flex w-full cursor-pointer items-center justify-center gap-2 bg-[var(--color-accent)] py-3 hover:brightness-110 disabled:opacity-50"
                      >
                        {submitting ? (
                          <span className="h-4 w-4 animate-spin border-2 border-white/10 border-t-white" />
                        ) : (
                          "Register & Access Hub →"
                        )}
                      </button>
                    </form>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="mt-6 text-center">
            <Link href="/cruise" className="text-black/40">
              ← Back to Cruise Information
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="site-container page-container page-stack min-h-screen selection:bg-cyan-500 selection:text-black">
      <header className="pb-3 flex flex-col justify-between gap-8 border-b border-white/10 md:flex-row">
        <MemberHeaderBadge
          name={effectiveMember?.name || "Cruise Guest"}
          email={effectiveMember?.email || ""}
          avatar={effectiveMember?.avatar}
          badgeLabel="Cruise"
          badgeColorClass="bg-sky-500 border-sky-400/50"
        />

        <div className="shrink-0">
          <EmbarkationCountdown />
        </div>
      </header>

      {/* Main Cruise Dashboard Section */}
      <section id="cruise-info" aria-labelledby="cruise-info-heading" className="section">
        <h2 id="cruise-info-heading" className="sr-only">Cruise Dashboard</h2>
        <div className="w-full">
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
            {/* Main Content Column (Left 2 Cols) */}
            <div className="flex max-w-full min-w-0 flex-col gap-8 lg:col-span-2">
              {/* 1. Cruise Information & Guidelines */}
              <article className="h-fit max-w-full min-w-0 overflow-hidden">
                <div className="relative z-10 max-w-full min-w-0">
                  <SectionHeader
                    id="cruise-guidelines-heading"
                    title={guidelines.title}
                    subtitle={
                      <span className="text-purple-400">
                        {guidelines.subtitle}
                      </span>
                    }
                    divider={true}
                    action={
                      isAdmin && !isEditingGuidelines ? (
                        <button
                          type="button"
                          onClick={() => {
                            setGuidelinesTitleInput(guidelines.title);
                            setGuidelinesSubtitleInput(guidelines.subtitle);
                            setGuidelinesContentInput(guidelines.content);
                            setIsEditingGuidelines(true);
                          }}
                          className="transition-colors cursor-pointer border border-purple-500/30 px-3 py-1.5 hover:text-white"
                        >
                          ✏️ Edit Guidelines
                        </button>
                      ) : undefined
                    }
                  />

                  {isEditingGuidelines ? (
                    <div className="max-w-full min-w-0 flex flex-col gap-4">
                      <div>
                        <GlowInput
                          id="cruise-hub-guidelines-title"
                          label="Section Title"
                          type="text"
                          value={guidelinesTitleInput}
                          onChange={(e) =>
                            setGuidelinesTitleInput(e.target.value)
                          }
                          wrapperClassName="w-full"
                        />
                      </div>
                      <div>
                        <GlowInput
                          id="cruise-hub-guidelines-sub"
                          label="Subtitle / Badge"
                          type="text"
                          value={guidelinesSubtitleInput}
                          onChange={(e) =>
                            setGuidelinesSubtitleInput(e.target.value)
                          }
                          wrapperClassName="w-full"
                          className="text-purple-400"
                        />
                      </div>
                      <div>
                        <span className="mb-1 block text-white/50">
                          Content (WYSIWYG - Reflects Live Card Colors)
                        </span>
                        <div className="guidelines-wysiwyg-editor w-full [&_.ql-editor]:min-h-[180px]">
                          <ReactQuill
                            theme="snow"
                            value={guidelinesContentInput}
                            onChange={setGuidelinesContentInput}
                            placeholder="Type guidelines & welcome pack information here..."
                            className="form-input overflow-hidden"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setIsEditingGuidelines(false)}
                          className="transition-colors cursor-pointer bg-white/10 px-4 py-2 hover:bg-white/20"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveGuidelines}
                          className="transition-colors cursor-pointer bg-purple-600 px-5 py-2 shadow-purple-600/30 hover:bg-purple-500"
                        >
                          Save Guidelines
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="max-w-full min-w-0 flex flex-col gap-4 overflow-hidden [overflow-wrap:break-word] break-words [hyphens:manual] [&_a]:underline-offset-4 [&_p]:max-w-full"
                      dangerouslySetInnerHTML={{
                        __html:
                          sanitizedGuidelinesContent ||
                          sanitizeHtml(cleanWysiwygHtml(guidelines.content)),
                      }}
                    />
                  )}
                </div>
              </article>

              {/* 2. Priority Status & Cabin Booking Details */}
              <BookingManager email={effectiveMember?.email} />

              {/* 3. Important Links */}
              <ImportantLinksWidget />
            </div>

            {/* Right Sidebar Column (1 Col) */}
            <aside
              aria-label="Passenger Community & Lounge"
              className="lg:col-span-1"
            >
              <div className="flex flex-col gap-6">
                <CruiseChat
                  memberOverride={effectiveMember}
                  className="h-[750px] min-h-[600px]"
                />
                <PassengersWidget />
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* 4. Official Winding Snake Itinerary Timeline — Full Width */}
      <section
        id="itinerary"
        aria-labelledby="itinerary-heading"
        className="section relative pb-20"
      >
        <div
          className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen max-w-[100vw] overflow-x-clip"
        >
          {/* Background layer with edge mask (text remains unmasked above in z-10) */}
          <div className="pointer-events-none absolute inset-0 z-0 cruise-itinerary-backdrop" />

          <div className="relative z-10">
            <div className="site-container mb-6 w-full text-left">
              <SectionHeader
                id="itinerary-heading"
                title={
                  <>
                    Day-by-Day{" "}
                    <span className="accent-gradient-text">Schedules</span>
                  </>
                }
                subtitle="Explore daily port calls, cruising coordinates, sail-away party times, and exclusive fan concerts."
                divider={false}
              />

              {/* Itinerary Year Toggle */}
              <div className="hide-scrollbar mt-6 max-w-full overflow-x-auto">
                <SegmentedTabs
                  layout="flex"
                  shape="full"
                  size="md"
                  ariaLabel="Itinerary year"
                  className="inline-flex w-max shrink-0 flex-nowrap"
                  tabs={ITIN_YEAR_TABS}
                  activeTab={activeItinYear}
                  onChange={setActiveItinYear}
                />
              </div>
            </div>

            <div className="w-full">
              <CruiseSnakeItinerary
                key={`itin-${activeItinYear}`}
                itinerary={mapToSnakeItinerary(
                  activeItinYear === 2027 ? ITINERARY_2027 : ITINERARY_2028,
                )}
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
