/**
 * Roster Schedule & Work Shift Utility Logic
 */

export interface CrewMember {
  id: string;
  name: string;
  role?: string;
  phone?: string;
  email?: string;
}

export interface Shift {
  id: string;
  crewId: string;
  date: string;
  startHour: number;
  endHour: number;
  role?: string;
  isTimeOff?: boolean;
  time?: string;
}

/**
 * Formats start/end decimal hours into standard time frame string (e.g., "5:00 PM - 10:00 PM")
 */
export function formatHour(decimalHour: number): string {
  const h = Math.floor(decimalHour);
  const m = Math.round((decimalHour - h) * 60);
  const period = h >= 12 && h < 24 ? 'PM' : 'AM';
  let displayHour = h % 12;
  if (displayHour === 0) displayHour = 12;
  const displayMinutes = m < 10 ? `0${m}` : `${m}`;
  return `${displayHour}:${displayMinutes} ${period}`;
}

export function formatTimeFrame(start: number, end: number): string {
  return `${formatHour(start)} - ${formatHour(end)}`;
}

/**
 * Checks whether a proposed shift overlaps with existing scheduled shifts for a crew member
 */
export function checkShiftOverlap(
  newStart: number,
  newEnd: number,
  existingShifts: Shift[],
  excludeShiftId?: string
): { hasOverlap: boolean; overlappingShifts: Shift[] } {
  const overlappingShifts = existingShifts.filter(shift => {
    if (excludeShiftId && shift.id === excludeShiftId) return false;
    if (shift.isTimeOff) return false;
    // Overlap condition: start < shift.end && end > shift.start
    return newStart < shift.endHour && newEnd > shift.startHour;
  });

  return {
    hasOverlap: overlappingShifts.length > 0,
    overlappingShifts,
  };
}

/**
 * Calculates total scheduled hours for a crew member across a set of dates
 */
export function calculateScheduledHours(crewId: string, shifts: Shift[], targetDates?: string[]): number {
  const dateSet = targetDates ? new Set(targetDates) : null;
  return shifts
    .filter(s => s.crewId === crewId && !s.isTimeOff && s.crewId !== 'openshifts')
    .filter(s => (dateSet ? dateSet.has(s.date) : true))
    .reduce((acc, s) => acc + Math.max(0, s.endHour - s.startHour), 0);
}

/**
 * Sorts crew members for the roster view:
 * 1. Prioritizes crew members working on a selected date
 * 2. Prioritizes crew members working in the visible week
 * 3. Sorts by total scheduled hours (descending)
 * 4. Alphabetical fallback by name
 */
export function sortCrewMembers(
  members: CrewMember[],
  schedules: Shift[],
  visibleWeekDates: string[],
  selectedDate?: string | null
): CrewMember[] {
  const weekDateSet = new Set(visibleWeekDates);

  return [...members]
    .filter(m => m.id !== 'openshifts')
    .sort((a, b) => {
      // 1. Selected date prioritization
      if (selectedDate) {
        const aOnSelected = schedules.some(s => s.date === selectedDate && s.crewId === a.id && !s.isTimeOff && s.crewId !== 'openshifts');
        const bOnSelected = schedules.some(s => s.date === selectedDate && s.crewId === b.id && !s.isTimeOff && s.crewId !== 'openshifts');
        if (aOnSelected && !bOnSelected) return -1;
        if (!aOnSelected && bOnSelected) return 1;
      }

      // 2. Visible week active shift prioritization
      const aWeekShifts = schedules.filter(s => weekDateSet.has(s.date) && s.crewId === a.id && !s.isTimeOff && s.crewId !== 'openshifts');
      const bWeekShifts = schedules.filter(s => weekDateSet.has(s.date) && s.crewId === b.id && !s.isTimeOff && s.crewId !== 'openshifts');
      const aHasWeek = aWeekShifts.length > 0;
      const bHasWeek = bWeekShifts.length > 0;

      if (aHasWeek && !bHasWeek) return -1;
      if (!aHasWeek && bHasWeek) return 1;

      // 3. Scheduled hours descending
      const aHours = aWeekShifts.reduce((acc, s) => acc + Math.max(0, s.endHour - s.startHour), 0);
      const bHours = bWeekShifts.reduce((acc, s) => acc + Math.max(0, s.endHour - s.startHour), 0);
      if (bHours !== aHours) return bHours - aHours;

      // 4. Name fallback
      return a.name.localeCompare(b.name);
    });
}
