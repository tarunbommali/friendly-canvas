# SWE Notebook — Slide LayoutCategory Specifications

This document provides complete structural, typographic, and visual rules for each of the 6 core slide LayoutCategorys used in SWE Notebook carousels.

---

## 1. LayoutCategory: `hook-open`
- **Primary Role**: The first slide in every carousel post (Slide 1). Must arrest the user's scroll within 0.5 seconds.
- **Visual Structure**: Minimalist, high-contrast, editorial typography hero.
- **Key Elements**:
  - Track pill in top-left corner (`[ TRACK 01 · SEPIA ]`).
  - Massive bold headline (50–58px) with fluorescent highlighter box around key punchy phrase.
  - Subtitle or provocative single sentence beneath in clean medium sans-serif.
  - Ambient watermark silhouette in background reflecting the track topic.
  - Bottom navigation cue (`Swipe ➔`).
- **Prompt Formula Token**:
  `"LayoutCategory: hook-open — Scroll-stopping asymmetric big-type layout with glowing fluorescent accent highlighter block."`

---

## 2. LayoutCategory: `concept-explain`
- **Primary Role**: Breaks down a complex software engineering mechanism or foundational theory (Slides 2, 3, 5).
- **Visual Structure**: Split-container layout with visual diagram on one half and concise explanation on the other.
- **Key Elements**:
  - Crisp headline naming the concept.
  - Dedicated illustration/diagram container showcasing hardware, data structures, protocol packets, or memory cells.
  - 1–2 sentences of clean explanatory text highlighting *why* this matters.
- **Prompt Formula Token**:
  `"LayoutCategory: concept-explain — Split container layout pairing a centered technical vector diagram with a structured insight card."`

---

## 3. LayoutCategory: `process-flow`
- **Primary Role**: Illustrates sequential execution, pipelines, data lifecycle, or step-by-step evolution (Slides 3, 4).
- **Visual Structure**: 3-node directional progression layout.
- **Key Elements**:
  - Horizontal or 3-step vertical chain with connecting chevron arrows.
  - Numbered circular badge for each stage (`01`, `02`, `03`).
  - Micro-icon per stage + 3-5 word label.
- **Prompt Formula Token**:
  `"LayoutCategory: process-flow — Sequential 3-stage visual pipeline with connecting arrows, numbered badge pills, and concise step cards."`

---

## 4. LayoutCategory: `comparison`
- **Primary Role**: Contrast two contrasting paradigms (e.g., `Mechanical vs Electronic`, `Monolith vs Microservices`, `SQL vs NoSQL`) (Slide 4).
- **Visual Structure**: Dual-column 50/50 split card.
- **Key Elements**:
  - Left column: Neutral/dimmed container with cross (`✗`) or "Before / Legacy" tag.
  - Right column: Accent/highlight container with check (`✓`) or "After / Modern" tag.
  - Symmetrical comparison rows highlighting key trade-offs.
- **Prompt Formula Token**:
  `"LayoutCategory: comparison — Dual-column side-by-side contrast card comparing trade-offs with distinct visual borders and indicator icons."`

---

## 5. LayoutCategory: `recap-close` (Summary Checklist)
- **Primary Role**: Slide 6 summary of all key topics covered in the post.
- **Visual Structure**: High-density 4-point scannable checklist.
- **Key Elements**:
  - "Quick Recap" header badge.
  - 3–4 bulleted rows inside white rounded pill containers, each preceded by a green/primary checkmark icon.
  - Summary takeaway sentence in accent highlight box.
- **Prompt Formula Token**:
  `"LayoutCategory: recap-close (Checklist) — Scannable 4-point summary card with circular checkmark indicators and highlighted takeaways."`

---

## 6. LayoutCategory: `closing-cta` (Series Next Up)
- **Primary Role**: Slide 7 final closing card for the carousel.
- **Visual Structure**: Branded authority seal + Next Post preview card + engagement CTA.
- **Key Elements**:
  - Official SWE Notebook circular vector brand seal centered in upper section.
  - "Up Next in Track X" card displaying the next post title.
  - Save (`🔖 Save`) and Follow call-to-action button lockup.
  - No swipe arrow (terminal slide).
- **Prompt Formula Token**:
  `"LayoutCategory: closing-cta — Branded final card featuring official SWE Notebook circular vector seal, Next-Up topic preview, and Save/Follow CTA."`
