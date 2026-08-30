import { useState, useEffect, useMemo } from 'react'
import { Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import Navbar from './Navbar'
import BreadcrumbNav from './BreadcrumbNav'
import Toast from './Toast'
import TrackSidebar from '../projects/track-content/components/TrackSidebar'
import { useTrackData } from '../projects/track-content/hooks/useTrackData'
import { useClipboard } from '../shared/hooks/useClipboard'
import { routes } from '../shared/config/routes'

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
  const { copyText, status: clipboardStatus, resetStatus } = useClipboard()

  // Sync navbar search term with URL search params on direct navigation
  useEffect(() => {
    if (location.pathname === '/search') {
      const q = searchParams.get('q') || ''
      setSearchTerm((prev) => (prev !== q ? q : prev))
    } else {
      setSearchTerm((prev) => (prev ? '' : prev))
    }
  }, [location.pathname, searchParams])

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
      navigate(routes.search(term), { replace: location.pathname === '/search' })
    } else {
      navigate(routes.home())
    }
  }

  const handleSelectTrack = (trackName) => {
    const tIdx = tracks.indexOf(trackName) + 1
    navigate(routes.collectionPost(tIdx, 1))
  }

  const handleSelectPost = (post, trackName) => {
    const tIdx = tracks.indexOf(trackName) + 1
    const pIdx =
      postsByTrack[trackName]?.findIndex(
        (p) => p.id === post.id || p.postNo === post.postNo || p.PostNo === post.PostNo
      ) + 1
    navigate(routes.collectionPost(tIdx, pIdx > 0 ? pIdx : 1))
  }

  const handleCopy = (text, title, message) => {
    copyText(text, title || 'Copied!', message || '')
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
  const isImmersiveStudio = isBuilderPage || isCreatePostPage || isCanvasEditorPage
  const hideNavbar = isImmersiveStudio

  return (
    <div
      className="h-screen flex flex-col bg-[#0f1117] text-slate-100 font-sans overflow-hidden"
    >
      {!hideNavbar && (
        <Navbar
          searchTerm={searchTerm}
          setSearchTerm={handleSearch}
          currentPath={location.pathname}
        />
      )}

      <div className="flex flex-1 min-h-0 relative overflow-hidden">
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
          className={`flex-1 min-w-0 min-h-0 w-full ${
            isImmersiveStudio
              ? 'h-full overflow-hidden p-0 max-w-none'
              : isContentManagementPage
                ? 'h-full overflow-y-auto p-0 max-w-none'
                : shouldShowSidebar
                  ? 'h-full overflow-y-auto p-4 md:p-8 max-w-7xl mx-auto'
                  : 'h-full overflow-y-auto p-4 md:p-8 max-w-6xl mx-auto'
          }`}
        >
          {!isImmersiveStudio && !isContentManagementPage && (
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

      <Toast toast={clipboardStatus.type ? clipboardStatus : null} onClose={resetStatus} />
    </div>
  )
}
