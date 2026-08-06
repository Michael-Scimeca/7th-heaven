'use client';

import React from 'react';
import CheckIcon from './CheckIcon';

/**
 * Shared CheckboxCircle — purple circular badge with white checkmark.
 * Used across admin panels, emergency broadcast, role rosters, etc.
 *
 * Container: w-4 h-4 rounded-full (was w-5 h-5 — reduced by 2px)
 * Checkmark: 10px white (was 11-12px — reduced by 2px)
 */

interface CheckboxCircleProps {
  checked: boolean;
  /** Extra className on the outer container */
  className?: string;
}
export default function CheckboxCircle({
  checked,
  className = ''
}: CheckboxCircleProps) {
  return <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 select-none transition-colors ${checked ? 'bg-purple-600 border-purple-400 text-white' : 'bg-black/60 border-white/30'} ${className}`}>
      {checked && <CheckIcon size="xs" />}
    </div>;
}