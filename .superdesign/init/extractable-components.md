# Extractable Components — Friendly Canvas

## Layout Components (appear on most pages)

### Navbar
- Source: `src/workspace/Navbar.jsx`
- Category: layout
- Description: Sticky top navigation with brand logo, center search bar, and global action buttons
- Extractable props:
  - `searchTerm` (string, default: "") — current search input value
  - `currentPath` (string, default: "") — active route path for link state
- Hardcoded: "Carousel" brand name, "Workspace & Studio" subtitle, "Create Design" and "Layouts" nav links, icon names (Search, PlusSquare, Layout, Menu, X)

### WorkspaceLayout
- Source: `src/workspace/WorkspaceLayout.jsx`
- Category: layout
- Description: Root app shell with conditional Navbar, sidebar, breadcrumb, and outlet
- Extractable props:
  - `hideNavbar` (boolean, derived) — hides Navbar on /design/* routes
  - `shouldShowSidebar` (boolean, derived) — shows Collectionsidebar on /collection/* routes
- Hardcoded: bg-[#0f1117], text-slate-100, flex-col layout structure

### Collectionsidebar
- Source: `src/projects/collection-content/components/Collectionsidebar.jsx`
- Category: layout
- Description: Collapsible left sidebar listing content Collections and their posts
- Extractable props:
  - `isCollapsed` (boolean, default: false)
  - `activeCollection` (string) — currently selected collection name
  - `activePost` (object) — currently selected post
- Hardcoded: sidebar width, collapse toggle icon, track pill styling

---

## Basic Components (used across pages)

### Toolbar (Carousel Editor)
- Source: `src/projects/carousel-editor/components/Toolbar.jsx`
- Category: basic
- Description: Horizontal toolbar for the carousel editor with slide tools, zoom controls, and snap toggle
- Extractable props:
  - `snapToGuides` (boolean) — snap-to-guide state
  - `zoom` (number) — current zoom level
- Hardcoded: tool icon names, layout, button styles

### SlideThumbnails (Carousel Editor)
- Source: `src/projects/carousel-editor/components/SlideThumbnails.jsx`
- Category: basic
- Description: Vertical strip of slide thumbnails for navigating between carousel slides
- Extractable props:
  - `activeSlideIndex` (number, default: 0)
  - `slideCount` (number)
- Hardcoded: thumbnail dimensions (180×225 aspect), add/delete controls

### PropertiesPanel (Carousel Editor)
- Source: `src/projects/carousel-editor/components/PropertiesPanel.jsx`
- Category: basic
- Description: Right-side properties panel for editing selected element (text, image, position, style)
- Extractable props:
  - `selectedElementType` (string) — "text" | "image" | "rect" etc.
- Hardcoded: property field labels, color pickers, alignment controls

### Toast
- Source: `src/workspace/Toast.jsx`
- Category: basic
- Description: Slide-in toast notification at bottom of screen
- Extractable props:
  - `toast` (object | null) — `{ type, title, message }`
- Hardcoded: position (bottom-center), animation timing, icon per type

### BreadcrumbNav
- Source: `src/workspace/BreadcrumbNav.jsx`
- Category: basic
- Description: Contextual breadcrumb trail showing current track and post position
- Extractable props:
  - `activeCollection` (string)
  - `postsByCollection` (object)
- Hardcoded: separator style, "Home" label, chevron icon
