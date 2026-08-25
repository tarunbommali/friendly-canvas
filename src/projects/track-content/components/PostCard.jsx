import React, { useState } from 'react'
import {
  Music,
  Headphones,
  Sparkles,
  FileText,
  Search,
  Hash,
  Eye,
  EyeOff,
  Copy,
  Lightbulb,
} from 'lucide-react'
import LiveCarouselStudio from './LiveCarouselStudio'
import {
  generatePostMasterPrompt,
  generateCaptionText,
} from '../../../utils/promptGenerators'

export default function PostCard({
  post,
  trackColor,
  onCopy,
}) {
  const [showJson, setShowJson] = useState(false)

  const primary = trackColor?.primary || '#1E5FA8'
  const accent = trackColor?.accent || '#A9D0F5'

  const handleCopyMasterPrompt = () => {
    const prompt = generatePostMasterPrompt(post, trackColor)
    onCopy(
      prompt,
      `Master Storyboard Prompt Copied!`,
      `Complete prompt for "${post.PostTitle}" with all ${post.Slides.length} slides ready to paste.`
    )
  }

  const handleCopyCaption = () => {
    const caption = generateCaptionText(post)
    onCopy(
      caption,
      `Caption & Hashtags Copied!`,
      `Ready to publish with slide breakdown and hashtags.`
    )
  }

  const handleCopyHashtags = () => {
    const tags = post.Hashtags?.join(' ') || ''
    onCopy(tags, `Hashtags Copied!`, tags)
  }

  const handleCopyJson = () => {
    const jsonStr = JSON.stringify(post, null, 2)
    onCopy(jsonStr, `Post JSON Copied!`, `Formatted JSON metadata.`)
  }

  return (
    <article
      className="bg-[#1a1e2a] border border-white/10 rounded-2xl overflow-hidden shadow-lg transition-all duration-200 hover:border-white/20 mb-8 select-none"
      id={`post-${post.PostNo}`}
      style={{
        '--post-primary': primary,
        '--post-accent': accent,
      }}
    >
      {/* Direct In-Page Live Carousel Studio */}
      <div className="p-4 md:p-6 bg-black/20 border-b border-white/10">
        <LiveCarouselStudio
          post={post}
          trackColor={trackColor}
          onCopy={onCopy}
        />
      </div>

      {/* Post Header & Overview */}
      <div className="p-6 md:p-8 flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              {post.Slides?.length} Slides
            </span>
            {post.SuggestedAudio?.Mood && (
              <span className="text-xs px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5" /> {post.SuggestedAudio.Mood}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              className="px-3.5 py-1.5 rounded-lg bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-xs shadow-md transition-all hover:-translate-y-0.5 flex items-center gap-1.5 cursor-pointer"
              onClick={handleCopyMasterPrompt}
              title="Copy the full storyboard prompt for Custom GPT or Claude"
            >
              <Sparkles className="w-3.5 h-3.5" /> Copy Master Prompt
            </button>
            <button
              className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              onClick={handleCopyCaption}
              title="Copy ready-to-post Instagram caption with hashtags"
            >
              <FileText className="w-3.5 h-3.5" /> Copy Caption
            </button>
          </div>
        </div>

        <h2 className="font-serif font-bold text-2xl md:text-3xl text-white tracking-tight">
          {post.PostTitle}
        </h2>

        {/* Context & Description Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {post.Context && (
            <div className="p-4 rounded-xl bg-[#0f1117] border border-white/5 flex flex-col gap-1">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Context:
              </span>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed m-0 font-sans">
                {post.Context}
              </p>
            </div>
          )}
          {post.Description && (
            <div className="p-4 rounded-xl bg-[#0f1117] border border-white/5 flex flex-col gap-1">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Description:
              </span>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed m-0 font-sans">
                {post.Description}
              </p>
            </div>
          )}
        </div>

        {/* Suggested Audio Field */}
        {post.SuggestedAudio && (
          <div className="p-4 rounded-xl bg-black/25 border border-white/5 flex flex-col gap-2.5">
            <div className="flex items-center gap-2 text-xs">
              <Headphones className="w-4 h-4 text-purple-300" />
              <strong className="text-slate-300">Suggested Audio Mood:</strong>
              <span className="font-semibold text-purple-300">{post.SuggestedAudio.Mood}</span>
            </div>
            {post.SuggestedAudio.SearchTerms && (
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-500">Search Terms:</span>
                <div className="flex flex-wrap gap-1.5">
                  {post.SuggestedAudio.SearchTerms.map((term, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-white/5 hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-400/40 text-slate-300 hover:text-cyan-300 text-xs font-mono cursor-pointer transition-all flex items-center gap-1"
                      onClick={() => onCopy(term, 'Search Term Copied!', term)}
                      title="Click to copy term"
                    >
                      <Search className="w-3 h-3 text-slate-400" /> {term}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {post.SuggestedAudio.Note && (
              <p className="text-[11px] text-slate-400 italic m-0 flex items-center gap-1">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" /> {post.SuggestedAudio.Note}
              </p>
            )}
          </div>
        )}

        {/* Hashtags Field */}
        {post.Hashtags && post.Hashtags.length > 0 && (
          <div className="p-4 rounded-xl bg-black/25 border border-white/5 flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <Hash className="w-4 h-4 text-cyan-400" />
                <strong className="text-slate-300">Hashtags ({post.Hashtags.length}):</strong>
              </div>
              <button
                className="text-[11px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
                onClick={handleCopyHashtags}
              >
                Copy All Tags
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {post.Hashtags.map((tag, i) => (
                <span
                  key={i}
                  className="font-mono text-xs text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 px-2 py-0.5 rounded cursor-pointer transition-all"
                  onClick={() => onCopy(tag, 'Tag Copied!', tag)}
                  title="Click to copy tag"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* JSON actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            className="text-xs text-slate-400 hover:text-slate-200 cursor-pointer flex items-center gap-1.5"
            onClick={() => setShowJson(!showJson)}
          >
            {showJson ? (
              <>
                <EyeOff className="w-3.5 h-3.5" /> Hide Raw JSON
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" /> View Raw JSON
              </>
            )}
          </button>
          <button
            className="text-xs text-slate-400 hover:text-slate-200 cursor-pointer flex items-center gap-1.5"
            onClick={handleCopyJson}
          >
            <Copy className="w-3.5 h-3.5" /> Copy JSON
          </button>
        </div>

        {showJson && (
          <div className="p-4 rounded-xl bg-[#0f1117] border border-white/10 max-h-72 overflow-y-auto">
            <pre className="font-mono text-xs text-indigo-300 leading-relaxed m-0">
              {JSON.stringify(post, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </article>
  )
}
