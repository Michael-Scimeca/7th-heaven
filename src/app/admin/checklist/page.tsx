"use client";

import { useEffect, useState, useCallback } from "react";

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

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/setup-status");
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (err) {
      console.error("Failed to load status:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();

    // Load manual checkboxes from localStorage
    const saved = localStorage.getItem("7h_setup_checklist_items_v1") || localStorage.getItem("7h_setup_checklist_items");
    if (saved) {
      try {
        setCheckedItems(JSON.parse(saved));
      } catch { }
    }
  }, [fetchStatus]);

  const handleToggle = (id: string) => {
    const updated = { ...checkedItems, [id]: !checkedItems[id] };
    setCheckedItems(updated);
    localStorage.setItem("7h_setup_checklist_items_v1", JSON.stringify(updated));
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
      <div className="min-h-screen bg-[#f0f2f5] text-black flex items-center justify-center pt-[72px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold uppercase tracking-widest text-black/40">Loading status dashboard...</p>
        </div>
      </div>
    );
  }

  const activeConnected = countConnected();

  return (
    <div className="min-h-screen bg-[#f0f2f5] text-black pt-[72px] pb-16">
      <div className="site-container max-w-6xl mx-auto px-4 mt-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-6 border-b border-black/5">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-black mb-2" id="checklist-heading">
              ⚙️ Integration Setup Checklist
            </h1>
            <p className="text-sm text-black/40 max-w-2xl leading-relaxed">
              Use this dashboard to track which third-party APIs and environment variables are connected. Ensure all sandbox items are promoted to production configurations before launching the site live.
            </p>
          </div>

          <div className="bg-white border border-black/5 px-6 py-4 flex items-center gap-4 shrink-0 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
            <div className="text-right">
              <span className="text-[var(--font-size-2xs)] font-bold uppercase tracking-widest text-black/30 block mb-1">Production Status</span>
              <span className="text-lg font-black text-black">{activeConnected} / 9 Services Live</span>
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
          <div className="bg-white border border-black/5 p-6 hover:border-[var(--color-accent)]/30 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-black mb-1">📧 Resend Email</h3>
                  <p className="text-[var(--font-size-2xs)] text-black/30 font-bold uppercase tracking-widest">Resends OTP PINs, confirmations & alerts</p>
                </div>
                {status?.resend.connected ? (
                  status.resend.isSandbox ? (
                    <span className="px-2.5 py-1 text-[var(--font-size-2xs)] font-bold uppercase tracking-wider rounded-full bg-purple-600/10 text-purple-300 border border-purple-500/20">
                      🟡 Sandbox
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 text-[var(--font-size-2xs)] font-bold uppercase tracking-wider rounded-full bg-emerald-500/10 text-[var(--color-accent)] border  border-[var(--color-accent)]/30">
                      🟢 Live
                    </span>
                  )
                ) : (
                  <span className="px-2.5 py-1 text-[var(--font-size-2xs)] font-bold uppercase tracking-wider rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    🔴 Disconnected
                  </span>
                )}
              </div>

              <p className="text-xs text-black/50 leading-relaxed mb-6">
                Sends OTP login verification codes, welcome letters, and coordinator booking alerts. Without domain verification, emails are restricted to verified testing accounts.
              </p>

              {/* Tasks */}
              <div className="space-y-3 mb-6">
                <label className="flex items-start gap-3 cursor-pointer group text-xs text-black/60 hover:text-black">
                  <input type="checkbox" checked={!!checkedItems.resend_domain} onChange={() => handleToggle("resend_domain")} className="mt-0.5 rounded accent-[var(--color-accent)] cursor-pointer" />
                  <span className={checkedItems.resend_domain ? "line-through text-black/30" : ""}>
                    Add and verify your domain in the Resend Dashboard (Domains section)
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group text-xs text-black/60 hover:text-black">
                  <input type="checkbox" checked={!!checkedItems.resend_env} onChange={() => handleToggle("resend_env")} className="mt-0.5 rounded accent-[var(--color-accent)] cursor-pointer" />
                  <span className={checkedItems.resend_env ? "line-through text-black/30" : ""}>
                    Add `RESEND_FROM_EMAIL=noreply@yourdomain.com` in `.env.local`
                  </span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-black/5">
              <span className="text-3xs uppercase tracking-wider font-bold text-black/20 block mb-1">Active config key</span>
              <code className="text-xs font-mono  text-[var(--color-accent)]/80 block break-all">
                RESEND_API_KEY, RESEND_FROM_EMAIL
              </code>
            </div>
          </div>

          {/* 2. TEXT (Twilio) */}
          <div className="bg-white border border-black/5 p-6 hover:border-[var(--color-accent)]/30 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-black mb-1">💬 Twilio SMS</h3>
                  <p className="text-[var(--font-size-2xs)] text-black/30 font-bold uppercase tracking-widest">Sends automated show alerts & auto-blasts</p>
                </div>
                {status?.twilio.connected ? (
                  status.twilio.isTest ? (
                    <span className="px-2.5 py-1 text-[var(--font-size-2xs)] font-bold uppercase tracking-wider rounded-full bg-purple-600/10 text-purple-300 border border-purple-500/20">
                      🟡 Test Credentials
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 text-[var(--font-size-2xs)] font-bold uppercase tracking-wider rounded-full bg-emerald-500/10 text-[var(--color-accent)] border  border-[var(--color-accent)]/30">
                      🟢 Connected
                    </span>
                  )
                ) : (
                  <span className="px-2.5 py-1 text-[var(--font-size-2xs)] font-bold uppercase tracking-wider rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    🔴 Disconnected
                  </span>
                )}
              </div>

              <p className="text-xs text-black/50 leading-relaxed mb-6">
                Powers the geographical show proximity notifier. Sends text messages to fans within a radius of newly booked shows.
              </p>

              {/* Tasks */}
              <div className="space-y-3 mb-6">
                <label className="flex items-start gap-3 cursor-pointer group text-xs text-black/60 hover:text-black">
                  <input type="checkbox" checked={!!checkedItems.twilio_upgrade} onChange={() => handleToggle("twilio_upgrade")} className="mt-0.5 rounded accent-[var(--color-accent)] cursor-pointer" />
                  <span className={checkedItems.twilio_upgrade ? "line-through text-black/30" : ""}>
                    Upgrade Twilio account from trial to active status (remove trial banners)
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group text-xs text-black/60 hover:text-black">
                  <input type="checkbox" checked={!!checkedItems.twilio_prod_keys} onChange={() => handleToggle("twilio_prod_keys")} className="mt-0.5 rounded accent-[var(--color-accent)] cursor-pointer" />
                  <span className={checkedItems.twilio_prod_keys ? "line-through text-black/30" : ""}>
                    Replace Test SID/Token with Production keys in `.env.local`
                  </span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-black/5">
              <span className="text-3xs uppercase tracking-wider font-bold text-black/20 block mb-1">Active config key</span>
              <code className="text-xs font-mono  text-[var(--color-accent)]/80 block break-all">
                TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
              </code>
            </div>
          </div>

          {/* 3. GOOGLE ANALYTICS */}
          <div className="bg-white border border-black/5 p-6 hover:border-[var(--color-accent)]/30 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-black mb-1">📈 Google Analytics</h3>
                  <p className="text-[var(--font-size-2xs)] text-black/30 font-bold uppercase tracking-widest">Logs user traffic & engagement metrics</p>
                </div>
                {status?.googleAnalytics.connected ? (
                  <span className="px-2.5 py-1 text-[var(--font-size-2xs)] font-bold uppercase tracking-wider rounded-full bg-emerald-500/10 text-[var(--color-accent)] border  border-[var(--color-accent)]/30">
                    🟢 Connected
                  </span>
                ) : (
                  <span className="px-2.5 py-1 text-[var(--font-size-2xs)] font-bold uppercase tracking-wider rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    🔴 Disconnected
                  </span>
                )}
              </div>

              <p className="text-xs text-black/50 leading-relaxed mb-6">
                Tracks site traffic, fan dashboard registrations, and ticket link click rates using Google Analytics 4.
              </p>

              {/* Tasks */}
              <div className="space-y-3 mb-6">
                <label className="flex items-start gap-3 cursor-pointer group text-xs text-black/60 hover:text-black">
                  <input type="checkbox" checked={!!checkedItems.ga_id} onChange={() => handleToggle("ga_id")} className="mt-0.5 rounded accent-[var(--color-accent)] cursor-pointer" />
                  <span className={checkedItems.ga_id ? "line-through text-black/30" : ""}>
                    Provide your Measurement ID (looks like `G-XXXXXXXXXX`) in your Google Analytics dashboard
                  </span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-black/5">
              <span className="text-3xs uppercase tracking-wider font-bold text-black/20 block mb-1">Active config key</span>
              <code className="text-xs font-mono  text-[var(--color-accent)]/80 block break-all">
                NEXT_PUBLIC_GA_ID
              </code>
            </div>
          </div>

          {/* 4. STRIPE */}
          <div className="bg-white border border-black/5 p-6 hover:border-[var(--color-accent)]/30 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-black mb-1">💳 Stripe Payments</h3>
                  <p className="text-[var(--font-size-2xs)] text-black/30 font-bold uppercase tracking-widest">Handles ticket booking deposits & checkouts</p>
                </div>
                {status?.stripe.connected ? (
                  <span className="px-2.5 py-1 text-[var(--font-size-2xs)] font-bold uppercase tracking-wider rounded-full bg-emerald-500/10 text-[var(--color-accent)] border  border-[var(--color-accent)]/30">
                    🟢 Connected
                  </span>
                ) : (
                  <span className="px-2.5 py-1 text-[var(--font-size-2xs)] font-bold uppercase tracking-wider rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    🔴 Disconnected
                  </span>
                )}
              </div>

              <p className="text-xs text-black/50 leading-relaxed mb-6">
                Required for processing client deposits when booking the band, purchasing tickets, or selling VIP merchandise drops directly.
              </p>

              {/* Tasks */}
              <div className="space-y-3 mb-6">
                <label className="flex items-start gap-3 cursor-pointer group text-xs text-black/60 hover:text-black">
                  <input type="checkbox" checked={!!checkedItems.stripe_keys} onChange={() => handleToggle("stripe_keys")} className="mt-0.5 rounded accent-[var(--color-accent)] cursor-pointer" />
                  <span className={checkedItems.stripe_keys ? "line-through text-black/30" : ""}>
                    Provide your keys: uncomment and add `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in `.env.local`
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group text-xs text-black/60 hover:text-black">
                  <input type="checkbox" checked={!!checkedItems.stripe_webhooks} onChange={() => handleToggle("stripe_webhooks")} className="mt-0.5 rounded accent-[var(--color-accent)] cursor-pointer" />
                  <span className={checkedItems.stripe_webhooks ? "line-through text-black/30" : ""}>
                    Configure Stripe Webhook Listener URL on your server & add `STRIPE_WEBHOOK_SECRET`
                  </span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-black/5">
              <span className="text-3xs uppercase tracking-wider font-bold text-black/20 block mb-1">Active config key</span>
              <code className="text-xs font-mono  text-[var(--color-accent)]/80 block break-all">
                STRIPE_SECRET_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET
              </code>
            </div>
          </div>

          {/* 5. LIVEKIT & MUX STREAMING */}
          <div className="bg-white border border-black/5 p-6 hover:border-[var(--color-accent)]/30 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-black mb-1">🎥 Streaming (LiveKit + Mux)</h3>
                  <p className="text-[var(--font-size-2xs)] text-black/30 font-bold uppercase tracking-widest">Powers backstage feeds & stream archives</p>
                </div>
                {status?.livekit.connected && status?.mux.connected ? (
                  <span className="px-2.5 py-1 text-[var(--font-size-2xs)] font-bold uppercase tracking-wider rounded-full bg-emerald-500/10 text-[var(--color-accent)] border  border-[var(--color-accent)]/30">
                    🟢 Live & Connected
                  </span>
                ) : (
                  <span className="px-2.5 py-1 text-[var(--font-size-2xs)] font-bold uppercase tracking-wider rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    🔴 Keys Missing
                  </span>
                )}
              </div>

              <p className="text-xs text-black/50 leading-relaxed mb-6">
                LiveKit manages low-latency real-time video/audio feeds from crew members. Mux is utilized for archiving streams and rendering high-fidelity video playbacks.
              </p>

              {/* Tasks */}
              <div className="space-y-3 mb-6">
                <label className="flex items-start gap-3 cursor-pointer group text-xs text-black/60 hover:text-black">
                  <input type="checkbox" checked={!!checkedItems.livekit_env} onChange={() => handleToggle("livekit_env")} className="mt-0.5 rounded accent-[var(--color-accent)] cursor-pointer" />
                  <span className={checkedItems.livekit_env ? "line-through text-black/30" : ""}>
                    Provide your LiveKit Cloud tokens (`LIVEKIT_API_KEY` and `LIVEKIT_API_SECRET`)
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group text-xs text-black/60 hover:text-black">
                  <input type="checkbox" checked={!!checkedItems.mux_env} onChange={() => handleToggle("mux_env")} className="mt-0.5 rounded accent-[var(--color-accent)] cursor-pointer" />
                  <span className={checkedItems.mux_env ? "line-through text-black/30" : ""}>
                    Provide Mux API secret and token keys in `.env.local`
                  </span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-black/5">
              <span className="text-3xs uppercase tracking-wider font-bold text-black/20 block mb-1">Active config key</span>
              <code className="text-xs font-mono  text-[var(--color-accent)]/80 block break-all text-ellipsis overflow-hidden">
                LIVEKIT_API_KEY, MUX_TOKEN_ID
              </code>
            </div>
          </div>

          {/* 6. SHOPIFY STOREFRONT */}
          <div className="bg-white border border-black/5 p-6 hover:border-[var(--color-accent)]/30 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-black mb-1">🛍️ Shopify Commerce</h3>
                  <p className="text-[var(--font-size-2xs)] text-black/30 font-bold uppercase tracking-widest">Syncs band merch products & inventory</p>
                </div>
                {status?.shopify.connected ? (
                  <span className="px-2.5 py-1 text-[var(--font-size-2xs)] font-bold uppercase tracking-wider rounded-full bg-emerald-500/10 text-[var(--color-accent)] border  border-[var(--color-accent)]/30">
                    🟢 Connected
                  </span>
                ) : (
                  <span className="px-2.5 py-1 text-[var(--font-size-2xs)] font-bold uppercase tracking-wider rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    🔴 Disconnected
                  </span>
                )}
              </div>

              <p className="text-xs text-black/50 leading-relaxed mb-6">
                Integrates headlessly with your Shopify Store. Pulls albums, posters, and shirts, and syncs cart details.
              </p>

              {/* Tasks */}
              <div className="space-y-3 mb-6">
                <label className="flex items-start gap-3 cursor-pointer group text-xs text-black/60 hover:text-black">
                  <input type="checkbox" checked={!!checkedItems.shopify_domain} onChange={() => handleToggle("shopify_domain")} className="mt-0.5 rounded accent-[var(--color-accent)] cursor-pointer" />
                  <span className={checkedItems.shopify_domain ? "line-through text-black/30" : ""}>
                    Ensure your custom Shopify storefront domain is correct in `.env.local`
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group text-xs text-black/60 hover:text-black">
                  <input type="checkbox" checked={!!checkedItems.shopify_token} onChange={() => handleToggle("shopify_token")} className="mt-0.5 rounded accent-[var(--color-accent)] cursor-pointer" />
                  <span className={checkedItems.shopify_token ? "line-through text-black/30" : ""}>
                    Generate a Storefront Access Token inside Shopify App Settings
                  </span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-black/5">
              <span className="text-3xs uppercase tracking-wider font-bold text-black/20 block mb-1">Active config key</span>
              <code className="text-xs font-mono  text-[var(--color-accent)]/80 block break-all">
                NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN, {'NEXT_PUBLIC_SHOPIFY_STOREFRONT_' + 'ACCESS_TOKEN'}
              </code>
            </div>
          </div>

          {/* 7. SUPABASE DATABASE */}
          <div className="bg-white border border-black/5 p-6 hover:border-[var(--color-accent)]/30 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-black mb-1">🗄️ Supabase Database</h3>
                  <p className="text-[var(--font-size-2xs)] text-black/30 font-bold uppercase tracking-widest">Manages fan accounts, bookings, and notes</p>
                </div>
                {status?.supabase.connected ? (
                  <span className="px-2.5 py-1 text-[var(--font-size-2xs)] font-bold uppercase tracking-wider rounded-full bg-emerald-500/10 text-[var(--color-accent)] border  border-[var(--color-accent)]/30">
                    🟢 Connected
                  </span>
                ) : (
                  <span className="px-2.5 py-1 text-[var(--font-size-2xs)] font-bold uppercase tracking-wider rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    🔴 Disconnected
                  </span>
                )}
              </div>

              <p className="text-xs text-black/50 leading-relaxed mb-6">
                Stores band content, feedback, live chat rooms, and fan profile details. Ensure table schemas and access policies are secure in production.
              </p>

              {/* Tasks */}
              <div className="space-y-3 mb-6">
                <label className="flex items-start gap-3 cursor-pointer group text-xs text-black/60 hover:text-black">
                  <input type="checkbox" checked={!!checkedItems.supabase_rls} onChange={() => handleToggle("supabase_rls")} className="mt-0.5 rounded accent-[var(--color-accent)] cursor-pointer" />
                  <span className={checkedItems.supabase_rls ? "line-through text-black/30" : ""}>
                    Verify Row Level Security (RLS) policies on critical tables (e.g. `client_notes`, `bookings`)
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group text-xs text-black/60 hover:text-black">
                  <input type="checkbox" checked={!!checkedItems.supabase_setup_db} onChange={() => handleToggle("supabase_setup_db")} className="mt-0.5 rounded accent-[var(--color-accent)] cursor-pointer" />
                  <span className={checkedItems.supabase_setup_db ? "line-through text-black/30" : ""}>
                    Run the database setup script to initialize the schemas `/api/setup-db`
                  </span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-black/5">
              <span className="text-3xs uppercase tracking-wider font-bold text-black/20 block mb-1">Active config key</span>
              <code className="text-xs font-mono  text-[var(--color-accent)]/80 block break-all">
                NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
              </code>
            </div>
          </div>

          {/* 8. SANITY CMS */}
          <div className="bg-white border border-black/5 p-6 hover:border-[var(--color-accent)]/30 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-black mb-1">❄️ Sanity Content Studio</h3>
                  <p className="text-[var(--font-size-2xs)] text-black/30 font-bold uppercase tracking-widest">Powers website news, bios, and tour dates</p>
                </div>
                {status?.sanity.connected ? (
                  <span className="px-2.5 py-1 text-[var(--font-size-2xs)] font-bold uppercase tracking-wider rounded-full bg-emerald-500/10 text-[var(--color-accent)] border  border-[var(--color-accent)]/30">
                    🟢 Connected
                  </span>
                ) : (
                  <span className="px-2.5 py-1 text-[var(--font-size-2xs)] font-bold uppercase tracking-wider rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    🔴 Disconnected
                  </span>
                )}
              </div>

              <p className="text-xs text-black/50 leading-relaxed mb-6">
                Connects Next.js with Sanity CMS to manage band members, biography texts, albums, and tour schedules.
              </p>

              {/* Tasks */}
              <div className="space-y-3 mb-6">
                <label className="flex items-start gap-3 cursor-pointer group text-xs text-black/60 hover:text-black">
                  <input type="checkbox" checked={!!checkedItems.sanity_api_token} onChange={() => handleToggle("sanity_api_token")} className="mt-0.5 rounded accent-[var(--color-accent)] cursor-pointer" />
                  <span className={checkedItems.sanity_api_token ? "line-through text-black/30" : ""}>
                    Provide the read/write Sanity token (`SANITY_API_TOKEN`) in `.env.local`
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group text-xs text-black/60 hover:text-black">
                  <input type="checkbox" checked={!!checkedItems.sanity_webhook} onChange={() => handleToggle("sanity_webhook")} className="mt-0.5 rounded accent-[var(--color-accent)] cursor-pointer" />
                  <span className={checkedItems.sanity_webhook ? "line-through text-black/30" : ""}>
                    Configure dynamic Sanity content revalidation hooks in your deployment settings
                  </span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-black/5">
              <span className="text-3xs uppercase tracking-wider font-bold text-black/20 block mb-1">Active config key</span>
              <code className="text-xs font-mono  text-[var(--color-accent)]/80 block break-all">
                NEXT_PUBLIC_SANITY_PROJECT_ID, SANITY_API_TOKEN
              </code>
            </div>
          </div>

          {/* 9. OAUTH SOCIAL LOGIN */}
          <div className="bg-white border border-black/5 p-6 hover:border-[var(--color-accent)]/30 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-black mb-1">🔐 OAuth Social Login</h3>
                  <p className="text-[var(--font-size-2xs)] text-black/30 font-bold uppercase tracking-widest">Google, Facebook &amp; Apple sign-in</p>
                </div>
                <span className="px-2.5 py-1 text-[var(--font-size-2xs)] font-bold uppercase tracking-wider rounded-full bg-purple-600/10 text-purple-300 border border-purple-500/20">
                  🟡 Not Configured
                </span>
              </div>

              <p className="text-xs text-black/50 leading-relaxed mb-6">
                Enables fans to sign up / log in using their existing Google, Facebook, or Apple accounts instead of email + password. Code is already wired up via Supabase Auth — just needs provider credentials.
              </p>

              {/* Tasks */}
              <div className="space-y-3 mb-6">
                <label className="flex items-start gap-3 cursor-pointer group text-xs text-black/60 hover:text-black">
                  <input type="checkbox" checked={!!checkedItems.oauth_google_credentials} onChange={() => handleToggle("oauth_google_credentials")} className="mt-0.5 rounded accent-[var(--color-accent)] cursor-pointer" />
                  <span className={checkedItems.oauth_google_credentials ? "line-through text-black/30" : ""}>
                    Create an OAuth 2.0 Client ID at <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener" className="underline  text-[var(--color-accent)]/60 hover: text-[var(--color-accent)]">Google Cloud Console</a> → paste Client ID &amp; Secret into Supabase → Auth → Providers → Google
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group text-xs text-black/60 hover:text-black">
                  <input type="checkbox" checked={!!checkedItems.oauth_facebook_credentials} onChange={() => handleToggle("oauth_facebook_credentials")} className="mt-0.5 rounded accent-[var(--color-accent)] cursor-pointer" />
                  <span className={checkedItems.oauth_facebook_credentials ? "line-through text-black/30" : ""}>
                    Create an app at <a href="https://developers.facebook.com/" target="_blank" rel="noopener" className="underline  text-[var(--color-accent)]/60 hover: text-[var(--color-accent)]">Meta Developers</a> → add Facebook Login product → paste App ID &amp; Secret into Supabase → Auth → Providers → Facebook
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group text-xs text-black/60 hover:text-black">
                  <input type="checkbox" checked={!!checkedItems.oauth_apple_credentials} onChange={() => handleToggle("oauth_apple_credentials")} className="mt-0.5 rounded accent-[var(--color-accent)] cursor-pointer" />
                  <span className={checkedItems.oauth_apple_credentials ? "line-through text-black/30" : ""}>
                    Create a Services ID at <a href="https://developer.apple.com/" target="_blank" rel="noopener" className="underline  text-[var(--color-accent)]/60 hover: text-[var(--color-accent)]">Apple Developer</a> → enable Sign in with Apple → paste Service ID, Team ID, Key ID &amp; private key into Supabase → Auth → Providers → Apple
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group text-xs text-black/60 hover:text-black">
                  <input type="checkbox" checked={!!checkedItems.oauth_redirect_uri} onChange={() => handleToggle("oauth_redirect_uri")} className="mt-0.5 rounded accent-[var(--color-accent)] cursor-pointer" />
                  <span className={checkedItems.oauth_redirect_uri ? "line-through text-black/30" : ""}>
                    Add <code className="font-mono  text-[var(--color-accent)]/60">https://YOUR-PROJECT.supabase.co/auth/v1/callback</code> as the authorized redirect URI for all three providers
                  </span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-black/5">
              <span className="text-3xs uppercase tracking-wider font-bold text-black/20 block mb-1">Configured in</span>
              <code className="text-xs font-mono  text-[var(--color-accent)]/80 block break-all">
                Supabase Dashboard → Authentication → Providers
              </code>
            </div>
          </div>

        </div>

        {/* ─── COMPLIANCE & LEGAL SECTION ─── */}
        <div className="mt-16 mb-12 pb-6 border-b border-black/5">
          <h2 className="text-2xl font-black tracking-tight text-black mb-2">
            ⚖️ Compliance, Legal &amp; Content Moderation
          </h2>
          <p className="text-sm text-black/40 max-w-3xl leading-relaxed">
            These items cover legal requirements, content moderation systems, and regulatory compliance that must be in place before going live. Many of these carry real legal liability if ignored.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* 10. CAN-SPAM EMAIL COMPLIANCE */}
          <div className="bg-white border border-black/5 p-6 hover:border-rose-500/30 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-black mb-1">📧 CAN-SPAM Email Compliance</h3>
                  <p className="text-[var(--font-size-2xs)] text-black/30 font-bold uppercase tracking-widest">Federal law for commercial email</p>
                </div>
                <span className="px-2.5 py-1 text-[var(--font-size-2xs)] font-bold uppercase tracking-wider rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  ⚠️ Required
                </span>
              </div>

              <p className="text-xs text-black/50 leading-relaxed mb-6">
                The CAN-SPAM Act (15 U.S.C. §7701) requires all commercial emails to include an unsubscribe mechanism, a valid physical mailing address, and honest subject lines. Violations carry fines up to <strong className="text-black/60">$51,744 per email</strong>.
              </p>

              <div className="space-y-3 mb-6">
                <label className="flex items-start gap-3 cursor-pointer group text-xs text-black/60 hover:text-black">
                  <input type="checkbox" checked={!!checkedItems.canspam_unsubscribe} onChange={() => handleToggle("canspam_unsubscribe")} className="mt-0.5 rounded accent-[var(--color-accent)] cursor-pointer" />
                  <span className={checkedItems.canspam_unsubscribe ? "line-through text-black/30" : ""}>
                    Add a working one-click <strong>Unsubscribe</strong> link to every marketing email (show alerts, newsletters, promo blasts). Must process opt-outs within 10 business days.
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group text-xs text-black/60 hover:text-black">
                  <input type="checkbox" checked={!!checkedItems.canspam_physical_address} onChange={() => handleToggle("canspam_physical_address")} className="mt-0.5 rounded accent-[var(--color-accent)] cursor-pointer" />
                  <span className={checkedItems.canspam_physical_address ? "line-through text-black/30" : ""}>
                    Include a valid <strong>physical mailing address</strong> (or PO Box) in every marketing email footer
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group text-xs text-black/60 hover:text-black">
                  <input type="checkbox" checked={!!checkedItems.canspam_subject_lines} onChange={() => handleToggle("canspam_subject_lines")} className="mt-0.5 rounded accent-[var(--color-accent)] cursor-pointer" />
                  <span className={checkedItems.canspam_subject_lines ? "line-through text-black/30" : ""}>
                    Ensure email subject lines are not deceptive and clearly indicate promotional content
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group text-xs text-black/60 hover:text-black">
                  <input type="checkbox" checked={!!checkedItems.canspam_from_address} onChange={() => handleToggle("canspam_from_address")} className="mt-0.5 rounded accent-[var(--color-accent)] cursor-pointer" />
                  <span className={checkedItems.canspam_from_address ? "line-through text-black/30" : ""}>
                    Use a clear &ldquo;From&rdquo; name and a real reply-to address (not a no-reply that bounces)
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group text-xs text-black/60 hover:text-black">
                  <input type="checkbox" checked={!!checkedItems.canspam_opt_in_records} onChange={() => handleToggle("canspam_opt_in_records")} className="mt-0.5 rounded accent-[var(--color-accent)] cursor-pointer" />
                  <span className={checkedItems.canspam_opt_in_records ? "line-through text-black/30" : ""}>
                    Store opt-in consent records in Supabase (timestamp, email, IP, source page) for audit trail
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group text-xs text-black/60 hover:text-black">
                  <input type="checkbox" checked={!!checkedItems.canspam_email_templates} onChange={() => handleToggle("canspam_email_templates")} className="mt-0.5 rounded accent-[var(--color-accent)] cursor-pointer" />
                  <span className={checkedItems.canspam_email_templates ? "line-through text-black/30" : ""}>
                    Audit all email templates in <code className="font-mono  text-[var(--color-accent)]/60">/admin/emails</code> to include unsubscribe footer and physical address
                  </span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-black/5">
              <span className="text-3xs uppercase tracking-wider font-bold text-black/20 block mb-1">Reference</span>
              <code className="text-xs font-mono  text-[var(--color-accent)]/80 block break-all">
                FTC CAN-SPAM Act · 15 U.S.C. §7701
              </code>
            </div>
          </div>

          {/* 11. LIVE CHAT & MODERATION */}
          <div className="bg-white border border-black/5 p-6 hover:border-purple-500/30 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-black mb-1">💬 Chat Rooms &amp; Moderation</h3>
                  <p className="text-[var(--font-size-2xs)] text-black/30 font-bold uppercase tracking-widest">Live chat safety, age gates &amp; content filtering</p>
                </div>
                <span className="px-2.5 py-1 text-[var(--font-size-2xs)] font-bold uppercase tracking-wider rounded-full bg-purple-600/10 text-purple-300 border border-purple-500/20">
                  ⚠️ Required
                </span>
              </div>

              <p className="text-xs text-black/50 leading-relaxed mb-6">
                Live chat rooms create liability for user-generated content, harassment, and underage access. Platforms hosting public chat must implement moderation tools, age verification, and content filters to maintain safe harbor protections.
              </p>

              <div className="space-y-3 mb-6">
                <label className="flex items-start gap-3 cursor-pointer group text-xs text-black/60 hover:text-black">
                  <input type="checkbox" checked={!!checkedItems.chat_age_gate} onChange={() => handleToggle("chat_age_gate")} className="mt-0.5 rounded accent-[var(--color-accent)] cursor-pointer" />
                  <span className={checkedItems.chat_age_gate ? "line-through text-black/30" : ""}>
                    Enforce <strong>13+ age requirement</strong> at signup — block chat access for users who don&apos;t confirm age (COPPA)
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group text-xs text-black/60 hover:text-black">
                  <input type="checkbox" checked={!!checkedItems.chat_profanity_filter} onChange={() => handleToggle("chat_profanity_filter")} className="mt-0.5 rounded accent-[var(--color-accent)] cursor-pointer" />
                  <span className={checkedItems.chat_profanity_filter ? "line-through text-black/30" : ""}>
                    Verify the <strong>PG-13 content filter</strong> is active on all chat messages (profanity, slurs, explicit content)
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group text-xs text-black/60 hover:text-black">
                  <input type="checkbox" checked={!!checkedItems.chat_report_system} onChange={() => handleToggle("chat_report_system")} className="mt-0.5 rounded accent-[var(--color-accent)] cursor-pointer" />
                  <span className={checkedItems.chat_report_system ? "line-through text-black/30" : ""}>
                    Implement a <strong>report/flag system</strong> so users can report abusive messages, and crew/admins can ban users
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group text-xs text-black/60 hover:text-black">
                  <input type="checkbox" checked={!!checkedItems.chat_rate_limiting} onChange={() => handleToggle("chat_rate_limiting")} className="mt-0.5 rounded accent-[var(--color-accent)] cursor-pointer" />
                  <span className={checkedItems.chat_rate_limiting ? "line-through text-black/30" : ""}>
                    Enable <strong>rate limiting</strong> on chat messages (prevent spam floods — max 1 msg per second per user)
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group text-xs text-black/60 hover:text-black">
                  <input type="checkbox" checked={!!checkedItems.chat_terms_acceptance} onChange={() => handleToggle("chat_terms_acceptance")} className="mt-0.5 rounded accent-[var(--color-accent)] cursor-pointer" />
                  <span className={checkedItems.chat_terms_acceptance ? "line-through text-black/30" : ""}>
                    Require users to accept <strong>Community Guidelines</strong> before first chat message
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group text-xs text-black/60 hover:text-black">
                  <input type="checkbox" checked={!!checkedItems.chat_data_retention} onChange={() => handleToggle("chat_data_retention")} className="mt-0.5 rounded accent-[var(--color-accent)] cursor-pointer" />
                  <span className={checkedItems.chat_data_retention ? "line-through text-black/30" : ""}>
                    Define a <strong>data retention policy</strong> for chat logs (auto-purge after 30/90 days) in Privacy Policy
                  </span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-black/5">
              <span className="text-3xs uppercase tracking-wider font-bold text-black/20 block mb-1">Reference</span>
              <code className="text-xs font-mono  text-[var(--color-accent)]/80 block break-all">
                COPPA · Section 230 Safe Harbor · Community Standards
              </code>
            </div>
          </div>

          {/* 12. LIVE STREAMING LEGAL */}
          <div className="bg-white border border-black/5 p-6 hover:border-purple-500/30 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-black mb-1">🎥 Live Streaming Legal</h3>
                  <p className="text-[var(--font-size-2xs)] text-black/30 font-bold uppercase tracking-widest">Music licensing, venue consent &amp; recording</p>
                </div>
                <span className="px-2.5 py-1 text-[var(--font-size-2xs)] font-bold uppercase tracking-wider rounded-full bg-purple-500/10  text-[var(--color-accent)] border border-purple-500/20">
                  ⚠️ Required
                </span>
              </div>

              <p className="text-xs text-black/50 leading-relaxed mb-6">
                Self-hosting live streams via LiveKit means 7th Heaven is the broadcaster — there is no YouTube/Facebook copyright safety net. The band is 100% liable for music rights, venue permissions, and audience consent for recording.
              </p>

              <div className="space-y-3 mb-6">
                <label className="flex items-start gap-3 cursor-pointer group text-xs text-black/60 hover:text-black">
                  <input type="checkbox" checked={!!checkedItems.stream_music_license} onChange={() => handleToggle("stream_music_license")} className="mt-0.5 rounded accent-[var(--color-accent)] cursor-pointer" />
                  <span className={checkedItems.stream_music_license ? "line-through text-black/30" : ""}>
                    Obtain <strong>digital performance licenses</strong> for webcasting cover songs (contact SoundExchange, ASCAP/BMI for streaming-specific licenses beyond venue PRO coverage)
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group text-xs text-black/60 hover:text-black">
                  <input type="checkbox" checked={!!checkedItems.stream_sync_license} onChange={() => handleToggle("stream_sync_license")} className="mt-0.5 rounded accent-[var(--color-accent)] cursor-pointer" />
                  <span className={checkedItems.stream_sync_license ? "line-through text-black/30" : ""}>
                    Secure <strong>sync/mechanical licenses</strong> before archiving any recorded live streams to the Gallery (covers are copyrighted compositions)
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group text-xs text-black/60 hover:text-black">
                  <input type="checkbox" checked={!!checkedItems.stream_venue_consent} onChange={() => handleToggle("stream_venue_consent")} className="mt-0.5 rounded accent-[var(--color-accent)] cursor-pointer" />
                  <span className={checkedItems.stream_venue_consent ? "line-through text-black/30" : ""}>
                    Get <strong>written venue permission</strong> to live stream from each venue (some venues restrict streaming rights)
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group text-xs text-black/60 hover:text-black">
                  <input type="checkbox" checked={!!checkedItems.stream_audience_notice} onChange={() => handleToggle("stream_audience_notice")} className="mt-0.5 rounded accent-[var(--color-accent)] cursor-pointer" />
                  <span className={checkedItems.stream_audience_notice ? "line-through text-black/30" : ""}>
                    Post <strong>recording notice signage</strong> at venues (&ldquo;This event is being live streamed&rdquo;) for audience consent
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group text-xs text-black/60 hover:text-black">
                  <input type="checkbox" checked={!!checkedItems.stream_dmca_agent} onChange={() => handleToggle("stream_dmca_agent")} className="mt-0.5 rounded accent-[var(--color-accent)] cursor-pointer" />
                  <span className={checkedItems.stream_dmca_agent ? "line-through text-black/30" : ""}>
                    Register a <strong>DMCA designated agent</strong> with the U.S. Copyright Office for takedown requests (Section 512 safe harbor)
                  </span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-black/5">
              <span className="text-3xs uppercase tracking-wider font-bold text-black/20 block mb-1">Reference</span>
              <code className="text-xs font-mono  text-[var(--color-accent)]/80 block break-all">
                DMCA §512 · ASCAP/BMI/SoundExchange · Venue Contracts
              </code>
            </div>
          </div>

          {/* 13. LEGAL PAGES & POLICIES */}
          <div className="bg-white border border-black/5 p-6 hover:border-emerald-500/30 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-black mb-1">📋 Legal Pages &amp; Policies</h3>
                  <p className="text-[var(--font-size-2xs)] text-black/30 font-bold uppercase tracking-widest">Privacy, terms, cookies &amp; accessibility</p>
                </div>
                <span className="px-2.5 py-1 text-[var(--font-size-2xs)] font-bold uppercase tracking-wider rounded-full bg-emerald-500/10 text-[var(--color-accent)] border  border-[var(--color-accent)]/30">
                  🔍 Audit Required
                </span>
              </div>

              <p className="text-xs text-black/50 leading-relaxed mb-6">
                Every consumer-facing website needs compliant legal pages. These must be regularly audited as features change. Missing or outdated policies create real legal exposure.
              </p>

              <div className="space-y-3 mb-6">
                <label className="flex items-start gap-3 cursor-pointer group text-xs text-black/60 hover:text-black">
                  <input type="checkbox" checked={!!checkedItems.legal_privacy_audit} onChange={() => handleToggle("legal_privacy_audit")} className="mt-0.5 rounded accent-[var(--color-accent)] cursor-pointer" />
                  <span className={checkedItems.legal_privacy_audit ? "line-through text-black/30" : ""}>
                    Audit <strong>/privacy</strong> page — must list all data collected (email, phone, IP, zip, cookies), all third-party processors (Supabase, Resend, Twilio, Shopify, LiveKit, Mux, Sanity), and data retention periods
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group text-xs text-black/60 hover:text-black">
                  <input type="checkbox" checked={!!checkedItems.legal_terms_audit} onChange={() => handleToggle("legal_terms_audit")} className="mt-0.5 rounded accent-[var(--color-accent)] cursor-pointer" />
                  <span className={checkedItems.legal_terms_audit ? "line-through text-black/30" : ""}>
                    Audit <strong>/terms</strong> page — must include 13+ age restriction, fan content license grants, chat community guidelines, and dispute resolution
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group text-xs text-black/60 hover:text-black">
                  <input type="checkbox" checked={!!checkedItems.legal_cookie_consent} onChange={() => handleToggle("legal_cookie_consent")} className="mt-0.5 rounded accent-[var(--color-accent)] cursor-pointer" />
                  <span className={checkedItems.legal_cookie_consent ? "line-through text-black/30" : ""}>
                    Verify <strong>Cookie Consent Banner</strong> displays on first visit and respects opt-out choices (GDPR/CCPA for international visitors)
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group text-xs text-black/60 hover:text-black">
                  <input type="checkbox" checked={!!checkedItems.legal_dmca_page} onChange={() => handleToggle("legal_dmca_page")} className="mt-0.5 rounded accent-[var(--color-accent)] cursor-pointer" />
                  <span className={checkedItems.legal_dmca_page ? "line-through text-black/30" : ""}>
                    Add a <strong>DMCA policy page</strong> or section with designated agent contact info for copyright takedown requests
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group text-xs text-black/60 hover:text-black">
                  <input type="checkbox" checked={!!checkedItems.legal_ada_audit} onChange={() => handleToggle("legal_ada_audit")} className="mt-0.5 rounded accent-[var(--color-accent)] cursor-pointer" />
                  <span className={checkedItems.legal_ada_audit ? "line-through text-black/30" : ""}>
                    Run an <strong>ADA/WCAG 2.1 accessibility audit</strong> — alt text on images, 4.5:1 color contrast, keyboard navigation, screen reader labels
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group text-xs text-black/60 hover:text-black">
                  <input type="checkbox" checked={!!checkedItems.legal_refund_policy} onChange={() => handleToggle("legal_refund_policy")} className="mt-0.5 rounded accent-[var(--color-accent)] cursor-pointer" />
                  <span className={checkedItems.legal_refund_policy ? "line-through text-black/30" : ""}>
                    Add visible <strong>Refund &amp; Shipping Policy</strong> links for any merchandise/ticket purchases (FTC requirement)
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group text-xs text-black/60 hover:text-black">
                  <input type="checkbox" checked={!!checkedItems.legal_delete_account} onChange={() => handleToggle("legal_delete_account")} className="mt-0.5 rounded accent-[var(--color-accent)] cursor-pointer" />
                  <span className={checkedItems.legal_delete_account ? "line-through text-black/30" : ""}>
                    Implement <strong>account deletion</strong> flow — users must be able to delete their profile and all associated data (GDPR &ldquo;right to erasure&rdquo;)
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group text-xs text-black/60 hover:text-black">
                  <input type="checkbox" checked={!!checkedItems.legal_data_export} onChange={() => handleToggle("legal_data_export")} className="mt-0.5 rounded accent-[var(--color-accent)] cursor-pointer" />
                  <span className={checkedItems.legal_data_export ? "line-through text-black/30" : ""}>
                    Add <strong>data export</strong> option for users to download their personal data (GDPR &ldquo;right to portability&rdquo;)
                  </span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-black/5">
              <span className="text-3xs uppercase tracking-wider font-bold text-black/20 block mb-1">Pages to audit</span>
              <code className="text-xs font-mono  text-[var(--color-accent)]/80 block break-all">
                /privacy · /terms · /admin/legal · Cookie Banner
              </code>
            </div>
          </div>

        </div>

        {/* Global instructions card */}
        <div className="bg-white border border-black/5 rounded-3xl p-8 mt-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[var(--color-accent)]/5 rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-xl font-bold text-black mb-3">📍 Environment Variables Setup</h2>
          <p className="text-sm text-black/50 mb-6 leading-relaxed">
            All integrations are managed through environment variables inside your root file: <code className="font-mono text-black">.env.local</code>. Make sure to restart your local development server in the terminal after editing this file to apply changes:
          </p>
          <pre className="bg-[#f0f2f5] p-5 text-xs font-mono border border-black/5 overflow-x-auto text-black/50 leading-relaxed">
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
