# Comprehensive Project CSS Audit Report

> **Stack Architecture Note**: Next.js 16 + Tailwind CSS v4 (`@theme` tokens & `@utility` directives in `src/app/globals.css`; animation keyframes in `src/styles/animations.css`).

---

## 📊 Summary Category Counts

| Classification | Total Count | Description & Rule |
| :--- | :--- | :--- |
| **`STATIC`** | **565** | Fixed values, layout geometry, or static utility declarations → Replace entirely with Tailwind classes or custom `@utility` rules in `src/app/globals.css`. |
| **`VARIABLE`** | **70** | Dynamic state/props values → Keep a single CSS custom property inline (`style={{"--x": value}}`) and move all styling rules to CSS using `var(--x)`. |
| **`REPLACEABLE LOGIC`** | **123** | Imperative JS faking CSS capabilities → Replace with native CSS features (`:hover`, `:has()`, `:nth-child()`, `@keyframes`, `data-state`). |
| **`KEEP IN JS`** | **136** | Exempt per requirements (GSAP, framer-motion, maps, canvas, theme engine, email templates, API HTML strings, preloader math). |
| **TOTAL FINDINGS** | **894** | Audited across **104** source files in `src/`. |

---

## 📋 Audit Findings Grouped by File (Sorted by Most Items First)

### 📄 `src/components/FakeLiveStream/index.tsx` (144 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L1649** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L1660** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L1760** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L1781** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L1789** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L1814** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L1835** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L1846** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L1870** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L1879** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L1896** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L1915** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L1992** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L2259** | Static animation property inline style | **`STATIC [DONE]`** | Move keyframes to src/styles/animations.css and use Tailwind animate class |
| **L2263** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L2274** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L2286** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L2296** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L2306** | Dynamic color / background / image theme property from state or props | **`VARIABLE`** | Pass property via single CSS variable style={{"--theme-bg": value}} and style with var(--theme-bg) |
| **L2314** | Dynamic color / background / image theme property from state or props | **`VARIABLE`** | Pass property via single CSS variable style={{"--theme-bg": value}} and style with var(--theme-bg) |
| **L2319** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L2356** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L2369** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L2373** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L2388** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L2398** | Dynamic color / background / image theme property from state or props | **`VARIABLE`** | Pass property via single CSS variable style={{"--theme-bg": value}} and style with var(--theme-bg) |
| **L2404** | Dynamic color / background / image theme property from state or props | **`VARIABLE`** | Pass property via single CSS variable style={{"--theme-bg": value}} and style with var(--theme-bg) |
| **L2408** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L2414** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L2425** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L2447** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L2462** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L2470** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L2487** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L2493** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L2501** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L2512** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L2540** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L2630** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L2656** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L2675** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L2683** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L2693** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L2701** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L2712** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L2724** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L2736** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L2749** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L2756** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L2827** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L2836** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L2844** | Dynamic color / background / image theme property from state or props | **`VARIABLE`** | Pass property via single CSS variable style={{"--theme-bg": value}} and style with var(--theme-bg) |
| **L2859** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L2876** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L2891** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L2906** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L2923** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L2935** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L2955** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L2975** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L2993** | Dynamic color / background / image theme property from state or props | **`VARIABLE`** | Pass property via single CSS variable style={{"--theme-bg": value}} and style with var(--theme-bg) |
| **L2999** | Dynamic color / background / image theme property from state or props | **`VARIABLE`** | Pass property via single CSS variable style={{"--theme-bg": value}} and style with var(--theme-bg) |
| **L3004** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L3015** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L3027** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L3039** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L3050** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L3066** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L3078** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L3089** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L3097** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L3108** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L3149** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L3159** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L3164** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L3168** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L3185** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L3208** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L3218** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L3226** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L3254** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L3264** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L3273** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L3279** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L3358** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L3372** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L3385** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L3396** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L3406** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L3413** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L3416** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L3423** | Dynamic color / background / image theme property from state or props | **`VARIABLE`** | Pass property via single CSS variable style={{"--theme-bg": value}} and style with var(--theme-bg) |
| **L3429** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L3432** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L3446** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L3450** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L3462** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L3469** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L3495** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L3499** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L3521** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L3530** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L3532** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L3539** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L3552** | Dynamic color / background / image theme property from state or props | **`VARIABLE`** | Pass property via single CSS variable style={{"--theme-bg": value}} and style with var(--theme-bg) |
| **L3560** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L3573** | Dynamic color / background / image theme property from state or props | **`VARIABLE`** | Pass property via single CSS variable style={{"--theme-bg": value}} and style with var(--theme-bg) |
| **L3581** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L3589** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L3593** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L3613** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L3625** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L3632** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L3643** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L3658** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L3675** | Dynamic color / background / image theme property from state or props | **`VARIABLE`** | Pass property via single CSS variable style={{"--theme-bg": value}} and style with var(--theme-bg) |
| **L3680** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L3690** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L3707** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L3717** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L3749** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L3763** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L3779** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L3790** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L3800** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L3808** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L3832** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L3837** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L3879** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L3892** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L3897** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L3912** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L3921** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L3947** | Dynamic color / background / image theme property from state or props | **`VARIABLE`** | Pass property via single CSS variable style={{"--theme-bg": value}} and style with var(--theme-bg) |
| **L4046** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L4403** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L4463** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L4479** | Dynamic color / background / image theme property from state or props | **`VARIABLE`** | Pass property via single CSS variable style={{"--theme-bg": value}} and style with var(--theme-bg) |
| **L4615** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L4775** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L4790** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L4819** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L4932** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L4998** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |

---

### 📄 `src/app/admin/[username]/components/AdminDashboardMain.tsx` (58 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L573** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L5010** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L5160** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L5234** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L5327** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L5526** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L5607** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L5620** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L5633** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L5646** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L5659** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L5827** | Dynamic dimension/transform property from state or props | **`VARIABLE`** | Pass property via CSS custom property style={{"--var-val": value}} and reference in utility class |
| **L6016** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L6346** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L6855** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L7369** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L7556** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L7689** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L7817** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L8005** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L8261** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L8969** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L9636** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L10369** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L10516** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L10689** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L10961** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L11161** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L11221** | Imperative DOM style mutation | **`REPLACEABLE LOGIC`** | Use CSS class toggling or data-state attributes |
| **L11227** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L11451** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L11796** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L12106** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L12281** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L13700** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L13937** | Dynamic color / background / image theme property from state or props | **`VARIABLE`** | Pass property via single CSS variable style={{"--theme-bg": value}} and style with var(--theme-bg) |
| **L14003** | Dynamic color / background / image theme property from state or props | **`VARIABLE`** | Pass property via single CSS variable style={{"--theme-bg": value}} and style with var(--theme-bg) |
| **L14073** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L14786** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L14887** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L15992** | Imperative DOM style mutation | **`REPLACEABLE LOGIC`** | Use CSS class toggling or data-state attributes |
| **L16267** | Imperative DOM style mutation | **`REPLACEABLE LOGIC`** | Use CSS class toggling or data-state attributes |
| **L16366** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L16388** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L16402** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L16505** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L16610** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L16767** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L16911** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L17339** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L17365** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L17377** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L17440** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L17646** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L17852** | Dynamic color / background / image theme property from state or props | **`VARIABLE`** | Pass property via single CSS variable style={{"--theme-bg": value}} and style with var(--theme-bg) |
| **L18244** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L18331** | Embedded JSX <style> tag | **`STATIC`** | Extract CSS keyframes/rules into src/styles/animations.css or src/app/globals.css |
| **L19045** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |

---

### 📄 `src/app/style-guide/page.tsx` (54 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L254** | Required dynamic/exempt JS styling in exempt file | **`KEEP IN JS`** | Keep inline style in JS |
| **L1715** | Imperative DOM style mutation in exempt component/file | **`KEEP IN JS`** | Keep imperative DOM styling in JS |
| **L1719** | Imperative DOM style mutation in exempt component/file | **`KEEP IN JS`** | Keep imperative DOM styling in JS |
| **L1723** | Imperative DOM style mutation in exempt component/file | **`KEEP IN JS`** | Keep imperative DOM styling in JS |
| **L2416** | Embedded JSX <style> tag | **`KEEP IN JS`** | Keep embedded <style> in server response / API route |
| **L3054** | Required dynamic/exempt JS styling in exempt file | **`KEEP IN JS`** | Keep inline style in JS |
| **L3062** | Required dynamic/exempt JS styling in exempt file | **`KEEP IN JS`** | Keep inline style in JS |
| **L3299** | Required dynamic/exempt JS styling in exempt file | **`KEEP IN JS`** | Keep inline style in JS |
| **L3341** | Required dynamic/exempt JS styling in exempt file | **`KEEP IN JS`** | Keep inline style in JS |
| **L3379** | Required dynamic/exempt JS styling in exempt file | **`KEEP IN JS`** | Keep inline style in JS |
| **L3410** | Required dynamic/exempt JS styling in exempt file | **`KEEP IN JS`** | Keep inline style in JS |
| **L3442** | Required dynamic/exempt JS styling in exempt file | **`KEEP IN JS`** | Keep inline style in JS |
| **L3464** | Required dynamic/exempt JS styling in exempt file | **`KEEP IN JS`** | Keep inline style in JS |
| **L3472** | Required dynamic/exempt JS styling in exempt file | **`KEEP IN JS`** | Keep inline style in JS |
| **L3484** | Required dynamic/exempt JS styling in exempt file | **`KEEP IN JS`** | Keep inline style in JS |
| **L3494** | Required dynamic/exempt JS styling in exempt file | **`KEEP IN JS`** | Keep inline style in JS |
| **L3508** | Required dynamic/exempt JS styling in exempt file | **`KEEP IN JS`** | Keep inline style in JS |
| **L3535** | Required dynamic/exempt JS styling in exempt file | **`KEEP IN JS`** | Keep inline style in JS |
| **L3556** | Required dynamic/exempt JS styling in exempt file | **`KEEP IN JS`** | Keep inline style in JS |
| **L3564** | Required dynamic/exempt JS styling in exempt file | **`KEEP IN JS`** | Keep inline style in JS |
| **L3577** | Required dynamic/exempt JS styling in exempt file | **`KEEP IN JS`** | Keep inline style in JS |
| **L3590** | Required dynamic/exempt JS styling in exempt file | **`KEEP IN JS`** | Keep inline style in JS |
| **L3606** | Required dynamic/exempt JS styling in exempt file | **`KEEP IN JS`** | Keep inline style in JS |
| **L3627** | Required dynamic/exempt JS styling in exempt file | **`KEEP IN JS`** | Keep inline style in JS |
| **L3662** | Required dynamic/exempt JS styling in exempt file | **`KEEP IN JS`** | Keep inline style in JS |
| **L3676** | Required dynamic/exempt JS styling in exempt file | **`KEEP IN JS`** | Keep inline style in JS |
| **L3690** | Required dynamic/exempt JS styling in exempt file | **`KEEP IN JS`** | Keep inline style in JS |
| **L3698** | Required dynamic/exempt JS styling in exempt file | **`KEEP IN JS`** | Keep inline style in JS |
| **L3710** | Required dynamic/exempt JS styling in exempt file | **`KEEP IN JS`** | Keep inline style in JS |
| **L3720** | Required dynamic/exempt JS styling in exempt file | **`KEEP IN JS`** | Keep inline style in JS |
| **L3734** | Required dynamic/exempt JS styling in exempt file | **`KEEP IN JS`** | Keep inline style in JS |
| **L3760** | Required dynamic/exempt JS styling in exempt file | **`KEEP IN JS`** | Keep inline style in JS |
| **L3782** | Required dynamic/exempt JS styling in exempt file | **`KEEP IN JS`** | Keep inline style in JS |
| **L3790** | Required dynamic/exempt JS styling in exempt file | **`KEEP IN JS`** | Keep inline style in JS |
| **L3802** | Required dynamic/exempt JS styling in exempt file | **`KEEP IN JS`** | Keep inline style in JS |
| **L3812** | Required dynamic/exempt JS styling in exempt file | **`KEEP IN JS`** | Keep inline style in JS |
| **L3826** | Required dynamic/exempt JS styling in exempt file | **`KEEP IN JS`** | Keep inline style in JS |
| **L3864** | Required dynamic/exempt JS styling in exempt file | **`KEEP IN JS`** | Keep inline style in JS |
| **L3960** | Required dynamic/exempt JS styling in exempt file | **`KEEP IN JS`** | Keep inline style in JS |
| **L4004** | Required dynamic/exempt JS styling in exempt file | **`KEEP IN JS`** | Keep inline style in JS |
| **L4028** | Required dynamic/exempt JS styling in exempt file | **`KEEP IN JS`** | Keep inline style in JS |
| **L4305** | Required dynamic/exempt JS styling in exempt file | **`KEEP IN JS`** | Keep inline style in JS |
| **L4784** | Required dynamic/exempt JS styling in exempt file | **`KEEP IN JS`** | Keep inline style in JS |
| **L4833** | Required dynamic/exempt JS styling in exempt file | **`KEEP IN JS`** | Keep inline style in JS |
| **L5096** | Required dynamic/exempt JS styling in exempt file | **`KEEP IN JS`** | Keep inline style in JS |
| **L5153** | Required dynamic/exempt JS styling in exempt file | **`KEEP IN JS`** | Keep inline style in JS |
| **L5282** | Required dynamic/exempt JS styling in exempt file | **`KEEP IN JS`** | Keep inline style in JS |
| **L5309** | Required dynamic/exempt JS styling in exempt file | **`KEEP IN JS`** | Keep inline style in JS |
| **L5708** | Required dynamic/exempt JS styling in exempt file | **`KEEP IN JS`** | Keep inline style in JS |
| **L5837** | Required dynamic/exempt JS styling in exempt file | **`KEEP IN JS`** | Keep inline style in JS |
| **L5904** | Required dynamic/exempt JS styling in exempt file | **`KEEP IN JS`** | Keep inline style in JS |
| **L5923** | Required dynamic/exempt JS styling in exempt file | **`KEEP IN JS`** | Keep inline style in JS |
| **L5935** | Required dynamic/exempt JS styling in exempt file | **`KEEP IN JS`** | Keep inline style in JS |
| **L6743** | Required dynamic/exempt JS styling in exempt file | **`KEEP IN JS`** | Keep inline style in JS |

---

### 📄 `src/components/BioParallaxSlider.tsx` (53 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L567** | Imperative DOM style mutation | **`REPLACEABLE LOGIC [DONE]`** | Use CSS class toggling or data-state attributes |
| **L568** | Imperative DOM style mutation | **`REPLACEABLE LOGIC [DONE]`** | Use CSS class toggling or data-state attributes |
| **L570** | Imperative body scroll lock DOM mutation | **`REPLACEABLE LOGIC [DONE]`** | Replace with pure CSS scroll locking via body:has([data-scroll-locked="true"]) { overflow: hidden; } |
| **L571** | Imperative body scroll lock DOM mutation | **`REPLACEABLE LOGIC [DONE]`** | Replace with pure CSS scroll locking via body:has([data-scroll-locked="true"]) { overflow: hidden; } |
| **L580** | Imperative DOM style mutation | **`REPLACEABLE LOGIC [DONE]`** | Use CSS class toggling or data-state attributes |
| **L581** | Imperative DOM style mutation | **`REPLACEABLE LOGIC [DONE]`** | Use CSS class toggling or data-state attributes |
| **L825** | Imperative DOM style mutation | **`REPLACEABLE LOGIC [DONE]`** | Use CSS class toggling or data-state attributes |
| **L829** | Imperative DOM style mutation | **`REPLACEABLE LOGIC [DONE]`** | Use CSS class toggling or data-state attributes |
| **L1203** | Imperative DOM transform / transition mutation | **`REPLACEABLE LOGIC [DONE]`** | Toggle CSS active class (e.g. .is-active) and define transitions in CSS |
| **L1229** | Imperative DOM transform / transition mutation | **`REPLACEABLE LOGIC [DONE]`** | Toggle CSS active class (e.g. .is-active) and define transitions in CSS |
| **L1230** | Imperative DOM transform / transition mutation | **`REPLACEABLE LOGIC [DONE]`** | Toggle CSS active class (e.g. .is-active) and define transitions in CSS |
| **L1231** | Imperative DOM style mutation | **`REPLACEABLE LOGIC [DONE]`** | Use CSS class toggling or data-state attributes |
| **L1232** | Imperative DOM style mutation | **`REPLACEABLE LOGIC [DONE]`** | Use CSS class toggling or data-state attributes |
| **L1241** | Imperative DOM transform / transition mutation | **`REPLACEABLE LOGIC [DONE]`** | Toggle CSS active class (e.g. .is-active) and define transitions in CSS |
| **L1242** | Imperative DOM transform / transition mutation | **`REPLACEABLE LOGIC [DONE]`** | Toggle CSS active class (e.g. .is-active) and define transitions in CSS |
| **L1243** | Imperative DOM style mutation | **`REPLACEABLE LOGIC [DONE]`** | Use CSS class toggling or data-state attributes |
| **L1244** | Imperative DOM style mutation | **`REPLACEABLE LOGIC [DONE]`** | Use CSS class toggling or data-state attributes |
| **L2006** | Dynamic dimension/transform property from state or props | **`VARIABLE [DONE]`** | Pass property via CSS custom property style={{"--var-val": value}} and reference in utility class |
| **L2024** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L2055** | Dynamic dimension/transform property from state or props | **`VARIABLE [DONE]`** | Pass property via CSS custom property style={{"--var-val": value}} and reference in utility class |
| **L2083** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L2112** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L2123** | Dynamic dimension/transform property from state or props | **`VARIABLE [DONE]`** | Pass property via CSS custom property style={{"--var-val": value}} and reference in utility class |
| **L2154** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L2168** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L2177** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L2199** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L2216** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L2225** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L2281** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L2296** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L2302** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L2312** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L2318** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L2323** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L2333** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L2341** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L2347** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L2357** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L2369** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L2374** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L2384** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L2390** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L2395** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L2405** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L2420** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L2426** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L2436** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L2442** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L2447** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L2457** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L2465** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L2471** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |

---

### 📄 `src/app/live/LiveHubClient.tsx` (45 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L190** | Imperative DOM style mutation | **`REPLACEABLE LOGIC`** | Use CSS class toggling or data-state attributes |
| **L191** | Imperative DOM style mutation | **`REPLACEABLE LOGIC`** | Use CSS class toggling or data-state attributes |
| **L203** | Imperative DOM style mutation | **`REPLACEABLE LOGIC`** | Use CSS class toggling or data-state attributes |
| **L204** | Imperative DOM style mutation | **`REPLACEABLE LOGIC`** | Use CSS class toggling or data-state attributes |
| **L294** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L302** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L318** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L321** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L328** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L336** | Dynamic color / background / image theme property from state or props | **`VARIABLE`** | Pass property via single CSS variable style={{"--theme-bg": value}} and style with var(--theme-bg) |
| **L342** | Dynamic color / background / image theme property from state or props | **`VARIABLE`** | Pass property via single CSS variable style={{"--theme-bg": value}} and style with var(--theme-bg) |
| **L349** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L360** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L367** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L407** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L427** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L434** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L448** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L455** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L473** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L499** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L512** | Dynamic color / background / image theme property from state or props | **`VARIABLE`** | Pass property via single CSS variable style={{"--theme-bg": value}} and style with var(--theme-bg) |
| **L518** | Dynamic color / background / image theme property from state or props | **`VARIABLE`** | Pass property via single CSS variable style={{"--theme-bg": value}} and style with var(--theme-bg) |
| **L522** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L534** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L546** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L556** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L571** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L584** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L596** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L610** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L617** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L626** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L630** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L645** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L668** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L678** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L686** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L714** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L724** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L732** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L738** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L761** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L791** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L807** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |

---

### 📄 `src/components/PageTransition.tsx` (37 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L364** | Static opacity inline style | **`STATIC`** | Replace with Tailwind opacity class (e.g. opacity-15 or opacity-[value]) |
| **L533** | Imperative DOM style mutation | **`REPLACEABLE LOGIC`** | Use CSS class toggling or data-state attributes |
| **L545** | Imperative DOM style mutation | **`REPLACEABLE LOGIC`** | Use CSS class toggling or data-state attributes |
| **L553** | Imperative DOM style mutation | **`REPLACEABLE LOGIC`** | Use CSS class toggling or data-state attributes |
| **L564** | Imperative DOM transform / transition mutation | **`REPLACEABLE LOGIC`** | Toggle CSS active class (e.g. .is-active) and define transitions in CSS |
| **L591** | Imperative DOM transform / transition mutation | **`REPLACEABLE LOGIC`** | Toggle CSS active class (e.g. .is-active) and define transitions in CSS |
| **L595** | Imperative DOM style mutation | **`REPLACEABLE LOGIC`** | Use CSS class toggling or data-state attributes |
| **L596** | Imperative DOM style mutation | **`REPLACEABLE LOGIC`** | Use CSS class toggling or data-state attributes |
| **L597** | Imperative DOM style mutation | **`REPLACEABLE LOGIC`** | Use CSS class toggling or data-state attributes |
| **L601** | Imperative DOM transform / transition mutation | **`REPLACEABLE LOGIC`** | Toggle CSS active class (e.g. .is-active) and define transitions in CSS |
| **L658** | Imperative DOM transform / transition mutation | **`REPLACEABLE LOGIC`** | Toggle CSS active class (e.g. .is-active) and define transitions in CSS |
| **L669** | Imperative DOM transform / transition mutation | **`REPLACEABLE LOGIC`** | Toggle CSS active class (e.g. .is-active) and define transitions in CSS |
| **L670** | Imperative DOM style mutation | **`REPLACEABLE LOGIC`** | Use CSS class toggling or data-state attributes |
| **L674** | Imperative DOM style mutation | **`REPLACEABLE LOGIC`** | Use CSS class toggling or data-state attributes |
| **L681** | Imperative DOM transform / transition mutation | **`REPLACEABLE LOGIC`** | Toggle CSS active class (e.g. .is-active) and define transitions in CSS |
| **L692** | Imperative DOM transform / transition mutation | **`REPLACEABLE LOGIC`** | Toggle CSS active class (e.g. .is-active) and define transitions in CSS |
| **L693** | Imperative DOM style mutation | **`REPLACEABLE LOGIC`** | Use CSS class toggling or data-state attributes |
| **L706** | Imperative DOM transform / transition mutation | **`REPLACEABLE LOGIC`** | Toggle CSS active class (e.g. .is-active) and define transitions in CSS |
| **L708** | Imperative DOM style mutation | **`REPLACEABLE LOGIC`** | Use CSS class toggling or data-state attributes |
| **L709** | Imperative DOM style mutation | **`REPLACEABLE LOGIC`** | Use CSS class toggling or data-state attributes |
| **L712** | Imperative DOM transform / transition mutation | **`REPLACEABLE LOGIC`** | Toggle CSS active class (e.g. .is-active) and define transitions in CSS |
| **L713** | Imperative DOM style mutation | **`REPLACEABLE LOGIC`** | Use CSS class toggling or data-state attributes |
| **L714** | Imperative DOM style mutation | **`REPLACEABLE LOGIC`** | Use CSS class toggling or data-state attributes |
| **L715** | Imperative DOM transform / transition mutation | **`REPLACEABLE LOGIC`** | Toggle CSS active class (e.g. .is-active) and define transitions in CSS |
| **L772** | Imperative DOM style mutation | **`REPLACEABLE LOGIC`** | Use CSS class toggling or data-state attributes |
| **L773** | Imperative DOM style mutation | **`REPLACEABLE LOGIC`** | Use CSS class toggling or data-state attributes |
| **L774** | Imperative DOM style mutation | **`REPLACEABLE LOGIC`** | Use CSS class toggling or data-state attributes |
| **L775** | Imperative body scroll lock DOM mutation | **`REPLACEABLE LOGIC`** | Replace with pure CSS scroll locking via body:has([data-scroll-locked="true"]) { overflow: hidden; } |
| **L776** | Imperative DOM transform / transition mutation | **`REPLACEABLE LOGIC`** | Toggle CSS active class (e.g. .is-active) and define transitions in CSS |
| **L778** | Imperative DOM style mutation | **`REPLACEABLE LOGIC`** | Use CSS class toggling or data-state attributes |
| **L802** | Imperative DOM transform / transition mutation | **`REPLACEABLE LOGIC`** | Toggle CSS active class (e.g. .is-active) and define transitions in CSS |
| **L804** | Imperative DOM style mutation | **`REPLACEABLE LOGIC`** | Use CSS class toggling or data-state attributes |
| **L807** | Imperative DOM transform / transition mutation | **`REPLACEABLE LOGIC`** | Toggle CSS active class (e.g. .is-active) and define transitions in CSS |
| **L808** | Imperative DOM style mutation | **`REPLACEABLE LOGIC`** | Use CSS class toggling or data-state attributes |
| **L912** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L924** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L934** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |

---

### 📄 `src/components/InputStyleEditor.tsx` (31 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L259** | Imperative DOM style mutation in exempt component/file | **`KEEP IN JS`** | Keep imperative DOM styling in JS |
| **L260** | Imperative DOM style mutation in exempt component/file | **`KEEP IN JS`** | Keep imperative DOM styling in JS |
| **L261** | Imperative DOM style mutation in exempt component/file | **`KEEP IN JS`** | Keep imperative DOM styling in JS |
| **L262** | Imperative DOM style mutation in exempt component/file | **`KEEP IN JS`** | Keep imperative DOM styling in JS |
| **L263** | Imperative DOM style mutation in exempt component/file | **`KEEP IN JS`** | Keep imperative DOM styling in JS |
| **L264** | Imperative DOM style mutation in exempt component/file | **`KEEP IN JS`** | Keep imperative DOM styling in JS |
| **L265** | Imperative DOM style mutation in exempt component/file | **`KEEP IN JS`** | Keep imperative DOM styling in JS |
| **L266** | Imperative DOM style mutation in exempt component/file | **`KEEP IN JS`** | Keep imperative DOM styling in JS |
| **L267** | Imperative DOM style mutation in exempt component/file | **`KEEP IN JS`** | Keep imperative DOM styling in JS |
| **L268** | Imperative DOM style mutation in exempt component/file | **`KEEP IN JS`** | Keep imperative DOM styling in JS |
| **L272** | Imperative DOM style mutation in exempt component/file | **`KEEP IN JS`** | Keep imperative DOM styling in JS |
| **L273** | Imperative DOM style mutation in exempt component/file | **`KEEP IN JS`** | Keep imperative DOM styling in JS |
| **L277** | Imperative DOM style mutation in exempt component/file | **`KEEP IN JS`** | Keep imperative DOM styling in JS |
| **L278** | Imperative DOM style mutation in exempt component/file | **`KEEP IN JS`** | Keep imperative DOM styling in JS |
| **L281** | Imperative DOM style mutation in exempt component/file | **`KEEP IN JS`** | Keep imperative DOM styling in JS |
| **L285** | Imperative DOM style mutation in exempt component/file | **`KEEP IN JS`** | Keep imperative DOM styling in JS |
| **L289** | Imperative DOM style mutation in exempt component/file | **`KEEP IN JS`** | Keep imperative DOM styling in JS |
| **L290** | Imperative DOM style mutation in exempt component/file | **`KEEP IN JS`** | Keep imperative DOM styling in JS |
| **L294** | Imperative DOM style mutation in exempt component/file | **`KEEP IN JS`** | Keep imperative DOM styling in JS |
| **L298** | Imperative DOM style mutation in exempt component/file | **`KEEP IN JS`** | Keep imperative DOM styling in JS |
| **L299** | Imperative DOM style mutation in exempt component/file | **`KEEP IN JS`** | Keep imperative DOM styling in JS |
| **L303** | Imperative DOM style mutation in exempt component/file | **`KEEP IN JS`** | Keep imperative DOM styling in JS |
| **L306** | Imperative DOM style mutation in exempt component/file | **`KEEP IN JS`** | Keep imperative DOM styling in JS |
| **L310** | Imperative DOM style mutation in exempt component/file | **`KEEP IN JS`** | Keep imperative DOM styling in JS |
| **L311** | Imperative DOM style mutation in exempt component/file | **`KEEP IN JS`** | Keep imperative DOM styling in JS |
| **L317** | Imperative DOM style mutation in exempt component/file | **`KEEP IN JS`** | Keep imperative DOM styling in JS |
| **L318** | Imperative DOM style mutation in exempt component/file | **`KEEP IN JS`** | Keep imperative DOM styling in JS |
| **L322** | Imperative DOM style mutation in exempt component/file | **`KEEP IN JS`** | Keep imperative DOM styling in JS |
| **L323** | Imperative DOM style mutation in exempt component/file | **`KEEP IN JS`** | Keep imperative DOM styling in JS |
| **L951** | Required dynamic/exempt JS styling in exempt file | **`KEEP IN JS`** | Keep inline style in JS |
| **L964** | Required dynamic/exempt JS styling in exempt file | **`KEEP IN JS`** | Keep inline style in JS |

---

### 📄 `src/components/Header.tsx` (30 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L293** | Imperative DOM transform / transition mutation | **`REPLACEABLE LOGIC [DONE]`** | Toggle CSS active class (e.g. .is-active) and define transitions in CSS |
| **L294** | Imperative DOM transform / transition mutation | **`REPLACEABLE LOGIC [DONE]`** | Toggle CSS active class (e.g. .is-active) and define transitions in CSS |
| **L295** | Imperative DOM transform / transition mutation | **`REPLACEABLE LOGIC [DONE]`** | Toggle CSS active class (e.g. .is-active) and define transitions in CSS |
| **L299** | Imperative DOM transform / transition mutation | **`REPLACEABLE LOGIC [DONE]`** | Toggle CSS active class (e.g. .is-active) and define transitions in CSS |
| **L300** | Imperative DOM transform / transition mutation | **`REPLACEABLE LOGIC [DONE]`** | Toggle CSS active class (e.g. .is-active) and define transitions in CSS |
| **L303** | Imperative DOM transform / transition mutation | **`REPLACEABLE LOGIC [DONE]`** | Toggle CSS active class (e.g. .is-active) and define transitions in CSS |
| **L304** | Imperative DOM transform / transition mutation | **`REPLACEABLE LOGIC [DONE]`** | Toggle CSS active class (e.g. .is-active) and define transitions in CSS |
| **L305** | Imperative DOM transform / transition mutation | **`REPLACEABLE LOGIC [DONE]`** | Toggle CSS active class (e.g. .is-active) and define transitions in CSS |
| **L312** | Imperative DOM transform / transition mutation | **`REPLACEABLE LOGIC [DONE]`** | Toggle CSS active class (e.g. .is-active) and define transitions in CSS |
| **L328** | Imperative DOM transform / transition mutation | **`REPLACEABLE LOGIC [DONE]`** | Toggle CSS active class (e.g. .is-active) and define transitions in CSS |
| **L329** | Imperative DOM transform / transition mutation | **`REPLACEABLE LOGIC [DONE]`** | Toggle CSS active class (e.g. .is-active) and define transitions in CSS |
| **L330** | Imperative DOM transform / transition mutation | **`REPLACEABLE LOGIC [DONE]`** | Toggle CSS active class (e.g. .is-active) and define transitions in CSS |
| **L430** | Imperative body scroll lock DOM mutation | **`REPLACEABLE LOGIC [DONE]`** | Replace with pure CSS scroll locking via body:has([data-scroll-locked="true"]) { overflow: hidden; } |
| **L431** | Imperative body scroll lock DOM mutation | **`REPLACEABLE LOGIC [DONE]`** | Replace with pure CSS scroll locking via body:has([data-scroll-locked="true"]) { overflow: hidden; } |
| **L438** | Imperative body scroll lock DOM mutation | **`REPLACEABLE LOGIC [DONE]`** | Replace with pure CSS scroll locking via body:has([data-scroll-locked="true"]) { overflow: hidden; } |
| **L439** | Imperative body scroll lock DOM mutation | **`REPLACEABLE LOGIC [DONE]`** | Replace with pure CSS scroll locking via body:has([data-scroll-locked="true"]) { overflow: hidden; } |
| **L447** | Imperative body scroll lock DOM mutation | **`REPLACEABLE LOGIC [DONE]`** | Replace with pure CSS scroll locking via body:has([data-scroll-locked="true"]) { overflow: hidden; } |
| **L448** | Imperative body scroll lock DOM mutation | **`REPLACEABLE LOGIC [DONE]`** | Replace with pure CSS scroll locking via body:has([data-scroll-locked="true"]) { overflow: hidden; } |
| **L717** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L733** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L744** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L768** | Static layout / geometry inline style | **`STATIC`** | Replace with standard Tailwind utility classes (e.g. h-full, w-full, relative, rounded-full) |
| **L828** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L847** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L861** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L903** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L920** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L979** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L1054** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L1077** | Static layout / geometry inline style | **`STATIC`** | Replace with standard Tailwind utility classes (e.g. h-full, w-full, relative, rounded-full) |

---

### 📄 `src/app/planner/verify/PlannerVerifyClient.tsx` (26 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L14** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L27** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L231** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L250** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L252** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L273** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L289** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L303** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L313** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L331** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L333** | Static layout / geometry inline style | **`STATIC [DONE]`** | Replace with standard Tailwind utility classes (e.g. h-full, w-full, relative, rounded-full) |
| **L336** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L356** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L372** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L388** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L411** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L442** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L465** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L483** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L511** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L521** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L529** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L550** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L567** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L575** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |
| **L627** | Static inline style object | **`STATIC [DONE]`** | Replace with equivalent Tailwind utility class |

---

### 📄 `src/app/admin/[username]/components/AdminSectionCrewSchedule.tsx` (23 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L847** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L1133** | Dynamic color / background / image theme property from state or props | **`VARIABLE`** | Pass property via single CSS variable style={{"--theme-bg": value}} and style with var(--theme-bg) |
| **L1215** | Dynamic color / background / image theme property from state or props | **`VARIABLE`** | Pass property via single CSS variable style={{"--theme-bg": value}} and style with var(--theme-bg) |
| **L1285** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L2038** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L2134** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L2969** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L3268** | Imperative DOM style mutation | **`REPLACEABLE LOGIC`** | Use CSS class toggling or data-state attributes |
| **L3546** | Imperative DOM style mutation | **`REPLACEABLE LOGIC`** | Use CSS class toggling or data-state attributes |
| **L3652** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L3680** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L3694** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L3799** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L3906** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L4075** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L4228** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L4653** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L4680** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L4692** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L4747** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L4901** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L4957** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L5168** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |

---

### 📄 `src/components/CrewSetPasswordModal.tsx` (23 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L61** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L74** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L87** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L100** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L117** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L136** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L148** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L159** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L174** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L187** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L192** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L194** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L208** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L228** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L242** | Imperative DOM style mutation | **`REPLACEABLE LOGIC`** | Use CSS class toggling or data-state attributes |
| **L245** | Imperative DOM style mutation | **`REPLACEABLE LOGIC`** | Use CSS class toggling or data-state attributes |
| **L252** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L272** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L286** | Imperative DOM style mutation | **`REPLACEABLE LOGIC`** | Use CSS class toggling or data-state attributes |
| **L289** | Imperative DOM style mutation | **`REPLACEABLE LOGIC`** | Use CSS class toggling or data-state attributes |
| **L296** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L315** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L342** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |

---

### 📄 `src/components/CruiseHistoryTimeline.tsx` (23 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L241** | Imperative DOM style mutation | **`REPLACEABLE LOGIC [DONE]`** | Use CSS class toggling or data-state attributes |
| **L264** | Imperative DOM style mutation | **`REPLACEABLE LOGIC [DONE]`** | Use CSS class toggling or data-state attributes |
| **L265** | Imperative DOM style mutation | **`REPLACEABLE LOGIC [DONE]`** | Use CSS class toggling or data-state attributes |
| **L266** | Imperative DOM style mutation | **`REPLACEABLE LOGIC [DONE]`** | Use CSS class toggling or data-state attributes |
| **L267** | Imperative DOM transform / transition mutation | **`REPLACEABLE LOGIC [DONE]`** | Toggle CSS active class (e.g. .is-active) and define transitions in CSS |
| **L268** | Imperative DOM style mutation | **`REPLACEABLE LOGIC [DONE]`** | Use CSS class toggling or data-state attributes |
| **L269** | Imperative DOM style mutation | **`REPLACEABLE LOGIC [DONE]`** | Use CSS class toggling or data-state attributes |
| **L637** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L667** | Static layout / geometry inline style | **`STATIC`** | Replace with standard Tailwind utility classes (e.g. h-full, w-full, relative, rounded-full) |
| **L745** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L758** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L772** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L829** | Static fluid clamp inline style | **`STATIC`** | Replace with Tailwind arbitrary clamp class (e.g. h-[clamp(...)]) |
| **L865** | Static fluid clamp inline style | **`STATIC`** | Replace with Tailwind arbitrary clamp class (e.g. h-[clamp(...)]) |
| **L870** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L877** | Static fluid clamp inline style | **`STATIC`** | Replace with Tailwind arbitrary clamp class (e.g. h-[clamp(...)]) |
| **L907** | Static fluid clamp inline style | **`STATIC`** | Replace with Tailwind arbitrary clamp class (e.g. h-[clamp(...)]) |
| **L934** | Static fluid clamp inline style | **`STATIC`** | Replace with Tailwind arbitrary clamp class (e.g. h-[clamp(...)]) |
| **L938** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L943** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L954** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L962** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L1345** | Dynamic color / background / image theme property from state or props | **`VARIABLE [DONE]`** | Pass property via single CSS variable style={{"--theme-bg": value}} and style with var(--theme-bg) |

---

### 📄 `src/app/admin/page.tsx` (17 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L42** | Imperative body scroll lock DOM mutation | **`REPLACEABLE LOGIC`** | Replace with pure CSS scroll locking via body:has([data-scroll-locked="true"]) { overflow: hidden; } |
| **L43** | Imperative body scroll lock DOM mutation | **`REPLACEABLE LOGIC`** | Replace with pure CSS scroll locking via body:has([data-scroll-locked="true"]) { overflow: hidden; } |
| **L45** | Imperative body scroll lock DOM mutation | **`REPLACEABLE LOGIC`** | Replace with pure CSS scroll locking via body:has([data-scroll-locked="true"]) { overflow: hidden; } |
| **L46** | Imperative body scroll lock DOM mutation | **`REPLACEABLE LOGIC`** | Replace with pure CSS scroll locking via body:has([data-scroll-locked="true"]) { overflow: hidden; } |
| **L254** | Static layout / geometry inline style | **`STATIC`** | Replace with standard Tailwind utility classes (e.g. h-full, w-full, relative, rounded-full) |
| **L258** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L431** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L470** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L491** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L515** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L527** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L546** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L563** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L579** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L588** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L595** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L606** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |

---

### 📄 `src/components/AudioPlayer.tsx` (17 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L423** | Static fluid clamp inline style | **`STATIC`** | Replace with Tailwind arbitrary clamp class (e.g. h-[clamp(...)]) |
| **L457** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L631** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L701** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L717** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L742** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L778** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L884** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L900** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L909** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L929** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L1101** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L1235** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L1243** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L1316** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L1324** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L1401** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |

---

### 📄 `src/components/FakeLiveStream/GoingLiveOverlay.tsx` (17 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L40** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L48** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L60** | Static layout / geometry inline style | **`STATIC`** | Replace with standard Tailwind utility classes (e.g. h-full, w-full, relative, rounded-full) |
| **L63** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L73** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L83** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L94** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L99** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L113** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L124** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L134** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L149** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L160** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L178** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L194** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L211** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L232** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |

---

### 📄 `src/components/CruiseSnakeItinerary.tsx` (16 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L575** | Imperative DOM style mutation | **`REPLACEABLE LOGIC [DONE]`** | Use CSS class toggling or data-state attributes |
| **L640** | Imperative DOM style mutation | **`REPLACEABLE LOGIC [DONE]`** | Use CSS class toggling or data-state attributes |
| **L716** | Imperative DOM style mutation | **`REPLACEABLE LOGIC [DONE]`** | Use CSS class toggling or data-state attributes |
| **L717** | Imperative DOM style mutation | **`REPLACEABLE LOGIC [DONE]`** | Use CSS class toggling or data-state attributes |
| **L718** | Imperative DOM transform / transition mutation | **`REPLACEABLE LOGIC [DONE]`** | Toggle CSS active class (e.g. .is-active) and define transitions in CSS |
| **L719** | Imperative DOM style mutation | **`REPLACEABLE LOGIC [DONE]`** | Use CSS class toggling or data-state attributes |
| **L1322** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L1335** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L1351** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L1362** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L1375** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L1388** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L1563** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L1589** | Static layout / geometry inline style | **`STATIC`** | Replace with standard Tailwind utility classes (e.g. h-full, w-full, relative, rounded-full) |
| **L1643** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L1670** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |

---

### 📄 `src/components/VinylHeroPlayer.tsx` (16 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L444** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L824** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L830** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L850** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L870** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L880** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L893** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L927** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L991** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L998** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L1004** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L1022** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L1030** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L1057** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L1069** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L1091** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |

---

### 📄 `src/app/features/page.tsx` (12 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L57** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L60** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L90** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L105** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L109** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L208** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L232** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L278** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L294** | Dynamic color / background / image theme property from state or props | **`VARIABLE`** | Pass property via single CSS variable style={{"--theme-bg": value}} and style with var(--theme-bg) |
| **L310** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L318** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L321** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |

---

### 📄 `src/components/CustomScrollbar.tsx` (12 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L74** | Imperative DOM style mutation in exempt component/file | **`KEEP IN JS`** | Keep imperative DOM styling in JS |
| **L75** | Imperative DOM style mutation in exempt component/file | **`KEEP IN JS`** | Keep imperative DOM styling in JS |
| **L104** | Imperative DOM style mutation in exempt component/file | **`KEEP IN JS`** | Keep imperative DOM styling in JS |
| **L105** | Imperative DOM style mutation in exempt component/file | **`KEEP IN JS`** | Keep imperative DOM styling in JS |
| **L241** | Required dynamic/exempt JS styling in exempt file | **`KEEP IN JS`** | Keep inline style in JS |
| **L256** | Required dynamic/exempt JS styling in exempt file | **`KEEP IN JS`** | Keep inline style in JS |
| **L279** | Required dynamic/exempt JS styling in exempt file | **`KEEP IN JS`** | Keep inline style in JS |
| **L297** | Required dynamic/exempt JS styling in exempt file | **`KEEP IN JS`** | Keep inline style in JS |
| **L323** | Required dynamic/exempt JS styling in exempt file | **`KEEP IN JS`** | Keep inline style in JS |
| **L342** | Required dynamic/exempt JS styling in exempt file | **`KEEP IN JS`** | Keep inline style in JS |
| **L357** | Required dynamic/exempt JS styling in exempt file | **`KEEP IN JS`** | Keep inline style in JS |
| **L382** | Required dynamic/exempt JS styling in exempt file | **`KEEP IN JS`** | Keep inline style in JS |

---

### 📄 `src/components/TourMap.tsx` (12 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L729** | Imperative DOM style mutation in exempt component/file | **`KEEP IN JS`** | Keep imperative DOM styling in JS |
| **L730** | Imperative DOM style mutation in exempt component/file | **`KEEP IN JS`** | Keep imperative DOM styling in JS |
| **L734** | Imperative DOM style mutation in exempt component/file | **`KEEP IN JS`** | Keep imperative DOM styling in JS |
| **L748** | Imperative DOM style mutation in exempt component/file | **`KEEP IN JS`** | Keep imperative DOM styling in JS |
| **L772** | Imperative DOM style mutation in exempt component/file | **`KEEP IN JS`** | Keep imperative DOM styling in JS |
| **L805** | Imperative DOM style mutation in exempt component/file | **`KEEP IN JS`** | Keep imperative DOM styling in JS |
| **L806** | Imperative DOM style mutation in exempt component/file | **`KEEP IN JS`** | Keep imperative DOM styling in JS |
| **L1259** | Required dynamic/exempt JS styling in exempt file | **`KEEP IN JS`** | Keep inline style in JS |
| **L1289** | Required dynamic/exempt JS styling in exempt file | **`KEEP IN JS`** | Keep inline style in JS |
| **L1328** | Required dynamic/exempt JS styling in exempt file | **`KEEP IN JS`** | Keep inline style in JS |
| **L1416** | Required dynamic/exempt JS styling in exempt file | **`KEEP IN JS`** | Keep inline style in JS |
| **L1924** | Required dynamic/exempt JS styling in exempt file | **`KEEP IN JS`** | Keep inline style in JS |

---

### 📄 `src/components/CrewDashboard/index.tsx` (11 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L3500** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L3562** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L3581** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L3626** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L3720** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L3744** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L3754** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L3781** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L4002** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L4987** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L5282** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |

---

### 📄 `src/components/Preloader.tsx` (11 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L153** | Imperative DOM style mutation in exempt component/file | **`KEEP IN JS`** | Keep imperative DOM styling in JS |
| **L202** | Imperative DOM style mutation in exempt component/file | **`KEEP IN JS`** | Keep imperative DOM styling in JS |
| **L203** | Imperative DOM style mutation in exempt component/file | **`KEEP IN JS`** | Keep imperative DOM styling in JS |
| **L204** | Imperative DOM style mutation in exempt component/file | **`KEEP IN JS`** | Keep imperative DOM styling in JS |
| **L205** | Imperative DOM style mutation in exempt component/file | **`KEEP IN JS`** | Keep imperative DOM styling in JS |
| **L206** | Imperative DOM style mutation in exempt component/file | **`KEEP IN JS`** | Keep imperative DOM styling in JS |
| **L222** | Imperative DOM style mutation in exempt component/file | **`KEEP IN JS`** | Keep imperative DOM styling in JS |
| **L224** | Imperative DOM style mutation in exempt component/file | **`KEEP IN JS`** | Keep imperative DOM styling in JS |
| **L232** | Imperative DOM style mutation in exempt component/file | **`KEEP IN JS`** | Keep imperative DOM styling in JS |
| **L302** | Required dynamic/exempt JS styling in exempt file | **`KEEP IN JS`** | Keep inline style in JS |
| **L322** | Required dynamic/exempt JS styling in exempt file | **`KEEP IN JS`** | Keep inline style in JS |

---

### 📄 `src/components/TourList.tsx` (9 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L1323** | Imperative DOM style mutation | **`REPLACEABLE LOGIC`** | Use CSS class toggling or data-state attributes |
| **L1324** | Imperative DOM style mutation | **`REPLACEABLE LOGIC`** | Use CSS class toggling or data-state attributes |
| **L1603** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L1640** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L1649** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L1905** | Dynamic color / background / image theme property from state or props | **`VARIABLE`** | Pass property via single CSS variable style={{"--theme-bg": value}} and style with var(--theme-bg) |
| **L1944** | Dynamic color / background / image theme property from state or props | **`VARIABLE`** | Pass property via single CSS variable style={{"--theme-bg": value}} and style with var(--theme-bg) |
| **L2024** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L2877** | Static animation property inline style | **`STATIC`** | Move keyframes to src/styles/animations.css and use Tailwind animate class |

---

### 📄 `src/components/GooeyDropdown.tsx` (8 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L227** | Dynamic color / background / image theme property from state or props | **`VARIABLE`** | Pass property via single CSS variable style={{"--theme-bg": value}} and style with var(--theme-bg) |
| **L231** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L251** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L267** | Dynamic color / background / image theme property from state or props | **`VARIABLE`** | Pass property via single CSS variable style={{"--theme-bg": value}} and style with var(--theme-bg) |
| **L299** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L314** | Staggered animation delay or index offset calculation in JSX | **`REPLACEABLE LOGIC`** | Use CSS :nth-child() selectors or CSS variables --i with calc() |
| **L321** | Dynamic color / background / image theme property from state or props | **`VARIABLE`** | Pass property via single CSS variable style={{"--theme-bg": value}} and style with var(--theme-bg) |
| **L331** | Dynamic color / background / image theme property from state or props | **`VARIABLE`** | Pass property via single CSS variable style={{"--theme-bg": value}} and style with var(--theme-bg) |

---

### 📄 `src/components/CrewHQ.tsx` (7 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L686** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L746** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L771** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L872** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L887** | Dynamic color / background / image theme property from state or props | **`VARIABLE`** | Pass property via single CSS variable style={{"--theme-bg": value}} and style with var(--theme-bg) |
| **L893** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L1154** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |

---

### 📄 `src/components/HeroVideoPlayer.tsx` (7 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L580** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L596** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L604** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L616** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L642** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L664** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L743** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |

---

### 📄 `src/components/SlideupSection.tsx` (7 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L287** | Imperative DOM transform / transition mutation | **`REPLACEABLE LOGIC [DONE]`** | Toggle CSS active class (e.g. .is-active) and define transitions in CSS |
| **L297** | Imperative DOM style mutation | **`REPLACEABLE LOGIC [DONE]`** | Use CSS class toggling or data-state attributes |
| **L301** | Imperative DOM style mutation | **`REPLACEABLE LOGIC [DONE]`** | Use CSS class toggling or data-state attributes |
| **L308** | Imperative DOM style mutation | **`REPLACEABLE LOGIC [DONE]`** | Use CSS class toggling or data-state attributes |
| **L310** | Imperative DOM transform / transition mutation | **`REPLACEABLE LOGIC [DONE]`** | Toggle CSS active class (e.g. .is-active) and define transitions in CSS |
| **L311** | Imperative DOM style mutation | **`REPLACEABLE LOGIC [DONE]`** | Use CSS class toggling or data-state attributes |
| **L312** | Imperative DOM style mutation | **`REPLACEABLE LOGIC [DONE]`** | Use CSS class toggling or data-state attributes |

---

### 📄 `src/components/FeaturedTrack.tsx` (6 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L330** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L361** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L417** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L498** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L530** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L659** | Dynamic dimension/transform property from state or props | **`VARIABLE`** | Pass property via CSS custom property style={{"--var-val": value}} and reference in utility class |

---

### 📄 `src/components/HeaderMaskEditor.tsx` (6 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L43** | Imperative DOM style mutation in exempt component/file | **`KEEP IN JS`** | Keep imperative DOM styling in JS |
| **L44** | Imperative DOM style mutation in exempt component/file | **`KEEP IN JS`** | Keep imperative DOM styling in JS |
| **L48** | Imperative DOM style mutation in exempt component/file | **`KEEP IN JS`** | Keep imperative DOM styling in JS |
| **L49** | Imperative DOM style mutation in exempt component/file | **`KEEP IN JS`** | Keep imperative DOM styling in JS |
| **L50** | Imperative DOM style mutation in exempt component/file | **`KEEP IN JS`** | Keep imperative DOM styling in JS |
| **L120** | Required dynamic/exempt JS styling in exempt file | **`KEEP IN JS`** | Keep inline style in JS |

---

### 📄 `src/app/cruise/preview/page.tsx` (5 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L46** | Dynamic color / background / image theme property from state or props | **`VARIABLE`** | Pass property via single CSS variable style={{"--theme-bg": value}} and style with var(--theme-bg) |
| **L200** | Dynamic color / background / image theme property from state or props | **`VARIABLE`** | Pass property via single CSS variable style={{"--theme-bg": value}} and style with var(--theme-bg) |
| **L269** | Dynamic color / background / image theme property from state or props | **`VARIABLE`** | Pass property via single CSS variable style={{"--theme-bg": value}} and style with var(--theme-bg) |
| **L328** | Dynamic color / background / image theme property from state or props | **`VARIABLE`** | Pass property via single CSS variable style={{"--theme-bg": value}} and style with var(--theme-bg) |
| **L403** | Dynamic color / background / image theme property from state or props | **`VARIABLE`** | Pass property via single CSS variable style={{"--theme-bg": value}} and style with var(--theme-bg) |

---

### 📄 `src/app/global-error.tsx` (5 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L74** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L85** | Static layout / geometry inline style | **`STATIC`** | Replace with standard Tailwind utility classes (e.g. h-full, w-full, relative, rounded-full) |
| **L87** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L96** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L108** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |

---

### 📄 `src/app/preloaders/page.tsx` (5 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L41** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L205** | Imperative DOM transform / transition mutation | **`REPLACEABLE LOGIC`** | Toggle CSS active class (e.g. .is-active) and define transitions in CSS |
| **L235** | Imperative DOM transform / transition mutation | **`REPLACEABLE LOGIC`** | Toggle CSS active class (e.g. .is-active) and define transitions in CSS |
| **L238** | Imperative DOM transform / transition mutation | **`REPLACEABLE LOGIC`** | Toggle CSS active class (e.g. .is-active) and define transitions in CSS |
| **L265** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |

---

### 📄 `src/components/HomeVideoShowcase.tsx` (5 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L47** | JS event listener faking visual hover state | **`REPLACEABLE LOGIC`** | Use native CSS :hover pseudo-class or Tailwind hover: modifier |
| **L48** | JS event listener faking visual hover state | **`REPLACEABLE LOGIC`** | Use native CSS :hover pseudo-class or Tailwind hover: modifier |
| **L794** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L813** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L825** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |

---

### 📄 `src/app/cruise/components/CruiseCabinsPricingSection.tsx` (4 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L1353** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L1367** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L1429** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L1443** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |

---

### 📄 `src/app/fans/[username]/page.tsx` (4 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L688** | Dynamic color / background / image theme property from state or props | **`VARIABLE`** | Pass property via single CSS variable style={{"--theme-bg": value}} and style with var(--theme-bg) |
| **L694** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L713** | Dynamic color / background / image theme property from state or props | **`VARIABLE`** | Pass property via single CSS variable style={{"--theme-bg": value}} and style with var(--theme-bg) |
| **L767** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |

---

### 📄 `src/app/media/MediaClient.tsx` (4 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L134** | Dynamic color / background / image theme property from state or props | **`VARIABLE [DONE]`** | Pass property via single CSS variable style={{"--theme-bg": value}} and style with var(--theme-bg) |
| **L590** | Staggered animation delay or index offset calculation in JSX | **`REPLACEABLE LOGIC [DONE]`** | Use CSS :nth-child() selectors or CSS variables --i with calc() |
| **L596** | JS event listener faking visual hover state | **`REPLACEABLE LOGIC [DONE]`** | Use native CSS :hover pseudo-class or Tailwind hover: modifier |
| **L597** | JS event listener faking visual hover state | **`REPLACEABLE LOGIC [DONE]`** | Use native CSS :hover pseudo-class or Tailwind hover: modifier |

---

### 📄 `src/components/CrewFeed.tsx` (4 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L322** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L334** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L349** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L378** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |

---

### 📄 `src/components/CruiseWidgets.tsx` (4 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L125** | Dynamic dimension/transform property from state or props | **`VARIABLE`** | Pass property via CSS custom property style={{"--var-val": value}} and reference in utility class |
| **L181** | Dynamic dimension/transform property from state or props | **`VARIABLE`** | Pass property via CSS custom property style={{"--var-val": value}} and reference in utility class |
| **L225** | Dynamic color / background / image theme property from state or props | **`VARIABLE`** | Pass property via single CSS variable style={{"--theme-bg": value}} and style with var(--theme-bg) |
| **L1283** | Dynamic dimension/transform property from state or props | **`VARIABLE`** | Pass property via CSS custom property style={{"--var-val": value}} and reference in utility class |

---

### 📄 `src/components/CustomYTPlayer.tsx` (4 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L270** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L421** | Dynamic dimension/transform property from state or props | **`VARIABLE`** | Pass property via CSS custom property style={{"--var-val": value}} and reference in utility class |
| **L426** | Dynamic dimension/transform property from state or props | **`VARIABLE`** | Pass property via CSS custom property style={{"--var-val": value}} and reference in utility class |
| **L431** | Dynamic dimension/transform property from state or props | **`VARIABLE`** | Pass property via CSS custom property style={{"--var-val": value}} and reference in utility class |

---

### 📄 `src/components/HomeShaderGradient.tsx` (4 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L366** | Imperative DOM style mutation in exempt component/file | **`KEEP IN JS`** | Keep imperative DOM styling in JS |
| **L515** | Imperative DOM style mutation in exempt component/file | **`KEEP IN JS`** | Keep imperative DOM styling in JS |
| **L521** | Imperative DOM style mutation in exempt component/file | **`KEEP IN JS`** | Keep imperative DOM styling in JS |
| **L527** | Imperative DOM style mutation in exempt component/file | **`KEEP IN JS`** | Keep imperative DOM styling in JS |

---

### 📄 `src/components/LiveKitStream.tsx` (4 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L175** | Static layout / geometry inline style | **`STATIC`** | Replace with standard Tailwind utility classes (e.g. h-full, w-full, relative, rounded-full) |
| **L233** | Static layout / geometry inline style | **`STATIC`** | Replace with standard Tailwind utility classes (e.g. h-full, w-full, relative, rounded-full) |
| **L236** | Static layout / geometry inline style | **`STATIC`** | Replace with standard Tailwind utility classes (e.g. h-full, w-full, relative, rounded-full) |
| **L302** | Static layout / geometry inline style | **`STATIC`** | Replace with standard Tailwind utility classes (e.g. h-full, w-full, relative, rounded-full) |

---

### 📄 `src/components/LoginModal.tsx` (4 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L855** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L1053** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L1493** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L1654** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |

---

### 📄 `src/components/LogoTicker.tsx` (4 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L115** | Dynamic dimension/transform property from state or props | **`VARIABLE`** | Pass property via CSS custom property style={{"--var-val": value}} and reference in utility class |
| **L125** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L137** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L149** | Static fluid clamp inline style | **`STATIC`** | Replace with Tailwind arbitrary clamp class (e.g. h-[clamp(...)]) |

---

### 📄 `src/components/PlannerDashboard.tsx` (4 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L927** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L974** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L1021** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L1068** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |

---

### 📄 `src/app/cruise/components/CruiseHeroSection.tsx` (3 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L70** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L94** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L111** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |

---

### 📄 `src/app/features/components/FeatureCardUI.tsx` (3 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L82** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L83** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L133** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |

---

### 📄 `src/app/merch/page.tsx` (3 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L313** | Static layout / geometry inline style | **`STATIC`** | Replace with standard Tailwind utility classes (e.g. h-full, w-full, relative, rounded-full) |
| **L333** | Static layout / geometry inline style | **`STATIC`** | Replace with standard Tailwind utility classes (e.g. h-full, w-full, relative, rounded-full) |
| **L350** | Static layout / geometry inline style | **`STATIC`** | Replace with standard Tailwind utility classes (e.g. h-full, w-full, relative, rounded-full) |

---

### 📄 `src/components/CruiseChat.tsx` (3 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L684** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L786** | Dynamic dimension/transform property from state or props | **`VARIABLE`** | Pass property via CSS custom property style={{"--var-val": value}} and reference in utility class |
| **L877** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |

---

### 📄 `src/components/CustomVideoPlayer.tsx` (3 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L294** | Dynamic dimension/transform property from state or props | **`VARIABLE`** | Pass property via CSS custom property style={{"--var-val": value}} and reference in utility class |
| **L299** | Dynamic dimension/transform property from state or props | **`VARIABLE`** | Pass property via CSS custom property style={{"--var-val": value}} and reference in utility class |
| **L304** | Dynamic dimension/transform property from state or props | **`VARIABLE`** | Pass property via CSS custom property style={{"--var-val": value}} and reference in utility class |

---

### 📄 `src/components/InlineYTPlayer.tsx` (3 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L298** | Dynamic dimension/transform property from state or props | **`VARIABLE`** | Pass property via CSS custom property style={{"--var-val": value}} and reference in utility class |
| **L302** | Dynamic dimension/transform property from state or props | **`VARIABLE`** | Pass property via CSS custom property style={{"--var-val": value}} and reference in utility class |
| **L306** | Dynamic dimension/transform property from state or props | **`VARIABLE`** | Pass property via CSS custom property style={{"--var-val": value}} and reference in utility class |

---

### 📄 `src/components/PagesPillDrawer.tsx` (3 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L447** | Imperative body scroll lock DOM mutation | **`REPLACEABLE LOGIC [DONE]`** | Replace with pure CSS scroll locking via body:has([data-scroll-locked="true"]) { overflow: hidden; } |
| **L449** | Imperative body scroll lock DOM mutation | **`REPLACEABLE LOGIC [DONE]`** | Replace with pure CSS scroll locking via body:has([data-scroll-locked="true"]) { overflow: hidden; } |
| **L452** | Imperative body scroll lock DOM mutation | **`REPLACEABLE LOGIC [DONE]`** | Replace with pure CSS scroll locking via body:has([data-scroll-locked="true"]) { overflow: hidden; } |

---

### 📄 `src/components/RoleBadge.tsx` (3 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L104** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L136** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L144** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |

---

### 📄 `src/components/ui/ModalDialog.tsx` (3 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L40** | Imperative DOM style mutation | **`REPLACEABLE LOGIC`** | Use CSS class toggling or data-state attributes |
| **L41** | Imperative body scroll lock DOM mutation | **`REPLACEABLE LOGIC`** | Replace with pure CSS scroll locking via body:has([data-scroll-locked="true"]) { overflow: hidden; } |
| **L45** | Imperative DOM style mutation | **`REPLACEABLE LOGIC`** | Use CSS class toggling or data-state attributes |

---

### 📄 `src/app/api/ntfy/unsubscribe/route.ts` (2 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L24** | Embedded JSX <style> tag | **`KEEP IN JS`** | Keep embedded <style> in server response / API route |
| **L125** | Embedded JSX <style> tag | **`KEEP IN JS`** | Keep embedded <style> in server response / API route |

---

### 📄 `src/app/cruise/components/CruiseFaqSection.tsx` (2 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L44** | Static performance hinting inline styles | **`STATIC`** | Replace with CSS @utility .content-visibility-auto in globals.css |
| **L65** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |

---

### 📄 `src/app/cruise/components/CruisePortsCatalogSection.tsx` (2 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L48** | Static performance hinting inline styles | **`STATIC`** | Replace with CSS @utility .content-visibility-auto in globals.css |
| **L338** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |

---

### 📄 `src/app/cruise/verify/CruiseVerifyClient.tsx` (2 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L253** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L262** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |

---

### 📄 `src/app/not-found.tsx` (2 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L14** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L22** | Static opacity inline style | **`STATIC`** | Replace with Tailwind opacity class (e.g. opacity-15 or opacity-[value]) |

---

### 📄 `src/app/sitemap/VisualSitemapClient.tsx` (2 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L180** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L2364** | Dynamic dimension/transform property from state or props | **`VARIABLE`** | Pass property via CSS custom property style={{"--var-val": value}} and reference in utility class |

---

### 📄 `src/components/AdminFeedPost.tsx` (2 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L182** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L253** | Dynamic color / background / image theme property from state or props | **`VARIABLE`** | Pass property via single CSS variable style={{"--theme-bg": value}} and style with var(--theme-bg) |

---

### 📄 `src/components/CruiseHeroMaskEditor.tsx` (2 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L250** | Required dynamic/exempt JS styling in exempt file | **`KEEP IN JS`** | Keep inline style in JS |
| **L285** | Required dynamic/exempt JS styling in exempt file | **`KEEP IN JS`** | Keep inline style in JS |

---

### 📄 `src/components/CruiseVideoGallery.tsx` (2 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L214** | Static performance hinting inline styles | **`STATIC`** | Replace with CSS @utility .content-visibility-auto in globals.css |
| **L310** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |

---

### 📄 `src/components/NewsHeroLayouts.tsx` (2 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L57** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L108** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |

---

### 📄 `src/components/PageNav.tsx` (2 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L155** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L183** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |

---

### 📄 `src/components/PastShowsClient.tsx` (2 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L300** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L341** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |

---

### 📄 `src/components/SeventhButton.tsx` (2 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L85** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L98** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |

---

### 📄 `src/components/admin/AwardPicksPanel.tsx` (2 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L212** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |
| **L325** | Dynamic color / background / image theme property from state or props | **`VARIABLE`** | Pass property via single CSS variable style={{"--theme-bg": value}} and style with var(--theme-bg) |

---

### 📄 `src/app/admin/[username]/components/adminDashboardShared.tsx` (1 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L118** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |

---

### 📄 `src/app/admin/email-map/page.tsx` (1 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L76** | Dynamic dimension/transform property from state or props | **`VARIABLE`** | Pass property via CSS custom property style={{"--var-val": value}} and reference in utility class |

---

### 📄 `src/app/admin/emails/page.tsx` (1 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L202** | Dynamic dimension/transform property from state or props | **`VARIABLE`** | Pass property via CSS custom property style={{"--var-val": value}} and reference in utility class |

---

### 📄 `src/app/book/components/MiniDatePicker.tsx` (1 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L71** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |

---

### 📄 `src/app/claim/[pin]/page.tsx` (1 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L236** | Static layout / geometry inline style | **`STATIC`** | Replace with standard Tailwind utility classes (e.g. h-full, w-full, relative, rounded-full) |

---

### 📄 `src/app/crew/verify/CrewVerifyClient.tsx` (1 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L40** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |

---

### 📄 `src/app/cruise/[username]/page.tsx` (1 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L1236** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |

---

### 📄 `src/app/cruise/components/CruiseHistorySection.tsx` (1 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L9** | Static performance hinting inline styles | **`STATIC`** | Replace with CSS @utility .content-visibility-auto in globals.css |

---

### 📄 `src/app/cruise/components/CruiseShipExplorerSection.tsx` (1 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L37** | Static performance hinting inline styles | **`STATIC`** | Replace with CSS @utility .content-visibility-auto in globals.css |

---

### 📄 `src/app/faq/FaqClient.tsx` (1 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L352** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |

---

### 📄 `src/app/firecanvas/page.tsx` (1 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L171** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |

---

### 📄 `src/app/planner/PlannerClient.tsx` (1 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L528** | Dynamic dimension/transform property from state or props | **`VARIABLE`** | Pass property via CSS custom property style={{"--var-val": value}} and reference in utility class |

---

### 📄 `src/app/qr/merch/MerchQRClient.tsx` (1 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L318** | Static layout / geometry inline style | **`STATIC`** | Replace with standard Tailwind utility classes (e.g. h-full, w-full, relative, rounded-full) |

---

### 📄 `src/app/studio/[[...tool]]/layout.tsx` (1 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L13** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |

---

### 📄 `src/app/studio/[[...tool]]/page.tsx` (1 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L9** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |

---

### 📄 `src/components/AdminMap.tsx` (1 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L134** | Required dynamic/exempt JS styling in exempt file | **`KEEP IN JS`** | Keep inline style in JS |

---

### 📄 `src/components/CountdownTimer.tsx` (1 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L135** | Dynamic color / background / image theme property from state or props | **`VARIABLE`** | Pass property via single CSS variable style={{"--theme-bg": value}} and style with var(--theme-bg) |

---

### 📄 `src/components/CruiseWaveAnimation.tsx` (1 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L40** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |

---

### 📄 `src/components/DevGuideLine.tsx` (1 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L35** | Dynamic dimension/transform property from state or props | **`VARIABLE`** | Pass property via CSS custom property style={{"--var-val": value}} and reference in utility class |

---

### 📄 `src/components/FakeLiveStream/CameraFeed.tsx` (1 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L238** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |

---

### 📄 `src/components/FooterProximityAlerts.tsx` (1 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L412** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |

---

### 📄 `src/components/GooeyMessagesDropdown.tsx` (1 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L244** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |

---

### 📄 `src/components/IphoneClipMask.tsx` (1 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L86** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |

---

### 📄 `src/components/LazyMount.tsx` (1 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L69** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |

---

### 📄 `src/components/Logo.tsx` (1 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L17** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |

---

### 📄 `src/components/MemberDashboard.tsx` (1 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L968** | Static animation property inline style | **`STATIC`** | Move keyframes to src/styles/animations.css and use Tailwind animate class |

---

### 📄 `src/components/MemberFactSheetDrawer.tsx` (1 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L163** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |

---

### 📄 `src/components/PickAwardsSection.tsx` (1 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L391** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |

---

### 📄 `src/components/PixelFireplaceCanvas.tsx` (1 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L523** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |

---

### 📄 `src/components/ProximityNotify.tsx` (1 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L473** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |

---

### 📄 `src/components/ShowCrewPanel.tsx` (1 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L425** | Dynamic dimension/transform property from state or props | **`VARIABLE`** | Pass property via CSS custom property style={{"--var-val": value}} and reference in utility class |

---

### 📄 `src/components/StickyNotesOverlay.tsx` (1 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L619** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |

---

### 📄 `src/components/UserFlowMap.tsx` (1 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L1569** | Dynamic dimension/transform property from state or props | **`VARIABLE`** | Pass property via CSS custom property style={{"--var-val": value}} and reference in utility class |

---

### 📄 `src/components/VideoSection.tsx` (1 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L328** | Dynamic dimension/transform property from state or props | **`VARIABLE`** | Pass property via CSS custom property style={{"--var-val": value}} and reference in utility class |

---

### 📄 `src/components/admin/ReferralProgramPanel.tsx` (1 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L538** | Static inline style object | **`STATIC`** | Replace with equivalent Tailwind utility class |

---

### 📄 `src/components/admin/RoleEmailDirectory.tsx` (1 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L452** | Imperative DOM style mutation | **`REPLACEABLE LOGIC`** | Use CSS class toggling or data-state attributes |

---

### 📄 `src/lib/theme-tokens.ts` (1 items)

| Line | What JS Does | Classification | Recommended CSS Replacement |
| :--- | :--- | :--- | :--- |
| **L77** | Imperative DOM style mutation in exempt component/file | **`KEEP IN JS`** | Keep imperative DOM styling in JS |

---

