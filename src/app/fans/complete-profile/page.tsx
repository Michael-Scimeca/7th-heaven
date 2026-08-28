"use client";
import Image from 'next/image';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { SquishyToggle } from "@/components/SquishyToggle";

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
    let isMounted = true;

    supabase.auth.getUser().then((res: any) => {
      const user = res.data?.user;
      if (!user) {
        window.location.replace("/");
        return;
      }

      supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()
        .then((profileRes: any) => {
          const profileData = profileRes.data;
          if (!profileData) {
            window.location.replace("/");
            return;
          }

          if (profileData.profile_completed) {
            window.location.replace(`/fans/${profileData.username}`);
            return;
          }

          if (!isMounted) return;
          setProfile(profileData);
          setUsername(profileData.username || nameToUsername(profileData.full_name || ""));
          setLoading(false);
        });
    });

    return () => { isMounted = false; };
  }, [router, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (!trimmedUsername || trimmedUsername.length < 2) {
      setError("Username must be at least 2 characters.");
      return;
    }

    setSaving(true);
    try {
      // Check username availability
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", trimmedUsername)
        .neq("id", profile.id)
        .single();

      if (existing) {
        setError(`Username "${trimmedUsername}" is already taken. Try another.`);
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
        return;
      }

      // Redirect to their new dashboard
      router.push(`/fans/${trimmedUsername}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[var(--color-accent)] border-t-transparent rounded-lg animate-spin" />
          <p className="font-bold uppercase tracking-widest">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Card */}
        <div className="bg-[var(--color-bg-surface)] border border-white/10 overflow-hidden animate-[fadeIn_0.3s_ease]">
          {/* Accent bar */}
          <div className="h-1 bg-gradient-to-r from-[var(--color-accent)] via-[#c026d3] to-[var(--color-accent)]" />

          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[var(--color-accent)]/20 border border-[var(--color-accent)]/40 rounded-lg flex items-center justify-center mx-auto mb-4 text-2xl">
                🎸
              </div>
              <h1 className="text-2xl font-bold tracking-tight mb-2">
                Welcome to the Family
                {profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}!
              </h1>
              <p className="uppercase tracking-[0.2em]">
                Let&apos;s finish setting up your profile
              </p>
            </div>

            {/* Avatar from OAuth */}
            {profile?.avatar_url && (
              <div className="flex justify-center mb-6">
                <Image width={200} height={200} unoptimized
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="w-20 h-20 rounded-lg border-2 border-[var(--color-accent)]/40 object-cover"
                />
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Username */}
              <div>
                <label htmlFor="complete-profile-username" className="text-[var(--font-size-3xs)] uppercase tracking-[0.15em] text-white/40 mb-1 block">
                  Choose Your Username
                </label>
                <div className="relative input-glow-border rounded-xl">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 text-sm z-10">@</span>
                  <input aria-label="Input field"
                    id="complete-profile-username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase())}
                    placeholder="your_username"
                    maxLength={24}
                    className="w-full pl-8 pr-3 py-2.5 bg-white/[0.03] border border-white/10 text-sm text-white placeholder:text-white/20 outline-none transition-colors rounded-xl"
                    required
                  />
                </div>
                <p className="mt-1">This is your public handle. Letters, numbers &amp; underscores only.</p>
              </div>

              {/* Notification Preferences */}
              <div className="flex flex-col gap-2">
                <span className="text-[var(--font-size-3xs)] uppercase tracking-[0.15em] text-white/40 mb-1 block">
                  Notification Preferences
                </span>

                {/* Proximity alerts */}
                <div
                  onClick={() => setWantNotifications(!wantNotifications)}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg border transition-colors cursor-pointer ${wantNotifications ?'bg-purple-600/10 border-purple-500/40'
                    : 'bg-white/[0.02] border-white/10 hover: border-white/10 '
                    }`}
                >
                  <SquishyToggle
                    id="complete-profile-notifications"
                    label="Email me when 7th Heaven books a show near me"
                    checked={wantNotifications}
                    onChange={(val) => setWantNotifications(val)}
                  />
                  <span className="text-sm text-white/90 font-bold leading-tight text-left">
                    📍 Email me when 7th Heaven books a show near me
                  </span>
                </div>

                {/* Zip code */}
                {wantNotifications && (
                  <div className="ml-1">
                    <label htmlFor="complete-profile-zip" className="text-[var(--font-size-3xs)] uppercase tracking-[0.15em] text-white/40 mb-1 block">Zip Code</label>
                    <div className="input-glow-border rounded-xl">
                      <input aria-label="Input field"
                        id="complete-profile-zip"
                        type="text"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                        placeholder="e.g. 60601"
                        className="w-full px-3 py-2 bg-white/[0.03] border border-white/10 text-sm text-white placeholder:text-white/20 outline-none transition-colors rounded-xl"
                      />
                    </div>
                  </div>
                )}

                {/* Newsletter */}
                <div
                  onClick={() => setWantNewsletter(!wantNewsletter)}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg border transition-colors cursor-pointer ${wantNewsletter ?'bg-purple-600/10 border-purple-500/40'
                    : 'bg-white/[0.02] border-white/10 hover: border-white/10 '
                    }`}
                >
                  <SquishyToggle
                    id="complete-profile-newsletter"
                    label="Send me news, show updates & exclusive drops"
                    checked={wantNewsletter}
                    onChange={(val) => setWantNewsletter(val)}
                  />
                  <span className="text-sm text-white/90 font-bold leading-tight text-left">
                    📧 Send me news, show updates &amp; exclusive drops
                  </span>
                </div>
              </div>

              {/* Info callout */}
              <div className="bg-white/[0.02] border border-white/5 rounded-lg px-4 py-3">
                <p className="leading-relaxed">
                  💡 <strong className="text-white/50">Tip:</strong> You can always change these preferences later from your Fan Dashboard settings. You can also follow specific shows to get notified about just the ones you care about.
                </p>
              </div>

              {error && (
                <p className="text-rose-400 bg-rose-400/10 px-3 py-2 border border-rose-400/20">{error}</p>
              )}

              <button aria-label="Action button"
                type="submit"
                disabled={saving}
                className="w-full py-3 bg-[var(--color-accent)] text-white font-bold text-sm uppercase tracking-[0.15em] hover:brightness-110 transition-colors disabled:opacity-50 cursor-pointer shadow-[0_0_20px_rgba(255,10,61,0.3)]"
              >
                {saving ? "Saving..." : "Let's Go 🚀"}
              </button>

              <p className="text-center leading-relaxed">
                By continuing you confirm you are 13+ and agree to our{" "}
                <Link href="/privacy" className="underline hover:text-white/40 transition-colors">Privacy</Link> &amp;{" "}
                <Link href="/terms" className="underline hover:text-white/40 transition-colors">Terms</Link>.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
