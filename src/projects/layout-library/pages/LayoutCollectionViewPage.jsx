import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Download,
  Upload,
  Plus,
  Copy,
  Trash2,
  Search,
  Zap,
  HelpCircle,
  Palette,
  FileCode,
} from 'lucide-react'
import { useLayoutCollections } from '../hooks/useLayoutCollections'
import CategoryIcon from '../components/CategoryIcon'

export default function LayoutCollectionViewPage() {
  const { collectionId } = useParams()
  const navigate = useNavigate()
  const {
    getCollection,
    deleteLayoutFromCollection,
    duplicateLayoutInCollection,
    exportCollectionJSON,
    importCollectionJSON,
  } = useLayoutCollections()

  const collection = getCollection(collectionId)
  const [searchQuery, setSearchQuery] = useState('')
  const [toastMsg, setToastMsg] = useState('')

  const showToast = (msg) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 3000)
  }

  if (!collection) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 text-slate-400">
        <HelpCircle className="w-12 h-12 mb-3 text-slate-600" />
        <h2 className="text-xl font-bold text-white mb-2">Category Not Found</h2>
        <p className="text-xs text-slate-400 mb-4">The requested layout category does not exist.</p>
        <Link
          to="/layout-builder"
          className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs no-underline flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Categories
        </Link>
      </div>
    )
  }

  const layouts = collection.layouts || []
  const filtered = layouts.filter((l) => {
    const q = searchQuery.toLowerCase()
    return l.name.toLowerCase().includes(q) || (l.description && l.description.toLowerCase().includes(q))
  })

  const handleImportFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result)
        const importedCount = importCollectionJSON(collectionId, parsed)
        if (importedCount > 0) {
          showToast(`Imported ${importedCount} layout(s) successfully!`)
        } else {
          showToast('No valid layouts found in JSON file.')
        }
      } catch (err) {
        console.error('Import error:', err)
        showToast('Invalid JSON file.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleExport = () => {
    exportCollectionJSON(collectionId)
    showToast(`Exported "${collection.name}" as JSON!`)
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#0b0d13] text-slate-100 p-6 md:p-8 font-sans select-none">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-cyan-500 text-slate-950 font-bold text-xs rounded-full shadow-2xl animate-fade-in flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 fill-current" /> {toastMsg}
        </div>
      )}

      {/* Breadcrumb / Back Navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
        <Link to="/layout-builder" className="text-cyan-400 hover:underline flex items-center gap-1 no-underline font-semibold">
          <ArrowLeft className="w-3.5 h-3.5" /> Layout Categories Library
        </Link>
        <span>/</span>
        <span className="text-slate-200 font-bold">{collection.name}</span>
      </div>

      {/* Collection Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-400/20 text-cyan-400 flex items-center justify-center shrink-0">
            <CategoryIcon name={collection.archetypeKey || collection.LayoutCategoryKey} icon={collection.icon} className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-bold font-serif text-white tracking-tight m-0">
                {collection.name}
              </h1>
              {collection.badge && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-white/5 text-cyan-400 border border-white/10">
                  {collection.badge}
                </span>
              )}
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-400/30">
                {layouts.length} {layouts.length === 1 ? 'Layout in DB' : 'Layouts in DB'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 m-0">
              {collection.description || 'Collection of visual layout designs and slots.'}
            </p>
          </div>
        </div>

        {/* Collection Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
            onClick={handleExport}
            title="Download this category as JSON"
          >
            <Download className="w-3.5 h-3.5" /> Export JSON
          </button>

          <label className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer">
            <Upload className="w-3.5 h-3.5" /> Import JSON
            <input
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleImportFile}
            />
          </label>

          <button
            type="button"
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
            onClick={() => navigate(`/layout-builder/collection/${collectionId}/new`)}
          >
            <Plus className="w-4 h-4 stroke-[2.5]" /> New Layout
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
            placeholder="Search layouts in this category…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Layouts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pt-2">
        {filtered.map((layout) => {
          const elCount = layout.elements?.length || 0
          const slotCount = layout.slots ? Object.keys(layout.slots).length : 0

          return (
            <div
              key={layout.id}
              className="group bg-[#141721] border border-white/10 hover:border-cyan-400/40 rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-2xl flex flex-col justify-between cursor-pointer"
              onClick={() => navigate(`/layout-builder/collection/${collectionId}/edit/${layout.id}`)}
            >
              {/* Card Thumbnail / Preview */}
              <div className="aspect-[4/5] bg-[#0b0d13] p-4 flex flex-col items-center justify-center relative overflow-hidden border-b border-white/5 group-hover:scale-[1.01] transition-transform">
                <div
                  className="w-full h-full rounded-xl p-3 flex flex-col justify-between relative shadow-inner overflow-hidden"
                  style={{
                    backgroundColor: layout.config?.background || '#FFFFFF',
                    border: '1px solid rgba(0,0,0,0.08)',
                  }}
                >
                  {/* Top Bar simulation */}
                  <div className="flex items-center justify-between opacity-70">
                    <span className="text-[8px] font-mono font-bold text-blue-700">TRACK 01</span>
                    <div className="w-12 h-[2px] bg-blue-300 rounded" />
                  </div>

                  {/* Center Content simulation */}
                  <div className="flex flex-col items-center justify-center my-auto text-center gap-1.5 px-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-400/20 text-blue-600 flex items-center justify-center">
                      <CategoryIcon name={collection.archetypeKey || collection.LayoutCategoryKey} icon={layout.icon} className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-serif font-bold text-slate-900 line-clamp-2 leading-tight">
                      {layout.name}
                    </span>
                    <span className="text-[8px] font-sans text-slate-500 line-clamp-2 leading-tight">
                      {layout.description || 'Visual layout style'}
                    </span>
                  </div>

                  {/* Bottom Bar simulation */}
                  <div className="flex items-center justify-between text-[7px] font-mono text-slate-400 border-t border-slate-200 pt-1">
                    <span>1 / 7</span>
                    <span className="font-bold text-slate-700">Swipe ➔</span>
                  </div>
                </div>

                {/* Badge Overlay */}
                <div className="absolute top-2 right-2 flex items-center gap-1">
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-black/60 text-cyan-300 backdrop-blur-xs border border-white/10">
                    {elCount} elements
                  </span>
                </div>
              </div>

              {/* Card Footer Info & Quick Actions */}
              <div className="p-4 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white truncate m-0 group-hover:text-cyan-300 transition-colors">
                      {layout.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 truncate m-0 mt-0.5">
                      {layout.description || 'No description'}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer text-xs"
                      onClick={() => {
                        const duplicated = duplicateLayoutInCollection(collectionId, layout.id)
                        if (duplicated) showToast(`Duplicated "${layout.name}"!`)
                      }}
                      title="Duplicate Layout"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-300 transition-colors cursor-pointer text-xs"
                      onClick={() => {
                        if (confirm(`Delete layout "${layout.name}"?`)) {
                          deleteLayoutFromCollection(collectionId, layout.id)
                          showToast('Layout deleted.')
                        }
                      }}
                      title="Delete Layout"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-2 border-t border-white/5">
                  <span className="px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/5">
                    {slotCount} {slotCount === 1 ? 'slot' : 'slots'}
                  </span>
                  <span className="text-cyan-400 font-bold group-hover:underline flex items-center gap-1">
                    Edit Layout <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center p-12 text-center text-slate-500">
            <Palette className="w-12 h-12 mb-3 text-slate-600" />
            <h3 className="text-base font-bold text-slate-300 m-0">No layouts in this category</h3>
            <p className="text-xs text-slate-500 mt-1">Add a new layout or import layouts via JSON.</p>
            <button
              type="button"
              className="mt-4 px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs shadow-md transition-all hover:bg-cyan-400 cursor-pointer flex items-center gap-1.5"
              onClick={() => navigate(`/layout-builder/collection/${collectionId}/new`)}
            >
              <Plus className="w-4 h-4" /> Create New Layout
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
