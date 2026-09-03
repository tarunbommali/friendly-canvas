import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useWorkspaceStore } from '../../shared/stores/useWorkspaceStore';
import { useAuthStore } from '../../shared/stores/useAuthStore';
import data from '../../shared/data/project.json';
import {
  FolderKanban,
  Layers,
  FileText,
  Presentation,
  Plus,
  ArrowRight,
  Trash2,
  ChevronUp,
  ChevronDown,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

// ──────────────────────────────────────────────
// 1. Stats Cards
// ──────────────────────────────────────────────
function StatsCards({
  totalCollections,
  totalPosts,
  totalSlides,
}) {
  const stats = [
    {
      label: 'Total Collections',
      value: totalCollections,
      sub: 'Curriculum & Studio Collections',
      icon: Layers,
      bgColor: 'bg-blue-50 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Total Posts',
      value: totalPosts,
      sub: 'Scoped Post Entities',
      icon: FileText,
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Canvas Slides',
      value: totalSlides,
      sub: 'Isolated JSON Canvas Documents',
      icon: Presentation,
      bgColor: 'bg-purple-50 dark:bg-purple-900/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="bg-white dark:bg-[#151821] border border-[#e2e8f0] dark:border-white/10 rounded-xl p-5 shadow-xs flex items-center gap-4"
          >
            <div
              className={`w-12 h-12 rounded-lg ${stat.bgColor} ${stat.iconColor} flex items-center justify-center shrink-0`}
            >
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-mono text-gray-400 dark:text-slate-500 font-semibold uppercase">
                {stat.label}
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-slate-100">{stat.value}</div>
              <div className="text-[11px] text-gray-400 dark:text-slate-500">{stat.sub}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ──────────────────────────────────────────────
// 2. Project Card
// ──────────────────────────────────────────────
function ProjectCard({
  project,
  index,
  totalProjects,
  onMoveUp,
  onMoveDown,
  onDelete,
  isPrimary,
}) {
  return (
    <div
      className={`bg-white dark:bg-[#151821] border ${
        isPrimary
          ? 'border-blue-200 dark:border-blue-800 shadow-sm'
          : 'border-[#e2e8f0] dark:border-white/10'
      } hover:border-blue-300 dark:hover:border-blue-700 rounded-xl p-6 shadow-xs flex flex-col justify-between transition-all hover:shadow-md`}
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <span
            className={`text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded ${
              isPrimary
                ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                : 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700'
            }`}
          >
            {isPrimary ? 'FLAGSHIP' : 'CUSTOM PROJECT'}
          </span>

          {!isPrimary && (
            <div className="flex items-center gap-1">
              <button
                disabled={index <= 1}
                onClick={onMoveUp}
                className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-slate-200 disabled:opacity-20 cursor-pointer"
                title="Move Up"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <button
                disabled={index === totalProjects - 1}
                onClick={onMoveDown}
                className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-slate-200 disabled:opacity-20 cursor-pointer"
                title="Move Down"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onDelete}
                className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors ml-1 cursor-pointer"
                title="Delete Project"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        <h3 className="text-base font-bold text-gray-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
          <FolderKanban className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <span>{project.title}</span>
        </h3>

        <p className="text-xs text-gray-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
          {project.description || 'Custom project curriculum and isolated slide decks.'}
        </p>

        {/* Palette Swatches Preview */}
        {Array.isArray(project.palettes) && project.palettes.length > 0 && (
          <div className="flex items-center gap-1.5 mt-4">
            {project.palettes.map((p, pIdx) => (
              <div
                key={pIdx}
                className="w-4 h-4 rounded-full border border-gray-200 dark:border-white/10 shadow-2xs"
                style={{ backgroundColor: p.primary || '#2563eb' }}
                title={p.title || `Palette ${pIdx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-[#e2e8f0] dark:border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs font-mono text-gray-500 dark:text-slate-400">
          <span>{project.trackCount || 0} Collections</span>
          <span>•</span>
          <span>{project.postCount || 0} Posts</span>
        </div>

        <Link
          to={`/${project.slug}/content`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
        >
          <span>Open Collections</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// 3. Projects List
// ──────────────────────────────────────────────
function ProjectsList({
  projects,
  onMove,
  onDelete,
  onAddClick,
}) {
  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">Projects in this Workspace</h2>
          <span className="text-xs text-gray-500 dark:text-slate-400 font-mono">
            {projects.length} {projects.length === 1 ? 'Project' : 'Projects'} Active
          </span>
        </div>

        <button
          onClick={onAddClick}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Project</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((proj, idx) => (
          <ProjectCard
            key={proj._id}
            project={proj}
            index={idx}
            totalProjects={projects.length}
            isPrimary={proj.isPrimary || false}
            onMoveUp={() => onMove(idx, 'up')}
            onMoveDown={() => onMove(idx, 'down')}
            onDelete={() => onDelete(proj._id)}
          />
        ))}
      </div>
    </>
  );
}

// ──────────────────────────────────────────────
// 4. Create Project Modal
// ──────────────────────────────────────────────
function CreateProjectModal({
  isOpen,
  onClose,
  onSubmit,
  isCreating,
}) {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    const finalSlug = slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    onSubmit(title.trim(), finalSlug, description.trim());
    setTitle('');
    setSlug('');
    setDescription('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={onClose} />
      <div className="relative bg-white dark:bg-[#151821] border border-[#e2e8f0] dark:border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl z-10 animate-fade-in">
        <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
          <FolderKanban className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span>Create New Project</span>
        </h3>
        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 mb-4">
          Add a new curriculum or content project to this workspace.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
              Project Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Python For Beginners"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-950 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
              Project Slug (optional)
            </label>
            <input
              type="text"
              placeholder="python-beginners"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded-lg text-sm font-mono text-gray-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-950 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Brief summary of collections, chapters, and content goals..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-950 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating || !title}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isCreating ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// 5. Main Page
// ──────────────────────────────────────────────
export default function WorkspaceDashboardPage() {
  const { activeWorkspace, activeRole } = useAuthStore();
  const { projects, loadProjects, createProject, deleteProject, reorderProjects, isLoading } =
    useWorkspaceStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (activeWorkspace?._id) {
      loadProjects(activeWorkspace._id).catch(() => {});
    }
  }, [activeWorkspace, loadProjects]);

  // Derive default flagship SWE.Notebook project from data.json
  const sweProject = useMemo(() => {
    const rawCollections = data.collections || [];
    const rawPosts = data.posts || [];
    const trackCount = rawCollections.length || 20;
    const postCount = rawPosts.length || 100;
    const slideCount = rawPosts.reduce((sum, p) => sum + (p.slides?.length || 0), 0) || 500;

    const palettes = rawCollections.slice(0, 6).map((c) => ({
      name: c.collectionName,
      palette: c.collectionDesign?.palette,
      primary: c.collectionDesign?.primary,
      accent: c.collectionDesign?.accent,
    }));

    return {
      _id: 'swe-notebook-static',
      title: data.name || 'SWE.Notebook',
      slug: data.slug || 'swe-notebook',
      description:
        'Complete Software Engineering Zero to Hero curriculum with 20 Collections, post inspectors, interactive live slide studio, and Fabric.js canvas editor.',
      trackCount,
      postCount,
      slideCount,
      isPrimary: true,
      palettes,
    };
  }, []);

  // Combine SWE.Notebook with any custom database projects
  const allProjects = useMemo(() => {
    const customProjs = projects.filter((p) => p.slug !== 'swe-notebook');
    return [sweProject, ...customProjs];
  }, [sweProject, projects]);

  // Aggregate totals across all projects in workspace
  const totalCollections = allProjects.reduce((sum, p) => sum + (p.trackCount || 0), 0);
  const totalPosts = allProjects.reduce((sum, p) => sum + (p.postCount || 0), 0);
  const totalSlides = allProjects.reduce((sum, p) => sum + (p.slideCount || 0), 0);

  const handleCreateProject = async (title, slug, description) => {
    const wsId = activeWorkspace?._id || 'ws_friendly_01';
    setIsCreating(true);
    try {
      await createProject(wsId, { title, slug, description });
      setIsModalOpen(false);
    } catch (err) {
      alert(err.message || 'Failed to create project');
    } finally {
      setIsCreating(false);
    }
  };

  const handleMove = async (index, direction) => {
    const newIdx = index + (direction === 'up' ? -1 : 1);
    if (newIdx < 1 || newIdx >= allProjects.length) return; // Don't move primary project from index 0
    const customList = [...projects.filter((p) => p.slug !== 'swe-notebook')];
    const customIdx = index - 1;
    const targetCustomIdx = newIdx - 1;

    const [moved] = customList.splice(customIdx, 1);
    customList.splice(targetCustomIdx, 0, moved);
    const orderedIds = customList.map((p) => p._id);
    const wsId = activeWorkspace?._id || 'ws_friendly_01';
    await reorderProjects(wsId, orderedIds);
  };

  const handleDelete = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      await deleteProject(projectId);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans">
      {/* Top Banner & Stats */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#e2e8f0] dark:border-white/10">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 font-sans tracking-tight">
            {activeWorkspace?.name || 'Friendly Workspace'} Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Manage your project curricula, collections, and isolated Instagram carousel canvas studios.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs transition-colors flex items-center gap-2 shadow-sm shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Stats Cards */}
      <StatsCards
        totalCollections={totalCollections}
        totalPosts={totalPosts}
        totalSlides={totalSlides}
      />

      {/* Projects List */}
      <ProjectsList
        projects={allProjects}
        onMove={handleMove}
        onDelete={handleDelete}
        onAddClick={() => setIsModalOpen(true)}
      />

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateProject}
        isCreating={isCreating}
      />
    </div>
  );
}
