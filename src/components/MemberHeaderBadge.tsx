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
  nameClassName = "text-xl sm:text-2xl lg:text-3xl         break-words",
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
          <div className="h-14 w-14 overflow-hidden rounded-full border-2 border-purple-400/40 shadow-[0_0_25px_rgba(168,85,247,0.3)] sm:h-16 sm:w-16">
            <Image
              width={80}
              height={80}
              unoptimized
              src={effectiveAvatar!}
              alt={name}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border-2 border-purple-400/30 bg-gradient-to-br from-purple-600/40 to-indigo-900/60 shadow-[0_0_25px_rgba(168,85,247,0.25)] sm:h-16 sm:w-16 sm:text-xl">
            {initials}
          </div>
        )}
        {badgeLabel && (
          <span
            className={`r absolute -bottom-1 left-1/2 z-10 -translate-x-1/2 rounded-full border px-2.5 py-0.5 text-[10px] whitespace-nowrap shadow-md ${badgeColorClass}`}
          >
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
              className={`r inline-flex items-center gap-1.5 rounded-full border px-3 py-1 ${statusColorClass}`}
            >
              <span className="h-2 w-2 animate-pulse rounded-full bg-rose-500" />
              {statusBadge}
            </span>
          )}
        </div>
        {email && <p>{email}</p>}
        {subtitle && <p className="mt-0 sm:text-base">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}

export default MemberHeaderBadge;
