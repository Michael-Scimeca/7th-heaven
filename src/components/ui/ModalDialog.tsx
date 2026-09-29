import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useScrollLock } from "@/lib/useScrollLock";

export interface ModalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl";
  children: React.ReactNode;
  className?: string;
}

const maxWidthStyles: Record<
  NonNullable<ModalDialogProps["maxWidth"]>,
  string
> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
};

export function ModalDialog({
  isOpen,
  onClose,
  title,
  maxWidth = "md",
  children,
  className,
}: ModalDialogProps) {
  useScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      aria-label={title || "Modal Dialog"}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog Body */}
      <div
        className={cn(
          "relative z-10 w-full overflow-hidden rounded-[var(--radius-box)] border border-white/10 bg-[#0f0f13] p-6 shadow-2xl transition-all",
          maxWidthStyles[maxWidth],
          className,
        )}
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
          {title ? (
            <h2 className="font-bold tracking-tight text-white">{title}</h2>
          ) : (
            <div />
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-white/50 hover:bg-white/10 hover:text-white"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div>{children}</div>
      </div>
    </div>
  );
}

export default ModalDialog;
