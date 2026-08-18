"use client";

import Link, { LinkProps } from "next/link";
import { AnchorHTMLAttributes, MouseEvent, ReactNode, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTransition } from "@/context/TransitionContext";

type TransitionLinkProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps | "href"> & {
    children: ReactNode;
  };

/**
 * Drop-in replacement for next/link's <Link> that routes real page-to-page
 * navigations through the curtain transition (see PageTransition.tsx)
 * while prefetching target route payloads instantly on hover / focus / touch.
 */
export default function TransitionLink({
  href,
  children,
  onClick,
  onMouseEnter,
  onPointerEnter,
  onTouchStart,
  onFocus,
  ...rest
}: TransitionLinkProps) {
  const router = useRouter();
  const { requestTransition } = useTransition();

  const handlePrefetch = useCallback(() => {
    const targetHref = typeof href === "string" ? href : href.pathname ?? "";
    if (targetHref && !targetHref.includes("#")) {
      router.prefetch(targetHref);
    }
  }, [href, router]);

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
      return;
    }

    const targetHref = typeof href === "string" ? href : href.pathname ?? "";
    if (!targetHref || targetHref.includes("#")) return; // anchor scroll, not a page change
    const currentPathname = typeof window !== "undefined" ? window.location.pathname : "";
    if (targetHref === currentPathname) return; // already there

    e.preventDefault();
    requestTransition(targetHref);
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      onMouseEnter={(e) => {
        onMouseEnter?.(e);
        handlePrefetch();
      }}
      onPointerEnter={(e) => {
        onPointerEnter?.(e);
        handlePrefetch();
      }}
      onTouchStart={(e) => {
        onTouchStart?.(e);
        handlePrefetch();
      }}
      onFocus={(e) => {
        onFocus?.(e);
        handlePrefetch();
      }}
      {...rest}
    >
      {children}
    </Link>
  );
}
