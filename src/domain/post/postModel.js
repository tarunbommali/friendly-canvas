/**
 * postModel.js
 * ────────────
 * Canonical Domain Model for SWE.notebook Posts, Slides, and Track Palettes.
 * Adheres to carousel-post.schema.json (v1.0.0).
 */

export const SCHEMA_VERSION = '1.0.0'

export const DEFAULT_CANONICAL_CONFIG = {
  width: 1080,
  height: 1350,
  background: '#F8F7F4',
  backgroundType: 'dots',
  padding: 64,
  spacing: 32,
}

/**
 * Normalizes or extracts track ID from track string e.g. "Track 1 — Why Computers Exist" -> "01"
 */
export function extractTrackNumber(trackString = '') {
  const match = trackString.match(/Track\s*(\d+)/i)
  if (match) {
    return match[1].padStart(2, '0')
  }
  return '01'
}

/**
 * Creates a Canonical Post object conforming to carousel-post.schema.json v1.0.0
 */
export function createCanonicalPost({
  id,
  title = 'Untitled Post',
  trackId = '01',
  trackName = 'Track 1 — General Engineering',
  palette = { name: 'Sepia', primary: '#8B5E3C', accent: '#D9C7A3' },
  slides = [],
  metadata = {},
} = {}) {
  const generatedId = id || `post_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`
  const now = new Date().toISOString()

  return {
    id: generatedId,
    schemaVersion: SCHEMA_VERSION,
    title,
    track: {
      id: trackId,
      name: trackName,
      palette: {
        name: palette.name || 'Custom',
        primary: palette.primary || '#1E5FA8',
        accent: palette.accent || '#A9D0F5',
      },
    },
    slides: slides.map((slide, index) =>
      createCanonicalSlide({
        ...slide,
        slideNo: slide.slideNo || index + 1,
        trackPalette: palette,
      })
    ),
    metadata: {
      createdAt: metadata.createdAt || now,
      updatedAt: metadata.updatedAt || now,
      description: metadata.description || '',
      hashtags: metadata.hashtags || ['#SWENotebook', '#SoftwareEngineering'],
      suggestedAudio: metadata.suggestedAudio || {
        Mood: 'Curious / documentary',
        SearchTerms: ['trending engineering sound', 'tech explainer audio'],
        Note: 'Pick a currently trending audio track matching this mood at posting time.',
      },
      context: metadata.context || '',
      isFirstPostInTrack: Boolean(metadata.isFirstPostInTrack),
      ...metadata,
    },
  }
}

/**
 * Creates a Canonical Slide object
 */
export function createCanonicalSlide({
  id,
  slideNo = 1,
  layoutId = 'concept-explain',
  layoutVersion = '1.0.0',
  title = 'Slide Title',
  body = '',
  visualDirective = '',
  content = {},
  config = {},
  elements = [],
  assets = [],
} = {}) {
  const generatedId = id || `slide_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`

  return {
    id: generatedId,
    slideNo: Number(slideNo) || 1,
    layout: {
      id: layoutId || 'concept-explain',
      version: layoutVersion || '1.0.0',
    },
    content: {
      title: title || content.title || '',
      body: body || content.body || content.explanation || '',
      visualDirective: visualDirective || content.visualDirective || '',
      ...(content.insight ? { insight: content.insight } : {}),
      ...(content.steps ? { steps: content.steps } : {}),
      ...(content.leftTitle ? { leftTitle: content.leftTitle } : {}),
      ...(content.leftContent ? { leftContent: content.leftContent } : {}),
      ...(content.rightTitle ? { rightTitle: content.rightTitle } : {}),
      ...(content.rightContent ? { rightContent: content.rightContent } : {}),
      ...(content.watermark ? { watermark: content.watermark } : {}),
      ...content,
    },
    config: {
      ...DEFAULT_CANONICAL_CONFIG,
      ...config,
      width: config.width || DEFAULT_CANONICAL_CONFIG.width,
      height: config.height || DEFAULT_CANONICAL_CONFIG.height,
      background: config.background || DEFAULT_CANONICAL_CONFIG.background,
    },
    elements: Array.isArray(elements) ? elements : [],
    assets: Array.isArray(assets) ? assets : [],
  }
}

export function validateCanonicalPost(post) {
  const errors = []
  if (!post || typeof post !== 'object') {
    return { valid: false, errors: ['Post must be a non-null object'] }
  }
  if (!post.id) errors.push('Missing post.id')
  const schemaVer = post.schemaVersion || '1.0.0'
  if (schemaVer !== '1.0.0' && schemaVer !== '1.1.0') {
    errors.push(`Invalid schemaVersion: expected 1.0.0 or 1.1.0, got ${post.schemaVersion}`)
  }
  if (!post.title && !post.PostTitle) errors.push('Missing post.title')
  if (!post.trackId && !post.track?.id && !post.TrackNo && !post.Track) {
    errors.push('Missing post.trackId')
  }
  const slides = post.slides || post.Slides
  if (!Array.isArray(slides) || slides.length === 0) {
    errors.push('Post must have at least one slide')
  } else {
    slides.forEach((slide, index) => {
      if (!slide.id) errors.push(`Slide at index ${index} missing id`)
      const layoutId = typeof slide.layout === 'string' ? slide.layout : (slide.layout?.id || slide.Layout)
      if (!layoutId) errors.push(`Slide at index ${index} missing layout.id`)
      const width = slide.config?.width || 1080
      const height = slide.config?.height || 1350
      if (!width || !height) {
        errors.push(`Slide at index ${index} missing config.width/height`)
      }
    })
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

export function exportPostToCanonicalJSON(post) {
  const canonical = createCanonicalPost(post)
  return JSON.stringify(canonical, null, 2)
}

