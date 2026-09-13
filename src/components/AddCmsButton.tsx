"use client";

import React from "react";
import { Plus } from "lucide-react";
import { useMember } from "@/context/MemberContext";

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
  const { member, isLoggedIn } = useMember();

  const isAdmin = Boolean(
    isLoggedIn &&
    (
      member?.role === "admin" ||
      (member as unknown as Record<string, unknown>)?.isAdmin === true
    )
  );

  // Strictly enforce Admin visibility requirement across all AddCmsButton instances
  if (!isAdmin) {
    return null;
  }

  // Clean leading '+' to prevent "+ + ADD ..." double icon rendering
  const cleanLabel = label.replace(/^\+\s*/, "").toUpperCase();

  return (
    <button
 type="button"
 onClick={onClick}
 className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs sm:text-sm tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(217,70,239,0.4)] hover:shadow-[0_0_30px_rgba(217,70,239,0.7)] hover:scale-105 active:scale-95 border border-purple-300/30 shrink-0 cursor-pointer ${className}`}
 >
      {icon ?? <Plus className="w-4 h-4 shrink-0" />}
      <span>{cleanLabel}</span>
    </button>
  );
}
