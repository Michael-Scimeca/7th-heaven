"use client";

import React, { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
  Handle,
  NodeProps,
  Edge,
  Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import {
  Globe,
  Radio,
  Sparkles,
  Lock,
  ShieldCheck,
  Terminal,
  Mail,
  UserCheck,
  CheckCircle2,
  Calendar,
  CreditCard,
  X,
  ExternalLink,
  ArrowRight,
  Info,
  Layers,
  Key,
  HelpCircle,
  FileCode,
  Bell,
  RefreshCw,
  ShoppingBag,
  Film,
} from "lucide-react";

// --- Color System Matching admin/email-map ---
const COLOR_SCHEMES = {
  purple: {
    border: "border-purple-500/40 hover:border-purple-400",
    bg: "bg-[#120a21]/90",
    text: "text-purple-300",
    badge: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    glow: "shadow-[0_0_20px_rgba(168,85,247,0.25)]",
    lineColor: "#a855f7",
    dot: "bg-purple-500",
  },
  cyan: {
    border: "border-cyan-500/40 hover:border-cyan-400",
    bg: "bg-[#061824]/90",
    text: "text-cyan-300",
    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    glow: "shadow-[0_0_20px_rgba(6,182,212,0.25)]",
    lineColor: "#06b6d4",
    dot: "bg-cyan-500",
  },
  emerald: {
    border: "border-emerald-500/40 hover:border-emerald-400",
    bg: "bg-[#062017]/90",
    text: "text-emerald-300",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    glow: "shadow-[0_0_20px_rgba(16,185,129,0.25)]",
    lineColor: "#10b981",
    dot: "bg-emerald-500",
  },
  red: {
    border: "border-red-500/40 hover:border-red-400",
    bg: "bg-[#220a0a]/90",
    text: "text-red-300",
    badge: "bg-red-500/20 text-red-300 border-red-500/30",
    glow: "shadow-[0_0_20px_rgba(239,68,68,0.25)]",
    lineColor: "#ef4444",
    dot: "bg-red-500",
  },
};

// Node Payload Data Structure
export interface FlowNodeData {
  label: string;
  sub: string;
  system: "purple" | "cyan" | "emerald" | "red";
  kind: "nav" | "page" | "api" | "email" | "component";
  iconName: string;
  details?: {
    summary: string;
    endpointOrPath?: string;
    payloadOrParams?: string;
    emailSubject?: string;
    dbActions?: string[];
  };
}

// Icon Resolver Mapping
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  globe: Globe,
  sparkles: Sparkles,
  terminal: Terminal,
  mail: Mail,
  user: UserCheck,
  check: CheckCircle2,
  lock: Lock,
  shield: ShieldCheck,
  calendar: Calendar,
  credit: CreditCard,
  layers: Layers,
  key: Key,
  bell: Bell,
  shopping: ShoppingBag,
  radio: Radio,
  film: Film,
};

// --- CUSTOM REACT FLOW NODE COMPONENTS ---

// 1. Top Navigation Page Node (Highlighted Top Banner Card)
function NavFlowNode({ data }: NodeProps<Node<FlowNodeData>>) {
  const scheme = COLOR_SCHEMES[data.system || "purple"];
  const IconComp = ICON_MAP[data.iconName] || Globe;

  return (
    <div
      className={`group relative rounded-2xl border-2 ${scheme.border} bg-gradient-to-b from-black via-black/90 to-[#120a21] ${scheme.glow} p-4 w-64 backdrop-blur-xl transition-all duration-300 cursor-pointer hover:scale-[1.04] select-none text-center shadow-2xl`}
    >
      <div className="flex items-center justify-between gap-1 mb-1.5 border-b border-white/10 pb-1.5">
        <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[9px] font-mono font-black uppercase tracking-widest">
          TOP NAV PAGE
        </span>
        <span className={`w-2 h-2 rounded-full ${scheme.dot}`} />
      </div>

      <div className="flex items-center justify-center gap-2 my-1">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border border-white/10 ${scheme.badge}`}>
          <IconComp className="w-4 h-4 text-white" />
        </div>
        <h3 className="font-black text-sm text-white uppercase tracking-wider">
          {data.label}
        </h3>
      </div>

      <code className="text-[10px] font-mono text-cyan-300 block truncate">
        {data.sub}
      </code>

      <Handle type="source" position={Position.Bottom} className="!w-3.5 !h-3.5 !bg-purple-400 !border-2 !border-black" />
    </div>
  );
}

// 2. Standard Page / Component / API Node
function CustomFlowNode({ data }: NodeProps<Node<FlowNodeData>>) {
  const scheme = COLOR_SCHEMES[data.system || "purple"];
  const IconComp = ICON_MAP[data.iconName] || Globe;

  return (
    <div
      className={`group relative rounded-2xl border ${scheme.border} ${scheme.bg} ${scheme.glow} p-3.5 w-64 backdrop-blur-xl transition-all duration-300 cursor-pointer hover:scale-[1.03] select-none`}
    >
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-purple-400 !border-2 !border-black" />
      
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border border-white/10 ${scheme.badge}`}>
          <IconComp className="w-4 h-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider ${scheme.badge}`}>
              {data.kind.toUpperCase()}
            </span>
            <span className={`w-1.5 h-1.5 rounded-full ${scheme.dot}`} />
          </div>

          <h4 className="font-black text-xs text-white uppercase tracking-wider truncate">
            {data.label}
          </h4>

          <code className="text-[10px] font-mono text-cyan-300/80 block truncate mt-0.5">
            {data.sub}
          </code>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-cyan-400 !border-2 !border-black" />
    </div>
  );
}

// 3. Distinct Email Touchpoint Node (Dashed border, Envelope Badge)
function EmailFlowNode({ data }: NodeProps<Node<FlowNodeData>>) {
  const scheme = COLOR_SCHEMES[data.system || "purple"];
  const IconComp = ICON_MAP[data.iconName] || Mail;

  return (
    <div
      className={`group relative rounded-2xl border-2 border-dashed ${scheme.border} ${scheme.bg} ${scheme.glow} p-3.5 w-64 backdrop-blur-xl transition-all duration-300 cursor-pointer hover:scale-[1.03] select-none`}
    >
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-cyan-400 !border-2 !border-black" />

      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]">
          <IconComp className="w-4 h-4 animate-pulse" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[8px] font-mono font-black uppercase tracking-widest">
              ✉ EMAIL
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          </div>

          <h4 className="font-black text-xs text-white uppercase tracking-wider truncate">
            {data.label}
          </h4>

          {data.details?.emailSubject && (
            <p className="text-[9px] italic text-amber-200/90 truncate mt-0.5">
              &quot;{data.details.emailSubject}&quot;
            </p>
          )}

          <code className="text-[9px] font-mono text-white/40 block truncate mt-0.5">
            {data.sub}
          </code>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-amber-400 !border-2 !border-black" />
    </div>
  );
}

const nodeTypes = {
  navNode: NavFlowNode,
  customNode: CustomFlowNode,
  emailNode: EmailFlowNode,
};

// --- ONE TOP LINE OF NAV PAGES + VERTICAL USER JOURNEYS UNDERNEATH ---

const INITIAL_NODES: Node<FlowNodeData>[] = [
  // =========================================================================
  // ROW 0 (Y = 40): ONE TOP HORIZONTAL LINE OF MAIN NAVIGATION PAGES
  // =========================================================================
  {
    id: "nav-home",
    type: "navNode",
    position: { x: 0, y: 40 },
    data: { label: "Home", sub: "/", system: "purple", kind: "nav", iconName: "globe", details: { summary: "Official 7th Heaven Homepage & Root Entry Point", endpointOrPath: "/" } },
  },
  {
    id: "nav-shows",
    type: "navNode",
    position: { x: 300, y: 40 },
    data: { label: "Shows & Concerts", sub: "/shows/past", system: "purple", kind: "nav", iconName: "calendar", details: { summary: "Tour Dates, Concerts Archive & Booking Forms", endpointOrPath: "/shows/past" } },
  },
  {
    id: "nav-fans",
    type: "navNode",
    position: { x: 600, y: 40 },
    data: { label: "Fan Club", sub: "/fans", system: "purple", kind: "nav", iconName: "user", details: { summary: "Fan Member Dashboard, Photo Wall & Pick Lottery", endpointOrPath: "/fans" } },
  },
  {
    id: "nav-merch",
    type: "navNode",
    position: { x: 900, y: 40 },
    data: { label: "Merchandise", sub: "/merch", system: "emerald", kind: "nav", iconName: "shopping", details: { summary: "Official Band Store & Venue QR Scanner", endpointOrPath: "/merch" } },
  },
  {
    id: "nav-cruise",
    type: "navNode",
    position: { x: 1200, y: 40 },
    data: { label: "Cruise 2026", sub: "/cruise", system: "cyan", kind: "nav", iconName: "sparkles", details: { summary: "Caribbean Fan Cruise Registration & Hub", endpointOrPath: "/cruise" } },
  },
  {
    id: "nav-live",
    type: "navNode",
    position: { x: 1750, y: 40 },
    data: { label: "Live Cams", sub: "/live", system: "red", kind: "nav", iconName: "radio", details: { summary: "Live Multi-Cam Concert Broadcast Room", endpointOrPath: "/live" } },
  },
  {
    id: "nav-admin",
    type: "navNode",
    position: { x: 2050, y: 40 },
    data: { label: "Crew & Admin", sub: "/admin", system: "red", kind: "nav", iconName: "shield", details: { summary: "Band Leadership & Road Crew Dashboards", endpointOrPath: "/admin" } },
  },

  // =========================================================================
  // COLUMN 1 (UNDER HOME): GENERAL PASSWORDLESS LOGIN FLOW (LoginModal.tsx)
  // =========================================================================
  {
    id: "f3-1",
    type: "customNode",
    position: { x: 0, y: 190 },
    data: {
      label: "Login Modal",
      sub: "LoginModal.tsx (Enter Email)",
      system: "purple",
      kind: "component",
      iconName: "user",
      details: { summary: "User clicks Sign In on Home or Header. Opens authentication modal.", endpointOrPath: "src/components/LoginModal.tsx" },
    },
  },
  {
    id: "f3-2",
    type: "customNode",
    position: { x: 0, y: 330 },
    data: {
      label: "POST Send Auth PIN",
      sub: "/api/auth/send-pin",
      system: "purple",
      kind: "api",
      iconName: "terminal",
      details: { summary: "Generates 6-digit authentication PIN with dev bypass via fake-logins.json outside production.", endpointOrPath: "/api/auth/send-pin" },
    },
  },
  {
    id: "f3-3",
    type: "emailNode",
    position: { x: 0, y: 470 },
    data: {
      label: "Auth PIN Email",
      sub: "sendAuthPin",
      system: "purple",
      kind: "email",
      iconName: "mail",
      details: { summary: "Sends 6-digit verification code email.", emailSubject: "🔑 Your 7th Heaven Verification Code", endpointOrPath: "src/lib/email-templates.ts -> sendAuthPin" },
    },
  },
  {
    id: "f3-4",
    type: "customNode",
    position: { x: 0, y: 610 },
    data: {
      label: "Enter PIN in Modal",
      sub: "LoginModal.tsx (Verify PIN)",
      system: "purple",
      kind: "component",
      iconName: "key",
      details: { summary: "User inputs 6-digit PIN into modal digit boxes.", endpointOrPath: "src/components/LoginModal.tsx" },
    },
  },
  {
    id: "f3-5",
    type: "customNode",
    position: { x: 0, y: 750 },
    data: {
      label: "POST Verify Auth PIN",
      sub: "/api/auth/verify-pin",
      system: "purple",
      kind: "api",
      iconName: "terminal",
      details: { summary: "Verifies PIN match, generates Supabase session tokens, and returns member profile role.", endpointOrPath: "/api/auth/verify-pin" },
    },
  },
  {
    id: "f3-6",
    type: "customNode",
    position: { x: 0, y: 890 },
    data: {
      label: "Role Destination",
      sub: "/fans | /crew | /planner",
      system: "purple",
      kind: "page",
      iconName: "user",
      details: { summary: "Session created. User is redirected to their specific role dashboard.", endpointOrPath: "Role-based destination" },
    },
  },

  // =========================================================================
  // COLUMN 2 (UNDER SHOWS): SHOW DETAIL & BOOKING FLOW
  // =========================================================================
  {
    id: "f-shows-1",
    type: "customNode",
    position: { x: 300, y: 190 },
    data: {
      label: "Show Detail Page",
      sub: "/shows/[id]",
      system: "purple",
      kind: "page",
      iconName: "globe",
      details: { summary: "Individual concert page showing setlists, venue maps, and ticket links.", endpointOrPath: "/shows/075144a7-588c-4d9a-a8b5-b44bca910b90" },
    },
  },
  {
    id: "f-shows-2",
    type: "customNode",
    position: { x: 300, y: 330 },
    data: {
      label: "Booking Form",
      sub: "/book",
      system: "emerald",
      kind: "page",
      iconName: "calendar",
      details: { summary: "Request 7th Heaven for festival, private party, corporate event, or venue bookings.", endpointOrPath: "/book" },
    },
  },
  {
    id: "f-shows-3",
    type: "customNode",
    position: { x: 300, y: 470 },
    data: {
      label: "POST Submit Booking",
      sub: "/api/booking/submit",
      system: "emerald",
      kind: "api",
      iconName: "terminal",
      details: { summary: "Validates booking details and inserts inquiry into Supabase booking requests table.", endpointOrPath: "/api/booking/submit" },
    },
  },
  {
    id: "f4-1",
    type: "emailNode",
    position: { x: 300, y: 610 },
    data: {
      label: "Booking Request Email",
      sub: "bookingConfirmation",
      system: "emerald",
      kind: "email",
      iconName: "mail",
      details: { summary: "Sent to venue event planners upon booking request submission or status approval updates.", emailSubject: "🎸 7th Heaven Booking Request Received", endpointOrPath: "src/lib/email-templates.ts -> bookingConfirmation" },
    },
  },
  {
    id: "f-shows-4",
    type: "customNode",
    position: { x: 300, y: 750 },
    data: {
      label: "Booking Confirmed",
      sub: "/book/success",
      system: "emerald",
      kind: "page",
      iconName: "check",
      details: { summary: "Confirmation screen after submitting a band booking request.", endpointOrPath: "/book/success" },
    },
  },

  // =========================================================================
  // COLUMN 3 (UNDER FAN CLUB): FAN MEMBER PROFILE & PICK LOTTERY
  // =========================================================================
  {
    id: "f-fans-1",
    type: "customNode",
    position: { x: 600, y: 190 },
    data: {
      label: "Complete Fan Profile",
      sub: "/fans/complete-profile",
      system: "purple",
      kind: "page",
      iconName: "user",
      details: { summary: "Fan account onboarding and profile details setup.", endpointOrPath: "/fans/complete-profile" },
    },
  },
  {
    id: "f-fans-2",
    type: "customNode",
    position: { x: 600, y: 330 },
    data: {
      label: "Member Profile",
      sub: "/fans/[username]",
      system: "purple",
      kind: "page",
      iconName: "user",
      details: { summary: "Public member profile showing badges & favorite tracks.", endpointOrPath: "/fans/sample_fan" },
    },
  },
  {
    id: "f-fans-3",
    type: "customNode",
    position: { x: 600, y: 470 },
    data: {
      label: "Fan Photo Wall",
      sub: "/fan-photo-wall",
      system: "purple",
      kind: "page",
      iconName: "film",
      details: { summary: "Community concert photo stream & fan uploads.", endpointOrPath: "/fan-photo-wall" },
    },
  },
  {
    id: "f-fans-4",
    type: "customNode",
    position: { x: 600, y: 610 },
    data: {
      label: "Pick Collector Lottery",
      sub: "/picks",
      system: "purple",
      kind: "page",
      iconName: "sparkles",
      details: { summary: "Collect digital guitar picks at live shows for prizes.", endpointOrPath: "/picks" },
    },
  },
  {
    id: "f4-4",
    type: "emailNode",
    position: { x: 600, y: 750 },
    data: {
      label: "Raffle Win Email",
      sub: "raffleWin",
      system: "purple",
      kind: "email",
      iconName: "mail",
      details: { summary: "Sent to guitar pick lottery winners with backstage pass redemption instructions.", emailSubject: "🎉 You Won 7th Heaven VIP Backstage Passes!", endpointOrPath: "src/lib/email-templates.ts -> raffleWin" },
    },
  },

  // =========================================================================
  // COLUMN 4 (UNDER MERCHANDISE): MERCH SHOP & VENUE QR CHECKOUT
  // =========================================================================
  {
    id: "f-merch-1",
    type: "customNode",
    position: { x: 900, y: 190 },
    data: {
      label: "QR Merch Scanner",
      sub: "/qr/merch",
      system: "emerald",
      kind: "page",
      iconName: "shopping",
      details: { summary: "Fast mobile checkout at live venue merchandise tables.", endpointOrPath: "/qr/merch" },
    },
  },
  {
    id: "f-merch-2",
    type: "emailNode",
    position: { x: 900, y: 330 },
    data: {
      label: "Flash Pickup Email",
      sub: "flashMerchPickup",
      system: "emerald",
      kind: "email",
      iconName: "mail",
      details: { summary: "Instant QR receipt email for venue merchandise pickup.", emailSubject: "⚡ Your 7th Heaven Merch Pickup Code", endpointOrPath: "src/lib/email-templates.ts -> flashMerchPickup" },
    },
  },
  {
    id: "f-merch-3",
    type: "customNode",
    position: { x: 900, y: 470 },
    data: {
      label: "Payment Sandbox",
      sub: "/payment-test",
      system: "emerald",
      kind: "page",
      iconName: "credit",
      details: { summary: "EPX payment gateway test environment.", endpointOrPath: "/payment-test" },
    },
  },

  // =========================================================================
  // COLUMN 5A & 5B (UNDER CRUISE): CRUISE SIGNUP & REGISTRATION FLOWS
  // =========================================================================
  // --- Passwordless Signup Path ---
  {
    id: "f1-2",
    type: "customNode",
    position: { x: 1200, y: 190 },
    data: {
      label: "POST Cruise Signup",
      sub: "/api/cruise/signup",
      system: "cyan",
      kind: "api",
      iconName: "terminal",
      details: { summary: "Validates input, inserts row into Supabase cruise_signups, generates 6-digit PIN with 30-min expiry.", endpointOrPath: "/api/cruise/signup" },
    },
  },
  {
    id: "f1-3",
    type: "emailNode",
    position: { x: 1200, y: 330 },
    data: {
      label: "Cruise PIN Email",
      sub: "cruiseCommunityWelcome",
      system: "cyan",
      kind: "email",
      iconName: "mail",
      details: { summary: "Sends 6-digit verification code email.", emailSubject: "🔑 Your 7th Heaven Cruise Verification Code", endpointOrPath: "src/lib/email-templates.ts -> cruiseCommunityWelcome" },
    },
  },
  {
    id: "f1-4",
    type: "customNode",
    position: { x: 1200, y: 470 },
    data: {
      label: "Verify PIN Page",
      sub: "/cruise/verify?email=...",
      system: "cyan",
      kind: "page",
      iconName: "key",
      details: { summary: "User enters the 6-digit PIN received in their email.", endpointOrPath: "/cruise/verify" },
    },
  },
  {
    id: "f1-5",
    type: "customNode",
    position: { x: 1200, y: 610 },
    data: {
      label: "POST Verify PIN",
      sub: "/api/cruise/verify-pin",
      system: "cyan",
      kind: "api",
      iconName: "terminal",
      details: { summary: "Validates 6-digit PIN, creates or updates Supabase Auth user passwordlessly, updates profile with role='cruise', and generates magic link.", endpointOrPath: "/api/cruise/verify-pin" },
    },
  },
  {
    id: "f1-6",
    type: "emailNode",
    position: { x: 1200, y: 750 },
    data: {
      label: "Cruise Confirmed Email",
      sub: "cruiseConfirmation",
      system: "cyan",
      kind: "email",
      iconName: "mail",
      details: { summary: "Sends confirmation welcome email containing Magic Link CTA button.", emailSubject: "🚢 You're Confirmed — Welcome to the Cruise Hub!", endpointOrPath: "src/lib/email-templates.ts -> cruiseConfirmation" },
    },
  },
  {
    id: "f1-7",
    type: "customNode",
    position: { x: 1350, y: 890 },
    data: {
      label: "Cruise Member Hub",
      sub: "/cruise/dashboard",
      system: "cyan",
      kind: "page",
      iconName: "sparkles",
      details: { summary: "Protected Cruise Member Dashboard featuring itinerary, staterooms, and party packages.", endpointOrPath: "/cruise/dashboard" },
    },
  },

  // --- Password-Based Alt Path ---
  {
    id: "f2-2",
    type: "customNode",
    position: { x: 1500, y: 190 },
    data: {
      label: "POST Register Request",
      sub: "/api/cruise/register-pin (req)",
      system: "cyan",
      kind: "api",
      iconName: "terminal",
      details: { summary: "Checks profiles for existing email, generates 15-minute PIN, and stores pending row in cruise_pending_signups.", endpointOrPath: "/api/cruise/register-pin" },
    },
  },
  {
    id: "f2-3",
    type: "emailNode",
    position: { x: 1500, y: 330 },
    data: {
      label: "Register PIN Email",
      sub: "cruiseRegisterPin",
      system: "cyan",
      kind: "email",
      iconName: "mail",
      details: { summary: "Sends registration verification PIN email.", emailSubject: "🚢 Your Cruise Hub Verification PIN", endpointOrPath: "src/lib/email.ts" },
    },
  },
  {
    id: "f2-4",
    type: "customNode",
    position: { x: 1500, y: 470 },
    data: {
      label: "Enter PIN & Password",
      sub: "/cruise/verify",
      system: "cyan",
      kind: "page",
      iconName: "key",
      details: { summary: "User enters PIN and confirms chosen password.", endpointOrPath: "/cruise/verify" },
    },
  },
  {
    id: "f2-5",
    type: "customNode",
    position: { x: 1500, y: 610 },
    data: {
      label: "POST Register Confirm",
      sub: "/api/cruise/register-pin (conf)",
      system: "cyan",
      kind: "api",
      iconName: "terminal",
      details: { summary: "Creates Supabase Auth user with password, generates unique username, links profile, and deletes pending signup row.", endpointOrPath: "/api/cruise/register-pin" },
    },
  },

  // =========================================================================
  // COLUMN 6 (UNDER LIVE CAMS): LIVE STAGE STREAMS
  // =========================================================================
  {
    id: "f-live-1",
    type: "customNode",
    position: { x: 1750, y: 190 },
    data: {
      label: "Michael Stage Cam",
      sub: "/live/live_michael",
      system: "red",
      kind: "page",
      iconName: "radio",
      details: { summary: "Dedicated Michael Scimeca stage angle stream.", endpointOrPath: "/live/live_michael" },
    },
  },
  {
    id: "f-live-2",
    type: "customNode",
    position: { x: 1750, y: 330 },
    data: {
      label: "Ryan Guitar Cam",
      sub: "/live/live_ryan",
      system: "red",
      kind: "page",
      iconName: "radio",
      details: { summary: "Dedicated Ryan Cook guitar stream.", endpointOrPath: "/live/live_ryan" },
    },
  },
  {
    id: "f-live-3",
    type: "customNode",
    position: { x: 1750, y: 470 },
    data: {
      label: "Sammy Drum Cam",
      sub: "/live/live_sammy",
      system: "red",
      kind: "page",
      iconName: "radio",
      details: { summary: "Dedicated Sammy drum kit angle stream.", endpointOrPath: "/live/live_sammy" },
    },
  },
  {
    id: "f-live-4",
    type: "customNode",
    position: { x: 1750, y: 610 },
    data: {
      label: "Tony Bass Cam",
      sub: "/live/live_tony",
      system: "red",
      kind: "page",
      iconName: "radio",
      details: { summary: "Dedicated Tony bass angle stream.", endpointOrPath: "/live/live_tony" },
    },
  },

  // =========================================================================
  // COLUMN 7 (UNDER CREW & ADMIN): MANAGEMENT & ROAD CREW DASHBOARDS
  // =========================================================================
  {
    id: "f-admin-1",
    type: "customNode",
    position: { x: 2050, y: 190 },
    data: {
      label: "Crew HQ Dashboard",
      sub: "/crew",
      system: "red",
      kind: "page",
      iconName: "shield",
      details: { summary: "Road crew schedule, stage setup riders, and equipment checklists.", endpointOrPath: "/crew" },
    },
  },
  {
    id: "f4-2",
    type: "emailNode",
    position: { x: 2050, y: 330 },
    data: {
      label: "Crew Schedule Alert",
      sub: "scheduleChangeAlert",
      system: "red",
      kind: "email",
      iconName: "mail",
      details: { summary: "Sent to road crew members when show times, soundchecks, or shift coverage requests change.", emailSubject: "⚠️ Stage Schedule Update & Shift Alert", endpointOrPath: "src/lib/email-templates.ts -> scheduleChangeAlert" },
    },
  },
  {
    id: "f-admin-3",
    type: "customNode",
    position: { x: 2050, y: 470 },
    data: {
      label: "Newsletter Studio",
      sub: "/admin/emails",
      system: "red",
      kind: "page",
      iconName: "lock",
      details: { summary: "Admin newsletter & fan broadcast composition studio.", endpointOrPath: "/admin/emails" },
    },
  },
  {
    id: "f4-3",
    type: "emailNode",
    position: { x: 2050, y: 610 },
    data: {
      label: "Newsletter Broadcast",
      sub: "newsletterBlast",
      system: "purple",
      kind: "email",
      iconName: "mail",
      details: { summary: "Mass fan club email broadcasts sent via Admin Broadcast Studio.", emailSubject: "⚡ 7th Heaven Tour Announcement & VIP News", endpointOrPath: "src/app/admin/emails/page.tsx" },
    },
  },
  {
    id: "f4-6",
    type: "emailNode",
    position: { x: 2050, y: 750 },
    data: {
      label: "Security Alert Email",
      sub: "newAccountAdminAlert",
      system: "red",
      kind: "email",
      iconName: "mail",
      details: { summary: "System alert notification sent to band leadership for new registrations.", emailSubject: "🔔 Security Alert: New Account Created", endpointOrPath: "src/lib/email.ts" },
    },
  },
];

const INITIAL_EDGES: Edge[] = [
  // --- COLUMN 1: HOME -> AUTH FLOW ---
  { id: "e-home-1", source: "nav-home", target: "f3-1", label: "User Clicks Sign In", style: { stroke: "#a855f7", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#a855f7" } },
  { id: "e3-1", source: "f3-1", target: "f3-2", label: "Submits Email", style: { stroke: "#a855f7", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#a855f7" } },
  { id: "e3-2", source: "f3-2", target: "f3-3", label: "PIN emailed", style: { stroke: "#a855f7", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#a855f7" } },
  { id: "e3-3", source: "f3-3", target: "f3-4", label: "User receives PIN", style: { stroke: "#a855f7", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#a855f7" } },
  { id: "e3-4", source: "f3-4", target: "f3-5", label: "Submits Code", style: { stroke: "#a855f7", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#a855f7" } },
  { id: "e3-5", source: "f3-5", target: "f3-6", label: "Session created", style: { stroke: "#a855f7", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#a855f7" } },

  // --- COLUMN 2: SHOWS -> BOOKING FLOW ---
  { id: "e-shows-1", source: "nav-shows", target: "f-shows-1", label: "View Show", style: { stroke: "#a855f7", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#a855f7" } },
  { id: "e-shows-2", source: "nav-shows", target: "f-shows-2", label: "Book Band", style: { stroke: "#10b981", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#10b981" } },
  { id: "e-shows-3", source: "f-shows-2", target: "f-shows-3", label: "Submits Form", style: { stroke: "#10b981", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#10b981" } },
  { id: "e-shows-4", source: "f-shows-3", target: "f4-1", label: "Sends Email", style: { stroke: "#10b981", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#10b981" } },
  { id: "e-shows-5", source: "f4-1", target: "f-shows-4", label: "Confirmed", style: { stroke: "#10b981", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#10b981" } },

  // --- COLUMN 3: FANS -> FAN PERKS ---
  { id: "e-fans-1", source: "nav-fans", target: "f-fans-1", label: "Join Club", style: { stroke: "#a855f7", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#a855f7" } },
  { id: "e-fans-2", source: "f-fans-1", target: "f-fans-2", label: "Profile", style: { stroke: "#a855f7", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#a855f7" } },
  { id: "e-fans-3", source: "nav-fans", target: "f-fans-3", label: "Photos", style: { stroke: "#a855f7", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#a855f7" } },
  { id: "e-fans-4", source: "nav-fans", target: "f-fans-4", label: "Pick Lottery", style: { stroke: "#a855f7", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#a855f7" } },
  { id: "e-fans-5", source: "f-fans-4", target: "f4-4", label: "Winner Alert", style: { stroke: "#a855f7", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#a855f7" } },

  // --- COLUMN 4: MERCH -> STORE & QR ---
  { id: "e-merch-1", source: "nav-merch", target: "f-merch-1", label: "QR Checkout", style: { stroke: "#f59e0b", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#f59e0b" } },
  { id: "e-merch-2", source: "f-merch-1", target: "f-merch-2", label: "Sends Receipt", style: { stroke: "#f59e0b", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#f59e0b" } },
  { id: "e-merch-3", source: "nav-merch", target: "f-merch-3", label: "Pay Sandbox", style: { stroke: "#f59e0b", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#f59e0b" } },

  // --- COLUMN 5A: CRUISE -> PASSWORDLESS SIGNUP ---
  { id: "e1-1", source: "nav-cruise", target: "f1-2", label: "Passwordless Form", style: { stroke: "#06b6d4", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#06b6d4" } },
  { id: "e1-2", source: "f1-2", target: "f1-3", label: "PIN generated", style: { stroke: "#06b6d4", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#06b6d4" } },
  { id: "e1-3", source: "f1-3", target: "f1-4", label: "Receives PIN", style: { stroke: "#06b6d4", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#06b6d4" } },
  { id: "e1-4", source: "f1-4", target: "f1-5", label: "Submits PIN", style: { stroke: "#06b6d4", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#06b6d4" } },
  { id: "e1-5", source: "f1-5", target: "f1-6", label: "Magic Link", style: { stroke: "#06b6d4", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#06b6d4" } },
  { id: "e1-6", source: "f1-6", target: "f1-7", label: "Auto-Login", style: { stroke: "#06b6d4", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#06b6d4" } },

  // --- COLUMN 5B: CRUISE -> PASSWORD REGISTRATION ALT PATH ---
  { id: "e2-1", source: "nav-cruise", target: "f2-2", label: "Password Form", style: { stroke: "#06b6d4", strokeWidth: 2, strokeDasharray: "5,5" }, markerEnd: { type: MarkerType.ArrowClosed, color: "#06b6d4" } },
  { id: "e2-2", source: "f2-2", target: "f2-3", label: "Sends PIN", style: { stroke: "#06b6d4", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#06b6d4" } },
  { id: "e2-3", source: "f2-3", target: "f2-4", label: "Receives PIN", style: { stroke: "#06b6d4", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#06b6d4" } },
  { id: "e2-4", source: "f2-4", target: "f2-5", label: "Sets Password", style: { stroke: "#06b6d4", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#06b6d4" } },
  { id: "e2-5", source: "f2-5", target: "f1-7", label: "Confirmed", style: { stroke: "#06b6d4", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#06b6d4" } },

  // --- COLUMN 6: LIVE CAMS ---
  { id: "e-live-1", source: "nav-live", target: "f-live-1", label: "Michael", style: { stroke: "#ef4444", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#ef4444" } },
  { id: "e-live-2", source: "nav-live", target: "f-live-2", label: "Ryan", style: { stroke: "#ef4444", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#ef4444" } },
  { id: "e-live-3", source: "nav-live", target: "f-live-3", label: "Sammy", style: { stroke: "#ef4444", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#ef4444" } },
  { id: "e-live-4", source: "nav-live", target: "f-live-4", label: "Tony", style: { stroke: "#ef4444", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#ef4444" } },

  // --- COLUMN 7: ADMIN & CREW ---
  { id: "e-admin-1", source: "nav-admin", target: "f-admin-1", label: "Crew HQ", style: { stroke: "#ef4444", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#ef4444" } },
  { id: "e-admin-2", source: "f-admin-1", target: "f4-2", label: "Shift Alerts", style: { stroke: "#ef4444", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#ef4444" } },
  { id: "e-admin-3", source: "nav-admin", target: "f-admin-3", label: "Newsletters", style: { stroke: "#ef4444", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#ef4444" } },
  { id: "e-admin-4", source: "f-admin-3", target: "f4-3", label: "Broadcast", style: { stroke: "#a855f7", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#a855f7" } },
  { id: "e-admin-5", source: "nav-admin", target: "f4-6", label: "Security Alert", style: { stroke: "#ef4444", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#ef4444" } },
];

export default function UserFlowMap() {
  const router = useRouter();
  const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);
  const [selectedNode, setSelectedNode] = useState<Node<FlowNodeData> | null>(null);

  // Handle node click: navigate if real page route, or open side detail panel if API/email
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node<FlowNodeData>) => {
    setSelectedNode(node);
  }, []);

  return (
    <div className="relative w-full h-[820px] rounded-3xl border border-purple-500/30 bg-[#050505] overflow-hidden shadow-2xl backdrop-blur-2xl">
      
      {/* Swimlane Column Header Labels */}
      <div className="absolute top-0 left-0 right-0 z-10 grid grid-cols-7 bg-black/90 backdrop-blur-md border-b border-white/10 px-2 py-2 text-center pointer-events-none select-none">
        <div className="border-r border-white/10 px-1">
          <span className="text-[9px] font-black uppercase tracking-widest text-purple-300 flex items-center justify-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            1. Home / Sign In
          </span>
        </div>
        <div className="border-r border-white/10 px-1">
          <span className="text-[9px] font-black uppercase tracking-widest text-purple-300 flex items-center justify-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            2. Shows & Booking
          </span>
        </div>
        <div className="border-r border-white/10 px-1">
          <span className="text-[9px] font-black uppercase tracking-widest text-purple-300 flex items-center justify-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            3. Fan Club & Perks
          </span>
        </div>
        <div className="border-r border-white/10 px-1">
          <span className="text-[9px] font-black uppercase tracking-widest text-emerald-300 flex items-center justify-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            4. Merch & Store
          </span>
        </div>
        <div className="border-r border-white/10 px-1">
          <span className="text-[9px] font-black uppercase tracking-widest text-cyan-300 flex items-center justify-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
            5. Cruise Signups
          </span>
        </div>
        <div className="border-r border-white/10 px-1">
          <span className="text-[9px] font-black uppercase tracking-widest text-red-300 flex items-center justify-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            6. Live Stage Cams
          </span>
        </div>
        <div className="px-1">
          <span className="text-[9px] font-black uppercase tracking-widest text-red-300 flex items-center justify-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            7. Crew & Admin HQ
          </span>
        </div>
      </div>

      {/* React Flow Canvas Engine */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.1 }}
        colorMode="dark"
        className="pt-10"
      >
        <Background color="#1e1b4b" gap={20} size={1} />
        <Controls className="!bg-black/80 !border-white/10 !text-white !rounded-xl overflow-hidden" />
        <MiniMap
          style={{ height: 110, width: 160 }}
          nodeColor={(n) => {
            const d = n.data as FlowNodeData;
            return d.system === "cyan"
              ? "#06b6d4"
              : d.system === "emerald"
              ? "#10b981"
              : d.system === "red"
              ? "#ef4444"
              : "#a855f7";
          }}
          maskColor="rgba(0, 0, 0, 0.7)"
          className="!bg-black/90 !border-white/10 !rounded-xl"
        />
      </ReactFlow>

      {/* Bottom Swimlane Color System Legend */}
      <div className="absolute bottom-4 left-4 z-10 flex flex-wrap items-center gap-4 bg-black/90 border border-white/10 px-4 py-2.5 rounded-2xl backdrop-blur-xl text-xs font-bold uppercase tracking-widest">
        <span className="text-white/40 text-[9px] font-mono">Top Navigation System:</span>
        <span className="flex items-center gap-1.5 text-purple-300 text-[10px]">
          <span className="w-2 h-2 rounded-full bg-purple-500" /> Fan & Auth
        </span>
        <span className="flex items-center gap-1.5 text-cyan-300 text-[10px]">
          <span className="w-2 h-2 rounded-full bg-cyan-500" /> Cruise System
        </span>
        <span className="flex items-center gap-1.5 text-emerald-300 text-[10px]">
          <span className="w-2 h-2 rounded-full bg-emerald-500" /> Booking / Store
        </span>
        <span className="flex items-center gap-1.5 text-red-300 text-[10px]">
          <span className="w-2 h-2 rounded-full bg-red-500" /> Crew & Admin Cams
        </span>
      </div>

      {/* Slide-out Inspector Detail Drawer */}
      {selectedNode && (
        <div className="absolute top-14 right-4 bottom-4 w-96 bg-black/95 border border-purple-500/40 rounded-2xl p-6 shadow-2xl backdrop-blur-2xl z-30 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right-8 duration-200">
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono text-[9px] font-bold uppercase tracking-wider">
                  {selectedNode.data.kind.toUpperCase()} NODE INSPECTOR
                </span>
                <h3 className="text-lg font-black uppercase tracking-wider text-white mt-1">
                  {selectedNode.data.label}
                </h3>
                <code className="text-xs font-mono text-cyan-300 block mt-0.5">
                  {selectedNode.data.sub}
                </code>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Summary */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/40 block">
                Technical Summary
              </span>
              <p className="text-xs text-white/80 leading-relaxed bg-white/[0.03] p-3 rounded-xl border border-white/10">
                {selectedNode.data.details?.summary}
              </p>
            </div>

            {/* Email Subject / Payload Info */}
            {selectedNode.data.details?.emailSubject && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-300 block">
                  ✉ Email Subject Line
                </span>
                <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl font-mono text-xs text-amber-200">
                  {selectedNode.data.details.emailSubject}
                </div>
              </div>
            )}

            {selectedNode.data.details?.payloadOrParams && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-300 block">
                  Data Payload / Parameters
                </span>
                <div className="bg-black/60 border border-white/10 p-3 rounded-xl font-mono text-xs text-cyan-300 overflow-x-auto">
                  {selectedNode.data.details.payloadOrParams}
                </div>
              </div>
            )}

            {/* Database & Security Logic Actions */}
            {selectedNode.data.details?.dbActions && (
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-300 block">
                  Database & System Actions
                </span>
                <ul className="space-y-1.5">
                  {selectedNode.data.details.dbActions.map((action) => (
                    <li key={action} className="flex items-center gap-2 text-xs text-emerald-200/90 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-lg font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            {selectedNode.data.kind === "nav" || (selectedNode.data.kind === "page" && selectedNode.data.sub.startsWith("/")) ? (
              <button
                onClick={() => router.push(selectedNode.data.sub.split("?")[0])}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg"
              >
                <span>Visit Route ({selectedNode.data.sub.split("?")[0]})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setSelectedNode(null)}
                className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 font-black text-xs uppercase tracking-wider transition"
              >
                Close Inspector
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
