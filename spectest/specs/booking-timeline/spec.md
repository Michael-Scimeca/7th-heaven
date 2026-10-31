# booking-timeline Specification

## Purpose
Defines requirements and verified automated test scenarios for the 4-stage event night progression timeline, milestone dropdown popovers, and interactive drag controls on the /book page.
## Requirements
### Requirement: Timeline Milestone Selection
The booking form SHALL allow users to adjust each of the 4 night progression milestones (Doors, Showtime, Encore, Curfew) via interactive dropdown popovers.

#### Scenario: User selects a new showtime
- **WHEN** user clicks the "SHOWTIME" milestone pill on `/book`
- **THEN** a listbox popover appears with available show start times
- **WHEN** user selects "8:00 PM"
- **THEN** the showtime pill updates to display "8:00 PM" and the popover closes

### Requirement: Dynamic Duration Calculations
The booking form SHALL dynamically calculate and display pre-show reception, 7th Heaven live set, and post-show wrap durations based on selected milestone times.

#### Scenario: Live set duration updates after time change
- **WHEN** showtime is set to "7:30 PM" and encore is set to "10:30 PM"
- **THEN** the live set duration badge displays "3h Live Set"
- **WHEN** user changes encore to "11:00 PM"
- **THEN** the live set duration badge dynamically updates to "3.5h Live Set"

### Requirement: Interactive Timeline Dragging
The timeline rail SHALL support interactive pointer dragging to reposition or resize the live concert performance window.

#### Scenario: User drags performance handle
- **WHEN** user drags the showtime resize handle on the timeline bar
- **THEN** the live concert window updates its start time in real time and synchronizes with the milestone pill below

