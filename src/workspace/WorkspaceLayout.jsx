import React, { useState, useEffect, useMemo } from 'react'
import { Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import Navbar from './Navbar'
import BreadcrumbNav from './BreadcrumbNav'
import Toast from './Toast'
import TrackSidebar from '../projects/track-content/components/TrackSidebar'
import { useTrackData } from '../projects/track-content/hooks/useTrackData'

export default function WorkspaceLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [searchTerm, setSearchTerm] = useState(() => {
    if (location.pathname === '/search') {
      return new URLSearchParams(location.search).get('q') || ''
    }
    return ''
  })
  const [toast, setToast] = useState(null)

  // Sync navbar search term with URL search params on direct navigation
  useEffect(() => {
    if (location.pathname === '/search') {
      const q = searchParams.get('q') || ''
      setSearchTerm(q)
    } else if (searchTerm && !location.pathname.startsWith('/search')) {
      setSearchTerm('')
    }
  }, [location.pathname, location.search, searchParams])

  const isBuilderPage =
    location.pathname.startsWith('/builder') ||
    location.pathname.startsWith('/layout-builder') ||
    location.pathname.startsWith('/design')

  const {
    designSystem,
    visualGlossary,
    chapterCovers,
    tracks,
    trackPalettes,
    posts,
    postsByTrack,
  } = useTrackData()

  // Sidebar is shown on standard track and project-level carousel-design routes
  const shouldShowSidebar = useMemo(() => {
    if (location.pathname.endsWith('/edit') || location.pathname.includes('/content')) {
      return false
    }
    return (
      location.pathname.startsWith('/track') ||
      location.pathname.includes('carousel-design') ||
      location.pathname === '/system-design' ||
      location.pathname === '/design-system'
    )
  }, [location.pathname])

  // Strictly scope route matching to /track/:trackId/post/:postId
  const getTrackIdFromUrl = () => {
    const match = location.pathname.match(/^\/track\/(\d+)/)
    return match ? parseInt(match[1], 10) : 1
  }

  const getPostIdFromUrl = () => {
    const match = location.pathname.match(/^\/track\/\d+\/post\/(\d+)/)
    return match ? parseInt(match[1], 10) : null
  }

  const currentTrackId = getTrackIdFromUrl()
  const currentPostId = getPostIdFromUrl()
  const activeTrack = tracks[currentTrackId - 1] || tracks[0]
  const currentTrackPosts = postsByTrack[activeTrack] || []
  const activePost = currentPostId ? currentTrackPosts[currentPostId - 1] : currentTrackPosts[0]

  const handleSearch = (term) => {
    setSearchTerm(term)
    if (term.trim()) {
      navigate(`/search?q=${encodeURIComponent(term)}`)
    } else {
      navigate('/')
    }
  }

  const handleSelectTrack = (trackName) => {
    const tIdx = tracks.indexOf(trackName) + 1
    navigate(`/track/${tIdx}/post/1`)
  }

  const handleSelectPost = (post, trackName) => {
    const tIdx = tracks.indexOf(trackName) + 1
    const pIdx =
      postsByTrack[trackName]?.findIndex(
        (p) => p.PostNo === post.PostNo || p.PostTitle === post.PostTitle
      ) + 1
    navigate(`/track/${tIdx}/post/${pIdx > 0 ? pIdx : 1}`)
  }

  const handleCopy = (text, title, message) => {
    if (typeof text === 'string' && text.trim().length > 0) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(
          () => {
            setToast({ title: title || 'Copied!', message, type: 'success' })
            setTimeout(() => setToast(null), 3500)
          },
          () => {
            fallbackCopy(text, title, message)
          }
        )
      } else {
        fallbackCopy(text, title, message)
      }
    } else {
      // Notification-only toast (preserves existing clipboard content)
      setToast({ title: title || 'Success', message, type: 'success' })
      setTimeout(() => setToast(null), 3500)
    }
  }

  const fallbackCopy = (text, title, message) => {
    const textarea = document.createElement('textarea')
    textarea.value = text
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    setToast({ title: title || 'Copied!', message, type: 'success' })
    setTimeout(() => setToast(null), 3500)
  }

  // Precise route matching for full-screen immersive studio & layout canvas editors
  const isCreatePostPage =
    location.pathname.includes('/design') ||
    location.pathname === '/post-builder' ||
    location.pathname.endsWith('/edit')
  const isCanvasEditorPage = Boolean(
    location.pathname.match(/^\/layout-builder\/collection\/[^/]+\/(new|edit\/[^/]+)$/)
  )
  const isContentManagementPage = location.pathname.includes('/content')
  const hideNavbar = isCreatePostPage || isCanvasEditorPage

  return (
    <div className="min-h-screen flex flex-col bg-[#0f1117] text-slate-100 font-sans">
      {!hideNavbar && (
        <Navbar
          searchTerm={searchTerm}
          setSearchTerm={handleSearch}
          currentPath={location.pathname}
        />
      )}

      <div className="flex flex-1 relative">
        {shouldShowSidebar && (
          <TrackSidebar
            tracks={tracks}
            trackPalettes={trackPalettes}
            activeTrack={activeTrack}
            activePost={activePost}
            onSelectTrack={handleSelectTrack}
            onSelectPost={handleSelectPost}
            postsByTrack={postsByTrack}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
        )}

        <main
          className={`flex-1 min-w-0 w-full ${isBuilderPage || isCreatePostPage || isCanvasEditorPage || isContentManagementPage
            ? 'p-0 max-w-none'
            : shouldShowSidebar
              ? 'p-4 md:p-8 max-w-7xl mx-auto'
              : 'p-4 md:p-8 max-w-6xl mx-auto'
            }`}
        >
          {!isBuilderPage && !isContentManagementPage && !isCreatePostPage && (
            <BreadcrumbNav
              tracks={tracks}
              trackPalettes={trackPalettes}
              activeTrack={activeTrack}
              postsByTrack={postsByTrack}
            />
          )}

          <Outlet
            context={{
              activeTrack,
              currentTrackIndex: currentTrackId,
              currentTrackPosts,
              trackPalettes,
              posts,
              postsByTrack,
              tracks,
              chapterCovers,
              designSystem,
              visualGlossary,
              onCopy: handleCopy,
              onSelectTrack: handleSelectTrack,
              onSelectPost: handleSelectPost,
            }}
          />
        </main>
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  )
}
