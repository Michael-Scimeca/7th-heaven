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

// --- Color System ---
const COLOR_SCHEMES = {
  pink: {
    border: "border-pink-500/50 hover:border-pink-300",
    bg: "bg-[#200a16]",
    text: "text-pink-300",
    badge: "bg-pink-500/20 text-pink-300 border-pink-500/40",
    glow: "shadow-[0_0_20px_rgba(236,72,153,0.25)]",
    lineColor: "#ec4899",
    dot: "bg-pink-400",
  },
  teal: {
    border: "border-teal-500/50 hover:border-teal-300",
    bg: "bg-[#061c1a]",
    text: "text-teal-300",
    badge: "bg-teal-500/20 text-teal-300 border-teal-500/40",
    glow: "shadow-[0_0_20px_rgba(20,184,166,0.25)]",
    lineColor: "#14b8a6",
    dot: "bg-teal-400",
  },
  blue: {
    border: "border-sky-500/50 hover:border-sky-300",
    bg: "bg-[#071927]",
    text: "text-sky-300",
    badge: "bg-sky-500/20 text-sky-300 border-sky-500/40",
    glow: "shadow-[0_0_20px_rgba(56,189,248,0.25)]",
    lineColor: "#38bdf8",
    dot: "bg-sky-400",
  },
  gold: {
    border: "border-amber-500/50 hover:border-amber-300",
    bg: "bg-[#1f1606]",
    text: "text-amber-300",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    glow: "shadow-[0_0_20px_rgba(245,158,11,0.25)]",
    lineColor: "#f59e0b",
    dot: "bg-amber-400",
  },
  purple: {
    border: "border-purple-500/50 hover:border-purple-300",
    bg: "bg-[#180a24]",
    text: "text-purple-300",
    badge: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    glow: "shadow-[0_0_20px_rgba(168,85,247,0.25)]",
    lineColor: "#a855f7",
    dot: "bg-purple-400",
  },
  peach: {
    border: "border-orange-500/50 hover:border-orange-300",
    bg: "bg-[#211107]",
    text: "text-orange-300",
    badge: "bg-orange-500/20 text-orange-300 border-orange-500/40",
    glow: "shadow-[0_0_20px_rgba(249,115,22,0.25)]",
    lineColor: "#f97316",
    dot: "bg-orange-400",
  },
  emerald: {
    border: "border-emerald-500/50 hover:border-emerald-300",
    bg: "bg-[#061d12]",
    text: "text-emerald-300",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    glow: "shadow-[0_0_20px_rgba(16,185,129,0.25)]",
    lineColor: "#10b981",
    dot: "bg-emerald-400",
  },
  red: {
    border: "border-red-500/50 hover:border-red-300",
    bg: "bg-[#210707]",
    text: "text-red-300",
    badge: "bg-red-500/20 text-red-300 border-red-500/40",
    glow: "shadow-[0_0_20px_rgba(239,68,68,0.25)]",
    lineColor: "#ef4444",
    dot: "bg-red-400",
  },
};

export interface FlowNodeData {
  label: string;
  sub: string;
  system: "pink" | "teal" | "blue" | "gold" | "purple" | "peach" | "emerald" | "red";
  kind: "root" | "nav" | "page" | "decision" | "api" | "email";
  iconName: string;
  details?: {
    summary: string;
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

// --- MINI PAGE PREVIEW SCREENSHOT THUMBNAIL COMPONENT ---
function MiniPagePreview({ kind, path, label }: { kind: string; path: string; label: string; system: string }) {
  if (kind === "email") {
    return (
      <div className="w-full h-16 rounded-lg bg-black/90 border border-amber-500/40 p-2 flex flex-col justify-between overflow-hidden relative group-hover:border-amber-300 transition">
        <div className="flex items-center justify-between border-b border-amber-500/20 pb-1">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
          </div>
          <span className="text-[7.5px] font-mono text-amber-300 font-bold">✉ EMAIL CLIENT</span>
        </div>
        <div className="space-y-1 my-auto">
          <div className="h-1.5 bg-amber-400/50 rounded w-3/4 animate-pulse" />
          <div className="h-1 bg-white/20 rounded w-1/2" />
        </div>
        <div className="flex items-center justify-between pt-0.5 border-t border-amber-500/20 text-[7px] font-mono">
          <span className="text-white/40">7th Heaven System</span>
          <span className="text-amber-300 font-extrabold">RESEND API</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-20 rounded-lg bg-[#07070a] border border-white/15 p-2 flex flex-col justify-between overflow-hidden relative shadow-inner group-hover:border-purple-400/60 transition">
      {/* Mock Browser Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-1">
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500/80" />
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500/80" />
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80" />
        </div>
        <span className="text-[7.5px] font-mono text-cyan-300 truncate max-w-[140px] font-semibold">{path}</span>
      </div>

      {/* Mini Page Content Screenshot Preview */}
      <div className="py-1 space-y-1 flex-1 flex flex-col justify-center">
        {path === "/" ? (
          <div className="space-y-1">
            <div className="h-4.5 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 rounded flex items-center justify-center text-[7.5px] font-extrabold text-white uppercase tracking-wider shadow">
              HERO STREAM
            </div>
            <div className="flex gap-1">
              <div className="h-1 bg-white/30 rounded w-1/2" />
              <div className="h-1 bg-purple-400/50 rounded w-1/2" />
            </div>
          </div>
        ) : path.includes("merch") ? (
          <div className="grid grid-cols-3 gap-1">
            <div className="h-5 bg-teal-500/20 border border-teal-500/30 rounded flex items-center justify-center text-[8px]">👕</div>
            <div className="h-5 bg-teal-500/20 border border-teal-500/30 rounded flex items-center justify-center text-[8px]">💿</div>
            <div className="h-5 bg-teal-500/20 border border-teal-500/30 rounded flex items-center justify-center text-[8px]">🎫</div>
          </div>
        ) : path.includes("shows") || path.includes("book") ? (
          <div className="space-y-1">
            <div className="h-2.5 bg-sky-500/25 border border-sky-500/30 rounded flex items-center justify-between px-1 text-[6.5px] font-bold text-white">
              <span>CONCERT ARCHIVE</span>
              <span className="font-mono text-cyan-300">TOUR DATES</span>
            </div>
            <div className="h-2 bg-white/10 rounded flex items-center justify-between px-1 text-[6px] text-white/60">
              <span>VENUE MAP</span>
              <span className="text-emerald-300 font-bold">BOOK BAND</span>
            </div>
          </div>
        ) : path.includes("cruise") ? (
          <div className="space-y-1">
            <div className="h-4 bg-gradient-to-r from-amber-600 via-yellow-600 to-cyan-600 rounded flex items-center justify-center text-[7.5px] font-black text-white tracking-wider shadow">
              🚢 CRUISE 2026
            </div>
            <div className="flex gap-1">
              <div className="h-1 bg-amber-400/40 rounded w-2/3" />
              <div className="h-1 bg-cyan-400/40 rounded w-1/3" />
            </div>
          </div>
        ) : path.includes("fans") || path.includes("wall") || path.includes("picks") ? (
          <div className="grid grid-cols-2 gap-1">
            <div className="h-5 bg-purple-500/25 border border-purple-500/30 rounded flex items-center justify-center text-[7px] font-bold text-purple-200">
              📸 PHOTO WALL
            </div>
            <div className="h-5 bg-purple-500/25 border border-purple-500/30 rounded flex items-center justify-center text-[7px] font-bold text-purple-200">
              🏆 PICK LOTTERY
            </div>
          </div>
        ) : path.includes("live") ? (
          <div className="h-5 bg-red-950/90 border border-red-500/50 rounded flex items-center justify-center text-[7.5px] font-black text-red-300 animate-pulse tracking-wider">
            🔴 LIVE BROADCAST CAM
          </div>
        ) : path.includes("admin") || path.includes("crew") ? (
          <div className="space-y-1">
            <div className="h-2.5 bg-emerald-500/25 border border-emerald-500/30 rounded flex items-center justify-between px-1 text-[6.5px] font-bold text-emerald-300">
              <span>ADMIN HQ</span>
              <span>CREW SHIFTS</span>
            </div>
            <div className="h-2 bg-white/10 rounded w-3/4" />
          </div>
        ) : (
          <div className="space-y-1">
            <div className="h-2.5 bg-orange-500/20 border border-orange-500/30 rounded flex items-center justify-between px-1 text-[6.5px] font-bold text-orange-200">
              <span>PAGE CONTENT</span>
              <span>MEDIA KIT</span>
            </div>
            <div className="h-1.5 bg-white/15 rounded w-1/2" />
          </div>
        )}
      </div>

      {/* Mini Page Footer */}
      <div className="flex items-center justify-between pt-0.5 border-t border-white/10 text-[7px] font-mono">
        <span className="text-white/40 truncate max-w-[120px]">{label}</span>
        <span className="text-purple-300 font-extrabold">LIVE PREVIEW</span>
      </div>
    </div>
  );
}

// 1. Root Node (Home Page / Top Center Anchor)
function RootNode({ data }: NodeProps<Node<FlowNodeData>>) {
  return (
    <div className="relative rounded-2xl border-2 border-pink-400/80 bg-gradient-to-r from-purple-700 via-pink-600 to-cyan-600 shadow-[0_0_30px_rgba(236,72,153,0.4)] p-4 w-72 text-center text-white font-black shadow-2xl backdrop-blur-2xl cursor-pointer hover:scale-105 transition duration-300">
      <div className="flex items-center justify-between gap-1 border-b border-white/20 pb-1.5 mb-2">
        <span className="px-2 py-0.5 rounded-full bg-black/40 text-cyan-300 font-mono text-[9px] font-bold">
          ROOT 0.0
        </span>
        <span className="px-2 py-0.5 rounded bg-white/20 text-white font-mono text-[9px] uppercase tracking-wider">
          PUBLIC HUB
        </span>
      </div>

      <MiniPagePreview kind={data.kind} path={data.sub} label={data.label} system={data.system} />

      <h2 className="text-base uppercase tracking-wider font-extrabold flex items-center justify-center gap-2 mt-2">
        <Globe className="w-4 h-4 text-cyan-200" />
        <span>HOME PAGE (/)</span>
      </h2>

      <Handle type="source" position={Position.Bottom} className="!w-2.5 !h-2.5 !bg-cyan-300 !border-0" />
    </div>
  );
}

// 2. Navigation Header Section Card
function NavSectionNode({ data }: NodeProps<Node<FlowNodeData>>) {
  const scheme = COLOR_SCHEMES[data.system || "blue"];
  const IconComp = ICON_MAP[data.iconName] || Globe;

  return (
    <div className={`group relative rounded-2xl border-2 ${scheme.border} ${scheme.bg} ${scheme.glow} p-3.5 w-64 text-center backdrop-blur-xl transition-all duration-300 cursor-pointer hover:scale-105 select-none shadow-xl space-y-2`}>
      <Handle type="target" position={Position.Top} className="!w-2.5 !h-2.5 !bg-purple-400 !border-0" />
      
      <div className="flex items-center justify-between gap-1 border-b border-white/10 pb-1">
        <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider ${scheme.badge}`}>
          HEADER NAV
        </span>
        <span className={`w-1.5 h-1.5 rounded-full ${scheme.dot}`} />
      </div>

      <MiniPagePreview kind={data.kind} path={data.sub} label={data.label} system={data.system} />

      <div className="flex items-center justify-center gap-2 pt-1">
        <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border border-white/10 ${scheme.badge}`}>
          <IconComp className="w-3.5 h-3.5 text-white" />
        </div>
        <h3 className="font-black text-xs text-white uppercase tracking-wider truncate">
          {data.label}
        </h3>
      </div>

      <Handle type="source" position={Position.Bottom} className="!w-2.5 !h-2.5 !bg-cyan-400 !border-0" />
    </div>
  );
}

// 3. Decision Branch Node (Gold Pill)
function DecisionNode({ data }: NodeProps<Node<FlowNodeData>>) {
  return (
    <div className="group relative rounded-xl border border-amber-400/60 bg-[#2b1b07] shadow-[0_0_15px_rgba(245,158,11,0.3)] px-3 py-2 w-48 text-center backdrop-blur-xl transition-all duration-300 cursor-pointer hover:scale-105 select-none">
      <Handle type="target" position={Position.Top} className="!w-2.5 !h-2.5 !bg-amber-400 !border-0" />
      
      <div className="flex items-center justify-center gap-1.5">
        <GitBranch className="w-3.5 h-3.5 text-amber-300 shrink-0" />
        <span className="font-black text-[11px] text-amber-200 uppercase tracking-wider truncate">
          {data.label}
        </span>
      </div>

      <Handle type="source" position={Position.Bottom} className="!w-2.5 !h-2.5 !bg-amber-400 !border-0" />
      <Handle type="source" position={Position.Left} className="!w-2.5 !h-2.5 !bg-amber-400 !border-0" />
      <Handle type="source" position={Position.Right} className="!w-2.5 !h-2.5 !bg-amber-400 !border-0" />
    </div>
  );
}

// 4. Standard Page / API Step Node
function PageFlowNode({ data }: NodeProps<Node<FlowNodeData>>) {
  const scheme = COLOR_SCHEMES[data.system || "blue"];
  const IconComp = ICON_MAP[data.iconName] || Globe;

  return (
    <div className={`group relative rounded-2xl border ${scheme.border} ${scheme.bg} ${scheme.glow} p-3 w-64 backdrop-blur-xl transition-all duration-300 cursor-pointer hover:scale-105 select-none space-y-2`}>
      <Handle type="target" position={Position.Top} className="!w-2.5 !h-2.5 !bg-purple-400 !border-0" />
      <Handle type="target" position={Position.Left} className="!w-2.5 !h-2.5 !bg-purple-400 !border-0" />
      
      <div className="flex items-center justify-between gap-1 border-b border-white/10 pb-1">
        <span className={`px-1.5 py-0.2 rounded text-[8px] font-mono font-bold uppercase tracking-wider ${scheme.badge}`}>
          {data.kind.toUpperCase()}
        </span>
        <span className={`w-1.5 h-1.5 rounded-full ${scheme.dot}`} />
      </div>

      <MiniPagePreview kind={data.kind} path={data.sub} label={data.label} system={data.system} />

      <div className="flex items-center gap-2 pt-0.5">
        <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border border-white/10 ${scheme.badge}`}>
          <IconComp className="w-3 h-3 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="font-black text-[11px] text-white uppercase tracking-wider truncate">
            {data.label}
          </h4>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!w-2.5 !h-2.5 !bg-cyan-400 !border-0" />
      <Handle type="source" position={Position.Right} className="!w-2.5 !h-2.5 !bg-cyan-400 !border-0" />
    </div>
  );
}

// 5. Email Touchpoint Node (Dashed border)
function EmailFlowNode({ data }: NodeProps<Node<FlowNodeData>>) {
  const scheme = COLOR_SCHEMES[data.system || "gold"];
  const IconComp = ICON_MAP[data.iconName] || Mail;

  return (
    <div className={`group relative rounded-2xl border-2 border-dashed ${scheme.border} ${scheme.bg} ${scheme.glow} p-3 w-64 backdrop-blur-xl transition-all duration-300 cursor-pointer hover:scale-105 select-none space-y-2`}>
      <Handle type="target" position={Position.Top} className="!w-2.5 !h-2.5 !bg-amber-400 !border-0" />

      <div className="flex items-center justify-between gap-1 border-b border-amber-500/20 pb-1">
        <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[8px] font-mono font-black uppercase tracking-widest">
          ✉ EMAIL TOUCHPOINT
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
      </div>

      <MiniPagePreview kind={data.kind} path={data.sub} label={data.label} system={data.system} />

      <div className="flex items-center gap-2 pt-0.5">
        <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0 text-amber-300">
          <IconComp className="w-3 h-3 animate-pulse" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="font-black text-[11px] text-white uppercase tracking-wider truncate">
            {data.label}
          </h4>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!w-2.5 !h-2.5 !bg-amber-400 !border-0" />
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

// --- IMMACULATE ZERO-OVERLAP GRID COORDINATES (360px Column Widths, 190px Vertical Pitch) ---
const CLEAN_GRID_NODES: Node<FlowNodeData>[] = [
  // ROW 0: ROOT HOME (Y = 30, centered at x = 1080)
  { id: "root-home", type: "rootNode", position: { x: 1080, y: 30 }, data: { label: "Home Page", sub: "/", system: "pink", kind: "root", iconName: "globe", details: { summary: "7th Heaven Website Root Entry Point", endpointOrPath: "/" } } },

  // ROW 1: HEADER NAVIGATION CARDS (Y = 240, 360px column spacing)
  { id: "nav-shop", type: "navNode", position: { x: 0, y: 240 }, data: { label: "Store & Merch", sub: "/merch", system: "teal", kind: "nav", iconName: "shopping", details: { summary: "Official Band Merchandise Store", endpointOrPath: "/merch" } } },
  { id: "nav-shows", type: "navNode", position: { x: 360, y: 240 }, data: { label: "Shows & Booking", sub: "/shows/past", system: "blue", kind: "nav", iconName: "calendar", details: { summary: "Live Shows & Booking Inquiry", endpointOrPath: "/shows/past" } } },
  { id: "nav-cruise", type: "navNode", position: { x: 720, y: 240 }, data: { label: "Cruise 2026", sub: "/cruise", system: "gold", kind: "nav", iconName: "sparkles", details: { summary: "Caribbean Cruise Booking & Cabin Hub", endpointOrPath: "/cruise" } } },
  { id: "nav-fans", type: "navNode", position: { x: 1080, y: 240 }, data: { label: "Fan Club & Wall", sub: "/fans", system: "purple", kind: "nav", iconName: "user", details: { summary: "Member Hub & Concert Photo Stream", endpointOrPath: "/fans" } } },
  { id: "nav-support", type: "navNode", position: { x: 1440, y: 240 }, data: { label: "Contact & Support", sub: "/contact", system: "peach", kind: "nav", iconName: "mail", details: { summary: "Band Contact, Media Kit & Terms", endpointOrPath: "/contact" } } },
  { id: "nav-live", type: "navNode", position: { x: 1800, y: 240 }, data: { label: "Live Broadcasts", sub: "/live", system: "red", kind: "nav", iconName: "radio", details: { summary: "Live Concert Multi-Cam Streaming", endpointOrPath: "/live" } } },
  { id: "nav-admin", type: "navNode", position: { x: 2160, y: 240 }, data: { label: "Crew & Admin", sub: "/admin", system: "emerald", kind: "nav", iconName: "shield", details: { summary: "Band HQ & Road Crew Schedules", endpointOrPath: "/admin" } } },

  // COLUMN 1: STORE & MERCH (x = 0)
  { id: "c1-1", type: "pageNode", position: { x: 0, y: 430 }, data: { label: "Merch Catalog", sub: "/merch", system: "teal", kind: "page", iconName: "shopping" } },
  { id: "c1-2", type: "pageNode", position: { x: 0, y: 620 }, data: { label: "QR Venue Scanner", sub: "/qr/merch", system: "teal", kind: "page", iconName: "shopping" } },
  { id: "c1-3", type: "pageNode", position: { x: 0, y: 810 }, data: { label: "Shopping Cart", sub: "Local State / Cart", system: "teal", kind: "page", iconName: "shopping" } },
  { id: "c1-dec", type: "decisionNode", position: { x: 32, y: 1000 }, data: { label: "Auth Check", sub: "Session State", system: "gold", kind: "decision", iconName: "branch" } },
  { id: "c1-nolog", type: "pageNode", position: { x: -160, y: 1120 }, data: { label: "Sign In / Register", sub: "LoginModal.tsx", system: "purple", kind: "page", iconName: "user" } },
  { id: "c1-log", type: "pageNode", position: { x: 160, y: 1120 }, data: { label: "Payment Sandbox", sub: "/payment-test", system: "teal", kind: "page", iconName: "credit" } },
  { id: "c1-email", type: "emailNode", position: { x: 0, y: 1310 }, data: { label: "Merch Pickup Email", sub: "flashMerchPickup", system: "teal", kind: "email", iconName: "mail", details: { emailSubject: "⚡ Your 7th Heaven Merch Receipt" } } },

  // COLUMN 2: SHOWS & BOOKING (x = 360)
  { id: "c2-1", type: "pageNode", position: { x: 360, y: 430 }, data: { label: "Past Shows Archive", sub: "/shows/past", system: "blue", kind: "page", iconName: "calendar" } },
  { id: "c2-2", type: "pageNode", position: { x: 360, y: 620 }, data: { label: "Show Detail & Tickets", sub: "/shows/[id]", system: "blue", kind: "page", iconName: "globe" } },
  { id: "c2-3", type: "pageNode", position: { x: 360, y: 810 }, data: { label: "Booking Request Form", sub: "/book", system: "emerald", kind: "page", iconName: "calendar" } },
  { id: "c2-api", type: "pageNode", position: { x: 360, y: 1000 }, data: { label: "POST Booking API", sub: "/api/booking/submit", system: "emerald", kind: "api", iconName: "terminal" } },
  { id: "c2-email1", type: "emailNode", position: { x: 360, y: 1190 }, data: { label: "Booking Confirmation Email", sub: "bookingConfirmation", system: "emerald", kind: "email", iconName: "mail", details: { emailSubject: "🎸 Booking Request Received" } } },
  { id: "c2-dec", type: "decisionNode", position: { x: 392, y: 1380 }, data: { label: "Review Status", sub: "Admin Action", system: "gold", kind: "decision", iconName: "branch" } },
  { id: "c2-rej", type: "emailNode", position: { x: 200, y: 1500 }, data: { label: "Booking Canceled Email", sub: "bookingCancelled", system: "red", kind: "email", iconName: "mail", details: { emailSubject: "Booking Canceled Feedback" } } },
  { id: "c2-appr", type: "emailNode", position: { x: 520, y: 1500 }, data: { label: "Booking Approved Email", sub: "bookingStatusUpdate", system: "emerald", kind: "email", iconName: "mail", details: { emailSubject: "🎉 Booking Status: Approved!" } } },

  // COLUMN 3: CRUISE 2026 (x = 720)
  { id: "c3-1", type: "pageNode", position: { x: 720, y: 430 }, data: { label: "Cruise Landing Page", sub: "/cruise", system: "gold", kind: "page", iconName: "sparkles" } },
  { id: "c3-api1", type: "pageNode", position: { x: 720, y: 620 }, data: { label: "POST Cruise Signup", sub: "/api/cruise/signup", system: "gold", kind: "api", iconName: "terminal" } },
  { id: "c3-email1", type: "emailNode", position: { x: 720, y: 810 }, data: { label: "Verification PIN Email", sub: "cruiseCommunityWelcome", system: "gold", kind: "email", iconName: "mail", details: { emailSubject: "🔑 Your Verification Code" } } },
  { id: "c3-page2", type: "pageNode", position: { x: 720, y: 1000 }, data: { label: "Enter PIN Screen", sub: "/cruise/verify", system: "gold", kind: "page", iconName: "key" } },
  { id: "c3-api2", type: "pageNode", position: { x: 720, y: 1190 }, data: { label: "POST Verify PIN API", sub: "/api/cruise/verify-pin", system: "gold", kind: "api", iconName: "terminal" } },
  { id: "c3-email2", type: "emailNode", position: { x: 720, y: 1380 }, data: { label: "Thanks For Signing Up Email", sub: "cruiseConfirmation", system: "gold", kind: "email", iconName: "mail", details: { emailSubject: "🚢 Thanks for Signing Up!" } } },
  { id: "c3-dash", type: "pageNode", position: { x: 720, y: 1570 }, data: { label: "Cruiser Dashboard Hub", sub: "/cruise/dashboard", system: "gold", kind: "page", iconName: "sparkles" } },

  // COLUMN 4: FAN CLUB & WALL (x = 1080)
  { id: "c4-1", type: "pageNode", position: { x: 1080, y: 430 }, data: { label: "Fan Club Portal", sub: "/fans", system: "purple", kind: "page", iconName: "user" } },
  { id: "c4-2", type: "pageNode", position: { x: 1080, y: 620 }, data: { label: "Complete Profile", sub: "/fans/complete-profile", system: "purple", kind: "page", iconName: "userPlus" } },
  { id: "c4-3", type: "pageNode", position: { x: 1080, y: 810 }, data: { label: "Member Profile View", sub: "/fans/[username]", system: "purple", kind: "page", iconName: "user" } },
  { id: "c4-4", type: "pageNode", position: { x: 1080, y: 1000 }, data: { label: "Fan Photo Wall", sub: "/fan-photo-wall", system: "purple", kind: "page", iconName: "camera" } },
  { id: "c4-5", type: "pageNode", position: { x: 1080, y: 1190 }, data: { label: "Guitar Pick Lottery", sub: "/picks", system: "purple", kind: "page", iconName: "sparkles" } },
  { id: "c4-email", type: "emailNode", position: { x: 1080, y: 1380 }, data: { label: "VIP Raffle Win Email", sub: "raffleWin", system: "purple", kind: "email", iconName: "mail", details: { emailSubject: "🎉 You Won VIP Backstage Passes!" } } },

  // COLUMN 5: CONTACT & SUPPORT (x = 1440)
  { id: "c5-1", type: "pageNode", position: { x: 1440, y: 430 }, data: { label: "Contact Us Form", sub: "/contact", system: "peach", kind: "page", iconName: "mail" } },
  { id: "c5-2", type: "pageNode", position: { x: 1440, y: 620 }, data: { label: "Show & Ticket FAQ", sub: "/faq", system: "peach", kind: "page", iconName: "question" } },
  { id: "c5-3", type: "pageNode", position: { x: 1440, y: 810 }, data: { label: "Media & Press Kit", sub: "/media", system: "peach", kind: "page", iconName: "film" } },
  { id: "c5-4", type: "pageNode", position: { x: 1440, y: 1000 }, data: { label: "Career Features", sub: "/features", system: "peach", kind: "page", iconName: "globe" } },
  { id: "c5-5", type: "pageNode", position: { x: 1440, y: 1190 }, data: { label: "Return Policy", sub: "/returns", system: "peach", kind: "page", iconName: "globe" } },
  { id: "c5-6", type: "pageNode", position: { x: 1440, y: 1380 }, data: { label: "Privacy Policy & Terms", sub: "/privacy & /terms", system: "peach", kind: "page", iconName: "shield" } },

  // COLUMN 6: LIVE BROADCASTS (x = 1800)
  { id: "c6-1", type: "pageNode", position: { x: 1800, y: 430 }, data: { label: "Main Broadcast Room", sub: "/live", system: "red", kind: "page", iconName: "radio" } },
  { id: "c6-2", type: "pageNode", position: { x: 1800, y: 620 }, data: { label: "Michael Stage Cam", sub: "/live/live_michael", system: "red", kind: "page", iconName: "radio" } },
  { id: "c6-3", type: "pageNode", position: { x: 1800, y: 810 }, data: { label: "Ryan Guitar Cam", sub: "/live/live_ryan", system: "red", kind: "page", iconName: "radio" } },
  { id: "c6-4", type: "pageNode", position: { x: 1800, y: 1000 }, data: { label: "Sammy Drum Cam", sub: "/live/live_sammy", system: "red", kind: "page", iconName: "radio" } },

  // COLUMN 7: CREW & ADMIN (x = 2160)
  { id: "c7-1", type: "pageNode", position: { x: 2160, y: 430 }, data: { label: "Admin Portal", sub: "/admin", system: "emerald", kind: "page", iconName: "lock" } },
  { id: "c7-2", type: "pageNode", position: { x: 2160, y: 620 }, data: { label: "Crew HQ Dashboard", sub: "/crew", system: "emerald", kind: "page", iconName: "shield" } },
  { id: "c7-email1", type: "emailNode", position: { x: 2160, y: 810 }, data: { label: "Schedule Shift Alert", sub: "scheduleChangeAlert", system: "emerald", kind: "email", iconName: "mail", details: { emailSubject: "⚠️ Stage Schedule Update Alert" } } },
  { id: "c7-3", type: "pageNode", position: { x: 2160, y: 1000 }, data: { label: "Newsletter Studio", sub: "/admin/emails", system: "emerald", kind: "page", iconName: "mail" } },
  { id: "c7-email2", type: "emailNode", position: { x: 2160, y: 1190 }, data: { label: "Newsletter Broadcast Email", sub: "newsletterBlast", system: "emerald", kind: "email", iconName: "mail", details: { emailSubject: "⚡ 7th Heaven Tour Announcement" } } },
];

const STYLED_EDGES: Edge[] = [
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
  { id: "ec1-5", source: "c1-dec", target: "c1-nolog", type: "smoothstep", label: "Not Logged In", labelStyle: { fill: "#f59e0b", fontWeight: 800, fontSize: 10 }, labelBgStyle: { fill: "#1f1606", fillOpacity: 0.95, rx: 6, ry: 6 }, style: { stroke: "#f59e0b", strokeWidth: 2 } },
  { id: "ec1-6", source: "c1-dec", target: "c1-log", type: "smoothstep", label: "Logged In", labelStyle: { fill: "#14b8a6", fontWeight: 800, fontSize: 10 }, labelBgStyle: { fill: "#061c1a", fillOpacity: 0.95, rx: 6, ry: 6 }, style: { stroke: "#14b8a6", strokeWidth: 2 } },
  { id: "ec1-7", source: "c1-nolog", target: "c1-log", type: "smoothstep", style: { stroke: "#14b8a6", strokeWidth: 2 } },
  { id: "ec1-8", source: "c1-log", target: "c1-email", type: "smoothstep", style: { stroke: "#14b8a6", strokeWidth: 2 } },

  { id: "ec2-1", source: "nav-shows", target: "c2-1", type: "smoothstep", style: { stroke: "#38bdf8", strokeWidth: 2 } },
  { id: "ec2-2", source: "c2-1", target: "c2-2", type: "smoothstep", style: { stroke: "#38bdf8", strokeWidth: 2 } },
  { id: "ec2-3", source: "c2-2", target: "c2-3", type: "smoothstep", style: { stroke: "#10b981", strokeWidth: 2 } },
  { id: "ec2-4", source: "c2-3", target: "c2-api", type: "smoothstep", style: { stroke: "#10b981", strokeWidth: 2 } },
  { id: "ec2-5", source: "c2-api", target: "c2-email1", type: "smoothstep", style: { stroke: "#10b981", strokeWidth: 2 } },
  { id: "ec2-6", source: "c2-email1", target: "c2-dec", type: "smoothstep", style: { stroke: "#f59e0b", strokeWidth: 2 } },
  { id: "ec2-7", source: "c2-dec", target: "c2-rej", type: "smoothstep", label: "Rejected", labelStyle: { fill: "#ef4444", fontWeight: 800, fontSize: 10 }, labelBgStyle: { fill: "#210707", fillOpacity: 0.95, rx: 6, ry: 6 }, style: { stroke: "#ef4444", strokeWidth: 2 } },
  { id: "ec2-8", source: "c2-dec", target: "c2-appr", type: "smoothstep", label: "Approved", labelStyle: { fill: "#10b981", fontWeight: 800, fontSize: 10 }, labelBgStyle: { fill: "#061d12", fillOpacity: 0.95, rx: 6, ry: 6 }, style: { stroke: "#10b981", strokeWidth: 2 } },

  { id: "ec3-1", source: "nav-cruise", target: "c3-1", type: "smoothstep", style: { stroke: "#f59e0b", strokeWidth: 2 } },
  { id: "ec3-2", source: "c3-1", target: "c3-api1", type: "smoothstep", style: { stroke: "#f59e0b", strokeWidth: 2 } },
  { id: "ec3-3", source: "c3-api1", target: "c3-email1", type: "smoothstep", style: { stroke: "#f59e0b", strokeWidth: 2 } },
  { id: "ec3-4", source: "c3-email1", target: "c3-page2", type: "smoothstep", style: { stroke: "#f59e0b", strokeWidth: 2 } },
  { id: "ec3-5", source: "c3-page2", target: "c3-api2", type: "smoothstep", style: { stroke: "#f59e0b", strokeWidth: 2 } },
  { id: "ec3-6", source: "c3-api2", target: "c3-email2", type: "smoothstep", style: { stroke: "#f59e0b", strokeWidth: 2 } },
  { id: "ec3-7", source: "c3-email2", target: "c3-dash", type: "smoothstep", style: { stroke: "#f59e0b", strokeWidth: 2 } },

  { id: "ec4-1", source: "nav-fans", target: "c4-1", type: "smoothstep", style: { stroke: "#a855f7", strokeWidth: 2 } },
  { id: "ec4-2", source: "c4-1", target: "c4-2", type: "smoothstep", style: { stroke: "#a855f7", strokeWidth: 2 } },
  { id: "ec4-3", source: "c4-2", target: "c4-3", type: "smoothstep", style: { stroke: "#a855f7", strokeWidth: 2 } },
  { id: "ec4-4", source: "c4-3", target: "c4-4", type: "smoothstep", style: { stroke: "#a855f7", strokeWidth: 2 } },
  { id: "ec4-5", source: "c4-4", target: "c4-5", type: "smoothstep", style: { stroke: "#a855f7", strokeWidth: 2 } },
  { id: "ec4-6", source: "c4-5", target: "c4-email", type: "smoothstep", style: { stroke: "#a855f7", strokeWidth: 2 } },

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
  const [flowNodes, setNodes, onNodesChange] = useNodesState(CLEAN_GRID_NODES);
  const [flowEdges, setEdges, onEdgesChange] = useEdgesState(STYLED_EDGES);
  const [selectedNode, setSelectedNode] = useState<Node<FlowNodeData> | null>(null);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node<FlowNodeData>) => {
    setSelectedNode(node);
  }, []);

  return (
    <div className="relative w-full h-[950px] rounded-3xl border border-purple-500/30 bg-[#050505] overflow-hidden shadow-2xl backdrop-blur-2xl">
      
      {/* Global CSS override to completely eliminate white edge label backgrounds */}
      <style jsx global>{`
        .react-flow__edge-textbg {
          fill: #09090e !important;
          fill-opacity: 0.95 !important;
          rx: 6px !important;
          ry: 6px !important;
          stroke: rgba(255, 255, 255, 0.15) !important;
          stroke-width: 1px !important;
        }
        .react-flow__edge-text {
          fill: #ffffff !important;
          font-weight: 800 !important;
          font-size: 10px !important;
        }
      `}</style>

      {/* Header Info Bar */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-black/90 backdrop-blur-md border-b border-white/10 px-4 py-2.5 flex items-center justify-between text-xs pointer-events-none select-none">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
          <span className="font-black uppercase tracking-widest text-white">
            7th Heaven Octopus.do Visual Sitemap & Flow Map Engine
          </span>
        </div>

        <span className="text-[10px] font-mono text-white/50">
          Cleaned Dark Mode Labels & Perfect 190px Vertical Spacing Grid
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
        fitViewOptions={{ padding: 0.05 }}
        colorMode="dark"
        className="pt-10"
      >
        <Background color="#1e1b4b" gap={24} size={1} />
        <Controls className="!bg-black/80 !border-white/10 !text-white !rounded-xl overflow-hidden" />
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
      <div className="absolute bottom-4 left-4 z-10 flex flex-wrap items-center gap-3 bg-black/90 border border-white/10 px-4 py-2 rounded-2xl backdrop-blur-xl text-xs font-bold uppercase tracking-widest">
        <span className="text-white/40 text-[9px] font-mono">Legend:</span>
        <span className="flex items-center gap-1.5 text-pink-300 text-[10px]"><span className="w-2 h-2 rounded-full bg-pink-400" /> Home</span>
        <span className="flex items-center gap-1.5 text-teal-300 text-[10px]"><span className="w-2 h-2 rounded-full bg-teal-400" /> Merch</span>
        <span className="flex items-center gap-1.5 text-sky-300 text-[10px]"><span className="w-2 h-2 rounded-full bg-sky-400" /> Shows</span>
        <span className="flex items-center gap-1.5 text-amber-300 text-[10px]"><span className="w-2 h-2 rounded-full bg-amber-400" /> Cruise & PINs</span>
        <span className="flex items-center gap-1.5 text-purple-300 text-[10px]"><span className="w-2 h-2 rounded-full bg-purple-400" /> Fan Club</span>
        <span className="flex items-center gap-1.5 text-orange-300 text-[10px]"><span className="w-2 h-2 rounded-full bg-orange-400" /> Contact</span>
        <span className="flex items-center gap-1.5 text-emerald-300 text-[10px]"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Admin</span>
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
                {selectedNode.data.details?.summary || `Interactive ${selectedNode.data.label} page node in the 7th Heaven web app.`}
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
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            {selectedNode.data.sub.startsWith("/") ? (
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
