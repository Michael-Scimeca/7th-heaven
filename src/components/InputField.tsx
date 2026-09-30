"use client";

import React, { forwardRef, useId } from "react";

export interface InputFieldProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange"
> {
  label?: React.ReactNode;
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

export const InputField = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  InputFieldProps
>(
  (
    {
      label,
      labelRight,
      required,
      id,
      className = "",
      inputClassName = "",
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
    ref,
  ) => {
    const autoId = useId();
    const generatedId =
      name ||
      (typeof label === "string"
        ? `input-${label.toLowerCase().replace(/[^a-z0-9]/g, "-")}`
        : undefined);
    const inputId = id || generatedId || autoId;

    return (
      <div
        className={`flex w-full flex-col justify-start ${containerClassName}  ${className} `}
      >
        {label && (
          <div className="flex items-center justify-between min-h-[24px] gap-2 mb-2">
            <label htmlFor={inputId} className={`!mb-0 flex items-center ${labelClassName} `}>
              {label}
              {required && " *"}
            </label>
            {labelRight && (
              <div className="flex items-center shrink-0">
                {labelRight}
              </div>
            )}
          </div>
        )}
        <div className={` ${glow ? "input-glow-border" : ""} w-full`}>
          {multiline ? (
            <textarea
              ref={ref as React.Ref<HTMLTextAreaElement>}
              id={inputId}
              name={name}
              required={required}
              rows={rows}
              onChange={onChange}
              aria-label={
                props["aria-label"] || (label ? label : "Input field")
              }
              className={`form-input ${inputClassName} `}
              {...(props as any)}
            />
          ) : (
            <input
              ref={ref as React.Ref<HTMLInputElement>}
              id={inputId}
              name={name}
              required={required}
              onChange={onChange}
              aria-label={
                props["aria-label"] || (label ? label : "Input field")
              }
              className={`form-input ${inputClassName} `}
              {...(props as any)}
            />
          )}
        </div>
        {error && <span className="text-rose-400">{error}</span>}
      </div>
    );
  },
);

InputField.displayName = "InputField";

export default InputField;
