import React from 'react'
import {
  Copy,
  Trash2,
  MousePointerClick,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react'

export default function ElementControls({
  element,
  onUpdate,
  onDuplicate,
  onRemove,
  trackColor = { primary: '#1E5FA8', accent: '#A9D0F5' },
}) {
  if (!element) {
    return (
      <div className="flex flex-col items-center justify-center text-center text-slate-500 text-sm py-12 px-4">
        <MousePointerClick className="w-10 h-10 text-cyan-400/70 mb-3" />
        <p className="font-semibold text-slate-300">Select an element</p>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
          Click any text, image, shape, or icon on the canvas to customize properties.
        </p>
      </div>
    )
  }

  const renderSpecificControls = () => {
    switch (element.type) {
      case 'text':
        return (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-slate-400 font-mono">Text Content</label>
              <textarea
                className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white resize-y focus:border-cyan-400 focus:outline-none"
                value={element.content || ''}
                onChange={(e) => onUpdate({ content: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-slate-400 font-mono">Font Family</label>
                <select
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-1.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  value={element.font?.family || 'Georgia'}
                  onChange={(e) => onUpdate({ font: { ...element.font, family: e.target.value } })}
                >
                  <option value="Georgia">Georgia (Editorial Serif)</option>
                  <option value="Inter">Inter (Sans)</option>
                  <option value="monospace">JetBrains / Monospace</option>
                  <option value="Arial">Arial</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-slate-400 font-mono">Font Size (px)</label>
                <input
                  type="number"
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-1.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  value={element.font?.size || 24}
                  onChange={(e) => onUpdate({ font: { ...element.font, size: parseInt(e.target.value, 10) || 12 } })}
                  min={10}
                  max={96}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-slate-400 font-mono">Weight</label>
                <select
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-1.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  value={element.font?.weight || 'bold'}
                  onChange={(e) => onUpdate({ font: { ...element.font, weight: e.target.value } })}
                >
                  <option value="normal">Normal</option>
                  <option value="500">Medium</option>
                  <option value="bold">Bold</option>
                  <option value="800">Black</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-slate-400 font-mono">Alignment</label>
                <select
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-1.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  value={element.align || 'center'}
                  onChange={(e) => onUpdate({ align: e.target.value })}
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-slate-400 font-mono">Text Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    className="w-8 h-8 rounded border border-white/20 bg-transparent cursor-pointer"
                    value={element.font?.color || '#0f172a'}
                    onChange={(e) => onUpdate({ font: { ...element.font, color: e.target.value } })}
                  />
                  <span className="text-[10px] text-slate-400 font-mono">{element.font?.color || '#0f172a'}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-slate-400 font-mono">Highlighter</label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="checkbox"
                    checked={element.highlight || false}
                    onChange={(e) => onUpdate({ highlight: e.target.checked })}
                    className="rounded border-white/20"
                  />
                  <span className="text-xs text-slate-300">Accent Box</span>
                </div>
              </div>
            </div>

            {element.highlight && (
              <div className="flex flex-col gap-1 mt-1">
                <label className="text-[11px] text-slate-400 font-mono">Highlighter Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    className="w-8 h-8 rounded border border-white/20 bg-transparent cursor-pointer"
                    value={element.highlightColor || trackColor.accent}
                    onChange={(e) => onUpdate({ highlightColor: e.target.value })}
                  />
                  <button
                    type="button"
                    className="text-[10px] px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-slate-300"
                    onClick={() => onUpdate({ highlightColor: trackColor.accent })}
                  >
                    Match Accent ({trackColor.accent})
                  </button>
                </div>
              </div>
            )}
          </div>
        )

      case 'image':
        return (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-slate-400 font-mono">Image URL</label>
              <input
                type="url"
                className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                value={element.src || ''}
                onChange={(e) => onUpdate({ src: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-slate-400 font-mono">Object Fit</label>
                <select
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-1.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  value={element.fit || 'cover'}
                  onChange={(e) => onUpdate({ fit: e.target.value })}
                >
                  <option value="cover">Cover</option>
                  <option value="contain">Contain</option>
                  <option value="fill">Fill</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-slate-400 font-mono">Border Radius</label>
                <input
                  type="number"
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-1.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  value={element.borderRadius ?? 12}
                  onChange={(e) => onUpdate({ borderRadius: parseInt(e.target.value, 10) || 0 })}
                  min={0}
                  max={60}
                />
              </div>
            </div>
          </div>
        )

      case 'shape':
        return (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-slate-400 font-mono">Shape Type</label>
                <select
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-1.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  value={element.shape || 'rectangle'}
                  onChange={(e) => onUpdate({ shape: e.target.value })}
                >
                  <option value="rectangle">Rectangle</option>
                  <option value="circle">Circle</option>
                  <option value="triangle">Triangle</option>
                  <option value="star">Star</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-slate-400 font-mono">Fill Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    className="w-8 h-8 rounded border border-white/20 bg-transparent cursor-pointer"
                    value={element.fill || '#3b82f6'}
                    onChange={(e) => onUpdate({ fill: e.target.value })}
                  />
                  <span className="text-[10px] text-slate-400 font-mono">{element.fill || '#3b82f6'}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-slate-400 font-mono">Opacity</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="1"
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-1.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  value={element.opacity ?? 1}
                  onChange={(e) => onUpdate({ opacity: parseFloat(e.target.value) || 1 })}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-slate-400 font-mono">Radius</label>
                <input
                  type="number"
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-1.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  value={element.borderRadius ?? 8}
                  onChange={(e) => onUpdate({ borderRadius: parseInt(e.target.value, 10) || 0 })}
                  min={0}
                  max={50}
                />
              </div>
            </div>
          </div>
        )

      case 'icon':
        return (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-slate-400 font-mono">Icon</label>
              <select
                className="w-full bg-black/40 border border-white/10 rounded-lg p-1.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                value={element.icon || 'lightning'}
                onChange={(e) => onUpdate({ icon: e.target.value })}
              >
                <option value="lightning">Lightning / Fast</option>
                <option value="star">Star / Favorite</option>
                <option value="heart">Heart / Like</option>
                <option value="check">Checkmark / Success</option>
                <option value="cross">Cross / Cancel</option>
                <option value="arrow">Arrow / Next</option>
                <option value="gear">Settings / Config</option>
                <option value="rocket">Rocket / Deploy</option>
                <option value="book">Book / Documentation</option>
                <option value="computer">Computer / Hardware</option>
                <option value="ai">AI / Model</option>
                <option value="database">Database / Storage</option>
                <option value="shield">Security / Guard</option>
                <option value="terminal">Terminal / CLI</option>
                <option value="network">Network / Global</option>
                <option value="sparkles">Sparkles / Magic</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-slate-400 font-mono">Size (px)</label>
                <input
                  type="number"
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-1.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  value={element.size || 48}
                  onChange={(e) => onUpdate({ size: parseInt(e.target.value, 10) || 24 })}
                  min={16}
                  max={128}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-slate-400 font-mono">Icon Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    className="w-8 h-8 rounded border border-white/20 bg-transparent cursor-pointer"
                    value={element.color || '#f59e0b'}
                    onChange={(e) => onUpdate({ color: e.target.value })}
                  />
                  <span className="text-[10px] text-slate-400 font-mono">{element.color || '#f59e0b'}</span>
                </div>
              </div>
            </div>
          </div>
        )

      case 'badge':
        return (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-slate-400 font-mono">Badge Text</label>
              <input
                type="text"
                className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                value={element.content || ''}
                onChange={(e) => onUpdate({ content: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-slate-400 font-mono">Text Color</label>
                <input
                  type="color"
                  className="w-8 h-8 rounded border border-white/20 bg-transparent cursor-pointer"
                  value={element.font?.color || trackColor.primary}
                  onChange={(e) => onUpdate({ font: { ...element.font, color: e.target.value } })}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-slate-400 font-mono">Background</label>
                <input
                  type="color"
                  className="w-8 h-8 rounded border border-white/20 bg-transparent cursor-pointer"
                  value={element.backgroundColor || 'rgba(30, 95, 168, 0.1)'}
                  onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
                />
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="flex flex-col gap-4 font-sans select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
            {element.type}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            #{element.id.slice(0, 6)}
          </span>
        </div>
      </div>

      {/* Specific Element Attributes */}
      {renderSpecificControls()}

      {/* Spatial Dimensions & Coordinates */}
      <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
        <label className="text-[11px] text-slate-400 font-mono">Position & Dimensions</label>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 rounded-md px-2 py-1">
            <span className="text-[10px] font-mono text-slate-500">X</span>
            <input
              type="number"
              className="w-full bg-transparent text-xs text-white outline-none"
              value={Math.round(element.x || 0)}
              onChange={(e) => onUpdate({ x: parseInt(e.target.value, 10) || 0 })}
            />
          </div>
          <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 rounded-md px-2 py-1">
            <span className="text-[10px] font-mono text-slate-500">Y</span>
            <input
              type="number"
              className="w-full bg-transparent text-xs text-white outline-none"
              value={Math.round(element.y || 0)}
              onChange={(e) => onUpdate({ y: parseInt(e.target.value, 10) || 0 })}
            />
          </div>
          <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 rounded-md px-2 py-1">
            <span className="text-[10px] font-mono text-slate-500">W</span>
            <input
              type="number"
              className="w-full bg-transparent text-xs text-white outline-none"
              value={Math.round(element.width || 50)}
              onChange={(e) => onUpdate({ width: Math.max(20, parseInt(e.target.value, 10) || 50) })}
            />
          </div>
          <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 rounded-md px-2 py-1">
            <span className="text-[10px] font-mono text-slate-500">H</span>
            <input
              type="number"
              className="w-full bg-transparent text-xs text-white outline-none"
              value={Math.round(element.height || 30)}
              onChange={(e) => onUpdate({ height: Math.max(20, parseInt(e.target.value, 10) || 30) })}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-3 border-t border-white/10">
        <button
          type="button"
          className="flex-1 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-bold border border-cyan-400/30 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          onClick={onDuplicate}
        >
          <Copy className="w-3.5 h-3.5" /> Duplicate
        </button>
        <button
          type="button"
          className="flex-1 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-bold border border-red-400/30 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          onClick={onRemove}
        >
          <Trash2 className="w-3.5 h-3.5" /> Delete
        </button>
      </div>
    </div>
  )
}
