/* eslint-disable react-doctor/no-high-complexity-react-function */
"use client";

import { useState, useRef, useEffect, useId } from "react";

export interface DropdownOption {
  label: string;
  value: string;
}

export interface GooeyCustomer {
  id: string;
  name: string;
}

export interface GooeyMessagesDropdownProps {
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
  triggerTextClassName?: string;
  activeBg?: string;
  defaultBg?: string;
  fullWidth?: boolean;
  noBorder?: boolean;
  transparentBg?: boolean;
  noPadding?: boolean;
  disabled?: boolean;
  showAllOption?: boolean;
  id?: string;
  name?: string;
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
  options,
  selected,
  onChange,
  label,
  title = "",
  badge = "",
  placeholder = "SELECT OPTION",
  customers = DEFAULT_CUSTOMERS,
  defaultSelectedId,
  onSelect,
  showAllOption = true,
  className = "",
  triggerTextClassName = "",
  fullWidth = false,
  noBorder = false,
  noPadding = false,
  disabled = false,
  id,
  name,
}: GooeyMessagesDropdownProps) {
  const autoId = useId();
  const elementId = id || autoId;

  const [open, setOpen] = useState(false);
  const [selectedIdState, setSelectedIdState] = useState<string | undefined>(
    defaultSelectedId,
  );
  const wrapRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [thumbHeightRatio, setThumbHeightRatio] = useState(1);

  let normalizedCustomers: GooeyCustomer[] =
    options && options.length > 0
      ? options.map((opt, i) =>
        typeof opt === "string"
          ? { id: opt, name: opt }
          : {
            id: opt?.value !== undefined && opt?.value !== null ? String(opt.value) : `opt-${i}`,
            name: opt?.label || opt?.value || `Option ${i + 1}`,
          },
      )
      : customers;

  const hasAllOption = normalizedCustomers.some(
    (c) =>
      String(c?.id || "").toLowerCase() === "all" ||
      String(c?.name || "").toLowerCase() === "all",
  );

  if (showAllOption && !hasAllOption) {
    normalizedCustomers = [{ id: "All", name: "ALL" }, ...normalizedCustomers];
  }

  const activeSelectedId = selected !== undefined ? selected : selectedIdState;
  const selectedItem = normalizedCustomers.find(
    (c) =>
      c &&
      (c.id === activeSelectedId ||
        (activeSelectedId && String(c.id || "").toLowerCase() === String(activeSelectedId).toLowerCase()) ||
        ((!activeSelectedId || String(activeSelectedId).toLowerCase() === "all") &&
          String(c.id || "").toLowerCase() === "all")),
  );
  const triggerText = selectedItem ? selectedItem.name : placeholder;

  const handleScroll = () => {
    if (!listRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    const maxScroll = scrollHeight - clientHeight;
    if (maxScroll > 0) {
      setScrollProgress(scrollTop / maxScroll);
      setThumbHeightRatio(clientHeight / scrollHeight);
    } else {
      setScrollProgress(0);
      setThumbHeightRatio(1);
    }
  };

  useEffect(() => {
    if (open) {
      const t = setTimeout(handleScroll, 10);
      return () => clearTimeout(t);
    }
  }, [open, normalizedCustomers.length]);

  useEffect(() => {
    if (!open) return;
    function handlePointer(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div
      ref={wrapRef}
      className={`seventh-heaven-dropdown ${fullWidth ? "seventh-heaven-dropdown-full-width" : "seventh-heaven-dropdown-inline"} ${open ? "is-open" : "is-closed"} ${className}`}
    >
      {/* Hidden SVG Gooey Filter Definition */}

      {label && (
        <label className="seventh-heaven-dropdown-label">
          {label}
        </label>
      )}

      {/* Trigger Button (Crisp Foreground Layer) */}
      <button
        type="button"
        disabled={disabled}
        className={`transition-[background-color,color,border-color,box-shadow,transform] seventh-heaven-dropdown-trigger ${fullWidth ? "seventh-heaven-dropdown-trigger-full" : "seventh-heaven-dropdown-trigger-fit"} ${noPadding ? "seventh-heaven-dropdown-trigger-no-padding" : "seventh-heaven-dropdown-trigger-padding"} ${open ? "is-open" : "is-closed"} ${noBorder ? "no-border" : ""}`}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={triggerText}
        id={elementId}
        name={name}
      >
        <span
          className={`seventh-heaven-dropdown-text ${triggerTextClassName}`}
        >
          {triggerText}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`seventh-heaven-dropdown-chevron ${open ? "is-open" : ""}`}
          aria-hidden="true"
        >
          <path d="M4 2l4 4-4 4" />
        </svg>
      </button>

      {/* Gooey Options Menu Panel (Crisp Foreground Layer) */}
      {open && (
        <div
          className="seventh-heaven-dropdown-panel"
          role="listbox"
        >
          {(title || badge) && (
            <div className="seventh-heaven-dropdown-header">
              {title && <span>{title}</span>}
              {badge && (
                <span className="seventh-heaven-dropdown-badge">{badge}</span>
              )}
            </div>
          )}

          <div className="seventh-heaven-dropdown-body">
            {/* Scrollable Container */}
            <div
              ref={listRef}
              onScroll={handleScroll}
              className="seventh-heaven-dropdown-list no-scrollbar"
              data-lenis-prevent="true"
            >
              {normalizedCustomers.map((c) => {
                const isSelected =
                  c.id === activeSelectedId ||
                  (activeSelectedId && String(c.id || "").toLowerCase() === String(activeSelectedId).toLowerCase()) ||
                  ((!activeSelectedId || String(activeSelectedId).toLowerCase() === "all") &&
                    String(c.id || "").toLowerCase() === "all");
                return (
                  <button
                    key={c.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={`seventh-heaven-dropdown-item ${isSelected ? "is-selected" : ""}`}
                    onClick={() => {
                      setSelectedIdState(c.id);
                      onSelect?.(c);
                      onChange?.(c.id);
                      setOpen(false);
                    }}
                  >
                    <span className="seventh-heaven-dropdown-item-text">
                      {c.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Permanent Custom React DOM Scrollbar Indicator */}
            <div className="seventh-heaven-dropdown-scrollbar-track">
              <div
                className="seventh-heaven-dropdown-scrollbar-thumb"
                style={{
                  height: `${Math.max(20, Math.min(100, thumbHeightRatio * 100))}%`,
                  marginTop: `${scrollProgress *
                    (100 -
                      Math.max(20, Math.min(100, thumbHeightRatio * 100))) *
                    0.01 *
                    (listRef.current ? listRef.current.clientHeight - 8 : 150)
                    }px`,
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
