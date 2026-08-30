# Shared UI Components — Friendly Canvas

## Framework
- **React 19** + **Tailwind CSS v4** + **lucide-react** icons
- No UI component library (custom components throughout)
- **FabricJS v7** for canvas editor
- **Zustand v5** for state management

---

## Navbar
- **File**: `src/workspace/Navbar.jsx`
- **Description**: Sticky app-wide top navigation with brand, search, and global actions

```jsx
// src/workspace/Navbar.jsx (129 lines)
import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Layout, Menu, X, Search, PlusSquare } from 'lucide-react'
import CarouselLogoBadge from './CarouselLogoBadge'

export default function Navbar({ searchTerm = '', setSearchTerm, currentPath = '' }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between gap-4 px-4 py-2.5 bg-[#0f1117]/90 backdrop-blur-md border-b border-white/10 shadow-xs select-none font-sans">
      <div className="flex items-center gap-3 shrink-0">
        <Link to="/" className="flex items-center gap-2.5 no-underline group">
          <CarouselLogoBadge size={34} />
          <div className="flex flex-col">
            <span className="font-serif font-extrabold text-base md:text-lg text-slate-100 leading-none tracking-tight group-hover:text-cyan-400 transition-colors">Carousel</span>
            <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider font-semibold leading-tight hidden sm:block">Workspace & Studio</span>
          </div>
        </Link>
      </div>
      <div className="flex-1 max-w-lg mx-auto">
        <div className="relative flex items-center w-full">
          <Search className="w-4 h-4 absolute left-3 text-slate-400 pointer-events-none" />
          <input type="text" className="w-full bg-[#1a1e2a] hover:bg-[#222736] focus:bg-[#222736] text-slate-200 text-xs md:text-sm pl-9 pr-7 py-1.5 rounded-lg border border-white/10 focus:border-cyan-400/60 focus:outline-none transition-all placeholder:text-slate-500 font-sans" placeholder="Search tracks, topics, slides…" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>
      <div className="hidden md:flex items-center gap-2">
        <Link to="/design/new" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-mono bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 hover:border-cyan-400/50 no-underline shadow-sm transition-all">
          <PlusSquare className="w-3.5 h-3.5" /><span>Create Design</span>
        </Link>
        <Link to="/layout-builder" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-mono bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 no-underline transition-all">
          <Layout className="w-3.5 h-3.5" /><span>Layouts</span>
        </Link>
      </div>
    </header>
  )
}
```

---

## CarouselLogoBadge
- **File**: `src/workspace/CarouselLogoBadge.jsx`
- **Description**: SVG canvas-art logo badge with gradient, accepts `size` prop

---

## Toast
- **File**: `src/workspace/Toast.jsx`
- **Description**: Animated bottom-center toast notification

```jsx
// src/workspace/Toast.jsx — renders when toast !== null:
<div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-5 py-3 rounded-xl bg-[#1a1e2a] border border-white/10 shadow-2xl text-sm text-slate-100 font-sans animate-slide-up">
  {/* icon based on toast.type */}
  <div>
    <p className="font-semibold text-slate-100">{toast.title}</p>
    {toast.message && <p className="text-xs text-slate-400 mt-0.5">{toast.message}</p>}
  </div>
</div>
```

---

## Toolbar (Carousel Editor)
- **File**: `src/projects/carousel-editor/components/Toolbar.jsx` (14KB)
- **Description**: Full-featured toolbar with tool selection, zoom, snap, and slide actions

Key sections (horizontal strip at top of canvas editor):
```jsx
// Renders: fixed top bar in carousel editor
<div className="flex items-center justify-between px-3 py-1.5 bg-[#0f1117] border-b border-white/10 h-11 shrink-0">
  {/* Left: Back, Title, Slide counter */}
  {/* Center: Tool buttons (select, text, image, shape, etc.) */}
  {/* Right: Snap toggle, zoom controls, export */}
</div>
```

---

## SlideThumbnails (Carousel Editor)
- **File**: `src/projects/carousel-editor/components/SlideThumbnails.jsx` (6KB)
- **Description**: Left panel of slide thumbnail previews with add/delete controls

```jsx
// Renders: left vertical strip
<div className="w-[84px] md:w-[100px] shrink-0 flex flex-col bg-[#151821] border-r border-white/10 overflow-y-auto">
  {slides.map((slide, i) => (
    <button key={slide.id} className={`relative group m-1.5 rounded-lg border-2 transition-all ${i === activeIndex ? 'border-cyan-400 shadow-cyan-400/20 shadow-md' : 'border-white/10 hover:border-white/30'}`}>
      {/* slide mini preview */}
    </button>
  ))}
  <button className="m-1.5 rounded-lg border-2 border-dashed border-white/20 hover:border-cyan-400/50 text-slate-500 hover:text-cyan-400">+</button>
</div>
```

---

## PropertiesPanel (Carousel Editor)
- **File**: `src/projects/carousel-editor/components/PropertiesPanel.jsx` (32KB)
- **Description**: Right side panel for selected element properties (text style, alignment, position, image upload, z-index)

```jsx
// Renders: right side panel, 280px wide
<div className="w-[280px] shrink-0 bg-[#151821] border-l border-white/10 flex flex-col overflow-y-auto text-xs text-slate-200 font-sans">
  {selectedElement ? (
    // Shows: text style controls, alignment, position/size, colors, layer order
    <div className="p-3 space-y-4">...</div>
  ) : (
    // Shows: "No element selected" placeholder
    <div className="flex-1 flex flex-col items-center justify-center text-slate-500">...</div>
  )}
</div>
```
