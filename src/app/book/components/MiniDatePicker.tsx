"use client";

import { useState, useMemo } from "react";

const M_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export interface MiniDatePickerProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
}

export function MiniDatePicker({ label, value, onChange }: MiniDatePickerProps) {
  const [showCal, setShowCal] = useState(false);
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [calMonth, setCalMonth] = useState(() => {
    if (value) {
      const vDate = new Date(value + 'T12:00:00');
      if (!isNaN(vDate.getTime())) return new Date(vDate.getFullYear(), vDate.getMonth(), 1);
    }
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const [showMonthGrid, setShowMonthGrid] = useState(false);
  const year = calMonth.getFullYear();
  const month = calMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysCount = new Date(year, month + 1, 0).getDate();

  const isPrevDisabled = new Date(year, month, 1) <= new Date(today.getFullYear(), today.getMonth(), 1);

  const inputId = `mini-datepicker-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

  return (
    <div className="relative">
      <label htmlFor={inputId} className="text-base uppercase text-white block mb-1.5 cursor-pointer">{label}</label>
      <button
        id={inputId}
        aria-label={label || "Pick a date"}
        type="button"
        onClick={() => setShowCal(!showCal)}

        className={`group w-full backdrop-blur-[45px] border border-white/10 outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0 focus-visible:ring-0 px-2.5 py-2.5 text-xl text-left transition-colors hover:bg-white/10 cursor-pointer flex items-center justify-between rounded-lg ${value ? 'text-white font-semibold' : 'text-white/45'}`}
        style={{ background: "#a855f71f", border: "1px solid #ffffff1a" }}>
        <span className={`transition-[color,opacity] duration-200 ${value ? 'text-white font-semibold' : 'text-white/45 group-hover:text-white group-hover:opacity-100'}`}>
          {value ? new Date(value + 'T12:00:00Z').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }) : 'Pick a date…'}
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50 group-hover:opacity-100 transition-opacity duration-200"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
      </button>
      {showCal && (
        <div className="absolute z-50 top-full mt-2 left-0 w-72 bg-[#0c0817] border-0 p-4 rounded-lg   animate-[fade-in-up_0.15s_ease-out_both]">
          <div className="flex items-center justify-between mb-3">
            <button
              aria-label="Previous Month"
              type="button"
              disabled={isPrevDisabled}
              onClick={() => setCalMonth(new Date(year, month - 1, 1))}
              className={`p-1 transition-colors ${isPrevDisabled ? 'text-white/20 cursor-not-allowed' : ' text-white hover:text-white cursor-pointer'}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <button aria-label="Action button" type="button" onClick={() => setShowMonthGrid(!showMonthGrid)} className="uppercase text-white/80 hover:text-[#c27aff] transition-colors cursor-pointer">{calMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</button>
            <button aria-label="Next Month" type="button" onClick={() => setCalMonth(new Date(year, month + 1, 1))} className="text-white hover:text-white p-1 cursor-pointer"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg></button>
          </div>
          {showMonthGrid ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <button aria-label="Action button" type="button" onClick={() => setCalMonth(new Date(year - 1, month, 1))} className="text-white hover:text-white text-base cursor-pointer">← {year - 1}</button>
                <span className="text-white">{year}</span>
                <button aria-label="Action button" type="button" onClick={() => setCalMonth(new Date(year + 1, month, 1))} className="text-white hover:text-white text-base cursor-pointer">{year + 1} →</button>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {M_NAMES.map((m, i) => {
                  const isCur = month === i;
                  const isPast = new Date(year, i + 1, 0) < today;
                  return (
                    <button aria-label="Action button" key={m} type="button" disabled={isPast} onClick={() => { setCalMonth(new Date(year, i, 1)); setShowMonthGrid(false); }}
                      className={`py-2 rounded-lg text-base    uppercase transition-colors ${isPast ? 'text-white/20 cursor-not-allowed' : isCur ? 'bg-[#a855f7] text-white shadow-purple-600/30' : 'text-white/70 hover:bg-white/10 cursor-pointer'}`}>{m}</button>
                  );
                })}
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-7 mb-1">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={`day-${i}-${d}`} className="text-center text-lg text-white/40 uppercase">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
                {Array.from({ length: daysCount }).map((_, i) => {
                  const d = new Date(year, month, i + 1);
                  d.setHours(0, 0, 0, 0);
                  const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                  const isPast = d < today;
                  const isSel = value === ds;
                  return (
                    <button aria-label="Action button"
                      key={ds} type="button" disabled={isPast}
                      onClick={() => { onChange(ds); setShowCal(false); }}
                      className={`h-10 w-full    rounded-lg transition-colors flex items-center justify-center ${isPast ? 'text-white/20 cursor-not-allowed' : isSel ? 'bg-[#a855f7] text-white shadow-purple-600/40    ' : ' bg-[#00000029] hover:bg-white/15 text-white/80 cursor-pointer'}`}>
                      {i + 1}
                    </button>
                  );
                })}
              </div>
              {value && (
                <button aria-label="Action button" type="button" onClick={() => { onChange(''); setShowCal(false); }} className="mt-2 w-full text-base text-rose-500 hover:text-rose-600 uppercase cursor-pointer">Clear</button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
