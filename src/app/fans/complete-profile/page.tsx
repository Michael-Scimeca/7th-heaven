"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function nameToUsername(name: string) {
  return name.trim().toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 20);
}

export default function CompleteProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<any>(null);

  // Form fields
  const [username, setUsername] = useState("");
  const [wantNotifications, setWantNotifications] = useState(false);
  const [wantNewsletter, setWantNewsletter] = useState(true);
  const [zipCode, setZipCode] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/");
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!profileData) {
        router.push("/");
        return;
      }

      // If profile is already completed, redirect to dashboard
      if (profileData.profile_completed) {
        router.push(`/fans/${profileData.username}`);
        return;
      }

      setProfile(profileData);
      setUsername(profileData.username || nameToUsername(profileData.full_name || ""));
      setLoading(false);
    };

    loadProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    const trimmedUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (!trimmedUsername || trimmedUsername.length < 2) {
      setError("Username must be at least 2 characters.");
      setSaving(false);
      return;
    }

    // Check username availability
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", trimmedUsername)
      .neq("id", profile.id)
      .single();

    if (existing) {
      setError(`Username "${trimmedUsername}" is already taken. Try another.`);
      setSaving(false);
      return;
    }

    // Update profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        username: trimmedUsername,
        notifications_enabled: wantNotifications,
        newsletter_subscribed: wantNewsletter,
        zip_code: zipCode || null,
        notification_radius: wantNotifications ? 50 : 25,
        profile_completed: true,
      })
      .eq("id", profile.id);

    if (updateError) {
      setError("Failed to save profile. Please try again.");
      setSaving(false);
      return;
    }

    // Redirect to their new dashboard
    router.push(`/fans/${trimmedUsername}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-deep)] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold uppercase tracking-widest text-white/40">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-deep)] text-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Card */}
        <div className="bg-[var(--color-bg-surface)] border border-white/10 overflow-hidden animate-[fadeIn_0.3s_ease]">
          {/* Accent bar */}
          <div className="h-1 bg-gradient-to-r from-[var(--color-accent)] via-[#c026d3] to-[var(--color-accent)]" />

          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[var(--color-accent)]/20 border border-[var(--color-accent)]/40 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                🎸
              </div>
              <h1 className="text-2xl font-black tracking-tight mb-2">
                Welcome to the Family
                {profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}!
              </h1>
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                Let&apos;s finish setting up your profile
              </p>
            </div>

            {/* Avatar from OAuth */}
            {profile?.avatar_url && (
              <div className="flex justify-center mb-6">
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="w-20 h-20 rounded-full border-2 border-[var(--color-accent)]/40 object-cover"
                />
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Username */}
              <div>
                <label className="text-[var(--font-size-3xs)] uppercase tracking-[0.15em] text-white/40 mb-1 block">
                  Choose Your Username
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 text-sm">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase())}
                    placeholder="your_username"
                    maxLength={24}
                    className="w-full pl-8 pr-3 py-2.5 bg-white/[0.03] border border-white/10 text-sm text-white placeholder:text-white/20 outline-none focus:border-[var(--color-accent)] transition-colors"
                    required
                  />
                </div>
                <p className="text-[var(--font-size-3xs)] text-white/20 mt-1">This is your public handle. Letters, numbers &amp; underscores only.</p>
              </div>

              {/* Notification Preferences */}
              <div className="flex flex-col gap-2">
                <label className="text-[var(--font-size-3xs)] uppercase tracking-[0.15em] text-white/40 mb-1 block">
                  Notification Preferences
                </label>

                {/* Proximity alerts */}
                <button
                  type="button"
                  onClick={() => setWantNotifications(!wantNotifications)}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg border transition-all cursor-pointer ${
                    wantNotifications
                      ? 'bg-[var(--color-accent)]/10 border-[var(--color-accent)]/40'
                      : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                  }`}
                >
                  <span className={`w-9 h-5 rounded-full relative transition-all flex-shrink-0 ${
                    wantNotifications ? 'bg-[var(--color-accent)]' : 'bg-white/10'
                  }`}>
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                      wantNotifications ? 'left-[18px]' : 'left-0.5'
                    }`} />
                  </span>
                  <span className="text-sm text-white/70 leading-tight text-left">
                    📍 Email me when 7th Heaven books a show near me
                  </span>
                </button>

                {/* Zip code */}
                {wantNotifications && (
                  <div className="ml-1">
                    <label className="text-[var(--font-size-3xs)] uppercase tracking-[0.15em] text-white/40 mb-1 block">Zip Code</label>
                    <input
                      type="text"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                      placeholder="e.g. 60601"
                      className="w-full px-3 py-2 bg-white/[0.03] border border-white/10 text-sm text-white placeholder:text-white/20 outline-none focus:border-[var(--color-accent)] transition-colors"
                    />
                  </div>
                )}

                {/* Newsletter */}
                <button
                  type="button"
                  onClick={() => setWantNewsletter(!wantNewsletter)}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg border transition-all cursor-pointer ${
                    wantNewsletter
                      ? 'bg-[var(--color-accent)]/10 border-[var(--color-accent)]/40'
                      : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                  }`}
                >
                  <span className={`w-9 h-5 rounded-full relative transition-all flex-shrink-0 ${
                    wantNewsletter ? 'bg-[var(--color-accent)]' : 'bg-white/10'
                  }`}>
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                      wantNewsletter ? 'left-[18px]' : 'left-0.5'
                    }`} />
                  </span>
                  <span className="text-sm text-white/70 leading-tight text-left">
                    📧 Send me news, show updates &amp; exclusive drops
                  </span>
                </button>
              </div>

              {/* Info callout */}
              <div className="bg-white/[0.02] border border-white/5 rounded-lg px-4 py-3">
                <p className="text-[var(--font-size-3xs)] text-white/30 leading-relaxed">
                  💡 <strong className="text-white/50">Tip:</strong> You can always change these preferences later from your Fan Dashboard settings. You can also follow specific shows to get notified about just the ones you care about.
                </p>
              </div>

              {error && (
                <p className="text-xs text-rose-400 bg-rose-400/10 px-3 py-2 border border-rose-400/20">{error}</p>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 bg-[var(--color-accent)] text-white font-bold text-sm uppercase tracking-[0.15em] hover:brightness-110 transition-all disabled:opacity-50 cursor-pointer shadow-[0_0_20px_rgba(255,10,61,0.3)]"
              >
                {saving ? "Saving..." : "Let's Go 🚀"}
              </button>

              <p className="text-[var(--font-size-3xs)] text-white/25 text-center leading-relaxed">
                By continuing you confirm you are 13+ and agree to our{" "}
                <a href="/privacy" className="underline hover:text-white/40 transition-colors">Privacy</a> &amp;{" "}
                <a href="/terms" className="underline hover:text-white/40 transition-colors">Terms</a>.
              </p>
            </form>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
