const fs = require('fs');
const { execSync } = require('child_process');

const filePath = "/Users/michaelscimeca/Desktop/7thHeaven/src/app/admin/page.tsx";

console.log("1. Restoring page.tsx to orig backup...");
fs.copyFileSync(filePath + ".orig", filePath);

console.log("2. Running cleanup_duplicates_and_fix_all_v2.js...");
execSync("node scratch/cleanup_duplicates_and_fix_all_v2.js");

let content = fs.readFileSync(filePath, "utf8");

// Normalize line endings to LF
console.log("3. Normalizing line endings to LF...");
content = content.replace(/\r\n/g, "\n");

console.log("4. Applying precise syntax fixes...");

const fixList = [
  {
    name: "Correction 1 (bookings)",
    old: `                  </table>\n                )}\n              </div>\n            </section>\n  );\n\n  const renderPlanners`,
    new: `                  </table>\n                )}\n              </div>\n            </div>\n          </section>\n  );\n\n  const renderPlanners`
  },
  {
    name: "Correction 2 (planners)",
    old: `                  </div>\n                )}\n              </div>\n            </section>\n  );\n\n  const renderPhotoMod`,
    new: `                  </div>\n                )}\n              </div>\n            </div>\n          </section>\n  );\n\n  const renderPhotoMod`
  },
  {
    name: "Correction 3 (liveAlerts)",
    old: `                  </table>\n                )}\n              </div>\n              </div>\n            </div>\n          </section>\n  );\n\n  const renderSmsBlast`,
    new: `                  </table>\n                )}\n              </div>\n            </div>\n          </section>\n  );\n\n  const renderSmsBlast`
  },
  {
    name: "Correction 4 (roleSuggest)",
    old: `                          })()}\n                        </div>\n                      </>\n                    )}\n\n                    <div>\n                      <div className="flex items-center justify-between">`,
    new: `                          })()}\n                        </div>\n\n                    <div>\n                      <div className="flex items-center justify-between">`
  },
  {
    name: "Correction 5 (venueAutofill)",
    old: `                      <input\n                        type="text"\n                        value={dropLocation}\n                        onChange={e => setDropLocation(e.target.value)}\n                        placeholder="e.g. The Chicago Theatre"\n                        className="w-full px-3 py-2 bg-black border border-white/10 text-xs text-white rounded-lg outline-none focus:border-amber-500/50 transition-colors font-bold"\n                      />\n\n                      {/* Tour Date Picker Dropdown */}`,
    new: `                      <input\n                        type="text"\n                        value={dropLocation}\n                        onChange={e => setDropLocation(e.target.value)}\n                        placeholder="e.g. The Chicago Theatre"\n                        className="w-full px-3 py-2 bg-black border border-white/10 text-xs text-white rounded-lg outline-none focus:border-amber-500/50 transition-colors font-bold"\n                      />\n                    </div>\n\n                      {/* Tour Date Picker Dropdown */}`
  },
  {
    name: "Correction 6 (scrollbarNav)",
    old: `            )}\n          </div>\n\n      </div>`,
    new: `            )}\n          </div>\n        </CustomScrollbar>\n      </div>`
  },
  {
    name: "Correction 7 (gaSection)",
    old: `                  </div>\n                </div>\n              </div>}\n            </section>`,
    new: `                  </div>\n                </div>\n              </div>\n            </section>`
  },
  {
    name: "Correction 8 (timelineLoop)",
    old: `                          {/* Scroll Horizontal Reminder Overlay */}\n                          {maxTotalCols > 2 && (\n                            <div className="absolute bottom-2 inset-x-2 bg-black/95 border border-amber-500/20 text-amber-400 rounded px-2 py-1 text-[8px] font-black tracking-widest uppercase text-center select-none pointer-events-none z-30 shadow-[0_4px_10px_rgba(0,0,0,0.8)] flex items-center justify-center gap-1">\n                              <span>↔ Scroll to view ({dayShifts.length})</span>\n                            </div>\n                          )}\n                        </div>\n                      );\n                    })\n                  </div>`,
    new: `                          {/* Scroll Horizontal Reminder Overlay */}\n                          {maxTotalCols > 2 && (\n                            <div className="absolute bottom-2 inset-x-2 bg-black/95 border border-amber-500/20 text-amber-400 rounded px-2 py-1 text-[8px] font-black tracking-widest uppercase text-center select-none pointer-events-none z-30 shadow-[0_4px_10px_rgba(0,0,0,0.8)] flex items-center justify-center gap-1">\n                              <span>↔ Scroll to view ({dayShifts.length})</span>\n                            </div>\n                          )}\n                        </div>\n                      );\n                    })}\n                  </div>`
  },
  {
    name: "Correction 9 (profiles)",
    old: `                                {user.role === 'crew' && !acct?.password && (\n                                  <p className="text-[0.6rem] text-amber-500/60 font-bold italic">\n                                    * Credentials lost (Check browser history or re-create account)\n                                  </p>\n                                )}\n                              </div>\n                            </td>\n                          </tr>\n                        )}\n                        </React.Fragment>\n                        );\n                      })}\n\n                    </tbody>\n                  </table>\n                )}\n              </div>\n              </div>\n            </section>\n  );\n\n  const renderCrewCreation = () => (`,
    new: `                                {user.role === 'crew' && !acct?.password && (\n                                  <p className="text-[0.6rem] text-amber-500/60 font-bold italic">\n                                    * Credentials lost (Check browser history or re-create account)\n                                  </p>\n                                )}\n                              </div>\n                            </td>\n                          </tr>\n                        )}\n                        </React.Fragment>\n                        );\n                      })}\n\n                    </tbody>\n                  </table>\n                )}\n              </div>\n            </section>\n  );\n\n  const renderCrewCreation = () => (`
  },
  {
    name: "Correction 10 (memoryMod)",
    old: `                        </div>\n                      </div>\n                    );\n                    })}\n                  </div>\n                )}\n              </div>}\n            </section>\n  );\n\n  const renderFeaturedTrack = () => (`,
    new: `                        </div>\n                      </div>\n                    );\n                    }))}\n                  </div>\n                )}\n              </div>\n            </section>\n  );\n\n  const renderFeaturedTrack = () => (`
  },
  {
    name: "Correction 11 (modalEnd)",
    old: `                  </div>\n                </div>\n\n              </div>\n            </div>\n            );\n          })()}\n\n        </div>\n      </div>\n    </section>`,
    new: `                  </div>\n                </div>\n\n              </div>\n            </div>\n            )}\n\n        </div>\n      </div>\n    </section>`
  },
  {
    name: "Correction 12 (schedules useState)",
    old: `        list = parsed.map((item: any) => {
          if (item.startHour === undefined || item.endHour === undefined) {
            const p = parseTimeString(item.time);
            const sh = firstActiveDetails?.customized ? firstActiveDetails.startHour : dropStartHour;
            const eh = firstActiveDetails?.customized ? firstActiveDetails.endHour : dropEndHour;
            const r = firstActiveDetails?.customized ? firstActiveDetails.role : dropRole;

            if (firstActiveCrewId !== 'openshifts') {
              sendScheduleChangeEmail(firstActiveCrewId, 'updated', {
                date: activeDropDay,
                role: r,
                startHour: sh,
                endHour: eh,
                venue: dropLocation
              });
            }

            if (oldItem && oldItem.crewId !== firstActiveCrewId && oldItem.crewId !== 'openshifts') {
              sendScheduleChangeEmail(oldItem.crewId, 'deleted', {
                date: oldItem.date,
                role: oldItem.role,
                startHour: oldItem.startHour,
                endHour: oldItem.endHour,
                venue: oldItem.location
              });
            }

            return {
              ...item,
              startHour: p.startHour,
              endHour: p.endHour
            };
          }
          return item;
        });`,
    new: `        list = parsed.map((item: any) => {
          if (item.startHour === undefined || item.endHour === undefined) {
            const p = parseTimeString(item.time);
            return {
              ...item,
              startHour: p.startHour,
              endHour: p.endHour
            };
          }
          return item;
        });`
  }
];

for (const fix of fixList) {
  if (content.includes(fix.old)) {
    console.log(`  Applied: ${fix.name}`);
    content = content.replace(fix.old, fix.new);
  } else {
    console.log(`  Warning: ${fix.name} target NOT found!`);
  }
}

fs.writeFileSync(filePath, content, "utf8");
console.log("Precise patching complete!");
