---
name: Friendly Canvas Design System
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#434655'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#943700'
  on-tertiary: '#ffffff'
  tertiary-container: '#bc4800'
  on-tertiary-container: '#ffede6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#ffdbcd'
  tertiary-fixed-dim: '#ffb596'
  on-tertiary-fixed: '#360f00'
  on-tertiary-fixed-variant: '#7d2d00'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  title-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-mono:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  sidebar_width: 280px
  property_panel_width: 320px
---

## Brand & Style

This design system is built for a dual-purpose environment: a high-productivity administrative workspace and a precision-focused visual editor. The brand personality is **reliable, professional, and invisible**, ensuring the user's content remains the focal point while providing a robust framework for complex workflows.

The aesthetic blends **Corporate Modern** for the management interface with **Technical Minimalism** for the canvas editor. 
- **Workspace Mode:** Employs a clean, high-density layout with heavy use of whitespace, subtle borders, and a neutral palette to reduce cognitive load during project management.
- **Canvas Mode:** Switches to a "lights-out" dark theme to minimize peripheral distraction, using high-contrast property panels and crisp, technical UI elements to facilitate precise visual manipulation.

## Colors

The palette is bifurcated to support the two distinct modes of the application.

### Workspace (Management)
The primary surface uses **Slate-50**, providing a soft, non-reflective background for long-duration management tasks. The primary action color is a professional **Indigo-600**, used for "Create," "Publish," and active navigational states. Status colors are standard but desaturated to maintain a professional tone.

### Canvas (Editor)
The editor environment shifts to **Zinc-950** for the main backdrop. Interactive controls in this mode utilize higher contrast borders (Zinc-800) and bright white or primary-blue accents for active states. This ensures that UI controls are legible against deep backgrounds without bleeding into the canvas area.

## Typography

**Inter** is the workhorse of the system, utilized for all functional UI text, navigation, and administrative data. It is chosen for its exceptional legibility at small sizes and high-density layouts.

**JetBrains Mono** is introduced specifically for technical labels, coordinate inputs (X, Y, W, H), hex codes, and metadata. This distinction helps users quickly differentiate between "content" and "system data."

- Use `display-lg` for project titles in the dashboard.
- Use `label-mono` for all property panel inputs in Canvas Mode.
- Use `label-caps` for section headers in sidebars to provide clear visual anchoring.

## Layout & Spacing

This design system uses an **8px grid system** for general layout and a **4px baseline** for high-density components (like the Tracks list or Property panels).

### Workspace Layout
- **Navigation:** A fixed 280px left sidebar for global navigation.
- **Content:** Fluid grid with a maximum container width of 1440px for dashboard views.
- **Grids:** Use a 12-column grid with 24px gutters for Project Card views.

### Canvas Layout
- **Editor:** Centered 1080x1350 canvas with dynamic scaling.
- **Panels:** Dual-docked panels. Left (240px) for layers and slide navigation; Right (320px) for property inspection.
- **Margins:** 16px safe area around the editor controls to prevent visual overlap with the canvas.

## Elevation & Depth

The system avoids heavy shadows, opting for **Tonal Layering** and **Subtle Outlines** to define hierarchy.

- **Level 0 (Base):** Workspace background (Slate-50) or Editor background (Zinc-950).
- **Level 1 (Surface):** White cards in Workspace; Zinc-900 panels in Editor. Defined by a 1px border (#E2E8F0 in light; #27272A in dark).
- **Level 2 (Popovers/Modals):** Subtle 12px blur ambient shadow (10% opacity) with a crisp 1px border.
- **Active State:** Elements are elevated via color shift (Primary Blue) rather than shadow height to maintain the "flat" professional aesthetic.

## Shapes

The design system utilizes **Soft** roundedness (4px - 8px) to feel modern yet structured.

- **Standard Elements:** Buttons, Inputs, and Small Cards use `0.25rem` (4px) corner radius.
- **Large Containers:** Project Cards and Modals use `0.5rem` (8px) corner radius.
- **Contextual Shapes:** Slide thumbnails in the "Tracks" view maintain the aspect ratio of the canvas (4:5) with a slight 2px radius.

## Components

### Buttons & Inputs
- **Primary Button:** Solid fill (Indigo-600) with white text. 4px radius. 
- **Ghost Button:** No background, Slate-600 text, becomes Slate-100 on hover. Used for secondary actions in the sidebar.
- **Inputs:** 1px border (#CBD5E1), 8px horizontal padding. In Canvas mode, inputs are desaturated with JetBrains Mono text.

### Management Components
- **Project Cards:** Feature a large 4:5 aspect ratio preview, title, and "Last Edited" metadata. Use a subtle border that darkens on hover.
- **Track Lists:** High-density rows (40px height) with draggable handles on the left and status indicators on the right.

### Canvas Components
- **Property Groups:** Collapsible headers in `label-caps` typography.
- **Control Handles:** Small 8px white squares with a 1px blue stroke, appearing only on the active element in the editor.
- **Breadcrumbs:** Minimalist text path (e.g., Projects > Q3 Marketing > Slide 04) located at the top left of the editor.
