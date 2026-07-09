const fs = require('fs');

const filePath = "/Users/michaelscimeca/Desktop/7thHeaven/src/app/admin/page.tsx";
let content = fs.readFileSync(filePath, "utf8");

const targetOld = `        <div style={{ display: isSectionOpen('crewschedule') ? undefined : 'none' }}>
          <div className="p-6">`;

const schedulerControlsNew = `        <div style={{ display: isSectionOpen('crewschedule') ? undefined : 'none' }}>
          <div className="wiw-scheduler-container">
            {/* Header controls (Date range, prev/next, today, action icons) */}
            <div className="bg-black/40 border-b border-white/5 p-4 flex flex-col lg:flex-row items-center justify-between gap-4 select-none text-white">
              {/* Left: Date Range & Nav */}
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl font-bold text-white tracking-tight mr-2 min-w-[180px]">
                  {getWeekRangeLabel(currentWeekStart)}
                </h2>
                <div className="flex items-center border border-white/10 bg-black/40 rounded-lg shadow-sm overflow-hidden">
                  <button
                    type="button"
                    onClick={handlePrevWeek}
                    className="p-2 hover:bg-white/5 transition-colors border-r border-white/5 text-white/40 hover:text-white cursor-pointer border-none bg-transparent"
                    title="Previous Week"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      document.getElementById('wiw-date-picker')?.click();
                    }}
                    className="p-2 hover:bg-white/5 transition-colors border-r border-white/5 text-white/40 hover:text-white cursor-pointer border-none bg-transparent"
                    title="Choose Date"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  </button>
                  <input
                    type="date"
                    id="wiw-date-picker"
                    className="sr-only"
                    onChange={(e) => {
                      if (e.target.value) {
                        const chosen = new Date(e.target.value);
                        const day = chosen.getDay();
                        const diff = chosen.getDate() - day + (day === 0 ? -6 : 1);
                        setCurrentWeekStart(new Date(chosen.setDate(diff)));
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleNextWeek}
                    className="p-2 hover:bg-white/5 transition-colors text-white/40 hover:text-white cursor-pointer border-none bg-transparent"
                    title="Next Week"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleGoToToday}
                  className="px-3 py-1.5 border border-white/10 bg-black/40 hover:bg-white/5 text-xs font-bold text-white/70 hover:text-white rounded-lg shadow-sm transition-colors cursor-pointer border-solid"
                >
                  TODAY
                </button>

                <button
                  type="button"
                  onClick={handleGoToMonth}
                  className={\`px-3 py-1.5 border text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer border-solid \${
                    calendarRange === 'month'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                      : 'border-white/10 bg-black/40 hover:bg-white/5 text-white/70 hover:text-white'
                  }\`}
                >
                  MONTH
                </button>

                <div className="relative">
                  <select
                     value={(() => {
                       if (calendarRange === '4weeks') return '4weeks';
                       if (calendarRange === 'month') return 'month';
                       const time = currentWeekStart.getTime();
                       if (time === (currentWeekStart.getFullYear() === 2023 ? new Date(2023, 0, 23).getTime() : new Date(2025, 11, 29).getTime())) return '1';
                       if (time === new Date(2026, 0, 5).getTime()) return '2';
                       if (time === new Date(2026, 0, 12).getTime()) return '3';
                       if (time === new Date(2026, 0, 19).getTime()) return '4';
                       if (time === new Date(2026, 0, 26).getTime()) return '5';
                       return 'custom';
                     })()}
                     onChange={(e) => {
                       const val = e.target.value;
                       if (val === '4weeks') {
                         setCalendarRange('4weeks');
                         setCurrentWeekStart(new Date(2025, 11, 29));
                       } else if (val === 'month') {
                         setCalendarRange('month');
                         setCurrentWeekStart(new Date(2025, 11, 29));
                       } else {
                         setCalendarRange('week');
                         if (val === '1') {
                           const was2023 = currentWeekStart.getFullYear() === 2023;
                           setCurrentWeekStart(was2023 ? new Date(2023, 0, 23) : new Date(2025, 11, 29));
                         } else if (val === '2') {
                           setCurrentWeekStart(new Date(2026, 0, 5));
                         } else if (val === '3') {
                           setCurrentWeekStart(new Date(2026, 0, 12));
                         } else if (val === '4') {
                           setCurrentWeekStart(new Date(2026, 0, 19));
                         } else if (val === '5') {
                           setCurrentWeekStart(new Date(2026, 0, 26));
                         }
                       }
                     }}
                     className="appearance-none pr-8 pl-3 py-1.5 border border-white/10 bg-black/40 hover:bg-white/5 text-xs font-bold text-white/70 hover:text-white rounded-lg shadow-sm transition-colors cursor-pointer outline-none border-solid min-w-[95px]"
                   >
                     <option value="1">Week 1</option>
                     <option value="2">Week 2</option>
                     <option value="3">Week 3</option>
                     <option value="4">Week 4</option>
                     <option value="5">Week 5</option>
                     <option value="4weeks">Weeks 1-4</option>
                     <option value="month">Full Month</option>
                     <option value="custom" disabled hidden>Custom</option>
                   </select>
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-white/30">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                  </div>
                </div>

                {/* 🎸 Tour Dates Quick-Jump */}
                <div className="relative" data-tour-dropdown>
                  <button
                    type="button"
                    onClick={() => setShowTourDropdown(prev => !prev)}
                    className="px-3 py-1.5 border border-white/10 bg-black/40 hover:bg-white/5 text-xs font-bold text-white/70 hover:text-white rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5 border-solid"
                  >
                    🎸 Jump to Tour Date <span className="text-[10px] opacity-40">▼</span>
                  </button>
                  {showTourDropdown && (
                    <div className="absolute left-0 mt-1.5 w-64 bg-black/95 border border-white/10 rounded-xl shadow-2xl z-50 py-1.5 max-h-60 overflow-y-auto select-none backdrop-blur-md">
                      {tourDates.length === 0 ? (
                        <div className="px-4 py-3 text-xs text-white/30 italic">No tour dates available.</div>
                      ) : (
                        tourDates
                          .filter(s => s.date)
                          .map((show, idx) => {
                            const showDate = show.date ? new Date(show.date + 'T12:00:00') : null;
                            const dateLabel = showDate
                              ? showDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })
                              : 'Unknown';
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  if (show.date) {
                                    const chosen = new Date(show.date + 'T12:00:00');
                                    const day = chosen.getDay();
                                    const diff = chosen.getDate() - day + (day === 0 ? -6 : 1);
                                    setCurrentWeekStart(new Date(chosen.getFullYear(), chosen.getMonth(), diff));
                                  }
                                  setShowTourDropdown(false);
                                }}
                                className="w-full text-left px-4 py-2.5 hover:bg-white/5 flex items-center gap-3 border-none bg-transparent cursor-pointer transition-colors group"
                              >
                                <span className="text-[10px] font-black text-amber-400/70 group-hover:text-amber-400 uppercase tracking-wider min-w-[80px]">{dateLabel}</span>
                                <span className="text-xs font-bold text-white/70 group-hover:text-white truncate">{show.venue || show.venue_name}</span>
                                {show.city && <span className="text-[10px] text-white/30 ml-auto shrink-0">{show.city}</span>}
                              </button>
                            );
                          })
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="p-6">`;

if (content.includes(targetOld)) {
  console.log("Found Crews Schedule starting point. Adding controls and wiw-scheduler-container wrapper...");
  content = content.replace(targetOld, schedulerControlsNew);
  
  // Now add the matching closing tag at the end of renderCrewSchedule!
  // We need to change the single closing div to two closing divs:
  // - One to close p-6
  // - One to close wiw-scheduler-container
  // - One to close the display container (which is already there)
  
  const endOld = `          </div>
    </section>
  );
};`;

  const endNew = `          </div>
        </div>
    </section>
  );
};`;

  if (content.includes(endOld)) {
    content = content.replace(endOld, endNew);
    console.log("Successfully closed wiw-scheduler-container wrapper at the end!");
  } else {
    console.log("Warning: endOld block not found!");
  }
  
  fs.writeFileSync(filePath, content, "utf8");
} else {
  console.log("Warning: targetOld not found!");
}
