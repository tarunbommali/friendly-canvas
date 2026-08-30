# Theme — Friendly Canvas / Carousel Workspace

## Part 1 — Compact Token Summary

### Color Palette
| Token | Value | Usage |
|---|---|---|
| `--color-app-bg` | `#0f1117` | Page background, body |
| `--color-sidebar-bg` | `#151821` | Sidebar panels |
| `--color-card-bg` | `#1a1e2a` | Cards, inputs |
| `--color-card-subtle` | `#222736` | Hover states, nested cards |
| `--color-paper-bg` | `#f8f7f4` | Slide/canvas paper surface |
| `--color-highlighter-yellow` | `#ffe600` | Accent highlight |
| `--color-highlighter-lime` | `#a6ff00` | Secondary accent |
| `--color-highlighter-cyan` | `#38bdf8` | Info highlight |
| `--color-highlighter-lavender` | `#d8b4f8` | Purple accent |
| `--color-highlighter-pink` | `#fda4af` | Pink accent |

### Primary Accent Colors (Tailwind)
| Color | 400 | 500 | Notes |
|---|---|---|---|
| Cyan | `#22d3ee` | `#06b6d4` | Primary CTA, focus rings, active states |
| Slate | `#94a3b8` | `#64748b` | Text muted, icons, borders |
| Yellow | `#facc15` | `#eab308` | Warning, layout builder, highlights |

### Typography
| Role | Family | Weights |
|---|---|---|
| `--font-serif` | `'Instrument Serif', 'Playfair Display', Georgia, serif` | 600–900 |
| `--font-sans` | `'Inter', -apple-system, BlinkMacSystemFont, sans-serif` | 400–800 |
| `--font-mono` | `'JetBrains Mono', 'Fira Code', monospace` | 500–800 |

### Spacing / Layout
- Base: Tailwind v4 default scale (4px base)
- Max content width: `max-w-6xl` (72rem) / `max-w-7xl` (80rem) with `mx-auto`
- Canvas canvas: `1080×1350px` (Instagram 4:5)

### Border Radius
- Small elements: `rounded-lg` (8px)
- Cards: `rounded-xl` (12px)
- Slides: `rounded-2xl` (16px)
- Glassmorphism panels: `14px`

### Shadows
- Cards: subtle `shadow-xs`
- Modals: `shadow-2xl`
- Glassmorphism: `0 8px 24px rgba(0,0,0,0.06)` + `backdrop-blur-md`

### Dark Mode
App is always dark. Background: `#0f1117`. Text: `#f3f4f6` (slate-100).

---

## Part 2 — Raw Source

```css
/* src/shared/styles/index.css */
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;0,800;0,900;1,600;1,700&display=swap');
@import "tailwindcss";

@theme {
  --font-serif: 'Instrument Serif', 'Playfair Display', Georgia, serif;
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  --color-app-bg: #0f1117;
  --color-sidebar-bg: #151821;
  --color-card-bg: #1a1e2a;
  --color-card-subtle: #222736;
  --color-paper-bg: #f8f7f4;
  --color-highlighter-yellow: #ffe600;
  --color-highlighter-lime: #a6ff00;
  --color-highlighter-cyan: #38bdf8;
  --color-highlighter-lavender: #d8b4f8;
  --color-highlighter-pink: #fda4af;
}

:root {
  --color-slate-50: #f8fafc;
  --color-slate-100: #f1f5f9;
  --color-slate-200: #e2e8f0;
  --color-slate-300: #cbd5e1;
  --color-slate-400: #94a3b8;
  --color-slate-500: #64748b;
  --color-slate-600: #475569;
  --color-slate-700: #334155;
  --color-slate-800: #1e293b;
  --color-slate-900: #0f172a;
  --color-slate-950: #020617;
  --color-cyan-400: #22d3ee;
  --color-cyan-500: #06b6d4;
  --color-yellow-400: #facc15;
}

body {
  font-family: var(--font-sans);
  background-color: #0f1117;
  color: #f3f4f6;
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
}
```
