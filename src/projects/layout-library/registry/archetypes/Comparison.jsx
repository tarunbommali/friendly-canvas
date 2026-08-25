import React from 'react'
import { XCircle, CheckCircle2 } from 'lucide-react'

/**
 * Comparison — 50/50 split-screen Layout Archetype
 * Red vs green contrast columns with VS divider.
 */
export default function Comparison({ data = {}, config = {} }) {
  const {
    title,
    leftTitle,
    leftContent,
    rightTitle,
    rightContent,
    content,
    visualDirective,
  } = data

  const {
    split = 50,
    leftColor = '#fef2f2',
    rightColor = '#f0fdf4',
  } = config

  const { primary, accent } = data.trackColor || { primary: '#1E5FA8', accent: '#A9D0F5' }
  const trackNo = String(data.trackNo || '01').padStart(2, '0')

  // Auto-parse content into left/right if explicit props not provided
  const effectiveLeftTitle = (leftTitle || 'Option A').replace(/^[❌\s]+/, '')
  const effectiveRightTitle = (rightTitle || 'Option B').replace(/^[✅\s]+/, '')
  let effectiveLeftContent = leftContent || ''
  let effectiveRightContent = rightContent || ''

  if (!leftContent && !rightContent && content) {
    const parts = content.split(/\bvs\.?\b|\bversus\b|\bcompared to\b/i)
    effectiveLeftContent = parts[0]?.trim() || content
    effectiveRightContent = parts[1]?.trim() || ''
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
        <h2 className="font-serif text-xl font-bold text-slate-950 leading-tight inline">
          <span
            className="inline px-2 py-0.5 rounded-sm"
            style={{ backgroundColor: '#FBD38D', color: '#0f172a' }}
          >
            {title}
          </span>
        </h2>
      </div>

      {/* Comparison Grid */}
      <div className="flex-1 flex gap-3 min-h-0">
        {/* Left Column */}
        <div
          className="flex-1 rounded-xl p-4 flex flex-col border"
          style={{
            backgroundColor: leftColor,
            borderColor: '#fecaca',
          }}
        >
          <div className="flex items-center justify-center gap-1.5 text-base font-bold text-red-700 mb-3">
            <XCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{effectiveLeftTitle}</span>
          </div>
          <div className="flex-1 text-sm text-red-900/80 whitespace-pre-line leading-relaxed">
            {effectiveLeftContent}
          </div>
        </div>

        {/* VS Divider */}
        <div className="flex items-center justify-center px-1">
          <span className="text-xs font-black text-slate-400 bg-white rounded-full w-7 h-7 flex items-center justify-center border border-slate-200 shadow-xs">
            VS
          </span>
        </div>

        {/* Right Column */}
        <div
          className="flex-1 rounded-xl p-4 flex flex-col border"
          style={{
            backgroundColor: rightColor,
            borderColor: '#bbf7d0',
          }}
        >
          <div className="flex items-center justify-center gap-1.5 text-base font-bold text-emerald-700 mb-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{effectiveRightTitle}</span>
          </div>
          <div className="flex-1 text-sm text-emerald-900/80 whitespace-pre-line leading-relaxed">
            {effectiveRightContent}
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
