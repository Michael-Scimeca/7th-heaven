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
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <dialog
      open
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-transparent border-0 m-0 w-full h-full max-w-none max-h-none"
      aria-modal="true"
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
          "relative z-10 w-full overflow-hidden rounded-[var(--radius-box)] border border-white/10 bg-[#0f0f13] p-6 shadow-2xl transition-[opacity,transform]",
          maxWidthStyles[maxWidth],
          className,
        )}
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
          {title ? (
            <h2 className="tracking-tight text-white">{title}</h2>
          ) : (
            <div />
          )}
          <button
            type="button"
            onClick={onClose}
            className="transition-colors rounded-full p-1.5 text-white/50 hover:bg-white/10 hover:text-white"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div>{children}</div>
      </div>
    </dialog>
  );
}

export default ModalDialog;
