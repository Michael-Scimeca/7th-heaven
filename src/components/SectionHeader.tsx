import React from "react";
import type { LucideIcon } from "lucide-react";
import SectionBadge from "./SectionBadge";

export interface SectionHeaderProps {
  id?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: string | React.ReactNode;
  icon?: LucideIcon;
  as?: "h1" | "h2" | "h3";
  action?: React.ReactNode;
  divider?: boolean;
  align?: "left" | "center";
  className?: string;
  srOnly?: boolean;
  visuallyHidden?: boolean;
  /** Override the title→subtitle gap for this one instance, e.g. "1rem". */
  titleGap?: string;
}

export function SectionHeader({
  id,
  title,
  subtitle,
  badge,
  icon: Icon,
  as = "h2",
  action,
  divider = true,
  align = "left",
  className = "",
  srOnly = false,
  visuallyHidden = false,
  titleGap,
}: SectionHeaderProps) {
  const Component = as;
  const isH2 = as === "h2";
  const isSrOnly = srOnly || visuallyHidden;
  const isCenter = align === "center";

  if (isSrOnly) {
    return (
      <Component id={id} className="sr-only">
        {title}
      </Component>
    );
  }

  return (
    <div
      className={`w-full ${divider ? (isH2 ? "border-b border-white/10 pb-4 mb-4" : "border-b border-white/10 pb-3 mb-3") : isH2 ? "mb-4" : "mb-3"} ${className}`}
    >
      {badge && (
        <div className={`mb-2 ${isCenter ? "flex justify-center" : ""}`}>
          {typeof badge === "string" ? <SectionBadge label={badge} /> : badge}
        </div>
      )}
      <div
        className={`title-group ${isH2 || as === "h1" ? "title-group--section" : "title-group--sub"} ${isCenter ? "items-center text-center" : "items-start text-left"}`}
        style={titleGap ? ({ "--title-gap": titleGap } as React.CSSProperties) : undefined}
      >
        {action ? (
          <div className={`flex items-center gap-4 w-full ${isCenter ? "justify-center" : "justify-between"}`}>
            <Component
              id={id}
              className={`${isH2 ? "text-h2" : as === "h1" ? "text-h1" : "text-h3"} text-primary   tracking-tight`}
            >
              {title}
            </Component>
            <div className="shrink-0">{action}</div>
          </div>
        ) : (
          <Component
            id={id}
            className={`${isH2 ? "text-h2" : as === "h1" ? "text-h1" : "text-h3"} text-primary   tracking-tight w-full`}
          >
            {title}
          </Component>
        )}

        {subtitle && (
          <p className={`${isH2 ? "text-muted" : "text-small"} ${isCenter ? "mx-auto" : ""}`}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

export default SectionHeader;

