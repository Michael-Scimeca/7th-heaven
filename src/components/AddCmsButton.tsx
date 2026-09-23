"use client";

import React from "react";
import { Plus } from "lucide-react";

export interface AddCmsButtonProps {
  label: string;
  onClick: () => void;
  className?: string;
  icon?: React.ReactNode;
}

export default function AddCmsButton({
  label,
  onClick,
  className = "",
  icon,
}: AddCmsButtonProps) {
  // Clean leading '+' to prevent "+ + ADD ..." double icon rendering
  const cleanLabel = label.replace(/^\+\s*/, "").toUpperCase();

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2.5 h-10 min-h-[40px] px-6 rounded-2xl text-xs sm:text-sm   bg-[#6b05be] hover:bg-[#7e07de] active:bg-[#5a04a1] border border-purple-400/30 shadow-[0_4px_18px_rgba(107,5,190,0.5)] hover:shadow-[0_6px_24px_rgba(126,7,222,0.7)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer shrink-0 ${className}`}
    >
      {icon ?? <Plus className="w-4 h-4 shrink-0 stroke-[2.5]" />}
      <span>{cleanLabel}</span>
    </button>
  );
}
