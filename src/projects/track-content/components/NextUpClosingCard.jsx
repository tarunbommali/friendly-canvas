import React from 'react'

/**
 * Closing "Next Up" card — final slide of every carousel.
 * Sizing: Instagram 4:5 aspect ratio with clean white background.
 */
export default function NextUpClosingCard({
  post,
  slide,
  trackColor,
  isModal = false,
}) {
  const primary = trackColor?.primary || '#1E5FA8'
  const accent = trackColor?.accent || '#A9D0F5'
  const trackNo = String(post?.Track?.match(/\d+/)?.[0] || '1').padStart(2, '0')

  const nextTitle = (slide?.Content || '')
    .replace(/^up next:?\s*/i, '')
    .trim()

  return (
    <div
      className="w-full max-w-[340px] aspect-[4/5] bg-white text-slate-900 rounded-2xl p-6 flex flex-col justify-between shadow-2xl relative border border-slate-200 select-none transition-all mx-auto font-sans"
      style={{
        '--slide-primary': primary,
        '--slide-accent': accent,
      }}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs font-extrabold uppercase tracking-widest text-[var(--slide-primary)]">
          T{trackNo}
        </span>
        <span
          className="flex-1 h-[2px] rounded-full opacity-80 ml-3"
          style={{ backgroundColor: accent }}
        />
      </div>

      {/* Main Content */}
      <div className="flex flex-col gap-3 my-auto w-full">
        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--slide-primary)]">
          Coming up next
        </span>

        <h3 className="font-serif text-2xl font-bold text-slate-950 leading-tight m-0">
          <span
            className="inline-block px-2 py-0.5 rounded-sm text-slate-950 font-bold"
            style={{ backgroundColor: accent }}
          >
            {slide?.SlideTitle || 'Next Up'}
          </span>
        </h3>

        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 shadow-xs text-xs md:text-sm text-slate-700 leading-relaxed font-sans">
          <p className="m-0 font-medium">
            {nextTitle || 'Stay tuned for the next deep dive in this track.'}
          </p>
        </div>

        {/* Brand CTA Badge */}
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-100 border border-slate-200 mt-1">
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold text-slate-900 leading-tight">
              Save this &amp; follow along
            </span>
            <span className="text-[10px] text-slate-500 font-sans">
              Follow for daily visual breakdowns
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs font-mono text-slate-500">
        <span className="font-bold text-slate-600">SWE Notebook</span>
        <span
          className="px-3 py-1 rounded-full text-white font-sans font-bold text-xs shadow-xs"
          style={{ backgroundColor: primary }}
        >
          Follow for more
        </span>
      </div>
    </div>
  )
}