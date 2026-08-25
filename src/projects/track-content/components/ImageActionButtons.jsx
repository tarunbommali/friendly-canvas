import React from 'react'

export function ImageActionButtons({
  onDownload,
  onCopy,
  isDownloading,
  isCopying,
  status,
}) {
  return (
    <div className="flex items-center gap-1.5 font-sans">
      <ActionButton
        onClick={onDownload}
        disabled={isDownloading}
        label={isDownloading ? 'Generating PNG…' : 'Download this slide as PNG'}
        icon={
          isDownloading ? (
            <span className="w-3.5 h-3.5 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
          ) : (
            <DownloadIcon />
          )
        }
      />
      <ActionButton
        onClick={onCopy}
        disabled={isCopying}
        label={
          status === 'success'
            ? 'Copied!'
            : isCopying
            ? 'Copying…'
            : 'Copy slide image to clipboard'
        }
        icon={
          isCopying ? (
            <span className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          ) : status === 'success' ? (
            <span className="text-xs font-bold text-green-300">✓</span>
          ) : (
            <CopyIcon />
          )
        }
        variant={status === 'success' ? 'success' : 'default'}
      />
    </div>
  )
}

function ActionButton({ onClick, disabled, label, icon, variant = 'default' }) {
  const variants = {
    default: 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-white',
    success: 'bg-green-500/20 border-green-400/40 text-green-300',
  }

  return (
    <button
      className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer ${variants[variant]}`}
      onClick={onClick}
      disabled={disabled}
      title={label}
    >
      {icon}
    </button>
  )
}

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

export default ImageActionButtons
