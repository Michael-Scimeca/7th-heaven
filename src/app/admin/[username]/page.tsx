"use client";

import React from 'react';

import { useState, useEffect, useRef, use, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { createClient } from "@/utils/supabase/client";
import { useMember } from "@/context/MemberContext";

import { adminKillStream, adminBanUser, seedMockData, adminCreateCrewMember, adminResetPassword, adminCreateAdmin } from "../actions";
import { CrewSetPasswordModal } from "@/components/CrewSetPasswordModal";
import ShowCrewPanel from "@/components/ShowCrewPanel";
import dynamic from 'next/dynamic';
import QRCode from "react-qr-code";

const AdminMap = dynamic(() => import('@/components/AdminMap'), {
  ssr: false,
  loading: () => <div className="w-full h-[400px] bg-black/40 rounded-xl animate-pulse" />
});

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';

import BulkInvitePanel from "@/components/admin/BulkInvitePanel";
import AwardPicksPanel from "@/components/admin/AwardPicksPanel";
import CustomScrollbar from "@/components/CustomScrollbar";
import ProfilePhotoUploader from "@/components/ProfilePhotoUploader";

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
  { id: 'abbie', name: 'Abbie Janssen', role: 'SERVER', maxHours: 40, avatar: '/images/crew/abbie.png', email: 'abbie@7thheavenband.com', phone: '(555) 123-4567' },
  { id: 'al', name: 'Al Hollie', role: 'SERVER', maxHours: 32, avatar: '/images/crew/al.png', email: 'al@7thheavenband.com', phone: '(555) 234-5678' },
  { id: 'andrea', name: 'Andrea Kinzinger', role: 'CHEF', maxHours: 40, avatar: '/images/crew/andrea.png', email: 'andrea@7thheavenband.com', phone: '(555) 345-6789' },
  { id: 'arjun', name: 'Arjun Patel', role: 'SERVER', maxHours: 32, avatar: '/images/crew/arjun.png', email: 'arjun@7thheavenband.com', phone: '(555) 456-7890' },
  { id: 'chris', name: 'Chris Loxely', role: 'SERVER', maxHours: 40, avatar: '/images/crew/chris.png', email: 'chris@7thheavenband.com', phone: '(555) 567-8901' },
  { id: 'daniel', name: 'Daniel Kim', role: 'MANAGER', maxHours: 40, avatar: '/images/crew/daniel.png', email: 'daniel@7thheavenband.com', phone: '(555) 678-9012' },
  { id: 'dave_croke', name: 'Dave Croke', role: 'LINE COOK', maxHours: 32, avatar: '/images/crew/dave_croke.png', email: 'dave_c@7thheavenband.com', phone: '(555) 789-0123' },
  { id: 'dave_maas', name: 'Dave Maas', role: 'CHEF', maxHours: 24, avatar: '/images/crew/dave_maas.png', email: 'dave_m@7thheavenband.com', phone: '(555) 890-1234' },
  { id: 'david_xu', name: 'David Xu', role: 'MANAGER', maxHours: 40, avatar: '/images/crew/david_xu.png', email: 'david@7thheavenband.com', phone: '(555) 901-2345' },
  { id: 'emily', name: 'Emily Hafften', role: 'SERVER', maxHours: 32, avatar: '/images/crew/emily.png', email: 'emily@7thheavenband.com', phone: '(555) 012-3456' },
  { id: 'emma', name: 'Emma Smid', role: 'LINE COOK', maxHours: 40, avatar: '/images/crew/emma.png', email: 'emma@7thheavenband.com', phone: '(555) 123-9876' },
  { id: 'erin', name: 'Erin Eagan', role: 'POSITION', maxHours: 40, avatar: '/images/crew/erin.png', email: 'erin@7thheavenband.com', phone: '(555) 234-8765' },
  { id: 'francesca', name: 'Francesca Troast', role: 'MANAGER', maxHours: 40, avatar: '/images/crew/francesca.png', email: 'francesca@7thheavenband.com', phone: '(555) 345-7654' },
  { id: 'michael', name: 'Michael Scimeca', role: 'AUDIO MIX', maxHours: 40, avatar: 'https://ui-avatars.com/api/?name=Michael+Scimeca&background=8a1cfc&color=fff', email: 'michael@7thheavenband.com', phone: '(555) 456-6543' },
  { id: 'sammy', name: 'Sammy D', role: 'SERVER', maxHours: 40, avatar: 'https://ui-avatars.com/api/?name=Sammy+D&background=ec4899&color=fff', email: 'sammy@7thheavenband.com', phone: '(555) 567-5432' },
  { id: 'ryan', name: 'Ryan K', role: 'BUSSER', maxHours: 32, avatar: 'https://ui-avatars.com/api/?name=Ryan+K&background=0ea5e9&color=fff', email: 'ryan@7thheavenband.com', phone: '(555) 678-4321' },
  { id: 'tony', name: 'Tony M', role: 'LINE COOK', maxHours: 40, avatar: 'https://ui-avatars.com/api/?name=Tony+M&background=10b981&color=fff', email: 'tony@7thheavenband.com', phone: '(555) 789-3210' },
  { id: 'marcus', name: 'Marcus Vance', role: 'UNLOADING', maxHours: 40, avatar: 'https://ui-avatars.com/api/?name=Marcus+Vance&background=f97316&color=fff', email: 'marcus@7thheavenband.com', phone: '(555) 890-1235' },
  { id: 'colin', name: 'Colin Farrell', role: 'CAMERA', maxHours: 40, avatar: 'https://ui-avatars.com/api/?name=Colin+Farrell&background=ec4899&color=fff', email: 'colin@7thheavenband.com', phone: '(555) 321-4321' }
];

const getAvatarColor = (name: string) => {
  const colors = ['#f472b6', '#a78bfa', '#60a5fa', '#34d399', '#fbbf24', '#f87171', '#8b5cf6', '#ec4899'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

const CrewAvatar = React.memo(({ member }: { member: any }) => {
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
      className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center gap-2 border-none cursor-pointer transition-colors duration-150 group ${
        isSelected
          ? 'bg-amber-500/15 ring-1 ring-amber-500/30' 
          : isActiveWeek
            ? 'bg-white/[0.04]'
            : 'bg-transparent hover:bg-white/[0.03]'
      }`}
    >
      <div className="flex flex-col items-center min-w-[36px]">
        <span className="text-[8px] font-bold text-white/35 uppercase">{show.dayLabel}</span>
        <span className={`text-[11px] font-black ${isSelected ? 'text-amber-400' : isActiveWeek ? 'text-white/60' : 'text-white/40'}`}>{show.dateLabel}</span>
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
        <div className="relative group/badge shrink-0">
          <span className="text-[8px] font-black bg-emerald-500/15 text-emerald-400/70 px-1.5 py-0.5 rounded cursor-help">
            {shiftCount}
          </span>
          {/* Tooltip */}
          <div className="absolute right-0 bottom-full mb-1.5 opacity-0 invisible group-hover/badge:opacity-100 group-hover/badge:visible transition-all duration-150 bg-[#1c1d22] text-white text-[9px] font-bold py-1 px-2 rounded border border-slate-700/50 shadow-xl whitespace-nowrap z-50 pointer-events-none flex items-center gap-1">
            <span>ℹ️</span>
            <span>{shiftCount} active {shiftCount === 1 ? 'shift' : 'shifts'} scheduled</span>
          </div>
        </div>
      )}
    </button>
  );
});
SidebarDateButton.displayName = 'SidebarDateButton';

export default function AdminDashboard({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const { member, isLoggedIn, login, logout, openModal } = useMember();
  const router = useRouter();

  // Redirect if username in URL doesn't match logged-in user's username
  useEffect(() => {
    if (isLoggedIn && member?.role === 'admin' && member.username) {
      if (member.username !== username) {
        router.replace(`/admin/${member.username}`);
      }
    }
  }, [isLoggedIn, member, username, router]);
  const [feeds, setFeeds] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [filterRole, setFilterRole] = useState<"All" | "fan" | "crew" | "admin">("All");
  const [moderationQueue, setModerationQueue] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const staticCrew = [
    { id: 'abbie', name: 'Abbie Janssen', role: 'SERVER', maxHours: 40, avatar: '/images/crew/abbie.png', email: 'abbie@7thheavenband.com', phone: '(555) 123-4567' },
    { id: 'al', name: 'Al Hollie', role: 'SERVER', maxHours: 32, avatar: '/images/crew/al.png', email: 'al@7thheavenband.com', phone: '(555) 234-5678' },
    { id: 'andrea', name: 'Andrea Kinzinger', role: 'CHEF', maxHours: 40, avatar: '/images/crew/andrea.png', email: 'andrea@7thheavenband.com', phone: '(555) 345-6789' },
    { id: 'arjun', name: 'Arjun Patel', role: 'SERVER', maxHours: 32, avatar: '/images/crew/arjun.png', email: 'arjun@7thheavenband.com', phone: '(555) 456-7890' },
    { id: 'chris', name: 'Chris Loxely', role: 'SERVER', maxHours: 40, avatar: '/images/crew/chris.png', email: 'chris@7thheavenband.com', phone: '(555) 567-8901' },
    { id: 'daniel', name: 'Daniel Kim', role: 'MANAGER', maxHours: 40, avatar: '/images/crew/daniel.png', email: 'daniel@7thheavenband.com', phone: '(555) 678-9012' },
    { id: 'dave_croke', name: 'Dave Croke', role: 'LINE COOK', maxHours: 32, avatar: '/images/crew/dave_croke.png', email: 'dave_c@7thheavenband.com', phone: '(555) 789-0123' },
    { id: 'dave_maas', name: 'Dave Maas', role: 'CHEF', maxHours: 24, avatar: '/images/crew/dave_maas.png', email: 'dave_m@7thheavenband.com', phone: '(555) 890-1234' },
    { id: 'david_xu', name: 'David Xu', role: 'MANAGER', maxHours: 40, avatar: '/images/crew/david_xu.png', email: 'david@7thheavenband.com', phone: '(555) 901-2345' },
    { id: 'emily', name: 'Emily Hafften', role: 'SERVER', maxHours: 32, avatar: '/images/crew/emily.png', email: 'emily@7thheavenband.com', phone: '(555) 012-3456' },
    { id: 'emma', name: 'Emma Smid', role: 'LINE COOK', maxHours: 40, avatar: '/images/crew/emma.png', email: 'emma@7thheavenband.com', phone: '(555) 123-9876' },
    { id: 'erin', name: 'Erin Eagan', role: 'POSITION', maxHours: 40, avatar: '/images/crew/erin.png', email: 'erin@7thheavenband.com', phone: '(555) 234-8765' },
    { id: 'francesca', name: 'Francesca Troast', role: 'MANAGER', maxHours: 40, avatar: '/images/crew/francesca.png', email: 'francesca@7thheavenband.com', phone: '(555) 345-7654' },
    { id: 'michael', name: 'Michael Scimeca', role: 'AUDIO MIX', maxHours: 40, avatar: 'https://ui-avatars.com/api/?name=Michael+Scimeca&background=8a1cfc&color=fff', email: 'michael@7thheavenband.com', phone: '(555) 456-6543' },
    { id: 'sammy', name: 'Sammy D', role: 'SERVER', maxHours: 40, avatar: 'https://ui-avatars.com/api/?name=Sammy+D&background=ec4899&color=fff', email: 'sammy@7thheavenband.com', phone: '(555) 567-5432' },
    { id: 'ryan', name: 'Ryan K', role: 'BUSSER', maxHours: 32, avatar: 'https://ui-avatars.com/api/?name=Ryan+K&background=0ea5e9&color=fff', email: 'ryan@7thheavenband.com', phone: '(555) 678-4321' },
    { id: 'tony', name: 'Tony M', role: 'LINE COOK', maxHours: 40, avatar: 'https://ui-avatars.com/api/?name=Tony+M&background=10b981&color=fff', email: 'tony@7thheavenband.com', phone: '(555) 789-3210' }
  ];

  const staticBand = [
    { id: 'adam', name: 'Adam Heisler', role: 'Lead Vocals • Guitars • Bass', phone: '(555) 301-4411', email: 'adam@7thheavenband.com', avatar: 'https://ui-avatars.com/api/?name=Adam+Heisler&background=851DEF&color=fff' },
    { id: 'rich', name: 'Richard Hofherr', role: 'Guitars • Keys • Vocals', phone: '(555) 301-4422', email: 'rich@7thheavenband.com', avatar: 'https://ui-avatars.com/api/?name=Richard+Hofherr&background=3b82f6&color=fff' },
    { id: 'nick', name: 'Nick Cox', role: 'Guitars • Vocals', phone: '(555) 301-4433', email: 'nick@7thheavenband.com', avatar: 'https://ui-avatars.com/api/?name=Nick+Cox&background=06b6d4&color=fff' },
    { id: 'mark', name: 'Mark Kennetz', role: 'Bass • Vocals', phone: '(555) 301-4444', email: 'mark@7thheavenband.com', avatar: 'https://ui-avatars.com/api/?name=Mark+Kennetz&background=851DEF&color=fff' },
    { id: 'frankie', name: 'Frankie Harchut', role: 'Drums', phone: '(555) 301-4455', email: 'frankie@7thheavenband.com', avatar: 'https://ui-avatars.com/api/?name=Frankie+Harchut&background=3b82f6&color=fff' }
  ];

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
    setMounted(true);
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
      const stored = localStorage.getItem('admin_orders_list');
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
        localStorage.setItem('admin_orders_list', JSON.stringify(initialMock));
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
          const updated = [payload, ...prev];
          localStorage.setItem('admin_orders_list', JSON.stringify(updated));
          return updated;
        });

        // Play notification chime sound
        try {
          const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-500.wav");
          audio.volume = 0.4;
          audio.play();
        } catch {}

        // Show toast
        setActiveToast({
          title: '🛍️ New Order Received',
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
      const updated = prev.map(o => {
        if (o.id === orderId) {
          const updatedOrder = { ...o, status: nextStatus };
          if (nextStatus === 'Shipped') {
            updatedOrder.trackingNumber = `USPS-7H-${Math.floor(10000000 + Math.random() * 90000000)}`;
          }
          return updatedOrder;
        }
        return o;
      });
      localStorage.setItem('admin_orders_list', JSON.stringify(updated));
      return updated;
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
  const [schedules, setSchedules] = useState<{ id: string; crewId: string; crewName: string; date: string; time: string; role: string; location: string; notes: string; startHour: number; endHour: number; isTimeOff?: boolean; isDraft?: boolean; labelOverride?: string; openSlots?: number; isCoverageRequested?: boolean; tags?: string[] }[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const getMondayStr = (offsetDays: number = 0) => {
        const d = new Date();
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1) + offsetDays;
        const target = new Date(d.getFullYear(), d.getMonth(), diff);
        return target.toISOString().split('T')[0];
      };

      const saved = localStorage.getItem('7h_crew_schedules');
      if (saved) {
        const parsed = JSON.parse(saved);
        const hasStaleMock = parsed && parsed.some((item: any) => item.date && (item.date.startsWith('2023-') || item.date.startsWith('2025-')));
        if (hasStaleMock) {
          localStorage.removeItem('7h_crew_schedules');
        } else if (parsed && parsed.length > 0) {
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
        { id: 'mock_1', crewId: 'arjun', crewName: 'Arjun Patel', date: getMondayStr(0), startHour: 17.0, endHour: 22.0, time: '5:00 PM - 10:00 PM', role: 'SERVER', location: 'The Chicago Theatre', notes: 'Lead server for VIP tables' },
        { id: 'mock_2', crewId: 'abbie', crewName: 'Abbie Janssen', date: getMondayStr(1), startHour: 17.0, endHour: 22.0, time: '5:00 PM - 10:00 PM', role: 'SERVER', location: 'The Chicago Theatre', notes: '' },
        { id: 'mock_3', crewId: 'al', crewName: 'Al Hollie', date: getMondayStr(2), startHour: 18.0, endHour: 23.5, time: '6:00 PM - 11:30 PM', role: 'SERVER', location: 'The Chicago Theatre', notes: '' },
        { id: 'mock_4', crewId: 'andrea', crewName: 'Andrea Kinzinger', date: getMondayStr(3), startHour: 16.0, endHour: 22.0, time: '4:00 PM - 10:00 PM', role: 'CHEF', location: 'The Chicago Theatre', notes: 'Kitchen lead' },
        { id: 'mock_5', crewId: 'openshifts', crewName: 'OpenShifts', date: getMondayStr(3), startHour: 18.0, endHour: 23.0, time: '6:00 PM - 11:00 PM', role: 'SERVER', location: 'The Chicago Theatre', notes: 'Need 1 backup server', openSlots: 1 },
        { id: 'mock_6', crewId: 'chris', crewName: 'Chris Loxely', date: getMondayStr(4), startHour: 18.0, endHour: 23.5, time: '6:00 PM - 11:30 PM', role: 'SERVER', location: 'The Chicago Theatre', notes: '' },
        { id: 'mock_7', crewId: 'dave_croke', crewName: 'Dave Croke', date: getMondayStr(4), startHour: 17.0, endHour: 23.0, time: '5:00 PM - 11:00 PM', role: 'LINE COOK', location: 'The Chicago Theatre', notes: '' },
        { id: 'mock_8', crewId: 'abbie', crewName: 'Abbie Janssen', date: getMondayStr(4), startHour: 18.0, endHour: 23.0, time: '6:00 PM - 11:00 PM', role: 'SERVER', location: 'The Chicago Theatre', notes: '' },
        { id: 'mock_9', crewId: 'daniel', crewName: 'Daniel Kim', date: getMondayStr(5), startHour: 17.0, endHour: 24.0, time: '5:00 PM - 12:00 AM', role: 'MANAGER', location: 'The Chicago Theatre', notes: 'Closing manager' },
        { id: 'mock_10', crewId: 'openshifts', crewName: 'OpenShifts', date: getMondayStr(6), startHour: 12.0, endHour: 17.0, time: '12:00 PM - 5:00 PM', role: 'SERVER', location: 'The Chicago Theatre', notes: 'Matinee show setup', openSlots: 2 }
      ];
      localStorage.setItem('7h_crew_schedules', JSON.stringify(defaultMocks));
      return defaultMocks;
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
  const [showEligibleCoverageList, setShowEligibleCoverageList] = useState(false);
  const [onlyShowFitRole, setOnlyShowFitRole] = useState<boolean>(true);
  const [calendarRange, setCalendarRange] = useState<'week' | '4weeks' | 'month'>('week');
  const [selectedCrewAssignments, setSelectedCrewAssignments] = useState<{ [crewId: string]: { active: boolean; customized?: boolean; role: string; startHour: number; endHour: number; timeFrames?: { id?: string; startHour: number; endHour: number; role: string; tags?: string[] }[] } }>({});
  const [drawerCrewSearch, setDrawerCrewSearch] = useState('');
  
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
  const [dropTimeFrames, setDropTimeFrames] = useState<{ id?: string; startHour: number; endHour: number; role: string; tags?: string[] }[]>([
    { startHour: 12, endHour: 17, role: 'SERVER', tags: [] }
  ]);
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
    'bookings',
    'planners',
    'shopify',
    'crewsms',
    'bandsms',
    'calendar',
    'livealerts',
    'analytics',
    'announcements',
    'photomod',
    'cruisesignups',
    'smsblast',
    'newsletter',
    'emailflow',
    'registry',
    'crewcreation',
    'admincreation',
    'bulkinvites',
    'awardpicks'
  ];

  const [sectionOrder, setSectionOrder] = useState<string[]>(() => {
    if (typeof window === 'undefined') return DEFAULT_SECTION_ORDER;
    try {
      const migrated = localStorage.getItem('7h_admin_order_migrated_v7');
      if (!migrated) {
        return DEFAULT_SECTION_ORDER;
      }
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
          
          const migrated = localStorage.getItem('7h_admin_order_migrated_v7');
          if (!migrated) {
            // Force save the new order to Supabase user metadata
            await client.auth.updateUser({
              data: {
                admin_section_order: DEFAULT_SECTION_ORDER,
                admin_collapsed_sections: user.user_metadata.admin_collapsed_sections || collapsedSections
              }
            });
            localStorage.setItem('7h_admin_order_migrated_v7', 'true');
            setSectionOrder(DEFAULT_SECTION_ORDER);
            localStorage.setItem('7h_admin_section_order', JSON.stringify(DEFAULT_SECTION_ORDER));
          } else {
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
        }
      } catch (err) {
        console.error("Failed to load layout from Supabase:", err);
      }
    };
    loadSavedLayout();
  }, [isLoggedIn, member]);

  // Run migration on mount for all clients (logged in or not)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const migrated = localStorage.getItem('7h_admin_order_migrated_v7');
      if (!migrated) {
        setSectionOrder(DEFAULT_SECTION_ORDER);
        localStorage.setItem('7h_admin_section_order', JSON.stringify(DEFAULT_SECTION_ORDER));
        localStorage.setItem('7h_admin_order_migrated_v7', 'true');
      }
    }
  }, []);

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
      localStorage.setItem('7h_admin_section_order', JSON.stringify(sectionOrder));
      saveLayoutToSupabase(sectionOrder, collapsedSections);
    } catch {}
  };

  // ── Tour Dates Sync State & Handlers ──
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
    return upcoming
      .sort((a, b) => (a.date || '').localeCompare(b.date || ''))
      .map(show => {
        const showDate = show.date ? new Date(show.date + 'T12:00:00') : null;
        const dateLabel = showDate
          ? showDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : '—';
        const dayLabel = showDate
          ? showDate.toLocaleDateString('en-US', { weekday: 'short' })
          : '';
        return {
          ...show,
          dateLabel,
          dayLabel
        };
      });
  }, [tourDates]);

  // ── Memoized Schedule Calculations for Performance ──
  const crewMembers = useMemo(() => {
    const dynamicCrew = users
      .filter(u => u.role === 'crew')
      .map(u => {
        const initials = u.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
        return {
          id: u.id,
          name: u.name,
          role: u.duty || 'Crew Member',
          maxHours: 40,
          email: u.email || '',
          phone: u.phone || '',
          initials: initials || 'C',
          color: getAvatarColor(u.name),
          avatar: u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=random`
        };
      });

    const processedStatic = STATIC_CREW.map(sc => {
      const initials = sc.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
      return {
        ...sc,
        initials: initials || 'C',
        color: getAvatarColor(sc.name)
      };
    });

    return [...processedStatic, ...dynamicCrew.filter(dc => !processedStatic.some(sc => sc.id === dc.id))];
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
      days = days.filter(day => {
        const show = tourDates.find(s => s.date === day.dateStr);
        if (!show) return false;

        const isFestival = show.isFestival || show.tags?.includes('festival');
        const isPrivate = show.isPrivate || show.tags?.includes('private');
        const isCorporate = show.tags?.includes('corporate');
        const isCruise = show.tags?.includes('cruise');
        const isClub = show.tags?.includes('club');

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
      schedules
        .filter(s => next7Days.some(d => d.dateStr === s.date) && s.crewId !== 'openshifts')
        .map(s => s.crewId)
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

    if (scheduleSortByDate) {
      list = [...list].sort((a, b) => {
        const aHasShift = schedules.some(s => s.date === scheduleSortByDate && s.crewId === a.id && !s.isTimeOff);
        const bHasShift = schedules.some(s => s.date === scheduleSortByDate && s.crewId === b.id && !s.isTimeOff);
        if (aHasShift && !bHasShift) return -1;
        if (!aHasShift && bHasShift) return 1;
        return 0;
      });
    }
    
    return list.filter(m => m.id !== 'openshifts');
  }, [crewMembers, scheduleCrewFilter, schedulePersonSearch, schedules, scheduleSortByDate]);

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
    
    return crewMembers
      .filter(m => m.id !== 'openshifts')
      .map(m => ({ ...m, hours: getHoursForPeriod(m.id) }))
      .filter(m => m.hours > 0)
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
      color: 'bg-[#8a1cfc]',
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
  const [crewAutoReminders, setCrewAutoReminders] = useState(true);
  const [crewAutoRemindersHours, setCrewAutoRemindersHours] = useState(24);

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
  const [broadcastModal, setBroadcastModal] = useState<{
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
  const [broadcastSending, setBroadcastSending] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState<string | null>(null);
  const [emailPreviewTab, setEmailPreviewTab] = useState<'edit' | 'preview'>('preview');

  const handleSendBroadcast = async () => {
    setBroadcastSending(true);
    setBroadcastResult(null);
    try {
      const { assignedCrew, smsMessage, emailSubject, emailBody, sendSms, sendEmail, showName } = broadcastModal;
      
      const phones = assignedCrew.map(c => c.phone).filter(p => p && p.length > 0);
      const emails = assignedCrew.map(c => c.email).filter(e => e && e.length > 0);
      
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
        for (const email of emails) {
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
        }
        emailStatus = `Emails sent to ${emails.length} crew. `;
      }
      
      setBroadcastResult(`Success! ${smsStatus}${emailStatus}`);
      setAuditLog(prev => [{
        id: crypto.randomUUID(),
        text: `📢 Sent broadcast to ${showName} crew (SMS: ${sendSms ? phones.length : 0}, Email: ${sendEmail ? emails.length : 0})`,
        time: 'Just now',
        color: 'bg-amber-500',
        details: {
          type: 'broadcast',
          smsText: sendSms ? smsMessage : undefined,
          emailSubject: sendEmail ? emailSubject : undefined,
          emailHtml: sendEmail ? emailBody : undefined
        }
      }, ...prev]);
      
      setTimeout(() => {
        setBroadcastModal(prev => ({ ...prev, isOpen: false }));
        setBroadcastResult(null);
      }, 2000);
    } catch (err: any) {
      setBroadcastResult(`Error: ${err.message}`);
    } finally {
      setBroadcastSending(false);
    }
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
        
        if (matched) {
          return {
            id: matched.id,
            name: matched.name,
            phone: matched.phone || '',
            role: roles
          };
        }
        const matchedStatic = staticCrew.find(sc => sc.id === crewId);
        if (matchedStatic) {
          return {
            id: crewId,
            name: matchedStatic.name,
            phone: matchedStatic.phone || '',
            role: roles
          };
        }
        return {
          id: crewId,
          name: findCrewName(crewId),
          phone: '',
          role: roles
        };
      });
    
    const phones = assignedCrew.map(c => normalizePhoneNumber(c.phone)).filter(Boolean);
    setSelectedCrewPhones(phones);
    
    const show = tourDates.find((s: any) => s.date === dateStr);
    const showName = show ? (show.venue || show.venue_name) : 'Show';
    
    // Format date nicely
    const d = new Date(dateStr + 'T00:00:00');
    const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const formattedDate = `${daysOfWeek[d.getDay()]} ${d.getDate()}`;
    
    let rolesListStr = '';
    assignedCrew.forEach(c => {
      rolesListStr += `\n- ${c.name}: ${c.role}`;
    });
    const message = `Hey team, regarding our show at ${showName} on ${formattedDate}:${rolesListStr}`;
    
    setCrewAlertMsg(message);
    setSmsEmailSubject(`🔔 Crew Alert: ${showName} - ${formattedDate}`);
    setSendEmailAlert(true);
    setSendSmsAlert(true);
  };

  const getBandRecipientsCombined = () => {
    const bandRecipients = users.filter(u => u.role === 'admin' || (u.duty && u.duty.toUpperCase().includes('BAND MEMBER')));
    return [
      ...bandRecipients.map(r => ({
        id: r.id,
        name: r.name,
        phone: r.phone,
        role: r.duty || 'BAND MEMBER',
        avatar: r.avatar,
        email: r.email
      })),
      ...staticBand.filter(sb => !bandRecipients.some(r => r.name.toLowerCase() === sb.name.toLowerCase())).map(sb => ({
        id: sb.id,
        name: sb.name,
        phone: sb.phone,
        role: sb.role,
        avatar: sb.avatar,
        email: sb.email
      }))
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
    const phones = combined.map(b => normalizePhoneNumber(b.phone)).filter(Boolean);
    setSelectedBandPhones(phones);
    
    // Set SMS draft
    setBandAlertMsg(`Hey band, reminder for our upcoming show at ${showName} on ${formattedDate}. Load-in is 2 hours before.`);
    setBandEmailSubject(`Upcoming Show Alert: 7th Heaven at ${showName} (${formattedDate})`);
    setSendBandEmailAlert(true);
    setSendBandSmsAlert(true);
  };

  const handleSendBandAlert = async () => {
    if (!bandAlertMsg.trim()) return;
    setBandAlertSending(true);
    setBandAlertResult(null);

    const show = tourDates.find((s: any) => s.date === bandSmsSelectedShowDate);
    const combined = getBandRecipientsCombined();
    const sentToNames = combined
      .filter(b => selectedBandPhones.includes(normalizePhoneNumber(b.phone)))
      .map(b => b.name);

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

      const data = await res.json();
      if (res.ok) {
        setBandAlertResult({ success: true, count: data.sent || selectedBandPhones.length });
        setBandAlertMsg('');
        setSelectedBandPhones([]);
        setBandSmsSelectedShowDate('');
      } else {
        setBandAlertResult({ success: false, error: data.error || 'Failed to send' });
      }
    } catch (err: any) {
      setBandAlertResult({ success: false, error: 'Network error occurred.' });
    } finally {
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
      if (profilesData) {
        setUsers(profilesData.map((p: any) => ({
          id: p.id,
          name: p.full_name || p.email || 'Anonymous',
          email: p.email || '',
          phone: p.phone || '',
          role: p.role,
          duty: p.crew_duty || null,
          status: 'active',
          strikes: 0,
          avatar: p.avatar_url || p.profile_photo_url || null
        })));
      }
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
      .then(({ data }: any) => {
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
      }, (payload: any) => {
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
        setUsers(profilesData.map((p: any) => ({
          id: p.id, 
          name: p.full_name || 'Anonymous',
          email: p.email || '',
          phone: p.phone || '',
          role: p.role, 
          duty: p.crew_duty || null,
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
            const parsed = JSON.parse(saved);
            const hasStaleMock = parsed && parsed.some((item: any) => item.date && (item.date.startsWith('2023-') || item.date.startsWith('2025-')));
            if (hasStaleMock) {
              localStorage.removeItem('7h_crew_schedules');
            } else {
              currentSchedules = parsed;
            }
          }
          if (currentSchedules.length === 0) {
            const getMondayStr = (offsetDays: number = 0) => {
              const d = new Date();
              const day = d.getDay();
              const diff = d.getDate() - day + (day === 0 ? -6 : 1) + offsetDays;
              const target = new Date(d.getFullYear(), d.getMonth(), diff);
              return target.toISOString().split('T')[0];
            };
            // Default Mock Example Data
            currentSchedules = [
              { id: 'mock_1', crewId: 'arjun', crewName: 'Arjun Patel', date: getMondayStr(0), startHour: 17.0, endHour: 22.0, time: '5:00 PM - 10:00 PM', role: 'SERVER', location: 'The Chicago Theatre', notes: 'Lead server for VIP tables' },
              { id: 'mock_2', crewId: 'abbie', crewName: 'Abbie Janssen', date: getMondayStr(1), startHour: 17.0, endHour: 22.0, time: '5:00 PM - 10:00 PM', role: 'SERVER', location: 'The Chicago Theatre', notes: '' },
              { id: 'mock_3', crewId: 'al', crewName: 'Al Hollie', date: getMondayStr(2), startHour: 18.0, endHour: 23.5, time: '6:00 PM - 11:30 PM', role: 'SERVER', location: 'The Chicago Theatre', notes: '' },
              { id: 'mock_4', crewId: 'andrea', crewName: 'Andrea Kinzinger', date: getMondayStr(3), startHour: 16.0, endHour: 22.0, time: '4:00 PM - 10:00 PM', role: 'CHEF', location: 'The Chicago Theatre', notes: 'Kitchen lead' },
              { id: 'mock_5', crewId: 'openshifts', crewName: 'OpenShifts', date: getMondayStr(3), startHour: 18.0, endHour: 23.0, time: '6:00 PM - 11:00 PM', role: 'SERVER', location: 'The Chicago Theatre', notes: 'Need 1 backup server', openSlots: 1 },
              { id: 'mock_6', crewId: 'chris', crewName: 'Chris Loxely', date: getMondayStr(4), startHour: 18.0, endHour: 23.5, time: '6:00 PM - 11:30 PM', role: 'SERVER', location: 'The Chicago Theatre', notes: '' },
              { id: 'mock_7', crewId: 'dave_croke', crewName: 'Dave Croke', date: getMondayStr(4), startHour: 17.0, endHour: 23.0, time: '5:00 PM - 11:00 PM', role: 'LINE COOK', location: 'The Chicago Theatre', notes: '' },
              { id: 'mock_8', crewId: 'abbie', crewName: 'Abbie Janssen', date: getMondayStr(4), startHour: 18.0, endHour: 23.0, time: '6:00 PM - 11:00 PM', role: 'SERVER', location: 'The Chicago Theatre', notes: '' },
              { id: 'mock_9', crewId: 'daniel', crewName: 'Daniel Kim', date: getMondayStr(5), startHour: 17.0, endHour: 24.0, time: '5:00 PM - 12:00 AM', role: 'MANAGER', location: 'The Chicago Theatre', notes: 'Closing manager' },
              { id: 'mock_10', crewId: 'openshifts', crewName: 'OpenShifts', date: getMondayStr(6), startHour: 12.0, endHour: 17.0, time: '12:00 PM - 5:00 PM', role: 'SERVER', location: 'The Chicago Theatre', notes: 'Matinee show setup', openSlots: 2 }
            ];
            localStorage.setItem('7h_crew_schedules', JSON.stringify(currentSchedules));
          }
          // Test seeding for July 22, 2026: assign some crew members
          let assignedCount = 0;
          currentSchedules = currentSchedules.map((s: any) => {
            if (s.date === '2026-07-22' && s.crewId === 'openshifts') {
              if (assignedCount === 0) {
                assignedCount++;
                return { ...s, crewId: 'arjun', crewName: 'Arjun Patel', openSlots: undefined };
              } else if (assignedCount === 1) {
                assignedCount++;
                return { ...s, crewId: 'abbie', crewName: 'Abbie Janssen', openSlots: undefined };
              } else if (assignedCount === 2) {
                assignedCount++;
                return { ...s, crewId: 'al', crewName: 'Al Hollie', openSlots: undefined };
              }
            }
            return s;
          });
          localStorage.setItem('7h_crew_schedules', JSON.stringify(currentSchedules));

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

  // Initialize and synchronize preset roles
  useEffect(() => {
    const stored = localStorage.getItem('7h_preset_roles');
    if (stored) {
      setPresetRoles(JSON.parse(stored));
    } else {
      setPresetRoles([
        'STAGE HAND, MERCH',
        'MOVING EQUIPMENT, TEAR DOWN',
        'VIP HOST, MC',
        'BAND MEMBER, AUDIO MIX',
        'EQUIPMENT SETUP, LIGHTS',
        'SERVER, EVENT SUPPORT',
        'SOUND ENGINEER',
        'TOUR MANAGER'
      ]);
    }
  }, []);

  const handleAddPresetRole = (newRole: string) => {
    const trimmed = newRole.trim().toUpperCase();
    if (!trimmed || presetRoles.includes(trimmed)) return;
    const updated = [...presetRoles, trimmed];
    setPresetRoles(updated);
    localStorage.setItem('7h_preset_roles', JSON.stringify(updated));
  };

  const handleDeletePresetRole = (roleToDelete: string) => {
    const updated = presetRoles.filter(r => r !== roleToDelete);
    setPresetRoles(updated);
    localStorage.setItem('7h_preset_roles', JSON.stringify(updated));
  };

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
                  <div className="flex flex-col gap-3">
                    <Link href="/fans" className="text-[0.65rem] text-[var(--color-accent)] hover:text-white uppercase tracking-[0.15em] font-bold transition-colors">
                      ← Back to Fan Dashboard
                    </Link>
                    <button
                      onClick={() => logout()}
                      className="text-[0.65rem] text-red-400 hover:text-red-300 uppercase tracking-[0.15em] font-bold transition-colors cursor-pointer"
                    >
                      Sign Out & Switch Account
                    </button>
                  </div>
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
                    <button
                      type="button"
                      onClick={() => openModal("forgot")}
                      className="text-[10px] text-red-400 hover:text-white transition-colors block text-right w-full mt-1.5"
                    >
                      Forgot Password?
                    </button>
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
  const renderInfoToggle = (sectionId: string) => {
    const isOpen = openInfoSection === sectionId;
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpenInfoSection(isOpen ? null : sectionId);
        }}
        className="w-[18px] h-[18px] rounded-full bg-white/5 hover:bg-amber-500/20 border border-white/10 hover:border-amber-500/30 flex items-center justify-center text-[9px] font-black text-white/40 hover:text-amber-400 transition-all cursor-pointer shrink-0 ml-1.5"
        title="Show info"
      >
        i
      </button>
    );
  };

  const renderInfoBanner = (sectionId: string, title: string, description: string) => {
    if (openInfoSection !== sectionId) return null;
    return (
      <div className="mx-6 mt-4 p-3.5 bg-amber-500/5 border border-amber-500/15 text-amber-200/90 text-xs rounded-xl flex items-start gap-2.5 animate-[fadeIn_0.2s_ease-out] shrink-0" onClick={(e) => e.stopPropagation()}>
        <span className="text-sm select-none">ℹ️</span>
        <div>
          <p className="font-extrabold uppercase tracking-wider text-[9px] text-amber-400">About {title}</p>
          <p className="mt-0.5 leading-normal opacity-80">{description}</p>
        </div>
      </div>
    );
  };
  const renderAnnouncements = () => (
    <div className="space-y-6">
      <ProfilePhotoUploader />
      <section id="admin-sec-announcements" className="bg-[#0f0f13] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
      <div onClick={() => toggleSection('announcements')} className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20 cursor-pointer select-none hover:bg-black/30 transition-colors">
        <div className="flex items-center gap-2">
          <div className="drag-handle cursor-grab active:cursor-grabbing p-1.5 hover:bg-white/5 rounded text-white/20 hover:text-white/50 transition-all shrink-0 mr-1" title="Drag to reorder section" onClick={(e) => e.stopPropagation()}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>
          </div>
          <h3 className="text-lg font-bold tracking-tight text-white flex items-center gap-2 cursor-pointer">
            📡 Band Announcements
            {renderInfoToggle('announcements')}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <div className={"w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center transition-transform duration-300 " + (isSectionOpen('announcements') ? 'rotate-0' : '-rotate-90')}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40"><path d="M2 4l4 4 4-4" /></svg>
          </div>
        </div>
      </div>
      {renderInfoBanner('announcements', 'Band Announcements', 'Post band updates, news, and urgent alerts across the entire public site banner.')}
      <div style={{ display: isSectionOpen('announcements') ? undefined : 'none' }}>
        <div className="p-6">
          {/* Global Announcement Banner Control */}
          <div className={`relative z-10 bg-[#0a0a0f]/80 backdrop-blur-xl border ${bannerActive ? 'border-[var(--color-accent)]/50 shadow-[0_0_30px_rgba(133,29,239,0.15)]' : 'border-white/5 hover:border-white/10'} rounded-2xl p-6 md:p-8 transition-all duration-500 flex flex-col group`}>
            <div className={`absolute inset-0 ${bannerActive ? 'bg-[var(--color-accent)]/5' : 'bg-transparent'} pointer-events-none transition-all duration-500 rounded-2xl`} />
            
            <div className="relative z-10 flex flex-col">
              {/* Header row */}
              <div className="flex items-start justify-between gap-4 cursor-pointer select-none" onClick={() => toggleSection('globalalert')}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 shrink-0 rounded-xl ${bannerActive ? 'bg-[var(--color-accent)]/20 border-[var(--color-accent)]/40 shadow-[0_0_15px_rgba(133,29,239,0.3)]' : 'bg-white/5 border-white/10 group-hover:bg-white/10'} border flex items-center justify-center text-2xl transition-all duration-500`}>📢</div>
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
              </div>
              
              {/* Collapsible Content */}
              <div style={{ display: isSectionOpen('globalalert') ? undefined : 'none' }} className="flex flex-col gap-6 mt-6">
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
      </div>
    </section>
  </div>
  );

  const renderAnalytics = () => (
    <section id="admin-sec-analytics" className="bg-[#0f0f13] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
      <div onClick={() => toggleSection('analytics')} className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20 cursor-pointer select-none hover:bg-black/30 transition-colors">
        <div className="flex items-center gap-2">
          <div className="drag-handle cursor-grab active:cursor-grabbing p-1.5 hover:bg-white/5 rounded text-white/20 hover:text-white/50 transition-all shrink-0 mr-1" title="Drag to reorder section" onClick={(e) => e.stopPropagation()}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>
          </div>
          <h3 className="text-lg font-bold tracking-tight text-white flex items-center gap-2 cursor-pointer">
            📊 Google Analytics
            {renderInfoToggle('analytics')}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded text-[0.6rem] font-bold text-blue-400 uppercase tracking-widest animate-pulse select-none shrink-0" onClick={(e) => e.stopPropagation()}>
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
            Live Data
          </span>
          <div className={"w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center transition-transform duration-300 " + (isSectionOpen('analytics') ? 'rotate-0' : '-rotate-90')}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40"><path d="M2 4l4 4 4-4" /></svg>
          </div>
        </div>
      </div>
      {renderInfoBanner('analytics', 'Google Analytics', 'Monitor active sitewide users, session metrics, pageviews, and visitor geo-traffic with Google Analytics integration.')}
      <div style={{ display: isSectionOpen('analytics') ? undefined : 'none' }}>
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
            <div className="bg-black/30 border border-white/10 rounded-xl p-5 col-span-2 lg:col-span-1">
              <p className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-white/40 mb-2">Conversion Rate</p>
              <p className="text-2xl font-black text-[#10b981]">{gaData.conversionRate}</p>
              <p className="text-[0.55rem] text-white/30 mt-1 uppercase tracking-widest">Traffic → Sale</p>
            </div>
            <div className="bg-black/30 border border-white/10 rounded-xl p-5 col-span-2 lg:col-span-1">
              <p className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-white/40 mb-2">Revenue / Session</p>
              <p className="text-2xl font-black text-white">{gaData.revenuePerSession}</p>
              <p className="text-[0.55rem] text-white/30 mt-1 uppercase tracking-widest">Avg Value</p>
            </div>
            <div className="bg-black/30 border border-white/10 rounded-xl p-5 col-span-2 lg:col-span-1">
              <p className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-white/40 mb-2">Bounce Rate</p>
              <p className="text-2xl font-black text-white">{gaData.bounceRate}</p>
              <p className="text-[0.55rem] text-white/30 mt-1 uppercase tracking-widest">Engagement</p>
            </div>
          </div>

          {/* Hotspot Analytics Map */}
          <div className="bg-black/20 border border-white/5 rounded-xl p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(66,133,244,0.1)_0%,transparent_70%)] opacity-50 pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 w-full relative">
                <AdminMap key={`admin-map-${sectionOrder.join(',')}`} locations={gaData.locations} />
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
      </div>
    </section>
  );

  const renderShopify = () => (
    <section className="bg-[#0f0f13] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
              <div onClick={() => toggleSection('shopify')} className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20 cursor-pointer select-none hover:bg-black/30 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="drag-handle cursor-grab active:cursor-grabbing p-1.5 hover:bg-white/5 rounded text-white/20 hover:text-white/50 transition-all shrink-0 mr-1" title="Drag to reorder section" onClick={(e) => e.stopPropagation()}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>
                  </div>
                  <h3 className="cursor-pointer text-lg font-bold tracking-tight flex items-center gap-2 text-white">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#96bf48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                  Shopify
                  {renderInfoToggle('shopify')}
                </h3>
                </div>
                <div className="flex items-center gap-3">
                  {/* Shopify vs Simulated Toggle */}
                  <div className="flex bg-black rounded p-1 border border-white/10" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setShopifyTab('shopify')}
                      className={`px-3 py-1.5 text-[0.6rem] font-bold uppercase tracking-widest rounded transition-colors ${shopifyTab === 'shopify' ? 'bg-[#96bf48]/20 text-[#96bf48]' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                    >
                      Shopify API
                    </button>
                    <button
                      onClick={() => setShopifyTab('simulated')}
                      className={`px-3 py-1.5 text-[0.6rem] font-bold uppercase tracking-widest rounded transition-colors ${shopifyTab === 'simulated' ? 'bg-purple-500/20 text-[#c084fc]' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                    >
                      Simulated Checkouts
                    </button>
                  </div>
                  {shopifyTab === 'shopify' && (
                    <div className="flex items-center gap-3 animate-in fade-in duration-300">
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
                          <th className="px-4 py-3 font-bold border-b border-white/5 text-center">QR Code</th>
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
                              <td className="px-4 py-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => openQrModal(p)}
                                  className="inline-flex items-center justify-center p-1.5 bg-white/5 hover:bg-white/15 border border-white/10 rounded-lg transition-colors group cursor-pointer"
                                  title="View & Print QR Code"
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/60 group-hover:text-white"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                                </button>
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
                          <th className="px-4 py-3 font-bold border-b border-white/5 text-center">QR Code</th>
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
                              <td className="px-4 py-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => openQrModal(p)}
                                  className="inline-flex items-center justify-center p-1.5 bg-white/5 hover:bg-white/15 border border-white/10 rounded-lg transition-colors group cursor-pointer"
                                  title="View & Print QR Code"
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/60 group-hover:text-white"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                                </button>
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
              ) : null) : (
                <div className="p-6 animate-in fade-in duration-300">
                  {/* Simulated Metrics Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-black/30 border border-purple-500/20 rounded-xl p-5 hover:border-purple-500/40 transition-all">
                      <p className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-purple-400 mb-2">Simulated Revenue</p>
                      <p className="text-2xl font-black text-white font-mono">
                        ${simulatedOrders.reduce((sum, o) => sum + parseFloat(o.price?.replace(/[$,]/g, '') || '0'), 0).toFixed(2)}
                      </p>
                      <p className="text-[0.55rem] text-white/30 mt-1 uppercase tracking-widest font-bold">Store + Flash Drop</p>
                    </div>
                    <div className="bg-black/30 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all">
                      <p className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-white/40 mb-2">Store Purchases</p>
                      <p className="text-2xl font-black text-white font-mono">
                        {simulatedOrders.filter(o => o.source === 'Store').length}
                      </p>
                      <p className="text-[0.55rem] text-white/30 mt-1 uppercase tracking-widest font-bold">Normal store checkout</p>
                    </div>
                    <div className="bg-black/30 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all">
                      <p className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-white/40 mb-2">Flash Drops</p>
                      <p className="text-2xl font-black text-white font-mono">
                        {simulatedOrders.filter(o => o.source === 'Flash Drop').length}
                      </p>
                      <p className="text-[0.55rem] text-white/30 mt-1 uppercase tracking-widest font-bold">Live drop purchases</p>
                    </div>
                    <div className="bg-black/30 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all">
                      <p className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-white/40 mb-2">Raffle Claims</p>
                      <p className="text-2xl font-black text-white font-mono">
                        {simulatedOrders.filter(o => o.source === 'Raffle').length}
                      </p>
                      <p className="text-[0.55rem] text-white/30 mt-1 uppercase tracking-widest font-bold">Claims via winning PIN</p>
                    </div>
                  </div>

                  {/* Fulfillment & Pack Tracking Table */}
                  <div className="bg-black/20 border border-white/5 rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                      <h4 className="text-sm font-bold flex items-center gap-2">
                        📦 Simulated Order Fulfillment & Package Tracking Queue
                      </h4>
                      <span className="text-[0.55rem] text-white/30 uppercase tracking-widest">{simulatedOrders.length} total orders</span>
                    </div>
                    <div className="max-h-[500px] overflow-y-auto custom-scrollbar" data-lenis-prevent="true">
                      {simulatedOrders.length === 0 ? (
                        <div className="p-8 text-center text-white/30 text-xs">No simulated orders yet. Go to store page and purchase items!</div>
                      ) : (
                        <table className="w-full text-left">
                          <thead>
                            <tr className="bg-[#0f0f13] text-[0.55rem] uppercase tracking-widest text-white/25 border-b border-white/5">
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
                                  <div className="font-mono text-xs font-bold text-purple-400">#SIM-{order.id.toString().slice(-6)}</div>
                                  <div className="text-[0.55rem] text-white/30 mt-0.5">
                                    {new Date(order.ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="text-sm font-bold text-white/90">{order.customer}</div>
                                  <div className="text-[0.6rem] text-white/40">{order.email || 'No email provided'}</div>
                                  {order.address && (
                                    <div className="text-[0.55rem] text-white/30 mt-0.5 truncate max-w-[150px]" title={`${order.address}, ${order.city}, ${order.zip}`}>
                                      📍 {order.address}, {order.city}
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
                                    <div className="text-[0.55rem] text-purple-400/80 font-semibold uppercase tracking-wider mt-0.5">
                                      {order.method === 'merch_table' ? 'Merch Table Pickup' : 'Shipping'}
                                    </div>
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`inline-block px-2 py-0.5 rounded text-[0.5rem] font-bold uppercase tracking-widest ${
                                    order.source === 'Flash Drop' ? 'bg-pink-500/15 text-pink-400 border border-pink-500/30'
                                    : order.source === 'Raffle' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                    : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                                  }`}>{order.source}</span>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex flex-col gap-1">
                                    <span className={`inline-block px-2 py-0.5 rounded text-[0.5rem] font-bold uppercase tracking-widest w-fit ${
                                      order.status === 'Shipped' || order.status === 'Claimed' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                      : order.status === 'Ready for Pickup' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                      : 'bg-white/5 text-white/40 border border-white/10'
                                    }`}>{order.status}</span>
                                    {order.trackingNumber && (
                                      <div className="text-[0.55rem] font-mono text-emerald-400/80 mt-0.5">
                                        🚚 {order.trackingNumber}
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  {order.status === 'Pending' && order.method === 'shipping' && (
                                    <button
                                      onClick={() => handleUpdateSimulatedOrderStatus(order.id, 'Shipped')}
                                      className="px-2.5 py-1 bg-purple-500 hover:bg-purple-400 text-white text-[0.55rem] font-black uppercase tracking-wider rounded transition-all cursor-pointer shadow-[0_0_10px_rgba(168,85,247,0.3)] hover:scale-105 active:scale-95"
                                    >
                                      🚚 Ship Package
                                    </button>
                                  )}
                                  {order.status === 'Ready for Pickup' && (
                                    <button
                                      onClick={() => handleUpdateSimulatedOrderStatus(order.id, 'Claimed')}
                                      className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-black text-[0.55rem] font-black uppercase tracking-wider rounded transition-all cursor-pointer shadow-[0_0_10px_rgba(245,158,11,0.3)] hover:scale-105 active:scale-95"
                                    >
                                      🎫 Claim Merch
                                    </button>
                                  )}
                                  {(order.status === 'Shipped' || order.status === 'Claimed') && (
                                    <span className="text-[0.55rem] text-emerald-400/60 font-bold uppercase tracking-wider">
                                      ✓ Complete
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
    <section className="bg-[#0f0f13] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
              <div onClick={() => toggleSection('bookings')} className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20 cursor-pointer select-none hover:bg-black/30 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="drag-handle cursor-grab active:cursor-grabbing p-1.5 hover:bg-white/5 rounded text-white/20 hover:text-white/50 transition-all shrink-0 mr-1" title="Drag to reorder section" onClick={(e) => e.stopPropagation()}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>
                  </div>
                  <h3 className="cursor-pointer text-lg font-bold tracking-tight flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  Booking Requests
                  {renderInfoToggle('bookings')}
                </h3>
                </div>
                <div className="flex items-center gap-3">
                  
                  <div className={"w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center transition-transform duration-300 " + (isSectionOpen('bookings') ? 'rotate-0' : '-rotate-90')}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40"><path d="M2 4l4 4 4-4" /></svg>
                  </div>
                </div>
              </div>
              {renderInfoBanner('bookings', 'Booking Requests', 'Manage client booking requests, review contact details, proposal prices, dates, and approve or decline reservations.')}
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
                <div className="flex items-center gap-2">
                  <div className="drag-handle cursor-grab active:cursor-grabbing p-1.5 hover:bg-white/5 rounded text-white/20 hover:text-white/50 transition-all shrink-0 mr-1" title="Drag to reorder section" onClick={(e) => e.stopPropagation()}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>
                  </div>
                  <h3 className="cursor-pointer text-lg font-bold tracking-tight flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                  Event Planners Directory
                  {renderInfoToggle('planners')}
                </h3>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[0.6rem] uppercase font-bold tracking-widest flex items-center gap-2 text-white/40">
                  {Array.from(new Map(bookings.filter(b => b.email).map(b => [b.email, b])).values()).length} Planners
                </span>
                  <div className={"w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center transition-transform duration-300 " + (isSectionOpen('planners') ? 'rotate-0' : '-rotate-90')}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40"><path d="M2 4l4 4 4-4" /></svg>
                  </div>
                </div>
              </div>
              {renderInfoBanner('planners', 'Event Planners Directory', 'Browse the list of event planners, view their contact information, and review past and current booking requests.')}
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
                <div className="flex items-center gap-2">
                  <div className="drag-handle cursor-grab active:cursor-grabbing p-1.5 hover:bg-white/5 rounded text-white/20 hover:text-white/50 transition-all shrink-0 mr-1" title="Drag to reorder section" onClick={(e) => e.stopPropagation()}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>
                  </div>
                  <h3 className="cursor-pointer text-lg font-bold tracking-tight flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  Fan Photo Moderation Queue
                  {renderInfoToggle('photomod')}
                </h3>
                </div>
                <div className="flex items-center gap-3">
                  
                  <div className={"w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center transition-transform duration-300 " + (isSectionOpen('photomod') ? 'rotate-0' : '-rotate-90')}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40"><path d="M2 4l4 4 4-4" /></svg>
                  </div>
                </div>
              </div>
              {renderInfoBanner('photomod', 'Fan Photo Moderation Queue', 'Review fan-submitted concert and show photos, check compliance, and approve or reject them for the public photo wall.')}
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
    <section className="bg-[#0f0f13] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
              <div onClick={() => toggleSection('memorymod')} className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20 cursor-pointer select-none hover:bg-black/30 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="drag-handle cursor-grab active:cursor-grabbing p-1.5 hover:bg-white/5 rounded text-white/20 hover:text-white/50 transition-all shrink-0 mr-1" title="Drag to reorder section" onClick={(e) => e.stopPropagation()}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>
                  </div>
                  <h3 className="text-lg font-bold tracking-tight flex items-center gap-2 cursor-pointer text-white">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z"/><path d="M12 8v4l3 3"/></svg>
                    Memory Moderation Queue
                    {renderInfoToggle('memorymod')}
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
              {renderInfoBanner('memorymod', 'Memory Moderation Queue', 'Review fan memories, stories, and concert anecdotes before they are published to the public website timeline.')}
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




  const renderLiveAlerts = () => (
    <section className="bg-[#0f0f13] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
              <div onClick={() => toggleSection('livealerts')} className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20 cursor-pointer select-none hover:bg-black/30 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="drag-handle cursor-grab active:cursor-grabbing p-1.5 hover:bg-white/5 rounded text-white/20 hover:text-white/50 transition-all shrink-0 mr-1" title="Drag to reorder section" onClick={(e) => e.stopPropagation()}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>
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
                <div className="flex items-center gap-2">
                  <div className="drag-handle cursor-grab active:cursor-grabbing p-1.5 hover:bg-white/5 rounded text-white/20 hover:text-white/50 transition-all shrink-0 mr-1" title="Drag to reorder section" onClick={(e) => e.stopPropagation()}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>
                  </div>
                  <h3 className="cursor-pointer text-lg font-bold tracking-tight text-white flex items-center gap-2">
                    SMS Proximity Blast
                    {renderInfoToggle('smsblast')}
                  </h3>
                </div>
                <div className="flex items-center gap-3">
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
              {renderInfoBanner('smsblast', 'SMS Proximity Blast', 'Draft and dispatch geofenced text message updates and blast notifications to fans based on their proximity to upcoming concert venues.')}
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

  const renderCrewSms = () => {
    const recipients = crewAlertStats?.recipients || [];

    const allCrewCombined = [
      ...recipients.map(r => {
        const matchedStatic = staticCrew.find(sc => sc.id === r.id);
        const defaultRole = matchedStatic ? matchedStatic.role : (r.role && r.role !== 'crew' ? r.role : 'CREW');
        return {
          id: r.id,
          name: r.name,
          phone: r.phone,
          role: r.duty || defaultRole,
          avatar: r.avatar,
          email: r.email
        };
      }),
      ...staticCrew.filter(sc => !recipients.some(r => r.id === sc.id)).map(sc => ({
        id: sc.id,
        name: sc.name,
        phone: sc.phone,
        role: sc.role || 'CREW',
        avatar: sc.avatar,
        email: sc.email
      }))
    ];

    const handleTogglePhone = (phone: string) => {
      const norm = normalizePhoneNumber(phone);
      if (!norm) return;
      setSelectedCrewPhones(prev => 
        prev.includes(norm) ? prev.filter(p => p !== norm) : [...prev, norm]
      );
    };

    const handleSelectGroup = (groupName: string) => {
      setSelectedGroup(groupName);
      if (groupName === '') {
        setSelectedCrewPhones([]);
        return;
      }
      if (groupName === 'all') {
        setSelectedCrewPhones(recipients.map(r => normalizePhoneNumber(r.phone)).filter(Boolean));
        return;
      }
      const group = crewGroups.find(g => g.name === groupName);
      if (group) {
        const phones = recipients
          .filter(r => 
            group.memberIds.some(mId => 
              mId === r.id || 
              mId.toLowerCase() === (r.name || '').toLowerCase()
            )
          )
          .map(r => normalizePhoneNumber(r.phone))
          .filter(Boolean);
        setSelectedCrewPhones(phones);
      }
    };

    const handleSaveSmsGroup = () => {
      const trimmed = newSmsGroupName.trim();
      if (!trimmed) {
        setNewSmsGroupError('Please enter a group name.');
        return;
      }
      
      const memberIds = recipients
        .filter(r => selectedCrewPhones.includes(normalizePhoneNumber(r.phone)))
        .map(r => r.id);
        
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
      localStorage.setItem('7h_crew_groups', JSON.stringify(updatedGroups));
      
      setSelectedGroup(trimmed);
      setNewSmsGroupName('');
      setShowSaveSmsGroup(false);
    };

    const handleSaveDuty = async (profileId: string) => {
      setSavingDuty(true);
      try {
        const res = await fetch('/api/admin/crew-alert', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profileId, duty: editingDutyValue }),
        });
        const data = await res.json();
        if (data.success) {
          setCrewAlertStats((prev: any) => {
            if (!prev) return prev;
            return {
              ...prev,
              recipients: prev.recipients?.map((item: any) => 
                item.id === profileId ? { ...item, duty: editingDutyValue || null } : item
              )
            };
          });
          setEditingDutyMemberId(null);
        } else {
          alert(data.error || 'Failed to update role');
        }
      } catch (err: any) {
        alert(err.message || 'Error occurred');
      }
      setSavingDuty(false);
    };

    return (
      <section id="section-crewsms" className="bg-[#0f0f13] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        <div onClick={() => toggleSection('crewsms')} className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20 cursor-pointer select-none hover:bg-black/30 transition-colors">
          <div className="flex items-center gap-2">
            <div className="drag-handle cursor-grab active:cursor-grabbing p-1.5 hover:bg-white/5 rounded text-white/20 hover:text-white/50 transition-all shrink-0 mr-1" title="Drag to reorder section" onClick={(e) => e.stopPropagation()}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>
            </div>
            <h3 className="cursor-pointer text-lg font-bold tracking-tight flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              🛡️ Crew SMS Alert & Group Setup
                        {renderInfoToggle('crewsms')}
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <div className={"w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center transition-transform duration-300 " + (isSectionOpen('crewsms') ? 'rotate-0' : '-rotate-90')}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/40"><path d="M2 4l4 4 4-4" /></svg>
            </div>
          </div>
        </div>
        {renderInfoBanner('crewsms', 'Crew SMS Alert', 'Broadcast instant SMS alerts, shift notifications, or urgent calendar changes directly to all registered crew members.')}
        <div style={{ display: isSectionOpen('crewsms') ? undefined : 'none' }}>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Crew List (Choose Recipients) */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="text-[0.65rem] font-bold uppercase tracking-widest text-white/40 block">Choose Recipients</label>
                    <button
                      type="button"
                      onClick={() => setIsManageRolesModalOpen(true)}
                      className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[9px] font-bold text-white/60 hover:text-white transition-all cursor-pointer flex items-center gap-1 border-solid"
                    >
                      ⚙️ Manage Preset Roles
                    </button>
                  </div>
                  <span className="text-[0.6rem] text-white/30 font-mono">
                    Showing {recipients.length} Crew Member{recipients.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="bg-[#14141c]/40 border border-white/5 rounded-2xl p-4 max-h-[460px] overflow-y-auto custom-scrollbar">
                  <div className="flex flex-col gap-1.5">
                    {recipients.map((r) => {
                      const isChecked = selectedCrewPhones.includes(normalizePhoneNumber(r.phone));
                      const isEditingThis = editingDutyMemberId === r.id;
                      return (
                        <div
                          key={r.id}
                          className={`flex items-center justify-between gap-2 px-2.5 rounded-lg border transition-all duration-300 relative h-[32px] ${
                            isChecked
                              ? 'bg-amber-500/[0.06] border-amber-500/30 text-white shadow-[0_0_10px_rgba(245,158,11,0.03)]'
                              : 'bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]'
                          }`}
                          title={`📞 ${r.phone || 'No phone'} \n✉️ ${r.email || 'No email'}`}
                        >
                          <div 
                            onClick={() => r.phone && handleTogglePhone(r.phone)}
                            className={`flex items-center gap-2.5 flex-1 min-w-0 select-none h-full ${!r.phone ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            {/* Styled Checkbox */}
                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all shrink-0 ${
                              !r.phone 
                                ? 'border-white/5 bg-white/5 opacity-25' 
                                : isChecked 
                                  ? 'bg-amber-500 border-amber-500 text-black' 
                                  : 'border-white/20 bg-black/45 hover:border-white/40'
                            }`}>
                              {isChecked && r.phone && (
                                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                              )}
                            </div>

                            {/* Avatar */}
                            {r.avatar ? (
                              <img src={r.avatar} alt={r.name} className={`w-5.5 h-5.5 rounded-full object-cover shrink-0 border border-white/10 ${!r.phone ? 'opacity-40' : ''}`} />
                            ) : (
                              <div className={`w-5.5 h-5.5 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/10 flex items-center justify-center text-[7.5px] font-black uppercase text-amber-400 shrink-0 ${!r.phone ? 'opacity-40' : ''}`}>
                                {r.name.slice(0, 2)}
                              </div>
                            )}

                            {/* Name */}
                            <span className={`text-xs font-bold truncate leading-none ${!r.phone ? 'text-white/40' : 'text-white'}`}>{r.name}</span>
                          </div>

                          {/* Role & Edit actions */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            {isEditingThis ? (
                              <div className="flex items-center gap-1.5 animate-[fadeIn_0.2s_ease-out]">
                                {!isCustomDuty ? (
                                  <select
                                    value={editingDutyValue}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      if (val === 'CUSTOM') {
                                        setIsCustomDuty(true);
                                        setEditingDutyValue('');
                                      } else {
                                        setEditingDutyValue(val);
                                      }
                                    }}
                                    className="bg-black border border-white/15 rounded px-1.5 py-0.5 text-[9.5px] text-white focus:outline-none focus:border-amber-500/50 max-w-[130px] cursor-pointer"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <option value="">No role</option>
                                    {presetRoles.map((role) => (
                                      <option key={role} value={role}>{role}</option>
                                    ))}
                                    <option value="CUSTOM">✍️ Custom Role...</option>
                                  </select>
                                ) : (
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="text"
                                      value={editingDutyValue}
                                      onChange={(e) => setEditingDutyValue(e.target.value)}
                                      placeholder="Custom role..."
                                      className="w-[85px] bg-black border border-white/15 rounded px-2 py-0.5 text-[9.5px] text-white focus:outline-none focus:border-amber-500/50"
                                      onClick={(e) => e.stopPropagation()}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          handleSaveDuty(r.id);
                                          setIsCustomDuty(false);
                                        }
                                      }}
                                    />
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setIsCustomDuty(false);
                                        setEditingDutyValue('');
                                      }}
                                      className="p-1 bg-white/5 hover:bg-white/10 text-white/50 text-[8.5px] rounded cursor-pointer border-none shrink-0"
                                      title="Back to List"
                                    >
                                      ↩
                                    </button>
                                  </div>
                                )}

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSaveDuty(r.id);
                                    setIsCustomDuty(false);
                                  }}
                                  disabled={savingDuty}
                                  className="p-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-bold text-[8.5px] rounded cursor-pointer border-none shrink-0"
                                >
                                  ✓
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingDutyMemberId(null);
                                    setIsCustomDuty(false);
                                  }}
                                  className="p-1 bg-white/5 hover:bg-white/10 text-white/50 text-[8.5px] rounded cursor-pointer border-none shrink-0"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <>
                                {r.duty ? (
                                  <span className="inline-block text-[8.5px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded leading-none shrink-0">
                                    {r.duty}
                                  </span>
                                ) : (
                                  <span className="text-[8.5px] text-white/20 italic leading-none shrink-0">No role</span>
                                )}

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingDutyMemberId(r.id);
                                    setEditingDutyValue(r.duty || '');
                                  }}
                                  className="p-1 rounded bg-white/5 hover:bg-white/10 border border-white/5 text-white/40 hover:text-white/80 transition-all cursor-pointer flex items-center justify-center"
                                  title="Edit Role"
                                >
                                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"/></svg>
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Group Setup & Message Sending */}
              <div className="space-y-5">
                {/* Group dropdown & save selection */}
                <div className="bg-[#14141c]/40 border border-white/5 rounded-2xl p-4 space-y-4">
                  <div>
                    <label className="text-[0.65rem] font-bold text-white/40 uppercase tracking-wider block mb-2">Select Group</label>
                    <div className="relative">
                      <select
                        value={selectedGroup}
                        onChange={(e) => handleSelectGroup(e.target.value)}
                        className="w-full appearance-none pr-8 pl-3 py-2 border border-white/10 bg-black/40 hover:bg-white/5 text-xs font-bold text-white/70 hover:text-white rounded-lg shadow-sm transition-colors cursor-pointer outline-none border-solid"
                      >
                        <option value="">Choose a group...</option>
                        <option value="all">📢 All Crew & Admins ({recipients.length})</option>
                        {crewGroups.map((g, idx) => (
                          <option key={idx} value={g.name}>👥 {g.name} ({g.memberIds.length})</option>
                        ))}
                      </select>
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-white/30">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                      </div>
                    </div>
                  </div>

                  {/* Select Show */}
                  <div>
                    <label className="text-[0.65rem] font-bold text-white/40 uppercase tracking-wider block mb-2">Select Show (Autofill Crew)</label>
                    <div className="relative">
                      <select
                        value={smsSelectedShowDate}
                        onChange={(e) => selectShowForSms(e.target.value)}
                        className="w-full appearance-none pr-8 pl-3 py-2 border border-white/10 bg-black/40 hover:bg-white/5 text-xs font-bold text-white/70 hover:text-white rounded-lg shadow-sm transition-colors cursor-pointer outline-none border-solid"
                      >
                        <option value="">Choose a show...</option>
                        {tourDates
                          .filter((show: any) => show.date)
                          .sort((a: any, b: any) => a.date.localeCompare(b.date))
                          .map((show: any) => (
                            <option key={show.date} value={show.date}>
                              🎸 {show.venue || show.venue_name} ({show.date})
                            </option>
                          ))}
                      </select>
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-white/30">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                      </div>
                    </div>
                  </div>

                  {/* Active Show Banner */}
                  {(() => {
                    if (!smsSelectedShowDate) return null;
                    const show = tourDates.find((s: any) => s.date === smsSelectedShowDate);
                    const showVenue = show ? (show.venue || show.venue_name) : 'Show';
                    return (
                      <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl flex items-center justify-between text-xs animate-[fadeIn_0.2s_ease-out]">
                        <div>
                          <span className="text-[0.65rem] font-bold text-amber-400 block uppercase tracking-widest">Active Show Target</span>
                          <span className="text-white font-bold">{showVenue} ({smsSelectedShowDate})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => selectShowForSms('')}
                          className="text-white/40 hover:text-white transition-colors border-none bg-transparent cursor-pointer text-sm font-bold"
                          title="Clear targeted show"
                        >
                          ✕
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
                      <div className="p-3 bg-black/20 border border-white/5 rounded-xl space-y-2 text-xs animate-[fadeIn_0.2s_ease-out]">
                        <div className="flex items-center justify-between">
                          <span className="text-[0.65rem] font-bold text-white/40 uppercase tracking-widest">Group Members ({names.length})</span>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete the group "${group.name}"?`)) {
                                const updated = crewGroups.filter(g => g.name !== group.name);
                                setCrewGroups(updated);
                                localStorage.setItem('7h_crew_groups', JSON.stringify(updated));
                                setSelectedGroup("");
                                setSelectedCrewPhones([]);
                              }
                            }}
                            className="text-[9px] text-rose-400 hover:text-rose-300 font-bold border-none bg-transparent cursor-pointer"
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
                      <div className="flex flex-col gap-2.5 bg-black/20 border border-white/5 rounded-xl p-3 animate-[slideIn_0.2s_ease-out]">
                        <div className="flex flex-col gap-1">
                          <label className="text-[0.55rem] font-bold uppercase tracking-widest text-white/40">New Group Name</label>
                          <input
                            type="text"
                            value={newSmsGroupName}
                            onChange={(e) => {
                              setNewSmsGroupName(e.target.value);
                              if (newSmsGroupError) setNewSmsGroupError('');
                            }}
                            placeholder="Group name..."
                            className="bg-black border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500/50"
                          />
                        </div>

                        {/* Inline Checklist */}
                        <div className="flex flex-col gap-1">
                          <label className="text-[0.55rem] font-bold uppercase tracking-widest text-white/40">Select Group Members</label>
                          <div className="max-h-[110px] overflow-y-auto custom-scrollbar border border-white/5 rounded-lg p-2 bg-black/40 space-y-1.5">
                            {allCrewCombined.map(r => {
                              const isChecked = selectedCrewPhones.includes(normalizePhoneNumber(r.phone));
                              return (
                                <label key={r.id} className="flex items-center justify-between gap-2 cursor-pointer select-none text-[11px] text-white/80 hover:text-white py-0.5">
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => {
                                        if (newSmsGroupError) setNewSmsGroupError('');
                                        const norm = normalizePhoneNumber(r.phone);
                                        if (!norm) return;
                                        setSelectedCrewPhones(prev => 
                                          prev.includes(norm) 
                                            ? prev.filter(p => p !== norm) 
                                            : [...prev, norm]
                                        );
                                      }}
                                      className="rounded border-white/10 bg-black text-amber-500 focus:ring-0 focus:ring-offset-0 w-3 h-3 cursor-pointer"
                                    />
                                    <span>{r.name}</span>
                                  </div>
                                  {r.role && (
                                    <span className="text-[7.5px] font-black uppercase tracking-wider text-white/30 px-1 border border-white/5 rounded shrink-0">
                                      {r.role}
                                    </span>
                                  )}
                                </label>
                              );
                            })}
                          </div>
                        </div>

                        {newSmsGroupError && (
                          <span className="text-[9px] font-bold text-red-400 block leading-tight">
                            ⚠️ {newSmsGroupError}
                          </span>
                        )}

                        <div className="flex items-center gap-2 mt-1">
                          <button
                            type="button"
                            onClick={handleSaveSmsGroup}
                            className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded transition-colors cursor-pointer border-none flex-1"
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
                        className="w-full px-3 py-2 border border-white/10 hover:bg-white/5 text-xs font-bold text-white/70 hover:text-white rounded-lg shadow-sm transition-colors cursor-pointer border-solid bg-transparent"
                      >
                        💾 Save Selection as Group
                      </button>
                    )}
                  </div>
                </div>

                {/* Visual Recipients List */}
                {(() => {
                  const checkedRecipients = allCrewCombined.filter(c => selectedCrewPhones.includes(normalizePhoneNumber(c.phone)));
                  if (checkedRecipients.length === 0) return null;
                  return (
                    <div className="space-y-2">
                      <span className="text-[0.65rem] font-bold text-white/40 uppercase tracking-wider block">
                        Recipients ({checkedRecipients.length})
                      </span>
                      <div className="flex flex-col gap-2 bg-black/20 border border-white/5 rounded-xl p-3 max-h-[220px] overflow-y-auto custom-scrollbar">
                        {checkedRecipients.map(r => {
                          const dayShifts = schedulesByDateAndCrew[smsSelectedShowDate || '']?.[r.id] || [];
                          const roleStr = dayShifts.length > 0
                            ? Array.from(new Set(dayShifts.map(s => s.role))).join(', ')
                            : (r.role ? r.role.toUpperCase() : 'CREW');
                          
                          const isEditingThis = editingDutyMemberId === r.id;
                          
                          if (isEditingThis) {
                            return (
                              <div key={r.id} className="flex flex-col gap-2 p-2.5 bg-white/[0.04] border border-amber-500/20 rounded-lg text-xs animate-[fadeIn_0.2s_ease-out]">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 truncate">
                                    {r.avatar ? (
                                      <img src={r.avatar} alt={r.name} className="w-6.5 h-6.5 rounded-full object-cover border border-white/10" />
                                    ) : (
                                      <div className="w-6.5 h-6.5 rounded-full bg-gradient-to-br from-amber-500/25 to-orange-500/25 border border-amber-500/10 flex items-center justify-center text-[8px] font-black uppercase text-amber-400">
                                        {r.name.slice(0, 2)}
                                      </div>
                                    )}
                                    <span className="font-bold text-white leading-none truncate">{r.name}</span>
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSaveDuty(r.id);
                                        setIsCustomDuty(false);
                                      }}
                                      disabled={savingDuty}
                                      className="p-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-bold text-[9px] rounded cursor-pointer border-none shrink-0"
                                    >
                                      ✓
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingDutyMemberId(null);
                                        setIsCustomDuty(false);
                                      }}
                                      className="p-1 bg-white/5 hover:bg-white/10 text-white/50 text-[9px] rounded cursor-pointer border-none shrink-0"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {!isCustomDuty ? (
                                    <select
                                      value={editingDutyValue}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === 'CUSTOM') {
                                          setIsCustomDuty(true);
                                          setEditingDutyValue('');
                                        } else {
                                          setEditingDutyValue(val);
                                        }
                                      }}
                                      className="w-full bg-black border border-white/15 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-amber-500/50 cursor-pointer"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <option value="">No role</option>
                                      {presetRoles.map((role) => (
                                        <option key={role} value={role}>{role}</option>
                                      ))}
                                      <option value="CUSTOM">✍️ Custom Role...</option>
                                    </select>
                                  ) : (
                                    <div className="flex items-center gap-1 w-full">
                                      <input
                                        type="text"
                                        value={editingDutyValue}
                                        onChange={(e) => setEditingDutyValue(e.target.value)}
                                        placeholder="Custom role..."
                                        className="flex-1 bg-black border border-white/15 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-amber-500/50"
                                        onClick={(e) => e.stopPropagation()}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            handleSaveDuty(r.id);
                                            setIsCustomDuty(false);
                                          }
                                        }}
                                      />
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setIsCustomDuty(false);
                                          setEditingDutyValue('');
                                        }}
                                        className="p-1 bg-white/5 hover:bg-white/10 text-white/50 text-[9px] rounded cursor-pointer border-none shrink-0"
                                        title="Back to List"
                                      >
                                        ↩
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          }
                          
                          return (
                            <div key={r.id} className="flex items-center justify-between p-2 bg-white/[0.02] border border-white/5 rounded-lg text-xs">
                              <div className="flex items-center gap-2.5 truncate">
                                {r.avatar ? (
                                  <img src={r.avatar} alt={r.name} className="w-6.5 h-6.5 rounded-full object-cover border border-white/10" />
                                ) : (
                                  <div className="w-6.5 h-6.5 rounded-full bg-gradient-to-br from-amber-500/25 to-orange-500/25 border border-amber-500/10 flex items-center justify-center text-[8px] font-black uppercase text-amber-400">
                                    {r.name.slice(0, 2)}
                                  </div>
                                )}
                                <div className="truncate">
                                  <span className="font-bold text-white block leading-none">{r.name}</span>
                                  <div className="flex items-center gap-1.5 mt-1">
                                    <span className="text-[8.5px] text-white/35 tracking-wider uppercase font-mono">{roleStr}</span>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingDutyMemberId(r.id);
                                        setEditingDutyValue(r.role || '');
                                      }}
                                      className="text-white/20 hover:text-amber-400 transition-colors border-none bg-transparent cursor-pointer p-0 text-[10px] leading-none"
                                      title="Edit Role"
                                    >
                                      ✏️
                                    </button>
                                  </div>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => setSelectedCrewPhones(prev => prev.filter(p => p !== normalizePhoneNumber(r.phone)))}
                                className="text-white/20 hover:text-rose-400 transition-colors border-none bg-transparent cursor-pointer p-1 text-[10px] font-bold"
                              >
                                ✕
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* SMS & Email Option Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setSendSmsAlert(prev => !prev)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer select-none flex flex-col gap-1.5 ${
                      sendSmsAlert
                        ? 'bg-amber-500/[0.04] border-amber-500/20 text-white shadow-[0_0_10px_rgba(245,158,11,0.02)]'
                        : 'bg-white/[0.01] border-white/5 text-white/40 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${
                        sendSmsAlert ? 'bg-amber-500 border-amber-500 text-black' : 'border-white/20'
                      }`}>
                        {sendSmsAlert && (
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4.5"><polyline points="20 6 9 17 4 12" /></svg>
                        )}
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-wider text-amber-400">📱 SMS TEXTS</span>
                    </div>
                    <span className="text-[9.5px] text-white/35 leading-normal">Sends raw text alerts to active mobile numbers</span>
                  </div>

                  <div
                    onClick={() => setSendEmailAlert(prev => !prev)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer select-none flex flex-col gap-1.5 ${
                      sendEmailAlert
                        ? 'bg-amber-500/[0.04] border-amber-500/20 text-white shadow-[0_0_10px_rgba(245,158,11,0.02)]'
                        : 'bg-white/[0.01] border-white/5 text-white/40 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${
                        sendEmailAlert ? 'bg-amber-500 border-amber-500 text-black' : 'border-white/20'
                      }`}>
                        {sendEmailAlert && (
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4.5"><polyline points="20 6 9 17 4 12" /></svg>
                        )}
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-wider text-amber-400">✉️ EMAIL ALERTS</span>
                    </div>
                    <span className="text-[9.5px] text-white/35 leading-normal">Sends styled HTML alerts to registered emails</span>
                  </div>
                </div>

                {sendSmsAlert && (
                  <div
                    onClick={() => setCrewSendAsGroup(prev => !prev)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer select-none flex flex-col gap-1 ${
                      crewSendAsGroup
                        ? 'bg-amber-500/[0.04] border-amber-500/20 text-white shadow-[0_0_10px_rgba(245,158,11,0.02)]'
                        : 'bg-white/[0.01] border-white/5 text-white/40 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition-all ${
                        crewSendAsGroup ? 'bg-amber-500 border-amber-500 text-black' : 'border-white/20'
                      }`}>
                        {crewSendAsGroup && (
                          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4.5"><polyline points="20 6 9 17 4 12" /></svg>
                        )}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">👥 Send as Group Text (Show Recipient List)</span>
                    </div>
                    <span className="text-[8.5px] text-white/35 leading-normal">Appends a list of all checked recipients to the SMS so everyone sees who is on this group alert</span>
                  </div>
                )}

                {/* Email Subject Input */}
                {sendEmailAlert && (
                  <div className="bg-[#14141c]/40 border border-white/5 rounded-2xl p-4 space-y-4 animate-[fadeIn_0.2s_ease-out]">
                    <div>
                      <label className="text-[0.65rem] font-bold uppercase tracking-widest text-white/40 mb-2 block">Email Subject</label>
                      <input
                        type="text"
                        value={smsEmailSubject}
                        onChange={e => setSmsEmailSubject(e.target.value)}
                        placeholder="e.g. 🔔 Crew Alert - Show Update"
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-amber-500/50 transition-colors"
                      />
                    </div>
                  </div>
                )}

                {/* SMS Text Message Box */}
                <div className="bg-[#14141c]/40 border border-white/5 rounded-2xl p-4 space-y-3">
                  <div>
                    <label className="text-[0.65rem] font-bold uppercase tracking-widest text-white/40 mb-2 block">Alert Message</label>
                    <textarea
                      value={crewAlertMsg}
                      onChange={e => setCrewAlertMsg(e.target.value)}
                      placeholder="e.g. Load-in moved to 3PM. Doors at 6. See you there."
                      rows={4}
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

                  {/* Live SMS Preview */}
                  {sendSmsAlert && (
                    <div className="bg-amber-500/[0.02] border border-amber-500/10 rounded-xl p-3 text-xs space-y-2 animate-[fadeIn_0.2s_ease-out]">
                      <span className="text-[0.65rem] font-bold text-amber-400 uppercase tracking-widest block">📱 Live SMS Preview (Recipient View)</span>
                      <p className="text-white/80 font-mono text-[11px] whitespace-pre-wrap bg-black/35 p-2.5 rounded border border-white/5 leading-relaxed">
                        {`🛡️ 7th Heaven CREW ALERT:\n\n${crewAlertMsg || '(Message body empty)'}${
                          crewSendAsGroup
                            ? `\n\nGroup: ${
                                selectedCrewPhones.length > 0
                                  ? allCrewCombined.filter(c => selectedCrewPhones.includes(normalizePhoneNumber(c.phone))).map(t => t.name).join(', ')
                                  : allCrewCombined.map(t => t.name).join(', ')
                              }`
                            : ''
                        }\n\n— Band Management`}
                      </p>
                    </div>
                  )}

                  {/* Confirm / Send Button */}
                  <div className="space-y-3 pt-2">
                    {crewAlertResult && (
                      <p className={`text-xs font-bold ${crewAlertResult.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {crewAlertResult.success
                          ? `✓ Sent to ${crewAlertResult.sent} crew member${crewAlertResult.sent !== 1 ? 's' : ''}${crewAlertResult.dev ? ' (dev mode)' : ''}`
                          : `✕ ${crewAlertResult.error}`}
                        {crewAlertResult.failed > 0 && <span className="text-rose-400 ml-2">({crewAlertResult.failed} failed)</span>}
                      </p>
                    )}
                    <button
                      disabled={crewAlertSending || (sendSmsAlert && !crewAlertMsg.trim()) || (sendEmailAlert && !smsEmailSubject.trim()) || (!sendSmsAlert && !sendEmailAlert)}
                      onClick={async () => {
                        const sendCount = selectedCrewPhones.length > 0 ? selectedCrewPhones.length : recipients.length;
                        const isAll = selectedCrewPhones.length === 0;
                        if (!confirm(isAll 
                          ? `No recipients selected. Send this broadcast to ALL ${sendCount} crew members?`
                          : `Send this broadcast to the ${sendCount} selected recipients?`
                        )) return;

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
                              text: `📢 Sent Crew Broadcast (SMS: ${sendSmsAlert ? 'Yes' : 'No'}, Email: ${sendEmailAlert ? 'Yes' : 'No'}): "${data.sentCount || sendCount} recipients notified"`,
                              time: 'Just now',
                              color: 'bg-amber-500',
                              details: {
                                type: 'broadcast',
                                smsText: crewAlertMsg,
                                emailSubject: smsEmailSubject || undefined
                              }
                            }, ...prev]);
                          } else {
                            setAuditLog(prev => [{
                              id: crypto.randomUUID(),
                              text: `⚠️ Failed to send Crew Broadcast: ${data.error || 'Unknown error'}`,
                              time: 'Just now',
                              color: 'bg-red-500'
                            }, ...prev]);
                          }
                        } catch (err: any) {
                          setCrewAlertResult({ error: err.message });
                        }
                        setCrewAlertSending(false);
                      }}
                      className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-30 disabled:cursor-not-allowed text-black font-bold text-xs uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.2)] cursor-pointer border-none"
                    >
                      {crewAlertSending ? (
                        <><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Sending Broadcast...</>
                      ) : (
                        <>📢 Send Broadcast</>
                      )}
                    </button>
                  </div>
                </div>

                {/* Email Dispatch Preview */}
                {sendEmailAlert && (
                  <div className="bg-[#14141c]/40 border border-white/5 rounded-2xl p-4 space-y-3 animate-[fadeIn_0.2s_ease-out]">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <span className="text-[0.65rem] font-bold uppercase tracking-widest text-white/40">📧 Email Dispatch Preview</span>
                      <span className="text-[9px] bg-purple-500/20 text-purple-400 border border-purple-500/10 px-1.5 py-0.5 rounded font-bold">Admin Dispatch Copy</span>
                    </div>
                    
                    <div className="border border-white/10 rounded-xl bg-black/50 overflow-hidden text-left font-sans text-white text-[12px] max-h-[300px] overflow-y-auto custom-scrollbar">
                      <div className="bg-white/5 border-b border-white/5 p-3 space-y-1 text-[10px] text-white/40">
                        <p><strong className="text-white/60 font-semibold">Subject:</strong> <span className="text-white/80">{smsEmailSubject || '(No subject)'}</span></p>
                        <p><strong className="text-white/60 font-semibold">To:</strong> <span className="text-white/80">Admins & Dispatch List</span></p>
                      </div>
                      
                      <div className="p-5 space-y-4">
                        <h4 className="text-[12px] font-black text-white uppercase tracking-wider border-b border-purple-500 pb-2">🛡️ Crew SMS Alert Dispatched</h4>
                        <p className="text-white/60 text-[10px] leading-relaxed">
                          An administrator has dispatched a new SMS alert to the crew members. Here is the full dispatch log:
                        </p>
                        
                        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 space-y-1.5 text-[10px]">
                          <span className="text-[9px] uppercase tracking-wider text-white/30 font-bold block mb-1">📅 Show / Event Details</span>
                          <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-white/40">Date</span><span className="text-white font-semibold">{smsSelectedShowDate || 'N/A'}</span></div>
                          {(() => {
                            const show = smsSelectedShowDate ? tourDates.find((s: any) => s.date === smsSelectedShowDate) : null;
                            return (
                              <>
                                <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-white/40">Time</span><span className="text-white font-semibold">{show ? (show.time || '8:00pm') : 'N/A'}</span></div>
                                <div className="flex justify-between"><span className="text-white/40">Place / Venue</span><span className="text-white font-semibold">{show ? (show.venue || show.venue_name) : 'N/A'}</span></div>
                              </>
                            );
                          })()}
                        </div>
                        
                        <div className="bg-purple-500/5 border border-purple-500/10 rounded-lg p-3 space-y-1">
                          <span className="text-[9px] uppercase tracking-wider text-purple-400 font-bold block mb-1">📝 SMS Message Text</span>
                          <p className="text-white/70 italic text-[10px] leading-relaxed">
                            "{crewAlertMsg || '(No message text)'}"
                          </p>
                        </div>
                        
                        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 space-y-2">
                          {(() => {
                            const checkedCrew = allCrewCombined.filter(c => selectedCrewPhones.includes(normalizePhoneNumber(c.phone)));
                            return (
                              <>
                                <span className="text-[9px] uppercase tracking-wider text-white/30 font-bold block">👥 SMS Recipients ({checkedCrew.length})</span>
                                {checkedCrew.length === 0 ? (
                                  <p className="text-white/30 italic text-[10px]">No recipients checked.</p>
                                ) : (
                                  <div className="divide-y divide-white/5">
                                    {checkedCrew.map(c => {
                                      const dayShifts = schedulesByDateAndCrew[smsSelectedShowDate || '']?.[c.id] || [];
                                      const roleStr = dayShifts.length > 0 ? Array.from(new Set(dayShifts.map(s => s.role))).join(', ') : (c.role ? c.role.toUpperCase() : 'CREW');
                                      return (
                                        <div key={c.id} className="flex justify-between items-center py-1.5 text-[10px]">
                                          <div>
                                            <span className="text-white font-semibold block">{c.name}</span>
                                            <span className="text-white/40 text-[9px]">{formatPhoneForDisplay(c.phone)}</span>
                                          </div>
                                          <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[8px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">{roleStr}</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Automated Crew Reminders Sub-section */}
            <div className="border-t border-white/5 pt-6 mt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-white">Automated Shift Reminders</h4>
                  <p className="text-[0.65rem] text-white/40 mt-0.5">Send text reminders to crew members automatically before their scheduled shifts.</p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    const newVal = !crewAutoReminders;
                    setCrewAutoReminders(newVal);
                    try {
                      await fetch('/api/admin/settings', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ key: 'crew_auto_reminders', value: newVal ? 'on' : 'off' }),
                      });
                    } catch (err) {}
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
                            } catch (err) {}
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
                    <label className="text-[0.6rem] font-bold uppercase tracking-widest text-white/40 block mb-1.5">Message Template Preview</label>
                    <div className="bg-black/30 border border-white/5 rounded-lg p-3 text-[11px] text-white/70 font-mono leading-relaxed select-text">
                      Hi [Crew Name], this is an automated reminder that you are scheduled for [Role] at [Show/Location] starting at [Shift Time]. Please reply if you have conflicts.
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Preset Roles Manager Modal */}
            {isManageRolesModalOpen && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[9999] animate-[fadeIn_0.2s_ease-out] p-4">
                <div 
                  className="bg-[#0c0c0e] border border-white/10 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl relative animate-[scaleIn_0.2s_ease-out]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h3 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
                      ⚙️ Manage Preset Roles
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsManageRolesModalOpen(false)}
                      className="text-white/40 hover:text-white transition-colors border-none bg-transparent cursor-pointer text-xs"
                    >
                      ✕ Close
                    </button>
                  </div>

                  {/* Add New Preset Role */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.6rem] font-bold uppercase tracking-widest text-white/40">Add New Preset Role</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newPresetRoleInput}
                        onChange={(e) => setNewPresetRoleInput(e.target.value)}
                        placeholder="e.g. LIGHTING DESIGNER"
                        className="flex-1 bg-black border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
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
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer border-none"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Preset Roles List */}
                  <div className="space-y-1.5">
                    <label className="text-[0.6rem] font-bold uppercase tracking-widest text-white/40 block">Current Preset Roles ({presetRoles.length})</label>
                    <div className="max-h-[220px] overflow-y-auto custom-scrollbar border border-white/10 rounded-xl bg-black/40 p-2 space-y-1.5">
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
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
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
        </div>
      </section>
    );
  };

  const renderBandSms = () => {
    const allBandCombined = getBandRecipientsCombined();

    return (
      <section id="section-bandsms" className="bg-[#0f0f13] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        <div onClick={() => toggleSection('bandsms')} className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20 cursor-pointer select-none hover:bg-black/30 transition-colors">
          <div className="flex items-center gap-2">
            <div className="drag-handle cursor-grab active:cursor-grabbing p-1.5 hover:bg-white/5 rounded text-white/20 hover:text-white/50 transition-all shrink-0 mr-1" title="Drag to reorder section" onClick={(e) => e.stopPropagation()}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>
            </div>
            <h3 className="cursor-pointer text-lg font-bold tracking-tight flex items-center gap-2 text-white">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              💬 Band Member SMS Text
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <div className={"w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center transition-transform duration-300 " + (isSectionOpen('bandsms') ? 'rotate-0' : '-rotate-90')}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/40"><path d="M2 4l4 4 4-4" /></svg>
            </div>
          </div>
        </div>

        {renderInfoBanner('bandsms', 'Band Member SMS Text', 'Broadcast instant SMS alerts or show notices directly to the band members.')}

        <div style={{ display: isSectionOpen('bandsms') ? undefined : 'none' }}>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Band List (Choose Recipients) */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[0.65rem] font-bold uppercase tracking-widest text-white/40 block">Choose Recipients</label>
                  <span className="text-[0.6rem] text-white/30 font-mono">
                    Showing {allBandCombined.length} Band Member{allBandCombined.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="bg-[#14141c]/40 border border-white/5 rounded-2xl p-4 max-h-[460px] overflow-y-auto custom-scrollbar">
                  <div className="flex flex-col gap-1.5">
                    {allBandCombined.map((r) => {
                      const isChecked = selectedBandPhones.includes(normalizePhoneNumber(r.phone));
                      return (
                        <div
                          key={r.id}
                          className={`flex items-center justify-between gap-2 px-2.5 rounded-lg border transition-all duration-300 relative h-[32px] ${
                            isChecked
                              ? 'bg-amber-500/[0.06] border-amber-500/30 text-white shadow-[0_0_10px_rgba(245,158,11,0.03)]'
                              : 'bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]'
                          }`}
                          title={`📞 ${r.phone || 'No phone'} \n✉️ ${r.email || 'No email'}`}
                        >
                          <div 
                            onClick={() => {
                              if (r.phone) {
                                const norm = normalizePhoneNumber(r.phone);
                                setSelectedBandPhones(prev => 
                                  prev.includes(norm) 
                                    ? prev.filter(p => p !== norm) 
                                    : [...prev, norm]
                                );
                              }
                            }}
                            className={`flex items-center gap-2.5 flex-1 min-w-0 select-none h-full ${!r.phone ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            {/* Styled Checkbox */}
                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all shrink-0 ${
                              !r.phone 
                                ? 'border-white/5 bg-white/5 opacity-25' 
                                : isChecked 
                                  ? 'bg-amber-500 border-amber-500 text-black' 
                                  : 'border-white/20 bg-black/45 hover:border-white/40'
                            }`}>
                              {isChecked && r.phone && (
                                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                              )}
                            </div>

                            {/* Avatar */}
                            {r.avatar ? (
                              <img src={r.avatar} alt={r.name} className={`w-5.5 h-5.5 rounded-full object-cover shrink-0 border border-white/10 ${!r.phone ? 'opacity-40' : ''}`} />
                            ) : (
                              <div className={`w-5.5 h-5.5 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/10 flex items-center justify-center text-[7.5px] font-black uppercase text-amber-400 shrink-0 ${!r.phone ? 'opacity-40' : ''}`}>
                                {r.name.slice(0, 2)}
                              </div>
                            )}

                            {/* Name */}
                            <span className={`text-xs font-bold truncate leading-none ${!r.phone ? 'text-white/40' : 'text-white'}`}>{r.name}</span>
                          </div>

                          {/* Role badge */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="inline-block text-[8.5px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded leading-none shrink-0">
                              {r.role}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Alert Broadcast Form */}
              <div className="space-y-5">
                <div className="bg-[#14141c]/40 border border-white/5 rounded-2xl p-4 space-y-4">
                  <div>
                    <label className="text-[0.65rem] font-bold text-white/40 uppercase tracking-wider block mb-2">Select Upcoming Show</label>
                    <div className="relative">
                      <select
                        value={bandSmsSelectedShowDate}
                        onChange={(e) => selectShowForBandSms(e.target.value)}
                        className="w-full appearance-none pr-8 pl-3 py-2 border border-white/10 bg-black/40 hover:bg-white/5 text-xs font-bold text-white/70 hover:text-white rounded-lg shadow-sm transition-colors cursor-pointer outline-none border-solid"
                      >
                        <option value="">-- Choose target show --</option>
                        {tourDates.map((s: any) => (
                          <option key={s._id || s.date} value={s.date}>
                            {s.date} - {s.venue || s.venue_name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                      </div>
                    </div>
                  </div>

                  {bandSmsSelectedShowDate && (
                    <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/25 rounded-lg px-3 py-2 text-[10px] text-amber-400 animate-[fadeIn_0.2s_ease-out]">
                      <div className="flex items-center gap-1.5">
                        <span>📢</span>
                        <span>Targeting show: <strong>{tourDates.find((s: any) => s.date === bandSmsSelectedShowDate)?.venue || 'Selected show'}</strong></span>
                      </div>
                      <button
                        type="button"
                        onClick={() => selectShowForBandSms('')}
                        className="text-amber-500 hover:text-amber-300 font-bold border-none bg-transparent cursor-pointer text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {/* SMS / Email Option Toggle Cards */}
                  <div className="grid grid-cols-2 gap-3">
                    <div
                      onClick={() => setSendBandSmsAlert(prev => !prev)}
                      className={`flex flex-col gap-1.5 p-3 rounded-xl border cursor-pointer select-none transition-all duration-300 ${
                        sendBandSmsAlert
                          ? 'bg-amber-500/[0.04] border-amber-500/35 shadow-[0_0_15px_rgba(245,158,11,0.03)]'
                          : 'bg-black/30 border-white/5 hover:bg-white/[0.02] hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">SMS Texts</span>
                        <div className={`w-3.5 h-3.5 rounded-md border flex items-center justify-center transition-all ${
                          sendBandSmsAlert ? 'bg-amber-500 border-amber-500 text-black' : 'border-white/20 bg-black/45'
                        }`}>
                          {sendBandSmsAlert && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                        </div>
                      </div>
                      <span className="text-[8px] text-white/40 leading-normal">Send Twilio text message to checked band members.</span>
                    </div>

                    <div
                      onClick={() => setSendBandEmailAlert(prev => !prev)}
                      className={`flex flex-col gap-1.5 p-3 rounded-xl border cursor-pointer select-none transition-all duration-300 ${
                        sendBandEmailAlert
                          ? 'bg-amber-500/[0.04] border-amber-500/35 shadow-[0_0_15px_rgba(245,158,11,0.03)]'
                          : 'bg-black/30 border-white/5 hover:bg-white/[0.02] hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">Email Alerts</span>
                        <div className={`w-3.5 h-3.5 rounded-md border flex items-center justify-center transition-all ${
                          sendBandEmailAlert ? 'bg-amber-500 border-amber-500 text-black' : 'border-white/20 bg-black/45'
                        }`}>
                          {sendBandEmailAlert && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                        </div>
                      </div>
                      <span className="text-[8px] text-white/40 leading-normal">Send HTML email alert update.</span>
                    </div>
                  </div>

                  {/* Email Subject Line (Conditional) */}
                  {sendBandEmailAlert && (
                    <div className="flex flex-col gap-1 animate-[fadeIn_0.2s_ease-out]">
                      <label className="text-[0.6rem] font-bold uppercase tracking-widest text-white/40">Email Subject Line</label>
                      <input
                        type="text"
                        value={bandEmailSubject}
                        onChange={(e) => setBandEmailSubject(e.target.value)}
                        placeholder="e.g. Band Schedule Update"
                        className="bg-black border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500/50"
                      />
                    </div>
                  )}

                  {/* Message Form */}
                  <div className="space-y-2">
                    <label className="text-[0.65rem] font-bold uppercase tracking-widest text-white/40 block">Broadcast message</label>
                    <textarea
                      value={bandAlertMsg}
                      onChange={(e) => setBandAlertMsg(e.target.value)}
                      placeholder="Write message to send..."
                      rows={5}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-amber-500/50 resize-none leading-relaxed"
                    />
                  </div>

                  {/* Feedback Logs */}
                  {bandAlertResult && (
                    <div className={`p-3 border rounded-xl text-xs flex flex-col gap-1 ${
                      bandAlertResult.success 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                        : 'bg-red-500/10 border-red-500/20 text-red-400'
                    }`}>
                      <span className="font-bold flex items-center gap-1">
                        {bandAlertResult.success ? '✓ Dispatch Successful' : '⚠️ Dispatch Failed'}
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
                      className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-30 disabled:cursor-not-allowed text-black font-bold text-xs uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.2)] cursor-pointer border-none"
                    >
                      {bandAlertSending ? (
                        <><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Sending Broadcast...</>
                      ) : (
                        <>📢 Send Band Broadcast</>
                      )}
                    </button>
                  </div>
                </div>

                {/* Visual Recipients List */}
                {(() => {
                  const checkedRecipients = allBandCombined.filter(c => selectedBandPhones.includes(normalizePhoneNumber(c.phone)));
                  if (checkedRecipients.length === 0) return null;
                  return (
                    <div className="space-y-2">
                      <span className="text-[0.65rem] font-bold text-white/40 uppercase tracking-wider block">
                        Recipients ({checkedRecipients.length})
                      </span>
                      <div className="flex flex-col gap-2 bg-black/20 border border-white/5 rounded-xl p-3 max-h-[220px] overflow-y-auto custom-scrollbar">
                        {checkedRecipients.map(r => (
                          <div key={r.id} className="flex items-center justify-between p-2 bg-white/[0.02] border border-white/5 rounded-lg text-xs">
                            <div className="flex items-center gap-2.5 truncate">
                              {r.avatar ? (
                                <img src={r.avatar} alt={r.name} className="w-6.5 h-6.5 rounded-full object-cover border border-white/10" />
                              ) : (
                                <div className="w-6.5 h-6.5 rounded-full bg-gradient-to-br from-amber-500/25 to-orange-500/25 border border-amber-500/10 flex items-center justify-center text-[8px] font-black uppercase text-amber-400">
                                  {r.name.slice(0, 2)}
                                </div>
                              )}
                              <div className="truncate">
                                <span className="font-bold text-white block leading-none">{r.name}</span>
                                <span className="text-[8.5px] text-white/35 tracking-wider block mt-1 uppercase truncate font-mono">{r.role}</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setSelectedBandPhones(prev => prev.filter(p => p !== normalizePhoneNumber(r.phone)))}
                              className="text-white/20 hover:text-rose-400 transition-colors border-none bg-transparent cursor-pointer p-1 text-[10px] font-bold"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Email Dispatch Preview */}
                {sendBandEmailAlert && (
                  <div className="bg-[#14141c]/40 border border-white/5 rounded-2xl p-4 space-y-3 animate-[fadeIn_0.2s_ease-out]">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <span className="text-[0.65rem] font-bold uppercase tracking-widest text-white/40">📧 Email Dispatch Preview</span>
                      <span className="text-[9px] bg-purple-500/20 text-purple-400 border border-purple-500/10 px-1.5 py-0.5 rounded font-bold">Band Dispatch Copy</span>
                    </div>
                    
                    <div className="border border-white/10 rounded-xl bg-black/50 overflow-hidden text-left font-sans text-white text-[12px] max-h-[300px] overflow-y-auto custom-scrollbar">
                      <div className="bg-white/5 border-b border-white/5 p-3 space-y-1 text-[10px] text-white/40">
                        <p><strong className="text-white/60 font-semibold">Subject:</strong> <span className="text-white/80">{bandEmailSubject || '(No subject)'}</span></p>
                        <p><strong className="text-white/60 font-semibold">To:</strong> <span className="text-white/80">Band Members & Dispatch List</span></p>
                      </div>
                      
                      <div className="p-5 space-y-4">
                        <h4 className="text-[12px] font-black text-white uppercase tracking-wider border-b border-purple-500 pb-2">💬 Band Member SMS Dispatched</h4>
                        <p className="text-white/60 text-[10px] leading-relaxed">
                          An administrator has dispatched a new SMS alert to the band members. Here is the full dispatch log:
                        </p>
                        
                        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 space-y-1.5 text-[10px]">
                          <span className="text-[9px] uppercase tracking-wider text-white/30 font-bold block mb-1">📅 Show / Event Details</span>
                          <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-white/40">Date</span><span className="text-white font-semibold">{bandSmsSelectedShowDate || 'N/A'}</span></div>
                          {(() => {
                            const show = bandSmsSelectedShowDate ? tourDates.find((s: any) => s.date === bandSmsSelectedShowDate) : null;
                            return (
                              <>
                                <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-white/40">Time</span><span className="text-white font-semibold">{show ? (show.time || '8:00pm') : 'N/A'}</span></div>
                                <div className="flex justify-between"><span className="text-white/40">Place / Venue</span><span className="text-white font-semibold">{show ? (show.venue || show.venue_name) : 'N/A'}</span></div>
                              </>
                            );
                          })()}
                        </div>
                        
                        <div className="bg-purple-500/5 border border-purple-500/10 rounded-lg p-3 space-y-1">
                          <span className="text-[9px] uppercase tracking-wider text-purple-400 font-bold block mb-1">📝 SMS Message Text</span>
                          <p className="text-white/70 italic text-[10px] leading-relaxed">
                            "{bandAlertMsg || '(No message text)'}"
                          </p>
                        </div>
                        
                        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 space-y-2">
                          {(() => {
                            const checkedBand = allBandCombined.filter(c => selectedBandPhones.includes(normalizePhoneNumber(c.phone)));
                            return (
                              <>
                                <span className="text-[9px] uppercase tracking-wider text-white/30 font-bold block">👥 SMS Recipients ({checkedBand.length})</span>
                                {checkedBand.length === 0 ? (
                                  <p className="text-white/30 italic text-[10px]">No recipients checked.</p>
                                ) : (
                                  <div className="divide-y divide-white/5">
                                    {checkedBand.map(c => (
                                      <div key={c.id} className="flex justify-between items-center py-1.5 text-[10px]">
                                        <div>
                                          <span className="text-white font-semibold block">{c.name}</span>
                                          <span className="text-white/40 text-[9px]">{formatPhoneForDisplay(c.phone)}</span>
                                        </div>
                                        <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[8px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">{c.role}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </div>
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
  };

  const renderNewsletter = () => (
    <section className="bg-[#0f0f13] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
              <div onClick={() => toggleSection('newsletter')} className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20 cursor-pointer select-none hover:bg-black/30 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="drag-handle cursor-grab active:cursor-grabbing p-1.5 hover:bg-white/5 rounded text-white/20 hover:text-white/50 transition-all shrink-0 mr-1" title="Drag to reorder section" onClick={(e) => e.stopPropagation()}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>
                  </div>
                  <h3 className="cursor-pointer text-lg font-bold tracking-tight flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  Newsletter Blast
                  {renderInfoToggle('newsletter')}
                </h3>
                </div>
                <div className="flex items-center gap-3">
                  
                  <div className={"w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center transition-transform duration-300 " + (isSectionOpen('newsletter') ? 'rotate-0' : '-rotate-90')}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40"><path d="M2 4l4 4 4-4" /></svg>
                  </div>
                </div>
              </div>
              {renderInfoBanner('newsletter', 'Newsletter Blast', 'Compose and broadcast marketing campaigns, newsletter updates, and band announcements to all email subscribers.')}
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

  const renderEmailFlow = () => (
    <section className="bg-[#0f0f13] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
      <div onClick={() => toggleSection('emailflow')} className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20 cursor-pointer select-none hover:bg-black/30 transition-colors">
        <div className="flex items-center gap-2">
          <div className="drag-handle cursor-grab active:cursor-grabbing p-1.5 hover:bg-white/5 rounded text-white/20 hover:text-white/50 transition-all shrink-0 mr-1" title="Drag to reorder section" onClick={(e) => e.stopPropagation()}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>
          </div>
          <h3 className="cursor-pointer text-lg font-bold tracking-tight flex items-center gap-2 shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            Email Template Flows
            {renderInfoToggle('emailflow')}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/sitemap/flowchart" className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/40 text-purple-200 border border-purple-500/30 text-[0.6rem] font-bold uppercase tracking-widest rounded transition-all flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            Fullscreen Flowchart ↗
          </Link>
          <div className={"w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center transition-transform duration-300 " + (isSectionOpen('emailflow') ? 'rotate-0' : '-rotate-90')}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40"><path d="M2 4l4 4 4-4" /></svg>
          </div>
        </div>
      </div>
      {renderInfoBanner('emailflow', 'Email Template Flows', 'Interactive catalog of the 25 email templates dispatched by actions taken on the Admin Dashboard.')}
      
      <div style={{ display: isSectionOpen('emailflow') ? undefined : 'none' }}>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {/* Booking Flows */}
            <div className="bg-black/30 border border-emerald-500/10 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase tracking-wider mb-3">
                  <span>📅</span> Booking System
                </div>
                <div className="space-y-3">
                  {[
                    { name: 'Booking Confirmation', trigger: 'Sent to planner when they submit booking request form.' },
                    { name: 'Booking Admin Alert', trigger: 'Sent to 7th Heaven admins to review new booking details.' },
                    { name: 'Booking Status Update', trigger: 'Sent to planner when admin approves/declines booking.' },
                    { name: 'Booking Cancelled', trigger: 'Sent when planner/admin cancels booking reservation.' }
                  ].map((email, idx) => (
                    <div key={idx} className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-2.5 hover:border-emerald-500/30 transition-all">
                      <h4 className="text-[11px] font-extrabold text-emerald-200">{email.name}</h4>
                      <p className="text-[9px] text-white/40 mt-1 leading-normal">{email.trigger}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Crew Flows */}
            <div className="bg-black/30 border border-amber-500/10 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-amber-400 font-black text-xs uppercase tracking-wider mb-3">
                  <span>🛡️</span> Crew Management
                </div>
                <div className="space-y-3">
                  {[
                    { name: 'Welcome — Crew', trigger: 'Sent when admin registers new crew account with temporary password.' },
                    { name: 'Schedule Change Alert', trigger: 'Sent when admin adds, updates, or deletes crew schedule shifts.' },
                    { name: 'Crew Alert (Email + SMS)', trigger: 'Sent when admin broadcasts text broadcast via Crew SMS panel.' },
                    { name: 'Crew SMS Dispatched', trigger: 'Sent to admin showing confirmation and recipient table.' },
                    { name: 'Crew Work Hours Summary', trigger: 'Sent automatically when crew checks out of a completed shift.' }
                  ].map((email, idx) => (
                    <div key={idx} className="bg-amber-500/5 border border-amber-500/10 rounded-lg p-2.5 hover:border-amber-500/30 transition-all">
                      <h4 className="text-[11px] font-extrabold text-amber-200">{email.name}</h4>
                      <p className="text-[9px] text-white/40 mt-1 leading-normal">{email.trigger}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Fan Flows */}
            <div className="bg-black/30 border border-pink-500/10 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-pink-400 font-black text-xs uppercase tracking-wider mb-3">
                  <span>🎟️</span> Fan Engagement
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
                  ].map((email, idx) => (
                    <div key={idx} className="bg-pink-500/5 border border-pink-500/10 rounded-lg p-2.5 hover:border-pink-500/30 transition-all">
                      <h4 className="text-[11px] font-extrabold text-pink-200">{email.name}</h4>
                      <p className="text-[9px] text-white/40 mt-1 leading-normal">{email.trigger}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Cruise Flows */}
            <div className="bg-black/30 border border-cyan-500/10 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-cyan-400 font-black text-xs uppercase tracking-wider mb-3">
                  <span>🚢</span> Cruise System
                </div>
                <div className="space-y-3">
                  {[
                    { name: 'Cruise Signup Confirmed', trigger: 'Sent to fan when signing up to cruise newsletter waitlist.' },
                    { name: 'Cruise Community Welcome', trigger: 'Sent when cruise admin approves user reservation.' },
                    { name: 'Cruise Cancellation', trigger: 'Sent when reservation is cancelled by user/admin.' },
                    { name: 'Cruise Community Blast', trigger: 'Sent when cruise admin broadcasts to cruise page chat group.' }
                  ].map((email, idx) => (
                    <div key={idx} className="bg-cyan-500/5 border border-cyan-500/10 rounded-lg p-2.5 hover:border-cyan-500/30 transition-all">
                      <h4 className="text-[11px] font-extrabold text-cyan-200">{email.name}</h4>
                      <p className="text-[9px] text-white/40 mt-1 leading-normal">{email.trigger}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Newsletter & Other */}
            <div className="bg-black/30 border border-purple-500/10 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-purple-400 font-black text-xs uppercase tracking-wider mb-3">
                  <span>📰</span> Newsletter & Account
                </div>
                <div className="space-y-3">
                  {[
                    { name: 'Newsletter Blast', trigger: 'Sent when admin broadcasts a new update block via Newsletter panel.' },
                    { name: 'Flash Merch — Table Pickup', trigger: 'Sent to buyer notifying them to collect merch at table.' },
                    { name: 'Flash Merch — Shipping', trigger: 'Sent when merch has been shipped to customer address.' },
                    { name: 'New Account Alert — Admin', trigger: 'Sent to super-admin when new admin logs in first time.' },
                    { name: 'Welcome — Planner', trigger: 'Sent to corporate planner on registration.' },
                    { name: 'Welcome — Admin', trigger: 'Sent when new system admin account created.' }
                  ].map((email, idx) => (
                    <div key={idx} className="bg-purple-500/5 border border-purple-500/10 rounded-lg p-2.5 hover:border-purple-500/30 transition-all">
                      <h4 className="text-[11px] font-extrabold text-purple-200">{email.name}</h4>
                      <p className="text-[9px] text-white/40 mt-1 leading-normal">{email.trigger}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );

  const renderRegistry = () => (
    <section className="bg-[#0f0f13] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
              <div onClick={() => toggleSection('registry')} className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20 cursor-pointer select-none hover:bg-black/30 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="drag-handle cursor-grab active:cursor-grabbing p-1.5 hover:bg-white/5 rounded text-white/20 hover:text-white/50 transition-all shrink-0 mr-1" title="Drag to reorder section" onClick={(e) => e.stopPropagation()}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>
                  </div>
                  <h3 className="cursor-pointer text-lg font-bold tracking-tight flex items-center gap-2 shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                  Community Registry
                  {renderInfoToggle('registry')}
                </h3>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex bg-black rounded p-1 border border-white/10 overflow-x-auto shrink-0 w-full sm:w-auto" onClick={(e) => e.stopPropagation()}>
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
                <div className="flex items-center gap-2">
                  <div className="drag-handle cursor-grab active:cursor-grabbing p-1.5 hover:bg-white/5 rounded text-white/20 hover:text-white/50 transition-all shrink-0 mr-1" title="Drag to reorder section" onClick={(e) => e.stopPropagation()}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>
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
              </div>
              {renderInfoBanner('crewcreation', 'Create Crew Account', 'Create and register new crew members in the system, set contact information, and provision login credentials.')}
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
    if (!newAdminName.trim() || !newAdminEmail.trim() || !newAdminUsername.trim()) return;
    setAdminCreateLoading(true);
    setAdminCreateError('');
    setCreatedAdmin(null);
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
    setAdminCreateLoading(false);
  };

  const renderAdminCreation = () => (
    <section className="bg-[#0f0f13] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
      <div onClick={() => toggleSection('admincreation')} className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20 cursor-pointer select-none hover:bg-black/30 transition-colors">
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <div className="drag-handle cursor-grab active:cursor-grabbing p-1.5 hover:bg-white/5 rounded text-white/20 hover:text-white/50 transition-all shrink-0 mr-1" title="Drag to reorder section">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>
          </div>
          <h3 onClick={() => toggleSection('admincreation')} className="cursor-pointer text-lg font-bold tracking-tight text-white flex items-center gap-2">
            Create Admin Account
            {renderInfoToggle('admincreation')}
          </h3>
        </div>
        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
          <div className={"w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center transition-transform duration-300 " + (isSectionOpen('admincreation') ? 'rotate-0' : '-rotate-90')}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40"><path d="M2 4l4 4 4-4" /></svg>
          </div>
        </div>
      </div>
      {renderInfoBanner('admincreation', 'Create Admin Account', 'Register new band administrator or planner accounts with full database access and management permissions.')}
      <div style={{ display: isSectionOpen('admincreation') ? undefined : 'none' }}>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
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
            <div>
              <label className="text-[0.6rem] uppercase tracking-[0.15em] text-white/40 mb-2 block font-bold">Username</label>
              <input
                type="text"
                placeholder="e.g. mikeys"
                value={newAdminUsername}
                onChange={e => setNewAdminUsername(e.target.value)}
                className="w-full px-4 py-3 bg-black/40 border border-white/10 text-sm text-white placeholder-white/20 outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all rounded-lg"
              />
            </div>
            <button
              onClick={createAdmin}
              disabled={!newAdminName.trim() || !newAdminEmail.trim() || !newAdminUsername.trim() || adminCreateLoading}
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



  const renderBulkInvites = () => (
    <section className="bg-[#0f0f13] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
      <div onClick={() => toggleSection('bulkinvites')} className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20 cursor-pointer select-none hover:bg-black/30 transition-colors">
        <div className="flex items-center gap-2">
          <div className="drag-handle cursor-grab active:cursor-grabbing p-1.5 hover:bg-white/5 rounded text-white/20 hover:text-white/50 transition-all shrink-0 mr-1" title="Drag to reorder section" onClick={(e) => e.stopPropagation()}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>
          </div>
          <h3 className="text-lg font-bold tracking-tight text-white flex items-center gap-2 cursor-pointer">
            ✉️ Bulk Invites
            {renderInfoToggle('bulkinvites')}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <div className={"w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center transition-transform duration-300 " + (isSectionOpen('bulkinvites') ? 'rotate-0' : '-rotate-90')}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40"><path d="M2 4l4 4 4-4" /></svg>
          </div>
        </div>
      </div>
      {renderInfoBanner('bulkinvites', 'Bulk Invites', 'Upload CSV lists of emails or phone numbers to bulk-invite members to the crew directory.')}
      <div style={{ display: isSectionOpen('bulkinvites') ? undefined : 'none' }}>
        <div className="p-6">
          <BulkInvitePanel />
        </div>
      </div>
    </section>
  );

  const renderCruiseSignups = () => {
    const signups = cruiseStats.recentSignups || [];
    const allEmails = signups.filter((s: any) => s.email).map((s: any) => s.email);
    const allSelected = allEmails.length > 0 && allEmails.every((e: string) => cruiseSelectedEmails.includes(e));

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
        const data = await res.json();
        if (data && !data.error) setCruiseStats(data);
      } catch {}
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
        const data = await res.json();
        if (data && !data.error) setCruiseStats(data);
      } catch {}
    };

    const sendCruiseEmail = async () => {
      if (!cruiseEmailSubject.trim() || !cruiseEmailBody.trim()) return;
      if (cruiseSelectedEmails.length === 0) { alert('Select at least one passenger.'); return; }
      if (!confirm(`Send this email to ${cruiseSelectedEmails.length} cruise passenger${cruiseSelectedEmails.length !== 1 ? 's' : ''}?`)) return;
      setCruiseEmailSending(true);
      setCruiseEmailResult(null);
      try {
        const res = await fetch('/api/admin/cruise-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subject: cruiseEmailSubject, body: cruiseEmailBody, recipients: cruiseSelectedEmails }),
        });
        const data = await res.json();
        setCruiseEmailResult(data);
        if (data.success) { setCruiseEmailSubject(''); setCruiseEmailBody(''); }
      } catch (err: any) {
        setCruiseEmailResult({ error: err.message });
      }
      setCruiseEmailSending(false);
    };

    return (
    <section className="bg-[#0f0f13] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
      <div onClick={() => toggleSection('cruisesignups')} className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20 cursor-pointer select-none hover:bg-black/30 transition-colors">
        <div className="flex items-center gap-2">
          <div className="drag-handle cursor-grab active:cursor-grabbing p-1.5 hover:bg-white/5 rounded text-white/20 hover:text-white/50 transition-all shrink-0 mr-1" title="Drag to reorder section" onClick={(e) => e.stopPropagation()}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>
          </div>
          <h3 className="text-lg font-bold tracking-tight text-white flex items-center gap-2 cursor-pointer">
            🚢 Cruise Signups
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
      </div>
      {renderInfoBanner('cruisesignups', 'Cruise Signups', 'View and manage all cruise registrations. Toggle deposit/payment status, check passengers off, select recipients and send emails.')}
      <div style={{ display: isSectionOpen('cruisesignups') ? undefined : 'none' }}>
        <div className="p-6">
          {/* Summary stats bar */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            <div className="bg-black/30 p-3 rounded-xl border border-white/5 text-center">
              <p className="text-xl font-black text-cyan-400">{signups.length}</p>
              <p className="text-[0.5rem] font-bold text-white/30 uppercase tracking-widest mt-0.5">Bookings</p>
            </div>
            <div className="bg-black/30 p-3 rounded-xl border border-white/5 text-center">
              <p className="text-xl font-black text-white">{cruiseStats.total}</p>
              <p className="text-[0.5rem] font-bold text-white/30 uppercase tracking-widest mt-0.5">Total Pax</p>
            </div>
            <div className="bg-black/30 p-3 rounded-xl border border-white/5 text-center">
              <p className="text-xl font-black text-emerald-400">{signups.filter((s: any) => s.depositPaid).length}</p>
              <p className="text-[0.5rem] font-bold text-white/30 uppercase tracking-widest mt-0.5">Deposits</p>
            </div>
            <div className="bg-black/30 p-3 rounded-xl border border-white/5 text-center">
              <p className="text-xl font-black text-amber-400">{signups.filter((s: any) => s.fullPaid).length}</p>
              <p className="text-[0.5rem] font-bold text-white/30 uppercase tracking-widest mt-0.5">Paid Full</p>
            </div>
          </div>

          {/* Email action bar */}
          {signups.length > 0 && (
            <div className="flex items-center justify-between mb-4 bg-black/20 px-4 py-3 rounded-xl border border-white/5">
              <div className="flex items-center gap-3">
                <button onClick={toggleAllEmails} className={`w-5 h-5 rounded border flex items-center justify-center transition-all cursor-pointer ${allSelected ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400' : 'bg-black/20 border-white/15 text-white/10 hover:border-white/25'}`}>
                  {allSelected && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                </button>
                <span className="text-[0.6rem] text-white/40 font-bold uppercase tracking-widest">
                  {cruiseSelectedEmails.length > 0 ? `${cruiseSelectedEmails.length} selected` : 'Select passengers'}
                </span>
              </div>
              <button
                onClick={() => { setCruiseEmailOpen(!cruiseEmailOpen); setCruiseEmailResult(null); }}
                disabled={cruiseSelectedEmails.length === 0}
                className="px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-[0.6rem] font-black uppercase tracking-widest rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                Email {cruiseSelectedEmails.length > 0 ? `(${cruiseSelectedEmails.length})` : ''}
              </button>
            </div>
          )}

          {/* Email compose panel */}
          {cruiseEmailOpen && cruiseSelectedEmails.length > 0 && (
            <div className="mb-5 bg-cyan-500/5 border border-cyan-500/20 rounded-xl p-5 space-y-4 animate-[slideIn_0.3s_ease-out]">
              <div className="flex items-center justify-between">
                <p className="text-[0.6rem] font-bold uppercase tracking-widest text-cyan-400/60">Compose Cruise Email</p>
                <button onClick={() => setCruiseEmailOpen(false)} className="text-white/20 hover:text-white/50 transition-colors cursor-pointer text-sm">✕</button>
              </div>
              {/* Selected recipients preview */}
              <div className="flex flex-wrap gap-1.5 max-h-[60px] overflow-y-auto scrollbar-hide">
                {cruiseSelectedEmails.map(email => (
                  <span key={email} className="inline-flex items-center gap-1 bg-black/30 border border-white/5 rounded-full px-2.5 py-1 text-[0.55rem] text-white/50">
                    {email}
                    <button onClick={() => toggleEmail(email)} className="text-white/20 hover:text-rose-400 transition-colors cursor-pointer">×</button>
                  </span>
                ))}
              </div>
              <div>
                <label className="text-[0.55rem] font-bold uppercase tracking-widest text-white/30 mb-1.5 block">Subject</label>
                <input
                  type="text"
                  value={cruiseEmailSubject}
                  onChange={e => setCruiseEmailSubject(e.target.value)}
                  placeholder="e.g. Important Cruise Update — Departure Details"
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50 transition-colors"
                />
              </div>
              <div>
                <label className="text-[0.55rem] font-bold uppercase tracking-widest text-white/30 mb-1.5 block">Message</label>
                <textarea
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
                      {cruiseEmailResult.success ? `✓ Sent to ${cruiseEmailResult.sent} passenger${cruiseEmailResult.sent !== 1 ? 's' : ''}` : `✕ ${cruiseEmailResult.error}`}
                      {cruiseEmailResult.failed > 0 && <span className="text-rose-400 ml-2">({cruiseEmailResult.failed} failed)</span>}
                    </p>
                  )}
                </div>
                <button
                  disabled={cruiseEmailSending || !cruiseEmailSubject.trim() || !cruiseEmailBody.trim()}
                  onClick={sendCruiseEmail}
                  className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold text-[0.65rem] uppercase tracking-widest rounded-lg transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.2)] cursor-pointer"
                >
                  {cruiseEmailSending ? (
                    <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</>
                  ) : (
                    <>📨 Send Email</>
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
              {signups.map((s: any, i: number) => (
                <div key={s.id || i} className={`grid grid-cols-[28px_40px_1fr_1fr_100px_80px_80px_80px_40px] gap-3 items-center bg-black/20 px-3 py-3 rounded-lg border transition-all group/row ${cruiseSelectedEmails.includes(s.email) ? 'border-cyan-500/30 bg-cyan-500/5' : 'border-white/5 hover:border-cyan-500/20'}`}>
                  {/* Email checkbox */}
                  <div className="flex justify-center">
                    <button onClick={() => s.email && toggleEmail(s.email)} className={`w-5 h-5 rounded border flex items-center justify-center transition-all cursor-pointer ${cruiseSelectedEmails.includes(s.email) ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400' : 'bg-black/20 border-white/10 text-white/10 hover:border-white/20'}`}>
                      {cruiseSelectedEmails.includes(s.email) && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
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
                    <button onClick={() => toggleFlag(s.id, 'checked_off', !s.checkedOff)} className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all cursor-pointer ${s.checkedOff ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-black/20 border-white/10 text-white/10 hover:border-white/20'}`}>
                      {s.checkedOff && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                    </button>
                  </div>
                  {/* Deposit paid */}
                  <div className="flex justify-center">
                    <button onClick={() => toggleFlag(s.id, 'deposit_paid', !s.depositPaid)} className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all cursor-pointer ${s.depositPaid ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-black/20 border-white/10 text-white/10 hover:border-white/20'}`}>
                      {s.depositPaid && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                    </button>
                  </div>
                  {/* Full paid */}
                  <div className="flex justify-center">
                    <button onClick={() => toggleFlag(s.id, 'full_paid', !s.fullPaid)} className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all cursor-pointer ${s.fullPaid ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'bg-black/20 border-white/10 text-white/10 hover:border-white/20'}`}>
                      {s.fullPaid && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                    </button>
                  </div>
                  {/* Delete */}
                  <button onClick={() => deleteSignup(s.id, s.name)} className="w-6 h-6 rounded-md border border-transparent hover:border-rose-500/30 flex items-center justify-center text-white/10 hover:text-rose-400 transition-all opacity-0 group-hover/row:opacity-100 cursor-pointer">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Bottom actions */}
          <div className="flex gap-3 mt-4">
            <button onClick={async () => { const res = await fetch('/api/admin/cruise-export'); if (res.ok) { const blob = await res.blob(); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = '7th-heaven-cruise-roster.csv'; a.click(); } }} className="flex-1 py-3 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white text-[0.65rem] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-[0_4px_15px_rgba(6,182,212,0.25)] border border-cyan-400/30 flex items-center justify-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
              Export CSV
            </button>
          </div>
        </div>
      </div>
    </section>
  );
  };

  const renderAwardPicks = () => (
    <section className="bg-[#0f0f13] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
      <div onClick={() => toggleSection('awardpicks')} className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20 cursor-pointer select-none hover:bg-black/30 transition-colors">
        <div className="flex items-center gap-2">
          <div className="drag-handle cursor-grab active:cursor-grabbing p-1.5 hover:bg-white/5 rounded text-white/20 hover:text-white/50 transition-all shrink-0 mr-1" title="Drag to reorder section" onClick={(e) => e.stopPropagation()}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>
          </div>
          <h3 className="text-lg font-bold tracking-tight text-white flex items-center gap-2 cursor-pointer">
            🏅 Award Picks
            {renderInfoToggle('awardpicks')}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <div className={"w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center transition-transform duration-300 " + (isSectionOpen('awardpicks') ? 'rotate-0' : '-rotate-90')}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40"><path d="M2 4l4 4 4-4" /></svg>
          </div>
        </div>
      </div>
      {renderInfoBanner('awardpicks', 'Award Picks', 'Configure and manage the fan-voted awards roster. Add or remove nominations, edit categories, and review live pick totals.')}
      <div style={{ display: isSectionOpen('awardpicks') ? undefined : 'none' }}>
        <div className="p-6">
          <AwardPicksPanel />
        </div>
      </div>
    </section>
  );
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
        const tfs = details.customized 
          ? (details.timeFrames || [{ startHour: details.startHour, endHour: details.endHour, role: details.role }])
          : dropTimeFrames;
        
        if (hasInternalOverlap(tfs)) {
          const name = findCrewName(crewId);
          alert(`Cannot save schedule for ${name}: Time frames overlap with each other.`);
          return;
        }
      }
    } else {
      if (hasInternalOverlap(dropTimeFrames)) {
        alert(`Cannot save schedule: Time frames overlap with each other.`);
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

      // Delete all existing shifts on activeDropDay for all touched real crew members
      if (touchedCrewIds.size > 0) {
        updated = updated.filter(item => !(item.date === activeDropDay && touchedCrewIds.has(item.crewId) && !item.isTimeOff));
      }

      if (activeAssignments.length > 0) {
        activeAssignments.forEach(([crewId, details], idx) => {
          const tfs = details.customized 
            ? (details.timeFrames || [{ startHour: details.startHour, endHour: details.endHour, role: details.role, tags: [] }])
            : dropTimeFrames;

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
              location: dropLocation,
              notes: dropNotes,
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
              location: dropLocation,
              notes: dropNotes,
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
              location: dropLocation,
              notes: dropNotes,
              tags: tf.tags || []
            };
            updated.push(newItem);
          });
        }
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

    if (dropTimeFrames.length > 0) {
      saveCustomRole(dropTimeFrames[0].role);
    }
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
      { id: 'francesca', name: 'Francesca Troast', role: 'MANAGER', maxHours: 40, avatar: '/images/crew/francesca.png' },
      { id: 'michael', name: 'Michael Scimeca', role: 'AUDIO MIX', maxHours: 40, avatar: 'https://ui-avatars.com/api/?name=Michael+Scimeca&background=8a1cfc&color=fff' },
      { id: 'sammy', name: 'Sammy D', role: 'SERVER', maxHours: 40, avatar: 'https://ui-avatars.com/api/?name=Sammy+D&background=ec4899&color=fff' },
      { id: 'ryan', name: 'Ryan K', role: 'BUSSER', maxHours: 32, avatar: 'https://ui-avatars.com/api/?name=Ryan+K&background=0ea5e9&color=fff' },
      { id: 'tony', name: 'Tony M', role: 'LINE COOK', maxHours: 40, avatar: 'https://ui-avatars.com/api/?name=Tony+M&background=10b981&color=fff' }
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
      HOST: { bg: '#f59e0b', tagBg: '#b45309', label: 'HOST' },           // Vibrant Amber Gold
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

        if (isFestival) return { bg: '#ec4899', tagBg: '#be185d', label: '🎪 Festival' }; 
        if (isPrivate) return { bg: '#8b5cf6', tagBg: '#6d28d9', label: '🔒 Private' }; 
        if (isCorporate) return { bg: '#10b981', tagBg: '#047857', label: '💼 Corporate' }; 
        if (isCruise) return { bg: '#3b82f6', tagBg: '#1d4ed8', label: '🚢 Cruise' }; 
        return { bg: '#f59e0b', tagBg: '#b45309', label: '🎵 Club / Bar' };
      }

      if (mode === 'band') {
        const notesLower = (show.notes || '').toLowerCase();
        const venueLower = (show.venue || '').toLowerCase();
        
        if (notesLower.includes('unplugged') || notesLower.includes('f.a.n. show')) {
          return { bg: '#f97316', tagBg: '#c2410c', label: '🔸 F.A.N. Unplugged' };
        }
        if (notesLower.includes('tv appearance') || venueLower.includes('wgn')) {
          return { bg: '#06b6d4', tagBg: '#0891b2', label: '📺 TV appearance' };
        }
        if (venueLower.includes('private event') || notesLower.includes('private')) {
          return { bg: '#f43f5e', tagBg: '#be123c', label: '🔒 Private Event' };
        }
        return { bg: '#6366f1', tagBg: '#4338ca', label: '🎸 7th Heaven' };
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
            alert(`Cannot reassign shift: ${memberName} already has an overlapping shift (${overlapping[0].time}) scheduled on ${dateStr}.`);
            return;
          }
        }

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
          timeFrames: JSON.parse(JSON.stringify(loadedTimeFrames))
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
      setShowEligibleCoverageList(false);
      setEditingShiftId(shift.id);
      setDraggedCrewMemberId(shift.crewId);
      setActiveDropDay(shift.date);
      setDropStartHour(shift.startHour);
      setDropEndHour(shift.endHour);
      setDropRole(shift.role);
      setDropLocation(shift.location);
      setDropNotes(shift.notes);

      // Load all shifts for this crew member on this day if real crew member
      let loadedTimeFrames = [{ id: shift.id, startHour: shift.startHour, endHour: shift.endHour, role: shift.role, tags: shift.tags || [] }];
      if (shift.crewId && shift.crewId !== 'openshifts') {
        const existing = schedules.filter(s => s.date === shift.date && s.crewId === shift.crewId && !s.isTimeOff);
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

      setDropTimeFrames(loadedTimeFrames);

      const initialAssignments: { [key: string]: any } = {};
      if (shift.crewId && shift.crewId !== 'openshifts') {
        initialAssignments[shift.crewId] = {
          active: true,
          customized: true,
          role: shift.role,
          startHour: shift.startHour,
          endHour: shift.endHour,
          timeFrames: JSON.parse(JSON.stringify(loadedTimeFrames))
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
            className="wiw-card select-none cursor-pointer rounded-md bg-[#252530] border border-white/10 py-3 px-3 flex items-center justify-center text-center w-full min-h-[60px]"
          >
            <span className="text-[10px] font-extrabold text-white/40 uppercase tracking-wider">
              Time Off All Day
            </span>
          </div>
        );
      }

      const roleStyle = getShiftColor(shift, colorCodingMode);
      const timeLabel = shift.labelOverride || formatTimeStringWIW(shift.startHour, shift.endHour);
      const isBeingDragged = draggedShiftId === shift.id;

      const showOverlapAvatar = showCrewName;

      return (
        <div
          key={shift.id}
          id={`shift-card-${shift.id}`}
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
          className={`wiw-card group relative select-none cursor-grab active:cursor-grabbing rounded-md p-1.5 flex flex-col justify-between shadow-sm text-white ${
            showCrewName ? 'min-h-[100px]' : 'min-h-[48px]'
          } ${
            shift.isDraft ? 'wiw-striped' : ''
          }`}
          title={shift.crewId !== 'openshifts' ? (() => {
            const member = crewMembers.find(c => c.id === shift.crewId);
            const name = member?.name || shift.crewName || shift.crewId || '?';
            return `${name}\nRole: ${member?.role || shift.role || 'Crew Member'}\nPhone: ${member?.phone || 'N/A'}\nEmail: ${member?.email || 'N/A'}`;
          })() : 'Open Shift'}
        >
          {/* Action buttons — visible on hover */}
          <div className="absolute top-0.5 right-0.5 flex items-center gap-0.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
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

          {!showCrewName ? (
            /* Compact When I Work style for Roster Grid */
            <div className="flex-1 flex flex-col justify-center gap-1 w-full select-none min-h-0">
              <div className="flex items-center justify-between gap-1 w-full min-h-0">
                <span className="text-[9.5px] font-black tracking-tight text-white whitespace-nowrap">
                  {timeLabel}
                </span>
                <span
                  style={{ backgroundColor: 'rgba(0,0,0,0.22)' }}
                  className="px-1.5 py-0.5 rounded text-[7.5px] font-black uppercase tracking-wider leading-none text-white/90 shrink-0 select-none"
                >
                  {roleStyle.label}
                </span>
              </div>
              {shift.tags && shift.tags.length > 0 && (
                <div className="flex flex-wrap gap-0.5">
                  {shift.tags.map((tag: string, idx: number) => (
                    <span 
                      key={idx}
                      className="px-1.5 py-0.2 rounded text-[7px] font-black uppercase tracking-wider bg-black/20 text-white/80 border border-white/5"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Expanded style for Timeline / List / Detail views */
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

              <div className="mt-1.5 flex items-center justify-start gap-1 flex-wrap">
                <span
                  style={{ backgroundColor: roleStyle.tagBg }}
                  className="px-1.5 py-0.5 rounded text-[7.5px] font-black uppercase tracking-wider leading-none text-white/90"
                >
                  {roleStyle.label}
                </span>
                {shift.tags && shift.tags.length > 0 && shift.tags.map((tag: string, idx: number) => (
                  <span 
                    key={idx}
                    className="px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-wider leading-none bg-black/30 text-white/80 border border-white/5"
                  >
                    {tag}
                  </span>
                ))}
                {shift.isCoverageRequested && (
                  <span className="px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-wider leading-none bg-red-500/20 border border-red-500/35 text-red-300 animate-pulse">
                    ⏳ Coverage
                  </span>
                )}
              </div>

              {showCrewName && shift.crewId !== 'openshifts' && (() => {
                const member = crewMembers.find(c => c.id === shift.crewId);
                const name = member?.name || shift.crewName || shift.crewId || '?';
                return (
                  <div className="mt-2.5 pt-1.5 border-t border-white/10 text-[8.5px] text-white/70 space-y-0.5 font-sans leading-normal">
                    <span className="font-bold text-amber-300 block truncate" title={name}>👤 {name}</span>
                    <span className="block truncate font-mono opacity-80" title={member?.phone || 'N/A'}>📞 {member?.phone || 'N/A'}</span>
                    <span className="block truncate font-mono opacity-80" title={member?.email || 'N/A'}>✉️ {member?.email || 'N/A'}</span>
                  </div>
                );
              })()}
            </div>
          )}

          {showOverlapAvatar && (
            <div className="absolute -left-2.5 -bottom-2.5 w-6 h-6 rounded-full border-2 border-[#0f0f13] shadow-md z-20 flex items-center justify-center shrink-0 wiw-tooltip-container">
              {(() => {
                if (shift.crewId === 'openshifts') {
                  return (
                    <div className="w-full h-full flex items-center justify-center text-emerald-400 bg-[#102a1e] rounded-full overflow-hidden">
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
                      className="w-full h-full object-cover rounded-full overflow-hidden"
                    />
                  );
                }
                const initials = member?.initials || displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
                const color = member?.color || getAvatarColor(displayName);
                return (
                  <div
                    className="w-full h-full flex items-center justify-center font-bold text-[8px] text-white rounded-full overflow-hidden"
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
                    <div className="text-amber-400 font-extrabold text-[9px] uppercase tracking-wider mb-2">
                      Role: {member?.role || shift.role || 'Crew Member'}
                    </div>
                    <div className="text-slate-400 text-[10px] space-y-1 border-t border-slate-700/50 pt-1.5 font-mono">
                      <div className="flex items-center gap-1.5">
                        <span>✉️</span>
                        <span className="truncate">{member?.email || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span>📞</span>
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
      const renderRoleBadges = (roleStr: string) => {
        const roles = (roleStr || 'Crew').split(/[,|/]/).map(r => r.trim()).filter(Boolean);
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
            colorClass = "text-amber-400 bg-amber-500/10 border-amber-500/25";
          } else if (upper.includes("BUSSER")) {
            colorClass = "text-sky-400 bg-sky-500/10 border-sky-500/25";
          }
          return (
            <span 
              key={idx}
              className={`inline-block px-1 py-0.2 text-[8px] font-black uppercase tracking-wider rounded border leading-none scale-90 origin-left ${colorClass}`}
            >
              {r}
            </span>
          );
        });
      };

      return (
        <div className="w-full flex-1 min-h-0 overflow-auto border border-white/15 rounded-xl bg-black/40 shadow-inner">
          <table
            style={{ minWidth: filteredDays.length <= 2 ? 'auto' : `${176 + filteredDays.length * 144}px` }}
            className="w-full border-separate border-spacing-0 text-left select-none table-fixed bg-transparent"
          >
            <thead>
              <tr className="border-b border-white/20 bg-white/[0.02] text-white/40 text-[11px] font-bold tracking-wider">
                <th className="p-2 w-44 border-r border-white/15 border-b border-white/20 uppercase wiw-sticky-corner">First Name</th>
                {filteredDays.map((day, idx) => {
                  const dayShow = getDayShow(day.dateStr);
                  const isNextShow = day.dateStr === nextShowDate;
                  return (
                    <th 
                      key={day.dateStr} 
                      id={`col-header-${day.dateStr}`}
                      className={`p-2 w-36 border-r border-white/15 border-b border-white/20 relative group wiw-sticky-header transition-all duration-200 ${
                        selectedTourDate === day.dateStr 
                          ? 'bg-amber-500/20 text-amber-300 font-black shadow-[inset_0_-3px_0_#f59e0b]' 
                          : isNextShow
                            ? 'bg-amber-500/[0.04] text-amber-400 font-black border-x border-amber-500/10 shadow-[inset_0_1px_0_rgba(245,158,11,0.15)]'
                            : 'text-white/40'
                      }`}
                    >
                      <div className="flex flex-col gap-1 w-full">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span>{getDayLabelOverride(day.dateStr, idx)}</span>
                            {isNextShow && (
                              <span className="text-[8px] bg-amber-500 text-black px-1 py-0.5 rounded font-black uppercase tracking-widest scale-[0.85] origin-left select-none">
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
                              className="p-0.5 hover:bg-amber-500/10 rounded text-amber-500 hover:text-amber-400 border-none bg-transparent cursor-pointer"
                              title="Alert assigned crew for this show"
                            >
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setScheduleSortByDate(prev => prev === day.dateStr ? null : day.dateStr);
                              }}
                              className={`p-0.5 rounded border-none bg-transparent cursor-pointer transition-colors ${
                                scheduleSortByDate === day.dateStr 
                                  ? 'bg-amber-500/15 text-amber-500 hover:text-amber-400 font-extrabold' 
                                  : 'text-white/40 hover:text-white hover:bg-white/5'
                              }`}
                              title={scheduleSortByDate === day.dateStr ? "Reset crew sorting" : "Sort working crew to the top"}
                            >
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
              {!scheduleCrewFilter && !schedulePersonSearch.trim() && (
                <tr className="border-b border-white/15 bg-emerald-500/[0.02] hover:bg-emerald-500/[0.04] transition-colors">
                  <td className="p-1 border-r border-b border-white/15 align-middle wiw-sticky-col">
                    <div className="flex items-center gap-2.5 pl-1">
                      <div className="w-6 h-6 rounded-full border border-emerald-500 bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold shrink-0 shadow-sm">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg>
                      </div>
                      <div>
                        <span className="text-xs font-black text-white/85 block leading-tight">OpenShifts</span>
                        <span className="text-[8px] text-white/30 font-bold uppercase tracking-wider leading-none">Positions</span>
                      </div>
                    </div>
                  </td>
                  {filteredDays.map(day => {
                    const isSelectedDay = selectedTourDate === day.dateStr;
                    const isNextShow = day.dateStr === nextShowDate;
                    return (
                      <td
                        key={day.dateStr}
                        className={`p-1 border-r border-b border-white/15 align-top relative hover:bg-white/[0.02] transition-colors cursor-pointer ${
                          isSelectedDay 
                            ? 'bg-amber-500/[0.08] border-x border-amber-500/20 shadow-[inset_0_0_10px_rgba(245,158,11,0.05)]' 
                            : isNextShow
                              ? 'bg-amber-500/[0.015] border-x border-amber-500/5 shadow-[inset_0_0_8px_rgba(245,158,11,0.02)]'
                              : ''
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
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCellClick(day.dateStr, 'openshifts', 'SERVER');
                            }}
                            className="w-full py-1.5 flex flex-col items-center justify-center border border-dashed border-emerald-500/25 hover:border-emerald-500/50 rounded-lg bg-emerald-500/[0.01] hover:bg-emerald-500/[0.04] transition-all cursor-pointer group"
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
                              className="flex-1 py-1 flex flex-col items-center justify-center border border-dashed border-emerald-500/25 hover:border-emerald-500/50 rounded-lg bg-emerald-500/[0.01] hover:bg-emerald-500/[0.04] transition-all cursor-pointer group"
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
                              className="flex-1 py-1 flex flex-col items-center justify-center border border-dashed border-emerald-500/25 hover:border-emerald-500/50 rounded-lg bg-emerald-500/[0.01] hover:bg-emerald-500/[0.04] transition-all cursor-pointer group"
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
              )}
              {/* Crew Rows — individually collapsible */}
              {(() => {
                const activeWeekDateSet = new Set(next7Days.map(d => d.dateStr));
                return filteredCrewMembers.map(member => {
                  const totalHours = getCrewScheduledHours(member.id, next7Days);
                  const monthHours = getCrewScheduledHoursForMonth(member.id, currentWeekStart);
                  const hoursStatus = getCrewHoursStatus(member.id, totalHours);
                  const hasExclamation = member.id === 'arjun' || member.id === 'dave_croke';
                  const isCollapsed = collapsedCrewIds.includes(member.id);
                  const shiftCount = (schedulesByCrew[member.id] || []).filter(s => activeWeekDateSet.has(s.date || '')).length;

                return (
                  <tr key={member.id} className="border-b border-white/15 hover:bg-white/[0.01] transition-colors">
                    <td className="p-2 border-r border-b border-white/15 align-top relative wiw-sticky-col">
                      <div className="flex items-center gap-3">
                        {hasExclamation && (
                          <div className="absolute left-1 top-1/2 -translate-y-1/2 text-amber-500" title="Warning: Schedule issues">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                          </div>
                        )}
                        <CrewAvatar member={member} />
                        <div className="min-w-0 wiw-tooltip-container">
                          <p className="text-xs font-black text-white/80 truncate leading-tight">{member.name}</p>
                          <div className="flex items-center gap-1 mt-1 flex-wrap">
                            {hoursStatus.status !== 'ok' ? (
                              <span className="text-[10px] text-rose-500 font-extrabold flex items-center gap-1 leading-none cursor-help" title={`Scheduled: ${totalHours}h (Max: ${hoursStatus.maxHours}h) — ${hoursStatus.over}h over max!`}>
                                ⚠️ <span className="font-mono">{totalHours}h</span>
                              </span>
                            ) : (
                              <span className="text-[10px] text-white/40 font-bold font-mono leading-none">
                                {totalHours}h
                              </span>
                            )}
                            {renderRoleBadges(member.role)}
                          </div>
                          
                          <div className="mt-1 text-[9px] text-white/35 font-mono space-y-0.5 leading-none">
                            {member.phone && <div className="truncate" title={member.phone}>📞 {member.phone}</div>}
                            {member.email && <div className="truncate" title={member.email}>✉️ {member.email}</div>}
                          </div>

                          <div className="wiw-tooltip bg-[#1c1d22] text-white p-3 rounded-lg shadow-xl text-left border border-slate-700/50 w-52 leading-relaxed font-sans text-xs">
                            <div className="font-bold text-slate-200 text-xs mb-0.5">{member.name}</div>
                            <div className="text-amber-400 font-extrabold text-[9px] uppercase tracking-wider mb-2">
                              Role: {member.role || 'Crew Member'}
                            </div>
                            <div className="text-slate-400 text-[10px] space-y-1 border-t border-slate-700/50 pt-1.5 font-mono">
                              <div className="flex items-center gap-1.5">
                                <span>✉️</span>
                                <span className="truncate">{member.email || 'N/A'}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span>📞</span>
                                <span>{member.phone || 'N/A'}</span>
                              </div>
                            </div>
                            {hoursStatus.status !== 'ok' && (
                              <div className="mt-2.5 pt-2 border-t border-slate-700/50 text-[10px] text-slate-400">
                                <div className="font-bold text-slate-300">Hours Alert:</div>
                                <div>Scheduled: {totalHours}h (Max: {hoursStatus.maxHours}h)</div>
                                <div className="text-rose-400 font-bold mt-0.5 flex items-center gap-1">
                                  <span>🚫</span> {hoursStatus.over} hours over max
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
                          className={`p-1 border-r border-b border-white/15 align-top relative hover:bg-white/[0.02] transition-colors cursor-pointer group ${
                            isSelectedDay 
                              ? 'bg-amber-500/[0.08] border-x border-amber-500/20 shadow-[inset_0_0_10px_rgba(245,158,11,0.05)]' 
                              : isNextShow
                                ? 'bg-amber-500/[0.015] border-x border-amber-500/5 shadow-[inset_0_0_8px_rgba(245,158,11,0.02)]'
                                : ''
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
                              className="opacity-0 group-hover:opacity-100 mt-1 w-full py-0.5 flex items-center justify-center gap-1 text-[8px] font-bold text-white/30 hover:text-white/70 bg-white/5 hover:bg-white/10 border border-white/10 rounded transition-all cursor-pointer"
                            >
                              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                              + ADD
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })})()}

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
            const shiftsForDay = schedulesByDate[day.dateStr] || [];
            const dayShifts = scheduleCrewFilter ? shiftsForDay.filter(s => s.crewId === scheduleCrewFilter || s.crewId === 'openshifts') : shiftsForDay;
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
                    
                    // Overlap validation
                    const draggedShift = schedules.find(s => s.id === shiftId);
                    if (draggedShift && draggedShift.crewId !== 'openshifts') {
                      const overlapping = getOverlappingShifts(draggedShift.crewId, day.dateStr, draggedShift.startHour, draggedShift.endHour, shiftId);
                      if (overlapping.length > 0) {
                        const member = crewMembers.find(c => c.id === draggedShift.crewId);
                        const memberName = member ? member.name : draggedShift.crewId;
                        alert(`Cannot move shift: ${memberName} already has an overlapping shift (${overlapping[0].time}) scheduled on ${day.dateStr}.`);
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
        <div className="flex flex-col flex-1 min-h-0 bg-[#0f0f13] border border-white/5 rounded-xl p-4 shadow-2xl select-none">
          <div className="flex select-none">
            <div className="w-14 shrink-0" />
            <div className="flex-1 grid grid-cols-7 gap-2 text-center pb-2 border-b border-white/10 mb-2">
              {filteredDays.map((day) => {
                const count = (schedulesByDate[day.dateStr] || []).length;
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
                            alert(`Cannot move shift: ${memberName} already has an overlapping shift (${overlapping[0].time}) scheduled on ${day.dateStr}.`);
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
                      const roleStyle = getShiftColor(shift, colorCodingMode);
                      return (
                        <div
                          key={shift.id}
                          id={`shift-card-timeline-${shift.id}`}
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
      <section className="bg-[#0f0f13] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        <style>{`
          .wiw-scheduler-container {
            background-color: #0f0f13;
            color: #ffffff;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
          .wiw-scheduler-container td, .wiw-scheduler-container th {
            border-style: solid;
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
          @keyframes slideDown {
            from { opacity: 0; transform: translateY(-8px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        {/* Section Header */}
        <div onClick={() => toggleSection('calendar')} className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20 cursor-pointer select-none hover:bg-black/30 transition-colors text-white">
          <div className="flex items-center gap-2">
            <div className="drag-handle cursor-grab active:cursor-grabbing p-1.5 hover:bg-white/5 rounded text-white/20 hover:text-white/50 transition-all shrink-0 mr-1" title="Drag to reorder section" onClick={(e) => e.stopPropagation()}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>
            </div>
            <h3 className="cursor-pointer text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <span>📅</span> Crew Work Schedule Calendar
              {renderInfoToggle('calendar')}
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest bg-white/5 px-2.5 py-1 rounded">Roster Schedule</span>
            <div className={"w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center transition-transform duration-300 " + (isSectionOpen('calendar') ? 'rotate-0' : '-rotate-90')}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40"><path d="M2 4l4 4 4-4" /></svg>
            </div>
          </div>
        </div>
        {renderInfoBanner('calendar', 'Crew Work Schedule Calendar', 'Schedule band/crew work shifts, manage open roles, publish shifts, and prevent overlaps in a weekly/monthly timeline.')}

        <div style={{ display: isSectionOpen('calendar') ? undefined : 'none' }}>
          <div className="wiw-scheduler-container h-[750px] flex flex-col min-h-0">
            
            {/* Header controls (Date range, prev/next, today, action icons) */}
            <div className="bg-black/40 border-b border-white/5 p-4 flex flex-col lg:flex-row items-center justify-between gap-4 select-none text-white shrink-0">
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
                       const today = new Date();
                       const day = today.getDay();
                       const diff = today.getDate() - day + (day === 0 ? -6 : 1);
                       const thisMonday = new Date(today.getFullYear(), today.getMonth(), diff);
                       
                       if (time === thisMonday.getTime()) return 'current';
                       if (time === thisMonday.getTime() + 7 * 86400000) return 'next';
                       if (time === thisMonday.getTime() + 14 * 86400000) return 'next2';
                       if (time === thisMonday.getTime() + 21 * 86400000) return 'next3';
                       if (time === thisMonday.getTime() + 28 * 86400000) return 'next4';
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
                     className="appearance-none pr-8 pl-3 py-1.5 border border-white/10 bg-black/40 hover:bg-white/5 text-xs font-bold text-white/70 hover:text-white rounded-lg shadow-sm transition-colors cursor-pointer outline-none border-solid min-w-[95px]"
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
                      {(() => {
                        const todayStr = new Date().toISOString().split('T')[0];
                        const upcomingTourDates = tourDates.filter(show => !show.date || show.date >= todayStr);
                        if (upcomingTourDates.length === 0) {
                          return <div className="px-4 py-3 text-[11px] text-white/30 italic">No upcoming tour dates synced yet</div>;
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
                          });
                      })()}
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

                {/* Advanced Filters Trigger */}
                <button
                  type="button"
                  onClick={() => setIsFiltersPanelExpanded(!isFiltersPanelExpanded)}
                  className={`px-3 py-1.5 border text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer border-solid flex items-center gap-1.5 select-none ${
                    isFiltersPanelExpanded || activeFiltersCount > 0
                      ? 'border-amber-500/40 bg-amber-500/15 text-amber-400 font-extrabold shadow-[0_0_8px_rgba(245,158,11,0.1)]' 
                      : 'border-white/10 bg-black/40 hover:bg-white/5 text-white/70 hover:text-white'
                  }`}
                  title="Search & advanced filters by person, venue, date range, and event type"
                >
                  <span>🔍</span> {isFiltersPanelExpanded ? 'HIDE FILTERS' : 'FILTERS'}
                  {activeFiltersCount > 0 && (
                    <span className="px-1.5 py-0.5 bg-amber-500 text-black rounded-full text-[9px] font-black leading-none">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>

                {/* Color Coding Mode Selector */}
                <div className="relative">
                  <select
                    value={colorCodingMode}
                    onChange={(e) => setColorCodingMode(e.target.value as any)}
                    className="appearance-none pr-8 pl-3 py-1.5 border border-white/10 bg-black/40 hover:bg-white/5 text-xs font-bold text-white/70 hover:text-white rounded-lg shadow-sm transition-colors cursor-pointer outline-none border-solid min-w-[155px]"
                    title="Select color coding scheme for schedule cards"
                  >
                    <option value="role">🎨 Role Colors</option>
                    <option value="eventType">🎪 Event Type Colors</option>
                    <option value="band">🎸 Band Colors</option>
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
                    Clear All ✕
                  </button>
                )}

                {/* ⏳ Coverage Requests Dropdown */}
                {(() => {
                  const coverageRequests = schedules.filter(s => s.isCoverageRequested);
                  return (
                    <div className="relative">
                      <select
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
                        <option value="" className="text-white/40">🚨 {coverageRequests.length} Coverage {coverageRequests.length === 1 ? 'Request' : 'Requests'}</option>
                        {coverageRequests.map(shift => {
                          const member = crewMembers.find(m => m.id === shift.crewId);
                          const name = member ? member.name : shift.crewName || shift.crewId;
                          const dateObj = new Date(shift.date + 'T12:00:00');
                          const dateLabel = !isNaN(dateObj.getTime())
                            ? dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                            : shift.date;
                          return (
                            <option key={shift.id} value={shift.id} className="text-white bg-[#111116]">
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
                    <label className="text-[10px] font-black uppercase text-white/50 tracking-wider">Search Person / Role</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={schedulePersonSearch}
                        onChange={(e) => setSchedulePersonSearch(e.target.value)}
                        placeholder="Name, role, e.g. Dave, Audio..."
                        className="w-full bg-black/60 border border-white/10 focus:border-amber-500/50 rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/20 outline-none transition-colors"
                      />
                      {schedulePersonSearch && (
                        <button
                          type="button"
                          onClick={() => setSchedulePersonSearch('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white bg-transparent border-none cursor-pointer text-xs font-bold"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Search by Venue */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase text-white/50 tracking-wider">Search Venue Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={scheduleVenueSearch}
                        onChange={(e) => setScheduleVenueSearch(e.target.value)}
                        placeholder="Venue, e.g. Blarney, Cruise..."
                        className="w-full bg-black/60 border border-white/10 focus:border-amber-500/50 rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/20 outline-none transition-colors"
                      />
                      {scheduleVenueSearch && (
                        <button
                          type="button"
                          onClick={() => setScheduleVenueSearch('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white bg-transparent border-none cursor-pointer text-xs font-bold"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Event Type Filter */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase text-white/50 tracking-wider">Show / Event Type</label>
                    <div className="relative">
                      <select
                        value={scheduleEventTypeFilter}
                        onChange={(e) => setScheduleEventTypeFilter(e.target.value)}
                        className="appearance-none w-full bg-black/60 border border-white/10 focus:border-amber-500/50 rounded-lg pl-3 pr-8 py-1.5 text-xs text-white outline-none transition-colors cursor-pointer border-solid"
                      >
                        <option value="">⚡ Any Event Type</option>
                        <option value="festival">🎪 Festival</option>
                        <option value="private">🔒 Private Event</option>
                        <option value="corporate">💼 Corporate</option>
                        <option value="cruise">🚢 Cruise</option>
                        <option value="club">🎵 Club / Bar</option>
                      </select>
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-white/30">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9" /></svg>
                      </div>
                    </div>
                  </div>

                  {/* Date Range Selection */}
                  <div className="flex flex-col gap-1.5 col-span-1">
                    <label className="text-[10px] font-black uppercase text-white/50 tracking-wider">Custom Date Range</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={scheduleStartDate}
                        onChange={(e) => setScheduleStartDate(e.target.value)}
                        className="w-full bg-black/60 border border-white/10 focus:border-amber-500/50 rounded-lg px-2.5 py-1 text-xs text-white outline-none transition-colors cursor-pointer"
                      />
                      <span className="text-white/35 text-[10px] font-bold">TO</span>
                      <input
                        type="date"
                        value={scheduleEndDate}
                        onChange={(e) => setScheduleEndDate(e.target.value)}
                        className="w-full bg-black/60 border border-white/10 focus:border-amber-500/50 rounded-lg px-2.5 py-1 text-xs text-white outline-none transition-colors cursor-pointer"
                      />
                      {(scheduleStartDate || scheduleEndDate) && (
                        <button
                          type="button"
                          onClick={() => {
                            setScheduleStartDate('');
                            setScheduleEndDate('');
                          }}
                          className="text-white/40 hover:text-white bg-white/5 hover:bg-white/10 px-2 py-1 rounded text-[10px] font-bold transition-all cursor-pointer border-none"
                          title="Reset Date Range"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Info summary under filters */}
                <div className="flex items-center justify-between text-[11px] text-white/40 border-t border-white/5 pt-2">
                  <div className="flex items-center gap-4">
                    <span>
                      📅 Displaying <strong className="text-amber-400 font-extrabold">{filteredDays.length}</strong> date columns
                    </span>
                    <span>
                      👥 Showing <strong className="text-amber-400 font-extrabold">{filteredCrewMembers.length}</strong> crew rows
                    </span>
                  </div>
                  {activeFiltersCount > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400/80 font-semibold italic">Filters active</span>
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
                        className="text-amber-400 hover:text-white bg-amber-500/10 hover:bg-amber-500/20 px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer border-none"
                      >
                        Reset All Filters ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Grid Body + Sidebar */}
            <div className="flex gap-0 flex-1 min-h-0">
              {/* Main Schedule Grid */}
              <div className="flex-1 p-4 bg-black/10 min-w-0 flex flex-col min-h-0">
                {calendarView === 'timeline' && renderTimelineGrid()}
                {calendarView === 'roster' && renderRosterBoard()}
                {calendarView === 'list' && renderListBoard()}
              </div>

              {/* Right Sidebar: Tour Dates & Crew */}
              <div className="w-[280px] shrink-0 border-l border-white/15 bg-black/30 overflow-y-auto h-full hidden xl:block z-20">
                
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
                      <span className="text-[9px] font-bold text-white/20 bg-white/5 px-1.5 py-0.5 rounded">
                        {upcomingTourDatesWithLabels.length}
                      </span>
                    </div>
                  </div>
                  <div className="px-2 pb-2 flex flex-col gap-0.5 max-h-[calc(100vh-150px)] overflow-y-auto">
                    {(() => {
                      if (upcomingTourDatesWithLabels.length === 0) {
                        return <div className="px-2 py-3 text-[10px] text-white/20 italic text-center">No upcoming tour dates synced</div>;
                      }

                      return upcomingTourDatesWithLabels.map((show, idx) => {
                        const isSelected = selectedTourDate === show.date;
                        const isActiveWeek = show.date ? activeWeekDateSet.has(show.date) : false;
                        const shiftCount = show.date ? shiftCountsByDate[show.date] || 0 : 0;
                        
                        return (
                          <SidebarDateButton
                            key={idx}
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
            <div className="bg-black/30 border-t border-white/5 shrink-0">
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
                    const maxHours = leaderboardRankings.length > 0 ? leaderboardRankings[0].hours : 1;
                    
                    if (leaderboardRankings.length === 0) {
                      return (
                        <div className="text-center py-3 text-[11px] text-white/20 italic">No hours logged for this period</div>
                      );
                    }
                    
                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {leaderboardRankings.slice(0, 9).map((member, idx) => {
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
              const editingShift = schedules.find(s => s.id === editingShiftId);
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
                                  localStorage.setItem('7h_crew_schedules', JSON.stringify(updated));
                                  window.dispatchEvent(new Event('storage'));
                                  fetch("/api/crew/calendar", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify(updated)
                                  }).catch(err => console.error("Failed to sync schedules:", err));
                                  return updated;
                                });
                              }}
                              className="w-full py-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <span>🙋</span> Request Coverage
                            </button>
                          </div>
                        );
                      }
                      
                      // If coverage is requested:
                      return (
                        <div className="shrink-0 bg-red-500/10 border border-red-500/30 rounded-xl p-4 space-y-3">
                          <div className="flex items-center justify-between gap-3 text-red-400">
                            <div className="flex items-center gap-2">
                              <span className="text-sm">🚨</span>
                              <div>
                                <p className="text-xs font-black uppercase tracking-wider">Coverage Requested</p>
                                <p className="text-[10px] text-white/60 mt-0.5">
                                  <strong>{editingShift.crewName}</strong> has requested coverage for this shift.
                                </p>
                              </div>
                            </div>
                            <button 
                              type="button"
                              onClick={() => {
                                setSchedules(current => {
                                  const updated = current.map(s => {
                                    if (s.id === editingShiftId) {
                                      return { ...s, isCoverageRequested: false };
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
                              }}
                              className="px-2 py-0.5 bg-red-500/20 hover:bg-red-500/40 text-red-300 text-[9px] font-black uppercase tracking-wider rounded border border-red-500/30 transition-colors"
                            >
                              Clear
                            </button>
                          </div>

                          <div className="border-t border-white/5 pt-3 space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black uppercase tracking-wider text-white/50">Assign Coverage:</span>
                              
                              {/* Tab/Toggle for Fit Role vs Override */}
                              <div className="flex bg-black/40 p-0.5 rounded-lg border border-white/15">
                                <button
                                  type="button"
                                  onClick={() => setOnlyShowFitRole(true)}
                                  className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded transition-all cursor-pointer ${
                                    onlyShowFitRole 
                                      ? 'bg-amber-500 text-black font-black' 
                                      : 'text-white/60 hover:text-white'
                                  }`}
                                >
                                  🎯 Fit Role ({editingShift.role})
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setOnlyShowFitRole(false)}
                                  className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded transition-all cursor-pointer ${
                                    !onlyShowFitRole 
                                      ? 'bg-red-500/20 text-red-300 border border-red-500/30 font-black' 
                                      : 'text-white/60 hover:text-white'
                                  }`}
                                >
                                  ⚠️ Override (All)
                                </button>
                              </div>
                            </div>

                            {/* List of candidates */}
                            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                              {(() => {
                                const candidates = crewMembers
                                  .filter(m => m.id !== 'openshifts' && m.id !== editingShift.crewId)
                                  .filter(m => {
                                    if (onlyShowFitRole) {
                                      return (m.role || '').toUpperCase() === (editingShift.role || '').toUpperCase();
                                    }
                                    return true;
                                  });

                                if (candidates.length === 0) {
                                  return (
                                    <p className="text-[10px] text-white/40 italic py-1">
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
                                        <div className="w-5 h-5 rounded-full bg-white/10 overflow-hidden flex items-center justify-center text-[9px] font-bold text-white uppercase">
                                          {member.avatar ? (
                                            <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                                          ) : (
                                            member.initials || member.name[0]
                                          )}
                                        </div>
                                        <div>
                                          <span className="text-xs font-bold text-white block leading-tight">{member.name}</span>
                                          <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className="text-[8px] text-white/40 uppercase tracking-wider font-bold block">{member.role || 'Crew'}</span>
                                            {isOverlapping && (
                                              <span className="px-1 py-0.2 rounded text-[7px] font-black uppercase tracking-wider bg-red-500/20 border border-red-500/35 text-red-400">
                                                ⚠️ Overlaps {overlaps[0].time}
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
                                            const updated = current.map(s => {
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
                                            localStorage.setItem('7h_crew_schedules', JSON.stringify(updated));
                                            window.dispatchEvent(new Event('storage'));
                                            fetch("/api/crew/calendar", {
                                              method: "POST",
                                              headers: { "Content-Type": "application/json" },
                                              body: JSON.stringify(updated)
                                            }).catch(err => console.error("Failed to sync schedules:", err));
                                            
                                            // Close sidebar after successful reassign
                                            setActiveDropDay(null);
                                            setDraggedCrewMemberId(null);
                                            setEditingShiftId(null);
                                            return updated;
                                          });
                                        }}
                                        className={`px-2 py-1 text-[9px] font-black uppercase tracking-wider rounded transition-colors border-none ${
                                          isOverlapping
                                            ? 'bg-white/5 text-white/20 cursor-not-allowed'
                                            : 'bg-amber-500 hover:bg-amber-400 text-black cursor-pointer'
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
                    {!(editingShift && editingShift.isCoverageRequested) && (
                      <div className="flex flex-col shrink-0">
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
                                      updated[id] = { 
                                        ...updated[id], 
                                        customized: true,
                                        timeFrames: updated[id].timeFrames || JSON.parse(JSON.stringify(dropTimeFrames))
                                      };
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

                      <div className="space-y-2.5 pr-1 overflow-y-auto max-h-60 border border-white/5 bg-black/10 rounded-xl p-2.5">
                        {crewMembers
                          .filter(m => m.id !== 'openshifts')
                          .filter(m => m.name.toLowerCase().includes(drawerCrewSearch.toLowerCase()))
                          .map((member) => {
                            const assignment = selectedCrewAssignments[member.id] || { active: false, customized: false, role: dropRole || 'SERVER', startHour: dropStartHour, endHour: dropEndHour };
                            
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
                                className={`p-3 rounded-xl border transition-all ${
                                  assignment.active
                                    ? 'bg-amber-500/5 border-amber-500/30'
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
                                            role: assignment.role || dropRole || member.role || 'SERVER',
                                            startHour: assignment.startHour || dropStartHour || 12,
                                            endHour: assignment.endHour || dropEndHour || 17,
                                            timeFrames: JSON.parse(JSON.stringify(dropTimeFrames))
                                          }
                                        }));
                                      }}
                                      className="rounded border-white/10 bg-black/40 text-amber-500 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5 cursor-pointer"
                                    />
                                    <div className="flex items-center gap-2">
                                      <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[9px] font-bold text-white uppercase overflow-hidden font-sans">
                                        {member.avatar ? (
                                          <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                                        ) : (
                                          member.initials || member.name[0]
                                        )}
                                      </div>
                                      <div>
                                        <span className="text-xs font-bold text-white/95 font-sans block leading-tight">{member.name}</span>
                                        <span className="text-[9.5px] text-white/40 font-mono block leading-tight mt-0.5">
                                          📞 {member.phone || 'No phone'} | ✉️ {member.email || 'No email'}
                                        </span>
                                        {(() => {
                                          const memberShifts = schedules.filter(s => s.date === activeDropDay && s.crewId === member.id && s.id !== editingShiftId && !s.isTimeOff);
                                          if (memberShifts.length === 0) return null;
                                          return (
                                            <div className="mt-1.5 flex flex-wrap gap-1">
                                              {memberShifts.map((s, idx) => (
                                                <span 
                                                  key={idx} 
                                                  className="inline-flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 font-extrabold uppercase text-[8px] tracking-wider px-1.5 py-0.5 rounded select-none"
                                                >
                                                  ⚡ {s.role || 'SHIFT'}: {s.time || formatTimeFrame(s.startHour, s.endHour)}
                                                </span>
                                              ))}
                                            </div>
                                          );
                                        })()}
                                        {isOverlapping && (
                                          <span className="text-[7.5px] text-red-400 font-bold block leading-tight mt-0.5">
                                            ⚠️ Overlaps: {overlaps[0].time}
                                          </span>
                                        )}
                                      </div>
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
                                            customized: !assignment.customized,
                                            timeFrames: prev[member.id].timeFrames || [{ startHour: assignment.startHour || dropStartHour || 12, endHour: assignment.endHour || dropEndHour || 17, role: assignment.role || dropRole || 'SERVER' }]
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
                                  <div className="mt-3 pt-3 border-t border-white/5 space-y-3 animate-[slideIn_0.15s_ease-out]">
                                    {(assignment.timeFrames || [{ startHour: assignment.startHour || dropStartHour || 12, endHour: assignment.endHour || dropEndHour || 17, role: assignment.role || dropRole || 'SERVER', tags: [] }]).map((tf, tfIdx) => {
                                      return (
                                        <div key={tfIdx} className="p-2.5 bg-white/[0.02] border border-white/5 rounded-lg space-y-2 relative">
                                          <div className="flex items-center justify-between">
                                            <span className="text-[9px] uppercase tracking-wider text-sky-400 font-extrabold">Time Frame {tfIdx + 1}</span>
                                            {(assignment.timeFrames || []).length > 1 && (
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  setSelectedCrewAssignments(prev => {
                                                    const currentMember = prev[member.id];
                                                    const currentTfs = currentMember.timeFrames || [{ startHour: currentMember.startHour, endHour: currentMember.endHour, role: currentMember.role }];
                                                    const newTfs = currentTfs.filter((_, i) => i !== tfIdx);
                                                    return {
                                                      ...prev,
                                                      [member.id]: {
                                                        ...currentMember,
                                                        timeFrames: newTfs
                                                      }
                                                    };
                                                  });
                                                }}
                                                className="text-white/40 hover:text-red-400 text-[9px] font-bold bg-transparent border-none cursor-pointer"
                                              >
                                                Remove
                                              </button>
                                            )}
                                          </div>

                                          <div className="grid grid-cols-2 gap-2">
                                            <div>
                                              <span className="text-[0.55rem] font-bold text-white/40 block mb-1 uppercase tracking-wider">Start Time</span>
                                              <select
                                                value={tf.startHour}
                                                onChange={(e) => {
                                                  const sh = parseFloat(e.target.value);
                                                  setSelectedCrewAssignments(prev => {
                                                    const currentMember = prev[member.id];
                                                    const currentTfs = currentMember.timeFrames || [{ startHour: currentMember.startHour, endHour: currentMember.endHour, role: currentMember.role }];
                                                    const newTfs = currentTfs.map((item, i) => {
                                                      if (i === tfIdx) {
                                                        const newEnd = item.endHour <= sh ? Math.min(24, sh + 1) : item.endHour;
                                                        return { ...item, startHour: sh, endHour: newEnd };
                                                      }
                                                      return item;
                                                    });
                                                    return {
                                                      ...prev,
                                                      [member.id]: {
                                                        ...currentMember,
                                                        timeFrames: newTfs
                                                      }
                                                    };
                                                  });
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
                                                value={tf.endHour}
                                                onChange={(e) => {
                                                  const eh = parseFloat(e.target.value);
                                                  setSelectedCrewAssignments(prev => {
                                                    const currentMember = prev[member.id];
                                                    const currentTfs = currentMember.timeFrames || [{ startHour: currentMember.startHour, endHour: currentMember.endHour, role: currentMember.role }];
                                                    const newTfs = currentTfs.map((item, i) => i === tfIdx ? { ...item, endHour: eh } : item);
                                                    return {
                                                      ...prev,
                                                      [member.id]: {
                                                        ...currentMember,
                                                        timeFrames: newTfs
                                                      }
                                                    };
                                                  });
                                                }}
                                                className="w-full px-2 py-1 bg-black border border-white/10 text-[10px] text-white rounded outline-none font-bold cursor-pointer"
                                              >
                                                {generateTimeOptions().filter(opt => opt.value > tf.startHour).map(opt => (
                                                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                              </select>
                                            </div>
                                          </div>

                                          <div>
                                            <span className="text-[0.55rem] font-bold text-white/40 block mb-1 uppercase tracking-wider">Specific Role / Duty</span>
                                            <select
                                              value={tf.role || 'SERVER'}
                                              onChange={(e) => {
                                                const r = e.target.value;
                                                setSelectedCrewAssignments(prev => {
                                                  const currentMember = prev[member.id];
                                                  const currentTfs = currentMember.timeFrames || [{ startHour: currentMember.startHour, endHour: currentMember.endHour, role: currentMember.role }];
                                                  const newTfs = currentTfs.map((item, i) => i === tfIdx ? { ...item, role: r } : item);
                                                  return {
                                                    ...prev,
                                                    [member.id]: {
                                                      ...currentMember,
                                                      timeFrames: newTfs
                                                    }
                                                  };
                                                });
                                              }}
                                              className="w-full px-2 py-1 bg-black border border-white/10 text-[10px] text-white rounded outline-none font-bold uppercase tracking-wide font-sans cursor-pointer"
                                            >
                                              <option value="BAND SETUP">🎸 Band Setup</option>
                                              <option value="MERCH TABLE">🛍️ Merch Table</option>
                                              <option value="STAGE HAND">🔧 Stage Hand</option>
                                              <option value="TEAR DOWN">📦 Tear Down</option>
                                              <option value="AUDIO MIX">🎛️ Audio Mix</option>
                                              <option value="LIGHTS">💡 Lights</option>
                                              <option value="CAMERA">🎥 Camera</option>
                                              <option value="UNLOADING">🚚 Unloading</option>
                                              <option value="SERVER">🍽️ Server</option>
                                              <option value="CHEF">👨‍🍳 Chef</option>
                                              <option value="LINE COOK">🍳 Line Cook</option>
                                              <option value="MANAGER">💼 Manager</option>
                                              <option value="BUSSER">🧹 Busser</option>
                                            </select>
                                          </div>
                                          
                                          <div>
                                            <span className="text-[0.55rem] font-bold text-white/40 block mb-1 uppercase tracking-wider">Tags</span>
                                            <div className="relative">
                                              <select
                                                value=""
                                                onChange={(e) => {
                                                  const val = e.target.value;
                                                  if (!val) return;
                                                  setSelectedCrewAssignments(prev => {
                                                    const currentMember = prev[member.id];
                                                    const currentTfs = currentMember.timeFrames || [{ startHour: currentMember.startHour, endHour: currentMember.endHour, role: currentMember.role, tags: [] }];
                                                    const newTfs = currentTfs.map((item, i) => {
                                                      if (i === tfIdx) {
                                                        const currentTags = item.tags || [];
                                                        const newTags = currentTags.includes(val)
                                                          ? currentTags.filter(t => t !== val)
                                                          : [...currentTags, val];
                                                        return { ...item, tags: newTags };
                                                      }
                                                      return item;
                                                    });
                                                    return {
                                                      ...prev,
                                                      [member.id]: {
                                                        ...currentMember,
                                                        timeFrames: newTfs
                                                      }
                                                    };
                                                  });
                                                }}
                                                className="w-full px-2 py-1 bg-black border border-white/10 text-[10px] text-white rounded outline-none font-bold cursor-pointer"
                                              >
                                                <option value="">Select tags...</option>
                                                <option value="Overtime">⏰ Overtime</option>
                                                <option value="Double Shift">⚡ Double Shift</option>
                                                <option value="Split Shift">🔄 Split Shift</option>
                                                <option value="Standby">📡 Standby</option>
                                                <option value="Backup">🛡️ Backup</option>
                                                <option value="Training">🎓 Training</option>
                                              </select>
                                            </div>
                                            {tf.tags && tf.tags.length > 0 && (
                                              <div className="flex flex-wrap gap-1 mt-1.5">
                                                {tf.tags.map(tag => (
                                                  <span 
                                                    key={tag}
                                                    className="inline-flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 font-extrabold uppercase text-[7.5px] tracking-wider px-1.5 py-0.2 rounded"
                                                  >
                                                    {tag}
                                                    <button
                                                      type="button"
                                                      onClick={() => {
                                                        setSelectedCrewAssignments(prev => {
                                                          const currentMember = prev[member.id];
                                                          const currentTfs = currentMember.timeFrames || [{ startHour: currentMember.startHour, endHour: currentMember.endHour, role: currentMember.role, tags: [] }];
                                                          const newTfs = currentTfs.map((item, i) => {
                                                            if (i === tfIdx) {
                                                              return { ...item, tags: (item.tags || []).filter(t => t !== tag) };
                                                            }
                                                            return item;
                                                          });
                                                          return {
                                                            ...prev,
                                                            [member.id]: {
                                                              ...currentMember,
                                                              timeFrames: newTfs
                                                            }
                                                          };
                                                        });
                                                      }}
                                                      className="hover:text-white bg-transparent border-none p-0 cursor-pointer text-[7.5px]"
                                                    >
                                                      ✕
                                                    </button>
                                                  </span>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}

                                    {/* Add timeframe button for customized member */}
                                    {(assignment.timeFrames || []).length < 3 && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setSelectedCrewAssignments(prev => {
                                            const currentMember = prev[member.id];
                                            const currentTfs = currentMember.timeFrames || [{ startHour: currentMember.startHour, endHour: currentMember.endHour, role: currentMember.role, tags: [] }];
                                            const newTfs = [...currentTfs, { startHour: 12, endHour: 17, role: 'SERVER', tags: [] }];
                                            return {
                                              ...prev,
                                              [member.id]: {
                                                ...currentMember,
                                                timeFrames: newTfs
                                              }
                                            };
                                          });
                                        }}
                                        className="w-full py-1.5 bg-sky-500/10 border border-dashed border-sky-500/30 hover:bg-sky-500/20 text-sky-400 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1"
                                      >
                                        ➕ Add Time Frame ({(assignment.timeFrames || []).length}/3)
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    </div>
                    )}

                    {/* Form Fields block */}
                    <div className="space-y-4 shrink-0 mt-2 pr-1">
                      {showFormDetails && (
                        <div className="space-y-4">
                          {dropTimeFrames.map((tf, index) => (
                            <div key={index} className="p-3.5 bg-black/40 border border-white/10 rounded-xl space-y-3 relative animate-[fadeIn_0.2s_ease]">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] uppercase tracking-[0.15em] text-amber-400 font-extrabold">Time Frame {index + 1}</span>
                                {dropTimeFrames.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setDropTimeFrames(prev => prev.filter((_, i) => i !== index));
                                    }}
                                    className="text-white/40 hover:text-red-400 text-[10px] font-extrabold bg-transparent border-none cursor-pointer uppercase tracking-wider"
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="text-[0.6rem] uppercase tracking-[0.15em] text-white/40 mb-1 block font-bold">Start Time</label>
                                  <select
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
                                    className="w-full px-3 py-1.5 bg-black border border-white/10 text-xs text-white rounded-lg outline-none focus:border-amber-500/50 transition-colors font-bold cursor-pointer"
                                  >
                                    {generateTimeOptions().slice(0, -1).map(opt => (
                                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                  </select>
                                </div>

                                <div>
                                  <label className="text-[0.6rem] uppercase tracking-[0.15em] text-white/40 mb-1 block font-bold">End Time</label>
                                  <select
                                    value={tf.endHour}
                                    onChange={(e) => {
                                      const val = parseFloat(e.target.value);
                                      setDropTimeFrames(prev => prev.map((item, i) => i === index ? { ...item, endHour: val } : item));
                                    }}
                                    className="w-full px-3 py-1.5 bg-black border border-white/10 text-xs text-white rounded-lg outline-none focus:border-amber-500/50 transition-colors font-bold cursor-pointer"
                                  >
                                    {generateTimeOptions().filter(opt => opt.value > tf.startHour).map(opt => (
                                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[0.6rem] uppercase tracking-[0.15em] text-white/40 mb-1 block font-bold font-sans">Role / Duty</label>
                                <input
                                  type="text"
                                  value={tf.role}
                                  onChange={e => {
                                    const val = e.target.value;
                                    setDropTimeFrames(prev => prev.map((item, i) => i === index ? { ...item, role: val } : item));
                                  }}
                                  placeholder="e.g. Audio Mix"
                                  className="w-full px-3 py-2 bg-black border border-white/10 text-xs text-white rounded-lg outline-none focus:border-amber-500/50 transition-colors font-bold uppercase tracking-wider font-sans"
                                />
                                <div className="flex flex-wrap gap-1 mt-1.5">
                                  {["UNLOADING", "BAND SETUP", "AUDIO MIX", "CAMERA", "SERVER", "CHEF", "TEAR DOWN", "MANAGER"].map(preset => (
                                    <button
                                      key={preset}
                                      type="button"
                                      onClick={() => {
                                        setDropTimeFrames(prev => prev.map((item, i) => i === index ? { ...item, role: preset } : item));
                                      }}
                                      className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
                                        tf.role.toUpperCase() === preset 
                                          ? 'bg-amber-500 text-black border-amber-500 font-black' 
                                          : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
                                      }`}
                                    >
                                      {preset}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[0.6rem] uppercase tracking-[0.15em] text-white/40 mb-1 block font-bold font-sans">Tags</label>
                                <div className="relative">
                                  <select
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
                                    className="w-full px-3 py-1.5 bg-black border border-white/10 text-xs text-white rounded-lg outline-none focus:border-amber-500/50 transition-colors font-bold cursor-pointer appearance-none"
                                  >
                                    <option value="">Select tags...</option>
                                    <option value="Overtime">⏰ Overtime</option>
                                    <option value="Double Shift">⚡ Double Shift</option>
                                    <option value="Split Shift">🔄 Split Shift</option>
                                    <option value="Standby">📡 Standby</option>
                                    <option value="Backup">🛡️ Backup</option>
                                    <option value="Training">🎓 Training</option>
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
                                        className="inline-flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 font-extrabold uppercase text-[8px] tracking-wider px-2 py-0.5 rounded"
                                      >
                                        {tag}
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setDropTimeFrames(prev => prev.map((item, i) => {
                                              if (i === index) {
                                                return { ...item, tags: (item.tags || []).filter(t => t !== tag) };
                                              }
                                              return item;
                                            }));
                                          }}
                                          className="hover:text-white bg-transparent border-none p-0 cursor-pointer text-[8px]"
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
                                setDropTimeFrames(prev => [...prev, { startHour: 12, endHour: 17, role: 'SERVER', tags: [] }]);
                              }}
                              className="w-full py-2 bg-amber-500/10 border border-dashed border-amber-500/30 hover:bg-amber-500/20 text-amber-400 rounded-lg text-xs font-black uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              ➕ Add Time Frame ({dropTimeFrames.length}/3)
                            </button>
                          )}
                        </div>
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
                              .filter(show => !show.date || show.date >= new Date().toISOString().split('T')[0])
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
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[0.6rem] uppercase tracking-[0.15em] text-white/40 font-bold">Shift Notes</label>
                        <span className="text-[10px] font-mono text-white/40">{350 - dropNotes.length}</span>
                      </div>
                      <textarea
                        rows={3}
                        maxLength={350}
                        value={dropNotes}
                        onChange={e => setDropNotes(e.target.value.slice(0, 350))}
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
                                      <select
                                        value={setting.role || 'SERVER'}
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
                                        className="px-1.5 py-1 bg-black border border-white/10 text-[9px] text-white rounded outline-none font-bold uppercase w-[85px] tracking-wide cursor-pointer"
                                      >
                                        <option value="BAND SETUP">🎸 Setup</option>
                                        <option value="MERCH TABLE">🛍️ Merch</option>
                                        <option value="STAGE HAND">🔧 Hand</option>
                                        <option value="TEAR DOWN">📦 Tear</option>
                                        <option value="AUDIO MIX">🎛️ Audio</option>
                                        <option value="LIGHTS">💡 Lights</option>
                                        <option value="CAMERA">🎥 Camera</option>
                                        <option value="UNLOADING">🚚 Unload</option>
                                        <option value="SERVER">🍽️ Server</option>
                                        <option value="CHEF">👨‍🍳 Chef</option>
                                        <option value="LINE COOK">🍳 Cook</option>
                                        <option value="MANAGER">💼 Mngr</option>
                                        <option value="BUSSER">🧹 Busser</option>
                                        {setting.role && ![
                                          "BAND SETUP", "MERCH TABLE", "STAGE HAND", "TEAR DOWN",
                                          "AUDIO MIX", "LIGHTS", "CAMERA", "UNLOADING",
                                          "SERVER", "CHEF", "LINE COOK", "MANAGER", "BUSSER"
                                        ].includes(setting.role.toUpperCase()) && (
                                          <option value={setting.role}>{setting.role.slice(0,6)}</option>
                                        )}
                                      </select>
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
      `}</style>
      


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

            <div className="flex flex-col gap-8 w-full mt-8">
              <div className="flex flex-col gap-8 w-full">


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
                case 'awardpicks': component = renderAwardPicks(); break;
              }

              return (
                <div key={key} id={"admin-sec-" + key} {...dragProps}>
                  {component}
                </div>
              );
            })}

          </div>

          <div className="flex flex-col gap-8 w-full">
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
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white/80 leading-relaxed mb-1">{entry.text}</p>
                      
                      {entry.details && (
                        <div className="mt-1 mb-2">
                          <button
                            type="button"
                            onClick={() => setExpandedAuditId(prev => prev === entry.id ? null : entry.id)}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[9px] font-bold text-white/60 hover:text-white transition-all cursor-pointer"
                          >
                            {expandedAuditId === entry.id ? 'Hide Details ✕' : 'View Message Content 🔍'}
                          </button>

                          {expandedAuditId === entry.id && (
                            <div className="mt-2 p-3 bg-black/40 border border-white/10 rounded-xl space-y-3 text-xs text-white/80 animate-[slideDown_0.2s_ease-out] max-w-full md:max-w-[650px] overflow-hidden">
                              {entry.details.type === 'signin' && (
                                <div className="space-y-1.5 font-sans">
                                  <div className="flex justify-between border-b border-white/5 pb-1">
                                    <span className="text-white/40 font-bold uppercase text-[9px] tracking-wider">User</span>
                                    <span className="font-mono text-emerald-400 font-bold">{entry.details.username}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-white/40 font-bold uppercase text-[9px] tracking-wider">IP Address</span>
                                    <span className="font-mono text-white/70">{entry.details.ipAddress}</span>
                                  </div>
                                </div>
                              )}

                              {entry.details.smsText && (
                                <div className="space-y-1.5">
                                  <span className="text-white/40 font-bold uppercase text-[9px] tracking-wider block">📱 SMS Message Body</span>
                                  <div className="bg-black/60 border border-white/5 rounded-lg p-2.5 font-mono text-[10px] whitespace-pre-wrap leading-relaxed text-amber-300">
                                    {entry.details.smsText}
                                  </div>
                                </div>
                              )}

                              {entry.details.emailHtml && (
                                <div className="space-y-2">
                                  <div className="border-b border-white/5 pb-1">
                                    <span className="text-white/40 font-bold uppercase text-[9px] tracking-wider block mb-1">✉️ Email Template</span>
                                    <span className="text-[10px] text-white/90 font-bold">Subject: {entry.details.emailSubject}</span>
                                  </div>
                                  
                                  <div className="space-y-1.5">
                                    <span className="text-white/40 font-bold uppercase text-[9px] tracking-wider block">Visual Template Render</span>
                                    <div className="bg-[#0f0f13] border border-white/5 rounded-lg overflow-hidden p-0.5">
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
                                        className="w-full h-[180px] border-none bg-[#0f0f13]"
                                        title="Email Preview"
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

      {selectedQrProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-[fadeIn_0.2s_ease-out] no-print">
          <style dangerouslySetInnerHTML={{ __html: `
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

          <div className="bg-[#0f0f13] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-[scaleIn_0.2s_ease-out]">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                  Print Merchandise QR Code
                </h3>
                <p className="text-xs text-white/40 mt-1">Generate printable retail labels for the merch table</p>
              </div>
              <button 
                onClick={() => setSelectedQrProduct(null)} 
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 custom-scrollbar">
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-accent)] mb-4">1. Select Target Destination</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[0.65rem] font-bold text-white/60 uppercase tracking-widest mb-1.5">Link Destination Type</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setQrLinkType('product')}
                          className={`px-3 py-2 text-xs font-bold uppercase tracking-wider border rounded-lg transition-all cursor-pointer ${
                            qrLinkType === 'product'
                              ? 'bg-[var(--color-accent)]/15 border-[var(--color-accent)] text-[var(--color-accent)]'
                              : 'bg-black/20 border-white/10 text-white/40 hover:text-white/60 hover:border-white/20'
                          }`}
                        >
                          Product Detail Page
                        </button>
                        <button
                          type="button"
                          onClick={() => setQrLinkType('checkout')}
                          disabled={!selectedQrProduct.variants || selectedQrProduct.variants.length === 0}
                          className={`px-3 py-2 text-xs font-bold uppercase tracking-wider border rounded-lg transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none ${
                            qrLinkType === 'checkout'
                              ? 'bg-[var(--color-accent)]/15 border-[var(--color-accent)] text-[var(--color-accent)]'
                              : 'bg-black/20 border-white/10 text-white/40 hover:text-white/60 hover:border-white/20'
                          }`}
                        >
                          Direct Add to Cart
                        </button>
                      </div>
                    </div>

                    {selectedQrProduct.variants && selectedQrProduct.variants.length > 0 && (
                      <div>
                        <label className="block text-[0.65rem] font-bold text-white/60 uppercase tracking-widest mb-1.5">
                          {qrLinkType === 'checkout' ? 'Product Variant (Required)' : 'Product Variant (Optional)'}
                        </label>
                        <select
                          value={selectedQrVariant ? selectedQrProduct.variants.findIndex((v: any) => v.id === selectedQrVariant.id) : '-1'}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setSelectedQrVariant(val === -1 ? null : selectedQrProduct.variants[val]);
                          }}
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[var(--color-accent)]/50"
                        >
                          {qrLinkType === 'product' && <option value="-1">All Variants (Standard Detail Page)</option>}
                          {selectedQrProduct.variants.map((v: any, index: number) => (
                            <option key={index} value={index}>
                              {v.title} — ${v.price.toFixed(2)}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-accent)] mb-4">2. Customize Tag Label</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[0.65rem] font-bold text-white/60 uppercase tracking-widest mb-1.5">Sub-label Text</label>
                      <input
                        type="text"
                        value={qrSubtitle}
                        onChange={(e) => setQrSubtitle(e.target.value)}
                        placeholder="Official Merchandise"
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[var(--color-accent)]/50"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-black/20 border border-white/5 rounded-xl">
                      <div>
                        <p className="text-xs font-bold text-white">Show Price Tag</p>
                        <p className="text-[0.6rem] text-white/40">Include product price at the bottom of the card</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setQrIncludePrice(!qrIncludePrice)}
                        className={`w-10 h-6 rounded-full p-1 transition-colors cursor-pointer ${qrIncludePrice ? 'bg-[var(--color-accent)]' : 'bg-white/10'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${qrIncludePrice ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl text-[0.65rem] leading-relaxed text-white/60">
                  <span className="text-amber-400 font-bold block mb-1">💡 Pro-Tip for Merch Tables</span>
                  Generate a **Direct Add to Cart** QR code for each specific size (e.g. Medium vs. Large). When fans scan it, the item is instantly added to their Shopify cart for immediate checkout, keeping the queue moving fast!
                </div>
              </div>

              <div className="flex flex-col items-center justify-center bg-black/30 border border-white/5 rounded-2xl p-6 md:p-8">
                <p className="text-[0.65rem] font-bold uppercase tracking-widest text-white/30 mb-4">Live Tag Print Preview (4&quot; × 6&quot;)</p>
                
                <div className="print-tag-container">
                  <div className="print-tag-card bg-white text-black p-8 flex flex-col items-center justify-between border-2 border-dashed border-black/40 rounded-lg w-[260px] h-[390px] shadow-lg">
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

                    <div className="p-3 bg-white border border-black/10 rounded-xl flex items-center justify-center">
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
                className="px-6 py-3 bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/90 text-white text-[0.65rem] font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_4px_15px_rgba(133,29,239,0.3)] border border-[var(--color-accent)]/30 flex items-center gap-2 cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                Print Label
              </button>
            </div>
          </div>
        </div>
      )}
      {activeToast && (
        <div className="fixed bottom-6 right-6 z-[9999] bg-[#14141c] border border-emerald-500/30 text-white px-5 py-4 rounded-xl shadow-2xl flex items-start gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="text-xl">🛍️</div>
          <div>
            <p className="text-xs font-black text-emerald-400 uppercase tracking-widest">{activeToast.title}</p>
            <p className="text-sm text-white/90 font-medium mt-0.5">{activeToast.message}</p>
          </div>
        </div>
      )}

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
            <span>{sidebarMode === 'jump' || adminTab !== 'band' ? 'Jump To Section' : 'Organize Layout'}</span>
            <button
              onClick={toggleJumpNav}
              title="Hide Navigation"
              className="text-white/40 hover:text-white transition-colors cursor-pointer border-none bg-transparent flex items-center justify-center p-0 ml-1 text-[10px]"
            >
              ✕
            </button>
          </div>
          {adminTab === 'band' && (
            <div className="flex bg-white/5 rounded-lg p-0.5 mb-2 border border-white/5 shrink-0 select-none">
              <button
                type="button"
                onClick={() => setSidebarMode('jump')}
                className={`flex-1 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md text-center transition-all border-none bg-transparent cursor-pointer ${sidebarMode === 'jump' ? 'bg-white/10 text-white shadow-sm font-black' : 'text-white/40 hover:text-white'}`}
              >
                Navigate
              </button>
              <button
                type="button"
                onClick={() => setSidebarMode('organize')}
                className={`flex-1 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md text-center transition-all border-none bg-transparent cursor-pointer ${sidebarMode === 'organize' ? 'bg-white/10 text-white shadow-sm font-black' : 'text-white/40 hover:text-white'}`}
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
                        announcements: { label: 'Band Announcements', icon: '📡' },
                        calendar: { label: 'Crew Schedule', icon: '📅' },
                        analytics: { label: 'Google Analytics', icon: '📊' },
                        shopify: { label: 'Shopify Store', icon: '🛒' },
                        bookings: { label: 'Booking Requests', icon: '📅' },
                        planners: { label: 'Planners Directory', icon: '👥' },
                        cruisesignups: { label: 'Cruise Signups', icon: '🚢' },
                        livealerts: { label: 'Live Alerts', icon: '🚨' },
                        smsblast: { label: 'SMS Blast', icon: '💬' },
                        crewsms: { label: 'Crew SMS', icon: '👥' },
                        bandsms: { label: 'Band Member SMS Text', icon: '💬' },
                        newsletter: { label: 'Newsletter', icon: '✉️' },
                        emailflow: { label: 'Email Template Flows', icon: '✉️' },
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
                    <div className="text-[10px] text-white/30 mb-2 px-1.5 leading-normal italic select-none">
                      Drag sections below to reorder layout:
                    </div>
                    {sectionOrder.map((key, index) => {
                      const labelMap: Record<string, { label: string; icon: string }> = {
                        announcements: { label: 'Band Announcements', icon: '📡' },
                        calendar: { label: 'Crew Schedule', icon: '📅' },
                        analytics: { label: 'Google Analytics', icon: '📊' },
                        shopify: { label: 'Shopify Store', icon: '🛒' },
                        bookings: { label: 'Booking Requests', icon: '📅' },
                        planners: { label: 'Planners Directory', icon: '👥' },
                        cruisesignups: { label: 'Cruise Signups', icon: '🚢' },
                        livealerts: { label: 'Live Alerts', icon: '🚨' },
                        smsblast: { label: 'SMS Blast', icon: '💬' },
                        crewsms: { label: 'Crew SMS', icon: '👥' },
                        bandsms: { label: 'Band Member SMS Text', icon: '💬' },
                        newsletter: { label: 'Newsletter', icon: '✉️' },
                        emailflow: { label: 'Email Template Flows', icon: '✉️' },
                        registry: { label: 'Fan Registry', icon: '📝' },
                        crewcreation: { label: 'Crew Management', icon: '🛠️' },
                        admincreation: { label: 'Admin Management', icon: '🔐' },
                        bulkinvites: { label: 'Bulk Invites', icon: '📨' },
                        awardpicks: { label: 'Award Picks', icon: '🏅' }
                      };
                      const section = labelMap[key] || { label: key, icon: '⚙️' };
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
                          className={`py-1.5 px-2 hover:bg-white/5 text-white/70 hover:text-white transition-all rounded font-medium truncate flex items-center gap-2 cursor-grab active:cursor-grabbing border border-transparent select-none ${draggedIndex === index ? 'border-dashed border-[var(--color-accent)]/50 opacity-40 bg-white/5 shadow-inner' : ''}`}
                        >
                          <span className="text-white/20 select-none">☰</span>
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
      </div>
    </div>
  );
}