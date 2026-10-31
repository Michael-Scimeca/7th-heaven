"use client";

/**
 * Show-alert signup in the site footer — design #007 from /alerts-100:
 * name / zip / email, a segmented travel-radius bar merged with the live show radar
 * (real upcoming shows, measured from the zip), email and/or app notification, terms, Enable alerts.
 *
 * Saving:
 *  - App notification → asks permission, creates a web-push subscription and POSTs it to
 *    /api/web-push/subscribe with zip + radius (+ email/name), exactly as before.
 *  - Email → POSTs to /api/newsletter/subscribe (source "show-alerts"). That list has no
 *    zip/radius columns, so email alerts aren't distance-filtered yet.
 * The previous version is in git history (commit 83a65825).
 */

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import IphoneClipMask from "@/components/IphoneClipMask";
import ShowRadiusRings, { type RadiusValue } from "@/components/ShowRadiusRings";
import "./FooterProximityAlerts.css";

const VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  "BA0R-Cg3zpKyTmnWjOf3-Qci37ibBA7rY3BDqRZ-8JPkHezdQOU5fSx_p7__FUqG4Tf0znMa5LpoObodxLpOuxc";
const PREFS_KEY = "7h_alert_prefs_v1";

const RADII: { v: RadiusValue; label: string }[] = [
  { v: "all", label: "All Shows" },
  { v: "15", label: "15 Miles" },
  { v: "30", label: "30 Miles" },
  { v: "50", label: "50 Miles" },
  { v: "100", label: "100 Miles" },
];
type Channel = "email" | "app";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) out[i] = raw.charCodeAt(i);
  return out;
}

async function createPushSubscription(): Promise<PushSubscription | null> {
  if (!("serviceWorker" in navigator)) return null;
  try {
    await navigator.serviceWorker.register("/sw.js");
    const reg = await navigator.serviceWorker.ready;
    return (
      (await reg.pushManager.getSubscription()) ||
      (await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as unknown as ArrayBuffer,
      }))
    );
  } catch (e) {
    console.warn("[push] subscribe failed:", e);
    return null;
  }
}

function PhoneVideo() {
  const box = useRef<HTMLDivElement>(null);
  const vid = useRef<HTMLVideoElement>(null);
  const [load, setLoad] = useState(false);
  useEffect(() => {
    const el = box.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setLoad(true);
          vid.current?.play().catch(() => {});
        } else vid.current?.pause();
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div className="fpa-phone" aria-hidden="true">
      <div className="relative aspect-[9/19.5] w-full select-none">
        <IphoneClipMask insetXPercent={0} insetTopPercent={0} insetBottomPercent={0} borderRadiusPx={46} className="flex h-full w-full items-center justify-center">
          <div className="relative flex h-full w-full flex-col justify-between overflow-hidden rounded-[44px] border border-purple-500/30 bg-[#12071f] p-2.5 shadow-[inset_0_0_20px_rgba(168,85,247,0.15)]">
            <div ref={box} className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[36px] bg-black">
              {load && (
                <video ref={vid} src="/movie/notefication.mp4" autoPlay loop muted playsInline preload="none" className="h-full w-full rounded-[36px] bg-black object-contain" />
              )}
            </div>
          </div>
        </IphoneClipMask>
      </div>
    </div>
  );
}

export default function FooterProximityAlerts() {
  const [name, setName] = useState("");
  const [zip, setZip] = useState("");
  const [email, setEmail] = useState("");
  const [radius, setRadius] = useState<RadiusValue>("50");
  const [channels, setChannels] = useState<Channel[]>(["email"]);
  const [terms, setTerms] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [msg, setMsg] = useState("");

  // restore saved prefs (same key as before)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(PREFS_KEY) || localStorage.getItem("7h_alert_prefs");
      if (!saved) return;
      const p = JSON.parse(saved);
      if (p.name) setName(p.name);
      if (p.zip) setZip(p.zip);
      if (p.email) setEmail(p.email);
      if (RADII.some((r) => r.v === p.radius)) setRadius(p.radius);
      if (Array.isArray(p.channels) && p.channels.length) setChannels(p.channels);
    } catch {}
  }, []);

  const toggleChannel = (c: Channel) =>
    setChannels((ch) => (ch.includes(c) ? (ch.length > 1 ? ch.filter((x) => x !== c) : ch) : [...ch, c]));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const wantsEmail = channels.includes("email");
    const wantsApp = channels.includes("app");
    if (wantsEmail && !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setStatus("error");
      return setMsg("Add your email so we know where to send alerts.");
    }
    if (!terms) {
      setStatus("error");
      return setMsg("Tick the Terms and Privacy box to turn alerts on.");
    }
    setStatus("saving");
    setMsg("");
    const done: string[] = [];
    const problems: string[] = [];
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify({ name, zip, email, radius, channels, selectedTypes: ["all"] }));
    } catch {}

    if (wantsEmail) {
      try {
        const res = await fetch("/api/newsletter/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), name: name.trim() || undefined, source: "show-alerts" }),
        });
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "email signup failed");
        done.push("email");
      } catch (err) {
        console.error("[alerts] email signup:", err);
        problems.push("We couldn't save your email just now. Please try again.");
      }
    }

    if (wantsApp) {
      if (typeof window === "undefined" || !("Notification" in window)) {
        problems.push("This browser can't show app notifications. Try email, or install the 7th Heaven app.");
      } else {
        const p = Notification.permission === "default" ? await Notification.requestPermission() : Notification.permission;
        if (p !== "granted") {
          problems.push("Notifications are blocked in your browser settings. Allow them for this site to get app alerts.");
        } else {
          const sub = await createPushSubscription();
          if (!sub) problems.push("We couldn't set up app notifications on this device.");
          else {
            try {
              const j = sub.toJSON();
              const res = await fetch("/api/web-push/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  subscription: { endpoint: j.endpoint, keys: { p256dh: j.keys?.p256dh, auth: j.keys?.auth } },
                  name: name.trim() || undefined,
                  email: email.trim() || undefined,
                  zip: zip.trim() || undefined,
                  radius,
                  selectedTypes: ["all"],
                }),
              });
              if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "push signup failed");
              done.push("app notification");
            } catch (err) {
              console.error("[alerts] push signup:", err);
              problems.push("We couldn't save app notifications just now. Please try again.");
            }
          }
        }
      }
    }

    const where = radius === "all" ? "every show" : `shows within ${radius} miles`;
    if (done.length) {
      setStatus("saved");
      setMsg(`You're in. We'll let you know about ${where} by ${done.join(" and ")}.${problems.length ? " " + problems[0] : ""}`);
    } else {
      setStatus("error");
      setMsg(problems[0] || "Something went wrong. Please try again.");
    }
  }

  return (
    <div className="fpa">
      <PhoneVideo />
      <form className="fpa-form" onSubmit={onSubmit} noValidate data-no-text-anim>
        <div className="fpa-fields">
          <label className="fpa-field" htmlFor="fpa-name">
            <span>Full name</span>
            <input id="fpa-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Rocker" autoComplete="name" />
          </label>
          <label className="fpa-field" htmlFor="fpa-zip">
            <span>Zip code</span>
            <input id="fpa-zip" value={zip} onChange={(e) => setZip(e.target.value)} placeholder="60067" autoComplete="postal-code" inputMode="numeric" maxLength={10} />
          </label>
          <label className="fpa-field" htmlFor="fpa-email">
            <span>Email</span>
            <input id="fpa-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" autoComplete="email" />
          </label>
        </div>

        <div className="fpa-block">
          <p className="fpa-label">Travel radius</p>
          <div className="fpa-radar">
            <ShowRadiusRings value={radius} onChange={setRadius} zip={zip} showList={false} />
          </div>
        </div>

        <div className="fpa-block">
          <p className="fpa-label">Send alerts by</p>
          <div className="fpa-pills" role="group" aria-label="How to send alerts">
            {(
              [
                ["email", "Email"],
                ["app", "App notification"],
              ] as [Channel, string][]
            ).map(([c, l]) => (
              <button key={c} type="button" role="checkbox" aria-checked={channels.includes(c)} className="fpa-pill" onClick={() => toggleChannel(c)}>
                {l}
              </button>
            ))}
          </div>
          {channels.includes("app") && <p className="fpa-hint">Your browser will ask to allow notifications when you turn alerts on.</p>}
        </div>

        <label className="fpa-terms" htmlFor="fpa-terms">
          <input id="fpa-terms" type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} />
          <span>
            I agree to the <Link href="/terms">Terms</Link> and <Link href="/privacy">Privacy Policy</Link>.
          </span>
        </label>

        <div className="fpa-submit">
          <button type="submit" className="fpa-cta" disabled={status === "saving"}>
            {status === "saving" ? "Turning on…" : "Enable alerts"}
          </button>
          {msg && (
            <p className={`fpa-msg${status === "saved" ? " ok" : ""}`} role="status">
              {msg}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
