# Pages — Friendly Canvas (Dependency Trees)

## / (Home Page)
Entry: `src/projects/collection-content/pages/HomePage.jsx`
Dependencies:
- `src/workspace/WorkspaceLayout.jsx` (shell)
  - `src/workspace/Navbar.jsx`
    - `src/workspace/CarouselLogoBadge.jsx`
  - `src/workspace/BreadcrumbNav.jsx`
  - `src/workspace/Toast.jsx`
- `src/shared/styles/index.css`

Summary: Main landing page showing all content Collections as cards, featured/recent posts, and quick-access links. Dark themed with cyan accent. Collections presented as a grid of colored cards.

---

## /collection/:collectionId (Track Page)
Entry: `src/projects/collection-content/pages/collectionPage.jsx`
Dependencies:
- `src/workspace/WorkspaceLayout.jsx` (shell + sidebar)
  - `src/workspace/Navbar.jsx`
  - `src/projects/collection-content/components/Collectionsidebar.jsx`
  - `src/workspace/BreadcrumbNav.jsx`

Summary: Lists all posts within a specific learning track. Left sidebar shows track navigation. Main area shows post cards in grid.

---

## /collection/:collectionId/post/:postId (Post Page)
Entry: `src/projects/collection-content/pages/PostPage.jsx`
Dependencies:
- `src/workspace/WorkspaceLayout.jsx` (shell + sidebar)
- `src/projects/collection-content/routes/PostRoute.jsx`

Summary: Individual post detail view. Shows post content, carousel slides preview, and next/prev navigation.

---

## /design/collection/:collectionId/post/:postId (Carousel Builder — MAIN EDITOR)
Entry: `src/projects/carousel-editor/pages/CarouselBuilderPage.jsx`
Dependencies:
- `src/workspace/WorkspaceLayout.jsx` (shell — NO Navbar)
- `src/projects/carousel-editor/components/Toolbar.jsx`
  - lucide-react icons
  - `src/projects/carousel-editor/store/carouselStore.js`
- `src/projects/carousel-editor/components/SlideThumbnails.jsx`
  - `src/projects/carousel-editor/store/carouselStore.js`
- `src/projects/carousel-editor/components/CanvasEditor.jsx`
  - `src/projects/carousel-editor/canvas/snapGuideEngine.js`
  - `src/projects/carousel-editor/canvas/fabricAdapter.js`
  - `src/projects/carousel-editor/store/carouselStore.js`
- `src/projects/carousel-editor/components/PropertiesPanel.jsx`
  - `src/projects/carousel-editor/store/carouselStore.js`
- `src/projects/carousel-editor/store/carouselStore.js`
  - `src/projects/carousel-editor/store/imageRegistry.js`
  - `src/projects/carousel-editor/theme/defaultGlobalLayout.js`
  - `src/projects/carousel-editor/data/initialCarousel.js`
- `src/shared/styles/index.css`

Summary: Full-screen canvas editor. Three-panel layout: left=SlideThumbnails, center=CanvasEditor (FabricJS), right=PropertiesPanel. Toolbar at top. No app navbar shown. This is the primary product screen.

Layout structure:
```
┌─────────────────────────────────────────────┐
│  Toolbar (h-11, full width)                 │
├──────────┬──────────────────────┬───────────┤
│ Slide    │   Canvas Editor      │ Properties│
│ Thumbs   │   (FabricJS)         │  Panel    │
│ (100px)  │   (flex-1)           │ (280px)   │
└──────────┴──────────────────────┴───────────┘
```

---

## /design/collection/:collectionId/post/:postId/settings (Global Layout Settings)
Entry: `src/projects/carousel-editor/pages/GlobalLayoutSettingsPage.jsx`
Dependencies:
- `src/workspace/WorkspaceLayout.jsx` (shell — NO Navbar)
- `src/projects/carousel-editor/store/carouselStore.js`
- `src/shared/styles/index.css`

Summary: Settings page for carousel global layout config: background, typography, color palette, safe area guides, snap settings. Large form with sections, preview panel.

---

## /:projectSlug/content (Content Management)
Entry: `src/projects/collection-content/pages/ContentManagementPage.jsx`
Dependencies:
- `src/workspace/WorkspaceLayout.jsx` (shell — NO Navbar)
- `src/projects/collection-content/hooks/useTrackData.js`
- `src/shared/data/data.json`

Summary: Content management dashboard. Track/post list on left, post editor/viewer on right. No navbar. Wide two-column layout.

---

## /:projectSlug/carousel-design (Design System Page)
Entry: `src/projects/collection-content/pages/DesignSystemPage.jsx`
Dependencies:
- `src/workspace/WorkspaceLayout.jsx` (shell + Navbar)
- `src/projects/collection-content/hooks/useTrackData.js`

Summary: Visual design system reference page. Shows all theme tokens, typography samples, color palettes, and component previews.

---

## /search (Search Page)
Entry: `src/projects/collection-content/pages/SearchPage.jsx`
Dependencies:
- `src/workspace/WorkspaceLayout.jsx` (shell + Navbar)
- `src/projects/collection-content/hooks/useTrackData.js`

Summary: Search results page. Search bar at top (synced with navbar). Filtered list of matching posts/Collections below.
