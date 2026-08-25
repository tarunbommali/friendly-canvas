import React from 'react'
import LayoutRenderer from '../../layout-library/registry/LayoutRenderer'
import { getSlideLayout } from '../../../data/slideLayouts'

/**
 * SlidePreview
 * ────────────
 * Renders a slide preview using the component-based LayoutCategory layout system.
 * Resolves the correct LayoutCategory and renders via LayoutRenderer.
 */
export function SlidePreview({
  slide,
  post,
  trackColor = {},
  isLast,
  totalSlides,
}) {
  const total = totalSlides || post?.Slides?.length || 7
  const slideNo = slide?.SlideNo || 1

  const isNextUp =
    isLast ||
    slide?.SlideTitle === 'Next Up' ||
    slide?.SlideTitle === 'Series Finale'

  const { layoutId, data } = getSlideLayout(slide, post, trackColor, total)

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '340px',
        margin: '0 auto',
        userSelect: 'none',
      }}
    >
      <LayoutRenderer
        layoutId={layoutId}
        data={{
          ...data,
          // Pass raw slide fields as direct props for LayoutCategory access
          ...slide,
          title: slide?.SlideTitle || data.title,
          content: slide?.Content || data.content,
          visualDirective: slide?.VisualDirective || data.visualDirective,
          backgroundType: slide?.BackgroundType || data.backgroundType,
        }}
        trackColor={trackColor}
        slideNumber={slideNo}
        totalSlides={total}
        isNextUp={isNextUp}
      />
    </div>
  )
}

export default SlidePreview
