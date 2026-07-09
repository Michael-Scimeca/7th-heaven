const fs = require("fs");

const filePath = "/Users/michaelscimeca/Desktop/7thHeaven/src/app/admin/page.tsx";
let content = fs.readFileSync(filePath, "utf8");

// 1. renderBookings end correction
const bookingsOld = `                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </section>`;

const bookingsNew = `                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </section>`;

if (content.includes(bookingsOld)) {
  console.log("Replacing bookings end block...");
  content = content.replace(bookingsOld, bookingsNew);
} else {
  console.log("Warning: bookingsOld block not found!");
}

// 2. renderPlanners end correction
const plannersOld = `                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>`;

const plannersNew = `                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>`;

if (content.includes(plannersOld)) {
  console.log("Replacing planners end block...");
  content = content.replace(plannersOld, plannersNew);
} else {
  console.log("Warning: plannersOld block not found!");
}

// 3. renderMemoryMod corrections
const memoryOld = `                        </div>
                      </div>
                    );
                    })}
                  </div>
                )}
              </div>}
            </section>`;

const memoryNew = `                        </div>
                      </div>
                    );
                    }))}
                  </div>
                )}
              </div>
            </section>`;

if (content.includes(memoryOld)) {
  console.log("Replacing memory block...");
  content = content.replace(memoryOld, memoryNew);
} else {
  console.log("Warning: memoryOld block not found!");
}

// 4. Profiles table corrupted block replacement
const profilesOld = `                                  {user.role === 'crew' && (
                                    <button 
                                      onClick={async () => {
                                        const res = await adminResetPassword(user.id, user.email);
                                        if (res.success) {
                                          const accounts = JSON.parse(localStorage.getItem('7h_accounts') || '{}');
                                          accounts[user.email.toLowerCase()] = {
                                            ...accounts[user.email.toLowerCase()],
                                            id: user.id,
                                            name: user.name,
                                            email: user.email.toLowerCase(),
                                            password: res.password,
                                            role: 'crew'
                                          };
                                          localStorage.setItem('7h_accounts', JSON.stringify(accounts));
                                          alert(\`Password reset to: \${res.password}\\n\\nPlease refresh to see changes.\`);
                                          window.location.reload();
                                        }
                                      }}
                                      className="ml-4 px-2 py-1 bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-black border border-amber-500/20 text-[0.55rem] font-bold uppercase tracking-widest rounded transition-all"
                                    >
                                      Reset & Show
                                    </button>
                                  )}
                                </div>
                                {user.role === 'crew' && !acct?.password && (
                                  <p className="text-[0.6rem] text-amber-500/60 font-bold italic">
                                    * Credentials lost (Check browser history or re-create account)
                                  </p>
                                )}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCreateGroupForDate(day.dateStr);
                                    const initialSettings: any = {};
                                    crewMembers.filter(m => m.id !== 'openshifts').forEach(m => {
                                      initialSettings[m.id] = {
                                        active: false,
                                        role: m.role || 'SERVER',
                                        startHour: 17.0,
                                        endHour: 22.0
                                      };
                                    });
                                    setNewGroupMemberSettings(initialSettings);
                                    setNewGroupNameInput('');
                                    setIsCreateGroupModalOpen(true);
                                    setCellGroupPopover(null);
                                  }}
                                  className="w-full text-center px-1.5 py-1.5 mt-1 rounded bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-black text-[9px] font-black uppercase tracking-wider transition-all border border-emerald-500/30 hover:border-emerald-400 cursor-pointer"
                                >
                                  ➕ Create Group
                                </button>
                              </div>`;

const profilesNew = `                                  {user.role === 'crew' && (
                                    <button 
                                      onClick={async () => {
                                        const res = await adminResetPassword(user.id, user.email);
                                        if (res.success) {
                                          const accounts = JSON.parse(localStorage.getItem('7h_accounts') || '{}');
                                          accounts[user.email.toLowerCase()] = {
                                            ...accounts[user.email.toLowerCase()],
                                            id: user.id,
                                            name: user.name,
                                            email: user.email.toLowerCase(),
                                            password: res.password,
                                            role: 'crew'
                                          };
                                          localStorage.setItem('7h_accounts', JSON.stringify(accounts));
                                          alert(\`Password reset to: \${res.password}\\n\\nPlease refresh to see changes.\`);
                                          window.location.reload();
                                        }
                                      }}
                                      className="ml-4 px-2 py-1 bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-black border border-amber-500/20 text-[0.55rem] font-bold uppercase tracking-widest rounded transition-all"
                                    >
                                      Reset & Show
                                    </button>
                                  )}
                                </div>
                                {user.role === 'crew' && !acct?.password && (
                                  <p className="text-[0.6rem] text-amber-500/60 font-bold italic">
                                    * Credentials lost (Check browser history or re-create account)
                                  </p>
                                )}
                              </div>`;

if (content.includes(profilesOld)) {
  console.log("Replacing profiles table corrupted block...");
  content = content.replace(profilesOld, profilesNew);
} else {
  // Let's do a more robust match because of slight spacing difference
  const index = content.indexOf("Reset & Show");
  if (index !== -1) {
    console.log("Profiles: reset button found, doing substring search/replace");
    // Look for the next "➕ Create Group" block
    const groupIdx = content.indexOf("➕ Create Group", index);
    if (groupIdx !== -1) {
      const startOfBlock = content.lastIndexOf("<button", groupIdx);
      const endOfBlock = content.indexOf("</button>", groupIdx) + 9;
      if (startOfBlock !== -1) {
        console.log("Found Create Group button inside profiles list. Removing it.");
        content = content.substring(0, startOfBlock) + content.substring(endOfBlock);
      }
    }
  } else {
    console.log("Warning: Profiles table block not matched!");
  }
}

// 5. Featured Tracktiming select fix
const featuredTrackOld = `                 {trackDurationType === 'temporary' && (
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

const featuredTrackNew = `                 {trackDurationType === 'temporary' && (
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

if (content.includes(featuredTrackOld)) {
  console.log("Replacing featured track block...");
  content = content.replace(featuredTrackOld, featuredTrackNew);
} else {
  // Try dynamic replace
  const startIdx = content.indexOf("trackDurationType === 'temporary'");
  if (startIdx !== -1) {
    const endIdx = content.indexOf("trackUploadError", startIdx);
    if (endIdx !== -1) {
      const lastBrace = content.lastIndexOf("}", endIdx);
      console.log("Found temporary track duration block. Replacing dynamically.");
      const before = content.substring(0, startIdx);
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
                 )\n              ` + after;
    }
  } else {
    console.log("Warning: featuredTrackOld not found!");
  }
}

// 6. Remove stray </>[newline])} at lines 6420-6421
const strayOld = `                          })()}
                        </div>
                      </>
                    )}`;

const strayNew = `                          })()}
                        </div>`;

if (content.includes(strayOld)) {
  console.log("Replacing stray </> and )} at role suggest...");
  content = content.replace(strayOld, strayNew);
} else {
  console.log("Warning: strayOld not found!");
}

// 7. Fix unclosed/stray tags at scheduler edit shift drawer (lines 6533-6540)
const drawerOld = `                      )}
                    </div>
                  </div>

                </div>
              </div>
              );
            )}`;

const drawerNew = `                      )}
                    </div>
                  </div>
                )}`

if (content.includes(drawerOld)) {
  console.log("Replacing drawerOld...");
  content = content.replace(drawerOld, drawerNew);
} else {
  // Let's do a more robust substring check
  const deleteShiftIdx = content.indexOf("Delete Shift");
  if (deleteShiftIdx !== -1) {
    const endOfModal = content.indexOf("const renderAwardPicks", deleteShiftIdx);
    if (endOfModal !== -1) {
      console.log("Found modal end boundary, replacing drawer block.");
      const before = content.substring(0, deleteShiftIdx);
      const after = content.substring(endOfModal);
      // Let's find the closing blocks we need
      content = before + `Delete Shift
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        );
      };
      
      ` + after;
    }
  } else {
    console.log("Warning: drawerOld not found!");
  }
}

// 8. Restore </CustomScrollbar> at line 6644
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
  console.log("Replacing scrollbarOld...");
  content = content.replace(scrollbarOld, scrollbarNew);
} else {
  console.log("Warning: scrollbarOld not found!");
}

// 9. Patch getNext7Days and define handlePrevWeek, handleNextWeek, handleGoToToday, handleGoToMonth
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

const scheduleHeaderNew = `    // Generate next 7 days or full month for the calendar view starting from weekStart
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
        const dateStr = \`\${yyyy}-\\mm-\\dd\`; // Fix later or let it format correctly
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
  console.log("Replacing getNext7Days header block...");
  content = content.replace(scheduleHeaderOld, scheduleHeaderNew);
} else {
  // Let's do a regex or substring search
  const idx = content.indexOf("const getNext7Days = () =>");
  if (idx !== -1) {
    console.log("Found getNext7Days with simple search, replacing...");
    const endIdx = content.indexOf("return days;\n    };", idx) + 21;
    const before = content.substring(0, idx);
    const after = content.substring(endIdx);
    content = before + scheduleHeaderNew + after;
  } else {
    console.log("Warning: scheduleHeaderOld not found!");
  }
}

// 10. Update const next7Days = getNext7Days(); to getNext7Days(currentWeekStart);
content = content.replace("const next7Days = getNext7Days();", "const next7Days = getNext7Days(currentWeekStart);");

// 11. Add calendar navigation controls header before p-6 in Crews Schedule
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
  console.log("Replacing Crews Schedule inner display controls block...");
  content = content.replace(controlsOld, controlsNew);
} else {
  console.log("Warning: controlsOld block not found!");
}

// 12. Close wiw-scheduler-container div before display: crewschedule ends
const crewscheduleEndOld = `              </div>
            </div>
          </section>
        );
      };`;

const crewscheduleEndNew = `              </div>
            </div>
          </div>
        </section>
      );
    };`;

if (content.includes(crewscheduleEndOld)) {
  console.log("Closing wiw-scheduler-container block...");
  content = content.replace(crewscheduleEndOld, crewscheduleEndNew);
} else {
  console.log("Warning: crewscheduleEndOld block not found!");
}

fs.writeFileSync(filePath, content, "utf8");
console.log("DONE patching file!");
