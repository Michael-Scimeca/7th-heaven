import { describe, it, expect } from "vitest";
import { parseDateSafe, parseTimeSafe, getShowDateTime, isShowOver } from "../src/lib/date-utils";

describe("Safari & Cross-Browser Safe Date Parsing", () => {
  it("parses ISO YYYY-MM-DD dates without NaN", () => {
    const d = parseDateSafe("2026-10-12");
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(9); // 0-indexed October
    expect(d.getDate()).toBe(12);
  });

  it("parses ISO dates with time '2026-10-12 19:00'", () => {
    const d = parseDateSafe("2026-10-12 19:00");
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(9);
    expect(d.getDate()).toBe(12);
    expect(d.getHours()).toBe(19);
    expect(d.getMinutes()).toBe(0);
  });

  it("parses ordinal dates like 'Oct 12th' and 'October 12th, 2026'", () => {
    const d1 = parseDateSafe("Oct 12th", undefined, 2026);
    expect(d1.getFullYear()).toBe(2026);
    expect(d1.getMonth()).toBe(9);
    expect(d1.getDate()).toBe(12);

    const d2 = parseDateSafe("October 12th, 2026");
    expect(d2.getFullYear()).toBe(2026);
    expect(d2.getMonth()).toBe(9);
    expect(d2.getDate()).toBe(12);
  });

  it("parses slash formats like '10/12' and '10/12/2026'", () => {
    const d1 = parseDateSafe("10/12", undefined, 2026);
    expect(d1.getFullYear()).toBe(2026);
    expect(d1.getMonth()).toBe(9);
    expect(d1.getDate()).toBe(12);

    const d2 = parseDateSafe("10/12/2026");
    expect(d2.getFullYear()).toBe(2026);
    expect(d2.getMonth()).toBe(9);
    expect(d2.getDate()).toBe(12);
  });

  it("parses various 12-hour and 24-hour time strings correctly", () => {
    expect(parseTimeSafe("7:30 PM")).toEqual({ hours: 19, minutes: 30 });
    expect(parseTimeSafe("7pm")).toEqual({ hours: 19, minutes: 0 });
    expect(parseTimeSafe("12:00 PM")).toEqual({ hours: 12, minutes: 0 });
    expect(parseTimeSafe("12:00 AM")).toEqual({ hours: 0, minutes: 0 });
    expect(parseTimeSafe("19:45")).toEqual({ hours: 19, minutes: 45 });
  });

  it("getShowDateTime combines startDate and timeStr accurately", () => {
    const dt = getShowDateTime("2026-07-04", undefined, "8:00 PM");
    expect(dt.getFullYear()).toBe(2026);
    expect(dt.getMonth()).toBe(6); // July
    expect(dt.getDate()).toBe(4);
    expect(dt.getHours()).toBe(20);
    expect(dt.getMinutes()).toBe(0);
  });

  it("returns fallback Date(0) safely on null or invalid inputs instead of throwing", () => {
    expect(parseDateSafe("").getTime()).toBe(0);
    expect(parseDateSafe(undefined).getTime()).toBe(0);
  });
});
