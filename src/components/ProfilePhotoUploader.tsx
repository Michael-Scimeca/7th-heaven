"use client";

import React, { useState, useRef } from "react";
import { useMember } from "@/context/MemberContext";

export default function ProfilePhotoUploader({ compact = false }: { compact?: boolean }) {
  const { member, updateAvatar } = useMember();
  const [urlInput, setUrlInput] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("7h_profile_avatar") || member?.avatar || null;
    }
    return member?.avatar || null;
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeAvatar = previewUrl || member?.avatar;
  const isAvatarUrl = activeAvatar && (activeAvatar.startsWith("http") || activeAvatar.startsWith("/") || activeAvatar.startsWith("data:"));
  const initials = member?.name ? member.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "ME";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage({ text: "Please select a valid image file", type: "error" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ text: "Image size must be under 5MB", type: "error" });
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setPreviewUrl(dataUrl);
        try {
          localStorage.setItem("7h_profile_avatar", dataUrl);
        } catch {}
        await updateAvatar(dataUrl);
        setMessage({ text: "Profile & scheduling photo updated!", type: "success" });
      }
      setIsUploading(false);
    };
    reader.onerror = () => {
      setMessage({ text: "Failed to read image file", type: "error" });
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    setIsUploading(true);
    setPreviewUrl(trimmed);
    try {
      localStorage.setItem("7h_profile_avatar", trimmed);
    } catch {}
    await updateAvatar(trimmed);
    setMessage({ text: "Photo URL updated!", type: "success" });
    setUrlInput("");
    setShowInput(false);
    setIsUploading(false);
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3 bg-white/[0.03] border border-white/10 rounded-xl p-3">
        <div className="relative w-12 h-12 rounded-lg bg-[var(--color-accent)]/20 border-2 border-[var(--color-accent)]/60 flex items-center justify-center overflow-hidden shrink-0">
          {isAvatarUrl ? (
            <img src={activeAvatar} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <span className="text-purple-300 font-black text-sm">{initials}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-black uppercase tracking-wider text-white truncate">
            {member?.name || "Official Profile Photo"}
          </p>
          <p className="text-[var(--font-size-3xs)] text-white/40">
            {isAvatarUrl ? "Photo active for scheduling & site" : "No photo set — upload one below"}
          </p>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="px-3 py-1.5 bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 text-white font-bold text-xs uppercase tracking-wider rounded-md transition-all cursor-pointer disabled:opacity-50"
        >
          {isUploading ? "Uploading..." : isAvatarUrl ? "Change" : "Upload"}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-black/15 rounded-2xl p-6 shadow-sm relative overflow-hidden text-black font-sans">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 font-bold">
            📷
          </div>
          <div>
            <h3 className="text-base font-black uppercase tracking-tight text-black">
              Official Profile & Scheduling Photo
            </h3>
            <p className="text-xs text-black/70 font-semibold">
              Required photo used for site scheduling, roster displays, and member avatar.
            </p>
          </div>
        </div>
        {isAvatarUrl && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-2xs font-black uppercase tracking-widest bg-emerald-100 border border-emerald-300 text-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            Photo Active
          </span>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-black/[0.02] border border-black/10 rounded-xl">
        {/* Preview Box */}
        <div className="relative w-24 h-24 rounded-xl bg-purple-100 border-2 border-purple-600 flex items-center justify-center overflow-hidden shrink-0 shadow-md group">
          {isAvatarUrl ? (
            <img src={activeAvatar} alt="Profile preview" className="w-full h-full object-cover" />
          ) : (
            <div className="text-center p-1">
              <span className="text-xs font-black text-purple-900 tracking-wider block">{initials}</span>
              <p className="text-[9px] font-bold text-purple-900/60 uppercase tracking-widest mt-0.5">No Photo</p>
            </div>
          )}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity cursor-pointer"
          >
            ✏️ Change
          </button>
        </div>

        {/* Upload Controls */}
        <div className="flex-1 w-full space-y-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex-1 min-w-[140px] px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs uppercase tracking-wider rounded-lg transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              {isUploading ? "Uploading..." : "Upload Photo File"}
            </button>

            <button
              onClick={() => setShowInput(!showInput)}
              className="px-4 py-2.5 bg-black/5 hover:bg-black/10 text-black font-bold text-xs uppercase tracking-wider rounded-lg border border-black/15 transition-all cursor-pointer"
            >
              {showInput ? "Cancel URL" : "Paste Image URL"}
            </button>
          </div>

          {showInput && (
            <form onSubmit={handleUrlSubmit} className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/my-photo.jpg"
                required
                className="flex-1 px-3 py-2 bg-white border border-black/15 rounded-lg text-xs text-black font-semibold placeholder:text-black/40 outline-none focus:border-purple-600"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs uppercase rounded-lg cursor-pointer"
              >
                Save
              </button>
            </form>
          )}

          <p className="text-[var(--font-size-2xs)] text-black/60 font-semibold leading-relaxed">
            Supported formats: JPG, PNG, WebP (max 5MB). Photo syncs automatically across your scheduling profile and header avatar.
          </p>
        </div>
      </div>

      {message && (
        <div className={`mt-3 px-4 py-2 rounded-lg text-xs font-bold flex items-center justify-between ${
          message.type === "success" ? "bg-emerald-50 border border-emerald-200 text-emerald-800" : "bg-rose-50 border border-rose-200 text-rose-800"
        }`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-black/50 hover:text-black ml-2 cursor-pointer font-black">×</button>
        </div>
      )}
    </div>
  );
}
