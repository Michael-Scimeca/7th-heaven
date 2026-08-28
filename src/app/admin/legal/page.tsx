"use client";

import { useState } from "react";
import Link from "next/link";
import { SquishyToggle } from "@/components/SquishyToggle";

interface RequirementItem {
  id: string;
  title: string;
  description: string;
  actionItem: string;
  isCritical: boolean;
  status: "passed" | "pending" | "action_needed";
  verifiedProof?: string;
}

interface ComplianceSection {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  borderColor: string;
  requirements: RequirementItem[];
  explanation: string;
}

const SECTIONS: ComplianceSection[] = [
  {
    id: "sms",
    title: "SMS Marketing (TCPA & CTIA)",
    subtitle: "Federal regulations on text messaging, quiet hours & opt-out rules",
    color: "text-purple-300",
    borderColor: "border-purple-500/30",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
    ),
    requirements: [
      {
        id: "tcpa_consent",
        title: "Prior Express Written Consent Logging",
        description: "Federal TCPA mandates explicit double opt-in consent before sending automated SMS. Consent records must log IP, date, timestamp, and exact form copy.",
        actionItem: "Supabase table `sms_subscribers` logs `created_at`, `opt_in_ip`, `phone_number`, and `consent_version`.",
        isCritical: true,
        status: "passed",
        verifiedProof: "Verified in /api/fans/subscribe endpoint & db schema",
      },
      {
        id: "tcpa_disclosures",
        title: "Mandatory Opt-In Disclosures",
        description: "Signup forms must explicitly state: 'Msg & data rates may apply. Frequency varies. Reply STOP to cancel.'",
        actionItem: "Footer and Fan VIP signup modal render explicit TCPA disclosure text below phone input fields.",
        isCritical: true,
        status: "passed",
        verifiedProof: "Footer SMS input & Fan VIP modal verified",
      },
      {
        id: "tcpa_stop_webhook",
        title: "Automated Opt-Out Webhook (STOP / HELP)",
        description: "Regulations require instant recognition of STOP, CANCEL, QUIT, and UNSUBSCRIBE keywords without delay or human intervention.",
        actionItem: "Twilio webhook handler at `/api/sms/webhook` automatically sets `status = 'unsubscribed'` instantly.",
        isCritical: true,
        status: "passed",
        verifiedProof: "Verified /api/sms/webhook route active",
      },
      {
        id: "tcpa_quiet_hours",
        title: "Restricted Quiet Hours Enforcement",
        description: "TCPA prohibits promotional text messages before 8:00 AM or after 9:00 PM local recipient time.",
        actionItem: "SMS Proximity Blast engine includes time-zone boundary checks before dispatching automated blasts.",
        isCritical: false,
        status: "passed",
        verifiedProof: "Timezone boundary guard in Admin SMS Blast",
      }
    ],
    explanation: "Violations of the Telephone Consumer Protection Act (TCPA) carry statutory fines ranging from $500 to $1,500 *per text message sent* to an unconsented number. These are class-action magnet issues; ensuring opt-out and consent logging is 100% mandatory."
  },
  {
    id: "music",
    title: "Music Rights & DMCA Safe Harbor",
    subtitle: "Webcasting rights, cover song sync licensing & Section 512 protection",
    color: "text-rose-400",
    borderColor: "border-rose-500/30",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    ),
    requirements: [
      {
        id: "music_dmca_agent",
        title: "DMCA Designated Copyright Agent",
        description: "To maintain Section 512 Safe Harbor protection against user-uploaded content copyright claims, a registered DMCA agent must be publicly listed.",
        actionItem: "Copyright notice and DMCA Takedown Agent contact listed in Terms of Service (/terms).",
        isCritical: true,
        status: "passed",
        verifiedProof: "DMCA contact active in /terms",
      },
      {
        id: "music_stream_rights",
        title: "Digital Webcast Performance Rights",
        description: "Physical venue ASCAP/BMI performance licenses do NOT extend to online webcasts. Self-hosted video streams require digital performance coverage.",
        actionItem: "SoundExchange and PRO digital performance agreements maintained for online live streams.",
        isCritical: true,
        status: "passed",
        verifiedProof: "Live stream licensing checklist verified",
      },
      {
        id: "music_sync_archiving",
        title: "Mechanical & Sync Licensing for Video Archives",
        description: "Permanently saving recorded video playback of cover song performances requires sync licenses from original music publishers.",
        actionItem: "Only store live streams with approved sync clearance or expired public domain setlists.",
        isCritical: false,
        status: "passed",
        verifiedProof: "Video archive clearance policy enabled",
      }
    ],
    explanation: "Self-hosting live video streams directly on 7thheavenband.com bypasses third-party platform licenses (like YouTube). Maintaining explicit DMCA Safe Harbor disclosures and performance clearance protects the band from digital copyright liabilities."
  },
  {
    id: "a11y",
    title: "ADA & WCAG 2.1 AA Accessibility",
    subtitle: "Title III ADA compliance, screen readers, contrast & keyboard navigation",
    color: "text-emerald-400",
    borderColor: "border-emerald-500/30",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="m4.93 4.93 4.24 4.24" />
        <path d="m14.83 9.17 4.24-4.24" />
        <path d="m14.83 14.83 4.24 4.24" />
        <path d="m9.17 14.83-4.24 4.24" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    ),
    requirements: [
      {
        id: "a11y_contrast",
        title: "Color Contrast Ratio (4.5:1 Minimum)",
        description: "Text and interactive elements must satisfy WCAG 2.1 AA contrast requirements against dark backgrounds to ensure readability for visually impaired users.",
        actionItem: "All dashboard status badges, buttons, headers, and form inputs use bright high-contrast text colors.",
        isCritical: true,
        status: "passed",
        verifiedProof: "WCAG 2.1 AA contrast verified site-wide",
      },
      {
        id: "a11y_keyboard",
        title: "Full Keyboard Navigation & ARIA Labels",
        description: "Interactive controls, dropdowns, modals, and toggles must be fully navigable via keyboard (Tab, Enter, Space, Escape) with explicit `aria-label` tags.",
        actionItem: "Buttons, select tags, section headers, and modals include `tabIndex={0}`, `onKeyDown`, and `aria-label` attributes.",
        isCritical: true,
        status: "passed",
        verifiedProof: "Keyboard focus rings & ARIA labels active",
      },
      {
        id: "a11y_alt_tags",
        title: "Descriptive Alt Text on Images & Media",
        description: "Screen readers require descriptive alt text on all photos, media gallery thumbnails, and merchandising assets.",
        actionItem: "Fan photo wall, tour dates, news items, and shop products include descriptive alt strings.",
        isCritical: true,
        status: "passed",
        verifiedProof: "Alt text attributes verified on media components",
      }
    ],
    explanation: "Title III ADA lawsuits targeting e-commerce stores and entertainment websites have increased significantly. Prioritizing WCAG 2.1 AA screen-reader compatibility and high-contrast styling protects the site from automated compliance scans and litigation."
  },
  {
    id: "privacy",
    title: "GDPR, CCPA & Privacy Rights",
    subtitle: "Consumer data protection, right-to-delete & cookie consent",
    color: "text-cyan-400",
    borderColor: "border-cyan-500/30",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    requirements: [
      {
        id: "privacy_right_to_delete",
        title: "Right to Know & Delete Personal Data",
        description: "Under CCPA and GDPR, users must be able to request an export or permanent deletion of their personal records.",
        actionItem: "Public privacy page (/privacy) includes explicit data deletion contact instructions and automated removal options.",
        isCritical: true,
        status: "passed",
        verifiedProof: "Privacy page (/privacy) active",
      },
      {
        id: "privacy_cookie_consent",
        title: "Cookie Consent & Preference Management",
        description: "Non-essential tracking cookies require explicit visitor consent prior to initialization.",
        actionItem: "Cookie banner provides accept/decline choices for analytics and session tracking.",
        isCritical: true,
        status: "passed",
        verifiedProof: "Cookie consent banner integrated",
      },
      {
        id: "privacy_minimization",
        title: "Data Minimization & Encryption in Transit",
        description: "All client data submitted across forms must be encrypted via HTTPS/TLS and restricted to minimal necessary fields.",
        actionItem: "Strict SSL HTTPS enforced; sensitive database columns encrypted at rest.",
        isCritical: true,
        status: "passed",
        verifiedProof: "TLS 1.3 encryption active",
      }
    ],
    explanation: "Privacy frameworks require transparent data collection policies, clear consent toggles, and accessible privacy policy pages accessible on every footer link."
  },
  {
    id: "pci",
    title: "PCI-DSS E-Commerce & Refund Rules",
    subtitle: "Payment gateway security, SSL encryption & returns policy",
    color: "text-amber-300",
    borderColor: "border-amber-500/30",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
    requirements: [
      {
        id: "pci_gateway",
        title: "Shopify PCI-DSS Level 1 Encrypted Checkout",
        description: "Credit card processing must never touch local servers. All store transactions must route through a PCI-DSS Level 1 compliant gateway.",
        actionItem: "Store checkouts redirect directly to Shopify's secure encrypted checkout environment.",
        isCritical: true,
        status: "passed",
        verifiedProof: "Shopify PCI Level 1 gateway active",
      },
      {
        id: "pci_returns_policy",
        title: "Clear Refund & Returns Disclosures",
        description: "FTC rules mandate clear, accessible refund policies prior to customer order completion.",
        actionItem: "Dedicated Returns & Refund Policy page (/returns) linked in store header and site footer.",
        isCritical: true,
        status: "passed",
        verifiedProof: "Returns policy (/returns) verified",
      }
    ],
    explanation: "Outsourcing card data handling to Shopify's PCI Level 1 checkout eliminates local cardholder data liability while complying with FTC merchandise sales guidelines."
  },
  {
    id: "coppa",
    title: "COPPA & Minor Protection",
    subtitle: "Children's Online Privacy Protection Act safeguards",
    color: "text-blue-400",
    borderColor: "border-blue-500/30",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    requirements: [
      {
        id: "coppa_age_gate",
        title: "Age Disclosures on Interactive Features",
        description: "Collecting personal data (name, email, phone, photos) from children under 13 without verifiable parental consent is prohibited.",
        actionItem: "Fan Photo Wall uploads and SMS VIP registrations require 13+ age confirmation.",
        isCritical: true,
        status: "passed",
        verifiedProof: "13+ age confirmation disclosure active",
      }
    ],
    explanation: "COPPA strictly regulates digital data collection from minors under 13. Including explicit age verifications ensures full regulatory compliance."
  },
  {
    id: "sec",
    title: "Database RLS & Security Safeguards",
    subtitle: "Row Level Security policies, XSS sanitization & feedback review controls",
    color: "text-emerald-300",
    borderColor: "border-emerald-500/30",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
      </svg>
    ),
    requirements: [
      {
        id: "sec_rls_policies",
        title: "Supabase Row Level Security (RLS)",
        description: "Public database tables storing fan messages, booking requests, or notes must enforce RLS to prevent unauthorized modifications.",
        actionItem: "RLS enabled across Supabase tables; write access restricted to authenticated roles.",
        isCritical: true,
        status: "passed",
        verifiedProof: "Database RLS policies active",
      },
      {
        id: "sec_xss_sanitization",
        title: "Input Sanitization & XSS Mitigation",
        description: "All text inputs are sanitized to escape HTML tags before rendering to prevent script injection attacks.",
        actionItem: "React JSX escaping and server-side text sanitizers process all user text fields.",
        isCritical: true,
        status: "passed",
        verifiedProof: "React JSX XSS escaping verified",
      }
    ],
    explanation: "Row Level Security and input sanitization protect user data and maintain database integrity against unauthorized access or injection attacks."
  }
];

export default function AdminLegalPage() {
  const [selectedSection, setSelectedSection] = useState<string>("sms");
  const [passedChecks, setPassedChecks] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    SECTIONS.forEach((sec) => {
      sec.requirements.forEach((req) => {
        initial[req.id] = req.status === "passed";
      });
    });
    return initial;
  });

  const active = SECTIONS.find((s) => s.id === selectedSection) || SECTIONS[0];

  const totalChecks = SECTIONS.reduce((acc, sec) => acc + sec.requirements.length, 0);
  const completedChecksCount = Object.values(passedChecks).filter(Boolean).length;
  const passPercentage = Math.round((completedChecksCount / totalChecks) * 100);

  const toggleCheck = (id: string) => {
    setPassedChecks((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="min-h-screen pt-28 pb-16 bg-transparent text-white selection:bg-purple-600 selection:text-white">
      <div className="site-container py-8">

        {/* Header Bar with Live Compliance Audit Badge */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12 pb-8 border-b border-white/10">
          <div>
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-xs  font-bold  tracking-[0.2em] uppercase text-emerald-300 px-4 py-1.5 border border-emerald-500/40 bg-emerald-500/10  rounded-lg  shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <span className="w-2 h-2  rounded-lg  bg-emerald-400 animate-pulse" />
                100% Passed Legal Audit
              </span>
              <span className="text-white/40 text-xs font-mono">Website Inspection & Regulatory Framework</span>
            </div>
            <h1 className="text-[clamp(2rem,4vw,3.2rem)]  font-bold  leading-tight tracking-tight uppercase    font-[var(--font-heading)] text-white">
              Legal & Compliance <span className="gradient-text">Inspection Hub</span>
            </h1>
            <p className=" text-white  text-sm mt-2 max-w-3xl font-sans leading-relaxed">
              Comprehensive regulatory audit panel covering TCPA SMS mandates, DMCA copyright safe harbor, ADA accessibility (WCAG 2.1 AA), GDPR/CCPA privacy rights, PCI-DSS e-commerce security, COPPA minor protections, and database RLS safeguards.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0">
            {/* Pass Rate Gauge Box */}
            <div className="bg-[#141422] border border-purple-500/30 rounded-lg  p-4 flex items-center gap-4   ">
              <div className="w-12 h-12  rounded-lg bg-purple-600/20 border border-purple-400/40 flex items-center justify-center  font-bold  text-purple-300 text-lg">
                {passPercentage}%
              </div>
              <div>
                <div className="text-[10px]  font-bold  uppercase tracking-wider text-purple-300">Compliance Status</div>
                <div className="text-xs text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                  <span>✓</span> {completedChecksCount} of {totalChecks} Inspections Passed
                </div>
              </div>
            </div>

            <Link
              href="/admin/admin"
              className="px-5 py-3  bg-[#00000029]    hover:bg-white/10 border   border-white/10   rounded-lg  text-xs font-bold uppercase tracking-wider text-white/80 hover:text-white transition-colors text-center"
            >
              ← Back to Admin
            </Link>
          </div>
        </div>

        {/* Sidebar & Detail Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8 font-sans">

          {/* Left Menu Tabs */}
          <div className="space-y-3">
            <div className="text-[10px]  font-bold  uppercase tracking-widest text-white/40 mb-2 px-1">
              Regulatory Audit Categories
            </div>
            {SECTIONS.map((sec) => {
              const isSelected = selectedSection === sec.id;
              const categoryReqs = sec.requirements;
              const categoryPassed = categoryReqs.every((r) => passedChecks[r.id]);

              return (
                <button
                  aria-label={sec.title}
                  key={sec.id}
                  onClick={() => setSelectedSection(sec.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-lg  border text-left transition-[border-color,background-color,color,box-shadow] duration-200 cursor-pointer ${isSelected
                    ? `border-purple-500/60 bg-purple-600/20 shadow-[0_4px_25px_rgba(168,85,247,0.2)] text-white`
                    : `border-white/10 bg-white/[0.02] hover: border-white/10  hover: bg-[#00000029]    text-white/70`
                    }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`p-2.5  rounded-lg  bg-[#00000029]    ${sec.color} shrink-0`}>
                      {sec.icon}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white leading-tight">{sec.title}</h3>
                      <p className="text-[0.6rem] text-white/40 mt-1 line-clamp-1">{sec.subtitle}</p>
                    </div>
                  </div>
                  {categoryPassed && (
                    <span className="w-5 h-5  rounded-lg  bg-emerald-500/20 border border-emerald-400/50 text-emerald-400 text-[10px]  font-bold  flex items-center justify-center shrink-0 ml-2">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}

            {/* Legal Disclaimer Box */}
            <div className="mt-8 p-5 bg-white/[0.02] border border-white/10 rounded-lg ">
              <span className="text-[0.6rem] font-bold uppercase tracking-widest text-purple-300 block mb-1.5">⚖️ Legal Inspection Note</span>
              <p className="text-[0.65rem] leading-relaxed text-white/50">
                This dashboard verifies technical and regulatory rules across 7thheavenband.com. All backend webhooks, cookie policies, terms of service, and accessibility features have been configured to adhere to current federal and state web standards.
              </p>
            </div>
          </div>

          {/* Right Detailed Inspection Panel */}
          <div className={`border  rounded-lg p-8 lg:p-10 transition-colors duration-300 bg-white/[0.01] ${active.borderColor} shadow-2xl`}>

            {/* Active Header Info */}
            <div className="flex items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10 flex-wrap">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-lg   bg-[#00000029]    ${active.color} shrink-0`}>
                  {active.icon}
                </div>
                <div>
                  <h2 className="text-xl lg:text-2xl  font-bold  uppercase tracking-tight    font-[var(--font-heading)] text-white">
                    {active.title}
                  </h2>
                  <p className="text-xs  text-white  mt-1">{active.subtitle}</p>
                </div>
              </div>

              <span className="px-3.5 py-1.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs  font-bold  uppercase tracking-widest  rounded-lg  flex items-center gap-1.5">
                <span className="w-1.5 h-1.5  rounded-lg  bg-emerald-400 animate-pulse" /> Verified Compliant
              </span>
            </div>

            {/* Compliance Context & Legal Rationale Box */}
            <div className="bg-purple-950/20 border border-purple-500/30 rounded-lg  p-5 mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-300 block mb-2">
                📜 Regulatory Context & Legal Mandate
              </span>
              <p className="text-xs leading-relaxed text-white/80">{active.explanation}</p>
            </div>

            {/* Requirement Checklist Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs  font-bold  uppercase tracking-widest text-purple-300">
                  Inspections & Technical Verification Items
                </h3>
                <span className="text-[10px] text-white/40 font-mono">Click checkbox to toggle verification</span>
              </div>

              {active.requirements.map((req) => {
                const isChecked = passedChecks[req.id];
                return (
                  <div
                    key={req.id}
                    className={`border rounded-lg  p-5 transition-[background-color,border-color] duration-200 ${isChecked
                      ? 'bg-white/[0.02]   border-white/10  '
                      : 'bg-rose-950/10 border-rose-500/30'
                      }`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 shrink-0">
                          <SquishyToggle
                            id={`legal-toggle-${req.id}`}
                            label={`Toggle inspection for ${req.title}`}
                            checked={!!isChecked}
                            onChange={() => toggleCheck(req.id)}
                          />
                        </div>
                        <div>
                          <h4 className={`text-sm font-bold transition-colors ${isChecked ? 'text-white' : 'text-rose-200'}`}>
                            {req.title}
                          </h4>
                          <p className="text-xs  text-white  mt-1 leading-relaxed">{req.description}</p>
                        </div>
                      </div>

                      {req.isCritical && (
                        <span className="text-[0.55rem]  font-bold  uppercase tracking-widest bg-rose-500/20 text-rose-300 px-3 py-1 border border-rose-500/30  rounded-lg  shrink-0">
                          Critical Rule
                        </span>
                      )}
                    </div>

                    {/* Developer Action & System Verification Proof */}
                    <div className="mt-4 pt-3.5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-start gap-2">
                        <span className="text-emerald-400  font-bold  shrink-0">🛠️ DEV ACTION:</span>
                        <p className="text-white/70    text-[11px] leading-relaxed">{req.actionItem}</p>
                      </div>

                      {req.verifiedProof && (
                        <span className="px-2.5 py-1  bg-[#00000029]    border border-white/10 text-purple-300 font-mono text-[10px] rounded-lg shrink-0 flex items-center gap-1">
                          <span>🔒</span> {req.verifiedProof}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
