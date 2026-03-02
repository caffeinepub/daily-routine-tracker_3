# Daily Routine Tracker

## Current State
A full-stack ICP web app with React frontend and Motoko backend. Features a gamified daily habit tracker with Internet Identity auth, dashboard, task management, coins/streaks/levels, stats, achievements, and dark/light mode. No PWA support exists -- no manifest, no service worker, no installability.

## Requested Changes (Diff)

### Add
- `manifest.webmanifest` in `src/frontend/public/` with app name, icons, theme color, display mode `standalone`, orientation, start URL, and shortcuts
- App icons at multiple sizes (192x192, 512x512, maskable) in `src/frontend/public/assets/generated/`
- Service worker (`sw.js`) in `src/frontend/public/` with offline caching strategy for the app shell
- Service worker registration in `main.tsx`
- `<link rel="manifest">` and `<meta name="theme-color">` tags in `index.html`
- Apple-specific PWA meta tags in `index.html` for iOS installability
- "Install App" prompt/banner component that appears when the browser fires the `beforeinstallprompt` event
- `vite-plugin-pwa` or manual PWA setup (manual preferred to avoid extra deps)

### Modify
- `index.html` -- add manifest link, theme-color meta, apple-touch-icon, apple mobile web app meta tags
- `main.tsx` -- register service worker on load

### Remove
- Nothing

## Implementation Plan
1. Generate app icons (192x192, 512x512) using `generate_image`
2. Create `src/frontend/public/manifest.webmanifest` with full PWA metadata
3. Create `src/frontend/public/sw.js` with cache-first offline strategy for app shell assets
4. Update `src/frontend/index.html` with manifest link, theme-color, apple meta tags
5. Update `src/frontend/src/main.tsx` to register the service worker
6. Add an `InstallPrompt` component that listens for `beforeinstallprompt` and shows a dismissible "Install App" banner
7. Wire `InstallPrompt` into `App.tsx`
8. Validate build passes
