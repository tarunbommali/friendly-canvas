import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FileText,
  Layers,
  Music,
  Image as ImageIcon,
  Plus,
  ArrowRight,
  Check,
  ExternalLink,
  ChevronRight,
  Database,
  ChevronLeft,
  Sparkles,
} from 'lucide-react';
import { useProjectData } from '../hooks/useProjectData';
import { useTrackData } from '../../../shared/hooks/useTrackData';

export default function ContentManagementPage() {
  const { projectSlug = 'swe-notebook', trackId = '01', postId = '1' } = useParams();
  const navigate = useNavigate();

  const { project, tracks, updateSlideContent } = useProjectData(projectSlug);
  const { trackPalettes } = useTrackData();

  const [activeTab, setActiveTab] = useState('content'); // 'content' | 'storyboard' | 'assets' | 'music'
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  };

  const activeTrack = useMemo(() => {
    if (!tracks || tracks.length === 0) return null;
    const numId = parseInt(trackId, 10);
    return (
      tracks.find(
        (t) =>
          String(t.id) === String(trackId) ||
          String(t.trackKey) === String(trackId) ||
          parseInt(t.trackNo, 10) === numId ||
          parseInt(t.id, 10) === numId
      ) || tracks[0]
    );
  }, [tracks, trackId]);

  const trackPosts = useMemo(() => {
    return activeTrack?.posts || [];
  }, [activeTrack]);

  const activePost = useMemo(() => {
    if (!trackPosts || trackPosts.length === 0) return null;
    const numPostId = parseInt(postId, 10);
    return (
      trackPosts.find(
        (p) =>
          String(p.id) === String(postId) ||
          parseInt(p.postNo, 10) === numPostId ||
          parseInt(p.PostNo, 10) === numPostId ||
          String(p.designNo) === String(postId)
      ) || trackPosts[0]
    );
  }, [trackPosts, postId]);

  const trackNumStr = String(activeTrack?.trackNo || trackId).padStart(2, '0');
  const cleanTrackTitle = (activeTrack?.title || activeTrack?.name || 'Track').replace(/^Track \d+\s*—\s*/, '');
  const palette = activeTrack?.palette || { primary: '#2563eb', accent: '#93c5fd' };

  const handleOpenCanvas = () => {
    const pId = activePost?.id || activePost?.postNo || '1';
    navigate(`/${projectSlug}/design/track/${trackNumStr}/post/${pId}`);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full font-sans flex flex-col gap-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-xs shadow-xl flex items-center gap-2 animate-fade-in border border-blue-400">
          <Check className="w-4 h-4" /> {toastMsg}
        </div>
      )}

      {/* Top Context Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-mono text-gray-500 dark:text-slate-400">
        <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          Projects
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500" />
        <Link to={`/${projectSlug}/content`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          {project?.title || 'SWE Engineering'}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500" />
        <Link
          to={`/${projectSlug}/content/track/${trackNumStr}`}
          className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          Track {trackNumStr}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500" />
        <span className="text-gray-900 dark:text-slate-100 font-semibold font-mono">
          Post {activePost?.postNo || activePost?.PostNo || '1'}
        </span>
        <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-mono text-[10px] font-bold border border-blue-200 dark:border-blue-700">
          Slide Editor
        </span>
      </div>

      {/* Post Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#e2e8f0] dark:border-white/10">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-mono text-xs font-bold border border-blue-200 dark:border-blue-700">
              {trackNumStr}.{activePost?.postNo || activePost?.PostNo || '1'}
            </span>
            <div className="flex items-center gap-2 text-xs font-mono text-gray-500 dark:text-slate-400">
              <span>Track {trackNumStr}: {cleanTrackTitle}</span>
              <span>•</span>
              <span>{activePost?.slides?.length || 0} Slides</span>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 tracking-tight">
            {activePost?.title || activePost?.PostTitle || 'Post Title'}
          </h1>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              if (!activePost) return;
              const nextNo = (activePost.slides?.length || 0) + 1;
              updateSlideContent(
                activePost.id,
                `slide_new_${Date.now()}`,
                { title: `Slide ${nextNo} Headline`, body: '' },
                activeTrack?.title,
                activePost.postNo,
                nextNo
              );
              showToast('New slide added!');
            }}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Slide</span>
          </button>
        </div>
      </section>

      {/* Main 2-Column Layout: Left Slide Editor & Right Track Overview / Switcher Card */}
      <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
        {/* Left: Slide Editor & Navigation Tabs */}
        <div className="flex-1 min-w-0 w-full flex flex-col gap-5">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 border-b border-[#e2e8f0] dark:border-white/10 pb-px">
            {[
              { key: 'content', label: 'Slide Content & Copy', icon: FileText },
              { key: 'storyboard', label: 'Storyboard Preview', icon: Layers },
              { key: 'assets', label: 'Reference Assets', icon: ImageIcon },
              { key: 'music', label: 'Suggested Audio', icon: Music },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  className={`px-4 py-2 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                    isActive
                      ? 'border-blue-600 text-blue-700 dark:text-blue-400 font-bold bg-blue-50/50 dark:bg-blue-900/30 rounded-t-lg'
                      : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'
                  }`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Tab Content */}
          <div className="w-full">
            {activeTab === 'content' && activePost && (
              <SlideContentList
                post={activePost}
                onUpdateSlide={(slideId, updates, slideNo) => {
                  updateSlideContent(
                    activePost.id,
                    slideId,
                    updates,
                    activeTrack?.title || activeTrack?.name,
                    activePost.postNo || 1,
                    slideNo
                  );
                  showToast('Live synced to database');
                }}
                onOpenCanvas={handleOpenCanvas}
              />
            )}
            {activeTab === 'storyboard' && activePost && (
              <StoryboardView post={activePost} onOpenEditor={handleOpenCanvas} />
            )}
            {activeTab === 'assets' && activePost && <AssetsPanel post={activePost} />}
            {activeTab === 'music' && activePost && <MusicReferencePanel post={activePost} />}
          </div>
        </div>

        {/* Right: Track Overview & Posts Switcher Card */}
        <aside className="w-full lg:w-80 shrink-0 bg-white dark:bg-[#151821] border border-[#e2e8f0] dark:border-white/10 rounded-xl p-5 shadow-xs flex flex-col gap-4 sticky top-6">
          <div className="flex items-center justify-between border-b border-[#e2e8f0] dark:border-white/10 pb-3">
            <Link
              to={`/${projectSlug}/content/track/${trackNumStr}`}
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1 font-semibold transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Track {trackNumStr} Overview</span>
            </Link>
            <span className="text-[10px] font-mono text-gray-400 dark:text-slate-500">
              {trackPosts.length} Posts
            </span>
          </div>

          {/* Track Summary */}
          <div className="flex items-center gap-2.5 pb-1">
            <span
              className="w-3.5 h-3.5 rounded-full inline-block shrink-0 shadow-xs border border-white dark:border-slate-800"
              style={{ backgroundColor: palette.primary }}
            />
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-gray-900 dark:text-slate-100 truncate" title={cleanTrackTitle}>
                {cleanTrackTitle}
              </h3>
              <span className="text-[10px] font-mono text-gray-400 dark:text-slate-500 uppercase">
                Track {trackNumStr}
              </span>
            </div>
          </div>

          {/* List of Posts in this track */}
          <div className="flex flex-col gap-1 max-h-96 overflow-y-auto pt-1">
            {trackPosts.map((post, pIdx) => {
              const postNo = post.postNo || post.PostNo || pIdx + 1;
              const isSelected =
                activePost &&
                (activePost.id === post.id ||
                  activePost.postNo === postNo ||
                  activePost.PostNo === postNo);

              return (
                <button
                  key={post.id || pIdx}
                  onClick={() =>
                    navigate(`/${projectSlug}/content/track/${trackNumStr}/post/${post.id || postNo}`)
                  }
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left text-xs transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 font-semibold border border-blue-200 dark:border-blue-700 shadow-xs'
                      : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-900/60 border border-transparent'
                  }`}
                >
                  <span className="font-mono text-[10px] text-gray-400 dark:text-slate-500 font-bold shrink-0">
                    {trackNumStr}.{postNo}
                  </span>
                  <span className="truncate flex-1">
                    {post.title || post.PostTitle || `Post ${postNo}`}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}

// ── SUB-COMPONENTS ──

function SlideContentList({ post, onUpdateSlide, onOpenCanvas }) {
  const slides = post.slides || [];

  return (
    <div className="flex flex-col gap-5 w-full">
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-400 font-mono pb-2 border-b border-[#e2e8f0] dark:border-white/10">
        <span>Managing {slides.length} Slides</span>
        <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-semibold">
          <Database className="w-3.5 h-3.5" />
          <span>Database-Backed Persistence</span>
        </div>
      </div>

      {slides.map((slide, idx) => (
        <div
          key={slide.id || idx}
          className="p-6 rounded-xl bg-white dark:bg-[#151821] border border-[#e2e8f0] dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-600 flex flex-col gap-4 shadow-xs transition-all w-full"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-mono font-bold text-xs flex items-center justify-center border border-blue-200 dark:border-blue-700">
                {String(idx + 1).padStart(2, '0')}
              </span>
              <span className="text-xs font-bold text-gray-800 dark:text-slate-200 uppercase tracking-wider font-mono">
                Slide {idx + 1}
              </span>
            </div>

            <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold bg-gray-50 dark:bg-slate-900 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-white/10">
              {slide.layout || slide.archetypeKey || 'concept-explain'}
            </span>
          </div>

          {/* Slide Headline */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono font-semibold uppercase text-gray-500 dark:text-slate-400">
              Slide Headline
            </label>
            <input
              className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-white/10 rounded-lg px-3.5 py-2.5 text-sm font-semibold text-gray-900 dark:text-slate-100 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-950 transition-colors"
              value={slide.headline || slide.content?.title || ''}
              placeholder="Headline title..."
              onChange={(e) =>
                onUpdateSlide(slide.id, { title: e.target.value }, slide.slideNo || idx + 1)
              }
            />
          </div>

          {/* Body Copy Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono font-semibold uppercase text-gray-500 dark:text-slate-400">
              Body Copy / Concept Explanation
            </label>
            <textarea
              className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-gray-800 dark:text-slate-200 resize-y focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-950 transition-colors font-sans leading-relaxed"
              rows={3}
              value={slide.text || slide.content?.body || ''}
              placeholder="Detailed content for this slide..."
              onChange={(e) =>
                onUpdateSlide(slide.id, { body: e.target.value }, slide.slideNo || idx + 1)
              }
            />
          </div>

          {/* Visual Directive Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono font-semibold uppercase text-gray-500 dark:text-slate-400 flex items-center justify-between">
              <span>Visual Directive / Illustration Prompt</span>
              <span className="text-[10px] text-gray-400 dark:text-slate-500 lowercase font-normal">Fabric.js card spec</span>
            </label>
            <textarea
              className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-gray-800 dark:text-slate-200 resize-y focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-950 transition-colors font-mono leading-relaxed"
              rows={2}
              value={
                typeof slide.visualDirective === 'string'
                  ? slide.visualDirective
                  : slide.content?.visualDirective || ''
              }
              placeholder="Art direction for background and diagrams..."
              onChange={(e) =>
                onUpdateSlide(slide.id, { visualDirective: e.target.value }, slide.slideNo || idx + 1)
              }
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function StoryboardView({ post, onOpenEditor }) {
  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-400 font-mono pb-2 border-b border-[#e2e8f0] dark:border-white/10">
        <span>Storyboard Flow ({post.slides?.length || 0} Slides)</span>
        <button
          onClick={onOpenEditor}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold flex items-center gap-1 text-xs cursor-pointer"
        >
          <span>Launch Fabric Canvas Studio</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {post.slides?.map((slide, idx) => (
          <div
            key={slide.id || idx}
            onClick={onOpenEditor}
            className="group relative bg-white dark:bg-[#151821] border border-[#e2e8f0] dark:border-white/10 hover:border-blue-400 dark:hover:border-blue-600 rounded-xl p-5 flex flex-col justify-between aspect-[4/5] cursor-pointer shadow-xs hover:shadow-md transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-gray-100 dark:bg-slate-900 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-white/10">
                  #{idx + 1}
                </span>
                <span className="text-[10px] font-mono text-gray-400 dark:text-slate-500">
                  {slide.layout || 'concept-explain'}
                </span>
              </div>
              <h4 className="text-xs font-bold text-gray-900 dark:text-slate-100 line-clamp-2">
                {slide.headline || slide.content?.title || `Slide ${idx + 1}`}
              </h4>
              <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                {slide.text || slide.content?.body || 'No description provided.'}
              </p>
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-white/10 flex items-center justify-between text-[10px] font-mono text-gray-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              <span>Edit on Canvas</span>
              <ExternalLink className="w-3 h-3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AssetsPanel({ post }) {
  const assets = post.assets || [];
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="text-xs text-gray-500 dark:text-slate-400 font-mono pb-2 border-b border-[#e2e8f0] dark:border-white/10">
        Reference Assets &amp; Diagram Tags ({assets.length})
      </div>
      {assets.length === 0 ? (
        <div className="p-8 bg-white dark:bg-[#151821] border border-dashed border-[#e2e8f0] dark:border-white/10 rounded-xl text-center text-xs text-gray-400 dark:text-slate-500">
          No external asset references linked for this post.
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {assets.map((asset, idx) => (
            <span
              key={idx}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#151821] border border-[#e2e8f0] dark:border-white/10 text-xs font-mono text-gray-700 dark:text-slate-300 shadow-xs"
            >
              {typeof asset === 'string' ? asset : asset.name || asset.title}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function MusicReferencePanel({ post }) {
  return (
    <div className="p-6 rounded-xl bg-white dark:bg-[#151821] border border-[#e2e8f0] dark:border-white/10 max-w-2xl w-full flex flex-col gap-3 shadow-xs">
      <div className="flex items-center gap-2 text-xs font-bold text-gray-800 dark:text-slate-200 uppercase font-mono">
        <Music className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        <span>Suggested Audio Reference</span>
      </div>
      <div className="text-sm font-semibold text-gray-900 dark:text-slate-100">
        Lo-fi Tech Beats / Deep Focus Ambient
      </div>
      <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
        Recommended sound backdrop for Instagram reels and carousel video conversions.
      </p>
    </div>
  );
}
