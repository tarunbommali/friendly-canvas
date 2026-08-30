import { useState } from 'react'
import { useNavigate, useOutletContext, Link } from 'react-router-dom'
import {
  Folder,
  Plus,
  ArrowRight,
  Palette,
  Layers,
  Sparkles,
  Zap,
  Trash2,
  X,
} from 'lucide-react'
import CarouselLogoBadge from '../../../workspace/CarouselLogoBadge'
import { customPostsRepo } from '../../../infrastructure/persistence/localStorageRepository'

const PROJECTS_STORAGE_KEY = 'carousel-workspace-projects'

export default function HomePage() {
  const navigate = useNavigate()
  const { tracks = [], posts = [] } = useOutletContext()
  const customPosts = (customPostsRepo.get && customPostsRepo.get()) || []

  const [customProjects, setCustomProjects] = useState(() => {
    try {
      const saved = localStorage.getItem(PROJECTS_STORAGE_KEY)
      if (saved) return JSON.parse(saved)
    } catch (e) {
      console.error('Failed to parse custom projects:', e)
    }
    return []
  })

  const [showNewProjectModal, setShowNewProjectModal] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDesc, setNewProjectDesc] = useState('')
  const [newProjectCategory, setNewProjectCategory] = useState('Tech & Engineering')
  const [toastMsg, setToastMsg] = useState('')

  const showToast = (msg) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 3000)
  }

  const handleCreateProject = (e) => {
    e.preventDefault()
    if (!newProjectName.trim()) return

    const newProj = {
      id: `proj_${Date.now().toString(36)}`,
      name: newProjectName,
      description: newProjectDesc || 'Custom visual carousel project.',
      category: newProjectCategory,
      tracksCount: 5,
      postsCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const updated = [newProj, ...customProjects]
    setCustomProjects(updated)
    try {
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(updated))
    } catch (err) {
      console.error(err)
    }

    setNewProjectName('')
    setNewProjectDesc('')
    setShowNewProjectModal(false)
    showToast(`Created project "${newProj.name}"!`)
    navigate('/design')
  }

  const handleDeleteProject = (projId, name) => {
    if (confirm(`Delete project "${name}"?`)) {
      const updated = customProjects.filter((p) => p.id !== projId)
      setCustomProjects(updated)
      try {
        localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(updated))
      } catch (err) {
        console.error(err)
      }
      showToast(`Deleted project "${name}".`)
    }
  }

  const totalProjects = 1 + customProjects.length
  const totalSlidesCount = posts.reduce((acc, p) => acc + (p.Slides?.length || 7), 0)

  return (
    <div className="flex flex-col gap-10 select-none max-w-7xl mx-auto py-2">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-cyan-500 text-slate-950 font-bold text-xs rounded-full shadow-2xl animate-fade-in flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 fill-current" /> {toastMsg}
        </div>
      )}

      {/* ── WORKSPACE HEADER ── */}
      <section className="relative overflow-hidden p-6 md:p-10 rounded-3xl bg-linear-to-br from-[#181c28] via-[#12151e] to-[#0c0e14] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        <div className="flex items-start gap-4">
          <CarouselLogoBadge size={52} />
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="font-serif font-black text-3xl md:text-4xl text-white tracking-tight m-0">
                Workspace
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-400/30">
                {totalProjects} {totalProjects === 1 ? 'Project' : 'Projects'} Active
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-400 font-sans max-w-2xl m-0 leading-relaxed">
              Manage your visual carousel projects, curriculum tracks, and editorial content with high-res PNG downloads and AI prompt generation.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <button
            type="button"
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
            onClick={() => setShowNewProjectModal(true)}
          >
            <Plus className="w-4 h-4 text-cyan-400" /> New Project
          </button>

          <button
            type="button"
            className="px-5 py-2.5 rounded-xl bg-linear-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-cyan-500/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('/design')}
          >
            <Sparkles className="w-4 h-4 fill-slate-950" /> + Create Carousel
          </button>
        </div>
      </section>

      {/* ── METRICS STRIP ── */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-[#141721] border border-white/10 flex flex-col gap-1">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Total Projects</span>
          <span className="text-xl md:text-2xl font-bold font-serif text-white">{totalProjects}</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#141721] border border-white/10 flex flex-col gap-1">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-400">SWE.notebook Tracks</span>
          <span className="text-xl md:text-2xl font-bold font-serif text-cyan-300">{tracks.length} Tracks</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#141721] border border-white/10 flex flex-col gap-1">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Master Carousels</span>
          <span className="text-xl md:text-2xl font-bold font-serif text-yellow-300">{posts.length + customPosts.length} Posts</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#141721] border border-white/10 flex flex-col gap-1">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Stored Slides</span>
          <span className="text-xl md:text-2xl font-bold font-serif text-purple-300">{totalSlidesCount}+ Slides</span>
        </div>
      </section>


      {/* ── RECENT CAROUSEL DRAFTS (From PostBuilder) ── */}
      {customPosts.length > 0 && (
        <section className="flex flex-col gap-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="font-serif font-bold text-lg md:text-xl text-white tracking-tight m-0 flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" /> Recent Carousel Drafts
            </h2>
            <Link
              to="/design"
              className="text-xs text-cyan-400 hover:text-cyan-300 font-bold no-underline flex items-center gap-1"
            >
              + New Carousel
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {customPosts.map((post) => (
              <div
                key={post.id}
                className="p-4 rounded-2xl bg-[#141721] border border-white/10 hover:border-cyan-400/40 transition-all flex flex-col justify-between gap-3 cursor-pointer"
                onClick={() => navigate(`/design/${post.id}`)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    {post.slides?.length || 0} Slides
                  </span>
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: post.trackColor?.primary || '#06b6d4' }}
                  />
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white m-0 truncate">
                    {post.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 m-0 mt-0.5 truncate">
                    {post.trackName || 'Custom Carousel'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px] font-mono text-slate-500">
                  <span>Updated {new Date(post.updatedAt || post.createdAt).toLocaleDateString()}</span>
                  <span className="text-cyan-400 font-bold flex items-center gap-0.5">
                    Edit <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── CREATE PROJECT MODAL ── */}
      {showNewProjectModal && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowNewProjectModal(false)}
        >
          <div
            className="bg-[#141721] border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white m-0 flex items-center gap-2">
                <Folder className="w-4 h-4 text-cyan-400" /> Create New Project
              </h3>
              <button
                type="button"
                className="text-slate-400 hover:text-white cursor-pointer"
                onClick={() => setShowNewProjectModal(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Project Title
                </label>
                <input
                  type="text"
                  required
                  className="bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  placeholder="e.g. Distributed Systems Masterclass"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Category / Domain
                </label>
                <select
                  className="bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  value={newProjectCategory}
                  onChange={(e) => setNewProjectCategory(e.target.value)}
                >
                  <option value="Tech & Engineering">Tech & Engineering</option>
                  <option value="System Design">System Design</option>
                  <option value="AI & Machine Learning">AI & Machine Learning</option>
                  <option value="Web & Cloud">Web & Cloud</option>
                  <option value="Algorithms & Data Structures">Algorithms & Data Structures</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Description
                </label>
                <textarea
                  className="bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:border-cyan-400 focus:outline-none resize-none font-sans"
                  rows={3}
                  placeholder="Brief description of this carousel project series..."
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold cursor-pointer"
                  onClick={() => setShowNewProjectModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newProjectName.trim()}
                  className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1"
                >
                  Create & Launch Studio <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* ── PROJECTS   LIST ── */}
      <section className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif font-bold text-xl md:text-2xl text-white tracking-tight m-0">
              Projects
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 m-0">
              Content management workspaces with track curriculum, posts, and visual layouts.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 🌟 1. FLAGSHIP PROJECT: SWE.notebook */}
          <div className="group relative rounded-3xl bg-linear-to-br from-[#161a26] via-[#12151e] to-[#0c0e14] border-2 border-cyan-500/30 hover:border-cyan-400/60 p-6 md:p-7 shadow-2xl transition-all duration-200 flex flex-col justify-between gap-6">
            <div className="flex flex-col gap-4">
              {/* Header Badge */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <CarouselLogoBadge size={44} />
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-400/30">
                      Flagship Project
                    </span>
                    <h3 className="font-serif font-black text-2xl text-white tracking-tight m-0 mt-1">
                      SWE.notebook
                    </h3>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-yellow-400/10 text-yellow-300 border border-yellow-400/20">
                  {tracks.length} Tracks · {posts.length} Posts
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-300 leading-relaxed m-0">
                Complete Software Engineering Zero to Hero curriculum. Includes track-wise content management, post inspectors, interactive live slide studio, prompt copiers, and slide override editors.
              </p>

              {/* Quick Curriculum Tracks Pills */}
              <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
                  SWE.notebook Curriculum Tracks ({tracks.length}):
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {tracks.slice(0, 6).map((t, idx) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-white/5 text-slate-300 border border-white/10"
                    >
                      T{String(idx + 1).padStart(2, '0')} {t.replace(/^Track \d+ — /, '').slice(0, 18)}
                    </span>
                  ))}
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-400/20 font-bold">
                    +14 More Tracks
                  </span>
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10 gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Link
                  to="/swe-notebook/carousel-design"
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold border border-white/10 no-underline transition-colors flex items-center gap-1.5"
                >
                  <Palette className="w-3.5 h-3.5 text-yellow-400" /> Carousel Design
                </Link>
              </div>

              <button
                type="button"
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                onClick={() => navigate('/swe-notebook/content')}
              >
                Open Content Manager <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* 🌟 2. CUSTOM PROJECTS (if any) */}
          {customProjects.map((proj) => (
            <div
              key={proj.id}
              className="group relative rounded-3xl bg-[#141721] border border-white/10 hover:border-white/20 p-6 md:p-7 shadow-xl transition-all duration-200 flex flex-col justify-between gap-6"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 flex items-center justify-center font-bold font-serif text-lg">
                      {proj.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white/5 text-slate-400 border border-white/10">
                        {proj.category}
                      </span>
                      <h3 className="font-serif font-bold text-xl text-white tracking-tight m-0 mt-0.5">
                        {proj.name}
                      </h3>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => handleDeleteProject(proj.id, proj.name)}
                    title="Delete Project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed m-0">
                  {proj.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/5 text-xs text-slate-500 font-mono">
                <span>Updated {new Date(proj.updatedAt || proj.createdAt).toLocaleDateString()}</span>

                <button
                  type="button"
                  className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-300 font-bold border border-white/10 transition-colors flex items-center gap-1.5 cursor-pointer"
                  onClick={() => navigate('/design')}
                >
                  Open Studio <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {/* 🌟 3. CREATE PROJECT CARD */}
          <div
            className="rounded-3xl border-2 border-dashed border-white/10 hover:border-cyan-400/40 bg-black/20 hover:bg-cyan-500/5 p-8 flex flex-col items-center justify-center text-center gap-3 transition-colors cursor-pointer min-h-[220px]"
            onClick={() => setShowNewProjectModal(true)}
          >
            <div className="w-12 h-12 rounded-2xl bg-white/5 text-slate-400 flex items-center justify-center">
              <Plus className="w-6 h-6" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-bold text-sm text-white">Create New Project</span>
              <span className="text-xs text-slate-500 max-w-xs">
                Start a custom carousel series with your own tracks and layout templates.
              </span>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
