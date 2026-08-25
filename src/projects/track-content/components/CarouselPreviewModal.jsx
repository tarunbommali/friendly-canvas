import React, { useState, useEffect } from 'react'
import { generateSlideImagePrompt } from '../../../utils/promptGenerators'
import { SlidePreview } from './SlidePreview'
import { PromptDisplay } from './PromptDisplay'

export default function CarouselPreviewModal({
  post,
  trackColor,
  isOpen,
  onClose,
  onCopy,
}) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)

  useEffect(() => {
    setCurrentSlideIndex(0)
  }, [post])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen || !post) return
      if (e.key === 'ArrowRight' || e.key === ' ') {
        setCurrentSlideIndex((prev) =>
          prev < (post.Slides?.length || 1) - 1 ? prev + 1 : prev
        )
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlideIndex((prev) => (prev > 0 ? prev - 1 : 0))
      } else if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, post, onClose])

  if (!isOpen || !post) return null

  const slides = post.Slides || []
  const currentSlide = slides[currentSlideIndex]
  if (!currentSlide) return null

  const primary = trackColor?.primary || '#1E5FA8'
  const accent = trackColor?.accent || '#A9D0F5'
  const slidePrompt = generateSlideImagePrompt(post, currentSlide, trackColor)

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 font-sans"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full bg-[#1a1e2a] border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl max-h-[90vh] font-sans"
        onClick={(e) => e.stopPropagation()}
        style={{
          '--modal-primary': primary,
          '--modal-accent': accent,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/10 bg-white/3">
          <div className="flex flex-col">
            <span className="font-mono text-[10px] font-bold uppercase text-yellow-400">
              {post.Track}
            </span>
            <h2 className="font-serif font-bold text-lg md:text-2xl text-white m-0">
              {post.PostTitle}
            </h2>
          </div>
          <button
            className="text-slate-400 hover:text-white p-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm transition-colors cursor-pointer"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[360px_1fr] flex-1 overflow-y-auto">
          {/* 4:5 Slide Viewport */}
          <div className="p-6 bg-black/40 flex flex-col items-center justify-center gap-4 border-r border-white/10">
            <SlidePreview
              slide={currentSlide}
              post={post}
              trackColor={trackColor}
              isLast={currentSlideIndex === slides.length - 1}
              totalSlides={slides.length}
            />

            {/* Controls */}
            <div className="flex items-center justify-between w-full max-w-[340px] p-2 rounded-xl bg-[#151821] border border-white/10">
              <button
                className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-30 disabled:pointer-events-none text-slate-300 text-xs font-semibold cursor-pointer"
                disabled={currentSlideIndex === 0}
                onClick={() => setCurrentSlideIndex((prev) => prev - 1)}
              >
                ◀ Prev
              </button>

              <div className="flex items-center gap-1">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    className={`h-2 rounded-full transition-all cursor-pointer ${i === currentSlideIndex ? 'w-4 bg-yellow-400' : 'w-2 bg-white/20'
                      }`}
                    onClick={() => setCurrentSlideIndex(i)}
                  />
                ))}
              </div>

              <button
                className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-30 disabled:pointer-events-none text-slate-300 text-xs font-semibold cursor-pointer"
                disabled={currentSlideIndex === slides.length - 1}
                onClick={() => setCurrentSlideIndex((prev) => prev + 1)}
              >
                Next ▶
              </button>
            </div>
          </div>

          {/* Inspector */}
          <div className="p-6 flex flex-col gap-4 overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-serif font-bold text-lg text-white m-0">
                Slide {currentSlide.SlideNo} Prompt
              </h3>
            </div>

            <div className="flex flex-col gap-1">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500">
                LayoutCategory Layout
              </span>
              <span className="text-xs text-cyan-300 font-bold font-mono">{currentSlide.Layout}</span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Slide Title
              </span>
              <span className="font-serif text-lg font-bold text-white">{currentSlide.SlideTitle}</span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Content
              </span>
              <p className="text-xs text-slate-300 m-0 leading-relaxed font-sans">{currentSlide.Content}</p>
            </div>

            <PromptDisplay
              prompt={slidePrompt}
              onCopy={(prompt) =>
                onCopy?.(
                  prompt,
                  `Slide ${currentSlide.SlideNo} Prompt Copied!`,
                  'Ready to paste into DALL·E, Midjourney, or Custom GPT.'
                )
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
}
