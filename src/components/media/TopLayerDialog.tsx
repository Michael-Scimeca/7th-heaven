"use client";

import React, { useEffect, useRef } from "react";

export interface TopLayerDialogProps {
  open: boolean;
  onClose: () => void;
  ariaLabel: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * Native HTML <dialog> opened in the browser Top Layer via showModal().
 * Uses declarative closedby="any" where supported plus a coordinate-checked
 * backdrop click fallback for Safari.
 */
export default function TopLayerDialog({
  open,
  onClose,
  ariaLabel,
  className = "",
  children,
}: TopLayerDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      if (!dialog.open) {
        try {
          dialog.showModal();
        } catch {
          dialog.setAttribute("open", "");
        }
      }
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if ("closedBy" in HTMLDialogElement.prototype) return;

    const handleBackdropClick = (event: MouseEvent) => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      const isInsideDialogBox =
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width;

      if (!isInsideDialogBox) {
        dialog.close();
      }
    };

    dialog.addEventListener("click", handleBackdropClick);
    return () => dialog.removeEventListener("click", handleBackdropClick);
  }, []);

  return (
    <dialog
      ref={dialogRef}
      {...({ closedby: "any" } as Record<string, string>)}
      aria-label={ariaLabel}
      onClose={onClose}
      className={`backdrop:bg-black/75 backdrop:backdrop-blur-md bg-transparent text-white p-0 focus:outline-none ${className}`}
    >
      {open ? children : null}
    </dialog>
  );
}
