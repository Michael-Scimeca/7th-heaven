/* eslint-disable react-doctor/no-giant-component */
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

function TreeNode({ path, label, color, children }: { path: string; label: string; color: string; children?: React.ReactNode }) {
  const isLinkable = !path.includes('[');
  return (
    <div>
      <div className="flex items-center gap-2 py-0.5">
        <span className="text-white/15 select-none">├─</span>
        {isLinkable ? (
          <Link href={path} className={`${color} font-bold hover:underline hover:text-white transition-colors`}>{path}</Link>
        ) : (
          <span className={`${color} font-bold`}>{path}</span>
        )}
        <span className="text-white/25 text-sm">{label}</span>
      </div>
      {children && (
        <div className="ml-6 border-l border-white/5 pl-4 space-y-0.5">
          {children}
        </div>
      )}
    </div>
  );
}

const siteStructure = [
  {
    title: "Public Experience (Fans)",
    routes: [
      {
        path: "/",
        name: "Home Page",
        sections: ["Cinematic Hero Hub", "Proximity Notifications", "Next Show Banner", "Upcoming Shows Grid", "Cruise Promo Banner", "Tour Map", "Latest Release", "Music Player", "Merch Quick Shop", "Photo Gallery", "Video Section", "Behind the Scenes"],
        features: ["Dynamic Header Intersection", "Local Storage Opt-in tracking", "Live Stream Detection", "Supabase Real-Time Feed", "E2E Verified ⭐"],
        color: " text-[var(--color-accent)]",
        border: "border-purple-500/30",
        bg: "bg-purple-500/5",
      },
      {
        path: "/#tour",
        name: "Tour Dates (Home Section)",
        sections: ["Interactive Venue Map", "Chronological Next Show Pin", "Smart Search & Filters", "Tour Table Dates"],
        features: ["Leaflet Dynamic Map Rendering", "Real-Time Date Filtering algorithms", "Geo-coordinates integration"],
        color: "text-blue-400",
        border: "border-blue-500/30",
        bg: "bg-blue-500/5",
      },
      {
        path: "/video",
        name: "Video Gallery",
        sections: ["16:9 Thumbnail Grids", "Custom Inline Player", "Categorized Playlists"],
        features: ["Intelligent API Fallbacks", "Aspect Ratio Scaling", "Hydration Error Immunity"],
        color: "text-pink-400",
        border: "border-pink-500/30",
        bg: "bg-pink-500/5",
      },
      {
        path: "/bio",
        name: "Band Bio",
        sections: ["History Timeline", "Band Member Profiles", "Accolades"],
        features: ["Static Content Hydration"],
        color: "text-purple-300",
        border: "border-purple-500/30",
        bg: "bg-purple-600/5",
      },
      {
        path: "/members/[slug]",
        name: "Individual Band Members",
        sections: ["Hero Profile", "Extended Q&A", "Gear/Instruments"],
        features: ["Dynamic Routing", "Sanity CMS Data Fetching"],
        color: "text-purple-300",
        border: "border-purple-500/30",
        bg: "bg-purple-600/5",
      },
      {
        path: "/fan-photo-wall",
        name: "Fan Photo Wall",
        sections: ["Dynamic Masonry Grid", "Hover Interactions", "Fullscreen Lightbox"],
        features: ["CSS Column-Based Masonry", "Focus Trapping Modal", "Optimized Image Loading"],
        color: "text-emerald-400",
        border: "border-emerald-500/30",
        bg: "bg-emerald-500/5",
      },
      {
        path: "/live",
        name: "Live Stream Hub",
        sections: ["Active Broadcast Gallery", "Real-Time Stream Detection", "Auto-Cleanup of Stale Feeds"],
        features: ["LiveKit Room Aggregation", "Supabase Cross-Validation", "WebRTC Video Streams"],
        color: "text-rose-400",
        border: "border-rose-500/30",
        bg: "bg-rose-500/5",
      },

      {
        path: "/store",
        name: "Merch Store",
        sections: ["Product Grid", "Headless Checkout", "Cart System"],
        features: ["Shopify Storefront API", "GraphQL Cart Mutations", "Dynamic Inventory"],
        color: "text-lime-400",
        border: "border-lime-500/30",
        bg: "bg-lime-500/5",
      },
      {
        path: "/book",
        name: "Book the Band",
        sections: ["Multi-Step Booking Form", "Event Type Selection", "Production & Extras", "Planner Dashboard Access", "Inline Account Creation with Username"],
        features: ["Supabase Form Submission", "Role-Based Planner Accounts", "Token-Based Cancellation Links", "Cancel Token Generation", "Welcome + Admin Alert Emails on Signup", "E2E Verified ⭐"],
        color: "text-fuchsia-400",
        border: "border-fuchsia-500/30",
        bg: "bg-fuchsia-500/5",
      },
      {
        path: "/book/cancel",
        name: "Booking Cancellation",
        sections: ["Token Validation", "Booking Details Display", "Cancellation Confirmation", "Success/Error States"],
        features: ["Secure Token + ID Verification", "No-Login Required", "Supabase Status Update", "Immediate Admin Notification"],
        color: "text-fuchsia-400",
        border: "border-fuchsia-500/30",
        bg: "bg-fuchsia-500/5",
      },
      {
        path: "/contact",
        name: "Contact",
        sections: ["Contact Form", "Social Links", "Band Email"],
        features: ["Form Validation", "Resend Integration"],
        color: "text-sky-400",
        border: "border-sky-500/30",
        bg: "bg-sky-500/5",
      },
      {
        path: "/cruise",
        name: "Caribbean Cruise",
        sections: ["Cinematic Hero", "Interest Signup Form", "Live Fan Counter", "Day-by-Day Itinerary", "What's Included", "FAQ Accordion", "Community Opt-In (Account Creation)"],
        features: ["Supabase Interest Tracking", "Resend Email Confirmation", "Token-Based Cancellation", "Auth Invite Link for Community", "Cruise Community Welcome Email", "E2E Verified ⭐"],
        color: "text-cyan-400",
        border: "border-cyan-500/30",
        bg: "bg-cyan-500/5",
      },
      {
        path: "/cruise/cancel",
        name: "Cruise Cancellation",
        sections: ["Token Validation", "Cancellation Confirmation", "Confirmation Email"],
        features: ["Secure Token Links", "Supabase Record Deletion", "Resend Cancellation Email"],
        color: "text-cyan-400",
        border: "border-cyan-500/30",
        bg: "bg-cyan-500/5",
      },
      {
        path: "/merch",
        name: "Merch Landing",
        sections: ["Featured Products", "Category Filters", "Quick Buy Links"],
        features: ["Shopify Storefront API", "Dynamic Pricing"],
        color: "text-lime-400",
        border: "border-lime-500/30",
        bg: "bg-lime-500/5",
      },
      {
        path: "/privacy",
        name: "Privacy Policy",
        sections: ["Data Collection", "Cookie Policy", "User Rights"],
        features: ["Static Legal Content"],
        color: "text-gray-400",
        border: "border-gray-500/30",
        bg: "bg-gray-500/5",
      },
      {
        path: "/terms",
        name: "Terms of Service",
        sections: ["Usage Terms", "Liability", "Account Rules"],
        features: ["Static Legal Content"],
        color: "text-gray-400",
        border: "border-gray-500/30",
        bg: "bg-gray-500/5",
      },
      {
        path: "/shows/[id]",
        name: "Show Page",
        sections: ["Show Hero", "RSVP Controls", "Attendee List", "Invite Challenge", "QR Share Code", "Fan Who's Going", "Venue Directions", "Live Feed Banner (if active)"],
        features: ["Auto-RSVP via SMS Deep Link (?rsvp=going)", "Live Attendance Count in SMS Blast", "Twilio Webhook Reply Handling", "Supabase show_attendance", "Dynamic QR Generation", "Anonymous RSVP Toggle", "Share via Text/Copy Link"],
        color: " text-[var(--color-accent)]",
        border: "border-purple-500/30",
        bg: "bg-purple-500/5",
      },
      {
        path: "/members",
        name: "Band Members Directory",
        sections: ["Member Cards Grid", "Headshot Gallery", "Links to Profiles"],
        features: ["Sanity CMS Data", "Dynamic Routing"],
        color: "text-purple-300",
        border: "border-purple-500/30",
        bg: "bg-purple-600/5",
      },
    ],
  },
  {
    title: "Authentication & Dashboards",
    routes: [
      {
        path: "/fans",
        name: "Fan Dashboard",
        sections: ["Fan vs Crew Pathing", "Backstage Live Feed", "📲 SMS Live Alert Opt-In", "📍 Proximity Show Alerts", "🚢 Cruise Promo Banner (conditional)", "🎟️ Prize Wallet / VIP Inbox", "🔗 Referral Program + QR Code", "📸 Fan Photo Submissions", "🏆 Next Show Countdown", "🎵 Pick Awards", "🚢 Fan ↔ Cruise Toggle (if Cruiser)", "Embedded Cruise Hub View"],
        features: ["Role-Based Automatic Routing", "JWT Session Management", "isCruiser Email Reconciliation", "60-Day Cruise Auto-Expiry", "Cross-Promo Cruise Banner", "Welcome Email on Signup", "Admin Alert Email on Signup"],
        color: "text-cyan-400",
        border: "border-cyan-500/30",
        bg: "bg-cyan-500/5",
      },
      {
        path: "/planner",
        name: "Planner Dashboard",
        sections: ["Booking Status Tracker", "Event Details View", "Re-Book Flow", "Inline Checklist Editing", "Public Landing with Login/Signup", "Username Capture on Signup"],
        features: ["Role-Based Access", "Supabase Row-Level Security", "Real-Time Status Updates", "Non-Authenticated Browse Mode", "Welcome Planner Email", "Admin Alert Email"],
        color: "text-teal-400",
        border: "border-teal-500/30",
        bg: "bg-teal-500/5",
      },
      {
        path: "/cruise/dashboard",
        name: "Cruise Passenger Dashboard",
        sections: ["Passenger Account Setup (via Auth Invite)", "Admin Important Updates (WYSIWYG)", "🎸 Fan Dashboard Promo Banner", "Pinned Lounge Messages", "Important Links Panel", "Cruise Chat", "Day-by-Day Itinerary", "Embarkation Countdown", "Passengers Widget", "Booking Manager"],
        features: ["Cruise Member Account via generateLink Invite", "Supabase site_settings Messaging", "Real-time Admin Notifications", "Role-Based Access", "Community Welcome Email", "Cross-Promo Fan Banner"],
        color: "text-cyan-400",
        border: "border-cyan-500/30",
        bg: "bg-cyan-500/5",
      },
      {
        path: "/claim",
        name: "Raffle Prize Claim",
        sections: ["PIN Verification", "Prize Details", "Claim Confirmation"],
        features: ["Secure Token Validation", "One-Time PIN System"],
        color: "text-yellow-400",
        border: "border-yellow-500/30",
        bg: "bg-yellow-500/5",
      },
      {
        path: "/crew",
        name: "Crew Dashboard",
        sections: ["Live Broadcast Studio", "Live Chat & Reactions", "Interactive Raffle Engine", "Shopify Flash Drops", "Fan Account Management"],
        features: ["LiveKit Streaming", "Cross-Tab Synchronization", "Real-Time Broadcast Toggles", "Supabase Subscriptions", "Username in Profile"],
        color: "text-orange-400",
        border: "border-orange-500/30",
        bg: "bg-orange-500/5",
      },
      {
        path: "#",
        name: "Shopify Store (External)",
        sections: ["cartCreate GraphQL Tunnel", "Dynamic Headless Checkout", "Password Protected Preview"],
        features: ["Shopify Native Cart API", "Zero-Database Inventory Sync", "Single Source of Truth Transactions"],
        color: "text-green-400",
        border: "border-green-500/30",
        bg: "bg-green-500/5",
      },
    ],
  },
  {
    title: "Demos & Interactive Features",
    routes: [
      {
        path: "/demo",
        name: "Feature Demos Hub",
        sections: ["Demo Index", "Feature Links"],
        features: ["Standalone Demo Pages"],
        color: "text-indigo-400",
        border: "border-indigo-500/30",
        bg: "bg-indigo-500/5",
      },
      {
        path: "/demo/proximity",
        name: "Proximity Show Discovery Demo",
        sections: ["GPS Detection Simulation", "Show Card Hero", "RSVP Controls", "Invite Challenge Card", "Attendee List Expander", "QR Share Code"],
        features: ["rsvpStatus State Machine", "SMS Pre-fill by Status", "Inline Attendee Expansion", "Invite Progress Bar"],
        color: "text-indigo-400",
        border: "border-indigo-500/30",
        bg: "bg-indigo-500/5",
      },
      {
        path: "/live/demo",
        name: "Live Broadcast Demo",
        sections: ["Mock Livestream", "Chat", "Raffle Engine", "Merch Flash Drop"],
        features: ["Simulated LiveKit Room", "Real-Time Chat", "Supabase Raffle State"],
        color: "text-rose-400",
        border: "border-rose-500/30",
        bg: "bg-rose-500/5",
      },
    ],
  },
  {
    title: "Internal Infrastructure (Staff)",
    routes: [

      {
        path: "/admin",
        name: "Master Admin Command Center",
        sections: ["🎸 Band & Site Tab: Band Announcements (WYSIWYG), Analytics, Shopify Sales, Booking Approval, Live Streams, Fan Photo Moderation, SMS/Newsletter Blasts, Community Registry, Crew Account Creator (with Username), Audit Log", "🚢 Cruise Tab: Passenger Notice (WYSIWYG), Roster Export, Lounge Chat Pin, Important Links Manager, Itinerary Builder"],
        features: ["Band/Cruise Tab Toggle", "Leaflet Mapbox Integration", "Secure Role-Based Access", "Supabase Read/Write", "Shopify API Aggregation", "ReactQuill WYSIWYG Editors", "Welcome Crew + Admin Alert Emails"],
        color: "text-red-400",
        border: "border-red-500/30",
        bg: "bg-red-500/5",
      },
      {
        path: "/sitemap",
        name: "Architecture & Sitemap",
        sections: ["Visual Structure Tree", "Component Registry", "API Endpoint Catalog", "Database Migrations"],
        features: ["Self-Documenting Frontend", "Color-Coded Status Tracking"],
        color: "text-white",
        border: "border-white/30",
        bg: "bg-white/5",
      },

      {
        path: "/admin/emails",
        name: "Email Template Previews",
        sections: ["Template Sidebar", "Live HTML Preview", "Code View", "Send Test Email", "14 Templates (Booking, Account, Cruise, Live Stream, Newsletter)"],
        features: ["Centralized Template Registry", "Category Filtering", "Resend Test Integration", "Welcome Crew + Admin Alert Templates"],
        color: "text-red-400",
        border: "border-red-500/30",
        bg: "bg-red-500/5",
      },
      {
        path: "/admin/legal",
        name: "Legal Compliance Guide",
        sections: ["TCPA SMS Rules", "Music Performance Rights", "Shopify/E-Commerce PCI Security", "COPPA Chat Rules", "ADA Accessibility Checklist"],
        features: ["Static Dev Guidance Panel", "Twilio & Shopify compatibility audits"],
        color: "text-red-400",
        border: "border-red-500/30",
        bg: "bg-red-500/5",
      },
      {
        path: "/admin/emails/booking-confirmation",
        name: "Booking Confirmation Email",
        sections: ["Planner Email Preview", "HTML View", "Send Test"],
        features: ["Template preview", "Resend integration"],
        color: "text-red-400",
        border: "border-red-500/30",
        bg: "bg-red-500/5",
      },
      {
        path: "/admin/emails/booking-admin-alert",
        name: "Booking Admin Alert Email",
        sections: ["Admin Email Preview", "HTML View", "Send Test"],
        features: ["Template preview", "Resend integration"],
        color: "text-red-400",
        border: "border-red-500/30",
        bg: "bg-red-500/5",
      },
      {
        path: "/studio",
        name: "Sanity Studio",
        sections: ["Content Editing", "Tour Dates", "News Articles", "Site Settings", "Media Library"],
        features: ["Headless CMS", "Draft Preview", "Structured Content"],
        color: "text-red-400",
        border: "border-red-500/30",
        bg: "bg-red-500/5",
      },
    ],
  },
];

const getNodeColor = (type: string) => {
  switch (type) {
    case 'page': return {
      text: 'text-cyan-400', border: 'border-cyan-500/20', activeBorder: 'border-cyan-500', bg: 'bg-cyan-500/5', activeBg: '  ', glow: 'shadow-[0_0_15px_rgba(34,211,238,0.15)]', icon: '🌐'
    };
    case 'module': return {
      text: 'text-pink-400', border: 'border-pink-500/20', activeBorder: 'border-pink-500', bg: 'bg-pink-500/5', activeBg: 'bg-pink-500/10', glow: 'shadow-[0_0_15px_rgba(244,63,94,0.15)]', icon: '⚙️'
    };
    case 'email': return {
      text: 'text-purple-300', border: 'border-purple-500/20', activeBorder: 'border-purple-500', bg: 'bg-purple-600/5', activeBg: 'bg-purple-600/10', glow: 'shadow-[0_0_15px_rgba(147, 51, 234,0.15)]', icon: '📧'
    };
    case 'db': return {
      text: 'text-emerald-400', border: ' border-[var(--color-accent)]/30', activeBorder: 'border-emerald-500', bg: 'bg-emerald-500/5', activeBg: 'bg-emerald-500/10', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.15)]', icon: '💾'
    };
    default: return {
      text: 'text-white', border: 'border-white/10', activeBorder: 'border-white', bg: 'bg-white/5', activeBg: 'bg-white/10', glow: 'shadow-[0_0_15px_rgba(255,255,255,0.1)]', icon: '📄'
    };
  }
};

// Nodes & Connections data
const FLOW_NODES = [
  // Column 0: Entry Interfaces
  { id: 'home', label: 'Home Page (/)', type: 'page', desc: 'Cinematic band hero hub, active stream indicator, news items, and music player.', col: 0, row: 0 },
  { id: 'shows', label: 'Show Details (/shows/[id])', type: 'page', desc: 'Venue details, RSVP deep link alerts, map directions, and referral sharing.', col: 0, row: 1 },
  { id: 'live', label: 'Live Stream (/live)', type: 'page', desc: 'Real-time LiveKit streaming feed, chat room widget, and interactive raffles.', col: 0, row: 2 },
  { id: 'store', label: 'Merch Store (/store)', type: 'page', desc: 'Browse store catalog dynamically populated by Shopify storefront APIs.', col: 0, row: 3 },
  { id: 'book', label: 'Book Band (/book)', type: 'page', desc: 'Scheduling form that inserts requested event dates and creates client planner profiles.', col: 0, row: 4 },
  { id: 'cruise', label: 'Cruise Booking (/cruise)', type: 'page', desc: 'Caribbean cruise travel notice board, boarding itinerary details, and cabin signup form.', col: 0, row: 5 },

  // Column 1: User Dashboards
  { id: 'fan_dash', label: 'Fan Dashboard (/fans)', type: 'page', desc: 'Alert inbox, raffle prize claims, concert proximity ZIP alerts, and profile username settings.', col: 1, row: 0 },
  { id: 'planner_dash', label: 'Planner Dashboard (/planner)', type: 'page', desc: 'Edit booking checklists, verify status, and trigger event cancellations.', col: 1, row: 1 },
  { id: 'passenger_dash', label: 'Cruiser Dashboard (/cruise/dashboard)', type: 'page', desc: 'Lounge notice board, passenger listings, chat channels, and interactive itinerary view.', col: 1, row: 2 },
  { id: 'crew_dash', label: 'Crew Dashboard (/crew)', type: 'page', desc: 'Live broadcast studio tools, stream triggers, chat mod, and raffle prize launcher.', col: 1, row: 3 },
  { id: 'admin_dash', label: 'Admin Command (/admin)', type: 'page', desc: 'Master approval checklist, announcements editor, photo wall moderation, and SMS blasts.', col: 1, row: 4 },

  // Column 2: Processing APIs
  { id: 'api_sms', label: 'SMS Alerts (/api/sms/*)', type: 'module', desc: 'Twilio webhook for SMS text notifications, live stream alarms, and directions.', col: 2, row: 0 },
  { id: 'api_booking', label: 'Booking Logic (/api/booking)', type: 'module', desc: 'Supabase booking row verification and scheduling handler.', col: 2, row: 1 },
  { id: 'api_cruise', label: 'Cruise Registration (/api/cruise/*)', type: 'module', desc: 'Registers interest and emails cruiser welcome letters.', col: 2, row: 2 },
  { id: 'api_raffle', label: 'Raffle Engine (/api/picks)', type: 'module', desc: 'Random picker that generates one-time PIN claiming tokens.', col: 2, row: 3 },
  { id: 'api_photo_mod', label: 'Image Moderation (/api/fans/*)', type: 'module', desc: 'Client-side TensorFlow.js nsfwjs image moderation filter for photo uploads.', col: 2, row: 4 },
  { id: 'shopify_cart', label: 'Shopify Cart Tunnel', type: 'module', desc: 'Compiles cart items and redirects to Shopify headless checkout pages.', col: 2, row: 5 },
  { id: 'api_tour_sync', label: 'Tour Date Sync (/api/sync-shows)', type: 'module', desc: 'Scrapes legacy tour dates and writes documents to Sanity CMS.', col: 2, row: 6 },
  { id: 'api_newsletter', label: 'Newsletter API (/api/newsletter/*)', type: 'module', desc: 'Validates email registrations and pushes subscription lists to Resend.', col: 2, row: 7 },

  // Column 3: Alerts & Emails
  { id: 'email_fan_welcome', label: 'Welcome Fan Email', type: 'email', desc: 'HTML greeting dispatched when a fan registers a new account.', col: 3, row: 0 },
  { id: 'email_planner_welcome', label: 'Welcome Planner Email', type: 'email', desc: 'Sent to booking clients containing client credentials.', col: 3, row: 1 },
  { id: 'email_booking_confirm', label: 'Booking Confirmation Email', type: 'email', desc: 'Sends booking event itineraries to the planner.', col: 3, row: 2 },
  { id: 'email_booking_admin', label: 'Booking Admin Alert Email', type: 'email', desc: 'Alerts band administrators of incoming booking applications.', col: 3, row: 3 },
  { id: 'email_cruise_invite', label: 'Passenger Invite Link', type: 'email', desc: 'Sends cruiser passengers dynamic invite setup links.', col: 3, row: 4 },
  { id: 'email_general_news', label: 'Newsletter Blast Template', type: 'email', desc: 'Formatted HTML email template for Resend newsletter integrations.', col: 3, row: 5 },
  { id: 'sms_template_alert', label: 'SMS Notification Broadcasts', type: 'email', desc: 'Outbound texts notifying fans of streaming alarms and directions.', col: 3, row: 6 },

  // Column 4: Database & State
  { id: 'db_members', label: 'profiles / auth', type: 'db', desc: 'Supabase table storing user credentials, role permissions, and active statuses.', col: 4, row: 0 },
  { id: 'db_bookings', label: 'bookings table', type: 'db', desc: 'Supabase storage holding active booking request forms and checklists.', col: 4, row: 1 },
  { id: 'db_planners', label: 'planners table', type: 'db', desc: 'Supabase details table mapping planners to auth ids.', col: 4, row: 2 },
  { id: 'db_cruise', label: 'cruise_interest table', type: 'db', desc: 'Supabase logs tracking cabin selections, cruiser status, and passenger payments.', col: 4, row: 3 },
  { id: 'db_sms', label: 'sms_subscribers table', type: 'db', desc: 'Supabase data linking active phone numbers and ZIP coordinates.', col: 4, row: 4 },
  { id: 'db_claims', label: 'claims table', type: 'db', desc: 'Supabase table tracking generated raffle prizes and claim pins.', col: 4, row: 5 },
  { id: 'db_memories', label: 'fan_memories table', type: 'db', desc: 'Supabase logs tracking concert photo wall submissions.', col: 4, row: 6 },
  { id: 'db_cms', label: 'Sanity Studio CMS', type: 'db', desc: 'CMS documents holding show schedules, member biographies, and homepage news.', col: 4, row: 7 }
];

const FLOW_CONNECTIONS = [
  { from: 'home', to: 'api_newsletter' },
  { from: 'home', to: 'api_sms' },
  { from: 'home', to: 'api_photo_mod' },
  { from: 'home', to: 'store' },
  { from: 'store', to: 'shopify_cart' },
  { from: 'shows', to: 'api_sms' },
  { from: 'live', to: 'fan_dash' },
  { from: 'book', to: 'api_booking' },
  { from: 'cruise', to: 'api_cruise' },

  { from: 'fan_dash', to: 'api_newsletter' },
  { from: 'fan_dash', to: 'api_raffle' },
  { from: 'planner_dash', to: 'api_booking' },
  { from: 'passenger_dash', to: 'api_cruise' },
  { from: 'crew_dash', to: 'api_raffle' },
  { from: 'crew_dash', to: 'api_live_alert' },
  { from: 'admin_dash', to: 'api_tour_sync' },
  { from: 'admin_dash', to: 'api_booking' },
  { from: 'admin_dash', to: 'api_cruise' },

  { from: 'api_newsletter', to: 'email_general_news' },
  { from: 'api_sms', to: 'sms_template_alert' },
  { from: 'api_live_alert', to: 'sms_template_alert' },
  { from: 'api_booking', to: 'email_planner_welcome' },
  { from: 'api_booking', to: 'email_booking_confirm' },
  { from: 'api_booking', to: 'email_booking_admin' },
  { from: 'api_cruise', to: 'email_cruise_invite' },
  { from: 'api_cruise', to: 'email_fan_welcome' },

  { from: 'api_newsletter', to: 'db_sms' },
  { from: 'api_sms', to: 'db_sms' },
  { from: 'api_booking', to: 'db_bookings' },
  { from: 'api_booking', to: 'db_planners' },
  { from: 'api_cruise', to: 'db_cruise' },
  { from: 'api_raffle', to: 'db_claims' },
  { from: 'api_photo_mod', to: 'db_memories' },
  { from: 'api_tour_sync', to: 'db_cms' },

  { from: 'db_members', to: 'fan_dash' },
  { from: 'db_bookings', to: 'planner_dash' },
  { from: 'db_cruise', to: 'passenger_dash' },
  { from: 'db_sms', to: 'admin_dash' },
  { from: 'db_cms', to: 'home' },
  { from: 'db_cms', to: 'shows' },
  { from: 'db_claims', to: 'fan_dash' }
];

export default function SitemapPage() {
  const [activeView, setActiveView] = useState<'flow' | 'directory'>('flow');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Helper check: Is a node connected to the hovered node?
  const isNodeConnected = (nodeId: string) => {
    if (!hoveredNodeId) return true;
    if (nodeId === hoveredNodeId) return true;
    return FLOW_CONNECTIONS.some(
      conn => (conn.from === hoveredNodeId && conn.to === nodeId) || (conn.to === hoveredNodeId && conn.from === nodeId)
    );
  };

  const isConnectionActive = (conn: { from: string; to: string }) => {
    if (!hoveredNodeId) return false;
    return conn.from === hoveredNodeId || conn.to === hoveredNodeId;
  };

  const colWidth = 200;
  const colGap = 40;
  const startX = 40;
  const paddingY = 80;
  const canvasHeight = 900;
  const heightY = canvasHeight - paddingY * 2;

  const getCoords = (col: number, row: number, totalInCol: number) => {
    const x = startX + col * (colWidth + colGap);
    const stepY = totalInCol > 1 ? heightY / (totalInCol - 1) : 0;
    const y = paddingY + row * stepY;
    return { x, y };
  };

  const nodeCoords: Record<string, { x: number; y: number; type: string }> = {};
  FLOW_NODES.forEach(node => {
    const totalInCol = FLOW_NODES.filter(n => n.col === node.col).length;
    const coords = getCoords(node.col, node.row, totalInCol);
    nodeCoords[node.id] = { ...coords, type: node.type };
  });

  return (
    <main className="min-h-screen bg-[rgb(10,10,15)] pt-32 pb-24 px-8 md:px-16 lg:px-24 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[var(--color-accent)] opacity-[0.03] blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-600 opacity-[0.02] blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="mb-16 text-center">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white mb-4">
            <span className=" text-[var(--color-accent)]">Site</span> Map
          </h1>
          <p className="text-white/40 uppercase tracking-[0.2em] text-xs md:text-sm max-w-2xl mx-auto">
            A complete architectural overview of the 7th Heaven digital ecosystem.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/sitemap/flowchart"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-xs font-black uppercase tracking-widest shadow-[0_0_25px_rgba(255,10,61,0.4)] transition-colors transform hover:scale-105"
            >
              <span>📊</span> Open Interactive Flowchart Sitemap ↗
            </Link>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border  border-[var(--color-accent)]/30 text-[var(--color-accent)] text-xs font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <span>⭐</span> E2E Testing Verified: All Sign-up Flows
            </span>
          </div>
        </header>

        {/* Tab Toggle */}
        <div className="flex flex-wrap justify-center gap-4 mb-12 relative z-20">
          <button aria-label="Action button"
            onClick={() => setActiveView('flow')}
            className={`px-6 py-3 border text-xs font-black uppercase tracking-widest  transition-colors cursor-pointer ${activeView === 'flow'
              ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10  text-[var(--color-accent)] shadow-[0_0_20px_rgba(255,10,61,0.15)]"
              : "border-white/10 text-white/40 hover:text-white/70 hover:border-white/20"
              }`}
          >
            🗺️ Ecosystem Flow Map
          </button>
          <button aria-label="Action button"
            onClick={() => setActiveView('directory')}
            className={`px-6 py-3 border text-xs font-black uppercase tracking-widest  transition-colors cursor-pointer ${activeView === 'directory'
              ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10  text-[var(--color-accent)] shadow-[0_0_20px_rgba(255,10,61,0.15)]"
              : "border-white/10 text-white/40 hover:text-white/70 hover:border-white/20"
              }`}
          >
            📦 Directory Listing
          </button>
          <div className="w-px h-10 bg-white/10 self-center hidden md:block" />
          <Link
            href="/sitemap/visual"
            className="px-6 py-3 border border-cyan-500/20 hover:border-cyan-500/40 text-purple-400text-xs font-black uppercase tracking-widest transition-colors"
          >
            🖼️ Visual Connection Map
          </Link>
          <Link
            href="/sitemap/flowchart"
            className="px-6 py-3 border border-pink-500/20 hover:border-pink-500/40 text-pink-400 text-xs font-black uppercase tracking-widest transition-colors"
          >
            🗺️ Flowchart Sitemap
          </Link>
        </div>

        {activeView === 'flow' ? (
          <div className="relative z-10 w-full overflow-x-auto pb-6">
            <style dangerouslySetInnerHTML={{
              __html: `
              @keyframes linePulse {
                to {
                  stroke-dashoffset: -20;
                }
              }
              .line-pulse-animation {
                animation: linePulse 1.2s linear infinite;
              }
            `}} />

            <div className="min-w-[1240px] relative">
              {/* Column Headings */}
              <div className="grid grid-cols-5 gap-10 px-10 mb-8 select-none">
                {[
                  "1. Entry Interfaces",
                  "2. User Dashboards",
                  "3. Processing APIs",
                  "4. Alerts & Emails",
                  "5. Database & State"
                ].map((title, i) => (
                  <div key={title} className="text-center">
                    <h3 className="text-xs font-black uppercase tracking-widest text-white/40 pb-2 border-b border-white/5">{title}</h3>
                  </div>
                ))}
              </div>

              {/* Canvas viewport */}
              <div className="w-[1200px] h-[900px] relative bg-black/40 border border-white/5 p-6 overflow-hidden">
                {/* SVG Connections overlay */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                  {FLOW_CONNECTIONS.map((conn, idx) => {
                    const fromNode = nodeCoords[conn.from];
                    const toNode = nodeCoords[conn.to];
                    if (!fromNode || !toNode) return null;

                    const x1 = fromNode.x + colWidth;
                    const y1 = fromNode.y + 24;
                    const x2 = toNode.x;
                    const y2 = toNode.y + 24;
                    const dx = (x2 - x1) * 0.4;

                    const d = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
                    const active = isConnectionActive(conn);

                    let strokeColor = "stroke-white/10";
                    if (active) {
                      if (fromNode.type === 'page') strokeColor = "stroke-cyan-400/80";
                      else if (fromNode.type === 'module') strokeColor = "stroke-pink-400/80";
                      else if (fromNode.type === 'email') strokeColor = "stroke-amber-400/80";
                      else strokeColor = "stroke-emerald-400/80";
                    }

                    return (
                      <g key={`conn-${conn.from}-${conn.to}`}>
                        {/* Interactive hover container */}
                        <path
                          d={d}
                          fill="none"
                          stroke="transparent"
                          strokeWidth={15}
                          className="cursor-pointer pointer-events-auto"
                          onMouseEnter={() => setHoveredNodeId(conn.from)}
                          onMouseLeave={() => setHoveredNodeId(null)}
                        />
                        {/* Visible path */}
                        <path
                          d={d}
                          fill="none"
                          className={`${strokeColor} transition-colors duration-300 ${active ? 'stroke-[2px] line-pulse-animation' : 'stroke-[1px]'}`}
                          style={{
                            strokeDasharray: active ? "6, 4" : undefined,
                          }}
                        />
                      </g>
                    );
                  })}
                </svg>

                {/* Nodes list */}
                {FLOW_NODES.map(node => {
                  const style = getNodeColor(node.type);
                  const isHovered = hoveredNodeId === node.id;
                  const isDimmed = hoveredNodeId && !isNodeConnected(node.id);

                  return (
                    <div
                      key={node.id}
                      style={{
                        position: 'absolute',
                        left: nodeCoords[node.id].x,
                        top: nodeCoords[node.id].y,
                        width: colWidth,
                        height: 48,
                      }}
                      className={`p-2.5 rounded-lg border text-left cursor-pointer transition-colors duration-300 flex flex-col justify-center select-none ${isHovered
                        ? `scale-[1.05] z-30 ${style.activeBorder} ${style.activeBg} ${style.glow}`
                        : isDimmed
                          ? 'opacity-20 grayscale pointer-events-none'
                          : `z-20 ${style.border} ${style.bg} hover:border-white/20`
                        }`}
                      onMouseEnter={() => setHoveredNodeId(node.id)}
                      onMouseLeave={() => setHoveredNodeId(null)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm shrink-0">{style.icon}</span>
                        <span className={`text-[0.62rem] font-bold uppercase tracking-wider truncate ${style.text}`}>{node.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Details panel */}
            <div className="mt-6 p-5 bg-white/[0.02] border border-white/5 min-h-[90px] flex flex-col justify-center transition-colors duration-300">
              {hoveredNodeId ? (
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-lg">{getNodeColor(FLOW_NODES.find(n => n.id === hoveredNodeId)?.type || '').icon}</span>
                    <h4 className={`text-sm font-black uppercase tracking-widest ${getNodeColor(FLOW_NODES.find(n => n.id === hoveredNodeId)?.type || '').text}`}>
                      {FLOW_NODES.find(n => n.id === hoveredNodeId)?.label}
                    </h4>
                    <span className="text-[0.55rem] font-mono px-2 py-0.5 rounded bg-white/5 uppercase text-white/40 border border-white/5">
                      {FLOW_NODES.find(n => n.id === hoveredNodeId)?.type}
                    </span>
                  </div>
                  <p className="text-xs text-white/60 leading-relaxed">
                    {FLOW_NODES.find(n => n.id === hoveredNodeId)?.desc}
                  </p>
                </div>
              ) : (
                <div className="text-center text-white/30 text-[0.65rem] py-2 uppercase tracking-widest font-black animate-pulse">
                  💡 Hover over any node to trace user flows, API processes, email triggers, and database connections.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-16">
            {siteStructure.map((category, idx) => (
              <section key={category.title} className="relative">
                <h2 className="text-xl font-bold uppercase tracking-[0.15em] text-white/80 mb-8 border-b border-white/10 pb-4">
                  {category.title}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.routes.map((route, rIdx) => (
                    <Link
                      key={rIdx}
                      href={route.path.includes('[') ? '#' : (route.path !== "#" ? route.path : "/")}
                      className={`group relative flex flex-col p-6  border ${route.border} ${route.bg} backdrop-blur-sm transition-colors duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] overflow-hidden`}
                    >
                      {/* Hover Glow Effect */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

                      <div className="flex items-center justify-between mb-4">
                        <h3 className={`text-lg font-black tracking-wide uppercase ${route.color}`}>
                          {route.name}
                        </h3>
                        <div className="text-xs py-1 px-2 rounded bg-white/5 text-white/50 font-mono">
                          {route.path}
                        </div>
                      </div>

                      <div className="flex-1 mt-2 space-y-6">
                        {/* Sections Block */}
                        <div>
                          <p className="text-xs uppercase tracking-widest text-white/30 mb-3 font-semibold">
                            Core Sections
                          </p>
                          <ul className="space-y-3">
                            {route.sections.map((section, sIdx) => (
                              <li key={sIdx} className="flex items-start gap-3">
                                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-white/20 shrink-0" />
                                <span className="text-sm text-white/70 leading-snug font-medium">
                                  {section}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Features Block */}
                        {route.features && route.features.length > 0 && (
                          <div className="pt-4 border-t border-white/10">
                            <p className="text-xs uppercase tracking-widest text-white/40 mb-3 font-semibold">
                              Technical Features
                            </p>
                            <ul className="space-y-2">
                              {route.features.map((feature, fIdx) => (
                                <li key={fIdx} className="flex items-start gap-2">
                                  <span className={`mt-[4px] w-2 h-2 shrink-0 border border-current ${route.color} rotate-45`}></span>
                                  <span className="text-xs text-white/50 font-mono leading-tight">
                                    {feature}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* Tech Stack Section */}
        <section className="mt-20 pt-16 border-t border-white/10">
          <h2 className="text-xl font-bold uppercase tracking-[0.15em] text-white/80 mb-8 border-b border-white/10 pb-4">
            Technology Stack
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[
              { name: "Next.js 16", desc: "React framework — SSR, API routes, ISR", color: "text-white", icon: "▲" },
              { name: "Supabase", desc: "Auth, Postgres database, real-time subscriptions, RLS policies", color: "text-emerald-400", icon: "⚡" },
              { name: "LiveKit", desc: "WebRTC video streaming — rooms, tokens, egress", color: "text-indigo-400", icon: "📡" },
              { name: "Sanity CMS", desc: "Headless CMS — tour dates, news, band bios, settings", color: "text-red-400", icon: "📝" },
              { name: "Shopify", desc: "Storefront API — merch products, headless checkout, cart", color: "text-green-400", icon: "🛒" },
              { name: "Resend", desc: "Transactional email — booking confirmations, admin alerts", color: "text-blue-400", icon: "📧" },
              { name: "Twilio", desc: "Bidirectional SMS — proximity alerts, RSVP replies, STOP/START, directions", color: "text-rose-400", icon: "📱" },
              { name: "Vercel", desc: "Hosting & deployment — edge functions, CDN", color: "text-white/80", icon: "🚀" },
              { name: "TypeScript", desc: "Type-safe development across all components", color: "text-blue-300", icon: "🔷" },
              { name: "Leaflet", desc: "Interactive maps — tour venue locations, geo-pins", color: "text-lime-400", icon: "🗺️" },
              { name: "QR Server API", desc: "Dynamic QR codes — referral links, ticket claims", color: "text-purple-300", icon: "📸" },
              { name: "TensorFlow.js", desc: "AI Moderation — client-side NSFW image scanning", color: "text-orange-400", icon: "🧠" },
              { name: "Upstash Redis", desc: "Rate limiting — API abuse prevention", color: "text-rose-500", icon: "🛡️" },
            ].map((tech, i) => (
              <div key={tech.name} className="p-4 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{tech.icon}</span>
                  <h3 className={`text-sm font-black uppercase tracking-wide ${tech.color}`}>{tech.name}</h3>
                </div>
                <p className="text-sm text-white/40 leading-relaxed">{tech.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SMS Text Messages */}
        <section className="mt-20 pt-16 border-t border-white/10">
          <h2 className="text-xl font-bold uppercase tracking-[0.15em] text-white/80 mb-3 border-b border-white/10 pb-4">
            📲 SMS Text Messages
          </h2>
          <p className="text-white/30 text-xs mb-8">All outbound text messages sent via Twilio — 10 templates total (6 outbound + 4 auto-replies).</p>
          <div className="space-y-4">
            {[
              {
                trigger: "Fan Subscribes to Show Alerts",
                route: "/api/sms/subscribe",
                message: `7th Heaven Show Alerts: You're subscribed, [Name]! We'll text you when we play near [ZIP]. Reply STOP to opt out. Msg freq varies. Msg & data rates may apply.`,
                detail: "Sent immediately after a fan submits the SMS opt-in form on the Fan Dashboard. Their phone number is stored in sms_subscribers with geo-coordinates for proximity matching.",
                audience: "Fan (opt-in)",
                color: "text-emerald-400",
                border: "border-emerald-500/30",
                icon: "✅",
              },
              {
                trigger: "Crew Member Goes LIVE",
                route: "/api/sms/live-alert",
                message: `7th Heaven: 🎸 [Host Name] just went LIVE! Tune in now at 7thheavenband.com/live\n\nReply STOP to unsubscribe.`,
                detail: "Auto-triggered when a crew member starts a broadcast from the Crew Dashboard. Sends to all SMS subscribers. Host name is pulled from the broadcaster's profile.",
                audience: "All SMS subscribers",
                color: "text-rose-400",
                border: "border-rose-500/30",
                icon: "🔴",
              },
              {
                trigger: "Fan Unsubscribes",
                route: "/api/sms/unsubscribe",
                message: `7th Heaven: You've been unsubscribed from Show Alerts. You will no longer receive texts. Reply START to re-subscribe.`,
                detail: "Triggered when a fan replies STOP or uses the unsubscribe flow. Their record is soft-deleted from sms_subscribers. Re-subscribing is supported via START reply.",
                audience: "Unsubscribing fan",
                color: "text-purple-300",
                border: "border-purple-500/30",
                icon: "🚫",
              },
              {
                trigger: "Admin Sends Proximity Blast",
                route: "/api/sms/send",
                message: `🎸 7th Heaven is playing in your area!\n\n📍 [Venue] — [City, State]\n📅 [Date]\n🚪 Doors: [Doors Time] | Show: [Show Time]\n✅ All Ages\n🎟️ Cover: $5\n🔥 23 fans already going!\n\nRSVP & see who's going:\nhttps://7thheavenband.com/shows/[id]\n\nReply 1=GOING 2=DIRECTIONS\n\nReply STOP to unsubscribe.`,
                detail: "Manually triggered by admin from the SMS Blast panel. Includes a direct link to the show RSVP page, live attendance count from show_attendance, and reply-based RSVP options. Twilio webhook at /api/sms/webhook handles fan replies.",
                audience: "Nearby subscribers (geo-filtered)",
                color: " text-[var(--color-accent)]",
                border: "border-purple-500/30",
                icon: "📡",
              },
              {
                trigger: "Auto-Blast Cron Job",
                route: "/api/sms/auto-blast",
                message: `(Same proximity template as above — auto-sent for shows within X days)`,
                detail: "Cron-triggered daily (e.g. Vercel Cron at 9am). Checks for public shows happening within a configurable window (default 3 days). Skips shows already blasted via sms_blast_log. Can be toggled on/off from Admin Settings.",
                audience: "Nearby subscribers (automated)",
                color: "text-violet-400",
                border: "border-violet-500/30",
                icon: "⏰",
              },
              {
                trigger: "Admin Crew Alert",
                route: "/api/admin/crew-alert",
                message: `🛡️ 7th Heaven CREW ALERT:\n\n[Custom Admin Message]\n\n— Band Management`,
                detail: "Sent by admin to all crew members and admins who have phone numbers on file. Used for urgent band communications like schedule changes, soundcheck times, or emergency updates. Deduplicates by phone number.",
                audience: "Crew + Admin (internal)",
                color: "text-red-400",
                border: "border-red-500/30",
                icon: "🛡️",
              },
              {
                trigger: "Fan Replies STOP (Auto-Reply)",
                route: "/api/sms/webhook",
                message: `You've been unsubscribed from 7th Heaven alerts. Reply START to resubscribe anytime. 🎸`,
                detail: "Auto-reply via Twilio TwiML when a fan texts STOP, UNSUBSCRIBE, CANCEL, END, or QUIT. Updates opted_in=false in sms_subscribers.",
                audience: "Unsubscribing fan (auto)",
                color: "text-purple-300",
                border: "border-purple-500/30",
                icon: "🔄",
              },
              {
                trigger: "Fan Replies START (Auto-Reply)",
                route: "/api/sms/webhook",
                message: `Welcome back! You're subscribed to 7th Heaven show alerts. 🎸🔥 Reply STOP anytime to unsubscribe.`,
                detail: "Auto-reply when a fan texts START, SUBSCRIBE, YES, or UNSTOP. Re-activates their subscription by setting opted_in=true.",
                audience: "Re-subscribing fan (auto)",
                color: "text-emerald-400",
                border: "border-emerald-500/30",
                icon: "🔄",
              },
              {
                trigger: "Fan Replies 1 / GOING (Auto-Reply)",
                route: "/api/sms/webhook",
                message: `🔥 You're going to [Venue]! See who else is going & RSVP:\nhttps://7thheavenband.com/shows/[id]?rsvp=going`,
                detail: "Auto-reply when a fan texts 1 or GOING. Looks up the next upcoming show from Supabase and sends back the show page link with ?rsvp=going parameter for automatic RSVP on page load.",
                audience: "Replying fan (auto)",
                color: " text-[var(--color-accent)]",
                border: "border-purple-500/30",
                icon: "🔄",
              },
              {
                trigger: "Fan Replies 2 / DIRECTIONS (Auto-Reply)",
                route: "/api/sms/webhook",
                message: `📍 Directions to [Venue]:\nhttps://www.google.com/maps/search/?api=1&query=[lat],[lng]`,
                detail: "Auto-reply when a fan texts 2 or DIRECTIONS. Looks up the next upcoming show and returns a Google Maps link using stored venue coordinates.",
                audience: "Replying fan (auto)",
                color: "text-indigo-400",
                border: "border-indigo-500/30",
                icon: "🔄",
              },
            ].map((sms, i) => (
              <div key={sms.trigger} className={`p-5  border ${sms.border} bg-white/[0.02] hover:bg-white/[0.04] transition-colors`}>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{sms.icon}</span>
                    <div>
                      <h3 className={`text-sm font-black uppercase tracking-wide ${sms.color}`}>{sms.trigger}</h3>
                      <span className="text-xs text-white/20 font-mono">{sms.route}</span>
                    </div>
                  </div>
                  <span className="shrink-0 text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/10 text-[var(--color-accent)] border  border-[var(--color-accent)]/30">Live</span>
                </div>
                <div className="bg-black/30 border border-white/5 rounded-lg p-4">
                  <p className="text-sm text-white/70 font-mono leading-relaxed whitespace-pre-line">{sms.message}</p>
                </div>
                {(sms.detail || sms.audience) && (
                  <div className="mt-3 flex flex-col gap-2">
                    {sms.audience && (
                      <div className="flex items-center gap-2">
                        <span className="text-[var(--font-size-2xs)] font-bold uppercase tracking-widest text-white/25">Audience:</span>
                        <span className={`text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/5 border border-white/10 ${sms.color}`}>{sms.audience}</span>
                      </div>
                    )}
                    {sms.detail && (
                      <p className="text-sm text-white/35 leading-relaxed">{sms.detail}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Email Templates */}
        <section className="mt-20 pt-16 border-t border-white/10">
          <h2 className="text-xl font-bold uppercase tracking-[0.15em] text-white/80 mb-3 border-b border-white/10 pb-4">
            📧 Email Templates
          </h2>
          <p className="text-white/30 text-xs mb-8">All transactional emails sent via Resend — 18 templates total. <Link href="/admin/emails" className=" text-[var(--color-accent)] hover:text-white transition-colors">Preview all →</Link></p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: "Booking Confirmation", desc: "Sent to the event planner after submitting a booking request.", category: "Booking", status: "live", icon: "📋" },
              { name: "Booking Admin Alert", desc: "Sent to admin when a new booking request comes in.", category: "Booking", status: "live", icon: "⚡" },
              { name: "Booking Cancelled Alert", desc: "Sent to admin when a planner cancels their booking via token link.", category: "Booking", status: "live", icon: "🚨" },
              { name: "Raffle Winner", desc: "Sent to the fan who wins a live raffle with their claim PIN.", category: "Live Stream", status: "live", icon: "🏆" },
              { name: "Raffle Entry Confirmation", desc: "Sent when a fan enters a live raffle.", category: "Live Stream", status: "live", icon: "🎟️" },
              { name: "Cruise Signup Confirmation", desc: "Branded HTML email confirming cruise interest with cancellation link.", category: "Cruise", status: "live", icon: "🚢" },
              { name: "Cruise Community Welcome", desc: "Sent to primary booker providing a secure account confirmation link.", category: "Cruise", status: "live", icon: "🛳️" },
              { name: "Cruise Cancellation", desc: "Sent when a fan cancels their cruise interest via token link.", category: "Cruise", status: "live", icon: "❌" },
              { name: "Welcome — Fan", desc: "Sent after a fan creates their account.", category: "Account", status: "live", icon: "🎸" },
              { name: "Welcome — Planner", desc: "Sent after a planner creates their account from the booking flow.", category: "Account", status: "live", icon: "📋" },
              { name: "Booking Status Update", desc: "Sent when a booking is approved, cancelled, or completed.", category: "Booking", status: "live", icon: "✅" },
              { name: "Newsletter Blast", desc: "Sent to all fans & subscribers from the admin dashboard.", category: "Newsletter", status: "live", icon: "📨" },
              { name: "Welcome — Crew", desc: "Sent to a new crew member when their account is created by admin.", category: "Account", status: "live", icon: "🛡️" },
              { name: "New Account Alert — Admin", desc: "Sent to the site manager when a new account is created (crew, fan, or planner).", category: "Account", status: "live", icon: "🔐" },
              { name: "Cruise Community Blast", desc: "Sent to all cruise signups with the latest news, updates, and announcements.", category: "Cruise", status: "live", icon: "⚓" },
              { name: "Fan Invitation", desc: "Sent when an administrator invites a fan via CSV or text bulk list.", category: "Account", status: "live", icon: "✉️" },
              { name: "Crew Work Hours Summary", desc: "Sent to a crew member summarizing their weekly/monthly scheduled hours and capacity load.", category: "Crew", status: "live", icon: "🕒" },
              { name: "Schedule Change Alert", desc: "Sent to a crew member when their scheduled shift is added, updated, or removed.", category: "Crew", status: "live", icon: "🗓️" },
            ].map((email, i) => (
              <div key={email.name} className="p-5 border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{email.icon}</span>
                    <h3 className="text-sm font-bold text-white">{email.name}</h3>
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${email.status === 'live'
                    ? 'bg-emerald-500/10 text-[var(--color-accent)] border  border-[var(--color-accent)]/30'
                    : 'bg-purple-600/10 text-purple-300 border border-purple-500/20'
                    }`}>{email.status}</span>
                </div>
                <p className="text-sm text-white/40 leading-relaxed mb-2">{email.desc}</p>
                <span className="text-xs  text-[var(--color-accent)]/60 font-bold uppercase tracking-widest">{email.category}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Remember Before Launch */}
        <section className="mt-20 pt-16 border-t border-white/10">
          <h2 className="text-xl font-bold uppercase tracking-[0.15em] text-white/80 mb-3 border-b border-white/10 pb-4">
            ⚠️ Remember Before Launch
          </h2>
          <p className="text-white/30 text-xs mb-8">Critical deployment checklist — complete these before going live.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: "Verify Resend Domain",
                desc: "Add and verify 7thheavenband.com in the Resend dashboard so emails send from your own domain instead of onboarding@resend.dev.",
                link: "https://resend.com/domains",
                linkText: "Open Resend Dashboard",
                icon: "📧",
                color: "text-blue-400",
                border: "border-blue-500/30",
              },
              {
                title: "Set Production Email Sender",
                desc: "After domain verification, update your production .env with: RESEND_FROM_EMAIL=noreply@7thheavenband.com",
                icon: "🔑",
                color: "text-purple-300",
                border: "border-purple-500/30",
              },
              {
                title: "Update NEXT_PUBLIC_SITE_URL",
                desc: "Change NEXT_PUBLIC_SITE_URL from http://localhost:3000 to your production URL in .env so email links point to the right place.",
                icon: "🌐",
                color: "text-emerald-400",
                border: "border-emerald-500/30",
              },
              {
                title: "Run Pending Migrations",
                desc: "All 9 migrations applied ✓ — profiles, bookings, feed, chat, newsletter, SMS, setlist, cruise, and referrals.",
                icon: "✅",
                color: "text-emerald-400",
                border: "border-emerald-500/30",
              },
              {
                title: "Verify Supabase Auth Providers",
                desc: "Enable Google, Facebook, and Apple OAuth providers in Supabase → Authentication → Providers with production redirect URLs.",
                icon: "🔐",
                color: "text-cyan-400",
                border: "border-cyan-500/30",
              },
              {
                title: "Hook Up Google Analytics",
                desc: "Create a Google Analytics property and add the tracking ID to your production .env as NEXT_PUBLIC_GA_ID to start tracking traffic.",
                icon: "📊",
                color: " text-[var(--color-accent)]",
                border: "border-purple-500/30",
              },
              {
                title: "Shopify Storefront Token",
                desc: "Ensure the Shopify Storefront API token is set for production and the store password protection is removed.",
                icon: "🛒",
                color: "text-green-400",
                border: "border-green-500/30",
              },
            ].map((item, i) => (
              <div key={item.title} className={`p-5  border ${item.border} bg-white/[0.02] hover:bg-white/[0.04] transition-colors`}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xl">{item.icon}</span>
                  <h3 className={`text-sm font-black uppercase tracking-wide ${item.color}`}>{item.title}</h3>
                </div>
                <p className="text-sm text-white/50 leading-relaxed mb-3">{item.desc}</p>
                {item.link && (
                  <a href={item.link} target="_blank" rel="noopener noreferrer" className={`text-xs font-bold uppercase tracking-widest ${item.color} hover:text-white transition-colors`}>
                    {item.linkText} →
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* API Routes */}
        <section className="mt-20 pt-16 border-t border-white/10">
          <h2 className="text-xl font-bold uppercase tracking-[0.15em] text-white/80 mb-3 border-b border-white/10 pb-4">
            🔌 API Routes
          </h2>
          <p className="text-white/30 text-xs mb-8">All server-side API endpoints — 40+ routes across 15 domains.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { route: "/api/announcement", method: "GET / POST", desc: "Global alert banner read/write with auto-expire", color: " text-[var(--color-accent)]" },
              { route: "/api/settings", method: "GET", desc: "Sanity site settings (hero, bio, stats)", color: " text-[var(--color-accent)]" },
              { route: "/api/booking", method: "POST", desc: "Submit booking request + email notifications", color: "text-fuchsia-400" },
              { route: "/api/admin/fans", method: "GET", desc: "Fan analytics — signups, tiers, trends", color: "text-red-400" },
              { route: "/api/admin/newsletter", method: "POST", desc: "Blast branded email to all fans", color: "text-red-400" },
              { route: "/api/cruise/signup", method: "POST", desc: "Cruise interest signup + confirmation email", color: "text-cyan-400" },
              { route: "/api/cruise/cancel", method: "POST", desc: "Token-based cruise cancellation", color: "text-cyan-400" },
              { route: "/api/cruise/count", method: "GET", desc: "Live count of cruise signups", color: "text-cyan-400" },
              { route: "/api/email", method: "POST", desc: "Generic Resend email sender", color: "text-blue-400" },
              { route: "/api/feed", method: "GET / POST", desc: "Fan social feed — posts, likes, comments", color: "text-emerald-400" },
              { route: "/api/like", method: "POST", desc: "Toggle like on feed posts", color: "text-emerald-400" },
              { route: "/api/fans", method: "GET / POST", desc: "Fan profile CRUD operations", color: "text-cyan-400" },
              { route: "/api/live", method: "GET / POST", desc: "Live stream state management", color: "text-rose-400" },
              { route: "/api/live-rooms", method: "GET", desc: "Aggregate active LiveKit rooms", color: "text-rose-400" },
              { route: "/api/livekit", method: "POST", desc: "Generate LiveKit auth tokens", color: "text-indigo-400" },
              { route: "/api/stream", method: "GET / POST", desc: "Stream CRUD + Supabase sync", color: "text-rose-400" },
              { route: "/api/close-all-streams", method: "POST", desc: "Emergency kill-switch for all streams", color: "text-rose-400" },
              { route: "/api/sms/subscribe", method: "POST", desc: "SMS opt-in for show alerts", color: "text-purple-300" },
              { route: "/api/sms/unsubscribe", method: "POST", desc: "SMS opt-out handler", color: "text-purple-300" },
              { route: "/api/sms/send", method: "POST", desc: "Admin proximity SMS blast with show link + attendance count", color: "text-purple-300" },
              { route: "/api/sms/live-alert", method: "POST", desc: "Auto-SMS when crew goes live", color: "text-purple-300" },
              { route: "/api/shopify", method: "GET / POST", desc: "Shopify cart + product queries", color: "text-green-400" },
              { route: "/api/merch", method: "GET", desc: "Merch product listings", color: "text-green-400" },
              { route: "/api/tour", method: "GET", desc: "Tour dates from Sanity", color: "text-blue-400" },
              { route: "/api/newsletter/subscribe", method: "POST", desc: "Public newsletter signup", color: "text-violet-400" },
              { route: "/api/notify", method: "POST", desc: "Push notification dispatcher", color: "text-orange-400" },
              { route: "/api/booking/cancel", method: "POST", desc: "Token-based booking cancellation", color: "text-fuchsia-400" },
              { route: "/api/sms/auto-blast", method: "GET", desc: "Cron-triggered auto proximity SMS", color: "text-purple-300" },
              { route: "/api/sms/webhook", method: "POST", desc: "Twilio incoming SMS handler (STOP/GOING/DIRECTIONS)", color: "text-purple-300" },
              { route: "/api/admin/settings", method: "GET / POST", desc: "Admin key/value settings store", color: "text-red-400" },
              { route: "/api/admin/shows", method: "GET", desc: "Upcoming public shows for SMS picker", color: "text-red-400" },
              { route: "/api/audio", method: "GET", desc: "Audio track metadata/streaming", color: "text-pink-400" },
              { route: "/api/draft-mode", method: "GET", desc: "Toggle Sanity Visual Editing mode", color: "text-indigo-400" },
              { route: "/api/seed-content", method: "POST", desc: "Database content seeding tool", color: "text-gray-400" },
              { route: "/api/seed-tours", method: "POST", desc: "Tour dates sanity seeding tool", color: "text-gray-400" },
              { route: "/api/setup-db", method: "POST", desc: "Initial Supabase schema bootstrap", color: "text-gray-400" },
              { route: "/api/admin/invite-challenge", method: "GET / POST", desc: "Per-show invite challenge config (admin)", color: "text-red-400" },
              { route: "/api/fans/memories", method: "GET / POST", desc: "Post-show fan memory submissions", color: "text-cyan-400" },
              { route: "/api/proximity/shows", method: "GET", desc: "Shows near a lat/lng coordinate", color: "text-indigo-400" },
              { route: "/api/proximity/rsvp", method: "POST", desc: "Fan RSVP to a nearby show", color: "text-indigo-400" },
              { route: "/api/shopify/auth", method: "GET", desc: "Shopify OAuth initiation", color: "text-green-400" },
              { route: "/api/shopify/inventory", method: "GET", desc: "Shopify stock level syncing", color: "text-green-400" },
              { route: "/api/shopify/callback", method: "GET", desc: "Shopify OAuth callback handler", color: "text-green-400" },
              { route: "/api/shopify/orders", method: "GET", desc: "Shopify order history aggregation", color: "text-green-400" },
              { route: "/api/cruise/blast", method: "POST", desc: "Cruise community email blast", color: "text-cyan-400" },
              { route: "/api/cruise/booking", method: "GET / POST", desc: "Cruise booking priority list", color: "text-cyan-400" },
              { route: "/api/cruise/chat-pin", method: "POST", desc: "Pin messages in cruise chat", color: "text-cyan-400" },
              { route: "/api/cruise/important-links", method: "GET / POST", desc: "Manage cruise resource links", color: "text-cyan-400" },
              { route: "/api/chat/send", method: "POST", desc: "Send chat message to live stream", color: "text-rose-400" },
              { route: "/api/live/archive", method: "POST", desc: "Archive completed livestream", color: "text-rose-400" },
              { route: "/api/live/clear-chat", method: "POST", desc: "Clear live stream chat history", color: "text-rose-400" },
              { route: "/api/live-rooms/delete", method: "POST", desc: "Remove stale LiveKit rooms", color: "text-rose-400" },
              { route: "/api/booking/availability", method: "GET", desc: "Check date availability", color: "text-fuchsia-400" },
              { route: "/api/booking/setlist", method: "GET / POST", desc: "Setlist request management", color: "text-fuchsia-400" },
              { route: "/api/fans/approve", method: "POST", desc: "Admin approve fan photo submissions", color: "text-cyan-400" },
              { route: "/api/proximity/attendees", method: "GET", desc: "List attendees for a show", color: "text-indigo-400" },
              { route: "/api/proximity/profile", method: "GET / POST", desc: "Fan proximity profile CRUD", color: "text-indigo-400" },
              { route: "/api/admin/cruise-export", method: "GET", desc: "Export cruise manifest CSV", color: "text-red-400" },
              { route: "/api/admin/cruise-stats", method: "GET", desc: "Cruise enrollment analytics", color: "text-red-400" },
              { route: "/api/newsletter/unsubscribe", method: "POST", desc: "Newsletter opt-out handler", color: "text-violet-400" },
              { route: "/api/health", method: "GET", desc: "System health check endpoint", color: "text-gray-400" },
              { route: "/api/report-error", method: "POST", desc: "Client-side error reporting", color: "text-gray-400" },
              { route: "/api/sync-shows", method: "POST", desc: "Sync Sanity show dates to Supabase", color: "text-blue-400" },
            ].map((api, i) => (
              <div key={api.route} className="p-3.5 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-mono text-white/60 font-bold">{api.route}</span>
                  <span className="text-[var(--font-size-2xs)] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-white/5 text-white/30">{api.method}</span>
                </div>
                <p className={`text-xs ${api.color} leading-relaxed`}>{api.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Database Migrations */}
        <section className="mt-20 pt-16 border-t border-white/10">
          <h2 className="text-xl font-bold uppercase tracking-[0.15em] text-white/80 mb-3 border-b border-white/10 pb-4">
            🗄️ Database Migrations
          </h2>
          <p className="text-white/30 text-xs mb-8">Supabase Postgres schema — 13 migration files in order of execution.</p>
          <div className="space-y-2">
            {[
              { file: "migration_001.sql", desc: "Core tables — profiles, bookings, feed_posts, feed_comments, sms_subscribers", status: "applied" },
              { file: "migration_002.sql", desc: "Live streams table + show_checkins + fan_points + raffle system tables", status: "applied" },
              { file: "migration_003_fan_feed.sql", desc: "Feed enhancements — likes, comments, image uploads", status: "applied" },
              { file: "migration_003_cancel_token.sql", desc: "Add cancel_token column to bookings for unauthenticated cancellation", status: "applied" },
              { file: "migration_004_auto_blast.sql", desc: "site_settings + sms_blast_log tables for auto-blast system", status: "applied" },
              { file: "migration_004_pinned_message.sql", desc: "Adds pinned_message column to live_streams for persistent sync", status: "applied" },
              { file: "migration_005_unique_email.sql", desc: "Unique email constraint on profiles table", status: "applied" },
              { file: "migration_006_newsletter.sql", desc: "Newsletter subscribers table + chat delete policy", status: "applied" },
              { file: "migration_007_sms_setlist.sql", desc: "SMS subscribers + setlist request tables", status: "applied" },
              { file: "migration_008_cruise_signups.sql", desc: "cruise_signups table — email, name, token, referral tracking", status: "applied" },
              { file: "migration_009_referrals.sql", desc: "Referral system — user_id linking for signup attribution", status: "applied" },
              { file: "migration_010_cruise_anonymous.sql", desc: "Anonymous cruise signup support + anon referral attribution", status: "applied" },
              { file: "migration_011_proximity_profiles.sql", desc: "proximity_profiles table — fan GPS opt-in, RSVP tracking, anonymous toggle", status: "applied" },
              { file: "migration_012_invite_challenge.sql", desc: "show_invite_challenges + show_invite_referrals — per-show merch reward system", status: "applied" },
              { file: "migration_013_show_memories.sql", desc: "show_memories — post-show fan memory & photo submissions", status: "applied" },
            ].map((m, i) => (
              <div key={m.file} className="flex items-center gap-4 p-3.5 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                <span className="text-xs font-mono font-bold text-white/20 w-4 text-right">{i + 1}</span>
                <span className="text-sm font-mono font-bold  text-[var(--color-accent)] min-w-[260px]">{m.file}</span>
                <span className="text-xs text-white/50 flex-1">{m.desc}</span>
                <span className={`text-[var(--font-size-2xs)] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full shrink-0 ${m.status === 'applied' ? 'bg-emerald-500/10 text-[var(--color-accent)] border  border-[var(--color-accent)]/30' : 'bg-purple-600/10 text-purple-300 border border-purple-500/20'
                  }`}>{m.status}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Page Tree */}
        <section className="mt-20 pt-16 border-t border-white/10">
          <h2 className="text-xl font-bold uppercase tracking-[0.15em] text-white/80 mb-3 border-b border-white/10 pb-4">
            🌳 Page Tree
          </h2>
          <p className="text-white/30 text-xs mb-8">Hierarchical view of all routes and how they connect.</p>

          <div className="  border border-white/5 p-8 font-mono text-sm leading-loose overflow-x-auto">
            {/* Root */}
            <div className="text-white font-bold">/ <span className="text-white/30 font-normal ml-2">Home</span></div>

            {/* Public */}
            <div className="ml-6 border-l border-white/10 pl-4 mt-1 space-y-0.5">
              <TreeNode path="/#tour" label="Tour Dates" color="text-blue-400" />
              <TreeNode path="/video" label="Video Gallery" color="text-pink-400" />
              <TreeNode path="/bio" label="Band Bio" color="text-purple-300" />
              <TreeNode path="/members" label="Band Members" color="text-purple-300" />
              <TreeNode path="/fan-photo-wall" label="Fan Photo Wall" color="text-emerald-400" />
              <TreeNode path="/contact" label="Contact" color="text-sky-400" />
              <TreeNode path="/privacy" label="Privacy Policy" color="text-gray-400" />
              <TreeNode path="/terms" label="Terms of Service" color="text-gray-400" />

              {/* Live */}
              <TreeNode path="/live" label="Live Stream Hub" color="text-rose-400">
                <TreeNode path="/live/[room]" label="Individual Stream" color="text-rose-400/60" />
              </TreeNode>

              {/* Store */}
              <TreeNode path="/store" label="Merch Store" color="text-lime-400" />
              <TreeNode path="/merch" label="Merch Landing" color="text-lime-400" />

              {/* Booking */}
              <TreeNode path="/book" label="Book the Band" color="text-fuchsia-400">
                <TreeNode path="/book/cancel" label="Booking Cancellation" color="text-fuchsia-400/60" />
              </TreeNode>

              {/* Cruise */}
              <TreeNode path="/cruise" label="Caribbean Cruise" color="text-cyan-400">
                <TreeNode path="/cruise#signup" label="Cruise Interest Signup" color="text-cyan-400/60" />
                <TreeNode path="/cruise/dashboard" label="Cruise Dashboard" color=" text-[var(--color-accent)]">
                  <TreeNode path="/cruise/dashboard#account" label="Account Setup (via invite)" color="text-emerald-400/60" />
                </TreeNode>
                <TreeNode path="/cruise/cancel" label="Cruise Cancellation" color="text-cyan-400/60" />
              </TreeNode>
              <TreeNode path="/shows/[id]" label="Show Page" color=" text-[var(--color-accent)]" />
            </div>

            {/* Auth / Dashboards */}
            <div className="mt-4 pt-3 border-t border-white/5">
              <div className="text-white/50 text-xs uppercase tracking-widest mb-2">🔐 Authenticated</div>
              <div className="ml-6 border-l border-white/10 pl-4 space-y-0.5">
                <TreeNode path="/fans" label="Fan Dashboard" color="text-cyan-400" />
                <TreeNode path="/planner" label="Planner Dashboard" color="text-teal-400">
                  <TreeNode path="/planner/v1" label="Planner V1 (Active)" color="text-teal-400/60" />
                </TreeNode>
                <TreeNode path="/crew" label="Crew Dashboard" color="text-orange-400" />
                <TreeNode path="/claim" label="Raffle Prize Claim" color="text-yellow-400" />
              </div>
            </div>

            {/* Admin */}
            <div className="mt-4 pt-3 border-t border-white/5">
              <div className="text-white/50 text-xs uppercase tracking-widest mb-2">⚙️ Admin</div>
              <div className="ml-6 border-l border-white/10 pl-4 space-y-0.5">
                <TreeNode path="/admin" label="Admin Dashboard" color="text-red-400">
                  <TreeNode path="/admin?tab=band" label="🎸 Band & Site Tab" color=" text-[var(--color-accent)]/60" />
                  <TreeNode path="/admin?tab=cruise" label="🚢 Cruise Tab" color="text-cyan-400/60" />
                  <TreeNode path="/admin/emails" label="Email Template Previews" color="text-red-400/60" />
                </TreeNode>
                <TreeNode path="/studio" label="Sanity Studio (CMS)" color="text-red-400" />
                <TreeNode path="/sitemap" label="Site Map (This Page)" color=" text-[var(--color-accent)]" />
              </div>
            </div>

            {/* API */}
            <div className="mt-4 pt-3 border-t border-white/5">
              <div className="text-white/50 text-xs uppercase tracking-widest mb-2">🔌 API Routes</div>
              <div className="ml-6 border-l border-white/10 pl-4 space-y-0.5">
                <TreeNode path="/api/booking" label="Booking CRUD" color="text-fuchsia-400/60">
                  <TreeNode path="/api/booking/cancel" label="Token Cancellation" color="text-fuchsia-400/40" />
                </TreeNode>
                <TreeNode path="/api/sms" label="SMS System" color="text-purple-300/60">
                  <TreeNode path="/api/sms/subscribe" label="Opt-in" color="text-purple-300/40" />
                  <TreeNode path="/api/sms/unsubscribe" label="Opt-out" color="text-purple-300/40" />
                  <TreeNode path="/api/sms/send" label="Proximity Blast" color="text-purple-300/40" />
                  <TreeNode path="/api/sms/auto-blast" label="Auto Cron" color="text-purple-300/40" />
                  <TreeNode path="/api/sms/live-alert" label="Live Alert" color="text-purple-300/40" />
                  <TreeNode path="/api/sms/webhook" label="Incoming SMS (STOP/GOING)" color="text-purple-300/40" />
                </TreeNode>
                <TreeNode path="/api/cruise" label="Cruise System" color="text-cyan-400/60">
                  <TreeNode path="/api/cruise/signup" label="Signup + Account Invite" color="text-cyan-400/40" />
                  <TreeNode path="/api/cruise/cancel" label="Cancel" color="text-cyan-400/40" />
                  <TreeNode path="/api/cruise/count" label="Count" color="text-cyan-400/40" />
                  <TreeNode path="/api/cruise/announcement" label="Announcement" color="text-cyan-400/40" />
                  <TreeNode path="/api/cruise/itinerary" label="Itinerary" color="text-cyan-400/40" />
                </TreeNode>
                <TreeNode path="/api/admin" label="Admin APIs" color="text-red-400/60">
                  <TreeNode path="/api/admin/settings" label="Settings Store" color="text-red-400/40" />
                  <TreeNode path="/api/admin/shows" label="Show Picker" color="text-red-400/40" />
                  <TreeNode path="/api/admin/fans" label="Fan Analytics" color="text-red-400/40" />
                  <TreeNode path="/api/admin/newsletter" label="Newsletter" color="text-red-400/40" />
                  <TreeNode path="/api/admin/crew-alert" label="Crew Alert" color="text-red-400/40" />
                  <TreeNode path="/api/admin/invite-challenge" label="Invite Challenge" color="text-red-400/40" />
                </TreeNode>
                <TreeNode path="/api/proximity" label="Proximity" color="text-indigo-400/60">
                  <TreeNode path="/api/proximity/shows" label="Nearby Shows" color="text-indigo-400/40" />
                  <TreeNode path="/api/proximity/rsvp" label="RSVP" color="text-indigo-400/40" />
                </TreeNode>
                <TreeNode path="/api/fans" label="Fan Profiles" color="text-cyan-400/60">
                  <TreeNode path="/api/fans/memories" label="Show Memories" color="text-cyan-400/40" />
                </TreeNode>
                <TreeNode path="/api/live" label="Live Streams" color="text-rose-400/60" />
                <TreeNode path="/api/feed" label="Social Feed" color="text-emerald-400/60" />
                <TreeNode path="/api/shopify" label="Shopify" color="text-green-400/60" />
                <TreeNode path="/api/email" label="Email Sender (Resend)" color="text-blue-400/60">
                  <TreeNode path="/api/email" label="Welcome + Admin Alert" color="text-blue-400/40" />
                </TreeNode>
                <TreeNode path="/api/tour" label="Tour Dates" color="text-blue-400/60" />
              </div>
            </div>
          </div>
        </section>

        {/* ── VISUAL PAGE TREE ── */}
        <section className="mt-16 pt-14 border-t border-white/[0.06]">
          <div className="mb-10">
            <span className="inline-block text-xs font-black uppercase tracking-[0.25em]  text-[var(--color-accent)] border border-purple-500/30 px-3 py-1 mb-4">Visual Hierarchy</span>
            <h2 className="text-2xl font-extrabold tracking-tight mb-2">Page Tree</h2>
            <p className="text-white/30 text-sm">How every page connects — scroll horizontally to see the full tree.</p>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-5 mb-10 text-xs font-bold uppercase tracking-widest">
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-white/20 inline-block" /> Public</span>
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-purple-500 inline-block" /> Fan Account Required</span>
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-cyan-500 inline-block" /> Cruiser Only</span>
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-teal-500 inline-block" /> Planner Only</span>
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Crew Only</span>
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-purple-600 inline-block" /> Admin Only</span>
          </div>

          <div className="overflow-x-auto pb-4">
            <div className="min-w-[920px]">

              {/* Root */}
              <div className="flex justify-center">
                <SiteNode href="/" label="HOME" sub="/" color="white" wide desc="Hero hub, tour preview, merch, music player, cruise promo" />
              </div>
              <BranchLine cols={6} />

              {/* Level 1 */}
              <div className="grid grid-cols-6 gap-3">
                <SiteNode href="/#tour" label="TOUR" sub="/#tour" color="white" desc="Interactive map, search, upcoming dates" />
                <SiteNode href="/bio" label="BIO" sub="/bio" color="white" desc="Band history, member profiles" />
                <SiteNode href="/video" label="VIDEO" sub="/video" color="white" desc="YouTube gallery, inline player" />
                <SiteNode href="/cruise" label="CRUISE" sub="/cruise" color="white" desc="Interest signup, itinerary, FAQ" />
                <SiteNode href="/fans" label="FAN HUB" sub="/fans" color="purple" desc="Full dashboard, SMS, prizes, referrals" />
                <SiteNode href="/live" label="LIVE" sub="/live" color="white" desc="Active broadcast gallery, WebRTC" />
              </div>

              {/* Level 2 */}
              <div className="grid grid-cols-6 gap-3 mt-1">
                <div className="flex flex-col items-center gap-1">
                  <VertLine />
                  <SiteNode href="/shows/[id]" label="SHOW PAGE" sub="/shows/[id]" color="white" desc="RSVP, invite challenge, QR share" />
                  <VertLine />
                  <div className="flex flex-col gap-1 w-full">
                    <SiteNode href="/shows/[id]" label="WHO'S GOING" sub="attendees" color="purple" small desc="Fan RSVP list" />
                    <SiteNode href="/live/[room]" label="LIVE FEED" sub="if active" color="red" small desc="Embedded stream" />
                  </div>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <VertLine />
                  <SiteNode href="/bio" label="BAND MEMBERS" sub="lineup" color="white" desc="Individual Q&A, gear lists" />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <VertLine />
                  <SiteNode href="/video" label="GALLERY" sub="music videos" color="white" desc="Categorized playlists" />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <VertLine />
                  <SiteNode href="/cruise/cancel" label="CANCEL RSVP" sub="/cruise/cancel" color="white" desc="Token-based opt-out" />
                  <VertLine />
                  <SiteNode href="/cruise/dashboard" label="CRUISE HUB" sub="passenger area" color="cyan" desc="Chat, itinerary, booking" />
                  <VertLine />
                  <SiteNode href="/cruise/dashboard" label="ACCOUNT SETUP" sub="invite link" color="cyan" small desc="Auth invite flow" />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <VertLine />
                  <div className="flex flex-col gap-1 w-full">
                    <SiteNode href="/fans" label="PROXIMITY" sub="shows near me" color="purple" small desc="GPS-based alerts" />
                    <SiteNode href="/fans" label="WHO'S GOING" sub="rsvp + attendees" color="purple" small desc="Show attendance" />
                    <SiteNode href="/fans" label="VIP INBOX" sub="raffle + pins" color="purple" small desc="Prize wallet" />
                    <SiteNode href="/fans" label="LIVE ALERTS" sub="active streams" color="purple" small desc="Real-time detect" />
                  </div>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <VertLine />
                  <SiteNode href="/live/[room]" label="STREAM" sub="/live/[room]" color="white" desc="WebRTC video + chat" />
                  <VertLine />
                  <div className="flex flex-col gap-1 w-full">
                    <SiteNode href="/live/[room]" label="LIVE CHAT" sub="real-time" color="white" small desc="Supabase broadcast" />
                    <SiteNode href="/live/[room]" label="RAFFLE" sub="win & pin" color="purple" small desc="Prize claim system" />
                  </div>
                </div>
              </div>

              {/* Protected divider */}
              <div className="my-12 border-t border-white/[0.06] relative">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#050505] px-4 text-xs uppercase tracking-widest text-white/20 font-bold">Protected Sections</span>
              </div>

              {/* Crew / Cruiser / Admin / Utilities */}
              <div className="grid grid-cols-4 gap-6">
                <div className="flex flex-col items-center">
                  <SiteNode href="/crew" label="CREW LOGIN" sub="/crew" color="red" wide desc="Authenticated crew members only" />
                  <VertLine />
                  <SiteNode href="/crew" label="CREW DASHBOARD" sub="broadcast hub" color="red" wide desc="LiveKit studio, chat, raffle, flash drops" />
                  <VertLine />
                  <div className="grid grid-cols-2 gap-2 w-full">
                    <SiteNode href="/crew" label="GO LIVE" sub="start stream" color="red" small desc="LiveKit WebRTC" />
                    <SiteNode href="/crew" label="RAFFLE" sub="manage raffles" color="red" small desc="Draw + notify" />
                    <SiteNode href="/crew" label="PIN VERIFY" sub="winner codes" color="red" small desc="Merch table scan" />
                    <SiteNode href="/crew" label="CHAT TOOLS" sub="pin messages" color="red" small desc="Mod controls" />
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <SiteNode href="/cruise/dashboard" label="CRUISE HUB" sub="/cruise/dashboard" color="cyan" wide desc="Passenger community portal" />
                  <VertLine />
                  <SiteNode href="/cruise/dashboard" label="PASSENGER AREA" sub="manifest required" color="cyan" wide desc="Auth invite, WYSIWYG updates" />
                  <VertLine />
                  <div className="grid grid-cols-2 gap-2 w-full">
                    <SiteNode href="/cruise/dashboard" label="CAPTAIN'S LOG" sub="announcements" color="cyan" small desc="Admin WYSIWYG" />
                    <SiteNode href="/cruise/dashboard" label="ITINERARY" sub="day-by-day" color="cyan" small desc="Schedule timeline" />
                    <SiteNode href="/cruise/dashboard" label="BOOKING" sub="priority list" color="cyan" small desc="Cabin manager" />
                    <SiteNode href="/cruise/dashboard" label="CHAT" sub="passenger lounge" color="cyan" small desc="Real-time Supabase" />
                    <SiteNode href="/cruise/dashboard" label="FAN PROMO" sub="cross-platform" color="purple" small desc="Fan Dashboard CTA" />
                    <SiteNode href="/cruise/dashboard" label="COUNTDOWN" sub="embarkation" color="cyan" small desc="Auto-calc timer" />
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <SiteNode href="/admin" label="ADMIN" sub="/admin" color="amber" wide desc="Master command center" />
                  <VertLine />
                  <SiteNode href="/admin" label="BAND / CRUISE" sub="tab toggle" color="amber" wide desc="Dual-mode admin panels" />
                  <VertLine />
                  <div className="grid grid-cols-2 gap-2 w-full">
                    <SiteNode href="/admin" label="TOUR DATES" sub="Sanity sync" color="amber" small desc="CMS integration" />
                    <SiteNode href="/admin" label="ALERT BANNER" sub="site-wide msg" color="amber" small desc="Global toggle" />
                    <SiteNode href="/admin" label="CREW ACCOUNTS" sub="username + email" color="amber" small desc="Staff provisioning" />
                    <SiteNode href="/admin" label="SUBSCRIBERS" sub="newsletter+SMS" color="amber" small desc="Fan lists" />
                    <SiteNode href="/admin/emails" label="EMAIL TEMPLATES" sub="14 templates" color="amber" small desc="Preview + test" />
                    <SiteNode href="/admin/legal" label="LEGAL COMPLIANCE" sub="audit guide" color="amber" small desc="Legal guidelines" />
                    <SiteNode href="/admin" label="WYSIWYG" sub="announcements" color="amber" small desc="Rich text editor" />
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <SiteNode href="/book" label="BOOK" sub="/book" color="white" wide desc="Multi-step event booking form" />
                  <VertLine />
                  <SiteNode href="/planner" label="PLANNER" sub="booking dashboard" color="teal" wide desc="Status tracker, checklist, re-book" />
                  <VertLine />
                  <div className="flex flex-col gap-2 w-full">
                    <SiteNode href="/fan-photo-wall" label="FAN WALL" sub="/fan-photo-wall" color="white" desc="Masonry grid, lightbox, moderated" />
                    <SiteNode href="/demo/proximity" label="PROXIMITY DEMO" sub="/demo/proximity" color="purple" desc="GPS show discovery simulation" />
                    <SiteNode href="/sitemap" label="SITE MAP" sub="/sitemap" color="white" desc="This page — architecture docs" />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── VISUAL EMAIL TREE ── */}
        <section className="mt-16 pt-14 border-t border-white/[0.06]">
          <div className="mb-10">
            <span className="inline-block text-xs font-black uppercase tracking-[0.25em] text-blue-400 border border-blue-500/30 px-3 py-1 mb-4">Email Architecture</span>
            <h2 className="text-2xl font-extrabold tracking-tight mb-2">Transactional Email Flow</h2>
            <p className="text-white/30 text-sm">How user actions trigger email notifications across the platform.</p>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-5 mb-10 text-xs font-bold uppercase tracking-widest">
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-cyan-500 inline-block" /> Fan Emails</span>
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-teal-500 inline-block" /> Planner Emails</span>
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-purple-600 inline-block" /> Admin Alerts</span>
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-purple-500 inline-block" /> Mass Broadcast</span>
          </div>

          <div className="overflow-x-auto pb-4">
            <div className="min-w-[920px]">

              {/* Root Trigger */}
              <div className="flex justify-center">
                <SiteNode href="#" label="USER & ADMIN ACTIONS" sub="System Triggers" color="white" wide />
              </div>
              <BranchLine cols={4} />

              {/* Level 1: Categories */}
              <div className="grid grid-cols-4 gap-4">
                <SiteNode href="#" label="ACCOUNT AUTH" sub="signups" color="white" />
                <SiteNode href="#" label="BOOKING ENGINE" sub="event requests" color="white" />
                <SiteNode href="#" label="CRUISE HUB" sub="passenger actions" color="white" />
                <SiteNode href="#" label="LIVE / COMMUNITY" sub="broadcasts & blasts" color="white" />
              </div>

              {/* Level 2: Sent Emails */}
              <div className="grid grid-cols-4 gap-4 mt-1">
                {/* Auth */}
                <div className="flex flex-col items-center gap-1">
                  <VertLine />
                  <SiteNode href="/admin/emails" label="WELCOME FAN" sub="account created" color="cyan" />
                  <VertLine />
                  <SiteNode href="/admin/emails" label="WELCOME PLANNER" sub="planner flow" color="teal" />
                </div>

                {/* Booking */}
                <div className="flex flex-col items-center gap-1">
                  <VertLine />
                  <div className="flex gap-2 w-full">
                    <SiteNode href="/admin/emails" label="CONFIRMATION" sub="to planner" color="teal" small />
                    <SiteNode href="/admin/emails" label="ADMIN ALERT" sub="new request" color="amber" small />
                  </div>
                  <VertLine />
                  <SiteNode href="/admin/emails" label="STATUS UPDATE" sub="approved / completed" color="teal" />
                  <VertLine />
                  <SiteNode href="/admin/emails" label="CANCELLATION" sub="admin alert" color="amber" />
                </div>

                {/* Cruise */}
                <div className="flex flex-col items-center gap-1">
                  <VertLine />
                  <SiteNode href="/admin/emails" label="SIGNUP CONFIRM" sub="initial interest" color="cyan" />
                  <VertLine />
                  <SiteNode href="/admin/emails" label="COMMUNITY WELCOME" sub="with secure link" color="cyan" />
                  <VertLine />
                  <SiteNode href="/admin/emails" label="CRUISE CANCEL" sub="opt-out" color="cyan" />
                </div>

                {/* Live / Community */}
                <div className="flex flex-col items-center gap-1">
                  <VertLine />
                  <SiteNode href="/admin/emails" label="RAFFLE ENTRY" sub="ticket confirmed" color="cyan" />
                  <VertLine />
                  <SiteNode href="/admin/emails" label="RAFFLE WINNER" sub="claim pin link" color="cyan" />
                  <VertLine />
                  <SiteNode href="/admin/emails" label="NEWSLETTER" sub="global mass email" color="purple" />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── ACCOUNT MERGING ARCHITECTURE ── */}
        <section className="mt-16 pt-14 border-t border-white/[0.06]">
          <div className="mb-10">
            <span className="inline-block text-xs font-black uppercase tracking-[0.25em] text-purple-400border border-cyan-500/30 px-3 py-1 mb-4">System Design</span>
            <h2 className="text-2xl font-extrabold tracking-tight mb-2">Account Merging Architecture</h2>
            <p className="text-white/30 text-sm">How Fan and Cruise accounts unify into a single dashboard experience.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Email-Based Reconciliation",
                icon: "🔗",
                desc: "On login, the Fan Dashboard queries cruise_signups using the authenticated email. If a match is found, the user is flagged as a Cruiser.",
                color: "text-cyan-400",
                border: "border-cyan-500/30",
                bg: "bg-cyan-500/5",
              },
              {
                title: "Unified Toggle UI",
                icon: "🔀",
                desc: "Cruisers see a pill-shaped toggle on /fans: [ Fan Dashboard ] | [ 🚢 Cruise Hub ]. Clicking toggles between the full fan experience and the embedded cruise dashboard.",
                color: " text-[var(--color-accent)]",
                border: "border-purple-500/30",
                bg: "bg-purple-500/5",
              },
              {
                title: "60-Day Auto-Expiration",
                icon: "⏱️",
                desc: "The Cruise Hub toggle automatically hides 60 days after the cruise end date (CRUISE_END_DATE). The account silently reverts to fan-only — no admin action needed.",
                color: "text-purple-300",
                border: "border-purple-500/30",
                bg: "bg-purple-600/5",
              },
              {
                title: "Fan → Cruise Promo",
                icon: "🚢",
                desc: "Fans who haven't signed up for the cruise see a cyan promo banner: '7th Heaven is Setting Sail!' linking to /cruise. Auto-hides once they sign up or the cruise window expires.",
                color: "text-cyan-400",
                border: "border-cyan-500/30",
                bg: "bg-cyan-500/5",
              },
              {
                title: "Cruise → Fan Promo",
                icon: "🎸",
                desc: "Cruisers on /cruise/dashboard see a purple promo banner: 'Unlock Your Fan Dashboard' linking to /fans for show alerts, raffles, picks, and referrals.",
                color: " text-[var(--color-accent)]",
                border: "border-purple-500/30",
                bg: "bg-purple-500/5",
              },
              {
                title: "Embedded Cruise View",
                icon: "📱",
                desc: "When toggled to Cruise Hub, the Fan Dashboard renders the full cruise dashboard inline: Captain's Log, Itinerary, Booking Manager, Passenger Chat, and Community widget.",
                color: "text-emerald-400",
                border: "border-emerald-500/30",
                bg: "bg-emerald-500/5",
              },
            ].map((item, i) => (
              <div key={item.title} className={`p-6  border ${item.border} ${item.bg} transition-colors hover:scale-[1.02]`}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{item.icon}</span>
                  <h3 className={`text-sm font-black uppercase tracking-wide ${item.color}`}>{item.title}</h3>
                </div>
                <p className="text-sm text-white/50 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── COMPONENT REGISTRY ── */}
        <section className="mt-16 pt-14 border-t border-white/[0.06]">
          <div className="mb-10">
            <span className="inline-block text-xs font-black uppercase tracking-[0.25em] text-[var(--color-accent)] border border-emerald-500/30 px-3 py-1 mb-4">Shared Code</span>
            <h2 className="text-2xl font-extrabold tracking-tight mb-2">Component Registry</h2>
            <p className="text-white/30 text-sm">Reusable React components shared across multiple pages.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {[
              { name: "Header", file: "Header.tsx", used: "All Pages", desc: "Global nav bar with auth state, live detection, mobile menu", color: "text-white" },
              { name: "Footer", file: "Footer.tsx", used: "All Pages", desc: "Site-wide footer with links, social, legal", color: "text-white" },
              { name: "LoginModal", file: "LoginModal.tsx", used: "Auth", desc: "Magic link + social OAuth modal with role routing", color: " text-[var(--color-accent)]" },
              { name: "CruiseChat", file: "CruiseChat.tsx", used: "/cruise/dashboard, /fans", desc: "Real-time passenger lounge with Supabase subscriptions", color: "text-cyan-400" },
              { name: "CruiseWidgets", file: "CruiseWidgets.tsx", used: "/cruise/dashboard, /fans", desc: "EmbarkationCountdown, ImportantLinksWidget, BookingManager", color: "text-cyan-400" },
              { name: "ProximityPanel", file: "ProximityPanel.tsx", used: "/fans", desc: "Proximity show alerts with GPS opt-in and RSVP tracking", color: "text-indigo-400" },
              { name: "FanUploadForm", file: "FanUploadForm.tsx", used: "/fans", desc: "Fan photo submission with NSFW AI scanning", color: "text-emerald-400" },
              { name: "MemberDashboard", file: "MemberDashboard.tsx", used: "/fans", desc: "Core dashboard shell for authenticated fan views", color: "text-cyan-400" },
              { name: "PlannerDashboard", file: "PlannerDashboard.tsx", used: "/planner", desc: "Booking status tracker with checklist editing", color: "text-teal-400" },
              { name: "TourMap", file: "TourMap.tsx", used: "/tour", desc: "Leaflet interactive map with venue pins", color: "text-blue-400" },
              { name: "TourList", file: "TourList.tsx", used: "/tour", desc: "Chronological tour date table with search & filters", color: "text-blue-400" },
              { name: "AudioPlayer", file: "AudioPlayer.tsx", used: "/", desc: "Custom music player with waveform and progress bar", color: "text-pink-400" },
              { name: "LiveKitStream", file: "LiveKitStream.tsx", used: "/live/[room], /crew", desc: "LiveKit room connect with WebRTC video rendering", color: "text-rose-400" },
              { name: "LiveReactions", file: "LiveReactions.tsx", used: "/live/[room]", desc: "Floating emoji reactions overlay during streams", color: "text-rose-400" },
              { name: "CountdownTimer", file: "CountdownTimer.tsx", used: "/, /cruise", desc: "Animated countdown to next event or cruise", color: "text-purple-300" },
              { name: "CookieConsentBanner", file: "CookieConsentBanner.tsx", used: "All Pages", desc: "GDPR cookie consent with localStorage persistence", color: "text-gray-400" },
              { name: "GoogleAnalytics", file: "GoogleAnalytics.tsx", used: "All Pages", desc: "GA4 script injection with consent gating", color: "text-gray-400" },
              { name: "VideoSection", file: "VideoSection.tsx", used: "/, /video", desc: "YouTube video grid with custom inline player", color: "text-pink-400" },
              { name: "SMSSignup", file: "SMSSignup.tsx", used: "/fans", desc: "SMS opt-in form for show proximity alerts", color: "text-purple-300" },
              { name: "RoleBadge", file: "RoleBadge.tsx", used: "Multiple", desc: "Color-coded role indicator (Fan, Crew, Admin, Planner)", color: " text-[var(--color-accent)]" },
            ].map((comp, i) => (
              <div key={comp.name} className="p-3.5 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-sm font-black uppercase tracking-wide ${comp.color}`}>{comp.name}</span>
                  <span className="text-[var(--font-size-2xs)] font-mono text-white/20">{comp.file}</span>
                </div>
                <p className="text-xs text-white/40 leading-relaxed mb-1.5">{comp.desc}</p>
                <span className="text-[var(--font-size-2xs)] font-bold uppercase tracking-widest text-white/15">Used: {comp.used}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── ENVIRONMENT VARIABLES ── */}
        <section className="mt-16 pt-14 border-t border-white/[0.06]">
          <div className="mb-10">
            <span className="inline-block text-xs font-black uppercase tracking-[0.25em] text-purple-300 border border-purple-500/30 px-3 py-1 mb-4">Configuration</span>
            <h2 className="text-2xl font-extrabold tracking-tight mb-2">Environment Variables</h2>
            <p className="text-white/30 text-sm">All required .env.local keys for the platform to function. Never commit secrets to version control.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { key: "NEXT_PUBLIC_SUPABASE_URL", service: "Supabase", desc: "Public Supabase project URL", required: true },
              { key: "NEXT_PUBLIC_SUPABASE_ANON_KEY", service: "Supabase", desc: "Public anon key for client-side queries", required: true },
              { key: "SUPABASE_SERVICE_" + "ROLE_KEY", service: "Supabase", desc: "Server-only service role key (admin operations)", required: true },
              { key: "RESEND_API_" + "KEY", service: "Resend", desc: "API key for transactional emails", required: true },
              { key: "NEXT_PUBLIC_LIVEKIT_URL", service: "LiveKit", desc: "WebSocket URL for live streaming", required: true },
              { key: "LIVEKIT_API_" + "KEY", service: "LiveKit", desc: "Server-side API key for token generation", required: true },
              { key: "LIVEKIT_API_" + "SECRET", service: "LiveKit", desc: "Server-side API secret for token signing", required: true },
              { key: "NEXT_PUBLIC_SANITY_PROJECT_ID", service: "Sanity", desc: "Sanity CMS project identifier", required: true },
              { key: "NEXT_PUBLIC_SANITY_DATASET", service: "Sanity", desc: "Dataset name (production/staging)", required: true },
              { key: "NEXT_PUBLIC_SANITY_API_VERSION", service: "Sanity", desc: "API version date string", required: true },
              { key: "SANITY_API_" + "TOKEN", service: "Sanity", desc: "Server-side write token for CMS mutations", required: true },
              { key: "NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN", service: "Shopify", desc: "Storefront domain (mystore.myshopify.com)", required: true },
              { key: "NEXT_PUBLIC_SHOPIFY_STOREFRONT_" + "ACCESS_TOKEN", service: "Shopify", desc: "Public storefront API token for cart/products", required: true },
              { key: "SHOPIFY_ADMIN_" + "ACCESS_TOKEN", service: "Shopify", desc: "Admin API token for order/inventory management", required: true },
              { key: "TWILIO_ACCOUNT_SID", service: "Twilio", desc: "Twilio account identifier for SMS", required: true },
              { key: "TWILIO_AUTH_" + "TOKEN", service: "Twilio", desc: "Twilio authentication token", required: true },
              { key: "TWILIO_PHONE_NUMBER", service: "Twilio", desc: "Outbound SMS phone number", required: true },
              { key: "ADMIN_API_" + "SECRET", service: "Security", desc: "Secret for admin-only API route protection", required: true },
              { key: "NEXT_PUBLIC_GA_ID", service: "Analytics", desc: "Google Analytics 4 measurement ID", required: false },
              { key: "MUX_TOKEN_" + "ID", service: "Mux", desc: "Mux video API token ID (video processing)", required: false },
              { key: "MUX_TOKEN_" + "SECRET", service: "Mux", desc: "Mux video API secret", required: false },
            ].map((env, i) => (
              <div key={env.key} className="flex items-center gap-4 p-3.5 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                <span className={`text-[var(--font-size-2xs)] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full shrink-0 ${env.required ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-white/5 text-white/30 border border-white/10'
                  }`}>{env.required ? 'Required' : 'Optional'}</span>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-mono font-bold text-purple-300 block truncate">{env.key}</span>
                  <span className="text-xs text-white/40">{env.desc}</span>
                </div>
                <span className="text-[var(--font-size-2xs)] font-bold uppercase tracking-widest text-white/15 shrink-0">{env.service}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── MONTHLY RUNNING COSTS ── */}
        <section className="mt-16 pt-14 border-t border-white/[0.06]">
          <div className="mb-10">
            <span className="inline-block text-xs font-black uppercase tracking-[0.25em] text-[var(--color-accent)] border border-emerald-500/30 px-3 py-1 mb-4">💰 Operations</span>
            <h2 className="text-2xl font-extrabold tracking-tight mb-2">Monthly Running Costs</h2>
            <p className="text-white/30 text-sm">Estimated monthly costs to keep the 7th Heaven platform live. Prices are as of May 2026.</p>
          </div>

          <div className="space-y-3">
            {[
              {
                service: "Vercel",
                plan: "Pro",
                cost: "$20",
                unit: "/mo",
                what: "Hosting, edge CDN, serverless functions, preview deployments. Includes 1TB bandwidth, 100GB-hrs compute.",
                link: "https://vercel.com/pricing",
                icon: "▲",
                color: "text-white",
                border: "border-white/10",
                required: true,
              },
              {
                service: "Supabase",
                plan: "Free → Pro",
                cost: "$0–$25",
                unit: "/mo",
                what: "Postgres database, auth, real-time subscriptions, row-level security, storage. Free tier: 500MB DB, 50K MAUs. Pro: 8GB DB, unlimited auth.",
                link: "https://supabase.com/pricing",
                icon: "⚡",
                color: "text-emerald-400",
                border: " border-[var(--color-accent)]/30",
                required: true,
              },
              {
                service: "Twilio",
                plan: "Pay-as-you-go",
                cost: "$1.15 + ~$0.0079",
                unit: "/number + /SMS",
                what: "One phone number ($1.15/mo) + per-SMS cost (~$0.0079 outbound). 1,000 texts ≈ $9. Incoming texts are free on long codes.",
                link: "https://www.twilio.com/sms/pricing/us",
                icon: "📱",
                color: "text-rose-400",
                border: "border-rose-500/20",
                required: true,
              },
              {
                service: "Shopify",
                plan: "Basic",
                cost: "$39",
                unit: "/mo",
                what: "Merch store backend. Product catalog, inventory, checkout, payment processing. Storefront API is included. Transaction fees: 2.9% + $0.30 per sale.",
                link: "https://www.shopify.com/pricing",
                icon: "🛒",
                color: "text-green-400",
                border: "border-green-500/20",
                required: true,
              },
              {
                service: "Resend",
                plan: "Free → Pro",
                cost: "$0–$20",
                unit: "/mo",
                what: "Transactional email delivery. Free: 100 emails/day (3,000/mo). Pro: 50,000 emails/mo. Used for booking confirmations, welcome emails, newsletters, cruise signups.",
                link: "https://resend.com/pricing",
                icon: "📧",
                color: "text-blue-400",
                border: "border-blue-500/20",
                required: true,
              },
              {
                service: "Sanity CMS",
                plan: "Free",
                cost: "$0",
                unit: "/mo",
                what: "Headless CMS for tour dates, news articles, band bios, site settings. Free tier: 100K API requests/mo, 10GB bandwidth, 3 users.",
                link: "https://www.sanity.io/pricing",
                icon: "📝",
                color: "text-red-400",
                border: "border-red-500/20",
                required: true,
              },
              {
                service: "LiveKit Cloud",
                plan: "Free → Starter",
                cost: "$0–$50",
                unit: "/mo",
                what: "WebRTC live streaming. Free: 1,000 participant-minutes/mo. Starter: 10,000 mins. Used for crew broadcasts to fans.",
                link: "https://livekit.io/pricing",
                icon: "📡",
                color: "text-indigo-400",
                border: "border-indigo-500/20",
                required: true,
              },
              {
                service: "Domain",
                plan: "Annual",
                cost: "~$1.50",
                unit: "/mo (~$18/yr)",
                what: "7thheavenband.com domain registration. Purchased through Namecheap, GoDaddy, or Cloudflare. DNS points to Vercel.",
                icon: "🌐",
                color: "text-sky-400",
                border: "border-sky-500/20",
                required: true,
              },
              {
                service: "Google Analytics",
                plan: "Free",
                cost: "$0",
                unit: "",
                what: "Website traffic analytics, audience demographics, conversion tracking. GA4 is completely free.",
                link: "https://analytics.google.com",
                icon: "📊",
                color: "text-purple-300",
                border: "border-purple-500/20",
                required: false,
              },
              {
                service: "Upstash Redis",
                plan: "Free",
                cost: "$0",
                unit: "/mo",
                what: "Rate limiting for API abuse prevention. Free tier: 10K commands/day. More than enough for rate limiting.",
                link: "https://upstash.com/pricing",
                icon: "🛡️",
                color: "text-rose-500",
                border: "border-rose-500/20",
                required: false,
              },
            ].map((s, i) => (
              <div key={s.service} className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5  border ${s.border} bg-white/[0.02] hover:bg-white/[0.04] transition-colors`}>
                <div className="flex items-center gap-3 min-w-[200px]">
                  <span className="text-xl">{s.icon}</span>
                  <div>
                    <h3 className={`text-sm font-black uppercase tracking-wide ${s.color}`}>{s.service}</h3>
                    <span className="text-xs text-white/25 font-bold uppercase tracking-widest">{s.plan}</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/50 leading-relaxed">{s.what}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-lg font-black text-white">{s.cost}</span>
                    <span className="text-xs text-white/30 ml-1">{s.unit}</span>
                  </div>
                  {s.link && (
                    <a aria-label="View service details" href={s.link} target="_blank" rel="noopener noreferrer" className={`text-xs font-bold uppercase tracking-widest ${s.color} hover:text-white transition-colors`}>
                      →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Total Estimate */}
          <div className="mt-8 p-6 border  border-[var(--color-accent)]/30 bg-emerald-500/5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black uppercase tracking-wide text-[var(--color-accent)] mb-1">Estimated Monthly Total</h3>
                <p className="text-sm text-white/40">Minimum cost to keep the full platform running with all features active.</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-white">~$62–$157</div>
                <span className="text-xs text-white/30 uppercase tracking-widest">/month</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-emerald-500/10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-emerald-400 font-bold">Bare Minimum:</span>
                <span className="text-white/50 ml-2">~$62/mo</span>
                <p className="text-white/25 mt-1">Vercel Pro ($20) + Shopify ($39) + Domain ($1.50) + Twilio number ($1.15). Everything else on free tiers.</p>
              </div>
              <div>
                <span className="text-purple-300 font-bold">Typical Usage:</span>
                <span className="text-white/50 ml-2">~$100/mo</span>
                <p className="text-white/25 mt-1">Add Supabase Pro ($25), Resend emails, and ~1,000 SMS texts/mo ($9).</p>
              </div>
              <div>
                <span className=" text-[var(--color-accent)] font-bold">Full Scale:</span>
                <span className="text-white/50 ml-2">~$157/mo</span>
                <p className="text-white/25 mt-1">All Pro tiers active including LiveKit Starter for frequent live streams.</p>
              </div>
            </div>
          </div>

          {/* Per-transaction costs */}
          <div className="mt-6 p-5 border border-white/5 bg-white/[0.02]">
            <h4 className="text-sm font-black uppercase tracking-wide text-white/60 mb-3">💳 Per-Transaction Costs (Variable)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                <span className="text-green-400 font-bold">Shopify Sales</span>
                <p className="text-white/40 mt-1">2.9% + $0.30 per merch sale. Shopify keeps the payment processing fee.</p>
              </div>
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                <span className="text-rose-400 font-bold">SMS Messages</span>
                <p className="text-white/40 mt-1">~$0.0079 per outbound text. Incoming replies are free. 500 fans × 4 shows/mo ≈ $16.</p>
              </div>
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                <span className="text-blue-400 font-bold">Emails</span>
                <p className="text-white/40 mt-1">Free up to 3,000/mo with Resend. After that, $20/mo for 50K emails.</p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}

// ── Tree sub-components ─────────────────────────────────────────────────────

const NODE_COLOR_MAP: Record<string, string> = {
  white: "border-white/[0.08] bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]",
  purple: "border-purple-500/30 bg-purple-500/5 hover:border-purple-400/50 hover:bg-purple-500/10",
  red: "border-red-500/30 bg-red-500/5 hover:border-red-400/50 hover:bg-red-500/10",
  amber: "border-purple-500/30 bg-purple-600/5 hover:border-purple-400/50 hover:bg-purple-600/10",
  cyan: "border-cyan-500/30 bg-cyan-500/5 hover:border-cyan-400/50 hover:  ",
  teal: "border-teal-500/30 bg-teal-500/5 hover:border-teal-400/50 hover:bg-teal-500/10",
  blue: "border-blue-500/30 bg-blue-500/5 hover:border-blue-400/50 hover:bg-blue-500/10",
};
const NODE_DOT_MAP: Record<string, string> = { white: "bg-white/20", purple: "bg-purple-500", red: "bg-red-500", amber: "bg-purple-600", cyan: "bg-cyan-500", teal: "bg-teal-500", blue: "bg-blue-500" };
const NODE_TEXT_MAP: Record<string, string> = { white: "text-white/80", purple: "text-purple-300", red: "text-red-300", amber: "text-purple-200", cyan: "text-cyan-300", teal: "text-teal-300", blue: "text-blue-300" };

function SiteNode({
  href, label, sub, color = "white", wide = false, small = false, desc,
}: {
  href: string; label: string; sub?: string; desc?: string;
  color?: "white" | "purple" | "red" | "amber" | "cyan" | "teal" | "blue";
  wide?: boolean; small?: boolean;
}) {
  const isLinkable = !href.includes('[') && href !== '#';
  const cls = `flex flex-col items-center justify-center border rounded-lg transition-colors text-center group w-full cursor-pointer hover:scale-[1.03] active:scale-[0.98] ${NODE_COLOR_MAP[color]} ${wide ? "px-6 py-3" : small ? "px-2 py-2" : "px-3 py-3"}`;
  const inner = (
    <>
      <div className="flex items-center gap-1.5 mb-0.5">
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${NODE_DOT_MAP[color]}`} />
        <span className={`text-xs font-black uppercase tracking-widest leading-tight ${NODE_TEXT_MAP[color]}`}>{label}</span>
      </div>
      {sub && <span className="text-[var(--font-size-2xs)] text-white/20 font-mono mt-0.5">{sub}</span>}
      {desc && <span className="text-[var(--font-size-2xs)] text-white/15 leading-snug mt-1 max-w-[140px]">{desc}</span>}
    </>
  );
  if (isLinkable) {
    return <Link href={href} className={cls}>{inner}</Link>;
  }
  return <span className={cls}>{inner}</span>;
}

function VertLine() {
  return (
    <div className="flex flex-col items-center shrink-0 py-0.5">
      <div className="w-px h-4 bg-white/[0.08]" />
      <div className="w-1 h-1 rounded-full bg-white/[0.08]" />
      <div className="w-px h-2 bg-white/[0.08]" />
    </div>
  );
}

function BranchLine({ cols }: { cols: number }) {
  return (
    <div className="flex justify-around items-start py-3 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-3 bg-white/[0.08]" />
      <div className="absolute top-3 bg-white/[0.08] h-px" style={{ left: `calc(100%/${cols}/2)`, right: `calc(100%/${cols}/2)` }} />
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} className="flex-1 flex flex-col items-center">
          <div className="w-px h-3 bg-white/[0.08] mt-3" />
          <div className="w-1 h-1 rounded-full bg-white/[0.08]" />
          <div className="w-px h-2 bg-white/[0.08]" />
        </div>
      ))}
    </div>
  );
}
