'use client';

import React from 'react';

export interface CalendarBadgeIconProps {
  month?: string;
  day?: string | number;
  width?: number | string;
  height?: number | string;
  className?: string;
}

export function CalendarBadgeIcon({
  month = 'JUL',
  day = '17',
  width = 120,
  height = 120,
  className = '',
}: CalendarBadgeIconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${className}`}
    >
      <defs>
        {/* Drop shadow underneath calendar card */}
        <filter id="cal-badge-shadow" x="-10%" y="-10%" width="125%" height="125%">
          <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.4" />
        </filter>

        {/* Header Red/Coral Gradient */}
        <linearGradient id="cal-badge-header-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d15a5a" />
          <stop offset="100%" stopColor="#b74949" />
        </linearGradient>
      </defs>

      <g filter="url(#cal-badge-shadow)">
        {/* White Card Base Body */}
        <rect x="10" y="10" width="80" height="80" rx="3" fill="#eeeeee" />

        {/* Top Header Section (Red/Coral) */}
        <path
          d="M 10 13 C 10 11.34 11.34 10 13 10 L 87 10 C 88.66 10 90 11.34 90 13 L 90 38 L 10 38 Z"
          fill="url(#cal-badge-header-grad)"
        />

        {/* Separator line between header & body */}
        <line x1="10" y1="38" x2="90" y2="38" stroke="#d5d5d5" strokeWidth="1" />

        {/* Binder Rings/Holes at the top */}
        <circle cx="28" cy="18" r="4.5" fill="#1e1828" />
        <circle cx="72" cy="18" r="4.5" fill="#1e1828" />

        {/* Month Abbreviation Text (e.g. JUL) */}
        <text
          x="22"
          y="32"
          fill="#ffffff"
          fontSize="13"
          fontWeight="800"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="0.05em"
        >
          {month.toUpperCase()}
        </text>

        {/* Mini Calendar Grid Dots/Numbers on Header Right */}
        <g fill="#ffffff" opacity="0.65" fontSize="3" fontFamily="monospace">
          <text x="56" y="24">1 2 3 4 5</text>
          <text x="56" y="28">6 7 8 9 10</text>
          <text x="56" y="32">11 12 13 14</text>
        </g>

        {/* Day Number (e.g. 17) */}
        <text
          x="50"
          y="74"
          fill="#333333"
          fontSize="36"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          textAnchor="middle"
          dominantBaseline="central"
        >
          {day}
        </text>
      </g>
    </svg>
  );
}

export default CalendarBadgeIcon;
