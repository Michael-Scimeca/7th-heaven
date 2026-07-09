const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../src/components/CrewDashboard.tsx");
let content = fs.readFileSync(filePath, "utf8");

// 1. MEMBER_SEEDS abbie entry
const seedsTarget = `  tony:    { id: 'tony',    name: 'Tony M',           email: 'tony@7thheaven.com',    avatar: 'TM' },`;
const seedsReplacement = `  tony:    { id: 'tony',    name: 'Tony M',           email: 'tony@7thheaven.com',    avatar: 'TM' },
  abbie:   { id: 'abbie',   name: 'Abbie Janssen',   email: 'abbie@7thheaven.com',   avatar: 'AJ' },`;

content = content.replace(seedsTarget, seedsReplacement);

// 2. Work Schedule State & Response Handlers
const stateTarget = `  const [email, setEmail] = useState('');`;
const stateReplacement = `  const [email, setEmail] = useState('');

  // --- Work Schedule State ---
  const [crewSchedules, setCrewSchedules] = useState<{ id: string; crewId: string; crewName: string; date: string; time: string; role: string; location: string; notes: string; isDraft?: boolean; approvalStatus?: 'pending' | 'approved' | 'declined'; declineReason?: string }[]>([]);
  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
  const [decliningShiftId, setDecliningShiftId] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState('');

  const handleShiftResponse = async (shiftId: string, status: 'approved' | 'declined', reason?: string) => {
    try {
      const updated = crewSchedules.map(s => {
        if (s.id === shiftId) {
          return {
            ...s,
            approvalStatus: status,
            declineReason: status === 'approved' ? undefined : (reason || s.declineReason)
          };
        }
        return s;
      });
      setCrewSchedules(updated);
      localStorage.setItem('7h_crew_schedules', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));

      const res = await fetch('/api/crew/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      
      if (!res.ok) {
        throw new Error('Failed to sync response.');
      }
      
      alert(status === 'approved' 
        ? '✓ Shift approved! It has been added to your schedule.'
        : '✗ Shift declined.'
      );
    } catch (e) {
      console.error(e);
      alert('Error updating shift: ' + e);
    }
  };

  useEffect(() => {
    const loadSchedules = async () => {
      try {
        const saved = localStorage.getItem('7h_crew_schedules');
        if (saved) {
          setCrewSchedules(JSON.parse(saved));
        }
        
        const res = await fetch('/api/crew/calendar');
        if (res.ok) {
          const apiSchedules = await res.json();
          if (apiSchedules && Array.isArray(apiSchedules)) {
            setCrewSchedules(apiSchedules);
            localStorage.setItem('7h_crew_schedules', JSON.stringify(apiSchedules));
          }
        }
      } catch (err) {
        console.warn('Failed to load crew schedules:', err);
      }
    };
    loadSchedules();
    window.addEventListener('storage', () => {
      try {
        const saved = localStorage.getItem('7h_crew_schedules');
        if (saved) {
          setCrewSchedules(JSON.parse(saved));
        }
      } catch {}
    });
  }, []);`;

content = content.replace(stateTarget, stateReplacement);

// 3. Avatar dynamic initials
const avatarTarget = `          <div className="w-12 h-12 rounded-full bg-purple-900 flex items-center justify-center text-xl font-bold border border-purple-500 relative">
            MS
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-black" />
          </div>`;
const avatarReplacement = `          <div className="w-12 h-12 rounded-full bg-purple-900 flex items-center justify-center text-xl font-bold border border-purple-500 relative">
            {displayName ? displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'MS'}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-black" />
          </div>`;

content = content.replace(avatarTarget, avatarReplacement);

// 4. Work Schedule Card (vertical list with inline action buttons for pending and declined shifts)
const commentTarget = `        {/* ─── LIVE STREAM PERFORMANCE & ANALYTICS CARD ─── */}`;

const commentReplacement = '          {/* ─── YOUR WORK SCHEDULE CARD ─── */}\n' +
'          {(() => {\n' +
'            const myShifts = crewSchedules.filter(s => s.crewId === slug);\n' +
'            const pendingShifts = myShifts.filter(s => s.approvalStatus === \'pending\');\n' +
'            const activeShifts = myShifts;\n' +
'\n' +
'            return (\n' +
'              <div className="bg-[#111116] border border-white/10 rounded-2xl overflow-hidden shadow-2xl mt-6">\n' +
'                 <div className="p-4 border-b border-white/[0.05] flex items-center justify-between bg-[#181820]">\n' +
'                    <div className="flex items-center gap-3">\n' +
'                       <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-xl">📅</div>\n' +
'                       <div>\n' +
'                          <h3 className="text-sm font-black italic tracking-wide text-white">Your Work Schedule</h3>\n' +
'                          <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Assigned shifts, locations & responsibilities</p>\n' +
'                       </div>\n' +
'                    </div>\n' +
'                    <div className="flex items-center gap-2">\n' +
'                      {pendingShifts.length > 0 && (\n' +
'                        <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded-full text-xs font-black uppercase tracking-widest animate-pulse">\n' +
'                          {pendingShifts.length} Pending\n' +
'                        </span>\n' +
'                      )}\n' +
'                      <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full text-xs font-black uppercase tracking-widest">\n' +
'                        {activeShifts.length} Shifts\n' +
'                      </span>\n' +
'                    </div>\n' +
'                 </div>\n' +
'                 <div className="p-6">\n' +
'                   {/* Calendar Feed Subscription Utility */}\n' +
'                   <div className="mb-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-between gap-4 flex-col sm:flex-row">\n' +
'                     <div className="flex items-start gap-3">\n' +
'                       <span className="text-lg mt-0.5">🗓️</span>\n' +
'                       <div>\n' +
'                         <p className="text-xs font-bold text-purple-300">Sync with Google & Apple Calendar</p>\n' +
'                         <p className="text-[10px] text-white/50 mt-0.5">Subscribe to your personal live shift calendar feed to view updates on your phone.</p>\n' +
'                       </div>\n' +
'                     </div>\n' +
'                     <button\n' +
'                       onClick={() => {\n' +
'                         const icsUrl = `${window.location.origin}/api/crew/calendar.ics?crewId=${slug}`;\n' +
'                         navigator.clipboard.writeText(icsUrl);\n' +
'                         alert("📅 Calendar subscription link copied to clipboard!\\n\\nPaste this URL into Google Calendar (Add by URL) or Apple Calendar (Calendar Subscription) to sync your shifts.");\n' +
'                       }}\n' +
'                       className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-black text-xs font-black uppercase tracking-wider rounded-lg transition-colors cursor-pointer border-none flex items-center gap-1.5 shrink-0"\n' +
'                     >\n' +
'                       <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>\n' +
'                       Copy Feed URL\n' +
'                     </button>\n' +
'                   </div>\n' +
'\n' +
'                   {activeShifts.length === 0 ? (\n' +
'                     <div className="text-center py-8 border border-dashed border-white/5 rounded-xl bg-white/[0.01]">\n' +
'                        <p className="text-white/30 text-xs italic">You have no upcoming work shifts scheduled.</p>\n' +
'                     </div>\n' +
'                   ) : (\n' +
'                     <div className="flex flex-col gap-3">\n' +
'                       {activeShifts.map((shift) => {\n' +
'                         const dateObj = new Date(shift.date + \'T00:00:00\');\n' +
'                         const month = isNaN(dateObj.getTime()) ? \'JAN\' : dateObj.toLocaleDateString(\'en-US\', { month: \'short\' }).toUpperCase();\n' +
'                         const dayNum = isNaN(dateObj.getTime()) ? \'00\' : dateObj.getDate();\n' +
'                         const weekday = isNaN(dateObj.getTime()) ? \'Day\' : dateObj.toLocaleDateString(\'en-US\', { weekday: \'short\' });\n' +
'\n' +
'                         return (\n' +
'                           <div \n' +
'                             key={shift.id} \n' +
'                             className="p-4 bg-black/40 border border-white/10 rounded-xl hover:border-white/20 hover:bg-white/[0.01] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"\n' +
'                           >\n' +
'                             {/* Date & Time Column */}\n' +
'                             <div className="flex items-center gap-3 shrink-0 min-w-[180px]">\n' +
'                               <div className="w-11 h-11 rounded-lg bg-amber-500/10 border border-amber-500/20 flex flex-col items-center justify-center text-center shrink-0">\n' +
'                                 <span className="text-[8px] text-amber-400 font-black uppercase tracking-wider">{month}</span>\n' +
'                                 <span className="text-base font-black text-white leading-none mt-0.5">{dayNum}</span>\n' +
'                               </div>\n' +
'                               <div className="flex flex-col">\n' +
'                                 <span className="text-xs font-bold text-white/30 uppercase tracking-widest">{weekday}</span>\n' +
'                                 <span className="text-xs font-black text-amber-400 mt-0.5">{shift.time}</span>\n' +
'                               </div>\n' +
'                             </div>\n' +
'\n' +
'                             {/* Role & Location Column */}\n' +
'                             <div className="flex-1 min-w-[200px]">\n' +
'                               <div className="flex items-center gap-2 flex-wrap">\n' +
'                                 <span className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[9px] font-black uppercase tracking-wider rounded">\n' +
'                                   {shift.role}\n' +
'                                 </span>\n' +
'                                 <span className="text-xs font-black text-white/80">\n' +
'                                   📍 {shift.location}\n' +
'                                 </span>\n' +
'                               </div>\n' +
'                             </div>\n' +
'\n' +
'                             {/* Status Badge & Action Column */}\n' +
'                             <div className="shrink-0 min-w-[140px] text-left md:text-right flex items-center md:justify-end">\n' +
'                               {shift.approvalStatus === \'approved\' || !shift.approvalStatus ? (\n' +
'                                 <span className="px-2 py-0.5 rounded border text-[9px] font-black uppercase tracking-wider shrink-0 bg-emerald-500/10 border-emerald-500/30 text-emerald-400">\n' +
'                                   ✓ Approved\n' +
'                                 </span>\n' +
'                               ) : shift.approvalStatus === \'declined\' ? (\n' +
'                                 <div className="flex items-center gap-2">\n' +
'                                   <span className="px-2 py-0.5 rounded border text-[9px] font-black uppercase tracking-wider shrink-0 bg-rose-500/10 border-rose-500/30 text-rose-400">\n' +
'                                     ✗ Declined\n' +
'                                   </span>\n' +
'                                   <button\n' +
'                                     type="button"\n' +
'                                     onClick={() => handleShiftResponse(shift.id, \'approved\')}\n' +
'                                     className="px-2 py-0.5 bg-emerald-500 hover:bg-emerald-400 text-black text-[9px] font-black uppercase tracking-wider rounded transition-colors cursor-pointer border-none"\n' +
'                                   >\n' +
'                                     Approve\n' +
'                                   </button>\n' +
'                                 </div>\n' +
'                               ) : (\n' +
'                                 <div className="flex items-center gap-1.5">\n' +
'                                   <button\n' +
'                                     type="button"\n' +
'                                     onClick={() => handleShiftResponse(shift.id, \'approved\')}\n' +
'                                     className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-black text-[9px] font-black uppercase tracking-wider rounded transition-colors cursor-pointer border-none"\n' +
'                                   >\n' +
'                                     Approve\n' +
'                                   </button>\n' +
'                                   <button\n' +
'                                     type="button"\n' +
'                                     onClick={() => {\n' +
'                                       setDecliningShiftId(shift.id);\n' +
'                                       setIsDeclineModalOpen(true);\n' +
'                                     }}\n' +
'                                     className="px-2.5 py-1 bg-rose-600/20 hover:bg-rose-600 border border-rose-500/30 text-rose-200 hover:text-white text-[9px] font-black uppercase tracking-wider rounded transition-all cursor-pointer"\n' +
'                                   >\n' +
'                                     Decline\n' +
'                                   </button>\n' +
'                                 </div>\n' +
'                               )}\n' +
'                             </div>\n' +
'\n' +
'                             {/* Instructions/Notes Column */}\n' +
'                             {shift.notes || shift.declineReason ? (\n' +
'                               <div className="flex-1 md:max-w-[40%] bg-white/[0.02] border border-white/[0.04] p-3 rounded-lg space-y-1">\n' +
'                                 {shift.notes && (\n' +
'                                   <>\n' +
'                                     <p className="text-[9px] text-white/40 font-bold uppercase tracking-wider">Instructions:</p>\n' +
'                                     <p className="text-xs text-white/60 leading-relaxed mt-0.5 italic">“{shift.notes}”</p>\n' +
'                                   </>\n' +
'                                 )}\n' +
'                                 {shift.declineReason && (\n' +
'                                   <>\n' +
'                                     <p className="text-[9px] text-rose-400/60 font-bold uppercase tracking-wider">Decline Reason:</p>\n' +
'                                     <p className="text-xs text-rose-300/80 leading-relaxed mt-0.5 italic">“{shift.declineReason}”</p>\n' +
'                                   </>\n' +
'                                 )}\n' +
'                               </div>\n' +
'                             ) : (\n' +
'                               <div className="hidden md:block flex-1 md:max-w-[40%] text-right">\n' +
'                                 <span className="text-[10px] text-white/20 italic">No special instructions</span>\n' +
'                               </div>\n' +
'                             )}\n' +
'                           </div>\n' +
'                         );\n' +
'                       })}\n' +
'                     </div>\n' +
'                   )}\n' +
'                 </div>\n' +
'              </div>\n' +
'            );\n' +
'          })()}\n' +
'\n' +
'        {/* ─── LIVE STREAM PERFORMANCE & ANALYTICS CARD ─── */}';

content = content.replace(commentTarget, commentReplacement);

// 5. Append Decline Reason Modal JSX right before style jsx global
const modalTarget = `      <style jsx global>{\`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }`;

const modalReplacement = `      {/* ─── DECLINE REASON MODAL ─── */}
      {isDeclineModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[#181820] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <h3 className="text-sm font-black italic tracking-wide text-white uppercase flex items-center gap-2">
              <span className="text-rose-500">✗</span> Decline Work Shift
            </h3>
            <p className="text-xs text-white/50 leading-relaxed">
              Please provide a reason for declining this shift. This will be saved to your shift history and shared with the planner/administrator to assist with scheduling.
            </p>
            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="e.g., Conflict with another gig, Out of town, Personal reasons..."
              className="w-full min-h-[100px] bg-black/40 border border-white/10 text-white placeholder-white/30 rounded-xl p-3 text-sm focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/30 outline-none transition-all resize-none"
            />
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsDeclineModalOpen(false);
                  setDecliningShiftId(null);
                  setDeclineReason('');
                }}
                className="px-4 py-2 border border-white/10 hover:bg-white/5 text-white/70 hover:text-white rounded-lg text-xs font-black uppercase tracking-wider transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!declineReason.trim()}
                onClick={() => {
                  if (decliningShiftId) {
                    handleShiftResponse(decliningShiftId, 'declined', declineReason);
                  }
                  setIsDeclineModalOpen(false);
                  setDecliningShiftId(null);
                  setDeclineReason('');
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:bg-rose-600/30 disabled:text-white/30 text-white rounded-lg text-xs font-black uppercase tracking-wider transition-all border-none cursor-pointer disabled:cursor-not-allowed"
              >
                Submit Decline
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{\`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }`;

content = content.replace(modalTarget, modalReplacement);

fs.writeFileSync(filePath, content, "utf8");
console.log("SUCCESS: Fully restored all custom changes to CrewDashboard.tsx cleanly with Decline Reason Modal & Re-Approve Option!");
