"use client";

import React, { forwardRef, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface ModalOverlayProps
  extends React.HTMLAttributes<HTMLDivElement> {
  isOpen?: boolean;
  onClose?: () => void;
  blur?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

const blurStyles: Record<NonNullable<ModalOverlayProps["blur"]>, string> = {
  sm: "backdrop-blur-sm",
  md: "backdrop-blur-md",
  lg: "backdrop-blur-lg",
};

export const ModalOverlay = forwardRef<HTMLDivElement, ModalOverlayProps>(
  (
    {
      isOpen = true,
      onClose,
      blur = "md",
      className,
      children,
      onClick,
      ...props
    },
    ref,
  ) => {
    const onCloseRef = useRef(onClose);
    useEffect(() => {
      onCloseRef.current = onClose;
    });

    useEffect(() => {
      if (!isOpen) return;
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape" && onCloseRef.current) {
          onCloseRef.current();
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen]);

    if (!isOpen) return null;

    return (
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        onClick={(e) => {
          if (e.target === e.currentTarget && onClose) {
            onClose();
          }
          if (onClick) onClick(e);
        }}
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 transition-opacity duration-200",
          blurStyles[blur],
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

ModalOverlay.displayName = "ModalOverlay";

export default ModalOverlay;
