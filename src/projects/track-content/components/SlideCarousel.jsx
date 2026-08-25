import React from 'react'

export function SlideCarousel({
  slides,
  currentIndex,
  onSlideChange,
  children,
  onDownloadAll,
  isDownloadingAll,
  hasOverrides = () => false,
}) {
  const total = slides.length

  const goToSlide = (index) => {
    const clamped = Math.max(0, Math.min(index, total - 1))
    onSlideChange(clamped)
  }

  return (
    <div className="flex flex-col gap-4 select-none font-sans">
      {/* ── Slide Viewport ── */}
      <div className="flex flex-col items-center gap-3">
        <div className="w-full max-w-[340px] drop-shadow-2xl">
          {children}
        </div>

        {/* Prev / Next Pagination Bar */}
        <SlideNavigation
          currentIndex={currentIndex}
          total={total}
          onNavigate={goToSlide}
        />
      </div>

      {/* ── Slide Tabs Storyboard (Moved to Bottom) ── */}
      <div className="flex flex-col gap-2.5 pt-3 border-t border-dashed border-white/10 w-full max-w-[340px] mx-auto">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            Slide Storyboard ({total}):
          </span>

          {onDownloadAll && (
            <button
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                isDownloadingAll
                  ? 'bg-cyan-500/10 border-cyan-400/30 text-cyan-300'
                  : 'bg-white/5 hover:bg-cyan-500/15 border-white/10 hover:border-cyan-400/40 text-slate-300 hover:text-cyan-300'
              }`}
              onClick={onDownloadAll}
              disabled={isDownloadingAll}
              title={isDownloadingAll ? 'Exporting…' : `Download all ${total} slides as PNG`}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>{isDownloadingAll ? 'Exporting…' : `↓ All ${total} PNGs`}</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {slides.map((s, idx) => {
            const isActive = idx === currentIndex
            const isLast = idx === slides.length - 1
            const hasOv = hasOverrides(s.SlideNo)
            return (
              <button
                key={idx}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all relative cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500/15 border-cyan-400/50 text-white font-bold shadow-xs'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-400 hover:text-slate-200'
                } ${isLast ? 'border-l-2 border-l-yellow-400' : ''}`}
                onClick={() => goToSlide(idx)}
                title={`Slide ${s.SlideNo}: ${s.SlideTitle}`}
              >
                <span className="font-mono text-[10px] font-bold text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded">
                  {s.SlideNo}
                </span>
                <span className="max-w-[85px] truncate">{s.SlideTitle}</span>
                {hasOv && isActive && (
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-yellow-400 absolute top-1 right-1"
                    title="Has overrides"
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function SlideNavigation({ currentIndex, total, onNavigate }) {
  return (
    <div className="flex items-center justify-between w-full max-w-[340px] p-2 rounded-xl bg-[#151821] border border-white/10 font-sans">
      <button
        className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-30 disabled:pointer-events-none text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
        disabled={currentIndex === 0}
        onClick={() => onNavigate(currentIndex - 1)}
      >
        ◀ Prev
      </button>

      <div className="flex items-center gap-1">
        {Array.from({ length: total }).map((_, i) => (
          <button
            key={i}
            className={`h-2 rounded-full transition-all cursor-pointer ${
              i === currentIndex ? 'w-4 bg-yellow-400' : 'w-2 bg-white/20 hover:bg-white/40'
            }`}
            onClick={() => onNavigate(i)}
          />
        ))}
      </div>

      <button
        className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-30 disabled:pointer-events-none text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
        disabled={currentIndex === total - 1}
        onClick={() => onNavigate(currentIndex + 1)}
      >
        Next ▶
      </button>
    </div>
  )
}

export default SlideCarousel
