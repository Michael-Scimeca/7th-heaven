"use client";

import { useState } from "react";

interface ComplianceSection {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  requirements: {
    title: string;
    description: string;
    actionItem: string;
    isCritical: boolean;
  }[];
  explanation: string;
}

const SECTIONS: ComplianceSection[] = [
  {
    id: "sms",
    title: "SMS Marketing (TCPA & CTIA)",
    subtitle: "Federal regulations on text messaging and consumer contact",
    color: "text-purple-300",
    bgColor: "bg-purple-600/5",
    borderColor: "border-purple-500/20",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
    ),
    requirements: [
      {
        title: "Prior Express Written Consent",
        description: "You cannot text a fan without their explicit consent. Consent cannot be bundled or buried in terms.",
        actionItem: "Maintain checkbox/input record of opt-in with date, time, and IP address in the Supabase db.",
        isCritical: true,
      },
      {
        title: "Mandatory Disclosures",
        description: "The signup form must clearly display text stating message/data rates apply, frequency, and opt-out instructions.",
        actionItem: "Keep the disclosure label below the telephone input field in the SMS sign-up footer.",
        isCritical: true,
      },
      {
        title: "Automated Opt-Out (STOP)",
        description: "Regulations require recognizing opt-out requests instantly (STOP, CANCEL, QUIT, UNSUBSCRIBE).",
        actionItem: "Verify the webhook at /api/sms/webhook correctly processes and unsubscribes the matching phone number.",
        isCritical: true,
      },
      {
        title: "Restricted Quiet Hours",
        description: "Under TCPA, sending promotional SMS messages before 8:00 AM or after 9:00 PM local time is illegal.",
        actionItem: "Implement local time-zone checks in backend tasks before executing any bulk sms blast.",
        isCritical: false,
      }
    ],
    explanation: "Violations of the Telephone Consumer Protection Act (TCPA) carry steep statutory fines ranging from $500 to $1,500 *per text message sent* to an unconsented number. These are class-action magnet issues; ensuring opt-out and consent logging is highly critical."
  },
  {
    id: "music",
    title: "Music Rights & Streaming",
    subtitle: "Webcasting rights and cover song sync licensing",
    color: " text-[var(--color-accent)]",
    bgColor: "bg-purple-500/5",
    borderColor: "border-purple-500/20",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    ),
    requirements: [
      {
        title: "Digital Performance Rights",
        description: "Venue licenses (ASCAP/BMI) only cover physical audience spaces. Streaming covers online requires separate licensing.",
        actionItem: "Consult licensing agencies (e.g. SoundExchange, PROs) regarding digital performance licenses for webcasts.",
        isCritical: true,
      },
      {
        title: "Sync & Mechanical Licenses",
        description: "If live stream recordings are saved and hosted on the site (archived shows), you must secure sync licenses from publishers.",
        actionItem: "Do not permanently archive video playback of cover performances unless licensing agreements are fully finalized.",
        isCritical: true,
      },
      {
        title: "DMCA Safe Harbor",
        description: "If users can upload materials (e.g., fan wall photos, videos), you need a registered copyright agent to handle takedowns.",
        actionItem: "Put a DMCA agent contact address in the Terms of Service to protect the band under Section 512.",
        isCritical: false,
      }
    ],
    explanation: "Self-hosting live streams via LiveKit bypasses the automatic copyright coverage that platforms like YouTube or Facebook provide. Since you are hosting the video stream directly on 7thheavenband.com, the band takes on 100% of the liability for copyright infringement claims on cover songs performed during streams."
  },
  {
    id: "merch",
    title: "E-Commerce & PCI Compliance",
    subtitle: "Payment processing and tax nexus rules",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/5",
    borderColor: " border-[var(--color-accent)]/30",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
    requirements: [
      {
        title: "PCI-DSS Data Security Scope",
        description: "You must never store, log, or handle credit card details on your backend servers. Payment collection must be outsourced.",
        actionItem: "Keep checkout fully redirected to Shopify. Do not collect payment form inputs directly in Next.js pages.",
        isCritical: true,
      },
      {
        title: "Sales Tax & Economic Nexus",
        description: "Even out-of-state merchandise shipments require sales tax collection if you meet minimum threshold limits in shipping states.",
        actionItem: "Configure tax collection matrices inside Shopify Admin matching where the band has physical or economic nexus.",
        isCritical: true,
      },
      {
        title: "Disclosed Store Policies",
        description: "FTC rules state online stores must clearly display shipping delays, refund options, and return policies.",
        actionItem: "Verify Refund Policy and Shipping Terms links are visible during checkout and in the site footer.",
        isCritical: false,
      }
    ],
    explanation: "By keeping checkout entirely inside Shopify, the website remains inside the safest PCI compliance tier (Self-Assessment Questionnaire A). If credit card numbers ever pass through your own server code, the costs and audit burdens of maintaining compliance jump exponentially."
  },
  {
    id: "privacy",
    title: "Data Privacy & COPPA",
    subtitle: "Fan profiles, chat rooms, and cookie audits",
    color: "text-blue-400",
    bgColor: "bg-blue-500/5",
    borderColor: "border-blue-500/20",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    requirements: [
      {
        title: "Children's Privacy (COPPA)",
        description: "Websites collecting personal details from children under 13 must secure parental permission, which is highly restricted.",
        actionItem: "Update Terms to state that the fan dashboard and chat rooms are strictly for users aged 13+.",
        isCritical: true,
      },
      {
        title: "Information Disclosures",
        description: "Your Privacy Policy must explicitly declare that you track IP addresses (for chat rate limiting) and store phone numbers.",
        actionItem: "Audit the Privacy page to list Twilio, Shopify, and Supabase under details shared with processors.",
        isCritical: true,
      },
      {
        title: "Cookie Consent & GDPR",
        description: "European/international privacy frameworks require consent before cookies can be placed on a user's browser.",
        actionItem: "Verify the CookieConsentBanner displays and records consent options correctly on initial landing.",
        isCritical: false,
      }
    ],
    explanation: "Because the platform includes public, unmoderated live chat rooms next to streams, protecting the platform from under-age interactions is crucial. Strict terms regarding age limits, coupled with your PG-13 content filter, keep the site in safe harbor."
  },
  {
    id: "ada",
    title: "ADA Accessibility (WCAG 2.1)",
    subtitle: "Accessibility guidelines for users with disabilities",
    color: "text-rose-400",
    bgColor: "bg-rose-500/5",
    borderColor: "border-rose-500/20",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v8M8 12h8" />
      </svg>
    ),
    requirements: [
      {
        title: "Image Alt Text",
        description: "Images on the website (merchandise, band member headshots, fan wall photos) must have descriptive Alt text.",
        actionItem: "Ensure Alt text input fields are included in the fan upload form and admin review panel.",
        isCritical: true,
      },
      {
        title: "Color Contrast Ratios",
        description: "Heading text and details must have a contrast ratio of at least 4.5:1 against the dark background.",
        actionItem: "Keep body text at color-text-secondary (#a0a0b8) or white; avoid dark gray text on a dark background.",
        isCritical: false,
      },
      {
        title: "Keyboard Focus & Accessibility",
        description: "A user must be able to navigate all links, dropdown filters, and checkouts using only the Tab and Enter keys.",
        actionItem: "Run a focus check using browser tools to verify outline styles are visible on interactive links.",
        isCritical: false,
      }
    ],
    explanation: "Title III ADA lawsuits targeting e-commerce stores have surged in recent years. By prioritizing screen-reader friendly layouts and descriptive Alt text, the site protects itself from automated compliance sweeps and legal litigation."
  },
  {
    id: "feedback",
    title: "Client Feedback & Data Security",
    subtitle: "Regulations on staging reviews and database access controls",
    color: "text-orange-400",
    bgColor: "bg-orange-500/5",
    borderColor: "border-orange-500/20",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    requirements: [
      {
        title: "Database Access Controls (RLS)",
        description: "Public database tables storing staging comments or notes must have strict Row Level Security (RLS) policies in production to prevent malicious data tampering or deletions.",
        actionItem: "Limit the Supabase policy on `client_notes` to authenticated staging users or developers prior to production deployment.",
        isCritical: true,
      },
      {
        title: "Secure feedback sanitization",
        description: "Feedback inputs are saved directly to database text fields. They must be parsed/escaped to prevent XSS attacks during staging reviews.",
        actionItem: "Verify note content input fields escape HTML characters before rendering them inside the DraggableNote component.",
        isCritical: true,
      }
    ],
    explanation: "While development/staging review widgets are useful, leaving database write access open to anonymous clients in production can expose public-facing endpoints. Implementing proper RLS rules and input sanitization mitigates cross-site scripting (XSS) and unauthorized comment injection."
  }
];

export default function AdminLegalPage() {
  const [selectedSection, setSelectedSection] = useState<string>("sms");

  const active = SECTIONS.find((s) => s.id === selectedSection) || SECTIONS[0];

  return (
    <div className="min-h-screen pt-[72px] bg-[#f0f2f5] text-black">
      <div className="site-container py-16">

        {/* Header */}
        <div className="mb-12">
          <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase  text-[var(--color-accent)] mb-4 px-5 py-1.5 border border-[rgba(255,10,61,0.3)] bg-[var(--color-accent)]/10 rounded-md">
            🔒 Legal Compliance & Audit Panel
          </span>
          <h1 className="text-[clamp(2rem,4vw,3rem)] font-extrabold leading-tight tracking-tight uppercase italic font-[var(--font-heading)] text-black">
            Legal & Compliance <span className="gradient-text">Guide</span>
          </h1>
          <p className="text-black/50 text-sm mt-2 max-w-2xl font-sans">
            A developer-facing compliance dashboard outlining legal obligations, TCPA mandates, e-commerce protections, and accessibility criteria to address prior to launching live.
          </p>
        </div>

        {/* Sidebar & Detail Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 font-sans">

          {/* Left Menu */}
          <div className="space-y-2.5">
            {SECTIONS.map((sec) => {
              const isSelected = selectedSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setSelectedSection(sec.id)}
                  className={`w-full flex items-center gap-4 p-4 border  text-left transition-colors duration-200 cursor-pointer ${isSelected
                    ? `border-[var(--color-accent)] bg-[var(--color-accent)]/10 shadow-[0_4px_20px_rgba(255,10,61,0.1)]`
                    : `border-black/10 bg-white hover:border-black/20 hover:bg-white/80`
                    }`}
                >
                  <div className={`p-2 rounded-lg bg-black/5 ${sec.color}`}>
                    {sec.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-black leading-tight">{sec.title}</h3>
                    <p className="text-[var(--font-size-2xs)] text-black/40 mt-1 line-clamp-1">{sec.subtitle}</p>
                  </div>
                </button>
              );
            })}

            {/* Disclaimer notice */}
            <div className="mt-8 p-4 bg-white border border-black/5">
              <span className="text-[var(--font-size-3xs)] font-bold uppercase tracking-widest text-black/30 block mb-1">Legal Disclaimer</span>
              <p className="text-[var(--font-size-3xs)] leading-relaxed text-black/50">
                This dashboard serves as a general checklist of legal frameworks. It is not formal legal advice. Consult with an attorney or copyright expert before publishing live streaming services or bulk SMS campaigns.
              </p>
            </div>
          </div>

          {/* Right Detailed Panel */}
          <div className={`border  p-8 lg:p-10 transition-colors duration-300 bg-white ${active.borderColor}`}>

            {/* Header info */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-black/10">
              <div className={`p-3.5  bg-black/5 ${active.color}`}>
                {active.icon}
              </div>
              <div>
                <h2 className="text-xl lg:text-2xl font-black uppercase tracking-tight italic font-[var(--font-heading)] text-black">
                  {active.title}
                </h2>
                <p className="text-sm text-black/50 mt-1">{active.subtitle}</p>
              </div>
            </div>

            {/* Explanation box */}
            <div className="bg-[#f0f2f5] border border-black/5 p-5 mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-black/40 block mb-2">⚖️ Compliance Context</span>
              <p className="text-sm leading-relaxed text-black/70">{active.explanation}</p>
            </div>

            {/* Requirement Cards */}
            <div className="space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-widest  text-[var(--color-accent)] mb-3">Requirements & Action Checklist</h3>

              {active.requirements.map((req, index) => (
                <div key={index} className="bg-[#f8f9fa] border border-black/5 p-5 relative overflow-hidden">

                  {/* Critical Warning Indicator */}
                  {req.isCritical && (
                    <span className="absolute top-0 right-0 text-[var(--font-size-4xs)] font-black uppercase tracking-widest bg-rose-500/15 text-rose-500 px-3 py-1 border-b border-l border-rose-500/20 rounded-bl-lg">
                      Critical
                    </span>
                  )}

                  <h4 className="text-sm font-bold text-black pr-16">{req.title}</h4>
                  <p className="text-xs text-black/50 mt-1.5 leading-relaxed">{req.description}</p>

                  {/* Action Item details */}
                  <div className="mt-4 pt-3.5 border-t border-black/5 flex items-start gap-2.5">
                    <span className="text-xs text-emerald-600 font-bold shrink-0">🛠️ DEV ACTION:</span>
                    <p className="text-xs text-black/60 italic leading-relaxed">{req.actionItem}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
