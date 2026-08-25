# SWE Notebook — Grid & Composition Engineering

## 1. 8-Point Spatial System
All padding, margin, container radii, and spacing in slide designs follow an **8pt geometric grid** scaled to `1080 x 1350 px`:

- `Base Unit`: 8px
- `xs`: 8px (icon margins, indicator gaps)
- `sm`: 16px (card inner padding, tag margins)
- `md`: 24px (gap between paragraphs, item spacing)
- `lg`: 32px (container margins, column gutters)
- `xl`: 48px (section gaps)
- `2xl`: 64px (outer slide margin gutters)
- `3xl`: 96px (top/bottom safety margins)

---

## 2. Visual Balance & Container Geometry

```
+-------------------------------------------------------------+  -- 0px
| [T01 · Sepia]                                [Topic Badge]  |  -- 96px (Safe Zone Top)
|                                                             |
|   +-----------------------------------------------------+   |
|   |  Headline with [Highlighter Block Accent]           |   |
|   +-----------------------------------------------------+   |
|                                                             |
|   +-----------------------------------------------------+   |
|   |  Visual Focal Area (Diagram / Icon / Comparison)    |   |
|   |                                                     |   |
|   |  - Border: 1.5px solid #Primary or #Accent          |   |
|   |  - Radius: 16px                                     |   |
|   |  - Shadow: 0 4px 20px rgba(0,0,0, 0.04)             |   |
|   +-----------------------------------------------------+   |
|                                                             |
|   +-----------------------------------------------------+   |
|   |  Key Takeaway / Explanatory Note Card               |   |
|   +-----------------------------------------------------+   |
|                                                             |
| 01 / 07                                            Swipe ➔  |  -- 1238px (Safe Zone Bottom)
+-------------------------------------------------------------+  -- 1350px
```

---

## 3. Container Card Specifications
- **Background**: Frosted white `#FFFFFF` with 95% opacity or soft `#FDFDFD`.
- **Border**: `1.5px` stroke in `#E5E7EB` or muted track accent `#A9D0F5`.
- **Corner Radius**: `16px` for outer cards, `8px` for inner tags and code badges.
- **Elevation**: Subtle diffuse ambient shadow (`box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06)`).
