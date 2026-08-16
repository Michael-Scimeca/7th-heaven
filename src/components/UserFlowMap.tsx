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
  Camera,
  Send,
  HelpCircle as QuestionIcon,
  GitBranch,
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

// Node Payload Structure
export interface FlowNodeData {
  label: string;
  sub: string;
  system: "pink" | "teal" | "blue" | "gold" | "purple" | "peach" | "emerald" | "red";
  kind: "root" | "nav" | "page" | "decision" | "api" | "email";
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
  camera: Camera,
  send: Send,
  question: QuestionIcon,
  branch: GitBranch,
};

// --- CUSTOM REACT FLOW NODE TYPES ---

// 1. Root Node (Top Anchor)
function RootNode({ data }: NodeProps<Node<FlowNodeData>>) {
  const scheme = COLOR_SCHEMES[data.system || "pink"];

  return (
    <div className={`relative rounded-3xl border-2 ${scheme.border} bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 ${scheme.glow} p-5 w-72 text-center text-white font-black shadow-2xl backdrop-blur-2xl cursor-pointer hover:scale-105 transition duration-300`}>
      <div className="flex items-center justify-between gap-1 border-b border-white/20 pb-2 mb-2">
        <span className="px-2.5 py-0.5 rounded-full bg-black/40 text-cyan-300 font-mono text-[9px] font-bold">
          {data.stepNumber ? `STEP ${data.stepNumber}` : "ROOT ANCHOR"}
        </span>
        <span className="px-2 py-0.5 rounded bg-white/20 text-white font-mono text-[9px] uppercase tracking-wider">
          PUBLIC HUB
        </span>
      </div>
      <h2 className="text-xl uppercase tracking-wider font-extrabold flex items-center justify-center gap-2">
        <Globe className="w-5 h-5 text-cyan-200" />
        <span>{data.label}</span>
      </h2>
      <p className="text-[10px] font-normal text-white/80 mt-1">
        {data.sub}
      </p>
      <Handle type="source" position={Position.Bottom} className="!w-4 !h-4 !bg-cyan-300 !border-2 !border-black" />
    </div>
  );
}

// 2. Navigation Header Section Card
function NavSectionNode({ data }: NodeProps<Node<FlowNodeData>>) {
  const scheme = COLOR_SCHEMES[data.system || "blue"];
  const IconComp = ICON_MAP[data.iconName] || Globe;

  return (
    <div className={`group relative rounded-2xl border-2 ${scheme.border} ${scheme.bg} ${scheme.glow} p-4 w-64 text-center backdrop-blur-xl transition-all duration-300 cursor-pointer hover:scale-105 select-none shadow-xl`}>
      <Handle type="target" position={Position.Top} className="!w-3.5 !h-3.5 !bg-purple-400 !border-2 !border-black" />
      
      <div className="flex items-center justify-between gap-1 mb-1.5 border-b border-white/10 pb-1.5">
        <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider ${scheme.badge}`}>
          {data.stepNumber ? `STEP ${data.stepNumber}` : "HEADER NAV"}
        </span>
        <span className={`w-2 h-2 rounded-full ${scheme.dot}`} />
      </div>

      <div className="flex items-center justify-center gap-2 my-1">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border border-white/10 ${scheme.badge}`}>
          <IconComp className="w-4 h-4 text-white" />
        </div>
        <h3 className="font-black text-sm text-white uppercase tracking-wider truncate">
          {data.label}
        </h3>
      </div>

      <code className="text-[10px] font-mono text-cyan-300/90 block truncate">
        {data.sub}
      </code>

      <Handle type="source" position={Position.Bottom} className="!w-3.5 !h-3.5 !bg-cyan-400 !border-2 !border-black" />
    </div>
  );
}

// 3. Decision Branch Node (Gold Pill for splits)
function DecisionNode({ data }: NodeProps<Node<FlowNodeData>>) {
  return (
    <div className="group relative rounded-xl border border-amber-400/50 bg-[#2d1c07]/95 shadow-[0_0_15px_rgba(245,158,11,0.25)] px-3 py-2 w-48 text-center backdrop-blur-xl transition-all duration-300 cursor-pointer hover:scale-105 select-none">
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-amber-400 !border-2 !border-black" />
      
      <div className="flex items-center justify-center gap-1.5">
        <GitBranch className="w-3.5 h-3.5 text-amber-300 shrink-0" />
        <span className="font-black text-xs text-amber-200 uppercase tracking-wider truncate">
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
    <div className={`group relative rounded-2xl border ${scheme.border} ${scheme.bg} ${scheme.glow} p-3.5 w-64 backdrop-blur-xl transition-all duration-300 cursor-pointer hover:scale-105 select-none`}>
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-purple-400 !border-2 !border-black" />
      <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-purple-400 !border-2 !border-black" />
      
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border border-white/10 ${scheme.badge}`}>
          <IconComp className="w-4 h-4 text-white" />
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

// 5. Email Touchpoint Node (Dashed border, Envelope Badge)
function EmailFlowNode({ data }: NodeProps<Node<FlowNodeData>>) {
  const scheme = COLOR_SCHEMES[data.system || "gold"];
  const IconComp = ICON_MAP[data.iconName] || Mail;

  return (
    <div className={`group relative rounded-2xl border-2 border-dashed ${scheme.border} ${scheme.bg} ${scheme.glow} p-3.5 w-64 backdrop-blur-xl transition-all duration-300 cursor-pointer hover:scale-105 select-none`}>
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-amber-400 !border-2 !border-black" />
      <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-amber-400 !border-2 !border-black" />

      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]">
          <IconComp className="w-4 h-4 animate-pulse" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="px-1.5 py-0.5 rounded bg-amber-500/25 text-amber-300 border border-amber-500/40 text-[8px] font-mono font-black uppercase tracking-widest">
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
  rootNode: RootNode,
  navNode: NavSectionNode,
  decisionNode: DecisionNode,
  pageNode: PageFlowNode,
  emailNode: EmailFlowNode,
};

// --- SET 1: FULL SITE NAVIGATION & ARCHITECTURE TREE ---
const FULL_TREE_NODES: Node<FlowNodeData>[] = [
  { id: "root-home", type: "rootNode", position: { x: 1020, y: 20 }, data: { label: "Home Page", sub: "7th Heaven Official Band Hub (/)", system: "pink", kind: "root", iconName: "globe" } },
  { id: "nav-shop", type: "navNode", position: { x: 0, y: 150 }, data: { label: "Store & Merch", sub: "/merch", system: "teal", kind: "nav", iconName: "shopping" } },
  { id: "nav-shows", type: "navNode", position: { x: 340, y: 150 }, data: { label: "Shows & Booking", sub: "/shows/past", system: "blue", kind: "nav", iconName: "calendar" } },
  { id: "nav-cruise", type: "navNode", position: { x: 680, y: 150 }, data: { label: "Cruise 2026", sub: "/cruise", system: "gold", kind: "nav", iconName: "sparkles" } },
  { id: "nav-fans", type: "navNode", position: { x: 1020, y: 150 }, data: { label: "Fan Club & Wall", sub: "/fans", system: "purple", kind: "nav", iconName: "user" } },
  { id: "nav-support", type: "navNode", position: { x: 1360, y: 150 }, data: { label: "Contact & Support", sub: "/contact", system: "peach", kind: "nav", iconName: "mail" } },
  { id: "nav-live", type: "navNode", position: { x: 1700, y: 150 }, data: { label: "Live Broadcasts", sub: "/live", system: "red", kind: "nav", iconName: "radio" } },
  { id: "nav-admin", type: "navNode", position: { x: 2040, y: 150 }, data: { label: "Crew & Admin", sub: "/admin", system: "emerald", kind: "nav", iconName: "shield" } },

  // Columns Underneath
  { id: "c1-1", type: "pageNode", position: { x: 0, y: 280 }, data: { label: "Merch Catalog", sub: "/merch", system: "teal", kind: "page", iconName: "shopping" } },
  { id: "c1-2", type: "pageNode", position: { x: 0, y: 400 }, data: { label: "QR Venue Scanner", sub: "/qr/merch", system: "teal", kind: "page", iconName: "shopping" } },
  { id: "c1-3", type: "pageNode", position: { x: 0, y: 520 }, data: { label: "Shopping Cart", sub: "Local State", system: "teal", kind: "page", iconName: "shopping" } },
  { id: "c1-dec", type: "decisionNode", position: { x: 30, y: 640 }, data: { label: "Auth Check", sub: "Auth State", system: "gold", kind: "decision", iconName: "branch" } },
  { id: "c1-nolog", type: "pageNode", position: { x: -140, y: 740 }, data: { label: "Sign In / Register", sub: "LoginModal.tsx", system: "purple", kind: "page", iconName: "user" } },
  { id: "c1-log", type: "pageNode", position: { x: 140, y: 740 }, data: { label: "Payment Sandbox", sub: "/payment-test", system: "teal", kind: "page", iconName: "credit" } },
  { id: "c1-email", type: "emailNode", position: { x: 0, y: 870 }, data: { label: "Merch Pickup Email", sub: "flashMerchPickup", system: "teal", kind: "email", iconName: "mail", details: { emailSubject: "⚡ Your Merch Receipt" } } },

  { id: "c2-1", type: "pageNode", position: { x: 340, y: 280 }, data: { label: "Past Shows Archive", sub: "/shows/past", system: "blue", kind: "page", iconName: "calendar" } },
  { id: "c2-2", type: "pageNode", position: { x: 340, y: 400 }, data: { label: "Show Detail View", sub: "/shows/[id]", system: "blue", kind: "page", iconName: "globe" } },
  { id: "c2-3", type: "pageNode", position: { x: 340, y: 520 }, data: { label: "Booking Request Form", sub: "/book", system: "emerald", kind: "page", iconName: "calendar" } },
  { id: "c2-api", type: "pageNode", position: { x: 340, y: 640 }, data: { label: "POST Booking API", sub: "/api/booking/submit", system: "emerald", kind: "api", iconName: "terminal" } },
  { id: "c2-email1", type: "emailNode", position: { x: 340, y: 760 }, data: { label: "Booking Confirmation Email", sub: "bookingConfirmation", system: "emerald", kind: "email", iconName: "mail", details: { emailSubject: "🎸 Booking Request Received" } } },

  { id: "c3-1", type: "pageNode", position: { x: 680, y: 280 }, data: { label: "Cruise Landing Page", sub: "/cruise", system: "gold", kind: "page", iconName: "sparkles" } },
  { id: "c3-api1", type: "pageNode", position: { x: 680, y: 400 }, data: { label: "POST Cruise Signup", sub: "/api/cruise/signup", system: "gold", kind: "api", iconName: "terminal" } },
  { id: "c3-email1", type: "emailNode", position: { x: 680, y: 520 }, data: { label: "Verification PIN Email", sub: "cruiseCommunityWelcome", system: "gold", kind: "email", iconName: "mail", details: { emailSubject: "🔑 Your Verification Code" } } },
  { id: "c3-page2", type: "pageNode", position: { x: 680, y: 640 }, data: { label: "Enter PIN Screen", sub: "/cruise/verify", system: "gold", kind: "page", iconName: "key" } },
  { id: "c3-api2", type: "pageNode", position: { x: 680, y: 760 }, data: { label: "POST Verify PIN API", sub: "/api/cruise/verify-pin", system: "gold", kind: "api", iconName: "terminal" } },
  { id: "c3-email2", type: "emailNode", position: { x: 680, y: 880 }, data: { label: "Thanks For Signing Up Email", sub: "cruiseConfirmation", system: "gold", kind: "email", iconName: "mail", details: { emailSubject: "🚢 Thanks for Signing Up!" } } },
  { id: "c3-dash", type: "pageNode", position: { x: 680, y: 1010 }, data: { label: "Cruiser Dashboard Hub", sub: "/cruise/dashboard", system: "gold", kind: "page", iconName: "sparkles" } },

  { id: "c4-1", type: "pageNode", position: { x: 1020, y: 280 }, data: { label: "Fan Club Portal", sub: "/fans", system: "purple", kind: "page", iconName: "user" } },
  { id: "c4-2", type: "pageNode", position: { x: 1020, y: 400 }, data: { label: "Complete Profile", sub: "/fans/complete-profile", system: "purple", kind: "page", iconName: "userPlus" } },
  { id: "c4-3", type: "pageNode", position: { x: 1020, y: 520 }, data: { label: "Fan Photo Wall", sub: "/fan-photo-wall", system: "purple", kind: "page", iconName: "camera" } },

  { id: "c5-1", type: "pageNode", position: { x: 1360, y: 280 }, data: { label: "Contact Us Form", sub: "/contact", system: "peach", kind: "page", iconName: "mail" } },
  { id: "c5-2", type: "pageNode", position: { x: 1360, y: 400 }, data: { label: "Media Press Kit", sub: "/media", system: "peach", kind: "page", iconName: "film" } },

  { id: "c6-1", type: "pageNode", position: { x: 1700, y: 280 }, data: { label: "Broadcast Room", sub: "/live", system: "red", kind: "page", iconName: "radio" } },
  { id: "c7-1", type: "pageNode", position: { x: 2040, y: 280 }, data: { label: "Crew HQ Dashboard", sub: "/crew", system: "emerald", kind: "page", iconName: "shield" } },
];

const FULL_TREE_EDGES: Edge[] = [
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

  { id: "ec5-1", source: "nav-support", target: "c5-1", type: "smoothstep", style: { stroke: "#f97316", strokeWidth: 2 } },
  { id: "ec5-2", source: "c5-1", target: "c5-2", type: "smoothstep", style: { stroke: "#f97316", strokeWidth: 2 } },

  { id: "ec6-1", source: "nav-live", target: "c6-1", type: "smoothstep", style: { stroke: "#ef4444", strokeWidth: 2 } },
  { id: "ec7-1", source: "nav-admin", target: "c7-1", type: "smoothstep", style: { stroke: "#10b981", strokeWidth: 2 } },
];

// --- SET 2: DEDICATED SIGN-UP TREE DIAGRAM WITH DECISION SPLITS & EMAIL PIPELINES ---
const SIGNUP_TREE_NODES: Node<FlowNodeData>[] = [
  { id: "su-root", type: "rootNode", position: { x: 450, y: 20 }, data: { label: "Sign-Up Entry Point", sub: "/cruise or /fans/complete-profile", system: "cyan", kind: "root", iconName: "userPlus", stepNumber: 1 } },
  
  { id: "su-dec1", type: "decisionNode", position: { x: 490, y: 150 }, data: { label: "Registration Path", sub: "User Choice", system: "gold", kind: "decision", iconName: "branch" } },
  
  // Left: Passwordless PIN Path
  { id: "su-pl-form", type: "pageNode", position: { x: 200, y: 260 }, data: { label: "Fill Passwordless Form", sub: "Name, Email, Phone, Guests", system: "cyan", kind: "page", iconName: "userPlus", stepNumber: 2 } },
  { id: "su-pl-api1", type: "pageNode", position: { x: 200, y: 380 }, data: { label: "POST Signup API", sub: "/api/cruise/signup", system: "cyan", kind: "api", iconName: "terminal", stepNumber: 3 } },
  { id: "su-pl-email1", type: "emailNode", position: { x: 200, y: 500 }, data: { label: "Verification PIN Email Sent", sub: "cruiseCommunityWelcome", system: "gold", kind: "email", iconName: "mail", stepNumber: 4, details: { emailSubject: "🔑 Your 7th Heaven Cruise Verification Code" } } },
  { id: "su-pl-page2", type: "pageNode", position: { x: 200, y: 630 }, data: { label: "Enter 6-Digit PIN", sub: "/cruise/verify?email=...", system: "cyan", kind: "page", iconName: "key", stepNumber: 5 } },
  { id: "su-pl-api2", type: "pageNode", position: { x: 200, y: 750 }, data: { label: "POST Verify PIN API", sub: "/api/cruise/verify-pin", system: "cyan", kind: "api", iconName: "terminal", stepNumber: 6 } },

  // Right: Password-Based Alt Path
  { id: "su-pw-form", type: "pageNode", position: { x: 700, y: 260 }, data: { label: "Fill Password Form", sub: "Set Account Password", system: "purple", kind: "page", iconName: "lock", stepNumber: 2 } },
  { id: "su-pw-api1", type: "pageNode", position: { x: 700, y: 380 }, data: { label: "POST Register Request", sub: "/api/cruise/register-pin (req)", system: "purple", kind: "api", iconName: "terminal", stepNumber: 3 } },
  { id: "su-pw-email1", type: "emailNode", position: { x: 700, y: 500 }, data: { label: "Register PIN Email Sent", sub: "cruiseRegisterPin", system: "gold", kind: "email", iconName: "mail", stepNumber: 4, details: { emailSubject: "🚢 Your Cruise Hub Verification PIN" } } },
  { id: "su-pw-page2", type: "pageNode", position: { x: 700, y: 630 }, data: { label: "Enter PIN & Confirm Pass", sub: "/cruise/verify", system: "purple", kind: "page", iconName: "key", stepNumber: 5 } },
  { id: "su-pw-api2", type: "pageNode", position: { x: 700, y: 750 }, data: { label: "POST Register Confirm", sub: "/api/cruise/register-pin (conf)", system: "purple", kind: "api", iconName: "terminal", stepNumber: 6 } },

  // Convergence: Final Thanks Email & Dashboard
  { id: "su-thanks-email", type: "emailNode", position: { x: 450, y: 880 }, data: { label: "Thanks For Signing Up Email", sub: "cruiseConfirmation", system: "gold", kind: "email", iconName: "mail", stepNumber: 7, details: { emailSubject: "🚢 Thanks for Signing Up! Welcome to the Cruise Hub!" } } },
  { id: "su-dash", type: "pageNode", position: { x: 450, y: 1010 }, data: { label: "Member Dashboard Granted", sub: "/cruise/dashboard", system: "emerald", kind: "page", iconName: "sparkles", stepNumber: 8 } },
];

const SIGNUP_TREE_EDGES: Edge[] = [
  { id: "esu-1", source: "su-root", target: "su-dec1", type: "smoothstep", style: { stroke: "#06b6d4", strokeWidth: 3 } },
  { id: "esu-2", source: "su-dec1", target: "su-pl-form", type: "smoothstep", label: "Passwordless Magic Link Path", style: { stroke: "#06b6d4", strokeWidth: 3 } },
  { id: "esu-3", source: "su-dec1", target: "su-pw-form", type: "smoothstep", label: "Password Set Path", style: { stroke: "#a855f7", strokeWidth: 3 } },

  { id: "esu-pl1", source: "su-pl-form", target: "su-pl-api1", type: "smoothstep", style: { stroke: "#06b6d4", strokeWidth: 2 } },
  { id: "esu-pl2", source: "su-pl-api1", target: "su-pl-email1", type: "smoothstep", style: { stroke: "#06b6d4", strokeWidth: 2 } },
  { id: "esu-pl3", source: "su-pl-email1", target: "su-pl-page2", type: "smoothstep", style: { stroke: "#06b6d4", strokeWidth: 2 } },
  { id: "esu-pl4", source: "su-pl-page2", target: "su-pl-api2", type: "smoothstep", style: { stroke: "#06b6d4", strokeWidth: 2 } },

  { id: "esu-pw1", source: "su-pw-form", target: "su-pw-api1", type: "smoothstep", style: { stroke: "#a855f7", strokeWidth: 2 } },
  { id: "esu-pw2", source: "su-pw-api1", target: "su-pw-email1", type: "smoothstep", style: { stroke: "#a855f7", strokeWidth: 2 } },
  { id: "esu-pw3", source: "su-pw-email1", target: "su-pw-page2", type: "smoothstep", style: { stroke: "#a855f7", strokeWidth: 2 } },
  { id: "esu-pw4", source: "su-pw-page2", target: "su-pw-api2", type: "smoothstep", style: { stroke: "#a855f7", strokeWidth: 2 } },

  { id: "esu-conv1", source: "su-pl-api2", target: "su-thanks-email", type: "smoothstep", style: { stroke: "#06b6d4", strokeWidth: 2 } },
  { id: "esu-conv2", source: "su-pw-api2", target: "su-thanks-email", type: "smoothstep", style: { stroke: "#a855f7", strokeWidth: 2 } },
  { id: "esu-dash", source: "su-thanks-email", target: "su-dash", type: "smoothstep", style: { stroke: "#10b981", strokeWidth: 3 } },
];

// --- SET 3: DEDICATED SIGN-IN TREE DIAGRAM WITH DECISION SPLITS & EMAIL PIPELINES ---
const SIGNIN_TREE_NODES: Node<FlowNodeData>[] = [
  { id: "si-root", type: "rootNode", position: { x: 450, y: 20 }, data: { label: "Sign-In Entry Point", sub: "User Clicks Sign In (Header/Hero)", system: "purple", kind: "root", iconName: "logIn", stepNumber: 1 } },
  
  { id: "si-modal", type: "pageNode", position: { x: 450, y: 140 }, data: { label: "Open Login Modal Window", sub: "LoginModal.tsx", system: "purple", kind: "component", iconName: "user", stepNumber: 2 } },
  { id: "si-email-input", type: "pageNode", position: { x: 450, y: 260 }, data: { label: "User Enters Email Address", sub: "LoginModal.tsx (Step 1)", system: "purple", kind: "page", iconName: "mail", stepNumber: 3 } },
  
  { id: "si-api1", type: "pageNode", position: { x: 450, y: 380 }, data: { label: "POST Send Auth PIN API", sub: "/api/auth/send-pin", system: "purple", kind: "api", iconName: "terminal", stepNumber: 4 } },
  { id: "si-pin-email", type: "emailNode", position: { x: 450, y: 500 }, data: { label: "Sign-In Verification PIN Email", sub: "sendAuthPin", system: "gold", kind: "email", iconName: "mail", stepNumber: 5, details: { emailSubject: "🔑 Your 7th Heaven Sign-In Verification Code" } } },
  
  { id: "si-code-input", type: "pageNode", position: { x: 450, y: 630 }, data: { label: "User Inputs 6-Digit PIN Code", sub: "LoginModal.tsx (Step 2)", system: "purple", kind: "component", iconName: "key", stepNumber: 6 } },
  { id: "si-api2", type: "pageNode", position: { x: 450, y: 750 }, data: { label: "POST Verify Auth PIN API", sub: "/api/auth/verify-pin", system: "purple", kind: "api", iconName: "terminal", stepNumber: 7 } },
  
  { id: "si-dec", type: "decisionNode", position: { x: 490, y: 870 }, data: { label: "Profile Role Check", sub: "Member Role", system: "gold", kind: "decision", iconName: "branch" } },
  
  { id: "si-fan-dash", type: "pageNode", position: { x: 150, y: 980 }, data: { label: "Fan Club Hub", sub: "/fans", system: "purple", kind: "page", iconName: "user" } },
  { id: "si-cruise-dash", type: "pageNode", position: { x: 450, y: 980 }, data: { label: "Cruise Hub", sub: "/cruise/dashboard", system: "gold", kind: "page", iconName: "sparkles" } },
  { id: "si-admin-dash", type: "pageNode", position: { x: 750, y: 980 }, data: { label: "Crew & Admin HQ", sub: "/admin", system: "emerald", kind: "page", iconName: "shield" } },
];

const SIGNIN_TREE_EDGES: Edge[] = [
  { id: "esi-1", source: "si-root", target: "si-modal", type: "smoothstep", style: { stroke: "#a855f7", strokeWidth: 3 } },
  { id: "esi-2", source: "si-modal", target: "si-email-input", type: "smoothstep", style: { stroke: "#a855f7", strokeWidth: 3 } },
  { id: "esi-3", source: "si-email-input", target: "si-api1", type: "smoothstep", style: { stroke: "#a855f7", strokeWidth: 3 } },
  { id: "esi-4", source: "si-api1", target: "si-pin-email", type: "smoothstep", style: { stroke: "#f59e0b", strokeWidth: 3 } },
  { id: "esi-5", source: "si-pin-email", target: "si-code-input", type: "smoothstep", style: { stroke: "#a855f7", strokeWidth: 3 } },
  { id: "esi-6", source: "si-code-input", target: "si-api2", type: "smoothstep", style: { stroke: "#a855f7", strokeWidth: 3 } },
  { id: "esi-7", source: "si-api2", target: "si-dec", type: "smoothstep", style: { stroke: "#f59e0b", strokeWidth: 3 } },

  { id: "esi-r1", source: "si-dec", target: "si-fan-dash", type: "smoothstep", label: "Fan Role", style: { stroke: "#a855f7", strokeWidth: 2 } },
  { id: "esi-r2", source: "si-dec", target: "si-cruise-dash", type: "smoothstep", label: "Cruise Role", style: { stroke: "#f59e0b", strokeWidth: 2 } },
  { id: "esi-r3", source: "si-dec", target: "si-admin-dash", type: "smoothstep", label: "Admin/Crew Role", style: { stroke: "#10b981", strokeWidth: 2 } },
];

export default function UserFlowMap() {
  const router = useRouter();
  const [activeFlowFilter, setActiveFlowFilter] = useState<"all" | "signup" | "signin">("all");

  const { nodes, edges } = useMemo(() => {
    if (activeFlowFilter === "signup") {
      return { nodes: SIGNUP_TREE_NODES, edges: SIGNUP_TREE_EDGES };
    }
    if (activeFlowFilter === "signin") {
      return { nodes: SIGNIN_TREE_NODES, edges: SIGNIN_TREE_EDGES };
    }
    return { nodes: FULL_TREE_NODES, edges: FULL_TREE_EDGES };
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

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node<FlowNodeData>) => {
    setSelectedNode(node);
  }, []);

  return (
    <div className="space-y-4">

      {/* FILTER SUB-BAR FOR SPECIFIC FLOW PIPELINES */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-black/80 border border-purple-500/30 p-2.5 rounded-2xl backdrop-blur-xl shadow-xl">
        <div className="flex items-center gap-1.5 p-1 bg-white/[0.04] rounded-xl border border-white/10 overflow-x-auto">
          <button
            onClick={() => setActiveFlowFilter("all")}
            className={`px-3.5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition flex items-center gap-2 ${
              activeFlowFilter === "all"
                ? "bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.5)]"
                : "text-white/60 hover:text-white"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Full Site Architecture Map</span>
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
            <span>Sign Up Tree Map & Email Pipeline</span>
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
            <span>Sign In Tree Map & Email Pipeline</span>
          </button>
        </div>

        <div className="text-xs font-mono text-white/50 px-3">
          {activeFlowFilter === "all" && "Showing Root Home ➔ 7 Header Navs ➔ Vertical Cascading Decision Trees"}
          {activeFlowFilter === "signup" && "Sign Up Form ➔ Decision Split (Passwordless vs Password) ➔ PIN Email ➔ Thanks Email ➔ Dashboard"}
          {activeFlowFilter === "signin" && "Login Modal ➔ Email Input ➔ Auth PIN Email ➔ PIN Verification ➔ Role Dashboard Split"}
        </div>
      </div>

      <div className="relative w-full h-[850px] rounded-3xl border border-purple-500/30 bg-[#050505] overflow-hidden shadow-2xl backdrop-blur-2xl">
        
        {/* Header Info Bar */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-black/90 backdrop-blur-md border-b border-white/10 px-4 py-2.5 flex items-center justify-between text-xs pointer-events-none select-none">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
            <span className="font-black uppercase tracking-widest text-white">
              {activeFlowFilter === "all" && "7th Heaven Site Architecture & User Flow Tree Map"}
              {activeFlowFilter === "signup" && "Sign-Up Decision Tree Map & Email Pipeline"}
              {activeFlowFilter === "signin" && "Sign-In Decision Tree Map & Email Pipeline"}
            </span>
          </div>

          <span className="text-[10px] font-mono text-white/50">
            Orthogonal 90-Degree Connectors & Dynamic Decision Splits
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
        <div className="absolute bottom-4 left-4 z-10 flex flex-wrap items-center gap-3 bg-black/90 border border-white/10 px-4 py-2.5 rounded-2xl backdrop-blur-xl text-xs font-bold uppercase tracking-widest">
          <span className="text-white/40 text-[9px] font-mono">Legend:</span>
          <span className="flex items-center gap-1.5 text-pink-300 text-[10px]"><span className="w-2 h-2 rounded-full bg-pink-400" /> Home / Root</span>
          <span className="flex items-center gap-1.5 text-cyan-300 text-[10px]"><span className="w-2 h-2 rounded-full bg-cyan-400" /> Sign Up / Cruise</span>
          <span className="flex items-center gap-1.5 text-purple-300 text-[10px]"><span className="w-2 h-2 rounded-full bg-purple-400" /> Sign In / Auth</span>
          <span className="flex items-center gap-1.5 text-amber-300 text-[10px]"><span className="w-2 h-2 rounded-full bg-amber-400" /> Decision / Emails</span>
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
                  {selectedNode.data.details?.summary || `Interactive ${selectedNode.data.label} node step in the 7th Heaven web app.`}
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
    </div>
  );
}
