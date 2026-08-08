/* eslint-disable react-doctor/no-giant-component */
"use client";
import Image from 'next/image';

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

type Category = "all" | "fan" | "live" | "booking" | "ecommerce" | "comms" | "platform";

interface FeatureCard {
  icon: string;
  title: string;
  tagline: string;
  description: string;
  whyItMatters: string;
  bullets: string[];
  howItWorks: string[];
  tags: string[];
  category: Category[];
  highlight?: boolean;
  link?: string;
  demo?: string;
}

/* ══════════════════════════════════════════════
   FEATURE DATA
══════════════════════════════════════════════ */
const FEATURES: FeatureCard[] = [

  // ── FAN EXPERIENCE ──────────────────────────

  {
    icon: "🏠",
    title: "Cinematic Homepage",
    tagline: "Every feature. One page. Instantly discoverable.",
    description:
      "The homepage is the command center fans land on first — and it's built to impress. Rather than a static band site, it's a living, breathing hub that knows whether the band is live right now, how many days until the next show, what merch is available, and what photos fans have been submitting. Everything is dynamic and real-time.",
    whyItMatters:
      "First impressions drive conversions. A static band website loses fans in seconds. This homepage keeps fans engaged the moment they arrive by surfacing exactly what's relevant right now — a live stream, an upcoming show, or a new product drop.",
    bullets: [
      "Auto-detects when any crew member is broadcasting and shows a pulsing LIVE banner at the top",
      "Countdown timer to the next upcoming show with venue name and ticket/RSVP CTA",
      "Embedded interactive Leaflet map showing all tour stops — fans see immediately where the band is headed",
      "Inline music player for the latest releases — plays without navigating away",
      "Merch quick-shop powered by the Shopify Storefront API — add to cart without leaving the homepage",
      "Fan photo wall preview grid showing the most recent approved submissions",
      "Behind-the-scenes video section with custom inline YouTube player",
      "Proximity notification system: fans near an upcoming venue see a push notification prompt",
    ],
    howItWorks: [
      "On page load, a Supabase subscription listens for live_streams table changes in real time",
      "If any stream is detected, the LIVE banner component renders immediately — no refresh needed",
      "Sanity CMS provides tour dates, bio content, and site settings — any update in Sanity appears on the site within seconds",
      "Shopify GraphQL queries hydrate the merch section with live product data and pricing",
    ],
    tags: ["Live Detection", "Music Player", "Interactive Map", "Shopify", "Sanity CMS"],
    demo: "/demos/homepage.webp",
    category: ["fan", "live"],
    highlight: true,
    link: "/",
  },

  {
    icon: "🗺️",
    title: "Interactive Tour Map",
    tagline: "Find a show near you — visually, instantly.",
    description:
      "Instead of forcing fans to scroll through a list of dates, the tour page leads with a fully interactive map. Every venue is pinned at its real geographic coordinates. The next upcoming show is highlighted and centered automatically. Fans can search, filter, and click any pin to jump directly to that show's RSVP page.",
    whyItMatters:
      "Fans are far more likely to attend a show when they can see exactly how close it is to where they live. A map communicates proximity instantly — no addresses to Google, no mental geography needed.",
    bullets: [
      "Every confirmed show venue is plotted at its exact latitude/longitude using Leaflet.js",
      "Pins are color-coded: green for upcoming, grey for past",
      "The chronologically-nearest upcoming show gets a special highlighted pin and the map auto-centers on it",
      "Search bar lets fans type a city, venue, or date to filter the list below the map",
      "Category filters: All Shows, Clubs, Festivals, Corporate, Private Events",
      "Clicking any pin opens a popup with the venue name, date, and a direct link to the show's RSVP page",
      "The tour table below the map stays in sync with whatever pin the fan interacts with",
    ],
    howItWorks: [
      "Tour dates are stored and managed in Sanity CMS — the admin edits dates there, they appear on the map immediately",
      "Venue coordinates are stored with each show entry in Sanity",
      "Leaflet renders the map client-side to avoid SSR hydration issues",
      "A date-filtering algorithm sorts shows chronologically and identifies the 'next' show by comparing against today's date",
    ],
    tags: ["Leaflet.js", "Geo-Coordinates", "Real-Time Filters", "Sanity CMS"],
    demo: "/demos/tour-map.webp",
    category: ["fan"],
    link: "/tour",
  },

  {
    icon: "🎬",
    title: "Video Gallery",
    tagline: "Every music video, live performance, and backstage clip — organized.",
    description:
      "The video gallery is a full-featured, categorized video library. It's not just an embedded YouTube playlist — it's a custom-built video browsing experience with 10+ content categories, thumbnail grids that match the site's aesthetic, and an inline player that keeps fans on the page rather than sending them to YouTube.",
    whyItMatters:
      "Every click off-site to YouTube is a potential fan lost. Keeping video playback native means fans stay engaged longer, see more of the site, and are more likely to convert on a show RSVP or merch purchase.",
    bullets: [
      "10+ categories: Official Music Videos, Live Performances, Behind the Scenes, Acoustic Sessions, Tour Diaries, Fan Captures, and more",
      "16:9 thumbnail grids with hover effects that reveal play buttons and video metadata",
      "Custom inline YouTube player — video plays directly in a modal overlay, no leaving the page",
      "Featured 'Latest Release' hero section at the top of the page for the newest upload",
      "Progress bars on thumbnails indicate video duration",
      "Intelligent API fallback: if YouTube rate-limits the metadata API, the player still works using cached data",
    ],
    howItWorks: [
      "Video metadata (title, thumbnail, duration, view count) is fetched from the YouTube Data API v3",
      "If the API quota is exceeded, a local cache of previously fetched metadata serves as fallback",
      "The inline player uses YouTube's iframe API embedded in a focus-trapping modal",
      "Category navigation is rendered from a static config file, making it easy to add new categories without code changes",
    ],
    tags: ["YouTube API", "Custom Inline Player", "10+ Categories", "Smart Fallback"],
    demo: "/demos/video-gallery.webp",
    category: ["fan"],
    link: "/video",
  },

  {
    icon: "🎵",
    title: "Inline Audio Player",
    tagline: "Listen while you browse — no interruptions, no new tabs.",
    description:
      "The audio player is embedded persistently across the site. Fans can discover the music, hit play, and continue exploring — the music doesn't stop when they navigate to another page. It supports a full track list, play/pause/seek controls, and smooth track transitions.",
    whyItMatters:
      "Music is the product. Making it as effortless as possible to hear 7th Heaven's music — without friction, redirects, or interruptions — directly increases the chance a visitor becomes a fan, buys tickets, or shares the site.",
    bullets: [
      "Play, pause, skip, and seek controls directly in the player",
      "Full track list displayed alongside the player — click any track to jump to it",
      "Track metadata: title, album, duration displayed per track",
      "Smooth crossfade transitions between tracks",
      "Player persists as fans navigate between pages — music doesn't stop",
      "Waveform-style progress bar with click-to-seek functionality",
    ],
    howItWorks: [
      "Audio files and metadata are served from a Supabase Storage bucket",
      "The player component lives at the layout level, outside the page router, so it survives navigation",
      "Track state (current position, playing/paused, active track) is managed in global React context",
      "The /api/audio route serves track metadata and pre-signed streaming URLs",
    ],
    tags: ["Audio Streaming", "Persistent Player", "Track Queue", "Supabase Storage"],
    demo: "/demos/audio-player.webp",
    category: ["fan"],
  },

  {
    icon: "📸",
    title: "Fan Photo & Video Gallery",
    tagline: "Every fan's concert photos & video clips, displayed and celebrated.",
    description:
      "Fans are invited to submit their own photos and videos from shows, and they appear in a beautiful grid on the site. Before any image touches the server, it's scanned by an AI model for safety. Uploaded video clips are automatically processed and compressed on the server using FFmpeg to standardize to web-friendly MP4 (H.264/AAC), reducing file sizes by up to 80% while retaining high quality.",
    whyItMatters:
      "User-generated content is the most authentic marketing possible. Fans who see their photos and concert video clips on the band's website feel ownership and stay engaged. Automatic compression keeps page load times lightning-fast, and manual admin review guarantees the feed stays safe and family-friendly.",
    bullets: [
      "Fans upload photos or video clips directly from the fan dashboard",
      "AI NSFW scan runs entirely in the browser using TensorFlow.js for photos before upload starts",
      "Videos automatically bypass client-side scanning and receive a 'Video Review' priority review flag",
      "Automated server-side FFmpeg compression reduces dynamic video payloads, converting to H.264/AAC MP4",
      "Admin moderation panel enables one-click approval or rejection of submissions",
      "Approved photos and videos render with muted looping autoplay in grids, and full audio/controls in lightbox modals",
      "Report / Flag buttons on all assets allow crowdsourced safety monitoring",
    ],
    howItWorks: [
      "On upload, images are pre-scanned client-side; videos are sent raw to /api/fans",
      "The server identifies video streams and executes FFmpeg transcoding to standardized 1280px MP4 format",
      "Processed items are saved with type 'image' or 'video' in the fan memories database",
      "The masonry feed filters and queries only approved submissions, using standard HTML5 media tag elements for rendering",
    ],
    tags: ["FFmpeg Compression", "TensorFlow.js AI", "Admin Moderation", "Video Player", "Lightbox"],
    demo: "/demos/fan-photo-wall.webp",
    category: ["fan"],
    link: "/fan-photo-wall",
  },

  {
    icon: "🎸",
    title: "Band Bio & Member Profiles",
    tagline: "The full story — from formation to today.",
    description:
      "Every band member gets a dedicated profile page with their photo, biography, instrument, gear list, and an extended Q&A. The band's history is told through a full timeline. All content is managed through Sanity CMS, meaning non-technical team members can update profiles, add news, or change the bio without touching a line of code.",
    whyItMatters:
      "Fans connect with people, not bands. Giving each member a personal page with real personality creates deeper connections and gives the press, bookers, and new fans the information they need to say yes.",
    bullets: [
      "Dedicated page per member at /members/[slug] with dynamic routing",
      "Full biography, instruments played, years with the band",
      "Gear list: which guitars, amps, drums, and pedals each member uses",
      "Extended Q&A section with personality-driven questions and answers",
      "High-resolution headshot with custom image optimization",
      "Band history timeline on the main /bio page — from formation to present",
      "Awards and accolades section: Midwest Billboard Chart #1 hits, radio achievements",
      "All content updated instantly from Sanity Studio — no developer needed",
    ],
    howItWorks: [
      "Band member data is structured in Sanity CMS with typed schemas for each field",
      "Next.js generates static pages for each member at build time via generateStaticParams",
      "When Sanity content changes, Sanity's live content API triggers a re-render without a full redeploy",
      "Images are served through Sanity's CDN with automatic WebP conversion and responsive sizing",
    ],
    tags: ["Sanity CMS", "Dynamic Routing", "CMS-Managed", "No-Code Updates"],
    demo: "/demos/bio-members.webp",
    category: ["fan"],
    link: "/members",
  },

  {
    icon: "🎟️",
    title: "Show Pages & RSVP",
    tagline: "Every show has its own page — RSVP, share, see who's going, and check out what you missed.",
    description:
      "Each show gets a dedicated page containing everything a fan needs: RSVP controls, a live attendee count, an invite challenge, and directions. For past shows, the page converts to a retrospective gallery featuring high-quality live performance clips and a 'Notify Me Next Time' automated email collector so fans never miss the next date.",
    whyItMatters:
      "Social proof and nostalgia are incredibly powerful. Showcasing actual live clips of past performances acts as the ultimate advertisement, while capturing emails from fans who missed out allows direct, high-conversion email marketing when returning to that city.",
    bullets: [
      "RSVP state machine with three states: Going, Interested, Not Going — updates live in Supabase",
      "For past shows, page embeds dynamic live YouTube performance captures to show what fans missed",
      "Notify Me Next Time form collects fan emails on past shows and records subscriptions in database",
      "Live attendee list shows who else is coming — fans can see their friends' faces",
      "Invite challenge progress bar: shows how many friends you've brought vs. the goal",
      "Dynamic QR code for easy IRL sharing — fans at the show scan and send the link to friends",
      "One-tap Google Maps directions using the venue's stored coordinates",
      "Show details pulled from Sanity CMS: venue, date, doors/show time, cover charge, all-ages status",
    ],
    howItWorks: [
      "A date check compares current time with show date to render either upcoming RSVP layout or past show view",
      "The past show template embeds the live video player and maps a registration POST endpoint to /api/shows/notify-me",
      "RSVP state is stored in Supabase's show_attendance table with user_id + show_id + status",
      "QR codes are generated server-side using the QR Server API with the show's URL",
    ],
    tags: ["RSVP State Machine", "Notify Me Email Collector", "Past Show Video Embed", "QR Codes", "Social Proof"],
    demo: "/demos/tour-map.webp",
    category: ["fan"],
    highlight: true,
    link: "/tour",
  },

  {
    icon: "📲",
    title: "SMS Proximity Alerts",
    tagline: "Fans get texted when 7th Heaven plays near them — automatically.",
    description:
      "Fans sign up once with their phone number and ZIP code. From that point on, any time 7th Heaven announces a show within driving distance of their area, they automatically receive a text message with full show details and a direct RSVP link. Everything is TCPA-compliant — fans can opt out at any time by replying STOP, and the system handles it instantly.",
    whyItMatters:
      "SMS open rates average 98% within 3 minutes of delivery. Email open rates hover around 20%. When a fan gets a text that says '7th Heaven is playing 12 miles from you this Saturday', they act on it. This system fills venues.",
    bullets: [
      "Fans submit their phone number and ZIP code on the fan dashboard — takes 20 seconds",
      "Phone number and geo-coordinates are stored in Supabase's sms_subscribers table",
      "When admin publishes a new show in Sanity, the proximity algorithm identifies which subscribers are within range",
      "Blast text includes: venue name, city, date, doors/show time, cover, live attendance count, and direct RSVP link",
      "RSVP link includes ?rsvp=going so fans are auto-marked as Going when they click through",
      "Fans can reply 1 for Going confirmation or 2 for Google Maps directions — both handled automatically",
      "STOP replies immediately unsubscribe the fan — START re-subscribes them",
      "Auto-cron option: system can automatically blast subscribers for shows within X days without admin involvement",
    ],
    howItWorks: [
      "Twilio powers all SMS sending — a proven carrier-grade platform with 99.95% uptime",
      "The /api/sms/send endpoint accepts a show ID, queries Supabase for nearby subscribers, and sends via Twilio's API",
      "Proximity matching uses the Haversine formula on stored lat/lng coordinates vs. venue coordinates",
      "The /api/sms/webhook endpoint receives all fan replies and routes them: STOP → unsubscribe, 1 → RSVP, 2 → directions",
      "Vercel Cron Jobs can trigger /api/sms/auto-blast daily at 9am to auto-send for upcoming shows",
    ],
    tags: ["Twilio SMS", "Geo-Targeting", "TCPA Compliant", "Auto-Cron", "98% Open Rate"],
    category: ["fan", "comms"],
  },

  {
    icon: "🔔",
    title: "Web Browser Alerts",
    tagline: "Native browser push notifications for fans without sharing phone numbers.",
    description:
      "For fans who prefer not to share their mobile number, we support native web browser alerts. Fans opt-in to browser notifications directly on the signup form or in their profile. On signup approval, the website triggers a desktop or browser notification dynamically showing details of the next upcoming show.",
    whyItMatters:
      "Privacy is a major concern for many users. Giving fans a permission-based native browser alert alternative removes subscription friction for phone-sensitive users while maintaining high open rates and instant show-day call-to-actions.",
    bullets: [
      "Fans opt-in to native browser notifications with one click directly from the proximity alert card",
      "Web browser notifications request permission natively using standard Notification API",
      "Saves notification preference inside accounts.json/database to target browser-specific broadcasts",
      "Triggers instant native feedback popups on successful show alert subscription with venue names",
      "Works on both desktop and mobile web browsers without requiring any app install",
    ],
    howItWorks: [
      "The signup form detects if standard Notification API is available in the current browser",
      "Selecting the browser alerts option executes Notification.requestPermission() to request system-level user consent",
      "On successful registration, the client constructs a new Notification object using browser runtime APIs to show custom text details and a band emoji",
      "Notification preferences are sent to the /api/notify endpoint to persist 'notifyBrowser' status in the user's account record",
    ],
    tags: ["Browser Alerts", "Notification API", "Permissions", "No-Install Push"],
    category: ["fan", "comms"],
  },

  {
    icon: "🏆",
    title: "Fan Dashboard",
    tagline: "A personalized backstage hub for every registered fan.",
    description:
      "The fan dashboard is the home base for every registered fan. It's not a simple profile page — it's a full engagement hub with a live stream feed, show alerts, a VIP prize wallet, a referral program, photo submissions, and access to the cruise community. The more a fan engages, the more the dashboard surfaces.",
    whyItMatters:
      "Registered fans who log into a dashboard are dramatically more loyal than anonymous visitors. A personal hub gives fans a reason to return to the site regularly, increases time on site, and creates the emotional connection that turns a casual listener into a true superfan.",
    bullets: [
      "Live-stream access panel — when crew is broadcasting, fans see it here first",
      "Next upcoming show countdown with one-tap RSVP from the dashboard",
      "SMS show-alert opt-in with ZIP code — fans subscribe without ever leaving their dashboard",
      "VIP prize wallet: raffle wins, claim PINs, and prize history all stored here",
      "Referral program with personal shareable QR code — fans track their referral count vs. leaderboard",
      "Fan photo submission with instant AI pre-screen — approved photos appear on the photo wall",
      "Cruise toggle: if the fan is a registered cruise passenger, they can switch to the cruise dashboard",
      "Role-based routing: if a fan is also crew, they see a crew dashboard link",
      "60-day auto-expiry for cruise passenger access — managed automatically by the auth system",
    ],
    howItWorks: [
      "Fan accounts are created via Supabase Auth with role:'fan' assigned in the profiles table",
      "JWT session tokens are stored in Supabase's session management — 7-day refresh cycle",
      "The dashboard component checks the user's role on mount and renders the appropriate sections",
      "The referral QR code is generated via the QR Server API using the fan's unique referral code (stored in Supabase)",
      "The prize wallet reads from the raffle_entries table filtered by user_id with status='winner'",
    ],
    tags: ["Role-Based Access", "JWT Sessions", "Referral Program", "VIP Wallet", "60-Day Cruise Expiry"],
    demo: "/demos/fan-dashboard.webp",
    category: ["fan"],
    highlight: true,
    link: "/fans",
  },

  {
    icon: "✉️",
    title: "Bulk Fan Invitations with PINs",
    tagline: "Build your fan database in bulk with pre-confirmed email verification PINs.",
    description:
      "Administrators can upload CSV contact lists or paste raw names and emails to bulk-invite fans to register. Each invited fan receives a customized invitation containing a unique, 7-day 6-digit PIN. Clicking the link auto-opens the signup modal, pre-fills the details, and registers the fan instantly without needing an extra PIN dispatch step.",
    whyItMatters:
      "Organic growth is slow. Importing existing mailing lists or contact spreadsheets dynamically allows you to capture hundreds of fans at once. By streamlining the verification step (eliminating double-sending of PINs), conversion rates from email invitation to active dashboard user increase dramatically.",
    bullets: [
      "Upload standard CSV contact spreadsheets directly via drag-and-drop or select file buttons",
      "Directly copy-paste comma/tab-separated text contact lists into the dashboard textarea",
      "Automatic client-side name/email parsing matches columns regardless of format",
      "Auto-generated 6-digit PINs saved to local secure store with 7-day expiration time-to-live",
      "Invites dispatched in rate-limited batches of 10 to guarantee high Resend API delivery success",
      "Clickable invitation links auto-open sign-up dialogs with pre-filled email and code inputs",
      "Direct sign-up verification bypasses secondary code requests, creating the user instantly",
    ],
    howItWorks: [
      "Admin uploads CSV or pastes emails in BulkInvitePanel; front-end parses contacts using client-side regex",
      "Client sends batch POST requests to /api/admin/invite-csv with invitee list payloads",
      "The endpoint checks requireAdmin authorization, generates a random 6-digit PIN, saves it to pins registry, and sends the fanInvitation email blast",
      "When the fan clicks the URL, LoginModal detects search params in useEffect, pre-populates state, and routes direct submit credentials to /api/auth/verify-pin on signup",
    ],
    tags: ["CSV Import", "Bulk Emails", "PIN Codes", "Bypass Verification", "Next.js Route"],
    demo: "/demos/email-templates.webp",
    category: ["fan", "comms", "platform"],
    highlight: true,
    link: "/admin",
  },

  {
    icon: "🔗",
    title: "Referral Program",
    tagline: "Turn every fan into a promoter.",
    description:
      "Every registered fan gets a personal referral code and a scannable QR code they can share in person or online. When someone signs up using that link, the referring fan gets credit. A live leaderboard shows the top referrers, creating friendly competition and organic fan-driven growth.",
    whyItMatters:
      "Word-of-mouth from a trusted friend converts at 4× the rate of a digital ad. By gamifying referrals with a leaderboard and QR codes, the platform turns every fan into an active recruiter — growing the fanbase at zero acquisition cost.",
    bullets: [
      "Each fan receives a unique referral code on account creation",
      "Downloadable QR code that encodes the fan's referral link — perfect for sharing at shows",
      "Every new signup that uses the referral link is tracked in Supabase's referrals table",
      "Live leaderboard on the fan dashboard shows top 10 referrers with referral counts",
      "Referral count displayed prominently on the fan's own dashboard",
      "Referral links work for both web and SMS — fans can text the link directly",
    ],
    howItWorks: [
      "On account creation, a unique referral code (UUID-based) is generated and stored in the fan's profile record",
      "When anyone visits /fans?ref=[code] and signs up, the code is written to the new user's referred_by field in Supabase",
      "The leaderboard queries Supabase for a count of referrals grouped by referrer",
      "QR codes are generated via the QR Server API and displayed as an inline QR code image",
    ],
    tags: ["QR Code", "Live Leaderboard", "Supabase Tracking", "Zero Ad Cost"],
    category: ["fan"],
  },

  // ── LIVE STREAMING ──────────────────────────

  {
    icon: "📡",
    title: "Live Stream Hub",
    tagline: "See who's live — every active broadcast in one place.",
    description:
      "The Live Stream Hub at /live is a real-time gallery of every active crew broadcast. It automatically detects which crew members are currently streaming via LiveKit, validates them against the Supabase database, and displays their names, avatars, and viewer counts. Stale or ghost streams are automatically cleaned up. Fans click any card to enter the viewer.",
    whyItMatters:
      "Fans shouldn't have to guess whether the band is live right now. A dedicated hub that shows exactly who's broadcasting — and how many people are watching — creates urgency and drives immediate engagement the moment a stream starts.",
    bullets: [
      "Aggregates all active LiveKit rooms in real time via the LiveKit server API",
      "Cross-validates each room against Supabase's live_streams table — only authenticated crew streams are shown",
      "Ghost streams (LiveKit rooms with no corresponding DB record) are automatically filtered out",
      "Stale feeds (streams that ended but weren't closed properly) are cleaned up on a 30-second polling cycle",
      "Each broadcast card shows: crew member name, avatar, stream title, live viewer count, and duration",
      "Viewer count updates in real time without page refresh",
      "When no streams are active, the page shows a 'No Live Streams' state with the schedule of next upcoming events",
      "Homepage auto-detects when any stream appears here and shows the LIVE banner",
    ],
    howItWorks: [
      "The /api/live-rooms endpoint queries the LiveKit server API for all active rooms",
      "Each room name is matched against crew member IDs in the Supabase profiles table",
      "A Supabase real-time subscription on live_streams keeps the hub updated without polling",
      "The viewer count is pulled from LiveKit's participant count API per room",
      "A cleanup job runs when a crew member ends their stream, removing the Supabase record",
    ],
    tags: ["LiveKit", "WebRTC", "Auto-Cleanup", "Real-Time", "Multi-Room"],
    demo: "/demos/live-hub.webp",
    category: ["live"],
    highlight: true,
    link: "/live",
  },

  {
    icon: "🎥",
    title: "Fan Live Viewer",
    tagline: "An immersive front-row seat — from anywhere in the world.",
    description:
      "The fan viewing experience is designed to feel like being front-row at a show. The video stream is full-screen, the chat runs alongside it in real time, floating emoji reactions fly across the screen, a hype meter fills up as fans engage, and crew announcements are pinned prominently. When the hype meter hits 100%, confetti-style emoji bursts fill the entire screen.",
    whyItMatters:
      "A passive YouTube stream has no community. A live experience with chat, reactions, raffles, and flash drops keeps fans locked in for the entire broadcast — and dramatically increases the revenue potential of each stream through merch sales and raffle entries.",
    bullets: [
      "WebRTC video stream via LiveKit — low-latency, high-quality, no buffering",
      "Full-screen viewing mode with a collapsible chat sidebar",
      "Real-time chat: every message appears instantly for all viewers simultaneously",
      "PG content enforcement on all chat messages — profanity and political content blocked automatically",
      "Floating emoji reactions: fans choose from 20 emojis, they float up the screen for all to see",
      "Hype Meter (0–100%) fills based on chat activity and reaction frequency",
      "At 100% hype, full-screen emoji burst animation fires for all viewers simultaneously",
      "Pinned crew announcements appear at the top of the chat with a special badge",
      "Multi-room switcher in the sidebar — fans can jump between active crew feeds without losing their place",
      "Stream-end detection: when the crew ends the stream, all fans see a 30-second countdown before the page transitions",
    ],
    howItWorks: [
      "LiveKit generates a viewer token via /api/livekit when a fan joins a room",
      "The @livekit/components-react library renders the video track in a custom player component",
      "Chat messages are stored in Supabase's chat_messages table with a real-time subscription that pushes new messages to all connected clients",
      "Emoji reactions are broadcast via Supabase real-time channels — they appear on every connected viewer's screen simultaneously",
      "The hype meter value is computed client-side based on the rate of incoming chat messages and reactions over the last 10 seconds",
    ],
    tags: ["WebRTC LiveKit", "Real-Time Chat", "Floating Reactions", "Hype Meter", "Multi-Room"],
    demo: "/demos/live-hub.webp",
    category: ["live"],
    highlight: true,
    link: "/live",
  },

  {
    icon: "🎛️",
    title: "Crew Broadcast Studio",
    tagline: "Go live from any browser — no software, no setup, no OBS.",
    description:
      "Crew members can start a live broadcast directly from their /crew dashboard with a single click. No streaming software, no external equipment beyond a webcam. The studio dashboard gives them full control: viewer count, chat moderation, reaction controls, and the ability to launch raffles and flash drops — all from the same screen.",
    whyItMatters:
      "Lowering the barrier to going live means crew members broadcast more frequently. More broadcasts mean more fan touchpoints, more merch sales opportunities, and a more active fanbase. Zero technical setup means anyone on the crew can go live — not just the tech-savvy ones.",
    bullets: [
      "One-click LiveKit room creation — stream starts in under 5 seconds",
      "Live viewer count displayed and updating every 5 seconds",
      "Chat panel shows incoming fan messages — crew can read and respond in real time",
      "One-tap mute on any fan — muted fans cannot send chat messages for the duration of the stream",
      "Reaction panel: crew can trigger a batch emoji blast visible to all viewers",
      "Raffle launcher: set prize name, minimum entrants, and duration — start with one tap",
      "Flash drop launcher: set product, price, stock, and countdown — launch with one tap",
      "Cross-tab synchronization: if the crew member has the dashboard open in two tabs, both tabs stay in sync",
      "Emergency kill-switch: admin can terminate any stream from the admin dashboard regardless of crew action",
    ],
    howItWorks: [
      "When crew clicks Go Live, the system calls /api/livekit to create a room and generate a host token",
      "A record is inserted into Supabase's live_streams table — this triggers the homepage and live hub to update",
      "The crew member's browser publishes their camera/microphone tracks to the LiveKit room",
      "Chat moderation works by inserting a muted_users record — the chat API rejects messages from muted users",
      "When the crew ends the stream, the LiveKit room is closed and the Supabase live_streams record is deleted",
    ],
    tags: ["LiveKit Streaming", "Cross-Tab Sync", "Chat Moderation", "One-Click Live"],
    category: ["live"],
    link: "/crew",
  },

  {
    icon: "🎥",
    title: "OBS Virtual Camera Support",
    tagline: "Stream from any WiFi camera, DSLR, or multi-angle rig — no extra code required.",
    description:
      "Crew members can use OBS Studio (free) to pull in any WiFi camera, IP camera, GoPro, DSLR, or capture card feed and output it as a Virtual Camera device. The /crew broadcast dashboard automatically detects it as a selectable camera — just pick it from the dropdown and go live. Supports scene switching, overlays, and multi-camera mixing all before the stream even hits LiveKit.",
    whyItMatters:
      "A phone camera is fine for casual streams, but a proper WiFi camera or DSLR gives the broadcast a professional, concert-quality look. OBS Virtual Camera unlocks that without changing a single line of code on the platform — it's a zero-cost upgrade in production value.",
    bullets: [
      "Works with any camera that OBS can capture: GoPro, DSLR, IP cameras, PTZ cameras, Insta360",
      "OBS outputs a Virtual Camera that appears in the browser's camera device list",
      "Crew selects the OBS Virtual Camera from the dropdown on the /crew page — stream starts immediately",
      "OBS handles scene mixing, picture-in-picture, text overlays, and quality settings",
      "Supports multiple camera angles switched live via OBS scenes",
      "Companion apps (GoPro Webcam, DJI Mimo) expose WiFi cameras as USB devices without OBS",
      "Elgato Cam Link and similar capture cards work the same way for professional camera rigs",
      "Zero code changes needed — the /crew page supports any video input the browser can access",
    ],
    howItWorks: [
      "Crew installs OBS Studio (free, Mac/Windows/Linux) and adds their WiFi camera as a source",
      "OBS captures the camera via RTSP, USB, or the camera's companion app",
      "Crew clicks 'Start Virtual Camera' in OBS — it registers as a system camera device",
      "On the /crew broadcast page, the camera selector now shows 'OBS Virtual Camera'",
      "Crew selects it, clicks Go Live — LiveKit publishes the OBS-processed video feed to all viewers",
    ],
    tags: ["Add-On", "OBS Studio", "WiFi Camera", "Zero Code", "Multi-Camera", "DSLR Support"],
    category: ["live"],
  },

  {
    icon: "📡",
    title: "LiveKit RTMP Ingress — Direct Camera Streaming",
    tagline: "Push any camera or encoder feed directly into a LiveKit room via RTMP — no browser needed.",
    description:
      "With LiveKit Ingress enabled, crew can stream from professional cameras, dedicated hardware encoders, or OBS directly into the platform via an RTMP endpoint — exactly like streaming to YouTube or Twitch, but routed into the 7th Heaven fan viewer. No laptop browser required on the streaming side. The camera operator just points their encoder at the RTMP URL and the stream appears live for all fans.",
    whyItMatters:
      "For professional shows, a crew member holding a phone or sitting at a laptop is not ideal. RTMP Ingress lets a dedicated camera operator run the feed completely independently — the stream goes direct to fans while the crew focuses on the performance. It's the same workflow used by professional live event broadcasters.",
    bullets: [
      "Any RTMP-capable device can push a stream: OBS, hardware encoders (Teradek, Magewell), cameras with built-in streaming",
      "LiveKit generates a unique RTMP ingest URL + stream key per room per session",
      "The fan viewer at /live/[room] receives the feed exactly as it does from a browser-based stream",
      "All platform features still work: chat, reactions, raffles, flash drops, hype meter",
      "Multiple ingress sources can be mixed — one camera for audio, one for video",
      "No browser tab required on the crew side — encoder runs independently",
      "Stream health monitoring: bitrate, packet loss, and connection status visible on crew dashboard",
      "Automatic fallback: if the RTMP feed drops, the room gracefully handles reconnection",
    ],
    howItWorks: [
      "A /api/livekit/ingress endpoint is added — it calls LiveKit's Ingress API to create an RTMP ingest session",
      "LiveKit returns an RTMP URL (e.g. rtmp://ingest.livekit.io/...) and a unique stream key",
      "The crew dashboard displays this URL + key — the camera operator pastes it into OBS or their encoder",
      "The encoder pushes the stream to LiveKit, which transcodes and distributes it to all viewer WebRTC connections",
      "The Supabase live_streams record is created as normal — homepage and live hub update automatically",
    ],
    tags: ["Add-On", "RTMP Ingress", "LiveKit API", "Professional Broadcast", "Hardware Encoder", "OBS"],
    category: ["live"],
  },

  {
    icon: "🎰",
    title: "Live Raffle Engine",
    tagline: "Mid-stream raffles that go from launch to winner email in under 2 minutes.",
    description:
      "The raffle engine is one of the most exciting features on the platform. Crew launches a raffle mid-stream, fans enter with a single tap, a live countdown runs, a winner is randomly selected and announced on-screen for all viewers to see, and a personalized winner email with a 6-digit PIN is sent automatically. The winner claims their prize at a dedicated page with no login required.",
    whyItMatters:
      "Raffles create appointment viewing — fans stay tuned because they might win something. They incentivize fans to keep the stream open and to chat (which drives the hype meter). They also drive email captures when fans register to enter, building the mailing list organically.",
    bullets: [
      "Crew sets: prize name, prize description, minimum number of entrants, countdown duration",
      "Fans see the raffle card overlay on their viewer screen — one tap to enter",
      "Entry is recorded instantly in Supabase — no duplicate entries allowed per fan per raffle",
      "A live countdown timer runs simultaneously for all viewers",
      "When the timer hits zero, the winner is selected via cryptographically random selection",
      "The winner's name flashes on-screen for all viewers — creates a moment of excitement",
      "A unique 6-digit PIN is generated and stored in Supabase linked to the winner",
      "Winner email is sent via Resend within seconds — includes prize details, PIN, and claim link",
      "The prize claim page at /claim verifies the PIN and marks it as used — one-time only",
      "The raffle can auto-restart every 120 seconds for consecutive back-to-back draws",
    ],
    howItWorks: [
      "Raffle state is stored in Supabase's raffle_entries table — crew actions update it, all viewers subscribe to changes",
      "Supabase real-time broadcasts the countdown timer delta to all viewers simultaneously",
      "Winner selection uses Math.random() seeded at the server side to prevent prediction",
      "The PIN is generated as a 6-digit random integer, stored hashed in Supabase, and sent plaintext in the email",
      "Resend is called from the /api/raffle/winner endpoint with the pre-built Raffle Winner email template",
    ],
    tags: ["Real-Time State", "Supabase", "Resend Email", "PIN Claim", "Auto-Restart"],
    demo: "/demos/pick-awards.webp",
    category: ["live"],
    highlight: true,
  },

  {
    icon: "🔥",
    title: "Merch Flash Drops",
    tagline: "Limited-time exclusive merch drops — only available during a live stream.",
    description:
      "Flash drops are timed exclusive product sales that only appear during a live broadcast. The crew triggers a drop mid-stream, all viewers see a product card overlay with a countdown and live stock count, and fans can checkout instantly via Shopify or reserve their item for pickup at the merch table after the show. The urgency and exclusivity drives immediate conversions.",
    whyItMatters:
      "Combining live entertainment with limited-time commerce is proven to generate 3–5× higher conversion rates than standard e-commerce. Fans already emotionally engaged by the stream convert at dramatically higher rates when given an exclusive offer with a countdown.",
    bullets: [
      "Crew inputs: product name, description, price, available stock, and countdown duration",
      "All viewers see the flash drop overlay simultaneously — Supabase real-time broadcast",
      "Countdown timer runs live — creates urgency",
      "Live stock counter decrements as fans purchase — creates scarcity",
      "Ship option: redirects to a Shopify headless checkout for full payment and fulfillment",
      "Pickup option: generates a unique QR code that the fan shows at the merch table after the show",
      "Crew sees a live sales count in their broadcast dashboard as orders come in",
      "Dropped items can be tied to actual Shopify inventory — stock is decremented in real time",
    ],
    howItWorks: [
      "Crew triggers the drop via the /api/stream/flash-drop endpoint — a Supabase real-time broadcast fires to all viewers",
      "For Ship orders, the system creates a Shopify cart via GraphQL and redirects to the Shopify checkout URL",
      "For Pickup orders, a reservation record is created in Supabase and a QR code is generated via the QR Server API",
      "The countdown is synchronized via Supabase real-time — server timestamp is the source of truth to prevent drift",
    ],
    tags: ["Shopify Checkout", "Live Timer", "Pickup QR", "Real-Time Scarcity"],
    category: ["live", "ecommerce"],
  },

  {
    icon: "💬",
    title: "PG-Moderated Live Chat",
    tagline: "Real-time chat that's safe for all ages — two layers of protection.",
    description:
      "The live chat has two independent layers of content moderation. The first is a client-side filter that catches violations before any network request is even made. The second is a server-side enforcement layer that validates every message, applies rate limiting, checks for spam patterns, and blocks role spoofing. Crew can mute any fan with a single tap.",
    whyItMatters:
      "A chat without moderation becomes toxic fast, driving away fans and creating liability. Two-layer moderation means the platform is safe for all ages — including younger fans — without requiring a human moderator watching every message in real time.",
    bullets: [
      "Client-side pre-filter: catches 50+ profanity variations and 30+ political keywords before any network call",
      "Server-side enforcement: independent validation at the API level — client filter bypass is impossible",
      "Word-boundary regex matching prevents false positives (e.g. 'assume' doesn't trigger 'ass')",
      "Rate limiter: max 5 messages per 10 seconds per IP — prevents message flooding",
      "URL blocking: links are not allowed in chat — prevents spam and phishing",
      "Repeat-character detection: 'aaaaaaaaaa' is blocked as spam",
      "Emoji flood detection: 8+ consecutive emoji is rejected",
      "Role spoofing prevention: client-supplied roles are ignored — server always assigns 'fan'",
      "Crew one-tap mute: muted fans cannot send messages for the duration of the stream",
      "Blocked messages show a friendly animated error toast — no harsh error pages",
    ],
    howItWorks: [
      "Client-side: isPgViolation() runs regex tests against a local BLOCKED_TERMS array before fetch() is called",
      "Server-side: /api/chat/send runs containsBlockedContent() independently of the client",
      "Rate limiting uses an in-memory Map keyed by the first IP in x-forwarded-for, with sliding 10-second windows",
      "The mute list is stored in Supabase's banned_users table per room — checked on every message insert attempt",
      "A singleton Supabase admin client is reused across requests — no connection overhead per message",
    ],
    tags: ["Dual-Layer Moderation", "Rate Limiting", "Crew Mute Controls", "XSS Protection", "Role Enforcement"],
    category: ["live"],
  },

  // ── BOOKING ──────────────────────────────────

  {
    icon: "📋",
    title: "Multi-Step Booking & Scheduling Hub",
    tagline: "Event planners request single or multi-date runs with modular options.",
    description:
      "The booking flow is a polished, guided multi-step form that allows planners to select multiple dates and time slots in a single submission, configure unique requirements per show (like door times, cover charges, and age restrictions), and secure their identity using a 6-digit email verification PIN code. It creates a planner account, dispatches Resend confirmation alerts, and logs requests in the admin dashboard.",
    whyItMatters:
      "Reducing booking friction increases conversion rates. Allowing planners to book multiple shows at once saves time, while separate slot-level details and visual calendar pickers make the platform flexible for professional tour coordinators.",
    bullets: [
      "Step 1: Event Schedule & Format — calendar picker with multi-date selection, alternate date holds, and slot settings",
      "Step 2: Contact Information — organizer details, name, phone, and optional organization info",
      "Step 3: Venue Details — setup/load-in times, expected attendance, and indoor/outdoor configuration",
      "Granular Slot Customization — unique door times, cover charges, ticket links, age restrictions, and event types per slot",
      "Reuse/Separate Info Utility — toggle matching vs. separate contact and venue details for individual dates easily",
      "Email PIN Verification — 6-digit verification code dispatched via Resend to verify email ownership before password creation",
      "Auto-login & redirect to the /planner dashboard immediately upon successful PIN confirmation",
      "Row-Level Security enforced booking records in Supabase with status:'pending' for admin review",
      "Planner can cancel inquiries at any time via a secure token link in their email",
    ],
    howItWorks: [
      "Form slots and scheduling state are synchronized using React context and stored in local state",
      "On password submission, /api/auth/send-pin generates a secure 6-digit code and logs it locally in dev mode",
      "On verification, /api/auth/verify-pin pre-confirms the member in Supabase Auth and logs them in via MemberContext",
      "A cancel token (UUID) is generated at booking time and stored in Supabase — included in the confirmation email",
      "Admin reviews, approves, or directly contacts the booker from the booking approval dashboard",
    ],
    tags: ["PIN Verification", "Multi-Slot Scheduling", "Supabase", "Resend Email", "Local Storage Pre-fill"],
    demo: "/demos/booking-form.webp",
    category: ["booking"],
    highlight: true,
    link: "/book",
  },

  {
    icon: "📊",
    title: "Planner Dashboard",
    tagline: "Event planners track their booking from inquiry to show day.",
    description:
      "Once a planner submits a booking, they get access to a personal dashboard where they can track their booking's status in real time, view full event details, edit their own checklist, and re-book for future events. The dashboard also supports non-authenticated browsing so potential clients can see what the dashboard looks like before committing to creating an account.",
    whyItMatters:
      "Planners who can see their booking status in real time stop emailing the band to ask where things stand. The dashboard reduces administrative overhead for the band while making planners feel informed, respected, and confident.",
    bullets: [
      "Real-time booking status: Pending → Under Review → Approved → Deposit Received → Confirmed → Completed",
      "Each status change triggers an email notification to the planner",
      "Full event details view: date, venue, event type, production package, expected attendance",
      "Inline checklist editor — planners add their own notes, tasks, and reminders",
      "Re-book flow: returning planners can submit a new inquiry pre-filled with their previous event details",
      "Non-authenticated browse mode: visitors can see the planner portal layout without creating an account",
      "Row-Level Security enforced at the database level — planners can only see their own booking records",
    ],
    howItWorks: [
      "Supabase Row-Level Security policies restrict SELECT/UPDATE queries to the authenticated planner's own records",
      "The booking status field is updated by admin in the /admin panel — Supabase real-time pushes the change to the planner's dashboard instantly",
      "Checklist items are stored as JSONB in the bookings record — the planner's edits call a PATCH endpoint",
      "Email notifications on status changes are triggered by a Supabase database webhook that calls /api/email",
    ],
    tags: ["Role-Based Access", "Row-Level Security", "Real-Time Status", "Email Notifications"],
    category: ["booking"],
    link: "/planner",
  },

  {
    icon: "🔑",
    title: "Token-Based Cancellation",
    tagline: "Cancel a booking or cruise registration — no login, no friction.",
    description:
      "Both the booking system and the cruise signup system generate a secure one-time cancellation token at the moment of registration. This token is embedded in every confirmation email as a cancel link. Clicking it takes the user to a confirmation page where they can cancel with one click — no account, no password, no phone call.",
    whyItMatters:
      "Forcing users to log in to cancel creates friction and frustration. A token-based system respects the user's time, reduces support requests, and ensures the band's database stays clean with accurate records — no ghost bookings sitting in Pending forever.",
    bullets: [
      "Unique UUID token generated at booking / cruise signup time",
      "Token stored in Supabase alongside the booking/signup record",
      "Cancellation link embedded in the confirmation email: 7thheavenband.com/book/cancel?token=[uuid]",
      "Cancellation page validates the token — if invalid or expired, shows a friendly error",
      "On confirmation, Supabase record status is updated to 'cancelled'",
      "Admin receives an instant cancellation alert email via Resend",
      "Token is one-time use — once cancelled, the link can't be used again",
      "Works for both booking cancellations (/book/cancel) and cruise registrations (/cruise/cancel)",
    ],
    howItWorks: [
      "Token generation uses crypto.randomUUID() on the server at time of form submission",
      "The cancel page (/book/cancel?token=...) reads the token from the URL, queries Supabase for a matching record",
      "If found and not already cancelled, it renders the cancellation confirmation UI",
      "On confirm, a PATCH call updates the status field and triggers the admin alert email",
    ],
    tags: ["Secure UUID Tokens", "No-Login Flow", "Admin Alerts", "One-Time Use"],
    category: ["booking"],
  },

  // ── CARIBBEAN CRUISE ─────────────────────────

  {
    icon: "🚢",
    title: "Caribbean Cruise Campaign",
    tagline: "A full cruise microsite — from hype to community signup.",
    description:
      "The cruise section is a complete campaign microsite built to drive interest, capture registrations, and instantly create community accounts for passengers. It has a cinematic video hero, a live fan counter that shows how many people have signed up, a day-by-day itinerary, an FAQ accordion, and a community opt-in that creates a Supabase-authenticated passenger account via a secure invite link.",
    whyItMatters:
      "A standalone landing page in the middle of a band website loses context and credibility. A fully integrated cruise microsite within the main platform creates a seamless brand experience — fans who are already engaged with 7th Heaven's music and live streams are the perfect audience for a cruise pitch.",
    bullets: [
      "Cinematic hero section with full-width background and animated overlay text",
      "Interest signup form: name, email, phone — one clear CTA",
      "Live fan counter: shows the current number of registered passengers in real time as signups come in",
      "Day-by-day itinerary: port stops, dates, excursion highlights, icons for each day",
      "What's Included section: accommodations, meals, shows, activities",
      "FAQ accordion with expandable answers to the 10 most common questions",
      "Community opt-in: creates a Supabase passenger account via Supabase's generateLink invite system",
      "Cancellation token embedded in the confirmation email",
      "Admin sees all registrations in the Cruise tab of the admin dashboard",
    ],
    howItWorks: [
      "Cruise signups POST to /api/cruise/signup — records are inserted into Supabase's cruise_signups table",
      "The live counter queries Supabase for a COUNT of all registrations — updates on a 15-second poll",
      "Community opt-in calls Supabase's admin.generateLink() to create a magic invite link for the passenger",
      "The invite link is included in the Cruise Community Welcome email sent via Resend",
      "When the passenger clicks the invite link, their Supabase Auth account is created and they get access to /cruise/dashboard",
    ],
    tags: ["Supabase Auth Invite", "Live Counter", "Email Confirmation", "Itinerary", "Cinematic Hero"],
    demo: "/demos/cruise.webp",
    category: ["fan"],
    highlight: true,
    link: "/cruise",
  },

  {
    icon: "🛳️",
    title: "Cruise Passenger Dashboard",
    tagline: "An exclusive members-only hub for everyone on the cruise.",
    description:
      "Registered cruise passengers get access to a dedicated dashboard that serves as their go-to resource before and during the trip. Admin can post formatted announcements, pin important lounge messages, curate a list of important links, and build out the full day-by-day itinerary — all from the admin panel without touching code.",
    whyItMatters:
      "Cruise passengers have a lot of questions. A centralized dashboard with admin-managed content means every question has a clear answer — reducing emails and WhatsApp messages to the band while making passengers feel taken care of and excited about the trip.",
    bullets: [
      "Admin posts important announcements using a WYSIWYG editor (ReactQuill) — formatted text, links, images",
      "Pinned lounge messages appear prominently on login — ideal for urgent updates",
      "Important links panel: admin curates a list of booking sites, packing lists, and excursion links",
      "Cruise chat lounge: real-time chat exclusively for passengers — build community before the trip",
      "Day-by-day itinerary with custom icons, port names, and highlights",
      "Embarkation countdown timer — counts down to the departure date",
      "Passenger roster widget showing how many people are registered",
      "Cross-promo banner linking to the 7th Heaven fan dashboard for non-fan passengers",
    ],
    howItWorks: [
      "Passenger access is role-gated: only users with role:'cruiser' in their Supabase profile can access /cruise/dashboard",
      "Admin announcements and lounge pins are stored in Supabase's site_settings table as JSONB",
      "The cruise chat uses the same Supabase real-time chat infrastructure as the live stream chat",
      "The itinerary is managed in Supabase — admin adds/edits days via the admin dashboard",
    ],
    tags: ["Role-Based Access", "WYSIWYG Editor", "Real-Time Chat", "Admin Controlled", "Countdown Timer"],
    category: ["fan"],
    link: "/cruise/dashboard",
  },

  // ── E-COMMERCE ───────────────────────────────

  {
    icon: "🛒",
    title: "Headless Merch Store",
    tagline: "Full Shopify integration — fans never leave the site to shop.",
    description:
      "The merch store is a fully headless Shopify integration. Fans browse products, filter by category, and add items to a cart — all within 7thheavenband.com. Only the final payment step happens on Shopify's secure checkout gateway. No customer data is stored on 7th Heaven's servers — Shopify handles everything.",
    whyItMatters:
      "Redirecting fans to Shopify the moment they want to buy breaks the brand experience and increases cart abandonment. Keeping the browsing and cart experience native to the site maintains the immersive feel — fans stay in the world of 7th Heaven until they absolutely have to complete payment.",
    bullets: [
      "Product grid pulled directly from Shopify's Storefront API via GraphQL — live prices and inventory",
      "Category filters (T-Shirts, Hats, Accessories, Limited Edition) with instant client-side filtering",
      "Product detail modal with size selector, color picker, and quantity control",
      "Add-to-cart creates a Shopify cart via a GraphQL cartCreate mutation — cart ID stored in localStorage",
      "Cart drawer slides in from the right with line items, quantities, and a running total",
      "Remove/update quantities in cart via GraphQL cartLinesUpdate mutations",
      "Checkout button redirects to the Shopify-hosted checkout URL with the cart pre-loaded",
      "Inventory levels shown: 'Only 3 left!' when stock is low",
      "Zero customer data stored on 7th Heaven's servers — Shopify is the source of truth",
    ],
    howItWorks: [
      "All product data is fetched via Shopify's Storefront API using the public storefront access token",
      "GraphQL queries are run server-side at request time for fresh data (no stale cache)",
      "Cart mutations are client-side direct-to-Shopify — the cart ID is the session key",
      "The /api/shopify route proxies requests to avoid exposing the access token in client-side code",
    ],
    tags: ["Shopify Storefront API", "GraphQL", "Headless Checkout", "Live Inventory", "No Data Storage"],
    demo: "/demos/store-merch.webp",
    category: ["ecommerce"],
    highlight: true,
    link: "/store",
  },

  {
    icon: "🏅",
    title: "Raffle Prize Claim Portal",
    tagline: "Winners claim prizes in seconds — no login, no friction.",
    description:
      "When a fan wins a live raffle, they receive an email with a 6-digit PIN. They navigate to /claim, enter their PIN, and instantly see their prize details and claim confirmation. The PIN is one-time use — once claimed, it's invalidated in the database. Crew can verify claimed prizes at the merch table via the admin panel.",
    whyItMatters:
      "Prize delivery friction kills raffle excitement. A seamless, no-login claim experience means winners actually collect their prizes — and the experience reinforces how slick the platform is. Winners share their win on social media, driving more fans to the next stream.",
    bullets: [
      "Winners receive a 6-digit PIN in their Raffle Winner email (Resend) immediately after the draw",
      "Claim page at /claim — PIN entry form, no account needed",
      "PIN is validated against Supabase's raffle_prizes table",
      "If valid: shows prize name, winner name, collection instructions",
      "If invalid or already claimed: shows a clear error state",
      "PIN is marked as used='true' after successful claim — cannot be reused",
      "Crew and admin can see all claimed/unclaimed prizes in the admin dashboard",
      "Pickup QR option: claim generates a QR code the fan shows at the merch table",
    ],
    howItWorks: [
      "The 6-digit PIN is generated server-side as a random integer between 100000–999999",
      "It's stored alongside the raffle_entry record in Supabase with is_claimed:false",
      "The /claim page calls /api/raffle/claim with the PIN — the API queries Supabase and returns prize details if valid",
      "On successful claim, a PATCH updates is_claimed to true — subsequent requests return 'already claimed'",
    ],
    tags: ["6-Digit PIN", "One-Time Token", "No-Login Claim", "Supabase", "Admin Verification"],
    demo: "/demos/claim.webp",
    category: ["ecommerce", "live"],
    link: "/claim",
  },

  // ── COMMUNICATIONS ───────────────────────────

  {
    icon: "📧",
    title: "12 Email Templates",
    tagline: "Every user action that matters has a fully branded email.",
    description:
      "Every meaningful event in the platform — a booking, a raffle win, a cruise signup, a new account — triggers a beautifully branded HTML email. All 12 templates are built in React (using react-email) and sent via Resend. Every template features the 7th Heaven logo, brand colors, and properly formatted mobile-responsive HTML. Admins can preview and test every template from /admin/emails.",
    whyItMatters:
      "Professional transactional emails are a direct reflection of the brand. A fan who wins a raffle and gets a polished, branded winner email feels the experience is premium. A planner who gets a detailed booking confirmation feels confident the band is professional and organized.",
    bullets: [
      "Booking Confirmation → event planner: full booking details, event summary, cancel link",
      "Booking Admin Alert → band management: new inquiry details, planner info, review link",
      "Booking Status Update → planner: fires when status changes (Approved, Confirmed, Completed)",
      "Booking Cancelled Alert → admin: fires when planner cancels via token link",
      "Raffle Winner → fan: prize name, 6-digit PIN, claim link",
      "Raffle Entry Confirmation → fan: confirmation they've entered, stream link",
      "Cruise Signup Confirmation → registrant: registration summary, cancellation link",
      "Cruise Community Welcome → registrant: secure invite link to create their dashboard account",
      "Cruise Cancellation → registrant: cancellation confirmation",
      "Welcome — Fan → new fan: account welcome with dashboard link",
      "Welcome — Planner → new planner: account welcome with dashboard link",
      "Newsletter Blast → all fans & subscribers: admin-composed announcement",
    ],
    howItWorks: [
      "Templates are built as React components using react-email for clean, cross-client compatible HTML",
      "Each template is rendered server-side and sent via Resend's API with the appropriate to/from/subject",
      "All templates are previewed and test-sent from /admin/emails — no code deployment needed to test",
      "RESEND_FROM_EMAIL env variable controls the sender address — switching to a custom domain requires one env change",
    ],
    tags: ["Resend", "12 Templates", "React Email", "HTML", "Mobile Responsive", "Admin Preview"],
    demo: "/demos/email-templates.webp",
    category: ["comms"],
    highlight: true,
  },

  {
    icon: "📱",
    title: "10-Template SMS System",
    tagline: "Twilio-powered text messages for every fan interaction.",
    description:
      "The SMS system is a complete Twilio integration covering every scenario where a text message makes sense: show proximity alerts, live-stream notifications, RSVP confirmations, Google Maps directions, opt-in/opt-out lifecycle, and internal crew alerts. All fan-facing messages are TCPA-compliant with fully automated STOP/START handling.",
    whyItMatters:
      "Text messages have a 98% open rate within 3 minutes. For time-sensitive events — a show tonight, a crew member just went live — there is no more effective communication channel. The 10-template system covers every touchpoint where a text message converts a fan action into a real-world result.",
    bullets: [
      "Subscribe: welcome text sent immediately when a fan opts in, confirms their ZIP code on file",
      "Live Alert: blasted to all subscribers the moment a crew member starts a broadcast",
      "Proximity Blast: show details + RSVP link sent to fans near the venue",
      "Auto-Cron Blast: Vercel cron fires daily — auto-sends proximity blasts without admin involvement",
      "RSVP Reply (reply '1' or 'GOING'): auto-sends show page link with ?rsvp=going pre-filled",
      "Directions Reply (reply '2' or 'DIRECTIONS'): auto-sends Google Maps link using venue GPS coordinates",
      "STOP Auto-Reply: immediate unsubscribe confirmation — TCPA required",
      "START Auto-Reply: re-subscribe confirmation for returning fans",
      "Crew Alert: admin sends urgent internal messages to all crew members simultaneously",
    ],
    howItWorks: [
      "Twilio sends all outbound SMS via the /api/sms/* endpoints using the Twilio Node.js SDK",
      "Inbound fan replies (STOP, START, 1, 2) are received by Twilio and forwarded to /api/sms/webhook",
      "The webhook parses the reply body and routes to the appropriate handler (unsubscribe, RSVP, directions)",
      "The auto-cron blast is triggered by a Vercel Cron Job at 9am daily — it queries Sanity for upcoming shows and Supabase for nearby subscribers",
      "TCPA compliance: STOP removes opted_in=true in Supabase, START restores it",
    ],
    tags: ["Twilio", "10 Templates", "TCPA Compliant", "Auto-Cron", "Vercel Cron", "98% Open Rate"],
    category: ["comms"],
  },

  {
    icon: "📰",
    title: "Newsletter Blast",
    tagline: "Reach every fan and subscriber in one click from the admin dashboard.",
    description:
      "Admin composes a newsletter directly in the admin dashboard and sends it to the entire fan database and newsletter subscriber list in one action. The email is sent via Resend using the branded Newsletter Blast template. No third-party email marketing platform needed — it's built directly into the admin panel.",
    whyItMatters:
      "Email newsletters drive more ticket sales and merch purchases than any social media post. Having the capability built directly into the admin panel means the band can communicate instantly without learning Mailchimp or Klaviyo.",
    bullets: [
      "Admin composes subject line and body content directly in the /admin dashboard",
      "Rich text formatting: bold, italic, links, and line breaks supported",
      "One click sends to: all Supabase profiles (registered fans) + all newsletter_subscribers (email-only signups)",
      "Branded Newsletter Blast template: 7th Heaven logo, colors, unsubscribe link",
      "Delivery handled by Resend — reliable infrastructure with bounce handling",
      "Unsubscribe links in every newsletter are GDPR-compliant and automatically processed",
      "Admin can preview the email template at /admin/emails before sending",
    ],
    howItWorks: [
      "The /api/admin/newsletter endpoint fetches all opted-in emails from Supabase profiles + newsletter_subscribers",
      "For each email, a Resend send call is made with the newsletter template rendered with the admin's content",
      "Unsubscribe processing updates opted_in=false in Supabase when a link is clicked",
    ],
    tags: ["Resend", "Admin Dashboard", "Bulk Email", "GDPR Unsubscribe", "Instant Delivery"],
    category: ["comms"],
  },

  // ── PLATFORM ─────────────────────────────────

  {
    icon: "⚡",
    title: "Master Admin Dashboard",
    tagline: "One interface to control the entire platform.",
    description:
      "The admin dashboard at /admin is the control center for everything. It's divided into two main tabs — Band and Cruise — each with its own suite of tools. Band management, booking approvals, live stream controls, fan photo moderation, SMS blasts, newsletter, community registry, and a full audit log — all in one place. The Cruise tab covers passenger management, announcements, lounge pins, links, and the itinerary builder.",
    whyItMatters:
      "A band doesn't have time to juggle 8 different tools. Having everything — from booking approval to cruise passenger management to live stream controls — in a single admin interface means the team can manage the entire digital operation in minutes per day, not hours.",
    bullets: [
      "Band Tab: analytics dashboard with fan signups, RSVP trends, and Shopify sales aggregation",
      "Band Tab: booking approval queue — approve, reject, update booking status with one click, or email the booker directly from the dashboard to request more info",
      "Band Tab: live stream controls — see all active streams, kill any stream emergency",
      "Band Tab: fan photo moderation — approve or reject fan photo submissions",
      "Band Tab: SMS blast tool — select a show, write a custom note, blast to nearby subscribers",
      "Band Tab: newsletter composer — write and send to all fans in one click",
      "Band Tab: community registry — see all registered fans, planners, and crew members",
      "Band Tab: crew account creator — create crew accounts with role assignment and username",
      "Band Tab: audit log — full history of admin actions with timestamps",
      "Cruise Tab: passenger announcement WYSIWYG editor (ReactQuill)",
      "Cruise Tab: passenger roster with export to CSV",
      "Cruise Tab: lounge chat pin manager",
      "Cruise Tab: important links manager — add/edit/remove curated links",
      "Cruise Tab: itinerary builder — add days with icons, port names, and highlights",
    ],
    howItWorks: [
      "Admin access is role-gated: only users with role:'admin' in Supabase profiles can access /admin",
      "All admin actions call dedicated /api/admin/* endpoints that validate role via the server-side Supabase session",
      "Shopify sales data is pulled via GraphQL queries to the Shopify Admin API",
      "The audit log writes a record to Supabase on every significant admin action",
      "Cruise tab data is stored in Supabase's site_settings table as structured JSONB",
    ],
    tags: ["Role-Based", "WYSIWYG Editors", "Shopify Admin API", "Audit Log", "CSV Export"],
    demo: "/demos/admin-dashboard.webp",
    category: ["platform"],
    highlight: true,
    link: "/admin",
  },

  {
    icon: "🧠",
    title: "AI Photo Moderation",
    tagline: "Client-side AI that blocks inappropriate images before they ever leave the browser.",
    description:
      "Fan photo submissions are screened by an AI model that runs entirely in the browser using TensorFlow.js. The NSFW.js model analyzes the image in under 500ms and scores it across several categories. If the score exceeds the threshold for inappropriate content, the upload is blocked immediately with a friendly error message — before any data is sent to the server.",
    whyItMatters:
      "Moderation after upload is too late — the image is already on your servers. Client-side AI screening prevents even the attempt of uploading inappropriate content, protecting the platform's integrity and eliminating the need for constant manual review of incoming submissions.",
    bullets: [
      "TensorFlow.js loads the NSFW.js model directly in the fan's browser",
      "Image is analyzed in under 500ms — no perceptible delay for the user",
      "Scores across 5 categories: Neutral, Drawing, Hentai, Porn, Sexy",
      "If any inappropriate category exceeds the threshold, upload is blocked",
      "Friendly error message shown to the user — no harsh rejection",
      "Zero inappropriate content ever reaches Supabase Storage",
      "Admin still has a final review queue for all submissions before they appear publicly",
      "The model runs offline — no external API calls, no latency from external services",
    ],
    howItWorks: [
      "The NSFW.js library is imported as a client-side dependency — it loads the TensorFlow model on demand",
      "When a fan selects an image, the model.classify() method scores it before the upload function is called",
      "The score is compared against a configurable threshold (default: 0.7 for any unsafe category)",
      "Only images that pass the AI check are submitted to the /api/fans/memories endpoint",
      "Supabase Storage receives only pre-screened images — admin approval is the second gate",
    ],
    tags: ["TensorFlow.js", "NSFW.js", "Client-Side AI", "Zero Server Exposure", "Real-Time Screening"],
    category: ["platform"],
  },

  {
    icon: "📝",
    title: "Sanity CMS",
    tagline: "Non-technical updates — instantly live on the site.",
    description:
      "Sanity CMS is the content backbone of the platform. Tour dates, news articles, band biographies, member profiles, site settings, and the media library are all managed through Sanity Studio — a clean, web-based editor. Changes made in Sanity appear on the live site within seconds via Sanity's live content API, with no redeployment needed.",
    whyItMatters:
      "If updating the website requires a developer, tour dates get stale, news goes unposted, and the site feels abandoned. Sanity means anyone on the band's team can update any content — from adding a new tour date to updating a member's bio — in under a minute, with zero technical knowledge.",
    bullets: [
      "Tour dates: add, edit, or cancel shows — appears on the tour map and list instantly",
      "News articles: publish announcements with rich text, images, and embed links",
      "Band bio: update the full band history timeline",
      "Member profiles: edit bios, gear lists, Q&A sections, and headshots per member",
      "Site settings: hero text, featured stats, homepage copy — all editable from Sanity",
      "Media library: centralized management of all site images and assets",
      "Draft preview: review changes in a preview mode before publishing to the live site",
      "Structured content with validation: required fields, character limits, and format rules prevent bad data",
      "Role-based access in Sanity Studio: editors can't accidentally delete critical content",
    ],
    howItWorks: [
      "Sanity data is fetched via GROQ queries using the @sanity/client library",
      "The SanityLive component in the app layout subscribes to Sanity's live content channel",
      "When content changes in Sanity Studio, the live channel pushes an update — the page re-renders without a full reload",
      "For static paths (e.g. /members/[slug]), Next.js generateStaticParams is used to pre-render all member pages at build time, with on-demand revalidation when Sanity content changes",
    ],
    tags: ["Sanity Studio", "GROQ Queries", "Live Content API", "Draft Preview", "No-Code Updates"],
    category: ["platform"],
    link: "/studio",
  },

  {
    icon: "🔐",
    title: "Role-Based Authentication",
    tagline: "Four user roles — each with precisely scoped access.",
    description:
      "The platform has four distinct user roles: Fan, Crew, Planner, and Admin. Each role has access to a different set of pages and API routes, enforced at both the frontend routing level and the database level via Supabase Row-Level Security. There is no way for a fan to access crew tools, or a planner to see another planner's booking — the data access rules are enforced in the database itself.",
    whyItMatters:
      "A platform with multiple user types needs airtight access control. Loose permissions create security vulnerabilities and data leaks. Role-Based Security enforced at the database level — not just in the UI — means even if someone bypasses the frontend, the database still rejects unauthorized reads and writes.",
    bullets: [
      "Fan role: fan dashboard, live viewing, RSVP, chat, referrals, photo wall, cruise (if passenger)",
      "Crew role: broadcast studio, raffle engine, flash drops, chat moderation, fan management",
      "Planner role: personal booking dashboard, checklist, re-book, status tracking",
      "Admin role: everything above plus the full admin command center",
      "JWT session tokens managed by Supabase Auth — 7-day refresh cycle",
      "Supabase Row-Level Security policies enforced at the database level on every table",
      "Cruise passenger accounts have a 60-day auto-expiry — managed by the auth system",
      "Server-side session validation on all API routes — client-supplied roles are never trusted",
    ],
    howItWorks: [
      "User roles are stored in the Supabase profiles table, set at account creation time",
      "Each protected page calls supabase.auth.getUser() server-side to verify the session",
      "Role is read from the profiles table and compared against the required role for that route",
      "Supabase RLS policies use the authenticated user's JWT sub claim to enforce data access rules",
      "The 60-day cruise expiry is implemented via a scheduled Supabase function that updates cruise_member_expires_at",
    ],
    tags: ["JWT", "Supabase Auth", "Row-Level Security", "4 Roles", "60-Day Expiry", "Server-Side Validation"],
    category: ["platform"],
  },

  {
    icon: "🛡️",
    title: "API Security Layer",
    tagline: "Every API route hardened — rate-limited, validated, and sanitized.",
    description:
      "Every public and protected API route is built with a security-first mindset. Rate limiting prevents abuse, input validation prevents bad data, role enforcement prevents privilege escalation, XSS sanitization prevents injection attacks, and spam detection keeps the chat clean. No API route trusts anything the client sends.",
    whyItMatters:
      "An insecure API is a liability. One unprotected endpoint can expose user data, allow spam attacks, or let bad actors impersonate crew members in the chat. Defense in depth — multiple independent security checks on every route — means no single point of failure.",
    bullets: [
      "Rate limiting: max 5 requests per 10-second window per IP — in-memory sliding window",
      "IP cleanup: the rate limiter Map is pruned when it exceeds 500 entries to prevent memory leaks",
      "Role enforcement: client-supplied roles (sender_role, etc.) are ignored — server always assigns from the database",
      "Input type validation: typeof checks on every field before any database interaction",
      "Length limits: all string inputs truncated to safe lengths before storage",
      "XSS sanitization: strips <>, {}, javascript: protocol injections, onXxx= event handlers",
      "Spam detection: URL blocking, repeated-character detection, emoji flood detection",
      "Room allowlist: only 'live_*' and 'cruise_*' chat room names accepted — prevents writing to arbitrary tables",
      "Singleton Supabase admin client: one connection per serverless process — no connection overhead per request",
    ],
    howItWorks: [
      "Rate limiting uses a module-level Map<string, { count, resetTime }> — persists across requests within the same serverless process",
      "The sanitise() function strips dangerous characters using a chain of regex replacements before any database write",
      "Role validation happens server-side: the user's role is read from the Supabase profiles table, not from the request body",
      "Input validation returns a 400 immediately for any missing/invalid field before reaching database code",
    ],
    tags: ["Rate Limiting", "Input Validation", "XSS Protection", "Role Enforcement", "Spam Detection", "Singleton Client"],
    category: ["platform"],
  },
];

/* ══════════════════════════════════════════════
   TECH STACK
══════════════════════════════════════════════ */
const TECH = [
  { name: "Next.js 15", desc: "React framework with App Router, SSR, ISR, and API routes — every page and API endpoint.", icon: "▲", color: "#ffffff" },
  { name: "Supabase", desc: "Auth, Postgres database, real-time subscriptions, Row-Level Security, and Storage.", icon: "⚡", color: "#3ecf8e" },
  { name: "LiveKit", desc: "WebRTC rooms, participant tracking, and token generation for crew broadcasts and fan viewing.", icon: "📡", color: "#818cf8" },
  { name: "Shopify", desc: "Storefront API via GraphQL — products, cart mutations, and headless checkout.", icon: "🛒", color: "#96bf48" },
  { name: "Twilio", desc: "All 10 SMS templates — outbound blasts, inbound webhooks, STOP/START compliance.", icon: "📱", color: "#f22f46" },
  { name: "Resend", desc: "All 12 transactional email templates — delivery, bounce handling, and test previews.", icon: "📧", color: "#60a5fa" },
  { name: "Sanity CMS", desc: "Tour dates, news, band bios, member profiles, site settings, and media library.", icon: "📝", color: "#f43f5e" },
  { name: "TensorFlow.js", desc: "Client-side NSFW image detection for fan photo submissions — zero server exposure.", icon: "🧠", color: "#fb923c" },
  { name: "Leaflet.js", desc: "Interactive tour maps — venue pins, geo-coordinates, popups, and filtering.", icon: "🗺️", color: "#a3e635" },
  { name: "TypeScript", desc: "End-to-end type safety across all 977 lines of the features page alone.", icon: "🔷", color: "#93c5fd" },
  { name: "Vercel", desc: "Edge deployment, CDN, environment management, and Cron Jobs for auto SMS blasts.", icon: "🚀", color: "#ffffff" },
  { name: "Tailwind CSS v4", desc: "Custom design system with brand tokens, glassmorphism utilities, and responsive layouts.", icon: "🎨", color: "#38bdf8" },
];

/* ══════════════════════════════════════════════
   CATEGORIES
══════════════════════════════════════════════ */
const CATEGORIES: { key: Category | "all"; label: string; icon: string }[] = [
  { key: "all", label: "All Features", icon: "✦" },
  { key: "fan", label: "Fan Experience", icon: "🎸" },
  { key: "live", label: "Live Streaming", icon: "📡" },
  { key: "booking", label: "Bookings", icon: "📋" },
  { key: "ecommerce", label: "E-Commerce", icon: "🛒" },
  { key: "comms", label: "Communications", icon: "📣" },
  { key: "platform", label: "Platform & Security", icon: "⚙️" },
];

/* ══════════════════════════════════════════════
   ANIMATED COUNTER
══════════════════════════════════════════════ */
function Counter({ end, label, sublabel }: { end: number; label: string; sublabel?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        let n = 0;
        const step = Math.max(1, Math.ceil(end / 40));
        const t = setInterval(() => { n += step; if (n >= end) { setCount(end); clearInterval(t); } else setCount(n); }, 28);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);
  return (
    <div ref={ref} className="text-center px-6 py-8">
      <div className="text-6xl md:text-7xl font-black text-white tabular-nums leading-none" style={{ fontFamily: "var(--font-barlow-condensed), var(--font-inter)", fontStyle: "italic" }}>
        {count}<span style={{ color: "#851DEF" }}>+</span>
      </div>
      <div className="text-base font-black uppercase tracking-[0.15em] text-white mt-2">{label}</div>
      {sublabel && <div className="text-sm text-white/30 mt-1 max-w-[180px] mx-auto leading-tight">{sublabel}</div>}
    </div>
  );
}

/* ══════════════════════════════════════════════
   DEMO PREVIEW COMPONENT
══════════════════════════════════════════════ */
function DemoPreview({ src, title, isPurple }: { src: string; title: string; isPurple: boolean }) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!expanded) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setExpanded(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [expanded]);

  return (
    <>
      <button aria-label="Action button"
        onClick={() => setExpanded(true)}
        className={`relative w-full aspect-video  overflow-hidden border-2 transition-colors duration-300 cursor-pointer group ${isPurple
          ? "border-[#851DEF]/30 hover:border-[#851DEF]/60 hover:shadow-[0_0_30px_rgba(255,10,61,0.15)]"
          : "border-white/10 hover:border-white/25 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)]"
          }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <Image width={200} height={200} unoptimized
          src={src}
          alt={`${title} demo preview`}
          className="w-full h-full object-cover object-top"
          loading="lazy"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-50 transition-opacity" />
        {/* Play Button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors duration-300 group-hover:scale-110 ${isPurple
            ? "bg-[var(--color-accent)]/80 shadow-[0_0_25px_rgba(255,10,61,0.5)] group-hover:bg-[var(--color-accent)] group-hover:shadow-[0_0_40px_rgba(255,10,61,0.7)]"
            : "bg-white/20 shadow-[0_0_25px_rgba(255,255,255,0.15)] group-hover:bg-white/30"
            }`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
        {/* Label */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <span className={`text-xs font-black uppercase tracking-[0.15em] px-2.5 py-1 rounded-full border backdrop-blur-sm ${isPurple
            ? "bg-[var(--color-accent)]/30 border-[#851DEF]/50 text-white"
            : "bg-black/50 border-white/20 text-white/80"
            }`}>
            ▶ Live Preview
          </span>
        </div>
      </button>

      {/* Fullscreen Modal */}
      {expanded && (
        <div
          className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
          onClick={() => setExpanded(false)}
        >
          <div className="relative max-w-6xl w-full">
            {/* Close Button */}
            <button aria-label="Action button"
              onClick={() => setExpanded(false)}
              className="absolute -top-12 right-0 text-white/60 hover:text-white text-sm font-bold uppercase tracking-widest flex items-center gap-2 transition-colors cursor-pointer"
            >
              Close <span className="text-lg">✕</span>
            </button>
            {/* Title */}
            <div className="mb-4">
              <h3 className="text-2xl font-black text-white uppercase tracking-wide" style={{ fontFamily: "var(--font-barlow-condensed), var(--font-inter)", fontStyle: "italic" }}>
                {title} <span style={{ color: "#851DEF" }}>Demo</span>
              </h3>
            </div>
            {/* Image */}
            <div className={` overflow-hidden border-2 ${isPurple ? "border-[#851DEF]/40" : "border-white/15"}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <Image width={200} height={200} unoptimized
                src={src}
                alt={`${title} demo`}
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ══════════════════════════════════════════════
   EXPANDABLE FEATURE CARD
══════════════════════════════════════════════ */
function FeatureCardUI({ f }: { f: FeatureCard }) {
  const [expanded, setExpanded] = useState(false);
  const isPurple = !!f.highlight;

  return (
    <div className={`group relative flex flex-col  border transition-colors duration-300 overflow-hidden ${isPurple ? "border-[#851DEF]/25 bg-gradient-to-br from-[#851DEF]/8 via-black to-black hover:border-[#851DEF]/50" : "border-white/[0.07] bg-white/[0.02] hover:border-white/20"}`}>
      {/* accent top line */}
      <div className={`h-px w-full ${isPurple ? "bg-gradient-to-r from-[#851DEF]/70 via-[#c084fc]/40 to-transparent" : "bg-gradient-to-r from-white/10 to-transparent"}`} />

      <div className="p-7 flex-1 flex flex-col gap-5">

        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <span className="text-5xl leading-none">{f.icon}</span>
          {isPurple && (
            <span className="text-base px-3 py-1 rounded-full bg-[var(--color-accent)]/20 border border-[#851DEF]/30 text-[#c084fc] font-bold uppercase tracking-widest shrink-0">✦ Flagship</span>
          )}
        </div>

        {/* Titles */}
        <div>
          <h3 className="text-3xl font-black text-white uppercase tracking-wide leading-tight mb-1.5" style={{ fontFamily: "var(--font-barlow-condensed), var(--font-inter)", fontStyle: "italic" }}>{f.title}</h3>
          <p className={`text-lg font-semibold ${isPurple ? "text-[#c084fc]" : "text-white/40"}`}>{f.tagline}</p>
        </div>

        {/* Demo Preview */}
        {f.demo && <DemoPreview src={f.demo} title={f.title} isPurple={isPurple} />}

        {/* Description */}
        <p className="text-white/60 text-lg leading-relaxed">{f.description}</p>

        {/* Why it matters */}
        <div className={`p-4 rounded-lg border text-base leading-relaxed ${isPurple ? "bg-[var(--color-accent)]/10 border-[#851DEF]/20 text-[#c084fc]/80" : "bg-white/[0.03] border-white/[0.07] text-white/40"}`}>
          <span className="font-black uppercase tracking-widest text-white/50 block mb-1.5 text-sm">Why it matters</span>
          {f.whyItMatters}
        </div>

        {/* Bullets */}
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-white/30 mb-3">What it does</p>
          <ul className="space-y-2">
            {f.bullets.map((b) => (
              <li key={`bullet-${b.slice(0, 20)}`} className="flex items-start gap-2.5 text-lg text-white/60">
                <span className={`mt-2 w-1.5 h-1.5 rounded-full shrink-0 ${isPurple ? "bg-[var(--color-accent)]" : "bg-white/25"}`} />
                {b}
              </li>
            ))}
          </ul>
        </div>

        {/* How It Works — expandable */}
        <div>
          <button aria-label="Action button"
            onClick={() => setExpanded(v => !v)}
            className={`flex items-center gap-2 text-base font-black uppercase tracking-widest transition-colors cursor-pointer ${isPurple ? "text-[var(--color-accent-soft)] hover:text-white" : "text-white/30 hover:text-white/70"}`}
          >
            <span className={`transition-transform duration-200 ${expanded ? "rotate-90" : "rotate-0"}`}>▶</span>
            How It Works
          </button>
          {expanded && (
            <div className="mt-3 space-y-2.5">
              {Array.from(f.howItWorks, (h, i) => ({ h, i })).map(({ h, i }) => (
                <div key={i} className="flex items-start gap-3 text-base text-white/40 leading-relaxed">
                  <span className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-sm font-black mt-0.5 ${isPurple ? "bg-[var(--color-accent)]/20 text-[#c084fc]" : "bg-white/5 text-white/30"}`}>{i + 1}</span>
                  {h}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 pt-1">
          {f.tags.map((tag) => (
            <span key={tag} className={`text-base px-3 py-1 rounded-full font-medium border ${isPurple ? "bg-[var(--color-accent)]/10 border-[#851DEF]/25 text-[#c084fc]" : "bg-white/5 border-white/10 text-white/40"}`}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Footer link */}
      {f.link && (
        <Link href={f.link} className={`flex items-center justify-between px-6 py-4 border-t text-base font-black uppercase tracking-widest transition-colors ${isPurple ? "border-[#851DEF]/15 text-[var(--color-accent-soft)] hover:text-white hover:bg-[var(--color-accent)]/10" : "border-white/5 text-white/25 hover:text-white hover:bg-white/5"}`}>
          Explore live →
        </Link>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════ */
export default function FeaturesPage() {
  const [activeCategory, setActiveCategory] = useState<Category | "all">("all");
  const filtered = FEATURES.filter(f => activeCategory === "all" || f.category.includes(activeCategory as Category));
  const highlights = FEATURES.filter(f => f.highlight);

  return (
    <main className="min-h-screen   text-white overflow-x-hidden">

      {/* ═══ HERO ═══════════════════════════════════════ */}
      <section className="relative pt-40 pb-28 px-6 md:px-12 lg:px-20 overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[600px] rounded-full bg-[var(--color-accent)] opacity-[0.10] blur-[140px]" />
          <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "linear-gradient(rgba(255,10,61,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,10,61,0.6) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-[var(--color-accent)]/10 border border-[#851DEF]/30 text-[#c084fc] text-sm font-bold uppercase tracking-[0.25em] mb-10">
            <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse" />
            Full Platform Overview · All Features Live & Documented
          </div>

          <h1 className="text-7xl md:text-9xl lg:text-[7rem] font-black uppercase text-white mb-6 leading-[0.9] tracking-tight" style={{ fontFamily: "var(--font-barlow-condensed), var(--font-inter)", fontStyle: "italic" }}>
            Everything<br /><span style={{ color: "#851DEF" }}>Built In.</span>
          </h1>

          <p className="text-white/45 text-3xl md:text-4xl max-w-3xl mx-auto leading-relaxed mb-6">
            A production-grade digital platform for 7th Heaven. Every feature is live, documented, and explained in full — from live-stream raffles to proximity SMS alerts to AI photo moderation.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
            {["WebRTC Live Streaming", "Twilio SMS", "Shopify Headless Commerce", "Supabase Real-Time DB", "TensorFlow.js AI", "12 Email Templates", "10 SMS Templates", "Sanity CMS"].map(p => (
              <span key={p} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/40 text-sm font-semibold">{p}</span>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/live" className="inline-flex items-center gap-2 px-8 py-3.5 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-black text-base uppercase tracking-[0.12em] rounded-full transition-colors hover:scale-105 hover:shadow-[0_0_40px_rgba(255,10,61,0.5)]">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />Watch Live
            </Link>
            <Link href="/book" className="inline-flex items-center gap-2 px-8 py-3.5 bg-white/5 hover:bg-white/10 border border-white/15 hover:border-white/30 text-white font-black text-base uppercase tracking-[0.12em] rounded-full transition-colors">Book The Band →</Link>
            <Link href="/fans" className="inline-flex items-center gap-2 px-8 py-3.5 bg-white/5 hover:bg-white/10 border border-white/15 hover:border-white/30 text-white font-black text-base uppercase tracking-[0.12em] rounded-full transition-colors">Fan Dashboard →</Link>
            <a href="#directory" className="inline-flex items-center gap-2 px-8 py-3.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500/60 text-[var(--color-accent)] font-black text-base uppercase tracking-[0.12em] rounded-full transition-colors">View All Pages ↓</a>
          </div>
        </div>
      </section>

      {/* ═══ STATS ═══════════════════════════════════════ */}
      <section className="border-y border-white/[0.06] bg-gradient-to-r from-[#851DEF]/5 via-transparent to-[#851DEF]/5">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-white/[0.06]">
          <Counter end={30} label="Features Live" sublabel="Fan, Live, Booking, Commerce, Comms & Platform" />
          <Counter end={40} label="API Endpoints" sublabel="Auth, SMS, Email, CMS, Shopify, LiveKit" />
          <Counter end={12} label="Email Templates" sublabel="Resend-powered, branded HTML, all flows covered" />
          <Counter end={10} label="SMS Templates" sublabel="Twilio — proximity, RSVP, live alerts, crew" />
        </div>
      </section>

      {/* ═══ LIVE PAGE PREVIEWS ══════════════════════════ */}
      <section className="py-20 px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <h2 className="text-4xl font-black uppercase tracking-widest text-white" style={{ fontFamily: "var(--font-barlow-condensed), var(--font-inter)", fontStyle: "italic" }}>
              Live Experience — What It Looks Like
            </h2>
          </div>
          <p className="text-white/35 text-xl mb-14 max-w-2xl">
            Below are pixel-accurate previews of the Fan Live Viewer and the Crew Broadcast Dashboard — both running on the real platform.
          </p>

          {/* ── ROW 1: Fan Viewer ── */}
          <div className="mb-20">
            <div className="flex items-center gap-3 mb-5">
              <span className="px-3 py-1 bg-red-500/15 border border-red-500/30 text-red-400 text-sm font-black uppercase tracking-widest rounded-full">🎥 Fan Live Viewer</span>
              <span className="text-white/20 text-sm">— what fans see at /live/[room]</span>
            </div>

            {/* Outer chrome */}
            <div className="border border-white/10 overflow-hidden shadow-[0_0_80px_rgba(255,10,61,0.12)]">
              {/* Browser bar */}
              <div className="flex items-center gap-2 px-4 py-2.5 bg-[var(--color-bg-card)] border-b border-white/[0.06]">
                <span className="w-3 h-3 rounded-full bg-red-500/60" />
                <span className="w-3 h-3 rounded-full bg-purple-600/60" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/60" />
                <div className="flex-1 mx-4 bg-white/5 rounded px-3 py-0.5 text-white/25 text-xs font-mono">7thheavenband.com/live/live_michael</div>
                <span className="text-white/20 text-xs">LIVE</span>
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              </div>

              {/* Main layout: video + chat */}
              <div className="flex h-[520px] bg-[#0a0a0a]">

                {/* Video area */}
                <div className="flex-1 relative overflow-hidden">
                  {/* Simulated stage video */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1a0533] via-[#0d0d1a] to-black">
                    {/* Stage lights */}
                    <div className="absolute top-0 left-1/4 w-48 h-64 bg-[var(--color-accent)] opacity-20 blur-[80px] rounded-full" />
                    <div className="absolute top-0 right-1/4 w-48 h-64 bg-blue-600 opacity-15 blur-[80px] rounded-full" />
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-purple-700 opacity-25 blur-[60px]" />
                    {/* Performer silhouette */}
                    <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center opacity-70">
                      <div className="w-8 h-8 rounded-full bg-white/80 mb-1" />
                      <div className="w-16 h-28 bg-gradient-to-b from-white/60 to-white/10 rounded-t-full" style={{ clipPath: "polygon(30% 0%, 70% 0%, 90% 100%, 10% 100%)" }} />
                      {/* Guitar */}
                      <div className="absolute top-8 -right-8 w-20 h-4 bg-purple-700/60 rounded-full -rotate-12" />
                    </div>
                    {/* Crowd silhouettes */}
                    <div className="absolute bottom-0 left-0 right-0 flex justify-around items-end px-4">
                      {[28, 22, 32, 20, 26, 24, 30, 18, 28, 22, 26, 24, 30, 22, 28].map((h, i) => (
                        <div key={i} className="w-5 rounded-t-full bg-black/80" style={{ height: `${h}px` }} />
                      ))}
                    </div>
                  </div>

                  {/* Top bar */}
                  <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/70 to-transparent">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-600 rounded text-white text-xs font-black uppercase tracking-widest">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />LIVE
                      </span>
                      <span className="text-white font-black text-sm">Michael — 7th Heaven</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-white/60 text-xs">👁 1,247 watching</span>
                      <span className="text-white/60 text-xs">⏱ 1:23:47</span>
                    </div>
                  </div>

                  {/* Floating emoji reactions */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {["🔥", "🎸", "❤️", "🤘", "⚡", "🎶", "💜", "🔥"].map((e, i) => (
                      <div key={`emoji-${i}-${e}`} className="absolute text-xl animate-pulse" style={{
                        left: `${10 + i * 11}%`,
                        bottom: `${20 + (i % 3) * 15}%`,
                        animationDelay: `${i * 0.3}s`,
                        animationDuration: `${1.5 + (i % 3) * 0.4}s`,
                        opacity: 0.8 - i * 0.08,
                      }}>{e}</div>
                    ))}
                  </div>

                  {/* Hype meter */}
                  <div className="absolute bottom-6 left-4 right-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-white/60 text-xs font-bold uppercase tracking-widest">Hype Meter</span>
                      <span className="text-[#c084fc] text-xs font-black">87%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#851DEF] to-[#c084fc] rounded-full animate-pulse" style={{ width: "87%" }} />
                    </div>
                  </div>

                  {/* Pinned crew message */}
                  <div className="absolute top-14 left-4 right-4 bg-[var(--color-accent)]/20 border border-[#851DEF]/40 rounded-lg px-3 py-2 flex items-start gap-2">
                    <span className="text-[#c084fc] text-xs font-black uppercase tracking-widest shrink-0">📌 Crew</span>
                    <span className="text-white/80 text-xs">"Playing our new single TONIGHT — merch drop in 10 min! 🔥"</span>
                  </div>

                  {/* Multi-room switcher */}
                  <div className="absolute top-24 right-4 flex flex-col gap-1.5">
                    {["Michael", "Ryan", "Sammy"].map((name, i) => (
                      <div key={name} className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-bold cursor-pointer transition-colors ${i === 0 ? "bg-[var(--color-accent)] text-white" : "bg-white/5 text-white/40 hover:bg-white/10"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${i === 0 ? "bg-white animate-pulse" : "bg-white/30"}`} />
                        {name}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chat panel */}
                <div className="w-72 flex flex-col border-l border-white/[0.07] bg-[#0d0d0d]">
                  {/* Chat header */}
                  <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
                    <span className="text-white/60 text-sm font-bold uppercase tracking-widest">Live Chat</span>
                    <span className="text-white/30 text-xs">1,247 online</span>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-hidden px-3 py-3 flex flex-col gap-2 justify-end">
                    {Array.from([
                      { user: "RockFan99", msg: "This song is 🔥🔥🔥", color: "#c084fc" },
                      { user: "JennyM", msg: "Been waiting ALL week for this!", color: "#60a5fa" },
                      { user: "TonyB", msg: "Best live band in Chicago no cap", color: "#34d399" },
                      { user: "KayleighR", msg: "🤘🤘🤘🤘🤘", color: "#fb923c" },
                      { user: "MikeC", msg: "That guitar solo was 😭", color: "#f472b6" },
                      { user: "DaveS", msg: "When's the merch drop??", color: "#a78bfa" },
                      { user: "SarahT", msg: "I'm literally crying rn 💜", color: "#2dd4bf" },
                      { user: "7thHeavenFan", msg: "Hype at 87%!! 🚀", color: "#c084fc" },
                    ], (m, i) => ({ m, i })).map(({ m, i }) => (
                      <div key={i} className="flex items-start gap-1.5 animate-none">
                        <span className="text-xs font-black shrink-0" style={{ color: m.color }}>{m.user}</span>
                        <span className="text-xs text-white/60 leading-tight">{m.msg}</span>
                      </div>
                    ))}
                  </div>

                  {/* Reaction bar */}
                  <div className="px-3 py-2 border-t border-white/[0.05] flex gap-1.5">
                    {["🔥", "🎸", "❤️", "🤘", "⚡"].map(e => (
                      <button aria-label="Action button" key={e} className="text-base hover:scale-125 transition-transform cursor-pointer">{e}</button>
                    ))}
                  </div>

                  {/* Input */}
                  <div className="px-3 pb-3">
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                      <span className="text-white/20 text-sm flex-1">Say something...</span>
                      <button aria-label="Action button" className=" text-[var(--color-accent)] text-xs font-black uppercase">Send</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Caption */}
            <div className="mt-4 flex flex-wrap gap-3">
              {["WebRTC via LiveKit", "Real-Time Supabase Chat", "Floating Emoji Reactions", "Hype Meter", "Pinned Crew Announcements", "Multi-Room Switcher", "PG Content Filter"].map(t => (
                <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-[var(--color-accent)]/10 border border-[#851DEF]/20 text-[#c084fc]">{t}</span>
              ))}
            </div>
          </div>

          {/* ── ROW 2: Crew Dashboard ── */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <span className="px-3 py-1 bg-[var(--color-accent)]/15 border border-[#851DEF]/30 text-[#c084fc] text-sm font-black uppercase tracking-widest rounded-full">🎛️ Crew Broadcast Studio</span>
              <span className="text-white/20 text-sm">— what crew sees at /crew</span>
            </div>

            <div className="border border-white/10 overflow-hidden shadow-[0_0_80px_rgba(255,10,61,0.10)]">
              {/* Browser bar */}
              <div className="flex items-center gap-2 px-4 py-2.5 bg-[var(--color-bg-card)] border-b border-white/[0.06]">
                <span className="w-3 h-3 rounded-full bg-red-500/60" />
                <span className="w-3 h-3 rounded-full bg-purple-600/60" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/60" />
                <div className="flex-1 mx-4 bg-white/5 rounded px-3 py-0.5 text-white/25 text-xs font-mono">7thheavenband.com/crew</div>
              </div>

              <div className="bg-[#080808] p-5 grid grid-cols-1 lg:grid-cols-3 gap-5 min-h-[500px]">

                {/* Col 1: Video preview + controls */}
                <div className="flex flex-col gap-4">
                  {/* Camera preview */}
                  <div className="overflow-hidden border border-white/10 relative aspect-video bg-gradient-to-br from-[#1a0533] via-[#0d0d1a] to-black">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-[var(--color-accent)] opacity-20 blur-[40px] rounded-full" />
                    {/* Performer */}
                    <div className="absolute inset-0 flex items-center justify-center flex-col opacity-80">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-white/60 to-white/20 mb-2" />
                      <div className="w-6 h-6 bg-white/30 rounded-full" style={{ marginTop: "-12px" }} />
                    </div>
                    <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-red-600 px-2 py-0.5 rounded text-white text-xs font-black uppercase">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />LIVE
                    </div>
                    <div className="absolute bottom-2 right-2 text-white/50 text-xs">HD 1080p</div>
                  </div>

                  {/* Broadcast stats */}
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Viewers", val: "1,247", icon: "👁", color: "#c084fc" },
                      { label: "Duration", val: "1:23:47", icon: "⏱", color: "#60a5fa" },
                      { label: "Peak", val: "1,891", icon: "📈", color: "#34d399" },
                      { label: "Reactions", val: "4,302", icon: "🔥", color: "#fb923c" },
                    ].map(s => (
                      <div key={s.label} className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-3">
                        <div className="text-lg mb-0.5">{s.icon}</div>
                        <div className="text-lg font-black" style={{ color: s.color }}>{s.val}</div>
                        <div className="text-white/30 text-xs uppercase tracking-wide">{s.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* A/V controls */}
                  <div className="flex gap-2">
                    <button aria-label="Action button" className="flex-1 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white/60 text-sm font-bold flex items-center justify-center gap-2 hover:bg-white/10 cursor-pointer">
                      🎤 Mic On
                    </button>
                    <button aria-label="Action button" className="flex-1 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white/60 text-sm font-bold flex items-center justify-center gap-2 hover:bg-white/10 cursor-pointer">
                      📹 Cam On
                    </button>
                  </div>
                  <button aria-label="Action button" className="w-full py-3 bg-red-600/80 hover:bg-red-600 border border-red-500/50 text-white text-sm font-black uppercase tracking-widest transition-colors cursor-pointer">
                    ⏹ End Stream
                  </button>
                </div>

                {/* Col 2: Chat moderation */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white/60 text-sm font-black uppercase tracking-widest">Fan Chat</h3>
                    <span className="text-emerald-400 text-xs">Live · 1,247 online</span>
                  </div>

                  <div className="flex-1 bg-black/30 border border-white/[0.06] overflow-hidden flex flex-col" style={{ minHeight: "260px" }}>
                    <div className="flex-1 p-3 flex flex-col gap-2 justify-end overflow-hidden">
                      {Array.from([
                        { user: "RockFan99", msg: "This song is 🔥🔥🔥", flag: false, color: "#c084fc" },
                        { user: "JennyM", msg: "Been waiting ALL week!", flag: false, color: "#60a5fa" },
                        { user: "TonyB", msg: "Best live band in Chicago", flag: false, color: "#34d399" },
                        { user: "SpamBot42", msg: "FREE tickets → spam-url.co/7th", flag: true, color: "#f87171" },
                        { user: "KayleighR", msg: "🤘🤘🤘🤘🤘", flag: false, color: "#fb923c" },
                        { user: "MikeC", msg: "Guitar solo was incredible!", flag: false, color: "#f472b6" },
                      ], (m, i) => ({ m, i })).map(({ m, i }) => (
                        <div key={i} className={`flex items-center gap-2 p-1.5 rounded-lg ${m.flag ? "bg-red-500/10 border border-red-500/20" : "hover:bg-white/[0.02]"} group`}>
                          {m.flag && <span className="text-red-400 text-xs shrink-0">⚠</span>}
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-black" style={{ color: m.color }}>{m.user} </span>
                            <span className="text-xs text-white/50">{m.msg}</span>
                          </div>
                          <button aria-label="Action button" className="shrink-0 text-xs px-1.5 py-0.5 rounded bg-white/5 text-white/25 hover:bg-red-500/20 hover:text-red-400 transition-colors cursor-pointer opacity-0 group-hover:opacity-100">Mute</button>
                        </div>
                      ))}
                    </div>
                    <div className="px-3 py-2 border-t border-white/[0.05] bg-red-500/5 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      <span className="text-red-400 text-xs font-bold">PG filter blocked 1 message · SpamBot42 auto-flagged</span>
                    </div>
                  </div>

                  {/* Announce */}
                  <div>
                    <div className="text-white/30 text-xs mb-1.5 font-bold uppercase tracking-widest">📌 Pin Announcement</div>
                    <div className="flex gap-2">
                      <input aria-label="Input field" readOnly value="Merch drop in 5 min! 🔥" className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white/60 text-xs" />
                      <button aria-label="Action button" className="px-3 py-2 bg-[var(--color-accent)] rounded-lg text-white text-xs font-black cursor-pointer">Pin</button>
                    </div>
                  </div>

                  {/* Trigger reactions */}
                  <div>
                    <div className="text-white/30 text-xs mb-1.5 font-bold uppercase tracking-widest">💥 Trigger Batch Reaction</div>
                    <div className="flex gap-1.5">
                      {["🔥", "🎸", "🤘", "💜", "⚡"].map(e => (
                        <button aria-label="Action button" key={e} className="flex-1 py-2 bg-white/5 border border-white/[0.08] rounded-lg text-base hover:bg-[var(--color-accent)]/20 hover:border-[#851DEF]/40 transition-colors cursor-pointer">{e}</button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Col 3: Raffle + Flash Drop */}
                <div className="flex flex-col gap-4">

                  {/* Raffle card */}
                  <div className="bg-gradient-to-br from-[#851DEF]/15 to-black border border-[#851DEF]/30 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">🎰</span>
                      <span className="text-white font-black text-sm uppercase tracking-wide">Raffle Engine</span>
                      <span className="ml-auto text-xs px-2 py-0.5 bg-emerald-500/15 border border-emerald-500/25 text-[var(--color-accent)] rounded-full font-bold">LIVE</span>
                    </div>
                    {/* Active raffle */}
                    <div className="bg-black/40 rounded-lg p-3 mb-3">
                      <div className="text-white/50 text-xs mb-1">Current Prize</div>
                      <div className="text-white font-black text-sm mb-2">Signed 7th Heaven Vinyl 🎵</div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-white/40 text-xs">Entries</span>
                        <span className="text-[#c084fc] font-black text-sm">347</span>
                      </div>
                      {/* countdown */}
                      <div className="text-center py-2 bg-[var(--color-accent)]/20 rounded-lg border border-[#851DEF]/30">
                        <div className="text-3xl font-black text-white tabular-nums">0:42</div>
                        <div className="text-white/40 text-xs uppercase tracking-widest">Time Remaining</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button aria-label="Action button" className="py-2 bg-[var(--color-accent)]/20 border border-[#851DEF]/30 rounded-lg text-[#c084fc] text-xs font-black uppercase cursor-pointer hover:bg-[var(--color-accent)]/30 transition-colors">
                        + New Raffle
                      </button>
                      <button aria-label="Action button" className="py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs font-black uppercase cursor-pointer hover:bg-red-500/20 transition-colors">
                        Draw Winner
                      </button>
                    </div>
                  </div>
                  {/* Flash Drop card */}
                  <div className="bg-gradient-to-br from-amber-500/10 to-black border border-purple-500/25 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">🔥</span>
                      <span className="text-white font-black text-sm uppercase tracking-wide">Merch Flash Drop</span>
                    </div>
                    <div className="space-y-2 mb-3">
                      <input aria-label="Input field" readOnly value="7th Heaven Tour Tee — Limited" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white/60 text-xs" />
                      <div className="grid grid-cols-2 gap-2">
                        <input aria-label="Input field" readOnly value="$35.00" className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white/60 text-xs" />
                        <input aria-label="Input field" readOnly value="Stock: 50" className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white/60 text-xs" />
                      </div>
                      <input aria-label="Input field" readOnly value="⏱ Countdown: 5:00" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white/60 text-xs" />
                    </div>
                    <button aria-label="Action button" className="w-full py-2.5 bg-purple-600/80 hover:bg-purple-600 rounded-lg text-black text-sm font-black uppercase tracking-widest transition-colors cursor-pointer">
                      🔥 Launch Drop to All Viewers
                    </button>
                  </div>

                  {/* SMS blast mini */}
                  <div className="bg-white/[0.02] border border-white/[0.07] p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">📱</span>
                      <span className="text-white/70 font-black text-sm uppercase tracking-wide">SMS Fan Alert</span>
                    </div>
                    <div className="text-white/30 text-xs mb-2">Blast to all subscribers within 50mi</div>
                    <button aria-label="Action button" className="w-full py-2 bg-white/5 border border-white/10 rounded-lg text-white/50 text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-colors cursor-pointer">
                      📲 Send Live Alert SMS
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Caption */}
            <div className="mt-4 flex flex-wrap gap-3">
              {["One-Click LiveKit Broadcast", "Chat Moderation + Mute Controls", "Live Raffle Engine", "Merch Flash Drop", "Batch Emoji Blasts", "Pinned Announcements", "Real-Time Viewer Stats", "SMS Fan Alerts"].map(t => (
                <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/40">{t}</span>
              ))}
            </div>
          </div>

          {/* ── ROW 3: Admin Dashboard ── */}
          <div className="mt-20">
            <div className="flex items-center gap-3 mb-5">
              <span className="px-3 py-1 bg-blue-500/15 border border-blue-500/30 text-blue-400 text-sm font-black uppercase tracking-widest rounded-full">⚙️ Admin Dashboard</span>
              <span className="text-white/20 text-sm">— what admins see at /admin</span>
            </div>

            <div className="border border-white/10 overflow-hidden shadow-[0_0_80px_rgba(255,10,61,0.08)]">
              {/* Browser bar */}
              <div className="flex items-center gap-2 px-4 py-2.5 bg-[var(--color-bg-card)] border-b border-white/[0.06]">
                <span className="w-3 h-3 rounded-full bg-red-500/60" />
                <span className="w-3 h-3 rounded-full bg-purple-600/60" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/60" />
                <div className="flex-1 mx-4 bg-white/5 rounded px-3 py-0.5 text-white/25 text-xs font-mono">7thheavenband.com/admin</div>
                <span className="text-blue-400 text-xs font-bold">🔐 Admin Only</span>
              </div>

              <div className="bg-[#080808] min-h-[560px] flex flex-col">

                {/* Top header bar */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.05]">
                  <div className="flex items-center gap-3">
                    <span className="text-white font-black text-lg uppercase tracking-widest" style={{ fontFamily: "var(--font-barlow-condensed), var(--font-inter)", fontStyle: "italic" }}>7th Heaven</span>
                    <span className="text-white/20 text-sm">Admin Control Center</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                      <span className="text-emerald-400 text-xs font-bold">DB Connected · 12ms</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-red-400 text-xs font-bold">2 Streams Live</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                      <span className="text-purple-300 text-xs font-bold">3 Pending Bookings</span>
                    </div>
                  </div>
                </div>

                {/* Tab bar */}
                <div className="flex gap-1 px-6 py-3 border-b border-white/[0.05]">
                  {[
                    { label: "🎸 Band", active: true },
                    { label: "🚢 Cruise", active: false },
                    { label: "🛒 Merch", active: false },
                    { label: "📣 Alerts", active: false },
                  ].map(t => (
                    <div key={t.label} className={`px-5 py-2 rounded-lg text-sm font-black uppercase tracking-widest cursor-pointer transition-colors ${t.active ? "bg-[var(--color-accent)]/20 border border-[#851DEF]/30 text-[#c084fc]" : "text-white/30 hover:text-white/50"}`}>
                      {t.label}
                    </div>
                  ))}
                </div>

                <div className="p-5 flex flex-col gap-5 flex-1">

                  {/* Stat cards row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label: "Total Fans", val: "2,847", icon: "👥", color: "#c084fc", trend: "+12 today", bar: 72 },
                      { label: "Pending Bookings", val: "3", icon: "📋", color: "#c084fc", trend: "2 new today", bar: 30 },
                      { label: "Fan Photos", val: "134", icon: "📸", color: "#34d399", trend: "8 need review", bar: 55 },
                      { label: "Live Viewers", val: "1,891", icon: "📡", color: "#f87171", trend: "Peak right now", bar: 89 },
                    ].map(s => (
                      <div key={s.label} className="bg-[var(--color-bg-surface)] border border-white/5 p-4 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xl">{s.icon}</span>
                          <span className="text-xs text-white/25 font-bold">{s.trend}</span>
                        </div>
                        <div className="text-3xl font-black tabular-nums" style={{ color: s.color }}>{s.val}</div>
                        <div className="text-white/25 text-xs uppercase tracking-widest mb-1">{s.label}</div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${s.bar}%`, background: s.color, opacity: 0.5 }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 3-col main content */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                    {/* Col 1: Bookings */}
                    <div className="bg-[var(--color-bg-surface)] border border-white/5 overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05]">
                        <span className="text-white/70 font-black text-xs uppercase tracking-widest">📋 Booking Requests</span>
                        <span className="text-purple-300 text-xs font-bold px-2 py-0.5 bg-purple-600/10 rounded-full border border-purple-500/20">3 Pending</span>
                      </div>
                      <div className="divide-y divide-white/[0.04]">
                        {[
                          { name: "Corporate Holiday Party", org: "Acme Corp", venue: "Marriott Chicago", date: "Dec 14", budget: "$4,500", type: "Corporate", status: "pending" },
                          { name: "New Year's Eve Bash", org: "Private Client", venue: "Spiaggia", date: "Dec 31", budget: "$6,200", type: "Private", status: "pending" },
                          { name: "Wedding Reception", org: "Sarah & Tom K.", venue: "Drury Lane", date: "Jan 22", budget: "$3,800", type: "Wedding", status: "pending" },
                          { name: "Summer Block Party", org: "Lakeview Assoc.", venue: "Wrigleyville", date: "Jul 4", budget: "$2,100", type: "Festival", status: "approved" },
                        ].map((b, i) => (
                          <div key={b.name} className="px-4 py-3 hover:bg-white/[0.02] transition-colors">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div>
                                <div className="text-white/85 text-xs font-bold">{b.name}</div>
                                <div className="text-white/30 text-xs">{b.org} · {b.venue}</div>
                              </div>
                              <span className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-full border ${b.type === 'Corporate' ? 'text-blue-400 bg-blue-500/10 border-blue-500/20' : b.type === 'Wedding' ? 'text-pink-400 bg-pink-500/10 border-pink-500/20' : b.type === 'Festival' ? 'text-emerald-400 bg-emerald-500/10  border-[var(--color-accent)]/30' : ' text-[var(--color-accent)] bg-purple-500/10 border-purple-500/20'}`}>{b.type}</span>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-3 text-white/30 text-xs">
                                <span>📅 {b.date}</span>
                                <span>💵 {b.budget}</span>
                              </div>
                              {b.status === 'pending' ? (
                                <div className="flex gap-1">
                                  <button aria-label="Action button" className="px-2 py-0.5 bg-emerald-500/15 border border-emerald-500/25 text-[var(--color-accent)] text-xs font-black rounded cursor-pointer hover:bg-emerald-500/25">✓</button>
                                  <button aria-label="Action button" className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-black rounded cursor-pointer hover:bg-red-500/20">✕</button>
                                </div>
                              ) : (
                                <span className="text-xs text-[var(--color-accent)] font-bold">✓ Approved</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Col 2: Fan Photo Queue */}
                    <div className="bg-[var(--color-bg-surface)] border border-white/5 overflow-hidden flex flex-col">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05]">
                        <span className="text-white/70 font-black text-xs uppercase tracking-widest">📸 Fan Photo Queue</span>
                        <span className="text-purple-300 text-xs font-bold px-2 py-0.5 bg-purple-600/10 rounded-full border border-purple-500/20">8 Awaiting</span>
                      </div>
                      <div className="p-3 grid grid-cols-3 gap-2">
                        {[
                          { bg: "from-[#1a0533] via-[#2d0a5c] to-[#0d0d1a]", label: "jess_m · HOB", ok: true, glow: "#851DEF" },
                          { bg: "from-[#0a2a1a] via-[#0d3322] to-[#050e08]", label: "rockerdan92", ok: true, glow: "#22c55e" },
                          { bg: "from-[#2a1500] via-[#3d1f00] to-[#0d0800]", label: "ChicagoLou", ok: true, glow: "#f97316" },
                          { bg: "from-[#1a0018] via-[#2d0030] to-[#0a000f]", label: "tay_rocks ⚠", ok: false, glow: "#ef4444" },
                          { bg: "from-[#001a2a] via-[#002d3d] to-[#00080d]", label: "MelM · Wrig", ok: true, glow: "#3b82f6" },
                          { bg: "from-[#1a1500] via-[#2d2200] to-[#0d0900]", label: "superfan99", ok: true, glow: "#eab308" },
                        ].map((p, i) => (
                          <div key={p.label} className={`aspect-square rounded-lg bg-gradient-to-br ${p.bg} border ${p.ok ? 'border-white/10 hover:border-white/30' : 'border-red-500/50'} relative overflow-hidden group cursor-pointer transition-colors`}>
                            <div className="absolute inset-0">
                              <div className="absolute top-0 left-1/3 w-6 h-12 rounded-full opacity-50" style={{ background: p.glow, filter: 'blur(8px)' }} />
                              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center opacity-40">
                                <div className="w-3 h-3 rounded-full bg-white/80 mb-0.5" />
                                <div className="w-5 h-8 bg-white/40 rounded-t-lg" />
                              </div>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 px-1 py-0.5 bg-black/70">
                              <div className="text-white/60 text-[var(--font-size-4xs)] font-bold truncate">{p.label}</div>
                            </div>
                            {!p.ok && <div className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[var(--font-size-4xs)] text-white font-black">!</div>}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                              <button aria-label="Action button" className="w-7 h-7 bg-emerald-500/90 rounded-lg text-white text-sm font-black cursor-pointer">✓</button>
                              <button aria-label="Action button" className="w-7 h-7 bg-red-500/90 rounded-lg text-white text-sm font-black cursor-pointer">✕</button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="px-3 pb-2">
                        <div className="flex items-start gap-2 px-3 py-2 bg-red-500/5 border border-red-500/15 rounded-lg">
                          <span className="text-red-400 text-xs shrink-0">🤖</span>
                          <span className="text-red-400/80 text-xs font-bold">TensorFlow flagged tay_rocks — NSFW 0.82. Held for review.</span>
                        </div>
                      </div>
                      <div className="border-t border-white/[0.05] px-4 py-3">
                        <div className="text-white/25 text-xs font-black uppercase tracking-widest mb-2">Recent Sign-ups</div>
                        <div className="flex flex-col gap-1.5">
                          {[
                            { name: "ashley_xo", tier: "Gold", time: "2m ago", color: "#e879f9" },
                            { name: "nate_bass", tier: "Bronze", time: "11m ago", color: "#22d3ee" },
                            { name: "LaurenLive", tier: "Silver", time: "34m ago", color: "#a3e635" },
                          ].map((f, i) => (
                            <div key={f.name} className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-black shrink-0" style={{ background: `${f.color}25`, color: f.color }}>{f.name[0].toUpperCase()}</div>
                              <span className="text-white/60 text-xs flex-1 font-bold">{f.name}</span>
                              <span className="text-xs px-1.5 py-0.5 rounded-full font-bold" style={{ background: `${f.color}15`, color: f.color, border: `1px solid ${f.color}30` }}>{f.tier}</span>
                              <span className="text-white/20 text-xs">{f.time}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Col 3: Live Monitor + SMS + Audit */}
                    <div className="flex flex-col gap-4">
                      <div className="bg-[var(--color-bg-surface)] border border-white/5 overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05]">
                          <span className="text-white/70 font-black text-xs uppercase tracking-widest">📡 Live Streams</span>
                          <span className="flex items-center gap-1 text-red-400 text-xs font-bold"><span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />2 Active</span>
                        </div>
                        <div className="divide-y divide-white/[0.04]">
                          {[
                            { name: "Michael S.", room: "live_michael", viewers: "1,247", duration: "1:23:47", peak: "1,891" },
                            { name: "Sammy D.", room: "live_sammy", viewers: "412", duration: "0:44:12", peak: "530" },
                          ].map((s, i) => (
                            <div key={s.room} className="px-4 py-3">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                  <span className="text-white/80 text-xs font-bold">{s.name}</span>
                                  <span className="text-white/20 text-xs font-mono">{s.room}</span>
                                </div>
                                <button aria-label="Action button" className="text-xs text-red-400/50 hover:text-red-400 font-bold cursor-pointer">End</button>
                              </div>
                              <div className="flex gap-4 text-white/30 text-xs">
                                <span>👁 {s.viewers}</span>
                                <span>⏱ {s.duration}</span>
                                <span>📈 {s.peak}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-[var(--color-bg-surface)] border border-white/5 p-4 flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                          <span>📣</span>
                          <span className="text-white/70 font-black text-xs uppercase tracking-widest">SMS Blast</span>
                          <span className="ml-auto text-white/25 text-xs">2,847 subs</span>
                        </div>
                        <textarea aria-label="Text input" readOnly rows={2} value={"🔥 7th Heaven LIVE tonight @ House of Blues!\nDoors 7pm · Show 8pm · Merch drop mid-set 🎸"} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white/50 text-xs resize-none" />
                        <div className="flex gap-2">
                          <select aria-label="Select option" className="flex-1 bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white/40 text-xs">
                            <option>All 2,847 subscribers</option>
                            <option>Within 50mi of venue</option>
                            <option>Gold + Platinum fans</option>
                          </select>
                          <button aria-label="Action button" className="px-4 py-1.5 bg-[var(--color-accent)]/80 hover:bg-[var(--color-accent)] rounded-lg text-white text-xs font-black uppercase cursor-pointer">Send</button>
                        </div>
                        <div className="text-white/20 text-xs">Last blast: Dec 10 — 94% open rate</div>
                      </div>

                      <div className="bg-[var(--color-bg-surface)] border border-white/5 overflow-hidden">
                        <div className="px-4 py-3 border-b border-white/[0.05]">
                          <span className="text-white/70 font-black text-xs uppercase tracking-widest">📝 Audit Log</span>
                        </div>
                        <div className="p-3 flex flex-col gap-1.5 font-mono text-xs">
                          {[
                            { time: "14:23:01", action: "michael approved booking #B-0041", color: "#34d399" },
                            { time: "14:18:44", action: "SMS blast sent → 2,847 recipients", color: "#c084fc" },
                            { time: "14:11:09", action: "Photo approved: rockerdan92.jpg", color: "#34d399" },
                            { time: "14:09:33", action: "AI flagged: tay_rocks (NSFW 0.82)", color: "#f87171" },
                            { time: "14:02:17", action: "live_michael started · 0 viewers", color: "#60a5fa" },
                            { time: "13:55:44", action: "admin login · 192.168.1.x", color: "#c084fc" },
                          ].map((log, i) => (
                            <div key={`audit-${log.time}`} className="flex gap-2 items-start">
                              <span className="text-white/20 shrink-0">{log.time}</span>
                              <span style={{ color: log.color }} className="opacity-75">{log.action}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Caption */}
            <div className="mt-4 flex flex-wrap gap-3">
              {["Booking Approval System", "Fan Photo Moderation", "AI Content Flagging", "SMS Blast Tool", "Live Stream Monitor", "Real-Time Stats", "Cruise Management", "Audit Log"].map(t => (
                <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-blue-500/5 border border-blue-500/15 text-blue-400/70">{t}</span>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ═══ FAN DASHBOARD PREVIEW ═══════════════════════ */}
      <section className="py-20 px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">🏆</span>
            <h2 className="text-4xl font-black uppercase tracking-widest text-white" style={{ fontFamily: "var(--font-barlow-condensed), var(--font-inter)", fontStyle: "italic" }}>
              Fan Dashboard — What It Looks Like
            </h2>
          </div>
          <p className="text-white/35 text-xl mb-14 max-w-3xl">
            Every registered fan gets a personalized dashboard at <code className=" text-[var(--color-accent)] bg-[var(--color-accent)]/10 px-2 py-0.5 rounded text-sm font-mono">/fans/username</code> — their home base for show countdowns, live alerts, photo submissions, referral codes, and more.
          </p>

          {/* Screenshot 1: Hero — Profile + Countdown */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <span className="px-3 py-1 bg-[var(--color-accent)]/15 border border-[var(--color-accent)]/30  text-[var(--color-accent)] text-sm font-black uppercase tracking-widest rounded-full">⭐ Profile & Show Countdown</span>
              <span className="text-white/20 text-sm">— personalized identity + next show timer</span>
            </div>
            <div className="border border-white/10 overflow-hidden shadow-[0_0_80px_rgba(255,10,61,0.12)]">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-[var(--color-bg-card)] border-b border-white/[0.06]">
                <span className="w-3 h-3 rounded-full bg-red-500/60" />
                <span className="w-3 h-3 rounded-full bg-purple-600/60" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/60" />
                <div className="flex-1 mx-4 bg-white/5 rounded px-3 py-0.5 text-white/25 text-xs font-mono">7thheavenband.com/fans/demo</div>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <Image width={200} height={200} unoptimized src="/images/features/fan-dashboard-hero.png" alt="Fan Dashboard — Profile header with live show countdown" className="w-full" />
            </div>
          </div>

          {/* Screenshot 2: Mid — Proximity + Shows */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <span className="px-3 py-1 bg-emerald-500/15 border border-emerald-500/30 text-[var(--color-accent)] text-sm font-black uppercase tracking-widest rounded-full">📍 Proximity Alerts & Shows</span>
              <span className="text-white/20 text-sm">— upcoming dates + location-based notifications</span>
            </div>
            <div className="border border-white/10 overflow-hidden shadow-[0_0_80px_rgba(16,185,129,0.08)]">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-[var(--color-bg-card)] border-b border-white/[0.06]">
                <span className="w-3 h-3 rounded-full bg-red-500/60" />
                <span className="w-3 h-3 rounded-full bg-purple-600/60" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/60" />
                <div className="flex-1 mx-4 bg-white/5 rounded px-3 py-0.5 text-white/25 text-xs font-mono">7thheavenband.com/fans/demo</div>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <Image width={200} height={200} unoptimized src="/images/features/fan-dashboard-middle.png" alt="Fan Dashboard — Proximity alerts and upcoming shows" className="w-full" />
            </div>
          </div>

          {/* Screenshot 3: Lower — Memories + Referral */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-5">
              <span className="px-3 py-1 bg-purple-600/15 border border-purple-500/30 text-purple-300 text-sm font-black uppercase tracking-widest rounded-full">🎸 Show Memories & Referrals</span>
              <span className="text-white/20 text-sm">— post-show engagement + fan-to-fan growth</span>
            </div>
            <div className="border border-white/10 overflow-hidden shadow-[0_0_80px_rgba(147, 51, 234,0.08)]">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-[var(--color-bg-card)] border-b border-white/[0.06]">
                <span className="w-3 h-3 rounded-full bg-red-500/60" />
                <span className="w-3 h-3 rounded-full bg-purple-600/60" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/60" />
                <div className="flex-1 mx-4 bg-white/5 rounded px-3 py-0.5 text-white/25 text-xs font-mono">7thheavenband.com/fans/demo</div>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <Image width={200} height={200} unoptimized src="/images/features/fan-dashboard-lower.png" alt="Fan Dashboard — Show memories and referral program" className="w-full" />
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <Link href="/fans" className="inline-flex items-center gap-3 px-10 py-4 bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 text-white font-black text-base uppercase tracking-[0.15em] rounded-full transition-colors hover:scale-105 hover:shadow-[0_0_40px_rgba(255,10,61,0.5)]">
              Try the Fan Dashboard →
            </Link>
          </div>

        </div>
      </section>

      {/* ═══ SITE DIRECTORY ══════════════════════════════ */}
      <section id="directory" className="py-16 px-6 md:px-12 lg:px-20 border-b border-white/[0.05]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-emerald-400 text-xl">⊞</span>
            <h2 className="text-4xl font-black uppercase tracking-widest text-white" style={{ fontFamily: "var(--font-barlow-condensed), var(--font-inter)", fontStyle: "italic" }}>
              All Pages — Site Directory
            </h2>
          </div>
          <p className="text-white/35 mb-4 max-w-3xl">
            Every page on the site — all {55} routes. Click any row to open it in a new tab. Pages marked <span className="text-emerald-400 font-bold">Public</span> work without any login.
          </p>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 mb-8">
            {[
              { color: "bg-emerald-500/15 border-emerald-500/30 text-[var(--color-accent)]", dot: "bg-emerald-500", label: "Public — no login needed" },
              { color: "bg-purple-600/15 border-purple-500/30 text-purple-300", dot: "bg-purple-600", label: "Login Required" },
              { color: "bg-blue-500/15 border-blue-500/30 text-blue-400", dot: "bg-blue-500", label: "Admin / Crew Only" },
              { color: "bg-white/5 border-white/10 text-white/30", dot: "bg-white/30", label: "Dev / Preview" },
            ].map(l => (
              <div key={l.label} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-bold ${l.color}`}>
                <span className={`w-2 h-2 rounded-full ${l.dot}`} />
                {l.label}
              </div>
            ))}
          </div>

          {[
            {
              group: "🏠 Core — Public Pages",
              pages: [
                { path: "/", label: "Homepage", desc: "Live detection, tour map, music player, merch, fan photos, behind-the-scenes", access: "public" },
                { path: "/tour", label: "Tour Dates", desc: "Interactive Leaflet map + chronological show list with search & filters", access: "public" },
                { path: "/bio", label: "Band Bio", desc: "Full 40-year band history timeline + member listing", access: "public" },
                { path: "/members", label: "Member Profiles", desc: "Per-member pages: bio, instruments, gear list, Q&A — at /members/[slug]", access: "public" },
                { path: "/video", label: "Video Gallery", desc: "10+ category library — music videos, live performances, backstage clips", access: "public" },
                { path: "/music", label: "Music Player", desc: "Full track list with persistent inline audio player — no page reload", access: "public" },
                { path: "/fan-photo-wall", label: "Fan Photo Wall", desc: "AI-moderated masonry grid of fan-submitted concert photos with lightbox", access: "public" },
                { path: "/contact", label: "Contact", desc: "General contact form", access: "public" },
                { path: "/privacy", label: "Privacy Policy", desc: "Site privacy policy page", access: "public" },
                { path: "/terms", label: "Terms of Service", desc: "Terms and conditions", access: "public" },
                { path: "/features", label: "Features", desc: "This page — full platform feature and page directory", access: "public" },
              ],
            },
            {
              group: "🎸 Fan & Booking Pages",
              pages: [
                { path: "/fans", label: "Fan Dashboard", desc: "Live feed, SMS opt-in, prize wallet, referral QR, photo upload, cruise toggle", access: "login" },
                { path: "/shows/[id]", label: "Show Pages", desc: "Per-show RSVP, attendee list, QR share code, directions, live-stream banner", access: "public" },
                { path: "/cruise", label: "Caribbean Cruise", desc: "Campaign page — interest signup, live counter, itinerary, community opt-in", access: "public" },
                { path: "/cruise/dashboard", label: "Cruise Dashboard", desc: "Passenger hub — admin announcements, chat lounge, itinerary, countdown", access: "login" },
                { path: "/claim/[pin]", label: "Prize Claim", desc: "Raffle prize claim — enter 6-digit PIN from winner email. No login needed.", access: "public" },
                { path: "/book", label: "Book the Band", desc: "Multi-step booking form: event type, production, venue, account creation", access: "public" },
                { path: "/book/success", label: "Booking Success", desc: "Post-booking confirmation page", access: "public" },
                { path: "/book/cancel", label: "Booking Cancel", desc: "Token-based cancellation — no login needed, link from email", access: "public" },
                { path: "/planner", label: "Planner Dashboard", desc: "Booking status tracking, checklist editor, re-book flow", access: "login" },
                { path: "/cruise/cancel", label: "Cruise Cancel", desc: "Token-based cruise interest cancellation — no login", access: "public" },
              ],
            },
            {
              group: "📡 Live Streaming",
              pages: [
                { path: "/live", label: "Live Hub", desc: "Real-time gallery of all active crew broadcasts with viewer counts", access: "public" },
                { path: "/live/[room]", label: "Fan Viewer", desc: "Full-screen WebRTC viewer — chat, emoji reactions, hype meter, raffle, flash drops", access: "public" },
                { path: "/live/live_michael", label: "Michael's Room", desc: "Direct link to Michael's personal broadcast room", access: "public" },
                { path: "/live/live_ryan", label: "Ryan's Room", desc: "Direct link to Ryan's personal broadcast room", access: "public" },
                { path: "/live/live_sammy", label: "Sammy's Room", desc: "Direct link to Sammy's personal broadcast room", access: "public" },
                { path: "/live/live_tony", label: "Tony's Room", desc: "Direct link to Tony's personal broadcast room", access: "public" },
              ],
            },
            {
              group: "🛒 Commerce",
              pages: [
                { path: "/store", label: "Merch Store", desc: "Headless Shopify — product grid, cart drawer, category filters, checkout", access: "public" },
                { path: "/merch", label: "Merch Landing", desc: "Featured merch showcase with quick-add to cart", access: "public" },
              ],
            },
            {
              group: "🎛️ Crew",
              pages: [
                { path: "/crew", label: "Crew Dashboard", desc: "Broadcast studio — go live, raffle engine, flash drops, chat moderation", access: "admin" },
                { path: "/crew/verify", label: "Crew Verify", desc: "Crew account email verification flow", access: "admin" },
              ],
            },
            {
              group: "⚡ Admin",
              pages: [
                { path: "/admin", label: "Admin Dashboard", desc: "Band + Cruise tabs — analytics, bookings, SMS, newsletter, photos, registry, audit log", access: "admin" },
                { path: "/admin/features", label: "Feature Tracker", desc: "Internal admin feature list with status, category, and API keys", access: "admin" },
                { path: "/admin/emails", label: "Email Templates", desc: "Preview and test all 12 transactional email templates", access: "admin" },
                { path: "/admin/feed", label: "Activity Feed", desc: "Real-time platform activity feed and audit log", access: "admin" },
                { path: "/admin/email-map", label: "Email Map", desc: "Visual overview of all email trigger → template mappings", access: "admin" },
                { path: "/sitemap", label: "Developer Sitemap", desc: "Full architecture overview — all routes, APIs, Supabase tables, and integrations", access: "admin" },
                { path: "/studio", label: "Sanity Studio", desc: "Headless CMS editor — manage tour dates, news, bios, settings, media", access: "admin" },
              ],
            },
            {
              group: "🔧 Dev / Preview Pages",
              pages: [
                { path: "/demo", label: "Demo Sandbox", desc: "General feature demo and integration test sandbox", access: "dev" },
                { path: "/demo/proximity", label: "Proximity Demo", desc: "SMS proximity alert interactive demo simulation", access: "dev" },
                { path: "/live/demo", label: "Live Chat Demo", desc: "Live chat simulation with automated mock messages", access: "dev" },
                { path: "/cruise/form-a", label: "Cruise Form A", desc: "Cruise signup form — layout variant A", access: "dev" },
                { path: "/cruise/form-b", label: "Cruise Form B", desc: "Cruise signup form — layout variant B", access: "dev" },
                { path: "/cruise/form-c", label: "Cruise Form C", desc: "Cruise signup form — layout variant C", access: "dev" },
                { path: "/cruise/layout-a", label: "Cruise Layout A", desc: "Full cruise page — layout variant A", access: "dev" },
                { path: "/cruise/layout-b", label: "Cruise Layout B", desc: "Full cruise page — layout variant B", access: "dev" },
                { path: "/cruise/layout-c", label: "Cruise Layout C", desc: "Full cruise page — layout variant C", access: "dev" },
                { path: "/cruise/hero-demo", label: "Cruise Hero Demo", desc: "Isolated cruise hero section visual test", access: "dev" },
                { path: "/bio/preview", label: "Bio Preview", desc: "Band bio page draft preview mode (Sanity draft)", access: "dev" },
                { path: "/video/grid-demo", label: "Video Grid Demo", desc: "Video thumbnail grid layout test", access: "dev" },
                { path: "/video/layout-demo", label: "Video Layout Demo", desc: "Full video page layout test", access: "dev" },
                { path: "/video/nav-demo", label: "Video Nav Demo", desc: "Video category navigation component test", access: "dev" },
              ],
            },
          ].map((group) => {
            const accessStyles: Record<string, string> = {
              public: "bg-emerald-500/10 border-emerald-500/25 text-[var(--color-accent)]",
              login: "bg-purple-600/10  border-purple-500/25  text-purple-300",
              admin: "bg-blue-500/10   border-blue-500/25   text-blue-400",
              dev: "bg-white/5       border-white/10      text-white/30",
            };
            const accessLabel: Record<string, string> = {
              public: "Public",
              login: "Login Required",
              admin: "Admin / Crew",
              dev: "Dev Page",
            };
            const accessDot: Record<string, string> = {
              public: "bg-emerald-500",
              login: "bg-purple-600",
              admin: "bg-blue-500",
              dev: "bg-white/30",
            };

            return (
              <div key={group.group} className="mb-6">
                <h3 className="text-base font-black uppercase tracking-[0.2em] text-white/40 mb-3 flex items-center gap-3">
                  <span>{group.group}</span>
                  <span className="h-px flex-1 bg-white/[0.06]" />
                  <span className="text-white/20 text-sm font-normal normal-case">{group.pages.length} pages</span>
                </h3>

                <div className="border border-white/[0.07] overflow-hidden divide-y divide-white/[0.04]">
                  {group.pages.map((page) => (
                    <Link
                      key={page.path}
                      href={page.path.includes("[") ? "#" : page.path}
                      target={page.path.includes("[") ? undefined : "_blank"}
                      className={`flex items-center gap-4 px-5 py-3 transition-colors duration-150 group ${page.access === "dev" ? "bg-white/[0.01] hover:bg-white/[0.03]" : "hover:bg-white/[0.04]"
                        } ${page.path.includes("[") ? "cursor-default" : "cursor-pointer"}`}
                    >
                      <span className={`w-2 h-2 rounded-full shrink-0 ${accessDot[page.access]}`} />

                      <code className="text-sm font-mono text-white/50 group-hover:text-white/90 transition-colors w-[180px] md:w-[220px] shrink-0 truncate">
                        {page.path}
                      </code>

                      <span className="text-sm font-black text-white/80 group-hover:text-white transition-colors w-[130px] md:w-[160px] shrink-0 truncate uppercase tracking-wide" style={{ fontFamily: "var(--font-barlow-condensed), var(--font-inter)", fontStyle: "italic" }}>
                        {page.label}
                      </span>

                      <span className="text-sm text-white/30 group-hover:text-white/50 transition-colors flex-1 min-w-0 truncate hidden lg:block">
                        {page.desc}
                      </span>

                      <span className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-full border whitespace-nowrap ${accessStyles[page.access]}`}>
                        {accessLabel[page.access]}
                      </span>

                      {!page.path.includes("[") && (
                        <span className="text-white/20 group-hover:text-white/70 transition-colors shrink-0">↗</span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══ FLAGSHIP FEATURES ═══════════════════════════ */}
      <section className="py-24 px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <span className=" text-[var(--color-accent)]">✦</span>
            <h2 className="text-4xl font-black uppercase tracking-widest text-white" style={{ fontFamily: "var(--font-barlow-condensed), var(--font-inter)", fontStyle: "italic" }}>Flagship Features</h2>
          </div>
          <p className="text-white/35 mb-12 max-w-2xl">The ten defining features of the platform — each explained in full with bullet points, business impact, and a technical walkthrough. Click <em>How It Works</em> on any card to expand the technical detail.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {highlights.map((f) => <FeatureCardUI key={f.title} f={f} />)}
          </div>
        </div>
      </section>

      {/* ═══ FULL FEATURE SET ════════════════════════════ */}
      <section className="py-24 px-6 md:px-12 lg:px-20 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-white/30">◈</span>
            <h2 className="text-4xl font-black uppercase tracking-widest text-white" style={{ fontFamily: "var(--font-barlow-condensed), var(--font-inter)", fontStyle: "italic" }}>All {FEATURES.length} Features</h2>
          </div>
          <p className="text-white/35 mb-10">Filter by category. Every feature card includes a full description, bullet list, business impact statement, and expandable technical breakdown.</p>

          <div className="flex flex-wrap gap-2 mb-10">
            {CATEGORIES.map(cat => {
              const count = cat.key === "all" ? FEATURES.length : FEATURES.filter(f => f.category.includes(cat.key as Category)).length;
              return (
                <button aria-label="Action button" key={cat.key} onClick={() => setActiveCategory(cat.key as Category | "all")}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-[0.1em] border transition-colors cursor-pointer ${activeCategory === cat.key ? "bg-[var(--color-accent)] border-[#851DEF] text-white shadow-[0_0_20px_rgba(255,10,61,0.35)]" : "bg-white/[0.03] border-white/10 text-white/50 hover:text-white hover:border-white/30"}`}>
                  {cat.icon} {cat.label}
                  <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs font-black ${activeCategory === cat.key ? "bg-white/20 text-white" : "bg-white/5 text-white/30"}`}>{count}</span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((f) => <FeatureCardUI key={f.title} f={f} />)}
          </div>
        </div>
      </section>

      {/* ═══ TECH STACK ══════════════════════════════════ */}
      <section className="py-24 px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-white/30">◈</span>
            <h2 className="text-4xl font-black uppercase tracking-widest text-white" style={{ fontFamily: "var(--font-barlow-condensed), var(--font-inter)", fontStyle: "italic" }}>Built With</h2>
          </div>
          <p className="text-white/35 mb-10">Best-in-class services and frameworks — each chosen for reliability, scalability, and fit-for-purpose performance.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TECH.map((t, i) => (
              <div key={t.name} className="flex items-start gap-4 p-5 border border-white/[0.06] bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04] transition-colors cursor-default">
                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-2xl shrink-0">{t.icon}</div>
                <div>
                  <div className="text-base font-black uppercase tracking-wide" style={{ color: t.color }}>{t.name}</div>
                  <p className="text-sm text-white/40 leading-relaxed mt-0.5">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* directory moved to top */}
      <section className="py-0" style={{ display: 'none' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-emerald-400 text-xl">⊞</span>
            <h2 className="text-4xl font-black uppercase tracking-widest text-white" style={{ fontFamily: "var(--font-barlow-condensed), var(--font-inter)", fontStyle: "italic" }}>
              Site Directory
            </h2>
          </div>
          <p className="text-white/35 mb-4 max-w-2xl">
            Every page on the site — click any row to open it directly. Pages marked <span className="text-emerald-400 font-bold">Public</span> are accessible without logging in. Pages marked <span className="text-purple-300 font-bold">Login Required</span> need an account.
          </p>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 mb-10">
            {[
              { color: "bg-emerald-500/15 border-emerald-500/30 text-[var(--color-accent)]", dot: "bg-emerald-500", label: "Public — no login needed" },
              { color: "bg-purple-600/15 border-purple-500/30 text-purple-300", dot: "bg-purple-600", label: "Login Required" },
              { color: "bg-blue-500/15 border-blue-500/30 text-blue-400", dot: "bg-blue-500", label: "Admin / Crew Only" },
              { color: "bg-white/5 border-white/10 text-white/30", dot: "bg-white/30", label: "Dev / Preview Page" },
            ].map(l => (
              <div key={l.label} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold ${l.color}`}>
                <span className={`w-2 h-2 rounded-full ${l.dot}`} />
                {l.label}
              </div>
            ))}
          </div>

          {[
            {
              group: "🏠 Public — Core Pages",
              pages: [
                { path: "/", label: "Homepage", desc: "Main landing page — live detection, tour map, music, merch, photos", access: "public" },
                { path: "/tour", label: "Tour Dates", desc: "Interactive Leaflet map + chronological show list with search", access: "public" },
                { path: "/bio", label: "Band Bio", desc: "Full band history timeline + member listing", access: "public" },
                { path: "/members", label: "Member Profiles", desc: "Individual member pages at /members/[slug]", access: "public" },
                { path: "/video", label: "Video Gallery", desc: "10+ category video library with custom inline YouTube player", access: "public" },
                { path: "/music", label: "Music Player", desc: "Full track list with persistent audio player", access: "public" },
                { path: "/fan-photo-wall", label: "Fan Photo Wall", desc: "AI-moderated masonry grid of fan-submitted concert photos", access: "public" },
                { path: "/contact", label: "Contact", desc: "Contact form for general inquiries", access: "public" },
                { path: "/privacy", label: "Privacy Policy", desc: "Site privacy policy", access: "public" },
                { path: "/terms", label: "Terms of Service", desc: "Terms and conditions", access: "public" },
                { path: "/features", label: "Features", desc: "This page — full platform feature showcase", access: "public" },
              ],
            },
            {
              group: "🎸 Fan Pages",
              pages: [
                { path: "/fans", label: "Fan Dashboard", desc: "Personalized hub — live feed, SMS alerts, prize wallet, referrals, photo upload", access: "login" },
                { path: "/shows/[id]", label: "Show Pages", desc: "Per-show RSVP, attendee list, QR share, directions, live-stream banner", access: "public" },
                { path: "/cruise", label: "Caribbean Cruise", desc: "Cruise campaign page — signup, itinerary, live counter, community opt-in", access: "public" },
                { path: "/cruise/dashboard", label: "Cruise Dashboard", desc: "Exclusive passenger hub — announcements, chat, itinerary, countdown", access: "login" },
                { path: "/claim/[pin]", label: "Prize Claim", desc: "Raffle prize claim portal — enter 6-digit PIN, no login needed", access: "public" },
                { path: "/book", label: "Book the Band", desc: "Multi-step booking form for event planners", access: "public" },
                { path: "/book/success", label: "Booking Success", desc: "Post-booking confirmation page", access: "public" },
                { path: "/book/cancel", label: "Booking Cancel", desc: "Token-based booking cancellation — no login needed", access: "public" },
                { path: "/planner", label: "Planner Dashboard", desc: "Event planner portal — booking status, checklist, re-book", access: "login" },
              ],
            },
            {
              group: "📡 Live Streaming",
              pages: [
                { path: "/live", label: "Live Stream Hub", desc: "Real-time gallery of all active crew broadcasts", access: "public" },
                { path: "/live/[room]", label: "Live Viewer", desc: "Fan viewer — WebRTC video, chat, reactions, hype meter, raffle", access: "public" },
                { path: "/live/live_michael", label: "Live — Michael", desc: "Direct link to Michael's broadcast room", access: "public" },
                { path: "/live/live_ryan", label: "Live — Ryan", desc: "Direct link to Ryan's broadcast room", access: "public" },
                { path: "/live/live_sammy", label: "Live — Sammy", desc: "Direct link to Sammy's broadcast room", access: "public" },
                { path: "/live/live_tony", label: "Live — Tony", desc: "Direct link to Tony's broadcast room", access: "public" },
              ],
            },
            {
              group: "🛒 Commerce",
              pages: [
                { path: "/store", label: "Merch Store", desc: "Headless Shopify storefront — products, cart, checkout", access: "public" },
                { path: "/merch", label: "Merch Landing", desc: "Featured merch showcase with quick-shop", access: "public" },
              ],
            },
            {
              group: "🎛️ Crew Pages",
              pages: [
                { path: "/crew", label: "Crew Dashboard", desc: "Broadcast studio — go live, launch raffles, flash drops, moderate chat", access: "admin" },
                { path: "/crew/verify", label: "Crew Verify", desc: "Crew account verification flow", access: "admin" },
              ],
            },
            {
              group: "⚡ Admin Pages",
              pages: [
                { path: "/admin", label: "Admin Dashboard", desc: "Full platform control — Band + Cruise tabs, all management tools", access: "admin" },
                { path: "/admin/features", label: "Admin — Features", desc: "Internal feature tracker with status, category, and API keys", access: "admin" },
                { path: "/admin/emails", label: "Admin — Emails", desc: "Preview and test all 12 email templates", access: "admin" },
                { path: "/admin/feed", label: "Admin — Feed", desc: "Activity feed and audit log", access: "admin" },
                { path: "/admin/email-map", label: "Admin — Email Map", desc: "Overview of all email trigger mappings", access: "admin" },
                { path: "/sitemap", label: "Sitemap (Dev)", desc: "Developer-facing architecture overview of all routes and APIs", access: "admin" },
              ],
            },
            {
              group: "🔧 Dev / Preview Pages",
              pages: [
                { path: "/demo", label: "Demo", desc: "General feature demo sandbox", access: "dev" },
                { path: "/demo/proximity", label: "Proximity Demo", desc: "SMS proximity alert demo simulation", access: "dev" },
                { path: "/live/demo", label: "Live Chat Demo", desc: "Live chat simulation with mock messages", access: "dev" },
                { path: "/cruise/form-a", label: "Cruise Form A", desc: "Cruise form layout variant A", access: "dev" },
                { path: "/cruise/form-b", label: "Cruise Form B", desc: "Cruise form layout variant B", access: "dev" },
                { path: "/cruise/form-c", label: "Cruise Form C", desc: "Cruise form layout variant C", access: "dev" },
                { path: "/cruise/layout-a", label: "Cruise Layout A", desc: "Cruise page layout variant A", access: "dev" },
                { path: "/cruise/layout-b", label: "Cruise Layout B", desc: "Cruise page layout variant B", access: "dev" },
                { path: "/cruise/layout-c", label: "Cruise Layout C", desc: "Cruise page layout variant C", access: "dev" },
                { path: "/cruise/hero-demo", label: "Cruise Hero Demo", desc: "Hero section visual demo", access: "dev" },
                { path: "/bio/preview", label: "Bio Preview", desc: "Band bio draft preview mode", access: "dev" },
                { path: "/video/grid-demo", label: "Video Grid Demo", desc: "Video grid layout test", access: "dev" },
                { path: "/video/layout-demo", label: "Video Layout Demo", desc: "Video page layout test", access: "dev" },
                { path: "/video/nav-demo", label: "Video Nav Demo", desc: "Video navigation component demo", access: "dev" },
                { path: "/studio", label: "Sanity Studio", desc: "Headless CMS editor — manage all content", access: "admin" },
              ],
            },
          ].map((group) => {
            const accessStyles: Record<string, string> = {
              public: "bg-emerald-500/10 border-emerald-500/25 text-[var(--color-accent)]",
              login: "bg-purple-600/10 border-purple-500/25 text-purple-300",
              admin: "bg-blue-500/10 border-blue-500/25 text-blue-400",
              dev: "bg-white/5 border-white/10 text-white/30",
            };
            const accessLabel: Record<string, string> = {
              public: "Public",
              login: "Login Required",
              admin: "Admin / Crew",
              dev: "Dev Page",
            };
            const accessDot: Record<string, string> = {
              public: "bg-emerald-500",
              login: "bg-purple-600",
              admin: "bg-blue-500",
              dev: "bg-white/30",
            };

            return (
              <div key={group.group} className="mb-8">
                <h3 className="text-base font-black uppercase tracking-[0.2em] text-white/40 mb-3 flex items-center gap-2">
                  {group.group}
                  <span className="h-px flex-1 bg-white/[0.06]" />
                  <span className="text-white/20 text-sm font-normal normal-case">{group.pages.length} pages</span>
                </h3>

                <div className="border border-white/[0.07] overflow-hidden">
                  {group.pages.map((page, pi) => (
                    <Link
                      key={page.path}
                      href={page.path.includes("[") ? "#" : page.path}
                      target={page.path.includes("[") ? undefined : "_blank"}
                      className={`flex items-center gap-4 px-5 py-3.5 transition-colors group ${pi !== group.pages.length - 1 ? "border-b border-white/[0.05]" : ""
                        } ${page.access === "dev"
                          ? " hover:bg-white/[0.02]"
                          : "bg-black/10 hover:bg-white/[0.04]"
                        }`}
                    >
                      {/* access dot */}
                      <span className={`w-2 h-2 rounded-full shrink-0 ${accessDot[page.access]}`} />

                      {/* path */}
                      <code className="text-sm font-mono text-white/60 group-hover:text-white transition-colors min-w-[200px] shrink-0">
                        {page.path}
                      </code>

                      {/* label */}
                      <span className="text-sm font-black text-white/80 group-hover:text-white transition-colors uppercase tracking-wide shrink-0" style={{ fontFamily: "var(--font-barlow-condensed), var(--font-inter)", fontStyle: "italic" }}>
                        {page.label}
                      </span>

                      {/* desc */}
                      <span className="text-sm text-white/30 group-hover:text-white/50 transition-colors flex-1 min-w-0 truncate hidden md:block">
                        — {page.desc}
                      </span>

                      {/* access badge */}
                      <span className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-full border ${accessStyles[page.access]}`}>
                        {accessLabel[page.access]}
                      </span>

                      {/* arrow */}
                      {!page.path.includes("[") && (
                        <span className="text-white/20 group-hover:text-white/60 transition-colors shrink-0 text-sm">↗</span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══ CTA ═════════════════════════════════════════ */}
      <section className="relative py-32 px-6 overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#851DEF]/8 to-transparent" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[400px] rounded-full bg-[var(--color-accent)] opacity-[0.07] blur-[130px]" />
          <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "linear-gradient(rgba(255,10,61,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,10,61,0.5) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-6xl md:text-8xl font-black uppercase text-white mb-4 leading-none" style={{ fontFamily: "var(--font-barlow-condensed), var(--font-inter)", fontStyle: "italic" }}>
            Ready to<br /><span style={{ color: "#851DEF" }}>Experience It?</span>
          </h2>
          <p className="text-white/40 text-2xl mb-3 max-w-2xl mx-auto">Every feature on this page is live and ready. No demos, no mockups — the real thing.</p>
          <p className="text-white/20 text-base mb-12">Questions? Reach out via the contact page.</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/fans" className="cursor-pointer inline-flex items-center gap-2 px-8 py-4 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-black text-base uppercase tracking-[0.15em] rounded-full transition-colors hover:scale-105 hover:shadow-[0_0_40px_rgba(255,10,61,0.5)]">Join as a Fan →</Link>
            <Link href="/live" className="cursor-pointer inline-flex items-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/15 hover:border-white/30 text-white font-black text-base uppercase tracking-[0.15em] rounded-full transition-colors">Watch Live</Link>
            <Link href="/#tour" className="cursor-pointer inline-flex items-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/15 hover:border-white/30 text-white font-black text-base uppercase tracking-[0.15em] rounded-full transition-colors">See Tour Dates</Link>
            <Link href="/book" className="cursor-pointer inline-flex items-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/15 hover:border-white/30 text-white font-black text-base uppercase tracking-[0.15em] rounded-full transition-colors">Book the Band</Link>
            <Link href="/contact" className="cursor-pointer inline-flex items-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/15 hover:border-white/30 text-white font-black text-base uppercase tracking-[0.15em] rounded-full transition-colors">Contact Us</Link>
          </div>
        </div>
      </section>

    </main>
  );
}
