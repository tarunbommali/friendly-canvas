import React, { useState } from 'react'
import { useOutletContext, Link } from 'react-router-dom'
import {
  Palette,
  Image as ImageIcon,
  Layout,
  Sliders,
  Type,
  Settings,
  ArrowLeft,
  Copy,
  Layers,
} from 'lucide-react'
import SlideBackground, { getBackgroundPreset, BACKGROUND_TYPE_OPTIONS } from '../../../shared/components/SlideBackground'
import { useGlobalBackgroundStyle } from '../hooks/useSlideOverrides'

const LAYOUT_LayoutCategoryS = [
  { value: 'hook-open', label: 'Hook / Open', desc: 'First slide — bold headline, faded background visual. Stops the scroll.' },
  { value: 'concept-explain', label: 'Concept / Explain', desc: 'Icon + body text. Single topic, clean margin, no overload.' },
  { value: 'process-flow', label: 'Process / Flow', desc: 'Numbered steps or arrows. Left-to-right reading pattern.' },
  { value: 'comparison', label: 'Comparison', desc: 'Split-screen or two-column layout. Side-by-side contrast.' },
  { value: 'recap-close', label: 'Recap / Close', desc: 'Checklist or "next up" card. Calls to action — save, follow, swipe.' },
]

const CANVAS_SPEC = {
  'Aspect Ratio': '4:5 (1080 × 1350 px)',
  'Background': 'Pure white (#FFFFFF) + customizable pattern layer',
  'Font — Headline': 'Bold Editorial Serif + fluorescent highlighter',
  'Font — Body': 'Inter / Clean Sans-Serif, pen underlines',
  'Font — Code / Tag': 'JetBrains Mono / Monospace',
  'Card Corners': '16px border-radius',
  'Top-left chrome': 'Track number (T01) — monospace bold',
  'Bottom-left chrome': 'Slide counter (1 / N) — monospace muted',
  'Bottom-right chrome': 'Swipe → — dark bold',
}

export default function DesignSystemPage() {
  const { designSystem = {}, trackPalettes = {}, onCopy } = useOutletContext()
  const { globalBg, setGlobalBg } = useGlobalBackgroundStyle()

  const LayoutCategorys = designSystem.LayoutCategoryLayouts || {}
  const typography = designSystem.Typography || {}

  const [activeTab, setActiveTab] = useState('palettes')

  const handleCopyHex = (hex, label) => {
    onCopy?.(hex, `${label} Copied!`, hex)
  }

  const sampleTrackColor = { primary: '#1E5FA8', accent: '#A9D0F5' }

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8 pb-16 font-sans select-none">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap pb-2 border-b border-white/10">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 shadow-xs" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-400">
              SWE.notebook Project
            </span>
          </div>
          <h1 className="font-serif font-black text-2xl md:text-4xl text-white tracking-tight leading-tight m-0 flex items-center gap-3">
            <Palette className="w-7 h-7 text-cyan-400" /> Carousel Design & Configuration
          </h1>
          <p className="text-xs md:text-sm text-slate-400 max-w-xl leading-relaxed m-0 font-sans">
            SWE.notebook visual language — track color palettes, project background patterns, typography, canvas specs, and storage overrides.
          </p>
        </div>
        <Link
          to="/track/1/post/1"
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-semibold no-underline transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Tracks
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 border-b border-white/10 pb-0 overflow-x-auto">
        {[
          { id: 'palettes', label: 'Track Palettes', icon: Palette },
          { id: 'backgrounds', label: 'Project Backgrounds', icon: ImageIcon },
          { id: 'canvas', label: 'Canvas Spec', icon: Sliders },
          { id: 'typography', label: 'Typography', icon: Type },
          { id: 'config', label: 'Configuration', icon: Settings },
        ].map((t) => {
          const TabIcon = t.icon
          return (
            <button
              key={t.id}
              className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all relative border-t border-x cursor-pointer flex items-center gap-1.5 ${
                activeTab === t.id
                  ? 'bg-[#1a1e2a] border-white/15 text-white border-b-transparent'
                  : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200'
              }`}
              onClick={() => setActiveTab(t.id)}
            >
              <TabIcon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          )
        })}
      </div>

      {/* ── Track Palettes ── */}
      {activeTab === 'palettes' && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <h2 className="font-serif font-bold text-2xl text-white m-0">
              Track Color Palettes
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-400/30 text-purple-300 font-mono text-xs font-bold">
              {Object.keys(trackPalettes).length} tracks
            </span>
          </div>
          <p className="text-xs text-slate-400 m-0">
            Click a swatch to copy the HEX value. Saturation and lightness bands are harmonized across all 21 tracks.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {Object.entries(trackPalettes).map(([trackName, palette], idx) => {
              const trackNum = String(idx + 1).padStart(2, '0')
              return (
                <div
                  key={trackName}
                  className="group rounded-2xl bg-[#1a1e2a] border border-white/10 p-4 flex flex-col justify-between gap-3 shadow-md hover:border-white/20 transition-all"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-[11px] font-mono font-bold">
                      <span className="text-cyan-400">T{trackNum}</span>
                      <span className="text-slate-400 uppercase">{palette.palette || 'Custom'}</span>
                    </div>
                    <div className="font-serif font-bold text-sm text-white line-clamp-1">
                      {trackName.replace(/^Track \d+ — /, '')}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <button
                      className="flex flex-col gap-1 p-2 rounded-xl text-left border border-white/10 hover:border-white/30 transition-all cursor-pointer"
                      style={{ backgroundColor: palette.primary }}
                      onClick={() => handleCopyHex(palette.primary, `Track ${trackNum} Primary`)}
                      title="Click to copy Primary color HEX"
                    >
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/80 drop-shadow-xs">
                        Primary
                      </span>
                      <span className="font-mono text-xs font-bold text-white drop-shadow-xs flex items-center justify-between">
                        {palette.primary}
                        <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </span>
                    </button>

                    <button
                      className="flex flex-col gap-1 p-2 rounded-xl text-left border border-white/10 hover:border-white/30 transition-all cursor-pointer"
                      style={{ backgroundColor: palette.accent }}
                      onClick={() => handleCopyHex(palette.accent, `Track ${trackNum} Accent`)}
                      title="Click to copy Accent color HEX"
                    >
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-900/80">
                        Accent
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-900 flex items-center justify-between">
                        {palette.accent}
                        <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Project Backgrounds Tab ── */}
      {activeTab === 'backgrounds' && (
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h2 className="font-serif font-bold text-2xl text-white m-0">
              Project Default Background Style
            </h2>
            <p className="text-xs text-slate-400 m-0">
              Select the project-level background pattern applied across all SWE.notebook carousels and slides.
            </p>
          </div>

          {/* Background Selector Grid */}
          <div className="p-6 rounded-3xl bg-[#1a1e2a] border border-white/10 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-300">
                Active Project Default: <strong className="text-cyan-400 font-bold ml-1 font-mono uppercase">{globalBg}</strong>
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {BACKGROUND_TYPE_OPTIONS.map((bg) => (
                <button
                  key={bg.value}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${globalBg === bg.value
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md scale-105'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
                    }`}
                  onClick={() => {
                    setGlobalBg(bg.value)
                    onCopy?.('', 'Project Background Updated!', `Default background set to "${bg.label}" across all project posts.`)
                  }}
                >
                  {bg.label}
                </button>
              ))}
            </div>

            {/* Live Preview of Selected Project Background */}
            <div className="mt-4 pt-4 border-t border-white/10 flex flex-col md:flex-row items-center gap-6">
              <div className="w-full max-w-[300px] aspect-[4/5] bg-white text-slate-900 rounded-2xl p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden border border-slate-200 select-none">
                <SlideBackground config={getBackgroundPreset(globalBg, sampleTrackColor)} seed={1} />

                {/* Top header */}
                <div className="relative z-1 flex items-center justify-between">
                  <span className="font-mono text-xs font-extrabold uppercase tracking-wider text-[#1E5FA8]">
                    TRACK 01
                  </span>
                  <span className="flex-1 h-[2px] rounded-full bg-[#A9D0F5] opacity-80 ml-3" />
                </div>

                {/* Main Content */}
                <div className="relative z-1 flex flex-col gap-3 my-auto w-full">
                  <h3 className="font-serif text-2xl font-bold text-slate-950 leading-tight m-0">
                    <span className="inline-block px-2 py-0.5 rounded-sm text-slate-950 font-bold bg-[#A9D0F5]">
                      Project Default Preview
                    </span>
                  </h3>
                  <div className="bg-slate-50/95 border border-slate-200/80 rounded-xl p-3.5 shadow-xs text-xs text-slate-700 leading-relaxed font-sans">
                    <p className="m-0 font-medium">
                      All slides in every SWE.notebook carousel will inherit this {globalBg} background style automatically.
                    </p>
                  </div>
                </div>

                {/* Bottom Bar */}
                <div className="relative z-1 flex items-center justify-between text-xs font-mono text-slate-500">
                  <span className="font-bold text-slate-600">1 / 7</span>
                  <span className="font-bold text-slate-950 font-sans">Swipe ➔</span>
                </div>
              </div>

              <div className="flex-1 flex flex-col gap-3 text-xs text-slate-300">
                <h4 className="font-serif font-bold text-lg text-white m-0">Why this matters:</h4>
                <ul className="list-disc pl-4 space-y-1.5 text-slate-400">
                  <li><strong>Project Consistency:</strong> Changes take effect instantly across all 21 curriculum tracks.</li>
                  <li><strong>Non-Destructive:</strong> Specific slides with per-slide overrides will keep their custom chosen styles.</li>
                  <li><strong>Export Ready:</strong> PNG downloads and clipboard captures render this active background accurately.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Canvas Spec ── */}
      {activeTab === 'canvas' && (
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h2 className="font-serif font-bold text-2xl text-white m-0">Canvas Spec</h2>
            <p className="text-xs text-slate-400 m-0">Fixed aesthetic rules baked into every generation prompt.</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#1a1e2a] border border-white/10 flex flex-col divide-y divide-white/5">
            {Object.entries(CANVAS_SPEC).map(([key, val]) => (
              <div key={key} className="py-3 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-400 font-mono uppercase text-[11px]">{key}</span>
                <span className="font-mono text-slate-200">{val}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="font-serif font-bold text-lg text-white">Card Chrome Preview</h3>
            <div className="w-52 h-64 bg-white rounded-2xl border border-slate-300 p-4 flex flex-col justify-between shadow-xl relative overflow-hidden">
              <SlideBackground config={getBackgroundPreset(globalBg, sampleTrackColor)} seed={1} />
              <div className="relative z-1 flex items-center justify-between text-xs font-mono font-bold text-slate-900">
                <span>T01</span>
                <span className="w-2 h-2 rounded-full bg-slate-300" />
              </div>
              <div className="relative z-1 flex-1 flex items-center justify-center my-2 border border-dashed border-slate-300 rounded-lg text-[11px] text-slate-400 italic bg-white/70">
                Slide content area
              </div>
              <div className="relative z-1 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">1 / 7</span>
                <span className="font-bold text-slate-950 font-sans">Swipe →</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Typography ── */}
      {activeTab === 'typography' && (
        <section className="flex flex-col gap-4">
          <h2 className="font-serif font-bold text-2xl text-white m-0">Typography Hierarchy</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(typography).length > 0 ? (
              Object.entries(typography).map(([key, val]) => (
                <div key={key} className="p-5 rounded-2xl bg-[#1a1e2a] border border-white/10 flex flex-col gap-2">
                  <span className="font-mono text-xs font-bold uppercase text-yellow-400">{key}</span>
                  <p className="text-xs md:text-sm text-slate-300 m-0">{val}</p>
                </div>
              ))
            ) : (
              <div className="p-5 rounded-2xl bg-[#1a1e2a] border border-white/10 flex flex-col gap-2">
                <span className="font-mono text-xs font-bold uppercase text-yellow-400">Headline</span>
                <p className="text-xs md:text-sm text-slate-300 m-0">
                  Bold Editorial Serif + fluorescent yellow highlighter accent
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Configuration ── */}
      {activeTab === 'config' && (
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h2 className="font-serif font-bold text-2xl text-white m-0">Configuration</h2>
            <p className="text-xs text-slate-400 m-0">Global studio settings and browser storage inspector.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Global Default Background Style */}
            <div className="p-6 rounded-2xl bg-[#1a1e2a] border border-white/10 flex flex-col gap-4">
              <h3 className="font-serif font-bold text-lg text-white m-0">🖼 System Background Style</h3>
              <p className="text-xs text-slate-400 m-0">
                Applied across all slides by default:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {BACKGROUND_TYPE_OPTIONS.map((bg) => (
                  <button
                    key={bg.value}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${globalBg === bg.value
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                      : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-400'
                      }`}
                    onClick={() => setGlobalBg(bg.value)}
                  >
                    {bg.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Storage Stats */}
            <div className="p-6 rounded-2xl bg-[#1a1e2a] border border-white/10 flex flex-col gap-4">
              <h3 className="font-serif font-bold text-lg text-white m-0">💾 Persisted Overrides</h3>
              <div className="flex flex-col gap-2 p-3 bg-black/30 rounded-xl font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Slide Overrides:</span>
                  <span className="text-slate-300 font-bold">{Object.keys(JSON.parse(localStorage.getItem('swe-notebook-slide-overrides') || '{}')).length} slides</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Color Overrides:</span>
                  <span className="text-slate-300 font-bold">{Object.keys(JSON.parse(localStorage.getItem('swe-notebook-track-colors') || '{}')).length} tracks</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Custom Assets:</span>
                  <span className="text-slate-300 font-bold">{JSON.parse(localStorage.getItem('swe-notebook-custom-assets') || '[]').length} images</span>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap pt-2">
                <button
                  className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold transition-colors cursor-pointer"
                  onClick={() => {
                    if (confirm('Clear all slide overrides?')) {
                      localStorage.removeItem('swe-notebook-slide-overrides')
                      window.location.reload()
                    }
                  }}
                >
                  🗑 Clear Slide Overrides
                </button>
                <button
                  className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold transition-colors cursor-pointer"
                  onClick={() => {
                    if (confirm('Clear all color overrides?')) {
                      localStorage.removeItem('swe-notebook-track-colors')
                      window.location.reload()
                    }
                  }}
                >
                  🗑 Clear Color Overrides
                </button>
              </div>
            </div>

            {/* Export */}
            <div className="p-6 rounded-2xl bg-[#1a1e2a] border border-white/10 flex flex-col justify-between gap-4 md:col-span-2">
              <div className="flex flex-col gap-2">
                <h3 className="font-serif font-bold text-lg text-white m-0">📤 Export All Data</h3>
                <p className="text-xs text-slate-400 m-0">
                  Export all overrides, global settings, and asset links as a single JSON bundle for backup.
                </p>
              </div>
              <button
                className="px-4 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 text-xs font-bold transition-colors w-fit cursor-pointer flex items-center gap-1.5"
                onClick={() => {
                  const data = {
                    globalBackground: globalBg,
                    slideOverrides: JSON.parse(localStorage.getItem('swe-notebook-slide-overrides') || '{}'),
                    trackColors: JSON.parse(localStorage.getItem('swe-notebook-track-colors') || '{}'),
                    slideAssets: JSON.parse(localStorage.getItem('swe-notebook-slide-assets') || '{}'),
                  }
                  onCopy?.(JSON.stringify(data, null, 2), 'Studio Config Copied!', 'Paste into a .json file to save.')
                }}
              >
                <Copy className="w-3.5 h-3.5" /> Copy All Studio Config
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
