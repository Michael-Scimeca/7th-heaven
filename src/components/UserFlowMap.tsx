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
  kind: "page" | "api" | "email" | "component";
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
};

// --- CUSTOM REACT FLOW NODE COMPONENTS ---

// 1. Standard Page / Component Node
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

// 2. Distinct Email Touchpoint Node (Dashed border, Envelope Badge)
function EmailFlowNode({ data }: NodeProps<Node<FlowNodeData>>) {
  const scheme = COLOR_SCHEMES[data.system || "purple"];
  const IconComp = ICON_MAP[data.iconName] || Mail;

  return (
    <div
      className={`group relative rounded-2xl border-2 border-dashed ${scheme.border} ${scheme.bg} ${scheme.glow} p-3.5 w-72 backdrop-blur-xl transition-all duration-300 cursor-pointer hover:scale-[1.03] select-none`}
    >
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-cyan-400 !border-2 !border-black" />

      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]">
          <IconComp className="w-4.5 h-4.5 animate-pulse" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[8px] font-mono font-black uppercase tracking-widest">
              ✉ EMAIL TOUCHPOINT
            </span>
            <span className="w-2 h-2 rounded-full bg-amber-400" />
          </div>

          <h4 className="font-black text-xs text-white uppercase tracking-wider truncate">
            {data.label}
          </h4>

          {data.details?.emailSubject && (
            <p className="text-[10px] italic text-amber-200/90 truncate mt-0.5">
              &quot;{data.details.emailSubject}&quot;
            </p>
          )}

          <code className="text-[9px] font-mono text-white/40 block truncate mt-1">
            {data.sub}
          </code>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-amber-400 !border-2 !border-black" />
    </div>
  );
}

const nodeTypes = {
  customNode: CustomFlowNode,
  emailNode: EmailFlowNode,
};

// --- THE 4 REAL USER JOURNEYS (PRECISE FLOW NODES & EDGES) ---

const INITIAL_NODES: Node<FlowNodeData>[] = [
  // =========================================================================
  // FLOW 1: CRUISE SIGNUP → EMAIL VERIFICATION → DASHBOARD (Cyan Cluster)
  // =========================================================================
  {
    id: "f1-1",
    type: "customNode",
    position: { x: 50, y: 100 },
    data: {
      label: "Cruise Signup Page",
      sub: "/cruise",
      system: "cyan",
      kind: "page",
      iconName: "sparkles",
      details: {
        summary: "Public cruise registration landing page with guest count, passenger names, email, and phone input form.",
        endpointOrPath: "/cruise",
        payloadOrParams: "{ name, email, phone, guest_count, guest_list[] }",
      },
    },
  },
  {
    id: "f1-2",
    type: "customNode",
    position: { x: 50, y: 240 },
    data: {
      label: "POST Cruise Signup",
      sub: "/api/cruise/signup",
      system: "cyan",
      kind: "api",
      iconName: "terminal",
      details: {
        summary: "Validates input, checks for bot spam, generates cancel_token, inserts row into Supabase cruise_signups, and issues 6-digit PIN with 30-min expiration.",
        endpointOrPath: "/api/cruise/signup",
        dbActions: [
          "Inserts into Supabase `cruise_signups` table",
          "Encrypts sensitive notes/phone data",
          "Stores 6-digit verification PIN in `pins` table",
        ],
      },
    },
  },
  {
    id: "f1-3",
    type: "emailNode",
    position: { x: 50, y: 380 },
    data: {
      label: "Cruise PIN Email",
      sub: "cruiseCommunityWelcome",
      system: "cyan",
      kind: "email",
      iconName: "mail",
      details: {
        summary: "Sends 6-digit verification code email via Resend email engine.",
        emailSubject: "🔑 Your 7th Heaven Cruise Verification Code",
        endpointOrPath: "src/lib/email-templates.ts -> cruiseCommunityWelcome",
      },
    },
  },
  {
    id: "f1-4",
    type: "customNode",
    position: { x: 50, y: 530 },
    data: {
      label: "Verify PIN Page",
      sub: "/cruise/verify?email=...",
      system: "cyan",
      kind: "page",
      iconName: "key",
      details: {
        summary: "User enters the 6-digit PIN received in their email.",
        endpointOrPath: "/cruise/verify",
      },
    },
  },
  {
    id: "f1-5",
    type: "customNode",
    position: { x: 50, y: 670 },
    data: {
      label: "POST Verify PIN",
      sub: "/api/cruise/verify-pin",
      system: "cyan",
      kind: "api",
      iconName: "terminal",
      details: {
        summary: "Validates 6-digit PIN, creates or updates Supabase Auth user passwordlessly, updates profile with role='cruise', and generates a Supabase magic link.",
        endpointOrPath: "/api/cruise/verify-pin",
        dbActions: [
          "Verifies PIN match & expiry",
          "Creates/updates Supabase Auth user (`role: 'cruise'`)",
          "Generates magic link token for auto-login",
        ],
      },
    },
  },
  {
    id: "f1-6",
    type: "emailNode",
    position: { x: 50, y: 810 },
    data: {
      label: "Cruise Confirmed Email",
      sub: "cruiseConfirmation",
      system: "cyan",
      kind: "email",
      iconName: "mail",
      details: {
        summary: "Sends confirmation welcome email containing the Magic Link CTA button to jump directly into the Cruise Hub.",
        emailSubject: "🚢 You're Confirmed — Welcome to the Cruise Hub!",
        endpointOrPath: "src/lib/email-templates.ts -> cruiseConfirmation",
      },
    },
  },
  {
    id: "f1-7",
    type: "customNode",
    position: { x: 50, y: 960 },
    data: {
      label: "Cruise Member Hub",
      sub: "/cruise/dashboard",
      system: "cyan",
      kind: "page",
      iconName: "sparkles",
      details: {
        summary: "Protected Cruise Member Dashboard featuring itinerary, stateroom catalog, party packages, and guest management.",
        endpointOrPath: "/cruise/dashboard",
      },
    },
  },

  // =========================================================================
  // FLOW 2: CRUISE REGISTRATION (PASSWORD-BASED ALT PATH) (Cyan Cluster)
  // =========================================================================
  {
    id: "f2-1",
    type: "customNode",
    position: { x: 420, y: 100 },
    data: {
      label: "Registration Form",
      sub: "/cruise (Password Path)",
      system: "cyan",
      kind: "page",
      iconName: "sparkles",
      details: {
        summary: "Alternative registration form for users setting an explicit account password.",
        endpointOrPath: "/cruise",
      },
    },
  },
  {
    id: "f2-2",
    type: "customNode",
    position: { x: 420, y: 240 },
    data: {
      label: "POST Register Request",
      sub: "/api/cruise/register-pin (request)",
      system: "cyan",
      kind: "api",
      iconName: "terminal",
      details: {
        summary: "Checks profiles for existing email, generates 15-minute PIN, and stores pending row in `cruise_pending_signups`.",
        endpointOrPath: "/api/cruise/register-pin",
        dbActions: [
          "Inserts pending row into `cruise_pending_signups`",
          "Issues 15-min registration PIN",
        ],
      },
    },
  },
  {
    id: "f2-3",
    type: "emailNode",
    position: { x: 420, y: 380 },
    data: {
      label: "Register PIN Email",
      sub: "cruiseRegisterPin",
      system: "cyan",
      kind: "email",
      iconName: "mail",
      details: {
        summary: "Sends registration verification PIN email.",
        emailSubject: "🚢 Your Cruise Hub Verification PIN",
        endpointOrPath: "src/lib/email.ts -> sendEmail",
      },
    },
  },
  {
    id: "f2-4",
    type: "customNode",
    position: { x: 420, y: 530 },
    data: {
      label: "Enter PIN & Password",
      sub: "/cruise/verify",
      system: "cyan",
      kind: "page",
      iconName: "key",
      details: {
        summary: "User enters PIN and confirms chosen password.",
        endpointOrPath: "/cruise/verify",
      },
    },
  },
  {
    id: "f2-5",
    type: "customNode",
    position: { x: 420, y: 670 },
    data: {
      label: "POST Register Confirm",
      sub: "/api/cruise/register-pin (confirm)",
      system: "cyan",
      kind: "api",
      iconName: "terminal",
      details: {
        summary: "Creates Supabase Auth user with password, generates unique username, links profile, and deletes pending signup row.",
        endpointOrPath: "/api/cruise/register-pin",
        dbActions: [
          "Creates Supabase Auth user with password",
          "Generates unique username (`cruise_user_...`)",
          "Deletes row from `cruise_pending_signups`",
        ],
      },
    },
  },

  // =========================================================================
  // FLOW 3: GENERAL PASSWORDLESS LOGIN (SITE-WIDE) (Purple Cluster)
  // =========================================================================
  {
    id: "f3-1",
    type: "customNode",
    position: { x: 790, y: 100 },
    data: {
      label: "Login Trigger",
      sub: "LoginModal.tsx",
      system: "purple",
      kind: "component",
      iconName: "user",
      details: {
        summary: "User clicks Login on any page to open the glassmorphism authentication modal.",
        endpointOrPath: "src/components/LoginModal.tsx",
      },
    },
  },
  {
    id: "f3-2",
    type: "customNode",
    position: { x: 790, y: 240 },
    data: {
      label: "POST Send Auth PIN",
      sub: "/api/auth/send-pin",
      system: "purple",
      kind: "api",
      iconName: "terminal",
      details: {
        summary: "Generates 6-digit authentication PIN. Allows dev bypass via fake-logins.json outside production.",
        endpointOrPath: "/api/auth/send-pin",
        dbActions: [
          "Generates 6-digit session PIN",
          "Checks `fake-logins.json` in dev mode",
        ],
      },
    },
  },
  {
    id: "f3-3",
    type: "emailNode",
    position: { x: 790, y: 380 },
    data: {
      label: "Auth PIN Email",
      sub: "sendAuthPin",
      system: "purple",
      kind: "email",
      iconName: "mail",
      details: {
        summary: "Sends 6-digit verification code to user's inbox.",
        emailSubject: "🔑 Your 7th Heaven Verification Code",
        endpointOrPath: "src/lib/email-templates.ts -> sendAuthPin",
      },
    },
  },
  {
    id: "f3-4",
    type: "customNode",
    position: { x: 790, y: 530 },
    data: {
      label: "Enter PIN in Modal",
      sub: "LoginModal.tsx (Step 2)",
      system: "purple",
      kind: "component",
      iconName: "key",
      details: {
        summary: "User inputs 6-digit PIN into modal digit boxes.",
        endpointOrPath: "src/components/LoginModal.tsx",
      },
    },
  },
  {
    id: "f3-5",
    type: "customNode",
    position: { x: 790, y: 670 },
    data: {
      label: "POST Verify Auth PIN",
      sub: "/api/auth/verify-pin",
      system: "purple",
      kind: "api",
      iconName: "terminal",
      details: {
        summary: "Verifies PIN match, generates Supabase session tokens, and returns member profile role.",
        endpointOrPath: "/api/auth/verify-pin",
        dbActions: [
          "Verifies PIN validity",
          "Creates authenticated session cookie",
        ],
      },
    },
  },
  {
    id: "f3-6",
    type: "customNode",
    position: { x: 790, y: 810 },
    data: {
      label: "Role Destination",
      sub: "/fans | /crew | /planner | /admin",
      system: "purple",
      kind: "page",
      iconName: "user",
      details: {
        summary: "Session created. User is redirected to their specific role dashboard.",
        endpointOrPath: "Role-based redirect destination",
      },
    },
  },

  // =========================================================================
  // FLOW 4: POST-DASHBOARD EMAIL TRIGGERS (Multi-System Fan-Out)
  // =========================================================================
  {
    id: "f4-1",
    type: "emailNode",
    position: { x: 1180, y: 100 },
    data: {
      label: "Booking Confirmations",
      sub: "bookingConfirmation",
      system: "emerald",
      kind: "email",
      iconName: "mail",
      details: {
        summary: "Sent to venue event planners upon booking request submission or status approval updates.",
        emailSubject: "🎸 7th Heaven Booking Request Received",
        endpointOrPath: "src/lib/email-templates.ts -> bookingConfirmation",
      },
    },
  },
  {
    id: "f4-2",
    type: "emailNode",
    position: { x: 1180, y: 240 },
    data: {
      label: "Crew Schedule Alerts",
      sub: "scheduleChangeAlert",
      system: "red",
      kind: "email",
      iconName: "mail",
      details: {
        summary: "Sent to road crew members when show times, soundchecks, or shift coverage requests change.",
        emailSubject: "⚠️ Stage Schedule Update & Shift Alert",
        endpointOrPath: "src/lib/email-templates.ts -> scheduleChangeAlert",
      },
    },
  },
  {
    id: "f4-3",
    type: "emailNode",
    position: { x: 1180, y: 380 },
    data: {
      label: "Newsletter Blasts",
      sub: "newsletterBlast",
      system: "purple",
      kind: "email",
      iconName: "mail",
      details: {
        summary: "Mass fan club email broadcasts sent via Admin Broadcast Studio.",
        emailSubject: "⚡ 7th Heaven Tour Announcement & VIP News",
        endpointOrPath: "src/app/admin/emails/page.tsx",
      },
    },
  },
  {
    id: "f4-4",
    type: "emailNode",
    position: { x: 1180, y: 530 },
    data: {
      label: "Raffle Win Notices",
      sub: "raffleWin",
      system: "purple",
      kind: "email",
      iconName: "mail",
      details: {
        summary: "Sent to guitar pick lottery winners with backstage pass redemption instructions.",
        emailSubject: "🎉 You Won 7th Heaven VIP Backstage Passes!",
        endpointOrPath: "src/lib/email-templates.ts -> raffleWin",
      },
    },
  },
  {
    id: "f4-5",
    type: "emailNode",
    position: { x: 1180, y: 670 },
    data: {
      label: "RSVP Cancellation",
      sub: "Tokenized Link",
      system: "cyan",
      kind: "email",
      iconName: "mail",
      details: {
        summary: "Direct email link allowing cruisers to cancel RSVPs via cryptographic token.",
        emailSubject: "RSVP Update — Tokenized Link",
        endpointOrPath: "/cruise/cancel?token=...",
      },
    },
  },
  {
    id: "f4-6",
    type: "emailNode",
    position: { x: 1180, y: 810 },
    data: {
      label: "Admin Broadcasts",
      sub: "newAccountAdminAlert",
      system: "red",
      kind: "email",
      iconName: "mail",
      details: {
        summary: "System alert notification sent to band leadership for new registrations or emergency alerts.",
        emailSubject: "🔔 Security Alert: New Account Created",
        endpointOrPath: "src/lib/email.ts",
      },
    },
  },
];

const INITIAL_EDGES: Edge[] = [
  // Flow 1 Edges (Cyan)
  { id: "e1-1", source: "f1-1", target: "f1-2", label: "Submits Signup Form", style: { stroke: "#06b6d4", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#06b6d4" } },
  { id: "e1-2", source: "f1-2", target: "f1-3", label: "PIN generated & queued", style: { stroke: "#06b6d4", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#06b6d4" } },
  { id: "e1-3", source: "f1-3", target: "f1-4", label: "User receives email", style: { stroke: "#06b6d4", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#06b6d4" } },
  { id: "e1-4", source: "f1-4", target: "f1-5", label: "User submits PIN", style: { stroke: "#06b6d4", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#06b6d4" } },
  { id: "e1-5", source: "f1-5", target: "f1-6", label: "Magic link generated", style: { stroke: "#06b6d4", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#06b6d4" } },
  { id: "e1-6", source: "f1-6", target: "f1-7", label: "User clicks Magic Link CTA", style: { stroke: "#06b6d4", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#06b6d4" } },

  // Flow 2 Edges (Cyan Alt Path)
  { id: "e2-1", source: "f2-1", target: "f2-2", label: "Submits Register Request", style: { stroke: "#06b6d4", strokeWidth: 2, strokeDasharray: "5,5" }, markerEnd: { type: MarkerType.ArrowClosed, color: "#06b6d4" } },
  { id: "e2-2", source: "f2-2", target: "f2-3", label: "Sends Verification PIN", style: { stroke: "#06b6d4", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#06b6d4" } },
  { id: "e2-3", source: "f2-3", target: "f2-4", label: "User receives PIN", style: { stroke: "#06b6d4", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#06b6d4" } },
  { id: "e2-4", source: "f2-4", target: "f2-5", label: "Submits PIN + Password", style: { stroke: "#06b6d4", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#06b6d4" } },
  { id: "e2-5", source: "f2-5", target: "f1-7", label: "Account confirmed & login", style: { stroke: "#06b6d4", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#06b6d4" } },

  // Flow 3 Edges (Purple Auth)
  { id: "e3-1", source: "f3-1", target: "f3-2", label: "Submits Email", style: { stroke: "#a855f7", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#a855f7" } },
  { id: "e3-2", source: "f3-2", target: "f3-3", label: "PIN emailed", style: { stroke: "#a855f7", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#a855f7" } },
  { id: "e3-3", source: "f3-3", target: "f3-4", label: "User receives PIN", style: { stroke: "#a855f7", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#a855f7" } },
  { id: "e3-4", source: "f3-4", target: "f3-5", label: "Submits Code", style: { stroke: "#a855f7", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#a855f7" } },
  { id: "e3-5", source: "f3-5", target: "f3-6", label: "Session created", style: { stroke: "#a855f7", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#a855f7" } },

  // Flow 4 Edges (Post-Dashboard Fan-Out)
  { id: "e4-1", source: "f1-7", target: "f4-1", label: "Planner Booking", style: { stroke: "#10b981", strokeWidth: 1.5, strokeDasharray: "4,4" }, markerEnd: { type: MarkerType.ArrowClosed, color: "#10b981" } },
  { id: "e4-2", source: "f1-7", target: "f4-2", label: "Crew Schedule", style: { stroke: "#ef4444", strokeWidth: 1.5, strokeDasharray: "4,4" }, markerEnd: { type: MarkerType.ArrowClosed, color: "#ef4444" } },
  { id: "e4-3", source: "f1-7", target: "f4-3", label: "Fan Newsletter", style: { stroke: "#a855f7", strokeWidth: 1.5, strokeDasharray: "4,4" }, markerEnd: { type: MarkerType.ArrowClosed, color: "#a855f7" } },
  { id: "e4-4", source: "f1-7", target: "f4-4", label: "Raffle Prize Win", style: { stroke: "#a855f7", strokeWidth: 1.5, strokeDasharray: "4,4" }, markerEnd: { type: MarkerType.ArrowClosed, color: "#a855f7" } },
  { id: "e4-5", source: "f1-7", target: "f4-5", label: "RSVP Cancel Token", style: { stroke: "#06b6d4", strokeWidth: 1.5, strokeDasharray: "4,4" }, markerEnd: { type: MarkerType.ArrowClosed, color: "#06b6d4" } },
  { id: "e4-6", source: "f1-7", target: "f4-6", label: "Admin Alerts", style: { stroke: "#ef4444", strokeWidth: 1.5, strokeDasharray: "4,4" }, markerEnd: { type: MarkerType.ArrowClosed, color: "#ef4444" } },
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
    <div className="relative w-full h-[780px] rounded-3xl border border-purple-500/30 bg-[#050505] overflow-hidden shadow-2xl backdrop-blur-2xl">
      
      {/* Swimlane Column Header Labels */}
      <div className="absolute top-0 left-0 right-0 z-10 grid grid-cols-4 bg-black/80 backdrop-blur-md border-b border-white/10 px-4 py-3 text-center pointer-events-none select-none">
        <div className="border-r border-white/10 pr-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-cyan-300 flex items-center justify-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            1. Cruise Passwordless Signup
          </span>
        </div>
        <div className="border-r border-white/10 px-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-cyan-300 flex items-center justify-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            2. Cruise Password Reg
          </span>
        </div>
        <div className="border-r border-white/10 px-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-purple-300 flex items-center justify-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            3. Site Auth (LoginModal)
          </span>
        </div>
        <div className="pl-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300 flex items-center justify-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            4. Post-Dashboard Triggers
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
        fitViewOptions={{ padding: 0.15 }}
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
        <span className="text-white/40 text-[9px] font-mono">System Colors:</span>
        <span className="flex items-center gap-1.5 text-purple-300 text-[10px]">
          <span className="w-2 h-2 rounded-full bg-purple-500" /> Fan & Auth
        </span>
        <span className="flex items-center gap-1.5 text-cyan-300 text-[10px]">
          <span className="w-2 h-2 rounded-full bg-cyan-500" /> Cruise System
        </span>
        <span className="flex items-center gap-1.5 text-emerald-300 text-[10px]">
          <span className="w-2 h-2 rounded-full bg-emerald-500" /> Booking / Planner
        </span>
        <span className="flex items-center gap-1.5 text-red-300 text-[10px]">
          <span className="w-2 h-2 rounded-full bg-red-500" /> Crew & Admin Alerts
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
            {selectedNode.data.kind === "page" && selectedNode.data.sub.startsWith("/") ? (
              <button
                onClick={() => router.push(selectedNode.data.sub.split("?")[0])}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg"
              >
                <span>Visit Real Route ({selectedNode.data.sub.split("?")[0]})</span>
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
