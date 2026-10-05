"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: React.ReactNode;
  htmlFor?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  children: React.ReactNode;
}

export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  (
    {
      label,
      htmlFor,
      error,
      helperText,
      required = false,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn("flex flex-col gap-1.5 w-full", className)}
        {...props}
      >
        {label && (
          <label
            htmlFor={htmlFor}
            className="block text-xs font-semibold uppercase tracking-wider text-white/70"
          >
            {label}
            {required && <span className="ml-1 text-red-400">*</span>}
          </label>
        )}
        {children}
        {error && (
          <span className="text-xs text-red-400">{error}</span>
        )}
        {helperText && !error && (
          <span className="text-xs text-white/50">{helperText}</span>
        )}
      </div>
    );
  },
);

FormField.displayName = "FormField";

export default FormField;
