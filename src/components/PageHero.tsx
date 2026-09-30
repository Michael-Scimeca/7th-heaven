"use client";

import React from "react";
import { Stack } from "./Stack";
import { SectionBadge } from "./SectionBadge";

export interface PageHeroProps {
  badge?: string | React.ReactNode;
  title: React.ReactNode;
  titleId?: string;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  align?: "left" | "center";
  children?: React.ReactNode;
  className?: string;
  as?: React.ElementType;
  /** Override the title→subtitle gap for this one instance, e.g. "1.5rem". */
  titleGap?: string;
}

export function PageHero({
  badge,
  title,
  titleId,
  subtitle,
  actions,
  align = "left",
  children,
  className = "",
  as: Component = "header",
  titleGap,
}: PageHeroProps) {
  const isCenter = align === "center";
  const Comp = Component as any;
  const gapStyle = titleGap
    ? ({ "--title-gap": titleGap } as React.CSSProperties)
    : undefined;

  return (
    <Comp className={`w-full ${className}`.trim()}>
      {actions && !isCenter ? (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between w-full">
          <Stack gap="xs" className="max-w-3xl items-start text-left">
            {badge && (
              <div>
                {typeof badge === "string" ? (
                  <SectionBadge label={badge} />
                ) : (
                  badge
                )}
              </div>
            )}
            <div
              className={`title-group title-group--page w-full ${isCenter ? "items-center text-center" : "items-start text-left"}`}
              style={gapStyle}
            >
              <h1
                id={titleId}
                className={`text-h1 font-black tracking-tight text-primary w-full ${isCenter ? "text-center" : "text-left"}`}
              >
                {title}
              </h1>
              {subtitle && (
                <p
                  className={`text-body text-muted max-w-2xl w-full ${isCenter ? "mx-auto text-center" : "text-left"}`}
                >
                  {subtitle}
                </p>
              )}
            </div>
          </Stack>
          <div className="shrink-0 flex flex-wrap items-center gap-3">
            {actions}
          </div>
        </div>
      ) : (
        <Stack
          gap="xs"
          className={
            isCenter
              ? "mx-auto max-w-3xl items-center text-center"
              : "max-w-3xl items-start text-left"
          }
        >
          {badge && (
            <div>
              {typeof badge === "string" ? (
                <SectionBadge label={badge} />
              ) : (
                badge
              )}
            </div>
          )}
          <div
            className={`title-group title-group--page w-full ${isCenter ? "items-center text-center" : "items-start text-left"}`}
            style={gapStyle}
          >
            <h1
              id={titleId}
              className={`text-h1 font-black tracking-tight text-primary w-full ${isCenter ? "text-center" : "text-left"}`}
            >
              {title}
            </h1>
            {subtitle && (
              <p
                className={`text-body text-muted max-w-2xl w-full ${isCenter ? "mx-auto text-center" : "text-left"}`}
              >
                {subtitle}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
              {actions}
            </div>
          )}
        </Stack>
      )}
      {children && <div className="w-full mt-4">{children}</div>}
    </Comp>
  );
}

export default PageHero;
