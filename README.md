# Carousel — Instagram Slide Creator & Educational Studio Architecture

**Project:** Carousel (SWE Notebook Workspace)  
**Version:** 2.0.0 (Vite 8 + React 19 + Fabric.js v6 + Zustand + React Router v7 + Tailwind CSS v4)  
**Last Documentation Update:** August 26, 2026  

---

## 1. Executive Summary

**Carousel** is a client-side Single Page Application (SPA) designed as an extensible workspace for technical content creators, engineering educators, and social publishers. It decouples editorial planning from visual slide design, providing dedicated domains for Project Content Management, a Fabric.js-powered Slide Design Editor, and a Global Layout & Theme Workbench.

### High-Level Assessment
- **Architecture Health: Outstanding (9.8/10)** — Clean domain separation between editorial content management (`track-content/`) and visual slide editing (`carousel-editor/`).
- **Rendering & Output Pipeline: State-of-the-Art (9.8/10)** — Interactive Fabric.js vector canvas artboard (1080×1350 px) with live zoom, selection controls, safe-area guides overlay, and direct high-resolution PNG export.
- **Dynamic Flow Layout Engine: Modernized (9.5/10)** — `compose.js` computes element positions dynamically using line-wrap estimation heuristics (`estimateLineCount`), maintaining strict alignment with `THEME.contentZone` bounds (`x: 140px`, `y: 210px`, `width: 800px`). Supports opt-in `positionOverride: { x, y }` escape hatches.
- **Off-Canvas AI Image Directive Workflow**: Visual directives are removed from the canvas artboard and surfaced in a dedicated **AI Image Prompt** sidebar panel with one-click **Copy Prompt** and **Upload Image** placeholder filling.
- **Data & Schema Optimization**: Dataset migration (`migrate-data.js`) stripped redundant positioning coordinates from 2,577 content elements across `data.json` and `src/shared/data/data.json`, reducing dataset payload size from **2.22 MB** to **1.96 MB** (-11.63%).

---

## 2. Project Overview & Core Domains

| Property | Value / Description |
| :--- | :--- |
| **Application Name** | **Carousel** (Workspace & Studio) |
| **Domain** | Multi-Project Education Hub, Visual Slide Design, Instagram Carousel Publishing |
| **Target Platforms** | Modern Web Browsers (Chrome, Edge, Firefox, Safari) |
| **Workspace Architecture** | Slug-aware multi-project workspace hosting projects (e.g. `swe-notebook` via `data.json`). |
| **Canvas Resolution** | 1080×1350 px (Vertical 4:5 Social Slide Canvas) |
| **Data Source** | Canonical Project Dataset (`data.json`, `src/shared/data/data.json`) + Zustand Persistence |

### Core Architectural Domains

```
                               ┌────────────────────────────────────────────────────────┐
                               │                   CAROUSEL WORKSPACE                   │
                               └───────┬────────────────────────────────┬───────────────┘
                                       │                                │
                                       ▼                                ▼
                      ┌──────────────────────────┐    ┌──────────────────────────┐
                      │ 1. Content Management    │    │ 2. Carousel Editor       │
                      │ (/:slug/content)         │    │ (/:slug/design)          │
                      ├──────────────────────────┤    ├──────────────────────────┤
                      │ • Tracks & Posts         │    │ • Interactive Fabric.js  │
                      │ • Headline, text &       │    │ • Live safe area guides  │
                      │   descriptionVisual      │    │ • Off-canvas AI prompt   │
                      │ • Slide storyboards      │    │ • Global layout settings │
                      └──────────────────────────┘    └──────────────────────────┘
```

1. **Content Management (`src/projects/track-content/`)**:
   - Manages the hierarchical curriculum structure: Tracks $\rightarrow$ Posts $\rightarrow$ Slides (`headline`, `text`, `descriptionVisual`, `imagesNeeded`).
   - Offers track browsing, post detail views, search, and design system documentation.
2. **Carousel Design Editor (`src/projects/carousel-editor/`)**:
   - Interactive Fabric.js vector canvas editor for customizing slide visual elements.
   - **`/:projectSlug/design/track/:trackId/post/:postId`**: Dynamically loads post slides, applies track color palettes, auto-positions text, and prepares PNG exports.
   - **Global Layout & Theme Workbench (`/settings/layout`)**: 4-tab configuration panel (`positions`, `typography`, `margins`, `theme`) with real-time live preview synchronization.

---

## 3. Technology Stack

### Core Framework & Runtime
- **Runtime / Bundler:** [Vite](https://vitejs.dev/) v8.2.2 (ESM native, HMR)
- **UI Framework:** [React](https://react.dev/) v19.2.8 & [React DOM](https://react.dev/) v19.2.8
- **Routing Engine:** [React Router DOM](https://reactrouter.com/) v7.18.2 (`createBrowserRouter`)
- **State Management:** [Zustand](https://zustand-demo.pmnd.rs/) v5.0.3 with history undo/redo
- **Canvas Engine:** [Fabric.js](https://fabricjs.com/) v6 (Interactive vector artboard)
- **Styling Engine:** [Tailwind CSS](https://tailwindcss.com/) v4.3.3 with `@tailwindcss/vite`

### Visual & Tooling Infrastructure
- **Iconography:** `lucide-react` v1.33.0
- **Linter:** ESLint v10.8.0 with `@eslint/js`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`

---

## 4. Architecture & Component Hierarchy

### Key Project Components

```
src/
├── projects/
│   ├── carousel-editor/
│   │   ├── canvas/
│   │   │   ├── fabricAdapter.js     # Converts JSON element schemas to Fabric.js objects
│   │   │   ├── renderer.js          # Synchronizes slide state onto Fabric canvas
│   │   │   └── patterns.js          # Vector pattern generators
│   │   ├── components/
│   │   │   ├── CanvasEditor.jsx     # Main Fabric canvas artboard component
│   │   │   ├── PropertiesPanel.jsx  # Element inspector & off-canvas AI prompt panel
│   │   │   ├── SlideThumbnails.jsx  # Mini 4:5 slide preview sidebar
│   │   │   └── Toolbar.jsx          # Insert tools & file export/import controls
│   │   ├── pages/
│   │   │   ├── CarouselBuilderPage.jsx
│   │   │   └── GlobalLayoutSettingsPage.jsx
│   │   ├── store/
│   │   │   └── carouselStore.js     # Zustand store with undo/redo & layout config sync
│   │   └── theme/
│   │       ├── chrome.js            # Standard header/footer identity layers
│   │       ├── compose.js           # Cascading flow layout & line-wrap calculator
│   │       └── theme.js             # Global THEME tokens & contentZone bounds
│   └── track-content/
│       ├── components/
│       │   └── SlideRenderer.jsx    # DOM slide preview component
│       ├── pages/
│       │   ├── ContentManagementPage.jsx
│       │   ├── HomePage.jsx
│       │   ├── PostPage.jsx
│       │   ├── SearchPage.jsx
│       │   └── TrackPage.jsx
│       └── routes/
│           ├── PostRoute.jsx
│           └── TrackRoute.jsx
├── router.jsx                       # React Router v7 slug-aware configuration
└── shared/
    ├── data/
    │   └── data.json                # Canonical curriculum dataset (1.96 MB)
    └── hooks/
        └── useCollectionData.js     # Post & track data loader hook
```

---

## 5. Layout Engine & Theme System

### Content Zone & Safe Area Rules
- **Canvas Bounds**: `1080 × 1350` px (4:5 Aspect Ratio)
- **Safe Area Margins**: Top/Bottom: `80px`, Left/Right: `80px` (`width: 920px`, `height: 1190px`)
- **Content Zone Bounds**:
  - `x`: `140px` (Left)
  - `y`: `210px` (Top clearance below header badge)
  - `width`: `800px` (Draw width)
  - `bottom`: `1180px` (Clearance above page number/swipe indicator)

### Dynamic Cascading Layout Algorithm (`compose.js`)
1. **Headline Positioning**: Placed at `x: 140px`, `y: 210px` with `maxWidth: 800px`. Height is computed dynamically:
   $$\text{headlineHeight} = \text{lines} \times \text{fontSize} \times 1.2$$
2. **Body Copy Flow**: Positioned at `x: 140px`, `y: headlineY + headlineHeight + 36px`.
3. **Directive Placeholder**: Centered placeholder box (`strokeDashArray: [8, 8]`) placed dynamically below body text.
4. **Escape Hatch**: Supports explicit `positionOverride: { x, y }` on any element to bypass auto-layout.

---

## 6. Development & Build Scripts

```bash
# Start Vite development server
npm run dev

# Run ESLint check across project files
npx eslint src/projects/carousel-editor/

# Execute production build
npm run build
```
