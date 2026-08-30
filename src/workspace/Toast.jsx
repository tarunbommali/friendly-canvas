export default function Toast({ toast, onClose }) {
  if (!toast) return null

  const isError = toast.type === 'error'

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl backdrop-blur-md border animate-bounce-short transition-all ${
        isError
          ? 'bg-red-950/90 border-red-500/40 text-red-100'
          : 'bg-slate-900/95 border-cyan-400/40 text-slate-100'
      }`}
    >
      <div
        className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0 ${
          isError ? 'bg-red-500/20 text-red-400' : 'bg-cyan-500/20 text-cyan-300'
        }`}
      >
        {isError ? '⚠️' : '✓'}
      </div>
      <div className="flex flex-col gap-0.5 pr-2">
        <div className="font-bold text-xs md:text-sm leading-tight text-white">
          {toast.title || 'Copied to Clipboard!'}
        </div>
        {toast.message && (
          <div className="text-[11px] text-slate-400 font-mono leading-tight">
            {toast.message}
          </div>
        )}
      </div>
      <button
        className="ml-auto text-slate-400 hover:text-white text-xs p-1 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
        onClick={onClose}
        aria-label="Close"
      >
        ✕
      </button>
    </div>
  )
}
