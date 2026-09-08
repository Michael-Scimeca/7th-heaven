"use client";

import React from "react";
import GooeyMessagesDropdown from "@/components/GooeyMessagesDropdown";
import { SectionBadge } from "@/components/SectionBadge";

export const TextAreaField = ({ label, required, id, ...props }: { label: string; required?: boolean; id?: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) => {
  const textareaId = id || props.name || `book-textarea-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  return (
    <div>
      <label htmlFor={textareaId} className="text-base font-bold uppercase tracking-[0.15em] text-white block mb-2">{label}{required && " *"}</label>
      <div className="input-glow-border rounded-lg">
        <textarea id={textareaId} {...props} required={required}
          className="w-full bg-[#00000029] border-0 px-4 py-3 text-lg text-white placeholder:text-white/30 focus:outline-none transition-colors rounded-lg resize-y min-h-[95px]"
        />
      </div>
    </div>
  );
};

export const SelectField = ({ label, options, required, id, value, onChange, name }: { label: string; options: string[]; required?: boolean; id?: string; value?: string; onChange?: (e: any) => void; name?: string }) => {
  const selectId = id || name || `book-select-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  return (
    <div>
      <label htmlFor={selectId} className="text-base font-bold uppercase tracking-[0.15em] text-white block mb-2">{label}{required && " *"}</label>
      <GooeyMessagesDropdown
        placeholder="Select"
        defaultSelectedId={value ? String(value) : undefined}
        customers={options.map(o => ({ id: o, name: o }))}
        onSelect={(opt) => {
          if (onChange) {
            onChange({ target: { name: name || selectId, value: opt.id } });
          }
        }}
      />
    </div>
  );
};

export const RadioPillField = ({ label, name, options, value, onChange, required }: { label: string; name: string, options: string[], value: string, onChange: any, required?: boolean }) => (
  <div className="mb-2">
    <span className="text-base font-bold uppercase tracking-[0.15em] text-white block mb-3">{label}{required && " *"}</span>
    <div className="flex flex-wrap gap-2.5">
      {options.map(o => (
        <SectionBadge
          key={o}
          onClick={() => onChange({ target: { name, value: o } } as any)}
          isActive={value === o}
        >
          {o}
        </SectionBadge>
      ))}
    </div>
  </div>
);
