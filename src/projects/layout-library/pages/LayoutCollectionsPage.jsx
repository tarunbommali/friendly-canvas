import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Library,
  Plus,
  Search,
  Trash2,
  ArrowRight,
  Zap,
  Folder,
  X,
  PlusCircle,
} from 'lucide-react'
import { useLayoutCollections } from '../hooks/useLayoutCollections'
import CategoryIcon from '../components/CategoryIcon'

export default function LayoutCollectionsPage() {
  const navigate = useNavigate()
  const { collections, createCollection, deleteCollection } = useLayoutCollections()

  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState('')
  const [newCollectionDesc, setNewCollectionDesc] = useState('')
  const [newCollectionIcon, setNewCollectionIcon] = useState('folder')
  const [toastMsg, setToastMsg] = useState('')

  const showToast = (msg) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 3000)
  }

  const AVAILABLE_ICONS = [
    'target',
    'book-open',
    'workflow',
    'scale',
    'terminal',
    'check-circle',
    'award',
    'calendar',
    'layers',
    'refresh-cw',
    'palette',
    'folder',
  ]

  const filtered = collections.filter((c) => {
    const q = searchQuery.toLowerCase()
    return (
      c.name.toLowerCase().includes(q) ||
      (c.description && c.description.toLowerCase().includes(q)) ||
      (c.badge && c.badge.toLowerCase().includes(q))
    )
  })

  const handleCreate = (e) => {
    e.preventDefault()
    if (!newCollectionName.trim()) return
    const created = createCollection(newCollectionName, newCollectionDesc, newCollectionIcon)
    setNewCollectionName('')
    setNewCollectionDesc('')
    setShowModal(false)
    navigate(`/layout-builder/collection/${created.id}`)
  }

  const totalLayouts = collections.reduce((acc, c) => acc + (c.layouts?.length || 0), 0)

  return (
    <div className="flex flex-col min-h-screen bg-[#0b0d13] text-slate-100 p-6 md:p-8 font-sans select-none">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-cyan-500 text-slate-950 font-bold text-xs rounded-full shadow-2xl animate-fade-in flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 fill-current" /> {toastMsg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold font-serif text-white tracking-tight m-0 flex items-center gap-2.5">
              <Library className="w-7 h-7 text-cyan-400" /> Layout Collections
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-400/30">
              {collections.length} Collections
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 m-0">
            {collections.length} Collections · {totalLayouts} Total Layouts Stored in Database.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            type="button"
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            onClick={() => setShowModal(true)}
          >
            <Plus className="w-4 h-4 stroke-[2.5]" /> New Collection
          </button>
        </div>
      </div>

      {/* Search Filter */}
      <div className="py-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            className="w-full bg-[#141721] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
            placeholder="Search collections by name, badge, or description…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Collections Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
        {filtered.map((collection) => {
          const count = collection.layouts?.length || 0

          return (
            <div
              key={collection.id}
              className="group bg-[#141721] border border-white/10 hover:border-cyan-400/40 rounded-2xl p-5 transition-all duration-200 hover:shadow-xl flex flex-col justify-between cursor-pointer"
              onClick={() => navigate(`/layout-builder/collection/${collection.id}`)}
            >
              <div>
                {/* Top Icon & Badge */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-400/20 text-cyan-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <CategoryIcon name={collection.LayoutCategoryKey} icon={collection.icon} className="w-6 h-6" />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-400/20">
                      {count} {count === 1 ? 'layout' : 'layouts'}
                    </span>

                    <button
                      type="button"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-white/5 transition-colors cursor-pointer text-xs opacity-0 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (confirm(`Delete collection "${collection.name}"?`)) {
                          deleteCollection(collection.id)
                        }
                      }}
                      title="Delete Collection"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Badge if available */}
                {collection.badge && (
                  <div className="mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white/5 text-cyan-400 border border-white/10">
                      {collection.badge}
                    </span>
                  </div>
                )}

                {/* Title & Description */}
                <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors m-0 mb-1">
                  {collection.name}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed m-0 line-clamp-2">
                  {collection.description || 'No description provided.'}
                </p>
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/5 text-[11px] font-mono text-slate-500">
                <span>Updated {new Date(collection.updatedAt || collection.createdAt).toLocaleDateString()}</span>
                <span className="text-cyan-400 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  Open Collection <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center p-12 text-center text-slate-500">
            <Folder className="w-12 h-12 mb-3 text-slate-600" />
            <h3 className="text-base font-bold text-slate-300 m-0">No collections found</h3>
            <p className="text-xs text-slate-500 mt-1">Create your first collection to get started.</p>
            <div className="flex items-center gap-3 mt-4">
              <button
                type="button"
                className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs shadow-md transition-all hover:bg-cyan-400 cursor-pointer flex items-center gap-1.5"
                onClick={() => setShowModal(true)}
              >
                <PlusCircle className="w-4 h-4" /> Create Collection
              </button>
            </div>
          </div>
        )}
      </div>

      {/* New Collection Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-[#141721] border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white m-0">Create New Collection</h3>
              <button
                type="button"
                className="text-slate-400 hover:text-white cursor-pointer"
                onClick={() => setShowModal(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="flex flex-col gap-3">
              {/* Icon Selector */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Collection Icon
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {AVAILABLE_ICONS.map((iconName) => (
                    <button
                      key={iconName}
                      type="button"
                      className={`w-9 h-9 rounded-lg flex items-center justify-center border transition-all cursor-pointer ${
                        newCollectionIcon === iconName
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                      }`}
                      onClick={() => setNewCollectionIcon(iconName)}
                    >
                      <CategoryIcon icon={iconName} className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Collection Name
                </label>
                <input
                  type="text"
                  required
                  className="bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  placeholder="e.g. AI Architecture Diagrams"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  autoFocus
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Description
                </label>
                <textarea
                  className="bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white focus:border-cyan-400 focus:outline-none resize-none"
                  rows={2}
                  placeholder="Brief summary of this layout collection..."
                  value={newCollectionDesc}
                  onChange={(e) => setNewCollectionDesc(e.target.value)}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold cursor-pointer"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newCollectionName.trim()}
                  className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1"
                >
                  Create & Open <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
