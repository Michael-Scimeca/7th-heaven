'use client';

import React from 'react';

/**
 * Shared CheckIcon — the single source of truth for all checkmark icons.
 *
 * Sizes:
 *   xs  =  8px  (tiny inline indicators)
 *   sm  = 10px  (default — inside CheckboxCircle)
 *   md  = 16px  (medium confirmation checks)
 *   lg  = 28px  (large success/confirmation icons)
 *   xl  = 32px  (hero success screens)
 *   custom = any number (px)
 */

const SIZES = {
  xs: 8,
  sm: 10,
  md: 16,
  lg: 28,
  xl: 32
} as const;
type SizeKey = keyof typeof SIZES;
interface CheckIconProps {
  /** Preset size or custom pixel value */
  size?: SizeKey | number;
  /** Stroke color — default white */
  color?: string;
  /** Extra className on the SVG element */
  className?: string;
}
export default function CheckIcon({
  size = 'sm',
  color = '#ffffff',
  className = ''
}: CheckIconProps) {
  const px = typeof size === 'number' ? size : SIZES[size];

  // Scale strokeWidth inversely with size for optical balance
  const strokeWidth = px <= 10 ? 4 : px <= 16 ? 3 : 2.5;
  return <svg width={px} height={px} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>;
}