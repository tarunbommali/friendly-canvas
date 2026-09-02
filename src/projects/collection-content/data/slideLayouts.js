/**
 * slideLayouts.js
 * ───────────────
 * Auto-resolver that maps data.json slide `Layout` field → registry key.
 * Uses slide position, title patterns, and explicit Layout field for resolution.
 */

/**
 * Resolve the LayoutCategory ID for a given slide.
 * Uses the slide's Layout field, position, and title patterns.
 */
export function resolveLayoutId(slide = {}, totalSlides = 7) {
  const slideNo = slide.SlideNo || slide.slideNo || 1
  const layout = String(slide.Layout || slide.layoutId || (typeof slide.layout === 'string' ? slide.layout : slide.layout?.id) || '')
  const title = (slide.SlideTitle || slide.content?.title || slide.title || '').toLowerCase()

  // Last slide → next-up (closing CTA)
  if (
    slideNo === totalSlides ||
    title === 'next up' ||
    title === 'series finale'
  ) {
    return 'next-up'
  }

  // Explicit layout mappings from data.json
  const directMappings = {
    'hook-open': 'hook-open',
    'concept-explain': 'concept-explain',
    'process-flow': 'process-flow',
    'comparison': 'comparison',
    'recap-close': 'recap-close',
    'real-world': 'concept-explain',
    'closing-cta': 'next-up',
    'timeline-ribbon': 'timeline-ribbon',
    'architecture-blueprint': 'architecture-blueprint',
    'matrix-replace': 'matrix-replace',
  }

  if (directMappings[layout]) {
    return directMappings[layout]
  }

  // Position-based auto-detection
  if (slideNo === 1) return 'hook-open'
  if (slideNo === totalSlides - 1) return 'recap-close'

  // Title-based pattern detection
  if (title.includes('real-world') || title.includes('production') || title.includes('example')) {
    return 'concept-explain'
  }
  if (title.includes('timeline') || title.includes('history') || title.includes('evolution')) {
    return 'timeline-ribbon'
  }
  if (title.includes('architecture') || title.includes('system design') || title.includes('blueprint')) {
    return 'architecture-blueprint'
  }
  if (title.includes('vs') || title.includes('versus') || title.includes('compared')) {
    return 'comparison'
  }
  if (title.includes('recap') || title.includes('summary')) {
    return 'recap-close'
  }

  // Default fallback
  return 'concept-explain'
}

/**
 * Prepare layout data from a slide object.
 * Maps data.json slide fields to the slot schema expected by LayoutCategorys.
 */
export function prepareLayoutData(slide = {}, post = {}, collectionColor = {}) {
  const collectionStr = post?.collectionName || post?.collection?.name || post?.collection || 'Collection 1'
  const collectionNo = String(collectionStr.match(/\d+/)?.[0] || post?.collectionId || '1').padStart(2, '0')

  const title = slide.SlideTitle || slide.content?.title || slide.title || 'Untitled'
  const content = slide.Content || slide.content?.body || slide.content?.content || slide.content?.explanation || (typeof slide.content === 'string' ? slide.content : '')
  const visualDirective = slide.VisualDirective || slide.content?.visualDirective || slide.visualDirective || ''
  const backgroundType = slide.BackgroundType || slide.config?.backgroundType || 'dots'

  return {
    // Core fields (mapped from data.json schema)
    title,
    content,
    visualDirective,
    backgroundType,

    // Collection context
    collectionNo,
    collectionName: collectionStr,
    collectionColor: collectionColor || post?.palette || { primary: '#1E5FA8', accent: '#A9D0F5' },

    // Pass raw slide for LayoutCategorys that need extra fields
    _raw: slide,
  }
}

/**
 * Get the fully resolved layout for a slide.
 * Returns { layoutId, data, config } ready for LayoutRenderer.
 */
export function getSlideLayout(slide = {}, post = {}, trackColor = {}, totalSlides = 7) {
  const total = totalSlides || post?.Slides?.length || post?.slides?.length || 7
  const layoutId = resolveLayoutId(slide, total)
  const data = prepareLayoutData(slide, post, trackColor)

  return {
    layoutId,
    data,
  }
}
