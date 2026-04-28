import React, { useState, useMemo } from "react";

export function CalendarPicker({
  selectedDate,
  onSelectDate,
  startTime,
  onStartTimeChange,
  endTime,
  onEndTimeChange,
  selectedType,
  onSelectType,
  customDetails,
  onCustomDetailsChange,
  label,
  required,
  blockedDates = [],
}: {
  selectedDate: string;
  onSelectDate: (d: string) => void;
  startTime: string;
  onStartTimeChange: (t: string) => void;
  endTime: string;
  onEndTimeChange: (t: string) => void;
  selectedType?: string;
  onSelectType?: (t: string) => void;
  customDetails?: string;
  onCustomDetailsChange?: (d: string) => void;
  label: string;
  required?: boolean;
  blockedDates?: string[];
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const blockedSet = useMemo(() => new Set(blockedDates), [blockedDates]);

  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const date = new Date(year, month, 1);
    const days = [];
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  }, [currentMonth]);

  const firstDayOfMonth = daysInMonth[0].getDay();
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="bg-[#0a0a0f] border border-[var(--color-accent)]/20 p-6 rounded-2xl w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-white font-bold tracking-widest uppercase text-[0.8rem]">{label} {required && <span className="text-[var(--color-accent)]">*</span>}</h3>
          <p className="text-white/40 text-[0.65rem] mt-1 uppercase tracking-wide">Select a date and time to secure your slot</p>
        </div>
        <div className="flex items-center gap-4 text-white font-bold bg-white/5 rounded-full px-4 py-1.5 relative">
          <button type="button" onClick={handlePrevMonth} className="hover:text-[var(--color-accent)] transition-colors cursor-pointer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <button type="button" onClick={() => setShowMonthPicker(!showMonthPicker)} className="w-28 text-center text-[0.85rem] tracking-wider uppercase hover:text-[var(--color-accent)] transition-colors cursor-pointer">
            {currentMonth.toLocaleString("default", { month: "long", year: "numeric" })}
          </button>
          <button type="button" onClick={handleNextMonth} className="hover:text-[var(--color-accent)] transition-colors cursor-pointer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>

          {showMonthPicker && (
            <div className="absolute z-50 top-full mt-3 right-0 w-64 bg-[#0c0c18] border border-white/10 rounded-2xl shadow-2xl p-4 animate-[fade-in-up_0.15s_ease-out_both]">
              <div className="flex items-center justify-between mb-3">
                <button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear() - 1, currentMonth.getMonth(), 1))} className="text-white/50 hover:text-white p-1 cursor-pointer"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg></button>
                <span className="text-sm font-bold text-white">{currentMonth.getFullYear()}</span>
                <button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear() + 1, currentMonth.getMonth(), 1))} className="text-white/50 hover:text-white p-1 cursor-pointer"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg></button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {monthNames.map((m, i) => {
                  const isCurrent = currentMonth.getMonth() === i;
                  const isPast = new Date(currentMonth.getFullYear(), i + 1, 0) < new Date();
                  return (
                    <button
                      key={m} type="button" disabled={isPast}
                      onClick={() => { setCurrentMonth(new Date(currentMonth.getFullYear(), i, 1)); setShowMonthPicker(false); }}
                      className={`py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${isPast ? 'text-white/10 cursor-not-allowed' : isCurrent ? 'bg-[var(--color-accent)] text-white shadow-[0_0_15px_rgba(133,29,239,0.3)]' : 'text-white/60 hover:bg-white/10 cursor-pointer'}`}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      {blockedDates.length > 0 && (
        <div className="flex items-center gap-5 mb-4 text-[0.6rem] uppercase tracking-widest font-bold">
          <span className="flex items-center gap-1.5 text-white/30"><span className="w-3 h-3 rounded bg-white/[0.02] border border-white/5 inline-block" /> Available</span>
          <span className="flex items-center gap-1.5 text-rose-400/60"><span className="w-3 h-3 rounded bg-rose-500/20 border border-rose-500/30 inline-block" /> Booked</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr_1.5fr] gap-8">
        <div>
          <div className="grid grid-cols-7 mb-4">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
              <div key={day} className="text-center text-[0.6rem] font-bold uppercase tracking-widest text-white/30">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {emptyDays.map(i => (
              <div key={`empty-${i}`} className="h-12 border border-transparent"></div>
            ))}
            {daysInMonth.map(date => {
              const dateString = date.toISOString().split("T")[0];
              const isSelected = selectedDate === dateString;
              const cutoffDate = new Date();
              cutoffDate.setDate(cutoffDate.getDate() + 1);
              cutoffDate.setHours(23, 59, 59, 999);
              const isTooSoon = date < cutoffDate;
              const isBlocked = blockedSet.has(dateString);
              
              return (
                <button
                  key={dateString}
                  type="button"
                  disabled={isTooSoon || isBlocked}
                  onClick={() => onSelectDate(dateString)}
                  title={isBlocked ? "This date is already booked" : undefined}
                  className={`h-12 w-full flex items-center justify-center rounded-xl font-bold text-[0.85rem] transition-all relative
                    ${(isTooSoon || isBlocked) ? "cursor-not-allowed" : "cursor-pointer"}
                    ${isBlocked
                      ? "bg-rose-500/10 border border-rose-500/20 text-rose-400/40 line-through"
                      : isSelected 
                        ? "bg-[var(--color-accent)] text-white shadow-[0_0_20px_rgba(133,29,239,0.4)]" 
                        : isTooSoon
                          ? "opacity-20 text-white"
                          : "bg-white/[0.02] border border-white/5 hover:border-[var(--color-accent)]/50 hover:bg-white/10 text-white"}
                  `}
                >
                  {date.getDate()}
                  {isBlocked && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="border-t lg:border-t-0 lg:border-l border-white/10 pt-6 lg:pt-0 lg:pl-6">
          <h4 className="text-[0.65rem] font-bold uppercase tracking-[0.15em] text-white/40 mb-4">
            Booking Window
          </h4>
          <div className="flex flex-col gap-6">
            <div>
              <label className="text-[0.55rem] font-bold uppercase tracking-widest text-white/50 block mb-2">Start Time</label>
              <div className="relative">
                <select 
                  value={startTime} 
                  onChange={(e) => onStartTimeChange(e.target.value)}
                  className="w-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 text-white font-bold tracking-wider py-4 px-5 rounded-xl outline-none focus:border-[var(--color-accent)] transition-all appearance-none cursor-pointer"
                >
                  <option value="" disabled className="bg-[#0a0a0f]">Select Start Time</option>
                  {["12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM", "10:00 PM", "11:00 PM", "12:00 AM"].map(time => (
                    <option key={time} value={time} className="bg-[#0a0a0f]">{time}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
              </div>
            </div>
            <div>
              <label className="text-[0.55rem] font-bold uppercase tracking-widest text-white/50 block mb-2">End Time</label>
              <div className="relative">
                <select 
                  value={endTime} 
                  onChange={(e) => onEndTimeChange(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 text-white font-bold tracking-wider py-4 px-5 rounded-xl outline-none focus:border-white/30 transition-all appearance-none cursor-pointer"
                >
                  <option value="" disabled className="bg-[#0a0a0f]">Select End Time</option>
                  {["12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM", "10:00 PM", "11:00 PM", "12:00 AM", "1:00 AM", "2:00 AM"].map(time => (
                    <option key={time} value={time} className="bg-[#0a0a0f]">{time}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t lg:border-t-0 lg:border-l border-white/10 pt-6 lg:pt-0 lg:pl-6">
          <h4 className="text-[0.65rem] font-bold uppercase tracking-[0.15em] text-white/40 mb-4">
            Event Format
          </h4>
          <div className="flex flex-col gap-3">
            {[
              { id: "full_band", label: "Full Band", icon: "🎸", desc: "High energy, full 5-piece concert setup" },
              { id: "unplugged", label: "Unplugged", icon: "🎤", desc: "Acoustic, intimate stripped-down set" },
              { id: "private", label: "Private Event", icon: "🎉", desc: "Birthdays, corporate events, weddings" },
              { id: "custom", label: "Custom Booking", icon: "✨", desc: "Special requests, festivals, hybrid shows" },
            ].map(type => {
               const isSelected = selectedType === type.id;
               return (
                 <div key={type.id}>
                   <button
                     type="button"
                     onClick={() => onSelectType && onSelectType(type.id)}
                     className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer flex gap-4 items-center group
                       ${isSelected 
                         ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 shadow-[0_0_15px_rgba(133,29,239,0.2)]" 
                         : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]"}
                     `}
                   >
                     <span className="text-2xl drop-shadow-md">{type.icon}</span>
                     <div>
                       <span className={`text-[0.85rem] font-bold block mb-0.5 tracking-wide ${isSelected ? "text-[var(--color-accent)]" : "text-white"}`}>{type.label}</span>
                       <span className="text-[0.65rem] text-white/40 block leading-tight">{type.desc}</span>
                     </div>
                   </button>
                   {type.id === "custom" && isSelected && (
                     <div className="mt-2 animate-[fade-in-up_0.2s_ease-out_both]">
                       <input
                         type="text"
                         placeholder="Describe your custom event (e.g. Street Fair)..."
                         value={customDetails || ""}
                         onChange={(e) => onCustomDetailsChange?.(e.target.value)}
                         autoFocus
                         className="w-full bg-white/[0.01] border border-[var(--color-accent)]/30 text-white text-[0.8rem] px-4 py-3 rounded-xl focus:outline-none focus:border-[var(--color-accent)] transition-all [color-scheme:dark] placeholder:text-white/20"
                       />
                     </div>
                   )}
                 </div>
               );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
