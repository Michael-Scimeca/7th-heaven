"use client";

import { useEffect, useState } from "react";

interface IntegrationStatus {
  connected: boolean;
  [key: string]: any;
}

interface SetupStatus {
  supabase: IntegrationStatus;
  resend: IntegrationStatus & { fromEmail: string; isSandbox: boolean };
  twilio: IntegrationStatus & { phoneNumber: string; isTest: boolean };
  googleAnalytics: IntegrationStatus & { gaId: string };
  stripe: IntegrationStatus & { secretKeySet: boolean; publishableKeySet: boolean };
  mux: IntegrationStatus;
  livekit: IntegrationStatus & { url: string };
  shopify: IntegrationStatus & { domain: string };
  sanity: IntegrationStatus & { projectId: string };
}

export default function SetupChecklistPage() {
  const [status, setStatus] = useState<SetupStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Fetch live status of environment variables
    fetch("/api/admin/setup-status")
      .then((res) => res.json())
      .then((data) => {
        setStatus(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load status:", err);
        setLoading(false);
      });

    // Load manual checkboxes from localStorage
    const saved = localStorage.getItem("7h_setup_checklist_items");
    if (saved) {
      try {
        setCheckedItems(JSON.parse(saved));
      } catch {}
    }
  }, []);

  const handleToggle = (id: string) => {
    const updated = { ...checkedItems, [id]: !checkedItems[id] };
    setCheckedItems(updated);
    localStorage.setItem("7h_setup_checklist_items", JSON.stringify(updated));
  };

  const countConnected = () => {
    if (!status) return 0;
    let count = 0;
    if (status.supabase.connected) count++;
    if (status.resend.connected && !status.resend.isSandbox) count++;
    if (status.twilio.connected && !status.twilio.isTest) count++;
    if (status.googleAnalytics.connected) count++;
    if (status.stripe.connected) count++;
    if (status.mux.connected) count++;
    if (status.livekit.connected) count++;
    if (status.shopify.connected) count++;
    if (status.sanity.connected) count++;
    return count;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050508] text-white flex items-center justify-center pt-[72px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold uppercase tracking-widest text-white/40">Loading status dashboard...</p>
        </div>
      </div>
    );
  }

  const activeConnected = countConnected();

  return (
    <div className="min-h-screen bg-[#050508] text-white pt-[72px] pb-16">
      <div className="site-container max-w-6xl mx-auto px-4 mt-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-6 border-b border-white/5">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white mb-2" id="checklist-heading">
              ⚙️ Integration Setup Checklist
            </h1>
            <p className="text-sm text-white/40 max-w-2xl leading-relaxed">
              Use this dashboard to track which third-party APIs and environment variables are connected. Ensure all sandbox items are promoted to production configurations before launching the site live.
            </p>
          </div>
          
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl px-6 py-4 flex items-center gap-4 shrink-0 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
            <div className="text-right">
              <span className="text-2xs font-bold uppercase tracking-widest text-white/30 block mb-1">Production Status</span>
              <span className="text-lg font-black text-white">{activeConnected} / 9 Services Live</span>
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-white/5 flex items-center justify-center relative">
              <div 
                className="absolute inset-0 rounded-full border-4 border-t-[var(--color-accent)] border-r-[var(--color-accent)] animate-pulse" 
                style={{ transform: `rotate(${(activeConnected / 9) * 360}deg)` }}
              />
              <span className="text-xs font-black">{Math.round((activeConnected / 9) * 100)}%</span>
            </div>
          </div>
        </div>

        {/* Integration Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="checklist-grid">

          {/* 1. EMAIL (Resend) */}
          <div className="bg-[#08080c] border border-white/5 rounded-2xl p-6 hover:border-[var(--color-accent)]/30 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">📧 Resend Email</h3>
                  <p className="text-2xs text-white/30 font-bold uppercase tracking-widest">Resends OTP PINs, confirmations & alerts</p>
                </div>
                {status?.resend.connected ? (
                  status.resend.isSandbox ? (
                    <span className="px-2.5 py-1 text-2xs font-bold uppercase tracking-wider rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      🟡 Sandbox
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 text-2xs font-bold uppercase tracking-wider rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      🟢 Live
                    </span>
                  )
                ) : (
                  <span className="px-2.5 py-1 text-2xs font-bold uppercase tracking-wider rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    🔴 Disconnected
                  </span>
                )}
              </div>

              <p className="text-xs text-white/50 leading-relaxed mb-6">
                Sends OTP login verification codes, welcome letters, and coordinator booking alerts. Without domain verification, emails are restricted to verified testing accounts.
              </p>

              {/* Tasks */}
              <div className="space-y-3 mb-6">
                <label className="flex items-start gap-3 cursor-pointer group text-xs text-white/70 hover:text-white">
                  <input type="checkbox" checked={!!checkedItems.resend_domain} onChange={() => handleToggle("resend_domain")} className="mt-0.5 rounded accent-[var(--color-accent)] cursor-pointer" />
                  <span className={checkedItems.resend_domain ? "line-through text-white/30" : ""}>
                    Add and verify your domain in the Resend Dashboard (Domains section)
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group text-xs text-white/70 hover:text-white">
                  <input type="checkbox" checked={!!checkedItems.resend_env} onChange={() => handleToggle("resend_env")} className="mt-0.5 rounded accent-[var(--color-accent)] cursor-pointer" />
                  <span className={checkedItems.resend_env ? "line-through text-white/30" : ""}>
                    Add `RESEND_FROM_EMAIL=noreply@yourdomain.com` in `.env.local`
                  </span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5">
              <span className="text-3xs uppercase tracking-wider font-bold text-white/20 block mb-1">Active config key</span>
              <code className="text-xs font-mono text-[var(--color-accent)]/80 block break-all">
                RESEND_API_KEY, RESEND_FROM_EMAIL
              </code>
            </div>
          </div>

          {/* 2. TEXT (Twilio) */}
          <div className="bg-[#08080c] border border-white/5 rounded-2xl p-6 hover:border-[var(--color-accent)]/30 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">💬 Twilio SMS</h3>
                  <p className="text-2xs text-white/30 font-bold uppercase tracking-widest">Sends automated show alerts & auto-blasts</p>
                </div>
                {status?.twilio.connected ? (
                  status.twilio.isTest ? (
                    <span className="px-2.5 py-1 text-2xs font-bold uppercase tracking-wider rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      🟡 Test Credentials
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 text-2xs font-bold uppercase tracking-wider rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      🟢 Connected
                    </span>
                  )
                ) : (
                  <span className="px-2.5 py-1 text-2xs font-bold uppercase tracking-wider rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    🔴 Disconnected
                  </span>
                )}
              </div>

              <p className="text-xs text-white/50 leading-relaxed mb-6">
                Powers the geographical show proximity notifier. Sends text messages to fans within a radius of newly booked shows.
              </p>

              {/* Tasks */}
              <div className="space-y-3 mb-6">
                <label className="flex items-start gap-3 cursor-pointer group text-xs text-white/70 hover:text-white">
                  <input type="checkbox" checked={!!checkedItems.twilio_upgrade} onChange={() => handleToggle("twilio_upgrade")} className="mt-0.5 rounded accent-[var(--color-accent)] cursor-pointer" />
                  <span className={checkedItems.twilio_upgrade ? "line-through text-white/30" : ""}>
                    Upgrade Twilio account from trial to active status (remove trial banners)
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group text-xs text-white/70 hover:text-white">
                  <input type="checkbox" checked={!!checkedItems.twilio_prod_keys} onChange={() => handleToggle("twilio_prod_keys")} className="mt-0.5 rounded accent-[var(--color-accent)] cursor-pointer" />
                  <span className={checkedItems.twilio_prod_keys ? "line-through text-white/30" : ""}>
                    Replace Test SID/Token with Production keys in `.env.local`
                  </span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5">
              <span className="text-3xs uppercase tracking-wider font-bold text-white/20 block mb-1">Active config key</span>
              <code className="text-xs font-mono text-[var(--color-accent)]/80 block break-all">
                TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
              </code>
            </div>
          </div>

          {/* 3. GOOGLE ANALYTICS */}
          <div className="bg-[#08080c] border border-white/5 rounded-2xl p-6 hover:border-[var(--color-accent)]/30 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">📈 Google Analytics</h3>
                  <p className="text-2xs text-white/30 font-bold uppercase tracking-widest">Logs user traffic & engagement metrics</p>
                </div>
                {status?.googleAnalytics.connected ? (
                  <span className="px-2.5 py-1 text-2xs font-bold uppercase tracking-wider rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    🟢 Connected
                  </span>
                ) : (
                  <span className="px-2.5 py-1 text-2xs font-bold uppercase tracking-wider rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    🔴 Disconnected
                  </span>
                )}
              </div>

              <p className="text-xs text-white/50 leading-relaxed mb-6">
                Tracks site traffic, fan dashboard registrations, and ticket link click rates using Google Analytics 4.
              </p>

              {/* Tasks */}
              <div className="space-y-3 mb-6">
                <label className="flex items-start gap-3 cursor-pointer group text-xs text-white/70 hover:text-white">
                  <input type="checkbox" checked={!!checkedItems.ga_id} onChange={() => handleToggle("ga_id")} className="mt-0.5 rounded accent-[var(--color-accent)] cursor-pointer" />
                  <span className={checkedItems.ga_id ? "line-through text-white/30" : ""}>
                    Provide your Measurement ID (looks like `G-XXXXXXXXXX`) in your Google Analytics dashboard
                  </span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5">
              <span className="text-3xs uppercase tracking-wider font-bold text-white/20 block mb-1">Active config key</span>
              <code className="text-xs font-mono text-[var(--color-accent)]/80 block break-all">
                NEXT_PUBLIC_GA_ID
              </code>
            </div>
          </div>

          {/* 4. STRIPE */}
          <div className="bg-[#08080c] border border-white/5 rounded-2xl p-6 hover:border-[var(--color-accent)]/30 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">💳 Stripe Payments</h3>
                  <p className="text-2xs text-white/30 font-bold uppercase tracking-widest">Handles ticket booking deposits & checkouts</p>
                </div>
                {status?.stripe.connected ? (
                  <span className="px-2.5 py-1 text-2xs font-bold uppercase tracking-wider rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    🟢 Connected
                  </span>
                ) : (
                  <span className="px-2.5 py-1 text-2xs font-bold uppercase tracking-wider rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    🔴 Disconnected
                  </span>
                )}
              </div>

              <p className="text-xs text-white/50 leading-relaxed mb-6">
                Required for processing client deposits when booking the band, purchasing tickets, or selling VIP merchandise drops directly.
              </p>

              {/* Tasks */}
              <div className="space-y-3 mb-6">
                <label className="flex items-start gap-3 cursor-pointer group text-xs text-white/70 hover:text-white">
                  <input type="checkbox" checked={!!checkedItems.stripe_keys} onChange={() => handleToggle("stripe_keys")} className="mt-0.5 rounded accent-[var(--color-accent)] cursor-pointer" />
                  <span className={checkedItems.stripe_keys ? "line-through text-white/30" : ""}>
                    Provide your keys: uncomment and add `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in `.env.local`
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group text-xs text-white/70 hover:text-white">
                  <input type="checkbox" checked={!!checkedItems.stripe_webhooks} onChange={() => handleToggle("stripe_webhooks")} className="mt-0.5 rounded accent-[var(--color-accent)] cursor-pointer" />
                  <span className={checkedItems.stripe_webhooks ? "line-through text-white/30" : ""}>
                    Configure Stripe Webhook Listener URL on your server & add `STRIPE_WEBHOOK_SECRET`
                  </span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5">
              <span className="text-3xs uppercase tracking-wider font-bold text-white/20 block mb-1">Active config key</span>
              <code className="text-xs font-mono text-[var(--color-accent)]/80 block break-all">
                STRIPE_SECRET_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET
              </code>
            </div>
          </div>

          {/* 5. LIVEKIT & MUX STREAMING */}
          <div className="bg-[#08080c] border border-white/5 rounded-2xl p-6 hover:border-[var(--color-accent)]/30 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">🎥 Streaming (LiveKit + Mux)</h3>
                  <p className="text-2xs text-white/30 font-bold uppercase tracking-widest">Powers backstage feeds & stream archives</p>
                </div>
                {status?.livekit.connected && status?.mux.connected ? (
                  <span className="px-2.5 py-1 text-2xs font-bold uppercase tracking-wider rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    🟢 Live & Connected
                  </span>
                ) : (
                  <span className="px-2.5 py-1 text-2xs font-bold uppercase tracking-wider rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    🔴 Keys Missing
                  </span>
                )}
              </div>

              <p className="text-xs text-white/50 leading-relaxed mb-6">
                LiveKit manages low-latency real-time video/audio feeds from crew members. Mux is utilized for archiving streams and rendering high-fidelity video playbacks.
              </p>

              {/* Tasks */}
              <div className="space-y-3 mb-6">
                <label className="flex items-start gap-3 cursor-pointer group text-xs text-white/70 hover:text-white">
                  <input type="checkbox" checked={!!checkedItems.livekit_env} onChange={() => handleToggle("livekit_env")} className="mt-0.5 rounded accent-[var(--color-accent)] cursor-pointer" />
                  <span className={checkedItems.livekit_env ? "line-through text-white/30" : ""}>
                    Provide your LiveKit Cloud tokens (`LIVEKIT_API_KEY` and `LIVEKIT_API_SECRET`)
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group text-xs text-white/70 hover:text-white">
                  <input type="checkbox" checked={!!checkedItems.mux_env} onChange={() => handleToggle("mux_env")} className="mt-0.5 rounded accent-[var(--color-accent)] cursor-pointer" />
                  <span className={checkedItems.mux_env ? "line-through text-white/30" : ""}>
                    Provide Mux API secret and token keys in `.env.local`
                  </span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5">
              <span className="text-3xs uppercase tracking-wider font-bold text-white/20 block mb-1">Active config key</span>
              <code className="text-xs font-mono text-[var(--color-accent)]/80 block break-all text-ellipsis overflow-hidden">
                LIVEKIT_API_KEY, MUX_TOKEN_ID
              </code>
            </div>
          </div>

          {/* 6. SHOPIFY STOREFRONT */}
          <div className="bg-[#08080c] border border-white/5 rounded-2xl p-6 hover:border-[var(--color-accent)]/30 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">🛍️ Shopify Commerce</h3>
                  <p className="text-2xs text-white/30 font-bold uppercase tracking-widest">Syncs band merch products & inventory</p>
                </div>
                {status?.shopify.connected ? (
                  <span className="px-2.5 py-1 text-2xs font-bold uppercase tracking-wider rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    🟢 Connected
                  </span>
                ) : (
                  <span className="px-2.5 py-1 text-2xs font-bold uppercase tracking-wider rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    🔴 Disconnected
                  </span>
                )}
              </div>

              <p className="text-xs text-white/50 leading-relaxed mb-6">
                Integrates headlessly with your Shopify Store. Pulls albums, posters, and shirts, and syncs cart details.
              </p>

              {/* Tasks */}
              <div className="space-y-3 mb-6">
                <label className="flex items-start gap-3 cursor-pointer group text-xs text-white/70 hover:text-white">
                  <input type="checkbox" checked={!!checkedItems.shopify_domain} onChange={() => handleToggle("shopify_domain")} className="mt-0.5 rounded accent-[var(--color-accent)] cursor-pointer" />
                  <span className={checkedItems.shopify_domain ? "line-through text-white/30" : ""}>
                    Ensure your custom Shopify storefront domain is correct in `.env.local`
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group text-xs text-white/70 hover:text-white">
                  <input type="checkbox" checked={!!checkedItems.shopify_token} onChange={() => handleToggle("shopify_token")} className="mt-0.5 rounded accent-[var(--color-accent)] cursor-pointer" />
                  <span className={checkedItems.shopify_token ? "line-through text-white/30" : ""}>
                    Generate a Storefront Access Token inside Shopify App Settings
                  </span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5">
              <span className="text-3xs uppercase tracking-wider font-bold text-white/20 block mb-1">Active config key</span>
              <code className="text-xs font-mono text-[var(--color-accent)]/80 block break-all">
                NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN, NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN
              </code>
            </div>
          </div>

          {/* 7. SUPABASE DATABASE */}
          <div className="bg-[#08080c] border border-white/5 rounded-2xl p-6 hover:border-[var(--color-accent)]/30 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">🗄️ Supabase Database</h3>
                  <p className="text-2xs text-white/30 font-bold uppercase tracking-widest">Manages fan accounts, bookings, and notes</p>
                </div>
                {status?.supabase.connected ? (
                  <span className="px-2.5 py-1 text-2xs font-bold uppercase tracking-wider rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    🟢 Connected
                  </span>
                ) : (
                  <span className="px-2.5 py-1 text-2xs font-bold uppercase tracking-wider rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    🔴 Disconnected
                  </span>
                )}
              </div>

              <p className="text-xs text-white/50 leading-relaxed mb-6">
                Stores band content, feedback, live chat rooms, and fan profile details. Ensure table schemas and access policies are secure in production.
              </p>

              {/* Tasks */}
              <div className="space-y-3 mb-6">
                <label className="flex items-start gap-3 cursor-pointer group text-xs text-white/70 hover:text-white">
                  <input type="checkbox" checked={!!checkedItems.supabase_rls} onChange={() => handleToggle("supabase_rls")} className="mt-0.5 rounded accent-[var(--color-accent)] cursor-pointer" />
                  <span className={checkedItems.supabase_rls ? "line-through text-white/30" : ""}>
                    Verify Row Level Security (RLS) policies on critical tables (e.g. `client_notes`, `bookings`)
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group text-xs text-white/70 hover:text-white">
                  <input type="checkbox" checked={!!checkedItems.supabase_setup_db} onChange={() => handleToggle("supabase_setup_db")} className="mt-0.5 rounded accent-[var(--color-accent)] cursor-pointer" />
                  <span className={checkedItems.supabase_setup_db ? "line-through text-white/30" : ""}>
                    Run the database setup script to initialize the schemas `/api/setup-db`
                  </span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5">
              <span className="text-3xs uppercase tracking-wider font-bold text-white/20 block mb-1">Active config key</span>
              <code className="text-xs font-mono text-[var(--color-accent)]/80 block break-all">
                NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
              </code>
            </div>
          </div>

          {/* 8. SANITY CMS */}
          <div className="bg-[#08080c] border border-white/5 rounded-2xl p-6 hover:border-[var(--color-accent)]/30 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">❄️ Sanity Content Studio</h3>
                  <p className="text-2xs text-white/30 font-bold uppercase tracking-widest">Powers website news, bios, and tour dates</p>
                </div>
                {status?.sanity.connected ? (
                  <span className="px-2.5 py-1 text-2xs font-bold uppercase tracking-wider rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    🟢 Connected
                  </span>
                ) : (
                  <span className="px-2.5 py-1 text-2xs font-bold uppercase tracking-wider rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    🔴 Disconnected
                  </span>
                )}
              </div>

              <p className="text-xs text-white/50 leading-relaxed mb-6">
                Connects Next.js with Sanity CMS to manage band members, biography texts, albums, and tour schedules.
              </p>

              {/* Tasks */}
              <div className="space-y-3 mb-6">
                <label className="flex items-start gap-3 cursor-pointer group text-xs text-white/70 hover:text-white">
                  <input type="checkbox" checked={!!checkedItems.sanity_api_token} onChange={() => handleToggle("sanity_api_token")} className="mt-0.5 rounded accent-[var(--color-accent)] cursor-pointer" />
                  <span className={checkedItems.sanity_api_token ? "line-through text-white/30" : ""}>
                    Provide the read/write Sanity token (`SANITY_API_TOKEN`) in `.env.local`
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group text-xs text-white/70 hover:text-white">
                  <input type="checkbox" checked={!!checkedItems.sanity_webhook} onChange={() => handleToggle("sanity_webhook")} className="mt-0.5 rounded accent-[var(--color-accent)] cursor-pointer" />
                  <span className={checkedItems.sanity_webhook ? "line-through text-white/30" : ""}>
                    Configure dynamic Sanity content revalidation hooks in your deployment settings
                  </span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5">
              <span className="text-3xs uppercase tracking-wider font-bold text-white/20 block mb-1">Active config key</span>
              <code className="text-xs font-mono text-[var(--color-accent)]/80 block break-all">
                NEXT_PUBLIC_SANITY_PROJECT_ID, SANITY_API_TOKEN
              </code>
            </div>
          </div>

        </div>

        {/* Global instructions card */}
        <div className="bg-gradient-to-br from-[#0a0a14] to-[#050508] border border-white/5 rounded-3xl p-8 mt-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[var(--color-accent)]/5 rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-xl font-bold text-white mb-3">📍 Environment Variables Setup</h2>
          <p className="text-sm text-white/50 mb-6 leading-relaxed">
            All integrations are managed through environment variables inside your root file: <code className="font-mono text-white">.env.local</code>. Make sure to restart your local development server in the terminal after editing this file to apply changes:
          </p>
          <pre className="bg-[#030305] p-5 rounded-2xl text-xs font-mono border border-white/5 overflow-x-auto text-white/40 leading-relaxed">
{`# Sample setup format inside your .env.local:
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsIn...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...

# Resend Mail Domain Setup
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=noreply@michaelscimeca.com

# Twilio SMS
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx`}
          </pre>
        </div>

      </div>
    </div>
  );
}
