/* eslint-disable @next/next/no-img-element, react-doctor/nextjs-no-img-element */
import React from 'react';

export const STANDARD_ROLE_TAGS_SET = new Set([
  'AUDIO', 'FOH', 'MAIN SHOW', 'IEM', 'VIP', 'HOST', 'LIGHTS',
  'PRODUCTION', 'RIGGING', 'MATINEE', 'MANAGEMENT', 'SETUP',
  'MORNING', 'STAGE MGR', 'LOAD OUT', 'TEAR DOWN', 'MERCH', 'DMX', 'STAGE'
]);

export const getAvatarColor = (name: string) => {
  const colors = [
    '#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#10b981',
    '#06b6d4', '#6366f1', '#a855f7', '#d946ef', '#f43f5e'
  ];
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

export const resolveMemberAvatar = (name: string, avatar?: string | null): string => {
  if (avatar && avatar.trim() && !avatar.includes('ui-avatars.com')) return avatar;
  const lower = (name || '').toLowerCase();

  if (lower.includes('adam')) return '/images/members/adam.png';
  if (lower.includes('nick')) return '/images/members/nick.png';
  if (lower.includes('mark')) return '/images/members/mark.png';
  if (lower.includes('frankie') || lower.includes('harchut')) return '/images/members/frankie.png';
  if (lower.includes('richard') || lower.includes('hofherr') || lower.includes('dicky')) return '/images/members/dicky.png';

  if (lower.includes('abbie')) return '/images/crew/abbie.png';
  if (lower.includes('al') && lower.includes('hollie')) return '/images/crew/al.png';
  if (lower.includes('andrea')) return '/images/crew/andrea.png';
  if (lower.includes('arjun')) return '/images/crew/arjun.png';
  if (lower.includes('chris')) return '/images/crew/chris.png';
  if (lower.includes('colin') || lower.includes('farrell')) return '/images/crew/chris.png';
  if (lower.includes('daniel')) return '/images/crew/daniel.png';
  if (lower.includes('croke')) return '/images/crew/dave_croke.png';
  if (lower.includes('maas')) return '/images/crew/dave_maas.png';
  if (lower.includes('xu')) return '/images/crew/david_xu.png';
  if (lower.includes('emily')) return '/images/crew/emily.png';
  if (lower.includes('emma')) return '/images/crew/emma.png';
  if (lower.includes('erin')) return '/images/crew/erin.png';
  if (lower.includes('francesca')) return '/images/crew/francesca.png';
  if (lower.includes('john') && lower.includes('wick')) return '/images/crew/john_wick.png';
  if (lower.includes('john')) return '/images/crew/john_doe.png';

  return '';
};

export const CrewAvatar = React.memo(({ member }: { member: any }) => {
  const name = member?.name || 'Crew';
  const avatarUrl = resolveMemberAvatar(name, member?.avatar || member?.avatarUrl);
  const initials = member?.initials || name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  const [imgError, setImgError] = React.useState(false);

  if (avatarUrl && !imgError) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        onError={() => setImgError(true)}
        className="w-9 h-9 rounded-full object-cover border border-white/20 shrink-0 shadow-md"
      />
    );
  }

  return (
    <div
      className="w-9 h-9 bg-gradient-to-br from-[var(--color-accent)]/20 to-[var(--color-accent)]/5 rounded-full flex items-center justify-center font-bold text-xs shrink-0 text-white select-none border border-white/10"
      style={{ color: '#ffffff' }}
    >
      {initials}
    </div>
  );
});
CrewAvatar.displayName = 'CrewAvatar';

export const SidebarDateButton = React.memo(({
  show,
  isSelected,
  isActiveWeek,
  onClick
}: {
  show: any;
  isSelected: boolean;
  isActiveWeek: boolean;
  shiftCount?: number;
  onClick: (date: string) => void;
}) => {
  return (
    <button
      type="button"
      onClick={() => show.date && onClick(show.date)}
      className={`w-full text-left px-2 py-1.5 flex items-center gap-2 cursor-pointer transition-colors duration-150 group ${isSelected
        ? ' bg-[#00000029]  !rounded-none'
        : isActiveWeek
          ? ' bg-[#00000029] '
          : 'bg-transparent'
        }`}
    >
      <div className="flex flex-col items-center min-w-[32px] shrink-0">
        <span className="text-[7.5px] font-bold text-white/40 uppercase tracking-tight">{show.dayLabel}</span>
        <span className={`text-[9.5px]  font-bold  tracking-tight ${isSelected ? 'text-purple-300' : isActiveWeek ? 'text-white/70' : 'text-white/50'}`}>{show.dateLabel}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-bold truncate leading-tight ${isSelected ?'text-white' : isActiveWeek ? 'text-white/90' : 'text-white/70'}`}>
          {show.venue || show.venue_name}
        </p>
        {show.city && (
          <p className="truncate leading-tight">{show.city}{show.state ? `, ${show.state}` : ''}</p>
        )}
      </div>
    </button>
  );
});
SidebarDateButton.displayName = 'SidebarDateButton';

export const formatHour = (hourDecimal: number) => {
  const h = Math.floor(hourDecimal);
  const m = Math.round((hourDecimal - h) * 60);
  const period = h >= 12 ? 'PM' : 'AM';
  let displayHour = h % 12;
  if (displayHour === 0) displayHour = 12;
  const displayMinute = m === 0 ? '' : `:${String(m).padStart(2, '0')}`;
  return `${displayHour}${displayMinute} ${period}`;
};

export const formatTimeFrame = (start: number, end: number) => {
  return `${formatHour(start)} - ${formatHour(end)}`;
};

export const generateTimeOptions = () => {
  const opts = [];
  for (let h = 0; h <= 24; h += 0.5) {
    opts.push({
      value: h,
      label: formatHour(h)
    });
  }
  return opts;
};
