import TransitionLink from "@/components/TransitionLink";

export const metadata = {
  title: "Page Slide Transition Demo — 7th Heaven",
};

export default function PageSlideTransitionDemo() {
  return (
    <div className="site-container flex flex-col items-start gap-6 py-16 md:py-24">
      <span
        className="text-xs font-black uppercase tracking-[0.3em]"
        style={{ color: "var(--color-accent)" }}
      >
        You made it
      </span>
      <h1
        className="text-4xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.95] text-white"
        style={{ fontFamily: "var(--font-barlow-condensed)" }}
      >
        This is a different route.
      </h1>
      <p className="max-w-xl text-base md:text-lg text-white/60 leading-relaxed">
        If you saw the black curtain cover the screen, hold, then wipe away
        bottom-up to reveal this page, that&apos;s the real transition —
        driven by <code>TransitionContext</code> + <code>PageTransition</code>,
        the same one now wired into the site&apos;s nav. This page exists
        purely as a second route to navigate to, so the curtain has an actual
        &quot;before&quot; and &quot;after&quot; to transition between —
        loading a URL directly (typing it in / refreshing) never shows a
        transition, since there&apos;s no previous page to transition from.
      </p>

      <TransitionLink
        href="/pagetransition"
        className="mt-2 w-fit rounded-full border border-white/15 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-white/80 transition-colors hover:border-[var(--color-accent)] hover:text-white"
      >
        ← Back to /pagetransition
      </TransitionLink>
    </div>
  );
}
