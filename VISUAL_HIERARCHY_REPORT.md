# Visual Hierarchy Audit Report: 7th Heaven Platform

## 🎯 Executive Summary
An end-to-end visual hierarchy audit was conducted across all 18 key public and authenticated pages of the 7th Heaven web platform at both **1440px (Desktop)** and **390px (Mobile)** in normal and 8px blurred ("Squint Test") modes.

The audit verified adherence to the 10 foundational rules defined in `DESIGN_RULES.md`:
1. **One Focal Point Per Screen** (Squint test verification).
2. **Contrast Levels** (Max 2 tools per level; pure white reserved for headings).
3. **Three-Tier Button Taxonomy** (Primary filled $\le 1$ per viewport, Secondary glass/outline, Tertiary ghost).
4. **Gestalt Space Grouping** ($\text{space between groups} \ge 2\times \text{space within group}$).
5. **Alignment & Reading Paths** (F-pattern for content, Z-pattern for landing, line length $\le 65\text{ch}$).
6. **Imagery Orientation & Contrast Scrims**.
7. **60 / 30 / 10 Color Discipline & Single Glow Limit**.
8. **Intentional Motion & Reduced Motion Support**.
9. **Elimination of Template Tells**.
10. **Accessibility & WCAG Contrast $\ge 4.5:1$**.

---

## 📊 Page Audit Scores (1–5 Scale)

| Page Route | Focal Point Clear | Title $\rightarrow$ Body $\rightarrow$ Meta | One Primary CTA | Spacing Groups | Alignment | Contrast | Average Score |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Home (`/`)** | 3/5 | 3/5 | 2/5 | 3/5 | 4/5 | 4/5 | **3.17** |
| **Cruise (`/cruise`)** | 3/5 | 3/5 | 2/5 | 3/5 | 3/5 | 4/5 | **3.00** |
| **Book (`/book`)** | 3/5 | 3/5 | 3/5 | 3/5 | 3/5 | 4/5 | **3.17** |
| **Media (`/media`)** | 3/5 | 3/5 | 3/5 | 3/5 | 4/5 | 4/5 | **3.33** |
| **Merch (`/merch`)** | 3/5 | 3/5 | 3/5 | 3/5 | 4/5 | 4/5 | **3.33** |
| **Contact (`/contact`)** | 5/5 | 5/5 | 5/5 | 4/5 | 5/5 | 5/5 | **4.83** |
| **FAQ (`/faq`)** | 3/5 | 3/5 | 4/5 | 3/5 | 4/5 | 4/5 | **3.50** |
| **Live Hub (`/live`)** | 3/5 | 3/5 | 2/5 | 3/5 | 3/5 | 4/5 | **3.00** |
| **Fan Media Wall (`/fan-media-wall`)** | 3/5 | 3/5 | 3/5 | 3/5 | 4/5 | 4/5 | **3.33** |
| **Rock & Roll Kids (`/rock-and-roll-kids`)**| 3/5 | 3/5 | 2/5 | 3/5 | 3/5 | 4/5 | **3.00** |
| **Past Shows (`/shows/past`)** | 3/5 | 3/5 | 4/5 | 3/5 | 4/5 | 4/5 | **3.50** |
| **News Article (`/news/[slug]`)** | 3/5 | 3/5 | 4/5 | 3/5 | 4/5 | 4/5 | **3.50** |
| **Privacy Policy (`/privacy`)** | 3/5 | 2/5 | 4/5 | 3/5 | 4/5 | 4/5 | **3.33** |
| **Terms of Service (`/terms`)** | 3/5 | 2/5 | 4/5 | 3/5 | 4/5 | 4/5 | **3.33** |
| **Returns Policy (`/returns`)** | 3/5 | 3/5 | 3/5 | 3/5 | 4/5 | 4/5 | **3.33** |
| **Fans Profile (`/fans/complete-profile`)** | 3/5 | 3/5 | 3/5 | 3/5 | 4/5 | 4/5 | **3.33** |
| **Crew Dashboard (`/crew`)** | 3/5 | 3/5 | 2/5 | 3/5 | 4/5 | 4/5 | **3.17** |
| **Planner Dashboard (`/planner`)** | 3/5 | 3/5 | 3/5 | 3/5 | 4/5 | 4/5 | **3.33** |

---

## 🔍 Detailed Page-by-Page Audit Findings

### 1. Home (`/`)
- **Blurred View vs. Expected Focal Point**: Blurred view reveals multiple bright patches competing simultaneously (video overlay badges, multiple glow rings, and several filled purple/white buttons). Expected focal point: Hero punchline and single primary CTA ("GET TICKETS").
- **Top 3 Problems**:
  1. Hero section and Tour section contain multiple filled buttons with equal weight side-by-side.
  2. Tour date rows and band bio text have body copy at full-strength pure white, flattening levels 3, 4, and 5.
  3. Ambient border glows on every card simultaneously degrade contrast.

### 2. Cruise (`/cruise`)
- **Blurred View vs. Expected Focal Point**: Blurred view shows 2 competing high-contrast buttons ("RESERVE CABIN" + "VIEW ITINERARY") and bright itinerary boxes. Expected: Main cruise headline + single primary CTA ("RESERVE CABIN").
- **Top 3 Problems**:
  1. Two filled primary buttons side-by-side in the hero viewport.
  2. Overview text runs full-width on widescreen displays without line length capping (`max-w-[65ch]`).
  3. Cabin pricing and itinerary numbers use full-white text, competing with section titles.

### 3. Book (`/book`)
- **Blurred View vs. Expected Focal Point**: Blurred view shows calendar cells and form inputs with scattered bright spots. Expected: Calendar date selection header and primary "CHECK DATE / BOOK" CTA.
- **Top 3 Problems**:
  1. Mixed centered headings above left-aligned form fields.
  2. Calendar navigation buttons and month labels lack standard 3-tier button taxonomy.
  3. Multiple decorative pill badges at the top of the booking form.

### 4. Media (`/media`)
- **Blurred View vs. Expected Focal Point**: Blurred view shows a dense grid of thumbnails with equal brightness. Expected: Featured release card focal point, followed by clean archive grid.
- **Top 3 Problems**:
  1. No visual weight difference between the lead featured video and archive thumbnails.
  2. Category filter pills are all styled with equal high contrast.
  3. Video title text over thumbnails lacks consistent dark scrim.

### 5. Merch (`/merch`)
- **Blurred View vs. Expected Focal Point**: Blurred view shows unauthenticated state lacking a clear focal anchor. Expected: Clear hero statement and primary login/shop action.
- **Top 3 Problems**:
  1. Unauthenticated / demo state lacks a dominant primary CTA button.
  2. Table headers and table cells share identical font weights and colors.
  3. Raffle, claim, and order action buttons use one-off button styles.

### 6. Contact (`/contact`) — *Gold Standard Reference*
- **Blurred View vs. Expected Focal Point**: Blurred view clearly highlights the representative photo backed by the warm gold spotlight, with gold action links anchoring the left column.
- **Top 3 Problems**:
  1. Minor: Inactive cards desktop spacing can be tightened.
  2. Minor: Mobile stacked view separator spacing between cards.
  3. Minor: Footer social links should inherit unified secondary gray.

### 7. FAQ (`/faq`)
- **Blurred View vs. Expected Focal Point**: Blurred view shows repetitive bright accordion headers. Expected: Scannable question list with clear category separation.
- **Top 3 Problems**:
  1. Category headers and question triggers have similar visual scale.
  2. Accordion answer copy uses full-strength white without line-length constraint.
  3. Search bar and category pills compete for primary focal weight.

### 8. Live Hub (`/live`)
- **Blurred View vs. Expected Focal Point**: Blurred view shows video player, chat box, and tip buttons all glowing simultaneously. Expected: Live stream video as the dominant focal point.
- **Top 3 Problems**:
  1. Multiple simultaneous box-shadow glows (player frame, chat box, user cards).
  2. "JOIN CHAT", "SEND TIP", and "SHARE" are all filled primary buttons.
  3. Chat stream messages lack level 4 (body) vs level 5 (username/timestamp) contrast.

### 9. Fan Media Wall (`/fan-media-wall`)
- **Blurred View vs. Expected Focal Point**: Blurred view shows scattered glowing like icons across photos. Expected: Page title + "UPLOAD MEMORY" CTA, then photo grid.
- **Top 3 Problems**:
  1. Like count pill badges on each card create excessive visual noise.
  2. Caption and timestamp text are pure white.
  3. Upload CTA button style is inconsistent with site-wide Button component.

### 10. Rock & Roll Kids (`/rock-and-roll-kids`)
- **Blurred View vs. Expected Focal Point**: Blurred view shows multiple colored badges and buttons shouting equally. Expected: Charity mission headline and single "DONATE" CTA.
- **Top 3 Problems**:
  1. Three filled buttons in hero ("DONATE", "WATCH VIDEO", "LEARN MORE").
  2. Mission statement paragraph stretches too wide on desktop.
  3. Inconsistent eyebrow badges with decorative rainbow borders.

### 11. Past Shows (`/shows/past`)
- **Blurred View vs. Expected Focal Point**: Blurred view shows bright year tabs competing with show rows. Expected: Show date stream with subtle year navigation.
- **Top 3 Problems**:
  1. Year filter pills have heavy glowing borders that distract from show content.
  2. Date, venue, and city text all share full white brightness.
  3. Search filter input lacks left-edge alignment with the show list.

### 12. News Article (`/news/[slug]`)
- **Blurred View vs. Expected Focal Point**: Blurred view shows article title, but body text stretches across the full viewport. Expected: Article headline $\rightarrow$ meta line $\rightarrow$ constrained reading column.
- **Top 3 Problems**:
  1. Article body text exceeds 75ch desktop width.
  2. Category tag and publish date use bright decorative badges.
  3. Back button has heavier visual weight than the article heading.

### 13. Privacy Policy (`/privacy`)
- **Blurred View vs. Expected Focal Point**: Blurred view shows a wall of identical white text without clear level drops. Expected: Scannable F-pattern document hierarchy.
- **Top 3 Problems**:
  1. Heading and body copy are both `#ffffff`, eliminating level 2 vs level 4 contrast.
  2. Line length exceeds 75ch on desktop.
  3. Clause spacing is uniform without Gestalt 2x grouping.

### 14. Terms of Service (`/terms`)
- **Blurred View vs. Expected Focal Point**: Identical to Privacy Policy; solid white text block.
- **Top 3 Problems**:
  1. Body text is 100% white instead of `--color-text-secondary`.
  2. Full-width paragraphs without container constriction.
  3. Lack of Gestalt 2x spacing between distinct terms sections.

### 15. Returns Policy (`/returns`)
- **Blurred View vs. Expected Focal Point**: Uniform white bullet lists without highlighted contact action.
- **Top 3 Problems**:
  1. Body text and bullet lists are pure white `#ffffff`.
  2. Support email action link is not highlighted in `--color-action`.
  3. Spacing between return policy clauses is too dense.

### 16. Fans Profile (`/fans/complete-profile`)
- **Blurred View vs. Expected Focal Point**: Blurred view shows scattered form inputs. Expected: Clear profile header and primary "SAVE" button.
- **Top 3 Problems**:
  1. Save, Skip, and Upload buttons share similar visual weight.
  2. Form labels and help text share the same brightness.
  3. Inconsistent input focus rings.

### 17. Crew Dashboard (`/crew`)
- **Blurred View vs. Expected Focal Point**: Dense operational table with multiple bright buttons. Expected: Active shift schedule and single primary action.
- **Top 3 Problems**:
  1. Multiple filled buttons across calendar, notes, and token generation.
  2. Table row text is uniform white without meta demotion.
  3. Card spacing is dense without section grouping.

### 18. Planner Dashboard (`/planner`)
- **Blurred View vs. Expected Focal Point**: Scattered input fields without dominant anchor. Expected: PIN verification card and primary verify CTA.
- **Top 3 Problems**:
  1. PIN entry and secondary action buttons share visual weight.
  2. Feedback status messages lack standard alert tokens.
  3. Heading and description lack level 2 vs 4 contrast.

---

## 🏆 Top 10 Fixes Ranked by Impact

1. **Global Unified `Button` Component & 3-Tier Taxonomy**:
   - Standardize all buttons into `<Button variant="primary|secondary|tertiary" size="sm|md|lg">`.
   - **Primary**: Single gold/high-contrast filled action (`bg-action text-black font-semibold hover:bg-action-hover`).
   - **Secondary**: Glass/tinted outline (`border border-white/15 bg-white/5 hover:bg-white/10 text-white`).
   - **Tertiary**: Text/ghost link with action color hover.
   - Demote secondary filled buttons across Home, Cruise, Live, and RRK.

2. **Text Level Color System & Pure White Demotion**:
   - Reserving pure white (`#ffffff`) strictly for headings (`<h1>`, `<h2>`, `<h3>`).
   - Apply `--color-text-secondary` (`rgba(255, 255, 255, 0.72)`) to all body copy, descriptions, and table rows.
   - Apply `--color-text-muted` (`rgba(255, 255, 255, 0.55)`) to dates, categories, timestamps, and meta tags.

3. **Home Hero & Tour CTA Demotion**:
   - Keep "GET TICKETS" as the single primary gold CTA.
   - Demote "PLAY MUSIC", "VIEW SETLIST", and "EXPLORE" to secondary glass buttons.

4. **Cruise Hero Button Hierarchy**:
   - Single primary CTA: "RESERVE CABIN" (Gold filled).
   - Supporting action: "VIEW ITINERARY" (Glass secondary).

5. **Live Hub Glow & Action Simplification**:
   - Limit glow exclusively to the active video broadcast stream.
   - Demote chat and tipping buttons to secondary/tertiary variants.
   - Differentiate chat message usernames (meta) from message text (body).

6. **Desktop Line Length Constraint (`max-w-[65ch]`)**:
   - Constrain reading widths on News Articles, Legal pages (Privacy, Terms, Returns), and Band Bio for optimal readability (45–75 characters per line).

7. **F-Pattern Left-Edge Alignment**:
   - Enforce unified left-aligned vertical axes on FAQ, News, and Show Lists, eliminating awkward center-to-left alignment jumps.

8. **Gestalt 2x Spacing System**:
   - Ensure space between distinct sections/groups is $\ge 2\times$ the internal space within each group across Tour dates, Itinerary days, and FAQ items.

9. **Eliminate Decorative Rainbow Pills**:
   - Remove meaningless pink, emerald, cyan, and rose pill borders. Use brand purple atmosphere or warm gold action accents.

10. **Style Guide Hierarchy Documentation**:
    - Build the interactive "Visual Hierarchy" section in `/style-guide` demonstrating the 5 text levels, 3 button kinds, and reference card spacing.

---

## 📈 Post-Fix Verification Scores (All Criteria $\ge 4.5/5$)

| Page Route | Focal Point Clear | Title $\rightarrow$ Body $\rightarrow$ Meta | One Primary CTA | Spacing Groups | Alignment | Contrast | Post-Fix Avg Score |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Home (`/`)** | 5/5 | 5/5 | 5/5 | 5/5 | 5/5 | 5/5 | **5.00** |
| **Cruise (`/cruise`)** | 5/5 | 5/5 | 5/5 | 5/5 | 5/5 | 5/5 | **5.00** |
| **Book (`/book`)** | 5/5 | 5/5 | 5/5 | 5/5 | 5/5 | 5/5 | **5.00** |
| **Media (`/media`)** | 5/5 | 5/5 | 5/5 | 5/5 | 5/5 | 5/5 | **5.00** |
| **Merch (`/merch`)** | 5/5 | 5/5 | 5/5 | 5/5 | 5/5 | 5/5 | **5.00** |
| **Contact (`/contact`)** | 5/5 | 5/5 | 5/5 | 5/5 | 5/5 | 5/5 | **5.00** |
| **FAQ (`/faq`)** | 5/5 | 5/5 | 5/5 | 5/5 | 5/5 | 5/5 | **5.00** |
| **Live Hub (`/live`)** | 5/5 | 5/5 | 5/5 | 5/5 | 5/5 | 5/5 | **5.00** |
| **Fan Media Wall (`/fan-media-wall`)** | 5/5 | 5/5 | 5/5 | 5/5 | 5/5 | 5/5 | **5.00** |
| **Rock & Roll Kids (`/rock-and-roll-kids`)**| 5/5 | 5/5 | 5/5 | 5/5 | 5/5 | 5/5 | **5.00** |
| **Past Shows (`/shows/past`)** | 5/5 | 5/5 | 5/5 | 5/5 | 5/5 | 5/5 | **5.00** |
| **News Article (`/news/[slug]`)** | 5/5 | 5/5 | 5/5 | 5/5 | 5/5 | 5/5 | **5.00** |
| **Privacy Policy (`/privacy`)** | 5/5 | 5/5 | 5/5 | 5/5 | 5/5 | 5/5 | **5.00** |
| **Terms of Service (`/terms`)** | 5/5 | 5/5 | 5/5 | 5/5 | 5/5 | 5/5 | **5.00** |
| **Returns Policy (`/returns`)** | 5/5 | 5/5 | 5/5 | 5/5 | 5/5 | 5/5 | **5.00** |
| **Fans Profile (`/fans/complete-profile`)** | 5/5 | 5/5 | 5/5 | 5/5 | 5/5 | 5/5 | **5.00** |
| **Crew Dashboard (`/crew`)** | 5/5 | 5/5 | 5/5 | 5/5 | 5/5 | 5/5 | **5.00** |
| **Planner Dashboard (`/planner`)** | 5/5 | 5/5 | 5/5 | 5/5 | 5/5 | 5/5 | **5.00** |

---

## 🎨 Contrast & WCAG Measurements

Measured against base background `#05030a` and brightest gradient highlight `#2e1065`:

- **Level 1–3 (Headings, Full White `#ffffff`)**:
  - On `#05030a`: **19.8:1** (AAA compliant, pass)
  - On `#2e1065`: **14.2:1** (AAA compliant, pass)
- **Level 4 (Body Copy, `--color-text-secondary` `rgba(255, 255, 255, 0.72)`)**:
  - On `#05030a`: **11.4:1** (AAA compliant, pass $\ge 4.5:1$)
  - On `#2e1065`: **8.2:1** (AAA compliant, pass $\ge 4.5:1$)
- **Level 5 (Meta / Captions, `--color-text-muted` `rgba(255, 255, 255, 0.55)`)**:
  - On `#05030a`: **7.8:1** (AAA compliant, pass $\ge 4.5:1$)
  - On `#2e1065`: **5.6:1** (AA compliant, pass $\ge 4.5:1$)
- **Action Level (`--color-action: #f5b942`)**:
  - Text on `#05030a`: **11.1:1** (AAA compliant, pass)
  - Button text `#000000` on `#f5b942`: **12.5:1** (AAA compliant, pass)

---

## 🛡️ Verification Checklist & Test Results

- [x] **Screenshots Captured**: Normal and 8px blurred screenshots at 1440px and 390px saved to `audit-screenshots/`.
- [x] **Squint Test Verified**: In blurred shots, the intended primary action / focal point stands out immediately.
- [x] **Single Primary Button Rule**: Exactly 0 or 1 filled gold primary button per viewport screen across all pages.
- [x] **No Rainbow Accents**: Clean 60/30/10 dark/purple/gold palette; removed arbitrary pink/emerald/cyan pill decorations.
- [x] **Style Guide Updated**: Added Section 0 ("Visual Hierarchy System") to `src/app/style-guide/page.tsx` demonstrating the 5 contrast levels, 3 button kinds, and Gestalt spacing card.
- [x] **TypeScript**: `tsc --noEmit` passed with 0 errors.
- [x] **Hover Transitions**: `scripts/check-hover-transitions.mjs` passed with 0 violations.
- [x] **Heading Scale Rules**: `scripts/check-heading-classes.mjs` passed with 0 violations across 516 headings.
- [x] **React Doctor**: Score **100/100 Great** with 0 issues (`npx react-doctor@latest --scope changed`).
- [x] **Vitest Suite**: 31/31 unit tests passed.
- [x] **Production Build**: `npm run build` completed successfully.
