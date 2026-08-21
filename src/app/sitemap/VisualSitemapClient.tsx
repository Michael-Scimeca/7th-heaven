"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";

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

import { ExternalLink, Layers, Calendar, Ship, UserPlus } from "lucide-react";

export interface SitemapNodeData extends Record<string, unknown> {
  header: string;
  title: string;
  path?: string;
  imgUrl: string;
  description?: string;
  badgeType?: "HEADER_NAV" | "FOOTER_NAV" | "PORTAL" | "MODULE" | "EMAIL";
}

// --- SLEEK DARK MODE SITEMAP CARD NODE WITH DISTINCT BADGES ---
function SitemapCardNode({ data }: NodeProps<Node<SitemapNodeData>>) {
  const [imgError, setImgError] = useState(false);
  const isHeaderNav = data.badgeType === "HEADER_NAV";
  const isFooterNav = data.badgeType === "FOOTER_NAV";
  const isPortal = data.badgeType === "PORTAL";
  const isEmail = data.badgeType === "EMAIL";
  const isModule = data.badgeType === "MODULE";
  const targetPath = data.path || "/";

  return (
    <div className={`w-64 rounded-xl border ${isHeaderNav
      ? "border-purple-400/60 bg-[#120b22]"
      : isFooterNav
        ? "border-blue-400/60 bg-[#081022]"
        : isPortal
          ? "border-cyan-400/50 bg-[#051218]"
          : isEmail
            ? "border-amber-400/50 bg-[#161005]"
            : isModule
              ? "border-emerald-400/50 bg-[#051810]"
              : "border-white/15 bg-[#0f0f17]"
      } shadow-2xl overflow-hidden select-none hover:border-purple-400/90 transition-all duration-200 backdrop-blur-xl group`}>
      <Handle type="target" position={Position.Top} className={`!w-2.5 !h-2.5 ${isHeaderNav
        ? "!bg-purple-400"
        : isFooterNav
          ? "!bg-blue-400"
          : isPortal
            ? "!bg-cyan-400"
            : isEmail
              ? "!bg-amber-400"
              : "!bg-emerald-400"
        } !border-0`} />
      <Handle type="target" position={Position.Left} id="left" className="!w-2.5 !h-2.5 !bg-purple-400 !border-0" />

      {/* CLICKABLE SCREENSHOT & HEADER CONTAINER */}
      <Link href={targetPath} className="block cursor-pointer">
        {/* Top Browser Header Bar */}
        <div className={`${isHeaderNav
          ? "bg-purple-600/30 border-b border-purple-500/40 group-hover:bg-purple-600/40"
          : isFooterNav
            ? "bg-blue-600/30 border-b border-blue-500/40 group-hover:bg-blue-600/40"
            : isPortal
              ? "bg-cyan-500/20 border-b border-cyan-500/30 group-hover:bg-cyan-500/30"
              : isEmail
                ? "bg-amber-500/20 border-b border-amber-500/30 group-hover:bg-amber-500/30"
                : "bg-emerald-500/20 border-b border-emerald-500/30 group-hover:bg-emerald-500/30"
          } py-1.5 px-3 flex items-center justify-between transition-colors`}>
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="flex items-center gap-1 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500/80" />
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500/80" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80" />
            </div>
            <span className={`font-extrabold text-[10px] tracking-wider uppercase truncate ${isHeaderNav
              ? "text-purple-200"
              : isFooterNav
                ? "text-blue-200"
                : isPortal
                  ? "text-cyan-300"
                  : isEmail
                    ? "text-amber-300"
                    : "text-emerald-300"
              }`}>
              {data.header}
            </span>
          </div>
          {isHeaderNav ? (
            <span className="px-1.5 py-0.2 rounded bg-purple-500/40 text-purple-200 text-[7px] font-mono font-black shrink-0">
              HEADER NAV
            </span>
          ) : isFooterNav ? (
            <span className="px-1.5 py-0.2 rounded bg-blue-500/40 text-blue-200 text-[7px] font-mono font-black shrink-0">
              FOOTER NAV
            </span>
          ) : isPortal ? (
            <span className="px-1.5 py-0.2 rounded bg-cyan-500/30 text-cyan-200 text-[7px] font-mono font-black shrink-0">
              PORTAL
            </span>
          ) : isEmail ? (
            <span className="px-1.5 py-0.2 rounded bg-amber-500/30 text-amber-200 text-[7px] font-mono font-black shrink-0">
              ✉ RESEND
            </span>
          ) : (
            <span className="px-1.5 py-0.2 rounded bg-emerald-500/30 text-emerald-200 text-[7px] font-mono font-black shrink-0">
              PIN MODULE
            </span>
          )}
        </div>

        {/* CLICKABLE REAL JPG SCREENSHOT PREVIEW WITH HOVER EFFECT */}
        <div className="w-full h-36 bg-[#080810] border-b border-white/10 overflow-hidden relative cursor-pointer">
          {!imgError ? (
            <Image
              src={data.imgUrl}
              alt={data.title}
              width={400}
              height={200}
              unoptimized
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

          <div className={`absolute bottom-1 right-1 px-1.5 py-0.5 rounded border text-[7px] font-mono font-bold ${isHeaderNav
            ? "bg-purple-950/90 border-purple-400/50 text-purple-300"
            : isFooterNav
              ? "bg-blue-950/90 border-blue-400/50 text-blue-300"
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

      <Handle type="source" position={Position.Bottom} className={`!w-2.5 !h-2.5 ${isHeaderNav
        ? "!bg-purple-400"
        : isFooterNav
          ? "!bg-blue-400"
          : isEmail
            ? "!bg-amber-400"
            : "!bg-cyan-400"
        } !border-0`} />
      <Handle type="source" position={Position.Right} id="right" className="!w-2.5 !h-2.5 !bg-purple-400 !border-0" />
    </div>
  );
}

// --- CUSTOM TREE EDGE (Forces stroke-only 2.5px lines, absolutely zero fill) ---
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
        strokeWidth: 2.5,
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

// --- VIEW 1: FULL SITE ARCHITECTURE (DIRECT VERTICAL FLOW UNDER BOOK US: FORM -> PLANNER PIN VERIFICATION MODULE -> PLANNER SECURITY PIN EMAIL -> ENTER PIN ON BOOKER PAGE -> PLANNER DASHBOARD) ---
const ARCHITECTURE_NODES: Node<SitemapNodeData>[] = [
  // ROOT HOME PAGE
  {
    id: "root",
    type: "sitemapCard",
    position: { x: 1330, y: 30 },
    data: {
      header: "Home Page",
      title: "7th Heaven — Official Band Website",
      path: "/",
      imgUrl: "/sitemap-thumbs/home.jpg",
      badgeType: "HEADER_NAV",
      description: "7th Heaven chart-topping rock experience from Chicago with #1 Billboard hits.",
    },
  },

  // ── ROW 1: HEADER NAV ──
  {
    id: "nav-merch",
    type: "sitemapCard",
    position: { x: 0, y: 360 },
    data: {
      header: "MERCH",
      title: "Official Band Store & Merchandise",
      path: "/merch",
      imgUrl: "/sitemap-thumbs/merch.jpg",
      badgeType: "HEADER_NAV",
      description: "Official band merchandise — tees, hoodies, vinyl records, and stage picks.",
    },
  },
  {
    id: "nav-media",
    type: "sitemapCard",
    position: { x: 380, y: 360 },
    data: {
      header: "MEDIA",
      title: "Photos, Videos & Press Kit",
      path: "/media",
      imgUrl: "/sitemap-thumbs/media.jpg",
      badgeType: "HEADER_NAV",
      description: "Official promotional assets, high-res photos, stage rider, and press kit downloads.",
    },
  },
  {
    id: "nav-fanwall",
    type: "sitemapCard",
    position: { x: 760, y: 360 },
    data: {
      header: "FAN WALL",
      title: "Fan Photo Wall & Concert Uploads",
      path: "/fan-photo-wall",
      imgUrl: "/sitemap-thumbs/fan-photo-wall.jpg",
      badgeType: "HEADER_NAV",
      description: "Live concert photo upload wall, AI face scanning, and fan gallery.",
    },
  },
  {
    id: "nav-live",
    type: "sitemapCard",
    position: { x: 1140, y: 360 },
    data: {
      header: "LIVE STREAM",
      title: "Live Concert Stream & Broadcast",
      path: "/live",
      imgUrl: "/sitemap-thumbs/live.jpg",
      badgeType: "HEADER_NAV",
      description: "LiveKit powered multi-camera live video stream, band audio feeds, and fan chat.",
    },
  },
  {
    id: "nav-cruise",
    type: "sitemapCard",
    position: { x: 1520, y: 360 },
    data: {
      header: "CRUISE 2026",
      title: "Caribbean Rock Cruise 2026",
      path: "/cruise",
      imgUrl: "/sitemap-thumbs/cruise-form-filled.jpg",
      badgeType: "HEADER_NAV",
      description: "2026 Fan Cruise itinerary, cabin options, and reservation signup.",
    },
  },
  {
    id: "nav-book",
    type: "sitemapCard",
    position: { x: 1900, y: 360 },
    data: {
      header: "1. FILL BOOKING FORM",
      title: "1. Fill Event Details & Email",
      path: "/book",
      imgUrl: "/sitemap-thumbs/book.jpg",
      badgeType: "HEADER_NAV",
      description: "Planner fills event date, venue, times, budget, and inputs contact email address.",
    },
  },
  {
    id: "nav-contact",
    type: "sitemapCard",
    position: { x: 2280, y: 360 },
    data: {
      header: "CONTACT",
      title: "Contact Management & Inquiries",
      path: "/contact",
      imgUrl: "/sitemap-thumbs/contact.jpg",
      badgeType: "HEADER_NAV",
      description: "Direct contact inquiry form for booking agents and event organizers.",
    },
  },

  // ── ROW 2: DIRECT VERTICAL CHILD OF BOOK US FORM (PLANNER PIN VERIFICATION MODULE OPENS ON SCREEN) ──
  {
    id: "node-book-pin-module",
    type: "sitemapCard",
    position: { x: 1900, y: 700 },
    data: {
      header: "2. PLANNER PIN VERIFICATION MODULE",
      title: "2. Planner PIN Verification Module",
      path: "/book",
      imgUrl: "/sitemap-screenshots/planner-pin-filled-v3.png",
      badgeType: "MODULE",
      description: "Submitting form opens Planner PIN Verification Module asking for 6-digit PIN.",
    },
  },
  {
    id: "footer-shows",
    type: "sitemapCard",
    position: { x: 0, y: 700 },
    data: {
      header: "PAST SHOWS ARCHIVE",
      title: "1,200+ Performance Archive",
      path: "/shows/past",
      imgUrl: "/sitemap-thumbs/shows.jpg",
      badgeType: "FOOTER_NAV",
      description: "Footer link to past concert dates, venue search, and setlist archives.",
    },
  },
  {
    id: "footer-faq",
    type: "sitemapCard",
    position: { x: 380, y: 700 },
    data: {
      header: "FAQ & HELP",
      title: "Frequently Asked Questions",
      path: "/faq",
      imgUrl: "/sitemap-thumbs/faq.jpg",
      badgeType: "FOOTER_NAV",
      description: "Footer link to show tickets, venue entry, and booking answers.",
    },
  },
  {
    id: "node-fan-signup-module",
    type: "sitemapCard",
    position: { x: 760, y: 700 },
    data: {
      header: "SIGN UP FAN MODULE",
      title: "Fan Account Signup & Security PIN",
      path: "/fans",
      imgUrl: "/sitemap-thumbs/signup-modal.jpg",
      badgeType: "MODULE",
      description: "Fan sign up modal, account registration form, and 6-digit security PIN verification step.",
    },
  },
  {
    id: "footer-terms",
    type: "sitemapCard",
    position: { x: 1140, y: 700 },
    data: {
      header: "TERMS OF SERVICE",
      title: "Terms & Conditions",
      path: "/terms",
      imgUrl: "/sitemap-thumbs/privacy.jpg",
      badgeType: "FOOTER_NAV",
      description: "Footer legal terms of service, ticket policies, and user agreements.",
    },
  },

  // ── ROW 3: PLANNER SECURITY PIN EMAIL DISPATCHED TO INBOX (y = 1040) ──
  {
    id: "email-book-pin-email",
    type: "sitemapCard",
    position: { x: 1900, y: 1040 },
    data: {
      header: "3. ✉ PLANNER SECURITY PIN EMAIL",
      title: "3. Email Dispatched with PIN 582901",
      path: "/api/dev/email-preview?id=auth_pin",
      imgUrl: "/sitemap-thumbs/email-pin-verification.jpg",
      badgeType: "EMAIL",
      description: "Planner receives automated Resend email containing the 6-digit security PIN 582901.",
    },
  },
  {
    id: "node-fans",
    type: "sitemapCard",
    position: { x: 0, y: 1040 },
    data: {
      header: "Fan Club Hub",
      title: "Fan Club VIP Member Portal",
      path: "/fans",
      imgUrl: "/sitemap-thumbs/fan-dashboard.jpg",
      badgeType: "PORTAL",
      description: "VIP fan dashboard, referral badges, and exclusive member perks.",
    },
  },
  {
    id: "node-picks",
    type: "sitemapCard",
    position: { x: 380, y: 1040 },
    data: {
      header: "Pick Collector",
      title: "Guitar Pick Lottery Game",
      path: "/picks",
      imgUrl: "/sitemap-thumbs/picks.jpg",
      badgeType: "PORTAL",
      description: "Interactive guitar pick collector game and concert raffle entry.",
    },
  },
  {
    id: "node-fan-pin-verification",
    type: "sitemapCard",
    position: { x: 760, y: 1040 },
    data: {
      header: "FAN PIN VERIFICATION MODULE",
      title: "Fan 6-Digit PIN Security Module",
      path: "/fans",
      imgUrl: "/sitemap-thumbs/signup-modal.jpg",
      badgeType: "MODULE",
      description: "Fan receives 6-digit security PIN email and enters code into the Fan PIN Verification Module to activate account.",
    },
  },
  {
    id: "node-crew",
    type: "sitemapCard",
    position: { x: 1140, y: 1040 },
    data: {
      header: "Crew HQ",
      title: "Road Crew & Staff Portal",
      path: "/crew",
      imgUrl: "/sitemap-thumbs/crew-dashboard.jpg",
      badgeType: "PORTAL",
      description: "Tour staff schedule, stage setup checklists, and shift alerts.",
    },
  },
  {
    id: "node-admin",
    type: "sitemapCard",
    position: { x: 1520, y: 1040 },
    data: {
      header: "Master Admin",
      title: "Admin Command Center",
      path: "/admin",
      imgUrl: "/sitemap-thumbs/admin.jpg",
      badgeType: "PORTAL",
      description: "Master admin dashboard, concert manager, financial reports, and broadcast center.",
    },
  },

  // ── ROW 4: ENTER PIN 582901 INTO VERIFICATION MODULE ON BOOKER PAGE (y = 1380) ──
  {
    id: "node-book-verify-pin",
    type: "sitemapCard",
    position: { x: 1900, y: 1380 },
    data: {
      header: "4. PLANNER PIN VERIFICATION MODULE",
      title: "4. Enter PIN into Module on Booker Page",
      path: "/book",
      imgUrl: "/sitemap-screenshots/planner-pin-filled-v3.png",
      badgeType: "MODULE",
      description: "Planner inputs 6-digit PIN [5][8][2][9][0][1] into the Planner PIN Verification Module on the booker page to complete verification.",
    },
  },
  // ── CRUISE VERTICAL FLOW: STEP 2 — CRUISE MEMBER SIGNUP MODULE (y = 700) ──
  {
    id: "node-cruise-pin-module",
    type: "sitemapCard",
    position: { x: 1520, y: 700 },
    data: {
      header: "CRUISE MEMBER SIGNUP MODULE",
      title: "Cruise Account Signup & Registration",
      path: "/cruise",
      imgUrl: "/sitemap-thumbs/signup-modal.jpg",
      badgeType: "MODULE",
      description: "Select CRUISE account type in the Sign Up module, enter email and password to register as a Cruise 2026 member.",
    },
  },
  // ── CRUISE VERTICAL FLOW: STEP 3 — CRUISE PIN VERIFICATION MODULE (y = 1040) ──
  {
    id: "email-cruise-pin-email",
    type: "sitemapCard",
    position: { x: 1520, y: 1040 },
    data: {
      header: "CRUISE PIN VERIFICATION MODULE",
      title: "Cruise PIN Verification Module",
      path: "/cruise",
      imgUrl: "/sitemap-thumbs/cruise-verify.jpg",
      badgeType: "MODULE",
      description: "Submitting cruise signup opens the PIN Verification Module asking for 6-digit security PIN to verify identity.",
    },
  },
  // ── CRUISE VERTICAL FLOW: STEP 4 — ✉ CRUISE SECURITY PIN EMAIL (y = 1380) ──
  {
    id: "node-cruise-verify-pin-filled",
    type: "sitemapCard",
    position: { x: 1520, y: 1380 },
    data: {
      header: "✉ CRUISE SECURITY PIN EMAIL",
      title: "Email Dispatched with PIN 582901",
      path: "/api/dev/email-preview?id=auth_pin",
      imgUrl: "/sitemap-thumbs/email-pin-verification.jpg",
      badgeType: "EMAIL",
      description: "Automated Resend email sent to cruise registrant containing the 6-digit security PIN 582901.",
    },
  },
  // ── CRUISE VERTICAL FLOW: STEP 5 — CRUISE PIN VERIFICATION MODULE (PIN FILLED IN) (y = 1720) ──
  {
    id: "node-cruise-pin-filled",
    type: "sitemapCard",
    position: { x: 1520, y: 1720 },
    data: {
      header: "CRUISE PIN VERIFICATION MODULE",
      title: "Enter PIN into Module on Cruise Page",
      path: "/cruise",
      imgUrl: "/sitemap-screenshots/cruise-pin-verify-v2.png",
      badgeType: "MODULE",
      description: "Registrant inputs 6-digit PIN [5][8][2][9][0][1] into the Cruise PIN Verification Module to complete reservation.",
    },
  },
  // ── CRUISE VERTICAL FLOW: STEP 6 — CRUISE MEMBER DASHBOARD (y = 2060) ──
  {
    id: "node-cruise-dashboard-unlocked",
    type: "sitemapCard",
    position: { x: 1520, y: 2060 },
    data: {
      header: "CRUISE MEMBER DASHBOARD",
      title: "Access Cruise Member Dashboard",
      path: "/cruise/dashboard",
      imgUrl: "/sitemap-screenshots/cruise-dashboard.png",
      badgeType: "PORTAL",
      description: "Cruise member accesses their Cruise Hub with embarkation countdown, passenger lounge chat, travel checklist, itinerary, and booking manager.",
    },
  },
  {
    id: "email-merch-pickup",
    type: "sitemapCard",
    position: { x: 0, y: 1380 },
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
    position: { x: 1140, y: 1380 },
    data: {
      header: "✉ Tour Announcement",
      title: "Newsletter Broadcast Email",
      path: "/admin/emails",
      imgUrl: "/sitemap-thumbs/email-newsletter-blast.jpg",
      badgeType: "EMAIL",
      description: "Dispatched from Admin Newsletter Studio to subscribed fan members.",
    },
  },
  {
    id: "email-fan-pin-security",
    type: "sitemapCard",
    position: { x: 760, y: 1380 },
    data: {
      header: "✉ FAN SECURITY PIN EMAIL",
      title: "Email Dispatched with PIN 582901",
      path: "/api/dev/email-preview?id=auth_pin",
      imgUrl: "/sitemap-thumbs/email-pin-verification.jpg",
      badgeType: "EMAIL",
      description: "Automated Resend email sent to fan containing the 6-digit security PIN 582901 to complete verification.",
    },
  },
  {
    id: "node-fan-verify-pin-filled",
    type: "sitemapCard",
    position: { x: 760, y: 1720 },
    data: {
      header: "FAN PIN VERIFICATION MODULE",
      title: "Enter PIN into Module on Fan Page",
      path: "/fans",
      imgUrl: "/sitemap-screenshots/planner-pin-filled-v3.png",
      badgeType: "MODULE",
      description: "Fan inputs 6-digit PIN [5][8][2][9][0][1] into the Fan PIN Verification Module on the fan page to complete verification.",
    },
  },
  {
    id: "node-fan-dashboard-unlocked",
    type: "sitemapCard",
    position: { x: 760, y: 2060 },
    data: {
      header: "FAN DASHBOARD",
      title: "Access Fan Account Dashboard",
      path: "/fans",
      imgUrl: "/sitemap-screenshots/fan-dashboard.png",
      badgeType: "PORTAL",
      description: "Fan successfully verifies PIN security code and accesses their personalized Member Hub, backstage passes, and fan photo wall.",
    },
  },

  // ── ROW 5: PLANNER DASHBOARD UNLOCKED (y = 1720) ──
  {
    id: "node-planner-unlocked",
    type: "sitemapCard",
    position: { x: 1900, y: 1720 },
    data: {
      header: "5. PLANNER DASHBOARD",
      title: "5. Access Planner Dashboard",
      path: "/planner",
      imgUrl: "/sitemap-screenshots/planner-dashboard-v3.png",
      badgeType: "PORTAL",
      description: "Planner successfully accesses their Planner Dashboard to manage event details, schedule, and contract.",
    },
  },
];

// --- VERTICAL FLOW CONNECTIONS DIRECTLY UNDER BOOK US ---
const ARCHITECTURE_EDGES: Edge[] = [
  { id: "e-root-merch", source: "root", target: "nav-merch", type: "smoothstep" },
  { id: "e-root-media", source: "root", target: "nav-media", type: "smoothstep" },
  { id: "e-root-fanwall", source: "root", target: "nav-fanwall", type: "smoothstep" },
  { id: "e-root-live", source: "root", target: "nav-live", type: "smoothstep" },
  { id: "e-root-cruise", source: "root", target: "nav-cruise", type: "smoothstep" },
  { id: "e-root-book", source: "root", target: "nav-book", type: "smoothstep" },
  { id: "e-root-contact", source: "root", target: "nav-contact", type: "smoothstep" },
  { id: "e-root-footer-shows", source: "root", target: "footer-shows", type: "smoothstep" },
  { id: "e-root-footer-faq", source: "root", target: "footer-faq", type: "smoothstep" },
  { id: "e-root-footer-privacy", source: "root", target: "footer-privacy", type: "smoothstep" },
  { id: "e-root-footer-terms", source: "root", target: "footer-terms", type: "smoothstep" },

  // DIRECT VERTICAL FLOW: FORM -> PLANNER PIN VERIFICATION MODULE -> PLANNER SECURITY PIN EMAIL -> ENTER PIN INTO MODULE ON BOOKER PAGE -> PLANNER DASHBOARD
  { id: "flow-book-to-modal-open", source: "nav-book", target: "node-book-pin-module", type: "smoothstep", animated: true },
  { id: "flow-modal-to-pin-email", source: "node-book-pin-module", target: "email-book-pin-email", type: "smoothstep", animated: true },
  { id: "flow-pin-email-to-verify-module", source: "email-book-pin-email", target: "node-book-verify-pin", type: "smoothstep", animated: true },
  { id: "flow-verify-module-to-dashboard", source: "node-book-verify-pin", target: "node-planner-unlocked", type: "smoothstep", animated: true },

  // Other section connections
  { id: "e-fanwall-signup", source: "nav-fanwall", target: "node-fan-signup-module", type: "smoothstep", animated: true },
  { id: "flow-fan-signup-to-pin-module", source: "node-fan-signup-module", target: "node-fan-pin-verification", type: "smoothstep", animated: true },
  { id: "flow-pin-module-to-security-email", source: "node-fan-pin-verification", target: "email-fan-pin-security", type: "smoothstep", animated: true },
  { id: "flow-security-email-to-filled-module", source: "email-fan-pin-security", target: "node-fan-verify-pin-filled", type: "smoothstep", animated: true },
  { id: "flow-filled-module-to-fan-dashboard", source: "node-fan-verify-pin-filled", target: "node-fan-dashboard-unlocked", type: "smoothstep", animated: true },
  { id: "e-fanwall-picks", source: "nav-fanwall", target: "node-picks", type: "smoothstep" },
  { id: "e-live-admin", source: "nav-live", target: "node-admin", type: "smoothstep" },
  // CRUISE VERTICAL FLOW: CRUISE 2026 -> SIGNUP -> PIN MODULE -> PIN EMAIL -> PIN FILLED -> CRUISE DASHBOARD
  { id: "flow-cruise-to-pin-module", source: "nav-cruise", target: "node-cruise-pin-module", type: "smoothstep", animated: true },
  { id: "flow-cruise-pin-to-email", source: "node-cruise-pin-module", target: "email-cruise-pin-email", type: "smoothstep", animated: true },
  { id: "flow-cruise-email-to-filled", source: "email-cruise-pin-email", target: "node-cruise-verify-pin-filled", type: "smoothstep", animated: true },
  { id: "flow-cruise-filled-to-pin-filled", source: "node-cruise-verify-pin-filled", target: "node-cruise-pin-filled", type: "smoothstep", animated: true },
  { id: "flow-cruise-pin-filled-to-dashboard", source: "node-cruise-pin-filled", target: "node-cruise-dashboard-unlocked", type: "smoothstep", animated: true },
  { id: "flow-merch-pickup", source: "nav-merch", target: "email-merch-pickup", type: "smoothstep" },
  { id: "flow-admin-blast", source: "node-admin", target: "email-newsletter-blast", type: "smoothstep" },
  { id: "flow-admin-alert", source: "node-admin", target: "email-booking-admin", type: "smoothstep" },
];

// --- VIEW 2: STEP-BY-STEP HORIZONTAL FLOW (FORM -> PLANNER PIN VERIFICATION MODULE -> PLANNER SECURITY PIN EMAIL -> PLANNER PIN VERIFICATION MODULE (ENTER PIN) -> PLANNER DASHBOARD) ---
const BOOKING_FLOW_NODES: Node<SitemapNodeData>[] = [
  {
    id: "bf-step1",
    type: "sitemapCard",
    position: { x: 0, y: 150 },
    data: {
      header: "1. FILL BOOKING FORM",
      title: "1. Fill Event Details & Email",
      path: "/book",
      imgUrl: "/sitemap-thumbs/book.jpg",
      badgeType: "HEADER_NAV",
      description: "Planner fills event date, venue type, times, budget, and inputs planner email address.",
    },
  },
  {
    id: "bf-step2",
    type: "sitemapCard",
    position: { x: 380, y: 150 },
    data: {
      header: "2. PLANNER PIN VERIFICATION MODULE",
      title: "2. Planner PIN Verification Module",
      path: "/book",
      imgUrl: "/sitemap-screenshots/planner-pin-filled-v3.png",
      badgeType: "MODULE",
      description: "Planner inputs 6-digit security PIN into the Planner PIN Verification Module to confirm identity and lock in booking.",
    },
  },
  {
    id: "bf-step3",
    type: "sitemapCard",
    position: { x: 760, y: 150 },
    data: {
      header: "3. ✉ PLANNER SECURITY PIN EMAIL",
      title: "3. Email Dispatched with PIN 582901",
      path: "/api/dev/email-preview?id=auth_pin",
      imgUrl: "/sitemap-thumbs/email-pin-verification.jpg",
      badgeType: "EMAIL",
      description: "Planner receives automated Resend email containing the 6-digit security PIN 582901.",
    },
  },
  {
    id: "bf-step4",
    type: "sitemapCard",
    position: { x: 1140, y: 150 },
    data: {
      header: "4. PLANNER PIN VERIFICATION MODULE",
      title: "4. Enter PIN into Module on Booker Page",
      path: "/book",
      imgUrl: "/sitemap-screenshots/planner-pin-filled-v3.png",
      badgeType: "MODULE",
      description: "Planner inputs 6-digit PIN [5][8][2][9][0][1] into the Planner PIN Verification Module on the booker page to complete verification.",
    },
  },
  {
    id: "bf-step5",
    type: "sitemapCard",
    position: { x: 1520, y: 150 },
    data: {
      header: "5. PLANNER DASHBOARD",
      title: "5. Access Planner Dashboard",
      path: "/planner",
      imgUrl: "/sitemap-screenshots/planner-dashboard-v3.png",
      badgeType: "PORTAL",
      description: "Planner accesses their Planner Dashboard to manage event details, schedule, and contract.",
    },
  },
];

const BOOKING_FLOW_EDGES: Edge[] = [
  { id: "bf-e1", source: "bf-step1", sourceHandle: "right", target: "bf-step2", targetHandle: "left", animated: true, type: "smoothstep" },
  { id: "bf-e2", source: "bf-step2", sourceHandle: "right", target: "bf-step3", targetHandle: "left", animated: true, type: "smoothstep" },
  { id: "bf-e3", source: "bf-step3", sourceHandle: "right", target: "bf-step4", targetHandle: "left", animated: true, type: "smoothstep" },
  { id: "bf-e4", source: "bf-step4", sourceHandle: "right", target: "bf-step5", targetHandle: "left", animated: true, type: "smoothstep" },
];

// --- VIEW 3: STEP-BY-STEP CRUISE RESERVATION FLOW ---
const CRUISE_FLOW_NODES: Node<SitemapNodeData>[] = [
  {
    id: "cf-step1",
    type: "sitemapCard",
    position: { x: 0, y: 150 },
    data: {
      header: "STEP 1 · CRUISE SIGNUP FORM",
      title: "1. Fill Cabin Registration",
      path: "/cruise",
      imgUrl: "/sitemap-thumbs/cruise-form-filled.jpg",
      badgeType: "HEADER_NAV",
      description: "Fan selects cabin option (Balcony, Oceanview, Suite), guest count, and inputs contact info.",
    },
  },
  {
    id: "cf-step2",
    type: "sitemapCard",
    position: { x: 380, y: 150 },
    data: {
      header: "STEP 2 · PLANNER PIN VERIFICATION MODULE",
      title: "2. Planner PIN Verification Module",
      path: "/cruise",
      imgUrl: "/sitemap-thumbs/planner-pin-modal.jpg",
      badgeType: "MODULE",
      description: "Fan enters 6-digit PIN into the Planner PIN Verification Module to reserve cabin on 2026 Cruise.",
    },
  },
  {
    id: "cf-step3",
    type: "sitemapCard",
    position: { x: 760, y: 150 },
    data: {
      header: "STEP 3 · ✉ CRUISE PIN EMAIL",
      title: "3. Email Dispatched with PIN 582901",
      path: "/api/dev/email-preview?id=auth_pin",
      imgUrl: "/sitemap-thumbs/email-pin-verification.jpg",
      badgeType: "EMAIL",
      description: "Fan receives automated email with 6-digit security PIN 582901 to confirm email ownership.",
    },
  },
  {
    id: "cf-step4",
    type: "sitemapCard",
    position: { x: 1140, y: 150 },
    data: {
      header: "STEP 4 · CABIN CONFIRMATION EMAIL",
      title: "4. Official Cruise Confirmation",
      path: "/cruise",
      imgUrl: "/sitemap-thumbs/email-cruise-confirm.jpg",
      badgeType: "EMAIL",
      description: "Fan receives official cabin reservation confirmation & cruise itinerary email.",
    },
  },
];

const CRUISE_FLOW_EDGES: Edge[] = [
  { id: "cf-e1", source: "cf-step1", sourceHandle: "right", target: "cf-step2", targetHandle: "left", animated: true, type: "smoothstep" },
  { id: "cf-e2", source: "cf-step2", sourceHandle: "right", target: "cf-step3", targetHandle: "left", animated: true, type: "smoothstep" },
  { id: "cf-e3", source: "cf-step3", sourceHandle: "right", target: "cf-step4", targetHandle: "left", animated: true, type: "smoothstep" },
];

// --- VIEW 4: STEP-BY-STEP FAN SIGNUP FLOW ---
const FAN_SIGNUP_FLOW_NODES: Node<SitemapNodeData>[] = [
  {
    id: "fs-step1",
    type: "sitemapCard",
    position: { x: 0, y: 150 },
    data: {
      header: "STEP 1 · FAN ACCOUNT SIGNUP",
      title: "1. Fan Account Registration Form",
      path: "/fans",
      imgUrl: "/sitemap-thumbs/signup-modal.jpg",
      badgeType: "HEADER_NAV",
      description: "Fan opens Sign Up modal or /fans portal and inputs display name, email, password, and preferences.",
    },
  },
  {
    id: "fs-step2",
    type: "sitemapCard",
    position: { x: 380, y: 150 },
    data: {
      header: "STEP 2 · ✉ FAN SECURITY PIN EMAIL",
      title: "2. Email Dispatched with PIN 582901",
      path: "/api/dev/email-preview?id=auth_pin",
      imgUrl: "/sitemap-thumbs/email-welcome-fan.jpg",
      badgeType: "EMAIL",
      description: "Fan receives automated email containing 6-digit security PIN 582901 to verify email ownership.",
    },
  },
  {
    id: "fs-step3",
    type: "sitemapCard",
    position: { x: 760, y: 150 },
    data: {
      header: "STEP 3 · FAN PIN VERIFICATION MODULE",
      title: "3. Enter PIN Into Verification Module",
      path: "/fans",
      imgUrl: "/sitemap-thumbs/pin-filled-modal.jpg",
      badgeType: "MODULE",
      description: "Fan enters 6-digit PIN [5][8][2][9][0][1] into PIN Verification Module to confirm account.",
    },
  },
  {
    id: "fs-step4",
    type: "sitemapCard",
    position: { x: 1140, y: 150 },
    data: {
      header: "STEP 4 · COMPLETE PROFILE ONBOARDING",
      title: "4. Profile Setup & Favorites",
      path: "/fans/complete-profile",
      imgUrl: "/sitemap-thumbs/fan-dashboard.jpg",
      badgeType: "PORTAL",
      description: "Fan selects favorite 7th Heaven songs, uploads avatar, and completes onboarding profile.",
    },
  },
  {
    id: "fs-step5",
    type: "sitemapCard",
    position: { x: 1520, y: 150 },
    data: {
      header: "STEP 5 · MEMBER HUB & FAN WALL",
      title: "5. Member Dashboard & Rewards",
      path: "/fans",
      imgUrl: "/sitemap-screenshots/fan-dashboard.png",
      badgeType: "PORTAL",
      description: "Fan accesses personal Member Hub to view backstage passes, post to Fan Photo Wall, and enter Guitar Pick Lottery.",
    },
  },
];

const FAN_SIGNUP_FLOW_EDGES: Edge[] = [
  { id: "fs-e1", source: "fs-step1", sourceHandle: "right", target: "fs-step2", targetHandle: "left", animated: true, type: "smoothstep" },
  { id: "fs-e2", source: "fs-step2", sourceHandle: "right", target: "fs-step3", targetHandle: "left", animated: true, type: "smoothstep" },
  { id: "fs-e3", source: "fs-step3", sourceHandle: "right", target: "fs-step4", targetHandle: "left", animated: true, type: "smoothstep" },
  { id: "fs-e4", source: "fs-step4", sourceHandle: "right", target: "fs-step5", targetHandle: "left", animated: true, type: "smoothstep" },
];

export default function VisualSitemapClient() {
  const [activeTab, setActiveTab] = useState<"ARCH" | "BOOKING" | "CRUISE" | "FAN_SIGNUP">("ARCH");

  const nodes =
    activeTab === "BOOKING"
      ? BOOKING_FLOW_NODES
      : activeTab === "CRUISE"
        ? CRUISE_FLOW_NODES
        : activeTab === "FAN_SIGNUP"
          ? FAN_SIGNUP_FLOW_NODES
          : ARCHITECTURE_NODES;

  const edges =
    activeTab === "BOOKING"
      ? BOOKING_FLOW_EDGES
      : activeTab === "CRUISE"
        ? CRUISE_FLOW_EDGES
        : activeTab === "FAN_SIGNUP"
          ? FAN_SIGNUP_FLOW_EDGES
          : ARCHITECTURE_EDGES;

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-20 pb-12">

      {/* Global CSS override to force fill: none on all SVG edge paths */}
      <style jsx global>{`
        .react-flow__edge-path,
        .react-flow__edge path,
        .react-flow svg path {
          fill: none !important;
          stroke: #a855f7 !important;
          stroke-width: 2.5px !important;
        }
      `}</style>

      {/* Header bar with View Selector Tabs */}
      <div className="max-w-[1700px] mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4 border border-purple-500/30 bg-[#0c0c14] mb-4 shadow-2xl rounded-lg  backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-black text-sm shadow-md">
            7H
          </div>
          <div>
            <h1 className="font-extrabold text-base text-white tracking-wider uppercase">
              {activeTab === "ARCH"
                ? "7th Heaven Site Directory & Direct Vertical Booking PIN Flow"
                : activeTab === "BOOKING"
                  ? "Event Booking & PIN Step-by-Step Horizontal Flow"
                  : activeTab === "CRUISE"
                    ? "Cruise Reservation & Security PIN Flow"
                    : "Fan Account Signup & PIN Verification Flow"}
            </h1>
            <p className="text-xs text-white/50">
              {activeTab === "ARCH"
                ? "Direct Vertical Flow under Book Us: Form ➔ Planner PIN Verification Module ➔ Planner Security PIN Email ➔ Enter PIN ➔ Planner Dashboard"
                : activeTab === "BOOKING"
                  ? "Step-by-step user journey: Form Fill ➔ Planner PIN Verification Module ➔ Planner Security PIN Email ➔ Enter PIN ➔ Planner Dashboard"
                  : activeTab === "CRUISE"
                    ? "Step-by-step user journey: Cabin Request ➔ Planner PIN Verification Module ➔ Cruise PIN Email ➔ Cruise Confirmation Email"
                    : "Step-by-step user journey: Fan Signup ➔ Fan PIN Email ➔ Enter PIN ➔ Complete Profile ➔ Member Dashboard"}
            </p>
          </div>
        </div>

        {/* VIEW SELECTOR TABS */}
        <div className="flex items-center gap-2 bg-black/60 p-1.5 rounded-xl border border-white/10">
          <button
            onClick={() => setActiveTab("ARCH")}
            className={`px-3.5 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all ${activeTab === "ARCH"
              ? "bg-purple-600 text-white shadow-lg border border-purple-400/50"
              : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
          >
            <Layers className="w-3.5 h-3.5 text-purple-300" />
            <span>Full Architecture</span>
          </button>

          <button
            onClick={() => setActiveTab("BOOKING")}
            className={`px-3.5 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all ${activeTab === "BOOKING"
              ? "bg-purple-600 text-white shadow-lg border border-purple-400/50"
              : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
          >
            <Calendar className="w-3.5 h-3.5 text-cyan-300" />
            <span>Booking Flow</span>
          </button>

          <button
            onClick={() => setActiveTab("CRUISE")}
            className={`px-3.5 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all ${activeTab === "CRUISE"
              ? "bg-purple-600 text-white shadow-lg border border-purple-400/50"
              : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
          >
            <Ship className="w-3.5 h-3.5 text-amber-300" />
            <span>Cruise Flow</span>
          </button>

          <button
            onClick={() => setActiveTab("FAN_SIGNUP")}
            className={`px-3.5 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all ${activeTab === "FAN_SIGNUP"
              ? "bg-purple-600 text-white shadow-lg border border-purple-400/50"
              : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
          >
            <UserPlus className="w-3.5 h-3.5 text-pink-300" />
            <span>Fan Signup Flow</span>
          </button>

          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg border border-white/15 bg-white/5 text-white font-bold text-xs hover:bg-white/10 transition flex items-center gap-1 ml-1"
          >
            <span>XML</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Interactive Flow Canvas */}
      <div className="max-w-[1700px] mx-auto h-[950px] rounded-lg  border border-purple-500/30 bg-[#09090f] overflow-hidden shadow-2xl relative">
        <ReactFlow
          key={activeTab}
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.12 }}
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
