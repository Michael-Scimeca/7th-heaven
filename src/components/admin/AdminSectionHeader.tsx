import React from "react";

export interface AdminSectionHeaderProps {
  id?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  infoToggle?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function AdminSectionHeader({
  id,
  title,
  subtitle,
  badge,
  isOpen,
  onToggle,
  infoToggle,
  actions,
  className = "",
}: AdminSectionHeaderProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onToggle();
    }
  };

  return (
    <div
      id={id}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={onToggle}
      className={`sorts flex cursor-pointer items-center justify-between border-b border-white/10 pb-5 pl-0 select-none group transition-colors  ${className}`}
    >
      <div className="title-group title-group--sub">
        <h3 className="flex items-center gap-2">
          {badge}
          <span>{title}</span>
          {infoToggle}
        </h3>
        {subtitle && (
          typeof subtitle === "string" ? (
            <p>{subtitle}</p>
          ) : (
            subtitle
          )
        )}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {actions}
        <div
          className={`flex h-10 w-10 items-center justify-center text-white/70 transition-transform duration-300 group-hover:border-white/20 group-hover:text-white ${isOpen ? "rotate-0" : "-rotate-90"
            }`}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7 shrink-0"
          >
            <path
              d="M19.5 8.52155C19.5 8.7998 19.256 9.04377 18.9769 9.04377C18.6979 9.04377 18.4532 8.7998 18.4532 8.52155C18.4532 8.2433 18.6979 8 18.9769 8C19.256 8 19.5 8.2433 19.5 8.52155ZM5.54683 8.52155C5.54683 8.7998 5.30281 9.04377 5.02375 9.04377C4.74469 9.04377 4.5 8.7998 4.5 8.52155C4.5 8.2433 4.74469 8 5.02375 8C5.30281 8 5.54683 8.2433 5.54683 8.52155ZM16.0117 12.0003C16.0117 12.2786 15.7677 12.5219 15.4886 12.5219C15.2096 12.5219 14.9656 12.2786 14.9656 12.0003C14.9656 11.7221 15.2096 11.4781 15.4886 11.4781C15.7677 11.4781 16.0117 11.7221 16.0117 12.0003ZM9.03512 12.0003C9.03512 12.2786 8.79111 12.5219 8.51204 12.5219C8.23298 12.5219 7.98897 12.2786 7.98897 12.0003C7.98897 11.7221 8.23298 11.4781 8.51204 11.4781C8.79111 11.4781 9.03512 11.7221 9.03512 12.0003ZM12.5234 15.4778C12.5234 15.756 12.2794 16 12.0003 16C11.7213 16 11.4766 15.756 11.4766 15.4778C11.4766 15.1995 11.7213 14.9562 12.0003 14.9562C12.2794 14.9562 12.5234 15.1995 12.5234 15.4778Z"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default AdminSectionHeader;
