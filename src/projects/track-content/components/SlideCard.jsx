import React, { useState } from 'react'
import { generateSlideImagePrompt } from '../../../shared/utils/promptGenerators'
import { SlidePreview } from './SlideRenderer'
import { PromptDisplay } from './PromptDisplay'

export default function SlideCard({
  slide,
  post,
  trackColor,
  onCopy,
}) {
  const [showPrompt, setShowPrompt] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const slidePrompt = generateSlideImagePrompt(post, slide, trackColor)
  const isLast = (post.Slides && post.Slides[post.Slides.length - 1]?.SlideNo === slide.SlideNo)

  const handleCopySlidePrompt = () => {
    onCopy(
      slidePrompt,
      `Slide ${slide.SlideNo} Prompt Copied!`,
      `Ready to paste into DALL·E, Midjourney, or Custom GPT.`
    )
  }

  return (
    <div className="p-5 rounded-2xl bg-[#1a1e2a] border border-white/10 flex flex-col gap-4 font-sans select-none">
      {/* Card Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-yellow-400">
            Slide {slide.SlideNo}
          </span>
          <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full border bg-cyan-500/10 text-cyan-300 border-cyan-400/20">
            {slide.Layout || 'General'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              showPreview
                ? 'bg-cyan-500/20 border-cyan-400/40 text-cyan-300'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
            }`}
            onClick={() => setShowPreview(!showPreview)}
            title="Toggle card layout preview"
          >
            {showPreview ? 'Hide preview' : 'Visual preview'}
          </button>

          <button
            className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              showPrompt
                ? 'bg-yellow-400/20 border-yellow-400/40 text-yellow-300'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
            }`}
            onClick={() => setShowPrompt(!showPrompt)}
            title="Inspect generated image prompt"
          >
            {showPrompt ? 'Hide prompt' : 'View prompt'}
          </button>

          <button
            className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
            onClick={handleCopySlidePrompt}
            title="Copy prompt for this slide"
          >
            Copy prompt
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h4 className="font-serif font-bold text-lg text-white m-0">
          {slide.SlideTitle}
        </h4>

        <div className="p-3.5 rounded-xl bg-black/30 border border-white/5 flex flex-col gap-1">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Content
          </span>
          <p className="text-xs text-slate-300 m-0 leading-relaxed font-sans">
            {slide.Content}
          </p>
        </div>

        {slide.VisualDirective && (
          <div className="p-3.5 rounded-xl bg-black/30 border border-white/5 flex flex-col gap-1">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Visual directive
            </span>
            <p className="text-xs text-slate-400 m-0 leading-relaxed font-sans">
              {slide.VisualDirective}
            </p>
          </div>
        )}

        {/* Visual Preview */}
        {showPreview && (
          <div className="pt-2 flex justify-center">
            <SlidePreview
              slide={slide}
              post={post}
              trackColor={trackColor}
              isLast={isLast}
              totalSlides={post.Slides?.length}
            />
          </div>
        )}

        {/* Prompt View */}
        {showPrompt && (
          <PromptDisplay
            prompt={slidePrompt}
            onCopy={handleCopySlidePrompt}
          />
        )}
      </div>
    </div>
  )
}