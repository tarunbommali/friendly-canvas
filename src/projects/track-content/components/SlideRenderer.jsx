import React from 'react'
import LayoutRenderer from '../../layout-library/registry/LayoutRenderer'
import { getSlideLayout } from '../../../data/slideLayouts'

/**
 * SlideRenderer.jsx
 * ─────────────────
 * Full-size 540×675 renderer for html2canvas PNG export.
 * Uses the component-based LayoutCategory layout system via LayoutRenderer.
 */
export default function SlideRenderer({
  slide,
  post,
  trackColor = {},
  slideNumber,
  totalSlides,
  isNextUp = false,
}) {
  const total = totalSlides || post?.Slides?.length || 7
  const slideNo = slideNumber || slide?.SlideNo || 1

  const { layoutId, data } = getSlideLayout(slide, post, trackColor, total)

  return (
    <div
      className="slide-renderer"
      style={{
        width: '540px',
        height: '675px',
        overflow: 'hidden',
        boxSizing: 'border-box',
        isolation: 'isolate',
      }}
    >
      <LayoutRenderer
        layoutId={layoutId}
        data={{
          ...data,
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
