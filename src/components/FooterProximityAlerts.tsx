"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Bell, MapPin, Check, Sliders, Music, Sparkles } from "lucide-react";
import CosmicRadialButton from "@/components/CosmicRadialButton";

const RADIUS_OPTIONS = [
  { value: "15", label: "15 Miles" },
  { value: "30", label: "30 Miles" },
  { value: "50", label: "50 Miles" },
  { value: "100", label: "100 Miles" },
  { value: "all", label: "All Shows" },
];

const SHOW_TYPES = [
  { id: "all", label: "All Shows", icon: "🎸" },
  { id: "full", label: "Full Electric & Festivals", icon: "⚡" },
  { id: "acoustic", label: "Acoustic / Unplugged", icon: "🎤" },
  { id: "casino", label: "Casino & Special Events", icon: "🎰" },
  { id: "tickets", label: "Ticket Drops Only", icon: "🎟️" },
];

export default function FooterProximityAlerts() {
  const [zip, setZip] = useState("");
  const [radius, setRadius] = useState("50");
  const [scope, setScope] = useState("all");
  const [selectedTypes, setSelectedTypes] = useState<string[]>(["all"]);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">(
    typeof window !== "undefined" && "Notification" in window ? Notification.permission : "unsupported"
  );
  const [status, setStatus] = useState<"idle" | "saved">("idle");

  const toggleType = (id: string) => {
    if (id === "all") {
      setSelectedTypes(["all"]);
      return;
    }

    let next = selectedTypes.filter((t) => t !== "all");
    if (next.includes(id)) {
      next = next.filter((t) => t !== id);
    } else {
      next.push(id);
    }

    if (next.length === 0) {
      next = ["all"];
    }
    setSelectedTypes(next);
  };

  const handleEnableAlerts = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      try {
        const p = await Notification.requestPermission();
        setPermission(p);

        if (p === "granted" && "serviceWorker" in navigator) {
          const reg = await navigator.serviceWorker.register("/sw.js");
          // Save preference locally
          localStorage.setItem(
            "7h_alert_prefs",
            JSON.stringify({ zip, radius, selectedTypes })
          );
          setStatus("saved");
          setTimeout(() => setStatus("idle"), 4000);
        }
      } catch (err) {
        console.warn("Notification request failed:", err);
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-gradient-to-b from-[#1c0b2d]/95 via-[#130722]/95 to-[#0a0414]/98 p-6 sm:p-8 rounded-3xl border border-purple-500/30 shadow-2xl backdrop-blur-xl relative overflow-hidden z-20">
      {/* Background glow accent */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/40 shrink-0 shadow-lg">
            <Bell className="w-6 h-6 text-purple-400 animate-pulse" />
          </div>
          <div>
            <h3 className="font-[var(--font-heading)] text-lg sm:text-xl font-black uppercase tracking-tight text-white flex items-center gap-2">
              Proximity & Show Alert Filters
            </h3>
            <p className="text-xs text-purple-300/90 font-bold uppercase tracking-wider">
              Get notified only for shows within your distance & preferences
            </p>
          </div>
        </div>

        {permission === "granted" ? (
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black uppercase tracking-wider">
            <Check className="w-4 h-4 text-emerald-400" /> Push Enabled
          </span>
        ) : (
          <CosmicRadialButton
            icon={false}
            onClick={handleEnableAlerts}
            className="!px-5 !py-2.5 !text-xs !font-black uppercase tracking-wider rounded-xl shrink-0 cursor-pointer shadow-xl hover:scale-105 transition-all"
          >
            <Bell className="w-4 h-4" />
            Enable Alerts ({radius === "all" ? "All Distance" : `${radius} Mi`})
          </CosmicRadialButton>
        )}
      </div>

      {/* Input Row 1: Zip Code & Distance Radius */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 mb-6 relative z-10">
        {/* Zip Code Input */}
        <div className="sm:col-span-5">
          <label className="block text-[11px] font-black uppercase tracking-wider text-purple-300/80 mb-2 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-pink-400" /> Your Zip Code / City
          </label>
          <input
            type="text"
            value={zip}
            onChange={(e) => setZip(e.target.value)}
            placeholder="e.g. 60056 or Chicago"
            className="w-full bg-black/50 border border-purple-500/30 focus:border-pink-500/60 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none transition-colors"
          />
        </div>

        {/* Distance Radius Pills */}
        <div className="sm:col-span-7">
          <label className="block text-[11px] font-black uppercase tracking-wider text-purple-300/80 mb-2 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-purple-400" /> Maximum Distance Radius
          </label>
          <div className="flex flex-wrap gap-1.5">
            {RADIUS_OPTIONS.map((opt) => {
              const active = radius === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRadius(opt.value)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    active
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white border-pink-400 shadow-md scale-105"
                      : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Input Row 2: Show Type Filters */}
      <div className="mb-6 relative z-10">
        <label className="block text-[11px] font-black uppercase tracking-wider text-purple-300/80 mb-2 flex items-center gap-1.5">
          <Music className="w-3.5 h-3.5 text-cyan-400" /> Which Types of Show Notifications?
        </label>
        <div className="flex flex-wrap gap-2">
          {SHOW_TYPES.map((type) => {
            const isSelected = selectedTypes.includes(type.id);
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => toggleType(type.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  isSelected
                    ? "bg-purple-600/80 text-white border-purple-400 shadow-lg scale-105"
                    : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span>{type.icon}</span>
                <span>{type.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-pink-300 ml-0.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer helper notice */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-white/50 pt-4 border-t border-white/10 relative z-10">
        <p className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span>
            {radius === "all"
              ? "Receiving alerts for all 7th Heaven shows nationwide."
              : `Only alerting you when 7th Heaven plays within ${radius} miles${zip ? ` of ${zip}` : ""}.`}
          </span>
        </p>

        {status === "saved" ? (
          <span className="text-emerald-400 font-bold flex items-center gap-1 animate-pulse">
            <Check className="w-4 h-4" /> Preferences Saved!
          </span>
        ) : (
          <Link
            href="/notifications"
            className="text-purple-300 hover:text-pink-300 underline font-bold transition-colors text-right"
          >
            Manage All Alert Settings &rarr;
          </Link>
        )}
      </div>
    </div>
  );
}
