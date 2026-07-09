"use client";

import React from 'react';

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useMember } from "@/context/MemberContext";

import { adminKillStream, adminBanUser, seedMockData, adminCreateCrewMember, adminResetPassword, adminCreateAdmin } from "./actions";
import { CrewSetPasswordModal } from "@/components/CrewSetPasswordModal";
import ShowCrewPanel from "@/components/ShowCrewPanel";
import InviteChallengePanel from "@/components/admin/InviteChallengePanel";
import dynamic from 'next/dynamic';

const AdminMap = dynamic(() => import('@/components/AdminMap'), {
  ssr: false,
  loading: () => <div className="w-full h-[400px] bg-black/40 rounded-xl animate-pulse" />
});

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';

import ReferralProgramPanel from "@/components/admin/ReferralProgramPanel";
import BulkInvitePanel from "@/components/admin/BulkInvitePanel";
import AwardPicksPanel from "@/components/admin/AwardPicksPanel";
import CustomScrollbar from "@/components/CustomScrollbar";

interface ParsedCruiseNotes {
  cabin?: string;
  insurance?: string;
  gratuities?: string;
  howHeard?: string;
  guests: { name: string; dob?: string; tshirt?: string; crownAnchor?: string }[];
  payments: { method: string; cardholder?: string; cardMasked?: string; charge?: string }[];
  signature?: string;
  sigDate?: string;
  additionalNotes?: string;
}

function parseCruiseNotes(notes: string): ParsedCruiseNotes | null {
  if (!notes) return null;
  const result: ParsedCruiseNotes = { guests: [], payments: [] };

  // Parse Cabin Selection
  const cabinMatch = notes.match(/Cabin Selection:\s*(.*)/i);
  if (cabinMatch) result.cabin = cabinMatch[1].trim();

  // Parse Travel Insurance
  const insMatch = notes.match(/Travel Insurance:\s*(.*)/i);
  if (insMatch) result.insurance = insMatch[1].trim();

  // Parse Pre-paid Gratuities
  const gratMatch = notes.match(/Pre-paid Gratuities:\s*(.*)/i);
  if (gratMatch) result.gratuities = gratMatch[1].trim();

  // Parse Hear About Us
  const hearMatch = notes.match(/Hear About Us:\s*(.*)/i);
  if (hearMatch) result.howHeard = hearMatch[1].trim();

  // Parse Guests using regex
  const guestRegex = /--- Guest (\d+)[^\n]*\n([\s\S]*?)(?=---|===|Payment Method|\n\n|$)/g;
  let match;
  while ((match = guestRegex.exec(notes)) !== null) {
    const guestBody = match[2];
    const nameM = guestBody.match(/Name:\s*(.*)/i);
    const dobM = guestBody.match(/DOB:\s*(.*)/i);
    const shirtM = guestBody.match(/T-shirt:\s*(.*)/i);
    const caM = guestBody.match(/Crown & Anchor:\s*(.*)/i);
    if (nameM && nameM[1].trim()) {
      result.guests.push({
        name: nameM[1].trim(),
        dob: dobM ? dobM[1].trim() : undefined,
        tshirt: shirtM ? shirtM[1].trim() : undefined,
        crownAnchor: caM ? caM[1].trim() : undefined,
      });
    }
  }

  // Parse Payment Methods
  const paymentRegex = /--- Payment Method (\d+)[^\n]*\n([\s\S]*?)(?=---|===|E-Signature|\n\n|$)/g;
  while ((match = paymentRegex.exec(notes)) !== null) {
    const payNum = match[1];
    const payBody = match[2];
    const cardM = payBody.match(/Cardholder:\s*(.*)/i);
    const cardMaskM = payBody.match(/Card \(masked\):\s*(.*)/i);
    const chargeM = payBody.match(/Charge:\s*(.*)/i);
    result.payments.push({
      method: `Card ${payNum}`,
      cardholder: cardM ? cardM[1].trim() : undefined,
      cardMasked: cardMaskM ? cardMaskM[1].trim() : undefined,
      charge: chargeM ? chargeM[1].trim() : undefined,
    });
  }

  // Parse Signature
  const sigMatch = notes.match(/Signature:\s*(.*)/i);
  if (sigMatch) result.signature = sigMatch[1].trim();

  const sigDateMatch = notes.match(/Date Signed:\s*(.*)/i);
  if (sigDateMatch) result.sigDate = sigDateMatch[1].trim();

  // Parse Additional Notes
  const addNotesMatch = notes.match(/--- Additional Notes ---\n([\s\S]*)/i);
  if (addNotesMatch) result.additionalNotes = addNotesMatch[1].trim();

  return result;
}

export default function AdminDashboard() {
  const { member, isLoggedIn, login, logout } = useMember();
  const [feeds, setFeeds] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [filterRole, setFilterRole] = useState<"All" | "fan" | "crew" | "admin">("All");
  const [moderationQueue, setModerationQueue] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    window.scrollTo(0, 0);
  }, []);
  const [adminTab, setAdminTab] = useState<'band' | 'cruise'>('band');
  const adminTabRef = useRef<'band' | 'cruise'>('band');
  const [unreadCruiseChat, setUnreadCruiseChat] = useState(0);
  const [showSetPassword, setShowSetPassword] = useState(false);
  const [firstLoginEmail, setFirstLoginEmail] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [createdAdmin, setCreatedAdmin] = useState<{ name: string; email: string; password: string } | null>(null);
  const [adminCreateError, setAdminCreateError] = useState('');
  const [adminCreateLoading, setAdminCreateLoading] = useState(false);

  const [showJumpNav, setShowJumpNav] = useState(() => {
    if (typeof window === 'undefined') return true;
    const saved = localStorage.getItem('7h_show_jump_nav');
    return saved !== 'false';
  });

  const toggleJumpNav = () => {
    setShowJumpNav(prev => {
      const next = !prev;
      localStorage.setItem('7h_show_jump_nav', String(next));
      return next;
    });
  };

  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [customRoles, setCustomRoles] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const defaultPresets = ["CAMERA", "BAND EQUIPMENT", "UNLOADING", "SERVER", "CHEF", "LINE COOK", "MANAGER", "AUDIO MIX"];
      const saved = localStorage.getItem('7h_custom_roles');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const migrated = localStorage.getItem('7h_roles_migrated_v2');
          if (!migrated) {
            const merged = Array.from(new Set([...defaultPresets, ...parsed]));
            setCustomRoles(merged);
            localStorage.setItem('7h_custom_roles', JSON.stringify(merged));
            localStorage.setItem('7h_roles_migrated_v2', 'true');
          } else {
            setCustomRoles(parsed);
          }
        } catch (e) {
          setCustomRoles(defaultPresets);
          localStorage.setItem('7h_custom_roles', JSON.stringify(defaultPresets));
          localStorage.setItem('7h_roles_migrated_v2', 'true');
        }
      } else {
        setCustomRoles(defaultPresets);
        localStorage.setItem('7h_custom_roles', JSON.stringify(defaultPresets));
        localStorage.setItem('7h_roles_migrated_v2', 'true');
      }
    }
  }, []);

  const saveCustomRole = (role: string) => {
    const trimmed = role.trim().toUpperCase();
    if (!trimmed) return;
    setCustomRoles(prev => {
      if (prev.includes(trimmed)) return prev;
      const next = [...prev, trimmed];
      localStorage.setItem('7h_custom_roles', JSON.stringify(next));
      return next;
    });
  };

  const deleteCustomRole = (role: string) => {
    setCustomRoles(prev => {
      const next = prev.filter(r => r !== role);
      localStorage.setItem('7h_custom_roles', JSON.stringify(next));
      return next;
    });
  };

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const container = document.getElementById('role-suggest-container');
      if (container && !container.contains(e.target as Node)) {
        setShowRoleDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    const handleTourDropdownOutside = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest('[data-tour-dropdown]');
      if (!el) setShowTourDropdown(false);
    };
    document.addEventListener('mousedown', handleTourDropdownOutside);
    return () => document.removeEventListener('mousedown', handleTourDropdownOutside);
  }, []);

  useEffect(() => {
    const handleGlobalDragEnd = () => {
      setDraggedShiftId(null);
      draggedShiftIdRef.current = null;
    };
    window.addEventListener('dragend', handleGlobalDragEnd);
    return () => window.removeEventListener('dragend', handleGlobalDragEnd);
  }, []);

  const syncTourDatesToCalendar = (tourList: any[], currentSchedules: any[]) => {
    if (!tourList || tourList.length === 0) return;
    
    let updated = [...currentSchedules];
    let changed = false;
    
    tourList.forEach((show: any) => {
      const showDate = show.date;
      if (!showDate) return;
      
      const hasShifts = updated.some(s => s.date === showDate);
      if (!hasShifts) {
        const defaultRoles = [
          { role: 'BAND EQUIPMENT', startHour: 16.0, endHour: 22.0, time: '4:00 PM - 10:00 PM' },
          { role: 'UNLOADING', startHour: 15.0, endHour: 20.0, time: '3:00 PM - 8:00 PM' },
          { role: 'CAMERA', startHour: 18.0, endHour: 23.0, time: '6:00 PM - 11:00 PM' },
          { role: 'AUDIO MIX', startHour: 17.0, endHour: 23.0, time: '5:00 PM - 11:00 PM' }
        ];
        
        const venueName = show.venue || show.venue_name || 'Show Venue';
        const cityStr = show.city ? `${show.city}, ${show.state || 'IL'}` : '';
        const loc = cityStr ? `${venueName} at ${cityStr}` : venueName;
        
        defaultRoles.forEach((def, index) => {
          const newId = `show_shift_${showDate}_${index}_${Date.now()}`;
          const newItem = {
            id: newId,
            crewId: 'openshifts',
            crewName: 'OpenShifts',
            date: showDate,
            startHour: def.startHour,
            endHour: def.endHour,
            time: def.time,
            role: def.role,
            location: loc,
            notes: `Auto-generated for show: ${venueName}`,
            openSlots: 1,
            isDraft: true
          };
          updated.push(newItem);
        });
        changed = true;
      }
    });
    
    if (changed) {
      setSchedules(updated);
      localStorage.setItem('7h_crew_schedules', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
      
      fetch("/api/crew/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
      }).catch(err => console.error("Failed to sync schedules:", err));
    }
  };

  // Helper to parse time strings like "6:00 PM - 11:30 PM" into decimal hours (8.0 to 24.0)
  const parseTimeString = (timeStr: string) => {
    const defaultVal = { startHour: 18.0, endHour: 21.0 };
    if (!timeStr) return defaultVal;
    try {
      const parts = timeStr.split('-');
      if (parts.length !== 2) return defaultVal;
      
      const parsePart = (part: string) => {
        const clean = part.trim().toUpperCase();
        const isPM = clean.includes('PM');
        const isAM = clean.includes('AM');
        const numbers = clean.replace(/[A-Z\\s]/g, '').trim().split(':');
        let hour = parseInt(numbers[0], 10);
        let minute = numbers.length > 1 ? parseInt(numbers[1], 10) : 0;
        
        if (isPM && hour !== 12) hour += 12;
        if (isAM && hour === 12) hour = 0;
        
        return hour + minute / 60;
      };
      
      return {
        startHour: parsePart(parts[0]),
        endHour: parsePart(parts[1])
      };
    } catch (e) {
      return defaultVal;
    }
  };

  // Helper to format decimal hour (e.g. 18.5) to string (e.g. "6:30 PM")
  const formatHour = (hourDecimal: number) => {
    const h = Math.floor(hourDecimal);
    const m = Math.round((hourDecimal - h) * 60);
    const period = h >= 12 ? 'PM' : 'AM';
    let displayHour = h % 12;
    if (displayHour === 0) displayHour = 12;
    const displayMinute = m === 0 ? '' : `:${String(m).padStart(2, '0')}`;
    return `${displayHour}${displayMinute} ${period}`;
  };

  // Helper to format start/end decimal hours into "Start - End" time frame
  const formatTimeFrame = (start: number, end: number) => {
    return `${formatHour(start)} - ${formatHour(end)}`;
  };

  // Crew Schedule DND Calendar State
  const [schedules, setSchedules] = useState<{ id: string; crewId: string; crewName: string; date: string; time: string; role: string; location: string; notes: string; startHour: number; endHour: number; isTimeOff?: boolean; isDraft?: boolean; labelOverride?: string; openSlots?: number }[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('7h_crew_schedules');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) {
          return parsed.map((item: any) => {
            if (item.startHour === undefined || item.endHour === undefined) {
              const p = parseTimeString(item.time);
              return {
                ...item,
                startHour: p.startHour,
                endHour: p.endHour
              };
            }
            return item;
          });
        }
      }
      
      // Default Mock Example Data
      const defaultMocks = [
        { id: 'mock_1', crewId: 'arjun', crewName: 'Arjun Patel', date: '2023-01-23', startHour: 17.0, endHour: 22.0, time: '5:00 PM - 10:00 PM', role: 'SERVER', location: 'The Chicago Theatre', notes: 'Lead server for VIP tables' },
        { id: 'mock_2', crewId: 'abbie', crewName: 'Abbie Janssen', date: '2023-01-24', startHour: 17.0, endHour: 22.0, time: '5:00 PM - 10:00 PM', role: 'SERVER', location: 'The Chicago Theatre', notes: '' },
        { id: 'mock_3', crewId: 'al', crewName: 'Al Hollie', date: '2023-01-25', startHour: 18.0, endHour: 23.5, time: '6:00 PM - 11:30 PM', role: 'SERVER', location: 'The Chicago Theatre', notes: '' },
        { id: 'mock_4', crewId: 'andrea', crewName: 'Andrea Kinzinger', date: '2023-01-26', startHour: 16.0, endHour: 22.0, time: '4:00 PM - 10:00 PM', role: 'CHEF', location: 'The Chicago Theatre', notes: 'Kitchen lead' },
        { id: 'mock_5', crewId: 'openshifts', crewName: 'OpenShifts', date: '2023-01-26', startHour: 18.0, endHour: 23.0, time: '6:00 PM - 11:00 PM', role: 'SERVER', location: 'The Chicago Theatre', notes: 'Need 1 backup server', openSlots: 1 },
        { id: 'mock_6', crewId: 'chris', crewName: 'Chris Loxely', date: '2023-01-27', startHour: 18.0, endHour: 23.5, time: '6:00 PM - 11:30 PM', role: 'SERVER', location: 'The Chicago Theatre', notes: '' },
        { id: 'mock_7', crewId: 'dave_croke', crewName: 'Dave Croke', date: '2023-01-27', startHour: 17.0, endHour: 23.0, time: '5:00 PM - 11:00 PM', role: 'LINE COOK', location: 'The Chicago Theatre', notes: '' },
        { id: 'mock_8', crewId: 'abbie', crewName: 'Abbie Janssen', date: '2023-01-27', startHour: 18.0, endHour: 23.0, time: '6:00 PM - 11:00 PM', role: 'SERVER', location: 'The Chicago Theatre', notes: '' },
        { id: 'mock_9', crewId: 'daniel', crewName: 'Daniel Kim', date: '2023-01-28', startHour: 17.0, endHour: 24.0, time: '5:00 PM - 12:00 AM', role: 'MANAGER', location: 'The Chicago Theatre', notes: 'Closing manager' },
        { id: 'mock_10', crewId: 'openshifts', crewName: 'OpenShifts', date: '2023-01-29', startHour: 12.0, endHour: 17.0, time: '12:00 PM - 5:00 PM', role: 'SERVER', location: 'The Chicago Theatre', notes: 'Matinee show setup', openSlots: 2 }
      ];
      localStorage.setItem('7h_crew_schedules', JSON.stringify(defaultMocks));
      return defaultMocks;
    } catch {
      return [];
    }
  });

  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    // Default to Monday, Jan 23, 2023 to match the screenshot exactly on load!
    return new Date(2023, 0, 23);
  });

  const [editingShiftId, setEditingShiftId] = useState<string | null>(null);
  const [calendarView, setCalendarView] = useState<'timeline' | 'roster' | 'list'>('roster');
  const [calendarRange, setCalendarRange] = useState<'week' | '4weeks' | 'month'>('week');
  const [selectedCrewAssignments, setSelectedCrewAssignments] = useState<{ [crewId: string]: { active: boolean; customized?: boolean; role: string; startHour: number; endHour: number } }>({});
  const [drawerCrewSearch, setDrawerCrewSearch] = useState('');
  
  // Schedule filter & leaderboard states
  const [scheduleCrewFilter, setScheduleCrewFilter] = useState<string>('');
  const [showTourDatesOnly, setShowTourDatesOnly] = useState(false);
  const [showTourDropdown, setShowTourDropdown] = useState(false);
  const [selectedTourDate, setSelectedTourDate] = useState<string | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(true);
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<'day' | 'week' | 'month' | 'year'>('week');
  const [rosterExpanded, setRosterExpanded] = useState(false);
  const [collapsedCrewIds, setCollapsedCrewIds] = useState<string[]>([]);
  
  // Drag and drop local tracking states
  const [draggedShiftId, setDraggedShiftId] = useState<string | null>(null);
  const draggedShiftIdRef = useRef<string | null>(null);
  const draggedShiftDurationRef = useRef<number>(0);
  const [draggedCrewMemberId, setDraggedCrewMemberId] = useState<string | null>(null);
  const [activeDropDay, setActiveDropDay] = useState<string | null>(null);
  const [selectedShowCrewDate, setSelectedShowCrewDate] = useState<string | null>(null);

  // Group scheduling and capacity states
  const [cellGroupPopover, setCellGroupPopover] = useState<string | null>(null);
  const [showGroupsSubmenu, setShowGroupsSubmenu] = useState<string | null>(null);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [createGroupForDate, setCreateGroupForDate] = useState<string | null>(null);
  const [newGroupNameInput, setNewGroupNameInput] = useState('');
  const [newGroupMemberSettings, setNewGroupMemberSettings] = useState<{ [crewId: string]: { active: boolean; role: string; startHour: number; endHour: number } }>({});
  const [groupNameError, setGroupNameError] = useState('');
  const [showCapacityHeatmap, setShowCapacityHeatmap] = useState(false);

  const [crewGroups, setCrewGroups] = useState<{ name: string; memberIds: string[]; memberSettings?: { [crewId: string]: { startHour: number; endHour: number; role: string } } }[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('7h_crew_groups');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback to presets
      }
    }
    return [
      {
        name: "Servers",
        memberIds: ["abbie", "al", "arjun", "chris", "emily"]
      },
      {
        name: "Kitchen",
        memberIds: ["andrea", "dave_croke", "dave_maas", "emma", "tony"]
      },
      {
        name: "Managers",
        memberIds: ["daniel", "david_xu", "francesca"]
      }
    ];
  });

  // Quick-add modal state values
  const [dropStartHour, setDropStartHour] = useState<number>(12);
  const [dropEndHour, setDropEndHour] = useState<number>(17);
  const [dropRole, setDropRole] = useState<string>('SERVER');
  const [isFilteringRoles, setIsFilteringRoles] = useState(false);
  const [dropLocation, setDropLocation] = useState<string>('');
  const [dropNotes, setDropNotes] = useState<string>('');
  const supabase = createClient();
  // ── Collapsible Sections (persisted via localStorage & Supabase) ──
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const saved = localStorage.getItem('7h_admin_collapsed');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  const toggleSection = (key: string) => {
    setCollapsedSections(prev => {
      const next = { ...prev, [key]: !prev[key] };
      try { 
        localStorage.setItem('7h_admin_collapsed', JSON.stringify(next));
        saveLayoutToSupabase(sectionOrder, next);
      } catch {}
      return next;
    });
  };

  const isSectionOpen = (key: string) => !collapsedSections[key];

  // ── Drag & Drop Sortable Sections State & Handlers ──
  const DEFAULT_SECTION_ORDER = [
    'shopify',
    'toursync',
    'bookings',
    'planners',
    'featuredtrack',
    'photomod',
    'memorymod',
    'referral',
    'invitechallenge',
    'livealerts',
    'smsblast',
    'crewsms',
    'newsletter',
    'registry',
    'crewcreation',
    'admincreation',
    'bulkinvites',
    'awardpicks'
  ];

  const [sectionOrder, setSectionOrder] = useState<string[]>(() => {
    if (typeof window === 'undefined') return DEFAULT_SECTION_ORDER;
    try {
      const saved = localStorage.getItem('7h_admin_section_order');
      if (saved) {
        const parsed = JSON.parse(saved);
        const uniqueList = Array.from(new Set([...parsed, ...DEFAULT_SECTION_ORDER]));
        return uniqueList.filter(item => DEFAULT_SECTION_ORDER.includes(item));
      }
      return DEFAULT_SECTION_ORDER;
    } catch {
      return DEFAULT_SECTION_ORDER;
    }
  });

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Helper to save layout to Supabase User Metadata
  const saveLayoutToSupabase = async (order: string[], collapsed: Record<string, boolean>) => {
    if (!isLoggedIn) return;
    try {
      const { createClient: createSupabaseClient } = await import("@/utils/supabase/client");
      const client = createSupabaseClient();
      await client.auth.updateUser({
        data: {
          admin_section_order: order,
          admin_collapsed_sections: collapsed
        }
      });
      console.log("Admin layout saved to Supabase user metadata.");
    } catch (err) {
      console.error("Failed to save layout to Supabase:", err);
    }
  };

  // Load layout from Supabase User Metadata on mount/login
  useEffect(() => {
    if (!isLoggedIn || !member) return;
    const loadSavedLayout = async () => {
      try {
        const { createClient: createSupabaseClient } = await import("@/utils/supabase/client");
        const client = createSupabaseClient();
        const { data: { user } } = await client.auth.getUser();
        
        if (user?.user_metadata) {
          // Check for first-login password reset
          if (user.user_metadata.needs_password_reset === true) {
            setFirstLoginEmail(user.email || '');
            setShowSetPassword(true);
          }
          const savedOrder = user.user_metadata.admin_section_order;
          const savedCollapsed = user.user_metadata.admin_collapsed_sections;
          
          if (savedOrder && Array.isArray(savedOrder)) {
            const uniqueList = Array.from(new Set([...savedOrder, ...DEFAULT_SECTION_ORDER]));
            const filtered = uniqueList.filter(item => DEFAULT_SECTION_ORDER.includes(item));
            setSectionOrder(filtered);
            localStorage.setItem('7h_admin_section_order', JSON.stringify(filtered));
          }
          
          if (savedCollapsed) {
            setCollapsedSections(savedCollapsed);
            localStorage.setItem('7h_admin_collapsed', JSON.stringify(savedCollapsed));
          }
        }
      } catch (err) {
        console.error("Failed to load layout from Supabase:", err);
      }
    };
    loadSavedLayout();
  }, [isLoggedIn, member]);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const updated = [...sectionOrder];
    const item = updated.splice(draggedIndex, 1)[0];
    updated.splice(index, 0, item);
    setDraggedIndex(index);
    setSectionOrder(updated);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    try {
      localStorage.setItem('7h_admin_section_order', JSON.stringify(sectionOrder));
      saveLayoutToSupabase(sectionOrder, collapsedSections);
    } catch {}
  };

  // ── Tour Dates Sync State & Handlers ──
  const [tourDates, setTourDates] = useState<any[]>([]);
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncResult, setSyncResult] = useState<any>(null);

  const handleSyncTourDates = async () => {
    setSyncLoading(true);
    setSyncResult(null);
    try {
      const res = await fetch("/api/sync-shows", { method: "POST" });
      const data = await res.json();
      setSyncResult(data);

      if (data.success) {
        const tourRes = await fetch("/api/tour");
        if (tourRes.ok) {
          const freshTourDates = await tourRes.json();
          setTourDates(freshTourDates);
          syncTourDatesToCalendar(freshTourDates, schedules);
        }
        setAuditLog(prev => [{
          id: crypto.randomUUID(),
          text: "🔄 Synced tour dates: Scraped " + data.scraped + " shows from official site.",
          time: "Just now",
          color: "bg-emerald-500"
        }, ...prev]);
      } else {
        setAuditLog(prev => [{
          id: crypto.randomUUID(),
          text: "❌ Tour sync failed: " + (data.error || "Unknown error"),
          time: "Just now",
          color: "bg-rose-500"
        }, ...prev]);
      }
    } catch (err: any) {
      setSyncResult({ success: false, error: err.message || "Network error" });
    } finally {
      setSyncLoading(false);
    }
  };

  // ── Memory Moderation Queue State & Handlers ──
  const [memoryQueue, setMemoryQueue] = useState<any[]>([]);

  const moderateMemory = async (id: string, action: 'approve' | 'reject') => {
    setMemoryQueue(current => current.filter(m => m.id !== id));
    try {
      await fetch('/api/fans/memories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action })
      });
    } catch (err) {
      console.error(err);
    }
  };


  // Featured Track State
  const [activeFeaturedTrack, setActiveFeaturedTrack] = useState<any>(null);
  const [trackTitle, setTrackTitle] = useState(''); // Serves as Drop / Album Name
  const [dropSongs, setDropSongs] = useState<{ title: string; file: File | null }[]>([{ title: '', file: null }]);
  const [trackVisibility, setTrackVisibility] = useState<'everyone' | 'fans'>('everyone');
  const [trackDurationType, setTrackDurationType] = useState<'indefinite' | 'temporary'>('indefinite');
  const [trackDurationHours, setTrackDurationHours] = useState('24');
  const [trackCustomExpiresAt, setTrackCustomExpiresAt] = useState('');
  const [trackCompression, setTrackCompression] = useState<'superb' | 'standard' | 'high' | 'none'>('standard');
  const [trackNormalize, setTrackNormalize] = useState(true);
  const [uploadingTrack, setUploadingTrack] = useState(false);
  const [trackUploadError, setTrackUploadError] = useState('');
  const [trackUploadSuccess, setTrackUploadSuccess] = useState(false);

  // Global Announcement State
  const [bannerActive, setBannerActive] = useState(false);
  const [bannerText, setBannerText] = useState('');
  const [bannerLink, setBannerLink] = useState('');
  const [bannerExpiresAt, setBannerExpiresAt] = useState<string | null>(null);
  const [bannerUpdating, setBannerUpdating] = useState(false);

  // Cruise Announcement State
  const [cruiseMessage, setCruiseMessage] = useState('');
  const [cruiseUpdating, setCruiseUpdating] = useState(false);
  const [cruiseSaveStatus, setCruiseSaveStatus] = useState<string | null>(null);

  // Cruise Community Blast State
  const [cruiseBlastSubject, setCruiseBlastSubject] = useState('');
  const [cruiseBlastBody, setCruiseBlastBody] = useState('');
  const [cruiseBlastSending, setCruiseBlastSending] = useState(false);
  const [cruiseBlastResult, setCruiseBlastResult] = useState<{ success: boolean; message: string } | null>(null);

  // Admin login state
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoginError, setAdminLoginError] = useState('');
  const [adminLoginLoading, setAdminLoginLoading] = useState(false);

  // Crew creation state
  const [newCrewName, setNewCrewName] = useState('');
  const [newCrewEmail, setNewCrewEmail] = useState('');
  const [newCrewPassword, setNewCrewPassword] = useState('');
  const [newCrewPhone, setNewCrewPhone] = useState('');
  const [newCrewUsername, setNewCrewUsername] = useState('');
  const [createdCrew, setCreatedCrew] = useState<{ name: string; email: string; password: string; phone: string; username: string } | null>(null);
  const [crewError, setCrewError] = useState('');
  const [crewLoading, setCrewLoading] = useState(false);
  const [viewingUser, setViewingUser] = useState<string | null>(null);
  const registryRef = useRef<HTMLElement>(null);
  const loggedStreamIds = useRef<Set<string>>(new Set());

  // Shopify Sales Data
  const [shopifyData, setShopifyData] = useState<any>(null);
  const [shopifyLoading, setShopifyLoading] = useState(true);
  const [shopifyPeriod, setShopifyPeriod] = useState(30);
  const [shopifyError, setShopifyError] = useState('');

  // Fan Analytics
  const [fanData, setFanData] = useState<any>(null);

  // Google Analytics Mock Data
  const [gaData, setGaData] = useState<any>({
    activeUsers: 42,
    sessions: 1240,
    pageViews: 8430,
    avgSession: '2m 14s',
    bounceRate: '34%',
    sources: [
      { name: 'Direct', value: 45 },
      { name: 'Social', value: 25 },
      { name: 'Search', value: 20 },
      { name: 'Referral', value: 10 },
    ],
    pages: [
      { path: '/', views: 2450 },
      { path: '/live', views: 1820 },
      { path: '/fans', views: 950 },
      { path: '/tour', views: 880 },
    ],
    conversionRate: '3.8%',
    revenuePerSession: '$4.12',
    locations: [
      { city: 'Chicago, IL', percentage: 38 },
      { city: 'Nashville, TN', percentage: 15 },
      { city: 'Los Angeles, CA', percentage: 12 },
      { city: 'Dallas, TX', percentage: 8 },
    ]
  });

  // Newsletter Blast
  const [blastSubject, setBlastSubject] = useState('');
  const [blastBody, setBlastBody] = useState('');
  const [blastSending, setBlastSending] = useState(false);
  const [blastResult, setBlastResult] = useState<any>(null);

  // Audit log
  interface AuditEntry { id: string; text: string; time: string; color: string; }
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([
    { id: 'boot', text: 'System boot online. Realtime bindings initialized.', time: 'Just now', color: 'bg-emerald-500' },
    { id: 'session', text: 'Administrator session granted.', time: '1 min ago', color: 'bg-[#8a1cfc]' },
  ]);

  // Crew SMS Alert
  const [crewAlertMsg, setCrewAlertMsg] = useState('');
  const [crewAlertSending, setCrewAlertSending] = useState(false);
  const [crewAlertResult, setCrewAlertResult] = useState<any>(null);
  const [crewAlertStats, setCrewAlertStats] = useState<{ totalCrew: number; withPhone: number } | null>(null);
  const [crewAutoReminders, setCrewAutoReminders] = useState(true);
  const [crewAutoRemindersHours, setCrewAutoRemindersHours] = useState(24);

  // SMS Proximity Blast (Fan Show Alerts)
  const [smsShows, setSmsShows] = useState<any[]>([]);
  const [smsSelectedShow, setSmsSelectedShow] = useState<string>('');
  const [smsCustomMsg, setSmsCustomMsg] = useState('');
  const [smsSending, setSmsSending] = useState(false);
  const [smsResult, setSmsResult] = useState<any>(null);
  const [smsPreview, setSmsPreview] = useState('');
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);
  const [smsAutoBlast, setSmsAutoBlast] = useState(true);
  const [smsAutoBlastDays, setSmsAutoBlastDays] = useState(3);

  // Cruise Itinerary Builder
  type ItineraryEvent = { id: string; time: string; title: string; subtitle: string; };
  type ItineraryDay = { id: string; dayLabel: string; location: string; theme: string; events: ItineraryEvent[]; colorTheme: string; };
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([]);
  const [itineraryUpdating, setItineraryUpdating] = useState(false);
  const [itinerarySaveStatus, setItinerarySaveStatus] = useState<'saved' | 'error' | null>(null);

  // Cruise Chat Pin
  const [cruiseChatPin, setCruiseChatPin] = useState('');
  const [cruiseChatPinUpdating, setCruiseChatPinUpdating] = useState(false);
  const [cruiseChatPinSaveStatus, setCruiseChatPinSaveStatus] = useState<'saved' | 'error' | null>(null);

  // Cruise Chat Enable/Disable
  const [cruiseChatEnabled, setCruiseChatEnabled] = useState(true);
  const [cruiseChatToggling, setCruiseChatToggling] = useState(false);

  // Admin Live Chat Feed
  type AdminChatMsg = { id: string; sender_name: string; sender_role: string; sender_avatar: string; content: string; created_at: string; };
  const [adminChatMessages, setAdminChatMessages] = useState<AdminChatMsg[]>([]);
  const [adminChatInput, setAdminChatInput] = useState('');
  const [adminChatSending, setAdminChatSending] = useState(false);
  const adminChatEndRef = useRef<HTMLDivElement>(null);
  const adminChatContainerRef = useRef<HTMLDivElement>(null);

  // Cruise Important Links
  const [importantLinks, setImportantLinks] = useState<{title: string, url: string, icon: string}[]>([]);
  const [linksUpdating, setLinksUpdating] = useState(false);
  const [linksSaveStatus, setLinksSaveStatus] = useState<'saved' | 'error' | null>(null);

  // Cruise Stats
  const [cruiseStats, setCruiseStats] = useState<{ total: number; adults: number; children: number; signups: number; recentSignups: { name: string; email: string; phone: string; date: string; partySize: number }[] }>({ total: 0, adults: 0, children: 0, signups: 0, recentSignups: [] });

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoginError('');
    setAdminLoginLoading(true);

    // Authenticate via Supabase Auth — no hardcoded credentials
    const ok = await login(adminEmail, adminPassword);

    if (!ok) {
      setAdminLoginError('Invalid credentials. Please check your email and password.');
      setAdminLoginLoading(false);
      return;
    }

    // After login, the member context will set the role from Supabase profiles.
    // The login gate below (member?.role !== 'admin') will handle authorization.
    setAdminLoginLoading(false);
  };

  const createCrew = async () => {
    if (!newCrewName || !newCrewEmail || !newCrewPassword) return;
    if (newCrewPassword.length < 6) { setCrewError('Password must be at least 6 characters.'); return; }
    setCrewLoading(true);
    setCrewError('');
    setCreatedCrew(null);
    const savedName = newCrewName;
    const savedEmail = newCrewEmail;
    const savedPassword = newCrewPassword;
    const savedPhone = newCrewPhone;
    const savedUsername = newCrewUsername;
    const res = await adminCreateCrewMember({ name: newCrewName, email: newCrewEmail, password: newCrewPassword, phone: newCrewPhone || undefined, username: newCrewUsername || undefined });
    if (res.success) {
      setCreatedCrew({ name: savedName, email: savedEmail, password: savedPassword, phone: savedPhone, username: savedUsername });
      setNewCrewName('');
      setNewCrewEmail('');
      setNewCrewPassword('');
      setNewCrewPhone('');
      setNewCrewUsername('');

      // Also save to localStorage so crew can login via the standard modal
      const accounts = JSON.parse(localStorage.getItem('7h_accounts') || '{}');
      accounts[savedEmail.toLowerCase()] = {
        id: crypto.randomUUID(),
        name: savedName,
        email: savedEmail.toLowerCase(),
        password: savedPassword,
        phone: savedPhone,
        joinDate: new Date().toISOString(),
        avatar: savedName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
        points: 0,
        tier: 'Bronze',
        showsAttended: 0,
        favoriteVenues: [],
        notificationsEnabled: false,
        notificationRadius: 25,
        role: 'crew',
      };
      localStorage.setItem('7h_accounts', JSON.stringify(accounts));

      const { data: profilesData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (profilesData) setUsers(profilesData.map(p => ({ id: p.id, name: p.full_name || p.email || 'Anonymous', role: p.role, status: 'active', strikes: 0, avatar: p.avatar_url || p.profile_photo_url || null })));
      setFilterRole('crew');
    } else {
      setCrewError(res.error || 'Failed to create crew member.');
    }
    setCrewLoading(false);
  };

  const scrollToRegistry = () => {
    registryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Load Real Data from Supabase + simulated demo feeds
  useEffect(() => {
    let pollLocal: NodeJS.Timeout;

    // Load Global Announcement Banner
    fetch('/api/announcement')
      .then(res => res.json())
      .then(data => {
        setBannerActive(data.isActive);
        setBannerText(data.text || '');
        setBannerLink(data.link || '');
        setBannerExpiresAt(data.expiresAt || null);
      })
      .catch(() => {});
      
    // Load Cruise Announcement
    fetch(`/api/cruise/announcement?t=${Date.now()}`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        let actualData = data;
        let attempts = 0;
        while (typeof actualData === 'string' && attempts < 3) {
          try { actualData = JSON.parse(actualData); } catch(e) { break; }
          attempts++;
        }
        if (actualData?.message) setCruiseMessage(actualData.message);
      })
      .catch(() => {});

    // Load Cruise Chat Pin + enabled state
    fetch(`/api/cruise/chat-pin`)
      .then(res => res.json())
      .then(data => {
        if (data?.pin) setCruiseChatPin(data.pin);
        if (data?.chatEnabled !== undefined) setCruiseChatEnabled(data.chatEnabled);
      })
      .catch(() => {});

    // Load Cruise Chat History for admin view
    supabase
      .from('chat_messages')
      .select('*')
      .eq('room', 'cruise_dashboard')
      .order('created_at', { ascending: false })
      .limit(80)
      .then(({ data }) => {
        if (data) {
          setAdminChatMessages(data.reverse());
          if (adminTabRef.current !== 'cruise' && data.length > 0) {
            setUnreadCruiseChat(data.length);
          }
        }
      });

    // Realtime subscription for admin chat feed
    const adminChatChannel = supabase
      .channel('admin_cruise_chat')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: 'room=eq.cruise_dashboard'
      }, (payload) => {
        const msg = payload.new as AdminChatMsg;
        setAdminChatMessages(prev => [...prev.slice(-79), msg]);
        if (adminTabRef.current !== 'cruise') {
          setUnreadCruiseChat(prev => prev + 1);
        }
      })
      .subscribe();

    // Load Important Links
    fetch(`/api/cruise/important-links?t=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
        if (data.links && Array.isArray(data.links)) {
          setImportantLinks(data.links);
        }
      })
      .catch(() => {});

    // Load Cruise Stats
    fetch(`/api/admin/cruise-stats?t=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) setCruiseStats(data);
      })
      .catch(() => {});

    // Load Cruise Itinerary
    fetch(`/api/cruise/itinerary?t=${Date.now()}`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        let actualData = data;
        let attempts = 0;
        while (typeof actualData === 'string' && attempts < 3) {
          try { actualData = JSON.parse(actualData); } catch(e) { break; }
          attempts++;
        }
        if (Array.isArray(actualData) && actualData.length > 0) {
          setItinerary(actualData);
        } else {
          // Default empty state or fallback template
          setItinerary([
            { id: 'day1', dayLabel: 'Day 1', location: 'Miami, FL', theme: 'Embarkation', colorTheme: 'var(--color-accent)', events: [
              { id: 'e1', time: '15:00', title: 'Welcome Aboard Party', subtitle: 'Lido Deck Poolside' },
              { id: 'e2', time: '20:00', title: 'Main Stage Kickoff', subtitle: 'Starlight Theater' }
            ] }
          ]);
        }
      })
      .catch(() => {});
    
    async function loadAdminData() {
      const { data: streamsData } = await supabase
        .from('live_streams')
        .select('*')
        .eq('status', 'live');
        
      const realFeeds = (streamsData || []).map(st => ({
        id: st.id,
        name: st.title || 'Untitled Stream',
        host: 'Crew Member', // Fallback since we removed the profiles join
        viewers: st.viewer_count || 0,
        uptime: st.created_at ? Math.max(1, Math.floor((new Date().getTime() - new Date(st.created_at).getTime()) / 60000)) + "m" : "Just now",
        status: st.status,
        isSimulated: false,
        route: '',
      }));

      // Log new Supabase streams to audit log
      realFeeds.forEach(feed => {
        if (!loggedStreamIds.current.has(feed.id)) {
          loggedStreamIds.current.add(feed.id);
          setAuditLog(prev => [{ id: crypto.randomUUID(), text: `🔴 ${feed.host} went live — "${feed.name}"`, time: 'Just now', color: 'bg-red-500' }, ...prev]);
        }
      });

      setFeeds(realFeeds);

      pollLocal = setInterval(() => {
        const uids = ['michael', 'sammy', 'ryan', 'tony'];
        const nameMap: any = { 'michael': 'Mike S', 'sammy': 'Sammy D', 'ryan': 'Ryan K', 'tony': 'Tony M' };
        const activeLocal: any[] = [];
        uids.forEach(uid => {
          // Unify with Crew/Fan naming: key_id
          const isLive = localStorage.getItem(`is_live_${uid}`) === 'true' || localStorage.getItem(`7h_crew_is_live_${uid}`) === 'true';
          
          if (isLive) {
            const startStr = localStorage.getItem(`live_stream_start_${uid}`) || localStorage.getItem(`7h_live_stream_start_${uid}`);
            const uptime = startStr ? Math.max(1, Math.floor((Date.now() - parseInt(startStr)) / 60000)) + 'm' : 'Just now';
            const viewers = parseInt(localStorage.getItem(`live_viewer_count_${uid}`) || localStorage.getItem(`7h_live_viewer_count_${uid}`) || '0');
            const revenue = parseFloat(localStorage.getItem(`live_merch_sales_${uid}`) || localStorage.getItem(`7h_live_merch_sales_${uid}`) || '0');
            const feedId = `sim-${uid}`;
            activeLocal.push({
              id: feedId, name: `Crew Cam: ${nameMap[uid]}`, host: nameMap[uid],
              viewers, uptime, status: 'live', isSimulated: true,
              route: `/live/live_${uid}`, revenue
            });
            // Log to audit if first time seeing this stream
            if (!loggedStreamIds.current.has(feedId)) {
              loggedStreamIds.current.add(feedId);
              setAuditLog(prev => [{ id: crypto.randomUUID(), text: `🔴 ${nameMap[uid]} went live — Crew Broadcast`, time: 'Just now', color: 'bg-red-500' }, ...prev]);
            }
          } else {
            // If stream ended, remove from tracked so re-going-live triggers a new log
            loggedStreamIds.current.delete(`sim-${uid}`);
          }
        });
        setFeeds(prev => {
          const dbFeeds = prev.filter(p => !p.isSimulated);
          return [...activeLocal, ...dbFeeds].sort((a,b) => b.viewers - a.viewers);
        });
      }, 2000);

      const { data: profilesData } = await supabase
        .from('profiles').select('*').order('created_at', { ascending: false });
      if (profilesData) {
        setUsers(profilesData.map(p => ({
          id: p.id, 
          name: p.full_name || 'Anonymous',
          email: p.email || '',
          role: p.role, 
          status: 'active', 
          strikes: 0,
          avatar: p.avatar_url || p.profile_photo_url || null
        })));
      }

      
      try {
        const tourRes = await fetch('/api/tour');
        if (tourRes.ok) {
          const freshTourDates = await tourRes.json();
          setTourDates(freshTourDates);
          
          let currentSchedules = [];
          const saved = localStorage.getItem('7h_crew_schedules');
          if (saved) {
            currentSchedules = JSON.parse(saved);
          } else {
            // Default Mock Example Data
            currentSchedules = [
              { id: 'mock_1', crewId: 'arjun', crewName: 'Arjun Patel', date: '2023-01-23', startHour: 17.0, endHour: 22.0, time: '5:00 PM - 10:00 PM', role: 'SERVER', location: 'The Chicago Theatre', notes: 'Lead server for VIP tables' },
              { id: 'mock_2', crewId: 'abbie', crewName: 'Abbie Janssen', date: '2023-01-24', startHour: 17.0, endHour: 22.0, time: '5:00 PM - 10:00 PM', role: 'SERVER', location: 'The Chicago Theatre', notes: '' },
              { id: 'mock_3', crewId: 'al', crewName: 'Al Hollie', date: '2023-01-25', startHour: 18.0, endHour: 23.5, time: '6:00 PM - 11:30 PM', role: 'SERVER', location: 'The Chicago Theatre', notes: '' },
              { id: 'mock_4', crewId: 'andrea', crewName: 'Andrea Kinzinger', date: '2023-01-26', startHour: 16.0, endHour: 22.0, time: '4:00 PM - 10:00 PM', role: 'CHEF', location: 'The Chicago Theatre', notes: 'Kitchen lead' },
              { id: 'mock_5', crewId: 'openshifts', crewName: 'OpenShifts', date: '2023-01-26', startHour: 18.0, endHour: 23.0, time: '6:00 PM - 11:00 PM', role: 'SERVER', location: 'The Chicago Theatre', notes: 'Need 1 backup server', openSlots: 1 },
              { id: 'mock_6', crewId: 'chris', crewName: 'Chris Loxely', date: '2023-01-27', startHour: 18.0, endHour: 23.5, time: '6:00 PM - 11:30 PM', role: 'SERVER', location: 'The Chicago Theatre', notes: '' },
              { id: 'mock_7', crewId: 'dave_croke', crewName: 'Dave Croke', date: '2023-01-27', startHour: 17.0, endHour: 23.0, time: '5:00 PM - 11:00 PM', role: 'LINE COOK', location: 'The Chicago Theatre', notes: '' },
              { id: 'mock_8', crewId: 'abbie', crewName: 'Abbie Janssen', date: '2023-01-27', startHour: 18.0, endHour: 23.0, time: '6:00 PM - 11:00 PM', role: 'SERVER', location: 'The Chicago Theatre', notes: '' },
              { id: 'mock_9', crewId: 'daniel', crewName: 'Daniel Kim', date: '2023-01-28', startHour: 17.0, endHour: 24.0, time: '5:00 PM - 12:00 AM', role: 'MANAGER', location: 'The Chicago Theatre', notes: 'Closing manager' },
              { id: 'mock_10', crewId: 'openshifts', crewName: 'OpenShifts', date: '2023-01-29', startHour: 12.0, endHour: 17.0, time: '12:00 PM - 5:00 PM', role: 'SERVER', location: 'The Chicago Theatre', notes: 'Matinee show setup', openSlots: 2 }
            ];
          }
          syncTourDatesToCalendar(freshTourDates, currentSchedules);
        }
      } catch (err) {}

      try {
        const memRes = await fetch('/api/fans/memories?all=true');
        if (memRes.ok) {
          const allMems = await memRes.json();
          setMemoryQueue(allMems.filter((m: any) => !m.approved));
        }
      } catch (err) {}
try {
        const photoRes = await fetch('/api/fans?all=true');
        if (photoRes.ok) {
          const allPhotos = await photoRes.json();
          setModerationQueue(allPhotos.filter((p: any) => !p.approved));
        }
      } catch (err) {}

      try {
        const bookingRes = await fetch('/api/booking');
        if (bookingRes.ok) setBookings(await bookingRes.json());
      } catch (err) {}

      // Load Shopify Sales Data
      try {
        const shopRes = await fetch(`/api/shopify/orders?days=${shopifyPeriod}`);
        if (shopRes.ok) {
          setShopifyData(await shopRes.json());
          setShopifyError('');
        } else {
          const errData = await shopRes.json().catch(() => ({}));
          setShopifyError(errData.error || 'Failed to load');
        }
      } catch (err) {
        setShopifyError('Network error');
      }
      setShopifyLoading(false);

      // Load Fan Analytics
      try {
        const fanRes = await fetch('/api/admin/fans');
        if (fanRes.ok) setFanData(await fanRes.json());
      } catch {}

      // Load Crew Alert Stats
      try {
        const crewRes = await fetch('/api/admin/crew-alert');
        if (crewRes.ok) setCrewAlertStats(await crewRes.json());
      } catch {}

      // Load upcoming shows for SMS blast picker
      try {
        const showsRes = await fetch('/api/admin/shows');
        if (showsRes.ok) setSmsShows(await showsRes.json());
      } catch {}

      // Load auto-blast settings
      try {
        const settingsRes = await fetch('/api/admin/settings');
        if (settingsRes.ok) {
          const settings = await settingsRes.json();
          const autoBlast = settings.find((s: any) => s.key === 'sms_auto_blast');
          const autoBlastDays = settings.find((s: any) => s.key === 'sms_auto_blast_days');
          if (autoBlast) setSmsAutoBlast(autoBlast.value !== 'off');
          if (autoBlastDays) setSmsAutoBlastDays(parseInt(autoBlastDays.value, 10) || 3);

          const crewReminders = settings.find((s: any) => s.key === 'crew_auto_reminders');
          const crewRemindersHours = settings.find((s: any) => s.key === 'crew_auto_reminders_hours');
          if (crewReminders) setCrewAutoReminders(crewReminders.value !== 'off');
          if (crewRemindersHours) setCrewAutoRemindersHours(parseInt(crewRemindersHours.value, 10) || 24);
        }
      } catch {}

      // Load Active Featured Track
      try {
        const trackRes = await fetch('/api/featured-track');
        if (trackRes.ok) {
          const trackData = await trackRes.json();
          if (trackData.track) {
            setActiveFeaturedTrack(trackData.track);
          } else {
            setActiveFeaturedTrack(null);
          }
        }
      } catch (err) {
        console.error("Failed to load active featured track:", err);
      }

      setIsLoading(false);
    }
    
    loadAdminData();

    const bookingPoll = setInterval(async () => {
      try {
        const res = await fetch('/api/booking');
        if (res.ok) setBookings(await res.json());
      } catch {}
    }, 10000);

    return () => {
      if (pollLocal) clearInterval(pollLocal);
      clearInterval(bookingPoll);
      supabase.removeChannel(adminChatChannel);
    };
  }, [supabase]);

  // Auto-scroll admin chat feed
  useEffect(() => {
    if (adminChatContainerRef.current) {
      adminChatContainerRef.current.scrollTo({
        top: adminChatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [adminChatMessages]);

  const [chatRate, setChatRate] = useState(0);
  useEffect(() => {
    const t = setInterval(() => {
       const chatLog = JSON.parse(localStorage.getItem('7h_global_chat_history') || '[]');
       setChatRate(chatLog.length);
    }, 2000);
    return () => clearInterval(t);
  }, []);

  const killStream = async (feed: any) => {
    if (feed.isSimulated) {
      const uid = feed.id.replace('sim-', '');
      localStorage.removeItem(`7h_crew_is_live_${uid}`);
      localStorage.removeItem(`7h_is_live_${uid}`); // Also clear namespaced key
      localStorage.setItem(`is_live_${uid}`, 'false');
      setFeeds(current => current.filter(f => f.id !== feed.id));
      setAuditLog(prev => [{ id: crypto.randomUUID(), text: `Terminated demo stream: ${feed.host}`, time: 'Just now', color: 'bg-amber-500' }, ...prev]);
    } else {
      const res = await adminKillStream(feed.id);
      if (res.success) {
        setFeeds(current => current.filter(f => f.id !== feed.id));
        setAuditLog(prev => [{ id: crypto.randomUUID(), text: 'Live stream terminated.', time: 'Just now', color: 'bg-amber-500' }, ...prev]);
      } else {
        setAuditLog(prev => [{ id: crypto.randomUUID(), text: `Failed to kill stream: ${res.error}`, time: 'Just now', color: 'bg-red-500' }, ...prev]);
      }
    }
  };

  const banUser = async (id: string, name: string) => {
    const res = await adminBanUser(id);
    if (!res.success) {
      setAuditLog(prev => [{ id: crypto.randomUUID(), text: `Failed to remove ${name}: ${res.error}`, time: 'Just now', color: 'bg-red-500' }, ...prev]);
    } else {
      setUsers(current => current.filter(u => u.id !== id));
      setAuditLog(prev => [{ id: crypto.randomUUID(), text: `${name} removed from platform.`, time: 'Just now', color: 'bg-red-500' }, ...prev]);
    }
  };

  const seedData = async () => {
    setIsLoading(true);
    await seedMockData();
    window.location.reload();
  };

  const moderatePhoto = async (id: string, action: 'approve' | 'reject') => {
    setModerationQueue(current => current.filter(p => p.id !== id));
    try {
      await fetch('/api/fans', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleCloseTrack = async () => {
    try {
      const res = await fetch('/api/featured-track', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'close' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActiveFeaturedTrack(null);
        setAuditLog(prev => [{
          id: crypto.randomUUID(),
          text: "🎵 Closed featured song/track.",
          time: "Just now",
          color: "bg-amber-500"
        }, ...prev]);
      }
    } catch (err) {
      console.error("Failed to close featured track:", err);
    }
  };

  const handleUploadTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackTitle || dropSongs.length === 0) return;

    const hasIncomplete = dropSongs.some(s => !s.title || !s.file);
    if (hasIncomplete) {
      setTrackUploadError('Please provide a song title and select an audio file for all tracks.');
      return;
    }

    setUploadingTrack(true);
    setTrackUploadError('');
    setTrackUploadSuccess(false);

    try {
      const formData = new FormData();
      formData.append('title', trackTitle);
      formData.append('visibility', trackVisibility);
      formData.append('compression', trackCompression);
      formData.append('normalize', String(trackNormalize));

      // Append multiple songs
      dropSongs.forEach((song, idx) => {
        if (song.file) {
          formData.append(`audio_${idx}`, song.file);
          formData.append(`title_${idx}`, song.title);
        }
      });

      if (trackDurationType === 'temporary') {
        let expiresAtDate: Date | null = null;
        if (trackDurationHours === 'custom' && trackCustomExpiresAt) {
          expiresAtDate = new Date(trackCustomExpiresAt);
        } else if (trackDurationHours !== 'custom') {
          const hours = parseInt(trackDurationHours, 10);
          expiresAtDate = new Date(Date.now() + hours * 60 * 60 * 1000);
        }
        if (expiresAtDate) {
          formData.append('expires_at', expiresAtDate.toISOString());
        }
      }

      const res = await fetch('/api/featured-track', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTrackUploadSuccess(true);
        setActiveFeaturedTrack(data.track);
        setTrackTitle('');
        setDropSongs([{ title: '', file: null }]);
        try {
          (e.target as HTMLFormElement).reset();
        } catch {}
        
        setAuditLog(prev => [{
          id: crypto.randomUUID(),
          text: `🎵 Uploaded featured track: "${data.track.title}"`,
          time: "Just now",
          color: "bg-emerald-500"
        }, ...prev]);
      } else {
        setTrackUploadError(data.error || 'Upload failed');
      }
    } catch (err: any) {
      setTrackUploadError(err.message || 'Network error during upload');
    } finally {
      setUploadingTrack(false);
    }
  };

  const [bannerSaveStatus, setBannerSaveStatus] = useState<string | null>(null);

  const updateGlobalBanner = async (overrides?: { isActive?: boolean; expiresAt?: string | null }) => {
    setBannerUpdating(true);
    setBannerSaveStatus(null);
    try {
      await fetch('/api/announcement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isActive: overrides?.isActive ?? bannerActive,
          text: bannerText,
          link: bannerLink,
          expiresAt: overrides?.expiresAt !== undefined ? overrides.expiresAt : bannerExpiresAt,
        })
      });
      setBannerSaveStatus('saved');
      setTimeout(() => setBannerSaveStatus(null), 3000);
    } catch (e) {
      setBannerSaveStatus('error');
      setTimeout(() => setBannerSaveStatus(null), 4000);
    }
    setBannerUpdating(false);
  };

  const updateCruiseMessage = async (msgOverride?: string) => {
    const finalMessage = msgOverride !== undefined ? msgOverride : cruiseMessage;
    setCruiseUpdating(true);
    setCruiseSaveStatus(null);
    try {
      await fetch('/api/cruise/announcement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: finalMessage })
      });
      if (msgOverride !== undefined) setCruiseMessage(msgOverride);
      setCruiseSaveStatus('saved');
      setTimeout(() => setCruiseSaveStatus(null), 3000);
    } catch (e) {
      setCruiseSaveStatus('error');
      setTimeout(() => setCruiseSaveStatus(null), 4000);
    }
    setCruiseUpdating(false);
  };

  const updateItinerary = async (newItin: ItineraryDay[]) => {
    setItineraryUpdating(true);
    setItinerarySaveStatus(null);
    try {
      await fetch('/api/cruise/itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itinerary: newItin })
      });
      setItinerary(newItin);
      setItinerarySaveStatus('saved');
      setTimeout(() => setItinerarySaveStatus(null), 3000);
    } catch (e) {
      setItinerarySaveStatus('error');
      setTimeout(() => setItinerarySaveStatus(null), 4000);
    }
    setItineraryUpdating(false);
  };

  const updateCruiseChatPin = async (msgOverride?: string) => {
    const finalMessage = msgOverride !== undefined ? msgOverride : cruiseChatPin;
    setCruiseChatPinUpdating(true);
    setCruiseChatPinSaveStatus(null);
    try {
      await fetch('/api/cruise/chat-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: finalMessage })
      });
      if (msgOverride !== undefined) setCruiseChatPin(msgOverride);
      setCruiseChatPinSaveStatus('saved');
      setTimeout(() => setCruiseChatPinSaveStatus(null), 3000);
    } catch (e) {
      setCruiseChatPinSaveStatus('error');
      setTimeout(() => setCruiseChatPinSaveStatus(null), 4000);
    } finally {
      setCruiseChatPinUpdating(false);
    }
  };

  const toggleCruiseChat = async () => {
    const newVal = !cruiseChatEnabled;
    setCruiseChatToggling(true);
    try {
      await fetch('/api/cruise/chat-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatEnabled: newVal }),
      });
      setCruiseChatEnabled(newVal);
    } catch {
      // revert on failure
    } finally {
      setCruiseChatToggling(false);
    }
  };

  const updateImportantLinks = async () => {
    setLinksUpdating(true);
    setLinksSaveStatus(null);
    try {
      await fetch('/api/cruise/important-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ links: importantLinks })
      });
      setLinksSaveStatus('saved');
      setTimeout(() => setLinksSaveStatus(null), 3000);
    } catch {
      setLinksSaveStatus('error');
      setTimeout(() => setLinksSaveStatus(null), 4000);
    } finally {
      setLinksUpdating(false);
    }
  };

  const filteredUsers = users.filter(u => filterRole === "All" || u.role === filterRole);
  const pendingBookings = bookings.filter((b: any) => b.status === 'pending');

  const METRICS = [
    { label: "Total Registered Users", value: users.length.toString(), trend: "Live", color: "text-emerald-400" },
    { label: "Active Live Streams", value: feeds.length.toString(), trend: "Live", color: "text-[var(--color-accent)]" },
    { label: "Booking Requests", value: pendingBookings.length.toString(), trend: pendingBookings.length > 0 ? "Action Needed" : "Clear", color: pendingBookings.length > 0 ? "text-amber-400" : "text-emerald-400" },
    { label: "Server Status", value: "Online", trend: "Stable", color: "text-emerald-400" },
  ];

  // ── Admin Login Gate ──
  const devBypass = typeof window !== 'undefined' && process.env.NODE_ENV === 'development' && localStorage.getItem('7h_dev_bypass') === 'true';
  const forceLogin = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('login') === 'true';

  if (!mounted) {
    return <div className="min-h-[200vh] bg-[#050508]" />;
  }

  if ((forceLogin || !devBypass) && (!isLoggedIn || member?.role !== 'admin')) {
    const isWrongRole = isLoggedIn && member?.role !== 'admin';

    return (
      <div className="min-h-screen bg-[#050508] text-white flex items-center justify-center px-6 relative overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-red-500 opacity-[0.03] blur-[120px] rounded-full pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          <div className="bg-[#0c0c18] border border-white/10 overflow-hidden shadow-2xl">
            <div className="h-1 bg-gradient-to-r from-red-500 via-amber-500 to-red-500" />

            <div className="p-10">
              <div className="text-center mb-10">
                <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <h1 className="text-2xl font-black tracking-tight">
                  Admin <span className="text-red-500">Access</span>
                </h1>
                <p className="text-[0.65rem] uppercase tracking-[0.2em] text-white/30 mt-2">
                  Restricted — Authorized personnel only
                </p>
              </div>

              {isWrongRole ? (
                <div className="text-center">
                  <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-xl mb-6">
                    <p className="text-sm font-bold text-red-400 mb-1">Access Denied</p>
                    <p className="text-[0.7rem] text-white/40">
                      You&apos;re logged in as <strong className="text-white">{member?.name}</strong> ({member?.role}). 
                      Admin privileges are required to access this dashboard.
                    </p>
                  </div>
                  <Link href="/fans" className="text-[0.65rem] text-[var(--color-accent)] hover:text-white uppercase tracking-[0.15em] font-bold transition-colors">
                    ← Back to Fan Dashboard
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleAdminLogin} className="flex flex-col gap-4" autoComplete="off" data-form-type="other">
                  <div>
                    <label className="text-[0.6rem] uppercase tracking-[0.15em] text-white/40 mb-2 block font-bold">Email</label>
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={e => setAdminEmail(e.target.value)}
                      placeholder="admin@7thheaven.com"
                      autoComplete="off"
                      data-lpignore="true"
                      className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 text-sm text-white placeholder:text-white/20 outline-none focus:border-red-500/50 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[0.6rem] uppercase tracking-[0.15em] text-white/40 mb-2 block font-bold">Password</label>
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={e => setAdminPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      data-lpignore="true"
                      className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 text-sm text-white placeholder:text-white/20 outline-none focus:border-red-500/50 transition-colors"
                      required
                    />
                  </div>

                  {adminLoginError && (
                    <p className="text-xs text-rose-400 bg-rose-400/10 px-3 py-2 border border-rose-400/20">{adminLoginError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={adminLoginLoading}
                    className="w-full py-3.5 bg-red-600 text-white font-bold text-sm uppercase tracking-[0.15em] hover:bg-red-500 transition-all disabled:opacity-50 cursor-pointer shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                  >
                    {adminLoginLoading ? "Authenticating..." : "Sign In as Admin"}
                  </button>
                </form>
              )}

              <p className="mt-8 text-center text-[0.55rem] text-white/15 uppercase tracking-[0.2em]">
                7th Heaven · System Administration
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  
  // ── Section Helper Render Functions for Movable Layout ──
  const renderShopify = () => (
    <section className="bg-[#0f0f13] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
              <div onClick={() => toggleSection('shopify')} className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20 cursor-pointer select-none hover:bg-black/30 transition-colors">
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <div className="drag-handle cursor-grab active:cursor-grabbing p-1.5 hover:bg-white/5 rounded text-white/20 hover:text-white/50 transition-all shrink-0 mr-1" title="Drag to reorder section">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>
                  </div>
                  <h3 onClick={() => toggleSection('shopify')} className="cursor-pointer text-lg font-bold tracking-tight flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#96bf48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                  Shopify Sales
                </h3>
                </div>
                <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-3">
                  <div className="flex bg-black rounded p-1 border border-white/10">
                    {[7, 30, 90].map(d => (
                      <button
                        key={d}
                        onClick={async () => {
                          setShopifyPeriod(d);
                          setShopifyLoading(true);
                          try {
                            const res = await fetch(`/api/shopify/orders?days=${d}`);
                            if (res.ok) { setShopifyData(await res.json()); setShopifyError(''); }
                          } catch {}
                          setShopifyLoading(false);
                        }}
                        className={`px-3 py-1.5 text-[0.6rem] font-bold uppercase tracking-widest rounded transition-colors ${shopifyPeriod === d ? 'bg-[#96bf48]/20 text-[#96bf48]' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                      >
                        {d}d
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={async () => {
                      setShopifyLoading(true);
                      try {
                        const res = await fetch(`/api/shopify/orders?days=${shopifyPeriod}`);
                        if (res.ok) { setShopifyData(await res.json()); setShopifyError(''); }
                      } catch {}
                      setShopifyLoading(false);
                    }}
                    className="px-3 py-1.5 bg-white/5 border border-white/10 rounded text-[0.6rem] font-bold uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/10 transition-all"
                  >
                    ↻ Refresh
                  </button>
                </div>
                  <div className={"w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center transition-transform duration-300 " + (isSectionOpen('shopify') ? 'rotate-0' : '-rotate-90')}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40"><path d="M2 4l4 4 4-4" /></svg>
                  </div>
                </div>
              </div>
              <div style={{ display: isSectionOpen('shopify') ? undefined : 'none' }}>
                {shopifyLoading ? (
                <div className="p-16 text-center text-white/30 font-mono text-xs animate-pulse">Pulling Shopify analytics...</div>
              ) : shopifyError ? (
                <div className="p-16 text-center">
                  <span className="text-4xl opacity-20 block mb-4">🛒</span>
                  <p className="text-white/40 text-sm">{shopifyError}</p>
                  <p className="text-white/20 text-xs mt-2">Check your Shopify Admin API credentials in .env.local</p>
                </div>
              ) : shopifyData?.mode === 'inventory' ? (
                <div className="p-6">
                  {shopifyData.needsOrderScope && (
                    <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
                      <span className="text-amber-400 text-lg">⚠️</span>
                      <div>
                        <p className="text-sm font-bold text-amber-400">Orders Access Not Enabled</p>
                        <p className="text-[0.7rem] text-white/40 mt-1">To see sales data, enable <code className="text-amber-300">read_orders</code> in Shopify Admin → Settings → Apps → Your app → Admin API scopes. Showing inventory data instead.</p>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-black/30 border border-[#96bf48]/20 rounded-xl p-5">
                      <p className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-[#96bf48]/60 mb-2">Inventory Value</p>
                      <p className="text-2xl font-black text-[#96bf48]">${shopifyData.summary.inventoryValue.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                      <p className="text-[0.55rem] text-white/30 mt-1 uppercase tracking-widest">Retail value on hand</p>
                    </div>
                    <div className="bg-black/30 border border-white/10 rounded-xl p-5">
                      <p className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-white/40 mb-2">Products</p>
                      <p className="text-2xl font-black text-white">{shopifyData.summary.totalProducts}</p>
                      <p className="text-[0.55rem] text-white/30 mt-1 uppercase tracking-widest">{shopifyData.summary.totalVariants} variants</p>
                    </div>
                    <div className="bg-black/30 border border-white/10 rounded-xl p-5">
                      <p className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-white/40 mb-2">Total Units</p>
                      <p className="text-2xl font-black text-white">{shopifyData.summary.totalInventory}</p>
                      <p className="text-[0.55rem] text-white/30 mt-1 uppercase tracking-widest">In stock</p>
                    </div>
                    <div className="bg-black/30 border border-white/10 rounded-xl p-5">
                      <p className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-white/40 mb-2">Avg Price</p>
                      <p className="text-2xl font-black text-white">${shopifyData.summary.totalInventory > 0 ? (shopifyData.summary.inventoryValue / shopifyData.summary.totalInventory).toFixed(2) : '0.00'}</p>
                      <p className="text-[0.55rem] text-white/30 mt-1 uppercase tracking-widest">Per unit</p>
                    </div>
                  </div>
                  <div className="bg-black/20 border border-white/5 rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-white/5"><h4 className="text-sm font-bold flex items-center gap-2">📦 Product Inventory</h4></div>
                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar" data-lenis-prevent="true">
                      <table className="w-full text-left">
                        <thead><tr className="text-[0.55rem] uppercase tracking-widest text-white/25">
                          <th className="px-4 py-3 font-bold border-b border-white/5">Product</th>
                          <th className="px-4 py-3 font-bold border-b border-white/5 text-right">Price</th>
                          <th className="px-4 py-3 font-bold border-b border-white/5 text-right">Stock</th>
                          <th className="px-4 py-3 font-bold border-b border-white/5 text-right">Value</th>
                        </tr></thead>
                        <tbody>
                          {shopifyData.products.map((p: any, i: number) => (
                            <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  {p.image && <img src={p.image} alt="" className="w-8 h-8 rounded object-cover border border-white/10" />}
                                  <span className="text-sm font-bold truncate max-w-[200px]">{p.title}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-right font-mono text-sm text-white/60">${p.minPrice.toFixed(2)}{p.maxPrice !== p.minPrice ? ` – $${p.maxPrice.toFixed(2)}` : ''}</td>
                              <td className="px-4 py-3 text-right">
                                <span className={`font-mono text-sm font-bold ${p.inventory <= 0 ? 'text-rose-400' : p.inventory < 5 ? 'text-amber-400' : 'text-emerald-400'}`}>{p.inventory}</span>
                              </td>
                              <td className="px-4 py-3 text-right font-mono text-sm font-bold text-[#96bf48]">${(p.minPrice * p.inventory).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : shopifyData ? (
                <div className="p-6">
                  {/* Revenue Metrics Row */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-black/30 border border-[#96bf48]/20 rounded-xl p-5">
                      <p className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-[#96bf48]/60 mb-2">Total Revenue</p>
                      <p className="text-2xl font-black text-[#96bf48]">${shopifyData.summary.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                      <p className="text-[0.55rem] text-white/30 mt-1 uppercase tracking-widest">Last {shopifyData.period}</p>
                    </div>
                    <div className="bg-black/30 border border-white/10 rounded-xl p-5">
                      <p className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-white/40 mb-2">Orders</p>
                      <p className="text-2xl font-black text-white">{shopifyData.summary.totalOrders}</p>
                      <p className="text-[0.55rem] text-white/30 mt-1 uppercase tracking-widest">
                        {shopifyData.statusBreakdown.fulfilled} fulfilled · {shopifyData.statusBreakdown.unfulfilled} pending
                      </p>
                    </div>
                    <div className="bg-black/30 border border-white/10 rounded-xl p-5">
                      <p className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-white/40 mb-2">Avg Order Value</p>
                      <p className="text-2xl font-black text-white">${shopifyData.summary.avgOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                      <p className="text-[0.55rem] text-white/30 mt-1 uppercase tracking-widest">Per transaction</p>
                    </div>
                    <div className="bg-black/30 border border-white/10 rounded-xl p-5">
                      <p className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-white/40 mb-2">Net Revenue</p>
                      <p className="text-2xl font-black text-emerald-400">${shopifyData.summary.netRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                      {shopifyData.summary.totalRefunded > 0 && (
                        <p className="text-[0.55rem] text-rose-400 mt-1 uppercase tracking-widest">
                          -${shopifyData.summary.totalRefunded.toFixed(2)} refunded
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Two Column: Top Products + Revenue Chart */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Top Products */}
                    <div className="bg-black/20 border border-white/5 rounded-xl overflow-hidden">
                      <div className="p-4 border-b border-white/5">
                        <h4 className="text-sm font-bold flex items-center gap-2">
                          🏆 Top Products
                        </h4>
                      </div>
                      <div className="p-0">
                        {shopifyData.topProducts.length === 0 ? (
                          <div className="p-8 text-center text-white/30 text-xs">No product data</div>
                        ) : (
                          <table className="w-full text-left">
                            <thead>
                              <tr className="text-[0.55rem] uppercase tracking-widest text-white/25">
                                <th className="px-4 py-3 font-bold border-b border-white/5">Product</th>
                                <th className="px-4 py-3 font-bold border-b border-white/5 text-right">Qty</th>
                                <th className="px-4 py-3 font-bold border-b border-white/5 text-right">Revenue</th>
                              </tr>
                            </thead>
                            <tbody>
                              {shopifyData.topProducts.map((p: any, i: number) => (
                                <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[0.55rem] font-black shrink-0 ${
                                        i === 0 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 
                                        i === 1 ? 'bg-gray-400/20 text-gray-300 border border-gray-400/30' :
                                        i === 2 ? 'bg-orange-700/20 text-orange-400 border border-orange-700/30' :
                                        'bg-white/5 text-white/30 border border-white/10'
                                      }`}>{i + 1}</span>
                                      <span className="text-sm font-bold truncate max-w-[180px]">{p.title}</span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-right font-mono text-sm text-white/60">{p.qty}</td>
                                  <td className="px-4 py-3 text-right font-mono text-sm font-bold text-[#96bf48]">${p.revenue.toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </div>

                    {/* Daily Revenue Mini-Chart */}
                    <div className="bg-black/20 border border-white/5 rounded-xl overflow-hidden">
                      <div className="p-4 border-b border-white/5">
                        <h4 className="text-sm font-bold flex items-center gap-2">
                          📈 Daily Revenue
                        </h4>
                      </div>
                      <div className="p-4">
                        {Object.keys(shopifyData.dailyRevenue).length === 0 ? (
                          <div className="p-8 text-center text-white/30 text-xs">No data in this period</div>
                        ) : (
                          <div className="space-y-2">
                            {Object.entries(shopifyData.dailyRevenue)
                              .sort(([a], [b]) => a.localeCompare(b))
                              .slice(-14)
                              .map(([date, amount]: [string, any]) => {
                                const maxRevenue = Math.max(...Object.values(shopifyData.dailyRevenue).map(Number));
                                const pct = maxRevenue > 0 ? (amount / maxRevenue) * 100 : 0;
                                return (
                                  <div key={date} className="flex items-center gap-3">
                                    <span className="text-[0.6rem] font-mono text-white/30 w-16 shrink-0">
                                      {new Date(date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </span>
                                    <div className="flex-1 h-5 bg-white/5 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-gradient-to-r from-[#96bf48]/60 to-[#96bf48] rounded-full transition-all duration-500"
                                        style={{ width: `${Math.max(pct, 2)}%` }}
                                      />
                                    </div>
                                    <span className="text-[0.65rem] font-mono font-bold text-white/60 w-16 text-right">${Number(amount).toFixed(0)}</span>
                                  </div>
                                );
                              })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Recent Orders */}
                  <div className="bg-black/20 border border-white/5 rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-white/5 flex items-center justify-between">
                      <h4 className="text-sm font-bold flex items-center gap-2">
                        📦 Recent Orders
                      </h4>
                      <span className="text-[0.55rem] text-white/30 uppercase tracking-widest">{shopifyData.orders.length} orders</span>
                    </div>
                    <div className="max-h-[350px] overflow-y-auto custom-scrollbar" data-lenis-prevent="true">
                      {shopifyData.orders.length === 0 ? (
                        <div className="p-8 text-center text-white/30 text-xs">No orders in this period</div>
                      ) : (
                        <table className="w-full text-left">
                          <thead className="sticky top-0 z-10">
                            <tr className="bg-[#0f0f13] text-[0.55rem] uppercase tracking-widest text-white/25">
                              <th className="px-4 py-3 font-bold border-b border-white/5">Order</th>
                              <th className="px-4 py-3 font-bold border-b border-white/5">Customer</th>
                              <th className="px-4 py-3 font-bold border-b border-white/5">Items</th>
                              <th className="px-4 py-3 font-bold border-b border-white/5">Status</th>
                              <th className="px-4 py-3 font-bold border-b border-white/5 text-right">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {shopifyData.orders.map((order: any) => (
                              <tr key={order.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                <td className="px-4 py-3">
                                  <div className="font-mono text-sm font-bold text-[#96bf48]">{order.name}</div>
                                  <div className="text-[0.55rem] text-white/30">
                                    {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="text-sm font-bold truncate max-w-[120px]">{order.customer.name}</div>
                                  {order.customer.ordersCount > 1 && (
                                    <span className="text-[0.5rem] text-[var(--color-accent)] font-bold uppercase tracking-widest">Repeat ({order.customer.ordersCount}×)</span>
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  <span className="text-sm text-white/60">{order.itemCount} item{order.itemCount !== 1 ? 's' : ''}</span>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex flex-col gap-1">
                                    <span className={`inline-block px-2 py-0.5 rounded text-[0.5rem] font-bold uppercase tracking-widest w-fit ${
                                      order.financialStatus === 'PAID' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                      : order.financialStatus === 'REFUNDED' || order.financialStatus === 'PARTIALLY_REFUNDED' ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                                      : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                    }`}>{order.financialStatus?.toLowerCase().replace('_', ' ')}</span>
                                    {order.fulfillmentStatus && (
                                      <span className={`inline-block px-2 py-0.5 rounded text-[0.5rem] font-bold uppercase tracking-widest w-fit ${
                                        order.fulfillmentStatus === 'FULFILLED' ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                                        : 'bg-white/5 text-white/30 border border-white/10'
                                      }`}>{order.fulfillmentStatus?.toLowerCase()}</span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <span className="font-mono text-sm font-bold">${order.total.toFixed(2)}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>

                  {/* Product Inventory (always shown in orders mode too) */}
                  {shopifyData.products && shopifyData.products.length > 0 && (
                    <div className="bg-black/20 border border-white/5 rounded-xl overflow-hidden mt-8">
                      <div className="p-4 border-b border-white/5 flex items-center justify-between">
                        <h4 className="text-sm font-bold flex items-center gap-2">📦 Product Inventory</h4>
                        {shopifyData.inventory && (
                          <span className="text-[0.55rem] text-white/30 uppercase tracking-widest">
                            {shopifyData.inventory.totalInventory} units · ${shopifyData.inventory.inventoryValue?.toLocaleString()} value
                          </span>
                        )}
                      </div>
                      <table className="w-full text-left">
                        <thead><tr className="text-[0.55rem] uppercase tracking-widest text-white/25">
                          <th className="px-4 py-3 font-bold border-b border-white/5">Product</th>
                          <th className="px-4 py-3 font-bold border-b border-white/5 text-right">Price</th>
                          <th className="px-4 py-3 font-bold border-b border-white/5 text-right">Stock</th>
                          <th className="px-4 py-3 font-bold border-b border-white/5 text-right">Value</th>
                        </tr></thead>
                        <tbody>
                          {shopifyData.products.map((p: any, i: number) => (
                            <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  {p.image && <img src={p.image} alt="" className="w-8 h-8 rounded object-cover border border-white/10" />}
                                  <span className="text-sm font-bold truncate max-w-[200px]">{p.title}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-right font-mono text-sm text-white/60">${p.minPrice.toFixed(2)}{p.maxPrice !== p.minPrice ? ` – $${p.maxPrice.toFixed(2)}` : ''}</td>
                              <td className="px-4 py-3 text-right">
                                <span className={`font-mono text-sm font-bold ${p.inventory <= 0 ? 'text-rose-400' : p.inventory < 5 ? 'text-amber-400' : 'text-emerald-400'}`}>{p.inventory}</span>
                              </td>
                              <td className="px-4 py-3 text-right font-mono text-sm font-bold text-[#96bf48]">${(p.minPrice * p.inventory).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : null}
              </div>
            </section>
  );

  const renderTourSync = () => (
    <section className="bg-[#0f0f13] border border-white/5 rounded-2xl overflow-hidden shadow-2xl mt-8">
              <div onClick={() => toggleSection('toursync')} className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20 cursor-pointer select-none hover:bg-black/30 transition-colors">
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <div className="drag-handle cursor-grab active:cursor-grabbing p-1.5 hover:bg-white/5 rounded text-white/20 hover:text-white/50 transition-all shrink-0 mr-1" title="Drag to reorder section">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>
                  </div>
                  <h3 onClick={() => toggleSection('toursync')} className="text-lg font-bold tracking-tight flex items-center gap-2 cursor-pointer text-white">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                    Tour Dates Sync
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs uppercase font-bold tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {tourDates.length} Shows Loaded
                  </span>
                  <div className={"w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center transition-transform duration-300 " + (isSectionOpen('toursync') ? 'rotate-0' : '-rotate-90')}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40"><path d="M2 4l4 4 4-4" /></svg>
                  </div>
                </div>
              </div>
              <div style={{ display: isSectionOpen('toursync') ? undefined : 'none' }} className="p-6">
                <p className="text-sm text-white/40 mb-6 leading-relaxed">
                  Automatically scrapes the legacy 7th Heaven website (<a href="https://7thheavenband.com/tour.html" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] hover:underline">7thheavenband.com/tour.html</a>), extracts dates and venues, parses the location data, geocodes coordinates using nominatim cache, and syncs both Sanity CMS & Supabase database.
                </p>
                
                {syncResult && (
                  <div className={`p-4 rounded-xl mb-6 text-xs border ${
                    syncResult.success 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                      : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                  }`}>
                    {syncResult.success ? (
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                        <div>
                          <p className="opacity-60 uppercase font-bold tracking-wider mb-1">Scraped</p>
                          <p className="text-xl font-black">{syncResult.scraped}</p>
                        </div>
                        <div>
                          <p className="opacity-60 uppercase font-bold tracking-wider mb-1">Sanity Created</p>
                          <p className="text-xl font-black">{syncResult.sanityCreated}</p>
                        </div>
                        <div>
                          <p className="opacity-60 uppercase font-bold tracking-wider mb-1">Sanity Deleted</p>
                          <p className="text-xl font-black">{syncResult.sanityDeleted || 0}</p>
                        </div>
                        <div>
                          <p className="opacity-60 uppercase font-bold tracking-wider mb-1">Supabase Synced</p>
                          <p className="text-xl font-black">{syncResult.supabaseUpserted}</p>
                        </div>
                        <div>
                          <p className="opacity-60 uppercase font-bold tracking-wider mb-1">Geocoded</p>
                          <p className="text-xl font-black">{syncResult.geocoded}</p>
                        </div>
                      </div>
                    ) : (
                      <p><strong>Error syncing:</strong> {syncResult.error}</p>
                    )}
                  </div>
                )}

                <button
                  onClick={handleSyncTourDates}
                  disabled={syncLoading}
                  className="px-6 py-3 bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/90 text-white text-xs font-black uppercase tracking-widest rounded-lg border border-[var(--color-accent)]/50 transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {syncLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Syncing Dates...
                    </>
                  ) : (
                    'Sync Tour Dates'
                  )}
                </button>
              </div>
            </section>
  );

  const renderBookings = () => (
    <section className="bg-[#0f0f13] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
              <div onClick={() => toggleSection('bookings')} className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20 cursor-pointer select-none hover:bg-black/30 transition-colors">
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <div className="drag-handle cursor-grab active:cursor-grabbing p-1.5 hover:bg-white/5 rounded text-white/20 hover:text-white/50 transition-all shrink-0 mr-1" title="Drag to reorder section">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>
                  </div>
                  <h3 onClick={() => toggleSection('bookings')} className="cursor-pointer text-lg font-bold tracking-tight flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  Booking Requests
                </h3>
                </div>
                <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                  
                  <div className={"w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center transition-transform duration-300 " + (isSectionOpen('bookings') ? 'rotate-0' : '-rotate-90')}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40"><path d="M2 4l4 4 4-4" /></svg>
                  </div>
                </div>
              </div>
              <div style={{ display: isSectionOpen('bookings') ? undefined : 'none' }}>
                <div className="p-0">
                {bookings.length === 0 ? (
                  <div className="p-12 text-center text-white/30 font-mono text-xs">No booking requests received yet.</div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/[0.02] text-white/30 text-[0.6rem] uppercase tracking-widest">
                        <th className="p-4 font-bold border-b border-white/5">ID</th>
                        <th className="p-4 font-bold border-b border-white/5">Client</th>
                        <th className="p-4 font-bold border-b border-white/5">Event Type</th>
                        <th className="p-4 font-bold border-b border-white/5">Date</th>
                        <th className="p-4 font-bold border-b border-white/5">Venue</th>
                        <th className="p-4 font-bold border-b border-white/5">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.slice().reverse().map((b: any) => (
                        <React.Fragment key={b.bookingId}>
                        <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                          <td className="p-4 font-mono text-[0.75rem] text-[var(--color-accent)] font-bold cursor-pointer hover:underline" onClick={() => setExpandedBooking(prev => prev === b.bookingId ? null : b.bookingId)}>
                            {expandedBooking === b.bookingId ? '▼' : '▶'} {b.bookingId}
                          </td>
                          <td className="p-4">
                            <div className="font-bold text-sm">{b.name}</div>
                            <div className="text-[0.65rem] text-white/40">{b.email}</div>
                          </td>
                          <td className="p-4 text-sm text-white/70 capitalize">{b.eventType?.replace('_', ' ')}</td>
                          <td className="p-4 text-sm text-white/70">{b.eventDate}</td>
                          <td className="p-4">
                            <div className="text-sm text-white/70 truncate max-w-[150px]">{b.venueName || '–'}</div>
                            <div className="text-[0.6rem] text-white/30">{b.venueCity}, {b.venueState}</div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-[0.6rem] font-bold uppercase tracking-widest ${
                                b.status === 'pending' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                : b.status === 'confirmed' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                              }`}>{b.status}</span>
                              {b.status === 'pending' && (
                                <div className="flex gap-1 ml-1">
                                  <button
                                    onClick={async () => {
                                      if (!confirm(`Approve booking ${b.bookingId}?`)) return;
                                      const res = await fetch('/api/booking', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bookingId: b.bookingId, status: 'confirmed' }) });
                                      if (res.ok) { setBookings((prev: any[]) => prev.map((bk: any) => bk.bookingId === b.bookingId ? { ...bk, status: 'confirmed' } : bk)); }
                                    }}
                                    className="px-2 py-0.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-black border border-emerald-500/20 text-[0.5rem] font-bold uppercase tracking-widest rounded transition-all"
                                  >✓</button>
                                  <button
                                    onClick={async () => {
                                      if (!confirm(`Reject booking ${b.bookingId}?`)) return;
                                      const res = await fetch('/api/booking', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bookingId: b.bookingId, status: 'cancelled' }) });
                                      if (res.ok) { setBookings((prev: any[]) => prev.map((bk: any) => bk.bookingId === b.bookingId ? { ...bk, status: 'cancelled' } : bk)); }
                                    }}
                                    className="px-2 py-0.5 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-black border border-rose-500/20 text-[0.5rem] font-bold uppercase tracking-widest rounded transition-all"
                                  >✕</button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                        {expandedBooking === b.bookingId && (
                          <tr>
                            <td colSpan={6} className="p-6 bg-[#060609] border-t border-b border-white/10">
                              <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-6 text-left border-b border-white/5 pb-6">
                                <div>
                                  <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-1">Age Limit</p>
                                  <p className="text-sm font-semibold text-white">
                                    {b.ageRestriction === "21_plus" ? "🔞 21 & Over" : b.ageRestriction === "18_plus" ? "🔞 18 & Over" : "✅ All Ages"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-1">Doors Time</p>
                                  <p className="text-sm font-semibold text-white">{b.doorsTime || b.startTime || 'TBD'}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-1">Cover / Price</p>
                                  <p className="text-sm font-semibold text-white">{b.cover || 'Free / No Cover'}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-1">Ticket Link</p>
                                  {b.ticketLink ? (
                                    <a href={b.ticketLink} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-[var(--color-accent)] hover:underline truncate block max-w-[200px]" title={b.ticketLink}>
                                      {b.ticketLink}
                                    </a>
                                  ) : (
                                    <p className="text-sm text-white/20">—</p>
                                  )}
                                </div>
                                {b.details && (
                                  <div className="col-span-2 sm:col-span-4 mt-2">
                                    <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-1">Public Notes (displayed to fans)</p>
                                    <p className="text-xs text-white/70 italic bg-white/[0.02] p-3 rounded-lg border border-white/5">"{b.details}"</p>
                                  </div>
                                )}
                                {b.plannerNotes && (
                                  <div className="col-span-2 sm:col-span-4 mt-2">
                                    <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-1">Planner's Internal Notes</p>
                                    <p className="text-xs text-white/70 bg-white/[0.02] p-3 rounded-lg border border-white/5">{b.plannerNotes}</p>
                                  </div>
                                )}
                              </div>
                              <ShowCrewPanel bookingId={b.bookingId} eventDate={b.eventDate} venueName={b.venueName || 'TBD'} />
                            </td>
                          </tr>
                        )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              </div>
            </section>
  );

  const renderPlanners = () => (
    <section className="bg-[#0f0f13] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
              <div onClick={() => toggleSection('planners')} className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20 cursor-pointer select-none hover:bg-black/30 transition-colors">
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <div className="drag-handle cursor-grab active:cursor-grabbing p-1.5 hover:bg-white/5 rounded text-white/20 hover:text-white/50 transition-all shrink-0 mr-1" title="Drag to reorder section">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>
                  </div>
                  <h3 onClick={() => toggleSection('planners')} className="cursor-pointer text-lg font-bold tracking-tight flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                  Event Planners Directory
                </h3>
                </div>
                <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                  <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[0.6rem] uppercase font-bold tracking-widest flex items-center gap-2 text-white/40">
                  {Array.from(new Map(bookings.filter(b => b.email).map(b => [b.email, b])).values()).length} Planners
                </span>
                  <div className={"w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center transition-transform duration-300 " + (isSectionOpen('planners') ? 'rotate-0' : '-rotate-90')}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40"><path d="M2 4l4 4 4-4" /></svg>
                  </div>
                </div>
              </div>
              <div style={{ display: isSectionOpen('planners') ? undefined : 'none' }}>
                <div className="p-0" data-lenis-prevent="true">
                {bookings.length === 0 ? (
                  <div className="p-12 text-center text-white/30 font-mono text-xs">No planners found.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                    {Array.from(new Map(bookings.filter(b => b.email).map(b => [b.email, b])).values()).map((planner: any) => (
                      <div key={planner.email} className="bg-black/20 border border-white/5 rounded-xl p-5 hover:border-[var(--color-accent)]/50 transition-colors group flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-accent)]/20 to-[var(--color-accent)]/5 flex items-center justify-center text-lg font-black text-[var(--color-accent)] shrink-0 border border-[var(--color-accent)]/20">
                              {planner.name?.substring(0, 2).toUpperCase() || 'EP'}
                            </div>
                            <div className="overflow-hidden">
                              <h4 className="font-bold text-white text-sm truncate">{planner.name || 'Unknown Planner'}</h4>
                              <p className="text-[0.65rem] text-white/40 truncate uppercase tracking-widest">{planner.venueName || planner.eventType?.replace('_', ' ') || 'Event Planner'}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-2 mb-6">
                            {planner.email && (
                              <div className="flex items-center gap-2 text-[0.65rem] text-white/60">
                                <span className="text-[var(--color-accent)] text-xs">✉</span> <span className="truncate">{planner.email}</span>
                              </div>
                            )}
                            {planner.phone ? (
                              <div className="flex items-center gap-2 text-[0.65rem] text-white/60">
                                <span className="text-[var(--color-accent)] text-xs">☏</span> {planner.phone}
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-[0.65rem] text-white/30 italic">
                                <span className="text-white/20 text-xs">☏</span> No phone provided
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2 mt-auto">
                          <a href={`mailto:${planner.email}`} onClick={() => setAuditLog(prev => [{ id: crypto.randomUUID(), text: `Admin initiated email to planner ${planner.name}`, time: 'Just now', color: 'bg-emerald-500' }, ...prev])} className="flex-1 py-2 text-center bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[0.6rem] font-bold uppercase tracking-widest text-white/60 hover:text-white transition-all">
                            Email
                          </a>
                          {planner.phone ? (
                            <a href={`sms:${planner.phone.replace(/[^0-9]/g, '')}`} onClick={() => setAuditLog(prev => [{ id: crypto.randomUUID(), text: `Admin initiated SMS to planner ${planner.name}`, time: 'Just now', color: 'bg-blue-500' }, ...prev])} className="flex-1 py-2 text-center bg-[var(--color-accent)]/10 hover:bg-[var(--color-accent)]/20 border border-[var(--color-accent)]/30 rounded text-[0.6rem] font-bold uppercase tracking-widest text-[var(--color-accent)] hover:text-[var(--color-accent)] transition-all">
                              Text
                            </a>
                          ) : (
                            <button disabled className="flex-1 py-2 text-center bg-white/5 border border-white/10 rounded text-[0.6rem] font-bold uppercase tracking-widest text-white/20 cursor-not-allowed">
                              No Phone
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              </div>
            </section>
  );

  const renderPhotoMod = () => (
    <section className="bg-[#0f0f13] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
              <div onClick={() => toggleSection('photomod')} className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20 cursor-pointer select-none hover:bg-black/30 transition-colors">
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <div className="drag-handle cursor-grab active:cursor-grabbing p-1.5 hover:bg-white/5 rounded text-white/20 hover:text-white/50 transition-all shrink-0 mr-1" title="Drag to reorder section">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>
                  </div>
                  <h3 onClick={() => toggleSection('photomod')} className="cursor-pointer text-lg font-bold tracking-tight flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  Fan Photo Moderation Queue
                </h3>
                </div>
                <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                  
                  <div className={"w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center transition-transform duration-300 " + (isSectionOpen('photomod') ? 'rotate-0' : '-rotate-90')}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40"><path d="M2 4l4 4 4-4" /></svg>
                  </div>
                </div>
              </div>
              <div style={{ display: isSectionOpen('photomod') ? undefined : 'none' }}>
                <div className="p-0">
                {moderationQueue.length === 0 ? (
                  <div className="p-16 text-center text-white/30 text-sm">
                     <span className="text-4xl opacity-20 block mb-4">🏆</span>
                     Queue is entirely empty. All fan content is categorized.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                    {moderationQueue.map((photo) => (
                      <div key={photo.id} className="group relative bg-[#0a0a0f] border border-white/10 rounded-xl overflow-hidden shadow-xl hover:border-[var(--color-accent)]/50 transition-colors">
                        <div className="aspect-[4/3] bg-white/5 relative overflow-hidden">
                          <img src={photo.src} alt="Fan Upload" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute top-0 right-0 m-3 px-2.5 py-1 bg-black/70 backdrop-blur-md rounded border border-white/10 text-white font-mono text-[0.6rem] uppercase tracking-widest shadow-xl">
                            {new Date(photo.submittedAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="p-4 flex flex-col gap-1.5">
                          <div className="flex items-center gap-2 text-sm font-bold truncate">
                            <span className="text-[var(--color-accent)]">@</span>
                            {photo.name}
                          </div>
                          {photo.venue && <p className="text-[0.65rem] font-bold tracking-widest uppercase text-white/40 truncate">📍 {photo.venue}</p>}
                          {photo.caption && <p className="text-sm text-white/70 italic border-l-2 border-[var(--color-accent)]/30 pl-3 mt-2">"{photo.caption}"</p>}
                        </div>
                        <div className="grid grid-cols-2 border-t border-white/10 divide-x divide-white/10">
                          <button onClick={() => moderatePhoto(photo.id, 'reject')} className="py-3 text-[0.6rem] font-black uppercase tracking-widest text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                            Reject & Delete
                          </button>
                          <button onClick={() => moderatePhoto(photo.id, 'approve')} className="py-3 text-[0.6rem] font-black uppercase tracking-widest text-[#050505] bg-emerald-400 hover:bg-emerald-300 transition-colors shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                            Safe & Approve
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              </div>
            </section>
  );

  const renderMemoryMod = () => (
    <section className="bg-[#0f0f13] border border-white/5 rounded-2xl overflow-hidden shadow-2xl mt-8">
              <div onClick={() => toggleSection('memorymod')} className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20 cursor-pointer select-none hover:bg-black/30 transition-colors">
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <div className="drag-handle cursor-grab active:cursor-grabbing p-1.5 hover:bg-white/5 rounded text-white/20 hover:text-white/50 transition-all shrink-0 mr-1" title="Drag to reorder section">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>
                  </div>
                  <h3 onClick={() => toggleSection('memorymod')} className="text-lg font-bold tracking-tight flex items-center gap-2 cursor-pointer text-white">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z"/><path d="M12 8v4l3 3"/></svg>
                    Memory Moderation Queue
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-amber-500/20 text-amber-500 border border-amber-500/30 rounded-full text-[0.6rem] uppercase font-bold tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    {memoryQueue.length} Pending
                  </span>
                  <div className={"w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center transition-transform duration-300 " + (isSectionOpen('memorymod') ? 'rotate-0' : '-rotate-90')}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40"><path d="M2 4l4 4 4-4" /></svg>
                  </div>
                </div>
              </div>
              <div style={{ display: isSectionOpen('memorymod') ? undefined : 'none' }} className="p-6">
                {memoryQueue.length === 0 ? (
                  <div className="p-10 text-center text-white/30 text-sm">
                    <span className="text-4xl opacity-20 block mb-4">🏆</span>
                    Queue is entirely empty. All fan content is categorized.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {memoryQueue.map((mem) => (
                      <div key={mem.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-black/20 border border-white/5 rounded-xl">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white/80">{mem.fan_name || 'Anonymous Fan'}</span>
                            <span className="text-[0.6rem] text-white/30">{new Date(mem.created_at || mem.submittedAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm text-white/70 italic mt-1">"{mem.text || mem.caption}"</p>
                          {mem.show_id && (
                            <p className="text-xs text-white/30 mt-2 font-bold uppercase tracking-widest">Show ID: {mem.show_id}</p>
                          )}
                          {mem.photo_url && (
                            <div className="mt-2 w-20 h-20 rounded-lg overflow-hidden border border-white/10">
                              <img src={mem.photo_url} alt="" className="w-full h-full object-cover" />
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => moderateMemory(mem.id, 'reject')}
                            className="px-4 py-2 text-xs font-black uppercase tracking-widest text-white/40 border border-white/10 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-all rounded-lg"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => moderateMemory(mem.id, 'approve')}
                            className="px-4 py-2 text-xs font-black uppercase tracking-widest text-[#050505] bg-emerald-400 hover:bg-emerald-300 transition-all rounded-lg shadow-[0_0_15px_rgba(52,211,153,0.3)]"
                          >
                            Approve
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
  );

  const renderFeaturedTrack = () => (
    <section className="bg-[#0f0f13] border border-white/5 rounded-2xl overflow-hidden shadow-2xl mt-8">
      <div onClick={() => toggleSection('featuredtrack')} className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20 cursor-pointer select-none hover:bg-black/30 transition-colors">
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <div className="drag-handle cursor-grab active:cursor-grabbing p-1.5 hover:bg-white/5 rounded text-white/20 hover:text-white/50 transition-all shrink-0 mr-1" title="Drag to reorder section">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>
          </div>
          <h3 onClick={() => toggleSection('featuredtrack')} className="text-lg font-bold tracking-tight flex items-center gap-2 cursor-pointer text-white">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/60"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
            Featured Song / Soundtrack Drop
          </h3>
        </div>
        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
          {activeFeaturedTrack ? (
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-[0.6rem] uppercase font-bold tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Active
            </span>
          ) : (
            <span className="px-3 py-1 bg-white/5 text-white/40 border border-white/10 rounded-full text-[0.6rem] uppercase font-bold tracking-widest">
              Closed
            </span>
          )}
          <div onClick={() => toggleSection('featuredtrack')} className={"w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer transition-transform duration-300 " + (isSectionOpen('featuredtrack') ? 'rotate-0' : '-rotate-90')}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40"><path d="M2 4l4 4 4-4" /></svg>
          </div>
        </div>
      </div>
      <div style={{ display: isSectionOpen('featuredtrack') ? undefined : 'none' }} className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side: Upload Form */}
          <div className="bg-black/20 border border-white/5 p-6 rounded-xl">
            <h4 className="text-sm font-bold uppercase tracking-widest text-white/60 mb-4">Feature a New Track</h4>
            <form onSubmit={handleUploadTrack} className="space-y-5">
              {/* Album / EP Title */}
              <div>
                <label className="block text-2xs font-bold uppercase tracking-widest text-white/40 mb-2">Album / EP Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Luminous EP or Greatest Hits Live"
                  value={trackTitle}
                  onChange={(e) => setTrackTitle(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[var(--color-accent)]/50 transition-colors"
                />
              </div>

              {/* Dynamic Songs playlist manager */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <label className="block text-2xs font-bold uppercase tracking-widest text-white/40">Drop Songs Playlist</label>
                  <button
                    type="button"
                    onClick={() => setDropSongs(prev => [...prev, { title: '', file: null }])}
                    className="px-2.5 py-1 bg-[var(--color-accent)]/20 hover:bg-[var(--color-accent)]/35 text-[var(--color-accent)] hover:text-white border border-[var(--color-accent)]/30 hover:border-[var(--color-accent)]/50 text-[0.65rem] uppercase font-bold tracking-wider rounded-md transition-all flex items-center gap-1 cursor-pointer select-none"
                  >
                    ➕ Add Song
                  </button>
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {dropSongs.map((song, index) => (
                    <div key={index} className="p-4 bg-black/30 border border-white/5 rounded-xl space-y-3 relative group">
                      <div className="flex items-center justify-between">
                        <span className="text-[0.65rem] font-bold text-white/30 uppercase tracking-wider">Track #{index + 1}</span>
                        {dropSongs.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setDropSongs(prev => prev.filter((_, idx) => idx !== index))}
                            className="text-xs text-rose-400 hover:text-rose-300 opacity-60 hover:opacity-100 transition-opacity cursor-pointer select-none flex items-center gap-0.5"
                            title="Remove this song"
                          >
                            ✕ Remove
                          </button>
                        )}
                      </div>

                      <div className="space-y-3">
                        {/* Song Title Input */}
                        <div>
                          <label className="block text-[0.6rem] font-bold uppercase tracking-widest text-white/30 mb-1">Song Title</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Track Name"
                            value={song.title}
                            onChange={(e) => {
                              const val = e.target.value;
                              setDropSongs(prev => prev.map((s, idx) => idx === index ? { ...s, title: val } : s));
                            }}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[var(--color-accent)]/50 transition-colors"
                          />
                        </div>

                        {/* Song File Input */}
                        <div>
                          <label className="block text-[0.6rem] font-bold uppercase tracking-widest text-white/30 mb-1">Audio File</label>
                          <input
                            type="file"
                            required
                            accept="audio/*"
                            onChange={(e) => {
                              const files = e.target.files;
                              setDropSongs(prev => prev.map((s, idx) => idx === index ? { ...s, file: files?.[0] || null } : s));
                            }}
                            className="w-full text-xs text-white/40 file:mr-3 file:py-1.5 file:px-3.5 file:rounded-md file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-wider file:bg-[var(--color-accent)]/20 file:text-white hover:file:bg-[var(--color-accent)]/30 file:cursor-pointer cursor-pointer focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Audio Compression & Mastering Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-2xs font-bold uppercase tracking-widest text-white/40 mb-2">Compression Quality</label>
                  <select
                    value={trackCompression}
                    onChange={(e: any) => setTrackCompression(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white/80 focus:outline-none focus:border-[var(--color-accent)]/50 transition-colors"
                  >
                    <option value="standard">Standard (192kbps MP3 - Recommended)</option>
                    <option value="superb">Superb (320kbps MP3 - Best Quality)</option>
                    <option value="high">Compact (128kbps MP3 - Smallest Size)</option>
                    <option value="none">Lossless / None (Keep Original File)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-2xs font-bold uppercase tracking-widest text-white/40 mb-2">Audio Processing</label>
                  <div className="h-[38px] flex items-center">
                    <label className="flex items-center gap-2 text-xs text-white/70 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={trackNormalize}
                        onChange={(e) => setTrackNormalize(e.target.checked)}
                        className="accent-[var(--color-accent)] w-4 h-4 rounded bg-black/40 border-white/10"
                      />
                      <span className="flex items-center gap-1">Master Loudness & Dynamics <span className="animate-pulse">⚡</span></span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Visibility Gate */}
              <div>
                <label className="block text-2xs font-bold uppercase tracking-widest text-white/40 mb-2">Visibility</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer select-none">
                    <input
                      type="radio"
                      name="visibility"
                      checked={trackVisibility === 'everyone'}
                      onChange={() => setTrackVisibility('everyone')}
                      className="accent-[var(--color-accent)]"
                    />
                    Everyone (Public)
                  </label>
                  <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer select-none">
                    <input
                      type="radio"
                      name="visibility"
                      checked={trackVisibility === 'fans'}
                      onChange={() => setTrackVisibility('fans')}
                      className="accent-[var(--color-accent)]"
                    />
                    Fans Only (Logged In Users)
                  </label>
                </div>
              </div>

              {/* Expiration Configuration */}
              <div>
                <label className="block text-2xs font-bold uppercase tracking-widest text-white/40 mb-2">Feature Duration</label>
                <div className="flex gap-4 mb-3">
                  <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer select-none">
                    <input
                      type="radio"
                      name="durationType"
                      checked={trackDurationType === 'indefinite'}
                      onChange={() => setTrackDurationType('indefinite')}
                      className="accent-[var(--color-accent)]"
                    />
                    Keep Open Indefinitely
                  </label>
                  <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer select-none">
                    <input
                      type="radio"
                      name="durationType"
                      checked={trackDurationType === 'temporary'}
                      onChange={() => setTrackDurationType('temporary')}
                      className="accent-[var(--color-accent)]"
                    />
                    Temporary Drop (Auto-Expire)
                  </label>
                </div>

                {trackDurationType === 'temporary' && (
                  <div className="space-y-3 bg-black/40 border border-white/5 p-4 rounded-lg">
                    <div>
                      <label className="block text-3xs font-bold uppercase tracking-widest text-white/30 mb-2">Availability Limit</label>
                      <select
                        value={trackDurationHours}
                        onChange={(e) => setTrackDurationHours(e.target.value)}
                        className="bg-black/80 border border-white/10 rounded-md px-3 py-1.5 text-xs text-white/80 focus:outline-none focus:border-[var(--color-accent)]/50 transition-colors"
                      >
                        <option value="1">1 Hour</option>
                        <option value="3">3 Hours</option>
                        <option value="24">24 Hours (1 Day)</option>
                        <option value="72">72 Hours (3 Days)</option>
                        <option value="168">168 Hours (7 Days)</option>
                        <option value="custom">Custom Date & Time</option>
                      </select>
                    </div>

                    {trackDurationHours === 'custom' && (
                      <div>
                        <label className="block text-3xs font-bold uppercase tracking-widest text-white/30 mb-2">Select Expiration Date & Time</label>
                        <input
                          type="datetime-local"
                          required
                          value={trackCustomExpiresAt}
                          onChange={(e) => setTrackCustomExpiresAt(e.target.value)}
                          className="bg-black/80 border border-white/10 rounded-md px-3 py-1.5 text-xs text-white/80 focus:outline-none focus:border-[var(--color-accent)]/50"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {trackUploadError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-lg">
                  ⚠️ {trackUploadError}
                </div>
              )}

              {trackUploadSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-lg">
                  ✓ Track has been successfully uploaded and featured!
                </div>
              )}

              <button
                type="submit"
                disabled={uploadingTrack}
                className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 disabled:bg-white/5 disabled:text-white/20 text-white font-bold text-xs uppercase tracking-widest py-3 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(133,29,239,0.3)]"
              >
                {uploadingTrack ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Uploading & Launching Track...
                  </>
                ) : (
                  <>⚡ Launch Featured Track</>
                )}
              </button>
            </form>
          </div>

          {/* Right Side: Active Track Info */}
          <div className="bg-black/20 border border-white/5 p-6 rounded-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold uppercase tracking-widest text-white/60">Currently Featured Drop</h4>
                {activeFeaturedTrack && (
                  <button
                    type="button"
                    onClick={handleCloseTrack}
                    className="text-3xs uppercase tracking-widest font-black text-rose-400 hover:text-rose-300 border border-rose-500/20 hover:border-rose-500/40 rounded px-2.5 py-1 transition-all cursor-pointer flex items-center gap-1 bg-rose-950/20"
                    title="Remove and Deactivate"
                  >
                    🗑️ Remove
                  </button>
                )}
              </div>
              
              {activeFeaturedTrack ? (
                <div className="space-y-4">
                  <div className="p-4 bg-[#0a0a0f] border border-white/10 rounded-xl flex items-center gap-4">
                    <div className="w-12 h-12 bg-[var(--color-accent)]/15 border border-[var(--color-accent)]/30 rounded-xl flex items-center justify-center text-xl shrink-0 shadow-lg text-[var(--color-accent)] animate-pulse">
                      🎛️
                    </div>
                    <div className="min-w-0 flex-1">
                      <h5 className="text-white font-bold text-base truncate">{activeFeaturedTrack.title}</h5>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[0.6rem] uppercase tracking-widest px-2 py-0.5 rounded-full font-bold border ${activeFeaturedTrack.visibility === 'fans' ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' : 'bg-blue-500/10 border-blue-500/30 text-blue-400'}`}>
                          {activeFeaturedTrack.visibility === 'fans' ? 'Fans Only 🔒' : 'Everyone 🔓'}
                        </span>
                        <span className="text-[0.6rem] text-white/30">
                          Uploaded {new Date(activeFeaturedTrack.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-white/50">
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span>Visibility Gate</span>
                      <span className="font-bold text-white/80">{activeFeaturedTrack.visibility === 'fans' ? 'Premium Fans (Logged In)' : 'Public (Everyone)'}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span>Status</span>
                      <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Live on Homepage
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span>Expiration</span>
                      <span className="font-bold text-white/80">
                        {activeFeaturedTrack.expires_at ? (
                          new Date(activeFeaturedTrack.expires_at) < new Date() ? (
                            <span className="text-rose-400">Expired</span>
                          ) : (
                            new Date(activeFeaturedTrack.expires_at).toLocaleString()
                          )
                        ) : (
                          'Manual Close Required'
                        )}
                      </span>
                    </div>
                    
                    {/* Track Songs List Overview */}
                    <div className="pt-2">
                      <span className="block text-[0.65rem] font-bold uppercase tracking-widest text-white/40 mb-2">Track Playlist</span>
                      <div className="space-y-1.5 pl-3 border-l border-white/10 max-h-[140px] overflow-y-auto pr-1">
                        {activeFeaturedTrack.songs && activeFeaturedTrack.songs.length > 0 ? (
                          activeFeaturedTrack.songs.map((song: any, idx: number) => (
                            <div key={song.id || idx} className="text-2xs text-white/60 flex items-center justify-between gap-2">
                              <span className="truncate">
                                <span className="text-[var(--color-accent)] font-mono font-bold mr-1.5">{idx + 1}.</span>
                                {song.title}
                              </span>
                              <span className="text-white/20 shrink-0 text-3xs">MP3</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-3xs italic text-white/30">No songs recorded for this drop.</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center border border-dashed border-white/10 rounded-xl text-white/30 text-sm">
                  <span className="text-3xl block mb-2 opacity-30">🔇</span>
                  No audio track is currently featured on the homepage.
                </div>
              )}
            </div>

            {activeFeaturedTrack && (
              <div className="mt-8">
                <button
                  type="button"
                  onClick={handleCloseTrack}
                  className="w-full bg-transparent hover:bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:border-rose-500/40 font-bold text-xs uppercase tracking-widest py-3 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  ⏹ Close & Deactivate Featured Track
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );

  const renderReferral = () => (
    <section className="bg-[#0f0f13] border border-white/5 rounded-2xl overflow-hidden shadow-2xl mt-8">
              <div onClick={() => toggleSection('referral')} className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20 cursor-pointer select-none hover:bg-black/30 transition-colors">
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <div className="drag-handle cursor-grab active:cursor-grabbing p-1.5 hover:bg-white/5 rounded text-white/20 hover:text-white/50 transition-all shrink-0 mr-1" title="Drag to reorder section">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>
                  </div>
                  <h3 onClick={() => toggleSection('referral')} className="text-lg font-bold tracking-tight flex items-center gap-2 cursor-pointer text-white">
                    <span className="text-lg">🤝</span>
                    Referral Program
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <div className={"w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center transition-transform duration-300 " + (isSectionOpen('referral') ? 'rotate-0' : '-rotate-90')}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40"><path d="M2 4l4 4 4-4" /></svg>
                  </div>
                </div>
              </div>
              <div style={{ display: isSectionOpen('referral') ? undefined : 'none' }} className="p-6">
                <ReferralProgramPanel />
              </div>
            </section>
  );

  const renderLiveAlerts = () => (
    <section className="bg-[#0f0f13] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
              <div onClick={() => toggleSection('livealerts')} className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20 cursor-pointer select-none hover:bg-black/30 transition-colors">
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <div className="drag-handle cursor-grab active:cursor-grabbing p-1.5 hover:bg-white/5 rounded text-white/20 hover:text-white/50 transition-all shrink-0 mr-1" title="Drag to reorder section">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>
                  </div>
                  <h3 onClick={() => toggleSection('livealerts')} className="cursor-pointer text-lg font-bold tracking-tight flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2"><path d="M23 7l-7 5 7 5V7z"></path><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                  Active Live Streams
                </h3>
                </div>
                <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                  
                  <div className={"w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center transition-transform duration-300 " + (isSectionOpen('livealerts') ? 'rotate-0' : '-rotate-90')}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40"><path d="M2 4l4 4 4-4" /></svg>
                  </div>
                </div>
              </div>
              <div style={{ display: isSectionOpen('livealerts') ? undefined : 'none' }}>
                <div className="p-0">
                {isLoading ? (
                  <div className="p-12 text-center text-white/30 font-mono text-xs animate-pulse">Scanning network...</div>
                ) : feeds.length === 0 ? (
                  <div className="p-12 text-center text-white/30 font-mono text-xs">No active streams detected across infrastructure.</div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/[0.02] text-white/30 text-[0.6rem] uppercase tracking-widest">
                        <th className="p-4 font-bold border-b border-white/5 w-1/3">Stream Name</th>
                        <th className="p-4 font-bold border-b border-white/5">Host</th>
                        <th className="p-4 font-bold border-b border-white/5">Viewers</th>
                        <th className="p-4 font-bold border-b border-white/5">Merch Sales</th>
                        <th className="p-4 font-bold border-b border-white/5 text-right w-1/6">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {feeds.map((feed) => (
                        <tr key={feed.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                          <td className="p-4">
                            <div className="font-bold flex items-center gap-2 text-sm">
                              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shrink-0" />
                              {feed.isSimulated && feed.route ? (
                                <Link href={feed.route} className="truncate block hover:text-[var(--color-accent)] transition-colors">{feed.name}</Link>
                              ) : (
                                <span className="truncate block">{feed.name}</span>
                              )}
                              {feed.isSimulated && (
                                <span className="px-1.5 py-0.5 bg-emerald-500/15 border border-emerald-500/30 rounded text-[0.5rem] font-bold uppercase tracking-wider text-emerald-400 shrink-0">Demo</span>
                              )}
                            </div>
                            <div className="text-white/40 text-[0.6rem] uppercase tracking-wider mt-1">Uptime: {feed.uptime}</div>
                          </td>
                          <td className="p-4 text-sm text-white/70">{feed.host}</td>
                          <td className="p-4 font-mono text-sm">{feed.viewers.toLocaleString()}</td>
                          <td className="p-4 font-mono text-sm font-bold text-emerald-400">
                             {feed.revenue !== undefined ? `$${feed.revenue.toLocaleString()}` : '$0'}
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link 
                                href={feed.isSimulated && feed.route ? feed.route : `/live/${feed.id}`}
                                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 text-[0.6rem] font-bold uppercase tracking-widest rounded transition-all inline-block"
                              >
                                View
                              </Link>
                              <button 
                                onClick={() => killStream(feed)}
                                className="px-4 py-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 text-[0.6rem] font-bold uppercase tracking-widest rounded transition-all"
                              >
                                Shut Down
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              </div>
            </section>
  );

  const renderSmsBlast = () => (
    <section className="bg-[#0f0f13] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
              <div onClick={() => toggleSection('smsblast')} className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20 cursor-pointer select-none hover:bg-black/30 transition-colors">
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <div className="drag-handle cursor-grab active:cursor-grabbing p-1.5 hover:bg-white/5 rounded text-white/20 hover:text-white/50 transition-all shrink-0 mr-1" title="Drag to reorder section">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>
                  </div>
                  <h3 onClick={() => toggleSection('smsblast')} className="cursor-pointer text-lg font-bold tracking-tight text-white">SMS Proximity Blast</h3>
                </div>
                <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-4">
                  {/* Auto-blast toggle */}
                  <div className="flex items-center gap-2">
                    <span className="text-[0.55rem] font-bold uppercase tracking-widest text-white/30">Auto-Blast</span>
                    <button
                      onClick={async () => {
                        const newVal = !smsAutoBlast;
                        setSmsAutoBlast(newVal);
                        try {
                          await fetch('/api/admin/settings', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ key: 'sms_auto_blast', value: newVal ? 'on' : 'off' }),
                          });
                        } catch {}
                      }}
                      className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${smsAutoBlast ? 'bg-emerald-500' : 'bg-white/10'}`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${smsAutoBlast ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                  <span className="text-[0.6rem] text-rose-400/60 uppercase tracking-widest font-bold">
                    {smsShows.length} upcoming show{smsShows.length !== 1 ? 's' : ''}
                  </span>
                </div>
                  <div className={"w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center transition-transform duration-300 " + (isSectionOpen('smsblast') ? 'rotate-0' : '-rotate-90')}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40"><path d="M2 4l4 4 4-4" /></svg>
                  </div>
                </div>
              </div>
              <div style={{ display: isSectionOpen('smsblast') ? undefined : 'none' }}>
                {/* Auto-blast info bar */}
              <div className={`px-6 py-3 border-b border-white/5 flex items-center justify-between ${smsAutoBlast ? 'bg-emerald-500/5' : 'bg-white/[0.01]'}`}>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${smsAutoBlast ? 'bg-emerald-500 animate-pulse' : 'bg-white/10'}`} />
                  <span className="text-[0.65rem] text-white/40">
                    {smsAutoBlast
                      ? `Auto-sending ${smsAutoBlastDays} day${smsAutoBlastDays !== 1 ? 's' : ''} before each public show`
                      : 'Auto-blast disabled — manual sends only'}
                  </span>
                </div>
                {smsAutoBlast && (
                  <div className="flex items-center gap-2">
                    <span className="text-[0.5rem] font-bold uppercase tracking-widest text-white/25">Days before:</span>
                    <select
                      value={smsAutoBlastDays}
                      onChange={async (e) => {
                        const v = parseInt(e.target.value, 10);
                        setSmsAutoBlastDays(v);
                        try {
                          await fetch('/api/admin/settings', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ key: 'sms_auto_blast_days', value: String(v) }),
                          });
                        } catch {}
                      }}
                      className="bg-black/40 border border-white/10 rounded px-2 py-1 text-[0.7rem] text-white outline-none cursor-pointer [color-scheme:dark]"
                    >
                      {[1,2,3,5,7].map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                )}
              </div>

              <div className="p-6">
                <p className="text-[0.7rem] text-white/40 mb-5">
                  {smsAutoBlast
                    ? 'Blasts auto-send for public shows. You can still manually send or override below. Private events are always excluded.'
                    : 'Pick an upcoming show and we\u0027ll auto-compose a text with all the details. Only fans subscribed within proximity of the venue will receive it.'}
                </p>

                {/* Show Picker */}
                <div className="space-y-4">
                  <div>
                    <label className="text-[0.6rem] font-bold uppercase tracking-widest text-white/40 mb-2 block">Select Show</label>
                    <select
                      value={smsSelectedShow}
                      onChange={e => {
                        setSmsSelectedShow(e.target.value);
                        setSmsResult(null);
                        const show = smsShows.find((s: any) => s._id === e.target.value);
                        if (show) {
                          const location = show.state ? `${show.city}, ${show.state}` : show.city;
                          const dateStr = (() => {
                            try {
                              const d = new Date(show.date + 'T12:00:00');
                              return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
                            } catch { return show.date; }
                          })();
                          const lines: string[] = [
                            `🎸 7th Heaven is playing in your area!`,
                            ``,
                            `📍 ${show.venue} — ${location}`,
                          ];
                          if (dateStr) lines.push(`📅 ${dateStr}`);
                          if (show.doorsTime && show.time) {
                            lines.push(`🚪 Doors: ${show.doorsTime} | Show: ${show.time}`);
                          } else if (show.time) {
                            lines.push(`🕗 Show: ${show.time}`);
                          } else if (show.doorsTime) {
                            lines.push(`🚪 Doors: ${show.doorsTime}`);
                          }
                          if (show.allAges === true) lines.push(`✅ All Ages`);
                          else if (show.allAges === false) lines.push(`🔞 21+`);
                          if (show.cover) {
                            const lc = show.cover.toLowerCase();
                            if (lc === 'free' || lc === 'no cover' || lc === '$0') lines.push(`🎟️ FREE — No Cover`);
                            else lines.push(`🎟️ Cover: ${show.cover}`);
                          }
                          lines.push(``);
                          lines.push(`Reply STOP to unsubscribe.`);
                          setSmsPreview(lines.join('\n'));
                        } else {
                          setSmsPreview('');
                        }
                      }}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-rose-500/50 transition-colors appearance-none cursor-pointer"
                      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23ffffff40' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center' }}
                    >
                      <option value="">— Select an upcoming show —</option>
                      {smsShows.map((show: any) => {
                        const dateStr = (() => {
                          try {
                            const d = new Date(show.date + 'T12:00:00');
                            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                          } catch { return show.date; }
                        })();
                        const loc = show.state ? `${show.city}, ${show.state}` : show.city;
                        return (
                          <option key={show._id} value={show._id}>
                            {dateStr} — {show.venue} ({loc}) {show.time ? `@ ${show.time}` : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Message Preview */}
                  {smsPreview && (
                    <div>
                      <label className="text-[0.6rem] font-bold uppercase tracking-widest text-white/40 mb-2 block">Message Preview</label>
                      <div className="bg-black/40 border border-white/10 rounded-lg p-4 relative">
                        <pre className="text-sm text-white/80 font-mono leading-relaxed whitespace-pre-wrap">{smsPreview}</pre>
                        <span className="absolute top-3 right-3 text-[0.5rem] font-bold text-white/20 uppercase tracking-widest">
                          {smsPreview.length} chars
                        </span>
                      </div>

                      {/* Missing field hints */}
                      {(() => {
                        const show = smsShows.find((s: any) => s._id === smsSelectedShow);
                        if (!show) return null;
                        const missing: string[] = [];
                        if (!show.doorsTime) missing.push('Doors Time');
                        if (show.allAges === undefined || show.allAges === null) missing.push('All Ages');
                        if (!show.cover) missing.push('Cover/Admission');
                        if (!show.time) missing.push('Show Time');
                        if (missing.length === 0) return null;
                        return (
                          <p className="mt-2 text-[0.6rem] text-amber-400/80 flex items-center gap-1.5">
                            <span>⚠</span> Missing from Sanity: <strong>{missing.join(', ')}</strong> — add in <a href="/studio" className="underline hover:text-white transition-colors">Studio</a> to enrich the message
                          </p>
                        );
                      })()}
                    </div>
                  )}

                  {/* Custom message override */}
                  <div>
                    <label className="text-[0.6rem] font-bold uppercase tracking-widest text-white/40 mb-2 block">
                      Custom Message Override <span className="text-white/20 normal-case">(optional — replaces auto-message)</span>
                    </label>
                    <div className="w-full text-black [&_.ql-editor]:min-h-[120px] relative z-20">
                      <ReactQuill
                        theme="snow"
                        value={smsCustomMsg}
                        onChange={setSmsCustomMsg}
                        placeholder="Leave empty to use the auto-generated message above"
                        className="bg-white rounded-xl overflow-hidden"
                      />
                    </div>
                  </div>

                  {/* Send controls */}
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      {smsResult && (
                        <div className={`text-sm font-bold ${smsResult.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {smsResult.success ? (
                            <>
                              ✓ {smsResult.sent !== undefined ? `Sent to ${smsResult.sent} fan${smsResult.sent !== 1 ? 's' : ''}` : smsResult.message}
                              {smsResult.note && <span className="text-amber-400 ml-2 text-xs">({smsResult.note})</span>}
                            </>
                          ) : (
                            <>✕ {smsResult.error}</>
                          )}
                        </div>
                      )}
                    </div>
                    <button
                      disabled={smsSending || !smsSelectedShow}
                      onClick={async () => {
                        const show = smsShows.find((s: any) => s._id === smsSelectedShow);
                        if (!show) return;
                        const recipientDesc = `fans near ${show.venue}`;
                        if (!confirm(`Send proximity SMS to ${recipientDesc}?`)) return;
                        setSmsSending(true);
                        setSmsResult(null);
                        try {
                          const body: any = {
                            venue: show.venue,
                            city: show.city,
                            state: show.state || '',
                            lat: show.lat,
                            lng: show.lng,
                          };
                          if (smsCustomMsg.replace(/<[^>]*>/g, '').trim()) {
                            body.message = smsCustomMsg;
                          } else {
                            const d = new Date(show.date + 'T12:00:00');
                            body.date = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
                            body.time = show.time || '';
                            body.doorsTime = show.doorsTime || '';
                            if (show.allAges !== undefined && show.allAges !== null) body.allAges = show.allAges;
                            if (show.cover) body.cover = show.cover;
                          }
                          const res = await fetch('/api/sms/send', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(body),
                          });
                          const data = await res.json();
                          setSmsResult(data);
                        } catch (err: any) {
                          setSmsResult({ error: err.message });
                        }
                        setSmsSending(false);
                      }}
                      className="px-6 py-3 bg-rose-500 hover:bg-rose-400 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold text-sm uppercase tracking-widest rounded-lg transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(244,63,94,0.3)]"
                    >
                      {smsSending ? (
                        <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</>
                      ) : (
                        <>📡 Send Proximity Blast</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
              </div>
            </section>
  );

  const renderCrewSms = () => (
    <section className="bg-[#0f0f13] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
              <div onClick={() => toggleSection('crewsms')} className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20 cursor-pointer select-none hover:bg-black/30 transition-colors">
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <div className="drag-handle cursor-grab active:cursor-grabbing p-1.5 hover:bg-white/5 rounded text-white/20 hover:text-white/50 transition-all shrink-0 mr-1" title="Drag to reorder section">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>
                  </div>
                  <h3 onClick={() => toggleSection('crewsms')} className="cursor-pointer text-lg font-bold tracking-tight flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  🛡️ Crew SMS Alert
                </h3>
                </div>
                <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                  
                  <div className={"w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center transition-transform duration-300 " + (isSectionOpen('crewsms') ? 'rotate-0' : '-rotate-90')}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40"><path d="M2 4l4 4 4-4" /></svg>
                  </div>
                </div>
              </div>
              <div style={{ display: isSectionOpen('crewsms') ? undefined : 'none' }}>
                <div className="p-6">
                <p className="text-[0.7rem] text-white/40 mb-4">
                  Send an instant text message to all crew members & admins. Use for urgent updates, schedule changes, or show-day alerts.
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="text-[0.6rem] font-bold uppercase tracking-widest text-white/40 mb-2 block">Alert Message</label>
                    <textarea
                      value={crewAlertMsg}
                      onChange={e => setCrewAlertMsg(e.target.value)}
                      placeholder="e.g. Load-in moved to 3PM. Doors at 6. See you there."
                      rows={3}
                      maxLength={320}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-amber-500/50 transition-colors resize-none"
                    />
                    <div className="flex justify-between mt-1">
                      <span className="text-[0.55rem] text-white/20">{crewAlertMsg.length}/320 characters</span>
                      {crewAlertStats?.withPhone === 0 && (
                        <span className="text-[0.55rem] text-amber-400">⚠ No crew members have phone numbers on file</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      {crewAlertResult && (
                        <p className={`text-sm font-bold ${crewAlertResult.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {crewAlertResult.success
                            ? `✓ Sent to ${crewAlertResult.sent} crew member${crewAlertResult.sent !== 1 ? 's' : ''}${crewAlertResult.dev ? ' (dev mode)' : ''}`
                            : `✕ ${crewAlertResult.error}`}
                          {crewAlertResult.failed > 0 && <span className="text-rose-400 ml-2">({crewAlertResult.failed} failed)</span>}
                        </p>
                      )}
                    </div>
                    <button
                      disabled={crewAlertSending || !crewAlertMsg.trim()}
                      onClick={async () => {
                        if (!confirm(`Send this text to ALL ${crewAlertStats?.withPhone || 0} crew members?`)) return;
                        setCrewAlertSending(true);
                        setCrewAlertResult(null);
                        try {
                          const res = await fetch('/api/admin/crew-alert', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ message: crewAlertMsg }),
                          });
                          const data = await res.json();
                          setCrewAlertResult(data);
                          if (data.success) setCrewAlertMsg('');
                        } catch (err: any) {
                          setCrewAlertResult({ error: err.message });
                        }
                        setCrewAlertSending(false);
                      }}
                      className="px-6 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-30 disabled:cursor-not-allowed text-black font-bold text-sm uppercase tracking-widest rounded-lg transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                    >
                      {crewAlertSending ? (
                        <><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Sending...</>
                      ) : (
                        <>📱 Send Crew Alert</>
                      )}
                    </button>
                  </div>

                  {/* Automated Crew Reminders Sub-section */}
                  <div className="border-t border-white/5 pt-6 mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-white">Automated Shift Reminders</h4>
                        <p className="text-[0.65rem] text-white/40 mt-0.5">Send text reminders to crew members automatically before their scheduled shifts.</p>
                      </div>
                      <button
                        onClick={async () => {
                          const newVal = !crewAutoReminders;
                          setCrewAutoReminders(newVal);
                          try {
                            await fetch('/api/admin/settings', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ key: 'crew_auto_reminders', value: newVal ? 'on' : 'off' }),
                            });
                          } catch {}
                        }}
                        className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer border-none ${crewAutoReminders ? 'bg-emerald-500' : 'bg-white/10'}`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${crewAutoReminders ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </button>
                    </div>

                    {crewAutoReminders && (
                      <div className="space-y-4 bg-white/[0.02] border border-white/5 rounded-xl p-4 animate-[slideIn_0.2s_ease]">
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                          <div>
                            <span className="text-[0.6rem] font-bold uppercase tracking-widest text-white/40 block mb-1.5">Reminder Timing</span>
                            <div className="relative inline-block">
                              <select
                                value={crewAutoRemindersHours}
                                onChange={async (e) => {
                                  const v = parseInt(e.target.value, 10);
                                  setCrewAutoRemindersHours(v);
                                  try {
                                    await fetch('/api/admin/settings', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ key: 'crew_auto_reminders_hours', value: String(v) }),
                                    });
                                  } catch {}
                                }}
                                className="appearance-none pr-8 pl-3 py-1.5 border border-white/10 bg-black/45 hover:bg-white/5 text-xs font-bold text-white rounded-lg shadow-sm transition-colors cursor-pointer outline-none border-solid min-w-[140px]"
                              >
                                <option value="2">2 Hours Before</option>
                                <option value="6">6 Hours Before</option>
                                <option value="12">12 Hours Before</option>
                                <option value="24">24 Hours Before</option>
                                <option value="48">48 Hours Before</option>
                              </select>
                              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-white/30">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-[0.55rem] text-emerald-400 font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                              ● Active Reminders Queue
                            </span>
                          </div>
                        </div>

                        <div>
                          <span className="text-[0.6rem] font-bold uppercase tracking-widest text-white/40 block mb-1.5">Message Template Preview</span>
                          <div className="bg-black/30 border border-white/5 rounded-lg p-3 text-[11px] text-white/70 font-mono leading-relaxed select-text">
                            Hi [Crew Name], this is an automated reminder that you are scheduled for <span className="text-amber-400">[Role]</span> at <span className="text-amber-400">[Show/Location]</span> starting at <span className="text-amber-400">[Shift Time]</span>. Please reply if you have conflicts.
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              </div>
            </section>
  );

  const renderNewsletter = () => (
    <section className="bg-[#0f0f13] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
              <div onClick={() => toggleSection('newsletter')} className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20 cursor-pointer select-none hover:bg-black/30 transition-colors">
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <div className="drag-handle cursor-grab active:cursor-grabbing p-1.5 hover:bg-white/5 rounded text-white/20 hover:text-white/50 transition-all shrink-0 mr-1" title="Drag to reorder section">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>
                  </div>
                  <h3 onClick={() => toggleSection('newsletter')} className="cursor-pointer text-lg font-bold tracking-tight flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  Newsletter Blast
                </h3>
                </div>
                <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                  
                  <div className={"w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center transition-transform duration-300 " + (isSectionOpen('newsletter') ? 'rotate-0' : '-rotate-90')}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40"><path d="M2 4l4 4 4-4" /></svg>
                  </div>
                </div>
              </div>
              <div style={{ display: isSectionOpen('newsletter') ? undefined : 'none' }}>
                <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-[0.6rem] font-bold uppercase tracking-widest text-white/40 mb-2 block">Subject Line</label>
                    <input
                      type="text"
                      value={blastSubject}
                      onChange={e => setBlastSubject(e.target.value)}
                      placeholder="e.g. 🎸 New Show Announced — Chicago June 15th!"
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[var(--color-accent)]/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[0.6rem] font-bold uppercase tracking-widest text-white/40 mb-2 block">Message Body</label>
                    <textarea
                      value={blastBody}
                      onChange={e => setBlastBody(e.target.value)}
                      placeholder="Write your announcement here..."
                      rows={6}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[var(--color-accent)]/50 transition-colors resize-none"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      {blastResult && (
                        <p className={`text-sm font-bold ${blastResult.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {blastResult.success ? `✓ Sent to ${blastResult.sent} fans` : `✕ ${blastResult.error}`}
                          {blastResult.failed > 0 && <span className="text-rose-400 ml-2">({blastResult.failed} failed)</span>}
                        </p>
                      )}
                    </div>
                    <button
                      disabled={blastSending || !blastSubject.trim() || !blastBody.trim()}
                      onClick={async () => {
                        if (!confirm(`Send this email to ALL ${fanData?.total || 0} fans?`)) return;
                        setBlastSending(true);
                        setBlastResult(null);
                        try {
                          const res = await fetch('/api/admin/newsletter', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ subject: blastSubject, body: blastBody }),
                          });
                          const data = await res.json();
                          setBlastResult(data);
                          if (data.success) { setBlastSubject(''); setBlastBody(''); }
                        } catch (err: any) {
                          setBlastResult({ error: err.message });
                        }
                        setBlastSending(false);
                      }}
                      className="px-6 py-3 bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 disabled:opacity-30 disabled:cursor-not-allowed text-black font-bold text-sm uppercase tracking-widest rounded-lg transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                    >
                      {blastSending ? (
                        <><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Sending...</>
                      ) : (
                        <>📨 Send Blast</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
              </div>
            </section>
  );

  const renderRegistry = () => (
    <section className="bg-[#0f0f13] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
              <div onClick={() => toggleSection('registry')} className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20 cursor-pointer select-none hover:bg-black/30 transition-colors">
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <div className="drag-handle cursor-grab active:cursor-grabbing p-1.5 hover:bg-white/5 rounded text-white/20 hover:text-white/50 transition-all shrink-0 mr-1" title="Drag to reorder section">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>
                  </div>
                  <h3 onClick={() => toggleSection('registry')} className="cursor-pointer text-lg font-bold tracking-tight flex items-center gap-2 shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                  Community Registry
                </h3>
                </div>
                <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                  <div className="flex bg-black rounded p-1 border border-white/10 overflow-x-auto shrink-0 w-full sm:w-auto">
    {['All', 'fan', 'crew', 'admin'].map(role => (
      <button
        key={role}
        onClick={() => setFilterRole(role as any)}
        className={`px-3 py-1.5 text-[0.6rem] font-bold uppercase tracking-widest rounded transition-colors whitespace-nowrap ${filterRole === role ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
      >
        {role}
      </button>
    ))}
  </div>
                  <div className={"w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center transition-transform duration-300 " + (isSectionOpen('registry') ? 'rotate-0' : '-rotate-90')}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40"><path d="M2 4l4 4 4-4" /></svg>
                  </div>
                </div>
              </div>
              <div style={{ display: isSectionOpen('registry') ? undefined : 'none' }}>
                <div className="p-0 max-h-[400px] overflow-y-auto custom-scrollbar" data-lenis-prevent="true">
                {isLoading ? (
                  <div className="p-12 text-center text-white/30 font-mono text-xs animate-pulse">Pulling registry data...</div>
                ) : filteredUsers.length === 0 ? (
                  <div className="p-12 text-center text-white/30 font-mono text-xs">No users found matching this filter.</div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/[0.02] text-white/30 text-[0.6rem] uppercase tracking-widest">
                        <th className="p-4 font-bold border-b border-white/5">User</th>
                        <th className="p-4 font-bold border-b border-white/5">Role</th>
                        <th className="p-4 font-bold border-b border-white/5">Status</th>
                        <th className="p-4 font-bold border-b border-white/5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => {
                        const accounts = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('7h_accounts') || '{}') : {};
                        const acct = Object.values(accounts).find((a: any) => 
                          (a.id && a.id === user.id) || 
                          (a.email && user.email && a.email.toLowerCase() === user.email.toLowerCase()) ||
                          (a.name && a.name.toLowerCase() === user.name.toLowerCase())
                        ) as any;
                        return (
                        <React.Fragment key={user.id}>
                        <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                          <td className="p-4 font-bold text-sm truncate max-w-[150px]">{user.name}</td>
                          <td className="p-4 text-sm">
                            <span className={`px-2 py-0.5 rounded text-[0.6rem] font-bold uppercase tracking-widest ${user.role === 'crew' || user.role === 'admin' ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent)] border border-[var(--color-accent)]/30' : 'bg-white/5 text-white/60 border border-white/10'}`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1.5">
                              <span className={`w-2 h-2 rounded-full ${
                                user.status === 'streaming' ? 'bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]'
                                : user.status === 'watching' ? 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]'
                                : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]'
                              }`} />
                              <span className="text-[0.6rem] uppercase tracking-wider text-white/50">{user.status}</span>
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            {user.role !== 'admin' ? (
                              <div className="flex items-center justify-end gap-2">
                                <button 
                                  onClick={() => setViewingUser(viewingUser === user.id ? null : user.id)}
                                  className="px-3 py-2 bg-transparent border border-white/10 text-white/40 hover:bg-white/5 hover:text-white text-[0.6rem] font-bold uppercase tracking-widest rounded transition-all"
                                >
                                  {viewingUser === user.id ? 'Hide' : 'View'}
                                </button>
                                <button 
                                  onClick={() => banUser(user.id, user.name)}
                                  className="px-3 py-2 bg-transparent border border-red-500/30 text-red-500 hover:bg-red-500 hover:border-red-500 hover:text-white text-[0.6rem] font-bold uppercase tracking-widest rounded transition-all"
                                >
                                  Remove
                                </button>
                              </div>
                            ) : (
                              <span className="px-4 py-2 inline-block text-[0.55rem] uppercase font-bold tracking-widest text-white/20">
                                Protected
                              </span>
                            )}
                          </td>
                        </tr>
                        {viewingUser === user.id && (
                          <tr className="bg-white/[0.02]">
                            <td colSpan={4} className="px-6 py-3">
                              <div className="flex items-center gap-8 text-[0.7rem]">
                                <div>
                                  <span className="text-white/30 uppercase tracking-widest text-[0.55rem] font-bold">Email: </span>
                                  <span className="text-white font-mono">{acct?.email || user.email || 'N/A'}</span>
                                </div>
                                <div>
                                  <span className="text-white/30 uppercase tracking-widest text-[0.55rem] font-bold">Password: </span>
                                  <span className="text-amber-400 font-mono">
                                    {acct?.password || (user.role === 'crew' ? '********' : 'N/A')}
                                  </span>
                                  {user.role === 'crew' && (
                                    <button 
                                      onClick={async () => {
                                        const res = await adminResetPassword(user.id, user.email);
                                        if (res.success) {
                                          const accounts = JSON.parse(localStorage.getItem('7h_accounts') || '{}');
                                          accounts[user.email.toLowerCase()] = {
                                            ...accounts[user.email.toLowerCase()],
                                            id: user.id,
                                            name: user.name,
                                            email: user.email.toLowerCase(),
                                            password: res.password,
                                            role: 'crew'
                                          };
                                          localStorage.setItem('7h_accounts', JSON.stringify(accounts));
                                          alert(`Password reset to: ${res.password}\n\nPlease refresh to see changes.`);
                                          window.location.reload();
                                        }
                                      }}
                                      className="ml-4 px-2 py-1 bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-black border border-amber-500/20 text-[0.55rem] font-bold uppercase tracking-widest rounded transition-all"
                                    >
                                      Reset & Show
                                    </button>
                                  )}
                                </div>
                                {user.role === 'crew' && !acct?.password && (
                                  <p className="text-[0.6rem] text-amber-500/60 font-bold italic">
                                    * Credentials lost (Check browser history or re-create account)
                                  </p>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                        </React.Fragment>
                        );
                      })}

                    </tbody>
                  </table>
                )}
              </div>
              </div>
            </section>
  );

  const renderCrewCreation = () => (
    <section className="bg-[#0f0f13] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
              <div onClick={() => toggleSection('crewcreation')} className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20 cursor-pointer select-none hover:bg-black/30 transition-colors">
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <div className="drag-handle cursor-grab active:cursor-grabbing p-1.5 hover:bg-white/5 rounded text-white/20 hover:text-white/50 transition-all shrink-0 mr-1" title="Drag to reorder section">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>
                  </div>
                  <h3 onClick={() => toggleSection('crewcreation')} className="cursor-pointer text-lg font-bold tracking-tight text-white">Create Crew Account</h3>
                </div>
                <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                  
                  <div className={"w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center transition-transform duration-300 " + (isSectionOpen('crewcreation') ? 'rotate-0' : '-rotate-90')}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40"><path d="M2 4l4 4 4-4" /></svg>
                  </div>
                </div>
              </div>
              <div style={{ display: isSectionOpen('crewcreation') ? undefined : 'none' }}>
                <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                  <div>
                    <label className="text-[0.6rem] uppercase tracking-[0.15em] text-white/40 mb-2 block font-bold">Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Alex Rivera"
                      value={newCrewName}
                      onChange={e => setNewCrewName(e.target.value)}
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 text-sm text-white placeholder-white/20 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-[0.6rem] uppercase tracking-[0.15em] text-white/40 mb-2 block font-bold">Username</label>
                    <input
                      type="text"
                      placeholder="e.g. alex_7h"
                      value={newCrewUsername}
                      onChange={e => setNewCrewUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase())}
                      maxLength={24}
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 text-sm text-white placeholder-white/20 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-[0.6rem] uppercase tracking-[0.15em] text-white/40 mb-2 block font-bold">Email Address</label>
                    <input
                      type="email"
                      placeholder="crew@7thheaven.com"
                      value={newCrewEmail}
                      onChange={e => setNewCrewEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 text-sm text-white placeholder-white/20 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-[0.6rem] uppercase tracking-[0.15em] text-white/40 mb-2 block font-bold">Password</label>
                    <input
                      type="password"
                      placeholder="Min 6 characters"
                      value={newCrewPassword}
                      onChange={e => setNewCrewPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 text-sm text-white placeholder-white/20 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-[0.6rem] uppercase tracking-[0.15em] text-white/40 mb-2 block font-bold">Phone Number <span className="text-amber-400">*</span></label>
                    <input
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={newCrewPhone}
                      onChange={e => {
                        const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                        if (digits.length <= 3) setNewCrewPhone(digits);
                        else if (digits.length <= 6) setNewCrewPhone(`(${digits.slice(0, 3)}) ${digits.slice(3)}`);
                        else setNewCrewPhone(`(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`);
                      }}
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 text-sm text-white placeholder-white/20 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all rounded-lg"
                    />
                  </div>
                  <button
                    onClick={createCrew}
                    disabled={!newCrewName.trim() || !newCrewEmail.trim() || !newCrewPassword.trim()}
                    className="px-6 py-3 bg-emerald-500 text-black font-bold text-[0.7rem] uppercase tracking-[0.15em] rounded-lg hover:bg-emerald-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] flex items-center gap-2 whitespace-nowrap"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
                    Create Account
                  </button>
                </div>
                <div className="mt-4 p-3 bg-white/[0.02] border border-white/5 rounded-lg flex items-start gap-3">
                  <span className="text-amber-400 text-sm mt-0.5">⚠️</span>
                  <p className="text-[0.65rem] text-white/40 leading-relaxed">
                    A crew account will be created with the credentials above. Share the login details securely with the crew member. Only admins can create crew accounts.
                  </p>
                </div>

                {/* Success card */}
                {createdCrew && (
                  <div className="mt-4 p-5 bg-emerald-500/[0.08] border border-emerald-500/30 rounded-xl animate-[fadeIn_0.3s_ease]">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-lg shrink-0">✅</div>
                        <div>
                          <h4 className="text-sm font-bold text-emerald-400">Crew Account Created</h4>
                          <p className="text-[0.7rem] text-white/60 mt-1"><strong className="text-white">{createdCrew.name}</strong> · {createdCrew.email}</p>
                          {createdCrew.phone && <p className="text-[0.65rem] text-white/40 mt-0.5">📱 {createdCrew.phone}</p>}
                          <div className="mt-3 flex items-center gap-3 p-3 bg-black/40 border border-white/10 rounded-lg">
                            <span className="text-[0.55rem] uppercase tracking-[0.15em] text-white/30 font-bold shrink-0">Temp Password</span>
                            <code className="text-sm font-mono font-bold text-amber-400 tracking-wider select-all">{createdCrew.password}</code>
                            <button
                              onClick={() => { navigator.clipboard.writeText(createdCrew.password); }}
                              className="ml-auto text-[0.55rem] uppercase tracking-[0.15em] text-white/30 hover:text-white font-bold transition-colors px-2 py-1 border border-white/10 hover:border-white/30 rounded"
                            >Copy</button>
                          </div>
                        </div>
                      </div>
                      <button onClick={() => setCreatedCrew(null)} className="text-white/20 hover:text-white text-lg transition-colors shrink-0">✕</button>
                    </div>
                    <button
                      onClick={scrollToRegistry}
                      className="mt-4 w-full py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[0.65rem] uppercase tracking-[0.15em] font-bold hover:bg-emerald-500/20 transition-all rounded-lg flex items-center justify-center gap-2"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                      View in Registry ↓
                    </button>
                  </div>
                )}

                {/* Error */}
                {crewError && (
                  <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center gap-3">
                    <span className="text-rose-400">✕</span>
                    <p className="text-[0.7rem] text-rose-400 font-bold">{crewError}</p>
                    <button onClick={() => setCrewError('')} className="ml-auto text-white/30 hover:text-white">✕</button>
                  </div>
                )}
              </div>
              </div>
            </section>
  );

  const createAdmin = async () => {
    if (!newAdminName.trim() || !newAdminEmail.trim()) return;
    setAdminCreateLoading(true);
    setAdminCreateError('');
    setCreatedAdmin(null);
    const savedName = newAdminName;
    const savedEmail = newAdminEmail;
    const res = await adminCreateAdmin({ name: newAdminName, email: newAdminEmail });
    if (res.success) {
      setCreatedAdmin({ name: savedName, email: savedEmail, password: res.password || '' });
      setNewAdminName('');
      setNewAdminEmail('');
    } else {
      setAdminCreateError(res.error || 'Failed to create admin account.');
    }
    setAdminCreateLoading(false);
  };

  const renderAdminCreation = () => (
    <section className="bg-[#0f0f13] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
      <div onClick={() => toggleSection('admincreation')} className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20 cursor-pointer select-none hover:bg-black/30 transition-colors">
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <div className="drag-handle cursor-grab active:cursor-grabbing p-1.5 hover:bg-white/5 rounded text-white/20 hover:text-white/50 transition-all shrink-0 mr-1" title="Drag to reorder section">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>
          </div>
          <h3 onClick={() => toggleSection('admincreation')} className="cursor-pointer text-lg font-bold tracking-tight text-white">Create Admin Account</h3>
        </div>
        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
          <div className={"w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center transition-transform duration-300 " + (isSectionOpen('admincreation') ? 'rotate-0' : '-rotate-90')}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40"><path d="M2 4l4 4 4-4" /></svg>
          </div>
        </div>
      </div>
      <div style={{ display: isSectionOpen('admincreation') ? undefined : 'none' }}>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="text-[0.6rem] uppercase tracking-[0.15em] text-white/40 mb-2 block font-bold">Full Name</label>
              <input
                type="text"
                placeholder="e.g. Michael Scimeca"
                value={newAdminName}
                onChange={e => setNewAdminName(e.target.value)}
                className="w-full px-4 py-3 bg-black/40 border border-white/10 text-sm text-white placeholder-white/20 outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all rounded-lg"
              />
            </div>
            <div>
              <label className="text-[0.6rem] uppercase tracking-[0.15em] text-white/40 mb-2 block font-bold">Email Address</label>
              <input
                type="email"
                placeholder="admin@7thheaven.com"
                value={newAdminEmail}
                onChange={e => setNewAdminEmail(e.target.value)}
                className="w-full px-4 py-3 bg-black/40 border border-white/10 text-sm text-white placeholder-white/20 outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all rounded-lg"
              />
            </div>
            <button
              onClick={createAdmin}
              disabled={!newAdminName.trim() || !newAdminEmail.trim() || adminCreateLoading}
              className="px-6 py-3 bg-amber-500 text-black font-bold text-[0.7rem] uppercase tracking-[0.15em] rounded-lg hover:bg-amber-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] flex items-center gap-2 whitespace-nowrap"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
              {adminCreateLoading ? 'Creating…' : 'Create Admin'}
            </button>
          </div>

          <div className="mt-4 p-3 bg-white/[0.02] border border-white/5 rounded-lg flex items-start gap-3">
            <span className="text-amber-400 text-sm mt-0.5">🔐</span>
            <p className="text-[0.65rem] text-white/40 leading-relaxed">
              A secure temporary password will be auto-generated and emailed to the new admin. They can log in immediately with those credentials. Only grant admin access to trusted individuals — admin accounts have full platform access.
            </p>
          </div>

          {/* Success card */}
          {createdAdmin && (
            <div className="mt-4 p-5 bg-amber-500/[0.08] border border-amber-500/30 rounded-xl">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-lg shrink-0">✅</div>
                  <div>
                    <h4 className="text-sm font-bold text-amber-400">Admin Account Created</h4>
                    <p className="text-[0.7rem] text-white/60 mt-1"><strong className="text-white">{createdAdmin.name}</strong> · {createdAdmin.email}</p>
                    <div className="mt-3 flex items-center gap-3 p-3 bg-black/40 border border-white/10 rounded-lg">
                      <span className="text-[0.55rem] uppercase tracking-[0.15em] text-white/30 font-bold shrink-0">Temp Password</span>
                      <code className="text-sm font-mono font-bold text-amber-400 tracking-wider select-all">{createdAdmin.password}</code>
                      <button
                        onClick={() => { navigator.clipboard.writeText(createdAdmin.password); }}
                        className="ml-auto text-[0.55rem] uppercase tracking-[0.15em] text-white/30 hover:text-white font-bold transition-colors px-2 py-1 border border-white/10 hover:border-white/30 rounded"
                      >Copy</button>
                    </div>
                    <p className="text-[0.6rem] text-white/30 mt-2">📧 Welcome email sent to {createdAdmin.email}</p>
                  </div>
                </div>
                <button onClick={() => setCreatedAdmin(null)} className="text-white/20 hover:text-white text-lg transition-colors shrink-0">✕</button>
              </div>
            </div>
          )}

          {/* Error */}
          {adminCreateError && (
            <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center gap-3">
              <span className="text-rose-400">✕</span>
              <p className="text-[0.7rem] text-rose-400 font-bold">{adminCreateError}</p>
              <button onClick={() => setAdminCreateError('')} className="ml-auto text-white/30 hover:text-white">✕</button>
            </div>
          )}
        </div>
      </div>
    </section>
  );


  const renderInviteChallenge = () => (
    <section className="mt-8">
              <InviteChallengePanel shows={smsShows} />
            </section>
  );

  const renderBulkInvites = () => (
    <section className="mt-8">
      <BulkInvitePanel />
    </section>
  );

  const renderAwardPicks = () => (
    <section className="mt-8">
      <AwardPicksPanel />
    </section>
  );
  const addScheduleItem = () => {
    if (!draggedCrewMemberId || !activeDropDay) return;

    if (editingShiftId) {
      const activeAssignments = Object.entries(selectedCrewAssignments).filter(([_, val]) => val.active);
      const firstActiveAssignment = activeAssignments[0];
      const firstActiveCrewId = firstActiveAssignment?.[0] || 'openshifts';
      const firstActiveDetails = firstActiveAssignment?.[1];

      setSchedules(current => {
        let updated = current.map(item => {
          if (item.id === editingShiftId) {
            const sh = firstActiveDetails?.customized ? firstActiveDetails.startHour : dropStartHour;
            const eh = firstActiveDetails?.customized ? firstActiveDetails.endHour : dropEndHour;
            const r = firstActiveDetails?.customized ? firstActiveDetails.role : dropRole;
            return {
              ...item,
              date: activeDropDay,
              crewId: firstActiveCrewId,
              crewName: findCrewName(firstActiveCrewId),
              startHour: sh,
              endHour: eh,
              time: formatTimeFrame(sh, eh),
              role: r.toUpperCase(),
              location: dropLocation,
              notes: dropNotes
            };
          }
          return item;
        });

        if (activeAssignments.length > 1) {
          activeAssignments.slice(1).forEach(([crewId, details], idx) => {
            const newId = 'shift_' + Date.now() + '_' + idx;
            const newItem = {
              id: newId,
              crewId: crewId,
              crewName: findCrewName(crewId),
              date: activeDropDay,
              startHour: details.customized ? details.startHour : dropStartHour,
              endHour: details.customized ? details.endHour : dropEndHour,
              time: formatTimeFrame(details.customized ? details.startHour : dropStartHour, details.customized ? details.endHour : dropEndHour),
              role: (details.customized ? details.role : dropRole).toUpperCase(),
              location: dropLocation,
              notes: dropNotes
            };
            updated.push(newItem);
          });
        }

        localStorage.setItem('7h_crew_schedules', JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));
        
        fetch("/api/crew/calendar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updated)
        }).catch(err => console.error("Failed to sync schedules:", err));
        
        return updated;
      });
    } else {
      const activeAssignments = Object.entries(selectedCrewAssignments).filter(([_, val]) => val.active);
      
      setSchedules(current => {
        let updated = [...current];
        
        if (activeAssignments.length > 0) {
          activeAssignments.forEach(([crewId, details], idx) => {
            const newId = 'shift_' + Date.now() + '_' + idx;
            const newItem = {
              id: newId,
              crewId: crewId,
              crewName: findCrewName(crewId),
              date: activeDropDay,
              startHour: details.startHour,
              endHour: details.endHour,
              time: formatTimeFrame(details.startHour, details.endHour),
              role: details.role.toUpperCase(),
              location: dropLocation,
              notes: dropNotes
            };
            updated.push(newItem);
          });
        } else {
          const newId = 'shift_' + Date.now();
          const newItem = {
            id: newId,
            crewId: draggedCrewMemberId,
            crewName: findCrewName(draggedCrewMemberId),
            date: activeDropDay,
            startHour: dropStartHour,
            endHour: dropEndHour,
            time: formatTimeFrame(dropStartHour, dropEndHour),
            role: dropRole.toUpperCase(),
            location: dropLocation,
            notes: dropNotes
          };
          updated.push(newItem);
        }

        localStorage.setItem('7h_crew_schedules', JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));
        
        fetch("/api/crew/calendar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updated)
        }).catch(err => console.error("Failed to sync schedules:", err));
        
        return updated;
      });
    }

    saveCustomRole(dropRole);
    setActiveDropDay(null);
    setDraggedCrewMemberId(null);
    setEditingShiftId(null);
  };

  const deleteScheduleItem = (id: string) => {
    setSchedules(current => {
      const updated = current.filter(item => item.id !== id);
      localStorage.setItem('7h_crew_schedules', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
      
      fetch("/api/crew/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
      }).catch(err => console.error("Failed to sync schedules:", err));
      
      return updated;
    });
  };

  // Merge static and dynamic lists
  const findCrewName = (crewId: string) => {
    if (crewId === 'openshifts') return 'OpenShifts';
    const mockCrew = [
      { id: 'abbie', name: 'Abbie Janssen' },
      { id: 'al', name: 'Al Hollie' },
      { id: 'andrea', name: 'Andrea Kinzinger' },
      { id: 'arjun', name: 'Arjun Patel' },
      { id: 'chris', name: 'Chris Loxely' },
      { id: 'daniel', name: 'Daniel Kim' },
      { id: 'dave_croke', name: 'Dave Croke' },
      { id: 'dave_maas', name: 'Dave Maas' },
      { id: 'david_xu', name: 'David Xu' },
      { id: 'emily', name: 'Emily Hafften' },
      { id: 'emma', name: 'Emma Smid' },
      { id: 'erin', name: 'Erin Eagan' },
      { id: 'francesca', name: 'Francesca Troast' },
      { id: 'michael', name: 'Michael Scimeca' },
      { id: 'sammy', name: 'Sammy D' },
      { id: 'ryan', name: 'Ryan K' },
      { id: 'tony', name: 'Tony M' }
    ];
    
    // Look for static crew
    const staticCrew = [
      { id: 'abbie', name: 'Abbie Janssen', role: 'SERVER', maxHours: 40, avatar: '/images/crew/abbie.png' },
      { id: 'al', name: 'Al Hollie', role: 'SERVER', maxHours: 32, avatar: '/images/crew/al.png' },
      { id: 'andrea', name: 'Andrea Kinzinger', role: 'CHEF', maxHours: 40, avatar: '/images/crew/andrea.png' },
      { id: 'arjun', name: 'Arjun Patel', role: 'SERVER', maxHours: 32, avatar: '/images/crew/arjun.png' },
      { id: 'chris', name: 'Chris Loxely', role: 'SERVER', maxHours: 40, avatar: '/images/crew/chris.png' },
      { id: 'daniel', name: 'Daniel Kim', role: 'MANAGER', maxHours: 40, avatar: '/images/crew/daniel.png' },
      { id: 'dave_croke', name: 'Dave Croke', role: 'LINE COOK', maxHours: 32, avatar: '/images/crew/dave_croke.png' },
      { id: 'dave_maas', name: 'Dave Maas', role: 'CHEF', maxHours: 24, avatar: '/images/crew/dave_maas.png' },
      { id: 'david_xu', name: 'David Xu', role: 'MANAGER', maxHours: 40, avatar: '/images/crew/david_xu.png' },
      { id: 'emily', name: 'Emily Hafften', role: 'SERVER', maxHours: 32, avatar: '/images/crew/emily.png' },
      { id: 'emma', name: 'Emma Smid', role: 'LINE COOK', maxHours: 40, avatar: '/images/crew/emma.png' },
      { id: 'erin', name: 'Erin Eagan', role: 'POSITION', maxHours: 40, avatar: '/images/crew/erin.png' },
      { id: 'francesca', name: 'Francesca Troast', role: 'MANAGER', maxHours: 40, avatar: '/images/crew/francesca.png' }
    ];

    const foundStatic = staticCrew.find(sc => sc.id === crewId);
    if (foundStatic) return foundStatic.name;
    const foundMock = mockCrew.find(c => c.id === crewId);
    if (foundMock) return foundMock.name;
    const foundDynamic = users.find(u => u.id === crewId);
    if (foundDynamic) return foundDynamic.name;
    return crewId;
  };

  const generateTimeOptions = () => {
    const opts = [];
    for (let h = 8; h <= 24; h += 0.5) {
      opts.push({
        value: h,
        label: formatHour(h)
      });
    }
    return opts;
  };

  function renderCrewSchedule() {
    const getAvatarColor = (name: string) => {
      const colors = ['#f472b6', '#a78bfa', '#60a5fa', '#34d399', '#fbbf24', '#f87171', '#8b5cf6', '#ec4899'];
      let hash = 0;
      for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
      return colors[Math.abs(hash) % colors.length];
    };

    const CrewAvatar = ({ member }: { member: any }) => {
      const [hasError, setHasError] = useState(false);
      const showImage = member.avatar && (member.avatar.startsWith('http') || member.avatar.startsWith('/')) && !hasError;

      if (showImage) {
        return (
          <img
            src={member.avatar}
            alt={member.name}
            onError={() => setHasError(true)}
            className="w-9 h-9 rounded-full object-cover shrink-0 border border-white/10 shadow-sm"
          />
        );
      }

      const initials = member.initials || member.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
      const color = member.color || getAvatarColor(member.name);

      return (
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-sm text-white"
          style={{ backgroundColor: color, color: '#ffffff' }}
        >
          {initials}
        </div>
      );
    };

    const staticCrew = [
      { id: 'abbie', name: 'Abbie Janssen', role: 'SERVER', maxHours: 40, avatar: '/images/crew/abbie.png' },
      { id: 'al', name: 'Al Hollie', role: 'SERVER', maxHours: 32, avatar: '/images/crew/al.png' },
      { id: 'andrea', name: 'Andrea Kinzinger', role: 'CHEF', maxHours: 40, avatar: '/images/crew/andrea.png' },
      { id: 'arjun', name: 'Arjun Patel', role: 'SERVER', maxHours: 32, avatar: '/images/crew/arjun.png' },
      { id: 'chris', name: 'Chris Loxely', role: 'SERVER', maxHours: 40, avatar: '/images/crew/chris.png' },
      { id: 'daniel', name: 'Daniel Kim', role: 'MANAGER', maxHours: 40, avatar: '/images/crew/daniel.png' },
      { id: 'dave_croke', name: 'Dave Croke', role: 'LINE COOK', maxHours: 32, avatar: '/images/crew/dave_croke.png' },
      { id: 'dave_maas', name: 'Dave Maas', role: 'CHEF', maxHours: 24, avatar: '/images/crew/dave_maas.png' },
      { id: 'david_xu', name: 'David Xu', role: 'MANAGER', maxHours: 40, avatar: '/images/crew/david_xu.png' },
      { id: 'emily', name: 'Emily Hafften', role: 'SERVER', maxHours: 32, avatar: '/images/crew/emily.png' },
      { id: 'emma', name: 'Emma Smid', role: 'LINE COOK', maxHours: 40, avatar: '/images/crew/emma.png' },
      { id: 'erin', name: 'Erin Eagan', role: 'POSITION', maxHours: 40, avatar: '/images/crew/erin.png' },
      { id: 'francesca', name: 'Francesca Troast', role: 'MANAGER', maxHours: 40, avatar: '/images/crew/francesca.png' }
    ];

    const dynamicCrew = users
      .filter(u => u.role === 'crew')
      .map(u => {
        const initials = u.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
        return {
          id: u.id,
          name: u.name,
          role: 'Crew Member',
          maxHours: 40,
          initials: initials || 'C',
          color: getAvatarColor(u.name),
          avatar: u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=random`
        };
      });

    const crewMembers: any[] = [...staticCrew, ...dynamicCrew.filter(dc => !staticCrew.some(sc => sc.id === dc.id))];

    const handleAddGroupToDay = (dateStr: string, group: { name: string; memberIds: string[]; memberSettings?: { [crewId: string]: { startHour: number; endHour: number; role: string } } }) => {
      const newShiftsToAdd: any[] = [];
      group.memberIds.forEach(memberId => {
        const mObj = crewMembers.find(m => m.id === memberId);
        if (!mObj) return;

        const settings = group.memberSettings?.[memberId] || { startHour: 17.0, endHour: 22.0, role: mObj.role || 'SERVER' };
        const start = settings.startHour;
        const end = settings.endHour;
        
        newShiftsToAdd.push({
          id: `group_shift_${Date.now()}_${memberId}_${Math.random().toString(36).substr(2, 5)}`,
          crewId: memberId,
          crewName: mObj.name,
          date: dateStr,
          startHour: start,
          endHour: end,
          time: formatTimeFrame(start, end),
          role: settings.role,
          location: 'The Chicago Theatre',
          notes: ''
        });
      });

      setSchedules(prev => {
        const filtered = prev.filter(s => !(s.date === dateStr && group.memberIds.includes(s.crewId)));
        const next = [...filtered, ...newShiftsToAdd];
        localStorage.setItem('7h_crew_schedules', JSON.stringify(next));
        return next;
      });
    };

    const getNext7Days = (weekStart: Date) => {
      const days = [];
      const weekdayNames = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
      
      let numDays = 7;
      let start = new Date(weekStart);
      
      if (calendarRange === '4weeks') {
        numDays = 28;
      } else if (calendarRange === 'month') {
        const isBridgeToJanuary = weekStart.getMonth() === 11 && weekStart.getDate() > 20;
        const targetYear = isBridgeToJanuary ? weekStart.getFullYear() + 1 : weekStart.getFullYear();
        const targetMonth = isBridgeToJanuary ? 0 : weekStart.getMonth();
        start = new Date(targetYear, targetMonth, 1);
        numDays = new Date(targetYear, targetMonth + 1, 0).getDate();
      }

      for (let i = 0; i < numDays; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;
        
        const dayOfWeekIndex = (d.getDay() + 6) % 7;
        
        days.push({
          dateStr,
          dayName: weekdayNames[dayOfWeekIndex],
          dayOfMonth: d.getDate(),
          monthName: d.toLocaleString('en-US', { month: 'short' }),
          fullDate: d
        });
      }
      return days;
    };

    const next7Days = getNext7Days(currentWeekStart);
    
    // Filtered days: shows-only toggle, or all days
    const filteredDays = showTourDatesOnly 
      ? next7Days.filter(day => tourDates.some(s => s.date === day.dateStr))
      : next7Days;
    
    // Crew members with shifts this week (used for highlighting)
    const crewWithShifts = new Set(
      schedules
        .filter(s => next7Days.some(d => d.dateStr === s.date) && s.crewId !== 'openshifts')
        .map(s => s.crewId)
    );
    // Show all crew members (filter only by selected crew dropdown)
    const filteredCrewMembers = scheduleCrewFilter
      ? crewMembers.filter(m => m.id === scheduleCrewFilter)
      : crewMembers.filter(m => m.id !== 'openshifts');

    const getDayShow = (dateStr: string) => {
      let lookupDate = dateStr;
      const isDefaultMonth = currentWeekStart.getFullYear() === 2023 && currentWeekStart.getMonth() === 0;
      if (isDefaultMonth) {
        if (calendarRange === 'week' && currentWeekStart.getDate() === 23) {
          const mapping: { [key: string]: string } = {
            '2023-01-23': '2026-01-01',
            '2023-01-24': '2026-01-02',
            '2023-01-25': '2026-01-03',
            '2023-01-26': '2026-01-04',
            '2023-01-27': '2026-01-05',
            '2023-01-28': '2026-01-06',
            '2023-01-29': '2026-01-08'
          };
          if (mapping[dateStr]) {
            lookupDate = mapping[dateStr];
          }
        } else if (dateStr.startsWith('2023-01-')) {
          lookupDate = dateStr.replace('2023-01-', '2026-01-');
        }
      }
      return tourDates.find(s => s.date === lookupDate);
    };

    const getWeekRangeLabel = (weekStart: Date) => {
      const start = new Date(weekStart);
      const end = new Date(weekStart);
      end.setDate(weekStart.getDate() + 6);
      
      const startMonth = start.toLocaleString('en-US', { month: 'short' });
      const endMonth = end.toLocaleString('en-US', { month: 'short' });
      const startYear = start.getFullYear();
      
      if (startMonth === endMonth) {
        return `${startMonth} ${start.getDate()} – ${end.getDate()}`;
      } else {
        return `${startMonth} ${start.getDate()} – ${endMonth} ${end.getDate()}`;
      }
    };

    const getDayLabelOverride = (dateStr: string, index: number) => {
      const isDefaultWeek = currentWeekStart.getFullYear() === 2023 && currentWeekStart.getMonth() === 0 && currentWeekStart.getDate() === 23;
      if (isDefaultWeek && calendarRange === 'week') {
        const dayNames = ['MON 1', 'TUE 2', 'WED 3', 'THU 4', 'FRI 5', 'SAT 6', 'SUN 8'];
        return dayNames[index] || '';
      }
      
      const parts = dateStr.split('-');
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      const weekdayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
      const dayName = weekdayNames[d.getDay()];
      return `${dayName} ${d.getDate()}`;
    };

    const getCrewScheduledHours = (crewId: string, weekDays: any[]) => {
      const dates = weekDays.map(d => d.dateStr);
      const crewShifts = schedules.filter(s => s.crewId === crewId && dates.includes(s.date) && !s.isTimeOff);
      return crewShifts.reduce((sum, s) => {
        const duration = s.endHour - s.startHour;
        return sum + (isNaN(duration) ? 0 : duration);
      }, 0);
    };

    const getCrewScheduledHoursForMonth = (crewId: string, weekStart: Date) => {
      const year = weekStart.getFullYear();
      const month = weekStart.getMonth();
      const yearStr = String(year);
      const monthStr = String(month + 1).padStart(2, '0');
      const monthPrefix = `${yearStr}-${monthStr}-`;
      const crewShifts = schedules.filter(s => s.crewId === crewId && s.date.startsWith(monthPrefix) && !s.isTimeOff);
      return crewShifts.reduce((sum, s) => {
        const duration = s.endHour - s.startHour;
        return sum + (isNaN(duration) ? 0 : duration);
      }, 0);
    };

    const getCrewHoursStatus = (crewId: string, scheduledHours: number) => {
      const maxHoursMap: Record<string, number> = {
        abbie: 40,
        al: 32,
        andrea: 40,
        arjun: 32,
        chris: 40,
        daniel: 40,
        dave_croke: 32,
        dave_maas: 24,
        david_xu: 40,
        emily: 32,
        emma: 40,
        erin: 40,
        francesca: 40
      };
      
      const maxHours = maxHoursMap[crewId] || 40;
      const over = scheduledHours - maxHours;
      
      return {
        maxHours,
        over,
        status: over > 0 ? (over >= 8 ? 'critical' : 'warning') : 'ok'
      };
    };

    const roleStyles: Record<string, { bg: string, tagBg: string, label: string }> = {
      SERVER: { bg: '#0ea5e9', tagBg: '#0369a1', label: 'SERVER' },       // Vibrant Cyan / Sky Blue
      BUSSER: { bg: '#10b981', tagBg: '#047857', label: 'BUSSER' },       // Vibrant Emerald Green
      LINE_COOK: { bg: '#6366f1', tagBg: '#4338ca', label: 'LINE COOK' },  // Vibrant Indigo
      CHEF: { bg: '#f43f5e', tagBg: '#be123c', label: 'CHEF' },           // Vibrant Rose Red
      HOST: { bg: '#f59e0b', tagBg: '#b45309', label: 'HOST' },           // Vibrant Amber Gold
      MANAGER: { bg: '#a855f7', tagBg: '#7e22ce', label: 'MANAGER' },     // Vibrant Purple / Violet
      POSITION: { bg: '#06b6d4', tagBg: '#0891b2', label: 'POSITION' }    // Vibrant Electric Teal
    };

    const getRoleStyle = (role: string) => {
      const norm = (role || '').toUpperCase().trim().replace(/\s+/g, '_');
      const roleStylesTyped: Record<string, { bg: string, tagBg: string, label: string }> = roleStyles;
      return roleStylesTyped[norm] || { bg: '#3b82f6', tagBg: '#1d4ed8', label: role };
    };

    const formatHourWIW = (h: number) => {
      const isPM = h >= 12;
      let displayHour = Math.floor(h % 12);
      if (displayHour === 0) displayHour = 12;
      const m = Math.round((h - Math.floor(h)) * 60);
      const minutes = m === 0 ? '' : `:${String(m).padStart(2, '0')}`;
      const period = isPM ? 'p' : 'a';
      return `${displayHour}${minutes}${period}`;
    };

    const formatTimeStringWIW = (start: number, end: number) => {
      return `${formatHourWIW(start)} - ${formatHourWIW(end)}`;
    };

    const handlePrevWeek = () => {
      setSelectedTourDate(null);
      setCurrentWeekStart(prev => {
        const d = new Date(prev);
        if (calendarRange === '4weeks') {
          d.setDate(prev.getDate() - 28);
        } else if (calendarRange === 'month') {
          d.setMonth(prev.getMonth() - 1);
        } else {
          d.setDate(prev.getDate() - 7);
        }
        return d;
      });
    };

    const handleNextWeek = () => {
      setSelectedTourDate(null);
      setCurrentWeekStart(prev => {
        const d = new Date(prev);
        if (calendarRange === '4weeks') {
          d.setDate(prev.getDate() + 28);
        } else if (calendarRange === 'month') {
          d.setMonth(prev.getMonth() + 1);
        } else {
          d.setDate(prev.getDate() + 7);
        }
        return d;
      });
    };

    const handleGoToToday = () => {
      setSelectedTourDate(null);
      setCalendarRange('week');
      const today = new Date();
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1);
      setCurrentWeekStart(new Date(today.setDate(diff)));
    };

    const handleGoToMonth = () => {
      setSelectedTourDate(null);
      setCalendarRange('month');
      const is2023 = currentWeekStart.getFullYear() === 2023;
      if (is2023) {
        setCurrentWeekStart(new Date(2023, 0, 23));
      } else {
        setCurrentWeekStart(new Date(2025, 11, 29));
      }
    };

    const handleDropOnCell = (e: React.DragEvent, dateStr: string, crewId: string) => {
      e.preventDefault();
      e.stopPropagation();
      
      setDraggedShiftId(null);
      draggedShiftIdRef.current = null;
      
      const dragData = e.dataTransfer.getData("text/plain");
      if (dragData.startsWith("shift:")) {
        const shiftId = dragData.split(":")[1];
        setSchedules(current => {
          const updated = current.map(s => {
            if (s.id === shiftId) {
              const crewMember = crewMembers.find(c => c.id === crewId);
              return {
                ...s,
                date: dateStr,
                crewId: crewId,
                crewName: crewId === 'openshifts' ? 'OpenShifts' : (crewMember?.name || s.crewName)
              };
            }
            return s;
          });
          localStorage.setItem('7h_crew_schedules', JSON.stringify(updated));
          window.dispatchEvent(new Event('storage'));
          
          fetch("/api/crew/calendar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updated)
          }).catch(err => console.error("Failed to sync schedules:", err));
          
          return updated;
        });
      }
    };

    const handleCellClick = (dateStr: string, crewId: string, defaultRole: string) => {
      setDrawerCrewSearch('');
      setActiveDropDay(dateStr);
      setDraggedCrewMemberId(crewId);
      setDropStartHour(12);
      setDropEndHour(17);
      setDropRole(defaultRole || 'SERVER');
      
      // Auto-fill location from tour date if a show exists on this day
      const dayShow = tourDates.find(s => s.date === dateStr);
      if (dayShow) {
        const venueName = dayShow.venue || dayShow.venue_name || '';
        const cityStr = dayShow.city ? `${dayShow.city}, ${dayShow.state || 'IL'}` : '';
        setDropLocation(cityStr ? `${venueName} at ${cityStr}` : venueName);
      } else {
        setDropLocation('');
      }
      
      setDropNotes('');
      setEditingShiftId(null);

      // Initialize selectedCrewAssignments
      const initialAssignments: { [key: string]: any } = {};
      if (crewId && crewId !== 'openshifts') {
        initialAssignments[crewId] = {
          active: true,
          role: defaultRole || 'SERVER',
          startHour: 12,
          endHour: 17
        };
      }
      setSelectedCrewAssignments(initialAssignments);
    };

    const handleEditShiftClick = (shift: any) => {
      setDrawerCrewSearch('');
      setEditingShiftId(shift.id);
      setDraggedCrewMemberId(shift.crewId);
      setActiveDropDay(shift.date);
      setDropStartHour(shift.startHour);
      setDropEndHour(shift.endHour);
      setDropRole(shift.role);
      setDropLocation(shift.location);
      setDropNotes(shift.notes);

      const initialAssignments: { [key: string]: any } = {};
      if (shift.crewId && shift.crewId !== 'openshifts') {
        initialAssignments[shift.crewId] = {
          active: true,
          customized: true,
          role: shift.role,
          startHour: shift.startHour,
          endHour: shift.endHour
        };
      }
      setSelectedCrewAssignments(initialAssignments);
    };

    const renderShiftCard = (shift: any, showCrewName: boolean = false) => {
      if (shift.isTimeOff) {
        return (
          <div
            key={shift.id}
            onClick={(e) => {
              e.stopPropagation();
              handleEditShiftClick(shift);
            }}
            className="wiw-card select-none cursor-pointer rounded-md bg-[#252530] border border-white/10 py-3.5 px-2 flex items-center justify-center text-center w-full min-h-[52px]"
          >
            <span className="text-[10px] font-extrabold text-white/40 uppercase tracking-wider">
              Time Off All Day
            </span>
          </div>
        );
      }

      const roleStyle = getRoleStyle(shift.role);
      const timeLabel = shift.labelOverride || formatTimeStringWIW(shift.startHour, shift.endHour);
      const isBeingDragged = draggedShiftId === shift.id;

      const showOverlapAvatar = !showCrewName;

      return (
        <div
          key={shift.id}
          draggable
          onDragStart={(e) => {
            e.stopPropagation();
            e.dataTransfer.setData("text/plain", `shift:${shift.id}`);
            e.dataTransfer.effectAllowed = "move";
            setDraggedShiftId(shift.id);
            draggedShiftIdRef.current = shift.id;
            draggedShiftDurationRef.current = shift.endHour - shift.startHour;
          }}
          onDragEnd={() => {
            setDraggedShiftId(null);
            draggedShiftIdRef.current = null;
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleEditShiftClick(shift);
          }}
          style={{
            backgroundColor: roleStyle.bg,
            opacity: isBeingDragged ? 0.3 : 1
          }}
          className={`wiw-card relative select-none cursor-grab active:cursor-grabbing rounded-md p-1.5 flex flex-col justify-between shadow-sm min-h-[52px] text-white ${
            shift.isDraft ? 'wiw-striped' : ''
          }`}
        >
          {/* Action buttons — always visible */}
          <div className="absolute top-1 right-1 flex items-center gap-0.5 z-10">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleEditShiftClick(shift);
              }}
              className="w-5 h-5 flex items-center justify-center rounded bg-black/50 hover:bg-black/80 text-white/70 hover:text-white transition-all cursor-pointer border-none backdrop-blur-sm"
              title="Edit shift"
            >
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                deleteScheduleItem(shift.id);
              }}
              className="w-5 h-5 flex items-center justify-center rounded bg-black/50 hover:bg-red-600 text-white/70 hover:text-white transition-all cursor-pointer border-none backdrop-blur-sm"
              title="Delete shift"
            >
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </div>

          <div className={`flex flex-col gap-1 w-full ${showOverlapAvatar ? 'pl-3' : ''}`}>
            <span className="text-[10px] font-extrabold tracking-wide uppercase block">
              {timeLabel.split(' ')[0]}
              {timeLabel.includes('-') && ` - ${timeLabel.split('-')[1].trim().split(' ')[0]}`}
            </span>

            {shift.location || shift.labelOverride ? (
              <span className="text-[8.5px] font-bold opacity-85 truncate mt-0.5 block">
                {shift.labelOverride ? shift.labelOverride.replace(/^\d+[a|p]\s*-\s*\d+[a|p]\s*at\s*/i, '') : `📍 ${shift.location.split(',')[0]}`}
              </span>
            ) : null}

            <div className="mt-1.5 flex items-center justify-start">
              <span
                style={{ backgroundColor: roleStyle.tagBg }}
                className="px-1.5 py-0.5 rounded text-[7.5px] font-black uppercase tracking-wider leading-none text-white/90"
              >
                {roleStyle.label}
              </span>
            </div>
          </div>

          {showOverlapAvatar && (
            <div className="absolute -left-2.5 -bottom-2.5 w-6 h-6 rounded-full border-2 border-[#0f0f13] shadow-md z-20 overflow-hidden flex items-center justify-center shrink-0">
              {(() => {
                if (shift.crewId === 'openshifts') {
                  return (
                    <div className="w-full h-full flex items-center justify-center text-emerald-400 bg-[#102a1e]">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                        <circle cx="12" cy="12" r="10" />
                        <circle cx="12" cy="12" r="4" />
                      </svg>
                    </div>
                  );
                }
                const member = crewMembers.find(c => c.id === shift.crewId);
                const displayName = member?.name || shift.crewName || shift.crewId || '?';
                const avatarUrl = member?.avatar;
                const hasImage = avatarUrl && (avatarUrl.startsWith('http') || avatarUrl.startsWith('/'));
                if (hasImage) {
                  return (
                    <img
                      src={avatarUrl}
                      alt=""
                      className="w-full h-full object-cover rounded-full"
                    />
                  );
                }
                const initials = member?.initials || displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
                const color = member?.color || getAvatarColor(displayName);
                return (
                  <div
                    className="w-full h-full flex items-center justify-center font-bold text-[8px] text-white rounded-full"
                    style={{ backgroundColor: color }}
                  >
                    {initials}
                  </div>
                );
              })()}
            </div>
          )}

          {showCrewName && (
            <div className="flex items-center gap-1.5 mt-1.5 pt-1.5 border-t border-white/10 w-full">
              {shift.crewId === 'openshifts' ? (
                <>
                  <div className="w-4 h-4 rounded-full border border-emerald-500 bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold shrink-0 text-[7px]">
                    ●
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400 truncate">
                    OpenShifts
                  </span>
                </>
              ) : (
                <>
                  {/* Crew Avatar */}
                  {(() => {
                    const member = crewMembers.find(c => c.id === shift.crewId);
                    const displayName = member?.name || shift.crewName || shift.crewId || '?';
                    const avatarUrl = member?.avatar;
                    const hasImage = avatarUrl && (avatarUrl.startsWith('http') || avatarUrl.startsWith('/'));
                    if (hasImage) {
                      return (
                        <img
                          src={avatarUrl}
                          alt=""
                          className="w-4 h-4 rounded-full object-cover shrink-0"
                        />
                      );
                    }
                    const initials = member?.initials || displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
                    const color = member?.color || getAvatarColor(displayName);
                    return (
                      <div
                        className="w-4 h-4 rounded-full flex items-center justify-center font-bold text-[7px] shrink-0 text-white"
                        style={{ backgroundColor: color }}
                      >
                        {initials}
                      </div>
                    );
                  })()}
                  
                  <span className="text-[9px] font-black uppercase tracking-wider text-white/85 truncate">
                    {shift.crewName || (() => {
                      const member = crewMembers.find(c => c.id === shift.crewId);
                      return member ? member.name : shift.crewId;
                    })()}
                  </span>
                </>
              )}
            </div>
          )}

          {shift.crewId === 'openshifts' && shift.openSlots && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-md animate-pulse">
              {shift.openSlots}
            </span>
          )}

          {shift.notes && (
            <div className="absolute top-0 right-0 w-0 h-0 border-t-[8px] border-r-[8px] border-t-transparent border-r-green-400" title={`Note: ${shift.notes}`} />
          )}
        </div>
      );
    };

    const renderRosterBoard = () => {
      return (
        <div className="w-full max-h-[calc(100vh-270px)] overflow-auto border border-white/15 rounded-xl bg-black/40 shadow-inner">
          <table
            style={{ minWidth: filteredDays.length <= 2 ? 'auto' : `${224 + filteredDays.length * 160}px` }}
            className="w-full border-collapse text-left select-none table-fixed bg-transparent"
          >
            <thead>
              <tr className="border-b border-white/20 bg-white/[0.02] text-white/40 text-[11px] font-bold tracking-wider">
                <th className="p-3 w-56 border-r border-white/15 border-b border-white/20 uppercase wiw-sticky-corner">First Name</th>
                {filteredDays.map((day, idx) => {
                  const dayShow = getDayShow(day.dateStr);
                  return (
                    <th 
                      key={day.dateStr} 
                      className={`p-3 w-48 border-r border-white/15 border-b border-white/20 relative group wiw-sticky-header transition-all duration-200 ${
                        selectedTourDate === day.dateStr 
                          ? 'bg-amber-500/10 text-amber-400 font-black' 
                          : 'text-white/40'
                      }`}
                    >
                      <div className="flex flex-col gap-1 w-full">
                        <div className="flex items-center justify-between">
                          <span>{getDayLabelOverride(day.dateStr, idx)}</span>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-0.5 hover:bg-white/5 rounded text-white/40 hover:text-white border-none bg-transparent cursor-pointer">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg>
                            </button>
                            <button className="p-0.5 hover:bg-white/5 rounded text-white/40 hover:text-white border-none bg-transparent cursor-pointer">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 19V5"/><polyline points="5 12 12 5 19 12"/></svg>
                            </button>
                          </div>
                        </div>
                        {dayShow && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedShowCrewDate(day.dateStr);
                            }}
                            className="mt-1 w-full text-[9px] font-black uppercase text-amber-400 hover:text-white bg-amber-500/10 hover:bg-amber-500/30 border border-amber-500/20 hover:border-amber-500/40 px-1.5 py-0.5 rounded truncate select-none transition-all cursor-pointer flex items-center justify-center gap-1"
                            title={`Click to view crew working at ${dayShow.venue || dayShow.venue_name}`}
                          >
                            🎸 {dayShow.venue || dayShow.venue_name}
                          </button>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {/* Row 1: OpenShifts */}
              <tr className="border-b border-white/15 bg-emerald-500/[0.02] hover:bg-emerald-500/[0.04] transition-colors">
                <td className="p-3 border-r border-white/15 align-middle wiw-sticky-col">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full border-2 border-emerald-500 bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold shrink-0 shadow-sm">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg>
                    </div>
                    <div>
                      <span className="text-sm font-extrabold text-white/85 block">Open Shifts</span>
                      <span className="text-[9px] text-white/25 font-bold uppercase tracking-wider">Unfilled positions</span>
                    </div>
                  </div>
                </td>
                {filteredDays.map(day => {
                  const isSelectedDay = selectedTourDate === day.dateStr;
                  return (
                    <td
                      key={day.dateStr}
                      className={`p-2 border-r border-white/15 align-top relative min-h-[80px] hover:bg-white/[0.02] transition-colors cursor-pointer ${
                        isSelectedDay ? 'bg-amber-500/[0.03]' : ''
                      }`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
                      }}
                      onDrop={(e) => handleDropOnCell(e, day.dateStr, 'openshifts')}
                    >
                      <div className="flex flex-col gap-1.5 h-full w-full select-none" onClick={(e) => e.stopPropagation()}>
                        {/* Top Box: Add Crew Member */}
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCellClick(day.dateStr, 'openshifts', 'SERVER');
                          }}
                          className="w-full py-2.5 flex flex-col items-center justify-center border border-dashed border-emerald-500/25 hover:border-emerald-500/50 rounded-lg bg-emerald-500/[0.01] hover:bg-emerald-500/[0.04] transition-all cursor-pointer group"
                        >
                          <span className="text-[11px] text-emerald-400/40 group-hover:text-emerald-400/70 font-light transition-colors">+</span>
                          <span className="text-[8.5px] font-extrabold uppercase tracking-wider text-emerald-400/50 group-hover:text-emerald-400/80 transition-colors mt-0.5">
                            Add Crew Member
                          </span>
                        </div>

                        {/* Bottom Row: Split in 2 */}
                        <div className="flex gap-1.5 w-full relative">
                          {/* Left Box: Add Crew Group */}
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              setCellGroupPopover(prev => prev === `openshifts_group_${day.dateStr}` ? null : `openshifts_group_${day.dateStr}`);
                            }}
                            className="flex-1 py-2 flex flex-col items-center justify-center border border-dashed border-emerald-500/25 hover:border-emerald-500/50 rounded-lg bg-emerald-500/[0.01] hover:bg-emerald-500/[0.04] transition-all cursor-pointer group"
                          >
                            <span className="text-[11px] text-emerald-400/40 group-hover:text-emerald-400/70 font-light transition-colors">+</span>
                            <span className="text-[8px] font-extrabold uppercase tracking-wider text-emerald-400/50 group-hover:text-emerald-400/80 transition-colors mt-0.5 text-center leading-tight">
                              Add Crew Group
                            </span>
                          </div>

                          {/* Right Box: Create Group */}
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              setCreateGroupForDate(day.dateStr);
                              const initialSettings: any = {};
                              crewMembers.filter(m => m.id !== 'openshifts').forEach(m => {
                                initialSettings[m.id] = {
                                  active: false,
                                  role: m.role || 'SERVER',
                                  startHour: 17.0,
                                  endHour: 22.0
                                };
                              });
                              setNewGroupMemberSettings(initialSettings);
                              setNewGroupNameInput('');
                              setIsCreateGroupModalOpen(true);
                            }}
                            className="flex-1 py-2 flex flex-col items-center justify-center border border-dashed border-emerald-500/25 hover:border-emerald-500/50 rounded-lg bg-emerald-500/[0.01] hover:bg-emerald-500/[0.04] transition-all cursor-pointer group"
                          >
                            <span className="text-[11px] text-emerald-400/40 group-hover:text-emerald-400/70 font-light transition-colors">+</span>
                            <span className="text-[8px] font-extrabold uppercase tracking-wider text-emerald-400/50 group-hover:text-emerald-400/80 transition-colors mt-0.5 text-center leading-tight">
                              Create Group
                            </span>
                          </div>

                          {/* Saved groups list popover when Add Crew Group is clicked */}
                          {cellGroupPopover === `openshifts_group_${day.dateStr}` && (
                            <div 
                              data-group-popover-cell 
                              className="absolute left-1/2 bottom-full mb-1 -translate-x-1/2 w-48 bg-[#111116] border border-white/10 rounded-xl shadow-2xl p-2 z-50 flex flex-col gap-1 animate-[scaleIn_0.15s_ease]"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="text-[8px] text-white/30 uppercase tracking-widest font-black px-2 py-1 border-b border-white/5 mb-1">
                                Select Crew Group
                              </div>
                              {crewGroups.length === 0 ? (
                                <span className="text-[8px] text-white/30 italic px-2 py-0.5">No saved groups</span>
                              ) : (
                                crewGroups.map((g, gIdx) => (
                                  <button
                                    key={gIdx}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAddGroupToDay(day.dateStr, g);
                                      setCellGroupPopover(null);
                                    }}
                                    className="w-full text-left px-2 py-1 rounded hover:bg-emerald-500/10 text-[9px] text-emerald-300 font-semibold transition-colors cursor-pointer border-none bg-transparent truncate flex items-center gap-1.5"
                                    title={`Apply Group: ${g.name}`}
                                  >
                                    <span className="text-[10px] font-mono text-emerald-400">+</span>
                                    <span>{g.name}</span>
                                  </button>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
              {/* Crew Rows — individually collapsible */}
              {filteredCrewMembers.map(member => {
                const totalHours = getCrewScheduledHours(member.id, next7Days);
                const monthHours = getCrewScheduledHoursForMonth(member.id, currentWeekStart);
                const hoursStatus = getCrewHoursStatus(member.id, totalHours);
                const hasExclamation = member.id === 'arjun' || member.id === 'dave_croke';
                const isCollapsed = collapsedCrewIds.includes(member.id);
                const shiftCount = schedules.filter(s => next7Days.some(d => d.dateStr === s.date) && s.crewId === member.id).length;

                const toggleCollapse = () => {
                  setCollapsedCrewIds(prev =>
                    prev.includes(member.id) ? prev.filter(id => id !== member.id) : [...prev, member.id]
                  );
                };
                
                if (isCollapsed) {
                  return (
                    <tr key={member.id} className="border-b border-white/15 hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={toggleCollapse}>
                      <td colSpan={filteredDays.length + 1} className="px-3 py-2">
                        <div className="flex items-center gap-2.5">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white/30 shrink-0 transition-transform">
                            <polyline points="9 18 15 12 9 6"/>
                          </svg>
                          <CrewAvatar member={member} />
                          <span className="text-xs font-bold text-white/50">{member.name}</span>
                        </div>
                      </td>
                    </tr>
                  );
                }
                
                return (
                  <tr key={member.id} className="border-b border-white/15 hover:bg-white/[0.01] transition-colors">
                    <td className="p-3 border-r border-white/15 align-top relative cursor-pointer wiw-sticky-col" onClick={toggleCollapse}>
                      <div className="flex items-center gap-3">
                        {hasExclamation && (
                          <div className="absolute left-1 top-1/2 -translate-y-1/2 text-amber-500" title="Warning: Schedule issues">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                          </div>
                        )}
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white/30 shrink-0 transition-transform">
                          <polyline points="6 9 12 15 18 9"/>
                        </svg>
                        <CrewAvatar member={member} />
                        <div className="min-w-0 wiw-tooltip-container">
                          <p className="text-sm font-bold text-white/80 truncate">{member.name}</p>
                          
                          <div className="flex items-center gap-1.5 mt-1.5">
                            {member.id === 'al' ? (
                              <div className="flex items-center gap-1 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase text-rose-400 tracking-wider">
                                <span className="opacity-75">W:</span>
                                <span>🚫 {totalHours}h</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase text-white/60 tracking-wider">
                                <span className="text-white/30">W:</span>
                                <span className="text-white">{totalHours}h</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase text-white/60 tracking-wider">
                              <span className="text-white/30">M:</span>
                              <span className="text-white">{monthHours}h</span>
                            </div>
                          </div>

                          {hoursStatus.status !== 'ok' && (
                            <div className="wiw-tooltip bg-[#1c1d22] text-white p-3 rounded-lg shadow-xl text-left border border-slate-700/50 w-48 leading-relaxed font-sans text-xs">
                              <div className="font-bold text-slate-200">Scheduled: <span className="text-white">{totalHours} hours</span></div>
                              <div className="text-slate-400 mt-0.5">Max: {hoursStatus.maxHours} hours</div>
                              <div className="text-rose-400 font-bold mt-1.5 flex items-center gap-1">
                                <span>🚫</span> {hoursStatus.over} hours over max
                              </div>
                              <div className="text-[10px] text-slate-500 border-t border-slate-700/50 mt-2 pt-1 flex items-center justify-between">
                                <span>From 12a Mon - 11:59p Sun</span>
                                <span className="text-slate-400 font-bold">❓</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {filteredDays.map(day => {
                      const dayShifts = schedules.filter(s => s.date === day.dateStr && s.crewId === member.id);
                      const isSelectedDay = selectedTourDate === day.dateStr;
                      return (
                        <td
                          key={day.dateStr}
                          className={`p-2 border-r border-white/15 align-top relative min-h-[85px] hover:bg-white/[0.02] transition-colors cursor-pointer ${
                            isSelectedDay ? 'bg-amber-500/[0.03]' : ''
                          }`}
                          onDragOver={(e) => {
                            e.preventDefault();
                            if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
                          }}
                          onDrop={(e) => handleDropOnCell(e, day.dateStr, member.id)}
                          onClick={() => handleCellClick(day.dateStr, member.id, member.role || 'SERVER')}
                        >
                          <div className="flex flex-col gap-1.5">
                            {dayShifts.map(shift => renderShiftCard(shift))}
                          </div>
                          {dayShifts.length > 0 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCellClick(day.dateStr, member.id, member.role || 'SERVER');
                              }}
                              className="mt-1 w-full py-1 flex items-center justify-center gap-1 text-[9px] font-bold text-white/25 hover:text-white/60 bg-transparent hover:bg-white/[0.03] border border-dashed border-white/15 hover:border-white/35 rounded transition-all cursor-pointer"
                            >
                              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                              ADD
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

              {/* Collapse/Expand All toggle */}
              {filteredCrewMembers.length > 3 && (
                <tr className="border-b border-white/15">
                  <td colSpan={filteredDays.length + 1} className="p-0">
                    <button
                      type="button"
                      onClick={() => {
                        const allIds = filteredCrewMembers.map(m => m.id);
                        const allCollapsed = allIds.every(id => collapsedCrewIds.includes(id));
                        setCollapsedCrewIds(allCollapsed ? [] : allIds);
                      }}
                      className="w-full px-4 py-1.5 flex items-center gap-2 text-left border-none bg-transparent hover:bg-white/[0.02] transition-colors cursor-pointer group"
                    >
                      <span className="text-[9px] font-bold text-white/15 group-hover:text-white/40 uppercase tracking-wider transition-colors">
                        {filteredCrewMembers.every(m => collapsedCrewIds.includes(m.id)) ? '▸ Expand All' : '▾ Collapse All'}
                      </span>
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      );
    };

    const renderListBoard = () => {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3 select-none">
          {filteredDays.map(day => {
            const dayShifts = scheduleCrewFilter ? schedules.filter(s => s.date === day.dateStr && (s.crewId === scheduleCrewFilter || s.crewId === 'openshifts')) : schedules.filter(s => s.date === day.dateStr);
            const sortedShifts = [...dayShifts].sort((a, b) => a.startHour - b.startHour);
            const isHovered = activeDropDay === day.dateStr && draggedCrewMemberId;
            
            return (
              <div 
                key={day.dateStr}
                className={`rounded-xl border p-2.5 bg-black/40 flex flex-col min-h-[350px] transition-all shadow-sm ${
                  isHovered ? 'bg-amber-500/5 border-amber-500/30' : 'border-white/5'
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer) {
                    e.dataTransfer.dropEffect = "move";
                  }
                  setActiveDropDay(day.dateStr);
                }}
                onDragLeave={() => {
                  if (activeDropDay === day.dateStr) {
                    setActiveDropDay(null);
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  
                  setDraggedShiftId(null);
                  draggedShiftIdRef.current = null;
                  
                  const dragData = e.dataTransfer.getData("text/plain");
                  if (dragData.startsWith("shift:")) {
                    const shiftId = dragData.split(":")[1];
                    setSchedules(current => {
                      const updated = current.map(s => {
                        if (s.id === shiftId) {
                          return { ...s, date: day.dateStr };
                        }
                        return s;
                      });
                      localStorage.setItem('7h_crew_schedules', JSON.stringify(updated));
                      window.dispatchEvent(new Event('storage'));
                      fetch("/api/crew/calendar", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(updated)
                      }).catch(err => console.error("Failed to sync schedules:", err));
                      return updated;
                    });
                  }
                }}
              >
                <div className="text-center pb-2 border-b border-white/5 mb-2 flex flex-col items-center">
                  <span className="text-[9px] uppercase font-bold tracking-widest text-white/30 block">{day.dayName}</span>
                  <span className="text-xs font-bold text-white/70 block mt-0.5">{day.monthName} {day.dayOfMonth}</span>
                  {(() => {
                    const dayShow = getDayShow(day.dateStr);
                    if (!dayShow) return null;
                    return (
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedShowCrewDate(day.dateStr);
                        }}
                        className="mt-1 w-full text-[8.5px] font-black uppercase text-amber-400 hover:text-white bg-amber-500/10 hover:bg-amber-500/30 border border-amber-500/20 hover:border-amber-500/40 px-1.5 py-0.5 rounded truncate max-w-full cursor-pointer transition-all flex items-center justify-center gap-1"
                        title={`Click to view crew working at ${dayShow.venue || dayShow.venue_name}`}
                      >
                        🎸 {dayShow.venue || dayShow.venue_name}
                      </button>
                    );
                  })()}
                </div>

                <div className="flex-1 flex flex-col gap-2">
                  {sortedShifts.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center border border-dashed border-white/5 rounded-lg p-4 bg-black/20">
                      <span className="text-[10px] text-white/30 italic font-medium">Empty</span>
                    </div>
                  ) : (
                    sortedShifts.map(shift => renderShiftCard(shift, true))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      );
    };

    const renderTimelineGrid = () => {
      const hoursAxis = [8, 10, 12, 14, 16, 18, 20, 22, 24];
      return (
        <div className="flex flex-col bg-[#0f0f13] border border-white/5 rounded-xl p-4 shadow-2xl select-none">
          <div className="flex select-none">
            <div className="w-14 shrink-0" />
            <div className="flex-1 grid grid-cols-7 gap-2 text-center pb-2 border-b border-white/10 mb-2">
              {filteredDays.map((day) => {
                const count = schedules.filter(s => s.date === day.dateStr).length;
                return (
                  <div key={day.dateStr} className="min-w-0 flex flex-col items-center justify-start">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-white/30">{day.dayName}</p>
                    <p className="text-xs font-bold text-white/70 mt-0.5">{day.monthName} {day.dayOfMonth}</p>
                    {(() => {
                      const dayShow = getDayShow(day.dateStr);
                      if (!dayShow) return null;
                      return (
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedShowCrewDate(day.dateStr);
                          }}
                          className="mt-1 w-full text-[7.5px] font-black uppercase text-amber-400 hover:text-white bg-amber-500/10 hover:bg-amber-500/30 border border-amber-500/20 hover:border-amber-500/40 px-1 py-0.2 rounded truncate max-w-full cursor-pointer transition-all flex items-center justify-center gap-1 text-center"
                          title={`Click to view crew working at ${dayShow.venue || dayShow.venue_name}`}
                        >
                          🎸 {dayShow.venue || dayShow.venue_name}
                        </button>
                      );
                    })()}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex relative">
            <div className="w-14 shrink-0 h-[480px] relative flex flex-col justify-between text-[9px] font-bold text-white/30 pr-2 pt-0.5 select-none z-10 pointer-events-none">
              {hoursAxis.map((h) => (
                <div key={h} className="h-0 flex items-center justify-end leading-none">
                  {formatHour(h)}
                </div>
              ))}
            </div>

            <div className="flex-1 h-[480px] relative grid grid-cols-7 gap-2 bg-black/20 border border-white/5 rounded-xl overflow-hidden p-0">
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                {Array.from({ length: 17 }).map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`w-full h-0 border-b ${
                      idx % 2 === 0 
                        ? 'border-white/10 border-solid' 
                        : 'border-white/5 border-dashed'
                    }`} 
                  />
                ))}
              </div>

              {filteredDays.map((day) => {
                const dayShifts = schedules.filter(s => s.date === day.dateStr && s.crewId !== 'openshifts');
                return (
                  <div
                    key={day.dateStr}
                    className="h-full relative rounded-lg overflow-y-hidden"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const dragData = e.dataTransfer.getData("text/plain");
                      if (dragData.startsWith("shift:")) {
                        const shiftId = dragData.split(":")[1];
                        setSchedules(current => {
                          const updated = current.map(s => {
                            if (s.id === shiftId) {
                              return { ...s, date: day.dateStr };
                            }
                            return s;
                          });
                          localStorage.setItem('7h_crew_schedules', JSON.stringify(updated));
                          window.dispatchEvent(new Event('storage'));
                          return updated;
                        });
                      }
                    }}
                  >
                    {dayShifts.map(shift => {
                      const topPct = ((shift.startHour - 8) / 16) * 100;
                      const heightPct = ((shift.endHour - shift.startHour) / 16) * 100;
                      const roleStyle = getRoleStyle(shift.role);
                      return (
                        <div
                          key={shift.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditShiftClick(shift);
                          }}
                          style={{
                            position: 'absolute',
                            top: `${topPct}%`,
                            height: `${heightPct}%`,
                            backgroundColor: roleStyle.bg,
                            left: '4px',
                            right: '4px',
                          }}
                          className={`wiw-card text-white p-1 rounded-md text-[9px] font-bold overflow-hidden cursor-pointer shadow-sm ${
                            shift.isDraft ? 'wiw-striped' : ''
                          }`}
                        >
                          <div className="truncate">{shift.crewName}</div>
                          <div className="opacity-80 text-[8px]">{formatTimeStringWIW(shift.startHour, shift.endHour)}</div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    };

    return (
      <section className="bg-[#0f0f13] border border-white/5 rounded-2xl overflow-hidden shadow-2xl mt-8">
        <style>{`
          .wiw-scheduler-container {
            background-color: #0f0f13;
            color: #ffffff;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
          .wiw-sticky-header {
            position: sticky;
            top: 0;
            z-index: 30;
            background-color: #0f0f13 !important;
          }
          .wiw-sticky-col {
            position: sticky;
            left: 0;
            z-index: 20;
            background-color: #0f0f13 !important;
          }
          .wiw-sticky-corner {
            position: sticky;
            top: 0;
            left: 0;
            z-index: 40;
            background-color: #0f0f13 !important;
          }
          tr:hover .wiw-sticky-col {
            background-color: #16161f !important;
          }
          .wiw-card {
            transition: all 0.15s ease-in-out;
            position: relative;
          }
          .wiw-card:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.15), 0 2px 4px -1px rgba(0, 0, 0, 0.08);
          }
          .wiw-striped {
            background-image: repeating-linear-gradient(
              -45deg,
              rgba(255, 255, 255, 0.15),
              rgba(255, 255, 255, 0.15) 8px,
              transparent 8px,
              transparent 16px
            ) !important;
          }
          .wiw-tooltip-container {
            position: relative;
          }
          .wiw-tooltip {
            visibility: hidden;
            position: absolute;
            z-index: 100;
            bottom: 125%;
            left: 20px;
            opacity: 0;
            transition: opacity 0.15s ease, transform 0.15s ease;
            transform: translateY(5px);
          }
          .wiw-tooltip-container:hover .wiw-tooltip {
            visibility: visible;
            opacity: 1;
            transform: translateY(0);
          }
          .info-tooltip-container {
            position: relative;
            display: inline-flex;
            align-items: center;
          }
          .info-tooltip {
            visibility: hidden;
            position: absolute;
            z-index: 101;
            bottom: 130%;
            left: 50%;
            transform: translateX(-50%) translateY(5px);
            opacity: 0;
            transition: opacity 0.15s ease, transform 0.15s ease;
            white-space: nowrap;
          }
          .info-tooltip-container:hover .info-tooltip {
            visibility: visible;
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        `}</style>

        {/* Section Header */}
        <div onClick={() => toggleSection('crewschedule')} className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20 cursor-pointer select-none hover:bg-black/30 transition-colors text-white">
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <div className="drag-handle cursor-grab active:cursor-grabbing p-1.5 hover:bg-white/5 rounded text-white/20 hover:text-white/50 transition-all shrink-0 mr-1" title="Drag to reorder section">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>
            </div>
            <h3 onClick={() => toggleSection('crewschedule')} className="cursor-pointer text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <span>📅</span> Crew Work Schedule Calendar
            </h3>
          </div>
          <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
            <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest bg-white/5 px-2.5 py-1 rounded">Roster Schedule</span>
            <div className={"w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center transition-transform duration-300 " + (isSectionOpen('crewschedule') ? 'rotate-0' : '-rotate-90')}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40"><path d="M2 4l4 4 4-4" /></svg>
            </div>
          </div>
        </div>

        <div style={{ display: isSectionOpen('crewschedule') ? undefined : 'none' }}>
          <div className="wiw-scheduler-container">
            
            {/* Header controls (Date range, prev/next, today, action icons) */}
            <div className="bg-black/40 border-b border-white/5 p-4 flex flex-col lg:flex-row items-center justify-between gap-4 select-none text-white">
              {/* Left: Date Range & Nav */}
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl font-bold text-white tracking-tight mr-2 min-w-[180px]">
                  {getWeekRangeLabel(currentWeekStart)}
                </h2>
                <div className="flex items-center border border-white/10 bg-black/40 rounded-lg shadow-sm overflow-hidden">
                  <button
                    type="button"
                    onClick={handlePrevWeek}
                    className="p-2 hover:bg-white/5 transition-colors border-r border-white/5 text-white/40 hover:text-white cursor-pointer border-none bg-transparent"
                    title="Previous Week"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      document.getElementById('wiw-date-picker')?.click();
                    }}
                    className="p-2 hover:bg-white/5 transition-colors border-r border-white/5 text-white/40 hover:text-white cursor-pointer border-none bg-transparent"
                    title="Choose Date"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  </button>
                  <input
                    type="date"
                    id="wiw-date-picker"
                    className="sr-only"
                    onChange={(e) => {
                      if (e.target.value) {
                        const chosen = new Date(e.target.value);
                        const day = chosen.getDay();
                        const diff = chosen.getDate() - day + (day === 0 ? -6 : 1);
                        setCurrentWeekStart(new Date(chosen.setDate(diff)));
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleNextWeek}
                    className="p-2 hover:bg-white/5 transition-colors text-white/40 hover:text-white cursor-pointer border-none bg-transparent"
                    title="Next Week"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleGoToToday}
                  className="px-3 py-1.5 border border-white/10 bg-black/40 hover:bg-white/5 text-xs font-bold text-white/70 hover:text-white rounded-lg shadow-sm transition-colors cursor-pointer border-solid"
                >
                  TODAY
                </button>

                <button
                  type="button"
                  onClick={handleGoToMonth}
                  className={`px-3 py-1.5 border text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer border-solid ${
                    calendarRange === 'month'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                      : 'border-white/10 bg-black/40 hover:bg-white/5 text-white/70 hover:text-white'
                  }`}
                >
                  MONTH
                </button>

                <div className="relative">
                  <select
                     value={(() => {
                       if (calendarRange === '4weeks') return '4weeks';
                       if (calendarRange === 'month') return 'month';
                       
                       const time = currentWeekStart.getTime();
                       if (time === new Date(2023, 0, 23).getTime() || time === new Date(2025, 11, 29).getTime()) return '1';
                       if (time === new Date(2026, 0, 5).getTime()) return '2';
                       if (time === new Date(2026, 0, 12).getTime()) return '3';
                       if (time === new Date(2026, 0, 19).getTime()) return '4';
                       if (time === new Date(2026, 0, 26).getTime()) return '5';
                       return 'custom';
                     })()}
                     onChange={(e) => {
                       const val = e.target.value;
                       if (val === '4weeks') {
                         setCalendarRange('4weeks');
                         setCurrentWeekStart(new Date(2025, 11, 29));
                       } else if (val === 'month') {
                         setCalendarRange('month');
                         setCurrentWeekStart(new Date(2025, 11, 29));
                       } else {
                         setCalendarRange('week');
                         if (val === '1') {
                           const was2023 = currentWeekStart.getFullYear() === 2023;
                           setCurrentWeekStart(was2023 ? new Date(2023, 0, 23) : new Date(2025, 11, 29));
                         } else if (val === '2') {
                           setCurrentWeekStart(new Date(2026, 0, 5));
                         } else if (val === '3') {
                           setCurrentWeekStart(new Date(2026, 0, 12));
                         } else if (val === '4') {
                           setCurrentWeekStart(new Date(2026, 0, 19));
                         } else if (val === '5') {
                           setCurrentWeekStart(new Date(2026, 0, 26));
                         }
                       }
                     }}
                     className="appearance-none pr-8 pl-3 py-1.5 border border-white/10 bg-black/40 hover:bg-white/5 text-xs font-bold text-white/70 hover:text-white rounded-lg shadow-sm transition-colors cursor-pointer outline-none border-solid min-w-[95px]"
                   >
                     <option value="1">Week 1</option>
                     <option value="2">Week 2</option>
                     <option value="3">Week 3</option>
                     <option value="4">Week 4</option>
                     <option value="5">Week 5</option>
                     <option value="4weeks">Weeks 1-4</option>
                     <option value="month">Full Month</option>
                     <option value="custom" disabled hidden>Custom</option>
                   </select>
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-white/30">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                  </div>
                </div>

                {/* 🎸 Tour Dates Quick-Jump */}
                <div className="relative" data-tour-dropdown>
                  <button
                    type="button"
                    onClick={() => setShowTourDropdown(prev => !prev)}
                    className={`px-3 py-1.5 border text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer border-solid flex items-center gap-1.5 ${
                      showTourDropdown 
                        ? 'border-amber-500/40 bg-amber-500/10 text-amber-400' 
                        : 'border-white/10 bg-black/40 hover:bg-white/5 text-white/70 hover:text-white'
                    }`}
                  >
                    🎸 SHOWS
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={`transition-transform ${showTourDropdown ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9" /></svg>
                  </button>
                  {showTourDropdown && (
                    <div className="absolute top-full left-0 mt-1 z-50 bg-[#1a1a22] border border-white/10 rounded-xl shadow-2xl min-w-[280px] max-h-[320px] overflow-y-auto py-1">
                      {tourDates.length === 0 ? (
                        <div className="px-4 py-3 text-[11px] text-white/30 italic">No tour dates synced yet</div>
                      ) : (
                        [...tourDates]
                          .sort((a, b) => (a.date || '').localeCompare(b.date || ''))
                          .map((show, idx) => {
                            const showDate = show.date ? new Date(show.date + 'T12:00:00') : null;
                            const dateLabel = showDate
                              ? showDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })
                              : 'Unknown';
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  if (show.date) {
                                    const chosen = new Date(show.date + 'T12:00:00');
                                    const day = chosen.getDay();
                                    const diff = chosen.getDate() - day + (day === 0 ? -6 : 1);
                                    setCurrentWeekStart(new Date(chosen.getFullYear(), chosen.getMonth(), diff));
                                  }
                                  setShowTourDropdown(false);
                                }}
                                className="w-full text-left px-4 py-2.5 hover:bg-white/5 flex items-center gap-3 border-none bg-transparent cursor-pointer transition-colors group"
                              >
                                <span className="text-[10px] font-black text-amber-400/70 group-hover:text-amber-400 uppercase tracking-wider min-w-[80px]">{dateLabel}</span>
                                <span className="text-xs font-bold text-white/70 group-hover:text-white truncate">{show.venue || show.venue_name}</span>
                                {show.city && <span className="text-[10px] text-white/30 ml-auto shrink-0">{show.city}</span>}
                              </button>
                            );
                          })
                      )}
                    </div>
                  )}
                </div>

                {/* Shows Only Toggle */}
                <button
                  type="button"
                  onClick={() => setShowTourDatesOnly(prev => !prev)}
                  className={`px-3 py-1.5 border text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer border-solid flex items-center gap-1.5 ${
                    showTourDatesOnly 
                      ? 'border-amber-500/40 bg-amber-500/15 text-amber-400' 
                      : 'border-white/10 bg-black/40 hover:bg-white/5 text-white/70 hover:text-white'
                  }`}
                  title="Show only days with tour shows"
                >
                  {showTourDatesOnly ? '🎸 SHOWS ONLY' : 'ALL DAYS'}
                </button>

                {/* Crew Member Filter */}
                <div className="relative">
                  <select
                    value={scheduleCrewFilter}
                    onChange={(e) => setScheduleCrewFilter(e.target.value)}
                    className="appearance-none pr-8 pl-3 py-1.5 border border-white/10 bg-black/40 hover:bg-white/5 text-xs font-bold text-white/70 hover:text-white rounded-lg shadow-sm transition-colors cursor-pointer outline-none border-solid min-w-[140px]"
                  >
                    <option value="">👥 All Crew</option>
                    {crewMembers.filter(m => m.id !== 'openshifts').map(member => (
                      <option key={member.id} value={member.id}>{member.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-white/30">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                  </div>
                </div>

                {/* Tour Date Picker */}
                <div className="relative">
                  <select
                    value={selectedTourDate || ''}
                    onChange={(e) => {
                      const chosenDate = e.target.value;
                      if (!chosenDate) {
                        setSelectedTourDate(null);
                        return;
                      }
                      setSelectedTourDate(chosenDate);
                      // Jump to that week
                      const chosen = new Date(chosenDate + 'T12:00:00');
                      const day = chosen.getDay();
                      const diff = chosen.getDate() - day + (day === 0 ? -6 : 1);
                      setCurrentWeekStart(new Date(chosen.getFullYear(), chosen.getMonth(), diff));
                    }}
                    className="appearance-none pr-8 pl-3 py-1.5 border border-white/10 bg-black/40 hover:bg-white/5 text-xs font-bold text-white/70 hover:text-white rounded-lg shadow-sm transition-colors cursor-pointer outline-none border-solid min-w-[180px]"
                  >
                    <option value="">📅 All Tour Dates</option>
                    {[...tourDates]
                      .sort((a, b) => (a.date || '').localeCompare(b.date || ''))
                      .map((show, idx) => {
                        const d = show.date ? new Date(show.date + 'T12:00:00') : null;
                        const label = d
                          ? `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — ${show.venue || show.venue_name || ''}`
                          : show.venue || show.venue_name || '';
                        return (
                          <option key={idx} value={show.date || ''}>{label}</option>
                        );
                      })}
                  </select>
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-white/30">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                  </div>
                </div>
              </div>

              {/* View and actions */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center border border-white/10 bg-black/40 rounded-lg shadow-sm p-0.5 mr-2">
                  <button
                    type="button"
                    onClick={() => setCalendarView('timeline')}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors cursor-pointer border-none ${
                      calendarView === 'timeline'
                        ? 'bg-white/10 text-white'
                        : 'text-white/40 hover:text-white bg-transparent'
                    }`}
                  >
                    Grid
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalendarView('roster')}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors cursor-pointer border-none ${
                      calendarView === 'roster'
                        ? 'bg-white/10 text-white'
                        : 'text-white/40 hover:text-white bg-transparent'
                    }`}
                  >
                    Roster Board
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalendarView('list')}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors cursor-pointer border-none ${
                      calendarView === 'list'
                        ? 'bg-white/10 text-white'
                        : 'text-white/40 hover:text-white bg-transparent'
                    }`}
                  >
                    Daily Lists
                  </button>
                </div>

                <button type="button" className="p-2 border border-white/10 bg-black/40 hover:bg-white/5 rounded-lg shadow-sm text-white/40 hover:text-white cursor-pointer flex items-center justify-center border-solid">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707.707M12 5a7 7 0 1 0 0 14 7 7 0 0 0 0-14z"/></svg>
                </button>
                <button type="button" className="p-2 border border-white/10 bg-black/40 hover:bg-white/5 rounded-lg shadow-sm text-white/40 hover:text-white cursor-pointer flex items-center justify-center border-solid">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                </button>
                <button type="button" className="p-2 border border-white/10 bg-black/40 hover:bg-white/5 rounded-lg shadow-sm text-white/40 hover:text-white cursor-pointer flex items-center justify-center border-solid">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                </button>
                <button type="button" className="p-2 border border-white/10 bg-black/40 hover:bg-white/5 rounded-lg shadow-sm text-white/40 hover:text-white cursor-pointer flex items-center justify-center border-solid">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                </button>
                <button type="button" className="p-2 border border-white/10 bg-black/40 hover:bg-white/5 rounded-lg shadow-sm text-white/40 hover:text-white cursor-pointer flex items-center justify-center border-solid">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                </button>
              </div>
            </div>

            {/* Grid Body + Sidebar */}
            <div className="flex gap-0">
              {/* Main Schedule Grid */}
              <div className="flex-1 p-4 bg-black/10 min-w-0">
                {calendarView === 'timeline' && renderTimelineGrid()}
                {calendarView === 'roster' && renderRosterBoard()}
                {calendarView === 'list' && renderListBoard()}
              </div>

              {/* Right Sidebar: Tour Dates & Crew */}
              <div className="w-[280px] shrink-0 border-l border-white/15 bg-black/30 overflow-y-auto max-h-[calc(100vh-100px)] hidden xl:block sticky top-6 z-20">
                
                {/* Tour Dates Section */}
                <div className="border-b border-white/5">
                  <div className="px-3 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px]">🎸</span>
                      <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Tour Dates</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {selectedTourDate && (
                        <button
                          type="button"
                          onClick={() => setSelectedTourDate(null)}
                          className="text-[9px] font-bold text-amber-400/70 hover:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded cursor-pointer border-none transition-colors"
                        >
                          SHOW ALL ✕
                        </button>
                      )}
                      <span className="text-[9px] font-bold text-white/20 bg-white/5 px-1.5 py-0.5 rounded">{tourDates.length}</span>
                    </div>
                  </div>
                  <div className="px-2 pb-2 flex flex-col gap-0.5 max-h-[calc(100vh-150px)] overflow-y-auto">
                    {tourDates.length === 0 ? (
                      <div className="px-2 py-3 text-[10px] text-white/20 italic text-center">No tour dates synced</div>
                    ) : (
                      [...tourDates]
                        .sort((a, b) => (a.date || '').localeCompare(b.date || ''))
                        .map((show, idx) => {
                          const showDate = show.date ? new Date(show.date + 'T12:00:00') : null;
                          const dateLabel = showDate
                            ? showDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                            : '—';
                          const dayLabel = showDate
                            ? showDate.toLocaleDateString('en-US', { weekday: 'short' })
                            : '';
                          
                          // Check if this date is currently selected
                          const isSelected = selectedTourDate === show.date;
                          // Check if this show's week is currently active
                          const isActiveWeek = next7Days.some(d => d.dateStr === show.date);
                          // Check how many shifts exist for this show date
                          const shiftCount = schedules.filter(s => s.date === show.date).length;
                          
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                if (show.date) {
                                  if (isSelected) {
                                    // Deselect — show all days again
                                    setSelectedTourDate(null);
                                  } else {
                                    // Select this single date and jump to its week
                                    setSelectedTourDate(show.date);
                                    const chosen = new Date(show.date + 'T12:00:00');
                                    const day = chosen.getDay();
                                    const diff = chosen.getDate() - day + (day === 0 ? -6 : 1);
                                    setCurrentWeekStart(new Date(chosen.getFullYear(), chosen.getMonth(), diff));
                                  }
                                }
                              }}
                              className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center gap-2 border-none cursor-pointer transition-all group ${
                                isSelected
                                  ? 'bg-amber-500/15 ring-1 ring-amber-500/30' 
                                  : isActiveWeek
                                    ? 'bg-white/[0.04]'
                                    : 'bg-transparent hover:bg-white/[0.03]'
                              }`}
                            >
                              <div className="flex flex-col items-center min-w-[36px]">
                                <span className="text-[8px] font-bold text-white/35 uppercase">{dayLabel}</span>
                                <span className={`text-[11px] font-black ${isSelected ? 'text-amber-400' : isActiveWeek ? 'text-white/60' : 'text-white/40'}`}>{dateLabel}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-[10px] font-bold truncate ${isSelected ? 'text-white' : isActiveWeek ? 'text-white/80' : 'text-white/60'}`}>
                                  {show.venue || show.venue_name}
                                </p>
                                {show.city && (
                                  <p className="text-[9px] text-white/25 truncate">{show.city}{show.state ? `, ${show.state}` : ''}</p>
                                )}
                              </div>
                              {shiftCount > 0 && (
                                <span className="text-[8px] font-black bg-emerald-500/15 text-emerald-400/70 px-1.5 py-0.5 rounded shrink-0">
                                  {shiftCount}
                                </span>
                              )}
                            </button>
                          );
                        })
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Crew Hours Leaderboard */}
            <div className="bg-black/30 border-t border-white/5">
              <button
                type="button"
                onClick={() => setShowLeaderboard(prev => !prev)}
                className="w-full px-4 py-2.5 flex items-center justify-between cursor-pointer border-none bg-transparent hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs">🏆</span>
                  <span className="text-[11px] font-bold text-white/60 uppercase tracking-wider">Crew Hours Leaderboard</span>
                </div>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={`text-white/30 transition-transform ${showLeaderboard ? '' : '-rotate-90'}`}><polyline points="6 9 12 15 18 9" /></svg>
              </button>
              
              {showLeaderboard && (
                <div className="px-4 pb-4">
                  {/* Period Tabs */}
                  <div className="flex items-center gap-1 mb-3">
                    {(['day', 'week', 'month', 'year'] as const).map(period => (
                      <button
                        key={period}
                        type="button"
                        onClick={() => setLeaderboardPeriod(period)}
                        className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border-none cursor-pointer transition-all ${
                          leaderboardPeriod === period
                            ? 'bg-amber-500/15 text-amber-400'
                            : 'bg-transparent text-white/30 hover:text-white/60 hover:bg-white/5'
                        }`}
                      >
                        {period}
                      </button>
                    ))}
                  </div>

                  {/* Leaderboard Bars */}
                  {(() => {
                    const today = new Date();
                    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                    
                    const getHoursForPeriod = (crewId: string) => {
                      let relevantShifts = schedules.filter(s => s.crewId === crewId && !s.isTimeOff);
                      
                      if (leaderboardPeriod === 'day') {
                        const activeDay = next7Days[0]?.dateStr || todayStr;
                        relevantShifts = relevantShifts.filter(s => s.date === activeDay);
                      } else if (leaderboardPeriod === 'week') {
                        const weekDates = next7Days.map(d => d.dateStr);
                        relevantShifts = relevantShifts.filter(s => weekDates.includes(s.date));
                      } else if (leaderboardPeriod === 'month') {
                        const year = currentWeekStart.getFullYear();
                        const month = String(currentWeekStart.getMonth() + 1).padStart(2, '0');
                        const prefix = `${year}-${month}-`;
                        relevantShifts = relevantShifts.filter(s => s.date.startsWith(prefix));
                      } else {
                        const year = String(currentWeekStart.getFullYear());
                        relevantShifts = relevantShifts.filter(s => s.date.startsWith(year));
                      }
                      
                      return relevantShifts.reduce((sum, s) => {
                        const dur = s.endHour - s.startHour;
                        return sum + (isNaN(dur) ? 0 : dur);
                      }, 0);
                    };
                    
                    const rankings = crewMembers
                      .filter(m => m.id !== 'openshifts')
                      .map(m => ({ ...m, hours: getHoursForPeriod(m.id) }))
                      .filter(m => m.hours > 0)
                      .sort((a, b) => b.hours - a.hours);
                    
                    const maxHours = rankings.length > 0 ? rankings[0].hours : 1;
                    
                    if (rankings.length === 0) {
                      return (
                        <div className="text-center py-3 text-[11px] text-white/20 italic">No hours logged for this period</div>
                      );
                    }
                    
                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {rankings.slice(0, 9).map((member, idx) => {
                          const pct = Math.round((member.hours / maxHours) * 100);
                          const medalEmoji = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '';
                          const barColor = idx === 0 ? 'bg-amber-500/30' : idx === 1 ? 'bg-slate-400/20' : idx === 2 ? 'bg-orange-700/20' : 'bg-white/5';
                          
                          return (
                            <div key={member.id} className="flex items-center gap-2.5 bg-black/30 rounded-lg px-3 py-2 border border-white/5 hover:border-white/10 transition-colors">
                              {/* Rank */}
                              <span className="text-[10px] font-black text-white/20 w-4 shrink-0 text-right">
                                {medalEmoji || `${idx + 1}`}
                              </span>
                              
                              {/* Avatar */}
                              {(() => {
                                const hasImage = member.avatar && (member.avatar.startsWith('http') || member.avatar.startsWith('/'));
                                if (hasImage) {
                                  return <img src={member.avatar} alt="" className="w-6 h-6 rounded-full object-cover shrink-0" />;
                                }
                                const initials = member.initials || member.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
                                const color = member.color || getAvatarColor(member.name);
                                return (
                                  <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-[8px] text-white shrink-0" style={{ backgroundColor: color }}>
                                    {initials}
                                  </div>
                                );
                              })()}
                              
                              {/* Name + Bar */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-0.5">
                                  <span className="text-[10px] font-bold text-white/70 truncate">{member.name}</span>
                                  <span className="text-[10px] font-black text-amber-400/80 ml-2 shrink-0">{member.hours.toFixed(1)}h</span>
                                </div>
                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                  <div className={`h-full rounded-full ${barColor} transition-all`} style={{ width: `${pct}%` }} />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Shift Config Modal / Side Drawer */}
            {activeDropDay && draggedCrewMemberId && (() => {
              const showFormDetails = !!editingShiftId || Object.values(selectedCrewAssignments).some(a => a.active);
              return (
                <div className="fixed inset-0 bg-black/30 z-50 flex justify-end animate-[fadeIn_0.2s_ease]">
                {/* Backdrop Click Overlay */}
                <div 
                  className="absolute inset-0 cursor-default" 
                  onClick={() => {
                    setActiveDropDay(null);
                    setDraggedCrewMemberId(null);
                    setEditingShiftId(null);
                  }}
                />

                <div className="relative bg-[#111116] border-l border-white/10 w-full max-w-md h-full shadow-2xl flex flex-col justify-between animate-[slideInRight_0.3s_cubic-bezier(0.16,1,0.3,1)]">
                  
                  {/* Modal Header */}
                  <div className="p-5 border-b border-white/5 bg-[#181820] flex items-center justify-between shrink-0">
                    <div>
                      <h3 className="text-sm font-black italic tracking-wide text-white">
                        {editingShiftId ? 'Edit Work Shift' : 'Configure Work Shift'}
                      </h3>
                      <p className="text-[0.65rem] text-white/40 uppercase tracking-widest font-bold mt-1">
                        Assigning {(() => {
                          const found = crewMembers.find(c => c.id === draggedCrewMemberId);
                          return found ? found.name : draggedCrewMemberId;
                        })()} for {activeDropDay}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setActiveDropDay(null);
                        setDraggedCrewMemberId(null);
                        setEditingShiftId(null);
                      }}
                      className="text-white/40 hover:text-white transition-colors cursor-pointer border-none bg-transparent text-sm"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Modal Form */}
                  <div className="p-5 flex-1 flex flex-col min-h-0 overflow-hidden space-y-4">
                    
                    {/* Tour Date Show Card Info */}
                    {(() => {
                      const activeShow = activeDropDay ? getDayShow(activeDropDay) : null;
                      if (!activeShow) return null;
                      return (
                        <div className="shrink-0 bg-amber-500/5 border border-amber-500/20 rounded-lg px-2.5 h-[30px] flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-[11px] shrink-0">🎸</span>
                            <span className="text-[10px] font-black text-white truncate">{activeShow.venue}</span>
                            <span className="text-[9px] text-white/40 truncate shrink-0">({activeShow.city}{activeShow.state ? `, ${activeShow.state}` : ''})</span>
                            {activeShow.notes && (
                              <span className="text-[9px] text-amber-300/50 italic truncate ml-1.5" title={activeShow.notes}>
                                Note: {activeShow.notes}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Crew Selector Grid (Multi-Selection checklist used for both Create and Edit modes) */}
                    <div className="flex-1 min-h-0 flex flex-col">
                      <label className="text-[0.6rem] uppercase tracking-[0.15em] text-white/40 mb-2 block font-bold font-sans shrink-0">Select Crew Members Working That Day</label>
                      
                      {/* Search and Grouping Controls */}
                      <div className="shrink-0 mb-3 space-y-2">
                        <input
                          type="text"
                          value={drawerCrewSearch}
                          onChange={e => setDrawerCrewSearch(e.target.value)}
                          placeholder="🔍 Search crew members..."
                          className="w-full px-3 py-1.5 bg-black/40 border border-white/10 text-xs text-white placeholder-white/30 rounded-lg outline-none focus:border-amber-500/50 transition-colors font-bold font-sans"
                        />
                        
                        {Object.values(selectedCrewAssignments).some(a => a.active) && (
                          <div className="flex items-center gap-2 animate-[fadeIn_0.15s_ease]">
                            <span className="text-[9px] text-white/40 font-bold uppercase tracking-wider mr-1">Time Mode:</span>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedCrewAssignments(prev => {
                                  const updated = { ...prev };
                                  Object.keys(updated).forEach(id => {
                                    if (updated[id].active) {
                                      updated[id] = { ...updated[id], customized: false };
                                    }
                                  });
                                  return updated;
                                });
                              }}
                              className={`px-2 py-0.5 text-[9px] font-extrabold rounded transition-all cursor-pointer border ${
                                Object.entries(selectedCrewAssignments).filter(([_, a]) => a.active).every(([_, a]) => !a.customized)
                                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                                  : 'bg-black/20 border-white/10 text-white/60 hover:text-white'
                              }`}
                            >
                              🔗 Group Times
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedCrewAssignments(prev => {
                                  const updated = { ...prev };
                                  Object.keys(updated).forEach(id => {
                                    if (updated[id].active) {
                                      updated[id] = { ...updated[id], customized: true };
                                    }
                                  });
                                  return updated;
                                });
                              }}
                              className={`px-2 py-0.5 text-[9px] font-extrabold rounded transition-all cursor-pointer border ${
                                Object.entries(selectedCrewAssignments).filter(([_, a]) => a.active).every(([_, a]) => a.customized)
                                  ? 'bg-sky-500/10 border-sky-500/30 text-sky-400'
                                  : 'bg-black/20 border-white/10 text-white/60 hover:text-white'
                              }`}
                            >
                              ✏️ Set Separately
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2.5 pr-1 overflow-y-auto flex-1 min-h-0">
                        {crewMembers
                          .filter(m => m.id !== 'openshifts')
                          .filter(m => m.name.toLowerCase().includes(drawerCrewSearch.toLowerCase()))
                          .map((member) => {
                            const assignment = selectedCrewAssignments[member.id] || { active: false, customized: false, role: dropRole || 'SERVER', startHour: dropStartHour, endHour: dropEndHour };
                            return (
                              <div
                                key={member.id}
                                className={`p-3 rounded-xl border transition-all ${
                                  assignment.active
                                    ? 'bg-amber-500/5 border-amber-500/30'
                                    : 'bg-black/20 border-white/5 hover:border-white/10'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <label className="flex items-center gap-3 cursor-pointer select-none">
                                    <input
                                      type="checkbox"
                                      checked={assignment.active}
                                      onChange={(e) => {
                                        const checked = e.target.checked;
                                        setSelectedCrewAssignments(prev => ({
                                          ...prev,
                                          [member.id]: {
                                            active: checked,
                                            customized: false, // Collapse customization by default on check/uncheck
                                            role: assignment.role || dropRole || member.role || 'SERVER',
                                            startHour: assignment.startHour || dropStartHour || 12,
                                            endHour: assignment.endHour || dropEndHour || 17
                                          }
                                        }));
                                      }}
                                      className="rounded border-white/10 bg-black/40 text-amber-500 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5"
                                    />
                                    <div className="flex items-center gap-2">
                                      <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[9px] font-bold text-white uppercase overflow-hidden font-sans">
                                        {member.avatar ? (
                                          <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                                        ) : (
                                          member.initials || member.name[0]
                                        )}
                                      </div>
                                      <span className="text-xs font-bold text-white/95 font-sans">{member.name}</span>
                                    </div>
                                  </label>
                                  
                                  {assignment.active && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedCrewAssignments(prev => ({
                                          ...prev,
                                          [member.id]: {
                                            ...prev[member.id],
                                            customized: !assignment.customized
                                          }
                                        }));
                                      }}
                                      className="text-[10px] font-bold text-[var(--color-accent)] hover:text-white transition-colors bg-transparent border-none p-1 cursor-pointer font-sans"
                                    >
                                      {assignment.customized ? "Collapse" : "✏️ Customize"}
                                    </button>
                                  )}
                                </div>

                                {/* Sub-form for customized timing/role details */}
                                {assignment.active && assignment.customized && (
                                  <div className="mt-3 pt-3 border-t border-white/5 space-y-2.5 animate-[slideIn_0.15s_ease-out]">
                                    <div className="grid grid-cols-2 gap-2">
                                      <div>
                                        <span className="text-[0.55rem] font-bold text-white/40 block mb-1 uppercase tracking-wider">Start Time</span>
                                        <select
                                          value={assignment.startHour}
                                          onChange={(e) => {
                                            const sh = parseFloat(e.target.value);
                                            setSelectedCrewAssignments(prev => ({
                                              ...prev,
                                              [member.id]: {
                                                ...prev[member.id],
                                                startHour: sh,
                                                endHour: Math.max(sh + 1, prev[member.id].endHour)
                                              }
                                            }));
                                          }}
                                          className="w-full px-2 py-1 bg-black border border-white/10 text-[10px] text-white rounded outline-none font-bold cursor-pointer"
                                        >
                                          {generateTimeOptions().slice(0, -1).map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                          ))}
                                        </select>
                                      </div>
                                      <div>
                                        <span className="text-[0.55rem] font-bold text-white/40 block mb-1 uppercase tracking-wider">End Time</span>
                                        <select
                                          value={assignment.endHour}
                                          onChange={(e) => {
                                            const eh = parseFloat(e.target.value);
                                            setSelectedCrewAssignments(prev => ({
                                              ...prev,
                                              [member.id]: {
                                                ...prev[member.id],
                                                endHour: eh
                                              }
                                            }));
                                          }}
                                          className="w-full px-2 py-1 bg-black border border-white/10 text-[10px] text-white rounded outline-none font-bold cursor-pointer"
                                        >
                                          {generateTimeOptions().filter(opt => opt.value > assignment.startHour).map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                          ))}
                                        </select>
                                      </div>
                                    </div>

                                    <div>
                                      <span className="text-[0.55rem] font-bold text-white/40 block mb-1 uppercase tracking-wider">Specific Role / Duty</span>
                                      <input
                                        type="text"
                                        value={assignment.role}
                                        onChange={(e) => {
                                          const r = e.target.value;
                                          setSelectedCrewAssignments(prev => ({
                                            ...prev,
                                            [member.id]: {
                                              ...prev[member.id],
                                              role: r
                                            }
                                          }));
                                        }}
                                        placeholder="e.g. CAMERA, AUDIO MIX"
                                        className="w-full px-2 py-1 bg-black border border-white/10 text-[10px] text-white rounded outline-none font-bold uppercase tracking-wide font-sans"
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    </div>

                    {/* Form Fields block */}
                    <div className="space-y-4 shrink-0 mt-2 overflow-y-auto max-h-[45%] pr-1">
                      {showFormDetails && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[0.6rem] uppercase tracking-[0.15em] text-white/40 mb-1.5 block font-bold">Start Time</label>
                            <select
                              value={dropStartHour}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                setDropStartHour(val);
                                if (dropEndHour <= val) {
                                    setDropEndHour(Math.min(24, val + 1));
                                }
                              }}
                              className="w-full px-3 py-2 bg-black border border-white/10 text-xs text-white rounded-lg outline-none focus:border-amber-500/50 transition-colors font-bold cursor-pointer"
                            >
                              {generateTimeOptions().slice(0, -1).map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="text-[0.6rem] uppercase tracking-[0.15em] text-white/40 mb-1.5 block font-bold">End Time</label>
                            <select
                              value={dropEndHour}
                              onChange={(e) => setDropEndHour(parseFloat(e.target.value))}
                              className="w-full px-3 py-2 bg-black border border-white/10 text-xs text-white rounded-lg outline-none focus:border-amber-500/50 transition-colors font-bold cursor-pointer"
                            >
                              {generateTimeOptions().filter(opt => opt.value > dropStartHour).map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="relative" id="role-suggest-container">
                          <label className="text-[0.6rem] uppercase tracking-[0.15em] text-white/40 mb-1.5 block font-bold font-sans">Role / Duty</label>
                          <div className="relative">
                            <input
                              type="text"
                              value={dropRole}
                              onChange={e => {
                                setDropRole(e.target.value);
                                setIsFilteringRoles(true);
                                  setShowRoleDropdown(true);
                              }}
                              onFocus={() => {
                                setIsFilteringRoles(false);
                                setShowRoleDropdown(true);
                              }}
                              placeholder="e.g. Audio Mix"
                              className="w-full pl-3 pr-8 py-2 bg-black border border-white/10 text-xs text-white rounded-lg outline-none focus:border-amber-500/50 transition-colors font-bold uppercase tracking-wider font-sans"
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setIsFilteringRoles(false);
                                setShowRoleDropdown(prev => !prev);
                              }}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white cursor-pointer bg-transparent border-none p-0 flex items-center justify-center"
                            >
                              <svg 
                                width="14" 
                                height="14" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2.5" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                                className={`transition-transform duration-200 ${showRoleDropdown ? 'rotate-180' : ''}`}
                              >
                                <polyline points="6 9 12 15 18 9"/>
                              </svg>
                            </button>
                          </div>
                          
                          {showRoleDropdown && (() => {
                            const defaultPresets = ["CAMERA", "BAND EQUIPMENT", "UNLOADING", "SERVER", "CHEF", "LINE COOK", "MANAGER", "AUDIO MIX"];
                            const allRoles = customRoles.length > 0 ? customRoles : defaultPresets;
                            const filteredSuggestions = isFilteringRoles && dropRole.trim()
                              ? allRoles.filter(r => r.toLowerCase().includes(dropRole.toLowerCase()))
                              : allRoles;
                            
                            return (
                              <div className="absolute left-0 right-0 mt-1 bg-[#181820] border border-white/10 rounded-lg shadow-2xl z-30 max-h-48 overflow-y-auto font-sans text-xs">
                                {dropRole.trim() && !allRoles.includes(dropRole.trim().toUpperCase()) && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      saveCustomRole(dropRole.trim().toUpperCase());
                                      setDropRole(dropRole.trim().toUpperCase());
                                    }}
                                    className="w-full px-3 py-2 text-left hover:bg-amber-500/10 text-amber-400 font-extrabold border-b border-white/5 flex items-center justify-between cursor-pointer bg-transparent border-none"
                                  >
                                    <span>💾 Save "{dropRole.trim().toUpperCase()}"</span>
                                  </button>
                                )}
                                
                                {filteredSuggestions.length === 0 ? (
                                  <div className="p-3 text-white/30 text-center italic text-[11px]">No suggestions</div>
                                ) : (
                                  filteredSuggestions.map(role => {
                                    return (
                                      <div
                                        key={role}
                                        className="flex items-center justify-between hover:bg-white/5 text-white/80 hover:text-white px-3 py-1.5 cursor-pointer select-none"
                                        onClick={() => {
                                          setDropRole(role);
                                          setShowRoleDropdown(false);
                                        }}
                                      >
                                        <span className="font-bold tracking-wider">{role}</span>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            deleteCustomRole(role);
                                          }}
                                          className="text-white/40 hover:text-rose-400 transition-colors bg-transparent border-none p-1 cursor-pointer text-[10px]"
                                          title="Delete preset"
                                        >
                                          ✕
                                        </button>
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      </>
                    )}

                    <div>
                      <label className="text-[0.6rem] uppercase tracking-[0.15em] text-white/40 mb-1.5 block font-bold">Venue / Location</label>
                      <input
                        type="text"
                        value={dropLocation}
                        onChange={e => setDropLocation(e.target.value)}
                        placeholder="e.g. The Chicago Theatre"
                        className="w-full px-3 py-2 bg-black border border-white/10 text-xs text-white rounded-lg outline-none focus:border-amber-500/50 transition-colors font-bold"
                      />

                      {/* Tour Date Picker Dropdown */}
                      <div className="mt-2">
                        <label className="text-[0.6rem] uppercase tracking-[0.15em] text-white/40 mb-1.5 block font-bold">Pick Tour Date</label>
                        <div className="relative">
                          <select
                            value={activeDropDay || ''}
                            onChange={(e) => {
                              const chosenDate = e.target.value;
                              if (!chosenDate) return;
                              const show = tourDates.find(s => s.date === chosenDate);
                              // Set the shift date
                              setActiveDropDay(chosenDate);
                              // Auto-fill venue from tour date
                              if (show) {
                                const venueName = show.venue || show.venue_name || '';
                                const cityStr = show.city ? `${show.city}, ${show.state || 'IL'}` : '';
                                setDropLocation(cityStr ? `${venueName} at ${cityStr}` : venueName);
                              }
                              // Jump to that week
                              const chosen = new Date(chosenDate + 'T12:00:00');
                              const day = chosen.getDay();
                              const diff = chosen.getDate() - day + (day === 0 ? -6 : 1);
                              setCurrentWeekStart(new Date(chosen.getFullYear(), chosen.getMonth(), diff));
                            }}
                            className="w-full appearance-none pr-8 px-3 py-2 bg-black border border-white/10 text-xs text-white rounded-lg outline-none focus:border-amber-500/50 transition-colors font-bold cursor-pointer"
                          >
                            <option value="" disabled>— Select a tour show —</option>
                            {[...tourDates]
                              .sort((a, b) => (a.date || '').localeCompare(b.date || ''))
                              .map((show, idx) => {
                                const d = show.date ? new Date(show.date + 'T12:00:00') : null;
                                const label = d
                                  ? `${d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} — ${show.venue || show.venue_name}${show.city ? `, ${show.city}` : ''}`
                                  : show.venue || show.venue_name;
                                return (
                                  <option key={idx} value={show.date || ''}>{label}</option>
                                );
                              })}
                          </select>
                          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-amber-400/50">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9" /></svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-[0.6rem] uppercase tracking-[0.15em] text-white/40 mb-1.5 block font-bold">Shift Instructions / Notes</label>
                      <textarea
                        rows={3}
                        value={dropNotes}
                        onChange={e => setDropNotes(e.target.value)}
                        placeholder="e.g. Bring backup gear, report to backstage entrance"
                        className="w-full px-3 py-2 bg-black border border-white/10 text-xs text-white rounded-lg outline-none focus:border-amber-500/50 transition-colors font-bold resize-none"
                      />
                    </div>
                    </div>
                  </div>

                  {/* Drawer Footer */}
                  <div className="p-5 border-t border-white/5 bg-[#181820] space-y-2 shrink-0">
                    <button
                      onClick={addScheduleItem}
                      className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-[0.2em] rounded-lg shadow-[0_0_20px_rgba(245,158,11,0.25)] transition-all cursor-pointer border-none"
                    >
                      {editingShiftId ? 'Save Changes' : 'Confirm Schedule'}
                    </button>
                    
                    {editingShiftId && (
                      <button
                        onClick={() => {
                          deleteScheduleItem(editingShiftId);
                          setActiveDropDay(null);
                          setDraggedCrewMemberId(null);
                          setEditingShiftId(null);
                        }}
                        className="w-full py-2.5 bg-red-600/20 hover:bg-red-600 border border-red-500/30 text-red-200 hover:text-white font-black text-xs uppercase tracking-[0.2em] rounded-lg transition-all cursor-pointer"
                      >
                        Delete Shift
                      </button>
                    )}
                  </div>

                </div>
              </div>
              );
            })()}

            {/* 👥 Create Group Modal Pop-up */}
            {isCreateGroupModalOpen && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease]">
                <div 
                  className="bg-[#111116] border border-white/10 rounded-2xl w-full max-w-xl max-h-[85vh] shadow-2xl flex flex-col overflow-hidden animate-[scaleIn_0.25s_cubic-bezier(0.16,1,0.3,1)]"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Modal Header */}
                  <div className="p-5 border-b border-white/5 bg-[#181820] flex items-center justify-between shrink-0">
                    <div>
                      <h3 className="text-sm font-black italic tracking-wide text-white">Create New Crew Group</h3>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mt-1">Select members and customize their shift slots</p>
                    </div>
                    <button
                      onClick={() => {
                        setIsCreateGroupModalOpen(false);
                        setCreateGroupForDate(null);
                      }}
                      className="text-white/40 hover:text-white transition-colors cursor-pointer border-none bg-transparent text-sm"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Modal Form Content */}
                  <div className="p-5 flex-1 overflow-y-auto space-y-5 custom-scrollbar min-h-0">
                    
                    {/* Group Name input */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-wider text-white/50 font-extrabold">Group Name</label>
                      <input
                        type="text"
                        value={newGroupNameInput}
                        onChange={(e) => setNewGroupNameInput(e.target.value)}
                        placeholder="e.g. Weekend Tech Crew"
                        className="w-full px-3.5 py-2.5 bg-black border border-white/10 text-xs text-white rounded-lg outline-none focus:border-emerald-500/50 transition-colors font-bold"
                      />
                    </div>

                    {/* Member Pick list */}
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-wider text-white/50 font-extrabold block">Select Crew Members</label>
                      
                      <div className="border border-white/5 bg-black/20 rounded-xl divide-y divide-white/5 overflow-hidden">
                        {crewMembers.filter(m => m.id !== 'openshifts').map((m) => {
                          const setting = newGroupMemberSettings[m.id] || { active: false, role: m.role || 'SERVER', startHour: 17.0, endHour: 22.0 };
                          
                          return (
                            <div key={m.id} className="p-3 transition-colors hover:bg-white/[0.01]">
                              <div className="flex items-center justify-between gap-3">
                                {/* Left checkbox and avatar */}
                                <div className="flex items-center gap-3 min-w-0">
                                  <input
                                    type="checkbox"
                                    checked={setting.active}
                                    onChange={(e) => {
                                      const act = e.target.checked;
                                      setNewGroupMemberSettings(prev => ({
                                        ...prev,
                                        [m.id]: {
                                          ...prev[m.id],
                                          active: act
                                        }
                                      }));
                                    }}
                                    className="accent-emerald-500 w-4 h-4 cursor-pointer"
                                  />
                                  <CrewAvatar member={m} />
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-white/80 truncate">{m.name}</p>
                                    <span className="text-[9px] text-white/30 uppercase font-bold tracking-wider">{m.role || 'Crew'}</span>
                                  </div>
                                </div>

                                {/* Right: if active, show role and time slots */}
                                {setting.active && (
                                  <div className="flex items-center gap-2 animate-[fadeIn_0.15s_ease] shrink-0 font-sans">
                                    {/* Role */}
                                    <div className="flex flex-col gap-0.5">
                                      <span className="text-[8px] font-bold text-white/35 uppercase tracking-wider">Role</span>
                                      <input
                                        type="text"
                                        value={setting.role}
                                        onChange={(e) => {
                                          const r = e.target.value;
                                          setNewGroupMemberSettings(prev => ({
                                            ...prev,
                                            [m.id]: {
                                              ...prev[m.id],
                                              role: r
                                            }
                                          }));
                                        }}
                                        className="px-2 py-1 bg-black border border-white/10 text-[9px] text-white rounded outline-none font-bold uppercase w-[85px] tracking-wide"
                                      />
                                    </div>

                                    {/* Start Time */}
                                    <div className="flex flex-col gap-0.5">
                                      <span className="text-[8px] font-bold text-white/35 uppercase tracking-wider">Start</span>
                                      <select
                                        value={setting.startHour}
                                        onChange={(e) => {
                                          const h = parseFloat(e.target.value);
                                          setNewGroupMemberSettings(prev => ({
                                            ...prev,
                                            [m.id]: {
                                              ...prev[m.id],
                                              startHour: h,
                                              endHour: prev[m.id]?.endHour <= h ? Math.min(24, h + 1) : prev[m.id]?.endHour
                                            }
                                          }));
                                        }}
                                        className="px-1.5 py-1 bg-black border border-white/10 text-[9px] text-white rounded outline-none font-bold cursor-pointer"
                                      >
                                        {generateTimeOptions().slice(0, -1).map(opt => (
                                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                      </select>
                                    </div>

                                    {/* End Time */}
                                    <div className="flex flex-col gap-0.5">
                                      <span className="text-[8px] font-bold text-white/35 uppercase tracking-wider">End</span>
                                      <select
                                        value={setting.endHour}
                                        onChange={(e) => {
                                          const h = parseFloat(e.target.value);
                                          setNewGroupMemberSettings(prev => ({
                                            ...prev,
                                            [m.id]: {
                                              ...prev[m.id],
                                              endHour: h
                                            }
                                          }));
                                        }}
                                        className="px-1.5 py-1 bg-black border border-white/10 text-[9px] text-white rounded outline-none font-bold cursor-pointer"
                                      >
                                        {generateTimeOptions().filter(opt => opt.value > setting.startHour).map(opt => (
                                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="p-5 border-t border-white/5 bg-[#181820] flex items-center justify-between gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreateGroupModalOpen(false);
                        setCreateGroupForDate(null);
                      }}
                      className="px-4 py-2 border border-white/10 hover:bg-white/5 text-white/70 hover:text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    
                    <button
                      type="button"
                      disabled={!newGroupNameInput.trim() || !Object.values(newGroupMemberSettings).some(s => s.active)}
                      onClick={() => {
                        const activeMembers = Object.entries(newGroupMemberSettings).filter(([_, s]) => s.active);
                        const memberIds = activeMembers.map(([id]) => id);
                        const memberSettings: any = {};
                        activeMembers.forEach(([id, s]) => {
                          memberSettings[id] = {
                            startHour: s.startHour,
                            endHour: s.endHour,
                            role: s.role
                          };
                        });
                        
                        const newGroup = {
                          name: newGroupNameInput.trim(),
                          memberIds,
                          memberSettings
                        };
                        
                        setCrewGroups(current => {
                          const updated = [...current, newGroup];
                          localStorage.setItem('7h_crew_groups', JSON.stringify(updated));
                          return updated;
                        });

                        if (createGroupForDate) {
                          handleAddGroupToDay(createGroupForDate, newGroup);
                        }

                        setIsCreateGroupModalOpen(false);
                        setCreateGroupForDate(null);
                      }}
                      className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/20 disabled:text-white/30 text-black font-black text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer border-none shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                    >
                      Save Group
                    </button>
                  </div>
                </div>
              </div>
            )}

            {selectedShowCrewDate && (() => {
              const show = getDayShow(selectedShowCrewDate);
              if (!show) return null;
              
              const dayShifts = schedules.filter(s => s.date === selectedShowCrewDate);
              const filledShifts = dayShifts.filter(s => s.crewId !== 'openshifts');
              const openShifts = dayShifts.filter(s => s.crewId === 'openshifts');
              
              return (
                <div className="fixed inset-0 bg-black/50 z-50 flex justify-end animate-[fadeIn_0.2s_ease]">
                  {/* Backdrop Click Overlay */}
                  <div 
                    className="absolute inset-0 cursor-default" 
                    onClick={() => setSelectedShowCrewDate(null)}
                  />

                  <div className="relative bg-[#111116] border-l border-white/10 w-full max-w-md h-full shadow-2xl flex flex-col justify-between animate-[slideInRight_0.3s_cubic-bezier(0.16,1,0.3,1)]">
                    
                    {/* Header */}
                    <div className="p-5 border-b border-white/5 bg-[#181820] flex items-center justify-between shrink-0">
                      <div>
                        <h3 className="text-sm font-black italic tracking-wide text-white">
                          Show Crew Roster
                        </h3>
                        <p className="text-[0.65rem] text-amber-400 uppercase tracking-widest font-bold mt-1">
                          {new Date(selectedShowCrewDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} — {show.venue || show.venue_name}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedShowCrewDate(null)}
                        className="text-white/45 hover:text-white transition-colors cursor-pointer border-none bg-transparent text-sm"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-4 flex-1 overflow-y-auto">
                      {/* Show Stats Summary */}
                      <div className="grid grid-cols-3 gap-2 text-center bg-black/20 p-3 border border-white/5 rounded-xl">
                        <div>
                          <span className="text-[10px] text-white/40 block">Total Shift(s)</span>
                          <span className="text-sm font-black text-white">{dayShifts.length}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-white/40 block">Staff Scheduled</span>
                          <span className="text-sm font-black text-emerald-400">{filledShifts.length}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-white/40 block">Open Position(s)</span>
                          <span className="text-sm font-black text-amber-400">{openShifts.length}</span>
                        </div>
                      </div>

                      {/* Scheduled Crew Section */}
                      <div>
                        <h4 className="text-[10px] font-black uppercase text-white/40 tracking-wider mb-2.5">Scheduled Crew</h4>
                        {filledShifts.length === 0 ? (
                          <div className="text-center py-4 bg-white/[0.01] border border-dashed border-white/5 rounded-xl text-white/30 text-xs italic">
                            No crew members scheduled yet
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {filledShifts.map(shift => {
                              const member = crewMembers.find(c => c.id === shift.crewId);
                              const initials = member?.initials || shift.crewName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
                              const color = member?.color || getAvatarColor(shift.crewName);
                              
                              return (
                                <div key={shift.id} className="bg-black/20 border border-white/5 rounded-xl p-3 flex items-center justify-between gap-3 hover:border-white/10 transition-colors">
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    {member?.avatar ? (
                                      <img src={member.avatar} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                                    ) : (
                                      <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] text-white shrink-0" style={{ backgroundColor: color }}>
                                        {initials}
                                      </div>
                                    )}
                                    <div className="min-w-0">
                                      <span className="text-xs font-bold text-white block truncate">{shift.crewName}</span>
                                      <span className="text-[9px] text-white/45 bg-white/5 px-1.5 py-0.5 rounded uppercase font-black leading-none mt-1 inline-block">
                                        {shift.role}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <div className="text-right shrink-0">
                                    <span className="text-[10px] font-extrabold text-white/85 block">{shift.time}</span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedShowCrewDate(null);
                                        handleEditShiftClick(shift);
                                      }}
                                      className="text-[8.5px] font-black uppercase text-amber-400 hover:text-white bg-amber-500/10 hover:bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/20 hover:border-amber-500/40 transition-colors cursor-pointer mt-1 inline-block"
                                    >
                                      Edit
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Open Positions Section */}
                      <div>
                        <h4 className="text-[10px] font-black uppercase text-white/40 tracking-wider mb-2.5">Open Positions</h4>
                        {openShifts.length === 0 ? (
                          <div className="text-center py-4 bg-white/[0.01] border border-dashed border-white/5 rounded-xl text-white/30 text-xs italic">
                            No open positions
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {openShifts.map(shift => (
                              <div key={shift.id} className="bg-emerald-500/[0.02] border border-dashed border-emerald-500/25 rounded-xl p-3 flex items-center justify-between gap-3 hover:border-emerald-500/40 transition-colors">
                                <div>
                                  <span className="text-xs font-bold text-emerald-400 block">{shift.role}</span>
                                  <span className="text-[9px] text-white/40 block mt-0.5">{shift.time}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedShowCrewDate(null);
                                    handleEditShiftClick(shift);
                                  }}
                                  className="text-[9px] font-black uppercase text-black bg-emerald-400 hover:bg-emerald-300 px-3 py-1.5 rounded-lg border-none cursor-pointer transition-colors shadow-sm"
                                >
                                  Fill Slot
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </section>
    );
  }


return (
    <div className="min-h-screen bg-[#050508] text-white pt-24 pb-12 font-sans selection:bg-[var(--color-accent)] selection:text-white relative overflow-x-hidden">
      <style>{`
        @keyframes slideIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
      `}</style>
      
      {/* Floating Quick Scroll Nav / Toggle Button */}
      {!showJumpNav ? (
        <button
          onClick={toggleJumpNav}
          title="Show Navigation"
          className="fixed right-6 top-1/2 -translate-y-1/2 z-[40] hidden xl:flex items-center justify-center w-10 h-10 bg-[#0a0a0f]/95 hover:bg-white/5 border border-white/10 rounded-full shadow-2xl backdrop-blur-md text-white/60 hover:text-white cursor-pointer transition-all duration-200"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
      ) : (
        <div className="fixed right-6 top-1/2 -translate-y-1/2 z-[40] hidden xl:flex flex-col bg-[#0a0a0f]/95 border border-white/10 rounded-2xl p-3 shadow-2xl backdrop-blur-md max-h-[400px] w-44 font-sans transition-all duration-300 animate-[fadeIn_0.15s_ease]">
          <div className="text-[0.6rem] font-bold text-white/30 uppercase tracking-[0.2em] mb-2 px-1 pb-1.5 border-b border-white/5 flex items-center justify-between shrink-0 select-none">
            <span>Jump To Section</span>
            <button
              onClick={toggleJumpNav}
              title="Hide Navigation"
              className="text-white/40 hover:text-white transition-colors cursor-pointer border-none bg-transparent flex items-center justify-center p-0 ml-1 text-[10px]"
            >
              ✕
            </button>
          </div>
          <CustomScrollbar className="flex-1 min-h-0" thumbColor="#a855f7" thumbWidth={5}>
            <div className="flex flex-col gap-1 text-xs pr-1">
              {adminTab === 'band' ? (
                <>
                  <button
                    onClick={() => document.getElementById('admin-sec-announcements')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                    className="text-left py-1.5 px-2 hover:bg-white/5 hover:text-white text-white/60 transition-all rounded font-medium truncate flex items-center gap-2 cursor-pointer border-none"
                  >
                    <span>📡</span> Announcements
                  </button>
                  <button
                    onClick={() => document.getElementById('admin-sec-analytics')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                    className="text-left py-1.5 px-2 hover:bg-white/5 hover:text-white text-white/60 transition-all rounded font-medium truncate flex items-center gap-2 cursor-pointer border-none"
                  >
                    <span>📊</span> Google Analytics
                  </button>
                  {sectionOrder.map((key) => {
                    const labelMap: Record<string, { label: string; icon: string }> = {
                      shopify: { label: 'Shopify Store', icon: '🛒' },
                      toursync: { label: 'Tour Sync', icon: '🔄' },
                      bookings: { label: 'Booking Requests', icon: '📅' },
                      planners: { label: 'Planners Directory', icon: '👥' },
                      featuredtrack: { label: 'Featured Track', icon: '🎵' },
                      photomod: { label: 'Photo Wall Mod', icon: '📸' },
                      memorymod: { label: 'Memory Mod', icon: '🧠' },
                      referral: { label: 'Referrals', icon: '🤝' },
                      invitechallenge: { label: 'Invite Challenge', icon: '🏆' },
                      livealerts: { label: 'Live Alerts', icon: '🚨' },
                      smsblast: { label: 'SMS Blast', icon: '💬' },
                      crewsms: { label: 'Crew SMS', icon: '👥' },
                      newsletter: { label: 'Newsletter', icon: '✉️' },
                      registry: { label: 'Fan Registry', icon: '📝' },
                      crewcreation: { label: 'Crew Management', icon: '🛠️' },
                      admincreation: { label: 'Admin Management', icon: '🔐' },
                      bulkinvites: { label: 'Bulk Invites', icon: '📨' },
                      awardpicks: { label: 'Award Picks', icon: '🏅' }
                    };
                    const section = labelMap[key] || { label: key, icon: '⚙️' };
                    return (
                      <button
                        key={key}
                        onClick={() => document.getElementById(`admin-sec-${key}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                        className="text-left py-1.5 px-2 hover:bg-white/5 hover:text-white text-white/60 transition-all rounded font-medium truncate flex items-center gap-2 cursor-pointer border-none"
                      >
                        <span>{section.icon}</span> {section.label}
                      </button>
                    );
                  })}
                </>
              ) : (
                <>
                  <button
                    onClick={() => document.getElementById('admin-sec-cruise-command')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                    className="text-left py-1.5 px-2 hover:bg-white/5 hover:text-white text-white/60 transition-all rounded font-medium truncate flex items-center gap-2 cursor-pointer border-none"
                  >
                    <span>🚢</span> Command Center
                  </button>
                  <button
                    onClick={() => document.getElementById('admin-sec-cruise-roster')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                    className="text-left py-1.5 px-2 hover:bg-white/5 hover:text-white text-white/60 transition-all rounded font-medium truncate flex items-center gap-2 cursor-pointer border-none"
                  >
                    <span>📊</span> Cruise Roster & Links
                  </button>
                  <button
                    onClick={() => document.getElementById('admin-sec-cruise-blast')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                    className="text-left py-1.5 px-2 hover:bg-white/5 hover:text-white text-white/60 transition-all rounded font-medium truncate flex items-center gap-2 cursor-pointer border-none"
                  >
                    <span>📡</span> Cruise Blast
                  </button>
                </>
              )}
            </div>
          </CustomScrollbar>
        </div>
      )}

      <div className="fixed inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_10%,transparent_100%)] pointer-events-none" />
      <div className="site-container relative z-10 px-4 md:px-6">
        
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 mb-12 border-b border-white/10 pb-8">
          <div className="flex items-center gap-5">
            <div className="relative w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-xl font-black text-amber-400">
              {(member?.name || 'Admin').split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-400 border-2 border-[#0a0a0f] flex items-center justify-center">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="#0a0a0f"><path d="M2 20h20v2H2v-2zm1-7l4 5h10l4-5-3-6-4 4-2-7-2 7-4-4-3 6z" /></svg>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl md:text-3xl font-black italic tracking-tight text-white">{member?.name || "System Admin"}</h1>
                <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-400/30 rounded-full text-amber-400 text-[0.55rem] font-bold uppercase tracking-[0.15em]">
                  👑 Admin
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-600/20 border border-red-500/50 rounded-full text-red-500 text-[0.55rem] font-bold uppercase tracking-widest animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  God Mode
                </span>
              </div>
              <p className="text-[0.8rem] text-white/40 font-mono">{member?.email || "admin@7thheaven.com"}</p>
              <p className="text-[0.7rem] text-white/30 mt-1">Oversee activity, intercept live feeds, and manage community access in real-time.</p>
            </div>
          </div>
          
          <Link href="/" className="text-[0.7rem] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors border border-white/10 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10">
            Exit to Site →
          </Link>
        </div>

        {/* === ADMIN TAB TOGGLE === */}
        <div className="flex items-center gap-1 mb-10 bg-[#0a0a0f]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-1.5 w-fit mx-auto shadow-[0_0_30px_rgba(0,0,0,0.3)]">
          <button
            onClick={() => { setAdminTab('band'); adminTabRef.current = 'band'; }}
            className={`relative px-8 py-3 rounded-xl text-[0.7rem] font-black uppercase tracking-[0.15em] transition-all duration-300 cursor-pointer ${
              adminTab === 'band'
                ? 'bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent)]/80 text-white shadow-[0_0_20px_rgba(133,29,239,0.4)] border border-[var(--color-accent)]/50'
                : 'text-white/40 hover:text-white/70 hover:bg-white/5 border border-transparent'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <span className="text-base">🎸</span>
              Band & Site
            </span>
          </button>
          <button
            onClick={() => { setAdminTab('cruise'); adminTabRef.current = 'cruise'; setUnreadCruiseChat(0); }}
            className={`relative px-8 py-3 rounded-xl text-[0.7rem] font-black uppercase tracking-[0.15em] transition-all duration-300 cursor-pointer ${
              adminTab === 'cruise'
                ? 'bg-gradient-to-r from-cyan-600 to-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] border border-cyan-400/50'
                : 'text-white/40 hover:text-white/70 hover:bg-white/5 border border-transparent'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <span className="text-base">🚢</span>
              Cruise
            </span>
            {unreadCruiseChat > 0 && adminTab !== 'cruise' && (
              <span className="absolute -top-2 -right-2 min-w-[22px] h-[22px] flex items-center justify-center rounded-full bg-rose-500 text-white text-[0.55rem] font-black px-1.5 shadow-[0_0_10px_rgba(244,63,94,0.6)] animate-[bounce_1s_ease-in-out_2] border-2 border-[#0a0a0f]">
                {unreadCruiseChat > 99 ? '99+' : unreadCruiseChat}
              </span>
            )}
          </button>
        </div>

        {/* ═══════════════════════════════════════════════ */}
        {/* ═══  BAND & SITE TAB  ═══════════════════════ */}
        {/* ═══════════════════════════════════════════════ */}
        {adminTab === 'band' && (
          <>

        {/* === SITE ANNOUNCEMENTS === */}
        <div id="admin-sec-announcements" className="mb-14 relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[var(--color-accent)] to-[var(--color-accent)]/60 flex items-center justify-center shadow-lg shadow-[var(--color-accent)]/20 p-[1px]">
              <div className="w-full h-full bg-[#050508] rounded-full flex items-center justify-center">
                <span className="text-lg">📡</span>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-black italic tracking-wide text-white uppercase">Band Announcements</h2>
              <p className="text-[0.65rem] font-bold text-white/40 uppercase tracking-widest">Post band updates & alerts across the entire site</p>
            </div>
          </div>

          <div className="relative">
            {/* Ambient background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-r from-[var(--color-accent)]/10 to-transparent blur-[100px] pointer-events-none rounded-full" />
            
            {/* Global Announcement Banner Control */}
            <div className={`relative z-10 bg-[#0a0a0f]/80 backdrop-blur-xl border ${bannerActive ? 'border-[var(--color-accent)]/50 shadow-[0_0_30px_rgba(133,29,239,0.15)]' : 'border-white/5 hover:border-white/10'} rounded-2xl p-6 md:p-8 transition-all duration-500 flex flex-col group`}>
              <div className={`absolute inset-0 ${bannerActive ? 'bg-[var(--color-accent)]/5' : 'bg-transparent'} pointer-events-none transition-all duration-500 rounded-2xl`} />
              
              <div className="relative z-10 flex flex-col gap-6">
                {/* Header row */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 shrink-0 rounded-xl ${bannerActive ? 'bg-[var(--color-accent)]/20 border-[var(--color-accent)]/40 shadow-[0_0_15px_rgba(133,29,239,0.3)]' : 'bg-white/5 border-white/10 group-hover:bg-white/10'} border flex items-center justify-center text-2xl transition-all duration-500`}>📢</div>
                    <div>
                      <h3 className="text-lg font-black italic tracking-wide text-white">Global Alert Banner</h3>
                      <p className="text-[0.65rem] font-bold text-white/40 uppercase tracking-widest leading-relaxed mt-0.5">Pin a band announcement or urgent notice sitewide</p>
                    </div>
                  </div>
                  {/* Main toggle — auto-saves */}
                  <button 
                    onClick={async () => {
                      const newActive = !bannerActive;
                      setBannerActive(newActive);
                      await updateGlobalBanner({ isActive: newActive });
                    }} 
                    disabled={bannerUpdating}
                    className={`relative px-6 py-2.5 rounded-xl text-[0.6rem] font-black uppercase tracking-widest transition-all duration-300 border cursor-pointer shrink-0 overflow-hidden ${bannerActive 
                      ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)] shadow-[0_0_20px_rgba(133,29,239,0.5)] hover:shadow-[0_0_30px_rgba(133,29,239,0.8)] hover:scale-[1.02]' 
                      : 'bg-[#1c1c24] text-white/50 border-white/10 hover:border-[var(--color-accent)]/50 hover:text-[var(--color-accent)] hover:bg-[#252530]'
                    } disabled:opacity-50 disabled:hover:scale-100`}
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${bannerActive ? 'bg-white animate-pulse shadow-[0_0_5px_white]' : 'bg-white/30'}`} />
                      {bannerActive ? 'LIVE ON SITE' : 'OFF'}
                    </span>
                    {bannerActive && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[100%] animate-[shimmer_2s_infinite]" />}
                  </button>
                </div>
                
                {/* Save status toast */}
                {bannerSaveStatus && (
                  <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[0.6rem] font-bold uppercase tracking-widest animate-[slideIn_0.3s_ease-out] backdrop-blur-md ${
                    bannerSaveStatus === 'saved' 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]'
                  }`}>
                    {bannerSaveStatus === 'saved' ? '✓ Banner updated successfully' : '✕ Failed to update — try again'}
                  </div>
                )}

                {/* Message input */}
                <div className="flex flex-col gap-3 mt-auto">
                  <div className="w-full text-black [&_.ql-editor]:min-h-[200px]">
                    <ReactQuill 
                      theme="snow" 
                      value={bannerText} 
                      onChange={setBannerText} 
                      placeholder="Alert message (e.g. Weather delay tonight)" 
                      className="bg-white rounded-xl overflow-hidden"
                    />
                  </div>

                  {/* Controls row */}
                  <div className="flex flex-wrap items-center justify-between gap-4 bg-black/20 p-2 rounded-xl border border-white/5">
                    <button 
                      onClick={() => updateGlobalBanner()}
                      disabled={bannerUpdating}
                      className="px-6 py-2.5 bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/90 text-white text-[0.6rem] font-black uppercase tracking-widest rounded-lg border border-[var(--color-accent)]/50 transition-all disabled:opacity-50 cursor-pointer shadow-[0_4px_15px_rgba(133,29,239,0.3)] hover:shadow-[0_6px_20px_rgba(133,29,239,0.4)] hover:-translate-y-0.5 active:translate-y-0"
                    >
                      {bannerUpdating ? 'Saving...' : 'Dispatch'}
                    </button>

                    {/* Auto-expire buttons */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
                      <span className="text-[0.5rem] font-bold text-white/30 uppercase tracking-widest shrink-0 mr-2">Expiry:</span>
                      {[
                        { label: '1h', hours: 1 },
                        { label: '3h', hours: 3 },
                        { label: '12h', hours: 12 },
                        { label: '24h', hours: 24 },
                      ].map(({ label, hours }) => {
                        const expiry = new Date(Date.now() + hours * 3600000).toISOString();
                        const isSelected = bannerExpiresAt && Math.abs(new Date(bannerExpiresAt).getTime() - Date.now() - hours * 3600000) < 60000;
                        return (
                          <button 
                            key={label} 
                            type="button" 
                            onClick={async () => {
                              setBannerExpiresAt(expiry);
                              await updateGlobalBanner({ expiresAt: expiry });
                            }}
                            className={`px-3 py-1.5 rounded-md text-[0.55rem] font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                              isSelected
                                ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/15 text-white shadow-[0_0_10px_rgba(133,29,239,0.2)]'
                                : 'border-transparent bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70'
                            }`}
                          >{label}</button>
                        );
                      })}
                      <button 
                        type="button" 
                        onClick={async () => {
                          setBannerExpiresAt(null);
                          await updateGlobalBanner({ expiresAt: null });
                        }}
                        className={`px-3 py-1.5 rounded-md text-[0.55rem] font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                          !bannerExpiresAt ? 'border-amber-500/50 bg-amber-500/15 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.15)]' : 'border-transparent bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70'
                        }`}
                      >Off</button>
                    </div>
                  </div>
                  
                  {/* Expiry info */}
                  {bannerExpiresAt && (
                    <div className="flex items-center gap-2 text-[0.55rem] px-2 py-1 rounded bg-black/30 border border-white/5 w-fit">
                      <span className="text-white/30 font-bold uppercase tracking-widest">Auto-off at:</span>
                      <span className="font-bold text-amber-400 tracking-wider">{new Date(bannerExpiresAt).toLocaleString(undefined, { weekday: 'short', hour: 'numeric', minute: '2-digit' })}</span>
                      {new Date(bannerExpiresAt) < new Date() && (
                        <span className="font-bold text-rose-400 uppercase tracking-widest px-1.5 rounded bg-rose-500/20">Expired</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>


        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {METRICS.map((metric, i) => (
            <div key={i} onClick={() => { if (metric.label === 'Booking Requests') document.getElementById('booking-requests-section')?.scrollIntoView({ behavior: 'smooth' }); }} className={`bg-[#0f0f13] border border-white/5 p-6 rounded-xl flex flex-col justify-between shadow-2xl relative overflow-hidden group ${metric.label === 'Booking Requests' ? 'cursor-pointer' : ''}`}>
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-white/40 mb-2">{metric.label}</p>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-black">{metric.value}</span>
                <span className={`text-[0.6rem] font-bold uppercase tracking-wider px-2 py-1 bg-white/5 rounded ${metric.color}`}>
                  {metric.trend}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Crew Work Schedule Calendar - Full Bleed */}
        <div className="mb-8">
          {(() => {
            try {
              return renderCrewSchedule();
            } catch (err: any) {
              return (
                <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-6 text-red-300">
                  <p className="font-bold text-lg mb-2">⚠️ Schedule Section Error</p>
                  <pre className="text-xs text-red-200/70 whitespace-pre-wrap">{err?.message || String(err)}</pre>
                </div>
              );
            }
          })()}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          <div className="xl:col-span-2 flex flex-col gap-8">

            {/* ── Google Analytics ── */}
            <section id="admin-sec-analytics" className="bg-[#0f0f13] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-black/20">
                <h3 className="text-lg font-bold tracking-tight flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4285F4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>
                  Google Analytics
                </h3>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded text-[0.6rem] font-bold text-blue-400 uppercase tracking-widest animate-pulse">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    Live Data
                  </span>
                </div>
              </div>

              <div className="p-6">
                {/* GA Metric Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
                  <div className="bg-black/30 border border-blue-500/20 rounded-xl p-5 hover:border-blue-500/40 transition-colors col-span-2 lg:col-span-1">
                    <p className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-blue-400/60 mb-2">Active Users</p>
                    <p className="text-2xl font-black text-blue-400">{gaData.activeUsers}</p>
                    <p className="text-[0.55rem] text-white/30 mt-1 uppercase tracking-widest">Right now</p>
                  </div>
                  <div className="bg-black/30 border border-white/10 rounded-xl p-5 col-span-2 lg:col-span-1">
                    <p className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-white/40 mb-2">Sessions</p>
                    <p className="text-2xl font-black text-white">{gaData.sessions.toLocaleString()}</p>
                    <p className="text-[0.55rem] text-white/30 mt-1 uppercase tracking-widest">Last 30 days</p>
                  </div>
                  <div className="bg-black/30 border border-white/10 rounded-xl p-5 col-span-2 lg:col-span-1">
                    <p className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-white/40 mb-2">Page Views</p>
                    <p className="text-2xl font-black text-white">{gaData.pageViews.toLocaleString()}</p>
                    <p className="text-[0.55rem] text-white/30 mt-1 uppercase tracking-widest">Total traffic</p>
                  </div>
                  <div className="bg-black/30 border border-emerald-500/20 rounded-xl p-5 col-span-2 lg:col-span-1">
                    <p className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-emerald-400/60 mb-2">Conv. Rate</p>
                    <p className="text-2xl font-black text-emerald-400">{gaData.conversionRate}</p>
                    <p className="text-[0.55rem] text-white/30 mt-1 uppercase tracking-widest">Traffic → Sale</p>
                  </div>
                  <div className="bg-black/30 border border-emerald-500/20 rounded-xl p-5 col-span-2 lg:col-span-1">
                    <p className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-emerald-400/60 mb-2">Rev / Session</p>
                    <p className="text-2xl font-black text-emerald-400">{gaData.revenuePerSession}</p>
                    <p className="text-[0.55rem] text-white/30 mt-1 uppercase tracking-widest">Avg Value</p>
                  </div>
                  <div className="bg-black/30 border border-white/10 rounded-xl p-5 col-span-2 lg:col-span-1">
                    <p className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-white/40 mb-2">Bounce Rate</p>
                    <p className="text-2xl font-black text-white">{gaData.bounceRate}</p>
                    <p className="text-[0.55rem] text-white/30 mt-1 uppercase tracking-widest">Engagement</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Traffic Sources */}
                  <div className="bg-black/20 border border-white/5 rounded-xl p-5">
                    <h4 className="text-[0.7rem] font-bold uppercase tracking-widest text-white/40 mb-6 flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="m16 12-4-4-4 4"/><path d="M12 16V8"/></svg>
                      Traffic Sources
                    </h4>
                    <div className="space-y-4">
                      {gaData.sources.map((source: any) => (
                        <div key={source.name} className="space-y-1.5">
                          <div className="flex justify-between text-[0.65rem] font-bold uppercase tracking-wider">
                            <span className="text-white/60">{source.name}</span>
                            <span className="text-white/40">{source.value}%</span>
                          </div>
                          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500/60 rounded-full"
                              style={{ width: `${source.value}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Locations */}
                  <div className="bg-black/20 border border-white/5 rounded-xl p-5">
                    <h4 className="text-[0.7rem] font-bold uppercase tracking-widest text-white/40 mb-6 flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                      Top Locations
                    </h4>
                    <div className="space-y-4">
                      {gaData.locations.map((loc: any) => (
                        <div key={loc.city} className="space-y-1.5">
                          <div className="flex justify-between text-[0.65rem] font-bold uppercase tracking-wider">
                            <span className="text-white/60">{loc.city}</span>
                            <span className="text-white/40">{loc.percentage}%</span>
                          </div>
                          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-purple-500/60 rounded-full"
                              style={{ width: `${loc.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Conversion Funnel */}
                  <div className="bg-black/20 border border-white/5 rounded-xl p-5">
                    <h4 className="text-[0.7rem] font-bold uppercase tracking-widest text-white/40 mb-6 flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                      Conversion Funnel
                    </h4>
                    <div className="space-y-4 relative">
                      <div className="absolute left-4 top-2 bottom-2 w-px bg-white/10" />
                      <div className="relative z-10 flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-[0.6rem] font-black text-blue-400">100%</div>
                        <div>
                          <p className="text-[0.65rem] font-bold uppercase tracking-widest text-white/60">Site Visitors</p>
                          <p className="text-[0.55rem] text-white/30">{gaData.sessions.toLocaleString()} sessions</p>
                        </div>
                      </div>
                      <div className="relative z-10 flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-[0.6rem] font-black text-purple-400">12%</div>
                        <div>
                          <p className="text-[0.65rem] font-bold uppercase tracking-widest text-white/60">Added to Cart</p>
                          <p className="text-[0.55rem] text-white/30">{Math.floor(gaData.sessions * 0.12)} sessions</p>
                        </div>
                      </div>
                      <div className="relative z-10 flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-[0.6rem] font-black text-emerald-400">{gaData.conversionRate}</div>
                        <div>
                          <p className="text-[0.65rem] font-bold uppercase tracking-widest text-white/60">Purchased</p>
                          <p className="text-[0.55rem] text-white/30">{Math.floor(gaData.sessions * 0.038)} orders</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hotspot Analytics Map */}
                <div className="mt-6 bg-black/20 border border-white/5 rounded-xl p-5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(66,133,244,0.1)_0%,transparent_70%)] opacity-50 pointer-events-none" />
                  <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="flex-1 w-full relative">
                      <AdminMap locations={gaData.locations} />
                    </div>
                    <div className="w-full md:w-64 shrink-0 space-y-4">
                      <h4 className="text-[0.7rem] font-bold uppercase tracking-widest text-white/40 mb-2 flex items-center gap-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                        Traffic Heatmap
                      </h4>
                      <p className="text-[0.6rem] text-white/40 leading-relaxed mb-4">
                        Real-time visualization of high-density traffic areas to assist with targeted tour routing.
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-widest text-white/60">
                          <span className="w-2 h-2 rounded-full bg-[#10b981]" /> Chicago (Primary)
                        </div>
                        <div className="flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-widest text-white/60">
                          <span className="w-2 h-2 rounded-full bg-[#f59e0b]" /> Nashville (Growing)
                        </div>
                        <div className="flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-widest text-white/60">
                          <span className="w-2 h-2 rounded-full bg-[#a855f7]" /> Los Angeles
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Connection Notice */}
                <div className="mt-8 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4">
                  <div className="flex items-start gap-3">
                    <span className="text-xl mt-1 sm:mt-0">✅</span>
                    <div>
                      <p className="text-xs font-bold text-white/80">Google Analytics Active</p>
                      <p className="text-[0.6rem] text-white/40 uppercase tracking-widest leading-relaxed">
                        Tracking Live with ID: <span className="text-emerald-400 font-mono">G-HS8X0ZD66V</span>
                      </p>
                    </div>
                  </div>
                  
                  {/* Handoff Reminder Notice */}
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 w-full sm:w-auto">
                    <div className="flex items-start gap-2">
                      <span className="text-amber-400 text-sm">⚠️</span>
                      <div>
                        <p className="text-[0.65rem] font-bold text-amber-400 uppercase tracking-widest">Handoff Reminder</p>
                        <p className="text-[0.6rem] text-white/60 leading-snug mt-1 max-w-[280px]">
                          To link GA4 with Shopify data: Go to Shopify Admin → Online Store → Preferences. Scroll to Google Analytics and paste the same ID: <strong className="text-white">G-HS8X0ZD66V</strong>.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>


            {sectionOrder.map((key, index) => {
              const dragProps = {
                draggable: true,
                onDragStart: (e: any) => {
                  if (!e.target.closest('.drag-handle')) {
                    e.preventDefault();
                    return;
                  }
                  handleDragStart(index);
                },
                onDragOver: (e: any) => handleDragOver(e, index),
                onDragEnd: handleDragEnd,
                className: "transition-all duration-300 " + (draggedIndex === index ? 'opacity-40 scale-[0.98]' : '')
              };

              let component = null;
              switch (key) {
                case 'shopify': component = renderShopify(); break;
                case 'toursync': component = renderTourSync(); break;
                case 'bookings': component = renderBookings(); break;
                case 'planners': component = renderPlanners(); break;
                case 'featuredtrack': component = renderFeaturedTrack(); break;
                case 'photomod': component = renderPhotoMod(); break;
                case 'memorymod': component = renderMemoryMod(); break;
                case 'referral': component = renderReferral(); break;
                case 'livealerts': component = renderLiveAlerts(); break;
                case 'smsblast': component = renderSmsBlast(); break;
                case 'crewsms': component = renderCrewSms(); break;
                case 'newsletter': component = renderNewsletter(); break;
                case 'registry': component = renderRegistry(); break;
                case 'crewcreation': component = renderCrewCreation(); break;
                case 'admincreation': component = renderAdminCreation(); break;
                case 'invitechallenge': component = renderInviteChallenge(); break;
                case 'bulkinvites': component = renderBulkInvites(); break;
                case 'awardpicks': component = renderAwardPicks(); break;
              }

              return (
                <div key={key} id={`admin-sec-${key}`} {...dragProps}>
                  {component}
                </div>
              );
            })}

          </div>

          <div className="xl:col-span-1 flex flex-col gap-8">
            <section className="bg-[#0f0f13] border border-white/5 rounded-2xl overflow-hidden shadow-2xl h-full flex flex-col">
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20 shrink-0">
                <h3 className="text-lg font-bold tracking-tight flex items-center gap-2">
                  Audit Log
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </h3>
                <span className="text-[0.6rem] text-white/30 uppercase tracking-widest">{auditLog.length} Events</span>
              </div>
              <div className="p-6 flex flex-col gap-5 flex-1 overflow-y-auto max-h-[500px] custom-scrollbar">
                {auditLog.map((entry, i) => (
                  <div key={entry.id} className="flex gap-4 relative" style={{ animation: i === 0 ? 'slideIn 0.4s ease-out' : 'none' }}>
                    {i < auditLog.length - 1 && (
                      <div className="absolute top-6 bottom-[-20px] left-[7px] w-[2px] bg-white/5" />
                    )}
                    <div className="shrink-0 mt-1">
                      <div className={`w-4 h-4 rounded-full border-2 border-[#0f0f13] ${entry.color}`} />
                    </div>
                    <div>
                      <p className="text-sm text-white/80 leading-relaxed mb-1">{entry.text}</p>
                      <p className="text-[0.65rem] uppercase tracking-widest text-white/30">{entry.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
          </div>

        </>
        )}

        {adminTab === 'cruise' && (
          <>
        {/* === CRUISE BROADCAST CENTER === */}
        <div id="admin-sec-cruise-command" className="mb-14 relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/20 p-[1px]">
              <div className="w-full h-full bg-[#050508] rounded-full flex items-center justify-center">
                <span className="text-lg">🚢</span>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-black italic tracking-wide text-white uppercase">Cruise Command Center</h2>
              <p className="text-[0.65rem] font-bold text-white/40 uppercase tracking-widest">Manage cruise dashboard announcements, links & chat</p>
            </div>
          </div>

          {/* Row 1: Passenger Notice + Passenger Lounge */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 relative items-start">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-r from-cyan-500/10 to-transparent blur-[100px] pointer-events-none rounded-full" />

            {/* Passenger Notice */}
            <div className={`relative z-10 bg-[#0a0a0f]/80 backdrop-blur-xl border border-white/5 hover:border-cyan-500/20 rounded-2xl p-6 md:p-8 transition-all duration-500 flex flex-col group overflow-hidden`}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 group-hover:bg-cyan-500/10 transition-all duration-700 pointer-events-none" />
              <div className="relative z-10 flex flex-col gap-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 shrink-0 rounded-xl bg-cyan-500/10 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)] flex items-center justify-center text-2xl transition-all duration-500">📋</div>
                    <div>
                      <h3 className="text-lg font-black italic tracking-wide text-white">Passenger Notice</h3>
                      <p className="text-[0.65rem] font-bold text-white/40 uppercase tracking-widest leading-relaxed mt-0.5">Post an update to the Cruise Dashboard</p>
                    </div>
                  </div>
                  <div className="px-3 py-1.5 rounded-lg border border-cyan-500/20 bg-cyan-500/5 flex items-center gap-2 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_5px_cyan]" />
                    <span className="text-[0.5rem] font-bold text-cyan-400 uppercase tracking-widest">Active</span>
                  </div>
                </div>
                {cruiseSaveStatus && (
                  <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[0.6rem] font-bold uppercase tracking-widest animate-[slideIn_0.3s_ease-out] backdrop-blur-md ${cruiseSaveStatus === 'saved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                    {cruiseSaveStatus === 'saved' ? '✓ Notice updated — live on cruise dashboard' : '✕ Failed to update — try again'}
                  </div>
                )}
                <div className="flex flex-col gap-3 mt-auto bg-black/20 p-3 md:p-4 rounded-xl border border-white/5">
                  <div className="w-full text-black [&_.ql-editor]:min-h-[200px]">
                    <ReactQuill theme="snow" value={cruiseMessage} onChange={setCruiseMessage} placeholder="Message (e.g. VIP pre-booking opens Friday at 12 PM CST)" className="bg-white rounded-xl overflow-hidden" />
                  </div>
                  <div className="flex flex-wrap items-center gap-2 justify-end mt-2">
                    <div className="text-[0.55rem] text-white/30 font-medium italic mr-auto px-2">Press the trash icon to remove the active notice.</div>
                    <button onClick={() => updateCruiseMessage()} disabled={cruiseUpdating} className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white text-[0.65rem] font-black uppercase tracking-widest rounded-xl transition-all disabled:opacity-50 cursor-pointer shadow-[0_4px_15px_rgba(6,182,212,0.25)] border border-cyan-400/30 flex items-center justify-center">
                      <span className="relative z-10">{cruiseUpdating ? 'Dispatching...' : 'Dispatch Update'}</span>
                    </button>
                    <button onClick={() => updateCruiseMessage('')} disabled={cruiseUpdating} title="Remove Notice" className="w-10 h-10 flex items-center justify-center rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all disabled:opacity-50 group/trash">
                      <svg className="group-hover/trash:scale-110 transition-transform" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Live Chat Panel */}
            <div className={`relative z-10 bg-[#0a0a0f]/80 backdrop-blur-xl border ${cruiseChatEnabled ? 'border-[var(--color-accent)]/20' : 'border-rose-500/15'} rounded-2xl transition-all duration-500 flex flex-col overflow-hidden`}>
              {/* Header with toggle */}
              <div className="bg-black/40 px-5 py-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full ${cruiseChatEnabled ? 'bg-[var(--color-accent)]/20' : 'bg-rose-500/10'} flex items-center justify-center text-lg`}>💬</div>
                  <div>
                    <h3 className="font-bold text-white text-sm tracking-wide">Passenger Lounge</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${cruiseChatEnabled ? 'bg-emerald-500 animate-pulse shadow-[0_0_5px_rgba(16,185,129,0.5)]' : 'bg-white/20'}`} />
                      <span className={`text-[0.55rem] font-bold uppercase tracking-widest ${cruiseChatEnabled ? 'text-emerald-400' : 'text-white/20'}`}>{cruiseChatEnabled ? 'Live' : 'Offline'}</span>
                      <span className="text-[0.55rem] text-white/20 ml-2">{adminChatMessages.length} messages</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={toggleCruiseChat}
                  disabled={cruiseChatToggling}
                  className={`relative px-5 py-2 rounded-xl text-[0.55rem] font-black uppercase tracking-widest transition-all duration-300 border cursor-pointer shrink-0 overflow-hidden ${cruiseChatEnabled 
                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:scale-[1.02]' 
                    : 'bg-[#1c1c24] text-rose-400 border-rose-500/30 hover:bg-rose-500/10'
                  } disabled:opacity-50`}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${cruiseChatEnabled ? 'bg-white animate-pulse' : 'bg-rose-400'}`} />
                    {cruiseChatEnabled ? 'LIVE' : 'OFF'}
                  </span>
                  {cruiseChatEnabled && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[100%] animate-[shimmer_2s_infinite]" />}
                </button>
              </div>

              {/* Pinned Message Bar */}
              {cruiseChatPin && cruiseChatPin !== '<p><br></p>' && (
                <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 flex items-center gap-2">
                  <span className="text-amber-400 text-xs shrink-0">📌</span>
                  <p className="text-amber-100/80 text-[0.7rem] font-medium truncate flex-1" dangerouslySetInnerHTML={{ __html: cruiseChatPin.replace(/<[^>]+>/g, ' ').trim() }} />
                </div>
              )}

              {/* Chat Messages Feed */}
              <div ref={adminChatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[360px] min-h-[200px] scrollbar-hide">
                {adminChatMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center py-12 text-white/20">
                    <span className="text-2xl mb-2 opacity-50">💬</span>
                    <p className="text-[0.6rem] font-bold uppercase tracking-widest">No messages yet</p>
                    <p className="text-[0.55rem] mt-1 text-center max-w-[200px]">Cruise members will appear here when they start chatting.</p>
                  </div>
                ) : (
                  adminChatMessages.map((msg) => {
                    const isAdmin = msg.sender_role === 'admin';
                    const isCrew = msg.sender_role === 'crew';
                    return (
                      <div key={msg.id} className={`flex gap-2.5 ${isAdmin ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[0.5rem] font-black border ${
                          isAdmin ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' :
                          isCrew ? 'border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 text-[var(--color-accent)]' :
                          'border-white/10 bg-[#15151f] text-white/60'
                        }`}>
                          {msg.sender_avatar.substring(0, 2).toUpperCase()}
                        </div>
                        <div className={`flex flex-col ${isAdmin ? 'items-end' : ''} flex-1 max-w-[85%]`}>
                          <div className={`flex items-baseline gap-2 mb-0.5 ${isAdmin ? 'flex-row-reverse' : ''}`}>
                            <span className="text-[0.65rem] font-bold text-white/70">{msg.sender_name}</span>
                            <span className={`text-[0.45rem] font-bold uppercase tracking-widest px-1 py-0.5 rounded border ${
                              isAdmin ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                              isCrew ? 'text-[var(--color-accent)] bg-[var(--color-accent)]/10 border-[var(--color-accent)]/20' :
                              'text-white/40 bg-white/5 border-white/5'
                            }`}>{msg.sender_role}</span>
                            <span className="text-[0.5rem] text-white/20 font-mono">
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className={`${isAdmin ? 'bg-emerald-500/10 border-emerald-500/10 rounded-2xl rounded-tr-none' : 'bg-white/5 border-white/[0.02] rounded-2xl rounded-tl-none'} px-3 py-2 text-[0.75rem] text-white/70 inline-block w-fit leading-relaxed border`}>
                            {msg.content}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={adminChatEndRef} />
              </div>

              {/* Admin Message Input */}
              <div className="p-3 bg-black/40 border-t border-white/5">
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  if (!adminChatInput.trim() || adminChatSending) return;
                  setAdminChatSending(true);
                  try {
                    const res = await fetch('/api/chat/send', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        room: 'cruise_dashboard',
                        sender_name: member?.name || 'Admin',
                        sender_role: 'admin',
                        sender_avatar: member?.name?.substring(0, 2) || 'AD',
                        content: adminChatInput.trim(),
                      })
                    });
                    if (res.ok) setAdminChatInput('');
                  } catch (err) { console.error(err); }
                  setAdminChatSending(false);
                }} className="relative flex items-center gap-2">
                  <input
                    type="text"
                    value={adminChatInput}
                    onChange={(e) => setAdminChatInput(e.target.value)}
                    placeholder="Send a message as admin..."
                    className="w-full bg-[#15151f] border border-white/10 rounded-xl pl-4 pr-12 py-2.5 text-sm text-white outline-none focus:border-emerald-500/50 focus:bg-white/5 transition-all"
                    maxLength={500}
                  />
                  <button
                    type="submit"
                    disabled={!adminChatInput.trim() || adminChatSending}
                    className="absolute right-2 w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-30"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                  </button>
                </form>
              </div>

              {/* Pin Controls (collapsible) */}
              <div className="px-4 py-3 bg-black/20 border-t border-white/5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm">📌</span>
                  <span className="text-[0.55rem] font-bold text-white/40 uppercase tracking-widest">Pin a message</span>
                  {cruiseChatPinSaveStatus && (
                    <span className={`text-[0.5rem] font-bold uppercase tracking-widest ml-auto ${cruiseChatPinSaveStatus === 'saved' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {cruiseChatPinSaveStatus === 'saved' ? '✓ Pinned' : '✕ Failed'}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={cruiseChatPin.replace(/<[^>]+>/g, '')}
                    onChange={(e) => setCruiseChatPin(e.target.value)}
                    placeholder="e.g. Welcome aboard! Band drops in at 3 PM."
                    className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50 transition-all placeholder:text-white/15"
                  />
                  <button onClick={() => updateCruiseChatPin()} disabled={cruiseChatPinUpdating} className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500 text-amber-400 hover:text-white text-[0.55rem] font-bold uppercase tracking-widest rounded-lg transition-all disabled:opacity-50 border border-amber-500/20">
                    {cruiseChatPinUpdating ? '...' : 'Pin'}
                  </button>
                  <button onClick={() => updateCruiseChatPin('')} disabled={cruiseChatPinUpdating} title="Remove Pin" className="w-9 h-9 flex items-center justify-center rounded-lg border border-rose-500/20 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all disabled:opacity-50 shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/></svg>
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Row 2: Important Links + Roster Export */}
          <div id="admin-sec-cruise-roster" className="grid grid-cols-1 xl:grid-cols-3 gap-6 relative items-start mt-6">
            {/* Important Links — 2 cols */}
            <div className="xl:col-span-2 relative z-10 bg-[#0a0a0f]/80 backdrop-blur-xl border border-white/5 hover:border-fuchsia-500/20 rounded-2xl p-6 md:p-8 transition-all duration-500 flex flex-col group overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 group-hover:bg-fuchsia-500/10 transition-all duration-700 pointer-events-none" />
              <div className="relative z-10 flex flex-col gap-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 shrink-0 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/30 shadow-[0_0_15px_rgba(217,70,239,0.15)] flex items-center justify-center text-2xl transition-all duration-500">🔗</div>
                    <div>
                      <h3 className="text-lg font-black italic tracking-wide text-white">Important Links</h3>
                      <p className="text-[0.65rem] font-bold text-white/40 uppercase tracking-widest leading-relaxed mt-0.5">Quick Links (Drink Packages, Excursions)</p>
                    </div>
                  </div>
                </div>
                {linksSaveStatus && (
                  <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[0.6rem] font-bold uppercase tracking-widest animate-[slideIn_0.3s_ease-out] ${linksSaveStatus === 'saved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                    {linksSaveStatus === 'saved' ? '✓ Links updated successfully' : '✕ Failed to update — try again'}
                  </div>
                )}
                <div className="flex flex-col gap-3 mt-auto">
                  {importantLinks.map((link, i) => (
                    <div key={i} className="flex flex-col md:flex-row gap-3 bg-black/20 p-3 rounded-xl border border-white/5">
                      <input type="text" value={link.icon} onChange={e => { const n=[...importantLinks]; n[i].icon=e.target.value; setImportantLinks(n); }} placeholder="🍹" className="w-full md:w-24 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-center text-white outline-none focus:border-fuchsia-500/60 transition-all" />
                      <input type="text" value={link.title} onChange={e => { const n=[...importantLinks]; n[i].title=e.target.value; setImportantLinks(n); }} placeholder="Title" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-fuchsia-500/60 transition-all" />
                      <input type="text" value={link.url} onChange={e => { const n=[...importantLinks]; n[i].url=e.target.value; setImportantLinks(n); }} placeholder="URL" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-fuchsia-500/60 transition-all" />
                      <button onClick={() => setImportantLinks(importantLinks.filter((_,idx)=>idx!==i))} className="w-12 h-[46px] flex items-center justify-center rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all shrink-0">✕</button>
                    </div>
                  ))}
                  <div className="flex gap-3 mt-2">
                    <button onClick={() => setImportantLinks([...importantLinks, { title: '', url: '', icon: '🔗' }])} className="flex-1 py-3 border border-white/10 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-[0.65rem] font-black uppercase tracking-widest rounded-xl transition-all">+ Add Link</button>
                    <button onClick={updateImportantLinks} disabled={linksUpdating} className="px-6 py-3 bg-gradient-to-r from-fuchsia-600 to-fuchsia-500 hover:from-fuchsia-500 hover:to-fuchsia-400 text-white text-[0.65rem] font-black uppercase tracking-widest rounded-xl transition-all disabled:opacity-50 border border-fuchsia-400/30 shadow-[0_4px_15px_rgba(217,70,239,0.25)] min-w-[120px]">{linksUpdating ? 'Saving...' : 'Save All'}</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Cruise Roster & Signup Stats — 1 col */}
            <div className="relative z-10 bg-[#0a0a0f]/80 backdrop-blur-xl border border-white/5 hover:border-emerald-500/20 rounded-2xl p-6 md:p-8 transition-all duration-500 flex flex-col group overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 group-hover:bg-emerald-500/10 transition-all duration-700 pointer-events-none" />
              <div className="relative z-10 flex flex-col gap-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 shrink-0 rounded-xl bg-emerald-500/10 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)] flex items-center justify-center text-2xl transition-all duration-500">📊</div>
                  <div>
                    <h3 className="text-lg font-black italic tracking-wide text-white">Cruise Roster</h3>
                    <p className="text-[0.65rem] font-bold text-white/40 uppercase tracking-widest leading-relaxed mt-0.5">Signups & Passenger Manifest</p>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-black/30 p-3 rounded-xl border border-white/5 text-center">
                    <p className="text-2xl font-black text-emerald-400">{cruiseStats.signups || 0}</p>
                    <p className="text-[0.5rem] font-bold text-white/30 uppercase tracking-widest mt-0.5">Bookings</p>
                  </div>
                  <div className="bg-black/30 p-3 rounded-xl border border-white/5 text-center">
                    <p className="text-2xl font-black text-white">{cruiseStats.total}</p>
                    <p className="text-[0.5rem] font-bold text-white/30 uppercase tracking-widest mt-0.5">Total Pax</p>
                  </div>
                  <div className="bg-black/30 p-3 rounded-xl border border-white/5 text-center">
                    <p className="text-lg font-black text-white/60">{cruiseStats.adults}<span className="text-white/20 mx-0.5">/</span>{cruiseStats.children}</p>
                    <p className="text-[0.5rem] font-bold text-white/30 uppercase tracking-widest mt-0.5">Adult / Child</p>
                  </div>
                </div>

                {/* Recent Signups */}
                {(cruiseStats.recentSignups?.length ?? 0) > 0 && (
                  <div>
                    <p className="text-[0.55rem] font-bold text-white/30 uppercase tracking-widest mb-2">Recent Signups</p>
                    <div className="max-h-[220px] overflow-y-auto scrollbar-hide space-y-1.5">
                      {(cruiseStats.recentSignups || []).map((s, i) => (
                        <div key={i} className="flex items-center gap-3 bg-black/20 px-3 py-2.5 rounded-lg border border-white/5 hover:border-emerald-500/20 transition-all group/row">
                          <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[0.5rem] font-black text-emerald-400 shrink-0">
                            {s.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white truncate">{s.name}</p>
                            <p className="text-[0.55rem] text-white/30 truncate">{s.email}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-[0.55rem] text-white/20 font-mono">{s.phone || '—'}</p>
                            <p className="text-[0.5rem] text-white/15">{s.partySize > 1 ? `${s.partySize} guests` : '1 guest'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Download CSV */}
                <button onClick={async () => { const res = await fetch('/api/admin/cruise-export'); if (res.ok) { const blob = await res.blob(); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = '7th-heaven-cruise-roster.csv'; a.click(); } }} className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-[0.65rem] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-[0_4px_15px_rgba(16,185,129,0.25)] border border-emerald-400/30 flex items-center justify-center gap-2 mt-auto">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                  Download Full CSV
                </button>
                <p className="text-[0.5rem] text-white/20 text-center -mt-2">Includes names, emails, phone numbers, guest details</p>
              </div>
            </div>
          </div>
        </div>

        {/* === CRUISE COMMUNITY BLAST === */}
        <div id="admin-sec-cruise-blast" className="mb-14 relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-teal-400 flex items-center justify-center shadow-lg shadow-cyan-500/20 p-[1px]">
              <div className="w-full h-full bg-[#050508] rounded-full flex items-center justify-center">
                <span className="text-lg">📡</span>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-black italic tracking-wide text-white uppercase">Cruise Community Blast</h2>
              <p className="text-[0.65rem] font-bold text-white/40 uppercase tracking-widest">Send an email update to all cruise signups</p>
            </div>
          </div>

          <div className="relative z-10 bg-[#0a0a0f]/80 backdrop-blur-xl border border-white/5 hover:border-cyan-500/20 rounded-2xl p-6 md:p-8 transition-all duration-500 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            <div className="relative z-10 flex flex-col gap-5">

              {cruiseBlastResult && (
                <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[0.6rem] font-bold uppercase tracking-widest animate-[slideIn_0.3s_ease-out] backdrop-blur-md ${cruiseBlastResult.success ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                  {cruiseBlastResult.message}
                </div>
              )}

              <div>
                <label className="text-[0.6rem] font-bold text-white/40 uppercase tracking-widest block mb-2">Subject Line</label>
                <input
                  type="text"
                  value={cruiseBlastSubject}
                  onChange={e => setCruiseBlastSubject(e.target.value)}
                  placeholder="🚢 Cruise Update: Big news for the community!"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-cyan-500/60 transition-all placeholder:text-white/15"
                />
              </div>

              <div>
                <label className="text-[0.6rem] font-bold text-white/40 uppercase tracking-widest block mb-2">Message Body (HTML supported)</label>
                <div className="w-full text-black [&_.ql-editor]:min-h-[200px] relative z-20">
                  <ReactQuill
                    theme="snow"
                    value={cruiseBlastBody}
                    onChange={setCruiseBlastBody}
                    placeholder="Write your cruise community update here..."
                    className="bg-white rounded-xl overflow-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 mt-2">
                <p className="text-[0.6rem] text-white/30 leading-relaxed">
                  This will send to <strong className="text-cyan-400">all cruise signups</strong> in the database. Make sure the content is ready.
                </p>
                <button
                  onClick={async () => {
                    if (!cruiseBlastSubject.trim() || !cruiseBlastBody.trim()) {
                      setCruiseBlastResult({ success: false, message: 'Subject and body are required' });
                      return;
                    }
                    if (!confirm(`Send this cruise update to ALL cruise signups? This cannot be undone.`)) return;
                    setCruiseBlastSending(true);
                    setCruiseBlastResult(null);
                    try {
                      const res = await fetch('/api/cruise/blast', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ subject: cruiseBlastSubject, body: cruiseBlastBody }),
                      });
                      const data = await res.json();
                      if (data.success) {
                        setCruiseBlastResult({ success: true, message: `✓ Sent to ${data.sent}/${data.total} cruise signups` });
                        setCruiseBlastSubject('');
                        setCruiseBlastBody('');
                      } else {
                        throw new Error(data.error || 'Blast failed');
                      }
                    } catch (err: any) {
                      setCruiseBlastResult({ success: false, message: `✕ ${err.message}` });
                    } finally {
                      setCruiseBlastSending(false);
                    }
                  }}
                  disabled={cruiseBlastSending}
                  className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white text-[0.65rem] font-black uppercase tracking-widest rounded-xl transition-all disabled:opacity-50 border border-cyan-400/30 shadow-[0_4px_15px_rgba(6,182,212,0.25)] shrink-0 cursor-pointer"
                >
                  {cruiseBlastSending ? 'Sending...' : '🚀 Send Blast'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* === ITINERARY BUILDER === */}
        <div className="mb-14 relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center shadow-lg shadow-amber-500/20 p-[1px]">
              <div className="w-full h-full bg-[#050508] rounded-full flex items-center justify-center">
                <span className="text-lg">⚓</span>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-black italic tracking-wide text-white uppercase">Cruise Itinerary Builder</h2>
              <p className="text-[0.65rem] font-bold text-white/40 uppercase tracking-widest">Manage passenger dashboard daily schedules</p>
            </div>
          </div>

          <div className="bg-[#0a0a0f]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-6 md:p-8 relative">
            <div className="flex flex-wrap gap-4 items-center justify-between mb-8 pb-6 border-b border-white/5">
              <button onClick={() => setItinerary([...itinerary, { id: 'day' + Date.now(), dayLabel: 'Day ' + (itinerary.length + 1), location: 'Port', theme: 'Theme', events: [], colorTheme: 'var(--color-accent)' }])} className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white text-[0.65rem] font-bold uppercase tracking-widest rounded-lg transition-all border border-white/10 flex items-center gap-2">
                <span>+ Add Day</span>
              </button>
              <button onClick={() => updateItinerary(itinerary)} disabled={itineraryUpdating} className="px-6 py-3 bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/90 text-white text-[0.65rem] font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_4px_15px_rgba(133,29,239,0.3)] disabled:opacity-50 border border-[var(--color-accent)]/30">
                {itineraryUpdating ? 'Saving...' : '💾 Save Itinerary Live'}
              </button>
            </div>
            {itinerarySaveStatus && (
              <div className={`mb-6 flex items-center gap-2 px-4 py-3 rounded-xl text-[0.65rem] font-bold uppercase tracking-widest animate-[slideIn_0.3s_ease-out] ${itinerarySaveStatus === 'saved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                {itinerarySaveStatus === 'saved' ? '✓ Itinerary updated — live on cruise dashboard' : '✕ Failed to update — try again'}
              </div>
            )}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {itinerary.map((day, dayIndex) => (
                <div key={day.id} className="bg-black/40 border border-white/10 rounded-xl p-5 md:p-6 relative group transition-all hover:border-white/20">
                  <button onClick={() => setItinerary(itinerary.filter((_,i) => i !== dayIndex))} className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/20 opacity-0 group-hover:opacity-100 transition-all text-xs">✕</button>
                  <div className="flex flex-col gap-3 mb-4">
                    <input type="text" value={day.dayLabel} onChange={e => { const n=[...itinerary]; n[dayIndex].dayLabel=e.target.value; setItinerary(n); }} className="bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm font-bold text-white outline-none focus:border-[var(--color-accent)]/50 transition-all" placeholder="Day 1" />
                    <div className="flex gap-2">
                      <input type="text" value={day.location} onChange={e => { const n=[...itinerary]; n[dayIndex].location=e.target.value; setItinerary(n); }} className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/70 outline-none focus:border-[var(--color-accent)]/50 transition-all" placeholder="Location" />
                      <input type="text" value={day.theme} onChange={e => { const n=[...itinerary]; n[dayIndex].theme=e.target.value; setItinerary(n); }} className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/70 outline-none focus:border-[var(--color-accent)]/50 transition-all" placeholder="Theme" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {day.events.map((evt: any, evtIndex: number) => (
                      <div key={evtIndex} className="flex gap-2 items-center bg-black/20 p-2 rounded-lg border border-white/5">
                        <input type="text" value={evt.time} onChange={e => { const n=[...itinerary]; n[dayIndex].events[evtIndex].time=e.target.value; setItinerary(n); }} className="w-20 bg-black/30 border border-white/10 rounded px-2 py-1.5 text-[0.7rem] text-white/60 outline-none" placeholder="9:00 AM" />
                        <input type="text" value={evt.title} onChange={e => { const n=[...itinerary]; n[dayIndex].events[evtIndex].title=e.target.value; setItinerary(n); }} className="flex-1 bg-black/30 border border-white/10 rounded px-2 py-1.5 text-[0.7rem] text-white outline-none" placeholder="Event name" />
                        <input type="text" value={evt.icon || ''} onChange={e => { const n=[...itinerary]; (n[dayIndex].events[evtIndex] as any).icon=e.target.value; setItinerary(n); }} className="w-12 bg-black/30 border border-white/10 rounded px-2 py-1.5 text-center text-[0.7rem] outline-none" placeholder="🎵" />
                        <button onClick={() => { const n=[...itinerary]; n[dayIndex].events.splice(evtIndex,1); setItinerary(n); }} className="w-7 h-7 flex items-center justify-center rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white text-xs transition-all shrink-0">✕</button>
                      </div>
                    ))}
                    <button onClick={() => { const n=[...itinerary]; n[dayIndex].events.push({ id: 'evt'+Date.now(), time: '', title: '', subtitle: '' } as any); setItinerary(n); }} className="w-full py-2 border border-dashed border-white/10 rounded-lg text-white/30 hover:text-white/60 hover:border-white/20 text-[0.65rem] font-bold uppercase tracking-widest transition-all">+ Add Event</button>
                  </div>
                </div>
              ))}
              {itinerary.length === 0 && (
                <div className="col-span-1 xl:col-span-2 py-12 text-center border border-dashed border-white/10 rounded-2xl bg-white/5">
                  <span className="text-4xl block mb-4 opacity-30">🗓️</span>
                  <p className="text-sm font-bold text-white/40 uppercase tracking-widest">No Itinerary Days configured</p>
                  <p className="text-xs text-white/20 mt-2">Click &quot;+ Add Day&quot; to start building the schedule.</p>
                </div>
              )}
            </div>
          </div>
        </div>
          </>
        )}

      {showSetPassword && (
        <CrewSetPasswordModal
          email={firstLoginEmail}
          onComplete={() => setShowSetPassword(false)}
        />
      )}
      </div>
    </div>
  );
}