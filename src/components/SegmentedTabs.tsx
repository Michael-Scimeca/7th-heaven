"use client";

import React from "react";
import SeventhButton from "@/components/SeventhButton";

export interface SegmentedTabOption<T extends string | number = string> {
  id: T;
  label: React.ReactNode;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface SegmentedTabsProps<T extends string | number = string> {
  tabs: SegmentedTabOption<T>[];
  activeTab: T;
  onChange: (tabId: T) => void;
  className?: string;
  gridColsClass?: string;
  size?: "sm" | "md" | "lg";
  ariaLabel?: string;
}

const getGridColsClass = (count: number): string => {
  switch (count) {
    case 1:
      return "grid-cols-1";
    case 2:
      return "grid-cols-2";
    case 3:
      return "grid-cols-3";
    case 4:
      return "grid-cols-4";
    case 5:
      return "grid-cols-5";
    case 6:
      return "grid-cols-6";
    default:
      return "grid-cols-2 sm:grid-cols-4";
  }
};

export const SegmentedTabs = <T extends string | number = string>({
  tabs,
  activeTab,
  onChange,
  className = "",
  gridColsClass,
  ariaLabel = "Tab selector",
}: SegmentedTabsProps<T>) => {
  const gridClass = gridColsClass || getGridColsClass(tabs.length);

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={`grid shrink-0 gap-2 border border-white/10 bg-[#00000029] p-1 rounded-full  ${gridClass} ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;

        if (isActive) {
          return (
            <SeventhButton
              key={String(tab.id)}
              type="button"
              role="tab"
              aria-selected={true}
              aria-controls={`panel-${String(tab.id)}`}
              onClick={() => onChange(tab.id)}
              disabled={tab.disabled}
              icon={false}
              className="cursor-pointer"
            >
              <span className="inline-flex items-center gap-2">
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge !== null && (
                  <span className="opacity-90">({tab.badge})</span>
                )}
              </span>
            </SeventhButton>
          );
        }

        return (
          <button
            key={String(tab.id)}
            type="button"
            role="tab"
            aria-selected={false}
            aria-controls={`panel-${String(tab.id)}`}
            onClick={() => onChange(tab.id)}
            disabled={tab.disabled}
            className="transition-colors flex cursor-pointer items-center justify-center gap-2 border-none py-2 px-3 text-sm font-medium text-white/70 hover:text-white focus:outline-none disabled:cursor-not-allowed disabled:opacity-40"
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge !== undefined && tab.badge !== null && (
              <span className="opacity-75">({tab.badge})</span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default SegmentedTabs;
