"use client";

import React from "react";
import Avatar from "./Avatar";

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
  as?: "h1" | "h2" | "h3";
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
  nameClassName = "text-xl sm:text-2xl lg:text-3xl break-words",
  children,
  as: HeadingTag = "h1",
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
    (isMichael ? "/images/crew/michaelscimeca.png" : avatar);

  return (
    <div className={`flex items-start gap-4 sm:gap-6  mb-3 ${className}`}>
      {/* Member Avatar with attached bottom pill badge */}
      <Avatar
        src={effectiveAvatar}
        name={name}
        size="lg"
        badge={badgeLabel}
        badgeColorClass={badgeColorClass}
        glow
        border="border-2 border-purple-400/40"
      />

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
        </div>
        {email && <p>{email}</p>}
        {subtitle && <p className="mt-0">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}

export default MemberHeaderBadge;
