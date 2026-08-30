"use client";

import React, { forwardRef } from "react";

export interface InputFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  labelRight?: React.ReactNode;
  required?: boolean;
  id?: string;
  className?: string;
  inputClassName?: string;
  containerClassName?: string;
  glow?: boolean;
  error?: string;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  (
    {
      label,
      labelRight,
      required,
      id,
      className = "",
      inputClassName = "",
      containerClassName = "",
      glow = true,
      error,
      name,
      ...props
    },
    ref
  ) => {
    const generatedId = name || (label ? `input-${label.toLowerCase().replace(/[^a-z0-9]/g, "-")}` : undefined);
    const inputId = id || generatedId;

    return (
      <div className={`flex flex-col justify-start w-full ${containerClassName} ${className}`}>
        {label && (
          <div className="flex items-center justify-between gap-2 mb-2 min-h-[24px]">
            <label
              htmlFor={inputId}
              className=" text-white block "
            >
              {label}
              {required && " *"}
            </label>
            {labelRight}
          </div>
        )}
        <div className={`${glow ? "input-glow-border" : ""} rounded-lg w-full`}>
          <input
            ref={ref}
            id={inputId}
            name={name}
            required={required}
            aria-label={props["aria-label"] || (label ? label : "Input field")}
            className={`w-full bg-[#00000029] border-0 px-4 py-3.5  text-white font-normal  font-semibold  placeholder:text-white/45 focus:outline-none transition-colors rounded-lg  ${inputClassName}`}
            {...props}
          />
        </div>
        {error && (
          <span className="text-xs text-rose-400 mt-1 font-medium">{error}</span>
        )}
      </div>
    );
  }
);

InputField.displayName = "InputField";

export default InputField;
