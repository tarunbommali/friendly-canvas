# Design System — Friendly Canvas / Carousel Studio

## Product Context
**Friendly Canvas** is a creator tool for building LinkedIn/Instagram carousel post series. It has two primary domains:
1. **Content Tracker** — browse, organize, and manage carousel posts by track/topic
2. **Carousel Studio** — full-screen canvas editor (FabricJS) for designing individual slides

**Target users**: Content creators, educators, thought leaders publishing educational carousels on LinkedIn/Instagram.

**Key pages**: Home (track browser) → Track Page → Post Detail → Carousel Builder (main editor) → Global Layout Settings → Content Management

---

## Brand Identity
- **App Name**: Carousel / Workspace & Studio
- **Aesthetic**: Dark SaaS tool — professional, focused, studio-grade
- **Feel**: Notion meets Figma, designed for deep work sessions

---

## Color System

### App Backgrounds (always dark)
| Role | Value |
|---|---|
| Page background | `#0f1117` |
| Sidebar / Panel background | `#151821` |
| Card / Input background | `#1a1e2a` |
| Hover / Nested card | `#222736` |
| Paper/Slide surface | `#f8f7f4` |

### Primary Accent: Cyan
| Token | Value | Use |
|---|---|---|
| Active / Focus | `#22d3ee` (cyan-400) | Focus rings, active borders |
| CTA / Buttons | `#06b6d4` (cyan-500) | Primary call-to-action |
| Ghost CTA bg | `cyan-500/10` | Secondary button backgrounds |
| Ghost CTA text | `#67e8f9` (cyan-300) | Secondary button labels |

### Secondary: Slate (text hierarchy)
| Token | Value | Use |
|---|---|---|
| Primary text | `#f1f5f9` (slate-100) | Headings, body text |
| Secondary text | `#cbd5e1` (slate-300) | Secondary labels |
| Muted text | `#94a3b8` (slate-400) | Placeholders, metadata |
| Disabled | `#64748b` (slate-500) | Disabled states |

### Warning/Layout: Yellow
- `#facc15` (yellow-400) — layout builder accents, warnings

### Highlight Accents (slide themes)
- Highlighter Yellow: `#ffe600`
- Highlighter Lime: `#a6ff00`
- Highlighter Cyan: `#38bdf8`
- Highlighter Lavender: `#d8b4f8`
- Highlighter Pink: `#fda4af`

---

## Typography

### Font Families
| Role | Font | Use |
|---|---|---|
| Sans (primary) | `Inter` | Body text, UI labels, inputs |
| Serif (display) | `Instrument Serif`, `Playfair Display` | Brand name, headings, slide titles |
| Mono (code/badge) | `JetBrains Mono` | Tags, badges, keyboard shortcuts, code |

### Type Scale (Tailwind)
- Display: `text-3xl` – `text-5xl`, `font-extrabold`, `font-serif`
- Heading: `text-lg` – `text-2xl`, `font-bold`
- Body: `text-sm`, `font-normal` / `font-medium`
- Caption/Badge: `text-xs`, `font-mono`, `uppercase tracking-wider`

---

## Component Patterns

### Cards
```css
bg-[#1a1e2a] hover:bg-[#222736] rounded-xl border border-white/10
hover:border-white/20 transition-all shadow-sm
```

### Primary Button (CTA)
```css
bg-cyan-500 text-slate-950 font-bold rounded-lg px-4 py-2
hover:bg-cyan-400 transition-colors shadow-cyan-500/20
```

### Ghost/Secondary Button
```css
bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300
border border-cyan-400/30 hover:border-cyan-400/50
rounded-lg px-3 py-1.5 text-xs font-bold font-mono
```

### Input Fields
```css
bg-[#1a1e2a] hover:bg-[#222736] focus:bg-[#222736]
text-slate-200 border border-white/10 focus:border-cyan-400/60
rounded-lg px-3 py-1.5 text-sm focus:outline-none transition-all
placeholder:text-slate-500
```

### Panel Headers
```css
text-xs font-bold font-mono text-slate-400 uppercase tracking-wider
border-b border-white/10 px-3 py-2
```

### Glassmorphism
```css
bg-white/5 backdrop-blur-md border border-white/10 rounded-xl
```

---

## Layout Patterns

### Navbar height: `h-11` (44px), sticky, `z-50`
### Sidebar width: `w-[100px]` (thumbnails) / `w-64` (track sidebar)
### Properties panel: `w-[280px]`
### Canvas: `1080×1350px` (Instagram 4:5), displayed at zoom scale inside `flex-1`

---

## Motion / Animation
- Transitions: `transition-all`, `transition-colors` (150ms default)
- Hover lifts: subtle `shadow-md` on card hover
- No large animations — tool is for focused work
- Toast: slide-up animation `animate-slide-up`

---

## Tailwind Config
Using **Tailwind CSS v4** with `@theme` directive in CSS (no tailwind.config.js).
Extended tokens defined in `src/shared/styles/index.css`.
