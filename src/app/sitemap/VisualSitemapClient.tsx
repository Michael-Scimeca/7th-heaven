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


// --- COMPACT SITEMAP CARD NODE (page cards vs. small secondary email/PIN chips) ---
const ACCENT: Record<string, { text: string; bar: string; chip: string; ring: string }> = {
  HEADER_NAV: { text: "text-violet-300", bar: "bg-violet-500", chip: "bg-violet-500/15 text-violet-300", ring: "hover:border-violet-400/60" },
  FOOTER_NAV: { text: "text-sky-300", bar: "bg-sky-500", chip: "bg-sky-500/15 text-sky-300", ring: "hover:border-sky-400/60" },
  PORTAL: { text: "text-teal-300", bar: "bg-teal-500", chip: "bg-teal-500/15 text-teal-300", ring: "hover:border-teal-400/60" },
  MODULE: { text: "text-emerald-300", bar: "bg-emerald-500", chip: "bg-emerald-500/15 text-emerald-300", ring: "hover:border-emerald-400/60" },
  EMAIL: { text: "text-amber-300", bar: "bg-amber-500", chip: "bg-amber-500/15 text-amber-300", ring: "hover:border-amber-400/60" },
};

const BADGE_LABEL: Record<string, string> = {
  HEADER_NAV: "NAV",
  FOOTER_NAV: "NAV",
  PORTAL: "PAGE",
  MODULE: "PIN",
  EMAIL: "MAIL",
};

function SitemapCardNode({ data }: NodeProps<Node<SitemapNodeData>>) {
  const [imgError, setImgError] = useState(false);
  const targetPath = data.path || "/";
  const isSmall = data.badgeType === "EMAIL" || data.badgeType === "MODULE";
  const accent = ACCENT[data.badgeType || "PORTAL"];

  return (
    <div
      title={data.description || data.title}
      className={`${isSmall ? "w-[190px]" : "w-60"} rounded-lg border  border-white/10  bg-[#0d0d14] overflow-hidden select-none transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/40 ${accent.ring} group`}
    >
      <Handle type="target" position={Position.Top} className={`!w-2 !h-2 ${accent.bar} !border-0`} />

      <Link href={targetPath} className="block cursor-pointer">
        <div className={`h-1 w-full ${accent.bar}`} />

        <div className="flex items-center justify-between gap-1 px-2 py-1">
          <span className={`font-bold ${isSmall ? "text-[10px]" : " text-[12px] "} tracking-wide uppercase truncate ${accent.text}`}>
            {data.header}
          </span>
          <span className={`shrink-0 px-1 py-[1px] rounded text-[7px]    font-bold ${accent.chip}`}>
            {BADGE_LABEL[data.badgeType || "PORTAL"]}
          </span>
        </div>

        <div className={`w-full ${isSmall ? "h-14" : "h-24"} bg-[#08080d] border-y  border-white/10  overflow-hidden relative`}>
          {!imgError ? (
            <Image
              src={data.imgUrl}
              alt={data.title}
              width={300}
              height={160}
              unoptimized
              onError={() => setImgError(true)}
              className="w-full h-full object-cover object-top opacity-90 group-hover:opacity-100 transition-opacity duration-150 block"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/20 text-[12px]   ">
              {targetPath}
            </div>
          )}
        </div>

        <div className="px-2 py-1.5">
          <p className={`font-semibold ${isSmall ? " text-[12px] " : "text-[10.5px]"} text-white/85 group-hover:text-white leading-tight truncate`}>
            {data.title}
          </p>
        </div>
      </Link>

      <Handle type="source" position={Position.Bottom} className={`!w-2 !h-2 ${accent.bar} !border-0`} />
    </div>
  );
}

// --- CUSTOM TREE EDGE (calm, uniform slate connector lines — no neon, no animation by default) ---
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
    borderRadius: 10,
  });

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      markerEnd={markerEnd}
      style={{
        ...style,
        fill: "none",
        stroke: "#52525b",
        strokeWidth: 1.5,
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
  {
    id: "root",
    type: "sitemapCard",
    position: { x: 7355, y: 0 },
    data: {
      header: "Home Page",
      title: "7th Heaven — Official Band Website",
      path: "/",
      imgUrl: "/sitemap-thumbs/home.jpg",
      badgeType: "HEADER_NAV",
      description: "7th Heaven chart-topping rock experience from Chicago with #1 Billboard hits.",
    },
  },
  {
    id: "nav-merch",
    type: "sitemapCard",
    position: { x: 106, y: 230 },
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
    position: { x: 522, y: 230 },
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
    position: { x: 951, y: 230 },
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
    position: { x: 5674, y: 230 },
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
    position: { x: 9443, y: 230 },
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
    position: { x: 11171, y: 230 },
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
    position: { x: 11820, y: 230 },
    data: {
      header: "CONTACT",
      title: "Contact Management & Inquiries",
      path: "/contact",
      imgUrl: "/sitemap-thumbs/contact.jpg",
      badgeType: "HEADER_NAV",
      description: "Direct contact inquiry form for booking agents and event organizers.",
    },
  },
  {
    id: "node-book-pin-module",
    type: "sitemapCard",
    position: { x: 10807, y: 460 },
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
    position: { x: 12106, y: 230 },
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
    position: { x: 12392, y: 230 },
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
    position: { x: 833, y: 690 },
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
    id: "email-book-pin-email",
    type: "sitemapCard",
    position: { x: 10807, y: 690 },
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
    position: { x: 808, y: 460 },
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
    position: { x: 1094, y: 460 },
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
    position: { x: 833, y: 920 },
    data: {
      header: "FAN PIN VERIFICATION MODULE",
      title: "Fan 6-Digit PIN Security Module",
      path: "/fans",
      imgUrl: "/sitemap-thumbs/fan-pin-verification.png",
      badgeType: "MODULE",
      description: "Fan receives 6-digit security PIN email and enters code into the Fan PIN Verification Module to activate account.",
    },
  },
  {
    id: "node-live-michael",
    type: "sitemapCard",
    position: { x: 7544, y: 460 },
    data: {
      header: "FAN LIVE STREAM ROOM",
      title: "Fan Live Stream & Chat Room",
      path: "/live/michael",
      imgUrl: "/sitemap-thumbs/live-michael-dark.png",
      badgeType: "PORTAL",
      description: "What the FAN sees: Interactive live video feed with real-time fan chat box, setlist voting, hype meter, and reaction emojis (/live/michael).",
    },
  },
  {
    id: "node-live-push-modal",
    type: "sitemapCard",
    position: { x: 7569, y: 690 },
    data: {
      header: "🔔 LIVE ALERTS MASTER FORM",
      title: "Name, Email & SquishyToggle Form",
      path: "/live",
      imgUrl: "/sitemap-thumbs/signup-modal.jpg",
      badgeType: "MODULE",
      description: "2-input form (Name & Email) with SquishyToggle for Terms of Service. Requests native browser push permission and triggers Double Opt-In verification email.",
    },
  },
  {
    id: "email-live-subscribed",
    type: "sitemapCard",
    position: { x: 7569, y: 920 },
    data: {
      header: "✉ DOUBLE OPT-IN VERIFICATION EMAIL",
      title: "Confirm Live Stream Alerts Subscription",
      path: "/api/ntfy/subscribe",
      imgUrl: "/sitemap-thumbs/email-welcome-fan.jpg",
      badgeType: "EMAIL",
      description: "Automated Resend email containing CONFIRM MY SUBSCRIPTION button to verify email ownership and prevent unauthorized signups.",
    },
  },
  {
    id: "email-live-unsubscribed",
    type: "sitemapCard",
    position: { x: 7569, y: 1150 },
    data: {
      header: "✉ ACTIVE ALERTS & UNSUBSCRIBE LINK",
      title: "Live Alerts Activated & 1-Click Unsubscribe",
      path: "/api/ntfy/verify",
      imgUrl: "/sitemap-thumbs/email-welcome-fan.jpg",
      badgeType: "EMAIL",
      description: "Subscription verified! Fan receives instant alerts whenever 7th Heaven goes live, with legally compliant 1-click unsubscribe link in email footer.",
    },
  },
  {
    id: "node-crew",
    type: "sitemapCard",
    position: { x: 5755, y: 460 },
    data: {
      header: "CREW BROADCAST HUB",
      title: "Crew Member Broadcast & Control Hub",
      path: "/crew",
      imgUrl: "/sitemap-thumbs/crew-dashboard-v2.jpg",
      badgeType: "PORTAL",
      description: "What the CREW MEMBER sees: Go-live camera controls & dashboard-feed switching, live chat moderation, Shopify-powered Flash Merch Drops, Live Event Raffles, real-time sales/viewer analytics, setlist & fan-likes tracking, and their own work schedule (shifts, locations, calendar feed) (/crew).",
    },
  },
  {
    id: "node-admin",
    type: "sitemapCard",
    position: { x: 2660, y: 460 },
    data: {
      header: "Master Admin",
      title: "Admin Command Center",
      path: "/admin",
      imgUrl: "/sitemap-thumbs/admin.jpg",
      badgeType: "PORTAL",
      description: "Master admin dashboard, concert manager, financial reports, and broadcast center.",
    },
  },
  {
    id: "node-book-verify-pin",
    type: "sitemapCard",
    position: { x: 10553, y: 920 },
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
    id: "node-cruise-pin-module",
    type: "sitemapCard",
    position: { x: 9130, y: 460 },
    data: {
      header: "CRUISE MEMBER SIGNUP MODULE",
      title: "Cruise Account Signup & Registration",
      path: "/cruise",
      imgUrl: "/sitemap-thumbs/signup-modal.jpg",
      badgeType: "MODULE",
      description: "Select CRUISE account type in the Sign Up module, enter email and password to register as a Cruise 2026 member.",
    },
  },
  {
    id: "email-cruise-pin-email",
    type: "sitemapCard",
    position: { x: 9130, y: 690 },
    data: {
      header: "CRUISE PIN VERIFICATION MODULE",
      title: "Cruise PIN Verification Module",
      path: "/cruise",
      imgUrl: "/sitemap-thumbs/cruise-verify.jpg",
      badgeType: "MODULE",
      description: "Submitting cruise signup opens the PIN Verification Module asking for 6-digit security PIN to verify identity.",
    },
  },
  {
    id: "node-cruise-verify-pin-filled",
    type: "sitemapCard",
    position: { x: 8999, y: 920 },
    data: {
      header: "✉ CRUISE SECURITY PIN EMAIL",
      title: "Email Dispatched with PIN 582901",
      path: "/api/dev/email-preview?id=auth_pin",
      imgUrl: "/sitemap-thumbs/email-pin-verification.jpg",
      badgeType: "EMAIL",
      description: "Automated Resend email sent to cruise registrant containing the 6-digit security PIN 582901.",
    },
  },
  {
    id: "node-cruise-pin-filled",
    type: "sitemapCard",
    position: { x: 8999, y: 1150 },
    data: {
      header: "CRUISE PIN VERIFICATION MODULE",
      title: "Enter PIN into Module on Cruise Page",
      path: "/cruise",
      imgUrl: "/sitemap-screenshots/cruise-pin-verify-v2.png",
      badgeType: "MODULE",
      description: "Registrant inputs 6-digit PIN [5][8][2][9][0][1] into the Cruise PIN Verification Module to complete reservation.",
    },
  },
  {
    id: "node-cruise-dashboard-unlocked",
    type: "sitemapCard",
    position: { x: 8974, y: 1380 },
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
    position: { x: 0, y: 460 },
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
    id: "email-fan-pin-security",
    type: "sitemapCard",
    position: { x: 833, y: 1150 },
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
    position: { x: 833, y: 1380 },
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
    position: { x: 808, y: 1610 },
    data: {
      header: "FAN DASHBOARD",
      title: "Access Fan Account Dashboard",
      path: "/fans",
      imgUrl: "/sitemap-screenshots/fan-dashboard.png",
      badgeType: "PORTAL",
      description: "Fan successfully verifies PIN security code and accesses their personalized Member Hub, backstage passes, and fan photo wall.",
    },
  },
  {
    id: "node-planner-unlocked",
    type: "sitemapCard",
    position: { x: 10279, y: 1150 },
    data: {
      header: "5. PLANNER DASHBOARD",
      title: "5. Access Planner Dashboard",
      path: "/planner",
      imgUrl: "/sitemap-screenshots/planner-dashboard-v3.png",
      badgeType: "PORTAL",
      description: "Planner successfully accesses their Planner Dashboard to manage event details, schedule, and contract.",
    },
  },
  {
    id: "node-crew-abbie",
    type: "sitemapCard",
    position: { x: 4226, y: 690 },
    data: {
      header: "CREW MEMBER — ABBIE",
      title: "Abbie's Crew Portal",
      path: "/crew-abbie",
      imgUrl: "/sitemap-thumbs/crew.jpg",
      badgeType: "PORTAL",
      description: "Individual crew-member login portal for Abbie — same broadcast/schedule tools as the shared Crew Broadcast Hub, scoped to her account.",
    },
  },
  {
    id: "node-crew-michael2",
    type: "sitemapCard",
    position: { x: 4512, y: 690 },
    data: {
      header: "CREW MEMBER — MICHAEL",
      title: "Michael's Crew Portal",
      path: "/crew-michael",
      imgUrl: "/sitemap-thumbs/crew-dashboard-v2.jpg",
      badgeType: "PORTAL",
      description: "Individual crew-member login portal for Michael (distinct static route from the shared /crew hub).",
    },
  },
  {
    id: "node-crew-ryan",
    type: "sitemapCard",
    position: { x: 4798, y: 690 },
    data: {
      header: "CREW MEMBER — RYAN",
      title: "Ryan's Crew Portal",
      path: "/crew-ryan",
      imgUrl: "/sitemap-thumbs/crew.jpg",
      badgeType: "PORTAL",
      description: "Individual crew-member login portal for Ryan.",
    },
  },
  {
    id: "node-crew-sam",
    type: "sitemapCard",
    position: { x: 5084, y: 690 },
    data: {
      header: "CREW MEMBER — SAM",
      title: "Sam's Crew Portal",
      path: "/crew-sam",
      imgUrl: "/sitemap-thumbs/crew.jpg",
      badgeType: "PORTAL",
      description: "Individual crew-member login portal for Sam.",
    },
  },
  {
    id: "node-crew-tony",
    type: "sitemapCard",
    position: { x: 5370, y: 690 },
    data: {
      header: "CREW MEMBER — TONY",
      title: "Tony's Crew Portal",
      path: "/crew-tony",
      imgUrl: "/sitemap-thumbs/crew.jpg",
      badgeType: "PORTAL",
      description: "Individual crew-member login portal for Tony.",
    },
  },
  {
    id: "node-live-ryan",
    type: "sitemapCard",
    position: { x: 7830, y: 460 },
    data: {
      header: "LIVE ROOM — RYAN",
      title: "Ryan's Broadcast Room",
      path: "/live/live_ryan",
      imgUrl: "/sitemap-thumbs/live-michael-dark.png",
      badgeType: "PORTAL",
      description: "Dedicated live-broadcast camera room for Ryan, mirroring the Michael broadcast room.",
    },
  },
  {
    id: "node-live-sammy",
    type: "sitemapCard",
    position: { x: 8116, y: 460 },
    data: {
      header: "LIVE ROOM — SAMMY",
      title: "Sammy's Broadcast Room",
      path: "/live/live_sammy",
      imgUrl: "/sitemap-thumbs/live-michael-dark.png",
      badgeType: "PORTAL",
      description: "Dedicated live-broadcast camera room for Sammy.",
    },
  },
  {
    id: "node-live-tony",
    type: "sitemapCard",
    position: { x: 8402, y: 460 },
    data: {
      header: "LIVE ROOM — TONY",
      title: "Tony's Broadcast Room",
      path: "/live/live_tony",
      imgUrl: "/sitemap-thumbs/live-michael-dark.png",
      badgeType: "PORTAL",
      description: "Dedicated live-broadcast camera room for Tony.",
    },
  },
  {
    id: "node-live-michael-static",
    type: "sitemapCard",
    position: { x: 8688, y: 460 },
    data: {
      header: "LIVE ROOM — MICHAEL (STATIC)",
      title: "Michael's Static Broadcast Room",
      path: "/live/live_michael",
      imgUrl: "/sitemap-thumbs/live-michael-dark.png",
      badgeType: "PORTAL",
      description: "Static per-member broadcast route for Michael — distinct from the dynamic /live/[room] fan-facing room.",
    },
  },
  {
    id: "node-verify-planner",
    type: "sitemapCard",
    position: { x: 11062, y: 920 },
    data: {
      header: "PLANNER VERIFY LINK",
      title: "Planner Verify Landing Page",
      path: "/planner/verify",
      imgUrl: "/sitemap-thumbs/verify-admin-funnel.jpg",
      badgeType: "MODULE",
      description: "Landing page a planner reaches from the PIN-verification email link to confirm their identity.",
    },
  },
  {
    id: "node-verify-cruise",
    type: "sitemapCard",
    position: { x: 9260, y: 920 },
    data: {
      header: "CRUISE VERIFY LINK",
      title: "Cruise Verify Landing Page",
      path: "/cruise/verify",
      imgUrl: "/sitemap-thumbs/verify-admin-funnel.jpg",
      badgeType: "MODULE",
      description: "Landing page a cruise registrant reaches from the PIN-verification email link to confirm their identity.",
    },
  },
  {
    id: "node-verify-crew",
    type: "sitemapCard",
    position: { x: 5656, y: 690 },
    data: {
      header: "CREW VERIFY LINK",
      title: "Crew Verify Landing Page",
      path: "/crew/verify",
      imgUrl: "/sitemap-thumbs/verify-admin-funnel.jpg",
      badgeType: "MODULE",
      description: "Landing page a crew member reaches from an invite/verification email link to confirm their account.",
    },
  },
  {
    id: "node-book-success",
    type: "sitemapCard",
    position: { x: 10776, y: 1150 },
    data: {
      header: "BOOKING SUCCESS PAGE",
      title: "Booking Request Submitted",
      path: "/book/success",
      imgUrl: "/sitemap-thumbs/event-detail.jpg",
      badgeType: "PORTAL",
      description: "Confirmation page shown to a planner immediately after their booking request is successfully submitted.",
    },
  },
  {
    id: "node-book-cancel",
    type: "sitemapCard",
    position: { x: 11298, y: 460 },
    data: {
      header: "BOOKING CANCEL PAGE",
      title: "Booking Cancelled Page",
      path: "/book/cancel",
      imgUrl: "/sitemap-thumbs/returns.jpg",
      badgeType: "PORTAL",
      description: "Page a planner lands on when a booking is cancelled (by them or by admin).",
    },
  },
  {
    id: "node-cruise-cancel",
    type: "sitemapCard",
    position: { x: 9496, y: 460 },
    data: {
      header: "CRUISE CANCEL PAGE",
      title: "Cruise Signup Cancelled Page",
      path: "/cruise/cancel",
      imgUrl: "/sitemap-thumbs/returns.jpg",
      badgeType: "PORTAL",
      description: "Page shown when a cruise cabin signup/reservation is cancelled.",
    },
  },
  {
    id: "node-cruise-preview",
    type: "sitemapCard",
    position: { x: 9782, y: 460 },
    data: {
      header: "CRUISE PREVIEW PAGE",
      title: "Cruise Preview (Admin Test View)",
      path: "/cruise/preview",
      imgUrl: "/sitemap-thumbs/cruise.jpg",
      badgeType: "PORTAL",
      description: "Admin/preview rendering of the cruise page content before it goes live.",
    },
  },
  {
    id: "node-claim-pin",
    type: "sitemapCard",
    position: { x: 12964, y: 230 },
    data: {
      header: "RAFFLE CLAIM PAGE",
      title: "Raffle Prize Claim Page",
      path: "/claim/582901",
      imgUrl: "/sitemap-thumbs/raffle-win-preview.jpg",
      badgeType: "MODULE",
      description: "Page a raffle winner reaches via a PIN-coded link to claim their prize.",
    },
  },
  {
    id: "node-qr-merch",
    type: "sitemapCard",
    position: { x: 236, y: 460 },
    data: {
      header: "QR MERCH REDEMPTION",
      title: "QR Merch Redemption Page",
      path: "/qr/merch",
      imgUrl: "/sitemap-thumbs/store-purchase-success.jpg",
      badgeType: "PORTAL",
      description: "Page opened by scanning an in-person QR code to redeem or purchase merch at a show.",
    },
  },
  {
    id: "node-admin-emailmap",
    type: "sitemapCard",
    position: { x: 1616, y: 690 },
    data: {
      header: "ADMIN — EMAIL MAP",
      title: "Admin Email Map",
      path: "/admin/email-map",
      imgUrl: "/sitemap-thumbs/admin-emailmap.jpg",
      badgeType: "PORTAL",
      description: "Internal reference page mapping every transactional email template to the event that triggers it.",
    },
  },
  {
    id: "node-admin-emails",
    type: "sitemapCard",
    position: { x: 1902, y: 690 },
    data: {
      header: "ADMIN — ALL EMAILS",
      title: "Admin Email Template Directory",
      path: "/admin/emails",
      imgUrl: "/sitemap-thumbs/admin-emails.jpg",
      badgeType: "PORTAL",
      description: "Lets admins preview and send test copies of every email template in the app.",
    },
  },
  {
    id: "node-admin-legal",
    type: "sitemapCard",
    position: { x: 2188, y: 690 },
    data: {
      header: "ADMIN — LEGAL DOCS",
      title: "Admin Legal Document Manager",
      path: "/admin/legal",
      imgUrl: "/sitemap-thumbs/admin-legal.jpg",
      badgeType: "PORTAL",
      description: "Internal tool for editing the site's Privacy Policy, Terms, and other legal copy.",
    },
  },
  {
    id: "node-admin-inventory",
    type: "sitemapCard",
    position: { x: 2474, y: 690 },
    data: {
      header: "ADMIN — SHOP INVENTORY",
      title: "Admin Shop Inventory Manager",
      path: "/admin/shop-inventory",
      imgUrl: "/sitemap-thumbs/admin-inventory.jpg",
      badgeType: "PORTAL",
      description: "Internal tool for managing Shopify-linked merch inventory used in Flash Drops.",
    },
  },
  {
    id: "node-admin-username",
    type: "sitemapCard",
    position: { x: 2760, y: 690 },
    data: {
      header: "ADMIN — MEMBER DETAIL",
      title: "Admin Member Detail View",
      path: "/admin/planner-demo",
      imgUrl: "/sitemap-thumbs/admin.jpg",
      badgeType: "PORTAL",
      description: "Per-planner/per-member detail and management view inside the admin dashboard.",
    },
  },
  {
    id: "footer-notifications",
    type: "sitemapCard",
    position: { x: 13200, y: 230 },
    data: {
      header: "SHOW ALERT SIGNUP",
      title: "Proximity & Show Alert Filters",
      path: "/notifications",
      imgUrl: "/sitemap-thumbs/proximity-demo.jpg",
      badgeType: "FOOTER_NAV",
      description: "Full-page version of the proximity/show-type push-notification signup form.",
    },
  },
  {
    id: "footer-privacy",
    type: "sitemapCard",
    position: { x: 12678, y: 230 },
    data: {
      header: "PRIVACY POLICY",
      title: "Privacy Policy",
      path: "/privacy",
      imgUrl: "/sitemap-thumbs/privacy.jpg",
      badgeType: "FOOTER_NAV",
      description: "Site privacy policy page, linked from the footer.",
    },
  },
  {
    id: "footer-terms",
    type: "sitemapCard",
    position: { x: 13486, y: 230 },
    data: {
      header: "TERMS OF SERVICE",
      title: "Terms of Service",
      path: "/terms",
      imgUrl: "/sitemap-thumbs/terms.jpg",
      badgeType: "FOOTER_NAV",
      description: "Site terms of service page, linked from the footer.",
    },
  },
  {
    id: "footer-returns",
    type: "sitemapCard",
    position: { x: 13772, y: 230 },
    data: {
      header: "RETURNS & REFUNDS",
      title: "Returns & Refunds Policy",
      path: "/returns",
      imgUrl: "/sitemap-thumbs/returns.jpg",
      badgeType: "FOOTER_NAV",
      description: "Merch store returns and refunds policy page.",
    },
  },
  {
    id: "footer-features",
    type: "sitemapCard",
    position: { x: 14058, y: 230 },
    data: {
      header: "FEATURES",
      title: "Features Overview",
      path: "/features",
      imgUrl: "/sitemap-thumbs/features.jpg",
      badgeType: "FOOTER_NAV",
      description: "Marketing page summarizing the app's feature set.",
    },
  },
  {
    id: "footer-styleguide",
    type: "sitemapCard",
    position: { x: 14344, y: 230 },
    data: {
      header: "STYLE GUIDE",
      title: "Design Style Guide",
      path: "/style-guide",
      imgUrl: "/sitemap-thumbs/style-guide.jpg",
      badgeType: "FOOTER_NAV",
      description: "Internal dev reference page documenting colors, type, and components used across the site.",
    },
  },
  {
    id: "email-welcome-fan-signup",
    type: "sitemapCard",
    position: { x: 833, y: 1840 },
    data: {
      header: "✉ FAN WELCOME EMAIL",
      title: "Fan Welcome Email",
      path: "/admin/emails",
      imgUrl: "/sitemap-thumbs/email-welcome-fan.jpg",
      badgeType: "EMAIL",
      description: "Sent immediately after a fan completes signup, welcoming them to the Fan Club.",
    },
  },
  {
    id: "email-welcome-crew",
    type: "sitemapCard",
    position: { x: 5892, y: 690 },
    data: {
      header: "✉ CREW WELCOME EMAIL",
      title: "\"Welcome to the 7th Heaven Crew\"",
      path: "/admin/emails",
      imgUrl: "/sitemap-thumbs/email-welcome-crew.jpg",
      badgeType: "EMAIL",
      description: "Sent when a new crew account is created: subject '🛡️ Welcome to the 7th Heaven Crew'.",
    },
  },
  {
    id: "email-welcome-planner",
    type: "sitemapCard",
    position: { x: 10068, y: 1380 },
    data: {
      header: "✉ PLANNER WELCOME EMAIL",
      title: "Planner Welcome Email",
      path: "/admin/emails",
      imgUrl: "/sitemap-thumbs/email-welcome-planner.jpg",
      badgeType: "EMAIL",
      description: "Sent when a new planner account is created, ahead of the separate PIN-verification email.",
    },
  },
  {
    id: "email-new-account-alert",
    type: "sitemapCard",
    position: { x: 14630, y: 230 },
    data: {
      header: "✉ NEW ACCOUNT ADMIN ALERT",
      title: "New Account Admin Alert",
      path: "/admin",
      imgUrl: "/sitemap-thumbs/email-new-account-admin-alert.jpg",
      badgeType: "EMAIL",
      description: "Internal notification sent to admins whenever any fan, crew, or planner account is created: subject '🔔 New {role} Account: {name}'.",
    },
  },
  {
    id: "email-fan-invite",
    type: "sitemapCard",
    position: { x: 3046, y: 690 },
    data: {
      header: "✉ FAN CLUB INVITE EMAIL",
      title: "Fan Club Invitation Email",
      path: "/admin",
      imgUrl: "/sitemap-thumbs/email-fan-invitation.jpg",
      badgeType: "EMAIL",
      description: "Sent via the admin's CSV bulk-invite tool: subject '🎸 You're Invited to the 7th Heaven Fan Club!'.",
    },
  },
  {
    id: "email-booking-admin",
    type: "sitemapCard",
    position: { x: 1380, y: 690 },
    data: {
      header: "✉ NEW BOOKING ADMIN ALERT",
      title: "New Booking Request (Admin Alert)",
      path: "/admin",
      imgUrl: "/sitemap-thumbs/email-booking-admin.jpg",
      badgeType: "EMAIL",
      description: "Internal alert sent to admins the moment a planner submits a booking request: subject '⚡ New Booking Request — {id} from {name}'.",
    },
  },
  {
    id: "email-booking-confirm",
    type: "sitemapCard",
    position: { x: 11584, y: 460 },
    data: {
      header: "✉ BOOKING RECEIVED EMAIL",
      title: "Booking Request Received",
      path: "/book",
      imgUrl: "/sitemap-thumbs/email-booking-confirm.jpg",
      badgeType: "EMAIL",
      description: "Customer-facing confirmation sent to the planner right after they submit a booking request.",
    },
  },
  {
    id: "email-booking-status",
    type: "sitemapCard",
    position: { x: 10304, y: 1380 },
    data: {
      header: "✉ BOOKING STATUS UPDATE",
      title: "Booking Status Update Email",
      path: "/planner",
      imgUrl: "/sitemap-thumbs/email-booking-status.jpg",
      badgeType: "EMAIL",
      description: "Sent to the planner whenever admin changes a booking's status (confirmed, declined, etc.).",
    },
  },
  {
    id: "email-booking-cancelled",
    type: "sitemapCard",
    position: { x: 11323, y: 690 },
    data: {
      header: "✉ BOOKING CANCELLED EMAIL",
      title: "Booking Cancelled Email",
      path: "/book/cancel",
      imgUrl: "/sitemap-thumbs/email-booking-cancelled-admin.jpg",
      badgeType: "EMAIL",
      description: "Sent to planner and admin when a booking is cancelled: subject '🚨 Booking Cancelled: {bookingId}'.",
    },
  },
  {
    id: "email-booking-refund",
    type: "sitemapCard",
    position: { x: 3282, y: 690 },
    data: {
      header: "✉ DEPOSIT REFUNDED EMAIL",
      title: "Deposit Refunded Email",
      path: "/admin",
      imgUrl: "/sitemap-thumbs/email-booking-status.jpg",
      badgeType: "EMAIL",
      description: "Sent when admin processes a booking deposit refund: subject '💸 Deposit Refunded — {bookingId}'.",
    },
  },
  {
    id: "email-loadin-confirmed",
    type: "sitemapCard",
    position: { x: 10540, y: 1380 },
    data: {
      header: "✉ LOAD-IN TIME CONFIRMED",
      title: "Load-In Setup Time Confirmed",
      path: "/planner",
      imgUrl: "/sitemap-thumbs/email-booking-status.jpg",
      badgeType: "EMAIL",
      description: "Sent to the planner once the crew load-in setup time is locked in: subject '⏰ Load-In Setup Time Confirmed'.",
    },
  },
  {
    id: "email-cruise-admin-notify",
    type: "sitemapCard",
    position: { x: 3518, y: 690 },
    data: {
      header: "✉ CRUISE ADMIN NOTIFY",
      title: "Cruise Signup Admin Notification",
      path: "/admin",
      imgUrl: "/sitemap-thumbs/email-cruise-admin-notify.jpg",
      badgeType: "EMAIL",
      description: "Internal alert sent to admins whenever a new cruise cabin signup comes in.",
    },
  },
  {
    id: "email-cruise-blast",
    type: "sitemapCard",
    position: { x: 3754, y: 690 },
    data: {
      header: "✉ CRUISE & NEWSLETTER BLASTS",
      title: "Cruise & Newsletter Announcement Blasts",
      path: "/admin",
      imgUrl: "/sitemap-thumbs/email-cruise-blast.jpg",
      badgeType: "EMAIL",
      description: "Admin-triggered mass email blasts to the cruise roster or full newsletter list (tour announcements, cabin pricing updates, etc.).",
    },
  },
  {
    id: "email-cruise-welcome",
    type: "sitemapCard",
    position: { x: 8999, y: 1610 },
    data: {
      header: "✉ CRUISE HUB WELCOME",
      title: "\"Welcome to the Cruise Hub\"",
      path: "/cruise/dashboard",
      imgUrl: "/sitemap-thumbs/email-cruise-welcome.jpg",
      badgeType: "EMAIL",
      description: "Sent once cruise PIN verification completes: subject '🚢 You're Confirmed — Welcome to the 7th Heaven Cruise Hub!'.",
    },
  },
  {
    id: "email-cruise-cancel-notice",
    type: "sitemapCard",
    position: { x: 9521, y: 690 },
    data: {
      header: "✉ CRUISE CANCELLED EMAIL",
      title: "Cruise Signup Cancelled Email",
      path: "/cruise/cancel",
      imgUrl: "/sitemap-thumbs/email-cruise-cancel.jpg",
      badgeType: "EMAIL",
      description: "Sent when a cruise cabin signup is cancelled.",
    },
  },
  {
    id: "email-crew-alert-blast",
    type: "sitemapCard",
    position: { x: 6128, y: 690 },
    data: {
      header: "✉ CREW ALERT BLAST",
      title: "Crew Alert Blast (SMS/Email)",
      path: "/crew",
      imgUrl: "/sitemap-thumbs/crew-sms-roles.jpg",
      badgeType: "EMAIL",
      description: "Admin-triggered alert to all crew for a show update: subject '🛡️ Crew Alert: {venue}'.",
    },
  },
  {
    id: "email-crew-shift",
    type: "sitemapCard",
    position: { x: 6364, y: 690 },
    data: {
      header: "✉ SHIFT COVERAGE EMAILS",
      title: "Shift Coverage Requested & Confirmed",
      path: "/crew",
      imgUrl: "/sitemap-thumbs/email-shift-coverage-request.jpg",
      badgeType: "EMAIL",
      description: "Sent when a crew member requests coverage for their shift, and again once another crew member accepts it.",
    },
  },
  {
    id: "email-crew-hours-summary",
    type: "sitemapCard",
    position: { x: 6600, y: 690 },
    data: {
      header: "✉ CREW HOURS SUMMARY",
      title: "Crew Hours Summary Email",
      path: "/crew",
      imgUrl: "/sitemap-thumbs/email-crew-hours-summary.jpg",
      badgeType: "EMAIL",
      description: "Periodic summary of hours worked, sent to crew members.",
    },
  },
  {
    id: "email-crew-sms-alerts",
    type: "sitemapCard",
    position: { x: 6836, y: 690 },
    data: {
      header: "✉ CREW SMS ALERTS",
      title: "Crew SMS Alert Received/Dispatched",
      path: "/crew",
      imgUrl: "/sitemap-thumbs/email-crew-sms-dispatched-alert.jpg",
      badgeType: "EMAIL",
      description: "Companion email notifications for the crew SMS alert system (dispatch confirmation and receipt).",
    },
  },
  {
    id: "email-schedule-change",
    type: "sitemapCard",
    position: { x: 7072, y: 690 },
    data: {
      header: "✉ SCHEDULE CHANGE ALERT",
      title: "Schedule Change Alert Email",
      path: "/crew",
      imgUrl: "/sitemap-thumbs/email-schedule-change-alert.jpg",
      badgeType: "EMAIL",
      description: "Sent to affected crew members when their shift schedule changes.",
    },
  },
  {
    id: "email-raffle-entry",
    type: "sitemapCard",
    position: { x: 7308, y: 690 },
    data: {
      header: "✉ RAFFLE ENTRY EMAIL",
      title: "\"You're Entered!\" Raffle Email",
      path: "/crew",
      imgUrl: "/sitemap-thumbs/raffle-entry-preview.jpg",
      badgeType: "EMAIL",
      description: "Sent when a fan enters a live-stream raffle: subject '🎟️ You are entered into the 7th Heaven Raffle!'.",
    },
  },
  {
    id: "email-raffle-win",
    type: "sitemapCard",
    position: { x: 7308, y: 920 },
    data: {
      header: "✉ RAFFLE WIN EMAIL",
      title: "\"You Won!\" Raffle Email",
      path: "/claim/582901",
      imgUrl: "/sitemap-thumbs/raffle-win-preview.jpg",
      badgeType: "EMAIL",
      description: "Sent to the winner of a live-stream raffle: subject '🏆 You Won the 7th Heaven Raffle!'.",
    },
  },
  {
    id: "email-account-terminated",
    type: "sitemapCard",
    position: { x: 3990, y: 690 },
    data: {
      header: "✉ ACCOUNT TERMINATED",
      title: "Account Terminated (Moderation) Email",
      path: "/admin",
      imgUrl: "/sitemap-thumbs/forgot-password.jpg",
      badgeType: "EMAIL",
      description: "Sent when an admin terminates a user's account for a moderation violation.",
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
  { id: "flow-book-to-modal-open", source: "nav-book", target: "node-book-pin-module", type: "smoothstep" },
  { id: "flow-modal-to-pin-email", source: "node-book-pin-module", target: "email-book-pin-email", type: "smoothstep" },
  { id: "flow-pin-email-to-verify-module", source: "email-book-pin-email", target: "node-book-verify-pin", type: "smoothstep" },
  { id: "flow-verify-module-to-dashboard", source: "node-book-verify-pin", target: "node-planner-unlocked", type: "smoothstep" },
  { id: "e-fanwall-fans", source: "nav-fanwall", target: "node-fans", type: "smoothstep" },
  { id: "flow-fan-signup-to-pin-module", source: "node-fan-signup-module", target: "node-fan-pin-verification", type: "smoothstep" },
  { id: "flow-pin-module-to-security-email", source: "node-fan-pin-verification", target: "email-fan-pin-security", type: "smoothstep" },
  { id: "flow-security-email-to-filled-module", source: "email-fan-pin-security", target: "node-fan-verify-pin-filled", type: "smoothstep" },
  { id: "flow-filled-module-to-fan-dashboard", source: "node-fan-verify-pin-filled", target: "node-fan-dashboard-unlocked", type: "smoothstep" },
  { id: "e-fanwall-picks", source: "nav-fanwall", target: "node-picks", type: "smoothstep" },
  { id: "e-live-admin", source: "nav-live", target: "node-admin", type: "smoothstep" },
  { id: "e-live-crew", source: "nav-live", target: "node-crew", type: "smoothstep" },
  { id: "flow-live-to-michael", source: "nav-live", target: "node-live-michael", type: "smoothstep" },
  { id: "flow-michael-to-modal", source: "node-live-michael", target: "node-live-push-modal", type: "smoothstep" },
  { id: "flow-modal-to-subscribed-email", source: "node-live-push-modal", target: "email-live-subscribed", type: "smoothstep" },
  { id: "flow-subscribed-to-unsubscribed-email", source: "email-live-subscribed", target: "email-live-unsubscribed", type: "smoothstep" },
  { id: "flow-cruise-to-pin-module", source: "nav-cruise", target: "node-cruise-pin-module", type: "smoothstep" },
  { id: "flow-cruise-pin-to-email", source: "node-cruise-pin-module", target: "email-cruise-pin-email", type: "smoothstep" },
  { id: "flow-cruise-email-to-filled", source: "email-cruise-pin-email", target: "node-cruise-verify-pin-filled", type: "smoothstep" },
  { id: "flow-cruise-filled-to-pin-filled", source: "node-cruise-verify-pin-filled", target: "node-cruise-pin-filled", type: "smoothstep" },
  { id: "flow-cruise-pin-filled-to-dashboard", source: "node-cruise-pin-filled", target: "node-cruise-dashboard-unlocked", type: "smoothstep" },
  { id: "flow-merch-pickup", source: "nav-merch", target: "email-merch-pickup", type: "smoothstep" },
  { id: "flow-admin-alert", source: "node-admin", target: "email-booking-admin", type: "smoothstep" },
  { id: "e-crew-abbie", source: "node-crew", target: "node-crew-abbie", type: "smoothstep" },
  { id: "e-crew-michael2", source: "node-crew", target: "node-crew-michael2", type: "smoothstep" },
  { id: "e-crew-ryan", source: "node-crew", target: "node-crew-ryan", type: "smoothstep" },
  { id: "e-crew-sam", source: "node-crew", target: "node-crew-sam", type: "smoothstep" },
  { id: "e-crew-tony", source: "node-crew", target: "node-crew-tony", type: "smoothstep" },
  { id: "e-live-ryan", source: "nav-live", target: "node-live-ryan", type: "smoothstep" },
  { id: "e-live-sammy", source: "nav-live", target: "node-live-sammy", type: "smoothstep" },
  { id: "e-live-tony-room", source: "nav-live", target: "node-live-tony", type: "smoothstep" },
  { id: "e-live-michael-static", source: "nav-live", target: "node-live-michael-static", type: "smoothstep" },
  { id: "e-verify-planner", source: "email-book-pin-email", target: "node-verify-planner", type: "smoothstep" },
  { id: "e-verify-cruise", source: "email-cruise-pin-email", target: "node-verify-cruise", type: "smoothstep" },
  { id: "e-verify-crew", source: "node-crew", target: "node-verify-crew", type: "smoothstep" },
  { id: "e-book-success", source: "node-book-verify-pin", target: "node-book-success", type: "smoothstep" },
  { id: "e-book-cancel", source: "nav-book", target: "node-book-cancel", type: "smoothstep" },
  { id: "e-cruise-cancel", source: "nav-cruise", target: "node-cruise-cancel", type: "smoothstep" },
  { id: "e-cruise-preview", source: "nav-cruise", target: "node-cruise-preview", type: "smoothstep" },
  { id: "e-claim-pin", source: "root", target: "node-claim-pin", type: "smoothstep" },
  { id: "e-qr-merch", source: "nav-merch", target: "node-qr-merch", type: "smoothstep" },
  { id: "e-admin-emailmap", source: "node-admin", target: "node-admin-emailmap", type: "smoothstep" },
  { id: "e-admin-emails", source: "node-admin", target: "node-admin-emails", type: "smoothstep" },
  { id: "e-admin-legal", source: "node-admin", target: "node-admin-legal", type: "smoothstep" },
  { id: "e-admin-inventory", source: "node-admin", target: "node-admin-inventory", type: "smoothstep" },
  { id: "e-admin-username", source: "node-admin", target: "node-admin-username", type: "smoothstep" },
  { id: "e-root-notifications", source: "root", target: "footer-notifications", type: "smoothstep" },
  { id: "e-root-terms", source: "root", target: "footer-terms", type: "smoothstep" },
  { id: "e-root-returns", source: "root", target: "footer-returns", type: "smoothstep" },
  { id: "e-root-features", source: "root", target: "footer-features", type: "smoothstep" },
  { id: "e-root-styleguide", source: "root", target: "footer-styleguide", type: "smoothstep" },
  { id: "e-email-welcome-fan", source: "node-fan-dashboard-unlocked", target: "email-welcome-fan-signup", type: "smoothstep" },
  { id: "e-email-welcome-crew", source: "node-crew", target: "email-welcome-crew", type: "smoothstep" },
  { id: "e-email-welcome-planner", source: "node-planner-unlocked", target: "email-welcome-planner", type: "smoothstep" },
  { id: "e-email-new-account", source: "root", target: "email-new-account-alert", type: "smoothstep" },
  { id: "e-email-fan-invite", source: "node-admin", target: "email-fan-invite", type: "smoothstep" },
  { id: "e-email-booking-confirm", source: "nav-book", target: "email-booking-confirm", type: "smoothstep" },
  { id: "e-email-booking-status", source: "node-planner-unlocked", target: "email-booking-status", type: "smoothstep" },
  { id: "e-email-booking-cancelled", source: "node-book-cancel", target: "email-booking-cancelled", type: "smoothstep" },
  { id: "e-email-booking-refund", source: "node-admin", target: "email-booking-refund", type: "smoothstep" },
  { id: "e-email-loadin-confirmed", source: "node-planner-unlocked", target: "email-loadin-confirmed", type: "smoothstep" },
  { id: "e-email-cruise-admin-notify", source: "node-admin", target: "email-cruise-admin-notify", type: "smoothstep" },
  { id: "e-email-cruise-blast", source: "node-admin", target: "email-cruise-blast", type: "smoothstep" },
  { id: "e-email-cruise-welcome", source: "node-cruise-dashboard-unlocked", target: "email-cruise-welcome", type: "smoothstep" },
  { id: "e-email-cruise-cancel", source: "node-cruise-cancel", target: "email-cruise-cancel-notice", type: "smoothstep" },
  { id: "e-email-crew-alert-blast", source: "node-crew", target: "email-crew-alert-blast", type: "smoothstep" },
  { id: "e-email-crew-shift", source: "node-crew", target: "email-crew-shift", type: "smoothstep" },
  { id: "e-email-crew-hours", source: "node-crew", target: "email-crew-hours-summary", type: "smoothstep" },
  { id: "e-email-crew-sms", source: "node-crew", target: "email-crew-sms-alerts", type: "smoothstep" },
  { id: "e-email-schedule-change", source: "node-crew", target: "email-schedule-change", type: "smoothstep" },
  { id: "e-email-raffle-entry", source: "node-crew", target: "email-raffle-entry", type: "smoothstep" },
  { id: "e-email-raffle-win", source: "email-raffle-entry", target: "email-raffle-win", type: "smoothstep" },
  { id: "e-email-account-terminated", source: "node-admin", target: "email-account-terminated", type: "smoothstep" },
  { id: "e-fans-signup", source: "node-fans", target: "node-fan-signup-module", type: "smoothstep" },
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
      header: "STEP 2 · CRUISE PIN VERIFICATION MODULE",
      title: "2. Cruise PIN Verification Module",
      path: "/cruise",
      imgUrl: "/sitemap-thumbs/planner-pin-modal.jpg",
      badgeType: "MODULE",
      description: "Submitting cabin registration opens the Cruise PIN Verification Module, asking for a 6-digit security PIN to reserve the cabin on the 2026 Cruise.",
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
      header: "STEP 4 · CRUISE PIN VERIFICATION MODULE",
      title: "4. Enter PIN into Module on Cruise Page",
      path: "/cruise",
      imgUrl: "/sitemap-screenshots/cruise-pin-verify-v2.png",
      badgeType: "MODULE",
      description: "Fan inputs 6-digit PIN [5][8][2][9][0][1] into the Cruise PIN Verification Module on the cruise page to complete the reservation.",
    },
  },
  {
    id: "cf-step5",
    type: "sitemapCard",
    position: { x: 1520, y: 150 },
    data: {
      header: "STEP 5 · CABIN CONFIRMATION EMAIL",
      title: "5. Official Cruise Confirmation",
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
  { id: "cf-e4", source: "cf-step4", sourceHandle: "right", target: "cf-step5", targetHandle: "left", animated: true, type: "smoothstep" },
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
          stroke: #52525b !important;
          stroke-width: 1.5px !important;
        }
      `}</style>

      {/* Header bar with View Selector Tabs */}
      <div className="max-w-[1700px] mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4 border border-purple-500/30 bg-[#0c0c14] mb-4 shadow-2xl rounded-lg backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold   ">
            7H
          </div>
          <div>
            <h1 className="font-bold text-base text-white  uppercase">
              {activeTab === "ARCH"
                ? "7th Heaven Site Directory & Direct Vertical Booking PIN Flow"
                : activeTab === "BOOKING"
                  ? "Event Booking & PIN Step-by-Step Horizontal Flow"
                  : activeTab === "CRUISE"
                    ? "Cruise Reservation & Security PIN Flow"
                    : "Fan Account Signup & PIN Verification Flow"}
            </h1>
            <p className="">
              {activeTab === "ARCH"
                ? "Direct Vertical Flow under Book Us: Form ➔ Planner PIN Verification Module ➔ Planner Security PIN Email ➔ Enter PIN ➔ Planner Dashboard"
                : activeTab === "BOOKING"
                  ? "Step-by-step user journey: Form Fill ➔ Planner PIN Verification Module ➔ Planner Security PIN Email ➔ Enter PIN ➔ Planner Dashboard"
                  : activeTab === "CRUISE"
                    ? "Step-by-step user journey: Cabin Request ➔ Cruise PIN Verification Module ➔ Cruise PIN Email ➔ Enter PIN ➔ Cruise Confirmation Email"
                    : "Step-by-step user journey: Fan Signup ➔ Fan PIN Email ➔ Enter PIN ➔ Complete Profile ➔ Member Dashboard"}
            </p>
          </div>
        </div>

        {/* VIEW SELECTOR TABS */}
        <div className="flex items-center gap-2 bg-black/60 p-1.5 rounded-lg border border-white/10">
          <button
            onClick={() => setActiveTab("ARCH")}
            className={`px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${activeTab === "ARCH"
              ? "bg-purple-600 text-white shadow-lg border border-purple-400/50"
              : " text-white  hover:text-white hover: bg-[#00000029]   "
              }`}
          >
            <Layers className="w-3.5 h-3.5 text-purple-300" />
            <span>Full Architecture</span>
          </button>

          <button
            onClick={() => setActiveTab("BOOKING")}
            className={`px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${activeTab === "BOOKING"
              ? "bg-purple-600 text-white shadow-lg border border-purple-400/50"
              : " text-white  hover:text-white hover: bg-[#00000029]   "
              }`}
          >
            <Calendar className="w-3.5 h-3.5 text-cyan-300" />
            <span>Booking Flow</span>
          </button>

          <button
            onClick={() => setActiveTab("CRUISE")}
            className={`px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${activeTab === "CRUISE"
              ? "bg-purple-600 text-white shadow-lg border border-purple-400/50"
              : " text-white  hover:text-white hover: bg-[#00000029]   "
              }`}
          >
            <Ship className="w-3.5 h-3.5 text-amber-300" />
            <span>Cruise Flow</span>
          </button>

          <button
            onClick={() => setActiveTab("FAN_SIGNUP")}
            className={`px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${activeTab === "FAN_SIGNUP"
              ? "bg-purple-600 text-white shadow-lg border border-purple-400/50"
              : " text-white  hover:text-white hover: bg-[#00000029]   "
              }`}
          >
            <UserPlus className="w-3.5 h-3.5 text-pink-300" />
            <span>Fan Signup Flow</span>
          </button>

          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg border  border-white/10  bg-[#00000029] text-white font-bold hover:bg-white/10 transition flex items-center gap-1 ml-1"
          >
            <span>XML</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Interactive Flow Canvas */}
      <div className="max-w-[1700px] mx-auto h-[calc(100vh-180px)] min-h-[650px] rounded-lg border  border-white/10  bg-[#09090f] overflow-hidden shadow-2xl relative">
        <ReactFlow
          key={activeTab}
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          minZoom={0.03}
          maxZoom={1.5}
          colorMode="dark"
        >
          <Background color="#1e1b2e" gap={24} size={1} />
          <Controls className="!bg-black/90 !  border-white/10  !text-white ! rounded-lg overflow-hidden !shadow-2xl" />
          <MiniMap
            style={{ height: 110, width: 160 }}
            maskColor="rgba(0, 0, 0, 0.8)"
            nodeColor="#71717a"
            className="!bg-black/90 !  border-white/10  ! rounded-lg !shadow-2xl"
          />
        </ReactFlow>
      </div>

    </div>
  );
}
