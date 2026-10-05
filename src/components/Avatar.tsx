"use client";

import React, { useState } from "react";
import Image from "next/image";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
export type AvatarRole = "admin" | "crew" | "fan";

export interface AvatarProps {
  /** Image source URL or path (e.g. /images/crew/emily.png or http...). If omitted or invalid, falls back to initials. */
  src?: string | null;
  /** Full name of the user, used for alt text, auto initials, and crew lookup. */
  name?: string;
  /** Explicit initials (e.g. "MA", "SF") to override automatic initials calculation. */
  initials?: string;
  /** Size variant of the avatar */
  size?: AvatarSize;
  /** Bottom badge text or custom React element (e.g. "ADMIN", "CREW", "FAN") */
  badge?: React.ReactNode | string;
  /** Custom Tailwind classes for the badge */
  badgeColorClass?: string;
  /** User role for theme-specific border & default badge styling */
  role?: AvatarRole;
  /** Shape: "circle" (default) or "square" */
  shape?: "circle" | "square";
  /** Optional purple neon glow effect */
  glow?: boolean;
  /** Border style override (pass boolean for default theme border, or string for custom classes) */
  border?: boolean | string;
  /** Additional classes for the avatar container */
  className?: string;
  /** Additional classes for the image element */
  imageClassName?: string;
  /** Next.js Image unoptimized flag */
  unoptimized?: boolean;
  /** Accessible alt text */
  alt?: string;
  /** Optional click handler */
  onClick?: () => void;
}

const SIZE_CLASSES: Record<AvatarSize, { container: string; text: string; badge: string; pxSize: number }> = {
  xs: { container: "h-5 w-5 min-w-5", text: "text-[9px]", badge: "text-[7px] px-1 py-0", pxSize: 20 },
  sm: { container: "h-8 w-8 min-w-8", text: "text-xs", badge: "text-[8px] px-1.5 py-0.5", pxSize: 32 },
  md: { container: "h-11 w-11 min-w-11", text: "text-sm", badge: "text-[9px] px-2 py-0.5", pxSize: 44 },
  lg: { container: "h-14 w-14 min-w-14 sm:h-16 sm:w-16 sm:min-w-16", text: "text-base sm:text-lg", badge: "text-[10px] px-2.5 py-0.5", pxSize: 56 },
  xl: { container: "h-16 w-16 min-w-16 sm:h-20 sm:w-20 sm:min-w-20", text: "text-lg sm:text-xl", badge: "text-[10px] px-2.5 py-0.5", pxSize: 64 },
  "2xl": { container: "h-20 w-20 min-w-20 sm:h-24 sm:w-24 sm:min-w-24", text: "text-xl sm:text-2xl", badge: "text-[11px] px-3 py-0.5", pxSize: 80 },
};

const ROLE_BORDER: Record<AvatarRole, string> = {
  admin: "border-2 border-purple-400/50",
  crew: "border-2 border-purple-400/40",
  fan: "border-2 border-white/20",
};

const ROLE_BADGE: Record<AvatarRole, string> = {
  admin: "bg-purple-600/80 border-purple-400/50 text-purple-100",
  crew: "bg-purple-600/70 border-purple-400/40 text-purple-100",
  fan: "bg-white/10 border-white/20 text-white",
};

/**
 * Resolves standard crew member and band member photos from names if no explicit avatar URL was provided.
 */
export function resolveAvatarUrl(name?: string, avatar?: string | null): string {
  if (
    avatar &&
    (avatar.startsWith("http") || avatar.startsWith("/") || avatar.startsWith("data:")) &&
    !avatar.includes("ui-avatars.com")
  ) {
    return avatar;
  }
  if (!name) return "";
  const lower = name.toLowerCase();

  // Band members
  if (lower.includes("adam")) return "/images/members/adam.webp";
  if (lower.includes("nick")) return "/images/members/nick.webp";
  if (lower.includes("mark")) return "/images/members/mark.webp";
  if (lower.includes("frankie") || lower.includes("harchut")) return "/images/members/frankie.webp";
  if (lower.includes("richard") || lower.includes("hofherr") || lower.includes("dicky"))
    return "/images/members/dicky.webp";

  // Crew & Management
  if (lower.includes("michael") || lower.includes("scimeca")) return "/images/crew/michaelscimeca.png";
  if (lower.includes("abbie")) return "/images/crew/abbie.png";
  if (lower.includes("al") && lower.includes("hollie")) return "/images/crew/al.png";
  if (lower.includes("andrea")) return "/images/crew/andrea.png";
  if (lower.includes("arjun")) return "/images/crew/arjun.png";
  if (lower.includes("chris")) return "/images/crew/chris.png";
  if (lower.includes("colin") || lower.includes("farrell")) return "/images/crew/chris.png";
  if (lower.includes("daniel")) return "/images/crew/daniel.png";
  if (lower.includes("croke")) return "/images/crew/dave_croke.png";
  if (lower.includes("maas")) return "/images/crew/dave_maas.png";
  if (lower.includes("xu")) return "/images/crew/david_xu.png";
  if (lower.includes("emily")) return "/images/crew/emily.png";
  if (lower.includes("emma")) return "/images/crew/emma.png";
  if (lower.includes("erin")) return "/images/crew/erin.png";
  if (lower.includes("francesca")) return "/images/crew/francesca.png";
  if (lower.includes("john") && lower.includes("wick")) return "/images/crew/john_wick.png";
  if (lower.includes("john")) return "/images/crew/john_doe.png";

  return "";
}

export function Avatar({
  src,
  name = "",
  initials: explicitInitials,
  size = "md",
  badge,
  badgeColorClass,
  role = "fan",
  shape = "circle",
  glow = false,
  border = true,
  className = "",
  imageClassName = "",
  unoptimized = true,
  alt,
  onClick,
}: AvatarProps) {
  const [imgError, setImgError] = useState(false);

  // If src is a 1-3 letter string without slashes or protocols, treat as explicit initials
  const isSrcInitials =
    typeof src === "string" &&
    src.trim().length > 0 &&
    src.trim().length <= 3 &&
    !src.includes("/") &&
    !src.includes("http") &&
    !src.includes("data:");

  const isInitialsPath =
    typeof explicitInitials === "string" &&
    (explicitInitials.includes("/") ||
      explicitInitials.includes("http") ||
      explicitInitials.includes("data:"));

  const effectiveSrc = isInitialsPath ? explicitInitials : src;
  const validExplicitInitials = isInitialsPath ? undefined : explicitInitials;

  const resolvedSrc = isSrcInitials ? "" : resolveAvatarUrl(name, effectiveSrc);

  const displayInitials =
    validExplicitInitials ||
    (isSrcInitials ? (src as string).toUpperCase() : "") ||
    (name
      ? name
        .trim()
        .split(/\s+/)
        .map((part) => part[0])
        .filter(Boolean)
        .join("")
        .slice(0, 2)
        .toUpperCase()
      : "7H");

  const sizeConfig = SIZE_CLASSES[size];
  const roundedClass = shape === "circle" ? "rounded-full" : "rounded-lg";

  const borderClass =
    typeof border === "string"
      ? border
      : border
        ? ROLE_BORDER[role] || "border-2 border-purple-400/40"
        : "border-0";

  const glowClass = glow
    ? "shadow-[0_0_25px_rgba(168,85,247,0.3)]"
    : "";

  const effectiveBadge = badge ?? (role === "admin" ? "ADMIN" : undefined);
  const effectiveBadgeClass =
    badgeColorClass || ROLE_BADGE[role] || ROLE_BADGE.fan;

  const hasImage = Boolean(resolvedSrc && !imgError);

  const content = (
    <div
      className={`relative inline-flex shrink-0 ${hasImage || effectiveBadge ? "pb-1" : ""} ${className}`}
      onClick={onClick}
    >
      <div
        className={`relative flex aspect-square shrink-0 items-center justify-center overflow-hidden ${roundedClass} ${sizeConfig.container} ${borderClass} ${glowClass}`}
      >
        {hasImage ? (
          <Image
            src={resolvedSrc}
            alt={alt || name || "Avatar"}
            width={sizeConfig.pxSize * 2}
            height={sizeConfig.pxSize * 2}
            unoptimized={unoptimized}
            onError={() => setImgError(true)}
            className={`h-full w-full object-cover ${roundedClass} ${imageClassName}`}
          />
        ) : (
          <div
            className={`flex h-full w-full items-center justify-center bg-gradient-to-tr from-purple-600/30 to-pink-600/30 text-white select-none ${roundedClass} ${sizeConfig.text}`}
          >
            {displayInitials}
          </div>
        )}
      </div>

      {effectiveBadge && (
        <span
          className={`pointer-events-none absolute -bottom-1 left-1/2 z-10 -translate-x-1/2 rounded-full border tracking-wider whitespace-nowrap shadow-md ${sizeConfig.badge} ${effectiveBadgeClass}`}
        >
          {effectiveBadge}
        </span>
      )}
    </div>
  );

  return content;
}

export default Avatar;
