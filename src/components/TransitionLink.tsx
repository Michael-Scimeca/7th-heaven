"use client";

import Link, { LinkProps } from "next/link";
import { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const { requestTransition } = useTransition();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
      return;
    }

    const targetHref = typeof href === "string" ? href : href.pathname ?? "";
    if (!targetHref || targetHref.includes("#")) return; // anchor scroll, not a page change
    if (targetHref === pathname) return; // already there

    e.preventDefault();
    requestTransition(targetHref);
  };

  return (
    <Link href={href} onClick={handleClick} {...rest}>
      {children}
    </Link>
  );
}
