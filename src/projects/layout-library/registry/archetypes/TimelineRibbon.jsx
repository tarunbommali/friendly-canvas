import React from 'react'

/**
 * TimelineRibbon — Horizontal chronological milestone Layout Archetype
 * Year markers with event labels along a continuous ribbon.
 */
export default function TimelineRibbon({ data = {}, config = {} }) {
  const { title, events = [], content, visualDirective } = data
  const { orientation = 'horizontal', showDates = true } = config
  const { primary, accent } = data.trackColor || { primary: '#1E5FA8', accent: '#A9D0F5' }
  const trackNo = String(data.trackNo || '01').padStart(2, '0')

  // Parse events: accept array of {year, event} or semicolon-separated string
  let eventItems = []
  if (Array.isArray(events) && events.length > 0) {
    eventItems = events
  } else if (content) {
    eventItems = content
      .split(/[;\n]/)
      .filter(Boolean)
      .map((s, i) => {
        const match = s.match(/^(\d{4})\s*[-—:]\s*(.+)/)
        return match
          ? { year: match[1], event: match[2].trim() }
          : { year: `${i + 1}`, event: s.trim() }
      })
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

      {/* Title */}
      <div className="mb-4 text-center">
        <h2 className="font-serif text-2xl font-bold text-slate-950 leading-tight inline">
          <span
            className="inline px-2 py-0.5 rounded-sm"
            style={{ backgroundColor: accent, color: '#0f172a' }}
          >
            {title}
          </span>
        </h2>
      </div>

      {/* Timeline */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="relative px-4">
          {/* Ribbon Line */}
          <div
            className="absolute top-1/2 left-4 right-4 h-[3px] -translate-y-1/2 rounded-full"
            style={{ backgroundColor: `${primary}30` }}
          />

          {/* Event Nodes */}
          <div className="relative flex items-center justify-between gap-2">
            {eventItems.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1 relative z-10">
                {/* Node Dot */}
                <div
                  className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: primary }}
                />

                {/* Year */}
                {showDates && (
                  <span
                    className="font-mono text-[10px] font-bold"
                    style={{ color: primary }}
                  >
                    {item.year}
                  </span>
                )}

                {/* Event Card */}
                <div
                  className="text-center p-2 rounded-lg border max-w-[100px]"
                  style={{
                    backgroundColor: idx === eventItems.length - 1 ? `${accent}30` : '#f8fafc',
                    borderColor: idx === eventItems.length - 1 ? primary : '#e2e8f0',
                  }}
                >
                  <span className="text-[10px] font-medium text-slate-700 leading-tight block">
                    {item.event}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
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
