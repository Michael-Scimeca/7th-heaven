"use client";

import React, { useState, useEffect } from 'react';
import { Sliders, X, RotateCcw, Copy, Check, Eye, EyeOff, Sparkles, Layers } from 'lucide-react';

export interface HeroMaskSettings {
  // Top Mask Gradient
  topFadeStart: number;      // % (0 - 50) default 0
  topFadeEnd: number;        // % (0 - 50) default 20
  
  // Bottom Mask Gradient
  bottomFadeStart: number;   // % (50 - 100) default 73
  bottomFadeEnd: number;     // % (50 - 100) default 100
  
  // Video Filters
  videoBlur: number;         // px (0 - 20)
  videoBrightness: number;   // % (50 - 150)
  videoContrast: number;     // % (50 - 150)
  videoOpacity: number;      // % (0 - 100)
  
  // Bottom ::before Blur Strip Overlay
  beforeHeight: number;      // px (0 - 200)
  beforeBlur: number;        // px (0 - 80)
  beforeBgOpacity: number;   // % (0 - 100)
  beforeZIndex: number;      // z-index (1 - 50)
}

export const DEFAULT_HERO_MASK_SETTINGS: HeroMaskSettings = {
  topFadeStart: 0,
  topFadeEnd: 15,
  bottomFadeStart: 73,
  bottomFadeEnd: 100,
  videoBlur: 0,
  videoBrightness: 90,
  videoContrast: 100,
  videoOpacity: 100,
  beforeHeight: 0,
  beforeBlur: 0,
  beforeBgOpacity: 85,
  beforeZIndex: 10,
};

export default function CruiseHeroMaskEditor() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const [settings, setSettings] = useState<HeroMaskSettings>(DEFAULT_HERO_MASK_SETTINGS);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem('7h_cruise_hero_mask_v3');
      if (saved) {
        setSettings({ ...DEFAULT_HERO_MASK_SETTINGS, ...JSON.parse(saved) });
      }
    } catch { }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    window.dispatchEvent(new CustomEvent('hero-mask-update', { detail: settings }));
  }, [settings, mounted]);

  const updateSetting = (key: keyof HeroMaskSettings, value: number) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    try {
      localStorage.setItem('7h_cruise_hero_mask_v3', JSON.stringify(settings));
      alert('Settings saved to browser storage!');
    } catch { }
  };

  const handleReset = () => {
    setSettings(DEFAULT_HERO_MASK_SETTINGS);
    try {
      localStorage.removeItem('7h_cruise_hero_mask_v3');
    } catch { }
  };

  const generateCSS = () => {
    return `/* 7th Heaven Hero Video Top & Bottom Mask CSS */
.hero-video-mask {
  mask-image: linear-gradient(to bottom, transparent 0%, black ${settings.topFadeEnd}%, black ${settings.bottomFadeStart}%, transparent ${settings.bottomFadeEnd}%);
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black ${settings.topFadeEnd}%, black ${settings.bottomFadeStart}%, transparent ${settings.bottomFadeEnd}%);
}

.hero-video-element {
  filter: blur(${settings.videoBlur}px) brightness(${settings.videoBrightness}%) contrast(${settings.videoContrast}%);
  -webkit-filter: blur(${settings.videoBlur}px) brightness(${settings.videoBrightness}%) contrast(${settings.videoContrast}%);
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
  };

  const copyCSS = () => {
    navigator.clipboard.writeText(generateCSS());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!mounted) return null;

  return (
    <>
      {/* Floating Studio Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-4 py-3 rounded-full shadow-[0_0_25px_rgba(6,182,212,0.6)] border border-cyan-300/40 flex items-center gap-2 transition-all hover:scale-105"
        >
          <Sliders className="w-5 h-5" />
          <span className="text-xs uppercase tracking-wider">HERO & CONTAINER CSS STUDIO</span>
        </button>
      )}

      {/* Main Drawer Panel */}
      {isOpen && (
        <div
          className="fixed top-[88px] right-4 w-96 max-w-[calc(100vw-2rem)] z-50 bg-[#0c101d]/95 backdrop-blur-xl border border-cyan-500/40 rounded-2xl shadow-[0_10px_50px_rgba(0,0,0,0.9)] text-white flex flex-col"
          style={{ height: 'calc(100vh - 110px)' }}
        >
          {/* Header */}
          <div className="p-4 border-b border-cyan-500/20 flex items-center justify-between bg-black/40 rounded-t-2xl shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center">
                <Sliders className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-cyan-300">HERO & MASK STUDIO</h3>
                <p className="text-[10px] text-gray-400">Top & Bottom Masking Studio</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleReset}
                title="Reset to Defaults"
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Scrollable Content Controls */}
          <div
            className="flex-1 overflow-y-scroll p-4 space-y-6"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#06b6d4 rgba(12, 16, 29, 0.8)',
            }}
          >
            {/* 1. TOP MASK GRADIENT */}
            <div className="bg-cyan-950/30 p-3.5 rounded-xl border border-cyan-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> TOP MASK GRADIENT
                </span>
                <span className="text-[10px] text-gray-400">Fade In</span>
              </div>

              {/* Top Fade Start */}
              <div>
                <div className="flex justify-between text-xs mb-1 font-medium">
                  <span className="text-gray-300">Top Fade Start</span>
                  <span className="text-cyan-400 font-mono">{settings.topFadeStart}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={settings.topFadeStart}
                  onChange={e => updateSetting('topFadeStart', Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-gray-700 rounded-lg"
                />
              </div>

              {/* Top Fade End */}
              <div>
                <div className="flex justify-between text-xs mb-1 font-medium">
                  <span className="text-gray-300">Top Fade End (Solid Black)</span>
                  <span className="text-cyan-400 font-mono">{settings.topFadeEnd}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={settings.topFadeEnd}
                  onChange={e => updateSetting('topFadeEnd', Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-gray-700 rounded-lg"
                />
              </div>
            </div>

            {/* 2. BOTTOM MASK GRADIENT */}
            <div className="bg-cyan-950/30 p-3.5 rounded-xl border border-cyan-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> BOTTOM MASK GRADIENT
                </span>
                <span className="text-[10px] text-gray-400">Fade Out</span>
              </div>

              {/* Bottom Fade Start */}
              <div>
                <div className="flex justify-between text-xs mb-1 font-medium">
                  <span className="text-gray-300">Bottom Fade Start</span>
                  <span className="text-cyan-400 font-mono">{settings.bottomFadeStart}%</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="95"
                  value={settings.bottomFadeStart}
                  onChange={e => updateSetting('bottomFadeStart', Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-gray-700 rounded-lg"
                />
              </div>

              {/* Bottom Fade End */}
              <div>
                <div className="flex justify-between text-xs mb-1 font-medium">
                  <span className="text-gray-300">Bottom Fade End (Transparent)</span>
                  <span className="text-cyan-400 font-mono">{settings.bottomFadeEnd}%</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="100"
                  value={settings.bottomFadeEnd}
                  onChange={e => updateSetting('bottomFadeEnd', Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-gray-700 rounded-lg"
                />
              </div>
            </div>

            {/* 3. VIDEO FILTERS */}
            <div className="bg-cyan-950/30 p-3.5 rounded-xl border border-cyan-500/20 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" /> VIDEO FILTERS
              </span>

              {/* Video Blur */}
              <div>
                <div className="flex justify-between text-xs mb-1 font-medium">
                  <span className="text-gray-300">Video Blur</span>
                  <span className="text-cyan-400 font-mono">{settings.videoBlur}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={settings.videoBlur}
                  onChange={e => updateSetting('videoBlur', Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-gray-700 rounded-lg"
                />
              </div>

              {/* Video Brightness */}
              <div>
                <div className="flex justify-between text-xs mb-1 font-medium">
                  <span className="text-gray-300">Brightness</span>
                  <span className="text-cyan-400 font-mono">{settings.videoBrightness}%</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="150"
                  value={settings.videoBrightness}
                  onChange={e => updateSetting('videoBrightness', Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-gray-700 rounded-lg"
                />
              </div>

              {/* Contrast */}
              <div>
                <div className="flex justify-between text-xs mb-1 font-medium">
                  <span className="text-gray-300">Contrast</span>
                  <span className="text-cyan-400 font-mono">{settings.videoContrast}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={settings.videoContrast}
                  onChange={e => updateSetting('videoContrast', Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-gray-700 rounded-lg"
                />
              </div>

              {/* Opacity */}
              <div>
                <div className="flex justify-between text-xs mb-1 font-medium">
                  <span className="text-gray-300">Opacity</span>
                  <span className="text-cyan-400 font-mono">{settings.videoOpacity}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={settings.videoOpacity}
                  onChange={e => updateSetting('videoOpacity', Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-gray-700 rounded-lg"
                />
              </div>
            </div>

            {/* 4. ::BEFORE BLUR STRIP OVERLAY */}
            <div className="bg-cyan-950/30 p-3.5 rounded-xl border border-cyan-500/20 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" /> ::BEFORE BLUR OVERLAY STRIP
              </span>

              {/* Strip Height */}
              <div>
                <div className="flex justify-between text-xs mb-1 font-medium">
                  <span className="text-gray-300">Strip Height</span>
                  <span className="text-cyan-400 font-mono">{settings.beforeHeight}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={settings.beforeHeight}
                  onChange={e => updateSetting('beforeHeight', Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-gray-700 rounded-lg"
                />
              </div>

              {/* Backdrop Blur */}
              <div>
                <div className="flex justify-between text-xs mb-1 font-medium">
                  <span className="text-gray-300">Backdrop Blur</span>
                  <span className="text-cyan-400 font-mono">{settings.beforeBlur}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  value={settings.beforeBlur}
                  onChange={e => updateSetting('beforeBlur', Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-gray-700 rounded-lg"
                />
              </div>

              {/* Dark Tint Opacity */}
              <div>
                <div className="flex justify-between text-xs mb-1 font-medium">
                  <span className="text-gray-300">Dark Tint Opacity</span>
                  <span className="text-cyan-400 font-mono">{settings.beforeBgOpacity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.beforeBgOpacity}
                  onChange={e => updateSetting('beforeBgOpacity', Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-gray-700 rounded-lg"
                />
              </div>

              {/* Z-Index */}
              <div>
                <div className="flex justify-between text-xs mb-1 font-medium">
                  <span className="text-gray-300">Z-Index Layer</span>
                  <span className="text-cyan-400 font-mono">{settings.beforeZIndex}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={settings.beforeZIndex}
                  onChange={e => updateSetting('beforeZIndex', Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-gray-700 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="p-3 border-t border-cyan-500/20 bg-black/50 rounded-b-2xl flex items-center gap-2 shrink-0">
            <button
              onClick={handleSave}
              className="flex-1 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all"
            >
              Save Changes
            </button>
            <button
              onClick={copyCSS}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy CSS'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
