"use client";
import Image from "next/image";

import { useEffect, useState } from "react";
import { useTransition } from "@/context/TransitionContext";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { SquishyToggle } from "@/components/SquishyToggle";

function nameToUsername(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_")
    .slice(0, 20);
}

export default function CompleteProfilePage() {
  const { requestTransition } = useTransition();
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
          setUsername(
            profileData.username || nameToUsername(profileData.full_name || ""),
          );
          setLoading(false);
        });
    });

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedUsername = username
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "");
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
        setError(
          `Username "${trimmedUsername}" is already taken. Try another.`,
        );
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
      requestTransition(`/fans/${trimmedUsername}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-11 w-11 animate-spin rounded-lg border-4 border-[var(--color-accent)] border-t-transparent" />
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Card */}
        <div className="animate-[fadeIn_0.3s_ease] overflow-hidden border border-white/10 bg-[var(--color-bg-surface)]">
          {/* Accent bar */}
          <div className="h-1 bg-gradient-to-r from-[var(--color-accent)] via-[#c026d3] to-[var(--color-accent)]" />

          <div className="p-8">
            {/* Header */}
            <div className="mb-8 text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-lg border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/20 text-2xl">
                🎸
              </div>
              <h1 className="mb-2">
                Welcome to the Family
                {profile?.full_name
                  ? `, ${profile.full_name.split(" ")[0]}`
                  : ""}
                !
              </h1>
              <p>Let&apos;s finish setting up your profile</p>
            </div>

            {/* Avatar from OAuth */}
            {profile?.avatar_url && (
              <div className="mb-6 flex justify-center">
                <Image
                  width={200}
                  height={200}
                  unoptimized
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="h-20 w-20 rounded-lg border-2 border-[var(--color-accent)]/40 object-cover"
                />
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Username */}
              <div>
                <label
                  htmlFor="complete-profile-username"
                  className="mb-1 block text-white/40"
                >
                  Choose Your Username
                </label>
                <div className="input-glow-border relative rounded-xl">
                  <span className="absolute top-1/2 left-3 z-10 -translate-y-1/2 text-white/20">
                    @
                  </span>
                  <input
                    id="complete-profile-username"
                    type="text"
                    value={username}
                    onChange={(e) =>
                      setUsername(
                        e.target.value
                          .replace(/[^a-zA-Z0-9_]/g, "")
                          .toLowerCase(),
                      )
                    }
                    placeholder="your_username"
                    maxLength={24}
                    className="placeholder: w-full rounded-xl border border-white/10 bg-white/[0.03] py-2.5 pr-3 pl-8 text-white/20 transition-colors outline-none"
                    required
                  />
                </div>
                <p>
                  This is your public handle. Letters, numbers &amp; underscores
                  only.
                </p>
              </div>

              {/* Notification Preferences */}
              <div className="flex flex-col gap-2">
                <span className="mb-1 block text-white/40">
                  Notification Preferences
                </span>

                {/* Proximity alerts */}
                <div
                  onClick={() => setWantNotifications(!wantNotifications)}
                  className={`flex w-full cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors ${wantNotifications ? "border-purple-500/40 bg-purple-600/10" : "border-white/10 bg-white/[0.02]"}`}
                >
                  <SquishyToggle
                    id="complete-profile-notifications"
                    label="Email me when 7th Heaven books a show near me"
                    checked={wantNotifications}
                    onChange={(val) => setWantNotifications(val)}
                  />
                  <span className="/90 text-left">
                    📍 Email me when 7th Heaven books a show near me
                  </span>
                </div>

                {/* Zip code */}
                {wantNotifications && (
                  <div className="ml-1">
                    <label
                      htmlFor="complete-profile-zip"
                      className="mb-1 block text-white/40"
                    >
                      Zip Code
                    </label>
                    <div className="input-glow-border rounded-xl">
                      <input
                        id="complete-profile-zip"
                        type="text"
                        value={zipCode}
                        onChange={(e) =>
                          setZipCode(
                            e.target.value.replace(/\D/g, "").slice(0, 5),
                          )
                        }
                        placeholder="e.g. 60601"
                        className="placeholder: w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-white/20 transition-colors outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Newsletter */}
                <div
                  onClick={() => setWantNewsletter(!wantNewsletter)}
                  className={`flex w-full cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors ${wantNewsletter ? "border-purple-500/40 bg-purple-600/10" : "border-white/10 bg-white/[0.02]"}`}
                >
                  <SquishyToggle
                    id="complete-profile-newsletter"
                    label="Send me news, show updates & exclusive drops"
                    checked={wantNewsletter}
                    onChange={(val) => setWantNewsletter(val)}
                  />
                  <span className="/90 text-left">
                    📧 Send me news, show updates &amp; exclusive drops
                  </span>
                </div>
              </div>

              {/* Info callout */}
              <div className="rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3">
                <p>
                  💡 <strong className="text-white/50">Tip:</strong> You can
                  always change these preferences later from your Fan Dashboard
                  settings. You can also follow specific shows to get notified
                  about just the ones you care about.
                </p>
              </div>

              {error && (
                <p className="border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-rose-400">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full cursor-pointer bg-[var(--color-accent)] py-3 shadow-[0_0_20px_rgba(255,10,61,0.3)] transition-colors hover:brightness-110 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Let's Go 🚀"}
              </button>

              <p className="text-center">
                By continuing you confirm you are 13+ and agree to our{" "}
                <Link
                  href="/privacy"
                  className="text-white/40 transition-colors hover:text-white"
                >
                  Privacy
                </Link>{" "}
                &amp;{" "}
                <Link
                  href="/terms"
                  className="text-white/40 transition-colors hover:text-white"
                >
                  Terms
                </Link>
                .
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
