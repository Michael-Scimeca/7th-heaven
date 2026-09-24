"use client";

import React from "react";
import { Plus } from "lucide-react";
import { useMember } from "@/context/MemberContext";

export interface AddCmsButtonProps {
  label: string;
  onClick: () => void;
  className?: string;
  icon?: React.ReactNode;
  requireAdmin?: boolean;
}

export default function AddCmsButton({
  label,
  onClick,
  className = "",
  icon,
  requireAdmin = true,
}: AddCmsButtonProps) {
  const { member, isLoggedIn } = useMember();
  const isAdmin = Boolean(
    isLoggedIn &&
    (member?.role === "admin" ||
      member?.role === "crew" ||
      member?.role === "event_planner" ||
      (member as any)?.isAdmin === true),
  );

  if (requireAdmin && !isAdmin) {
    return null;
  }

  // Clean leading '+' to prevent "+ + ADD ..." double icon rendering
  const cleanLabel = label.replace(/^\+\s*/, "").toUpperCase();

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-10 min-h-[40px] shrink-0 cursor-pointer items-center justify-center gap-2.5 rounded-2xl border border-purple-400/30 bg-[#6b05be] px-6 text-xs shadow-[0_4px_18px_rgba(107,5,190,0.5)] transition-[background-color,box-shadow,transform] duration-200 hover:scale-[1.02] hover:bg-[#7e07de] hover:shadow-[0_6px_24px_rgba(126,7,222,0.7)] active:scale-[0.98] active:bg-[#5a04a1] sm:text-sm ${className}`}
    >
      {icon ?? <Plus className="h-4 w-4 shrink-0 stroke-[2.5]" />}
      <span>{cleanLabel}</span>
    </button>
  );
}
