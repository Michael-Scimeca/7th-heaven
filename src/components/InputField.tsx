"use client";

import React, { forwardRef } from "react";

export interface InputFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label?: string;
  labelRight?: React.ReactNode;
  required?: boolean;
  id?: string;
  className?: string;
  inputClassName?: string;
  containerClassName?: string;
  labelClassName?: string;
  glow?: boolean;
  error?: string;
  multiline?: boolean;
  rows?: number;
  onChange?: (e: any) => void;
}

export const InputField = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputFieldProps>(
  (
    {
      label,
      labelRight,
      required,
      id,
      className = "",
      inputClassName = "px-5 py-2.5",
      containerClassName = "",
      labelClassName = "",
      glow = true,
      error,
      name,
      multiline = false,
      rows = 3,
      onChange,
      ...props
    },
    ref
  ) => {
    const generatedId = name || (label ? `input-${label.toLowerCase().replace(/[^a-z0-9]/g, "-")}` : undefined);
    const inputId = id || generatedId;

    return (
      <div className={`flex flex-col justify-start w-full ${containerClassName} ${className}`}>
        {label && (
          <div className="mb-2 min-h-[24px]">
            <label
 htmlFor={inputId}
 className={`text-white block ${labelClassName}`}>
              {label}
              {required && " *"}
            </label>
            {labelRight}
          </div>
        )}
        <div className={`${glow ? "input-glow-border" : ""} rounded-lg w-full`}>
          {multiline ? (
            <textarea
 ref={ref as React.Ref<HTMLTextAreaElement>}
              id={inputId}
              name={name}
              required={required}
              rows={rows}
              onChange={onChange}
              aria-label={props["aria-label"] || (label ? label : "Input field")}
              className={`w-full bg-[#00000029] border-0 text-white font-normal font-semibold placeholder:text-white/45 focus:outline-none transition-colors rounded-lg ${inputClassName}`}
              {...(props as any)}
            />
          ) : (
            <input
 ref={ref as React.Ref<HTMLInputElement>}
              id={inputId}
              name={name}
              required={required}
              onChange={onChange}
              aria-label={props["aria-label"] || (label ? label : "Input field")}
              className={`w-full bg-[#00000029] border-0  text-white font-normal font-semibold placeholder:text-white/45 focus:outline-none transition-colors rounded-lg ${inputClassName}`}
              {...(props as any)}
            />
          )}
        </div>
        {error && (
          <span className="text-xs text-rose-400 font-medium">{error}</span>
        )}
      </div>
    );
  }
);

InputField.displayName = "InputField";

export default InputField;

