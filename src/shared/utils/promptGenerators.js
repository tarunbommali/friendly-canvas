/**
 * promptGenerators.js
 * ─────────────────────────────────────────────────────────────
 * SWE Notebook — Data-Driven Prompt Generator
 *
 * PURPOSE
 * -------
 * Generate prompts from the ACTUAL SWE Notebook data.json contract.
 *
 * Two families of output:
 *
 * 1. PER-SLIDE ASSETS (existing) — flat 2D editorial rubber-stamp
 *    field-note assets, one isolated transparent PNG per slide.
 *
 * 2. REAL-PHOTO HERO IMAGE(S) (new) — one or two full-frame,
 *    photoreal Gen Z-style PNG images representing the whole post's
 *    context, meant to look like an actual phone photo, not AI art.
 *
 * data.json is the source of truth for both. This file supports the
 * REAL schema shipped in data.json (collectionId, headline/text/vibe,
 * collectionPalettes keyed by id, lowercase chapterCovers) while staying
 * backward-compatible with the earlier PascalCase field names.
 */

// ─────────────────────────────────────────────────────────────
// DATA.JSON ADAPTER
// ─────────────────────────────────────────────────────────────

const DEFAULT_CANVAS = {
  width: 1080,
  height: 1350,
  aspectRatio: '4:5',
};

const DEFAULT_INK = '#111827';
const DEFAULT_PRIMARY = '#1E5FA8';
const DEFAULT_ACCENT = '#A9D0F5';

const DEFAULT_LAYOUT_DEFINITIONS = {
  'hook-open': {
    id: 'hook-open',
    role: 'HOOK / OPEN',
    description: 'Hook / Open — high-impact, text-first visual.',
    visualModel: 'anchor-icon',
    weight: 'typography-led',
    maxLabels: 0,
    focalPoint: 'the central idea of the hook',
    assetRule: 'Use one tiny symbolic anchor only. Do not build a scene.',
  },

  'concept-explain': {
    id: 'concept-explain',
    role: 'CONCEPT / EXPLAIN',
    description: 'Concept / Explain — icon or diagram with concise teaching copy.',
    visualModel: 'icon-or-diagram',
    weight: 'balanced',
    maxLabels: 2,
    focalPoint: 'the concept being explained',
    assetRule: 'Use one coherent icon or compact diagram.',
  },

  'process-flow': {
    id: 'process-flow',
    role: 'PROCESS / FLOW',
    description: 'Process / Flow — step-by-step visual with directional relationships.',
    visualModel: 'process-diagram',
    weight: 'diagram-led',
    maxLabels: 4,
    focalPoint: 'the sequence or transformation',
    assetRule: 'Show 3–4 essential stages connected by restrained directional marks.',
  },

  comparison: {
    id: 'comparison',
    role: 'COMPARISON',
    description: 'Comparison — two contrasting states or approaches.',
    visualModel: 'comparison',
    weight: 'diagram-led',
    maxLabels: 2,
    focalPoint: 'the contrast',
    assetRule: 'Show two clearly related halves with one differentiator per side.',
  },

  'real-world': {
    id: 'real-world',
    role: 'REAL-WORLD',
    description: 'Real-world application / scenario.',
    visualModel: 'real-world-scene',
    weight: 'illustration-led',
    maxLabels: 1,
    focalPoint: 'the practical situation',
    assetRule:
      'Translate the requested scenario into one compact recognizable scene. Keep it isolated so it can be composited.',
  },

  'recap-close': {
    id: 'recap-close',
    role: 'RECAP / CLOSE',
    description: 'Recap / Close — summary checklist or takeaway.',
    visualModel: 'checklist',
    weight: 'summary-led',
    maxLabels: 5,
    focalPoint: 'the summary thread',
    assetRule: 'Use a compact checklist or short sequence of summary marks.',
  },

  'next-up': {
    id: 'next-up',
    role: 'NEXT UP',
    description: 'Continuation / CTA teaser.',
    visualModel: 'teaser-symbol',
    weight: 'typography-led',
    maxLabels: 0,
    focalPoint: 'curiosity about what comes next',
    assetRule: 'Use one restrained teaser silhouette or symbol.',
  },
};

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function getPosts(dataJson) {
  return asArray(dataJson?.Posts || dataJson?.posts);
}

function getChapterCovers(dataJson) {
  return (dataJson?.collections || []).map((c) => ({
    collectionId: String(c.collectionId).padStart(2, '0'),
    collectionName: c.collectionName,
    heading: c.collectionName,
    bodyText: c.collectionDescription || '',
  }));
}

function getVisualGlossary(dataJson) {
  return dataJson?.visualGlossary || {};
}

function getDesignSystem(dataJson) {
  return dataJson?.designSystem || {};
}

function getLayoutRegistry(dataJson) {
  const registry = getDesignSystem(dataJson).LayoutCategorys;
  return registry && typeof registry === 'object' ? registry : {};
}

function getcollectionPalettes(dataJson) {
  const map = {};
  (dataJson?.collections || []).forEach((c) => {
    const idStr = String(c.collectionId).padStart(2, '0');
    const numStr = String(parseInt(idStr, 10));
    const design = c.collectionDesign || {};
    const paletteObj = {
      name: c.collectionName,
      palette: design.palette || 'Default',
      primary: design.primary || '#2563eb',
      accent: design.accent || '#93c5fd',
    };
    map[idStr] = paletteObj;
    map[numStr] = paletteObj;
    if (c.collectionName) map[c.collectionName] = paletteObj;
  });
  return map;
}

function getPostSlides(post) {
  return asArray(post?.slides);
}

function getSlideTitle(slide, fallback = 'Untitled') {
  return slide?.heading || fallback;
}

function getSlideContent(slide) {
  return slide?.bodyText || '';
}

function getSlideLayout(slide) {
  const raw =
    slide?.Layout ||
    slide?.layoutId ||
    (typeof slide?.layout === 'string' ? slide.layout : slide?.layout?.id) ||
    '';
  return String(raw || '');
}

function getVisualDirective(slide) {
  return (
    slide?.VisualDirective ||
    slide?.visualDirective ||
    slide?.visual?.directive ||
    slide?.visual ||
    slide?.vibe || // real data.json field: per-slide art direction hint
    ''
  );
}

function getSlideNumber(slide, index = 0) {
  return slide?.SlideNo || slide?.slideNo || index + 1;
}

function getSlideByLayout(post, layoutId) {
  return getPostSlides(post).find((s) => getSlideLayout(s) === layoutId);
}

// real data.json identifies a post's collection by id ("01", "10", ...).
function getCollectionId(post) {
  return post?.collectionId ?? null;
}

function getCollectionName(post, dataJson) {
  const explicit = post?.collectionName || post?.collection?.name || post?.collection;
  if (explicit && typeof explicit === 'string') return explicit;

  const collectionId = getCollectionId(post);
  if (collectionId == null) return '';

  const entry = getcollectionPalettes(dataJson)[collectionId];
  return entry?.name || `Collection ${collectionId}`;
}

function getPostTitle(post) {
  return post?.PostTitle || post?.title || post?.Post?.title || 'SWE Notebook';
}

function resolveTrackPalette(post, explicitTrackColor, dataJson) {
  if (explicitTrackColor?.primary || explicitTrackColor?.accent || explicitTrackColor?.palette) {
    return {
      palette: explicitTrackColor.palette || explicitTrackColor.name || 'Editorial',
      primary: explicitTrackColor.primary || DEFAULT_PRIMARY,
      accent: explicitTrackColor.accent || DEFAULT_ACCENT,
    };
  }

  const direct = post?.TrackColorPalette;
  if (direct?.primary || direct?.accent || direct?.palette) {
    return {
      palette: direct.palette || 'Editorial',
      primary: direct.primary || DEFAULT_PRIMARY,
      accent: direct.accent || DEFAULT_ACCENT,
    };
  }

  const palettes = getcollectionPalettes(dataJson);

  // Real schema: lookup by collectionId ("01", "10", ...).
  const collectionId = getCollectionId(post);
  const byId = collectionId != null ? palettes[collectionId] : null;
  if (byId) {
    return {
      palette: byId.palette || 'Editorial',
      primary: byId.primary || DEFAULT_PRIMARY,
      accent: byId.accent || DEFAULT_ACCENT,
    };
  }

  // Lookup by collection name.
  const collectionName = getCollectionName(post, dataJson);
  const byName = palettes[collectionName];
  if (byName) {
    return {
      palette: byName.palette || 'Editorial',
      primary: byName.primary || DEFAULT_PRIMARY,
      accent: byName.accent || DEFAULT_ACCENT,
    };
  }

  return { palette: 'Editorial', primary: DEFAULT_PRIMARY, accent: DEFAULT_ACCENT };
}

function resolveLayoutDefinition(slide, dataJson) {
  const layoutId = getSlideLayout(slide);
  const registry = getLayoutRegistry(dataJson);
  const fallback = DEFAULT_LAYOUT_DEFINITIONS[layoutId];

  return {
    id: layoutId || fallback?.id || 'concept-explain',
    description:
      registry[layoutId] ||
      fallback?.description ||
      'Concept / Explain — icon or diagram with concise teaching copy.',
    role: fallback?.role || 'CONCEPT / EXPLAIN',
    visualModel: fallback?.visualModel || 'icon-or-diagram',
    weight: fallback?.weight || 'balanced',
    maxLabels: fallback?.maxLabels ?? 2,
    focalPoint: fallback?.focalPoint || 'the core concept',
    assetRule: fallback?.assetRule || 'Use one coherent visual metaphor.',
  };
}

function inferGlossaryRefs(slide, dataJson) {
  const glossary = getVisualGlossary(dataJson);
  const searchable = [getSlideTitle(slide), getSlideContent(slide), getVisualDirective(slide)]
    .join(' ')
    .toLowerCase();

  return Object.keys(glossary).filter((key) => {
    const keyLower = key.toLowerCase();
    if (searchable.includes(keyLower)) return true;

    const aliases = {
      'memory/ram': ['memory', 'ram', 'cache'],
      'client/server': ['client', 'server', 'backend', 'frontend'],
      database: ['database', 'databases', 'db', 'sql', 'nosql'],
      'model (ai)': ['model', 'machine learning', 'ml', 'neural'],
      agent: ['agent', 'agents', 'tool loop', 'tool use'],
      cpu: ['cpu', 'processor', 'chip'],
    };

    return (aliases[keyLower] || []).some((alias) => searchable.includes(alias));
  });
}

function resolveAssetMode(slide) {
  const layout = getSlideLayout(slide).toLowerCase();
  const directive = getVisualDirective(slide).toLowerCase();

  if (
    layout === 'real-world' ||
    directive.includes('real-world scenario') ||
    directive.includes('real world scenario') ||
    directive.includes('photo')
  ) {
    return 'real-world-scene';
  }

  if (layout === 'hook-open') return 'anchor';
  if (layout === 'process-flow') return 'diagram';
  if (layout === 'comparison') return 'comparison';
  if (layout === 'recap-close') return 'checklist';
  if (layout === 'next-up') return 'teaser';

  return 'icon-or-diagram';
}

// ─────────────────────────────────────────────────────────────
// STYLE LOCK — PER-SLIDE STAMP ASSETS (existing)
// ─────────────────────────────────────────────────────────────

const STYLE_LOCK = {
  minimal: `SWE NOTEBOOK — MINIMAL EDITORIAL 2D STYLE LOCK

FORMAT:
- 4:5 vertical Instagram system.
- 1080x1350px slide composition.
- The image-generation function below creates ONLY the visual asset.
- Never generate the complete Instagram slide.

GLOBAL VISUAL DNA:
- Premium independent editorial publication.
- Engineering notebook sensibility.
- Quiet, intelligent, specific, tactile.
- Designed, not rendered.
- One clear conceptual focal point.
- Generous negative space.

ILLUSTRATION:
- Flat 2D.
- Editorial technical drawing.
- Thin-to-medium controlled linework.
- Simple geometric construction.
- Strong silhouette.
- Minimal internal detail.
- Restrained visual hierarchy.

RUBBER-STAMP FIELD-NOTE TREATMENT:
- Genuine carved rubber-stamp character.
- Limited 2–4 spot inks.
- Hand-cut irregular linework.
- Broken contour sections.
- Dry-ink starvation.
- Grainy ink edges.
- Uneven pressure.
- Slight ghosting.
- Slight registration drift between ink layers.
- Imperfection must feel physical, not like a digital filter.

COLOR:
- Ink: #111827.
- One collection primary ink.
- One collection accent ink.
- Optional neutral only when required.
- No rainbow palette.
- No gradients.
- No glow.

DEPTH:
- Absolutely flat.
- No perspective.
- No isometric view.
- No extrusion.
- No bevel.
- No dimensional shading.
- No realistic lighting.
- No cinematic lighting.
- No glossy surfaces.
- No heavy shadows.

COMPOSITION:
- One coherent asset.
- No unrelated icon collection.
- No decorative filler.
- No collage.
- Keep the visual compact.
- Preserve transparent space around the artwork.

TEXT:
- Prefer no text.
- Never reproduce the slide headline/body.
- Only use a tiny technical label when the concept genuinely requires it.`,

  classic: `SWE NOTEBOOK — MINIMAL EDITORIAL 2D STYLE LOCK.
Flat 2D editorial technical illustration, restrained spot color, clean linework,
generous negative space, no 3D, no isometric, no gradients, no gloss,
no photorealism, no stickers.`,

  genz: `SWE NOTEBOOK — MINIMAL EDITORIAL 2D STYLE LOCK.
Use the same restrained editorial 2D language.
No sticker, glossy, holographic, gradient, clay, or 3D styling.`,
};

// ─────────────────────────────────────────────────────────────
// STYLE LOCK — REAL PHOTO / GEN Z HERO IMAGE (new)
// ─────────────────────────────────────────────────────────────

const REAL_PHOTO_STYLE_LOCK = `SWE NOTEBOOK — REAL PHOTO / GEN Z HERO IMAGE STYLE LOCK

FORMAT:
- Full-frame photographic image, NOT an isolated asset.
- 4:5 vertical, 1080x1350px.
- This is the post's hero/cover visual — background and environment are part of the shot.

GLOBAL LOOK:
- Looks like an actual photo taken on a modern phone camera — not an illustration, not a CGI render, not "AI art."
- Candid, slightly imperfect framing, like a real person captured this moment rather than staged it.
- Natural available light only: window light, desk lamp, screen glow. No artificial three-point studio lighting.
- Realistic material textures: skin, fabric, matte laptop finish, paper, wood grain, ceramic.
- Shallow depth of field is fine. Slight softness at the edges reads as authentic, not as a flaw.
- Fine natural photographic grain / mild sensor noise, like an unedited or lightly-edited phone photo.
- Gen Z visual language: cozy desk setup, dorm room, cafe table, night coding session, sticky notes,
  a phone propped against a laptop, hoodie sleeve, warm/cool mixed ambient lighting — grounded and
  relatable, never corporate stock photography.

SUBJECT HANDLING (avoids the "AI look"):
- Prefer hands, screens, objects, and environments over full faces.
- If a person appears, keep them partial: hands on keyboard, over-the-shoulder, silhouette against a
  screen. Avoid a clear frontal face — that is where AI-image artifacts are most visible.
- No unnatural symmetry, no glossy plastic skin, no extra/fused fingers, no warped text on real objects.

COLOR:
- Natural, believable color grading.
- The collection's primary/accent color may appear ONLY as a real object in the scene (sticky note, mug,
  phone case, notebook cover, monitor bezel light) — never as a graphic overlay, filter, or background wash.
- No neon glow, no gradient overlay, no artificial color-grade filter.

STRICTLY AVOID:
- 3D render, CGI, isometric view, flat illustration, icon, clipart, vector art, cartoon, anime.
- The rubber-stamp / editorial-linework look used elsewhere in this system — do not mix styles.
- Studio product photography, glossy stock-photo staging, plastic/AI-generated skin, uncanny faces.
- On-image text, captions, logos, UI chrome, watermarks. Real screen content may be visible but should
  read as ordinary code/UI, not as a rendered headline.
- Over-sharpened HDR, oversaturated colors, lens flare, bokeh hearts, glitter, sparkle effects.

GOAL:
A photo someone could believably have taken on their phone while actually building or learning this
concept — not a generated illustration of it.`;

// ─────────────────────────────────────────────────────────────
// DATA-DRIVEN BACKGROUND (per-slide asset mode)
// ─────────────────────────────────────────────────────────────

const MINIMAL_BACKGROUND_DESCRIPTIONS = {
  paper: 'Warm off-white editorial paper canvas #F8F7F4 with extremely subtle natural grain.',
  texture: 'Warm eggshell paper #F8F7F4 with barely visible tactile grain.',
  grid: 'Warm off-white #F8F7F4 with an extremely faint engineering notebook grid #E5E7EB.',
  dots: 'Warm off-white paper with sparse low-opacity technical dots.',
  solid: 'Clean warm off-white solid canvas #F8F7F4.',
  seamless: 'Continuous warm paper canvas with a subtle shared grid motif.',
  grain: 'Fine natural paper grain on warm off-white editorial canvas.',
  watermark: 'Very subtle oversized editorial text watermark at extremely low opacity.',
};

export function getBackgroundDescription(bgType = 'paper') {
  return MINIMAL_BACKGROUND_DESCRIPTIONS[bgType] || MINIMAL_BACKGROUND_DESCRIPTIONS.paper;
}

// ─────────────────────────────────────────────────────────────
// ASSET STYLE RESOLVER (per-slide asset mode)
// ─────────────────────────────────────────────────────────────

function resolveAssetStyle(assetMode, visualDirective, glossaryRefs) {
  const glossaryNote = glossaryRefs.length
    ? `Canonical visual vocabulary: ${glossaryRefs.join(', ')}.`
    : 'No canonical glossary term is required; infer the simplest visual metaphor.';

  const modeStyles = {
    anchor: `
ASSET MODEL:
- One tiny symbolic anchor.
- Favor a recognizable silhouette or technical mark.
- Do not build a scene.`,

    'icon-or-diagram': `
ASSET MODEL:
- One coherent icon OR compact explanatory diagram.
- Favor a recognizable silhouette and one meaningful relationship.`,

    diagram: `
ASSET MODEL:
- Compact process diagram.
- 3–4 essential nodes/stages.
- Thin directional marks.
- Preserve the actual sequence implied by the content.`,

    comparison: `
ASSET MODEL:
- Two related visual states.
- One differentiator per side.
- Clear center relationship.
- Do not create a decorative split-screen background.`,

    'real-world-scene': `
ASSET MODEL:
- One compact real-world application scene derived from the source directive.
- Show only the people/objects/environment required to communicate the practical situation.
- Keep the scene isolated and cutout-friendly.
- Do not generate a photographic background.
- Preserve the editorial 2D field-note treatment.`,

    checklist: `
ASSET MODEL:
- Compact checklist or summary strip.
- Use only the essential summary marks.
- Avoid a full card or page layout.`,

    teaser: `
ASSET MODEL:
- One restrained teaser silhouette or symbol.
- Communicate curiosity, not the entire next topic.`,
  };

  return `${modeStyles[assetMode] || modeStyles['icon-or-diagram']}

${glossaryNote}

SOURCE VISUAL DIRECTIVE:
${visualDirective || 'Infer the strongest visual metaphor directly from the concept.'}`;
}

// ─────────────────────────────────────────────────────────────
// NEGATIVE PROMPT — PER-SLIDE ASSET MODE
// ─────────────────────────────────────────────────────────────

function buildNegativePrompt(layout, maxLabels) {
  return `STRICT NEGATIVE PROMPT:

3D
3D render
3D illustration
3D icon
3D object
3D character
isometric
isometric perspective
perspective rendering
claymorphism
clay render
plastic
toy-like
glossy
chrome
holographic
glassmorphism
beveled edges
extrusion
extruded typography
realistic lighting
cinematic lighting
dramatic shadows
long shadows
floating objects
heavy drop shadows
photorealism
realistic product render
sticker style
die-cut sticker
bubble graphics
emoji graphics
cartoon clipart
childlike illustration
corporate stock illustration
AI-generated stock art
smooth vector logo
generic icon set
generic technology icon
gradient
gradient background
neon glow
lens flare
bokeh
busy background
photographic background
paper background
aged paper background
off-white background
white background
colored background
opaque background
background rectangle
background texture
background grid
full poster
full Instagram slide
headline
body text
footer
page number
decorative typography
decorative clutter
collage
multiple separate illustrations
photo collage
filtered photograph
photographic redraw
realistic scene unless explicitly required by the real-world asset model

REQUIRED STYLE:
- Pure flat 2D.
- Genuine carved rubber-stamp field-note character.
- Limited spot inks.
- Irregular carved linework.
- Broken ink edges.
- Dry ink.
- Slight registration drift.
- One coherent visual metaphor.
- Transparent background.
- Maximum ${maxLabels} labels.
- No artificial depth.
- No decorative filler.

LAYOUT SOURCE:
${layout || 'concept-explain'}`;
}

// ─────────────────────────────────────────────────────────────
// NEGATIVE PROMPT — REAL PHOTO MODE (new)
// ─────────────────────────────────────────────────────────────

function buildRealPhotoNegativePrompt() {
  return `STRICT NEGATIVE PROMPT:

3D render
CGI
isometric
flat 2D illustration
icon
clipart
vector art
cartoon
anime
sticker
rubber-stamp texture
editorial linework illustration
studio lighting
glossy product photography
stock-photo staging
plastic skin
uncanny face
extra fingers
fused fingers
warped hands
warped or rendered text
on-image headline
caption
logo
watermark
UI chrome
oversaturated HDR
lens flare
bokeh hearts
glitter
neon glow
gradient overlay
perfectly symmetrical composition
perfectly clean desk with no real clutter
transparent background
floating object with no environment
compression blockiness beyond light natural grain

REQUIRED:
- Full photographic scene with real environment and lighting.
- At least one tangible, story-relevant object visible.
- Natural imperfection: slight tilt, casual crop, ambient light, real texture.
- 1080x1350 (4:5) vertical framing.`;
}

// ─────────────────────────────────────────────────────────────
// NORMALIZED POST CONTEXT
// ─────────────────────────────────────────────────────────────

export function normalizeSWEPost(post, dataJson = null) {
  const slides = getPostSlides(post);
  const palette = resolveTrackPalette(post, null, dataJson);

  return {
    collection: getCollectionName(post, dataJson),
    postNo: post?.PostNo || post?.postNo || null,
    title: getPostTitle(post),
    isFirstPostInCollection: post?.IsFirstPostInCollection ?? post?.isFirstPostInCollection ?? false,
    palette,
    context: post?.Context || '',
    description: post?.Description || post?.description || '',
    hashtags: asArray(post?.Hashtags || post?.hashtags),
    suggestedAudio: post?.SuggestedAudio || post?.audio || null,
    slides: slides.map((slide, index) => ({
      slideNo: getSlideNumber(slide, index),
      title: getSlideTitle(slide, `Slide ${index + 1}`),
      content: getSlideContent(slide),
      layout: getSlideLayout(slide),
      visualDirective: getVisualDirective(slide),
      glossaryRefs: inferGlossaryRefs(slide, dataJson),
      assetMode: resolveAssetMode(slide),
      raw: slide,
    })),
  };
}

// ─────────────────────────────────────────────────────────────
// SINGLE SLIDE IMAGE PROMPT (per-slide stamp asset)
// ─────────────────────────────────────────────────────────────

export function generateSlideImagePrompt(
  post,
  slide,
  trackColor = null,
  styleMode = 'minimal',
  dataJson = null
) {
  const palette = resolveTrackPalette(post, trackColor, dataJson);
  const layout = resolveLayoutDefinition(slide, dataJson);

  const headline = getSlideTitle(slide);
  const bodyText = getSlideContent(slide);
  const visualDirective = getVisualDirective(slide);
  const glossaryRefs = inferGlossaryRefs(slide, dataJson);
  const assetMode = resolveAssetMode(slide);

  const assetStyle = resolveAssetStyle(assetMode, visualDirective, glossaryRefs);

  return `TRANSPARENT PNG ASSET GENERATOR — SWE NOTEBOOK

SOURCE OF TRUTH:
The visual must be generated from the supplied SWE Notebook data fields.
Do not invent a different topic or replace the supplied VisualDirective.

POST:
"${getPostTitle(post)}"

COLLECTION:
"${getCollectionName(post, dataJson)}"

COLLECTION PALETTE:
- Palette: ${palette.palette}
- Primary: ${palette.primary}
- Accent: ${palette.accent}

SLIDE:
- Number: ${getSlideNumber(slide)}
- Title: "${headline}"
- Layout: ${getSlideLayout(slide) || 'concept-explain'}
- Asset mode: ${assetMode}

CONTENT:
"${bodyText}"

VISUAL DIRECTIVE:
"${visualDirective || 'Infer the strongest visual metaphor directly from the content.'}"

CANONICAL GLOSSARY REFERENCES:
${glossaryRefs.length ? glossaryRefs.join(', ') : 'None'}

LAYOUT CONTRACT:
- Role: ${layout.role}
- Description: ${layout.description}
- Visual model: ${layout.visualModel}
- Visual weight: ${layout.weight}
- Focal point: ${layout.focalPoint}
- Maximum labels: ${layout.maxLabels}
- Asset rule: ${layout.assetRule}

${assetStyle}

${STYLE_LOCK[styleMode] || STYLE_LOCK.minimal}

TRANSPARENCY — ABSOLUTE:
- Output ONLY the standalone visual asset.
- Background MUST be 100% transparent.
- Output MUST contain an alpha channel.
- No paper.
- No off-white canvas.
- No grid.
- No texture outside the stamped marks.
- No white box.
- No colored rectangle behind the asset.
- No floor.
- No environmental background.
- No baked-in shadow.
- No poster.
- No slide frame.
- Leave transparent pixels around the entire asset.
- Keep approximately 25–40% transparent breathing room around the artwork.
- Never stretch the artwork to the edges.

CONCEPT INTERPRETATION:
1. Understand the supplied CONTENT semantically.
2. Respect the supplied VISUAL DIRECTIVE as the primary visual instruction.
3. Respect the supplied LAYOUT contract.
4. If a VisualGlossary reference exists, use its canonical visual language.
5. Reduce the idea to the minimum visual information required.
6. Build ONE coherent visual asset.
7. Do not illustrate every sentence literally.
8. Do not create unrelated icon collections.
9. Do not add decorative objects.
10. Do not invent labels, brands, locations, dates, or UI.

TEXT:
- Prefer NO text inside the asset.
- Never reproduce the slide title.
- Never reproduce the slide body.
- Never generate CTA copy.
- Only use a tiny technical label when genuinely necessary.
- Maximum ${layout.maxLabels} labels.

SPOT INK SYSTEM:
- Core ink: ${DEFAULT_INK}
- Primary ink: ${palette.primary}
- Accent ink: ${palette.accent}
- Use only the minimum number of colors needed.
- Treat each color as an independently stamped layer.
- Allow subtle physical registration drift.
- Do not blend colors digitally.
- Do not use gradients.

RUBBER-STAMP EXECUTION:
- The marks should look carved and physically transferred.
- Use irregular carved contours.
- Slightly uneven line weight.
- Broken edges.
- Dry ink starvation.
- Small gaps in ink coverage.
- Uneven pressure.
- Slight ghosting.
- Slight registration drift.
- Keep imperfections subordinate to readability.
- It must NOT look like a smooth vector logo with a stamp filter.

${buildNegativePrompt(getSlideLayout(slide), layout.maxLabels)}

FINAL QUALITY CHECK:
1. Is the background fully transparent?
2. Is this ONLY one standalone asset?
3. Does it directly represent the supplied content/directive?
4. Does it obey the supplied layout contract?
5. Is the canonical glossary language respected where applicable?
6. Does it look genuinely carved and stamped?
7. Are colors restrained to the collection palette?
8. Is the concept recognizable without the slide text?
9. Is there no paper/background/card/frame?
10. Is it completely free of 3D/rendered aesthetics?

If any answer is NO, regenerate the asset.`;
}

// ─────────────────────────────────────────────────────────────
// MASTER CAROUSEL PROMPT (per-slide stamp assets)
// ─────────────────────────────────────────────────────────────

export function generatePostMasterPrompt(post, trackColor = null, styleMode = 'minimal', dataJson = null) {
  const normalized = normalizeSWEPost(post, dataJson);
  const palette = resolveTrackPalette(post, trackColor, dataJson);

  let prompt = `SWE NOTEBOOK — DATA-DRIVEN CAROUSEL ASSET MANIFEST

SOURCE:
data.json is the source of truth for this post.

POST:
"${normalized.title}"

POST NUMBER:
${normalized.postNo ?? 'n/a'}

COLLECTION:
"${normalized.collection}"

PALETTE:
- ${palette.palette}
- Primary: ${palette.primary}
- Accent: ${palette.accent}

CANVAS:
- ${DEFAULT_CANVAS.width}x${DEFAULT_CANVAS.height}
- ${DEFAULT_CANVAS.aspectRatio}

SYSTEM:
${STYLE_LOCK[styleMode] || STYLE_LOCK.minimal}

IMPORTANT:
This master prompt describes the visual assets required by each slide.
The slide editor remains responsible for the complete Instagram composition,
typography, background, page indicators, CTA, and placement.

CAROUSEL CONTINUITY:
- Preserve the same visual grammar across related slides.
- Reuse canonical glossary forms consistently.
- Reuse process/arrow language when process slides recur.
- Reuse comparison logic when comparison slides recur.
- Keep the collection palette consistent.
- Each slide still has ONE conceptual job.

SLIDE MANIFEST:
`;

  normalized.slides.forEach((slide) => {
    const layout = resolveLayoutDefinition(slide.raw, dataJson);

    prompt += `
────────────────────────────────────────
SLIDE ${slide.slideNo}
────────────────────────────────────────

TITLE:
"${slide.title}"

LAYOUT:
${slide.layout}

ROLE:
${layout.role}

CONTENT:
${slide.content}

VISUAL DIRECTIVE:
${slide.visualDirective || 'Infer the strongest visual metaphor from the content.'}

ASSET MODE:
${slide.assetMode}

GLOSSARY:
${slide.glossaryRefs.length ? slide.glossaryRefs.join(', ') : 'No canonical glossary reference'}

VISUAL WEIGHT:
${layout.weight}

FOCAL POINT:
${layout.focalPoint}

MAX LABELS:
${layout.maxLabels}

ASSET RULE:
${layout.assetRule}

`;
  });

  prompt += `
MASTER NEGATIVE:
NO 3D
NO ISOMETRIC
NO GLOSS
NO HOLOGRAPHIC
NO GRADIENTS
NO CLAY
NO STICKERS
NO PHOTOREALISM
NO CINEMATIC RENDERING
NO GENERIC CORPORATE CLIPART
NO DECORATIVE CLUTTER

APPROVAL TEST:
Every asset must look like a compact, premium, editorial rubber-stamp field note
derived from the actual data.json content and visual directive — not a generic
illustration and not a complete Instagram slide.
`;

  return prompt;
}

// ─────────────────────────────────────────────────────────────
// REAL PHOTO / GEN Z HERO IMAGE(S) — new
// ─────────────────────────────────────────────────────────────

// Lightweight keyword → real-world scene mapping. Matched against the
// post title + all slide headlines/content. Falls back to a generic
// "late-night coding desk" scene when nothing matches.
const SCENE_KEYWORD_MAP = [
  {
    keywords: ['memory', 'ram', 'cache'],
    scene:
      'a hand holding a phone next to an open laptop showing a code editor, a couple of sticky notes with short technical shorthand scattered on the desk',
  },
  {
    keywords: ['network', 'internet', 'server', 'client', 'web'],
    scene:
      'a laptop and a phone side by side on a desk, both screens glowing, a loosely coiled ethernet cable resting nearby',
  },
  {
    keywords: ['database', 'sql', 'query'],
    scene:
      'a notebook with hand-drawn table sketches next to an open laptop with a terminal window glowing on screen',
  },
  {
    keywords: ['algorithm', 'data structure', 'dsa', 'problem solving'],
    scene:
      "a whiteboard with hand-drawn boxes and arrows, a coffee cup and a laptop in the foreground, a hand mid-sketch holding a marker",
  },
  {
    keywords: ['machine learning', 'model', 'neural', 'deep learning', 'ai agent', 'agents'],
    scene:
      'a laptop screen showing a chart glowing in a dim room at night, a notebook with handwritten notes resting beside it',
  },
  {
    keywords: ['cloud', 'devops', 'linux', 'terminal'],
    scene:
      'a close-up of hands typing on a mechanical keyboard with a terminal window glowing on the laptop screen, warm desk-lamp light',
  },
  {
    keywords: ['security', 'password', 'encryption'],
    scene:
      'a phone lock screen mid-unlock next to a laptop, dim moody lighting, a hoodie sleeve visible at the edge of frame',
  },
  {
    keywords: ['history', 'invent', 'origin', 'why did'],
    scene: 'an old notebook and a modern laptop placed side by side on a wooden desk, warm window light',
  },
];

function deriveSceneConcept(post) {
  const slides = getPostSlides(post);
  // Headline-only: slide body text is intentionally excluded so the
  // image prompt never reads like source copy to edit/reproduce.
  const searchable = [getPostTitle(post), ...slides.map((s) => getSlideTitle(s))].join(' ').toLowerCase();

  const match = SCENE_KEYWORD_MAP.find(({ keywords }) => keywords.some((k) => searchable.includes(k)));

  return (
    match?.scene ||
    'a laptop open on a desk showing a code editor, a phone propped beside it, a half-finished cup of coffee, warm ambient light — a real late-night coding setup'
  );
}

function buildImageContext(post) {
  const hook = getSlideByLayout(post, 'hook-open');
  const realWorld = getSlideByLayout(post, 'real-world');
  const parts = [getPostTitle(post)];
  if (hook) parts.push(getSlideTitle(hook));
  if (realWorld) parts.push(getSlideTitle(realWorld));
  return parts.filter(Boolean).join(' — ');
}

// Decides whether one or two hero images best represent this post.
// Two images are only suggested when the post actually contains a
// comparison beat worth splitting into a second still-life shot.
export function suggestRealImageCount(post) {
  const hasComparison = getPostSlides(post).some((s) => getSlideLayout(s) === 'comparison');
  return hasComparison ? 2 : 1;
}

function buildImagePayload(post, imageIndex, totalImages) {
  if (totalImages === 1 || imageIndex === 1) {
    return {
      context: buildImageContext(post),
      scene: deriveSceneConcept(post),
      angle: 'wide establishing shot of the whole desk/scene',
    };
  }

  const comparisonSlide = getSlideByLayout(post, 'comparison');
  if (comparisonSlide) {
    const headline = getSlideTitle(comparisonSlide);
    return {
      context: headline,
      scene: `a real still-life shot placing two contrasting real objects side by side on the same surface to visually echo this comparison: ${headline}`,
      angle: 'close-up still life, both objects in frame, natural light',
    };
  }

  return {
    context: buildImageContext(post),
    scene: deriveSceneConcept(post),
    angle: 'tighter close-up detail shot of the same setup, different angle than image 1 (e.g. hands on keyboard, or a screen close-up)',
  };
}

/**
 * Generates one photoreal, Gen Z-style hero image prompt for a post.
 * This is a COMPLETE photographic scene (not a transparent isolated
 * asset) meant to look like a real phone photo, not AI-generated art.
 */
export function generateRealImagePrompt(post, imageIndex = 1, totalImages = 1, dataJson = null, styleMode = 'genz-real') {
  const palette = resolveTrackPalette(post, null, dataJson);
  const trackName = getTrackName(post, dataJson);
  const payload = buildImagePayload(post, imageIndex, totalImages);

  return `REAL PHOTO HERO IMAGE GENERATOR — SWE NOTEBOOK (${styleMode.toUpperCase()})

SOURCE OF TRUTH:
Derived from data.json post "${getPostTitle(post)}" (Collection: "${collectionName}").
Do not invent a different topic.

IMAGE:
${imageIndex} of ${totalImages}

CORE CONTEXT (evoke this, do not spell it out literally):
"${payload.context}"

SCENE CONCEPT:
${payload.scene}

FRAMING:
${payload.angle}

COLLECTION COLOR CUE (use only as a believable real object color, never as an overlay):
- Primary: ${palette.primary}
- Accent: ${palette.accent}

${REAL_PHOTO_STYLE_LOCK}

${buildRealPhotoNegativePrompt()}

OUTPUT:
- Format: PNG.
- Aspect ratio: 4:5 (1080x1350).
- One complete photographic scene. No text, no logos, no UI overlays.

FINAL CHECK:
1. Would this pass as a real phone photo, not an AI/illustrated image?
2. Does it evoke the post's concept without literally illustrating or labeling it?
3. Is any face avoided, or kept safely partial (hands/screen/silhouette only)?
4. Is the collection color present only as a real object, never as a filter/overlay?
5. Is there zero on-image text, logo, or watermark?

If any answer is NO, regenerate.`;
}

/**
 * Generates the full set of hero image prompts for a post (1 or 2,
 * auto-detected via suggestRealImageCount unless overridden).
 */
export function generateRealImagePromptSet(post, dataJson = null, styleMode = 'genz-real', imageCountOverride = null) {
  const count = imageCountOverride === 1 || imageCountOverride === 2 ? imageCountOverride : suggestRealImageCount(post);

  return Array.from({ length: count }, (_, i) => generateRealImagePrompt(post, i + 1, count, dataJson, styleMode));
}

/**
 * Convenience bundle: hero image prompt(s) + caption, ready to hand
 * to an image generator and a scheduler in one call.
 */
export function generatePostRealAssetBundle(post, dataJson = null, styleMode = 'genz-real', imageCountOverride = null) {
  const prompts = generateRealImagePromptSet(post, dataJson, styleMode, imageCountOverride);

  return {
    postTitle: getPostTitle(post),
    collection: getCollectionName(post, dataJson),
    imageCount: prompts.length,
    prompts,
    caption: generateCaptionText(post),
  };
}

// ─────────────────────────────────────────────────────────────
// CAPTION GENERATOR
// ─────────────────────────────────────────────────────────────

export function generateCaptionText(post) {
  const postTitle = getPostTitle(post);
  const description = post?.Description || post?.description || '';
  const slides = getPostSlides(post);

  let text = `${postTitle}\n\n`;

  if (description) {
    text += `${description}\n\n`;
  }

  text += `📌 Slide Breakdown:\n`;

  slides.forEach((slide, index) => {
    text += `• Slide ${getSlideNumber(slide, index)}: ${getSlideTitle(slide, `Slide ${index + 1}`)}\n`;
  });

  const hashtags = asArray(post?.Hashtags || post?.hashtags);
  const hashtagStr = hashtags.length ? hashtags.join(' ') : '#SWENotebook #ZeroToHero #SoftwareEngineering';

  text += `
💡 Save this post for quick reference and share it with a fellow engineer.

Follow for more daily SWE & AI visual breakdowns.

${hashtagStr}`;

  return text;
}

// ─────────────────────────────────────────────────────────────
// CHAPTER COVER PROMPT
// ─────────────────────────────────────────────────────────────

export function generateCoverPrompt(cover, styleMode = 'minimal', dataJson = null) {
  const collectionId = cover?.collectionId ?? cover?.collectionId ?? null;
  const paletteEntry = collectionId != null ? getcollectionPalettes(dataJson)[collectionId] : null;

  const primary =
    cover?.Primary ||
    cover?.primary ||
    paletteEntry?.primary ||
    extractHexFromDirective(cover?.VisualDirective || cover?.vibe, 1) ||
    DEFAULT_PRIMARY;

  const accent =
    cover?.Accent ||
    cover?.accent ||
    paletteEntry?.accent ||
    extractHexFromDirective(cover?.VisualDirective || cover?.vibe, 2) ||
    DEFAULT_ACCENT;

  const title =
    cover?.collectionName ||
    cover?.heading ||
    paletteEntry?.name ||
    'SWE Notebook';

  const subtitle = cover?.collectionDescription || cover?.bodyText || '';

  const directive = cover?.VisualDirective || cover?.visualDirective || cover?.vibe || 'Minimal editorial chapter cover.';

  const collection = cover?.collectionName || paletteEntry?.name || (collectionId != null ? `Collection ${collectionId}` : '');

  return `SWE NOTEBOOK — CHAPTER COVER GENERATOR

SOURCE:
Use the collections entry from data.json as the source of truth.

COLLECTION:
"${collection}"

TITLE:
"${title}"

SUBTITLE:
"${subtitle}"

VISUAL DIRECTIVE:
"${directive}"

PALETTE:
- Primary: ${primary}
- Accent: ${accent}

FORMAT:
- 4:5 vertical portrait.
- 1080x1350px.
- Complete chapter-cover composition is allowed here.

STYLE:
${STYLE_LOCK[styleMode] || STYLE_LOCK.minimal}

COVER-SPECIFIC RULES:
- This function generates a COMPLETE chapter cover, unlike slide asset prompts.
- Preserve the supplied title and subtitle.
- Follow the supplied VisualDirective.
- Use the supplied primary/accent colors.
- Keep typography dominant.
- Use one simple bridge visual at most.
- Do not illustrate the entire collection.
- Keep at least 40% breathing room.
- No gradient.
- No 3D.
- No isometric rendering.
- No glossy UI.
- No photorealism.
- No sticker graphics.

NEGATIVE:
3D, isometric, clay, glossy, holographic, chrome, gradient,
extrusion, bevel, photorealistic, cinematic lighting,
sticker, toy-like objects, busy background, corporate clipart.`;
}

function extractHexFromDirective(text = '', occurrence = 1) {
  const matches = String(text).match(/#[0-9A-Fa-f]{6}/g) || [];
  return matches[occurrence - 1] || null;
}

// ─────────────────────────────────────────────────────────────
// DATA.JSON LOOKUPS
// ─────────────────────────────────────────────────────────────

const postMapCache = new WeakMap();

function getPostMaps(dataJson) {
  const posts = getPosts(dataJson);
  if (!postMapCache.has(posts)) {
    const byNo = new Map();
    const byTitle = new Map();
    posts.forEach((post) => {
      const pNo = Number(post?.PostNo ?? post?.postNo);
      if (!isNaN(pNo)) byNo.set(pNo, post);
      const title = String(getPostTitle(post)).trim().toLowerCase();
      if (title) byTitle.set(title, post);
    });
    postMapCache.set(posts, { byNo, byTitle });
  }
  return postMapCache.get(posts);
}

export function findSWEPost(dataJson, postNo) {
  if (!dataJson) return null;
  const maps = getPostMaps(dataJson);
  return maps.byNo.get(Number(postNo)) || null;
}

export function findSWEPostByTitle(dataJson, title) {
  if (!dataJson) return null;
  const target = String(title || '').trim().toLowerCase();
  const maps = getPostMaps(dataJson);
  return maps.byTitle.get(target) || null;
}

// Matches by collectionId (real schema, e.g. "10") OR by collection name (legacy schema).
export function findChapterCover(dataJson, collectionIdOrName) {
  const target = String(collectionIdOrName ?? '').trim().toLowerCase();

  return getChapterCovers(dataJson).find((cover) => {
    const id = String(cover?.collectionId ?? '').trim().toLowerCase();
    const name = String(cover?.collectionName ?? cover?.heading ?? '').trim().toLowerCase();
    return id === target || name === target;
  });
}

export function getSWEVisualGlossary(dataJson) {
  return getVisualGlossary(dataJson);
}

export function getSWELayoutRegistry(dataJson) {
  return getLayoutRegistry(dataJson);
}

// ─────────────────────────────────────────────────────────────
// PAGE INDICATOR
// ─────────────────────────────────────────────────────────────

export function generatePageIndicator(slide, totalSlides) {
  const n = getSlideNumber(slide);
  const padded = (num) => String(num).padStart(2, '0');

  if (n === 1) return 'SWIPE →';

  if (n === totalSlides) {
    const layout = getSlideLayout(slide);

    if (layout === 'next-up') {
      const text = getSlideContent(slide);
      return text ? `NEXT: ${String(text).toUpperCase()} →` : 'SAVE THIS →';
    }

    return 'SAVE THIS.';
  }

  return `${padded(n)} — ${padded(totalSlides)}`;
}