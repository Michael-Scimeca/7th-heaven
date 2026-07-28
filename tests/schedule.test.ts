import { describe, it, expect } from 'vitest';
import {
  sortCrewMembers,
  checkShiftOverlap,
  calculateScheduledHours,
  formatTimeFrame,
  CrewMember,
  Shift,
} from '../src/lib/scheduleUtils';

describe('Roster & Schedule Working Functionality Unit Tests', () => {
  const mockCrew: CrewMember[] = [
    { id: '1', name: 'Abbie Janssen', role: 'SERVER' },
    { id: '2', name: 'Al Hollie', role: 'SERVER' },
    { id: '3', name: 'Andrea Kinzinger', role: 'CHEF' },
    { id: '4', name: 'Dave Croke', role: 'LINE COOK' },
  ];

  const visibleWeekDates = ['2026-07-27', '2026-07-28', '2026-07-29', '2026-07-30'];

  const mockShifts: Shift[] = [
    { id: 's1', crewId: '3', date: '2026-07-29', startHour: 17, endHour: 22, role: 'CHEF' }, // Andrea working Wed 29
    { id: 's2', crewId: '4', date: '2026-07-30', startHour: 12, endHour: 18, role: 'LINE COOK' }, // Dave working Thu 30
  ];

  describe('Working Crew Member Prioritization Sorting', () => {
    it('should float crew members with shifts in the visible week to the top of the roster', () => {
      const sorted = sortCrewMembers(mockCrew, mockShifts, visibleWeekDates);

      // Both Andrea and Dave (working crew) must be placed BEFORE non-working crew (Abbie, Al)
      expect(sorted.slice(0, 2).map(c => c.name)).toContain('Andrea Kinzinger');
      expect(sorted.slice(0, 2).map(c => c.name)).toContain('Dave Croke');
      expect(sorted[2].name).toBe('Abbie Janssen');
      expect(sorted[3].name).toBe('Al Hollie');
    });

    it('should prioritize crew working on a specifically selected date', () => {
      // If Wed 29 is clicked, Andrea Kinzinger (working Wed 29) must be #1
      const sortedWed = sortCrewMembers(mockCrew, mockShifts, visibleWeekDates, '2026-07-29');
      expect(sortedWed[0].name).toBe('Andrea Kinzinger');

      // If Thu 30 is clicked, Dave Croke (working Thu 30) must be #1
      const sortedThu = sortCrewMembers(mockCrew, mockShifts, visibleWeekDates, '2026-07-30');
      expect(sortedThu[0].name).toBe('Dave Croke');
    });

    it('should sort working crew by total hours descending when both are scheduled', () => {
      const multiShifts: Shift[] = [
        { id: 's1', crewId: '3', date: '2026-07-29', startHour: 17, endHour: 22, role: 'CHEF' }, // 5 hours
        { id: 's2', crewId: '4', date: '2026-07-30', startHour: 10, endHour: 18, role: 'LINE COOK' }, // 8 hours
      ];

      const sorted = sortCrewMembers(mockCrew, multiShifts, visibleWeekDates);
      // Dave (8 hours) should be above Andrea (5 hours)
      expect(sorted[0].name).toBe('Dave Croke');
      expect(sorted[1].name).toBe('Andrea Kinzinger');
    });
  });

  describe('Shift Overlap Detection', () => {
    const existing: Shift[] = [
      { id: 's1', crewId: '3', date: '2026-07-29', startHour: 14, endHour: 18, role: 'CHEF' },
    ];

    it('should detect overlaps when proposed shift times collide', () => {
      // Proposed shift 16:00 to 20:00 overlaps with 14:00 to 18:00
      const res = checkShiftOverlap(16, 20, existing);
      expect(res.hasOverlap).toBe(true);
      expect(res.overlappingShifts).toHaveLength(1);
    });

    it('should allow non-overlapping shifts on the same day', () => {
      // Proposed shift 18:00 to 22:00 starts after existing shift ends at 18:00
      const res = checkShiftOverlap(18, 22, existing);
      expect(res.hasOverlap).toBe(false);
    });

    it('should exclude current shift being edited from overlap check', () => {
      const res = checkShiftOverlap(14, 18, existing, 's1');
      expect(res.hasOverlap).toBe(false);
    });
  });

  describe('Scheduled Hours Calculation & Time Frame Formatting', () => {
    it('should calculate correct total scheduled hours for a member', () => {
      const hours = calculateScheduledHours('3', mockShifts, visibleWeekDates);
      expect(hours).toBe(5);
    });

    it('should format time frame decimal hours into standard time string', () => {
      expect(formatTimeFrame(17, 22)).toBe('5:00 PM - 10:00 PM');
      expect(formatTimeFrame(9, 15.5)).toBe('9:00 AM - 3:30 PM');
      expect(formatTimeFrame(12, 17)).toBe('12:00 PM - 5:00 PM');
    });
  });
});
