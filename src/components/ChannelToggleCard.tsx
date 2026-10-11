import React from "react";
import { Toggle } from "@/components/Toggle";

export interface ChannelToggleCardProps {
  id: string;
  icon?: React.ReactNode;
  title: React.ReactNode;
  badge?:
    | React.ReactNode
    | { text: string; variant?: "emerald" | "amber" | "purple" | "blue" | "white" };
  description?: React.ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  activeColor?: "purple" | "amber" | "emerald" | "default";
  className?: string;
}

export function ChannelToggleCard({
  id,
  icon,
  title,
  badge,
  description,
  checked,
  onChange,
  disabled = false,
  activeColor = "default",
  className = "",
}: ChannelToggleCardProps) {
  const activeStyles =
    checked && activeColor === "amber"
      ? "border-amber-500/60 bg-amber-500/10"
      : checked && activeColor === "purple"
      ? "border-purple-500/60 bg-purple-500/10"
      : checked && activeColor === "emerald"
      ? "border-emerald-500/60 bg-emerald-500/10"
      : "border-white/10 bg-white/[0.02]";

  return (
    <div
      className={`flex items-center justify-between rounded-xl border p-3.5 transition-[background-color,color,border-color,box-shadow,transform] ${activeStyles} ${className}`}
    >
      <div className="flex items-center gap-2.5">
        {icon && <div className="shrink-0">{icon}</div>}
        <div>
          <div className="flex items-center gap-1.5">
            {typeof title === "string" ? (
              <span className="text-sm font-medium text-white">{title}</span>
            ) : (
              title
            )}
            {badge &&
              (typeof badge === "string" || React.isValidElement(badge) ? (
                badge
              ) : (
                <span
                  className={`rounded px-1.5 py-0.2 text-[9px] font-semibold ${
                    (badge as { variant?: string }).variant === "amber"
                      ? "bg-amber-500/20 text-amber-300"
                      : (badge as { variant?: string }).variant === "purple"
                      ? "bg-purple-500/20 text-purple-300"
                      : (badge as { variant?: string }).variant === "blue"
                      ? "bg-blue-500/20 text-blue-300"
                      : "bg-emerald-500/20 text-emerald-300"
                  }`}
                >
                  {(badge as { text: string }).text}
                </span>
              ))}
          </div>
          {description && (
            <div className="text-[10px] text-white/40">{description}</div>
          )}
        </div>
      </div>
      <Toggle
        id={id}
        size="sm"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
    </div>
  );
}

export default ChannelToggleCard;
