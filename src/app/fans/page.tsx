"use client";
/* oxlint-disable react-doctor/nextjs-no-client-side-redirect */
/* eslint-disable react-doctor/nextjs-no-client-side-redirect */

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMember } from "@/context/MemberContext";
import PageHero from "@/components/PageHero";
import { SectionHeader } from "@/components/SectionHeader";
import { CalendarCheck, Award, Bell, Camera, ArrowRight, Sparkles } from "lucide-react";

function FansContent() {
  const { member, isLoggedIn, hydrated, openModal } = useMember();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isDemo = searchParams.get("demo") === "true";

  useEffect(() => {
    if (!hydrated) return;

    if (isDemo) {
      router.replace("/fans/demo");
      return;
    }

    if (isLoggedIn && member) {
      const slug = member.username || "me";
      router.replace(`/fans/${slug}`);
    }
  }, [hydrated, isDemo, isLoggedIn, member, router]);

  return (
    <main
      className="site-container page-container page-stack min-h-screen"
      id="fans-page"
    >
      {/* ── HERO ── */}
      <PageHero
        badge="VIP Community"
        title="7th Heaven Fan Club"
        titleId="fans-heading"
        subtitle="Connect with fellow fans, track your concert history, enter live show raffles, and unlock exclusive VIP perks across more than 100 live shows each year."
        align="left"
        actions={
          <div className="flex flex-wrap items-center gap-3">
            {isLoggedIn && member ? (
              <Link
                href={`/fans/${member.username || "me"}`}
                className="btn-accent inline-flex items-center gap-2 rounded-[var(--radius-box)] bg-[var(--color-accent)] px-6 py-2.5 font-medium text-white transition-transform hover:scale-105"
              >
                Go to My Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => openModal("login")}
                  className="btn-accent inline-flex cursor-pointer items-center gap-2 rounded-[var(--radius-box)] bg-[var(--color-accent)] px-6 py-2.5 font-medium text-white transition-transform hover:scale-105"
                >
                  <Sparkles className="h-4 w-4" />
                  Sign In / Join Free
                </button>
                <Link
                  href="/fan-photo-wall"
                  className="inline-flex items-center gap-2 rounded-[var(--radius-box)] border border-white/15 bg-white/5 px-5 py-2.5 font-medium text-white transition-colors hover:bg-white/10"
                >
                  <Camera className="h-4 w-4" />
                  Fan Photo Wall
                </Link>
              </>
            )}
          </div>
        }
      />

      {/* ── ABOUT THE COMMUNITY ── */}
      <section
        id="fans-community"
        aria-labelledby="fans-community-heading"
        className="section"
      >
        <SectionHeader
          id="fans-community-heading"
          title="More Than 40 Years of Rock & Roll Community"
          subtitle="The beating heart of 7th Heaven has always been the crowd."
        />
        <div className="mx-auto max-w-4xl space-y-4 text-white/80 leading-relaxed">
          <p>
            For over four decades, the 7th Heaven family has been driven by one of the most passionate and loyal fan
            communities in American rock and roll. From county fairs, summer fests, and premier festival main stages
            across Illinois, Wisconsin, Indiana, and Michigan to our annual international music cruises across the
            Caribbean and Europe, 7th Heaven fans bring an electric atmosphere to every performance.
          </p>
          <p>
            The official 7th Heaven Fan Club is your digital passport to the live concert experience. Whether you have
            been following the band since our 1985 debut or just discovered us at a local festival this summer, our fan
            portal lets you preserve your concert memories, connect with lifelong friends, and unlock special rewards
            that make every show unforgettable.
          </p>
        </div>
      </section>

      {/* ── VIP PERKS & FEATURES ── */}
      <section
        id="fans-perks"
        aria-labelledby="fans-perks-heading"
        className="section"
      >
        <SectionHeader
          id="fans-perks-heading"
          title="Fan Club Perks & Features"
          subtitle="Everything you get when you register your free member profile."
        />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <article className="flex flex-col justify-between rounded-[var(--radius-box)] border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-purple-500/40">
            <div>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600/20 text-purple-400">
                <CalendarCheck className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-white">Show Attendance Tracking</h3>
              <p className="text-sm text-white/70 leading-relaxed">
                Log every concert you attend, build your personal show timeline, and compare your historical show count
                with fellow fans across 40+ years of touring.
              </p>
            </div>
          </article>

          <article className="flex flex-col justify-between rounded-[var(--radius-box)] border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-purple-500/40">
            <div>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600/20 text-purple-400">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-white">Concert Live Raffles</h3>
              <p className="text-sm text-white/70 leading-relaxed">
                Enter real-time digital giveaways at select concerts to win signed drumsticks, official stage setlists,
                backstage meet-and-greets, and exclusive tour merch.
              </p>
            </div>
          </article>

          <article className="flex flex-col justify-between rounded-[var(--radius-box)] border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-purple-500/40">
            <div>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600/20 text-purple-400">
                <Bell className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-white">Proximity Tour Alerts</h3>
              <p className="text-sm text-white/70 leading-relaxed">
                Never miss an impromptu performance or festival announcement. Receive timely notifications whenever
                7th Heaven is scheduled to play near your location.
              </p>
            </div>
          </article>

          <article className="flex flex-col justify-between rounded-[var(--radius-box)] border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-purple-500/40">
            <div>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600/20 text-purple-400">
                <Camera className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-white">Fan Photo & Media Wall</h3>
              <p className="text-sm text-white/70 leading-relaxed">
                Upload your favorite concert snapshots, crowd selfies, and video moments to be featured on the official
                7th Heaven Fan Media Wall for the whole community to see.
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* ── GETTING STARTED / FAQ ── */}
      <section
        id="fans-faq"
        aria-labelledby="fans-faq-heading"
        className="section"
      >
        <SectionHeader
          id="fans-faq-heading"
          title="Frequently Asked Questions"
          subtitle="Common questions about the 7th Heaven VIP Fan Club."
        />
        <div className="mx-auto max-w-4xl grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-[var(--radius-box)] border border-white/10 bg-white/[0.02] p-6">
            <h3 className="mb-2 font-semibold text-white">Is the Fan Club free to join?</h3>
            <p className="text-sm text-white/70 leading-relaxed">
              Yes, creating a 7th Heaven Fan Club account is completely free. You get immediate access to show check-ins,
              your personal concert history dashboard, and proximity notifications.
            </p>
          </div>
          <div className="rounded-[var(--radius-box)] border border-white/10 bg-white/[0.02] p-6">
            <h3 className="mb-2 font-semibold text-white">How do concert check-ins work?</h3>
            <p className="text-sm text-white/70 leading-relaxed">
              When you are at a 7th Heaven concert, open the fan portal on your smartphone and tap the Check-In button on
              the live show card. Your attendance is saved to your permanent fan profile.
            </p>
          </div>
          <div className="rounded-[var(--radius-box)] border border-white/10 bg-white/[0.02] p-6">
            <h3 className="mb-2 font-semibold text-white">How do I claim raffle prizes?</h3>
            <p className="text-sm text-white/70 leading-relaxed">
              If your raffle number or name is selected during a live concert drawing, present your digital winner PIN to
              the merchandise table representative at the end of the show to collect your prize.
            </p>
          </div>
          <div className="rounded-[var(--radius-box)] border border-white/10 bg-white/[0.02] p-6">
            <h3 className="mb-2 font-semibold text-white">Can I share my fan profile?</h3>
            <p className="text-sm text-white/70 leading-relaxed">
              Every fan receives a personalized public profile URL (e.g., 7thheavenband.com/fans/yourname) showcasing your
              show stats, attended concerts, and community badges.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function FansRedirectPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-11 w-11 animate-spin border-2 border-[var(--color-accent)] border-t-transparent" />
        </div>
      }
    >
      <FansContent />
    </Suspense>
  );
}

