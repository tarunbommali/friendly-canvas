import { useRouteError, Link } from 'react-router-dom'
import { LocalStorageRepository } from '../../infrastructure/persistence/localStorageRepository'

export default function ErrorBoundary() {
  const error = useRouteError()

  const errorMessage =
    error?.statusText ||
    error?.message ||
    (typeof error === 'string' ? error : 'An unexpected error occurred.')

  const stack = error?.stack

  return (
    <div className="min-h-screen bg-[#0f1117] text-slate-200 flex items-center justify-center p-6 font-sans select-none">
      <div className="max-w-xl w-full bg-[#1a1e2a] border border-red-500/20 rounded-3xl p-6 md:p-8 flex flex-col gap-6 shadow-2xl relative overflow-hidden">
        {/* Decorative ambient glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-xl shrink-0">
            ⚠️
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-red-400">
              Studio Runtime Error
            </span>
            <h1 className="font-serif font-bold text-2xl text-white m-0">
              Something went wrong
            </h1>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-black/40 border border-white/10 flex flex-col gap-2 font-mono text-xs text-red-200 leading-relaxed overflow-x-auto max-h-48">
          <p className="m-0 font-bold">{errorMessage}</p>
          {stack && (
            <pre className="text-[10px] text-slate-500 m-0 whitespace-pre-wrap font-mono">
              {stack}
            </pre>
          )}
        </div>

        <div className="flex items-center gap-3 flex-wrap pt-2 border-t border-white/10">
          <button
            className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
            onClick={() => window.location.reload()}
          >
            ↺ Reload Studio
          </button>
          <Link
            to="/"
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-semibold no-underline transition-colors cursor-pointer"
          >
            ← Return to Home
          </Link>
          <button
            className="px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-bold transition-all ml-auto cursor-pointer"
            onClick={() => {
              if (confirm('Reset stored browser overrides? This will restore fresh default state.')) {
                LocalStorageRepository.clearAll()
                window.location.href = '/'
              }
            }}
          >
            🗑 Reset Overrides
          </button>
        </div>
      </div>
    </div>
  )
}
