# SWE Notebook — Prompt Snippet Library & Modifiers

Reusable modular tokens to plug into Midjourney v6, DALL-E 3, Gemini ImageFX, or Ideogram.

---

## 1. Quality & Rendering Modifiers
- `aesthetic_editorial`: `Ultra-clean editorial layout, Swiss graphic design style, crisp typography, tactile fine paper grain, subtle diffuse lighting, 8k resolution, minimalist vector aesthetic.`
- `clean_diagram`: `Precision vector technical schematic, 2px uniform vector line stroke, high legibility, clean negative space, subtle pastel accent fills.`
- `code_terminal`: `Dark-mode syntax highlighted terminal card, rounded corners, Mac window traffic lights, JetBrains Mono font, deep slate background #1E1E2E.`

---

## 2. Layout Snippet Generators

### 2.1 Hook Open Snippet
```
An ultra-clean, high-retention 4:5 vertical editorial carousel slide for Instagram (1080x1350 px).
Series: SWE Notebook (Zero to Hero) | Track: "{TrackName}" (Primary: {PrimaryHex}, Accent: {AccentHex}).
Canvas: Warm tactile paper texture #F8F7F4 with subtle technical dot grid.
LayoutCategory: hook-open — Scroll-stopping asymmetric big-type layout.
Headline: "{SlideTitle}" in bold editorial serif with glowing fluorescent {AccentHex} highlighter block.
Content: "{Content}" in crisp modern Inter typography.
Chrome: Top-left track badge "[T{TrackNo}]", bottom-left "01/07", bottom-right "Swipe ➔".
```

### 2.2 Concept Explain Snippet
```
An ultra-clean 4:5 vertical editorial carousel slide for Instagram (1080x1350 px).
Series: SWE Notebook | Track: "{TrackName}" (Primary: {PrimaryHex}, Accent: {AccentHex}).
LayoutCategory: concept-explain — Split container layout pairing a centered technical vector diagram with a structured insight card.
Headline: "{SlideTitle}" in bold geometric sans-serif.
Visual Focus: Clean vector illustration of {VisualConcept} with {AccentHex} accent glow.
Content: "{Content}" in clean Inter medium.
```

### 2.3 Process Flow Snippet
```
An ultra-clean 4:5 vertical editorial carousel slide for Instagram (1080x1350 px).
Series: SWE Notebook | Track: "{TrackName}" (Primary: {PrimaryHex}, Accent: {AccentHex}).
LayoutCategory: process-flow — Sequential 3-stage visual pipeline with connecting arrows, numbered badge pills (01, 02, 03), and concise step cards.
Content: "{Content}".
```

### 2.4 Comparison Snippet
```
An ultra-clean 4:5 vertical editorial carousel slide for Instagram (1080x1350 px).
Series: SWE Notebook | Track: "{TrackName}" (Primary: {PrimaryHex}, Accent: {AccentHex}).
LayoutCategory: comparison — Dual-column side-by-side contrast card comparing trade-offs with distinct visual borders and indicator icons.
Left: Legacy/Without (muted border, ✗ icon). Right: Modern/With ({PrimaryHex} border, ✓ icon).
```

### 2.5 Series Closing / Next Up Snippet
```
An ultra-clean 4:5 vertical editorial carousel slide for Instagram (1080x1350 px).
Series: SWE Notebook | Track: "{TrackName}" (Primary: {PrimaryHex}, Accent: {AccentHex}).
LayoutCategory: closing-cta — Branded final card featuring official SWE Notebook circular vector seal ("SWE Notebook · Zero to Hero"), Next-Up topic preview card ("{NextPostTitle}"), and Save/Follow CTA.
Footer: "SWE Notebook" left, "Follow for more" right. No swipe arrow.
```
