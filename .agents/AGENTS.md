# Project Agent Directives

## 🩺 React Doctor Auto-Check Rule (MANDATORY)

After modifying any React component, hook, or API route in `src/`:
1. **Always run**: `npx react-doctor@latest --scope changed`
2. **Verify score**: Ensure the React Doctor score does NOT regress from 100/100 and no new warnings/errors are introduced.
3. **Auto-fix before completing**: Immediately resolve any flagged issues (e.g. side-effects in state updaters, missing res.ok checks, unversioned localStorage keys, missing dependencies) BEFORE reporting completion to the user or running git commit.

## 🎨 No Static Inline Styles Rule (MANDATORY)

In this project, **never write static values** in `style={{...}}` or `element.style`.
- Use Tailwind v4 classes, `@theme` tokens, or `@utility` directives in `src/app/globals.css`.
- Inline `style` is allowed **only** to pass a CSS custom property (e.g. `style={{ '--var': value }}`) for dynamic runtime values.
- **Exceptions**: GSAP / Framer Motion / Lenis physics, canvas / shader / WebGL contexts, map pins (`TourMap`), visual editors (`HeaderMaskEditor`, `CruiseHeroMaskEditor`), and external email HTML strings.

## 🖼️ Image Storage & Naming Convention Rule (MANDATORY)

- **Location**: Always place new images inside `public/images/<section>/` (e.g. `public/images/cruise/`, `public/images/merch/`, `public/images/tour/`). **Never put images directly in the `public/` root**.
- **Naming**: Use **lowercase kebab-case** descriptive names (e.g. `band-stage-lighting.webp`, `tour-map-bg.png`).
- **No Raw IDs**: Never use camera IDs, Amazon seller IDs (e.g. `71tQzMjwGaL._SL1500_.jpg`), stock photo hashes, or raw IDs in image filenames.


