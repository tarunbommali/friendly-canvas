import React from 'react'

/**
 * ConceptExplain — Slide 2/3/4 Layout Archetype
 * Split container with technical diagram zone and structured insight card.
 */
export default function ConceptExplain({ data = {}, config = {} }) {
  const { title, content, visualDirective, insight } = data
  const {
    showDiagram = true,
    diagramPosition = 'left',
    insightCard = true,
  } = config
  const { primary, accent } = data.trackColor || { primary: '#1E5FA8', accent: '#A9D0F5' }
  const trackNo = String(data.trackNo || '01').padStart(2, '0')

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

      {/* Title with highlighter */}
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
            {title}
          </span>
        </h2>
      </div>

      {/* Diagram + Content Split */}
      <div className="flex-1 flex flex-col gap-3">
        {/* Technical Diagram Zone */}
        {showDiagram && (
          <div
            className="rounded-xl p-4 flex flex-col items-center justify-center min-h-[120px]"
            style={{
              backgroundColor: '#FFFFFF',
              border: `1.5px solid ${primary}`,
            }}
          >
            <div
              className="text-3xl mb-2 opacity-60"
              style={{ color: primary }}
            >
              💻
            </div>
            {visualDirective && (
              <p
                className="text-xs font-mono font-bold text-center m-0"
                style={{ color: primary }}
              >
                {visualDirective}
              </p>
            )}
          </div>
        )}

        {/* Content Card */}
        {content && (
          <div className="bg-slate-50/95 border border-slate-200/80 rounded-xl p-4">
            <p className="text-sm text-slate-700 leading-relaxed font-sans m-0">
              {content}
            </p>
          </div>
        )}

        {/* Insight Card */}
        {insightCard && insight && (
          <div
            className="rounded-lg p-3 border"
            style={{
              backgroundColor: `${accent}15`,
              borderColor: `${accent}40`,
            }}
          >
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Key Insight
            </span>
            <p className="text-xs text-slate-700 m-0 leading-relaxed font-semibold">
              💡 {insight}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
