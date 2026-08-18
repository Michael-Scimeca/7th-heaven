"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CalendarPicker, BookingSlot } from "@/components/CalendarPicker";
import { useMember } from "@/context/MemberContext";
import { formatPhoneDisplay } from "@/lib/validation";
import { Guitar, Mic, PartyPopper, Sparkles, Check, AlertTriangle, Star, Shield, ClipboardList, Zap, Lightbulb, Calendar as CalendarIcon, Plus, X, ChevronDown, ChevronRight, Megaphone, MapPin, Navigation, Clock, Compass, FileText, Bookmark, Save, CheckCircle2, Trash2, Building2 } from "lucide-react";
import GooeyMessagesDropdown from "@/components/GooeyMessagesDropdown";
import Dropdown from "@/components/Dropdown";
import SquishyToggle from "@/components/SquishyToggle";
import PlannerDashboard from "@/components/PlannerDashboard";

const eventTypes = [
  { id: "full_band", label: "Full Band", icon: Guitar, desc: "High energy, full 5-piece concert setup" },
  { id: "unplugged", label: "Unplugged", icon: Mic, desc: "Acoustic, intimate stripped-down set" },
  { id: "private", label: "Private Event", icon: PartyPopper, desc: "Birthdays, corporate events, weddings" },
  { id: "custom", label: "Custom Booking", icon: Sparkles, desc: "Special requests, festivals, hybrid shows" },
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
    parkingNotes: "Band bus park in West Lot behind stage. Enter through Gate 4 off Bartlett Rd."
  },
  {
    id: "preset-2",
    label: "The Arcada Theatre - St. Charles",
    venueName: "The Arcada Theatre",
    parkingAddress: "105 E Main St",
    venueCity: "St. Charles",
    venueState: "IL",
    parkingNotes: "Loading dock located in alley behind venue on 1st St."
  },
  {
    id: "preset-3",
    label: "House of Blues - Chicago",
    venueName: "House of Blues",
    parkingAddress: "329 N Dearborn St",
    venueCity: "Chicago",
    venueState: "IL",
    parkingNotes: "Stage door load-in via Marina City garage lower level."
  }
];

export default function BookPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <BookPageContent />
    </Suspense>
  );
}

const M_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function MiniDatePicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [showCal, setShowCal] = useState(false);
  const [calMonth, setCalMonth] = useState(new Date());
  const [showMonthGrid, setShowMonthGrid] = useState(false);
  const minDate = new Date(Date.now() + 86400000);
  const year = calMonth.getFullYear();
  const month = calMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysCount = new Date(year, month + 1, 0).getDate();

  return (
    <div className="relative">
      <span className="text-base font-bold uppercase tracking-widest text-white/60 block mb-1.5">{label}</span>
      <button aria-label="Action button"
        type="button"
        onClick={() => setShowCal(!showCal)}
        className={`w-full bg-white/5 backdrop-blur-md border-0 px-4 py-3 text-lg text-left transition-colors hover:bg-white/10 cursor-pointer flex items-center justify-between rounded-xl ${value ? 'text-white font-semibold' : 'text-white/40'}`}
      >
        {value ? new Date(value + 'T12:00:00Z').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }) : 'Pick a date…'}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
      </button>
      {showCal && (
        <div className="absolute z-50 top-full mt-2 left-0 w-72 bg-[#0c0817] border-0 p-4 rounded-xl shadow-2xl animate-[fade-in-up_0.15s_ease-out_both]">
          <div className="flex items-center justify-between mb-3">
            <button aria-label="Action button" type="button" onClick={() => setCalMonth(new Date(year, month - 1, 1))} className="text-white/60 hover:text-white p-1 cursor-pointer"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg></button>
            <button aria-label="Action button" type="button" onClick={() => setShowMonthGrid(!showMonthGrid)} className="text-xs font-bold uppercase tracking-wider text-white/80 hover:text-cyan-400 transition-colors cursor-pointer">{calMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</button>
            <button aria-label="Action button" type="button" onClick={() => setCalMonth(new Date(year, month + 1, 1))} className="text-white/60 hover:text-white p-1 cursor-pointer"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg></button>
          </div>
          {showMonthGrid ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <button aria-label="Action button" type="button" onClick={() => setCalMonth(new Date(year - 1, month, 1))} className="text-white/60 hover:text-white text-base font-bold cursor-pointer">← {year - 1}</button>
                <span className="text-xs font-bold text-white">{year}</span>
                <button aria-label="Action button" type="button" onClick={() => setCalMonth(new Date(year + 1, month, 1))} className="text-white/60 hover:text-white text-base font-bold cursor-pointer">{year + 1} →</button>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {M_NAMES.map((m, i) => {
                  const isCur = month === i;
                  const isPast = new Date(year, i + 1, 0) < new Date();
                  return (
                    <button aria-label="Action button" key={m} type="button" disabled={isPast} onClick={() => { setCalMonth(new Date(year, i, 1)); setShowMonthGrid(false); }}
                      className={`py-2 rounded-lg text-base font-bold uppercase tracking-wider transition-colors ${isPast ? 'text-white/20 cursor-not-allowed' : isCur ? 'bg-cyan-600 text-white' : 'text-white/70 hover:bg-white/10 cursor-pointer'}`}
                    >{m}</button>
                  );
                })}
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-7 mb-1">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={`day-${i}-${d}`} className="text-center text-lg font-bold text-white/40 uppercase">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
                {Array.from({ length: daysCount }).map((_, i) => {
                  const d = new Date(year, month, i + 1);
                  const ds = d.toISOString().split('T')[0];
                  const isPast = d < minDate;
                  const isSel = value === ds;
                  return (
                    <button aria-label="Action button"
                      key={ds} type="button" disabled={isPast}
                      onClick={() => { onChange(ds); setShowCal(false); }}
                      className={`h-10 w-full font-bold text-xs rounded-lg transition-colors flex items-center justify-center ${isPast ? 'text-white/20 cursor-not-allowed' : isSel ? 'bg-cyan-600 text-white shadow-md font-black' : 'bg-white/5 hover:bg-white/15 text-white/80 cursor-pointer'}`}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
              {value && (
                <button aria-label="Action button" type="button" onClick={() => { onChange(''); setShowCal(false); }} className="mt-2 w-full text-base text-rose-500 hover:text-rose-600 uppercase tracking-widest font-bold cursor-pointer">Clear</button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

const InputField = ({ label, labelRight, required, id, className = "", ...props }: { label: string; labelRight?: React.ReactNode; required?: boolean; id?: string; className?: string } & React.InputHTMLAttributes<HTMLInputElement>) => {
  const inputId = id || props.name || `book-input-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  return (
    <div className={`flex flex-col justify-end h-full ${className}`}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <label htmlFor={inputId} className="text-base font-bold uppercase tracking-[0.15em] text-white/60 block">{label}{required && " *"}</label>
        {labelRight}
      </div>
      <div className="input-glow-border rounded-lg">
        <input aria-label="Input field" id={inputId} {...props} required={required}
          className="w-full bg-white/5 border-0 px-4 py-3 text-lg text-white placeholder:text-white/30 focus:outline-none transition-colors rounded-lg"
        />
      </div>
    </div>
  );
};

const TextAreaField = ({ label, required, id, ...props }: { label: string; required?: boolean; id?: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) => {
  const textareaId = id || props.name || `book-textarea-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  return (
    <div>
      <label htmlFor={textareaId} className="text-base font-bold uppercase tracking-[0.15em] text-white/60 block mb-2">{label}{required && " *"}</label>
      <div className="input-glow-border rounded-lg">
        <textarea id={textareaId} {...props} required={required}
          className="w-full bg-white/5 border-0 px-4 py-3 text-lg text-white placeholder:text-white/30 focus:outline-none transition-colors rounded-lg resize-y min-h-[95px]"
        />
      </div>
    </div>
  );
};

const SelectField = ({ label, options, required, id, value, onChange, name }: { label: string; options: string[]; required?: boolean; id?: string; value?: string; onChange?: (e: any) => void; name?: string }) => {
  const selectId = id || name || `book-select-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  return (
    <div>
      <label htmlFor={selectId} className="text-base font-bold uppercase tracking-[0.15em] text-white/60 block mb-2">{label}{required && " *"}</label>
      <GooeyMessagesDropdown
        placeholder="Select"
        defaultSelectedId={value ? String(value) : undefined}
        customers={options.map(o => ({ id: o, name: o }))}
        onSelect={(opt) => {
          if (onChange) {
            onChange({ target: { name: name || selectId, value: opt.id } });
          }
        }}
      />
    </div>
  );
};

const RadioPillField = ({ label, name, options, value, onChange, required }: { label: string; name: string, options: string[], value: string, onChange: any, required?: boolean }) => (
  <div className="mb-2">
    <span className="text-base font-bold uppercase tracking-[0.15em] text-white/60 block mb-3">{label}{required && " *"}</span>
    <div className="flex flex-wrap gap-2">
      {options.map(o => (
        <button aria-label="Action button"
          key={o}
          type="button"
          onClick={() => onChange({ target: { name, value: o } } as any)}
          className={`py-2 px-4 text-lg font-bold tracking-wide transition-colors border rounded-xl
            ${value === o
              ? "bg-purple-600/80 backdrop-blur-md text-white border-purple-400 shadow-md shadow-purple-600/30 font-black"
              : "bg-white/5 backdrop-blur-md border-white/10 text-white/80 hover:bg-white/10 hover:border-white/20 hover:text-white"
            }
          `}
        >
          {o}
        </button>
      ))}
    </div>
  </div>
);

function BookPageContent() {
  const { member, isLoggedIn, openModal, signup, login } = useMember();
  const searchParams = useSearchParams();
  const fromParam = searchParams.get("from");
  const tabParam = searchParams.get("tab");
  const isFromPlanner = fromParam === "planner" || fromParam === "rebook";
  const [activeTab, setActiveTab] = useState<'book' | 'planner'>(
    tabParam === 'planner' || tabParam === 'dashboard' ? 'planner' : 'book'
  );
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    organization: "",
    eventDate: "",
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
  const [expandedMetadata, setExpandedMetadata] = useState<Record<string, boolean>>({});
  const [hasSavedForm, setHasSavedForm] = useState(false);

  // Alternate dates (multi-date hold)
  const [altDate1, setAltDate1] = useState("");
  const [altDate2, setAltDate2] = useState("");

  // Saved addresses state & management
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>(DEFAULT_SAVED_ADDRESSES);
  const [addressNotification, setAddressNotification] = useState<string | null>(null);
  const [selectedSavedAddressId, setSelectedSavedAddressId] = useState<string>("");

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

    const label = customLabel || formData.venueName || formData.parkingAddress || "Saved Address";
    const newAddr: SavedAddress = {
      id: `saved-${Date.now()}`,
      label,
      venueName: formData.venueName || "",
      parkingAddress: formData.parkingAddress || "",
      venueCity: formData.venueCity || "",
      venueState: formData.venueState || "IL",
      parkingNotes: formData.parkingNotes || "",
    };

    const filtered = savedAddresses.filter(a => a.id !== newAddr.id && a.label.toLowerCase() !== label.toLowerCase());
    const updated = [newAddr, ...filtered];
    setSavedAddresses(updated);
    try {
      localStorage.setItem("7th_heaven_saved_addresses_v1", JSON.stringify(updated));
    } catch { }

    setSelectedSavedAddressId(newAddr.id);
    setAddressNotification(`Saved "${label}" to your saved locations!`);
    setTimeout(() => setAddressNotification(null), 3500);
  };

  const handleSelectSavedAddress = (item: SavedAddress) => {
    setSelectedSavedAddressId(item.id);
    setFormData(prev => ({
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
    const updated = savedAddresses.filter(a => a.id !== id);
    setSavedAddresses(updated);
    try {
      localStorage.setItem("7th_heaven_saved_addresses_v1", JSON.stringify(updated));
    } catch { }

    if (selectedSavedAddressId === id) {
      setSelectedSavedAddressId("");
    }
  };

  // Synchronize first booking slot date to formData.eventDate for legacy/display compatibility
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      eventDate: bookingSlots[0]?.date || "",
    }));
  }, [bookingSlots]);

  const loadAvailability = useCallback(async () => {
    try {
      const r = await fetch('/api/booking/availability');
      if (r.ok) {
        const d = await r.json();
        setBlockedDates(d.blockedDates || []);
      }
    } catch { }
  }, []);

  // Fetch blocked dates on mount
  useEffect(() => {
    loadAvailability();

    try {
      const saved = localStorage.getItem('7h_planner_last_form_v1') || localStorage.getItem('7h_planner_last_form');
      if (saved) {
        setHasSavedForm(true);
      }
    } catch { }
  }, [loadAvailability]);

  // Auto-fill from planner dashboard or rebook — pull saved form data from localStorage first
  useEffect(() => {
    if (isFromPlanner) {
      // Try to restore full form data from last booking
      try {
        const savedForm = localStorage.getItem('7h_planner_last_form_v1') || localStorage.getItem('7h_planner_last_form');
        if (savedForm) {
          const parsed = JSON.parse(savedForm);
          setFormData(prev => ({
            ...prev,
            ...parsed,
            // Clear date/time so user picks new ones
            eventDate: '',
            startTime: '',
            endTime: '',
          }));
          if (parsed.eventType) setSelectedType(parsed.eventType);
          if (parsed.bookingSlots) setBookingSlots(parsed.bookingSlots);
          else if (parsed.eventDates) {
            setBookingSlots(parsed.eventDates.map((d: string) => ({
              id: Math.random().toString(36).substring(2, 9),
              date: d,
              startTime: parsed.startTime || '7:00 PM',
              endTime: parsed.endTime || '10:00 PM',
              eventType: parsed.eventType || 'full_band'
            })));
          } else if (parsed.eventDate) {
            setBookingSlots([{
              id: Math.random().toString(36).substring(2, 9),
              date: parsed.eventDate,
              startTime: parsed.startTime || '7:00 PM',
              endTime: parsed.endTime || '10:00 PM',
              eventType: parsed.eventType || 'full_band'
            }]);
          }
        }
      } catch { }

      // URL params override localStorage (for specific field overrides)
      const allFields = ["name", "email", "phone", "organization", "venueName", "venueCity", "venueState", "startTime", "endTime", "indoorOutdoor", "expectedAttendance", "budget", "soundSystem", "stageAvailable", "backlineProvided", "ageRestriction", "loadInTime", "details"] as const;
      setFormData(prev => {
        const updated = { ...prev };
        allFields.forEach(f => {
          const val = searchParams.get(f);
          if (val) (updated as any)[f] = val;
        });
        return updated;
      });
      const eventType = searchParams.get("eventType");
      if (eventType) setSelectedType(eventType);

      const dateParam = searchParams.get("eventDate");
      const datesParam = searchParams.get("eventDates");
      if (datesParam) {
        setBookingSlots(datesParam.split(",").map((d: string) => ({
          id: Math.random().toString(36).substring(2, 9),
          date: d,
          startTime: searchParams.get("startTime") || "7:00 PM",
          endTime: searchParams.get("endTime") || "10:00 PM",
          eventType: searchParams.get("eventType") || "full_band",
        })));
      } else if (dateParam) {
        setBookingSlots([{
          id: Math.random().toString(36).substring(2, 9),
          date: dateParam,
          startTime: searchParams.get("startTime") || "7:00 PM",
          endTime: searchParams.get("endTime") || "10:00 PM",
          eventType: searchParams.get("eventType") || "full_band",
        }]);
      }
    }
  }, [isFromPlanner, searchParams]);

  // Auto-fill details if user is already logged in
  useEffect(() => {
    if (member && !isFromPlanner) {
      setFormData(prev => ({
        ...prev,
        name: member.name || prev.name,
        email: member.email || prev.email,
        phone: member.phone || prev.phone,
      }));
    }
  }, [member, isFromPlanner]);

  const handleLoadLastForm = () => {
    try {
      const saved = localStorage.getItem('7h_planner_last_form_v1') || localStorage.getItem('7h_planner_last_form');
      if (saved) {
        const parsed = JSON.parse(saved);
        setFormData(prev => ({
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
          expectedAttendance: parsed.expectedAttendance || prev.expectedAttendance,
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
            setPinError("Account created, but auto-login failed. Please sign in manually.");
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.type === 'tel' ? formatPhoneDisplay(e.target.value) : e.target.value;
    setFormData(prev => ({ ...prev, [e.target.name]: value }));
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
    if (bookingSlots.length === 0) errors.push("Please select at least one show date on the calendar.");
    if (!formData.startTime) errors.push("Start time is required.");
    if (!formData.endTime) errors.push("End time is required.");
    if (!formData.venueName.trim()) errors.push("Venue name is required.");
    if (!formData.venueCity.trim()) errors.push("Venue city is required.");

    // Email format
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push("Please enter a valid email address.");
    }

    // Phone format
    if (!formData.phone || formData.phone.replace(/\D/g, '').length < 10) {
      errors.push("Phone number must be at least 10 digits.");
    }

    // Date & Time validation for each slot
    bookingSlots.forEach((slot, idx) => {
      const eventDate = new Date(slot.date + 'T12:00:00');
      const now = new Date();
      const daysOut = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysOut < 0) {
        errors.push(`Show #${idx + 1} (${slot.date}): Cannot book a date in the past.`);
      } else if (daysOut > 365) {
        errors.push(`Show #${idx + 1} (${slot.date}): Bookings cannot be made more than 1 year in advance.`);
      }

      if (slot.startTime && slot.endTime) {
        const parseTime = (t: string) => {
          const match = t.match(/(\d+):(\d+)\s*(AM|PM)/i);
          if (!match) return 0;
          let h = parseInt(match[1]);
          const m = parseInt(match[2]);
          if (match[3].toUpperCase() === 'PM' && h !== 12) h += 12;
          if (match[3].toUpperCase() === 'AM' && h === 12) h = 0;
          return h * 60 + m;
        };
        if (parseTime(slot.endTime) <= parseTime(slot.startTime)) {
          errors.push(`Show #${idx + 1} (${slot.date}): End time must be after start time.`);
        }
      }
    });

    // Rate limiting — max 3 submissions per hour
    try {
      const timestamps: number[] = JSON.parse(localStorage.getItem('7h_booking_timestamps_v1') || localStorage.getItem('7h_booking_timestamps') || '[]');
      const oneHourAgo = Date.now() - 60 * 60 * 1000;
      const recent = timestamps.filter(t => t > oneHourAgo);
      if (recent.length >= 3) {
        errors.push("Too many booking requests. Please wait before submitting another.");
      }
    } catch { }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Run validation
    const errors = validateBooking();
    if (errors.length > 0) {
      setValidationErrors(errors);
      // Scroll to top of form to show errors
      document.getElementById('book-event')?.scrollIntoView({ behavior: 'smooth' });
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
          eventDates: bookingSlots.map(s => s.date),
          eventDate: bookingSlots[0]?.date || "",
          eventType: selectedType,
          altDate1,
          altDate2,
          addOns,
          website: formData.website
        }),
      });
      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          // Save full form data for rebook auto-fill
          localStorage.setItem('7h_planner_last_form_v1', JSON.stringify({
            ...formData,
            eventType: selectedType,
            bookingSlots,
            eventDates: bookingSlots.map(s => s.date),
            eventDate: bookingSlots[0]?.date || ""
          }));

          // Track submission timestamp for rate limiting
          try {
            const timestamps: number[] = JSON.parse(localStorage.getItem('7h_booking_timestamps_v1') || localStorage.getItem('7h_booking_timestamps') || '[]');
            timestamps.push(Date.now());
            const oneHourAgo = Date.now() - 60 * 60 * 1000;
            localStorage.setItem('7h_booking_timestamps_v1', JSON.stringify(timestamps.filter(t => t > oneHourAgo)));
          } catch { }

          // Persist phone number to user account if logged in
          if (isLoggedIn && member && formData.phone) {
            const accounts = JSON.parse(localStorage.getItem('7h_accounts_v1') || localStorage.getItem('7h_accounts') || '{}');
            if (accounts[member.email]) {
              accounts[member.email].phone = formData.phone;
              localStorage.setItem('7h_accounts_v1', JSON.stringify(accounts));
            }
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
          setValidationErrors([result.error || "Something went wrong. Please try again."]);
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



  const [setlistSongs, setSetlistSongs] = useState<string[]>(['', '', '']);
  const [setlistNotes, setSetlistNotes] = useState('');
  const [setlistSubmitted, setSetlistSubmitted] = useState(false);
  const [setlistSubmitting, setSetlistSubmitting] = useState(false);

  if (submitted) {
    return (
      <section className="min-h-screen flex items-center justify-center   px-6 relative overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--color-accent)] opacity-[0.05] rounded-full blur-[150px] pointer-events-none" />

        <div className="text-center max-w-lg relative z-10 w-full animate-[fade-in-up_0.6s_ease-out_both] bg-[var(--color-bg-surface)]/80 border border-white/5 backdrop-blur-xl p-10 rounded-[2rem]">
          <div className="w-16 h-16 mx-auto mb-6 bg-[var(--color-accent)]/20 border border-[var(--color-accent)] flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-3 tracking-tight">Request Received</h1>
          <p className="text-white/50 text-lg leading-relaxed mb-8">
            Thank you for your interest in booking 7th Heaven! We&apos;ve sent a confirmation email to <strong className="text-white">{formData.email}</strong>. Please check your inbox to verify your request.
            <br /><span className="text-base text-[var(--color-accent)]/70 mt-2 inline-block">✓ Notification sent to band management</span>
          </p>

          <div className="flex flex-col gap-3 w-full">
            <Link href="/book" className="inline-flex items-center justify-center w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 text-white font-bold uppercase tracking-wider text-base py-4 px-8 transition-colors shadow-[0_0_20px_rgba(255,10,61,0.3)] hover:shadow-[0_0_30px_rgba(255,10,61,0.5)]">
              Book Another Show
            </Link>
            {!isLoggedIn && (
              creatingAccount ? (
                <div className="bg-white/[0.03] border border-[var(--color-accent)]/30 p-5 text-left">
                  <div className="mb-4">
                    <span className="text-base text-white/30 uppercase tracking-widest font-bold block mb-1.5">Account Email</span>
                    {editingEmail ? (
                      <div className="flex gap-2">
                        <input aria-label="Input field"
                          type="email"
                          value={accountEmail}
                          onChange={e => setAccountEmail(e.target.value)}
                          autoFocus
                          disabled={pinSent || pinLoading}
                          className="flex-1   border border-white/10 px-4 py-2.5 rounded-lg text-lg text-white focus:border-[var(--color-accent)] outline-none transition-colors disabled:opacity-50"
                        />
                        <button aria-label="Action button" type="button" onClick={() => setEditingEmail(false)} className="text-base  text-[var(--color-accent)] font-bold uppercase tracking-wider cursor-pointer px-3">Done</button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-lg text-white font-bold">{accountEmail}</span>
                        {!pinSent && (
                          <button aria-label="Action button" type="button" onClick={() => { setEditingEmail(true); setPinError(""); }} className="text-base text-white/30 hover: text-[var(--color-accent)] uppercase tracking-widest font-bold cursor-pointer transition-colors">Edit</button>
                        )}
                      </div>
                    )}
                  </div>

                  {!pinSent ? (
                    <div>
                      <div className="flex gap-2">
                        <input aria-label="Input field"
                          type="password"
                          placeholder="Set a password (6+ chars)"
                          value={accountPassword}
                          onChange={e => setAccountPassword(e.target.value)}
                          disabled={pinLoading}
                          className="flex-1   border border-white/10 px-4 py-3 text-lg text-white placeholder:text-white/20 focus:border-[var(--color-accent)] outline-none transition-colors disabled:opacity-50"
                        />
                        <button aria-label="Action button"
                          type="button"
                          disabled={!accountPassword || accountPassword.length < 6 || !accountEmail || pinLoading}
                          onClick={handleSendPin}
                          className="px-5 py-3 bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 text-white text-lg font-bold uppercase tracking-wider transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0 flex items-center justify-center min-w-[70px]"
                        >
                          {pinLoading ? (
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            "Go →"
                          )}
                        </button>
                      </div>
                      <p className="text-white/40 text-sm mt-2">We will send a 6-digit verification code to your email.</p>
                    </div>
                  ) : (
                    <div>
                      <div className="flex gap-2 mb-2">
                        <input aria-label="Input field"
                          type="text"
                          maxLength={6}
                          placeholder="Enter 6-digit code"
                          value={pinCode}
                          onChange={e => setPinCode(e.target.value.replace(/\D/g, ''))}
                          disabled={pinLoading}
                          className="flex-1   border border-white/10 px-4 py-3 text-lg text-white placeholder:text-white/20 focus:border-[var(--color-accent)] outline-none transition-colors text-center tracking-[0.2em] font-mono disabled:opacity-50"
                        />
                        <button aria-label="Action button"
                          type="button"
                          disabled={pinCode.length !== 6 || pinLoading}
                          onClick={handleVerifyPin}
                          className="px-5 py-3 bg-purple-600 hover:bg-purple-500 text-white text-lg font-bold uppercase tracking-wider transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0 flex items-center justify-center min-w-[140px]"
                        >
                          {pinLoading ? (
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            "Verify & Create"
                          )}
                        </button>
                      </div>
                      <div className="flex justify-between items-center text-sm mt-2">
                        <button aria-label="Action button"
                          type="button"
                          onClick={handleSendPin}
                          disabled={pinLoading}
                          className=" text-[var(--color-accent)] hover:underline font-bold disabled:opacity-40"
                        >
                          Resend Code
                        </button>
                        <button aria-label="Action button"
                          type="button"
                          onClick={() => { setPinSent(false); setPinCode(""); setPinError(""); }}
                          disabled={pinLoading}
                          className="text-white/30 hover:text-white/60 hover:underline"
                        >
                          Back to Password
                        </button>
                      </div>
                    </div>
                  )}

                  {pinError && (
                    <div className="mt-3 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm font-bold text-left animate-[fade-in-up_0.15s_ease-out_both]">
                      ⚠️ {pinError}
                    </div>
                  )}

                  <button aria-label="Action button"
                    type="button"
                    onClick={() => {
                      setCreatingAccount(false);
                      setEditingEmail(false);
                      setPinSent(false);
                      setPinError("");
                      setPinCode("");
                    }}
                    className="text-base text-white/30 hover:text-white/50 mt-4 cursor-pointer transition-colors block text-center w-full"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-center gap-2 mb-1.5">
                    <span className="text-lg text-white/40">{formData.email}</span>
                  </div>
                  <button aria-label="Action button"
                    type="button"
                    onClick={() => { setCreatingAccount(true); setAccountEmail(accountEmail || formData.email); }}
                    className="inline-flex items-center justify-center w-full bg-white/[0.05] hover:bg-white/[0.1] text-white font-bold uppercase tracking-wider text-base py-4 px-8 transition-colors border border-[var(--color-accent)]/30 hover:border-[var(--color-accent)]/60 cursor-pointer"
                  >
                    Create Account
                  </button>
                </div>
              )
            )}
            <Link href="/" className="inline-flex items-center justify-center w-full bg-white/[0.03] hover:bg-white/[0.08] text-white/80 font-bold uppercase tracking-wider text-base py-4 px-8 transition-colors border border-white/5">
              Return to Homepage
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="min-h-screen relative overflow-clip pt-[100px]">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-[var(--color-accent)] opacity-[0.07] blur-[120px] pointer-events-none" />

      <section className="site-container relative z-10" id="book-event">

        {/* Signed-in Identity Block */}
        {isLoggedIn && member && (
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
            <div className="flex items-center gap-4">
              <div className="relative w-14 h-14 rounded-full bg-purple-600/20 border-2 border-purple-500 flex items-center justify-center text-lg font-black text-purple-300">
                {member.name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || '?'}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black italic tracking-tight text-white">{member.name}</h2>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-base font-bold uppercase tracking-[0.15em] border rounded-full bg-purple-500/20 text-purple-300 border-purple-500/30">
                    {member.role === 'event_planner' ? <><ClipboardList className="w-3.5 h-3.5" /> Event Planner</> : member.role === 'admin' ? <><Shield className="w-3.5 h-3.5" /> Admin</> : member.role === 'crew' ? <><Shield className="w-3.5 h-3.5" /> Crew</> : <><Star className="w-3.5 h-3.5" /> Fan</>}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}




        <form onSubmit={handleSubmit} className="space-y-8">
          {isFromPlanner && (
            <div className="bg-purple-950/40 border border-purple-500/30 px-6 py-4 rounded-2xl flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <div>
                <p className="text-purple-300 text-base font-bold">{fromParam === "rebook" ? "Rebooking previous event" : "Profile details pre-loaded"}</p>
                <p className="text-white/60 text-lg">{fromParam === "rebook" ? "All your previous event details have been copied over. Just pick a new date and tweak anything you need." : "Your contact & venue info has been filled in. Just pick your date and event type."}</p>
              </div>
            </div>
          )}

          {hasSavedForm && !isFromPlanner && (
            <div className="p-5 bg-purple-950/40 border border-purple-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-[fade-in-up_0.2s_ease-out_both] relative z-10">
              <div className="flex items-center gap-3">
                <ClipboardList className="w-6 h-6 text-purple-300 shrink-0" />
                <div>
                  <p className="text-white font-bold text-base">Re-fill with details from your last booking?</p>
                  <p className="text-white/60 text-sm mt-0.5">We found a booking request you recently filled out. You can automatically fill in your contact and venue details.</p>
                </div>
              </div>
              <button aria-label="Action button"
                type="button"
                onClick={handleLoadLastForm}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-md rounded-lg shrink-0 flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" /> Populate
              </button>
            </div>
          )}

          {/* Step 1: Event Schedule & Format */}
          <div className="bg-transparent border-0 p-0 shadow-none relative">
            <h2 className="text-lg font-bold uppercase tracking-[0.2em] text-[#c27aff] mb-6 flex items-center gap-3">
              Event Schedule & Format
            </h2>
            <div className="mb-6 p-0 bg-transparent border-0 flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-yellow-300 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Multi-Date Bookings Supported</h4>
                <p className="text-white/70 text-sm mt-1">You can select <strong>multiple dates</strong> on the calendar to book a multi-day run or request multiple shows at once. Below the calendar, you can configure unique times, formats, and separate contact/venue details for each date if needed.</p>
              </div>
            </div>
            <div className="mb-6">
              <CalendarPicker
                label="Primary Event Schedule"
                required
                slots={bookingSlots}
                onChangeSlots={setBookingSlots}
                startTime={formData.startTime}
                onStartTimeChange={(t) => setFormData(p => ({ ...p, startTime: t }))}
                endTime={formData.endTime}
                onEndTimeChange={(t) => setFormData(p => ({ ...p, endTime: t }))}
                selectedType={selectedType || undefined}
                onSelectType={(t) => setSelectedType(t)}
                customDetails={formData.customEventType}
                onCustomDetailsChange={(d) => setFormData(p => ({ ...p, customEventType: d }))}
                blockedDates={blockedDates}
              />

              {/* Alternate Dates */}
              <div className="mt-6 p-0 bg-transparent border-0">
                <div className="flex items-center gap-3 mb-4">
                  <CalendarIcon className="w-5 h-5 text-[#c27aff] shrink-0" />
                  <div>
                    <h4 className="text-base font-bold uppercase tracking-widest text-white">Flexible? Add Backup Dates</h4>
                    <p className="text-base text-white/60">Increase your chances — we&apos;ll try your preferred date first</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <MiniDatePicker label="2nd Choice" value={altDate1} onChange={setAltDate1} />
                  <MiniDatePicker label="3rd Choice" value={altDate2} onChange={setAltDate2} />
                </div>
                {(altDate1 || altDate2) && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="text-base text-white/50 uppercase tracking-widest font-bold">Priority:</span>
                    <span className="text-base bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 px-2.5 py-0.5 rounded font-bold">1st: {bookingSlots.length > 0 ? bookingSlots.map(s => new Date(s.date + 'T12:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })).join(', ') : '—'}</span>
                    {altDate1 && <span className="text-base bg-white/10 text-white/80 border border-white/15 px-2.5 py-0.5 rounded font-bold">2nd: {new Date(altDate1 + 'T12:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>}
                    {altDate2 && <span className="text-base bg-white/10 text-white/80 border border-white/15 px-2.5 py-0.5 rounded font-bold">3rd: {new Date(altDate2 + 'T12:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>}
                  </div>
                )}
              </div>
            </div>
            {/* Pricing hint per type */}
            {selectedType && (
              <div className="px-5 py-3   15 border border-purple-500/30 rounded-xl text-base text-white/80 mb-4">
                <span className="text-purple-300 font-bold">Pricing Guide:</span>{" "}
                {selectedType === "full_band" && "Full band performances typically start at $3,000 depending on stage scale and production requirements."}
                {selectedType === "unplugged" && "Unplugged acoustic sets start at $1,500. Perfect for smaller rooms or cocktail setups."}
                {selectedType === "private" && "Private events start at $4,000. Includes custom setlist and dedicated coordination."}
                {selectedType === "custom" && "Custom package pricing depends entirely on requirements. We'll be in touch to quote you directly."}
              </div>
            )}
          </div>

          {/* Your Scheduled Shows (Full Width Grid) */}
          <div className="bg-[var(--color-section-bg)] relative">
            {bookingSlots.length === 0 ? (
              <div className="text-center p-6 rounded-lg border-2 border-dashed border-white/15 bg-white/[0.02] rounded-2xl">
                <span className="text-4xl block mb-4">📅</span>
                <h4 className="text-lg font-bold text-white uppercase tracking-wider mb-2">No Dates Selected Yet</h4>
                <p className="text-white/60 text-base max-w-md mx-auto">
                  Click one or more dates on the calendar picker in Step 1 to select dates for your tour date booking request. You can schedule multiple dates at once.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                  <div>
                    <h4 className="text-lg font-bold uppercase tracking-[0.15em] text-white">Your Scheduled Shows</h4>
                    <p className="text-base text-white/60 mt-1 uppercase">Configure individual times and formats for each show below</p>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-cyan-300 bg-cyan-500/20 px-3 py-1 rounded-full border border-cyan-400/30">
                    {bookingSlots.length} Show{bookingSlots.length > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {bookingSlots.map((slot, index) => {
                    const formattedDate = new Date(slot.date + 'T12:00:00Z').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
                    return (
                      <div
                        key={slot.id}
                        className="bg-white/5 border border-white/10 hover:border-cyan-400/40 p-6 rounded-2xl relative group transition-colors shadow-lg"
                      >
                        {/* Duplicate and Remove buttons */}
                        <div className="absolute top-4 right-4 flex items-center gap-1.5">
                          <button aria-label="Action button"
                            type="button"
                            onClick={() => {
                              const newSlot = {
                                ...slot,
                                id: Math.random().toString(36).substring(2, 9),
                              };
                              setBookingSlots([...bookingSlots, newSlot]);
                            }}
                            className="text-white/60 hover:text-cyan-300 transition-colors cursor-pointer text-[var(--font-size-3xs)] font-bold uppercase tracking-wider flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg hover:bg-cyan-500/20 border border-white/15 hover:border-cyan-400/30"
                            title="Add another show on this date"
                          >
                            <Plus className="w-3 h-3" /> Add Another
                          </button>
                          <button aria-label="Action button"
                            type="button"
                            onClick={() => setBookingSlots(bookingSlots.filter(s => s.id !== slot.id))}
                            className="text-white/60 hover:text-rose-400 transition-colors cursor-pointer text-[var(--font-size-3xs)] font-bold uppercase tracking-wider flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg hover:bg-rose-500/20 border border-white/15 hover:border-rose-500/30"
                            title="Remove this show"
                          >
                            <X className="w-3 h-3" /> Remove
                          </button>
                        </div>

                        <div className="mb-4">
                          <span className="text-[var(--font-size-3xs)] font-bold uppercase tracking-widest text-cyan-300 block mb-1">Show #{index + 1}</span>
                          <h5 className="text-base font-bold text-white tracking-wide">{formattedDate}</h5>
                        </div>

                        <div className="space-y-3 mt-4 border-t border-white/10 pt-4">
                          {/* Format */}
                          <div>
                            <label htmlFor={`slot-format-${slot.id}`} className="text-[var(--font-size-3xs)] font-bold uppercase tracking-widest text-white/50 block mb-1.5">Show Format</label>
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
                                const updated = bookingSlots.map(s => s.id === slot.id ? { ...s, eventType: val } : s);
                                setBookingSlots(updated);
                              }}
                              className="w-full"
                            />
                            {slot.eventType === 'custom' && (
                              <input aria-label="Input field"
                                type="text"
                                placeholder="Describe show type (e.g. Street Fest)..."
                                value={slot.customEventType || ""}
                                onChange={(e) => {
                                  const updated = bookingSlots.map(s => s.id === slot.id ? { ...s, customEventType: e.target.value } : s);
                                  setBookingSlots(updated);
                                }}
                                className="w-full mt-1.5 bg-white/5 backdrop-blur-md border border-cyan-400/40 text-xs py-2 px-3 rounded-lg outline-none text-white focus:border-cyan-400 placeholder:text-white/30 shadow-inner"
                              />
                            )}
                          </div>

                          {/* Times */}
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label htmlFor={`slot-start-${slot.id}`} className="text-[var(--font-size-3xs)] font-bold uppercase tracking-widest text-white/50 block mb-1.5">Start Time</label>
                              <Dropdown
                                id={`slot-start-${slot.id}`}
                                fullWidth={true}
                                selected={slot.startTime}
                                options={["12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM", "10:00 PM", "11:00 PM", "12:00 AM"]}
                                onChange={(val) => {
                                  const updated = bookingSlots.map(s => s.id === slot.id ? { ...s, startTime: val } : s);
                                  setBookingSlots(updated);
                                }}
                                className="w-full"
                              />
                            </div>
                            <div>
                              <label htmlFor={`slot-end-${slot.id}`} className="text-[var(--font-size-3xs)] font-bold uppercase tracking-widest text-white/50 block mb-1.5">End Time</label>
                              <Dropdown
                                id={`slot-end-${slot.id}`}
                                fullWidth={true}
                                selected={slot.endTime}
                                options={["12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM", "10:00 PM", "11:00 PM", "12:00 AM", "1:00 AM", "2:00 AM"]}
                                onChange={(val) => {
                                  const updated = bookingSlots.map(s => s.id === slot.id ? { ...s, endTime: val } : s);
                                  setBookingSlots(updated);
                                }}
                                className="w-full"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Separate Contact/Venue details toggle buttons & form fields */}
                        <div className="mt-4 pt-4 border-t border-white/10">
                          <div className="mb-3">
                            <span className="text-[var(--font-size-3xs)] font-bold uppercase tracking-widest text-white/50 block mb-2">Contact & Venue Details</span>
                            <div className="grid grid-cols-2 gap-1.5 bg-black/50 p-1 border border-white/10 rounded-lg">
                              <button aria-label="Action button"
                                type="button"
                                onClick={() => {
                                  const updated = bookingSlots.map(s => s.id === slot.id ? {
                                    ...s,
                                    useSeparateInfo: false,
                                    contactName: "",
                                    contactEmail: "",
                                    contactPhone: "",
                                    venueName: "",
                                    venueCity: "",
                                    venueState: "",
                                  } : s);
                                  setBookingSlots(updated);
                                }}
                                className={`py-2 rounded-lg text-[var(--font-size-3xs)] font-extrabold uppercase tracking-wider transition-colors cursor-pointer text-center ${!slot.useSeparateInfo ? 'bg-cyan-600 text-white shadow-md' : 'text-white/40 hover:text-white/70 bg-transparent'}`}
                              >
                                Share Main Info
                              </button>
                              <button aria-label="Action button"
                                type="button"
                                onClick={() => {
                                  const updated = bookingSlots.map(s => s.id === slot.id ? {
                                    ...s,
                                    useSeparateInfo: true,
                                    contactName: s.contactName || formData.name || "",
                                    contactEmail: s.contactEmail || formData.email || "",
                                    contactPhone: s.contactPhone || formData.phone || "",
                                    venueName: s.venueName || formData.venueName || "",
                                    venueCity: s.venueCity || formData.venueCity || "",
                                    venueState: s.venueState || formData.venueState || "",
                                  } : s);
                                  setBookingSlots(updated);
                                }}
                                className={`py-2 rounded-lg text-[var(--font-size-3xs)] font-extrabold uppercase tracking-wider transition-colors cursor-pointer text-center ${slot.useSeparateInfo ? 'bg-cyan-600 text-white shadow-md' : 'text-white/40 hover:text-white/70 bg-transparent'}`}
                              >
                                Use Separate Info
                              </button>
                            </div>
                          </div>

                          {!slot.useSeparateInfo ? (
                            <div className="p-3.5 bg-white/[0.03] border border-white/10 rounded-xl text-[var(--font-size-3xs)] text-white/50 space-y-1.5 mt-2 animate-[fade-in-up_0.1s_ease-out_both]">
                              <div className="flex justify-between items-start gap-2">
                                <span className="font-bold text-white/40 uppercase tracking-widest text-[var(--font-size-4xs)] mt-0.5">Contact:</span>
                                <span className="text-white font-medium text-right break-all">
                                  {formData.name || <span className="text-white/20 italic">(empty)</span>}
                                  {formData.email && <span className="block text-[var(--font-size-4xs)] text-white/40 font-mono mt-0.5">{formData.email}</span>}
                                </span>
                              </div>
                              <div className="flex justify-between items-start gap-2">
                                <span className="font-bold text-white/40 uppercase tracking-widest text-[var(--font-size-4xs)] mt-0.5">Venue:</span>
                                <span className="text-white font-medium text-right break-all">
                                  {formData.venueName || <span className="text-white/20 italic">(empty)</span>}
                                  {(formData.venueCity || formData.venueState) && (
                                    <span className="block text-[var(--font-size-4xs)] text-white/40 mt-0.5">{formData.venueCity || '—'}, {formData.venueState || '—'}</span>
                                  )}
                                </span>
                              </div>
                              <p className="text-[var(--font-size-4xs)] text-cyan-300 font-bold tracking-wide italic mt-2 pt-1.5 border-t border-white/10 text-right flex items-center justify-end gap-1">
                                <span>🔗 Link Active: Shares contact & venue data</span>
                              </p>
                            </div>
                          ) : (
                            <div className="mt-3 space-y-3 animate-[fade-in-up_0.15s_ease-out_both] p-3.5 bg-white/[0.03] border border-white/10 rounded-xl">
                              <div className="flex justify-between items-center mb-1 gap-2 flex-wrap">
                                <span className="text-[var(--font-size-4xs)] font-black uppercase tracking-widest text-white/40">Separate Show Info</span>
                                <div className="flex gap-2">
                                  <button aria-label="Action button"
                                    type="button"
                                    onClick={() => {
                                      const updated = bookingSlots.map(s => s.id === slot.id ? {
                                        ...s,
                                        contactName: formData.name,
                                        contactEmail: formData.email,
                                        contactPhone: formData.phone,
                                        venueName: formData.venueName,
                                        venueCity: formData.venueCity,
                                        venueState: formData.venueState,
                                      } : s);
                                      setBookingSlots(updated);
                                    }}
                                    className="text-[var(--font-size-4xs)] font-bold text-cyan-300 hover:underline cursor-pointer"
                                  >
                                    ⚡ Copy Main
                                  </button>
                                  {hasSavedForm && (
                                    <button aria-label="Action button"
                                      type="button"
                                      onClick={() => {
                                        try {
                                          const saved = localStorage.getItem('7h_planner_last_form_v1') || localStorage.getItem('7h_planner_last_form');
                                          if (saved) {
                                            const parsed = JSON.parse(saved);
                                            const updated = bookingSlots.map(s => s.id === slot.id ? {
                                              ...s,
                                              contactName: parsed.name || s.contactName,
                                              contactEmail: parsed.email || s.contactEmail,
                                              contactPhone: parsed.phone || s.contactPhone,
                                              venueName: parsed.venueName || s.venueName,
                                              venueCity: parsed.venueCity || s.venueCity,
                                              venueState: parsed.venueState || s.venueState,
                                            } : s);
                                            setBookingSlots(updated);
                                          }
                                        } catch { }
                                      }}
                                      className="text-[var(--font-size-4xs)] font-bold text-purple-400 hover:underline cursor-pointer"
                                    >
                                      ⚡ Load Last
                                    </button>
                                  )}
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label htmlFor={`slot-contact-name-${slot.id}`} className="text-[var(--font-size-4xs)] font-bold uppercase tracking-widest text-white/50 block mb-1">Contact Name</label>
                                  <input aria-label="Input field"
                                    id={`slot-contact-name-${slot.id}`}
                                    type="text"
                                    placeholder="e.g. Jane Doe"
                                    value={slot.contactName || ""}
                                    onChange={(e) => {
                                      const updated = bookingSlots.map(s => s.id === slot.id ? { ...s, contactName: e.target.value } : s);
                                      setBookingSlots(updated);
                                    }}
                                    className="w-full bg-white/5 backdrop-blur-md border border-white/15 text-xs py-1.5 px-2.5 rounded-lg outline-none text-white focus:border-cyan-400 placeholder:text-white/30 shadow-inner"
                                  />
                                </div>
                                <div>
                                  <label htmlFor={`slot-contact-email-${slot.id}`} className="text-[var(--font-size-4xs)] font-bold uppercase tracking-widest text-white/50 block mb-1">Contact Email</label>
                                  <input aria-label="Input field"
                                    id={`slot-contact-email-${slot.id}`}
                                    type="email"
                                    placeholder="e.g. jane@email.com"
                                    value={slot.contactEmail || ""}
                                    onChange={(e) => {
                                      const updated = bookingSlots.map(s => s.id === slot.id ? { ...s, contactEmail: e.target.value } : s);
                                      setBookingSlots(updated);
                                    }}
                                    className="w-full bg-white/5 backdrop-blur-md border border-white/15 text-xs py-1.5 px-2.5 rounded-lg outline-none text-white focus:border-cyan-400 placeholder:text-white/30 shadow-inner"
                                  />
                                </div>
                              </div>

                              <div>
                                <label htmlFor={`slot-venue-name-${slot.id}`} className="text-[var(--font-size-4xs)] font-bold uppercase tracking-widest text-white/50 block mb-1">Venue Name</label>
                                <input aria-label="Input field"
                                  id={`slot-venue-name-${slot.id}`}
                                  type="text"
                                  placeholder="e.g. House of Blues"
                                  value={slot.venueName || ""}
                                  onChange={(e) => {
                                    const updated = bookingSlots.map(s => s.id === slot.id ? { ...s, venueName: e.target.value } : s);
                                    setBookingSlots(updated);
                                  }}
                                  className="w-full bg-white/5 backdrop-blur-md border border-white/15 text-xs py-1.5 px-2.5 rounded-lg outline-none text-white focus:border-cyan-400 placeholder:text-white/30 shadow-inner"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label htmlFor={`slot-venue-city-${slot.id}`} className="text-[var(--font-size-4xs)] font-bold uppercase tracking-widest text-white/50 block mb-1">City</label>
                                  <input aria-label="Input field"
                                    id={`slot-venue-city-${slot.id}`}
                                    type="text"
                                    placeholder="Chicago"
                                    value={slot.venueCity || ""}
                                    onChange={(e) => {
                                      const updated = bookingSlots.map(s => s.id === slot.id ? { ...s, venueCity: e.target.value } : s);
                                      setBookingSlots(updated);
                                    }}
                                    className="w-full bg-white/5 backdrop-blur-md border border-white/15 text-xs py-1.5 px-2.5 rounded-lg outline-none text-white focus:border-cyan-400 placeholder:text-white/30 shadow-inner"
                                  />
                                </div>
                                <div>
                                  <label htmlFor={`slot-venue-state-${slot.id}`} className="text-[var(--font-size-4xs)] font-bold uppercase tracking-widest text-white/50 block mb-1">State</label>
                                  <input aria-label="Input field"
                                    id={`slot-venue-state-${slot.id}`}
                                    type="text"
                                    placeholder="IL"
                                    value={slot.venueState || ""}
                                    onChange={(e) => {
                                      const updated = bookingSlots.map(s => s.id === slot.id ? { ...s, venueState: e.target.value } : s);
                                      setBookingSlots(updated);
                                    }}
                                    className="w-full bg-white/5 backdrop-blur-md border border-white/15 text-xs py-1.5 px-2.5 rounded-lg outline-none text-white focus:border-cyan-400 placeholder:text-white/30 shadow-inner"
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="mt-4 pt-4 border-t border-white/10">
                          <button aria-label="Previous"
                            type="button"
                            onClick={() => setExpandedMetadata(prev => ({ ...prev, [slot.id]: !prev[slot.id] }))}
                            className="w-full text-left flex items-center justify-between text-[var(--font-size-3xs)] font-black uppercase tracking-widest text-cyan-300 hover:text-purple-400 transition-colors"
                          >
                            <span className="flex items-center gap-1.5"><Megaphone className="w-3.5 h-3.5" /> Tour Page Details {expandedMetadata[slot.id] ? <ChevronDown className="w-3.5 h-3.5 inline" /> : <ChevronRight className="w-3.5 h-3.5 inline" />}</span>
                            <span className="text-[var(--font-size-4xs)] text-white/40 lowercase font-normal">(optional: age limit, tickets, notes)</span>
                          </button>

                          {expandedMetadata[slot.id] && (
                            <BookingSlotMetadataSection slot={slot} bookingSlots={bookingSlots} setBookingSlots={setBookingSlots} />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Step 2: Contact Information */}
          <div className="bg-transparent border-0 p-0 shadow-none relative animate-[fade-in-up_0.15s_ease-out_both]">
            <h2 className="text-lg font-bold uppercase tracking-[0.2em] text-purple-400mb-6 flex items-center gap-3">
              Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Full Name" name="name" value={formData.name} onChange={handleChange} required placeholder="John Smith" />
              <InputField label="Organization" name="organization" value={formData.organization} onChange={handleChange} placeholder="Venue or company name" />
              <InputField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="you@email.com" />
              <InputField label="Phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} required placeholder="(555) 123-4567" />
            </div>
          </div>

          {/* Step 3: Venue Details & Event Schedule */}
          <div className="bg-transparent border-0 p-0 shadow-none relative animate-[fade-in-up_0.15s_ease-out_both] space-y-6">
            <h2 className="text-lg font-bold uppercase tracking-[0.2em] text-[#c27aff] mb-6 flex items-center gap-3">
              <MapPin className="w-5 h-5 text-[#c27aff]" /> Venue & Event Logistics
            </h2>

            {/* Show Event Start & End Times */}
            <div className="space-y-4">
              <div className="border-b border-white/10 pb-2.5">
                <h3 className="text-xs font-black uppercase tracking-widest text-purple-300 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#c27aff]" /> Event Times & Schedule
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <InputField label="Show Start Time" name="startTime" value={formData.startTime} onChange={handleChange} required placeholder="e.g. 7:00 PM" />
                <InputField label="Show End Time" name="endTime" value={formData.endTime} onChange={handleChange} required placeholder="e.g. 10:30 PM" />

                <div>
                  <InputField
                    label="Load-in / Setup Time"
                    name="loadInTime"
                    value={isLoadInUnsure ? "Unsure — Band admin will confirm & email setup time" : formData.loadInTime}
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
                              setFormData(prev => ({ ...prev, loadInTime: "Unsure — Band admin will confirm & email setup time" }));
                            } else {
                              setFormData(prev => ({ ...prev, loadInTime: "" }));
                            }
                          }}
                          label="Unsure?"
                        />
                        <span className="text-[11px] font-extrabold text-[#c27aff]">Unsure?</span>
                      </div>
                    }
                  />
                </div>
              </div>
              <p className="text-[11px] text-purple-300/80 font-medium italic flex items-center gap-1 leading-tight mt-1.5 justify-end">
                <Sparkles className="w-3 h-3 text-[#c27aff] shrink-0" /> Load-in is usually ~2 hours before show start time.
              </p>

              {isLoadInUnsure && (
                <div className="p-3.5 bg-purple-950/40 border border-purple-500/40 rounded-xl text-xs text-purple-200 flex items-start gap-3 animate-[fade-in-up_0.15s_ease-out_both] shadow-md">
                  <Sparkles className="w-4.5 h-4.5 text-[#c27aff] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-extrabold text-white block">Unsure of exact load-in time? No problem!</span>
                    <span className="text-white/80 leading-relaxed block">
                      Our 7th Heaven band booking admin will coordinate your event schedule, update the load-in setup time, and send a confirmation email directly to the planner.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Venue Address & Location Picker */}
            <div className="space-y-5">
              <div className="border-b border-white/10 pb-3">
                <h3 className="text-xs font-black uppercase tracking-widest text-purple-300 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#c27aff]" /> Venue Address & Location Setup
                </h3>
              </div>

              {addressNotification && (
                <div className="flex items-center gap-2.5 p-3 bg-cyan-950/70 border border-cyan-400/40 rounded-xl text-xs font-bold text-cyan-200 animate-[fade-in_0.15s_ease-out]">
                  <CheckCircle2 className="w-4 h-4 text-purple-400shrink-0" />
                  <span>{addressNotification}</span>
                </div>
              )}



              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Venue Name" name="venueName" value={formData.venueName} onChange={handleChange} required placeholder="Venue name (e.g. Bridges Scoreboard)" />
                <InputField label="City" name="venueCity" value={formData.venueCity} onChange={handleChange} required placeholder="Chicago" />

                <InputField label="State" name="venueState" value={formData.venueState} onChange={handleChange} required placeholder="IL" />

                {/* Row 2 Right: SquishyToggle for custom parking directions */}
                <div className="flex items-end pb-0.5 gap-2.5 flex-wrap md:flex-nowrap">
                  <div className="flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-extrabold text-[#c27aff] select-none shadow-inner">
                    <SquishyToggle
                      id="toggle-parking-notes"
                      checked={hasParkingNotes}
                      onChange={(next) => {
                        setHasParkingNotes(next);
                        if (!next) {
                          setFormData(prev => ({ ...prev, parkingNotes: "" }));
                        }
                      }}
                      label="Add custom parking directions"
                    />
                    <span className="text-[#c27aff] font-extrabold tracking-wide text-xs">
                      Add custom parking directions
                    </span>
                  </div>
                </div>

                {/* Interactive Map Picker Modal */}
                <MapPickerModal
                  isOpen={showMapPicker}
                  onClose={() => setShowMapPicker(false)}
                  initialAddress={formData.parkingAddress || `${formData.venueName} ${formData.venueCity} ${formData.venueState}`.trim()}
                  savedAddresses={savedAddresses}
                  onSelectSaved={handleSelectSavedAddress}
                  onSaveNewAddress={handleSaveCurrentAddress}
                  onDeleteSavedAddress={handleDeleteSavedAddress}
                  onSave={(savedAddr, fullData) => {
                    if (fullData && (fullData.venueName || fullData.venueCity)) {
                      handleSelectSavedAddress(fullData as SavedAddress);
                    } else {
                      setFormData(prev => ({ ...prev, parkingAddress: savedAddr }));
                      setAddressNotification(`Updated parking address to: ${savedAddr}`);
                      setTimeout(() => setAddressNotification(null), 3000);
                    }
                  }}
                />



                {/* Row 4: Parking location link & directions expands when checkbox is checked */}
                {hasParkingNotes && (
                  <div className="md:col-span-2 space-y-4 animate-[fade-in-up_0.15s_ease-out_both] p-4 bg-purple-950/20 border border-purple-500/30 rounded-xl">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <label htmlFor="parkingAddress" className="text-base font-bold uppercase tracking-[0.15em] text-white/60 block">
                          Google Maps Parking Location or Link
                        </label>
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => setShowMapPicker(true)}
                            className="text-xs font-bold text-[#c27aff] hover:text-purple-300 flex items-center gap-1 hover:underline cursor-pointer"
                          >
                            <MapPin className="w-3.5 h-3.5" /> Pick on Map
                          </button>
                          <span className="text-white/20">•</span>
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              [formData.parkingAddress || formData.venueName, formData.venueCity, formData.venueState, "parking"]
                                .filter(Boolean)
                                .join(" ") || "Chicago IL parking"
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-purple-300 hover:text-purple-200 flex items-center gap-1 hover:underline"
                          >
                            <Compass className="w-3.5 h-3.5 text-purple-300" /> Search Google Maps ↗
                          </a>
                          <span className="text-white/20">•</span>
                          <button
                            type="button"
                            onClick={() => handleSaveCurrentAddress()}
                            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 hover:underline cursor-pointer"
                          >
                            <Bookmark className="w-3.5 h-3.5" /> Save Link
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
                          className="w-full bg-white/5 border-0 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none transition-colors rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="parkingNotes" className="text-base font-bold uppercase tracking-[0.15em] text-white/60 block">
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
                          className="w-full bg-white/5 border-0 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none transition-colors rounded-lg resize-y min-h-[90px]"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Steps 4-6 and Sidebar 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
            <div className="flex flex-col gap-8">

              {/* Step 4: Technical & Logistics */}
              <div className="bg-transparent border-0 p-0 shadow-none relative">
                <h2 className="text-lg font-bold uppercase tracking-[0.2em] text-purple-400mb-6 flex items-center gap-3">
                  Technical & Logistics
                </h2>
                <div className="flex flex-col gap-8">
                  <RadioPillField label="Indoor / Outdoor" name="indoorOutdoor" value={formData.indoorOutdoor} onChange={handleChange} options={["Indoor", "Outdoor", "Both / Hybrid", "TBD"]} />
                  <RadioPillField label="Sound System Available?" name="soundSystem" value={formData.soundSystem} onChange={handleChange} options={["Yes — full PA system", "Partial — need supplemental", "No — band needs to provide", "Not sure"]} />
                  <RadioPillField label="Stage Available?" name="stageAvailable" value={formData.stageAvailable} onChange={handleChange} options={["Yes", "No — performing at floor level", "Portable / riser can be arranged", "Not sure"]} />
                  <RadioPillField label="Backline Provided?" name="backlineProvided" value={formData.backlineProvided} onChange={handleChange} options={["Yes — amps, drums, etc.", "Partial", "No — band brings everything", "Not sure"]} />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-2 border-t border-white/10 pt-8">
                    <div>
                      <InputField label="Expected Attendance" name="expectedAttendance" value={formData.expectedAttendance} onChange={handleChange} placeholder="~200 people" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 5: Additional Options */}
              <div className="bg-transparent border-0 p-0 shadow-none relative">
                <h2 className="text-lg font-bold uppercase tracking-[0.2em] text-purple-400mb-2 flex items-center gap-3">
                  Production & Extras
                </h2>
                <p className="text-white/60 text-lg mb-6">Select any features you&apos;d like the band to bring to your event. Pricing discussed with your band manager.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(() => {
                    const addOnsSet = new Set(addOns);
                    return ([] as { id: string; icon: string; label: string; desc: string }[]).map(option => {
                      const isActive = addOnsSet.has(option.id);
                      return (
                        <button aria-label="Previous"
                          key={option.id}
                          type="button"
                          onClick={() => setAddOns(prev => isActive ? prev.filter(a => a !== option.id) : [...prev, option.id])}
                          className={`w-full text-left p-4 rounded-xl border transition-colors cursor-pointer flex items-start gap-3 group
                          ${isActive
                              ? 'border-cyan-400 bg-cyan-500/20 shadow-md'
                              : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                            }`}
                        >
                          <span className="text-xl mt-0.5">{option.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`text-base font-bold block ${isActive ? 'text-cyan-300' : 'text-white'}`}>{option.label}</span>
                              {isActive && (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                              )}
                            </div>
                            <span className="text-base text-white/60 block leading-snug">{option.desc}</span>
                          </div>
                        </button>
                      );
                    });
                  })()}
                </div>
                {addOns.length > 0 && (
                  <div className="mt-5 pt-4 border-t border-white/10 flex items-center gap-3 flex-wrap">
                    <span className="text-base font-bold uppercase tracking-widest text-white/50">Selected:</span>
                    {addOns.map(id => (
                      <span key={id} className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-500/20 text-cyan-300 text-base font-bold rounded-full border border-cyan-400/30">
                        {id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                        <button aria-label="Previous" type="button" onClick={() => setAddOns(prev => prev.filter(a => a !== id))} className="ml-0.5 text-cyan-400/50 hover:text-cyan-300 cursor-pointer">×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Step 6: Notes & Questions */}
              <div className="bg-transparent border-0 p-0 shadow-none relative">
                <h2 className="text-lg font-bold uppercase tracking-[0.2em] text-purple-400mb-2 flex items-center gap-3">
                  Notes & Questions
                </h2>
                <p className="text-white/60 text-lg mb-4">Anything else you&apos;d like to mention? Special requests, questions, or details for our band manager.</p>
                <div className="input-glow-border rounded-lg">
                  <textarea aria-label="Text input"
                    name="details"
                    value={formData.details}
                    onChange={handleChange}
                    rows={5}
                    placeholder="e.g. We need a specific song for the first dance, the venue has a noise curfew at 10pm, or any questions about pricing, gear, or logistics…"
                    className="w-full bg-white/5 border-0 text-white text-base leading-relaxed px-4 py-3 focus:outline-none transition resize-none placeholder:text-white/40 rounded-lg"
                  />
                </div>
                {formData.details && (
                  <div className="mt-3 flex items-center gap-2 text-base text-emerald-400">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                    <span className="uppercase tracking-widest font-bold">Note attached to your booking</span>
                  </div>
                )}
              </div>

              {/* Honeypot */}
              <div className="hidden" aria-hidden="true">
                <input aria-label="Input field" type="text" name="website" value={formData.website} onChange={e => setFormData({ ...formData, website: e.target.value })} tabIndex={-1} autoComplete="off" />
              </div>

            </div>

            {/* Right Column: Sticky Summary Sidebar */}
            <div>
              <div className="sticky top-32">
                <div className="bg-transparent border-0 p-0 shadow-none">
                  <h3 className="text-lg font-bold tracking-[0.2em] uppercase text-white mb-6 pb-4 border-b border-white/10">Booking Summary</h3>

                  <div className="flex flex-col gap-4 mb-8">
                    <div className="flex justify-between items-start">
                      <span className="text-lg text-white/50 uppercase tracking-widest mt-1">Date</span>
                      <span className="text-base font-bold text-white text-right">
                        {bookingSlots.length === 1 ? (
                          new Date(bookingSlots[0].date + "T12:00:00Z").toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
                        ) : bookingSlots.length > 1 ? (
                          `${bookingSlots.length} Shows Scheduled`
                        ) : (
                          <span className="text-white/30">—</span>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-lg text-white/50 uppercase tracking-widest mt-1">Time</span>
                      <span className="text-base font-bold text-white text-right">
                        {bookingSlots.length === 1 ? (
                          `${bookingSlots[0].startTime} – ${bookingSlots[0].endTime}`
                        ) : bookingSlots.length > 1 ? (
                          "Varies by show"
                        ) : (
                          <span className="text-white/30">—</span>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-lg text-white/50 uppercase tracking-widest mt-1">Format</span>
                      <span className="text-base font-bold text-cyan-300 text-right">
                        {selectedType ? eventTypes.find(t => t.id === selectedType)?.label : <span className="text-cyan-400/30">—</span>}
                      </span>
                    </div>
                    <div className="flex justify-between items-start pt-4 border-t border-white/10">
                      <span className="text-lg text-white/50 uppercase tracking-widest mt-1">Venue</span>
                      <span className="text-base font-bold text-white text-right break-words max-w-[150px]">
                        {formData.venueName ? formData.venueName : <span className="text-white/30">—</span>}
                        {formData.venueCity && <span className="block text-base text-white/50 font-normal">{formData.venueCity}, {formData.venueState}</span>}
                      </span>
                    </div>
                    {addOns.length > 0 && (
                      <div className="flex justify-between items-start pt-4 border-t border-white/10">
                        <span className="text-lg text-white/50 uppercase tracking-widest mt-1">Add-Ons</span>
                        <div className="text-right">
                          <span className="text-base font-bold text-cyan-300">{addOns.length} selected</span>
                          <div className="flex flex-wrap gap-1 mt-1 justify-end max-w-[160px]">
                            {addOns.slice(0, 3).map(id => (
                              <span key={id} className="text-lg bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded font-bold">{id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
                            ))}
                            {addOns.length > 3 && <span className="text-lg text-white/40 font-bold">+{addOns.length - 3} more</span>}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>



                  {/* Validation Errors */}
                  {validationErrors.length > 0 && (
                    <div className="bg-rose-500/10 border border-rose-500/30 p-4 mb-4 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-rose-400 text-sm">⚠</span>
                        <span className="text-rose-300 text-lg font-bold uppercase tracking-widest">Please fix the following</span>
                      </div>
                      <ul className="space-y-1">
                        {validationErrors.map((err, i) => (
                          <li key={`err-${i}-${err}`} className="text-rose-300 text-base pl-5 relative before:content-['•'] before:absolute before:left-1.5 before:text-rose-400">{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <button aria-label="Action button"
                    type="submit"
                    disabled={submitting || !selectedType || bookingSlots.length === 0 || !formData.startTime || !formData.endTime || !formData.email}
                    className="w-full bg-gradient-to-r from-purple-600 via-cyan-500 to-emerald-500 hover:from-purple-500 hover:to-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black tracking-wider uppercase text-base py-4 transition-all flex items-center justify-center gap-2 rounded-xl shadow-lg shadow-cyan-500/25"
                  >
                    {submitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        Submit Booking Request
                      </>
                    )}
                  </button>
                  <p className="text-base text-white/50 text-center mt-4">
                    By submitting, you confirm you are 18 years of age or older and agree to our <Link href="/privacy" className="underline hover:text-white transition-colors">Privacy Policy</Link> and <Link href="/terms" className="underline hover:text-white transition-colors">Terms</Link>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>


      </section>
    </div>
  );
}


function BookingSlotMetadataSection({ slot, bookingSlots, setBookingSlots }: { slot: any; bookingSlots: any[]; setBookingSlots: (s: any[]) => void }) {
  return (
    <div className="mt-4 space-y-3 animate-[fade-in-up_0.15s_ease-out_both]">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label htmlFor={`slot-age-limit-${slot.id}`} className="text-[var(--font-size-4xs)] font-bold uppercase tracking-widest text-white/50 block mb-1">Age Limit</label>
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
              const updated = bookingSlots.map(s => s.id === slot.id ? { ...s, ageRestriction: val } : s);
              setBookingSlots(updated);
            }}
            className="w-full"
          />
        </div>
        <div>
          <label htmlFor={`slot-doors-time-${slot.id}`} className="text-[var(--font-size-4xs)] font-bold uppercase tracking-widest text-white/50 block mb-1">Doors Time</label>
          <Dropdown
            id={`slot-doors-time-${slot.id}`}
            fullWidth={true}
            placeholder="Same as Start"
            selected={slot.doorsTime || ""}
            options={["Same as Start", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM", "10:00 PM", "11:00 PM", "12:00 AM"]}
            onChange={(val) => {
              const updated = bookingSlots.map(s => s.id === slot.id ? { ...s, doorsTime: val } : s);
              setBookingSlots(updated);
            }}
            className="w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label htmlFor={`slot-cover-${slot.id}`} className="text-[var(--font-size-4xs)] font-bold uppercase tracking-widest text-white/50 block mb-1">Cover / Price</label>
          <input aria-label="Input field"
            id={`slot-cover-${slot.id}`}
            type="text"
            placeholder="e.g. Free, $15..."
            value={slot.cover || ""}
            onChange={(e) => {
              const updated = bookingSlots.map(s => s.id === slot.id ? { ...s, cover: e.target.value } : s);
              setBookingSlots(updated);
            }}
            className="w-full bg-white/5 backdrop-blur-md border border-white/15 text-xs py-2 px-3 rounded-lg outline-none text-white focus:border-cyan-400 placeholder:text-white/30 shadow-inner"
          />
        </div>
        <div>
          <label htmlFor={`slot-ticket-link-${slot.id}`} className="text-[var(--font-size-4xs)] font-bold uppercase tracking-widest text-white/50 block mb-1">Ticket Link</label>
          <input aria-label="Input field"
            id={`slot-ticket-link-${slot.id}`}
            type="text"
            placeholder="https://..."
            value={slot.ticketLink || ""}
            onChange={(e) => {
              const updated = bookingSlots.map(s => s.id === slot.id ? { ...s, ticketLink: e.target.value } : s);
              setBookingSlots(updated);
            }}
            className="w-full bg-white/5 backdrop-blur-md border border-white/15 text-xs py-2 px-3 rounded-lg outline-none text-white focus:border-cyan-400 placeholder:text-white/30 shadow-inner"
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
    <div className="fixed inset-0 z-[999999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-[fade-in_0.15s_ease-out]">
      <div className="bg-[#0f0921] border border-purple-500/40 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl space-y-5 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#c27aff]" />
            <h3 className="text-lg font-black uppercase tracking-wider text-white">Google Maps Location & Address Picker</h3>
          </div>
          <button aria-label="Close modal"
            type="button"
            onClick={onClose}
            className="p-1 text-white/50 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Saved Addresses & Quick Presets List */}
        {savedAddresses.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-widest text-purple-400block">Saved Locations & Venue Presets</label>
              <span className="text-[10px] text-white/50 font-normal">Click to auto-fill form</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {savedAddresses.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-400/50 rounded-xl transition-all flex items-start justify-between gap-2 group cursor-pointer"
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
                  <div className="space-y-0.5 min-w-0">
                    <div className="text-xs font-black text-white truncate flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-[#c27aff] shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </div>
                    <div className="text-[11px] text-white/60 truncate">
                      {item.parkingAddress} {item.venueCity ? `, ${item.venueCity}` : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSelectSaved) {
                          onSelectSaved(item);
                          onClose();
                        } else {
                          onSave(item.parkingAddress, item);
                          onClose();
                        }
                      }}
                      className="px-2 py-1 bg-purple-600/40 hover:bg-purple-600/70 border border-purple-400/40 rounded text-[10px] font-bold text-white uppercase tracking-wider"
                    >
                      Use
                    </button>
                    {!item.id.startsWith("preset-") && onDeleteSavedAddress && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSavedAddress(item.id);
                        }}
                        className="p-1 text-white/40 hover:text-red-400 transition-colors"
                        title="Delete saved address"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2 border-t border-white/10 pt-4">
          <label className="text-xs font-bold uppercase tracking-widest text-purple-400block">Search Location or Paste Google Maps Address</label>
          <div className="flex gap-2">
            <input aria-label="Input field"
              type="text"
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              placeholder="e.g. 980 S Bartlett Rd, Gate B or paste Google Maps URL"
              className="flex-1 bg-white/5 border border-white/15 rounded-lg px-4 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
            />
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressInput || "Chicago, IL")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2.5 bg-purple-600/40 hover:bg-purple-600/60 border border-purple-400/40 rounded-lg text-xs font-bold text-white uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 shrink-0"
            >
              <Navigation className="w-3.5 h-3.5 text-cyan-300" /> Open Map
            </a>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-4 border-t border-white/10 flex-wrap">
          {onSaveNewAddress && (
            <button
              type="button"
              onClick={() => {
                if (addressInput.trim()) {
                  onSaveNewAddress(addressInput.trim());
                }
              }}
              className="px-3.5 py-2 bg-[var(--color-accent)] rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
            >
              <Bookmark className="w-3.5 h-3.5" /> Save to Favorites
            </button>
          )}
          <div className="flex items-center gap-3 ml-auto">
            <button aria-label="Cancel button"
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-white/60 hover:text-white uppercase tracking-wider transition-colors"
            >
              Cancel
            </button>
            <button aria-label="Save button"
              type="button"
              onClick={() => {
                onSave(addressInput);
                onClose();
              }}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 rounded-lg text-xs font-black text-white uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Save Location to Form
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
