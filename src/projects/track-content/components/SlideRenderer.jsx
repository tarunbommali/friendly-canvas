import { getSlideLayout } from '../data/slideLayouts'

/**
 * SlideRenderer.jsx
 * ─────────────────
 * Full-size 540×675 slide renderer component.
 */
export function SlideRenderer({
  slide,
  post,
  trackColor = {},
  slideNumber,
  totalSlides,
  isLast = false,
  isNextUp = false,
  className = 'slide-renderer',
  style = {},
}) {
  const total = totalSlides || post?.Slides?.length || 7
  const slideNo = slideNumber || slide?.SlideNo || 1

  const checkNextUp =
    isNextUp ||
    isLast ||
    slide?.SlideTitle === 'Next Up' ||
    slide?.SlideTitle === 'Series Finale'

  const { data } = getSlideLayout(slide, post, trackColor, total)

  const defaultStyle = {
    width: style.width || '100%',
    maxWidth: style.maxWidth || '540px',
    margin: style.margin || '0 auto',
    isolation: 'isolate',
    userSelect: 'none',
    ...style,
  }

  const titleText = slide?.headline || slide?.SlideTitle || data?.title || ''
  const contentText = slide?.text || slide?.Content || data?.content || ''
  const visualDirectiveText = slide?.descriptionVisual || slide?.VisualDirective || data?.visualDirective || ''

  return (
    <div className={`${className} bg-white rounded-2xl border border-slate-200 p-8 flex flex-col justify-between shadow-xl relative overflow-hidden text-slate-900`} style={defaultStyle}>
      {/* Eyebrow Track Label */}
      <div className="border-b border-slate-100 pb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
          {post?.collectionName || `Track ${post?.trackId || 1}`}
        </span>
      </div>

      {/* Main Slide Content */}
      <div className="my-auto space-y-4">
        {titleText && (
          <h2 className="text-2xl font-bold text-slate-900 leading-tight">
            {titleText}
          </h2>
        )}

        {contentText && (
          <p className="text-sm text-slate-600 leading-relaxed">
            {contentText}
          </p>
        )}

        {visualDirectiveText && (
          <div className="bg-amber-50/60 border border-amber-300/60 rounded-xl p-4 text-xs font-medium text-amber-900">
            {visualDirectiveText}
          </div>
        )}
      </div>

      {/* Slide Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-400 font-mono">
        <span>{slideNo} / {total}</span>
        <span>{checkNextUp ? 'Follow for more →' : 'Swipe →'}</span>
      </div>
    </div>
  )
}

export const SlidePreview = SlideRenderer

export default SlideRenderer
