"use client";

import React from "react";
import GooeyMessagesDropdown, {
  type GooeyCustomer,
} from "./GooeyMessagesDropdown";

export interface CustomDropdownOption<T extends string | number> {
  value: T;
  label: string;
}

export interface CustomDropdownProps<T extends string | number> {
  id?: string;
  label?: string;
  ariaLabel?: string;
  value: T;
  options: CustomDropdownOption<T>[] | T[];
  onChange: (value: T) => void;
  placeholder?: string;
  className?: string;
  wrapperClassName?: string;
  chevronColor?: string;
}

export function CustomDropdown<T extends string | number>({
  id,
  label,
  value,
  options,
  onChange,
  placeholder = "SELECT OPTION",
  className = "",
  wrapperClassName = "w-full",
}: CustomDropdownProps<T>) {
  const normalizedCustomers: GooeyCustomer[] = options.map((opt) => {
    if (typeof opt === "object" && opt !== null && "value" in opt) {
      return {
        id: String(opt.value),
        name: opt.label,
      };
    }
    return {
      id: String(opt),
      name: typeof opt === "number" ? `${opt} miles` : String(opt),
    };
  });

  const activeSelected = String(value);

  return (
    <div className={`relative ${wrapperClassName}`}>
      <GooeyMessagesDropdown
        id={id}
        label={label}
        placeholder={placeholder}
        customers={normalizedCustomers}
        selected={activeSelected}
        showAllOption={false}
        fullWidth
        onChange={(newVal) => {
          const found = options.find((opt) => {
            if (typeof opt === "object" && opt !== null && "value" in opt) {
              return String(opt.value) === newVal;
            }
            return String(opt) === newVal;
          });

          if (found && typeof found === "object" && "value" in found) {
            onChange(found.value);
          } else if (typeof value === "number") {
            const num = Number(newVal);
            onChange((isNaN(num) ? newVal : num) as T);
          } else {
            onChange(newVal as T);
          }
        }}
        className={className}
      />
    </div>
  );
}

export default CustomDropdown;
