const fs = require("fs");

const filePath = "/Users/michaelscimeca/Desktop/7thHeaven/src/app/admin/page.tsx";
let content = fs.readFileSync(filePath, "utf8");

console.log("Original content size:", content.length);

// 1. Remove duplicate state definitions
// Look for lines 403-411:
const duplicateStateOld = `  const [trackVisibility, setTrackVisibility] = useState<'everyone' | 'fans'>('everyone');
  const [trackDurationType, setTrackDurationType] = useState<'indefinite' | 'temporary'>('indefinite');
  const [trackDurationHours, setTrackDurationHours] = useState('24');
  const [trackCustomExpiresAt, setTrackCustomExpiresAt] = useState('');
  const [trackCompression, setTrackCompression] = useState<'superb' | 'standard' | 'high' | 'none'>('standard');
  const [trackNormalize, setTrackNormalize] = useState(true);
  const [uploadingTrack, setUploadingTrack] = useState(false);
  const [trackUploadError, setTrackUploadError] = useState('');
  const [trackUploadSuccess, setTrackUploadSuccess] = useState(false);`;

if (content.includes(duplicateStateOld)) {
  console.log("Found duplicate state definitions. Removing them...");
  content = content.replace(duplicateStateOld, "");
} else {
  console.log("Warning: duplicateStateOld not found!");
}

// 2. Remove duplicate/obsolete handleCloseTrack and handleUploadTrack (second ones)
// In post-replay, the second definitions start after the first ones.
// Let's find the second "const handleCloseTrack = async () =>" and delete everything from there up to the start of the next section, which is case 'bookings' or similar?
// Let's find "const handleCloseTrack" occurrences.
const closeTrackKeyword = "const handleCloseTrack = async () =>";
const firstCloseTrackIdx = content.indexOf(closeTrackKeyword);
const secondCloseTrackIdx = content.indexOf(closeTrackKeyword, firstCloseTrackIdx + 1);

if (secondCloseTrackIdx !== -1) {
  console.log("Found duplicate close/upload handlers. Deleting obsolete definitions...");
  // Find where the next function starts: "const render" or "const seedData" or whatever is after handleUploadTrack.
  // In the file, the next thing after the second handleUploadTrack was const renderShopify.
  const shopifyIdx = content.indexOf("const renderShopify", secondCloseTrackIdx);
  if (shopifyIdx !== -1) {
    // Delete from secondCloseTrackIdx to shopifyIdx
    content = content.substring(0, secondCloseTrackIdx) + content.substring(shopifyIdx);
    console.log("Successfully removed duplicate handlers.");
  }
} else {
  console.log("Warning: secondCloseTrackIdx not found!");
}

// 3. Fix unclosed divs in renderBookings
const bookingsOld = `                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </section>
  );

  const renderPlanners = () => (`;

const bookingsNew = `                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </section>
  );

  const renderPlanners = () => (`;

if (content.includes(bookingsOld)) {
  console.log("Fixing renderBookings unclosed div...");
  content = content.replace(bookingsOld, bookingsNew);
} else {
  console.log("Warning: bookingsOld block not found!");
}

// 4. Fix unclosed divs in renderPlanners
const plannersOld = `                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
  );

  const renderPhotoMod = () => (`;

const plannersNew = `                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
  );

  const renderPhotoMod = () => (`;

if (content.includes(plannersOld)) {
  console.log("Fixing renderPlanners unclosed div...");
  content = content.replace(plannersOld, plannersNew);
} else {
  console.log("Warning: plannersOld block not found!");
}

// 5. Fix renderMemoryMod ends
const memoryOld = `                        </div>
                      </div>
                    );
                    })}
                  </div>
                )}
              </div>}
            </section>
  );

  const renderFeaturedTrack = () => (`;

const memoryNew = `                        </div>
                      </div>
                    );
                    }))}
                  </div>
                )}
              </div>
            </section>
  );

  const renderFeaturedTrack = () => (`;

if (content.includes(memoryOld)) {
  console.log("Fixing renderMemoryMod map and braces...");
  content = content.replace(memoryOld, memoryNew);
} else {
  console.log("Warning: memoryOld block not found!");
}

// 6. Profiles table corrupted Create Group button removal
const profilesSearch = `Reset & Show`;
const resetIdx = content.indexOf(profilesSearch);
if (resetIdx !== -1) {
  // Let's find the Create Group button starting from resetIdx
  const groupButtonIdx = content.indexOf("➕ Create Group", resetIdx);
  if (groupButtonIdx !== -1) {
    const startOfBtn = content.lastIndexOf("<button", groupButtonIdx);
    const endOfBtn = content.indexOf("</button>", groupButtonIdx) + 9;
    if (startOfBtn !== -1 && endOfBtn !== -1) {
      console.log("Removing duplicate Create Group button from profiles cell...");
      content = content.substring(0, startOfBtn) + content.substring(endOfBtn);
    }
  }
} else {
  console.log("Warning: Profiles table Reset & Show not found!");
}

// 7. Fix renderCrewSchedule end unclosed div / activeDropDay expr
const scheduleEndOld = `                      )}
                    </div>
                  </div>

                </div>
              </div>
              );
            })()}

          </div>
        </div>
      </section>
    );
  };`;

const scheduleEndNew = `                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      );
    };`;

if (content.includes(scheduleEndOld)) {
  console.log("Fixing renderCrewSchedule unclosed divs and parenthesis...");
  content = content.replace(scheduleEndOld, scheduleEndNew);
} else {
  console.log("Warning: scheduleEndOld block not found!");
}

// 8. Restore </CustomScrollbar> inside quick scroll nav
const scrollbarOld = `                </button>
              </>
            )}
          </div>

      </div>`;

const scrollbarNew = `                </button>
              </>
            )}
          </div>
        </CustomScrollbar>
      </div>`;

if (content.includes(scrollbarOld)) {
  console.log("Restoring </CustomScrollbar> closing tag...");
  content = content.replace(scrollbarOld, scrollbarNew);
} else {
  console.log("Warning: scrollbarOld block not found!");
}

// 9. Fix Featured Track select block (replace corrupted calendar controls part)
const featuredTrackCorruptedOld = `                 {trackDurationType === 'temporary' && (
                   <div className="space-y-3 bg-black/40 border border-white/5 p-4 rounded-lg">
                     <div>
                       <label className="block text-3xs font-bold uppercase tracking-widest text-white/30 mb-2">Availability Limit</label>
                   onClick={handleGoToToday}
                   className="px-3 py-1.5 border border-white/10 bg-black/40 hover:bg-white/5 text-xs font-bold text-white/70 hover:text-white rounded-lg shadow-sm transition-colors cursor-pointer border-solid"
                 >
                   TODAY
                 </button>

                 <button
                   type="button"
                   onClick={handleGoToMonth}
                   className={\`px-3 py-1.5 border text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer border-solid \\\${
                     calendarRange === 'month'
                       ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                       : 'border-white/10 bg-black/40 hover:bg-white/5 text-white/70 hover:text-white'
                   }\`}
                 >
                   MONTH
                 </button>

                 <div className="relative">
                  <select
                        value={trackDurationHours}
                        onChange={(e) => setTrackDurationHours(e.target.value)}
                        className="bg-black/80 border border-white/10 rounded-md px-3 py-1.5 text-xs text-white/80 focus:outline-none focus:border-[var(--color-accent)]/50 transition-colors"
                      >
                        <option value="1">1 Hour</option>
                        <option value="3">3 Hours</option>
                        <option value="24">24 Hours (1 Day)</option>
                        <option value="72">72 Hours (3 Days)</option>
                        <option value="168">168 Hours (7 Days)</option>
                        <option value="custom">Custom Date & Time</option>
                      </select>
                    </div>

                    {trackDurationHours === 'custom' && (
                      <div>
                        <label className="block text-3xs font-bold uppercase tracking-widest text-white/30 mb-2">Select Expiration Date & Time</label>
                        <input
                          type="datetime-local"
                          required
                          value={trackCustomExpiresAt}
                          onChange={(e) => setTrackCustomExpiresAt(e.target.value)}
                          className="bg-black/80 border border-white/10 rounded-md px-3 py-1.5 text-xs text-white/80 focus:outline-none focus:border-[var(--color-accent)]/50"
                        />
                      </div>
                    )}
                  </div>
                )}`;

const featuredTrackCleanNew = `                 {trackDurationType === 'temporary' && (
                   <div className="space-y-3 bg-black/40 border border-white/5 p-4 rounded-lg">
                     <div>
                       <label className="block text-3xs font-bold uppercase tracking-widest text-white/30 mb-2">Availability Limit</label>
                       <select
                         value={trackDurationHours}
                         onChange={(e) => setTrackDurationHours(e.target.value)}
                         className="bg-black/80 border border-white/10 rounded-md px-3 py-1.5 text-xs text-white/80 focus:outline-none focus:border-[var(--color-accent)]/50 transition-colors"
                       >
                         <option value="1">1 Hour</option>
                         <option value="3">3 Hours</option>
                         <option value="24">24 Hours (1 Day)</option>
                         <option value="72">72 Hours (3 Days)</option>
                         <option value="168">168 Hours (7 Days)</option>
                         <option value="custom">Custom Date & Time</option>
                       </select>
                     </div>
                     {trackDurationHours === 'custom' && (
                       <div>
                         <label className="block text-3xs font-bold uppercase tracking-widest text-white/30 mb-2">Select Expiration Date & Time</label>
                         <input
                           type="datetime-local"
                           required
                           value={trackCustomExpiresAt}
                           onChange={(e) => setTrackCustomExpiresAt(e.target.value)}
                           className="bg-black/80 border border-white/10 rounded-md px-3 py-1.5 text-xs text-white/80 focus:outline-none focus:border-[var(--color-accent)]/50"
                         />
                       </div>
                     )}
                   </div>
                 )}`;

if (content.includes(featuredTrackCorruptedOld)) {
  console.log("Fixing featured track corrupted select block...");
  content = content.replace(featuredTrackCorruptedOld, featuredTrackCleanNew);
} else {
  // Let's search by keywords since string literals can contain backslash escaping differences
  const limitIdx = content.indexOf("Availability Limit");
  if (limitIdx !== -1) {
    const todayBtnIdx = content.indexOf("handleGoToToday", limitIdx);
    if (todayBtnIdx !== -1 && todayBtnIdx < limitIdx + 200) {
      console.log("Found corrupted calendar buttons inside Featured Track availability limit block. Replacing dynamically...");
      const endOfExp = content.indexOf("trackUploadError", limitIdx);
      if (endOfExp !== -1) {
        const lastBrace = content.lastIndexOf("}", endOfExp);
        const before = content.substring(0, content.lastIndexOf("trackDurationType === 'temporary'", limitIdx));
        const after = content.substring(lastBrace + 1);
        content = before + `trackDurationType === 'temporary' && (
                   <div className="space-y-3 bg-black/40 border border-white/5 p-4 rounded-lg">
                     <div>
                       <label className="block text-3xs font-bold uppercase tracking-widest text-white/30 mb-2">Availability Limit</label>
                       <select
                         value={trackDurationHours}
                         onChange={(e) => setTrackDurationHours(e.target.value)}
                         className="bg-black/80 border border-white/10 rounded-md px-3 py-1.5 text-xs text-white/80 focus:outline-none focus:border-[var(--color-accent)]/50 transition-colors"
                       >
                         <option value="1">1 Hour</option>
                         <option value="3">3 Hours</option>
                         <option value="24">24 Hours (1 Day)</option>
                         <option value="72">72 Hours (3 Days)</option>
                         <option value="168">168 Hours (7 Days)</option>
                         <option value="custom">Custom Date & Time</option>
                       </select>
                     </div>
                     {trackDurationHours === 'custom' && (
                       <div>
                         <label className="block text-3xs font-bold uppercase tracking-widest text-white/30 mb-2">Select Expiration Date & Time</label>
                         <input
                           type="datetime-local"
                           required
                           value={trackCustomExpiresAt}
                           onChange={(e) => setTrackCustomExpiresAt(e.target.value)}
                           className="bg-black/80 border border-white/10 rounded-md px-3 py-1.5 text-xs text-white/80 focus:outline-none focus:border-[var(--color-accent)]/50"
                         />
                       </div>
                     )}
                   </div>
                 )\n` + after;
      }
    }
  }
}

// 10. Replace getNext7Days and define prev/next week, today, month navigation functions
const scheduleHeaderOld = `    // Generate next 7 days for the calendar view starting from today
    const getNext7Days = () => {
      const days = [];
      const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const dateStr = \`\${yyyy}-\${mm}-\${dd}\`;
        days.push({
          dateStr,
          dayName: weekdayNames[d.getDay()],
          dayOfMonth: d.getDate(),
          monthName: d.toLocaleString('en-US', { month: 'short' })
        });
      }
      return days;
    };`;

const scheduleHeaderNew = `    const getWeekRangeLabel = (weekStart: Date) => {
      if (calendarRange === 'month') {
        const isBridgeToJanuary = weekStart.getMonth() === 11 && weekStart.getDate() > 20;
        const targetYear = isBridgeToJanuary ? weekStart.getFullYear() + 1 : weekStart.getFullYear();
        const targetMonth = isBridgeToJanuary ? 0 : weekStart.getMonth();
        const d = new Date(targetYear, targetMonth, 1);
        return d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
      }
      if (calendarRange === '4weeks') {
        const start = new Date(weekStart);
        const end = new Date(weekStart);
        end.setDate(weekStart.getDate() + 27);
        const startMonth = start.toLocaleString('en-US', { month: 'short' });
        const endMonth = end.toLocaleString('en-US', { month: 'short' });
        const startYear = start.getFullYear();
        if (startMonth === endMonth) {
          return \`\${startMonth} \${start.getDate()} - \${end.getDate()}, \${startYear}\`;
        } else {
          return \`\${startMonth} \${start.getDate()} - \${endMonth} \${end.getDate()}, \${startYear}\`;
        }
      }
      const start = new Date(weekStart);
      const end = new Date(weekStart);
      end.setDate(weekStart.getDate() + 6);
      
      const startMonth = start.toLocaleString('en-US', { month: 'short' });
      const endMonth = end.toLocaleString('en-US', { month: 'short' });
      const startYear = start.getFullYear();
      
      if (startMonth === endMonth) {
        return \`\${startMonth} \${start.getDate()} - \${end.getDate()}, \${startYear}\`;
      } else {
        return \`\${startMonth} \${start.getDate()} - \${endMonth} \${end.getDate()}, \${startYear}\`;
      }
    };

    // Generate next 7 days or full month for the calendar view starting from weekStart
    const getNext7Days = (weekStart: Date) => {
      const days = [];
      const weekdayNames = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
      
      let numDays = 7;
      let start = new Date(weekStart);
      
      if (calendarRange === '4weeks') {
        numDays = 28;
      } else if (calendarRange === 'month') {
        const isBridgeToJanuary = weekStart.getMonth() === 11 && weekStart.getDate() > 20;
        const targetYear = isBridgeToJanuary ? weekStart.getFullYear() + 1 : weekStart.getFullYear();
        const targetMonth = isBridgeToJanuary ? 0 : weekStart.getMonth();
        start = new Date(targetYear, targetMonth, 1);
        numDays = new Date(targetYear, targetMonth + 1, 0).getDate();
      }

      for (let i = 0; i < numDays; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const dateStr_actual = \`\${yyyy}-\${mm}-\${dd}\`;
        
        const dayOfWeekIndex = (d.getDay() + 6) % 7;
        
        days.push({
          dateStr: dateStr_actual,
          dayName: weekdayNames[dayOfWeekIndex],
          dayOfMonth: d.getDate(),
          monthName: d.toLocaleString('en-US', { month: 'short' }),
          fullDate: d
        });
      }
      return days;
    };

    const handlePrevWeek = () => {
      setSelectedTourDate(null);
      setCurrentWeekStart(prev => {
        const d = new Date(prev);
        if (calendarRange === '4weeks') {
          d.setDate(prev.getDate() - 28);
        } else if (calendarRange === 'month') {
          d.setMonth(prev.getMonth() - 1);
        } else {
          d.setDate(prev.getDate() - 7);
        }
        return d;
      });
    };

    const handleNextWeek = () => {
      setSelectedTourDate(null);
      setCurrentWeekStart(prev => {
        const d = new Date(prev);
        if (calendarRange === '4weeks') {
          d.setDate(prev.getDate() + 28);
        } else if (calendarRange === 'month') {
          d.setMonth(prev.getMonth() + 1);
        } else {
          d.setDate(prev.getDate() + 7);
        }
        return d;
      });
    };

    const handleGoToToday = () => {
      setSelectedTourDate(null);
      setCalendarRange('week');
      const today = new Date();
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1);
      setCurrentWeekStart(new Date(today.setDate(diff)));
    };

    const handleGoToMonth = () => {
      setSelectedTourDate(null);
      setCalendarRange('month');
      setCurrentWeekStart(new Date(2023, 0, 23));
    };`;

if (content.includes(scheduleHeaderOld)) {
  console.log("Replacing getNext7Days with the range-aware/month-aware calendar header definitions...");
  content = content.replace(scheduleHeaderOld, scheduleHeaderNew);
} else {
  console.log("Warning: scheduleHeaderOld block not found! Trying fallback...");
  const searchIdx = content.indexOf("const getNext7Days = () =>");
  if (searchIdx !== -1) {
    const endIdx = content.indexOf("return days;\n    };", searchIdx) + 21;
    content = content.substring(0, searchIdx) + scheduleHeaderNew + content.substring(endIdx);
    console.log("Successfully replaced getNext7Days with fallback search.");
  }
}

// 11. Update call next7Days to range-aware
content = content.replace("const next7Days = getNext7Days();", "const next7Days = getNext7Days(currentWeekStart);");

// 12. Add calendar header controls to Crews Schedule (lines 5625-5627 in post-replay)
const controlsOld = `        <div style={{ display: isSectionOpen('crewschedule') ? undefined : 'none' }}>
          <div className="p-6">`;

const controlsNew = `        <div style={{ display: isSectionOpen('crewschedule') ? undefined : 'none' }}>
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

if (content.includes(controlsOld)) {
  console.log("Adding calendar controls to Crews Schedule display block...");
  content = content.replace(controlsOld, controlsNew);
} else {
  // Let's do a dynamic replace based on isSectionOpen('crewschedule')
  const startIdx = content.indexOf("isSectionOpen('crewschedule')");
  if (startIdx !== -1) {
    const p6Idx = content.indexOf('<div className="p-6">', startIdx);
    if (p6Idx !== -1 && p6Idx < startIdx + 200) {
      console.log("Found Crews Schedule starting point. Replacing dynamically...");
      content = content.substring(0, p6Idx) + controlsNew.substring(controlsNew.indexOf('<div className="wiw-scheduler-container">'));
    }
  }
}

fs.writeFileSync(filePath, content, "utf8");
console.log("Successfully completed cleanup and repair script execution.");
