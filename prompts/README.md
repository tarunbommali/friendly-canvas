# SWE Notebook — Knowledge Base & Prompt Engineering Suite

Welcome to the **SWE Notebook Prompt Engineering & Knowledge Base Suite**. This repository contains the complete design DNA, visual composition rules, reference guides, Custom GPT system prompts, and knowledge base files for generating world-class Instagram carousels (Tracks 1 to 21: *Zero to Hero*).

---

## 📁 Directory Structure

```
prompts/
├── README.md                          # Quick-start guide & ingestion index
├── KNOWLEDGE_BASE.md                  # Master unified knowledge base for LLM ingestion
│
├── dna/                               # Core visual & prompt design system
│   ├── VISUAL_DNA.md                  # Dimension standards, safe zones, typography, badges, colors
│   └── PROMPT_DNA.md                  # Prompt construction syntax, quality tokens, negative prompts
│
├── composition/                       # Structural layouts & visual rhythm
│   ├── LAYOUT_VARIATIONS.md           # 7 distinct slide position layouts for carousel flow
│   ├── GRID_COMPOSITION.md            # Grid math, 8pt spatial system, asymmetric balance, containers
│   └── LayoutCategoryS.md                  # Deep specifications for all slide LayoutCategorys
│
├── reference/                         # Design assets & technical definitions
│   ├── STYLE_GUIDE.md                 # UI elements, highlighters, code cards, terminal windows
│   ├── VISUAL_GLOSSARY.md             # Standard technical symbols (CPU, Memory, Packet, DB, Model, Agent)
│   ├── PALETTES.md                    # Exact hex colors (Primary, Accent, LightBg) for all 21 tracks
│   └── PROMPT_LIBRARY.md              # Production-ready modular prompt snippets
│
└── customgpts/                        # Complete Custom GPT system prompts & instructions
    ├── MASTER_ORCHESTRATOR_GPT.md     # Multi-slide 7-part carousel orchestrator
    ├── HOOK_OPEN_GPT.md               # Slide 1: High-retention hook & scroll stopper
    ├── CONCEPT_EXPLAIN_GPT.md         # Slides 2-3: Visual concept & architecture explainer
    ├── PROCESS_FLOW_GPT.md            # Slide 3-4: Step-by-step pipeline & progression flow
    ├── COMPARISON_GPT.md              # Slide 4: Split-screen contrast & trade-off analyzer
    ├── REAL_WORLD_GPT.md              # Slide 5: Production code & terminal scenario generator
    └── RECAP_CLOSE_GPT.md             # Slides 6-7: Checklist summary & branded Next-Up closer
```

---

## 🚀 Quick Usage Guide

### 1. Ingesting into Custom GPTs
- Open the OpenAI GPT Builder (or Claude Project / Gemini Gem).
- Upload [`KNOWLEDGE_BASE.md`](file:///c:/Users/Tarun/.vscode/workspace/workshops/instagram-image-creator/swe.notebook/prompts/KNOWLEDGE_BASE.md) as the primary knowledge document.
- Copy the instructions from any file in [`customgpts/`](file:///c:/Users/Tarun/.vscode/workspace/workshops/instagram-image-creator/swe.notebook/prompts/customgpts) directly into the GPT's **Instructions** field.

### 2. Generating Prompts in Code
The frontend and data engine utilize [`src/utils/promptGenerators.js`](file:///c:/Users/Tarun/.vscode/workspace/workshops/instagram-image-creator/swe.notebook/src/utils/promptGenerators.js) which is strictly synchronized with these DNA and composition rules.
