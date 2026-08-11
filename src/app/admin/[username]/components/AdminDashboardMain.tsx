"use client";
/* eslint-disable react-doctor/no-giant-component */
/* oxlint-disable react-doctor/no-giant-component */
/* oxlint-disable react-doctor/nextjs-no-client-side-redirect */
/* eslint-disable react-doctor/nextjs-no-client-side-redirect */

import React from 'react';
import NextImage from 'next/image';

import { useState, useEffect, useRef, use, useMemo, useCallback, useSyncExternalStore } from "react";
const emptySubscribe = () => () => { };
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { createClient } from "@/lib/supabase/client";
import { useMember } from "@/context/MemberContext";
import Dropdown from "@/components/Dropdown";

import { adminKillStream, adminBanUser, seedMockData, adminCreateCrewMember, adminResetPassword, adminCreateAdmin } from "../../actions";
import { CrewSetPasswordModal } from "@/components/CrewSetPasswordModal";
import ShowCrewPanel from "@/components/ShowCrewPanel";
import dynamic from 'next/dynamic';
import QRCode from "react-qr-code";

const AdminMap = dynamic(() => import('@/components/AdminMap'), {
  ssr: false,
  loading: () => <div className="w-full h-[400px] bg-black/40 animate-pulse" />
});

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import { cleanWysiwygHtml } from "@/lib/wysiwyg-cleaner";
import { sanitizeHtml } from "@/lib/sanitize-html";

const STANDARD_ROLE_TAGS_SET = new Set(['AUDIO', 'FOH', 'MAIN SHOW', 'IEM', 'VIP', 'HOST', 'LIGHTS', 'PRODUCTION', 'RIGGING', 'MATINEE', 'MANAGEMENT', 'SETUP', 'MORNING', 'STAGE MGR', 'LOAD OUT', 'TEAR DOWN', 'MERCH', 'DMX', 'STAGE']);
import 'react-quill-new/dist/quill.snow.css';

import BulkInvitePanel from "@/components/admin/BulkInvitePanel";
import { Clock, CheckCircle2 } from "lucide-react";
import { CruiseLivePreview } from "./CruiseLivePreview";
import { AdminAuthGate } from "./AdminAuthGate";
import AwardPicksPanel from "@/components/admin/AwardPicksPanel";
import CustomScrollbar from "@/components/CustomScrollbar";
import { EmergencyBroadcastCenter } from "@/components/EmergencyBroadcastCenter";
import { SectionBadge } from "@/components/SectionBadge";
import { RoleEmailDirectory } from "@/components/admin/RoleEmailDirectory";
import { cruiseCommunityBlast, crewSmsDispatchedAlert } from "@/lib/email-templates";
import CruiseChat from "@/components/CruiseChat";

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

const STATIC_CREW = [
  { id: 'abbie', name: 'Abbie Janssen', role: 'STAGE MANAGER', maxHours: 40, avatar: 'https://ui-avatars.com/api/?name=Abbie+Janssen&background=f472b6&color=fff', email: 'abbie@7thheavenband.com', phone: '(555) 123-4567' },
  { id: 'al', name: 'Al Hollie', role: 'STAGE HAND', maxHours: 32, avatar: 'https://ui-avatars.com/api/?name=Al+Hollie&background=a78bfa&color=fff', email: 'al@7thheavenband.com', phone: '(555) 234-5678' },
  { id: 'andrea', name: 'Andrea Kinzinger', role: 'TOUR MANAGER', maxHours: 40, avatar: 'https://ui-avatars.com/api/?name=Andrea+Kinzinger&background=60a5fa&color=fff', email: 'andrea@7thheavenband.com', phone: '(555) 345-6789' },
  { id: 'arjun', name: 'Arjun Patel', role: 'SOUND ENGINEER', maxHours: 32, avatar: 'https://ui-avatars.com/api/?name=Arjun+Patel&background=34d399&color=fff', email: 'arjun@7thheavenband.com', phone: '(555) 456-7890' },
  { id: 'chris', name: 'Chris Loxely', role: 'LIGHTS', maxHours: 40, avatar: 'https://ui-avatars.com/api/?name=Chris+Loxely&background=fbbf24&color=fff', email: 'chris@7thheavenband.com', phone: '(555) 567-8901' },
  { id: 'daniel', name: 'Daniel Kim', role: 'TOUR MANAGER', maxHours: 40, avatar: 'https://ui-avatars.com/api/?name=Daniel+Kim&background=f87171&color=fff', email: 'daniel@7thheavenband.com', phone: '(555) 678-9012' },
  { id: 'dave_croke', name: 'Dave Croke', role: 'EQUIPMENT SETUP', maxHours: 32, avatar: 'https://ui-avatars.com/api/?name=Dave+Croke&background=8b5cf6&color=fff', email: 'dave_c@7thheavenband.com', phone: '(555) 789-0123' },
  { id: 'dave_maas', name: 'Dave Maas', role: 'TEAR DOWN', maxHours: 24, avatar: 'https://ui-avatars.com/api/?name=Dave+Maas&background=ec4899&color=fff', email: 'dave_m@7thheavenband.com', phone: '(555) 890-1234' },
  { id: 'david_xu', name: 'David Xu', role: 'STAGE HAND', maxHours: 40, avatar: 'https://ui-avatars.com/api/?name=David+Xu&background=3b82f6&color=fff', email: 'david@7thheavenband.com', phone: '(555) 901-2345' },
  { id: 'emily', name: 'Emily Hafften', role: 'MERCH', maxHours: 32, avatar: 'https://ui-avatars.com/api/?name=Emily+Hafften&background=10b981&color=fff', email: 'emily@7thheavenband.com', phone: '(555) 012-3456' },
  { id: 'emma', name: 'Emma Smid', role: 'PHOTOGRAPHER', maxHours: 40, avatar: 'https://ui-avatars.com/api/?name=Emma+Smid&background=f59e0b&color=fff', email: 'emma@7thheavenband.com', phone: '(555) 123-9876' },
  { id: 'erin', name: 'Erin Eagan', role: 'EVENT SUPPORT', maxHours: 40, avatar: 'https://ui-avatars.com/api/?name=Erin+Eagan&background=8a1cfc&color=fff', email: 'erin@7thheavenband.com', phone: '(555) 234-8765' },
  { id: 'francesca', name: 'Francesca Troast', role: 'STAGE HAND', maxHours: 40, avatar: 'https://ui-avatars.com/api/?name=Francesca+Troast&background=ec4899&color=fff', email: 'francesca@7thheavenband.com', phone: '(555) 345-7654' },
  { id: 'mary', name: 'Mary Grivas', role: 'ADMIN', maxHours: 40, avatar: 'https://ui-avatars.com/api/?name=Mary+Grivas&background=f59e0b&color=fff', email: 'Marygrivas65@icloud.com', phone: '(630) 688-1725' },
  { id: 'michael', name: 'Michael Scimeca', role: 'AUDIO MIX', maxHours: 40, avatar: 'https://ui-avatars.com/api/?name=Michael+Scimeca&background=8a1cfc&color=fff', email: 'michael@7thheavenband.com', phone: '(555) 456-6543' },
  { id: 'sammy', name: 'Sammy D', role: 'BAND MEMBER', maxHours: 40, avatar: 'https://ui-avatars.com/api/?name=Sammy+D&background=ec4899&color=fff', email: 'sammy@7thheavenband.com', phone: '(555) 567-5432' },
  { id: 'ryan', name: 'Ryan K', role: 'STAGE HAND', maxHours: 32, avatar: 'https://ui-avatars.com/api/?name=Ryan+K&background=0ea5e9&color=fff', email: 'ryan@7thheavenband.com', phone: '(555) 678-4321' },
  { id: 'tony', name: 'Tony M', role: 'EQUIPMENT SETUP', maxHours: 40, avatar: 'https://ui-avatars.com/api/?name=Tony+M&background=10b981&color=fff', email: 'tony@7thheavenband.com', phone: '(555) 789-3210' },
  { id: 'marcus', name: 'Marcus Vance', role: 'TEAR DOWN', maxHours: 40, avatar: 'https://ui-avatars.com/api/?name=Marcus+Vance&background=f97316&color=fff', email: 'marcus@7thheavenband.com', phone: '(555) 890-1235' },
  { id: 'colin', name: 'Colin Farrell', role: 'CAMERA', maxHours: 40, avatar: 'https://ui-avatars.com/api/?name=Colin+Farrell&background=ec4899&color=fff', email: 'colin@7thheavenband.com', phone: '(555) 321-4321' }
];

const getAvatarColor = (name: string) => {
  const colors = ['#f472b6', '#a78bfa', '#60a5fa', '#34d399', '#c084fc', '#f87171', '#8b5cf6', '#ec4899'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

const CrewAvatar = React.memo(({ member }: { member: any }) => {
  const name = member?.name || 'Crew';
  const initials = member?.initials || name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  const color = member?.color || getAvatarColor(name);

  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center font-black text-xs shrink-0 shadow-sm text-white select-none border border-white/10"
      style={{ backgroundColor: color, color: '#ffffff' }}
    >
      {initials}
    </div>
  );
});
CrewAvatar.displayName = 'CrewAvatar';

const SidebarDateButton = React.memo(({
  show,
  isSelected,
  isActiveWeek,
  shiftCount,
  onClick
}: {
  show: any;
  isSelected: boolean;
  isActiveWeek: boolean;
  shiftCount: number;
  onClick: (date: string) => void;
}) => {
  return (
    <button
      type="button"
      onClick={() => show.date && onClick(show.date)}
      className={`w-full text-left px-2 py-1.5 flex items-center gap-2 cursor-pointer transition-colors duration-150 group ${isSelected
        ? 'bg-purple-500/15 ring-1 ring-amber-500/30 rounded-md border-b-transparent'
        : isActiveWeek
          ? 'bg-white/[0.04]'
          : 'bg-transparent hover:bg-white/[0.03]'
        }`}
    >
      <div className="flex flex-col items-center min-w-[32px] shrink-0">
        <span className="text-[7.5px] font-extrabold text-white/40 uppercase tracking-tight">{show.dayLabel}</span>
        <span className={`text-[9.5px] font-black tracking-tight ${isSelected ? 'text-purple-300' : isActiveWeek ? 'text-white/70' : 'text-white/50'}`}>{show.dateLabel}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-[10px] font-extrabold truncate leading-tight ${isSelected ? 'text-white' : isActiveWeek ? 'text-white/90' : 'text-white/70'}`}>
          {show.venue || show.venue_name}
        </p>
        {show.city && (
          <p className="text-[8.5px] text-white/30 truncate leading-tight">{show.city}{show.state ? `, ${show.state}` : ''}</p>
        )}
      </div>
      {shiftCount > 0 && (
        <div className="relative group/badge shrink-0">
          <span className="text-[8px] font-black bg-emerald-500/15 text-[var(--color-accent)]/80 px-1.5 py-0.5 rounded cursor-help">
            {shiftCount}
          </span>
          {/* Tooltip */}
          <div className="absolute right-0 bottom-full mb-1.5 opacity-0 invisible group-hover/badge:opacity-100 group-hover/badge:visible transition-colors duration-150 bg-[#1c1d22] text-white text-[9px] font-bold py-1 px-2 rounded border border-slate-700/50 shadow-xl whitespace-nowrap z-50 pointer-events-none flex items-center gap-1">
            <span>ℹ</span>
            <span>{shiftCount} active {shiftCount === 1 ? 'shift' : 'shifts'} scheduled</span>
          </div>
        </div>
      )}
    </button>
  );
});
SidebarDateButton.displayName = 'SidebarDateButton';

function compressImage(file: File, maxWidth = 300, maxHeight = 300): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}


interface DutyRoleEditorPopoverProps {
  memberName: string;
  editKey: string;
  editingDutyValue: string;
  setEditingDutyValue: (value: string) => void;
  handleSaveDuty: (memberId: string) => void;
  savingDuty: boolean;
  setEditingDutyMemberId: (id: string | null) => void;
  presetRoles: string[];
  memberId: string;
}

function DutyRoleEditorPopover({
  memberName,
  editKey,
  editingDutyValue,
  setEditingDutyValue,
  handleSaveDuty,
  savingDuty,
  setEditingDutyMemberId,
  presetRoles,
  memberId,
}: DutyRoleEditorPopoverProps) {
  return (
    <div
      className="absolute right-0 top-full mt-1.5 p-3 bg-white border border-slate-300 space-y-2.5 w-[280px] text-black border-solid z-50 animate-[scaleIn_0.15s_ease-out]"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="truncate pr-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-900 block truncate">Edit Roles</span>
          <span className="text-[9px] font-bold text-slate-500 block truncate">{memberName}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleSaveDuty(memberId);
            }}
            disabled={savingDuty}
            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] rounded cursor-pointer border-none shadow-xs uppercase tracking-wider"
          >
            Save
          </button>
          <button
            type="button"
            aria-label="Cancel editing duty member"
            onClick={(e) => {
              e.stopPropagation();
              setEditingDutyMemberId(null);
            }}
            className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[10px] rounded cursor-pointer border-none"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Quick-Select Chips (All Roles) */}
      <div>
        <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">Quick Toggle Presets:</span>
        <div className="flex flex-wrap gap-1 max-h-[180px] overflow-y-auto custom-scrollbar p-1.5 bg-slate-50 border border-slate-200 rounded-lg">
          {Array.from(new Set([...(presetRoles || []), 'STAGE HAND', 'MERCH', 'MOVING EQUIPMENT', 'TEAR DOWN', 'VIP HOST', 'MC', 'BAND MEMBER', 'AUDIO MIX', 'EQUIPMENT SETUP', 'LIGHTS', 'SERVER', 'EVENT SUPPORT', 'SOUND ENGINEER', 'TOUR MANAGER', 'CHEF', 'DRIVER', 'SECURITY', 'PHOTOGRAPHER', 'CREW'])).map((chip) => {
            const currentList = editingDutyValue.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
            const isSelected = currentList.includes(chip.toUpperCase());
            return (
              <button
                key={chip}
                type="button"
                onClick={() => {
                  let updated: string[];
                  if (isSelected) {
                    updated = currentList.filter(c => c !== chip.toUpperCase());
                  } else {
                    updated = [...currentList, chip.toUpperCase()];
                  }
                  setEditingDutyValue(updated.join(', '));
                }}
                className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider transition-colors cursor-pointer border ${isSelected
                  ? 'bg-purple-600 border-purple-600 text-white shadow-xs'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-slate-400'
                  }`}
              >
                {isSelected ? ` ${chip}` : `+ ${chip}`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom role input */}
      <div className="pt-1.5 border-t border-slate-200 space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500">Custom / Edit Text:</span>
          {editingDutyValue && (
            <button
              type="button"
              onClick={() => setEditingDutyValue('')}
              className="text-[9px] font-bold text-rose-600 hover:text-rose-800 border-none bg-transparent cursor-pointer"
            >
              Clear Roles
            </button>
          )}
        </div>
        <input
          type="text"
          aria-label="Custom duty roles"
          value={editingDutyValue}
          onChange={(e) => setEditingDutyValue(e.target.value)}
          placeholder="e.g. STAGE HAND, MERCH..."
          style={{ backgroundColor: '#ffffff', color: '#000000' }}
          className="w-full bg-white! text-black! border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold placeholder-slate-400 focus:outline-none focus:border-purple-500 shadow-xs"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSaveDuty(memberId);
            }
          }}
        />
      </div>
    </div>
  );
}

const STATIC_BAND = [
  { id: 'adam', name: 'Adam Heisler', role: 'Lead Vocals • Guitars • Bass', phone: '(555) 301-4411', email: 'adam@7thheavenband.com', avatar: 'https://ui-avatars.com/api/?name=Adam+Heisler&background=851DEF&color=fff' },
  { id: 'rich', name: 'Richard Hofherr', role: 'Guitars • Keys • Vocals', phone: '(555) 301-4422', email: 'rich@7thheavenband.com', avatar: 'https://ui-avatars.com/api/?name=Richard+Hofherr&background=3b82f6&color=fff' },
  { id: 'nick', name: 'Nick Cox', role: 'Guitars • Vocals', phone: '(555) 301-4433', email: 'nick@7thheavenband.com', avatar: 'https://ui-avatars.com/api/?name=Nick+Cox&background=06b6d4&color=fff' },
  { id: 'mark', name: 'Mark Kennetz', role: 'Bass • Vocals', phone: '(555) 301-4444', email: 'mark@7thheavenband.com', avatar: 'https://ui-avatars.com/api/?name=Mark+Kennetz&background=851DEF&color=fff' },
  { id: 'frankie', name: 'Frankie Harchut', role: 'Drums', phone: '(555) 301-4455', email: 'frankie@7thheavenband.com', avatar: 'https://ui-avatars.com/api/?name=Frankie+Harchut&background=3b82f6&color=fff' }
];

const DEFAULT_SECTION_ORDER = [
  'bookings',
  'planners',
  'crewsms',
  'bandsms',
  'calendar',
  'livealerts',
  'analytics',
  'announcements',
  'photomod',
  'smsblast',
  'newsletter',
  'emailflow',
  'registry',
  'crewcreation',
  'admincreation',
  'bulkinvites',
  'shopify'
];

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

const formatHour = (hourDecimal: number) => {
  const h = Math.floor(hourDecimal);
  const m = Math.round((hourDecimal - h) * 60);
  const period = h >= 12 ? 'PM' : 'AM';
  let displayHour = h % 12;
  if (displayHour === 0) displayHour = 12;
  const displayMinute = m === 0 ? '' : `:${String(m).padStart(2, '0')}`;
  return `${displayHour}${displayMinute} ${period}`;
};

const formatTimeFrame = (start: number, end: number) => {
  return `${formatHour(start)} - ${formatHour(end)}`;
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

const normalizePhoneNumber = (phone: string | null | undefined) => {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  return digits.startsWith('1') && digits.length === 11 ? digits.slice(1) : digits;
};

const formatPhoneForDisplay = (phone: string | null | undefined) => {
  if (!phone) return '(No phone)';
  const digits = phone.replace(/\D/g, '');
  const clean = digits.startsWith('1') && digits.length === 11 ? digits.slice(1) : digits;
  if (clean.length === 10) {
    return `${clean.slice(0, 3)}-${clean.slice(3, 6)}-${clean.slice(6)}`;
  }
  return phone;
};

const resolveMemberAvatar = (name: string, avatar?: string | null): string => {
  const lower = (name || '').toLowerCase();

  if (lower.includes('adam') && lower.includes('heisler')) return '/images/band-memebers/Adam.png';
  if (lower.includes('adam')) return '/images/members/adam.png';

  if (lower.includes('nick') && lower.includes('cox')) return '/images/band-memebers/Nick.png';
  if (lower.includes('nick')) return '/images/members/nick.png';

  if (lower.includes('mark') && lower.includes('kennetz')) return '/images/band-memebers/Mark.png';
  if (lower.includes('mark')) return '/images/members/mark.png';

  if (lower.includes('frankie') || lower.includes('harchut')) return '/images/band-memebers/Frankie.png';

  if (lower.includes('richard') || lower.includes('hofherr') || lower.includes('dicky')) return '/images/band-memebers/Dicky.png';

  if (lower.includes('michael') || lower.includes('scimeca')) return '/images/crew/al.png';

  if (lower.includes('abbie')) return '/images/crew/abbie.png';
  if (lower.includes('al') && lower.includes('hollie')) return '/images/crew/al.png';
  if (lower.includes('andrea')) return '/images/crew/andrea.png';
  if (lower.includes('arjun')) return '/images/crew/arjun.png';
  if (lower.includes('chris')) return '/images/crew/chris.png';
  if (lower.includes('daniel')) return '/images/crew/daniel.png';
  if (lower.includes('croke')) return '/images/crew/dave_croke.png';
  if (lower.includes('maas')) return '/images/crew/dave_maas.png';
  if (lower.includes('xu')) return '/images/crew/david_xu.png';
  if (lower.includes('emily')) return '/images/crew/emily.png';
  if (lower.includes('emma')) return '/images/crew/emma.png';
  if (lower.includes('erin')) return '/images/crew/erin.png';
  if (lower.includes('francesca')) return '/images/crew/francesca.png';
  if (lower.includes('john')) return '/images/crew/john_doe.png';

  if (avatar && !avatar.includes('ui-avatars.com') && avatar.trim().length > 0) {
    return avatar;
  }

  return '';
};

// eslint-disable-next-line react-doctor/prefer-useReducer
export function AdminDashboardMain({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const { member, isLoggedIn, login, logout, openModal, updateAvatar } = useMember();
  const router = useRouter();

  const adminPhotoInputRef = useRef<HTMLInputElement>(null);
  const bandAlertSendingRef = useRef(false);
  const bookingUpdatingRef = useRef(false);
  const smsSendingRef = useRef(false);
  const crewAlertSendingRef = useRef(false);
  const blastSendingRef = useRef(false);
  const cruiseEmailSendingRef = useRef(false);
  const adminGuidelinesUpdatingRef = useRef(false);
  const cruiseUpdatingRef = useRef(false);
  const [adminAvatarUploading, setAdminAvatarUploading] = useState(false);
  const [adminAvatarOverride, setAdminAvatarOverride] = useState<string | null>(null);

  const isMaryRoute = username.toLowerCase().includes('mary');
  const m = member as any;
  const effectiveAdmin = m || (isMaryRoute ? {
    name: 'Mary Grivas',
    role: 'admin',
    email: 'Marygrivas65@icloud.com',
    phone: '(630) 688-1725',
    username: 'marygrivas',
    avatar: 'https://ui-avatars.com/api/?name=Mary+Grivas&background=f59e0b&color=fff'
  } : {
    name: m?.name || 'Michael Scimeca',
    role: m?.role || 'crew',
    email: m?.email || 'michael@7thheaven.com',
    phone: '(847) 551-5363',
    username: m?.username || 'michael',
    avatar: m?.avatar
  });

  const [localAvatar, setLocalAvatar] = useState<string | null>(null);
  const [updatingBookingId, setUpdatingBookingId] = useState<string | null>(null);
  const [thisMondayTime, setThisMondayTime] = useState<number | null>(null);

  useEffect(() => {
    setLocalAvatar(localStorage.getItem("7h_profile_avatar_v1") || localStorage.getItem("7h_profile_avatar"));
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    setThisMondayTime(new Date(today.getFullYear(), today.getMonth(), diff, 0, 0, 0, 0).getTime());
  }, []);

  const activeAdminAvatar = adminAvatarOverride || effectiveAdmin.avatar || member?.avatar || localAvatar;
  const isAvatarUrl = activeAdminAvatar && (activeAdminAvatar.startsWith("http") || activeAdminAvatar.startsWith("/") || activeAdminAvatar.startsWith("data:"));

  // Master admin = role is 'admin' in Supabase profiles — no hardcoded email needed
  const isMasterAdmin = effectiveAdmin.role === 'admin';

  const [adminPermissions, setAdminPermissions] = useState<Record<string, Record<string, boolean>>>({
    'marygrivas65@icloud.com': {
      cruise_admin: true,
      cruise_chat: true,
      schedule: false,
      crew_roster: false,
      email_blasts: false,
      site_settings: false,
    }
  });

  const [savePermStatus, setSavePermStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const loadPermissions = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/permissions');
      if (res.ok) {
        const d = await res.json();
        if (d?.permissions) setAdminPermissions(d.permissions);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  const savePermissionsToBackend = async (updated: Record<string, Record<string, boolean>>) => {
    setAdminPermissions(updated);
    setSavePermStatus('saving');
    try {
      const res = await fetch('/api/admin/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions: updated })
      });
      if (res.ok) {
        setSavePermStatus('saved');
        setTimeout(() => setSavePermStatus('idle'), 3000);
      } else {
        setSavePermStatus('idle');
      }
    } catch (e) {
      console.error(e);
      setSavePermStatus('idle');
    }
  };

  const hasPermission = (permKey: string) => {
    if (isMasterAdmin) return true;
    const userPerms = adminPermissions[effectiveAdmin.email.toLowerCase()] || adminPermissions['marygrivas65@icloud.com'];
    return userPerms ? !!userPerms[permKey] : false;
  };


  // Redirect if username in URL doesn't match logged-in user's username
  useEffect(() => {
    if (isLoggedIn && member?.role === 'admin' && member.username && member.username !== username && !isMaryRoute) {
      router.replace(`/admin/${member.username}`);
    }
  }, [isLoggedIn, member, username, isMaryRoute, router]);
  const [feeds, setFeeds] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [filterRole, setFilterRole] = useState<"All" | "fan" | "crew" | "admin">("All");
  const [moderationQueue, setModerationQueue] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loadInInputs, setLoadInInputs] = useState<Record<string, string>>({});
  const [loadInSaving, setLoadInSaving] = useState<Record<string, boolean>>({});
  const [loadInNotice, setLoadInNotice] = useState<Record<string, string>>({});
  const [editingInlineLoadInId, setEditingInlineLoadInId] = useState<string | null>(null);

  const handleUpdateLoadInTime = async (bookingId: string, currentEmail: string) => {
    const newTime = loadInInputs[bookingId]?.trim();
    if (!newTime) return;
    setLoadInSaving(prev => ({ ...prev, [bookingId]: true }));
    try {
      const res = await fetch('/api/booking', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          loadInTime: newTime,
          notifyPlannerLoadIn: true
        })
      });
      if (res.ok) {
        setBookings((prev: any[]) => prev.map((bk: any) => bk.bookingId === bookingId ? { ...bk, loadInTime: newTime, load_in_time: newTime } : bk));
        setLoadInNotice(prev => ({ ...prev, [bookingId]: `✓ Official load-in set to "${newTime}". Confirmation email sent to ${currentEmail}!` }));
        setTimeout(() => setLoadInNotice(prev => ({ ...prev, [bookingId]: "" })), 5000);
      }
    } catch (err) {
      console.error("Failed to update load-in time:", err);
    } finally {
      setLoadInSaving(prev => ({ ...prev, [bookingId]: false }));
    }
  };
  const [isLoading, setIsLoading] = useState(true);
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  const staticCrew = STATIC_CREW;

  const staticBand = STATIC_BAND;

  // Simulated Orders, Toast, and Tab States
  const [simulatedOrders, setSimulatedOrders] = useState<any[]>([]);
  const [shopifyTab, setShopifyTab] = useState<'shopify' | 'simulated'>('shopify');
  const [activeToast, setActiveToast] = useState<{ message: string; title: string; type: 'success' | 'info' } | null>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (activeToast) {
      const timer = setTimeout(() => setActiveToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [activeToast]);

  // Load simulated orders from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
      const stored = localStorage.getItem('admin_orders_list_v1') || localStorage.getItem('admin_orders_list');
      if (stored) {
        setSimulatedOrders(JSON.parse(stored));
      } else {
        const initialMock = [
          {
            id: 172088800001,
            customer: "Michael Scimeca",
            email: "mikeyscimeca@gmail.com",
            address: "123 Chicago Ave",
            city: "Chicago",
            zip: "60611",
            item: "7th Heaven Hoodie",
            price: "$45.00",
            size: "L",
            color: "Black",
            method: "shipping",
            source: "Flash Drop",
            status: "Pending",
            image: "/images/merch/hoodie.png",
            ts: Date.now() - 3600000 * 2
          },
          {
            id: 172088800002,
            customer: "Sarah Jenkins",
            email: "sarahj@example.com",
            address: "",
            city: "",
            zip: "",
            item: "7th Heaven Tour Tee 2026",
            price: "$35.00",
            size: "M",
            color: "White",
            method: "merch_table",
            source: "Store",
            status: "Ready for Pickup",
            image: "/images/merch/logo-tee.png",
            ts: Date.now() - 3600000 * 5
          }
        ];
        localStorage.setItem('admin_orders_list_v1', JSON.stringify(initialMock));
        setSimulatedOrders(initialMock);
      }
    }
  }, []);

  // Listen to BroadcastChannel for simulated orders
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const bc = new BroadcastChannel('7h_live_michael');
    bc.onmessage = (evt) => {
      const { type, payload } = evt.data ?? {};
      if (type === 'ORDER_CREATED' && payload) {
        setSimulatedOrders(prev => {
          if (prev.find(o => o.id === payload.id)) return prev;
          return [payload, ...prev];
        });

        // Play notification chime sound
        try {
          const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-500.wav");
          audio.volume = 0.4;
          audio.play();
        } catch { }

        // Show toast
        setActiveToast({
          title: ' New Order Received',
          message: `${payload.customer} purchased ${payload.item}${payload.size ? ` (${payload.size})` : ''} via ${payload.source}!`,
          type: 'success'
        });
      }
    };
    return () => bc.close();
  }, []);

  // Update status and tracking of simulated orders
  const handleUpdateSimulatedOrderStatus = (orderId: number, nextStatus: string) => {
    setSimulatedOrders(prev => {
      return prev.map(o => {
        if (o.id === orderId) {
          const updatedOrder = { ...o, status: nextStatus };
          if (nextStatus === 'Shipped') {
            updatedOrder.trackingNumber = `USPS-7H-${Math.floor(10000000 + Math.random() * 90000000)}`;
          }
          return updatedOrder;
        }
        return o;
      });
    });

    setActiveToast({
      title: 'Fulfillment Updated',
      message: `Order status updated to ${nextStatus}`,
      type: 'success'
    });
  };

  const [adminTab, setAdminTab] = useState<'band' | 'cruise'>('band');
  const adminTabRef = useRef<'band' | 'cruise'>('band');
  const [unreadCruiseChat, setUnreadCruiseChat] = useState(0);
  const [cruiseSelectedEmails, setCruiseSelectedEmails] = useState<string[]>([]);
  const [cruiseEmailOpen, setCruiseEmailOpen] = useState(false);
  const [cruiseEmailSubject, setCruiseEmailSubject] = useState('');
  const [cruiseEmailBody, setCruiseEmailBody] = useState('');
  const [cruiseEmailSending, setCruiseEmailSending] = useState(false);
  const [cruiseEmailResult, setCruiseEmailResult] = useState<any>(null);
  const [showSetPassword, setShowSetPassword] = useState(false);
  const [firstLoginEmail, setFirstLoginEmail] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminUsername, setNewAdminUsername] = useState('');
  const [sidebarMode, setSidebarMode] = useState<'jump' | 'organize'>('jump');
  const [createdAdmin, setCreatedAdmin] = useState<{ name: string; email: string; password: string } | null>(null);
  const [adminCreateError, setAdminCreateError] = useState('');
  const [adminCreateLoading, setAdminCreateLoading] = useState(false);
  const [openInfoSection, setOpenInfoSection] = useState<string | null>(null);

  const [showJumpNav, setShowJumpNav] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('7h_show_jump_nav_v1') || localStorage.getItem('7h_show_jump_nav');
    if (saved === 'false') setShowJumpNav(false);
  }, []);

  const toggleJumpNav = () => {
    setShowJumpNav(prev => !prev);
    try { localStorage.setItem('7h_show_jump_nav_v1', String(!showJumpNav)); } catch { }
  };

  const customRolesRef = useRef<string[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const defaultPresets = ["CAMERA", "BAND EQUIPMENT", "UNLOADING", "SERVER", "CHEF", "LINE COOK", "MANAGER", "AUDIO MIX"];
      const saved = localStorage.getItem('7h_custom_roles_v1') || localStorage.getItem('7h_custom_roles');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const migrated = localStorage.getItem('7h_roles_migrated_v2');
          if (!migrated) {
            const merged = Array.from(new Set([...defaultPresets, ...parsed]));
            customRolesRef.current = merged;
            localStorage.setItem('7h_custom_roles_v1', JSON.stringify(merged));
            localStorage.setItem('7h_roles_migrated_v2', 'true');
          } else {
            customRolesRef.current = parsed;
          }
        } catch (e) {
          customRolesRef.current = defaultPresets;
          localStorage.setItem('7h_custom_roles_v1', JSON.stringify(defaultPresets));
          localStorage.setItem('7h_roles_migrated_v2', 'true');
        }
      } else {
        customRolesRef.current = defaultPresets;
        localStorage.setItem('7h_custom_roles_v1', JSON.stringify(defaultPresets));
        localStorage.setItem('7h_roles_migrated_v2', 'true');
      }
    }
  }, []);

  const saveCustomRole = (role: string) => {
    const trimmed = role.trim().toUpperCase();
    if (!trimmed || customRolesRef.current.includes(trimmed)) return;
    const next = [...customRolesRef.current, trimmed];
    customRolesRef.current = next;
    try { localStorage.setItem('7h_custom_roles_v1', JSON.stringify(next)); } catch { }
  };

  const deleteCustomRole = (role: string) => {
    const next = customRolesRef.current.filter(r => r !== role);
    customRolesRef.current = next;
    try { localStorage.setItem('7h_custom_roles_v1', JSON.stringify(next)); } catch { }
  };



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

  const syncTourDatesToCalendar = useCallback((tourList: any[], currentSchedules: any[]) => {
    if (!tourList || tourList.length === 0) return;

    let updated = [...currentSchedules];
    let changed = false;

    tourList.forEach((show: any) => {
      const showDate = show.date;
      if (!showDate) return;

      const hasShifts = updated.some(s => s.date === showDate);
      if (!hasShifts) {
        const defaultRoles = [
          { role: 'EQUIPMENT SETUP', startHour: 16.0, endHour: 22.0, time: '4:00 PM - 10:00 PM' },
          { role: 'TEAR DOWN', startHour: 15.0, endHour: 20.0, time: '3:00 PM - 8:00 PM' },
          { role: 'CAMERA', startHour: 18.0, endHour: 23.0, time: '6:00 PM - 11:00 PM' },
          { role: 'AUDIO MIX', startHour: 17.0, endHour: 23.0, time: '5:00 PM - 11:00 PM' }
        ];

        const venueName = show.venue || show.venue_name || 'Show Venue';
        const cityStr = show.city ? `${show.city}, ${show.state || 'IL'}` : '';
        const loc = cityStr ? `${venueName} at ${cityStr}` : venueName;

        defaultRoles.forEach((def, index) => {
          const newId = `show_shift_${showDate}_${index}_${Date.now()}`;
          const isRookiesTest = showDate === '2026-07-22';
          const newItem = {
            id: newId,
            crewId: isRookiesTest && index === 0 ? 'arjun' : isRookiesTest && index === 1 ? 'abbie' : isRookiesTest && index === 2 ? 'al' : 'openshifts',
            crewName: isRookiesTest && index === 0 ? 'Arjun Patel' : isRookiesTest && index === 1 ? 'Abbie Janssen' : isRookiesTest && index === 2 ? 'Al Hollie' : 'OpenShifts',
            date: showDate,
            startHour: def.startHour,
            endHour: def.endHour,
            time: def.time,
            role: def.role,
            location: loc,
            notes: `Auto-generated for show: ${venueName}`,
            openSlots: isRookiesTest && index < 3 ? undefined : 1,
            isDraft: true
          };
          updated.push(newItem);
        });
        changed = true;
      }
    });

    if (changed) {
      setSchedules(updated);
    }
  }, []);

  // Crew Schedule DND Calendar State
  const [schedules, setSchedules] = useState<{ id: string; crewId: string; crewName: string; date: string; time: string; role: string; location: string; notes: string; startHour: number; endHour: number; isTimeOff?: boolean; isDraft?: boolean; labelOverride?: string; openSlots?: number; isCoverageRequested?: boolean; isTestData?: boolean; tags?: string[] }[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const resetDone = localStorage.getItem('7h_fresh_start_reset_v2');
      if (!resetDone) {
        localStorage.setItem('7h_crew_schedules_v1', '[]');
        localStorage.setItem('7h_fresh_start_reset_v2', 'true');
        return [];
      }
      const saved = localStorage.getItem('7h_crew_schedules_v1') || localStorage.getItem('7h_crew_schedules');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed)) {
          return parsed;
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(today.getFullYear(), today.getMonth(), diff);
  });

  const [editingShiftId, setEditingShiftId] = useState<string | null>(null);
  const [calendarView, setCalendarView] = useState<'timeline' | 'roster' | 'list'>('roster');
  const [onlyShowFitRole, setOnlyShowFitRole] = useState<boolean>(true);
  const [calendarRange, setCalendarRange] = useState<'week' | '4weeks' | 'month'>('week');
  const [selectedCrewAssignments, setSelectedCrewAssignments] = useState<{ [crewId: string]: { active: boolean; customized?: boolean; role: string; startHour: number; endHour: number; timeFrames?: { id?: string; startHour: number; endHour: number; role: string; tags?: string[] }[] } }>({});
  const [drawerCrewSearch, setDrawerCrewSearch] = useState('');

  // Custom Alert Modal State
  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; title?: string; message: string; type?: 'warning' | 'info' | 'error' | 'success' }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning'
  });

  const showAlert = (message: string, title: string = 'Notice', type: 'warning' | 'info' | 'error' | 'success' = 'warning') => {
    setAlertModal({ isOpen: true, title, message, type });
  };

  // Schedule Co-Editor Presence & Mix-Up Prevention State
  const [coEditors, setCoEditors] = useState<{ id: string; name: string; avatar: string; role: string; color: string; isEditing: boolean; lockedShiftId: string | null; lastAction: string; timeAgo: string }[]>([
    { id: 'ed_1', name: 'Marcus Vance', avatar: 'MV', role: 'Stage Manager', color: '#ec4899', isEditing: false, lockedShiftId: null, lastAction: 'Viewing Schedule Roster', timeAgo: 'Active now' },
    { id: 'ed_2', name: 'Sarah Jenkins', avatar: 'SJ', role: 'Tour Manager', color: '#3b82f6', isEditing: false, lockedShiftId: null, lastAction: 'Viewing Schedule Roster', timeAgo: '2s ago' }
  ]);
  const [showCoEditorModal, setShowCoEditorModal] = useState(false);
  const [coEditorConflictAlert, setCoEditorConflictAlert] = useState<{ isOpen: boolean; editorName: string; shiftTitle: string; changeDesc: string; timestamp: string } | null>(null);
  const [coEditorToast, setCoEditorToast] = useState<string | null>(null);
  const [isCoEditorSimRunning, setIsCoEditorSimRunning] = useState(false);

  // Schedule filter & leaderboard states
  const [scheduleCrewFilter, setScheduleCrewFilter] = useState<string>('');
  const [showTourDatesOnly, setShowTourDatesOnly] = useState(false);
  const [showTourDropdown, setShowTourDropdown] = useState(false);
  const [selectedTourDate, setSelectedTourDate] = useState<string | null>(null);
  const [isFiltersPanelExpanded, setIsFiltersPanelExpanded] = useState(false);
  const [schedulePersonSearch, setSchedulePersonSearch] = useState('');
  const [scheduleVenueSearch, setScheduleVenueSearch] = useState('');
  const [scheduleStartDate, setScheduleStartDate] = useState('');
  const [scheduleEndDate, setScheduleEndDate] = useState('');
  const [scheduleEventTypeFilter, setScheduleEventTypeFilter] = useState('');
  const [colorCodingMode, setColorCodingMode] = useState<'role' | 'eventType' | 'band'>('role');
  const [scheduleSortByDate, setScheduleSortByDate] = useState<string | null>(null);


  const [showLeaderboard, setShowLeaderboard] = useState(true);
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<'day' | 'week' | 'month' | 'year'>('week');

  // Scroll to selected tour date column header
  useEffect(() => {
    if (selectedTourDate) {
      const element = document.getElementById(`col-header-${selectedTourDate}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [selectedTourDate]);
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
  const createGroupForDateRef = useRef<string | null>(null);
  const [newGroupNameInput, setNewGroupNameInput] = useState('');
  const [newGroupMemberSettings, setNewGroupMemberSettings] = useState<{ [crewId: string]: { active: boolean; role?: string; startHour?: number; endHour?: number; timeFrames?: { startHour: number; endHour: number; role: string }[] } }>({});
  const [groupNameError, setGroupNameError] = useState('');
  const [showCapacityHeatmap, setShowCapacityHeatmap] = useState(false);

  const [crewGroups, setCrewGroups] = useState<{ name: string; memberIds: string[]; memberSettings?: { [crewId: string]: { startHour: number; endHour: number; role: string } } }[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('7h_crew_groups_v1') || localStorage.getItem('7h_crew_groups');
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
  const [dropTimeFrames, setDropTimeFrames] = useState<{ id?: string; startHour: number; endHour: number; role: string; tags?: string[] }[]>([
    { startHour: 12, endHour: 17, role: 'SERVER', tags: [] }
  ]);
  const [isFilteringRoles, setIsFilteringRoles] = useState(false);
  const dropLocationRef = useRef<string>('');
  const dropNotesRef = useRef<string>('');
  const supabase = createClient();
  //  Collapsible Sections (persisted via localStorage & Supabase) 
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const saved = localStorage.getItem('7h_admin_collapsed_v1') || localStorage.getItem('7h_admin_collapsed');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  const toggleSection = (key: string) => {
    const next = { ...collapsedSections, [key]: !collapsedSections[key] };
    setCollapsedSections(next);
    try {
      localStorage.setItem('7h_admin_collapsed_v1', JSON.stringify(next));
      saveLayoutToSupabase(sectionOrder, next);
    } catch { }
  };

  const updateSectionOrder = (newOrder: string[]) => {
    setSectionOrder(newOrder);
    try {
      localStorage.setItem('7h_admin_section_order_v1', JSON.stringify(newOrder));
      saveLayoutToSupabase(newOrder, collapsedSections);
    } catch { }
  };

  const handleResetLayout = () => {
    if (confirm("Reset layout to default order and expand all sections?")) {
      setSectionOrder(DEFAULT_SECTION_ORDER);
      setCollapsedSections({});
      try {
        localStorage.setItem('7h_admin_section_order_v1', JSON.stringify(DEFAULT_SECTION_ORDER));
        localStorage.setItem('7h_admin_collapsed_v1', JSON.stringify({}));
        saveLayoutToSupabase(DEFAULT_SECTION_ORDER, {});
      } catch { }
    }
  };

  const isSectionOpen = (key: string) => !collapsedSections[key];

  const handleGenerateTestData = () => {
    const dates: string[] = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }

    const testCrewList = crewMembers.filter(m => m.id !== 'openshifts');
    if (testCrewList.length === 0) return;

    // 10 distinct shifts with custom roles and multiple timeframes
    const shiftTemplates = [
      { startHour: 10.0, endHour: 14.0, time: '10:00 AM - 2:00 PM', role: 'EQUIPMENT SETUP', location: 'Mt. Prospect Fest', notes: 'Morning stage & amp setup', tags: ['SETUP', 'MORNING'] },
      { startHour: 17.0, endHour: 22.0, time: '5:00 PM - 10:00 PM', role: 'SOUND ENGINEER', location: 'Mt. Prospect Fest', notes: 'Main stage FOH mix', tags: ['AUDIO', 'MAIN SHOW'] },
      { startHour: 16.0, endHour: 21.0, time: '4:00 PM - 9:00 PM', role: 'VIP HOST & HOSPITALITY', location: 'Private Event', notes: 'VIP area lead & hospitality', tags: ['VIP', 'HOST'] },
      { startHour: 18.0, endHour: 23.5, time: '6:00 PM - 11:30 PM', role: 'LIGHTING DIRECTOR', location: 'Taste of Orland Park', notes: 'DMX visual lighting rig', tags: ['LIGHTS', 'PRODUCTION'] },
      { startHour: 12.0, endHour: 17.0, time: '12:00 PM - 5:00 PM', role: 'STAGE HAND', location: 'Lake County Fair', notes: 'Matinee load-in & rigging', tags: ['RIGGING', 'MATINEE'] },
      { startHour: 18.0, endHour: 23.0, time: '6:00 PM - 11:00 PM', role: 'TOUR MANAGER', location: 'Lake County Fair', notes: 'Tour logistics & artist care', tags: ['MANAGEMENT'] },
      { startHour: 17.0, endHour: 23.0, time: '5:00 PM - 11:00 PM', role: 'AUDIO MIX & MONITORS', location: 'Addison National Night Out', notes: 'Monitor mix & wireless IEM', tags: ['AUDIO', 'IEM'] },
      { startHour: 11.0, endHour: 15.0, time: '11:00 AM - 3:00 PM', role: 'MERCH & TICKETING', location: 'St. Charles Fest', notes: 'Merch tent setup & sales', tags: ['MERCH'] },
      { startHour: 17.0, endHour: 24.0, time: '5:00 PM - 12:00 AM', role: 'STAGE MANAGER', location: 'St. Charles Fest', notes: 'Headliner stage management', tags: ['STAGE MGR'] },
      { startHour: 23.0, endHour: 26.0, time: '11:00 PM - 2:00 AM', role: 'TEAR DOWN & LOAD OUT', location: 'St. Charles Fest', notes: 'Late night truck load out', tags: ['LOAD OUT', 'TEAR DOWN'] }
    ];

    const newTestShifts: any[] = [];
    let testIdCounter = 1;

    shiftTemplates.forEach((template, idx) => {
      const dateStr = dates[idx % dates.length];
      const crewObj = testCrewList[idx % testCrewList.length];
      newTestShifts.push({
        id: `test_shift_${Date.now()}_${testIdCounter++}`,
        crewId: crewObj.id,
        crewName: crewObj.name,
        date: dateStr,
        startHour: template.startHour,
        endHour: template.endHour,
        time: template.time,
        role: template.role,
        location: template.location,
        notes: template.notes,
        isTestData: true,
        tags: template.tags
      });
    });

    const updatedSchedules = [...schedules, ...newTestShifts];
    setSchedules(updatedSchedules);
    if (typeof window !== 'undefined') {
      localStorage.setItem('7h_crew_schedules_v1', JSON.stringify(updatedSchedules));
    }

    const totalCreated = newTestShifts.length;
    const uniqueCrewAssigned = new Set(newTestShifts.map(s => s.crewName)).size;
    const startDate = dates[0];
    const endDate = dates[dates.length - 1];

    showAlert(` 10 Distinct Time Shifts Created Successfully!\n\n• Total Shifts Created: ${totalCreated}\n• Crew Members Assigned: ${uniqueCrewAssigned}\n• Date Range: ${startDate} to ${endDate}\n• Custom Roles & Multiple Timeframes included (Setup, Audio Mix, VIP Host, Lighting, Tear Down).\n\nAll test shifts can be purged anytime using "Purge Test Data ".`, "Shifts Created", "success");
  };

  const handlePurgeTestData = () => {
    if (confirm("Are you sure you want to purge all seeded test schedule data ([TEST] shifts)? Real schedule entries will be preserved.")) {
      const remaining = schedules.filter(s => !s.isTestData && !s.id.startsWith('test_shift_') && !(s.notes && s.notes.includes('[TEST]')));
      setSchedules(remaining);
      if (typeof window !== 'undefined') {
        localStorage.setItem('7h_crew_schedules_v1', JSON.stringify(remaining));
      }
      showAlert(" Test schedule data purged successfully!", "Purged Test Data", "success");
    }
  };

  // Drag & Drop Sortable Sections State & Handlers

  const [sectionOrder, setSectionOrder] = useState<string[]>(() => {
    if (typeof window === 'undefined') return DEFAULT_SECTION_ORDER;
    try {
      const migrated = localStorage.getItem('7h_admin_order_migrated_v9');
      if (!migrated) {
        localStorage.setItem('7h_admin_order_migrated_v9', 'true');
        localStorage.setItem('7h_admin_section_order_v1', JSON.stringify(DEFAULT_SECTION_ORDER));
        return DEFAULT_SECTION_ORDER;
      }
      const saved = localStorage.getItem('7h_admin_section_order_v1') || localStorage.getItem('7h_admin_section_order');
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
      const { createClient: createSupabaseClient } = await import("@/lib/supabase/client");
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

  const collapsedSectionsRef = useRef(collapsedSections);
  useEffect(() => {
    collapsedSectionsRef.current = collapsedSections;
  }, [collapsedSections]);

  const loadSavedLayout = useCallback(async (isMounted: boolean) => {
    try {
      const { createClient: createSupabaseClient } = await import("@/lib/supabase/client");
      const client = createSupabaseClient();
      const { data: { user } } = await client.auth.getUser();

      if (user?.user_metadata && isMounted) {
        // Check for first-login password reset
        if (user.user_metadata.needs_password_reset === true) {
          setFirstLoginEmail(user.email || '');
          setShowSetPassword(true);
        }

        const migrated = localStorage.getItem('7h_admin_order_migrated_v7');
        if (!migrated) {
          // Force save the new order to Supabase user metadata
          await client.auth.updateUser({
            data: {
              admin_section_order: DEFAULT_SECTION_ORDER,
              admin_collapsed_sections: user.user_metadata.admin_collapsed_sections || collapsedSectionsRef.current
            }
          });
          localStorage.setItem('7h_admin_order_migrated_v7', 'true');
          if (isMounted) setSectionOrder(DEFAULT_SECTION_ORDER);
          localStorage.setItem('7h_admin_section_order_v1', JSON.stringify(DEFAULT_SECTION_ORDER));
        } else {
          const savedOrder = user.user_metadata.admin_section_order;
          const savedCollapsed = user.user_metadata.admin_collapsed_sections;

          if (savedOrder && Array.isArray(savedOrder) && isMounted) {
            const uniqueList = Array.from(new Set([...savedOrder, ...DEFAULT_SECTION_ORDER]));
            const filtered = uniqueList.filter(item => DEFAULT_SECTION_ORDER.includes(item));
            setSectionOrder(filtered);
            localStorage.setItem('7h_admin_section_order_v1', JSON.stringify(filtered));
          }

          if (savedCollapsed && isMounted) {
            setCollapsedSections(savedCollapsed);
            localStorage.setItem('7h_admin_collapsed_v1', JSON.stringify(savedCollapsed));
          }
        }
      }
    } catch (err) {
      console.error("Failed to load layout from Supabase:", err);
    }
    // eslint-disable-next-line react-doctor/exhaustive-deps
  }, [setFirstLoginEmail, setShowSetPassword, setSectionOrder, setCollapsedSections]);

  // Load layout from Supabase User Metadata on mount/login
  useEffect(() => {
    if (!isLoggedIn || !member) return;
    let isMounted = true;
    loadSavedLayout(isMounted);
    return () => { isMounted = false; };
  }, [isLoggedIn, member, loadSavedLayout]);

  // Run migration on mount for all clients (logged in or not)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const migrated = localStorage.getItem('7h_admin_order_migrated_v7');
      if (!migrated) {
        setSectionOrder(DEFAULT_SECTION_ORDER);
        localStorage.setItem('7h_admin_section_order_v1', JSON.stringify(DEFAULT_SECTION_ORDER));
        localStorage.setItem('7h_admin_order_migrated_v7', 'true');
      }
    }
    // eslint-disable-next-line react-doctor/exhaustive-deps
  }, [setSectionOrder]);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const relativeY = e.clientY - rect.top;
    const threshold = rect.height / 2;

    // Only swap if cursor has crossed the halfway mark in the direction of drag
    if (draggedIndex < index && relativeY < threshold) return;
    if (draggedIndex > index && relativeY > threshold) return;

    const updated = [...sectionOrder];
    const item = updated.splice(draggedIndex, 1)[0];
    updated.splice(index, 0, item);
    setDraggedIndex(index);
    setSectionOrder(updated);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    try {
      localStorage.setItem('7h_admin_section_order_v1', JSON.stringify(sectionOrder));
      saveLayoutToSupabase(sectionOrder, collapsedSections);
    } catch { }
  };

  //  Tour Dates Sync State & Handlers 
  const [tourDates, setTourDates] = useState<any[]>([]);

  // Pre-calculate schedules lookup maps once per render for O(1) retrieval
  const schedulesByDateAndCrew = useMemo(() => {
    const map: Record<string, Record<string, typeof schedules>> = {};
    for (const s of schedules) {
      if (!s.date || !s.crewId) continue;
      if (!map[s.date]) map[s.date] = {};
      if (!map[s.date][s.crewId]) map[s.date][s.crewId] = [];
      map[s.date][s.crewId].push(s);
    }
    return map;
  }, [schedules]);

  const schedulesByCrew = useMemo(() => {
    const map: Record<string, typeof schedules> = {};
    for (const s of schedules) {
      if (!s.crewId) continue;
      if (!map[s.crewId]) map[s.crewId] = [];
      map[s.crewId].push(s);
    }
    return map;
  }, [schedules]);

  const schedulesByDate = useMemo(() => {
    const map: Record<string, typeof schedules> = {};
    for (const s of schedules) {
      if (!s.date) continue;
      if (!map[s.date]) map[s.date] = [];
      map[s.date].push(s);
    }
    return map;
  }, [schedules]);

  // Memoize formatted upcoming tour dates to avoid calling new Date() and toLocaleDateString 146 times on every single render!
  const upcomingTourDatesWithLabels = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const upcoming = tourDates.filter(show => !show.date || show.date >= todayStr);

    // Deduplicate shows by date and venue name
    const seen = new Set<string>();
    const uniqueUpcoming = upcoming.filter(show => {
      const key = `${show.date || ''}_${(show.venue || show.venue_name || '').toLowerCase().trim()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return uniqueUpcoming
      .sort((a, b) => (a.date || '').localeCompare(b.date || ''))
      .map(show => {
        const showDate = show.date ? new Date(show.date + 'T12:00:00') : null;
        const dateLabel = showDate
          ? `${SHORT_MONTHS[showDate.getMonth()]} ${showDate.getDate()}`
          : '—';
        const dayLabel = showDate
          ? SHORT_DAYS[showDate.getDay()]
          : '';
        return {
          ...show,
          dateLabel,
          dayLabel
        };
      });
  }, [tourDates]);

  //  Memoized Schedule Calculations for Performance 
  const crewMembers = useMemo(() => {
    const dynamicCrew = users.flatMap(u => {
      if (u.role !== 'crew') return [];
      const initials = u.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
      return [{
        id: u.id,
        name: u.name,
        role: u.duty || 'Crew Member',
        maxHours: 40,
        email: u.email || '',
        phone: u.phone || '',
        initials: initials || 'C',
        color: getAvatarColor(u.name),
        avatar: u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=random`
      }];
    });

    const processedStatic = STATIC_CREW.map(sc => {
      const initials = sc.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
      return {
        ...sc,
        initials: initials || 'C',
        color: getAvatarColor(sc.name)
      };
    });

    return [...processedStatic, ...dynamicCrew.filter(dc => !processedStatic.some(sc => sc.id === dc.id || sc.name.toLowerCase().trim() === dc.name.toLowerCase().trim()))];
  }, [users]);

  const next7Days = useMemo(() => {
    const days = [];
    const weekdayNames = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

    if (scheduleStartDate) {
      const start = new Date(scheduleStartDate + 'T12:00:00');
      let end = scheduleEndDate ? new Date(scheduleEndDate + 'T12:00:00') : null;
      if (!end || isNaN(end.getTime()) || end < start) {
        end = new Date(start);
        end.setDate(start.getDate() + 6);
      }

      const diffTime = Math.abs(end.getTime() - start.getTime());
      let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      if (diffDays > 62) diffDays = 62; // Safe upper bound

      for (let i = 0; i < diffDays; i++) {
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
    }

    let numDays = 7;
    let start = new Date(currentWeekStart);

    if (calendarRange === '4weeks') {
      numDays = 28;
    } else if (calendarRange === 'month') {
      const isBridgeToJanuary = currentWeekStart.getMonth() === 11 && currentWeekStart.getDate() > 20;
      const targetYear = isBridgeToJanuary ? currentWeekStart.getFullYear() + 1 : currentWeekStart.getFullYear();
      const targetMonth = isBridgeToJanuary ? 0 : currentWeekStart.getMonth();
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
  }, [currentWeekStart, calendarRange, scheduleStartDate, scheduleEndDate]);

  const filteredDays = useMemo(() => {
    let days = showTourDatesOnly
      ? next7Days.filter(day => tourDates.some(s => s.date === day.dateStr))
      : next7Days;

    if (scheduleVenueSearch.trim()) {
      const term = scheduleVenueSearch.toLowerCase().trim();
      days = days.filter(day => {
        const show = tourDates.find(s => s.date === day.dateStr);
        return show && (
          (show.venue && show.venue.toLowerCase().includes(term)) ||
          (show.venue_name && show.venue_name.toLowerCase().includes(term))
        );
      });
    }

    if (scheduleEventTypeFilter) {
      const showByDateMap = new Map(tourDates.map(s => [s.date, s]));
      days = days.filter(day => {
        const show = showByDateMap.get(day.dateStr);
        if (!show) return false;

        const showTagsSet = new Set(show.tags || []);
        const isFestival = show.isFestival || showTagsSet.has('festival');
        const isPrivate = show.isPrivate || showTagsSet.has('private');
        const isCorporate = showTagsSet.has('corporate');
        const isCruise = showTagsSet.has('cruise');
        const isClub = showTagsSet.has('club');

        if (scheduleEventTypeFilter === 'festival') return isFestival;
        if (scheduleEventTypeFilter === 'private') return isPrivate;
        if (scheduleEventTypeFilter === 'corporate') return isCorporate;
        if (scheduleEventTypeFilter === 'cruise') return isCruise;
        if (scheduleEventTypeFilter === 'club') return isClub;
        return true;
      });
    }

    return days;
  }, [next7Days, showTourDatesOnly, tourDates, scheduleVenueSearch, scheduleEventTypeFilter]);

  const crewWithShifts = useMemo(() => {
    return new Set(
      schedules.flatMap(s => (next7Days.some(d => d.dateStr === s.date) && s.crewId !== 'openshifts') ? [s.crewId] : [])
    );
  }, [schedules, next7Days]);

  const filteredCrewMembers = useMemo(() => {
    let list = crewMembers;

    if (scheduleCrewFilter) {
      list = list.filter(m => m.id === scheduleCrewFilter);
    }

    if (schedulePersonSearch.trim()) {
      const term = schedulePersonSearch.toLowerCase().trim();
      list = list.filter(m =>
        m.name.toLowerCase().includes(term) ||
        (m.role && m.role.toLowerCase().includes(term))
      );
    }

    const activeSortDate = scheduleSortByDate || selectedTourDate;
    const activeWeekDateSet = new Set(next7Days.map(d => d.dateStr));

    list = [...list].sort((a, b) => {
      // 1. If a specific date is selected/clicked, prioritize shifts on that exact date
      if (activeSortDate) {
        const aHasSpecificShift = schedules.some(s => s.date === activeSortDate && s.crewId === a.id && !s.isTimeOff && s.crewId !== 'openshifts');
        const bHasSpecificShift = schedules.some(s => s.date === activeSortDate && s.crewId === b.id && !s.isTimeOff && s.crewId !== 'openshifts');
        if (aHasSpecificShift && !bHasSpecificShift) return -1;
        if (!aHasSpecificShift && bHasSpecificShift) return 1;
      }

      // 2. Prioritize crew members who have ANY active shift in the currently visible week
      const aWeekShifts = schedules.filter(s => activeWeekDateSet.has(s.date || '') && s.crewId === a.id && !s.isTimeOff && s.crewId !== 'openshifts');
      const bWeekShifts = schedules.filter(s => activeWeekDateSet.has(s.date || '') && s.crewId === b.id && !s.isTimeOff && s.crewId !== 'openshifts');

      const aHasWeekShift = aWeekShifts.length > 0;
      const bHasWeekShift = bWeekShifts.length > 0;

      if (aHasWeekShift && !bHasWeekShift) return -1;
      if (!aHasWeekShift && bHasWeekShift) return 1;

      // 3. If both work in the week, sort by total scheduled hours (descending)
      const aHours = aWeekShifts.reduce((acc, s) => acc + Math.max(0, (s.endHour || 0) - (s.startHour || 0)), 0);
      const bHours = bWeekShifts.reduce((acc, s) => acc + Math.max(0, (s.endHour || 0) - (s.startHour || 0)), 0);
      if (bHours !== aHours) return bHours - aHours;

      // 4. Alphabetical by name fallback
      return a.name.localeCompare(b.name);
    });

    return list.filter(m => m.id !== 'openshifts');
  }, [crewMembers, scheduleCrewFilter, schedulePersonSearch, schedules, scheduleSortByDate, selectedTourDate, next7Days]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (scheduleCrewFilter) count++;
    if (schedulePersonSearch.trim()) count++;
    if (scheduleVenueSearch.trim()) count++;
    if (scheduleEventTypeFilter) count++;
    if (scheduleStartDate || scheduleEndDate) count++;
    if (showTourDatesOnly) count++;
    return count;
  }, [scheduleCrewFilter, schedulePersonSearch, scheduleVenueSearch, scheduleEventTypeFilter, scheduleStartDate, scheduleEndDate, showTourDatesOnly]);

  const shiftCountsByDate = useMemo(() => {
    const acc: Record<string, number> = {};
    for (const s of schedules) {
      if (s.date) {
        acc[s.date] = (acc[s.date] || 0) + 1;
      }
    }
    return acc;
  }, [schedules]);

  const activeWeekDateSet = useMemo(() => {
    return new Set(next7Days.map(d => d.dateStr));
  }, [next7Days]);

  const leaderboardRankings = useMemo(() => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const getHoursForPeriod = (crewId: string) => {
      let relevantShifts = schedules.filter(s => s.crewId === crewId && !s.isTimeOff);

      if (leaderboardPeriod === 'day') {
        const activeDay = next7Days[0]?.dateStr || todayStr;
        relevantShifts = relevantShifts.filter(s => s.date === activeDay);
      } else if (leaderboardPeriod === 'week') {
        const weekDates = new Set(next7Days.map(d => d.dateStr));
        relevantShifts = relevantShifts.filter(s => weekDates.has(s.date));
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

    return crewMembers
      .flatMap(m => {
        if (m.id === 'openshifts') return [];
        const hours = getHoursForPeriod(m.id);
        if (hours <= 0) return [];
        return [{ ...m, hours }];
      })
      .sort((a, b) => b.hours - a.hours);
  }, [crewMembers, schedules, leaderboardPeriod, currentWeekStart, next7Days]);

  const handleDateClick = useCallback((dateStr: string) => {
    setSelectedTourDate(current => {
      if (current === dateStr) {
        return null;
      }
      return dateStr;
    });

    const chosen = new Date(dateStr + 'T12:00:00');
    const day = chosen.getDay();
    const diff = chosen.getDate() - day + (day === 0 ? -6 : 1);
    const targetWeekStart = new Date(chosen.getFullYear(), chosen.getMonth(), diff);

    setCurrentWeekStart(current => {
      if (current.getTime() !== targetWeekStart.getTime()) {
        return targetWeekStart;
      }
      return current;
    });
  }, []);
  const syncLoadingRef = useRef(false);
  const syncResultRef = useRef<any>(null);

  const handleSyncTourDates = async () => {
    syncLoadingRef.current = true;
    syncResultRef.current = null;
    try {
      const res = await fetch("/api/sync-shows", { method: "POST" });
      if (!res.ok) {
        syncResultRef.current = { success: false, error: `HTTP ${res.status}` };
        return;
      }
      const data = await res.json();
      syncResultRef.current = data;

      if (data.success) {
        const tourRes = await fetch("/api/tour");
        if (tourRes.ok) {
          const freshTourDates = await tourRes.json();
          setTourDates(freshTourDates);
          syncTourDatesToCalendar(freshTourDates, schedules);

          const todayStr = new Date().toISOString().split('T')[0];
          const upcoming = freshTourDates
            .filter((show: any) => show.date && show.date >= todayStr)
            .sort((a: any, b: any) => a.date.localeCompare(b.date));

          if (upcoming.length > 0) {
            const firstShowDate = upcoming[0].date;
            const chosen = new Date(firstShowDate + 'T12:00:00');
            const day = chosen.getDay();
            const diff = chosen.getDate() - day + (day === 0 ? -6 : 1);
            setCurrentWeekStart(new Date(chosen.getFullYear(), chosen.getMonth(), diff));
          }
        }
        setAuditLog(prev => [{
          id: crypto.randomUUID(),
          text: " Synced tour dates: Scraped " + data.scraped + " shows from official site.",
          time: "Just now",
          color: "bg-emerald-500"
        }, ...prev]);
      } else {
        setAuditLog(prev => [{
          id: crypto.randomUUID(),
          text: " Tour sync failed: " + (data.error || "Unknown error"),
          time: "Just now",
          color: "bg-rose-500"
        }, ...prev]);
      }
    } catch (err: any) {
      syncResultRef.current = { success: false, error: err.message || "Network error" };
    } finally {
      syncLoadingRef.current = false;
    }
  };

  //  Memory Moderation Queue State & Handlers 
  // eslint-disable-next-line react-doctor/rerender-state-only-in-handlers
  const [memoryQueue, setMemoryQueue] = useState<any[]>([]);

  const moderateMemory = async (id: string, action: 'approve' | 'reject') => {
    setMemoryQueue(prev => prev.filter(m => m.id !== id));
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
  const activeFeaturedTrackRef = useRef<any>(null);
  const trackTitleRef = useRef(''); // Serves as Drop / Album Name
  const dropSongsRef = useRef<{ title: string; file: File | null }[]>([{ title: '', file: null }]);
  const [trackVisibility, setTrackVisibility] = useState<'everyone' | 'fans'>('everyone');
  const [trackDurationType, setTrackDurationType] = useState<'indefinite' | 'temporary'>('indefinite');
  const [trackDurationHours, setTrackDurationHours] = useState('24');
  const [trackCustomExpiresAt, setTrackCustomExpiresAt] = useState('');
  const [trackCompression, setTrackCompression] = useState<'superb' | 'standard' | 'high' | 'none'>('standard');
  const [trackNormalize, setTrackNormalize] = useState(true);
  const uploadingTrackRef = useRef(false);
  const trackUploadErrorRef = useRef('');
  const trackUploadSuccessRef = useRef(false);

  // Global Announcement State
  const [bannerActive, setBannerActive] = useState(false);
  const [bannerText, setBannerText] = useState('');
  const bannerLinkRef = useRef('');
  const [bannerExpiresAt, setBannerExpiresAt] = useState<string | null>(null);
  const [bannerUpdating, setBannerUpdating] = useState(false);

  // Cruise Announcement & Dispatch State
  const [cruiseMessage, setCruiseMessage] = useState('');
  const [cruiseUpdating, setCruiseUpdating] = useState(false);
  const [cruiseSaveStatus, setCruiseSaveStatus] = useState<string | null>(null);
  const [cruiseBlastSubject, setCruiseBlastSubject] = useState('');
  const [sendEmailToPassengers, setSendEmailToPassengers] = useState(true);
  const [postNoticeToDashboard, setPostNoticeToDashboard] = useState(true);
  const [livePreviewTab, setLivePreviewTab] = useState<'dashboard' | 'email'>('dashboard');
  const [chatLayout, setChatLayout] = useState<number>(3);

  // Cruise Guidelines State
  const [adminGuidelinesTitle, setAdminGuidelinesTitle] = useState('Cruise Information & Guidelines');
  const [adminGuidelinesSubtitle, setAdminGuidelinesSubtitle] = useState('Cruiser Welcome Pack');
  const [adminGuidelinesContent, setAdminGuidelinesContent] = useState('');
  const [adminGuidelinesUpdating, setAdminGuidelinesUpdating] = useState(false);
  const [adminGuidelinesSaveStatus, setAdminGuidelinesSaveStatus] = useState<'saved' | 'error' | null>(null);

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
  const crewLoadingRef = useRef(false);
  const [viewingUser, setViewingUser] = useState<string | null>(null);
  const registryRef = useRef<HTMLElement>(null);
  const loggedStreamIds = useRef<Set<string>>(new Set());

  // Shopify Sales Data
  const [shopifyData, setShopifyData] = useState<any>(null);
  const [shopifyLoading, setShopifyLoading] = useState(true);
  const [shopifyPeriod, setShopifyPeriod] = useState(30);
  const [shopifyError, setShopifyError] = useState('');

  // Shopify QR Code Modal states
  const [selectedQrProduct, setSelectedQrProduct] = useState<any>(null);
  const [selectedQrVariant, setSelectedQrVariant] = useState<any>(null);
  const [qrLinkType, setQrLinkType] = useState<'product' | 'checkout'>('product');
  const [qrSubtitle, setQrSubtitle] = useState('Official Merchandise');
  const [qrIncludePrice, setQrIncludePrice] = useState(true);

  const openQrModal = (product: any) => {
    setSelectedQrProduct(product);
    setSelectedQrVariant(null);
    setQrLinkType('product');
    setQrSubtitle('Official Merchandise');
    setQrIncludePrice(true);
  };

  // Fan Analytics
  const fanDataRef = useRef<any>(null);

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
  interface AuditEntry {
    id: string;
    text: string;
    time: string;
    color: string;
    details?: {
      type: 'sms' | 'email' | 'broadcast' | 'signin';
      smsText?: string;
      emailSubject?: string;
      emailHtml?: string;
      username?: string;
      ipAddress?: string;
    };
  }
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([
    { id: 'boot', text: 'System boot online. Realtime bindings initialized.', time: 'Just now', color: 'bg-emerald-500' },
    {
      id: 'session',
      text: 'Administrator session granted.',
      time: '1 min ago',
      color: 'bg-[var(--color-accent)]',
      details: {
        type: 'signin',
        username: 'michaelscimeca',
        ipAddress: '192.168.1.45'
      }
    },
  ]);
  const [expandedAuditId, setExpandedAuditId] = useState<string | null>(null);

  // Crew SMS Alert
  const [crewAlertMsg, setCrewAlertMsg] = useState('');
  const [crewAlertSending, setCrewAlertSending] = useState(false);
  const [crewAlertResult, setCrewAlertResult] = useState<any>(null);
  const [crewAlertStats, setCrewAlertStats] = useState<{ totalCrew: number; withPhone: number; recipients?: any[] } | null>(null);
  const [selectedCrewPhones, setSelectedCrewPhones] = useState<string[]>([]);
  const [newSmsGroupName, setNewSmsGroupName] = useState('');
  const [showSaveSmsGroup, setShowSaveSmsGroup] = useState(false);
  const [newSmsGroupError, setNewSmsGroupError] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [editingDutyMemberId, setEditingDutyMemberId] = useState<string | null>(null);
  const [editingDutyValue, setEditingDutyValue] = useState<string>('');
  const [isCustomDuty, setIsCustomDuty] = useState(false);
  const [savingDuty, setSavingDuty] = useState(false);
  const [presetRoles, setPresetRoles] = useState<string[]>([]);
  const [isManageRolesModalOpen, setIsManageRolesModalOpen] = useState(false);
  const [newPresetRoleInput, setNewPresetRoleInput] = useState('');


  // New Embedded Broadcast states
  const [smsSelectedShowDate, setSmsSelectedShowDate] = useState<string>('');
  const [sendSmsAlert, setSendSmsAlert] = useState<boolean>(true);
  const [sendEmailAlert, setSendEmailAlert] = useState<boolean>(false);
  const [smsEmailSubject, setSmsEmailSubject] = useState<string>('');
  const [crewSendAsGroup, setCrewSendAsGroup] = useState<boolean>(true);

  // Band Member SMS Text
  const [bandAlertMsg, setBandAlertMsg] = useState('');
  const [bandAlertSending, setBandAlertSending] = useState(false);
  const [bandAlertResult, setBandAlertResult] = useState<any>(null);
  const [selectedBandPhones, setSelectedBandPhones] = useState<string[]>([]);
  const [newBandGroupName, setNewBandGroupName] = useState('');
  const [showSaveBandGroup, setShowSaveBandGroup] = useState(false);
  const [newBandGroupError, setNewBandGroupError] = useState('');
  const [selectedBandGroup, setSelectedBandGroup] = useState<string>('');
  const [bandSmsSelectedShowDate, setBandSmsSelectedShowDate] = useState<string>('');
  const [sendBandSmsAlert, setSendBandSmsAlert] = useState<boolean>(true);
  const [sendBandEmailAlert, setSendBandEmailAlert] = useState<boolean>(false);
  const [bandEmailSubject, setBandEmailSubject] = useState<string>('');

  // Show Broadcast Alert Modal State
  const broadcastModalRef = useRef<{
    isOpen: boolean;
    dateStr: string;
    showName: string;
    assignedCrew: { name: string; phone: string; email: string; role: string }[];
    smsMessage: string;
    emailSubject: string;
    emailBody: string;
    sendSms: boolean;
    sendEmail: boolean;
    rolesSummary: { role: string; count: number }[];
  }>({
    isOpen: false,
    dateStr: '',
    showName: '',
    assignedCrew: [],
    smsMessage: '',
    emailSubject: '',
    emailBody: '',
    sendSms: true,
    sendEmail: true,
    rolesSummary: []
  });
  const broadcastSendingRef = useRef(false);
  const broadcastResultRef = useRef<string | null>(null);
  const [emailPreviewTab, setEmailPreviewTab] = useState<'edit' | 'preview'>('preview');

  const handleSendBroadcast = async () => {
    broadcastSendingRef.current = true;
    broadcastResultRef.current = null;
    try {
      const { assignedCrew, smsMessage, emailSubject, emailBody, sendSms, sendEmail, showName } = broadcastModalRef.current;

      const phones = assignedCrew.flatMap(c => c.phone ? [c.phone] : []);
      const emails = assignedCrew.flatMap(c => c.email ? [c.email] : []);

      let smsStatus = '';
      let emailStatus = '';

      if (sendSms && phones.length > 0) {
        const smsRes = await fetch('/api/admin/crew-alert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: smsMessage,
            selectedPhones: phones
          })
        });
        if (!smsRes.ok) {
          throw new Error('Failed to send SMS text messages.');
        }
        smsStatus = `SMS sent to ${phones.length} crew. `;
      }

      if (sendEmail && emails.length > 0) {
        await Promise.all(
          emails.map(async (email) => {
            const emailRes = await fetch('/api/email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                to: email,
                subject: emailSubject,
                html: emailBody
              })
            });
            if (!emailRes.ok) {
              throw new Error(`Failed to send email to ${email}`);
            }
          })
        );
        emailStatus = `Emails sent to ${emails.length} crew. `;
      }

      broadcastResultRef.current = `Success! ${smsStatus}${emailStatus}`;
      setAuditLog(prev => [{
        id: crypto.randomUUID(),
        text: ` Sent broadcast to ${showName} crew (SMS: ${sendSms ? phones.length : 0}, Email: ${sendEmail ? emails.length : 0})`,
        time: 'Just now',
        color: 'bg-purple-600',
        details: {
          type: 'broadcast',
          smsText: sendSms ? smsMessage : undefined,
          emailSubject: sendEmail ? emailSubject : undefined,
          emailHtml: sendEmail ? emailBody : undefined
        }
      }, ...prev]);

      setTimeout(() => {
        broadcastModalRef.current = { ...broadcastModalRef.current, isOpen: false };
        broadcastResultRef.current = null;
      }, 2000);
    } catch (err: any) {
      broadcastResultRef.current = `Error: ${err.message}`;
    } finally {
      broadcastSendingRef.current = false;
    }
  };

  const selectShowForSms = (dateStr: string) => {
    setSmsSelectedShowDate(dateStr);
    if (!dateStr) {
      setCrewAlertMsg('');
      setSelectedCrewPhones([]);
      setSmsEmailSubject('');
      return;
    }

    const dayShifts = schedules.filter(s => s.date === dateStr && s.crewId !== 'openshifts' && !s.isTimeOff);
    const assignedCrewIds = Array.from(new Set(dayShifts.map(s => s.crewId)));
    const recipientsList = crewAlertStats?.recipients || [];

    const assignedCrew = assignedCrewIds
      .map(crewId => {
        const matched = recipientsList.find(r => r.id === crewId);
        const crewShifts = dayShifts.filter(s => s.crewId === crewId);
        const roles = Array.from(new Set(crewShifts.map(s => s.role))).join(', ');
        const times = Array.from(new Set(crewShifts.flatMap(s => { const t = s.time || formatTimeFrame(s.startHour, s.endHour); return t ? [t] : []; }))).join(', ');
        const matchedStatic = staticCrew.find(sc => sc.id === crewId);

        return {
          id: matched?.id || crewId,
          name: matched?.name || matchedStatic?.name || findCrewName(crewId),
          phone: matched?.phone || matchedStatic?.phone || '',
          role: roles,
          timeFrame: times
        };
      });

    const phones = assignedCrew.flatMap(c => { const p = normalizePhoneNumber(c.phone); return p ? [p] : []; });
    setSelectedCrewPhones(phones);

    const show = tourDates.find((s: any) => s.date === dateStr);
    const showName = show ? (show.venue || show.venue_name) : 'Show';

    // Format date nicely
    const d = new Date(dateStr + 'T00:00:00');
    const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const formattedDate = `${daysOfWeek[d.getDay()]} ${d.getDate()}`;

    let rolesListStr = '';
    assignedCrew.forEach(c => {
      const timeInfo = c.timeFrame ? ` (${c.timeFrame})` : '';
      const roleInfo = c.role ? `: ${c.role}` : '';
      rolesListStr += `\n- ${c.name}${roleInfo}${timeInfo}`;
    });
    const message = `Hey team, regarding our show at ${showName} on ${formattedDate}:${rolesListStr}`;

    setCrewAlertMsg(message);
    setSmsEmailSubject(` Crew Alert: ${showName} - ${formattedDate}`);
    setSendEmailAlert(true);
    setSendSmsAlert(true);
  };

  const getBandRecipientsCombined = () => {
    const isBandMemberProfile = (name: string, duty?: string) => {
      const lower = (name || '').toLowerCase();
      if (lower.includes('michael') || lower.includes('scimeca')) return false;
      if (lower.includes('adam') || lower.includes('richard') || lower.includes('hofherr') || lower.includes('nick') || lower.includes('mark') || lower.includes('frankie')) return true;
      if (duty && duty.toUpperCase().includes('BAND MEMBER')) return true;
      return false;
    };

    const bandRecipients = users.filter(u => isBandMemberProfile(u.name, u.duty));
    return [
      ...bandRecipients.map(r => {
        const matchedStatic = staticBand.find(sb => sb.name.toLowerCase().includes(r.name.toLowerCase()) || r.name.toLowerCase().includes(sb.name.toLowerCase()));
        return {
          id: r.id,
          name: r.name,
          phone: r.phone || (matchedStatic ? matchedStatic.phone : '(555) 301-4422'),
          role: r.duty || (matchedStatic ? matchedStatic.role : 'BAND MEMBER'),
          avatar: resolveMemberAvatar(r.name, r.avatar),
          email: r.email || (matchedStatic ? matchedStatic.email : '')
        };
      }),
      ...staticBand.flatMap(sb => {
        const isMatched = bandRecipients.some(r => r.name.toLowerCase().includes(sb.name.toLowerCase()) || sb.name.toLowerCase().includes(r.name.toLowerCase()));
        if (isMatched) return [];
        return [{
          id: sb.id,
          name: sb.name,
          phone: sb.phone,
          role: sb.role,
          avatar: resolveMemberAvatar(sb.name, sb.avatar),
          email: sb.email
        }];
      })
    ];
  };

  const selectShowForBandSms = (dateStr: string) => {
    setBandSmsSelectedShowDate(dateStr);
    if (!dateStr) {
      setBandAlertMsg('');
      setSelectedBandPhones([]);
      setBandEmailSubject('');
      return;
    }
    const show = tourDates.find((s: any) => s.date === dateStr);
    const showName = show ? (show.venue || show.venue_name) : 'Show';

    // Format date nicely
    const d = new Date(dateStr + 'T00:00:00');
    const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const formattedDate = `${daysOfWeek[d.getDay()]} ${d.getDate()}`;

    // Auto-select all band members when targeting a show
    const combined = getBandRecipientsCombined();
    const phones = combined.flatMap(b => { const p = normalizePhoneNumber(b.phone); return p ? [p] : []; });
    setSelectedBandPhones(phones);

    // Set SMS draft
    setBandAlertMsg(`Hey band, reminder for our upcoming show at ${showName} on ${formattedDate}. Load-in is 2 hours before.`);
    setBandEmailSubject(`Upcoming Show Alert: 7th Heaven at ${showName} (${formattedDate})`);
    setSendBandEmailAlert(true);
    setSendBandSmsAlert(true);
  };

  const handleSendBandAlert = async () => {
    if (bandAlertSendingRef.current || !bandAlertMsg.trim()) return;
    bandAlertSendingRef.current = true;
    setBandAlertSending(true);
    setBandAlertResult(null);

    const show = tourDates.find((s: any) => s.date === bandSmsSelectedShowDate);
    const combined = getBandRecipientsCombined();
    const selectedBandPhonesSet = new Set(selectedBandPhones);
    const sentToNames = combined.flatMap(b => selectedBandPhonesSet.has(normalizePhoneNumber(b.phone)) ? [b.name] : []);

    try {
      const res = await fetch('/api/admin/crew-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: bandAlertMsg,
          selectedPhones: selectedBandPhones,
          sendSms: sendBandSmsAlert,
          sendEmail: sendBandEmailAlert,
          emailSubject: bandEmailSubject || `7th Heaven Band Alert: Show Update`,
          showDate: bandSmsSelectedShowDate,
          showVenue: show ? (show.venue || show.venue_name) : 'TBD',
          showTime: show ? (show.time || '8:00pm') : 'TBD',
          sentToNames
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setBandAlertResult({ success: false, error: data.error || `HTTP ${res.status}` });
      } else {
        const data = await res.json();
        setBandAlertResult({ success: true, count: data.sent || selectedBandPhones.length });
        setBandAlertMsg('');
        setSelectedBandPhones([]);
        setBandSmsSelectedShowDate('');
      }
    } catch (err: any) {
      setBandAlertResult({ success: false, error: 'Network error occurred.' });
    } finally {
      bandAlertSendingRef.current = false;
      setBandAlertSending(false);
    }
  };

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
  const [smsTwilioBalance, setSmsTwilioBalance] = useState(161.92);
  const [smsCostPerSegment] = useState(0.0079); // Twilio US SMS Segment standard rate
  const [smsTotalSentAllTime, setSmsTotalSentAllTime] = useState(4820);
  const [smsTotalSpentAllTime, setSmsTotalSpentAllTime] = useState(38.08);
  const [smsHistoryLogs, setSmsHistoryLogs] = useState<{ id: string; date: string; venue: string; city: string; recipients: number; segments: number; cost: number; status: string }[]>([
    { id: 'blast_1', date: 'Aug 1, 2026', venue: 'Addison National Night Out', city: 'Addison, IL', recipients: 480, segments: 1, cost: 3.79, status: 'Delivered (Twilio 10DLC)' },
    { id: 'blast_2', date: 'Jul 25, 2026', venue: 'St. Charles CITP', city: 'St. Charles, IL', recipients: 520, segments: 1, cost: 4.11, status: 'Delivered (Twilio 10DLC)' },
    { id: 'blast_3', date: 'Jul 18, 2026', venue: 'Linden Fest', city: 'Lindenhurst, IL', recipients: 610, segments: 1, cost: 4.82, status: 'Delivered (Twilio 10DLC)' },
    { id: 'blast_4', date: 'Jul 10, 2026', venue: 'Vet Fest Oswego', city: 'Oswego, IL', recipients: 415, segments: 1, cost: 3.28, status: 'Delivered (Twilio 10DLC)' },
  ]);

  // Cruise Itinerary Builder
  type ItineraryEvent = { id: string; time: string; title: string; subtitle: string; };
  type ItineraryDay = { id: string; dayLabel: string; location: string; theme: string; events: ItineraryEvent[]; colorTheme: string; };
  const itineraryRef = useRef<ItineraryDay[]>([]);
  const itineraryUpdatingRef = useRef(false);
  const itinerarySaveStatusRef = useRef<'saved' | 'error' | null>(null);

  // Cruise Chat Pin
  const cruiseChatPinRef = useRef('');
  const cruiseChatPinUpdatingRef = useRef(false);
  const cruiseChatPinSaveStatusRef = useRef<'saved' | 'error' | null>(null);

  // Cruise Chat Enable/Disable
  const cruiseChatEnabledRef = useRef(true);
  const cruiseChatTogglingRef = useRef(false);

  // Admin Live Chat Feed
  type AdminChatMsg = { id: string; sender_name: string; sender_role: string; sender_avatar: string; content: string; created_at: string; };
  const [adminChatMessages, setAdminChatMessages] = useState<AdminChatMsg[]>([]);
  const [adminChatInput, setAdminChatInput] = useState('');
  const [adminChatSending, setAdminChatSending] = useState(false);
  const adminChatEndRef = useRef<HTMLDivElement>(null);
  const adminChatContainerRef = useRef<HTMLDivElement>(null);

  // Cruise Important Links
  const importantLinksRef = useRef<{ title: string, url: string, icon: string }[]>([]);
  const linksUpdatingRef = useRef(false);
  const linksSaveStatusRef = useRef<'saved' | 'error' | null>(null);
  const pollLocalRef = useRef<NodeJS.Timeout | null>(null);

  // Cruise Stats
  const [cruiseStats, setCruiseStats] = useState<{ total: number; adults: number; children: number; signups: number; recentSignups: { name: string; email: string; phone: string; date: string; partySize: number }[] }>({ total: 0, adults: 0, children: 0, signups: 0, recentSignups: [] });

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoginError('');
    setAdminLoginLoading(true);

    try {
      // Authenticate via Supabase Auth — no hardcoded credentials
      const ok = await login(adminEmail, adminPassword);

      if (!ok) {
        setAdminLoginError('Invalid credentials. Please check your email and password.');
        return;
      }

      // After login, the member context will set the role from Supabase profiles.
      // The login gate below (member?.role !== 'admin') will handle authorization.
    } finally {
      setAdminLoginLoading(false);
    }
  };

  const createCrew = async () => {
    if (!newCrewName || !newCrewEmail || !newCrewPassword) return;
    if (newCrewPassword.length < 6) { setCrewError('Password must be at least 6 characters.'); return; }
    crewLoadingRef.current = true;
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
      const newMem = (res as any).newMember;
      if (newMem) {
        setUsers(prev => [newMem, ...prev]);
        try {
          const stored = localStorage.getItem('7h_members_v1') || localStorage.getItem('7h_members');
          const arr = stored ? JSON.parse(stored) : [];
          localStorage.setItem('7h_members_v1', JSON.stringify([newMem, ...arr]));
        } catch { }
      } else {
        setUsers(prev => prev.map((m: any) => m.email === savedEmail ? { ...m, role: 'crew' } : m));
      }
      setFilterRole('crew');
    } else {
      setCrewError(res.error || 'Failed to create crew member.');
    }
    crewLoadingRef.current = false;
  };

  const scrollToRegistry = () => {
    registryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  const loadAdminAnnouncements = useCallback(async () => {
    try {
      const { data: settingsRows } = await supabase
        .from('site_settings')
        .select('key, value')
        .in('key', [
          'announcement_banner',
          'cruise_announcement',
          'cruise_guidelines',
          'cruise_chat_pin',
          'cruise_chat_enabled',
          'cruise_important_links',
          'cruise_itinerary'
        ]);

      if (!isMountedRef.current) return;

      if (settingsRows) {
        const settingsMap: Record<string, any> = {};
        settingsRows.forEach((row: { key: string; value: any }) => {
          let val = row.value;
          let attempts = 0;
          while (typeof val === 'string' && attempts < 3) {
            try { val = JSON.parse(val); attempts++; } catch { break; }
          }
          settingsMap[row.key] = val;
        });

        // 1. Banner
        const ann = settingsMap['announcement_banner'];
        if (ann) {
          const isExpired = ann?.expiresAt && new Date(ann.expiresAt) < new Date();
          setBannerActive(isExpired ? false : (ann?.isActive || false));
          setBannerText(ann?.text || '');
          bannerLinkRef.current = ann?.link || '';
          setBannerExpiresAt(ann?.expiresAt || null);
        }

        // 2. Cruise Announcement
        const cruiseAnn = settingsMap['cruise_announcement'];
        if (cruiseAnn) {
          if (cruiseAnn.message) setCruiseMessage(cruiseAnn.message);
          if (cruiseAnn.subject) setCruiseBlastSubject(cruiseAnn.subject);
        }

        // 3. Guidelines
        const g = settingsMap['cruise_guidelines'];
        if (g) {
          if (g.title) setAdminGuidelinesTitle(g.title);
          if (g.subtitle) setAdminGuidelinesSubtitle(g.subtitle);
          if (g.content) setAdminGuidelinesContent(g.content);
        }

        // 4. Chat Pin & Enabled
        const pinVal = settingsMap['cruise_chat_pin'];
        if (pinVal) {
          cruiseChatPinRef.current = pinVal.pin || (typeof pinVal === 'string' ? pinVal : cruiseChatPinRef.current);
        }
        const enabledVal = settingsMap['cruise_chat_enabled'];
        if (enabledVal !== undefined) {
          cruiseChatEnabledRef.current = enabledVal.chatEnabled !== undefined ? enabledVal.chatEnabled : !!enabledVal;
        }

        // 5. Important Links
        const linksVal = settingsMap['cruise_important_links'];
        if (linksVal) {
          const links = linksVal.links || (Array.isArray(linksVal) ? linksVal : null);
          if (links && Array.isArray(links)) {
            importantLinksRef.current = links;
          }
        }

        // 6. Itinerary
        const itinVal = settingsMap['cruise_itinerary'];
        if (itinVal && Array.isArray(itinVal) && itinVal.length > 0) {
          itineraryRef.current = itinVal;
        } else {
          itineraryRef.current = [];
        }
      }
    } catch {
      itineraryRef.current = [];
    }

    try {
      const { data } = await supabase
        .from('cruise_signups')
        .select('*')
        .order('created_at', { ascending: false });

      if (!isMountedRef.current) return;

      if (data) {
        let total = 0;
        let adults = 0;
        let children = 0;
        const recentSignups: any[] = [];

        for (const signup of data) {
          total += (signup.guest_count || 1);
          adults += 1;
          recentSignups.push({
            id: signup.id,
            name: signup.name || 'Unknown',
            email: signup.email || '',
            phone: signup.phone || '',
            date: new Date(signup.created_at).toLocaleDateString(),
            partySize: signup.guest_count || 1,
            checkedOff: signup.checked_off || false,
            depositPaid: signup.deposit_paid || false,
            fullPaid: signup.full_paid || false,
            notes: signup.notes || '',
          });

          if (signup.notes && signup.notes.includes('Guest Details: [')) {
            try {
              const jsonStr = signup.notes.split('Guest Details: ')[1];
              const guests = JSON.parse(jsonStr);
              for (const guest of guests) {
                if (guest.type === 'child') { children += 1; } else { adults += 1; }
              }
            } catch { }
          }
        }
        setCruiseStats({ total, adults, children, signups: data.length, recentSignups });
      }
    } catch { }

    try {
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room', 'cruise_dashboard')
        .order('created_at', { ascending: false })
        .limit(80);

      if (!isMountedRef.current) return;

      if (data) {
        setAdminChatMessages(data.reverse());
        if (adminTabRef.current !== 'cruise' && data.length > 0) {
          setUnreadCruiseChat(data.length);
        }
      }
    } catch { }
  }, [supabase]);

  const loadAdminData = useCallback(async () => {
    let isMounted = true;
    try {
      const { data: streamsData } = await supabase
        .from('live_streams')
        .select('*')
        .eq('status', 'live');

      const realFeeds = (streamsData || []).map((st: any) => ({
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
      realFeeds.forEach((feed: any) => {
        if (!loggedStreamIds.current.has(feed.id)) {
          loggedStreamIds.current.add(feed.id);
          setAuditLog(prev => [{ id: crypto.randomUUID(), text: ` ${feed.host} went live — "${feed.name}"`, time: 'Just now', color: 'bg-red-500' }, ...prev]);
        }
      });

      setFeeds(realFeeds);

      const { data: profilesData } = await supabase
        .from('profiles').select('*').order('created_at', { ascending: false });
      if (profilesData) {
        setUsers(profilesData.flatMap((p: any) => [{
          id: p.id,
          name: p.full_name || 'Anonymous',
          email: p.email || '',
          phone: p.phone || '',
          role: p.role,
          duty: p.crew_duty || null,
          status: 'active',
          strikes: 0,
          avatar: p.avatar_url || p.profile_photo_url || null
        }]));
      }

      try {
        const tourRes = await fetch('/api/tour');
        if (tourRes.ok) {
          const freshTourDates = await tourRes.json();
          setTourDates(freshTourDates);

          let currentSchedules = [];
          const resetDone = localStorage.getItem('7h_fresh_start_reset_v5');
          const defaultShifts = [
            // SUN 2 (Lake County Fair)
            { id: 'sun2_1', crewId: 'abbie', crewName: 'Abbie Janssen', date: '2026-08-02', startHour: 16.0, endHour: 21.0, time: '4:00 PM - 9:00 PM', role: 'VIP HOST & HOSPITALITY', location: 'Lake County Fair', notes: 'VIP area lead & hospitality', tags: ['VIP', 'HOST'] },
            { id: 'sun2_2', crewId: 'al', crewName: 'Al Hollie', date: '2026-08-02', startHour: 12.0, endHour: 17.0, time: '12:00 PM - 5:00 PM', role: 'STAGE HAND & RIGGING', location: 'Lake County Fair', notes: 'Matinee load-in & rigging', tags: ['RIGGING', 'MATINEE'] },
            { id: 'sun2_3', crewId: 'andrea', crewName: 'Andrea Kinzinger', date: '2026-08-02', startHour: 18.0, endHour: 23.0, time: '6:00 PM - 11:00 PM', role: 'TOUR MANAGER', location: 'Lake County Fair', notes: 'Tour logistics & artist care', tags: ['MANAGEMENT'] },
            { id: 'sun2_4', crewId: 'arjun', crewName: 'Arjun Patel', date: '2026-08-02', startHour: 17.0, endHour: 22.0, time: '5:00 PM - 10:00 PM', role: 'SOUND ENGINEER', location: 'Lake County Fair', notes: 'FOH main audio mix', tags: ['AUDIO', 'FOH'] },
            { id: 'sun2_5', crewId: 'chris', crewName: 'Chris Loxely', date: '2026-08-02', startHour: 18.0, endHour: 23.5, time: '6:00 PM - 11:30 PM', role: 'LIGHTING DIRECTOR', location: 'Lake County Fair', notes: 'DMX visual lighting rig', tags: ['LIGHTS', 'PRODUCTION'] },
            { id: 'sun2_6', crewId: 'dave_croke', crewName: 'Dave Croke', date: '2026-08-02', startHour: 10.0, endHour: 14.0, time: '10:00 AM - 2:00 PM', role: 'EQUIPMENT SETUP', location: 'Lake County Fair', notes: 'Morning stage & amp setup', tags: ['SETUP', 'MORNING'] },
            { id: 'sun2_7', crewId: 'dave_croke', crewName: 'Dave Croke', date: '2026-08-02', startHour: 23.0, endHour: 26.0, time: '11:00 PM - 2:00 AM', role: 'TEAR DOWN & LOAD OUT', location: 'Lake County Fair', notes: 'Late night truck load out', tags: ['LOAD OUT', 'TEAR DOWN'] },
            { id: 'sun2_8', crewId: 'daniel', crewName: 'Daniel Kim', date: '2026-08-02', startHour: 17.0, endHour: 24.0, time: '5:00 PM - 12:00 AM', role: 'STAGE MANAGER', location: 'Lake County Fair', notes: 'Headliner stage management', tags: ['STAGE MGR'] },
            { id: 'sun2_9', crewId: 'openshifts', crewName: 'OpenShifts', date: '2026-08-02', startHour: 12.0, endHour: 17.0, time: '12:00 PM - 5:00 PM', role: 'AUDIO MIX', location: 'Lake County Fair', notes: 'Matinee audio mix setup', openSlots: 2, tags: ['OPEN SHIFT'] },

            // TUE 4 (Addison National Night Out) - 10 Crew Members
            { id: 'tue4_1', crewId: 'abbie', crewName: 'Abbie Janssen', date: '2026-08-04', startHour: 16.0, endHour: 21.0, time: '4:00 PM - 9:00 PM', role: 'VIP HOST & HOSPITALITY', location: 'Addison National Night Out', notes: 'VIP area lead & hospitality', tags: ['VIP', 'HOST'] },
            { id: 'tue4_2', crewId: 'al', crewName: 'Al Hollie', date: '2026-08-04', startHour: 12.0, endHour: 17.0, time: '12:00 PM - 5:00 PM', role: 'STAGE HAND & RIGGING', location: 'Addison National Night Out', notes: 'Matinee load-in & rigging', tags: ['RIGGING', 'STAGE'] },
            { id: 'tue4_3', crewId: 'andrea', crewName: 'Andrea Kinzinger', date: '2026-08-04', startHour: 18.0, endHour: 23.0, time: '6:00 PM - 11:00 PM', role: 'TOUR MANAGER', location: 'Addison National Night Out', notes: 'Tour logistics & artist care', tags: ['MANAGEMENT'] },
            { id: 'tue4_4', crewId: 'arjun', crewName: 'Arjun Patel', date: '2026-08-04', startHour: 17.0, endHour: 23.0, time: '5:00 PM - 11:00 PM', role: 'SOUND ENGINEER', location: 'Addison National Night Out', notes: 'Main stage FOH mix', tags: ['AUDIO', 'FOH'] },
            { id: 'tue4_5', crewId: 'chris', crewName: 'Chris Loxely', date: '2026-08-04', startHour: 18.0, endHour: 23.5, time: '6:00 PM - 11:30 PM', role: 'LIGHTING DIRECTOR', location: 'Addison National Night Out', notes: 'DMX visual lighting rig', tags: ['LIGHTS', 'DMX'] },
            { id: 'tue4_6', crewId: 'dave_croke', crewName: 'Dave Croke', date: '2026-08-04', startHour: 10.0, endHour: 14.0, time: '10:00 AM - 2:00 PM', role: 'EQUIPMENT SETUP', location: 'Addison National Night Out', notes: 'Morning stage & amp setup', tags: ['SETUP', 'MORNING'] },
            { id: 'tue4_7', crewId: 'dave_croke', crewName: 'Dave Croke', date: '2026-08-04', startHour: 23.0, endHour: 26.0, time: '11:00 PM - 2:00 AM', role: 'TEAR DOWN & LOAD OUT', location: 'Addison National Night Out', notes: 'Late night truck load out', tags: ['LOAD OUT', 'TEAR DOWN'] },
            { id: 'tue4_8', crewId: 'daniel', crewName: 'Daniel Kim', date: '2026-08-04', startHour: 17.0, endHour: 24.0, time: '5:00 PM - 12:00 AM', role: 'STAGE MANAGER', location: 'Addison National Night Out', notes: 'Headliner stage management', tags: ['STAGE MGR'] },
            { id: 'tue4_9', crewId: 'elena', crewName: 'Elena Rostova', date: '2026-08-04', startHour: 15.0, endHour: 20.0, time: '3:00 PM - 8:00 PM', role: 'MERCH & TICKETING', location: 'Addison National Night Out', notes: 'Merch sales & booth manager', tags: ['MERCH'] },
            { id: 'tue4_10', crewId: 'marcus', crewName: 'Marcus Vance', date: '2026-08-04', startHour: 17.0, endHour: 23.0, time: '5:00 PM - 11:00 PM', role: 'MONITOR ENGINEER', location: 'Addison National Night Out', notes: 'Monitor mix & IEM wireless', tags: ['IEM', 'AUDIO'] },
            { id: 'tue4_11', crewId: 'openshifts', crewName: 'OpenShifts', date: '2026-08-04', startHour: 13.0, endHour: 18.0, time: '1:00 PM - 6:00 PM', role: 'STAGE HAND', location: 'Addison National Night Out', notes: 'Matinee coverage support', openSlots: 3, tags: ['COVERAGE'] }
          ];

          if (!resetDone) {
            localStorage.setItem('7h_fresh_start_reset_v5', 'true');
            currentSchedules = defaultShifts;
            localStorage.setItem('7h_crew_schedules_v1', JSON.stringify(currentSchedules));
            setSchedules(currentSchedules);
          } else {
            const saved = localStorage.getItem('7h_crew_schedules_v1') || localStorage.getItem('7h_crew_schedules');
            if (saved) {
              try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  currentSchedules = parsed;
                } else {
                  currentSchedules = defaultShifts;
                }
              } catch {
                currentSchedules = defaultShifts;
              }
            } else {
              currentSchedules = defaultShifts;
            }
          }
          syncTourDatesToCalendar(freshTourDates, currentSchedules);

          const todayStr = new Date().toISOString().split('T')[0];
          const upcoming = freshTourDates
            .filter((show: any) => show.date && show.date >= todayStr)
            .sort((a: any, b: any) => a.date.localeCompare(b.date));

          if (upcoming.length > 0) {
            const firstShowDate = upcoming[0].date;
            const chosen = new Date(firstShowDate + 'T12:00:00');
            const day = chosen.getDay();
            const diff = chosen.getDate() - day + (day === 0 ? -6 : 1);
            setCurrentWeekStart(new Date(chosen.getFullYear(), chosen.getMonth(), diff));
          }
        }
      } catch (err) { }

      const [
        memRes,
        photoRes,
        bookingRes,
        shopRes,
        fanRes,
        crewRes,
        showsRes,
        settingsRes,
        trackRes
      ] = await Promise.all([
        fetch('/api/fans/memories?all=true').catch(() => null),
        fetch('/api/fans?all=true').catch(() => null),
        fetch('/api/booking').catch(() => null),
        fetch(`/api/shopify/orders?days=${shopifyPeriod}`).catch(() => null),
        fetch('/api/admin/fans').catch(() => null),
        fetch('/api/admin/crew-alert').catch(() => null),
        fetch('/api/admin/shows').catch(() => null),
        fetch('/api/admin/settings').catch(() => null),
        fetch('/api/featured-track').catch(() => null),
      ]);

      if (memRes?.ok) {
        const allMems = await memRes.json().catch(() => []);
        setMemoryQueue(allMems.filter((m: any) => !m.approved));
      }
      if (photoRes?.ok) {
        const allPhotos = await photoRes.json().catch(() => []);
        setModerationQueue(allPhotos.filter((p: any) => !p.approved));
      }
      if (bookingRes?.ok) {
        const bData = await bookingRes.json().catch(() => []);
        setBookings(prev => JSON.stringify(prev) === JSON.stringify(bData) ? prev : bData);
      }
      if (shopRes?.ok) {
        const sData = await shopRes.json().catch(() => null);
        if (sData) { setShopifyData(sData); setShopifyError(''); }
      } else if (shopRes) {
        const errData = await shopRes.json().catch(() => ({}));
        setShopifyError(errData.error || 'Failed to load');
      }
      setShopifyLoading(false);

      if (fanRes?.ok) fanDataRef.current = await fanRes.json().catch(() => null);
      if (crewRes?.ok) setCrewAlertStats(await crewRes.json().catch(() => null));
      if (showsRes?.ok) setSmsShows(await showsRes.json().catch(() => []));
      if (settingsRes?.ok) {
        const settings = await settingsRes.json().catch(() => []);
        const autoBlast = settings.find((s: any) => s.key === 'sms_auto_blast');
        const autoBlastDays = settings.find((s: any) => s.key === 'sms_auto_blast_days');
        if (autoBlast) setSmsAutoBlast(autoBlast.value !== 'off');
        if (autoBlastDays) setSmsAutoBlastDays(parseInt(autoBlastDays.value, 10) || 3);
      }
      if (trackRes?.ok) {
        const trackData = await trackRes.json().catch(() => ({}));
        activeFeaturedTrackRef.current = trackData.track || null;
      }
    } finally {
      if (isMounted) setIsLoading(false);
    }
    // eslint-disable-next-line react-doctor/exhaustive-deps
  }, [supabase, shopifyPeriod, syncTourDatesToCalendar]);

  // Load Real Data from Supabase + simulated demo feeds
  // eslint-disable-next-line react-doctor/no-fetch-in-effect, react-doctor/no-effect-with-fresh-deps, react-doctor/exhaustive-deps
  useEffect(() => {
    loadAdminAnnouncements();
    loadAdminData();

    const streamPoll = setInterval(() => {
      const uids = ['michael', 'sammy', 'ryan', 'tony'];
      const nameMap: any = { 'michael': 'Mike S', 'sammy': 'Sammy D', 'ryan': 'Ryan K', 'tony': 'Tony M' };
      const activeLocal: any[] = [];
      uids.forEach(uid => {
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
          if (!loggedStreamIds.current.has(feedId)) {
            loggedStreamIds.current.add(feedId);
            setAuditLog(prev => [{ id: crypto.randomUUID(), text: ` ${nameMap[uid]} went live — Crew Broadcast`, time: 'Just now', color: 'bg-red-500' }, ...prev]);
          }
        } else {
          loggedStreamIds.current.delete(`sim-${uid}`);
        }
      });
      setFeeds(prev => {
        const dbFeeds = prev.filter(p => !p.isSimulated);
        const nextFeeds = [...activeLocal, ...dbFeeds].sort((a, b) => b.viewers - a.viewers);
        if (JSON.stringify(prev) === JSON.stringify(nextFeeds)) return prev;
        return nextFeeds;
      });
    }, 5000);

    // Realtime subscription for admin chat feed
    const adminChatChannel = supabase
      .channel('admin_cruise_chat')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: 'room=eq.cruise_dashboard'
      }, (payload: any) => {
        const msg = payload.new as AdminChatMsg;
        setAdminChatMessages(prev => [...prev.slice(-79), msg]);
        if (adminTabRef.current !== 'cruise') {
          setUnreadCruiseChat(prev => prev + 1);
        }
      })
      .subscribe();

    const bookingPoll = setInterval(async () => {
      try {
        const res = await fetch('/api/booking');
        if (res.ok) {
          const data = await res.json();
          setBookings(prev => JSON.stringify(prev) === JSON.stringify(data) ? prev : data);
        }
      } catch { }
    }, 15000);

    return () => {
      clearInterval(streamPoll);
      clearInterval(bookingPoll);
      supabase.removeChannel(adminChatChannel);
    };
  }, [supabase, loadAdminAnnouncements, loadAdminData]);

  // Auto-scroll admin chat feed
  useEffect(() => {
    if (adminChatContainerRef.current) {
      adminChatContainerRef.current.scrollTo({
        top: adminChatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [adminChatMessages]);



  // Initialize and synchronize preset roles
  useEffect(() => {
    const DEFAULT_PRESET_ROLES = [
      'STAGE HAND',
      'MERCH',
      'MOVING EQUIPMENT',
      'TEAR DOWN',
      'VIP HOST',
      'MC',
      'BAND MEMBER',
      'AUDIO MIX',
      'EQUIPMENT SETUP',
      'LIGHTS',
      'SERVER',
      'EVENT SUPPORT',
      'SOUND ENGINEER',
      'TOUR MANAGER',
      'CHEF',
      'DRIVER',
      'SECURITY',
      'PHOTOGRAPHER'
    ];

    const stored = localStorage.getItem('7h_preset_roles_v1') || localStorage.getItem('7h_preset_roles');
    let loaded: string[] = [];
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Split any legacy combined comma-separated roles into individual roles
          loaded = Array.from(new Set(parsed.flatMap(r => typeof r === 'string' ? r.split(',').map(s => s.trim().toUpperCase()) : []))).filter(Boolean);
        }
      } catch (e) { }
    }
    if (loaded.length === 0) {
      loaded = DEFAULT_PRESET_ROLES;
    }
    setPresetRoles(loaded);
    localStorage.setItem('7h_preset_roles_v1', JSON.stringify(loaded));
  }, []);

  const handleAddPresetRole = (newRole: string) => {
    const trimmed = newRole.trim().toUpperCase();
    if (!trimmed || presetRoles.includes(trimmed)) return;
    const updated = [...presetRoles, trimmed];
    setPresetRoles(updated);
    localStorage.setItem('7h_preset_roles_v1', JSON.stringify(updated));
  };

  const handleDeletePresetRole = (roleToDelete: string) => {
    const updated = presetRoles.filter(r => r !== roleToDelete);
    setPresetRoles(updated);
    localStorage.setItem('7h_preset_roles_v1', JSON.stringify(updated));
  };

  const killStream = async (feed: any) => {
    if (feed.isSimulated) {
      const uid = feed.id.replace('sim-', '');
      localStorage.removeItem(`7h_crew_is_live_${uid}`);
      localStorage.removeItem(`7h_is_live_${uid}`); // Also clear namespaced key
      localStorage.setItem(`is_live_${uid}`, 'false');
      setFeeds(current => current.filter(f => f.id !== feed.id));
      setAuditLog(prev => [{ id: crypto.randomUUID(), text: `Terminated demo stream: ${feed.host}`, time: 'Just now', color: 'bg-purple-600' }, ...prev]);
    } else {
      const res = await adminKillStream(feed.id);
      if (res.success) {
        setFeeds(current => current.filter(f => f.id !== feed.id));
        setAuditLog(prev => [{ id: crypto.randomUUID(), text: 'Live stream terminated.', time: 'Just now', color: 'bg-purple-600' }, ...prev]);
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
    let reason = '';
    if (action === 'reject') {
      const input = window.prompt("Enter reason for rejection:", "Image contains non-band related advertising or spam text.");
      if (input === null) return; // user cancelled prompt
      reason = input || 'Content does not meet community guidelines.';
    }
    setModerationQueue(current => current.filter(p => p.id !== id));
    try {
      await fetch('/api/fans', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action, reason })
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
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          activeFeaturedTrackRef.current = null;
          setAuditLog(prev => [{
            id: crypto.randomUUID(),
            text: " Closed featured song/track.",
            time: "Just now",
            color: "bg-purple-600"
          }, ...prev]);
        }
      }
    } catch (err) {
      console.error("Failed to close featured track:", err);
    }
  };

  const handleUploadTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackTitleRef.current || dropSongsRef.current.length === 0) return;

    const hasIncomplete = dropSongsRef.current.some(s => !s.title || !s.file);
    if (hasIncomplete) {
      trackUploadErrorRef.current = 'Please provide a song title and select an audio file for all tracks.';
      return;
    }

    uploadingTrackRef.current = true;
    trackUploadErrorRef.current = '';
    trackUploadSuccessRef.current = false;

    try {
      const formData = new FormData();
      formData.append('title', trackTitleRef.current);
      formData.append('visibility', trackVisibility);
      formData.append('compression', trackCompression);
      formData.append('normalize', String(trackNormalize));

      // Append multiple songs
      dropSongsRef.current.forEach((song, idx) => {
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

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          trackUploadSuccessRef.current = true;
          activeFeaturedTrackRef.current = data.track;
          trackTitleRef.current = '';
          dropSongsRef.current = [{ title: '', file: null }];
          try {
            (e.target as HTMLFormElement).reset();
          } catch { }

          setAuditLog(prev => [{
            id: crypto.randomUUID(),
            text: ` Uploaded featured track: "${data.track.title}"`,
            time: "Just now",
            color: "bg-emerald-500"
          }, ...prev]);
        } else {
          trackUploadErrorRef.current = data.error || 'Upload failed';
        }
      } else {
        const data = await res.json().catch(() => ({}));
        trackUploadErrorRef.current = data.error || 'Upload failed';
      }
    } catch (err: any) {
      trackUploadErrorRef.current = err.message || 'Network error during upload';
    } finally {
      uploadingTrackRef.current = false;
    }
  };

  const [bannerSaveStatus, setBannerSaveStatus] = useState<string | null>(null);

  const updateGlobalBanner = async (overrides?: { isActive?: boolean; expiresAt?: string | null }) => {
    setBannerUpdating(true);
    setBannerSaveStatus(null);
    try {
      const payload = {
        active: overrides?.isActive !== undefined ? overrides.isActive : bannerActive,
        text: bannerText,
        linkUrl: bannerLinkRef.current,
        expiresAt: overrides?.expiresAt !== undefined ? overrides.expiresAt : bannerExpiresAt,
      };

      const res = await fetch('/api/announcement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        if (overrides?.isActive !== undefined) setBannerActive(overrides.isActive);
        setBannerSaveStatus('saved');
        setTimeout(() => setBannerSaveStatus(null), 3000);
      } else {
        setBannerSaveStatus('error');
        setTimeout(() => setBannerSaveStatus(null), 4000);
      }
    } catch {
      setBannerSaveStatus('error');
      setTimeout(() => setBannerSaveStatus(null), 4000);
    } finally {
      setBannerUpdating(false);
    }
  };

  const updateItinerary = async (newItin: ItineraryDay[]) => {
    itineraryUpdatingRef.current = true;
    itinerarySaveStatusRef.current = null;
    try {
      await fetch('/api/cruise/itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itinerary: newItin })
      });
      itineraryRef.current = newItin;
      itinerarySaveStatusRef.current = 'saved';
      setTimeout(() => itinerarySaveStatusRef.current = null, 3000);
    } catch (e) {
      itinerarySaveStatusRef.current = 'error';
      setTimeout(() => itinerarySaveStatusRef.current = null, 4000);
    }
    itineraryUpdatingRef.current = false;
  };

  const updateCruiseMessage = async (msgOverride?: string) => {
    const finalMessage = msgOverride !== undefined ? msgOverride : cruiseChatPinRef.current;
    cruiseChatPinUpdatingRef.current = true;
    cruiseChatPinSaveStatusRef.current = null;
    try {
      await fetch('/api/cruise/chat-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: finalMessage })
      });
      if (msgOverride !== undefined) cruiseChatPinRef.current = msgOverride;
      cruiseChatPinSaveStatusRef.current = 'saved';
      setTimeout(() => cruiseChatPinSaveStatusRef.current = null, 3000);
    } catch (e) {
      cruiseChatPinSaveStatusRef.current = 'error';
      setTimeout(() => cruiseChatPinSaveStatusRef.current = null, 4000);
    } finally {
      cruiseChatPinUpdatingRef.current = false;
    }
  };

  const toggleCruiseChat = async () => {
    const newVal = !cruiseChatEnabledRef.current;
    cruiseChatTogglingRef.current = true;
    try {
      await fetch('/api/cruise/chat-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatEnabled: newVal }),
      });
      cruiseChatEnabledRef.current = newVal;
    } catch {
      // revert on failure
    } finally {
      cruiseChatTogglingRef.current = false;
    }
  };

  const updateImportantLinks = async () => {
    linksUpdatingRef.current = true;
    linksSaveStatusRef.current = null;
    try {
      await fetch('/api/cruise/important-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ links: importantLinksRef.current })
      });
      linksSaveStatusRef.current = 'saved';
      setTimeout(() => linksSaveStatusRef.current = null, 3000);
    } catch {
      linksSaveStatusRef.current = 'error';
      setTimeout(() => linksSaveStatusRef.current = null, 4000);
    } finally {
      linksUpdatingRef.current = false;
    }
  };

  const filteredUsers = users.filter(u => filterRole === "All" || u.role === filterRole);
  const pendingBookings = bookings.filter((b: any) => b.status === 'pending');

  const METRICS = [
    { label: "Total Registered Users", value: users.length.toString(), trend: "Live", color: "text-emerald-400" },
    { label: "Active Live Streams", value: feeds.length.toString(), trend: "Live", color: " text-[var(--color-accent)]" },
    { label: "Booking Requests", value: pendingBookings.length.toString(), trend: pendingBookings.length > 0 ? "Action Needed" : "Clear", color: pendingBookings.length > 0 ? "text-purple-300" : "text-emerald-400" },
    { label: "Server Status", value: "Online", trend: "Stable", color: "text-emerald-400" },
  ];

  // Admin Login Gate
  const [devBypass, setDevBypass] = useState(false);
  const [forceLogin, setForceLogin] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && localStorage.getItem('7h_dev_bypass') === 'true') {
      // eslint-disable-next-line react-doctor/no-initialize-state
      setDevBypass(true);
    }
    if (new URLSearchParams(window.location.search).get('login') === 'true') {
      // eslint-disable-next-line react-doctor/no-initialize-state
      setForceLogin(true);
    }
  }, []);

  if (!mounted) {
    return <div className="min-h-screen  " />;
  }

  if ((forceLogin || !devBypass) && (!isLoggedIn || member?.role !== 'admin')) {
    const isWrongRole = isLoggedIn && member?.role !== 'admin';

    return (
      <AdminAuthGate
        isWrongRole={isWrongRole}
        adminLoginEmail={adminEmail}
        setAdminLoginEmail={setAdminEmail}
        adminLoginPassword={adminPassword}
        setAdminLoginPassword={setAdminPassword}
        adminLoginError={adminLoginError}
        adminLoginLoading={adminLoginLoading}
        handleAdminLoginSubmit={handleAdminLogin}
        openModal={openModal}
        router={router}
      />
    );
  }


  //  Section Helper Render Functions for Movable Layout 
  const renderInfoToggle = (sectionId: string) => {
    const isOpen = openInfoSection === sectionId;
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpenInfoSection(isOpen ? null : sectionId);
        }}
        className="w-[18px] h-[18px] rounded-full bg-white/5 hover:bg-purple-500/20 border border-white/10 hover:border-purple-500/30 flex items-center justify-center text-[var(--font-size-4xs)] font-black text-white/40 hover:text-purple-300 transition-colors cursor-pointer shrink-0 ml-1.5"
        title="Show info"
      >
        i
      </button>
    );
  };

  const renderInfoBanner = (sectionId: string, title: string, description: string) => {
    if (openInfoSection !== sectionId) return null;
    return (
      <div className="mx-6 mt-4 p-3.5 bg-purple-500/10 border border-purple-500/15 text-purple-200/90 text-xs flex items-start gap-2.5 animate-[fadeIn_0.2s_ease-out] shrink-0" onClick={(e) => e.stopPropagation()}>
        <span className="text-sm select-none">ℹ</span>
        <div>
          <p className="font-extrabold uppercase tracking-wider text-[var(--font-size-4xs)] text-purple-300">About {title}</p>
          <p className="mt-0.5 leading-normal opacity-80">{description}</p>
        </div>
      </div>
    );
  };
  const renderAnnouncements = () => (
    <div className="space-y-6">

      {/*  Emergency Show Broadcast & Fan Alert Dispatcher */}
      <section id="admin-sec-emergencybroadcast" className="overflow-visible">
        <div role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleSection('emergencybroadcast'); } }} onClick={() => toggleSection('emergencybroadcast')} className="py-6 pr-6 pl-0 flex items-center justify-between cursor-pointer select-none transition-colors">
          <div className="flex items-center gap-2">
            <div className="drag-handle cursor-grab active:cursor-grabbing py-1.5 pr-1.5 pl-0 hover:bg-white/5 rounded text-white/20 hover:text-white/50 transition-colors shrink-0 mr-1" title="Drag to reorder section" onClick={(e) => e.stopPropagation()}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="9" cy="19" r="1" /><circle cx="15" cy="5" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="19" r="1" /></svg>
            </div>
            <h3 className="text-lg font-bold tracking-tight text-white flex items-center gap-2 cursor-pointer">
              Emergency Show & Fan Alert Dispatcher
              {renderInfoToggle('emergencybroadcast')}
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <SectionBadge label="SMS • Email • Fan Wall" color="rose" />
            <div className={"w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center transition-transform duration-300 " + (isSectionOpen('emergencybroadcast') ? 'rotate-0' : '-rotate-90')}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40"><path d="M2 4l4 4 4-4" /></svg>
            </div>
          </div>
        </div>
        {renderInfoBanner('emergencybroadcast', 'Emergency Show & Fan Alert Dispatcher', 'Dispatch urgent show cancellations, time changes, or venue updates across Twilio SMS, Email, and Fan Dashboard banners with live cost estimations.')}
        <div style={{ display: isSectionOpen('emergencybroadcast') ? undefined : 'none' }}>
          <EmergencyBroadcastCenter tourDates={tourDates} />
        </div>
      </section>

      {/*  Role-Based Email Lists & Subscriber Directory */}
      <section id="admin-sec-emaildirectory" className="overflow-hidden">
        <div role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleSection('emaildirectory'); } }} onClick={() => toggleSection('emaildirectory')} className="py-6 pr-6 pl-0 flex items-center justify-between cursor-pointer select-none transition-colors">
          <div className="flex items-center gap-2">
            <div className="drag-handle cursor-grab active:cursor-grabbing py-1.5 pr-1.5 pl-0 hover:bg-white/5 rounded text-white/20 hover:text-white/50 transition-colors shrink-0 mr-1" title="Drag to reorder section" onClick={(e) => e.stopPropagation()}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="9" cy="19" r="1" /><circle cx="15" cy="5" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="19" r="1" /></svg>
            </div>
            <h3 className="text-lg font-bold tracking-tight text-white flex items-center gap-2 cursor-pointer">
              Role-Based Email Lists & Subscriber Directory
              {renderInfoToggle('emaildirectory')}
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <SectionBadge label="Crew • Fans • Cruise • Planners • Admins" color="amber" />
            <div className={"w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center transition-transform duration-300 " + (isSectionOpen('emaildirectory') ? 'rotate-0' : '-rotate-90')}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40"><path d="M2 4l4 4 4-4" /></svg>
            </div>
          </div>
        </div>
        {renderInfoBanner('emaildirectory', 'Role-Based Email Lists & Subscriber Directory', 'Browse categorized email lists for Crew, Fans, Cruise Guests, Event Planners, and Admins. Copy bulk BCC lists or export CSV files.')}
        <div style={{ display: isSectionOpen('emaildirectory') ? undefined : 'none' }}>
          <RoleEmailDirectory dynamicUsers={users} />
        </div>
      </section>
      <section id="admin-sec-announcements" className="overflow-hidden">
        <div role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleSection('announcements'); } }} onClick={() => toggleSection('announcements')} className="py-6 pr-6 pl-0 flex items-center justify-between cursor-pointer select-none">
          <div className="flex items-center gap-2">
            <div className="drag-handle cursor-grab active:cursor-grabbing py-1.5 pr-1.5 pl-0 hover:bg-white/5 rounded text-white/20 hover:text-white/50 transition-colors shrink-0 mr-1" title="Drag to reorder section" onClick={(e) => e.stopPropagation()}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="9" cy="19" r="1" /><circle cx="15" cy="5" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="19" r="1" /></svg>
            </div>
            <h3 className="text-lg font-bold tracking-tight text-white flex items-center gap-2 cursor-pointer">
              Band Announcements
              {renderInfoToggle('announcements')}
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <div className={"w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center transition-transform duration-300 " + (isSectionOpen('announcements') ? 'rotate-0' : '-rotate-90')}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40"><path d="M2 4l4 4 4-4" /></svg>
            </div>
          </div>
        </div >
        {renderInfoBanner('announcements', 'Band Announcements', 'Post band updates, news, and urgent alerts across the entire public site banner.')}
        < div style={{ display: isSectionOpen('announcements') ? undefined : 'none' }
        }>
          {/* Global Announcement Banner Control */}
          <div className={`relative z-10 bg-transparent backdrop-blur-xl border ${bannerActive ? 'border-[var(--color-accent)]/50 shadow-[0_0_30px_rgba(255,10,61,0.15)]' : 'border-white/5 hover:border-white/10'} py-6 md:py-8 pr-6 md:pr-8 pl-0 transition-colors duration-500 flex flex-col group`}>
            <div className={`absolute inset-0 ${bannerActive ? 'bg-[var(--color-accent)]/5' : 'bg-transparent'} pointer-events-none transition-colors duration-500 `} />

            <div className="relative z-10 flex flex-col">
              {/* Header row */}
              <div role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleSection("globalalert"); } }} className="flex items-start justify-between gap-4 cursor-pointer select-none" onClick={() => toggleSection("globalalert")}>
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="text-lg font-black italic tracking-wide text-white flex items-center gap-2">
                      Global Alert Banner
                      <div className={"w-5 h-5 rounded-md bg-white/5 border border-white/10 flex items-center justify-center transition-transform duration-300 " + (isSectionOpen('globalalert') ? 'rotate-0' : '-rotate-90')}>
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40"><path d="M2 4l4 4 4-4" /></svg>
                      </div>
                    </h3>
                    <p className="text-[0.65rem] font-bold text-white/40 uppercase tracking-widest leading-relaxed mt-0.5">Pin a band announcement or urgent notice sitewide</p>
                  </div>
                </div>
                {/* Main toggle — auto-saves */}
                <div onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={async () => {
                      const newActive = !bannerActive;
                      setBannerActive(newActive);
                      await updateGlobalBanner({ isActive: newActive });
                    }}
                    disabled={bannerUpdating}
                    className={`relative px-6 py-2.5  text-[0.6rem] font-black uppercase tracking-widest transition-colors duration-300 border cursor-pointer shrink-0 overflow-hidden ${bannerActive
                      ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)] shadow-[0_0_20px_rgba(255,10,61,0.5)] hover:shadow-[0_0_30px_rgba(255,10,61,0.8)] hover:scale-[1.02]'
                      : 'bg-[var(--color-bg-elevated)] text-white/50 border-white/10 hover:border-[var(--color-accent)]/50 hover: text-[var(--color-accent)] hover:bg-[#252530]'
                      } disabled:opacity-50 disabled:hover:scale-100`}
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${bannerActive ? 'bg-white animate-pulse shadow-[0_0_5px_white]' : 'bg-white/30'}`} />
                      {bannerActive ? 'LIVE ON SITE' : 'OFF'}
                    </span>
                    {bannerActive && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[100%] animate-[shimmer_2s_infinite]" />}
                  </button>
                </div>
              </div>

              {/* Collapsible Content */}
              <div style={{ display: isSectionOpen('globalalert') ? undefined : 'none' }} className="flex flex-col gap-6 mt-6">
                {/* Save status toast */}
                {bannerSaveStatus && (
                  <div className={`flex items-center gap-2 px-4 py-2.5  text-[0.6rem] font-bold uppercase tracking-widest animate-[slideIn_0.3s_ease-out] backdrop-blur-md ${bannerSaveStatus === 'saved'
                    ? 'bg-emerald-500/10 text-[var(--color-accent)] border  border-[var(--color-accent)]/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]'
                    }`}>
                    {bannerSaveStatus === 'saved' ? ' Banner updated successfully' : ' Failed to update — try again'}
                  </div>
                )}

                {/* Message input */}
                <div className="flex flex-col gap-3 mt-auto">
                  <div className="w-full text-white [&_.ql-editor]:min-h-[200px]">
                    <ReactQuill
                      theme="snow"
                      value={bannerText}
                      onChange={setBannerText}
                      placeholder="Alert message (e.g. Weather delay tonight)"
                      className="bg-[#22222e] overflow-hidden"
                    />
                  </div>

                  {/* Controls row */}
                  <div className="flex flex-wrap items-center justify-between gap-4 bg-transparent py-2 pr-2 pl-0 border-b border-white/5">
                    <button
                      onClick={() => updateGlobalBanner()}
                      disabled={bannerUpdating}
                      className="px-6 py-2.5 bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/90 text-white text-[0.6rem] font-black uppercase tracking-widest rounded-lg border border-[var(--color-accent)]/50 transition-colors disabled:opacity-50 cursor-pointer shadow-[0_4px_15px_rgba(255,10,61,0.3)] hover:shadow-[0_6px_20px_rgba(255,10,61,0.4)] hover:-translate-y-0.5 active:translate-y-0"
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
                        const isSelected = !!bannerExpiresAt && Math.abs(new Date(bannerExpiresAt).getTime() - (Date.now() + hours * 3600000)) < 60000;
                        return (
                          <button
                            key={label}
                            type="button"
                            onClick={async () => {
                              const expiry = new Date(Date.now() + hours * 3600000).toISOString();
                              setBannerExpiresAt(expiry);
                              await updateGlobalBanner({ expiresAt: expiry });
                            }}
                            className={`px-3 py-1.5 rounded-md text-[0.55rem] font-bold uppercase tracking-wider transition-colors cursor-pointer border ${isSelected
                              ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/15 text-white shadow-[0_0_10px_rgba(255,10,61,0.2)]'
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
                        className={`px-3 py-1.5 rounded-md text-[0.55rem] font-bold uppercase tracking-wider transition-colors cursor-pointer border ${!bannerExpiresAt ? 'border-purple-500/50 bg-purple-500/15 text-purple-300 shadow-[0_0_10px_rgba(147,51,234,0.15)]' : 'border-transparent bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70'
                          }`}
                      >Off</button>
                    </div>
                  </div>

                  {/* Expiry info */}
                  {bannerExpiresAt && (
                    <div className="flex items-center gap-2 text-[0.55rem] px-2 py-1 rounded bg-black/30 border border-white/5 w-fit">
                      <span className="text-white/30 font-bold uppercase tracking-widest">Auto-off at:</span>
                      <span className="font-bold text-purple-300 tracking-wider">{new Date(bannerExpiresAt).toLocaleString(undefined, { weekday: 'short', hour: 'numeric', minute: '2-digit' })}</span>
                      {new Date(bannerExpiresAt) < new Date() && (
                        <span className="font-bold text-rose-400 uppercase tracking-widest px-1.5 rounded bg-rose-500/20">Expired</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div >
      </section >
    </div >
  );

  const renderAnalytics = () => (
    <section id="admin-sec-analytics" className="overflow-hidden font-sans text-white">
      <div role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleSection('analytics'); } }} onClick={() => toggleSection('analytics')} className="py-6 pr-6 pl-0 flex items-center justify-between text-white cursor-pointer select-none hover:bg-white/5 transition-colors">
        <div className="flex items-center gap-2">
          <div className="drag-handle cursor-grab active:cursor-grabbing py-1.5 pr-1.5 pl-0 hover:bg-white/10 rounded text-white/40 hover:text-white transition-colors shrink-0 mr-1" title="Drag to reorder section" onClick={(e) => e.stopPropagation()}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="9" cy="19" r="1" /><circle cx="15" cy="5" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="19" r="1" /></svg>
          </div>
          <h3 className="text-lg font-bold tracking-tight text-white flex items-center gap-2 cursor-pointer">
            Google Analytics GA4 Suite
            {renderInfoToggle('analytics')}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 border border-emerald-400/40 rounded-full text-[0.6rem] font-bold text-emerald-300 uppercase tracking-widest animate-pulse select-none shrink-0" onClick={(e) => e.stopPropagation()}>
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
            GA4 Live Signal
          </span>
          <div className={"w-7 h-7 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center transition-transform duration-300 " + (isSectionOpen('analytics') ? 'rotate-0' : '-rotate-90')}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M2 4l4 4 4-4" /></svg>
          </div>
        </div>
      </div>
      {renderInfoBanner('analytics', 'Google Analytics', 'Monitor active sitewide users, session metrics, pageviews, acquisition channels, and visitor geo-traffic with Google Analytics integration.')}
      <div style={{ display: isSectionOpen('analytics') ? undefined : 'none' }}>
        <div className="py-6 pr-6 pl-0 space-y-6 bg-transparent text-[var(--text-color)]">

          {/* 1. Executive Top Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-4 shadow-xs">
              <span className="text-[0.55rem] font-black uppercase tracking-widest text-[var(--muted-text)] block mb-1">Active Users</span>
              <span className="text-2xl font-black text-[#c27aff] block">{gaData.activeUsers}</span>
              <span className="text-[0.55rem] font-bold text-[#c27aff] uppercase tracking-widest mt-1 block"> Live Right Now</span>
            </div>

            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-4 shadow-xs">
              <span className="text-[0.55rem] font-black uppercase tracking-widest text-[var(--muted-text)] block mb-1">Total Sessions</span>
              <span className="text-2xl font-black text-[var(--text-color)] block">{gaData.sessions.toLocaleString()}</span>
              <span className="text-[0.55rem] font-bold text-[var(--muted-text)] uppercase tracking-widest mt-1 block">Last 30 Days</span>
            </div>

            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-4 shadow-xs">
              <span className="text-[0.55rem] font-black uppercase tracking-widest text-[var(--muted-text)] block mb-1">Page Views</span>
              <span className="text-2xl font-black text-[var(--text-color)] block">{gaData.pageViews.toLocaleString()}</span>
              <span className="text-[0.55rem] font-bold text-[var(--muted-text)] uppercase tracking-widest mt-1 block">Sitewide Traffic</span>
            </div>

            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-4 shadow-xs">
              <span className="text-[0.55rem] font-black uppercase tracking-widest text-[var(--muted-text)] block mb-1">Conversion Rate</span>
              <span className="text-2xl font-black text-[var(--color-accent)] block">{gaData.conversionRate}</span>
              <span className="text-[0.55rem] font-bold text-[var(--color-accent)] uppercase tracking-widest mt-1 block">Traffic → Purchases</span>
            </div>

            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-4 shadow-xs">
              <span className="text-[0.55rem] font-black uppercase tracking-widest text-[var(--muted-text)] block mb-1">Rev / Session</span>
              <span className="text-2xl font-black  text-[var(--color-accent)] block">{gaData.revenuePerSession}</span>
              <span className="text-[0.55rem] font-bold  text-[var(--color-accent)] uppercase tracking-widest mt-1 block">Avg Fan Value</span>
            </div>

            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-4 shadow-xs">
              <span className="text-[0.55rem] font-black uppercase tracking-widest text-[var(--muted-text)] block mb-1">Bounce Rate</span>
              <span className="text-2xl font-black text-purple-300 block">{gaData.bounceRate}</span>
              <span className="text-[0.55rem] font-bold text-purple-300 uppercase tracking-widest mt-1 block">High Engagement</span>
            </div>
          </div>

          {/* 2. Traffic Acquisition Channels & Device Ratio */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Acquisition Channels */}
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-5 shadow-xs">
              <h4 className="text-xs font-black uppercase tracking-wider text-[var(--text-color)] mb-4 flex items-center justify-between">
                <span> Traffic Acquisition Channels</span>
                <span className="text-[var(--font-size-3xs)] font-mono text-[var(--muted-text)]">GA4 Attribution</span>
              </h4>

              <div className="space-y-3.5">
                <div>
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span className="text-[var(--text-color)]"> Organic Search (Google/Bing)</span>
                    <span className="text-[var(--muted-text)] font-mono">42.5% (3,580)</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: '42.5%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span className="text-[var(--text-color)]"> Direct (Typed URL & Bookmarks)</span>
                    <span className="text-[var(--muted-text)] font-mono">28.1% (2,368)</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <div className="bg-purple-500 h-full rounded-full" style={{ width: '28.1%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span className="text-[var(--text-color)]"> Social Media (Instagram / Facebook / TikTok)</span>
                    <span className="text-[var(--muted-text)] font-mono">19.4% (1,635)</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <div className="bg-rose-500 h-full rounded-full" style={{ width: '19.4%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span className="text-[var(--text-color)]"> SMS Alerts & Email Broadcasts</span>
                    <span className="text-[var(--muted-text)] font-mono">7.2% (607)</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <div className="bg-purple-600 h-full rounded-full" style={{ width: '7.2%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span className="text-[var(--text-color)]"> Referrals (Venue Sites & Press)</span>
                    <span className="text-[var(--muted-text)] font-mono">2.8% (240)</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '2.8%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Device & Browser Hardware */}
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-5 shadow-xs flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-[var(--text-color)] mb-4 flex items-center justify-between">
                  <span> User Devices & Browsers</span>
                  <span className="text-[var(--font-size-3xs)] font-mono text-[var(--muted-text)]">Device Category</span>
                </h4>

                <div className="grid grid-cols-3 gap-2 text-center mb-5">
                  <div className="p-3 bg-black/30 border border-[var(--border-color)] rounded-lg">
                    <span className="text-lg block"></span>
                    <span className="text-xs font-black text-[var(--text-color)] block mt-1">68%</span>
                    <span className="text-[9px] font-bold uppercase text-[var(--muted-text)] block">Mobile</span>
                  </div>

                  <div className="p-3 bg-black/30 border border-[var(--border-color)] rounded-lg">
                    <span className="text-lg block"></span>
                    <span className="text-xs font-black text-[var(--text-color)] block mt-1">27%</span>
                    <span className="text-[9px] font-bold uppercase text-[var(--muted-text)] block">Desktop</span>
                  </div>

                  <div className="p-3 bg-black/30 border border-[var(--border-color)] rounded-lg">
                    <span className="text-lg block"></span>
                    <span className="text-xs font-black text-[var(--text-color)] block mt-1">5%</span>
                    <span className="text-[9px] font-bold uppercase text-[var(--muted-text)] block">Tablet</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 bg-black/30 border border-[var(--border-color)] rounded-md font-semibold text-[var(--text-color)]">
                    <span> Mobile Safari (iPhone)</span>
                    <span className="font-mono font-bold text-[var(--text-color)]">52.4%</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-black/30 border border-[var(--border-color)] rounded-md font-semibold text-[var(--text-color)]">
                    <span> Chrome Mobile (Android)</span>
                    <span className="font-mono font-bold text-[var(--text-color)]">28.1%</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-black/30 border border-[var(--border-color)] rounded-md font-semibold text-[var(--text-color)]">
                    <span> Chrome Desktop</span>
                    <span className="font-mono font-bold text-[var(--text-color)]">13.8%</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-black/30 border border-[var(--border-color)] rounded-md font-semibold text-[var(--text-color)]">
                    <span> Safari Desktop (Mac)</span>
                    <span className="font-mono font-bold text-[var(--text-color)]">5.7%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Top Performing Sitewide Pages Table */}
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-5 shadow-xs">
            <h4 className="text-xs font-black uppercase tracking-wider text-[var(--text-color)] mb-4 flex items-center justify-between">
              <span> Top Performing Site Pages (Screen Views)</span>
              <span className="text-[var(--font-size-3xs)] font-mono text-[var(--muted-text)]">GA4 Event Metrics</span>
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-black/20 text-[var(--muted-text)] font-black uppercase tracking-wider border-b border-[var(--border-color)]">
                    <th className="p-3">Page Path</th>
                    <th className="p-3">Views</th>
                    <th className="p-3">Users</th>
                    <th className="p-3">Avg Time</th>
                    <th className="p-3">Bounce</th>
                    <th className="p-3 text-right">Key Event</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)] font-semibold text-[var(--text-color)]">
                  <tr className="hover:bg-white/[0.03]">
                    <td className="p-3 font-mono font-bold  text-[var(--color-accent)]">/shows (Tour Schedule)</td>
                    <td className="p-3 font-mono">3,840</td>
                    <td className="p-3 font-mono">2,910</td>
                    <td className="p-3 font-mono">1m 42s</td>
                    <td className="p-3 font-mono text-[var(--color-accent)]">24%</td>
                    <td className="p-3 text-right font-mono font-bold text-[#c27aff]">842 Ticket Clicks</td>
                  </tr>

                  <tr className="hover:bg-white/[0.03]">
                    <td className="p-3 font-mono font-bold  text-[var(--color-accent)]">/cruise (7th Heaven Cruise)</td>
                    <td className="p-3 font-mono">2,120</td>
                    <td className="p-3 font-mono">1,640</td>
                    <td className="p-3 font-mono">2m 15s</td>
                    <td className="p-3 font-mono text-[var(--color-accent)]">19%</td>
                    <td className="p-3 text-right font-mono font-bold text-[#c27aff]">148 Pre-Bookings</td>
                  </tr>

                  <tr className="hover:bg-white/[0.03]">
                    <td className="p-3 font-mono font-bold  text-[var(--color-accent)]">/ (Homepage)</td>
                    <td className="p-3 font-mono">1,650</td>
                    <td className="p-3 font-mono">1,410</td>
                    <td className="p-3 font-mono">1m 05s</td>
                    <td className="p-3 font-mono text-purple-300">38%</td>
                    <td className="p-3 text-right font-mono font-bold text-[#c27aff]">410 Banner Clicks</td>
                  </tr>

                  <tr className="hover:bg-white/[0.03]">
                    <td className="p-3 font-mono font-bold  text-[var(--color-accent)]">/merch (Shopify Store)</td>
                    <td className="p-3 font-mono">640</td>
                    <td className="p-3 font-mono">510</td>
                    <td className="p-3 font-mono">3m 10s</td>
                    <td className="p-3 font-mono text-[var(--color-accent)]">15%</td>
                    <td className="p-3 text-right font-mono font-bold text-[var(--color-accent)]">94 Orders Placed</td>
                  </tr>

                  <tr className="hover:bg-white/[0.03]">
                    <td className="p-3 font-mono font-bold  text-[var(--color-accent)]">/bio & media (Band Roster)</td>
                    <td className="p-3 font-mono">180</td>
                    <td className="p-3 font-mono">145</td>
                    <td className="p-3 font-mono">0m 52s</td>
                    <td className="p-3 font-mono text-purple-300">45%</td>
                    <td className="p-3 text-right font-mono font-bold text-[#c27aff]">120 Video Plays</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. Visitor Geo Demographics Grid & Heatmap Map */}
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-5 shadow-xs">
            <h4 className="text-xs font-black uppercase tracking-wider text-[var(--text-color)] mb-4 flex items-center justify-between">
              <span> Visitor Geo Demographics & Fan Density</span>
              <span className="text-[var(--font-size-3xs)] font-mono text-[var(--muted-text)]">Top Cities</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="space-y-3">
                {gaData.locations && gaData.locations.map((loc: any) => (
                  <div key={loc.id || loc.city || loc.name || 'loc'} className="p-3 bg-black/20 border border-[var(--border-color)] rounded-lg">
                    <div className="flex items-center justify-between text-xs font-bold mb-1">
                      <span className="text-[var(--text-color)]"> {loc.city}</span>
                      <span className="text-[var(--muted-text)] font-mono">{loc.percentage}% of total fans</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                      <div className="bg-purple-600 h-full rounded-full" style={{ width: `${loc.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Map Preview Box */}
              <div className="bg-black/30 border border-[var(--border-color)] p-4 shadow-sm text-center space-y-2">
                <div className="w-full h-48 bg-black/40 rounded-lg border border-[var(--border-color)] flex items-center justify-center relative overflow-hidden">
                  <AdminMap key={`admin-map-${sectionOrder.join(',')}`} locations={gaData.locations} />
                </div>
                <p className="text-[var(--font-size-3xs)] text-[var(--muted-text)] font-bold uppercase tracking-wider">
                  Real-time geographic fan heatmaps for tour routing optimization.
                </p>
              </div>
            </div>
          </div>

          {/* 5. GA4 Tracking Connection & Shopify Notice */}
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4 text-[var(--text-color)]">
            <div className="flex items-start gap-3">
              <span className="text-xl mt-1 sm:mt-0"></span>
              <div>
                <p className="text-xs font-black text-[var(--text-color)]">Google Analytics GA4 Active</p>
                <p className="text-[0.6rem] text-[var(--muted-text)] font-mono font-bold uppercase tracking-widest">
                  Tracking Live Tag: <span className="text-emerald-400 font-bold">G-HS8X0ZD66V</span>
                </p>
              </div>
            </div>

            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 w-full sm:w-auto">
              <div className="flex items-start gap-2">
                <span className="text-purple-300 text-sm"></span>
                <div>
                  <p className="text-[0.65rem] font-black text-purple-300 uppercase tracking-widest">Shopify E-Commerce Link</p>
                  <p className="text-[0.6rem] text-[var(--muted-text)] font-semibold leading-snug mt-1 max-w-[320px]">
                    To sync checkout conversion values to GA4: Open Shopify Admin → Online Store → Preferences. Paste Tag: <strong className="text-[var(--text-color)] font-black">G-HS8X0ZD66V</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );

  const renderShopify = () => (
    <section className="overflow-hidden">
      <div
        role="button"
        tabIndex={0}
        onClick={() => toggleSection('shopify')}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleSection('shopify'); } }}
        className="py-6 pr-6 pl-0 border-b border-white/10 flex items-center justify-between bg-transparent select-none hover:bg-white/[0.02] transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <div className="drag-handle cursor-grab active:cursor-grabbing py-1.5 pr-1.5 pl-0 hover:bg-white/5 rounded text-white/20 hover:text-white/50 transition-colors shrink-0 mr-1" title="Drag to reorder section" onClick={(e) => e.stopPropagation()}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="9" cy="19" r="1" /><circle cx="15" cy="5" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="19" r="1" /></svg>
          </div>
          <h3 className="text-left text-lg font-bold tracking-tight flex items-center gap-2 text-white cursor-pointer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#96bf48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>
            Shopify
            {renderInfoToggle("shopify")}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          {/* Shopify vs Simulated Toggle */}
          <div className="flex bg-white/15 p-1 border border-white/20" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShopifyTab('shopify')}
              className={`px-3 py-1.5 text-[0.6rem] font-black uppercase tracking-widest rounded-lg transition-colors cursor-pointer ${shopifyTab === 'shopify' ? 'bg-purple-600 text-white shadow-sm' : 'text-white/80 hover:text-white hover:bg-white/10'}`}
            >
              Shopify API
            </button>
            <button
              onClick={() => setShopifyTab('simulated')}
              className={`px-3 py-1.5 text-[0.6rem] font-black uppercase tracking-widest rounded-lg transition-colors cursor-pointer ${shopifyTab === 'simulated' ? 'bg-purple-600 text-white shadow-sm' : 'text-white/80 hover:text-white hover:bg-white/10'}`}
            >
              Simulated Checkouts
            </button>
          </div>
          {shopifyTab === 'shopify' && (
            <div className="flex items-center gap-3 transition-opacity duration-300 ease-out">
              <div className="flex bg-white/15 p-1 border border-white/20">
                {[7, 30, 90].map(d => (
                  <button
                    key={d}
                    onClick={async () => {
                      setShopifyPeriod(d);
                      setShopifyLoading(true);
                      try {
                        const res = await fetch(`/api/shopify/orders?days=${d}`);
                        if (res.ok) { setShopifyData(await res.json()); setShopifyError(''); }
                      } catch { }
                      setShopifyLoading(false);
                    }}
                    className={`px-3 py-1.5 text-[0.6rem] font-black uppercase tracking-widest rounded-lg transition-colors cursor-pointer ${shopifyPeriod === d ? 'bg-purple-600 text-white shadow-sm' : 'text-white/80 hover:text-white hover:bg-white/10'}`}
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
                  } catch { }
                  setShopifyLoading(false);
                }}
                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded text-[0.6rem] font-bold uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/10 transition-colors"
              >
                ↻ Refresh
              </button>
            </div>
          )}
          <div className={"w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center transition-transform duration-300 " + (isSectionOpen('shopify') ? 'rotate-0' : '-rotate-90')}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40"><path d="M2 4l4 4 4-4" /></svg>
          </div>
        </div>
      </div>
      {renderInfoBanner('shopify', 'Shopify Sales', 'Track real-time Shopify store order statistics, sales charts, and recent drop activity over custom date ranges.')}
      <div style={{ display: isSectionOpen('shopify') ? undefined : 'none' }}>
        {shopifyTab === 'shopify' ? (
          shopifyLoading ? (
            <div className="p-16 text-center text-white/30 font-mono text-xs animate-pulse">Pulling Shopify analytics...</div>
          ) : shopifyError ? (
            <div className="p-16 text-center">
              <span className="text-4xl opacity-20 block mb-4"></span>
              <p className="text-white/40 text-sm">{shopifyError}</p>
              <p className="text-white/20 text-xs mt-2">Check your Shopify Admin API credentials in .env.local</p>
            </div>
          ) : shopifyData?.mode === 'inventory' ? (
            <div className="py-6 pr-6 pl-0">
              {shopifyData.needsOrderScope && (
                <div className="mb-6 p-4 bg-purple-500/10 border border-purple-500/20 flex items-start gap-3">
                  <span className="text-purple-300 text-lg"></span>
                  <div>
                    <p className="text-sm font-bold text-purple-300">Orders Access Not Enabled</p>
                    <p className="text-[0.7rem] text-white/40 mt-1">To see sales data, enable <code className="text-purple-300">read_orders</code> in Shopify Admin → Settings → Apps → Your app → Admin API scopes. Showing inventory data instead.</p>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-black/30 border border-[#96bf48]/20 p-5">
                  <p className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-[#96bf48]/60 mb-2">Inventory Value</p>
                  <p className="text-2xl font-black text-[#96bf48]">${shopifyData.summary.inventoryValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                  <p className="text-[0.55rem] text-white/30 mt-1 uppercase tracking-widest">Retail value on hand</p>
                </div>
                <div className="bg-black/30 border border-white/10 p-5">
                  <p className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-white/40 mb-2">Products</p>
                  <p className="text-2xl font-black text-white">{shopifyData.summary.totalProducts}</p>
                  <p className="text-[0.55rem] text-white/30 mt-1 uppercase tracking-widest">{shopifyData.summary.totalVariants} variants</p>
                </div>
                <div className="bg-black/30 border border-white/10 p-5">
                  <p className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-white/40 mb-2">Total Units</p>
                  <p className="text-2xl font-black text-white">{shopifyData.summary.totalInventory}</p>
                  <p className="text-[0.55rem] text-white/30 mt-1 uppercase tracking-widest">In stock</p>
                </div>
                <div className="bg-black/30 border border-white/10 p-5">
                  <p className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-white/40 mb-2">Avg Price</p>
                  <p className="text-2xl font-black text-white">${shopifyData.summary.totalInventory > 0 ? (shopifyData.summary.inventoryValue / shopifyData.summary.totalInventory).toFixed(2) : '0.00'}</p>
                  <p className="text-[0.55rem] text-white/30 mt-1 uppercase tracking-widest">Per unit</p>
                </div>
              </div>
              <div className="bg-black/20 border border-white/5 overflow-hidden">
                <div className="p-4 border-b border-white/5"><h4 className="text-sm font-bold flex items-center gap-2"> Product Inventory</h4></div>
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar" data-lenis-prevent="true">
                  <table className="w-full text-left">
                    <thead><tr className="text-[0.55rem] uppercase tracking-widest text-white/25">
                      <th className="px-4 py-3 font-bold border-b border-white/5">Product</th>
                      <th className="px-4 py-3 font-bold border-b border-white/5 text-center">QR Code</th>
                      <th className="px-4 py-3 font-bold border-b border-white/5 text-right">Price</th>
                      <th className="px-4 py-3 font-bold border-b border-white/5 text-right">Stock</th>
                      <th className="px-4 py-3 font-bold border-b border-white/5 text-right">Value</th>
                    </tr></thead>
                    <tbody>
                      {shopifyData.products.map((p: any) => (
                        <tr key={p.id || p.handle || p.title} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {p.image && <img src={p.image} alt="7th Heaven Media" className="w-8 h-8 rounded object-cover border border-white/10" />}
                              <span className="text-sm font-bold truncate max-w-[200px]">{p.title}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => openQrModal(p)}
                              className="inline-flex items-center justify-center p-1.5 bg-white/5 hover:bg-white/15 border border-white/10 rounded-lg transition-colors group cursor-pointer"
                              title="View & Print QR Code"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/60 group-hover:text-white"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
                            </button>
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-sm text-white/60">${p.minPrice.toFixed(2)}{p.maxPrice !== p.minPrice ? ` – $${p.maxPrice.toFixed(2)}` : ''}</td>
                          <td className="px-4 py-3 text-right">
                            <span className={`font-mono text-sm font-bold ${p.inventory <= 0 ? 'text-rose-400' : p.inventory < 5 ? 'text-purple-300' : 'text-emerald-400'}`}>{p.inventory}</span>
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
            <div className="py-6 pr-6 pl-0">
              {/* Revenue Metrics Row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-black/30 border border-[#96bf48]/20 p-5">
                  <p className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-[#96bf48]/60 mb-2">Total Revenue</p>
                  <p className="text-2xl font-black text-[#96bf48]">${shopifyData.summary.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                  <p className="text-[0.55rem] text-white/30 mt-1 uppercase tracking-widest">Last {shopifyData.period}</p>
                </div>
                <div className="bg-black/30 border border-white/10 p-5">
                  <p className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-white/40 mb-2">Orders</p>
                  <p className="text-2xl font-black text-white">{shopifyData.summary.totalOrders}</p>
                  <p className="text-[0.55rem] text-white/30 mt-1 uppercase tracking-widest">
                    {shopifyData.statusBreakdown.fulfilled} fulfilled · {shopifyData.statusBreakdown.unfulfilled} pending
                  </p>
                </div>
                <div className="bg-black/30 border border-white/10 p-5">
                  <p className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-white/40 mb-2">Avg Order Value</p>
                  <p className="text-2xl font-black text-white">${shopifyData.summary.avgOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                  <p className="text-[0.55rem] text-white/30 mt-1 uppercase tracking-widest">Per transaction</p>
                </div>
                <div className="bg-black/30 border border-white/10 p-5">
                  <p className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-white/40 mb-2">Net Revenue</p>
                  <p className="text-2xl font-black text-[var(--color-accent)]">${shopifyData.summary.netRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
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
                <div className="bg-black/20 border border-white/5 overflow-hidden">
                  <div className="p-4 border-b border-white/5">
                    <h4 className="text-sm font-bold flex items-center gap-2">
                      Top Products
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
                            <tr key={p.id || p.handle || p.title} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[0.55rem] font-black shrink-0 ${i === 0 ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
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
                <div className="bg-black/20 border border-white/5 overflow-hidden">
                  <div className="p-4 border-b border-white/5">
                    <h4 className="text-sm font-bold flex items-center gap-2">
                      Daily Revenue
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
                          .map(([date, amount]: [string, any], idx: number) => {
                            const maxRevenue = Math.max(...Object.values(shopifyData.dailyRevenue).map(Number));
                            const pct = maxRevenue > 0 ? (amount / maxRevenue) * 100 : 0;
                            return (
                              <div key={`daily-rev-${date}`} className="flex items-center gap-3">
                                <span className="text-[0.6rem] font-mono text-white/30 w-16 shrink-0">
                                  {new Date(date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                                <div className="flex-1 h-5 bg-white/5 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-[#96bf48]/60 to-[#96bf48] rounded-full transition-colors duration-500"
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
              <div className="bg-black/20 border border-white/5 overflow-hidden">
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                  <h4 className="text-sm font-bold flex items-center gap-2">
                    Recent Orders
                  </h4>
                  <span className="text-[0.55rem] text-white/30 uppercase tracking-widest">{shopifyData.orders.length} orders</span>
                </div>
                <div className="max-h-[350px] overflow-y-auto custom-scrollbar" data-lenis-prevent="true">
                  {shopifyData.orders.length === 0 ? (
                    <div className="p-8 text-center text-white/30 text-xs">No orders in this period</div>
                  ) : (
                    <table className="w-full text-left">
                      <thead className="sticky top-0 z-10">
                        <tr className="bg-[var(--color-bg-surface)] text-[0.55rem] uppercase tracking-widest text-white/25">
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
                                <span className="text-[0.5rem]  text-[var(--color-accent)] font-bold uppercase tracking-widest">Repeat ({order.customer.ordersCount}×)</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-white/60">{order.itemCount} item{order.itemCount !== 1 ? 's' : ''}</span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-col gap-1">
                                <span className={`inline-block px-2 py-0.5 rounded text-[0.5rem] font-bold uppercase tracking-widest w-fit ${order.financialStatus === 'PAID' ? 'bg-emerald-500/15 text-[var(--color-accent)] border border-emerald-500/30'
                                  : order.financialStatus === 'REFUNDED' || order.financialStatus === 'PARTIALLY_REFUNDED' ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                                    : 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                                  }`}>{order.financialStatus?.toLowerCase().replace('_', ' ')}</span>
                                {order.fulfillmentStatus && (
                                  <span className={`inline-block px-2 py-0.5 rounded text-[0.5rem] font-bold uppercase tracking-widest w-fit ${order.fulfillmentStatus === 'FULFILLED' ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
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
                <div className="bg-black/20 border border-white/5 overflow-hidden mt-8">
                  <div className="p-4 border-b border-white/5 flex items-center justify-between">
                    <h4 className="text-sm font-bold flex items-center gap-2"> Product Inventory</h4>
                    {shopifyData.inventory && (
                      <span className="text-[0.55rem] text-white/30 uppercase tracking-widest">
                        {shopifyData.inventory.totalInventory} units · ${shopifyData.inventory.inventoryValue?.toLocaleString()} value
                      </span>
                    )}
                  </div>
                  <table className="w-full text-left">
                    <thead><tr className="text-[0.55rem] uppercase tracking-widest text-white/25">
                      <th className="px-4 py-3 font-bold border-b border-white/5">Product</th>
                      <th className="px-4 py-3 font-bold border-b border-white/5 text-center">QR Code</th>
                      <th className="px-4 py-3 font-bold border-b border-white/5 text-right">Price</th>
                      <th className="px-4 py-3 font-bold border-b border-white/5 text-right">Stock</th>
                      <th className="px-4 py-3 font-bold border-b border-white/5 text-right">Value</th>
                    </tr></thead>
                    <tbody>
                      {shopifyData.products.map((p: any) => (
                        <tr key={p.id || p.handle || p.title} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {p.image && <img src={p.image} alt="7th Heaven Media" className="w-8 h-8 rounded object-cover border border-white/10" />}
                              <span className="text-sm font-bold truncate max-w-[200px]">{p.title}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => openQrModal(p)}
                              className="inline-flex items-center justify-center p-1.5 bg-white/5 hover:bg-white/15 border border-white/10 rounded-lg transition-colors group cursor-pointer"
                              title="View & Print QR Code"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/60 group-hover:text-white"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
                            </button>
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-sm text-white/60">${p.minPrice.toFixed(2)}{p.maxPrice !== p.minPrice ? ` – $${p.maxPrice.toFixed(2)}` : ''}</td>
                          <td className="px-4 py-3 text-right">
                            <span className={`font-mono text-sm font-bold ${p.inventory <= 0 ? 'text-rose-400' : p.inventory < 5 ? 'text-purple-300' : 'text-emerald-400'}`}>{p.inventory}</span>
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-sm font-bold text-[#96bf48]">${(p.minPrice * p.inventory).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : null) : (
          <div className="py-6 pr-6 pl-0 transition-opacity duration-300 ease-out">
            {/* Simulated Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-black/30 border border-purple-500/20 p-5 hover:border-purple-500/40 transition-colors">
                <p className="text-[0.6rem] font-bold uppercase tracking-[0.15em]  text-[var(--color-accent)] mb-2">Simulated Revenue</p>
                <p className="text-2xl font-black text-white font-mono">
                  ${simulatedOrders.reduce((sum, o) => sum + parseFloat(o.price?.replace(/[$,]/g, '') || '0'), 0).toFixed(2)}
                </p>
                <p className="text-[0.55rem] text-white/30 mt-1 uppercase tracking-widest font-bold">Store + Flash Drop</p>
              </div>
              <div className="bg-black/30 border border-white/10 p-5 hover:border-white/20 transition-colors">
                <p className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-white/40 mb-2">Store Purchases</p>
                <p className="text-2xl font-black text-white font-mono">
                  {simulatedOrders.filter(o => o.source === 'Store').length}
                </p>
                <p className="text-[0.55rem] text-white/30 mt-1 uppercase tracking-widest font-bold">Normal store checkout</p>
              </div>
              <div className="bg-black/30 border border-white/10 p-5 hover:border-white/20 transition-colors">
                <p className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-white/40 mb-2">Flash Drops</p>
                <p className="text-2xl font-black text-white font-mono">
                  {simulatedOrders.filter(o => o.source === 'Flash Drop').length}
                </p>
                <p className="text-[0.55rem] text-white/30 mt-1 uppercase tracking-widest font-bold">Live drop purchases</p>
              </div>
              <div className="bg-black/30 border border-white/10 p-5 hover:border-white/20 transition-colors">
                <p className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-white/40 mb-2">Raffle Claims</p>
                <p className="text-2xl font-black text-white font-mono">
                  {simulatedOrders.filter(o => o.source === 'Raffle').length}
                </p>
                <p className="text-[0.55rem] text-white/30 mt-1 uppercase tracking-widest font-bold">Claims via winning PIN</p>
              </div>
            </div>

            {/* Fulfillment & Pack Tracking Table */}
            <div className="bg-black/20 border border-white/5 overflow-hidden">
              <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                <h4 className="text-sm font-bold flex items-center gap-2">
                  Simulated Order Fulfillment & Package Tracking Queue
                </h4>
                <span className="text-[0.55rem] text-white/30 uppercase tracking-widest">{simulatedOrders.length} total orders</span>
              </div>
              <div className="max-h-[500px] overflow-y-auto custom-scrollbar" data-lenis-prevent="true">
                {simulatedOrders.length === 0 ? (
                  <div className="p-8 text-center text-white/30 text-xs">No simulated orders yet. Go to store page and purchase items!</div>
                ) : (
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-[var(--color-bg-surface)] text-[0.55rem] uppercase tracking-widest text-white/25 border-b border-white/5">
                        <th className="px-4 py-3 font-bold">Order ID</th>
                        <th className="px-4 py-3 font-bold">Customer</th>
                        <th className="px-4 py-3 font-bold">Item Details</th>
                        <th className="px-4 py-3 font-bold">Source</th>
                        <th className="px-4 py-3 font-bold">Fulfillment Status</th>
                        <th className="px-4 py-3 font-bold">Actions</th>
                        <th className="px-4 py-3 font-bold text-right">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {simulatedOrders.map((order) => (
                        <tr key={order.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-mono text-xs font-bold  text-[var(--color-accent)]">#SIM-{order.id.toString().slice(-6)}</div>
                            <div className="text-[0.55rem] text-white/30 mt-0.5">
                              {new Date(order.ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm font-bold text-white/90">{order.customer}</div>
                            <div className="text-[0.6rem] text-white/40">{order.email || 'No email provided'}</div>
                            {order.address && (
                              <div className="text-[0.55rem] text-white/30 mt-0.5 truncate max-w-[150px]" title={`${order.address}, ${order.city}, ${order.zip}`}>
                                {order.address}, {order.city}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-white/80 font-bold">{order.item}</div>
                            {(order.size || order.color) && (
                              <div className="text-[0.6rem] text-white/40 mt-0.5">
                                {order.size && <span>Size: {order.size}</span>}
                                {order.size && order.color && <span> · </span>}
                                {order.color && <span>Color: {order.color}</span>}
                              </div>
                            )}
                            {order.method && (
                              <div className="text-[0.55rem]  text-[var(--color-accent)]/80 font-semibold uppercase tracking-wider mt-0.5">
                                {order.method === 'merch_table' ? 'Merch Table Pickup' : 'Shipping'}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-block px-2 py-0.5 rounded text-[0.5rem] font-bold uppercase tracking-widest ${order.source === 'Flash Drop' ? 'bg-pink-500/15 text-pink-400 border border-pink-500/30'
                              : order.source === 'Raffle' ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                                : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                              }`}>{order.source}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-1">
                              <span className={`inline-block px-2 py-0.5 rounded text-[0.5rem] font-bold uppercase tracking-widest w-fit ${order.status === 'Shipped' || order.status === 'Claimed' ? 'bg-emerald-500/15 text-[var(--color-accent)] border border-emerald-500/30'
                                : order.status === 'Ready for Pickup' ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                                  : 'bg-white/5 text-white/40 border border-white/10'
                                }`}>{order.status}</span>
                              {order.trackingNumber && (
                                <div className="text-[0.55rem] font-mono text-[var(--color-accent)]/80 mt-0.5">
                                  {order.trackingNumber}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {order.status === 'Pending' && order.method === 'shipping' && (
                              <button
                                onClick={() => handleUpdateSimulatedOrderStatus(order.id, 'Shipped')}
                                className="px-2.5 py-1 bg-purple-500 hover:bg-purple-400 text-white text-[0.55rem] font-black uppercase tracking-wider rounded transition-colors cursor-pointer shadow-[0_0_10px_rgba(255,10,61,0.3)] hover:scale-105 active:scale-95"
                              >
                                Ship Package
                              </button>
                            )}
                            {order.status === 'Ready for Pickup' && (
                              <button
                                onClick={() => handleUpdateSimulatedOrderStatus(order.id, 'Claimed')}
                                className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white text-[0.55rem] font-black uppercase tracking-wider rounded transition-colors cursor-pointer shadow-[0_0_10px_rgba(147, 51, 234,0.3)] hover:scale-105 active:scale-95"
                              >
                                Claim Merch
                              </button>
                            )}
                            {(order.status === 'Shipped' || order.status === 'Claimed') && (
                              <span className="text-[0.55rem] text-[var(--color-accent)]/60 font-bold uppercase tracking-wider">
                                Complete
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-sm font-bold text-[#96bf48]">
                            {order.price || '$0.00'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );

  const renderBookings = () => (
    <section className="overflow-hidden">
      <div role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleSection('bookings'); } }} onClick={() => toggleSection('bookings')} className="py-6 pr-6 pl-0 flex items-center justify-between cursor-pointer select-none">
        <div className="flex items-center gap-2">
          <div className="drag-handle cursor-grab active:cursor-grabbing py-1.5 pr-1.5 pl-0 hover:bg-white/5 rounded text-white/20 hover:text-white/50 transition-colors shrink-0 mr-1" title="Drag to reorder section" onClick={(e) => e.stopPropagation()}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="9" cy="19" r="1" /><circle cx="15" cy="5" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="19" r="1" /></svg>
          </div>
          <h3 className="cursor-pointer text-lg font-bold tracking-tight flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
            Booking Requests
            {renderInfoToggle('bookings')}
          </h3>
        </div>
        <div className="flex items-center gap-3">

          <div className={"w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center transition-transform duration-300 " + (isSectionOpen('bookings') ? 'rotate-0' : '-rotate-90')}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40"><path d="M2 4l4 4 4-4" /></svg>
          </div>
        </div>
      </div >
      {renderInfoBanner('bookings', 'Booking Requests', 'Manage client booking requests, review contact details, proposal prices, dates, and approve or decline reservations.')}
      < div style={{ display: isSectionOpen('bookings') ? undefined : 'none' }}>
        <div className="p-0">
          {bookings.length === 0 ? (
            <div className="p-12 text-center text-white/30 font-mono text-xs">No booking requests received yet.</div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-full">
                <thead>
                  <tr className="border-b border-[#ffffff1f] text-left text-xs uppercase text-[var(--muted-text)] font-extrabold tracking-wider">
                    <th className="pr-4 pt-4 pb-4 font-black border-b border-[#ffffff1f] pl-0">ID</th>
                    <th className="p-4 font-black border-b border-[#ffffff1f]">Client</th>
                    <th className="p-4 font-black border-b border-[#ffffff1f]">Event Type</th>
                    <th className="p-4 font-black border-b border-[#ffffff1f]">Date</th>
                    <th className="p-4 font-black border-b border-[#ffffff1f]">Venue</th>
                    <th className="pt-4 pb-4 pl-4 pr-0 font-black border-b border-[#ffffff1f] text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.slice().reverse().map((b: any) => (
                    <React.Fragment key={b.bookingId}>
                      <tr className="border-b border-[#ffffff1f]">
                        <td
                          role="button"
                          tabIndex={0}
                          className="pr-4 pt-4 pb-4 border-b border-[#ffffff1f] font-mono text-[0.75rem] text-purple-400font-black cursor-pointer hover:underline pl-0"
                          onClick={() => setExpandedBooking(prev => prev === b.bookingId ? null : b.bookingId)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setExpandedBooking(prev => prev === b.bookingId ? null : b.bookingId);
                            }
                          }}
                        >
                          {expandedBooking === b.bookingId ? '' : ''} {b.bookingId}
                        </td>
                        <td className="p-4 border-b border-[#ffffff1f] relative">
                          <div className="font-bold text-sm text-[var(--text-color)]">{b.name}</div>
                          <div className="text-[0.65rem] text-[var(--muted-text)] font-mono">{b.email}</div>

                          {editingInlineLoadInId === b.bookingId ? (
                            <div className="mt-2 p-2 bg-transparent border-none space-y-2 z-30 min-w-[250px] inline-loadin-popover animate-[scaleIn_0.15s_ease-out]">
                              <p className="text-[10px] font-black text-purple-300 uppercase tracking-wider">Set Official Load-In / Out Time:</p>
                              <div className="input-glow-border rounded-lg w-full">
                                <input
                                  type="text"
                                  autoFocus
                                  value={loadInInputs[b.bookingId] !== undefined ? loadInInputs[b.bookingId] : (b.loadInTime && !b.loadInTime.includes("Unsure") ? b.loadInTime : "")}
                                  onChange={(e) => setLoadInInputs(prev => ({ ...prev, [b.bookingId]: e.target.value }))}
                                  onKeyDown={async (e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      await handleUpdateLoadInTime(b.bookingId, b.plannerEmail || b.email);
                                      setEditingInlineLoadInId(null);
                                    } else if (e.key === "Escape") {
                                      setEditingInlineLoadInId(null);
                                    }
                                  }}
                                  placeholder="e.g. 5:00 PM Load-In / 11:30 PM Out"
                                  className="w-full bg-transparent border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none placeholder:text-white/40"
                                />
                              </div>
                              <div className="flex items-center justify-between gap-1.5 pt-0.5">
                                <button
                                  type="button"
                                  onClick={() => setEditingInlineLoadInId(null)}
                                  className="px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-white/50 hover:text-white transition-colors cursor-pointer"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  disabled={loadInSaving[b.bookingId]}
                                  onClick={async () => {
                                    await handleUpdateLoadInTime(b.bookingId, b.plannerEmail || b.email);
                                    setEditingInlineLoadInId(null);
                                  }}
                                  className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white font-black text-[9px] uppercase tracking-wider rounded transition-colors cursor-pointer border-none shadow-xs disabled:opacity-50"
                                >
                                  {loadInSaving[b.bookingId] ? "Saving..." : "Save & Email ✉️"}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setEditingInlineLoadInId(b.bookingId)}
                              title="Click to set official load-in/out time and email planner"
                              className={`mt-1.5 inline-flex items-center gap-1 text-[0.55rem] font-black uppercase tracking-wider px-2.5 py-1 rounded-full transition-all cursor-pointer shadow-xs hover:scale-105 active:scale-95 ${(b.loadInTime?.includes("Unsure") || b.load_in_time?.includes("Unsure") || !b.loadInTime)
                                ? "text-amber-300 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 animate-pulse"
                                : "text-cyan-300 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30"
                                }`}
                            >
                              {(b.loadInTime?.includes("Unsure") || b.load_in_time?.includes("Unsure") || !b.loadInTime) ? (
                                <>⚡ Load-In Unsure (Click to Set) ✍️</>
                              ) : (
                                <>🕒 {b.loadInTime || b.load_in_time} (Edit) ✍️</>
                              )}
                            </button>
                          )}
                        </td>
                        <td className="p-4 border-b border-[#ffffff1f] text-sm text-[var(--text-color)] font-medium capitalize">{b.eventType?.replace('_', ' ')}</td>
                        <td className="p-4 border-b border-[#ffffff1f] text-sm text-[var(--text-color)] font-mono font-medium">{b.eventDate}</td>
                        <td className="p-4 border-b border-[#ffffff1f]">
                          <div className="text-sm text-[var(--text-color)] font-medium truncate max-w-[180px]">{b.venueName || '–'}</div>
                          <div className="text-[0.6rem] text-[var(--muted-text)]">{b.venueCity}, {b.venueState}</div>
                        </td>
                        <td className="pt-4 pb-4 pl-4 pr-0 border-b border-[#ffffff1f] text-right">
                          <div className="flex items-center justify-end gap-2 flex-wrap">
                            <span className={`px-2.5 py-1 rounded-full text-[0.6rem] font-black uppercase tracking-widest ${b.status === 'pending' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : b.status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              }`}>{b.status}</span>
                            {b.status === 'pending' && (
                              <div className="flex items-center gap-1.5 ml-1">
                                <button
                                  aria-label="Approve booking"
                                  disabled={updatingBookingId === b.bookingId}
                                  onClick={async () => {
                                    if (bookingUpdatingRef.current) return;
                                    if (!confirm(`Approve booking ${b.bookingId}?`)) return;
                                    bookingUpdatingRef.current = true;
                                    setUpdatingBookingId(b.bookingId);
                                    try {
                                      const res = await fetch('/api/booking', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bookingId: b.bookingId, status: 'confirmed' }) });
                                      if (res.ok) { setBookings((prev: any[]) => prev.map((bk: any) => bk.bookingId === b.bookingId ? { ...bk, status: 'confirmed' } : bk)); }
                                    } finally {
                                      bookingUpdatingRef.current = false;
                                      setUpdatingBookingId(null);
                                    }
                                  }}
                                  className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-[0.55rem] uppercase tracking-widest rounded-lg transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
                                >
                                  {updatingBookingId === b.bookingId ? '...' : 'Approve'}
                                </button>
                                <button
                                  aria-label="Reject booking"
                                  disabled={updatingBookingId === b.bookingId}
                                  onClick={async () => {
                                    if (bookingUpdatingRef.current) return;
                                    if (!confirm(`Reject booking ${b.bookingId}?`)) return;
                                    bookingUpdatingRef.current = true;
                                    setUpdatingBookingId(b.bookingId);
                                    try {
                                      const res = await fetch('/api/booking', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bookingId: b.bookingId, status: 'cancelled' }) });
                                      if (res.ok) { setBookings((prev: any[]) => prev.map((bk: any) => bk.bookingId === b.bookingId ? { ...bk, status: 'cancelled' } : bk)); }
                                    } finally {
                                      bookingUpdatingRef.current = false;
                                      setUpdatingBookingId(null);
                                    }
                                  }}
                                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white font-black text-[0.55rem] uppercase tracking-widest rounded-lg transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
                                >
                                  {updatingBookingId === b.bookingId ? '...' : 'Reject'}
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                      {expandedBooking === b.bookingId && (
                        <tr>
                          <td colSpan={6} className="p-6 bg-black/5 dark:bg-[#060609] border-t border-b border-black/20 dark:border-white/10">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-left">
                              <div>
                                <p className="text-[0.6rem] uppercase tracking-widest text-black/50 dark:text-white/40 font-bold mb-1">Age Limit</p>
                                <p className="text-sm font-semibold text-black dark:text-white">
                                  {b.ageRestriction === "21_plus" ? " 21 & Over" : b.ageRestriction === "18_plus" ? " 18 & Over" : " All Ages"}
                                </p>
                              </div>
                              <div>
                                <p className="text-[0.6rem] uppercase tracking-widest text-black/50 dark:text-white/40 font-bold mb-1">Doors Time</p>
                                <p className="text-sm font-semibold text-black dark:text-white">{b.doorsTime || b.startTime || 'TBD'}</p>
                              </div>
                              <div>
                                <p className="text-[0.6rem] uppercase tracking-widest text-black/50 dark:text-white/40 font-bold mb-1">Cover / Price</p>
                                <p className="text-sm font-semibold text-black dark:text-white">{b.cover || 'Free / No Cover'}</p>
                              </div>
                              <div>
                                <p className="text-[0.6rem] uppercase tracking-widest text-black/50 dark:text-white/40 font-bold mb-1">Load-In / Setup Time</p>
                                <p className="text-sm font-semibold text-cyan-400">
                                  {b.loadInTime || b.load_in_time || 'Unsure — Admin to set & email'}
                                </p>
                              </div>
                              <div>
                                <p className="text-[0.6rem] uppercase tracking-widest text-black/50 dark:text-white/40 font-bold mb-1">Ticket Link</p>
                                {b.ticketLink ? (
                                  <a href={b.ticketLink} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-cyan-600 hover:underline truncate block max-w-[200px]" title={b.ticketLink}>
                                    {b.ticketLink}
                                  </a>
                                ) : (
                                  <p className="text-sm text-black/30 dark:text-white/20">—</p>
                                )}
                              </div>
                              {b.details && (
                                <div className="col-span-2 sm:col-span-4 mt-2">
                                  <p className="text-[0.6rem] uppercase tracking-widest text-black/50 dark:text-white/40 font-bold mb-1">Public Notes (displayed to fans)</p>
                                  <p className="text-xs text-black/80 dark:text-white/70 italic bg-black/5 dark:bg-white/[0.02] p-3 rounded-lg border border-black/10 dark:border-white/5">"{b.details}"</p>
                                </div>
                              )}
                              {b.plannerNotes && (
                                <div className="col-span-2 sm:col-span-4 mt-2">
                                  <p className="text-[0.6rem] uppercase tracking-widest text-black/50 dark:text-white/40 font-bold mb-1">Planner's Internal Notes</p>
                                  <p className="text-xs text-black/80 dark:text-white/70 bg-black/5 dark:bg-white/[0.02] p-3 rounded-lg border border-black/10 dark:border-white/5">{b.plannerNotes}</p>
                                </div>
                              )}

                              {/* Official Load-In Setup Manager Widget */}
                              <div className="col-span-2 sm:col-span-4 mt-3 p-4 bg-purple-950/30 border border-purple-500/30 rounded-xl space-y-3">
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                  <p className="text-xs uppercase tracking-widest text-purple-300 font-extrabold flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-cyan-400" /> Official Load-In Setup Manager
                                  </p>
                                  {(b.loadInTime?.includes("Unsure") || b.load_in_time?.includes("Unsure") || !b.loadInTime) && (
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                                      ⚡ Planner Unsure — Pending Admin Confirmation
                                    </span>
                                  )}
                                </div>

                                <p className="text-xs text-white/70">
                                  Set or update the official load-in setup time below. Clicking <strong>"Save & Email Planner"</strong> updates the record and sends an email confirmation directly to <strong>{b.plannerEmail || b.email}</strong>.
                                </p>

                                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap pt-1">
                                  <input
                                    type="text"
                                    value={loadInInputs[b.bookingId] !== undefined ? loadInInputs[b.bookingId] : (b.loadInTime && !b.loadInTime.includes("Unsure") ? b.loadInTime : "")}
                                    onChange={(e) => setLoadInInputs(prev => ({ ...prev, [b.bookingId]: e.target.value }))}
                                    placeholder="e.g. 5:00 PM (2 hours before show)"
                                    className="flex-1 bg-white/5 border border-white/15 rounded-lg px-3.5 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none placeholder:text-white/30"
                                  />
                                  <button
                                    type="button"
                                    disabled={loadInSaving[b.bookingId]}
                                    onClick={() => handleUpdateLoadInTime(b.bookingId, b.plannerEmail || b.email)}
                                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                                  >
                                    {loadInSaving[b.bookingId] ? "Sending..." : "Save & Email Planner ✉️"}
                                  </button>
                                </div>

                                {loadInNotice[b.bookingId] && (
                                  <div className="p-2.5 bg-emerald-950/60 border border-emerald-400/40 rounded-lg text-xs font-bold text-emerald-300 flex items-center gap-2 animate-[fade-in_0.15s_ease-out]">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                    <span>{loadInNotice[b.bookingId]}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div >
    </section >
  );

  const renderPlanners = () => (
    <section className="overflow-hidden">
      <div role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleSection('planners'); } }} onClick={() => toggleSection('planners')} className="py-6 pr-6 pl-0 flex items-center justify-between cursor-pointer select-none">
        <div className="flex items-center gap-2">
          <div className="drag-handle cursor-grab active:cursor-grabbing py-1.5 pr-1.5 pl-0 hover:bg-white/5 rounded text-white/20 hover:text-white/50 transition-colors shrink-0 mr-1" title="Drag to reorder section" onClick={(e) => e.stopPropagation()}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="9" cy="19" r="1" /><circle cx="15" cy="5" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="19" r="1" /></svg>
          </div>
          <h3 className="cursor-pointer text-lg font-bold tracking-tight flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            Event Planners Directory
            {renderInfoToggle('planners')}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[0.6rem] uppercase font-bold tracking-widest flex items-center gap-2 text-white/40">
            {Array.from(new Map(bookings.flatMap(b => b.email ? [[b.email, b] as const] : [])).values()).length} Planners
          </span>
          <div className={"w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center transition-transform duration-300 " + (isSectionOpen('planners') ? 'rotate-0' : '-rotate-90')}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40"><path d="M2 4l4 4 4-4" /></svg>
          </div>
        </div>
      </div >
      {renderInfoBanner('planners', 'Event Planners Directory', 'Browse the list of event planners, view their contact information, and review past and current booking requests.')}
      < div style={{ display: isSectionOpen('planners') ? undefined : 'none' }}>
        <div className="p-0" data-lenis-prevent="true">
          {bookings.length === 0 ? (
            <div className="p-12 text-center text-white/30 font-mono text-xs">No planners found.</div>
          ) : (
            <div className="py-2 pr-6 pl-0">
              {Array.from(new Map(bookings.flatMap(b => b.email ? [[b.email, b] as const] : [])).values()).map((planner: any) => (
                <div key={planner.email} className="border-b border-white/20 py-4 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-[240px]">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-accent)]/20 to-[var(--color-accent)]/5 flex items-center justify-center text-sm font-black  text-[var(--color-accent)] shrink-0 border border-[var(--color-accent)]/20">
                      {planner.name?.substring(0, 2).toUpperCase() || 'EP'}
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="font-bold text-white text-sm truncate">{planner.name || 'Unknown Planner'}</h4>
                      <p className="text-[0.65rem] text-white/40 truncate uppercase tracking-widest">{planner.venueName || planner.eventType?.replace('_', ' ') || 'Event Planner'}</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-xs font-mono text-white/70">
                    {planner.email && (
                      <div className="flex items-center gap-1.5">
                        <span className=" text-[var(--color-accent)]"></span>
                        <span className="truncate">{planner.email}</span>
                      </div>
                    )}
                    {planner.phone ? (
                      <div className="flex items-center gap-1.5">
                        <span className=" text-[var(--color-accent)]"></span>
                        <span>{planner.phone}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-white/30 italic">
                        <span className="text-white/20"></span>
                        <span>No phone</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 md:ml-auto">
                    <a href={`mailto:${planner.email}`} onClick={() => setAuditLog(prev => [{ id: crypto.randomUUID(), text: `Admin initiated email to planner ${planner.name}`, time: 'Just now', color: 'bg-emerald-500' }, ...prev])} className="px-4 py-2 text-center bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[0.6rem] font-bold uppercase tracking-widest text-white/60 hover:text-white transition-colors">
                      Email
                    </a>
                    {planner.phone ? (
                      <a href={`sms:${planner.phone.replace(/[^0-9]/g, '')}`} onClick={() => setAuditLog(prev => [{ id: crypto.randomUUID(), text: `Admin initiated SMS to planner ${planner.name}`, time: 'Just now', color: 'bg-blue-500' }, ...prev])} className="px-4 py-2 text-center bg-[var(--color-accent)]/10 hover:bg-[var(--color-accent)]/20 border border-[var(--color-accent)]/30 rounded-lg text-[0.6rem] font-bold uppercase tracking-widest  text-[var(--color-accent)] hover: text-[var(--color-accent)] transition-colors">
                        Text
                      </a>
                    ) : (
                      <button disabled className="px-4 py-2 text-center bg-white/5 border border-white/10 rounded-lg text-[0.6rem] font-bold uppercase tracking-widest text-white/20 cursor-not-allowed">
                        No Phone
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div >
    </section >
  );

  const renderPhotoMod = () => (
    <section className="overflow-hidden">
      <div role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleSection('photomod'); } }} onClick={() => toggleSection('photomod')} className="py-6 pr-6 pl-0 flex items-center justify-between cursor-pointer select-none">
        <div className="flex items-center gap-2">
          <div className="drag-handle cursor-grab active:cursor-grabbing py-1.5 pr-1.5 pl-0 hover:bg-white/5 rounded text-white/20 hover:text-white/50 transition-colors shrink-0 mr-1" title="Drag to reorder section" onClick={(e) => e.stopPropagation()}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="9" cy="19" r="1" /><circle cx="15" cy="5" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="19" r="1" /></svg>
          </div>
          <h3 className="cursor-pointer text-lg font-bold tracking-tight flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
            Fan Photo Moderation Queue
            {renderInfoToggle('photomod')}
          </h3>
        </div>
        <div className="flex items-center gap-3">

          <div className={"w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center transition-transform duration-300 " + (isSectionOpen('photomod') ? 'rotate-0' : '-rotate-90')}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40"><path d="M2 4l4 4 4-4" /></svg>
          </div>
        </div>
      </div >
      {renderInfoBanner('photomod', 'Fan Photo Moderation Queue', 'Review fan-submitted concert and show photos, check compliance, and approve or reject them for the public photo wall.')}
      < div style={{ display: isSectionOpen('photomod') ? undefined : 'none' }}>
        <div className="p-0">
          {moderationQueue.length === 0 ? (
            <div className="p-16 text-center text-white/30 text-sm">
              <span className="text-4xl opacity-20 block mb-4"></span>
              Queue is entirely empty. All fan content is categorized.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-6 pr-6 pl-0">
              {moderationQueue.map((photo) => (
                <div key={photo.id} className="group relative bg-[var(--color-bg-surface)] border border-white/10 overflow-hidden shadow-xl hover:border-[var(--color-accent)]/50 transition-colors">
                  <div className="aspect-[4/3] bg-white/5 relative overflow-hidden">
                    <img src={photo.src} alt="Fan Upload" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-0 right-0 m-3 px-2.5 py-1 bg-black/70 backdrop-blur-md rounded border border-white/10 text-white font-mono text-[0.6rem] uppercase tracking-widest shadow-xl">
                      {new Date(photo.submittedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="p-4 flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-sm font-bold truncate">
                      <span className=" text-[var(--color-accent)]">@</span>
                      {photo.name}
                    </div>
                    {photo.venue && <p className="text-[0.65rem] font-bold tracking-widest uppercase text-white/40 truncate"> {photo.venue}</p>}
                    {photo.caption && <p className="text-sm text-white/70 italic border-l-2 border-[var(--color-accent)]/30 pl-3 mt-2">"{photo.caption}"</p>}
                  </div>
                  <div className="grid grid-cols-2 border-t border-white/10 divide-x divide-white/10">
                    <button onClick={() => moderatePhoto(photo.id, 'reject')} className="py-3 text-[0.6rem] font-black uppercase tracking-widest text-white bg-red-600 hover:bg-red-500 transition-colors shadow-[0_0_15px_rgba(239,68,68,0.4)] cursor-pointer">
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
      </div >
    </section >
  );

  const renderMemoryMod = () => (
    <section className="overflow-hidden">
      <div role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleSection('memorymod'); } }} onClick={() => toggleSection('memorymod')} className="py-6 pr-6 pl-0 flex items-center justify-between cursor-pointer select-none">
        <div className="flex items-center gap-2">
          <div className="drag-handle cursor-grab active:cursor-grabbing py-1.5 pr-1.5 pl-0 hover:bg-white/5 rounded text-white/20 hover:text-white/50 transition-colors shrink-0 mr-1" title="Drag to reorder section" onClick={(e) => e.stopPropagation()}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="9" cy="19" r="1" /><circle cx="15" cy="5" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="19" r="1" /></svg>
          </div>
          <h3 className="text-lg font-bold tracking-tight flex items-center gap-2 cursor-pointer text-white">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z" /><path d="M12 8v4l3 3" /></svg>
            Memory Moderation Queue
            {renderInfoToggle('memorymod')}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-purple-500/20  text-[var(--color-accent)] border border-purple-500/30 rounded-full text-[0.6rem] uppercase font-bold tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" />
            {memoryQueue.length} Pending
          </span>
          <div className={"w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center transition-transform duration-300 " + (isSectionOpen('memorymod') ? 'rotate-0' : '-rotate-90')}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40"><path d="M2 4l4 4 4-4" /></svg>
          </div>
        </div>
      </div >
      {renderInfoBanner('memorymod', 'Memory Moderation Queue', 'Review fan memories, stories, and concert anecdotes before they are published to the public website timeline.')}
      < div style={{ display: isSectionOpen('memorymod') ? undefined : 'none' }} className="py-6 pr-6 pl-0" >
        {
          memoryQueue.length === 0 ? (
            <div className="p-10 text-center text-white/30 text-sm">
              <span className="text-4xl opacity-20 block mb-4"></span>
              Queue is entirely empty. All fan content is categorized.
            </div>
          ) : (
            <div className="space-y-4">
              {memoryQueue.map((mem) => (
                <div key={mem.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 border-b border-white/20 bg-transparent">
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
                        <img src={mem.photo_url} alt="7th Heaven Media" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => moderateMemory(mem.id, 'reject')}
                      className="px-4 py-2 text-xs font-black uppercase tracking-widest text-white bg-red-600 hover:bg-red-500 transition-colors rounded-lg shadow-[0_0_15px_rgba(239,68,68,0.4)] cursor-pointer"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => moderateMemory(mem.id, 'approve')}
                      className="px-4 py-2 text-xs font-black uppercase tracking-widest text-[#050505] bg-emerald-400 hover:bg-emerald-300 transition-colors rounded-lg shadow-[0_0_15px_rgba(52,211,153,0.3)]"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        }
      </div >
    </section >
  );




  const renderLiveAlerts = () => (
    <section className="overflow-hidden">
      <div role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleSection('livealerts'); } }} onClick={() => toggleSection('livealerts')} className="py-6 pr-6 pl-0 border-b border-white/10 flex items-center justify-between bg-transparent select-none hover:bg-white/[0.02] transition-colors cursor-pointer">
        <div className="flex items-center gap-2">
          <div className="drag-handle cursor-grab active:cursor-grabbing py-1.5 pr-1.5 pl-0 hover:bg-white/5 rounded text-white/20 hover:text-white/50 transition-colors shrink-0 mr-1" title="Drag to reorder section" onClick={(e) => e.stopPropagation()}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="9" cy="19" r="1" /><circle cx="15" cy="5" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="19" r="1" /></svg>
          </div>
          <h3 className="cursor-pointer text-lg font-bold tracking-tight flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2"><path d="M23 7l-7 5 7 5V7z"></path><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
            Active Live Streams
            {renderInfoToggle('livealerts')}
          </h3>
        </div>
        <div className="flex items-center gap-3">

          <div className={"w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center transition-transform duration-300 " + (isSectionOpen('livealerts') ? 'rotate-0' : '-rotate-90')}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40"><path d="M2 4l4 4 4-4" /></svg>
          </div>
        </div>
      </div>
      {renderInfoBanner('livealerts', 'Active Live Streams', 'Monitor active video feeds and broadcast room channels in real time, view subscriber notifications, and manage stream controls.')}
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
                          <Link href={feed.route} className="truncate block hover: text-[var(--color-accent)] transition-colors">{feed.name}</Link>
                        ) : (
                          <span className="truncate block">{feed.name}</span>
                        )}
                        {feed.isSimulated && (
                          <span className="px-1.5 py-0.5 bg-emerald-500/15 border border-emerald-500/30 rounded text-[0.5rem] font-bold uppercase tracking-wider text-[var(--color-accent)] shrink-0">Demo</span>
                        )}
                      </div>
                      <div className="text-white/40 text-[0.6rem] uppercase tracking-wider mt-1">Uptime: {feed.uptime}</div>
                    </td>
                    <td className="p-4 text-sm text-white/70">{feed.host}</td>
                    <td className="p-4 font-mono text-sm">{feed.viewers.toLocaleString()}</td>
                    <td className="p-4 font-mono text-sm font-bold text-[var(--color-accent)]">
                      {feed.revenue !== undefined ? `$${feed.revenue.toLocaleString()}` : '$0'}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={feed.isSimulated && feed.route ? feed.route : `/live/${feed.id}`}
                          className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 text-[0.6rem] font-bold uppercase tracking-widest rounded transition-colors inline-block"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => killStream(feed)}
                          className="px-4 py-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 text-[0.6rem] font-bold uppercase tracking-widest rounded transition-colors"
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
    <section className="overflow-hidden">
      <div
        role="button"
        tabIndex={0}
        onClick={() => toggleSection('smsblast')}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleSection('smsblast'); } }}
        className="py-6 pr-6 pl-0 border-b border-white/10 flex items-center justify-between bg-transparent select-none hover:bg-white/[0.02] transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <div className="drag-handle cursor-grab active:cursor-grabbing py-1.5 pr-1.5 pl-0 hover:bg-white/5 rounded text-white/20 hover:text-white/50 transition-colors shrink-0 mr-1" title="Drag to reorder section" onClick={(e) => e.stopPropagation()}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="9" cy="19" r="1" /><circle cx="15" cy="5" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="19" r="1" /></svg>
          </div>
          <h3 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
            SMS Proximity Blast
            {renderInfoToggle('smsblast')}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4">
            {/* Auto-blast toggle */}
            <div
              className="flex items-center gap-2"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <span className="text-[0.55rem] font-bold uppercase tracking-widest text-white/30">Auto-Blast</span>
              <button
                type="button"
                aria-label="Toggle Auto-Blast"
                onClick={async () => {
                  const newVal = !smsAutoBlast;
                  setSmsAutoBlast(newVal);
                  try {
                    await fetch('/api/admin/settings', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ key: 'sms_auto_blast', value: newVal ? 'on' : 'off' }),
                    });
                  } catch { }
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
      {renderInfoBanner('smsblast', 'SMS Proximity Blast', 'Draft and dispatch geofenced text message updates and blast notifications to fans based on their proximity to upcoming concert venues.')}
      <div style={{ display: isSectionOpen('smsblast') ? undefined : 'none' }}>
        {/* Auto-blast info bar */}
        <div className="py-3 pr-6 pl-0 border-b border-white/5 flex items-center justify-between bg-transparent">
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
                aria-label="Auto-blast lead days"
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
                  } catch { }
                }}
                className="bg-transparent text-white border border-white/15 rounded px-2 py-1 text-[0.7rem] outline-none cursor-pointer"
              >
                {[1, 2, 3, 5, 7].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          )}
        </div>

        <div className="py-6 pr-6 pl-0">
          <p className="text-[0.7rem] text-white/40 mb-5">
            {smsAutoBlast
              ? 'Blasts auto-send for public shows. You can still manually send or override below. Private events are always excluded.'
              : 'Pick an upcoming show and we\u0027ll auto-compose a text with all the details. Only fans subscribed within proximity of the venue will receive it.'}
          </p>

          {/* Show Picker */}
          <div className="space-y-4">
            <div>
              <label htmlFor="sms-selected-show-select" className="text-[0.6rem] font-bold uppercase tracking-widest text-white/40 mb-2 block">Select Show</label>
              <select
                id="sms-selected-show-select"
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
                      ` 7th Heaven is playing in your area!`,
                      ``,
                      ` ${show.venue} — ${location}`,
                    ];
                    if (dateStr) lines.push(` ${dateStr}`);
                    let timeLine = "";
                    if (show.doorsTime) timeLine += ` Doors: ${show.doorsTime}`;
                    if (show.time) timeLine += `${timeLine ? " | " : ""}Show: ${show.time}`;
                    if (show.playTime) timeLine += `${timeLine ? " | " : ""}Plays: ${show.playTime}`;
                    if (timeLine) lines.push(timeLine);
                    if (show.allAges === true) lines.push(` All Ages`);
                    else if (show.allAges === false) lines.push(` 21+`);
                    if (show.cover) {
                      const lc = show.cover.toLowerCase();
                      if (lc === 'free' || lc === 'no cover' || lc === '$0') lines.push(` FREE — No Cover`);
                      else lines.push(` Cover: ${show.cover}`);
                    }
                    lines.push(``);
                    lines.push(`Reply STOP to unsubscribe.`);
                    setSmsPreview(lines.join('\n'));
                  } else {
                    setSmsPreview('');
                  }
                }}
                className="w-full bg-white text-slate-900 border border-slate-300 dark:border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-rose-500/50 transition-colors appearance-none cursor-pointer"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23ffffff40' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center' }}
              >
                <option value="">— Select an upcoming show —</option>
                {smsShows.map((show: any, idx: number) => {
                  const dateStr = (() => {
                    try {
                      const d = new Date(show.date + 'T12:00:00');
                      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    } catch { return show.date; }
                  })();
                  const loc = show.state ? `${show.city}, ${show.state}` : show.city;
                  return (
                    <option key={show._id || `${show.date}-${show.venue}`} value={show._id || show.date}>
                      {dateStr} — {show.venue} ({loc}) {show.time ? `@ ${show.time}` : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Twilio Gateway & Cost Summary Bar */}
            <div className="bg-transparent border-none p-0 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3 border-b border-white/10 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 font-extrabold text-sm shrink-0">

                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-white">Twilio A2P 10DLC Gateway</span>
                      <span className="px-2 py-0.5 bg-emerald-500/15 border border-emerald-500/40 text-[var(--color-accent)] text-[10px] font-black uppercase rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Connected
                      </span>
                    </div>
                    <span className="text-[11px] text-white/50">
                      Sender Number: <strong className="text-white/80">+1 (888) 7H-ROCKS</strong> (Toll-Free Verified) • SID: <code className="text-rose-300/80">AC89f2a...98e4</code>
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="text-right">
                    <div className="text-white/40 text-[10px] uppercase font-bold tracking-wider">Twilio Credit Balance</div>
                    <div className="text-emerald-400 font-black text-sm">${smsTwilioBalance.toFixed(2)}</div>
                  </div>
                  <div className="text-right pl-4 border-l border-white/10">
                    <div className="text-white/40 text-[10px] uppercase font-bold tracking-wider">Total Spent So Far</div>
                    <div className="text-rose-400 font-black text-sm">${smsTotalSpentAllTime.toFixed(2)}</div>
                  </div>
                </div>
              </div>

              {/* Quick Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-transparent border-none p-0 text-center">
                  <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Target Audience</div>
                  <div className="text-base font-extrabold text-white">480 fans</div>
                  <div className="text-[9px] text-[var(--color-accent)]">Within 25mi radius</div>
                </div>
                <div className="bg-transparent border-none p-0 text-center">
                  <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Twilio Rate</div>
                  <div className="text-base font-extrabold text-purple-300">${smsCostPerSegment}/SMS</div>
                  <div className="text-[9px] text-white/40">US Standard Rate</div>
                </div>
                <div className="bg-transparent border-none p-0 text-center">
                  <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Cost to Send This Blast</div>
                  <div className="text-base font-black text-rose-400">
                    ${((smsCustomMsg.replace(/<[^>]*>/g, '').trim() || smsPreview ? Math.ceil(((smsCustomMsg.replace(/<[^>]*>/g, '').trim() || smsPreview).length || 1) / 160) : 1) * 480 * smsCostPerSegment).toFixed(2)}
                  </div>
                  <div className="text-[9px] text-white/40">
                    {(smsCustomMsg.replace(/<[^>]*>/g, '').trim() || smsPreview ? Math.ceil(((smsCustomMsg.replace(/<[^>]*>/g, '').trim() || smsPreview).length || 1) / 160) : 1)} Segment per fan
                  </div>
                </div>
                <div className="bg-transparent border-none p-0 text-center">
                  <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Total SMS Sent</div>
                  <div className="text-base font-extrabold text-white">{smsTotalSpentAllTime.toLocaleString()}</div>
                  <div className="text-[9px] text-purple-300">Across 4 blasts</div>
                </div>
              </div>
            </div>

            {/*  Interactive Smartphone Text Message Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pt-2">
              <div className="lg:col-span-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[0.65rem] font-extrabold uppercase tracking-widest text-rose-400 flex items-center gap-1.5">
                    <span></span> Live Twilio SMS Smartphone Preview
                  </span>
                  <span className="text-[10px] text-white/40 italic">Renders exact recipient view</span>
                </div>

                {/* Real iPhone 16 Pro Frame Device */}
                <div className="relative mx-auto w-[330px] h-[660px] select-none filter drop-shadow-[0_20px_50px_rgba(0,0,0,0.9)]">
                  {/* Screen Content placed precisely inside the screen cutout */}
                  <div className="absolute top-[24px] left-[20px] right-[20px] bottom-[24px] rounded-[44px] overflow-hidden bg-[#07070b] flex flex-col justify-between pt-7">
                    {/* Status Bar */}
                    <div className="px-6 pt-1 pb-1 flex items-center justify-between text-[11px] font-bold text-white/80 shrink-0 z-10">
                      <span>9:41</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px]">5G</span>
                        <div className="w-4 h-2 rounded border border-white/70 p-0.5 flex items-center">
                          <div className="w-2.5 h-full bg-emerald-400 rounded-xs" />
                        </div>
                      </div>
                    </div>

                    {/* Messages App Header */}
                    <div className="bg-[#181824] px-4 py-2.5 border-b border-white/10 flex items-center gap-3 shrink-0">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-600 via-purple-600 to-amber-500 flex items-center justify-center text-xs font-black text-white shadow-md">
                        7H
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-white leading-tight">7th Heaven Band</div>
                        <div className="text-[9px] text-[var(--color-accent)] font-semibold mt-0.5">Verified Twilio SMS</div>
                      </div>
                    </div>

                    {/* Message Body Screen */}
                    <div className="p-4 flex-1 overflow-y-auto bg-[#07070b] space-y-3 font-sans text-xs custom-scrollbar">
                      <div className="text-center text-[9px] text-white/40 font-semibold tracking-wider uppercase">Today 9:41 AM</div>

                      {/* SMS Bubble */}
                      <div className="bg-[#242333] text-white/90 p-3.5 rounded-2xl rounded-tl-xs border border-white/10 shadow-lg text-[11px] leading-relaxed whitespace-pre-wrap">
                        {smsCustomMsg.replace(/<[^>]*>/g, '').trim() || smsPreview || (
                          <span className="text-white/40 italic">Select an upcoming show above or type a custom message to preview the SMS...</span>
                        )}
                      </div>
                    </div>

                    {/* Footer Reply Bar Mock */}
                    <div className="bg-[#181824] px-4 py-3 border-t border-white/10 flex items-center justify-between text-[10px] text-white/50 shrink-0 mb-3">
                      <span>iMessage / SMS</span>
                      <span className="text-rose-400 font-black tracking-wide">Reply STOP to unsubscribe</span>
                    </div>
                  </div>

                  {/* Real iPhone 16 Pro Bezel Frame Image Overlay */}
                  <NextImage
                    src="/images/iphone-frame.png"
                    alt="iPhone 16 Pro Frame"
                    fill
                    sizes="(max-width: 768px) 100vw, 380px"
                    className="object-contain pointer-events-none z-20"
                  />
                </div>

                {/* Character & Segment Stats */}
                <div className="bg-black/30 border border-white/10 p-3 text-xs flex items-center justify-between">
                  <div>
                    <span className="text-white/40">Character Count: </span>
                    <strong className="text-white">{(smsCustomMsg.replace(/<[^>]*>/g, '').trim() || smsPreview).length} chars</strong>
                  </div>
                  <div>
                    <span className="text-white/40">Twilio Segments: </span>
                    <strong className="text-purple-300">
                      {Math.ceil(((smsCustomMsg.replace(/<[^>]*>/g, '').trim() || smsPreview).length || 1) / 160)} Segment ({Math.ceil(((smsCustomMsg.replace(/<[^>]*>/g, '').trim() || smsPreview).length || 1) / 160) * 160} max)
                    </strong>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 space-y-4">
                {/* Custom message override */}
                <div>
                  <span className="text-[0.6rem] font-bold uppercase tracking-widest text-white/40 mb-2 block">
                    Custom Message Override <span className="text-white/20 normal-case">(optional — replaces auto-message)</span>
                  </span>
                  <div className="w-full text-black [&_.ql-editor]:min-h-[110px] relative z-20">
                    <ReactQuill
                      theme="snow"
                      value={smsCustomMsg}
                      onChange={setSmsCustomMsg}
                      placeholder="Leave empty to use the auto-generated message above"
                      className="bg-white overflow-hidden text-xs"
                    />
                  </div>
                </div>

                {/*  Cost Breakdown Calculator */}
                <div className="bg-black/40 border border-white/10 p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold border-b border-white/10 pb-2">
                    <span className="text-white flex items-center gap-1.5"> Blast Cost Breakdown</span>
                    <span className="text-emerald-400">Twilio Pay-As-You-Go</span>
                  </div>
                  <div className="space-y-1.5 text-xs text-white/70">
                    <div className="flex items-center justify-between">
                      <span>Recipients (25mi Radius):</span>
                      <span className="font-bold text-white">480 subscribers</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Segments per Message:</span>
                      <span className="font-bold text-purple-300">
                        {Math.ceil(((smsCustomMsg.replace(/<[^>]*>/g, '').trim() || smsPreview).length || 1) / 160)} Segment
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Twilio Carrier Fee:</span>
                      <span className="font-bold text-white">$0.0079 / SMS</span>
                    </div>
                    <div className="border-t border-white/10 pt-2 flex items-center justify-between text-sm font-extrabold text-white">
                      <span>Total Estimated Cost:</span>
                      <span className="text-rose-400">
                        ${((smsCustomMsg.replace(/<[^>]*>/g, '').trim() || smsPreview ? Math.ceil(((smsCustomMsg.replace(/<[^>]*>/g, '').trim() || smsPreview).length || 1) / 160) : 1) * 480 * smsCostPerSegment).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Send controls */}
                <div className="flex items-center justify-between pt-2">
                  <div>
                    {smsResult && (
                      <div className={`text-sm font-bold ${smsResult.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {smsResult.success ? (
                          <>
                            {smsResult.sent !== undefined ? `Sent to ${smsResult.sent} fan${smsResult.sent !== 1 ? 's' : ''}` : smsResult.message}
                            {smsResult.note && <span className="text-purple-300 ml-2 text-xs">({smsResult.note})</span>}
                          </>
                        ) : (
                          <> {smsResult.error}</>
                        )}
                      </div>
                    )}
                  </div>
                  <button
                    disabled={smsSending || !smsSelectedShow}
                    onClick={async () => {
                      if (smsSendingRef.current) return;
                      const show = smsShows.find((s: any) => s._id === smsSelectedShow);
                      if (!show) return;
                      const recipientDesc = `480 fans near ${show.venue}`;
                      const calcCost = ((smsCustomMsg.replace(/<[^>]*>/g, '').trim() || smsPreview ? Math.ceil(((smsCustomMsg.replace(/<[^>]*>/g, '').trim() || smsPreview).length || 1) / 160) : 1) * 480 * smsCostPerSegment).toFixed(2);
                      if (!confirm(`Send Twilio proximity SMS to ${recipientDesc}? (Estimated cost: ${calcCost})`)) return;
                      smsSendingRef.current = true;
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
                          body.playTime = show.playTime || '';
                          if (show.allAges !== undefined && show.allAges !== null) body.allAges = show.allAges;
                          if (show.cover) body.cover = show.cover;
                        }
                        const res = await fetch('/api/sms/send', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(body),
                        });
                        if (res.ok) {
                          const data = await res.json();
                          setSmsResult(data);
                          if (data.success) {
                            const costNum = parseFloat(calcCost);
                            setSmsTwilioBalance(prev => Math.max(0, prev - costNum));
                            setSmsTotalSpentAllTime(prev => prev + costNum);
                            setSmsTotalSentAllTime(prev => prev + 480);
                            setSmsHistoryLogs(prev => [
                              { id: `blast_${Date.now()}`, date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), venue: show.venue, city: show.city, recipients: 480, segments: 1, cost: costNum, status: 'Delivered (Twilio 10DLC)' },
                              ...prev
                            ]);
                          }
                        }
                      } catch (err: any) {
                        setSmsResult({ error: err.message });
                      }
                      smsSendingRef.current = false;
                      setSmsSending(false);
                    }}
                    className="px-6 py-3 bg-rose-500 hover:bg-rose-400 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold text-sm uppercase tracking-widest rounded-lg transition-colors flex items-center gap-2 shadow-[0_0_20px_rgba(244,63,94,0.3)] cursor-pointer"
                  >
                    {smsSending ? (
                      <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending Twilio Blast...</>
                    ) : (
                      <> Send Proximity Blast</>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/*  Cumulative Twilio Spending & History Log Table */}
            <div className="border-t border-white/10 pt-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-white flex items-center gap-2">
                  <span></span> Twilio Blast History & Spending Logs
                </h4>
                <span className="text-[11px] text-white/40">Total Spent: <strong className="text-rose-400">${smsTotalSpentAllTime.toFixed(2)}</strong></span>
              </div>

              <div className="overflow-x-auto border-none bg-transparent">
                <table className="w-full text-left text-xs text-white/80 border-collapse">
                  <thead className="bg-transparent text-[10px] font-black uppercase tracking-wider text-white/40 border-b border-white/15">
                    <tr>
                      <th className="py-2.5 pr-4 pl-0">Date</th>
                      <th className="py-2.5 px-4">Venue / Location</th>
                      <th className="py-2.5 px-4">Recipients</th>
                      <th className="py-2.5 px-4">Segments</th>
                      <th className="py-2.5 px-4">Total Cost</th>
                      <th className="py-2.5 pl-4 pr-0 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {smsHistoryLogs.map(log => (
                      <tr key={log.id} className="hover:bg-white/[0.04] border-b border-white/10">
                        <td className="py-2.5 pr-4 pl-0 font-bold text-white">{log.date}</td>
                        <td className="py-2.5 px-4">{log.venue} <span className="text-white/40">({log.city})</span></td>
                        <td className="py-2.5 px-4 font-mono">{log.recipients} fans</td>
                        <td className="py-2.5 px-4 font-mono">{log.segments} SMS</td>
                        <td className="py-2.5 px-4 font-extrabold text-rose-400">${log.cost.toFixed(2)}</td>
                        <td className="py-2.5 pl-4 pr-0 text-right">
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-[var(--color-accent)] border border-emerald-500/30 text-[10px] font-bold rounded">
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );



  const renderCrewSms = () => {
    const rawRecipients = crewAlertStats?.recipients || [];
    const isNotBandOnlyMember = (name: string, email?: string) => {
      const lowerN = (name || '').toLowerCase();
      const lowerE = (email || '').toLowerCase();
      if (lowerN.includes('richard') || lowerN.includes('hofherr')) return false;
      if (lowerE.includes('richard') || lowerE.includes('hofherr')) return false;
      return true;
    };

    const recipients = rawRecipients.filter(r => isNotBandOnlyMember(r.name, r.email));
    const localDuties = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('7h_crew_duties') || '{}') : {};

    const allCrewCombined = [
      ...recipients.map(r => {
        const matchedStatic = staticCrew.find(sc => sc.id === r.id);
        const defaultRole = matchedStatic ? matchedStatic.role : (r.role && r.role !== 'crew' ? r.role : 'CREW');
        const customDuty = localDuties[r.id] !== undefined ? localDuties[r.id] : r.duty;
        return {
          id: r.id,
          name: r.name,
          phone: r.phone,
          duty: customDuty || defaultRole,
          role: customDuty || defaultRole,
          avatar: resolveMemberAvatar(r.name, r.avatar),
          email: r.email
        };
      }),
      ...staticCrew.flatMap(sc => {
        if (!(!recipients.some(r => r.id === sc.id) && isNotBandOnlyMember(sc.name, sc.email))) return [];
        const customDuty = localDuties[sc.id] !== undefined ? localDuties[sc.id] : null;
        return [{
          id: sc.id,
          name: sc.name,
          phone: sc.phone,
          duty: customDuty || sc.role || 'CREW',
          role: customDuty || sc.role || 'CREW',
          avatar: resolveMemberAvatar(sc.name, sc.avatar),
          email: sc.email
        }];
      })
    ];

    const handleToggleMember = (r: any) => {
      const idKey = r.id;
      const norm = r.phone ? normalizePhoneNumber(r.phone) : null;
      setSelectedCrewPhones(prev => {
        const isSel = prev.includes(idKey) || (norm ? prev.includes(norm) : false);
        if (isSel) {
          return prev.filter(p => p !== idKey && p !== norm);
        } else {
          return [...prev, idKey];
        }
      });
    };

    const handleSelectGroup = (groupName: string) => {
      setSelectedGroup(groupName);
      if (groupName === '') {
        setSelectedCrewPhones([]);
        return;
      }
      if (groupName === 'all') {
        setSelectedCrewPhones(allCrewCombined.map(r => r.id));
        return;
      }
      const group = crewGroups.find(g => g.name === groupName);
      if (group) {
        const memberIds = allCrewCombined
          .flatMap(r =>
            group.memberIds.some(mId =>
              mId === r.id ||
              mId.toLowerCase() === (r.name || '').toLowerCase()
            ) ? [r.id] : []
          );
        setSelectedCrewPhones(memberIds);
      }
    };

    const handleSaveSmsGroup = () => {
      const trimmed = newSmsGroupName.trim();
      if (!trimmed) {
        setNewSmsGroupError('Please enter a group name.');
        return;
      }

      const selectedCrewPhonesSet = new Set(selectedCrewPhones);
      const memberIds = allCrewCombined
        .flatMap(r => {
          const norm = r.phone ? normalizePhoneNumber(r.phone) : null;
          return (selectedCrewPhonesSet.has(r.id) || (norm ? selectedCrewPhonesSet.has(norm) : false)) ? [r.id] : [];
        });

      if (memberIds.length === 0) {
        setNewSmsGroupError('Please select at least one crew member.');
        return;
      }

      setNewSmsGroupError('');
      const newGroup = {
        name: trimmed,
        memberIds: memberIds
      };

      const updatedGroups = [...crewGroups, newGroup];
      setCrewGroups(updatedGroups);
      localStorage.setItem('7h_crew_groups_v1', JSON.stringify(updatedGroups));

      setSelectedGroup(trimmed);
      setNewSmsGroupName('');
      setShowSaveSmsGroup(false);
    };

    const handleSaveDuty = async (targetKey: string) => {
      setSavingDuty(true);
      const profileId = targetKey.replace(/^(main|group|preview):/, '');
      try {
        const val = editingDutyValue.trim();
        // Fallback policy: if last custom role is removed, fallback to Unassigned or static default
        const matchedStatic = STATIC_CREW.find(sc => sc.id === profileId);
        const finalRole = val || (matchedStatic ? (matchedStatic.role || 'CREW') : 'Unassigned');

        // Save to localStorage so static and dynamic roles persist reliably
        if (typeof window !== 'undefined') {
          const savedDuties = JSON.parse(localStorage.getItem('7h_crew_duties_v1') || localStorage.getItem('7h_crew_duties') || '{}');
          savedDuties[profileId] = finalRole;
          localStorage.setItem('7h_crew_duties_v1', JSON.stringify(savedDuties));
        }

        // Call backend API
        await fetch('/api/admin/crew-alert', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profileId, duty: finalRole }),
        });

        // Update local React state for immediate feedback
        setCrewAlertStats((prev: any) => {
          if (!prev) return { recipients: [{ id: profileId, duty: finalRole }] };
          const existing = prev.recipients || [];
          let found = false;
          const updatedRecipients = existing.map((item: any) => {
            if (item.id === profileId) {
              found = true;
              return { ...item, duty: finalRole };
            }
            return item;
          });
          if (!found) {
            updatedRecipients.push({ id: profileId, duty: finalRole });
          }
          return {
            ...prev,
            recipients: updatedRecipients
          };
        });
        setEditingDutyMemberId(null);
      } catch (err: any) {
        console.error("Failed to save role:", err);
      } finally {
        setSavingDuty(false);
      }
    };



    const selectedCrewPhonesSetForPreview = new Set(selectedCrewPhones);
    const checkedRecipientsForPreview = allCrewCombined.filter(c => {
      const norm = c.phone ? normalizePhoneNumber(c.phone) : null;
      return selectedCrewPhonesSetForPreview.has(c.id) || (norm ? selectedCrewPhonesSetForPreview.has(norm) : false);
    });
    const showTarget = smsSelectedShowDate ? tourDates.find((s: any) => s.date === smsSelectedShowDate) : null;
    const showVenueTarget = showTarget ? (showTarget.venue || showTarget.venue_name) : undefined;
    const showTimeTarget = showTarget ? (showTarget.time || '5:00 PM - 10:00 PM') : undefined;

    const previewRecipientsList = (checkedRecipientsForPreview.length > 0 ? checkedRecipientsForPreview : allCrewCombined).map(r => {
      const dayShifts = schedulesByDateAndCrew[smsSelectedShowDate || '']?.[r.id] || [];
      const roleStr = dayShifts.length > 0 ? Array.from(new Set(dayShifts.map(s => s.role))).join(', ') : (r.role ? r.role.toUpperCase() : 'CREW');
      const timeStr = dayShifts.length > 0 ? dayShifts.map(s => formatTimeFrame(s.startHour, s.endHour)).join(', ') : '5:00 PM - 10:00 PM';
      return {
        name: r.name,
        phone: r.phone || '(555) 234-5678',
        email: r.email || `${r.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@7thheavenband.com`,
        avatar: r.avatar || '',
        role: roleStr,
        hours: timeStr
      };
    });

    const emailHtmlPreview = crewSmsDispatchedAlert({
      message: crewAlertMsg || 'Load-in moved to 3PM. Doors at 6. See you there.',
      showDate: smsSelectedShowDate || undefined,
      showVenue: showVenueTarget,
      showTime: showTimeTarget,
      recipients: previewRecipientsList
    });

    return (
      <section id="section-crewsms" className="overflow-hidden">
        <div role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleSection('crewsms'); } }} onClick={() => toggleSection('crewsms')} className="py-6 pr-6 pl-0 flex items-center justify-between cursor-pointer select-none">
          <div className="flex items-center gap-2">
            <div className="drag-handle cursor-grab active:cursor-grabbing py-1.5 pr-1.5 pl-0 hover:bg-white/5 rounded text-white/20 hover:text-white/50 transition-colors shrink-0 mr-1" title="Drag to reorder section" onClick={(e) => e.stopPropagation()}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="9" cy="19" r="1" /><circle cx="15" cy="5" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="19" r="1" /></svg>
            </div>
            <h3 className="cursor-pointer text-lg font-bold tracking-tight flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
              Crew SMS Alert & Group Setup
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <div className={"w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center transition-transform duration-300 " + (isSectionOpen('crewsms') ? 'rotate-0' : '-rotate-90')}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/40"><path d="M2 4l4 4 4-4" /></svg>
            </div>
          </div>
        </div >
        {renderInfoBanner('crewsms', 'Crew SMS Alert & Group Setup', 'Select target crew members or saved groups to broadcast emergency text messages or load-in notices.')}
        < div style={{ display: isSectionOpen('crewsms') ? undefined : 'none' }}>
          <div className="py-6 pr-0 pl-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Member List (Choose Recipients) */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[0.65rem] font-bold uppercase tracking-widest text-black/60 dark:text-white/40 block">Choose Recipients</span>
                    <button
                      type="button"
                      onClick={() => setIsManageRolesModalOpen(true)}
                      className="px-2 py-1 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 rounded text-[var(--font-size-4xs)] font-bold text-black/70 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1 border-solid"
                    >
                      Manage Preset Roles
                    </button>
                  </div>
                  <span className="text-[0.6rem] text-black/40 dark:text-white/30 font-mono">
                    Showing {recipients.length} Crew Member{recipients.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="bg-transparent border-none p-0 py-2 min-h-[650px] max-h-[900px] overflow-y-auto custom-scrollbar">
                  <div className="flex flex-col gap-1">
                    {(() => {
                      const selectedCrewPhonesSet = new Set(selectedCrewPhones);
                      return recipients
                        .slice()
                        .sort((a, b) => {
                          const normA = a.phone ? normalizePhoneNumber(a.phone) : null;
                          const normB = b.phone ? normalizePhoneNumber(b.phone) : null;
                          const aChecked = selectedCrewPhonesSet.has(a.id) || (normA ? selectedCrewPhonesSet.has(normA) : false);
                          const bChecked = selectedCrewPhonesSet.has(b.id) || (normB ? selectedCrewPhonesSet.has(normB) : false);
                          if (aChecked && !bChecked) return -1;
                          if (!aChecked && bChecked) return 1;
                          return a.name.localeCompare(b.name);
                        })
                        .map((r) => {
                          const norm = r.phone ? normalizePhoneNumber(r.phone) : null;
                          const isChecked = selectedCrewPhonesSet.has(r.id) || (norm ? selectedCrewPhonesSet.has(norm) : false);
                          const editKey = `main:${r.id}`;
                          const isEditingThis = editingDutyMemberId === editKey || editingDutyMemberId === r.id;
                          return (
                            <div
                              key={r.id}
                              className={`flex items-center justify-between gap-2.5 pr-2.5 pl-0 py-2 border-b border-white/15 transition-colors duration-200 relative min-h-[38px] ${isChecked
                                ? 'bg-purple-500/10 text-white'
                                : 'hover:bg-white/[0.04]'
                                }`}
                              title={` ${r.phone || 'No phone'} \n ${r.email || 'No email'}`}
                            >
                              <div
                                role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleToggleMember(r); } }}
                                onClick={() => handleToggleMember(r)}
                                className="flex items-center gap-2.5 flex-1 min-w-0 select-none h-full cursor-pointer"
                              >
                                {/* High-Visibility Amber Checkbox */}
                                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors shrink-0 select-none ${isChecked
                                  ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_10px_rgba(147, 51, 234,0.5)] scale-105'
                                  : 'bg-black/60 border-white/30 hover:border-white/60'
                                  }`}>
                                  {isChecked && (
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                  )}
                                </div>

                                {/* Avatar */}
                                {(() => {
                                  const avatarSrc = resolveMemberAvatar(r.name, r.avatar);
                                  return avatarSrc ? (
                                    <img
                                      src={avatarSrc}
                                      alt={r.name}
                                      className={`w-10 h-10 rounded-full object-cover shrink-0 border-2 border-white shadow-md ${!r.phone ? 'opacity-40' : ''}`}
                                      onError={(e) => {
                                        const fallback = resolveMemberAvatar(r.name, '');
                                        if (fallback && !e.currentTarget.src.endsWith(fallback)) {
                                          e.currentTarget.src = fallback;
                                        }
                                      }}
                                    />
                                  ) : (
                                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 border-2 border-white shadow-md flex items-center justify-center text-xs font-black uppercase text-black shrink-0 ${!r.phone ? 'opacity-40' : ''}`}>
                                      {r.name.slice(0, 2)}
                                    </div>
                                  );
                                })()}

                                {/* Name */}
                                <span className={`text-xs md:text-sm font-extrabold truncate leading-none ${!r.phone ? 'text-black/40 dark:text-white/40' : 'text-black dark:text-white'}`}>{r.name}</span>
                              </div>

                              {/* Role & Edit actions */}
                              <div className="flex items-center gap-1.5 shrink-0 relative">
                                {r.duty ? (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingDutyMemberId(isEditingThis ? null : editKey);
                                      setEditingDutyValue(r.duty || '');
                                    }}
                                    className="group relative inline-flex items-center gap-1 text-[9.5px] font-black uppercase tracking-tight  text-[var(--color-accent)] dark:text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 px-2 py-0.5 rounded leading-none shrink-0 shadow-xs cursor-pointer transition-colors hover:scale-105"
                                    title={`Click to change or edit role(s): ${r.duty}`}
                                  >
                                    <span className="truncate max-w-[180px] md:max-w-[260px]">{r.duty}</span>
                                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-70 group-hover:opacity-100 transition-opacity shrink-0"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z" /></svg>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingDutyMemberId(isEditingThis ? null : editKey);
                                      setEditingDutyValue(r.duty || '');
                                    }}
                                    className="text-[9.5px] text-white/50 hover:text-purple-300 italic leading-none shrink-0 cursor-pointer bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded border border-white/10 transition-colors flex items-center gap-1"
                                    title="Click to assign role(s)"
                                  >
                                    <span>+ Assign Role</span>
                                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-60 shrink-0"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z" /></svg>
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingDutyMemberId(isEditingThis ? null : editKey);
                                    setEditingDutyValue(r.duty || '');
                                  }}
                                  className="p-1 rounded bg-white/5 hover:bg-white/10 border border-white/5 text-white/40 hover:text-white/80 transition-colors cursor-pointer flex items-center justify-center"
                                  title="Edit Role"
                                >
                                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z" /></svg>
                                </button>

                                {isEditingThis && (
                                  <div
                                    className="absolute right-0 top-full mt-1.5 p-3 bg-white border border-slate-300 space-y-2.5 w-[280px] text-black border-solid z-50 animate-[scaleIn_0.15s_ease-out]"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                                      <div className="truncate pr-2">
                                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-900 block truncate">Edit Roles</span>
                                        <span className="text-[9px] font-bold text-slate-500 block truncate">{r.name}</span>
                                      </div>
                                      <div className="flex items-center gap-1 shrink-0">
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleSaveDuty(r.id);
                                          }}
                                          disabled={savingDuty}
                                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] rounded cursor-pointer border-none shadow-xs uppercase tracking-wider"
                                        >
                                          Save
                                        </button>
                                        <button
                                          type="button"
                                          aria-label="Cancel editing duty member"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingDutyMemberId(null);
                                          }}
                                          className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[10px] rounded cursor-pointer border-none"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </div>

                                    {/* Quick-Select Chips (All Roles) */}
                                    <div>
                                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">Quick Toggle Presets:</span>
                                      <div className="flex flex-wrap gap-1 max-h-[180px] overflow-y-auto custom-scrollbar p-1.5 bg-slate-50 border border-slate-200 rounded-lg">
                                        {Array.from(new Set([...(presetRoles || []), 'STAGE HAND', 'MERCH', 'MOVING EQUIPMENT', 'TEAR DOWN', 'VIP HOST', 'MC', 'BAND MEMBER', 'AUDIO MIX', 'EQUIPMENT SETUP', 'LIGHTS', 'SERVER', 'EVENT SUPPORT', 'SOUND ENGINEER', 'TOUR MANAGER', 'CHEF', 'DRIVER', 'SECURITY', 'PHOTOGRAPHER', 'CREW'])).map((chip) => {
                                          const currentList = editingDutyValue.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
                                          const isSelected = currentList.includes(chip.toUpperCase());
                                          return (
                                            <button
                                              key={chip}
                                              type="button"
                                              onClick={() => {
                                                let updated: string[];
                                                if (isSelected) {
                                                  updated = currentList.filter(c => c !== chip.toUpperCase());
                                                } else {
                                                  updated = [...currentList, chip.toUpperCase()];
                                                }
                                                setEditingDutyValue(updated.join(', '));
                                              }}
                                              className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider transition-colors cursor-pointer border ${isSelected
                                                ? 'bg-purple-600 border-purple-600 text-white shadow-xs'
                                                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-slate-400'
                                                }`}
                                            >
                                              {isSelected ? ` ${chip}` : `+ ${chip}`}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>

                                    {/* Custom role input */}
                                    <div className="pt-1.5 border-t border-slate-200 space-y-1">
                                      <div className="flex items-center justify-between">
                                        <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500">Custom / Edit Text:</span>
                                        {editingDutyValue && (
                                          <button
                                            type="button"
                                            onClick={() => setEditingDutyValue('')}
                                            className="text-[9px] font-bold text-rose-600 hover:text-rose-800 border-none bg-transparent cursor-pointer"
                                          >
                                            Clear Roles
                                          </button>
                                        )}
                                      </div>
                                      <input
                                        type="text"
                                        aria-label="Custom duty roles"
                                        value={editingDutyValue}
                                        onChange={(e) => setEditingDutyValue(e.target.value)}
                                        placeholder="e.g. STAGE HAND, MERCH..."
                                        style={{ backgroundColor: '#ffffff', color: '#000000' }}
                                        className="w-full bg-white! text-black! border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold placeholder-slate-400 focus:outline-none focus:border-purple-500 shadow-xs"
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            handleSaveDuty(r.id);
                                          }
                                        }}
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        });
                    })()}
                  </div>
                </div>
              </div>

              {/* Right Column: Group Setup & Message Sending */}
              <div className="space-y-5">
                {/* Group dropdown & save selection */}
                <div className="bg-[var(--color-bg-card)]/40 py-4 pl-4 pr-0 space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label htmlFor="crew-sms-select-group" className="text-[0.65rem] font-bold text-black/60 dark:text-white/40 uppercase tracking-wider block">Select Group</label>
                      <button
                        type="button"
                        onClick={() => {
                          setNewSmsGroupError('');
                          setShowSaveSmsGroup(true);
                        }}
                        className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white font-black rounded text-[10px] transition-colors cursor-pointer border-none flex items-center gap-1 shadow-sm uppercase tracking-wider"
                      >
                        Create Group
                      </button>
                    </div>
                    <Dropdown
                      id="crew-sms-select-group"
                      fullWidth={true}
                      placeholder="Choose a group..."
                      selected={selectedGroup}
                      options={[
                        { label: "Choose a group...", value: "" },
                        { label: `All Crew & Admins (${recipients.length})`, value: "all" },
                        { label: "Create New Group...", value: "CREATE_NEW" },
                        ...crewGroups.map((g) => ({ label: `${g.name} (${g.memberIds.length})`, value: g.name })),
                      ]}
                      onChange={(val) => {
                        if (val === 'CREATE_NEW') {
                          setNewSmsGroupError('');
                          setShowSaveSmsGroup(true);
                        } else {
                          handleSelectGroup(val);
                        }
                      }}
                      className="w-full"
                    />
                  </div>

                  {/* Select Show */}
                  <div>
                    <label htmlFor="crew-sms-select-show" className="text-[0.65rem] font-bold text-black/60 dark:text-white/40 uppercase tracking-wider block mb-2">Select Show (Autofill Crew)</label>
                    <Dropdown
                      id="crew-sms-select-show"
                      fullWidth={true}
                      placeholder="Choose a show..."
                      selected={smsSelectedShowDate}
                      options={[
                        { label: "Choose a show...", value: "" },
                        ...tourDates
                          .filter((show: any) => show.date)
                          .sort((a: any, b: any) => a.date.localeCompare(b.date))
                          .map((show: any) => ({
                            label: `${show.date} - ${show.venue || show.venue_name || 'Show'}`,
                            value: show.date,
                          })),
                      ]}
                      onChange={(val) => selectShowForSms(val)}
                      className="w-full"
                    />
                  </div>

                  {/* Active Show Banner */}
                  {(() => {
                    if (!smsSelectedShowDate) return null;
                    const show = tourDates.find((s: any) => s.date === smsSelectedShowDate);
                    const showVenue = show ? (show.venue || show.venue_name) : 'Show';
                    return (
                      <div className="p-3 bg-purple-500/10 border border-purple-500/20 flex items-center justify-between text-xs animate-[fadeIn_0.2s_ease-out]">
                        <div>
                          <span className="text-[0.65rem] font-bold text-purple-300 block uppercase tracking-widest">Active Show Target</span>
                          <span className="text-white font-bold">{showVenue} ({smsSelectedShowDate})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => selectShowForSms('')}
                          className="text-white/40 hover:text-white transition-colors border-none bg-transparent cursor-pointer text-sm font-bold"
                          title="Clear targeted show"
                        >

                        </button>
                      </div>
                    );
                  })()}

                  {/* Show Selected Group Members & Delete Button */}
                  {(() => {
                    if (!selectedGroup || selectedGroup === 'all') return null;
                    const group = crewGroups.find(g => g.name === selectedGroup);
                    if (!group) return null;
                    const names = group.memberIds.map(mId => {
                      const match = recipients.find(r => r.id === mId);
                      return match?.name || mId;
                    });
                    return (
                      <div className="p-3 bg-black/20 border border-white/5 space-y-2 text-xs animate-[fadeIn_0.2s_ease-out]">
                        <div className="flex items-center justify-between">
                          <span className="text-[0.65rem] font-bold text-white/40 uppercase tracking-widest">Group Members ({names.length})</span>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete the group "${group.name}"?`)) {
                                const updated = crewGroups.filter(g => g.name !== group.name);
                                setCrewGroups(updated);
                                localStorage.setItem('7h_crew_groups_v1', JSON.stringify(updated));
                                setSelectedGroup("");
                                setSelectedCrewPhones([]);
                              }
                            }}
                            className="text-[var(--font-size-4xs)] text-rose-400 hover:text-rose-300 font-bold border-none bg-transparent cursor-pointer"
                          >
                            Delete Group
                          </button>
                        </div>
                        <div className="text-white/80 font-bold leading-relaxed">
                          {names.join(', ')}
                        </div>
                      </div>
                    );
                  })()}

                  <div className="pt-2 border-t border-white/5">
                    {showSaveSmsGroup ? (
                      <div className="flex flex-col gap-2.5 bg-black/20 border border-white/5 p-3 animate-[slideIn_0.2s_ease-out]">
                        <div className="flex flex-col gap-1">
                          <label htmlFor="admin-new-sms-group-name" className="text-[0.55rem] font-bold uppercase tracking-widest text-white/40">New Group Name</label>
                          <input
                            id="admin-new-sms-group-name"
                            type="text"
                            value={newSmsGroupName}
                            onChange={(e) => {
                              setNewSmsGroupName(e.target.value);
                              if (newSmsGroupError) setNewSmsGroupError('');
                            }}
                            placeholder="Group name..."
                            style={{ backgroundColor: '#ffffff', color: '#000000' }}
                            className="bg-white! text-black! border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold placeholder-slate-400 focus:outline-none focus:border-purple-500 shadow-xs"
                          />
                        </div>

                        {/* Inline Checklist */}
                        <div className="flex flex-col gap-1">
                          <span className="text-[0.55rem] font-bold uppercase tracking-widest text-white/40">Select Group Members</span>
                          <div className="max-h-[550px] min-h-[420px] overflow-y-auto custom-scrollbar border border-white/5 rounded-lg p-2.5 bg-black/40 space-y-1.5">
                            {(() => {
                              const selectedCrewPhonesSet = new Set(selectedCrewPhones);
                              return allCrewCombined.map(r => {
                                const norm = r.phone ? normalizePhoneNumber(r.phone) : null;
                                const isChecked = selectedCrewPhonesSet.has(r.id) || (norm ? selectedCrewPhonesSet.has(norm) : false);
                                const editKey = `group:${r.id}`;
                                const isEditingThis = editingDutyMemberId === editKey;
                                const displayRole = r.duty || r.role || 'CREW';
                                return (
                                  <div
                                    key={r.id}
                                    className="flex items-center justify-between gap-2 select-none text-[var(--font-size-2xs)] text-white/80 hover:text-white py-2 px-1.5 border-b border-white/20 hover:bg-white/10 relative"
                                  >
                                    <div
                                      role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (newSmsGroupError) setNewSmsGroupError(""); handleToggleMember(r); } }}
                                      className="flex items-center gap-2 cursor-pointer flex-1"
                                      onClick={() => {
                                        if (newSmsGroupError) setNewSmsGroupError("");
                                        handleToggleMember(r);
                                      }}
                                    >
                                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 select-none ${isChecked
                                        ? 'bg-purple-600 border-purple-400 text-white shadow-sm'
                                        : 'bg-black/60 border-white/30'
                                        }`}>
                                        {isChecked && (
                                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                        )}
                                      </div>
                                      <span className="font-semibold text-white">{r.name}</span>
                                    </div>

                                    <div className="relative shrink-0">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setEditingDutyMemberId(isEditingThis ? null : editKey);
                                          setEditingDutyValue(r.duty || r.role || '');
                                        }}
                                        className="text-[7.5px] font-black uppercase tracking-tight text-purple-300 hover:text-purple-300 px-1.5 py-0.5 border border-purple-500/30 bg-purple-500/10 rounded shrink-0 font-mono hover:bg-purple-500/20 cursor-pointer transition-colors flex items-center gap-1 max-w-[200px]"
                                        title={`Click to edit role(s): ${displayRole}`}
                                      >
                                        <span className="truncate">{displayRole}</span>
                                        {isEditingThis && (
                                          <DutyRoleEditorPopover
                                            memberName={r.name}
                                            editKey={editKey}
                                            editingDutyValue={editingDutyValue}
                                            setEditingDutyValue={setEditingDutyValue}
                                            handleSaveDuty={handleSaveDuty}
                                            savingDuty={savingDuty}
                                            setEditingDutyMemberId={setEditingDutyMemberId}
                                            presetRoles={presetRoles}
                                            memberId={r.id}
                                          />
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                );
                              });
                            })()}
                          </div>
                        </div>

                        {newSmsGroupError && (
                          <span className="text-[var(--font-size-4xs)] font-bold text-red-400 block leading-tight">
                            {newSmsGroupError}
                          </span>
                        )}

                        <div className="flex items-center gap-2 mt-1">
                          <button
                            type="button"
                            onClick={handleSaveSmsGroup}
                            className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded transition-colors cursor-pointer border-none flex-1"
                          >
                            Save Group
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setNewSmsGroupError('');
                              setShowSaveSmsGroup(false);
                            }}
                            className="px-2.5 py-1.5 text-white/40 hover:text-white text-xs cursor-pointer border-none bg-transparent"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setNewSmsGroupError('');
                          setShowSaveSmsGroup(true);
                        }}
                        className="w-full px-3 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-wider rounded-lg shadow-md transition-colors cursor-pointer border-none flex items-center justify-center gap-1.5"
                      >
                        CREATE NEW GROUP FROM SELECTION
                      </button>
                    )}
                  </div>
                </div>



                {/* Confirm / Send Button */}
                <div className="pt-2">
                  {crewAlertResult && (
                    <p className={`text-xs font-bold ${crewAlertResult.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {crewAlertResult.success
                        ? ` Sent to ${crewAlertResult.sent} crew member${crewAlertResult.sent !== 1 ? 's' : ''}${crewAlertResult.dev ? ' (dev mode)' : ''}`
                        : ` ${crewAlertResult.error}`}
                      {crewAlertResult.failed > 0 && <span className="text-rose-400 ml-2">({crewAlertResult.failed} failed)</span>}
                    </p>
                  )}
                  <button
                    disabled={crewAlertSending || (sendSmsAlert && !crewAlertMsg.trim()) || (sendEmailAlert && !smsEmailSubject.trim()) || (!sendSmsAlert && !sendEmailAlert)}
                    onClick={async () => {
                      const sendCount = selectedCrewPhones.length > 0 ? selectedCrewPhones.length : recipients.length;
                      if (crewAlertSendingRef.current) return;
                      const isAll = selectedCrewPhones.length === 0;
                      if (!confirm(isAll
                        ? `No recipients selected. Send this broadcast to ALL ${sendCount} crew members?`
                        : `Send this broadcast to the ${sendCount} selected recipients?`
                      )) return;

                      crewAlertSendingRef.current = true;
                      setCrewAlertSending(true);
                      setCrewAlertResult(null);
                      try {
                        const show = smsSelectedShowDate ? tourDates.find((s: any) => s.date === smsSelectedShowDate) : null;
                        const showVenue = show ? (show.venue || show.venue_name) : undefined;
                        const showTime = show ? (show.time || '8:00pm') : undefined;

                        const res = await fetch('/api/admin/crew-alert', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            message: crewAlertMsg,
                            selectedPhones: isAll ? undefined : selectedCrewPhones,
                            sendSms: sendSmsAlert,
                            sendEmail: sendEmailAlert,
                            emailSubject: smsEmailSubject || undefined,
                            showDate: smsSelectedShowDate || undefined,
                            showVenue: showVenue || undefined,
                            showTime: showTime || undefined,
                            sendAsGroup: crewSendAsGroup
                          }),
                        });
                        if (res.ok) {
                          const data = await res.json();
                          setCrewAlertResult(data);
                          if (data.success) {
                            setCrewAlertMsg('');
                            setSelectedCrewPhones([]);
                            setSmsSelectedShowDate('');
                            setSmsEmailSubject('');
                            setSendEmailAlert(false);
                            setAuditLog(prev => [{
                              id: crypto.randomUUID(),
                              text: ` Sent Crew Broadcast (SMS: ${sendSmsAlert ? 'Yes' : 'No'}, Email: ${sendEmailAlert ? 'Yes' : 'No'}): "${data.sentCount || sendCount} recipients notified"`,
                              time: 'Just now',
                              color: 'bg-purple-600',
                              details: {
                                type: 'broadcast',
                                smsText: crewAlertMsg,
                                emailSubject: smsEmailSubject || undefined
                              }
                            }, ...prev]);
                          } else {
                            setAuditLog(prev => [{
                              id: crypto.randomUUID(),
                              text: ` Failed to send Crew Broadcast: ${data.error || 'Unknown error'}`,
                              time: 'Just now',
                              color: 'bg-red-500'
                            }, ...prev]);
                          }
                        }
                      } catch (err: any) {
                        setCrewAlertResult({ error: err.message });
                      }
                      crewAlertSendingRef.current = false;
                      setCrewAlertSending(false);
                    }}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-20 disabled:bg-purple-900/30 disabled:text-white/30 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-widest rounded-lg transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(147,51,234,0.3)] cursor-pointer border-none"
                  >
                    {crewAlertSending ? (
                      <><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Sending Broadcast...</>
                    ) : (
                      <> Send Broadcast</>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* FULL BLEED / FULL WIDTH MESSAGE COMPOSE & PREVIEW SECTION */}
            <div className="mt-6 space-y-5">
              {/* SMS & Email Option Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div
                  role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSendSmsAlert(prev => !prev); } }}
                  onClick={() => setSendSmsAlert(prev => !prev)}
                  className={`p-5 md:p-6 rounded-xl border-none transition-colors cursor-pointer select-none flex flex-col gap-2 ${sendSmsAlert
                    ? 'bg-purple-600/10 text-white shadow-[0_0_15px_rgba(147,51,234,0.1)]'
                    : 'bg-white/[0.01] text-white/40'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 transition-colors ${sendSmsAlert ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(147,51,234,0.4)]' : 'bg-white/10'
                      }`}>
                      {sendSmsAlert && (
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4.5"><polyline points="20 6 9 17 4 12" /></svg>
                      )}
                    </div>
                    <span className="text-xs font-black uppercase tracking-wider text-purple-300">SMS TEXTS</span>
                  </div>
                  <span className="text-[10px] text-white/40 leading-normal">Sends raw text alerts to active mobile numbers</span>
                </div>

                <div
                  role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSendEmailAlert(prev => !prev); } }}
                  onClick={() => setSendEmailAlert(prev => !prev)}
                  className={`p-5 md:p-6 rounded-xl border-none transition-colors cursor-pointer select-none flex flex-col gap-2 ${sendEmailAlert
                    ? 'bg-purple-600/10 text-white shadow-[0_0_15px_rgba(147,51,234,0.1)]'
                    : 'bg-white/[0.01] text-white/40'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 transition-colors ${sendEmailAlert ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(147,51,234,0.4)]' : 'bg-white/10'
                      }`}>
                      {sendEmailAlert && (
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4.5"><polyline points="20 6 9 17 4 12" /></svg>
                      )}
                    </div>
                    <span className="text-xs font-black uppercase tracking-wider text-purple-300">EMAIL ALERTS</span>
                  </div>
                  <span className="text-[10px] text-white/40 leading-normal">Sends styled HTML alerts to registered emails</span>
                </div>

                {sendSmsAlert && (
                  <div
                    role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setCrewSendAsGroup(prev => !prev); } }}
                    onClick={() => setCrewSendAsGroup(prev => !prev)}
                    className={`p-5 md:p-6 rounded-xl border-none transition-colors cursor-pointer select-none flex flex-col gap-2 ${crewSendAsGroup
                      ? 'bg-purple-600/10 text-white shadow-[0_0_15px_rgba(147,51,234,0.1)]'
                      : 'bg-white/[0.01] text-white/40'
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 transition-colors ${crewSendAsGroup ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(147,51,234,0.4)]' : 'bg-white/10'
                        }`}>
                        {crewSendAsGroup && (
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4.5"><polyline points="20 6 9 17 4 12" /></svg>
                        )}
                      </div>
                      <span className="text-xs font-black uppercase tracking-wider text-purple-300">SEND AS GROUP TEXT</span>
                    </div>
                    <span className="text-[10px] text-white/40 leading-normal">Appends list of recipients to SMS so everyone sees who is on alert</span>
                  </div>
                )}
              </div>

              {/* Confirm / Send Button */}
              <div className="space-y-3 pt-2">
                {crewAlertResult && (
                  <p className={`text-xs font-bold ${crewAlertResult.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {crewAlertResult.success
                      ? ` Sent to ${crewAlertResult.sent} crew member${crewAlertResult.sent !== 1 ? 's' : ''}${crewAlertResult.dev ? ' (dev mode)' : ''}`
                      : ` ${crewAlertResult.error}`}
                    {crewAlertResult.failed > 0 && <span className="text-rose-400 ml-2">({crewAlertResult.failed} failed)</span>}
                  </p>
                )}
                <button
                  disabled={crewAlertSending || (sendSmsAlert && !crewAlertMsg.trim()) || (sendEmailAlert && !smsEmailSubject.trim()) || (!sendSmsAlert && !sendEmailAlert)}
                  onClick={async () => {
                    const sendCount = selectedCrewPhones.length > 0 ? selectedCrewPhones.length : recipients.length;
                    if (crewAlertSendingRef.current) return;
                    const isAll = selectedCrewPhones.length === 0;
                    if (!confirm(isAll
                      ? `No recipients selected. Send this broadcast to ALL ${sendCount} crew members?`
                      : `Send this broadcast to the ${sendCount} selected recipients?`
                    )) return;

                    crewAlertSendingRef.current = true;
                    setCrewAlertSending(true);
                    setCrewAlertResult(null);
                    try {
                      const show = smsSelectedShowDate ? tourDates.find((s: any) => s.date === smsSelectedShowDate) : null;
                      const showVenue = show ? (show.venue || show.venue_name) : undefined;
                      const showTime = show ? (show.time || '8:00pm') : undefined;

                      const res = await fetch('/api/admin/crew-alert', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          message: crewAlertMsg,
                          selectedPhones: isAll ? undefined : selectedCrewPhones,
                          sendSms: sendSmsAlert,
                          sendEmail: sendEmailAlert,
                          emailSubject: smsEmailSubject || undefined,
                          showDate: smsSelectedShowDate || undefined,
                          showVenue: showVenue || undefined,
                          showTime: showTime || undefined,
                          sendAsGroup: crewSendAsGroup
                        }),
                      });
                      if (res.ok) {
                        const data = await res.json();
                        setCrewAlertResult(data);
                        if (data.success) {
                          setCrewAlertMsg('');
                          setSelectedCrewPhones([]);
                          setSmsSelectedShowDate('');
                          setSmsEmailSubject('');
                          setSendEmailAlert(false);
                          setAuditLog(prev => [{
                            id: crypto.randomUUID(),
                            text: ` Sent Crew Broadcast (SMS: ${sendSmsAlert ? 'Yes' : 'No'}, Email: ${sendEmailAlert ? 'Yes' : 'No'}): "${data.sentCount || sendCount} recipients notified"`,
                            time: 'Just now',
                            color: 'bg-purple-600',
                            details: {
                              type: 'broadcast',
                              smsText: crewAlertMsg,
                              emailSubject: smsEmailSubject || undefined
                            }
                          }, ...prev]);
                        } else {
                          setAuditLog(prev => [{
                            id: crypto.randomUUID(),
                            text: ` Failed to send Crew Broadcast: ${data.error || 'Unknown error'}`,
                            time: 'Just now',
                            color: 'bg-red-500'
                          }, ...prev]);
                        }
                      }
                    } catch (err: any) {
                      setCrewAlertResult({ error: err.message });
                    }
                    setCrewAlertSending(false);
                  }}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-20 disabled:bg-purple-900/30 disabled:text-white/30 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-widest rounded-lg transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(147,51,234,0.3)] cursor-pointer border-none"
                >
                  {crewAlertSending ? (
                    <><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Sending Broadcast...</>
                  ) : (
                    <> Send Broadcast</>
                  )}
                </button>
              </div>
            </div>

            {/* 2-Column Live Dispatch Preview (SMS Text Message + Email Template) */}
            {(sendSmsAlert || sendEmailAlert) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-[fadeIn_0.2s_ease-out] pt-4 border-t border-white/5">
                {/* Left Column: SMS Text Message Preview (50% Width) */}
                <div className="bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--text-color)] p-5 space-y-4 shadow-sm flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
                      <span className="text-xs font-black uppercase tracking-widest text-[var(--text-color)]">SMS TEXT MESSAGE PREVIEW</span>
                      <span className="text-xs text-[var(--muted-text)] font-mono">Plain SMS Text</span>
                    </div>

                    <div className="   border border-[var(--border-color)] pr-4 pb-4 pt-4 text-xs text-[var(--text-color)] leading-relaxed font-sans whitespace-pre-wrap min-h-[160px]">
                      {crewAlertMsg ? crewAlertMsg : <span className="text-[var(--muted-text)] opacity-60 italic">(No message text entered yet...)</span>}
                    </div>
                  </div>

                  <div className="text-xs text-white/50 font-mono text-center pt-1">
                    Recipient phones will receive raw text alert instantly
                  </div>
                </div>

                {/* Right Column: Email Template Preview (50% Width) */}
                <div className="bg-[#0c0c10] border border-purple-500/20 p-5 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase tracking-widest text-white"> EMAIL DISPATCH PREVIEW</span>
                      <span className="text-[10px] bg-purple-950/90 text-purple-200 border border-purple-500/60 px-3 py-1 rounded-full font-extrabold shadow-sm tracking-wide">Full HTML Template</span>
                    </div>
                    <span className="text-xs text-white/50 font-mono truncate max-w-[180px]">Subject: {smsEmailSubject || '(No subject)'}</span>
                  </div>

                  <div className="w-full h-[380px] overflow-hidden border border-purple-500/20 shadow-inner bg-[#050508]">
                    <iframe
                      srcDoc={emailHtmlPreview}
                      title="Crew Email Template Live Preview"
                      className="w-full h-full border-none"
                      sandbox="allow-same-origin"
                    />
                  </div>
                </div>
              </div>
            )}



            {/* Preset Roles Manager Modal */}
            {isManageRolesModalOpen && (
              <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-[9999] animate-[fadeIn_0.2s_ease-out] p-4">
                <div
                  className="bg-[#0c0c0e] border border-white/10 p-6 max-w-md w-full space-y-4 relative animate-[scaleIn_0.2s_ease-out]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h3 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
                      Manage Preset Roles
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsManageRolesModalOpen(false)}
                      className="text-white/40 hover:text-white transition-colors border-none bg-transparent cursor-pointer text-xs"
                    >
                      Close
                    </button>
                  </div>

                  {/* Add New Preset Role */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="admin-new-preset-role" className="text-[0.6rem] font-bold uppercase tracking-widest text-white/40">Add New Preset Role</label>
                    <div className="flex gap-2">
                      <input
                        id="admin-new-preset-role"
                        type="text"
                        value={newPresetRoleInput}
                        onChange={(e) => setNewPresetRoleInput(e.target.value)}
                        placeholder="e.g. LIGHTING DESIGNER"
                        className="flex-1   border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500/50"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleAddPresetRole(newPresetRoleInput);
                            setNewPresetRoleInput('');
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          handleAddPresetRole(newPresetRoleInput);
                          setNewPresetRoleInput('');
                        }}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer border-none"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Preset Roles List */}
                  <div className="space-y-1.5">
                    <span className="text-[0.6rem] font-bold uppercase tracking-widest text-white/40 block">Current Preset Roles ({presetRoles.length})</span>
                    <div className="max-h-[220px] overflow-y-auto custom-scrollbar border border-white/10 bg-black/40 p-2 space-y-1.5">
                      {presetRoles.length === 0 ? (
                        <div className="text-xs text-white/30 italic text-center py-4">No preset roles defined.</div>
                      ) : (
                        presetRoles.map((role) => (
                          <div key={role} className="flex items-center justify-between gap-3 px-3 py-2 bg-white/[0.02] border border-white/5 rounded-lg hover:bg-white/[0.04]">
                            <span className="text-xs font-bold text-white/90">{role}</span>
                            <button
                              type="button"
                              onClick={() => handleDeletePresetRole(role)}
                              className="p-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer border-none flex items-center justify-center"
                              title="Delete Preset"
                            >
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div >
      </section >
    );
  };

  const renderBandSms = () => {
    const allBandCombined = getBandRecipientsCombined();

    const bandShowTarget = bandSmsSelectedShowDate ? tourDates.find((s: any) => s.date === bandSmsSelectedShowDate) : null;
    const bandShowVenueTarget = bandShowTarget ? (bandShowTarget.venue || bandShowTarget.venue_name) : undefined;
    const bandShowTimeTarget = bandShowTarget ? (bandShowTarget.time || '8:00pm') : undefined;

    const selectedBandPhonesSetForPreview = new Set(selectedBandPhones);
    const checkedBandRecipientsList = allBandCombined.flatMap(c => {
      if (!selectedBandPhonesSetForPreview.has(normalizePhoneNumber(c.phone))) return [];
      return [{
        name: c.name,
        phone: c.phone || '(555) 234-5678',
        email: c.email || `${c.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@7thheavenband.com`,
        avatar: c.avatar || '',
        role: c.role || 'BAND MEMBER',
        hours: '5:00 PM - 10:00 PM'
      }];
    });

    const bandEmailHtmlPreview = crewSmsDispatchedAlert({
      message: bandAlertMsg || 'Hey band, reminder for our upcoming show. Load-in is 2 hours before.',
      showDate: bandSmsSelectedShowDate || undefined,
      showVenue: bandShowVenueTarget,
      showTime: bandShowTimeTarget,
      recipients: checkedBandRecipientsList.length > 0 ? checkedBandRecipientsList : undefined
    });

    return (
      <section id="section-bandsms" className="overflow-hidden">
        <div role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleSection('bandsms'); } }} onClick={() => toggleSection('bandsms')} className="py-6 pr-6 pl-0 flex items-center justify-between cursor-pointer select-none">
          <div className="flex items-center gap-2">
            <div className="drag-handle cursor-grab active:cursor-grabbing py-1.5 pr-1.5 pl-0 hover:bg-white/5 rounded text-white/20 hover:text-white/50 transition-colors shrink-0 mr-1" title="Drag to reorder section" onClick={(e) => e.stopPropagation()}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="9" cy="19" r="1" /><circle cx="15" cy="5" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="19" r="1" /></svg>
            </div>
            <h3 className="cursor-pointer text-lg font-bold tracking-tight flex items-center gap-2 text-white">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
              Band Member SMS Text
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <div className={"w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center transition-transform duration-300 " + (isSectionOpen('bandsms') ? 'rotate-0' : '-rotate-90')}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/40"><path d="M2 4l4 4 4-4" /></svg>
            </div>
          </div>
        </div >

        {renderInfoBanner('bandsms', 'Band Member SMS Text', 'Broadcast instant SMS alerts or show notices directly to the band members.')}

        < div style={{ display: isSectionOpen('bandsms') ? undefined : 'none' }}>
          <div className="py-6 pr-0 pl-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Band List (Choose Recipients) */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-[0.65rem] font-bold uppercase tracking-widest text-white/40 block">Choose Recipients</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const allKeys = allBandCombined.flatMap(b => { const k = normalizePhoneNumber(b.phone) || b.id || b.name; return k ? [k] : []; });
                        setSelectedBandPhones(allKeys);
                      }}
                      className="px-2 py-0.5 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 text-[10px] font-bold rounded transition-colors cursor-pointer"
                    >
                      Select All ({allBandCombined.length})
                    </button>
                    {selectedBandPhones.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedBandPhones([])}
                        className="px-2 py-0.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-[10px] font-bold rounded transition-colors cursor-pointer"
                      >
                        Clear All
                      </button>
                    )}
                    <span className="text-[0.6rem] text-white/30 font-mono">
                      {selectedBandPhones.length} selected
                    </span>
                  </div>
                </div>

                <div className="bg-transparent border-none p-0 py-2 max-h-[460px] overflow-y-auto custom-scrollbar">
                  <div className="flex flex-col gap-1">
                    {(() => {
                      const selectedBandPhonesSet = new Set(selectedBandPhones);
                      return allBandCombined
                        .slice()
                        .sort((a, b) => {
                          const normA = normalizePhoneNumber(a.phone) || a.id;
                          const normB = normalizePhoneNumber(b.phone) || b.id;
                          const aChecked = selectedBandPhonesSet.has(normA) || selectedBandPhonesSet.has(a.id) || selectedBandPhonesSet.has(a.name);
                          const bChecked = selectedBandPhonesSet.has(normB) || selectedBandPhonesSet.has(b.id) || selectedBandPhonesSet.has(b.name);
                          if (aChecked && !bChecked) return -1;
                          if (!aChecked && bChecked) return 1;
                          return a.name.localeCompare(b.name);
                        })
                        .map((r) => {
                          const normPhone = normalizePhoneNumber(r.phone);
                          const isChecked = (normPhone && selectedBandPhonesSet.has(normPhone)) || selectedBandPhonesSet.has(r.id) || selectedBandPhonesSet.has(r.name);
                          const toggleSelection = () => {
                            const normKey = normPhone || r.id || r.name;
                            setSelectedBandPhones(prev => {
                              const prevSet = new Set(prev);
                              const isCurrentlySelected = (normPhone ? prevSet.has(normPhone) : false) || prevSet.has(r.id) || prevSet.has(r.name);
                              if (isCurrentlySelected) {
                                return prev.filter(p => p !== normPhone && p !== r.id && p !== r.name);
                              } else {
                                return [...prev, normKey];
                              }
                            });
                          };

                          return (
                            <div
                              key={r.id}
                              role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleSelection(); } }}
                              onClick={toggleSelection}
                              className={`flex items-center justify-between gap-2.5 pr-2.5 pl-0 py-3 border-b border-white/25 transition-colors duration-200 cursor-pointer select-none min-h-[48px] ${isChecked
                                ? 'bg-purple-500/15 text-white'
                                : 'hover:bg-white/[0.04] text-white/80'
                                }`}
                              title={`Click to toggle selection for ${r.name}\n ${r.phone || 'No phone'} \n ${r.email || 'No email'}`}
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                {/* Custom Styled Checkbox */}
                                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors shrink-0 ${isChecked
                                  ? 'bg-purple-600 border-purple-400 text-white shadow-md scale-105'
                                  : 'bg-black/40 border-white/30 group-hover:border-white/60'
                                  }`}>
                                  {isChecked && (
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                  )}
                                </div>

                                {/* Avatar */}
                                {(() => {
                                  const avatarSrc = resolveMemberAvatar(r.name, r.avatar);
                                  return avatarSrc ? (
                                    <img
                                      src={avatarSrc}
                                      alt={r.name}
                                      className="w-10 h-10 rounded-full object-cover shrink-0 border-2 border-white/20 shadow-md"
                                      onError={(e) => {
                                        const fallback = resolveMemberAvatar(r.name, '');
                                        if (fallback && !e.currentTarget.src.endsWith(fallback)) {
                                          e.currentTarget.src = fallback;
                                        }
                                      }}
                                    />
                                  ) : (
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 border-2 border-white/20 shadow-md flex items-center justify-center text-xs font-black uppercase text-black shrink-0">
                                      {r.name.slice(0, 2)}
                                    </div>
                                  );
                                })()}

                                {/* Name */}
                                <span className="text-sm font-extrabold truncate leading-none text-white">{r.name}</span>
                              </div>

                              {/* Role badge */}
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="inline-block text-[9px] font-black uppercase tracking-wider text-purple-300 bg-purple-500/15 border border-purple-500/30 px-2.5 py-1 rounded-md leading-none shrink-0">
                                  {r.role}
                                </span>
                              </div>
                            </div>
                          );
                        });
                    })()}
                  </div>
                </div>
              </div>

              {/* Right Column: Alert Broadcast Form */}
              <div className="space-y-5">
                <div className="bg-[var(--color-bg-card)]/40 border border-white/5 py-4 pl-4 pr-0 space-y-4">
                  <div>
                    <label htmlFor="admin-band-sms-show-select" className="text-[0.65rem] font-bold text-white/40 uppercase tracking-wider block mb-2">Select Upcoming Show</label>
                    <Dropdown
                      id="admin-band-sms-show-select"
                      fullWidth={true}
                      placeholder="-- Choose target show --"
                      selected={bandSmsSelectedShowDate}
                      options={[
                        { label: "-- Choose target show --", value: "" },
                        ...tourDates.map((s: any) => ({
                          label: `${s.date} - ${s.venue || s.venue_name}`,
                          value: s.date,
                        })),
                      ]}
                      onChange={(val) => selectShowForBandSms(val)}
                      className="w-full"
                    />
                  </div>

                  {bandSmsSelectedShowDate && (
                    <div className="flex items-center justify-between bg-purple-500/10 border border-purple-500/25 rounded-lg px-3 py-2 text-[var(--font-size-3xs)] text-purple-300 animate-[fadeIn_0.2s_ease-out]">
                      <div className="flex items-center gap-1.5">
                        <span></span>
                        <span>Targeting show: <strong>{tourDates.find((s: any) => s.date === bandSmsSelectedShowDate)?.venue || 'Selected show'}</strong></span>
                      </div>
                      <button
                        type="button"
                        aria-label="Clear selected show"
                        onClick={() => selectShowForBandSms('')}
                        className=" text-[var(--color-accent)] hover:text-purple-300 font-bold border-none bg-transparent cursor-pointer text-xs"
                      >

                      </button>
                    </div>
                  )}

                  {/* SMS / Email Option Toggle Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div
                      role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSendBandSmsAlert(prev => !prev); } }}
                      onClick={() => setSendBandSmsAlert(prev => !prev)}
                      className={`p-5 md:p-6 rounded-xl border-none transition-colors cursor-pointer select-none flex flex-col gap-2 ${sendBandSmsAlert
                        ? 'bg-purple-600/10 text-white shadow-[0_0_15px_rgba(147,51,234,0.1)]'
                        : 'bg-white/[0.01] text-white/40'
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 transition-colors ${sendBandSmsAlert ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(147,51,234,0.4)]' : 'bg-white/10'
                          }`}>
                          {sendBandSmsAlert && (
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4.5"><polyline points="20 6 9 17 4 12" /></svg>
                          )}
                        </div>
                        <span className="text-xs font-black uppercase tracking-wider text-purple-300">SMS TEXTS</span>
                      </div>
                      <span className="text-[10px] text-white/40 leading-normal">Sends raw text alerts to active mobile numbers</span>
                    </div>

                    <div
                      role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSendBandEmailAlert(prev => !prev); } }}
                      onClick={() => setSendBandEmailAlert(prev => !prev)}
                      className={`p-5 md:p-6 rounded-xl border-none transition-colors cursor-pointer select-none flex flex-col gap-2 ${sendBandEmailAlert
                        ? 'bg-purple-600/10 text-white shadow-[0_0_15px_rgba(147,51,234,0.1)]'
                        : 'bg-white/[0.01] text-white/40'
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 transition-colors ${sendBandEmailAlert ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(147,51,234,0.4)]' : 'bg-white/10'
                          }`}>
                          {sendBandEmailAlert && (
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4.5"><polyline points="20 6 9 17 4 12" /></svg>
                          )}
                        </div>
                        <span className="text-xs font-black uppercase tracking-wider text-purple-300">EMAIL ALERTS</span>
                      </div>
                      <span className="text-[10px] text-white/40 leading-normal">Sends styled HTML alerts to registered emails</span>
                    </div>
                  </div>

                  {/* Email Subject Line (Conditional) */}
                  {sendBandEmailAlert && (
                    <div className="flex flex-col gap-1 animate-[fadeIn_0.2s_ease-out]">
                      <label htmlFor="admin-band-email-subject" className="text-[0.6rem] font-bold uppercase tracking-widest text-slate-800 block">Email Subject Line</label>
                      <input
                        id="admin-band-email-subject"
                        type="text"
                        value={bandEmailSubject}
                        onChange={(e) => setBandEmailSubject(e.target.value)}
                        placeholder="e.g. Band Schedule Update"
                        style={{ backgroundColor: '#ffffff', color: '#000000' }}
                        className="bg-white! text-black! border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold placeholder-slate-400 focus:outline-none focus:border-purple-500 shadow-xs"
                      />
                    </div>
                  )}

                  {/* Message Form */}
                  <div className="space-y-2">
                    <label htmlFor="admin-band-broadcast-msg" className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-800 block">Broadcast message</label>
                    <textarea
                      id="admin-band-broadcast-msg"
                      value={bandAlertMsg}
                      onChange={(e) => setBandAlertMsg(e.target.value)}
                      placeholder="Write message to send..."
                      rows={5}
                      style={{ backgroundColor: '#ffffff', color: '#000000' }}
                      className="w-full bg-white! text-black! border border-slate-300 px-3 py-2 text-xs font-medium placeholder-slate-400 focus:outline-none focus:border-purple-500 resize-none leading-relaxed shadow-xs"
                    />
                  </div>

                  {/* Feedback Logs */}
                  {bandAlertResult && (
                    <div className={`p-3 border  text-xs flex flex-col gap-1 ${bandAlertResult.success
                      ? 'bg-emerald-500/10  border-[var(--color-accent)]/30 text-[var(--color-accent)]'
                      : 'bg-red-500/10 border-red-500/20 text-red-400'
                      }`}>
                      <span className="font-bold flex items-center gap-1">
                        {bandAlertResult.success ? ' Dispatch Successful' : ' Dispatch Failed'}
                      </span>
                      <span>
                        {bandAlertResult.success
                          ? `Alert successfully broadcasted to ${bandAlertResult.count} recipient(s).`
                          : bandAlertResult.error}
                      </span>
                    </div>
                  )}

                  {/* Send Button */}
                  <div>
                    <button
                      type="button"
                      onClick={handleSendBandAlert}
                      disabled={bandAlertSending || !bandAlertMsg.trim() || selectedBandPhones.length === 0}
                      className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-20 disabled:bg-purple-900/30 disabled:text-white/30 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-widest rounded-lg transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(147,51,234,0.3)] cursor-pointer border-none"
                    >
                      {bandAlertSending ? (
                        <><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Sending Broadcast...</>
                      ) : (
                        <> Send Band Broadcast</>
                      )}
                    </button>
                  </div>
                </div>

                {/* Visual Recipients List */}
                {(() => {
                  const selectedBandPhonesSet = new Set(selectedBandPhones);
                  const checkedRecipients = allBandCombined.filter(c => selectedBandPhonesSet.has(normalizePhoneNumber(c.phone)));
                  if (checkedRecipients.length === 0) return null;
                  return (
                    <div className="space-y-2">
                      <span className="text-[0.65rem] font-bold text-white/40 uppercase tracking-wider block">
                        Recipients ({checkedRecipients.length})
                      </span>
                      <div className="flex flex-col gap-2 bg-black/20 border border-white/5 p-3 max-h-[220px] overflow-y-auto custom-scrollbar">
                        {checkedRecipients.map(r => {
                          const dayShifts = schedulesByDateAndCrew[smsSelectedShowDate || '']?.[r.id] || [];
                          const timeFrameStr = dayShifts.length > 0
                            ? dayShifts.map(s => formatTimeFrame(s.startHour, s.endHour)).join(', ')
                            : ((r as any).time || '5:00 PM - 10:00 PM');
                          const phoneDisplay = r.phone || '(555) 234-5678';
                          const emailDisplay = r.email || `${r.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@7thheavenband.com`;

                          return (
                            <div key={r.id} className="flex flex-col gap-1.5 p-2.5 bg-white/[0.02] border border-white/5 rounded-lg text-xs">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5 truncate">
                                  {r.avatar ? (
                                    <img src={r.avatar} alt={r.name} className="w-6.5 h-6.5 rounded-full object-cover border border-white/10 shrink-0" />
                                  ) : (
                                    <div className="w-6.5 h-6.5 rounded-full bg-[var(--color-accent)]/20 border border-[var(--color-accent)]/30 flex items-center justify-center text-[var(--font-size-4xs)] font-black uppercase  text-[var(--color-accent)] shrink-0">
                                      {r.name.slice(0, 2)}
                                    </div>
                                  )}
                                  <div className="truncate">
                                    <span className="font-bold text-white block leading-none">{r.name}</span>
                                    <span className="text-[var(--font-size-4xs)]  text-[var(--color-accent)]/80 font-semibold uppercase tracking-wider font-mono block mt-1">{r.role || 'BAND MEMBER'}</span>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  aria-label="Remove recipient"
                                  onClick={() => setSelectedBandPhones(prev => prev.filter(p => p !== normalizePhoneNumber(r.phone)))}
                                  className="text-white/30 hover:text-rose-400 transition-colors border-none bg-transparent cursor-pointer p-1 text-[var(--font-size-2xs)] font-bold shrink-0"
                                >

                                </button>
                              </div>

                              {/* Time Frame, Phone & Email Details */}
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1.5 border-t border-white/5 text-[9.5px] text-white/50 font-mono">
                                <div className="flex items-center gap-1 text-cyan-300/80">
                                  <span>⏰</span>
                                  <span>{timeFrameStr}</span>
                                </div>
                                <div className="flex items-center gap-1 text-emerald-300/80">
                                  <span></span>
                                  <span>{phoneDisplay}</span>
                                </div>
                                <div className="flex items-center gap-1 text-purple-300/80 truncate max-w-[200px]">
                                  <span></span>
                                  <span className="truncate">{emailDisplay}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

              </div>
            </div>

            {/* FULL WIDTH 50/50 LIVE DISPATCH PREVIEW SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-[fadeIn_0.2s_ease-out] pt-2 border-t border-white/5">
              {/* Left Column: SMS Text Message Preview (50% Width) */}
              <div className="bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--text-color)] pl-5 pr-5 pb-5 space-y-4 shadow-sm flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
                    <span className="text-xs font-black uppercase tracking-widest text-[var(--text-color)]">SMS TEXT MESSAGE PREVIEW</span>
                    <span className="text-xs text-[var(--muted-text)] font-mono">Plain SMS Text</span>
                  </div>

                  <div className="   border border-[var(--border-color)] p-4 text-xs text-[var(--text-color)] leading-relaxed font-sans whitespace-pre-wrap min-h-[120px]">
                    {bandAlertMsg ? bandAlertMsg : <span className="text-[var(--muted-text)] opacity-60 italic">(No message text entered yet...)</span>}
                  </div>
                </div>

                <div className="text-xs text-white/50 font-mono text-center pt-1">
                  Recipient phone will receive raw text alert instantly
                </div>
              </div>

              {/* Right Column: Email Template Preview (50% Width) */}
              <div className="bg-[#0c0c10] border border-purple-500/20 p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-widest text-white"> EMAIL DISPATCH PREVIEW</span>
                    <span className="text-[10px] bg-purple-950/90 text-purple-200 border border-purple-500/60 px-3 py-1 rounded-full font-extrabold shadow-sm tracking-wide">Full HTML Template</span>
                  </div>
                  <span className="text-xs text-white/50 font-mono">Subject: {bandEmailSubject || '(No subject)'}</span>
                </div>

                <div className="w-full h-[380px] overflow-hidden border border-purple-500/20 shadow-inner bg-[#050508]">
                  <iframe
                    srcDoc={bandEmailHtmlPreview}
                    title="Band Email Template Live Preview"
                    className="w-full h-full border-none"
                    sandbox="allow-same-origin"
                  />
                </div>
              </div>
            </div>
          </div>
        </div >
      </section >
    );
  };

  const renderNewsletter = () => (
    <section className="overflow-hidden">
      <div role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleSection('newsletter'); } }} onClick={() => toggleSection('newsletter')} className="py-6 pr-6 pl-0 flex items-center justify-between cursor-pointer select-none">
        <div className="flex items-center gap-2">
          <div className="drag-handle cursor-grab active:cursor-grabbing py-1.5 pr-1.5 pl-0 hover:bg-white/5 rounded text-white/20 hover:text-white/50 transition-colors shrink-0 mr-1" title="Drag to reorder section" onClick={(e) => e.stopPropagation()}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="9" cy="19" r="1" /><circle cx="15" cy="5" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="19" r="1" /></svg>
          </div>
          <h3 className="cursor-pointer text-lg font-bold tracking-tight flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
            Newsletter Blast
            {renderInfoToggle('newsletter')}
          </h3>
        </div>
        <div className="flex items-center gap-3">

          <div className={"w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center transition-transform duration-300 " + (isSectionOpen('newsletter') ? 'rotate-0' : '-rotate-90')}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40"><path d="M2 4l4 4 4-4" /></svg>
          </div>
        </div>
      </div >
      {renderInfoBanner('newsletter', 'Newsletter Blast', 'Compose and broadcast marketing campaigns, newsletter updates, and band announcements to all email subscribers.')}
      < div style={{ display: isSectionOpen('newsletter') ? undefined : 'none' }}>
        <div className="py-6 pr-6 pl-0">
          <div className="space-y-4">
            <div>
              <label htmlFor="admin-newsletter-blast-subject" className="text-[0.6rem] font-bold uppercase tracking-widest text-white/40 mb-2 block">Subject Line</label>
              <input
                id="admin-newsletter-blast-subject"
                type="text"
                value={blastSubject}
                onChange={e => setBlastSubject(e.target.value)}
                placeholder="e.g.  New Show Announced — Chicago June 15th!"
                className="w-full bg-transparent border border-white/15 rounded-lg px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[var(--color-accent)]/50 transition-colors"
              />
            </div>
            <div>
              <label htmlFor="admin-newsletter-blast-body" className="text-[0.6rem] font-bold uppercase tracking-widest text-white/40 mb-2 block">Message Body</label>
              <textarea
                id="admin-newsletter-blast-body"
                value={blastBody}
                onChange={e => setBlastBody(e.target.value)}
                placeholder="Write your announcement here..."
                rows={6}
                className="w-full bg-transparent border border-white/15 rounded-lg px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[var(--color-accent)]/50 transition-colors resize-none"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                {blastResult && (
                  <p className={`text-sm font-bold ${blastResult.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {blastResult.success ? ` Sent to ${blastResult.sent} fans` : ` ${blastResult.error}`}
                    {blastResult.failed > 0 && <span className="text-rose-400 ml-2">({blastResult.failed} failed)</span>}
                  </p>
                )}
              </div>
              <button
                disabled={blastSending || !blastSubject.trim() || !blastBody.trim()}
                onClick={async () => {
                  if (blastSendingRef.current) return;
                  if (!confirm(`Send this email to ALL ${fanDataRef.current?.total || 0} fans?`)) return;
                  blastSendingRef.current = true;
                  setBlastSending(true);
                  setBlastResult(null);
                  try {
                    const res = await fetch('/api/admin/newsletter', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ subject: blastSubject, body: blastBody }),
                    });
                    if (res.ok) {
                      const data = await res.json();
                      setBlastResult(data);
                      if (data.success) { setBlastSubject(''); setBlastBody(''); }
                    }
                  } catch (err: any) {
                    setBlastResult({ error: err.message });
                  }
                  blastSendingRef.current = false;
                  setBlastSending(false);
                }}
                className="px-6 py-3 bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold text-sm uppercase tracking-widest rounded-lg transition-colors flex items-center gap-2 shadow-[0_0_20px_rgba(255,10,61,0.3)]"
              >
                {blastSending ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</>
                ) : (
                  <> Send Blast</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div >
    </section >
  );

  const renderEmailFlow = () => (
    <section className="overflow-hidden">
      <div role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleSection('emailflow'); } }} onClick={() => toggleSection('emailflow')} className="py-6 pr-6 pl-0 flex items-center justify-between cursor-pointer select-none">
        <div className="flex items-center gap-2">
          <div className="drag-handle cursor-grab active:cursor-grabbing py-1.5 pr-1.5 pl-0 hover:bg-white/5 rounded text-white/20 hover:text-white/50 transition-colors shrink-0 mr-1" title="Drag to reorder section" onClick={(e) => e.stopPropagation()}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="9" cy="19" r="1" /><circle cx="15" cy="5" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="19" r="1" /></svg>
          </div>
          <h3 className="cursor-pointer text-lg font-bold tracking-tight flex items-center gap-2 shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            Email Template Flows
            {renderInfoToggle('emailflow')}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/sitemap/flowchart" className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/40 text-purple-200 border border-purple-500/30 text-[0.6rem] font-bold uppercase tracking-widest rounded transition-colors flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            Fullscreen Flowchart ↗
          </Link>
          <div className={"w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center transition-transform duration-300 " + (isSectionOpen('emailflow') ? 'rotate-0' : '-rotate-90')}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40"><path d="M2 4l4 4 4-4" /></svg>
          </div>
        </div>
      </div >
      {renderInfoBanner('emailflow', 'Email Template Flows', 'Interactive catalog of the 25 email templates dispatched by actions taken on the Admin Dashboard.')}

      < div style={{ display: isSectionOpen('emailflow') ? undefined : 'none' }}>
        <div className="py-6 pr-6 pl-0">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {/* Booking Flows */}
            <div className="bg-black/30 border border-emerald-500/10 p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-[var(--color-accent)] font-black text-xs uppercase tracking-wider mb-3">
                  <span></span> Booking System
                </div>
                <div className="space-y-3">
                  {[
                    { name: 'Booking Confirmation', trigger: 'Sent to planner when they submit booking request form.' },
                    { name: 'Booking Admin Alert', trigger: 'Sent to 7th Heaven admins to review new booking details.' },
                    { name: 'Booking Status Update', trigger: 'Sent to planner when admin approves/declines booking.' },
                    { name: 'Booking Cancelled', trigger: 'Sent when planner/admin cancels booking reservation.' }
                  ].map((email) => (
                    <div key={email.name} className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-2.5 hover:border-emerald-500/30 transition-colors">
                      <h4 className="text-[var(--font-size-2xs)] font-extrabold text-emerald-200">{email.name}</h4>
                      <p className="text-[var(--font-size-4xs)] text-white/40 mt-1 leading-normal">{email.trigger}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Crew Flows */}
            <div className="bg-black/30 border border-purple-500/15 p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-purple-300 font-black text-xs uppercase tracking-wider mb-3">
                  <span></span> Crew Management
                </div>
                <div className="space-y-3">
                  {[
                    { name: 'Welcome — Crew', trigger: 'Sent when admin registers new crew account with temporary password.' },
                    { name: 'Schedule Change Alert', trigger: 'Sent when admin adds, updates, or deletes crew schedule shifts.' },
                    { name: 'Crew Alert (Email + SMS)', trigger: 'Sent when admin broadcasts text broadcast via Crew SMS panel.' },
                    { name: 'Crew SMS Dispatched', trigger: 'Sent to admin showing confirmation and recipient table.' },
                    { name: 'Crew Work Hours Summary', trigger: 'Sent automatically when crew checks out of a completed shift.' }
                  ].map((email) => (
                    <div key={email.name} className="bg-purple-500/10 border border-purple-500/15 rounded-lg p-2.5 hover:border-purple-500/30 transition-colors">
                      <h4 className="text-[var(--font-size-2xs)] font-extrabold text-purple-200">{email.name}</h4>
                      <p className="text-[var(--font-size-4xs)] text-white/40 mt-1 leading-normal">{email.trigger}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Fan Flows */}
            <div className="bg-black/30 border border-pink-500/10 p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-pink-400 font-black text-xs uppercase tracking-wider mb-3">
                  <span></span> Fan Engagement
                </div>
                <div className="space-y-3">
                  {[
                    { name: 'Welcome — Fan', trigger: 'Sent to fan when they sign up for interactive website features.' },
                    { name: 'Raffle Winner Alert', trigger: 'Sent to raffle winner chosen from live show audience.' },
                    { name: 'Raffle Entry Confirmed', trigger: 'Sent to fan when they join live stream drawing.' },
                    { name: 'Raffle consolation Alert', trigger: 'Sent to non-winners saying thank you for trying.' },
                    { name: 'Fan Upload Approved', trigger: 'Sent when admin approves fan-submitted live gallery photo.' },
                    { name: 'Fan Upload Rejected', trigger: 'Sent when admin rejects image due to policy guidelines.' },
                    { name: 'Fan Invitation', trigger: 'Sent when admin sends invite via Bulk Invites system.' }
                  ].map((email) => (
                    <div key={email.name} className="bg-pink-500/5 border border-pink-500/10 rounded-lg p-2.5 hover:border-pink-500/30 transition-colors">
                      <h4 className="text-[var(--font-size-2xs)] font-extrabold text-pink-200">{email.name}</h4>
                      <p className="text-[var(--font-size-4xs)] text-white/40 mt-1 leading-normal">{email.trigger}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Cruise Flows */}
            <div className="bg-black/30 border border-cyan-500/10 p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-[#c27aff] font-black text-xs uppercase tracking-wider mb-3">
                  <span></span> Cruise System
                </div>
                <div className="space-y-3">
                  {[
                    { name: 'Cruise Signup Confirmed', trigger: 'Sent to fan when signing up to cruise newsletter waitlist.' },
                    { name: 'Cruise Community Welcome', trigger: 'Sent when cruise admin approves user reservation.' },
                    { name: 'Cruise Cancellation', trigger: 'Sent when reservation is cancelled by user/admin.' },
                    { name: 'Cruise Community Blast', trigger: 'Sent when cruise admin broadcasts to cruise page chat group.' }
                  ].map((email) => (
                    <div key={email.name} className="bg-cyan-500/5 border border-cyan-500/10 rounded-lg p-2.5 hover:border-cyan-500/30 transition-colors">
                      <h4 className="text-[var(--font-size-2xs)] font-extrabold text-cyan-200">{email.name}</h4>
                      <p className="text-[var(--font-size-4xs)] text-white/40 mt-1 leading-normal">{email.trigger}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Newsletter & Other */}
            <div className="bg-black/30 border border-purple-500/10 p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2  text-[var(--color-accent)] font-black text-xs uppercase tracking-wider mb-3">
                  <span></span> Newsletter & Account
                </div>
                <div className="space-y-3">
                  {[
                    { name: 'Newsletter Blast', trigger: 'Sent when admin broadcasts a new update block via Newsletter panel.' },
                    { name: 'Flash Merch — Table Pickup', trigger: 'Sent to buyer notifying them to collect merch at table.' },
                    { name: 'Flash Merch — Shipping', trigger: 'Sent when merch has been shipped to customer address.' },
                    { name: 'New Account Alert — Admin', trigger: 'Sent to super-admin when new admin logs in first time.' },
                    { name: 'Welcome — Planner', trigger: 'Sent to corporate planner on registration.' },
                    { name: 'Welcome — Admin', trigger: 'Sent when new system admin account created.' }
                  ].map((email) => (
                    <div key={email.name} className="bg-purple-500/5 border border-purple-500/10 rounded-lg p-2.5 hover:border-purple-500/30 transition-colors">
                      <h4 className="text-[var(--font-size-2xs)] font-extrabold text-purple-200">{email.name}</h4>
                      <p className="text-[var(--font-size-4xs)] text-white/40 mt-1 leading-normal">{email.trigger}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div >
    </section >
  );

  const renderRegistry = () => (
    <section className="bg-transparent overflow-hidden">
      <div className="py-6 pr-6 pl-0 border-b border-black/10 dark:border-white/10 flex items-center justify-between select-none transition-colors">
        <div className="flex items-center gap-2">
          <div className="drag-handle cursor-grab active:cursor-grabbing py-1.5 pr-1.5 pl-0 hover:bg-white/5 rounded text-white/20 hover:text-white/50 transition-colors shrink-0 mr-1" title="Drag to reorder section" onClick={(e) => e.stopPropagation()}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="9" cy="19" r="1" /><circle cx="15" cy="5" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="19" r="1" /></svg>
          </div>
          <h3 className="cursor-pointer text-lg font-bold tracking-tight flex items-center gap-2 shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            Community Registry
            {renderInfoToggle('registry')}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white/15 p-1 overflow-x-auto shrink-0 w-full sm:w-auto" onClick={(e) => e.stopPropagation()}>
            {['All', 'fan', 'crew', 'admin'].map(role => (
              <button
                key={role}
                onClick={() => setFilterRole(role as any)}
                className={`px-3 py-1.5 text-[0.65rem] font-black uppercase tracking-widest rounded-lg transition-colors whitespace-nowrap cursor-pointer ${filterRole === role ? 'bg-white text-black shadow-sm font-black' : 'text-white/80 hover:text-white hover:bg-white/10'}`}
              >
                {role}
              </button>
            ))}
          </div>
          <div className={"w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center transition-transform duration-300 " + (isSectionOpen('registry') ? 'rotate-0' : '-rotate-90')}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40"><path d="M2 4l4 4 4-4" /></svg>
          </div>
        </div>
      </div>
      {renderInfoBanner('registry', 'Community Registry', 'Search and manage all user accounts registered in the database, view roles, and configure site settings.')}
      <div style={{ display: isSectionOpen('registry') ? undefined : 'none' }}>
        <div className="p-0 max-h-[400px] overflow-y-auto custom-scrollbar" data-lenis-prevent="true">
          {isLoading ? (
            <div className="p-12 text-center text-white/30 font-mono text-xs animate-pulse">Pulling registry data...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-white/30 font-mono text-xs">No users found matching this filter.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/5 dark:bg-white/[0.02] text-slate-500 dark:text-white/30 text-[0.6rem] uppercase tracking-widest border-b border-black/10 dark:border-white/10">
                  <th className="p-4 font-bold border-b border-black/10 dark:border-white/10">User</th>
                  <th className="p-4 font-bold border-b border-black/10 dark:border-white/10">Role</th>
                  <th className="p-4 font-bold border-b border-black/10 dark:border-white/10">Status</th>
                  <th className="p-4 font-bold border-b border-black/10 dark:border-white/10 text-right">Action</th>
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
                      <tr className="border-b border-black/10 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="p-4 font-bold text-sm truncate max-w-[150px]">{user.name}</td>
                        <td className="p-4 text-sm">
                          <span className={`px-2 py-0.5 rounded text-[0.6rem] font-bold uppercase tracking-widest ${user.role === 'crew' || user.role === 'admin' ? 'bg-[var(--color-accent)]/20  text-[var(--color-accent)] border border-[var(--color-accent)]/30' : 'bg-white/5 text-white/60 border border-white/10'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${user.status === 'streaming' ? 'bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]'
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
                                className="px-3 py-2 bg-transparent border border-white/10 text-white/40 hover:bg-white/5 hover:text-white text-[0.6rem] font-bold uppercase tracking-widest rounded transition-colors"
                              >
                                {viewingUser === user.id ? 'Hide' : 'View'}
                              </button>
                              <button
                                onClick={() => banUser(user.id, user.name)}
                                className="px-3 py-2 bg-transparent border border-red-500/30 text-red-500 hover:bg-red-500 hover:border-red-500 hover:text-white text-[0.6rem] font-bold uppercase tracking-widest rounded transition-colors"
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
                                <span className="text-purple-300 font-mono">
                                  {acct?.password || (user.role === 'crew' ? '********' : 'N/A')}
                                </span>
                                {user.role === 'crew' && (
                                  <button
                                    onClick={async () => {
                                      const res = await adminResetPassword(user.id, user.email);
                                      if (res.success) {
                                        const accounts = JSON.parse(localStorage.getItem('7h_accounts_v1') || localStorage.getItem('7h_accounts') || '{}');
                                        accounts[user.email.toLowerCase()] = {
                                          ...accounts[user.email.toLowerCase()],
                                          id: user.id,
                                          name: user.name,
                                          email: user.email.toLowerCase(),
                                          password: res.password,
                                          role: 'crew'
                                        };
                                        localStorage.setItem('7h_accounts_v1', JSON.stringify(accounts));
                                        alert(`Password reset to: ${res.password}\n\nPlease refresh to see changes.`);
                                        window.location.reload();
                                      }
                                    }}
                                    className="ml-4 px-2 py-1 bg-purple-500/10 hover:bg-purple-600  text-[var(--color-accent)] hover:text-black border border-purple-500/20 text-[0.55rem] font-bold uppercase tracking-widest rounded transition-colors"
                                  >
                                    Reset & Show
                                  </button>
                                )}
                              </div>
                              {user.role === 'crew' && !acct?.password && (
                                <p className="text-[0.6rem]  text-[var(--color-accent)]/60 font-bold italic">
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
    <section className="overflow-hidden">
      <div role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleSection('crewcreation'); } }} onClick={() => toggleSection('crewcreation')} className="py-6 pr-6 pl-0 flex items-center justify-between cursor-pointer select-none">
        <div className="flex items-center gap-2">
          <div className="drag-handle cursor-grab active:cursor-grabbing py-1.5 pr-1.5 pl-0 hover:bg-white/5 rounded text-white/20 hover:text-white/50 transition-colors shrink-0 mr-1" title="Drag to reorder section" onClick={(e) => e.stopPropagation()}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="9" cy="19" r="1" /><circle cx="15" cy="5" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="19" r="1" /></svg>
          </div>
          <h3 className="cursor-pointer text-lg font-bold tracking-tight text-white flex items-center gap-2">
            Create Crew Account
            {renderInfoToggle('crewcreation')}
          </h3>
        </div>
        <div className="flex items-center gap-3">

          <div className={"w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center transition-transform duration-300 " + (isSectionOpen('crewcreation') ? 'rotate-0' : '-rotate-90')}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40"><path d="M2 4l4 4 4-4" /></svg>
          </div>
        </div>
      </div >
      {renderInfoBanner('crewcreation', 'Create Crew Account', 'Create and register new crew members in the system, set contact information, and provision login credentials.')}
      < div style={{ display: isSectionOpen('crewcreation') ? undefined : 'none' }}>
        <div className="py-6 pr-6 pl-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
            <div>
              <label htmlFor="admin-create-crew-name" className="text-[0.6rem] uppercase tracking-[0.15em] text-white/40 mb-2 block font-bold">Full Name</label>
              <div className="input-glow-border rounded-lg w-full">
                <input
                  id="admin-create-crew-name"
                  type="text"
                  placeholder="e.g. Alex Rivera"
                  value={newCrewName}
                  onChange={e => setNewCrewName(e.target.value)}
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 text-sm text-white placeholder-white/20 outline-none transition-colors rounded-lg"
                />
              </div>
            </div>
            <div>
              <label htmlFor="admin-create-crew-username" className="text-[0.6rem] uppercase tracking-[0.15em] text-white/40 mb-2 block font-bold">Username</label>
              <div className="input-glow-border rounded-lg w-full">
                <input
                  id="admin-create-crew-username"
                  type="text"
                  placeholder="e.g. alex_7h"
                  value={newCrewUsername}
                  onChange={e => setNewCrewUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase())}
                  maxLength={24}
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 text-sm text-white placeholder-white/20 outline-none transition-colors rounded-lg"
                />
              </div>
            </div>
            <div>
              <label htmlFor="admin-create-crew-email" className="text-[0.6rem] uppercase tracking-[0.15em] text-white/40 mb-2 block font-bold">Email Address</label>
              <div className="input-glow-border rounded-lg w-full">
                <input
                  id="admin-create-crew-email"
                  type="email"
                  placeholder="crew@7thheaven.com"
                  value={newCrewEmail}
                  onChange={e => setNewCrewEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 text-sm text-white placeholder-white/20 outline-none transition-colors rounded-lg"
                />
              </div>
            </div>
            <div>
              <label htmlFor="admin-create-crew-password" className="text-[0.6rem] uppercase tracking-[0.15em] text-white/40 mb-2 block font-bold">Password</label>
              <div className="input-glow-border rounded-lg w-full">
                <input
                  id="admin-create-crew-password"
                  type="password"
                  placeholder="Min 6 characters"
                  value={newCrewPassword}
                  onChange={e => setNewCrewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 text-sm text-white placeholder-white/20 outline-none transition-colors rounded-lg"
                />
              </div>
            </div>
            <div>
              <label htmlFor="admin-create-crew-phone" className="text-[0.6rem] uppercase tracking-[0.15em] text-white/40 mb-2 block font-bold">Phone Number <span className="text-purple-300">*</span></label>
              <div className="input-glow-border rounded-lg w-full">
                <input
                  id="admin-create-crew-phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={newCrewPhone}
                  onChange={e => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                    if (digits.length <= 3) setNewCrewPhone(digits);
                    else if (digits.length <= 6) setNewCrewPhone(`(${digits.slice(0, 3)}) ${digits.slice(3)}`);
                    else setNewCrewPhone(`(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`);
                  }}
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 text-sm text-white placeholder-white/20 outline-none transition-colors rounded-lg"
                />
              </div>
            </div>
            <button
              onClick={createCrew}
              disabled={!newCrewName.trim() || !newCrewEmail.trim() || !newCrewPassword.trim()}
              className="px-6 py-3 bg-emerald-500 text-black font-bold text-[0.7rem] uppercase tracking-[0.15em] rounded-lg hover:bg-emerald-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] flex items-center gap-2 whitespace-nowrap"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></svg>
              Create Account
            </button>
          </div>
          <div className="mt-4 p-3 bg-white/[0.02] border border-white/5 rounded-lg flex items-start gap-3">
            <span className="text-purple-300 text-sm mt-0.5"></span>
            <p className="text-[0.65rem] text-white/40 leading-relaxed">
              A crew account will be created with the credentials above. Share the login details securely with the crew member. Only admins can create crew accounts.
            </p>
          </div>

          {/* Success card */}
          {createdCrew && (
            <div className="mt-4 p-5 bg-emerald-500/[0.08] border border-emerald-500/30 animate-[fadeIn_0.3s_ease]">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-lg shrink-0"></div>
                  <div>
                    <h4 className="text-sm font-bold text-[var(--color-accent)]">Crew Account Created</h4>
                    <p className="text-[0.7rem] text-white/60 mt-1"><strong className="text-white">{createdCrew.name}</strong> · {createdCrew.email}</p>
                    {createdCrew.phone && <p className="text-[0.65rem] text-white/40 mt-0.5"> {createdCrew.phone}</p>}
                    <div className="mt-3 flex items-center gap-3 p-3 bg-black/40 border border-white/10 rounded-lg">
                      <span className="text-[0.55rem] uppercase tracking-[0.15em] text-white/30 font-bold shrink-0">Temp Password</span>
                      <code className="text-sm font-mono font-bold text-purple-300 tracking-wider select-all">{createdCrew.password}</code>
                      <button
                        onClick={() => { navigator.clipboard.writeText(createdCrew.password); }}
                        className="ml-auto text-[0.55rem] uppercase tracking-[0.15em] text-white/30 hover:text-white font-bold transition-colors px-2 py-1 border border-white/10 hover:border-white/30 rounded"
                      >Copy</button>
                    </div>
                  </div>
                </div>
                <button aria-label="Dismiss created crew notification" onClick={() => setCreatedCrew(null)} className="text-white/20 hover:text-white text-lg transition-colors shrink-0">✕</button>
              </div>
              <button
                onClick={scrollToRegistry}
                className="mt-4 w-full py-2.5 bg-emerald-500/10 border  border-[var(--color-accent)]/30 text-[var(--color-accent)] text-[0.65rem] uppercase tracking-[0.15em] font-bold hover:bg-emerald-500/20 transition-colors rounded-lg flex items-center justify-center gap-2"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                View in Registry ↓
              </button>
            </div>
          )}

          {/* Error */}
          {crewError && (
            <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center gap-3">
              <span className="text-rose-400"></span>
              <p className="text-[0.7rem] text-rose-400 font-bold">{crewError}</p>
              <button aria-label="Dismiss crew error" onClick={() => setCrewError('')} className="ml-auto text-white/30 hover:text-white">✕</button>
            </div>
          )}
        </div>
      </div >
    </section >
  );

  const createAdmin = async () => {
    if (!newAdminName.trim() || !newAdminEmail.trim() || !newAdminUsername.trim()) return;
    setAdminCreateLoading(true);
    setAdminCreateError('');
    setCreatedAdmin(null);
    try {
      const savedName = newAdminName;
      const savedEmail = newAdminEmail;
      const res = await adminCreateAdmin({ name: newAdminName, email: newAdminEmail, username: newAdminUsername.trim().toLowerCase() });
      if (res.success) {
        setCreatedAdmin({ name: savedName, email: savedEmail, password: res.password || '' });
        setNewAdminName('');
        setNewAdminEmail('');
        setNewAdminUsername('');
      } else {
        setAdminCreateError(res.error || 'Failed to create admin account.');
      }
    } catch {
      setAdminCreateError('An unexpected error occurred while creating admin.');
    } finally {
      setAdminCreateLoading(false);
    }
  };

  const renderAdminCreation = () => (
    <section className="overflow-hidden">
      <div role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleSection('admincreation'); } }} onClick={() => toggleSection('admincreation')} className="py-6 pr-6 pl-0 flex items-center justify-between cursor-pointer select-none">
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <div className="drag-handle cursor-grab active:cursor-grabbing py-1.5 pr-1.5 pl-0 hover:bg-white/5 rounded text-white/20 hover:text-white/50 transition-colors shrink-0 mr-1" title="Drag to reorder section">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="9" cy="19" r="1" /><circle cx="15" cy="5" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="19" r="1" /></svg>
          </div>
          <h3 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
            Create Admin Account
            {renderInfoToggle('admincreation')}
          </h3>
        </div>
        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
          <div className={"w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center transition-transform duration-300 " + (isSectionOpen('admincreation') ? 'rotate-0' : '-rotate-90')}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40"><path d="M2 4l4 4 4-4" /></svg>
          </div>
        </div>
      </div >
      {renderInfoBanner('admincreation', 'Create Admin Account', 'Register new band administrator or planner accounts with full database access and management permissions.')}
      < div style={{ display: isSectionOpen('admincreation') ? undefined : 'none' }}>
        <div className="py-6 pr-6 pl-0">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label htmlFor="admin-create-admin-name" className="text-[0.6rem] uppercase tracking-[0.15em] text-white/40 mb-2 block font-bold">Full Name</label>
              <div className="input-glow-border rounded-lg w-full">
                <input
                  id="admin-create-admin-name"
                  type="text"
                  placeholder="e.g. Michael Scimeca"
                  value={newAdminName}
                  onChange={e => setNewAdminName(e.target.value)}
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 text-sm text-white placeholder-white/20 outline-none transition-colors rounded-lg"
                />
              </div>
            </div>
            <div>
              <label htmlFor="admin-create-admin-email" className="text-[0.6rem] uppercase tracking-[0.15em] text-white/40 mb-2 block font-bold">Email Address</label>
              <div className="input-glow-border rounded-lg w-full">
                <input
                  id="admin-create-admin-email"
                  type="email"
                  placeholder="admin@7thheaven.com"
                  value={newAdminEmail}
                  onChange={e => setNewAdminEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 text-sm text-white placeholder-white/20 outline-none transition-colors rounded-lg"
                />
              </div>
            </div>
            <div>
              <label htmlFor="admin-create-admin-username" className="text-[0.6rem] uppercase tracking-[0.15em] text-white/40 mb-2 block font-bold">Username</label>
              <div className="input-glow-border rounded-lg w-full">
                <input
                  id="admin-create-admin-username"
                  type="text"
                  placeholder="e.g. mikeys"
                  value={newAdminUsername}
                  onChange={e => setNewAdminUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 text-sm text-white placeholder-white/20 outline-none transition-colors rounded-lg"
                />
              </div>
            </div>
            <button
              onClick={createAdmin}
              disabled={!newAdminName.trim() || !newAdminEmail.trim() || !newAdminUsername.trim() || adminCreateLoading}
              className="px-6 py-3 bg-purple-600 text-white font-bold text-[0.7rem] uppercase tracking-[0.15em] rounded-lg hover:bg-purple-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(147, 51, 234,0.2)] hover:shadow-[0_0_30px_rgba(147, 51, 234,0.4)] flex items-center gap-2 whitespace-nowrap"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></svg>
              {adminCreateLoading ? 'Creating…' : 'Create Admin'}
            </button>
          </div>

          <div className="mt-4 p-3 bg-white/[0.02] border border-white/5 rounded-lg flex items-start gap-3">
            <span className="text-purple-300 text-sm mt-0.5"></span>
            <p className="text-[0.65rem] text-white/40 leading-relaxed">
              A secure temporary password will be auto-generated and emailed to the new admin. They can log in immediately with those credentials. Only grant admin access to trusted individuals — admin accounts have full platform access.
            </p>
          </div>

          {/* Success card */}
          {createdAdmin && (
            <div className="mt-4 p-5 bg-purple-600/[0.08] border border-purple-500/30">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-lg shrink-0"></div>
                  <div>
                    <h4 className="text-sm font-bold text-purple-300">Admin Account Created</h4>
                    <p className="text-[0.7rem] text-white/60 mt-1"><strong className="text-white">{createdAdmin.name}</strong> · {createdAdmin.email}</p>
                    <div className="mt-3 flex items-center gap-3 p-3 bg-black/40 border border-white/10 rounded-lg">
                      <span className="text-[0.55rem] uppercase tracking-[0.15em] text-white/30 font-bold shrink-0">Temp Password</span>
                      <code className="text-sm font-mono font-bold text-purple-300 tracking-wider select-all">{createdAdmin.password}</code>
                      <button
                        onClick={() => { navigator.clipboard.writeText(createdAdmin.password); }}
                        className="ml-auto text-[0.55rem] uppercase tracking-[0.15em] text-white/30 hover:text-white font-bold transition-colors px-2 py-1 border border-white/10 hover:border-white/30 rounded"
                      >Copy</button>
                    </div>
                    <p className="text-[0.6rem] text-white/30 mt-2"> Welcome email sent to {createdAdmin.email}</p>
                  </div>
                </div>
                <button aria-label="Dismiss created admin notification" onClick={() => setCreatedAdmin(null)} className="text-white/20 hover:text-white text-lg transition-colors shrink-0">✕</button>
              </div>
            </div>
          )}
          {/* Error */}
          {adminCreateError && (
            <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center gap-3">
              <span className="text-rose-400"></span>
              <p className="text-[0.7rem] text-rose-400 font-bold">{adminCreateError}</p>
              <button aria-label="Dismiss admin error" onClick={() => setAdminCreateError('')} className="ml-auto text-white/30 hover:text-white">✕</button>
            </div>
          )}

          {/* Sub-Admin Permissions Manager */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  Sub-Admin Role Permissions
                  {savePermStatus === 'saving' && <span className="text-[0.65rem] text-purple-300 font-mono animate-pulse">Saving changes...</span>}
                  {savePermStatus === 'saved' && <span className="text-[0.65rem] text-[var(--color-accent)] font-mono"> Saved to database</span>}
                </h4>
                <p className="text-[0.65rem] text-white/40 mt-0.5">Control feature access for specific sub-admin accounts.</p>
              </div>
            </div>

            <div className="space-y-4">
              {Object.entries(adminPermissions).map(([email, perms]) => (
                <div key={email} className="p-4 bg-white/[0.03] border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-purple-300 font-mono">{email}</span>
                    <span className="text-[0.6rem] uppercase tracking-wider text-white/30 font-bold">Sub-Admin</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { key: 'cruise_admin', label: ' Cruise Admin' },
                      { key: 'cruise_chat', label: ' Cruise Chat' },
                      { key: 'schedule', label: ' Schedule' },
                      { key: 'crew_roster', label: ' Crew Roster' },
                      { key: 'email_blasts', label: ' Email Blasts' },
                      { key: 'site_settings', label: ' Site Settings' },
                    ].map(({ key, label }) => {
                      const enabled = !!perms[key];
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => {
                            const updated = {
                              ...adminPermissions,
                              [email]: {
                                ...adminPermissions[email],
                                [key]: !enabled,
                              }
                            };
                            savePermissionsToBackend(updated);
                          }}
                          className={`flex items-center justify-between p-2.5 rounded-lg border text-left text-xs font-medium transition-colors cursor-pointer ${enabled
                            ? 'bg-purple-500/10 border-purple-500/40 text-purple-300'
                            : 'bg-black/40 border-white/5 text-white/40 hover:border-white/20'
                            }`}
                        >
                          <span>{label}</span>
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[var(--font-size-3xs)] font-bold ${enabled ? 'bg-purple-500 text-white' : 'bg-white/10 text-white/30'}`}>
                            {enabled ? '' : ''}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div >
    </section >
  );



  const renderBulkInvites = () => (
    <section className="overflow-hidden">
      <div role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleSection('bulkinvites'); } }} onClick={() => toggleSection('bulkinvites')} className="py-6 pr-6 pl-0 flex items-center justify-between cursor-pointer select-none">
        <div className="flex items-center gap-2">
          <div className="drag-handle cursor-grab active:cursor-grabbing py-1.5 pr-1.5 pl-0 hover:bg-white/5 rounded text-white/20 hover:text-white/50 transition-colors shrink-0 mr-1" title="Drag to reorder section" onClick={(e) => e.stopPropagation()}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="9" cy="19" r="1" /><circle cx="15" cy="5" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="19" r="1" /></svg>
          </div>
          <h3 className="text-lg font-bold tracking-tight text-white flex items-center gap-2 cursor-pointer">
            Bulk Invites
            {renderInfoToggle('bulkinvites')}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <div className={"w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center transition-transform duration-300 " + (isSectionOpen('bulkinvites') ? 'rotate-0' : '-rotate-90')}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40"><path d="M2 4l4 4 4-4" /></svg>
          </div>
        </div>
      </div >
      {renderInfoBanner('bulkinvites', 'Bulk Invites', 'Upload CSV lists of emails or phone numbers to bulk-invite members to the crew directory.')}
      < div style={{ display: isSectionOpen('bulkinvites') ? undefined : 'none' }}>
        <div className="py-6 pr-6 pl-0">
          <BulkInvitePanel />
        </div>
      </div >
    </section >
  );

  const renderCruiseSignups = () => {
    const signups = cruiseStats.recentSignups || [];
    const allEmails = signups.flatMap((s: any) => s.email ? [s.email] : []);
    const cruiseSelectedEmailsSet = new Set(cruiseSelectedEmails);
    const allSelected = allEmails.length > 0 && allEmails.every((e: string) => cruiseSelectedEmailsSet.has(e));

    const toggleEmail = (email: string) => {
      setCruiseSelectedEmails(prev =>
        prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]
      );
    };
    const toggleAllEmails = () => {
      if (allSelected) {
        setCruiseSelectedEmails([]);
      } else {
        setCruiseSelectedEmails(allEmails);
      }
    };

    const toggleFlag = async (id: string, field: string, value: boolean) => {
      try {
        await fetch('/api/admin/cruise-stats', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, [field]: value }),
        });
        const res = await fetch(`/api/admin/cruise-stats?t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          if (data && !data.error) setCruiseStats(data);
        }
      } catch { }
    };
    const deleteSignup = async (id: string, name: string) => {
      if (!confirm(`Remove ${name} from the cruise roster?`)) return;
      try {
        await fetch('/api/admin/cruise-stats', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        });
        const res = await fetch(`/api/admin/cruise-stats?t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          if (data && !data.error) setCruiseStats(data);
        }
      } catch { }
    };

    const sendCruiseEmail = async () => {
      if (cruiseEmailSendingRef.current || !cruiseEmailSubject.trim() || !cruiseEmailBody.trim()) return;
      if (cruiseSelectedEmails.length === 0) { alert('Select at least one passenger.'); return; }
      if (!confirm(`Send this email to ${cruiseSelectedEmails.length} cruise passenger${cruiseSelectedEmails.length !== 1 ? 's' : ''}?`)) return;
      cruiseEmailSendingRef.current = true;
      setCruiseEmailSending(true);
      setCruiseEmailResult(null);
      try {
        const res = await fetch('/api/admin/cruise-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subject: cruiseEmailSubject, body: cruiseEmailBody, recipients: cruiseSelectedEmails }),
        });
        if (res.ok) {
          const data = await res.json();
          setCruiseEmailResult(data);
          if (data.success) { setCruiseEmailSubject(''); setCruiseEmailBody(''); }
        }
      } catch (err: any) {
        setCruiseEmailResult({ error: err.message });
      }
      cruiseEmailSendingRef.current = false;
      setCruiseEmailSending(false);
    };

    return (
      <section className="overflow-hidden">
        <div role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleSection('cruisesignups'); } }} onClick={() => toggleSection('cruisesignups')} className="py-6 pr-6 pl-0 flex items-center justify-between cursor-pointer select-none">
          <div className="flex items-center gap-2">
            <div className="drag-handle cursor-grab active:cursor-grabbing py-1.5 pr-1.5 pl-0 hover:bg-white/5 rounded text-white/20 hover:text-white/50 transition-colors shrink-0 mr-1" title="Drag to reorder section" onClick={(e) => e.stopPropagation()}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="9" cy="19" r="1" /><circle cx="15" cy="5" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="19" r="1" /></svg>
            </div>
            <h3 className="text-lg font-bold tracking-tight text-white flex items-center gap-2 cursor-pointer">
              Cruise Signups
              {renderInfoToggle('cruisesignups')}
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[0.6rem] text-cyan-400/60 uppercase tracking-widest font-bold">
              {signups.length} registered
            </span>
            <div className={"w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center transition-transform duration-300 " + (isSectionOpen('cruisesignups') ? 'rotate-0' : '-rotate-90')}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40"><path d="M2 4l4 4 4-4" /></svg>
            </div>
          </div>
        </div >
        {renderInfoBanner('cruisesignups', 'Cruise Signups', 'View and manage all cruise registrations. Toggle deposit/payment status, check passengers off, select recipients and send emails.')}
        < div style={{ display: isSectionOpen('cruisesignups') ? undefined : 'none' }}>
          <div className="py-6 pr-6 pl-0">
            {/* Summary stats bar */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              <div className="bg-black/30 p-3 border border-white/5 text-center">
                <p className="text-xl font-black text-cyan-400">{signups.length}</p>
                <p className="text-[0.5rem] font-bold text-white/30 uppercase tracking-widest mt-0.5">Bookings</p>
              </div>
              <div className="bg-black/30 p-3 border border-white/5 text-center">
                <p className="text-xl font-black text-white">{cruiseStats.total}</p>
                <p className="text-[0.5rem] font-bold text-white/30 uppercase tracking-widest mt-0.5">Total Pax</p>
              </div>
              <div className="bg-black/30 p-3 border border-white/5 text-center">
                <p className="text-xl font-black text-[var(--color-accent)]">{signups.filter((s: any) => s.depositPaid).length}</p>
                <p className="text-[0.5rem] font-bold text-white/30 uppercase tracking-widest mt-0.5">Deposits</p>
              </div>
              <div className="bg-black/30 p-3 border border-white/5 text-center">
                <p className="text-xl font-black text-purple-300">{signups.filter((s: any) => s.fullPaid).length}</p>
                <p className="text-[0.5rem] font-bold text-white/30 uppercase tracking-widest mt-0.5">Paid Full</p>
              </div>
            </div>

            {/* Email action bar */}
            {signups.length > 0 && (
              <div className="flex items-center justify-between mb-4 bg-black/20 px-4 py-3 border border-white/5">
                <div className="flex items-center gap-3">
                  <button aria-label="Select all passenger emails" onClick={toggleAllEmails} className={`w-5 h-5 rounded border flex items-center justify-center transition-colors cursor-pointer ${allSelected ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400' : 'bg-black/20 border-white/15 text-white/10 hover:border-white/25'}`}>
                    {allSelected && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                  </button>
                  <span className="text-[0.6rem] text-white/40 font-bold uppercase tracking-widest">
                    {cruiseSelectedEmails.length > 0 ? `${cruiseSelectedEmails.length} selected` : 'Select passengers'}
                  </span>
                </div>
                <button
                  onClick={() => { setCruiseEmailOpen(!cruiseEmailOpen); setCruiseEmailResult(null); }}
                  disabled={cruiseSelectedEmails.length === 0}
                  className="px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-purple-400text-[0.6rem] font-black uppercase tracking-widest rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                  Email {cruiseSelectedEmails.length > 0 ? `(${cruiseSelectedEmails.length})` : ''}
                </button>
              </div>
            )}

            {/* Email compose panel */}
            {cruiseEmailOpen && cruiseSelectedEmails.length > 0 && (
              <div className="mb-5 bg-cyan-500/5 border border-cyan-500/20 p-5 space-y-4 animate-[slideIn_0.3s_ease-out]">
                <div className="flex items-center justify-between">
                  <p className="text-[0.6rem] font-bold uppercase tracking-widest text-cyan-400/60">Compose Cruise Email</p>
                  <button aria-label="Close email compose panel" onClick={() => setCruiseEmailOpen(false)} className="text-white/20 hover:text-white/50 transition-colors cursor-pointer text-sm">✕</button>
                </div>
                {/* Selected recipients preview */}
                <div className="flex flex-wrap gap-1.5 max-h-[60px] overflow-y-auto scrollbar-hide">
                  {cruiseSelectedEmails.map(email => (
                    <span key={email} className="inline-flex items-center gap-1 bg-black/30 border border-white/5 rounded-full px-2.5 py-1 text-[0.55rem] text-white/50">
                      {email}
                      <button aria-label={`Remove ${email}`} onClick={() => toggleEmail(email)} className="text-white/20 hover:text-rose-400 transition-colors cursor-pointer">×</button>
                    </span>
                  ))}
                </div>
                <div>
                  <label htmlFor="admin-cruise-email-subject" className="text-[0.55rem] font-bold uppercase tracking-widest text-white/30 mb-1.5 block">Subject</label>
                  <input
                    id="admin-cruise-email-subject"
                    type="text"
                    value={cruiseEmailSubject}
                    onChange={e => setCruiseEmailSubject(e.target.value)}
                    placeholder="e.g. Important Cruise Update — Departure Details"
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50 transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="admin-cruise-email-body" className="text-[0.55rem] font-bold uppercase tracking-widest text-white/30 mb-1.5 block">Message</label>
                  <textarea
                    id="admin-cruise-email-body"
                    value={cruiseEmailBody}
                    onChange={e => setCruiseEmailBody(e.target.value)}
                    placeholder="Write your message to cruise passengers..."
                    rows={5}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50 transition-colors resize-none"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    {cruiseEmailResult && (
                      <p className={`text-sm font-bold ${cruiseEmailResult.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {cruiseEmailResult.success ? ` Sent to ${cruiseEmailResult.sent} passenger${cruiseEmailResult.sent !== 1 ? 's' : ''}` : ` ${cruiseEmailResult.error}`}
                        {cruiseEmailResult.failed > 0 && <span className="text-rose-400 ml-2">({cruiseEmailResult.failed} failed)</span>}
                      </p>
                    )}
                  </div>
                  <button
                    disabled={cruiseEmailSending || !cruiseEmailSubject.trim() || !cruiseEmailBody.trim()}
                    onClick={sendCruiseEmail}
                    className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold text-[0.65rem] uppercase tracking-widest rounded-lg transition-colors flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.2)] cursor-pointer"
                  >
                    {cruiseEmailSending ? (
                      <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</>
                    ) : (
                      <> Send Email</>
                    )}
                  </button>
                </div>
              </div>
            )}

            {signups.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-white/20 text-sm">No cruise signups yet.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto scrollbar-hide">
                {/* Table header */}
                <div className="grid grid-cols-[28px_40px_1fr_1fr_100px_80px_80px_80px_40px] gap-3 px-3 py-2 text-[0.5rem] font-bold text-white/25 uppercase tracking-widest border-b border-white/5">
                  <span></span>
                  <span>#</span>
                  <span>Name / Email</span>
                  <span>Phone</span>
                  <span>Party</span>
                  <span className="text-center">Checked</span>
                  <span className="text-center">Deposit</span>
                  <span className="text-center">Full</span>
                  <span></span>
                </div>
                {(() => {
                  const cruiseSelectedEmailsSet = new Set(cruiseSelectedEmails);
                  return signups.map((s: any, i: number) => (
                    <div key={s.id || s.email} className={`grid grid-cols-[28px_40px_1fr_1fr_100px_80px_80px_80px_40px] gap-3 items-center bg-black/20 px-3 py-3 rounded-lg border transition-colors group/row ${cruiseSelectedEmailsSet.has(s.email) ? 'border-cyan-500/30 bg-cyan-500/5' : 'border-white/5 hover:border-cyan-500/20'}`}>
                      {/* Email checkbox */}
                      <div className="flex justify-center">
                        <button aria-label={`Select ${s.name || s.email}`} onClick={() => s.email && toggleEmail(s.email)} className={`w-5 h-5 rounded border flex items-center justify-center transition-colors cursor-pointer ${cruiseSelectedEmailsSet.has(s.email) ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400' : 'bg-black/20 border-white/10 text-white/10 hover:border-white/20'}`}>
                          {cruiseSelectedEmailsSet.has(s.email) && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                        </button>
                      </div>
                      {/* Row number */}
                      <span className="text-[0.6rem] font-mono text-white/20">{i + 1}</span>
                      {/* Name + Email */}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{s.name}</p>
                        <p className="text-[0.55rem] text-white/30 truncate">{s.email}</p>
                      </div>
                      {/* Phone */}
                      <p className="text-[0.65rem] text-white/40 font-mono truncate">{s.phone || '—'}</p>
                      {/* Party size + date */}
                      <div>
                        <p className="text-[0.65rem] text-white/50 font-bold">{s.partySize > 1 ? `${s.partySize} guests` : '1 guest'}</p>
                        <p className="text-[0.5rem] text-white/20">{s.date}</p>
                      </div>
                      {/* Checked off */}
                      <div className="flex justify-center">
                        <button aria-label="Toggle checked off" onClick={() => toggleFlag(s.id, 'checked_off', !s.checkedOff)} className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${s.checkedOff ? 'bg-emerald-500/20 border-emerald-500/40 text-[var(--color-accent)]' : 'bg-black/20 border-white/10 text-white/10 hover:border-white/20'}`}>
                          {s.checkedOff && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                        </button>
                      </div>
                      {/* Deposit paid */}
                      <div className="flex justify-center">
                        <button aria-label="Toggle deposit paid" onClick={() => toggleFlag(s.id, 'deposit_paid', !s.depositPaid)} className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${s.depositPaid ? 'bg-emerald-500/20 border-emerald-500/40 text-[var(--color-accent)]' : 'bg-black/20 border-white/10 text-white/10 hover:border-white/20'}`}>
                          {s.depositPaid && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                        </button>
                      </div>
                      {/* Full paid */}
                      <div className="flex justify-center">
                        <button aria-label="Toggle full paid" onClick={() => toggleFlag(s.id, 'full_paid', !s.fullPaid)} className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${s.fullPaid ? 'bg-purple-500/20 border-purple-500/40 text-purple-300' : 'bg-black/20 border-white/10 text-white/10 hover:border-white/20'}`}>
                          {s.fullPaid && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                        </button>
                      </div>
                      {/* Delete */}
                      <button aria-label={`Delete signup ${s.name || ''}`} onClick={() => deleteSignup(s.id, s.name)} className="w-6 h-6 rounded-md border border-transparent hover:border-rose-500/30 flex items-center justify-center text-white/10 hover:text-rose-400 transition-colors opacity-0 group-hover/row:opacity-100 cursor-pointer">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                      </button>
                    </div>
                  ));
                })()}
              </div>
            )}

            {/* Bottom actions */}
            <div className="flex gap-3 mt-4">
              <button onClick={async () => { const res = await fetch('/api/admin/cruise-export'); if (res.ok) { const blob = await res.blob(); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = '7th-heaven-cruise-roster.csv'; a.click(); URL.revokeObjectURL(url); } }} className="flex-1 py-3 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white text-[0.65rem] font-black uppercase tracking-widest transition-colors cursor-pointer shadow-[0_4px_15px_rgba(6,182,212,0.25)] border border-cyan-400/30 flex items-center justify-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
                Export CSV
              </button>
            </div>
          </div>
        </div >
      </section >
    );
  };

  const addScheduleItem = () => {
    if (!draggedCrewMemberId || !activeDropDay) return;

    const activeAssignments = Object.entries(selectedCrewAssignments).filter(([_, val]) => val.active);

    const hasInternalOverlap = (tfs: { startHour: number; endHour: number }[]) => {
      for (let i = 0; i < tfs.length; i++) {
        for (let j = i + 1; j < tfs.length; j++) {
          if (tfs[i].startHour < tfs[j].endHour && tfs[i].endHour > tfs[j].startHour) {
            return true;
          }
        }
      }
      return false;
    };

    // Internal overlap validation
    if (activeAssignments.length > 0) {
      for (const [crewId, details] of activeAssignments) {
        const tfs = (crewId === draggedCrewMemberId || !details.customized)
          ? dropTimeFrames
          : (details.timeFrames || dropTimeFrames);

        if (hasInternalOverlap(tfs)) {
          const name = findCrewName(crewId);
          showAlert(`Cannot save schedule for ${name}: Time frames overlap with each other.`, "Schedule Overlap", "warning");
          return;
        }
      }
    } else {
      if (hasInternalOverlap(dropTimeFrames)) {
        showAlert(`Cannot save schedule: Time frames overlap with each other.`, "Schedule Overlap", "warning");
        return;
      }
    }

    // Determine touched real crew members
    const touchedCrewIds = new Set<string>();
    if (editingShiftId) {
      const originalShift = schedules.find(s => s.id === editingShiftId);
      if (originalShift && originalShift.crewId !== 'openshifts') {
        touchedCrewIds.add(originalShift.crewId);
      }
    }
    activeAssignments.forEach(([crewId]) => {
      if (crewId !== 'openshifts') {
        touchedCrewIds.add(crewId);
      }
    });

    setSchedules(current => {
      let updated = [...current];

      // When editing a specific shift, remove only that shift. Otherwise, update touched crew shifts.
      if (editingShiftId) {
        updated = updated.filter(item => item.id !== editingShiftId);
      } else if (touchedCrewIds.size > 0) {
        updated = updated.filter(item => !(item.date === activeDropDay && touchedCrewIds.has(item.crewId) && !item.isTimeOff));
      }

      if (activeAssignments.length > 0) {
        activeAssignments.forEach(([crewId, details], idx) => {
          const tfs = (crewId === draggedCrewMemberId || !details.customized)
            ? dropTimeFrames
            : (details.timeFrames || dropTimeFrames);

          tfs.forEach((tf, tfIdx) => {
            const newId = 'shift_' + Date.now() + '_' + crewId + '_' + idx + '_' + tfIdx + '_' + Math.random().toString(36).substr(2, 5);
            const newItem = {
              id: newId,
              crewId: crewId,
              crewName: findCrewName(crewId),
              date: activeDropDay,
              startHour: tf.startHour,
              endHour: tf.endHour,
              time: formatTimeFrame(tf.startHour, tf.endHour),
              role: tf.role.toUpperCase(),
              location: dropLocationRef.current,
              notes: dropNotesRef.current,
              tags: tf.tags || []
            };
            updated.push(newItem);
          });
        });
      } else {
        // Typically 'openshifts'
        if (draggedCrewMemberId === 'openshifts') {
          if (editingShiftId) {
            updated = updated.filter(item => item.id !== editingShiftId);
          }
          dropTimeFrames.forEach((tf, idx) => {
            const newId = editingShiftId && idx === 0
              ? editingShiftId
              : 'shift_' + Date.now() + '_openshifts_' + idx + '_' + Math.random().toString(36).substr(2, 5);
            const newItem = {
              id: newId,
              crewId: 'openshifts',
              crewName: 'OpenShifts',
              date: activeDropDay,
              startHour: tf.startHour,
              endHour: tf.endHour,
              time: formatTimeFrame(tf.startHour, tf.endHour),
              role: tf.role.toUpperCase(),
              location: dropLocationRef.current,
              notes: dropNotesRef.current,
              tags: tf.tags || []
            };
            updated.push(newItem);
          });
        } else {
          updated = updated.filter(item => !(item.date === activeDropDay && item.crewId === draggedCrewMemberId && !item.isTimeOff));
          dropTimeFrames.forEach((tf, idx) => {
            const newId = 'shift_' + Date.now() + '_' + idx;
            const newItem = {
              id: newId,
              crewId: draggedCrewMemberId,
              crewName: findCrewName(draggedCrewMemberId),
              date: activeDropDay,
              startHour: tf.startHour,
              endHour: tf.endHour,
              time: formatTimeFrame(tf.startHour, tf.endHour),
              role: tf.role.toUpperCase(),
              location: dropLocationRef.current,
              notes: dropNotesRef.current,
              tags: tf.tags || []
            };
            updated.push(newItem);
          });
        }
      }

      return updated;
    });

    if (dropTimeFrames.length > 0) {
      saveCustomRole(dropTimeFrames[0].role);
    }
    setActiveDropDay(null);
    setDraggedCrewMemberId(null);
    setEditingShiftId(null);
  };

  const deleteScheduleItem = (id: string) => {
    setSchedules(current => {
      return current.filter(item => item.id !== id);
    });
  };

  const getOverlappingShifts = (crewId: string, date: string, startHour: number, endHour: number, excludeShiftId?: string) => {
    if (crewId === 'openshifts') return [];
    return schedules.filter(s =>
      s.crewId === crewId &&
      s.date === date &&
      s.id !== excludeShiftId &&
      s.startHour < endHour &&
      s.endHour > startHour
    );
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
      { id: 'abbie', name: 'Abbie Janssen', role: 'STAGE MANAGER', maxHours: 40, avatar: '/images/crew/abbie.png' },
      { id: 'al', name: 'Al Hollie', role: 'STAGE HAND', maxHours: 32, avatar: '/images/crew/al.png' },
      { id: 'andrea', name: 'Andrea Kinzinger', role: 'TOUR MANAGER', maxHours: 40, avatar: '/images/crew/andrea.png' },
      { id: 'arjun', name: 'Arjun Patel', role: 'SOUND ENGINEER', maxHours: 32, avatar: '/images/crew/arjun.png' },
      { id: 'chris', name: 'Chris Loxely', role: 'LIGHTS', maxHours: 40, avatar: '/images/crew/chris.png' },
      { id: 'daniel', name: 'Daniel Kim', role: 'TOUR MANAGER', maxHours: 40, avatar: '/images/crew/daniel.png' },
      { id: 'dave_croke', name: 'Dave Croke', role: 'EQUIPMENT SETUP', maxHours: 32, avatar: '/images/crew/dave_croke.png' },
      { id: 'dave_maas', name: 'Dave Maas', role: 'TEAR DOWN', maxHours: 24, avatar: '/images/crew/dave_maas.png' },
      { id: 'david_xu', name: 'David Xu', role: 'STAGE HAND', maxHours: 40, avatar: '/images/crew/david_xu.png' },
      { id: 'emily', name: 'Emily Hafften', role: 'MERCH', maxHours: 32, avatar: '/images/crew/emily.png' },
      { id: 'emma', name: 'Emma Smid', role: 'PHOTOGRAPHER', maxHours: 40, avatar: '/images/crew/emma.png' },
      { id: 'erin', name: 'Erin Eagan', role: 'EVENT SUPPORT', maxHours: 40, avatar: '/images/crew/erin.png' },
      { id: 'francesca', name: 'Francesca Troast', role: 'STAGE HAND', maxHours: 40, avatar: '/images/crew/francesca.png' },
      { id: 'michael', name: 'Michael Scimeca', role: 'AUDIO MIX', maxHours: 40, avatar: 'https://ui-avatars.com/api/?name=Michael+Scimeca&background=8a1cfc&color=fff' },
      { id: 'sammy', name: 'Sammy D', role: 'BAND MEMBER', maxHours: 40, avatar: 'https://ui-avatars.com/api/?name=Sammy+D&background=ec4899&color=fff' },
      { id: 'ryan', name: 'Ryan K', role: 'STAGE HAND', maxHours: 32, avatar: 'https://ui-avatars.com/api/?name=Ryan+K&background=0ea5e9&color=fff' },
      { id: 'tony', name: 'Tony M', role: 'EQUIPMENT SETUP', maxHours: 40, avatar: 'https://ui-avatars.com/api/?name=Tony+M&background=10b981&color=fff' }
    ];

    const foundStatic = staticCrew.find(sc => sc.id === crewId);
    if (foundStatic) return foundStatic.name;
    const foundMock = mockCrew.find(c => c.id === crewId);
    if (foundMock) return foundMock.name;
    const foundDynamic = users.find(u => u.id === crewId);
    if (foundDynamic) return foundDynamic.name;
    return crewId;
  };

  function renderCrewSchedule() {
    const todayStr = new Date().toISOString().split('T')[0];
    const upcoming = tourDates
      .filter((show: any) => show.date && show.date >= todayStr)
      .sort((a: any, b: any) => a.date.localeCompare(b.date));
    const nextShowDate = upcoming.length > 0 ? upcoming[0].date : null;

    const handleQuickAutoSendSms = async (dateStr: string) => {
      selectShowForSms(dateStr);

      const smsSection = document.getElementById('section-crewsms');
      if (smsSection) {
        smsSection.scrollIntoView({ behavior: 'smooth' });
        if (!isSectionOpen('crewsms')) {
          toggleSection('crewsms');
        }
      } else {
        const sections = document.querySelectorAll('section');
        for (let s of Array.from(sections)) {
          if (s.textContent?.includes('Crew SMS Alert & Group Setup')) {
            s.scrollIntoView({ behavior: 'smooth' });
            if (!isSectionOpen('crewsms')) {
              toggleSection('crewsms');
            }
            break;
          }
        }
      }
    };
    const handleTextAssignedCrew = handleQuickAutoSendSms;
    const handleAddGroupToDay = (dateStr: string, group: { name: string; memberIds: string[]; memberSettings?: { [crewId: string]: { startHour: number; endHour: number; role: string } } }) => {
      const newShiftsToAdd: any[] = [];
      group.memberIds.forEach(memberId => {
        const mObj = crewMembers.find(m => m.id === memberId);
        if (!mObj) return;

        const settings = group.memberSettings?.[memberId] || { startHour: 17.0, endHour: 22.0, role: mObj.role || 'SERVER' };
        const tfs = (settings as any).timeFrames || [{ startHour: settings.startHour, endHour: settings.endHour, role: settings.role }];

        tfs.forEach((tf: any, tfIdx: number) => {
          newShiftsToAdd.push({
            id: `group_shift_${Date.now()}_${memberId}_${tfIdx}_${Math.random().toString(36).substr(2, 5)}`,
            crewId: memberId,
            crewName: mObj.name,
            date: dateStr,
            startHour: tf.startHour,
            endHour: tf.endHour,
            time: formatTimeFrame(tf.startHour, tf.endHour),
            role: tf.role,
            location: 'The Chicago Theatre',
            notes: ''
          });
        });
      });

      setSchedules(prev => {
        const groupMemberIdsSet = new Set(group.memberIds);
        const filtered = prev.filter(s => !(s.date === dateStr && groupMemberIdsSet.has(s.crewId)));
        return [...filtered, ...newShiftsToAdd];
      });
    };

    const getDayShow = (dateStr: string) => {
      return tourDates.find(show => show.date === dateStr);
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
      const parts = dateStr.split('-');
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      const weekdayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
      const dayName = weekdayNames[d.getDay()];
      return `${dayName} ${d.getDate()}`;
    };

    const getCrewScheduledHours = (crewId: string, weekDays: any[]) => {
      const dates = new Set(weekDays.map(d => d.dateStr));
      const crewShifts = (schedulesByCrew[crewId] || []).filter(s => dates.has(s.date) && !s.isTimeOff);
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
      const crewShifts = (schedulesByCrew[crewId] || []).filter(s => s.date.startsWith(monthPrefix) && !s.isTimeOff);
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
      HOST: { bg: '#9333ea', tagBg: '#6b21a8', label: 'HOST' },           // Vibrant Amber Gold
      MANAGER: { bg: '#a855f7', tagBg: '#7e22ce', label: 'MANAGER' },     // Vibrant Purple / Violet
      POSITION: { bg: '#06b6d4', tagBg: '#0891b2', label: 'POSITION' },   // Vibrant Electric Teal
      UNLOADING: { bg: '#f97316', tagBg: '#c2410c', label: 'UNLOADING' },  // Orange
      CAMERA: { bg: '#ec4899', tagBg: '#be185d', label: 'CAMERA' },        // Pink
      BAND_EQUIPMENT: { bg: '#8b5cf6', tagBg: '#6d28d9', label: 'BAND EQUIPMENT' }, // Violet
      AUDIO_MIX: { bg: '#a855f7', tagBg: '#7e22ce', label: 'AUDIO MIX' },  // Purple
      LIGHTS: { bg: '#eab308', tagBg: '#a16207', label: 'LIGHTS' },        // Yellow
      MERCH: { bg: '#14b8a6', tagBg: '#0f766e', label: 'MERCH' }          // Teal
    };

    const getRoleStyle = (role: string) => {
      const norm = (role || '').toUpperCase().trim().replace(/\s+/g, '_');
      const roleStylesTyped: Record<string, { bg: string, tagBg: string, label: string }> = roleStyles;
      return roleStylesTyped[norm] || { bg: '#3b82f6', tagBg: '#1d4ed8', label: role };
    };

    const getShiftColor = (shift: any, mode: 'role' | 'eventType' | 'band') => {
      const defaultRoleStyle = getRoleStyle(shift.role);
      if (mode === 'role') {
        return defaultRoleStyle;
      }

      const show = shift.date ? getDayShow(shift.date) : null;
      if (!show) {
        return { bg: '#64748b', tagBg: '#475569', label: defaultRoleStyle.label };
      }

      if (mode === 'eventType') {
        const isFestival = show.isFestival || show.tags?.includes('festival') || (show.notes && show.notes.toLowerCase().includes('festival'));
        const isPrivate = show.isPrivate || show.tags?.includes('private') || (show.venue && show.venue.toLowerCase().includes('private'));
        const isCorporate = show.tags?.includes('corporate');
        const isCruise = show.tags?.includes('cruise') || (show.venue && show.venue.toLowerCase().includes('cruise'));

        if (isFestival) return { bg: '#ec4899', tagBg: '#be185d', label: ' Festival' };
        if (isPrivate) return { bg: '#8b5cf6', tagBg: '#6d28d9', label: ' Private' };
        if (isCorporate) return { bg: '#10b981', tagBg: '#047857', label: ' Corporate' };
        if (isCruise) return { bg: '#3b82f6', tagBg: '#1d4ed8', label: ' Cruise' };
        return { bg: '#9333ea', tagBg: '#6b21a8', label: ' Club / Bar' };
      }

      if (mode === 'band') {
        const notesLower = (show.notes || '').toLowerCase();
        const venueLower = (show.venue || '').toLowerCase();

        if (notesLower.includes('unplugged') || notesLower.includes('f.a.n. show')) {
          return { bg: '#f97316', tagBg: '#c2410c', label: ' F.A.N. Unplugged' };
        }
        if (notesLower.includes('tv appearance') || venueLower.includes('wgn')) {
          return { bg: '#06b6d4', tagBg: '#0891b2', label: ' TV appearance' };
        }
        if (venueLower.includes('private event') || notesLower.includes('private')) {
          return { bg: '#f43f5e', tagBg: '#be123c', label: ' Private Event' };
        }
        return { bg: '#6366f1', tagBg: '#4338ca', label: ' 7th Heaven' };
      }

      return defaultRoleStyle;
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
      setCurrentWeekStart(new Date(today.getFullYear(), today.getMonth(), diff));
    };

    const handleGoToMonth = () => {
      setSelectedTourDate(null);
      setCalendarRange('month');
      const today = new Date();
      setCurrentWeekStart(new Date(today.getFullYear(), today.getMonth(), 1));
    };

    const handleDropOnCell = (e: React.DragEvent, dateStr: string, crewId: string) => {
      e.preventDefault();
      e.stopPropagation();

      setDraggedShiftId(null);
      draggedShiftIdRef.current = null;

      const dragData = e.dataTransfer.getData("text/plain");
      if (dragData.startsWith("shift:")) {
        const shiftId = dragData.split(":")[1];

        // Overlap validation
        const draggedShift = schedules.find(s => s.id === shiftId);
        if (draggedShift && crewId !== 'openshifts') {
          const overlapping = getOverlappingShifts(crewId, dateStr, draggedShift.startHour, draggedShift.endHour, shiftId);
          if (overlapping.length > 0) {
            const member = crewMembers.find(c => c.id === crewId);
            const memberName = member ? member.name : crewId;
            showAlert(`Cannot reassign shift: ${memberName} already has an overlapping shift (${overlapping[0].time}) scheduled on ${dateStr}.`, "Reassignment Error", "error");
            return;
          }
        }

        setSchedules(current => {
          return current.map(s => {
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
        });
      }
    };

    const handleCellClick = (dateStr: string, crewId: string, defaultRole: string) => {
      setDrawerCrewSearch('');
      setActiveDropDay(dateStr);
      setDraggedCrewMemberId(crewId);

      // Auto-fill location from tour date if a show exists on this day
      const dayShow = tourDates.find(s => s.date === dateStr);
      if (dayShow) {
        const venueName = dayShow.venue || dayShow.venue_name || '';
        const cityStr = dayShow.city ? `${dayShow.city}, ${dayShow.state || 'IL'}` : '';
        dropLocationRef.current = cityStr ? `${venueName} at ${cityStr}` : venueName;
      } else {
        dropLocationRef.current = '';
      }

      dropNotesRef.current = '';
      setEditingShiftId(null);

      // Load existing shifts for this crew member on this day if any
      let loadedTimeFrames = [{ startHour: 12, endHour: 17, role: defaultRole || 'SERVER', tags: [] as string[] }];
      if (crewId && crewId !== 'openshifts') {
        const existing = schedules.filter(s => s.date === dateStr && s.crewId === crewId && !s.isTimeOff);
        if (existing.length > 0) {
          loadedTimeFrames = existing.map(s => ({
            id: s.id,
            startHour: s.startHour,
            endHour: s.endHour,
            role: s.role,
            tags: s.tags || []
          }));
        }
      }

      setDropStartHour(loadedTimeFrames[0].startHour);
      setDropEndHour(loadedTimeFrames[0].endHour);
      setDropRole(loadedTimeFrames[0].role);
      setDropTimeFrames(loadedTimeFrames);

      // Initialize selectedCrewAssignments
      const initialAssignments: { [key: string]: any } = {};
      if (crewId && crewId !== 'openshifts') {
        initialAssignments[crewId] = {
          active: true,
          customized: false,
          role: loadedTimeFrames[0].role,
          startHour: loadedTimeFrames[0].startHour,
          endHour: loadedTimeFrames[0].endHour,
          timeFrames: structuredClone(loadedTimeFrames)
        };
      }
      setSelectedCrewAssignments(initialAssignments);
    };

    const handleSelectCoverageRequest = (shift: any) => {
      // 1. Calculate the Monday of the shift's week to update currentWeekStart
      const shiftDate = new Date(shift.date + 'T12:00:00');
      if (!isNaN(shiftDate.getTime())) {
        const day = shiftDate.getDay();
        const diff = shiftDate.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(shiftDate.setDate(diff));
        setCurrentWeekStart(monday);
      }

      // Reset onlyShowFitRole filter to true when opening a coverage request
      setOnlyShowFitRole(true);

      // 2. Open the shift modal/sidebar
      handleEditShiftClick(shift);

      // 3. Scroll to the shift and trigger a pulsing visual cue
      setTimeout(() => {
        const element = document.getElementById(`shift-card-${shift.id}`) || document.getElementById(`shift-card-timeline-${shift.id}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
          element.classList.add('coverage-highlight-glow');
          setTimeout(() => {
            element.classList.remove('coverage-highlight-glow');
          }, 4000);
        }
      }, 350);
    };

    const handleEditShiftClick = (shift: any) => {
      setDrawerCrewSearch('');
      setEditingShiftId(shift.id);
      setDraggedCrewMemberId(shift.crewId);
      setActiveDropDay(shift.date);
      setDropStartHour(shift.startHour);
      setDropEndHour(shift.endHour);
      setDropRole(shift.role);
      dropLocationRef.current = shift.location;
      dropNotesRef.current = shift.notes;

      // Load only the specific shift being edited into the drawer
      let loadedTimeFrames = [{ id: shift.id, startHour: shift.startHour, endHour: shift.endHour, role: shift.role, tags: shift.tags || [] }];
      setDropTimeFrames(loadedTimeFrames);

      const initialAssignments: { [key: string]: any } = {};
      if (shift.crewId && shift.crewId !== 'openshifts') {
        initialAssignments[shift.crewId] = {
          active: true,
          customized: true,
          role: shift.role,
          startHour: shift.startHour,
          endHour: shift.endHour,
          timeFrames: structuredClone(loadedTimeFrames)
        };
      }
      setSelectedCrewAssignments(initialAssignments);
    };

    const renderShiftCard = (shift: any, showCrewName: boolean = false) => {
      if (shift.isTimeOff) {
        return (
          <button
            type="button"
            key={shift.id}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleEditShiftClick(shift); } }}
            onClick={(e) => {
              e.stopPropagation();
              handleEditShiftClick(shift);
            }}
            className="wiw-card select-none cursor-pointer rounded-md bg-[#252530] border border-white/10 py-3 px-3 flex items-center justify-center text-center w-full min-h-[60px]"
          >
            <span className="text-[var(--font-size-3xs)] font-extrabold text-white/40 uppercase tracking-wider">
              Time Off All Day
            </span>
          </button>
        );
      }

      const roleStyle = getShiftColor(shift, colorCodingMode);
      const timeLabel = shift.labelOverride || formatTimeStringWIW(shift.startHour, shift.endHour);
      const isBeingDragged = draggedShiftId === shift.id;

      const activeLockingEditor = coEditors.find(ed => ed.isEditing && ed.lockedShiftId === shift.id);
      const showOverlapAvatar = showCrewName;

      return (
        <div
          key={shift.id}
          id={`shift-card-${shift.id}`}
          draggable={!activeLockingEditor}
          onDragStart={(e) => {
            if (activeLockingEditor) {
              e.preventDefault();
              setAlertModal({ isOpen: true, title: 'Shift Locked', message: `${activeLockingEditor.name} is currently editing this shift. Locks auto-release when changes are saved to prevent schedule mix-ups!`, type: 'warning' });
              return;
            }
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
          style={{
            backgroundColor: roleStyle.bg,
            opacity: isBeingDragged ? 0.3 : 1
          }}
          className={`wiw-card group relative select-none rounded-md p-1.5 flex flex-col justify-between shadow-sm text-white ${showCrewName ? 'min-h-[100px]' : 'min-h-[48px]'
            } ${shift.isDraft ? 'wiw-striped' : ''
            } ${activeLockingEditor ? 'ring-2 ring-pink-500/80 shadow-[0_0_12px_rgba(236,72,153,0.5)] animate-pulse' : ''
            }`}
          title={shift.crewId !== 'openshifts' ? (() => {
            const member = crewMembers.find(c => c.id === shift.crewId);
            const name = member?.name || shift.crewName || shift.crewId || '?';
            return `${name}\nRole: ${member?.role || shift.role || 'Crew Member'}\nPhone: ${member?.phone || 'N/A'}\nEmail: ${member?.email || 'N/A'}`;
          })() : 'Open Shift'}
        >
          {activeLockingEditor && (
            <div className="absolute inset-x-0 -top-2 z-20 flex justify-center pointer-events-none">
              <span className="bg-pink-600 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-pink-400 flex items-center gap-1 animate-pulse">
                {activeLockingEditor.name.split(' ')[0]} editing
              </span>
            </div>
          )}

          {/* Action buttons — visible on hover */}
          <div className="absolute top-0.5 right-0.5 flex items-center gap-0.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              aria-label="Edit shift"
              onClick={(e) => {
                e.stopPropagation();
                handleEditShiftClick(shift);
              }}
              className="w-5 h-5 flex items-center justify-center rounded bg-black/50 hover:bg-black/80 text-white/70 hover:text-white transition-colors cursor-pointer border-none backdrop-blur-sm"
              title="Edit shift"
            >
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Delete shift"
              onClick={(e) => {
                e.stopPropagation();
                deleteScheduleItem(shift.id);
              }}
              className="w-5 h-5 flex items-center justify-center rounded bg-black/50 hover:bg-red-600 text-white/70 hover:text-white transition-colors cursor-pointer border-none backdrop-blur-sm"
              title="Delete shift"
            >
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          </div>

          <div
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                handleEditShiftClick(shift);
              }
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (activeLockingEditor) {
                setCoEditorConflictAlert({
                  isOpen: true,
                  editorName: activeLockingEditor.name,
                  shiftTitle: `${shift.role || 'Shift'} (${formatTimeStringWIW(shift.startHour, shift.endHour)})`,
                  changeDesc: `${activeLockingEditor.name} is currently updating this shift parameters in real time.`,
                  timestamp: 'Active right now'
                });
                return;
              }
              handleEditShiftClick(shift);
            }}
            className="w-full h-full flex flex-col justify-between cursor-pointer"
          >
            {!showCrewName ? (
              /* Compact When I Work style for Roster Grid */
              <div className="flex-1 flex flex-col justify-center gap-1 w-full select-none min-h-0">
                <div className="flex items-center justify-between gap-1 w-full min-h-0">
                  <span className="text-[9.5px] font-black tracking-tight text-white whitespace-nowrap">
                    {timeLabel}
                  </span>
                </div>
                <div className="flex flex-wrap gap-0.5 mt-0.5">
                  {shift.role ? (
                    shift.role.split(/[,|/]/).map((r: string) => r.trim()).filter(Boolean).map((singleRole: string) => (
                      <span
                        key={singleRole}
                        className="px-1.5 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wider leading-none bg-purple-500/20 text-purple-300 border border-purple-500/40 select-none truncate max-w-full"
                      >
                        {singleRole}
                      </span>
                    ))
                  ) : null}
                  {shift.tags && shift.tags.length > 0 && shift.tags.flatMap((tag: string) => {
                    if (tag === shift.role || STANDARD_ROLE_TAGS_SET.has(tag.toUpperCase())) return [];
                    return [(
                      <span
                        key={tag}
                        className="px-1.5 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wider leading-none bg-black/40 text-white/80 border border-white/15 select-none"
                      >
                        {tag}
                      </span>
                    )];
                  })}
                </div>
              </div>
            ) : (
              /* Expanded style for Timeline / List / Detail views */
              <div className={`flex flex-col gap-1 w-full ${showOverlapAvatar ? 'pl-3' : ''}`}>
                <div className="flex items-center justify-between font-sans">
                  <span className="text-[var(--font-size-2xs)] font-black uppercase tracking-wider text-white drop-shadow-sm font-sans">{shift.role || 'Shift'}</span>
                  {shift.isDraft && (
                    <span className="text-[9px] bg-yellow-400 text-black px-1 rounded font-black font-sans">DRAFT</span>
                  )}
                </div>
                <div className="text-[var(--font-size-4xs)] font-medium text-white/80 line-clamp-1 font-sans">
                  {shift.location || 'Venue'}
                </div>
                {shift.notes && (
                  <div className="text-[var(--font-size-4xs)] text-white/70 italic line-clamp-1 font-sans">
                    "{shift.notes}"
                  </div>
                )}
              </div>
            )}

            {/* Bottom metadata row */}
            <div className="flex items-center justify-between pt-1 border-t border-white/10 mt-1 font-sans">
              <span className="text-[var(--font-size-4xs)] font-bold text-white/90 font-mono tracking-tight">{timeLabel}</span>
              <div className="flex items-center gap-1">
                {showOverlapAvatar && shift.crewId && shift.crewId !== 'openshifts' && (
                  <div className="w-4 h-4 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-[var(--font-size-5xs)] font-bold uppercase text-white font-sans" title={shift.crewName}>
                    {(shift.crewName || shift.crewId).slice(0, 2).toUpperCase()}
                  </div>
                )}
                {shift.approvalStatus === 'approved' && <span className="text-[10px] text-emerald-400 font-sans" title="Approved">✓</span>}
                {shift.approvalStatus === 'declined' && <span className="text-[10px] text-red-400 font-sans" title="Declined">✕</span>}
                {shift.approvalStatus === 'pending' && <span className="text-[10px] text-amber-400 font-sans" title="Pending">⏳</span>}
              </div>
            </div>
          </div>

          {showOverlapAvatar && (
            <div className="absolute -left-2.5 -bottom-2.5 w-6 h-6 rounded-full border-2 border-[#0f0f13] shadow-md z-20 flex items-center justify-center shrink-0 wiw-tooltip-container">
              {(() => {
                if (shift.crewId === 'openshifts') {
                  return (
                    <div className="w-full h-full flex items-center justify-center text-[var(--color-accent)] bg-[#102a1e] rounded-full overflow-hidden">
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
                      alt="7th Heaven Media"
                      className="w-full h-full object-cover rounded-full overflow-hidden"
                    />
                  );
                }
                const initials = member?.initials || displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
                const color = member?.color || getAvatarColor(displayName);
                return (
                  <div
                    className="w-full h-full flex items-center justify-center font-bold text-[var(--font-size-4xs)] text-white rounded-full overflow-hidden"
                    style={{ backgroundColor: color }}
                  >
                    {initials}
                  </div>
                );
              })()}

              {shift.crewId !== 'openshifts' && (() => {
                const member = crewMembers.find(c => c.id === shift.crewId);
                const displayName = member?.name || shift.crewName || shift.crewId || '?';
                return (
                  <div className="wiw-tooltip bg-[#1c1d22] text-white p-3 rounded-lg shadow-xl text-left border border-slate-700/50 w-52 leading-relaxed font-sans text-xs">
                    <div className="font-bold text-slate-200 text-xs mb-0.5">{displayName}</div>
                    <div className="text-purple-300 font-extrabold text-[var(--font-size-4xs)] uppercase tracking-wider mb-2">
                      Role: {member?.role || shift.role || 'Crew Member'}
                    </div>
                    <div className="text-slate-400 text-[var(--font-size-3xs)] space-y-1 border-t border-slate-700/50 pt-1.5 font-mono">
                      <div className="flex items-center gap-1.5">
                        <span></span>
                        <span className="truncate">{member?.email || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span></span>
                        <span>{member?.phone || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {showCrewName && (
            <div className="flex items-center gap-1.5 mt-1.5 pt-1.5 border-t border-white/10 w-full">
              {shift.crewId === 'openshifts' ? (
                <>
                  <div className="w-4 h-4 rounded-full border border-emerald-500 bg-emerald-500/10 flex items-center justify-center text-[var(--color-accent)] font-bold shrink-0 text-[var(--font-size-5xs)]">

                  </div>
                  <span className="text-[var(--font-size-4xs)] font-black uppercase tracking-wider text-[var(--color-accent)] truncate">
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
                          alt="7th Heaven Media"
                          className="w-4 h-4 rounded-full object-cover shrink-0"
                        />
                      );
                    }
                    const initials = member?.initials || displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
                    const color = member?.color || getAvatarColor(displayName);
                    return (
                      <div
                        className="w-4 h-4 rounded-full flex items-center justify-center font-bold text-[var(--font-size-5xs)] shrink-0 text-white"
                        style={{ backgroundColor: color }}
                      >
                        {initials}
                      </div>
                    );
                  })()}

                  <span className="text-[var(--font-size-4xs)] font-black uppercase tracking-wider text-white/85 truncate">
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
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white font-black text-[var(--font-size-4xs)] w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-md animate-pulse">
              {shift.openSlots}
            </span>
          )}
        </div>
      );
    };

    const renderRosterBoard = () => {
      const renderRoleBadges = (roleStr: string) => {
        const roles = (roleStr || 'Crew').split(/[,|/]/).flatMap(r => { const t = r.trim(); return t ? [t] : []; });
        return roles.map((r, idx) => {
          const upper = r.toUpperCase();
          let colorClass = "text-white/45 bg-white/5 border-white/10";
          if (upper.includes("AUDIO") || upper.includes("MIX")) {
            colorClass = "text-violet-400 bg-violet-500/10 border-violet-500/25";
          } else if (upper.includes("SERVER") || upper.includes("HOST")) {
            colorClass = "text-pink-400 bg-pink-500/10 border-pink-500/25";
          } else if (upper.includes("CHEF") || upper.includes("COOK")) {
            colorClass = "text-emerald-400 bg-emerald-500/10 border-emerald-500/25";
          } else if (upper.includes("MANAGER")) {
            colorClass = "text-purple-300 bg-purple-500/10 border-purple-500/25";
          } else if (upper.includes("BUSSER")) {
            colorClass = "text-sky-400 bg-sky-500/10 border-sky-500/25";
          }
          return (
            <span
              key={r}
              className={`inline-block px-1.5 py-0.5 text-[8.5px] font-black uppercase tracking-tight rounded border leading-none shrink-0 ${colorClass}`}
            >
              {r}
            </span>
          );
        });
      };

      const collapsedCrewIdsSet = new Set(collapsedCrewIds);

      return (
        <div
          data-lenis-prevent="true"
          data-lenis-prevent-wheel="true"
          data-lenis-prevent-touch="true"
          className="w-full flex-1 min-h-0 overflow-auto border-x border-t-0 border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-color)] shadow-sm relative"
          style={{ overscrollBehavior: "contain", touchAction: "pan-x pan-y" }}
        >
          <table
            style={{ minWidth: filteredDays.length <= 2 ? 'auto' : `${176 + filteredDays.length * 144}px` }}
            className="w-full border-separate border-spacing-0 text-left select-none table-fixed bg-transparent text-[var(--text-color)]"
          >
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-transparent text-[var(--text-color)] text-[10px] font-extrabold tracking-wider">
                <th className="p-2 w-44 border-r border-[var(--border-color)] border-b border-[var(--border-color)] uppercase text-[var(--text-color)] font-extrabold text-[10px] wiw-sticky-corner bg-transparent">First Name</th>
                {filteredDays.map((day, idx) => {
                  const dayShow = getDayShow(day.dateStr);
                  const isNextShow = day.dateStr === nextShowDate;
                  return (
                    <th
                      key={day.dateStr}
                      id={`col-header-${day.dateStr}`}
                      onClick={() => {
                        const nextDate = (selectedTourDate === day.dateStr || scheduleSortByDate === day.dateStr) ? null : day.dateStr;
                        setSelectedTourDate(nextDate);
                        setScheduleSortByDate(nextDate);
                      }}
                      className={`p-2 w-36 border-r border-[var(--border-color)] border-b border-[var(--border-color)] relative group wiw-sticky-header transition-colors duration-200 cursor-pointer ${(selectedTourDate === day.dateStr || scheduleSortByDate === day.dateStr)
                        ? 'bg-purple-500/20 text-purple-300 font-black shadow-[inset_0_-3px_0_#9333ea]'
                        : isNextShow
                          ? 'bg-purple-500/10 text-purple-300 font-black border-x border-purple-500/30 shadow-[inset_0_1px_0_rgba(147,51,234,0.2)]'
                          : 'text-[var(--text-color)] hover:  '
                        }`}
                      title="Click to select date & stack working crew at top"
                    >
                      <div className="flex flex-col gap-1 w-full">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[var(--text-color)] font-black text-[10px]">{getDayLabelOverride(day.dateStr, idx)}</span>
                            {isNextShow && (
                              <span className="text-[9px] bg-purple-600 text-white px-1 py-0.5 rounded font-black uppercase tracking-widest scale-[0.85] origin-left select-none">
                                NEXT
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTextAssignedCrew(day.dateStr);
                              }}
                              className="p-0.5 hover:bg-purple-500/10 rounded  text-[var(--color-accent)] hover:text-purple-300 border-none bg-transparent cursor-pointer"
                              title="Alert assigned crew for this show"
                            >
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setScheduleSortByDate(prev => prev === day.dateStr ? null : day.dateStr);
                              }}
                              className={`p-0.5 rounded border-none bg-transparent cursor-pointer transition-colors ${scheduleSortByDate === day.dateStr
                                ? 'bg-purple-500/20 text-purple-300 font-extrabold'
                                : 'text-[var(--muted-text)] hover:text-[var(--text-color)] hover:  '
                                }`}
                              title={scheduleSortByDate === day.dateStr ? "Reset crew sorting" : "Sort working crew to the top"}
                            >
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 19V5" /><polyline points="5 12 12 5 19 12" /></svg>
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
                            className="mt-1 w-full text-[9px] font-bold uppercase text-purple-300 hover:text-white bg-purple-500/10 hover:bg-purple-500/30 border border-purple-500/20 px-1.5 py-0.5 rounded truncate select-none transition-colors cursor-pointer flex items-center justify-center gap-1"
                            title={`Click to view crew working at ${dayShow.venue || dayShow.venue_name}`}
                          >
                            {dayShow.venue || dayShow.venue_name}
                          </button>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
              {/* Row 1: OpenShifts */}
              {!scheduleCrewFilter && !schedulePersonSearch.trim() && (
                <tr className="border-b border-[var(--border-color)] transition-colors bg-[#0f0f13]">
                  <td className="p-1 border-r border-b border-[var(--border-color)] align-middle wiw-sticky-col bg-[#0f0f13]">
                    <div className="flex items-center gap-2 pl-1">
                      <div className="w-6 h-6 rounded-full border border-emerald-600 bg-emerald-500/10 flex items-center justify-center text-[var(--color-accent)] font-bold shrink-0 shadow-xs">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="4" /></svg>
                      </div>
                      <div>
                        <span className="text-xs font-black text-[var(--text-color)] block leading-tight">OpenShifts</span>
                        <span className="text-[9px] text-[var(--muted-text)] font-extrabold uppercase tracking-wider leading-none">Positions</span>
                      </div>
                    </div>
                  </td>
                  {filteredDays.map(day => {
                    const isSelectedDay = selectedTourDate === day.dateStr;
                    const isNextShow = day.dateStr === nextShowDate;
                    return (
                      <td
                        key={day.dateStr}
                        className={`p-1 border-r border-b border-[var(--border-color)] align-top relative hover:   transition-colors cursor-pointer ${isSelectedDay
                          ? 'bg-purple-500/10 border-x border-purple-500/30'
                          : isNextShow
                            ? 'bg-purple-500/10 border-x border-purple-500/20'
                            : 'bg-transparent'
                          }`}
                        onDragOver={(e) => {
                          e.preventDefault();
                          if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
                        }}
                        onDrop={(e) => handleDropOnCell(e, day.dateStr, 'openshifts')}
                      >
                        <div className="flex flex-col gap-1.5 h-full w-full select-none min-h-[48px]" onClick={(e) => e.stopPropagation()}>
                          {/* Top Box: Add Crew Member */}
                          <div
                            role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleCellClick(day.dateStr, "openshifts", "SERVER"); } }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCellClick(day.dateStr, "openshifts", "SERVER");
                            }}
                            className="w-full py-1 flex flex-col items-center justify-center border border-dashed border-emerald-500/40 hover:border-emerald-400 rounded bg-transparent hover:bg-emerald-500/10 transition-colors cursor-pointer group shadow-2xs"
                          >
                            <span className="text-[10px] text-[var(--color-accent)] font-bold group-hover:text-emerald-300 transition-colors">+</span>
                            <span className="text-[8px] font-bold uppercase tracking-wider text-[var(--color-accent)] group-hover:text-emerald-300 transition-colors mt-0.5">
                              Add Crew Member
                            </span>
                          </div>

                          {/* Bottom Row: Split in 2 */}
                          <div className="flex gap-1 w-full relative">
                            {/* Left Box: Add Crew Group */}
                            <div
                              role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setCellGroupPopover(prev => prev === `openshifts_group_${day.dateStr}` ? null : `openshifts_group_${day.dateStr}`); } }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setCellGroupPopover(prev => prev === `openshifts_group_${day.dateStr}` ? null : `openshifts_group_${day.dateStr}`);
                              }}
                              className="flex-1 py-1 flex flex-col items-center justify-center border border-dashed border-emerald-500/40 hover:border-emerald-400 rounded bg-transparent hover:bg-emerald-500/10 transition-colors cursor-pointer group shadow-2xs"
                            >
                              <span className="text-[10px] text-[var(--color-accent)] font-bold group-hover:text-emerald-300 transition-colors">+</span>
                              <span className="text-[8px] font-bold uppercase tracking-wider text-[var(--color-accent)] group-hover:text-emerald-300 transition-colors mt-0.5 text-center leading-tight">
                                Add Crew Group
                              </span>
                            </div>

                            {/* Right Box: Create Group */}
                            <div
                              role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); createGroupForDateRef.current = day.dateStr; } }}
                              onClick={(e) => {
                                e.stopPropagation();
                                createGroupForDateRef.current = day.dateStr;
                                const initialSettings: any = {};
                                crewMembers.forEach(m => {
                                  if (m.id === 'openshifts') return;
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
                              className="flex-1 py-1 flex flex-col items-center justify-center border border-dashed border-emerald-500/40 hover:border-emerald-400 rounded bg-transparent hover:bg-emerald-500/10 transition-colors cursor-pointer group shadow-2xs"
                            >
                              <span className="text-[10px] text-[var(--color-accent)] font-bold group-hover:text-emerald-300 transition-colors">+</span>
                              <span className="text-[8px] font-bold uppercase tracking-wider text-[var(--color-accent)] group-hover:text-emerald-300 transition-colors mt-0.5 text-center leading-tight">
                                Create Group
                              </span>
                            </div>

                            {/* Saved groups list popover when Add Crew Group is clicked */}
                            {cellGroupPopover === `openshifts_group_${day.dateStr}` && (
                              <div
                                data-group-popover-cell
                                className="absolute left-1/2 bottom-full mb-1 -translate-x-1/2 w-48 bg-[var(--card-bg)] border border-[var(--border-color)] shadow-xl p-2 z-50 flex flex-col gap-1 animate-[scaleIn_0.15s_ease]"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="text-[9px] text-[var(--muted-text)] uppercase tracking-widest font-black px-2 py-1 border-b border-[var(--border-color)] mb-1">
                                  Select Crew Group
                                </div>
                                {crewGroups.length === 0 ? (
                                  <span className="text-[9px] text-[var(--muted-text)] opacity-60 italic px-2 py-0.5">No saved groups</span>
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
                                      className="w-full text-left px-2 py-1 rounded hover:bg-emerald-500/10 text-[9px] text-[var(--color-accent)] font-semibold transition-colors cursor-pointer border-none bg-transparent truncate flex items-center gap-1.5"
                                      title={`Apply Group: ${g.name}`}
                                    >
                                      <span className="text-[10px] font-mono text-[var(--color-accent)]">+</span>
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
              )}
            </thead>
            <tbody>
              {/* Crew Rows — individually collapsible */}
              {(() => {
                const activeWeekDateSet = new Set(next7Days.map(d => d.dateStr));
                return filteredCrewMembers.map(member => {
                  const totalHours = getCrewScheduledHours(member.id, next7Days);
                  const monthHours = getCrewScheduledHoursForMonth(member.id, currentWeekStart);
                  const hoursStatus = getCrewHoursStatus(member.id, totalHours);
                  const hasExclamation = member.id === 'arjun' || member.id === 'dave_croke';
                  const collapsedCrewIdsSet = new Set(collapsedCrewIds);
                  const isCollapsed = collapsedCrewIdsSet.has(member.id);
                  const activeSortDate = scheduleSortByDate || selectedTourDate;
                  const isWorkingOnActiveDate = activeSortDate ? schedules.some(s => s.date === activeSortDate && s.crewId === member.id && !s.isTimeOff && s.crewId !== 'openshifts') : false;

                  return (
                    <tr key={member.id} className={`border-b border-[var(--border-color)] transition-colors ${isWorkingOnActiveDate ? 'bg-emerald-500/10' : 'hover:bg-white/[0.02]'}`}>
                      <td className={`p-2 border-r border-b border-[var(--border-color)] align-top relative wiw-sticky-col ${isWorkingOnActiveDate ? 'bg-emerald-500/10! shadow-[inset_3px_0_0_#10b981]' : 'bg-transparent'}`}>
                        <div className="flex items-center gap-2.5">
                          {hasExclamation && (
                            <div className="absolute left-1 top-1/2 -translate-y-1/2  text-[var(--color-accent)]" title="Warning: Schedule issues">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" /></svg>
                            </div>
                          )}
                          <CrewAvatar member={member} />
                          <div className="min-w-0 wiw-tooltip-container flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <p className="text-[11px] font-black text-[var(--text-color)] truncate leading-tight">{member.name}</p>
                              {isWorkingOnActiveDate && (
                                <span className="text-[7.5px] font-black uppercase tracking-wider px-1 py-0.5 rounded bg-emerald-500/20 text-[var(--color-accent)] border border-emerald-500/30 shrink-0 shadow-2xs">
                                  Working
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                              {hoursStatus.status !== 'ok' ? (
                                <span className="text-[9px] text-rose-500 font-extrabold flex items-center gap-1 leading-none cursor-help" title={`Scheduled: ${totalHours}h (Max: ${hoursStatus.maxHours}h) — ${hoursStatus.over}h over max!`}>
                                  <span className="font-mono">{totalHours}h</span>
                                </span>
                              ) : (
                                <span className="text-[9px] text-[var(--muted-text)] font-bold font-mono leading-none">
                                  {totalHours}h
                                </span>
                              )}
                              {renderRoleBadges(member.role)}
                            </div>

                            <div className="mt-1 text-[8px] text-[var(--muted-text)] font-mono space-y-0.5 leading-tight font-medium">
                              {member.phone && <div className="truncate text-[var(--muted-text)]" title={member.phone}> {member.phone}</div>}
                              {member.email && <div className="truncate text-[var(--muted-text)]" title={member.email}> {member.email}</div>}
                            </div>

                            <div className="wiw-tooltip bg-[var(--card-bg)] text-[var(--text-color)] p-3 rounded-lg shadow-xl text-left border border-[var(--border-color)] w-52 leading-relaxed font-sans text-xs">
                              <div className="font-bold text-[var(--text-color)] text-xs mb-0.5">{member.name}</div>
                              <div className=" text-[var(--color-accent)] font-extrabold text-[9px] uppercase tracking-wider mb-2">
                                Role: {member.role || 'Crew Member'}
                              </div>
                              <div className="text-[var(--muted-text)] text-[9px] space-y-1 border-t border-[var(--border-color)] pt-1.5 font-mono">
                                <div className="flex items-center gap-1.5">
                                  <span></span>
                                  <span className="truncate">{member.email || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span></span>
                                  <span>{member.phone || 'N/A'}</span>
                                </div>
                              </div>
                              {hoursStatus.status !== 'ok' && (
                                <div className="mt-2.5 pt-2 border-t border-[var(--border-color)] text-[9px] text-[var(--muted-text)]">
                                  <div className="font-bold text-[var(--text-color)]">Hours Alert:</div>
                                  <div>Scheduled: {totalHours}h (Max: {hoursStatus.maxHours}h)</div>
                                  <div className="text-rose-500 font-bold mt-0.5 flex items-center gap-1">
                                    <span></span> {hoursStatus.over} hours over max
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {filteredDays.map(day => {
                        const dayShifts = schedulesByDateAndCrew[day.dateStr]?.[member.id] || [];
                        const isSelectedDay = selectedTourDate === day.dateStr;
                        const isNextShow = day.dateStr === nextShowDate;
                        return (
                          <td
                            key={day.dateStr}
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                handleCellClick(day.dateStr, member.id, member.role || 'SERVER');
                              }
                            }}
                            className={`p-1 border-r border-b border-[var(--border-color)] align-top relative hover:   transition-colors cursor-pointer group ${isSelectedDay
                              ? 'bg-purple-500/10 border-x border-purple-500/30'
                              : isNextShow
                                ? 'bg-purple-500/10 border-x border-purple-500/20'
                                : 'bg-[var(--card-bg)]'
                              }`}
                            onDragOver={(e) => {
                              e.preventDefault();
                              if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
                            }}
                            onDrop={(e) => handleDropOnCell(e, day.dateStr, member.id)}
                            onClick={() => handleCellClick(day.dateStr, member.id, member.role || 'SERVER')}
                          >
                            <div className="flex flex-col gap-1.5 min-h-[48px] w-full">
                              {dayShifts.map(shift => renderShiftCard(shift))}
                            </div>
                            {dayShifts.length > 0 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCellClick(day.dateStr, member.id, member.role || 'SERVER');
                                }}
                                className="opacity-0 group-hover:opacity-100 mt-1 w-full py-0.5 flex items-center justify-center gap-1 text-[8px] font-bold text-slate-600 hover:text-black bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded transition-colors cursor-pointer"
                              >
                                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                                + ADD
                              </button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              })()}


            </tbody>
          </table>
        </div>
      );
    };

    const renderListBoard = () => {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3 select-none">
          {filteredDays.map(day => {
            const shiftsForDay = schedulesByDate[day.dateStr] || [];
            const dayShifts = scheduleCrewFilter ? shiftsForDay.filter(s => s.crewId === scheduleCrewFilter || s.crewId === 'openshifts') : shiftsForDay;
            const sortedShifts = [...dayShifts].sort((a, b) => a.startHour - b.startHour);
            const isHovered = activeDropDay === day.dateStr && draggedCrewMemberId;

            return (
              <div
                key={day.dateStr}
                className={` border p-2.5 bg-black/40 flex flex-col min-h-[350px] transition-colors shadow-sm ${isHovered ? 'bg-purple-500/10 border-purple-500/30' : 'border-white/5'
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

                    // Overlap validation
                    const draggedShift = schedules.find(s => s.id === shiftId);
                    if (draggedShift && draggedShift.crewId !== 'openshifts') {
                      const overlapping = getOverlappingShifts(draggedShift.crewId, day.dateStr, draggedShift.startHour, draggedShift.endHour, shiftId);
                      if (overlapping.length > 0) {
                        const member = crewMembers.find(c => c.id === draggedShift.crewId);
                        const memberName = member ? member.name : draggedShift.crewId;
                        showAlert(`Cannot move shift: ${memberName} already has an overlapping shift (${overlapping[0].time}) scheduled on ${day.dateStr}.`, "Shift Move Error", "error");
                        return;
                      }
                    }

                    setSchedules(current => {
                      return current.map(s => {
                        if (s.id === shiftId) {
                          return { ...s, date: day.dateStr };
                        }
                        return s;
                      });
                    });
                  }
                }}
              >
                <div className="text-center pb-2 border-b border-white/5 mb-2 flex flex-col items-center">
                  <span className="text-[var(--font-size-4xs)] uppercase font-bold tracking-widest text-white/30 block">{day.dayName}</span>
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
                        className="mt-1 w-full text-[8.5px] font-black uppercase text-purple-300 hover:text-white bg-purple-500/10 hover:bg-purple-500/30 border border-purple-500/20 hover:border-purple-500/40 px-1.5 py-0.5 rounded truncate max-w-full cursor-pointer transition-colors flex items-center justify-center gap-1"
                        title={`Click to view crew working at ${dayShow.venue || dayShow.venue_name}`}
                      >
                        {dayShow.venue || dayShow.venue_name}
                      </button>
                    );
                  })()}
                </div>

                <div className="flex-1 flex flex-col gap-2">
                  {sortedShifts.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center border border-dashed border-white/5 rounded-lg p-4 bg-black/20">
                      <span className="text-[var(--font-size-3xs)] text-white/30 italic font-medium">Empty</span>
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
        <div className="flex flex-col flex-1 min-h-0 bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--text-color)] p-4 select-none">
          <div className="flex select-none">
            <div className="w-14 shrink-0" />
            <div className="flex-1 grid grid-cols-7 gap-2 text-center pb-2 border-b border-[var(--border-color)] mb-2">
              {filteredDays.map((day) => {
                const count = (schedulesByDate[day.dateStr] || []).length;
                return (
                  <div key={day.dateStr} className="min-w-0 flex flex-col items-center justify-start">
                    <p className="text-[var(--font-size-3xs)] uppercase font-bold tracking-wider text-[var(--muted-text)]">{day.dayName}</p>
                    <p className="text-xs font-bold text-[var(--text-color)] mt-0.5">{day.monthName} {day.dayOfMonth}</p>
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
                          className="mt-1 w-full text-[7.5px] font-black uppercase text-purple-300 hover:text-white bg-purple-500/10 hover:bg-purple-500/30 border border-purple-500/20 hover:border-purple-500/40 px-1 py-0.2 rounded truncate max-w-full cursor-pointer transition-colors flex items-center justify-center gap-1 text-center"
                          title={`Click to view crew working at ${dayShow.venue || dayShow.venue_name}`}
                        >
                          {dayShow.venue || dayShow.venue_name}
                        </button>
                      );
                    })()}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex relative">
            <div className="w-14 shrink-0 h-[480px] relative flex flex-col justify-between text-[var(--font-size-4xs)] font-bold text-[var(--muted-text)] pr-2 pt-0.5 select-none z-10 pointer-events-none">
              {hoursAxis.map((h) => (
                <div key={h} className="h-0 flex items-center justify-end leading-none">
                  {formatHour(h)}
                </div>
              ))}
            </div>

            <div className="flex-1 h-[480px] relative grid grid-cols-7 gap-2 bg-[var(--card-bg)] border border-[var(--border-color)] overflow-hidden p-0">
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                {Array.from({ length: 17 }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-full h-0 border-b ${idx % 2 === 0
                      ? 'border-white/10 border-solid'
                      : 'border-white/5 border-dashed'
                      }`}
                  />
                ))}
              </div>

              {filteredDays.map((day) => {
                const dayShifts = (schedulesByDate[day.dateStr] || []).filter(s => s.crewId !== 'openshifts');
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

                        // Overlap validation
                        const draggedShift = schedules.find(s => s.id === shiftId);
                        if (draggedShift && draggedShift.crewId !== 'openshifts') {
                          const overlapping = getOverlappingShifts(draggedShift.crewId, day.dateStr, draggedShift.startHour, draggedShift.endHour, shiftId);
                          if (overlapping.length > 0) {
                            const member = crewMembers.find(c => c.id === draggedShift.crewId);
                            const memberName = member ? member.name : draggedShift.crewId;
                            showAlert(`Cannot move shift: ${memberName} already has an overlapping shift (${overlapping[0].time}) scheduled on ${day.dateStr}.`, "Shift Move Error", "error");
                            return;
                          }
                        }

                        setSchedules(current => {
                          const updated = current.map(s => {
                            if (s.id === shiftId) {
                              return { ...s, date: day.dateStr };
                            }
                            return s;
                          });
                          return updated;
                        });
                      }
                    }}
                  >
                    {dayShifts.map(shift => {
                      const topPct = ((shift.startHour - 8) / 16) * 100;
                      const heightPct = ((shift.endHour - shift.startHour) / 16) * 100;
                      const roleStyle = getShiftColor(shift, colorCodingMode);
                      return (
                        <div
                          key={shift.id}
                          id={`shift-card-timeline-${shift.id}`}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              e.stopPropagation();
                              handleEditShiftClick(shift);
                            }
                          }}
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
                          className={`wiw-card text-white p-1 rounded-md text-[var(--font-size-4xs)] font-bold overflow-hidden cursor-pointer shadow-sm ${shift.isDraft ? 'wiw-striped' : ''
                            }`}
                        >
                          <div className="truncate">{shift.crewName}</div>
                          <div className="text-purple-300 font-extrabold text-[var(--font-size-5xs)] uppercase truncate">{shift.role || 'Crew'}</div>
                          <div className="opacity-80 text-[var(--font-size-4xs)]">{formatTimeStringWIW(shift.startHour, shift.endHour)}</div>
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
      <section className="overflow-hidden">
        <style>{`
          .wiw-scheduler-container {
            color: #ffffff;
            font-family: var(--font-barlow), 'Barlow', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
          }
          .wiw-scheduler-container ::-webkit-scrollbar {
            width: 10px;
            height: 10px;
            display: block !important;
          }
          .wiw-scheduler-container ::-webkit-scrollbar-track {
            background: rgba(15, 15, 19, 0.9);
            border-radius: 6px;
          }
          .wiw-scheduler-container ::-webkit-scrollbar-thumb {
            background: rgba(147, 51, 234, 0.4);
            border-radius: 6px;
            border: 2px solid rgba(15, 15, 19, 0.9);
          }
          .wiw-scheduler-container ::-webkit-scrollbar-thumb:hover {
            background: rgba(147, 51, 234, 0.8);
          }
          .wiw-scheduler-container td, .wiw-scheduler-container th {
            border-style: solid;
            border-width: 1px !important;
            border-color: #ffffff1f !important;
          }
          .wiw-scheduler-container thead {
            position: sticky;
            top: 0;
            z-index: 30;
            background-color: rgba(15, 15, 19, 0.95) !important;
            backdrop-filter: blur(12px) !important;
            -webkit-backdrop-filter: blur(12px) !important;
          }
          .wiw-sticky-header {
            position: sticky;
            top: 0;
            z-index: 30;
            background-color: rgba(15, 15, 19, 0.85) !important;
            backdrop-filter: blur(12px) !important;
            -webkit-backdrop-filter: blur(12px) !important;
            color: var(--text-color) !important;
          }
          .wiw-sticky-col {
            position: sticky;
            left: 0;
            z-index: 20;
            background-color: rgba(15, 15, 19, 0.5) !important;
            backdrop-filter: blur(12px) !important;
            -webkit-backdrop-filter: blur(12px) !important;
            color: var(--text-color) !important;
          }
          .wiw-sticky-corner {
            position: sticky;
            top: 0;
            left: 0;
            z-index: 40;
            background-color: rgba(15, 15, 19, 0.85) !important;
            backdrop-filter: blur(12px) !important;
            -webkit-backdrop-filter: blur(12px) !important;
            color: var(--text-color) !important;
          }
          .wiw-sticky-header-2 {
            position: sticky;
            top: 46px;
            z-index: 30;
            background-color: rgba(15, 15, 19, 0.85) !important;
            backdrop-filter: blur(12px) !important;
            -webkit-backdrop-filter: blur(12px) !important;
            color: var(--text-color) !important;
          }
          .wiw-sticky-corner-2 {
            position: sticky;
            top: 46px;
            left: 0;
            z-index: 40;
            background-color: rgba(15, 15, 19, 0.85) !important;
            backdrop-filter: blur(12px) !important;
            -webkit-backdrop-filter: blur(12px) !important;
            color: var(--text-color) !important;
          }
          tr:hover .wiw-sticky-col {
            background-color: var(--bg-color) !important;
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
          @keyframes slideDown {
            from { opacity: 0; transform: translateY(-8px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        {/* Section Header */}
        <div role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleSection('calendar'); } }} onClick={() => toggleSection('calendar')} className="py-6 pr-6 pl-0 border-b border-white/5 flex items-center justify-between cursor-pointer select-none transition-colors text-white">
          <div className="flex items-center gap-2">
            <div className="drag-handle cursor-grab active:cursor-grabbing py-1.5 pr-1.5 pl-0 hover:bg-white/5 rounded text-white/20 hover:text-white/50 transition-colors shrink-0 mr-1" title="Drag to reorder section" onClick={(e) => e.stopPropagation()}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="9" cy="19" r="1" /><circle cx="15" cy="5" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="19" r="1" /></svg>
            </div>
            <h3 className="cursor-pointer text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <span></span> Crew Work Schedule Calendar
              {renderInfoToggle('calendar')}
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[var(--font-size-3xs)] text-white/50 font-bold uppercase tracking-widest bg-white/5 px-2.5 py-1 rounded">Roster Schedule</span>
            <div className={"w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center transition-transform duration-300 " + (isSectionOpen('calendar') ? 'rotate-0' : '-rotate-90')}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40"><path d="M2 4l4 4 4-4" /></svg>
            </div>
          </div>
        </div>
        {renderInfoBanner('calendar', 'Crew Work Schedule Calendar', 'Schedule band/crew work shifts, manage open roles, publish shifts, and prevent overlaps in a weekly/monthly timeline.')}

        <div style={{ display: isSectionOpen('calendar') ? undefined : 'none' }}>
          {/*  Live Co-Editor Presence & Mix-up Prevention Status Bar */}
          <div className="border-b border-[var(--color-accent)]/30 pr-6 py-2.5 flex items-center justify-between gap-4 select-none">
            <div className="flex items-center gap-3 flex-wrap text-xs">
              <span className="flex items-center gap-2 font-bold text-[var(--color-accent)]">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                LIVE CO-EDITING SYNC
              </span>
              <span className="text-white/30 font-light">|</span>
              <div className="flex items-center gap-2">
                <span className="text-white/60 text-[11px]">Active Editors:</span>
                {coEditors.map(ed => (
                  <span key={ed.id} className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${ed.isEditing ? 'bg-pink-500/15 border-pink-500/40 text-pink-300 shadow-[0_0_8px_rgba(236,72,153,0.3)]' : 'bg-blue-500/15 border-blue-500/30 text-blue-300'}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                    {ed.name} {ed.isEditing ? ' (Editing shift)' : '(Viewing)'}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setCoEditorConflictAlert({
                    isOpen: true,
                    editorName: 'Marcus Vance',
                    shiftTitle: 'Sound Engineer (Tue Aug 4)',
                    changeDesc: 'Shift updated from 1p-6:30p to 2p-8p while you were viewing the roster!',
                    timestamp: 'Just now'
                  });
                }}
                className="px-2.5 py-1 bg-purple-500/15 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[11px] font-bold rounded transition-colors cursor-pointer flex items-center gap-1"
                title="Simulate concurrent editing conflict (schedule mix-up) to test live sync warning"
              >
                Simulate Mix-Up Conflict
              </button>
              <button
                type="button"
                onClick={() => setShowCoEditorModal(true)}
                className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-[11px] font-bold rounded transition-colors cursor-pointer flex items-center gap-1"
              >
                Co-Editor Settings
              </button>
            </div>
          </div>

          {/*  Schedule Mix-Up Conflict Resolution Modal */}
          {coEditorConflictAlert?.isOpen && (
            <div className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
              <div className="bg-[#1e1e26] border-2 border-purple-500/50 p-6 max-w-lg w-full shadow-[0_0_50px_rgba(147, 51, 234,0.3)] space-y-4">
                <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                  <div className="w-10 h-10 bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-xl shrink-0">

                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white tracking-tight">Schedule Mix-Up Prevented!</h3>
                    <p className="text-xs text-purple-300/80 font-medium">Concurrent Edit Detected from Co-Editor</p>
                  </div>
                </div>

                <div className="bg-black/50 border border-white/10 p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-white/50">
                    <span>Editor: <strong className="text-white">{coEditorConflictAlert.editorName}</strong></span>
                    <span className="text-[10px] text-white/40">{coEditorConflictAlert.timestamp}</span>
                  </div>
                  <div className="text-sm font-bold text-pink-300">
                    Shift: {coEditorConflictAlert.shiftTitle}
                  </div>
                  <p className="text-white/80 leading-relaxed bg-white/5 p-2.5 rounded border border-white/5">
                    {coEditorConflictAlert.changeDesc}
                  </p>
                </div>

                <p className="text-[11px] text-white/50 italic">
                  Live presence prevents double-bookings & timeline mix-ups by automatically syncing modifications made by other admins.
                </p>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCoEditorConflictAlert(null)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                  >
                    Accept Remote Sync
                  </button>
                </div>
              </div>
            </div>
          )}

          {/*  Co-Editors Settings & Live Active List Modal */}
          {showCoEditorModal && (
            <div className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
              <div className="bg-[#181820] border border-white/10 p-6 max-w-md w-full space-y-5">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span></span> Active Co-Editors & Lock Status
                  </h3>
                  <button aria-label="Close co-editor modal" onClick={() => setShowCoEditorModal(false)} className="text-white/40 hover:text-white text-lg">✕</button>
                </div>

                <div className="space-y-3">
                  {coEditors.map(ed => (
                    <div key={ed.id} className="p-3 bg-black/40 border border-white/5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-pink-500/20 border border-pink-500/40 text-pink-300 font-black text-xs flex items-center justify-center">
                          {ed.avatar}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            {ed.name}
                            <span className="text-[10px] text-white/40">({ed.role})</span>
                          </div>
                          <div className="text-[10px] text-white/50">{ed.lastAction}</div>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 text-[9px] font-black rounded uppercase ${ed.isEditing ? 'bg-pink-500/20 text-pink-400 border border-pink-500/40' : 'bg-emerald-500/20 text-[var(--color-accent)] border border-emerald-500/40'}`}>
                        {ed.isEditing ? ' Shift Locked' : '🟢 Viewing'}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-emerald-500/10 border  border-[var(--color-accent)]/30 text-xs text-emerald-300 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Conflict Prevention Active
                  </div>
                  <p className="text-[11px] text-emerald-200/70">
                    If another team member edits a shift while you are viewing, real-time locks and notifications prevent scheduling mix-ups.
                  </p>
                </div>

                <div className="flex items-center justify-end">
                  <button
                    onClick={() => setShowCoEditorModal(false)}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          <div data-lenis-prevent="true" data-lenis-prevent-wheel="true" data-lenis-prevent-touch="true" className="wiw-scheduler-container min-h-[1400px] h-[1400px] flex flex-col min-h-0">

            {/* Header controls (Date range, prev/next, today, action icons) */}
            <div className="border-b border-white/5 pr-4 pb-4 pt-4 flex flex-col lg:flex-row items-center justify-between gap-4 select-none text-white shrink-0">
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
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                  </button>
                  <input
                    type="date"
                    id="wiw-date-picker"
                    aria-label="Select date"
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
                  className={`px-3 py-1.5 border text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer border-solid ${calendarRange === 'month'
                    ? 'bg-purple-500/10 border-purple-500/30 text-purple-300 hover:bg-purple-500/20'
                    : 'border-white/10 bg-black/40 hover:bg-white/5 text-white/70 hover:text-white'
                    }`}
                >
                  MONTH
                </button>

                <div className="relative">
                  <select
                    aria-label="Calendar view range"
                    value={(() => {
                      if (calendarRange === '4weeks') return '4weeks';
                      if (calendarRange === 'month') return 'month';
                      if (thisMondayTime === null) return 'current';

                      const time = currentWeekStart.getTime();
                      if (time === thisMondayTime) return 'current';
                      if (time === thisMondayTime + 7 * 86400000) return 'next';
                      if (time === thisMondayTime + 14 * 86400000) return 'next2';
                      if (time === thisMondayTime + 21 * 86400000) return 'next3';
                      if (time === thisMondayTime + 28 * 86400000) return 'next4';
                      return 'custom';
                    })()}
                    onChange={(e) => {
                      const val = e.target.value;
                      const today = new Date();
                      const day = today.getDay();
                      const diff = today.getDate() - day + (day === 0 ? -6 : 1);
                      const thisMonday = new Date(today.getFullYear(), today.getMonth(), diff);

                      if (val === '4weeks') {
                        setCalendarRange('4weeks');
                        setCurrentWeekStart(thisMonday);
                      } else if (val === 'month') {
                        setCalendarRange('month');
                        setCurrentWeekStart(new Date(today.getFullYear(), today.getMonth(), 1));
                      } else {
                        setCalendarRange('week');
                        if (val === 'current') {
                          setCurrentWeekStart(thisMonday);
                        } else if (val === 'next') {
                          setCurrentWeekStart(new Date(thisMonday.getTime() + 7 * 86400000));
                        } else if (val === 'next2') {
                          setCurrentWeekStart(new Date(thisMonday.getTime() + 14 * 86400000));
                        } else if (val === 'next3') {
                          setCurrentWeekStart(new Date(thisMonday.getTime() + 21 * 86400000));
                        } else if (val === 'next4') {
                          setCurrentWeekStart(new Date(thisMonday.getTime() + 28 * 86400000));
                        }
                      }
                    }}
                    className="appearance-none pr-8 pl-3 py-1.5 border border-slate-300 dark:border-white/10 bg-white text-slate-900 font-bold text-xs rounded-lg shadow-sm transition-colors cursor-pointer outline-none border-solid min-w-[95px]"
                  >
                    <option value="current">Current Week</option>
                    <option value="next">Next Week</option>
                    <option value="next2">In 2 Weeks</option>
                    <option value="next3">In 3 Weeks</option>
                    <option value="next4">In 4 Weeks</option>
                    <option value="4weeks">Next 4 Weeks</option>
                    <option value="month">Full Month</option>
                    <option value="custom" disabled hidden>Custom</option>
                  </select>
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-white/30">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                  </div>
                </div>

                {/*  Tour Dates Quick-Jump */}
                <div className="relative" data-tour-dropdown>
                  <button
                    type="button"
                    onClick={() => setShowTourDropdown(prev => !prev)}
                    className={`px-3 py-1.5 border text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer border-solid flex items-center gap-1.5 ${showTourDropdown
                      ? 'border-purple-500/40 bg-purple-500/10 text-purple-300'
                      : 'border-white/10 bg-black/40 hover:bg-white/5 text-white/70 hover:text-white'
                      }`}
                  >
                    SHOWS
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={`transition-transform ${showTourDropdown ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9" /></svg>
                  </button>
                  {showTourDropdown && (
                    <div className="absolute top-full left-0 mt-1 z-50 bg-[#1a1a22] border border-white/10 min-w-[320px] max-h-[850px] overflow-y-auto py-1.5 custom-scrollbar">
                      {(() => {
                        const todayStr = new Date().toISOString().split('T')[0];
                        const upcomingTourDates = tourDates.filter(show => !show.date || show.date >= todayStr);
                        if (upcomingTourDates.length === 0) {
                          return <div className="px-4 py-3 text-[var(--font-size-2xs)] text-white/30 italic">No upcoming tour dates synced yet</div>;
                        }
                        return upcomingTourDates
                          .sort((a, b) => (a.date || '').localeCompare(b.date || ''))
                          .map((show, idx) => {
                            const showDate = show.date ? new Date(show.date + 'T12:00:00') : null;
                            const dateLabel = showDate
                              ? showDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })
                              : 'Unknown';
                            return (
                              <button
                                key={show._id || `${show.date}-${show.venue}`}
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
                                <span className="text-[var(--font-size-3xs)] font-black text-purple-300/70 group-hover:text-purple-300 uppercase tracking-wider min-w-[80px]">{dateLabel}</span>
                                <span className="text-xs font-bold text-white/70 group-hover:text-white truncate">{show.venue || show.venue_name}</span>
                                {show.city && <span className="text-[var(--font-size-3xs)] text-white/30 ml-auto shrink-0">{show.city}</span>}
                              </button>
                            );
                          });
                      })()}
                    </div>
                  )}
                </div>

                {/* Shows Only Toggle */}
                <button
                  type="button"
                  onClick={() => setShowTourDatesOnly(prev => !prev)}
                  className={`px-3 py-1.5 border text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer border-solid flex items-center gap-1.5 ${showTourDatesOnly
                    ? 'border-purple-500/40 bg-purple-500/15 text-purple-300'
                    : 'border-white/10 bg-black/40 hover:bg-white/5 text-white/70 hover:text-white'
                    }`}
                  title="Show only days with tour shows"
                >
                  {showTourDatesOnly ? ' SHOWS ONLY' : 'ALL DAYS'}
                </button>

                {/* Crew Member Filter */}
                <div className="relative">
                  <select
                    aria-label="Filter schedule by crew member"
                    value={scheduleCrewFilter}
                    onChange={(e) => setScheduleCrewFilter(e.target.value)}
                    className="appearance-none pr-8 pl-3 py-1.5 border border-slate-300 dark:border-white/10 bg-white text-slate-900 font-bold text-xs rounded-lg shadow-sm transition-colors cursor-pointer outline-none border-solid min-w-[140px]"
                  >
                    <option value=""> All Crew</option>
                    {crewMembers.flatMap(member => member.id !== 'openshifts' ? (
                      [<option key={member.id} value={member.id}>{member.name}</option>]
                    ) : [])}
                  </select>
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-white/30">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                  </div>
                </div>

                {/* Advanced Filters Trigger */}
                <button
                  type="button"
                  onClick={() => setIsFiltersPanelExpanded(!isFiltersPanelExpanded)}
                  className={`px-3 py-1.5 border text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer border-solid flex items-center gap-1.5 select-none ${isFiltersPanelExpanded || activeFiltersCount > 0
                    ? 'border-purple-500/40 bg-purple-500/15 text-purple-300 font-extrabold shadow-[0_0_8px_rgba(147, 51, 234,0.1)]'
                    : 'border-white/10 bg-black/40 hover:bg-white/5 text-white/70 hover:text-white'
                    }`}
                  title="Search & advanced filters by person, venue, date range, and event type"
                >
                  <span></span> {isFiltersPanelExpanded ? 'HIDE FILTERS' : 'FILTERS'}
                  {activeFiltersCount > 0 && (
                    <span className="px-1.5 py-0.5 bg-purple-600 text-white rounded-full text-[var(--font-size-4xs)] font-black leading-none">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>

                {/* Color Coding Mode Selector */}
                <div className="relative">
                  <select
                    value={colorCodingMode}
                    onChange={(e) => setColorCodingMode(e.target.value as any)}
                    className="appearance-none pr-8 pl-3 py-1.5 border border-slate-300 dark:border-white/10 bg-white text-slate-900 font-bold text-xs rounded-lg shadow-sm transition-colors cursor-pointer outline-none border-solid min-w-[155px]"
                    title="Select color coding scheme for schedule cards"
                  >
                    <option value="role"> Role Colors</option>
                    <option value="eventType"> Event Type Colors</option>
                    <option value="band"> Band Colors</option>
                  </select>
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-white/30">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                  </div>
                </div>

                {activeFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setScheduleCrewFilter('');
                      setSchedulePersonSearch('');
                      setScheduleVenueSearch('');
                      setScheduleEventTypeFilter('');
                      setScheduleStartDate('');
                      setScheduleEndDate('');
                      setShowTourDatesOnly(false);
                      setScheduleSortByDate(null);
                    }}
                    className="px-3 py-1.5 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 hover:text-rose-300 text-xs font-bold rounded-lg transition-colors cursor-pointer border-solid flex items-center gap-1.5 select-none"
                    title="Reset all search filters"
                  >
                    Clear All
                  </button>
                )}

                {/*  Clear All Shifts / Start Fresh Button */}
                {schedules.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("Are you sure you want to clear all shift timeframes and start fresh?")) {
                        setSchedules([]);
                        if (typeof window !== 'undefined') {
                          localStorage.setItem('7h_crew_schedules', '[]');
                        }
                      }
                    }}
                    className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 hover:text-red-300 text-xs font-bold rounded-lg transition-colors cursor-pointer border-solid flex items-center gap-1.5 select-none"
                    title="Clear all scheduled shift timeframes and start fresh"
                  >
                    Clear All Shifts
                  </button>
                )}

                {/*  Generate Test Data Action */}
                <button
                  type="button"
                  onClick={handleGenerateTestData}
                  className="px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 hover:text-purple-200 text-xs font-bold rounded-lg transition-colors cursor-pointer border-solid flex items-center gap-1.5 select-none"
                  title="Generate realistic test schedule data for 2-4 weeks with edge cases"
                >
                  Generate Test Data
                </button>

                {/*  Purge Test Data Action */}
                {schedules.some(s => s.isTestData || s.id.startsWith('test_shift_') || (s.notes && s.notes.includes('[TEST]'))) && (
                  <button
                    type="button"
                    onClick={handlePurgeTestData}
                    className="px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 hover:text-purple-200 text-xs font-bold rounded-lg transition-colors cursor-pointer border-solid flex items-center gap-1.5 select-none animate-pulse"
                    title="Purge all test schedule data ([TEST] shifts)"
                  >
                    Purge Test Data
                  </button>
                )}

                {/* ⏳ Coverage Requests Dropdown */}
                {(() => {
                  const coverageRequests = schedules.filter(s => s.isCoverageRequested);
                  return (
                    <div className="relative">
                      <select
                        aria-label="Coverage requests"
                        value=""
                        onChange={(e) => {
                          const val = e.target.value;
                          if (!val) return;
                          const shift = schedules.find(s => s.id === val);
                          if (shift) {
                            handleSelectCoverageRequest(shift);
                          }
                        }}
                        className="appearance-none pr-8 pl-3 py-1.5 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-xs font-bold text-red-400 hover:text-red-300 rounded-lg shadow-sm transition-colors cursor-pointer outline-none border-solid min-w-[190px]"
                      >
                        <option value="" className="text-white/40"> {coverageRequests.length} Coverage {coverageRequests.length === 1 ? 'Request' : 'Requests'}</option>
                        {coverageRequests.map(shift => {
                          const member = crewMembers.find(m => m.id === shift.crewId);
                          const name = member ? member.name : shift.crewName || shift.crewId;
                          const dateObj = new Date(shift.date + 'T12:00:00');
                          const dateLabel = !isNaN(dateObj.getTime())
                            ? dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                            : shift.date;
                          return (
                            <option key={shift.id} value={shift.id} className="text-white bg-[var(--color-bg-card)]">
                              {name} — {shift.role} — {dateLabel}
                            </option>
                          );
                        })}
                      </select>
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-red-400">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Expandable Advanced Filters Panel */}
            {isFiltersPanelExpanded && (
              <div className="border-b border-white/5 bg-black/25 backdrop-blur-md px-6 py-4 animate-[slideDown_0.2s_ease-out] flex flex-col gap-4 shrink-0">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Search by Person */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="admin-sched-person-search" className="text-[var(--font-size-3xs)] font-black uppercase text-white/50 tracking-wider">Search Person / Role</label>
                    <div className="relative">
                      <input
                        id="admin-sched-person-search"
                        type="text"
                        value={schedulePersonSearch}
                        onChange={(e) => setSchedulePersonSearch(e.target.value)}
                        placeholder="Name, role, e.g. Dave, Audio..."
                        className="w-full bg-black/60 border border-white/10 focus:border-purple-500/50 rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/20 outline-none transition-colors"
                      />
                      {schedulePersonSearch && (
                        <button
                          type="button"
                          aria-label="Clear person search"
                          onClick={() => setSchedulePersonSearch('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white bg-transparent border-none cursor-pointer text-xs font-bold"
                        >✕</button>
                      )}
                    </div>
                  </div>

                  {/* Search by Venue */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="admin-sched-venue-search" className="text-[var(--font-size-3xs)] font-black uppercase text-white/50 tracking-wider">Search Venue Name</label>
                    <div className="relative">
                      <input
                        id="admin-sched-venue-search"
                        type="text"
                        value={scheduleVenueSearch}
                        onChange={(e) => setScheduleVenueSearch(e.target.value)}
                        placeholder="Venue, e.g. Blarney, Cruise..."
                        className="w-full bg-black/60 border border-white/10 focus:border-purple-500/50 rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/20 outline-none transition-colors"
                      />
                      {scheduleVenueSearch && (
                        <button
                          type="button"
                          aria-label="Clear venue search"
                          onClick={() => setScheduleVenueSearch('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white bg-transparent border-none cursor-pointer text-xs font-bold"
                        >✕</button>
                      )}
                    </div>
                  </div>

                  {/* Event Type Filter */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="admin-sched-event-type" className="text-[var(--font-size-3xs)] font-black uppercase text-white/50 tracking-wider">Show / Event Type</label>
                    <div className="relative">
                      <select
                        id="admin-sched-event-type"
                        value={scheduleEventTypeFilter}
                        onChange={(e) => setScheduleEventTypeFilter(e.target.value)}
                        className="appearance-none w-full bg-white text-slate-900 border border-slate-300 dark:border-white/10 rounded-lg pl-3 pr-8 py-1.5 text-xs outline-none transition-colors cursor-pointer border-solid font-bold"
                      >
                        <option value=""> Any Event Type</option>
                        <option value="festival"> Festival</option>
                        <option value="private"> Private Event</option>
                        <option value="corporate"> Corporate</option>
                        <option value="cruise"> Cruise</option>
                        <option value="club"> Club / Bar</option>
                      </select>
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-white/30">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9" /></svg>
                      </div>
                    </div>
                  </div>

                  {/* Date Range Selection */}
                  <div className="flex flex-col gap-1.5 col-span-1">
                    <span className="text-[var(--font-size-3xs)] font-black uppercase text-white/50 tracking-wider">Custom Date Range</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        aria-label="Schedule start date"
                        value={scheduleStartDate}
                        onChange={(e) => setScheduleStartDate(e.target.value)}
                        className="w-full bg-black/60 border border-white/10 focus:border-purple-500/50 rounded-lg px-2.5 py-1 text-xs text-white outline-none transition-colors cursor-pointer"
                      />
                      <span className="text-white/35 text-[var(--font-size-3xs)] font-bold">TO</span>
                      <input
                        type="date"
                        aria-label="Schedule end date"
                        value={scheduleEndDate}
                        onChange={(e) => setScheduleEndDate(e.target.value)}
                        className="w-full bg-black/60 border border-white/10 focus:border-purple-500/50 rounded-lg px-2.5 py-1 text-xs text-white outline-none transition-colors cursor-pointer"
                      />
                      {(scheduleStartDate || scheduleEndDate) && (
                        <button
                          type="button"
                          onClick={() => {
                            setScheduleStartDate('');
                            setScheduleEndDate('');
                          }}
                          className="text-white/40 hover:text-white bg-white/5 hover:bg-white/10 px-2 py-1 rounded text-[var(--font-size-3xs)] font-bold transition-colors cursor-pointer border-none"
                          title="Reset Date Range"
                        >

                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Info summary under filters */}
                <div className="flex items-center justify-between text-[var(--font-size-2xs)] text-white/40 border-t border-white/5 pt-2">
                  <div className="flex items-center gap-4">
                    <span>
                      Displaying <strong className="text-purple-300 font-extrabold">{filteredDays.length}</strong> date columns
                    </span>
                    <span>
                      Showing <strong className="text-purple-300 font-extrabold">{filteredCrewMembers.length}</strong> crew rows
                    </span>
                  </div>
                  {activeFiltersCount > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-purple-300/80 font-semibold italic">Filters active</span>
                      <button
                        type="button"
                        onClick={() => {
                          setScheduleCrewFilter('');
                          setSchedulePersonSearch('');
                          setScheduleVenueSearch('');
                          setScheduleEventTypeFilter('');
                          setScheduleStartDate('');
                          setScheduleEndDate('');
                          setShowTourDatesOnly(false);
                          setScheduleSortByDate(null);
                        }}
                        className="text-purple-300 hover:text-white bg-purple-500/10 hover:bg-purple-500/20 px-2 py-0.5 rounded text-[var(--font-size-3xs)] font-bold transition-colors cursor-pointer border-none"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Grid Body + Sidebar */}
            <div className="flex gap-0 flex-1 min-h-0">
              {/* Main Schedule Grid */}
              <div className="flex-1 min-w-0 flex flex-col min-h-0">
                {calendarView === 'timeline' && renderTimelineGrid()}
                {calendarView === 'roster' && renderRosterBoard()}
                {calendarView === 'list' && renderListBoard()}
              </div>

              {/* Right Sidebar: Tour Dates & Crew */}
              <div
                style={{ borderRight: '1px solid #48292f' }}
                className="w-[280px] shrink-0 border-t border-b border-[#ffffff1f] overflow-y-auto h-full hidden xl:block z-20"
              >

                {/* Tour Dates Section Box */}
                <div className="bg-white/[0.02] overflow-hidden">
                  <div className="px-3 py-2.5 flex items-center justify-between bg-white/[0.02]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[var(--font-size-3xs)]"></span>
                      <span className="text-[var(--font-size-3xs)] font-bold text-white/50 uppercase tracking-wider">Tour Dates</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {selectedTourDate && (
                        <button
                          type="button"
                          onClick={() => setSelectedTourDate(null)}
                          className="text-[var(--font-size-4xs)] font-bold text-purple-300/70 hover:text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded cursor-pointer border-none transition-colors"
                        >
                          SHOW ALL
                        </button>
                      )}
                      <span className="text-[var(--font-size-4xs)] font-bold text-white/20 bg-white/5 px-1.5 py-0.5 rounded">
                        {upcomingTourDatesWithLabels.length}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-0.5 max-h-[1320px] overflow-y-auto custom-scrollbar">
                    {(() => {
                      if (upcomingTourDatesWithLabels.length === 0) {
                        return <div className="px-2 py-3 text-[var(--font-size-3xs)] text-white/20 italic text-center">No upcoming tour dates synced</div>;
                      }

                      return upcomingTourDatesWithLabels.map((show, idx) => {
                        const isSelected = selectedTourDate === show.date;
                        const isActiveWeek = show.date ? activeWeekDateSet.has(show.date) : false;
                        const shiftCount = show.date ? shiftCountsByDate[show.date] || 0 : 0;

                        return (
                          <SidebarDateButton
                            key={show._id || `${show.date}-${show.venue}`}
                            show={show}
                            isSelected={isSelected}
                            isActiveWeek={isActiveWeek}
                            shiftCount={shiftCount}
                            onClick={handleDateClick}
                          />
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>
            </div>

            {/* Crew Hours Leaderboard */}
            <div className="border-t border-white/5 shrink-0">
              <button
                type="button"
                onClick={() => setShowLeaderboard(prev => !prev)}
                className="w-full px-4 py-2.5 flex items-center justify-between cursor-pointer border-none bg-transparent hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs"></span>
                  <span className="text-[var(--font-size-2xs)] font-bold text-white/60 uppercase tracking-wider">Crew Hours Leaderboard</span>
                </div>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={`text-white/30 transition-transform ${showLeaderboard ? '' : '-rotate-90'}`}><polyline points="6 9 12 15 18 9" /></svg>
              </button>

              {showLeaderboard && (
                <div className="px-4 pb-4">
                  {/* Period Tabs */}
                  <div className="flex items-center gap-1 mb-3 -ml-3">
                    {(['day', 'week', 'month', 'year'] as const).map(period => (
                      <button
                        key={period}
                        type="button"
                        onClick={() => setLeaderboardPeriod(period)}
                        className={`px-3 py-1 text-[var(--font-size-3xs)] font-bold uppercase tracking-wider rounded-md border-none cursor-pointer transition-colors ${leaderboardPeriod === period
                          ? 'bg-purple-500/15 text-purple-300'
                          : 'bg-transparent text-white/30 hover:text-white/60 hover:bg-white/5'
                          }`}
                      >
                        {period}
                      </button>
                    ))}
                  </div>

                  {/* Leaderboard Bars */}
                  {(() => {
                    const maxHours = leaderboardRankings.length > 0 ? leaderboardRankings[0].hours : 1;

                    if (leaderboardRankings.length === 0) {
                      return (
                        <div className="text-center py-3 text-[var(--font-size-2xs)] text-white/20 italic">No hours logged for this period</div>
                      );
                    }

                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {leaderboardRankings.slice(0, 9).map((member, idx) => {
                          const pct = Math.round((member.hours / maxHours) * 100);
                          const medalEmoji = idx === 0 ? '' : idx === 1 ? '' : idx === 2 ? '' : '';
                          const barColor = idx === 0 ? 'bg-purple-500/30' : idx === 1 ? 'bg-slate-400/20' : idx === 2 ? 'bg-orange-700/20' : 'bg-white/5';

                          return (
                            <div key={member.id} className="flex items-center gap-2.5 bg-transparent rounded-lg px-0 py-2 border border-white/5 hover:border-white/10 transition-colors">
                              {/* Rank */}
                              <span className="text-[var(--font-size-3xs)] font-black text-white/20 w-3 shrink-0 text-left">
                                {medalEmoji || `${idx + 1}`}
                              </span>

                              {/* Avatar */}
                              {(() => {
                                const initials = member.initials || member.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
                                const color = member.color || getAvatarColor(member.name);
                                return (
                                  <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-[var(--font-size-4xs)] text-white shrink-0" style={{ backgroundColor: color }}>
                                    {initials}
                                  </div>
                                );
                              })()}

                              {/* Name + Bar */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-0.5">
                                  <span className="text-[var(--font-size-3xs)] font-bold text-white/70 truncate">{member.name}</span>
                                  <span className="text-[var(--font-size-3xs)] font-black text-purple-300/80 ml-2 shrink-0">{member.hours.toFixed(1)}h</span>
                                </div>
                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                  <div className={`h-full rounded-full ${barColor} transition-colors`} style={{ width: `${pct}%` }} />
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
              const editingShift = schedules.find(s => s.id === editingShiftId);
              const showFormDetails = !!editingShiftId || Object.values(selectedCrewAssignments).some(a => a.active);
              return (
                <div className="fixed inset-0 bg-transparent z-[999] flex justify-end animate-[fadeIn_0.2s_ease]">
                  {/* Backdrop Click Overlay */}
                  <button
                    type="button"
                    aria-label="Close overlay"
                    className="absolute inset-0 cursor-default border-0 bg-transparent"
                    onClick={() => {
                      setActiveDropDay(null);
                      setDraggedCrewMemberId(null);
                      setEditingShiftId(null);
                    }}
                  />

                  <div className="relative bg-[var(--color-bg-card)] border-l border-white/10 w-full max-w-md h-full flex flex-col justify-between animate-[slideInRight_0.3s_cubic-bezier(0.16,1,0.3,1)]">

                    {/* Modal Header */}
                    <div className="p-5 border-b border-white/5 bg-[var(--color-bg-elevated)] flex items-center justify-between shrink-0">
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
                        aria-label="Close active drop day modal"
                        onClick={() => {
                          setActiveDropDay(null);
                          setDraggedCrewMemberId(null);
                          setEditingShiftId(null);
                        }}
                        className="text-white/40 hover:text-white transition-colors cursor-pointer border-none bg-transparent text-sm"
                      >✕

                      </button>
                    </div>

                    {/* Modal Form */}
                    <div className="p-5 flex-1 overflow-y-auto space-y-4 pr-1">

                      {/* Coverage Request Alert / Control */}
                      {(() => {
                        const editingShift = schedules.find(s => s.id === editingShiftId);
                        if (!editingShift) return null;

                        if (!editingShift.isCoverageRequested) {
                          return (
                            <div className="shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  setSchedules(current => {
                                    const updated = current.map(s => {
                                      if (s.id === editingShiftId) {
                                        return { ...s, isCoverageRequested: true };
                                      }
                                      return s;
                                    });
                                    return updated;
                                  });
                                }}
                                className="w-full py-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                              >
                                <span></span> Request Coverage
                              </button>
                            </div>
                          );
                        }

                        // If coverage is requested:
                        return (
                          <div className="shrink-0 bg-red-500/10 border border-red-500/30 p-4 space-y-3">
                            <div className="flex items-center justify-between gap-3 text-red-400">
                              <div className="flex items-center gap-2">
                                <span className="text-sm"></span>
                                <div>
                                  <p className="text-xs font-black uppercase tracking-wider">Coverage Requested</p>
                                  <p className="text-[var(--font-size-3xs)] text-white/60 mt-0.5">
                                    <strong>{editingShift.crewName}</strong> has requested coverage for this shift.
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setSchedules(current => current.map(s => {
                                    if (s.id === editingShiftId) {
                                      return { ...s, isCoverageRequested: false };
                                    }
                                    return s;
                                  }));
                                }}
                                className="px-2 py-0.5 bg-red-500/20 hover:bg-red-500/40 text-red-300 text-[var(--font-size-4xs)] font-black uppercase tracking-wider rounded border border-red-500/30 transition-colors"
                              >
                                Clear
                              </button>
                            </div>

                            <div className="border-t border-white/5 pt-3 space-y-2.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[var(--font-size-3xs)] font-black uppercase tracking-wider text-white/50">Assign Coverage:</span>

                                {/* Tab/Toggle for Fit Role vs Override */}
                                <div className="flex bg-black/40 p-0.5 rounded-lg border border-white/15">
                                  <button
                                    type="button"
                                    onClick={() => setOnlyShowFitRole(true)}
                                    className={`px-2 py-0.5 text-[var(--font-size-4xs)] font-black uppercase tracking-wider rounded transition-colors cursor-pointer ${onlyShowFitRole
                                      ? 'bg-purple-600 text-white font-black'
                                      : 'text-white/60 hover:text-white'
                                      }`}
                                  >
                                    Fit Role ({editingShift.role})
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setOnlyShowFitRole(false)}
                                    className={`px-2 py-0.5 text-[var(--font-size-4xs)] font-black uppercase tracking-wider rounded transition-colors cursor-pointer ${!onlyShowFitRole
                                      ? 'bg-red-500/20 text-red-300 border border-red-500/30 font-black'
                                      : 'text-white/60 hover:text-white'
                                      }`}
                                  >
                                    Override (All)
                                  </button>
                                </div>
                              </div>

                              {/* List of candidates */}
                              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                                {(() => {
                                  const candidates = crewMembers.filter(m =>
                                    m.id !== 'openshifts' &&
                                    m.id !== editingShift.crewId &&
                                    (!onlyShowFitRole || (m.role || '').toUpperCase() === (editingShift.role || '').toUpperCase())
                                  );

                                  if (candidates.length === 0) {
                                    return (
                                      <p className="text-[var(--font-size-3xs)] text-white/40 italic py-1">
                                        {onlyShowFitRole
                                          ? `No other crew members have the role '${editingShift.role}'`
                                          : 'No other crew members available'}
                                      </p>
                                    );
                                  }

                                  return candidates.map(member => {
                                    const overlaps = getOverlappingShifts(
                                      member.id,
                                      editingShift.date,
                                      editingShift.startHour,
                                      editingShift.endHour,
                                      editingShift.id
                                    );
                                    const isOverlapping = overlaps.length > 0;

                                    return (
                                      <div key={member.id} className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-black/30 hover:bg-black/40 transition-colors border border-white/5">
                                        <div className="flex items-center gap-2">
                                          <div
                                            className="w-5 h-5 rounded-full flex items-center justify-center text-4xs font-extrabold text-white uppercase shrink-0 font-sans shadow-sm"
                                            style={{ backgroundColor: member.color || getAvatarColor(member.name) }}
                                          >
                                            {member.initials || member.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                                          </div>
                                          <div>
                                            <span className="text-xs font-bold text-white block leading-tight">{member.name}</span>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                              <span className="text-[var(--font-size-4xs)] text-white/40 uppercase tracking-wider font-bold block">{member.role || 'Crew'}</span>
                                              {isOverlapping && (
                                                <span className="px-1 py-0.2 rounded text-[var(--font-size-5xs)] font-black uppercase tracking-wider bg-red-500/20 border border-red-500/35 text-red-400">
                                                  Overlaps {overlaps[0].time}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                        <button
                                          type="button"
                                          disabled={isOverlapping}
                                          onClick={() => {
                                            // Reassign shift to this member
                                            setSchedules(current => {
                                              return current.map(s => {
                                                if (s.id === editingShiftId) {
                                                  return {
                                                    ...s,
                                                    crewId: member.id,
                                                    crewName: member.name,
                                                    isCoverageRequested: false
                                                  };
                                                }
                                                return s;
                                              });
                                            });
                                            setActiveDropDay(null);
                                            setDraggedCrewMemberId(null);
                                            setEditingShiftId(null);
                                          }}
                                          className={`px-2 py-1 text-[var(--font-size-4xs)] font-black uppercase tracking-wider rounded transition-colors border-none ${isOverlapping
                                            ? 'bg-white/5 text-white/20 cursor-not-allowed'
                                            : 'bg-purple-600 hover:bg-purple-500 text-white cursor-pointer'
                                            }`}
                                        >
                                          Assign
                                        </button>
                                      </div>
                                    );
                                  });
                                })()}
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Tour Date Show Card Info */}
                      {(() => {
                        const activeShow = activeDropDay ? getDayShow(activeDropDay) : null;
                        if (!activeShow) return null;

                        const dateObj = activeDropDay ? new Date(activeDropDay + 'T12:00:00') : null;
                        const formattedDate = dateObj ? dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : activeDropDay;
                        const festStart = activeShow.festStart || activeShow.festStartTime || '5:00 PM';
                        const bandTime = activeShow.time || activeShow.bandTime || activeShow.showTime || '8:00 PM';

                        return (
                          <div className="shrink-0 bg-purple-500/10 border border-purple-500/20 rounded-lg px-3 py-2 space-y-1.5 font-sans">
                            <div className="flex items-center justify-between gap-2 min-w-0">
                              <div className="flex items-center gap-1.5 min-w-0 truncate">
                                <span className="text-[14px] font-extrabold text-white truncate">{activeShow.venue}</span>
                                <span className="text-[13px] text-white/40 truncate shrink-0">({activeShow.city}{activeShow.state ? `, ${activeShow.state}` : ''})</span>
                              </div>
                              <span className="text-[12px] font-extrabold text-purple-300 shrink-0 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                                {formattedDate}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-[11px] font-semibold text-white/80 border-t border-white/10 pt-1.5 overflow-x-auto no-scrollbar">
                              <span className="inline-flex items-center gap-1 bg-purple-500/10 border border-purple-500/20 text-purple-300 px-2 py-0.5 rounded text-[11px] whitespace-nowrap shrink-0">
                                Fest: {festStart}
                              </span>
                              <span className="inline-flex items-center gap-1 bg-purple-500/10 border border-purple-500/20 text-purple-300 px-2 py-0.5 rounded text-[11px] whitespace-nowrap shrink-0">
                                Band: {bandTime}
                              </span>
                              {activeShow.notes && (
                                <span className="text-white/40 italic truncate text-[11px] shrink-0" title={activeShow.notes}>
                                  • {activeShow.notes}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })()}



                      {/* Crew Selector Grid (Multi-Selection checklist used for both Create and Edit modes) */}
                      {!(editingShift && editingShift.isCoverageRequested) && (
                        <div className="flex flex-col shrink-0">
                          <span className="text-[0.6rem] uppercase tracking-[0.15em] text-white/40 mb-2 block font-bold font-sans shrink-0">Select Crew Members Working That Day</span>

                          {/* Search and Grouping Controls */}
                          <div className="shrink-0 mb-3 space-y-2">
                            <input
                              type="text"
                              aria-label="Search crew members"
                              value={drawerCrewSearch}
                              onChange={e => setDrawerCrewSearch(e.target.value)}
                              placeholder=" Search crew members..."
                              className="w-full px-3 py-1.5 bg-black/40 border border-white/10 text-xs text-white placeholder-white/30 rounded-lg outline-none focus:border-purple-500/50 transition-colors font-bold font-sans"
                            />

                          </div>

                          <div className="space-y-2.5 pr-1 overflow-y-auto max-h-60 border border-white/5 bg-black/10 p-2.5">
                            {(() => {
                              const seenKeys = new Set<string>();
                              const uniqueCrew = crewMembers.filter(m => {
                                const normKey = m.name.toLowerCase().trim();
                                if (m.id === 'openshifts' || seenKeys.has(m.id) || seenKeys.has(normKey)) return false;
                                seenKeys.add(m.id);
                                seenKeys.add(normKey);
                                return true;
                              });
                              return uniqueCrew
                                .filter(m => m.name.toLowerCase().includes(drawerCrewSearch.toLowerCase()))
                                .sort((a, b) => {
                                  const aActive = !!selectedCrewAssignments[a.id]?.active;
                                  const bActive = !!selectedCrewAssignments[b.id]?.active;
                                  if (aActive && !bActive) return -1;
                                  if (!aActive && bActive) return 1;
                                  return a.name.localeCompare(b.name);
                                })
                                .map((member) => {
                                  const assignment = selectedCrewAssignments[member.id] || { active: false, customized: false, role: dropRole || 'STAGE HAND', startHour: dropStartHour, endHour: dropEndHour };

                                  const overlaps = getOverlappingShifts(
                                    member.id,
                                    activeDropDay || '',
                                    assignment.startHour,
                                    assignment.endHour,
                                    editingShiftId || undefined
                                  );
                                  const isOverlapping = overlaps.length > 0;

                                  return (
                                    <div
                                      key={member.id}
                                      className={`p-3  border transition-colors ${assignment.active
                                        ? 'bg-purple-500/10 border-purple-500/30'
                                        : 'bg-black/20 border-white/5 hover:border-white/10'
                                        }`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <label className="flex items-center gap-3 select-none">
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
                                                  role: assignment.role || dropRole || member.role || 'STAGE HAND',
                                                  startHour: assignment.startHour || dropStartHour || 12,
                                                  endHour: assignment.endHour || dropEndHour || 17,
                                                  timeFrames: structuredClone(dropTimeFrames)
                                                }
                                              }));
                                            }}
                                            className="rounded border-white/10 bg-black/40  text-[var(--color-accent)] focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5 cursor-pointer"
                                          />
                                          <div className="flex items-center gap-2">
                                            <div
                                              className="w-5 h-5 rounded-full flex items-center justify-center text-4xs font-extrabold text-white uppercase shrink-0 font-sans shadow-sm"
                                              style={{ backgroundColor: member.color || getAvatarColor(member.name) }}
                                            >
                                              {member.initials || member.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                                            </div>
                                            <div>
                                              <span className="text-xs font-bold text-white/95 font-sans block leading-tight">{member.name}</span>
                                              <span className="text-[9.5px] text-white/40 font-mono block leading-tight mt-0.5">
                                                {member.phone || 'No phone'} |  {member.email || 'No email'}
                                              </span>
                                              {(() => {
                                                const memberShifts = schedules.filter(s => s.date === activeDropDay && s.crewId === member.id && s.id !== editingShiftId && !s.isTimeOff);
                                                if (memberShifts.length === 0) return null;
                                                return (
                                                  <div className="mt-1.5 flex flex-wrap gap-1">
                                                    {memberShifts.map((s, idx) => (
                                                      <span
                                                        key={idx}
                                                        className="inline-flex items-center gap-1 bg-purple-500/10 border border-purple-500/20 text-purple-300 font-extrabold uppercase text-4xs tracking-wider px-1.5 py-0.5 rounded select-none"
                                                      >
                                                        {s.role || 'SHIFT'}: {s.time || formatTimeFrame(s.startHour, s.endHour)}
                                                      </span>
                                                    ))}
                                                  </div>
                                                );
                                              })()}
                                              {isOverlapping && (
                                                <span className="text-[7.5px] text-red-400 font-bold block leading-tight mt-0.5">
                                                  Overlaps: {overlaps[0].time}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        </label>
                                      </div>
                                    </div>
                                  );
                                });
                            })()}
                          </div>
                        </div>
                      )}

                      {/* Form Fields block */}
                      <div className="space-y-4 shrink-0 mt-2 pr-1">
                        {showFormDetails && (
                          <div className="space-y-4 font-sans">
                            {dropTimeFrames.map((tf, index) => (
                              <div key={tf.id || `${tf.role}-${tf.startHour}-${tf.endHour}`} className="p-3.5 bg-black/40 border border-white/10 space-y-3 relative animate-[fadeIn_0.2s_ease]">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs uppercase tracking-wider text-purple-300 font-bold font-sans" style={{ fontSize: '11px' }}>Time Frame {index + 1}</span>
                                  {dropTimeFrames.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setDropTimeFrames(prev => prev.filter((_, i) => i !== index));
                                      }}
                                      className="text-white/40 hover:text-red-400 text-[10px] font-bold bg-transparent border-none cursor-pointer uppercase tracking-wider font-sans"
                                      style={{ fontSize: '10px' }}
                                    >
                                      Remove
                                    </button>
                                  )}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label htmlFor={`admin-drawer-start-time-${index}`} className="text-[10px] uppercase tracking-wider text-white/50 mb-1 block font-semibold font-sans" style={{ fontSize: '10px' }}>Start Time</label>
                                    <select
                                      id={`admin-drawer-start-time-${index}`}
                                      value={tf.startHour}
                                      onChange={(e) => {
                                        const val = parseFloat(e.target.value);
                                        setDropTimeFrames(prev => prev.map((item, i) => {
                                          if (i === index) {
                                            const newEnd = tf.endHour <= val ? Math.min(24, val + 1) : tf.endHour;
                                            return { ...item, startHour: val, endHour: newEnd };
                                          }
                                          return item;
                                        }));
                                      }}
                                      className="w-full px-3 py-1.5   border border-white/10 text-xs text-white rounded-lg outline-none focus:border-purple-500/50 transition-colors font-bold cursor-pointer font-sans"
                                    >
                                      {generateTimeOptions().slice(0, -1).map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                      ))}
                                    </select>
                                  </div>

                                  <div>
                                    <label htmlFor={`admin-drawer-end-time-${index}`} className="text-[10px] uppercase tracking-wider text-white/50 mb-1 block font-semibold font-sans" style={{ fontSize: '10px' }}>End Time</label>
                                    <select
                                      id={`admin-drawer-end-time-${index}`}
                                      value={tf.endHour}
                                      onChange={(e) => {
                                        const val = parseFloat(e.target.value);
                                        setDropTimeFrames(prev => prev.map((item, i) => i === index ? { ...item, endHour: val } : item));
                                      }}
                                      className="w-full px-3 py-1.5   border border-white/10 text-xs text-white rounded-lg outline-none focus:border-purple-500/50 transition-colors font-bold cursor-pointer font-sans"
                                    >
                                      {generateTimeOptions().flatMap(opt => opt.value > tf.startHour ? (
                                        [<option key={opt.value} value={opt.value}>{opt.label}</option>]
                                      ) : [])}
                                    </select>
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <label htmlFor={`admin-drawer-role-${index}`} className="text-[10px] uppercase tracking-wider text-white/50 mb-1 block font-semibold font-sans" style={{ fontSize: '10px' }}>Role / Duty</label>
                                  <input
                                    id={`admin-drawer-role-${index}`}
                                    type="text"
                                    value={tf.role}
                                    onChange={e => {
                                      const val = e.target.value;
                                      setDropTimeFrames(prev => prev.map((item, i) => i === index ? { ...item, role: val } : item));
                                    }}
                                    placeholder="e.g. Audio Mix"
                                    className="w-full px-3 py-2   border border-white/10 text-xs text-white rounded-lg outline-none focus:border-purple-500/50 transition-colors font-bold uppercase tracking-wider font-sans"
                                  />
                                  <div className="flex flex-wrap gap-1 mt-1.5">
                                    {["STAGE HAND", "AUDIO MIX", "LIGHTS", "EQUIPMENT SETUP", "TEAR DOWN", "MERCH", "TOUR MANAGER", "SOUND ENGINEER", "STAGE MANAGER", "PHOTOGRAPHER", "CAMERA", "BAND MEMBER"].map(preset => {
                                      const currentRoles = tf.role ? tf.role.split(/[,|/]/).map((r: string) => r.trim().toUpperCase()).filter(Boolean) : [];
                                      const isSelected = currentRoles.includes(preset.toUpperCase());
                                      return (
                                        <button
                                          key={preset}
                                          type="button"
                                          onClick={() => {
                                            const rawRoles = tf.role ? tf.role.split(/[,|/]/).map((r: string) => r.trim()).filter(Boolean) : [];
                                            const upperPreset = preset.toUpperCase();
                                            const exists = rawRoles.some((r: string) => r.toUpperCase() === upperPreset);
                                            let newRoles: string[];
                                            if (exists) {
                                              newRoles = rawRoles.filter((r: string) => r.toUpperCase() !== upperPreset);
                                            } else {
                                              newRoles = [...rawRoles, preset];
                                            }
                                            const newRoleStr = newRoles.join(', ');
                                            setDropTimeFrames(prev => prev.map((item, i) => i === index ? { ...item, role: newRoleStr } : item));
                                          }}
                                          className={`px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider border transition-colors cursor-pointer font-sans ${isSelected
                                            ? 'bg-purple-600 text-white border-purple-500 shadow-xs font-black'
                                            : 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10'
                                            }`}
                                        >
                                          {isSelected ? ` ${preset}` : preset}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <label htmlFor={`admin-drawer-tags-${index}`} className="text-[10px] uppercase tracking-wider text-white/50 mb-1 block font-semibold font-sans" style={{ fontSize: '10px' }}>Tags</label>
                                  <div className="relative">
                                    <select
                                      id={`admin-drawer-tags-${index}`}
                                      value=""
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        if (!val) return;
                                        setDropTimeFrames(prev => prev.map((item, i) => {
                                          if (i === index) {
                                            const currentTags = item.tags || [];
                                            const newTags = currentTags.includes(val)
                                              ? currentTags.filter(t => t !== val)
                                              : [...currentTags, val];
                                            return { ...item, tags: newTags };
                                          }
                                          return item;
                                        }));
                                      }}
                                      className="w-full px-3 py-1.5   border border-white/10 text-xs text-white rounded-lg outline-none focus:border-purple-500/50 transition-colors font-bold cursor-pointer appearance-none font-sans"
                                    >
                                      <option value="">Select tags...</option>
                                      <option value="Overtime">⏰ Overtime</option>
                                      <option value="Double Shift"> Double Shift</option>
                                      <option value="Split Shift"> Split Shift</option>
                                      <option value="Standby"> Standby</option>
                                      <option value="Backup"> Backup</option>
                                      <option value="Training"> Training</option>
                                    </select>
                                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
                                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9" /></svg>
                                    </div>
                                  </div>
                                  {tf.tags && tf.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1.5">
                                      {tf.tags.map(tag => (
                                        <span
                                          key={tag}
                                          className="inline-flex items-center gap-1 bg-purple-500/10 border border-purple-500/20 text-purple-300 font-extrabold uppercase text-4xs tracking-wider px-2 py-0.5 rounded font-sans"
                                        >
                                          {tag}
                                          <button
                                            type="button"
                                            aria-label={`Remove ${tag} tag`}
                                            onClick={() => {
                                              setDropTimeFrames(prev => prev.map((item, i) => {
                                                if (i === index) {
                                                  return { ...item, tags: (item.tags || []).filter(t => t !== tag) };
                                                }
                                                return item;
                                              }));
                                            }}
                                            className="hover:text-white bg-transparent border-none p-0 cursor-pointer text-4xs font-sans"
                                          >
                                            ✕
                                          </button>
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}

                            {dropTimeFrames.length < 3 && (
                              <button
                                type="button"
                                onClick={() => {
                                  setDropTimeFrames(prev => [...prev, { startHour: 12, endHour: 17, role: 'STAGE HAND', tags: [] }]);
                                }}
                                className="w-full py-2 bg-purple-500/10 border border-dashed border-purple-500/30 hover:bg-purple-500/20 text-purple-300 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5 font-sans"
                                style={{ fontSize: '11px' }}
                              >
                                Add Time Frame ({dropTimeFrames.length}/3)
                              </button>
                            )}
                          </div>
                        )}




                      </div>
                    </div>

                    {/* Drawer Footer */}
                    <div className="p-3.5 border-t border-white/5 bg-[var(--color-bg-elevated)] space-y-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={addScheduleItem}
                        className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-[11px] uppercase tracking-wider rounded-md shadow-sm transition-colors cursor-pointer border-none"
                      >
                        {editingShiftId ? 'Save Changes' : 'Confirm Schedule'}
                      </button>

                      {editingShiftId && (
                        <button
                          type="button"
                          onClick={() => {
                            deleteScheduleItem(editingShiftId);
                            setActiveDropDay(null);
                            setDraggedCrewMemberId(null);
                            setEditingShiftId(null);
                          }}
                          className="w-full py-1.5 bg-red-600/20 hover:bg-red-600 border border-red-500/30 text-red-200 hover:text-white font-extrabold text-[10.5px] uppercase tracking-wider rounded-md transition-colors cursor-pointer"
                        >
                          Delete Shift
                        </button>
                      )}
                    </div>

                  </div>
                </div>
              );
            })()}

            {/*  Custom Alert / Notification Modal */}
            {alertModal.isOpen && (
              <dialog
                open
                aria-label="Schedule Notice Modal"
                className="fixed inset-0 bg-black/75 z-[120] flex items-center justify-center p-4 m-0 border-none max-w-none w-full h-full animate-[fadeIn_0.2s_ease]"
                onKeyDown={(e) => {
                  if (e.key === "Escape") setAlertModal({ ...alertModal, isOpen: false });
                }}
              >
                <button
                  type="button"
                  aria-label="Close modal backdrop"
                  onClick={() => setAlertModal({ ...alertModal, isOpen: false })}
                  className="absolute inset-0 cursor-pointer border-none bg-transparent w-full h-full"
                />
                <div
                  className="bg-[#181920] border border-purple-500/30 w-full max-w-md p-6 flex flex-col items-center text-center space-y-4 animate-[scaleIn_0.2s_cubic-bezier(0.16,1,0.3,1)] select-none relative z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-2xl shadow-inner shrink-0">
                    {alertModal.type === 'error' ? '' : alertModal.type === 'success' ? '' : alertModal.type === 'info' ? 'ℹ' : ''}
                  </div>
                  <div>
                    <h3 className="text-sm font-black italic tracking-wide text-white uppercase font-sans">{alertModal.title || 'Schedule Notice'}</h3>
                    <p className="text-xs text-white/80 mt-2 font-medium leading-relaxed font-sans whitespace-pre-line">{alertModal.message}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAlertModal({ ...alertModal, isOpen: false })}
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase tracking-wider transition-colors cursor-pointer border-none mt-2"
                  >
                    Got It
                  </button>
                </div>
              </dialog>
            )}

            {/*  Create Group Modal Pop-up */}
            {isCreateGroupModalOpen && (
              <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease]">
                <div
                  className="bg-[var(--color-bg-card)] border border-white/10 w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden animate-[scaleIn_0.25s_cubic-bezier(0.16,1,0.3,1)]"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Modal Header */}
                  <div className="p-5 border-b border-white/5 bg-[var(--color-bg-elevated)] flex items-center justify-between shrink-0">
                    <div>
                      <h3 className="text-sm font-black italic tracking-wide text-white">Create New Crew Group</h3>
                      <p className="text-[var(--font-size-3xs)] text-white/40 uppercase tracking-widest font-bold mt-1">Select members and customize their shift slots</p>
                    </div>
                    <button
                      aria-label="Close create group modal"
                      onClick={() => {
                        setIsCreateGroupModalOpen(false);
                        createGroupForDateRef.current = null;
                      }}
                      className="text-white/40 hover:text-white transition-colors cursor-pointer border-none bg-transparent text-sm"
                    >✕

                    </button>
                  </div>

                  {/* Modal Form Content */}
                  <div className="p-5 flex-1 overflow-y-auto space-y-5 custom-scrollbar min-h-0">

                    {/* Group Name input */}
                    <div className="space-y-1.5">
                      <label htmlFor="admin-new-group-name" className="text-[var(--font-size-3xs)] uppercase tracking-wider text-white/50 font-extrabold">Group Name</label>
                      <input
                        id="admin-new-group-name"
                        type="text"
                        value={newGroupNameInput}
                        onChange={(e) => setNewGroupNameInput(e.target.value)}
                        placeholder="e.g. Weekend Tech Crew"
                        className="w-full px-3.5 py-2.5   border border-white/10 text-xs text-white rounded-lg outline-none focus:border-emerald-500/50 transition-colors font-bold"
                      />
                    </div>

                    {/* Member Pick list */}
                    <div className="space-y-2">
                      <span className="text-[var(--font-size-3xs)] uppercase tracking-wider text-white/50 font-extrabold block">Select Crew Members</span>

                      <div className="border border-white/5 bg-black/20 divide-y divide-white/5 overflow-hidden">
                        {crewMembers.flatMap((m) => {
                          if (m.id === 'openshifts') return [];
                          const setting = newGroupMemberSettings[m.id] || { active: false, role: m.role || 'SERVER', startHour: 17.0, endHour: 22.0 };

                          return [(
                            <div key={m.id} className="p-3 transition-colors hover:bg-white/[0.01]">
                              <label className="flex items-center justify-between gap-3 cursor-pointer select-none py-1 px-1.5 -mx-1.5 rounded-lg hover:bg-white/5 transition-colors group">
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
                                          active: act,
                                          timeFrames: (prev[m.id]?.timeFrames && prev[m.id]?.timeFrames!.length > 0)
                                            ? prev[m.id]?.timeFrames!
                                            : [{ startHour: 17.0, endHour: 22.0, role: m.role || 'STAGE HAND' }]
                                        }
                                      }));
                                    }}
                                    className="accent-emerald-500 w-4 h-4 cursor-pointer"
                                  />
                                  <div
                                    className="w-5 h-5 rounded-full flex items-center justify-center text-4xs font-extrabold text-white uppercase shrink-0 font-sans shadow-sm"
                                    style={{ backgroundColor: m.color || getAvatarColor(m.name) }}
                                  >
                                    {m.initials || m.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-white/80 group-hover:text-white truncate transition-colors">{m.name}</p>
                                    <span className="text-white/40 uppercase font-semibold tracking-wider block leading-tight mt-0.5" style={{ fontSize: '8px' }}>{m.role || 'Crew'}</span>
                                  </div>
                                </div>
                              </label>

                              {/* Multiple time frames and role pill selector when active */}
                              {setting.active && (
                                <div className="w-full mt-2.5 pt-2.5 border-t border-white/5 space-y-3 animate-[fadeIn_0.15s_ease] font-sans">
                                  {(setting.timeFrames || [{ startHour: setting.startHour || 17, endHour: setting.endHour || 22, role: setting.role || 'STAGE HAND' }]).map((tf, tfIdx) => (
                                    <div key={tfIdx} className="p-2.5 bg-black/40 border border-white/10 space-y-2 relative">
                                      <div className="flex items-center justify-between">
                                        <span className="uppercase tracking-wider text-purple-300 font-extrabold" style={{ fontSize: '9.5px' }}>
                                          Time Frame {tfIdx + 1}
                                        </span>
                                        {(setting.timeFrames || []).length > 1 && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const currentTfs = setting.timeFrames || [];
                                              const nextTfs = currentTfs.filter((_, i) => i !== tfIdx);
                                              setNewGroupMemberSettings(prev => ({
                                                ...prev,
                                                [m.id]: {
                                                  ...prev[m.id],
                                                  timeFrames: nextTfs
                                                }
                                              }));
                                            }}
                                            className="text-red-400 hover:text-red-300 font-bold uppercase tracking-wider cursor-pointer border-none bg-transparent"
                                            style={{ fontSize: '8px' }}
                                          >
                                            Remove
                                          </button>
                                        )}
                                      </div>

                                      {/* Start / End selects */}
                                      <div className="grid grid-cols-2 gap-2">
                                        <div>
                                          <label htmlFor={`admin-group-member-${m.id}-tf-${tfIdx}-start`} className="uppercase tracking-wider text-white/50 mb-0.5 block font-bold" style={{ fontSize: '7.5px' }}>Start Time</label>
                                          <select
                                            id={`admin-group-member-${m.id}-tf-${tfIdx}-start`}
                                            value={tf.startHour}
                                            onChange={(e) => {
                                              const h = parseFloat(e.target.value);
                                              const currentTfs = [...(setting.timeFrames || [{ startHour: 17, endHour: 22, role: 'STAGE HAND' }])];
                                              const newEnd = tf.endHour <= h ? Math.min(24, h + 1) : tf.endHour;
                                              currentTfs[tfIdx] = { ...tf, startHour: h, endHour: newEnd };
                                              setNewGroupMemberSettings(prev => ({
                                                ...prev,
                                                [m.id]: { ...prev[m.id], timeFrames: currentTfs }
                                              }));
                                            }}
                                            className="w-full px-2 py-1   border border-white/10 text-white rounded outline-none font-bold cursor-pointer"
                                            style={{ fontSize: '9.5px' }}
                                          >
                                            {generateTimeOptions().slice(0, -1).map(opt => (
                                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                          </select>
                                        </div>

                                        <div>
                                          <label htmlFor={`admin-group-member-${m.id}-tf-${tfIdx}-end`} className="uppercase tracking-wider text-white/50 mb-0.5 block font-bold" style={{ fontSize: '7.5px' }}>End Time</label>
                                          <select
                                            id={`admin-group-member-${m.id}-tf-${tfIdx}-end`}
                                            value={tf.endHour}
                                            onChange={(e) => {
                                              const h = parseFloat(e.target.value);
                                              const currentTfs = [...(setting.timeFrames || [{ startHour: 17, endHour: 22, role: 'STAGE HAND' }])];
                                              currentTfs[tfIdx] = { ...tf, endHour: h };
                                              setNewGroupMemberSettings(prev => ({
                                                ...prev,
                                                [m.id]: { ...prev[m.id], timeFrames: currentTfs }
                                              }));
                                            }}
                                            className="w-full px-2 py-1   border border-white/10 text-white rounded outline-none font-bold cursor-pointer"
                                            style={{ fontSize: '9.5px' }}
                                          >
                                            {generateTimeOptions().flatMap(opt => opt.value > tf.startHour ? (
                                              [<option key={opt.value} value={opt.value}>{opt.label}</option>]
                                            ) : [])}
                                          </select>
                                        </div>
                                      </div>

                                      {/* Multi-role selection pills */}
                                      <div>
                                        <span className="uppercase tracking-wider text-white/50 mb-1 block font-bold" style={{ fontSize: '7.5px' }}>Roles / Duties</span>
                                        <div className="flex flex-wrap gap-1">
                                          {["STAGE HAND", "AUDIO MIX", "LIGHTS", "EQUIPMENT SETUP", "TEAR DOWN", "MERCH", "TOUR MANAGER", "SOUND ENGINEER", "STAGE MANAGER", "PHOTOGRAPHER", "CAMERA", "BAND MEMBER"].map(preset => {
                                            const currentRoles = tf.role ? tf.role.split(/[,|/]/).map((r: string) => r.trim().toUpperCase()).filter(Boolean) : [];
                                            const isSelected = currentRoles.includes(preset.toUpperCase());
                                            return (
                                              <button
                                                key={preset}
                                                type="button"
                                                onClick={() => {
                                                  const rawRoles = tf.role ? tf.role.split(/[,|/]/).map((r: string) => r.trim()).filter(Boolean) : [];
                                                  const upperPreset = preset.toUpperCase();
                                                  const exists = rawRoles.some((r: string) => r.toUpperCase() === upperPreset);
                                                  let newRoles: string[];
                                                  if (exists) {
                                                    newRoles = rawRoles.filter((r: string) => r.toUpperCase() !== upperPreset);
                                                  } else {
                                                    newRoles = [...rawRoles, preset];
                                                  }
                                                  const newRoleStr = newRoles.join(', ');
                                                  const currentTfs = [...(setting.timeFrames || [{ startHour: 17, endHour: 22, role: 'STAGE HAND' }])];
                                                  currentTfs[tfIdx] = { ...tf, role: newRoleStr };
                                                  setNewGroupMemberSettings(prev => ({
                                                    ...prev,
                                                    [m.id]: { ...prev[m.id], timeFrames: currentTfs }
                                                  }));
                                                }}
                                                className={`px-1.5 py-0.5 rounded-full font-black uppercase tracking-wider border transition-colors cursor-pointer ${isSelected
                                                  ? 'bg-purple-600 text-white border-purple-500 shadow-xs'
                                                  : 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10'
                                                  }`}
                                                style={{ fontSize: '7.5px' }}
                                              >
                                                {isSelected ? `✓ ${preset}` : preset}
                                              </button>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    </div>
                                  ))}

                                  <button
                                    type="button"
                                    onClick={() => {
                                      const currentTfs = setting.timeFrames || [{ startHour: 17, endHour: 22, role: 'STAGE HAND' }];
                                      const lastEnd = currentTfs[currentTfs.length - 1]?.endHour || 17;
                                      const newStart = Math.min(23, lastEnd);
                                      const newEnd = Math.min(24, newStart + 2);
                                      const nextTfs = [...currentTfs, { startHour: newStart, endHour: newEnd, role: 'STAGE HAND' }];
                                      setNewGroupMemberSettings(prev => ({
                                        ...prev,
                                        [m.id]: {
                                          ...prev[m.id],
                                          timeFrames: nextTfs
                                        }
                                      }));
                                    }}
                                    className="w-full py-1.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 font-extrabold uppercase tracking-wider rounded-lg transition-colors cursor-pointer text-center"
                                    style={{ fontSize: '8.5px' }}
                                  >
                                    + Add Time Frame
                                  </button>
                                </div>
                              )}
                            </div>
                          )];
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="p-5 border-t border-white/5 bg-[var(--color-bg-elevated)] flex items-center justify-between gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreateGroupModalOpen(false);
                        createGroupForDateRef.current = null;
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
                          const tfs = s.timeFrames || [{ startHour: s.startHour || 17, endHour: s.endHour || 22, role: s.role || 'STAGE HAND' }];
                          memberSettings[id] = {
                            startHour: tfs[0].startHour,
                            endHour: tfs[0].endHour,
                            role: tfs[0].role,
                            timeFrames: tfs
                          };
                        });

                        const newGroup = {
                          name: newGroupNameInput.trim(),
                          memberIds,
                          memberSettings
                        };

                        setCrewGroups(current => [...current, newGroup]);

                        if (createGroupForDateRef.current) {
                          handleAddGroupToDay(createGroupForDateRef.current, newGroup);
                        }

                        setIsCreateGroupModalOpen(false);
                        createGroupForDateRef.current = null;
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
                <div className="fixed inset-0 bg-transparent z-[999] flex justify-end animate-[fadeIn_0.2s_ease]">
                  {/* Backdrop Click Overlay */}
                  <button
                    type="button"
                    aria-label="Close overlay"
                    className="absolute inset-0 cursor-default border-0 bg-transparent"
                    onClick={() => setSelectedShowCrewDate(null)}
                  />

                  <div className="relative bg-[var(--color-bg-card)] border-l border-white/10 w-full max-w-md h-full flex flex-col justify-between animate-[slideInRight_0.3s_cubic-bezier(0.16,1,0.3,1)]">

                    {/* Header */}
                    <div className="p-5 border-b border-white/5 bg-[var(--color-bg-elevated)] flex items-center justify-between shrink-0">
                      <div>
                        <h3 className="text-sm font-black italic tracking-wide text-white">
                          Show Crew Roster
                        </h3>
                        <p className="text-[0.65rem] text-purple-300 uppercase tracking-widest font-bold mt-1">
                          {new Date(selectedShowCrewDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} — {show.venue || show.venue_name}
                        </p>
                      </div>
                      <button
                        aria-label="Close selected show crew date modal"
                        onClick={() => setSelectedShowCrewDate(null)}
                        className="text-white/45 hover:text-white transition-colors cursor-pointer border-none bg-transparent text-sm"
                      >✕</button>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-4 flex-1 overflow-y-auto">
                      {/* Show Stats Summary */}
                      <div className="grid grid-cols-3 gap-2 text-center bg-black/20 p-3 border border-white/5">
                        <div>
                          <span className="text-[var(--font-size-3xs)] text-white/40 block">Total Shift(s)</span>
                          <span className="text-sm font-black text-white">{dayShifts.length}</span>
                        </div>
                        <div>
                          <span className="text-[var(--font-size-3xs)] text-white/40 block">Staff Scheduled</span>
                          <span className="text-sm font-black text-[var(--color-accent)]">{filledShifts.length}</span>
                        </div>
                        <div>
                          <span className="text-[var(--font-size-3xs)] text-white/40 block">Open Position(s)</span>
                          <span className="text-sm font-black text-purple-300">{openShifts.length}</span>
                        </div>
                      </div>

                      {/* Scheduled Crew Section */}
                      <div>
                        <h4 className="text-[var(--font-size-3xs)] font-black uppercase text-white/40 tracking-wider mb-2.5">Scheduled Crew</h4>
                        {filledShifts.length === 0 ? (
                          <div className="text-center py-4 bg-white/[0.01] border border-dashed border-white/5 text-white/30 text-xs italic">
                            No crew members scheduled yet
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {filledShifts.map(shift => {
                              const member = crewMembers.find(c => c.id === shift.crewId);
                              const initials = member?.initials || shift.crewName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
                              const color = member?.color || getAvatarColor(shift.crewName);

                              return (
                                <div key={shift.id} className="bg-black/20 border border-white/5 p-3 flex items-center justify-between gap-3 hover:border-white/10 transition-colors">
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    {member?.avatar ? (
                                      <img src={member.avatar} alt="7th Heaven Media" className="w-8 h-8 rounded-full object-cover shrink-0" />
                                    ) : (
                                      <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[var(--font-size-3xs)] text-white shrink-0" style={{ backgroundColor: color }}>
                                        {initials}
                                      </div>
                                    )}
                                    <div className="min-w-0">
                                      <span className="text-xs font-bold text-white block truncate">{shift.crewName}</span>
                                      <span className="text-[var(--font-size-4xs)] text-white/45 bg-white/5 px-1.5 py-0.5 rounded uppercase font-black leading-none mt-1 inline-block">
                                        {shift.role}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="text-right shrink-0">
                                    <span className="text-[var(--font-size-3xs)] font-extrabold text-white/85 block">{shift.time}</span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedShowCrewDate(null);
                                        handleEditShiftClick(shift);
                                      }}
                                      className="text-[8.5px] font-black uppercase text-purple-300 hover:text-white bg-purple-500/10 hover:bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/20 hover:border-purple-500/40 transition-colors cursor-pointer mt-1 inline-block"
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
                        <h4 className="text-[var(--font-size-3xs)] font-black uppercase text-white/40 tracking-wider mb-2.5">Open Positions</h4>
                        {openShifts.length === 0 ? (
                          <div className="text-center py-4 bg-white/[0.01] border border-dashed border-white/5 text-white/30 text-xs italic">
                            No open positions
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {openShifts.map(shift => (
                              <div key={shift.id} className="bg-emerald-500/[0.02] border border-dashed border-emerald-500/25 p-3 flex items-center justify-between gap-3 hover:border-emerald-500/40 transition-colors">
                                <div>
                                  <span className="text-[var(--font-size-4xs)] text-white/40 block mt-0.5">{shift.time}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedShowCrewDate(null);
                                    handleEditShiftClick(shift);
                                  }}
                                  className="text-[var(--font-size-4xs)] font-black uppercase text-black bg-emerald-400 hover:bg-emerald-300 px-3 py-1.5 rounded-lg border-none cursor-pointer transition-colors shadow-sm"
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
    <div id="admin-dashboard-root" className="min-h-screen    text-[var(--text-color)] pt-[122px] pb-12 font-sans selection:bg-[var(--color-accent)] selection:text-white relative overflow-x-clip">
      <style>{`
        @keyframes slideIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes coveragePulseGlow {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          50% { transform: scale(1.03); box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        .coverage-highlight-glow {
          animation: coveragePulseGlow 1.5s ease-in-out infinite;
          border: 2px solid #ef4444 !important;
          z-index: 50 !important;
        }

        /* Dynamic Theme Variables for Admin Dashboard */
        #admin-dashboard-root {
          background-color: var(--bg-color) !important;
          color: var(--text-color) !important;
        }

        #admin-dashboard-root h1,
        #admin-dashboard-root h2,
        #admin-dashboard-root h3,
        #admin-dashboard-root h4,
        #admin-dashboard-root h5,
        #admin-dashboard-root h6,
        #admin-dashboard-root p,
        #admin-dashboard-root span:not(.badge-text),
        #admin-dashboard-root label,
        #admin-dashboard-root td,
        #admin-dashboard-root th,
        #admin-dashboard-root input,
        #admin-dashboard-root select,
        #admin-dashboard-root textarea {
          color: var(--text-color);
        }

        /* Protect CruiseChat styling & Live SMS Preview from global admin text overrides */
        #admin-dashboard-root #cruise-chat-root [class*="text-white"] {
          color: #ffffff !important;
        }

        #admin-dashboard-root .live-sms-preview-box {
          background-color: #0d0e17 !important;
          color: #ffffff !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
        }

        /* Solid button overrides so button labels remain white where appropriate */
        #admin-dashboard-root .bg-red-600,
        #admin-dashboard-root .bg-purple-600,
        #admin-dashboard-root .bg-cyan-600,
        #admin-dashboard-root .bg-emerald-600,
        #admin-dashboard-root .bg-purple-700,
        #admin-dashboard-root button[class*="bg-red-600"],
        #admin-dashboard-root button[class*="bg-purple-600"] {
          color: #ffffff !important;
        }

        #admin-dashboard-root input[type="checkbox"] {
          accent-color: #ffffff !important;
        }

        /* Transparent Section Header Bars & Universal Hover Highlight */
        #admin-dashboard-root .admin-section-header,
        #admin-dashboard-root div[role="button"][tabIndex],
        #admin-dashboard-root div[onClick*="toggleSection"] {
          background-color: transparent !important;
          background: transparent !important;
          border-bottom: 1px solid var(--border-color) !important;
          padding-left: 0px !important;
          border-top-left-radius: 0px !important;
          border-top-right-radius: 0px !important;
          transition: background-color 0.2s ease-in-out !important;
        }

        /* Remove All Hover Background Highlights Across Sections, Cards, and Rows */
        #admin-dashboard-root .admin-section-header:hover,
        #admin-dashboard-root div[role="button"][tabIndex]:hover,
        #admin-dashboard-root div[onClick*="toggleSection"]:hover,
        #admin-dashboard-root section:hover,
        #admin-dashboard-root [id^="admin-sec-"]:hover,
        #admin-dashboard-root tr:hover,
        #admin-dashboard-root div[class*="hover:bg-"]:hover {
          background-color: transparent !important;
          background: transparent !important;
        }

        /* Inline Load-In Input Styling */
        #admin-dashboard-root .inline-loadin-popover {
          background-color: transparent !important;
          background: transparent !important;
          border: none !important;
        }

        #admin-dashboard-root .admin-section-header h3,
        #admin-dashboard-root .admin-section-header span,
        #admin-dashboard-root .admin-section-header svg,
        #admin-dashboard-root .admin-section-header p,
        #admin-dashboard-root div[role="button"][tabIndex] h3,
        #admin-dashboard-root div[role="button"][tabIndex] span,
        #admin-dashboard-root div[role="button"][tabIndex] svg,
        #admin-dashboard-root div[role="button"][tabIndex] p {
          color: var(--text-color) !important;
        }

        /* Force section card bodies and inner components to have zero container borders & transparent backgrounds */
        #admin-dashboard-root section,
        #admin-dashboard-root [id^="admin-sec-"],
        #admin-dashboard-root [class*="border"],
        #admin-dashboard-root .border,
        #admin-dashboard-root .border-b,
        #admin-dashboard-root .border-t,
        #admin-dashboard-root .border-white\/10,
        #admin-dashboard-root .border-white\/5,
        #admin-dashboard-root .border-purple-500\/20,
        #admin-dashboard-root .border-rose-500\/20,
        #admin-dashboard-root .border-amber-500\/20,
        #admin-dashboard-root .border-cyan-500\/20,
        #admin-dashboard-root .border-\[\#ffffff1f\],
        #admin-dashboard-root .border-\[var\(--border-color\)\] {
          background-color: transparent !important;
          background: transparent !important;
          border: none !important;
          border-style: none !important;
          border-width: 0px !important;
          border-color: transparent !important;
          box-shadow: none !important;
          color: var(--text-color) !important;
        }

        #admin-dashboard-root div[role="button"][tabIndex] {
          border-bottom: none !important;
          border-bottom-width: 0px !important;
        }

        #admin-dashboard-root table thead tr,
        #admin-dashboard-root table tr.bg-black\/20 {
          background-color: transparent !important;
          background: transparent !important;
        }

        /* Universal Custom Dropdown Select & Option Styling */
        #admin-dashboard-root select,
        #admin-dashboard-root select.bg-white,
        #admin-dashboard-root select[class*="bg-white"] {
          background-color: #9333ea !important;
          background: #9333ea !important;
          color: #ffffff !important;
          border: 1px solid #c084fc !important;
          border-radius: 8px !important;
          padding-right: 2.25rem !important;
          appearance: none !important;
          -webkit-appearance: none !important;
          -moz-appearance: none !important;
          background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23ec4899%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E") !important;
          background-repeat: no-repeat !important;
          background-position: right 0.75rem center !important;
          background-size: 0.6rem auto !important;
          cursor: pointer !important;
          box-shadow: 0 0 15px rgba(147, 51, 234, 0.15) !important;
        }

        #admin-dashboard-root select option,
        #admin-dashboard-root select option.bg-white,
        #admin-dashboard-root select option[class*="bg-white"] {
          background-color: #0c0d12 !important;
          color: #ffffff !important;
        }

        #admin-dashboard-root #admin-sec-cruise-command,
        #admin-dashboard-root #admin-sec-cruise-roster,
        #admin-dashboard-root #admin-sec-cruise-blast {
          background-color: transparent !important;
          border: none !important;
          box-shadow: none !important;
        }

        /* Global Textarea & Input Style: Transparent Background & Crisp White Text */
        #admin-dashboard-root textarea,
        #admin-dashboard-root input[type="text"],
        #admin-dashboard-root input[type="email"],
        #admin-dashboard-root input[type="password"],
        #admin-dashboard-root select {
          background-color: transparent !important;
          background: transparent !important;
          color: #ffffff !important;
          border-color: rgba(255, 255, 255, 0.15) !important;
        }

        #admin-dashboard-root textarea::placeholder,
        #admin-dashboard-root input::placeholder {
          color: rgba(255, 255, 255, 0.4) !important;
        }

        /* Ensure all text inside stat cards, alert boxes, and presets renders in crisp black */
        #admin-dashboard-root .bg-rose-50 *,
        #admin-dashboard-root .bg-amber-50 *,
        #admin-dashboard-root .bg-purple-50 *,
        #admin-dashboard-root .bg-emerald-50 *,
        #admin-dashboard-root .bg-cyan-50 *,
        #admin-dashboard-root .bg-rose-100 *,
        #admin-dashboard-root .bg-amber-100 *,
        #admin-dashboard-root .bg-purple-100 *,
        #admin-dashboard-root .bg-emerald-100 *,
        #admin-dashboard-root .bg-cyan-100 * {
          color: #000000 !important;
        }

        /* Text Boxes & Rich Text Editor: Dark Gray Background & Crisp White Text */
        #admin-dashboard-root .quill,
        #admin-dashboard-root .ql-container,
        #admin-dashboard-root .ql-editor,
        #admin-dashboard-root .ql-toolbar {
          background-color: #22222e !important;
          color: #ffffff !important;
          border-color: rgba(255, 255, 255, 0.2) !important;
        }

        #admin-dashboard-root .ql-editor,
        #admin-dashboard-root .ql-editor *,
        #admin-dashboard-root .ql-editor p,
        #admin-dashboard-root .ql-editor h1,
        #admin-dashboard-root .ql-editor h2,
        #admin-dashboard-root .ql-editor h3,
        #admin-dashboard-root .ql-editor span,
        #admin-dashboard-root .ql-editor strong,
        #admin-dashboard-root .ql-editor em {
          color: #ffffff !important;
        }

        #admin-dashboard-root .ql-editor.ql-blank::before {
          color: rgba(255, 255, 255, 0.5) !important;
        }

        #admin-dashboard-root .ql-snow .ql-stroke {
          stroke: #ffffff !important;
        }

        #admin-dashboard-root .ql-snow .ql-fill {
          fill: #ffffff !important;
        }

        #admin-dashboard-root .ql-snow .ql-picker {
          color: #ffffff !important;
        }

        /* ReactQuill Dropdown Pickers & Format Popup Options */
        #admin-dashboard-root .ql-snow .ql-picker-label,
        #admin-dashboard-root .ql-snow .ql-picker-label *,
        #admin-dashboard-root .ql-snow .ql-picker-options,
        #admin-dashboard-root .ql-snow .ql-picker-item,
        #admin-dashboard-root .ql-snow .ql-picker-item *,
        #admin-dashboard-root .ql-snow .ql-picker-label::before,
        #admin-dashboard-root .ql-snow .ql-picker-item::before {
          color: #ffffff !important;
        }

        #admin-dashboard-root .ql-snow .ql-picker-options {
          background-color: #1e1e28 !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5) !important;
        }

        #admin-dashboard-root .ql-snow .ql-picker-item:hover,
        #admin-dashboard-root .ql-snow .ql-picker-item.ql-selected {
          color: #38bdf8 !important;
        }

        /* Guidelines Welcome Pack Editor Light Mode (Exact Match to /cruise/michael) */
        #admin-dashboard-root .guidelines-wysiwyg-editor .quill,
        #admin-dashboard-root .guidelines-wysiwyg-editor .ql-container,
        #admin-dashboard-root .guidelines-wysiwyg-editor .ql-editor {
          background-color: #ffffff !important;
          color: rgba(0, 0, 0, 0.85) !important;
          border-color: rgba(0, 0, 0, 0.15) !important;
        }

        #admin-dashboard-root .guidelines-wysiwyg-editor .ql-editor,
        #admin-dashboard-root .guidelines-wysiwyg-editor .ql-editor *,
        #admin-dashboard-root .guidelines-wysiwyg-editor .ql-editor p,
        #admin-dashboard-root .guidelines-wysiwyg-editor .ql-editor h1,
        #admin-dashboard-root .guidelines-wysiwyg-editor .ql-editor h2,
        #admin-dashboard-root .guidelines-wysiwyg-editor .ql-editor h3,
        #admin-dashboard-root .guidelines-wysiwyg-editor .ql-editor span,
        #admin-dashboard-root .guidelines-wysiwyg-editor .ql-editor strong,
        #admin-dashboard-root .guidelines-wysiwyg-editor .ql-editor em,
        #admin-dashboard-root .guidelines-wysiwyg-editor .ql-editor li {
          color: rgba(0, 0, 0, 0.85) !important;
          font-family: inherit !important;
        }

        #admin-dashboard-root .guidelines-wysiwyg-editor .ql-editor a,
        #admin-dashboard-root .guidelines-wysiwyg-editor .ql-editor a *,
        #admin-dashboard-root .guidelines-wysiwyg-editor .ql-editor a span,
        #admin-dashboard-root .guidelines-wysiwyg-editor .ql-editor a strong {
          color: #0891b2 !important;
          text-decoration: underline !important;
          text-underline-offset: 4px !important;
          font-weight: 700 !important;
        }

        #admin-dashboard-root .guidelines-wysiwyg-editor .ql-editor.ql-blank::before {
          color: rgba(0, 0, 0, 0.4) !important;
        }

        #admin-dashboard-root .guidelines-wysiwyg-editor .ql-toolbar {
          background-color: #f8fafc !important;
          border-color: rgba(0, 0, 0, 0.15) !important;
        }

        #admin-dashboard-root .guidelines-wysiwyg-editor .ql-toolbar .ql-stroke {
          stroke: #334155 !important;
        }

        #admin-dashboard-root .guidelines-wysiwyg-editor .ql-toolbar .ql-fill {
          fill: #334155 !important;
        }

        #admin-dashboard-root .guidelines-wysiwyg-editor .ql-toolbar .ql-picker,
        #admin-dashboard-root .guidelines-wysiwyg-editor .ql-toolbar .ql-picker-label,
        #admin-dashboard-root .guidelines-wysiwyg-editor .ql-toolbar .ql-picker-label::before,
        #admin-dashboard-root .guidelines-wysiwyg-editor .ql-toolbar .ql-picker-label *,
        #admin-dashboard-root .guidelines-wysiwyg-editor .ql-toolbar .ql-picker-item,
        #admin-dashboard-root .guidelines-wysiwyg-editor .ql-toolbar .ql-picker-item::before,
        #admin-dashboard-root .guidelines-wysiwyg-editor .ql-toolbar .ql-picker-item * {
          color: #000000 !important;
        }

        #admin-dashboard-root .guidelines-wysiwyg-editor .ql-toolbar .ql-picker-options {
          background-color: #ffffff !important;
          border-color: rgba(0, 0, 0, 0.15) !important;
        }

        #admin-dashboard-root textarea {
          background-color: #ffffff !important;
          color: #000000 !important;
          border-color: rgba(0, 0, 0, 0.15) !important;
        }

        #admin-dashboard-root textarea::placeholder {
          color: rgba(0, 0, 0, 0.4) !important;
        }

        /* Complete background removal for Admin Dashboard page */
        #admin-dashboard-root,
        #admin-dashboard-root section,
        #admin-dashboard-root article,
        #admin-dashboard-root div:not([class*="bg-purple"]):not([class*="bg-emerald"]):not([class*="bg-rose"]):not([class*="bg-cyan"]):not([class*="bg-amber"]),
        #admin-dashboard-root table,
        #admin-dashboard-root tbody,
        #admin-dashboard-root tr,
        #admin-dashboard-root td,
        #admin-dashboard-root th,
        /* Complete background removal for Admin Dashboard page */
        #admin-dashboard-root,
        #admin-dashboard-root section,
        #admin-dashboard-root article,
        #admin-dashboard-root div:not([class*="bg-purple"]):not([class*="bg-emerald"]):not([class*="bg-rose"]):not([class*="bg-cyan"]):not([class*="bg-amber"]),
        #admin-dashboard-root table,
        #admin-dashboard-root tbody,
        #admin-dashboard-root header,
        #admin-dashboard-root main,
        #admin-dashboard-root [class*="bg-black"],
        #admin-dashboard-root [class*="bg-[#"],
        #admin-dashboard-root [class*="bg-[var(--"] {
          background-color: transparent !important;
          background: transparent !important;
          box-shadow: none !important;
        }

        /* Clean Bottom Border Dividers for List Rows & Table Rows */
        #admin-dashboard-root tr,
        #admin-dashboard-root td,
        #admin-dashboard-root th,
        #admin-dashboard-root .border-b,
        #admin-dashboard-root [class*="border-b"],
        #admin-dashboard-root div[class*="border-b"],
        #admin-dashboard-root li[class*="border-b"] {
          border-bottom: 1px solid rgba(255, 255, 255, 0.15) !important;
        }

        /* Remove Left Padding Across All Section Containers, List Item Rows, and Table Cells */
        #admin-dashboard-root section > div,
        #admin-dashboard-root [id^="admin-sec-"] > div,
        #admin-dashboard-root .admin-section-header,
        #admin-dashboard-root div[role="button"][tabIndex],
        #admin-dashboard-root div[onClick*="toggleSection"],
        #admin-dashboard-root div[class*="overflow-y-auto"],
        #admin-dashboard-root div[class*="custom-scrollbar"],
        #admin-dashboard-root div[class*="border-b"],
        #admin-dashboard-root td:first-child,
        #admin-dashboard-root th:first-child,
        #admin-dashboard-root table td:first-child,
        #admin-dashboard-root table th:first-child {
          padding-left: 0 !important;
        }

        #admin-dashboard-root section > div[role="button"] {
          border-bottom: 1px solid rgba(255, 255, 255, 0.15) !important;
          background-color: transparent !important;
          background: transparent !important;
        }
      `}</style>



      <div className="fixed inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_10%,transparent_100%)] pointer-events-none" />
      <div className="site-container relative z-10 px-4 md:px-6">

        {/* === EXECUTIVE ADMIN HERO HEADER === */}
        <div className="mb-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
          {/* Admin Identity & Badges */}
          <div className="flex items-center gap-5">
            <input
              type="file"
              ref={adminPhotoInputRef}
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (!file.type.startsWith("image/")) return;
                setAdminAvatarUploading(true);
                try {
                  const dataUrl = await compressImage(file);
                  if (dataUrl) {
                    setAdminAvatarOverride(dataUrl);
                    try { localStorage.setItem("7h_profile_avatar", dataUrl); } catch { }
                    try { if (updateAvatar) await updateAvatar(dataUrl); } catch { }
                  }
                } catch (err) {
                  console.error("Avatar upload error:", err);
                } finally {
                  setAdminAvatarUploading(false);
                }
              }}
            />
            <button
              type="button"
              onClick={() => adminPhotoInputRef.current?.click()}
              title="Click to upload crew photo"
              className="relative w-16 h-16 bg-purple-500/10 flex items-center justify-center text-xl font-black  text-[var(--color-accent)] shrink-0 shadow-xs overflow-hidden cursor-pointer group transition-colors"
            >
              {isAvatarUrl ? (
                <img src={activeAdminAvatar} alt={effectiveAdmin.name} className="w-full h-full object-cover" />
              ) : (
                <span>{(effectiveAdmin.name || 'Admin').split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}</span>
              )}
              {/* Hover overlay with camera icon */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[9px] font-bold uppercase transition-opacity">
                <span className="text-sm"></span>
                <span>{adminAvatarUploading ? "..." : "Upload"}</span>
              </div>
            </button>
            <div>
              <div className="flex items-center flex-wrap gap-2.5 mb-1">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[var(--text-color)]">{effectiveAdmin.name}</h1>
                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[0.6rem] font-black uppercase tracking-wider ${(member?.role || effectiveAdmin.role) === 'crew'
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-[var(--color-accent)] dark:text-emerald-300'
                  : 'bg-purple-500/15 border border-purple-500/30 text-purple-300 dark:text-purple-300'
                  }`}>
                  {(member?.role || effectiveAdmin.role) === 'crew' ? ' Crew' : ' Admin'}
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-500/15 border border-rose-500/30 rounded-full text-rose-400 dark:text-rose-300 text-[0.6rem] font-black uppercase tracking-wider animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                  God Mode
                </span>
              </div>
              <p className="text-xs font-mono text-[var(--muted-text)] font-semibold">{effectiveAdmin.email}</p>
              <p className="text-[0.7rem] text-[var(--muted-text)] font-bold mt-0.5">
                {(member?.role || effectiveAdmin.role) === 'crew'
                  ? 'Manage setlists, live feeds, community updates, and crew tools.'
                  : 'Oversee activity, intercept live feeds, and manage community access in real-time.'}
              </p>
            </div>
          </div>

          {/* Right Action Cluster & Tab Switcher */}
          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            {/* Mode Switcher Pills */}
            <div className="relative flex items-center bg-transparent p-1 rounded-full w-full sm:w-auto justify-center select-none">
              {/* Sliding background pill */}
              <div
                className={`absolute top-1 bottom-1 rounded-full transition-colors duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-md ${adminTab === 'band'
                  ? 'left-1 bg-purple-600'
                  : 'left-[calc(50%+2px)] bg-cyan-600'
                  }`}
                style={{ width: 'calc(50% - 4px)' }}
              />

              <button
                type="button"
                onClick={() => { setAdminTab('band'); adminTabRef.current = 'band'; }}
                className={`relative z-10 flex-1 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-colors duration-200 cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${adminTab === 'band' ? 'text-white' : 'text-[var(--muted-text)] hover:text-[var(--text-color)]'
                  }`}
              >
                <span></span>
                <span>Band & Site</span>
              </button>

              <button
                type="button"
                onClick={() => { setAdminTab('cruise'); adminTabRef.current = 'cruise'; setUnreadCruiseChat(0); }}
                className={`relative z-10 flex-1 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-colors duration-200 cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${adminTab === 'cruise' ? 'text-white' : 'text-[var(--muted-text)] hover:text-[var(--text-color)]'
                  }`}
              >
                <span></span>
                <span>Cruise</span>
                {unreadCruiseChat > 0 && adminTab !== 'cruise' && (
                  <span className="min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-rose-600 text-white text-[0.55rem] font-black px-1 shadow-xs border border-white shrink-0 ml-0.5">
                    {unreadCruiseChat > 99 ? '99+' : unreadCruiseChat}
                  </span>
                )}
              </button>
            </div>

            {/* Exit Link */}
            <Link
              href="/"
              className="text-xs font-black uppercase tracking-wider text-black/70 hover:text-black transition-colors flex items-center gap-1.5 py-2 px-1 cursor-pointer"
            >
              Exit to Site →
            </Link>
          </div>
        </div>

        {/*  */}
        {/*   BAND & SITE TAB   */}
        {/*  */}
        {adminTab === 'band' && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              {METRICS.map((metric) => (
                <div key={metric.label} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { if (metric.label === "Booking Requests") document.getElementById("booking-requests-section")?.scrollIntoView({ behavior: "smooth" }); } }} onClick={() => { if (metric.label === "Booking Requests") document.getElementById("booking-requests-section")?.scrollIntoView({ behavior: "smooth" }); }} className={`p-4 rounded-2xl transition-colors ${metric.label === 'Booking Requests' ? 'cursor-pointer' : ''}`}>
                  <p className="text-[0.65rem] font-black uppercase tracking-wider text-[var(--muted-text)] mb-2">{metric.label}</p>
                  <div className="flex items-end justify-between">
                    <span className="text-3xl font-black text-white">{metric.value}</span>
                    <span className={`text-[0.6rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${metric.color}`}>
                      {metric.trend}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-4 w-full mt-4">


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
                  className: "transition-colors duration-300 " + (draggedIndex === index ? 'opacity-40 scale-[0.98]' : '')
                };

                let component = null;
                switch (key) {
                  case 'announcements': component = renderAnnouncements(); break;
                  case 'calendar': component = renderCrewSchedule(); break;
                  case 'analytics': component = renderAnalytics(); break;
                  case 'shopify': component = renderShopify(); break;

                  case 'bookings': component = renderBookings(); break;
                  case 'planners': component = renderPlanners(); break;

                  case 'photomod': component = renderPhotoMod(); break;
                  case 'cruisesignups': component = renderCruiseSignups(); break;

                  case 'livealerts': component = renderLiveAlerts(); break;
                  case 'smsblast': component = renderSmsBlast(); break;
                  case 'crewsms': component = renderCrewSms(); break;
                  case 'bandsms': component = renderBandSms(); break;
                  case 'newsletter': component = renderNewsletter(); break;
                  case 'registry': component = renderRegistry(); break;
                  case 'crewcreation': component = renderCrewCreation(); break;
                  case 'admincreation': component = renderAdminCreation(); break;

                  case 'bulkinvites': component = renderBulkInvites(); break;
                }

                return (
                  <div key={key} id={"admin-sec-" + key} {...dragProps}>
                    {component}
                  </div>
                );
              })}

            </div>

            <div className="flex flex-col gap-4 w-full mt-4">
              <section className="bg-transparent border-t border-white/10 overflow-hidden h-full flex flex-col">
                <div className="admin-section-header py-6 pr-6 pl-0 border-b border-white/10 flex items-center justify-between bg-transparent shrink-0">
                  <h3 className="text-lg font-bold tracking-tight flex items-center gap-2 text-white">
                    Audit Log
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </h3>
                  <span className="text-[0.6rem] text-white/30 uppercase tracking-widest">{auditLog.length} Events</span>
                </div>
                <div className="py-6 pr-6 pl-0 flex flex-col gap-5 flex-1 overflow-y-auto max-h-[500px] custom-scrollbar">
                  {auditLog.map((entry, i) => (
                    <div key={entry.id} className="flex gap-2.5 relative border-b border-white/15 pb-4 pl-0" style={{ animation: i === 0 ? 'slideIn 0.4s ease-out' : 'none' }}>
                      {i < auditLog.length - 1 && (
                        <div className="absolute top-6 bottom-[-20px] left-[5px] w-[2px] bg-white/5" />
                      )}
                      <div className="shrink-0 mt-1">
                        <div className={`w-3.5 h-3.5 rounded-full border-2 border-[#0f0f13] ${entry.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white/80 leading-relaxed mb-1">{entry.text}</p>

                        {entry.details && (
                          <div className="mt-1 mb-2">
                            <button
                              type="button"
                              onClick={() => setExpandedAuditId(prev => prev === entry.id ? null : entry.id)}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[var(--font-size-4xs)] font-bold text-white/60 hover:text-white transition-colors cursor-pointer"
                            >
                              {expandedAuditId === entry.id ? 'Hide Details ' : 'View Message Content '}
                            </button>

                            {expandedAuditId === entry.id && (
                              <div className="mt-2 p-3 bg-transparent border border-white/10 space-y-3 text-xs text-white/80 animate-[slideDown_0.2s_ease-out] max-w-full md:max-w-[650px] overflow-hidden">
                                {entry.details.type === 'signin' && (
                                  <div className="space-y-1.5 font-sans">
                                    <div className="flex justify-between border-b border-white/5 pb-1">
                                      <span className="text-white/40 font-bold uppercase text-[var(--font-size-4xs)] tracking-wider">User</span>
                                      <span className="font-mono text-[var(--color-accent)] font-bold">{entry.details.username}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-white/40 font-bold uppercase text-[var(--font-size-4xs)] tracking-wider">IP Address</span>
                                      <span className="font-mono text-white/70">{entry.details.ipAddress}</span>
                                    </div>
                                  </div>
                                )}

                                {entry.details.smsText && (
                                  <div className="space-y-1.5">
                                    <span className="text-white/40 font-bold uppercase text-[var(--font-size-4xs)] tracking-wider block"> SMS Message Body</span>
                                    <div className="bg-transparent border border-white/5 rounded-lg p-2.5 font-mono text-[var(--font-size-3xs)] whitespace-pre-wrap leading-relaxed text-purple-300">
                                      {entry.details.smsText}
                                    </div>
                                  </div>
                                )}

                                {entry.details.emailHtml && (
                                  <div className="space-y-2">
                                    <div className="border-b border-white/5 pb-1">
                                      <span className="text-white/40 font-bold uppercase text-[var(--font-size-4xs)] tracking-wider block mb-1"> Email Template</span>
                                      <span className="text-[var(--font-size-3xs)] text-white/90 font-bold">Subject: {entry.details.emailSubject}</span>
                                    </div>

                                    <div className="space-y-1.5">
                                      <span className="text-white/40 font-bold uppercase text-[var(--font-size-4xs)] tracking-wider block">Visual Template Render</span>
                                      <div className="bg-[var(--color-bg-surface)] border border-white/5 rounded-lg overflow-hidden p-0.5">
                                        <iframe
                                          srcDoc={`
                                          <!DOCTYPE html>
                                          <html>
                                            <head>
                                              <meta charset="utf-8">
                                              <style>
                                                body {
                                                  margin: 0;
                                                  padding: 10px;
                                                  background: #0f0f13;
                                                  color: #e2e8f0;
                                                  font-family: sans-serif;
                                                  font-size: 11px;
                                                  line-height: 1.5;
                                                }
                                              </style>
                                            </head>
                                            <body>
                                              ${entry.details.emailHtml}
                                            </body>
                                          </html>
                                        `}
                                          className="w-full h-[180px] border-none bg-[var(--color-bg-surface)]"
                                          title="Email Preview"
                                          sandbox="allow-same-origin"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        <p className="text-[0.65rem] uppercase tracking-widest text-white/30">{entry.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

          </>
        )}

        {adminTab === 'cruise' && (
          <>

            {/* === CRUISE BROADCAST CENTER === */}
            <div id="admin-sec-cruise-command" className="pt-2 mb-6 relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-cyan-400 flex items-center justify-center shadow-cyan-500/20 p-[1px]">
                  <div className="w-full h-full   rounded-full flex items-center justify-center">
                    <span className="text-lg"></span>
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-black italic tracking-wide text-white uppercase">Cruise Command Center</h2>
                  <p className="text-[0.65rem] font-bold text-white/40 uppercase tracking-widest">Manage cruise dashboard announcements, links & chat</p>
                </div>
              </div>

              {/* Row 1: 2 Columns — Column 1: Cruise Information & Guidelines (Welcome Pack) | Column 2: Passenger Lounge Live Chat */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start mb-6">
                {/* Column 1: Cruise Information & Guidelines Editor */}
                <div className="relative z-10 bg-[var(--color-bg-surface)]/80 backdrop-blur-xl border border-cyan-500/20 p-6 md:p-8 shadow-xl">
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/5 flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-xl shadow-[0_0_15px_rgba(6,182,212,0.15)]"></div>
                      <div>
                        <h3 className="text-base md:text-lg font-black italic tracking-wide text-white">Cruise Information & Guidelines</h3>
                        <p className="text-[0.65rem] text-purple-400font-bold uppercase tracking-widest leading-relaxed mt-0.5">Welcome Pack content rendered on passenger hub</p>
                      </div>
                    </div>
                    {adminGuidelinesSaveStatus === 'saved' && (
                      <span className="text-xs font-bold text-[var(--color-accent)] bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full animate-pulse">
                        Guidelines Saved!
                      </span>
                    )}
                    {adminGuidelinesSaveStatus === 'error' && (
                      <span className="text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-3 py-1 rounded-full">
                        Error Saving
                      </span>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="admin-guidelines-title" className="text-[0.6rem] font-bold text-white/50 uppercase tracking-widest block mb-1.5 font-sans">Section Title</label>
                        <input
                          id="admin-guidelines-title"
                          type="text"
                          value={adminGuidelinesTitle}
                          onChange={(e) => setAdminGuidelinesTitle(e.target.value)}
                          placeholder="Cruise Information & Guidelines"
                          className="w-full bg-white border border-black/15 px-4 py-2.5 text-xs !text-black outline-none focus:border-cyan-600 transition-colors font-bold"
                        />
                      </div>
                      <div>
                        <label htmlFor="admin-guidelines-subtitle" className="text-[0.6rem] font-bold text-white/50 uppercase tracking-widest block mb-1.5 font-sans">Subtitle Badge</label>
                        <input
                          id="admin-guidelines-subtitle"
                          type="text"
                          value={adminGuidelinesSubtitle}
                          onChange={(e) => setAdminGuidelinesSubtitle(e.target.value)}
                          placeholder="Cruiser Welcome Pack"
                          className="w-full bg-white border border-black/15 px-4 py-2.5 text-xs !text-cyan-700 outline-none focus:border-cyan-600 transition-colors font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <span className="text-[0.6rem] font-bold text-white/40 uppercase tracking-widest block mb-1.5 font-sans">Guidelines Content (WYSIWYG)</span>
                      <div className="w-full text-black guidelines-wysiwyg-editor [&_.ql-editor]:min-h-[220px]">
                        <ReactQuill theme="snow" value={adminGuidelinesContent} onChange={setAdminGuidelinesContent} placeholder="Type welcome pack content and guidelines..." className="bg-white overflow-hidden" />
                      </div>
                    </div>

                    <div className="flex justify-end pt-2 border-t border-white/5">
                      <button
                        onClick={async () => {
                          if (adminGuidelinesUpdatingRef.current) return;
                          adminGuidelinesUpdatingRef.current = true;
                          setAdminGuidelinesUpdating(true);
                          setAdminGuidelinesSaveStatus(null);
                          try {
                            const res = await fetch('/api/cruise/guidelines', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                title: adminGuidelinesTitle,
                                subtitle: adminGuidelinesSubtitle,
                                content: adminGuidelinesContent
                              })
                            });
                            if (res.ok) {
                              setAdminGuidelinesSaveStatus('saved');
                            } else {
                              setAdminGuidelinesSaveStatus('error');
                            }
                          } catch (err) {
                            setAdminGuidelinesSaveStatus('error');
                          } finally {
                            adminGuidelinesUpdatingRef.current = false;
                            setAdminGuidelinesUpdating(false);
                          }
                        }}
                        disabled={adminGuidelinesUpdating}
                        className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white text-[0.65rem] font-black uppercase tracking-widest transition-colors disabled:opacity-50 cursor-pointer shadow-[0_4px_15px_rgba(6,182,212,0.25)] border border-cyan-400/30 flex items-center justify-center gap-2"
                      >
                        <span>{adminGuidelinesUpdating ? 'Saving...' : ' Save Guidelines'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Column 2: Admin Passenger Lounge Live Chat */}
                <CruiseChat memberOverride={member || effectiveAdmin} />
              </div>

              {/* Row 2: Passenger Notice & Cruise Email Broadcast */}
              <div className="grid grid-cols-1 gap-6 relative items-start mb-6">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-r from-cyan-500/10 to-transparent blur-[100px] pointer-events-none rounded-full" />

                <div className={`relative z-10 bg-[var(--color-bg-surface)]/80 backdrop-blur-xl border border-white/5 hover:border-cyan-500/20  p-6 md:p-8 transition-colors duration-500 flex flex-col group overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 group-hover:bg-cyan-500/10 transition-colors duration-700 pointer-events-none" />
                  <div className="relative z-10 flex flex-col gap-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 shrink-0 bg-cyan-500/10 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)] flex items-center justify-center text-2xl transition-colors duration-500"></div>
                        <div>
                          <h3 className="text-lg font-black italic tracking-wide text-white">Passenger Notice & Email Broadcast</h3>
                          <p className="text-[0.65rem] font-bold text-white/40 uppercase tracking-widest leading-relaxed mt-0.5">Post an update to the Cruise Dashboard & email passengers</p>
                        </div>
                      </div>
                      <div className="px-3 py-1.5 rounded-lg border border-cyan-500/20 bg-cyan-500/5 flex items-center gap-2 mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_5px_cyan]" />
                        <span className="text-[0.5rem] font-bold text-purple-400uppercase tracking-widest">Unified Dispatch</span>
                      </div>
                    </div>

                    {cruiseSaveStatus && (
                      <div className={`flex items-center gap-2 px-4 py-2.5  text-[0.6rem] font-bold uppercase tracking-widest animate-[slideIn_0.3s_ease-out] backdrop-blur-md ${cruiseSaveStatus === 'saved' ? 'bg-emerald-500/10 text-[var(--color-accent)] border  border-[var(--color-accent)]/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                        {cruiseSaveStatus === 'saved' ? ' Update dispatched to cruise dashboard & passenger inboxes!' : ' Failed to update — try again'}
                      </div>
                    )}

                    {/* 2 Columns Container: Left Form | Right Live Preview */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
                      {/* Left Column: Form Inputs & Target Controls */}
                      <div className="flex flex-col gap-3 bg-black/20 p-4 md:p-5 border border-white/5 h-full">
                        <div>
                          <label htmlFor="admin-cruise-blast-subject" className="text-[0.6rem] font-bold text-white/40 uppercase tracking-widest block mb-1.5 font-sans">Notice Title / Email Subject Line</label>
                          <input
                            id="admin-cruise-blast-subject"
                            type="text"
                            value={cruiseBlastSubject}
                            onChange={(e) => setCruiseBlastSubject(e.target.value)}
                            placeholder="e.g. TEST, CAPTAIN'S LOG, or  Cruise Update..."
                            className="w-full bg-black/40 border border-white/10 px-4 py-2.5 text-xs text-white outline-none focus:border-cyan-500/60 transition-colors placeholder:text-white/20 mb-2 font-sans"
                          />
                        </div>

                        <div>
                          <span className="text-[0.6rem] font-bold text-white/40 uppercase tracking-widest block mb-1.5 font-sans">Notice & Email Content</span>
                          <div className="w-full text-black guidelines-wysiwyg-editor [&_.ql-editor]:min-h-[160px]">
                            <ReactQuill theme="snow" value={cruiseMessage} onChange={setCruiseMessage} placeholder="Message (e.g. VIP pre-booking opens Friday at 12 PM CST)" className="bg-white overflow-hidden" />
                          </div>
                        </div>

                        {/* Target checkboxes */}
                        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-white/5">
                          <label className="flex items-center gap-2 text-xs font-bold text-white/80 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={postNoticeToDashboard}
                              onChange={(e) => setPostNoticeToDashboard(e.target.checked)}
                              className="w-4 h-4 rounded accent-cyan-500 cursor-pointer"
                            />
                            <span> Live Banner on Dashboard</span>
                          </label>
                          <label className="flex items-center gap-2 text-xs font-bold text-white/80 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={sendEmailToPassengers}
                              onChange={(e) => setSendEmailToPassengers(e.target.checked)}
                              className="w-4 h-4 rounded accent-cyan-500 cursor-pointer"
                            />
                            <span> Email Passenger Signups</span>
                          </label>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 justify-end mt-auto pt-3 border-t border-white/5">
                          <button
                            onClick={async () => {
                              if (cruiseUpdatingRef.current || !cruiseMessage.trim()) return;
                              if (sendEmailToPassengers && !confirm("Dispatch live notice & send email blast to all registered cruise passengers?")) return;
                              cruiseUpdatingRef.current = true;
                              setCruiseUpdating(true);
                              setCruiseSaveStatus(null);
                              try {
                                const cleanedNoticeMsg = cleanWysiwygHtml(cruiseMessage);
                                if (postNoticeToDashboard) {
                                  await updateCruiseMessage(cleanedNoticeMsg);
                                }
                                if (sendEmailToPassengers) {
                                  const emailSubject = cruiseBlastSubject.trim() || " Cruise Update & Passenger Notice";
                                  await fetch('/api/cruise/blast', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ subject: emailSubject, body: cleanedNoticeMsg }),
                                  });
                                }
                                setCruiseSaveStatus('saved');
                              } catch (err) {
                                setCruiseSaveStatus('error');
                              } finally {
                                cruiseUpdatingRef.current = false;
                                setCruiseUpdating(false);
                              }
                            }}
                            disabled={cruiseUpdating || (!postNoticeToDashboard && !sendEmailToPassengers)}
                            className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white text-[0.65rem] font-black uppercase tracking-widest transition-colors disabled:opacity-50 cursor-pointer shadow-[0_4px_15px_rgba(6,182,212,0.25)] border border-cyan-400/30 flex items-center justify-center"
                          >
                            <span className="relative z-10">{cruiseUpdating ? 'Dispatching...' : ' Dispatch Notice & Email'}</span>
                          </button>
                          <button onClick={() => updateCruiseMessage('')} disabled={cruiseUpdating} title="Remove Notice Banner" className="w-10 h-10 flex items-center justify-center border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors disabled:opacity-50 group/trash">
                            <svg className="group-hover/trash:scale-110 transition-transform" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" /></svg>
                          </button>
                        </div>
                      </div>

                      {/* Right Column: Live Real-Time Dispatch Previews (Dashboard Banner + Email Template) */}
                      <div className="p-4 md:p-5 bg-black/40 border border-white/10 shadow-xl font-sans h-full flex flex-col">
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-white/10 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-base"></span>
                            <h4 className="text-xs font-black uppercase tracking-widest text-cyan-400">Live Dispatch Preview</h4>
                          </div>
                          {/* Live Preview Tab Switcher */}
                          <div className="flex items-center gap-1.5 bg-black/50 p-1 border border-white/10">
                            <button
                              type="button"
                              onClick={() => setLivePreviewTab('dashboard')}
                              className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-colors cursor-pointer ${livePreviewTab === 'dashboard'
                                ? 'bg-cyan-500 text-black shadow-md'
                                : 'text-white/60 hover:text-white hover:bg-white/5'
                                }`}
                            >
                              Cruise Dashboard Banner
                            </button>
                            <button
                              type="button"
                              onClick={() => setLivePreviewTab('email')}
                              className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-colors cursor-pointer ${livePreviewTab === 'email'
                                ? 'bg-cyan-500 text-black shadow-md'
                                : 'text-white/60 hover:text-white hover:bg-white/5'
                                }`}
                            >
                              Email Broadcast
                            </button>
                          </div>
                        </div>

                        <CruiseLivePreview
                          livePreviewTab={livePreviewTab}
                          cruiseBlastSubject={cruiseBlastSubject}
                          cruiseMessage={cruiseMessage}
                          sanitizeHtml={sanitizeHtml}
                          cleanWysiwygHtml={cleanWysiwygHtml}
                          cruiseCommunityBlast={cruiseCommunityBlast}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Full Interactive Cruise Signups Table & Registrants Manager */}
            <div className="mt-6">
              {renderCruiseSignups()}
            </div>

            {/* Cruise Roster & Signup Stats */}
            <div id="admin-sec-cruise-roster" className="grid grid-cols-1 gap-6 relative items-start mt-6">
              <div className="relative z-10 bg-[var(--color-bg-surface)]/80 backdrop-blur-xl border border-white/5 hover: border-[var(--color-accent)]/30 p-6 md:p-8 transition-colors duration-500 flex flex-col group overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 group-hover:bg-emerald-500/10 transition-colors duration-700 pointer-events-none" />
                <div className="relative z-10 flex flex-col gap-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 shrink-0 bg-emerald-500/10 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)] flex items-center justify-center text-2xl transition-colors duration-500"></div>
                    <div>
                      <h3 className="text-lg font-black italic tracking-wide text-white">Cruise Roster</h3>
                      <p className="text-[0.65rem] font-bold text-white/40 uppercase tracking-widest leading-relaxed mt-0.5">Signups & Passenger Manifest</p>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-black/30 p-3 border border-white/5 text-center">
                      <p className="text-2xl font-black text-[var(--color-accent)]">{cruiseStats.signups || 0}</p>
                      <p className="text-[0.5rem] font-bold text-white/30 uppercase tracking-widest mt-0.5">Bookings</p>
                    </div>
                    <div className="bg-black/30 p-3 border border-white/5 text-center">
                      <p className="text-2xl font-black text-white">{cruiseStats.total}</p>
                      <p className="text-[0.5rem] font-bold text-white/30 uppercase tracking-widest mt-0.5">Total Pax</p>
                    </div>
                    <div className="bg-black/30 p-3 border border-white/5 text-center">
                      <p className="text-lg font-black text-white/60">{cruiseStats.adults}<span className="text-white/20 mx-0.5">/</span>{cruiseStats.children}</p>
                      <p className="text-[0.5rem] font-bold text-white/30 uppercase tracking-widest mt-0.5">Adult / Child</p>
                    </div>
                  </div>

                  {/* Recent Signups */}
                  {(cruiseStats.recentSignups?.length ?? 0) > 0 && (
                    <div>
                      <p className="text-[0.55rem] font-bold text-white/30 uppercase tracking-widest mb-2">Recent Signups</p>
                      <div className="max-h-[220px] overflow-y-auto scrollbar-hide space-y-1.5">
                        {(cruiseStats.recentSignups || []).map((s) => (
                          <div key={s.email || s.name} className="flex items-center gap-3 bg-black/20 px-3 py-2.5 rounded-lg border border-white/5 hover: border-[var(--color-accent)]/30 transition-colors group/row">
                            <div className="w-7 h-7 rounded-full bg-emerald-500/10 border  border-[var(--color-accent)]/30 flex items-center justify-center text-[0.5rem] font-black text-[var(--color-accent)] shrink-0">
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
                  <button onClick={async () => { const res = await fetch('/api/admin/cruise-export'); if (res.ok) { const blob = await res.blob(); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = '7th-heaven-cruise-roster.csv'; a.click(); URL.revokeObjectURL(url); } }} className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-[0.65rem] font-black uppercase tracking-widest transition-colors cursor-pointer shadow-[0_4px_15px_rgba(16,185,129,0.25)] border  border-[var(--color-accent)]/30 flex items-center justify-center gap-2 mt-auto">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
                    Download Full CSV
                  </button>
                  <p className="text-[0.5rem] text-white/20 text-center -mt-2">Includes names, emails, phone numbers, guest details</p>
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

        {selectedQrProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-[fadeIn_0.2s_ease-out] no-print">
            <style dangerouslySetInnerHTML={{
              __html: `
            @media print {
              html, body, main, #__next, div:not(.print-tag-container):not(.print-tag-card):not(.print-tag-card *) {
                background: white !important;
                color: black !important;
                visibility: hidden !important;
                height: auto !important;
              }
              .no-print {
                display: none !important;
              }
              .print-tag-container {
                visibility: visible !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                position: fixed !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                height: 100% !important;
                background: white !important;
                padding: 0 !important;
                margin: 0 !important;
              }
              .print-tag-card {
                visibility: visible !important;
                border: 2px dashed #000000 !important;
                background: white !important;
                color: black !important;
                width: 4in !important;
                height: 6in !important;
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
                justify-content: space-between !important;
                padding: 2rem !important;
                box-sizing: border-box !important;
                page-break-inside: avoid !important;
              }
            }
          `}} />

            <div className="bg-[var(--color-bg-surface)] border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-[scaleIn_0.2s_ease-out]">
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
                    Print Merchandise QR Code
                  </h3>
                  <p className="text-xs text-white/40 mt-1">Generate printable retail labels for the merch table</p>
                </div>
                <button
                  aria-label="Close QR product label modal"
                  onClick={() => setSelectedQrProduct(null)}
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >✕

                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 custom-scrollbar">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider  text-[var(--color-accent)] mb-4">1. Select Target Destination</h4>
                    <div className="space-y-3">
                      <div>
                        <span className="block text-[0.65rem] font-bold text-white/60 uppercase tracking-widest mb-1.5">Link Destination Type</span>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setQrLinkType('product')}
                            className={`px-3 py-2 text-xs font-bold uppercase tracking-wider border rounded-lg transition-colors cursor-pointer ${qrLinkType === 'product'
                              ? 'bg-[var(--color-accent)]/15 border-[var(--color-accent)]  text-[var(--color-accent)]'
                              : 'bg-black/20 border-white/10 text-white/40 hover:text-white/60 hover:border-white/20'
                              }`}
                          >
                            Product Detail Page
                          </button>
                          <button
                            type="button"
                            onClick={() => setQrLinkType('checkout')}
                            disabled={!selectedQrProduct.variants || selectedQrProduct.variants.length === 0}
                            className={`px-3 py-2 text-xs font-bold uppercase tracking-wider border rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:pointer-events-none ${qrLinkType === 'checkout'
                              ? 'bg-[var(--color-accent)]/15 border-[var(--color-accent)]  text-[var(--color-accent)]'
                              : 'bg-black/20 border-white/10 text-white/40 hover:text-white/60 hover:border-white/20'
                              }`}
                          >
                            Direct Add to Cart
                          </button>
                        </div>
                      </div>

                      {selectedQrProduct.variants && selectedQrProduct.variants.length > 0 && (
                        <div>
                          <label htmlFor="admin-qr-variant-select" className="block text-[0.65rem] font-bold text-white/60 uppercase tracking-widest mb-1.5">
                            {qrLinkType === 'checkout' ? 'Product Variant (Required)' : 'Product Variant (Optional)'}
                          </label>
                          <select
                            id="admin-qr-variant-select"
                            value={selectedQrVariant ? selectedQrProduct.variants.findIndex((v: any) => v.id === selectedQrVariant.id) : '-1'}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              setSelectedQrVariant(val === -1 ? null : selectedQrProduct.variants[val]);
                            }}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[var(--color-accent)]/50"
                          >
                            {qrLinkType === 'product' && <option value="-1">All Variants (Standard Detail Page)</option>}
                            {selectedQrProduct.variants.map((v: any, vIdx: number) => (
                              <option key={v.id || v.title} value={vIdx}>
                                {v.title} — ${v.price.toFixed(2)}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider  text-[var(--color-accent)] mb-4">2. Customize Tag Label</h4>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="admin-qr-subtitle-input" className="block text-[0.65rem] font-bold text-white/60 uppercase tracking-widest mb-1.5">Sub-label Text</label>
                        <input
                          id="admin-qr-subtitle-input"
                          type="text"
                          value={qrSubtitle}
                          onChange={(e) => setQrSubtitle(e.target.value)}
                          placeholder="Official Merchandise"
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[var(--color-accent)]/50"
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 bg-black/20 border border-white/5">
                        <div>
                          <p className="text-xs font-bold text-white">Show Price Tag</p>
                          <p className="text-[0.6rem] text-white/40">Include product price at the bottom of the card</p>
                        </div>
                        <button
                          type="button"
                          aria-label="Toggle include price tag"
                          onClick={() => setQrIncludePrice(!qrIncludePrice)}
                          className={`w-10 h-6 rounded-full p-1 transition-colors cursor-pointer ${qrIncludePrice ? 'bg-[var(--color-accent)]' : 'bg-white/10'}`}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full transition-transform ${qrIncludePrice ? 'translate-x-4' : 'translate-x-0'}`} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-purple-500/10 border border-purple-500/20 text-[0.65rem] leading-relaxed text-white/60">
                    <span className="text-purple-300 font-bold block mb-1"> Pro-Tip for Merch Tables</span>
                    Generate a **Direct Add to Cart** QR code for each specific size (e.g. Medium vs. Large). When fans scan it, the item is instantly added to their Shopify cart for immediate checkout, keeping the queue moving fast!
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center bg-black/30 border border-white/5 p-6 md:p-8">
                  <p className="text-[0.65rem] font-bold uppercase tracking-widest text-white/30 mb-4">Live Tag Print Preview (4&quot; × 6&quot;)</p>

                  <div className="print-tag-container">
                    <div className="print-tag-card bg-white text-black p-8 flex flex-col items-center justify-between border-2 border-dashed border-black/40 rounded-lg w-[260px] h-[390px]">
                      <div className="text-center">
                        <div className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-black/60 mb-0.5">7th Heaven</div>
                        <div className="text-[0.5rem] font-bold uppercase tracking-wider text-black/40">{qrSubtitle || 'Official Merchandise'}</div>
                      </div>

                      <div className="text-center my-2">
                        <div className="text-sm font-black uppercase tracking-wide leading-tight max-w-[200px] truncate">{selectedQrProduct.title}</div>
                        {selectedQrVariant && (
                          <div className="text-[0.55rem] font-bold text-black/50 uppercase mt-0.5">Size / Type: {selectedQrVariant.title}</div>
                        )}
                      </div>

                      <div className="p-3 bg-white border border-black/10 flex items-center justify-center">
                        <QRCode
                          value={
                            qrLinkType === 'checkout' && selectedQrVariant
                              ? `https://${shopifyData?.domain || process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || 'demo-7thheaven.myshopify.com'}/cart/${selectedQrVariant.id.split('/').pop()}:1`
                              : `https://${shopifyData?.domain || process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || 'demo-7thheaven.myshopify.com'}/products/${selectedQrProduct.handle}`
                          }
                          size={150}
                          style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                          viewBox="0 0 150 150"
                        />
                      </div>

                      <div className="text-center w-full">
                        <p className="text-[0.55rem] font-black uppercase tracking-widest text-black/40 mb-2">Scan to Buy Now</p>
                        {qrIncludePrice && (
                          <div className="text-lg font-black border-t border-black/10 pt-2 text-black">
                            ${(selectedQrVariant ? selectedQrVariant.price : selectedQrProduct.minPrice).toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-white/5 bg-black/20 flex items-center justify-end gap-3">
                <button
                  onClick={() => setSelectedQrProduct(null)}
                  className="px-4 py-2 text-xs font-bold text-white/60 hover:text-white uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-6 py-3 bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/90 text-white text-[0.65rem] font-black uppercase tracking-widest transition-colors shadow-[0_4px_15px_rgba(255,10,61,0.3)] border border-[var(--color-accent)]/30 flex items-center gap-2 cursor-pointer"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>
                  Print Label
                </button>
              </div>
            </div>
          </div>
        )}
        {activeToast && (
          <div className="fixed bottom-6 right-6 z-[9999] bg-[var(--color-bg-card)] border border-emerald-500/30 text-white px-5 py-4 flex items-start gap-3 transition-opacity duration-300 ease-out">
            <div className="text-xl"></div>
            <div>
              <p className="text-xs font-black text-[var(--color-accent)] uppercase tracking-widest">{activeToast.title}</p>
              <p className="text-sm text-white/90 font-medium mt-0.5">{activeToast.message}</p>
            </div>
          </div>
        )}

        {/* Floating Quick Scroll Nav / Toggle Button — Removed */}
        {showJumpNav && (
          <div className="fixed right-6 top-1/2 -translate-y-1/2 z-[40] hidden xl:flex flex-col bg-[var(--color-bg-surface)]/95 border border-white/10 p-3 backdrop-blur-md max-h-[400px] w-44 font-sans transition-colors duration-300 animate-[fadeIn_0.15s_ease]">
            <div className="text-[0.6rem] font-bold text-white/30 uppercase tracking-[0.2em] mb-2 px-1 pb-1.5 border-b border-white/5 flex items-center justify-between shrink-0 select-none">
              <span>{sidebarMode === 'jump' || adminTab !== 'band' ? 'Jump To Section' : 'Organize Layout'}</span>
              <button
                onClick={toggleJumpNav}
                title="Hide Navigation"
                className="text-white/40 hover:text-white transition-colors cursor-pointer border-none bg-transparent flex items-center justify-center p-0 ml-1 text-[var(--font-size-3xs)]"
              >

              </button>
            </div>
            {adminTab === 'band' && (
              <div className="flex bg-white/5 rounded-lg p-0.5 mb-2 border border-white/5 shrink-0 select-none">
                <button
                  type="button"
                  onClick={() => setSidebarMode('jump')}
                  className={`flex-1 py-1 text-[var(--font-size-3xs)] font-bold uppercase tracking-wider rounded-md text-center transition-colors border-none bg-transparent cursor-pointer ${sidebarMode === 'jump' ? 'bg-white/10 text-white shadow-sm font-black' : 'text-white/40 hover:text-white'}`}
                >
                  Navigate
                </button>
                <button
                  type="button"
                  onClick={() => setSidebarMode('organize')}
                  className={`flex-1 py-1 text-[var(--font-size-3xs)] font-bold uppercase tracking-wider rounded-md text-center transition-colors border-none bg-transparent cursor-pointer ${sidebarMode === 'organize' ? 'bg-white/10 text-white shadow-sm font-black' : 'text-white/40 hover:text-white'}`}
                >
                  Arrange
                </button>
              </div>
            )}
            <CustomScrollbar className="flex-1 min-h-0" thumbColor="#a855f7" thumbWidth={5}>
              <div className="flex flex-col gap-1 text-xs pr-1">
                {adminTab === 'band' ? (
                  sidebarMode === 'jump' ? (
                    <>
                      {sectionOrder.map((key) => {
                        const labelMap: Record<string, { label: string; icon: string }> = {
                          announcements: { label: 'Band Announcements', icon: '' },
                          calendar: { label: 'Crew Schedule', icon: '' },
                          analytics: { label: 'Google Analytics', icon: '' },
                          shopify: { label: 'Shopify Store', icon: '' },
                          bookings: { label: 'Booking Requests', icon: '' },
                          planners: { label: 'Planners Directory', icon: '' },
                          cruisesignups: { label: 'Cruise Signups', icon: '' },
                          livealerts: { label: 'Live Alerts', icon: '' },
                          smsblast: { label: 'SMS Blast', icon: '' },
                          crewsms: { label: 'Crew SMS', icon: '' },
                          bandsms: { label: 'Band Member SMS Text', icon: '' },
                          newsletter: { label: 'Newsletter', icon: '' },
                          emailflow: { label: 'Email Template Flows', icon: '' },
                          registry: { label: 'Fan Registry', icon: '' },
                          crewcreation: { label: 'Crew Management', icon: '' },
                          admincreation: { label: 'Admin Management', icon: '' },
                          bulkinvites: { label: 'Bulk Invites', icon: '' },
                          awardpicks: { label: 'Award Picks', icon: '' }
                        };
                        const section = labelMap[key] || { label: key, icon: '' };
                        return (
                          <button
                            key={key}
                            onClick={() => document.getElementById(`admin-sec-${key}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                            className="text-left py-1.5 px-2 hover:bg-white/5 hover:text-white text-white/60 transition-colors rounded font-medium truncate flex items-center gap-2 cursor-pointer border-none"
                          >
                            <span>{section.icon}</span> {section.label}
                          </button>
                        );
                      })}
                    </>
                  ) : (
                    <>
                      <div className="text-[var(--font-size-3xs)] text-white/30 mb-2 px-1.5 leading-normal italic select-none">
                        Drag sections below to reorder layout:
                      </div>
                      {sectionOrder.map((key, index) => {
                        const labelMap: Record<string, { label: string; icon: string }> = {
                          announcements: { label: 'Band Announcements', icon: '' },
                          calendar: { label: 'Crew Schedule', icon: '' },
                          analytics: { label: 'Google Analytics', icon: '' },
                          shopify: { label: 'Shopify Store', icon: '' },
                          bookings: { label: 'Booking Requests', icon: '' },
                          planners: { label: 'Planners Directory', icon: '' },
                          cruisesignups: { label: 'Cruise Signups', icon: '' },
                          livealerts: { label: 'Live Alerts', icon: '' },
                          smsblast: { label: 'SMS Blast', icon: '' },
                          crewsms: { label: 'Crew SMS', icon: '' },
                          bandsms: { label: 'Band Member SMS Text', icon: '' },
                          newsletter: { label: 'Newsletter', icon: '' },
                          emailflow: { label: 'Email Template Flows', icon: '' },
                          registry: { label: 'Fan Registry', icon: '' },
                          crewcreation: { label: 'Crew Management', icon: '' },
                          admincreation: { label: 'Admin Management', icon: '' },
                          bulkinvites: { label: 'Bulk Invites', icon: '' },
                          awardpicks: { label: 'Award Picks', icon: '' }
                        };
                        const section = labelMap[key] || { label: key, icon: '' };
                        return (
                          <div
                            key={key}
                            draggable={true}
                            onDragStart={(e) => {
                              e.dataTransfer.effectAllowed = 'move';
                              e.dataTransfer.setData('text/plain', key);
                              handleDragStart(index);
                            }}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragEnd={handleDragEnd}
                            className={`py-1.5 px-2 hover:bg-white/5 text-white/70 hover:text-white transition-colors rounded font-medium truncate flex items-center gap-2 cursor-grab active:cursor-grabbing border border-transparent select-none ${draggedIndex === index ? 'border-dashed border-[var(--color-accent)]/50 opacity-40 bg-white/5 shadow-inner' : ''}`}
                          >
                            <span className="text-white/20 select-none"></span>
                            <span>{section.icon}</span>
                            <span className="truncate">{section.label}</span>
                          </div>
                        );
                      })}
                    </>
                  )
                ) : (
                  <>
                    <button
                      onClick={() => document.getElementById('admin-sec-cruise-command')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                      className="text-left py-1.5 px-2 hover:bg-white/5 hover:text-white text-white/60 transition-colors rounded font-medium truncate flex items-center gap-2 cursor-pointer border-none"
                    >
                      <span></span> Command Center
                    </button>
                    <button
                      onClick={() => document.getElementById('admin-sec-cruise-roster')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                      className="text-left py-1.5 px-2 hover:bg-white/5 hover:text-white text-white/60 transition-colors rounded font-medium truncate flex items-center gap-2 cursor-pointer border-none"
                    >
                      <span></span> Cruise Roster & Links
                    </button>
                    <button
                      onClick={() => document.getElementById('admin-sec-cruise-blast')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                      className="text-left py-1.5 px-2 hover:bg-white/5 hover:text-white text-white/60 transition-colors rounded font-medium truncate flex items-center gap-2 cursor-pointer border-none"
                    >
                      <span></span> Cruise Blast
                    </button>
                  </>
                )}
              </div>
            </CustomScrollbar>
          </div>
        )}
      </div>
    </div>
  );
}