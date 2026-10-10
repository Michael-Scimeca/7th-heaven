"use client";

import React, { forwardRef } from "react";
import TransitionLink from "@/components/TransitionLink";
import { cn } from "@/lib/utils";
import { UrlObject } from "url";

export interface NavLinkButtonProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string | UrlObject;
  variant?: "primary" | "secondary" | "ghost" | "outline" | "subtle";
  color?: "purple" | "cyan" | "emerald" | "rose" | "amber" | "white" | "muted";
  size?: "none" | "xs" | "sm" | "md" | "lg";
  fontWeight?: "normal" | "medium" | "semibold" | "bold" | "extrabold";
  uppercase?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  children?: React.ReactNode;
}

const variantStyles: Record<NonNullable<NavLinkButtonProps["variant"]>, string> = {
  primary: "bg-purple-600 text-white hover:bg-purple-500 shadow-md border border-purple-500/30",
  secondary: "border border-white/10 bg-black/40 backdrop-blur-md hover:bg-white/10 hover:border-white/20",
  ghost: "bg-transparent hover:bg-white/10",
  outline: "border border-current hover:bg-white/10",
  subtle: "border border-white/10 bg-white/5 hover:bg-white/10",
};

const colorStyles: Record<NonNullable<NavLinkButtonProps["color"]>, string> = {
  purple: "text-purple-300 hover:text-purple-100",
  cyan: "text-cyan-400 hover:text-cyan-200",
  emerald: "text-emerald-400 hover:text-emerald-200",
  rose: "text-rose-400 hover:text-rose-200",
  amber: "text-amber-400 hover:text-amber-200",
  white: "text-white hover:text-white/80",
  muted: "text-white/70 hover:text-white",
};

const sizeStyles: Record<NonNullable<NavLinkButtonProps["size"]>, string> = {
  none: "p-0 text-xs sm:text-sm gap-1.5",
  xs: "px-2.5 py-1 text-xs gap-1",
  sm: "px-3.5 py-1.5 text-xs sm:text-sm gap-1.5",
  md: "px-4.5 py-2 text-sm sm:text-base gap-2",
  lg: "px-6 py-3 text-base sm:text-lg gap-2.5",
};

const weightStyles: Record<NonNullable<NavLinkButtonProps["fontWeight"]>, string> = {
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
  extrabold: "font-extrabold",
};

export const NavLinkButton = forwardRef<HTMLAnchorElement, NavLinkButtonProps>(
  (
    {
      href,
      variant = "ghost",
      color = "purple",
      size = "sm",
      fontWeight = "semibold",
      uppercase = false,
      icon,
      iconPosition = "left",
      className,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <TransitionLink
        href={href}
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-[var(--radius-box)] transition-all duration-200 cursor-pointer select-none",
          variantStyles[variant],
          variant !== "primary" ? colorStyles[color] : "",
          sizeStyles[size],
          weightStyles[fontWeight],
          uppercase ? "uppercase tracking-wider" : "",
          className,
        )}
        {...props}
      >
        {icon && iconPosition === "left" && (
          <span className="shrink-0">{icon}</span>
        )}
        {children && <span>{children}</span>}
        {icon && iconPosition === "right" && (
          <span className="shrink-0">{icon}</span>
        )}
      </TransitionLink>
    );
  },
);

NavLinkButton.displayName = "NavLinkButton";

export default NavLinkButton;
