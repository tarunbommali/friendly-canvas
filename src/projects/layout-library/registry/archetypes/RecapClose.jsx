import React from 'react'
import { Check } from 'lucide-react'

/**
 * RecapClose — Checklist summary Layout Archetype
 * Checkmark indicators with key takeaways and optional next-up teaser.
 */
export default function RecapClose({ data = {}, config = {} }) {
  const { title, items = [], content, nextUp, visualDirective } = data
  const { showNextUp = true } = config
  const { primary, accent } = data.trackColor || { primary: '#1E5FA8', accent: '#A9D0F5' }
  const trackNo = String(data.trackNo || '01').padStart(2, '0')

  // Parse items: accept array or semicolon/comma/newline-separated string
  let recapItems = []
  if (Array.isArray(items) && items.length > 0) {
    recapItems = items
  } else if (content) {
    recapItems = content
      .replace(/^quick recap\s*[-—:]\s*/i, '')
      .replace(/this post covered:\s*/i, '')
      .split(/[;\n]/)
      .map((s) => s.replace(/^[-•·✓✅]\s*/, '').trim())
      .filter(Boolean)
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Track Header */}
      <div className="flex items-center gap-3 mb-3">
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

      {/* Badge */}
      <div className="mb-2">
        <span
          className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-mono font-bold tracking-wider border"
          style={{
            color: primary,
            backgroundColor: `${primary}15`,
            borderColor: `${primary}30`,
          }}
        >
          [ SUMMARY ]
        </span>
      </div>

      {/* Title */}
      <div className="mb-4">
        <h2 className="font-serif text-2xl font-bold text-slate-950 leading-tight inline">
          <span
            className="inline px-2 py-0.5 rounded-sm"
            style={{
              backgroundColor: accent,
              color: '#0f172a',
              boxDecorationBreak: 'clone',
              WebkitBoxDecorationBreak: 'clone',
            }}
          >
            {title || 'Quick Recap'}
          </span>
        </h2>
      </div>

      {/* Checklist Card */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex-1">
          <div className="flex flex-col gap-3">
            {recapItems.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2.5">
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-white shrink-0 mt-0.5 shadow-xs"
                  style={{ backgroundColor: primary }}
                >
                  <Check className="w-3 h-3 stroke-[3]" />
                </span>
                <span className="text-sm text-slate-700 leading-relaxed font-medium">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Next Up Teaser */}
        {showNextUp && nextUp && (
          <div
            className="mt-3 p-3 rounded-lg border text-center"
            style={{
              backgroundColor: `${accent}15`,
              borderColor: `${accent}40`,
            }}
          >
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              Next Up
            </span>
            <p className="text-xs font-bold text-slate-800 m-0 leading-relaxed">
              👉 {nextUp}
            </p>
          </div>
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
