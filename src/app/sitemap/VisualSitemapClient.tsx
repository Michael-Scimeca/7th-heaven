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
}

// --- SLEEK DARK MODE SITEMAP CARD NODE WITH REAL PNG PAGE SCREENSHOT ---
function SitemapCardNode({ data }: NodeProps<Node<SitemapNodeData>>) {
  return (
    <div className="w-64 rounded-xl border border-white/15 bg-[#0f0f17] shadow-2xl overflow-hidden select-none hover:border-purple-400/60 transition-all duration-200 backdrop-blur-xl">
      <Handle type="target" position={Position.Top} className="!w-2.5 !h-2.5 !bg-purple-400 !border-0" />
      
      {/* Top Header Bar */}
      <div className="bg-[#181824] border-b border-white/10 py-1.5 px-3 text-center">
        <span className="font-extrabold text-xs text-purple-300 tracking-wider uppercase block truncate">
          {data.header}
        </span>
      </div>

      {/* REAL PNG PAGE SCREENSHOT PREVIEW */}
      <div className="w-full h-32 bg-black border-b border-white/10 overflow-hidden relative group">
        <img
          src={data.imgUrl}
          alt={data.title}
          className="w-full h-full object-cover object-top opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
          onError={(e) => {
            // Fallback if image fails
            (e.target as HTMLElement).style.display = "none";
          }}
        />
        <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 border border-white/20 text-[7px] font-mono text-cyan-300 font-bold">
          REAL PREVIEW
        </div>
      </div>

      {/* Body Content */}
      <div className="p-3 text-left space-y-1">
        {data.path ? (
          <Link href={data.path} className="font-bold text-xs text-cyan-300 hover:text-white hover:underline block leading-snug">
            {data.title}
          </Link>
        ) : (
          <span className="font-bold text-xs text-cyan-300 block leading-snug">
            {data.title}
          </span>
        )}

        {data.description && (
          <p className="text-white/60 text-[11px] leading-snug mt-1">
            {data.description}
          </p>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="!w-2.5 !h-2.5 !bg-cyan-400 !border-0" />
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

// --- IMMACULATE ZERO-OVERLAP GRID WITH REAL PAGE & MODAL SCREENSHOTS ---
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
      imgUrl: "/sitemap-screenshots/home.png",
      description:
        "7th Heaven is a chart-topping rock experience from Chicago with #1 Billboard hits and 40 years of live performances.",
    },
  },

  // FIRST ROW CHILDREN (y = 350, 380px horizontal pitch)
  {
    id: "node-sitemap",
    type: "sitemapCard",
    position: { x: 0, y: 350 },
    data: {
      header: "Sitemap",
      title: "7th Heaven — Platform Sitemap",
      path: "/sitemap",
      imgUrl: "/sitemap-screenshots/flowchart-sitemap.png",
      description: "Complete platform sitemap, page directory, and visual site architecture.",
    },
  },
  {
    id: "node-privacy",
    type: "sitemapCard",
    position: { x: 380, y: 350 },
    data: {
      header: "Privacy",
      title: "Privacy Policy — 7th Heaven",
      path: "/privacy",
      imgUrl: "/sitemap-screenshots/privacy.png",
      description:
        "How 7th Heaven collects, uses, and protects your personal information.",
    },
  },
  {
    id: "node-merch",
    type: "sitemapCard",
    position: { x: 760, y: 350 },
    data: {
      header: "Merch",
      title: "Merch — 7th Heaven Official Store",
      path: "/merch",
      imgUrl: "/sitemap-screenshots/merch.png",
      description:
        "Shop official 7th Heaven band merchandise — tees, hoodies, vinyl, and more.",
    },
  },
  {
    id: "node-crew",
    type: "sitemapCard",
    position: { x: 1140, y: 350 },
    data: {
      header: "Crew",
      title: "7th Heaven — Crew Portal",
      path: "/crew",
      imgUrl: "/sitemap-screenshots/crew.png",
      description:
        "Band member profiles, tour staff roster, stage setup checklists, and live tools.",
    },
  },
  {
    id: "node-shows",
    type: "sitemapCard",
    position: { x: 1520, y: 350 },
    data: {
      header: "Shows",
      title: "7th Heaven — Live Concerts & Shows",
      path: "/shows/past",
      imgUrl: "/sitemap-screenshots/shows.png",
      description: "Live concert archives, tour dates schedule, venue details, and booking inquiry.",
    },
  },
  {
    id: "node-pagetransition",
    type: "sitemapCard",
    position: { x: 1900, y: 350 },
    data: {
      header: "Pagetransition",
      title: "Preloader Reveal Demo",
      path: "/demo/preloader",
      imgUrl: "/sitemap-screenshots/ticker.png",
      description:
        "Real resource tracking, preloader animations, minimum display times, and page transitions.",
    },
  },
  {
    id: "node-planner",
    type: "sitemapCard",
    position: { x: 2280, y: 350 },
    data: {
      header: "Planner",
      title: "Planner Dashboard",
      path: "/planner",
      imgUrl: "/sitemap-screenshots/planner.png",
      description:
        "Event booking coordinator portal, status tracker, event checklist, and re-booking.",
    },
  },
  {
    id: "node-admin",
    type: "sitemapCard",
    position: { x: 2660, y: 350 },
    data: {
      header: "Admin",
      title: "Admin Command Center",
      path: "/admin",
      imgUrl: "/sitemap-screenshots/admin.png",
      description:
        "Master admin command center, analytics, Shopify sales, live stream control, and broadcasts.",
    },
  },
  {
    id: "node-book",
    type: "sitemapCard",
    position: { x: 3040, y: 350 },
    data: {
      header: "Book",
      title: "Book 7th Heaven — Chicago's Premier Live Band",
      path: "/book",
      imgUrl: "/sitemap-screenshots/book.png",
      description:
        "Book 7th Heaven for corporate events, weddings, and festivals. Premier live rock band.",
    },
  },

  // SECOND ROW SUB-CHILDREN: MODULES, VERIFICATION & SPECIALIZED PAGES (y = 670)
  {
    id: "node-login-modal",
    type: "sitemapCard",
    position: { x: 0, y: 670 },
    data: {
      header: "Sign In Module",
      title: "Passwordless Auth Modal",
      imgUrl: "/sitemap-screenshots/login-modal.png",
      description: "Passwordless OTP email sign in modal and JWT session authentication.",
    },
  },
  {
    id: "node-signup-modal",
    type: "sitemapCard",
    position: { x: 380, y: 670 },
    data: {
      header: "Sign Up Module",
      title: "Fan Club Registration Modal",
      imgUrl: "/sitemap-screenshots/signup-modal.png",
      description: "Fan registration, username creation, opt-in tracking, and instant signup PIN.",
    },
  },
  {
    id: "node-cruise-reg",
    type: "sitemapCard",
    position: { x: 760, y: 670 },
    data: {
      header: "Cruise Signup Module",
      title: "Caribbean Cruise Registration",
      path: "/cruise",
      imgUrl: "/sitemap-screenshots/cruise-form-filled.png",
      description: "2026 Cruise cabin registration form with email PIN verification.",
    },
  },
  {
    id: "node-crew-verify",
    type: "sitemapCard",
    position: { x: 1140, y: 670 },
    data: {
      header: "Crew Verify Module",
      title: "Crew PIN Verification",
      path: "/crew/verify",
      imgUrl: "/sitemap-screenshots/verify-admin-funnel.png",
      description: "6-digit passcode security check for road crew and staff access.",
    },
  },
  {
    id: "node-shows-past",
    type: "sitemapCard",
    position: { x: 1520, y: 670 },
    data: {
      header: "Past Shows Archive",
      title: "Past Shows & Concert Archive (1985–Present)",
      path: "/shows/past",
      imgUrl: "/sitemap-screenshots/shows.png",
      description: "1,200+ historical concert dates, venue search, and setlist archives.",
    },
  },
  {
    id: "node-email-pin",
    type: "sitemapCard",
    position: { x: 1900, y: 670 },
    data: {
      header: "PIN Email Template",
      title: "Verification PIN Email",
      imgUrl: "/sitemap-screenshots/email-pin-verification.png",
      description: "Resend transactional HTML email containing 6-digit authentication security PIN.",
    },
  },
  {
    id: "node-planner-verify",
    type: "sitemapCard",
    position: { x: 2280, y: 670 },
    data: {
      header: "Planner Verify Module",
      title: "Planner Security Verification",
      path: "/planner/verify",
      imgUrl: "/sitemap-screenshots/cruise-verify.png",
      description: "Security PIN verification module for private event coordinators.",
    },
  },

  // ADMIN & BOOK SUB-TREE (y = 670)
  {
    id: "node-admin-emailmap",
    type: "sitemapCard",
    position: { x: 2660, y: 670 },
    data: {
      header: "Email System Map",
      title: "Transactional Email Directory",
      path: "/admin/emails",
      imgUrl: "/sitemap-screenshots/admin-emailmap.png",
      description: "Live preview registry of all 14 Resend transactional email templates.",
    },
  },
  {
    id: "node-admin-legal",
    type: "sitemapCard",
    position: { x: 2840, y: 670 },
    data: {
      header: "Legal Module",
      title: "Legal & TCPA Compliance",
      path: "/admin/legal",
      imgUrl: "/sitemap-screenshots/admin-legal.png",
      description: "TCPA SMS regulations, COPPA, ADA accessibility, and E-commerce PCI rules.",
    },
  },
  {
    id: "node-book-success",
    type: "sitemapCard",
    position: { x: 3040, y: 670 },
    data: {
      header: "Booking Success Module",
      title: "Booking Confirmation Email",
      path: "/book/success",
      imgUrl: "/sitemap-screenshots/email-booking-confirm.png",
      description: "Confirmation alert and admin notification dispatch upon booking submission.",
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

  // Sub-tree connections (Modals, PINs & Emails)
  { id: "e-sitemap-login", source: "node-sitemap", target: "node-login-modal", type: "smoothstep" },
  { id: "e-privacy-signup", source: "node-privacy", target: "node-signup-modal", type: "smoothstep" },
  { id: "e-merch-cruise", source: "node-merch", target: "node-cruise-reg", type: "smoothstep" },
  { id: "e-crew-verify", source: "node-crew", target: "node-crew-verify", type: "smoothstep" },
  { id: "e-shows-past", source: "node-shows", target: "node-shows-past", type: "smoothstep" },
  { id: "e-page-emailpin", source: "node-pagetransition", target: "node-email-pin", type: "smoothstep" },
  { id: "e-planner-verify", source: "node-planner", target: "node-planner-verify", type: "smoothstep" },
  { id: "e-admin-emailmap", source: "node-admin", target: "node-admin-emailmap", type: "smoothstep" },
  { id: "e-admin-legal", source: "node-admin", target: "node-admin-legal", type: "smoothstep" },
  { id: "e-book-success", source: "node-book", target: "node-book-success", type: "smoothstep" },
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
              7th Heaven Visual Sitemap Engine
            </h1>
            <p className="text-xs text-white/50">
              Interactive visual sitemap tree architecture with REAL page, modal & email screenshots
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
      <div className="max-w-[1700px] mx-auto h-[880px] rounded-2xl border border-purple-500/30 bg-[#09090f] overflow-hidden shadow-2xl relative">
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
