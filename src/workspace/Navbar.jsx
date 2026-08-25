import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Layout,
  Menu,
  X,
  Search,
  PlusSquare,
} from 'lucide-react'
import CarouselLogoBadge from './CarouselLogoBadge'

export default function Navbar({
  searchTerm = '',
  setSearchTerm,
  currentPath = '',
}) {
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  const activePath = currentPath || location.pathname
  const isCreatePost = activePath.startsWith('/design/new') || activePath === '/post-builder'
  const isBuilder = activePath.startsWith('/layout-builder') || activePath === '/builder'

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between gap-4 px-4 py-2.5 bg-[#0f1117]/90 backdrop-blur-md border-b border-white/10 shadow-xs select-none font-sans">
      {/* Left Brand */}
      <div className="flex items-center gap-3 shrink-0">
        <Link to="/" className="flex items-center gap-2.5 no-underline group">
          <CarouselLogoBadge size={34} />
          <div className="flex flex-col">
            <span className="font-serif font-extrabold text-base md:text-lg text-slate-100 leading-none tracking-tight group-hover:text-cyan-400 transition-colors">
              Carousel
            </span>
            <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider font-semibold leading-tight hidden sm:block">
              Workspace &amp; Studio
            </span>
          </div>
        </Link>
      </div>

      {/* Center Search Bar */}
      <div className="flex-1 max-w-lg mx-auto">
        <div className="relative flex items-center w-full">
          <Search className="w-4 h-4 absolute left-3 text-slate-400 pointer-events-none" />
          <input
            type="text"
            className="w-full bg-[#1a1e2a] hover:bg-[#222736] focus:bg-[#222736] text-slate-200 text-xs md:text-sm pl-9 pr-7 py-1.5 rounded-lg border border-white/10 focus:border-cyan-400/60 focus:outline-none transition-all placeholder:text-slate-500 font-sans"
            placeholder="Search tracks, topics, slides…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              className="absolute right-2 text-slate-400 hover:text-slate-200 text-xs px-1 rounded transition-colors cursor-pointer"
              onClick={() => setSearchTerm('')}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Right Global Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="hidden md:flex items-center gap-2">
          {/* Create Post Button (Global) */}
          <Link
            to="/design/new"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all no-underline shadow-sm ${isCreatePost
              ? 'bg-cyan-500 text-slate-950 shadow-cyan-500/20'
              : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 hover:border-cyan-400/50'
              }`}
          >
            <PlusSquare className="w-3.5 h-3.5" />
            <span>Create Design</span>
          </Link>

          {/* Layout Collections Button (Global) */}
          <Link
            to="/layout-builder"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all no-underline ${isBuilder
              ? 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/50'
              : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
              }`}
          >
            <Layout className="w-3.5 h-3.5" />
            <span>Layouts</span>
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          className="md:hidden p-2 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle Navigation Menu"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[53px] bg-[#141721] border-b border-white/10 shadow-2xl p-4 flex flex-col gap-3 z-50">
          <Link
            to="/design/new"
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs no-underline"
          >
            <PlusSquare className="w-4 h-4" />
            <span>Create New Carousel Post</span>
          </Link>

          <Link
            to="/layout-builder"
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 text-slate-200 text-xs font-semibold no-underline"
          >
            <Layout className="w-4 h-4 text-yellow-400" />
            <span>Layout Builder Library</span>
          </Link>
        </div>
      )}
    </header>
  )
}
