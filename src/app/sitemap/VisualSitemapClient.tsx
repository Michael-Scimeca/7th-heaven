"use client";

import React, { useState } from "react";
import Link from "next/link";
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
  BaseEdge,
  getSmoothStepPath,
  EdgeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { ExternalLink } from "lucide-react";

export interface SitemapNodeData extends Record<string, unknown> {
  header: string;
  title: string;
  path?: string;
  imgUrl: string;
  description?: string;
  badgeType?: "NAV" | "PAGE" | "MODULE" | "EMAIL";
}

// --- SLEEK DARK MODE SITEMAP CARD NODE WITH CLICKABLE SCREENSHOTS & HEADER NAV BADGE ---
function SitemapCardNode({ data }: NodeProps<Node<SitemapNodeData>>) {
  const [imgError, setImgError] = useState(false);
  const isNav = data.badgeType === "NAV";
  const isEmail = data.badgeType === "EMAIL";
  const isModule = data.badgeType === "MODULE";
  const targetPath = data.path || "/";

  return (
    <div className={`w-64 rounded-xl border ${
      isNav
        ? "border-purple-400/60 bg-[#120b22]"
        : isEmail
        ? "border-amber-400/50 bg-[#161005]"
        : isModule
        ? "border-cyan-400/50 bg-[#051218]"
        : "border-white/15 bg-[#0f0f17]"
    } shadow-2xl overflow-hidden select-none hover:border-purple-400/90 transition-all duration-200 backdrop-blur-xl group`}>
      <Handle type="target" position={Position.Top} className={`!w-2.5 !h-2.5 ${
        isNav ? "!bg-purple-400" : isEmail ? "!bg-amber-400" : isModule ? "!bg-cyan-400" : "!bg-purple-400"
      } !border-0`} />
      
      {/* CLICKABLE SCREENSHOT & HEADER CONTAINER */}
      <Link href={targetPath} className="block cursor-pointer">
        {/* Top Browser Header Bar */}
        <div className={`${
          isNav
            ? "bg-purple-600/30 border-b border-purple-500/40 group-hover:bg-purple-600/40"
            : isEmail
            ? "bg-amber-500/20 border-b border-amber-500/30 group-hover:bg-amber-500/30"
            : isModule
            ? "bg-cyan-500/20 border-b border-cyan-500/30 group-hover:bg-cyan-500/30"
            : "bg-[#181824] border-b border-white/10 group-hover:bg-[#222234]"
        } py-1.5 px-3 flex items-center justify-between transition-colors`}>
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="flex items-center gap-1 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500/80" />
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500/80" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80" />
            </div>
            <span className={`font-extrabold text-[10px] tracking-wider uppercase truncate ${
              isNav ? "text-purple-200" : isEmail ? "text-amber-300" : isModule ? "text-cyan-300" : "text-purple-300"
            }`}>
              {data.header}
            </span>
          </div>
          {isNav ? (
            <span className="px-1.5 py-0.2 rounded bg-purple-500/40 text-purple-200 text-[7px] font-mono font-black shrink-0">
              HEADER NAV
            </span>
          ) : isEmail ? (
            <span className="px-1.5 py-0.2 rounded bg-amber-500/30 text-amber-200 text-[7px] font-mono font-black shrink-0">
              ✉ RESEND
            </span>
          ) : (
            <ExternalLink className="w-3 h-3 text-white/50 group-hover:text-cyan-300 transition-colors shrink-0" />
          )}
        </div>

        {/* CLICKABLE REAL JPG SCREENSHOT PREVIEW WITH HOVER EFFECT */}
        <div className="w-full h-36 bg-[#080810] border-b border-white/10 overflow-hidden relative cursor-pointer">
          {!imgError ? (
            <img
              src={data.imgUrl}
              alt={data.title}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover object-top opacity-95 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300 block"
            />
          ) : (
            <div className="w-full h-full p-3 flex flex-col justify-between bg-gradient-to-br from-[#12121f] to-[#080810]">
              <div className="flex justify-between items-center text-[8px] font-mono text-cyan-300">
                <span>{targetPath}</span>
                <span>7H ENGINE</span>
              </div>
              <div className="space-y-1">
                <div className="h-3 bg-purple-500/30 rounded w-3/4" />
                <div className="h-2 bg-white/20 rounded w-1/2" />
              </div>
              <span className="text-[7px] font-mono text-white/40">VISUAL PREVIEW</span>
            </div>
          )}

          {/* Hover Overlay Hint Badge */}
          <div className="absolute inset-0 bg-purple-950/40 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center gap-1.5 text-white font-extrabold text-xs tracking-wider backdrop-blur-[2px]">
            <span className="bg-purple-600/90 px-3 py-1 rounded-full border border-purple-300/40 shadow-xl flex items-center gap-1.5">
              OPEN PAGE <ExternalLink className="w-3.5 h-3.5 text-cyan-300" />
            </span>
          </div>

          <div className={`absolute bottom-1 right-1 px-1.5 py-0.5 rounded border text-[7px] font-mono font-bold ${
            isNav
              ? "bg-purple-950/90 border-purple-400/50 text-purple-300"
              : isEmail
              ? "bg-amber-950/90 border-amber-500/40 text-amber-300"
              : "bg-black/80 border-white/20 text-cyan-300"
          }`}>
            {isEmail ? "EMAIL PREVIEW" : targetPath}
          </div>
        </div>
      </Link>

      {/* Body Content */}
      <div className="p-3 text-left space-y-1">
        <Link href={targetPath} className="font-bold text-xs text-cyan-300 hover:text-white hover:underline block leading-snug truncate">
          {data.title}
        </Link>

        {data.description && (
          <p className="text-white/60 text-[11px] leading-snug mt-1 line-clamp-2">
            {data.description}
          </p>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className={`!w-2.5 !h-2.5 ${
        isNav ? "!bg-purple-400" : isEmail ? "!bg-amber-400" : "!bg-cyan-400"
      } !border-0`} />
    </div>
  );
}

// --- CUSTOM TREE EDGE (Forces stroke-only 2px lines, absolutely zero fill) ---
function CustomTreeEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 12,
  });

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      markerEnd={markerEnd}
      style={{
        ...style,
        fill: "none",
        stroke: "#a855f7",
        strokeWidth: 2,
      }}
    />
  );
}

const nodeTypes = {
  sitemapCard: SitemapCardNode,
};

const edgeTypes = {
  smoothstep: CustomTreeEdge,
  default: CustomTreeEdge,
};

// --- LOGICAL & DOMAIN-ACCURATE SITEMAP TREE (ROW 1 = PRIMARY NAV & MAIN PAGES) ---
const INITIAL_NODES: Node<SitemapNodeData>[] = [
  // ROOT HOME PAGE (Center Top at x = 1330, y = 30)
  {
    id: "root",
    type: "sitemapCard",
    position: { x: 1330, y: 30 },
    data: {
      header: "Home Page",
      title: "7th Heaven — Official Band Website",
      path: "/",
      imgUrl: "/sitemap-thumbs/home.jpg",
      badgeType: "NAV",
      description:
        "7th Heaven is a chart-topping rock experience from Chicago with #1 Billboard hits and 40 years of live performances.",
    },
  },

  // ── ROW 1: PRIMARY MAIN SITE PAGES & HEADER NAV (8 MAIN SECTIONS) (y = 360, 380px pitch) ──
  {
    id: "nav-shows",
    type: "sitemapCard",
    position: { x: 0, y: 360 },
    data: {
      header: "CONCERT SHOWS",
      title: "1,200+ Performance Archive",
      path: "/shows/past",
      imgUrl: "/sitemap-thumbs/shows.jpg",
      badgeType: "NAV",
      description: "Historical concert dates, venue search, and setlist archives since 1985.",
    },
  },
  {
    id: "nav-merch",
    type: "sitemapCard",
    position: { x: 380, y: 360 },
    data: {
      header: "MERCH STORE",
      title: "Official Band Store & Merchandise",
      path: "/merch",
      imgUrl: "/sitemap-thumbs/merch.jpg",
      badgeType: "NAV",
      description: "Official band merchandise — tees, hoodies, vinyl records, and stage picks.",
    },
  },
  {
    id: "nav-media",
    type: "sitemapCard",
    position: { x: 760, y: 360 },
    data: {
      header: "MEDIA",
      title: "Photos, Videos & Press Kit",
      path: "/media",
      imgUrl: "/sitemap-thumbs/media.jpg",
      badgeType: "NAV",
      description: "Official promotional assets, high-res photos, stage rider, and press kit downloads.",
    },
  },
  {
    id: "nav-fanwall",
    type: "sitemapCard",
    position: { x: 1140, y: 360 },
    data: {
      header: "FAN WALL",
      title: "Fan Photo Wall & Concert Uploads",
      path: "/fan-photo-wall",
      imgUrl: "/sitemap-thumbs/fan-photo-wall.jpg",
      badgeType: "NAV",
      description: "Live concert photo upload wall, AI face scanning, and fan gallery.",
    },
  },
  {
    id: "nav-live",
    type: "sitemapCard",
    position: { x: 1520, y: 360 },
    data: {
      header: "LIVE STREAM",
      title: "Live Concert Stream & Broadcast",
      path: "/live",
      imgUrl: "/sitemap-thumbs/live.jpg",
      badgeType: "NAV",
      description: "LiveKit powered multi-camera live video stream, band audio feeds, and fan chat.",
    },
  },
  {
    id: "nav-cruise",
    type: "sitemapCard",
    position: { x: 1900, y: 360 },
    data: {
      header: "CRUISE 2026",
      title: "Caribbean Rock Cruise 2026",
      path: "/cruise",
      imgUrl: "/sitemap-thumbs/cruise-form-filled.jpg",
      badgeType: "NAV",
      description: "2026 Fan Cruise itinerary, cabin options, and reservation signup.",
    },
  },
  {
    id: "nav-book",
    type: "sitemapCard",
    position: { x: 2280, y: 360 },
    data: {
      header: "BOOK US",
      title: "Book 7th Heaven — Live Band",
      path: "/book",
      imgUrl: "/sitemap-thumbs/book.jpg",
      badgeType: "NAV",
      description: "Multi-step event booking request form with date picker and instant quote.",
    },
  },
  {
    id: "nav-contact",
    type: "sitemapCard",
    position: { x: 2660, y: 360 },
    data: {
      header: "CONTACT",
      title: "Contact Management & Inquiries",
      path: "/contact",
      imgUrl: "/sitemap-thumbs/contact.jpg",
      badgeType: "NAV",
      description: "Direct contact inquiry form for booking agents and event organizers.",
    },
  },

  // ── ROW 2: PORTAL DASHBOARDS & SUB-PAGES (y = 700) ──
  {
    id: "node-fans",
    type: "sitemapCard",
    position: { x: 0, y: 700 },
    data: {
      header: "Fan Club Hub",
      title: "Fan Club VIP Member Portal",
      path: "/fans",
      imgUrl: "/sitemap-thumbs/fan-dashboard.jpg",
      badgeType: "PAGE",
      description: "VIP fan dashboard, referral badges, and exclusive member perks.",
    },
  },
  {
    id: "node-picks",
    type: "sitemapCard",
    position: { x: 380, y: 700 },
    data: {
      header: "Pick Collector",
      title: "Guitar Pick Lottery Game",
      path: "/picks",
      imgUrl: "/sitemap-thumbs/picks.jpg",
      badgeType: "PAGE",
      description: "Interactive guitar pick collector game and concert raffle entry.",
    },
  },
  {
    id: "node-planner",
    type: "sitemapCard",
    position: { x: 760, y: 700 },
    data: {
      header: "Show Planner",
      title: "Event Booking Coordinator",
      path: "/planner",
      imgUrl: "/sitemap-thumbs/planner.jpg",
      badgeType: "PAGE",
      description: "Private event planner dashboard, date checklist, and coordinator portal.",
    },
  },
  {
    id: "node-crew",
    type: "sitemapCard",
    position: { x: 1140, y: 700 },
    data: {
      header: "Crew HQ",
      title: "Road Crew & Staff Portal",
      path: "/crew",
      imgUrl: "/sitemap-thumbs/crew-dashboard.jpg",
      badgeType: "PAGE",
      description: "Tour staff schedule, stage setup checklists, and shift alerts.",
    },
  },
  {
    id: "node-admin",
    type: "sitemapCard",
    position: { x: 1520, y: 700 },
    data: {
      header: "Master Admin",
      title: "Admin Command Center",
      path: "/admin",
      imgUrl: "/sitemap-thumbs/admin.jpg",
      badgeType: "PAGE",
      description: "Master admin dashboard, concert manager, financial reports, and broadcast center.",
    },
  },
  {
    id: "node-privacy",
    type: "sitemapCard",
    position: { x: 1900, y: 700 },
    data: {
      header: "Privacy & Terms",
      title: "Privacy Policy & Terms of Service",
      path: "/privacy",
      imgUrl: "/sitemap-thumbs/privacy.jpg",
      badgeType: "PAGE",
      description: "Data collection rules, user rights, terms of service, and cookie policy.",
    },
  },

  // ── ROW 3: RESEND API TRANSACTIONAL EMAIL PIPELINES (y = 1040) ──
  {
    id: "email-otp-pin",
    type: "sitemapCard",
    position: { x: 0, y: 1040 },
    data: {
      header: "✉ OTP Verification",
      title: "6-Digit Security PIN Email",
      path: "/admin/emails",
      imgUrl: "/sitemap-thumbs/email-pin-verification.jpg",
      badgeType: "EMAIL",
      description: "Dispatched via Resend API on Fan Signup & Cruise Registration.",
    },
  },
  {
    id: "email-cruise-confirm",
    type: "sitemapCard",
    position: { x: 380, y: 1040 },
    data: {
      header: "✉ Cruise Confirmation",
      title: "Cruise Cabin Reservation Email",
      path: "/cruise",
      imgUrl: "/sitemap-thumbs/email-cruise-confirm.jpg",
      badgeType: "EMAIL",
      description: "Sent upon 6-digit PIN verification for Cruise 2026 registrations.",
    },
  },
  {
    id: "email-booking-planner",
    type: "sitemapCard",
    position: { x: 760, y: 1040 },
    data: {
      header: "✉ Booking Receipt",
      title: "Planner Booking Confirmation",
      path: "/book/success",
      imgUrl: "/sitemap-thumbs/email-booking-confirm.jpg",
      badgeType: "EMAIL",
      description: "Sent to show planner upon booking form submission with event summary.",
    },
  },
  {
    id: "email-booking-admin",
    type: "sitemapCard",
    position: { x: 1140, y: 1040 },
    data: {
      header: "✉ Admin Booking Alert",
      title: "New Booking Notification",
      path: "/admin/emails",
      imgUrl: "/sitemap-thumbs/email-booking-admin.jpg",
      badgeType: "EMAIL",
      description: "Sent to 7th Heaven management with quick Approve / Decline action links.",
    },
  },
  {
    id: "email-merch-pickup",
    type: "sitemapCard",
    position: { x: 1520, y: 1040 },
    data: {
      header: "✉ Merch Pickup Email",
      title: "Flash Order Pickup Receipt",
      path: "/payment-test",
      imgUrl: "/sitemap-thumbs/email-flash-pickup.jpg",
      badgeType: "EMAIL",
      description: "Sent instantly upon Shopify merchandise purchase for venue pickup.",
    },
  },
  {
    id: "email-newsletter-blast",
    type: "sitemapCard",
    position: { x: 1900, y: 1040 },
    data: {
      header: "✉ Tour Announcement",
      title: "Newsletter Broadcast Email",
      path: "/admin/emails",
      imgUrl: "/sitemap-thumbs/email-newsletter-blast.jpg",
      badgeType: "EMAIL",
      description: "Dispatched from Admin Newsletter Studio to subscribed fan members.",
    },
  },
];

// --- CLEAN & DOMAIN-LOGICAL EDGES FROM ROOT HOME ---
const INITIAL_EDGES: Edge[] = [
  // Root Home -> All Primary Section Pages & Header Nav Links (Row 1)
  { id: "e-root-shows", source: "root", target: "nav-shows", type: "smoothstep" },
  { id: "e-root-merch", source: "root", target: "nav-merch", type: "smoothstep" },
  { id: "e-root-media", source: "root", target: "nav-media", type: "smoothstep" },
  { id: "e-root-fanwall", source: "root", target: "nav-fanwall", type: "smoothstep" },
  { id: "e-root-live", source: "root", target: "nav-live", type: "smoothstep" },
  { id: "e-root-cruise", source: "root", target: "nav-cruise", type: "smoothstep" },
  { id: "e-root-book", source: "root", target: "nav-book", type: "smoothstep" },
  { id: "e-root-contact", source: "root", target: "nav-contact", type: "smoothstep" },

  // Domain-Specific Sub-Tree Connections (Row 1 -> Row 2)
  { id: "e-shows-planner", source: "nav-shows", target: "node-planner", type: "smoothstep" },
  { id: "e-shows-crew", source: "nav-shows", target: "node-crew", type: "smoothstep" },
  { id: "e-fanwall-fans", source: "nav-fanwall", target: "node-fans", type: "smoothstep" },
  { id: "e-fanwall-picks", source: "nav-fanwall", target: "node-picks", type: "smoothstep" },
  { id: "e-live-admin", source: "nav-live", target: "node-admin", type: "smoothstep" },
  { id: "e-contact-privacy", source: "nav-contact", target: "node-privacy", type: "smoothstep" },

  // Row 2 -> Transactional Email Pipelines (Row 3)
  { id: "flow-fans-otp", source: "node-fans", target: "email-otp-pin", type: "smoothstep" },
  { id: "flow-cruise-confirm", source: "nav-cruise", target: "email-cruise-confirm", type: "smoothstep" },
  { id: "flow-book-receipt", source: "nav-book", target: "email-booking-planner", type: "smoothstep" },
  { id: "flow-book-admin", source: "nav-book", target: "email-booking-admin", type: "smoothstep" },
  { id: "flow-merch-pickup", source: "nav-merch", target: "email-merch-pickup", type: "smoothstep" },
  { id: "flow-admin-blast", source: "node-admin", target: "email-newsletter-blast", type: "smoothstep" },
];

export default function VisualSitemapClient() {
  const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-20 pb-12">
      
      {/* Global CSS override to force fill: none on all SVG edge paths */}
      <style jsx global>{`
        .react-flow__edge-path,
        .react-flow__edge path,
        .react-flow svg path {
          fill: none !important;
          stroke: #a855f7 !important;
          stroke-width: 2px !important;
        }
      `}</style>

      {/* Header bar */}
      <div className="max-w-[1700px] mx-auto px-6 py-4 flex items-center justify-between border border-purple-500/30 bg-[#0c0c14] mb-4 shadow-2xl rounded-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-black text-sm shadow-md">
            7H
          </div>
          <div>
            <h1 className="font-extrabold text-base text-white tracking-wider uppercase">
              7th Heaven Header Navigation & Sitemap Directory
            </h1>
            <p className="text-xs text-white/50">
              Clean domain-accurate visual sitemap tree where Root Home connects to all main section pages
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 rounded-lg border border-white/15 bg-white/5 text-white font-bold text-xs hover:bg-white/10 transition flex items-center gap-1.5"
          >
            <span>XML Sitemap</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Interactive Flow Canvas */}
      <div className="max-w-[1700px] mx-auto h-[950px] rounded-2xl border border-purple-500/30 bg-[#09090f] overflow-hidden shadow-2xl relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.08 }}
          colorMode="dark"
        >
          <Background color="#1e1b4b" gap={24} size={1} />
          <Controls className="!bg-black/90 !border-white/15 !text-white !rounded-xl overflow-hidden !shadow-2xl" />
          <MiniMap
            style={{ height: 110, width: 160 }}
            maskColor="rgba(0, 0, 0, 0.8)"
            nodeColor="#a855f7"
            className="!bg-black/90 !border-white/15 !rounded-xl !shadow-2xl"
          />
        </ReactFlow>
      </div>

    </div>
  );
}
