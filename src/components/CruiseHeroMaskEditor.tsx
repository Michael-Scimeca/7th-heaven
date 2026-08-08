'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export interface HeroMaskSettings {
  fadeStart: number;      // % (0 - 100)
  fadeEnd: number;        // % (50 - 100)
  videoBlur: number;      // px (0 - 40)
  beforeHeight: number;   // px (10 - 100)
  beforeBlur: number;     // px (0 - 60)
  beforeZIndex: number;   // z-index (10 - 50)
  maskOpacity: number;    // % (0 - 100)
}

export const DEFAULT_HERO_MASK_SETTINGS: HeroMaskSettings = {
  fadeStart: 65,
  fadeEnd: 100,
  videoBlur: 0,
  beforeHeight: 30,
  beforeBlur: 20,
  beforeZIndex: 30,
  maskOpacity: 100,
};

export default function CruiseHeroMaskEditor() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<HeroMaskSettings>(DEFAULT_HERO_MASK_SETTINGS);
  const [saveToast, setSaveToast] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem('7h_cruise_hero_mask_v1');
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
    root.style.setProperty('--hero-video-blur', `${settings.videoBlur}px`);
    root.style.setProperty('--hero-before-height', `${settings.beforeHeight}px`);
    root.style.setProperty('--hero-before-blur', `${settings.beforeBlur}px`);
    root.style.setProperty('--hero-before-zindex', `${settings.beforeZIndex}`);
    root.style.setProperty('--hero-mask-opacity', `${settings.maskOpacity / 100}`);

    try {
      localStorage.setItem('7h_cruise_hero_mask_v1', JSON.stringify(settings));
    } catch {
      // Ignore
    }
  }, [settings, mounted]);

  const updateSetting = <K extends keyof HeroMaskSettings>(key: K, value: number) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const applyPreset = (preset: Partial<HeroMaskSettings>) => {
    setSettings(prev => ({ ...prev, ...preset }));
  };

  const handleReset = () => {
    setSettings(DEFAULT_HERO_MASK_SETTINGS);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  if (!mounted) return null;

  return (
    <>
      {/* Floating Gear Trigger Button */}
      <button
        aria-label="Edit Hero Video Masking & Blur"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-[#06060c]/90 hover:bg-cyan-500 hover:text-black border border-cyan-400/50 text-cyan-300 rounded-full font-mono text-xs font-black uppercase tracking-wider shadow-[0_0_25px_rgba(6,182,212,0.4)] backdrop-blur-md transition-all duration-300 flex items-center gap-2 cursor-pointer group"
      >
        <span className="text-base group-hover:rotate-90 transition-transform duration-500">⚙️</span>
        <span>Hero Mask & Blur Tool</span>
      </button>

      {/* Floating Settings Drawer Portal */}
      {isOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex justify-end pointer-events-none p-4 md:p-6 animate-fadeIn">
          {/* Style tag for visible custom scrollbar */}
          <style>{`
            .custom-hero-editor-scroll::-webkit-scrollbar {
              width: 8px !important;
              display: block !important;
            }
            .custom-hero-editor-scroll::-webkit-scrollbar-track {
              background: rgba(255, 255, 255, 0.08) !important;
              border-radius: 4px !important;
            }
            .custom-hero-editor-scroll::-webkit-scrollbar-thumb {
              background: #06b6d4 !important;
              border-radius: 4px !important;
              box-shadow: 0 0 10px rgba(6, 182, 212, 0.6) !important;
            }
          `}</style>
          <div className="pointer-events-auto w-full max-w-md bg-[#080810]/95 backdrop-blur-2xl border border-cyan-500/40 text-white h-[calc(100vh-120px)] max-h-[calc(100vh-120px)] my-auto overflow-y-auto p-6 flex flex-col justify-between shadow-[0_0_50px_rgba(0,0,0,0.85)] rounded-2xl custom-hero-editor-scroll">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-white">🎬 Hero Video Mask & Blur Editor</h3>
                  <p className="text-xs text-cyan-400 font-mono mt-0.5">Live Adjust Hero Clipping Mask, Blur & ::before Strip</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Quick Presets */}
              <div className="mb-6 bg-cyan-950/20 border border-cyan-500/20 p-4 rounded-xl">
                <span className="text-[var(--font-size-3xs)] font-black uppercase tracking-widest text-cyan-400 block mb-2">⚡ Quick Presets</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => applyPreset({ fadeStart: 60, fadeEnd: 100, videoBlur: 0, beforeHeight: 30, beforeBlur: 20, beforeZIndex: 30 })}
                    className="px-3 py-2 bg-white/5 hover:bg-cyan-500/20 border border-white/10 text-xs font-bold text-white rounded transition-colors text-left"
                  >
                    🌊 Standard Ocean Mask
                  </button>
                  <button
                    onClick={() => applyPreset({ fadeStart: 40, fadeEnd: 90, videoBlur: 8, beforeHeight: 45, beforeBlur: 30, beforeZIndex: 35 })}
                    className="px-3 py-2 bg-white/5 hover:bg-cyan-500/20 border border-white/10 text-xs font-bold text-white rounded transition-colors text-left"
                  >
                    ✨ Soft Dreamy Blur
                  </button>
                  <button
                    onClick={() => applyPreset({ fadeStart: 80, fadeEnd: 100, videoBlur: 0, beforeHeight: 20, beforeBlur: 10, beforeZIndex: 25 })}
                    className="px-3 py-2 bg-white/5 hover:bg-cyan-500/20 border border-white/10 text-xs font-bold text-white rounded transition-colors text-left"
                  >
                    🔍 Crisp Sharp Edge
                  </button>
                  <button
                    onClick={() => applyPreset({ fadeStart: 30, fadeEnd: 100, videoBlur: 14, beforeHeight: 60, beforeBlur: 40, beforeZIndex: 40 })}
                    className="px-3 py-2 bg-white/5 hover:bg-cyan-500/20 border border-white/10 text-xs font-bold text-white rounded transition-colors text-left"
                  >
                    🔮 High-Z Max Blur
                  </button>
                </div>
              </div>

              {/* Slider Controls */}
              <div className="space-y-5">
                {/* 1. Bottom Mask Fade Start */}
                <div className="space-y-1.5 bg-white/5 p-3.5 rounded-xl border border-white/10">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-cyan-300">📐 Mask Fade Start (% Height)</span>
                    <span className="font-mono text-cyan-400 font-bold">{settings.fadeStart}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={settings.fadeStart}
                    onChange={e => updateSetting('fadeStart', parseInt(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                  <p className="text-[var(--font-size-4xs)] text-white/50">Point where the bottom clipping gradient starts fading out.</p>
                </div>

                {/* 2. Bottom Mask Fade End */}
                <div className="space-y-1.5 bg-white/5 p-3.5 rounded-xl border border-white/10">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-cyan-300">🏁 Mask Fade End (% Height)</span>
                    <span className="font-mono text-cyan-400 font-bold">{settings.fadeEnd}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    step="1"
                    value={settings.fadeEnd}
                    onChange={e => updateSetting('fadeEnd', parseInt(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                  <p className="text-[var(--font-size-4xs)] text-white/50">Point where the video completely clips to transparent.</p>
                </div>

                {/* 3. Hero Video Blur */}
                <div className="space-y-1.5 bg-white/5 p-3.5 rounded-xl border border-white/10">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-cyan-300">💧 Video Backdrop Blur (px)</span>
                    <span className="font-mono text-cyan-400 font-bold">{settings.videoBlur}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    step="1"
                    value={settings.videoBlur}
                    onChange={e => updateSetting('videoBlur', parseInt(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                  <p className="text-[var(--font-size-4xs)] text-white/50">Applies Gaussian blur directly to the playing hero video element.</p>
                </div>

                {/* 4. ::before Strip Height (30px Default) */}
                <div className="space-y-1.5 bg-white/5 p-3.5 rounded-xl border border-white/10">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-cyan-300">📏 ::before Overlay Strip Height</span>
                    <span className="font-mono text-cyan-400 font-bold">{settings.beforeHeight}px</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="1"
                    value={settings.beforeHeight}
                    onChange={e => updateSetting('beforeHeight', parseInt(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                  <p className="text-[var(--font-size-4xs)] text-white/50">Height of the 100% width bottom ::before blur overlay strip (default 30px).</p>
                </div>

                {/* 5. ::before Strip Backdrop Blur */}
                <div className="space-y-1.5 bg-white/5 p-3.5 rounded-xl border border-white/10">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-cyan-300">✨ ::before Backdrop Blur Filter</span>
                    <span className="font-mono text-cyan-400 font-bold">{settings.beforeBlur}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="60"
                    step="1"
                    value={settings.beforeBlur}
                    onChange={e => updateSetting('beforeBlur', parseInt(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                  <p className="text-[var(--font-size-4xs)] text-white/50">Backdrop-blur amount applied to the bottom ::before strip.</p>
                </div>

                {/* 6. ::before Strip Z-Index */}
                <div className="space-y-1.5 bg-white/5 p-3.5 rounded-xl border border-white/10">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-cyan-300">🥞 ::before Strip Z-Index</span>
                    <span className="font-mono text-cyan-400 font-bold">z-{settings.beforeZIndex}</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    step="1"
                    value={settings.beforeZIndex}
                    onChange={e => updateSetting('beforeZIndex', parseInt(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                  <p className="text-[var(--font-size-4xs)] text-white/50">Z-Index layer for the ::before blur strip.</p>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="border-t border-white/10 pt-4 mt-6 flex items-center justify-between">
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs uppercase tracking-wider rounded transition-colors cursor-pointer"
              >
                🔄 Reset
              </button>
              {saveToast && <span className="text-xs font-bold text-cyan-400 animate-pulse">✓ Saved!</span>}
              <button
                onClick={() => setIsOpen(false)}
                className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs uppercase tracking-wider rounded shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-colors cursor-pointer"
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
