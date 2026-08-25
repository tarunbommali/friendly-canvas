import React from 'react'

/**
 * HookOpen — Slide 1 Layout Archetype
 * Scroll-stopping big-type opener with highlighter accent block,
 * optional watermark, and visual directive card.
 */
export default function HookOpen({ data = {}, config = {} }) {
  const { title, content, visualDirective, watermark = 'TOPIC' } = data
  const {
    titlePosition = 'center',
    showWatermark = true,
    watermarkOpacity = 0.08,
  } = config
  const { primary, accent } = data.trackColor || { primary: '#1E5FA8', accent: '#A9D0F5' }
  const trackNo = String(data.trackNo || '01').padStart(2, '0')

  return (
    <div className="flex-1 flex flex-col relative">
      {/* Track Header */}
      <div className="flex items-center gap-3 mb-6">
        <span
          className="font-mono text-xs font-extrabold uppercase tracking-wider shrink-0"
          style={{ color: primary }}
        >
          TRACK {trackNo}
        </span>
        <span
          className="flex-1 h-[2px] rounded-full opacity-80"
          style={{ backgroundColor: accent }}
        />
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col justify-center items-center gap-5 relative">
        {/* Watermark */}
        {showWatermark && (
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
            style={{ opacity: watermarkOpacity }}
          >
            <span className="font-serif font-black text-[120px] text-slate-900/10 whitespace-nowrap">
              {watermark}
            </span>
          </div>
        )}

        {/* Title with highlighter */}
        <div className="relative z-10 w-full" style={{ textAlign: titlePosition }}>
          <h2 className="font-serif text-3xl font-bold text-slate-950 leading-tight inline">
            <span
              className="inline px-3 py-1 rounded-sm"
              style={{
                backgroundColor: accent,
                color: '#0f172a',
                boxDecorationBreak: 'clone',
                WebkitBoxDecorationBreak: 'clone',
              }}
            >
              {title}
            </span>
          </h2>
        </div>

        {/* Content Card */}
        {content && (
          <div className="relative z-10 w-full">
            <div className="bg-slate-50/95 border border-slate-200/80 rounded-xl p-4 shadow-xs">
              <p className="text-sm text-slate-700 leading-relaxed font-sans m-0">
                {content}
              </p>
            </div>
          </div>
        )}

        {/* Visual Directive */}
        {visualDirective && (
          <div className="relative z-10 w-full">
            <div
              className="text-xs text-slate-700 bg-slate-50/95 border border-slate-200 p-3 rounded-r-lg"
              style={{ borderLeft: `4px solid ${primary}` }}
            >
              <span className="font-bold uppercase tracking-wider text-[10px] block text-slate-400 font-mono mb-0.5">
                Visual Directive
              </span>
              <p className="m-0 text-xs text-slate-600 leading-relaxed">{visualDirective}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
