import React, { useState, useRef } from 'react'
import { Edit3, Check, Sparkles, Layout, X } from 'lucide-react'
import { renderSlideToCanvas } from '../../../utils/canvasRenderer'
import { SlideCarousel } from './SlideCarousel'
import { SlidePreview } from './SlidePreview'
import { ImageActionButtons } from './ImageActionButtons'
import { SlideEditor } from './SlideEditor'
import { PromptDisplay } from './PromptDisplay'
import AssetGallery from './AssetGallery'
import { useSlideOverrides, useTrackColorOverride } from '../hooks/useSlideOverrides'
import { generateSlideImagePrompt } from '../../../utils/promptGenerators'
import { getLayoutOptions } from '../../layout-library/registry/LayoutRegistry'

const LAYOUT_OPTIONS = getLayoutOptions()

export default function LiveCarouselStudio({ post, trackColor, onCopy }) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [isDownloadingAll, setIsDownloadingAll] = useState(false)
  const [isDownloadingSlide, setIsDownloadingSlide] = useState(false)
  const [isCopyingSlide, setIsCopyingSlide] = useState(false)
  const [copyImgStatus, setCopyImgStatus] = useState(null)
  const [isEditing, setIsEditing] = useState(false)

  const slideRef = useRef(null)

  const {
    getEffectiveSlide,
    hasOverride,
    setOverride,
    clearOverride,
    globalBg,
  } = useSlideOverrides(post.Track, post.PostNo)

  const { colorOverride } = useTrackColorOverride(post.Track)

  const liveColors = colorOverride || trackColor || post?.track?.palette || {}
  const rawSlides = post.Slides || post.slides || []
  const slides = rawSlides.map((s, idx) => getEffectiveSlide(s, idx))
  const currentSlide = slides[currentSlideIndex] || slides[0] || {}

  const promptText = generateSlideImagePrompt(post, currentSlide, liveColors)

  const isCurrentNextUp =
    currentSlideIndex === slides.length - 1 ||
    currentSlide?.SlideTitle === 'Next Up' ||
    currentSlide?.SlideTitle === 'Series Finale'

  const handleDownloadCurrentSlide = async () => {
    if (isDownloadingSlide) return
    setIsDownloadingSlide(true)
    try {
      const canvas = await renderSlideToCanvas({
        slide: currentSlide,
        post,
        trackColor: liveColors,
        slideNumber: currentSlideIndex + 1,
        totalSlides: slides.length,
        isNextUp: isCurrentNextUp,
      })
      if (!canvas) throw new Error('Canvas render failed')
      const link = document.createElement('a')
      const trackClean = (post.Track || 'track').toLowerCase().replace(/[^a-z0-9]+/g, '-')
      link.download = `${trackClean}-post${post.PostNo}-slide${currentSlide.SlideNo}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      onCopy?.('', `Slide ${currentSlide.SlideNo} Downloaded!`, 'PNG image saved to your downloads.')
    } finally {
      setIsDownloadingSlide(false)
    }
  }

  const handleCopySlideImage = async () => {
    if (isCopyingSlide) return
    setIsCopyingSlide(true)
    setCopyImgStatus(null)

    try {
      const canvas = await renderSlideToCanvas({
        slide: currentSlide,
        post,
        trackColor: liveColors,
        slideNumber: currentSlideIndex + 1,
        totalSlides: slides.length,
        isNextUp: isCurrentNextUp,
      })
      if (!canvas) throw new Error('Canvas render failed')

      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
      if (!blob) throw new Error('Canvas conversion failed')

      if (navigator.clipboard && window.ClipboardItem) {
        try {
          const item = new ClipboardItem({ [blob.type]: blob })
          await navigator.clipboard.write([item])
          setCopyImgStatus('success')
          onCopy?.('', `Slide ${currentSlide.SlideNo} Copied to Clipboard!`, 'Image is ready to paste (Ctrl+V) anywhere.')
          setTimeout(() => setCopyImgStatus(null), 2500)
          return
        } catch (clipErr) {
          console.warn('Clipboard write fallback:', clipErr)
        }
      }

      // Automatic download fallback
      const link = document.createElement('a')
      const trackClean = (post.Track || 'track').toLowerCase().replace(/[^a-z0-9]+/g, '-')
      link.download = `${trackClean}-post${post.PostNo}-slide${currentSlide.SlideNo}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      setCopyImgStatus('success')
      onCopy?.('', `Slide ${currentSlide.SlideNo} Saved as PNG!`, 'Clipboard write was restricted, so image was downloaded.')
      setTimeout(() => setCopyImgStatus(null), 2500)
    } catch (err) {
      console.error('Failed to copy slide image:', err)
      setCopyImgStatus('error')
      onCopy?.('', 'Copy Failed', 'Unable to capture slide. Try the download button instead.')
      setTimeout(() => setCopyImgStatus(null), 3000)
    } finally {
      setIsCopyingSlide(false)
    }
  }

  const handleDownloadAllSlides = async () => {
    if (isDownloadingAll) return
    setIsDownloadingAll(true)
    try {
      for (let i = 0; i < slides.length; i++) {
        const slideItem = slides[i]
        const isNext =
          i === slides.length - 1 ||
          slideItem?.SlideTitle === 'Next Up' ||
          slideItem?.SlideTitle === 'Series Finale'

        const canvas = await renderSlideToCanvas({
          slide: slideItem,
          post,
          trackColor: liveColors,
          slideNumber: i + 1,
          totalSlides: slides.length,
          isNextUp: isNext,
        })
        if (!canvas) continue

        const link = document.createElement('a')
        const trackClean = (post.Track || 'track').toLowerCase().replace(/[^a-z0-9]+/g, '-')
        link.download = `${trackClean}-post${post.PostNo}-slide${i + 1}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()
        await new Promise((r) => setTimeout(r, 100))
      }
      onCopy?.('', 'All Slides Downloaded!', `Downloaded ${slides.length} slides for Post #${post.PostNo}.`)
    } finally {
      setIsDownloadingAll(false)
    }
  }

  const handleSaveSlideEdits = (fields) => {
    setOverride(currentSlide.SlideNo, fields)
    setIsEditing(false)
    onCopy?.('', 'Overrides Saved!', `Custom edits for slide ${currentSlide.SlideNo} saved.`)
  }

  const handleClearSlideOverride = () => {
    clearOverride(currentSlide.SlideNo)
    setIsEditing(false)
    onCopy?.('', 'Overrides Cleared', `Slide ${currentSlide.SlideNo} restored to original spec.`)
  }

  const handleLayoutTypeChange = (newLayout) => {
    setOverride(currentSlide.SlideNo, {
      ...currentSlide,
      Layout: newLayout,
    })
    onCopy?.('', `Switched Layout to ${newLayout}!`, `Slide ${currentSlide.SlideNo} layout updated.`)
  }

  return (
    <div className="flex flex-col gap-6 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start">
        {/* LEFT: Slide Carousel Viewport */}
        <SlideCarousel
          slides={slides}
          currentIndex={currentSlideIndex}
          onSlideChange={(idx) => {
            setCurrentSlideIndex(idx)
            setIsEditing(false)
          }}
          onDownloadAll={handleDownloadAllSlides}
          isDownloadingAll={isDownloadingAll}
          hasOverrides={hasOverride}
        >
          <div ref={slideRef}>
            <SlidePreview
              slide={currentSlide}
              post={post}
              trackColor={liveColors}
              isLast={currentSlideIndex === slides.length - 1}
              totalSlides={slides.length}
            />
          </div>
        </SlideCarousel>

        {/* RIGHT: Inspector & Actions Panel */}
        <div className="flex flex-col gap-4 p-5 rounded-2xl bg-[#151821] border border-white/10 shadow-sm font-sans">
          {/* Header Controls */}
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/10 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-mono font-bold text-slate-300">
                Slide {currentSlide.SlideNo} of {slides.length}
              </span>

              {/* Layout Switcher Selector */}
              <div className="flex items-center gap-1 bg-black/40 border border-white/10 rounded-lg px-2 py-1">
                <Layout className="w-3.5 h-3.5 text-cyan-400" />
                <select
                  className="bg-transparent text-xs font-bold text-cyan-300 uppercase tracking-wider focus:outline-none cursor-pointer"
                  value={currentSlide.Layout || 'concept-explain'}
                  onChange={(e) => handleLayoutTypeChange(e.target.value)}
                  title="Switch Layout Type for this slide"
                >
                  {LAYOUT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-[#1a1e2a] text-white">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {hasOverride(currentSlide.SlideNo) && (
                <span className="px-2 py-0.5 rounded-full bg-yellow-400/10 text-yellow-300 border border-yellow-400/30 text-[10px] font-bold">
                  ✏️ Edited
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <ImageActionButtons
                onDownload={handleDownloadCurrentSlide}
                onCopy={handleCopySlideImage}
                isDownloading={isDownloadingSlide}
                isCopying={isCopyingSlide}
                status={copyImgStatus}
              />

              {/* Edit Content Toggle */}
              <button
                type="button"
                className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
                  isEditing
                    ? 'bg-yellow-400 text-slate-950 border-yellow-400'
                    : 'border-cyan-400/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300'
                }`}
                onClick={() => setIsEditing(!isEditing)}
                title="Toggle inline slide content and layout editor"
              >
                {isEditing ? (
                  <>
                    <X className="w-3.5 h-3.5" /> Close Editor
                  </>
                ) : (
                  <>
                    <Edit3 className="w-3.5 h-3.5" /> Edit Content
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Inline Slide Content Editor (when active) */}
          {isEditing && (
            <SlideEditor
              slide={currentSlide}
              globalBg={globalBg}
              hasOverride={hasOverride(currentSlide.SlideNo)}
              onSave={handleSaveSlideEdits}
              onCancel={() => setIsEditing(false)}
              onClearOverride={handleClearSlideOverride}
            />
          )}

          {/* AI Prompt Generator Display */}
          <PromptDisplay
            prompt={promptText}
            onCopy={(prompt) =>
              onCopy?.(
                prompt,
                `Slide ${currentSlide.SlideNo} Prompt Copied!`,
                'Ready to paste into DALL·E, Midjourney, or Custom GPT.'
              )
            }
          />

          {/* Reference Asset Gallery */}
          <AssetGallery post={post} slide={currentSlide} trackColor={liveColors} />
        </div>
      </div>
    </div>
  )
}
