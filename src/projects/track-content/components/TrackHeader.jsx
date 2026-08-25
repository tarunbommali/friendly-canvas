import React from 'react'

export default function TrackHeader({
  activeTrack,
  trackPalette,
  onCopy,
}) {
  if (!activeTrack) return null

  const primary = trackPalette?.primary || '#1E5FA8'
  const accent = trackPalette?.accent || '#A9D0F5'
  const paletteName = trackPalette?.palette || 'Brand Theme'

  const handleCopyHex = (hex, label) => {
    onCopy?.(hex, `${label} Hex Copied!`, hex)
  }

  return (
    <div
      className="p-6 md:p-8 rounded-2xl bg-linear-to-b from-white/5 to-transparent border border-white/10 shadow-sm mb-6 border-l-4 font-sans select-none"
      style={{ borderLeftColor: primary }}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: primary }}></span>
          <span>{paletteName} Palette</span>
        </div>

        <h1 className="font-serif font-bold text-2xl md:text-4xl text-white tracking-tight leading-tight m-0">
          {activeTrack}
        </h1>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          {/* Color Swatches */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1a1e2a] hover:bg-[#222736] border border-white/10 text-xs font-mono cursor-pointer transition-all hover:scale-105"
              onClick={() => handleCopyHex(primary, 'Primary Color')}
              title="Click to copy primary hex"
            >
              <span className="w-3.5 h-3.5 rounded-sm shrink-0" style={{ backgroundColor: primary }} />
              <span className="text-slate-400">Primary:</span>
              <code className="text-yellow-400 font-bold">{primary}</code>
            </div>

            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1a1e2a] hover:bg-[#222736] border border-white/10 text-xs font-mono cursor-pointer transition-all hover:scale-105"
              onClick={() => handleCopyHex(accent, 'Accent Color')}
              title="Click to copy accent hex"
            >
              <span className="w-3.5 h-3.5 rounded-sm shrink-0" style={{ backgroundColor: accent }} />
              <span className="text-slate-400">Accent:</span>
              <code className="text-cyan-400 font-bold">{accent}</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
