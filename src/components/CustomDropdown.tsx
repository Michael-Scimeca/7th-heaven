"use client";

import { useMemo } from "react";
import GooeyDropdown, {
  type GooeyDropdownItem,
  type DropdownLayout,
} from "./GooeyDropdown";

export interface CustomDropdownOption<T extends string | number> {
  value: T;
  label: string;
  badge?: string | number;
  icon?: React.ReactNode;
}

export interface CustomDropdownProps<T extends string | number> {
  id?: string;
  label?: string;
  ariaLabel?: string;
  value: T;
  options: (CustomDropdownOption<T> | T)[];
  onChange: (value: T) => void;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  wrapperClassName?: string;
  chevronColor?: string;
  accentColor?: string;
  minWidth?: number;
  maxHeight?: number;
  fullWidth?: boolean;
  triggerPrefix?: React.ReactNode;
  disabled?: boolean;
  layout?: DropdownLayout;
}

export function CustomDropdown<T extends string | number>({
  id,
  label,
  ariaLabel,
  value,
  options,
  onChange,
  placeholder = "SELECT OPTION",
  className = "",
  buttonClassName = "",
  wrapperClassName = "",
  chevronColor = "#c084fc",
  accentColor = "#1e183a",
  minWidth,
  maxHeight = 340,
  fullWidth = false,
  triggerPrefix,
  disabled = false,
  layout = "unified",
}: CustomDropdownProps<T>) {
  // Normalize options into standard CustomDropdownOption objects
  const normalizedOptions: CustomDropdownOption<T>[] = useMemo(() => {
    return options.map((opt) => {
      if (typeof opt === "object" && opt !== null && "value" in opt) {
        return opt as CustomDropdownOption<T>;
      }
      return {
        value: opt as T,
        label: typeof opt === "number" ? `${opt} miles` : String(opt),
      };
    });
  }, [options]);

  const activeValueStr = String(value);

  const selectedOption = useMemo(() => {
    return normalizedOptions.find(
      (opt) => String(opt.value).toLowerCase() === activeValueStr.toLowerCase(),
    );
  }, [normalizedOptions, activeValueStr]);

  const triggerLabel = useMemo(() => {
    const textLabel = selectedOption ? selectedOption.label : placeholder;
    return (
      <span className="flex items-center gap-2.5 min-w-0">
        {triggerPrefix}
        {selectedOption?.icon}
        <span className="truncate font-bold tracking-wide">
          {textLabel}
        </span>
        {selectedOption?.badge !== undefined && (
          <span className="rounded-full bg-purple-500/25 border border-purple-400/30 px-2 py-0.5 text-[10px] font-semibold text-purple-200">
            {selectedOption.badge}
          </span>
        )}
      </span>
    );
  }, [selectedOption, placeholder, triggerPrefix]);

  const dropdownItems: GooeyDropdownItem[] = useMemo(() => {
    return normalizedOptions.map((opt) => {
      const isSelected =
        String(opt.value).toLowerCase() === activeValueStr.toLowerCase();

      return {
        id: String(opt.value),
        label: opt.label,
        badge: opt.badge,
        icon: opt.icon,
        selected: isSelected,
        onClick: () => {
          onChange(opt.value);
        },
      };
    });
  }, [normalizedOptions, activeValueStr, onChange]);

  const defaultButtonClass =
    "px-4 py-2 text-xs font-semibold transition-colors ";

  const resolvedButtonClass = [defaultButtonClass, className, buttonClassName]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={`relative ${fullWidth ? "w-full" : "inline-block"} ${wrapperClassName}`}
    >
      {label && (
        <label
          htmlFor={id}
          className="mb-1.5 block text-xs font-medium text-white/70"
        >
          {label}
        </label>
      )}
      <GooeyDropdown
        id={id}
        ariaLabel={
          ariaLabel ||
          label ||
          (selectedOption ? selectedOption.label : placeholder)
        }
        label={triggerLabel}
        items={dropdownItems}
        accentColor={accentColor}
        chevronColor={chevronColor}
        glassOpacity={0.96}
        backdropBlur={24}
        minWidth={minWidth}
        maxHeight={maxHeight}
        fullWidth={fullWidth}
        disabled={disabled}
        buttonClassName={resolvedButtonClass}
        layout={layout}
      />
    </div>
  );
}

export default CustomDropdown;
