"use client";

import React, { useState } from "react";
import { useMember } from "@/context/MemberContext";
import { useThemeTokens } from "@/components/ThemeProvider";
import { colorToHex, updateColorFromPicker } from "@/lib/theme-tokens";

const MODAL_GLASS_STYLE: React.CSSProperties = {
  background: "var(--color-bg-glass, rgba(18, 18, 24, 0.75))",
  backdropFilter: "blur(32px) saturate(180%)",
  WebkitBackdropFilter: "blur(32px) saturate(180%)",
  border: "1px solid var(--color-border-main, rgba(255, 255, 255, 0.08))",
};

type TabType = "colors" | "typography" | "spacing" | "radii" | "shadows" | "preview" | "components";

export default function AdminThemeStyleGuidePage() {
  const { member, isLoggedIn, login, hydrated } = useMember();
  const {
    tokens,
    isSaving,
    hasUnsavedChanges,
    updateToken,
    saveTheme,
    resetToDefaults,
    exportThemeJson,
    importThemeJson,
  } = useThemeTokens();

  // Access control login states
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Modals & Tabs
  const [activeTab, setActiveTab] = useState<"colors" | "typography" | "spacing" | "radii" | "shadows" | "preview" | "components">("colors");
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importJsonText, setImportJsonText] = useState("");
  const [importError, setImportError] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [saveNotification, setSaveNotification] = useState<string | null>(null);

  // Dev bypass support matching /admin route pattern
  const isDevBypass = typeof window !== "undefined" && localStorage.getItem("7h_dev_bypass") === "true";
  const isAdmin = (isLoggedIn && member?.role === "admin") || isDevBypass;

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      const ok = await login(adminEmail, adminPassword);
      if (!ok) {
        setLoginError("Invalid credentials. Admin access required.");
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const enableDevBypass = () => {
    localStorage.setItem("7h_dev_bypass", "true");
    window.location.reload();
  };

  if (!hydrated) {
    return (
      <div className="min-h-screen   text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-400 font-mono">Initializing System Access...</p>
        </div>
      </div>
    );
  }

  // Access Gating Lock Screen
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#030006] text-white flex items-center justify-center p-4">
        <div className="w-full max-full max-w-md p-8 rounded-2xl" style={MODAL_GLASS_STYLE}>
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-purple-600/20 border border-purple-500/40 rounded-xl flex items-center justify-center mx-auto mb-3 text-purple-400 text-xl font-bold">
              🔒
            </div>
            <h1 className="text-2xl font-black uppercase tracking-wider font-[family-name:var(--font-family-display)]">
              Admin Theme Control
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Centralized Design System & Style Guide Gateway
            </p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40 rounded-lg text-xs text-red-300">
              {loginError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                Admin Email
              </label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500"
                placeholder="admin@7thheavenband.com"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-xs uppercase tracking-wider transition-all shadow-lg shadow-purple-600/30"
            >
              {loginLoading ? "Authenticating..." : "Unlock Control Center"}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-white/10 text-center">
            <button
              onClick={enableDevBypass}
              className="text-[11px] text-purple-400 hover:text-purple-300 underline font-mono cursor-pointer"
            >
              ⚡ Enable Developer Local Bypass
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Handle Save
  const handleSave = async () => {
    const ok = await saveTheme();
    if (ok) {
      setSaveNotification("Theme saved site-wide successfully!");
      setTimeout(() => setSaveNotification(null), 3000);
    } else {
      setSaveNotification("Error saving theme to disk.");
      setTimeout(() => setSaveNotification(null), 3000);
    }
  };

  // Handle Reset
  const handleReset = async () => {
    if (confirm("Are you sure you want to reset all design tokens back to factory defaults?")) {
      const ok = await resetToDefaults();
      if (ok) {
        setSaveNotification("Reset theme to defaults.");
        setTimeout(() => setSaveNotification(null), 3000);
      }
    }
  };

  // Handle Import Submit
  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setImportError("");
    const ok = await importThemeJson(importJsonText);
    if (!ok) {
      setImportError("Invalid JSON structure. Please verify token fields.");
    } else {
      setShowImportModal(false);
      setImportJsonText("");
      setSaveNotification("Imported theme tokens! Click Save to make permanent.");
      setTimeout(() => setSaveNotification(null), 4000);
    }
  };

  // Download JSON file
  const downloadThemeJson = () => {
    const jsonStr = exportThemeJson();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "7th-heaven-theme.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#030006] text-white pt-24 pb-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header & Controls Toolbar */}
        <div className="p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sticky top-20 z-40" style={MODAL_GLASS_STYLE}>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-black uppercase tracking-wider text-white font-[family-name:var(--font-family-display)]">
                Design System Control Center
              </h1>
              {hasUnsavedChanges && (
                <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded-full animate-pulse">
                  Unsaved Changes
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Single source of truth for site-wide colors, typography, spacing, border radiuses, and shadows.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all shadow-lg shadow-purple-600/30 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "💾 Save Site-Wide"}
            </button>
            <button
              onClick={() => setShowExportModal(true)}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer"
            >
              📤 Export JSON
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer"
            >
              📥 Import JSON
            </button>
            <button
              onClick={handleReset}
              className="px-3.5 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-300 font-bold text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer"
            >
              🔄 Reset Defaults
            </button>
          </div>
        </div>

        {saveNotification && (
          <div className="p-3 bg-purple-600/20 border border-purple-500/40 rounded-xl text-xs text-purple-200 text-center font-bold animate-fade-in">
            {saveNotification}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto gap-2 border-b border-white/10 pb-3">
          {[
            { id: "colors", label: "🎨 Colors" },
            { id: "typography", label: "🔤 Typography" },
            { id: "spacing", label: "📏 Spacing" },
            { id: "radii", label: "🔲 Border Radii" },
            { id: "shadows", label: "✨ Shadows" },
            { id: "preview", label: "👁️ Live Component Preview" },
            { id: "components", label: "🧩 Component Library" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${activeTab === tab.id
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                : "bg-white/5 hover:bg-white/10 text-gray-400"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: COLORS */}
        {activeTab === "colors" && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold uppercase text-purple-400 tracking-wider">
              Color Tokens ({Object.keys(tokens.colors).length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(tokens.colors).map(([varName, hexVal]) => (
                <div
                  key={varName}
                  className="p-4 rounded-xl space-y-3 border border-white/10 transition-all hover:border-purple-500/40"
                  style={{ background: "rgba(18, 18, 24, 0.5)" }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">{varName}</div>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">{hexVal}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="color"
                      value={colorToHex(hexVal)}
                      onChange={(e) => updateToken("colors", varName, updateColorFromPicker(hexVal, e.target.value))}
                      className="w-9 h-8 bg-transparent rounded cursor-pointer border border-white/20 p-0"
                    />
                    <input
                      type="text"
                      value={hexVal}
                      onChange={(e) => updateToken("colors", varName, e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-black/60 border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: TYPOGRAPHY */}
        {activeTab === "typography" && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold uppercase text-purple-400 tracking-wider">
              Typography Tokens ({Object.keys(tokens.typography).length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(tokens.typography).map(([varName, val]) => (
                <div
                  key={varName}
                  className="p-4 rounded-xl space-y-2 border border-white/10"
                  style={{ background: "rgba(18, 18, 24, 0.5)" }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white font-mono">{varName}</span>
                    <span className="text-xs text-purple-300 font-mono">{val}</span>
                  </div>
                  <input
                    type="text"
                    value={val}
                    onChange={(e) => updateToken("typography", varName, e.target.value)}
                    className="w-full px-3 py-1.5 bg-black/60 border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                  />
                  <div className="pt-2 text-xs truncate" style={{ fontStyle: "italic", fontSize: varName.startsWith("--font-size") ? val : "0.9rem" }}>
                    Sample Text Preview — 7th Heaven Rock Band
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: SPACING */}
        {activeTab === "spacing" && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold uppercase text-purple-400 tracking-wider">
              Spacing Scale Tokens ({Object.keys(tokens.spacing).length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(tokens.spacing).map(([varName, val]) => (
                <div
                  key={varName}
                  className="p-4 rounded-xl space-y-3 border border-white/10"
                  style={{ background: "rgba(18, 18, 24, 0.5)" }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white font-mono">{varName}</span>
                    <span className="text-xs text-purple-300 font-mono">{val}</span>
                  </div>
                  <input
                    type="text"
                    value={val}
                    onChange={(e) => updateToken("spacing", varName, e.target.value)}
                    className="w-full px-3 py-1.5 bg-black/60 border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                  />
                  <div className="h-4 bg-purple-600/30 border border-purple-500/50 rounded" style={{ width: val }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: BORDER RADII */}
        {activeTab === "radii" && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold uppercase text-purple-400 tracking-wider">
              Border Radius Tokens ({Object.keys(tokens.radii).length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(tokens.radii).map(([varName, val]) => (
                <div
                  key={varName}
                  className="p-4 rounded-xl space-y-3 border border-white/10"
                  style={{ background: "rgba(18, 18, 24, 0.5)" }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white font-mono">{varName}</span>
                    <span className="text-xs text-purple-300 font-mono">{val}</span>
                  </div>
                  <input
                    type="text"
                    value={val}
                    onChange={(e) => updateToken("radii", varName, e.target.value)}
                    className="w-full px-3 py-1.5 bg-black/60 border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                  />
                  <div className="w-full h-12 bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-xs font-mono text-purple-300" style={{ borderRadius: val }}>
                    Radius Preview ({val})
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: SHADOWS */}
        {activeTab === "shadows" && (
          <div className="space-y-8">
            <h2 className="text-lg font-bold uppercase text-purple-400 tracking-wider">
              Shadow Tokens ({Object.keys(tokens.shadows).length})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(tokens.shadows).map(([varName, val]) => (
                <div
                  key={varName}
                  className="p-5 rounded-xl space-y-4 border border-white/10"
                  style={{ background: "rgba(18, 18, 24, 0.6)" }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="text-xs font-bold text-white font-mono break-all">{varName}</span>
                    <span className="text-[11px] text-purple-300 font-mono truncate max-w-[200px]">{val}</span>
                  </div>

                  <input
                    type="text"
                    value={val}
                    onChange={(e) => updateToken("shadows", varName, e.target.value)}
                    className="w-full px-3.5 py-2 bg-black/80 border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                  />

                  {/* Rich Contrast Preview Container */}
                  <div className="p-6 rounded-xl bg-gradient-to-br from-[#1c1a29] to-[#0d0b18] border border-white/10 flex items-center justify-center min-h-[120px]">
                    <div
                      className="px-6 py-4 rounded-xl bg-[#232035] border border-white/15 text-center transition-all duration-300"
                      style={{ boxShadow: val }}
                    >
                      <div className="text-xs font-bold text-white font-mono">{varName}</div>
                      <div className="text-[10px] text-purple-300 mt-0.5">Live Box-Shadow Applied</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Real World Shadow Examples Showcase */}
            <div className="p-6 rounded-2xl border border-white/10 space-y-4" style={{ background: "rgba(15, 5, 29, 0.4)" }}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400">
                Real-World Component Shadow Examples
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                {/* Small Shadow Button */}
                <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2">
                  <div className="text-[10px] font-mono text-gray-400 uppercase">Button Drop Shadow (sm)</div>
                  <button
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                    style={{ boxShadow: tokens.shadows["--shadow-sm"] || "0 1px 2px rgba(0,0,0,0.05)" }}
                  >
                    Compact Action
                  </button>
                </div>

                {/* Medium Shadow Card */}
                <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2">
                  <div className="text-[10px] font-mono text-gray-400 uppercase">Card Elevation (md)</div>
                  <div
                    className="p-3 bg-[#1e1a30] rounded-lg border border-white/10 text-xs text-white"
                    style={{ boxShadow: tokens.shadows["--shadow-md"] || "0 4px 6px rgba(0,0,0,0.1)" }}
                  >
                    <div className="font-bold">Tour Concert Pass</div>
                    <div className="text-[10px] text-gray-400">Chicago Arena — Tier 1</div>
                  </div>
                </div>

                {/* Large Shadow Floating Surface */}
                <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2">
                  <div className="text-[10px] font-mono text-gray-400 uppercase">Floating Modal Surface (lg)</div>
                  <div
                    className="p-3 bg-[#26213d] rounded-lg border border-purple-500/30 text-xs text-purple-200"
                    style={{ boxShadow: tokens.shadows["--shadow-lg"] || "0 10px 15px rgba(0,0,0,0.1)" }}
                  >
                    <div className="font-bold">VIP Lounge Access</div>
                    <div className="text-[10px] text-purple-300">Backstage Pass Confirmed</div>
                  </div>
                </div>

                {/* Accent Glow Shadow */}
                <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2">
                  <div className="text-[10px] font-mono text-gray-400 uppercase">Accent Neon Glow</div>
                  <div
                    className="p-3 bg-purple-600 rounded-lg text-xs text-white font-bold text-center uppercase tracking-wider"
                    style={{ boxShadow: tokens.shadows["--shadow-accent-glow"] || "0 0 20px rgba(147,51,234,0.4)" }}
                  >
                    🔥 Live On Stage
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: LIVE PREVIEW */}
        {activeTab === "preview" && (
          <div className="space-y-8 p-6 rounded-2xl border border-white/10" style={{ background: "rgba(15, 5, 29, 0.4)" }}>
            <h2 className="text-xl font-black uppercase text-purple-400 tracking-wider font-[family-name:var(--font-family-display)]">
              Live Component Preview
            </h2>

            {/* Complete HTML Typography Hierarchy */}
            <div className="space-y-6 pb-8 border-b border-white/10">
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400">
                Full HTML Typography Hierarchy (H1–H6, P, UL, OL, Blockquote, Inline Elements)
              </h3>

              {/* Headings H1 to H6 */}
              <div className="space-y-4 p-5 rounded-xl border border-white/10 bg-black/40">
                <div>
                  <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest block mb-1">H1 Heading (Display / Main Title)</span>
                  <h1 className="text-4xl md:text-5xl font-black uppercase tracking-wider text-white font-[family-name:var(--font-family-display)]">
                    7th Heaven Official Tour 2026 (H1)
                  </h1>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest block mb-1">H2 Heading (Section Title)</span>
                  <h2 className="text-2xl md:text-3xl font-bold tracking-wide text-white font-[family-name:var(--font-family-heading)]">
                    Live Concert Performances & Festivals (H2)
                  </h2>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest block mb-1">H3 Heading (Subsection Header)</span>
                  <h3 className="text-xl font-semibold text-purple-300 font-[family-name:var(--font-family-heading)]">
                    Midwest Stage Schedule & VIP Ticket Packages (H3)
                  </h3>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest block mb-1">H4 Heading (Card / Group Title)</span>
                  <h4 className="text-lg font-bold text-white font-[family-name:var(--font-family-heading)]">
                    Chicago Festival Grounds — Main Arena (H4)
                  </h4>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest block mb-1">H5 Heading (Small Header)</span>
                  <h5 className="text-base font-semibold text-gray-200 font-[family-name:var(--font-family-heading)]">
                    Showtimes & Door Access Protocol (H5)
                  </h5>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest block mb-1">H6 Heading (Micro Eyebrow)</span>
                  <h6 className="text-xs font-bold uppercase tracking-widest text-purple-400 font-[family-name:var(--font-family-heading)]">
                    40 Years of Rocking the Midwest Scene (H6)
                  </h6>
                </div>
              </div>

              {/* Paragraphs */}
              <div className="space-y-4 p-5 rounded-xl border border-white/10 bg-black/40">
                <div>
                  <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest block mb-1">Lead Paragraph (&lt;p className=&quot;lead&quot;&gt;)</span>
                  <p className="text-lg leading-relaxed text-purple-100 font-medium">
                    7th Heaven is a legendary high-energy rock experience featuring 40 years of hits, 30-songs-in-30-minutes medleys, and chart-topping originals.
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest block mb-1">Standard Body Paragraph (&lt;p&gt;)</span>
                  <p className="text-base leading-normal text-gray-200">
                    Experience the ultimate live show packed with anthems, crowd interactions, and state-of-the-art stage visuals. Tickets and VIP passes are available for all upcoming Midwest tour dates.
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest block mb-1">Secondary / Muted Paragraph (&lt;p className=&quot;muted&quot;&gt;)</span>
                  <p className="text-sm leading-normal text-gray-400">
                    Doors open 90 minutes prior to showtime. General admission seating is first-come, first-served unless reserved VIP seating is purchased in advance.
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest block mb-1">Small Paragraph (&lt;small&gt; / &lt;p className=&quot;text-xs&quot;&gt;)</span>
                  <p className="text-xs text-gray-400">
                    * All ticket sales are final. Event details and schedules are subject to change based on weather or venue policies.
                  </p>
                </div>
              </div>

              {/* Lists (UL & OL) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl border border-white/10 bg-black/40 space-y-3">
                  <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest block">Unordered List (&lt;ul&gt; &amp; &lt;li&gt;)</span>
                  <ul className="list-disc list-inside space-y-1.5 text-sm text-gray-200">
                    <li>30 Songs in 30 Minutes World-Famous Medley</li>
                    <li>7 Major Radio Hits &amp; Billboard #1 Records</li>
                    <li>Over 40 Years of Non-Stop Live Performance</li>
                    <li>Exclusive Fan Club Meet &amp; Greet Access</li>
                  </ul>
                </div>

                <div className="p-5 rounded-xl border border-white/10 bg-black/40 space-y-3">
                  <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest block">Ordered List (&lt;ol&gt; &amp; &lt;li&gt;)</span>
                  <ol className="list-decimal list-inside space-y-1.5 text-sm text-gray-200">
                    <li>Arrival &amp; VIP Soundcheck Access</li>
                    <li>Merch Table Exclusive Vinyl Drop</li>
                    <li>Main Concert Performance</li>
                    <li>After-Show Fan Photo Session</li>
                  </ol>
                </div>
              </div>

              {/* Blockquote & Inline Formatting */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl border border-purple-500/30 bg-purple-950/20 space-y-2">
                  <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest block">Blockquote (&lt;blockquote&gt;)</span>
                  <blockquote className="border-l-4 border-purple-500 pl-4 py-1 italic text-sm text-purple-200">
                    &quot;7th Heaven is an experience you just have to see and hear! They pack every venue with unmatched energy.&quot;
                  </blockquote>
                  <cite className="block text-xs font-semibold text-purple-400 not-italic">— Midwest Rock Review</cite>
                </div>

                <div className="p-5 rounded-xl border border-white/10 bg-black/40 space-y-2">
                  <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest block">Inline Formatting Elements</span>
                  <div className="text-xs text-gray-300 space-y-1">
                    <div><strong>Strong Bold Text</strong> (&lt;strong&gt;)</div>
                    <div><em>Emphasized Italic Text</em> (&lt;em&gt;)</div>
                    <div><mark className="bg-purple-600/40 text-purple-200 px-1 rounded">Marked Highlight Text</mark> (&lt;mark&gt;)</div>
                    <div><code className="  border border-white/10 text-purple-300 px-1.5 py-0.5 rounded font-mono">var(--color-accent)</code> (&lt;code&gt;)</div>
                    <div><a href="#preview" className="text-purple-400 underline hover:text-purple-300">Interactive Anchor Link</a> (&lt;a&gt;)</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="space-y-3 pb-6 border-b border-white/10">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Buttons & Actions</h3>
              <div className="flex flex-wrap gap-3 items-center">
                <button className="px-5 py-2.5 bg-[var(--color-accent,#9333ea)] hover:opacity-90 text-white font-bold rounded-lg text-[13px] uppercase tracking-wider transition-all shadow-lg">
                  Primary Button
                </button>
                <button className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-[var(--color-border-main,rgba(255,255,255,0.15))] text-white font-bold rounded-lg text-[13px] uppercase tracking-wider transition-all">
                  Secondary Button
                </button>
                <button className="px-5 py-2.5 bg-transparent border border-[var(--color-accent,#9333ea)] text-purple-300 font-bold rounded-lg text-[13px] uppercase tracking-wider transition-all">
                  Outline Button
                </button>
                <button className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[13px] uppercase tracking-wider transition-all">
                  Success Action
                </button>
                <button className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-[13px] uppercase tracking-wider transition-all">
                  Danger Action
                </button>
              </div>
            </div>

            {/* Cards & Surfaces */}
            <div className="space-y-3 pb-6 border-b border-white/10">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Cards & Surface Containers</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-xl border border-[var(--color-border-main)]" style={{ background: "var(--color-bg-surface)" }}>
                  <div className="text-sm font-bold text-white mb-1">Surface Card</div>
                  <div className="text-xs text-gray-400">Base surface color with standard border custom properties.</div>
                </div>

                <div className="p-5 rounded-xl border border-[var(--color-border-purple)]" style={{ background: "var(--color-bg-glass)" }}>
                  <div className="text-sm font-bold text-purple-300 mb-1">Glassmorphic Card</div>
                  <div className="text-xs text-gray-400">Translucent glass card with glowing border tokens.</div>
                </div>

                <div className="p-5 rounded-xl border border-white/10" style={{ background: "var(--color-bg-card)" }}>
                  <div className="text-sm font-bold text-white mb-1">Elevated Card</div>
                  <div className="text-xs text-gray-400">Elevated card container for VIP badges and live show feeds.</div>
                </div>
              </div>
            </div>

            {/* Badges & Alerts */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Badges & Status Alerts</h3>
              <div className="flex flex-wrap gap-5 items-center">
                <span className="text-emerald-300 font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <span>✓</span> Tour Confirmed
                </span>
                <span className="text-amber-300 font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <span>⚠️</span> Selling Fast
                </span>
                <span className="text-red-400 font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <span>🔥</span> Sold Out
                </span>
                <span className="text-purple-300 font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  VIP Backstage
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: COMPONENT LIBRARY */}
        {activeTab === "components" && (
          <div className="space-y-10 p-6 rounded-2xl border border-white/10" style={{ background: "rgba(18, 18, 24, 0.6)" }}>
            <div>
              <h2 className="text-2xl font-black uppercase text-purple-400 tracking-wider font-[family-name:var(--font-family-display)]">
                Complete UI Component Library Showcase
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Live interactive showcase of all input fields, dropdowns, buttons, links, headings, cards, badges, alerts, and container components.
              </p>
            </div>

            {/* SECTION 1: FORM CONTROLS & INPUTS */}
            <div className="space-y-4 pb-8 border-b border-white/10">
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 font-mono">
                1. Form Controls, Inputs &amp; Dropdowns
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Standard Text Input */}
                <div className="p-4 border border-purple-500/20 bg-purple-950/20 backdrop-blur-md space-y-2">
                  <label className="text-xs font-semibold text-gray-200 block">Standard Text Input</label>
                  <input
                    type="text"
                    defaultValue="7th Heaven Fan Club"
                    placeholder="Enter venue or concert title..."
                    className="w-full px-3.5 py-2    /70 backdrop-blur-md border border-purple-500/30 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-400"
                  />
                  <span className="text-[10px] text-gray-400">Standard single-line text input field.</span>
                </div>

                {/* Email & Password Input */}
                <div className="p-4 border border-purple-500/20 bg-purple-950/20 backdrop-blur-md space-y-2">
                  <label className="text-xs font-semibold text-gray-200 block">Email Address Input</label>
                  <input
                    type="email"
                    defaultValue="vip@7thheavenband.com"
                    placeholder="name@domain.com"
                    className="w-full px-3.5 py-2    /70 backdrop-blur-md border border-purple-500/30 text-xs text-white focus:outline-none focus:border-purple-400"
                  />
                  <span className="text-[10px] text-gray-400 font-mono">type=&quot;email&quot;</span>
                </div>

                {/* Select Dropdown */}
                <div className="p-4 border border-purple-500/20 bg-purple-950/20 backdrop-blur-md space-y-2">
                  <label className="text-xs font-semibold text-gray-200 block">Dropdown Select Menu</label>
                  <div className="relative flex items-center">
                    <select className="w-full pl-3.5 pr-10 py-2    /70 backdrop-blur-md border border-purple-500/30 text-xs text-white focus:outline-none focus:border-purple-400 cursor-pointer appearance-none">
                      <option value="" className="    text-white">Select Midwest Tour Destination...</option>
                      <option value="chicago" className="    text-white">Chicago, IL — Festival Grounds</option>
                      <option value="milwaukee" className="    text-white">Milwaukee, WI — Summerfest Stage</option>
                      <option value="rockford" className="    text-white">Rockford, IL — Arena Center</option>
                      <option value="peoria" className="    text-white">Peoria, IL — Civic Center</option>
                    </select>
                    <svg className="absolute right-[20px] w-4 h-4 text-purple-300 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  <span className="text-[10px] text-gray-400">Custom styled HTML select element with chevron arrow 20px from right.</span>
                </div>

                {/* Search Input with Icon */}
                <div className="p-4 border border-purple-500/20 bg-purple-950/20 backdrop-blur-md space-y-2">
                  <label className="text-xs font-semibold text-gray-200 block">Search Field</label>
                  <div className="relative flex items-center">
                    <input
                      type="search"
                      placeholder="Search songs, albums, tour dates..."
                      className="w-full pl-9 pr-3.5 py-2    /70 backdrop-blur-md border border-purple-500/30 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-400"
                    />
                    <svg className="absolute left-3 w-4 h-4 text-purple-300 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <span className="text-[10px] text-gray-400">Search field with vector SVG magnifier icon.</span>
                </div>

                {/* Textarea */}
                <div className="p-4 border border-purple-500/20 bg-purple-950/20 backdrop-blur-md space-y-2">
                  <label className="text-xs font-semibold text-gray-200 block">Textarea Message Field</label>
                  <textarea
                    rows={2}
                    placeholder="Enter VIP request or booking inquiry..."
                    className="w-full px-3.5 py-2    /70 backdrop-blur-md border border-purple-500/30 text-xs text-white focus:outline-none focus:border-purple-400"
                    defaultValue="Looking forward to the upcoming 2026 tour!"
                  />
                  <span className="text-[10px] text-gray-400">Multi-line text input field.</span>
                </div>

                {/* Checkboxes, Radios & Switches */}
                <div className="p-4 border border-purple-500/20 bg-purple-950/20 backdrop-blur-md space-y-3">
                  <label className="text-xs font-semibold text-gray-200 block">Checkboxes &amp; Radios</label>
                  <div className="space-y-2 text-xs text-gray-300">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="accent-purple-600 w-4 h-4" />
                      <span>Subscribe to Tour Date Alerts</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="pass" defaultChecked className="accent-purple-600 w-4 h-4" />
                      <span>General Admission Pass</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="pass" className="accent-purple-600 w-4 h-4" />
                      <span>VIP Backstage Meet &amp; Greet</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: BUTTONS & ACTION TRIGGERS */}
            <div className="space-y-4 pb-8 border-b border-white/10">
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 font-mono">
                2. Buttons &amp; Interactive Action Triggers
              </h3>
              <div className="flex flex-wrap gap-4 items-center p-5 rounded-xl border border-white/10 bg-black/40">
                <button className="px-5 py-2.5 bg-[#9333ea] hover:bg-[#7e22ce] text-white font-bold text-[13px] uppercase tracking-wider transition-all shadow-md cursor-pointer">
                  Primary Button
                </button>
                <button className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-[13px] uppercase tracking-wider transition-all cursor-pointer">
                  Secondary Button
                </button>
                <button className="px-5 py-2.5 bg-transparent border border-[#9333ea] text-purple-300 hover:bg-[#9333ea]/20 font-bold text-[13px] uppercase tracking-wider transition-all cursor-pointer">
                  Outline Button
                </button>
                <button className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[13px] uppercase tracking-wider transition-all cursor-pointer">
                  Success Action
                </button>
                <button className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-[13px] uppercase tracking-wider transition-all cursor-pointer">
                  Danger Action
                </button>
                <button className="px-5 py-2.5 bg-[#9333ea] text-white font-bold text-[13px] uppercase tracking-wider rounded-full transition-all cursor-pointer">
                  Pill Button (rounded-full)
                </button>
                <button disabled className="px-5 py-2.5 bg-gray-800 border border-gray-700 text-gray-500 font-bold text-[13px] uppercase tracking-wider cursor-not-allowed">
                  Disabled State
                </button>
              </div>
            </div>

            {/* SECTION 3: LINKS & NAVIGATION */}
            <div className="space-y-4 pb-8 border-b border-white/10">
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 font-mono">
                3. Hyperlinks &amp; Navigation Elements
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Hyperlinks */}
                <div className="p-4 rounded-xl border border-white/10 bg-black/40 space-y-2">
                  <span className="text-[10px] font-mono text-gray-400 uppercase block">Hyperlinks (&lt;a&gt;)</span>
                  <div className="space-y-1 text-xs">
                    <div><a href="#components" className="text-purple-400 underline hover:text-purple-300">Primary Accent Anchor Link</a></div>
                    <div><a href="#components" className="text-gray-300 hover:text-white underline">Secondary Body Link</a></div>
                    <div><a href="#components" className="text-gray-500 hover:text-purple-400 transition-colors">Muted Footer Nav Link →</a></div>
                  </div>
                </div>

                {/* Breadcrumbs */}
                <div className="p-4 rounded-xl border border-white/10 bg-black/40 space-y-2">
                  <span className="text-[10px] font-mono text-gray-400 uppercase block">Breadcrumb Navigation</span>
                  <nav className="flex items-center gap-1.5 text-xs text-gray-400">
                    <a href="#components" className="hover:text-purple-400">Home</a>
                    <span>/</span>
                    <a href="#components" className="hover:text-purple-400">Admin</a>
                    <span>/</span>
                    <span className="text-purple-300 font-semibold">Style Guide</span>
                  </nav>
                </div>

                {/* Pagination */}
                <div className="p-4 rounded-xl border border-white/10 bg-black/40 space-y-2">
                  <span className="text-[10px] font-mono text-gray-400 uppercase block">Pagination Control</span>
                  <div className="flex items-center gap-1.5 text-xs">
                    <button className="px-2.5 py-1   border border-white/10 text-gray-400">‹ Prev</button>
                    <button className="px-2.5 py-1 bg-purple-600 text-white font-bold">1</button>
                    <button className="px-2.5 py-1   border border-white/10 text-gray-300">2</button>
                    <button className="px-2.5 py-1   border border-white/10 text-gray-300">3</button>
                    <button className="px-2.5 py-1   border border-white/10 text-gray-400">Next ›</button>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 4: BADGES, TAGS & ALERT BANNERS */}
            <div className="space-y-4 pb-8 border-b border-white/10">
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 font-mono">
                4. Badges, Status Tags &amp; Alert Banners
              </h3>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-5 items-center">
                  <span className="text-purple-300 font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                    <span>🔥</span> Live Stream Active
                  </span>
                  <span className="text-emerald-300 font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                    <span>✓</span> Tour Date Confirmed
                  </span>
                  <span className="text-amber-300 font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                    <span>⚠️</span> Low Ticket Warning
                  </span>
                  <span className="text-red-400 font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                    <span>⛔</span> Sold Out
                  </span>
                </div>

                {/* Alert Banners */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-purple-950/30 border border-purple-500/40 text-purple-200 text-xs space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-purple-300">
                      ℹ️ Design System Token Sync Active
                    </div>
                    <div>Changes saved to disk instantly apply across all pages.</div>
                  </div>

                  <div className="p-4 bg-emerald-950/30 border border-emerald-500/40 text-emerald-200 text-xs space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-emerald-300">
                      ✓ Tour Schedule Published
                    </div>
                    <div>Midwest 2026 concert dates are live for ticket orders.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 5: MODALS & CONTAINER SURFACES */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 font-mono">
                5. Modal Containers &amp; Dialog Surfaces
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 border border-purple-500/30 bg-purple-950/20 space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-xs font-bold text-purple-300">VIP Concert Ticket Dialog</span>
                    <span className="text-xs text-gray-500 cursor-pointer">✕</span>
                  </div>
                  <p className="text-xs text-gray-300">
                    Modal surface container with backdrop filter styling and standardized header action triggers.
                  </p>
                  <div className="flex justify-end gap-2 pt-2">
                    <button className="px-3.5 py-1.5 bg-white/10 text-white font-semibold text-xs">Cancel</button>
                    <button className="px-3.5 py-1.5 bg-purple-600 text-white font-bold text-xs">Confirm VIP</button>
                  </div>
                </div>

                <div className="p-5 border border-white/10 bg-black/40 space-y-3">
                  <div className="text-xs font-bold text-white">Collapsible Accordion Item</div>
                  <div className="p-3 bg-white/5 border border-white/10 text-xs text-gray-300">
                    <div className="font-semibold text-purple-300 mb-1">What songs are included in the 30-in-30 medley?</div>
                    <div className="text-[11px] text-gray-400">
                      7th Heaven performs 30 classic rock anthems back-to-back in 30 high-octane minutes!
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xl p-6 rounded-2xl space-y-4" style={MODAL_GLASS_STYLE}>
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white">Export Theme Tokens (JSON)</h3>
              <button onClick={() => setShowExportModal(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <textarea
              readOnly
              value={exportThemeJson()}
              className="w-full h-64 p-3 bg-black/80 border border-white/10 rounded-xl font-mono text-xs text-purple-300 focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(exportThemeJson());
                  setCopySuccess(true);
                  setTimeout(() => setCopySuccess(false), 2000);
                }}
                className="px-4 py-2 bg-purple-600 text-white font-bold text-xs rounded-lg uppercase cursor-pointer"
              >
                {copySuccess ? "✓ Copied!" : "📋 Copy to Clipboard"}
              </button>
              <button
                onClick={downloadThemeJson}
                className="px-4 py-2 bg-white/10 text-white font-bold text-xs rounded-lg uppercase cursor-pointer"
              >
                💾 Download JSON
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xl p-6 rounded-2xl space-y-4" style={MODAL_GLASS_STYLE}>
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white">Import Theme Tokens (JSON)</h3>
              <button onClick={() => setShowImportModal(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            {importError && (
              <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-lg text-xs text-red-300">
                {importError}
              </div>
            )}

            <textarea
              placeholder="Paste custom theme.json structure here..."
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              className="w-full h-64 p-3 bg-black/80 border border-white/10 rounded-xl font-mono text-xs text-white focus:outline-none focus:border-purple-500"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={handleImportSubmit}
                className="px-4 py-2 bg-purple-600 text-white font-bold text-xs rounded-lg uppercase cursor-pointer"
              >
                Apply Imported Theme
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
