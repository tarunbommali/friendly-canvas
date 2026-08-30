import { useParams, useOutletContext } from 'react-router-dom'
import PostCard from '../components/PostCard'

export default function PostPage() {
  const { postId } = useParams()
  const context = useOutletContext()
  const { currentTrackPosts = [], trackPalettes = {}, onCopy } = context

  const currentPostIndex = parseInt(postId, 10) || 1
  const activePost = currentTrackPosts[currentPostIndex - 1] || currentTrackPosts[0]

  if (!activePost) {
    return (
      <div className="p-12 rounded-2xl bg-[#1a1e2a] border border-white/10 flex flex-col items-center justify-center text-center gap-3">
        <h3 className="font-serif font-bold text-xl text-white m-0">Post not found</h3>
        <p className="text-xs text-slate-400 m-0">The post you are trying to view does not exist in this track.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PostCard
        post={activePost}
        trackColor={trackPalettes[activePost.Track]}
        onCopy={onCopy}
      />
    </div>
  )
}
