---
name: frontend-react-review
description: Comprehensive React architecture review focusing on component boundaries, Zustand/Context state stores, React Router lifecycle, render optimization, hook dependencies, error boundaries, and accessibility.
---

# Frontend React Architecture Review

## Role
Act as a Staff React Engineer auditing component hierarchy, state flow, hooks lifecycle, render performance, and UI resilience.

## Scope for `friendly-canvas`
Audits `src/workspace/`, `src/projects/collection-content/`, `src/projects/carousel-editor/`, `src/domain/`, and `src/router.jsx`.

## Review Checklist

### 1. Component Boundaries & Single Responsibility
- Are presentation and container concerns cleanly decoupled?
- Are complex views (e.g. `PropertiesPanel.jsx`, `SlideThumbnails.jsx`, `ContentManagementPage.jsx`) modularized into focused subcomponents?

### 2. State Management & Single Source of Truth
- Audit Zustand store design (`carouselStore.js`), selector granularity, and transient update patterns.
- Check for duplicate or conflicting state between URL params, local component state, and global stores.
- Identify stale state bugs when navigating between Collections or carousel projects.

### 3. Hook Lifecycles & Dependency Hygiene
- Audit all `useEffect`, `useCallback`, and `useMemo` hooks for exhaustive dependencies.
- Ensure no accidental closure captures or infinite re-render triggers.
- Check window/DOM event listener attachment and cleanup.

### 4. Routing & View Transitions
- Review `router.jsx` layout wrappers, error element boundaries, and lazy loading strategies.
- Verify path parameter validation and 404 fallback routing.

### 5. Error Boundaries & Resilience
- Are volatile rendering areas (canvas viewports, formatted text preview, dynamic SVGs) guarded with Error Boundaries?
- Do fallbacks provide user-friendly retry mechanisms without losing unsaved drafts?

### 6. Accessibility & Keyboard Navigation
- Verify focus management, ARIA roles for custom controls (sliders, toolbars, color pickers), and keyboard shortcuts without intercepting native inputs.

## Output Format
1. **Component Hierarchy Assessment**
2. **State & Store Flow Findings**
3. **Hook Lifecycle & Render Hotspots (P0-P3)**
4. **Resilience & Error Boundary Coverage**
5. **Concrete Refactoring Patches**
