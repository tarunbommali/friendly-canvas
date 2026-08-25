import React from 'react'
import { getLayout } from './LayoutRegistry'
import SlideBackground, { getBackgroundPreset } from '../../../shared/components/SlideBackground'

/**
 * LayoutRenderer — Bridge component
 * Resolves layout from registry, renders SlideBackground + Archetype component + shared footer chrome.
 */
export default function LayoutRenderer({
  layoutId,
  data,
  trackColor,
  config = {},
  slideNumber = 1,
  totalSlides = 7,
  isNextUp = false,
}) {
  const layout = getLayout(layoutId)

  if (!layout) {
    return (
      <div
        className="bg-white text-slate-900 rounded-2xl p-6 flex flex-col items-center justify-center border border-slate-200 select-none"
        style={{ aspectRatio: '4 / 5' }}
      >
        <span className="text-3xl mb-2">❓</span>
        <h3 className="text-lg font-bold m-0">Layout Not Found</h3>
        <p className="text-xs text-slate-400 m-0 mt-1 font-mono">{layoutId}</p>
      </div>
    )
  }

  const LayoutComponent = layout.component
  const mergedConfig = { ...layout.defaultConfig, ...config }

  const primary = trackColor?.primary || '#1E5FA8'
  const accent = trackColor?.accent || '#A9D0F5'

  // Prepare data with layout context
  const layoutData = {
    ...data,
    slideNumber,
    totalSlides,
    isNextUp,
    trackColor: { primary, accent, palette: trackColor?.palette },
    layoutConfig: mergedConfig,
    trackNo: data.trackNo || String(data.Track?.match(/\d+/)?.[0] || '1').padStart(2, '0'),
  }

  return (
    <div
      className="bg-white text-slate-900 rounded-2xl p-6 flex flex-col shadow-2xl relative overflow-hidden border border-slate-200 select-none"
      style={{
        aspectRatio: '4 / 5',
        '--slide-primary': primary,
        '--slide-accent': accent,
        isolation: 'isolate',
      }}
    >
      {/* Background Pattern Layer */}
      <SlideBackground
        config={getBackgroundPreset(data.backgroundType || data.BackgroundType, trackColor)}
        seed={slideNumber}
      />

      {/* Layout Component */}
      <div className="relative z-10 flex-1 flex flex-col min-h-0">
        <LayoutComponent data={layoutData} config={mergedConfig} />
      </div>

      {/* Shared Footer Chrome */}
      <div className="relative z-10 flex items-center justify-between text-xs font-mono text-slate-500 mt-3 pt-3 border-t border-slate-200/60">
        <span className="font-bold text-slate-600">
          {slideNumber} / {totalSlides}
        </span>
        {isNextUp ? (
          <span
            className="px-3 py-1 rounded-full text-white font-sans font-bold text-xs shadow-sm"
            style={{ backgroundColor: primary }}
          >
            Follow for more
          </span>
        ) : (
          <span className="font-bold text-slate-950 font-sans">Swipe ➔</span>
        )}
      </div>
    </div>
  )
}
