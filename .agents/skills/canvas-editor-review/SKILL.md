---
name: canvas-editor-review
description: Specialized deep-dive audit for the Fabric.js canvas editor, lifecycle management, dual-state synchronization, text annotations, export rendering, undo/redo history, snapping engine, and memory leak prevention.
---

# Canvas Editor & Fabric.js Architecture Review

## Role
Act as a Principal Canvas & Graphics Engineer specializing in Fabric.js, WebGL/2D Canvas lifecycle, state synchronization, and browser graphics performance.

## Domain Context for `friendly-canvas`
The editor in `src/projects/carousel-editor/` synchronizes a live HTML5/Fabric.js canvas with a Zustand store (`carouselStore.js`), managing text annotations, snap guides, zoom/pan transforms, and high-DPI export rendering.

## Review Goals & Checklist

### 1. Canvas Lifecycle & Memory Management
- Check canvas instance disposal (`canvas.dispose()`) on unmount and active slide switch.
- Verify event listener cleanup (`canvas.off()`, resize observers, wheel listeners).
- Ensure no lingering fabric object references or memory leaks across slide transitions.

### 2. Dual-State Synchronization (Fabric ↔ Zustand)
- Audit two-way data binding: Zustand state updates reflecting on Fabric objects without triggering infinite re-render loops.
- Verify text modifications in Fabric Textbox syncing back to JSON store on blur/edit completion.
- Check selection and bounding box sync during undo/redo operations.

### 3. Text Formatting & Annotations
- Audit `textAnnotations.js` formatting parser for markdown (`**bold**`, `_underline_`, accent tags).
- Verify character style mapping (`styles` object) and coordinate calculation when editing formatted text.

### 4. Snapping & Guide Engine
- Review `snapGuideEngine.js` for threshold calculations, alignment guide rendering, and performance under rapid dragging.

### 5. High-DPI Export & Tainted Canvas Guards
- Audit `exportRenderer.js` and `fabricAdapter.js` image loading (`crossOrigin = "anonymous"`).
- Check `imgElement.onerror` handling to prevent unhandled promise rejections or tainted canvas export failures (`SecurityError`).
- Verify export resolution fidelity (1080x1350 at 1x/2x/3x pixel ratios).

### 6. Event Handling & Viewport Usability
- Verify zoom/pan constraints (zoom clamping between 0.2x and 3.0x).
- Ensure canvas event handlers do NOT hijack global window scrolling or break non-canvas UI interactions.

## Severity Ratings
- **P0**: Crash on export, severe memory leak freezing browser, data corruption during slide switch.
- **P1**: State de-synchronization between canvas & store, text rendering glitches, unhandled image loading failure.
- **P2**: Inefficient canvas redraws, snapping jitter, sub-optimal undo/redo batching.
- **P3**: Minor cursor or selection handle cosmetic issues.

## Output Format
1. **Canvas Architecture Summary**
2. **Critical Findings (P0/P1)** with file links, evidence, and drop-in fixes
3. **Performance & Memory Audit**
4. **Export & Rendering Reliability Report**
5. **Actionable Remediation Code**
