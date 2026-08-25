import React, { useState, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ChevronRight,
  ChevronDown,
  FileText,
  Layers,
  Music,
  Image as ImageIcon,
  Palette,
  Edit3,
  Search,
  Plus,
  ArrowRight,
  Check,
  Copy,
} from 'lucide-react'
import { useProjectData } from '../hooks/useProjectData'
import { useTrackData } from '../../../shared/hooks/useTrackData'
import CategoryIcon from '../../../shared/components/CategoryIcon'

export default function ContentManagementPage() {
  const { projectSlug = 'swe-notebook', trackId = '1', postId = '1' } = useParams()
  const navigate = useNavigate()

  const { project, tracks, updateSlideContent } = useProjectData(projectSlug)
  const { trackPalettes } = useTrackData()

  const [expandedTracks, setExpandedTracks] = useState(() => new Set([trackId || '1']))
  const [activeTab, setActiveTab] = useState('content') // 'content' | 'storyboard' | 'assets' | 'music'
  const [search, setSearch] = useState('')
  const [toastMsg, setToastMsg] = useState('')

  const showToast = (msg) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 2500)
  }

  const activeTrack = tracks?.find((t) => t.id === String(trackId)) || tracks?.[0]
  const activePost = activeTrack?.posts?.find((p) => p.id === String(postId)) || activeTrack?.posts?.[0]

  const filteredTracks = useMemo(() => {
    if (!search) return tracks
    const q = search.toLowerCase()
    return tracks
      ?.map((t) => ({
        ...t,
        posts: t.posts.filter((p) => p.title.toLowerCase().includes(q)),
      }))
      .filter((t) => t.title.toLowerCase().includes(q) || t.posts.length > 0)
  }, [tracks, search])

  const toggleTrack = (id) => {
    setExpandedTracks((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const goToPost = (tId, pId) => {
    navigate(`/${projectSlug}/content/track/${tId}/post/${pId}`)
  }

  return (
    <div className="flex h-[calc(100vh-53px)] w-full bg-[#0b0d13] text-slate-100 font-sans overflow-hidden select-none">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs shadow-2xl flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4" /> {toastMsg}
        </div>
      )}

      {/* ── LEFT: Track > Post > Slide Hierarchy ── */}
      <aside className="w-80 bg-[#141721] border-r border-white/10 flex flex-col shrink-0">
        <div className="p-3 border-b border-white/10 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-xs font-serif font-bold text-slate-400 hover:text-cyan-300 no-underline transition-colors flex items-center gap-1">
              ← {project?.title || 'Workspace'}
            </Link>
            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-400/20">
              Content Manager
            </span>
          </div>

          <div className="relative mt-1">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input
              className="w-full bg-black/40 border border-white/10 rounded-lg pl-8 pr-2 py-1.5 text-xs text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none transition-colors"
              placeholder="Search tracks, posts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
          {filteredTracks?.map((track) => {
            const isExpanded = expandedTracks.has(track.id)
            const isCurrentTrack = track.id === String(trackId)

            return (
              <div key={track.id} className="border-b border-white/5 last:border-b-0">
                <button
                  type="button"
                  className={`w-full flex items-center gap-2 px-3 py-2.5 hover:bg-white/5 text-left rounded-lg transition-colors cursor-pointer ${isCurrentTrack ? 'bg-white/[0.03]' : ''
                    }`}
                  onClick={() => toggleTrack(track.id)}
                >
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  )}
                  <span
                    className="w-2 h-2 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: track.palette?.primary || '#1E5FA8' }}
                  />
                  <span className="text-xs font-bold text-slate-200 truncate flex-1">
                    {track.title}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono font-bold bg-white/5 px-1.5 py-0.5 rounded">
                    {track.posts.length}
                  </span>
                </button>

                {isExpanded && (
                  <div className="pl-6 pr-2 pb-1 space-y-0.5">
                    {track.posts.map((post) => {
                      const isSelected = isCurrentTrack && post.id === String(postId)
                      return (
                        <button
                          key={post.id}
                          type="button"
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-2 transition-all cursor-pointer ${isSelected
                              ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-400/30'
                              : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                            }`}
                          onClick={() => goToPost(track.id, post.id)}
                        >
                          <FileText className="w-3 h-3 shrink-0" />
                          <span className="truncate flex-1">{post.title}</span>
                          <span className="text-[9px] text-slate-500 font-mono">
                            {post.slides.length}s
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </aside>

      {/* ── CENTER: Content Management Tabs & Editors ── */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#0e1017]">
        {activePost ? (
          <>
            {/* Header with Title and 'Edit Slides' Studio Button */}
            <header className="h-16 border-b border-white/10 px-6 flex items-center justify-between shrink-0 bg-[#141721]">
              <div className="flex flex-col gap-0.5">
                <div className="text-[10px] text-cyan-400 font-mono uppercase font-bold tracking-wider">
                  {activeTrack.title} · Post {activePost.postNo}
                </div>
                <div className="text-base font-serif font-black text-white tracking-tight">
                  {activePost.title}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold font-mono flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
                  onClick={() => navigate(`/${projectSlug}/design/track/${activeTrack.id}/post/${activePost.id}`)}
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" /> Create Design
                </button>
              </div>
            </header>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 px-6 pt-3 border-b border-white/10 bg-[#12141d]">
              {[
                { key: 'content', label: 'Slide Content & Copy', icon: FileText },
                { key: 'storyboard', label: 'Storyboard Preview', icon: Layers },
                { key: 'assets', label: 'Reference Assets', icon: ImageIcon },
                { key: 'music', label: 'Suggested Audio', icon: Music },
              ].map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.key
                return (
                  <button
                    key={tab.key}
                    type="button"
                    className={`px-4 py-2 text-xs font-bold font-mono flex items-center gap-2 border-b-2 transition-all cursor-pointer ${isActive
                        ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10 rounded-t-lg'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                      }`}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    <Icon className="w-3.5 h-3.5" /> {tab.label}
                  </button>
                )
              })}
            </div>

            {/* Tab Body */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {activeTab === 'content' && (
                <SlideContentList
                  post={activePost}
                  onUpdateSlide={(slideId, updates) => {
                    updateSlideContent(activePost.id, slideId, updates)
                    showToast('Slide content updated & saved!')
                  }}
                />
              )}
              {activeTab === 'storyboard' && (
                <StoryboardView
                  post={activePost}
                  onOpenEditor={() => navigate(`/${projectSlug}/design/track/${activeTrack.id}/post/${activePost.id}`)}
                />
              )}
              {activeTab === 'assets' && <AssetsPanel post={activePost} />}
              {activeTab === 'music' && <MusicReferencePanel post={activePost} />}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-sm gap-2">
            <FileText className="w-8 h-8 text-slate-600" />
            <span>Select a post from the sidebar to inspect and manage its content.</span>
          </div>
        )}
      </main>

      {/* ── RIGHT: Project Configuration / Design System Specs ── */}
      <aside className="w-80 bg-[#141721] border-l border-white/10 flex flex-col shrink-0 overflow-y-auto custom-scrollbar p-5 gap-5">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase font-mono border-b border-white/10 pb-3">
          <Palette className="w-4 h-4 text-cyan-400" /> Project Configuration
        </div>
        <ProjectConfigPanel project={project} activeTrack={activeTrack} />
      </aside>
    </div>
  )
}

// ── SUB-PANELS ──

function SlideContentList({ post, onUpdateSlide }) {
  return (
    <div className="flex flex-col gap-4 max-w-3xl">
      <div className="flex items-center justify-between text-xs text-slate-400 font-mono pb-2 border-b border-white/10">
        <span>Managing {post.slides.length} Slides</span>
        <span className="text-cyan-400">Live Auto-Saved to Workspace</span>
      </div>

      {post.slides.map((slide, idx) => (
        <div key={slide.id} className="p-5 rounded-2xl bg-black/40 border border-white/10 flex flex-col gap-3 shadow-md hover:border-cyan-500/30 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-300 font-mono font-bold text-xs flex items-center justify-center border border-cyan-400/30">
                {idx + 1}
              </span>
              <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                Slide {idx + 1}
              </span>
            </div>

            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/5 text-slate-300 border border-white/10">
              {slide.archetypeKey}
            </span>
          </div>

          {/* Title Input */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono uppercase font-bold text-slate-400">
              Slide Headline
            </label>
            <input
              className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm font-bold font-serif text-white focus:border-cyan-400 focus:outline-none transition-colors"
              value={slide.content?.title || ''}
              placeholder="Headline title..."
              onChange={(e) => onUpdateSlide(slide.id, { title: e.target.value })}
            />
          </div>

          {/* Body Copy Input */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono uppercase font-bold text-slate-400">
              Body Copy / Concept Explanation
            </label>
            <textarea
              className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 resize-y focus:border-cyan-400 focus:outline-none transition-colors font-sans leading-relaxed"
              rows={3}
              value={slide.content?.body || ''}
              placeholder="Detailed content for this slide..."
              onChange={(e) => onUpdateSlide(slide.id, { body: e.target.value })}
            />
          </div>

          {/* Visual Directive Input */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono uppercase font-bold text-slate-400">
              Visual Directive / Illustration Prompt
            </label>
            <textarea
              className="w-full bg-black/30 border border-dashed border-white/15 rounded-xl px-3 py-2 text-[11px] text-yellow-200/90 font-mono italic resize-y focus:border-cyan-400 focus:outline-none transition-colors"
              rows={2}
              value={slide.content?.visualDirective || ''}
              placeholder="Art direction for background and diagrams..."
              onChange={(e) => onUpdateSlide(slide.id, { visualDirective: e.target.value })}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function StoryboardView({ post, onOpenEditor }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400 font-mono">
          Visual Slide Flow ({post.slides.length} Slides in sequence)
        </span>
        <button
          type="button"
          className="text-xs font-mono font-bold text-cyan-300 hover:underline cursor-pointer flex items-center gap-1"
          onClick={onOpenEditor}
        >
          Create Design in Canvas Studio <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {post.slides.map((slide, idx) => (
          <div
            key={slide.id}
            className="group relative aspect-[4/5] rounded-2xl bg-black/40 border border-white/10 hover:border-cyan-400/50 p-3.5 flex flex-col justify-between transition-all cursor-pointer shadow-lg hover:shadow-cyan-500/10"
            onClick={onOpenEditor}
          >
            <div className="flex items-center justify-between">
              <span className="w-5 h-5 rounded-md bg-white/10 text-white font-mono font-bold text-[10px] flex items-center justify-center">
                {idx + 1}
              </span>
              <div className="w-6 h-6 rounded-lg bg-cyan-500/10 text-cyan-300 flex items-center justify-center">
                <CategoryIcon name={slide.archetypeKey} className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-serif font-bold text-white line-clamp-3 leading-snug">
                {slide.content?.title || `Slide ${idx + 1}`}
              </span>
              <span className="text-[9px] font-mono uppercase text-slate-400">
                {slide.archetypeKey}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AssetsPanel({ post }) {
  const assets = post.slides.flatMap((s) => s.assets?.matched || [])
  const uniqueAssets = Array.from(new Set(assets))

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <div className="text-xs font-mono text-slate-400">
        Matched Reference Assets ({uniqueAssets.length})
      </div>

      {uniqueAssets.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {uniqueAssets.map((asset, i) => (
            <div key={i} className="p-3 rounded-xl bg-black/30 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-semibold text-slate-200">{asset}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-xs text-slate-500 p-4 rounded-xl bg-black/20 border border-white/5">
          No matched reference assets recorded for this post.
        </div>
      )}
    </div>
  )
}

function MusicReferencePanel({ post }) {
  const rawAudio =
    post.slides?.[0]?.musicReference ||
    post.metadata?.suggestedAudio ||
    post.SuggestedAudio

  const musicTitle =
    typeof rawAudio === 'string'
      ? rawAudio
      : rawAudio?.title || rawAudio?.Mood || 'Lo-fi Tech Beats / Deep Focus Ambient'

  const searchTerms = Array.isArray(rawAudio?.searchTerms)
    ? rawAudio.searchTerms.join(', ')
    : Array.isArray(rawAudio?.SearchTerms)
      ? rawAudio.SearchTerms.join(', ')
      : null

  const note = rawAudio?.note || rawAudio?.Note || null

  return (
    <div className="flex flex-col gap-4 max-w-xl">
      <div className="p-5 rounded-2xl bg-black/30 border border-white/10 flex flex-col gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 font-mono">
          <Music className="w-4 h-4" /> Suggested Audio Soundtrack
        </div>
        <div className="text-sm font-semibold text-white">{musicTitle}</div>
        {searchTerms && (
          <div className="text-xs text-slate-400">
            <span className="text-slate-500 font-mono">Search tags: </span> {searchTerms}
          </div>
        )}
        {note && (
          <div className="text-xs text-yellow-300/90 font-mono italic bg-yellow-400/5 p-2.5 rounded-xl border border-yellow-400/10">
            {note}
          </div>
        )}
        <p className="text-xs text-slate-400 m-0">
          Recommended background audio to pair when exporting carousel to Instagram Reels or TikTok.
        </p>
      </div>
    </div>
  )
}

function ProjectConfigPanel({ project, activeTrack }) {
  const cfg = project?.config
  if (!cfg) return <div className="text-xs text-slate-500">No project configuration found.</div>

  const palette = activeTrack?.palette || cfg.trackPalettes?.[activeTrack?.id]

  return (
    <div className="flex flex-col gap-4 text-xs">
      <ConfigSection title="Active Track Palette">
        {palette ? (
          <div className="flex gap-3">
            <SwatchBox label="Primary" color={palette.primary} />
            <SwatchBox label="Accent" color={palette.accent} />
          </div>
        ) : (
          <span className="text-slate-500">Select a track to view palette.</span>
        )}
      </ConfigSection>

      <ConfigSection title="Project Background">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg border border-white/10"
            style={{ backgroundColor: cfg.background?.color || '#F8F7F4' }}
          />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-200 uppercase font-mono">
              {cfg.background?.type || 'dots'} Pattern
            </span>
            <span className="text-[10px] text-slate-400">{cfg.background?.color}</span>
          </div>
        </div>
      </ConfigSection>

      <ConfigSection title="Canvas Dimensions (4:5 Portrait)">
        <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-300 font-mono">
          <div className="p-2 rounded-lg bg-white/5 border border-white/5 flex flex-col items-center">
            <span className="text-[9px] text-slate-500">WIDTH</span>
            <span className="font-bold text-cyan-300">{cfg.canvasSpec?.width}px</span>
          </div>
          <div className="p-2 rounded-lg bg-white/5 border border-white/5 flex flex-col items-center">
            <span className="text-[9px] text-slate-500">HEIGHT</span>
            <span className="font-bold text-cyan-300">{cfg.canvasSpec?.height}px</span>
          </div>
          <div className="p-2 rounded-lg bg-white/5 border border-white/5 flex flex-col items-center">
            <span className="text-[9px] text-slate-500">PADDING</span>
            <span className="font-bold text-cyan-300">{cfg.canvasSpec?.padding}px</span>
          </div>
        </div>
      </ConfigSection>

      <ConfigSection title="Typography Tokens">
        <div className="flex flex-col gap-2 text-[11px]">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-slate-500 uppercase">Headline Font</span>
            <span className="font-serif font-bold text-slate-200">
              {cfg.typography?.headline?.family || 'Instrument Serif, Georgia'}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-slate-500 uppercase">Body Font</span>
            <span className="font-sans text-slate-200">
              {cfg.typography?.body?.family || 'Inter, sans-serif'}
            </span>
          </div>
        </div>
      </ConfigSection>
    </div>
  )
}

function ConfigSection({ title, children }) {
  return (
    <div className="p-3.5 rounded-2xl bg-black/30 border border-white/10 flex flex-col gap-2.5">
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
        {title}
      </span>
      {children}
    </div>
  )
}

function SwatchBox({ label, color }) {
  return (
    <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-white/5 border border-white/5 flex-1">
      <div
        className="w-full h-8 rounded-lg border border-white/10 shadow-xs"
        style={{ backgroundColor: color }}
      />
      <div className="flex flex-col items-center">
        <span className="text-[9px] font-mono text-slate-500 uppercase">{label}</span>
        <span className="text-[10px] font-mono font-bold text-slate-300">{color}</span>
      </div>
    </div>
  )
}
