"use client";

import Link, { LinkProps } from "next/link";
import { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";
import { useTransition } from "@/context/TransitionContext";

type TransitionLinkProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps | "href"> & {
    children: ReactNode;
  };

/**
 * Drop-in replacement for next/link's <Link> that routes real page-to-page
 * navigations through the curtain transition (see PageTransition.tsx)
 * instead of Next's default instant client-side swap.
 *
 * Falls through to plain <Link> behavior (no interception) for:
 *   - modified clicks (cmd/ctrl/shift/middle-click) — let the browser open
 *     a new tab as normal.
 *   - same-page hash links (e.g. "/#band") — those are scroll anchors, not
 *     route changes, and shouldn't trigger the curtain.
 *   - a link to the page you're already on.
 */
export default function TransitionLink({
  href,
  children,
  onClick,
  ...rest
}: TransitionLinkProps) {
  return (
    <Link href={href} onClick={onClick} {...rest}>
      {children}
    </Link>
  );
}
