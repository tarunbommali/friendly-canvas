import React from 'react'

/**
 * ProcessFlow — 3-stage directional workflow Layout Archetype
 * Numbered badge pills with connecting arrows in horizontal or vertical orientation.
 */
export default function ProcessFlow({ data = {}, config = {} }) {
  const { title, steps = [], content, visualDirective } = data
  const { showArrows = true, orientation = 'horizontal' } = config
  const { primary, accent } = data.trackColor || { primary: '#1E5FA8', accent: '#A9D0F5' }
  const trackNo = String(data.trackNo || '01').padStart(2, '0')

  // Parse steps: accept array of strings or semicolon/newline-separated string
  const rawStepSource = steps?.length ? steps : (content ? content.split(/[;\n]/).filter(Boolean).map((s) => s.trim()) : [])
  const stepItems = Array.isArray(rawStepSource)
    ? rawStepSource
    : (typeof rawStepSource === 'string' ? rawStepSource.split(/[;\n]/).filter(Boolean).map((s) => s.trim()) : [])

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

      {/* Title */}
      <div className="mb-4 text-center">
        <h2 className="font-serif text-2xl font-bold text-slate-950 leading-tight inline">
          <span
            className="inline px-2 py-0.5 rounded-sm"
            style={{ backgroundColor: '#B6E6CE', color: '#0f172a' }}
          >
            {title}
          </span>
        </h2>
      </div>

      {/* Process Flow Steps */}
      <div className="flex-1 flex flex-col justify-center">
        <div
          className={`flex ${orientation === 'horizontal' ? 'flex-row' : 'flex-col'} items-center gap-2 justify-center`}
        >
          {stepItems.map((step, index) => (
            <React.Fragment key={index}>
              {/* Step Card */}
              <div
                className="flex-1 min-w-0 p-3 rounded-xl text-center"
                style={{
                  backgroundColor: index === 1 ? `${accent}30` : '#f1f5f9',
                  border: `2px solid ${index === 1 ? primary : '#e2e8f0'}`,
                  maxWidth: orientation === 'horizontal' ? '160px' : undefined,
                }}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white mx-auto mb-2"
                  style={{ backgroundColor: primary }}
                >
                  {index + 1}
                </div>
                <div className="text-xs font-semibold text-slate-700 leading-snug">
                  {step}
                </div>
              </div>

              {/* Arrow */}
              {showArrows && index < stepItems.length - 1 && (
                <div className="text-slate-400 text-lg shrink-0 font-bold">
                  {orientation === 'horizontal' ? '→' : '↓'}
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Additional Content */}
        {content && (
          <div className="mt-4 text-center text-sm text-slate-600 bg-slate-50/95 p-3 rounded-xl border border-slate-200">
            <p className="m-0 leading-relaxed">{content}</p>
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
