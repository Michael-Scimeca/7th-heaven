"use client";

import { useState, useRef, useEffect } from "react";

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
  className = "",
  triggerTextClassName = "",
  fullWidth = false,
  noBorder = false,
  noPadding = false,
  disabled = false,
  id,
  name,
}: GooeyMessagesDropdownProps) {
  const [open, setOpen] = useState(false);
  const [selectedIdState, setSelectedIdState] = useState<string | undefined>(defaultSelectedId);
  const wrapRef = useRef<HTMLDivElement>(null);

  const normalizedCustomers: GooeyCustomer[] =
    options && options.length > 0
      ? options.map((opt) => (typeof opt === "string" ? { id: opt, name: opt } : { id: opt.value, name: opt.label }))
      : customers;

  const activeSelectedId = selected !== undefined ? selected : selectedIdState;
  const selectedItem = normalizedCustomers.find((c) => c.id === activeSelectedId);
  const triggerText = selectedItem ? selectedItem.name : placeholder;

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
      className={`relative ${fullWidth ? "w-full block" : "inline-block"} ${open ? "z-[99999]" : "z-10"} [font-family:Inter,var(--font-inter,sans-serif)] ${className}`}
    >
      {label && (
        <label className="text-[0.65rem] font-bold text-black/60 dark:text-white/40 uppercase tracking-wider block mb-1">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        className={` backdrop-blur-xl bg-[#a855f71f] relative z-50 border ${fullWidth ? "w-full justify-between text-left" : "min-w-fit justify-between text-left"
          } ${noPadding ? "p-0" : fullWidth ? "px-4 py-2.5" : "px-4 py-2"} rounded-xl ${open
            ? "bg-[#6917BF] border-purple-400 text-white shadow-[0_0_20px_rgba(105,23,191,0.5)]"
            : "bg-[#180f33] border-white/15 text-white/90 "
          } ${noBorder ? "!border-none" : ""} flex items-center gap-3 cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={triggerText}
        id={id}
        name={name}
      >
        <span className={`text-xs font-black uppercase tracking-wider text-white truncate flex-1 ${triggerTextClassName}`}>
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
          className={`shrink-0 text-white/80 transition-transform duration-200 ${open ? "rotate-180 text-white" : ""}`}
          aria-hidden="true"
        >
          <path d="M2 4l4 4 4-4" />
        </svg>
      </button>

      {/* Dropdown Options Menu Panel */}
      {open && (
        <div
          className="absolute left-0 top-full mt-2 min-w-full w-max max-w-sm bg-[#120826] border border-purple-500/40 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] backdrop-blur-2xl z-[99999] overflow-hidden"
          role="listbox"
        >
          {(title || badge) && (
            <div className="flex items-center justify-between px-3  border-b border-white/10 mb-1">
              {title && <span className="text-xs font-black uppercase tracking-wider text-purple-300">{title}</span>}
              {badge && <span className="text-[10px] font-bold text-white/50">{badge}</span>}
            </div>
          )}

          <div className="max-h-60 overflow-y-auto gooey-dropdown-scrollbar space-y-1 pr-1" data-lenis-prevent="true">
            {normalizedCustomers.map((c) => {
              const isSelected = c.id === activeSelectedId;
              return (
                <button
                  key={c.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`w-full !m-0 text-left px-3.5 py-2.5 rounded-none !rounded-none text-xs font-black uppercase tracking-wider transition-all duration-150 flex items-center justify-between cursor-pointer ${isSelected
                    ? "text-white bg-purple-500/20 "
                    : "text-white/80 hover:text-white hover:bg-purple-500/20"
                    }`}
                  onClick={() => {
                    setSelectedIdState(c.id);
                    onSelect?.(c);
                    onChange?.(c.id);
                    setOpen(false);
                  }}
                >
                  <span className="truncate pr-2 font-black uppercase tracking-wider">{c.name}</span>
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,1)] shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
