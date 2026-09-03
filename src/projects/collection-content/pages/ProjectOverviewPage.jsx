import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Layers,
  FileText,
  Presentation,
  Plus,
  ArrowRight,
  ChevronRight,
  ExternalLink,
  Sparkles,
  GripVertical,
  Filter,
  ArrowUpDown,
  Search,
  Check,
} from 'lucide-react';
import { useProjectData } from '../hooks/useProjectData';
import { useAuthStore } from '../../../shared/stores/useAuthStore';
import { useWorkspaceStore } from '../../../shared/stores/useWorkspaceStore';

export default function ProjectOverviewPage() {
  const { projectSlug = 'swe-notebook' } = useParams();
  const navigate = useNavigate();
  const { activeRole } = useAuthStore();
  const { project, collections } = useProjectData(projectSlug);
  const { createCollection } = useWorkspaceStore();

  const [isAddCollectionOpen, setIsAddCollectionOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionHeadline, setNewCollectionHeadline] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [sortBy, setSortBy] = useState('order'); // 'order' | 'name' | 'posts'

  const totalCollections = collections?.length || 20;
  const totalPosts = collections?.reduce((sum, c) => sum + (c.posts?.length || 0), 0) || 141;
  const totalSlides =
    collections?.reduce(
      (sum, c) => sum + c.posts?.reduce((pSum, p) => pSum + (p.slides?.length || 0), 0),
      0
    ) || 849;

  const filteredCollections = useMemo(() => {
    if (!collections) return [];
    let list = [...collections];

    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      list = list.filter(
        (c) =>
          c.title?.toLowerCase().includes(q) ||
          c.name?.toLowerCase().includes(q) ||
          String(c.collectionNo).includes(q)
      );
    }

    if (sortBy === 'name') {
      list.sort((a, b) => (a.title || a.name).localeCompare(b.title || b.name));
    } else if (sortBy === 'posts') {
      list.sort((a, b) => (b.posts?.length || 0) - (a.posts?.length || 0));
    } else {
      list.sort((a, b) => (a.collectionNo || a.order || 0) - (b.collectionNo || b.order || 0));
    }

    return list;
  }, [collections, searchFilter, sortBy]);

  const handleCreateCollection = async (e) => {
    e.preventDefault();
    if (!newCollectionName) return;
    const nextNo = String((collections?.length || 0) + 1).padStart(2, '0');
    try {
      await createCollection(project?.id || 'swe-notebook', {
        collectionKey: nextNo,
        name: `Collection ${nextNo} — ${newCollectionName.trim()}`,
        cover: { headline: newCollectionHeadline || newCollectionName.trim(), text: '' },
      });
      setIsAddCollectionOpen(false);
      setNewCollectionName('');
      setNewCollectionHeadline('');
    } catch (err) {
      alert(err.message || 'Failed to create collection');
    }
  };

  const isAdmin = activeRole === 'admin' || activeRole === 'editor';

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans">
      {/* Top Context Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-mono text-gray-500 dark:text-slate-400 mb-4">
        <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          Projects
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500" />
        <span className="text-gray-900 dark:text-slate-100 font-semibold">{project?.title || 'SWE Engineering'}</span>
        <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-mono text-[10px] font-bold border border-blue-200 dark:border-blue-700">
          Curriculum Overview
        </span>
      </div>

      {/* Project Header & Stats Bento Row */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#e2e8f0] dark:border-white/10 mb-6">
        <div className="max-w-3xl">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 tracking-tight mb-2">
            {project?.title || 'SWE Engineering Handbook'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 max-w-2xl leading-relaxed mb-5">
            {project?.description ||
              'Comprehensive curriculum covering software engineering fundamentals, system design architecture, and modern development practices with isolated carousel studios.'}
          </p>

          {/* Stats Bento Row */}
          <div className="flex flex-wrap gap-3">
            <div className="bg-white dark:bg-[#151821] border border-[#e2e8f0] dark:border-white/10 rounded-xl px-4 py-3 min-w-[120px] shadow-xs">
              <span className="text-[10px] font-mono font-bold uppercase text-gray-400 dark:text-slate-500 tracking-wider block mb-1">
                COLLECTIONS
              </span>
              <span className="text-xl font-bold text-gray-900 dark:text-slate-100 font-sans">{totalCollections}</span>
            </div>

            <div className="bg-white dark:bg-[#151821] border border-[#e2e8f0] dark:border-white/10 rounded-xl px-4 py-3 min-w-[120px] shadow-xs">
              <span className="text-[10px] font-mono font-bold uppercase text-gray-400 dark:text-slate-500 tracking-wider block mb-1">
                POSTS
              </span>
              <span className="text-xl font-bold text-gray-900 dark:text-slate-100 font-sans">{totalPosts}</span>
            </div>

            <div className="bg-white dark:bg-[#151821] border border-[#e2e8f0] dark:border-white/10 rounded-xl px-4 py-3 min-w-[120px] shadow-xs">
              <span className="text-[10px] font-mono font-bold uppercase text-gray-400 dark:text-slate-500 tracking-wider block mb-1">
                CANVAS SLIDES
              </span>
              <span className="text-xl font-bold text-gray-900 dark:text-slate-100 font-sans">{totalSlides}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {isAdmin && (
            <button
              onClick={() => setIsAddCollectionOpen(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Collection</span>
            </button>
          )}
        </div>
      </section>

      {/* Collections Controls & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">Course Collections</h2>
          <span className="text-xs font-mono text-gray-500 dark:text-slate-400">({filteredCollections.length} Active)</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter collections..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-white dark:bg-[#151821] border border-[#e2e8f0] dark:border-white/10 rounded-lg text-xs text-gray-800 dark:text-slate-200 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 w-48 shadow-xs"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 bg-white dark:bg-[#151821] border border-[#e2e8f0] dark:border-white/10 rounded-lg text-xs text-gray-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono shadow-xs cursor-pointer"
          >
            <option value="order" className="dark:bg-slate-900">Sort: Sequential</option>
            <option value="name" className="dark:bg-slate-900">Sort: Name (A-Z)</option>
            <option value="posts" className="dark:bg-slate-900">Sort: Most Posts</option>
          </select>
        </div>
      </div>

      {/* Dense Collection List */}
      <div className="flex flex-col gap-2.5">
        {filteredCollections.map((collection, idx) => {
          const collectionNo = collection.collectionNo || idx + 1;
          const cleanTitle = (collection.title || collection.name || '').replace(/^Collection \d+\s*—\s*/, '');
          const collectionPosts = collection.posts || [];
          const postCount = collectionPosts.length;
          const slideCount = collectionPosts.reduce((s, p) => s + (p.slides?.length || 0), 0);
          const palette = collection.palette || { primary: '#2563eb', accent: '#93c5fd' };

          return (
            <div
              key={collection.id || idx}
              className="group flex flex-col md:flex-row md:items-center justify-between bg-white dark:bg-[#151821] hover:border-blue-300 dark:hover:border-blue-600 border border-[#e2e8f0] dark:border-white/10 rounded-xl px-5 py-4 min-h-[72px] gap-4 transition-all shadow-xs hover:shadow-sm"
            >
              <div className="flex items-center gap-4 min-w-0 flex-1">
                {/* Drag / Sort Indicator */}
                <div className="text-gray-300 dark:text-slate-600 group-hover:text-gray-500 dark:group-hover:text-slate-400 shrink-0">
                  <GripVertical className="w-4 h-4" />
                </div>

                {/* Collection Number */}
                <div className="w-9 h-9 rounded-lg bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-white/10 flex items-center justify-center font-mono text-xs font-bold text-gray-700 dark:text-slate-300 shrink-0">
                  {String(collectionNo).padStart(2, '0')}
                </div>

                {/* Palette Dot & Title */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs border border-white dark:border-slate-800"
                    style={{ backgroundColor: palette.primary }}
                    title={`Palette: ${palette.name || 'Primary'}`}
                  />
                  <div className="flex flex-col min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {cleanTitle}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-slate-400 truncate mt-0.5">
                      {collection.collectionDescription || `${postCount} curated lesson posts and visual carousels.`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Metadata Cluster & Actions */}
              <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end pt-2 md:pt-0 border-t md:border-t-0 border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-2 text-xs font-mono text-gray-600 dark:text-slate-400">
                  <span className="bg-gray-100 dark:bg-slate-900 px-2.5 py-1 rounded border border-transparent dark:border-white/5">
                    {postCount} Posts
                  </span>
                  <span className="bg-gray-100 dark:bg-slate-900 px-2.5 py-1 rounded border border-transparent dark:border-white/5">
                    {slideCount} Slides
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const collectionPad = String(collection.collectionNo || collection.id || idx + 1).padStart(2, '0');
                      navigate(`/${projectSlug}/content/collection/${collectionPad}`);
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-600 dark:hover:bg-blue-600 text-blue-700 dark:text-blue-300 hover:text-white dark:hover:text-white border border-blue-200 dark:border-blue-700/50 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>View Posts</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Collection Modal */}
      {isAddCollectionOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#151821] border border-gray-200 dark:border-white/10 rounded-xl max-w-md w-full p-6 shadow-2xl animate-fade-in">
            <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-1">Add New Course Collection</h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">
              Add a new curriculum collection to {project?.title || 'SWE Engineering Handbook'}.
            </p>

            <form onSubmit={handleCreateCollection} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Collection Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Systems &amp; Consensus"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-white/10 rounded-lg text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-950"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                  Headline / Objective
                </label>
                <input
                  type="text"
                  placeholder="e.g. Master Raft, Paxos, and Partition Tolerance"
                  value={newCollectionHeadline}
                  onChange={(e) => setNewCollectionHeadline(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-white/10 rounded-lg text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-950"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddCollectionOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition shadow-sm cursor-pointer"
                >
                  Create Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
