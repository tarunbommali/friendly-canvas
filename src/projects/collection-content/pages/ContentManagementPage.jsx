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
  Link2,
  BookOpen,
  Globe,
  Pencil,
  Trash2,
  Copy,
  X,
} from 'lucide-react';
import { FaYoutube } from 'react-icons/fa';
import { useProjectData } from '../hooks/useProjectData';

// ──────────────────────────────────────────────
// 1. Toast Notification (reusable)
// ──────────────────────────────────────────────
function Toast({ message }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-xs shadow-xl flex items-center gap-2 animate-fade-in border border-blue-400">
      <Check className="w-4 h-4" /> {message}
    </div>
  );
}

// ──────────────────────────────────────────────
// 2. Breadcrumbs
// ──────────────────────────────────────────────
function Breadcrumbs({
  projectSlug,
  projectTitle,
  collectionNum,
  collectionTitle,
  postNo,
}) {
  return (
    <div className="flex items-center gap-2 text-xs font-mono text-gray-500 dark:text-slate-400">
      <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
        Projects
      </Link>
      <ChevronRight className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500" />
      <Link
        to={`/${projectSlug}/content`}
        className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        {projectTitle || 'SWE Engineering'}
      </Link>
      <ChevronRight className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500" />
      <Link
        to={`/${projectSlug}/content/collection/${collectionNum}`}
        className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        Collection {collectionNum}
      </Link>
      <ChevronRight className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500" />
      <span className="text-gray-900 dark:text-slate-100 font-semibold font-mono">
        Post {postNo}
      </span>
      <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-mono text-[10px] font-bold border border-blue-200 dark:border-blue-700">
        Slide Editor
      </span>
    </div>
  );
}

// ──────────────────────────────────────────────
// 3. Post Header
// ──────────────────────────────────────────────
function PostHeader({
  collectionNum,
  collectionTitle,
  postNo,
  postTitle,
  slideCount,
  onAddSlide,
}) {
  return (
    <section className="flex flex-col md:row md:items-end justify-between gap-6 pb-6 border-b border-[#e2e8f0] dark:border-white/10">
      <div className="max-w-3xl">
        <div className="flex items-center gap-3 mb-2">
          <span className="px-2.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-mono text-xs font-bold border border-blue-200 dark:border-blue-700">
            {collectionNum}.{postNo}
          </span>
          <div className="flex items-center gap-2 text-xs font-mono text-gray-500 dark:text-slate-400">
            <span>Collection {collectionNum}: {collectionTitle}</span>
            <span>•</span>
            <span>{slideCount} Slides</span>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 tracking-tight">
          {postTitle}
        </h1>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onAddSlide}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Slide</span>
        </button>
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────
// 4. Tab Bar
// ──────────────────────────────────────────────
function TabBar({ tabs, activeTab, onTabChange }) {
  return (
    <div className="flex items-center gap-1 border-b border-[#e2e8f0] dark:border-white/10 pb-px">
      {tabs.map((tab) => {
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
            onClick={() => onTabChange(tab.key)}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className="ml-0.5 text-[10px] text-gray-400 dark:text-slate-500">
                ({tab.count})
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ──────────────────────────────────────────────
// 5. Collection Overview Card (right sidebar)
// ──────────────────────────────────────────────
function CollectionOverviewCard({
  projectSlug,
  collectionNum,
  collectionTitle,
  palette,
  posts,
  activePostId,
  onNavigateToPost,
}) {
  return (
    <aside className="w-full lg:w-80 shrink-0 bg-white dark:bg-[#151821] border border-[#e2e8f0] dark:border-white/10 rounded-xl p-5 shadow-xs flex flex-col gap-4 sticky top-6">
      <div className="flex items-center justify-between border-b border-[#e2e8f0] dark:border-white/10 pb-3">
        <Link
          to={`/${projectSlug}/content/collection/${collectionNum}`}
          className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1 font-semibold transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Collection {collectionNum} Overview</span>
        </Link>
        <span className="text-[10px] font-mono text-gray-400 dark:text-slate-500">
          {posts.length} Posts
        </span>
      </div>

      <div className="flex items-center gap-2.5 pb-1">
        <span
          className="w-3.5 h-3.5 rounded-full inline-block shrink-0 shadow-xs border border-white dark:border-slate-800"
          style={{ backgroundColor: palette.primary }}
        />
        <div className="min-w-0">
          <h3 className="text-xs font-bold text-gray-900 dark:text-slate-100 truncate" title={collectionTitle}>
            {collectionTitle}
          </h3>
          <span className="text-[10px] font-mono text-gray-400 dark:text-slate-500 uppercase">
            Collection {collectionNum}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1 max-h-96 overflow-y-auto pt-1">
        {posts.map((post, pIdx) => {
          const postNo = post.postNo || post.PostNo || pIdx + 1;
          const postId = post.id || postNo;
          const isSelected = String(postId) === String(activePostId);
          return (
            <button
              key={postId}
              onClick={() => onNavigateToPost(postId)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left text-xs transition-all cursor-pointer ${
                isSelected
                  ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 font-semibold border border-blue-200 dark:border-blue-700 shadow-xs'
                  : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-900/60 border border-transparent'
              }`}
            >
              <span className="font-mono text-[10px] text-gray-400 dark:text-slate-500 font-bold shrink-0">
                {collectionNum}.{postNo}
              </span>
              <span className="truncate flex-1">
                {post.title || post.PostTitle || `Post ${postNo}`}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

// ──────────────────────────────────────────────
// 6. Slide Content List (Tab "content")
// ──────────────────────────────────────────────
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
              <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
                {post.watermarkBadge || "@swe.notebook"}
              </span>
              <span className="text-xs font-bold text-gray-800 dark:text-slate-200 uppercase tracking-wider font-mono">
                Slide {idx + 1}
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold bg-gray-50 dark:bg-slate-900 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-white/10">
              {slide.layout || slide.archetypeKey || 'concept-explain'}
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono font-semibold uppercase text-gray-500 dark:text-slate-400">
              Slide Heading
            </label>
            <input
              className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-white/10 rounded-lg px-3.5 py-2.5 text-sm font-semibold text-gray-900 dark:text-slate-100 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-950 transition-colors"
              value={slide.heading || ''}
              placeholder="Slide heading..."
              onChange={(e) =>
                onUpdateSlide(slide.id, { heading: e.target.value }, slide.slideNo || idx + 1)
              }
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono font-semibold uppercase text-gray-500 dark:text-slate-400">
              Body Text / Concept Explanation
            </label>
            <textarea
              className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-gray-800 dark:text-slate-200 resize-y focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-950 transition-colors font-sans leading-relaxed"
              rows={3}
              value={slide.bodyText || ''}
              placeholder="Detailed body text for this slide..."
              onChange={(e) =>
                onUpdateSlide(slide.id, { bodyText: e.target.value }, slide.slideNo || idx + 1)
              }
            />
          </div>

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

// ──────────────────────────────────────────────
// 7. Storyboard View (Tab "storyboard")
// ──────────────────────────────────────────────
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
                  {slide.layout || 'concept-explain'}
                </span>
              </div>
              <h4 className="text-xs font-bold text-gray-900 dark:text-slate-100 line-clamp-2">
                {slide.heading || `Slide ${idx + 1}`}
              </h4>
              <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                {slide.bodyText || 'No description provided.'}
              </p>
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-white/10 flex items-center justify-between text-[10px] font-mono text-gray-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              <span className="font-mono text-[10px] text-gray-400 dark:text-slate-500">
                {post.watermarkBadge || "@swe.notebook"}
              </span>
              <div className="flex items-center gap-1">
                <span>Edit on Canvas</span>
                <ExternalLink className="w-3 h-3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// 8. Assets Panel (Tab "assets")
// ──────────────────────────────────────────────
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

// ──────────────────────────────────────────────
// 9. Music Reference Panel (Tab "music")
// ──────────────────────────────────────────────
function MusicReferencePanel() {
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

// ──────────────────────────────────────────────
// 10. Post Resources Panel (Tab "resources")
// ──────────────────────────────────────────────

// 10a. Resource Form (add/edit)
function ResourceForm({
  mode,
  label,
  url,
  youtubeLink,
  blog,
  onLabelChange,
  onUrlChange,
  onYoutubeChange,
  onBlogChange,
  onCancel,
  onSave,
  isSubmitting,
}) {
  return (
    <div className="p-5 rounded-xl bg-blue-50/40 dark:bg-blue-950/20 border-2 border-blue-500/30 dark:border-blue-500/40 flex flex-col gap-4 shadow-sm transition-all animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center text-xs font-bold font-mono">
            {mode === 'add' ? '+' : '✎'}
          </span>
          <h3 className="text-xs font-bold text-gray-900 dark:text-slate-100 uppercase tracking-wider font-mono">
            {mode === 'add' ? 'Add New Learning Resource' : 'Edit Resource'}
          </h3>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 transition-colors"
          title="Cancel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Quick presets (only for add mode) */}
      {mode === 'add' && (
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
          <span className="text-gray-500 dark:text-slate-400">Quick Template:</span>
          <button
            type="button"
            onClick={() => {
              onLabelChange('YouTube Video');
            }}
            className="px-2.5 py-1 rounded bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 text-red-600 dark:text-red-400 hover:border-red-400 flex items-center gap-1.5 cursor-pointer font-semibold transition-colors"
          >
            <FaYoutube className="w-3 h-3" />
            <span>YouTube</span>
          </button>
          <button
            type="button"
            onClick={() => onLabelChange('Blog / Article')}
            className="px-2.5 py-1 rounded bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 text-emerald-600 dark:text-emerald-400 hover:border-emerald-400 flex items-center gap-1.5 cursor-pointer font-semibold transition-colors"
          >
            <BookOpen className="w-3 h-3" />
            <span>Blog</span>
          </button>
          <button
            type="button"
            onClick={() => onLabelChange('Documentation')}
            className="px-2.5 py-1 rounded bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 text-blue-600 dark:text-blue-400 hover:border-blue-400 flex items-center gap-1.5 cursor-pointer font-semibold transition-colors"
          >
            <Globe className="w-3 h-3" />
            <span>Docs</span>
          </button>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave();
        }}
        className="flex flex-col gap-3.5"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-mono font-semibold uppercase text-gray-600 dark:text-slate-400 flex items-center gap-1">
              <span>Resource Label / Title</span>
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={label}
              onChange={(e) => onLabelChange(e.target.value)}
              placeholder="e.g. History of Computing Video, MDN Docs..."
              className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2 text-xs font-semibold text-gray-900 dark:text-slate-100 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-mono font-semibold uppercase text-gray-600 dark:text-slate-400 flex items-center gap-1">
              <span>Primary URL</span>
              <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => onUrlChange(e.target.value)}
              placeholder="https://..."
              className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-gray-900 dark:text-slate-100 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-mono font-semibold uppercase text-gray-600 dark:text-slate-400 flex items-center gap-1.5">
              <FaYoutube className="w-3 h-3 text-red-500" />
              <span>Dedicated YouTube Link</span>
              <span className="text-[10px] text-gray-400 font-normal lowercase">(optional)</span>
            </label>
            <input
              type="url"
              value={youtubeLink}
              onChange={(e) => onYoutubeChange(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-gray-900 dark:text-slate-100 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-mono font-semibold uppercase text-gray-600 dark:text-slate-400 flex items-center gap-1.5">
              <BookOpen className="w-3 h-3 text-emerald-500" />
              <span>Dedicated Blog / Article URL</span>
              <span className="text-[10px] text-gray-400 font-normal lowercase">(optional)</span>
            </label>
            <input
              type="url"
              value={blog}
              onChange={(e) => onBlogChange(e.target.value)}
              placeholder="https://..."
              className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-gray-900 dark:text-slate-100 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200 dark:border-white/10">
          <button
            type="button"
            onClick={onCancel}
            className="px-3.5 py-2 text-xs font-semibold text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{mode === 'add' ? 'Save Resource' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

// 10b. Resource Item
function ResourceItem({
  resource,
  index,
  onEdit,
  onDelete,
  onCopy,
  copiedId,
}) {
  const primaryUrl = resource.url || resource.youtubeLink || resource.blog || resource.blogUrl || '';
  const hasYt = !!resource.youtubeLink || (primaryUrl.includes('youtube.com') || primaryUrl.includes('youtu.be'));
  const ytUrl = resource.youtubeLink || (hasYt ? primaryUrl : '');
  const hasBlog = !!(resource.blog || resource.blogUrl);
  const blogUrl = resource.blog || resource.blogUrl || (!hasYt ? primaryUrl : '');
  const labelText =
    resource.label ||
    (resource.youtubeLink && (resource.blog || resource.blogUrl)
      ? 'Video & Article Reference'
      : resource.youtubeLink
      ? 'YouTube Video'
      : resource.blog || resource.blogUrl
      ? 'Blog / Article'
      : `Resource ${index + 1}`);

  const [deleting, setDeleting] = useState(false);

  return (
    <div className="p-5 rounded-xl bg-white dark:bg-[#151821] border border-[#e2e8f0] dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-600 flex flex-col gap-3.5 shadow-xs transition-all w-full">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="w-6 h-6 rounded-md bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-mono font-bold text-xs flex items-center justify-center border border-blue-200 dark:border-blue-700">
            {index + 1}
          </span>
          <h4 className="text-sm font-bold text-gray-900 dark:text-slate-100">{labelText}</h4>

          {hasYt && (
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40 flex items-center gap-1">
              <FaYoutube className="w-3 h-3" />
              <span>YouTube</span>
            </span>
          )}
          {hasBlog && (
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 flex items-center gap-1">
              <BookOpen className="w-2.5 h-2.5" />
              <span>Article / Blog</span>
            </span>
          )}
          {!hasYt && !hasBlog && (
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-gray-100 dark:bg-slate-900 text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-white/10 flex items-center gap-1">
              <Globe className="w-2.5 h-2.5" />
              <span>Web Resource</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {deleting ? (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900/50 text-[11px] font-mono animate-fade-in">
              <span className="text-red-700 dark:text-red-300 font-semibold">Delete?</span>
              <button
                type="button"
                onClick={() => {
                  onDelete(index);
                  setDeleting(false);
                }}
                className="px-2 py-0.5 rounded bg-red-600 hover:bg-red-700 text-white font-bold transition-colors cursor-pointer shadow-xs"
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setDeleting(false)}
                className="px-1.5 py-0.5 rounded text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onEdit(index)}
                className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Edit Resource"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setDeleting(true)}
                className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                title="Delete Resource"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 pt-1">
        {ytUrl && (
          <LinkRow
            icon={<FaYoutube className="w-3.5 h-3.5 text-red-500 shrink-0" />}
            label="Video:"
            url={ytUrl}
            onCopy={() => onCopy(ytUrl, `yt_${index}`)}
            copied={copiedId === `yt_${index}`}
          />
        )}
        {blogUrl && (
          <LinkRow
            icon={<BookOpen className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
            label="Reading:"
            url={blogUrl}
            onCopy={() => onCopy(blogUrl, `blog_${index}`)}
            copied={copiedId === `blog_${index}`}
          />
        )}
        {resource.url && resource.url !== ytUrl && resource.url !== blogUrl && (
          <LinkRow
            icon={<Globe className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
            label="URL:"
            url={resource.url}
            onCopy={() => onCopy(resource.url, `url_${index}`)}
            copied={copiedId === `url_${index}`}
          />
        )}
      </div>
    </div>
  );
}

// Helper for rendering a single link row
function LinkRow({ icon, label, url, onCopy, copied }) {
  return (
    <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-gray-50 dark:bg-slate-900/60 border border-gray-200/70 dark:border-white/5 text-xs font-mono">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {icon}
        <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-slate-500 shrink-0">
          {label}
        </span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 hover:underline truncate"
        >
          {url}
        </a>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={onCopy}
          className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
          title="Copy Link"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
        </button>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
          title="Open in new tab"
        >
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}

// 10c. Main Resources Panel
function PostResourcesPanel({ post, onUpdateResources, showToast }) {
  const resources = useMemo(() => post?.resources || [], [post?.resources]);

  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Form state for add
  const [newLabel, setNewLabel] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newYoutubeLink, setNewYoutubeLink] = useState('');
  const [newBlog, setNewBlog] = useState('');

  // Form state for edit
  const [editLabel, setEditLabel] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editYoutubeLink, setEditYoutubeLink] = useState('');
  const [editBlog, setEditBlog] = useState('');

  const resetAddForm = () => {
    setIsAdding(false);
    setNewLabel('');
    setNewUrl('');
    setNewYoutubeLink('');
    setNewBlog('');
  };

  const resetEditForm = () => {
    setEditingIndex(null);
    setEditLabel('');
    setEditUrl('');
    setEditYoutubeLink('');
    setEditBlog('');
  };

  const copyToClipboard = (text, id) => {
    if (!text) return;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
    }
    setCopiedId(id);
    showToast('Link copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleStartAdd = (presetType) => {
    setIsAdding(true);
    setEditingIndex(null);
    if (presetType === 'youtube') setNewLabel('YouTube Video');
    else if (presetType === 'blog') setNewLabel('Blog / Article');
    else if (presetType === 'docs') setNewLabel('Documentation');
    else setNewLabel('');
  };

  const handleSaveAdd = () => {
    const finalLabel = newLabel.trim() || 'Reference Resource';
    const finalUrl = newUrl.trim();
    const finalYt = newYoutubeLink.trim();
    const finalBlog = newBlog.trim();

    if (!finalUrl && !finalYt && !finalBlog) {
      showToast('Please enter at least a URL or YouTube/Blog link');
      return;
    }

    const primaryUrl = finalUrl || finalYt || finalBlog;
    const isYt = finalYt || primaryUrl.includes('youtube.com') || primaryUrl.includes('youtu.be');

    const newResource = {
      label: finalLabel,
      url: primaryUrl,
      youtubeLink: finalYt || (isYt ? primaryUrl : ''),
      blog: finalBlog || (!isYt && !finalYt ? primaryUrl : ''),
    };

    const updated = [...resources, newResource];
    onUpdateResources(updated);
    showToast('Resource added successfully!');
    resetAddForm();
  };

  const handleStartEdit = (idx) => {
    const item = resources[idx];
    setIsAdding(false);
    setEditingIndex(idx);
    setEditLabel(
      item.label ||
        (item.youtubeLink && (item.blog || item.blogUrl)
          ? 'Video & Article Reference'
          : item.youtubeLink
          ? 'YouTube Video'
          : item.blog || item.blogUrl
          ? 'Blog / Article'
          : 'Reference Link')
    );
    setEditUrl(item.url || item.youtubeLink || item.blog || item.blogUrl || '');
    setEditYoutubeLink(item.youtubeLink || '');
    setEditBlog(item.blog || item.blogUrl || '');
  };

  const handleSaveEdit = (idx) => {
    const finalLabel = editLabel.trim() || 'Reference Resource';
    const finalUrl = editUrl.trim();
    const finalYt = editYoutubeLink.trim();
    const finalBlog = editBlog.trim();

    if (!finalUrl && !finalYt && !finalBlog) {
      showToast('Please enter at least a URL or YouTube/Blog link');
      return;
    }

    const primaryUrl = finalUrl || finalYt || finalBlog;
    const isYt = finalYt || primaryUrl.includes('youtube.com') || primaryUrl.includes('youtu.be');

    const updated = [...resources];
    updated[idx] = {
      ...updated[idx],
      label: finalLabel,
      url: primaryUrl,
      youtubeLink: finalYt || (isYt ? primaryUrl : ''),
      blog: finalBlog || (!isYt && !finalYt ? primaryUrl : ''),
    };

    onUpdateResources(updated);
    showToast('Resource updated successfully!');
    resetEditForm();
  };

  const handleDelete = (idx) => {
    const updated = resources.filter((_, i) => i !== idx);
    onUpdateResources(updated);
    showToast('Resource deleted');
  };

  const renderForm = () => {
    if (isAdding) {
      return (
        <ResourceForm
          mode="add"
          label={newLabel}
          url={newUrl}
          youtubeLink={newYoutubeLink}
          blog={newBlog}
          onLabelChange={setNewLabel}
          onUrlChange={(v) => {
            setNewUrl(v);
            // auto-detect YouTube
            if (v.includes('youtube.com') || v.includes('youtu.be')) {
              if (!newYoutubeLink) setNewYoutubeLink(v);
              if (!newLabel) setNewLabel('YouTube Video');
            }
          }}
          onYoutubeChange={setNewYoutubeLink}
          onBlogChange={setNewBlog}
          onCancel={resetAddForm}
          onSave={handleSaveAdd}
        />
      );
    }

    if (editingIndex !== null) {
      return (
        <ResourceForm
          mode="edit"
          label={editLabel}
          url={editUrl}
          youtubeLink={editYoutubeLink}
          blog={editBlog}
          onLabelChange={setEditLabel}
          onUrlChange={setEditUrl}
          onYoutubeChange={setEditYoutubeLink}
          onBlogChange={setEditBlog}
          onCancel={resetEditForm}
          onSave={() => handleSaveEdit(editingIndex)}
        />
      );
    }

    return null;
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-500 dark:text-slate-400 font-mono pb-3 border-b border-[#e2e8f0] dark:border-white/10">
        <div className="flex items-center gap-2">
          <Link2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="font-bold text-gray-800 dark:text-slate-200 uppercase tracking-wider">
            Post Learning Resources ({resources.length})
          </span>
        </div>

        {!isAdding && editingIndex === null && (
          <button
            type="button"
            onClick={() => handleStartAdd('general')}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Resource</span>
          </button>
        )}
      </div>

      {renderForm()}

      {resources.length === 0 && !isAdding && editingIndex === null ? (
        <div className="p-10 bg-white dark:bg-[#151821] border border-dashed border-[#e2e8f0] dark:border-white/10 rounded-xl flex flex-col items-center justify-center gap-3 text-center">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-700">
            <Link2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-slate-100">
              No External Resources Yet
            </h4>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 max-w-md">
              Add supplementary YouTube videos, reading blogs, and documentation links for this post to enrich the curriculum.
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleStartAdd('general')}
            className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Resource</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5 w-full">
          {resources.map((item, idx) => (
            <ResourceItem
              key={idx}
              resource={item}
              index={idx}
              onEdit={handleStartEdit}
              onDelete={handleDelete}
              onCopy={copyToClipboard}
              copiedId={copiedId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// 11. Main Page
// ──────────────────────────────────────────────
export default function ContentManagementPage() {
  const { projectSlug = 'swe-notebook', collectionId = '01', postId = '1' } = useParams();
  const navigate = useNavigate();

  const { project, collections, updateSlideContent, updatePostResources } = useProjectData(projectSlug);

  const [activeTab, setActiveTab] = useState('content');
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  };

  // Find active collection and post
  const activeCollection = useMemo(() => {
    if (!collections || collections.length === 0) return null;
    const numId = parseInt(collectionId, 10);
    return (
      collections.find(
        (c) =>
          String(c.id) === String(collectionId) ||
          String(c.collectionKey) === String(collectionId) ||
          parseInt(c.collectionNo, 10) === numId ||
          parseInt(c.id, 10) === numId
      ) || collections[0]
    );
  }, [collections, collectionId]);

  const collectionPosts = useMemo(() => activeCollection?.posts || [], [activeCollection]);

  const activePost = useMemo(() => {
    if (!collectionPosts || collectionPosts.length === 0) return null;
    const numPostId = parseInt(postId, 10);
    return (
      collectionPosts.find(
        (p) =>
          String(p.id) === String(postId) ||
          parseInt(p.postNo, 10) === numPostId ||
          parseInt(p.PostNo, 10) === numPostId ||
          String(p.designNo) === String(postId)
      ) || collectionPosts[0]
    );
  }, [collectionPosts, postId]);

  const collectionNumStr = String(activeCollection?.collectionNo || collectionId).padStart(2, '0');
  const cleanCollectionTitle = (activeCollection?.title || activeCollection?.name || 'Collection').replace(/^Collection \d+\s*—\s*/, '');
  const palette = activeCollection?.palette || { primary: '#2563eb', accent: '#93c5fd' };

  const handleOpenCanvas = () => {
    const pId = activePost?.id || activePost?.postNo || '1';
    navigate(`/${projectSlug}/design/collection/${collectionNumStr}/post/${pId}`);
  };

  const handleAddSlide = () => {
    if (!activePost) return;
    const nextNo = (activePost.slides?.length || 0) + 1;
    updateSlideContent(
      activePost.id,
      `slide_new_${Date.now()}`,
      { title: `Slide ${nextNo} Headline`, body: '' },
      activeCollection?.title,
      activePost.postNo,
      nextNo
    );
    showToast('New slide added!');
  };

  const tabs = [
    { key: 'content', label: 'Slide Content & Copy', icon: FileText },
    { key: 'storyboard', label: 'Storyboard Preview', icon: Layers },
    { key: 'assets', label: 'Reference Assets', icon: ImageIcon },
    {
      key: 'resources',
      label: 'Resources',
      icon: Link2,
      count: activePost?.resources?.length || 0,
    },
    { key: 'music', label: 'Suggested Audio', icon: Music },
  ];

  const renderTabContent = () => {
    if (!activePost) return <div className="p-4 text-gray-500">No post selected.</div>;

    switch (activeTab) {
      case 'content':
        return (
          <SlideContentList
            post={activePost}
            onUpdateSlide={(slideId, updates, slideNo) => {
              updateSlideContent(
                activePost.id,
                slideId,
                updates,
                activeCollection?.title || activeCollection?.name,
                activePost.postNo || 1,
                slideNo
              );
              showToast('Live synced to database');
            }}
            onOpenCanvas={handleOpenCanvas}
          />
        );
      case 'storyboard':
        return <StoryboardView post={activePost} onOpenEditor={handleOpenCanvas} />;
      case 'assets':
        return <AssetsPanel post={activePost} />;
      case 'resources':
        return (
          <PostResourcesPanel
            post={activePost}
            onUpdateResources={(newRes) => updatePostResources(activePost.id, newRes)}
            showToast={showToast}
          />
        );
      case 'music':
        return <MusicReferencePanel />;
      default:
        return null;
    }
  };

  if (!activePost) {
    return <div className="p-6 text-gray-500">Loading post data...</div>;
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full font-sans flex flex-col gap-6">
      <Toast message={toastMsg} />

      <Breadcrumbs
        projectSlug={projectSlug}
        projectTitle={project?.title}
        collectionNum={collectionNumStr}
        collectionTitle={cleanCollectionTitle}
        postNo={activePost.postNo || activePost.PostNo || '1'}
      />

      <PostHeader
        collectionNum={collectionNumStr}
        collectionTitle={cleanCollectionTitle}
        postNo={activePost.postNo || activePost.PostNo || '1'}
        postTitle={activePost.title || activePost.PostTitle || 'Post Title'}
        slideCount={activePost.slides?.length || 0}
        onAddSlide={handleAddSlide}
      />

      <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
        <div className="flex-1 min-w-0 w-full flex flex-col gap-5">
          <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
          <div className="w-full">{renderTabContent()}</div>
        </div>

        <CollectionOverviewCard
          projectSlug={projectSlug}
          collectionNum={collectionNumStr}
          collectionTitle={cleanCollectionTitle}
          palette={palette}
          posts={collectionPosts}
          activePostId={activePost.id || activePost.postNo || '1'}
          onNavigateToPost={(postId) =>
            navigate(`/${projectSlug}/content/collection/${collectionNumStr}/post/${postId}`)
          }
        />
      </div>
    </div>
  );
}
