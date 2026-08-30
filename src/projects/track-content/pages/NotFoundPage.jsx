import { useNavigate } from 'react-router-dom'
import CarouselLogoBadge from '../../../workspace/CarouselLogoBadge'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="p-10 md:p-14 rounded-3xl bg-[#1a1e2a] border border-white/10 flex flex-col items-center text-center gap-4 max-w-lg shadow-2xl">
        <CarouselLogoBadge size={48} />
        <h1 className="font-mono font-black text-6xl text-yellow-400 leading-none m-0">
          404
        </h1>
        <h2 className="font-serif font-bold text-2xl text-white m-0">Page Not Found</h2>
        <p className="text-xs md:text-sm text-slate-400 max-w-sm m-0">
          The track or post you're looking for doesn't exist in the SWE Notebook series.
        </p>
        <div className="flex items-center gap-3 pt-3">
          <button
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-colors"
            onClick={() => navigate('/')}
          >
            🏠 Go to Overview
          </button>
          <button
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-semibold text-xs transition-colors"
            onClick={() => navigate('/track/1')}
          >
            📚 Go to Track 1
          </button>
        </div>
      </div>
    </div>
  )
}
