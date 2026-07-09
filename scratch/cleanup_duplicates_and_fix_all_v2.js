const fs = require("fs");

const filePath = "/Users/michaelscimeca/Desktop/7thHeaven/src/app/admin/page.tsx";
let content = fs.readFileSync(filePath, "utf8");

console.log("Original content size:", content.length);

// 1. Remove duplicate state definitions (lines 403-411)
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
  console.log("Removing duplicate Featured Track state variables...");
  content = content.replace(duplicateStateOld, "");
} else {
  console.log("Warning: duplicateStateOld not found!");
}

// 2. Remove duplicate close/upload track handlers (second definitions)
const closeTrackKeyword = "const handleCloseTrack = async () =>";
const firstCloseTrackIdx = content.indexOf(closeTrackKeyword);
const secondCloseTrackIdx = content.indexOf(closeTrackKeyword, firstCloseTrackIdx + 1);

if (secondCloseTrackIdx !== -1) {
  console.log("Removing duplicate handler definitions...");
  const bannerSaveIdx = content.indexOf("const [bannerSaveStatus,", secondCloseTrackIdx);
  if (bannerSaveIdx !== -1) {
    content = content.substring(0, secondCloseTrackIdx) + content.substring(bannerSaveIdx);
  }
} else {
  console.log("Warning: duplicate handlers not found!");
}

// 3. Fix unclosed div in loadAdminData schedules try-catch (missing closing brace on line 1611)
const schedulerSyncOld = `          if (currentSchedules.length === 0) {
            const saved = localStorage.getItem('7h_crew_schedules');
            if (saved) {
              currentSchedules = JSON.parse(saved);
            } else {
            // Default Mock Example Data
            currentSchedules = [
              { id: 'mock_1', crewId: 'arjun', crewName: 'Arjun Patel', date: '2023-01-23', startHour: 17.0, endHour: 22.0, time: '5:00 PM - 10:00 PM', role: 'SERVER', location: 'The Chicago Theatre', notes: 'Lead server for VIP tables' },
              { id: 'mock_2', crewId: 'abbie', crewName: 'Abbie Janssen', date: '2023-01-24', startHour: 17.0, endHour: 22.0, time: '5:00 PM - 10:00 PM', role: 'SERVER', location: 'The Chicago Theatre', notes: '' },
              { id: 'mock_3', crewId: 'al', crewName: 'Al Hollie', date: '2023-01-25', startHour: 18.0, endHour: 23.5, time: '6:00 PM - 11:30 PM', role: 'SERVER', location: 'The Chicago Theatre', notes: '' },
              { id: 'mock_4', crewId: 'andrea', crewName: 'Andrea Kinzinger', date: '2023-01-26', startHour: 16.0, endHour: 22.0, time: '4:00 PM - 10:00 PM', role: 'CHEF', location: 'The Chicago Theatre', notes: 'Kitchen lead' },
              { id: 'mock_5', crewId: 'openshifts', crewName: 'OpenShifts', date: '2023-01-26', startHour: 18.0, endHour: 23.0, time: '6:00 PM - 11:00 PM', role: 'SERVER', location: 'The Chicago Theatre', notes: 'Need 1 backup server', openSlots: 1 },
              { id: 'mock_6', crewId: 'chris', crewName: 'Chris Loxely', date: '2023-01-27', startHour: 18.0, endHour: 23.5, time: '6:00 PM - 11:30 PM', role: 'SERVER', location: 'The Chicago Theatre', notes: '' },
              { id: 'mock_7', crewId: 'dave_croke', crewName: 'Dave Croke', date: '2023-01-27', startHour: 17.0, endHour: 23.0, time: '5:00 PM - 11:00 PM', role: 'LINE COOK', location: 'The Chicago Theatre', notes: '' },
              { id: 'mock_8', crewId: 'abbie', crewName: 'Abbie Janssen', date: '2023-01-27', startHour: 18.0, endHour: 23.0, time: '6:00 PM - 11:00 PM', role: 'SERVER', location: 'The Chicago Theatre', notes: '' },
              { id: 'mock_9', crewId: 'daniel', crewName: 'Daniel Kim', date: '2023-01-28', startHour: 17.0, endHour: 24.0, time: '5:00 PM - 12:00 AM', role: 'MANAGER', location: 'The Chicago Theatre', notes: 'Closing manager' },
              { id: 'mock_10', crewId: 'openshifts', crewName: 'OpenShifts', date: '2023-01-29', startHour: 12.0, endHour: 17.0, time: '12:00 PM - 5:00 PM', role: 'SERVER', location: 'The Chicago Theatre', notes: 'Matinee show setup', openSlots: 2 }
            ];
          }
          syncTourDatesToCalendar(freshTourDates, currentSchedules);
        }`;

const schedulerSyncNew = `          if (currentSchedules.length === 0) {
            const saved = localStorage.getItem('7h_crew_schedules');
            if (saved) {
              currentSchedules = JSON.parse(saved);
            } else {
              // Default Mock Example Data
              currentSchedules = [
                { id: 'mock_1', crewId: 'arjun', crewName: 'Arjun Patel', date: '2023-01-23', startHour: 17.0, endHour: 22.0, time: '5:00 PM - 10:00 PM', role: 'SERVER', location: 'The Chicago Theatre', notes: 'Lead server for VIP tables' },
                { id: 'mock_2', crewId: 'abbie', crewName: 'Abbie Janssen', date: '2023-01-24', startHour: 17.0, endHour: 22.0, time: '5:00 PM - 10:00 PM', role: 'SERVER', location: 'The Chicago Theatre', notes: '' },
                { id: 'mock_3', crewId: 'al', crewName: 'Al Hollie', date: '2023-01-25', startHour: 18.0, endHour: 23.5, time: '6:00 PM - 11:30 PM', role: 'SERVER', location: 'The Chicago Theatre', notes: '' },
                { id: 'mock_4', crewId: 'andrea', crewName: 'Andrea Kinzinger', date: '2023-01-26', startHour: 16.0, endHour: 22.0, time: '4:00 PM - 10:00 PM', role: 'CHEF', location: 'The Chicago Theatre', notes: 'Kitchen lead' },
                { id: 'mock_5', crewId: 'openshifts', crewName: 'OpenShifts', date: '2023-01-26', startHour: 18.0, endHour: 23.0, time: '6:00 PM - 11:00 PM', role: 'SERVER', location: 'The Chicago Theatre', notes: 'Need 1 backup server', openSlots: 1 },
                { id: 'mock_6', crewId: 'chris', crewName: 'Chris Loxely', date: '2023-01-27', startHour: 18.0, endHour: 23.5, time: '6:00 PM - 11:30 PM', role: 'SERVER', location: 'The Chicago Theatre', notes: '' },
                { id: 'mock_7', crewId: 'dave_croke', crewName: 'Dave Croke', date: '2023-01-27', startHour: 17.0, endHour: 23.0, time: '5:00 PM - 11:00 PM', role: 'LINE COOK', location: 'The Chicago Theatre', notes: '' },
                { id: 'mock_8', crewId: 'abbie', crewName: 'Abbie Janssen', date: '2023-01-27', startHour: 18.0, endHour: 23.0, time: '6:00 PM - 11:00 PM', role: 'SERVER', location: 'The Chicago Theatre', notes: '' },
                { id: 'mock_9', crewId: 'daniel', crewName: 'Daniel Kim', date: '2023-01-28', startHour: 17.0, endHour: 24.0, time: '5:00 PM - 12:00 AM', role: 'MANAGER', location: 'The Chicago Theatre', notes: 'Closing manager' },
                { id: 'mock_10', crewId: 'openshifts', crewName: 'OpenShifts', date: '2023-01-29', startHour: 12.0, endHour: 17.0, time: '12:00 PM - 5:00 PM', role: 'SERVER', location: 'The Chicago Theatre', notes: 'Matinee show setup', openSlots: 2 }
              ];
            }
          }
          syncTourDatesToCalendar(freshTourDates, currentSchedules);
        }`;

if (content.includes(schedulerSyncOld)) {
  console.log("Fixing loadAdminData schedules unclosed block...");
  content = content.replace(schedulerSyncOld, schedulerSyncNew);
} else {
  console.log("Warning: schedulerSyncOld not found!");
}

// 4. Fix renderShopify ends (replace </Collapsible> with nothing/divs)
const shopifyEndOld = `              ) : null}
              </Collapsible>
            </section>
  );

  const renderTourSync = () => (`;

const shopifyEndNew = `              ) : null}
            </section>
  );

  const renderTourSync = () => (`;

if (content.includes(shopifyEndOld)) {
  console.log("Fixing renderShopify end tags...");
  content = content.replace(shopifyEndOld, shopifyEndNew);
} else {
  console.log("Warning: shopifyEndOld block not found!");
}

// 5. Fix renderBookings ends
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
  console.log("Fixing renderBookings end tags...");
  content = content.replace(bookingsOld, bookingsNew);
} else {
  console.log("Warning: bookingsOld block not found!");
}

// 6. Fix renderPlanners ends
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
  console.log("Fixing renderPlanners end tags...");
  content = content.replace(plannersOld, plannersNew);
} else {
  console.log("Warning: plannersOld block not found!");
}

// 7. Fix renderPhotoMod ends
const photoModOld = `                    ))}
                  </div>
                )}
              </div>
              </Collapsible>
            </section>
  );

  const renderMemoryMod = () => (`;

const photoModNew = `                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
  );

  const renderMemoryMod = () => (`;

if (content.includes(photoModOld)) {
  console.log("Fixing renderPhotoMod end tags...");
  content = content.replace(photoModOld, photoModNew);
} else {
  console.log("Warning: photoModOld block not found!");
}

// 8. Fix renderReferral ends
const referralOld = `                <ReferralProgramPanel />
              </Collapsible>
            </section>
  );

  const renderLiveAlerts = () => (`;

const referralNew = `                <ReferralProgramPanel />
              </div>
            </section>
  );

  const renderLiveAlerts = () => (`;

if (content.includes(referralOld)) {
  console.log("Fixing renderReferral end tags...");
  content = content.replace(referralOld, referralNew);
} else {
  console.log("Warning: referralOld block not found!");
}

// 9. Fix renderSmsBlast duplicate/stray </div> at line 4091
const smsBlastOld = `                  </div>
                </div>
              </div>
              </div>
            </section>
  );

  const renderCrewSms = () => (`;

const smsBlastNew = `                  </div>
                </div>
              </div>
            </section>
  );

  const renderCrewSms = () => (`;

if (content.includes(smsBlastOld)) {
  console.log("Fixing renderSmsBlast end tags...");
  content = content.replace(smsBlastOld, smsBlastNew);
} else {
  console.log("Warning: smsBlastOld block not found!");
}

// 10. Fix renderCrewSms duplicate/stray tags at line 4179
const crewSmsOld = `                  </div>
                </div>
              </div>
              </div>
              </>}
            </section>
  );

  const renderNewsletter = () => (`;

const crewSmsNew = `                  </div>
                </div>
              </div>
            </section>
  );

  const renderNewsletter = () => (`;

if (content.includes(crewSmsOld)) {
  console.log("Fixing renderCrewSms end tags...");
  content = content.replace(crewSmsOld, crewSmsNew);
} else {
  console.log("Warning: crewSmsOld block not found!");
}

// 11. Fix Community Registry Profiles Table corrupted Create Group button & unclosed tags
const createGroupKeyword = "➕ Create Group";
const resetBtnIdx = content.indexOf("Reset & Show");
if (resetBtnIdx !== -1) {
  const groupBtnIdx1 = content.indexOf(createGroupKeyword, resetBtnIdx);
  const groupBtnIdx2 = content.indexOf(createGroupKeyword, groupBtnIdx1 + 1);
  if (groupBtnIdx2 !== -1) {
    console.log("Profiles: Found duplicate Create Group buttons in Community Registry cell. Removing them and fixing closing tags...");
    const startOfBtn1 = content.lastIndexOf("<button", groupBtnIdx1);
    const endOfBtn2 = content.indexOf("</button>", groupBtnIdx2) + 9;
    
    const before = content.substring(0, startOfBtn1);
    const after = content.substring(endOfBtn2);
    content = before + `</div>
                                {user.role === 'crew' && !acct?.password && (
                                  <p className="text-[0.6rem] text-amber-500/60 font-bold italic">
                                    * Credentials lost (Check browser history or re-create account)
                                  </p>
                                )}
                              </div>` + after;
  }
} else {
  console.log("Warning: Reset & Show not found!");
}

// 12. Define getWeekRangeLabel, getNext7Days and navigation handlers
const getNext7DaysSearch = "const getNext7Days = () =>";
const getNextIdx = content.indexOf(getNext7DaysSearch);
if (getNextIdx !== -1) {
  console.log("Replacing getNext7Days with the range-aware/month-aware calendar header definitions...");
  const endIdx = content.indexOf("return days;\n    };", getNextIdx) + 21;
  const before = content.substring(0, content.lastIndexOf("//", getNextIdx)); 
  const after = content.substring(endIdx);
  
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
    
  content = before + scheduleHeaderNew + after;
}

// 13. Update getNext7Days call to pass currentWeekStart
content = content.replace("const next7Days = getNext7Days();", "const next7Days = getNext7Days(currentWeekStart);");

// 14. Add calendar navigation controls block into Crews Schedule
const schedulerControlsNew = `            {/* Header controls (Date range, prev/next, today, action icons) */}
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
            </div>`;

const startIdx = content.indexOf("isSectionOpen('crewschedule')");
if (startIdx !== -1) {
  const p6Idx = content.indexOf('<div className="p-6">', startIdx);
  if (p6Idx !== -1 && p6Idx < startIdx + 250) {
    console.log("Found Crews Schedule starting point. Adding controls container...");
    const rest = content.substring(p6Idx + '<div className="p-6">'.length);
    content = content.substring(0, p6Idx) + 
              `<div className="wiw-scheduler-container">` + 
              schedulerControlsNew + 
              `<div className="p-6">` + 
              rest;
  }
}

// 15. Fix the stray </CustomScrollbar> inside pick tour date select dropdown (line 6453 in tail view)
const pickerScrollbarOld = `                          </select>
                          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-amber-400/50">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9" /></svg>
                          </div>
                        </div>
                      </CustomScrollbar>
                    </div>`;

const pickerScrollbarNew = `                          </select>
                          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-amber-400/50">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9" /></svg>
                          </div>
                        </div>
                    </div>`;

if (content.includes(pickerScrollbarOld)) {
  console.log("Removing stray </CustomScrollbar> inside Pick Tour Date select...");
  content = content.replace(pickerScrollbarOld, pickerScrollbarNew);
} else {
  console.log("Warning: pickerScrollbarOld block not found!");
}

fs.writeFileSync(filePath, content, "utf8");
console.log("Successfully completed cleanup and repair script execution.");
