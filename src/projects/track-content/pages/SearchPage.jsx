import { useMemo } from 'react'
import { useSearchParams, useNavigate, useOutletContext } from 'react-router-dom'
import PostCard from '../components/PostCard'

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const query = searchParams.get('q') || ''
  const { posts = [], trackPalettes = {}, onCopy } = useOutletContext()

  const results = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return posts.filter((p) => {
      const matchTrack = p.Track?.toLowerCase().includes(q)
      const matchTitle = p.PostTitle?.toLowerCase().includes(q)
      const matchContext = p.Context?.toLowerCase().includes(q)
      const matchDesc = p.Description?.toLowerCase().includes(q)
      const matchSlides = p.Slides?.some(
        (s) =>
          s.SlideTitle?.toLowerCase().includes(q) ||
          s.Content?.toLowerCase().includes(q) ||
          s.VisualDirective?.toLowerCase().includes(q)
      )
      return matchTrack || matchTitle || matchContext || matchDesc || matchSlides
    })
  }, [query, posts])

  return (
    <div className="flex flex-col gap-6">
      <div className="p-6 md:p-8 rounded-2xl bg-[#1a1e2a] border border-white/10 flex flex-col gap-2">
        <h2 className="font-serif font-bold text-2xl md:text-3xl text-white tracking-tight m-0">
          🔍 Search Results
        </h2>
        <p className="text-xs md:text-sm text-slate-300 font-sans m-0">
          Found <strong className="text-cyan-400 font-bold">{results.length}</strong> matching post{results.length === 1 ? '' : 's'} for "
          <span className="text-yellow-400 font-bold font-mono">{query}</span>"
        </p>
      </div>

      {results.length === 0 ? (
        <div className="p-12 md:p-16 rounded-2xl bg-[#1a1e2a] border border-white/10 flex flex-col items-center justify-center text-center gap-4">
          <h3 className="font-serif font-bold text-xl text-white m-0">No matching posts found</h3>
          <p className="text-xs md:text-sm text-slate-400 max-w-md m-0">
            Try searching for a different keyword like "binary", "docker", "kafka", or "react".
          </p>
          <button
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-colors"
            onClick={() => navigate('/track/1')}
          >
            Explore Track 1
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {results.map((post) => (
            <PostCard
              key={`${post.Track}-${post.PostNo}`}
              post={post}
              trackColor={trackPalettes[post.Track]}
              onCopy={onCopy}
            />
          ))}
        </div>
      )}
    </div>
  )
}
