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
      ? options.map((opt) =>
        typeof opt === "string"
          ? { id: opt, name: opt }
          : { id: opt.value, name: opt.label },
      )
      : customers;

  const hasAllOption = normalizedCustomers.some(
    (c) => c.id.toLowerCase() === "all" || c.name.toLowerCase() === "all",
  );

  if (showAllOption && !hasAllOption) {
    normalizedCustomers = [{ id: "All", name: "ALL" }, ...normalizedCustomers];
  }

  const activeSelectedId = selected !== undefined ? selected : selectedIdState;
  const selectedItem = normalizedCustomers.find(
    (c) =>
      c.id === activeSelectedId ||
      (activeSelectedId === "All" && c.id.toLowerCase() === "all"),
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
      className={`relative ${fullWidth ? "block w-full" : "inline-block"} ${open ? "z-[99999]" : "z-10"} ${className}`}
    >
      {/* Hidden SVG Gooey Filter Definition */}

      {label && (
        <label className="dark: mb-1 block text-[0.65rem] text-black/60 text-white/40">
          {label}
        </label>
      )}

      {/* Trigger Button (Crisp Foreground Layer) */}
      <button
        type="button"
        disabled={disabled}
        className={`relative z-50 min-h-[46px] border border-[#ffffff1a] border-white/10 bg-[#00000029] shadow-[0_24px_60px_#0000008c] backdrop-blur-xl ${fullWidth ? "w-full justify-between text-left" : "min-w-fit justify-between text-left"} ${noPadding ? "p-0" : fullWidth ? "px-4 py-0" : "px-4 py-0"} rounded-lg ${open ? "rounded-t-lg rounded-b-none bg-[#8d73d71c]" : "/90 border-white/10 bg-[#8d73d71c] hover:bg-[#8d73d71c]"} ${noBorder ? "!border-none" : ""} flex cursor-pointer items-center gap-3 shadow-[0_3px_9px_#0000008c] transition-[background-color,border-color,transform,box-shadow] disabled:cursor-not-allowed disabled:opacity-50`}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={triggerText}
        id={elementId}
        name={name}
      >
        <span
          className={`flex-1 break-words whitespace-normal ${triggerTextClassName}`}
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
          className={`shrink-0 ${open ? "rotate-90" : "rotate-0"}`}
          aria-hidden="true"
        >
          <path d="M4 2l4 4-4 4" />
        </svg>
      </button>

      {/* Gooey Options Menu Panel (Crisp Foreground Layer) */}
      {open && (
        <div
          className="animate-in fade-in zoom-in-95 slide-in-from-top-2 absolute top-full !left-0 z-[99999] w-max max-w-md min-w-full origin-top overflow-hidden rounded-lg rounded-t-none rounded-b-lg border border-t-0 border-white/10 bg-[#00000029] shadow-[0_25px_60px_rgba(0,0,0,0.95)] backdrop-blur-xl transition-[opacity,transform] ease-[cubic-bezier(0.34,1.56,0.64,1)]"
          role="listbox"
        >
          {(title || badge) && (
            <div className="mb-1 flex items-center justify-between border-b border-white/10 px-3 py-1.5">
              {title && <span>{title}</span>}
              {badge && (
                <span className="text-[10px] text-white/50">{badge}</span>
              )}
            </div>
          )}

          <div className="relative">
            {/* Scrollable Container */}
            <div
              ref={listRef}
              onScroll={handleScroll}
              className="no-scrollbar max-h-46 space-y-1 overflow-y-auto pr-1"
              data-lenis-prevent="true"
            >
              {normalizedCustomers.map((c) => {
                const isSelected = c.id === activeSelectedId;
                return (
                  <button
                    key={c.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={`!m-0 flex w-full cursor-pointer items-center justify-between !rounded-none px-4 py-2 text-left transition-[background-color,color] ${isSelected ? "bg-gradient-to-l from-purple-700 to-purple-900" : "from-purple-900 to-purple-500/90 hover:bg-gradient-to-l hover:text-white"}`}
                    onClick={() => {
                      setSelectedIdState(c.id);
                      onSelect?.(c);
                      onChange?.(c.id);
                      setOpen(false);
                    }}
                  >
                    <span className="text-[14px] break-words whitespace-normal">
                      {c.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Permanent Custom React DOM Scrollbar Indicator */}
            <div className="pointer-events-none absolute top-1 right-0 bottom-1 z-30 w-1.5 rounded-lg bg-white/10">
              <div
                className="w-full rounded-lg bg-purple-600 transition-[height,margin-top]"
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
