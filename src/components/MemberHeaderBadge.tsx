/* eslint-disable react-doctor/no-high-complexity-react-function */
"use client";

import React from "react";
import Image from "next/image";

export interface MemberHeaderBadgeProps {
  name?: string;
  email?: string;
  avatar?: string;
  badgeLabel?: string;
  badgeColorClass?: string;
  statusBadge?: React.ReactNode | string;
  statusColorClass?: string;
  subtitle?: React.ReactNode | string;
  className?: string;
  nameClassName?: string;
  children?: React.ReactNode;
}

export function MemberHeaderBadge({
  name = "Cruise Guest",
  email = "",
  avatar,
  badgeLabel = "Cruise",
  badgeColorClass = "bg-purple-600/80 border-purple-400/50 text-purple-100",
  statusBadge,
  statusColorClass = "bg-rose-950/60 border-rose-500/50 text-rose-300",
  subtitle,
  className = "",
  nameClassName = "text-xl sm:text-2xl lg:text-3xl    text-white    break-words",
  children,
}: MemberHeaderBadgeProps) {
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
    (isMichael ? "/michaelscimeca.png" : undefined);

  const hasAvatarUrl =
    effectiveAvatar &&
    (effectiveAvatar.startsWith("http") ||
      effectiveAvatar.startsWith("/") ||
      effectiveAvatar.startsWith("data:"));

  const initials = (name || "CG")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={`flex items-start gap-4 sm:gap-6 ${className}`}>
      {/* Member Avatar with attached bottom pill badge */}
      <div className="relative shrink-0 pb-2">
        {hasAvatarUrl ? (
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-purple-400/40 shadow-[0_0_25px_rgba(168,85,247,0.3)]">
            <Image
 width={80}
 height={80}
 unoptimized
 src={effectiveAvatar!}
 alt={name}
 className="w-full h-full object-cover"
 />
          </div>
        ) : (
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-lg sm:text-xl bg-gradient-to-br from-purple-600/40 to-indigo-900/60 border-2 border-purple-400/30 overflow-hidden text-white shadow-[0_0_25px_rgba(168,85,247,0.25)]">
            {initials}
          </div>
        )}
        {badgeLabel && (
          <span
 className={`absolute -bottom-1 left-1/2 -translate-x-1/2 px-2.5 py-0.5 text-[10px] r uppercase rounded-full border shadow-md whitespace-nowrap z-10 ${badgeColorClass}`}>
            {badgeLabel}
          </span>
        )}
      </div>

      {/* Member Info */}
      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <h2 className={nameClassName}>{name}</h2>
          {statusBadge && (
            <span
 className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs uppercase r border ${statusColorClass}`}>
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              {statusBadge}
            </span>
          )}
        </div>
        {email && <p className="text-white/70 text-sm ">{email}</p>}
        {subtitle && (
          <p className="text-white/80 text-sm sm:text-base font-semibold mt-2">
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </div>
  );
}

export default MemberHeaderBadge;
