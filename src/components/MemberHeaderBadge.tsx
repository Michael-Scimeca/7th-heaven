"use client";

import React from "react";
import { Edit } from "lucide-react";
import Avatar from "./Avatar";
import { useMember } from "@/context/MemberContext";

export interface MemberHeaderBadgeProps {
  name?: string;
  email?: string;
  username?: string;
  avatar?: string;
  badgeLabel?: string;
  badgeColorClass?: string;
  statusBadge?: React.ReactNode | string;
  statusColorClass?: string;
  subtitle?: React.ReactNode | string;
  className?: string;
  nameClassName?: string;
  children?: React.ReactNode;
  as?: "h1" | "h2" | "h3";
  allowEdit?: boolean;
  onEditClick?: () => void;
}

export function MemberHeaderBadge({
  name = "Cruise Guest",
  email = "",
  username = "",
  avatar,
  badgeLabel = "Cruise",
  badgeColorClass = "bg-purple-600/80 border-purple-400/50 text-purple-100",
  statusBadge,
  statusColorClass = "bg-rose-950/60 border-rose-500/50 text-rose-300",
  subtitle,
  className = "",
  nameClassName = "text-xl sm:text-2xl lg:text-3xl break-words",
  children,
  as: HeadingTag = "h1",
  allowEdit = true,
  onEditClick,
}: MemberHeaderBadgeProps) {
  const { openProfileModal } = useMember();

  const isAvatarUrl =
    avatar &&
    (avatar.startsWith("http") ||
      avatar.startsWith("/") ||
      avatar.startsWith("data:"));

  const isMichael =
    (name && name.toLowerCase().includes("michael")) ||
    (email && email.toLowerCase().includes("michael"));

  const effectiveAvatar =
    (isAvatarUrl ? avatar : undefined) ??
    (isMichael ? "/images/crew/michaelscimeca.png" : avatar);

  const handleEdit = () => {
    if (onEditClick) {
      onEditClick();
    } else {
      openProfileModal();
    }
  };

  return (
    <div className={`flex items-start gap-4 sm:gap-6 mb-3 ${className}`}>
      {/* Member Avatar with attached bottom pill badge and hover edit trigger */}
      <div className="relative group">
        <Avatar
          src={effectiveAvatar}
          name={name}
          size="lg"
          badge={badgeLabel}
          badgeColorClass={badgeColorClass}
          glow
          border="border-2 border-purple-400/40"
          onClick={allowEdit ? handleEdit : undefined}
          className={allowEdit ? "cursor-pointer" : ""}
        />
        {allowEdit && (
          <button
            type="button"
            onClick={handleEdit}
            title="Edit Profile & Photo"
            className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-full bg-black/60 opacity-0 transition-opacity duration-200 group-hover:opacity-100 cursor-pointer text-white"
          >
            <Edit className="h-4 w-4 text-purple-300" />
            <span className="text-[9px] font-semibold text-purple-200">Edit</span>
          </button>
        )}
      </div>

      {/* Member Info */}
      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <HeadingTag className={nameClassName}>{name}</HeadingTag>
          {statusBadge && (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wider ${statusColorClass}`}
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-500" />
              {statusBadge}
            </span>
          )}
          {allowEdit && (
            <button
              type="button"
              onClick={handleEdit}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-purple-400/40 bg-purple-600/20 px-3 py-1 text-xs font-semibold text-purple-200 transition-colors hover:bg-purple-600/35 hover:text-white"
            >
              <Edit className="h-3.5 w-3.5" />
              <span>Edit Profile</span>
            </button>
          )}
        </div>
        {username && (
          <p className="text-xs font-medium text-purple-400/90 mt-0.5">
            @{username.replace(/^@/, "")}
          </p>
        )}
        {email && <p className="text-sm text-white/70">{email}</p>}
        {subtitle && <p className="mt-0 text-xs text-white/50">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}

export default MemberHeaderBadge;
