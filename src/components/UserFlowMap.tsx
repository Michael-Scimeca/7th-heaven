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
  UserPlus,
  LogIn,
  CheckSquare,
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
  kind: "nav" | "page" | "api" | "email" | "component" | "step";
  iconName: string;
  stepNumber?: number;
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
  userPlus: UserPlus,
  logIn: LogIn,
};

// --- CUSTOM REACT FLOW NODE COMPONENTS ---

// 1. Top Navigation Page Node
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
      <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-purple-400 !border-2 !border-black" />
      
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border border-white/10 ${scheme.badge}`}>
          <IconComp className="w-4 h-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider ${scheme.badge}`}>
              {data.stepNumber ? `STEP ${data.stepNumber}` : data.kind.toUpperCase()}
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
      <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-cyan-400 !border-2 !border-black" />
    </div>
  );
}

// 3. Distinct Email Touchpoint Node (Dashed border, Envelope Badge, Email Subject)
function EmailFlowNode({ data }: NodeProps<Node<FlowNodeData>>) {
  const scheme = COLOR_SCHEMES[data.system || "purple"];
  const IconComp = ICON_MAP[data.iconName] || Mail;

  return (
    <div
      className={`group relative rounded-2xl border-2 border-dashed ${scheme.border} ${scheme.bg} ${scheme.glow} p-3.5 w-72 backdrop-blur-xl transition-all duration-300 cursor-pointer hover:scale-[1.03] select-none`}
    >
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-cyan-400 !border-2 !border-black" />
      <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-cyan-400 !border-2 !border-black" />

      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]">
          <IconComp className="w-4 h-4 animate-pulse" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[8px] font-mono font-black uppercase tracking-widest">
              {data.stepNumber ? `STEP ${data.stepNumber} · ✉ EMAIL` : "✉ EMAIL SENT"}
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
      <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-amber-400 !border-2 !border-black" />
    </div>
  );
}

const nodeTypes = {
  navNode: NavFlowNode,
  customNode: CustomFlowNode,
  emailNode: EmailFlowNode,
};

// --- DATA SET 1: ALL NAVIGATION PAGES & FULL ARCHITECTURE ---
const NAV_NODES: Node<FlowNodeData>[] = [
  // Top Line Nav Nodes (Row 0: Y = 40)
  { id: "nav-home", type: "navNode", position: { x: 0, y: 40 }, data: { label: "Home", sub: "/", system: "purple", kind: "nav", iconName: "globe" } },
  { id: "nav-shows", type: "navNode", position: { x: 300, y: 40 }, data: { label: "Shows & Concerts", sub: "/shows/past", system: "purple", kind: "nav", iconName: "calendar" } },
  { id: "nav-fans", type: "navNode", position: { x: 600, y: 40 }, data: { label: "Fan Club", sub: "/fans", system: "purple", kind: "nav", iconName: "user" } },
  { id: "nav-merch", type: "navNode", position: { x: 900, y: 40 }, data: { label: "Merchandise", sub: "/merch", system: "emerald", kind: "nav", iconName: "shopping" } },
  { id: "nav-cruise", type: "navNode", position: { x: 1200, y: 40 }, data: { label: "Cruise 2026", sub: "/cruise", system: "cyan", kind: "nav", iconName: "sparkles" } },
  { id: "nav-live", type: "navNode", position: { x: 1750, y: 40 }, data: { label: "Live Cams", sub: "/live", system: "red", kind: "nav", iconName: "radio" } },
  { id: "nav-admin", type: "navNode", position: { x: 2050, y: 40 }, data: { label: "Crew & Admin", sub: "/admin", system: "red", kind: "nav", iconName: "shield" } },

  // Columns Underneath
  { id: "f3-1", type: "customNode", position: { x: 0, y: 190 }, data: { label: "Login Modal", sub: "LoginModal.tsx", system: "purple", kind: "component", iconName: "user" } },
  { id: "f3-2", type: "customNode", position: { x: 0, y: 330 }, data: { label: "POST Send Auth PIN", sub: "/api/auth/send-pin", system: "purple", kind: "api", iconName: "terminal" } },
  { id: "f3-3", type: "emailNode", position: { x: 0, y: 470 }, data: { label: "Auth PIN Email", sub: "sendAuthPin", system: "purple", kind: "email", iconName: "mail", details: { emailSubject: "🔑 Your 7th Heaven Verification Code" } } },
  { id: "f3-4", type: "customNode", position: { x: 0, y: 610 }, data: { label: "Enter PIN in Modal", sub: "LoginModal.tsx", system: "purple", kind: "component", iconName: "key" } },
  { id: "f3-5", type: "customNode", position: { x: 0, y: 750 }, data: { label: "POST Verify Auth PIN", sub: "/api/auth/verify-pin", system: "purple", kind: "api", iconName: "terminal" } },
  { id: "f3-6", type: "customNode", position: { x: 0, y: 890 }, data: { label: "Role Destination", sub: "/fans | /crew", system: "purple", kind: "page", iconName: "user" } },

  { id: "f-shows-1", type: "customNode", position: { x: 300, y: 190 }, data: { label: "Show Detail Page", sub: "/shows/[id]", system: "purple", kind: "page", iconName: "globe" } },
  { id: "f-shows-2", type: "customNode", position: { x: 300, y: 330 }, data: { label: "Booking Form", sub: "/book", system: "emerald", kind: "page", iconName: "calendar" } },
  { id: "f-shows-3", type: "customNode", position: { x: 300, y: 470 }, data: { label: "POST Submit Booking", sub: "/api/booking/submit", system: "emerald", kind: "api", iconName: "terminal" } },
  { id: "f4-1", type: "emailNode", position: { x: 300, y: 610 }, data: { label: "Booking Request Email", sub: "bookingConfirmation", system: "emerald", kind: "email", iconName: "mail", details: { emailSubject: "🎸 7th Heaven Booking Request Received" } } },

  { id: "f-fans-1", type: "customNode", position: { x: 600, y: 190 }, data: { label: "Complete Profile", sub: "/fans/complete-profile", system: "purple", kind: "page", iconName: "user" } },
  { id: "f-fans-2", type: "customNode", position: { x: 600, y: 330 }, data: { label: "Member Profile", sub: "/fans/[username]", system: "purple", kind: "page", iconName: "user" } },
  { id: "f-fans-3", type: "customNode", position: { x: 600, y: 470 }, data: { label: "Fan Photo Wall", sub: "/fan-photo-wall", system: "purple", kind: "page", iconName: "film" } },
  { id: "f-fans-4", type: "customNode", position: { x: 600, y: 610 }, data: { label: "Pick Lottery", sub: "/picks", system: "purple", kind: "page", iconName: "sparkles" } },
  { id: "f4-4", type: "emailNode", position: { x: 600, y: 750 }, data: { label: "Raffle Win Email", sub: "raffleWin", system: "purple", kind: "email", iconName: "mail", details: { emailSubject: "🎉 You Won 7th Heaven VIP Passes!" } } },

  { id: "f-merch-1", type: "customNode", position: { x: 900, y: 190 }, data: { label: "QR Merch Scanner", sub: "/qr/merch", system: "emerald", kind: "page", iconName: "shopping" } },
  { id: "f-merch-2", type: "emailNode", position: { x: 900, y: 330 }, data: { label: "Flash Pickup Email", sub: "flashMerchPickup", system: "emerald", kind: "email", iconName: "mail", details: { emailSubject: "⚡ Your Merch Pickup Code" } } },

  { id: "f1-2", type: "customNode", position: { x: 1200, y: 190 }, data: { label: "POST Cruise Signup", sub: "/api/cruise/signup", system: "cyan", kind: "api", iconName: "terminal" } },
  { id: "f1-3", type: "emailNode", position: { x: 1200, y: 330 }, data: { label: "Cruise PIN Email", sub: "cruiseCommunityWelcome", system: "cyan", kind: "email", iconName: "mail", details: { emailSubject: "🔑 Your Cruise Verification Code" } } },
  { id: "f1-4", type: "customNode", position: { x: 1200, y: 470 }, data: { label: "Verify PIN Page", sub: "/cruise/verify", system: "cyan", kind: "page", iconName: "key" } },
  { id: "f1-5", type: "customNode", position: { x: 1200, y: 610 }, data: { label: "POST Verify PIN", sub: "/api/cruise/verify-pin", system: "cyan", kind: "api", iconName: "terminal" } },
  { id: "f1-6", type: "emailNode", position: { x: 1200, y: 750 }, data: { label: "Cruise Confirmed Email", sub: "cruiseConfirmation", system: "cyan", kind: "email", iconName: "mail", details: { emailSubject: "🚢 Thanks for Signing Up! Welcome!" } } },
  { id: "f1-7", type: "customNode", position: { x: 1350, y: 890 }, data: { label: "Cruise Member Hub", sub: "/cruise/dashboard", system: "cyan", kind: "page", iconName: "sparkles" } },

  { id: "f2-2", type: "customNode", position: { x: 1500, y: 190 }, data: { label: "POST Register Request", sub: "/api/cruise/register-pin", system: "cyan", kind: "api", iconName: "terminal" } },
  { id: "f2-3", type: "emailNode", position: { x: 1500, y: 330 }, data: { label: "Register PIN Email", sub: "cruiseRegisterPin", system: "cyan", kind: "email", iconName: "mail", details: { emailSubject: "🚢 Your Verification PIN" } } },

  { id: "f-live-1", type: "customNode", position: { x: 1750, y: 190 }, data: { label: "Michael Stage Cam", sub: "/live/live_michael", system: "red", kind: "page", iconName: "radio" } },
  { id: "f-admin-1", type: "customNode", position: { x: 2050, y: 190 }, data: { label: "Crew HQ Dashboard", sub: "/crew", system: "red", kind: "page", iconName: "shield" } },
];

const NAV_EDGES: Edge[] = [
  { id: "e-home-1", source: "nav-home", target: "f3-1", label: "Sign In", style: { stroke: "#a855f7", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#a855f7" } },
  { id: "e3-1", source: "f3-1", target: "f3-2", label: "Email", style: { stroke: "#a855f7", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#a855f7" } },
  { id: "e3-2", source: "f3-2", target: "f3-3", label: "PIN Email", style: { stroke: "#a855f7", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#a855f7" } },
  { id: "e3-3", source: "f3-3", target: "f3-4", label: "Receives PIN", style: { stroke: "#a855f7", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#a855f7" } },
  { id: "e3-4", source: "f3-4", target: "f3-5", label: "Verifies", style: { stroke: "#a855f7", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#a855f7" } },
  { id: "e3-5", source: "f3-5", target: "f3-6", label: "Session", style: { stroke: "#a855f7", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#a855f7" } },

  { id: "e-shows-1", source: "nav-shows", target: "f-shows-1", style: { stroke: "#a855f7", strokeWidth: 2 } },
  { id: "e-shows-2", source: "nav-shows", target: "f-shows-2", style: { stroke: "#10b981", strokeWidth: 2 } },
  { id: "e-shows-3", source: "f-shows-2", target: "f-shows-3", style: { stroke: "#10b981", strokeWidth: 2 } },
  { id: "e-shows-4", source: "f-shows-3", target: "f4-1", style: { stroke: "#10b981", strokeWidth: 2 } },

  { id: "e-fans-1", source: "nav-fans", target: "f-fans-1", style: { stroke: "#a855f7", strokeWidth: 2 } },
  { id: "e-fans-3", source: "nav-fans", target: "f-fans-3", style: { stroke: "#a855f7", strokeWidth: 2 } },
  { id: "e-fans-4", source: "nav-fans", target: "f-fans-4", style: { stroke: "#a855f7", strokeWidth: 2 } },

  { id: "e-merch-1", source: "nav-merch", target: "f-merch-1", style: { stroke: "#f59e0b", strokeWidth: 2 } },
  { id: "e-merch-2", source: "f-merch-1", target: "f-merch-2", style: { stroke: "#f59e0b", strokeWidth: 2 } },

  { id: "e1-1", source: "nav-cruise", target: "f1-2", style: { stroke: "#06b6d4", strokeWidth: 2 } },
  { id: "e1-2", source: "f1-2", target: "f1-3", style: { stroke: "#06b6d4", strokeWidth: 2 } },
  { id: "e1-3", source: "f1-3", target: "f1-4", style: { stroke: "#06b6d4", strokeWidth: 2 } },
  { id: "e1-4", source: "f1-4", target: "f1-5", style: { stroke: "#06b6d4", strokeWidth: 2 } },
  { id: "e1-5", source: "f1-5", target: "f1-6", style: { stroke: "#06b6d4", strokeWidth: 2 } },
  { id: "e1-6", source: "f1-6", target: "f1-7", style: { stroke: "#06b6d4", strokeWidth: 2 } },

  { id: "e2-1", source: "nav-cruise", target: "f2-2", style: { stroke: "#06b6d4", strokeWidth: 2, strokeDasharray: "5,5" } },
  { id: "e2-2", source: "f2-2", target: "f2-3", style: { stroke: "#06b6d4", strokeWidth: 2 } },

  { id: "e-live-1", source: "nav-live", target: "f-live-1", style: { stroke: "#ef4444", strokeWidth: 2 } },
  { id: "e-admin-1", source: "nav-admin", target: "f-admin-1", style: { stroke: "#ef4444", strokeWidth: 2 } },
];

// --- DATA SET 2: DEDICATED STEP-BY-STEP SIGN-UP JOURNEY & EMAIL PIPELINE ---
const SIGNUP_STEPS_NODES: Node<FlowNodeData>[] = [
  {
    id: "sup-step-1",
    type: "customNode",
    position: { x: 50, y: 120 },
    data: {
      label: "User Fills Sign-Up Form",
      sub: "/cruise or /fans/complete-profile",
      system: "cyan",
      kind: "step",
      stepNumber: 1,
      iconName: "userPlus",
      details: {
        summary: "Step 1: User submits registration form entering name, email, phone number, and guest details.",
        endpointOrPath: "/cruise",
        payloadOrParams: "{ name, email, phone, guest_count, guest_list[] }",
      },
    },
  },
  {
    id: "sup-step-2",
    type: "customNode",
    position: { x: 380, y: 120 },
    data: {
      label: "POST Signup API & PIN Gen",
      sub: "/api/cruise/signup",
      system: "cyan",
      kind: "step",
      stepNumber: 2,
      iconName: "terminal",
      details: {
        summary: "Step 2: Server checks spam filters, creates registration row in Supabase database, and generates a 6-digit PIN code with 30-min expiry.",
        endpointOrPath: "/api/cruise/signup",
        dbActions: [
          "Inserts row into Supabase `cruise_signups`",
          "Generates 6-digit PIN in `pins` table",
          "Encrypts sensitive notes/phone data",
        ],
      },
    },
  },
  {
    id: "sup-step-3",
    type: "emailNode",
    position: { x: 710, y: 120 },
    data: {
      label: "Verification PIN Email Sent",
      sub: "cruiseCommunityWelcome",
      system: "cyan",
      kind: "email",
      stepNumber: 3,
      iconName: "mail",
      details: {
        summary: "Step 3: Transactional email sent to user inbox containing the 6-digit PIN code and security instructions.",
        emailSubject: "🔑 Your 7th Heaven Cruise Verification Code",
        endpointOrPath: "src/lib/email-templates.ts -> cruiseCommunityWelcome",
      },
    },
  },
  {
    id: "sup-step-4",
    type: "customNode",
    position: { x: 1060, y: 120 },
    data: {
      label: "User Submits PIN Code",
      sub: "/cruise/verify?email=...",
      system: "cyan",
      kind: "step",
      stepNumber: 4,
      iconName: "key",
      details: {
        summary: "Step 4: User opens verification page and inputs the 6-digit PIN received in their email.",
        endpointOrPath: "/cruise/verify",
      },
    },
  },
  {
    id: "sup-step-5",
    type: "emailNode",
    position: { x: 1390, y: 120 },
    data: {
      label: "Thanks for Signing Up Email",
      sub: "cruiseConfirmation",
      system: "cyan",
      kind: "email",
      stepNumber: 5,
      iconName: "mail",
      details: {
        summary: "Step 5: Confirmation welcome email sent to user inbox with 'Thanks for Signing Up' badge & Magic Link CTA button.",
        emailSubject: "🚢 Thanks for Signing Up! Welcome to the Cruise Hub!",
        endpointOrPath: "src/lib/email-templates.ts -> cruiseConfirmation",
      },
    },
  },
  {
    id: "sup-step-6",
    type: "customNode",
    position: { x: 1740, y: 120 },
    data: {
      label: "Dashboard Access Granted",
      sub: "/cruise/dashboard",
      system: "cyan",
      kind: "step",
      stepNumber: 6,
      iconName: "sparkles",
      details: {
        summary: "Step 6: Magic Link auto-authenticates the session. User gains full access to member dashboard!",
        endpointOrPath: "/cruise/dashboard",
      },
    },
  },
];

const SIGNUP_STEPS_EDGES: Edge[] = [
  { id: "es-1", source: "sup-step-1", target: "sup-step-2", label: "Submit Form", style: { stroke: "#06b6d4", strokeWidth: 3 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#06b6d4" } },
  { id: "es-2", source: "sup-step-2", target: "sup-step-3", label: "PIN Generated", style: { stroke: "#06b6d4", strokeWidth: 3 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#06b6d4" } },
  { id: "es-3", source: "sup-step-3", target: "sup-step-4", label: "User Checks Inbox", style: { stroke: "#06b6d4", strokeWidth: 3 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#06b6d4" } },
  { id: "es-4", source: "sup-step-4", target: "sup-step-5", label: "PIN Verified", style: { stroke: "#06b6d4", strokeWidth: 3 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#06b6d4" } },
  { id: "es-5", source: "sup-step-5", target: "sup-step-6", label: "Magic Link Auto-Login", style: { stroke: "#06b6d4", strokeWidth: 3 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#06b6d4" } },
];

// --- DATA SET 3: DEDICATED STEP-BY-STEP SIGN-IN JOURNEY & EMAIL PIPELINE ---
const SIGNIN_STEPS_NODES: Node<FlowNodeData>[] = [
  {
    id: "sin-step-1",
    type: "customNode",
    position: { x: 50, y: 120 },
    data: {
      label: "Click Sign In Button",
      sub: "Header / Navigation / Hero",
      system: "purple",
      kind: "step",
      stepNumber: 1,
      iconName: "logIn",
      details: {
        summary: "Step 1: User clicks Sign In button on any page to open authentication modal.",
        endpointOrPath: "LoginModal Trigger",
      },
    },
  },
  {
    id: "sin-step-2",
    type: "customNode",
    position: { x: 380, y: 120 },
    data: {
      label: "Enter Registered Email",
      sub: "LoginModal.tsx (Step 1)",
      system: "purple",
      kind: "step",
      stepNumber: 2,
      iconName: "user",
      details: {
        summary: "Step 2: User enters their email address into the glassmorphism modal input field.",
        endpointOrPath: "src/components/LoginModal.tsx",
      },
    },
  },
  {
    id: "sin-step-3",
    type: "customNode",
    position: { x: 710, y: 120 },
    data: {
      label: "POST Send Auth PIN API",
      sub: "/api/auth/send-pin",
      system: "purple",
      kind: "step",
      stepNumber: 3,
      iconName: "terminal",
      details: {
        summary: "Step 3: Server generates 6-digit login PIN code. Checks fake-logins.json in dev mode.",
        endpointOrPath: "/api/auth/send-pin",
        dbActions: [
          "Generates 6-digit login PIN",
          "Stores PIN in memory/Redis cache",
        ],
      },
    },
  },
  {
    id: "sin-step-4",
    type: "emailNode",
    position: { x: 1040, y: 120 },
    data: {
      label: "Login Verification PIN Email",
      sub: "sendAuthPin",
      system: "purple",
      kind: "email",
      stepNumber: 4,
      iconName: "mail",
      details: {
        summary: "Step 4: Email sent to user inbox with 6-digit sign-in PIN code.",
        emailSubject: "🔑 Your 7th Heaven Sign-In Verification Code",
        endpointOrPath: "src/lib/email-templates.ts -> sendAuthPin",
      },
    },
  },
  {
    id: "sin-step-5",
    type: "customNode",
    position: { x: 1390, y: 120 },
    data: {
      label: "Enter PIN & Verify Session",
      sub: "LoginModal.tsx -> /api/auth/verify-pin",
      system: "purple",
      kind: "step",
      stepNumber: 5,
      iconName: "key",
      details: {
        summary: "Step 5: User inputs 6-digit code into modal. Server validates PIN, sets auth cookie, and redirects user to Dashboard!",
        endpointOrPath: "/api/auth/verify-pin",
        dbActions: [
          "Validates 6-digit PIN match",
          "Creates authenticated session cookie",
          "Redirects to member dashboard",
        ],
      },
    },
  },
];

const SIGNIN_STEPS_EDGES: Edge[] = [
  { id: "esi-1", source: "sin-step-1", target: "sin-step-2", label: "Open Modal", style: { stroke: "#a855f7", strokeWidth: 3 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#a855f7" } },
  { id: "esi-2", source: "sin-step-2", target: "sin-step-3", label: "Submit Email", style: { stroke: "#a855f7", strokeWidth: 3 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#a855f7" } },
  { id: "esi-3", source: "sin-step-3", target: "sin-step-4", label: "PIN Emailed", style: { stroke: "#a855f7", strokeWidth: 3 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#a855f7" } },
  { id: "esi-4", source: "sin-step-4", target: "sin-step-5", label: "Input Code & Redirect", style: { stroke: "#a855f7", strokeWidth: 3 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#a855f7" } },
];

export default function UserFlowMap() {
  const router = useRouter();
  const [activeFlowFilter, setActiveFlowFilter] = useState<"all" | "signup" | "signin">("all");

  const { nodes, edges } = useMemo(() => {
    if (activeFlowFilter === "signup") {
      return { nodes: SIGNUP_STEPS_NODES, edges: SIGNUP_STEPS_EDGES };
    }
    if (activeFlowFilter === "signin") {
      return { nodes: SIGNIN_STEPS_NODES, edges: SIGNIN_STEPS_EDGES };
    }
    return { nodes: NAV_NODES, edges: NAV_EDGES };
  }, [activeFlowFilter]);

  const [flowNodes, setNodes, onNodesChange] = useNodesState(nodes);
  const [flowEdges, setEdges, onEdgesChange] = useEdgesState(edges);
  const [selectedNode, setSelectedNode] = useState<Node<FlowNodeData> | null>(null);

  // Sync state when filter changes
  React.useEffect(() => {
    setNodes(nodes);
    setEdges(edges);
    setSelectedNode(null);
  }, [nodes, edges, setNodes, setEdges]);

  // Handle node click
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node<FlowNodeData>) => {
    setSelectedNode(node);
  }, []);

  return (
    <div className="space-y-4">

      {/* FILTER SUB-BAR FOR SPECIFIC FLOW PIPELINES */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-black/80 border border-purple-500/30 p-2.5 rounded-2xl backdrop-blur-xl shadow-xl">
        <div className="flex items-center gap-1.5 p-1 bg-white/[0.04] rounded-xl border border-white/10">
          <button
            onClick={() => setActiveFlowFilter("all")}
            className={`px-3.5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition flex items-center gap-2 ${
              activeFlowFilter === "all"
                ? "bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.5)]"
                : "text-white/60 hover:text-white"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Full Nav & Page Map</span>
          </button>

          <button
            onClick={() => setActiveFlowFilter("signup")}
            className={`px-3.5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition flex items-center gap-2 ${
              activeFlowFilter === "signup"
                ? "bg-cyan-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)]"
                : "text-white/60 hover:text-white"
            }`}
          >
            <UserPlus className="w-3.5 h-3.5 text-cyan-300" />
            <span>Step-by-Step Sign Up Pipeline</span>
          </button>

          <button
            onClick={() => setActiveFlowFilter("signin")}
            className={`px-3.5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition flex items-center gap-2 ${
              activeFlowFilter === "signin"
                ? "bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                : "text-white/60 hover:text-white"
            }`}
          >
            <LogIn className="w-3.5 h-3.5 text-purple-300" />
            <span>Step-by-Step Sign In Pipeline</span>
          </button>
        </div>

        <div className="text-xs font-mono text-white/50 px-3">
          {activeFlowFilter === "all" && "Showing all top nav pages and vertical user journeys"}
          {activeFlowFilter === "signup" && "Step 1 (Form) ➔ Step 2 (PIN Gen) ➔ Step 3 (PIN Email) ➔ Step 4 (Verify) ➔ Step 5 (Thanks Email) ➔ Step 6 (Dashboard)"}
          {activeFlowFilter === "signin" && "Step 1 (Modal) ➔ Step 2 (Email) ➔ Step 3 (PIN Gen) ➔ Step 4 (PIN Email) ➔ Step 5 (Verify & Cookie Redirect)"}
        </div>
      </div>

      <div className="relative w-full h-[780px] rounded-3xl border border-purple-500/30 bg-[#050505] overflow-hidden shadow-2xl backdrop-blur-2xl">
        
        {/* Header Title Bar depending on filter */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-black/90 backdrop-blur-md border-b border-white/10 px-4 py-2.5 flex items-center justify-between text-xs pointer-events-none select-none">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-black uppercase tracking-widest text-white">
              {activeFlowFilter === "all" && "7th Heaven Site Map & Navigation Journeys"}
              {activeFlowFilter === "signup" && "Dedicated Sign-Up Steps & Verification Email Pipeline"}
              {activeFlowFilter === "signin" && "Dedicated Sign-In Steps & Login PIN Email Pipeline"}
            </span>
          </div>

          <span className="text-[10px] font-mono text-white/40">
            Click any node card for technical parameters & email subject previews
          </span>
        </div>

        {/* React Flow Canvas Engine */}
        <ReactFlow
          nodes={flowNodes}
          edges={flowEdges}
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

        {/* Bottom Legend */}
        <div className="absolute bottom-4 left-4 z-10 flex flex-wrap items-center gap-4 bg-black/90 border border-white/10 px-4 py-2.5 rounded-2xl backdrop-blur-xl text-xs font-bold uppercase tracking-widest">
          <span className="text-white/40 text-[9px] font-mono">System Legend:</span>
          <span className="flex items-center gap-1.5 text-purple-300 text-[10px]">
            <span className="w-2 h-2 rounded-full bg-purple-500" /> Fan & Auth
          </span>
          <span className="flex items-center gap-1.5 text-cyan-300 text-[10px]">
            <span className="w-2 h-2 rounded-full bg-cyan-500" /> Cruise System
          </span>
          <span className="flex items-center gap-1.5 text-amber-300 text-[10px]">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Transactional Email
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
                    {selectedNode.data.stepNumber ? `STEP ${selectedNode.data.stepNumber}` : selectedNode.data.kind.toUpperCase()} NODE INSPECTOR
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

              {/* Email Subject Info */}
              {selectedNode.data.details?.emailSubject && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-300 block">
                    ✉ Transactional Email Subject Line
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

              {/* Database Actions */}
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
    </div>
  );
}
