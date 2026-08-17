"use client";

import React from "react";
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

import { ExternalLink, Layers, Terminal, Lock, UserCheck, Radio, Sparkles, ShoppingBag, Globe } from "lucide-react";

export interface SitemapNodeData extends Record<string, unknown> {
  header: string;
  title: string;
  path?: string;
  imgUrl: string;
  description?: string;
  badgeType?: "PAGE" | "MODULE" | "EMAIL" | "API";
}

// --- SLEEK DARK MODE SITEMAP CARD NODE WITH REAL JPG SCREENSHOTS & CATEGORY BADGES ---
function SitemapCardNode({ data }: NodeProps<Node<SitemapNodeData>>) {
  const isEmail = data.badgeType === "EMAIL";
  const isApi = data.badgeType === "API";
  const isModule = data.badgeType === "MODULE";

  return (
    <div className={`w-64 rounded-xl border ${
      isEmail
        ? "border-amber-400/50 bg-[#161005]"
        : isApi
        ? "border-emerald-400/50 bg-[#05140b]"
        : isModule
        ? "border-cyan-400/50 bg-[#051218]"
        : "border-white/15 bg-[#0f0f17]"
    } shadow-2xl overflow-hidden select-none hover:border-purple-400/60 transition-all duration-200 backdrop-blur-xl`}>
      <Handle type="target" position={Position.Top} className={`!w-2.5 !h-2.5 ${
        isEmail ? "!bg-amber-400" : isApi ? "!bg-emerald-400" : isModule ? "!bg-cyan-400" : "!bg-purple-400"
      } !border-0`} />
      
      {/* Top Header Bar */}
      <div className={`${
        isEmail
          ? "bg-amber-500/20 border-b border-amber-500/30"
          : isApi
          ? "bg-emerald-500/20 border-b border-emerald-500/30"
          : isModule
          ? "bg-cyan-500/20 border-b border-cyan-500/30"
          : "bg-[#181824] border-b border-white/10"
      } py-1.5 px-3 flex items-center justify-between`}>
        <span className={`font-extrabold text-xs tracking-wider uppercase truncate ${
          isEmail ? "text-amber-300" : isApi ? "text-emerald-300" : isModule ? "text-cyan-300" : "text-purple-300"
        }`}>
          {data.header}
        </span>
        {isEmail ? (
          <span className="px-1.5 py-0.2 rounded bg-amber-500/30 text-amber-200 text-[7px] font-mono font-black">
            ✉ RESEND
          </span>
        ) : isApi ? (
          <span className="px-1.5 py-0.2 rounded bg-emerald-500/30 text-emerald-200 text-[7px] font-mono font-black">
            API
          </span>
        ) : null}
      </div>

      {/* REAL HIGH-SPEED JPG SCREENSHOT PREVIEW */}
      <div className="w-full h-36 bg-black border-b border-white/10 overflow-hidden relative group">
        <img
          src={data.imgUrl}
          alt={data.title}
          className="w-full h-full object-cover object-top opacity-95 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300 block"
        />
        <div className={`absolute bottom-1 right-1 px-1.5 py-0.5 rounded border text-[7px] font-mono font-bold ${
          isEmail
            ? "bg-amber-950/90 border-amber-500/40 text-amber-300"
            : isApi
            ? "bg-emerald-950/90 border-emerald-500/40 text-emerald-300"
            : "bg-black/80 border-white/20 text-cyan-300"
        }`}>
          {isEmail ? "EMAIL SCREENSHOT" : isApi ? "JSON ENDPOINT" : "REAL SCREENSHOT"}
        </div>
      </div>

      {/* Body Content */}
      <div className="p-3 text-left space-y-1">
        {data.path ? (
          <Link href={data.path} className="font-bold text-xs text-cyan-300 hover:text-white hover:underline block leading-snug">
            {data.title}
          </Link>
        ) : (
          <span className={`font-bold text-xs block leading-snug ${
            isEmail ? "text-amber-200" : isApi ? "text-emerald-200" : "text-cyan-300"
          }`}>
            {data.title}
          </span>
        )}

        {data.description && (
          <p className="text-white/60 text-[11px] leading-snug mt-1">
            {data.description}
          </p>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className={`!w-2.5 !h-2.5 ${
        isEmail ? "!bg-amber-400" : isApi ? "!bg-emerald-400" : "!bg-cyan-400"
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

// --- FULL DEVELOPER ROUTE DIRECTORY TREE (ALL 8 CATEGORIES FROM DevRouteList.tsx) ---
const INITIAL_NODES: Node<SitemapNodeData>[] = [
  // ROOT HOME (Center Top at x = 1520, y = 30)
  {
    id: "root",
    type: "sitemapCard",
    position: { x: 1520, y: 30 },
    data: {
      header: "Home Page",
      title: "7th Heaven — Official Band Website",
      path: "/",
      imgUrl: "/sitemap-thumbs/home.jpg",
      badgeType: "PAGE",
      description:
        "7th Heaven is a chart-topping rock experience from Chicago with #1 Billboard hits and 40 years of live performances.",
    },
  },

  // 🌐 PUBLIC PAGES BRANCH (Row 1: y = 360)
  {
    id: "node-shows",
    type: "sitemapCard",
    position: { x: 0, y: 360 },
    data: {
      header: "Concert Shows",
      title: "Live Concerts & Tour Dates",
      path: "/shows/past",
      imgUrl: "/sitemap-thumbs/shows.jpg",
      badgeType: "PAGE",
      description: "Live concert archives, tour dates schedule, venue details, and setlists.",
    },
  },
  {
    id: "node-contact",
    type: "sitemapCard",
    position: { x: 380, y: 360 },
    data: {
      header: "Contact & Booking",
      title: "Contact Management & Band Inquiries",
      path: "/contact",
      imgUrl: "/sitemap-thumbs/contact.jpg",
      badgeType: "PAGE",
      description: "Direct contact inquiry form for booking agents and event organizers.",
    },
  },
  {
    id: "node-book",
    type: "sitemapCard",
    position: { x: 760, y: 360 },
    data: {
      header: "Booking Form",
      title: "Book 7th Heaven — Live Band",
      path: "/book",
      imgUrl: "/sitemap-thumbs/book.jpg",
      badgeType: "PAGE",
      description: "Multi-step event booking request form with date picker and instant quote.",
    },
  },
  {
    id: "node-media",
    type: "sitemapCard",
    position: { x: 1140, y: 360 },
    data: {
      header: "Media & Press Kit",
      title: "Photos, Videos & High-Res Press Kit",
      path: "/media",
      imgUrl: "/sitemap-thumbs/media.jpg",
      badgeType: "PAGE",
      description: "Official promotional assets, high-res photos, stage rider, and press kit downloads.",
    },
  },
  {
    id: "node-faq",
    type: "sitemapCard",
    position: { x: 1520, y: 360 },
    data: {
      header: "FAQ Page",
      title: "Frequently Asked Questions",
      path: "/faq",
      imgUrl: "/sitemap-thumbs/faq.jpg",
      badgeType: "PAGE",
      description: "Frequently asked questions regarding concerts, ticket sales, and booking.",
    },
  },
  {
    id: "node-privacy",
    type: "sitemapCard",
    position: { x: 1900, y: 360 },
    data: {
      header: "Privacy & Terms",
      title: "Privacy Policy & Terms of Service",
      path: "/privacy",
      imgUrl: "/sitemap-thumbs/privacy.jpg",
      badgeType: "PAGE",
      description: "Data collection rules, user rights, terms of service, and cookie policy.",
    },
  },

  // 🛍️ STORE & MERCH BRANCH (Row 1 continued: x = 2280..3040, y = 360)
  {
    id: "node-merch",
    type: "sitemapCard",
    position: { x: 2280, y: 360 },
    data: {
      header: "Official Store",
      title: "7th Heaven Merch & Apparel",
      path: "/merch",
      imgUrl: "/sitemap-thumbs/merch.jpg",
      badgeType: "PAGE",
      description: "Official band merchandise — tees, hoodies, vinyl records, and stage picks.",
    },
  },
  {
    id: "node-payment-test",
    type: "sitemapCard",
    position: { x: 2660, y: 360 },
    data: {
      header: "Payment Checkout",
      title: "Shopify Checkout & EPX Test",
      path: "/payment-test",
      imgUrl: "/sitemap-thumbs/payment-test.jpg",
      badgeType: "PAGE",
      description: "Live merchandise checkout gateway, instant card processing, and pickup receipt.",
    },
  },

  // 🌟 FAN PORTAL & CRUISE BRANCH (Row 2: y = 700)
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
      description: "VIP fan dashboard, photo upload wall, referral badges, and exclusive perks.",
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
    id: "node-cruise",
    type: "sitemapCard",
    position: { x: 760, y: 700 },
    data: {
      header: "Cruise 2026",
      title: "Caribbean Rock Cruise 2026",
      path: "/cruise",
      imgUrl: "/sitemap-thumbs/cruise.jpg",
      badgeType: "PAGE",
      description: "2026 Fan Cruise itinerary, cabin options, and reservation signup.",
    },
  },
  {
    id: "node-planner",
    type: "sitemapCard",
    position: { x: 1140, y: 700 },
    data: {
      header: "Show Planner",
      title: "Event Booking Coordinator",
      path: "/planner",
      imgUrl: "/sitemap-thumbs/planner.jpg",
      badgeType: "PAGE",
      description: "Private event planner dashboard, date checklist, and event coordinator portal.",
    },
  },
  {
    id: "node-live",
    type: "sitemapCard",
    position: { x: 1520, y: 700 },
    data: {
      header: "Live Stream Hub",
      title: "Live Concert Stream & Chat",
      path: "/live",
      imgUrl: "/sitemap-thumbs/live.jpg",
      badgeType: "PAGE",
      description: "LiveKit powered multi-camera live video stream, band audio feeds, and fan chat.",
    },
  },

  // 🔐 ADMIN & CREW BRANCH (Row 2 continued: x = 1900..2660, y = 700)
  {
    id: "node-admin",
    type: "sitemapCard",
    position: { x: 1900, y: 700 },
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
    id: "node-crew",
    type: "sitemapCard",
    position: { x: 2280, y: 700 },
    data: {
      header: "Crew HQ",
      title: "Road Crew & Staff Portal",
      path: "/crew",
      imgUrl: "/sitemap-thumbs/crew.jpg",
      badgeType: "PAGE",
      description: "Tour staff schedule, stage setup checklists, equipment inventory, and shift alerts.",
    },
  },
  {
    id: "node-styleguide",
    type: "sitemapCard",
    position: { x: 2660, y: 700 },
    data: {
      header: "UI Style Guide",
      title: "Fluid Design System & Studio",
      path: "/style-guide",
      imgUrl: "/sitemap-thumbs/style-guide.jpg",
      badgeType: "PAGE",
      description: "Component library, button variants, color palette, and fluid typography tokens.",
    },
  },

  // ✉ TRANSACTIONAL EMAIL PIPELINES (Row 3: y = 1040)
  {
    id: "email-otp-pin",
    type: "sitemapCard",
    position: { x: 0, y: 1040 },
    data: {
      header: "✉ OTP Verification",
      title: "6-Digit Security PIN Email",
      imgUrl: "/sitemap-thumbs/email-pin-verification.jpg",
      badgeType: "EMAIL",
      description: "Dispatched via Resend API on Fan Signup & Cruise Registration.",
    },
  },
  {
    id: "email-cruise-confirm",
    type: "sitemapCard",
    position: { x: 760, y: 1040 },
    data: {
      header: "✉ Cruise Confirmation",
      title: "Cruise Cabin Reservation Email",
      imgUrl: "/sitemap-thumbs/email-cruise-confirm.jpg",
      badgeType: "EMAIL",
      description: "Sent upon 6-digit PIN verification for Cruise 2026 registrations.",
    },
  },
  {
    id: "email-booking-planner",
    type: "sitemapCard",
    position: { x: 1140, y: 1040 },
    data: {
      header: "✉ Booking Receipt",
      title: "Planner Booking Confirmation",
      imgUrl: "/sitemap-thumbs/email-booking-confirm.jpg",
      badgeType: "EMAIL",
      description: "Sent to show planner upon booking form submission with event summary.",
    },
  },
  {
    id: "email-booking-admin",
    type: "sitemapCard",
    position: { x: 1900, y: 1040 },
    data: {
      header: "✉ Admin Booking Alert",
      title: "New Booking Notification",
      imgUrl: "/sitemap-thumbs/email-booking-admin.jpg",
      badgeType: "EMAIL",
      description: "Sent to 7th Heaven management with quick Approve / Decline action links.",
    },
  },
  {
    id: "email-merch-pickup",
    type: "sitemapCard",
    position: { x: 2280, y: 1040 },
    data: {
      header: "✉ Merch Pickup Email",
      title: "Flash Order Pickup Receipt",
      imgUrl: "/sitemap-thumbs/email-flash-pickup.jpg",
      badgeType: "EMAIL",
      description: "Sent instantly upon Shopify merchandise purchase for venue pickup.",
    },
  },
  {
    id: "email-newsletter-blast",
    type: "sitemapCard",
    position: { x: 2660, y: 1040 },
    data: {
      header: "✉ Tour Announcement",
      title: "Newsletter Broadcast Email",
      imgUrl: "/sitemap-thumbs/email-newsletter-blast.jpg",
      badgeType: "EMAIL",
      description: "Dispatched from Admin Newsletter Studio to subscribed fan members.",
    },
  },
];

// --- CONNECTING LINES FROM ROOT TO DEVELOPER ROUTE BRANCHES ---
const INITIAL_EDGES: Edge[] = [
  // Root -> Main Category Branches
  { id: "e-root-shows", source: "root", target: "node-shows", type: "smoothstep" },
  { id: "e-root-contact", source: "root", target: "node-contact", type: "smoothstep" },
  { id: "e-root-book", source: "root", target: "node-book", type: "smoothstep" },
  { id: "e-root-media", source: "root", target: "node-media", type: "smoothstep" },
  { id: "e-root-faq", source: "root", target: "node-faq", type: "smoothstep" },
  { id: "e-root-privacy", source: "root", target: "node-privacy", type: "smoothstep" },
  { id: "e-root-merch", source: "root", target: "node-merch", type: "smoothstep" },
  { id: "e-root-payment", source: "root", target: "node-payment-test", type: "smoothstep" },

  // Row 1 -> Row 2 Branches
  { id: "e-shows-fans", source: "node-shows", target: "node-fans", type: "smoothstep" },
  { id: "e-contact-picks", source: "node-contact", target: "node-picks", type: "smoothstep" },
  { id: "e-book-cruise", source: "node-book", target: "node-cruise", type: "smoothstep" },
  { id: "e-media-planner", source: "node-media", target: "node-planner", type: "smoothstep" },
  { id: "e-faq-live", source: "node-faq", target: "node-live", type: "smoothstep" },
  { id: "e-privacy-admin", source: "node-privacy", target: "node-admin", type: "smoothstep" },
  { id: "e-merch-crew", source: "node-merch", target: "node-crew", type: "smoothstep" },
  { id: "e-payment-style", source: "node-payment-test", target: "node-styleguide", type: "smoothstep" },

  // Row 2 -> Transactional Email Triggers
  { id: "flow-fans-otp", source: "node-fans", target: "email-otp-pin", type: "smoothstep" },
  { id: "flow-cruise-confirm", source: "node-cruise", target: "email-cruise-confirm", type: "smoothstep" },
  { id: "flow-planner-receipt", source: "node-planner", target: "email-booking-planner", type: "smoothstep" },
  { id: "flow-admin-alert", source: "node-admin", target: "email-booking-admin", type: "smoothstep" },
  { id: "flow-crew-pickup", source: "node-crew", target: "email-merch-pickup", type: "smoothstep" },
  { id: "flow-style-blast", source: "node-styleguide", target: "email-newsletter-blast", type: "smoothstep" },
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
              7th Heaven Developer Route & Email Directory
            </h1>
            <p className="text-xs text-white/50">
              Interactive visual sitemap tree mapping all 8 categories from DevRouteList with real 15KB thumbnail screenshots
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
