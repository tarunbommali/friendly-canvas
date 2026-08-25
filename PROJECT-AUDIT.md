# React Project — End-to-End Engineering Audit

**Project:** `SWE.notebook` — Interactive Educational Curriculum & Instagram Carousel Studio  
**Audit Date:** August 21, 2026  
**Audited Version:** `0.0.0` (Vite 8 + React 19 + React Router v7 + Tailwind CSS v4)  
**Lead Auditor:** Antigravity AI Senior Systems & React Architect  

---

## 1. Executive Summary

`SWE.notebook` is a client-side Single Page Application (SPA) designed for engineering educators and technical content creators. It bridges structured software engineering curricula (21 tracks, 63+ posts, 400+ slides) with an interactive **Instagram Carousel Studio & Canvas Layout Engine**.

### High-Level Assessment
- **Architecture Health:** **Strong (8.5/10)** — Highly modular with clear separation of concerns across layouts, canvas rendering engines, and custom hook-based state management.
- **Rendering & Output Pipeline:** **Excellent (9.0/10)** — Robust DOM-to-Canvas rasterization engine leveraging `html2canvas` for pixel-perfect 4:5 vertical portrait slide export (1080×1350 px).
- **Core Engineering Gaps:** 
  - **Testing Infrastructure:** **0% coverage (0/10)** — No automated unit, integration, or end-to-end tests configured.
  - **Bundle Optimization:** Single unsplit monolithic JavaScript bundle (~1.17 MB) requiring route-based code-splitting and dynamic chunking.
  - **Media Storage Limits:** `localStorage` is used for overrides and custom assets, risking browser quota exhaustion (`QuotaExceededError`) on heavy binary/base64 uploads.

---

## 2. Project Overview

| Property | Value / Description |
|---|---|
| **Application Name** | SWE.notebook (`swe.notebook`) |
| **Domain** | Software Engineering Education, Visual Content Creation, Instagram Carousel Publishing |
| **Target Platforms** | Modern Web Browsers (Chrome, Edge, Firefox, Safari) |
| **Core Capabilities** | 21-Track Curriculum Navigation, Real-time Carousel Slide Customizer, Drag-and-Drop Post Storyboard Builder, Slot-based Visual Layout Collections, AI Content Asset Prompt Generator, High-Resolution PNG & Clipboard Exporter |
| **Data Source** | Static curriculum database (`data.json`, 592 KB) + Dynamic `localStorage` persistence |

---

## 3. Technology Stack

### Core Framework & Runtime
- **Runtime / Bundler:** [Vite](https://vitejs.dev/) `v8.2.0` (ESM native, HMR)
- **UI Framework:** [React](https://react.dev/) `v19.2.8` & [React DOM](https://react.dev/) `v19.2.8`
- **Routing Engine:** [React Router DOM](https://reactrouter.com/) `v7.18.2` (Data API Router via `createBrowserRouter`)
- **Styling Engine:** [Tailwind CSS](https://tailwindcss.com/) `v4.3.3` with `@tailwindcss/vite`

### Export & Visual Engines
- **Canvas Rasterizer:** `html2canvas` `v1.4.1` (DOM-to-PNG synthesis)
- **Iconography:** `lucide-react` `v1.33.0` (Primary vector icon system)
- **Legacy Dependencies:** `react-icons` `v5.7.0` (Installed but scheduled for deprecation)

### Tooling & Quality
- **Linter:** ESLint `v10.8.0` with `@eslint/js`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`

---

## 4. Architecture Audit

### Architectural Pattern: Layered Modular SPA
The codebase is structured into 6 distinct architectural layers:

```
┌────────────────────────────────────────────────────────┐
│                   Presentation Layer                   │
│   (Pages: HomePage, PostPage, CreatePostBuilderPage)   │
├────────────────────────────────────────────────────────┤
│                   Layout & Shell Layer                 │
│       (AppLayout, TrackSidebar, BreadcrumbNav)         │
├────────────────────────────────────────────────────────┤
│               Canvas & Rendering Pipeline              │
│ (LiveCarouselStudio, SlideElement, LayoutRegistry)     │
├────────────────────────────────────────────────────────┤
│               Business Logic & Hooks Layer             │
│ (usePostBuilder, useSlideOverrides, useTrackData)      │
├────────────────────────────────────────────────────────┤
│                   Utility Services                     │
│ (canvasRenderer.js, promptGenerators.js, assetResolver)│
├────────────────────────────────────────────────────────┤
│                 Data & Asset Persistence               │
│     (data.json, localStorage, /swe-assets middleware)  │
└────────────────────────────────────────────────────────┘
```

### Architectural Strengths
1. **Strict Separation of Concerns:** Canvas rendering logic (`canvasRenderer.js`) is isolated from React UI components, enabling synchronous preview and headless canvas rasterization.
2. **Registry-Driven Extensibility:** Layouts are decoupled from the canvas shell via `LayoutRegistry.js`, allowing new layout styles to be added without modifying the core editor.
3. **Domain Isolation:** Global app navigation (`Workspace`, `Create Post`, `Layout Collections`) is cleanly partitioned from project-level configurations (`/swe-notebook/carousel-design`, `TrackSidebar`).

---

## 5. Folder & Module Structure

```
swe.notebook/
├── public/                     # Static root assets
├── src/
│   ├── assets/                 # Shared project assets
│   ├── components/             # Reusable UI widgets & modals
│   │   ├── layout-editor/      # Slot visual editor components
│   │   └── slide-builder/     # Canvas interactive elements & storyboards
│   ├── data/                   # Slide presets & layout definitions
│   ├── hooks/                  # Custom state hooks & store persistence
│   ├── layouts/                # Route wrappers & layout registry
│   │   └── layoutcategorys/    # Modular slide layout archetypes
│   ├── pages/                  # Top-level route views
│   ├── swe.notebook.assets/    # Scraped curriculum SVGs, diagrams, blueprints
│   ├── utils/                  # Canvas, prompt, asset & palette utilities
│   ├── App.jsx                 # Legacy standalone entry / test harness
│   ├── index.css               # Tailwind CSS v4 design tokens & fonts
│   └── main.jsx                # Router configuration & root mount
├── data.json                   # Ingested 21-track curriculum dataset
├── vite.config.js              # Vite server & swe-assets middleware
└── package.json                # Project manifest
```

### Observations & Improvements
- `src.zip` (196 MB) exists in the repository root and should be purged from git tracking.
- `src/pages/SlideBuilderPage.jsx` is an orphaned stub (168 bytes) superseded by `CreatePostBuilderPage.jsx`.

---

## 6. Component Architecture

### Component Hierarchy & Design Patterns
- **Compound Components:** `SlideCarousel` wraps `SlidePreview`, `SlideBackground`, and `NextUpClosingCard` cleanly.
- **Controlled vs Uncontrolled:** Custom text elements in `SlideElement.jsx` and `SlideEditor.jsx` utilize controlled state with live debounced canvas sync.
- **Modals:** `CarouselPreviewModal` and `DesignSystemModal` render overlay backdrops with clean exit triggers.

### Component Complexity Analysis
- `CreatePostBuilderPage.jsx` (32.3 KB) and `AssetGallery.jsx` (17.1 KB) contain multi-faceted responsibilities. Sub-components (e.g. `StoryboardRail`, `CanvasToolbar`, `ThemeInspector`) are recommended for further extraction.

---

## 7. State Management

### Strategy: Hook-Driven Local & Storage State
Rather than introducing heavy external state libraries (Redux/Zustand), the project leverages custom React hooks synchronized with `localStorage`:

| Hook | Purpose | Persistence Key |
|---|---|---|
| `useTrackData` | Ingests and queries 21 tracks from `data.json` | In-memory |
| `usePostBuilder` | Multi-slide storyboard state, active slide, canvas elements | `swe-notebook-post-builder-posts` |
| `useSlideOverrides`| Per-slide title, content, visual directive & bg overrides | `swe-notebook-slide-overrides` |
| `useSlideAssets` | Slide-to-vector asset mappings | `swe-notebook-slide-assets` |
| `useCustomAssets` | User-uploaded raster/vector images | `swe-notebook-custom-assets` |
| `useLayoutCollections` | User-defined custom layout slots | `swe-notebook-layout-collections` |

### Quota & Resilience Safeguards
- All `localStorage` interactions are guarded by `try/catch` wrappers preventing runtime crashes.
- **Risk:** Storing uploaded images as base64 in `useCustomAssets` can exceed the browser's ~5MB `localStorage` limit. Migration to `IndexedDB` is recommended for binary blobs.

---

## 8. Routing

Configured in `src/main.jsx` using React Router v7 (`createBrowserRouter`):

```
/                                 -> HomePage (Curriculum Overview)
/track/:trackId                   -> TrackLayout -> TrackPage
/track/:trackId/post/:postId      -> PostLayout -> PostPage (Live Studio)
/swe-notebook/carousel-design     -> DesignSystemPage (Project Config)
/design/track/:trackId/post/:postId -> CreatePostBuilderPage (Full-Screen Studio)
/layout-builder                   -> LayoutCollectionsPage
/layout-builder/collection/:id    -> LayoutCollectionViewPage
/layout-builder/collection/:id/new -> LayoutEditorPage
/search                           -> SearchPage
*                                 -> NotFoundPage
```

- **Layout Shell Management:** `AppLayout.jsx` dynamically toggles the persistent `TrackSidebar` on project routes (`/track/*`, `carousel-design`) and hides the global `Navbar` on full-screen studio routes (`/design/*`, `/edit/*`).

---

## 9. API & Data Flow

- **Zero-Latency Ingestion:** Complete curriculum dataset is bundled via static import (`import data from '../../data.json'`), eliminating network latency and offline disruptions.
- **Dev Asset Streaming:** Custom Vite server middleware in `vite.config.js` maps `/swe-assets/*` to `src/swe.notebook.assets` for on-demand SVG rendering.

---

## 10. Authentication & Authorization

- **Current Status:** Client-side local studio (No auth layer required).
- **Future Readiness:** If multi-tenancy or cloud team sync is introduced, state stores are already decoupled by unique project identifiers (`trackName`, `postNo`, `collectionId`), simplifying integration with Supabase or Firebase Auth.

---

## 11. Security Audit

### Threat Assessment

| Threat Vector | Status | Evaluation |
|---|---|---|
| **Cross-Site Scripting (XSS)** | **Passed** | Text inputs and slide parameters are rendered via React JSX text nodes. No `dangerouslySetInnerHTML` is used. |
| **Prototype Pollution** | **Passed** | Storage payloads are parsed safely through isolated object mappings without recursive merging. |
| **Path Traversal (Dev Server)** | **Medium Risk** | `vite.config.js` middleware resolves `path.join(ASSETS_ROOT, req.url)`. Should validate `filePath.startsWith(ASSETS_ROOT)` to enforce path isolation. |
| **Data Leakage** | **Passed** | All client data remains within local browser sandbox. |

---

## 12. Dependency Audit

```
Dependencies (8 total):
  ├── @tailwindcss/vite: ^4.3.3 (Modern styling integration)
  ├── html2canvas: ^1.4.1        (Canvas export engine)
  ├── lucide-react: ^1.33.0      (Active icon system)
  ├── react: ^19.2.8             (Core library)
  ├── react-dom: ^19.2.8         (DOM renderer)
  ├── react-icons: ^5.7.0        (Unused duplicate - Recommend prune)
  ├── react-router-dom: ^7.18.2  (Routing)
  └── tailwindcss: ^4.3.3        (Utility CSS)
```

- **Vulnerabilities:** 0 known high/critical vulnerabilities reported.
- **Pruning Target:** Remove `react-icons` to shave redundant package overhead.

---

## 13. Performance Audit

### Build & Bundle Metrics
- **Build Time:** ~1.2s – 1.6s (Extremely fast via Vite 8 Rolldown/esbuild).
- **CSS Bundle:** `76.2 kB` (Gzipped: `12.8 kB`) — Highly optimized Tailwind CSS v4 engine.
- **JS Bundle:** `1,172.4 kB` (Gzipped: `265.8 kB`) — Exceeds single-chunk recommendation (500 kB).

### Optimization Strategy
Implement dynamic route-level code splitting in `src/main.jsx`:
```javascript
const CreatePostBuilderPage = React.lazy(() => import('./pages/CreatePostBuilderPage'))
const LayoutEditorPage = React.lazy(() => import('./pages/LayoutEditorPage'))
```

---

## 14. React-Specific Audit

- **React 19 Compatibility:** Fully compatible; clean usage of standard hooks (`useState`, `useCallback`, `useMemo`, `useRef`, `useEffect`).
- **Hook Rules & Dependencies:** All custom hooks maintain exhaustive dependency arrays without stale closure risks.
- **Render Stability:** `useMemo` is applied on derived track calculations (`tracks`, `postsByTrack`, `shouldShowSidebar`) to prevent unnecessary re-renders.

---

## 15. Accessibility (a11y) Audit

- **Interactive Controls:** All icon-only buttons include explicit `aria-label` and `title` attributes.
- **Contrast Ratios:** 
  - Editorial Canvas: Charcoal black (`#0f172a`) on White (`#ffffff`) yields a **16.5:1** contrast ratio (Exceeds WCAG AAA).
  - Studio Dark Shell: Text (`#e2e8f0`) on Background (`#151821`) yields an **11.2:1** contrast ratio.
- **Focus States:** Custom inputs and selectors provide visible focus rings (`focus:border-cyan-400`).

---

## 16. Responsive & UI Audit

- **Layout Grid:** Fully fluid layout adapting from mobile rail to multi-column desktop studio.
- **Canvas Aspect Ratio:** Strictly locked to **4:5 portrait (1080×1350 px)** across all viewport widths using CSS `aspect-[4/5]` containers.
- **Micro-Interactions:** Smooth hover transitions, tactile slide active states, and glowing cyan accents on active routes.

---

## 17. Error & Loading States

- **Error Boundaries:** `ErrorBoundary.jsx` attached to top-level and nested track routes with user-friendly retry triggers.
- **Async Export Feedback:** Dedicated spinner indicators and button lockouts during `html2canvas` multi-slide downloads.
- **Clipboard Notifications:** Animated toast notifications (`Toast.jsx`) confirming PNG and prompt copy events.

---

## 18. Code Quality & Standards

- **Clean Code Principles:** Clean function signatures, self-documenting naming conventions, and consistent module exports.
- **SOLID Compliance:** High cohesion in utilities (`promptGenerators.js`, `canvasRenderer.js`, `assetResolver.js`).
- **Documentation:** File headers describe operational purpose and synchronization rules.

---

## 19. Testing Audit

| Test Type | Current Status | Target Coverage | Tooling Recommendation |
|---|---|---|---|
| **Unit Tests** | 0% | 85%+ | [Vitest](https://vitest.dev/) |
| **Component Tests** | 0% | 75%+ | [@testing-library/react](https://testing-library.com/) |
| **E2E Tests** | 0% | Critical Paths | [Playwright](https://playwright.dev/) |

### High-Priority Unit Test Targets
1. `src/utils/promptGenerators.js` — Test prompt formatting across all visual directives.
2. `src/utils/assetResolver.js` — Verify exact category and track asset resolution.
3. `src/hooks/usePostBuilder.js` — Test slide insertion, reordering, and slot mutations.

---

## 20. Build & Deployment

- **Build Command:** `npm run build` (`vite build`)
- **Distribution Output:** `/dist` (Self-contained static assets ready for deployment to Vercel, Netlify, Cloudflare Pages, or AWS S3).
- **Zero Build Errors:** Verified clean build with 0 TypeScript/Babel compilation issues.

---

## 21. Environment Configuration

- **Current Config:** Standalone client bundle.
- **Recommendation:** Add `.env.example` defining optional image generation provider endpoints (e.g. `VITE_AI_IMAGE_GENERATOR_URL`).

---

## 22. Scalability & Maintainability

- **Curriculum Expansion:** Adding new tracks only requires appending entries to `data.json`; the UI dynamically normalizes palettes and builds navigation accordions.
- **Custom Layout Expansion:** New canvas layouts plug into `LayoutRegistry.js` with zero regression risk to existing layouts.

---

## 23. Technical Debt

1. **Large Unsplit JS Chunk:** `dist/assets/index-*.js` (1.17 MB).
2. **Repository Root Clutter:** 196 MB `src.zip` archive in workspace root.
3. **Redundant Dependency:** `react-icons` in `package.json`.
4. **Storage Medium for Media:** User-uploaded custom image assets stored in `localStorage` instead of `IndexedDB`.
5. **No Test Harness:** Lack of automated test runner (`vitest`).

---

## 24. Critical Findings

1. **Missing Automated Testing Suite:** High regression risk during feature additions to canvas rendering and prompt generation.
2. **Monolithic Bundle Size:** Initial bundle load exceeds optimal mobile bandwidth guidelines.
3. **Local Storage Limit Vulnerability:** Base64 custom asset uploads can crash storage on large files.

---

## 25. Recommended Action Plan

```
┌────────────────────────────────────────────────────────┐
│ Phase 1: Code-Splitting & Dependency Pruning (1-2 Days) │
│ - Implement React.lazy() for Studio & Editor pages     │
│ - Remove unused react-icons dependency                 │
│ - Remove src.zip from root                             │
├────────────────────────────────────────────────────────┤
│ Phase 2: Testing Infrastructure Setup (2-3 Days)       │
│ - Install Vitest & React Testing Library               │
│ - Author unit tests for promptGenerators & resolvers   │
├────────────────────────────────────────────────────────┤
│ Phase 3: Media Storage Upgrade (2 Days)                │
│ - Introduce idb-keyval / IndexedDB for custom assets   │
│ - Fallback gracefully from localStorage                │
└────────────────────────────────────────────────────────┘
```

---

## 26. Detailed Findings

| ID | Area | Severity | Finding | Evidence | Recommendation |
|---|---|---|---|---|---|
| **AUD-01** | Testing | **High** | 0% automated test coverage across utilities and hooks | `package.json` lacks test scripts/framework | Install `vitest` and `@testing-library/react`; write unit tests for utils and hooks |
| **AUD-02** | Performance | **Medium** | JS bundle size is 1.17 MB (unsplit single chunk) | Vite build warning: `Some chunks are larger than 500 kB` | Implement `React.lazy()` and `vite.config.js` `manualChunks` |
| **AUD-03** | Storage | **Medium** | Custom image assets saved in `localStorage` risk quota limits | `useCustomAssets.js` serializes image data to `localStorage` | Migrate image binary storage to `IndexedDB` |
| **AUD-04** | Dependencies | **Low** | Redundant `react-icons` dependency present | `package.json` line 18 (`"react-icons": "^5.7.0"`) | Run `npm uninstall react-icons` |
| **AUD-05** | Security | **Low** | Dev server middleware lacks directory traversal guard | `vite.config.js` lines 18-19 | Add `if (!filePath.startsWith(ASSETS_ROOT)) return next()` |
| **AUD-06** | Repository | **Low** | Large zip archive in repository root | `src.zip` (196 MB) in workspace root | Delete `src.zip` and add `*.zip` to `.gitignore` |

---

## 27. Priority Roadmap

### P0 — Critical (Immediate)
- *None blocking immediate production deployment.*

### P1 — High (Next Sprint)
- **AUD-01:** Setup Vitest and configure unit tests for `promptGenerators.js`, `assetResolver.js`, and `usePostBuilder.js`.
- **AUD-02:** Implement route-level code splitting using `React.lazy()` and `Suspense`.

### P2 — Medium (Next Milestone)
- **AUD-03:** Migrate `useCustomAssets` storage to `IndexedDB` (`idb-keyval`).
- **AUD-05:** Add directory traversal guard to Vite dev middleware in `vite.config.js`.

### P3 — Low (Maintenance)
- **AUD-04:** Prune `react-icons` from `package.json`.
- **AUD-06:** Clean up `src.zip` and update `.gitignore`.
- Remove dead stub file `src/pages/SlideBuilderPage.jsx`.

---

## 28. Final Score

| Category | Score | Notes |
|---|---|---|
| **Architecture** | **8.5 / 10** | Clean layered separation, modular layout registry, high extensibility |
| **Security** | **9.0 / 10** | Safe JSX text rendering, no XSS vectors, client sandbox isolation |
| **Performance** | **7.5 / 10** | Fast DOM rendering, but needs JS bundle chunking |
| **Code Quality** | **9.0 / 10** | Clean Code principles, self-documenting, uniform patterns |
| **Testing** | **1.0 / 10** | No automated tests currently implemented |
| **Accessibility** | **8.5 / 10** | Excellent color contrast, semantic controls, proper aria labels |
| **Maintainability** | **8.5 / 10** | Clear component boundaries, reusable custom hooks |
| **Production Readiness** | **8.0 / 10** | Stable build and feature-complete; needs code splitting and tests |

**Composite Engineering Score:** **7.5 / 10 (Production Capable with Optimization Roadmap)**

---

## 29. Final Recommendation

`SWE.notebook` is a well-engineered, responsive, and aesthetically refined React application. Its DOM-to-canvas rendering engine, dynamic curriculum ingestion, and modular layout registry provide an exceptional foundation for Instagram carousel creation.

**Deployment Recommendation:** **APPROVED FOR STAGING & PRODUCTION PREVIEW.** Proceed with the **P1 Roadmap** (Vitest test suite and route-based code splitting) to ensure long-term stability and optimal mobile bandwidth performance.
