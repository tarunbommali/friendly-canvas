import React, { useRef } from 'react'
import {
  Heading,
  AlignLeft,
  Image as ImageIcon,
  Square,
  Sparkles,
  Tag,
  Award,
} from 'lucide-react'

export default function ElementToolbar({ onAddElement, trackColor = { primary: '#1E5FA8', accent: '#A9D0F5' } }) {
  const fileInputRef = useRef(null)

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        onAddElement('image', {
          src: event.target?.result,
          width: 320,
          height: 200,
          x: 110,
          y: 160,
        })
      }
      reader.readAsDataURL(file)
    }
    e.target.value = ''
  }

  return (
    <div className="flex flex-col gap-4 font-sans select-none">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
          Add Elements
        </h3>
        <p className="text-[11px] text-slate-500">
          Click an element to place it onto the canvas.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {/* Big Heading */}
        <button
          type="button"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold transition-all border border-white/5 hover:border-cyan-400/40 text-left group cursor-pointer"
          onClick={() =>
            onAddElement('text', {
              content: 'Major Heading Title',
              x: 40,
              y: 120,
              width: 460,
              height: 60,
              font: { family: 'Georgia', size: 36, weight: 'bold', color: '#0f172a' },
              align: 'center',
              highlight: true,
              highlightColor: trackColor.accent,
            })
          }
        >
          <span className="p-2 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-400/20">
            <Heading className="w-4 h-4" />
          </span>
          <div className="flex flex-col">
            <span className="group-hover:text-cyan-300">Big Headline</span>
            <span className="text-[10px] text-slate-400 font-normal">Bold editorial title with highlight</span>
          </div>
        </button>

        {/* Subtitle / Body text */}
        <button
          type="button"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold transition-all border border-white/5 hover:border-cyan-400/40 text-left group cursor-pointer"
          onClick={() =>
            onAddElement('text', {
              content: 'Crisp takeaway explanation sentence showing the core concept.',
              x: 50,
              y: 200,
              width: 440,
              height: 60,
              font: { family: 'Inter', size: 18, weight: 'normal', color: '#475569' },
              align: 'center',
              highlight: false,
            })
          }
        >
          <span className="p-2 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-400/20">
            <AlignLeft className="w-4 h-4" />
          </span>
          <div className="flex flex-col">
            <span className="group-hover:text-purple-300">Explanation Text</span>
            <span className="text-[10px] text-slate-400 font-normal">Clean modern Inter body text</span>
          </div>
        </button>

        {/* Image Upload */}
        <button
          type="button"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold transition-all border border-white/5 hover:border-cyan-400/40 text-left group cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-400/20">
            <ImageIcon className="w-4 h-4" />
          </span>
          <div className="flex flex-col">
            <span className="group-hover:text-emerald-300">Upload Image</span>
            <span className="text-[10px] text-slate-400 font-normal">PNG, JPG or WebP</span>
          </div>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />

        {/* Card Container Box */}
        <button
          type="button"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold transition-all border border-white/5 hover:border-cyan-400/40 text-left group cursor-pointer"
          onClick={() =>
            onAddElement('shape', {
              shape: 'rectangle',
              fill: '#FFFFFF',
              stroke: `1.5px solid ${trackColor.primary}`,
              x: 40,
              y: 280,
              width: 460,
              height: 180,
              borderRadius: 16,
              opacity: 0.95,
            })
          }
        >
          <span className="p-2 rounded-lg bg-blue-500/10 text-blue-300 border border-blue-400/20">
            <Square className="w-4 h-4" />
          </span>
          <div className="flex flex-col">
            <span className="group-hover:text-blue-300">Container Card</span>
            <span className="text-[10px] text-slate-400 font-normal">Frosted content box with border</span>
          </div>
        </button>

        {/* Icon */}
        <button
          type="button"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold transition-all border border-white/5 hover:border-cyan-400/40 text-left group cursor-pointer"
          onClick={() =>
            onAddElement('icon', {
              icon: 'lightning',
              size: 56,
              color: '#f59e0b',
              x: 242,
              y: 80,
              width: 56,
              height: 56, LayoutCategory
            })
          }
        >
          <span className="p-2 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-400/20">
            <Sparkles className="w-4 h-4" />
          </span>
          <div className="flex flex-col">
            <span className="group-hover:text-amber-300">Technical Icon</span>
            <span className="text-[10px] text-slate-400 font-normal">CPU, AI, lightning, star, etc.</span>
          </div>
        </button>

        {/* Monospace Badge Tag */}
        <button
          type="button"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold transition-all border border-white/5 hover:border-cyan-400/40 text-left group cursor-pointer"
          onClick={() =>
            onAddElement('badge', {
              content: '[ ARCHETYPE: EXPLAIN ]',
              x: 180,
              y: 70,
              width: 180,
              height: 30,
              font: { family: 'monospace', size: 11, weight: 'bold', color: trackColor.primary },
              backgroundColor: 'rgba(30, 95, 168, 0.08)',
              borderColor: trackColor.accent,
            })
          }
        >
          <span className="p-2 rounded-lg bg-teal-500/10 text-teal-300 border border-teal-400/20">
            <Tag className="w-4 h-4" />
          </span>
          <div className="flex flex-col">
            <span className="group-hover:text-teal-300">Pill Tag Badge</span>
            <span className="text-[10px] text-slate-400 font-normal">Monospace category badge</span>
          </div>
        </button>

        {/* SWE Logo Seal */}
        <button
          type="button"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold transition-all border border-white/5 hover:border-cyan-400/40 text-left group cursor-pointer"
          onClick={() =>
            onAddElement('logo', {
              x: 235,
              y: 100,
              width: 70,
              height: 70,
            })
          }
        >
          <span className="p-2 rounded-lg bg-rose-500/10 text-rose-300 border border-rose-400/20">
            <Award className="w-4 h-4" />
          </span>
          <div className="flex flex-col">
            <span className="group-hover:text-rose-300">Brand Seal Badge</span>
            <span className="text-[10px] text-slate-400 font-normal">SWE Notebook official emblem</span>
          </div>
        </button>
      </div>

      <div className="pt-3 border-t border-white/10">
        <h4 className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2">
          Canvas Shortcuts
        </h4>
        <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-400 font-mono">
          <span className="bg-black/30 px-1.5 py-0.5 rounded">Double Click</span>
          <span>Edit text inline</span>
          <span className="bg-black/30 px-1.5 py-0.5 rounded">Click + Drag</span>
          <span>Move anywhere</span>
          <span className="bg-black/30 px-1.5 py-0.5 rounded">Del / Backspace</span>
          <span>Delete item</span>
        </div>
      </div>
    </div>
  )
}
