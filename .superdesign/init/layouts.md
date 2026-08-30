# Layouts — Friendly Canvas

## App Shell: WorkspaceLayout
- **File**: `src/workspace/WorkspaceLayout.jsx`
- **Description**: Root layout for all routes. Conditionally renders Navbar, TrackSidebar, BreadcrumbNav, and Toast. Passes data context to all child pages via React Router `<Outlet context>`.

```jsx
// src/workspace/WorkspaceLayout.jsx
import React, { useState, useEffect, useMemo } from 'react'
import { Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import Navbar from './Navbar'
import BreadcrumbNav from './BreadcrumbNav'
import Toast from './Toast'
import TrackSidebar from '../projects/track-content/components/TrackSidebar'
import { useTrackData } from '../projects/track-content/hooks/useTrackData'

export default function WorkspaceLayout() {
  const location = useLocation()
  // ... state: isSidebarCollapsed, searchTerm, clipboardStatus

  const isBuilderPage = location.pathname.startsWith('/builder') ||
    location.pathname.startsWith('/layout-builder') ||
    location.pathname.startsWith('/design')

  const shouldShowSidebar = useMemo(() => {
    if (location.pathname.endsWith('/edit') || location.pathname.includes('/content')) return false
    return (
      location.pathname.startsWith('/track') ||
      location.pathname.includes('carousel-design') ||
      location.pathname === '/system-design' ||
      location.pathname === '/design-system'
    )
  }, [location.pathname])

  const isCreatePostPage = location.pathname.includes('/design') || location.pathname === '/post-builder' || location.pathname.endsWith('/edit')
  const hideNavbar = isCreatePostPage || isCanvasEditorPage

  return (
    <div className="min-h-screen flex flex-col bg-[#0f1117] text-slate-100 font-sans">
      {!hideNavbar && (
        <Navbar searchTerm={searchTerm} setSearchTerm={handleSearch} currentPath={location.pathname} />
      )}
      <div className="flex flex-1 relative">
        {shouldShowSidebar && (
          <TrackSidebar
            tracks={tracks} trackPalettes={trackPalettes}
            activeTrack={activeTrack} activePost={activePost}
            onSelectTrack={handleSelectTrack} onSelectPost={handleSelectPost}
            postsByTrack={postsByTrack}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
        )}
        <main className={`flex-1 min-w-0 w-full ${isBuilderPage || isCreatePostPage ? 'p-0 max-w-none' : shouldShowSidebar ? 'p-4 md:p-8 max-w-7xl mx-auto' : 'p-4 md:p-8 max-w-6xl mx-auto'}`}>
          {!isBuilderPage && !isContentManagementPage && !isCreatePostPage && (
            <BreadcrumbNav tracks={tracks} trackPalettes={trackPalettes} activeTrack={activeTrack} postsByTrack={postsByTrack} />
          )}
          <Outlet context={{ activeTrack, currentTrackIndex, currentTrackPosts, trackPalettes, posts, postsByTrack, tracks, chapterCovers, designSystem, visualGlossary, onCopy, onSelectTrack, onSelectPost }} />
        </main>
      </div>
      <Toast toast={clipboardStatus.type ? clipboardStatus : null} onClose={resetStatus} />
    </div>
  )
}
```

---

## Top Navigation: Navbar
- **File**: `src/workspace/Navbar.jsx`
- **Description**: Sticky top header with brand logo badge, center search bar, and action buttons (Create Design, Layouts). Hidden on full-screen editor routes.

```jsx
// src/workspace/Navbar.jsx — renders:
<header className="sticky top-0 z-50 flex items-center justify-between gap-4 px-4 py-2.5 bg-[#0f1117]/90 backdrop-blur-md border-b border-white/10 shadow-xs select-none font-sans">
  {/* Left: Brand Logo */}
  <div className="flex items-center gap-3 shrink-0">
    <Link to="/" className="flex items-center gap-2.5 no-underline group">
      <CarouselLogoBadge size={34} />
      <div className="flex flex-col">
        <span className="font-serif font-extrabold text-base md:text-lg text-slate-100 leading-none tracking-tight group-hover:text-cyan-400 transition-colors">Carousel</span>
        <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider font-semibold leading-tight hidden sm:block">Workspace & Studio</span>
      </div>
    </Link>
  </div>
  {/* Center: Search Bar */}
  <div className="flex-1 max-w-lg mx-auto">
    <div className="relative flex items-center w-full">
      <Search className="w-4 h-4 absolute left-3 text-slate-400 pointer-events-none" />
      <input type="text" className="w-full bg-[#1a1e2a] hover:bg-[#222736] focus:bg-[#222736] text-slate-200 text-xs md:text-sm pl-9 pr-7 py-1.5 rounded-lg border border-white/10 focus:border-cyan-400/60 focus:outline-none transition-all placeholder:text-slate-500 font-sans" placeholder="Search tracks, topics, slides…" />
    </div>
  </div>
  {/* Right: Actions */}
  <div className="flex items-center gap-2 shrink-0">
    <Link to="/design/new" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-mono bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
      <PlusSquare className="w-3.5 h-3.5" /><span>Create Design</span>
    </Link>
    <Link to="/layout-builder" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-mono bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10">
      <Layout className="w-3.5 h-3.5" /><span>Layouts</span>
    </Link>
  </div>
</header>
```

---

## Breadcrumb Navigation: BreadcrumbNav
- **File**: `src/workspace/BreadcrumbNav.jsx`
- **Description**: Contextual breadcrumb showing track and post context. Hidden on builder/editor pages.

---

## Brand Badge: CarouselLogoBadge
- **File**: `src/workspace/CarouselLogoBadge.jsx`
- **Description**: SVG logo badge for the navbar brand. Accepts `size` prop (default 34px).
