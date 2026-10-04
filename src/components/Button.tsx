"use client";

import React from "react";
import Link from "next/link";

export type ButtonVariant = "primary" | "secondary" | "tertiary";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  target?: string;
  rel?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-action text-black font-bold hover:bg-action-hover active:scale-[0.98] shadow-[0_0_20px_var(--color-action-ring)] border border-transparent",
  secondary:
    "seventh--btn !border-none !p-0 font-semibold active:scale-[0.98]",
  tertiary:
    "text-action hover:text-action-hover underline-offset-4 hover:underline font-semibold bg-transparent border-transparent px-0 py-1 min-h-0",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "text-xs px-3 py-1.5 min-h-[36px] rounded-full",
  md: "text-sm px-5 py-2.5 min-h-[44px] rounded-full",
  lg: "text-base px-7 py-3.5 min-h-[48px] rounded-full",
};

export const Button = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>(
  (
    {
      variant = "secondary",
      size = "md",
      href,
      target,
      rel,
      icon,
      iconPosition = "left",
      fullWidth = false,
      className = "",
      disabled,
      children,
      type = "button",
      ...props
    },
    ref
  ) => {
    const baseClasses =
      "inline-flex items-center justify-center gap-2 text-center transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-ring select-none";
    const variantClass = variantStyles[variant];
    const sizeClass = variant === "tertiary" || variant === "secondary" ? "" : sizeStyles[size];
    const widthClass = fullWidth ? "w-full" : "w-fit";
    const disabledClass = disabled
      ? "opacity-50 cursor-not-allowed pointer-events-none"
      : "";

    const combinedClasses = [
      baseClasses,
      variantClass,
      sizeClass,
      widthClass,
      disabledClass,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const innerContent = (
      <>
        {icon && iconPosition === "left" && (
          <span className="shrink-0">{icon}</span>
        )}
        <span>{children}</span>
        {icon && iconPosition === "right" && (
          <span className="shrink-0">{icon}</span>
        )}
      </>
    );

    const content = variant === "secondary" ? <span>{innerContent}</span> : innerContent;

    if (href) {
      const isExternal =
        href.startsWith("http") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:");
      if (isExternal) {
        return (
          <a
            ref={ref as React.Ref<HTMLAnchorElement>}
            href={href}
            target={target ?? (href.startsWith("http") ? "_blank" : undefined)}
            rel={rel ?? (href.startsWith("http") ? "noopener noreferrer" : undefined)}
            className={combinedClasses}
            {...(props as unknown as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
          >
            {content}
          </a>
        );
      }

      return (
        <Link
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          className={combinedClasses}
          {...(props as unknown as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {content}
        </Link>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type={type}
        disabled={disabled}
        className={combinedClasses}
        {...props}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
