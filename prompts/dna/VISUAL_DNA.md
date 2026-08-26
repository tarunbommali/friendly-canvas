# SWE Notebook — Visual DNA Specification

## 1. Canvas Dimensions & Aspect Ratio
- **Aspect Ratio**: `4:5 Vertical Portrait` (Instagram optimal feed format).
- **Pixel Resolution**: `1080 x 1350 px` (Standard), `2160 x 2730 px` (2x Retina / Hi-Res Export).
- **Safe Zone**:
  - Top margin: `96px` safe zone (keeps clear of Instagram header UI and profile badges).
  - Bottom margin: `112px` safe zone (keeps clear of carousel dots and audio indicator).
  - Left & Right margins: `64px` gutter.

---

## 2. Color System & Philosophy

### 2.1 Palette Structure
Every post strictly adheres to its Track Color Palette comprising:
1. **Primary Shade** (`#HEX`): High-contrast, deeply saturated brand tone used for headers, primary vectors, borders, and main cards.
2. **Accent Tone** (`#HEX`): Soft pastel / luminous highlight used for highlighter blocks, pill tags, indicator dots, and subtle glow shadows.
3. **Canvas Off-White**: `#F8F7F4` (Warm tactile paper tone) or `#FFFFFF` (Pure modern studio card background).
4. **Editorial Dark (Ink)**: `#111827` (Deep neutral slate for high-readability body text).
5. **Muted Neutral**: `#6B7280` / `#9CA3AF` (Secondary labels, slide counters, track badges).

### 2.2 Aesthetic Principle: Tactile Clean Editorial
- **No Clutter / Clipart**: Avoid cartoonish, uncalibrated clip-art.
- **Micro-Texture**: Canvas contains tactile off-white fine paper grain, subtle technical dot-grids (20px spacing), or architectural blueprint lines.
- **Fluorescent Highlighter Cue**: Key buzzwords and headlines feature a horizontal rectangular highlight box behind or under the text in the track's Accent tone (`#HEX`).

---

## 3. Typography Hierarchy

| Level | Font Family / Style | Size (1080x1350) | Line Height | Letter Spacing | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Headline (Hero)** | Sora / Poppins Bold / Editorial Serif | `48px - 58px` | `1.15` | `-0.02em` | Slide Title / Hook scroll-stopper |
| **Section Tag / Track Pill** | JetBrains Mono / Space Grotesk Bold | `18px - 22px` | `1.0` | `+0.08em` | Track pill tag (`T01`, `TRACK 01`) |
| **Body Lead** | Inter / Satoshi Medium | `26px - 32px` | `1.4` | `normal` | Primary explanation takeaway |
| **Secondary Text** | Inter Regular | `20px - 24px` | `1.5` | `normal` | Sub-bullets, code notes, captions |
| **Metadata / Footers** | JetBrains Mono SemiBold | `16px - 18px` | `1.0` | `+0.05em` | Slide counter (`01 / 07`), `SWE Notebook` |

---

## 4. Branded Seals, Badges & Chrome

### 4.1 Header Chrome (Slides 1 to 6)
- **Top Left**: Monospace track pill with subtle border (e.g., `[ T01 · Sepia ]`).
- **Top Right**: Minimalist bookmark icon or topic indicator.

### 4.2 Footer Chrome (Slides 1 to 6)
- **Bottom Left**: Slide counter indicator (e.g., `01 / 07`).
- **Bottom Right**: Minimalist action cue `Swipe ➔` with directional micro-arrow.

### 4.3 Official Brand Seal (Slide 7 / Next-Up Closing Card)
- **Geometric Vector Emblem**: Double concentric rings with ultra-fine stroke.
- **Central Typography**: `SWE` in bold serif seated upon a fluorescent marker highlight pill; lowercase cursive/italic `notebook` in navy blue pen style beneath.
- **Surrounding Ring Copy**: `* ZERO TO HERO * SOFTWARE ENGINEERING NOTEBOOK *`.
- **Closure Callout Box**: Rounded container showcasing upcoming post title, category tag, and `Save & Follow` prompt.
