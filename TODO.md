# Refonte UI – Version Clean (Tracking)

This TODO tracks the step-by-step replacement of UI files with the clean, sober variant.

## Tasks

- [x] Replace `web/src/index.css` with clean Tailwind layers and utility classes (.card, .btn, .field, .label, .kbd, .section) and dark-mode variants.
- [x] Replace `web/src/layouts/AppShell.tsx` with compact shell (minimal top bar, compact sidebar with inline SVG icons, Alt+1/Alt+2 hotkeys, no branding).
- [x] Replace `web/src/pages/Landing.tsx` with minimal hero (no emojis, no "Powered by ...", two CTAs).
- [x] Replace `web/src/pages/Strategy.tsx` with neutral cards and typography.
- [x] Replace `web/src/pages/Analytics.tsx` with clean metrics and sections (neutral palette).
- [x] Replace `web/src/pages/Integrations.tsx` without emoji icons; simple labels/buttons.
- [x] Replace `web/src/pages/Settings.tsx` with coherent forms and neutral components (remove AI API references).
- [x] Replace `web/src/pages/Setup.tsx` with clean 4-step wizard and consistent controls.
- [x] Replace `web/src/pages/NotFound.tsx` with simple 404 page (neutral).
- [x] Optional: Replace `web/src/App.tsx` with clean standalone variant for consistency (not used by router).

## Validation

- [ ] Start dev server: `cd web && npm run dev`
- [ ] Verify dark mode toggle works (class on <html>).
- [ ] Verify sidebar collapse and active states in AppShell.
- [ ] Verify pages render without emojis or "Powered by ..." texts.
- [ ] Verify neutral gray palette and consistent components across pages.
