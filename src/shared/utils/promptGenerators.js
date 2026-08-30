/**
 * promptGenerators.js
 * ─────────────────────────────────────────────────────────────
 * Instagram Image Creator — Minimal Editorial 2D Edition
 *
 * PURPOSE
 * -------
 * Generate consistent 4:5 Instagram carousel visual prompts using
 * a restrained editorial / technical-infographic language.
 *
 * CORE VISUAL RULE
 * ----------------
 * FLAT 2D ONLY.
 *
 * The output must NOT look:
 * - 3D
 * - isometric
 * - claymorphic
 * - glossy
 * - holographic
 * - photorealistic
 * - sticker-like
 * - toy-like
 * - cinematic
 *
 * Instead:
 * - flat vector illustration
 * - editorial line art
 * - simple geometric shapes
 * - thin strokes
 * - warm paper / faint grid
 * - fluorescent highlighter
 * - hand-drawn pen underline
 * - generous whitespace
 *
 * FORMAT
 * ------
 * 4:5 vertical — 1080 x 1350 px
 */

// ─────────────────────────────────────────────────────────────
// STYLE LOCK
// ─────────────────────────────────────────────────────────────

const STYLE_LOCK = {
  minimal: `MINIMAL EDITORIAL 2D STYLE LOCK — APPLY IDENTICALLY TO EVERY SLIDE:

1. FORMAT
   - Strict 4:5 vertical portrait.
   - 1080x1350px composition.
   - Generous outer margins.
   - Preserve at least 35% clean breathing space.

2. CANVAS
   - Warm off-white paper background #F8F7F4.
   - Optional extremely faint engineering/notebook grid #E5E7EB.
   - Subtle natural paper grain only.
   - Background must remain quiet and secondary.

3. TYPOGRAPHY
   - Headlines: elegant high-contrast Editorial Serif.
   - Use italic serif selectively for emphasis.
   - Body/subtitles: clean geometric Sans-Serif.
   - Code/prompts: restrained monospace.
   - Never use chunky bubble typography.
   - Never use cartoon typography.
   - Never use decorative display fonts.

4. HIGHLIGHTER DNA
   - Fluorescent marker rectangle behind ONE important word or phrase.
   - Preferred colors:
     Yellow #FFE600
     Lime #A6FF00
     Lavender #D8B4F8
     Cyan #38BDF8
     Coral #FDA4AF
   - Highlighter should look slightly hand-marked, imperfect and tactile.

5. PEN UNDERLINES
   - Use thin hand-drawn underline strokes.
   - Red = warning / problem.
   - Green = solution / outcome.
   - Blue = logic / technical concept.
   - Orange = action / tool / transition.
   - Underlines must remain subtle.

6. ILLUSTRATION TECHNIQUE
   - Pure flat 2D vector illustration.
   - Editorial technical drawing.
   - Consistent thin-to-medium line weight.
   - Flat fills only.
   - Simple geometric construction.
   - Minimal internal detail.
   - Use silhouette, outline, icon and diagram language.

7. DEPTH
   - NO artificial 3D depth.
   - NO perspective rendering.
   - NO extrusion.
   - NO bevels.
   - NO glossy surfaces.
   - NO realistic lighting.
   - NO dramatic shadows.
   - If grounding is required, use a single thin baseline or tiny flat contact mark.

8. VISUAL LANGUAGE
   - Think premium editorial magazine + engineering notebook.
   - Visuals should feel designed, not rendered.
   - Every object should look intentionally drawn in 2D.
   - Prefer one strong visual metaphor over decorative illustration.

9. COLOR
   - Warm neutral base.
   - Ink #111827.
   - One primary accent + optional restrained highlighter accent.
   - Avoid rainbow palettes.
   - Avoid saturated backgrounds.
   - Avoid gradients.

10. COMPOSITION
   - One focal point per slide.
   - Typography and visual hierarchy come first.
   - Do not fill empty space just because it exists.
   - Empty space is part of the design.`,

  // Kept as an alias so existing callers do not break.
  classic: `MINIMAL EDITORIAL 2D STYLE LOCK — APPLY IDENTICALLY TO EVERY SLIDE:

Flat 2D vector illustration, editorial technical drawing, warm off-white paper,
faint engineering grid, elegant Editorial Serif headlines, clean Sans-Serif body,
fluorescent marker highlights, hand-drawn colored pen underlines, thin consistent
linework, flat fills, generous whitespace, restrained palette.

ABSOLUTELY NO:
3D, isometric perspective, claymorphism, glossy rendering, holographic effects,
extrusion, bevels, realistic lighting, photorealism, sticker effects, toy-like
objects, cinematic rendering, heavy shadows, gradients, busy backgrounds.`,

  // Legacy alias.
  genz: `MINIMAL EDITORIAL 2D STYLE LOCK.

Use the exact same visual language as the Minimal Editorial 2D style.
Do not use Gen-Z sticker, glossy, 3D, holographic, gradient, or clay styling.

Flat 2D editorial vector illustration only.
Warm paper background.
Editorial Serif typography.
Clean Sans-Serif body.
Fluorescent highlighter blocks.
Hand-drawn pen underlines.
Thin linework.
Simple geometric forms.
Large whitespace.

NO 3D. NO ISOMETRIC. NO GLOSS. NO STICKERS. NO GRADIENTS.`
};

// ─────────────────────────────────────────────────────────────
// SLIDE-TYPE COMPOSITION
// ─────────────────────────────────────────────────────────────

const SLIDE_TYPE_COMPOSITION = {

  hook: {
    role: 'HOOK',
    weight: 'typography-led — headline carries approximately 70% of the visual attention',
    illustration: 'ONE tiny flat 2D anchor icon or symbolic line illustration; no scene-building',
    maxLabels: 0,
    focalPoint: 'the headline itself',
  },

  problem: {
    role: 'PROBLEM',
    weight: 'balanced — a simple flat illustration communicates the friction',
    illustration: 'ONE minimalist flat 2D character or object showing the problem; at most one supporting icon',
    maxLabels: 1,
    focalPoint: 'the moment of friction',
  },

  example: {
    role: 'EXAMPLE',
    weight: 'illustration-led — one isolated flat 2D hero object',
    illustration: 'ONE simple editorial vector object, large and isolated, using outline + flat color',
    maxLabels: 2,
    focalPoint: 'the object itself',
  },

  comparison: {
    role: 'COMPARISON',
    weight: 'diagram-led — clean symmetrical two-column composition',
    illustration: 'one simple flat 2D icon per column with one thin center divider',
    maxLabels: 2,
    focalPoint: 'the contrast between both halves',
  },

  explanation: {
    role: 'EXPLANATION',
    weight: 'diagram-led — simple linear sequence',
    illustration: '3–4 flat 2D nodes connected by thin directional arrows',
    maxLabels: 4,
    focalPoint: 'the sequence as a whole',
  },

  'modern-connection': {
    role: 'MODERN CONNECTION',
    weight: 'typography + short flat icon chain',
    illustration: 'up to 4 minimalist 2D icons connected by thin arrows',
    maxLabels: 4,
    focalPoint: 'the connection between the icons',
  },

  surprise: {
    role: 'SURPRISE / REVEAL',
    weight: 'typography-led with one strong flat visual',
    illustration: 'ONE simple symbolic 2D reveal visual or callout number',
    maxLabels: 1,
    focalPoint: 'the reveal',
  },

  journey: {
    role: 'JOURNEY',
    weight: 'diagram-led — numbered flat 2D path',
    illustration: 'up to 4 flat 2D waypoints connected by one continuous line',
    maxLabels: 4,
    focalPoint: 'the path',
  },

  'big-idea': {
    role: 'BIG IDEA',
    weight: 'typography-led — the statement is the visual',
    illustration: 'optional single tiny 2D icon',
    maxLabels: 0,
    focalPoint: 'the statement itself',
  },

  recap: {
    role: 'RECAP',
    weight: 'typography-led summary with a restrained visual thread',
    illustration: 'short strip of up to 5 tiny flat 2D icons',
    maxLabels: 5,
    focalPoint: 'the visual summary strip',
  },

  'next-up': {
    role: 'NEXT UP / TEASER',
    weight: 'typography-led teaser',
    illustration: 'ONE simple flat 2D silhouette or outline icon',
    maxLabels: 0,
    focalPoint: 'curiosity',
  },

  payoff: {
    role: 'PAYOFF',
    weight: 'typography-led closing statement',
    illustration: 'ONE restrained flat 2D closing symbol',
    maxLabels: 1,
    focalPoint: 'the closing statement',
  },
};

// ─────────────────────────────────────────────────────────────
// LAYOUT FALLBACK
// ─────────────────────────────────────────────────────────────

const LAYOUT_TO_SLIDE_TYPE_FALLBACK = {
  'hook-open': 'hook',
  'process-flow': 'explanation',
  'concept-explain': 'explanation',
  comparison: 'comparison',
  'real-world': 'example',
  'recap-close': 'big-idea',
  'next-up': 'next-up',
};

function getComposition(slide) {
  const byType = SLIDE_TYPE_COMPOSITION[slide.slideType];

  if (byType) {
    return byType;
  }

  const fallbackType = LAYOUT_TO_SLIDE_TYPE_FALLBACK[slide.layout];

  if (
    fallbackType &&
    SLIDE_TYPE_COMPOSITION[fallbackType]
  ) {
    return SLIDE_TYPE_COMPOSITION[fallbackType];
  }

  return SLIDE_TYPE_COMPOSITION.explanation;
}

// ─────────────────────────────────────────────────────────────
// BACKGROUND SYSTEM
// ─────────────────────────────────────────────────────────────

const MINIMAL_BACKGROUND_DESCRIPTIONS = {

  paper:
    'Warm off-white editorial paper canvas #F8F7F4 with extremely subtle natural paper grain.',

  texture:
    'Warm eggshell paper #F8F7F4 with barely visible tactile grain; clean and quiet.',

  grid:
    'Warm off-white #F8F7F4 with an extremely faint engineering notebook grid in #E5E7EB.',

  dots:
    'Warm off-white paper with tiny sparse technical dots in very low-opacity gray; never decorative or busy.',

  solid:
    'Clean warm off-white solid canvas #F8F7F4.',

  seamless:
    'Continuous warm paper canvas with an extremely subtle shared grid motif for carousel continuity.',

  grain:
    'Fine natural paper grain on a warm off-white editorial canvas.',

  watermark:
    'Very subtle oversized editorial text watermark at extremely low opacity.',

  // Legacy background types are intentionally flattened.
  blobs:
    'Flat off-white paper canvas with one or two simple organic 2D accent shapes; no gradient.',

  gradient:
    'Flat off-white paper canvas with a single solid accent shape; absolutely no gradient.',

  'gradient-radial':
    'Flat off-white paper canvas with one solid circular accent shape; absolutely no glow.',

  glass:
    'Flat editorial paper canvas with a simple outlined rectangular information panel; no glass effect.',

  blurPhoto:
    'Flat warm off-white editorial canvas; photographic blur removed and replaced with clean negative space.',
};

export function getBackgroundDescription(
  bgType,
  primary,
  accent,
  styleMode = 'minimal'
) {
  return MINIMAL_BACKGROUND_DESCRIPTIONS[bgType]
    || MINIMAL_BACKGROUND_DESCRIPTIONS.paper;
}

// ─────────────────────────────────────────────────────────────
// FLAT 2D ASSET STYLE RESOLVER
// ─────────────────────────────────────────────────────────────

function resolveMinimalAssetStyle(combinedLower) {

  if (
    combinedLower.includes('terminal') ||
    combinedLower.includes('laptop') ||
    combinedLower.includes('code') ||
    combinedLower.includes('cli')
  ) {
    return `
Flat 2D developer interface illustration.
Simple rectangular terminal window.
Thin black outline.
Flat dark charcoal fill.
Minimal syntax-color accents.
No perspective.
No screen reflections.
No 3D depth.
No glossy UI.
`;
  }

  if (combinedLower.includes('icon')) {
    return `
Minimal geometric 2D line-art icon.
Uniform thin stroke.
Flat single-color fill where needed.
Simple silhouette.
Editorial technical illustration.
`;
  }

  if (
    combinedLower.includes('diagram') ||
    combinedLower.includes('flow') ||
    combinedLower.includes('pipeline') ||
    combinedLower.includes('architecture') ||
    combinedLower.includes('step-by-step')
  ) {
    return `
Flat 2D technical diagram.
Thin outlined nodes.
Simple rectangular or rounded blocks.
Straight arrows.
Flat fills only.
No perspective.
No depth.
No decorative elements.
`;
  }

  if (
    combinedLower.includes('checklist') ||
    combinedLower.includes('recap')
  ) {
    return `
Minimal editorial checklist illustration.
Thin outlined check circles.
Simple flat marker accents.
Clean horizontal rhythm.
No cards stacked in depth.
`;
  }

  if (
    combinedLower.includes('two-column') ||
    combinedLower.includes('comparison') ||
    combinedLower.includes('contrasting')
  ) {
    return `
Flat 2D split-panel editorial illustration.
One simple icon per side.
Thin vertical divider.
Mirrored visual weight.
Flat colors.
`;
  }

  return `
Minimal editorial 2D vector illustration.
Thin precise linework.
Flat geometric forms.
Simple symbolic visual metaphor.
No realistic rendering.
No dimensional effects.
`;
}

// ─────────────────────────────────────────────────────────────
// NEGATIVE PROMPT
// ─────────────────────────────────────────────────────────────

function buildNegativePrompt(composition) {

  return `NEGATIVE PROMPT — STRICT STYLE ENFORCEMENT:

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
gloss
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
cartoon clipart
corporate stock illustration
AI-generated stock art
gradient
gradient background
neon glow
lens flare
bokeh
busy background
photographic background
textured 3D surface

STYLE REQUIREMENTS:

- Pure flat 2D.
- Editorial vector language.
- Thin controlled linework.
- Flat fills.
- No artificial depth.
- No perspective.
- No dimensional shading.
- Warm off-white paper canvas.
- At least 35% visual breathing room.
- One focal concept.
- No decorative clutter.
- No more than ${composition.maxLabels} visual labels.
- Typography must remain editorial and restrained.
- Highlighter blocks must remain flat marker strokes.
- Underlines must look hand-drawn and 2D.
`;
}

// ─────────────────────────────────────────────────────────────
// SINGLE SLIDE IMAGE PROMPT
// ─────────────────────────────────────────────────────────────

export function generateSlideImagePrompt(
  post,
  slide,
  trackColor,
  styleMode = 'minimal'
) {
  const primary =
    trackColor?.primary || '#295c8e';

  const accent =
    trackColor?.accent || '#adcceb';

  const headline =
    slide.headline ||
    slide.SlideTitle ||
    post.title ||
    post.PostTitle ||
    'Untitled';

  const bodyText =
    slide.text ||
    slide.Content ||
    '';

  const vibe =
    slide.vibe ||
    'quiet, intelligent, editorial';

  const composition =
    getComposition(slide);

  const combinedLower =
    `${headline} ${bodyText} ${vibe} ${slide.layout || ''} ${slide.visualDirective || ''}`
      .toLowerCase();

  const assetStyle =
    resolveMinimalAssetStyle(combinedLower);

  /*
   * IMPORTANT:
   * This prompt is intentionally ASSET-ONLY.
   * The image generator must return an isolated transparent PNG
   * that can be placed inside the slide editor.
   *
   * Do NOT generate:
   * - the complete Instagram slide
   * - background
   * - headline/body/footer
   * - page numbers
   * - highlighter blocks
   * - decorative layout elements
   */
  return `TRANSPARENT PNG ASSET GENERATOR — MINIMAL EDITORIAL 2D

OUTPUT:
- Generate ONLY the visual illustration/diagram asset.
- Return an isolated PNG with a fully transparent background.
- Transparency is REQUIRED.
- The asset will be composited into a separately designed 4:5 Instagram slide.
- Do NOT generate the complete slide.
- Do NOT generate a poster, canvas, page, card, or background.

SOURCE CONCEPT:
Topic:
"${headline}"

Concept:
"${bodyText}"

Vibe:
${vibe}

VISUAL ROLE:
${composition.role}

Visual weight:
${composition.weight}

Focal point:
${composition.focalPoint}

Maximum visual labels:
${composition.maxLabels}

ASSET DIRECTION:
${assetStyle}

CORE STYLE — STRICT:
Pure flat 2D editorial vector illustration.

- Premium independent magazine + engineering notebook visual language.
- Clean, intelligent, restrained, technical.
- Thin-to-medium controlled linework.
- Simple geometric construction.
- Flat fills only.
- Minimal internal detail.
- Strong silhouette and clear visual hierarchy.
- One strong visual metaphor.
- Designed, not rendered.
- Crisp edges suitable for PNG compositing.
- Keep the entire asset visually light and isolated.

TRANSPARENCY / BACKGROUND — ABSOLUTE:
- Background MUST be 100% transparent.
- Output MUST contain an alpha channel.
- No paper background.
- No off-white background.
- No grid.
- No texture.
- No grain.
- No canvas decoration.
- No colored rectangle behind the asset.
- No white box around the asset.
- No shadow baked into the background.
- No environmental scene.
- No floor or surface.
- No framing panel unless the visual concept itself explicitly requires a flat outlined panel.
- Leave transparent pixels around the entire asset.

COMPOSITION:
- Generate ONLY the visual centerpiece.
- Center the asset within its transparent canvas.
- Use generous transparent padding around the artwork.
- Keep approximately 25–40% of the canvas transparent around the asset where practical.
- Do not stretch the artwork to the edges.
- Do not fill empty transparent space.
- Maintain a clean silhouette for easy placement in the editor.

TEXT:
- Do NOT generate headlines.
- Do NOT generate subtitles.
- Do NOT generate body copy.
- Do NOT generate footers.
- Do NOT generate page numbers.
- Do NOT generate "SWIPE".
- Avoid text entirely unless a tiny technical label is essential to the visual concept.
- If labels are necessary, use no more than ${composition.maxLabels}, keep them short, clean, and legible.

HIGHLIGHTER / UNDERLINE:
- Do NOT generate slide-level highlighter blocks.
- Do NOT generate decorative marker backgrounds.
- Do NOT generate slide-level pen underlines.
- Only use a flat accent/highlight inside the illustration if it is necessary to communicate the concept.
- Primary accent: ${primary}
- Secondary accent: ${accent}

COLOR:
- Ink: #111827
- Primary accent: ${primary}
- Secondary accent: ${accent}
- Optional neutral flat fills only when needed.
- Restrained palette.
- No rainbow colors.
- No gradients.

DEPTH:
- Absolutely NO artificial 3D depth.
- NO perspective.
- NO isometric view.
- NO extrusion.
- NO bevels.
- NO dimensional shading.
- NO realistic lighting.
- NO glossy surfaces.
- NO dramatic shadows.
- If grounding is necessary, use only a tiny flat contact mark that remains part of the 2D asset.

PNG COMPOSITING RULE:
The result must look correct when placed directly over:
#F8F7F4

The asset must NOT depend on any background color to look complete.

NEGATIVE PROMPT — STRICT:
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
gloss
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
cartoon clipart
corporate stock illustration
AI-generated stock art
gradient
gradient background
neon glow
lens flare
bokeh
busy background
photographic background
paper background
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

FINAL QUALITY CHECK:
1. Is the background fully transparent?
2. Is the output ONLY the requested visual asset?
3. Can the PNG be placed directly over another slide without a visible box?
4. Does it look purely flat 2D?
5. Does it avoid all 3D/rendered aesthetics?
6. Is the asset simple, editorial, technical, and visually isolated?

If any answer is NO, regenerate the asset.`;
}

// ─────────────────────────────────────────────────────────────
// MASTER CAROUSEL PROMPT
// ─────────────────────────────────────────────────────────────

export function generatePostMasterPrompt(
  post,
  trackColor,
  styleMode = 'minimal'
) {

  const primary =
    trackColor?.primary || '#1E5FA8';

  const accent =
    trackColor?.accent || '#A9D0F5';

  const paletteName =
    trackColor?.palette || 'Editorial';

  const slides =
    post.slides ||
    post.Slides ||
    [];

  const totalSlides =
    slides.length || 7;

  const trackLabel =
    post.trackId
      ? `Track ${post.trackId}`
      : (post.Track || post.trackName || '');

  const postTitle =
    post.title ||
    post.PostTitle ||
    'Post';

  let prompt = `INSTAGRAM IMAGE CREATOR
MINIMAL EDITORIAL 2D CAROUSEL SYSTEM

Track:
${trackLabel}

Palette:
${paletteName}

Primary:
${primary}

Accent:
${accent}

Post:
"${postTitle}"

Total Slides:
${totalSlides}

FORMAT:
Every slide MUST be 4:5 vertical portrait.
1080x1350px.

GLOBAL STYLE:
${STYLE_LOCK.minimal}

CORE VISUAL PRINCIPLE:
Design, don't render.

Every visual should look like a premium editorial
2D infographic drawn on paper — NOT like a 3D asset.

Use:
- flat vector shapes
- thin editorial linework
- simple diagrams
- restrained icons
- geometric blocks
- highlighter strokes
- hand-drawn underlines
- negative space

Never use:
- 3D
- isometric
- glossy
- holographic
- gradients
- clay
- stickers
- photorealism
- dramatic shadows

CAROUSEL CONTINUITY:
For carousels with more than 3 body slides, preserve the
composition pattern's core visual element across slides.

Examples:
- Timeline → same horizontal ribbon.
- Concept Breakdown → same blueprint language.
- Comparison → same center divider.
- Process → same arrow/flow language.
- Architecture → same box-and-arrow system.

Each slide has ONE conceptual job.

ASSET MANIFEST:
`;

  slides.forEach((s, idx) => {

    const slideNo =
      s.slideNo || idx + 1;

    const headline =
      s.headline ||
      s.SlideTitle ||
      `Slide ${slideNo}`;

    const bodyText =
      s.text ||
      s.Content ||
      '';

    const composition =
      getComposition(s);

    prompt += `
────────────────────────────────────────
SLIDE ${slideNo}
────────────────────────────────────────

Headline:
"${headline}"

Slide Type:
${s.slideType || '(inferred from layout: ' + (s.layout || 'n/a') + ')'}

Role:
${composition.role}

Concept:
${bodyText}

Visual Weight:
${composition.weight}

Illustration:
${composition.illustration}

Focal Point:
${composition.focalPoint}

Maximum Labels:
${composition.maxLabels}

VISUAL RULE:
Pure flat 2D editorial illustration.
No 3D depth.
No perspective.
No gradients.
No glossy effects.

`;
  });

  prompt += `
GLOBAL NEGATIVE PROMPT:

NO 3D
NO ISOMETRIC
NO CLAY
NO GLOSS
NO HOLOGRAPHIC
NO GLASSMORPHISM
NO EXTRUSION
NO BEVEL
NO REALISTIC LIGHTING
NO CINEMATIC RENDERING
NO PHOTOREALISM
NO STICKER GRAPHICS
NO TOY-LIKE OBJECTS
NO GRADIENTS
NO NEON GLOW
NO HEAVY SHADOWS
NO BUSY BACKGROUNDS
NO GENERIC CORPORATE CLIPART

FINAL VISUAL TEST:

If the image looks like it was rendered in Blender,
reject it.

If the image looks like a glossy app illustration,
reject it.

If the image looks like a 3D sticker,
reject it.

If the image looks like a premium printed editorial
infographic drawn with flat vector shapes,
approve it.
`;

  return prompt;
}

// ─────────────────────────────────────────────────────────────
// CAPTION GENERATOR
// ─────────────────────────────────────────────────────────────

export function generateCaptionText(post) {

  const postTitle =
    post.title ||
    post.PostTitle ||
    'SWE Notebook';

  const description =
    post.Description ||
    post.metadata?.description ||
    '';

  const slides =
    post.slides ||
    post.Slides ||
    [];

  let text =
    `${postTitle}\n\n`;

  if (description) {
    text += `${description}\n\n`;
  }

  text += `📌 Slide Breakdown:\n`;

  slides.forEach((s, idx) => {

    const slideNo =
      s.slideNo || idx + 1;

    const headline =
      s.headline ||
      s.SlideTitle ||
      `Slide ${slideNo}`;

    text +=
      `• Slide ${slideNo}: ${headline}\n`;
  });

  const hashtags =
    post.Hashtags ||
    post.metadata?.hashtags ||
    [];

  const hashtagStr =
    hashtags.length
      ? hashtags.join(' ')
      : '#softwareengineering #webdevelopment #programming #learncoding #developer';

  text += `
💡 Save this post for quick reference and share it with a fellow engineer.

Follow for more daily SWE & AI visual breakdowns.

${hashtagStr}`;

  return text;
}

// ─────────────────────────────────────────────────────────────
// COVER PROMPT
// ─────────────────────────────────────────────────────────────

export function generateCoverPrompt(
  cover,
  styleMode = 'minimal'
) {

  const primary =
    cover.Primary ||
    cover.primary ||
    '#1E5FA8';

  const accent =
    cover.Accent ||
    cover.accent ||
    '#A9D0F5';

  const palette =
    cover.Palette ||
    cover.palette ||
    'Editorial';

  const composeNote = `
Composition cap:
Maximum THREE visual elements.

Use ONE simple bridge motif if necessary.

Do not illustrate the entire topic.
Do not build a scene.
Do not create decorative filler.
`;

  return `INSTAGRAM IMAGE CREATOR — EDITORIAL 2D COVER

Format:
4:5 vertical portrait.
1080x1350px.

Series:
SWE Notebook (Zero to Hero)

Track:
${cover.Track}

Palette:
${palette}

Primary:
${primary}

Accent:
${accent}

CANVAS:
Warm textured off-white paper #F8F7F4.
Extremely subtle notebook grid if appropriate.
No gradient.

HEADLINE:
"${cover.CoverHeadline || cover.Title}"

Typography:
Large elegant Editorial Serif.
Use italic emphasis.
Place a flat fluorescent ${accent} highlighter block behind
the key word.

SUBTITLE:
"${cover.Subtitle || ''}"

Use clean modern Sans-Serif.

VISUAL:
${cover.VisualPrompt ||
    cover.VisualDirective ||
    'One minimal flat editorial vector illustration representing the core idea.'}

${composeNote}

VISUAL STYLE:
- Pure 2D vector.
- Thin editorial linework.
- Flat color fills.
- Simple geometric construction.
- No perspective.
- No artificial depth.
- No 3D.
- No isometric.
- No glossy surfaces.
- No stickers.
- No shadows beyond an extremely subtle flat grounding mark.

WHITESPACE:
At least 40%.

OVERALL FEEL:
Premium independent magazine.
Technical notebook.
Quiet intelligence.
Minimal but memorable.

NEGATIVE:
3D, isometric, clay, glossy, holographic, chrome,
gradient, extrusion, bevel, photorealistic,
cinematic lighting, sticker, toy, heavy shadow,
busy background, corporate clipart.
`;
}

// ─────────────────────────────────────────────────────────────
// PAGE INDICATOR
// ─────────────────────────────────────────────────────────────

export function generatePageIndicator(
  slide,
  totalSlides
) {

  const n =
    slide.slideNo || 1;

  const padded =
    (num) => String(num).padStart(2, '0');

  if (n === 1) {
    return 'SWIPE →';
  }

  if (n === totalSlides) {

    if (
      slide.slideType === 'next-up' ||
      slide.layout === 'next-up'
    ) {
      return slide.text
        ? `NEXT: ${String(slide.text).toUpperCase()} →`
        : 'SAVE THIS →';
    }

    return 'SAVE THIS.';
  }

  return `${padded(n)} — ${padded(totalSlides)}`;
}