import React from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function BreadcrumbNav({ tracks = [], trackPalettes = {}, activeTrack, postsByTrack = {} }) {
  const location = useLocation()
  const pathSegments = location.pathname.split('/').filter(Boolean)

  if (pathSegments.length === 0) {
    return null
  }

  const items = []
  let currentPath = ''

  for (let i = 0; i < pathSegments.length; i++) {
    const segment = pathSegments[i]
    currentPath += `/${segment}`
    let label = segment
    const isLast = i === pathSegments.length - 1

    if (segment === 'track') {
      // Prepend SWE.notebook project scope if on a track route
      if (items.length === 0 || items[0].segment !== 'swe-notebook') {
        items.push({
          path: '/track/1/post/1',
          label: 'SWE.notebook',
          isLast: false,
          segment: 'swe-notebook',
        })
      }

      if (pathSegments[i + 1]) {
        const trackIndex = parseInt(pathSegments[i + 1], 10) - 1
        const track = tracks[trackIndex]
        if (track) {
          label = `Track ${trackIndex + 1}`
        }
      }
    } else if (segment === 'post' && pathSegments[i + 1]) {
      const postIndex = parseInt(pathSegments[i + 1], 10) - 1
      const trackPosts = postsByTrack[activeTrack] || []
      const post = trackPosts[postIndex]
      if (post) {
        label = post.PostTitle
        if (label.length > 28) label = label.slice(0, 28) + '…'
      } else {
        label = `Post ${pathSegments[i + 1]}`
      }
    } else if (segment === 'carousel-design' || segment === 'system-design' || segment === 'design-system') {
      label = 'Carousel Design'
    } else if (segment === 'swe-notebook' || segment === 'swe.notebook') {
      label = 'SWE.notebook'
    } else if (segment === 'search') {
      label = 'Search'
    } else if (segment === 'design') {
      label = 'Create Post'
    } else if (segment === 'layout-builder') {
      label = 'Layout Builder'
    }

    // Skip numeric indices since they're bundled with the parent segment label
    if (i > 0 && (pathSegments[i - 1] === 'track' || pathSegments[i - 1] === 'post')) {
      continue
    }

    items.push({
      path: currentPath,
      label,
      isLast,
      segment,
    })
  }

  if (items.length === 0) return null

  return (
    <nav
      className="flex items-center gap-2 text-xs py-2 px-1 text-slate-500 font-mono mb-4 overflow-x-auto select-none"
      aria-label="Breadcrumb"
    >
      <Link to="/" className="hover:text-cyan-400 text-slate-400 transition-colors shrink-0 no-underline">
        🏠 Home
      </Link>

      {items.map((item) => (
        <div key={item.path} className="flex items-center gap-2 shrink-0">
          <span className="text-slate-600">›</span>
          {item.isLast ? (
            <span className="text-cyan-300 font-bold whitespace-nowrap">
              {item.label}
            </span>
          ) : (
            <Link
              to={item.path}
              className="text-slate-400 hover:text-cyan-400 transition-colors whitespace-nowrap no-underline"
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
}
