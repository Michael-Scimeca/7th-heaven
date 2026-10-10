import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface HelperTextProps {
  children: ReactNode;
  /** Pair with the input's `aria-describedby` so screen readers announce it. */
  id?: string;
  /** `error` switches to the error color and announces changes politely. */
  tone?: "default" | "error";
  className?: string;
}

/**
 * Helper text shown directly below a form input (hints, requirements, errors).
 * All styling lives in the `.helper-text` block in `src/app/globals.css` —
 * change font, size, color or spacing there to update every helper on the site.
 */
export default function HelperText({
  children,
  id,
  tone = "default",
  className,
}: HelperTextProps) {
  return (
    <p
      id={id}
      className={cn("helper-text", tone === "error" && "helper-text--error", className)}
      role={tone === "error" ? "alert" : undefined}
    >
      {children}
    </p>
  );
}
