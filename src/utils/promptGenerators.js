/**
 * promptGenerators.js
 * ───────────────────
 * Generates production-ready AI prompts, post master storyboards, cover prompts,
 * and Instagram captions synchronized dynamically with data.json, track color palettes,
 * visual DNA standards, and LayoutCategory layout variations.
 */

const BACKGROUND_PROMPT_DESCRIPTIONS = {
  dots: 'Clean off-white canvas with a subtle technical dot-grid pattern (spacing 20px, light primary tone opacity).',
  grid: 'Architectural engineering blueprint line-grid on clean off-white background (#F8F7F4).',
  texture: 'Warm tactile off-white fine paper texture (#F8F7F4) with subtle fibrous grain feel.',
  paper: 'Warm tactile off-white fine paper texture (#F8F7F4) with subtle fibrous grain feel.',
  grain: 'Cinematic fine film grain texture over minimalist clean background.',
  blobs: (p, a) => `Abstract organic fluid shapes and soft ambient blur gradients in primary (${p}) and accent (${a}) tones.`,
  gradient: (p, a) => `Smooth 135-degree linear gradient transitioning softly from white to accent tone (${a}).`,
  'gradient-radial': (p, a) => `Soft radial glow gradient originating from top-left in accent tone (${a}).`,
  glass: (p, a) => `Translucent glassmorphism panels with soft backdrop blur and subtle border highlight in accent (${a}).`,
  watermark: 'Subtle low-opacity editorial watermark typography embedded in the background.',
  solid: 'Ultra-clean solid pure white minimalist background.',
  seamless: 'Continuous panoramic background designed for seamless multi-slide carousel flow.',
  blurPhoto: 'Softly blurred photographic ambient backdrop with 75% clean white overlay.',
}

const LAYOUT_LayoutCategory_DESCRIPTIONS = {
  'hook-open': 'LayoutCategory: hook-open — Scroll-stopping asymmetric big-type layout with glowing fluorescent accent highlighter block.',
  'concept-explain': 'LayoutCategory: concept-explain — Split container layout pairing a centered technical vector diagram with a structured insight card.',
  'process-flow': 'LayoutCategory: process-flow — Sequential 3-stage visual pipeline with connecting arrows, numbered badge pills, and concise step cards.',
  'comparison': 'LayoutCategory: comparison — Dual-column side-by-side contrast card comparing trade-offs with distinct visual borders and indicator icons.',
  'recap-close': 'LayoutCategory: recap-close — Scannable 4-point summary card with circular checkmark indicators and highlighted takeaways.',
  'real-world': 'LayoutCategory: real-world — Production engineering moment featuring a dark-mode terminal window with syntax-highlighted code.',
  'closing-cta': 'LayoutCategory: closing-cta — Branded final card featuring official SWE Notebook circular vector seal, Next-Up topic preview, and Save/Follow CTA.',
}

export function getBackgroundDescription(bgType, primary, accent) {
  const handler = BACKGROUND_PROMPT_DESCRIPTIONS[bgType] || BACKGROUND_PROMPT_DESCRIPTIONS.dots
  return typeof handler === 'function' ? handler(primary, accent) : handler
}

/**
 * Generate a production-ready AI image prompt for a single content visual asset
 * (diagram, illustration, technical icon, or real-world scene)
 */
export function generateSlideImagePrompt(post, slide, trackColor) {
  const primary = trackColor?.primary || '#1E5FA8'
  const accent = trackColor?.accent || '#A9D0F5'
  const paletteName = trackColor?.palette || 'Curated'

  const visualDirective = slide.VisualDirective || 'Clean technical vector illustration or architectural blueprint diagram.'
  const topic = slide.SlideTitle || post.PostTitle
  const context = slide.Content || ''

  // Determine asset style based on visual directive and layout
  let assetStyle = 'Minimalist vector technical line art with fine stroke details'
  const vdLower = visualDirective.toLowerCase()
  if (vdLower.includes('terminal') || vdLower.includes('laptop') || vdLower.includes('code') || vdLower.includes('cli')) {
    assetStyle = 'Dark-mode developer terminal window snapshot with clean syntax highlighting and subtle drop shadow'
  } else if (vdLower.includes('icon') || vdLower.includes('icon row')) {
    assetStyle = 'Clean geometric line-art vector icon set, uniform stroke width, minimalist iconography'
  } else if (vdLower.includes('diagram') || vdLower.includes('flow') || vdLower.includes('pipeline') || vdLower.includes('architecture')) {
    assetStyle = 'Crisp 2D technical architectural diagram with clear flow nodes, directional arrows, and structured blocks'
  } else if (vdLower.includes('checklist') || vdLower.includes('recap')) {
    assetStyle = 'Structured summary card visual with circular checkmark indicators and highlighted badge accents'
  } else if (vdLower.includes('illustration') || vdLower.includes('parchment') || vdLower.includes('abacus') || vdLower.includes('gears') || vdLower.includes('machine')) {
    assetStyle = 'Modern editorial engineering illustration with subtle tactile texture and mechanical precision'
  }

  const prompt = `[Content Visual Asset — SWE Notebook]
Visual Directive: ${visualDirective}
Topic & Focus: "${topic}" (${post.Track})
Concept Explanation: "${context}"

Art Direction & Formatting:
- Asset Type: ${assetStyle}
- Color Palette: Accentuated with ${paletteName} tones (Primary: ${primary}, Accent: ${accent}) on a clean, isolated background (#F8F7F4 or transparent).
- Framing: Centered standalone visual element, isolated subject ready for slide embedding.
- Negative Prompt / Constraints: Clean subject asset only, NO slide borders, NO slide numbers, NO UI chrome, NO full carousel frames, vector-sharp precision.`

  return prompt
}

/**
 * Generate a complete multi-slide content asset bundle prompt for Midjourney / DALL-E / Gemini
 */
export function generatePostMasterPrompt(post, trackColor) {
  const primary = trackColor?.primary || '#1E5FA8'
  const accent = trackColor?.accent || '#A9D0F5'
  const paletteName = trackColor?.palette || 'Curated'
  const totalSlides = post.Slides?.length || 7

  let prompt = `Please generate the content illustration & diagram asset pack for SWE Notebook:

Track: ${post.Track} (${paletteName} Palette: Primary ${primary}, Accent ${accent})
Post: "${post.PostTitle}"
Total Asset Count: ${totalSlides} isolated visual assets

Asset Manifest:
`

  post.Slides?.forEach((s) => {
    prompt += `
--- Slide ${s.SlideNo}: "${s.SlideTitle}" ---
Visual Directive: ${s.VisualDirective || 'Minimal technical vector diagram'}
Concept: ${s.Content}
Asset Style: Isolated subject on transparent or clean #F8F7F4 background with ${primary} and ${accent} accents.
`
  })

  if (post.SuggestedAudio) {
    prompt += `\nAudio Mood: ${post.SuggestedAudio.Mood} (Search: ${post.SuggestedAudio.SearchTerms?.join(', ')})`
  }

  if (post.Hashtags?.length) {
    prompt += `\nHashtags: ${post.Hashtags.join(' ')}`
  }

  return prompt
}

/**
 * Generate Instagram Caption copy with slide breakdown and hashtags
 */
export function generateCaptionText(post) {
  let text = `${post.PostTitle} 🚀\n\n`

  if (post.Description) {
    text += `${post.Description}\n\n`
  }

  text += `📌 Slide Breakdown:\n`
  post.Slides?.forEach((s) => {
    text += `• Slide ${s.SlideNo}: ${s.SlideTitle}\n`
  })

  text += `
💡 Save this post for quick reference and share with a fellow engineer!

Follow for more daily SWE & AI visual breakdowns! 💻✨

${post.Hashtags?.join(' ') || '#softwareengineering #webdevelopment #programming #learncoding #developer'}`

  return text
}

/**
 * Generate a Chapter Cover prompt for book-style track intros
 */
export function generateCoverPrompt(cover) {
  const primary = cover.Primary || cover.primary || '#1E5FA8'
  const accent = cover.Accent || cover.accent || '#A9D0F5'
  const palette = cover.Palette || cover.palette || 'Editorial'

  return `An ultra-premium 4:5 vertical editorial book cover / chapter opening slide for Instagram (1080x1350 px).
Series: SWE Notebook (Zero to Hero)
Track: ${cover.Track}
Color Palette: ${palette} (Primary ${primary}, Accent ${accent})
Canvas: Warm textured eggshell paper grain (#F8F7F4) with faint engineering blueprint grid.
Cover Headline: "${cover.CoverHeadline || cover.Title}" in large, luxurious Editorial Serif typography with fluorescent ${accent} highlighter block accent.
Subtitle: "${cover.Subtitle || ''}" in modern geometric sans-serif.
Visual Composition: ${cover.VisualPrompt || cover.VisualDirective || 'Minimalist isometric diagram or architectural blueprint illustration.'}
Design Standard: High-end editorial design, tactile paper texture, minimal elegant framing, no cheap 3D clipart, 4:5 vertical portrait.`
}
