'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export interface HeroMaskSettings {
  fadeStart: number;        // % (0 - 100)
  fadeEnd: number;          // % (0 - 100)
  maskAngle: string;        // 'to bottom' | 'to top' | 'to bottom right' | 'to bottom left'
  videoBlur: number;        // px (0 - 50)
  videoBrightness: number;  // % (50 - 150)
  videoContrast: number;    // % (50 - 150)
  videoOpacity: number;     // % (20 - 100)
  beforeHeight: number;     // px (0 - 150)
  beforeBlur: number;       // px (0 - 80)
  beforeBgOpacity: number;  // % (0 - 100)
  beforeZIndex: number;     // z-index (10 - 50)
}

export const DEFAULT_HERO_MASK_SETTINGS: HeroMaskSettings = {
  fadeStart: 50,
  fadeEnd: 85,
  maskAngle: 'to bottom',
  videoBlur: 0,
  videoBrightness: 100,
  videoContrast: 100,
  videoOpacity: 100,
  beforeHeight: 30,
  beforeBlur: 20,
  beforeBgOpacity: 85,
  beforeZIndex: 30,
};

export default function CruiseHeroMaskEditor() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<HeroMaskSettings>(DEFAULT_HERO_MASK_SETTINGS);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem('7h_cruise_hero_mask_v2');
      if (saved) {
        setSettings({ ...DEFAULT_HERO_MASK_SETTINGS, ...JSON.parse(saved) });
      }
    } catch {
      // Fallback
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.style.setProperty('--hero-mask-fade-start', `${settings.fadeStart}%`);
    root.style.setProperty('--hero-mask-fade-end', `${settings.fadeEnd}%`);
    root.style.setProperty('--hero-mask-angle', settings.maskAngle);
    root.style.setProperty('--hero-video-blur', `${settings.videoBlur}px`);
    root.style.setProperty('--hero-video-brightness', `${settings.videoBrightness}%`);
    root.style.setProperty('--hero-video-contrast', `${settings.videoContrast}%`);
    root.style.setProperty('--hero-video-opacity', `${settings.videoOpacity / 100}`);
    root.style.setProperty('--hero-before-height', `${settings.beforeHeight}px`);
    root.style.setProperty('--hero-before-blur', `${settings.beforeBlur}px`);
    root.style.setProperty('--hero-before-bg-opacity', `${settings.beforeBgOpacity / 100}`);
    root.style.setProperty('--hero-before-zindex', `${settings.beforeZIndex}`);

    // Broadcast live changes to window for immediate React state reactivity across page
    window.dispatchEvent(new CustomEvent('hero-mask-update', { detail: settings }));
  }, [settings, mounted]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleSaveChanges = () => {
    try {
      localStorage.setItem('7h_cruise_hero_mask_v2', JSON.stringify(settings));
      showToast('✓ Saved Permanently!');
    } catch {
      showToast('Error saving');
    }
  };

  const handleCopyCSS = () => {
    const cssSnippet = `/* 7th Heaven Hero Video Mask & ::before Blur CSS */
.hero-video-mask {
  mask-image: linear-gradient(${settings.maskAngle}, black 0%, black ${settings.fadeStart}%, transparent ${settings.fadeEnd}%);
  -webkit-mask-image: linear-gradient(${settings.maskAngle}, black 0%, black ${settings.fadeStart}%, transparent ${settings.fadeEnd}%);
}

.hero-video-element {
  filter: blur(${settings.videoBlur}px) brightness(${settings.videoBrightness}%) contrast(${settings.videoContrast}%);
  opacity: ${settings.videoOpacity / 100};
}

.hero-bottom-strip::before {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: ${settings.beforeHeight}px;
  z-index: ${settings.beforeZIndex};
  backdrop-filter: blur(${settings.beforeBlur}px);
  -webkit-backdrop-filter: blur(${settings.beforeBlur}px);
  background: linear-gradient(to bottom, transparent, rgba(6, 6, 12, ${settings.beforeBgOpacity / 100}));
}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(cssSnippet);
      showToast('📋 CSS Copied!');
    }
  };

  const updateSetting = <K extends keyof HeroMaskSettings>(key: K, value: HeroMaskSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const applyPreset = (preset: Partial<HeroMaskSettings>) => {
    setSettings(prev => ({ ...prev, ...preset }));
  };

  const handleReset = () => {
    setSettings(DEFAULT_HERO_MASK_SETTINGS);
    try {
      localStorage.removeItem('7h_cruise_hero_mask_v2');
    } catch {}
    showToast('🔄 Defaults Reset');
  };

  if (!mounted) return null;

  return (
    <>
      {/* Floating Gear Trigger Button */}
      <button
        aria-label="Edit Hero Video Masking & Blur Studio"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[150] px-4 py-3 bg-[#06060c] hover:bg-cyan-500 hover:text-black border-2 border-cyan-400 text-cyan-300 rounded-full font-mono text-xs font-black uppercase tracking-wider shadow-[0_0_30px_rgba(6,182,212,0.6)] backdrop-blur-md transition-all duration-300 flex items-center gap-2 cursor-pointer group"
      >
        <span className="text-base group-hover:rotate-90 transition-transform duration-500">⚙️</span>
        <span>Hero CSS Studio</span>
      </button>

      {/* Floating Settings Drawer Portal — 100% Solid Opaque Box to Prevent Text Bleed */}
      {isOpen && createPortal(
        <div className="fixed top-16 right-4 md:right-8 z-[200] w-full max-w-[420px] bg-[#06060e] border-2 border-cyan-400 text-white rounded-2xl flex flex-col h-[calc(100vh-100px)] max-h-[calc(100vh-100px)] shadow-[0_0_80px_rgba(0,0,0,1)] animate-fadeIn overflow-hidden opacity-100">
          {/* Style tag for guaranteed visible scrollbar */}
          <style>{`
            .hero-editor-scroll-area {
              overflow-y: scroll !important;
              scrollbar-width: thin !important;
              scrollbar-color: #06b6d4 #0c0c1a !important;
            }
            .hero-editor-scroll-area::-webkit-scrollbar {
              width: 10px !important;
              display: block !important;
            }
            .hero-editor-scroll-area::-webkit-scrollbar-track {
              background: #0c0c1a !important;
              border-radius: 6px !important;
            }
            .hero-editor-scroll-area::-webkit-scrollbar-thumb {
              background: #06b6d4 !important;
              border-radius: 6px !important;
              border: 2px solid #06060e !important;
              box-shadow: 0 0 10px rgba(6, 182, 212, 0.8) !important;
            }
            .hero-editor-scroll-area::-webkit-scrollbar-thumb:hover {
              background: #22d3ee !important;
            }
          `}</style>

          {/* STICKY OPAQUE HEADER */}
          <div className="p-4 border-b border-white/10 shrink-0 bg-[#06060e] flex items-center justify-between z-20">
            <div>
              <h3 className="text-base font-black uppercase tracking-tight text-white flex items-center gap-2">
                <span>🎬</span> Hero Video Mask & Blur Studio
              </h3>
              <p className="text-[11px] text-cyan-400 font-mono mt-0.5">Bottom Mask & ::before Blur Strip Controls</p>
            </div>
            <button
              aria-label="Close Mask Studio"
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-sm transition-colors cursor-pointer shrink-0"
            >
              ✕
            </button>
          </div>

          {/* DEDICATED SCROLLABLE BODY */}
          <div className="p-4 flex-1 min-h-0 overflow-y-scroll space-y-4 hero-editor-scroll-area bg-[#06060e]">
            {/* Action Bar (Save & Copy CSS) */}
            <div className="flex items-center gap-2 mb-2">
              <button
                aria-label="Save Changes Permanently"
                onClick={handleSaveChanges}
                className="flex-1 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs uppercase tracking-wider rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>💾</span>
                <span>Save Changes</span>
              </button>
              <button
                aria-label="Copy CSS Snippet"
                onClick={handleCopyCSS}
                className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                title="Copy CSS Code to Clipboard"
              >
                <span>📋</span>
                <span>Copy CSS</span>
              </button>
            </div>

            {/* Quick Presets */}
            <div className="bg-cyan-950/40 border border-cyan-500/40 p-3.5 rounded-xl">
              <span className="text-[var(--font-size-3xs)] font-black uppercase tracking-widest text-cyan-400 block mb-2">⚡ Quick Presets</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  aria-label="Apply Standard Ocean Mask Preset"
                  onClick={() => applyPreset({ fadeStart: 50, fadeEnd: 85, maskAngle: 'to bottom', videoBlur: 0, videoBrightness: 100, videoContrast: 100, videoOpacity: 100, beforeHeight: 30, beforeBlur: 20, beforeBgOpacity: 85, beforeZIndex: 30 })}
                  className="px-2.5 py-1.5 bg-white/5 hover:bg-cyan-500/20 border border-white/10 text-xs font-bold text-white rounded transition-colors text-left cursor-pointer"
                >
                  🌊 Standard Mask
                </button>
                <button
                  aria-label="Apply Soft Dreamy Blur Preset"
                  onClick={() => applyPreset({ fadeStart: 35, fadeEnd: 80, maskAngle: 'to bottom', videoBlur: 10, videoBrightness: 110, videoContrast: 95, videoOpacity: 90, beforeHeight: 45, beforeBlur: 30, beforeBgOpacity: 75, beforeZIndex: 35 })}
                  className="px-2.5 py-1.5 bg-white/5 hover:bg-cyan-500/20 border border-white/10 text-xs font-bold text-white rounded transition-colors text-left cursor-pointer"
                >
                  ✨ Soft Dream Blur
                </button>
                <button
                  aria-label="Apply Crisp Sharp Edge Preset"
                  onClick={() => applyPreset({ fadeStart: 75, fadeEnd: 100, maskAngle: 'to bottom', videoBlur: 0, videoBrightness: 100, videoContrast: 100, videoOpacity: 100, beforeHeight: 20, beforeBlur: 10, beforeBgOpacity: 90, beforeZIndex: 25 })}
                  className="px-2.5 py-1.5 bg-white/5 hover:bg-cyan-500/20 border border-white/10 text-xs font-bold text-white rounded transition-colors text-left cursor-pointer"
                >
                  🔍 Sharp Edge
                </button>
                <button
                  aria-label="Apply High-Z Max Blur Preset"
                  onClick={() => applyPreset({ fadeStart: 25, fadeEnd: 70, maskAngle: 'to bottom', videoBlur: 16, videoBrightness: 90, videoContrast: 110, videoOpacity: 85, beforeHeight: 60, beforeBlur: 45, beforeBgOpacity: 95, beforeZIndex: 40 })}
                  className="px-2.5 py-1.5 bg-white/5 hover:bg-cyan-500/20 border border-white/10 text-xs font-bold text-white rounded transition-colors text-left cursor-pointer"
                >
                  🔮 High-Z Max Blur
                </button>
              </div>
            </div>

            {/* CATEGORY 1: ::BEFORE BOTTOM BLUR STRIP CONTROLS */}
            <div className="space-y-3 pt-2">
              <span className="text-[11px] font-black uppercase tracking-widest text-cyan-400 block border-b border-cyan-500/30 pb-1">
                ✨ 1. Bottom ::before Blur Strip Over Video
              </span>

              {/* ::before Blur Filter (Primary requested blur control) */}
              <div className="space-y-1 bg-cyan-950/30 p-3 rounded-xl border border-cyan-500/40">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-cyan-300">✨ ::before Bottom Backdrop Blur</span>
                  <span className="font-mono text-cyan-400 font-black text-sm">{settings.beforeBlur}px</span>
                </div>
                <input
                  aria-label="Overlay Strip Backdrop Blur"
                  type="range"
                  min="0"
                  max="80"
                  step="1"
                  value={settings.beforeBlur}
                  onChange={e => updateSetting('beforeBlur', parseInt(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer h-2"
                />
                <p className="text-[10px] text-white/50">Backdrop-blur filter covering the bottom of the hero video.</p>
              </div>

              {/* ::before Height (Default 30px) */}
              <div className="space-y-1 bg-white/5 p-3 rounded-xl border border-white/10">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-cyan-300">📏 ::before Overlay Strip Height</span>
                  <span className="font-mono text-cyan-400 font-black text-sm">{settings.beforeHeight}px</span>
                </div>
                <input
                  aria-label="Overlay Strip Height in Pixels"
                  type="range"
                  min="0"
                  max="150"
                  step="1"
                  value={settings.beforeHeight}
                  onChange={e => updateSetting('beforeHeight', parseInt(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer h-2"
                />
                <p className="text-[10px] text-white/50">Height of 100% width bottom overlay strip (default 30px).</p>
              </div>

              {/* ::before Background Opacity */}
              <div className="space-y-1 bg-white/5 p-3 rounded-xl border border-white/10">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-cyan-300">::before Dark Tint Opacity</span>
                  <span className="font-mono text-cyan-400 font-black text-sm">{settings.beforeBgOpacity}%</span>
                </div>
                <input
                  aria-label="Overlay Strip Background Opacity"
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={settings.beforeBgOpacity}
                  onChange={e => updateSetting('beforeBgOpacity', parseInt(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer h-2"
                />
              </div>

              {/* ::before Z-Index */}
              <div className="space-y-1 bg-white/5 p-3 rounded-xl border border-white/10">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-cyan-300">::before Z-Index Layer</span>
                  <span className="font-mono text-cyan-400 font-black text-sm">z-{settings.beforeZIndex}</span>
                </div>
                <input
                  aria-label="Overlay Strip Z-Index Layer"
                  type="range"
                  min="10"
                  max="50"
                  step="1"
                  value={settings.beforeZIndex}
                  onChange={e => updateSetting('beforeZIndex', parseInt(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer h-2"
                />
              </div>
            </div>

            {/* CATEGORY 2: MASK CLIPPING GRADIENT CONTROLS */}
            <div className="space-y-3 pt-2">
              <span className="text-[11px] font-black uppercase tracking-widest text-cyan-400 block border-b border-cyan-500/30 pb-1">
                📐 2. Mask Clipping Gradient
              </span>

              {/* Mask Direction Angle */}
              <div className="space-y-1 bg-white/5 p-3 rounded-xl border border-white/10">
                <span className="font-bold text-xs text-cyan-300 block mb-1.5">🔄 Mask Gradient Direction</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { label: '⬇️ To Bottom', val: 'to bottom' },
                    { label: '⬆️ To Top', val: 'to top' },
                    { label: '↘️ Down-Right', val: 'to bottom right' },
                    { label: '↙️ Down-Left', val: 'to bottom left' },
                  ].map(item => (
                    <button
                      key={item.val}
                      aria-label={`Set Mask Direction to ${item.label}`}
                      onClick={() => updateSetting('maskAngle', item.val)}
                      className={`px-2 py-1.5 text-xs font-bold rounded border transition-colors cursor-pointer ${settings.maskAngle === item.val
                        ? 'bg-cyan-500 text-black border-cyan-400 font-black'
                        : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
                        }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mask Fade Start */}
              <div className="space-y-1 bg-white/5 p-3 rounded-xl border border-white/10">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-cyan-300">Start Fade (% Height)</span>
                  <span className="font-mono text-cyan-400 font-black">{settings.fadeStart}%</span>
                </div>
                <input
                  aria-label="Mask Fade Start Percentage"
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={settings.fadeStart}
                  onChange={e => updateSetting('fadeStart', parseInt(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer h-2"
                />
                <p className="text-[10px] text-white/50">Point where video starts fading out to transparent.</p>
              </div>

              {/* Mask Fade End */}
              <div className="space-y-1 bg-white/5 p-3 rounded-xl border border-white/10">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-cyan-300">End Fade (% Height)</span>
                  <span className="font-mono text-cyan-400 font-black">{settings.fadeEnd}%</span>
                </div>
                <input
                  aria-label="Mask Fade End Percentage"
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={settings.fadeEnd}
                  onChange={e => updateSetting('fadeEnd', parseInt(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer h-2"
                />
                <p className="text-[10px] text-white/50">Point where video is 100% transparently clipped.</p>
              </div>
            </div>

            {/* CATEGORY 3: VIDEO BLUR & EFFECTS CONTROLS */}
            <div className="space-y-3 pt-2">
              <span className="text-[11px] font-black uppercase tracking-widest text-cyan-400 block border-b border-cyan-500/30 pb-1">
                💧 3. Full Video Blur & FX Controls
              </span>

              {/* Video Blur */}
              <div className="space-y-1 bg-white/5 p-3 rounded-xl border border-white/10">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-cyan-300">Full Video Gaussian Blur</span>
                  <span className="font-mono text-cyan-400 font-black">{settings.videoBlur}px</span>
                </div>
                <input
                  aria-label="Video Blur Amount in Pixels"
                  type="range"
                  min="0"
                  max="50"
                  step="1"
                  value={settings.videoBlur}
                  onChange={e => updateSetting('videoBlur', parseInt(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer h-2"
                />
              </div>

              {/* Video Opacity */}
              <div className="space-y-1 bg-white/5 p-3 rounded-xl border border-white/10">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-cyan-300">Video Opacity</span>
                  <span className="font-mono text-cyan-400 font-black">{settings.videoOpacity}%</span>
                </div>
                <input
                  aria-label="Video Opacity Percentage"
                  type="range"
                  min="20"
                  max="100"
                  step="5"
                  value={settings.videoOpacity}
                  onChange={e => updateSetting('videoOpacity', parseInt(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer h-2"
                />
              </div>

              {/* Video Brightness */}
              <div className="space-y-1 bg-white/5 p-3 rounded-xl border border-white/10">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-cyan-300">Video Brightness</span>
                  <span className="font-mono text-cyan-400 font-black">{settings.videoBrightness}%</span>
                </div>
                <input
                  aria-label="Video Brightness Percentage"
                  type="range"
                  min="50"
                  max="150"
                  step="5"
                  value={settings.videoBrightness}
                  onChange={e => updateSetting('videoBrightness', parseInt(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer h-2"
                />
              </div>

              {/* Video Contrast */}
              <div className="space-y-1 bg-white/5 p-3 rounded-xl border border-white/10">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-cyan-300">Video Contrast</span>
                  <span className="font-mono text-cyan-400 font-black">{settings.videoContrast}%</span>
                </div>
                <input
                  aria-label="Video Contrast Percentage"
                  type="range"
                  min="50"
                  max="150"
                  step="5"
                  value={settings.videoContrast}
                  onChange={e => updateSetting('videoContrast', parseInt(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer h-2"
                />
              </div>
            </div>
          </div>

          {/* STICKY OPAQUE FOOTER WITH SAVE & RESET BUTTONS */}
          <div className="p-4 border-t border-white/10 shrink-0 bg-[#06060e] flex items-center justify-between z-20">
            <button
              aria-label="Reset All Hero CSS Settings"
              onClick={handleReset}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs uppercase tracking-wider rounded transition-colors cursor-pointer"
            >
              🔄 Reset
            </button>
            {toastMsg && <span className="text-xs font-bold text-cyan-400 animate-pulse">{toastMsg}</span>}
            <div className="flex items-center gap-2">
              <button
                aria-label="Save Changes"
                onClick={handleSaveChanges}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs uppercase tracking-wider rounded shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all cursor-pointer"
              >
                💾 Save
              </button>
              <button
                aria-label="Close Studio"
                onClick={() => setIsOpen(false)}
                className="px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white font-black text-xs uppercase tracking-wider rounded transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
