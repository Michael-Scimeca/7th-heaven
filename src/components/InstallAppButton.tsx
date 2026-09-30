"use client";

import React, { useState, useEffect } from "react";
import { Download, Smartphone, Share2, PlusSquare, Check, X, Sparkles } from "lucide-react";
import SeventhButton from "@/components/SeventhButton";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export interface InstallAppButtonProps {
  variant?: "button" | "banner" | "compact" | "card";
  className?: string;
  showIfInstalled?: boolean;
}

export function InstallAppButton({
  variant = "button",
  className = "",
  showIfInstalled = false,
}: InstallAppButtonProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosModal, setShowIosModal] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // 1. Detect standalone mode
    const isStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes("android-app://");

    setIsStandalone(isStandaloneMode);

    // 2. Detect iOS / iPadOS
    const ua = window.navigator.userAgent.toLowerCase();
    const isAppleDevice =
      /iphone|ipad|ipod/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    setIsIos(isAppleDevice);

    // 3. Listen for Chromium beforeinstallprompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isStandalone || installed) return;

    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") {
          setInstalled(true);
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.warn("[PWA] install error:", err);
      }
    } else if (isIos) {
      setShowIosModal(true);
    } else {
      // Fallback for unsupported / desktop browsers
      setShowIosModal(true);
    }
  };

  if ((isStandalone || installed) && !showIfInstalled) {
    return null;
  }

  if (isStandalone || installed) {
    return (
      <div className={`inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300 font-medium ${className} `}>
        <Check className="h-3.5 w-3.5 shrink-0" />
        <span>7th Heaven App Installed</span>
      </div>
    );
  }

  // Card Variant
  if (variant === "card") {
    return (
      <>
        <div className={`relative overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-950/40 via-purple-900/20 to-black/80 p-5 backdrop-blur-xl ${className} `}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-600/30 border border-purple-500/40 text-purple-300">
                <Smartphone className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-white text-base">Install the 7th Heaven App</h4>
                  <span className="rounded bg-purple-500/20 border border-purple-400/30 px-1.5 py-0.5 text-[9px] text-purple-200">
                    PWA
                  </span>
                </div>
                <p className="text-xs text-white/60 mt-0.5">
                  Instant lock-screen show alerts, offline tour calendar & VIP backstage access.
                </p>
              </div>
            </div>
            <SeventhButton
              type="button"
              onClick={handleInstallClick}
              icon={false}
              className="shrink-0 w-full sm:w-auto cursor-pointer"
            >
              <span className="flex items-center justify-center gap-2">
                <Download className="h-4 w-4" />
                Install App
              </span>
            </SeventhButton>
          </div>
        </div>

        {showIosModal && <IosInstallModal onClose={() => setShowIosModal(false)} isIos={isIos} />}
      </>
    );
  }

  // Banner Variant
  if (variant === "banner") {
    return (
      <>
        <div className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/60 p-3 backdrop-blur-md ${className} `}>
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-4 w-4 text-purple-400 shrink-0" />
            <span className="text-xs text-white/80">
              Get the full experience — install the <strong>7th Heaven App</strong> for instant tour alerts.
            </span>
          </div>
          <button
            type="button"
            onClick={handleInstallClick}
            className="flex items-center gap-1.5 rounded-lg border border-purple-500/50 bg-purple-600/30 px-3 py-1 text-xs font-semibold text-white hover:bg-purple-600/50 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            Install App
          </button>
        </div>

        {showIosModal && <IosInstallModal onClose={() => setShowIosModal(false)} isIos={isIos} />}
      </>
    );
  }

  // Compact Variant
  if (variant === "compact") {
    return (
      <>
        <button
          type="button"
          onClick={handleInstallClick}
          className={`flex items-center gap-1.5 text-xs text-purple-300 hover:text-purple-200 font-medium transition-colors ${className} `}
        >
          <Download className="h-3.5 w-3.5 shrink-0" />
          <span>Install 7th Heaven App</span>
        </button>

        {showIosModal && <IosInstallModal onClose={() => setShowIosModal(false)} isIos={isIos} />}
      </>
    );
  }

  // Default Button Variant
  return (
    <>
      <SeventhButton
        type="button"
        onClick={handleInstallClick}
        icon={false}
        className={`cursor-pointer ${className} `}
      >
        <span className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Install 7th Heaven App
        </span>
      </SeventhButton>

      {showIosModal && <IosInstallModal onClose={() => setShowIosModal(false)} isIos={isIos} />}
    </>
  );
}

function IosInstallModal({ onClose, isIos }: { onClose: () => void; isIos: boolean }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="relative w-full max-w-md rounded-2xl border border-purple-500/40 bg-[#0d0d15] p-6 text-white shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="transition-colors absolute top-4 right-4 rounded-full border border-white/10 bg-white/5 p-1.5 text-white/50 hover:bg-white/10 hover:text-white"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-600/30 border border-purple-500/50 text-purple-300">
            <Smartphone className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg text-white">Install 7th Heaven App</h3>
            <p className="text-xs text-white/50">Add to your Home Screen for instant notifications</p>
          </div>
        </div>

        {isIos ? (
          <div className="space-y-4 my-5 text-sm text-white/80">
            <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-purple-500/20 text-purple-300 text-xs">
                1
              </div>
              <div>
                <p className="font-medium text-white">Tap the Share Button</p>
                <p className="text-xs text-white/50 mt-0.5 flex items-center gap-1.5">
                  Tap <Share2 className="inline h-3.5 w-3.5 text-purple-400" /> at the bottom or top of Safari.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-purple-500/20 text-purple-300 text-xs">
                2
              </div>
              <div>
                <p className="font-medium text-white">Select &quot;Add to Home Screen&quot;</p>
                <p className="text-xs text-white/50 mt-0.5 flex items-center gap-1.5">
                  Scroll down and tap <PlusSquare className="inline h-3.5 w-3.5 text-purple-400" /> <strong>Add to Home Screen</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-purple-500/20 text-purple-300 text-xs">
                3
              </div>
              <div>
                <p className="font-medium text-white">Tap &quot;Add&quot; in the top-right</p>
                <p className="text-xs text-white/50 mt-0.5">
                  The 7th Heaven icon will appear directly on your home screen.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="my-5 text-sm text-white/70 space-y-3">
            <p>
              To install this app on your device, open this site in <strong>Chrome</strong>, <strong>Edge</strong>, or <strong>Safari</strong> on your smartphone.
            </p>
            <p className="text-xs text-white/50">
              You can also click the install icon in your desktop browser address bar.
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-xl border border-purple-500/40 bg-purple-600/30 py-2.5 text-sm font-semibold text-white hover:bg-purple-600/50 transition-colors"
        >
          Got it!
        </button>
      </div>
    </div>
  );
}

export default InstallAppButton;
