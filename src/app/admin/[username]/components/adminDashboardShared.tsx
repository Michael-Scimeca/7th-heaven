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

export const CrewAvatar = React.memo(({ member }: { member: any }) => {
  const name = member?.name || 'Crew';
  const initials = member?.initials || name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div
      className="w-9 h-9 bg-gradient-to-br from-[var(--color-accent)]/20 to-[var(--color-accent)]/5 rounded-full flex items-center justify-center  font-bold  text-xs shrink-0 text-white select-none border border-white/10"
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
        ? 'bg-[#e1e6ff29] !rounded-none'
        : isActiveWeek
          ? 'bg-[#e1e6ff29]'
          : 'bg-transparent'
        }`}
    >
      <div className="flex flex-col items-center min-w-[32px] shrink-0">
        <span className="text-[7.5px] font-bold text-white/40 uppercase tracking-tight">{show.dayLabel}</span>
        <span className={`text-[9.5px]  font-bold  tracking-tight ${isSelected ? 'text-purple-300' : isActiveWeek ? 'text-white/70' : 'text-white/50'}`}>{show.dateLabel}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-[10px] font-bold truncate leading-tight ${isSelected ? 'text-white' : isActiveWeek ? 'text-white/90' : 'text-white/70'}`}>
          {show.venue || show.venue_name}
        </p>
        {show.city && (
          <p className="text-[8.5px] text-white/30 truncate leading-tight">{show.city}{show.state ? `, ${show.state}` : ''}</p>
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
