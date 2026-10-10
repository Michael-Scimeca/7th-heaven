"use client";

import { useMemo, useState } from "react";
import CustomDropdown, { type CustomDropdownOption } from "./CustomDropdown";
import { type DropdownLayout } from "./GooeyDropdown";

export interface DropdownOption {
  label: string;
  value: string;
}

export interface GooeyCustomer {
  id: string;
  name: string;
}

export interface GooeyMessagesDropdownProps {
  id?: string;
  options?: (DropdownOption | string)[];
  selected?: string;
  onChange?: (value: string) => void;
  label?: string;
  title?: string;
  badge?: string;
  placeholder?: string;
  customers?: GooeyCustomer[];
  defaultSelectedId?: string;
  onSelect?: (customer: GooeyCustomer) => void;
  className?: string;
  buttonClassName?: string;
  triggerTextClassName?: string;
  activeBg?: string;
  defaultBg?: string;
  fullWidth?: boolean;
  noBorder?: boolean;
  transparentBg?: boolean;
  noPadding?: boolean;
  disabled?: boolean;
  showAllOption?: boolean;
  allOptionLabel?: string;
  name?: string;
  maxHeight?: number;
  layout?: DropdownLayout;
}

const DEFAULT_CUSTOMERS: GooeyCustomer[] = [
  { id: "bob-smith", name: "Bob Smith" },
  { id: "alice-johnson", name: "Alice Johnson" },
  { id: "charlie-davis", name: "Charlie Davis" },
  { id: "elizabeth-montgomery", name: "Elizabeth Montgomery" },
  { id: "david-lee", name: "David Lee" },
  { id: "alexander-von-homburg", name: "Alexander Von Homburg" },
];

export default function GooeyMessagesDropdown({
  id,
  options,
  selected,
  onChange,
  label,
  placeholder = "SELECT OPTION",
  customers = DEFAULT_CUSTOMERS,
  defaultSelectedId,
  onSelect,
  showAllOption = false,
  allOptionLabel = "ALL",
  className = "",
  buttonClassName = "",
  fullWidth = false,
  disabled = false,
  maxHeight,
  layout = "unified",
}: GooeyMessagesDropdownProps) {
  const [internalSelected, setInternalSelected] = useState<string>(
    selected !== undefined ? selected : (defaultSelectedId ?? ""),
  );

  const activeValue = selected !== undefined ? selected : internalSelected;

  const normalizedOptions: CustomDropdownOption<string>[] = useMemo(() => {
    let list: CustomDropdownOption<string>[] = [];

    if (options && options.length > 0) {
      list = options.map((opt, i) => {
        if (typeof opt === "string") {
          return { value: opt, label: opt };
        }
        return {
          value: opt?.value !== undefined ? String(opt.value) : `opt-${i}`,
          label: opt?.label || opt?.value || `Option ${i + 1}`,
        };
      });
    } else {
      list = customers.map((c) => ({
        value: c.id,
        label: c.name,
      }));
    }

    if (showAllOption) {
      const hasAll = list.some(
        (c) =>
          String(c.value).toLowerCase() === "all" ||
          String(c.label).toLowerCase() === "all" ||
          (allOptionLabel &&
            String(c.label).toLowerCase() === allOptionLabel.toLowerCase()),
      );
      if (!hasAll) {
        list = [{ value: "ALL", label: allOptionLabel }, ...list];
      }
    }

    return list;
  }, [options, customers, showAllOption, allOptionLabel]);

  return (
    <CustomDropdown
      id={id}
      label={label}
      value={activeValue}
      options={normalizedOptions}
      placeholder={placeholder}
      className={className}
      buttonClassName={buttonClassName}
      fullWidth={fullWidth}
      disabled={disabled}
      maxHeight={maxHeight}
      layout={layout}
      onChange={(newVal) => {
        setInternalSelected(newVal);
        onChange?.(newVal);
        const match = normalizedOptions.find((o) => o.value === newVal);
        onSelect?.({
          id: newVal,
          name: match?.label || newVal,
        });
      }}
    />
  );
}
