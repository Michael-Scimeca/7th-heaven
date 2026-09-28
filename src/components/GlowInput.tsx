/**
 * GlowInput / GlowSelect / GlowTextarea
 * -------------------------------------
 * Drop-in replacements for <input>, <select>, and <textarea> that
 * automatically wrap the element in `.input-glow-border` — giving every
 * field the same spinning-gradient ring + purple glow that the style
 * guide demonstrates.
 */
"use client";

import React, { forwardRef } from "react";
import InputField, { InputFieldProps } from "./InputField";
import CustomDropdown from "./CustomDropdown";

/* ─── GlowInput ─────────────────────────────────────────── */
export interface GlowInputProps extends InputFieldProps {
  wrapperClassName?: string;
  rounded?: string;
}

export const GlowInput = forwardRef<HTMLInputElement, GlowInputProps>(
  (
    {
      wrapperClassName = "w-full",
      rounded = "",
      className = "",
      ...props
    },
    ref,
  ) => {
    return (
      <InputField
        ref={ref}
        glow={true}
        containerClassName={wrapperClassName}
        inputClassName={`${rounded} ${className}`}
        {...props}
      />
    );
  },
);

GlowInput.displayName = "GlowInput";

/* ─── GlowSelect ─────────────────────────────────────────── */
export interface GlowSelectProps extends Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  "onChange"
> {
  wrapperClassName?: string;
  rounded?: string;
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement> | string) => void;
  children?: React.ReactNode;
}

export function GlowSelect({
  wrapperClassName = "w-full",
  className = "",
  children,
  value,
  defaultValue,
  onChange,
  placeholder,
}: GlowSelectProps) {
  const childArray = React.Children.toArray(children);
  const options = childArray
    .map((child: any) => {
      if (child && child.props) {
        return {
          value: String(child.props.value ?? child.props.children),
          label: String(child.props.children ?? child.props.value),
        };
      }
      return null;
    })
    .filter(Boolean) as { value: string; label: string }[];

  const currentValue = String(value ?? defaultValue ?? options[0]?.value ?? "");

  return (
    <CustomDropdown
      value={currentValue}
      options={options}
      placeholder={placeholder || "SELECT OPTION"}
      wrapperClassName={wrapperClassName}
      className={className}
      onChange={(val: string) => {
        if (onChange) {
          const fakeEvent = {
            target: { value: val },
            currentTarget: { value: val },
          } as React.ChangeEvent<HTMLSelectElement>;
          onChange(fakeEvent);
        }
      }}
    />
  );
}

/* ─── GlowTextarea ───────────────────────────────────────── */
export interface GlowTextareaProps extends InputFieldProps {
  wrapperClassName?: string;
  rounded?: string;
}

export const GlowTextarea = forwardRef<HTMLTextAreaElement, GlowTextareaProps>(
  (
    {
      wrapperClassName = "w-full",
      rounded = "",
      className = "",
      ...props
    },
    ref,
  ) => {
    return (
      <InputField
        ref={ref}
        glow={true}
        multiline={true}
        containerClassName={wrapperClassName}
        inputClassName={`${rounded} resize-y ${className}`}
        {...props}
      />
    );
  },
);

GlowTextarea.displayName = "GlowTextarea";

export default GlowInput;
