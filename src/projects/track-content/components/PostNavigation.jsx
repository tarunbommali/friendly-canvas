import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'

export default function PostNavigation({
  currentTrackIndex,
  currentTrackPosts = [],
  activeTrack,
}) {
  const navigate = useNavigate()
  const { postId } = useParams()
  const currentPostIndex = parseInt(postId, 10) || 1
  const post = currentTrackPosts[currentPostIndex - 1]

  const goToPrev = () => {
    if (currentPostIndex > 1) {
      navigate(`/track/${currentTrackIndex}/post/${currentPostIndex - 1}`)
    }
  }

  const goToNext = () => {
    if (currentPostIndex < currentTrackPosts.length) {
      navigate(`/track/${currentTrackIndex}/post/${currentPostIndex + 1}`)
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-[#151821] border-b border-white/10 rounded-xl mb-4 text-xs select-none">
      <div className="flex items-center gap-2 flex-wrap">
        <button
          className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-cyan-400 hover:text-cyan-300 font-mono font-bold transition-all cursor-pointer"
          onClick={() => navigate(`/track/${currentTrackIndex}/post/1`)}
          title={`Track ${currentTrackIndex}`}
        >
          Track {currentTrackIndex}
        </button>
        <span className="text-slate-600 font-bold">/</span>
        <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono font-bold">
          {currentTrackIndex}.{currentPostIndex}
        </span>
        <span className="font-medium text-slate-300 truncate max-w-xs md:max-w-md">
          {post?.PostTitle || ''}
        </span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-30 disabled:pointer-events-none text-slate-300 hover:text-white font-semibold transition-all flex items-center gap-1 cursor-pointer"
          disabled={currentPostIndex <= 1}
          onClick={goToPrev}
          title="Previous Post in this Track"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Prev Post
        </button>

        <span className="font-mono text-slate-400 font-semibold px-2 py-0.5 rounded bg-black/30 border border-white/5">
          {currentPostIndex} of {currentTrackPosts.length}
        </span>

        <button
          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-30 disabled:pointer-events-none text-slate-300 hover:text-white font-semibold transition-all flex items-center gap-1 cursor-pointer"
          disabled={currentPostIndex >= currentTrackPosts.length}
          onClick={goToNext}
          title="Next Post in this Track"
        >
          Next Post <ChevronRight className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-5 bg-white/10 mx-0.5 hidden sm:block" />

        <button
          type="button"
          className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer ml-1"
          onClick={() =>
            navigate(`/design/track/${currentTrackIndex}/post/${currentPostIndex}`)
          }
          title="Open all existing slides of this post in Create Post Studio"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" /> Create Post
        </button>
      </div>
    </div>
  )
}
