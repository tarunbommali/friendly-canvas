import React from 'react'

/**
 * NextUp — Closing CTA Layout Archetype (final slide)
 * Brand seal, upcoming topic preview, and Follow CTA.
 */
export default function NextUp({ data = {}, config = {} }) {
  const { title, content, visualDirective } = data
  const { showLogo = true, showCTA = true } = config
  const { primary, accent } = data.trackColor || { primary: '#1E5FA8', accent: '#A9D0F5' }
  const trackNo = String(data.trackNo || '01').padStart(2, '0')

  // Extract next topic from content
  const nextTopic = (content || '')
    .replace(/^up next:?\s*/i, '')
    .replace(/^coming up:?\s*/i, '')
    .trim() || 'Stay tuned for the next deep dive.'

  return (
    <div className="flex-1 flex flex-col">
      {/* Track Header */}
      <div className="flex items-center gap-3 mb-4">
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
      <div className="flex-1 flex flex-col items-center justify-center gap-5">
        {/* Logo / Brand Seal */}
        {showLogo && (
          <div className="flex justify-center">
            {data.logoUrl ? (
              <img
                src={data.logoUrl}
                alt="Brand Logo"
                className="w-14 h-14 rounded-2xl object-cover shadow-md"
              />
            ) : (
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold font-mono text-base shadow-md border-2 border-white"
                style={{ backgroundColor: primary }}
              >
                {data.trackNo ? `T${data.trackNo}` : '★'}
              </div>
            )}
          </div>
        )}

        {/* Brand Line */}
        <p
          className="font-mono text-xs font-bold text-center m-0 tracking-wider"
          style={{ color: primary }}
        >
          {data.trackName || data.brandName || 'Visual Engineering Series'}
        </p>

        {/* Next Up Card */}
        <div
          className="w-full rounded-xl p-5 border text-center"
          style={{
            backgroundColor: '#FFFFFF',
            borderColor: primary,
            borderWidth: '1.5px',
          }}
        >
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Coming Up Next
          </span>
          <h3 className="font-serif text-xl font-bold text-slate-950 m-0 leading-tight">
            <span
              className="inline px-2 py-0.5 rounded-sm"
              style={{
                backgroundColor: accent,
                color: '#0f172a',
                boxDecorationBreak: 'clone',
                WebkitBoxDecorationBreak: 'clone',
              }}
            >
              {nextTopic}
            </span>
          </h3>
        </div>

        {/* CTA */}
        {showCTA && (
          <p
            className="text-sm font-bold text-center m-0"
            style={{ color: primary }}
          >
            🔖 Save this post &amp; Follow for daily visual breakdowns!
          </p>
        )}
      </div>

      {/* Visual Directive */}
      {visualDirective && (
        <div className="mt-3 text-xs text-slate-500 bg-slate-50/95 p-2 rounded border border-slate-200">
          <span className="font-bold text-[10px] uppercase text-slate-400 block font-mono">Visual Directive</span>
          <p className="m-0 text-xs">{visualDirective}</p>
        </div>
      )}
    </div>
  )
}
