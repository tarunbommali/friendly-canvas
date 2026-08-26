import React, { useState, useMemo, useEffect, useRef } from 'react'
import {
  Image as ImageIcon,
  Check,
  Copy,
  Trash2,
  Plus,
  X,
  Upload,
  Link2,
} from 'lucide-react'
import { getAssetsForSlide } from '../../../shared/utils/assetResolver'
import { useSlideAssets }  from '../hooks/useSlideAssets'
import { useCustomAssets } from '../../../shared/hooks/useCustomAssets'

const CATEGORY_LABELS = {
  historical_figures: 'Historical Figure',
  tech_pioneers:      'Tech Pioneer',
  modern_engineers:   'AI Pioneer',
  hardware:           'Hardware',
  vintage_computers:  'Vintage Computer',
  logos_languages:    'Language',
  logos_frameworks:   'Framework',
  logos_databases:    'Database',
  logos_cloud:        'Cloud',
  logos_devops:       'DevOps',
  logos_os:           'OS',
  logos_vcs:          'VCS',
  logos_ai_ml:        'AI / ML',
  memes:              'Meme',
  custom_upload:      'Uploaded',
  custom_link:        'Linked',
}

// ── Copy actual image binary to clipboard ─────────────────────────────────
async function copyImageToClipboard(url) {
  if (url.startsWith('data:')) {
    const res  = await fetch(url)
    const blob = await res.blob()
    if (blob.type === 'image/png') {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      return
    }
    await canvasCopy(url)
    return
  }
  await canvasCopy(url)
}

async function canvasCopy(src) {
  const img = new Image()
  img.crossOrigin = 'anonymous'
  await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = src })
  const canvas = document.createElement('canvas')
  canvas.width  = img.naturalWidth  || 512
  canvas.height = img.naturalHeight || 512
  canvas.getContext('2d').drawImage(img, 0, 0)
  await new Promise((resolve, reject) => {
    canvas.toBlob(async (blob) => {
      try {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
        resolve()
      } catch (e) { reject(e) }
    }, 'image/png')
  })
}

// ── LinkInput sub-component ───────────────────────────────────────────────
function LinkInput({ onAdd, onClose }) {
  const [url,   setUrl]   = useState('')
  const [label, setLabel] = useState('')
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = url.trim()
    if (!trimmed) { setError('Paste an image URL'); return }
    try { new URL(trimmed) } catch { setError('Invalid URL'); return }
    onAdd(trimmed, label.trim() || undefined)
    onClose()
  }

  return (
    <form className="flex flex-col gap-2 p-3 bg-white/5 border border-white/10 rounded-xl animate-fade-in" onSubmit={handleSubmit}>
      <input
        ref={inputRef}
        className="w-full font-mono text-xs p-2 bg-black/40 border border-white/10 rounded-lg text-slate-200 focus:border-purple-400 focus:outline-none"
        type="url"
        placeholder="https://example.com/image.jpg"
        value={url}
        onChange={(e) => { setUrl(e.target.value); setError('') }}
      />
      <input
        className="w-full text-xs p-2 bg-black/40 border border-white/10 rounded-lg text-slate-200 focus:border-purple-400 focus:outline-none"
        type="text"
        placeholder="Label (optional)"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
      />
      {error && <span className="text-[11px] text-red-400 font-mono">{error}</span>}
      <div className="flex justify-end gap-2">
        <button type="submit" className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-400/40 rounded-md text-xs font-bold transition-colors">
          Link Image
        </button>
        <button type="button" className="px-3 py-1 bg-white/5 hover:bg-white/10 text-slate-400 text-xs rounded-md transition-colors" onClick={onClose}>
          Cancel
        </button>
      </div>
    </form>
  )
}

// ── Main AssetGallery ─────────────────────────────────────────────────────
export default function AssetGallery({ post, slide, trackColor }) {
  const [failedImages, setFailedImages] = useState(new Set())
  const [lightbox,     setLightbox]     = useState(null)
  const [copyStatus,   setCopyStatus]   = useState({})
  const [showJson,     setShowJson]     = useState(false)
  const [jsonScope,    setJsonScope]    = useState('slide')
  const [showLink,     setShowLink]     = useState(false)
  const [uploading,    setUploading]    = useState(false)
  const uploadRef = useRef(null)

  const primary   = trackColor?.primary || '#1E5FA8'
  const trackName = post?.Track   || ''
  const postNo    = String(post?.PostNo || '')
  const slideNo   = String(slide?.SlideNo || '')

  const { assigned, assign, unassign, exportJson, exportSlideJson } =
    useSlideAssets(trackName, postNo, slideNo)

  const { assets: customAssets, addUpload, addLink, remove: removeCustom } =
    useCustomAssets()

  const matched = useMemo(
    () => getAssetsForSlide(slide, trackName, 8),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [slide?.SlideNo, slide?.SlideTitle, slide?.Content, trackName]
  )

  useEffect(() => {
    setFailedImages(new Set())
    setCopyStatus({})
    setShowJson(false)
  }, [slide?.SlideNo])

  const handleImageError = (url) =>
    setFailedImages((prev) => new Set([...prev, url]))

  const isAssigned = (url) => assigned.some((a) => a.url === url)

  const handleCopyImage = async (asset) => {
    setCopyStatus((p) => ({ ...p, [asset.url]: 'copying' }))
    try {
      await copyImageToClipboard(asset.url)
      setCopyStatus((p) => ({ ...p, [asset.url]: 'success' }))
      setTimeout(() => setCopyStatus((p) => ({ ...p, [asset.url]: null })), 2500)
    } catch {
      window.open(asset.url, '_blank')
      setCopyStatus((p) => ({ ...p, [asset.url]: 'error' }))
      setTimeout(() => setCopyStatus((p) => ({ ...p, [asset.url]: null })), 3000)
    }
  }

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading(true)
    try {
      for (const file of files) {
        await addUpload(file)
      }
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleExportJson = () => {
    const json = jsonScope === 'slide' ? exportSlideJson() : exportJson()
    navigator.clipboard?.writeText(json).catch(() => {})
  }

  const assignCustom = (ca) => {
    assign({
      cat:      ca.type === 'upload' ? 'custom_upload' : 'custom_link',
      file:     ca.id,
      label:    ca.label,
      url:      ca.url,
      isVector: false,
    })
  }

  const AssetRow = ({ asset, onDelete }) => {
    const isFailed = failedImages.has(asset.url)
    const status   = copyStatus[asset.url]
    const pinned   = isAssigned(asset.url)
    const catLabel = CATEGORY_LABELS[asset.cat] || asset.cat

    return (
      <div className={`flex items-center gap-3 p-2 rounded-xl border transition-all ${
        pinned
          ? 'bg-cyan-500/10 border-cyan-400/30'
          : 'bg-white/3 hover:bg-white/6 border-white/5'
      }`}>
        {/* Thumbnail */}
        <div
          className={`w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-white/5 border border-white/10 flex items-center justify-center cursor-zoom-in ${
            asset.isVector ? 'p-1 bg-white/10' : ''
          }`}
          onClick={() => !isFailed && setLightbox(asset)}
          title="Preview"
        >
          {isFailed ? (
            <ImageIcon className="w-4 h-4 text-slate-500" />
          ) : (
            <img
              src={asset.url}
              alt={asset.label}
              className={`w-full h-full object-cover ${asset.isVector ? 'object-contain' : ''}`}
              loading="lazy"
              onError={() => handleImageError(asset.url)}
            />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col">
          <span className="text-xs font-semibold text-slate-200 truncate">{asset.label}</span>
          <span className="text-[10px] text-slate-500 truncate font-mono">{catLabel}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {asset.score >= 8 && (
            <span className="text-yellow-400 text-xs" title={`Relevance: ${asset.score}`}>✦</span>
          )}

          {pinned ? (
            <button
              className="w-7 h-7 rounded-md bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 flex items-center justify-center text-xs transition-colors cursor-pointer"
              onClick={() => unassign(asset.url)}
              title="Remove from slide"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              className="w-7 h-7 rounded-md bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/30 text-cyan-300 flex items-center justify-center text-xs transition-colors font-bold cursor-pointer"
              onClick={() => assign(asset)}
              title="Assign to this slide"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            className={`w-7 h-7 rounded-md border flex items-center justify-center text-xs transition-colors cursor-pointer ${
              status === 'success'
                ? 'bg-green-500/20 border-green-400/40 text-green-300'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-400 hover:text-white'
            }`}
            onClick={() => handleCopyImage(asset)}
            title="Copy image binary"
          >
            {status === 'success' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {onDelete && (
            <button
              className="w-7 h-7 rounded-md bg-white/5 hover:bg-red-500/20 text-slate-500 hover:text-red-400 text-xs flex items-center justify-center transition-colors cursor-pointer"
              onClick={() => onDelete(asset.id)}
              title="Delete custom asset"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 pt-3 border-t border-white/10 text-xs select-none">
      {/* Header Toolbar */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold uppercase tracking-wider text-slate-400 text-[11px]">
            Reference Assets
          </span>
          <span className="px-2 py-0.5 rounded-full bg-white/10 font-mono text-[10px] text-slate-300 font-bold">
            {assigned.length + matched.length}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <input
            ref={uploadRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            className="px-2.5 py-1 rounded bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 font-bold text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
            onClick={() => uploadRef.current?.click()}
            disabled={uploading}
          >
            <Upload className="w-3 h-3" />
            {uploading ? 'Uploading…' : 'Upload'}
          </button>

          <button
            className="px-2.5 py-1 rounded bg-purple-500/10 hover:bg-purple-500/20 border border-purple-400/30 text-purple-300 font-bold text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
            onClick={() => setShowLink((p) => !p)}
          >
            <Link2 className="w-3 h-3" /> Link
          </button>

          <button
            className={`px-2 py-1 rounded border font-mono text-[11px] transition-colors cursor-pointer ${
              showJson
                ? 'bg-white/15 border-white/30 text-white'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-400'
            }`}
            onClick={() => setShowJson((p) => !p)}
          >
            JSON
          </button>
        </div>
      </div>

      {showLink && <LinkInput onAdd={addLink} onClose={() => setShowLink(false)} />}

      {/* JSON Panel */}
      {showJson && (
        <div className="p-3 bg-[#0d1117] border border-white/10 rounded-xl flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex gap-1 font-mono text-[11px]">
              <button
                className={`px-2 py-0.5 rounded ${jsonScope === 'slide' ? 'bg-white/15 text-white font-bold' : 'text-slate-500'}`}
                onClick={() => setJsonScope('slide')}
              >
                Slide ({assigned.length})
              </button>
              <button
                className={`px-2 py-0.5 rounded ${jsonScope === 'all' ? 'bg-white/15 text-white font-bold' : 'text-slate-500'}`}
                onClick={() => setJsonScope('all')}
              >
                All Workspace
              </button>
            </div>
            <button
              className="px-2.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold text-[11px]"
              onClick={handleExportJson}
            >
              Copy JSON
            </button>
          </div>
          <pre className="font-mono text-[11px] text-cyan-300 max-h-48 overflow-y-auto leading-relaxed m-0">
            {jsonScope === 'slide' ? exportSlideJson() : exportJson()}
          </pre>
        </div>
      )}

      {/* Assigned Assets */}
      {assigned.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-cyan-400">
            📌 Assigned to Slide ({assigned.length})
          </span>
          <div className="flex flex-col gap-1.5">
            {assigned.map((a) => (
              <AssetRow key={a.url} asset={a} />
            ))}
          </div>
        </div>
      )}

      {/* Matched taxonomy assets */}
      <div className="flex flex-col gap-1.5">
        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
          🔍 Matched Reference Assets ({matched.length})
        </span>
        <div className="flex flex-col gap-1.5 max-h-60 overflow-y-auto pr-1">
          {matched.map((a) => (
            <AssetRow key={a.url} asset={a} />
          ))}
        </div>
      </div>

      {/* Custom uploads */}
      {customAssets.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-purple-400">
            📤 Custom Uploaded ({customAssets.length})
          </span>
          <div className="flex flex-col gap-1.5">
            {customAssets.map((ca) => (
              <AssetRow
                key={ca.id}
                asset={{ ...ca, isVector: false }}
                onDelete={removeCustom}
              />
            ))}
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative max-w-lg w-full bg-[#1a1e2a] border border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-md bg-black/50 text-sm z-10"
              onClick={() => setLightbox(null)}
            >
              ✕
            </button>
            <div className="p-4 flex items-center justify-center max-h-[60vh] overflow-hidden bg-black/40">
              <img
                src={lightbox.url}
                alt={lightbox.label}
                className="max-w-full max-h-[50vh] object-contain"
              />
            </div>
            <div className="p-4 flex items-center justify-between border-t border-white/10 text-xs">
              <span className="font-semibold text-slate-200">{lightbox.label}</span>
              <button
                className="px-3 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold"
                onClick={() => handleCopyImage(lightbox)}
              >
                Copy Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
