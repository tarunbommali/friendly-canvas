import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { BookOpen, Palette, ChevronDown } from 'lucide-react'

function SidebarToggleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="9" y1="3" x2="9" y2="21" />
    </svg>
  )
}

export default function TrackSidebar({
  tracks,
  trackPalettes,
  activeTrack,
  activePost,
  onSelectTrack,
  onSelectPost,
  postsByTrack,
  isCollapsed,
  onToggleCollapse,
}) {
  const location = useLocation()
  const isDesignSystemActive =
    location.pathname.includes('carousel-design') ||
    location.pathname === '/system-design' ||
    location.pathname === '/design-system'

  const [expandedTracks, setExpandedTracks] = useState({
    [activeTrack]: true,
  })

  useEffect(() => {
    if (activeTrack) {
      setExpandedTracks((prev) => ({ ...prev, [activeTrack]: true }))
    }
  }, [activeTrack])

  const toggleTrackAccordion = (e, trackName) => {
    e.stopPropagation()
    setExpandedTracks((prev) => ({
      ...prev,
      [trackName]: !prev[trackName],
    }))
  }

  const handleTrackClick = (trackName) => {
    setExpandedTracks((prev) => ({
      ...prev,
      [trackName]: true,
    }))
    onSelectTrack(trackName)
  }

  return (
    <aside
      className={`sticky top-[53px] h-[calc(100vh-53px)] bg-[#151821] border-r border-white/10 flex flex-col transition-all duration-200 z-40 select-none overflow-y-auto ${
        isCollapsed ? 'w-14 overflow-visible' : 'w-72'
      }`}
    >
      {/* Sidebar Header: Project Brand & Toggle */}
      <div className={`flex items-center p-3 border-b border-white/10 min-h-[52px] ${
        isCollapsed ? 'justify-center' : 'justify-between'
      }`}>
        {!isCollapsed && (
          <div className="flex items-center gap-2 font-bold text-sm text-slate-100">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-xs" />
            <span className="font-serif font-extrabold text-white">SWE.notebook</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-white/10 text-cyan-300 border border-white/10">
              Project
            </span>
          </div>
        )}

        <button
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          onClick={onToggleCollapse}
          aria-label={isCollapsed ? 'Open sidebar' : 'Close sidebar'}
          title={isCollapsed ? 'Open sidebar' : 'Close sidebar'}
        >
          <SidebarToggleIcon />
        </button>
      </div>

      {/* Collapsed Rail Navigation */}
      {isCollapsed ? (
        <div className="flex flex-col items-center py-2 gap-2 w-full flex-1">
          {/* Top: Project Configuration */}
          <Link
            to="/swe-notebook/carousel-design"
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all no-underline shadow-sm ${
              isDesignSystemActive
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                : 'bg-white/5 hover:bg-white/15 text-yellow-400 border border-white/10'
            }`}
            title="SWE.notebook Carousel Design & Configuration"
          >
            <Palette className="w-4 h-4" />
          </Link>

          <div className="w-6 h-[1px] bg-white/10 my-1" />

          {/* Bottom: Quick Track Dots */}
          <div className="flex flex-col items-center gap-1.5 w-full flex-1 overflow-y-auto px-1 custom-scrollbar">
            {tracks.map((trackName, index) => {
              const trackNo = index + 1
              const palette = trackPalettes[trackName] || {}
              const isSelected = !isDesignSystemActive && activeTrack === trackName

              return (
                <button
                  key={trackName}
                  className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
                    isSelected
                      ? 'border-white/40 bg-white/10 scale-110 shadow-xs'
                      : 'border-transparent hover:bg-white/10'
                  }`}
                  onClick={() => onSelectTrack(trackName)}
                  title={`Track ${trackNo}: ${trackName.replace(/^Track \d+ — /, '')}`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full transition-transform"
                    style={{ backgroundColor: palette.primary || '#3b82f6' }}
                  />
                </button>
              )
            })}
          </div>
        </div>
      ) : (
        /* Expanded Full View */
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* 🌟 1. TOP: Project Level Configuration */}
          <div className="p-3 border-b border-white/10 bg-[#10131b]/60 flex flex-col gap-2">
            <div className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">
              Project Configuration
            </div>

            <Link
              to="/swe-notebook/carousel-design"
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border no-underline text-xs font-semibold transition-all group cursor-pointer shadow-xs ${
                isDesignSystemActive
                  ? 'bg-cyan-500/15 border-cyan-400/50 text-white font-bold shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                  : 'bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border-white/10'
              }`}
            >
              <Palette className={`w-4 h-4 transition-transform shrink-0 ${isDesignSystemActive ? 'text-cyan-300 rotate-12' : 'text-yellow-400 group-hover:rotate-12'}`} />
              <div className="flex flex-col min-w-0">
                <span className="leading-tight font-bold truncate">Carousel Design</span>
                <span className="text-[10px] text-slate-400 font-mono">Palettes, Backgrounds, Specs</span>
              </div>
            </Link>
          </div>

          {/* 📚 2. BOTTOM: Curriculum Tracks */}
          <div className="p-2 flex flex-col gap-1.5 flex-1">
            <div className="px-2 pt-1 pb-1 flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">
                Tracks
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white/10 text-slate-400 text-[10px] font-mono">
                {tracks.length}
              </span>
            </div>

            <nav className="flex flex-col gap-1.5 pb-6">
              {tracks.map((trackName, index) => {
                const match = trackName.match(/\d+/)
                const trackNo = match ? parseInt(match[0], 10) : index + 1
                const palette = trackPalettes[trackName] || {}
                const trackPosts = postsByTrack[trackName] || []
                const isSelectedTrack = activeTrack === trackName
                const isExpanded = !!expandedTracks[trackName]

                return (
                  <div
                    key={trackName}
                    className={`rounded-xl transition-colors ${
                      isSelectedTrack ? 'bg-white/5' : 'hover:bg-white/2'
                    }`}
                  >
                    {/* Main Track Row */}
                    <div
                      className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all border ${
                        isSelectedTrack
                          ? 'border-l-4 border-l-[var(--track-color)] border-white/10 bg-white/5 text-white'
                          : 'border-transparent text-slate-400 hover:text-slate-200'
                      }`}
                      style={{ '--track-color': palette.primary || '#3b82f6' }}
                      onClick={() => handleTrackClick(trackName)}
                    >
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{
                          background: `linear-gradient(135deg, ${palette.primary || '#3b82f6'}, ${palette.accent || '#93c5fd'})`,
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                          Track {trackNo}
                        </div>
                        <div className="text-xs font-semibold truncate text-slate-200">
                          {trackName.replace(/^Track \d+ — /, '')}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-black/40 text-slate-400 border border-white/5">
                          {trackPosts.length}
                        </span>
                        <button
                          type="button"
                          className="text-slate-500 hover:text-white p-0.5 rounded text-xs transition-transform"
                          style={{
                            transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                          }}
                          onClick={(e) => toggleTrackAccordion(e, trackName)}
                        >
                          ▼
                        </button>
                      </div>
                    </div>

                    {/* Sub-list of Posts */}
                    {isExpanded && (
                      <div className="flex flex-col gap-1 pl-6 pr-2 py-1.5 border-l border-white/10 ml-4 my-1">
                        {trackPosts.map((post, pIdx) => {
                          const postNumberLabel = `${trackNo}.${pIdx + 1}`
                          const isPostActive =
                            activePost &&
                            activePost.Track === post.Track &&
                            (activePost.PostNo === post.PostNo || activePost.PostTitle === post.PostTitle)

                          return (
                            <button
                              key={`${post.Track}-${pIdx}`}
                              className={`flex items-center gap-2 w-full text-left p-1.5 rounded-lg text-xs transition-all border ${
                                isPostActive
                                  ? 'bg-cyan-500/15 border-cyan-400/30 text-white font-semibold'
                                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'
                              }`}
                              onClick={() => onSelectPost(post, trackName)}
                              title={`${postNumberLabel}. ${post.PostTitle}`}
                            >
                              <span className="font-mono text-[10px] font-bold text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded shrink-0">
                                {postNumberLabel}
                              </span>
                              <span className="truncate">{post.PostTitle}</span>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </nav>
          </div>
        </div>
      )}
    </aside>
  )
}
