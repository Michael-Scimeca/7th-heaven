const fs = require('fs');

const filePath = "/Users/michaelscimeca/Desktop/7thHeaven/src/app/admin/page.tsx";
let content = fs.readFileSync(filePath, "utf8");

// Normalize line endings to LF
content = content.replace(/\r\n/g, "\n");

console.log("1. Relocating getMockShifts, schedules, and currentWeekStart to the top level...");

const targetState = "  const [showSetPassword, setShowSetPassword] = useState(false);";

// --- Extract getMockShifts ---
const getMockShiftsKey = "  const getMockShifts = () => {";
const getMockShiftsStart = content.indexOf(getMockShiftsKey);
const getMockShiftsEnd = content.indexOf("  // Crew Schedule DND Calendar State", getMockShiftsStart);

let getMockShiftsBlock = "";
if (getMockShiftsStart !== -1 && getMockShiftsEnd !== -1) {
  getMockShiftsBlock = content.substring(getMockShiftsStart, getMockShiftsEnd);
  // Delete from original location
  content = content.substring(0, getMockShiftsStart) + "  // getMockShifts relocated\n" + content.substring(getMockShiftsEnd);
  console.log("  Extracted and deleted getMockShifts block.");
} else {
  console.log("  Error: Could not extract getMockShifts block!");
}

// Re-read indices after content deletion
const schedulesKey = "  // Crew Schedule DND Calendar State";
const schedulesStart = content.indexOf(schedulesKey);
const schedulesEnd = content.indexOf("  const [draggedCrewMemberId, setDraggedCrewMemberId] =", schedulesStart);

let schedulesBlock = "";
if (schedulesStart !== -1 && schedulesEnd !== -1) {
  schedulesBlock = content.substring(schedulesStart, schedulesEnd);
  // Delete from original location
  content = content.substring(0, schedulesStart) + "  // schedules relocated\n" + content.substring(schedulesEnd);
  console.log("  Extracted and deleted schedules block.");
} else {
  console.log("  Error: Could not extract schedules block!");
}

// Re-read indices after content deletion
const currentWeekStartKey = "  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {";
const currentWeekStartStart = content.indexOf(currentWeekStartKey);
const currentWeekStartEnd = content.indexOf("  const draggedCrewMemberIdRef =", currentWeekStartStart);

let currentWeekStartBlock = "";
if (currentWeekStartStart !== -1 && currentWeekStartEnd !== -1) {
  currentWeekStartBlock = content.substring(currentWeekStartStart, currentWeekStartEnd);
  // Delete from original location
  content = content.substring(0, currentWeekStartStart) + "  // currentWeekStart relocated\n" + content.substring(currentWeekStartEnd);
  console.log("  Extracted and deleted currentWeekStart block.");
} else {
  console.log("  Error: Could not extract currentWeekStart block!");
}

const injection = `  const [showSetPassword, setShowSetPassword] = useState(false);

  // --- Injected Scheduler States & Helpers ---
  const [calendarRange, setCalendarRange] = useState<'week' | '4weeks' | 'month'>('week');
  const [calendarView, setCalendarView] = useState<'timeline' | 'roster' | 'list'>('timeline');
  const [collapsedCrewIds, setCollapsedCrewIds] = useState<string[]>([]);
  const [scheduleCrewFilter, setScheduleCrewFilter] = useState<string>('All');
  const [showTourDatesOnly, setShowTourDatesOnly] = useState<boolean>(false);
  const [crewGroups, setCrewGroups] = useState<any[]>([]);
  const [drawerCrewSearch, setDrawerCrewSearch] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [isSavingGroup, setIsSavingGroup] = useState(false);
  const [selectedCrewAssignments, setSelectedCrewAssignments] = useState<{ [key: string]: { active: boolean; customized?: boolean; role: string; startHour: number; endHour: number } }>({});
  const [isFilteringRoles, setIsFilteringRoles] = useState(false);

  const staticCrew = [
    { id: 'michael', name: 'Michael Scimeca' },
    { id: 'sammy', name: 'Sammy D' },
    { id: 'ryan', name: 'Ryan K' },
    { id: 'tony', name: 'Tony M' }
  ];

  const getAvatarColor = (name: string) => {
    const colors = ['#f472b6', '#a78bfa', '#60a5fa', '#34d399', '#fbbf24', '#f87171', '#8b5cf6', '#ec4899'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  const getDayShow = (dateStr: string) => {
    return tourDates.find(s => s.date === dateStr) || null;
  };

  const CrewAvatar = ({ member }: { member: any }) => {
    const initials = member.initials || member.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
    const color = member.color || getAvatarColor(member.name);
    const hasImage = member.avatar && (member.avatar.startsWith('http') || member.avatar.startsWith('/'));
    
    if (hasImage) {
      return <img src={member.avatar} alt="" className="w-6 h-6 rounded-full object-cover shrink-0" />;
    }
    return (
      <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-[8px] text-white shrink-0" style={{ backgroundColor: color }}>
        {initials}
      </div>
    );
  };

  const getCrewMemberEmail = (crewId: string): string => {
    const dynamicUser = users.find(u => u.id === crewId);
    if (dynamicUser && dynamicUser.email) return dynamicUser.email;
    
    const fallbackMap: Record<string, string> = {
      abbie: 'abbie@7thheaven.com',
      al: 'al@7thheaven.com',
      andrea: 'andrea@7thheaven.com',
      arjun: 'arjun@7thheaven.com',
      chris: 'chris@7thheaven.com',
      daniel: 'daniel@7thheaven.com',
      dave_croke: 'dave.croke@7thheaven.com',
      dave_maas: 'dave.maas@7thheaven.com',
      david_xu: 'david.xu@7thheaven.com',
      emily: 'emily@7thheaven.com',
      emma: 'emma@7thheaven.com',
      erin: 'erin@7thheaven.com',
      francesca: 'francesca@7thheaven.com'
    };
    return fallbackMap[crewId] || \`\${crewId}@7thheaven.com\`;
  };

  const findCrewName = (crewId: string) => {
    if (crewId === 'openshifts') return 'OpenShifts';
    const mockCrew = [
      { id: 'abbie', name: 'Abbie Janssen' },
      { id: 'al', name: 'Al Hollie' },
      { id: 'andrea', name: 'Andrea Kinzinger' },
      { id: 'arjun', name: 'Arjun Patel' },
      { id: 'chris', name: 'Chris Loxely' },
      { id: 'daniel', name: 'Daniel Kim' },
      { id: 'dave_croke', name: 'Dave Croke' },
      { id: 'dave_maas', name: 'Dave Maas' },
      { id: 'david_xu', name: 'David Xu' },
      { id: 'emily', name: 'Emily Hafften' },
      { id: 'emma', name: 'Emma Smid' },
      { id: 'erin', name: 'Erin Eagan' },
      { id: 'francesca', name: 'Francesca Troast' },
      { id: 'michael', name: 'Michael Scimeca' },
      { id: 'sammy', name: 'Sammy D' },
      { id: 'ryan', name: 'Ryan K' },
      { id: 'tony', name: 'Tony M' }
    ];
    const foundStatic = staticCrew.find(sc => sc.id === crewId);
    if (foundStatic) return foundStatic.name;
    const foundMock = mockCrew.find(c => c.id === crewId);
    if (foundMock) return foundMock.name;
    const foundDynamic = users.find(u => u.id === crewId);
    if (foundDynamic) return foundDynamic.name;
    return crewId;
  };

  const sendScheduleChangeEmail = async (
    crewId: string,
    actionType: 'added' | 'updated' | 'deleted',
    shiftDetails: { date: string; role: string; startHour: number; endHour: number; venue?: string }
  ) => {
    if (crewId === 'openshifts') return;
    
    const emailTo = getCrewMemberEmail(crewId);
    const memberName = findCrewName(crewId);
    const startStr = formatHour(shiftDetails.startHour);
    const endStr = formatHour(shiftDetails.endHour);
    const dateFormatted = new Date(shiftDetails.date + 'T12:00:00').toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    const venueStr = shiftDetails.venue || '7th Heaven Venue';

    let subject = \`📅 Schedule Change Alert: Shift \${actionType.toUpperCase()}\`;
    let actionDescription = '';
    if (actionType === 'added') {
      actionDescription = \`A new shift has been assigned to you:\`;
    } else if (actionType === 'updated') {
      actionDescription = \`Your shift has been updated:\`;
    } else {
      actionDescription = \`Your shift has been removed:\`;
    }

    const htmlContent = \`
      <div style="font-family: sans-serif; background-color: #0c0d12; color: #ffffff; padding: 24px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #1f2937;">
        <h2 style="color: #10b981; margin-top: 0; font-size: 20px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">7th Heaven Work Schedule</h2>
        <p style="font-size: 14px; color: #9ca3af; margin-bottom: 20px;">Hello \${memberName},</p>
        <p style="font-size: 14px; color: #e5e7eb; margin-bottom: 20px;">\${actionDescription}</p>
        
        <div style="background-color: #111827; padding: 16px; border-radius: 8px; border: 1px solid #374151; margin-bottom: 20px;">
          <table style="width: 100%; font-size: 14px;">
            <tr>
              <td style="color: #9ca3af; padding: 4px 0; font-weight: bold; width: 80px;">DATE:</td>
              <td style="color: #ffffff; padding: 4px 0;">\${dateFormatted}</td>
            </tr>
            <tr>
              <td style="color: #9ca3af; padding: 4px 0; font-weight: bold;">VENUE:</td>
              <td style="color: #ffffff; padding: 4px 0;">\${venueStr}</td>
            </tr>
            <tr>
              <td style="color: #9ca3af; padding: 4px 0; font-weight: bold;">ROLE:</td>
              <td style="color: #10b981; padding: 4px 0; font-weight: bold;">\${shiftDetails.role}</td>
            </tr>
            <tr>
              <td style="color: #9ca3af; padding: 4px 0; font-weight: bold;">TIME:</td>
              <td style="color: #ffffff; padding: 4px 0;">\${startStr} - \${endStr}</td>
            </tr>
          </table>
        </div>
        
        <p style="font-size: 12px; color: #6b7280; border-top: 1px solid #1f2937; padding-top: 16px; margin-top: 24px;">
          Please log into your <a href="http://localhost:3000/crew" style="color: #10b981; text-decoration: none; font-weight: bold;">Crew Portal</a> to review and accept your shifts.
        </p>
      </div>
    \`;

    try {
      await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: emailTo,
          subject,
          html: htmlContent
        })
      });
      console.log(\`Successfully sent schedule change email to \${emailTo} (\${actionType})\`);
    } catch (err) {
      console.error('Failed to send schedule email:', err);
    }
  };

  const handleCellClick = (dateStr: string, crewId: string, defaultRole: string) => {
    setDrawerCrewSearch('');
    setNewGroupName('');
    setIsSavingGroup(false);
    setActiveDropDay(dateStr);
    setDraggedCrewMemberId(crewId);
    setDropStartHour(12);
    setDropEndHour(17);
    setDropRole(defaultRole || 'SERVER');
    
    // Auto-fill location from tour date if a show exists on this day
    const dayShow = tourDates.find(s => s.date === dateStr);
    if (dayShow) {
      const venueName = dayShow.venue || dayShow.venue_name || '';
      const cityStr = dayShow.city ? \`\text \${dayShow.city}, \${dayShow.state || 'IL'}\` : '';
      setDropLocation(cityStr ? \`\${venueName} at \${cityStr}\` : venueName);
    } else {
      setDropLocation('');
    }
    
    setDropNotes('');
    setEditingShiftId(null);

    // Initialize selectedCrewAssignments
    const initialAssignments: { [key: string]: any } = {};
    if (crewId && crewId !== 'openshifts') {
      initialAssignments[crewId] = {
        active: true,
        role: defaultRole || 'SERVER',
        startHour: 12,
        endHour: 17
      };
    }
    setSelectedCrewAssignments(initialAssignments);
  };

  const handleEditShiftClick = (shift: any) => {
    setDrawerCrewSearch('');
    setNewGroupName('');
    setIsSavingGroup(false);
    setEditingShiftId(shift.id);
    setDraggedCrewMemberId(shift.crewId);
    setActiveDropDay(shift.date);
    setDropStartHour(shift.startHour);
    setDropEndHour(shift.endHour);
    setDropRole(shift.role);
    setDropLocation(shift.location);
    setDropNotes(shift.notes);

    const initialAssignments: { [key: string]: any } = {};
    if (shift.crewId && shift.crewId !== 'openshifts') {
      initialAssignments[shift.crewId] = {
        active: true,
        customized: true,
        role: shift.role,
        startHour: shift.startHour,
        endHour: shift.endHour
      };
    }
    setSelectedCrewAssignments(initialAssignments);
  };

  // --- Relocated schedules and currentWeekStart states ---
  ${getMockShiftsBlock}

  ${schedulesBlock}

  ${currentWeekStartBlock}
`;

if (content.includes(targetState)) {
  content = content.replace(targetState, injection);
  console.log("  Successfully injected top level states!");
} else {
  console.log("  Error: targetState not found in page.tsx!");
}

console.log("2. Injecting filteredDays and filteredCrewMembers helper variables...");

const targetNext7Days = "    const next7Days = getNext7Days(currentWeekStart);";
const newNext7Days = `    const next7Days = getNext7Days(currentWeekStart);
    const filteredDays = next7Days;
    const filteredCrewMembers = crewMembers.filter(m => {
      if (scheduleCrewFilter === 'All') return true;
      return m.id === scheduleCrewFilter;
    });`;

if (content.includes(targetNext7Days)) {
  content = content.replace(targetNext7Days, newNext7Days);
  console.log("  Successfully injected filteredDays and filteredCrewMembers!");
} else {
  console.log("  Error: targetNext7Days not found in page.tsx!");
}

console.log("3. Injecting avatar property into crewMembers map...");

const targetCrewMembers = `    // Available Crew: ONLY users with role === 'crew' (not band members)
    const crewMembers = users
      .filter(u => u.role === 'crew')
      .map(u => {
        const initials = u.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
        return {
          id: u.id,
          name: u.name,
          initials: initials || 'C',
          color: getAvatarColor(u.name),
          role: 'Crew Member'
        };
      });`;

const newCrewMembers = `    // Available Crew: ONLY users with role === 'crew' (not band members)
    const crewMembers = users
      .filter(u => u.role === 'crew')
      .map(u => {
        const initials = u.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
        return {
          id: u.id,
          name: u.name,
          initials: initials || 'C',
          color: getAvatarColor(u.name),
          role: 'Crew Member',
          avatar: u.avatar
        };
      });`;

if (content.includes(targetCrewMembers)) {
  content = content.replace(targetCrewMembers, newCrewMembers);
  console.log("  Successfully injected avatar property!");
} else {
  console.log("  Error: targetCrewMembers not found in page.tsx!");
}

console.log("4. Injecting inline hoursStatus definition inside filteredCrewMembers map...");

const targetRosterBoardStart = `              {filteredCrewMembers.map(member => {
                const isCollapsed = collapsedCrewIds.includes(member.id);
                const shiftCount = schedules.filter(s => next7Days.some(d => d.dateStr === s.date) && s.crewId === member.id).length;

                const maxCapHours = hoursStatus.maxHours;`;

const newRosterBoardStart = `              {filteredCrewMembers.map(member => {
                const isCollapsed = collapsedCrewIds.includes(member.id);
                const shiftCount = schedules.filter(s => next7Days.some(d => d.dateStr === s.date) && s.crewId === member.id).length;

                const totalHours = schedules
                  .filter(s => s.crewId === member.id && next7Days.some(d => d.dateStr === s.date))
                  .reduce((sum, s) => sum + (s.endHour - s.startHour), 0);
                const maxHours = 40;
                const hoursStatus = {
                  maxHours,
                  status: totalHours > maxHours ? 'overloaded' : 'ok',
                  over: Math.max(0, totalHours - maxHours)
                };

                const maxCapHours = hoursStatus.maxHours;`;

if (content.includes(targetRosterBoardStart)) {
  content = content.replace(targetRosterBoardStart, newRosterBoardStart);
  console.log("  Successfully injected hoursStatus and totalHours!");
} else {
  console.log("  Error: targetRosterBoardStart not found in page.tsx!");
}

console.log("5. Cleaning up lower-level duplicate getAvatarColor and findCrewName...");

const innerGetAvatarColor = `    const getAvatarColor = (name: string) => {
      const colors = ['#f472b6', '#a78bfa', '#60a5fa', '#34d399', '#fbbf24', '#f87171', '#8b5cf6', '#ec4899'];
      let hash = 0;
      for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
      return colors[Math.abs(hash) % colors.length];
    };`;

const normalizedGetAvatarColor = innerGetAvatarColor.replace(/\r\n/g, "\n");

if (content.includes(normalizedGetAvatarColor)) {
  content = content.replace(normalizedGetAvatarColor, "    // getAvatarColor deleted to use top-level helper");
  console.log("  Successfully cleaned up inner getAvatarColor!");
} else {
  console.log("  Warning: innerGetAvatarColor not found!");
}

const innerStaticCrewAndFindCrewName = `    // Core + dynamically created crew mapping resolver
    const staticCrew = [
      { id: 'michael', name: 'Michael Scimeca' },
      { id: 'sammy', name: 'Sammy D' },
      { id: 'ryan', name: 'Ryan K' },
      { id: 'tony', name: 'Tony M' }
    ];

    // Merge static and dynamic lists
    const findCrewName = (crewId: string) => {
      if (crewId === 'openshifts') return 'OpenShifts';
      const mockCrew = [
        { id: 'abbie', name: 'Abbie Janssen' },
        { id: 'al', name: 'Al Hollie' },
        { id: 'andrea', name: 'Andrea Kinzinger' },
        { id: 'arjun', name: 'Arjun Patel' },
        { id: 'chris', name: 'Chris Loxely' },
        { id: 'daniel', name: 'Daniel Kim' },
        { id: 'dave_croke', name: 'Dave Croke' },
        { id: 'dave_maas', name: 'Dave Maas' },
        { id: 'david_xu', name: 'David Xu' },
        { id: 'emily', name: 'Emily Hafften' },
        { id: 'emma', name: 'Emma Smid' },
        { id: 'erin', name: 'Erin Eagan' },
        { id: 'francesca', name: 'Francesca Troast' },
        { id: 'michael', name: 'Michael Scimeca' },
        { id: 'sammy', name: 'Sammy D' },
        { id: 'ryan', name: 'Ryan K' },
        { id: 'tony', name: 'Tony M' }
      ];
      const foundStatic = staticCrew.find(sc => sc.id === crewId);
      if (foundStatic) return foundStatic.name;
      const foundMock = mockCrew.find(c => c.id === crewId);
      if (foundMock) return foundMock.name;
      const foundDynamic = users.find(u => u.id === crewId);
      if (foundDynamic) return foundDynamic.name;
      return crewId;
    };`;

const normalizedStaticCrew = innerStaticCrewAndFindCrewName.replace(/\r\n/g, "\n");

if (content.includes(normalizedStaticCrew)) {
  content = content.replace(normalizedStaticCrew, "    // findCrewName and staticCrew deleted to use top-level helper");
  console.log("  Successfully cleaned up inner findCrewName!");
} else {
  console.log("  Warning: innerStaticCrewAndFindCrewName not found!");
}

fs.writeFileSync(filePath, content, "utf8");
console.log("Injections complete!");
