---
name: frontend-architecture-review
description: Deep-dive review of frontend React architecture, state management stores, component hierarchy, rendering performance, canvas integrations, and hook lifecycles.
---

# Frontend Architecture Review

## Scope & Objective
Audit the client-side architecture for scalable React design patterns, state consistency, rendering performance, canvas lifecycle handling, and clean component decoupling.

## Review Checklist
1. **Component Hierarchy & Decoupling**:
   - Are presentational and container concerns cleanly separated?
   - Are large components broken down into focused, reusable primitives?
2. **State Management & Synchronization**:
   - Single source of truth across stores (e.g. Zustand, Context, local state).
   - Detection of stale state, ghost renders, or missing state resets on route/slide change.
   - Race conditions in async data fetching and state setters.
3. **Canvas & DOM Lifecycle Integration**:
   - Proper disposal and cleanup of Fabric.js / HTML5 Canvas contexts and event listeners.
   - Window resize, zoom, viewport, and DPI/Retina handling.
   - Prevent memory leaks and dangling subscriptions in `useEffect`.
4. **Render Performance**:
   - Memoization audit (`useMemo`, `useCallback`, `React.memo`) where computationally expensive.
   - Prevention of cascading render loops and prop drilling.
5. **Accessibility & Error Resilience**:
   - Error boundaries wrapping volatile canvas and async views.
   - Keyboard navigation, ARIA attributes, and readable fallback states.

## Output Format
- Component Architecture Breakdown
- State Flow & Store Audit
- Identified Hotspots (P0 to P3)
- Actionable Refactoring Steps with Code Diffs
