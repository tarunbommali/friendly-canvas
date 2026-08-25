import React from 'react'

export default function SlideConfig({ config, onUpdate, trackColor = { primary: '#1E5FA8', accent: '#A9D0F5' } }) {
  return (
    <div className="flex flex-col gap-4 font-sans select-none">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
          Slide Configuration
        </h3>
        <p className="text-[11px] text-slate-500">
          Global canvas background, fixed headers, and footers.
        </p>
      </div>

      {/* Canvas Background Settings */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-slate-400 font-mono">Background Style</label>
          <select
            className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
            value={config.backgroundType || 'dots'}
            onChange={(e) => onUpdate({ backgroundType: e.target.value })}
          >
            <option value="dots">Technical Dot Grid (20px)</option>
            <option value="grid">Blueprint Engineering Grid</option>
            <option value="texture">Tactile Warm Paper Texture (#F8F7F4)</option>
            <option value="paper">Fine Paper Grain</option>
            <option value="grain">Cinematic Film Grain</option>
            <option value="gradient">Linear Soft Accent Gradient</option>
            <option value="gradient-radial">Radial Soft Glow</option>
            <option value="blobs">Organic Fluid Gradient Blobs</option>
            <option value="glass">Frosted Glassmorphism</option>
            <option value="solid">Pure Solid Studio Color</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-slate-400 font-mono">Canvas Base Color</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              className="w-10 h-8 rounded border border-white/20 bg-transparent cursor-pointer"
              value={config.background || '#FFFFFF'}
              onChange={(e) => onUpdate({ background: e.target.value })}
            />
            <button
              type="button"
              className="text-[10px] px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-slate-300"
              onClick={() => onUpdate({ background: '#F8F7F4' })}
            >
              Set Editorial Paper (#F8F7F4)
            </button>
            <button
              type="button"
              className="text-[10px] px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-slate-300"
              onClick={() => onUpdate({ background: '#FFFFFF' })}
            >
              Set White (#FFFFFF)
            </button>
          </div>
        </div>
      </div>

      {/* Fixed Chrome: Header Settings */}
      <div className="pt-3 border-t border-white/10 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300">Top Header Bar</label>
          <input
            type="checkbox"
            checked={config.header?.show ?? true}
            onChange={(e) => onUpdate({ header: { ...config.header, show: e.target.checked } })}
            className="rounded border-white/20"
          />
        </div>

        {config.header?.show && (
          <div className="flex flex-col gap-2 bg-black/20 p-2.5 rounded-lg border border-white/5">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-400 font-mono">Header Text</label>
              <input
                type="text"
                className="w-full bg-black/40 border border-white/10 rounded p-1.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                value={config.header?.text || 'TRACK 01'}
                onChange={(e) => onUpdate({ header: { ...config.header, text: e.target.value } })}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-mono">Header Color</span>
              <input
                type="color"
                className="w-7 h-6 rounded border border-white/20 bg-transparent cursor-pointer"
                value={config.header?.font?.color || trackColor.primary}
                onChange={(e) =>
                  onUpdate({
                    header: {
                      ...config.header,
                      font: { ...config.header.font, color: e.target.value },
                    },
                  })
                }
              />
            </div>
          </div>
        )}
      </div>

      {/* Fixed Chrome: Footer Settings */}
      <div className="pt-3 border-t border-white/10 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300">Bottom Footer Bar</label>
          <input
            type="checkbox"
            checked={config.footer?.show ?? true}
            onChange={(e) => onUpdate({ footer: { ...config.footer, show: e.target.checked } })}
            className="rounded border-white/20"
          />
        </div>

        {config.footer?.show && (
          <div className="flex flex-col gap-2 bg-black/20 p-2.5 rounded-lg border border-white/5">
            <label className="flex items-center gap-2 text-xs text-slate-300">
              <input
                type="checkbox"
                checked={config.footer?.showSlideNumber ?? true}
                onChange={(e) =>
                  onUpdate({ footer: { ...config.footer, showSlideNumber: e.target.checked } })
                }
                className="rounded border-white/20"
              />
              Show Slide Counter (e.g. 1 / 7)
            </label>

            <label className="flex items-center gap-2 text-xs text-slate-300">
              <input
                type="checkbox"
                checked={config.footer?.showSwipe ?? true}
                onChange={(e) =>
                  onUpdate({ footer: { ...config.footer, showSwipe: e.target.checked } })
                }
                className="rounded border-white/20"
              />
              Show "Swipe ➔" Cue
            </label>

            <div className="grid grid-cols-2 gap-2 mt-1">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 font-mono">Current Slide #</label>
                <input
                  type="number"
                  className="w-full bg-black/40 border border-white/10 rounded p-1 text-xs text-white"
                  value={config.currentSlideNo || 1}
                  onChange={(e) => onUpdate({ currentSlideNo: parseInt(e.target.value, 10) || 1 })}
                  min={1}
                  max={20}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 font-mono">Total Slides</label>
                <input
                  type="number"
                  className="w-full bg-black/40 border border-white/10 rounded p-1 text-xs text-white"
                  value={config.totalSlides || 7}
                  onChange={(e) => onUpdate({ totalSlides: parseInt(e.target.value, 10) || 7 })}
                  min={1}
                  max={20}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Canvas Dimensions */}
      <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
        <label className="text-[11px] text-slate-400 font-mono">Canvas Dimensions (4:5)</label>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded px-2 py-1">
            <span className="text-[10px] text-slate-500 font-mono">W</span>
            <input
              type="number"
              className="w-full bg-transparent text-xs text-white outline-none"
              value={config.width || 540}
              onChange={(e) => onUpdate({ width: parseInt(e.target.value, 10) || 540 })}
            />
          </div>
          <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded px-2 py-1">
            <span className="text-[10px] text-slate-500 font-mono">H</span>
            <input
              type="number"
              className="w-full bg-transparent text-xs text-white outline-none"
              value={config.height || 675}
              onChange={(e) => onUpdate({ height: parseInt(e.target.value, 10) || 675 })}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
