"use client";

import React, { forwardRef, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface ModalOverlayProps
  extends React.HTMLAttributes<HTMLDialogElement> {
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

export const ModalOverlay = forwardRef<HTMLDialogElement, ModalOverlayProps>(
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
      <dialog
        ref={ref}
        open
        aria-modal="true"
        onCancel={(e) => {
          e.preventDefault();
          onCloseRef.current?.();
        }}
        className={cn(
          "fixed inset-0 z-50 m-0 p-4 max-w-none max-h-none w-screen h-screen flex items-center justify-center bg-black/60 border-none transition-opacity duration-200",
          blurStyles[blur],
          className,
        )}
        {...props}
      >
        <button
          type="button"
          aria-label="Close dialog backdrop"
          onClick={() => onCloseRef.current?.()}
          className="fixed inset-0 -z-10 cursor-default bg-transparent border-none"
        />
        {children}
      </dialog>
    );
  },
);

ModalOverlay.displayName = "ModalOverlay";

export default ModalOverlay;
