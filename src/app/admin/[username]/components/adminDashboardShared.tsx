/* eslint-disable @next/next/no-img-element, react-doctor/nextjs-no-img-element */
import React from "react";
import Avatar from "@/components/Avatar";

export const STANDARD_ROLE_TAGS_SET = new Set([
  "AUDIO",
  "FOH",
  "MAIN SHOW",
  "IEM",
  "VIP",
  "HOST",
  "LIGHTS",
  "PRODUCTION",
  "RIGGING",
  "MATINEE",
  "MANAGEMENT",
  "SETUP",
  "MORNING",
  "STAGE MGR",
  "LOAD OUT",
  "TEAR DOWN",
  "MERCH",
  "DMX",
  "STAGE",
]);

export const getAvatarColor = (name: string) => {
  const colors = [
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
    "#f97316",
    "#10b981",
    "#06b6d4",
    "#6366f1",
    "#a855f7",
    "#d946ef",
    "#f43f5e",
  ];
  let hash = 0;
  for (let i = 0; i < (name || "").length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

export const resolveMemberAvatar = (
  name: string,
  avatar?: string | null,
): string => {
  if (avatar && avatar.trim() && !avatar.includes("ui-avatars.com"))
    return avatar;
  const lower = (name || "").toLowerCase();

  if (lower.includes("adam")) return "/images/members/adam.webp";
  if (lower.includes("nick")) return "/images/members/nick.webp";
  if (lower.includes("mark")) return "/images/members/mark.webp";
  if (lower.includes("frankie") || lower.includes("harchut"))
    return "/images/members/frankie.webp";
  if (
    lower.includes("richard") ||
    lower.includes("hofherr") ||
    lower.includes("dicky")
  )
    return "/images/members/dicky.webp";

  if (lower.includes("abbie")) return "/images/crew/abbie.png";
  if (lower.includes("al") && lower.includes("hollie"))
    return "/images/crew/al.png";
  if (lower.includes("andrea")) return "/images/crew/andrea.png";
  if (lower.includes("arjun")) return "/images/crew/arjun.png";
  if (lower.includes("chris")) return "/images/crew/chris.png";
  if (lower.includes("colin") || lower.includes("farrell"))
    return "/images/crew/chris.png";
  if (lower.includes("daniel")) return "/images/crew/daniel.png";
  if (lower.includes("croke")) return "/images/crew/dave_croke.png";
  if (lower.includes("maas")) return "/images/crew/dave_maas.png";
  if (lower.includes("xu")) return "/images/crew/david_xu.png";
  if (lower.includes("emily")) return "/images/crew/emily.png";
  if (lower.includes("emma")) return "/images/crew/emma.png";
  if (lower.includes("erin")) return "/images/crew/erin.png";
  if (lower.includes("francesca")) return "/images/crew/francesca.png";
  if (lower.includes("john") && lower.includes("wick"))
    return "/images/crew/john_wick.png";
  if (lower.includes("john")) return "/images/crew/john_doe.png";

  return "";
};

export const CrewAvatar = React.memo(({ member }: { member: any }) => {
  return (
    <Avatar
      src={member?.avatar || member?.avatarUrl}
      name={member?.name || "Crew"}
      initials={member?.initials}
      size="md"
      border="border border-white/10"
    />
  );
});
CrewAvatar.displayName = "CrewAvatar";

export const SidebarDateButton = React.memo(
  ({
    show,
    isSelected,
    isActiveWeek,
    onClick,
  }: {
    show: any;
    isSelected: boolean;
    isActiveWeek: boolean;
    shiftCount?: number;
    onClick: (date: string) => void;
  }) => {
    let dateLabel = show.dateLabel;
    let dayLabel = show.dayLabel;

    if (!dateLabel || dateLabel.includes("undefined") || dateLabel.includes("NaN")) {
      if (show.date) {
        const rawStr = String(show.date).trim();
        const cleanStr = rawStr.split("T")[0];
        let d = new Date(cleanStr + "T12:00:00");
        if (isNaN(d.getTime())) d = new Date(rawStr);
        if (!isNaN(d.getTime())) {
          const SHORT_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          const SHORT_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
          dateLabel = `${SHORT_MONTHS[d.getMonth()]} ${d.getDate()}`;
          dayLabel = SHORT_DAYS[d.getDay()];
        } else {
          dateLabel = rawStr;
          dayLabel = "";
        }
      } else {
        dateLabel = "—";
        dayLabel = "";
      }
    }

    return (
      <button
        type="button"
        onClick={() => show.date && onClick(show.date)}
        className={`group flex w-full cursor-pointer items-center gap-2 px-2 py-1.5 text-left ${isSelected ? "" : isActiveWeek ? "" : " "}`}
      >
        <div className="flex min-w-[32px] shrink-0 flex-col items-center">
          <span className="text-[9px] text-white/40">{dayLabel}</span>
          <span
            className={`${isSelected ? " " : isActiveWeek ? " " : "text-white/50"}`}
          >
            {dateLabel}
          </span>
        </div>
        <div className="min-w-0 flex-1 nmp" >
          <p className={`${isSelected ? " " : isActiveWeek ? "/90" : " "}`}>
            {show.venue || show.venue_name}
          </p>
          {show.city && (
            <p>
              {show.city}
              {show.state ? `, ${show.state}` : ""}
            </p>
          )}
        </div>
      </button>
    );
  },
);
SidebarDateButton.displayName = "SidebarDateButton";

export const formatHour = (hourDecimal: number) => {
  const h = Math.floor(hourDecimal);
  const m = Math.round((hourDecimal - h) * 60);
  const period = h >= 12 ? "PM" : "AM";
  let displayHour = h % 12;
  if (displayHour === 0) displayHour = 12;
  const displayMinute = m === 0 ? "" : `:${String(m).padStart(2, "0")}`;
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
      label: formatHour(h),
    });
  }
  return opts;
};
