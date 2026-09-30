# Task: One shared table component for every data table on the site

Repo: `7th-heaven` (Next.js 16, React 19, Tailwind v4). Read `AGENTS.md` first. If `PERF_BEST_PRACTICES_REPORT.md`, `MOBILE_SAFARI_REPORT.md`, `TITLE_GAP_REPORT.md` or `NOTIFICATIONS_REPORT.md` exist, read them and don't undo their changes.

## Problem
Every list or table on the site is hand-built, and each one looks and behaves slightly differently: header font and size, padding, row height, borders, hover, alignment, scrolling, and mobile behavior. Two different techniques are in use:
- **Real `<table>`s** with their own classes.
- **CSS-grid "tables"**, where the header row and each data row repeat the **same `grid-cols-[…]` string separately**. When the two copies drift apart, the header labels stop lining up with the data. Example: the cruise signups table (`AdminDashboardMain.tsx` ~line 12031, `grid-cols-[44px_32px_1.2fr_1fr_100px_80px_80px_60px_32px]` written twice, header "# | Name / Email | Phone | Party / Date | Checked | Deposit | Full").

## Tables I've found so far (your inventory must be complete: search all of `src/`)
**HTML `<table>`**
- `AdminDashboardMain.tsx` ~5689: analytics top pages (Page Path, Views, Users, Avg Time, Bounce, Key Event)
- `AdminDashboardMain.tsx` ~6047, ~6202, ~6332 (Recent Orders), ~6434: merch/sales tables
- `AdminDashboardMain.tsx` ~6594: raffle claims / orders (Order ID, Customer, Item Details, Source, Fulfillment Status, Actions, Price)
- `AdminDashboardMain.tsx` ~7734: live streams (Host, Viewers, …)
- `components/admin/BulkInvitePanel.tsx` ~345: invites (Email, Name, Status)

**CSS-grid tables**
- `AdminDashboardMain.tsx` ~6802: bookings (Client, Event Type, Date, Venue, Status)
- `AdminDashboardMain.tsx` ~7304: planner/venue contacts (Planner / Venue, Category, Phone Number, Email, Quick Actions)
- `AdminDashboardMain.tsx` ~12031: cruise signups (the screenshot)
- `components/admin/RoleEmailDirectory.tsx` ~420: role email directory
- `components/TourList.tsx` ~1510: **public** tour dates list (7 columns on desktop, cards on mobile)

Also check `AdminSectionCrewSchedule.tsx`, `CrewDashboard/index.tsx`, `CrewHQ.tsx`, `PlannerDashboard.tsx`, `app/admin/shop-inventory/page.tsx`, `app/admin/emails`, `app/admin/email-map`, the admin panels in `components/admin/*`, `ProximitySubscriberAdminPanel`, `ReferralProgramPanel` (leaderboard), `cruise/dashboard`, and anything else that shows rows of records with column headers, including flex-based lists.

**Skip:** `CrewDashboard/index.tsx` ~930 (an HTML string for email/print; leave it) and `CalendarPicker` (a calendar grid, not a data table).

## Build: `src/components/ui/DataTable/`
Composable pieces, so the complex cells that already exist (toggles, badges, avatars, action buttons) can be kept as they are:

```tsx
<DataTable
  columns={[
    { id: "select", width: "44px", align: "center", label: "Select", hideLabel: true },
    { id: "num",    width: "32px", label: "#" },
    { id: "name",   width: "1.2fr", label: "Name / Email", sortable: true },
    { id: "phone",  width: "1fr",  label: "Phone" },
    { id: "party",  width: "100px", label: "Party / Date" },
    { id: "checked",width: "80px", align: "center", label: "Checked" },
    …
  ]}
  stickyHeader
  maxHeight="750px"
  empty={<>No cruise signups yet.</>}
  loading={isLoading}
  density="comfortable"   // or "compact"
  sort={sort} onSortChange={setSort}
  mobile="cards"          // or "scroll"
>
  {signups.map((s, i) => (
    <DataTable.Row key={s.id} selected={…} onClick={…}>
      <DataTable.Cell>…</DataTable.Cell>
      …
    </DataTable.Row>
  ))}
</DataTable>
```

Requirements:
- **One source of truth for columns.** The header and every row get their `grid-template-columns` from the same `columns` array (via context or a CSS variable on the table), so they can never drift apart again. No `grid-cols-[…]` strings in the pages.
- **Semantics:** render as a CSS grid with ARIA table roles (`role="table" | "rowgroup" | "row" | "columnheader" | "cell"`), `aria-sort` on sortable headers, and `aria-rowcount` when virtualized or paginated. Sortable headers are real `<button>`s. An icon-only header column still has a label for screen readers (`hideLabel`).
- **One look**, set in one CSS file (`DataTable.css`) with tokens at the top so it's easy to restyle: header text style (size, weight, case, letter-spacing, color), header background + bottom border, row padding for each density, row border, hover and selected background, cell text color / muted color, number alignment (`tabular-nums`, right-aligned for numeric columns), and the empty/loading states. Match the current admin look (dark, white/10 borders); don't invent a new design. Use the site's tokens where they exist.
- **Alignment per column:** `align: "left" | "center" | "right"` applies to the header **and** the cells in that column.
- **Truncation:** long text (emails, names) truncates with an ellipsis and a `title` attribute instead of pushing columns apart. `minWidth` on columns.
- **Sticky header** inside a scroll container, with the existing `custom-admin-scrollbar` class.
- **Selectable rows:** optional selection column using the existing `Toggle` component, plus a "select all" checkbox in the header.
- **Mobile:**
  - `mobile="cards"` stacks each row into a card, with the column label shown before each value (from `columns`).
  - `mobile="scroll"` keeps the table with horizontal scroll and a sticky first column.
  - The default is `"cards"` for admin tables.
  - Must work at 390px with no page-level horizontal overflow.
- **States:** built-in empty state, loading skeleton rows, and an optional footer (totals, pagination).
- **Optional helpers:** `DataTable.Toolbar` (search + filters + bulk actions area, for the tables that already have these) and `DataTable.Pagination`. Only add them if 2 or more tables use them.
- No new dependencies (no TanStack or similar); the tables are small.
- Add a demo section to `src/app/style-guide/page.tsx` showing every feature.

## Migrate
1. **Inventory first.** List every table (file:line, what it shows, columns, and features used: sort, select, actions, scroll) in `TABLE_AUDIT.md` before converting anything.
2. Convert each table to `DataTable`, one table per commit. Keep all existing behavior: sorting, filters, selection, toggles, click handlers, row actions, exports, and the data logic. **Only the table structure and styling change.**
3. `TourList.tsx` is public-facing and has its own design. Convert it too, but keep its visual design (use a `variant="public"` or pass class overrides). If it doesn't fit cleanly, leave it and explain why in the audit.
4. `AdminDashboardMain.tsx` is ~800 KB. Only edit the table blocks, don't reformat the file. Extracting each converted table into its own small component file under `app/admin/[username]/components/tables/` is encouraged.

## Rules
- Don't change data fetching, API routes or business logic.
- Don't touch `ProgressiveBlur.*`, `BlurTuner.tsx`, `TitleGroup.css`, or the notification system files, unless a table lives inside them.
- `npm run check-all` + `npm run build` pass after every commit.

## Verification
- Check every converted table at 1440px and 390px: header labels line up exactly over their data, nothing overflows, and sticky headers stay put while scrolling.
- Sorting, selection, row actions and toggles still work the same as before.
- Screen reader check (VoiceOver): the table announces its column headers.
- Changing one token in `DataTable.css` (e.g. header font size or row padding) visibly changes **every** table.
- Update `TABLE_AUDIT.md` with before/after for each table, and anything skipped (with the reason).
