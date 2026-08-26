import React, { useState, useEffect } from 'react'
import { BACKGROUND_TYPE_OPTIONS } from '../../../shared/components/SlideBackground'

const LAYOUT_OPTIONS = [
  { id: 'hook-open', name: 'Hook / Open — Bold Question or Statement' },
  { id: 'concept-explain', name: 'Concept / Explain — Icon + 1-2 Sentences' },
  { id: 'process-flow', name: 'Process / Flow — Step-by-Step Visual' },
  { id: 'comparison', name: 'Comparison — Split-Screen Two Columns' },
  { id: 'recap-close', name: 'Recap / Close — Summary Checklist or CTA' },
]

export function SlideEditor({
  slide,
  globalBg = 'dots',
  hasOverride,
  onSave,
  onCancel,
  onClearOverride,
}) {
  const [fields, setFields] = useState({
    Layout: slide.Layout || slide.layout?.id || (typeof slide.layout === 'string' ? slide.layout : '') || '',
    SlideTitle: slide.SlideTitle || slide.content?.title || slide.title || '',
    Content: slide.Content || slide.content?.body || slide.content?.content || slide.content?.explanation || (typeof slide.content === 'string' ? slide.content : '') || '',
    VisualDirective: slide.VisualDirective || slide.content?.visualDirective || slide.visualDirective || '',
    BackgroundType: slide.hasCustomBg ? (slide.BackgroundType || slide.config?.backgroundType || 'default') : 'default',
  })

  useEffect(() => {
    setFields({
      Layout: slide.Layout || slide.layout?.id || (typeof slide.layout === 'string' ? slide.layout : '') || '',
      SlideTitle: slide.SlideTitle || slide.content?.title || slide.title || '',
      Content: slide.Content || slide.content?.body || slide.content?.content || slide.content?.explanation || (typeof slide.content === 'string' ? slide.content : '') || '',
      VisualDirective: slide.VisualDirective || slide.content?.visualDirective || slide.visualDirective || '',
      BackgroundType: slide.hasCustomBg ? (slide.BackgroundType || slide.config?.backgroundType || 'default') : 'default',
    })
  }, [slide])

  const handleChange = (key, value) => {
    setFields((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl bg-yellow-400/5 border border-yellow-400/20 animate-fade-in font-sans">
      {/* LayoutCategory */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
          LayoutCategory
        </label>
        <div className="flex flex-wrap gap-1.5">
          {LAYOUT_OPTIONS.map((l) => (
            <button
              key={l.value}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${fields.Layout === l.value
                ? 'bg-yellow-400/20 border-yellow-400 text-yellow-300 font-bold'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
                }`}
              onClick={() => handleChange('Layout', l.value)}
              title={`${l.description} (${l.slotCount} slots)`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Background Preset Selector */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            Background Style
          </label>
          <span className="text-[10px] font-mono text-cyan-400">
            System: <strong>{globalBg}</strong>
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${fields.BackgroundType === 'default'
              ? 'bg-cyan-500/25 border-cyan-400 text-white font-bold'
              : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
              }`}
            onClick={() => handleChange('BackgroundType', 'default')}
          >
            🌐 System Default ({globalBg})
          </button>
          {BACKGROUND_TYPE_OPTIONS.map((bg) => (
            <button
              key={bg.value}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${fields.BackgroundType === bg.value
                ? 'bg-yellow-400/20 border-yellow-400 text-yellow-300 font-bold'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
                }`}
              onClick={() => handleChange('BackgroundType', bg.value)}
            >
              {bg.label}
            </button>
          ))}
        </div>
      </div>

      <FieldInput
        label="Slide Title"
        value={fields.SlideTitle}
        onChange={(v) => handleChange('SlideTitle', v)}
        placeholder="Slide title…"
      />

      <FieldTextarea
        label="Content"
        value={fields.Content}
        onChange={(v) => handleChange('Content', v)}
        rows={3}
        placeholder="Slide body text…"
      />

      <FieldTextarea
        label="Visual Directive"
        value={fields.VisualDirective}
        onChange={(v) => handleChange('VisualDirective', v)}
        rows={2}
        placeholder="Visual description for prompt…"
      />

      <div className="flex items-center gap-2 pt-2 border-t border-yellow-400/10 flex-wrap">
        <button
          className="px-3 py-1.5 rounded-lg bg-yellow-400 text-slate-950 font-bold text-xs shadow-md transition-all hover:bg-yellow-300 cursor-pointer"
          onClick={() => onSave(fields)}
        >
          💾 Save Override
        </button>
        <button
          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold cursor-pointer"
          onClick={onCancel}
        >
          ✕ Discard
        </button>
        {hasOverride && (
          <button
            className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold ml-auto cursor-pointer"
            onClick={onClearOverride}
          >
            🗑 Clear Saved
          </button>
        )}
      </div>
    </div>
  )
}

function FieldInput({ label, value, onChange, placeholder }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
        {label}
      </label>
      <input
        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white focus:border-yellow-400 focus:outline-none"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  )
}

function FieldTextarea({ label, value, onChange, rows = 2, placeholder }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
        {label}
      </label>
      <textarea
        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white focus:border-yellow-400 focus:outline-none resize-y"
        rows={rows}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  )
}

export default SlideEditor
