# End-to-End Prompt — Production-Ready Carousel Editor (JavaScript / JSX)

You are a senior frontend architect and UI engineer.
Build and extend a production-ready **Instagram Carousel Design Editor** using React + JavaScript (JSX).

> **This project is JavaScript-first. Do NOT use TypeScript. All files use `.js` or `.jsx` extensions.**

The application is a configuration-driven visual editor. Users create, edit, arrange, style, preview,
and export carousel slides entirely from a normalized JSON document — the frontend is NOT tightly
coupled to any backend API.

---

## 1. Product Goal

Build a professional carousel editor.

Primary use case:

> Create Instagram carousel designs through structured JSON configurations.

The editor supports:

* Multiple carousel slides with slide selection and navigation
* Text elements (headline, body, badge)
* Image elements with upload and full-state persistence across slides
* Shape elements (rect, circle)
* Visual directive / placeholder card system
* Chrome layer (badge, page number, swipe indicator) — non-editable overlays
* Background color and pattern per slide
* Element positioning, resizing, and rotation on canvas
* Typography controls (font, size, weight, color, alignment)
* Color controls and shape styling
* Alignment and distribution tools
* Z-index / layer ordering
* Duplicate / delete elements and slides
* Undo / redo (30-step bounded history)
* Keyboard shortcuts
* Zoom and fit-to-screen
* Snap guides and safe-area overlays
* JSON import / export (with Zod schema validation)
* Global layout config (change all slides at once)
* PNG export (all slides at 2× resolution)
* Responsive application shell

The editor must feel like a **modern creative SaaS product** — clean, premium, dark-themed.

---

## 2. Technology Stack

Use exactly these versions:

| Concern        | Library / Tool                        |
|----------------|---------------------------------------|
| UI Framework   | React 19 (JSX)                        |
| Build Tool     | Vite 8                                |
| Styling        | Tailwind CSS v4 (`@tailwindcss/vite`) |
| State          | Zustand v5                            |
| Routing        | React Router DOM v7                   |
| Canvas         | **Fabric.js v7** (`fabric`)           |
| Schema         | Zod v4                                |
| Icons          | Lucide React + React Icons            |
| Export         | html2canvas (raster fallback)         |

> **Do NOT use Konva, react-konva, or TypeScript.**
> **Do NOT use Tailwind CSS v3 class patterns — use v4 conventions with `@tailwindcss/vite`.**

---

## 3. Core Architecture

Layered, domain-driven architecture:

```
Application
│
├── App Shell (src/workspace/)
│   ├── WorkspaceLayout.jsx     — top-level shell with Navbar + outlet
│   ├── Navbar.jsx              — project navigation bar
│   ├── BreadcrumbNav.jsx       — contextual breadcrumb
│   ├── CarouselLogoBadge.jsx   — logo badge component
│   └── Toast.jsx               — global toast notifications
│
├── Carousel Editor (src/projects/carousel-editor/)
│   ├── pages/
│   │   ├── CarouselBuilderPage.jsx      — main editor page
│   │   └── GlobalLayoutSettingsPage.jsx — layout/theme config page
│   ├── components/
│   │   ├── CanvasEditor.jsx       — Fabric.js canvas wrapper + event system
│   │   ├── Toolbar.jsx            — top element + action bar
│   │   ├── SlideThumbnails.jsx    — left slide panel
│   │   └── PropertiesPanel.jsx    — right element inspector
│   ├── canvas/
│   │   ├── fabricAdapter.js       — JSON → Fabric object factory
│   │   ├── renderer.js            — renderSlide() orchestrator
│   │   ├── patterns.js            — background pattern SVG data URLs
│   │   └── snapGuideEngine.js     — real-time snap guide lines
│   ├── store/
│   │   └── carouselStore.js       — single Zustand store (all slices)
│   ├── theme/
│   │   ├── theme.js               — THEME constant (canvas, zones, colors, typography)
│   │   ├── compose.js             — composeSlide() + autoLayoutContent()
│   │   └── chrome.js              — buildChrome() (badge, page number, swipe CTA)
│   ├── data/
│   │   └── initialCarousel.js     — default document used on reset
│   └── schemas/
│       └── carouselSchema.js      — Zod validation schema for import
│
├── Collection Content (src/projects/collection-content/)
│   — separate domain: content management, Collections, posts
│
├── Domain (src/domain/)
│   — config/, layout/, post/, slide/ — pure domain models (no UI)
│
├── Infrastructure (src/infrastructure/)
│   — assets/, persistence/ — static asset helpers and storage adapters
│
└── Shared (src/shared/)
    ├── components/   — ErrorBoundary
    ├── hooks/        — useCollectionData, useClipboard, useCustomAssets, useTrackData
    ├── utils/
    ├── styles/
    └── config/
```

---

## 4. Canonical JSON Data Model

The editor is driven by a single normalized JSON document. This document is always the source of truth.

```js
// CarouselDocument
{
  schemaVersion: 1,
  metadata: {
    title: "My Carousel",
    width: 1080,
    height: 1350,
    aspectRatio: "4:5",      // "4:5" | "1:1" | "9:16" | "16:9"
    bgPattern: "solid",      // "solid" | "dots" | "grid" | "lines"
    textAlign: "left",
  },
  activeSlideId: "slide_1",
  slides: [Slide]
}

// Slide
{
  id: string,
  backgroundColor: string,
  bgPattern: string,
  imagePrompt: string,        // AI image generation prompt (optional)
  visualDirective: string,    // visual description text (optional)
  assetName: string[],        // asset name tags (optional)
  elements: [CanvasElement]
}

// CanvasElement — base fields shared by all types
{
  id: string,                 // e.g. "text_slide_1_body", "rect_slide_1_visual_placeholder"
  type: string,               // "text" | "headline" | "badge" | "rect" | "circle" | "image"
  x: number,
  y: number,
  rotation: number,
  zIndex: number,
  originX: "left" | "center" | "right",
  originY: "top" | "center" | "bottom",
  scaleX: number,
  scaleY: number,

  // Type-specific:
  // text / headline / badge: text, fontSize, fontFamily, fill, textAlign, width
  // rect:   width, height, fill, stroke, strokeWidth, strokeDashArray
  // circle: radius, fill, stroke, strokeWidth
  // image:  src (base64 data URL), width, height

  // Special flags:
  isChrome: boolean,          // chrome overlay — rendered but NOT selectable
  isPlaceholder: boolean,     // placeholder rect awaiting image upload
  positionOverride: object,   // per-slide escape hatch for position tuning
}
```

**Never use canvas internal state as truth. JSON → Zustand → Canvas, always.**

---

## 5. Canvas System

### 5.1 Dimensions

Default: **1080 × 1350** (Instagram 4:5).

Supported aspect ratios:

| Ratio  | Dimensions    |
|--------|---------------|
| `4:5`  | 1080 × 1350   |
| `1:1`  | 1080 × 1080   |
| `9:16` | 1080 × 1920   |
| `16:9` | 1920 × 1080   |

The canvas renders at its native resolution. A CSS `scale()` transform is applied by the wrapper to fit the viewport. The `zoom` value in the store drives this scale.

### 5.2 Safe Area & Content Zone

Defined in `THEME`:

```
┌────────────────────────── 1080px ─────────────────────────────┐
│  ← 80px margin                            80px margin →       │
│  ┌─── Safe Area (920 × 1190) ─────────────────────────────┐   │
│  │  ↑ 130px chrome clearance  (badge at y=140)            │   │
│  │  ┌── Content Zone (800 × 970, top=210) ─────────────┐  │   │
│  │  │  Headline, Body, Visual Directive Cards          │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  │  ↓ 140px chrome clearance  (page number at y=1210)     │   │
│  └────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────┘
```

### 5.3 Chrome Layer

Every slide gets a non-interactive chrome layer from `buildChrome()`:

| Element             | ID                   | Position         |
|---------------------|----------------------|------------------|
| Brand badge         | `chrome_badge`       | top-center y=140 |
| Page counter        | `chrome_page_number` | bottom-left y=1210 |
| Swipe / follow CTA  | `chrome_swipe`       | bottom-right y=1210 |

Chrome elements have `isChrome: true`. They are rendered on canvas but must NOT be selectable.

### 5.4 Fabric.js Adapter (`fabricAdapter.js`)

Maps JSON element `type` → Fabric.js class:

```js
"rect"     → Rect
"circle"   → Circle
"text"     → Textbox
"headline" → Textbox
"badge"    → Textbox
"image"    → FabricImage
```

All Fabric objects receive `SELECTION_CONTROL_CONFIG` (blue circular handles, crisp border, generous touch targets).

Image elements:
- Create HTML `<img>` element, set `src` to data URL
- Wrap in `FabricImage`
- Apply `scaleToWidth` / `scaleToHeight` immediately
- `onload` handler re-applies scale and calls `canvas.renderAll()` if `fabricImg.canvas` is still set

### 5.5 Renderer (`renderer.js`)

`renderSlide(fabricCanvas, slide, metadata)`:

1. `fabricCanvas.clear()`
2. Set canvas `backgroundColor`
3. If `bgPattern !== "solid"`, apply `Pattern` from `patterns.js`
4. Sort elements by `zIndex`
5. For each element → `createFabricObject(element)` → `fabricCanvas.add(obj)`
6. `fabricCanvas.renderAll()`

### 5.6 Snap Guide Engine (`snapGuideEngine.js`)

Real-time snap lines during drag:

* Canvas center horizontal + vertical
* Canvas edges (top, bottom, left, right)
* Other element edges and centers

Renders cyan guide lines via Fabric `Line` objects. Cleared on `mouse:up`.

---

## 6. Theme System (`theme.js`)

Single exported `THEME` constant — the shared design token system. All layout calculations reference `THEME`, never hardcoded numbers.

```js
THEME = {
  canvas: { width: 1080, height: 1350, aspectRatio: "4:5" },
  safeArea: { x: 80, y: 80, width: 920, height: 1190,
              top: 80, bottom: 80, left: 80, right: 80 },
  contentZone: { x: 140, y: 210, width: 800, height: 970,
                 top: 210, bottom: 1180, left: 140, right: 940,
                 paddingTop: 130, paddingBottom: 140,
                 paddingLeft: 60, paddingRight: 60 },
  colors: {
    cardBg: "#f8fafc", cardBorder: "#cbd5e1",
    textPrimary: "#0f172a", textSecondary: "#475569",
    footer: "#64748b", accent: "#2563eb",
  },
  typography: {
    headline: { fontSize: 50, fontFamily: "Inter" },
    body:     { fontSize: 32, fontFamily: "Inter" },
    badge:    { fontSize: 26, fontFamily: "Inter" },
    footer:   { fontSize: 24, fontFamily: "Inter" },
  },
  chrome: {
    badge:          { x: 540,  y: 140  },
    pageNumber:     { x: 140,  y: 1210 },
    swipeIndicator: { x: 940,  y: 1210 },
  },
}
```

---

## 7. Compose System (`compose.js`)

### `autoLayoutContent(elements)`

Auto-positions elements within the content zone using a 2-pass algorithm:

1. **Pass 1** — find headline, estimate its wrapped height via `estimateLineCount()` (character-width heuristic)
2. **Pass 2** — find body text, compute body Y as `headlineY + headlineHeight + gap`; compute directive Y below body

Element classification:
- `isHeadline` — `type === "headline"` or ID contains `"head"` / `"title"`
- `isBody` — `type === "text"` and not headline/directive
- `isDirectiveText` — text containing `"Visual:"` or ID containing `"dir_text"`
- `isDirectiveRect` — `type === "badge"`, or ID contains `"dir"`, or `type === "rect"` not `_bg`

Supports `positionOverride` escape hatch per element.

### `composeSlide(contentElements, options)`

Assembles a complete slide:
1. Applies `autoLayoutContent()` to content elements
2. Prepends background rect (if none present)
3. Appends chrome elements from `buildChrome()`

Returns: `{ id, backgroundColor, elements }`

### `buildChrome(options)` (`chrome.js`)

Generates the three chrome elements:
- Badge text element at `THEME.chrome.badge`
- Page number text at `THEME.chrome.pageNumber` (e.g. `"01 / 08"`)
- Swipe/Follow CTA at `THEME.chrome.swipeIndicator` (last slide shows "Follow for more →")

---

## 8. Zustand Store (`carouselStore.js`)

Single `create()` call. Logically grouped slices within one store.

### 8.1 State Shape

```js
{
  document: CarouselDocument,
  selectedElementId: string | null,
  zoom: number,                    // 1 = fit to screen
  showSafeAreaGuides: boolean,
  snapToGuides: boolean,
  historyPast: CarouselDocument[], // capped at 30
  historyFuture: CarouselDocument[],
  clipboardElement: CanvasElement | null,
  imageRegistry: {},               // { [elementId]: ImageSnapshot }
  globalLayoutConfig: {},          // GlobalLayoutConfig object
}
```

### 8.2 Image Registry — Cross-Slide Persistence

The `imageRegistry` is the backbone for image persistence across all slides.

```js
// ImageSnapshot — fields persisted per element ID
{
  type: "image",
  src: "data:image/...",   // base64 data URL
  x, y, width, height,
  rotation, originX, originY, scaleX, scaleY,
  isPlaceholder: false,
  strokeDashArray: null,
}

// Fields extracted by pickImageSnapshot(el):
IMAGE_PERSIST_FIELDS = [
  "type", "src", "x", "y", "width", "height", "rotation",
  "originX", "originY", "scaleX", "scaleY", "isPlaceholder", "strokeDashArray"
]
```

**Registry lifecycle:**

| Action | Effect on Registry |
|--------|--------------------|
| `addElement(element)` | If `type === "image"` → saves `pickImageSnapshot(element)` |
| `updateElement(id, updates)` | Searches ALL slides for element; if image → merges updates into registry snapshot |
| `setActiveSlide(slideId)` | **Before switching** — snapshots all image elements on outgoing slide |
| `setDocument(newDoc)` | Calls `restoreImagesFromRegistry(newDoc, registry)` after replacing doc |
| `undo()` / `redo()` | Calls `restoreImagesFromRegistry` on restored document |
| `applyGlobalLayoutConfigToAllSlides()` | Calls `restoreImagesFromRegistry` after rebuilding all slides |
| `resetToInitial()` | Clears both document and registry |

**`restoreImagesFromRegistry(doc, registry)`** — pure utility:
- Iterates ALL slides and ALL elements
- For any `el.id` found in registry → merges saved snapshot: `{ ...el, ...saved, type: "image", isPlaceholder: false, strokeDashArray: null }`
- Handles both `type: "image"` elements and placeholder rects (by `isPlaceholder` flag or `"placeholder"` in ID)
- Returns original `doc` unchanged if registry is empty

### 8.3 Store Actions

```js
// Document
setDocument(newDocument)          // + restoreImagesFromRegistry
updateCarouselMetadata(updates)
resetToInitial()                  // clears doc + imageRegistry

// Slides
setActiveSlide(slideId)           // snapshots current slide images first
addSlide()
duplicateSlide(slideId)
deleteSlide(slideId)
updateSlideBackground(slideId, color)

// Elements
addElement(element)               // pushHistory + registers image if applicable
updateElement(id, updates)        // searches all slides; syncs image registry
deleteElement(id)                 // pushHistory

// History
pushHistory()                     // JSON.parse(JSON.stringify(doc)) → historyPast (≤30)
undo()                            // restore + restoreImagesFromRegistry
redo()                            // restore + restoreImagesFromRegistry

// Clipboard
copySelectedElement()
pasteClipboardElement(pastedImageDataUrl, pastedText)

// Global Layout
setGlobalLayoutConfig(configUpdates)
applyGlobalLayoutConfigToAllSlides(customConfig)   // + restoreImagesFromRegistry at end

// Selection & Viewport
selectElement(id)
setZoom(zoom)
toggleSafeAreaGuides()
toggleSnapToGuides()

// Image Registry (external use)
registerImage(elementId, snapshot)
```

### 8.4 GlobalLayoutConfig

Allows changing all slides at once via `GlobalLayoutSettingsPage`:

```js
{
  aspectRatio, primaryColor, accentColor, bgColor, bgPattern,
  headlineFont, bodyFont, textAlign,
  headlineFontSize, headlineColor, headlineX, headlineY,
  bodyFontSize, bodyColor, bodyX, bodyY,
  dirRectX, dirRectY, dirRectWidth, dirRectHeight,
  dirRectFill, dirRectStroke, dirRectStrokeWidth,
  dirTextX, dirTextY, dirTextFontSize, dirTextColor,
  pageNumberX, pageNumberY, pageNumberFontSize, pageNumberColor,
  swipeX, swipeY, swipeFontSize, swipeColor, swipeText,
  followX, followY, followFontSize, followColor, followText,
  showGrid, snapToGuides,
  marginTop, marginRight, marginBottom, marginLeft,
  gridColumns, gutterWidth, elementPadding,
  safeAreaMarginTop, safeAreaMarginBottom, safeAreaMarginLeft, safeAreaMarginRight,
  contentTopClearance, contentBottomClearance, contentPaddingLeft, contentPaddingRight,
}
```

---

## 9. Editor Pages

### 9.1 `CarouselBuilderPage.jsx`

Route: `/design/collection/:collectionId/post/:postId`

```
┌───────────────────────────── Header ────────────────────────────────┐
│  Post title · Track info · [Layout & Theme Settings] · Aspect ratio │
├───────────────────────────── Toolbar ───────────────────────────────┤
│  Add Heading · Add Body · Rect · Circle · Add Image                 │
│  Zoom · Guides · Undo/Redo · Delete                                 │
│  Download PNGs · Import JSON · Export JSON · Reset                  │
├────────────┬──────────────────────────────────────┬─────────────────┤
│            │                                      │                 │
│  Slide     │         Canvas Editor                │  Properties     │
│  Thumbs    │         (Fabric.js)                  │  Panel          │
│  (w-64)    │                                      │  (w-72)         │
│            │                                      │                 │
└────────────┴──────────────────────────────────────┴─────────────────┘
```

Loads post from `useCollectionData()` hook. Converts to `CarouselDocument` via `convertPostToCarouselDoc(post, themeConfig)` which calls `composeSlide()` for each slide.

### 9.2 `GlobalLayoutSettingsPage.jsx`

Route: `/design/collection/:collectionId/post/:postId/settings`

Tabs: **Positions** · **Typography** · **Margins / Safe Area** · **Theme & Colors**

Every field change immediately calls `applyGlobalLayoutConfigToAllSlides()`. The same `CanvasEditor` re-renders in real time, giving instant live preview.

---

## 10. Editor Components

### 10.1 `CanvasEditor.jsx`

- `ResizeObserver` measures container → computes `fitScale` → applied via `transform: scale(fitScale)`
- Fabric.js `Canvas` initialized once in `useEffect([], [])` — never re-initialized
- Cleaned up via `fabricRef.current?.dispose()` on unmount
- `isRenderingRef` flag suppresses spurious Zustand updates during programmatic re-renders

Event listeners:

| Fabric Event | Store Action |
|---|---|
| `selection:created/updated` | `selectElement(obj.data.id)` |
| `selection:cleared` | `selectElement(null)` |
| `object:modified` | `updateElement(id, { x, y, rotation, width, height })` with scale normalization |
| `text:changed` | `updateElement(id, { text })` |

Re-renders on `activeSlide` or `document.metadata` change (second `useEffect`).

Safe Area and Content Zone guides rendered as absolute-positioned `<div>` overlays (not on canvas).

### 10.2 `Toolbar.jsx`

Left group: Add Heading, Add Body Text, Rectangle, Circle, Add Image (`<input type="file">`)

Center group: Zoom controls, Safe Area Guides toggle, Undo, Redo, Delete Selected

Right group: Download PNGs, Import JSON, Export JSON, Reset

**PNG Export flow:**
1. Create offscreen Fabric `Canvas` at full resolution
2. For each slide: `renderSlide(offscreenCanvas, slide, metadata)`
3. Wait 150ms for async image loads
4. `toDataURL({ format: "png", multiplier: 2 })` → trigger download link

**JSON Import flow:**
`FileReader` → parse → `carouselDocumentSchema.safeParse()` → if valid: `setDocument(parsed.data)` → images restored automatically via registry

### 10.3 `SlideThumbnails.jsx`

Left panel — displays all slides as mini preview cards:

- Extracts headline and body text from elements for preview text
- Shows `💡 AI Image Prompt Available` badge when `slide.visualDirective` is set
- Hover actions: Duplicate slide, Delete slide
- Clicking activates `setActiveSlide(slideId)`

### 10.4 `PropertiesPanel.jsx`

Right panel — context-aware based on `selectedElementId`:

**No element selected:**
- Slide background color picker → `updateSlideBackground()`
- AI Image Prompt card (copy prompt to clipboard, upload image to placeholder)
- Asset Name tags display
- Safe Area + Content Zone bounds readout

**Element selected:**
- `type: "image"` → thumbnail preview + Replace Image button
- `type: "text" / "headline"` → textarea, font size, font family, text align, text color
- `type: "rect" / "circle"` → fill color, stroke color, stroke width
- All elements → X, Y, rotation transform inputs
- Align & Distribute → Left, Center H, Right, Both Center, Distribute Vertically

---

## 11. Schema Validation (`carouselSchema.js`)

Uses Zod v4 discriminated union:

```js
// Schemas
baseElementSchema      // id, x, y, rotation, zIndex
rectElementSchema      // extends base: type:"rect", width, height, fill, stroke, strokeWidth
circleElementSchema    // extends base: type:"circle", radius, fill, stroke, strokeWidth
textElementSchema      // extends base: type:"text", text, fontSize, fontFamily, fill
imageElementSchema     // extends base: type:"image", src, width?, height?

elementSchema = z.discriminatedUnion("type", [...])

slideSchema            // id, backgroundColor, elements[]
carouselDocumentSchema // schemaVersion, metadata, activeSlideId, slides[]
```

Import validation: `carouselDocumentSchema.safeParse(parsed)` → show error alert on failure, call `setDocument` on success.

---

## 12. Routing (`router.jsx`)

```
/                                            → HomePage
/design/collection/:collectionId/post/:postId          → CarouselBuilderPage
/design/collection/:collectionId/post/:postId/settings → GlobalLayoutSettingsPage
/:projectSlug/design/collection/:collectionId/post/:postId          → CarouselBuilderPage
/:projectSlug/design/collection/:collectionId/post/:postId/settings → GlobalLayoutSettingsPage
/collection/:collectionId/post/:postId/edit            → CarouselBuilderPage
/:projectSlug/content                        → ContentManagementPage
/:projectSlug/collection/:collectionId                 → TrackPage
/search                                      → SearchPage
*                                            → NotFoundPage
```

All routes wrapped in `WorkspaceLayout` shell with `ErrorBoundary` as `errorElement`.

---

## 13. Data Loading

`useCollectionData.js` → loads `data.json`, provides:
- `designs: Post[]`
- `collectionIdMap: { [collectionId]: ColorPalette }`
- `collectionPalettes: { [collectionName]: ColorPalette }`

`convertPostToCarouselDoc(post, themeConfig)`:
1. Maps each `post.slides[]` → `composeSlide(contentElements, options)`
2. Sets headline, body text, visual directive placeholder card
3. Applies track color palette as theme config
4. Attaches `imagePrompt`, `visualDirective`, `assetName` to each slide

---

## 14. Image Upload & Persistence System

### Upload Paths

**A. Toolbar "Add Image" button**
```
File selected → FileReader.readAsDataURL()
  → addElement({ type: "image", src: dataUrl, x, y, width, height, ... })
  → addElement() calls pickImageSnapshot(element) → saved to imageRegistry
```

**B. PropertiesPanel "Upload Image" (AI Prompt Card)**
```
File selected → FileReader.readAsDataURL()
  → find placeholder: el.isPlaceholder || el.id.includes("placeholder")
  → updateElement(placeholderId, { type:"image", src:dataUrl, isPlaceholder:false, strokeDashArray:null })
  → updateElement() detects image element → saves full snapshot to imageRegistry
```

### Persistence Guarantees

| Scenario | Mechanism |
|---|---|
| Switch slides | `setActiveSlide` snapshots outgoing slide's images **before** switching |
| Global layout reapply | `applyGlobalLayoutConfigToAllSlides` calls `restoreImagesFromRegistry` at end |
| `setDocument` (post load) | `setDocument` calls `restoreImagesFromRegistry` on new doc |
| Undo / Redo | Both call `restoreImagesFromRegistry` on restored document |
| Image drag/resize | `updateElement` merges new geometry into registry snapshot |

### `pickImageSnapshot(el)` — Persisted Fields

```js
IMAGE_PERSIST_FIELDS = [
  "type", "src",
  "x", "y", "width", "height", "rotation",
  "originX", "originY", "scaleX", "scaleY",
  "isPlaceholder", "strokeDashArray"
]
```

---

## 15. History System

- `pushHistory()` → `JSON.parse(JSON.stringify(document))` → appended to `historyPast` (capped at 30); clears `historyFuture`
- `undo()` → restores `historyPast[last]` + `restoreImagesFromRegistry`
- `redo()` → restores `historyFuture[0]` + `restoreImagesFromRegistry`

History is pushed on: `addElement`, `deleteElement`, `setDocument`.
`updateElement` does **not** push history (continuous drag would create hundreds of states).

---

## 16. Keyboard Shortcuts

```
Delete / Backspace       → deleteElement(selectedElementId)
Ctrl/Cmd + Z             → undo()
Ctrl/Cmd + Y             → redo()
Ctrl/Cmd + Shift + Z     → redo()
Ctrl/Cmd + C             → copySelectedElement()
Ctrl/Cmd + V             → pasteClipboardElement()
Ctrl/Cmd + D             → duplicate selected element
Arrow keys               → move element ±1px
Shift + Arrow keys       → move element ±10px
```

Paste handler reads `navigator.clipboard` items: image → data URL, text → plain text string.

---

## 17. Clipboard System (`useClipboard.js`)

Handles browser `paste` events:
- Image blob → `FileReader.readAsDataURL()` → `pasteClipboardElement(dataUrl, null)`
- Text → `pasteClipboardElement(null, plainText)`

`pasteClipboardElement(pastedImageDataUrl, pastedText)`:
1. **Image** → find existing placeholder → `updateElement` (replace) OR `addElement` (new free-form)
2. **Clipboard element** (internal Ctrl+C) → deep-clone with new ID → `addElement`
3. **Plain text** → create new text element → `addElement`

---

## 18. Export System

### PNG Export (all slides, 2× resolution)

1. Create offscreen `Canvas` (Fabric) — same dimensions as canvas metadata
2. For each slide: `renderSlide(offscreenFabric, slide, metadata)`
3. Await 150ms (async `onload` settle time for images)
4. `toDataURL({ format: "png", multiplier: 2 })` → create `<a>` download link → click

### JSON Export

`JSON.stringify(document, null, 2)` → `Blob` → download as `.json`

### JSON Import

`FileReader` → `JSON.parse` → `carouselDocumentSchema.safeParse()` → valid: `setDocument(parsed.data)` → invalid: `alert(error message)`

---

## 19. Visual Design System

### Editor Shell Color Palette (dark theme)

```
bg-slate-950         — canvas workspace background
bg-slate-900         — toolbar, sidebar, panel backgrounds
bg-slate-800         — button surfaces, input backgrounds
border-slate-800     — panel borders
border-slate-700     — dividers
text-slate-200       — primary labels
text-slate-400       — secondary / muted labels
blue-600             — primary action, selection, accent
```

### Fabric Selection Handles (`SELECTION_CONTROL_CONFIG`)

```js
{
  transparentCorners: false,
  cornerColor: "#2563eb",       // vivid blue fill
  cornerStrokeColor: "#ffffff", // white outer ring
  cornerSize: 16,
  cornerStyle: "circle",
  borderColor: "#2563eb",
  borderScaleFactor: 2,
  padding: 4,
  touchCornerSize: 32,          // generous touch target
}
```

### Typography

- Use Inter from Google Fonts for all canvas text
- `text-xs` (12px) for panel UI labels
- Monospace for pixel / number readout inputs

---

## 20. Background Pattern System (`patterns.js`)

Patterns rendered as repeating SVG data URLs, applied via Fabric `Pattern`:

| Key      | Appearance            |
|----------|-----------------------|
| `solid`  | No pattern (default)  |
| `dots`   | Subtle dot grid       |
| `grid`   | Thin crosshatch grid  |
| `lines`  | Diagonal hatching     |

Applied by `renderSlide()` as `new Pattern({ source: imgEl, repeat: "repeat" })`.

---

## 21. Performance Rules

- Subscribe to minimum Zustand state slice per component (avoid full store subscriptions)
- `isRenderingRef` flag prevents Fabric event loops during programmatic canvas re-renders
- Image `onload` handler always checks `fabricImg.canvas` before calling `renderAll()`
- PNG export uses offscreen canvas — never disrupts the live editor canvas
- `pushHistory` deep-clone is synchronous `JSON.parse(JSON.stringify())`, capped at 30 entries
- `applyGlobalLayoutConfigToAllSlides` calls should be debounced at the UI input level

---

## 22. Error Handling

- JSON import: Zod validates → user-friendly alert on failure, never crashes
- Image upload: `FileReader.onload` handles gracefully
- Canvas cleanup: `fabricRef.current?.dispose()` in `useEffect` cleanup
- All routes wrapped in `ErrorBoundary`
- `restoreImagesFromRegistry` is a pure function — safe to call with empty registry (returns doc unchanged)

---

## 23. Actual Folder Structure

```
src/
├── main.jsx
├── router.jsx
│
├── workspace/
│   ├── WorkspaceLayout.jsx
│   ├── Navbar.jsx
│   ├── BreadcrumbNav.jsx
│   ├── CarouselLogoBadge.jsx
│   └── Toast.jsx
│
├── projects/
│   ├── carousel-editor/
│   │   ├── pages/
│   │   │   ├── CarouselBuilderPage.jsx
│   │   │   └── GlobalLayoutSettingsPage.jsx
│   │   ├── components/
│   │   │   ├── CanvasEditor.jsx
│   │   │   ├── Toolbar.jsx
│   │   │   ├── SlideThumbnails.jsx
│   │   │   └── PropertiesPanel.jsx
│   │   ├── canvas/
│   │   │   ├── fabricAdapter.js
│   │   │   ├── renderer.js
│   │   │   ├── patterns.js
│   │   │   └── snapGuideEngine.js
│   │   ├── store/
│   │   │   └── carouselStore.js
│   │   ├── theme/
│   │   │   ├── theme.js
│   │   │   ├── compose.js
│   │   │   └── chrome.js
│   │   ├── data/
│   │   │   └── initialCarousel.js
│   │   └── schemas/
│   │       └── carouselSchema.js
│   │
│   └── track-content/
│       ├── pages/
│       │   ├── HomePage.jsx
│       │   ├── TrackPage.jsx
│       │   ├── PostPage.jsx
│       │   ├── SearchPage.jsx
│       │   ├── DesignSystemPage.jsx
│       │   ├── ContentManagementPage.jsx
│       │   └── NotFoundPage.jsx
│       └── routes/
│           ├── TrackRoute.jsx
│           └── PostRoute.jsx
│
├── domain/
│   ├── config/
│   ├── layout/
│   ├── post/
│   └── slide/
│
├── infrastructure/
│   ├── assets/
│   └── persistence/
│
├── shared/
│   ├── components/
│   │   └── ErrorBoundary.jsx
│   ├── hooks/
│   │   ├── useCollectionData.js
│   │   ├── useClipboard.js
│   │   ├── useCustomAssets.js
│   │   └── useTrackData.js
│   ├── utils/
│   ├── styles/
│   └── config/
│
└── schemas/
    └── carousel-post.schema.json
```

---

## 24. Example Canonical JSON

The editor must render this without any slide-specific hardcoded logic:

```json
{
  "schemaVersion": 1,
  "metadata": {
    "title": "5 Principles of Great Code",
    "width": 1080,
    "height": 1350,
    "aspectRatio": "4:5",
    "bgPattern": "solid",
    "textAlign": "left"
  },
  "activeSlideId": "slide_1",
  "slides": [
    {
      "id": "slide_1",
      "backgroundColor": "#ffffff",
      "imagePrompt": "A clean minimal poster with a circuit board pattern",
      "visualDirective": "Visual: Abstract architecture diagram showing modular components",
      "assetName": ["architecture-diagram"],
      "elements": [
        {
          "id": "rect_slide_1_bg",
          "type": "rect",
          "x": 540, "y": 678,
          "width": 920, "height": 1190,
          "originX": "center", "originY": "center",
          "fill": "#f8fafc", "stroke": "#cbd5e1", "strokeWidth": 2,
          "rotation": 0, "zIndex": 1
        },
        {
          "id": "el_head_slide_1",
          "type": "headline",
          "x": 140, "y": 210, "width": 800,
          "text": "5 Principles of Great Code",
          "fontSize": 44, "fontFamily": "Inter", "fill": "#0f172a",
          "rotation": 0, "zIndex": 3
        },
        {
          "id": "text_slide_1_body",
          "type": "text",
          "x": 140, "y": 409, "width": 800,
          "text": "Crafting maintainable, resilient software architecture.",
          "fontSize": 30, "fontFamily": "Inter", "fill": "#475569",
          "rotation": 0, "zIndex": 4
        },
        {
          "id": "rect_slide_1_visual_placeholder",
          "type": "rect",
          "x": 540, "y": 794,
          "width": 760, "height": 480,
          "originX": "center", "originY": "center",
          "fill": "#f8fafc", "stroke": "#C84B31",
          "strokeWidth": 2, "strokeDashArray": [8, 8],
          "rotation": 0, "zIndex": 5,
          "isPlaceholder": true
        },
        {
          "id": "chrome_badge",
          "type": "badge",
          "x": 540, "y": 140,
          "text": "SWE NOTEBOOK",
          "fontSize": 26, "fontFamily": "Inter", "fill": "#C84B31",
          "originX": "center", "originY": "center",
          "rotation": 0, "zIndex": 10,
          "isChrome": true
        },
        {
          "id": "chrome_page_number",
          "type": "text",
          "x": 140, "y": 1210,
          "text": "01 / 08",
          "fontSize": 24, "fontFamily": "Inter", "fill": "#64748b",
          "rotation": 0, "zIndex": 10,
          "isChrome": true
        },
        {
          "id": "chrome_swipe",
          "type": "text",
          "x": 940, "y": 1210,
          "text": "Swipe →",
          "fontSize": 24, "fontFamily": "Inter", "fill": "#64748b",
          "originX": "right",
          "rotation": 0, "zIndex": 10,
          "isChrome": true
        }
      ]
    }
  ]
}
```

---

## 25. Critical Architectural Principles

1. **JavaScript only.** No TypeScript. No `.ts` or `.tsx` files anywhere in the project.

2. **Fabric.js v7 only** for canvas. No Konva, no react-konva, no raw Canvas 2D API calls from React components.

3. **JSON is the source of truth.** The flow is always `Zustand → renderSlide() → Fabric`. Canvas never holds its own authoritative state.

4. **Image registry is the persistence backbone.** Every image upload immediately registers a full snapshot (`pickImageSnapshot`). No image should ever be lost due to slide switching, layout reapplication, undo/redo, or document reload.

5. **`THEME` is the design token system.** All layout pixel values reference `THEME` constants — never hardcode numbers in component files.

6. **`composeSlide` is the slide factory.** Never manually assemble chrome elements in page-level code. Always call `composeSlide()`.

7. **`applyGlobalLayoutConfigToAllSlides` must end with `restoreImagesFromRegistry`.** Layout rewrites must never erase uploaded images.

8. **Zod validates all JSON imports.** Never call `setDocument()` with unvalidated data.

9. **Tailwind CSS v4 conventions.** Use `@tailwindcss/vite` plugin. Do not use PostCSS config or v3 purge configuration.

10. **Component rules:**
    - No business logic in presentation-only components
    - No direct `localStorage` calls in UI components
    - No API calls from canvas components
    - Canvas renderer driven entirely by JSON — no side effects
    - UI state stays separate from project/document state

---

## 26. Final Acceptance Criteria

The implementation is complete only when a user can:

1. Open the editor and see a pre-composed carousel.
2. View and navigate between all carousel slides via the thumbnail panel.
3. Add text elements (heading and body) to any slide.
4. Add shape elements (rectangle, circle) to any slide.
5. Upload images via the toolbar button or AI prompt card on any slide.
6. See uploaded images persist when switching between slides.
7. See uploaded images persist when applying global layout settings.
8. See uploaded images persist through undo and redo.
9. See uploaded image position and size persist after moving/resizing then switching slides.
10. Move and resize elements using Fabric.js canvas handles.
11. Edit text content, font, size, color via the properties panel.
12. Edit shape fill, stroke, and stroke width via the properties panel.
13. Align elements (left, center H, both center, distribute) via the properties panel.
14. Duplicate and delete slides from the thumbnail panel.
15. Duplicate and delete elements via toolbar or keyboard.
16. Undo and redo up to 30 steps.
17. Zoom in/out and fit the canvas to the viewport.
18. Toggle safe area and content zone guide overlays.
19. Snap elements to canvas center, edges, and other elements during drag.
20. Apply global layout config and see all slides update live in real time.
21. Import a valid JSON file and see the carousel render correctly.
22. Export the current document as a JSON file.
23. Download all slides as high-resolution PNG files (2× multiplier, 1080×2700 for 4:5).
24. Use keyboard shortcuts (delete, undo, redo, copy, paste, duplicate, arrows).
25. Paste images and text directly from the system clipboard.
26. Navigate from the `ContentManagementPage` into the carousel editor for any post.
27. View the AI image prompt for each slide and copy it to the clipboard.
28. Use the application fully without any knowledge of the underlying backend.

---

## 27. Quality Bar

Do not produce a prototype. Build a **real editor architecture**:

- ✅ Clean JavaScript (JSX) — zero TypeScript
- ✅ Fabric.js v7 with correct initialization, event lifecycle, and cleanup
- ✅ JSON-first data model — Zustand is the single source of truth
- ✅ Image registry for lossless multi-slide image persistence
- ✅ `composeSlide` / `autoLayoutContent` / `buildChrome` composition pipeline
- ✅ `THEME`-driven layout constants throughout
- ✅ Zod v4 schema validation on every JSON import
- ✅ 30-step bounded history with image restoration on undo/redo
- ✅ Real-time snap guide engine during drag
- ✅ Global layout config propagation across all slides
- ✅ Production-quality dark UI (slate-900/950, blue-600 accents)
- ✅ Responsive shell — canvas remains visible at all viewport widths

**Pre-submission checklist — inspect for:**

- [ ] Images lost when switching slides (imageRegistry `setActiveSlide` snapshot missing?)
- [ ] Images lost after `applyGlobalLayoutConfigToAllSlides` (missing `restoreImagesFromRegistry` call?)
- [ ] Incorrect element classification in `applyGlobalLayoutConfigToAllSlides` (image elements must pass through as `resEl = el`)
- [ ] Chrome elements selectable on canvas (they must be `selectable: false, evented: false`)
- [ ] Fabric.js event listener leaks (`useEffect` cleanup not removing listeners?)
- [ ] Z-index ordering broken after element add/delete
- [ ] Placeholder rects not detected on upload (check `isPlaceholder` flag and `"placeholder"` in ID)
- [ ] History polluted by drag events (only `addElement`, `deleteElement`, `setDocument` push history)
- [ ] `updateElement` only searching active slide (must search ALL slides for registry update)
