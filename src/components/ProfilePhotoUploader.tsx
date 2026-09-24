/* eslint-disable react-doctor/prefer-useReducer, react-doctor/no-high-complexity-react-function */
"use client";

import React, { useState, useRef, useEffect } from "react";
import { Camera, Edit } from "lucide-react";
import { useMember } from "@/context/MemberContext";

function compressImage(
  file: File,
  maxWidth = 300,
  maxHeight = 300,
): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}

export default function ProfilePhotoUploader({
  compact = false,
}: {
  compact?: boolean;
}) {
  const { member, updateAvatar } = useMember();
  const [urlInput, setUrlInput] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    member?.avatar || null,
  );
  useEffect(() => {
    const stored = localStorage.getItem("7h_profile_avatar");
    if (stored) setPreviewUrl(stored);
  }, []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeAvatar = previewUrl || member?.avatar;
  const isAvatarUrl =
    activeAvatar &&
    (activeAvatar.startsWith("http") ||
      activeAvatar.startsWith("/") ||
      activeAvatar.startsWith("data:"));
  const initials = member?.name
    ? member.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "ME";

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage({ text: "Please select a valid image file", type: "error" });
      return;
    }

    setIsUploading(true);
    try {
      const dataUrl = await compressImage(file);
      if (dataUrl) {
        setPreviewUrl(dataUrl);
        try {
          localStorage.setItem("7h_profile_avatar", dataUrl);
        } catch {}
        await updateAvatar(dataUrl);
        setMessage({
          text: "Profile & scheduling photo updated!",
          type: "success",
        });
      }
    } catch {
      setMessage({ text: "Failed to process image file", type: "error" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    setIsUploading(true);
    setPreviewUrl(trimmed);
    try {
      try {
        localStorage.setItem("7h_profile_avatar", trimmed);
      } catch {}
      await updateAvatar(trimmed);
      setMessage({ text: "Photo URL updated!", type: "success" });
      setUrlInput("");
      setShowInput(false);
    } finally {
      setIsUploading(false);
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3 border border-white/10 bg-white/[0.03] p-3">
        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 border-[var(--color-accent)]/60 bg-[var(--color-accent)]/20">
          {isAvatarUrl ? (
            <img
              src={activeAvatar}
              alt="Profile"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-[var(--color-accent)]">{initials}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate">{member?.name || "Official Profile Photo"}</p>
          <p>
            {isAvatarUrl
              ? "Photo active for scheduling & site"
              : "No photo set — upload one below"}
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
          className="btn-primary cursor-pointer rounded-lg px-3 py-1.5 disabled:opacity-50"
        >
          {isUploading ? "Uploading..." : isAvatarUrl ? "Change" : "Upload"}
        </button>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden border border-black/15 bg-white p-6 text-black">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-purple-500/30 bg-purple-600/10 text-[var(--color-accent)]">
            <Camera className="h-4 w-4 text-purple-600" />
          </div>
          <div>
            <h3 className="text-black">Official Profile & Scheduling Photo</h3>
            <p className="text-black/70">
              Required photo used for site scheduling, roster displays, and
              member avatar.
            </p>
          </div>
        </div>
        {isAvatarUrl && (
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-100 px-3 py-1 text-[var(--font-size-2xs)] text-emerald-800">
            <span className="h-1.5 w-1.5 animate-pulse rounded-lg bg-[var(--color-accent)]" />
            Photo Active
          </span>
        )}
      </div>

      <div className="flex flex-col items-center gap-6 border border-black/10 bg-black/[0.02] p-4 sm:flex-row">
        {/* Preview Box */}
        <div className="group relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden border-2 border-[var(--color-accent)] bg-[var(--color-accent)]">
          {isAvatarUrl ? (
            <img
              src={activeAvatar}
              alt="Profile preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="p-1 text-center">
              <span className="block text-[var(--color-accent)]">
                {initials}
              </span>
              <p className="mt-0.5 text-[var(--color-accent)]/60">No Photo</p>
            </div>
          )}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="overlay-center-hover cursor-pointer gap-1"
          >
            <Edit className="h-3.5 w-3.5" /> Change
          </button>
        </div>

        {/* Upload Controls */}
        <div className="w-full flex-1 space-y-3">
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
              className="btn-primary flex min-w-[140px] flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2.5 disabled:opacity-50"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              {isUploading ? "Uploading..." : "Upload Photo File"}
            </button>

            <button
              onClick={() => setShowInput(!showInput)}
              className="btn-secondary cursor-pointer rounded-lg px-4 py-2.5"
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
                className="flex-1 rounded-lg border border-black/15 bg-white px-3 py-2 outline-none placeholder:text-black/40 focus:border-[var(--color-accent)]"
              />
              <button
                type="submit"
                className="btn-primary cursor-pointer rounded-lg px-4 py-2"
              >
                Save
              </button>
            </form>
          )}

          <p className="text-black/60">
            Supported formats: JPG, PNG, WebP (max 5MB). Photo syncs
            automatically across your scheduling profile and header avatar.
          </p>
        </div>
      </div>

      {message && (
        <div
          className={`mt-3 flex items-center justify-between rounded-lg px-4 py-2 ${message.type === "success" ? "border border-emerald-200 bg-emerald-50 text-emerald-800" : "border border-rose-200 bg-rose-50 text-rose-800"}`}
        >
          <span>{message.text}</span>
          <button
            onClick={() => setMessage(null)}
            className="hover: ml-2 cursor-pointer text-black/50"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
