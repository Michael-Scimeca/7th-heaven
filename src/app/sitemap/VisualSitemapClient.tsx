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

import { ExternalLink } from "lucide-react";

export interface SitemapNodeData extends Record<string, unknown> {
  header: string;
  title: string;
  path?: string;
  imgUrl: string;
  description?: string;
  badgeType?: "PAGE" | "MODULE" | "EMAIL";
}

// --- SLEEK DARK MODE SITEMAP CARD NODE WITH REAL JPG PAGE & EMAIL SCREENSHOTS ---
function SitemapCardNode({ data }: NodeProps<Node<SitemapNodeData>>) {
  const isEmail = data.badgeType === "EMAIL";

  return (
    <div className={`w-64 rounded-xl border ${isEmail ? "border-amber-400/50 bg-[#161005]" : "border-white/15 bg-[#0f0f17]"} shadow-2xl overflow-hidden select-none hover:border-purple-400/60 transition-all duration-200 backdrop-blur-xl`}>
      <Handle type="target" position={Position.Top} className={`!w-2.5 !h-2.5 ${isEmail ? "!bg-amber-400" : "!bg-purple-400"} !border-0`} />
      
      {/* Top Header Bar */}
      <div className={`${isEmail ? "bg-amber-500/20 border-b border-amber-500/30" : "bg-[#181824] border-b border-white/10"} py-1.5 px-3 flex items-center justify-between`}>
        <span className={`font-extrabold text-xs tracking-wider uppercase truncate ${isEmail ? "text-amber-300" : "text-purple-300"}`}>
          {data.header}
        </span>
        {isEmail && (
          <span className="px-1.5 py-0.2 rounded bg-amber-500/30 text-amber-200 text-[7px] font-mono font-black">
            ✉ RESEND API
          </span>
        )}
      </div>

      {/* REAL HIGH-SPEED JPG SCREENSHOT PREVIEW */}
      <div className="w-full h-36 bg-black border-b border-white/10 overflow-hidden relative group">
        <img
          src={data.imgUrl}
          alt={data.title}
          className="w-full h-full object-cover object-top opacity-95 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300 block"
        />
        <div className={`absolute bottom-1 right-1 px-1.5 py-0.5 rounded border text-[7px] font-mono font-bold ${isEmail ? "bg-amber-950/90 border-amber-500/40 text-amber-300" : "bg-black/80 border-white/20 text-cyan-300"}`}>
          {isEmail ? "EMAIL SCREENSHOT" : "REAL SCREENSHOT"}
        </div>
      </div>

      {/* Body Content */}
      <div className="p-3 text-left space-y-1">
        {data.path ? (
          <Link href={data.path} className="font-bold text-xs text-cyan-300 hover:text-white hover:underline block leading-snug">
            {data.title}
          </Link>
        ) : (
          <span className={`font-bold text-xs block leading-snug ${isEmail ? "text-amber-200" : "text-cyan-300"}`}>
            {data.title}
          </span>
        )}

        {data.description && (
          <p className="text-white/60 text-[11px] leading-snug mt-1">
            {data.description}
          </p>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className={`!w-2.5 !h-2.5 ${isEmail ? "!bg-amber-400" : "!bg-cyan-400"} !border-0`} />
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

// --- COMPLETE SITE & EMAIL TRANSACTION PIPELINE GRID WITH REAL SCREENSHOTS ---
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

  // FIRST ROW CHILDREN: CORE SITE PAGES (y = 360, 380px horizontal pitch)
  {
    id: "node-sitemap",
    type: "sitemapCard",
    position: { x: 0, y: 360 },
    data: {
      header: "Sitemap Page",
      title: "7th Heaven — Platform Sitemap",
      path: "/sitemap",
      imgUrl: "/sitemap-thumbs/flowchart-sitemap.jpg",
      badgeType: "PAGE",
      description: "Complete platform sitemap, page directory, and visual site architecture.",
    },
  },
  {
    id: "node-privacy",
    type: "sitemapCard",
    position: { x: 380, y: 360 },
    data: {
      header: "Privacy Policy",
      title: "Privacy Policy — 7th Heaven",
      path: "/privacy",
      imgUrl: "/sitemap-thumbs/privacy.jpg",
      badgeType: "PAGE",
      description:
        "How 7th Heaven collects, uses, and protects your personal information.",
    },
  },
  {
    id: "node-merch",
    type: "sitemapCard",
    position: { x: 760, y: 360 },
    data: {
      header: "Merch Store",
      title: "Merch — Official Store",
      path: "/merch",
      imgUrl: "/sitemap-thumbs/merch.jpg",
      badgeType: "PAGE",
      description:
        "Shop official 7th Heaven band merchandise — tees, hoodies, vinyl, and tickets.",
    },
  },
  {
    id: "node-crew",
    type: "sitemapCard",
    position: { x: 1140, y: 360 },
    data: {
      header: "Crew Portal",
      title: "7th Heaven — Crew Portal",
      path: "/crew",
      imgUrl: "/sitemap-thumbs/crew.jpg",
      badgeType: "PAGE",
      description:
        "Band member profiles, tour staff roster, stage setup checklists, and shift tools.",
    },
  },
  {
    id: "node-shows",
    type: "sitemapCard",
    position: { x: 1520, y: 360 },
    data: {
      header: "Concert Shows",
      title: "Live Concerts & Tour Dates",
      path: "/shows/past",
      imgUrl: "/sitemap-thumbs/shows.jpg",
      badgeType: "PAGE",
      description: "Live concert archives, tour dates schedule, venue details, and booking inquiry.",
    },
  },
  {
    id: "node-pagetransition",
    type: "sitemapCard",
    position: { x: 1900, y: 360 },
    data: {
      header: "Pagetransition",
      title: "Preloader Reveal Demo",
      path: "/demo/preloader",
      imgUrl: "/sitemap-thumbs/ticker.jpg",
      badgeType: "PAGE",
      description:
        "Real resource tracking, preloader animations, minimum display times, and page transitions.",
    },
  },
  {
    id: "node-planner",
    type: "sitemapCard",
    position: { x: 2280, y: 360 },
    data: {
      header: "Planner Hub",
      title: "Planner Dashboard",
      path: "/planner",
      imgUrl: "/sitemap-thumbs/planner.jpg",
      badgeType: "PAGE",
      description:
        "Event booking coordinator portal, status tracker, event checklist, and re-booking.",
    },
  },
  {
    id: "node-admin",
    type: "sitemapCard",
    position: { x: 2660, y: 360 },
    data: {
      header: "Master Admin",
      title: "Admin Command Center",
      path: "/admin",
      imgUrl: "/sitemap-thumbs/admin.jpg",
      badgeType: "PAGE",
      description:
        "Master admin command center, analytics, Shopify sales, live stream control, and broadcasts.",
    },
  },
  {
    id: "node-book",
    type: "sitemapCard",
    position: { x: 3040, y: 360 },
    data: {
      header: "Booking Page",
      title: "Book 7th Heaven — Live Band",
      path: "/book",
      imgUrl: "/sitemap-thumbs/book.jpg",
      badgeType: "PAGE",
      description:
        "Book 7th Heaven for corporate events, weddings, and festivals. Premier live rock band.",
    },
  },

  // SECOND ROW: INTERACTIVE AUTH & VERIFICATION MODULES (y = 700)
  {
    id: "node-login-modal",
    type: "sitemapCard",
    position: { x: 0, y: 700 },
    data: {
      header: "Sign In Module",
      title: "Passwordless Auth Modal",
      imgUrl: "/sitemap-thumbs/login-modal.jpg",
      badgeType: "MODULE",
      description: "Passwordless OTP email sign in modal and JWT session authentication.",
    },
  },
  {
    id: "node-signup-modal",
    type: "sitemapCard",
    position: { x: 380, y: 700 },
    data: {
      header: "Sign Up Module",
      title: "Fan Registration Modal",
      imgUrl: "/sitemap-thumbs/signup-modal.jpg",
      badgeType: "MODULE",
      description: "Fan registration, username creation, opt-in tracking, and instant signup PIN.",
    },
  },
  {
    id: "node-cruise-reg",
    type: "sitemapCard",
    position: { x: 760, y: 700 },
    data: {
      header: "Cruise Signup Form",
      title: "Caribbean Cruise Registration",
      path: "/cruise",
      imgUrl: "/sitemap-thumbs/cruise-form-filled.jpg",
      badgeType: "MODULE",
      description: "2026 Cruise cabin registration form triggering email PIN verification.",
    },
  },
  {
    id: "node-crew-verify",
    type: "sitemapCard",
    position: { x: 1140, y: 700 },
    data: {
      header: "Crew Verify Module",
      title: "Crew Passcode Verification",
      path: "/crew/verify",
      imgUrl: "/sitemap-thumbs/verify-admin-funnel.jpg",
      badgeType: "MODULE",
      description: "6-digit passcode security check for road crew and staff access.",
    },
  },
  {
    id: "node-shows-past",
    type: "sitemapCard",
    position: { x: 1520, y: 700 },
    data: {
      header: "Past Shows Archive",
      title: "1,200+ Performance Archive",
      path: "/shows/past",
      imgUrl: "/sitemap-thumbs/shows.jpg",
      badgeType: "PAGE",
      description: "Historical concert dates, venue search, and setlist archives since 1985.",
    },
  },
  {
    id: "node-planner-verify",
    type: "sitemapCard",
    position: { x: 2280, y: 700 },
    data: {
      header: "Planner Verify Module",
      title: "Planner Security Check",
      path: "/planner/verify",
      imgUrl: "/sitemap-thumbs/cruise-verify.jpg",
      badgeType: "MODULE",
      description: "Security PIN verification module for private event coordinators.",
    },
  },
  {
    id: "node-admin-emailmap",
    type: "sitemapCard",
    position: { x: 2660, y: 700 },
    data: {
      header: "Email System Map",
      title: "Transactional Email Directory",
      path: "/admin/emails",
      imgUrl: "/sitemap-thumbs/admin-emailmap.jpg",
      badgeType: "MODULE",
      description: "Live preview registry of all 14 Resend transactional email templates.",
    },
  },
  {
    id: "node-admin-legal",
    type: "sitemapCard",
    position: { x: 2840, y: 700 },
    data: {
      header: "Legal Module",
      title: "Legal & TCPA Compliance",
      path: "/admin/legal",
      imgUrl: "/sitemap-thumbs/admin-legal.jpg",
      badgeType: "MODULE",
      description: "TCPA SMS regulations, COPPA, ADA accessibility, and E-commerce PCI rules.",
    },
  },
  {
    id: "node-book-success",
    type: "sitemapCard",
    position: { x: 3040, y: 700 },
    data: {
      header: "Booking Form Submit",
      title: "Booking Submitted Action",
      path: "/book/success",
      imgUrl: "/sitemap-thumbs/email-booking-confirm.jpg",
      badgeType: "MODULE",
      description: "Triggers Resend API dispatch for Planner Receipt & Admin Alert Emails.",
    },
  },

  // THIRD ROW: TRANSACTIONAL EMAIL PIPELINES WITH REAL EMAIL SCREENSHOTS (y = 1040)
  {
    id: "email-otp-pin",
    type: "sitemapCard",
    position: { x: 380, y: 1040 },
    data: {
      header: "✉ Email 1: OTP PIN",
      title: "Verification PIN Email",
      imgUrl: "/sitemap-thumbs/email-pin-verification.jpg",
      badgeType: "EMAIL",
      description: "Sent via Resend API on Sign Up / Cruise Signup. Contains 6-digit security code.",
    },
  },
  {
    id: "email-cruise-confirm",
    type: "sitemapCard",
    position: { x: 760, y: 1040 },
    data: {
      header: "✉ Email 2: Cruise Confirm",
      title: "Cruise Confirmation Email",
      imgUrl: "/sitemap-thumbs/email-cruise-confirm.jpg",
      badgeType: "EMAIL",
      description: "Sent automatically once the 6-digit verification PIN is entered successfully.",
    },
  },
  {
    id: "email-booking-planner",
    type: "sitemapCard",
    position: { x: 1520, y: 1040 },
    data: {
      header: "✉ Email 3: Booking Receipt",
      title: "Planner Booking Receipt",
      imgUrl: "/sitemap-thumbs/email-booking-confirm.jpg",
      badgeType: "EMAIL",
      description: "Sent to event planner upon booking form submission with event summary.",
    },
  },
  {
    id: "email-booking-admin",
    type: "sitemapCard",
    position: { x: 1900, y: 1040 },
    data: {
      header: "✉ Email 4: Admin Alert",
      title: "New Booking Admin Alert",
      imgUrl: "/sitemap-thumbs/email-booking-admin.jpg",
      badgeType: "EMAIL",
      description: "Sent to 7th Heaven band management with quick Approve / Decline links.",
    },
  },
  {
    id: "email-booking-status",
    type: "sitemapCard",
    position: { x: 2280, y: 1040 },
    data: {
      header: "✉ Email 5: Booking Status",
      title: "Booking Approved Email",
      imgUrl: "/sitemap-thumbs/email-booking-status.jpg",
      badgeType: "EMAIL",
      description: "Sent to event planner when admin approves or updates booking status.",
    },
  },
  {
    id: "email-merch-pickup",
    type: "sitemapCard",
    position: { x: 2660, y: 1040 },
    data: {
      header: "✉ Email 6: Merch Receipt",
      title: "Flash Merch Pickup Email",
      imgUrl: "/sitemap-thumbs/email-flash-pickup.jpg",
      badgeType: "EMAIL",
      description: "Sent instantly upon Shopify payment test completion for venue pickup.",
    },
  },
  {
    id: "email-schedule-alert",
    type: "sitemapCard",
    position: { x: 3040, y: 1040 },
    data: {
      header: "✉ Email 7: Shift Alert",
      title: "Crew Schedule Change Alert",
      imgUrl: "/sitemap-thumbs/email-schedule-change-alert.jpg",
      badgeType: "EMAIL",
      description: "Sent to road crew staff when stage shift times or call times are updated.",
    },
  },
  {
    id: "email-newsletter-blast",
    type: "sitemapCard",
    position: { x: 3420, y: 1040 },
    data: {
      header: "✉ Email 8: Tour Blast",
      title: "Newsletter Tour Announcement",
      imgUrl: "/sitemap-thumbs/email-newsletter-blast.jpg",
      badgeType: "EMAIL",
      description: "Sent to all subscribed fan club members for tour announcements.",
    },
  },
];

// --- ORTHOGONAL CONNECTING LINES WITH NO FILL GLITCHES ---
const INITIAL_EDGES: Edge[] = [
  { id: "e-root-sitemap", source: "root", target: "node-sitemap", type: "smoothstep" },
  { id: "e-root-privacy", source: "root", target: "node-privacy", type: "smoothstep" },
  { id: "e-root-merch", source: "root", target: "node-merch", type: "smoothstep" },
  { id: "e-root-crew", source: "root", target: "node-crew", type: "smoothstep" },
  { id: "e-root-shows", source: "root", target: "node-shows", type: "smoothstep" },
  { id: "e-root-pagetransition", source: "root", target: "node-pagetransition", type: "smoothstep" },
  { id: "e-root-planner", source: "root", target: "node-planner", type: "smoothstep" },
  { id: "e-root-admin", source: "root", target: "node-admin", type: "smoothstep" },
  { id: "e-root-book", source: "root", target: "node-book", type: "smoothstep" },

  // Sub-tree connections (Pages -> Modules)
  { id: "e-sitemap-login", source: "node-sitemap", target: "node-login-modal", type: "smoothstep" },
  { id: "e-privacy-signup", source: "node-privacy", target: "node-signup-modal", type: "smoothstep" },
  { id: "e-merch-cruise", source: "node-merch", target: "node-cruise-reg", type: "smoothstep" },
  { id: "e-crew-verify", source: "node-crew", target: "node-crew-verify", type: "smoothstep" },
  { id: "e-shows-past", source: "node-shows", target: "node-shows-past", type: "smoothstep" },
  { id: "e-planner-verify", source: "node-planner", target: "node-planner-verify", type: "smoothstep" },
  { id: "e-admin-emailmap", source: "node-admin", target: "node-admin-emailmap", type: "smoothstep" },
  { id: "e-admin-legal", source: "node-admin", target: "node-admin-legal", type: "smoothstep" },
  { id: "e-book-success", source: "node-book", target: "node-book-success", type: "smoothstep" },

  // TRANSACTIONAL EMAIL PIPELINE EDGES (Modules -> Emails)
  { id: "flow-signup-otp", source: "node-signup-modal", target: "email-otp-pin", type: "smoothstep" },
  { id: "flow-cruise-confirm", source: "node-cruise-reg", target: "email-cruise-confirm", type: "smoothstep" },
  { id: "flow-book-receipt", source: "node-book-success", target: "email-booking-planner", type: "smoothstep" },
  { id: "flow-book-admin", source: "node-book-success", target: "email-booking-admin", type: "smoothstep" },
  { id: "flow-book-approved", source: "node-admin", target: "email-booking-status", type: "smoothstep" },
  { id: "flow-merch-receipt", source: "node-merch", target: "email-merch-pickup", type: "smoothstep" },
  { id: "flow-crew-alert", source: "node-crew-verify", target: "email-schedule-alert", type: "smoothstep" },
  { id: "flow-tour-blast", source: "node-admin-emailmap", target: "email-newsletter-blast", type: "smoothstep" },
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
              7th Heaven Visual Sitemap & Email Pipeline Engine
            </h1>
            <p className="text-xs text-white/50">
              Interactive visual sitemap tree architecture with fast 15KB real JPG screenshots of all pages & emails
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
