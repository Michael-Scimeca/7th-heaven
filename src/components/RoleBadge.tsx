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
  border: 'border-white/[0.12]',
  glow: '',
 },
 crew: {
  label: 'CREW',
  color: 'text-emerald-400',
  bg: 'bg-emerald-500/15',
  border: 'border-emerald-500/30',
  glow: 'shadow-[0_0_8px_rgba(52,211,153,0.15)]',
 },
 admin: {
  label: 'ADMIN',
  color: 'text-amber-400',
  bg: 'bg-amber-500/15',
  border: 'border-amber-500/30',
  glow: 'shadow-[0_0_8px_rgba(251,191,36,0.15)]',
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
 const Icon = iconMap[role];
 const iconSize = size === 'sm' ? 10 : 14;

 return (
  <span
   className={`inline-flex items-center gap-1 ${config.bg} ${config.border} border ${config.glow} rounded-full ${
    size === 'sm' ? 'px-1.5 py-[1px]' : 'px-2.5 py-[3px]'
   } ${className}`}
  >
   <span className={config.color}>
    <Icon size={iconSize} />
   </span>
   {showLabel && (
    <span className={`${config.color} font-bold uppercase tracking-wider ${size === 'sm' ? 'text-[0.45rem]' : 'text-[0.6rem]'}`}>
     {config.label}
    </span>
   )}
  </span>
 );
}

/* ── Avatar wrapper with role indicator ── */
export function RoleAvatar({
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
 const borderColor = {
  fan: 'border-white/[0.15]',
  crew: 'border-emerald-400/50',
  admin: 'border-amber-400/50',
 };

 return (
  <div className={`relative ${className}`}>
   <div
    className={`rounded-full bg-gradient-to-br ${gradient} ${borderColor[role]} border-2 flex items-center justify-center`}
    style={{ width: size, height: size }}
   >
    <span className="font-bold text-white leading-none" style={{ fontSize: size * 0.33 }}>
     {initials}
    </span>
   </div>
   {/* Role indicator dot */}
   <div
    className={`absolute -bottom-[1px] -right-[1px] rounded-full flex items-center justify-center ${
     role === 'fan' ? 'bg-white/60' : role === 'crew' ? 'bg-emerald-400' : 'bg-amber-400'
    }`}
    style={{ width: size * 0.3, height: size * 0.3, border: `1.5px solid #12121e` }}
   >
    {role === 'admin' && (
     <svg width={size * 0.16} height={size * 0.16} viewBox="0 0 24 24" fill="#12121e"><path d="M2 20h20v2H2v-2zm1-7l4 5h10l4-5-3-6-4 4-2-7-2 7-4-4-3 6z" /></svg>
    )}
   </div>
  </div>
 );
}
