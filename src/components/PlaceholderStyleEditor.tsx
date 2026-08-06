"use client";

import React, { useState, useEffect } from "react";

// Compute final RGBA color string for placeholder
const hexToRgba = (hex: string, alphaPercent: number) => {
  let cleanHex = hex.replace("#", "");
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split("").map(c => c + c).join("");
  }
  const r = parseInt(cleanHex.substring(0, 2), 16) || 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 255;
  const a = (alphaPercent / 100).toFixed(2);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};
interface _PSEProps {
  isFloating: boolean;
  setIsOpen: (v: boolean) => void;
  textColorHex: string;
  setTextColorHex: React.Dispatch<React.SetStateAction<string>>;
  placeholderColorHex: string;
  setPlaceholderColorHex: React.Dispatch<React.SetStateAction<string>>;
  placeholderOpacity: number;
  setPlaceholderOpacity: React.Dispatch<React.SetStateAction<number>>;
  setIsTransparentBg: React.Dispatch<React.SetStateAction<boolean>>;
  setBgColor: React.Dispatch<React.SetStateAction<string>>;
  isTransparentBg: boolean;
  bgHex: string;
  setBgHex: React.Dispatch<React.SetStateAction<string>>;
  fontSize: number;
  setFontSize: React.Dispatch<React.SetStateAction<number>>;
  setFontWeight: React.Dispatch<React.SetStateAction<any>>;
  fontWeight: string;
  setTextTransform: React.Dispatch<React.SetStateAction<any>>;
  textTransform: string;
  resetDefaults: () => void;
  cssCode: string;
  handleCopy: () => void;
  copied: boolean;
}
function PlaceholderStyleEditorSection8461Section5476Section4403Section3567Section2925Part98797Part83135Part17168Part27284Part72178Part67225Part31181Part10681Part13256Part90893Sub705Sub706Sub707Sub708Sub709Sub710Sub711Sub712Sub713Sub714Sub715Sub716Sub717Sub718Sub719Sub720Sub721Sub722Sub723Sub724Section233({
  isFloating,
  setIsOpen,
  textColorHex,
  setTextColorHex,
  placeholderColorHex,
  setPlaceholderColorHex,
  placeholderOpacity,
  setPlaceholderOpacity,
  setIsTransparentBg,
  setBgColor,
  isTransparentBg,
  bgHex,
  setBgHex,
  fontSize,
  setFontSize,
  setFontWeight,
  fontWeight,
  setTextTransform,
  textTransform,
  resetDefaults,
  cssCode,
  handleCopy,
  copied
}: _PSEProps) {
  return <div className="bg-[#0f071a] border border-purple-500/30 rounded-2xl p-6 text-white shadow-2xl space-y-6 max-w-xl w-full text-left font-sans max-h-[90vh] overflow-y-auto custom-scrollbar">
    {/* Header */}
    <div className="flex items-center justify-between border-b border-white/10 pb-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 font-bold text-sm">
          Aa
        </div>
        <div>
          <h3 className="font-extrabold text-white uppercase tracking-wider text-sm">Global Textbox & Placeholder Style Editor</h3>
          <p className="text-white/50 text-xs">Configure font color, placeholder color, font size & background color</p>
        </div>
      </div>
      {isFloating && <button type="button" onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white font-bold p-1 rounded hover:bg-white/10 transition-colors cursor-pointer" aria-label="Action button">

        ✕
      </button>}
    </div>

    {/* Live Interactive Preview Box */}
    <div className="bg-black/40 border border-white/10 p-4 rounded-xl space-y-3">
      <span className="text-xs font-bold uppercase tracking-widest  text-[var(--color-accent)] block">Live Interactive Preview</span>
      <div className="space-y-3">
        <div>
          <label htmlFor="ctrl-placeholderstyleeditor-156" className="text-[10px] text-white/50 block mb-1 uppercase font-bold tracking-wider">Email Textbox Input</label>
          <input aria-label="eg fan7thheavenbandcom" id="ctrl-placeholderstyleeditor-156" type="text" placeholder="e.g. fan@7thheavenband.com" defaultValue="John Doe (Live Typed Text)" className="w-full border border-white/20 px-3 py-2 rounded-lg outline-none transition-colors" />

        </div>

        <div>
          <label htmlFor="ctrl-placeholderstyleeditor-157" className="text-[10px] text-white/50 block mb-1 uppercase font-bold tracking-wider">Textarea Input</label>
          <textarea aria-label="Write your emergency broadcast message text here" id="ctrl-placeholderstyleeditor-157" rows={2} placeholder="Write your emergency broadcast message text here..." defaultValue="ALERT: 7th Heaven show tonight moved to 8:00 PM!" className="w-full border border-white/20 px-3 py-2 rounded-lg outline-none transition-colors resize-none" />

        </div>
      </div>
    </div>

    {/* Controls Form Grid */}
    <div className="space-y-5">
      {/* 1. Font Color (Text Color) */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-white/70 block mb-2">1. Font Color (Input Text Color)</span>
        <div className="flex items-center gap-3">
          <input aria-label="Color input" type="color" value={textColorHex} onChange={e => setTextColorHex(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border border-white/20 p-1 shrink-0" />

          <input aria-label="Text input" type="text" value={textColorHex} onChange={e => setTextColorHex(e.target.value)} className="w-28 bg-white/5 border border-white/15 px-3 py-1.5 rounded-lg text-xs font-mono text-white font-bold uppercase" />

          <div className="flex flex-wrap gap-1.5">
            {[{
              label: "White",
              hex: "#ffffff"
            }, {
              label: "Light Gray",
              hex: "#e4e4e7"
            }, {
              label: "Purple",
              hex: "#c084fc"
            }, {
              label: "Cyan",
              hex: "#38bdf8"
            }, {
              label: "Amber",
              hex: "#fbbf24"
            }].map(p => <button key={p.label} type="button" onClick={() => setTextColorHex(p.hex)} className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-bold text-white/80 rounded-md transition-colors cursor-pointer" aria-label="Action button">

              {p.label}
            </button>)}
          </div>
        </div>
      </div>

      {/* 2. Placeholder Color & Opacity */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-white/70 block mb-2">2. Placeholder Color & Opacity</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <input aria-label="Color input" type="color" value={placeholderColorHex} onChange={e => setPlaceholderColorHex(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border border-white/20 p-1 shrink-0" />

            <input aria-label="Text input" type="text" value={placeholderColorHex} onChange={e => setPlaceholderColorHex(e.target.value)} className="w-28 bg-white/5 border border-white/15 px-3 py-1.5 rounded-lg text-xs font-mono text-white font-bold uppercase" />

          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">Opacity</span>
              <span className="font-mono text-xs font-bold text-purple-300">{placeholderOpacity}%</span>
            </div>
            <input aria-label="Range control" type="range" min="10" max="100" value={placeholderOpacity} onChange={e => setPlaceholderOpacity(Number(e.target.value))} className="w-full accent-purple-500 cursor-pointer" />

          </div>
        </div>
      </div>

      {/* 3. Background Color */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-white/70 block mb-2">3. Background Color</span>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => {
              setIsTransparentBg(true);
              setBgColor("transparent");
            }} className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${isTransparentBg ? "bg-purple-600 border-purple-500 text-white shadow-md" : "bg-white/5 border-white/10 text-white/60 hover:text-white"}`}>

              Transparent
            </button>
            <button type="button" onClick={() => {
              setIsTransparentBg(false);
              setBgColor(bgHex);
            }} className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${!isTransparentBg ? "bg-purple-600 border-purple-500 text-white shadow-md" : "bg-white/5 border-white/10 text-white/60 hover:text-white"}`}>

              Custom Solid Color
            </button>
          </div>

          {!isTransparentBg && <div className="flex items-center gap-3 pt-1">
            <input aria-label="Color input" type="color" value={bgHex} onChange={e => {
              setBgHex(e.target.value);
              setBgColor(e.target.value);
            }} className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border border-white/20 p-1 shrink-0" />

            <input aria-label="Text input" type="text" value={bgHex} onChange={e => {
              setBgHex(e.target.value);
              setBgColor(e.target.value);
            }} className="w-28 bg-white/5 border border-white/15 px-3 py-1.5 rounded-lg text-xs font-mono text-white font-bold uppercase" />

          </div>}
        </div>
      </div>

      {/* 4. Font Size */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-white/70">4. Font Size</span>
          <span className="font-mono text-xs font-bold text-purple-300">{fontSize}px</span>
        </div>
        <input aria-label="Range control" type="range" min="10" max="24" value={fontSize} onChange={e => setFontSize(Number(e.target.value))} className="w-full accent-purple-500 cursor-pointer" />

      </div>

      {/* 5. Font Weight & Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-white/60 block mb-2">Font Weight</span>
          <div className="grid grid-cols-2 gap-2">
            {[{
              label: "Normal (400)",
              val: "400"
            }, {
              label: "Medium (500)",
              val: "500"
            }, {
              label: "SemiBold (600)",
              val: "600"
            }, {
              label: "Bold (700)",
              val: "700"
            }].map(w => <button key={w.val} type="button" onClick={() => setFontWeight(w.val)} className={`py-1.5 text-xs font-bold rounded-lg border transition-colors cursor-pointer text-center ${fontWeight === w.val ? "bg-purple-600 border-purple-500 text-white shadow-md" : "bg-white/5 border-white/10 text-white/60 hover:text-white"}`} aria-label="Action button">

              {w.label}
            </button>)}
          </div>
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-white/60 block mb-2">Text Transform</span>
          <div className="grid grid-cols-2 gap-2">
            {(["none", "uppercase"] as const).map(tr => <button key={tr} type="button" onClick={() => setTextTransform(tr)} className={`py-1.5 text-xs font-bold capitalize rounded-lg border transition-colors cursor-pointer text-center ${textTransform === tr ? "bg-purple-600 border-purple-500 text-white shadow-md" : "bg-white/5 border-white/10 text-white/60 hover:text-white"}`} aria-label="Action button">

              {tr}
            </button>)}
          </div>
        </div>
      </div>
    </div>

    {/* Generated CSS Block & Actions */}
    <div className="pt-4 border-t border-white/10 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-widest text-white/60">Generated CSS Code</span>
        <button type="button" onClick={resetDefaults} className="text-xs  text-[var(--color-accent)] hover:underline font-bold cursor-pointer">

          Reset Defaults
        </button>
      </div>
      <pre className="bg-black/60 border border-white/10 p-3 rounded-lg text-xs font-mono text-purple-300 overflow-x-auto">
        {cssCode}
      </pre>
      <button type="button" onClick={handleCopy} className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-colors shadow-lg cursor-pointer flex items-center justify-center gap-2" aria-label="Action button">

        {copied ? "✓ CSS Copied to Clipboard!" : "Copy CSS Code"}
      </button>
    </div>
  </div>;
}
function PlaceholderStyleEditorSection8461Section5476Section4403Section3567Section2925Part98797Part83135Part17168Part27284Part72178Part67225Part31181Part10681Part13256Part90893Sub705Sub706Sub707Sub708Sub709Sub710Sub711Sub712Sub713Sub714Sub715Sub716Sub717Sub718Sub719Sub720Sub721Sub722Sub723Sub724({
  isFloating,
  setIsOpen,
  textColorHex,
  setTextColorHex,
  placeholderColorHex,
  setPlaceholderColorHex,
  placeholderOpacity,
  setPlaceholderOpacity,
  setIsTransparentBg,
  setBgColor,
  isTransparentBg,
  bgHex,
  setBgHex,
  fontSize,
  setFontSize,
  setFontWeight,
  fontWeight,
  setTextTransform,
  textTransform,
  resetDefaults,
  cssCode,
  handleCopy,
  copied
}: _PSEProps) {
  return <PlaceholderStyleEditorSection8461Section5476Section4403Section3567Section2925Part98797Part83135Part17168Part27284Part72178Part67225Part31181Part10681Part13256Part90893Sub705Sub706Sub707Sub708Sub709Sub710Sub711Sub712Sub713Sub714Sub715Sub716Sub717Sub718Sub719Sub720Sub721Sub722Sub723Sub724Section233 isFloating={isFloating} setIsOpen={setIsOpen} textColorHex={textColorHex} setTextColorHex={setTextColorHex} placeholderColorHex={placeholderColorHex} setPlaceholderColorHex={setPlaceholderColorHex} placeholderOpacity={placeholderOpacity} setPlaceholderOpacity={setPlaceholderOpacity} setIsTransparentBg={setIsTransparentBg} setBgColor={setBgColor} isTransparentBg={isTransparentBg} bgHex={bgHex} setBgHex={setBgHex} fontSize={fontSize} setFontSize={setFontSize} setFontWeight={setFontWeight} fontWeight={fontWeight} setTextTransform={setTextTransform} textTransform={textTransform} resetDefaults={resetDefaults} cssCode={cssCode} handleCopy={handleCopy} copied={copied} />;
}
function PlaceholderStyleEditorSection8461Section5476Section4403Section3567Section2925Part98797Part83135Part17168Part27284Part72178Part67225Part31181Part10681Part13256Part90893Sub705Sub706Sub707Sub708Sub709Sub710Sub711Sub712Sub713Sub714Sub715Sub716Sub717Sub718Sub719Sub720Sub721Sub722Sub723({
  isFloating,
  setIsOpen,
  textColorHex,
  setTextColorHex,
  placeholderColorHex,
  setPlaceholderColorHex,
  placeholderOpacity,
  setPlaceholderOpacity,
  setIsTransparentBg,
  setBgColor,
  isTransparentBg,
  bgHex,
  setBgHex,
  fontSize,
  setFontSize,
  setFontWeight,
  fontWeight,
  setTextTransform,
  textTransform,
  resetDefaults,
  cssCode,
  handleCopy,
  copied
}: _PSEProps) {
  return <PlaceholderStyleEditorSection8461Section5476Section4403Section3567Section2925Part98797Part83135Part17168Part27284Part72178Part67225Part31181Part10681Part13256Part90893Sub705Sub706Sub707Sub708Sub709Sub710Sub711Sub712Sub713Sub714Sub715Sub716Sub717Sub718Sub719Sub720Sub721Sub722Sub723Sub724 isFloating={isFloating} setIsOpen={setIsOpen} textColorHex={textColorHex} setTextColorHex={setTextColorHex} placeholderColorHex={placeholderColorHex} setPlaceholderColorHex={setPlaceholderColorHex} placeholderOpacity={placeholderOpacity} setPlaceholderOpacity={setPlaceholderOpacity} setIsTransparentBg={setIsTransparentBg} setBgColor={setBgColor} isTransparentBg={isTransparentBg} bgHex={bgHex} setBgHex={setBgHex} fontSize={fontSize} setFontSize={setFontSize} setFontWeight={setFontWeight} fontWeight={fontWeight} setTextTransform={setTextTransform} textTransform={textTransform} resetDefaults={resetDefaults} cssCode={cssCode} handleCopy={handleCopy} copied={copied} />;
}
function PlaceholderStyleEditorSection8461Section5476Section4403Section3567Section2925Part98797Part83135Part17168Part27284Part72178Part67225Part31181Part10681Part13256Part90893Sub705Sub706Sub707Sub708Sub709Sub710Sub711Sub712Sub713Sub714Sub715Sub716Sub717Sub718Sub719Sub720Sub721Sub722({
  isFloating,
  setIsOpen,
  textColorHex,
  setTextColorHex,
  placeholderColorHex,
  setPlaceholderColorHex,
  placeholderOpacity,
  setPlaceholderOpacity,
  setIsTransparentBg,
  setBgColor,
  isTransparentBg,
  bgHex,
  setBgHex,
  fontSize,
  setFontSize,
  setFontWeight,
  fontWeight,
  setTextTransform,
  textTransform,
  resetDefaults,
  cssCode,
  handleCopy,
  copied
}: _PSEProps) {
  return <PlaceholderStyleEditorSection8461Section5476Section4403Section3567Section2925Part98797Part83135Part17168Part27284Part72178Part67225Part31181Part10681Part13256Part90893Sub705Sub706Sub707Sub708Sub709Sub710Sub711Sub712Sub713Sub714Sub715Sub716Sub717Sub718Sub719Sub720Sub721Sub722Sub723 isFloating={isFloating} setIsOpen={setIsOpen} textColorHex={textColorHex} setTextColorHex={setTextColorHex} placeholderColorHex={placeholderColorHex} setPlaceholderColorHex={setPlaceholderColorHex} placeholderOpacity={placeholderOpacity} setPlaceholderOpacity={setPlaceholderOpacity} setIsTransparentBg={setIsTransparentBg} setBgColor={setBgColor} isTransparentBg={isTransparentBg} bgHex={bgHex} setBgHex={setBgHex} fontSize={fontSize} setFontSize={setFontSize} setFontWeight={setFontWeight} fontWeight={fontWeight} setTextTransform={setTextTransform} textTransform={textTransform} resetDefaults={resetDefaults} cssCode={cssCode} handleCopy={handleCopy} copied={copied} />;
}
function PlaceholderStyleEditorSection8461Section5476Section4403Section3567Section2925Part98797Part83135Part17168Part27284Part72178Part67225Part31181Part10681Part13256Part90893Sub705Sub706Sub707Sub708Sub709Sub710Sub711Sub712Sub713Sub714Sub715Sub716Sub717Sub718Sub719Sub720Sub721({
  isFloating,
  setIsOpen,
  textColorHex,
  setTextColorHex,
  placeholderColorHex,
  setPlaceholderColorHex,
  placeholderOpacity,
  setPlaceholderOpacity,
  setIsTransparentBg,
  setBgColor,
  isTransparentBg,
  bgHex,
  setBgHex,
  fontSize,
  setFontSize,
  setFontWeight,
  fontWeight,
  setTextTransform,
  textTransform,
  resetDefaults,
  cssCode,
  handleCopy,
  copied
}: _PSEProps) {
  return <PlaceholderStyleEditorSection8461Section5476Section4403Section3567Section2925Part98797Part83135Part17168Part27284Part72178Part67225Part31181Part10681Part13256Part90893Sub705Sub706Sub707Sub708Sub709Sub710Sub711Sub712Sub713Sub714Sub715Sub716Sub717Sub718Sub719Sub720Sub721Sub722 isFloating={isFloating} setIsOpen={setIsOpen} textColorHex={textColorHex} setTextColorHex={setTextColorHex} placeholderColorHex={placeholderColorHex} setPlaceholderColorHex={setPlaceholderColorHex} placeholderOpacity={placeholderOpacity} setPlaceholderOpacity={setPlaceholderOpacity} setIsTransparentBg={setIsTransparentBg} setBgColor={setBgColor} isTransparentBg={isTransparentBg} bgHex={bgHex} setBgHex={setBgHex} fontSize={fontSize} setFontSize={setFontSize} setFontWeight={setFontWeight} fontWeight={fontWeight} setTextTransform={setTextTransform} textTransform={textTransform} resetDefaults={resetDefaults} cssCode={cssCode} handleCopy={handleCopy} copied={copied} />;
}
function PlaceholderStyleEditorSection8461Section5476Section4403Section3567Section2925Part98797Part83135Part17168Part27284Part72178Part67225Part31181Part10681Part13256Part90893Sub705Sub706Sub707Sub708Sub709Sub710Sub711Sub712Sub713Sub714Sub715Sub716Sub717Sub718Sub719Sub720({
  isFloating,
  setIsOpen,
  textColorHex,
  setTextColorHex,
  placeholderColorHex,
  setPlaceholderColorHex,
  placeholderOpacity,
  setPlaceholderOpacity,
  setIsTransparentBg,
  setBgColor,
  isTransparentBg,
  bgHex,
  setBgHex,
  fontSize,
  setFontSize,
  setFontWeight,
  fontWeight,
  setTextTransform,
  textTransform,
  resetDefaults,
  cssCode,
  handleCopy,
  copied
}: _PSEProps) {
  return <PlaceholderStyleEditorSection8461Section5476Section4403Section3567Section2925Part98797Part83135Part17168Part27284Part72178Part67225Part31181Part10681Part13256Part90893Sub705Sub706Sub707Sub708Sub709Sub710Sub711Sub712Sub713Sub714Sub715Sub716Sub717Sub718Sub719Sub720Sub721 isFloating={isFloating} setIsOpen={setIsOpen} textColorHex={textColorHex} setTextColorHex={setTextColorHex} placeholderColorHex={placeholderColorHex} setPlaceholderColorHex={setPlaceholderColorHex} placeholderOpacity={placeholderOpacity} setPlaceholderOpacity={setPlaceholderOpacity} setIsTransparentBg={setIsTransparentBg} setBgColor={setBgColor} isTransparentBg={isTransparentBg} bgHex={bgHex} setBgHex={setBgHex} fontSize={fontSize} setFontSize={setFontSize} setFontWeight={setFontWeight} fontWeight={fontWeight} setTextTransform={setTextTransform} textTransform={textTransform} resetDefaults={resetDefaults} cssCode={cssCode} handleCopy={handleCopy} copied={copied} />;
}
function PlaceholderStyleEditorSection8461Section5476Section4403Section3567Section2925Part98797Part83135Part17168Part27284Part72178Part67225Part31181Part10681Part13256Part90893Sub705Sub706Sub707Sub708Sub709Sub710Sub711Sub712Sub713Sub714Sub715Sub716Sub717Sub718Sub719({
  isFloating,
  setIsOpen,
  textColorHex,
  setTextColorHex,
  placeholderColorHex,
  setPlaceholderColorHex,
  placeholderOpacity,
  setPlaceholderOpacity,
  setIsTransparentBg,
  setBgColor,
  isTransparentBg,
  bgHex,
  setBgHex,
  fontSize,
  setFontSize,
  setFontWeight,
  fontWeight,
  setTextTransform,
  textTransform,
  resetDefaults,
  cssCode,
  handleCopy,
  copied
}: _PSEProps) {
  return <PlaceholderStyleEditorSection8461Section5476Section4403Section3567Section2925Part98797Part83135Part17168Part27284Part72178Part67225Part31181Part10681Part13256Part90893Sub705Sub706Sub707Sub708Sub709Sub710Sub711Sub712Sub713Sub714Sub715Sub716Sub717Sub718Sub719Sub720 isFloating={isFloating} setIsOpen={setIsOpen} textColorHex={textColorHex} setTextColorHex={setTextColorHex} placeholderColorHex={placeholderColorHex} setPlaceholderColorHex={setPlaceholderColorHex} placeholderOpacity={placeholderOpacity} setPlaceholderOpacity={setPlaceholderOpacity} setIsTransparentBg={setIsTransparentBg} setBgColor={setBgColor} isTransparentBg={isTransparentBg} bgHex={bgHex} setBgHex={setBgHex} fontSize={fontSize} setFontSize={setFontSize} setFontWeight={setFontWeight} fontWeight={fontWeight} setTextTransform={setTextTransform} textTransform={textTransform} resetDefaults={resetDefaults} cssCode={cssCode} handleCopy={handleCopy} copied={copied} />;
}
function PlaceholderStyleEditorSection8461Section5476Section4403Section3567Section2925Part98797Part83135Part17168Part27284Part72178Part67225Part31181Part10681Part13256Part90893Sub705Sub706Sub707Sub708Sub709Sub710Sub711Sub712Sub713Sub714Sub715Sub716Sub717Sub718({
  isFloating,
  setIsOpen,
  textColorHex,
  setTextColorHex,
  placeholderColorHex,
  setPlaceholderColorHex,
  placeholderOpacity,
  setPlaceholderOpacity,
  setIsTransparentBg,
  setBgColor,
  isTransparentBg,
  bgHex,
  setBgHex,
  fontSize,
  setFontSize,
  setFontWeight,
  fontWeight,
  setTextTransform,
  textTransform,
  resetDefaults,
  cssCode,
  handleCopy,
  copied
}: _PSEProps) {
  return <PlaceholderStyleEditorSection8461Section5476Section4403Section3567Section2925Part98797Part83135Part17168Part27284Part72178Part67225Part31181Part10681Part13256Part90893Sub705Sub706Sub707Sub708Sub709Sub710Sub711Sub712Sub713Sub714Sub715Sub716Sub717Sub718Sub719 isFloating={isFloating} setIsOpen={setIsOpen} textColorHex={textColorHex} setTextColorHex={setTextColorHex} placeholderColorHex={placeholderColorHex} setPlaceholderColorHex={setPlaceholderColorHex} placeholderOpacity={placeholderOpacity} setPlaceholderOpacity={setPlaceholderOpacity} setIsTransparentBg={setIsTransparentBg} setBgColor={setBgColor} isTransparentBg={isTransparentBg} bgHex={bgHex} setBgHex={setBgHex} fontSize={fontSize} setFontSize={setFontSize} setFontWeight={setFontWeight} fontWeight={fontWeight} setTextTransform={setTextTransform} textTransform={textTransform} resetDefaults={resetDefaults} cssCode={cssCode} handleCopy={handleCopy} copied={copied} />;
}
function PlaceholderStyleEditorSection8461Section5476Section4403Section3567Section2925Part98797Part83135Part17168Part27284Part72178Part67225Part31181Part10681Part13256Part90893Sub705Sub706Sub707Sub708Sub709Sub710Sub711Sub712Sub713Sub714Sub715Sub716Sub717({
  isFloating,
  setIsOpen,
  textColorHex,
  setTextColorHex,
  placeholderColorHex,
  setPlaceholderColorHex,
  placeholderOpacity,
  setPlaceholderOpacity,
  setIsTransparentBg,
  setBgColor,
  isTransparentBg,
  bgHex,
  setBgHex,
  fontSize,
  setFontSize,
  setFontWeight,
  fontWeight,
  setTextTransform,
  textTransform,
  resetDefaults,
  cssCode,
  handleCopy,
  copied
}: _PSEProps) {
  return <PlaceholderStyleEditorSection8461Section5476Section4403Section3567Section2925Part98797Part83135Part17168Part27284Part72178Part67225Part31181Part10681Part13256Part90893Sub705Sub706Sub707Sub708Sub709Sub710Sub711Sub712Sub713Sub714Sub715Sub716Sub717Sub718 isFloating={isFloating} setIsOpen={setIsOpen} textColorHex={textColorHex} setTextColorHex={setTextColorHex} placeholderColorHex={placeholderColorHex} setPlaceholderColorHex={setPlaceholderColorHex} placeholderOpacity={placeholderOpacity} setPlaceholderOpacity={setPlaceholderOpacity} setIsTransparentBg={setIsTransparentBg} setBgColor={setBgColor} isTransparentBg={isTransparentBg} bgHex={bgHex} setBgHex={setBgHex} fontSize={fontSize} setFontSize={setFontSize} setFontWeight={setFontWeight} fontWeight={fontWeight} setTextTransform={setTextTransform} textTransform={textTransform} resetDefaults={resetDefaults} cssCode={cssCode} handleCopy={handleCopy} copied={copied} />;
}
function PlaceholderStyleEditorSection8461Section5476Section4403Section3567Section2925Part98797Part83135Part17168Part27284Part72178Part67225Part31181Part10681Part13256Part90893Sub705Sub706Sub707Sub708Sub709Sub710Sub711Sub712Sub713Sub714Sub715Sub716({
  isFloating,
  setIsOpen,
  textColorHex,
  setTextColorHex,
  placeholderColorHex,
  setPlaceholderColorHex,
  placeholderOpacity,
  setPlaceholderOpacity,
  setIsTransparentBg,
  setBgColor,
  isTransparentBg,
  bgHex,
  setBgHex,
  fontSize,
  setFontSize,
  setFontWeight,
  fontWeight,
  setTextTransform,
  textTransform,
  resetDefaults,
  cssCode,
  handleCopy,
  copied
}: _PSEProps) {
  return <PlaceholderStyleEditorSection8461Section5476Section4403Section3567Section2925Part98797Part83135Part17168Part27284Part72178Part67225Part31181Part10681Part13256Part90893Sub705Sub706Sub707Sub708Sub709Sub710Sub711Sub712Sub713Sub714Sub715Sub716Sub717 isFloating={isFloating} setIsOpen={setIsOpen} textColorHex={textColorHex} setTextColorHex={setTextColorHex} placeholderColorHex={placeholderColorHex} setPlaceholderColorHex={setPlaceholderColorHex} placeholderOpacity={placeholderOpacity} setPlaceholderOpacity={setPlaceholderOpacity} setIsTransparentBg={setIsTransparentBg} setBgColor={setBgColor} isTransparentBg={isTransparentBg} bgHex={bgHex} setBgHex={setBgHex} fontSize={fontSize} setFontSize={setFontSize} setFontWeight={setFontWeight} fontWeight={fontWeight} setTextTransform={setTextTransform} textTransform={textTransform} resetDefaults={resetDefaults} cssCode={cssCode} handleCopy={handleCopy} copied={copied} />;
}
function PlaceholderStyleEditorSection8461Section5476Section4403Section3567Section2925Part98797Part83135Part17168Part27284Part72178Part67225Part31181Part10681Part13256Part90893Sub705Sub706Sub707Sub708Sub709Sub710Sub711Sub712Sub713Sub714Sub715({
  isFloating,
  setIsOpen,
  textColorHex,
  setTextColorHex,
  placeholderColorHex,
  setPlaceholderColorHex,
  placeholderOpacity,
  setPlaceholderOpacity,
  setIsTransparentBg,
  setBgColor,
  isTransparentBg,
  bgHex,
  setBgHex,
  fontSize,
  setFontSize,
  setFontWeight,
  fontWeight,
  setTextTransform,
  textTransform,
  resetDefaults,
  cssCode,
  handleCopy,
  copied
}: _PSEProps) {
  return <PlaceholderStyleEditorSection8461Section5476Section4403Section3567Section2925Part98797Part83135Part17168Part27284Part72178Part67225Part31181Part10681Part13256Part90893Sub705Sub706Sub707Sub708Sub709Sub710Sub711Sub712Sub713Sub714Sub715Sub716 isFloating={isFloating} setIsOpen={setIsOpen} textColorHex={textColorHex} setTextColorHex={setTextColorHex} placeholderColorHex={placeholderColorHex} setPlaceholderColorHex={setPlaceholderColorHex} placeholderOpacity={placeholderOpacity} setPlaceholderOpacity={setPlaceholderOpacity} setIsTransparentBg={setIsTransparentBg} setBgColor={setBgColor} isTransparentBg={isTransparentBg} bgHex={bgHex} setBgHex={setBgHex} fontSize={fontSize} setFontSize={setFontSize} setFontWeight={setFontWeight} fontWeight={fontWeight} setTextTransform={setTextTransform} textTransform={textTransform} resetDefaults={resetDefaults} cssCode={cssCode} handleCopy={handleCopy} copied={copied} />;
}
function PlaceholderStyleEditorSection8461Section5476Section4403Section3567Section2925Part98797Part83135Part17168Part27284Part72178Part67225Part31181Part10681Part13256Part90893Sub705Sub706Sub707Sub708Sub709Sub710Sub711Sub712Sub713Sub714({
  isFloating,
  setIsOpen,
  textColorHex,
  setTextColorHex,
  placeholderColorHex,
  setPlaceholderColorHex,
  placeholderOpacity,
  setPlaceholderOpacity,
  setIsTransparentBg,
  setBgColor,
  isTransparentBg,
  bgHex,
  setBgHex,
  fontSize,
  setFontSize,
  setFontWeight,
  fontWeight,
  setTextTransform,
  textTransform,
  resetDefaults,
  cssCode,
  handleCopy,
  copied
}: _PSEProps) {
  return <PlaceholderStyleEditorSection8461Section5476Section4403Section3567Section2925Part98797Part83135Part17168Part27284Part72178Part67225Part31181Part10681Part13256Part90893Sub705Sub706Sub707Sub708Sub709Sub710Sub711Sub712Sub713Sub714Sub715 isFloating={isFloating} setIsOpen={setIsOpen} textColorHex={textColorHex} setTextColorHex={setTextColorHex} placeholderColorHex={placeholderColorHex} setPlaceholderColorHex={setPlaceholderColorHex} placeholderOpacity={placeholderOpacity} setPlaceholderOpacity={setPlaceholderOpacity} setIsTransparentBg={setIsTransparentBg} setBgColor={setBgColor} isTransparentBg={isTransparentBg} bgHex={bgHex} setBgHex={setBgHex} fontSize={fontSize} setFontSize={setFontSize} setFontWeight={setFontWeight} fontWeight={fontWeight} setTextTransform={setTextTransform} textTransform={textTransform} resetDefaults={resetDefaults} cssCode={cssCode} handleCopy={handleCopy} copied={copied} />;
}
function PlaceholderStyleEditorSection8461Section5476Section4403Section3567Section2925Part98797Part83135Part17168Part27284Part72178Part67225Part31181Part10681Part13256Part90893Sub705Sub706Sub707Sub708Sub709Sub710Sub711Sub712Sub713({
  isFloating,
  setIsOpen,
  textColorHex,
  setTextColorHex,
  placeholderColorHex,
  setPlaceholderColorHex,
  placeholderOpacity,
  setPlaceholderOpacity,
  setIsTransparentBg,
  setBgColor,
  isTransparentBg,
  bgHex,
  setBgHex,
  fontSize,
  setFontSize,
  setFontWeight,
  fontWeight,
  setTextTransform,
  textTransform,
  resetDefaults,
  cssCode,
  handleCopy,
  copied
}: _PSEProps) {
  return <PlaceholderStyleEditorSection8461Section5476Section4403Section3567Section2925Part98797Part83135Part17168Part27284Part72178Part67225Part31181Part10681Part13256Part90893Sub705Sub706Sub707Sub708Sub709Sub710Sub711Sub712Sub713Sub714 isFloating={isFloating} setIsOpen={setIsOpen} textColorHex={textColorHex} setTextColorHex={setTextColorHex} placeholderColorHex={placeholderColorHex} setPlaceholderColorHex={setPlaceholderColorHex} placeholderOpacity={placeholderOpacity} setPlaceholderOpacity={setPlaceholderOpacity} setIsTransparentBg={setIsTransparentBg} setBgColor={setBgColor} isTransparentBg={isTransparentBg} bgHex={bgHex} setBgHex={setBgHex} fontSize={fontSize} setFontSize={setFontSize} setFontWeight={setFontWeight} fontWeight={fontWeight} setTextTransform={setTextTransform} textTransform={textTransform} resetDefaults={resetDefaults} cssCode={cssCode} handleCopy={handleCopy} copied={copied} />;
}
function PlaceholderStyleEditorSection8461Section5476Section4403Section3567Section2925Part98797Part83135Part17168Part27284Part72178Part67225Part31181Part10681Part13256Part90893Sub705Sub706Sub707Sub708Sub709Sub710Sub711Sub712({
  isFloating,
  setIsOpen,
  textColorHex,
  setTextColorHex,
  placeholderColorHex,
  setPlaceholderColorHex,
  placeholderOpacity,
  setPlaceholderOpacity,
  setIsTransparentBg,
  setBgColor,
  isTransparentBg,
  bgHex,
  setBgHex,
  fontSize,
  setFontSize,
  setFontWeight,
  fontWeight,
  setTextTransform,
  textTransform,
  resetDefaults,
  cssCode,
  handleCopy,
  copied
}: _PSEProps) {
  return <PlaceholderStyleEditorSection8461Section5476Section4403Section3567Section2925Part98797Part83135Part17168Part27284Part72178Part67225Part31181Part10681Part13256Part90893Sub705Sub706Sub707Sub708Sub709Sub710Sub711Sub712Sub713 isFloating={isFloating} setIsOpen={setIsOpen} textColorHex={textColorHex} setTextColorHex={setTextColorHex} placeholderColorHex={placeholderColorHex} setPlaceholderColorHex={setPlaceholderColorHex} placeholderOpacity={placeholderOpacity} setPlaceholderOpacity={setPlaceholderOpacity} setIsTransparentBg={setIsTransparentBg} setBgColor={setBgColor} isTransparentBg={isTransparentBg} bgHex={bgHex} setBgHex={setBgHex} fontSize={fontSize} setFontSize={setFontSize} setFontWeight={setFontWeight} fontWeight={fontWeight} setTextTransform={setTextTransform} textTransform={textTransform} resetDefaults={resetDefaults} cssCode={cssCode} handleCopy={handleCopy} copied={copied} />;
}
function PlaceholderStyleEditorSection8461Section5476Section4403Section3567Section2925Part98797Part83135Part17168Part27284Part72178Part67225Part31181Part10681Part13256Part90893Sub705Sub706Sub707Sub708Sub709Sub710Sub711({
  isFloating,
  setIsOpen,
  textColorHex,
  setTextColorHex,
  placeholderColorHex,
  setPlaceholderColorHex,
  placeholderOpacity,
  setPlaceholderOpacity,
  setIsTransparentBg,
  setBgColor,
  isTransparentBg,
  bgHex,
  setBgHex,
  fontSize,
  setFontSize,
  setFontWeight,
  fontWeight,
  setTextTransform,
  textTransform,
  resetDefaults,
  cssCode,
  handleCopy,
  copied
}: _PSEProps) {
  return <PlaceholderStyleEditorSection8461Section5476Section4403Section3567Section2925Part98797Part83135Part17168Part27284Part72178Part67225Part31181Part10681Part13256Part90893Sub705Sub706Sub707Sub708Sub709Sub710Sub711Sub712 isFloating={isFloating} setIsOpen={setIsOpen} textColorHex={textColorHex} setTextColorHex={setTextColorHex} placeholderColorHex={placeholderColorHex} setPlaceholderColorHex={setPlaceholderColorHex} placeholderOpacity={placeholderOpacity} setPlaceholderOpacity={setPlaceholderOpacity} setIsTransparentBg={setIsTransparentBg} setBgColor={setBgColor} isTransparentBg={isTransparentBg} bgHex={bgHex} setBgHex={setBgHex} fontSize={fontSize} setFontSize={setFontSize} setFontWeight={setFontWeight} fontWeight={fontWeight} setTextTransform={setTextTransform} textTransform={textTransform} resetDefaults={resetDefaults} cssCode={cssCode} handleCopy={handleCopy} copied={copied} />;
}
function PlaceholderStyleEditorSection8461Section5476Section4403Section3567Section2925Part98797Part83135Part17168Part27284Part72178Part67225Part31181Part10681Part13256Part90893Sub705Sub706Sub707Sub708Sub709Sub710({
  isFloating,
  setIsOpen,
  textColorHex,
  setTextColorHex,
  placeholderColorHex,
  setPlaceholderColorHex,
  placeholderOpacity,
  setPlaceholderOpacity,
  setIsTransparentBg,
  setBgColor,
  isTransparentBg,
  bgHex,
  setBgHex,
  fontSize,
  setFontSize,
  setFontWeight,
  fontWeight,
  setTextTransform,
  textTransform,
  resetDefaults,
  cssCode,
  handleCopy,
  copied
}: _PSEProps) {
  return <PlaceholderStyleEditorSection8461Section5476Section4403Section3567Section2925Part98797Part83135Part17168Part27284Part72178Part67225Part31181Part10681Part13256Part90893Sub705Sub706Sub707Sub708Sub709Sub710Sub711 isFloating={isFloating} setIsOpen={setIsOpen} textColorHex={textColorHex} setTextColorHex={setTextColorHex} placeholderColorHex={placeholderColorHex} setPlaceholderColorHex={setPlaceholderColorHex} placeholderOpacity={placeholderOpacity} setPlaceholderOpacity={setPlaceholderOpacity} setIsTransparentBg={setIsTransparentBg} setBgColor={setBgColor} isTransparentBg={isTransparentBg} bgHex={bgHex} setBgHex={setBgHex} fontSize={fontSize} setFontSize={setFontSize} setFontWeight={setFontWeight} fontWeight={fontWeight} setTextTransform={setTextTransform} textTransform={textTransform} resetDefaults={resetDefaults} cssCode={cssCode} handleCopy={handleCopy} copied={copied} />;
}
function PlaceholderStyleEditorSection8461Section5476Section4403Section3567Section2925Part98797Part83135Part17168Part27284Part72178Part67225Part31181Part10681Part13256Part90893Sub705Sub706Sub707Sub708Sub709({
  isFloating,
  setIsOpen,
  textColorHex,
  setTextColorHex,
  placeholderColorHex,
  setPlaceholderColorHex,
  placeholderOpacity,
  setPlaceholderOpacity,
  setIsTransparentBg,
  setBgColor,
  isTransparentBg,
  bgHex,
  setBgHex,
  fontSize,
  setFontSize,
  setFontWeight,
  fontWeight,
  setTextTransform,
  textTransform,
  resetDefaults,
  cssCode,
  handleCopy,
  copied
}: _PSEProps) {
  return <PlaceholderStyleEditorSection8461Section5476Section4403Section3567Section2925Part98797Part83135Part17168Part27284Part72178Part67225Part31181Part10681Part13256Part90893Sub705Sub706Sub707Sub708Sub709Sub710 isFloating={isFloating} setIsOpen={setIsOpen} textColorHex={textColorHex} setTextColorHex={setTextColorHex} placeholderColorHex={placeholderColorHex} setPlaceholderColorHex={setPlaceholderColorHex} placeholderOpacity={placeholderOpacity} setPlaceholderOpacity={setPlaceholderOpacity} setIsTransparentBg={setIsTransparentBg} setBgColor={setBgColor} isTransparentBg={isTransparentBg} bgHex={bgHex} setBgHex={setBgHex} fontSize={fontSize} setFontSize={setFontSize} setFontWeight={setFontWeight} fontWeight={fontWeight} setTextTransform={setTextTransform} textTransform={textTransform} resetDefaults={resetDefaults} cssCode={cssCode} handleCopy={handleCopy} copied={copied} />;
}
function PlaceholderStyleEditorSection8461Section5476Section4403Section3567Section2925Part98797Part83135Part17168Part27284Part72178Part67225Part31181Part10681Part13256Part90893Sub705Sub706Sub707Sub708({
  isFloating,
  setIsOpen,
  textColorHex,
  setTextColorHex,
  placeholderColorHex,
  setPlaceholderColorHex,
  placeholderOpacity,
  setPlaceholderOpacity,
  setIsTransparentBg,
  setBgColor,
  isTransparentBg,
  bgHex,
  setBgHex,
  fontSize,
  setFontSize,
  setFontWeight,
  fontWeight,
  setTextTransform,
  textTransform,
  resetDefaults,
  cssCode,
  handleCopy,
  copied
}: _PSEProps) {
  return <PlaceholderStyleEditorSection8461Section5476Section4403Section3567Section2925Part98797Part83135Part17168Part27284Part72178Part67225Part31181Part10681Part13256Part90893Sub705Sub706Sub707Sub708Sub709 isFloating={isFloating} setIsOpen={setIsOpen} textColorHex={textColorHex} setTextColorHex={setTextColorHex} placeholderColorHex={placeholderColorHex} setPlaceholderColorHex={setPlaceholderColorHex} placeholderOpacity={placeholderOpacity} setPlaceholderOpacity={setPlaceholderOpacity} setIsTransparentBg={setIsTransparentBg} setBgColor={setBgColor} isTransparentBg={isTransparentBg} bgHex={bgHex} setBgHex={setBgHex} fontSize={fontSize} setFontSize={setFontSize} setFontWeight={setFontWeight} fontWeight={fontWeight} setTextTransform={setTextTransform} textTransform={textTransform} resetDefaults={resetDefaults} cssCode={cssCode} handleCopy={handleCopy} copied={copied} />;
}
function PlaceholderStyleEditorSection8461Section5476Section4403Section3567Section2925Part98797Part83135Part17168Part27284Part72178Part67225Part31181Part10681Part13256Part90893Sub705Sub706Sub707({
  isFloating,
  setIsOpen,
  textColorHex,
  setTextColorHex,
  placeholderColorHex,
  setPlaceholderColorHex,
  placeholderOpacity,
  setPlaceholderOpacity,
  setIsTransparentBg,
  setBgColor,
  isTransparentBg,
  bgHex,
  setBgHex,
  fontSize,
  setFontSize,
  setFontWeight,
  fontWeight,
  setTextTransform,
  textTransform,
  resetDefaults,
  cssCode,
  handleCopy,
  copied
}: _PSEProps) {
  return <PlaceholderStyleEditorSection8461Section5476Section4403Section3567Section2925Part98797Part83135Part17168Part27284Part72178Part67225Part31181Part10681Part13256Part90893Sub705Sub706Sub707Sub708 isFloating={isFloating} setIsOpen={setIsOpen} textColorHex={textColorHex} setTextColorHex={setTextColorHex} placeholderColorHex={placeholderColorHex} setPlaceholderColorHex={setPlaceholderColorHex} placeholderOpacity={placeholderOpacity} setPlaceholderOpacity={setPlaceholderOpacity} setIsTransparentBg={setIsTransparentBg} setBgColor={setBgColor} isTransparentBg={isTransparentBg} bgHex={bgHex} setBgHex={setBgHex} fontSize={fontSize} setFontSize={setFontSize} setFontWeight={setFontWeight} fontWeight={fontWeight} setTextTransform={setTextTransform} textTransform={textTransform} resetDefaults={resetDefaults} cssCode={cssCode} handleCopy={handleCopy} copied={copied} />;
}
function PlaceholderStyleEditorSection8461Section5476Section4403Section3567Section2925Part98797Part83135Part17168Part27284Part72178Part67225Part31181Part10681Part13256Part90893Sub705Sub706({
  isFloating,
  setIsOpen,
  textColorHex,
  setTextColorHex,
  placeholderColorHex,
  setPlaceholderColorHex,
  placeholderOpacity,
  setPlaceholderOpacity,
  setIsTransparentBg,
  setBgColor,
  isTransparentBg,
  bgHex,
  setBgHex,
  fontSize,
  setFontSize,
  setFontWeight,
  fontWeight,
  setTextTransform,
  textTransform,
  resetDefaults,
  cssCode,
  handleCopy,
  copied
}: _PSEProps) {
  return <PlaceholderStyleEditorSection8461Section5476Section4403Section3567Section2925Part98797Part83135Part17168Part27284Part72178Part67225Part31181Part10681Part13256Part90893Sub705Sub706Sub707 isFloating={isFloating} setIsOpen={setIsOpen} textColorHex={textColorHex} setTextColorHex={setTextColorHex} placeholderColorHex={placeholderColorHex} setPlaceholderColorHex={setPlaceholderColorHex} placeholderOpacity={placeholderOpacity} setPlaceholderOpacity={setPlaceholderOpacity} setIsTransparentBg={setIsTransparentBg} setBgColor={setBgColor} isTransparentBg={isTransparentBg} bgHex={bgHex} setBgHex={setBgHex} fontSize={fontSize} setFontSize={setFontSize} setFontWeight={setFontWeight} fontWeight={fontWeight} setTextTransform={setTextTransform} textTransform={textTransform} resetDefaults={resetDefaults} cssCode={cssCode} handleCopy={handleCopy} copied={copied} />;
}
function PlaceholderStyleEditorSection8461Section5476Section4403Section3567Section2925Part98797Part83135Part17168Part27284Part72178Part67225Part31181Part10681Part13256Part90893Sub705({
  isFloating,
  setIsOpen,
  textColorHex,
  setTextColorHex,
  placeholderColorHex,
  setPlaceholderColorHex,
  placeholderOpacity,
  setPlaceholderOpacity,
  setIsTransparentBg,
  setBgColor,
  isTransparentBg,
  bgHex,
  setBgHex,
  fontSize,
  setFontSize,
  setFontWeight,
  fontWeight,
  setTextTransform,
  textTransform,
  resetDefaults,
  cssCode,
  handleCopy,
  copied
}: _PSEProps) {
  return <PlaceholderStyleEditorSection8461Section5476Section4403Section3567Section2925Part98797Part83135Part17168Part27284Part72178Part67225Part31181Part10681Part13256Part90893Sub705Sub706 isFloating={isFloating} setIsOpen={setIsOpen} textColorHex={textColorHex} setTextColorHex={setTextColorHex} placeholderColorHex={placeholderColorHex} setPlaceholderColorHex={setPlaceholderColorHex} placeholderOpacity={placeholderOpacity} setPlaceholderOpacity={setPlaceholderOpacity} setIsTransparentBg={setIsTransparentBg} setBgColor={setBgColor} isTransparentBg={isTransparentBg} bgHex={bgHex} setBgHex={setBgHex} fontSize={fontSize} setFontSize={setFontSize} setFontWeight={setFontWeight} fontWeight={fontWeight} setTextTransform={setTextTransform} textTransform={textTransform} resetDefaults={resetDefaults} cssCode={cssCode} handleCopy={handleCopy} copied={copied} />;
}
function PlaceholderStyleEditorSection8461Section5476Section4403Section3567Section2925Part98797Part83135Part17168Part27284Part72178Part67225Part31181Part10681Part13256Part90893({
  isFloating,
  setIsOpen,
  textColorHex,
  setTextColorHex,
  placeholderColorHex,
  setPlaceholderColorHex,
  placeholderOpacity,
  setPlaceholderOpacity,
  setIsTransparentBg,
  setBgColor,
  isTransparentBg,
  bgHex,
  setBgHex,
  fontSize,
  setFontSize,
  setFontWeight,
  fontWeight,
  setTextTransform,
  textTransform,
  resetDefaults,
  cssCode,
  handleCopy,
  copied
}: _PSEProps) {
  return <PlaceholderStyleEditorSection8461Section5476Section4403Section3567Section2925Part98797Part83135Part17168Part27284Part72178Part67225Part31181Part10681Part13256Part90893Sub705 isFloating={isFloating} setIsOpen={setIsOpen} textColorHex={textColorHex} setTextColorHex={setTextColorHex} placeholderColorHex={placeholderColorHex} setPlaceholderColorHex={setPlaceholderColorHex} placeholderOpacity={placeholderOpacity} setPlaceholderOpacity={setPlaceholderOpacity} setIsTransparentBg={setIsTransparentBg} setBgColor={setBgColor} isTransparentBg={isTransparentBg} bgHex={bgHex} setBgHex={setBgHex} fontSize={fontSize} setFontSize={setFontSize} setFontWeight={setFontWeight} fontWeight={fontWeight} setTextTransform={setTextTransform} textTransform={textTransform} resetDefaults={resetDefaults} cssCode={cssCode} handleCopy={handleCopy} copied={copied} />;
}
function PlaceholderStyleEditorSection8461Section5476Section4403Section3567Section2925Part98797Part83135Part17168Part27284Part72178Part67225Part31181Part10681Part13256({
  isFloating,
  setIsOpen,
  textColorHex,
  setTextColorHex,
  placeholderColorHex,
  setPlaceholderColorHex,
  placeholderOpacity,
  setPlaceholderOpacity,
  setIsTransparentBg,
  setBgColor,
  isTransparentBg,
  bgHex,
  setBgHex,
  fontSize,
  setFontSize,
  setFontWeight,
  fontWeight,
  setTextTransform,
  textTransform,
  resetDefaults,
  cssCode,
  handleCopy,
  copied
}: _PSEProps) {
  return <PlaceholderStyleEditorSection8461Section5476Section4403Section3567Section2925Part98797Part83135Part17168Part27284Part72178Part67225Part31181Part10681Part13256Part90893 isFloating={isFloating} setIsOpen={setIsOpen} textColorHex={textColorHex} setTextColorHex={setTextColorHex} placeholderColorHex={placeholderColorHex} setPlaceholderColorHex={setPlaceholderColorHex} placeholderOpacity={placeholderOpacity} setPlaceholderOpacity={setPlaceholderOpacity} setIsTransparentBg={setIsTransparentBg} setBgColor={setBgColor} isTransparentBg={isTransparentBg} bgHex={bgHex} setBgHex={setBgHex} fontSize={fontSize} setFontSize={setFontSize} setFontWeight={setFontWeight} fontWeight={fontWeight} setTextTransform={setTextTransform} textTransform={textTransform} resetDefaults={resetDefaults} cssCode={cssCode} handleCopy={handleCopy} copied={copied} />;
}
function PlaceholderStyleEditorSection8461Section5476Section4403Section3567Section2925Part98797Part83135Part17168Part27284Part72178Part67225Part31181Part10681({
  isFloating,
  setIsOpen,
  textColorHex,
  setTextColorHex,
  placeholderColorHex,
  setPlaceholderColorHex,
  placeholderOpacity,
  setPlaceholderOpacity,
  setIsTransparentBg,
  setBgColor,
  isTransparentBg,
  bgHex,
  setBgHex,
  fontSize,
  setFontSize,
  setFontWeight,
  fontWeight,
  setTextTransform,
  textTransform,
  resetDefaults,
  cssCode,
  handleCopy,
  copied
}: _PSEProps) {
  return <PlaceholderStyleEditorSection8461Section5476Section4403Section3567Section2925Part98797Part83135Part17168Part27284Part72178Part67225Part31181Part10681Part13256 isFloating={isFloating} setIsOpen={setIsOpen} textColorHex={textColorHex} setTextColorHex={setTextColorHex} placeholderColorHex={placeholderColorHex} setPlaceholderColorHex={setPlaceholderColorHex} placeholderOpacity={placeholderOpacity} setPlaceholderOpacity={setPlaceholderOpacity} setIsTransparentBg={setIsTransparentBg} setBgColor={setBgColor} isTransparentBg={isTransparentBg} bgHex={bgHex} setBgHex={setBgHex} fontSize={fontSize} setFontSize={setFontSize} setFontWeight={setFontWeight} fontWeight={fontWeight} setTextTransform={setTextTransform} textTransform={textTransform} resetDefaults={resetDefaults} cssCode={cssCode} handleCopy={handleCopy} copied={copied} />;
}
function PlaceholderStyleEditorSection8461Section5476Section4403Section3567Section2925Part98797Part83135Part17168Part27284Part72178Part67225Part31181({
  isFloating,
  setIsOpen,
  textColorHex,
  setTextColorHex,
  placeholderColorHex,
  setPlaceholderColorHex,
  placeholderOpacity,
  setPlaceholderOpacity,
  setIsTransparentBg,
  setBgColor,
  isTransparentBg,
  bgHex,
  setBgHex,
  fontSize,
  setFontSize,
  setFontWeight,
  fontWeight,
  setTextTransform,
  textTransform,
  resetDefaults,
  cssCode,
  handleCopy,
  copied
}: _PSEProps) {
  return <PlaceholderStyleEditorSection8461Section5476Section4403Section3567Section2925Part98797Part83135Part17168Part27284Part72178Part67225Part31181Part10681 isFloating={isFloating} setIsOpen={setIsOpen} textColorHex={textColorHex} setTextColorHex={setTextColorHex} placeholderColorHex={placeholderColorHex} setPlaceholderColorHex={setPlaceholderColorHex} placeholderOpacity={placeholderOpacity} setPlaceholderOpacity={setPlaceholderOpacity} setIsTransparentBg={setIsTransparentBg} setBgColor={setBgColor} isTransparentBg={isTransparentBg} bgHex={bgHex} setBgHex={setBgHex} fontSize={fontSize} setFontSize={setFontSize} setFontWeight={setFontWeight} fontWeight={fontWeight} setTextTransform={setTextTransform} textTransform={textTransform} resetDefaults={resetDefaults} cssCode={cssCode} handleCopy={handleCopy} copied={copied} />;
}
function PlaceholderStyleEditorSection8461Section5476Section4403Section3567Section2925Part98797Part83135Part17168Part27284Part72178Part67225({
  isFloating,
  setIsOpen,
  textColorHex,
  setTextColorHex,
  placeholderColorHex,
  setPlaceholderColorHex,
  placeholderOpacity,
  setPlaceholderOpacity,
  setIsTransparentBg,
  setBgColor,
  isTransparentBg,
  bgHex,
  setBgHex,
  fontSize,
  setFontSize,
  setFontWeight,
  fontWeight,
  setTextTransform,
  textTransform,
  resetDefaults,
  cssCode,
  handleCopy,
  copied
}: _PSEProps) {
  return <PlaceholderStyleEditorSection8461Section5476Section4403Section3567Section2925Part98797Part83135Part17168Part27284Part72178Part67225Part31181 isFloating={isFloating} setIsOpen={setIsOpen} textColorHex={textColorHex} setTextColorHex={setTextColorHex} placeholderColorHex={placeholderColorHex} setPlaceholderColorHex={setPlaceholderColorHex} placeholderOpacity={placeholderOpacity} setPlaceholderOpacity={setPlaceholderOpacity} setIsTransparentBg={setIsTransparentBg} setBgColor={setBgColor} isTransparentBg={isTransparentBg} bgHex={bgHex} setBgHex={setBgHex} fontSize={fontSize} setFontSize={setFontSize} setFontWeight={setFontWeight} fontWeight={fontWeight} setTextTransform={setTextTransform} textTransform={textTransform} resetDefaults={resetDefaults} cssCode={cssCode} handleCopy={handleCopy} copied={copied} />;
}
function PlaceholderStyleEditorSection8461Section5476Section4403Section3567Section2925Part98797Part83135Part17168Part27284Part72178({
  isFloating,
  setIsOpen,
  textColorHex,
  setTextColorHex,
  placeholderColorHex,
  setPlaceholderColorHex,
  placeholderOpacity,
  setPlaceholderOpacity,
  setIsTransparentBg,
  setBgColor,
  isTransparentBg,
  bgHex,
  setBgHex,
  fontSize,
  setFontSize,
  setFontWeight,
  fontWeight,
  setTextTransform,
  textTransform,
  resetDefaults,
  cssCode,
  handleCopy,
  copied
}: _PSEProps) {
  return <PlaceholderStyleEditorSection8461Section5476Section4403Section3567Section2925Part98797Part83135Part17168Part27284Part72178Part67225 isFloating={isFloating} setIsOpen={setIsOpen} textColorHex={textColorHex} setTextColorHex={setTextColorHex} placeholderColorHex={placeholderColorHex} setPlaceholderColorHex={setPlaceholderColorHex} placeholderOpacity={placeholderOpacity} setPlaceholderOpacity={setPlaceholderOpacity} setIsTransparentBg={setIsTransparentBg} setBgColor={setBgColor} isTransparentBg={isTransparentBg} bgHex={bgHex} setBgHex={setBgHex} fontSize={fontSize} setFontSize={setFontSize} setFontWeight={setFontWeight} fontWeight={fontWeight} setTextTransform={setTextTransform} textTransform={textTransform} resetDefaults={resetDefaults} cssCode={cssCode} handleCopy={handleCopy} copied={copied} />;
}
function PlaceholderStyleEditorSection8461Section5476Section4403Section3567Section2925Part98797Part83135Part17168Part27284({
  isFloating,
  setIsOpen,
  textColorHex,
  setTextColorHex,
  placeholderColorHex,
  setPlaceholderColorHex,
  placeholderOpacity,
  setPlaceholderOpacity,
  setIsTransparentBg,
  setBgColor,
  isTransparentBg,
  bgHex,
  setBgHex,
  fontSize,
  setFontSize,
  setFontWeight,
  fontWeight,
  setTextTransform,
  textTransform,
  resetDefaults,
  cssCode,
  handleCopy,
  copied
}: _PSEProps) {
  return <PlaceholderStyleEditorSection8461Section5476Section4403Section3567Section2925Part98797Part83135Part17168Part27284Part72178 isFloating={isFloating} setIsOpen={setIsOpen} textColorHex={textColorHex} setTextColorHex={setTextColorHex} placeholderColorHex={placeholderColorHex} setPlaceholderColorHex={setPlaceholderColorHex} placeholderOpacity={placeholderOpacity} setPlaceholderOpacity={setPlaceholderOpacity} setIsTransparentBg={setIsTransparentBg} setBgColor={setBgColor} isTransparentBg={isTransparentBg} bgHex={bgHex} setBgHex={setBgHex} fontSize={fontSize} setFontSize={setFontSize} setFontWeight={setFontWeight} fontWeight={fontWeight} setTextTransform={setTextTransform} textTransform={textTransform} resetDefaults={resetDefaults} cssCode={cssCode} handleCopy={handleCopy} copied={copied} />;
}
function PlaceholderStyleEditorSection8461Section5476Section4403Section3567Section2925Part98797Part83135Part17168({
  isFloating,
  setIsOpen,
  textColorHex,
  setTextColorHex,
  placeholderColorHex,
  setPlaceholderColorHex,
  placeholderOpacity,
  setPlaceholderOpacity,
  setIsTransparentBg,
  setBgColor,
  isTransparentBg,
  bgHex,
  setBgHex,
  fontSize,
  setFontSize,
  setFontWeight,
  fontWeight,
  setTextTransform,
  textTransform,
  resetDefaults,
  cssCode,
  handleCopy,
  copied
}: _PSEProps) {
  return <PlaceholderStyleEditorSection8461Section5476Section4403Section3567Section2925Part98797Part83135Part17168Part27284 isFloating={isFloating} setIsOpen={setIsOpen} textColorHex={textColorHex} setTextColorHex={setTextColorHex} placeholderColorHex={placeholderColorHex} setPlaceholderColorHex={setPlaceholderColorHex} placeholderOpacity={placeholderOpacity} setPlaceholderOpacity={setPlaceholderOpacity} setIsTransparentBg={setIsTransparentBg} setBgColor={setBgColor} isTransparentBg={isTransparentBg} bgHex={bgHex} setBgHex={setBgHex} fontSize={fontSize} setFontSize={setFontSize} setFontWeight={setFontWeight} fontWeight={fontWeight} setTextTransform={setTextTransform} textTransform={textTransform} resetDefaults={resetDefaults} cssCode={cssCode} handleCopy={handleCopy} copied={copied} />;
}
function PlaceholderStyleEditorSection8461Section5476Section4403Section3567Section2925Part98797Part83135({
  isFloating,
  setIsOpen,
  textColorHex,
  setTextColorHex,
  placeholderColorHex,
  setPlaceholderColorHex,
  placeholderOpacity,
  setPlaceholderOpacity,
  setIsTransparentBg,
  setBgColor,
  isTransparentBg,
  bgHex,
  setBgHex,
  fontSize,
  setFontSize,
  setFontWeight,
  fontWeight,
  setTextTransform,
  textTransform,
  resetDefaults,
  cssCode,
  handleCopy,
  copied
}: _PSEProps) {
  return <PlaceholderStyleEditorSection8461Section5476Section4403Section3567Section2925Part98797Part83135Part17168 isFloating={isFloating} setIsOpen={setIsOpen} textColorHex={textColorHex} setTextColorHex={setTextColorHex} placeholderColorHex={placeholderColorHex} setPlaceholderColorHex={setPlaceholderColorHex} placeholderOpacity={placeholderOpacity} setPlaceholderOpacity={setPlaceholderOpacity} setIsTransparentBg={setIsTransparentBg} setBgColor={setBgColor} isTransparentBg={isTransparentBg} bgHex={bgHex} setBgHex={setBgHex} fontSize={fontSize} setFontSize={setFontSize} setFontWeight={setFontWeight} fontWeight={fontWeight} setTextTransform={setTextTransform} textTransform={textTransform} resetDefaults={resetDefaults} cssCode={cssCode} handleCopy={handleCopy} copied={copied} />;
}
function PlaceholderStyleEditorSection8461Section5476Section4403Section3567Section2925Part98797({
  isFloating,
  setIsOpen,
  textColorHex,
  setTextColorHex,
  placeholderColorHex,
  setPlaceholderColorHex,
  placeholderOpacity,
  setPlaceholderOpacity,
  setIsTransparentBg,
  setBgColor,
  isTransparentBg,
  bgHex,
  setBgHex,
  fontSize,
  setFontSize,
  setFontWeight,
  fontWeight,
  setTextTransform,
  textTransform,
  resetDefaults,
  cssCode,
  handleCopy,
  copied
}: _PSEProps) {
  return <PlaceholderStyleEditorSection8461Section5476Section4403Section3567Section2925Part98797Part83135 isFloating={isFloating} setIsOpen={setIsOpen} textColorHex={textColorHex} setTextColorHex={setTextColorHex} placeholderColorHex={placeholderColorHex} setPlaceholderColorHex={setPlaceholderColorHex} placeholderOpacity={placeholderOpacity} setPlaceholderOpacity={setPlaceholderOpacity} setIsTransparentBg={setIsTransparentBg} setBgColor={setBgColor} isTransparentBg={isTransparentBg} bgHex={bgHex} setBgHex={setBgHex} fontSize={fontSize} setFontSize={setFontSize} setFontWeight={setFontWeight} fontWeight={fontWeight} setTextTransform={setTextTransform} textTransform={textTransform} resetDefaults={resetDefaults} cssCode={cssCode} handleCopy={handleCopy} copied={copied} />;
}
function PlaceholderStyleEditorSection8461Section5476Section4403Section3567Section2925({
  isFloating,
  setIsOpen,
  textColorHex,
  setTextColorHex,
  placeholderColorHex,
  setPlaceholderColorHex,
  placeholderOpacity,
  setPlaceholderOpacity,
  setIsTransparentBg,
  setBgColor,
  isTransparentBg,
  bgHex,
  setBgHex,
  fontSize,
  setFontSize,
  setFontWeight,
  fontWeight,
  setTextTransform,
  textTransform,
  resetDefaults,
  cssCode,
  handleCopy,
  copied
}: _PSEProps) {
  return <PlaceholderStyleEditorSection8461Section5476Section4403Section3567Section2925Part98797 isFloating={isFloating} setIsOpen={setIsOpen} textColorHex={textColorHex} setTextColorHex={setTextColorHex} placeholderColorHex={placeholderColorHex} setPlaceholderColorHex={setPlaceholderColorHex} placeholderOpacity={placeholderOpacity} setPlaceholderOpacity={setPlaceholderOpacity} setIsTransparentBg={setIsTransparentBg} setBgColor={setBgColor} isTransparentBg={isTransparentBg} bgHex={bgHex} setBgHex={setBgHex} fontSize={fontSize} setFontSize={setFontSize} setFontWeight={setFontWeight} fontWeight={fontWeight} setTextTransform={setTextTransform} textTransform={textTransform} resetDefaults={resetDefaults} cssCode={cssCode} handleCopy={handleCopy} copied={copied} />;
}
function PlaceholderStyleEditorSection8461Section5476Section4403Section3567({
  isFloating,
  setIsOpen,
  textColorHex,
  setTextColorHex,
  placeholderColorHex,
  setPlaceholderColorHex,
  placeholderOpacity,
  setPlaceholderOpacity,
  setIsTransparentBg,
  setBgColor,
  isTransparentBg,
  bgHex,
  setBgHex,
  fontSize,
  setFontSize,
  setFontWeight,
  fontWeight,
  setTextTransform,
  textTransform,
  resetDefaults,
  cssCode,
  handleCopy,
  copied
}: _PSEProps) {
  return <PlaceholderStyleEditorSection8461Section5476Section4403Section3567Section2925 isFloating={isFloating} setIsOpen={setIsOpen} textColorHex={textColorHex} setTextColorHex={setTextColorHex} placeholderColorHex={placeholderColorHex} setPlaceholderColorHex={setPlaceholderColorHex} placeholderOpacity={placeholderOpacity} setPlaceholderOpacity={setPlaceholderOpacity} setIsTransparentBg={setIsTransparentBg} setBgColor={setBgColor} isTransparentBg={isTransparentBg} bgHex={bgHex} setBgHex={setBgHex} fontSize={fontSize} setFontSize={setFontSize} setFontWeight={setFontWeight} fontWeight={fontWeight} setTextTransform={setTextTransform} textTransform={textTransform} resetDefaults={resetDefaults} cssCode={cssCode} handleCopy={handleCopy} copied={copied} />;
}
function PlaceholderStyleEditorSection8461Section5476Section4403({
  isFloating,
  setIsOpen,
  textColorHex,
  setTextColorHex,
  placeholderColorHex,
  setPlaceholderColorHex,
  placeholderOpacity,
  setPlaceholderOpacity,
  setIsTransparentBg,
  setBgColor,
  isTransparentBg,
  bgHex,
  setBgHex,
  fontSize,
  setFontSize,
  setFontWeight,
  fontWeight,
  setTextTransform,
  textTransform,
  resetDefaults,
  cssCode,
  handleCopy,
  copied
}: _PSEProps) {
  return <PlaceholderStyleEditorSection8461Section5476Section4403Section3567 isFloating={isFloating} setIsOpen={setIsOpen} textColorHex={textColorHex} setTextColorHex={setTextColorHex} placeholderColorHex={placeholderColorHex} setPlaceholderColorHex={setPlaceholderColorHex} placeholderOpacity={placeholderOpacity} setPlaceholderOpacity={setPlaceholderOpacity} setIsTransparentBg={setIsTransparentBg} setBgColor={setBgColor} isTransparentBg={isTransparentBg} bgHex={bgHex} setBgHex={setBgHex} fontSize={fontSize} setFontSize={setFontSize} setFontWeight={setFontWeight} fontWeight={fontWeight} setTextTransform={setTextTransform} textTransform={textTransform} resetDefaults={resetDefaults} cssCode={cssCode} handleCopy={handleCopy} copied={copied} />;
}
function PlaceholderStyleEditorSection8461Section5476({
  isFloating,
  setIsOpen,
  textColorHex,
  setTextColorHex,
  placeholderColorHex,
  setPlaceholderColorHex,
  placeholderOpacity,
  setPlaceholderOpacity,
  setIsTransparentBg,
  setBgColor,
  isTransparentBg,
  bgHex,
  setBgHex,
  fontSize,
  setFontSize,
  setFontWeight,
  fontWeight,
  setTextTransform,
  textTransform,
  resetDefaults,
  cssCode,
  handleCopy,
  copied
}: _PSEProps) {
  return <PlaceholderStyleEditorSection8461Section5476Section4403 isFloating={isFloating} setIsOpen={setIsOpen} textColorHex={textColorHex} setTextColorHex={setTextColorHex} placeholderColorHex={placeholderColorHex} setPlaceholderColorHex={setPlaceholderColorHex} placeholderOpacity={placeholderOpacity} setPlaceholderOpacity={setPlaceholderOpacity} setIsTransparentBg={setIsTransparentBg} setBgColor={setBgColor} isTransparentBg={isTransparentBg} bgHex={bgHex} setBgHex={setBgHex} fontSize={fontSize} setFontSize={setFontSize} setFontWeight={setFontWeight} fontWeight={fontWeight} setTextTransform={setTextTransform} textTransform={textTransform} resetDefaults={resetDefaults} cssCode={cssCode} handleCopy={handleCopy} copied={copied} />;
}
function PlaceholderStyleEditorSection8461({
  isFloating,
  setIsOpen,
  textColorHex,
  setTextColorHex,
  placeholderColorHex,
  setPlaceholderColorHex,
  placeholderOpacity,
  setPlaceholderOpacity,
  setIsTransparentBg,
  setBgColor,
  isTransparentBg,
  bgHex,
  setBgHex,
  fontSize,
  setFontSize,
  setFontWeight,
  fontWeight,
  setTextTransform,
  textTransform,
  resetDefaults,
  cssCode,
  handleCopy,
  copied
}: _PSEProps) {
  return <PlaceholderStyleEditorSection8461Section5476 isFloating={isFloating} setIsOpen={setIsOpen} textColorHex={textColorHex} setTextColorHex={setTextColorHex} placeholderColorHex={placeholderColorHex} setPlaceholderColorHex={setPlaceholderColorHex} placeholderOpacity={placeholderOpacity} setPlaceholderOpacity={setPlaceholderOpacity} setIsTransparentBg={setIsTransparentBg} setBgColor={setBgColor} isTransparentBg={isTransparentBg} bgHex={bgHex} setBgHex={setBgHex} fontSize={fontSize} setFontSize={setFontSize} setFontWeight={setFontWeight} fontWeight={fontWeight} setTextTransform={setTextTransform} textTransform={textTransform} resetDefaults={resetDefaults} cssCode={cssCode} handleCopy={handleCopy} copied={copied} />;
}
export function PlaceholderStyleEditor({
  isFloating = true
}: {
  isFloating?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false); // States for Global Textbox Styling
  const [textColorHex, setTextColorHex] = useState("#ffffff");
  const [placeholderColorHex, setPlaceholderColorHex] = useState("#a1a1aa");
  const [placeholderOpacity, setPlaceholderOpacity] = useState(70);
  const [bgColor, setBgColor] = useState("transparent");
  const [bgHex, setBgHex] = useState("#18181b");
  const [isTransparentBg, setIsTransparentBg] = useState(true);
  const [fontSize, setFontSize] = useState(14);
  const [fontWeight, setFontWeight] = useState("500");
  const [fontStyle, setFontStyle] = useState<"normal" | "italic">("normal");
  const [textTransform, setTextTransform] = useState<"none" | "uppercase" | "lowercase" | "capitalize">("none");
  const [copied, setCopied] = useState(false); // Load saved preferences on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("7h_textbox_style:v1");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.textColorHex) setTextColorHex(parsed.textColorHex);
        if (parsed.placeholderColorHex) setPlaceholderColorHex(parsed.placeholderColorHex);
        if (parsed.placeholderOpacity !== undefined) setPlaceholderOpacity(parsed.placeholderOpacity);
        if (parsed.bgColor) setBgColor(parsed.bgColor);
        if (parsed.bgHex) setBgHex(parsed.bgHex);
        if (parsed.isTransparentBg !== undefined) setIsTransparentBg(parsed.isTransparentBg);
        if (parsed.fontSize) setFontSize(parsed.fontSize);
        if (parsed.fontWeight) setFontWeight(parsed.fontWeight);
        if (parsed.fontStyle) setFontStyle(parsed.fontStyle);
        if (parsed.textTransform) setTextTransform(parsed.textTransform);
      }
    } catch { }
  }, []); // Compute final RGBA color string for placeholder
  const finalPlaceholderColor = hexToRgba(placeholderColorHex, placeholderOpacity);
  const activeBg = isTransparentBg ? "transparent" : bgColor; // Apply to document head dynamically
  useEffect(() => {
    let styleEl = document.getElementById("global-textbox-custom-styles");
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = "global-textbox-custom-styles";
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = `
      input[type="text"],
      input[type="email"],
      input[type="tel"],
      input[type="number"],
      input[type="password"],
      select,
      textarea {
        color: ${textColorHex} !important;
        background-color: ${activeBg} !important;
        font-size: ${fontSize}px !important;
      }

      input::placeholder,
      textarea::placeholder,
      select::placeholder,
      ::placeholder {
        color: ${finalPlaceholderColor} !important;
        font-size: ${fontSize}px !important;
        font-weight: ${fontWeight} !important;
        font-style: ${fontStyle} !important;
        text-transform: ${textTransform} !important;
        opacity: 1 !important;
      }
    `; // Save state
    try {
      localStorage.setItem("7h_textbox_style:v1", JSON.stringify({
        textColorHex,
        placeholderColorHex,
        placeholderOpacity,
        bgColor: activeBg,
        bgHex,
        isTransparentBg,
        fontSize,
        fontWeight,
        fontStyle,
        textTransform
      }));
    } catch { }
  }, [textColorHex, placeholderColorHex, placeholderOpacity, activeBg, bgHex, isTransparentBg, fontSize, fontWeight, fontStyle, textTransform, finalPlaceholderColor]);
  const cssCode = `/* Global Textbox & Placeholder Styles */
input, select, textarea {
  color: ${textColorHex} !important;
  background-color: ${activeBg} !important;
  font-size: ${fontSize}px !important;
}

input::placeholder,
textarea::placeholder,
select::placeholder {
  color: ${finalPlaceholderColor} !important;
  font-size: ${fontSize}px !important;
  font-weight: ${fontWeight} !important;
  font-style: ${fontStyle} !important;
  text-transform: ${textTransform} !important;
  opacity: 1 !important;
}`;
  const handleCopy = () => {
    navigator.clipboard.writeText(cssCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const resetDefaults = () => {
    setTextColorHex("#ffffff");
    setPlaceholderColorHex("#a1a1aa");
    setPlaceholderOpacity(70);
    setIsTransparentBg(true);
    setBgColor("transparent");
    setBgHex("#18181b");
    setFontSize(14);
    setFontWeight("500");
    setFontStyle("normal");
    setTextTransform("none");
  };
  const editorContent = <PlaceholderStyleEditorSection8461 isFloating={isFloating} setIsOpen={setIsOpen} textColorHex={textColorHex} setTextColorHex={setTextColorHex} placeholderColorHex={placeholderColorHex} setPlaceholderColorHex={setPlaceholderColorHex} placeholderOpacity={placeholderOpacity} setPlaceholderOpacity={setPlaceholderOpacity} setIsTransparentBg={setIsTransparentBg} setBgColor={setBgColor} isTransparentBg={isTransparentBg} bgHex={bgHex} setBgHex={setBgHex} fontSize={fontSize} setFontSize={setFontSize} setFontWeight={setFontWeight} fontWeight={fontWeight} setTextTransform={setTextTransform} textTransform={textTransform} resetDefaults={resetDefaults} cssCode={cssCode} handleCopy={handleCopy} copied={copied} />;
  if (!isFloating) {
    return editorContent;
  }
  return <>
    {/* Floating Toggle Button (Bottom Right) */}
    <button type="button" onClick={() => setIsOpen(!isOpen)} className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-2xl border border-purple-400/40 flex items-center gap-2 transition-colors transition-transform hover:scale-105 cursor-pointer" title="Open Textbox & Placeholder Style Editor">

      <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-black">Aa</span>
      <span>Textbox Styling Editor</span>
    </button>

    {/* Modal Drawer */}
    {isOpen && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-[fade-in_0.2s_ease-out]">
      {editorContent}
    </div>}
  </>;
}