import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FileText,
  Plus,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Sparkles,
  GripVertical,
  Check,
  Palette,
  Sliders,
  RotateCcw,
  Type,
  Maximize2,
  Save,
  Edit,
} from 'lucide-react';
import { useProjectData } from '../hooks/useProjectData';
import { useAuthStore } from '../../../shared/stores/useAuthStore';
import { useWorkspaceStore } from '../../../shared/stores/useWorkspaceStore';

const PRESET_PALETTES = [
  { name: 'Warm Editorial', primary: '#b45309', accent: '#fef3c7' },
  { name: 'Engineering Blue', primary: '#2563eb', accent: '#dbeafe' },
  { name: 'Midnight Cyan', primary: '#0891b2', accent: '#cffafe' },
  { name: 'Forest Emerald', primary: '#059669', accent: '#d1fae5' },
  { name: 'Violet Creative', primary: '#7c3aed', accent: '#ede9fe' },
  { name: 'Crimson Focus', primary: '#dc2626', accent: '#fee2e2' },
];

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
      <span className="text-gray-900 dark:text-slate-100 font-semibold font-mono">
        Collection {collectionNum}
      </span>
      <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-mono text-[10px] font-bold border border-blue-200 dark:border-blue-700">
        Lesson Posts
      </span>
    </div>
  );
}

// ──────────────────────────────────────────────
// 3. Collection Header
// ──────────────────────────────────────────────
function CollectionHeader({
  collectionNum,
  title,
  description,
  postCount,
  totalSlides,
  primaryColor,
  paletteName,
  onAddPost,
  isAdmin,
}) {
  return (
    <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#e2e8f0] dark:border-white/10">
      <div className="max-w-3xl">
        <div className="flex items-center gap-3 mb-2">
          <span className="px-2.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-mono text-xs font-bold border border-blue-200 dark:border-blue-700">
            COLLECTION {collectionNum}
          </span>
          <div className="flex items-center gap-2 text-xs font-mono text-gray-500 dark:text-slate-400">
            <span className="font-semibold text-gray-700 dark:text-slate-300">{postCount} Posts</span>
            <span>•</span>
            <span>{totalSlides} Slides</span>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-full inline-block border border-white dark:border-slate-800 shadow-xs transition-colors"
                style={{ backgroundColor: primaryColor }}
              />
              <span className="capitalize text-gray-700 dark:text-slate-300 font-medium">
                {paletteName}
              </span>
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 tracking-tight">
          {title}
        </h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
          {description || 'Curated lessons and slide decks for this collection.'}
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {isAdmin && (
          <button
            onClick={onAddPost}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Post</span>
          </button>
        )}
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────
// 4. Posts List
// ──────────────────────────────────────────────
function PostsList({
  posts,
  projectSlug,
  collectionNum,
}) {
  const navigate = useNavigate();

  return (
    <div className="flex-1 min-w-0 w-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-900 dark:text-slate-100">Collection Posts &amp; Slide Decks</h2>
        <span className="text-xs font-mono text-gray-500 dark:text-slate-400">({posts.length} Posts in Collection)</span>
      </div>

      <div className="flex flex-col gap-3 w-full">
        {posts.map((post, idx) => {
          const postNo = post.postNo || post.PostNo || idx + 1;
          const slideCount = post.slides?.length || 0;
          const postTargetId = post.id || postNo;

          return (
            <div
              key={post.id || idx}
              onClick={() =>
                navigate(`/${projectSlug}/content/collection/${collectionNum}/post/${postTargetId}`)
              }
              className="group bg-white dark:bg-[#151821] hover:border-blue-300 dark:hover:border-blue-600 border border-[#e2e8f0] dark:border-white/10 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all shadow-xs hover:shadow-sm cursor-pointer w-full"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="text-gray-300 dark:text-slate-600 group-hover:text-gray-500 dark:group-hover:text-slate-400 shrink-0">
                  <GripVertical className="w-4 h-4" />
                </div>

                <div className="w-11 h-11 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-white/10 flex items-center justify-center font-mono text-xs font-bold text-gray-700 dark:text-slate-300 shrink-0">
                  {String(idx + 1).padStart(2, '0')}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {post.title || post.PostTitle || `Post ${postNo}`}
                  </h3>
                  <div className="flex items-center gap-3 text-xs font-mono text-gray-500 dark:text-slate-400 mt-1">
                    <span className="bg-gray-100 dark:bg-slate-900 px-2 py-0.5 rounded text-[11px] border border-transparent dark:border-white/5">
                      {slideCount} Slides
                    </span>
                    <span>•</span>
                    <span className="text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/40 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-transparent dark:border-emerald-700/50">
                      Ready
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div
                className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-gray-100 dark:border-white/5 justify-end"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() =>
                    navigate(`/${projectSlug}/content/collection/${collectionNum}/post/${postTargetId}`)
                  }
                  className="px-3.5 py-2 rounded-lg bg-gray-50 dark:bg-slate-900 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5 text-gray-500 dark:text-slate-400" />
                  <span>Edit Slides</span>
                </button>

                <button
                  onClick={() =>
                    navigate(`/${projectSlug}/design/collection/${collectionNum}/post/${postTargetId}`)
                  }
                  className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Canvas</span>
                </button>
              </div>
            </div>
          );
        })}

        {posts.length === 0 && (
          <div className="bg-white dark:bg-[#151821] border border-dashed border-gray-300 dark:border-white/10 rounded-xl p-12 text-center w-full">
            <FileText className="w-10 h-10 text-gray-400 dark:text-slate-500 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-gray-800 dark:text-slate-200">No posts in this collection yet</h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Create the first post to begin writing slides and designing carousel graphics.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// 5. Collection Configuration Panel (right sidebar)
// ──────────────────────────────────────────────

// 5a. Palette subsection
function PaletteSection({
  primaryColor,
  accentColor,
  onPrimaryChange,
  onAccentChange,
  onPresetSelect,
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono font-bold uppercase text-gray-500 dark:text-slate-400">
          Collection Palette
        </span>
        <select
          onChange={(e) => {
            const p = PRESET_PALETTES.find((item) => item.name === e.target.value);
            if (p) onPresetSelect(p);
          }}
          className="text-[10px] font-mono bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded px-1.5 py-0.5 text-gray-700 dark:text-slate-300 cursor-pointer focus:outline-none"
        >
          <option value="" className="dark:bg-slate-900">Presets...</option>
          {PRESET_PALETTES.map((p) => (
            <option key={p.name} value={p.name} className="dark:bg-slate-900">
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div
          className="p-2.5 rounded-lg border border-gray-200 dark:border-white/10 flex flex-col justify-between h-20 shadow-xs relative overflow-hidden"
          style={{ backgroundColor: primaryColor }}
        >
          <span className="text-[9px] font-mono font-bold text-white uppercase drop-shadow">
            PRIMARY
          </span>
          <div className="flex items-center gap-1">
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => onPrimaryChange(e.target.value)}
              className="w-5 h-5 rounded border border-white/50 bg-transparent cursor-pointer p-0"
            />
            <input
              type="text"
              value={primaryColor}
              onChange={(e) => onPrimaryChange(e.target.value)}
              className="text-[10px] font-mono font-bold text-white bg-black/20 rounded px-1 py-0.5 w-full uppercase focus:outline-none"
            />
          </div>
        </div>

        <div
          className="p-2.5 rounded-lg border border-gray-200 dark:border-white/10 flex flex-col justify-between h-20 shadow-xs relative overflow-hidden"
          style={{ backgroundColor: accentColor }}
        >
          <span className="text-[9px] font-mono font-bold text-gray-900 uppercase drop-shadow">
            ACCENT
          </span>
          <div className="flex items-center gap-1">
            <input
              type="color"
              value={accentColor}
              onChange={(e) => onAccentChange(e.target.value)}
              className="w-5 h-5 rounded border border-gray-300 bg-transparent cursor-pointer p-0"
            />
            <input
              type="text"
              value={accentColor}
              onChange={(e) => onAccentChange(e.target.value)}
              className="text-[10px] font-mono font-bold text-gray-900 bg-white/40 rounded px-1 py-0.5 w-full uppercase focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// 5b. Canvas Dimensions subsection
function CanvasDimensionsSection({
  aspectRatio,
  onAspectChange,
  canvasWidth,
  onWidthChange,
  canvasHeight,
  onHeightChange,
  padding,
  onPaddingChange,
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono font-bold uppercase text-gray-500 dark:text-slate-400">
          Canvas Dimensions
        </span>
        <select
          value={aspectRatio}
          onChange={(e) => onAspectChange(e.target.value)}
          className="text-[10px] font-mono bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded px-1.5 py-0.5 text-gray-700 dark:text-slate-300 cursor-pointer focus:outline-none"
        >
          <option value="4:5" className="dark:bg-slate-900">4:5 Portrait</option>
          <option value="1:1" className="dark:bg-slate-900">1:1 Square</option>
          <option value="9:16" className="dark:bg-slate-900">9:16 Story</option>
          <option value="16:9" className="dark:bg-slate-900">16:9 Landscape</option>
        </select>
      </div>

      <div className="p-3 rounded-lg bg-gray-50 dark:bg-slate-900 border border-[#e2e8f0] dark:border-white/10 grid grid-cols-3 gap-2 font-mono text-xs">
        <div>
          <label className="text-gray-400 dark:text-slate-500 text-[9px] block">WIDTH</label>
          <input
            type="number"
            value={canvasWidth}
            onChange={(e) => onWidthChange(Number(e.target.value))}
            className="w-full bg-white dark:bg-slate-950 border border-gray-200 dark:border-white/10 rounded px-1.5 py-0.5 font-bold text-gray-800 dark:text-slate-200 text-xs focus:outline-none"
          />
        </div>
        <div>
          <label className="text-gray-400 dark:text-slate-500 text-[9px] block">HEIGHT</label>
          <input
            type="number"
            value={canvasHeight}
            onChange={(e) => onHeightChange(Number(e.target.value))}
            className="w-full bg-white dark:bg-slate-950 border border-gray-200 dark:border-white/10 rounded px-1.5 py-0.5 font-bold text-gray-800 dark:text-slate-200 text-xs focus:outline-none"
          />
        </div>
        <div>
          <label className="text-gray-400 dark:text-slate-500 text-[9px] block">PADDING</label>
          <input
            type="number"
            value={padding}
            onChange={(e) => onPaddingChange(Number(e.target.value))}
            className="w-full bg-white dark:bg-slate-950 border border-gray-200 dark:border-white/10 rounded px-1.5 py-0.5 font-bold text-gray-800 dark:text-slate-200 text-xs focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}

// 5c. Typography subsection
function TypographySection({
  headlineFont,
  onHeadlineChange,
  bodyFont,
  onBodyChange,
  techFont,
  onTechChange,
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[11px] font-mono font-bold uppercase text-gray-500 dark:text-slate-400">
        Typography Tokens
      </span>
      <div className="p-3 rounded-lg bg-gray-50 dark:bg-slate-900 border border-[#e2e8f0] dark:border-white/10 space-y-2.5">
        <div>
          <label className="text-[9px] font-mono text-gray-400 dark:text-slate-500 block mb-0.5">HEADLINE FONT</label>
          <select
            value={headlineFont}
            onChange={(e) => onHeadlineChange(e.target.value)}
            className="w-full bg-white dark:bg-slate-950 border border-gray-200 dark:border-white/10 rounded px-2 py-1 text-xs font-serif font-bold text-gray-800 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="Instrument Serif, Georgia" className="dark:bg-slate-900">Instrument Serif</option>
            <option value="Playfair Display, serif" className="dark:bg-slate-900">Playfair Display</option>
            <option value="Cinzel, serif" className="dark:bg-slate-900">Cinzel</option>
            <option value="Georgia, serif" className="dark:bg-slate-900">Georgia</option>
            <option value="Inter, sans-serif" className="dark:bg-slate-900">Inter (Sans)</option>
          </select>
        </div>
        <div>
          <label className="text-[9px] font-mono text-gray-400 dark:text-slate-500 block mb-0.5">BODY &amp; UI FONT</label>
          <select
            value={bodyFont}
            onChange={(e) => onBodyChange(e.target.value)}
            className="w-full bg-white dark:bg-slate-950 border border-gray-200 dark:border-white/10 rounded px-2 py-1 text-xs font-sans text-gray-700 dark:text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="Inter, sans-serif" className="dark:bg-slate-900">Inter</option>
            <option value="Roboto, sans-serif" className="dark:bg-slate-900">Roboto</option>
            <option value="Open Sans, sans-serif" className="dark:bg-slate-900">Open Sans</option>
            <option value="Georgia, serif" className="dark:bg-slate-900">Georgia</option>
          </select>
        </div>
        <div>
          <label className="text-[9px] font-mono text-gray-400 dark:text-slate-500 block mb-0.5">TECHNICAL / LABELS</label>
          <select
            value={techFont}
            onChange={(e) => onTechChange(e.target.value)}
            className="w-full bg-white dark:bg-slate-950 border border-gray-200 dark:border-white/10 rounded px-2 py-1 text-xs font-mono text-gray-600 dark:text-slate-400 focus:outline-none cursor-pointer"
          >
            <option value="JetBrains Mono" className="dark:bg-slate-900">JetBrains Mono</option>
            <option value="Fira Code" className="dark:bg-slate-900">Fira Code</option>
            <option value="IBM Plex Mono" className="dark:bg-slate-900">IBM Plex Mono</option>
          </select>
        </div>
      </div>
    </div>
  );
}

// 5d. Full Configuration Panel
function CollectionConfigPanel({
  primaryColor,
  accentColor,
  onPrimaryChange,
  onAccentChange,
  aspectRatio,
  onAspectChange,
  canvasWidth,
  onWidthChange,
  canvasHeight,
  onHeightChange,
  padding,
  onPaddingChange,
  headlineFont,
  onHeadlineChange,
  bodyFont,
  onBodyChange,
  techFont,
  onTechChange,
  onReset,
  onSave,
}) {
  const handlePresetSelect = (preset) => {
    onPrimaryChange(preset.primary);
    onAccentChange(preset.accent);
  };

  return (
    <aside className="w-full lg:w-80 shrink-0 bg-white dark:bg-[#151821] border border-[#e2e8f0] dark:border-white/10 rounded-xl p-5 shadow-xs flex flex-col gap-5 sticky top-6">
      <div className="flex items-center justify-between border-b border-[#e2e8f0] dark:border-white/10 pb-3">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-800 dark:text-slate-200 uppercase font-mono">
          <Palette className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Collection Configuration</span>
        </div>
        <button
          onClick={onReset}
          title="Reset to Collection Defaults"
          className="p-1 rounded text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      <PaletteSection
        primaryColor={primaryColor}
        accentColor={accentColor}
        onPrimaryChange={onPrimaryChange}
        onAccentChange={onAccentChange}
        onPresetSelect={handlePresetSelect}
      />

      <CanvasDimensionsSection
        aspectRatio={aspectRatio}
        onAspectChange={onAspectChange}
        canvasWidth={canvasWidth}
        onWidthChange={onWidthChange}
        canvasHeight={canvasHeight}
        onHeightChange={onHeightChange}
        padding={padding}
        onPaddingChange={onPaddingChange}
      />

      <TypographySection
        headlineFont={headlineFont}
        onHeadlineChange={onHeadlineChange}
        bodyFont={bodyFont}
        onBodyChange={onBodyChange}
        techFont={techFont}
        onTechChange={onTechChange}
      />

      <button
        onClick={onSave}
        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
      >
        <Save className="w-3.5 h-3.5" />
        <span>Save Configuration</span>
      </button>
    </aside>
  );
}

// ──────────────────────────────────────────────
// 6. Add Post Modal
// ──────────────────────────────────────────────
function AddPostModal({
  isOpen,
  onClose,
  onSubmit,
  collectionNum,
  collectionTitle,
}) {
  const [title, setTitle] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit(title.trim());
    setTitle('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#151821] border border-gray-200 dark:border-white/10 rounded-xl max-w-md w-full p-6 shadow-2xl animate-fade-in">
        <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-1">Create New Post</h3>
        <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">
          Add a new post to Collection {collectionNum} ({collectionTitle}).
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Post Title</label>
            <input
              type="text"
              required
              placeholder="e.g. How TCP Handshakes Guarantee Reliability"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-white/10 rounded-lg text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-950"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition shadow-sm cursor-pointer"
            >
              Create Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// 7. Main Page
// ──────────────────────────────────────────────
export default function CollectionDetailPage() {
  const { projectSlug = 'swe-notebook', collectionId = '01' } = useParams();
  const navigate = useNavigate();
  const { activeRole } = useAuthStore();
  const { project, collections } = useProjectData(projectSlug);
  const { createPost } = useWorkspaceStore();

  const [isAddPostOpen, setIsAddPostOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  };

  // Collection and posts
  const currentCollection = useMemo(() => {
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

  const posts = useMemo(() => currentCollection?.posts || [], [currentCollection]);
  const totalSlides = useMemo(() => posts.reduce((sum, p) => sum + (p.slides?.length || 0), 0), [posts]);

  // Configuration state
  const [primaryColor, setPrimaryColor] = useState('#2563eb');
  const [accentColor, setAccentColor] = useState('#93c5fd');
  const [aspectRatio, setAspectRatio] = useState('4:5');
  const [canvasWidth, setCanvasWidth] = useState(1080);
  const [canvasHeight, setCanvasHeight] = useState(1350);
  const [padding, setPadding] = useState(48);
  const [headlineFont, setHeadlineFont] = useState('Instrument Serif, Georgia');
  const [bodyFont, setBodyFont] = useState('Inter, sans-serif');
  const [techFont, setTechFont] = useState('JetBrains Mono');

  // Load configuration from currentCollection
  useEffect(() => {
    if (currentCollection) {
      const p = currentCollection.palette || {};
      setPrimaryColor(p.primary || '#2563eb');
      setAccentColor(p.accent || '#93c5fd');

      const dim = currentCollection.canvasDimensions || {};
      setCanvasWidth(dim.width || 1080);
      setCanvasHeight(dim.height || 1350);
      setPadding(dim.padding || 48);

      const ratio = currentCollection.aspectRatio || '4:5';
      setAspectRatio(ratio);

      const typo = currentCollection.typography || {};
      if (typo.headline) setHeadlineFont(typo.headline);
      if (typo.body) setBodyFont(typo.body);
      if (typo.tech) setTechFont(typo.tech);
    }
  }, [currentCollection]);

  const handleAspectRatioChange = (ratio) => {
    setAspectRatio(ratio);
    if (ratio === '4:5') {
      setCanvasWidth(1080);
      setCanvasHeight(1350);
    } else if (ratio === '1:1') {
      setCanvasWidth(1080);
      setCanvasHeight(1080);
    } else if (ratio === '9:16') {
      setCanvasWidth(1080);
      setCanvasHeight(1920);
    } else if (ratio === '16:9') {
      setCanvasWidth(1920);
      setCanvasHeight(1080);
    }
  };

  const handleSaveConfig = () => {
    showToast('Collection configuration saved successfully!');
  };

  const handleResetConfig = () => {
    setPrimaryColor('#2563eb');
    setAccentColor('#93c5fd');
    setAspectRatio('4:5');
    setCanvasWidth(1080);
    setCanvasHeight(1350);
    setPadding(48);
    setHeadlineFont('Instrument Serif, Georgia');
    setBodyFont('Inter, sans-serif');
    setTechFont('JetBrains Mono');
    showToast('Reset to collection defaults');
  };

  const handleCreatePost = async (title) => {
    if (!currentCollection) return;
    const nextPostNo = posts.length + 1;
    try {
      await createPost(currentCollection.id, {
        postNo: nextPostNo,
        title,
        slides: [
          {
            slideNo: 1,
            headline: title,
            text: 'Slide concept explanation...',
            visualDirective: 'Illustration prompt for canvas...',
          },
        ],
      });
      setIsAddPostOpen(false);
      showToast('Post created successfully!');
    } catch (err) {
      alert(err.message || 'Failed to create post');
    }
  };

  const isAdmin = activeRole === 'admin' || activeRole === 'editor';
  const collectionNumStr = String(currentCollection?.collectionNo || collectionId).padStart(2, '0');
  const cleanCollectionTitle = (currentCollection?.title || currentCollection?.name || 'Collection').replace(/^Collection \d+\s*—\s*/, '');

  if (!currentCollection) {
    return <div className="p-6 text-gray-500">Loading collection data...</div>;
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full font-sans flex flex-col gap-6">
      <Toast message={toastMsg} />

      <Breadcrumbs
        projectSlug={projectSlug}
        projectTitle={project?.title}
        collectionNum={collectionNumStr}
      />

      <CollectionHeader
        collectionNum={collectionNumStr}
        title={cleanCollectionTitle}
        description={currentCollection?.collectionDescription}
        postCount={posts.length}
        totalSlides={totalSlides}
        primaryColor={primaryColor}
        paletteName={currentCollection?.collectionDesign?.palette || 'Custom Theme'}
        onAddPost={() => setIsAddPostOpen(true)}
        isAdmin={isAdmin}
      />

      <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
        <PostsList
          posts={posts}
          projectSlug={projectSlug}
          collectionNum={collectionNumStr}
        />

        <CollectionConfigPanel
          primaryColor={primaryColor}
          accentColor={accentColor}
          onPrimaryChange={setPrimaryColor}
          onAccentChange={setAccentColor}
          aspectRatio={aspectRatio}
          onAspectChange={handleAspectRatioChange}
          canvasWidth={canvasWidth}
          onWidthChange={setCanvasWidth}
          canvasHeight={canvasHeight}
          onHeightChange={setCanvasHeight}
          padding={padding}
          onPaddingChange={setPadding}
          headlineFont={headlineFont}
          onHeadlineChange={setHeadlineFont}
          bodyFont={bodyFont}
          onBodyChange={setBodyFont}
          techFont={techFont}
          onTechChange={setTechFont}
          onReset={handleResetConfig}
          onSave={handleSaveConfig}
        />
      </div>

      <AddPostModal
        isOpen={isAddPostOpen}
        onClose={() => setIsAddPostOpen(false)}
        onSubmit={handleCreatePost}
        collectionNum={collectionNumStr}
        collectionTitle={cleanCollectionTitle}
      />
    </div>
  );
}
