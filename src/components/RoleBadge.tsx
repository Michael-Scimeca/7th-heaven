'use client';

import React from 'react';

export type UserRole = 'fan' | 'crew' | 'admin';

interface RoleBadgeProps {
 role: UserRole;
 size?: 'sm' | 'md';
 showLabel?: boolean;
 className?: string;
}

const roleConfig = {
 fan: {
  label: 'FAN',
  color: 'text-white/70',
  bg: 'bg-white/[0.08]',
  border: 'border-white/10',
  glow: '',
 },
 crew: {
  label: 'CREW',
  color: 'text-purple-300',
  bg: 'bg-purple-600/20',
  border: 'border-purple-500/35',
  glow: 'shadow-[0_0_8px_rgba(168,85,247,0.2)]',
 },
 admin: {
  label: 'ADMIN',
  color: 'text-[var(--color-purple-light)]',
  bg: 'bg-[var(--color-purple-glow)]',
  border: 'border-[var(--color-border-purple)]',
  glow: 'shadow-[0_0_8px_var(--color-purple-glow)]',
 },
};

/* ── SVG Icons ── */
function StarIcon({ size }: { size: number }) {
 return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
   <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
 );
}

function ShieldIcon({ size }: { size: number }) {
 return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
   <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
 );
}

function CrownIcon({ size }: { size: number }) {
 return (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
   <path d="M2 20h20v2H2v-2zm1-7l4 5h10l4-5-3-6-4 4-2-7-2 7-4-4-3 6z" />
  </svg>
 );
}

const iconMap = {
 fan: StarIcon,
 crew: ShieldIcon,
 admin: CrownIcon,
};

export default function RoleBadge({ role, size = 'sm', showLabel = false, className = '' }: RoleBadgeProps) {
 const config = roleConfig[role];

 return (
  <span
   className={`inline-flex items-center ${config.bg} ${config.border} border ${config.glow} rounded-full ${
    size === 'sm' ? 'px-2 py-[1px]' : 'px-2.5 py-[3px]'
   } ${className}`}
  >
   <span className={`${config.color} font-bold uppercase tracking-wider text-[12px]`} style={{ fontSize: "12px" }}>
    {config.label}
   </span>
  </span>
 );
}

/* ── Avatar wrapper with role indicator ── */
const BORDER_COLOR: Record<UserRole, string> = {
 fan: 'border-white/[0.15]',
 crew: 'border-purple-400/50',
 admin: 'border-purple-400/50',
};

function RoleAvatar({
 initials,
 role,
 gradient,
 size = 30,
 className = '',
}: {
 initials: string;
 role: UserRole;
 gradient: string;
 size?: number;
 className?: string;
}) {
 return (
  <div className={`relative ${className}`}>
   <div
    className={`rounded-full bg-gradient-to-br ${gradient} ${BORDER_COLOR[role]} border-2 flex items-center justify-center shrink-0 aspect-square`}
    style={{ width: size, height: size, minWidth: size, minHeight: size, aspectRatio: "1 / 1" }}
   >
    <span className="font-bold text-white leading-none" style={{ fontSize: size * 0.33 }}>
     {initials}
    </span>
   </div>
  </div>
 );
}
