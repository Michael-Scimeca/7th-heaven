import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface FormInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, icon, className, id, required, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-xs font-medium tracking-wide text-white/80"
          >
            {label}
            {required && <span className="ml-1 text-rose-400">*</span>}
          </label>
        )}
        <div className="relative w-full">
          {icon && (
            <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            required={required}
            className={cn(
              "w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-white transition-all duration-200 outline-none placeholder:text-white/30 hover:border-white/20 focus:border-purple-500 focus:bg-black/80 focus:shadow-[0_0_15px_rgba(168,85,247,0.25)] sm:text-base",
              icon && "pl-10",
              error && "border-rose-500/50 focus:border-rose-500 focus:shadow-[0_0_15px_rgba(244,63,94,0.25)]",
              className,
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-xs text-rose-400">{error}</p>
        )}
      </div>
    );
  },
);

FormInput.displayName = "FormInput";

export default FormInput;
