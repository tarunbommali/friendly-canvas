import React from 'react'
import { Outlet, useOutletContext } from 'react-router-dom'
import PostNavigation from '../components/PostNavigation'

export default function PostLayout() {
  const context = useOutletContext()
  const { currentTrackIndex, activeTrack, postsByTrack } = context
  const currentTrackPosts = postsByTrack[activeTrack] || []

  return (
    <div className="post-layout">
      <PostNavigation
        currentTrackIndex={currentTrackIndex}
        currentTrackPosts={currentTrackPosts}
        activeTrack={activeTrack}
      />
      <Outlet context={{ ...context, currentTrackPosts }} />
    </div>
  )
}
