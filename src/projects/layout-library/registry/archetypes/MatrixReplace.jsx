import React from 'react'
import { XCircle, CheckCircle2, ArrowRight } from 'lucide-react'

/**
 * MatrixReplace — 2-column replacement matrix Layout Archetype
 * Side-by-side "Old → New" mapping with arrows and indicator icons.
 */
export default function MatrixReplace({ data = {}, config = {} }) {
  const { title, replacements = [], content, visualDirective } = data
  const { showLogos = true } = config
  const { primary, accent } = data.trackColor || { primary: '#1E5FA8', accent: '#A9D0F5' }
  const trackNo = String(data.trackNo || '01').padStart(2, '0')

  // Parse replacements: accept array of {from, to} or semicolon-separated string
  let matrixItems = []
  if (Array.isArray(replacements) && replacements.length > 0) {
    matrixItems = replacements
  } else if (content) {
    matrixItems = content
      .split(/[;\n]/)
      .filter(Boolean)
      .map((s) => {
        const parts = s.split(/\s*[→➔>]\s*/)
        return {
          from: parts[0]?.trim() || s.trim(),
          to: parts[1]?.trim() || '?',
        }
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

      {/* Badge */}
      <div className="mb-2">
        <span
          className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-mono font-bold tracking-wider border"
          style={{
            color: '#F59E0B',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            borderColor: 'rgba(245, 158, 11, 0.3)',
          }}
        >
          [ REPLACEMENT MATRIX ]
        </span>
      </div>

      {/* Title */}
      <div className="mb-4">
        <h2 className="font-serif text-xl font-bold text-slate-950 leading-tight inline">
          <span
            className="inline px-2 py-0.5 rounded-sm"
            style={{ backgroundColor: accent, color: '#0f172a' }}
          >
            {title}
          </span>
        </h2>
      </div>

      {/* Matrix Grid */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          {/* Header Row */}
          <div className="flex border-b border-slate-200">
            <div
              className="flex-1 p-2 text-center text-[10px] font-mono font-bold uppercase tracking-wider"
              style={{ backgroundColor: '#fef2f2', color: '#991b1b' }}
            >
              Before
            </div>
            <div className="w-8" />
            <div
              className="flex-1 p-2 text-center text-[10px] font-mono font-bold uppercase tracking-wider"
              style={{ backgroundColor: '#f0fdf4', color: '#166534' }}
            >
              After
            </div>
          </div>

          {/* Matrix Rows */}
          {matrixItems.map((item, idx) => (
            <div
              key={idx}
              className={`flex items-center ${idx < matrixItems.length - 1 ? 'border-b border-slate-100' : ''}`}
            >
              <div className="flex-1 p-3 text-xs font-medium text-red-700 bg-red-50/50 flex items-center gap-1.5">
                {showLogos && <XCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />}
                <span>{typeof item === 'string' ? item : item.from}</span>
              </div>
              <div className="w-8 flex items-center justify-center text-slate-400 shrink-0">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 p-3 text-xs font-medium text-green-700 bg-green-50/50 flex items-center gap-1.5">
                {showLogos && <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0" />}
                <span>{typeof item === 'string' ? '?' : item.to}</span>
              </div>
            </div>
          ))}
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
