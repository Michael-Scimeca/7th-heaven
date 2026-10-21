"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Lock,
  User,
  Mail,
  Phone,
  Check,
  Eye,
  EyeOff,
  Upload,
  Link2,
  RotateCcw,
  Building2,
  MapPin,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { useMember, Member } from "@/context/MemberContext";
import { isValidEmail } from "@/lib/validation";
import Avatar from "@/components/Avatar";
import SeventhButton from "@/components/SeventhButton";
import { useScrollLock } from "@/lib/useScrollLock";

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

function getPasswordStrength(pass: string): {
  score: number;
  label: string;
  color: string;
} {
  if (!pass) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pass.length >= 6) score += 1;
  if (pass.length >= 10) score += 1;
  if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
  if (/\d/.test(pass)) score += 1;
  if (/[^A-Za-z0-9]/.test(pass)) score += 1;

  if (score <= 2) return { score: 1, label: "Weak", color: "bg-amber-500" };
  if (score <= 3) return { score: 2, label: "Medium", color: "bg-blue-500" };
  return { score: 3, label: "Strong", color: "bg-emerald-500" };
}

const PRESET_PICKS = [
  { label: "Gold Pick", src: "/images/picks/gold.png" },
  { label: "Holo Pick", src: "/images/picks/holographic.png" },
  { label: "Purple Pick", src: "/images/picks/purple.png" },
  { label: "Red Pick", src: "/images/picks/red.png" },
  { label: "Silver Pick", src: "/images/picks/silver.png" },
  { label: "Black Pick", src: "/images/picks/black.png" },
];

const PRESET_CREW = [
  { label: "Michael", src: "/images/crew/michaelscimeca.png" },
  { label: "Chris", src: "/images/crew/chris.png" },
  { label: "Abbie", src: "/images/crew/abbie.png" },
  { label: "Emily", src: "/images/crew/emily.png" },
];

export default function EditProfileModal() {
  const {
    member,
    isProfileModalOpen,
    profileModalUser,
    closeProfileModal,
    updateProfile,
  } = useMember();

  useScrollLock(isProfileModalOpen);

  const activeUser: Member | null = profileModalUser || member;

  const [activeTab, setActiveTab] = useState<"profile" | "password" | "planner">(
    "profile",
  );
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("");
  const [phone, setPhone] = useState("");
  const [organization, setOrganization] = useState("");
  const [venueName, setVenueName] = useState("");
  const [venueCity, setVenueCity] = useState("");
  const [venueState, setVenueState] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [urlInput, setUrlInput] = useState("");
  const [showUrlField, setShowUrlField] = useState(false);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state when modal opens or activeUser changes
  useEffect(() => {
    if (activeUser && isProfileModalOpen) {
      setName(activeUser.name || "");
      setUsername(activeUser.username || "");
      setEmail(activeUser.email || "");
      setAvatar(activeUser.avatar || "");
      setPhone(activeUser.phone || "");
      setOrganization(activeUser.organization || "");
      setVenueName(activeUser.venueName || "");
      setVenueCity(activeUser.venueCity || "");
      setVenueState(activeUser.venueState || "");
      setNewPassword("");
      setConfirmPassword("");
      setShowPassword(false);
      setUrlInput("");
      setShowUrlField(false);
      setStatusMessage(null);
      setActiveTab("profile");
    }
  }, [activeUser, isProfileModalOpen]);

  // Handle ESC key
  useEffect(() => {
    if (!isProfileModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeProfileModal();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isProfileModalOpen, closeProfileModal]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setStatusMessage({
        text: "Please choose a valid image file (JPG, PNG, WebP).",
        type: "error",
      });
      return;
    }

    setIsProcessingPhoto(true);
    setStatusMessage(null);
    try {
      const dataUrl = await compressImage(file, 300, 300);
      if (dataUrl) {
        setAvatar(dataUrl);
        setStatusMessage({
          text: "Photo loaded! Click 'Save Changes' to update your account.",
          type: "success",
        });
      }
    } catch {
      setStatusMessage({
        text: "Failed to process photo file. Please try another.",
        type: "error",
      });
    } finally {
      setIsProcessingPhoto(false);
    }
  };

  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    setAvatar(trimmed);
    setShowUrlField(false);
    setUrlInput("");
    setStatusMessage({
      text: "Photo URL applied! Click 'Save Changes' to save.",
      type: "success",
    });
  };

  const handleResetToInitials = () => {
    setAvatar("");
    setStatusMessage({
      text: "Profile picture reset to default initials.",
      type: "success",
    });
  };

  const handlePasswordSubmitOnly = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 4) {
      setStatusMessage({
        text: "Password must be at least 4 characters long.",
        type: "error",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatusMessage({
        text: "Passwords do not match. Please verify both fields.",
        type: "error",
      });
      return;
    }

    setIsSaving(true);
    setStatusMessage(null);
    try {
      const res = await updateProfile(
        { password: newPassword },
        profileModalUser,
      );
      if (res.success) {
        setStatusMessage({
          text: `Password for @${username || activeUser?.username || "user"} updated successfully!`,
          type: "success",
        });
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setStatusMessage({
          text: res.error || "Failed to update password.",
          type: "error",
        });
      }
    } catch {
      setStatusMessage({
        text: "An unexpected error occurred while updating password.",
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAll = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!name.trim()) {
      setStatusMessage({
        text: "Full Name cannot be empty.",
        type: "error",
      });
      setActiveTab("profile");
      return;
    }

    if (!isValidEmail(email)) {
      setStatusMessage({
        text: "Please enter a valid email address.",
        type: "error",
      });
      setActiveTab("profile");
      return;
    }

    if (newPassword) {
      if (newPassword.length < 4) {
        setStatusMessage({
          text: "Password must be at least 4 characters long.",
          type: "error",
        });
        setActiveTab("password");
        return;
      }
      if (newPassword !== confirmPassword) {
        setStatusMessage({
          text: "Passwords do not match.",
          type: "error",
        });
        setActiveTab("password");
        return;
      }
    }

    setIsSaving(true);
    setStatusMessage(null);

    const cleanUsername = username.trim().replace(/^@/, "");

    try {
      const res = await updateProfile(
        {
          name: name.trim(),
          username: cleanUsername,
          email: email.trim().toLowerCase(),
          avatar,
          phone: phone.trim(),
          organization: organization.trim(),
          venueName: venueName.trim(),
          venueCity: venueCity.trim(),
          venueState: venueState.trim(),
          ...(newPassword ? { password: newPassword } : {}),
        },
        profileModalUser,
      );

      if (res.success) {
        setStatusMessage({
          text: "Profile updated successfully!",
          type: "success",
        });
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => {
          closeProfileModal();
        }, 900);
      } else {
        setStatusMessage({
          text: res.error || "Failed to update profile.",
          type: "error",
        });
      }
    } catch {
      setStatusMessage({
        text: "An error occurred while saving profile changes.",
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isProfileModalOpen || !activeUser) return null;

  const passwordStrength = getPasswordStrength(newPassword);
  const isPlanner = activeUser.role === "event_planner";
  const isEditingOtherUser =
    profileModalUser && profileModalUser.id !== member?.id;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-profile-modal-title"
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 md:p-6"
    >
      {/* Backdrop */}
      <div
        onClick={closeProfileModal}
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
      />

      {/* Modal Dialog Card */}
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[var(--radius-box)] border border-purple-500/30 bg-[#0c0517] text-white shadow-[0_0_50px_rgba(147,51,234,0.25)]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-purple-500/20 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-purple-400/40 bg-purple-600/20 text-purple-300">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2
                id="edit-profile-modal-title"
                className="text-lg font-bold text-white sm:text-xl"
              >
                {isEditingOtherUser
                  ? `Edit Account: @${activeUser.username || activeUser.name}`
                  : "Edit Profile & Credentials"}
              </h2>
              <p className="text-xs text-purple-200/70 sm:text-sm">
                Change avatar photo, name, username, email, and password.
              </p>
            </div>
          </div>
          <button
            onClick={closeProfileModal}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition-colors hover:bg-white/15 hover:text-white"
            aria-label="Close edit profile modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex border-b border-purple-500/20 bg-black/40 px-5 sm:px-6">
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`cursor-pointer border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
              activeTab === "profile"
                ? "border-purple-400 text-purple-300"
                : "border-transparent text-white/60 hover:text-white"
            }`}
          >
            Profile & Photo
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("password")}
            className={`cursor-pointer border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
              activeTab === "password"
                ? "border-purple-400 text-purple-300"
                : "border-transparent text-white/60 hover:text-white"
            }`}
          >
            Password & Security
          </button>
          {isPlanner && (
            <button
              type="button"
              onClick={() => setActiveTab("planner")}
              className={`cursor-pointer border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                activeTab === "planner"
                  ? "border-purple-400 text-purple-300"
                  : "border-transparent text-white/60 hover:text-white"
              }`}
            >
              Planner Details
            </button>
          )}
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {/* Status Toast */}
          {statusMessage && (
            <div
              className={`mb-5 flex items-center justify-between rounded-[var(--radius-box)] px-4 py-2.5 text-sm ${
                statusMessage.type === "success"
                  ? "border border-emerald-500/40 bg-emerald-950/60 text-emerald-200"
                  : "border border-rose-500/40 bg-rose-950/60 text-rose-200"
              }`}
            >
              <div className="flex items-center gap-2">
                {statusMessage.type === "success" ? (
                  <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                ) : (
                  <X className="h-4 w-4 shrink-0 text-rose-400" />
                )}
                <span>{statusMessage.text}</span>
              </div>
              <button
                onClick={() => setStatusMessage(null)}
                className="cursor-pointer text-white/50 hover:text-white"
              >
                ×
              </button>
            </div>
          )}

          {/* TAB 1: Profile & Photo */}
          {activeTab === "profile" && (
            <div className="flex flex-col gap-6">
              {/* Photo Section */}
              <div className="rounded-[var(--radius-box)] border border-purple-500/20 bg-purple-950/20 p-4 sm:p-5">
                <div className="flex flex-col items-center gap-5 sm:flex-row">
                  {/* Live Avatar Preview */}
                  <div className="relative shrink-0">
                    <Avatar
                      src={avatar}
                      name={name || "User"}
                      size="xl"
                      glow
                      role={activeUser.role === "admin" ? "admin" : "fan"}
                      badge={activeUser.role?.toUpperCase()}
                      badgeColorClass="bg-purple-600/90 border-purple-400 text-white font-bold"
                    />
                  </div>

                  {/* Photo Actions */}
                  <div className="flex-1 flex flex-col gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-white">
                        Profile Picture
                      </h3>
                      <p className="text-xs text-white/60">
                        Upload a photo, pick a guitar pick badge, or paste an
                        image link.
                      </p>
                    </div>

                    {/* Hidden File Input */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="hidden"
                    />

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isProcessingPhoto}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-purple-400/50 bg-purple-600/30 px-3.5 py-1.5 text-xs font-semibold text-purple-200 transition-colors hover:bg-purple-600/50 disabled:opacity-50"
                      >
                        {isProcessingPhoto ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Upload className="h-3.5 w-3.5" />
                        )}
                        Upload Photo
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowUrlField(!showUrlField)}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-white/80 transition-colors hover:bg-white/10"
                      >
                        <Link2 className="h-3.5 w-3.5" />
                        {showUrlField ? "Hide URL" : "Paste URL"}
                      </button>

                      <button
                        type="button"
                        onClick={handleResetToInitials}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-3.5 py-1.5 text-xs font-semibold text-white/60 transition-colors hover:bg-white/5 hover:text-white"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Initials
                      </button>
                    </div>

                    {/* Image URL Input Drawer */}
                    {showUrlField && (
                      <form
                        onSubmit={handleApplyUrl}
                        className="flex gap-2 pt-1"
                      >
                        <input
                          type="url"
                          value={urlInput}
                          onChange={(e) => setUrlInput(e.target.value)}
                          placeholder="https://example.com/avatar.jpg"
                          className="flex-1 rounded-full border border-purple-500/30 bg-black/60 px-3.5 py-1.5 text-xs text-white outline-none focus:border-purple-400"
                        />
                        <button
                          type="submit"
                          className="cursor-pointer rounded-full bg-purple-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-purple-500"
                        >
                          Apply
                        </button>
                      </form>
                    )}

                    {/* Preset Picks Selection */}
                    <div className="pt-1">
                      <span className="block text-[11px] font-medium text-white/50 mb-1.5">
                        Or pick a custom 7th Heaven badge:
                      </span>
                      <div className="flex flex-wrap items-center gap-2">
                        {PRESET_PICKS.map((preset) => (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => setAvatar(preset.src)}
                            title={preset.label}
                            className={`group relative flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded-full border p-0.5 transition-all ${
                              avatar === preset.src
                                ? "border-purple-400 ring-2 ring-purple-400"
                                : "border-white/20 hover:border-purple-400"
                            }`}
                          >
                            <img
                              src={preset.src}
                              alt={preset.label}
                              className="h-full w-full object-contain"
                            />
                          </button>
                        ))}
                        {PRESET_CREW.map((preset) => (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => setAvatar(preset.src)}
                            title={preset.label}
                            className={`group relative flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded-full border transition-all ${
                              avatar === preset.src
                                ? "border-purple-400 ring-2 ring-purple-400"
                                : "border-white/20 hover:border-purple-400"
                            }`}
                          >
                            <img
                              src={preset.src}
                              alt={preset.label}
                              className="h-full w-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Text Fields */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Full Name */}
                <div>
                  <label
                    htmlFor="profile-name-input"
                    className="block text-xs font-semibold text-white/80 mb-1.5"
                  >
                    Full Name <span className="text-purple-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                    <input
                      id="profile-name-input"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. John Doe"
                      required
                      className="w-full rounded-[var(--radius-box)] border border-purple-500/30 bg-black/50 py-2.5 pl-10 pr-4 text-sm text-white outline-none transition-colors focus:border-purple-400"
                    />
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label
                    htmlFor="profile-username-input"
                    className="block text-xs font-semibold text-white/80 mb-1.5"
                  >
                    Username / Handle{" "}
                    <span className="text-white/40 text-[10px]">
                      (@handle for profile URL)
                    </span>
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-purple-400">
                      @
                    </span>
                    <input
                      id="profile-username-input"
                      type="text"
                      value={username}
                      onChange={(e) =>
                        setUsername(
                          e.target.value
                            .replace(/[^a-zA-Z0-9_-]/g, "")
                            .toLowerCase(),
                        )
                      }
                      placeholder="username"
                      className="w-full rounded-[var(--radius-box)] border border-purple-500/30 bg-black/50 py-2.5 pl-9 pr-4 text-sm text-white outline-none transition-colors focus:border-purple-400"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label
                    htmlFor="profile-email-input"
                    className="block text-xs font-semibold text-white/80 mb-1.5"
                  >
                    Email Address <span className="text-purple-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                    <input
                      id="profile-email-input"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      required
                      className="w-full rounded-[var(--radius-box)] border border-purple-500/30 bg-black/50 py-2.5 pl-10 pr-4 text-sm text-white outline-none transition-colors focus:border-purple-400"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label
                    htmlFor="profile-phone-input"
                    className="block text-xs font-semibold text-white/80 mb-1.5"
                  >
                    Phone Number{" "}
                    <span className="text-white/40 text-[10px]">
                      (optional)
                    </span>
                  </label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                    <input
                      id="profile-phone-input"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(555) 000-0000"
                      className="w-full rounded-[var(--radius-box)] border border-purple-500/30 bg-black/50 py-2.5 pl-10 pr-4 text-sm text-white outline-none transition-colors focus:border-purple-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Password & Security */}
          {activeTab === "password" && (
            <div className="flex flex-col gap-5">
              <div className="rounded-[var(--radius-box)] border border-purple-500/20 bg-purple-950/20 p-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-purple-400" />
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      Change Account Password
                    </h3>
                    <p className="text-xs text-white/60">
                      Changing password for username{" "}
                      <strong className="text-purple-300">
                        @{username || activeUser.username || "user"}
                      </strong>{" "}
                      ({email || activeUser.email}).
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* New Password */}
                <div>
                  <label
                    htmlFor="profile-new-password"
                    className="block text-xs font-semibold text-white/80 mb-1.5"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                    <input
                      id="profile-new-password"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full rounded-[var(--radius-box)] border border-purple-500/30 bg-black/50 py-2.5 pl-10 pr-10 text-sm text-white outline-none transition-colors focus:border-purple-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-white/40 hover:text-white"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {newPassword && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden flex gap-1">
                        <div
                          className={`h-full flex-1 rounded-full ${
                            passwordStrength.score >= 1
                              ? passwordStrength.color
                              : "bg-transparent"
                          }`}
                        />
                        <div
                          className={`h-full flex-1 rounded-full ${
                            passwordStrength.score >= 2
                              ? passwordStrength.color
                              : "bg-transparent"
                          }`}
                        />
                        <div
                          className={`h-full flex-1 rounded-full ${
                            passwordStrength.score >= 3
                              ? passwordStrength.color
                              : "bg-transparent"
                          }`}
                        />
                      </div>
                      <span className="text-[11px] font-medium text-white/70">
                        {passwordStrength.label}
                      </span>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="profile-confirm-password"
                    className="block text-xs font-semibold text-white/80 mb-1.5"
                  >
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                    <input
                      id="profile-confirm-password"
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full rounded-[var(--radius-box)] border border-purple-500/30 bg-black/50 py-2.5 pl-10 pr-10 text-sm text-white outline-none transition-colors focus:border-purple-400"
                    />
                    {confirmPassword && confirmPassword === newPassword && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400">
                        <Check className="h-4 w-4" />
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Instant Password Reset Button */}
              {newPassword && (
                <div className="flex justify-end pt-2">
                  <SeventhButton
                    onClick={handlePasswordSubmitOnly}
                    disabled={isSaving}
                    className="cursor-pointer"
                  >
                    {isSaving ? "Updating Password..." : "Update Password Now"}
                  </SeventhButton>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Planner Details (if event_planner) */}
          {activeTab === "planner" && isPlanner && (
            <div className="flex flex-col gap-4">
              <div className="rounded-[var(--radius-box)] border border-purple-500/20 bg-purple-950/20 p-4">
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-purple-400" />
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      Event Planner Information
                    </h3>
                    <p className="text-xs text-white/60">
                      These details automatically pre-fill when you create or
                      manage concert bookings.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Organization */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="planner-org-input"
                    className="block text-xs font-semibold text-white/80 mb-1.5"
                  >
                    Company / Organization Name
                  </label>
                  <div className="relative">
                    <Building2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                    <input
                      id="planner-org-input"
                      type="text"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      placeholder="e.g. Apex Festival Group"
                      className="w-full rounded-[var(--radius-box)] border border-purple-500/30 bg-black/50 py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-purple-400"
                    />
                  </div>
                </div>

                {/* Venue Name */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="planner-venue-input"
                    className="block text-xs font-semibold text-white/80 mb-1.5"
                  >
                    Primary Venue / Festival Name
                  </label>
                  <div className="relative">
                    <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                    <input
                      id="planner-venue-input"
                      type="text"
                      value={venueName}
                      onChange={(e) => setVenueName(e.target.value)}
                      placeholder="e.g. Skyline Amphitheater"
                      className="w-full rounded-[var(--radius-box)] border border-purple-500/30 bg-black/50 py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-purple-400"
                    />
                  </div>
                </div>

                {/* Venue City */}
                <div>
                  <label
                    htmlFor="planner-city-input"
                    className="block text-xs font-semibold text-white/80 mb-1.5"
                  >
                    Venue City
                  </label>
                  <input
                    id="planner-city-input"
                    type="text"
                    value={venueCity}
                    onChange={(e) => setVenueCity(e.target.value)}
                    placeholder="e.g. Chicago"
                    className="w-full rounded-[var(--radius-box)] border border-purple-500/30 bg-black/50 py-2.5 px-4 text-sm text-white outline-none focus:border-purple-400"
                  />
                </div>

                {/* Venue State */}
                <div>
                  <label
                    htmlFor="planner-state-input"
                    className="block text-xs font-semibold text-white/80 mb-1.5"
                  >
                    Venue State
                  </label>
                  <input
                    id="planner-state-input"
                    type="text"
                    value={venueState}
                    onChange={(e) => setVenueState(e.target.value)}
                    placeholder="e.g. IL"
                    className="w-full rounded-[var(--radius-box)] border border-purple-500/30 bg-black/50 py-2.5 px-4 text-sm text-white outline-none focus:border-purple-400"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-purple-500/20 bg-black/40 px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={closeProfileModal}
            className="cursor-pointer rounded-full border border-white/20 bg-white/5 px-5 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/10"
          >
            Cancel
          </button>

          <SeventhButton
            onClick={handleSaveAll}
            disabled={isSaving}
            className="cursor-pointer"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </span>
            ) : (
              "Save Changes"
            )}
          </SeventhButton>
        </div>
      </div>
    </div>
  );
}
