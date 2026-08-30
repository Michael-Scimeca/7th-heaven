"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Position,
  Handle,
  NodeProps,
  Edge,
  Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import Image from "next/image";

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
  ArrowRight,
  ShoppingBag,
  Film,
  UserPlus,
  LogIn,
  Camera,
  HelpCircle as QuestionIcon,
  GitBranch,
  Layers,
  Key,
  Bell,
  Send,
} from "lucide-react";

// --- Color System Matching Reference Diagram ---
const COLOR_SCHEMES = {
  pink: {
    border: "border-pink-400/60 hover:border-pink-300",
    bg: "bg-[#250d1a]/95",
    text: "text-pink-300",
    badge: "bg-pink-500/25 text-pink-200 border-pink-500/40",
    glow: "shadow-[0_0_25px_rgba(236,72,153,0.3)]",
    lineColor: "#ec4899",
    dot: "bg-pink-400",
  },
  teal: {
    border: "border-teal-400/60 hover:border-teal-300",
    bg: "bg-[#092220]/95",
    text: "text-teal-300",
    badge: "bg-teal-500/25 text-teal-200 border-teal-500/40",
    glow: "shadow-[0_0_25px_rgba(20,184,166,0.3)]",
    lineColor: "#14b8a6",
    dot: "bg-teal-400",
  },
  blue: {
    border: "border-sky-400/60 hover:border-sky-300",
    bg: "bg-[#091e30]/95",
    text: "text-sky-300",
    badge: "bg-sky-500/25 text-sky-200 border-sky-500/40",
    glow: "shadow-[0_0_25px_rgba(56,189,248,0.3)]",
    lineColor: "#38bdf8",
    dot: "bg-sky-400",
  },
  gold: {
    border: "border-amber-400/60 hover:border-amber-300",
    bg: "bg-[#241a08]/95",
    text: "text-amber-300",
    badge: "bg-amber-500/25 text-amber-200 border-amber-500/40",
    glow: "shadow-[0_0_25px_rgba(245,158,11,0.3)]",
    lineColor: "#f59e0b",
    dot: "bg-amber-400",
  },
  purple: {
    border: "border-purple-400/60 hover:border-purple-300",
    bg: "bg-[#1d0d2a]/95",
    text: "text-purple-300",
    badge: "bg-purple-500/25 text-purple-200 border-purple-500/40",
    glow: "shadow-[0_0_25px_rgba(168,85,247,0.3)]",
    lineColor: "#a855f7",
    dot: "bg-purple-400",
  },
  peach: {
    border: "border-orange-400/60 hover:border-orange-300",
    bg: "bg-[#28150a]/95",
    text: "text-orange-300",
    badge: "bg-orange-500/25 text-orange-200 border-orange-500/40",
    glow: "shadow-[0_0_25px_rgba(249,115,22,0.3)]",
    lineColor: "#f97316",
    dot: "bg-orange-400",
  },
  emerald: {
    border: "border-emerald-400/60 hover:border-emerald-300",
    bg: "bg-[#082216]/95",
    text: "text-emerald-300",
    badge: "bg-emerald-500/25 text-emerald-200 border-emerald-500/40",
    glow: "shadow-[0_0_25px_rgba(16,185,129,0.3)]",
    lineColor: "#10b981",
    dot: "bg-emerald-400",
  },
  red: {
    border: "border-red-400/60 hover:border-red-300",
    bg: "bg-[#260909]/95",
    text: "text-red-300",
    badge: "bg-red-500/25 text-red-200 border-red-500/40",
    glow: "shadow-[0_0_25px_rgba(239,68,68,0.3)]",
    lineColor: "#ef4444",
    dot: "bg-red-400",
  },
};

export interface FlowNodeData extends Record<string, unknown> {
  label: string;
  sub: string;
  system: "pink" | "teal" | "blue" | "gold" | "purple" | "peach" | "emerald" | "red";
  kind: "root" | "nav" | "page" | "decision" | "api" | "email";
  iconName: string;
  imgUrl?: string;
  details?: {
    summary?: string;
    endpointOrPath?: string;
    payloadOrParams?: string;
    emailSubject?: string;
    dbActions?: string[];
  };
}

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
  camera: Camera,
  send: Send,
  question: QuestionIcon,
  branch: GitBranch,
};

// 1. Root Node (Home Page / Top Anchor)
function RootNode({ data }: NodeProps<Node<FlowNodeData>>) {
  const scheme = COLOR_SCHEMES[data.system || "pink"];

  return (
    <div className={`relative rounded-lg border-2 ${scheme.border} bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 ${scheme.glow} p-4 w-72 text-center text-white font-bold shadow-2xlbackdrop-blur-[18px] cursor-pointer hover:scale-105 transition duration-300`}>
      <div className="flex items-center justify-between gap-1 border-b border-white/10 pb-1.5 mb-2">
        <span className="px-2.5 py-0.5 rounded-lg bg-black/40 text-cyan-300    text-[12px] font-bold">
          ROOT 0.0
        </span>
        <span className="px-2 py-0.5 rounded bg-white/20 text-white    text-[12px] uppercase tracking-wider">
          PUBLIC HUB
        </span>
      </div>
      <h2 className="uppercase  font-bold flex items-center justify-center gap-2">
        <Globe className="w-5 h-5 text-cyan-200" />
        <span>Home Page (/)</span>
      </h2>
      <p className="font-normal mt-1">
        7th Heaven Official Band Website Root Entry
      </p>
      <Handle type="source" position={Position.Bottom} className="!w-3.5 !h-3.5 !bg-cyan-300 !border-2 !border-black" />
    </div>
  );
}

// 2. Navigation Header Section Card
function NavSectionNode({ data }: NodeProps<Node<FlowNodeData>>) {
  const scheme = COLOR_SCHEMES[data.system || "blue"];
  const IconComp = ICON_MAP[data.iconName] || Globe;

  return (
    <div className={`group relative rounded-lg border-2 ${scheme.border} ${scheme.bg} ${scheme.glow} p-3.5 w-64 text-center backdrop-blur-xl transition-all duration-300 cursor-pointer hover:scale-105 select-none`}>
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-purple-400 !border-2 !border-black" />

      <div className="flex items-center justify-between gap-1 mb-1.5 border-b border-white/10 pb-1.5">
        <span className={`px-2 py-0.5 rounded text-[12px]    font-bold uppercase  ${scheme.badge}`}>
          HEADER NAV
        </span>
        <span className={`w-2 h-2 rounded-lg ${scheme.dot}`} />
      </div>

      <div className="flex items-center justify-center gap-2 my-1">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-white/10 ${scheme.badge}`}>
          <IconComp className="w-4 h-4 text-white" />
        </div>
        <h3 className="font-bold text-white uppercase  truncate">
          {data.label}
        </h3>
      </div>

      <code className="text-[10px]    text-cyan-300/90 block truncate">
        {data.sub}
      </code>

      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-cyan-400 !border-2 !border-black" />
    </div>
  );
}

// 3. Decision Branch Node (Gold Pill)
function DecisionNode({ data }: NodeProps<Node<FlowNodeData>>) {
  return (
    <div className="group relative rounded-lg border border-amber-400/50 bg-[#2d1c07]/95 shadow-[0_0_15px_rgba(245,158,11,0.25)] px-3 py-2 w-48 text-center backdrop-blur-xl transition-all duration-300 cursor-pointer hover:scale-105 select-none">
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-amber-400 !border-2 !border-black" />

      <div className="flex items-center justify-center gap-1.5">
        <GitBranch className="w-3.5 h-3.5 text-amber-300 shrink-0" />
        <span className="font-bold text-amber-200 uppercase  truncate">
          {data.label}
        </span>
      </div>

      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-amber-400 !border-2 !border-black" />
      <Handle type="source" position={Position.Left} className="!w-3 !h-3 !bg-amber-400 !border-2 !border-black" />
      <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-amber-400 !border-2 !border-black" />
    </div>
  );
}

// 4. Standard Page / API Step Node
function PageFlowNode({ data }: NodeProps<Node<FlowNodeData>>) {
  const scheme = COLOR_SCHEMES[data.system || "blue"];
  const IconComp = ICON_MAP[data.iconName] || Globe;

  return (
    <div className={`group relative rounded-lg border ${scheme.border} ${scheme.bg} ${scheme.glow} p-3.5 w-64 backdrop-blur-xl transition-all duration-300 cursor-pointer hover:scale-105 select-none`}>
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-purple-400 !border-2 !border-black" />
      <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-purple-400 !border-2 !border-black" />

      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-white/10 ${scheme.badge}`}>
          <IconComp className="w-4 h-4 text-white" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <span className={`px-1.5 py-0.5 rounded text-[9px]    font-bold uppercase  ${scheme.badge}`}>
              {data.kind.toUpperCase()}
            </span>
            <span className={`w-1.5 h-1.5 rounded-lg ${scheme.dot}`} />
          </div>

          <h4 className="font-bold text-white uppercase  truncate">
            {data.label}
          </h4>

          <code className="text-[10px]    text-cyan-300/80 block truncate mt-0.5">
            {data.sub}
          </code>
        </div>
      </div>

      {data.imgUrl && (
        <div className="mt-2.5 rounded-lg overflow-hidden border border-white/10 relative h-28 bg-black/50 shadow-inner">
          <Image src={data.imgUrl} alt={data.label} fill unoptimized sizes="256px" className="object-cover object-top hover:scale-105 transition duration-300" />
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-cyan-400 !border-2 !border-black" />
      <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-cyan-400 !border-2 !border-black" />
    </div>
  );
}

// 5. Email Touchpoint Node (Dashed border)
function EmailFlowNode({ data }: NodeProps<Node<FlowNodeData>>) {
  const scheme = COLOR_SCHEMES[data.system || "gold"];
  const IconComp = ICON_MAP[data.iconName] || Mail;

  return (
    <div className={`group relative rounded-lg border-2 border-dashed ${scheme.border} ${scheme.bg} ${scheme.glow} p-3.5 w-64 backdrop-blur-xl transition-all duration-300 cursor-pointer hover:scale-105 select-none`}>
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-amber-400 !border-2 !border-black" />

      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]">
          <IconComp className="w-4 h-4 animate-pulse" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="px-1.5 py-0.5 rounded bg-amber-500/25 text-amber-300 border border-amber-500/40 text-[9px]    font-bold uppercase   ">
              ✉ EMAIL TOUCHPOINT
            </span>
            <span className="w-1.5 h-1.5 rounded-lg bg-amber-400" />
          </div>

          <h4 className="font-bold text-white uppercase  truncate">
            {data.label}
          </h4>

          {data.details?.emailSubject && (
            <p className="text-amber-200/90 truncate mt-0.5">
              &quot;{data.details.emailSubject}&quot;
            </p>
          )}

          <code className="text-[12px]    text-white/40 block truncate mt-0.5">
            {data.sub}
          </code>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-amber-400 !border-2 !border-black" />
    </div>
  );
}

const nodeTypes = {
  rootNode: RootNode,
  navNode: NavSectionNode,
  decisionNode: DecisionNode,
  pageNode: PageFlowNode,
  emailNode: EmailFlowNode,
};

// --- PERFECT NON-OVERLAPPING GRID (320px Column Pitch, 140px Row Pitch) ---
const REFERENCE_NODES: Node<FlowNodeData>[] = [
  // ROW 0: ROOT HOME (Y = 30, centered at x = 960)
  { id: "root-home", type: "rootNode", position: { x: 960, y: 30 }, data: { label: "Home Page", sub: "/", system: "pink", kind: "root", iconName: "globe", details: { summary: "7th Heaven Website Root Entry Point", endpointOrPath: "/" } } },

  // ROW 1: HEADER NAVIGATION SECTIONS (Y = 160)
  { id: "nav-shop", type: "navNode", position: { x: 0, y: 160 }, data: { label: "Store & Merch", sub: "/merch", system: "teal", kind: "nav", iconName: "shopping", details: { summary: "Official Band Merchandise Store", endpointOrPath: "/merch" } } },
  { id: "nav-shows", type: "navNode", position: { x: 320, y: 160 }, data: { label: "Shows & Booking", sub: "/shows/past", system: "blue", kind: "nav", iconName: "calendar", details: { summary: "Tour Archive & Venue Booking", endpointOrPath: "/shows/past" } } },
  { id: "nav-cruise", type: "navNode", position: { x: 640, y: 160 }, data: { label: "Cruise 2026", sub: "/cruise", system: "gold", kind: "nav", iconName: "sparkles", details: { summary: "Fan Cruise Signup & Verification", endpointOrPath: "/cruise" } } },
  { id: "nav-fans", type: "navNode", position: { x: 960, y: 160 }, data: { label: "Fan Club & Wall", sub: "/fans", system: "purple", kind: "nav", iconName: "user", details: { summary: "Member Hub & Photo Gallery", endpointOrPath: "/fans" } } },
  { id: "nav-support", type: "navNode", position: { x: 1280, y: 160 }, data: { label: "Contact & Support", sub: "/contact", system: "peach", kind: "nav", iconName: "mail", details: { summary: "Contact Band HQ & FAQs", endpointOrPath: "/contact" } } },
  { id: "nav-live", type: "navNode", position: { x: 1600, y: 160 }, data: { label: "Live Broadcasts", sub: "/live", system: "red", kind: "nav", iconName: "radio", details: { summary: "Live Multi-Cam Room", endpointOrPath: "/live" } } },
  { id: "nav-admin", type: "navNode", position: { x: 1920, y: 160 }, data: { label: "Crew & Admin", sub: "/admin", system: "emerald", kind: "nav", iconName: "shield", details: { summary: "Band HQ & Road Crew", endpointOrPath: "/admin" } } },

  // COLUMN 1: STORE & MERCH (x = 0)
  { id: "c1-1", type: "pageNode", position: { x: 0, y: 290 }, data: { label: "Merch Catalog", sub: "/merch", system: "teal", kind: "page", iconName: "shopping" } },
  { id: "c1-2", type: "pageNode", position: { x: 0, y: 410 }, data: { label: "QR Venue Scanner", sub: "/qr/merch", system: "teal", kind: "page", iconName: "shopping" } },
  { id: "c1-3", type: "pageNode", position: { x: 0, y: 530 }, data: { label: "Shopping Cart", sub: "Local State / Cart", system: "teal", kind: "page", iconName: "shopping" } },
  { id: "c1-dec", type: "decisionNode", position: { x: 32, y: 650 }, data: { label: "Auth Check", sub: "Session State", system: "gold", kind: "decision", iconName: "branch" } },
  { id: "c1-nolog", type: "pageNode", position: { x: -140, y: 760 }, data: { label: "Sign In / Register", sub: "LoginModal.tsx", system: "purple", kind: "page", iconName: "user" } },
  { id: "c1-log", type: "pageNode", position: { x: 140, y: 760 }, data: { label: "Payment Sandbox", sub: "/payment-test", system: "teal", kind: "page", iconName: "credit" } },
  { id: "c1-email", type: "emailNode", position: { x: 0, y: 890 }, data: { label: "Merch Pickup Email", sub: "flashMerchPickup", system: "teal", kind: "email", iconName: "mail", details: { emailSubject: "⚡ Your 7th Heaven Merch Receipt" } } },

  // COLUMN 2: SHOWS & BOOKING (x = 320)
  { id: "c2-1", type: "pageNode", position: { x: 320, y: 290 }, data: { label: "Past Shows Archive", sub: "/shows/past", system: "blue", kind: "page", iconName: "calendar" } },
  { id: "c2-2", type: "pageNode", position: { x: 320, y: 410 }, data: { label: "Show Detail & Tickets", sub: "/shows/[id]", system: "blue", kind: "page", iconName: "globe" } },
  { id: "c2-3", type: "pageNode", position: { x: 320, y: 530 }, data: { label: "Booking Request Form", sub: "/book", system: "emerald", kind: "page", iconName: "calendar" } },
  { id: "c2-api", type: "pageNode", position: { x: 320, y: 650 }, data: { label: "POST Booking API", sub: "/api/booking/submit", system: "emerald", kind: "api", iconName: "terminal" } },
  { id: "c2-email1", type: "emailNode", position: { x: 320, y: 770 }, data: { label: "Booking Confirmation Email", sub: "bookingConfirmation", system: "emerald", kind: "email", iconName: "mail", details: { emailSubject: "🎸 Booking Request Received" } } },
  { id: "c2-dec", type: "decisionNode", position: { x: 352, y: 890 }, data: { label: "Review Status", sub: "Admin Action", system: "gold", kind: "decision", iconName: "branch" } },
  { id: "c2-rej", type: "emailNode", position: { x: 180, y: 990 }, data: { label: "Booking Canceled Email", sub: "bookingCancelled", system: "red", kind: "email", iconName: "mail", details: { emailSubject: "Booking Canceled Feedback" } } },
  { id: "c2-appr", type: "emailNode", position: { x: 460, y: 990 }, data: { label: "Booking Approved Email", sub: "bookingStatusUpdate", system: "emerald", kind: "email", iconName: "mail", details: { emailSubject: "🎉 Booking Status: Approved!" } } },
  { id: "c2-planner", type: "pageNode", position: { x: 460, y: 1110 }, data: { label: "Access Planner Dashboard", sub: "/planner", system: "emerald", kind: "page", iconName: "user", imgUrl: "/sitemap-screenshots/planner-dashboard-v3.png", details: { summary: "Planner manages confirmed booking, schedule & contract", endpointOrPath: "/planner" } } },

  // COLUMN 3: CRUISE 2026 (x = 640)
  { id: "c3-1", type: "pageNode", position: { x: 640, y: 290 }, data: { label: "Cruise Landing Page", sub: "/cruise", system: "gold", kind: "page", iconName: "sparkles" } },
  { id: "c3-api1", type: "pageNode", position: { x: 640, y: 410 }, data: { label: "POST Cruise Signup", sub: "/api/cruise/signup", system: "gold", kind: "api", iconName: "terminal" } },
  { id: "c3-email1", type: "emailNode", position: { x: 640, y: 530 }, data: { label: "Verification PIN Email", sub: "cruiseCommunityWelcome", system: "gold", kind: "email", iconName: "mail", details: { emailSubject: "🔑 Your Verification Code" } } },
  { id: "c3-page2", type: "pageNode", position: { x: 640, y: 650 }, data: { label: "Enter PIN Screen", sub: "/cruise/verify", system: "gold", kind: "page", iconName: "key" } },
  { id: "c3-api2", type: "pageNode", position: { x: 640, y: 770 }, data: { label: "POST Verify PIN API", sub: "/api/cruise/verify-pin", system: "gold", kind: "api", iconName: "terminal" } },
  { id: "c3-email2", type: "emailNode", position: { x: 640, y: 890 }, data: { label: "Thanks For Signing Up Email", sub: "cruiseConfirmation", system: "gold", kind: "email", iconName: "mail", details: { emailSubject: "🚢 Thanks for Signing Up!" } } },
  { id: "c3-dash", type: "pageNode", position: { x: 640, y: 1020 }, data: { label: "Cruiser Dashboard Hub", sub: "/cruise/dashboard", system: "gold", kind: "page", iconName: "sparkles" } },

  // COLUMN 4: FAN CLUB & FAN SIGNUP WORKFLOW (x = 960)
  { id: "c4-1", type: "pageNode", position: { x: 960, y: 290 }, data: { label: "Fan Account Signup", sub: "LoginModal.tsx / /fans", system: "purple", kind: "page", iconName: "userPlus" } },
  { id: "c4-api1", type: "pageNode", position: { x: 960, y: 410 }, data: { label: "POST Fan Register API", sub: "/api/auth/register", system: "purple", kind: "api", iconName: "terminal" } },
  { id: "c4-email1", type: "emailNode", position: { x: 960, y: 530 }, data: { label: "Fan Security PIN Email", sub: "fanAccountWelcome", system: "purple", kind: "email", iconName: "mail", details: { emailSubject: "🔑 Your 6-Digit Fan Security PIN" } } },
  { id: "c4-verify", type: "pageNode", position: { x: 960, y: 650 }, data: { label: "Fan PIN Verification Step", sub: "PIN Verification Module", system: "purple", kind: "page", iconName: "key" } },
  { id: "c4-profile", type: "pageNode", position: { x: 960, y: 770 }, data: { label: "Complete Profile Onboarding", sub: "/fans/complete-profile", system: "purple", kind: "page", iconName: "userPlus" } },
  { id: "c4-dash", type: "pageNode", position: { x: 960, y: 890 }, data: { label: "Member Account Hub", sub: "/fans/[username]", system: "purple", kind: "page", iconName: "user" } },
  { id: "c4-wall", type: "pageNode", position: { x: 960, y: 1010 }, data: { label: "Fan Photo Wall & Live Alerts", sub: "/fan-photo-wall", system: "purple", kind: "page", iconName: "camera" } },
  { id: "c4-lottery", type: "pageNode", position: { x: 960, y: 1130 }, data: { label: "Guitar Pick Lottery", sub: "/picks", system: "purple", kind: "page", iconName: "sparkles" } },
  { id: "c4-email2", type: "emailNode", position: { x: 960, y: 1250 }, data: { label: "VIP Raffle Win Email", sub: "raffleWin", system: "purple", kind: "email", iconName: "mail", details: { emailSubject: "🎉 You Won VIP Backstage Passes!" } } },

  // COLUMN 5: CONTACT & SUPPORT (x = 1280)
  { id: "c5-1", type: "pageNode", position: { x: 1280, y: 290 }, data: { label: "Contact Us Form", sub: "/contact", system: "peach", kind: "page", iconName: "mail" } },
  { id: "c5-2", type: "pageNode", position: { x: 1280, y: 410 }, data: { label: "Show & Ticket FAQ", sub: "/faq", system: "peach", kind: "page", iconName: "question" } },
  { id: "c5-3", type: "pageNode", position: { x: 1280, y: 530 }, data: { label: "Media & Press Kit", sub: "/media", system: "peach", kind: "page", iconName: "film" } },
  { id: "c5-4", type: "pageNode", position: { x: 1280, y: 650 }, data: { label: "Career Features", sub: "/features", system: "peach", kind: "page", iconName: "globe" } },
  { id: "c5-5", type: "pageNode", position: { x: 1280, y: 770 }, data: { label: "Return Policy", sub: "/returns", system: "peach", kind: "page", iconName: "globe" } },
  { id: "c5-6", type: "pageNode", position: { x: 1280, y: 890 }, data: { label: "Privacy Policy & Terms", sub: "/privacy & /terms", system: "peach", kind: "page", iconName: "shield" } },

  // COLUMN 6: LIVE BROADCASTS (x = 1600)
  { id: "c6-1", type: "pageNode", position: { x: 1600, y: 290 }, data: { label: "Main Broadcast Room", sub: "/live", system: "red", kind: "page", iconName: "radio" } },
  { id: "c6-2", type: "pageNode", position: { x: 1600, y: 410 }, data: { label: "Michael Stage Cam", sub: "/live/live_michael", system: "red", kind: "page", iconName: "radio" } },
  { id: "c6-3", type: "pageNode", position: { x: 1600, y: 530 }, data: { label: "Ryan Guitar Cam", sub: "/live/live_ryan", system: "red", kind: "page", iconName: "radio" } },
  { id: "c6-4", type: "pageNode", position: { x: 1600, y: 650 }, data: { label: "Sammy Drum Cam", sub: "/live/live_sammy", system: "red", kind: "page", iconName: "radio" } },

  // COLUMN 7: CREW & ADMIN (x = 1920)
  { id: "c7-1", type: "pageNode", position: { x: 1920, y: 290 }, data: { label: "Admin Portal", sub: "/admin", system: "emerald", kind: "page", iconName: "lock" } },
  { id: "c7-2", type: "pageNode", position: { x: 1920, y: 410 }, data: { label: "Crew HQ Dashboard", sub: "/crew", system: "emerald", kind: "page", iconName: "shield" } },
  { id: "c7-email1", type: "emailNode", position: { x: 1920, y: 530 }, data: { label: "Schedule Shift Alert", sub: "scheduleChangeAlert", system: "emerald", kind: "email", iconName: "mail", details: { emailSubject: "⚠️ Stage Schedule Update Alert" } } },
  { id: "c7-3", type: "pageNode", position: { x: 1920, y: 650 }, data: { label: "Newsletter Studio", sub: "/admin/emails", system: "emerald", kind: "page", iconName: "mail" } },
  { id: "c7-email2", type: "emailNode", position: { x: 1920, y: 770 }, data: { label: "Newsletter Broadcast Email", sub: "newsletterBlast", system: "emerald", kind: "email", iconName: "mail", details: { emailSubject: "⚡ 7th Heaven Tour Announcement" } } },
];

const REFERENCE_EDGES: Edge[] = [
  { id: "er-1", source: "root-home", target: "nav-shop", type: "smoothstep", style: { stroke: "#14b8a6", strokeWidth: 2 } },
  { id: "er-2", source: "root-home", target: "nav-shows", type: "smoothstep", style: { stroke: "#38bdf8", strokeWidth: 2 } },
  { id: "er-3", source: "root-home", target: "nav-cruise", type: "smoothstep", style: { stroke: "#f59e0b", strokeWidth: 2 } },
  { id: "er-4", source: "root-home", target: "nav-fans", type: "smoothstep", style: { stroke: "#a855f7", strokeWidth: 2 } },
  { id: "er-5", source: "root-home", target: "nav-support", type: "smoothstep", style: { stroke: "#f97316", strokeWidth: 2 } },
  { id: "er-6", source: "root-home", target: "nav-live", type: "smoothstep", style: { stroke: "#ef4444", strokeWidth: 2 } },
  { id: "er-7", source: "root-home", target: "nav-admin", type: "smoothstep", style: { stroke: "#10b981", strokeWidth: 2 } },

  { id: "ec1-1", source: "nav-shop", target: "c1-1", type: "smoothstep", style: { stroke: "#14b8a6", strokeWidth: 2 } },
  { id: "ec1-2", source: "c1-1", target: "c1-2", type: "smoothstep", style: { stroke: "#14b8a6", strokeWidth: 2 } },
  { id: "ec1-3", source: "c1-2", target: "c1-3", type: "smoothstep", style: { stroke: "#14b8a6", strokeWidth: 2 } },
  { id: "ec1-4", source: "c1-3", target: "c1-dec", type: "smoothstep", style: { stroke: "#14b8a6", strokeWidth: 2 } },
  { id: "ec1-5", source: "c1-dec", target: "c1-nolog", type: "smoothstep", label: "Not Logged In", style: { stroke: "#f59e0b", strokeWidth: 2 } },
  { id: "ec1-6", source: "c1-dec", target: "c1-log", type: "smoothstep", label: "Logged In", style: { stroke: "#14b8a6", strokeWidth: 2 } },
  { id: "ec1-7", source: "c1-nolog", target: "c1-log", type: "smoothstep", style: { stroke: "#14b8a6", strokeWidth: 2 } },
  { id: "ec1-8", source: "c1-log", target: "c1-email", type: "smoothstep", style: { stroke: "#14b8a6", strokeWidth: 2 } },

  { id: "ec2-1", source: "nav-shows", target: "c2-1", type: "smoothstep", style: { stroke: "#38bdf8", strokeWidth: 2 } },
  { id: "ec2-2", source: "c2-1", target: "c2-2", type: "smoothstep", style: { stroke: "#38bdf8", strokeWidth: 2 } },
  { id: "ec2-3", source: "c2-2", target: "c2-3", type: "smoothstep", style: { stroke: "#10b981", strokeWidth: 2 } },
  { id: "ec2-4", source: "c2-3", target: "c2-api", type: "smoothstep", style: { stroke: "#10b981", strokeWidth: 2 } },
  { id: "ec2-5", source: "c2-api", target: "c2-email1", type: "smoothstep", style: { stroke: "#10b981", strokeWidth: 2 } },
  { id: "ec2-6", source: "c2-email1", target: "c2-dec", type: "smoothstep", style: { stroke: "#f59e0b", strokeWidth: 2 } },
  { id: "ec2-7", source: "c2-dec", target: "c2-rej", type: "smoothstep", label: "Rejected", style: { stroke: "#ef4444", strokeWidth: 2 } },
  { id: "ec2-8", source: "c2-dec", target: "c2-appr", type: "smoothstep", label: "Approved", style: { stroke: "#10b981", strokeWidth: 2 } },
  { id: "ec2-9", source: "c2-appr", target: "c2-planner", type: "smoothstep", style: { stroke: "#10b981", strokeWidth: 2 } },

  { id: "ec3-1", source: "nav-cruise", target: "c3-1", type: "smoothstep", style: { stroke: "#f59e0b", strokeWidth: 2 } },
  { id: "ec3-2", source: "c3-1", target: "c3-api1", type: "smoothstep", style: { stroke: "#f59e0b", strokeWidth: 2 } },
  { id: "ec3-3", source: "c3-api1", target: "c3-email1", type: "smoothstep", style: { stroke: "#f59e0b", strokeWidth: 2 } },
  { id: "ec3-4", source: "c3-email1", target: "c3-page2", type: "smoothstep", style: { stroke: "#f59e0b", strokeWidth: 2 } },
  { id: "ec3-5", source: "c3-page2", target: "c3-api2", type: "smoothstep", style: { stroke: "#f59e0b", strokeWidth: 2 } },
  { id: "ec3-6", source: "c3-api2", target: "c3-email2", type: "smoothstep", style: { stroke: "#f59e0b", strokeWidth: 2 } },
  { id: "ec3-7", source: "c3-email2", target: "c3-dash", type: "smoothstep", style: { stroke: "#f59e0b", strokeWidth: 2 } },

  { id: "ec4-1", source: "nav-fans", target: "c4-1", type: "smoothstep", style: { stroke: "#a855f7", strokeWidth: 2 } },
  { id: "ec4-2", source: "c4-1", target: "c4-api1", type: "smoothstep", style: { stroke: "#a855f7", strokeWidth: 2 } },
  { id: "ec4-3", source: "c4-api1", target: "c4-email1", type: "smoothstep", style: { stroke: "#a855f7", strokeWidth: 2 } },
  { id: "ec4-4", source: "c4-email1", target: "c4-verify", type: "smoothstep", style: { stroke: "#a855f7", strokeWidth: 2 } },
  { id: "ec4-5", source: "c4-verify", target: "c4-profile", type: "smoothstep", style: { stroke: "#a855f7", strokeWidth: 2 } },
  { id: "ec4-6", source: "c4-profile", target: "c4-dash", type: "smoothstep", style: { stroke: "#a855f7", strokeWidth: 2 } },
  { id: "ec4-7", source: "c4-dash", target: "c4-wall", type: "smoothstep", style: { stroke: "#a855f7", strokeWidth: 2 } },
  { id: "ec4-8", source: "c4-wall", target: "c4-lottery", type: "smoothstep", style: { stroke: "#a855f7", strokeWidth: 2 } },
  { id: "ec4-9", source: "c4-lottery", target: "c4-email2", type: "smoothstep", style: { stroke: "#a855f7", strokeWidth: 2 } },

  { id: "ec5-1", source: "nav-support", target: "c5-1", type: "smoothstep", style: { stroke: "#f97316", strokeWidth: 2 } },
  { id: "ec5-2", source: "c5-1", target: "c5-2", type: "smoothstep", style: { stroke: "#f97316", strokeWidth: 2 } },
  { id: "ec5-3", source: "c5-2", target: "c5-3", type: "smoothstep", style: { stroke: "#f97316", strokeWidth: 2 } },
  { id: "ec5-4", source: "c5-3", target: "c5-4", type: "smoothstep", style: { stroke: "#f97316", strokeWidth: 2 } },
  { id: "ec5-5", source: "c5-4", target: "c5-5", type: "smoothstep", style: { stroke: "#f97316", strokeWidth: 2 } },
  { id: "ec5-6", source: "c5-5", target: "c5-6", type: "smoothstep", style: { stroke: "#f97316", strokeWidth: 2 } },

  { id: "ec6-1", source: "nav-live", target: "c6-1", type: "smoothstep", style: { stroke: "#ef4444", strokeWidth: 2 } },
  { id: "ec6-2", source: "c6-1", target: "c6-2", type: "smoothstep", style: { stroke: "#ef4444", strokeWidth: 2 } },
  { id: "ec6-3", source: "c6-2", target: "c6-3", type: "smoothstep", style: { stroke: "#ef4444", strokeWidth: 2 } },
  { id: "ec6-4", source: "c6-3", target: "c6-4", type: "smoothstep", style: { stroke: "#ef4444", strokeWidth: 2 } },

  { id: "ec7-1", source: "nav-admin", target: "c7-1", type: "smoothstep", style: { stroke: "#10b981", strokeWidth: 2 } },
  { id: "ec7-2", source: "c7-1", target: "c7-2", type: "smoothstep", style: { stroke: "#10b981", strokeWidth: 2 } },
  { id: "ec7-3", source: "c7-2", target: "c7-email1", type: "smoothstep", style: { stroke: "#10b981", strokeWidth: 2 } },
  { id: "ec7-4", source: "c7-email1", target: "c7-3", type: "smoothstep", style: { stroke: "#10b981", strokeWidth: 2 } },
  { id: "ec7-5", source: "c7-3", target: "c7-email2", type: "smoothstep", style: { stroke: "#10b981", strokeWidth: 2 } },
];

export default function UserFlowMap() {
  const router = useRouter();
  const [flowNodes, setNodes, onNodesChange] = useNodesState(REFERENCE_NODES);
  const [flowEdges, setEdges, onEdgesChange] = useEdgesState(REFERENCE_EDGES);
  const [selectedNode, setSelectedNode] = useState<Node<FlowNodeData> | null>(null);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node<FlowNodeData>) => {
    setSelectedNode(node);
  }, []);

  return (
    <div className="relative w-full h-[850px] rounded-lg border border-purple-500/30 bg-[#050505] overflow-hidden shadow-2xl backdrop-blur-[45px]">

      {/* Header Info Bar */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-black/90 backdrop-blur-[45px] border-b border-white/10 px-4 py-2.5 flex items-center justify-between pointer-events-none select-none">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-lg bg-pink-400 animate-pulse" />
          <span className="font-bold uppercase    text-white">
            7th Heaven User Flow & Architecture Tree Map
          </span>
        </div>

        <span className="text-[10px]    text-white/50">
          Root Home ➔ Header Nav Cards ➔ Cascading Decision Trees & Email Pipelines
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
        fitViewOptions={{ padding: 0.08 }}
        colorMode="dark"
        className="pt-10"
      >
        <Background color="#1e1b4b" gap={20} size={1} />
        <Controls className="!bg-black/80 !border-white/10 !text-white ! rounded-lg overflow-hidden" />
        <MiniMap
          style={{ height: 110, width: 160 }}
          nodeColor={(n) => {
            const d = n.data as FlowNodeData;
            return d.system === "pink"
              ? "#ec4899"
              : d.system === "teal"
                ? "#14b8a6"
                : d.system === "blue"
                  ? "#38bdf8"
                  : d.system === "gold"
                    ? "#f59e0b"
                    : d.system === "purple"
                      ? "#a855f7"
                      : d.system === "peach"
                        ? "#f97316"
                        : d.system === "red"
                          ? "#ef4444"
                          : "#10b981";
          }}
          maskColor="rgba(0, 0, 0, 0.7)"
          className="!bg-black/90 !border-white/10 !rounded-xl"
        />
      </ReactFlow>

      {/* Bottom Color Legend */}
      <div className="absolute bottom-4 left-4 z-10 flex flex-wrap items-center gap-3 bg-black/90 border border-white/10 px-4 py-2 rounded-lg backdrop-blur-xl font-bold uppercase   ">
        <span className="text-white/40 text-[12px]   ">Legend:</span>
        <span className="flex items-center gap-1.5 text-pink-300 text-[10px]"><span className="w-2 h-2 rounded-lg bg-pink-400" /> Home</span>
        <span className="flex items-center gap-1.5 text-teal-300 text-[10px]"><span className="w-2 h-2 rounded-lg bg-teal-400" /> Merch</span>
        <span className="flex items-center gap-1.5 text-sky-300 text-[10px]"><span className="w-2 h-2 rounded-lg bg-sky-400" /> Shows</span>
        <span className="flex items-center gap-1.5 text-amber-300 text-[10px]"><span className="w-2 h-2 rounded-lg bg-amber-400" /> Cruise & PINs</span>
        <span className="flex items-center gap-1.5 text-purple-300 text-[10px]"><span className="w-2 h-2 rounded-lg bg-purple-400" /> Fan Club</span>
        <span className="flex items-center gap-1.5 text-orange-300 text-[10px]"><span className="w-2 h-2 rounded-lg bg-orange-400" /> Contact</span>
        <span className="flex items-center gap-1.5 text-emerald-300 text-[10px]"><span className="w-2 h-2 rounded-lg bg-emerald-400" /> Admin</span>
      </div>

      {/* Slide-out Inspector Detail Drawer */}
      {selectedNode && (
        <div className="absolute top-14 right-4 bottom-4 w-96 bg-black/95 border border-purple-500/40 rounded-lg p-6 shadow-2xlbackdrop-blur-[18px] z-30 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right-8 duration-200">
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300    text-[12px] font-bold uppercase tracking-wider">
                  {selectedNode.data.kind.toUpperCase()} NODE INSPECTOR
                </span>
                <h3 className="font-bold uppercase  text-white mt-1">
                  {selectedNode.data.label}
                </h3>
                <code className="   text-cyan-300 block mt-0.5">
                  {selectedNode.data.sub}
                </code>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-white hover:text-white hover:bg-white/20 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Summary */}
            <div className="space-y-2">
              <span className="text-[10px]    font-bold uppercase    text-white/40 block">
                Technical Summary
              </span>
              <p className="leading-relaxed bg-white/[0.03] p-3 rounded-lg border border-white/10">
                {selectedNode.data.details?.summary || `Interactive ${selectedNode.data.label} node step in the 7th Heaven web app.`}
              </p>
            </div>

            {/* Email Subject Info */}
            {selectedNode.data.details?.emailSubject && (
              <div className="space-y-1.5">
                <span className="text-[10px]    font-bold uppercase    text-amber-300 block">
                  ✉ Transactional Email Subject Line
                </span>
                <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg    text-amber-200">
                  {selectedNode.data.details.emailSubject}
                </div>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            {selectedNode.data.sub.startsWith("/") ? (
              <button
                onClick={() => router.push(selectedNode.data.sub.split("?")[0])}
                className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold uppercase  transition flex items-center justify-center gap-2 shadow-lg"
              >
                <span>Visit Route ({selectedNode.data.sub.split("?")[0]})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setSelectedNode(null)}
                className="w-full py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 font-bold uppercase  transition"
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
